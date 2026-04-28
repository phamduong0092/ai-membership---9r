
import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const { login } = useAppContext();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onLoginSuccess();
    } else {
      showToast('Mật khẩu không chính xác.', 'error');
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Đăng nhập Quản trị">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500"
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;