import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainChatArea from './components/MainChatArea';
import './App.css'; // Import the main CSS for basic styling

const App: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="app-layout">
      <Sidebar onSelectChat={setSelectedChat} />
      <MainChatArea selectedChat={selectedChat} />
    </div>
  );
};

export default App;
