'use client';

import React, { useState, useRef } from 'react';
import { ImportantDate, Memory } from '@/types/memory';
import { ArrowForwardIcon, ArrowNorthEastIcon, DocumentIcon } from './Icons';

interface DontForgetViewProps {
  dates: ImportantDate[];
  memories: Memory[];
  onDateClick: (dateItem: ImportantDate) => void;
  onSelectMemory: (memory: Memory) => void;
  onUploadSuccess?: (memory: Memory) => void;
}

export const DontForgetView: React.FC<DontForgetViewProps> = ({
  dates,
  memories,
  onDateClick,
  onSelectMemory,
  onUploadSuccess,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'month'>('all');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle');
  const [statusText, setStatusText] = useState<string | null>(null);
  const [lastAnalyzedMemory, setLastAnalyzedMemory] = useState<Memory | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorize dates
  const now = new Date().getTime();
  const sortedDates = [...dates].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeA - timeB;
  });

  const urgentDates = sortedDates.filter((d) => {
    const diffDays = ((new Date(d.date).getTime() || 0) - now) / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 7;
  });

  const monthDates = sortedDates.filter((d) => {
    const diffDays = ((new Date(d.date).getTime() || 0) - now) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && diffDays <= 30;
  });

  const futureDates = sortedDates.filter((d) => {
    const diffDays = ((new Date(d.date).getTime() || 0) - now) / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  });

  const displayedDates =
    filter === 'urgent'
      ? urgentDates
      : filter === 'month'
      ? [...urgentDates, ...monthDates]
      : sortedDates;

  // File drop & upload handler for tickets / deadlines
  const processUploadedFile = async (file: File) => {
    setUploadStatus('uploading');
    setStatusText(`Uploading ${file.name}...`);
    setLastAnalyzedMemory(null);

    const formData = new FormData();
    formData.append('file', file);

    const analyzingTimer = setTimeout(() => {
      setUploadStatus('analyzing');
      setStatusText('Gemini AI is analyzing ticket, journey dates & milestones...');
    }, 500);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(analyzingTimer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze ticket');
      }

      const data = await res.json();
      if (data.memory) {
        setLastAnalyzedMemory(data.memory);
        setUploadStatus('done');
        setStatusText(`Extracted ${data.memory.title}!`);
        onUploadSuccess?.(data.memory);

        setTimeout(() => {
          setUploadStatus('idle');
          setStatusText(null);
        }, 5000);
      }
    } catch (err: any) {
      clearTimeout(analyzingTimer);
      setUploadStatus('error');
      setStatusText(err.message || 'Could not process document.');
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusText(null);
      }, 4000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-space-lg animate-fadeIn">
      {/* Editorial Header */}
      <div className="border-b border-outline-variant pb-space-md">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <p className="font-label-md text-label-md text-secondary">TIME-SENSITIVE HORIZON</p>
            <h1 className="font-display text-display text-on-surface tracking-tight mt-1">
              Don&apos;t forget.
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs px-2.5 py-1 bg-surface-container border border-outline-variant rounded-md text-on-surface">
              {dates.length} tracked commitments
            </span>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xl">
          All extracted deadlines, renewal dates, expiry notices, and milestones automatically
          synthesized from your uploaded files and archives.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-outline-variant">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-primary text-surface font-medium'
                : 'bg-surface-container text-secondary hover:text-on-surface'
            }`}
          >
            All Milestones ({dates.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors cursor-pointer ${
              filter === 'urgent'
                ? 'bg-primary text-surface font-medium'
                : 'bg-surface-container text-secondary hover:text-on-surface'
            }`}
          >
            Next 7 Days ({urgentDates.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('month')}
            className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors cursor-pointer ${
              filter === 'month'
                ? 'bg-primary text-surface font-medium'
                : 'bg-surface-container text-secondary hover:text-on-surface'
            }`}
          >
            This Month ({urgentDates.length + monthDates.length})
          </button>
        </div>
      </div>

      {/* Dedicated Ticket & Milestone File Dropping System */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-space-lg rounded-xl border border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragOver
            ? 'border-primary bg-surface-container-lowest scale-[1.01] shadow-md'
            : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 text-on-surface text-xl">
          🎫
        </div>

        <h2 className="font-headline-sm text-headline-sm text-on-surface font-medium mb-1">
          Drop a ticket, bill, or booking to track
        </h2>
        <p className="font-body-sm text-body-sm text-secondary max-w-md mb-3">
          Drop flight passes, train tickets, event bookings, warranty receipts, or contracts.
          Memora automatically extracts journey dates, deadlines, seat/PNR info, and tracks milestones.
        </p>

        {/* Live Status indicator */}
        {uploadStatus !== 'idle' ? (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-body-sm text-on-surface font-medium animate-pulse">
            <span
              className={`w-2 h-2 rounded-full ${
                uploadStatus === 'error'
                  ? 'bg-error'
                  : uploadStatus === 'done'
                  ? 'bg-emerald-500'
                  : 'bg-primary'
              }`}
            />
            <span>{statusText}</span>
          </div>
        ) : (
          <span className="inline-flex items-center space-x-1.5 text-xs text-secondary font-mono border border-outline-variant px-2.5 py-1 rounded bg-surface-container-low">
            <span>Click or drag PDF, JPG, PNG here</span>
          </span>
        )}
      </div>

      {/* Recently Analyzed Ticket Spotlight */}
      {lastAnalyzedMemory && (
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <span className="font-label-sm text-xs uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant text-on-surface font-semibold">
              ✨ Just Analyzed · {lastAnalyzedMemory.type}
            </span>
            <button
              type="button"
              onClick={() => setLastAnalyzedMemory(null)}
              className="text-secondary hover:text-on-surface text-xs cursor-pointer p-1"
              title="Dismiss spotlight"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {lastAnalyzedMemory.title}
            </h2>
            <span className="font-mono text-xs text-secondary">
              {lastAnalyzedMemory.date || 'Recent'}
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant">
            {lastAnalyzedMemory.summary}
          </p>

          {lastAnalyzedMemory.important_dates && lastAnalyzedMemory.important_dates.length > 0 && (
            <div className="pt-2 border-t border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1.5">
                Extracted Milestones
              </span>
              <div className="flex flex-wrap gap-2">
                {lastAnalyzedMemory.important_dates.map((d) => (
                  <span
                    key={d.id || d.label}
                    className="inline-flex items-center space-x-2 px-2.5 py-1 bg-surface-container border border-outline-variant rounded-md text-xs font-mono text-on-surface"
                  >
                    <span className="font-semibold">{d.label}:</span>
                    <span>{d.date}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={() => onSelectMemory(lastAnalyzedMemory)}
              className="px-3 py-1.5 bg-on-surface text-surface rounded-lg font-label-md text-xs hover:opacity-90 transition-opacity flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View Full Ticket Details</span>
              <ArrowNorthEastIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Date Cards Grid / Feed */}
      {displayedDates.length === 0 ? (
        <div className="py-space-xl text-center border border-dashed border-outline-variant rounded-lg bg-surface p-8">
          <p className="font-headline-sm text-headline-sm text-on-surface">No deadlines in this horizon</p>
          <p className="font-body-sm text-body-sm text-secondary mt-1">
            Drop a ticket, agreement, or warranty above to automatically extract upcoming dates and milestones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedDates.map((item) => {
            const parentMemory = memories.find((m) => m.id === item.memory_id);
            const isUrgent = urgentDates.some((u) => u.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => onDateClick(item)}
                className={`p-4 rounded-lg border transition-all duration-150 cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low ${
                  isUrgent
                    ? 'border-l-4 border-l-amber-500 border-outline-variant shadow-xs'
                    : 'border-outline-variant'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded ${
                        isUrgent
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-surface-container border border-outline-variant text-secondary'
                      }`}
                    >
                      {item.relativeFormatted || 'Upcoming'}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {item.label}
                    </h3>
                  </div>
                  <time className="font-mono text-label-sm text-secondary font-medium">
                    {item.date}
                  </time>
                </div>

                {item.sourceContext && (
                  <p className="font-body-md text-body-md text-on-surface-variant mb-3">
                    {item.sourceContext}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant text-body-sm">
                  {parentMemory ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMemory(parentMemory);
                      }}
                      className="text-secondary hover:text-on-surface flex items-center space-x-1 underline underline-offset-4 decoration-outline-variant cursor-pointer"
                    >
                      <span>From: {parentMemory.title}</span>
                      <ArrowNorthEastIcon className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-secondary text-xs">Indexed commitment</span>
                  )}

                  <span className="text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center space-x-1">
                    <span>Search details</span>
                    <ArrowForwardIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
