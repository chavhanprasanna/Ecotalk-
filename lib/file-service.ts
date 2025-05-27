import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  created_at: string;
  owner_id: string;
  is_public: boolean;
}

export const uploadFile = async (
  file: File,
  userId: string,
  isPublic: boolean = false
): Promise<FileMetadata | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Create file metadata in the database
    const fileData: Omit<FileMetadata, 'id' | 'created_at'> = {
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      owner_id: userId,
      is_public: isPublic,
    };

    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting file metadata:', error);
      return null;
    }

    return data as FileMetadata;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

export const getFiles = async (userId: string): Promise<FileMetadata[]> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return [];
    }

    return data as FileMetadata[];
  } catch (error) {
    console.error('Error in getFiles:', error);
    return [];
  }
};

export const shareFile = async (
  fileId: string,
  targetUserId: string,
  permission: 'read' | 'write' = 'read'
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('shared_files').insert({
      file_id: fileId,
      user_id: targetUserId,
      permission,
    });

    if (error) {
      console.error('Error sharing file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in shareFile:', error);
    return false;
  }
};

export const getSharedFiles = async (userId: string): Promise<FileMetadata[]> => {
  try {
    const { data, error } = await supabase
      .from('shared_files')
      .select('file_id, permission, files(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching shared files:', error);
      return [];
    }

    return data.map((item) => item.files) as FileMetadata[];
  } catch (error) {
    console.error('Error in getSharedFiles:', error);
    return [];
  }
};