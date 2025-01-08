// src/components/Groups/NewGroupForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

const NewGroupForm: React.FC = () => {
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('groups') // Ensure this matches your table name
        .insert([{ name: groupName }]);
  
      if (error) {
        console.error('Error creating group:', error);
        alert(`Error: ${error.message}`);
      } else {
        console.log('Group created:', data);
        setGroupName(''); // Reset the form
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error occurred while creating the group.');
    }
  };

  return (
    <div className="new-group-form">
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group Name"
      />
      <button onClick={handleCreateGroup}>Create Group</button>
    </div>
  );
};

export default NewGroupForm;
