import React from 'react'
import { useState, useEffect, useRef } from "react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Separator } from "@/Components/ui/separator"
import { Send, Bot, AlertTriangle, Ticket } from "lucide-react"

import { chatbotApi } from "@/lib/chatbot-api"
import type { Message, Suggestion } from "@/types/chatbot"
import { RatingDialog } from './RatingDialog'
import { TicketDialog } from './TicketDialog'
import { EscalationDialog } from './EscalationDialog'
import { SuggestionButtons } from './SuggestionButtons'
import { ChatMessage } from './ChatMessage'

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [showEscalationDialog, setShowEscalationDialog] = useState(false)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSuggestions()
    // Add welcome message
    setMessages([
      {
        id: "1",
        role: "assistant",
        message: "Hello! I'm here to help you with any questions or issues you might have. How can I assist you today?",
        timestamp: new Date().toISOString(),
        intent: "greeting",
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await chatbotApi.getSuggestions()
      setSuggestions(response.suggestions)
    } catch (error) {
      console.error("Failed to load suggestions:", error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await chatbotApi.sendMessage({
        message: message.trim(),
        conversation_id: conversationId,
        context: {},
      })

      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message: response.response,
        timestamp: new Date().toISOString(),
        intent: response.intent,
        suggestions: response.suggestions,
        actions: response.actions,
        confidence: response.confidence,
        requiresHuman: response.requires_human,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Show escalation dialog if human assistance is required
      if (response.requires_human) {
        setShowEscalationDialog(true)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message:
          "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support directly.",
        timestamp: new Date().toISOString(),
        intent: "error",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    sendMessage(suggestion.text)
  }

  const handleRateMessage = (messageIndex: number) => {
    setSelectedMessageIndex(messageIndex)
    setShowRatingDialog(true)
  }

  const handleCreateTicket = () => {
    setShowTicketDialog(true)
  }

  const handleEscalate = () => {
    setShowEscalationDialog(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              onRate={() => handleRateMessage(index)}
              onCreateTicket={handleCreateTicket}
              onEscalate={handleEscalate}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Bot className="w-4 h-4" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 1 && suggestions.length > 0 && (
        <>
          <Separator />
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick suggestions:</h3>
            <SuggestionButtons suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
          </div>
        </>
      )}

      {/* Input Area */}
      <Separator />
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
            maxLength={1000}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">{input.length}/1000 characters</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCreateTicket} disabled={!conversationId}>
              <Ticket className="w-3 h-3 mr-1" />
              Create Ticket
            </Button>
            <Button variant="outline" size="sm" onClick={handleEscalate} disabled={!conversationId}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              Human Help
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        conversationId={conversationId}
        messageIndex={selectedMessageIndex}
      />

      <TicketDialog open={showTicketDialog} onOpenChange={setShowTicketDialog} conversationId={conversationId} />

      <EscalationDialog
        open={showEscalationDialog}
        onOpenChange={setShowEscalationDialog}
        conversationId={conversationId}
      />
    </div>
  )
}
