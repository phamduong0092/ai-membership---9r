
import React from 'react';
import Modal from './Modal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông báo">
      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
        {message}
      </div>
    </Modal>
  );
};

export default NotificationModal;
