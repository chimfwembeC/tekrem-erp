import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Textarea } from '@/Components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { useTypedPage } from '@/Hooks/useTypedPage';

interface ChatMessage {
  id: number;
  message: string;
  user_id: number;
  recipient_id: number;
  is_read: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    profile_photo_url?: string;
  };
}

interface ChatComponentProps {
  chattableType: string;
  chattableId: number;
  recipientId: number;
  initialMessages: ChatMessage[];
}

export default function ChatComponent({ 
  chattableType, 
  chattableId, 
  recipientId,
  initialMessages = []
}: ChatComponentProps) {
  const page = useTypedPage();
  const currentUser = page.props.auth.user;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    message: '',
    chattable_type: chattableType,
    chattable_id: chattableId,
    recipient_id: recipientId,
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Set up Echo to listen for new messages
    if (window.Echo) {
      // Listen on the private channel for the chattable entity
      const channelName = chattableType === 'App\\Models\\Client' 
        ? `client.${chattableId}` 
        : `lead.${chattableId}`;
      
      const channel = window.Echo.private(channelName);
      
      channel.listen('.chat.message', (e: any) => {
        // Add the new message to the messages array
        setMessages(prevMessages => [...prevMessages, e]);
      });
      
      // Listen on the user's private channel
      const userChannel = window.Echo.private(`user.${currentUser.id}`);
      
      userChannel.listen('.chat.message', (e: any) => {
        // Only add the message if it's related to this chat
        if (
          e.chattable_type === chattableType && 
          e.chattable_id === chattableId
        ) {
          setMessages(prevMessages => [...prevMessages, e]);
        }
      });
      
      // Cleanup function
      return () => {
        channel.stopListening('.chat.message');
        userChannel.stopListening('.chat.message');
      };
    }
  }, [chattableType, chattableId, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(route('crm.chats.store'), {
      onSuccess: () => {
        // Clear the message input
        reset('message');
      },
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto max-h-[400px] space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.user_id === currentUser.id;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
              
              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="text-center my-2">
                      <Badge variant="outline" className="bg-muted">
                        {formatDate(message.created_at)}
                      </Badge>
                    </div>
                  )}
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="h-8 w-8">
                        {message.user.profile_photo_url && (
                          <AvatarImage src={message.user.profile_photo_url} alt={message.user.name} />
                        )}
                        <AvatarFallback>{getInitials(message.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`rounded-lg p-3 ${
                          isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {message.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span>{formatTime(message.created_at)}</span>
                          {isCurrentUser && (
                            <span>{message.is_read ? '✓✓' : '✓'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={data.message}
            onChange={(e) => setData('message', e.target.value)}
            className="flex-grow resize-none"
            rows={2}
          />
          <Button type="submit" disabled={processing || !data.message.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
