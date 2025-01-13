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
    if (connected && publicKey && !profileCreated) {
      console.log('Wallet connected with public key:', publicKey.toString());
      checkOrCreateUserProfile(); // Pass wallet address directly
    } else if (!connected) {
      console.log('No wallet connected.');
    }
  }, [connected, publicKey]);
  
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
    if (connected && publicKey) {
      fetchUserProfile(); // Remove the argument
    }
  }, [connected, publicKey]);
  

  const checkOrCreateUserProfile = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
  
    if (session && session.user) {
      const userId = session.user.id; // Use the authenticated user's UUID
  
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
  
        if (error && error.code === 'PGRST116') {
          console.log('No profile found. Creating a new profile...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId, // Store the UUID as the unique identifier
              wallet_address: publicKey?.toString(), // Store the wallet address
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
    } else {
      console.error('User not authenticated');
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

  const updateUserProfile = async (updatedProfile: { username: string; twitter: string }, file?: File) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
  
    if (session && session.user) {
      const userId = session.user.id; // Define userId correctly
      console.log('User ID:', userId);
  
      try {
        let profilePictureUrl = userProfile.profilePicture;
  
        if (file) {
          const { data, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(`public/${userId}`, file, {
              cacheControl: '3600',
              upsert: true,
            });
        
          if (uploadError) {
            console.error('Error uploading profile picture:', uploadError.message);
            return;
          }
        
          // Retrieve public URL of the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(data.path) as { data: { publicUrl: string } };
        
          const profilePictureUrl = publicUrlData.publicUrl;
        
          // Use profilePictureUrl when updating the profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              username: updatedProfile.username,
              twitter: updatedProfile.twitter,
              profilePicture: profilePictureUrl, // Include profile picture URL
            })
            .eq('wallet_address', userId);
        
          if (updateError) {
            console.error('Error updating profile:', updateError.message);
          } else {
            console.log('Profile updated successfully.');
          }
        }
        
        
  
        const { error } = await supabase
          .from('profiles')
          .update({
            username: updatedProfile.username,
            twitter: updatedProfile.twitter,
            profilePicture: profilePictureUrl,
          })
          .eq('wallet_address', userId);
  
        if (error) {
          console.error('Error updating profile:', error.message);
        } else {
          console.log('Profile updated successfully.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    } else {
      console.error('User not authenticated');
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
