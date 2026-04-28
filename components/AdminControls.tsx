
import React from 'react';
import { COG_ICON } from '../constants';

interface AdminControlsProps {
    onAdminClick: () => void;
}

const AdminControls: React.FC<AdminControlsProps> = ({ onAdminClick }) => {
  return (
    <div className="absolute top-0 right-0 p-4">
      <button 
        onClick={onAdminClick} 
        className="p-2 text-gray-400 hover:text-sky-400 transition-colors duration-300 bg-gray-800/50 rounded-full hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label="Quản lý ứng dụng"
      >
        {COG_ICON}
      </button>
    </div>
  );
};

export default AdminControls;
