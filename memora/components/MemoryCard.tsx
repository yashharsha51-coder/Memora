'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
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
  const cardRef = useRef<HTMLElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  const filename = memory.source_file?.filename || memory.absolute_path || memory.title || '';
  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(filename) || memory.source_file?.mime_type?.startsWith('image/');
  const isTicket = memory.type.toLowerCase() === 'travel' || memory.title.toLowerCase().includes('flight');

  const sourceLabel = isImage ? 'View Photo' : isTicket ? 'Open Ticket' : 'Open Source PDF';
  const typeBadge = isImage ? 'Photo' : memory.type;

  const fileUrl = `/api/files/${encodeURIComponent(memory.source_file?.filename || filename)}?path=${encodeURIComponent(memory.absolute_path || '')}`;

  // Format amount string if present
  const amountStr = memory.amount != null
    ? `${memory.currency === 'INR' ? '₹' : memory.currency === 'USD' ? '$' : ''}${Number(memory.amount).toLocaleString()}`
    : null;

  let detailsText = memory.summary || '';
  if (amountStr && !detailsText.includes(amountStr)) {
    detailsText = `${amountStr} · ${detailsText}`;
  }

  const handleMouseEnter = () => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        x: 2,
        y: -2,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        x: 0,
        y: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  return (
    <article
      ref={cardRef}
      onClick={() => onSelectMemory?.(memory)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="py-space-lg hover:bg-surface-container-low px-3 -mx-3 rounded-lg transition-colors duration-150 cursor-pointer flex gap-4 items-start"
    >
      {/* Real Visual Image Thumbnail */}
      {isImage && (
        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-surface-container border border-outline-variant shadow-2xs">
          <img
            src={fileUrl}
            alt={memory.title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-grow min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
          <div className="flex items-center space-x-3 min-w-0">
            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
              {memory.title}
            </h3>
            <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wide flex-shrink-0">
              {typeBadge}
            </span>
          </div>
          <time className="font-label-sm text-label-sm text-secondary flex-shrink-0">
            {memory.date || 'Recent'}
          </time>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant mb-2">
          {detailsText}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body-sm text-body-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewSource?.(memory);
            }}
            className="text-secondary hover:text-on-surface flex items-center space-x-1 underline underline-offset-4 decoration-outline-variant cursor-pointer group"
          >
            <span>{sourceLabel}</span>
            <span ref={arrowRef} className="inline-block will-change-transform">
              <ArrowNorthEastIcon className="w-3.5 h-3.5" />
            </span>
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
                className="text-secondary font-label-sm text-label-sm font-mono hover:text-on-surface hover:underline truncate max-w-xs cursor-pointer transition-colors"
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
                    className="hover:underline cursor-pointer hover:text-on-surface transition-colors"
                  >
                    {tag}
                    {idx < memory.tags!.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
