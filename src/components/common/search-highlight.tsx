"use client"

import React from 'react'

interface SearchHighlightProps {
  text: string
  searchTerm: string
  highlightClassName?: string
}

/**
 * Component that highlights search terms in text
 * Simple implementation for search result highlighting
 */
export default function SearchHighlight({ 
  text, 
  searchTerm, 
  highlightClassName = "bg-yellow-200 font-semibold" 
}: SearchHighlightProps) {
  // If no search term, return original text
  if (!searchTerm.trim()) {
    return <span>{text}</span>
  }

  // Split text by search term (case insensitive)
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
  
  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case insensitive)
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase()
        
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </span>
  )
}
