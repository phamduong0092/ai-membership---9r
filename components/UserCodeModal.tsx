
import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

interface UserCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UserCodeModal: React.FC<UserCodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Thay đổi: Khởi tạo state là '9r' thay vì rỗng
  const [code, setCode] = useState('9r');
  const { userCode } = useAppContext();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === userCode) {
      showToast('Xác thực thành công!', 'success');
      onSuccess();
    } else {
      showToast('Mã sử dụng không chính xác.', 'error');
    }
  };

  const handleClose = () => {
    // Reset lại về '9r' khi đóng modal
    setCode('9r');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yêu cầu Mã sử dụng">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="user-code-input" className="block text-sm font-medium text-gray-300 mb-2">
              Vui lòng nhập mã để tiếp tục.
            </label>
            <input
              id="user-code-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500"
          >
            Xác nhận
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserCodeModal;
