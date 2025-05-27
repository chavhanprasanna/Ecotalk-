'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Mic, Video, Globe, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import FeaturedRooms from '@/components/home/featured-rooms';
import { generateRandomName } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  
  const handleExploreRooms = () => {
    router.push('/rooms');
  };
  
  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/create`);
  };

  const features = [
    { 
      icon: <Mic className="w-10 h-10 text-primary" />,
      title: 'Crystal Clear Audio',
      description: 'High-quality audio streaming for smooth conversations with friends and new connections'
    },
    {
      icon: <Video className="w-10 h-10 text-primary" />,
      title: 'HD Video Chat',
      description: 'Face-to-face interaction with HD video that adapts to your connection speed'
    },
    {
      icon: <Globe className="w-10 h-10 text-primary" />,
      title: 'Global Community',
      description: 'Connect with people from around the world, filter by language and interests'
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: 'Complete Anonymity',
      description: 'No accounts, no history, no tracking - just join and start chatting'
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-primary" />,
      title: 'Text Chat',
      description: 'In-room text messaging for sharing links, thoughts, or when you need to be quiet'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 btn-transition">
          <div className="bg-primary/20 p-2 rounded-full">
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">
            EchoSpace
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleExploreRooms}
            className="hidden sm:flex btn-transition"
          >
            Explore Rooms
          </Button>
          <Button 
            onClick={handleCreateRoom}
            className="hidden sm:flex btn-transition"
          >
            Create Room
          </Button>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto px-4 pt-12 pb-20">
        <section className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gradient animate-in fade-in duration-700">
            Anonymous Voice & Video Chat
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto animate-in slide-in-from-bottom duration-700 delay-200">
            Join conversation rooms instantly with no login required. Connect with people around the world through voice, video, and text.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-700 delay-300">
            <Button 
              size="lg" 
              onClick={handleExploreRooms}
              className="group btn-transition"
            >
              Explore Rooms
              <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleCreateRoom}
              className="btn-transition"
            >
              Create Room
            </Button>
          </div>
        </section>
        
        <section className="mb-20 animate-in slide-in-from-bottom duration-700 delay-400">
          <h3 className="text-2xl font-bold text-center mb-10">Featured Rooms</h3>
          <FeaturedRooms />
        </section>
        
        <section className="max-w-6xl mx-auto animate-in slide-in-from-bottom duration-700 delay-500">
          <h3 className="text-2xl font-bold text-center mb-10">Why EchoSpace?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card/50 glass-effect p-6 rounded-xl border border-border card-hover"
              >
                <div className="mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center btn-transition">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} EchoSpace. No cookies, no tracking, no accounts.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors btn-transition">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors btn-transition">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors btn-transition">
              About
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}