import React from 'react';
import './MainChatArea.css';

interface MainChatAreaProps {
  selectedChat: string | null;
}

const MainChatArea: React.FC<MainChatAreaProps> = ({ selectedChat }) => {
  return (
    <div className="main-chat-area">
      <div className="chat-header">
        <h2>{selectedChat ? `Chat: ${selectedChat}` : 'Select a Chat'}</h2>
      </div>
      <div className="messages-section">
        {selectedChat ? (
          <p>Messages will appear here for chat {selectedChat}.</p>
        ) : (
          <p>Please select a chat to start messaging.</p>
        )}
      </div>
      <div className="message-input-section">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  );
};

export default MainChatArea;
