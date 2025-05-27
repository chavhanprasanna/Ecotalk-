'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  senderAvatar: string;
}

export default function ChatMessage({ message, isOwnMessage, senderAvatar }: ChatMessageProps) {
  const formattedTime = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
  
  return (
    <div className={`flex gap-2 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={senderAvatar} alt={message.senderName} />
        <AvatarFallback>{message.senderName.substring(0, 2)}</AvatarFallback>
      </Avatar>
      
      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`
          rounded-xl py-2 px-3 break-words
          ${isOwnMessage 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-secondary text-secondary-foreground rounded-tl-none'}
        `}>
          {!isOwnMessage && (
            <p className="text-xs font-medium mb-1">{message.senderName}</p>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formattedTime}
        </p>
      </div>
    </div>
  );
}