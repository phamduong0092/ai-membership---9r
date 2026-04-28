
import React from 'react';
import AdminControls from './AdminControls';

interface HeaderProps {
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
  return (
    <header className="relative text-center pt-2 pb-2">
      <h1 
        className="text-5xl md:text-6xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-gradient drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        style={{ fontFamily: "'Cinzel Decorative', cursive" }}
      >
        AI MEMBERSHIP - 9R
      </h1>
      <AdminControls onAdminClick={onAdminClick} />
    </header>
  );
};

export default Header;
