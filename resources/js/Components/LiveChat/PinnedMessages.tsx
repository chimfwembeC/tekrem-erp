import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Pin, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Message {
  id: number;
  message: string;
  user?: {
    id: number;
    name: string;
    profile_photo_url?: string;
  };
  created_at: string;
  pinned_at?: string;
}

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  onRefresh: () => void;
}

interface SortableItemProps {
  message: Message;
  index: number;
  onNavigateToMessage: (messageId: number) => void;
  getInitials: (name: string) => string;
}

function SortableItem({ message, index, onNavigateToMessage, getInitials }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-white dark:bg-gray-800 rounded-md p-2 border border-amber-200 dark:border-amber-700 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
        index > 0 ? 'absolute' : 'relative'
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{
        ...style,
        top: index > 0 ? `${index * 4}px` : 'auto',
        left: index > 0 ? `${index * 4}px` : 'auto',
        zIndex: isDragging ? 1000 : (3 - index), // Ensure dragging item is on top
        width: index > 0 ? `calc(100% - ${index * 8}px)` : '100%'
      }}
      onClick={() => onNavigateToMessage(message.id)}
      title="Click to go to message • Drag to reorder"
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking drag handle
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>

        <Avatar className="h-4 w-4 flex-shrink-0">
          <AvatarImage src={message.user?.profile_photo_url || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(message.user?.name || 'U')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              {message.user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">
            {message.message}
          </p>
        </div>

        <Pin className="h-3 w-3 text-amber-500 flex-shrink-0" />
      </div>
    </div>
  );
}

export default function PinnedMessages({ pinnedMessages, onRefresh }: PinnedMessagesProps) {
  const [messages, setMessages] = useState(pinnedMessages);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleNavigateToMessage = (messageId: number) => {
    if (isReordering) return; // Don't navigate while reordering

    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
      }, 2000);
    }
  };

  const handleDragStart = () => {
    setIsReordering(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsReordering(false);

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = messages.findIndex((item) => item.id === active.id);
      const newIndex = messages.findIndex((item) => item.id === over?.id);

      const newMessages = arrayMove(messages, oldIndex, newIndex);
      setMessages(newMessages);

      // Send the new order to the backend
      try {
        const response = await fetch(route('crm.livechat.messages.reorder-pins'), {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message_ids: newMessages.map(msg => msg.id)
          }),
        });

        if (response.ok) {
          toast.success('Pinned messages reordered!');
          onRefresh(); // Refresh to get the latest data
        } else {
          // Revert the order if the request failed
          setMessages(pinnedMessages);
          toast.error('Failed to reorder pinned messages');
        }
      } catch (error) {
        // Revert the order if the request failed
        setMessages(pinnedMessages);
        toast.error('Failed to reorder pinned messages');
      }
    }
  };

  // Update local state when props change
  React.useEffect(() => {
    setMessages(pinnedMessages);
  }, [pinnedMessages]);

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 p-2 group">
      <div className="flex items-center gap-2 mb-2">
        <Pin className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
          Pinned Messages ({messages.length}/3)
        </span>
        <span className="text-xs text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
          • Drag to reorder
        </span>
      </div>

      {/* Stacked Cards Layout with Drag and Drop */}
      <div className="relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={messages.map(msg => msg.id)} strategy={verticalListSortingStrategy}>
            {messages.map((message, index) => (
              <SortableItem
                key={message.id}
                message={message}
                index={index}
                onNavigateToMessage={handleNavigateToMessage}
                getInitials={getInitials}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add spacing for stacked cards */}
        {messages.length > 1 && (
          <div style={{ height: `${(messages.length - 1) * 4}px` }} />
        )}
      </div>
    </div>
  );
}
