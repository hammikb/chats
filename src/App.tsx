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

interface UserProfile {
  username: string;
  profilePicture?: string;
  twitter?: string;
}

const App: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    profilePicture: '',
    twitter: '',
  });
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession(); // No arguments needed
  
      if (error) {
        console.error('Error getting session:', error.message);
      } else if (data.session) {
        console.log('Session active. User ID:', data.session.user.id); // Access session.user.id
      } else {
        console.log('No active session.');
      }
    };
  
    checkSession();
  }, []);
  
  
  
  
  useEffect(() => {
    if (connected && publicKey && !profileCreated) {
      console.log('Wallet connected with public key:', publicKey.toString());
      checkOrCreateUserProfile(); // Call without arguments
    } else if (!connected) {
      console.log('No wallet connected.');
    }
  }, [connected, publicKey]);
  

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserProfile(); // Remove the argument
    }
  }, [connected, publicKey]);
  

  const checkOrCreateUserProfile = async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session) {
      console.error('User not authenticated');
      return;
    }
  
    const userId = data.session.user.id; // Correctly access user ID from session
  
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', userId)
        .single();
  
      if (error && error.code === 'PGRST116') {
        console.log('No profile found. Creating a new profile...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            wallet_address: userId,
            username: `user_${userId.slice(0, 6)}`,
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
        console.log('Profile already exists:', profileData);
        setProfileCreated(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  

  const fetchUserProfile = async () => {
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user; // Extract the user object
  
    if (authError || !user) {
      console.error('User not authenticated');
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', user.id) // Use user.id correctly
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
  const updateUserProfile = async (
    updatedProfile: { username: string; twitter: string },
    file?: File
  ) => {
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user; // Extract the user object
  
    if (authError || !user) {
      console.error('User not authenticated');
      return;
    }
  
    try {
      let profilePictureUrl = userProfile.profilePicture; // Keep existing picture if no new file is uploaded
  
      // Handle file upload if a new file is provided
      if (file) {
        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(`public/${user.id}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
  
        if (uploadError) {
          console.error('Error uploading profile picture:', uploadError.message);
          return;
        }
  
        // Get the public URL of the uploaded file
        const { publicUrl } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(data.path).data;
  
        profilePictureUrl = publicUrl;
      }
  
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: updatedProfile.username,
          twitter: updatedProfile.twitter,
          profilePicture: profilePictureUrl,
        })
        .eq('wallet_address', user.id); // Use user.id correctly
  
      if (error) {
        console.error('Error updating profile:', error.message);
      } else {
        setUserProfile((prev) => ({ ...prev, ...updatedProfile, profilePicture: profilePictureUrl }));
        console.log('Profile updated successfully.');
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
