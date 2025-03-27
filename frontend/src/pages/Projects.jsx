import React, { useState, useEffect, useRef } from 'react';
import { Copy, Download, Trash2, Edit, Send, Image, Link, X, ChevronRight } from 'lucide-react';

const ProjectConversationApp = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newConversation, setNewConversation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [showConversations, setShowConversations] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const conversationEndRef = useRef(null);

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

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
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
    }
  };

  const selectProject = async (projectId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/${projectId}/conversations/`);
      const data = await response.json();
      setSelectedProject(projectId);
      setConversations(data.conversations);
      setLinkPreview(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const addConversation = async () => {
    if (!selectedProject || !newConversation.trim()) return;

    try {
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
    }
  };

  const uploadImage = async () => {
    if (!selectedProject || !imageFile) return;

    try {
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
        fileInputRef.current.value = '';
      };
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/${selectedProject}/delete-conversation/${conversationId}`, {
        method: 'DELETE',
      });

      const conversationsResponse = await fetch(`http://127.0.0.1:8000/api/${selectedProject}/conversations/`);
      const data = await conversationsResponse.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const editConversation = async (conversationId, newContent) => {
    try {
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
    }
  };

  const handleLinkPreview = async (url) => {
    try {
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
    }
  };

  const uploadLinkPreview = async () => {
    if (!linkPreview || !selectedProject) return;

    try {
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
    }
  };

  const downloadConversations = () => {
    const conversationText = conversations
      .filter(conv => conv.type !== 'image') // Exclude image conversations
      .map(conv =>
        `${conv.role.toUpperCase()} [${new Date(conv.timestamp).toLocaleString()}]: ${conv.content}`
      )
      .join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedProject}_conversations.txt`;
    link.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Projects Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${showConversations ? 'w-72' : 'w-16'}`}>
        <div className="p-4">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="w-full flex justify-end text-gray-600 hover:text-gray-800"
          >
            <ChevronRight className={`transition-transform ${showConversations ? 'rotate-180' : ''}`} />
          </button>

          {showConversations && (
            <>
              <h2 className="text-xl font-bold mb-6 text-gray-800">Projects</h2>
              <div className="space-y-3">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedProject === project._id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => selectProject(project._id)}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 relative">
        {/* Create Project Button */}
        <button
          onClick={() => setShowCreateProject(true)}
          className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-lg"
        >
          Create Channel
        </button>

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">New Project</h2>
                <button onClick={() => setShowCreateProject(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Project Name"
                value={newProjectName}
                maxLength={MAX_PROJECT_NAME_LENGTH}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Project Description"
                value={newProjectDescription}
                maxLength={MAX_PROJECT_DESCRIPTION_LENGTH}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="4"
              />
              <button
                onClick={createProject}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
              >
                Create Project
              </button>
            </div>
          </div>
        )}

        {/* Conversations Area */}
        {selectedProject && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-indigo-50 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-indigo-800">Channel</h2>
              <button
                onClick={downloadConversations}
                className="text-indigo-600 hover:text-indigo-800 transition"
              >
                <Download size={24} />
              </button>
            </div>

            <div className="p-4 h-[500px] overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`flex mb-4 ${conv.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[60%] p-4 rounded-xl shadow-md ${
                      conv.role === 'user' ? 'bg-indigo-100' : 'bg-green-100'
                    }`}
                  >
                    {conv.type === 'image' ? (
                      <img
                        src={`data:image/png;base64,${conv.content}`}
                        alt="Conversation"
                        className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer"
                        onClick={() => setSelectedImage(`data:image/png;base64,${conv.content}`)}
                      />
                    ) : conv.type === 'link' ? (
                      <a href={JSON.parse(conv.content).url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-indigo-600">{JSON.parse(conv.content).title}</h3>
                          <p className="text-sm text-gray-600">{JSON.parse(conv.content).description}</p>
                          {JSON.parse(conv.content).image && (
                            <img src={JSON.parse(conv.content).image} alt="Link preview" className="mt-2 max-w-[150px] rounded" />
                          )}
                        </div>
                      </a>
                    ) : editingConversation === conv._id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newConversation}
                          onChange={(e) => setNewConversation(e.target.value)}
                          className="flex-grow p-2 border rounded-lg"
                        />
                        <button
                          onClick={() => editConversation(conv._id, newConversation)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        {conv.content}
                        <div className="flex items-center space-x-3 mt-2">
                          <small className="text-xs text-gray-500">
                            {new Date(conv.timestamp).toLocaleString()}
                          </small>
                          <button className="text-indigo-500 hover:text-indigo-700"><Copy size={16} /></button>
                          <button
                            onClick={() => {
                              setEditingConversation(conv._id);
                              setNewConversation(conv.content);
                            }}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteConversation(conv._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>

            {/* Input Section */}
            <div className="p-4 bg-gray-50 border-t">
              {linkPreview && (
                <div className="bg-white p-4 rounded-lg mb-4 shadow-sm flex items-center">
                  {linkPreview.image && (
                    <img src={linkPreview.image} alt="Preview" className="w-20 h-20 object-cover rounded mr-4" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-600">{linkPreview.title}</h3>
                    <p className="text-sm text-gray-600">{linkPreview.description}</p>
                  </div>
                  <button
                    onClick={uploadLinkPreview}
                    className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setLinkPreview(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <div className="flex space-x-4">
                <textarea
                  placeholder="Type your message..."
                  value={newConversation}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(e) => setNewConversation(e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={addConversation}
                    className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Send size={20} />
                  </button>
                  <label
                    htmlFor="imageUpload"
                    className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition cursor-pointer"
                  >
                    <Image size={20} />
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="hidden"
                    id="imageUpload"
                  />
                  {imageFile && (
                    <button
                      onClick={uploadImage}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Paste a link to preview"
                  onBlur={(e) => handleLinkPreview(e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Link size={20} className="text-gray-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-[40%] max-h-[40%]">
            <img src={selectedImage} alt="Enlarged" className="max-h-full max-w-full rounded-lg bottom-100" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2 hover:bg-red-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectConversationApp;
