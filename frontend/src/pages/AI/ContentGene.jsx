import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const ContentGenerator = () => {
  const [requirement, setRequirement] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [savedContents, setSavedContents] = useState([]);
  const [theme, setTheme] = useState('light');
  const [viewMode, setViewMode] = useState('default');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const inspirationExamples = [
    {
      title: "Create a user profile page with custom avatar upload",
      
    },
    {
      title: "Design a notification system with read/unread status",
      
    },
    {
      title: "Implement a dark mode toggle with user preference saving",
      
    },
    {
      title: "Add a dashboard with key performance metrics",
     
    },
    {
      title: "Create a multi-step onboarding wizard",
      
    }
  ];

  useEffect(() => {
    const randomSuggestions = inspirationExamples
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setAiSuggestions(randomSuggestions);

    const isFirstVisit = !localStorage.getItem('visited');
    if (isFirstVisit) {
      setTimeout(() => setShowTour(true), 1000);
      localStorage.setItem('visited', 'true');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requirement.trim()) {
      setError('Please enter a requirement');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirement,
          format: 'detailed',
          theme: theme
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const content = `User Story:\n${generatedContent.user_story}\n\nAcceptance Criteria:\n${generatedContent.acceptance_criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);

    confetti({
      particleCount: 30,
      spread: 30,
      origin: { x: 0.8, y: 0.3 }
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedContent) return;

    const newSavedItem = {
      id: Date.now(),
      requirement,
      content: generatedContent,
      timestamp: new Date().toISOString()
    };

    setSavedContents([newSavedItem, ...savedContents]);
    setError({ isSuccess: true, message: 'Content saved to your collection!' });
    setTimeout(() => setError(null), 3000);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleReset = () => {
    setRequirement('');
    setGeneratedContent(null);
    setError(null);
    setCopied(false);
    setActiveTab('story');
  };

  const handleInspirationClick = (example) => {
    setRequirement(example.title);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'default' ? 'focus' : 'default');
  };

  const nextTourStep = () => {
    if (tourStep < 4) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      setTourStep(0);
    }
  };

  const gradientBg = theme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50';

  const glassPanel = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700/50'
    : 'bg-white/80 backdrop-blur-md border border-gray-200/50';

  const card3dHover = {
    rest: { scale: 1, transition: { duration: 0.2 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  return (
    <div className={`min-h-screen ${gradientBg} transition-colors duration-500`}>
      <div className="fixed inset-0 overflow-hidden -z-10">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-900/20 rounded-full filter blur-3xl"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl"></div>
          </>
        )}
      </div>

      <div className={`container max-w-6xl mx-auto py-8 px-4 transition-all duration-500 ${viewMode === 'focus' ? 'max-w-3xl' : 'max-w-6xl'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex justify-between items-center mb-8 ${viewMode === 'focus' ? 'mb-4' : 'mb-8'}`}
        >
          <div className="flex items-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className={`mr-3 p-2 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </motion.div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} tracking-tight`}>
              AI Content Builder
              <span className={`ml-2 text-sm font-normal px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
                Pro
              </span>
            </h1>
          </div>

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleViewMode}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              aria-label={viewMode === 'focus' ? 'Exit focus mode' : 'Enter focus mode'}
            >
              {viewMode === 'focus' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'} transition-colors`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTour(true)}
              className={`text-sm px-3 py-1 rounded-full ${
                theme === 'dark'
                  ? 'bg-blue-700 hover:bg-blue-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              Help
            </motion.button>
          </div>
        </motion.div>

        <div className={`grid ${viewMode === 'focus' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'} gap-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${viewMode === 'focus' ? '' : 'lg:col-span-3'} rounded-xl shadow-lg ${glassPanel}`}
            layout
          >
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="requirement" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Requirement Text
                    </label>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {requirement.length} characters
                    </span>
                  </div>

                  {!requirement && (
                    <div className="mb-3">
                      <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Need inspiration? Try one of these:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleInspirationClick(suggestion)}
                            className={`text-xs px-3 py-1.5 rounded-full ${
                              theme === 'dark'
                                ? 'bg-blue-900/50 hover:bg-blue-800 text-blue-200'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                            } transition-colors`}
                          >
                            <strong>{suggestion.title}</strong>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <textarea
                      id="requirement"
                      rows="5"
                      className={`w-full p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700/70 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Describe your requirement in detail... What feature do you want to build? Who is it for? What problem does it solve?"
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      required
                    />
                  </motion.div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold flex justify-center items-center space-x-2 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    } text-white focus:outline-none disabled:opacity-60 transition shadow-md`}
                  >
                    {loading ? (
                      <>
                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 relative">
                            <div className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75"></div>
                            <div className="animate-pulse absolute h-full w-full rounded-full bg-white"></div>
                          </div>
                          <span>Generating...</span>
                        </div>
                      </>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Content
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleReset}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`py-3 px-4 rounded-xl font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } focus:outline-none transition`}
                  >
                    Reset
                  </motion.button>
                </div>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 p-3 rounded-xl ${
                      error.isSuccess
                        ? 'bg-green-100/80 text-green-800 border border-green-200'
                        : 'bg-red-100/80 text-red-800 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {error.isSuccess ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {error.message || error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {loading && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <g fill="none" stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'} strokeWidth="2">
                      <circle cx="50" cy="15" r="5" className="animate-pulse" style={{ animationDelay: '0ms' }} />
                      <circle cx="30" cy="40" r="5" className="animate-pulse" style={{ animationDelay: '150ms' }} />
                      <circle cx="50" cy="40" r="5" className="animate-pulse" style={{ animationDelay: '300ms' }} />
                      <circle cx="70" cy="40" r="5" className="animate-pulse" style={{ animationDelay: '450ms' }} />
                      <circle cx="30" cy="70" r="5" className="animate-pulse" style={{ animationDelay: '600ms' }} />
                      <circle cx="50" cy="70" r="5" className="animate-pulse" style={{ animationDelay: '750ms' }} />
                      <circle cx="70" cy="70" r="5" className="animate-pulse" style={{ animationDelay: '900ms' }} />
                      <circle cx="50" cy="95" r="5" className="animate-pulse" style={{ animationDelay: '1050ms' }} />
                      <path d="M50,20 L30,35" className="animate-dash" />
                      <path d="M50,20 L50,35" className="animate-dash" style={{ animationDelay: '100ms' }} />
                      <path d="M50,20 L70,35" className="animate-dash" style={{ animationDelay: '200ms' }} />
                      <path d="M30,45 L30,65" className="animate-dash" style={{ animationDelay: '300ms' }} />
                      <path d="M50,45 L30,65" className="animate-dash" style={{ animationDelay: '400ms' }} />
                      <path d="M50,45 L50,65" className="animate-dash" style={{ animationDelay: '500ms' }} />
                      <path d="M50,45 L70,65" className="animate-dash" style={{ animationDelay: '600ms' }} />
                      <path d="M70,45 L30,65" className="animate-dash" style={{ animationDelay: '700ms' }} />
                      <path d="M70,45 L50,65" className="animate-dash" style={{ animationDelay: '800ms' }} />
                      <path d="M70,45 L70,65" className="animate-dash" style={{ animationDelay: '900ms' }} />
                      <path d="M30,75 L50,90" className="animate-dash" style={{ animationDelay: '1000ms' }} />
                      <path d="M50,75 L50,90" className="animate-dash" style={{ animationDelay: '1100ms' }} />
                      <path d="M70,75 L50,90" className="animate-dash" style={{ animationDelay: '1200ms' }} />
                    </g>
                  </svg>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`mt-6 text-lg font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}
                >
                  Creating amazing content...
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className={`h-1 mt-3 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}
                />
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Analyzing requirements and crafting content</p>
              </div>
            )}

            <AnimatePresence>
              {generatedContent && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Generated Content</h2>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium flex items-center ${
                          copied
                            ? theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-500 text-white'
                            : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        } transition-colors`}
                      >
                        {copied ? (
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </span>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium flex items-center ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                        } text-white transition-colors`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                      </motion.button>
                    </div>
                  </div>

                  <div className={`mb-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex">
                      <motion.button
                        onClick={() => setActiveTab('story')}
                        whileHover={{ y: -2 }}
                        className={`py-2 px-4 font-medium text-sm relative ${
                          activeTab === 'story'
                            ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        User Story
                        {activeTab === 'story' && (
                          <motion.div
                            layoutId="active-tab-indicator"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
                            }`}
                          />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => setActiveTab('criteria')}
                        whileHover={{ y: -2 }}
                        className={`py-2 px-4 font-medium text-sm relative ${
                          activeTab === 'criteria'
                            ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Acceptance Criteria
                        {activeTab === 'criteria' && (
                          <motion.div
                            layoutId="active-tab-indicator"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
                            }`}
                          />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {activeTab === 'story' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark'
                            ? 'bg-gray-800/70 border-gray-700 text-white'
                            : 'bg-white/70 border-gray-300 text-gray-900'
                        }`}
                      >
                        <h3 className="text-lg font-semibold mb-2">User Story</h3>
                        <p>{generatedContent.user_story}</p>
                      </motion.div>
                    )}
                    {activeTab === 'criteria' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark'
                            ? 'bg-gray-800/70 border-gray-700 text-white'
                            : 'bg-white/70 border-gray-300 text-gray-900'
                        }`}
                      >
                        <h3 className="text-lg font-semibold mb-2">Acceptance Criteria</h3>
                        <ul className="list-decimal pl-5">
                          {generatedContent.acceptance_criteria.map((criterion, index) => (
                            <li key={index} className="mb-2">
                              {criterion}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`${viewMode === 'focus' ? 'hidden' : 'lg:block'} lg:col-span-2 rounded-xl shadow-lg ${glassPanel}`}
          >
            <div className="p-6">
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Saved Content
              </h2>
              {savedContents.length > 0 ? (
                <ul className="space-y-4">
                  {savedContents.map((content) => (
                    <motion.li
                      key={content.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl ${
                        theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-700 text-white'
                          : 'bg-white/70 border-gray-300 text-gray-900'
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-2">{content.requirement}</h3>
                      <p className="text-sm text-gray-500">{new Date(content.timestamp).toLocaleString()}</p>
                      <p className="mt-2">{content.content.user_story}</p>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No saved content yet.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {showTour && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4">Welcome to AI Content Builder!</h2>
              <p className="mb-4">
                {tourStep === 0 && 'Step 1: Enter your requirement in the text area.'}
                {tourStep === 1 && 'Step 2: Click "Generate Content" to create your user story and acceptance criteria.'}
                {tourStep === 2 && 'Step 3: Copy or save the generated content.'}
                {tourStep === 3 && 'Step 4: Switch between light and dark themes using the theme toggle.'}
                {tourStep === 4 && 'Step 5: Use focus mode to minimize distractions.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextTourStep}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl"
              >
                {tourStep < 4 ? 'Next' : 'Got it!'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
