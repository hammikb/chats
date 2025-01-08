import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './Sidebar.css';

interface SidebarProps {
  onSelectChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat }) => {
  const wallet = useWallet();

  const chats = [
    { id: '1', name: 'General' },
    { id: '2', name: 'Project Discussion' },
    { id: '3', name: 'Private Chat with Alice' },
  ];

  return (
    <div className="sidebar">
      <div className="profile-section">
        {wallet.connected ? (
          <>
            <img
              src="https://via.placeholder.com/50"
              alt="User"
              className="profile-picture"
            />
            <div className="profile-info">
              <h3>{wallet.publicKey?.toString().slice(0, 8)}...</h3>
              <p>Status: Online</p>
            </div>
          </>
        ) : (
          <p>Please connect your wallet</p>
        )}
        <WalletMultiButton />
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="chat-item"
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
