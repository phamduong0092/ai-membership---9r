
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useAppContext, VideoTaskType } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { GoogleGenAI } from "@google/genai";
import { WAND_ICON, X_ICON, UPLOAD_ICON, COG_ICON, VIDEO_ICON, COPY_ICON, PENCIL_ICON, SPARKLES_ICON } from '../constants';

interface VideoStudioLabProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: VideoTaskType | null;
  onViewResult?: (video: VideoTaskType) => void;
}

const VideoStudioLab: React.FC<VideoStudioLabProps> = ({ isOpen, onClose, initialData, onViewResult }) => {
  const { createVideoTask, credits, addCredits, uploadFile, getVideoTasks, isAdmin } = useAppContext();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [tasks, setTasks] = useState<VideoTaskType[]>([]);
  const [selectedTask, setSelectedTask] = useState<VideoTaskType | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [promptOrigin, setPromptOrigin] = useState('');
  const [promptEnhar, setPromptEnhar] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleKey, setTitleKey] = useState(0); 

  const isLocked = !!selectedTask;

  const fetchTasks = async (silent = false) => {
    if (!silent) setIsLoadingTasks(true);
    const data = await getVideoTasks();
    setTasks(data);
    
    setSelectedTask(current => {
        if (!current) return null;
        const updated = data.find(t => t.id === current.id);
        if (updated) {
            if (updated.output_video !== current.output_video || updated.status !== current.status) {
                return updated;
            }
        }
        return current;
    });
    
    if (!silent) setIsLoadingTasks(false);
    return data;
  };

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      fetchTasks();
      interval = setInterval(() => {
        fetchTasks(true);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData) {
        loadTaskToForm(initialData);
    }
  }, [isOpen, initialData]);

  const loadTaskToForm = (task: VideoTaskType) => {
    setSelectedTask(task);
    setTitle(task.title || '');
    setPromptOrigin(task.prompt_origin || '');
    setPromptEnhar(task.prompt_enhar || '');
    setImageUrl(task.input_image || '');
    setSelectedFile(null);
  };

  const getNextVideoNumber = (currentTasks: VideoTaskType[]) => {
    const vdNumbers = currentTasks
      .map(task => {
        const titleStr = (task.title || '').trim().toUpperCase();
        const match = titleStr.match(/^VD(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((num): num is number => num !== null);
    
    const nextNum = vdNumbers.length > 0 ? Math.max(...vdNumbers) + 1 : 1;
    return `VD${nextNum}`;
  };

  const handleNewVideo = async () => {
    setIsLoadingTasks(true);
    const latestTasks = await fetchTasks();
    const nextTitle = getNextVideoNumber(latestTasks);
    
    setSelectedTask(null); 
    setTitle(nextTitle);
    setPromptOrigin('');
    setPromptEnhar('');
    setImageUrl('');
    setSelectedFile(null);
    setIsLoadingTasks(false);
    setTitleKey(prev => prev + 1);
    
    showToast(`Đã chuẩn bị phiên làm việc: ${nextTitle}`, "info");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Dung lượng ảnh tối đa 5MB.", "error");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
            const base64 = event.target.result as string;
            setImageUrl(base64);
            handleAnalyzeImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (data: string) => {
    if (!data || isLocked) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let contentParts: any[] = [{ text: "Phân tích tấm ảnh này. Hãy mô tả nội dung ảnh bằng tiếng Việt và gợi ý 1 prompt tạo chuyển động video ngắn gọn, ấn tượng. Chỉ trả về kết quả gợi ý chuyển động duy nhất." }];
      if (data.startsWith('data:image')) {
        const [meta, base64] = data.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        contentParts.push({ inlineData: { data: base64, mimeType } });
      }
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts: contentParts } });
      setPromptOrigin(response.text || '');
    } catch (err) {
      showToast("AI gặp sự cố khi phân tích.", "error");
    } finally { setIsAnalyzing(false); }
  };

  const handleEnhancePrompt = async () => {
    if (!promptOrigin || isLocked) return;
    setIsEnhancing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Nâng cấp prompt video sau thành Technical English Prompt (style Luma/Runway/Veo): "${promptOrigin}". Trả về duy nhất đoạn tiếng Anh.`,
      });
      setPromptEnhar(response.text || '');
      showToast("Đã tối ưu hóa thành công!", "success");
    } catch (err) { showToast("Lỗi tối ưu prompt.", "error"); }
    finally { setIsEnhancing(false); }
  };

  const handleUseOriginPrompt = async () => {
    if (!promptOrigin || isLocked) return;
    setIsEnhancing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following video motion description into a concise Technical English Prompt (style Luma/Runway/Veo). If it is already in English, just normalize it. Do not add creative details, just provide a high-quality technical translation: "${promptOrigin}". Return only the English text.`,
      });
      setPromptEnhar(response.text || '');
      showToast("Đã chuẩn hóa prompt thành công!", "success");
    } catch (err) { showToast("Lỗi chuẩn hóa prompt.", "error"); }
    finally { setIsEnhancing(false); }
  };

  const handleSubmit = async () => {
    if (isLocked) return;
    if (!imageUrl || !promptOrigin) {
      showToast("Vui lòng nhập đủ thông tin!", "error");
      return;
    }
    const cost = 2;
    if ((credits || 0) < cost) {
      showToast(`Bạn cần ít nhất ${cost} Credits.`, "error");
      return;
    }
    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }
      const result = await createVideoTask({
        title: title || "Video Mới",
        prompt_origin: promptOrigin,
        prompt_enhar: promptEnhar,
        input_image: finalImageUrl,
        status: 'pending'
      });
      if (result) {
        addCredits(-cost);
        showToast("Đã gửi yêu cầu sáng tạo tới Lab!", "success");
        await fetchTasks();
        handleNewVideo(); 
      }
    } catch (err) { showToast("Có lỗi xảy ra khi gửi yêu cầu.", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleOpenVideo = () => {
    if (selectedTask && hasVideoResult && onViewResult) {
        onViewResult(selectedTask);
    }
  };

  const hasVideoResult = !!(selectedTask && selectedTask.output_video && selectedTask.output_video.length > 10);
  const isCurrentlyProcessing = isSubmitting || (selectedTask && !hasVideoResult && selectedTask.status !== 'failed');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PHÒNG 9R VIDEO LAB" size="xl">
      <div className="flex h-[90vh] bg-[#0b1221] overflow-hidden border-t border-gray-800">
        
        {/* --- CỘT TRÁI: DANH SÁCH & ĐIỀU KHIỂN --- */}
        <div className="w-[320px] bg-[#080d16] border-r border-gray-800 flex flex-col p-6 overflow-y-auto custom-scrollbar shrink-0">
          {isAdmin && (
            <button className="w-full mb-8 py-3 px-4 bg-[#1a2b3c] border border-cyan-500/30 rounded-xl text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-500/10 transition-all uppercase tracking-wider shadow-lg shadow-cyan-500/5">
              {COG_ICON} Quản lý hệ thống
            </button>
          )}

          <div className="space-y-8">
            <div>
              <h3 className="text-purple-500 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Hệ thống điều khiển</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => window.open('https://9r.com.vn', '_blank')}
                  className="w-full py-3.5 px-4 bg-[#212d3d] text-[#78909c] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#2c3b4f] transition-all uppercase tracking-widest border border-gray-800"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Hướng dẫn sử dụng
                </button>
                <button 
                  onClick={handleNewVideo}
                  disabled={isLoadingTasks}
                  className="w-full py-4 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  <span className="text-lg">+</span> Video Mới
                </button>
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="text-purple-500 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
                Dự án gần đây
                <button 
                    onClick={() => fetchTasks()} 
                    title="Làm mới danh sách"
                    className={`p-1 hover:text-cyan-400 transition-colors ${isLoadingTasks ? 'animate-spin' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </h3>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {!selectedTask && (
                    <div className="group w-full p-4 rounded-xl border bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-4 cursor-default animate-pulse-slow">
                        <div className="p-2.5 rounded-lg shrink-0 bg-cyan-500 text-white">
                            {PENCIL_ICON}
                        </div>
                        <div className="flex-grow truncate">
                            <p className="text-xs font-black truncate text-cyan-400 uppercase tracking-wider italic">
                                {title || 'ĐANG SOẠN THẢO...'}
                            </p>
                            <p className="text-[9px] text-cyan-900 font-bold uppercase">Trạng thái: Đang soạn</p>
                        </div>
                    </div>
                )}

                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => loadTaskToForm(task)}
                    className={`group w-full p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selectedTask?.id === task.id ? 'bg-cyan-500/10 border-cyan-500/50 shadow-inner shadow-cyan-500/5' : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'}`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${task.output_video ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-grow truncate">
                      <p className={`text-xs font-bold truncate ${selectedTask?.id === task.id ? 'text-cyan-400' : 'text-gray-300'}`}>
                        {task.title || 'Dự án không tên'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[9px] text-gray-600 font-mono tracking-tighter uppercase">{task.status}</p>
                          {task.output_video && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: KHU VỰC LÀM VIỆC --- */}
        <div className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-[#0b1221] relative">
          
          <div className="mb-12 flex justify-between items-center">
            <div className="flex-grow">
                <h4 className="text-amber-500 text-[11px] font-black uppercase tracking-[0.3em] mb-4">Chủ đề & Tên Video</h4>
                <input 
                    key={titleKey}
                    type="text" 
                    placeholder="NHẬP TÊN VIDEO TẠI ĐÂY..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLocked}
                    className="w-full bg-transparent border-none text-xl md:text-2xl font-black text-white focus:text-cyan-400 transition-all outline-none placeholder:text-gray-800 uppercase tracking-widest animate-title-fade disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Cinzel Decorative', cursive" }}
                />
            </div>
            
            {isLocked && (
                <div className="p-4 bg-[#231a0a] border border-amber-600/30 rounded-2xl flex items-center gap-4 shadow-xl animate-fade-in shrink-0">
                    <div className="p-2 bg-amber-600/20 text-amber-500 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <p className="text-amber-500 font-black text-[10px] uppercase tracking-wider">DỮ LIỆU ĐÃ KHÓA</p>
                        <p className="text-amber-600/70 text-[8px] uppercase font-bold">Phiên bản đang được xử lý</p>
                    </div>
                </div>
            )}
          </div>

          <div className="space-y-12">
            {/* 01. PHẦN 1: SÁNG TÁC VIDEO AI */}
            <div className="bg-[#101929]/50 border border-gray-800 rounded-3xl p-10 shadow-2xl backdrop-blur-sm">
                <h2 className="text-cyan-500 text-xl font-black uppercase tracking-[0.2em] mb-10 border-b border-gray-800 pb-6 flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-sm">01</span>
                PHẦN 1: SÁNG TÁC VIDEO AI
                </h2>
                
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
                    {/* 1. Hình ảnh gốc */}
                    <div className="xl:col-span-2 space-y-4">
                        <label className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] block">1. Hình ảnh gốc</label>
                        <div 
                            onClick={() => !isLocked && !imageUrl && fileInputRef.current?.click()}
                            className={`relative aspect-[4/3] w-full rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${imageUrl ? 'border-gray-800' : 'border-gray-800 hover:border-cyan-500/40 bg-gray-900/40 cursor-pointer shadow-inner'} ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                            {imageUrl ? (
                                <>
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                                    {!isLocked && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setImageUrl(''); setSelectedFile(null); }}
                                            className="absolute top-6 right-6 p-2.5 bg-red-500/90 text-white rounded-xl hover:scale-110 transition-all shadow-xl"
                                        >
                                            {X_ICON}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-300 group p-10">
                                    <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                                        <div className="p-6 bg-gray-800/50 rounded-full border border-gray-700 text-gray-300">{UPLOAD_ICON}</div>
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Tải ảnh khởi tạo</p>
                                </div>
                            )}
                            {(isAnalyzing || isSubmitting) && (
                                <div className="absolute inset-0 bg-gray-950/85 flex flex-col items-center justify-center backdrop-blur-md z-10 p-6 text-center">
                                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em]">XỬ LÝ DỮ LIỆU...</p>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isLocked} />
                    </div>

                    {/* Ý TƯỞNG & TỐI ƯU HÓA */}
                    <div className="xl:col-span-3 space-y-8">
                        {/* 2. Ý tưởng gốc */}
                        <div className="space-y-4">
                            <label className="text-amber-500 text-xs font-black uppercase tracking-[0.2em]">2. Ý tưởng / Mô tả chuyển động</label>
                            <textarea 
                                placeholder="MÔ TẢ Ý MUỐN CỦA BẠY TẠI ĐÂY (VÍ DỤ: CÔ GÁI MỈM CƯỜI, TÓC BAY TRONG GIÓ...)" 
                                rows={4}
                                value={promptOrigin}
                                onChange={(e) => setPromptOrigin(e.target.value)}
                                disabled={isLocked}
                                className="w-full bg-[#080d16]/80 border border-gray-800 rounded-2xl px-6 py-5 focus:border-amber-500/50 focus:bg-[#080d16] outline-none transition-all text-lg leading-relaxed text-gray-400 font-medium placeholder:text-gray-800 disabled:cursor-not-allowed custom-scrollbar"
                            />
                        </div>

                        {/* 3. AI Tối ưu & Kết quả */}
                        <div className={`space-y-6 p-6 rounded-3xl border transition-all duration-300 ${isLocked ? 'bg-gray-900/10 border-gray-800' : 'bg-cyan-500/5 border-cyan-500/20 shadow-lg'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <label className="text-cyan-500 text-xs font-black uppercase tracking-[0.2em]">3. AI Tối ưu hóa kỹ thuật</label>
                                {!isLocked && (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={handleUseOriginPrompt}
                                            disabled={isEnhancing || !promptOrigin}
                                            className="flex-1 md:flex-none text-[10px] flex items-center justify-center gap-2 text-white font-black px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-30 shadow-lg shadow-purple-500/20"
                                        >
                                            Lấy nguyên prompt từ 2. 
                                        </button>
                                        <button 
                                            onClick={handleEnhancePrompt}
                                            disabled={isEnhancing || !promptOrigin}
                                            className="flex-1 md:flex-none text-[10px] flex items-center justify-center gap-2 text-white font-black px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-30 shadow-lg shadow-cyan-500/20"
                                        >
                                            {WAND_ICON} {isEnhancing ? "ĐANG TỐI ƯU..." : "BẮT ĐẦU TỐI ƯU HÓA"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Ô hiển thị kết quả Technical Prompt */}
                            <div className={`animate-fade-in space-y-3 relative group ${!promptEnhar && !isLocked ? 'opacity-30' : ''}`}>
                                <textarea 
                                    placeholder={isLocked ? "Không có dữ liệu tối ưu" : "Kết quả tối ưu (English) sẽ hiển thị tại đây sau khi nhấn nút..."}
                                    rows={5}
                                    value={promptEnhar}
                                    onChange={(e) => setPromptEnhar(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full bg-[#080d16]/80 border border-cyan-500/20 rounded-2xl px-6 py-5 focus:border-cyan-500/50 focus:bg-[#080d16] outline-none transition-all text-lg leading-relaxed text-cyan-200/70 font-mono placeholder:text-gray-800 disabled:cursor-not-allowed custom-scrollbar resize-none"
                                />
                                {promptEnhar && (
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(promptEnhar); showToast("Đã copy Technical Prompt!", "success"); }}
                                        className="absolute top-4 right-4 p-2.5 bg-gray-800/80 text-cyan-500 hover:bg-cyan-500 hover:text-white rounded-xl transition-all shadow-md z-10"
                                        title="Sao chép prompt kỹ thuật"
                                    >
                                        {COPY_ICON}
                                    </button>
                                )}
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider text-right italic">* Bạn có thể copy đoạn này dán vào Veo 3 / Luma / Runway</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 02. PHẦN 2: TẠO VIDEO & KẾT QUẢ */}
            <div className="bg-[#101929]/50 border border-gray-800 rounded-3xl p-10 shadow-2xl backdrop-blur-sm">
                <h2 className="text-emerald-500 text-xl font-black uppercase tracking-[0.2em] mb-10 border-b border-gray-800 pb-6 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">02</span>
                    PHẦN 2: TẠO VIDEO & KẾT QUẢ
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Action 1: Submit */}
                    <div className={`p-8 rounded-3xl border transition-all duration-500 ${!isLocked ? 'bg-cyan-500/5 border-cyan-500/30 shadow-xl shadow-cyan-900/10' : 'bg-gray-900/20 border-gray-800 opacity-50 grayscale'}`}>
                        <h3 className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-cyan-500 text-white flex items-center justify-center text-[10px]">1</span>
                            Khởi tạo yêu cầu
                        </h3>
                        <p className="text-gray-500 text-[10px] mb-8 uppercase font-bold leading-relaxed">
                            Gửi dữ liệu đã soạn thảo tới hệ thống 9R Video Lab để AI bắt đầu quá trình kết xuất video.
                        </p>
                        <button 
                            onClick={handleSubmit}
                            disabled={isLocked || isSubmitting || !imageUrl || !promptOrigin}
                            className={`w-full py-5 font-black rounded-2xl transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl ${
                                !isLocked 
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:scale-[1.03] active:scale-95 shadow-cyan-500/20' 
                                    : 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>GỬI ĐẾN 9R VIDEO LAB <span className="text-lg">💎2</span></>
                            )}
                        </button>
                    </div>

                    {/* Action 2: Result */}
                    <div className={`p-8 rounded-3xl border transition-all duration-500 ${hasVideoResult ? 'bg-emerald-500/5 border-emerald-500/30 shadow-xl shadow-emerald-900/10 animate-pulse-gentle' : 'bg-gray-900/20 border-gray-800 opacity-50 grayscale'}`}>
                        <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">2</span>
                            Thành quả sáng tạo
                        </h3>
                        <p className="text-gray-500 text-[10px] mb-8 uppercase font-bold leading-relaxed">
                            Khi AI hoàn tất việc vẽ phép màu, bạn có thể xem và tải về video của mình tại đây.
                        </p>
                        <button 
                            onClick={handleOpenVideo}
                            disabled={!hasVideoResult}
                            className={`w-full py-5 font-black rounded-2xl transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl ${
                                hasVideoResult 
                                    ? 'bg-emerald-600 text-white hover:scale-[1.03] active:scale-95 shadow-emerald-500/20' 
                                    : 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                            }`}
                        >
                            {VIDEO_ICON} {hasVideoResult ? 'XEM VIDEO' : 'XEM VIDEO'}
                        </button>
                    </div>
                </div>

                {/* Thông báo trạng thái xử lý */}
                {isCurrentlyProcessing && (
                    <div className="mt-10 p-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col items-center justify-center gap-4 animate-pulse-processing">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                            <span className="text-amber-500 font-black text-2xl uppercase tracking-[0.2em]">Đang xử lý và có thể mất một khoảng thời gian</span>
                        </div>
                        <p className="text-amber-600/70 font-bold text-sm uppercase tracking-widest text-center">
                            Vui lòng kiên nhẫn, quá trình này có thể mất một khoảng thời gian để đạt chất lượng tốt nhất
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.5); border: 2px solid transparent; background-clip: content-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes titleFade {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-title-fade { animation: titleFade 0.3s ease-out forwards; }
        @keyframes pulseSlow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .animate-pulse-slow { animation: pulseSlow 2s infinite ease-in-out; }
        @keyframes pulseGentle {
            0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); border-color: rgba(16, 185, 129, 0.6); }
        }
        .animate-pulse-gentle { animation: pulseGentle 2s infinite; }
        @keyframes pulseProcessing {
            0%, 100% { background-color: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.1); }
            50% { background-color: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.3); }
        }
        .animate-pulse-processing { animation: pulseProcessing 3s infinite ease-in-out; }
      `}</style>
    </Modal>
  );
};

export default VideoStudioLab;
