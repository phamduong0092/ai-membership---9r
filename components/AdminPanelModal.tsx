
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useAppContext, AppType, PaymentInfoType, AdStrategyType } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { TRASH_ICON, PENCIL_ICON, DRAG_HANDLE_ICON, COPY_ICON } from '../constants';
import ConfirmationModal from './ConfirmationModal';
import { getClientSideAuthScript } from '../utils/authGenerator';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { 
    apps, userCode, adminPassword, notification, paymentInfo, adLinks, credits, maxCredits, adStrategy,
    hubLabel, telegramBotToken, telegramChatId,
    addApp, deleteApp, updateApp, logout, reorderApps, updateUserCode, updateAdminPassword,
    updateNotification, updatePaymentInfo, updateAdLinks, resetToDefaults,
    setCredits, setMaxCredits, setAdStrategy, updateTelegramConfig, sendTele
  } = useAppContext();
  const { showToast } = useToast();
  
  // App form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newMobileUrl, setNewMobileUrl] = useState(''); 
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTutorialUrl, setNewTutorialUrl] = useState('');
  const [newVideoTooltip, setNewVideoTooltip] = useState('');
  const [editingApp, setEditingApp] = useState<AppType | null>(null);

  // Other states
  const [currentUserCode, setCurrentUserCode] = useState(userCode);
  const [currentAdminPassword, setCurrentAdminPassword] = useState(adminPassword || '');
  const [currentNotification, setCurrentNotification] = useState(notification || '');
  const [currentPaymentInfo, setCurrentPaymentInfo] = useState<PaymentInfoType>(paymentInfo || { bankName: '', accountName: '', accountNumber: '', qrCodeUrl: ''});
  
  // Credit & Ads states
  const [currentAdLinksStr, setCurrentAdLinksStr] = useState('');
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [currentMaxCredits, setCurrentMaxCredits] = useState<number>(10);
  const [currentAdStrategy, setCurrentAdStrategy] = useState<AdStrategyType>('random');

  // Telegram Hub V4 states
  const [currentHubLabel, setCurrentHubLabel] = useState(hubLabel || '');
  const [currentTeleToken, setCurrentTeleToken] = useState(telegramBotToken || '');
  const [currentTeleChatId, setCurrentTeleChatId] = useState(telegramChatId || '');

  const [appToDelete, setAppToDelete] = useState<AppType | null>(null);
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Code Exporter State
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showCodeExporter, setShowCodeExporter] = useState<boolean>(false);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [exportMode, setExportMode] = useState<'backup' | 'childApp'>('backup');

  // Drag and Drop state
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  useEffect(() => {
    setCurrentUserCode(userCode);
    setCurrentAdminPassword(adminPassword || '');
    setCurrentNotification(notification || '');
    setCurrentPaymentInfo(paymentInfo || { bankName: '', accountName: '', accountNumber: '', qrCodeUrl: ''});
    setCurrentAdLinksStr(adLinks ? adLinks.join('\n') : '');
    
    // Sync credits and settings
    setCurrentCredits(credits || 0);
    setCurrentMaxCredits(maxCredits || 10);
    setCurrentAdStrategy(adStrategy || 'random');

    // Sync telegram
    setCurrentHubLabel(hubLabel || '');
    setCurrentTeleToken(telegramBotToken || '');
    setCurrentTeleChatId(telegramChatId || '');
  }, [userCode, adminPassword, notification, paymentInfo, adLinks, credits, maxCredits, adStrategy, hubLabel, telegramBotToken, telegramChatId, isOpen]);

  const resetForm = () => {
    setNewName('');
    setNewDesc('');
    setNewUrl('');
    setNewMobileUrl('');
    setNewImageUrl('');
    setNewTutorialUrl('');
    setNewVideoTooltip('');
  }

  useEffect(() => {
    if (editingApp) {
      setNewName(editingApp.name);
      setNewDesc(editingApp.description);
      setNewUrl(editingApp.url);
      setNewMobileUrl(editingApp.mobileUrl || '');
      setNewImageUrl(editingApp.imageUrl || '');
      setNewTutorialUrl(editingApp.tutorialUrl || '');
      setNewVideoTooltip(editingApp.videoTooltip || '');
    } else {
      resetForm();
    }
  }, [editingApp]);
  
  useEffect(() => {
    if (generatedCode && codeTextareaRef.current) {
        codeTextareaRef.current.select();
    }
  }, [generatedCode]);

  // Effect to generate code when selected app changes in Child App mode
  useEffect(() => {
    if (showCodeExporter && exportMode === 'childApp') {
        const codeString = getClientSideAuthScript();
        setGeneratedCode(codeString);
    }
  }, [showCodeExporter, exportMode]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) {
      showToast("Tên và URL không được để trống.", "error");
      return;
    }
    const isValidUrl = (url: string) => {
        if (!url) return true;
        try { new URL(url); return true; } catch { return false; }
    };

    if (!isValidUrl(newUrl) || !isValidUrl(newMobileUrl) || !isValidUrl(newImageUrl) || !isValidUrl(newTutorialUrl) || !isValidUrl(currentPaymentInfo.qrCodeUrl)) {
        showToast("Một trong các URL không hợp lệ.", "error");
        return;
    }
    
    const appData = { 
        name: newName, 
        description: newDesc, 
        url: newUrl, 
        mobileUrl: newMobileUrl,
        imageUrl: newImageUrl, 
        tutorialUrl: newTutorialUrl, 
        videoTooltip: newVideoTooltip
    };

    if (editingApp) {
      updateApp(editingApp.id, appData);
      showToast('Cập nhật thành công!', 'success');
      setEditingApp(null);
    } else {
      addApp(appData);
      showToast('Thêm thành công!', 'success');
      resetForm();
    }
  };
  
  const handleUserCodeUpdate = () => {
    updateUserCode(currentUserCode);
    showToast('Mã sử dụng đã được cập nhật!', 'success');
  };

  const handleAdminPassUpdate = () => {
    if (currentAdminPassword.length < 4) {
      showToast('Mật khẩu admin phải có ít nhất 4 ký tự.', 'error');
      return;
    }
    updateAdminPassword(currentAdminPassword);
    showToast('Mật khẩu admin đã được cập nhật!', 'success');
  };
  
  const handleNotificationUpdate = () => {
    updateNotification(currentNotification);
    showToast('Thông báo đã được cập nhật!', 'success');
  };

  const handlePaymentInfoUpdate = () => {
    updatePaymentInfo(currentPaymentInfo);
    showToast('Thông tin thanh toán đã được cập nhật!', 'success');
  };

  const handleAdSettingsUpdate = () => {
      // 1. Update Links
      const linksArray = currentAdLinksStr
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');
      updateAdLinks(linksArray);

      // 2. Update Credits
      setCredits(Number(currentCredits));
      setMaxCredits(Number(currentMaxCredits));
      setAdStrategy(currentAdStrategy);

      showToast(`Đã lưu cài đặt Quảng cáo & Credit!`, 'success');
  };

  const handleTeleConfigUpdate = () => {
    updateTelegramConfig({
      hubLabel: currentHubLabel,
      token: currentTeleToken,
      chatId: currentTeleChatId
    });
    showToast('Đã lưu cấu hình Telegram Tracking!', 'success');
  };

  const handleTestTele = async () => {
    if (!currentTeleToken || !currentTeleChatId) {
      showToast('Vui lòng điền đủ Token và Chat ID để test.', 'error');
      return;
    }
    await sendTele(`🔔 <b>TIN NHẮN THỬ NGHIỆM</b>\nKết nối tới hệ thống Hub V4 thành công!`);
    showToast('Đã gửi tin nhắn test tới Telegram!', 'info');
  };

  // --- Actions ---

  const handleCopyClick = (app: AppType) => {
    setNewName(app.name);
    setNewDesc(app.description);
    setNewUrl(app.url);
    setNewMobileUrl(app.mobileUrl || '');
    setNewImageUrl(app.imageUrl || '');
    setNewTutorialUrl(app.tutorialUrl || '');
    setNewVideoTooltip(app.videoTooltip || '');

    setEditingApp(null);
    setGeneratedCode(''); 

    showToast(`Đã sao chép thông tin của "${app.name}" vào form.`, 'info');
  };

  const handleEditClick = (app: AppType) => {
    setEditingApp(app);
    setGeneratedCode('');
  };

  const handleCancelEdit = () => {
    setEditingApp(null);
  }

  const handleDeleteClick = (app: AppType) => {
    setAppToDelete(app);
  }
  
  const handleConfirmDelete = () => {
    if (appToDelete) {
      deleteApp(appToDelete.id);
      showToast('Xóa thành công!', 'success');
      setAppToDelete(null);
    }
  };

  const handleLogoutClick = () => {
    logout();
    onLogout();
  }
  
  const handleResetDataClick = () => {
    setResetConfirmOpen(true);
  }

  const handleConfirmReset = () => {
    resetToDefaults();
  }

  const handleGenerateBackupCode = () => {
    setExportMode('backup');
    const dataToExport = {
      apps,
      userCode,
      adminPassword,
      notification,
      paymentInfo,
      adLinks,
      maxCredits,
      adStrategy,
      hubLabel,
      telegramBotToken,
      telegramChatId
    };
    const codeString = `const INITIAL_DATA = ${JSON.stringify(dataToExport, null, 2)};`;
    setGeneratedCode(codeString);
    showToast('Đã tạo code Backup! Sẵn sàng để sao chép.', 'success');
  };

  const handleGenerateChildAppCode = () => {
      setExportMode('childApp');
      const codeString = getClientSideAuthScript();
      setGeneratedCode(codeString);
      showToast('Đã tạo Code Đa Năng. Có thể dùng cho mọi App!', 'info');
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (index: number) => { setDragStartIndex(index); };
  const handleDragEnter = (index: number) => { setDragOverIndex(index); };
  const handleDragEnd = () => {
    if (dragStartIndex !== null && dragOverIndex !== null && dragStartIndex !== dragOverIndex) {
      reorderApps(dragStartIndex, dragOverIndex);
    }
    setDragStartIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Bảng điều khiển Admin" size="large">
        <div className="flex flex-col md:flex-row gap-6 max-h-[80vh] w-full">
          {/* --- Left Column (Form & Logout) --- */}
          <div className="w-full md:w-2/5 flex flex-col gap-4 overflow-y-auto pr-2">
            <form onSubmit={handleFormSubmit} className="space-y-4 p-4 bg-gray-900/50 rounded-md border border-gray-700">
              <h3 className="font-bold text-lg text-white">
                {editingApp ? 'Chỉnh sửa ứng dụng' : 'Thêm ứng dụng mới'}
              </h3>
              <input type="text" placeholder="Tên ứng dụng *" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" required />
              <textarea placeholder="Mô tả" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" rows={2} />
              <input type="url" placeholder="URL ứng dụng (Cho Máy tính) *" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" required />
              <input type="url" placeholder="URL Ảnh đại diện" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
              
              <div className="border-t border-gray-700 my-2 pt-2">
                <label className="text-xs text-gray-400 mb-1 block">Tùy chọn nâng cao</label>
                <input type="url" placeholder="URL Riêng cho Mobile (Tùy chọn)" value={newMobileUrl} onChange={(e) => setNewMobileUrl(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white mb-2" />
                <input type="url" placeholder="Link Video Hướng dẫn (YouTube)" value={newTutorialUrl} onChange={(e) => setNewTutorialUrl(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white mb-2" />
                <input type="text" placeholder="Tooltip cho Video" value={newVideoTooltip} onChange={(e) => setNewVideoTooltip(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
              </div>

              <div className="flex gap-2">
                {editingApp && (<button type="button" onClick={handleCancelEdit} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Hủy</button>)}
                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors">{editingApp ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>

            {/* CẤU HÌNH TELEGRAM HUB V4 */}
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-md border border-sky-500/30 border-l-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                   Telegram Tracking (V4)
                </h3>
                
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Nhãn Hub (Label)</label>
                    <input type="text" placeholder="VD: HUB VIDEO 9R" value={currentHubLabel} onChange={(e) => setCurrentHubLabel(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Bot Token (@BotFather)</label>
                    <input type="password" placeholder="Mã Token của Bot" value={currentTeleToken} onChange={(e) => setCurrentTeleToken(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Chat ID (Người nhận)</label>
                    <input type="text" placeholder="ID của bạn hoặc Group" value={currentTeleChatId} onChange={(e) => setCurrentTeleChatId(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <div className="flex gap-2">
                   <button onClick={handleTestTele} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-xs">Gửi Tin Thử</button>
                   <button onClick={handleTeleConfigUpdate} className="flex-[2] bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-xs">Lưu Cấu Hình Tele</button>
                </div>
            </div>
            
            {/* QUẢN LÝ QUẢNG CÁO & CREDIT */}
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-md border border-gray-700 border-l-4 border-l-emerald-500">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                   Quản lý Credit & QC
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                   <div>
                       <label className="text-xs text-gray-400 mb-1 block">Credit Hiện tại</label>
                       <input type="number" value={currentCredits} onChange={(e) => setCurrentCredits(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
                   </div>
                   <div>
                       <label className="text-xs text-gray-400 mb-1 block">Giới hạn Max</label>
                       <input type="number" value={currentMaxCredits} onChange={(e) => setCurrentMaxCredits(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
                   </div>
                </div>

                <div>
                   <label className="text-xs text-gray-400 mb-1 block">Chế độ chạy Link</label>
                   <select 
                      value={currentAdStrategy} 
                      onChange={(e) => setCurrentAdStrategy(e.target.value as AdStrategyType)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                   >
                       <option value="random">Ngẫu nhiên (Random)</option>
                       <option value="sequential">Tuần tự (Từ trên xuống)</option>
                   </select>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Danh sách Link (Mỗi link 1 dòng)</label>
                    <textarea 
                        placeholder="https://..." 
                        value={currentAdLinksStr} 
                        onChange={(e) => setCurrentAdLinksStr(e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono text-sm whitespace-pre" 
                        rows={3} 
                    />
                </div>
                
                <button onClick={handleAdSettingsUpdate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Lưu Cài đặt QC</button>
            </div>

            {/* CẤU HÌNH HỆ THỐNG */}
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-md border border-gray-700 border-l-4 border-l-sky-500">
                <h3 className="font-bold text-lg text-white">Cấu hình Hệ thống</h3>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Mã sử dụng (User Code)</label>
                    <input type="text" placeholder="VD: 9r" value={currentUserCode} onChange={(e) => setCurrentUserCode(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Mật khẩu Admin</label>
                    <input type="password" placeholder="Mật khẩu Admin" value={currentAdminPassword} onChange={(e) => setCurrentAdminPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleUserCodeUpdate} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-2 rounded-md transition-colors text-xs">Lưu Mã</button>
                    <button onClick={handleAdminPassUpdate} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-2 rounded-md transition-colors text-xs">Lưu Pass</button>
                </div>
            </div>
            
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-md border border-gray-700">
                <h3 className="font-bold text-lg text-white">Quản lý Thông báo</h3>
                <textarea placeholder="Nội dung thông báo" value={currentNotification} onChange={(e) => setCurrentNotification(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" rows={3} />
                <button onClick={handleNotificationUpdate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Lưu Thông báo</button>
            </div>
            
             {/* Payment Info Section */}
             <div className="space-y-4 p-4 bg-gray-900/50 rounded-md border border-gray-700">
                <h3 className="font-bold text-lg text-white">Thông tin thanh toán</h3>
                
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tên Ngân hàng</label>
                    <input type="text" placeholder="VD: Vietcombank" value={currentPaymentInfo.bankName} onChange={(e) => setCurrentPaymentInfo(p => ({...p, bankName: e.target.value}))} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Chủ tài khoản</label>
                    <input type="text" placeholder="Tên chủ thẻ" value={currentPaymentInfo.accountName} onChange={(e) => setCurrentPaymentInfo(p => ({...p, accountName: e.target.value}))} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Số tài khoản</label>
                    <input type="text" placeholder="Số tài khoản" value={currentPaymentInfo.accountNumber} onChange={(e) => setCurrentPaymentInfo(p => ({...p, accountNumber: e.target.value}))} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Link ảnh QR Code</label>
                    <input type="url" placeholder="https://..." value={currentPaymentInfo.qrCodeUrl} onChange={(e) => setCurrentPaymentInfo(p => ({...p, qrCodeUrl: e.target.value}))} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
                </div>

                <button onClick={handlePaymentInfoUpdate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Lưu Payment</button>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-gray-700 mt-auto">
                 <button onClick={handleResetDataClick} className="w-full bg-red-800/60 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Khôi phục dữ liệu gốc</button>
                 <button onClick={handleLogoutClick} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Đăng xuất</button>
            </div>
          </div>
          
          {/* --- Right Column (Table & Code Exporter) --- */}
          <div className="w-full md:w-3/5 flex flex-col min-h-0">
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-white">Danh sách hiện tại</h3>
                <button 
                  onClick={handleCancelEdit} 
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-md transition-colors duration-200 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm Mới
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-md border border-gray-700">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                      <th scope="col" className="px-2 py-3 w-8"></th>
                      <th scope="col" className="px-4 py-3 w-12 text-center">STT</th>
                      <th scope="col" className="px-4 py-3">Tên ứng dụng</th>
                      <th scope="col" className="px-4 py-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app, index) => (
                      <tr key={app.id} draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 ${dragStartIndex === index ? 'opacity-50 bg-gray-700' : ''} ${dragOverIndex === index ? 'border-t-2 border-sky-500 box-content' : ''}`}>
                        <td className="px-2 py-3 text-center"><span className="text-gray-500 cursor-grab active:cursor-grabbing">{DRAG_HANDLE_ICON}</span></td>
                        <td className="px-4 py-3 font-medium text-gray-400 text-center">{index + 1}</td>
                        <td className="px-4 py-3 font-semibold text-white truncate" style={{ maxWidth: '200px' }}>{app.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleCopyClick(app)} className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-500/50 rounded-full transition-colors" aria-label={`Sao chép ${app.name}`}>{COPY_ICON}</button>
                            <button onClick={() => handleEditClick(app)} className="p-2 text-sky-400 hover:text-white hover:bg-sky-500/50 rounded-full transition-colors" aria-label={`Sửa ${app.name}`}>{PENCIL_ICON}</button>
                            <button onClick={() => handleDeleteClick(app)} className="p-2 text-red-400 hover:text-white hover:bg-red-500/50 rounded-full transition-colors" aria-label={`Xóa ${app.name}`}>{TRASH_ICON}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-white">Xuất ra Code</h3>
                    <label htmlFor="code-toggle" className="flex items-center cursor-pointer">
                        <span className="text-sm text-gray-400 mr-3">{showCodeExporter ? 'Đóng' : 'Mở'}</span>
                        <div className="relative">
                            <input id="code-toggle" type="checkbox" className="sr-only peer" checked={showCodeExporter} onChange={() => setShowCodeExporter(!showCodeExporter)} />
                            <div className="w-10 h-6 bg-gray-600 rounded-full peer peer-checked:bg-sky-600 transition-colors"></div>
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
                        </div>
                    </label>
                </div>
                
                {showCodeExporter && (
                    <div className="animate-fade-in flex flex-col gap-2">
                        <div className="flex gap-2">
                             <button 
                                onClick={handleGenerateBackupCode} 
                                className={`flex-1 font-bold py-2 px-4 rounded-md transition-colors ${exportMode === 'backup' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                             >
                                Data Backup
                             </button>
                             <button 
                                onClick={handleGenerateChildAppCode} 
                                className={`flex-1 font-bold py-2 px-4 rounded-md transition-colors ${exportMode === 'childApp' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                             >
                                Code App Con (Universal)
                             </button>
                        </div>
                        
                        {generatedCode && (
                            <div className="relative mt-2">
                                <textarea ref={codeTextareaRef} readOnly value={generatedCode} onClick={() => codeTextareaRef.current?.select()} className="w-full h-48 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-300 font-mono text-sm p-2" />
                                <p className="text-xs text-gray-500 mt-1 italic text-right">
                                    {exportMode === 'childApp' ? 'Đoạn mã này tự động nhận diện URL của App Con. Chỉ cần Copy 1 lần dùng cho mọi App.' : 'Lưu đoạn này vào file text để backup dữ liệu.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationModal isOpen={!!appToDelete} onClose={() => setAppToDelete(null)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa" message={`Bạn có chắc chắn muốn xóa "${appToDelete?.name}" không?`} />
      <ConfirmationModal isOpen={isResetConfirmOpen} onClose={() => setResetConfirmOpen(false)} onConfirm={handleConfirmReset} title="Xác nhận Khôi phục" message="Bạn có chắc chắn muốn khôi phục dữ liệu gốc? Tất cả các thay đổi và ứng dụng bạn đã thêm sẽ bị mất." />
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }`}</style>
    </>
  );
};

export default AdminPanelModal;
