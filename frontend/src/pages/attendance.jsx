import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaClock,
  FaCoffee,
  FaUtensils,
  FaStopwatch,
  FaCalculator
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import RNSLoadingSpinner from '../components/loading';

const AttendanceTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState({
    office_in: null,
    office_out: null,
    break_in: null,
    break_out: null,
    lunch_in: null,
    lunch_out: null
  });
  const [timeCalculations, setTimeCalculations] = useState({
    totalWorkTime: '00:00:00',
    breakTime: '00:00:00',
    lunchTime: '00:00:00'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch user and attendance data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchTodayAttendance(userData.email);
    }
  }, []);

  // Calculate time differences
  useEffect(() => {
    const calculateTimes = () => {
      const { office_in, office_out, break_in, break_out, lunch_in, lunch_out } = todayAttendance;

      // Calculate Work Time
      const workTime = office_in && office_out
        ? calculateTimeDifference(office_in, office_out)
        : '00:00:00';

      // Calculate Break Time
      const breakTime = break_in && break_out
        ? calculateTimeDifference(break_in, break_out)
        : '00:00:00';

      // Calculate Lunch Time
      const lunchTime = lunch_in && lunch_out
        ? calculateTimeDifference(lunch_in, lunch_out)
        : '00:00:00';

      setTimeCalculations({ totalWorkTime: workTime, breakTime, lunchTime });
    };

    calculateTimes();
  }, [todayAttendance]);

  // Time difference calculation helper
  const calculateTimeDifference = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchTodayAttendance = async (userEmail) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8"
      >
        {/* Digital Clock Section */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Attendance Tracker
            </h2>
            {user && (
              <p className="text-xl text-gray-600 mt-2">
                Welcome, <span className="font-semibold text-blue-600">{user.username}</span>
              </p>
            )}
          </div>
          <div className="text-4xl font-mono text-blue-700 bg-blue-50 p-4 rounded-lg shadow-md">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center items-center">
            <RNSLoadingSpinner />
          </div>
        )}

        {/* Time Calculations */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-100 p-4 rounded-lg flex items-center justify-center"
          >
            <FaStopwatch className="mr-3 text-blue-600 text-2xl" />
            <div>
              <h4 className="text-sm text-gray-600">Total Work Time</h4>
              <p className="text-xl font-bold text-blue-800">{timeCalculations.totalWorkTime}</p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-100 p-4 rounded-lg flex items-center justify-center"
          >
            <FaCoffee className="mr-3 text-green-600 text-2xl" />
            <div>
              <h4 className="text-sm text-gray-600">Break Time</h4>
              <p className="text-xl font-bold text-green-800">{timeCalculations.breakTime}</p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-100 p-4 rounded-lg flex items-center justify-center"
          >
            <FaUtensils className="mr-3 text-purple-600 text-2xl" />
            <div>
              <h4 className="text-sm text-gray-600">Lunch Time</h4>
              <p className="text-xl font-bold text-purple-800">{timeCalculations.lunchTime}</p>
            </div>
          </motion.div>
        </div>

        {/* Attendance Buttons */}
        <div className="grid grid-cols-3 gap-4">
          {/* Office In/Out */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-50 p-4 rounded-lg"
          >
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
                  >
                    Clock Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Break In/Out */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-50 p-4 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
              <FaCoffee className="mr-2" /> Break
            </h3>
            <div className="space-y-2">
              <div>
                <strong>In:</strong> {formatTime(todayAttendance.break_in)}
                {todayAttendance.office_in && !todayAttendance.break_in && !todayAttendance.office_out && (
                  <button
                    onClick={() => recordAttendance('break_in')}
                    disabled={isLoading}
                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  >
                    Break In
                  </button>
                )}
              </div>
              <div>
                <strong>Out:</strong> {formatTime(todayAttendance.break_out)}
                {todayAttendance.break_in && !todayAttendance.break_out && !todayAttendance.office_out && (
                  <button
                    onClick={() => recordAttendance('break_out')}
                    disabled={isLoading}
                    className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                  >
                    Break Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Lunch In/Out */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-50 p-4 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center">
              <FaUtensils className="mr-2" /> Lunch
            </h3>
            <div className="space-y-2">
              <div>
                <strong>In:</strong> {formatTime(todayAttendance.lunch_in)}
                {todayAttendance.office_in && !todayAttendance.lunch_in && !todayAttendance.office_out && (
                  <button
                    onClick={() => recordAttendance('lunch_in')}
                    disabled={isLoading}
                    className="ml-2 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                  >
                    Lunch In
                  </button>
                )}
              </div>
              <div>
                <strong>Out:</strong> {formatTime(todayAttendance.lunch_out)}
                {todayAttendance.lunch_in && !todayAttendance.lunch_out && !todayAttendance.office_out && (
                  <button
                    onClick={() => recordAttendance('lunch_out')}
                    disabled={isLoading}
                    className="ml-2 bg-pink-500 text-white px-2 py-1 rounded text-xs hover:bg-pink-600"
                  >
                    Lunch Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AttendanceTracker;
