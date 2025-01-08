// src/routes/Profiles.tsx
import React from 'react';
import ProfileList from '../Profiles/ProfileList';

const Profiles: React.FC = () => {
  return (
    <div>
      <h2>User Profiles</h2>
      <ProfileList />
    </div>
  );
};

export default Profiles;
