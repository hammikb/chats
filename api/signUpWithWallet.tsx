import { WalletContextState } from '@solana/wallet-adapter-react';
import { supabase } from '../src/services/supabase';

export const signUpWithWallet = async (wallet: WalletContextState) => {
  if (!wallet.connected || !wallet.publicKey) {
    console.log('Wallet not connected or publicKey missing');
    alert('Please connect your wallet first.');
    return;
  }

  const walletAddress = wallet.publicKey.toString();
  console.log('Signing up user with wallet address:', walletAddress);

  // Check if the user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user:', fetchError);
    return;
  }

  if (existingUser) {
    alert('User already signed up.');
    return;
  }

  // Generate a random UUID for the user_id
  const userId = crypto.randomUUID();

  // Insert the new user profile
  const { error: insertError } = await supabase.from('profiles').insert([
    {
      user_id: userId, // Internal unique ID
      wallet_address: walletAddress, // Solana wallet address
      display_name: `User ${walletAddress.slice(0, 6)}`,
      bio: 'This is a Solana wallet user.',
    },
  ]);

  if (insertError) {
    console.error('Error adding profile:', insertError);
    alert('Failed to sign up.');
  } else {
    alert('Sign-up successful!');
  }
};
