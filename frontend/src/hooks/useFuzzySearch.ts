import { useState, useCallback, useMemo } from 'react';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  score: number;
  [key: string]: any;
}

/**
 * Custom hook for fuzzy searching with WASM acceleration
 * Falls back to JavaScript implementation if WASM unavailable
 */
export const useFuzzySearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // TODO: Load WASM search module
  const wasmSearcher = useMemo(() => {
    // Placeholder for WASM module loading
    return null;
  }, []);

  const search = useCallback(async (
    query: string,
    items: any[],
    options?: {
      keys?: string[];
      threshold?: number;
      limit?: number;
    }
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Use WASM if available
      if (wasmSearcher) {
        // TODO: Implement WASM search
      } else {
        // JavaScript fallback
        const searchResults = performJSSearch(query, items, options);
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [wasmSearcher]);

  return {
    results,
    search,
    isSearching,
  };
};

/**
 * JavaScript implementation of fuzzy search
 */
function performJSSearch(
  query: string,
  items: any[],
  options?: {
    keys?: string[];
    threshold?: number;
    limit?: number;
  }
): SearchResult[] {
  const {
    keys = ['name', 'description'],
    threshold = 0.3,
    limit = 10,
  } = options || {};

  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const item of items) {
    let bestScore = 0;

    for (const key of keys) {
      const value = item[key];
      if (typeof value !== 'string') continue;

      const score = calculateScore(queryLower, value.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
      }
    }

    if (bestScore >= threshold) {
      results.push({
        ...item,
        score: bestScore,
      });
    }
  }

  // Sort by score and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Calculate similarity score between query and text
 */
function calculateScore(query: string, text: string): number {
  if (text.includes(query)) {
    return 1.0;
  }

  // Simple character matching
  let matches = 0;
  let position = 0;

  for (const char of query) {
    const index = text.indexOf(char, position);
    if (index >= 0) {
      matches++;
      position = index + 1;
    }
  }

  return matches / query.length;
}