import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify'; // Import Toast functionality
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toast notifications

const TodoListApp = () => {
  const [tasks, setTasks] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'Pending',
    priority: 'Medium',
    deadline: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchRecentTasks();
  }, []);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/tasks/');
      console.log('Fetched tasks:', response.data); // Log the response to check the result
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  
  // Fetch recent tasks
  const fetchRecentTasks = async () => {
    try {
        const response = await axios.get('/tasks/recent/');
        console.log('Fetched Recent tasks:', response.data); // Log the response to check the result
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching Recent tasks:', error);
      }
    };

  // Handle creating a new task
  // Set the base URL to your backend server
axios.defaults.baseURL = 'http://localhost:8000';  // Change this to your backend's actual URL and port

const handleAddTask = async () => {
  if (!newTask.title) {
    toast.error('Task title is required');
    return;
  }

  try {
    const response = await axios.post('/api/create/', newTask); // Axios will now make the request to http://localhost:5000/tasks/create/
    setTasks((prevTasks) => [...prevTasks, response.data]);
    toast.success('Task added successfully');
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      status: 'Pending',
      priority: 'Medium',
      deadline: ''
    });
    setIsModalOpen(false);
  } catch (error) {
    if (error.response) {
      toast.error(`Server error: ${error.response.data.message || 'Error adding task'}`);
    } else if (error.request) {
      toast.error('Network error: No response from the server');
    } else {
      toast.error(`An unknown error occurred: ${error.message}`);
    }
  }
};

  
  
  // Handle updating a task
  const handleUpdateTask = async () => {
    // Ensure title is provided and a task is selected for editing
    if (!newTask.title || !editingTask) {
      toast.error('Task title is required');
      return;
    }
  
    try {
      const response = await axios.put(`/tasks/update/${editingTask._id}/`, newTask);
      
      // Update the task in the list after it is updated
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === response.data._id ? response.data : task
        )
      );
  
      toast.success('Task updated successfully');
  
      // Clear the editing state and reset form
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        status: 'Pending',
        priority: 'Medium',
        deadline: ''
      });
  
      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error updating task');
      console.error(error); // Log the error for debugging
    }
  };
  
  // Handle opening the modal for editing a task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task); // Pre-fill the form with the task data for editing
    setIsModalOpen(true);
  };
  
  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/tasks/delete/${taskId}/`);
      
      // Remove the deleted task from the tasks list
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Error deleting task');
      console.error(error); // Log the error for debugging
    }
  };
  

// Handle deleting a task



  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-3 gap-6">
          {/* Task list */}
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-blue-800">Todo List</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
              >
                <Plus className="mr-2" /> Add Task
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blue-900">{task.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2">{task.status}</p>
                  <p className="mt-2">{task.priority}</p>
                  <p className="mt-2">{task.description}</p>
                  <p className="mt-2">Assigned to: {task.assignedTo}</p>
                  <p className="mt-2">Deadline: {task.deadline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-blue-800">Recent Tasks</h2>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task._id} className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm">{task.description}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding/Editing Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Assigned To"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-4">
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleAddTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default TodoListApp;
