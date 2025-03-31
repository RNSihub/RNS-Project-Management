import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { motion, AnimatePresence } from 'framer-motion';

const TTSComponent = () => {
  const [text, setText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [theme, setTheme] = useState('blue');
  const [showIntro, setShowIntro] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const { speak, cancel, speaking, voices, supported } = useSpeechSynthesis();

  // Process text to filter out * and # symbols
  useEffect(() => {
    const filtered = text.replace(/[*#]/g, ' ');
    setProcessedText(filtered);
  }, [text]);

  useEffect(() => {
    setIsSpeaking(speaking);
  }, [speaking]);

  // Auto-hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSpeak = () => {
    if (speaking) {
      cancel();
      setIsSpeaking(false);
    } else {
      speak({ text: processedText, voice: voices[voiceIndex], rate, pitch });
      setIsSpeaking(true);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Format processed text with bold periods and preserve new lines
  const formatProcessedText = (text) => {
    if (!text) return '';
    
    // Replace periods with bold periods
    const withBoldPeriods = text.split('.').join('.<b>.</b>').replace(/<b>.<\/b>\s*$/, '.');
    
    // Split by new lines for limiting display
    const lines = withBoldPeriods.split('\n');
    
    return lines;
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'purple':
        return {
          primary: 'from-purple-500 to-indigo-600',
          light: 'from-purple-50 to-indigo-100',
          button: 'bg-purple-600 hover:bg-purple-700',
          accent: 'purple',
          bgLight: 'bg-purple-50',
          border: 'border-purple-300 focus:border-purple-500 focus:ring-purple-200',
          slider: 'bg-purple-200',
          highlight: ['#8B5CF6', '#6D28D9', '#4C1D95', '#8B5CF6']
        };
      case 'teal':
        return {
          primary: 'from-teal-500 to-emerald-600',
          light: 'from-teal-50 to-emerald-100',
          button: 'bg-teal-600 hover:bg-teal-700',
          accent: 'teal',
          bgLight: 'bg-teal-50',
          border: 'border-teal-300 focus:border-teal-500 focus:ring-teal-200',
          slider: 'bg-teal-200',
          highlight: ['#14B8A6', '#0D9488', '#0F766E', '#14B8A6']
        };
      case 'pink':
        return {
          primary: 'from-pink-500 to-rose-600',
          light: 'from-pink-50 to-rose-100',
          button: 'bg-pink-600 hover:bg-pink-700',
          accent: 'pink',
          bgLight: 'bg-pink-50',
          border: 'border-pink-300 focus:border-pink-500 focus:ring-pink-200',
          slider: 'bg-pink-200',
          highlight: ['#EC4899', '#DB2777', '#BE185D', '#EC4899']
        };
      default: // blue
        return {
          primary: 'from-blue-500 to-indigo-600',
          light: 'from-blue-50 to-indigo-100',
          button: 'bg-blue-600 hover:bg-blue-700',
          accent: 'blue',
          bgLight: 'bg-blue-50',
          border: 'border-blue-300 focus:border-blue-500 focus:ring-blue-200',
          slider: 'bg-blue-200',
          highlight: ['#3B82F6', '#2563EB', '#1D4ED8', '#3B82F6']
        };
    }
  };

  const theme_colors = getThemeColors();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.3
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-100 to-red-200">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="text-xl text-red-600">Speech synthesis is not supported in this browser.</h2>
        </motion.div>
      </div>
    );
  }

  const formattedLines = formatProcessedText(processedText);
  const hasMoreLines = formattedLines.length > 5;
  const displayLines = showFullPreview ? formattedLines : formattedLines.slice(0, 5);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br ${theme_colors.light}`}
    >
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-0 right-0 flex justify-center z-50"
          >
            <div className={`px-6 py-3 text-white bg-gradient-to-r ${theme_colors.primary} rounded-full shadow-lg`}>
              <span>✨ Welcome to the enhanced Text-to-Speech application! ✨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-4 right-4 z-40"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-1 bg-white rounded-full shadow-md">
          <div className="flex space-x-2 p-2">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeTheme('blue')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ${theme === 'blue' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeTheme('purple')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 ${theme === 'purple' ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeTheme('teal')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 ${theme === 'teal' ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeTheme('pink')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 ${theme === 'pink' ? 'ring-2 ring-pink-400 ring-offset-2' : ''}`}
            />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 w-full">
        <motion.div 
          variants={itemVariants} 
          className="flex items-center justify-center mb-8"
        >
          <motion.div
            variants={logoVariants}
            animate={isSpeaking ? "pulse" : "visible"}
            className={`w-16 h-16 bg-gradient-to-br ${theme_colors.primary} rounded-full flex items-center justify-center shadow-lg mb-4`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-center text-gray-800 mb-8"
        >
          Text to Speech Converter
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className="w-full bg-white rounded-xl shadow-xl overflow-hidden mb-8"
        >
          <div className="p-8">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative mb-6"
            >
              <textarea
                className={`w-full h-40 p-4 text-lg ${theme_colors.bgLight} border-2 ${theme_colors.border} rounded-lg transition-all duration-300`}
                placeholder="Enter text to convert to speech... (* and # symbols will be ignored)"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              
              {text && (
                <motion.div className="absolute top-2 right-2 flex space-x-2">
                  
                  
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setText('')}
                    className="p-2 text-gray-500 bg-white rounded-full hover:bg-gray-100 shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <motion.button
                onClick={toggleControls}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium border rounded-md transition-all duration-300 shadow-sm"
                style={{ 
                  color: theme_colors.highlight[0],
                  borderColor: theme_colors.highlight[0],
                  backgroundColor: showControls ? `${theme_colors.bgLight}` : 'white'
                }}
              >
                {showControls ? 'Hide Controls' : 'Show Voice Controls'}
              </motion.button>
            </motion.div>
            
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Voice:</label>
                      <select
                        className={`w-full p-2 text-lg bg-white border-2 ${theme_colors.border} rounded-md focus:outline-none`}
                        value={voiceIndex}
                        onChange={(e) => setVoiceIndex(Number(e.target.value))}
                      >
                        {voices.map((voice, index) => (
                          <option key={index} value={index}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Rate:</label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={rate}
                          onChange={(e) => setRate(Number(e.target.value))}
                          className={`w-full h-2 mr-2 ${theme_colors.slider} rounded-lg appearance-none cursor-pointer`}
                        />
                        <motion.span 
                          key={rate}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="w-10 text-center font-medium"
                        >
                          {rate.toFixed(1)}
                        </motion.span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Pitch:</label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={pitch}
                          onChange={(e) => setPitch(Number(e.target.value))}
                          className={`w-full h-2 mr-2 ${theme_colors.slider} rounded-lg appearance-none cursor-pointer`}
                        />
                        <motion.span 
                          key={pitch}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="w-10 text-center font-medium"
                        >
                          {pitch.toFixed(1)}
                        </motion.span>
                      </div>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {processedText !== text && processedText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`p-4 mb-6 text-sm border rounded-lg ${theme_colors.bgLight}`}
                        style={{ borderColor: theme_colors.highlight[0] }}
                      >
                        <div className="font-medium mb-2" style={{ color: theme_colors.highlight[1] }}>Filtered text preview:</div>
                        <div className="mt-1 text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                          {displayLines.map((line, index) => (
                            <p key={index} dangerouslySetInnerHTML={{ __html: line }}></p>
                          ))}
                          
                          {hasMoreLines && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setShowFullPreview(!showFullPreview)}
                              className="mt-2 px-3 py-1 text-xs font-medium rounded-md shadow-sm"
                              style={{ 
                                backgroundColor: theme_colors.highlight[0],
                                color: 'white'
                              }}
                            >
                              {showFullPreview ? 'Show Less' : 'Read More'}
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 15px 25px -5px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                animate={isSpeaking ? 
                  { background: theme_colors.highlight, transition: { duration: 2, repeat: Infinity }} : 
                  { background: theme_colors.highlight[0] }}
                onClick={handleSpeak}
                disabled={!text}
                className={`relative flex items-center justify-center px-10 py-4 text-lg font-medium text-white rounded-full shadow-lg transition-colors ${!text ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <motion.span 
                  animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
                >
                  {isSpeaking ? 'Stop' : 'Speak'}
                </motion.span>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isSpeaking ? 
                    { scale: [1, 1.2, 1], opacity: [0.7, 0.5, 0.7], transition: { duration: 1, repeat: Infinity }} : 
                    { scale: 0 }}
                  className="absolute inset-0 border-2 border-white rounded-full"
                ></motion.div>
              </motion.button>
              
              <AnimatePresence>
                {(text.includes('*') || text.includes('#')) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-sm text-gray-600"
                  >
                    Note: * and # symbols will not be spoken
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSpeaking && (
          <motion.div 
            className="fixed bottom-10 left-0 right-0 flex justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <motion.div 
              className="flex items-center p-4 bg-white rounded-full shadow-lg ml-50"
              animate={{ boxShadow: ["0 10px 15px -3px rgba(0, 0, 0, 0.1)", "0 20px 25px -5px rgba(0, 0, 0, 0.2)", "0 10px 15px -3px rgba(0, 0, 0, 0.1)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: ["6px", "16px", "6px"],
                      backgroundColor: theme_colors.highlight,
                      transition: {
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.1,
                      }
                    }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme_colors.highlight[0] }}
                  ></motion.div>
                ))}
              </div>
              <span className="ml-4 text-sm font-medium text-gray-700">Speaking...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </motion.div>
  );
};

export default TTSComponent;