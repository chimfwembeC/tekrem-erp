import React from 'react'
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent } from "@/Components/ui/card"
import { Bot, User, ThumbsUp, ThumbsDown, ExternalLink, Ticket, AlertTriangle } from "lucide-react"
import type { Message } from "@/types/chatbot"

interface ChatMessageProps {
  message: Message
  onRate: () => void
  onCreateTicket: () => void
  onEscalate: () => void
}

export function ChatMessage({ message, onRate, onCreateTicket, onEscalate }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-blue-600" : "bg-gray-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <Card className={`${isUser ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}>
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>

            {/* Intent Badge */}
            {message.intent && !isUser && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {message.intent.replace("_", " ")}
                </Badge>
              </div>
            )}

            {/* Confidence Score */}
            {message.confidence && !isUser && (
              <div className="mt-1">
                <span className="text-xs text-gray-500">Confidence: {Math.round(message.confidence * 100)}%</span>
              </div>
            )}

            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">You might also try:</p>
                <ul className="text-xs space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            {message.actions && message.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (action.type === "link" && action.url) {
                        window.open(action.url, "_blank")
                      } else if (action.action === "create_ticket") {
                        onCreateTicket()
                      } else if (action.action === "escalate") {
                        onEscalate()
                      }
                    }}
                  >
                    {action.type === "link" && <ExternalLink className="w-3 h-3 mr-1" />}
                    {action.action === "create_ticket" && <Ticket className="w-3 h-3 mr-1" />}
                    {action.action === "escalate" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Human Required Warning */}
            {message.requiresHuman && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                This issue may require human assistance
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Buttons for Assistant Messages */}
        {!isUser && (
          <div className="flex gap-1 mt-2 justify-start">
            <Button variant="ghost" size="sm" onClick={onRate} className="h-6 w-6 p-0 hover:bg-green-100">
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onRate} className="h-6 w-6 p-0 hover:bg-red-100">
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  )
}
