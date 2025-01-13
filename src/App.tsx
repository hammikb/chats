// src/App.tsx

import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink
} from 'react-router-dom';

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
  const { publicKey, connected, signMessage } = useWallet();

  // For your SettingsModal, storing user profile, etc.
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    profilePicture: '',
    twitter: '',
  });

  // Track whether we've tried creating/fetching a profile once
  // so we don't call signInWithWallet repeatedly
  const [profileCreated] = useState(false);

  /**
   * 1) If wallet is connected and we haven't created/fetched a profile yet,
   *    call signInWithWallet to run server-side verification + user creation.
   */
  useEffect(() => {
    if (connected && publicKey && !profileCreated) {
      signInWithWallet().catch((err) => {
        console.error('Sign-in with wallet failed:', err);
      });
    }
  }, [connected, publicKey, profileCreated]);

  /**
   * 2) Checks if there's an active Supabase session (optional).
   *    If none, you'll see "No active session." in the console.
   */
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
      } else if (data.session) {
        console.log('Session active. User ID:', data.session.user.id);
      } else {
        console.log('No active session.');
      }
    };
    checkSession();
  }, []);

  /**
   * 3) If we do have a profile, or once we confirm user is logged in,
   *    fetch user profile data from your 'profiles' table. 
   *    (Up to you if you keep this or handle differently.)
   */
  useEffect(() => {
    if (profileCreated) {
      fetchUserProfile();
    }
  }, [profileCreated]);

  /**
   * signInWithWallet: 
   * - Generate a nonce
   * - Use `signMessage` from the wallet
   * - POST (publicKey, signature, nonce) to your Edge Function
   * - The server verifies signature and (optionally) returns a magic link or token
   */
  
  const signInWithWallet = async () => {
      // TypeScript complains if you call signMessage(publicKey) without checking they exist.
  if (!publicKey) {
    console.error("No public key. Are you sure the wallet is connected?");
    return;
  }
  if (!signMessage) {
    console.error("Wallet does not support signMessage or is not connected.");
    return;
  }

  const nonce = crypto.randomUUID();
  const message = new TextEncoder().encode(nonce);

  // Now TypeScript knows signMessage is defined.
  const signature = await signMessage(message);
  console.log("Got signature:", signature);
    const res = await fetch('https://kadthcrteezwmbdywsbi.supabase.co/functions/v1/verify-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: Array.from(publicKey.toBytes()),
        signature: Array.from(signature),
        nonce
      })
    });
    
    const data = await res.json();
    if (!res.ok) {
      console.error('Edge Function error:', data.error);
      return;
    }
    
    // Save the token
    localStorage.setItem('myAuthToken', data.token);
  };
  

  /**
   * fetchUserProfile:
   *    - Attempts to load user data from your 'profiles' table if there's a session.
   */
  const fetchUserProfile = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      console.error('User not authenticated in Supabase');
      return;
    }

    try {
      // If your 'profiles' table has id = supabase user.id
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id) 
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
      } else if (profile) {
        setUserProfile(profile);
        console.log('Fetched user profile:', profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  /**
   * updateUserProfile:
   *    - Example method if you want to allow editing username/twitter, etc.
   */
  const updateUserProfile = async (
    updatedProfile: { username: string; twitter: string },
    file?: File
  ) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (session && session.user) {
      const userId = session.user.id;
      console.log('User ID:', userId);

      try {
        let profilePictureUrl = userProfile.profilePicture;

        if (file) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(`public/${userId}`, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Error uploading profile picture:', uploadError.message);
            return;
          }

          // Retrieve public URL
          const { data: publicUrlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(uploadData.path) as { data: { publicUrl: string } };

          profilePictureUrl = publicUrlData.publicUrl;
        }

        // Update 'profiles' row
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            username: updatedProfile.username,
            twitter: updatedProfile.twitter,
            profilePicture: profilePictureUrl,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating profile:', updateError.message);
        } else {
          console.log('Profile updated successfully.');
          // Optionally re-fetch
          await fetchUserProfile();
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  // Modal State
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
                <NavLink
                  to="/group-messaging"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
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
