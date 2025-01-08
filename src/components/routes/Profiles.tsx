// src/routes/Profiles.tsx
import React from 'react';
import ProfileList from '../Profiles/ProfileList';
import './Profiles.css';

const Profiles: React.FC = () => {
  return (
    <div className="profiles-container">
      <h2>User Profiles</h2>
      <ProfileList />
    </div>
  );
};

export default Profiles;
