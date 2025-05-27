import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate random avatar URL from Dicebear
export function generateRandomAvatar(seed: string, style: string = 'personas') {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

// Function to generate random nickname
export function generateRandomName(): string {
  const adjectives = [
    'Happy', 'Sleepy', 'Grumpy', 'Sneezy', 'Dopey', 'Bashful', 'Doc',
    'Witty', 'Clever', 'Swift', 'Brave', 'Mighty', 'Nimble', 'Wise',
    'Jolly', 'Lively', 'Calm', 'Eager', 'Gentle', 'Kind', 'Loyal',
    'Noble', 'Proud', 'Quiet', 'Sunny', 'Zesty'
  ];
  
  const nouns = [
    'Panda', 'Tiger', 'Lion', 'Eagle', 'Hawk', 'Wolf', 'Fox',
    'Dolphin', 'Whale', 'Shark', 'Octopus', 'Penguin', 'Koala',
    'Kangaroo', 'Monkey', 'Elephant', 'Giraffe', 'Zebra', 'Bear',
    'Owl', 'Rabbit', 'Dragon', 'Phoenix', 'Unicorn', 'Griffin'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${adjective}${noun}${number}`;
}

// Function to generate session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to get STUN/TURN servers configuration
export function getIceServers() {
  return {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
  };
}

// Function to format room category
export function formatRoomCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

// Function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}