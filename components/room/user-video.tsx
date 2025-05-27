'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateRandomAvatar } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isHost?: boolean;
}

interface UserVideoProps {
  participant: Participant;
  stream: MediaStream | null;
  isLocal: boolean;
}

export default function UserVideo({ participant, stream, isLocal }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video stream when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div 
      className={`aspect-video rounded-lg overflow-hidden relative group ${
        participant.isSpeaking ? 'ring-2 ring-primary ring-offset-1' : 'ring-1 ring-border'
      } ${participant.isVideoEnabled ? 'bg-black' : 'bg-card/50 backdrop-blur-sm'}`}
    >
      {participant.isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage src={generateRandomAvatar(participant.name)} alt={participant.name} />
            <AvatarFallback>
              {/* Use a client-side only approach to prevent hydration mismatch */}
              {typeof window !== 'undefined' ? participant.name.substring(0, 2) : ''}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* User info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate max-w-[120px]">
            {participant.name} {isLocal && '(You)'}
          </span>
          {participant.isHost && (
            <Crown className="h-3.5 w-3.5 text-yellow-400" />
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {participant.isMuted ? (
            <MicOff className="h-4 w-4 text-destructive" />
          ) : (
            <Mic className="h-4 w-4 text-emerald-400" />
          )}
          
          {participant.isVideoEnabled ? (
            <Video className="h-4 w-4 text-emerald-400" />
          ) : (
            <VideoOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Speaking indicator */}
      {participant.isSpeaking && !participant.isMuted && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-emerald-500 font-medium">Speaking</span>
        </div>
      )}
    </div>
  );
}