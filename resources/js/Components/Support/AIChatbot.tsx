import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Bot,
  User,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  AlertTriangle,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
  intent?: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    url?: string;
    action?: string;
  }>;
  rating?: 'helpful' | 'not_helpful';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
  className?: string;
}

export default function AIChatbot({ isOpen, onClose, onMinimize, isMinimized, className = '' }: Props) {
  const { t } = useTranslate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        role: 'assistant',
        message: t('support.chatbot_welcome', 'Hello! I\'m your AI assistant. How can I help you today?'),
        timestamp: new Date().toISOString(),
        suggestions: [
          'I need help with login issues',
          'How do I reset my password?',
          'I found a bug in the system',
          'I need billing support'
        ]
      }]);
    }
  }, [isOpen]);

  const sendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || loading) return;

    const userMessage: Message = {
      role: 'user',
      message: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/support/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        message: data.response,
        timestamp: new Date().toISOString(),
        intent: data.intent,
        suggestions: data.suggestions,
        actions: data.actions,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-escalate if needed
      if (data.requires_human) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            message: t('support.escalation_message', 'It looks like you might need human assistance. Would you like me to connect you with a support agent?'),
            timestamp: new Date().toISOString(),
            actions: [
              { type: 'action', label: 'Connect with Agent', action: 'escalate' },
              { type: 'action', label: 'Create Ticket', action: 'create_ticket' }
            ]
          }]);
        }, 1000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: { type: string; label: string; url?: string; action?: string }) => {
    if (action.type === 'link' && action.url) {
      window.open(action.url, '_blank');
    } else if (action.action === 'escalate') {
      await escalateToHuman();
    } else if (action.action === 'create_ticket') {
      // Redirect to ticket creation with conversation context
      window.location.href = `/support/create?conversation_id=${conversationId}`;
    }
  };

  const escalateToHuman = async () => {
    if (!conversationId) return;

    try {
      const response = await fetch('/support/chatbot/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          reason: 'User requested human assistance',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          message: data.message,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('Failed to escalate:', err);
    }
  };

  const rateMessage = async (messageIndex: number, rating: 'helpful' | 'not_helpful') => {
    if (!conversationId) return;

    try {
      await fetch('/support/chatbot/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_index: messageIndex,
          rating: rating,
        }),
      });

      setMessages(prev => prev.map((msg, index) => 
        index === messageIndex ? { ...msg, rating } : msg
      ));
    } catch (err) {
      console.error('Failed to rate message:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[600px] shadow-lg z-50 ${isMinimized ? 'h-16' : ''} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {t('support.ai_assistant', 'AI Assistant')}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onMinimize}>
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[calc(100%-80px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-xs h-auto py-1 px-2"
                              onClick={() => sendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-xs h-auto py-1 px-2"
                              onClick={() => handleAction(action)}
                            >
                              {action.label}
                              {action.type === 'link' && <ExternalLink className="h-3 w-3 ml-1" />}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Rating */}
                      {message.role === 'assistant' && !message.rating && index > 0 && (
                        <div className="mt-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => rateMessage(index, 'helpful')}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => rateMessage(index, 'not_helpful')}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {message.rating && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {message.rating === 'helpful' ? (
                              <>
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Helpful
                              </>
                            ) : (
                              <>
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Not helpful
                              </>
                            )}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs text-muted-foreground mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('support.type_message', 'Type your message...')}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <Button onClick={() => sendMessage()} disabled={loading || !inputMessage.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
