import { supabase } from '../src/services/supabase';

interface Profile {
  user_id: string;
  wallet_address: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
}

// Fetch user profile by user_id
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};
