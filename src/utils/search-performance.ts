import { 
  SearchCacheEntry, 
  SearchPerformanceMetrics, 
  FreelancerSearchResult
} from '../types/freelancer-search.types'

interface PerformanceConfig {
  enableMetrics: boolean
  sampleRate: number
  slowQueryThreshold: number
  maxMetricsHistory: number
}

interface QueryPerformance {
  queryId: string
  executionTime: number
  resultCount: number
  cacheHit: boolean
  timestamp: number
  query: string
}

class SearchPerformanceManager {
  private metrics: QueryPerformance[] = []
  private config: PerformanceConfig
  private startTimes = new Map<string, number>()
  
  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMetrics: true,
      sampleRate: 1.0,
      slowQueryThreshold: 1000,
      maxMetricsHistory: 1000,
      ...config
    }
  }


  startQuery(queryId: string): void {
    if (!this.shouldSample()) return
    
    this.startTimes.set(queryId, performance.now())
  }

  /**
   * Ends tracking and records performance metrics
   * @param queryId - Query identifier
   * @param resultCount - Number of results returned
   * @param cacheHit - Whether result was served from cache
   */
  endQuery(queryId: string, resultCount: number, cacheHit: boolean = false): void {
    const startTime = this.startTimes.get(queryId)
    if (!startTime) return
    
    const executionTime = performance.now() - startTime
    this.startTimes.delete(queryId)
    
    const queryPerf: QueryPerformance = {
      queryId,
      executionTime,
      resultCount,
      cacheHit,
      timestamp: Date.now(),
      query: queryId
    }
    
    this.metrics.push(queryPerf)
    
    if (this.metrics.length > this.config.maxMetricsHistory) {
      this.metrics.shift()
    }
    
    if (executionTime > this.config.slowQueryThreshold) {
      console.warn(`Slow search query detected: ${executionTime}ms for query "${queryId}"`)
    }
  }


  getMetrics(): SearchPerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        cacheHitRate: 0,
        totalSearches: 0,
        failureRate: 0,
        popularQueries: [],
        slowQueries: [],
        peakUsageHours: []
      }
    }
    
    const totalTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0)
    const cacheHits = this.metrics.filter(m => m.cacheHit).length
    const slowQueries = this.metrics
      .filter(m => m.executionTime > this.config.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10)
      .map(m => ({ query: m.query, executionTime: m.executionTime }))
    
    const queryFrequency = new Map<string, number>()
    this.metrics.forEach(m => {
      queryFrequency.set(m.query, (queryFrequency.get(m.query) || 0) + 1)
    })
    
    const popularQueries = Array.from(queryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))
    
    const hourlyUsage = new Array(24).fill(0)
    this.metrics.forEach(m => {
      const hour = new Date(m.timestamp).getHours()
      hourlyUsage[hour]++
    })
    
    const maxUsage = Math.max(...hourlyUsage)
    const peakUsageHours = hourlyUsage
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count > maxUsage * 0.8)
      .map(({ hour }) => hour)
    
    return {
      averageResponseTime: totalTime / this.metrics.length,
      cacheHitRate: cacheHits / this.metrics.length,
      totalSearches: this.metrics.length,
      failureRate: 0,
      popularQueries,
      slowQueries,
      peakUsageHours
    }
  }

  /**
   * Clears all collected metrics
   */
  clearMetrics(): void {
    this.metrics = []
    this.startTimes.clear()
  }

  /**
   * Determines if current query should be sampled based on sample rate
   * @returns Whether to sample this query
   */
  private shouldSample(): boolean {
    return this.config.enableMetrics && Math.random() < this.config.sampleRate
  }
}

/**
 * Cache implementation with advanced features
 */
export class SearchCache {
  private cache = new Map<string, SearchCacheEntry>()
  private accessCount = new Map<string, number>()
  private totalAccesses = 0
  private hitCount = 0
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 500, defaultTTL: number = 300000) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * Retrieves cached search results
   * @param key - Cache key
   * @returns Cached entry or null if not found/expired
   */
  get<T>(key: string): SearchCacheEntry<T> | null {
    this.totalAccesses++
    
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }
    
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      this.accessCount.delete(key)
      return null
    }
    
    this.hitCount++
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1)
    
    return {
      ...entry,
      metadata: {
        ...entry.metadata,
        lastAccessed: Date.now(),
        hitCount: this.accessCount.get(key) || 0
      }
    }
  }

  /**
   * Stores search results in cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   * @param tags - Cache tags for invalidation
   */
  set<T>(key: string, data: T, ttl?: number, tags: string[] = []): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }
    
    const entry: SearchCacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      tags,
      version: 1,
      metadata: {
        createdAt: Date.now(),
        size: this.estimateSize(data)
      }
    }
    
    this.cache.set(key, entry)
    this.accessCount.set(key, 0)
  }

  /**
   * Removes entry from cache
   * @param key - Cache key to remove
   * @returns Whether entry was removed
   */
  delete(key: string): boolean {
    this.accessCount.delete(key)
    return this.cache.delete(key)
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.accessCount.clear()
    this.hitCount = 0
    this.totalAccesses = 0
  }


  invalidateByTag(tag: string): number {
    let removedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        this.accessCount.delete(key)
        removedCount++
      }
    }
    
    return removedCount
  }

  
  cleanup(): number {
    const now = Date.now()
    let removedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key)
        this.accessCount.delete(key)
        removedCount++
      }
    }
    
    return removedCount
  }

 
  stats() {
    return {
      size: this.cache.size,
      hitRate: this.totalAccesses > 0 ? this.hitCount / this.totalAccesses : 0,
      missRate: this.totalAccesses > 0 ? (this.totalAccesses - this.hitCount) / this.totalAccesses : 0,
      totalHits: this.hitCount,
      totalMisses: this.totalAccesses - this.hitCount
    }
  }


  private evictLeastUsed(): void {
    let lruKey = ''
    let minAccess = Infinity
    
    for (const [key, count] of this.accessCount.entries()) {
      if (count < minAccess) {
        minAccess = count
        lruKey = key
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey)
      this.accessCount.delete(lruKey)
    }
  }

 
  private estimateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length * 2
    } catch {
      return 1024
    }
  }
}


export class SearchDebouncer {
  private timeouts = new Map<string, NodeJS.Timeout>()
  private promises = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>()

  debounce<T>(key: string, fn: () => Promise<T>, delay: number): Promise<T> {
    const existingTimeout = this.timeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    const existingPromise = this.promises.get(key)
    if (existingPromise) {
      existingPromise.reject(new Error('Debounced'))
    }

    return new Promise<T>((resolve, reject) => {
      this.promises.set(key, { resolve, reject })
      
      const timeout = setTimeout(async () => {
        this.timeouts.delete(key)
        const promiseInfo = this.promises.get(key)
        this.promises.delete(key)
        
        if (promiseInfo) {
          try {
            const result = await fn()
            promiseInfo.resolve(result)
          } catch (error) {
            promiseInfo.reject(error)
          }
        }
      }, delay)
      
      this.timeouts.set(key, timeout)
    })
  }

 
  cancel(key: string): void {
    const timeout = this.timeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(key)
    }
    
    const promise = this.promises.get(key)
    if (promise) {
      promise.reject(new Error('Cancelled'))
      this.promises.delete(key)
    }
  }

 
  clear(): void {
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout)
    }
    this.timeouts.clear()
    
    for (const promise of this.promises.values()) {
      promise.reject(new Error('Cleared'))
    }
    this.promises.clear()
  }
}


export class ResultsOptimizer {

  static virtualizeResults<T>(
    results: T[], 
    viewportSize: number, 
    startIndex: number
  ): { items: T[]; totalCount: number; startIndex: number; endIndex: number } {
    const endIndex = Math.min(startIndex + viewportSize, results.length)
    const items = results.slice(startIndex, endIndex)
    
    return {
      items,
      totalCount: results.length,
      startIndex,
      endIndex
    }
  }

  static getBatch<T>(results: T[], batchSize: number, batchIndex: number): T[] {
    const startIndex = batchIndex * batchSize
    const endIndex = startIndex + batchSize
    return results.slice(startIndex, endIndex)
  }

 
  static preloadResults(
    results: FreelancerSearchResult[], 
    preloadCount: number = 10
  ): (FreelancerSearchResult & { preloaded?: boolean })[] {
    return results.map((result, index) => ({
      ...result,
      preloaded: index < preloadCount
    }))
  }


  static optimizeAssets(results: FreelancerSearchResult[]) {
    return results.map(result => ({
      ...result,
      optimizedImages: {
        thumbnail: `${result.id}_thumb.webp`,
        lowRes: `${result.id}_low.webp`,
        highRes: `${result.id}_high.webp`
      }
    }))
  }
}


export class BackgroundTaskManager {
  private tasks = new Map<string, { promise: Promise<any>; controller: AbortController }>()


  async executeBackground<T>(taskId: string, task: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const existingTask = this.tasks.get(taskId)
    if (existingTask) {
      existingTask.controller.abort()
    }

    const controller = new AbortController()
    const promise = task(controller.signal)
    
    this.tasks.set(taskId, { promise, controller })
    
    try {
      const result = await promise
      this.tasks.delete(taskId)
      return result
    } catch (error) {
      this.tasks.delete(taskId)
      throw error
    }
  }

  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.controller.abort()
      this.tasks.delete(taskId)
    }
  }


  cancelAllTasks(): void {
    for (const [taskId, task] of this.tasks.entries()) {
      task.controller.abort()
    }
    this.tasks.clear()
  }


  getTaskStatuses(): Array<{ taskId: string; status: 'running' | 'completed' | 'cancelled' }> {
    return Array.from(this.tasks.keys()).map(taskId => ({
      taskId,
      status: 'running' as const
    }))
  }
}

export const performanceManager = new SearchPerformanceManager()
export const searchCache = new SearchCache()
export const searchDebouncer = new SearchDebouncer()
export const backgroundTasks = new BackgroundTaskManager()


export const PerformanceUtils = {

  async measureTime<T>(fn: () => Promise<T>, label: string): Promise<{ result: T; time: number }> {
    const start = performance.now()
    const result = await fn()
    const time = performance.now() - start
    
    console.debug(`${label}: ${time.toFixed(2)}ms`)
    
    return { result, time }
  },


  throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit: number): T {
    let inThrottle = false
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        fn.apply(this, args)
        inThrottle = true
        setTimeout(() => { inThrottle = false }, limit)
      }
    }) as T
  },


  async batchProcess<T, R>(
    operations: T[], 
    processor: (batch: T[]) => Promise<R[]>, 
    batchSize: number = 10,
    delay: number = 0
  ): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)
      const batchResults = await processor(batch)
      results.push(...batchResults)
      
      if (delay > 0 && i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return results
  }
}