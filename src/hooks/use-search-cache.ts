"use client"

import { useCallback, useRef, useMemo } from 'react'
import { 
  SearchCacheEntry, 
  CacheOperations,
  SearchResults,
  SearchQuery ,
  SearchResultMetadata
} from '../types/freelancer-search.types'
import { SearchCache } from '../utils/search-performance'
import { generateCacheKey } from '../utils/search-helpers'

interface UseSearchCacheOptions {
  maxSize?: number
  defaultTTL?: number
  enableCleanup?: boolean
  cleanupInterval?: number
}

interface UseSearchCacheReturn extends CacheOperations {
  isEnabled: boolean
  enable: () => void
  disable: () => void
  getSize: () => number
  exportCache: () => Record<string, any>
  importCache: (data: Record<string, any>) => void
}


export function useSearchCache(options: UseSearchCacheOptions = {}): UseSearchCacheReturn {
  const {
    maxSize = 500,
    defaultTTL = 300000,
    enableCleanup = true,
    cleanupInterval = 60000
  } = options

  const cacheRef = useRef<SearchCache>(new SearchCache(maxSize, defaultTTL))
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isEnabledRef = useRef<boolean>(true)

  const cache = cacheRef.current

  const startCleanupInterval = useCallback(() => {
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current)
    }
    
    if (enableCleanup) {
      cleanupIntervalRef.current = setInterval(() => {
        cache.cleanup()
      }, cleanupInterval)
    }
  }, [cache, enableCleanup, cleanupInterval])

  useMemo(() => {
    startCleanupInterval()
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [startCleanupInterval])

  


  const get = useCallback(<T,>(key: string): SearchCacheEntry<T> | null => {
    if (!isEnabledRef.current) return null
    return cache.get<T>(key)
  }, [cache])


  const set = useCallback(<T,>(
    key: string | SearchQuery, 
    data: T, 
    ttl?: number, 
    tags: string[] = []
  ): void => {
    if (!isEnabledRef.current) return
    
    const cacheKey = typeof key === 'string' ? key : generateCacheKey(key)
    cache.set(cacheKey, data, ttl, tags)
  }, [cache])


  const deleteEntry = useCallback((key: string | SearchQuery): boolean => {
    const cacheKey = typeof key === 'string' ? key : generateCacheKey(key)
    return cache.delete(cacheKey)
  }, [cache])


  const clear = useCallback((): void => {
    cache.clear()
  }, [cache])


  const invalidateByTag = useCallback((tag: string): number => {
    return cache.invalidateByTag(tag)
  }, [cache])


  const cleanup = useCallback((): number => {
    return cache.cleanup()
  }, [cache])

 
  const stats = useCallback(() => {
    return cache.stats()
  }, [cache])

  
  const enable = useCallback((): void => {
    isEnabledRef.current = true
  }, [])

 
  const disable = useCallback((): void => {
    isEnabledRef.current = false
  }, [])


  const getSize = useCallback((): number => {
    return cache.stats().size
  }, [cache])


  const exportCache = useCallback((): Record<string, any> => {
    const exported: Record<string, any> = {}
    
    for (const [key, entry] of (cache as any).cache.entries()) {
      if (Date.now() < entry.timestamp + entry.ttl) {
        exported[key] = {
          data: entry.data,
          timestamp: entry.timestamp,
          ttl: entry.ttl,
          tags: entry.tags,
          version: entry.version
        }
      }
    }
    
    return exported
  }, [cache])


  const importCache = useCallback((data: Record<string, any>): void => {
    for (const [key, entry] of Object.entries(data)) {
      if (entry && typeof entry === 'object' && entry.data && entry.timestamp) {
        const remainingTTL = (entry.timestamp + entry.ttl) - Date.now()
        if (remainingTTL > 0) {
          cache.set(key, entry.data, remainingTTL, entry.tags || [])
        }
      }
    }
  }, [cache])

  const cacheOperations: CacheOperations = {
    get,
    set,
    delete: deleteEntry,
    clear,
    invalidateByTag,
    cleanup,
    stats
  }

  return {
    ...cacheOperations,
    isEnabled: isEnabledRef.current,
    enable,
    disable,
    getSize,
    exportCache,
    importCache
  }
}

export function useSearchResultsCache(options: UseSearchCacheOptions = {}) {
  const cache = useSearchCache(options)


  const cacheResults = useCallback((
    query: SearchQuery, 
    results: SearchResults,
    metadata?: Partial<SearchResultMetadata>
  ): void => {
    const tags = [
      'search_results',
      `page_${query.page}`,
      `limit_${query.limit}`,
      ...query.filters.skills.map(skill => `skill_${skill.name}`),
      query.filters.location?.city ? `city_${query.filters.location.city}` : '',
      query.filters.priceRange?.currency ? `currency_${query.filters.priceRange.currency}` : ''
    ].filter(Boolean)

    cache.set(
      generateCacheKey(query),
      { 
        ...results, 
        metadata: metadata ? { ...results.metadata, ...metadata } : results.metadata 
      },
      undefined,
      tags
    )
  }, [cache])

  
  const getCachedResults = useCallback((query: SearchQuery): SearchResults | null => {
    const cached = cache.get<SearchResults>(generateCacheKey(query))
    return cached ? cached.data : null
  }, [cache])

  const invalidateByFilter = useCallback((filterType: string, filterValue?: string): void => {
    const tag = filterValue ? `${filterType}_${filterValue}` : filterType
    cache.invalidateByTag(tag)
  }, [cache])

 
  const prewarmCache = useCallback(async (
    popularQueries: SearchQuery[],
    searchFunction: (query: SearchQuery) => Promise<SearchResults>
  ): Promise<void> => {
    const prewarmPromises = popularQueries.map(async (query) => {
      const existing = getCachedResults(query)
      if (!existing) {
        try {
          const results = await searchFunction(query)
          //@ts-expect-error - Complex type inference issue with cacheResults function
          cacheResults(query, results, { prewarmed: true })
        } catch (error) {
          console.warn('Failed to prewarm cache for query:', query, error)
        }
      }
    })

    await Promise.allSettled(prewarmPromises)
  }, [getCachedResults, cacheResults])

 
  const getCacheMetrics = useCallback(() => {
    const stats = cache.stats()
    return {
      ...stats,
      effectiveness: stats.hitRate > 0.3 ? 'high' : stats.hitRate > 0.1 ? 'medium' : 'low',
      recommendation: stats.hitRate < 0.1 
        ? 'Consider increasing TTL or adjusting cache strategy'
        : stats.hitRate > 0.7
        ? 'Cache is performing well'
        : 'Cache performance is acceptable'
    }
  }, [cache])

  return {
    ...cache,
    cacheResults,
    getCachedResults,
    invalidateByFilter,
    prewarmCache,
    getCacheMetrics
  }
}