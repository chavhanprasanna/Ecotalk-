'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  X, Settings, Share2, ArrowLeft, Crown, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/providers/socket-provider';
import { useToast } from '@/hooks/use-toast';
import { generateRandomName, generateRandomAvatar, generateSessionId } from '@/lib/utils';
import ChatMessage from '@/components/room/chat-message';
import UserVideo from '@/components/room/user-video';
import ParticipantList from '@/components/room/participant-list';

// Mock room data
const mockRoom = {
  id: '1',
  name: 'Language Exchange',
  description: 'Practice languages with native speakers from around the world',
  category: 'Education',
  languages: ['English', 'Spanish', 'French'],
  maxParticipants: 12,
  isPrivate: false,
  createdAt: new Date().toISOString(),
};

// Mock participants
const mockParticipants = [
  {
    id: 'host-123',
    name: 'HappyPanda42',
    avatar: 'HappyPanda42',
    isSpeaking: false,
    isMuted: false,
    isVideoEnabled: true,
    isHost: true,
  },
  {
    id: 'user-456',
    name: 'CleverFox73',
    avatar: 'CleverFox73',
    isSpeaking: true,
    isMuted: false,
    isVideoEnabled: false,
    isHost: false,
  },
  {
    id: 'user-789',
    name: 'WittyEagle21',
    avatar: 'WittyEagle21',
    isSpeaking: false,
    isMuted: true,
    isVideoEnabled: false,
    isHost: false,
  }
];

// Mock chat messages
const mockMessages = [
  {
    id: '1',
    senderId: 'host-123',
    senderName: 'HappyPanda42',
    content: 'Welcome to the Language Exchange room! What languages are you learning?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    senderId: 'user-456',
    senderName: 'CleverFox73',
    content: "I'm learning Spanish. Anyone here a native speaker?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: '3',
    senderId: 'user-789',
    senderName: 'WittyEagle21',
    content: 'Hola! Soy de España. Puedo ayudarte con español.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

export default function RoomPage({ params }: { params: { id: string } }) {
  const { id: roomId } = params;
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  
  // Local user state
  const [localUser, setLocalUser] = useState({
    id: generateSessionId(),
    name: generateRandomName(),
    avatar: '',
    isMuted: false,
    isVideoEnabled: false,
    isHost: false,
  });
  
  // Room state
  const [room, setRoom] = useState(mockRoom);
  const [participants, setParticipants] = useState(mockParticipants);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('participants');
  
  // WebRTC references
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  
  // Initialize avatar
  useEffect(() => {
    setLocalUser(prev => ({
      ...prev,
      avatar: generateRandomAvatar(prev.name),
    }));
  }, []);
  
  // Handle socket connection and room joining
  useEffect(() => {
    if (isConnected && socket) {
      // Join room
      socket.emit('join-room', { 
        roomId, 
        user: { 
          id: localUser.id, 
          name: localUser.name,
          avatar: localUser.avatar,
        }
      });
      
      // Listen for user joined
      socket.on('user-joined', (user) => {
        toast({
          title: `${user.name} joined the room`,
          duration: 3000,
        });
        
        // Update participants list
        setParticipants(prev => [...prev, { 
          ...user, 
          isSpeaking: false, 
          isMuted: true,
          isVideoEnabled: false,
          isHost: false,
        }]);
        
        // Initiate WebRTC connection with new user
        // This would be implemented in a real application
      });
      
      // Listen for user left
      socket.on('user-left', (userId) => {
        const leavingUser = participants.find(p => p.id === userId);
        if (leavingUser) {
          toast({
            title: `${leavingUser.name} left the room`,
            duration: 3000,
          });
        }
        
        // Update participants list
        setParticipants(prev => prev.filter(p => p.id !== userId));
        
        // Clean up peer connection
        if (peerConnectionsRef.current[userId]) {
          peerConnectionsRef.current[userId].close();
          delete peerConnectionsRef.current[userId];
        }
      });
      
      // Listen for new messages
      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });
      
      // Clean up
      return () => {
        socket.emit('leave-room', { roomId, userId: localUser.id });
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('new-message');
        
        // Clean up media streams
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clean up peer connections
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        peerConnectionsRef.current = {};
      };
    }
  }, [isConnected, socket, roomId, localUser.id, localUser.name, localUser.avatar, toast, participants]);
  
  // Toggle audio
  const toggleMute = async () => {
    try {
      if (!localStreamRef.current && !localUser.isMuted) {
        // Get media stream if not already available
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
      }
      
      if (localStreamRef.current) {
        // Toggle audio tracks
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = localUser.isMuted;
        });
      }
      
      // Update local state
      setLocalUser(prev => ({ ...prev, isMuted: !prev.isMuted }));
      
      // Broadcast status change to other participants
      if (socket && isConnected) {
        socket.emit('toggle-audio', { 
          roomId, 
          userId: localUser.id, 
          isMuted: !localUser.isMuted 
        });
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast({
        title: 'Could not access microphone',
        description: 'Please check your permissions',
        variant: 'destructive',
      });
    }
  };
  
  // Toggle video
  const toggleVideo = async () => {
    try {
      if (!localStreamRef.current && !localUser.isVideoEnabled) {
        // Get media stream if not already available
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !localUser.isMuted });
        localStreamRef.current = stream;
      }
      
      if (localStreamRef.current) {
        // Toggle video tracks
        localStreamRef.current.getVideoTracks().forEach(track => {
          track.enabled = !localUser.isVideoEnabled;
        });
      }
      
      // Update local state
      setLocalUser(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      
      // Broadcast status change to other participants
      if (socket && isConnected) {
        socket.emit('toggle-video', { 
          roomId, 
          userId: localUser.id, 
          isVideoEnabled: !localUser.isVideoEnabled 
        });
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      toast({
        title: 'Could not access camera',
        description: 'Please check your permissions',
        variant: 'destructive',
      });
    }
  };
  
  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      senderId: localUser.id,
      senderName: localUser.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    // Add message locally
    setMessages(prev => [...prev, message]);
    
    // Send to other participants
    if (socket && isConnected) {
      socket.emit('send-message', { roomId, message });
    }
    
    // Clear input
    setNewMessage('');
  };
  
  // Leave room
  const leaveRoom = () => {
    // Clean up and redirect
    if (socket && isConnected) {
      socket.emit('leave-room', { roomId, userId: localUser.id });
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    router.push('/rooms');
  };
  
  // Handle message input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Copy invite link
  const copyInviteLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Invite link copied',
        description: 'Share this with others to invite them',
      });
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-background/95">
      {/* Room header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/rooms')}
              className="md:flex"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold line-clamp-1">{room.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {room.category}
                </Badge>
                {room.languages.map(lang => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyInviteLink}
              className="hidden md:flex"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyInviteLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy Invite Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocalUser(prev => ({ ...prev, name: generateRandomName() }))}>
                  <Settings className="mr-2 h-4 w-4" />
                  Change Nickname
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={leaveRoom}
            >
              <X className="h-4 w-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            {/* Local user */}
            <UserVideo
              participant={{
                ...localUser,
                isSpeaking: false, // Would be determined by audio level in a real implementation
              }}
              stream={localStreamRef.current}
              isLocal={true}
            />
            
            {/* Remote participants */}
            {participants
              .filter(p => p.id !== localUser.id)
              .map(participant => (
                <UserVideo
                  key={participant.id}
                  participant={participant}
                  stream={null} // Would be peer connections in a real implementation
                  isLocal={false}
                />
              ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="border-t md:border-t-0 md:border-l border-border md:w-80 lg:w-96 flex flex-col bg-card/30 backdrop-blur-sm">
          <Tabs 
            defaultValue="participants" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <TabsList className="grid grid-cols-2 px-4 py-2">
              <TabsTrigger value="participants" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Participants</span>
                <Badge variant="secondary" className="ml-1">
                  {participants.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
                <Badge variant="secondary" className="ml-1">
                  {messages.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="participants" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <ParticipantList 
                  participants={[
                    { ...localUser, isLocal: true },
                    ...participants
                      .filter(p => p.id !== localUser.id)
                      .map(p => ({ ...p, isLocal: false }))
                  ]}
                  localUserId={localUser.id}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {messages.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === localUser.id}
                    senderAvatar={
                      message.senderId === localUser.id 
                        ? localUser.avatar 
                        : generateRandomAvatar(message.senderName)
                    }
                  />
                ))}
              </ScrollArea>
              
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Control bar */}
      <div className="bg-card/70 backdrop-blur-sm border-t border-border p-4">
        <div className="container mx-auto flex justify-center items-center gap-4">
          <Button
            variant={localUser.isMuted ? "outline" : "default"}
            size="icon"
            className={`rounded-full h-12 w-12 ${localUser.isMuted ? 'bg-destructive/10 border-destructive/50 hover:bg-destructive/20' : ''}`}
            onClick={toggleMute}
          >
            {localUser.isMuted ? (
              <MicOff className={`h-5 w-5 ${localUser.isMuted ? 'text-destructive' : ''}`} />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant={localUser.isVideoEnabled ? "default" : "outline"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleVideo}
          >
            {localUser.isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant={activeTab === 'participants' ? "default" : "outline"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setActiveTab('participants')}
          >
            <Users className="h-5 w-5" />
          </Button>
          
          <Button
            variant={activeTab === 'chat' ? "default" : "outline"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}