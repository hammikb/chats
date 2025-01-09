
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes , NavLink} from 'react-router-dom';
import Home from './components/routes/Home';   
import Profiles from './components/routes/Profiles';
import GroupMessaging from './components/routes/GroupMessaging';
import GroupChatRoom from './components/routes/GroupChatRoom';
import { WalletConnectionProvider } from './services/WalletProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from './hooks/useAuth';

import './App.css';

const App: React.FC = () => {
  useAuth(); // Initialize wallet authentication

  return (
    <WalletConnectionProvider>
      <Router>
        <div className="app-container">
          <header className="navbar">
            <h1 className="app-title">Solana Chat</h1>
            <nav>
              <ul className="nav-links">
                <li>
                  <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profiles" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Profiles
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/group-messaging" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Group Messaging
                  </NavLink>
                </li>
              </ul>
            </nav>
            <WalletMultiButton />
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/group-messaging" element={<GroupMessaging />} />
              <Route path="/group-messaging/:groupId" element={<GroupChatRoom />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletConnectionProvider>
  );
};

export default App;