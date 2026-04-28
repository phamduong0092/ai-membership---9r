
import React from 'react';
import Modal from './Modal';
import { PaymentInfoType } from '../contexts/AppContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentInfo?: PaymentInfoType;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, paymentInfo }) => {
  if (!isOpen || !paymentInfo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán / Mời cafe">
      <div className="space-y-4 text-gray-300">
        <p>Cảm ơn bạn đã quan tâm và ủng hộ! Sự đóng góp của bạn là động lực lớn để tôi tiếp tục phát triển các ứng dụng hữu ích.</p>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-3">
                {paymentInfo.bankName && (
                    <div>
                        <p className="text-sm text-gray-400">Ngân hàng</p>
                        <p className="font-semibold text-white">{paymentInfo.bankName}</p>
                    </div>
                )}
                {paymentInfo.accountName && (
                    <div>
                        <p className="text-sm text-gray-400">Chủ tài khoản</p>
                        <p className="font-semibold text-white">{paymentInfo.accountName}</p>
                    </div>
                )}
                {paymentInfo.accountNumber && (
                     <div>
                        <p className="text-sm text-gray-400">Số tài khoản</p>
                        <p className="font-semibold text-sky-400 text-lg tracking-wider">{paymentInfo.accountNumber}</p>
                    </div>
                )}
            </div>
            {paymentInfo.qrCodeUrl && (
                <div className="flex-shrink-0">
                    <img 
                        src={paymentInfo.qrCodeUrl} 
                        alt="Mã QR thanh toán" 
                        className="w-40 h-40 rounded-lg border-2 border-gray-600 object-cover"
                    />
                </div>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
