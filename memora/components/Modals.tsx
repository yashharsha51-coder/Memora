'use client';

import React from 'react';

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
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-xs animate-fadeIn"
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded p-space-lg shadow-sm"
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
          className="text-secondary hover:text-on-surface p-1 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="font-body-md text-body-md text-on-surface space-y-4">
        {children}
      </div>

      <div className="mt-space-lg pt-space-sm border-t border-outline-variant flex justify-end">
        <button
          onClick={onClose}
          className="bg-primary text-surface px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors duration-150 cursor-pointer"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

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
