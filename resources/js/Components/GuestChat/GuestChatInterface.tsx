import React from 'react';
import { Send, Paperclip, Image, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';


interface Message {
  id: number;
  message: string;
  message_type: string;
  attachments?: any[];
  status: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  } | null;
  metadata?: any;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  assignee?: {
    id: number;
    name: string;
  } | null;
}

interface GuestSession {
  id: number;
  session_id: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  inquiry_type: string;
  display_name: string;
}

interface GuestChatInterfaceProps {
  messages: Message[];
  conversation: Conversation | null;
  guestSession: GuestSession | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  isLoading: boolean;
  showGuestForm: boolean;
  guestInfo: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    inquiry_type: string;
  };
  setGuestInfo: (info: any) => void;
  onSendMessage: () => void;
  onUpdateGuestInfo: () => void;
  onCloseGuestForm: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function GuestChatInterface({
  messages,
  conversation,
  guestSession,
  newMessage,
  setNewMessage,
  isLoading,
  showGuestForm,
  guestInfo,
  setGuestInfo,
  onSendMessage,
  onUpdateGuestInfo,
  onCloseGuestForm,
  onKeyPress,
  messagesEndRef,
}: GuestChatInterfaceProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isGuestMessage = (message: Message) => {
    // Guest messages have no user_id and are not AI responses
    return !message.user && !isAIMessage(message);
  };

  const isAIMessage = (message: Message) => {
    return message.metadata?.is_ai_response === true;
  };

  const isHumanAgentMessage = (message: Message) => {
    return message.user && !isAIMessage(message);
  };

  const getMessageSender = (message: Message) => {
    if (isAIMessage(message)) {
      return 'TekRem AI Assistant';
    }
    if (isHumanAgentMessage(message)) {
      return message.user?.name || 'Agent';
    }
    // For guest messages, show guest name if available
    if (isGuestMessage(message)) {
      const guestName = message.metadata?.guest_name || guestSession?.guest_name;
      return guestName || 'You';
    }
    return 'Unknown';
  };

  const getGuestDisplayInfo = (message: Message) => {
    if (!isGuestMessage(message)) return null;

    const guestName = message.metadata?.guest_name || guestSession?.guest_name;
    const guestEmail = message.metadata?.guest_email || guestSession?.guest_email;

    if (guestName && guestEmail) {
      return `${guestName} (${guestEmail})`;
    }
    if (guestName) {
      return guestName;
    }
    if (guestEmail) {
      return guestEmail;
    }
    return 'You';
  };

  // Guest Information Form
  if (showGuestForm) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm mb-1">Welcome to TekRem Support</h3>
          <p className="text-xs text-muted-foreground">
            Please provide your information to help us assist you better.
          </p>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="guest_name" className="text-xs">Name</Label>
              <Input
                id="guest_name"
                value={guestInfo.guest_name}
                onChange={(e) => setGuestInfo({ ...guestInfo, guest_name: e.target.value })}
                placeholder="Your name"
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="guest_email" className="text-xs">Email</Label>
              <Input
                id="guest_email"
                type="email"
                value={guestInfo.guest_email}
                onChange={(e) => setGuestInfo({ ...guestInfo, guest_email: e.target.value })}
                placeholder="your.email@example.com"
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="guest_phone" className="text-xs">Phone (Optional)</Label>
              <Input
                id="guest_phone"
                value={guestInfo.guest_phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, guest_phone: e.target.value })}
                placeholder="+260 XXX XXX XXX"
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="inquiry_type" className="text-xs">How can we help you?</Label>
              <Select
                value={guestInfo.inquiry_type}
                onValueChange={(value) => setGuestInfo({ ...guestInfo, inquiry_type: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="sales">Sales & Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="border-t p-3 flex-shrink-0">
          <div className="flex space-x-2">
            <Button onClick={onUpdateGuestInfo} className="flex-1 h-8 text-sm">
              Start Chat
            </Button>
            <Button variant="outline" onClick={onCloseGuestForm} className="h-8 text-sm">
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-2">Welcome to TekRem Support!</h3>
              <p className="text-xs text-muted-foreground mb-4">
                We're here to help. Send us a message and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">Web Development</Badge>
                <Badge variant="outline" className="text-xs">Mobile Apps</Badge>
                <Badge variant="outline" className="text-xs">AI Solutions</Badge>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isGuestMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-[80%] ${isGuestMessage(message) ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className={`text-xs ${isAIMessage(message) ? 'bg-purple-100 text-purple-600' : ''}`}>
                    {isGuestMessage(message) ? (
                      <User className="w-3 h-3" />
                    ) : isAIMessage(message) ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      message.user?.name?.charAt(0) || 'S'
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className={`rounded-lg px-3 py-2 ${
                  isGuestMessage(message)
                    ? 'bg-primary text-primary-foreground'
                    : isAIMessage(message)
                    ? 'bg-purple-50 border border-purple-200'
                    : 'bg-muted'
                }`}>
                  {/* Message Header - Show sender info for non-guest messages */}
                  {!isGuestMessage(message) && (
                    <div className="flex items-center gap-1 mb-1">
                      {isAIMessage(message) ? (
                        <>
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">TekRem AI Assistant</span>
                        </>
                      ) : isHumanAgentMessage(message) ? (
                        <>
                          <User className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">{message.user?.name || 'Agent'}</span>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Guest message header - show guest info when available */}
                  {isGuestMessage(message) && (message.metadata?.guest_name || guestSession?.guest_name) && (
                    <div className="flex items-center gap-1 mb-1">
                      <User className="w-3 h-3 text-primary-foreground/70" />
                      <span className="text-xs font-medium text-primary-foreground/90">
                        {getGuestDisplayInfo(message)}
                      </span>
                    </div>
                  )}

                  <p className={`text-sm ${isAIMessage(message) ? 'text-gray-800' : ''}`}>
                    {message.message}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      isGuestMessage(message)
                        ? 'text-primary-foreground/70'
                        : isAIMessage(message)
                        ? 'text-purple-600/70'
                        : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.created_at)}
                    </span>
                    {isGuestMessage(message) && (
                      <span className={`text-xs ${
                        message.status === 'read'
                          ? 'text-primary-foreground/70'
                          : 'text-primary-foreground/50'
                      }`}>
                        {message.status === 'read' ? '✓✓' : '✓'}
                      </span>
                    )}
                    {isAIMessage(message) && (
                      <span className="text-xs text-purple-600/70">
                        AI Response
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t p-3 flex-shrink-0">
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type your message..."
              className="min-h-[20px] max-h-[40px] resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <Button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status indicator */}
        {conversation?.assignee ? (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            You're chatting with {conversation.assignee.name}
          </p>
        ) : (
          <div className="my-2 text-center">
            <p className="text-xs text-muted-foreground">
              Waiting for an agent to join...
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Bot className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-purple-600">AI Assistant is helping you</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
