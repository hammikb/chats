// src/components/Profiles/ProfileList.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import ProfileCard from './ProfileCard';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

const ProfileList: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url');

      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        setProfiles(data);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="profile-list">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
};

export default ProfileList;
