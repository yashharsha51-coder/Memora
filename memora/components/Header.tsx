'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FolderOpenIcon } from './Icons';

gsap.registerPlugin(useGSAP);

interface HeaderProps {
  currentTab: 'memory' | 'timeline' | 'dont_forget';
  onTabChange: (tab: 'memory' | 'timeline' | 'dont_forget') => void;
  onAddMemoryClick: () => void;
  onSearchFocus: () => void;
  onSelectFolderClick?: () => void;
  vaultName?: string;
  onVaultClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onAddMemoryClick,
  onSearchFocus,
  onSelectFolderClick,
  vaultName = "Julian's Vault",
  onVaultClick,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const tabRefs = {
    memory: useRef<HTMLButtonElement>(null),
    timeline: useRef<HTMLButtonElement>(null),
    dont_forget: useRef<HTMLButtonElement>(null),
  };

  // Header entrance animation
  useGSAP(
    () => {
      gsap.from(headerRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
    { scope: headerRef }
  );

  // Smooth sliding indicator for navigation tabs
  useEffect(() => {
    const activeEl = tabRefs[currentTab]?.current;
    const navEl = navRef.current;
    const indEl = indicatorRef.current;

    if (activeEl && navEl && indEl) {
      const activeRect = activeEl.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      const leftOffset = activeRect.left - navRect.left;

      gsap.to(indEl, {
        x: leftOffset,
        width: activeRect.width,
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out',
      });
    }
  }, [currentTab]);

  return (
    <header
      ref={headerRef}
      className="w-full border-b border-outline-variant px-gutter py-space-sm flex justify-between items-center bg-surface sticky top-0 z-30 will-change-transform"
    >
      {/* Brand anchor & subtitle */}
      <div
        className="flex items-baseline space-x-3 cursor-pointer select-none group"
        onClick={() => onTabChange('memory')}
      >
        <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-normal transition-transform duration-200 group-hover:scale-[1.01]">
          MEMORA
        </span>
        <span className="text-secondary font-label-md text-label-md hidden sm:inline-block">
          Your second memory
        </span>
      </div>

      {/* Navigation links with sliding GSAP indicator */}
      <nav ref={navRef} className="relative flex items-center space-x-6 py-1">
        <button
          ref={tabRefs.memory}
          type="button"
          onClick={() => onTabChange('memory')}
          className={`font-body-md text-body-md pb-1 transition-colors duration-150 cursor-pointer ${
            currentTab === 'memory' ? 'text-on-surface font-medium' : 'text-secondary hover:text-on-surface'
          }`}
        >
          Memory
        </button>
        <button
          ref={tabRefs.timeline}
          type="button"
          onClick={() => onTabChange('timeline')}
          className={`font-body-md text-body-md pb-1 transition-colors duration-150 cursor-pointer ${
            currentTab === 'timeline' ? 'text-on-surface font-medium' : 'text-secondary hover:text-on-surface'
          }`}
        >
          Timeline
        </button>
        <button
          ref={tabRefs.dont_forget}
          type="button"
          onClick={() => onTabChange('dont_forget')}
          className={`font-body-md text-body-md pb-1 transition-colors duration-150 cursor-pointer ${
            currentTab === 'dont_forget' ? 'text-on-surface font-medium' : 'text-secondary hover:text-on-surface'
          }`}
        >
          Don&apos;t forget
        </button>

        {/* GSAP animated underline indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-0 left-0 h-[2px] bg-primary rounded-full pointer-events-none opacity-0 will-change-transform"
          style={{ width: 0 }}
        />
      </nav>

      {/* Right-aligned action cluster */}
      <div className="flex items-center space-x-3">
        {onSelectFolderClick && (
          <button
            onClick={onSelectFolderClick}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant font-label-md text-label-md transition-all duration-150 cursor-pointer group"
            type="button"
            title="Select any folder from your computer to index"
          >
            <FolderOpenIcon className="w-4 h-4 text-secondary group-hover:text-on-surface" />
            <span>Select Folder</span>
          </button>
        )}
        <button
          onClick={onSearchFocus}
          className="hidden md:inline-flex items-center text-secondary hover:text-on-surface font-label-md text-label-md transition-colors duration-150 cursor-pointer"
          type="button"
        >
          Search ⌘K
        </button>
        <button
          ref={addBtnRef}
          onClick={onAddMemoryClick}
          className="bg-primary text-surface px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors duration-150 cursor-pointer shadow-xs active:scale-95 will-change-transform"
          type="button"
        >
          + Add memory
        </button>
        <button
          type="button"
          onClick={onVaultClick}
          className="flex items-center space-x-2 pl-3 border-l border-outline-variant hover:opacity-80 transition-opacity cursor-pointer text-left"
          title="Vault Settings"
        >
          <span className="font-label-sm text-label-sm text-secondary hover:text-on-surface">{vaultName}</span>
          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
        </button>
      </div>
    </header>
  );
};
