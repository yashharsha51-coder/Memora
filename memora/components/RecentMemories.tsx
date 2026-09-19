'use client';

import React from 'react';
import { Memory } from '@/types/memory';
import { MemoryCard } from './MemoryCard';

interface RecentMemoriesProps {
  memories: Memory[];
  onViewSource?: (memory: Memory) => void;
  onTagClick?: (tag: string) => void;
  onSelectMemory?: (memory: Memory) => void;
  onViewAllClick?: () => void;
  totalCount?: number;
}

export const RecentMemories: React.FC<RecentMemoriesProps> = ({
  memories,
  onViewSource,
  onTagClick,
  onSelectMemory,
  onViewAllClick,
  totalCount,
}) => {
  const displayCount = totalCount !== undefined ? totalCount : Math.max(memories.length, 318);

  return (
    <section className="mb-space-xl">
      <div className="flex items-baseline justify-between border-b border-outline-variant pb-space-xs mb-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Recently added</h2>
        <button
          type="button"
          onClick={onViewAllClick}
          className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors duration-150 cursor-pointer"
        >
          View all archive ({displayCount})
        </button>
      </div>

      <div className="divide-y divide-outline-variant">
        {memories.length === 0 ? (
          <div className="py-space-md text-secondary font-body-sm text-body-sm">
            No memories added yet. Upload a document below to begin your archive.
          </div>
        ) : (
          memories.map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onViewSource={onViewSource}
              onTagClick={onTagClick}
              onSelectMemory={onSelectMemory}
            />
          ))
        )}
      </div>
    </section>
  );
};
