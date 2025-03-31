import React, { useState, useEffect, useRef } from 'react';
import { ClipboardCopy, Download, Plus, Send, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);
  const [theme, setTheme] = useState('light');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial greeting message with a delay for animation effect
    setTimeout(() => {
      setMessages([
        {
          text: "Hello! I'm RNS Project Assistance. How can I help you today?",
          sender: 'bot',
          id: Date.now(),
        },
      ]);
    }, 500);
    
    // Focus input on load
    inputRef.current?.focus();
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    
    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat with unique ID
    const userMessage = { text: input, sender: 'user', id: Date.now() };
    setMessages((messages) => [...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Send message to backend
      const response = await fetch('http://127.0.0.1:8000/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add bot response to chat with proper formatting and unique ID
      setMessages((messages) => [
        ...messages,
        { 
          text: formatBotResponse(data.response), 
          sender: 'bot',
          id: Date.now()
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        {
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'bot',
          id: Date.now()
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Enhanced formatting for bot responses
  const formatBotResponse = (text) => {
    // Replace markdown links with HTML links
    let formattedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-300">$1</a>');
    
    // Format code blocks with syntax highlighting
    formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-2 overflow-x-auto transition-colors duration-300"><code>$2</code></pre>');
    
    // Convert inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono transition-colors duration-300">$1</code>');
    
    // Convert headings
    formattedText = formattedText.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');
    formattedText = formattedText.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold my-3">$1</h2>');
    formattedText = formattedText.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>');
    
    // Convert bold and italic
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert bullet lists
    formattedText = formattedText.replace(/^\- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');
    formattedText = formattedText.replace(/(<li.*<\/li>)(?=\n<li)/g, '$1');
    formattedText = formattedText.replace(/(?<=\n)<li/g, '<ul class="my-2 space-y-1"><li');
    formattedText = formattedText.replace(/<\/li>(?!\n<li)/g, '</li></ul>');
    
    // Convert numbered lists
    formattedText = formattedText.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>');
    
    // Convert paragraphs (lines with content)
    formattedText = formattedText.replace(/^(?!<[uo]l|<li|<h[1-6]|<pre|<code)(.+)$/gm, '<p class="my-2">$1</p>');
    
    return formattedText;
  };

  const copyMessageToClipboard = (text, id) => {
    // Strip HTML tags for clean copy
    const cleanText = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopyStatus(id);
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  const startNewChat = () => {
    // Add animation by clearing and then adding the initial message
    setMessages([]);
    setTimeout(() => {
      setMessages([
        {
          text: "Hello! I'm RNS Project Assistance. How can I help you today?",
          sender: 'bot',
          id: Date.now(),
        },
      ]);
    }, 300);
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'RNS Assistant'}: ${msg.text.replace(/<[^>]*>/g, '')}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rns-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Message animation variants for framer-motion
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'light' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <motion.header 
        className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-800 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-blue-800'} text-white p-4 shadow-lg`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.h2 
            className="text-xl font-bold flex items-center"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.span 
              className="mr-2 inline-block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 5 }}
            >
              🤖
            </motion.span>
            RNS Project Assistance
          </motion.h2>
          <div className="flex space-x-3">
            <motion.button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-all duration-200 flex items-center"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </motion.button>
            <motion.button 
              onClick={startNewChat}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-all duration-200 flex items-center"
              title="Start new chat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
            </motion.button>
            <motion.button 
              onClick={downloadChat}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-all duration-200 flex items-center"
              title="Download chat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={20} />
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      {/* Chat Messages */}
      <div 
        ref={chatContainerRef} 
        className={`flex-1 overflow-y-auto p-4 space-y-4 max-w-7xl w-full mx-auto ${theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <motion.div
                className={`relative max-w-xl p-4 rounded-xl shadow-md ${
                  message.sender === 'user'
                    ? `${theme === 'dark' ? 'bg-gradient-to-br from-blue-700 to-blue-900' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white`
                    : `${theme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`
                } transition-all duration-300 hover:shadow-lg`}
                whileHover={{ scale: 1.01 }}
              >
                <div 
                  className={`${theme === 'dark' ? 'prose-dark' : 'prose-light'} break-words max-w-none`}
                  dangerouslySetInnerHTML={{ __html: message.text }}
                />
                
                <motion.button 
                  onClick={() => copyMessageToClipboard(message.text, message.id)}
                  className={`absolute -top-2 -right-2 p-1.5 rounded-full ${
                    copyStatus === message.id 
                      ? 'bg-green-500' 
                      : message.sender === 'user' 
                        ? `${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-700'}` 
                        : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`
                  } opacity-0 group-hover:opacity-100 transition-all duration-200`}
                  title="Copy message"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copyStatus === message.id ? (
                    <CheckCircle size={14} className="text-white" />
                  ) : (
                    <ClipboardCopy size={14} className={message.sender === 'user' ? 'text-white' : `${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 rounded-lg shadow border transition-colors duration-300`}>
              <div className="flex space-x-2">
                <motion.div 
                  className={`w-2 h-2 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'} rounded-full`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
                <motion.div 
                  className={`w-2 h-2 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'} rounded-full`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                />
                <motion.div 
                  className={`w-2 h-2 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'} rounded-full`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <motion.form
        onSubmit={handleSendMessage}
        className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 shadow-lg transition-colors duration-300`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className={`w-full py-3 px-5 border ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-gray-50 text-gray-900'
              } rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-300`}
            />
            {input.length > 0 && (
              <motion.span 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {input.length}
              </motion.span>
            )}
          </div>
          <motion.button
            type="submit"
            className={`${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } text-white p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isTyping}
          >
            {isTyping ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </motion.form>
      
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        /* Custom scrollbar */
        .scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background-color: rgba(229, 231, 235, 0.5);
        }
        
        .scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background-color: rgba(31, 41, 55, 0.5);
        }
        
        /* Typography for markdown in messages */
        .prose-light h1, .prose-light h2, .prose-light h3 {
          color: #1f2937;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .prose-dark h1, .prose-dark h2, .prose-dark h3 {
          color: #f3f4f6;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .prose-light a {
          color: #2563eb;
          text-decoration: none;
        }
        
        .prose-dark a {
          color: #60a5fa;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;