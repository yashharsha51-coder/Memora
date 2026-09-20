'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Memory, ImportantDate } from '@/types/memory';

gsap.registerPlugin(useGSAP);

interface TimelineViewProps {
  memories: Memory[];
  dates: ImportantDate[];
  onSelectMemory?: (memory: Memory) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  memories,
  dates,
  onSelectMemory,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  // Combine memories and dates into a chronological timeline
  const events = [
    ...memories.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      date: m.date || 'Undated',
      summary: m.summary,
      rawDate: new Date(m.date || m.created_at).getTime() || 0,
      isDeadline: false,
      memory: m,
    })),
    ...dates.map((d) => {
      const parentMem = memories.find((m) => m.id === d.memory_id);
      return {
        id: d.id,
        title: d.label,
        type: 'Milestone',
        date: d.date,
        summary: parentMem ? `Associated with ${parentMem.title}` : d.sourceContext,
        rawDate: new Date(d.date).getTime() || 0,
        isDeadline: true,
        memory: parentMem,
      };
    }),
  ].sort((a, b) => b.rawDate - a.rawDate);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.timeline-header', {
        y: -10,
        opacity: 0,
        duration: 0.4,
      }).from(
        '.timeline-event-item',
        {
          x: -15,
          opacity: 0,
          stagger: 0.05,
          duration: 0.5,
        },
        '-=0.2'
      );
    },
    { dependencies: [events.length], scope: containerRef }
  );

  return (
    <section ref={containerRef} className="mb-space-xl will-change-transform">
      <div className="timeline-header flex items-baseline justify-between border-b border-outline-variant pb-space-xs mb-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Timeline</h2>
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
          Chronological Record
        </span>
      </div>

      <div className="relative pl-6 border-l border-outline-variant space-y-8 my-space-lg">
        {events.map((ev) => (
          <div
            key={ev.id}
            onClick={() => ev.memory && onSelectMemory?.(ev.memory)}
            className="timeline-event-item relative group cursor-pointer will-change-transform"
          >
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border border-surface transition-transform duration-200 group-hover:scale-125 ${
                ev.isDeadline ? 'bg-outline-variant ring-4 ring-surface' : 'bg-on-surface'
              }`}
            />

            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1">
              <div className="flex items-baseline space-x-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:underline underline-offset-4 decoration-outline-variant transition-colors">
                  {ev.title}
                </h3>
                <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wide">
                  {ev.type}
                </span>
              </div>
              <time className="font-label-sm text-label-sm text-secondary font-mono">
                {ev.date}
              </time>
            </div>

            {ev.summary && (
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                {ev.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

