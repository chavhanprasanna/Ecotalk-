import React from 'react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  ScreenShare, ScreenShareOff, Settings, Share2, MessageSquare, Users,
  RefreshCw, WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ControlBarProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveRoom: () => void;
  onOpenSettings?: () => void;
  onShareRoom?: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  onReconnect?: () => void;
  isChatOpen?: boolean;
  isParticipantsOpen?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
  className?: string;
}

const ControlBar = ({
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveRoom,
  onOpenSettings,
  onShareRoom,
  onToggleChat,
  onToggleParticipants,
  onReconnect,
  isChatOpen,
  isParticipantsOpen,
  connectionStatus = 'connected',
  className,
}: ControlBarProps) => {
  return (
    <TooltipProvider>
      <div className={`flex items-center justify-center space-x-2 p-4 bg-background/90 backdrop-blur-sm rounded-lg ${connectionStatus === 'disconnected' ? 'border border-red-500' : ''} ${className}`}>
        {/* Audio toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={audioEnabled ? "default" : "destructive"}
              size="icon"
              onClick={onToggleAudio}
              className="rounded-full h-12 w-12"
            >
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{audioEnabled ? 'Mute' : 'Unmute'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Video toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={videoEnabled ? "default" : "destructive"}
              size="icon"
              onClick={onToggleVideo}
              className="rounded-full h-12 w-12"
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{videoEnabled ? 'Stop Video' : 'Start Video'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Screen sharing */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenSharing ? "destructive" : "default"}
              size="icon"
              onClick={onToggleScreenShare}
              className="rounded-full h-12 w-12"
            >
              {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Participants */}
        {onToggleParticipants && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isParticipantsOpen ? "secondary" : "outline"}
                size="icon"
                onClick={onToggleParticipants}
                className="rounded-full h-12 w-12"
              >
                <Users className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Participants</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Chat */}
        {onToggleChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isChatOpen ? "secondary" : "outline"}
                size="icon"
                onClick={onToggleChat}
                className="rounded-full h-12 w-12"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenSettings}
                className="rounded-full h-12 w-12"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Share */}
        {onShareRoom && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onShareRoom}
                className="rounded-full h-12 w-12"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share Room</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Reconnect - Only show when disconnected */}
        {connectionStatus === 'disconnected' && onReconnect && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={onReconnect}
                className="rounded-full h-12 w-12 animate-pulse"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reconnect</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Connection Status Indicator */}
        {connectionStatus !== 'connected' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-500/20 border border-yellow-500">
                {connectionStatus === 'connecting' ? (
                  <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Leave */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={onLeaveRoom}
              className="rounded-full h-12 w-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave Room</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ControlBar;
