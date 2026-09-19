'use client';

import React from 'react';

interface HeaderProps {
  currentTab: 'memory' | 'timeline' | 'dont_forget';
  onTabChange: (tab: 'memory' | 'timeline' | 'dont_forget') => void;
  onAddMemoryClick: () => void;
  onSearchFocus: () => void;
  vaultName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onAddMemoryClick,
  onSearchFocus,
  vaultName = "Julian's Vault",
}) => {
  return (
    <header className="w-full border-b border-outline-variant px-gutter py-space-sm flex justify-between items-center bg-surface sticky top-0 z-30">
      {/* Brand anchor & subtitle */}
      <div
        className="flex items-baseline space-x-3 cursor-pointer select-none"
        onClick={() => onTabChange('memory')}
      >
        <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-normal">
          MEMORA
        </span>
        <span className="text-secondary font-label-md text-label-md hidden sm:inline-block">
          Your second memory
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex items-center space-x-6">
        <button
          type="button"
          onClick={() => onTabChange('memory')}
          className={`font-body-md text-body-md pb-1 transition-colors duration-150 ${
            currentTab === 'memory'
              ? 'border-b border-primary text-on-surface'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Memory
        </button>
        <button
          type="button"
          onClick={() => onTabChange('timeline')}
          className={`font-body-md text-body-md pb-1 transition-colors duration-150 ${
            currentTab === 'timeline'
              ? 'border-b border-primary text-on-surface'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Timeline
        </button>
        <button
          type="button"
          onClick={() => onTabChange('dont_forget')}
          className={`font-body-md text-body-md pb-1 transition-colors duration-150 ${
            currentTab === 'dont_forget'
              ? 'border-b border-primary text-on-surface'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Don&apos;t forget
        </button>
      </nav>

      {/* Right-aligned action cluster */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onSearchFocus}
          className="hidden md:inline-flex items-center text-secondary hover:text-on-surface font-label-md text-label-md transition-colors duration-150 cursor-pointer"
          type="button"
        >
          Search ⌘K
        </button>
        <button
          onClick={onAddMemoryClick}
          className="bg-primary text-surface px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors duration-150 cursor-pointer active:scale-98"
          type="button"
        >
          + Add memory
        </button>
        <div className="flex items-center space-x-2 pl-3 border-l border-outline-variant">
          <span className="font-label-sm text-label-sm text-secondary">{vaultName}</span>
          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
        </div>
      </div>
    </header>
  );
};
