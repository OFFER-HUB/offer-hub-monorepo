import { LocationData } from './location.types'
import { FreelancerInfo } from './service.types'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'ETH' | 'USDT'

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable' | 'online' | 'offline'

export type SearchSortBy = 
  | 'relevance' 
  | 'rating_desc'
  | 'rating_asc' 
  | 'price_desc'
  | 'price_asc'
  | 'newest'
  | 'oldest'
  | 'most_reviews'

export type SearchLogicalOperator = 'AND' | 'OR'

export interface SkillFilter {
  name: string
  required: boolean
  weight?: number
  yearsExperience?: number
  certificationRequired?: boolean
}

export interface LocationFilter {
  coordinates?: { lat: number; lng: number }
  radius?: number
  radiusUnit?: 'km' | 'miles'
  city?: string
  country?: string
  timezone?: string
  allowRemote?: boolean
}

export interface PriceFilter {
  min?: number
  max?: number
  currency: Currency
  includeNegotiable?: boolean
  hourlyOnly?: boolean
}

export interface RatingFilter {
  minimumRating: number
  minimumReviews?: number
  includeUnrated?: boolean
  weightedScoring?: boolean
}

export interface AdvancedSearchFilters {
  skills: SkillFilter[]
  location?: LocationFilter
  priceRange?: PriceFilter
  rating?: RatingFilter
  availability?: AvailabilityStatus[]
  languages?: string[]
  responseTime?: number
  projectTypes?: string[]
  experienceLevel?: 'entry' | 'intermediate' | 'expert'
  verificationStatus?: 'verified' | 'unverified' | 'any'
  topRatedOnly?: boolean
  portfolioRequired?: boolean
  testTaken?: boolean
  logicalOperator: SearchLogicalOperator
}

export interface SearchQuery {
  query: string
  filters: AdvancedSearchFilters
  sortBy: SearchSortBy
  page: number
  limit: number
  includeInactive?: boolean
}

export interface FreelancerSearchResult extends FreelancerInfo {
  id: string
  username: string
  title: string
  description: string
  skills: string[]
  hourlyRate: number
  currency: Currency
  rating: number
  totalReviews: number
  completedProjects: number
  successRate: number
  responseTime: string
  availability: AvailabilityStatus
  location?: LocationData & {
    timezone?: string
    distance?: number
  }
  languages: string[]
  experienceLevel: 'entry' | 'intermediate' | 'expert'
  isTopRated: boolean
  isVerified: boolean
  isOnline: boolean
  lastActiveAt: string
  portfolioItems: number
  testScores?: Record<string, number>
  relevanceScore?: number
  profileViews: number
  hireRate: number
  earnings?: {
    total: number
    thisMonth: number
    avgProjectValue: number
  }
}

export interface SearchResultMetadata {
  totalResults: number
  totalPages: number
  currentPage: number
  resultsPerPage: number
  searchTime: number
  facets: {
    skills: Array<{ name: string; count: number }>
    locations: Array<{ name: string; count: number }>
    priceRanges: Array<{ range: string; count: number }>
    ratings: Array<{ rating: number; count: number }>
    experienceLevels: Array<{ level: string; count: number }>
  }
  suggestions?: string[]
  didYouMean?: string
}

export interface SearchResults {
  results: FreelancerSearchResult[]
  metadata: SearchResultMetadata
  fromCache: boolean
  cacheExpiry?: number
}

export interface SearchState {
  isLoading: boolean
  isSearching: boolean
  isFetching: boolean
  error: string | null
  query: SearchQuery
  results: SearchResults | null
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SearchHistory {
  id: string
  query: SearchQuery
  resultsCount: number
  timestamp: number
  executionTime: number
}

export interface CachedSearchResult {
  key: string
  data: SearchResults
  timestamp: number
  ttl: number
  hitCount: number
  lastAccessed: number
}

export interface SearchAnalytics {
  searchId: string
  query: string
  filters: Partial<AdvancedSearchFilters>
  resultsCount: number
  executionTime: number
  userInteraction: {
    clickedResults: string[]
    viewedProfiles: string[]
    contactedFreelancers: string[]
    timeSpentOnResults: number
  }
  refinements: Array<{
    type: 'filter_added' | 'filter_removed' | 'query_changed' | 'sort_changed'
    timestamp: number
    value: any
  }>
  sessionId: string
  userId?: string
  timestamp: number
}

export interface SearchPerformanceMetrics {
  averageResponseTime: number
  cacheHitRate: number
  totalSearches: number
  failureRate: number
  popularQueries: Array<{ query: string; count: number }>
  slowQueries: Array<{ query: string; executionTime: number }>
  peakUsageHours: number[]
}

export interface SearchConfiguration {
  debounceMs: number
  cacheEnabled: boolean
  cacheTTL: number
  maxCacheSize: number
  enableAnalytics: boolean
  enableHistory: boolean
  maxHistoryItems: number
  defaultLimit: number
  maxLimit: number
  enableSuggestions: boolean
  fuzzySearchThreshold: number
  enableGeoSearch: boolean
  defaultRadius: number
  enableRealTimeUpdates: boolean
}

export interface SearchHookOptions {
  config?: Partial<SearchConfiguration>
  initialQuery?: Partial<SearchQuery>
  autoSearch?: boolean
  persistHistory?: boolean
  enableOfflineSearch?: boolean
}

export interface UseFreelancerSearchReturn {
  state: SearchState
  search: (query: Partial<SearchQuery>) => Promise<void>
  clearSearch: () => void
  refineSearch: (refinements: Partial<SearchQuery>) => Promise<void>
  loadMore: () => Promise<void>
  retry: () => Promise<void>
  getSuggestions: (partial: string) => Promise<string[]>
  history: SearchHistory[]
  clearHistory: () => void
  analytics: SearchAnalytics[]
  exportSearchData: () => Promise<Blob>
  configuration: SearchConfiguration
  updateConfiguration: (config: Partial<SearchConfiguration>) => void
}

export interface SearchCacheEntry<T = any> {
  key: string
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  version: number
  metadata?: Record<string, any>
}

export interface CacheOperations {
  get: <T>(key: string) => SearchCacheEntry<T> | null
  set: <T>(key: string, data: T, ttl?: number, tags?: string[]) => void
  delete: (key: string) => boolean
  clear: () => void
  invalidateByTag: (tag: string) => number
  cleanup: () => number
  stats: () => {
    size: number
    hitRate: number
    missRate: number
    totalHits: number
    totalMisses: number
  }
}

export interface SearchFilterState {
  activeFilters: AdvancedSearchFilters
  filterHistory: AdvancedSearchFilters[]
  presets: Array<{ name: string; filters: AdvancedSearchFilters }>
  isDirty: boolean
}

export interface FilterOperations {
  updateFilter: <K extends keyof AdvancedSearchFilters>(
    key: K, 
    value: AdvancedSearchFilters[K]
  ) => void
  removeFilter: (key: keyof AdvancedSearchFilters) => void
  clearFilters: () => void
  resetToDefaults: () => void
  saveAsPreset: (name: string) => void
  loadPreset: (name: string) => void
  deletePreset: (name: string) => void
  undo: () => void
  redo: () => void
  getFilterCount: () => number
  validateFilters: () => string[]
}