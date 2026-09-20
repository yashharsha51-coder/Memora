'use client';

import React from 'react';
import { ImportantDate } from '@/types/memory';
import { ArrowForwardIcon } from './Icons';

interface RememberSoonProps {
  dates: ImportantDate[];
  onDateClick?: (dateItem: ImportantDate) => void;
}

export const RememberSoon: React.FC<RememberSoonProps> = ({
  dates,
  onDateClick,
}) => {
  return (
    <section className="mb-space-xl">
      <div className="flex items-baseline justify-between border-b border-outline-variant pb-space-xs mb-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">To remember soon</h2>
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
          Chronological Horizon
        </span>
      </div>

      <div className="divide-y divide-outline-variant">
        {dates.length === 0 ? (
          <div className="py-space-md text-secondary font-body-sm text-body-sm">
            No upcoming deadlines recorded yet.
          </div>
        ) : (
          dates.map((item) => (
            <div
              key={item.id}
              onClick={() => onDateClick?.(item)}
              className="py-space-md flex items-center justify-between hover:bg-surface-container-low px-2 -mx-2 transition-colors duration-150 cursor-pointer"
            >
              <div className="flex items-baseline space-x-6 min-w-0">
                <span className="font-body-md text-body-md font-medium text-on-surface truncate">
                  {item.label}
                </span>
                {item.sourceContext && (
                  <span className="font-body-sm text-body-sm text-secondary hidden sm:inline truncate">
                    {item.sourceContext}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <span className="font-label-sm text-label-sm bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-on-surface">
                  {item.relativeFormatted || 'Upcoming'}
                </span>
                <span className="text-secondary">
                  <ArrowForwardIcon className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
