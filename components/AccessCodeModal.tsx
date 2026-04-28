
import React from 'react';
import Modal from './Modal';
import { EXTERNAL_LINK_ICON } from '../constants';
import { useToast } from '../contexts/ToastContext';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessCode: string;
  appUrl: string;
  appName: string;
}

const AccessCodeModal: React.FC<AccessCodeModalProps> = ({ isOpen, onClose, accessCode, appUrl, appName }) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleOpenApp = () => {
    // Tạm ẩn tính năng tự động copy để buộc user lấy mã từ admin
    // navigator.clipboard.writeText(accessCode);
    showToast('Đang mở ứng dụng...', 'success');
    
    setTimeout(() => {
        window.open(appUrl, '_blank');
        onClose(); // Đóng modal sau khi mở
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Truy cập ứng dụng">
      <div className="text-center space-y-6">
        <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
            <h3 className="text-xl font-bold text-sky-400 mb-4">{appName}</h3>
            
            <div className="flex flex-col items-center justify-center py-6">
                 {/* Biểu tượng Khóa an toàn */}
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2">Thủ tục truy cập</h4>
                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Bạn đang chuyển hướng tới ứng dụng <strong>{appName}</strong>.
                    <br/>
                    Vui lòng sử dụng mã truy cập được cấp từ <strong>Người sản xuất</strong> để tiếp tục.
                </p>
            </div>
        </div>

        <button
          onClick={handleOpenApp}
          className="w-full bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Mở Ứng dụng</span>
          {EXTERNAL_LINK_ICON}
        </button>
      </div>
    </Modal>
  );
};

export default AccessCodeModal;
