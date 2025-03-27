import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Use Dashboard component
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword"; // Fixed import path
import Sidebar from "./components/navbar";
import Attendance from "./pages/attendance"; // Updated import to PascalCase
import TodoListApp from "./pages/todo"; // Updated import to PascalCase

const App = () => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      {/* Conditionally render Sidebar only when user is logged in */}
      {user && <Sidebar user={user} onLogout={handleLogout} />}

      <div className={`transition-all duration-300 ${user ? 'pl-20 md:pl-64' : 'pl-0'}`}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/createaccount" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/attendance" element={<Attendance />} /> {/* Updated Route */}
          <Route path="/todo" element={<TodoListApp />} /> {/* Updated Route */}

        </Routes>
      </div>
    </Router>
  );
};

export default App;
