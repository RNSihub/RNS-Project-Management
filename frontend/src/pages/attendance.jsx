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

// Digital Clock Component
const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Extract time components
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Format hours for 12-hour display
  const displayHours = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Format with leading zeros
  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 10 }}
      className="w-60 h-60 bg-gradient-to-b from-slate-900 to-gray-800 rounded-xl shadow-2xl border border-blue-500 flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-3 bg-blue-500"></div>

      {/* Glowing effect */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-blue-400 blur-sm"></div>

      {/* Time display section */}
      <div className="flex flex-col items-center space-y-2 z-10">
        {/* Digital display */}
        <div className="bg-black bg-opacity-50 px-6 py-4 rounded-lg border border-gray-700 shadow-inner mb-3">
          <div className="flex items-center justify-center">
            {/* Hours */}
            <motion.div
              key={`hours-${displayHours}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-5xl font-mono font-bold text-blue-400 w-16 text-center"
            >
              {formatNumber(displayHours)}
            </motion.div>

            {/* Separator - blinking colon */}
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-5xl font-mono text-blue-500 px-1"
            >
              :
            </motion.div>

            {/* Minutes */}
            <motion.div
              key={`minutes-${minutes}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-5xl font-mono font-bold text-blue-400 w-16 text-center"
            >
              {formatNumber(minutes)}
            </motion.div>
          </div>

          {/* AM/PM and seconds row */}
          <div className="flex justify-between mt-1">
            <div className="text-xl font-mono font-bold text-blue-600">{ampm}</div>
            <div className="text-xl font-mono text-blue-300">{formatNumber(seconds)}</div>
          </div>
        </div>

        {/* Date display */}
        <div className="text-blue-300 font-mono text-sm bg-black bg-opacity-30 px-4 py-1 rounded-md">
          {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-3 left-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"
           style={{ animationDelay: '0.5s' }}></div>

      {/* Circuit-like patterns in background */}
      <div className="absolute top-10 left-4 w-12 h-1 bg-blue-800 rounded-full opacity-40"></div>
      <div className="absolute top-10 left-4 w-1 h-10 bg-blue-800 rounded-full opacity-40"></div>
      <div className="absolute bottom-10 right-6 w-16 h-1 bg-blue-800 rounded-full opacity-40"></div>
      <div className="absolute bottom-10 right-6 w-1 h-16 bg-blue-800 rounded-full opacity-40"></div>

      {/* Tech-inspired label */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-mono">
        SYS-TIME v2.5
      </div>
    </motion.div>
  );
};

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

  // Generate personalized greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8"
      >
        {/* Updated Header with Digital Clock */}
        <div className="mb-6 flex justify-between items-center bg-gradient-to-r from-blue-100 to-white rounded-2xl p-6 shadow-lg">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="space-y-2"
          >
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900 tracking-tight">
              Attendance Tracker
            </h2>
            {user && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-medium text-gray-700 flex items-center"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="mr-2 text-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </motion.span>
                <span>
                  {getGreeting()}, <span className="font-bold text-blue-700">{user.username}</span>
                </span>
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="flex flex-col items-center space-y-3"
          >
            <DigitalClock />
            
          </motion.div>
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
