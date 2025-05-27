'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Categories and languages
const categories = ['Education', 'Entertainment', 'Gaming', 'Technology', 'Health', 'Travel', 'Literature', 'Other'];
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese', 'Italian', 'Chinese', 'Russian'];

// Form schema
const createRoomSchema = z.object({
  name: z.string().min(3, {
    message: 'Room name must be at least 3 characters.',
  }).max(50, {
    message: 'Room name must not exceed 50 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }).max(200, {
    message: 'Description must not exceed 200 characters.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  languages: z.array(z.string()).min(1, {
    message: 'Please select at least one language.',
  }),
  maxParticipants: z.number().min(2, {
    message: 'Room must allow at least 2 participants.',
  }).max(20, {
    message: 'Room cannot exceed 20 participants for performance reasons.',
  }),
  isPrivate: z.boolean().default(false),
});

type CreateRoomValues = z.infer<typeof createRoomSchema>;

export default function CreateRoomPage() {
  const router = useRouter();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);

  const form = useForm<CreateRoomValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Entertainment',
      languages: ['English'],
      maxParticipants: 10,
      isPrivate: false,
    },
  });

  const onSubmit = (values: CreateRoomValues) => {
    console.log(values);
    
    // In a real application, we would send this to the server
    // For now, we'll just redirect to a mock room
    const mockRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${mockRoomId}`);
  };

  const handleAddLanguage = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      const newLanguages = [...selectedLanguages, language];
      setSelectedLanguages(newLanguages);
      form.setValue('languages', newLanguages);
    }
  };

  const handleRemoveLanguage = (language: string) => {
    const newLanguages = selectedLanguages.filter(l => l !== language);
    setSelectedLanguages(newLanguages);
    form.setValue('languages', newLanguages);
  };

  const handleBackToRooms = () => {
    router.push('/rooms');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-12">
      <div className="container mx-auto py-6 px-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleBackToRooms}
          className="flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <Card className="border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Create a New Room</CardTitle>
              <CardDescription>
                Set up your room details and invite others to join your conversation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Room" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is how your room will appear in the room list.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What will you talk about in this room?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Briefly describe your room to help others decide if they want to join.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Participants</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={2} 
                              max={20} 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of people who can join (2-20).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="languages"
                    render={() => (
                      <FormItem>
                        <FormLabel>Languages</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedLanguages.map(language => (
                            <div 
                              key={language}
                              className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                              {language}
                              <button 
                                type="button"
                                onClick={() => handleRemoveLanguage(language)}
                                className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <Select onValueChange={handleAddLanguage}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Add a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages
                              .filter(language => !selectedLanguages.includes(language))
                              .map(language => (
                                <SelectItem key={language} value={language}>
                                  {language}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the languages that will be spoken in your room.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Private Room</FormLabel>
                          <FormDescription>
                            If enabled, users will need a link to join your room.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Create Room</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}