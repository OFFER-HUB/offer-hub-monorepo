"use client"

import { useSearch } from "@/hooks/use-search"
import SearchLoading from "./search-loading"
import SearchHighlight from "../common/search-highlight"

interface SearchResultsProps {
  children: React.ReactNode
  showLoading?: boolean
  highlightSearch?: boolean
  searchText?: string
}

/**
 * Search results wrapper with optional highlighting capability
 */
export default function SearchResults({ 
  children, 
  showLoading = true,
  highlightSearch = false,
  searchText
}: SearchResultsProps) {
  const { isLoading, searchQuery } = useSearch()

  if (isLoading && showLoading) {
    return <SearchLoading />
  }

  // If highlighting is enabled, wrap children with search context
  if (highlightSearch && searchQuery) {
    return (
      <div className="search-results-container">
        {children}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Helper component to highlight text within search results
 */
export function HighlightedText({ 
  text, 
  searchTerm 
}: { 
  text: string
  searchTerm?: string 
}) {
  const { searchQuery } = useSearch()
  const term = searchTerm || searchQuery
  
  return <SearchHighlight text={text} searchTerm={term} />
}
