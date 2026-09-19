'use client';

import React, { useRef, useState } from 'react';
import { Memory, UploadStep } from '@/types/memory';

interface UploadZoneProps {
  onUploadSuccess: (memory: Memory) => void;
  zoneRef?: React.RefObject<HTMLDivElement | null>;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onUploadSuccess,
  zoneRef,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleContainerClick = () => {
    if (step === 'idle' || step === 'saved' || step === 'error') {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setStep('uploading');

    try {
      // Step 1: Uploading...
      const formData = new FormData();
      formData.append('file', file);

      // Transition smoothly through calm stages while request processes
      const stepTimer1 = setTimeout(() => setStep('reading'), 600);
      const stepTimer2 = setTimeout(() => setStep('understanding'), 1400);
      const stepTimer3 = setTimeout(() => setStep('extracting'), 2200);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to extract memory from document');
      }

      const data = await res.json();
      setStep('saved');

      if (data.memory) {
        onUploadSuccess(data.memory);
      }

      // Reset to idle after 4 seconds
      setTimeout(() => {
        setStep('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 4000);
    } catch (err: any) {
      setStep('error');
      setErrorMessage(err.message || 'Could not process document.');
      setTimeout(() => {
        setStep('idle');
        setErrorMessage(null);
      }, 4000);
    }
  };

  // Label text matching Stitch flow
  const getStatusContent = () => {
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
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
            PDF, images, receipts or tickets. Extracted privately and organized into your archive.
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
