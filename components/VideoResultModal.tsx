
import React from 'react';
import Modal from './Modal';
import { VideoTaskType } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { COPY_ICON, SPARKLES_ICON, X_ICON } from '../constants';

interface VideoResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoTaskType | null;
}

const VideoResultModal: React.FC<VideoResultModalProps> = ({ isOpen, onClose, video }) => {
  const { showToast } = useToast();
  if (!isOpen || !video) return null;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?v_id=${video.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Đã sao chép link video!", "success");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={video.title || "Chi tiết dự án"} size="large">
      <div className="flex flex-col gap-6 text-gray-200">
        
        {/* Cinema Section */}
        <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700 group">
          {video.status === 'completed' && video.output_video ? (
            <video 
              src={video.output_video} 
              controls 
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-sky-400">
                    {SPARKLES_ICON}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-sky-400 uppercase tracking-widest animate-pulse">
                    {video.status === 'processing' ? 'Đang vẽ phép màu...' : 'Đang chờ tới lượt...'}
                </h3>
                <p className="text-sm text-gray-500 max-w-md italic">
                    AI đang xử lý yêu cầu của bạn. Thời gian hoàn thành từ 2-5 phút. Bạn có thể đóng cửa sổ này và quay lại sau.
                </p>
                
                {/* Nút thoát rõ ràng ngay giữa màn hình chờ */}
                <button 
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2 mx-auto shadow-lg"
                >
                  {X_ICON} THOÁT & QUAY LẠI
                </button>
              </div>
              {video.status === 'failed' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {video.status_message || "Có lỗi kỹ thuật khi tạo video. Credit đã được hoàn lại (nếu có lỗi hệ thống)."}
                  </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ý tưởng ban đầu</label>
                    <p className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        {video.prompt_origin}
                    </p>
                </div>
                {video.prompt_enhar && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">AI Prompt (English)</label>
                        <p className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-xs text-amber-200 italic font-mono leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                            {video.prompt_enhar}
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hành động</label>
                     <div className="flex gap-3">
                        <button 
                            onClick={handleCopyLink}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            {COPY_ICON} SAO CHÉP LINK
                        </button>
                        {video.status === 'completed' && (
                            <a 
                                href={video.output_video} 
                                download 
                                target="_blank"
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all flex items-center justify-center"
                                title="Tải video"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </a>
                        )}
                     </div>
                </div>

                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-4">
                    <img src={video.input_image} alt="Original" className="w-20 h-20 rounded-lg object-cover border border-gray-700" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Hình ảnh gốc</p>
                        <p className="text-xs text-gray-300 mt-1">Dự án khởi tạo lúc: <br/> {new Date(video.created_at || '').toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
      `}</style>
    </Modal>
  );
};

export default VideoResultModal;
