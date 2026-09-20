'use client';

import React from 'react';
import { Memory } from '@/types/memory';
import { CloseIcon, ArrowNorthEastIcon, DocumentIcon } from './Icons';

interface DocumentViewerModalProps {
  memory: Memory | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  memory,
  onClose,
}) => {
  if (!memory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded p-space-lg shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
          <div className="flex items-baseline space-x-3">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {memory.title}
            </span>
            <span className="text-secondary font-label-sm text-label-sm uppercase">
              {memory.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 cursor-pointer"
            type="button"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 font-body-md text-body-md text-on-surface">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1">
              Extracted Summary
            </span>
            <p className="text-on-surface-variant leading-relaxed">
              {memory.summary || 'No summary available.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-space-sm border-y border-outline-variant">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1">
                Record Date
              </span>
              <span>{memory.date || 'Undated'}</span>
            </div>
            {memory.amount != null && (
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1">
                  Amount
                </span>
                <span>
                  {memory.currency === 'INR' ? '₹' : memory.currency === 'USD' ? '$' : ''}
                  {Number(memory.amount).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {memory.important_dates && memory.important_dates.length > 0 && (
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1">
                Important Dates
              </span>
              <ul className="space-y-1">
                {memory.important_dates.map((d) => (
                  <li key={d.id || d.label} className="flex justify-between text-body-sm">
                    <span className="text-on-surface">{d.label}</span>
                    <span className="text-secondary">{d.date} ({d.relativeFormatted || 'Upcoming'})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {memory.source_file && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide">
                  Source Document
                </span>
                <a
                  href={`/api/files/${encodeURIComponent(memory.source_file.filename)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-on-surface hover:underline font-label-sm text-label-sm flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open PDF in new tab</span>
                  <ArrowNorthEastIcon className="w-3.5 h-3.5" />
                </a>
              </div>
              <a
                href={`/api/files/${encodeURIComponent(memory.source_file.filename)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded px-3 py-2.5 text-body-sm transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2 truncate">
                  <DocumentIcon className="w-4 h-4 text-secondary group-hover:text-on-surface" />
                  <span className="text-on-surface font-medium truncate group-hover:underline">
                    {memory.source_file.filename}
                  </span>
                </div>
                <span className="text-secondary text-label-sm flex items-center space-x-1.5 flex-shrink-0 ml-3">
                  <span>{Math.round(memory.source_file.size / 1024)} KB</span>
                  <ArrowNorthEastIcon className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          )}
        </div>

        <div className="mt-space-lg pt-space-sm border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-surface px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors duration-150 cursor-pointer"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
