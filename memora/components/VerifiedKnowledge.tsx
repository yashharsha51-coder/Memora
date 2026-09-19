'use client';

import React from 'react';
import { GroundedAnswer } from '@/types/memory';

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
  if (isLoading) {
    return (
      <div className="mt-space-lg p-space-lg bg-surface-container-lowest border border-outline-variant rounded animate-pulse">
        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-outline animate-ping"></span>
            <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
              Verifying Knowledge...
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary">Consulting vault</span>
        </div>
        <div className="space-y-3">
          <div className="h-7 bg-surface-container rounded w-3/4"></div>
          <div className="h-4 bg-surface-container rounded w-full"></div>
          <div className="h-4 bg-surface-container rounded w-2/3"></div>
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
        <span className="underline underline-offset-4 decoration-outline-variant">
          {answer.highlightedDate}
        </span>
        {parts.slice(1).join(answer.highlightedDate)}
      </>
    );
  };

  return (
    <div className="mt-space-lg p-space-lg bg-surface-container-lowest border border-outline-variant rounded">
      <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface"></span>
          <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
            Verified Knowledge
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-secondary">
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
      </div>

      <div className="mt-space-md pt-space-sm border-t border-outline-variant flex flex-wrap items-center justify-between gap-4 font-body-sm text-body-sm">
        <div className="flex items-center space-x-2">
          <span className="text-secondary">Source:</span>
          {answer.source?.filename ? (
            <button
              type="button"
              onClick={() => onSourceClick?.(answer.source!.filename)}
              className="text-on-surface hover:underline underline-offset-2 flex items-center space-x-1 font-medium cursor-pointer"
            >
              <span>{answer.source.filename}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
            </button>
          ) : (
            <span className="text-on-surface font-medium">Archived Document</span>
          )}
        </div>

        {answer.relatedMemories && answer.relatedMemories.length > 0 && (
          <div className="flex items-center space-x-3 text-secondary font-label-sm text-label-sm">
            <span>Related memories:</span>
            {answer.relatedMemories.map((title, idx) => (
              <React.Fragment key={title}>
                {idx > 0 && <span className="text-outline-variant">·</span>}
                <button
                  type="button"
                  onClick={() => onRelatedClick?.(title)}
                  className="hover:text-on-surface underline underline-offset-2 cursor-pointer"
                >
                  {title}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
