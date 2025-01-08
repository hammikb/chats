// src/routes/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Solana Chat</h1>
      <nav>
        <ul>
          <li><Link to="/profiles">Profiles</Link></li>
          <li><Link to="/group-messaging">Group Messaging</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
