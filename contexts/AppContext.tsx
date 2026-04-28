
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// @ts-ignore
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SUPABASE CONFIG ---
const SUPABASE_URL = 'https://vuswphqfsqkgygzykbji.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Hj8khZNMHnBgXjm-2RiqSw_NaPA2v9d';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- TYPES ---
export interface AppType {
  id: string;
  name: string;
  description: string;
  url: string; 
  mobileUrl?: string; 
  imageUrl?: string; 
  tutorialUrl?: string; 
  videoTooltip?: string; 
}

export interface VideoTaskType {
  id: string;
  user_id?: string;
  prompt_origin?: string;
  prompt_enhar?: string;
  input_image?: string; 
  output_video?: string; 
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'draft';
  title?: string;
  status_message?: string; 
  created_at?: string;
}

export interface PaymentInfoType {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string;
}

export type AdStrategyType = 'random' | 'sequential';

interface AppDataType {
  apps: AppType[];
  userCode: string;
  credits: number; 
  maxCredits: number; 
  adLinks: string[];
  adStrategy: AdStrategyType; 
  nextAdIndex: number; 
  adminPassword?: string;
  notification?: string;
  paymentInfo?: PaymentInfoType;
  // --- Telegram Hub V4 ---
  hubLabel: string;
  telegramBotToken: string;
  telegramChatId: string;
}

interface AppContextType extends AppDataType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addApp: (app: Omit<AppType, 'id'>) => void;
  deleteApp: (id: string) => void;
  updateApp: (id: string, updatedData: Omit<AppType, 'id'>) => void;
  reorderApps: (startIndex: number, endIndex: number) => void;
  updateUserCode: (newCode: string) => void;
  updateAdminPassword: (newPass: string) => void;
  updateNotification: (message: string) => void;
  updatePaymentInfo: (info: PaymentInfoType) => void;
  updateAdLinks: (links: string[]) => void;
  addCredits: (amount: number) => void;
  setCredits: (amount: number) => void; 
  setMaxCredits: (max: number) => void;
  setAdStrategy: (strategy: AdStrategyType) => void;
  cycleNextAd: () => void; 
  resetToDefaults: () => void;
  getVideoTask: (id: string) => Promise<VideoTaskType | null>;
  getVideoTasks: () => Promise<VideoTaskType[]>;
  createVideoTask: (task: Partial<VideoTaskType>) => Promise<VideoTaskType | null>;
  uploadFile: (file: File) => Promise<string | null>;
  // --- Telegram Actions ---
  updateTelegramConfig: (config: { hubLabel: string, token: string, chatId: string }) => void;
  sendTele: (message: string) => Promise<void>;
}

const DATA_VERSION = "4.9_HUB_V4"; 

// Fix: Added missing 'adStrategy' property to INITIAL_DATA to resolve TypeScript error
const INITIAL_DATA = {
  "apps": [
    {
      "id": "app-1765999704424",
      "name": "AI Xem Ebook - 9R",
      "description": "* App THÀNH VIÊN -  Mã sử dụng : xx",
      "url": "https://ai.studio/apps/731fcc4f-2ae5-4c05-82c5-4d6fe93ae77d?fullscreenApplet=true",
      "mobileUrl": "https://gemini.google.com/app",
      "imageUrl": "https://pub-71c0cf2f7be7436f9f38389a63374021.r2.dev/AI%20Xem%20Ebook%20-%209R.jpg",
      "tutorialUrl": "",
      "videoTooltip": ""
    },
    {
      "name": "AI Studio Hóa Thân - 9R",
      "description": "* App TRẢI NGHIỆM - Mã sử dụng : 9r",
      "url": "https://ai.studio/apps/4e7a2df2-9b99-4260-88eb-a8801be02e94?fullscreenApplet=true",
      "mobileUrl": "https://gemini.google.com/app",
      "imageUrl": "https://i.postimg.cc/MHksXHWq/46-PRINCESS-OF-CLOUDS-(7).png",
      "tutorialUrl": "",
      "videoTooltip": "",
      "id": "app-1777381525256-ydc0jwa8m"
    },
    {
      "name": "AI Tạo Prompt - 9R",
      "description": "* App THÀNH VIÊN - Mã sử dụng : xx",
      "url": "https://ai.studio/apps/44cb513f-ed57-413f-9122-2b4e28234752?fullscreenApplet=true",
      "mobileUrl": "https://gemini.google.com/app",
      "imageUrl": "https://i.postimg.cc/gjfdS0VQ/AI-Tao-Prompt-9R.jpg",
      "tutorialUrl": "",
      "videoTooltip": "",
      "id": "app-1777381390088-y71gk4uvu"
    },
    {
      "name": "AI Voice Studio - 9R",
      "description": "* App THÀNH VIÊN - Mã sử dụng : xx",
      "url": "https://ai.studio/apps/8ea18abf-eb3d-451b-a0df-647c0f312302?fullscreenApplet=true",
      "mobileUrl": "https://gemini.google.com/app",
      "imageUrl": "https://i.postimg.cc/Gh4HWGCz/AI_Voice_Studio_9R.jpg",
      "tutorialUrl": "",
      "videoTooltip": "",
      "id": "app-1777381577002-8rzfewyf1"
    },
    {
      "name": "Studio Chân Dung AI - 9R",
      "description": "* App THÀNH VIÊN - Mã sử dụng : xx",
      "url": "https://ai.studio/apps/18ae87e6-814d-4c30-97e3-a0eed0da4e61?fullscreenApplet=true",
      "mobileUrl": "https://gemini.google.com/app",
      "imageUrl": "https://i.postimg.cc/htHq8vM8/Studio-Chan-Dung-AI-9R.jpg",
      "tutorialUrl": "",
      "videoTooltip": "",
      "id": "app-1777384240839-q43ge1qae"
    },
    {
      "name": "AI Ảnh BĐS Siêu Đỉnh - 9R",
      "description": "* App THÀNH VIÊN - Mã sử dụng : xx",
      "url": "https://ai.studio/apps/a73ea992-e66e-4ff6-94a5-61a953ba4deb?fullscreenApplet=true",
      "mobileUrl": "https://gemini.google.com/app",
      "imageUrl": "https://i.postimg.cc/y6hLqQn2/AI_Ảnh_BĐS_Siêu_Đỉnh_9R.png",
      "tutorialUrl": "",
      "videoTooltip": "",
      "id": "app-1777392176267-4r8vlvbye"
    }
  ],
  "userCode": "9r",
  "adminPassword": "admin0123",
  "notification": "Chào mừng bạn đến với AI Ebook - 9R! Nơi trí tuệ được lan tỏa\n* Lưu ý: \n- Click Xem QC để nhận 10 Credit.\n- Phải đăng nhập TK google.",
  "paymentInfo": {
    "bankName": "VIKKI BANK (ĐONG A BANK)",
    "accountName": "DUONG CUU LONG",
    "accountNumber": "909357553",
    "qrCodeUrl": "https://i.postimg.cc/DftwfcPV/Ma-QR-Vikki-Bank-DCL.jpg"
  },
  "adLinks": [
    "https://memberkolaisystem.lovable.app?ref=KOL-86320315 | 4️⃣ Tham gia: Công đồng KOL AI  Go Global (Click Link này được giảm 50%/năm)  👈",
    "https://whop.com/e/trk_08nRspmZvYcNmT/9rcomvn | 5️⃣ Tham gia: Whop (Cộng đồng Freedom Builders - Người Việt)  👈",
    "https://soloyoutube.com?go=9rcomvn | 6️⃣ Solo Youtube - Chiến lược \"Hút Ngoại Tệ\" từ Youtube Mỹ 👈",
    "https://9r.com.vn/danh-sach-bat-ngo-nha-ngop-giam-sau-khu-vuc-tpho-chi-minh | 🅾️ Danh Sách Bất Ngờ - Nhà Ngộp  Bank - Giảm Sâu",
    "https://s.shopee.vn/900Q1fBNDR | 7️⃣ Sàn TMĐT Shopee👆🏾",
    "https://unica.vn/huong-dan-su-dung-cac-cong-cu-ai-hieu-qua-nhat?ref=phamduong009 | 1️⃣ Hướng Đẫn Sử Dụng Các Công Cụ AI Hiệu Quả Nhất 👈",
    "https://aidancing.net?ref=aidancing16549 | 2️⃣ Tạo Video nhảy + Ảnh 2K bằng AI Dancing 👈",
    "https://beacons.ai/signup?c=phamduong0092 | 3️⃣ Tạo 1 trang Landing Page – kiếm tiền tự động 24/7 👈"
  ],
  "maxCredits": 10,
  "adStrategy": "random",
  "hubLabel": "AI MEMBERSHIP - 9R",
  "telegramBotToken": "8475312896:AAF4oUozSLSzF2R9an1g1dt2ptZ8YTbNku8",
  "telegramChatId": "8077811181"
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppDataType>(INITIAL_DATA);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchAdsFromSupabase = async () => {
      try {
        const { data: ads, error } = await supabase.from('ads_config').select('url, label');
        if (error) throw error;
        if (ads && ads.length > 0) {
          const formattedLinks = ads.map((ad: any) => `${ad.url} | ${ad.label}`);
          setData(prev => ({ ...prev, adLinks: formattedLinks }));
        }
      } catch (err: any) {
        console.error("Supabase Ads Fetch Error:", err.message);
      }
    };
    fetchAdsFromSupabase();
  }, []);

  useEffect(() => {
    try {
      const currentVersion = localStorage.getItem('dataVersion');
      if (currentVersion !== DATA_VERSION) {
          localStorage.clear(); 
          localStorage.setItem('appData', JSON.stringify(INITIAL_DATA));
          localStorage.setItem('dataVersion', DATA_VERSION);
          setData(INITIAL_DATA);
      } else {
          const storedDataJSON = localStorage.getItem('appData');
          if (storedDataJSON) {
            let storedData = JSON.parse(storedDataJSON) as AppDataType;
            // Thiết lập credits mặc định là 9 khi khởi chạy
            let updatedData = { ...INITIAL_DATA, ...storedData, credits: storedData.credits ?? 9 };
            
            // Cleanup: Đảm bảo các ID ứng dụng là duy nhất để tránh lỗi sửa 1 được 2
            const seenIds = new Set();
            const uniqueApps = updatedData.apps.map(app => {
              if (!app.id || seenIds.has(app.id)) {
                const newId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
                seenIds.add(newId);
                return { ...app, id: newId };
              }
              seenIds.add(app.id);
              return app;
            });
            updatedData.apps = uniqueApps;
            
            setData(updatedData);
          } else {
             setData({ ...INITIAL_DATA, credits: 9 });
          }
      }
    } catch {
      setData({ ...INITIAL_DATA, credits: 9 });
    }
    const loggedIn = sessionStorage.getItem('isAdmin') === 'true';
    setIsAdmin(loggedIn);
  }, []);

  const persistData = (newData: AppDataType) => {
    localStorage.setItem('appData', JSON.stringify(newData));
  };

  const login = (password: string): boolean => {
    if (password === data.adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
  };

  const addApp = (appData: Omit<AppType, 'id'>) => {
    setData(prevData => {
        const newApp: AppType = { 
          ...appData, 
          id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` 
        };
        const newData = { ...prevData, apps: [...prevData.apps, newApp] };
        persistData(newData);
        return newData;
    });
  };

  const deleteApp = (id: string) => {
    setData(prevData => {
        const newData = { ...prevData, apps: prevData.apps.filter(app => app.id !== id) };
        persistData(newData);
        return newData;
    });
  };

  const updateApp = (id: string, updatedData: Omit<AppType, 'id'>) => {
    setData(prevData => {
        const newApps = prevData.apps.map(app => app.id === id ? { ...app, ...updatedData, id } : app);
        const newData = { ...prevData, apps: newApps };
        persistData(newData);
        return newData;
    });
  };

  const reorderApps = (startIndex: number, endIndex: number) => {
    setData(prevData => {
        const result = [...prevData.apps];
        const [removed] = result.splice(startIndex, 1);
        if (removed) {
          result.splice(endIndex, 0, removed);
          const newData = { ...prevData, apps: result };
          persistData(newData);
          return newData;
        }
        return prevData;
    });
  };

  const updateUserCode = (newCode: string) => {
    setData(prevData => {
      const newData = { ...prevData, userCode: newCode };
      persistData(newData);
      return newData;
    });
  };

  const updateAdminPassword = (newPass: string) => {
    setData(prevData => {
      const newData = { ...prevData, adminPassword: newPass };
      persistData(newData);
      return newData;
    });
  };

  const updateNotification = (message: string) => {
      setData(prevData => {
          const newData = { ...prevData, notification: message };
          persistData(newData);
          return newData;
      });
  };

  const updatePaymentInfo = (info: PaymentInfoType) => {
      setData(prevData => {
          const newData = { ...prevData, paymentInfo: info };
          persistData(newData);
          return newData;
      });
  };

  const updateAdLinks = (links: string[]) => {
      setData(prevData => {
          const newData = { ...prevData, adLinks: links };
          persistData(newData);
          return newData;
      });
  }

  const addCredits = (amount: number) => {
    setData(prevData => {
      const current = prevData.credits || 0;
      const max = prevData.maxCredits || 10;
      let newAmount = current + amount;
      if (newAmount > max) newAmount = max;
      if (newAmount < 0) newAmount = 0;
      const newData = { ...prevData, credits: newAmount };
      persistData(newData);
      return newData;
    });
  };

  const setCredits = (amount: number) => {
    setData(prevData => {
        const newData = { ...prevData, credits: amount };
        persistData(newData);
        return newData;
    });
  };

  const setMaxCredits = (max: number) => {
    setData(prevData => {
        const newData = { ...prevData, maxCredits: max };
        persistData(newData);
        return newData;
    });
  }

  const setAdStrategy = (strategy: AdStrategyType) => {
    setData(prevData => {
        const newData = { ...prevData, adStrategy: strategy };
        persistData(newData);
        return newData;
    });
  }

  const cycleNextAd = () => {
    setData(prevData => {
        if (!prevData.adLinks || prevData.adLinks.length === 0) return prevData;
        const nextIndex = (prevData.nextAdIndex + 1) % prevData.adLinks.length;
        const newData = { ...prevData, nextAdIndex: nextIndex };
        persistData(newData);
        return newData;
    });
  }

  const resetToDefaults = () => {
    persistData(INITIAL_DATA);
    localStorage.setItem('dataVersion', DATA_VERSION);
    window.location.reload();
  };

  // --- Telegram Integration Logic ---
  const updateTelegramConfig = (config: { hubLabel: string, token: string, chatId: string }) => {
    setData(prev => {
      const newData = {
        ...prev,
        hubLabel: config.hubLabel,
        telegramBotToken: config.token,
        telegramChatId: config.chatId
      };
      persistData(newData);
      return newData;
    });
  };

  const sendTele = async (message: string) => {
    if (!data.telegramBotToken || !data.telegramChatId) return;
    
    const label = data.hubLabel ? `<b>[${data.hubLabel}]</b>\n` : "";
    const fullMessage = label + message;
    
    const url = `https://api.telegram.org/bot${data.telegramBotToken}/sendMessage?chat_id=${data.telegramChatId}&text=${encodeURIComponent(fullMessage)}&parse_mode=HTML&disable_notification=true`;
    
    try {
      await fetch(url);
    } catch (err) {
      console.error("Telegram send error:", err);
    }
  };

  // --- SUPABASE STORAGE ---
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `user-uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-inputs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('video-inputs')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error("Upload Error:", err.message);
      return null;
    }
  };

  // --- VIDEO DATABASE INTERACTION ---
  const getVideoTask = async (id: string): Promise<VideoTaskType | null> => {
    if (!id || id === 'manual') return null;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) return null;

    try {
      const { data: task, error } = await supabase.from('app_ai_video').select('*').eq('id', id).single();
      if (error) return null;
      return task;
    } catch {
      return null;
    }
  };

  const getVideoTasks = async (): Promise<VideoTaskType[]> => {
    try {
      const { data: tasks, error } = await supabase
        .from('app_ai_video')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return tasks || [];
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      return [];
    }
  };

  const createVideoTask = async (task: Partial<VideoTaskType>): Promise<VideoTaskType | null> => {
    try {
      const { data: newTask, error } = await supabase.from('app_ai_video').insert([task]).select().single();
      if (error) throw error;
      return newTask;
    } catch (err: any) {
      console.error("Supabase Create Task Error:", err.message);
      return null;
    }
  };

  const value = { 
    ...data, 
    isAdmin, login, logout, 
    addApp, deleteApp, updateApp, reorderApps, 
    updateUserCode, updateAdminPassword, updateNotification, updatePaymentInfo, 
    updateAdLinks, addCredits, setCredits, setMaxCredits, setAdStrategy, cycleNextAd,
    resetToDefaults, getVideoTask, getVideoTasks, createVideoTask, uploadFile,
    updateTelegramConfig, sendTele
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
