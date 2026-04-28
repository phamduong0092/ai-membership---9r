import React from 'react';
import { EXTERNAL_LINK_ICON, VIDEO_ICON } from '../constants';
import { AppType } from '../contexts/AppContext';

interface AppCardProps {
  app: AppType;
  onAppClick: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onAppClick }) => {
  const { name, description, url, imageUrl, tutorialUrl, videoTooltip } = app;
  
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop the event from bubbling up to the main click handler
    if (tutorialUrl) {
      window.open(tutorialUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="group relative bg-gray-800/60 rounded-lg border border-gray-700 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden cursor-pointer"
      onClick={onAppClick}
    >
      
      {/* --- Visuals --- */}
      <div className="relative aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Ảnh đại diện cho ${name}`}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
             <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
                 <path d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l-3-3m0 0l3-3m-3 3h6" />
                 <path d="M15 3v6h6" />
               </g>
             </svg>
          </div>
        )}
      </div>

      {/* --- Text Content --- */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-100 group-hover:text-sky-400 transition-colors duration-300">{name}</h3>
          <div className="text-gray-500 group-hover:text-sky-400 transition-colors duration-300 flex-shrink-0">
            {EXTERNAL_LINK_ICON}
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed flex-grow">
          {description}
        </p>
      </div>

      {/* --- Video Button --- */}
      {tutorialUrl && (
        <div className="absolute top-3 right-3 z-20 group/video">
          <button
            onClick={handleVideoClick}
            className="p-2 bg-black/50 rounded-full text-white opacity-75 hover:opacity-100 hover:bg-black/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label={`Xem video hướng dẫn cho ${name}`}
          >
            {VIDEO_ICON}
          </button>
          <div className="absolute top-full mt-2 right-0 w-max max-w-xs px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 pointer-events-none">
            {videoTooltip || 'Xem video hướng dẫn'}
          </div>
        </div>
      )}

      {/* --- Aspect Ratio CSS --- */}
      <style>{`
        .aspect-w-16 { position: relative; padding-bottom: 56.25%; }
        .aspect-h-9 > * { position: absolute; height: 100%; width: 100%; top: 0; right: 0; bottom: 0; left: 0; }
      `}</style>
    </div>
  );
};

export default AppCard;