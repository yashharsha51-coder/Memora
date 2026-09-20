'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { GroundedAnswer } from '@/types/memory';
import { ArrowNorthEastIcon } from './Icons';

gsap.registerPlugin(useGSAP);

interface VerifiedKnowledgeProps {
  answer: GroundedAnswer | null;
  isLoading?: boolean;
  onRelatedClick?: (title: string) => void;
  onSourceClick?: (filename: string) => void;
}

export const VerifiedKnowledge: React.FC<VerifiedKnowledgeProps> = ({
  answer,
  isLoading = false,
  onRelatedClick,
  onSourceClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const beaconRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (answer && cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 20, opacity: 0, scale: 0.985 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
        );

        if (beaconRef.current) {
          gsap.fromTo(
            beaconRef.current,
            { scale: 0.8, opacity: 0.6 },
            { scale: 1.3, opacity: 1, repeat: -1, yoyo: true, duration: 1.2, ease: 'power1.inOut' }
          );
        }
      }
    },
    { dependencies: [answer], scope: cardRef }
  );

  if (isLoading) {
    return (
      <div className="mt-space-lg p-space-lg bg-surface-container-lowest border border-outline-variant rounded relative overflow-hidden">
        {/* Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
              Verifying Knowledge...
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary">Consulting vault</span>
        </div>
        <div className="space-y-3">
          <div className="h-7 bg-surface-container rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-surface-container rounded w-full animate-pulse"></div>
          <div className="h-4 bg-surface-container rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!answer) {
    return null;
  }

  // Render headline with highlighted date if present
  const renderHeadline = () => {
    if (!answer.highlightedDate || !answer.headline.includes(answer.highlightedDate)) {
      return answer.headline;
    }

    const parts = answer.headline.split(answer.highlightedDate);
    return (
      <>
        {parts[0]}
        <span className="underline underline-offset-4 decoration-outline-variant font-medium">
          {answer.highlightedDate}
        </span>
        {parts.slice(1).join(answer.highlightedDate)}
      </>
    );
  };

  return (
    <div
      ref={cardRef}
      className="mt-space-lg p-space-lg bg-surface-container-lowest border border-outline-variant rounded shadow-xs will-change-transform"
    >
      <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
        <div className="flex items-center space-x-2">
          <span ref={beaconRef} className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
            Verified Knowledge
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-secondary font-mono">
          {answer.latencyMs ? `Local lookup ${answer.latencyMs}ms` : 'Local lookup 12ms'}
        </span>
      </div>

      <div className="space-y-3">
        <p className="font-headline-md text-headline-md text-on-surface">
          {renderHeadline()}
        </p>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
          {answer.summary}
        </p>

        {/* Visual preview if source is an image */}
        {answer.source?.filename && /\.(jpe?g|png|webp|gif)$/i.test(answer.source.filename) && (
          <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-2 max-h-72 shadow-inner">
            <img
              src={`/api/files/${encodeURIComponent(answer.source.filename)}?path=${encodeURIComponent(answer.source.absolutePath || '')}`}
              alt={answer.headline}
              className="max-h-64 w-auto object-contain rounded-lg shadow-md"
            />
          </div>
        )}

        {answer.source?.absolutePath && (
          <div className="mt-3 p-3 bg-surface-container-low border border-outline-variant rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-label-sm font-label-sm hover:border-outline transition-colors">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-secondary flex-shrink-0">📍 Disk Location:</span>
              <span className="font-mono text-on-surface truncate" title={answer.source.absolutePath}>
                {answer.source.absolutePath}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/system/open-file', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ filePath: answer.source?.absolutePath, action: 'reveal' }),
                    });
                  } catch {}
                }}
                className="px-2 py-1 bg-surface border border-outline-variant rounded text-secondary hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer font-medium active:scale-95"
                title="Reveal file in Windows File Explorer"
              >
                Reveal in Explorer
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/system/open-file', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ filePath: answer.source?.absolutePath, action: 'open' }),
                    });
                  } catch {}
                }}
                className="px-2 py-1 bg-primary text-surface rounded hover:bg-primary-container transition-all cursor-pointer font-medium active:scale-95"
                title="Open directly in default desktop app"
              >
                Open File ↗
              </button>
            </div>
          </div>
        )}

        {/* Source citation link */}
        {answer.source && (
          <div className="pt-2">
            <button
              onClick={() => onSourceClick?.(answer.source?.filename || '')}
              className="text-secondary hover:text-on-surface flex items-center space-x-1 underline underline-offset-4 decoration-outline-variant font-body-sm text-body-sm cursor-pointer group"
              type="button"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                Source: {answer.source.filename}
              </span>
              <ArrowNorthEastIcon className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
          </div>
        )}

        {/* Related memories */}
        {answer.relatedMemories && answer.relatedMemories.length > 0 && (
          <div className="mt-4 pt-3 border-t border-outline-variant flex flex-wrap items-center gap-2">
            <span className="text-secondary font-label-sm text-label-sm">Related memories:</span>
            {answer.relatedMemories.map((relatedTitle, idx) => (
              <button
                key={idx}
                onClick={() => onRelatedClick?.(relatedTitle)}
                className="text-secondary hover:text-on-surface font-body-sm text-body-sm underline underline-offset-4 decoration-outline-variant cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
                type="button"
              >
                {relatedTitle}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
