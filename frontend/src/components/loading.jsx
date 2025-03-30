// import React, { useState, useEffect } from 'react';

// const RNSLoadingSpinner = () => {
//   const [activeLetters, setActiveLetters] = useState([false, false, false]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveLetters(prev => {
//         const newState = [...prev];
//         const activeIndex = newState.findIndex(item => item === true);
        
//         if (activeIndex === -1) {
//           newState[0] = true;
//         } else {
//           newState[activeIndex] = false;
//           newState[(activeIndex + 1) % 3] = true;
//         }
        
//         return newState;
//       });
//     }, 500);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-white to-blue-50">
//       <div className="flex items-center space-x-4">
//         {['R', 'N', 'S'].map((letter, index) => (
//           <div 
//             key={letter}
//             className={`
//               text-7xl font-bold 
//               ${activeLetters[index] 
//                 ? 'text-blue-600 scale-110 transform' 
//                 : 'text-blue-300'}
//               transition-all duration-500 ease-in-out
//             `}
//           >
//             {letter}
//           </div>
//         ))}
//       </div>
      
//       <div className="mt-8 text-blue-500 text-xl font-medium tracking-wide animate-pulse">
//         Loading Project Management System
//       </div>
//     </div>
//   );
// };

// export default RNSLoadingSpinner;


import React from 'react';
import { motion } from 'framer-motion';

const RNSLoadingSpinner = () => {
  // Dots animation variants
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    initial: { y: 0, opacity: 0.2 },
    animate: {
      y: [0, -15, 0],
      opacity: [0.2, 1, 0.2],
      transition: {
        repeat: Infinity,
        duration: 1
      }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  // Create pulse effect variant
  const pulseVariants = {
    initial: {
      scale: 0.8,
      opacity: 0.3
    },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.3, 0.7, 0.3],
      transition: {
        repeat: Infinity,
        duration: 2
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Main spinner */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Outer spinning ring */}
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-t-blue-600 border-r-blue-400 border-b-blue-300 border-l-blue-500"
          variants={spinnerVariants}
          animate="animate"
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          <span className="text-blue-800 font-semibold text-xs">RNS<br/>Loading</span>
        </motion.div>
      </motion.div>
      
      {/* Bouncing dots */}
      <motion.div
        className="flex space-x-3"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-3 h-3 rounded-full bg-blue-600"
            variants={dotVariants}
          />
        ))}
      </motion.div>
      
      {/* Status text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gray-600 bg-gray-100 px-4 py-1 rounded-full shadow-inner"
      >
        Processing your request...
      </motion.div>
    </div>
  );
};

export default RNSLoadingSpinner;