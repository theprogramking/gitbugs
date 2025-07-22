import { LRUCache } from "lru-cache"

// Simplified cache for speed
const cache = new LRUCache<string, any>({
  max: 50, // Reduced for speed
  ttl: 1000 * 60 * 5, // 5 minutes
  allowStale: true,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
})

export interface CacheOptions {
  ttl?: number
}

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined
}

export function setCached<T>(key: string, value: T, options?: CacheOptions): void {
  const ttl = options?.ttl || 1000 * 60 * 5
  cache.set(key, value, { ttl })
}

export function deleteCached(key: string): void {
  cache.delete(key)
}

export function clearCache(): void {
  cache.clear()
}

// Simplified cache key
export function generateCacheKey(filters: {
  languages: string[]
  labels: string[]
  sortBy: string
}): string {
  const { languages, labels, sortBy } = filters
  return `issues:${sortBy}:${languages.join(",")}:${labels.join(",")}`
}
