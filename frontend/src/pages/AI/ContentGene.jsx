import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
// import { v4 as uuidv4 } from 'uuid'; // Uncomment if you have uuid installed

const ContentGenerator = () => {
  const [requirement, setRequirement] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [savedContents, setSavedContents] = useState([]);
  const [viewMode, setViewMode] = useState('default');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [outputFormat, setOutputFormat] = useState('clean');
  const [selectedSavedContent, setSelectedSavedContent] = useState(null);

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

  // Output formatting options
  const formatOptions = [
    { id: 'clean', name: 'Clean Format', description: 'Clear text without special characters' },
    { id: 'markdown', name: 'Markdown', description: 'Properly formatted with headings and emphasis' },
    { id: 'structured', name: 'Structured', description: 'Well-organized with clear sections' }
  ];

  useEffect(() => {
    const randomSuggestions = inspirationExamples
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setAiSuggestions(randomSuggestions);

    // Check for user ID or create a new one
    let userId = localStorage.getItem('userId');
    if (!userId) {
      // If you have uuid installed:
      // userId = uuidv4();
      // Or use a simpler approach:
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userId', userId);
    }

    // Fetch saved content from the server
    const fetchSavedContent = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/get-saved-contents/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            limit: 10
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved content');
        }

        const data = await response.json();

        if (data.success && data.contents) {
          // Transform the data to match the expected format
          const formattedContents = data.contents.map(item => ({
            id: item._id,
            requirement: item.requirement,
            content: {
              user_story: item.user_story,
              acceptance_criteria: item.acceptance_criteria
            },
            timestamp: item.created_at
          }));

          setSavedContents(formattedContents);
        }
      } catch (error) {
        console.error('Error fetching saved content:', error);
      }
    };

    fetchSavedContent();

    const isFirstVisit = !localStorage.getItem('visited');
    if (isFirstVisit) {
      setTimeout(() => setShowTour(true), 1000);
      localStorage.setItem('visited', 'true');
    }
  }, []);

  // Format the generated content based on selected output format
  const formatContent = (content, format) => {
    if (!content) return content;

    let formattedContent = {...content};

    switch(format) {
      case 'clean':
        // Remove any markdown characters like * # etc.
        formattedContent.user_story = content.user_story.replace(/[*#_~`]/g, '');
        formattedContent.acceptance_criteria = content.acceptance_criteria.map(
          criteria => criteria.replace(/[*#_~`]/g, '')
        );
        break;

      case 'markdown':
        // Add proper markdown formatting
        formattedContent.user_story = content.user_story
          .replace(/^As a/i, "**As a")
          .replace(/I want to/, "** I want to")
          .replace(/so that/, "so that");

        formattedContent.acceptance_criteria = content.acceptance_criteria.map(
          (criteria, index) => `**${index + 1}.** ${criteria}`
        );
        break;

      case 'structured':
        // Create well-structured content with clear sections
        const parts = content.user_story.match(/As a (.*?), I want to (.*?) so that (.*)/i);

        if (parts && parts.length >= 4) {
          formattedContent.user_story = `ROLE: ${parts[1]}\nGOAL: ${parts[2]}\nBENEFIT: ${parts[3]}`;
        }

        formattedContent.acceptance_criteria = content.acceptance_criteria.map(
          (criteria, index) => `CRITERION ${index + 1}: ${criteria}`
        );
        break;

      default:
        // No formatting changes
        break;
    }

    return formattedContent;
  };

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      // Format the content based on selected output format
      setGeneratedContent(formatContent(data, outputFormat));

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

  const handleSave = async () => {
    if (!generatedContent) return;

    setCopied(false);
    setLoading(true);

    try {
      // Make API call to save content to MongoDB
      const response = await fetch('http://127.0.0.1:8000/api/save-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirement,
          content: generatedContent,
          format: outputFormat, // Save the format used
          user_id: localStorage.getItem('userId') || 'anonymous'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save content');
      }

      const newSavedItem = {
        id: data.id,
        requirement,
        content: generatedContent,
        timestamp: new Date().toISOString()
      };

      setSavedContents([newSavedItem, ...savedContents]);
      setError({ isSuccess: true, message: 'Content saved to your collection!' });

      // Show confetti on successful save
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { x: 0.8, y: 0.5 }
      });

    } catch (err) {
      setError(err.message || 'Failed to save content to the database');
    } finally {
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCopy = () => {
    let content = '';

    // Format the copied content based on the selected output format
    if (outputFormat === 'clean') {
      content = `User Story:\n${generatedContent.user_story}\n\nAcceptance Criteria:\n${generatedContent.acceptance_criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}`;
    } else if (outputFormat === 'markdown') {
      content = `## User Story\n${generatedContent.user_story}\n\n## Acceptance Criteria\n${generatedContent.acceptance_criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}`;
    } else if (outputFormat === 'structured') {
      content = `USER STORY\n${generatedContent.user_story}\n\nACCEPTANCE CRITERIA\n${generatedContent.acceptance_criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}`;
    }

    navigator.clipboard.writeText(content);
    setCopied(true);

    confetti({
      particleCount: 30,
      spread: 30,
      origin: { x: 0.8, y: 0.3 }
    });

    setTimeout(() => setCopied(false), 2000);
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

  // Function to convert formatted content back to display format
  const displayFormattedContent = (content, format, type) => {
    if (!content || !content[type]) return null;

    if (type === 'user_story') {
      switch(format) {
        case 'structured':
          return (
            <div className="space-y-2">
              {content[type].split('\n').map((line, idx) => {
                const [label, text] = line.split(': ');
                return (
                  <div key={idx} className="flex">
                    <span className="font-bold w-24">{label}:</span>
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          );
        case 'markdown':
          return (
            <div dangerouslySetInnerHTML={{
              __html: content[type]
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          );
        default:
          return <p>{content[type]}</p>;
      }
    } else if (type === 'acceptance_criteria') {
      return (
        <ul className="list-decimal pl-5">
          {content[type].map((criterion, index) => {
            if (format === 'structured') {
              const [label, text] = criterion.split(': ');
              return (
                <li key={index} className="mb-2">
                  <span className="font-bold">{label}:</span> {text}
                </li>
              );
            } else if (format === 'markdown') {
              return (
                <li key={index} className="mb-2" dangerouslySetInnerHTML={{
                  __html: criterion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              );
            } else {
              return (
                <li key={index} className="mb-2">{criterion}</li>
              );
            }
          })}
        </ul>
      );
    }

    return null;
  };

  const glassPanel = 'bg-white/80 backdrop-blur-md border border-gray-200/50';

  const card3dHover = {
    rest: { scale: 1, transition: { duration: 0.2 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const handleSavedContentClick = (content) => {
    setSelectedSavedContent(content);
  };

  const handleCloseModal = () => {
    setSelectedSavedContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 transition-colors duration-500">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl"></div>
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
              className="mr-3 p-2 rounded-full bg-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              AI Content Builder
              <span className="ml-2 text-sm font-normal px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                Pro
              </span>
            </h1>
          </div>

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleViewMode}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTour(true)}
              className="text-sm px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
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
                    <label htmlFor="requirement" className="block text-sm font-medium text-gray-700">
                      Requirement Text
                    </label>
                    <span className="text-xs text-gray-500">
                      {requirement.length} characters
                    </span>
                  </div>

                  {!requirement && (
                    <div className="mb-3">
                      <p className="text-xs mb-2 text-gray-500">
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
                            className="text-xs px-3 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
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
                      className="w-full p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white/70 border-gray-300 text-gray-900 placeholder-gray-400"
                      placeholder="Describe your requirement in detail... What feature do you want to build? Who is it for? What problem does it solve?"
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      required
                    />
                  </motion.div>
                </div>

                {/* Format selection buttons */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Output Format:</p>
                  <div className="flex flex-wrap gap-2">
                    {formatOptions.map((format) => (
                      <motion.button
                        key={format.id}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setOutputFormat(format.id)}
                        className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                          outputFormat === format.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-bold">{format.name}</div>
                          <div className="text-xs opacity-80">{format.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold flex justify-center items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white focus:outline-none disabled:opacity-60 transition shadow-md"
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
                    className="py-3 px-4 rounded-xl font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none transition"
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
                    <g fill="none" stroke="#3b82f6" strokeWidth="2">
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
                  className="mt-6 text-lg font-medium text-blue-600"
                >
                  Creating amazing content...
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-1 mt-3 rounded-full bg-blue-500"
                />
                <p className="text-sm mt-2 text-gray-500">Analyzing requirements and crafting content</p>
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
                    <h2 className="text-xl font-bold text-gray-800">Generated Content</h2>
                    <div className="flex space-x-2">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleCopy}
    className={`flex items-center px-2.5 py-1.5 text-sm rounded-lg ${
      copied
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
    }`}
  >
    {copied ? (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Copied!</span>
      </>
    ) : (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>Copy</span>
      </>
    )}
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleSave}
    className="flex items-center px-2.5 py-1.5 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
    <span>Save</span>
  </motion.button>
</div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        User Story
                      </div>
                    </div>
                    <div className="mb-2 text-sm sm:text-base">
                      {displayFormattedContent(generatedContent, outputFormat, 'user_story')}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Acceptance Criteria
                      </div>
                    </div>
                    <div className="text-sm sm:text-base">
                      {displayFormattedContent(generatedContent, outputFormat, 'acceptance_criteria')}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {viewMode !== 'focus' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 rounded-xl shadow-lg overflow-hidden"
              layout
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Saved Content Library
                </h2>
              </div>

              <div className={`max-h-[calc(100vh-220px)] overflow-y-auto ${glassPanel}`}>
                {savedContents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No saved content yet</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Your saved content will appear here
                    </p>
                    <button
                      onClick={() => setShowTour(true)}
                      className="text-sm px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                    >
                      Learn how to use
                    </button>
                  </div>
                ) : (
                  <div className="p-3">
                    {savedContents.map((savedItem, index) => (
                      <motion.div
                        key={savedItem.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white mb-3 rounded-lg border border-gray-200 overflow-hidden"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => handleSavedContentClick(savedItem)}
                      >
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                            {savedItem.requirement}
                          </h3>
                          <div className="text-xs text-gray-500 mb-2">
                            {new Date(savedItem.timestamp).toLocaleDateString()} · {new Date(savedItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {savedItem.content?.user_story}
                          </div>
                          <div className="flex space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              User Story
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {savedItem.content?.acceptance_criteria?.length || 0} Criteria
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowTour(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full m-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-1">
                <img
                  src={`/api/placeholder/600/300`}
                  alt="Feature tour"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {tourStep === 0 && "Welcome to AI Content Builder"}
                  {tourStep === 1 && "Generate Feature Content"}
                  {tourStep === 2 && "Choose Output Formats"}
                  {tourStep === 3 && "Save Your Content"}
                  {tourStep === 4 && "Build Your Library"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tourStep === 0 && "Let's learn how to create professional user stories and acceptance criteria in seconds with our AI-powered tool."}
                  {tourStep === 1 && "Type in your feature requirement or choose from our suggestions. The more details you provide, the better the results."}
                  {tourStep === 2 && "Choose from different output formats for your content: clean text, markdown, or structured format."}
                  {tourStep === 3 && "Save your generated content to your library for future reference or copy it directly to use in your project."}
                  {tourStep === 4 && "Access all your saved content in the library panel. You can easily reference and reuse previously created items."}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full ${
                          step === tourStep ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowTour(false)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                    >
                      Skip
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={nextTourStep}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {tourStep < 4 ? "Next" : "Get Started"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSavedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full m-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fixed inset-0 flex items-center justify-center bg-gray-85">
  <div className="bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh] w-full max-w-lg p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Saved Content Details</h3>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">Requirement</h4>
      <p className="text-gray-600">{selectedSavedContent.requirement}</p>
    </div>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">User Story</h4>
      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mb-2">
        User Story
      </div>
      <div className="mb-2 text-sm sm:text-base">
        {displayFormattedContent(selectedSavedContent.content, outputFormat, 'user_story')}
      </div>
    </div>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">Acceptance Criteria</h4>
      <div className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded mb-2">
        Acceptance Criteria
      </div>
      <div className="text-sm sm:text-base">
        {displayFormattedContent(selectedSavedContent.content, outputFormat, 'acceptance_criteria')}
      </div>
    </div>
    <div className="flex justify-end">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCloseModal}
        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
      >
        Close
      </motion.button>
    </div>
  </div>
</div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentGenerator;
