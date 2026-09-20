'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ImportantDate } from '@/types/memory';
import { ArrowForwardIcon } from './Icons';

gsap.registerPlugin(useGSAP);

interface RememberSoonProps {
  dates: ImportantDate[];
  onDateClick?: (dateItem: ImportantDate) => void;
}

export const RememberSoon: React.FC<RememberSoonProps> = ({
  dates,
  onDateClick,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (dates.length > 0) {
        gsap.from('.date-row-item', {
          y: 12,
          opacity: 0,
          stagger: 0.05,
          duration: 0.45,
          ease: 'power2.out',
        });
      }
    },
    { dependencies: [dates.length], scope: containerRef }
  );

  return (
    <section ref={containerRef} className="mb-space-xl will-change-transform">
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
              className="date-row-item py-space-md flex items-center justify-between hover:bg-surface-container-low px-2 -mx-2 rounded-md transition-colors duration-150 cursor-pointer group will-change-transform"
            >
              <div className="flex items-baseline space-x-6 min-w-0">
                <span className="font-body-md text-body-md font-medium text-on-surface truncate group-hover:translate-x-0.5 transition-transform duration-150">
                  {item.label}
                </span>
                {item.sourceContext && (
                  <span className="font-body-sm text-body-sm text-secondary hidden sm:inline truncate">
                    {item.sourceContext}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <span className="font-label-sm text-label-sm bg-surface-container border border-outline-variant px-2.5 py-0.5 rounded text-on-surface group-hover:border-outline transition-colors">
                  {item.relativeFormatted || 'Upcoming'}
                </span>
                <span className="text-secondary group-hover:translate-x-1 group-hover:text-on-surface transition-all duration-150">
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

