import { supabase } from '../src/services/supabase';

export const sendMessage = async (
  roomId: string,
  senderId: string,
  content: string,
  mediaUrl: string | null = null
): Promise<void> => {
  const { error } = await supabase.from('messages').insert([
    {
      room_id: roomId,
      sender_id: senderId,
      content: content,
      media_url: mediaUrl,
    },
  ]);

  if (error) {
    console.error('Error sending message:', error);
  }
};
