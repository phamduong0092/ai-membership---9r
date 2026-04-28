
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext, VideoTaskType } from '../contexts/AppContext';
import { COPY_ICON, EXTERNAL_LINK_ICON, VIDEO_ICON } from '../constants';
import { useToast } from '../contexts/ToastContext';

interface VideoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (video: VideoTaskType) => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ isOpen, onClose, onSelectVideo }) => {
  const { getVideoTasks } = useAppContext();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<VideoTaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    const data = await getVideoTasks();
    setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded border border-emerald-500/30 uppercase tracking-tighter">Hoàn tất</span>;
      case 'processing':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded border border-amber-500/30 uppercase tracking-tighter animate-pulse">Đang vẽ...</span>;
      case 'failed':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded border border-red-500/30 uppercase tracking-tighter">Lỗi</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-[9px] font-bold rounded border border-gray-500/30 uppercase tracking-tighter">Hàng chờ</span>;
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const shareUrl = `${window.location.origin}${window.location.pathname}?v_id=${id}`;
      navigator.clipboard.writeText(shareUrl);
      showToast("Đã sao chép link video!", "success");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lịch sử sáng tạo của bạn" size="large">
        <div className="flex flex-col gap-6">
            <div className="flex justify-end">
                <button 
                    onClick={fetchTasks} 
                    className="p-2 bg-gray-800 border border-gray-700 hover:border-sky-500/50 rounded-lg text-sky-400 transition-all flex items-center gap-2 text-xs font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    LÀM MỚI
                </button>
            </div>

            {isLoading && tasks.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-xs font-bold animate-pulse tracking-widest">ĐANG TẢI DỮ LIỆU...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="py-20 text-center text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl">
                    <p>Bạn chưa có dự án nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.map((task) => (
                        <div 
                            key={task.id}
                            onClick={() => onSelectVideo(task)}
                            className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-sky-500/50 transition-all shadow-lg"
                        >
                            <div className="aspect-[16/10] relative bg-black">
                                {task.input_image ? (
                                    <img src={task.input_image} alt={task.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">{VIDEO_ICON}</div>
                                )}
                                <div className="absolute top-2 left-2 scale-75 origin-top-left">
                                    {getStatusBadge(task.status)}
                                </div>
                                {task.status === 'completed' && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-sky-500/10 backdrop-blur-[1px]">
                                        <div className="p-3 bg-sky-500 text-white rounded-full shadow-lg">
                                            {VIDEO_ICON}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-xs text-gray-200 truncate mb-1">{task.title || 'Dự án vô danh'}</h4>
                                <p className="text-[9px] text-gray-600">{new Date(task.created_at || '').toLocaleString('vi-VN')}</p>
                                <div className="mt-3 flex gap-1.5">
                                    <button 
                                        onClick={(e) => handleShare(e, task.id)}
                                        className="flex-1 py-1.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-[9px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all text-gray-400"
                                    >
                                        {COPY_ICON} LINK
                                    </button>
                                    {task.output_video && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); window.open(task.output_video, '_blank'); }}
                                            className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white rounded-lg transition-all"
                                        >
                                            {EXTERNAL_LINK_ICON}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 10px; }
        `}</style>
    </Modal>
  );
};

export default VideoGallery;
