import { 
  AdvancedSearchFilters, 
  FreelancerSearchResult, 
  SearchQuery, 
  SkillFilter,
  PriceFilter,
  Currency,
  LocationFilter,
  SearchSortBy,
  SearchLogicalOperator
} from '../types/freelancer-search.types'


export function generateCacheKey(query: SearchQuery): string {
  const normalizedQuery = normalizeQuery(query)
  const queryStr = JSON.stringify(normalizedQuery)
  
  return btoa(queryStr).replace(/[+/=]/g, char => 
    char === '+' ? '-' : char === '/' ? '_' : ''
  )
}


export function normalizeQuery(query: SearchQuery): SearchQuery {
  const normalized = { ...query }
  
  normalized.query = query.query.trim().toLowerCase()
  
  if (query.filters.skills) {
    normalized.filters.skills = query.filters.skills
      .map(skill => ({ ...skill, name: skill.name.toLowerCase().trim() }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  
  if (query.filters.languages) {
    normalized.filters.languages = [...query.filters.languages]
      .sort()
      .map(lang => lang.toLowerCase().trim())
  }
  
  if (query.filters.priceRange && query.filters.priceRange.currency) {
    normalized.filters.priceRange = {
      ...query.filters.priceRange,
      currency: query.filters.priceRange.currency.toUpperCase() as Currency
    }
  }
  
  return normalized
}


export function calculateRelevanceScore(
  freelancer: FreelancerSearchResult, 
  query: SearchQuery
): number {
  let score = 0
  const maxScore = 100
  
  if (!query.query && !query.filters.skills.length) return 50
  
  const queryWords = query.query.toLowerCase().split(/\s+/).filter(Boolean)
  const titleWords = freelancer.title.toLowerCase().split(/\s+/)
  const descWords = freelancer.description.toLowerCase().split(/\s+/)
  const skillWords = freelancer.skills.map(s => s.toLowerCase())
  
  queryWords.forEach(word => {
    if (titleWords.some(titleWord => titleWord.includes(word))) {
      score += 25
    }
    
    if (skillWords.some(skill => skill.includes(word))) {
      score += 20
    }
    
    if (descWords.some(descWord => descWord.includes(word))) {
      score += 10
    }
  })
  
  if (query.filters.skills.length > 0) {
    const matchingSkills = query.filters.skills.filter(querySkill => 
      freelancer.skills.some(freelancerSkill => 
        fuzzyMatch(querySkill.name, freelancerSkill, 0.8)
      )
    )
    
    const skillMatchRatio = matchingSkills.length / query.filters.skills.length
    score += skillMatchRatio * 30
    
    matchingSkills.forEach(skill => {
      if (skill.required) {
        score += 10
      }
      
      if (skill.weight) {
        score += skill.weight * 5
      }
    })
  }
  
  if (freelancer.isTopRated) {
    score += 5
  }
  
  if (freelancer.isVerified) {
    score += 3
  }
  
  return Math.min(score, maxScore)
}

export function fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
  const similarity = calculateStringSimilarity(str1.toLowerCase(), str2.toLowerCase())
  return similarity >= threshold
}


export function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1
  if (str1.length === 0 || str2.length === 0) return 0
  
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  )
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1]
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1
        )
      }
    }
  }
  
  const maxLen = Math.max(str1.length, str2.length)
  return 1 - matrix[str2.length][str1.length] / maxLen
}


export function sortResults(
  results: FreelancerSearchResult[], 
  sortBy: SearchSortBy
): FreelancerSearchResult[] {
  const sortedResults = [...results]
  
  switch (sortBy) {
    case 'relevance':
      return sortedResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    
    case 'rating_desc':
      return sortedResults.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return b.totalReviews - a.totalReviews
      })
    
    case 'rating_asc':
      return sortedResults.sort((a, b) => {
        if (a.rating !== b.rating) return a.rating - b.rating
        return a.totalReviews - b.totalReviews
      })
    
    case 'price_desc':
      return sortedResults.sort((a, b) => b.hourlyRate - a.hourlyRate)
    
    case 'price_asc':
      return sortedResults.sort((a, b) => a.hourlyRate - b.hourlyRate)
    
    case 'newest':
      return sortedResults.sort((a, b) => 
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      )
    
    case 'oldest':
      return sortedResults.sort((a, b) => 
        new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime()
      )
    
    case 'most_reviews':
      return sortedResults.sort((a, b) => b.totalReviews - a.totalReviews)
    
    default:
      return sortedResults
  }
}

export function applyAdvancedFilters(
  results: FreelancerSearchResult[], 
  filters: AdvancedSearchFilters
): FreelancerSearchResult[] {
  let filteredResults = [...results]
  
  if (filters.skills && filters.skills.length > 0) {
    filteredResults = applySkillsFilter(filteredResults, filters.skills, filters.logicalOperator)
  }
  
  if (filters.priceRange) {
    filteredResults = applyPriceFilter(filteredResults, filters.priceRange)
  }
  
  if (filters.rating) {
    filteredResults = applyRatingFilter(filteredResults, filters.rating)
  }
  
  if (filters.availability && filters.availability.length > 0) {
    filteredResults = filteredResults.filter(freelancer =>
      filters.availability!.includes(freelancer.availability)
    )
  }
  
  if (filters.languages && filters.languages.length > 0) {
    filteredResults = filteredResults.filter(freelancer =>
      filters.languages!.some(lang =>
        freelancer.languages.some(freelancerLang =>
          freelancerLang.toLowerCase().includes(lang.toLowerCase())
        )
      )
    )
  }
  
  if (filters.experienceLevel) {
    filteredResults = filteredResults.filter(freelancer =>
      freelancer.experienceLevel === filters.experienceLevel
    )
  }
  
  if (filters.topRatedOnly) {
    filteredResults = filteredResults.filter(freelancer => freelancer.isTopRated)
  }
  
  if (filters.verificationStatus !== 'any') {
    const shouldBeVerified = filters.verificationStatus === 'verified'
    filteredResults = filteredResults.filter(freelancer =>
      freelancer.isVerified === shouldBeVerified
    )
  }
  
  if (filters.portfolioRequired) {
    filteredResults = filteredResults.filter(freelancer => freelancer.portfolioItems > 0)
  }
  
  if (filters.testTaken) {
    filteredResults = filteredResults.filter(freelancer => 
      freelancer.testScores && Object.keys(freelancer.testScores).length > 0
    )
  }
  
  if (filters.responseTime) {
    filteredResults = filteredResults.filter(freelancer => {
      const responseHours = parseResponseTime(freelancer.responseTime)
      return responseHours <= filters.responseTime!
    })
  }
  
  return filteredResults
}

function applySkillsFilter(
  results: FreelancerSearchResult[], 
  skillFilters: SkillFilter[], 
  operator: SearchLogicalOperator
): FreelancerSearchResult[] {
  return results.filter(freelancer => {
    const matchingSkills = skillFilters.filter(skillFilter => {
      const hasSkill = freelancer.skills.some(freelancerSkill =>
        fuzzyMatch(skillFilter.name, freelancerSkill, 0.7)
      )
      
      return hasSkill
    })
    
    if (operator === 'AND') {
      return matchingSkills.length === skillFilters.length
    } else {
      return matchingSkills.length > 0
    }
  })
}


function applyPriceFilter(
  results: FreelancerSearchResult[], 
  priceFilter: PriceFilter
): FreelancerSearchResult[] {
  return results.filter(freelancer => {
    const freelancerRate = convertCurrency(
      freelancer.hourlyRate, 
      freelancer.currency, 
      priceFilter.currency
    )
    const meetsMin = priceFilter.min === undefined || freelancerRate >= priceFilter.min
    const meetsMax = priceFilter.max === undefined || freelancerRate <= priceFilter.max

    return meetsMin && meetsMax
  })
}


function applyRatingFilter(
  results: FreelancerSearchResult[], 
  ratingFilter: { minimumRating: number; minimumReviews?: number; includeUnrated?: boolean }
): FreelancerSearchResult[] {
  return results.filter(freelancer => {
    if (freelancer.rating === 0 && freelancer.totalReviews === 0) {
      return ratingFilter.includeUnrated || false
    }
    
    const meetsRating = freelancer.rating >= ratingFilter.minimumRating
    const meetsReviews = !ratingFilter.minimumReviews || 
                        freelancer.totalReviews >= ratingFilter.minimumReviews
    
    return meetsRating && meetsReviews
  })
}


export function convertCurrency(
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount
  
  const exchangeRates: Record<Currency, Record<Currency, number>> = {
    USD: { USD: 1.0, EUR: 0.85, GBP: 0.73, ETH: 0.0004, USDT: 1.0 },
    EUR: { USD: 1.18, EUR: 1.0, GBP: 0.86, ETH: 0.0005, USDT: 1.18 },
    GBP: { USD: 1.37, EUR: 1.16, GBP: 1.0, ETH: 0.0006, USDT: 1.37 },
    ETH: { USD: 2500, EUR: 2118, GBP: 1825, ETH: 1.0, USDT: 2500 },
    USDT: { USD: 1.0, EUR: 0.85, GBP: 0.73, ETH: 0.0004, USDT: 1.0 }
  }
  
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1
  return amount * rate
}


function parseResponseTime(responseTime: string): number {
  const timeStr = responseTime.toLowerCase()
  
  if (timeStr.includes('minute')) {
    const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '60')
    return minutes / 60
  }
  
  if (timeStr.includes('hour')) {
    return parseInt(timeStr.match(/\d+/)?.[0] || '24')
  }
  
  if (timeStr.includes('day')) {
    const days = parseInt(timeStr.match(/\d+/)?.[0] || '7')
    return days * 24
  }
  
  return 24
}


export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


export function applyLocationFilter(
  results: FreelancerSearchResult[], 
  locationFilter: LocationFilter
): FreelancerSearchResult[] {
  if (!locationFilter.coordinates || locationFilter.allowRemote) {
    return results
  }
  
  const { lat, lng } = locationFilter.coordinates
  const radius = locationFilter.radius || 50
  const radiusInKm = locationFilter.radiusUnit === 'miles' ? radius * 1.609 : radius

 
  return results
    .map(freelancer => {
      // Keep the original data structure to maintain type compatibility
      if (!freelancer.location?.coordinates) {
        return freelancer
      }
      
      const distance = calculateDistance(
        lat, 
        lng, 
        freelancer.location.coordinates.lat, 
        freelancer.location.coordinates.lng
      )
      
      return {
        ...freelancer,
        location: {
          ...freelancer.location,
          distance
        }
      } as FreelancerSearchResult
    })
    .filter(freelancer => 
      locationFilter.allowRemote || 
      (freelancer.location?.distance !== undefined && freelancer.location.distance <= radiusInKm)
    )
    .sort((a, b) => ((a.location?.distance ?? Infinity) - (b.location?.distance ?? Infinity)))
}


export function generateSearchSuggestions(
  partial: string, 
  previousQueries: string[], 
  skillsDatabase: string[]
): string[] {
  if (partial.length < 2) return []
  
  const normalizedPartial = partial.toLowerCase().trim()
  const suggestions = new Set<string>()
  
  previousQueries
    .filter(query => query.toLowerCase().includes(normalizedPartial))
    .slice(0, 3)
    .forEach(query => suggestions.add(query))
  
  skillsDatabase
    .filter(skill => skill.toLowerCase().includes(normalizedPartial))
    .slice(0, 5)
    .forEach(skill => suggestions.add(skill))
  
  const commonTerms = [
    'react developer', 'node.js', 'python', 'javascript', 'typescript',
    'web developer', 'mobile app', 'ui/ux designer', 'data scientist',
    'wordpress', 'shopify', 'content writer', 'social media'
  ]
  
  commonTerms
    .filter(term => term.toLowerCase().includes(normalizedPartial))
    .slice(0, 3)
    .forEach(term => suggestions.add(term))
  
  return Array.from(suggestions).slice(0, 8)
}


export function validateSearchFilters(filters: AdvancedSearchFilters): string[] {
  const errors: string[] = []
  
  if (filters.priceRange) {
    const { min, max } = filters.priceRange
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Minimum price cannot be greater than maximum price')
    }
    
    if (min !== undefined && min < 0) {
      errors.push('Price cannot be negative')
    }
  }
  
  if (filters.rating) {
    const { minimumRating, minimumReviews } = filters.rating
    if (minimumRating < 0 || minimumRating > 5) {
      errors.push('Rating must be between 0 and 5')
    }
    
    if (minimumReviews !== undefined && minimumReviews < 0) {
      errors.push('Minimum reviews cannot be negative')
    }
  }
  
  if (filters.location?.radius !== undefined) {
    if (filters.location.radius < 0) {
      errors.push('Search radius cannot be negative')
    }
    
    if (filters.location.radius > 10000) {
      errors.push('Search radius cannot exceed 10,000 km/miles')
    }
  }
  
  if (filters.responseTime !== undefined && filters.responseTime < 0) {
    errors.push('Response time cannot be negative')
  }
  
  return errors
}