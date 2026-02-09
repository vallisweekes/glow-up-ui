import type { InsightsResult } from '@/lib/insights';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CacheEntry = {
  data: InsightsResult;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function key(userId: string, month: string) {
  return `${userId}:${month}`;
}

export function getCachedInsights(userId: string, month: string): InsightsResult | null {
  const k = key(userId, month);
  const entry = cache.get(k);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(k);
    return null;
  }
  return entry.data;
}

export function setCachedInsights(userId: string, month: string, data: InsightsResult) {
  const k = key(userId, month);
  cache.set(k, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearCachedInsights(userId: string, month: string) {
  cache.delete(key(userId, month));
}

export function clearAllInsights() {
  cache.clear();
}
