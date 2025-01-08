// src/components/Profiles/ProfileCard.tsx
import React from 'react';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

interface Props {
  profile: Profile;
}

const ProfileCard: React.FC<Props> = ({ profile }) => {
  return (
    <div className="profile-card">
      <img src={profile.avatar_url || '/default-avatar.png'} alt={profile.username} />
      <h3>{profile.username}</h3>
    </div>
  );
};

export default ProfileCard;
