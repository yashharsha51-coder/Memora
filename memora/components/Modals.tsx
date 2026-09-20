'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CloseIcon } from './Icons';

gsap.registerPlugin(useGSAP);

interface ModalWrapperProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  title,
  subtitle,
  onClose,
  children,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(backdropRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
    });
    gsap.from(dialogRef.current, {
      scale: 0.95,
      y: 16,
      opacity: 0,
      duration: 0.35,
      ease: 'back.out(1.4)',
    });
  });

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-xs will-change-transform"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded p-space-lg shadow-lg will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
          <div className="flex items-baseline space-x-2">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {title}
            </span>
            {subtitle && (
              <span className="text-secondary font-label-sm text-label-sm">
                {subtitle}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="font-body-md text-body-md text-on-surface space-y-4">
          {children}
        </div>

        <div className="mt-space-lg pt-space-sm border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-surface px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors duration-150 cursor-pointer shadow-xs active:scale-95"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export const VaultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vaultName: string;
  totalMemories: number;
  isSupabaseConnected: boolean;
}> = ({ isOpen, onClose, vaultName, totalMemories, isSupabaseConnected }) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper title="Private Vault" subtitle="Archive Integrity" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-outline-variant">
          <span className="text-secondary font-label-sm uppercase">Active Vault</span>
          <span className="font-medium text-on-surface">{vaultName}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-outline-variant">
          <span className="text-secondary font-label-sm uppercase">Total Stored Memories</span>
          <span className="font-medium text-on-surface">{totalMemories}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-outline-variant">
          <span className="text-secondary font-label-sm uppercase">Data Storage Engine</span>
          <span className="font-medium text-on-surface">
            {isSupabaseConnected ? 'Supabase PostgreSQL & Storage' : 'Active Local Vault (.data/store)'}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-secondary font-label-sm uppercase">Intelligence Layer</span>
          <span className="font-medium text-on-surface">Google Gemini 2.5 Flash</span>
        </div>
        <p className="text-secondary font-body-sm text-body-sm pt-2">
          Documents uploaded to MEMORA are parsed for structured facts, dates, and entities. Search queries retrieve grounded context directly from your private vault.
        </p>
      </div>
    </ModalWrapper>
  );
};

export const KeybindingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', desc: 'Focus memory search input' },
    { key: 'Enter', desc: 'Execute search query' },
    { key: 'Esc', desc: 'Close any active modal or clear search' },
    { key: '+ Add memory', desc: 'Jump to document upload dropzone' },
  ];

  return (
    <ModalWrapper title="Keybindings" subtitle="Keyboard Shortcuts" onClose={onClose}>
      <div className="divide-y divide-outline-variant">
        {shortcuts.map((s) => (
          <div key={s.key} className="flex justify-between items-center py-2.5">
            <span className="text-body-md text-on-surface">{s.desc}</span>
            <kbd className="border border-outline-variant bg-surface-container-low px-2 py-0.5 rounded text-secondary font-label-sm text-label-sm">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export const PreferencesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vaultName: string;
  onVaultNameChange: (name: string) => void;
}> = ({ isOpen, onClose, vaultName, onVaultNameChange }) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper title="Preferences" subtitle="Personal Archive Settings" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1.5">
            Vault Display Name
          </label>
          <input
            type="text"
            value={vaultName}
            onChange={(e) => onVaultNameChange(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded px-3 py-2 font-body-md focus:outline-none focus:border-on-surface"
            placeholder="e.g. Julian's Vault"
          />
        </div>
        <p className="text-secondary font-body-sm text-body-sm">
          MEMORA adapts to your personal terminology. All preferences remain within your active browser session.
        </p>
      </div>
    </ModalWrapper>
  );
};

export const FolderSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: () => void;
}> = ({ isOpen, onClose, onScanComplete }) => {
  const [folders, setFolders] = React.useState<string[]>([]);
  const [newPath, setNewPath] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<{
    message?: string;
    totalDiscovered?: number;
    newlyIndexedCount?: number;
  } | null>(null);
  const filePickerRef = React.useRef<HTMLInputElement>(null);
  const [deviceSyncStatus, setDeviceSyncStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/scan-drive')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.connectedFolders)) {
            setFolders(data.connectedFolders);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddFolder = () => {
    const trimmed = newPath.trim();
    if (trimmed && !folders.includes(trimmed)) {
      setFolders([...folders, trimmed]);
      setNewPath('');
    }
  };

  const handleRemoveFolder = (folderToRemove: string) => {
    setFolders(folders.filter((f) => f !== folderToRemove));
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/scan-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: folders }),
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult({
          totalDiscovered: data.totalDiscovered,
          newlyIndexedCount: data.newlyIndexedCount,
        });
        onScanComplete?.();
      } else {
        setScanResult({ message: data.error || 'Scan encountered an issue.' });
      }
    } catch {
      setScanResult({ message: 'Failed to connect to scan service.' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectDeviceFolder = async () => {
    setDeviceSyncStatus('Selecting folder...');
    // 1. Modern File System Access API
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
        const collectedFiles: File[] = [];

        async function readDir(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.toLowerCase();
              if (ext.endsWith('.pdf') || ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.webp') || ext.endsWith('.docx') || ext.endsWith('.txt')) {
                collectedFiles.push(file);
              }
            } else if (entry.kind === 'directory') {
              const nameLower = entry.name.toLowerCase();
              if (!['node_modules', '.git', '.next', 'appdata', '.gemini'].includes(nameLower)) {
                await readDir(entry);
              }
            }
          }
        }

        await readDir(dirHandle);

        if (collectedFiles.length === 0) {
          setDeviceSyncStatus('No supported documents found in selected folder.');
          setTimeout(() => setDeviceSyncStatus(null), 3500);
          return;
        }

        setDeviceSyncStatus(`Indexing ${collectedFiles.length} documents from selected folder...`);
        let indexedCount = 0;

        for (const file of collectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            if (res.ok) indexedCount++;
          } catch {}
        }

        setDeviceSyncStatus(`✅ Successfully indexed ${indexedCount} documents into your vault!`);
        onScanComplete?.();
        setTimeout(() => setDeviceSyncStatus(null), 5000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setDeviceSyncStatus(null);
          return;
        }
      }
    }

    // 2. Fallback to folder input
    filePickerRef.current?.click();
  };

  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDeviceSyncStatus(`Indexing ${files.length} documents...`);
    let indexed = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.toLowerCase();
      if (ext.endsWith('.pdf') || ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.webp') || ext.endsWith('.docx') || ext.endsWith('.txt')) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (res.ok) indexed++;
        } catch {}
      }
    }
    setDeviceSyncStatus(`✅ Indexed ${indexed} documents into your vault!`);
    onScanComplete?.();
    setTimeout(() => setDeviceSyncStatus(null), 5000);
  };

  return (
    <ModalWrapper title="Folder Selector" subtitle="Add Folders to Memora Vault" onClose={onClose}>
      <div className="space-y-4">
        <input
          ref={filePickerRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFolderInputChange}
        />

        <p className="text-secondary font-body-sm text-body-sm">
          Select folders from your system to index your documents and photos. When you need to find an invoice, ticket, certificate, or image, Memora searches and opens it directly.
        </p>

        {/* Primary Action: Pick a folder from device */}
        <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm font-medium text-on-surface uppercase tracking-wide">
              Select Folder from your System
            </span>
            <span className="text-xs bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-secondary font-mono">
              Cross-Platform
            </span>
          </div>
          <p className="text-secondary font-body-sm text-xs">
            Choose any folder (Documents, Downloads, Projects, etc.). Files remain secure on your machine.
          </p>
          <button
            type="button"
            onClick={handleConnectDeviceFolder}
            className="w-full py-2.5 px-4 bg-on-surface text-surface rounded-lg font-label-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span>📁 Choose Folder to Index</span>
          </button>
          {deviceSyncStatus && (
            <p className="text-xs font-mono text-on-surface pt-1 text-center">{deviceSyncStatus}</p>
          )}
        </div>

        {/* Custom Folder Path input */}
        <div>
          <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1.5">
            Or Add Custom Folder Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
              placeholder="e.g. /home/user/documents or C:\Users\..."
              className="flex-1 bg-surface-container-lowest border border-outline-variant text-on-surface rounded px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-on-surface"
            />
            <button
              type="button"
              onClick={handleAddFolder}
              className="px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-on-surface font-label-sm hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Add Folder
            </button>
          </div>
        </div>

        {/* Configured Folders */}
        {folders.length > 0 && (
          <div>
            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1.5">
              Configured Folders ({folders.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {folders.map((f) => (
                <div
                  key={f}
                  className="flex items-center justify-between p-2 bg-surface-container-low border border-outline-variant rounded font-mono text-xs"
                >
                  <span className="truncate mr-2 text-on-surface" title={f}>
                    📁 {f}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFolder(f)}
                    className="text-secondary hover:text-on-surface text-xs px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {scanResult && (
          <div className="p-2.5 bg-surface-container border border-outline-variant rounded font-body-sm text-xs">
            {scanResult.message ? (
              <p className="text-error">{scanResult.message}</p>
            ) : (
              <p className="text-on-surface">
                ✅ Discovered <strong>{scanResult.totalDiscovered}</strong> files. Indexed <strong>{scanResult.newlyIndexedCount}</strong> new records into vault.
              </p>
            )}
          </div>
        )}

        {folders.length > 0 && (
          <div>
            <button
              type="button"
              disabled={isScanning}
              onClick={handleRunScan}
              className="w-full py-2 px-4 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface rounded font-label-md font-medium disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isScanning ? (
                <span>Indexing Configured Folders...</span>
              ) : (
                <span>Index Configured Folders</span>
              )}
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export const DriveScannerModal = FolderSelectorModal;


