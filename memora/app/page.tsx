'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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
  FolderSelectorModal,
} from '@/components/Modals';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';
import { DontForgetView } from '@/components/DontForgetView';
import { GroundedAnswer, ImportantDate, Memory } from '@/types/memory';

gsap.registerPlugin(useGSAP);

const INITIAL_MEMORIES: Memory[] = [];
const INITIAL_DATES: ImportantDate[] = [];

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'memory' | 'timeline' | 'dont_forget'>('memory');
  const [searchQuery, setSearchQuery] = useState('');
  const [answer, setAnswer] = useState<GroundedAnswer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [dates, setDates] = useState<ImportantDate[]>(INITIAL_DATES);

  const [vaultName, setVaultName] = useState('Personal Vault');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Modals state
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isKeybindingsModalOpen, setIsKeybindingsModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  // Tab change smooth transition
  useGSAP(
    () => {
      if (mainContentRef.current) {
        gsap.fromTo(
          mainContentRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    },
    { dependencies: [currentTab], scope: pageContainerRef }
  );


  const refreshVault = async () => {
    try {
      const [memRes, dateRes] = await Promise.all([
        fetch('/api/memories'),
        fetch('/api/dates'),
      ]);

      if (memRes.ok) {
        const memData = await memRes.json();
        if (Array.isArray(memData.memories)) {
          setMemories(memData.memories);
        }
      }

      if (dateRes.ok) {
        const dateData = await dateRes.json();
        if (Array.isArray(dateData.dates)) {
          setDates(dateData.dates);
        }
      }
    } catch {}
  };

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
        setCurrentTab('memory');
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
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

    // Automatically search for the new memory only if on the memory tab
    if (currentTab === 'memory') {
      setSearchQuery(newMemory.title);
      handleSearch(newMemory.title);
    }
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
    setCurrentTab('memory');
    setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
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
    <div
      ref={pageContainerRef}
      className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-surface-variant relative overflow-x-hidden"
    >
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onAddMemoryClick={handleAddMemoryClick}
        onSearchFocus={handleFocusSearch}
        onSelectFolderClick={() => setIsFolderModalOpen(true)}
        vaultName={vaultName}
        onVaultClick={() => setIsPreferencesModalOpen(true)}
      />

      {/* Main Canvas with GSAP tab morphing */}
      <main ref={mainContentRef} className="flex-grow w-full max-w-4xl mx-auto px-gutter py-space-xl will-change-transform">
        {currentTab === 'timeline' ? (
          <TimelineView
            memories={memories}
            dates={dates}
            onSelectMemory={setSelectedMemory}
          />
        ) : currentTab === 'dont_forget' ? (
          <DontForgetView
            dates={dates}
            memories={memories}
            onDateClick={handleDateClick}
            onSelectMemory={setSelectedMemory}
            onUploadSuccess={handleUploadSuccess}
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

            {/* Section: Recently Added */}
            <RecentMemories
              memories={memories}
              onViewSource={setSelectedMemory}
              onTagClick={handleTagClick}
              onSelectMemory={setSelectedMemory}
              onViewAllClick={() => setCurrentTab('timeline')}
              totalCount={memories.length}
            />

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

      <FolderSelectorModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onScanComplete={refreshVault}
      />
    </div>
  );
}
