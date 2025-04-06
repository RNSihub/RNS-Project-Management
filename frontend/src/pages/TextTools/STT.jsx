import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STTComponent = () => {
  // Main state variables
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [interimResult, setInterimResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('blue');
  const [showIntro, setShowIntro] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('en-US');
  const [recordingTime, setRecordingTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [savedTranscripts, setSavedTranscripts] = useState([]);
  const [fileFormat, setFileFormat] = useState('txt');
  const [continuousMode, setContinuousMode] = useState(true);
  const [showSavedTranscripts, setShowSavedTranscripts] = useState(false);
  
  // References
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);
  
  // List of available languages
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'hi-IN', name: 'Hindi' },
  ];

  // Check for browser support and initialize recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuousMode;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
        startTimer();
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // If we're supposed to be listening but it ended, restart
          if (continuousMode) {
            recognitionRef.current.start();
          } else {
            setIsListening(false);
            stopTimer();
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setErrorMessage(`Error: ${event.error}`);
        setIsListening(false);
        stopTimer();
      };
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let maxConfidence = 0;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            maxConfidence = Math.max(maxConfidence, event.results[i][0].confidence * 100);
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          setInterimResult('');
          setConfidence(maxConfidence);
        } else {
          setInterimResult(interimTranscript);
        }
      };
    } else {
      setRecognitionSupported(false);
    }
    
    // Auto-hide intro after 4 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      stopRecognition();
    };
  }, [language, continuousMode]);
  
  // Update word and character counts when transcript changes
  useEffect(() => {
    // Count words (trim to handle extra spaces)
    const words = transcript.trim().split(/\s+/);
    setWordCount(transcript.trim() ? words.length : 0);
    
    // Count characters (excluding spaces)
    setCharCount(transcript.replace(/\s/g, '').length);
  }, [transcript]);
  
  // Timer for recording duration
  const startTimer = () => {
    setRecordingTime(0);
    stopTimer();
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Convert seconds to MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };
  
  // Start the speech recognition
  const startRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
      recognitionRef.current.continuous = continuousMode;
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        // If already started, stop and restart
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      }
    }
  };
  
  // Stop the speech recognition
  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopTimer();
    }
  };
  
  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
    setInterimResult('');
    setWordCount(0);
    setCharCount(0);
    setConfidence(0);
  };
  
  // Copy transcript to clipboard
  const copyToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Save transcript
  const saveTranscript = () => {
    if (transcript.trim()) {
      const newTranscript = {
        id: Date.now(),
        text: transcript,
        date: new Date().toLocaleString(),
        language: languages.find(lang => lang.code === language).name,
        wordCount,
      };
      
      setSavedTranscripts(prev => [newTranscript, ...prev]);
      
      // Show notification
      const notification = new Notification('Transcript Saved', {
        body: `${wordCount} words saved successfully`,
        icon: '/favicon.ico'
      });
    }
  };
  
  // Download transcript
  const downloadTranscript = () => {
    if (transcript) {
      let content = transcript;
      let mimeType = 'text/plain';
      let extension = 'txt';
      
      if (fileFormat === 'json') {
        content = JSON.stringify({
          transcript,
          date: new Date().toISOString(),
          language,
          wordCount,
          charCount,
          duration: recordingTime
        }, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else if (fileFormat === 'html') {
        content = `<!DOCTYPE html>
<html>
<head>
  <title>Speech Transcript</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563EB; }
    .info { color: #6B7280; font-size: 0.9em; margin-bottom: 20px; }
    .transcript { background: #F3F4F6; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Speech Transcript</h1>
  <div class="info">
    <p>Date: ${new Date().toLocaleString()}</p>
    <p>Language: ${languages.find(lang => lang.code === language).name}</p>
    <p>Word count: ${wordCount}</p>
    <p>Character count: ${charCount}</p>
    <p>Duration: ${formatTime(recordingTime)}</p>
  </div>
  <div class="transcript">
    <p>${transcript.replace(/\n/g, '<br>')}</p>
  </div>
</body>
</html>`;
        mimeType = 'text/html';
        extension = 'html';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  // Delete saved transcript
  const deleteTranscript = (id) => {
    setSavedTranscripts(prev => prev.filter(item => item.id !== id));
  };
  
  // Load saved transcript
  const loadTranscript = (text) => {
    setTranscript(text);
    setShowSavedTranscripts(false);
  };
  
  // Get theme colors
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
          pulseRing: 'ring-purple-400',
          highlight: 'bg-purple-500'
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
          pulseRing: 'ring-teal-400',
          highlight: 'bg-teal-500'
        };
      case 'amber':
        return {
          primary: 'from-amber-500 to-orange-600',
          light: 'from-amber-50 to-orange-100',
          button: 'bg-amber-600 hover:bg-amber-700',
          accent: 'amber',
          bgLight: 'bg-amber-50',
          border: 'border-amber-300 focus:border-amber-500 focus:ring-amber-200',
          slider: 'bg-amber-200',
          pulseRing: 'ring-amber-400', 
          highlight: 'bg-amber-500'
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
          pulseRing: 'ring-blue-400',
          highlight: 'bg-blue-500'
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
  
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 0.9, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const confidenceBarVariants = {
    initial: { width: 0 },
    animate: (custom) => ({
      width: `${custom}%`,
      transition: { duration: 0.8, ease: "easeOut" }
    })
  };

  // If speech recognition is not supported
  if (!recognitionSupported) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-100 to-red-200">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="text-xl text-red-600">Speech recognition is not supported in this browser.</h2>
          <p className="mt-2 text-gray-600">Please try using Chrome, Edge, or Safari.</p>
        </motion.div>
      </div>
    );
  }

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
              <span>✨ Welcome to the enhanced Speech-to-Text application! Start speaking to convert your voice to text. ✨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Selector */}
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
              onClick={() => setTheme('blue')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ${theme === 'blue' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme('purple')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 ${theme === 'purple' ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme('teal')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 ${theme === 'teal' ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme('amber')}
              className={`w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 ${theme === 'amber' ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
            />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 w-full">
        {/* Header and Logo */}
        <motion.div 
          variants={itemVariants} 
          className="flex items-center justify-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-16 h-16 bg-gradient-to-br ${theme_colors.primary} rounded-full flex items-center justify-center shadow-lg mb-4`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-center text-gray-800 mb-8"
        >
          Speech to Text Converter
        </motion.h1>

        {/* Main Container */}
        <motion.div
          variants={itemVariants}
          className="w-full bg-white rounded-xl shadow-xl overflow-hidden mb-8"
        >
          <div className="p-8">
            {/* Stats Bar */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-between mb-6 p-3 rounded-lg"
              style={{ backgroundColor: `${theme_colors.bgLight}` }}
            >
              <div className="flex items-center space-x-2 mb-2 md:mb-0">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Words: {wordCount}</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2 md:mb-0">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Characters: {charCount}</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2 md:mb-0">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium">Language: {languages.find(lang => lang.code === language)?.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Duration: {formatTime(recordingTime)}</span>
              </div>
            </motion.div>
            
            {/* Confidence Bar */}
            {confidence > 0 && (
              <motion.div 
                variants={itemVariants}
                className="mb-6"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Confidence Level</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(confidence)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div 
                    className={`h-2.5 rounded-full ${theme_colors.highlight}`}
                    custom={confidence}
                    variants={confidenceBarVariants}
                    initial="initial"
                    animate="animate"
                  ></motion.div>
                </div>
              </motion.div>
            )}

            {/* Text Area */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative mb-6"
            >
              <textarea
                ref={textareaRef}
                className={`w-full h-40 p-4 text-lg ${theme_colors.bgLight} border-2 ${theme_colors.border} rounded-lg transition-all duration-300`}
                placeholder="Your transcribed text will appear here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              
              {/* Interim results */}
              {interimResult && isListening && (
                <div className="absolute bottom-4 left-4 right-4 text-gray-500 italic">
                  {interimResult}
                </div>
              )}
              
              {/* Action buttons for transcript */}
              {transcript && (
                <motion.div className="absolute top-2 right-2 flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyToClipboard}
                    className="p-2 text-gray-500 bg-white rounded-full hover:bg-gray-100 shadow"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={clearTranscript}
                    className="p-2 text-gray-500 bg-white rounded-full hover:bg-gray-100 shadow"
                    title="Clear transcript"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
            
            {/* Copy notification */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 p-2 text-sm text-center text-white rounded-md bg-green-500"
                >
                  Copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 p-2 text-sm text-center text-white rounded-md bg-red-500"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Settings Toggle */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-all duration-300 shadow-sm ${showSettings ? theme_colors.bgLight : 'bg-white'}`}
                style={{ borderColor: showSettings ? theme_colors.accent : '#D1D5DB' }}
              >
                {showSettings ? 'Hide Settings' : 'Show Settings'}
              </motion.button>
            </motion.div>
            
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden mb-6"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Language Selector */}
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Language:</label>
                      <select
                        className={`w-full p-2 text-lg bg-white border-2 ${theme_colors.border} rounded-md focus:outline-none`}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isListening}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                    
                    {/* Recognition Mode */}
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Recognition Mode:</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={continuousMode}
                            onChange={() => setContinuousMode(true)}
                            disabled={isListening}
                          />
                          <span className="ml-2">Continuous</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={!continuousMode}
                            onChange={() => setContinuousMode(false)}
                            disabled={isListening}
                          />
                          <span className="ml-2">Single Session</span>
                        </label>
                      </div>
                    </motion.div>
                    
                    {/* File Format */}
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Export Format:</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={fileFormat === 'txt'}
                            onChange={() => setFileFormat('txt')}
                          />
                          <span className="ml-2">TXT</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={fileFormat === 'json'}
                            onChange={() => setFileFormat('json')}
                          />
                          <span className="ml-2">JSON</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={fileFormat === 'html'}
                            onChange={() => setFileFormat('html')}
                          />
                          <span className="ml-2">HTML</span>
                        </label>
                      </div>
                    </motion.div>
                    
                    {/* Save/Load Management */}
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`p-4 ${theme_colors.bgLight} rounded-lg`}
                    >
                      <label className="block mb-2 text-lg font-medium text-gray-700">Saved Transcripts:</label>
                      <button
                        onClick={() => setShowSavedTranscripts(!showSavedTranscripts)}
                        className={`w-full p-2 text-white rounded-md transition-colors ${theme_colors.button}`}
                      >
                        {showSavedTranscripts ? 'Hide Saved Transcripts' : 'Show Saved Transcripts'}
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Saved Transcripts Panel */}
            <AnimatePresence>
              {showSavedTranscripts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className={`p-4 ${theme_colors.bgLight} rounded-lg max-h-60 overflow-y-auto`}>
                    {savedTranscripts.length > 0 ? (
                      <ul className="divide-y divide-gray-300">
                        {savedTranscripts.map((item) => (
                          <li key={item.id} className="py-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium truncate">{item.text.substring(0, 50)}...</p>
                                <p className="text-sm text-gray-500">{item.date} • {item.language} • {item.wordCount} words</p>
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => loadTranscript(item.text)}
                                  className="p-1 text-white bg-green-500 rounded-md hover:bg-green-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => deleteTranscript(item.id)}
                                  className="p-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500">No saved transcripts yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 justify-center"
            >
              {/* Main Action Button - Start/Stop Listening */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={`relative inline-flex items-center justify-center w-full md:w-auto px-8 py-4 text-lg font-medium text-white rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 hover:bg-red-600' : `${theme_colors.button}`}`}
              >
                {isListening ? (
                  <>
                    <motion.span
                      animate="pulse"
                      variants={pulseVariants}
                      className={`absolute inset-0 rounded-full ${theme_colors.pulseRing} opacity-75`}
                    ></motion.span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      Stop Listening
                    </span>
                  </>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Start Listening
                  </span>
                )}
              </motion.button>
              
              {/* Additional Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center mt-4 w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearTranscript}
                  disabled={!transcript}
                  className={`px-4 py-2 rounded-md shadow transition-colors ${transcript ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Clear
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  disabled={!transcript}
                  className={`px-4 py-2 rounded-md shadow transition-colors ${transcript ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Copy
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveTranscript}
                  disabled={!transcript}
                  className={`px-4 py-2 rounded-md shadow transition-colors ${transcript ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Save
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadTranscript}
                  disabled={!transcript}
                  className={`px-4 py-2 rounded-md shadow transition-colors ${transcript ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Download
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="text-center text-gray-600 mt-8 text-sm"
        >
          <p>Speech recognition powered by Web Speech API.</p>
          <p className="mt-1">© {new Date().getFullYear()} Speech-to-Text Converter. All rights reserved.</p>
        </motion.footer>
      </div>
    </motion.div>
  );
};

export default STTComponent;