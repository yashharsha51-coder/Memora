'use client';

import React, { useState } from 'react';

interface FooterProps {
  onOpenVaultModal?: () => void;
  onOpenKeybindingsModal?: () => void;
  onOpenPreferencesModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenVaultModal,
  onOpenKeybindingsModal,
  onOpenPreferencesModal,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memora_archive_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export archive:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <footer className="w-full border-t border-outline-variant px-gutter py-space-lg flex flex-col md:flex-row justify-between items-center bg-surface text-secondary font-body-sm text-body-sm space-y-4 md:space-y-0">
      <div>
        <p className="text-secondary">
          <span className="font-headline-sm text-headline-sm text-on-surface">MEMORA</span>
          {' '}— An intimate personal archive.
        </p>
      </div>
      <div className="flex items-center space-x-6">
        <button
          type="button"
          onClick={onOpenVaultModal}
          className="text-secondary hover:text-on-surface transition-colors duration-150 cursor-pointer"
        >
          Private Vault
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="text-secondary hover:text-on-surface transition-colors duration-150 cursor-pointer"
        >
          {isExporting ? 'Exporting...' : 'Export Archive'}
        </button>
        <button
          type="button"
          onClick={onOpenKeybindingsModal}
          className="text-secondary hover:text-on-surface transition-colors duration-150 cursor-pointer"
        >
          Keybindings
        </button>
        <button
          type="button"
          onClick={onOpenPreferencesModal}
          className="text-secondary hover:text-on-surface transition-colors duration-150 cursor-pointer"
        >
          Preferences
        </button>
      </div>
    </footer>
  );
};
