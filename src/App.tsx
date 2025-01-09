import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Home from './components/routes/Home';
import GroupMessaging from './components/routes/GroupMessaging';
import GroupChatRoom from './components/routes/GroupChatRoom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from './services/supabase';
import SettingsModal from './components/routes/SettingsModal';
import { FaCog } from 'react-icons/fa';

import './App.css';

const App: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    if (connected && publicKey && !profileCreated) {
      console.log('Wallet connected with public key:', publicKey.toString());
      checkOrCreateUserProfile(publicKey.toString());
    } else if (!connected) {
      console.log('No wallet connected.');
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserProfile(publicKey.toString());
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
          console.error('Error creating profile:', insertError.message);
        } else {
          console.log('Profile created successfully.');
          setProfileCreated(true);
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

  const fetchUserProfile = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const updateUserProfile = async (updatedProfile: { username: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: updatedProfile.username })
        .eq('wallet_address', publicKey?.toString());
  
      if (error) {
        console.error('Error updating profile:', error.message);
      } else {
        console.log('Profile updated successfully.');
        setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <Router>
      <div className="app-layout">
        <aside className="side-nav">
          <h1 className="app-title">Solana Chat</h1>
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/group-messaging" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Group Messaging
                </NavLink>
              </li>
            </ul>
          </nav> 
          <div className="wallet-button-container">
          <button onClick={openSettingsModal} className="settings-button">
              <FaCog size={24} />
            </button>
            <WalletMultiButton />
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group-messaging" element={<GroupMessaging />} />
            <Route path="/group-messaging/:groupId" element={<GroupChatRoom />} />
          </Routes>
        </main>

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onRequestClose={closeSettingsModal}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      </div>
    </Router>
  );
};

export default App;
