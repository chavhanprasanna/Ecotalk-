import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, User, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoStreamProps {
  stream?: MediaStream;
  username: string;
  avatar?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isLocal?: boolean;
  isHost?: boolean;
  isSpeaking?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
}

const VideoStream = ({
  stream,
  username,
  avatar,
  isMuted,
  isVideoEnabled,
  isLocal = false,
  isHost = false,
  isSpeaking = false,
  connectionStatus = 'connected',
}: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Connect stream to video element when it changes
  useEffect(() => {
    if (videoRef.current && stream) {
      try {
        videoRef.current.srcObject = stream;
        setHasVideoError(false);
      } catch (error) {
        console.error('Error attaching stream to video element:', error);
        setHasVideoError(true);
      }
    }
  }, [stream]);
  
  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setHasVideoError(true);
  };

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden bg-gray-900 aspect-video",
        isSpeaking && "ring-2 ring-green-500",
        isHost && "ring-2 ring-blue-500"
      )}
    >
      {/* Video Stream */}
      {isVideoEnabled && stream && !hasVideoError && connectionStatus === 'connected' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          onError={handleVideoError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={username} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <span className="mt-2 text-gray-300 text-sm font-medium">{username}</span>
            
            {/* Show connection status indicator */}
            {connectionStatus !== 'connected' && (
              <div className="mt-2 flex items-center gap-1">
                {connectionStatus === 'connecting' ? (
                  <span className="text-yellow-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Connecting...
                  </span>
                ) : (
                  <span className="text-red-400 text-xs flex items-center">
                    <WifiOff className="w-3 h-3 mr-1" /> Disconnected
                  </span>
                )}
              </div>
            )}
            
            {/* Show video error */}
            {hasVideoError && connectionStatus === 'connected' && (
              <span className="mt-1 text-red-400 text-xs flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> Video error
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status indicators */}
      <TooltipProvider>
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${isMuted ? 'bg-red-500' : 'bg-green-500'} rounded-full p-1`}>
                {isMuted ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? 'Microphone off' : 'Microphone on'}</p>
            </TooltipContent>
          </Tooltip>
          
          {!isVideoEnabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-red-500 rounded-full p-1">
                  <VideoOff className="w-4 h-4 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Camera off</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {connectionStatus === 'disconnected' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-red-500 rounded-full p-1">
                  <WifiOff className="w-4 h-4 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Disconnected</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Host badge */}
      {isHost && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          Host
        </div>
      )}

      {/* Local user badge */}
      {isLocal && (
        <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
          You
        </div>
      )}
    </div>
  );
};

export default VideoStream;
