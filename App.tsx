
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InfoBar from './components/InfoBar';
import WelcomeMessage from './components/WelcomeMessage';
import AdBanner from './components/AdBanner';
import AppCard from './components/PrinciplesCard';
import { useAppContext, AppType, VideoTaskType } from './contexts/AppContext';
import LoginModal from './components/LoginModal';
import AdminPanelModal from './components/AdminPanelModal';
import ToastContainer from './components/ToastContainer';
import UserCodeModal from './components/UserCodeModal';
import AccessCodeModal from './components/AccessCodeModal';
import NotificationModal from './components/NotificationModal';
import PaymentModal from './components/PaymentModal';
import VideoGallery from './components/VideoGallery';
import VideoResultModal from './components/VideoResultModal';
import { useToast } from './contexts/ToastContext';
import { generateDailyCode } from './utils/authGenerator';
import { BELL_ICON, COFFEE_ICON_STEAMING } from './constants';

const App: React.FC = () => {
  const { 
    apps, isAdmin, notification, paymentInfo, credits, addCredits, getVideoTask, sendTele 
  } = useAppContext();
  
  // --- Modals State ---
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false);
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isVideoGalleryOpen, setVideoGalleryOpen] = useState(false);
  const [isVideoResultOpen, setVideoResultOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTaskType | null>(null);

  const { showToast } = useToast();

  // --- Auth Flow State ---
  const [isUserCodeModalOpen, setUserCodeModalOpen] = useState(false);
  const [pendingApp, setPendingApp] = useState<AppType | null>(null);
  const [pendingAction, setPendingAction] = useState<'openApp' | 'openGallery' | 'loadVideo' | null>(null);
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

  const [isAccessModalOpen, setAccessModalOpen] = useState(false);
  const [currentAccessCode, setCurrentAccessCode] = useState('');
  const [targetAppUrl, setTargetAppUrl] = useState('');
  const [targetAppName, setTargetAppName] = useState('');

  // 1. Kiểm tra tham số v_id từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v_id');
    if (videoId) {
      if (sessionStorage.getItem('isUserAuthenticated') === 'true') {
        loadVideoTask(videoId);
      } else {
        setPendingVideoId(videoId);
        setPendingAction('loadVideo');
        setUserCodeModalOpen(true);
      }
    }
  }, []);

  const loadVideoTask = async (id: string) => {
    const task = await getVideoTask(id);
    if (task) {
      setSelectedVideo(task);
      setVideoResultOpen(true);
    } else {
      showToast("Không tìm thấy dữ liệu video.", "error");
    }
  };

  const handleAppClick = (app: AppType) => {
    if (sessionStorage.getItem('isUserAuthenticated') === 'true') {
        const currentCredits = credits || 0;
        if (currentCredits <= 0) {
            showToast("Bạn đã hết Credit! Vui lòng bấm Xem QC để lấy thêm.", "error");
            return; 
        }
        addCredits(-1);
        setCurrentAccessCode(generateDailyCode());
        setTargetAppUrl(app.url);
        setTargetAppName(app.name);
        setAccessModalOpen(true);
        
        // Tracking Telegram: Mở ứng dụng
        sendTele(`🚀 <b>Mở Ứng dụng</b>\n📱 App: <code>${app.name}</code>\n💎 Còn lại: ${currentCredits - 1} Credits`);

    } else {
      setPendingApp(app);
      setPendingAction('openApp');
      setUserCodeModalOpen(true);
    }
  };
  
  const handleUserCodeSuccess = () => {
    sessionStorage.setItem('isUserAuthenticated', 'true');
    setUserCodeModalOpen(false);
    
    // Tracking Telegram: Xác thực thành công
    sendTele(`👤 <b>Người dùng đăng nhập</b>\n✅ Xác thực thành công vào không gian 9R.`);

    if (pendingAction === 'openApp' && pendingApp) {
      handleAppClick(pendingApp);
    } else if (pendingAction === 'openGallery') {
      setVideoGalleryOpen(true);
    } else if (pendingAction === 'loadVideo' && pendingVideoId) {
      loadVideoTask(pendingVideoId);
    }
    
    setPendingApp(null);
    setPendingAction(null);
    setPendingVideoId(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Header onAdminClick={() => isAdmin ? setAdminPanelOpen(true) : setLoginModalOpen(true)} />
        <InfoBar />
        <WelcomeMessage />
        
        {/* AdBanner Row (Credits and Ad button) */}
        <AdBanner />

        {/* --- ARTISTIC SEPARATOR (Extended) --- */}
        <div className="w-full mt-12 mb-6">
            <div className="relative flex items-center justify-center">
                {/* Full Width Neon Line */}
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/80 to-transparent shadow-[0_0_15px_rgba(168,85,247,1)]"></div>
                </div>
                {/* Text Label with background mask */}
                <div className="relative px-8 bg-gray-950">
                    <span className="text-xl md:text-2xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-purple-500 uppercase drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                        KHÔNG GIAN CHIA SẺ
                    </span>
                </div>
            </div>
        </div>
        
        <div className="mt-12">
            {apps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apps.map((app) => (
                        <AppCard key={app.id} app={app} onAppClick={() => handleAppClick(app)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                    <p className="text-gray-500">Chưa có ứng dụng nào được kích hoạt.</p>
                </div>
            )}
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-800 text-center text-gray-600 text-xs">
            <p>&copy; 2025 AI MEMBERSHIP - 9R System. All rights reserved.</p>
        </footer>
      </div>

      {/* Repositioned Buttons to Bottom Corners */}
      <div className="fixed bottom-6 left-6 z-[40]">
        <button 
            onClick={() => setPaymentModalOpen(true)}
            className="group flex items-center justify-center w-14 h-14 bg-gray-800/80 border border-amber-500/30 rounded-full text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-amber-500/40 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md"
            title="Mời Cafe"
        >
            <div className="group-hover:animate-bounce">
                {COFFEE_ICON_STEAMING}
            </div>
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-[40]">
        <button 
            onClick={() => setNotificationModalOpen(true)}
            className="group flex items-center justify-center w-14 h-14 bg-gray-800/80 border border-indigo-500/30 rounded-full text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md"
            title="Thông báo"
        >
            <div className="group-hover:animate-pulse">
                {BELL_ICON}
            </div>
        </button>
      </div>

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onLoginSuccess={() => {setLoginModalOpen(false); setAdminPanelOpen(true);}} />
      <AdminPanelModal isOpen={isAdminPanelOpen} onClose={() => setAdminPanelOpen(false)} onLogout={() => setAdminPanelOpen(false)} />
      <UserCodeModal isOpen={isUserCodeModalOpen} onClose={() => {setUserCodeModalOpen(false); setPendingAction(null);}} onSuccess={handleUserCodeSuccess} />
      <AccessCodeModal isOpen={isAccessModalOpen} onClose={() => setAccessModalOpen(false)} accessCode={currentAccessCode} appUrl={targetAppUrl} appName={targetAppName} />
      <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setNotificationModalOpen(false)} message={notification || ''} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} paymentInfo={paymentInfo} />
      
      <VideoGallery isOpen={isVideoGalleryOpen} onClose={() => setVideoGalleryOpen(false)} onSelectVideo={(v) => { setSelectedVideo(v); setVideoResultOpen(true); }} />
      <VideoResultModal isOpen={isVideoResultOpen} onClose={() => setVideoResultOpen(false)} video={selectedVideo} />

      <ToastContainer />
    </div>
  );
};

export default App;
