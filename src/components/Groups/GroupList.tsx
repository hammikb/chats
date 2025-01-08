// src/components/Groups/GroupList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface Group {
  id: string;
  name: string;
}

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('groups').select('id, name');
      if (error) {
        console.error('Error fetching groups:', error);
      } else {
        setGroups(data);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId: string) => {
    navigate(`/group-messaging/${groupId}`); // Navigate to the group's chat room
  };

  return (
    <div className="group-list">
      <h3>Your Groups</h3>
      <ul>
        {groups.map((group) => (
          <li key={group.id} onClick={() => handleGroupClick(group.id)}>
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
