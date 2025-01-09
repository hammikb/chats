// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase }from '../services/supabase';

export const useAuth = () => {
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      const signInUser = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', publicKey.toString());

        if (error) {
          console.error('Error fetching user:', error);
        }

        if (data && data.length === 0) {
          // If user doesn't exist, insert a new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: publicKey.toString(), username: publicKey.toString() }]);

          if (insertError) {
            console.error('Error creating user:', insertError);
          }
        }
      };

      signInUser();
    }
  }, [publicKey]);
};
