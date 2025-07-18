import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthForm from "../Auth/AuthForm";
import GoogleAuthButton from "../Auth/GoogleAuth";
import GitHubAuthButton from "../Auth/GitHubAuth";
import ErrorPopup from "../components/Shared/ErrorPopup";
import TermsAndPrivacyModal from "../termsconditions";
import { FaInfoCircle, FaUserPlus, FaUser } from 'react-icons/fa';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setAuthError(null);
  }, []);

  const openTermsPopup = useCallback((e) => {
    e.preventDefault();
    setShowTermsPopup(true);
  }, []);

  // Define animation variants for the staggered effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time between each child animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Social buttons component for reusability
  const SocialButtons = ({ onAuthError }) => (
    <div className="flex flex-row gap-2 w-full max-w-md">
      <GoogleAuthButton onAuthError={onAuthError} />
      <GitHubAuthButton onAuthError={onAuthError} />
    </div>
  );

  const AuthSection = useMemo(
    () => (
      <motion.div
        variants={itemVariants} // Apply animation to this section
        className="relative w-full flex flex-col items-center" // Changed to relative for child positioning
      >
        {/* The icon button, positioned at the top-right of the form */}
        <button
          onClick={toggleMode}
          // Setting specific colors for the icons directly
          className="absolute top-0 right-0 p-2 cursor-pointer transition-colors duration-200"
          aria-label={isLogin ? "Switch to Sign Up" : "Switch to Login"}
        >
          {isLogin ? (
            // FaUserPlus icon in purple color
            <FaUserPlus className="text-2xl" style={{ color: '#8A2BE2' }} /> 
          ) : (
            // FaUser icon in light blue color
            <FaUser className="text-2xl" style={{ color: '#87CEEB' }} />
          )}
        </button>

        {/* Social buttons visible on small screens (form context) */}
        <div className="md:hidden mb-4 w-full max-w-sm">
          <SocialButtons onAuthError={setAuthError} />
        </div>
        <AuthForm isLogin={isLogin} onAuthError={setAuthError} />
        
      </motion.div>
    ),
    [isLogin, toggleMode, setAuthError]
  );

  return (
    <div className="relative flex justify-center items-center min-h-screen w-screen p-3 overflow-hidden font-poppins bg-transparent">
      {/* Animated blob background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-blob w-32 h-32 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="animate-blob-reverse w-48 h-48 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="animate-blob w-40 h-40 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <ErrorPopup error={authError} onClose={() => setAuthError(null)} />

      {/* Main Container for Form and Image - Parent for Staggered Animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative flex flex-col md:flex-row items-center justify-center gap-8 p-4 w-full max-w-5xl z-10"
      >
        {/* Form Section */}
        <div className="flex-shrink-0 w-full max-w-md">
          {AuthSection}
        </div>

        {/* Image Section - Child 2 */}
        <motion.div
          variants={itemVariants} // Apply animation to this section
          className="flex-shrink-0 hidden md:flex flex-col items-center justify-center relative"
        >
          {/* Social buttons visible on medium and up screens (on top of image) */}
          <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 w-full max-w-sm z-20">
             <SocialButtons onAuthError={setAuthError} />
          </div>
          <img
            src="/login.png"
            alt={isLogin ? "Login Illustration" : "Signup Illustration"}
            className="w-80 h-auto object-contain rotate-6 transform transition-transform duration-300 ease-in-out" // Increased rotate to rotate-6
          />
        </motion.div>
      </motion.div>

      {/* Terms & Conditions button at the bottom-right of the whole page */}
      <button
        onClick={openTermsPopup}
        className="fixed bottom-4 right-4 text-white hover:text-blue-200 transition-colors duration-200 focus:outline-none z-0 rounded-full p-2 bg-gray-800 bg-opacity-50 backdrop-blur-sm"
        aria-label="Terms and Conditions"
      >
        <FaInfoCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showTermsPopup && (
          <TermsAndPrivacyModal
            isOpen={showTermsPopup}
            onClose={() => setShowTermsPopup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;