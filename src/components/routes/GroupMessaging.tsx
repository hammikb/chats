// src/routes/GroupMessaging.tsx
import React from 'react';
import NewGroupForm from '../Groups/NewGroupForm';
import GroupList from '../Groups/GroupList';
import './GroupMessaging.css';

const GroupMessaging: React.FC = () => {
  return (
    <div className="group-messaging-container">
      <h2>Group Messaging</h2>
      <NewGroupForm />
      <GroupList />
    </div>
  );
};

export default GroupMessaging;
