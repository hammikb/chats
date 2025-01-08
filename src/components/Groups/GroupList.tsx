// src/components/Groups/GroupList.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface Group {
  id: string;
  name: string;
}

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name');

      if (error) {
        console.error('Error fetching groups:', error);
      } else {
        setGroups(data);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="group-list">
      <h2>Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
