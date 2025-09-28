"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  SearchHistory, 
  SearchQuery, 
  AdvancedSearchFilters 
} from '../types/freelancer-search.types'
import { generateCacheKey } from '../utils/search-helpers'

interface UseSearchHistoryOptions {
  maxHistoryItems?: number
  persistToStorage?: boolean
  storageKey?: string
  enableAutoComplete?: boolean
  groupByDate?: boolean
}

interface SearchHistoryGroup {
  date: string
  entries: SearchHistory[]
}

interface UseSearchHistoryReturn {
  history: SearchHistory[]
  groupedHistory: SearchHistoryGroup[]
  addToHistory: (query: SearchQuery, resultsCount: number, executionTime: number) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  getFrequentSearches: (limit?: number) => SearchHistory[]
  getRecentSearches: (limit?: number) => SearchHistory[]
  searchHistory: (searchTerm: string) => SearchHistory[]
  getSearchSuggestions: (partial: string) => string[]
  getFavoriteFilters: () => Partial<AdvancedSearchFilters>[]
  exportHistory: () => string
  importHistory: (data: string) => boolean
  getSearchStats: () => {
    totalSearches: number
    averageResultCount: number
    averageExecutionTime: number
    mostSearchedTerms: Array<{ term: string; count: number }>
    searchTrends: Array<{ date: string; count: number }>
  }
}

const DEFAULT_STORAGE_KEY = 'freelancer_search_history'
const MAX_HISTORY_ITEMS = 100


export function useSearchHistory(options: UseSearchHistoryOptions = {}): UseSearchHistoryReturn {
  const {
    maxHistoryItems = MAX_HISTORY_ITEMS,
    persistToStorage = true,
    storageKey = DEFAULT_STORAGE_KEY,
    enableAutoComplete = true,
    groupByDate = false
  } = options

  const [history, setHistory] = useState<SearchHistory[]>([])
  const historyMapRef = useRef<Map<string, SearchHistory>>(new Map())

  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem(storageKey)
        if (savedHistory) {
          const parsedHistory: SearchHistory[] = JSON.parse(savedHistory)
          setHistory(parsedHistory.slice(-maxHistoryItems))
          
          historyMapRef.current.clear()
          parsedHistory.forEach(entry => {
            historyMapRef.current.set(entry.id, entry)
          })
        }
      } catch (error) {
        console.warn('Failed to load search history from storage:', error)
      }
    }
  }, [storageKey, maxHistoryItems, persistToStorage])

  const saveToStorage = useCallback((historyData: SearchHistory[]) => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(historyData))
      } catch (error) {
        console.warn('Failed to save search history to storage:', error)
      }
    }
  }, [persistToStorage, storageKey])

 
  const addToHistory = useCallback((
    query: SearchQuery, 
    resultsCount: number, 
    executionTime: number
  ): void => {
    const queryKey = generateCacheKey(query)
    const existingEntry = historyMapRef.current.get(queryKey)
    
    if (existingEntry) {
      const updatedEntry: SearchHistory = {
        ...existingEntry,
        resultsCount,
        executionTime,
        timestamp: Date.now()
      }
      
      historyMapRef.current.set(queryKey, updatedEntry)
      
      setHistory(prev => {
        const filtered = prev.filter(entry => entry.id !== queryKey)
        const updated = [updatedEntry, ...filtered]
        const trimmed = updated.slice(0, maxHistoryItems)
        saveToStorage(trimmed)
        return trimmed
      })
    } else {
      const newEntry: SearchHistory = {
        id: queryKey,
        query,
        resultsCount,
        executionTime,
        timestamp: Date.now()
      }
      
      historyMapRef.current.set(queryKey, newEntry)
      
      setHistory(prev => {
        const updated = [newEntry, ...prev]
        const trimmed = updated.slice(0, maxHistoryItems)
        saveToStorage(trimmed)
        return trimmed
      })
    }
  }, [maxHistoryItems, saveToStorage])

 
  const removeFromHistory = useCallback((id: string): void => {
    historyMapRef.current.delete(id)
    setHistory(prev => {
      const updated = prev.filter(entry => entry.id !== id)
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const clearHistory = useCallback((): void => {
    historyMapRef.current.clear()
    setHistory([])
    saveToStorage([])
  }, [saveToStorage])

  
  const getFrequentSearches = useCallback((limit: number = 10): SearchHistory[] => {
    const queryFrequency = new Map<string, { entry: SearchHistory; count: number }>()
    
    history.forEach(entry => {
      const queryText = entry.query.query.toLowerCase().trim()
      if (queryText) {
        const existing = queryFrequency.get(queryText)
        if (existing) {
          existing.count++
          if (entry.timestamp > existing.entry.timestamp) {
            existing.entry = entry
          }
        } else {
          queryFrequency.set(queryText, { entry, count: 1 })
        }
      }
    })
    
    return Array.from(queryFrequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.entry)
  }, [history])

  /**
   * Gets most recent searches
   * @param limit - Maximum number of results
   * @returns Array of recent searches
   */
  const getRecentSearches = useCallback((limit: number = 10): SearchHistory[] => {
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }, [history])

  /**
   * Searches through history entries
   * @param searchTerm - Term to search for
   * @returns Filtered history entries
   */
  const searchHistory = useCallback((searchTerm: string): SearchHistory[] => {
    if (!searchTerm.trim()) return []
    
    const term = searchTerm.toLowerCase()
    return history.filter(entry => {
      const queryMatch = entry.query.query.toLowerCase().includes(term)
      const skillsMatch = entry.query.filters.skills.some(skill => 
        skill.name.toLowerCase().includes(term)
      )
      const locationMatch = entry.query.filters.location?.city?.toLowerCase().includes(term) ||
                           entry.query.filters.location?.country?.toLowerCase().includes(term)
      
      return queryMatch || skillsMatch || locationMatch
    })
  }, [history])

  /**
   * Generates autocomplete suggestions based on history
   * @param partial - Partial input text
   * @returns Array of suggestions
   */
  const getSearchSuggestions = useCallback((partial: string): string[] => {
    if (!enableAutoComplete || partial.length < 2) return []
    
    const suggestions = new Set<string>()
    const normalizedPartial = partial.toLowerCase().trim()
    
    history.forEach(entry => {
      const query = entry.query.query.toLowerCase()
      if (query.includes(normalizedPartial)) {
        suggestions.add(entry.query.query)
      }
      
      entry.query.filters.skills.forEach(skill => {
        if (skill.name.toLowerCase().includes(normalizedPartial)) {
          suggestions.add(skill.name)
        }
      })
    })
    
    return Array.from(suggestions)
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(normalizedPartial)
        const bStartsWith = b.toLowerCase().startsWith(normalizedPartial)
        
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        
        return a.length - b.length
      })
      .slice(0, 8)
  }, [history, enableAutoComplete])

  /**
   * Gets frequently used filter combinations
   * @returns Array of popular filter combinations
   */
  const getFavoriteFilters = useCallback((): Partial<AdvancedSearchFilters>[] => {
    const filterCombinations = new Map<string, { filters: Partial<AdvancedSearchFilters>; count: number }>()
    
    history.forEach(entry => {
      const filters = entry.query.filters
      const key = JSON.stringify({
        skills: filters.skills.map(s => s.name).sort(),
        location: filters.location?.city,
        priceRange: filters.priceRange,
        rating: filters.rating?.minimumRating,
        experienceLevel: filters.experienceLevel
      })
      
      const existing = filterCombinations.get(key)
      if (existing) {
        existing.count++
      } else {
        filterCombinations.set(key, { filters, count: 1 })
      }
    })
    
    return Array.from(filterCombinations.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.filters)
  }, [history])

  /**
   * Groups history by date
   */
  const groupedHistory = useCallback((): SearchHistoryGroup[] => {
    if (!groupByDate) return []
    
    const groups = new Map<string, SearchHistory[]>()
    
    history.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0]
      const existing = groups.get(date)
      if (existing) {
        existing.push(entry)
      } else {
        groups.set(date, [entry])
      }
    })
    
    return Array.from(groups.entries())
      .map(([date, entries]) => ({
        date,
        entries: entries.sort((a, b) => b.timestamp - a.timestamp)
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [history, groupByDate])

  /**
   * Exports history as JSON string
   * @returns Serialized history data
   */
  const exportHistory = useCallback((): string => {
    return JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      history: history
    }, null, 2)
  }, [history])

  /**
   * Imports history from JSON string
   * @param data - Serialized history data
   * @returns Whether import was successful
   */
  const importHistory = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.history && Array.isArray(parsed.history)) {
        const importedHistory = parsed.history.slice(-maxHistoryItems)
        setHistory(importedHistory)
        saveToStorage(importedHistory)
        
        historyMapRef.current.clear()
        importedHistory.forEach((entry: any) => {
          historyMapRef.current.set(entry.id, entry)
        })
        
        return true
      }
    } catch (error) {
      console.warn('Failed to import history:', error)
    }
    return false
  }, [maxHistoryItems, saveToStorage])

  /**
   * Gets comprehensive search statistics
   * @returns Search statistics and analytics
   */
  const getSearchStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalSearches: 0,
        averageResultCount: 0,
        averageExecutionTime: 0,
        mostSearchedTerms: [],
        searchTrends: []
      }
    }
    
    const totalResultCount = history.reduce((sum, entry) => sum + entry.resultsCount, 0)
    const totalExecutionTime = history.reduce((sum, entry) => sum + entry.executionTime, 0)
    
    const termFrequency = new Map<string, number>()
    history.forEach(entry => {
      const term = entry.query.query.toLowerCase().trim()
      if (term) {
        termFrequency.set(term, (termFrequency.get(term) || 0) + 1)
      }
    })
    
    const mostSearchedTerms = Array.from(termFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }))
    
    const dailySearches = new Map<string, number>()
    history.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0]
      dailySearches.set(date, (dailySearches.get(date) || 0) + 1)
    })
    
    const searchTrends = Array.from(dailySearches.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))
    
    return {
      totalSearches: history.length,
      averageResultCount: Math.round(totalResultCount / history.length),
      averageExecutionTime: Math.round(totalExecutionTime / history.length),
      mostSearchedTerms,
      searchTrends
    }
  }, [history])

  return {
    history,
    groupedHistory: groupedHistory(),
    addToHistory,
    removeFromHistory,
    clearHistory,
    getFrequentSearches,
    getRecentSearches,
    searchHistory,
    getSearchSuggestions,
    getFavoriteFilters,
    exportHistory,
    importHistory,
    getSearchStats
  }
}