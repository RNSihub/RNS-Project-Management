import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Import the images
import img1 from './Login/img1.jpg';
import img2 from './Login/img2.jpg';
import img3 from './Login/img3.jpg';
import img4 from './Login/img4.jpg';
import img5 from './Login/img5.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState([]);
  const navigate = useNavigate();

  const images = [img1, img2, img3, img4, img5];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Function to check password strength with detailed feedback
  const checkPasswordStrength = (password) => {
    const feedbackItems = [];
    let strength = "";

    // Check for minimum length
    const hasMinLength = password.length >= 6;
    feedbackItems.push({
      requirement: "At least 6 characters",
      met: hasMinLength
    });

    // Check for at least 2 numbers
    const hasNumbers = (password.match(/\d/g) || []).length >= 2;
    feedbackItems.push({
      requirement: "At least 2 numbers",
      met: hasNumbers
    });

    // Check for at least 3 letters
    const hasLetters = (password.match(/[a-zA-Z]/g) || []).length >= 3;
    feedbackItems.push({
      requirement: "At least 3 letters",
      met: hasLetters
    });

    // Check for at least 1 special character
    const hasSpecial = /[!@#\$%^&*(),.?":{}|<>]/.test(password);
    feedbackItems.push({
      requirement: "At least 1 special character",
      met: hasSpecial
    });

    // Determine overall strength
    const metCount = feedbackItems.filter(item => item.met).length;

    if (metCount === 4) {
      strength = "strong";
    } else if (metCount >= 2) {
      strength = "medium";
    } else if (metCount >= 1) {
      strength = "weak";
    } else {
      strength = "";
    }

    return { strength, feedbackItems };
  };

  // Update password strength when password changes
  useEffect(() => {
    const { strength, feedbackItems } = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
    setPasswordFeedback(feedbackItems);
  }, [newPassword]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Email is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/forgot-opt", { email });
      if (response.status === 200) {
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error sending OTP.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/forgot-opt", { email });
      if (response.status === 200) {
        toast.success("OTP resent successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error resending OTP.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpValue = otp.join("");
    if (!otpValue) {
      toast.error("OTP is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/verifyotp", { email, otp: otpValue });
      if (response.status === 200) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Invalid OTP.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || passwordStrength !== "strong") {
      toast.error("Password must meet all requirements.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/resetpassword", { email, newPassword });
      if (response.status === 200) {
        toast.success("Password reset successfully!");
        navigate("/");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error resetting password.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.match(/^[0-9]$/) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl">
        {/* Left Side - Forgot Password Form */}
        <div className="w-full md:w-2/4 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
              <p className="text-gray-600 mt-2 text-sm">Enter your email to reset your password</p>
            </div>

            <form onSubmit={otpVerified ? handleResetPassword : otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-gray-800 font-medium mb-1 text-sm">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm"
                    required
                    disabled={otpVerified}
                  />
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      id={`otp-${index}`}
                      className="w-12 h-12 border border-gray-200 rounded-lg text-center font-medium text-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                      maxLength="1"
                    />
                  ))}
                </div>
              )}

              {otpSent && !otpVerified && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-gray-500 underline hover:text-gray-700 text-sm"
                  disabled={loading}
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>
              )}

              {otpVerified && (
                <>
                  <div>
                    <label className="block text-gray-800 font-medium mb-1 text-sm">New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <FaLock />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength</span>
                      {passwordStrength && (
                        <span className={`text-xs font-medium
                          ${passwordStrength === "strong" ? "text-green-600" :
                           passwordStrength === "medium" ? "text-yellow-600" :
                           "text-red-600"}`}>
                          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300
                          ${passwordStrength === "strong" ? "bg-green-500 w-full" :
                           passwordStrength === "medium" ? "bg-yellow-500 w-2/3" :
                           passwordStrength === "weak" ? "bg-red-500 w-1/3" :
                           "bg-gray-300 w-0"}`}
                      ></div>
                    </div>

                    {/* Password requirements */}
                    <div className="mt-2 space-y-1">
                      {passwordFeedback.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className={`text-xs ${item.met ? 'text-green-600' : 'text-gray-600'}`}>
                            {item.met ? '✓' : '○'} {item.requirement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-800 font-medium mb-1 text-sm">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <FaLock />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className={`pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-gray-500 transition text-sm
                          ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                className={`w-full p-3 rounded-lg font-bold text-sm ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-105"
                } transition duration-300 shadow-md`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : otpVerified ? "Reset Password" : otpSent ? "Verify OTP" : "Send OTP"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Image & Info */}
        <div className="hidden md:block w-2/4 relative">
          <div className="relative w-full h-full">
            <div className="overflow-hidden rounded-lg shadow-lg h-full">
              <div
                className="flex transition-transform ease-in-out duration-500 h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((src, index) => (
                  <img key={index} src={src} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ForgotPassword;