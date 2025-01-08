// src/components/Groups/GroupChat.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface Message {
  id: string;
  content: string;
  username: string;
  created_at: string;
}

const GroupChat: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('Messages')
        .select('id, content, created_at, profiles(username)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
  
      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        // Map the fetched data to match the Message interface
        const formattedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          username: msg.profiles[0]?.username || 'Unknown', // Extract username
        }));
        setMessages(formattedMessages);
      }
    };
  
    fetchMessages();
  }, [groupId]);
  

  const handleSendMessage = async () => {
    const { error } = await supabase
      .from('Messages')
      .insert([{ group_id: groupId, content: newMessage }]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="group-chat">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default GroupChat;
