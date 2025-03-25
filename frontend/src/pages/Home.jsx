import React, { useState, useEffect } from 'react';

const HomeLogoLoader = () => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const stages = [
      { duration: 500, stage: 1 },
      { duration: 800, stage: 2 },
      { duration: 1000, stage: 3 }
    ];

    const timer = setTimeout(() => {
      if (animationStage < stages.length) {
        setAnimationStage(prev => prev + 1);
      }
    }, stages[animationStage]?.duration || 0);

    return () => clearTimeout(timer);
  }, [animationStage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative w-64 h-64">
        {/* Outer Circle */}
        <div 
          className={`absolute inset-0 rounded-full border-8 border-blue-500 transition-all duration-700 ease-in-out ${
            animationStage >= 0 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-0'
          }`}
        />

        {/* Home Icon Path */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
            animationStage >= 1 
              ? 'opacity-100 scale-100 text-blue-600' 
              : 'opacity-0 scale-50 text-blue-300'
          }`}
        >
          <path 
            d="M12 3L2 12h3v8h14v-8h3L12 3zm0 0l0 6m0 0l5 5m-5-5L7 11" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinejoin="round"
          />
        </svg>

        {/* Pulsing Inner Highlight */}
        <div 
          className={`absolute inset-4 rounded-full bg-blue-200 opacity-0 transition-all duration-700 ease-in-out ${
            animationStage >= 2 
              ? 'opacity-50 animate-ping' 
              : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
};

export default HomeLogoLoader;