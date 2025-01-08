// src/components/Groups/NewGroupForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

const NewGroupForm: React.FC = () => {
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    const { data, error } = await supabase
      .from('Groups')
      .insert([{ name: groupName }]);

    if (error) {
      console.error('Error creating group:', error);
    } else {
      console.log('Group created:', data);
      setGroupName(''); // Reset the form
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
