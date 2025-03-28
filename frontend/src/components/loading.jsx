import React, { useState, useEffect } from 'react';

const RNSLoadingSpinner = () => {
  const [activeLetters, setActiveLetters] = useState([false, false, false]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLetters(prev => {
        const newState = [...prev];
        const activeIndex = newState.findIndex(item => item === true);
        
        if (activeIndex === -1) {
          newState[0] = true;
        } else {
          newState[activeIndex] = false;
          newState[(activeIndex + 1) % 3] = true;
        }
        
        return newState;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="flex items-center space-x-4">
        {['R', 'N', 'S'].map((letter, index) => (
          <div 
            key={letter}
            className={`
              text-7xl font-bold 
              ${activeLetters[index] 
                ? 'text-blue-600 scale-110 transform' 
                : 'text-blue-300'}
              transition-all duration-500 ease-in-out
            `}
          >
            {letter}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-blue-500 text-xl font-medium tracking-wide animate-pulse">
        Loading Project Management System
      </div>
    </div>
  );
};

export default RNSLoadingSpinner;