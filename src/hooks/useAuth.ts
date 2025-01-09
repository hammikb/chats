// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      const signInUser = async () => {
        try {
          // Check if a profile exists for this wallet address
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('wallet_address', publicKey.toString());

          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }

          if (data.length === 0) {
            // Create a new profile with a generated UUID and wallet address
            const { error: insertError } = await supabase.from('profiles').insert([
              {
                wallet_address: publicKey.toString(),
                username: publicKey.toString().slice(0, 8), // Use part of the public key as the username
              },
            ]);

            if (insertError) {
              console.error('Error creating user profile:', insertError);
            } else {
              console.log('New user profile created:', publicKey.toString());
            }
          } else {
            console.log('User profile already exists:', publicKey.toString());
          }
        } catch (err) {
          console.error('Unexpected error during sign-in:', err);
        }
      };

      signInUser();
    }
  }, [publicKey]);
};
