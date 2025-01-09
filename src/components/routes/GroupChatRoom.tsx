// src/routes/GroupChatRoom.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useWallet } from '@solana/wallet-adapter-react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import './GroupChatRoom.css';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
}

const GroupChatRoom: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at, profiles(username)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
    
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
    
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        username: msg.profiles?.[0]?.username || 'Unknown',
      }));
    
      setMessages(formattedMessages);
      setLoading(false);
    };
    

    fetchMessages();

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMsg = payload.new as Message;
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !publicKey) return;
  
    try {
      // Step 1: Retrieve the user's UUID from Supabase using the wallet public key
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', publicKey.toString())
        .single(); // We expect only one profile to match, so we use .single()
  
      if (error) {
        console.error('Error fetching user ID:', error);
        return;
      }
  
      const userId = data?.id; // Retrieve the UUID from the query result
  
      if (!userId) {
        console.error('User ID not found for the connected wallet.');
        return;
      }
  
      // Step 2: Insert the message into the messages table with the retrieved user ID
      const { error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            group_id: groupId,
            content: newMessage,
            user_id: userId, // Use the retrieved UUID as user_id
          },
        ]);
  
      if (insertError) {
        console.error('Error sending message:', insertError);
      } else {
        setNewMessage(''); // Clear the input after sending
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  

  return (
    <div className="group-chat-room">
      <h2>Group Chat Room</h2>
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="messages">
          {messages.length === 0 ? (
            <p>No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.user_id === publicKey?.toString() ? 'sent' : 'received'
                }`}
              >
                <strong>{msg.username}</strong>: {msg.content}
                <span className="timestamp">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
      <div className="input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
  
};

export default GroupChatRoom;
