
import React from 'react';

const WelcomeMessage: React.FC = () => {
  return (
    <div className="text-center mt-4 px-4">
      <p className="text-2xl md:text-4xl italic font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 drop-shadow-[0_4px_15px_rgba(245,158,11,0.4)] tracking-tight leading-tight">
        "Nơi trí tuệ được lan tỏa"
      </p>
      <div className="flex justify-center mt-2">
        <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
