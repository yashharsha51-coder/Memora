'use client';

import React, { useRef, useState } from 'react';
import { Memory, UploadStep } from '@/types/memory';
import { FolderOpenIcon } from './Icons';

interface UploadZoneProps {
  onUploadSuccess: (memory: Memory) => void;
  zoneRef?: React.RefObject<HTMLDivElement | null>;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onUploadSuccess,
  zoneRef,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleContainerClick = () => {
    if (step === 'idle' || step === 'saved' || step === 'error') {
      fileInputRef.current?.click();
    }
  };

  const handleFolderClick = async () => {
    // 1. Try modern File System Access API (window.showDirectoryPicker)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
        const collectedFiles: File[] = [];

        async function readDirectory(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.toLowerCase();
              if (
                ext.endsWith('.pdf') ||
                ext.endsWith('.png') ||
                ext.endsWith('.jpg') ||
                ext.endsWith('.jpeg') ||
                ext.endsWith('.webp')
              ) {
                collectedFiles.push(file);
              }
            } else if (entry.kind === 'directory') {
              await readDirectory(entry);
            }
          }
        }

        await readDirectory(dirHandle);

        if (collectedFiles.length > 0) {
          processMultipleFiles(collectedFiles);
        } else {
          setErrorMessage('No supported documents (.pdf, .png, .jpg) found in selected folder.');
          setStep('error');
          setTimeout(() => {
            setStep('idle');
            setErrorMessage(null);
          }, 4000);
        }
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled directory picker
      }
    }

    // 2. Fallback to hidden directory input
    folderInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const droppedFiles: File[] = [];

      // Check for webkitGetAsEntry to support dropping entire folders
      const entryPromises: Promise<void>[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item.webkitGetAsEntry === 'function') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            entryPromises.push(scanEntry(entry, droppedFiles));
          }
        } else {
          const file = item.getAsFile();
          if (file) droppedFiles.push(file);
        }
      }

      await Promise.all(entryPromises);

      if (droppedFiles.length > 0) {
        processMultipleFiles(droppedFiles);
        return;
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processMultipleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const scanEntry = async (entry: any, fileList: File[]): Promise<void> => {
    if (entry.isFile) {
      return new Promise<void>((resolve) => {
        entry.file((file: File) => {
          const ext = file.name.toLowerCase();
          if (
            ext.endsWith('.pdf') ||
            ext.endsWith('.png') ||
            ext.endsWith('.jpg') ||
            ext.endsWith('.jpeg') ||
            ext.endsWith('.webp')
          ) {
            fileList.push(file);
          }
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      return new Promise<void>((resolve) => {
        dirReader.readEntries(async (entries: any[]) => {
          for (const child of entries) {
            await scanEntry(child, fileList);
          }
          resolve();
        });
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processMultipleFiles(Array.from(e.target.files));
    }
  };

  const processMultipleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const ext = file.name.toLowerCase();
      return (
        ext.endsWith('.pdf') ||
        ext.endsWith('.png') ||
        ext.endsWith('.jpg') ||
        ext.endsWith('.jpeg') ||
        ext.endsWith('.webp')
      );
    });

    if (validFiles.length === 0) {
      setErrorMessage('Please provide valid PDF or image documents.');
      setStep('error');
      setTimeout(() => {
        setStep('idle');
        setErrorMessage(null);
      }, 4000);
      return;
    }

    setErrorMessage(null);

    let successCount = 0;
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const prefix = validFiles.length > 1 ? `(${i + 1}/${validFiles.length}) ` : '';

      setStep('uploading');
      setStatusMessage(`${prefix}Syncing ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const stepTimer1 = setTimeout(() => {
          setStep('reading');
          setStatusMessage(`${prefix}Reading document...`);
        }, 500);

        const stepTimer2 = setTimeout(() => {
          setStep('understanding');
          setStatusMessage(`${prefix}Understanding facts...`);
        }, 1200);

        const stepTimer3 = setTimeout(() => {
          setStep('extracting');
          setStatusMessage(`${prefix}Extracting memories...`);
        }, 1900);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to process ${file.name}`);
        }

        const data = await res.json();
        if (data.memory) {
          onUploadSuccess(data.memory);
          successCount++;
        }
      } catch (err: any) {
        console.error('File process error:', err);
      }
    }

    setStep('saved');
    setStatusMessage(
      successCount > 1
        ? `Saved ${successCount} memories to your vault.`
        : 'Saved to your memory.'
    );

    setTimeout(() => {
      setStep('idle');
      setStatusMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }, 4500);
  };

  // Label text matching Stitch flow
  const getStatusContent = () => {
    if (statusMessage && step !== 'idle') {
      return { label: statusMessage, pulse: step !== 'saved' && step !== 'error' };
    }

    switch (step) {
      case 'uploading':
        return { label: 'Uploading...', pulse: true };
      case 'reading':
        return { label: 'Reading document...', pulse: true };
      case 'understanding':
        return { label: 'Understanding...', pulse: true };
      case 'extracting':
        return { label: 'Extracting memories...', pulse: true };
      case 'saved':
        return { label: 'Saved to your memory.', pulse: false };
      case 'error':
        return { label: errorMessage || 'Could not process file.', pulse: false };
      case 'idle':
      default:
        return { label: 'Saved to your memory.', pulse: false };
    }
  };

  const status = getStatusContent();

  return (
    <section className="mb-space-xl" ref={zoneRef}>
      {/* File input (multiple files supported) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Directory input fallback */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <div
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed border-outline-variant rounded p-space-xl bg-surface hover:bg-surface-container-lowest transition-colors duration-200 text-center cursor-pointer ${
          isDragOver ? 'bg-surface-container-lowest border-primary' : ''
        }`}
      >
        <div className="max-w-md mx-auto space-y-2">
          <p className="font-headline-md text-headline-md text-on-surface">
            Drop something you don&apos;t want to forget
          </p>
          <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
            PDF, images, receipts or tickets.{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFolderClick();
              }}
              className="text-on-surface underline underline-offset-2 hover:opacity-80 transition-opacity font-medium inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Or connect folder</span>
              <FolderOpenIcon className="w-3.5 h-3.5" />
            </button>
            {' '}to index your archive.
          </p>
          <div className="pt-3">
            <span className="inline-flex items-center space-x-1.5 font-label-sm text-label-sm text-secondary bg-surface-container border border-outline-variant px-2.5 py-1 rounded">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.pulse ? 'bg-on-surface animate-ping' : 'bg-outline'
                }`}
              ></span>
              <span>{status.label}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
