import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react"; // Import useState
import Login from "./pages/Login";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp"; // Import CreateAccount
import ForgotPassword from "./pages/Forgot Password";

const App = () => {
  const [user, setUser] = useState(null); // Add user state

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} /> {/* Pass setUser */}
        <Route path="/home" element={<Home user={user} />} /> {/* Pass user */}
        <Route path="/createaccount" element={<SignUp />} /> {/* Lowercase route */}
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Lowercase route */}
      </Routes>
    </Router>
  );
};

export default App;
