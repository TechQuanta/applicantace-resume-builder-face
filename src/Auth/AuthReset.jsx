// src/AuthPage.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SignupLoginForm from "../Auth/SignUpForm"; // Ensure this path is correct
import AnimatedBackground from "../components/Shared/AnimatedBackground";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useAuth } from "../hooks/useGoogleSignInHandler";
import { useUserSession } from "../hooks/useUserSession";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const AuthPage = () => {
  const { googleLogin, signup, loginUser, verifyOtp, loading, error } = useAuth();
  const { login: setUserSession } = useUserSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [glowActive, setGlowActive] = useState(false); // Retained for visual effect if used
  const [authError, setAuthError] = useState(null);
  const [otpPhase, setOtpPhase] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState(""); // Keep tempPassword for potential login after OTP

  const queryParams = new URLSearchParams(location.search);
  const isMultiAccountMode = queryParams.get("multi") === "true";

  useEffect(() => {
    const timer = setTimeout(() => setGlowActive(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const BACKEND_ORIGIN_FOR_MESSAGES = "http://localhost:8080"; // Your backend origin

    function handleAuthMessage(event) {
      if (event.origin !== BACKEND_ORIGIN_FOR_MESSAGES) {
        return;
      }

      if (event.data?.type === "AUTH_SUCCESS") {
        const receivedUserData = event.data.userData;

        setUserSession({ ...receivedUserData, loginMethod: receivedUserData.authProvider || "oauth" });
        setAuthError(null);

        if (!isMultiAccountMode && receivedUserData.username) {
          navigate(`/${receivedUserData.username}/dashboard`);
        } else if (isMultiAccountMode) {
          if (window.opener) {
            window.opener.postMessage({ type: "AUTH_SUCCESS", userData: receivedUserData }, window.location.origin);
            window.close();
          }
        }

      } else if (event.data?.type === "AUTH_ERROR") {
        setAuthError(event.data.message);
        if (window.opener) {
          window.opener.postMessage({ type: "AUTH_ERROR", message: event.data.message }, window.location.origin);
          window.close();
        }
      }
    }

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [isMultiAccountMode, navigate, setUserSession]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("code") || urlParams.has("error")) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openGitHubLoginPopup = () => {
    const githubAuthUrl = `${API_BASE_URL}/oauth2/authorization/github`;
    window.open(githubAuthUrl, "_blank");
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setAuthError(null);
    setOtpPhase(false);
    setTempEmail("");
    setTempPassword("");
  }

  const handleGoogleLoginForMultiAccount = async () => {
    try {
      setAuthError(null);
      const userData = await googleLogin();
      if (isMultiAccountMode && window.opener) {
        window.opener.postMessage({ type: "AUTH_SUCCESS", userData }, window.location.origin);
        window.close();
      }
    } catch (err) {
      if (isMultiAccountMode && window.opener) {
        window.opener.postMessage({
          type: "AUTH_ERROR",
          message: err.message || "Google login failed."
        }, window.location.origin);
        window.close();
      } else {
        setAuthError(err.message || "Google login failed.");
      }
    }
  };

  const handleGitHubLoginForMultiAccount = () => {
    setAuthError(null);
    openGitHubLoginPopup();
  };

  // --- Email/Password/OTP Submit ---
  const handleEmailPasswordSubmit = async ({ name, email, password, otp }) => {
    setAuthError(null);

    try {
      let userData;

      if (isLogin) {
        // This will now use Firebase signInWithEmailAndPassword first, then call backend
        userData = await loginUser({ usernameOrEmail: email, password });
      } else { // This is the signup flow
        if (!otpPhase) {
          // Signup: Calls Firebase createUserWithEmailAndPassword first, then backend
          userData = await signup({ username: name, email, password });
          if (userData?.requireOtp) {
            setOtpPhase(true);
            setTempEmail(email);
            setTempPassword(password); // Store password for potential direct login after OTP
            setAuthError("OTP sent to your email. Please enter it to complete signup.");
            return; // Exit as we're entering OTP phase
          }
        } else {
          // OTP verification after signup
          userData = await verifyOtp({ usernameOrEmail: tempEmail, otp });
        }
      }

      // If we reach here, it means login or OTP verification was successful
      if (userData?.username) {
        setUserSession({ ...userData, loginMethod: "email" }); // Or "otp" if verified
        if (!isMultiAccountMode) {
          navigate(`/${userData.username}/dashboard`);
        } else if (window.opener) {
          window.opener.postMessage({ type: "AUTH_SUCCESS", userData }, window.location.origin);
          window.close();
        }
      }
    } catch (err) {
      if (isMultiAccountMode && window.opener) {
        window.opener.postMessage({
          type: "AUTH_ERROR",
          message: err.message || (isLogin ? "Login failed." : "Signup failed.")
        }, window.location.origin);
        window.close();
      } else {
        setAuthError(err.message || (isLogin ? "Login failed." : "Signup failed."));
      }
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen p-3 overflow-hidden font-poppins bg-transparent text-white">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex flex-col md:flex-row items-stretch rounded-xl bg-white dark:bg-zinc-800 w-full max-w-4xl overflow-hidden shadow-2xl z-10"
      >
        {/* Left Column: Login/Signup Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-left">
          <motion.h2
            key={isLogin ? "login-title" : otpPhase ? "otp-title" : "signup-title"}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            {isLogin ? "Happy To See You!" : otpPhase ? "Verify Your Email" : "Create Your Account"}
          </motion.h2>

          <SignupLoginForm
            onSubmit={handleEmailPasswordSubmit}
            isLogin={isLogin}
            otpPhase={otpPhase}
            loading={loading}
            externalError={authError || error}
            tempEmail={tempEmail}
            // tempPassword is not passed to form, but stored in AuthPage state
          />

          {!otpPhase && (
            <button
              onClick={toggleMode}
              className="mt-6 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          )}
        </div>

        {/* Right Column: Social Login Options with White Blur Effect */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-white space-y-6
                               bg-white/10 backdrop-blur-md border-l border-white/20 rounded-r-xl">
          <img src="/login.png" alt="Signup GIF" className="w-12 mb-4" />

          <button
            onClick={isMultiAccountMode ? handleGoogleLoginForMultiAccount : googleLogin}
            className="w-full max-w-xs py-3 px-6 bg-white text-gray-800 rounded-lg shadow-md flex items-center justify-center gap-3 font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FaGoogle className="text-2xl" />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={isMultiAccountMode ? handleGitHubLoginForMultiAccount : openGitHubLoginPopup}
            className="w-full max-w-xs py-3 px-6 bg-gray-900 text-white rounded-lg shadow-md flex items-center justify-center gap-3 font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FaGithub className="text-2xl" />
            <span>Continue with GitHub</span>
          </button>

          <p className="mt-6 text-sm text-gray-800 dark:text-gray-300 opacity-80 text-center">
            Your data is safe with us. By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;