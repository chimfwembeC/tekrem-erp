import React from 'react'
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import type { Suggestion } from "@/types/chatbot"

interface SuggestionButtonsProps {
  suggestions: Suggestion[]
  onSuggestionClick: (suggestion: Suggestion) => void
}

export function SuggestionButtons({ suggestions, onSuggestionClick }: SuggestionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          className="text-left justify-start h-auto p-3 flex-col items-start"
        >
          <span className="text-sm">{suggestion.text}</span>
          <Badge variant="secondary" className="text-xs mt-1">
            {suggestion.category}
          </Badge>
        </Button>
      ))}
    </div>
  )
}
