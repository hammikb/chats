import { supabase } from '../src/services/supabase';

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string | null;
  content: string;
  media_url: string | null;
  created_at: string;
  room_id: string;
}

// Fetch all messages for a given room
export const fetchMessages = async (roomId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(*)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data;
};
