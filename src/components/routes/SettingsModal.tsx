import React, { useState } from 'react';
import Modal from 'react-modal';
import './SettingsModal.css';

Modal.setAppElement('#root');

interface SettingsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  userProfile: {
    username?: string;
    profilePicture?: string;
    socialLinks?: string;
  };
  updateUserProfile: (updatedProfile: { username: string; profilePicture: string; socialLinks: string }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onRequestClose, userProfile, updateUserProfile }) => {
  const [username, setUsername] = useState(userProfile.username || '');
  const [profilePicture, setProfilePicture] = useState(userProfile.profilePicture || '');
  const [socialLinks, setSocialLinks] = useState(userProfile.socialLinks || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateUserProfile({ username, profilePicture, socialLinks });
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="User Settings"
      className="settings-modal"
      overlayClassName="settings-modal-overlay"
    >
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Profile Picture URL:
          <input
            type="text"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
          />
        </label>
        <label>
          Social Links:
          <input
            type="text"
            value={socialLinks}
            onChange={(e) => setSocialLinks(e.target.value)}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </Modal>
  );
};

export default SettingsModal;
