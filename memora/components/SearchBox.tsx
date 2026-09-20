'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SearchIcon } from './Icons';

gsap.registerPlugin(useGSAP);

interface SearchBoxProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  query,
  onQueryChange,
  onSearch,
  inputRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState('Good evening.');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning.');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good afternoon.');
    } else {
      setGreeting('Good evening.');
    }
  }, []);

  const handleFocus = () => {
    if (inputWrapperRef.current) {
      gsap.to(inputWrapperRef.current, {
        scale: 1.008,
        boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        borderColor: 'var(--color-on-surface, #1a1c1c)',
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  const handleBlur = () => {
    if (inputWrapperRef.current) {
      gsap.to(inputWrapperRef.current, {
        scale: 1,
        boxShadow: 'none',
        borderColor: 'var(--color-outline-variant, #c6c7c0)',
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    onSearch(suggestion);
  };

  return (
    <div ref={containerRef} className="mb-space-md w-full">
      <div className="mb-space-md">
        <p className="font-label-md text-label-md text-secondary">{greeting}</p>
        <h1 className="font-display text-display text-on-surface tracking-tight mt-1">
          What are you looking for?
        </h1>
      </div>

      {/* Prominent, high-contrast Search Input with GSAP focus elevation */}
      <div
        ref={inputWrapperRef}
        className="relative w-full rounded-lg bg-surface-container-lowest border-2 border-outline-variant transition-all duration-200 shadow-xs flex items-center will-change-transform"
      >
        <div className="pl-4 pr-2 text-secondary pointer-events-none flex items-center">
          <SearchIcon className="w-5 h-5 text-secondary" />
        </div>
        <input
          ref={inputRef}
          className="w-full bg-transparent text-on-surface placeholder:text-secondary/70 py-space-md pr-16 font-body-lg text-body-lg focus:outline-none"
          id="search-input"
          placeholder="Search your memories, files, or scanned drives..."
          type="text"
          value={query}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="text-secondary hover:text-on-surface text-xs font-mono px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <span className="border border-outline-variant bg-surface-container-low px-2 py-0.5 rounded text-secondary font-label-sm text-label-sm shadow-2xs select-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Interactive suggestions below input */}
      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 mt-3 text-secondary font-body-sm text-body-sm">
        <span className="text-secondary font-label-sm text-label-sm tracking-wide font-medium">
          SUGGESTIONS:
        </span>
        <button
          onClick={() => handleSuggestionClick('Show my internship offer')}
          className="hover:text-on-surface hover:bg-surface-container-low px-2 py-0.5 rounded transition-all duration-150 text-left cursor-pointer border border-transparent hover:border-outline-variant"
          type="button"
        >
          Show my internship offer
        </button>
        <span className="text-outline-variant">·</span>
        <button
          onClick={() => handleSuggestionClick('What documents are in my vault?')}
          className="hover:text-on-surface hover:bg-surface-container-low px-2 py-0.5 rounded transition-all duration-150 text-left cursor-pointer border border-transparent hover:border-outline-variant"
          type="button"
        >
          What documents are in my vault?
        </button>
        <span className="text-outline-variant">·</span>
        <button
          onClick={() => handleSuggestionClick('Show upcoming dates')}
          className="hover:text-on-surface hover:bg-surface-container-low px-2 py-0.5 rounded transition-all duration-150 text-left cursor-pointer border border-transparent hover:border-outline-variant"
          type="button"
        >
          Show upcoming dates
        </button>
      </div>
    </div>
  );
};
