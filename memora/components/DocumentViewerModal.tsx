'use client';

import React from 'react';
import { Memory } from '@/types/memory';

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
            <span className="material-symbols-outlined text-[20px]">close</span>
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
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1">
                Source Document
              </span>
              <div className="flex items-center justify-between bg-surface-container border border-outline-variant rounded px-3 py-2 text-body-sm">
                <span className="text-on-surface font-medium truncate">
                  {memory.source_file.filename}
                </span>
                <span className="text-secondary text-label-sm">
                  {Math.round(memory.source_file.size / 1024)} KB
                </span>
              </div>
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
