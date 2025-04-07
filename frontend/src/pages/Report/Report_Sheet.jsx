import React, { useState, useEffect } from 'react';

const DailyReportSubmission = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSheetLoaded, setIsSheetLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  useEffect(() => {
    // Set current date in the format: Monday, April 7, 2025
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  }, []);

  // Process Google Sheet URL to get the embed URL
  const processSheetUrl = (url) => {
    try {
      // Check if it's a valid Google Sheets URL
      if (!url.includes('docs.google.com/spreadsheets')) {
        throw new Error('Please enter a valid Google Sheets URL');
      }

      // Extract the sheet ID from the URL
      let sheetId = '';
      if (url.includes('/d/')) {
        sheetId = url.split('/d/')[1].split('/')[0];
      } else if (url.includes('key=')) {
        sheetId = url.split('key=')[1].split('&')[0];
      } else {
        throw new Error('Could not extract sheet ID from URL');
      }

      // Return the embed URL with parameters that maximize in-app experience
      // widget=true keeps it in your app, headers=false removes Google headers
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?embedded=true&widget=true&headers=false&rm=minimal`;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!userName.trim()) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }

    if (!department.trim()) {
      setError('Please select your department');
      setIsLoading(false);
      return;
    }
    
    const embedUrl = processSheetUrl(sheetUrl);
    if (embedUrl) {
      setSheetUrl(embedUrl);
      setIsSheetLoaded(true);
      setShowPopup(false);
      
      // Check if authentication might be needed
      setTimeout(() => {
        const iframe = document.getElementById('sheet-iframe');
        if (iframe) {
          iframe.onload = function() {
            // This won't catch all auth scenarios but helps with some
            if (iframe.contentDocument && 
                iframe.contentDocument.title && 
                iframe.contentDocument.title.includes('Sign in')) {
              setShowAuthOverlay(true);
            } else {
              setIsAuthenticated(true);
            }
          };
        }
      }, 1000);
    }
    
    setIsLoading(false);
  };

  const handleIframeMessage = (event) => {
    // Listen for messages from the iframe
    if (event.data === 'authenticated') {
      setIsAuthenticated(true);
      setShowAuthOverlay(false);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  const handleAuthenticationComplete = () => {
    setShowAuthOverlay(false);
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Daily Report Submission</h1>
              <p className="text-blue-100">{currentDate}</p>
            </div>
            {isSheetLoaded && (
              <div className="flex items-center">
                <div className="mr-4 text-right">
                  <span className="block text-sm text-blue-100">Logged in as</span>
                  <span className="font-medium">{userName} • {department}</span>
                </div>
                <button
                  onClick={() => setShowPopup(true)}
                  className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
                >
                  Change Sheet
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Report Actions Bar - Only shown when sheet is loaded */}
        {isSheetLoaded && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-medium text-blue-800 mr-2">Daily Report Status:</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">In Progress</span>
            </div>
            <div className="flex space-x-3">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Draft
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Report
              </button>
            </div>
          </div>
        )}

        {/* Sheet Display Area */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {isSheetLoaded ? (
            <div className="h-full flex flex-col">
              <div className="p-4 bg-blue-100 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Daily Report Sheet
                </h2>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editable
                  </span>
                </div>
              </div>
              
              <div className="relative w-full h-screen">
                <iframe
                  id="sheet-iframe"
                  src={sheetUrl}
                  className="w-full h-full border-none"
                  title="Daily Report Sheet"
                  allowFullScreen
                />
                
                {/* Authentication overlay that appears if sign-in is needed */}
                {showAuthOverlay && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10">
                    <div className="text-center p-8 max-w-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <h3 className="text-xl font-bold text-blue-800 mb-3">Google Authentication Required</h3>
                      <p className="text-gray-600 mb-6">You need to sign in to your Google account to access this sheet. Please complete the sign-in process in the frame below.</p>
                      <p className="text-sm text-gray-500 mb-6">All editing will happen directly in this page after authentication.</p>
                      <button
                        onClick={handleAuthenticationComplete}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition duration-300"
                      >
                        I've Completed Authentication
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
              <div className="text-blue-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.5 2a.5.5 0 0 0-1 0v4.5H3a.5.5 0 0 0 0 1h4.5V12a.5.5 0 0 0 1 0V7.5H13a.5.5 0 0 0 0-1H8.5V2z"/>
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-3">No Daily Report Sheet Loaded</h3>
              <p className="text-gray-600 mb-6">Enter your Google Sheet link to submit your daily report</p>
              <button
                onClick={() => setShowPopup(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition duration-300"
              >
                Start Daily Report
              </button>
            </div>
          )}
        </div>

        {/* Instructions (only shown when no sheet is loaded) */}
        {!isSheetLoaded && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Daily Report Instructions:</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Click the "Start Daily Report" button above</li>
              <li>Enter your name and select your department</li>
              <li>Paste your team's Google Sheet template URL</li>
              <li>If prompted, sign in to your Google account (one-time only)</li>
              <li>Complete your report directly on this page</li>
              <li>Click "Submit Report" when finished</li>
            </ol>
          </div>
        )}

        {/* Quick Tips (only shown when sheet is loaded) */}
        {isSheetLoaded && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Quick Tips:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Be specific about completed tasks and include metrics where possible
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Highlight any blockers or challenges that need management attention
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                List your priority tasks for tomorrow to help with planning
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All changes are automatically saved as you type
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-3 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Company Daily Reporting System</p>
        </div>
      </footer>

      {/* Pop-up Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border-t-4 border-blue-600">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Daily Report Submission
            </h2>
              
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="userName" className="block text-gray-700 text-sm font-medium mb-2">
                  Your Name:
                </label>
                <input
                  type="text"
                  id="userName"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="department" className="block text-gray-700 text-sm font-medium mb-2">
                  Department:
                </label>
                <select
                  id="department"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="sheetUrl" className="block text-gray-700 text-sm font-medium mb-2">
                  Google Sheet URL:
                </label>
                <input
                  type="text"
                  id="sheetUrl"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Paste the link to your team's daily report sheet</p>
                {error && (
                  <p className="mt-2 text-red-500 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Open Sheet
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportSubmission;