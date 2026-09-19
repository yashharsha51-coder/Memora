import { getAllMemories } from './supabase';
import { generateGroundedAnswer } from './gemini';
import { GroundedAnswer, Memory } from '@/types/memory';

export async function searchVault(query: string): Promise<GroundedAnswer> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      headline: 'Enter a question to search your personal memory.',
      summary: 'Search through your uploaded documents, receipts, warranties, contracts, and tickets.',
      latencyMs: 0,
      isFound: false,
    };
  }

  // 1. Retrieve memories from database
  const allMemories = await getAllMemories();

  // 2. Rank memories by relevance to query
  const queryTokens = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const scoredMemories = allMemories.map((mem) => {
    let score = 0;
    const titleLower = mem.title.toLowerCase();
    const summaryLower = (mem.summary || '').toLowerCase();
    const typeLower = mem.type.toLowerCase();
    const tagsLower = (mem.tags || []).map((t) => t.toLowerCase());
    const fileLower = (mem.source_file?.filename || '').toLowerCase();

    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 5;
      if (typeLower.includes(token)) score += 3;
      if (summaryLower.includes(token)) score += 3;
      if (tagsLower.some((t) => t.includes(token))) score += 4;
      if (fileLower.includes(token)) score += 4;
      if (mem.important_dates?.some((d) => d.label.toLowerCase().includes(token))) score += 5;
    }

    return { mem, score };
  });

  // Sort by score descending
  scoredMemories.sort((a, b) => b.score - a.score);

  // Take top candidates
  const topMemories: Memory[] = scoredMemories.map((s) => s.mem);

  // 3. Generate grounded answer via Gemini
  return await generateGroundedAnswer(cleanQuery, topMemories);
}
