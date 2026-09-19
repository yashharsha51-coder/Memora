'use client';

import React, { useEffect, useState } from 'react';

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
    <div className="mb-space-md">
      <div className="mb-space-md">
        <p className="font-label-md text-label-md text-secondary">{greeting}</p>
        <h1 className="font-display text-display text-on-surface tracking-tight mt-1">
          What are you looking for?
        </h1>
      </div>

      {/* Search Box with quiet border */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-secondary rounded px-space-lg py-space-md font-body-lg text-body-lg focus:outline-none focus:border-on-surface transition-colors shadow-none"
          id="search-input"
          placeholder="Search your memory..."
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
          <span className="border border-outline-variant bg-surface-container-low px-1.5 py-0.5 rounded text-secondary font-label-sm text-label-sm">
            ⌘K
          </span>
        </div>
      </div>

      {/* Quiet suggestion queries below input */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-2 mt-3 text-secondary font-body-sm text-body-sm">
        <span className="text-secondary font-label-sm text-label-sm tracking-wide">
          SUGGESTIONS:
        </span>
        <button
          onClick={() => handleSuggestionClick('Where is my laptop invoice?')}
          className="hover:text-on-surface transition-colors duration-150 text-left cursor-pointer"
          type="button"
        >
          Where is my laptop invoice?
        </button>
        <span className="text-outline-variant">·</span>
        <button
          onClick={() => handleSuggestionClick('What expires this month?')}
          className="hover:text-on-surface transition-colors duration-150 text-left cursor-pointer"
          type="button"
        >
          What expires this month?
        </button>
        <span className="text-outline-variant">·</span>
        <button
          onClick={() => handleSuggestionClick('Show everything related to my internship.')}
          className="hover:text-on-surface transition-colors duration-150 text-left cursor-pointer"
          type="button"
        >
          Show everything related to my internship.
        </button>
      </div>
    </div>
  );
};
