'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Memory } from '@/types/memory';
import { CloseIcon, ArrowNorthEastIcon, DocumentIcon } from './Icons';

gsap.registerPlugin(useGSAP);

interface DocumentViewerModalProps {
  memory: Memory | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  memory,
  onClose,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useGSAP(() => {
    if (memory) {
      gsap.from(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
      gsap.from(dialogRef.current, {
        scale: 0.94,
        y: 20,
        opacity: 0,
        duration: 0.35,
        ease: 'back.out(1.4)',
      });
    }
  }, [memory]);

  // Handle escape key for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (!memory) return null;

  const filename = memory.source_file?.filename || memory.absolute_path || memory.title || '';
  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(filename) || memory.source_file?.mime_type?.startsWith('image/');
  const isPdf = /\.pdf$/i.test(filename) || memory.source_file?.mime_type === 'application/pdf';
  const fileUrl = `/api/files/${encodeURIComponent(memory.source_file?.filename || filename)}?path=${encodeURIComponent(memory.absolute_path || '')}`;

  const handleReveal = async () => {
    if (!memory.absolute_path) return;
    try {
      await fetch('/api/system/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: memory.absolute_path, action: 'reveal' }),
      });
    } catch {}
  };

  const handleOpenNative = async () => {
    if (!memory.absolute_path) return;
    try {
      await fetch('/api/system/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: memory.absolute_path, action: 'open' }),
      });
    } catch {}
  };

  // Assemble all breakdown entities (from memory.breakdown or memory.entities)
  const breakdownItems: { label: string; value: string; icon?: string }[] = [];

  if (memory.breakdown) {
    for (const [key, val] of Object.entries(memory.breakdown)) {
      if (val && typeof val === 'string') {
        const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        breakdownItems.push({ label: cleanKey, value: val });
      }
    }
  }

  if (breakdownItems.length === 0 && memory.entities) {
    for (const ent of memory.entities) {
      const cleanKey = ent.entity_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (!breakdownItems.some((b) => b.label.toLowerCase() === cleanKey.toLowerCase())) {
        breakdownItems.push({ label: cleanKey, value: ent.entity_value });
      }
    }
  }

  return (
    <>
      {/* Full-Screen Lightbox for Edge-to-Edge Photo Viewing */}
      {isLightboxOpen && isImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none cursor-zoom-out animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 flex items-center space-x-3 z-10" onClick={(e) => e.stopPropagation()}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono border border-white/20 transition-colors flex items-center space-x-1.5"
            >
              <span>Original File</span>
              <ArrowNorthEastIcon className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-xs hover:bg-white/90 transition-colors cursor-pointer"
            >
              Close Fullscreen (Esc) ✕
            </button>
          </div>

          <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            <img
              src={fileUrl}
              alt={memory.title}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="text-white/60 text-xs font-mono mt-3">
            {memory.title} · Click anywhere outside to return
          </p>
        </div>
      )}

      {/* Main Document / Memory Modal */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md will-change-transform"
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          className={`w-full ${
            isExpanded ? 'max-w-5xl h-[92vh]' : 'max-w-3xl max-h-[90vh]'
          } overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-2xl will-change-transform transition-all duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
            <div className="flex items-baseline space-x-3 min-w-0">
              <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                {memory.title}
              </h2>
              <span className="text-secondary font-mono text-label-sm font-semibold uppercase px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant">
                {isImage ? 'Photo' : isPdf ? 'PDF' : memory.type}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-secondary hover:text-on-surface px-2 py-1 rounded text-xs border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer hidden sm:inline-block"
                title="Toggle modal size"
              >
                {isExpanded ? 'Collapse ⤢' : 'Expand ⤡'}
              </button>
              <button
                onClick={onClose}
                className="text-secondary hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real In-Modal Visual Preview */}
          {isImage && (
            <div className="mb-5 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low flex flex-col items-center justify-center p-3 shadow-inner">
              <div
                className="w-full flex items-center justify-center min-h-[260px] max-h-[480px] bg-surface-container-lowest rounded-lg border border-outline-variant/60 p-2 relative group cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
                title="Click to view full screen"
              >
                <img
                  src={fileUrl}
                  alt={memory.title}
                  className="max-h-[460px] w-auto max-w-full object-contain rounded shadow-sm transition-transform duration-200 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <span className="px-3 py-1.5 bg-black/80 text-white rounded-lg font-mono text-xs shadow-lg flex items-center space-x-1.5">
                    <span>⛶ Click to Open Full Screen</span>
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-outline-variant text-body-sm text-secondary">
                <span className="font-mono text-xs truncate max-w-md text-on-surface-variant">
                  {memory.absolute_path || filename}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="px-2.5 py-1 text-xs bg-surface-container border border-outline-variant rounded-md text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    ⛶ Fullscreen
                  </button>
                  {memory.absolute_path && (
                    <button
                      type="button"
                      onClick={handleReveal}
                      className="px-2.5 py-1 text-xs bg-surface-container border border-outline-variant rounded-md text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      Reveal in Explorer 📂
                    </button>
                  )}
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs bg-primary text-surface font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Full Size</span>
                    <ArrowNorthEastIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {isPdf && (
            <div className="mb-5 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low shadow-inner h-[380px]">
              <iframe
                src={fileUrl}
                className="w-full h-full border-0 rounded-lg"
                title={memory.title}
              />
            </div>
          )}

          {/* Structured Information Breakdown */}
          {breakdownItems.length > 0 && (
            <div className="mb-5 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
              <span className="font-label-sm text-xs text-secondary uppercase tracking-widest block mb-2.5 font-semibold">
                Structured Information Breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {breakdownItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/70 shadow-2xs"
                  >
                    <span className="text-[11px] font-mono text-secondary uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="font-headline-sm text-sm font-semibold text-on-surface break-words block mt-0.5">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Details */}
          <div className="space-y-4 font-body-md text-body-md text-on-surface">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                Extracted Summary
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                {memory.summary || 'Record indexed securely in your private vault.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3 border-y border-outline-variant text-body-sm">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-0.5">
                  Record Date
                </span>
                <span className="font-mono text-on-surface">{memory.date || 'Recent'}</span>
              </div>
              {memory.amount != null && (
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-0.5">
                    Amount
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {memory.currency === 'INR' ? '₹' : memory.currency === 'USD' ? '$' : ''}
                    {Number(memory.amount).toLocaleString()}
                  </span>
                </div>
              )}
              {memory.absolute_path && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-0.5">
                    Hard Drive Location
                  </span>
                  <span
                    onClick={handleReveal}
                    className="font-mono text-xs text-primary truncate block hover:underline cursor-pointer"
                    title={memory.absolute_path}
                  >
                    📍 {memory.absolute_path}
                  </span>
                </div>
              )}
            </div>

            {memory.important_dates && memory.important_dates.length > 0 && (
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide block mb-1">
                  Milestones & Important Dates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {memory.important_dates.map((d) => (
                    <div
                      key={d.id || d.label}
                      className="p-2 bg-surface-container rounded border border-outline-variant flex justify-between items-center text-body-sm"
                    >
                      <span className="text-on-surface font-medium">{d.label}</span>
                      <span className="text-secondary font-mono text-xs">
                        {d.date} {d.relativeFormatted ? `(${d.relativeFormatted})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant">
              <div className="flex items-center space-x-2">
                {memory.absolute_path && (
                  <button
                    type="button"
                    onClick={handleOpenNative}
                    className="px-3 py-1.5 bg-surface-container border border-outline-variant hover:border-primary/50 rounded-lg text-body-sm font-medium text-on-surface transition-all cursor-pointer active:scale-95"
                  >
                    Open in Default Desktop App ↗
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-primary text-surface font-semibold rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-md active:scale-95"
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
