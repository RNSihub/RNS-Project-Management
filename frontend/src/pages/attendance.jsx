import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaClock,
  FaCoffee,
  FaUtensils,
  FaDoorOpen,
  FaSignOutAlt
} from 'react-icons/fa';

const AttendanceTracker = () => {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState({
    office_in: null,
    office_out: null,
    break_in: null,
    break_out: null,
    lunch_in: null,
    lunch_out: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchTodayAttendance(userData.email);
    }
  }, []);

  const fetchTodayAttendance = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:8000/api/get_today_attendance?email=${userEmail}`);
      const data = await response.json();

      if (data.status === 'success') {
        setTodayAttendance(data.attendance);
      } else {
        toast.error(data.message || 'Failed to fetch today\'s attendance');
      }
    } catch (error) {
      toast.error('Failed to fetch today\'s attendance');
    }
  };

  const recordAttendance = async (attendanceType) => {
    if (!user) {
      toast.error('User not found. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/record_attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          attendance_type: attendanceType
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success(data.message);
        fetchTodayAttendance(user.email);
      } else {
        toast.error(data.message || 'Failed to record attendance');
      }
    } catch (error) {
      toast.error('Failed to record attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Not recorded';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Attendance Tracker
        </h2>

        {user && (
          <div className="mb-6 text-center">
            <p className="text-xl text-gray-700">
              Welcome, <span className="font-semibold">{user.username}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Office In/Out */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center">
              <FaClock className="mr-2" /> Office
            </h3>
            <div className="space-y-2">
              <div>
                <strong>In:</strong> {formatTime(todayAttendance.office_in)}
                {!todayAttendance.office_in && (
                  <button
                    onClick={() => recordAttendance('office_in')}
                    disabled={isLoading}
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                    aria-label="Clock In"
                  >
                    Clock In
                  </button>
                )}
              </div>
              <div>
                <strong>Out:</strong> {formatTime(todayAttendance.office_out)}
                {todayAttendance.office_in && !todayAttendance.office_out && (
                  <button
                    onClick={() => recordAttendance('office_out')}
                    disabled={isLoading}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    aria-label="Clock Out"
                  >
                    Clock Out
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Break In/Out */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
              <FaCoffee className="mr-2" /> Break
            </h3>
            <div className="space-y-2">
              <div>
                <strong>In:</strong> {formatTime(todayAttendance.break_in)}
                {todayAttendance.office_in && !todayAttendance.break_in && (
                  <button
                    onClick={() => recordAttendance('break_in')}
                    disabled={isLoading}
                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    aria-label="Break In"
                  >
                    Break In
                  </button>
                )}
              </div>
              <div>
                <strong>Out:</strong> {formatTime(todayAttendance.break_out)}
                {todayAttendance.break_in && !todayAttendance.break_out && (
                  <button
                    onClick={() => recordAttendance('break_out')}
                    disabled={isLoading}
                    className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                    aria-label="Break Out"
                  >
                    Break Out
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lunch In/Out */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center">
              <FaUtensils className="mr-2" /> Lunch
            </h3>
            <div className="space-y-2">
              <div>
                <strong>In:</strong> {formatTime(todayAttendance.lunch_in)}
                {todayAttendance.office_in && !todayAttendance.lunch_in && (
                  <button
                    onClick={() => recordAttendance('lunch_in')}
                    disabled={isLoading}
                    className="ml-2 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                    aria-label="Lunch In"
                  >
                    Lunch In
                  </button>
                )}
              </div>
              <div>
                <strong>Out:</strong> {formatTime(todayAttendance.lunch_out)}
                {todayAttendance.lunch_in && !todayAttendance.lunch_out && (
                  <button
                    onClick={() => recordAttendance('lunch_out')}
                    disabled={isLoading}
                    className="ml-2 bg-pink-500 text-white px-2 py-1 rounded text-xs hover:bg-pink-600"
                    aria-label="Lunch Out"
                  >
                    Lunch Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AttendanceTracker;
