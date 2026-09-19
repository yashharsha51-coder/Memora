'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBox } from '@/components/SearchBox';
import { VerifiedKnowledge } from '@/components/VerifiedKnowledge';
import { RememberSoon } from '@/components/RememberSoon';
import { RecentMemories } from '@/components/RecentMemories';
import { UploadZone } from '@/components/UploadZone';
import { TimelineView } from '@/components/TimelineView';
import { Footer } from '@/components/Footer';
import {
  VaultModal,
  KeybindingsModal,
  PreferencesModal,
} from '@/components/Modals';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';
import { GroundedAnswer, ImportantDate, Memory } from '@/types/memory';

// Default Golden Demo Initial State mirroring Stitch design
const INITIAL_VERIFIED_ANSWER: GroundedAnswer = {
  headline: 'Your laptop warranty expires on February 12, 2027.',
  summary:
    'Purchased via Croma Electronics with an AppleCare+ 3-year extended protection protocol. The primary coverage window spans 36 calendar months from delivery confirmation.',
  highlightedDate: 'February 12, 2027',
  source: {
    filename: 'Laptop Invoice.pdf',
  },
  relatedMemories: ['Warranty Card', 'Purchase Receipt'],
  latencyMs: 12,
  isFound: true,
};

const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    title: 'Laptop Purchase',
    type: 'Purchase',
    summary:
      '₹84,990 · Purchased from Croma · Warranty expires Feb 12, 2027 · Related: Warranty card, Service receipt',
    date: 'February 12, 2026',
    amount: 84990,
    currency: 'INR',
    source_file: {
      id: 'file-1',
      filename: 'Laptop Invoice.pdf',
      storage_path: 'files/laptop-invoice.pdf',
      mime_type: 'application/pdf',
      size: 142850,
      created_at: '2026-02-12T10:30:00Z',
    },
    tags: ['Hardware', 'Electronics'],
    created_at: '2026-02-12T10:30:00Z',
  },
  {
    id: 'mem-2',
    title: 'Summer Internship Agreement',
    type: 'Employment',
    summary:
      'Stripe Inc · Fixed 3-month stipend & IP assignment clause · Direct deposit documentation finalized',
    date: 'March 04, 2026',
    source_file: {
      id: 'file-2',
      filename: 'Internship_Agreement_Stripe.pdf',
      storage_path: 'files/internship.pdf',
      mime_type: 'application/pdf',
      size: 320140,
      created_at: '2026-03-04T14:15:00Z',
    },
    tags: ['Career', 'Legal'],
    created_at: '2026-03-04T14:15:00Z',
  },
  {
    id: 'mem-3',
    title: 'Apartment Lease Agreement',
    type: 'Housing',
    summary:
      '11-month term · Security deposit ₹60,000 · Landlord: S. Narayanan · Key handover verified',
    date: 'January 15, 2026',
    amount: 60000,
    currency: 'INR',
    source_file: {
      id: 'file-3',
      filename: 'Lease_Agreement_Indiranagar.pdf',
      storage_path: 'files/lease.pdf',
      mime_type: 'application/pdf',
      size: 512900,
      created_at: '2026-01-15T09:00:00Z',
    },
    tags: ['Residence', 'Contracts'],
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'mem-4',
    title: 'Flight Confirmation — BLR to SFO',
    type: 'Travel',
    summary:
      'Air India AI 175 · Seat 14A · Electronic boarding token issued · Departure terminal 2',
    date: 'April 18, 2026',
    source_file: {
      id: 'file-4',
      filename: 'AI175_BLR_SFO_Ticket.pdf',
      storage_path: 'files/ticket.pdf',
      mime_type: 'application/pdf',
      size: 89200,
      created_at: '2026-04-18T16:45:00Z',
    },
    tags: ['Itinerary', 'International'],
    created_at: '2026-04-18T16:45:00Z',
  },
];

const INITIAL_DATES: ImportantDate[] = [
  {
    id: 'date-1',
    memory_id: 'mem-1',
    label: 'Laptop warranty',
    date: '2027-02-12',
    sourceContext: 'Hardware · Croma invoice',
    relativeDays: 28,
    relativeFormatted: '28 days',
  },
  {
    id: 'date-2',
    memory_id: 'mem-3',
    label: 'Insurance renewal',
    date: '2026-11-01',
    sourceContext: 'Policy #4092 · HDFC Ergo',
    relativeDays: 43,
    relativeFormatted: '43 days',
  },
  {
    id: 'date-3',
    memory_id: 'mem-4',
    label: 'Passport renewal',
    date: '2028-09-15',
    sourceContext: 'Republic of India · Travel doc',
    relativeDays: 730,
    relativeFormatted: '2 years',
  },
];

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'memory' | 'timeline' | 'dont_forget'>('memory');
  const [searchQuery, setSearchQuery] = useState('When does my laptop warranty expire?');
  const [answer, setAnswer] = useState<GroundedAnswer | null>(INITIAL_VERIFIED_ANSWER);
  const [isSearching, setIsSearching] = useState(false);

  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [dates, setDates] = useState<ImportantDate[]>(INITIAL_DATES);

  const [vaultName, setVaultName] = useState("Julian's Vault");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Modals state
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isKeybindingsModalOpen, setIsKeybindingsModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  // Fetch initial data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memRes, dateRes] = await Promise.all([
          fetch('/api/memories'),
          fetch('/api/dates'),
        ]);

        if (memRes.ok) {
          const memData = await memRes.json();
          if (memData.memories && memData.memories.length > 0) {
            setMemories(memData.memories);
          }
        }

        if (dateRes.ok) {
          const dateData = await dateRes.json();
          if (dateData.dates && dateData.dates.length > 0) {
            setDates(dateData.dates);
          }
        }
      } catch {
        // Continue with initial seed
      }
    };

    fetchData();
  }, []);

  // Keyboard shortcut listener (Cmd/Ctrl + K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape') {
        setSelectedMemory(null);
        setIsVaultModalOpen(false);
        setIsKeybindingsModalOpen(false);
        setIsPreferencesModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search handler
  const handleSearch = async (queryToRun: string) => {
    const q = queryToRun.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setAnswer(data.result);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Upload complete handler
  const handleUploadSuccess = (newMemory: Memory) => {
    setMemories((prev) => [newMemory, ...prev]);

    // Refetch dates to reflect newly extracted milestones
    fetch('/api/dates')
      .then((res) => res.json())
      .then((data) => {
        if (data.dates) setDates(data.dates);
      })
      .catch(() => {});

    // Automatically search for the new memory to show verified extraction
    setSearchQuery(newMemory.title);
    handleSearch(newMemory.title);
  };

  // Click on related memory
  const handleRelatedClick = (relatedTitle: string) => {
    setSearchQuery(relatedTitle);
    handleSearch(relatedTitle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Click on source link
  const handleSourceClick = (filename: string) => {
    const matched = memories.find(
      (m) => m.source_file?.filename === filename || m.title.toLowerCase().includes(filename.toLowerCase())
    );
    if (matched) {
      setSelectedMemory(matched);
    } else {
      setSelectedMemory(memories[0]);
    }
  };

  // Focus search input
  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to add memory zone
  const handleAddMemoryClick = () => {
    uploadZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Tag click filter
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Important date click
  const handleDateClick = (dateItem: ImportantDate) => {
    setSearchQuery(dateItem.label);
    handleSearch(dateItem.label);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-surface-variant">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onAddMemoryClick={handleAddMemoryClick}
        onSearchFocus={handleFocusSearch}
        vaultName={vaultName}
      />

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-gutter py-space-xl">
        {currentTab === 'timeline' ? (
          <TimelineView
            memories={memories}
            dates={dates}
            onSelectMemory={setSelectedMemory}
          />
        ) : (
          <>
            {/* Greeting & Search Center */}
            <section className="mb-space-xl">
              <SearchBox
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
                inputRef={searchInputRef}
              />

              {/* Verified Knowledge Editorial Card */}
              <VerifiedKnowledge
                answer={answer}
                isLoading={isSearching}
                onRelatedClick={handleRelatedClick}
                onSourceClick={handleSourceClick}
              />
            </section>

            {/* Section: To Remember Soon */}
            <RememberSoon dates={dates} onDateClick={handleDateClick} />

            {/* Section: Recently Added (hidden in 'dont_forget' view) */}
            {currentTab !== 'dont_forget' && (
              <RecentMemories
                memories={memories}
                onViewSource={setSelectedMemory}
                onTagClick={handleTagClick}
                onSelectMemory={setSelectedMemory}
                onViewAllClick={() => setCurrentTab('timeline')}
                totalCount={Math.max(memories.length, 318)}
              />
            )}

            {/* Section: Drop Something You Don't Want to Forget */}
            <UploadZone
              onUploadSuccess={handleUploadSuccess}
              zoneRef={uploadZoneRef}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onOpenKeybindingsModal={() => setIsKeybindingsModalOpen(true)}
        onOpenPreferencesModal={() => setIsPreferencesModalOpen(true)}
      />

      {/* Modals */}
      <DocumentViewerModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        vaultName={vaultName}
        totalMemories={memories.length}
        isSupabaseConnected={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)}
      />

      <KeybindingsModal
        isOpen={isKeybindingsModalOpen}
        onClose={() => setIsKeybindingsModalOpen(false)}
      />

      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        vaultName={vaultName}
        onVaultNameChange={setVaultName}
      />
    </div>
  );
}
