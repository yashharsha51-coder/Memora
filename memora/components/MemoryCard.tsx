'use client';

import React from 'react';
import { Memory } from '@/types/memory';
import { ArrowNorthEastIcon } from './Icons';

interface MemoryCardProps {
  memory: Memory;
  onViewSource?: (memory: Memory) => void;
  onTagClick?: (tag: string) => void;
  onSelectMemory?: (memory: Memory) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onViewSource,
  onTagClick,
  onSelectMemory,
}) => {
  const isTicket = memory.type.toLowerCase() === 'travel' || memory.title.toLowerCase().includes('flight');
  const sourceLabel = isTicket ? 'Open Ticket' : 'Open Source PDF';

  // Format amount string if present
  const amountStr = memory.amount != null
    ? `${memory.currency === 'INR' ? '₹' : memory.currency === 'USD' ? '$' : ''}${Number(memory.amount).toLocaleString()}`
    : null;

  // Construct details line if summary doesn't already contain amount
  let detailsText = memory.summary || '';
  if (amountStr && !detailsText.includes(amountStr)) {
    detailsText = `${amountStr} · ${detailsText}`;
  }

  return (
    <article
      onClick={() => onSelectMemory?.(memory)}
      className="py-space-lg hover:bg-surface-container-low px-2 -mx-2 transition-colors duration-150 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1">
        <div className="flex items-baseline space-x-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {memory.title}
          </h3>
          <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wide">
            {memory.type}
          </span>
        </div>
        <time className="font-label-sm text-label-sm text-secondary">
          {memory.date || 'Recent'}
        </time>
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant mb-2">
        {detailsText}
      </p>

      <div className="flex items-center space-x-4 font-body-sm text-body-sm">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewSource?.(memory);
          }}
          className="text-secondary hover:text-on-surface flex items-center space-x-1 underline underline-offset-4 decoration-outline-variant cursor-pointer"
        >
          <span>{sourceLabel}</span>
          <ArrowNorthEastIcon className="w-3.5 h-3.5" />
        </button>

        {memory.absolute_path && (
          <>
            <span className="text-outline-variant">·</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                fetch('/api/system/open-file', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filePath: memory.absolute_path, action: 'reveal' }),
                });
              }}
              className="text-secondary font-label-sm text-label-sm font-mono hover:text-on-surface hover:underline truncate max-w-xs cursor-pointer"
              title={`Reveal in Explorer: ${memory.absolute_path}`}
            >
              📍 {memory.absolute_path}
            </span>
          </>
        )}

        {memory.tags && memory.tags.length > 0 && (
          <>
            <span className="text-outline-variant">·</span>
            <span className="text-secondary font-label-sm text-label-sm">
              Tagged:{' '}
              {memory.tags.map((tag, idx) => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                  className="hover:underline cursor-pointer"
                >
                  {tag}
                  {idx < memory.tags!.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </>
        )}
      </div>
    </article>
  );
};
