'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Crown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeAvatar } from '@/components/ui/safe-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateRandomAvatar } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isHost?: boolean;
  isLocal: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  localUserId: string;
}

export default function ParticipantList({ participants, localUserId }: ParticipantListProps) {
  // Sort participants: host first, then local user, then alphabetically
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    if (a.id === localUserId && b.id !== localUserId) return -1;
    if (a.id !== localUserId && b.id === localUserId) return 1;
    return a.name.localeCompare(b.name);
  });
  
  const handleKickUser = (userId: string) => {
    console.log('Kick user:', userId);
    // In a real app, this would emit a socket event
  };
  
  const handleMuteUser = (userId: string) => {
    console.log('Mute user:', userId);
    // In a real app, this would emit a socket event
  };
  
  const handlePromoteToHost = (userId: string) => {
    console.log('Promote user to host:', userId);
    // In a real app, this would emit a socket event
  };
  
  return (
    <div className="p-4 space-y-2">
      {sortedParticipants.map((participant) => (
        <div 
          key={participant.id} 
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <SafeAvatar 
              src={generateRandomAvatar(participant.name)} 
              alt={participant.name} 
              fallbackText={participant.name} 
            />
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">
                  {participant.name} 
                  {participant.isLocal && ' (You)'}
                </span>
                {participant.isHost && (
                  <Crown className="h-3.5 w-3.5 text-yellow-400" />
                )}
              </div>
              
              <div className="flex items-center gap-1.5">
                {participant.isMuted ? (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MicOff className="h-3 w-3 mr-1" />
                    Muted
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-emerald-500">
                    <Mic className="h-3 w-3 mr-1" />
                    Unmuted
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Admin actions (only show for non-local users and if local user is host) */}
          {!participant.isLocal && participants.find(p => p.id === localUserId)?.isHost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleMuteUser(participant.id)}>
                  {participant.isMuted ? 'Unmute User' : 'Mute User'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePromoteToHost(participant.id)}>
                  Promote to Host
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleKickUser(participant.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Kick from Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}
    </div>
  );
}