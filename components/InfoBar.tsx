
import React from 'react';

const InfoBar: React.FC = () => {
  return (
    <div className="text-center text-sm text-indigo-300 flex flex-wrap justify-center items-baseline gap-x-3 gap-y-1 px-4">
      <span>
        Phát triển bởi <span className="font-semibold text-gray-200">Dương Long (9R)</span>
      </span>

      <span className="hidden md:inline">-</span>
      
      <span>
        Website: <a href="http://9R.Com.Vn" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-gray-200 hover:text-indigo-300 transition-colors">9R.Com.Vn</a>
      </span>
      
      <span className="text-indigo-500 hidden sm:inline">|</span>
      
      <span>
        Liên hệ Zalo: <a href="https://zalo.me/0909357553" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-gray-200 hover:text-indigo-300 transition-colors">0909-357-553</a>
      </span>

      <span className="text-indigo-500 hidden sm:inline">|</span>
      
      <span>
        Nhóm hỗ trợ: <a href="https://zalo.me/g/eticqx111" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-gray-200 hover:text-indigo-300 transition-colors">Tham gia ngay</a>
      </span>
    </div>
  );
};

export default InfoBar;
