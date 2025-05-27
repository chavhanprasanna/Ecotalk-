'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users, Globe, Languages, Plus, ArrowLeft } from 'lucide-react';
import { formatRoomCategory } from '@/lib/utils';

// Mock data for rooms
const mockRooms = [
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
    isActive: true
  },
  {
    id: '5',
    name: 'Tech Talk',
    description: 'Discuss the latest in technology, programming, and digital trends',
    participants: 7,
    languages: ['English', 'Korean'],
    category: 'Technology',
    isActive: true
  },
  {
    id: '6',
    name: 'Fitness Friends',
    description: 'Share workout tips, nutrition advice, and stay motivated together',
    participants: 9,
    languages: ['English', 'Spanish'],
    category: 'Health',
    isActive: true
  },
  {
    id: '7',
    name: 'Movie Buffs',
    description: 'Chat about your favorite films, directors, and upcoming releases',
    participants: 11,
    languages: ['English', 'French', 'Italian'],
    category: 'Entertainment',
    isActive: true
  },
  {
    id: '8',
    name: 'Travel Stories',
    description: 'Share travel experiences and plan future adventures together',
    participants: 6,
    languages: ['English', 'German'],
    category: 'Travel',
    isActive: true
  }
];

// Available categories and languages for filtering
const categories = ['All', 'Education', 'Entertainment', 'Gaming', 'Technology', 'Health', 'Travel', 'Literature'];
const languages = ['All', 'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese', 'Italian'];

export default function RoomsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');

  const handleJoinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const handleCreateRoom = () => {
    router.push('/room/create');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Filter rooms based on search query, category, and language
  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = searchQuery === '' || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || room.category === categoryFilter;
    
    const matchesLanguage = languageFilter === 'All' || 
      room.languages.includes(languageFilter);
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-12">
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToHome}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Button onClick={handleCreateRoom} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Create Room
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center">Explore Rooms</h1>

        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rooms by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-muted-foreground" />
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(language => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card 
                key={room.id} 
                className="backdrop-blur-sm border border-border hover:border-primary/40 transition-all duration-300"
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
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {formatRoomCategory(room.category)}
                    </Badge>
                    <span className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {room.participants}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Join Room
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">No rooms match your search criteria</p>
              <Button onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setLanguageFilter('All');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}