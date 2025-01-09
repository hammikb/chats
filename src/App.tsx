import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Home from './components/routes/Home';
import Profiles from './components/routes/Profiles';
import GroupMessaging from './components/routes/GroupMessaging';
import GroupChatRoom from './components/routes/GroupChatRoom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from './services/supabase';
import './App.css';

const App: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    if (connected && publicKey && !profileCreated) {
      console.log('Wallet connected with public key:', publicKey.toString());
      checkOrCreateUserProfile(publicKey.toString());
    } else if (!connected) {
      console.log('No wallet connected.');
    }
  }, [connected, publicKey]);
  

  const checkOrCreateUserProfile = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();
  
      if (error && error.code === 'PGRST116') {
        console.log('No profile found. Creating a new profile...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            wallet_address: walletAddress,
            username: `user_${walletAddress.slice(0, 6)}`,
            created_at: new Date().toISOString(),
          });
  
        if (insertError) {
          if (insertError.code === '23505' || insertError.code === '409') {
            console.warn('Profile already exists or duplicate key conflict.');
          } else {
            console.error('Error creating profile:', insertError.message);
          }
        } else {
          console.log('Profile created successfully.');
          setProfileCreated(true); // Prevent further attempts
        }
      } else if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        console.log('Profile already exists:', data);
        setProfileCreated(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  

  return (
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
          <WalletMultiButton /> {/* This button handles wallet connection */}
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
  );
};

export default App;
