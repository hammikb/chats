import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-modal';
import './SettingsModal.css';

Modal.setAppElement('#root');

interface SettingsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  userProfile: any;
  updateUserProfile: (updatedProfile: any, file?: File) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onRequestClose,
  userProfile,
  updateUserProfile,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState(userProfile.username || '');
  const [twitter, setTwitter] = useState(userProfile.twitter || '');
  const [file, setFile] = useState<File | null>(null); // State for the uploaded file

  const handleOverlayClick = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onRequestClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOverlayClick);
    } else {
      document.removeEventListener('mousedown', handleOverlayClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOverlayClick);
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Pass the updated profile and file (if selected) to the update function
    updateUserProfile({ username, twitter }, file || undefined); // Convert null to undefined
    onRequestClose();
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    setUsername(userProfile.username || '');
    setTwitter(userProfile.twitter || '');
  }, [userProfile]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="User Settings"
      className="settings-modal"
      overlayClassName="settings-modal-overlay"
      shouldCloseOnOverlayClick={false}
    >
      <div ref={modalRef} className="settings-modal-content">
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
            Profile Picture:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          <label>
            Twitter:
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://twitter.com/yourhandle"
            />
          </label>
          <button type="submit">Save</button>
        </form>
      </div>
    </Modal>
  );
};

export default SettingsModal;
