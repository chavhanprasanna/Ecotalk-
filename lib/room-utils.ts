import { v4 as uuidv4 } from 'uuid';

// Types
export interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  languages: string[];
  maxParticipants: number;
  isPrivate: boolean;
  createdAt: string;
  createdBy: string;
  participants: string[]; // Array of user IDs
  settings: {
    requireAuth: boolean;
    allowScreenSharing: boolean;
    allowRecording: boolean;
    moderatorOnlyStart: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isModerator: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
}

/**
 * Creates a new room with default settings
 */
export const createRoom = (options: {
  name: string;
  description: string;
  category: string;
  languages: string[];
  maxParticipants: number;
  isPrivate: boolean;
  createdBy: string;
}): Room => {
  return {
    id: uuidv4(),
    name: options.name,
    description: options.description,
    category: options.category,
    languages: options.languages,
    maxParticipants: options.maxParticipants,
    isPrivate: options.isPrivate,
    createdAt: new Date().toISOString(),
    createdBy: options.createdBy,
    participants: [options.createdBy],
    settings: {
      requireAuth: false,
      allowScreenSharing: true,
      allowRecording: false,
      moderatorOnlyStart: false,
    },
  };
};

/**
 * Validates room data before creation
 */
export const validateRoomData = (data: Partial<Room>): { valid: boolean; error?: string } => {
  if (!data.name || data.name.trim().length < 3) {
    return { valid: false, error: 'Room name must be at least 3 characters long' };
  }
  
  if (data.name.length > 50) {
    return { valid: false, error: 'Room name cannot exceed 50 characters' };
  }
  
  if (data.description && data.description.length > 500) {
    return { valid: false, error: 'Description cannot exceed 500 characters' };
  }
  
  if (data.maxParticipants && (data.maxParticipants < 2 || data.maxParticipants > 50)) {
    return { valid: false, error: 'Maximum participants must be between 2 and 50' };
  }
  
  if (data.languages && (!Array.isArray(data.languages) || data.languages.length === 0)) {
    return { valid: false, error: 'At least one language must be selected' };
  }
  
  return { valid: true };
};

/**
 * Checks if a user can join a room
 */
export const canJoinRoom = (room: Room, userId: string): { canJoin: boolean; reason?: string } => {
  // Check if room is full
  if (room.participants.length >= room.maxParticipants && !room.participants.includes(userId)) {
    return { canJoin: false, reason: 'Room is full' };
  }
  
  // Add more checks here (e.g., private room, banned users, etc.)
  
  return { canJoin: true };
};

/**
 * Adds a user to a room
 */
export const addUserToRoom = (room: Room, userId: string): Room => {
  if (room.participants.includes(userId)) {
    return room; // User already in room
  }
  
  return {
    ...room,
    participants: [...room.participants, userId],
  };
};

/**
 * Removes a user from a room
 */
export const removeUserFromRoom = (room: Room, userId: string): Room => {
  return {
    ...room,
    participants: room.participants.filter(id => id !== userId),
  };
};

/**
 * Updates room settings
 */
export const updateRoomSettings = (
  room: Room,
  updates: Partial<Room['settings']>,
  isModerator: boolean
): { room: Room; success: boolean; error?: string } => {
  // Only moderators can change settings
  if (!isModerator) {
    return { room, success: false, error: 'Only moderators can change room settings' };
  }
  
  return {
    room: {
      ...room,
      settings: {
        ...room.settings,
        ...updates,
      },
    },
    success: true,
  };
};

/**
 * Generates a room invite link
 */
export const generateInviteLink = (roomId: string, baseUrl: string): string => {
  return `${baseUrl}/join/${roomId}`;
};

/**
 * Formats room data for display
 */
export const formatRoomData = (room: Room) => {
  return {
    id: room.id,
    name: room.name,
    description: room.description,
    category: room.category,
    languages: room.languages,
    participants: room.participants.length,
    maxParticipants: room.maxParticipants,
    isPrivate: room.isPrivate,
    createdAt: room.createdAt,
  };
};

/**
 * Filters rooms based on search criteria
 */
export const filterRooms = (
  rooms: Room[],
  filters: {
    searchQuery?: string;
    category?: string;
    language?: string;
    onlyPublic?: boolean;
    onlyJoinable?: boolean;
  }
): Room[] => {
  return rooms.filter(room => {
    // Filter by search query
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        room.name.toLowerCase().includes(searchLower) ||
        room.description?.toLowerCase().includes(searchLower) ||
        room.category.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Filter by category
    if (filters.category && room.category !== filters.category) {
      return false;
    }
    
    // Filter by language
    if (filters.language && !room.languages.includes(filters.language)) {
      return false;
    }
    
    // Filter by privacy
    if (filters.onlyPublic && room.isPrivate) {
      return false;
    }
    
    // Filter by joinable status
    if (filters.onlyJoinable && room.participants.length >= room.maxParticipants) {
      return false;
    }
    
    return true;
  });
};
