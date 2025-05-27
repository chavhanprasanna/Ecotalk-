'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, Globe, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for featured rooms
const mockFeaturedRooms = [
  {
    id: '1',
    name: 'Language Exchange',
    description: 'Practice languages with native speakers from around the world',
    participants: 12,
    languages: ['English', 'Spanish', 'French'],
    category: 'Education',
    isActive: true
  },
  {
    id: '2',
    name: 'Music Lovers',
    description: 'Share and discuss your favorite music with fellow enthusiasts',
    participants: 8,
    languages: ['English', 'Japanese'],
    category: 'Entertainment',
    isActive: true
  },
  {
    id: '3',
    name: 'Casual Gaming',
    description: 'Chat while playing your favorite games or discuss gaming topics',
    participants: 15,
    languages: ['English', 'German', 'Portuguese'],
    category: 'Gaming',
    isActive: true
  },
  {
    id: '4',
    name: 'Book Club',
    description: 'Discuss the latest books and literature with avid readers',
    participants: 5,
    languages: ['English'],
    category: 'Literature',
    isActive: false
  }
];

export default function FeaturedRooms() {
  const router = useRouter();

  const handleJoinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockFeaturedRooms.map((room, index) => (
        <Card 
          key={room.id} 
          className="card-hover glass-effect border border-border"
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-lg line-clamp-1">{room.name}</h4>
              {room.isActive && (
                <span className="flex items-center text-xs text-emerald-500">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {room.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {room.languages.map((language) => (
                <Badge key={language} variant="outline" className="text-xs btn-transition">
                  {language}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1 btn-transition">
                <Globe className="w-3 h-3" />
                {room.category}
              </Badge>
              <span className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                {room.participants}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full btn-transition"
              onClick={() => handleJoinRoom(room.id)}
              disabled={!room.isActive}
            >
              {room.isActive ? 'Join Room' : 'Room Closed'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}