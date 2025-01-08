// src/routes/GroupChatRoom.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { RealtimePostgresChangesPayload, User } from '@supabase/supabase-js';
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
  const [user, setUser] = useState<User | null>(null);

    // Fetch authenticated user
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user);
      }
    };

    fetchUser();

    // Fetch initial messages
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
        username: msg.profiles[0]?.username || 'Unknown',
      }));

      setMessages(formattedMessages);
      setLoading(false);
    };

    fetchMessages();

    useEffect(() => {
      const channel = supabase
        .channel(`group-messages-${groupId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
          (payload: RealtimePostgresChangesPayload<Message>) => {
            const newMsg = payload.new as Message; // Explicitly cast payload.new to Message
            if (newMsg && newMsg.id && newMsg.user_id && newMsg.content && newMsg.created_at) {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  id: newMsg.id,
                  user_id: newMsg.user_id,
                  content: newMsg.content,
                  created_at: newMsg.created_at,
                  username: newMsg.username || 'Unknown',
                },
              ]);
            }
          }
        )
        .subscribe();
    
      // Clean up subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }, [groupId]);
    

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ group_id: groupId, content: newMessage }]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage(''); // Clear the input after sending
    }
  };

  return (
    <div className="group-chat-room">
      <h2>Group Chat Room</h2>
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.user_id === user?.id ? 'sent' : 'received'
              }`}
            >
              <strong>{msg.username}</strong>: {msg.content}
              <span className="timestamp">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
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
