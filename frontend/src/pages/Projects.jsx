import React, { useState, useEffect, useRef } from 'react';
import { Copy, Download, Trash2, Edit, Send, Image, Link, X, ChevronRight, Plus, Loader, FileText, FileJson, File } from 'lucide-react';

const ProjectConversationApp = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newConversation, setNewConversation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [showConversations, setShowConversations] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const fileInputRef = useRef(null);
  const conversationEndRef = useRef(null);
  const downloadButtonRef = useRef(null);

  // Constants
  const MAX_MESSAGE_LENGTH = 500;
  const MAX_PROJECT_NAME_LENGTH = 50;
  const MAX_PROJECT_DESCRIPTION_LENGTH = 200;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  useEffect(() => {
    // Close download menu when clicking outside
    const handleClickOutside = (event) => {
      if (showDownloadOptions && downloadButtonRef.current && !downloadButtonRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadOptions]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/projects/');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
        }),
      });

      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateProject(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = async (projectId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/${projectId}/conversations/`);
      const data = await response.json();
      setSelectedProject(projectId);
      setConversations(data.conversations);
      setLinkPreview(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addConversation = async () => {
    if (!selectedProject || !newConversation.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/add-conversation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newConversation.trim(),
          role: 'user'
        }),
      });

      const conversationsResponse = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/conversations/`);
      const data = await conversationsResponse.json();
      setConversations(data.conversations);
      setNewConversation('');
      setLinkPreview(null);
    } catch (error) {
      console.error('Error adding conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!selectedProject || !imageFile) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        const response = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/upload-image/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
          }),
        });

        const conversationsResponse = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/conversations/`);
        const data = await conversationsResponse.json();
        setConversations(data.conversations);
        setImageFile(null);
        setImagePreview(null);
        fileInputRef.current.value = '';
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      setIsLoading(true);
      await fetch(`http://127.0.0.1:8000/api/${selectedProject}/delete-conversation/${conversationId}`, {
        method: 'DELETE',
      });

      const conversationsResponse = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/conversations/`);
      const data = await conversationsResponse.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editConversation = async (conversationId, newContent) => {
    try {
      setIsLoading(true);
      await fetch(`http://127.0.0.1:8000/api/${selectedProject}/edit-conversation/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      const conversationsResponse = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/conversations/`);
      const data = await conversationsResponse.json();
      setConversations(data.conversations);
      setEditingConversation(null);
    } catch (error) {
      console.error('Error editing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkPreview = async (url) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/link-preview/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setLinkPreview(data);
    } catch (error) {
      console.error('Error fetching link preview:', error);
      setLinkPreview(null); // If there's an error, treat it as regular text
    } finally {
      setIsLoading(false);
    }
  };

  const uploadLinkPreview = async () => {
    if (!linkPreview || !selectedProject) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/add-conversation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: JSON.stringify({
            title: linkPreview.title,
            description: linkPreview.description,
            image: linkPreview.image,
            url: linkPreview.url
          }),
          role: 'user',
          type: 'link'
        }),
      });

      const conversationsResponse = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/conversations/`);
      const data = await conversationsResponse.json();
      setConversations(data.conversations);
      setLinkPreview(null);
    } catch (error) {
      console.error('Error uploading link preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsText = () => {
    const conversationText = conversations
      .filter(conv => conv.type !== 'image') // Exclude image conversations
      .map(conv =>
        `${conv.role.toUpperCase()} [${new Date(conv.timestamp).toLocaleString()}]: ${conv.content}`
      )
      .join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedProjectName}_conversations.txt`;
    link.click();
    setShowDownloadOptions(false);
  };

  const downloadAsJSON = () => {
    const conversationData = conversations.map(conv => {
      // Handle different conversation types
      if (conv.type === 'image') {
        return {
          id: conv._id,
          role: conv.role,
          timestamp: conv.timestamp,
          type: 'image',
          // Note: We're not including the base64 data here to keep file size reasonable
          contentReference: `Image content available in the application`
        };
      } else if (conv.type === 'link') {
        return {
          id: conv._id,
          role: conv.role,
          timestamp: conv.timestamp,
          type: 'link',
          content: JSON.parse(conv.content)
        };
      } else {
        return {
          id: conv._id,
          role: conv.role,
          timestamp: conv.timestamp,
          type: 'text',
          content: conv.content
        };
      }
    });

    const jsonData = {
      projectId: selectedProject,
      projectName: selectedProjectName,
      exportDate: new Date().toISOString(),
      conversations: conversationData
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedProjectName}_conversations.json`;
    link.click();
    setShowDownloadOptions(false);
  };

  const downloadAsPDF = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would call an API endpoint to generate the PDF
      // For this example, we'll simulate a PDF download via API

      const response = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/export-pdf/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: selectedProjectName,
          conversations: conversations.filter(conv => conv.type !== 'image')
        }),
      });

      // In a real implementation, the API would return the PDF file
      // Here, we'll create a simple PDF-like file for demonstration
      const conversationText = conversations
        .filter(conv => conv.type !== 'image')
        .map(conv =>
          `${conv.role.toUpperCase()} [${new Date(conv.timestamp).toLocaleString()}]: ${conv.content}`
        )
        .join('\n\n');

      const blob = new Blob([`%PDF-1.5\n% Simulated PDF for ${selectedProjectName}\n\n${conversationText}\n\n%EOF`],
        { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedProjectName}_conversations.pdf`;
      link.click();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDownloadOptions(false);
    }
  };

  const downloadAsWord = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would call an API endpoint to generate DOCX
      // For this example, we'll simulate a DOCX download

      // Format content for Word document
      let content = `# ${selectedProjectName} Conversations\n\n`;
      content += `Exported on: ${new Date().toLocaleString()}\n\n`;

      conversations
        .filter(conv => conv.type !== 'image')
        .forEach(conv => {
          content += `## ${conv.role.toUpperCase()} - ${new Date(conv.timestamp).toLocaleString()}\n\n`;
          content += `${conv.content}\n\n---\n\n`;
        });

      // In a real implementation, the content would be converted to DOCX format
      // Here we're creating a simple text file with a .docx extension
      const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedProjectName}_conversations.docx`;
      link.click();

    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDownloadOptions(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addConversation();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewConversation(value);

    // Check if the input is a URL
    const urlPattern = /^(https?:\/\/[^\s]+)$/;
    if (urlPattern.test(value)) {
      handleLinkPreview(value);
    } else {
      setLinkPreview(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    fileInputRef.current.value = '';
  };

  // Find selected project name
  const selectedProjectName = projects.find(p => p._id === selectedProject)?.name || 'Channel';

  return (
    <div className="min-h-screen bg-gray-50 flex relative font-sans">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-5 rounded-lg shadow-lg flex items-center space-x-3 animate-pulse">
            <Loader className="text-indigo-600 animate-spin" size={24} />
            <span className="text-indigo-800 font-medium">RNS<br/>Loading...</span>
          </div>
        </div>
      )}

      {/* Projects Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 h-screen ${showConversations ? 'w-72' : 'w-20'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            {showConversations && <h2 className="text-xl font-bold text-indigo-800">Channels</h2>}
            <button
              onClick={() => setShowConversations(!showConversations)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-all"
            >
              <ChevronRight className={`transition-transform ${showConversations ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showConversations && (
            <div className="space-y-2 flex-grow overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project._id}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center ${
                    selectedProject === project._id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-100'
                  }`}
                  onClick={() => selectProject(project._id)}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${selectedProject === project._id ? 'bg-white' : 'bg-indigo-500'}`}></div>
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCreateProject(true)}
            className={`mt-4 flex items-center justify-center rounded-lg transition-all duration-300 border border-dashed border-indigo-300 hover:border-indigo-500 group ${
              showConversations ? 'p-4' : 'p-3'
            }`}
          >
            <Plus className="text-indigo-500 group-hover:text-indigo-700" size={showConversations ? 24 : 20} />
            {showConversations && <span className="ml-2 text-indigo-600 font-medium">New Channel</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-indigo-800">Create New Channel</h2>
                <button
                  onClick={() => setShowCreateProject(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                  <input
                    id="projectName"
                    type="text"
                    placeholder="Enter channel name"
                    value={newProjectName}
                    maxLength={MAX_PROJECT_NAME_LENGTH}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="text-xs text-right text-gray-500 mt-1">
                    {newProjectName.length}/{MAX_PROJECT_NAME_LENGTH}
                  </div>
                </div>

                <div>
                  <label htmlFor="projectDesc" className="block text-sm font-medium text-gray-700 mb-1">Channel Description</label>
                  <textarea
                    id="projectDesc"
                    placeholder="Enter channel description"
                    value={newProjectDescription}
                    maxLength={MAX_PROJECT_DESCRIPTION_LENGTH}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                  />
                  <div className="text-xs text-right text-gray-500 mt-1">
                    {newProjectDescription.length}/{MAX_PROJECT_DESCRIPTION_LENGTH}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className={`flex-1 py-3 rounded-lg transition-all font-medium ${
                    newProjectName.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      : 'bg-indigo-300 text-white cursor-not-allowed'
                  }`}
                >
                  Create Channel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversations Area */}
        {selectedProject ? (
          <div className="flex flex-col h-full">
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
              <h2 className="text-xl font-bold text-indigo-800">{selectedProjectName}</h2>

              {/* Enhanced Download Button with Dropdown */}
              <div className="relative" ref={downloadButtonRef}>
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all border border-indigo-200 shadow-sm hover:shadow"
                  title="Download Conversations"
                >
                  <Download size={18} />
                  <span>Download</span>
                  <ChevronRight className={`transition-transform ${showDownloadOptions ? 'rotate-90' : ''}`} size={16} />
                </button>

                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 animate-fade-in">
                    <ul className="py-2">
                      <li>
                        <button
                          onClick={downloadAsText}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <FileText size={16} className="mr-3 text-indigo-500" />
                          Text (.txt)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={downloadAsJSON}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <FileJson size={16} className="mr-3 text-indigo-500" />
                          JSON (.json)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={downloadAsPDF}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <File size={16} className="mr-3 text-indigo-500" />
                          PDF (.pdf)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={downloadAsWord}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <File size={16} className="mr-3 text-indigo-500" />
                          Word (.docx)
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-4xl mx-auto space-y-4">
                {conversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`flex mb-4 ${conv.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-xl shadow-sm ${
                        conv.role === 'user'
                          ? 'bg-indigo-100 border-indigo-200 border'
                          : 'bg-white border border-green-200'
                      }`}
                    >
                      {conv.type === 'image' ? (
                        <div className="relative group">
                          <img
                            src={`data:image/png;base64,${conv.content}`}
                            alt="Conversation"
                            className="max-w-[250px] max-h-[250px] rounded-lg cursor-pointer object-cover"
                            onClick={() => setSelectedImage(`data:image/png;base64,${conv.content}`)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              className="bg-white text-indigo-600 p-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all"
                              onClick={() => setSelectedImage(`data:image/png;base64,${conv.content}`)}
                            >
                              <Image size={20} />
                            </button>
                          </div>
                        </div>
                      ) : conv.type === 'link' ? (
                        <a href={JSON.parse(conv.content).url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-all">
                          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-indigo-600">{JSON.parse(conv.content).title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{JSON.parse(conv.content).description}</p>
                            {JSON.parse(conv.content).image && (
                              <img src={JSON.parse(conv.content).image} alt="Link preview" className="mt-2 max-w-[200px] rounded" />
                            )}
                          </div>
                        </a>
                      ) : editingConversation === conv._id ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newConversation}
                            onChange={(e) => setNewConversation(e.target.value)}
                            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => editConversation(conv._id, newConversation)}
                            className="bg-indigo-500 text-white px-3 py-1 rounded-lg shadow-sm hover:bg-indigo-600 transition-all"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-gray-800 whitespace-pre-wrap break-words">
                            {conv.content}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 opacity-70 hover:opacity-100 transition-all">
                            <small className="text-xs text-gray-500">
                              {new Date(conv.timestamp).toLocaleString()}
                            </small>
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-gray-500 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50"
                                onClick={() => copyToClipboard(conv.content)}
                                title="Copy"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingConversation(conv._id);
                                  setNewConversation(conv.content);
                                }}
                                className="text-gray-500 hover:text-green-600 p-1 rounded hover:bg-green-50"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => deleteConversation(conv._id)}
                                className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            </div>

            {/* Input Section */}
            <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
              {linkPreview && (
                <div className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-indigo-100 flex items-center">
                  {linkPreview.image && (
                    <img src={linkPreview.image} alt="Preview" className="w-16 h-16 object-cover rounded mr-4" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-600 text-sm">{linkPreview.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{linkPreview.description}</p>
                  </div>
                  <button
                    onClick={() => setLinkPreview(null)}
                    className="ml-2 text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Image Preview Section */}
              {imagePreview && (
                <div className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-indigo-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-indigo-600">Image Preview</h3>
                    <button
                      onClick={removeImagePreview}
                      className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Upload Preview"
                      className="max-w-full max-h-64 rounded-lg object-contain border border-gray-200 shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <div className="flex-1 border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                  <textarea
                    placeholder="Type your message..."
                    value={newConversation}
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full p-3 focus:outline-none resize-none"
                    rows="3"
                    disabled={!!imageFile}
                  />
                  <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {newConversation.length}/{MAX_MESSAGE_LENGTH}
                    </div>
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="imageUpload"
                        className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 cursor-pointer transition-all"
                        title="Upload Image"
                      >
                        <Image size={18} />
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  {imageFile ? (
                    <button
                      onClick={uploadImage}
                      className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg h-12 flex items-center justify-center"
                      title="Upload Image"
                    >
                      <Image size={20} className="mr-2" />
                      <span>Upload</span>
                    </button>
                  ) : (
                    <button
                      onClick={addConversation}
                      disabled={!newConversation.trim()}
                      className={`p-3 rounded-xl transition-all h-12 flex items-center justify-center shadow-md hover:shadow-lg ${
                        newConversation.trim()
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <ChevronRight size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Channel</h2>
              <p className="text-gray-600 mb-6">Choose a channel from the sidebar or create a new one to start a conversation</p>
              <button
                onClick={() => setShowCreateProject(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md"
              >
                <Plus size={18} className="mr-2" />
                Create New Channel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

const ImageModal = ({ selectedImage, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white bg-opacity-10 rounded-2xl shadow-2xl p-4 animate-fade-in">
          <img
            src={selectedImage}
            alt="Enlarged"
            className="object-contain max-w-full max-h-[80vh] rounded-xl shadow-2xl"
          />
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-700 transition-all opacity-80 hover:opacity-100 shadow-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add custom keyframes for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default ProjectConversationApp;
