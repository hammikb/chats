import { useEffect } from 'react';
import { supabase } from '../src/services/supabase';

const useMessageSubscription = (roomId: string, handleNewMessage: (message: any) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          handleNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, handleNewMessage]);
};

export default useMessageSubscription;