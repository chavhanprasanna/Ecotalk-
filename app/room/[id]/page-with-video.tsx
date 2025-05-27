'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/providers/socket-provider';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useSimplePeer } from '@/hooks/useSimplePeer';
import { generateRandomName, generateRandomAvatar, generateSessionId } from '@/lib/utils';
import { getDisplayMedia } from '@/lib/media-utils';

// Components
import VideoStream from '@/components/room/video-stream';
import ControlBar from '@/components/room/control-bar';
import ParticipantList from '@/components/room/participant-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

// Types
interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isHost: boolean;
  isLocal?: boolean;
  stream?: MediaStream;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  languages: string[];
  maxParticipants: number;
  isPrivate: boolean;
  createdAt: string;
}

export default function RoomPage({ params }: { params: { id: string } }) {
  const { id: roomId } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();
  
  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('video');
  const [isLeaving, setIsLeaving] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  // Local user state
  const [localUser, setLocalUser] = useState<Participant>({
    id: generateSessionId(),
    name: generateRandomName(),
    avatar: generateRandomAvatar(generateRandomName()),
    isMuted: true,
    isVideoEnabled: false,
    isHost: false,
    isLocal: true,
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Local media hook
  const {
    localStream,
    isLoading: isMediaLoading,
    error: mediaError,
    audioEnabled,
    videoEnabled,
    getLocalStream,
    toggleAudio,
    toggleVideo,
    stopAllTracks,
  } = useLocalMedia();
  
  // Update local user state when media state changes
  useEffect(() => {
    setLocalUser(prev => ({
      ...prev,
      isMuted: !audioEnabled,
      isVideoEnabled: videoEnabled,
    }));
  }, [audioEnabled, videoEnabled]);
  
  // Initialize local media
  useEffect(() => {
    const initMedia = async () => {
      try {
        await getLocalStream(true, false); // Start with audio only by default
      } catch (error) {
        console.error('Error initializing media:', error);
        toast({
          title: 'Media Error',
          description: 'Could not access your camera or microphone. Please check your permissions.',
          variant: 'destructive',
        });
      }
    };
    
    initMedia();
    
    return () => {
      stopAllTracks();
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [getLocalStream, stopAllTracks, toast, screenStream]);
  
  // Handle remote streams
  const handleRemoteStream = useCallback((peerId: string, stream: MediaStream) => {
    console.log(`Received remote stream from ${peerId}`);
    
    setParticipants(prev => {
      const updatedParticipants = [...prev];
      const participantIndex = updatedParticipants.findIndex(p => p.id === peerId);
      
      if (participantIndex !== -1) {
        updatedParticipants[participantIndex] = {
          ...updatedParticipants[participantIndex],
          stream,
        };
      }
      
      return updatedParticipants;
    });
  }, []);
  
  const handleRemoteStreamRemoved = useCallback((peerId: string) => {
    console.log(`Remote stream removed for ${peerId}`);
    
    setParticipants(prev => 
      prev.map(p => 
        p.id === peerId 
          ? { ...p, stream: undefined } 
          : p
      )
    );
  }, []);
  
  // WebRTC hook
  const { peers, cleanupPeer } = useSimplePeer({
    roomId,
    localStream: isScreenSharing ? screenStream : localStream,
    onRemoteStream: handleRemoteStream,
    onRemoteStreamRemoved: handleRemoteStreamRemoved,
  });
  
  // Join room
  useEffect(() => {
    if (!isConnected || !socket) return;
    
    console.log('Joining room:', roomId);
    setIsJoining(true);
    setConnectionStatus('connecting');
    
    // Join room
    socket.emit('join-room', { 
      roomId, 
      user: { 
        id: localUser.id, 
        name: localUser.name,
        avatar: localUser.avatar,
        isMuted: localUser.isMuted,
        isVideoEnabled: localUser.isVideoEnabled,
      }
    });
    
    // Handle room state
    const handleRoomState = (data: { 
      room: Room; 
      participants: Participant[];
      messages: Message[];
    }) => {
      console.log('Received room state:', data);
      
      setRoom(data.room);
      
      // Add isLocal flag to participants
      const participantsWithLocal = data.participants.map(p => ({
        ...p,
        isLocal: p.id === localUser.id,
      }));
      
      setParticipants(participantsWithLocal);
      setMessages(data.messages || []);
      
      // Update local user host status
      const isHost = data.participants.some(p => p.id === localUser.id && p.isHost);
      setLocalUser(prev => ({ ...prev, isHost }));
      
      setIsJoining(false);
      setConnectionStatus('connected');
      
      toast({
        title: 'Joined Room',
        description: `You've joined ${data.room.name}`,
      });
    };
    
    // Handle user joined
    const handleUserJoined = (data: { 
      userId: string;
      user: Participant;
      participants: string[];
    }) => {
      console.log('User joined:', data);
      
      // Don't add if it's the local user or already in the list
      if (data.userId === localUser.id || participants.some(p => p.id === data.userId)) {
        return;
      }
      
      setParticipants(prev => [...prev, { ...data.user, isLocal: false }]);
      
      toast({
        title: 'User Joined',
        description: `${data.user.name} joined the room`,
      });
    };
    
    // Handle user left
    const handleUserLeft = (userId: string) => {
      console.log('User left:', userId);
      
      const leavingUser = participants.find(p => p.id === userId);
      if (leavingUser) {
        toast({
          title: 'User Left',
          description: `${leavingUser.name} left the room`,
        });
      }
      
      // Clean up peer connection
      cleanupPeer(userId);
      
      // Remove from participants list
      setParticipants(prev => prev.filter(p => p.id !== userId));
    };
    
    // Handle host changed
    const handleHostChanged = (data: { userId: string; name: string }) => {
      console.log('Host changed:', data);
      
      setParticipants(prev => 
        prev.map(p => ({
          ...p,
          isHost: p.id === data.userId,
        }))
      );
      
      // Update local user if needed
      if (data.userId === localUser.id) {
        setLocalUser(prev => ({ ...prev, isHost: true }));
        
        toast({
          title: 'You are now the host',
          description: 'You can now manage the room and participants',
        });
      } else {
        toast({
          title: 'Host Changed',
          description: `${data.name} is now the host`,
        });
      }
    };
    
    // Handle new message
    const handleNewMessage = (message: Message) => {
      console.log('New message:', message);
      
      setMessages(prev => [...prev, message]);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Show notification if not on chat tab
      if (activeTab !== 'chat' && message.senderId !== localUser.id) {
        toast({
          title: `${message.senderName}`,
          description: message.content.length > 30 
            ? `${message.content.substring(0, 30)}...` 
            : message.content,
        });
      }
    };
    
    // Handle room error
    const handleRoomError = (data: { error: string }) => {
      console.error('Room error:', data.error);
      
      setConnectionStatus('disconnected');
      
      toast({
        title: 'Room Error',
        description: data.error,
        variant: 'destructive',
      });
      
      // Redirect to rooms list
      router.push('/rooms');
    };
    
    // Handle connection error
    const handleConnectionError = (error: any) => {
      console.error('Connection error:', error);
      
      setConnectionStatus('disconnected');
      
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server. Please try again.',
        variant: 'destructive',
      });
    };
    
    // Set up event listeners
    socket.on('room-state', handleRoomState);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('host-changed', handleHostChanged);
    socket.on('new-message', handleNewMessage);
    socket.on('room-error', handleRoomError);
    socket.on('connect_error', handleConnectionError);
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('reconnect', () => {
      setConnectionStatus('connecting');
      // Rejoin room on reconnection
      socket.emit('join-room', { 
        roomId, 
        user: { 
          id: localUser.id, 
          name: localUser.name,
          avatar: localUser.avatar,
          isMuted: localUser.isMuted,
          isVideoEnabled: localUser.isVideoEnabled,
        }
      });
    });
    
    // Clean up
    return () => {
      socket.off('room-state', handleRoomState);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('host-changed', handleHostChanged);
      socket.off('new-message', handleNewMessage);
      socket.off('room-error', handleRoomError);
      socket.off('connect_error', handleConnectionError);
      socket.off('disconnect');
      socket.off('reconnect');
    };
  }, [isConnected, socket, roomId, localUser.id, localUser.name, localUser.avatar, localUser.isMuted, localUser.isVideoEnabled, participants, toast, router, activeTab, cleanupPeer]);
  
  // Handle sending message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !isConnected) return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: localUser.id,
      senderName: localUser.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    socket.emit('send-message', { roomId, message });
    setNewMessage('');
  };
  
  // Handle toggle audio
  const handleToggleAudio = async () => {
    const newAudioState = await toggleAudio();
    
    // Update server
    if (socket && isConnected) {
      socket.emit('toggle-audio', { 
        roomId, 
        userId: localUser.id, 
        isMuted: !newAudioState,
      });
    }
  };
  
  // Handle toggle video
  const handleToggleVideo = async () => {
    const newVideoState = await toggleVideo();
    
    // Update server
    if (socket && isConnected) {
      socket.emit('toggle-video', { 
        roomId, 
        userId: localUser.id, 
        isVideoEnabled: newVideoState,
      });
    }
  };
  
  // Handle screen sharing
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      setScreenStream(null);
      setIsScreenSharing(false);
      
      // Notify other participants
      if (socket && isConnected) {
        socket.emit('screen-share-stopped', { roomId, userId: localUser.id });
      }
      
      return;
    }
    
    try {
      // Start screen sharing
      const stream = await getDisplayMedia();
      if (!stream) return;
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        setIsScreenSharing(false);
        
        // Notify other participants
        if (socket && isConnected) {
          socket.emit('screen-share-stopped', { roomId, userId: localUser.id });
        }
      };
      
      // Notify other participants
      if (socket && isConnected) {
        socket.emit('screen-share-started', { roomId, userId: localUser.id });
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: 'Screen Sharing Error',
        description: 'Could not start screen sharing. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle leave room
  const handleLeaveRoom = () => {
    setIsLeaving(true);
  };
  
  const confirmLeaveRoom = () => {
    // Leave room
    if (socket && isConnected) {
      socket.emit('leave-room', { roomId, userId: localUser.id });
    }
    
    // Clean up
    stopAllTracks();
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Redirect to rooms list
    router.push('/rooms');
  };
  
  const cancelLeaveRoom = () => {
    setIsLeaving(false);
  };
  
  // Handle reconnection
  const handleReconnect = () => {
    // Set connection status to connecting
    setConnectionStatus('connecting');
    
    // Clean up existing connections
    Object.keys(peers).forEach(peerId => {
      cleanupPeer(peerId);
    });
    
    // Attempt to reconnect socket if needed
    if (socket && !isConnected) {
      socket.connect();
    }
    
    // Rejoin the room
    if (socket && isConnected) {
      socket.emit('join-room', { 
        roomId, 
        user: { 
          id: localUser.id, 
          name: localUser.name,
          avatar: localUser.avatar,
          isMuted: localUser.isMuted,
          isVideoEnabled: localUser.isVideoEnabled,
        }
      });
      
      toast({
        title: 'Reconnecting',
        description: 'Attempting to reconnect to the room...',
      });
    } else {
      toast({
        title: 'Connection Error',
        description: 'Unable to reconnect. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle share room
  const handleShareRoom = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    
    // Try to use the clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: 'Room Link Copied',
            description: 'Share this link with others to invite them to the room',
          });
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          promptShareLink(url);
        });
    } else {
      promptShareLink(url);
    }
  };
  
  const promptShareLink = (url: string) => {
    // Fallback for browsers that don't support clipboard API
    toast({
      title: 'Room Link',
      description: 'Copy this link to share: ' + url,
    });
  };
  
  // Loading state
  if (isJoining) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Joining Room...</h2>
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Setting up your connection' : 
           connectionStatus === 'disconnected' ? 'Connection lost. Trying to reconnect...' : 
           'Connecting to other participants'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Room header */}
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{room?.name || 'Room'}</h1>
            <p className="text-sm text-muted-foreground">{room?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {room?.category && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {room.category}
              </span>
            )}
            {room?.languages?.map(lang => (
              <span key={lang} className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {/* Local user video */}
            <VideoStream
              stream={isScreenSharing ? screenStream || undefined : localStream || undefined}
              username={localUser.name}
              avatar={localUser.avatar}
              isMuted={localUser.isMuted}
              isVideoEnabled={isScreenSharing ? true : localUser.isVideoEnabled}
              isLocal={true}
              isHost={localUser.isHost}
              connectionStatus={connectionStatus}
            />
            
            {/* Remote user videos */}
            {participants
              .filter(p => p.id !== localUser.id)
              .map(participant => (
                <VideoStream
                  key={participant.id}
                  stream={participant.stream}
                  username={participant.name}
                  avatar={participant.avatar}
                  isMuted={participant.isMuted}
                  isVideoEnabled={participant.isVideoEnabled}
                  isHost={participant.isHost}
                  connectionStatus={connectionStatus}
                />
              ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 border-l hidden md:block">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="participants" className="flex-1">Participants</TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="participants" className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <ParticipantList 
                  participants={participants.map(p => ({
                    id: p.id,
                    name: p.name,
                    avatar: p.avatar,
                    isMuted: p.isMuted,
                    isHost: p.isHost,
                    isLocal: p.id === localUser.id,
                  }))} 
                  localUserId={localUser.id}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="chat" className="p-0 flex flex-col h-[calc(100vh-12rem)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex flex-col ${message.senderId === localUser.id ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.senderId === localUser.id ? 'You' : message.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div 
                        className={`px-3 py-2 rounded-lg max-w-[80%] ${
                          message.senderId === localUser.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">Send</Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Control bar */}
      <div className="p-4 border-t">
        <ControlBar
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          isScreenSharing={isScreenSharing}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onLeaveRoom={handleLeaveRoom}
          onShareRoom={handleShareRoom}
          onToggleChat={() => setActiveTab(activeTab === 'chat' ? 'participants' : 'chat')}
          isChatOpen={activeTab === 'chat'}
          connectionStatus={connectionStatus}
          onReconnect={handleReconnect}
        />
      </div>
      
      {/* Leave room confirmation */}
      <AlertDialog open={isLeaving} onOpenChange={setIsLeaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this room? You'll need to rejoin to come back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeaveRoom}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeaveRoom}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
