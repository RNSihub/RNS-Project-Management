import React, { useState } from 'react';

const MailDrafter = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [userDetails, setUserDetails] = useState({
    name: '',
    class: '',
    productFactoryNumber: '',
    role: 'student',
    department: '',
    employeeId: '',
    position: '',
  });

  const [mailConfig, setMailConfig] = useState({
    mailType: 'leave',
    recipient: '',
    recipientRole: 'professor',
    startDate: '',
    endDate: '',
    reason: '',
    subject: '',
  });

  const [generatedMail, setGeneratedMail] = useState('');
  const [editableMail, setEditableMail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSendPopup, setShowSendPopup] = useState(false);
  const [emailInfo, setEmailInfo] = useState({
    to: '',
    cc: '',
    bcc: '',
  });

  const handleUserDetailsChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleMailConfigChange = (e) => {
    setMailConfig({
      ...mailConfig,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailInfoChange = (e) => {
    setEmailInfo({
      ...emailInfo,
      [e.target.name]: e.target.value,
    });
  };

  const generateMail = async () => {
    setIsLoading(true);
    setError(null);
    setCopySuccess(false);

    try {
      // This would be your actual API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/generate-mail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDetails,
          mailConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mail');
      }

      const data = await response.json();
      setGeneratedMail(data.mail_content);
      setEditableMail(data.mail_content);
      setActiveStep(3); // Move to step 3 after generating email
    } catch (err) {
      setError('Failed to generate mail: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableMail);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleEditableMail = (e) => {
    setEditableMail(e.target.value);
  };

  const openSendPopup = () => {
    // Pre-fill recipient email if available
    if (mailConfig.recipient) {
      setEmailInfo({
        ...emailInfo,
        to: mailConfig.recipient,
      });
    }
    setShowSendPopup(true);
  };

  const closeSendPopup = () => {
    setShowSendPopup(false);
  };

  const sendEmail = () => {
    // Create subject based on mail type
    let subject = '';

    if (mailConfig.mailType === 'leave') {
      subject = `Leave Application: ${userDetails.name} - ${mailConfig.startDate} to ${mailConfig.endDate}`;
    } else if (mailConfig.mailType === 'OD') {
      subject = `On Duty Request: ${userDetails.name} - ${mailConfig.startDate} to ${mailConfig.endDate}`;
    } else if (mailConfig.mailType === 'permission') {
      subject = `Permission Request: ${userDetails.name}`;
    } else {
      subject = mailConfig.subject;
    }

    // Create mailto URL with all parameters
    const mailtoLink = `mailto:${emailInfo.to}?subject=${encodeURIComponent(subject)}&cc=${encodeURIComponent(emailInfo.cc)}&bcc=${encodeURIComponent(emailInfo.bcc)}&body=${encodeURIComponent(editableMail)}`;

    // Open default mail client
    window.location.href = mailtoLink;

    // Close popup
    closeSendPopup();
  };

  const getRecipientTitles = () => {
    if (userDetails.role === 'student') {
      return ['professor', 'hod', 'principal'];
    } else if (userDetails.role === 'employee') {
      return ['manager', 'hr', 'director'];
    } else {
      return ['hr', 'director', 'ceo'];
    }
  };

  const validateUserDetails = () => {
    if (!userDetails.name) {
      setError('Please fill in your full name');
      return false;
    }
    setError(null);
    return true;
  };

  const validateMailConfig = () => {
    const missingFields = [];

    if (mailConfig.mailType === 'other' && !mailConfig.subject) {
      missingFields.push('subject');
    }

    if ((mailConfig.mailType === 'leave' || mailConfig.mailType === 'OD') &&
        (!mailConfig.startDate || !mailConfig.endDate)) {
      missingFields.push('dates');
    }

    if (!mailConfig.reason) {
      missingFields.push('reason');
    }

    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (validateUserDetails()) {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      if (validateMailConfig()) {
        generateMail();
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Progress indicator
  const progressWidth = () => {
    if (activeStep === 1) return 'w-1/3';
    if (activeStep === 2) return 'w-2/3';
    return 'w-full';
  };

  return (
<div className="bg-gradient-to-b from-blue-600 to-white h-[100vh] p-4">
<div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8 mb-6 transition-all duration-500 transform hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-3 animate-fade-in">Professional Mail Drafter</h1>
          <p className="text-gray-600 text-lg">Create professional emails effortlessly with AI assistance</p>
          <div className="h-1 w-24 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
          <div 
            className={`bg-blue-600 h-2 rounded-full transition-all duration-700 ease-in-out ${progressWidth()}`}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className={`flex flex-col items-center mx-4 ${activeStep >= 1 ? 'text-blue-700' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <span className="text-sm font-semibold">Personal Info</span>
          </div>
          <div className="w-16 h-0.5 mt-5 bg-gray-200"></div>
          <div className={`flex flex-col items-center mx-4 ${activeStep >= 2 ? 'text-blue-700' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className="text-sm font-semibold">Mail Details</span>
          </div>
          <div className="w-16 h-0.5 mt-5 bg-gray-200"></div>
          <div className={`flex flex-col items-center mx-4 ${activeStep >= 3 ? 'text-blue-700' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            <span className="text-sm font-semibold">Generated Email</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-fadeIn">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-bold">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Personal Information */}
        <div className={`transition-all duration-500 ${activeStep === 1 ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute -left-full'}`}>
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
            <h2 className="text-2xl font-bold text-blue-800">Personal Information</h2>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={userDetails.name}
                  onChange={handleUserDetailsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your full name"
                  required
                />
                <span className="text-red-500 text-xs font-semibold mt-1">Required</span>
              </div>

              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={userDetails.role}
                  onChange={handleUserDetailsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager/Higher Position</option>
                </select>
              </div>

              {userDetails.role === 'student' ? (
                <div className="transform transition-all duration-300 hover:scale-105">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Class/Section</label>
                  <input
                    type="text"
                    name="class"
                    value={userDetails.class}
                    onChange={handleUserDetailsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., B.Tech CSE-A"
                  />
                </div>
              ) : (
                <div className="transform transition-all duration-300 hover:scale-105">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={userDetails.employeeId}
                    onChange={handleUserDetailsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., EMP10234"
                  />
                </div>
              )}

              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={userDetails.department}
                  onChange={handleUserDetailsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Computer Science"
                />
              </div>

              {userDetails.role !== 'student' && (
                <div className="transform transition-all duration-300 hover:scale-105">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={userDetails.position}
                    onChange={handleUserDetailsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Senior Engineer"
                  />
                </div>
              )}

              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Product/Factory Number</label>
                <input
                  type="text"
                  name="productFactoryNumber"
                  value={userDetails.productFactoryNumber}
                  onChange={handleUserDetailsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition hover:scale-105 flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Step 2: Mail Configuration */}
        <div className={`transition-all duration-500 ${activeStep === 2 ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute -left-full'}`}>
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
            <h2 className="text-2xl font-bold text-blue-800">Mail Configuration</h2>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mail Type</label>
                <select
                  name="mailType"
                  value={mailConfig.mailType}
                  onChange={handleMailConfigChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="leave">Leave Application</option>
                  <option value="OD">On Duty (OD) Request</option>
                  <option value="permission">Permission Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Title</label>
                <select
                  name="recipientRole"
                  value={mailConfig.recipientRole}
                  onChange={handleMailConfigChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  {getRecipientTitles().map(title => (
                    <option key={title} value={title}>{title.charAt(0).toUpperCase() + title.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Name</label>
                <input
                  type="text"
                  name="recipient"
                  value={mailConfig.recipient}
                  onChange={handleMailConfigChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              {(mailConfig.mailType === 'leave' || mailConfig.mailType === 'OD') && (
                <>
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={mailConfig.startDate}
                      onChange={handleMailConfigChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-red-500 text-xs font-semibold mt-1">Required</span>
                  </div>

                  <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={mailConfig.endDate}
                      onChange={handleMailConfigChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-red-500 text-xs font-semibold mt-1">Required</span>
                  </div>
                </>
              )}

              {mailConfig.mailType === 'other' && (
                <div className="transform transition-all duration-300 hover:scale-105">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={mailConfig.subject}
                    onChange={handleMailConfigChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter email subject"
                  />
                  <span className="text-red-500 text-xs font-semibold mt-1">Required</span>
                </div>
              )}
            </div>

            <div className="mt-6 transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-bold text-gray-700 mb-2">Reason/Description</label>
              <textarea
                name="reason"
                value={mailConfig.reason}
                onChange={handleMailConfigChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Please provide detailed information about your request..."
              ></textarea>
              <span className="text-red-500 text-xs font-semibold mt-1">Required</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-md transform transition hover:scale-105 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 shadow-lg transform transition hover:scale-105 flex items-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Email
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 3: Generated Email */}
        <div className={`transition-all duration-500 ${activeStep === 3 ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute -left-full'}`}>
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">3</div>
            <h2 className="text-2xl font-bold text-blue-800">Your Professional Email</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100 rounded-lg shadow-inner animate-fadeIn">
            <textarea
              className="w-full min-h-64 p-4 font-sans text-gray-800 bg-white border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={editableMail}
              onChange={handleEditableMail}
              rows="12"
            ></textarea>
            
            <div className="mt-5 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-md transform transition hover:scale-105 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center font-bold transition-all shadow-md transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copySuccess ? (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : 'Copy to Clipboard'}
                </button>

                <button
                  onClick={openSendPopup}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center font-bold transition-all shadow-md transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2 V19a2 2 0 01-2-2H5a2 2 0 01-2 2v1m14 0a2 2 0 012-2M5 19a2 2 0 002 2h14a2 2 0 002-2M5 19a2 2 0 012-2" />
                  </svg>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Send Email Popup */}
        {showSendPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Send Email</h2>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">To</label>
                <input
                  type="email"
                  name="to"
                  value={emailInfo.to}
                  onChange={handleEmailInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Recipient email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">CC</label>
                <input
                  type="email"
                  name="cc"
                  value={emailInfo.cc}
                  onChange={handleEmailInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="CC email (optional)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">BCC</label>
                <input
                  type="email"
                  name="bcc"
                  value={emailInfo.bcc}
                  onChange={handleEmailInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="BCC email (optional)"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeSendPopup}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-md transform transition hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transform transition hover:scale-105"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailDrafter;
