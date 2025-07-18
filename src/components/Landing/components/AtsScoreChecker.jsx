// src/components/AtsScoreChecker/AtsScoreChecker.jsx
// (Adjust the path if your component is elsewhere)

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileUpload,
  faBolt,
  faTimes,
  faCheckCircle,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";

// Import the SignInPromptModal component
import SignInPromptModal from "../../Shared/SignInPromptModal"; // Adjust path if necessary

// Import your useUserSession hook
import { useUserSession } from "../../../hooks/useUserSession"; // Adjust path to your hooks directory

// Import the new API utility function
import { checkAtsScore } from "../../../utils/apiconfig"; // Adjust this path based on where you save atsService.js

const AtsScoreChecker = ({ onClose }) => {
  const modalRef = useRef(null);

  const [file, setFile] = useState(null);
  const [includeJD, setIncludeJD] = useState(false);
  const [deepCheck, setDeepCheck] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [featureClicked, setFeatureClicked] = useState(null);

  // --- Use your actual user session hook ---
  const { user } = useUserSession();
  const isSignedIn = !!user.selected; // True if a user is selected (logged in)
  const userEmail = user.selected?.email || ""; // Get user email
  const userToken = user.selected?.token || null; // Get user token

  // Function to handle the sign-in action from the prompt
  const handleSignIn = () => {
    console.log("User clicked Sign In from ATS Score Checker. Redirecting to sign-in page...");
    // In a real application, you would typically:
    // 1. Redirect to your login page:
    //    e.g., window.location.href = '/signin';
    //    or using react-router-dom: navigate('/signin');
    // 2. Or, if you have a separate login modal, open that.
    // For this component, we'll just close the prompt and rely on your actual auth flow.
    setShowSignInPrompt(false);
    // Do NOT setIsSignedIn(true) here; your Recoil atom handles it on actual successful login.
    setError(null); // Clear any previous errors
  };

  // Function to handle closing the sign-in prompt
  const handleCloseSignInPrompt = () => {
    setShowSignInPrompt(false);
    setFeatureClicked(null); // Clear the feature that was clicked
  };

  // Helper function to check for sign-in and show prompt if needed
  const checkSignInAndPrompt = (featureName, callback) => {
    if (!isSignedIn) {
      setFeatureClicked(featureName);
      setShowSignInPrompt(true);
      return false; // Prevent action
    }
    callback(); // Allow action if signed in
    return true; // Allow action
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setScore(null);
    setError(null);
  };

  // Validate inputs before sending
  const validateInputs = () => {
    if (!file) {
      setError("Please select a PDF or DOC file first.");
      return false;
    }

    if (includeJD && !isSignedIn) {
      setError("Please sign in to use Job Description matching.");
      setShowSignInPrompt(true);
      setFeatureClicked("Job Description");
      return false;
    }
    if (deepCheck && !isSignedIn) {
      setError("Please sign in to use Deep AI Check.");
      setShowSignInPrompt(true);
      setFeatureClicked("Deep AI Check");
      return false;
    }
    
    // Additional validation for JD inputs if includeJD is true (and user is signed in)
    if (includeJD) {
        if (!jobTitle.trim()) {
            setError("Job Title is required if including Job Description.");
            return false;
        }
        if (!jobDescription.trim()) {
            setError("Job Description cannot be empty.");
            return false;
        }
    }
    return true;
  };

  // Handle the ATS score check API call
  const handleScoreCheck = async () => {
    setError(null);
    setScore(null);

    if (!validateInputs()) return;

    setLoading(true); // Start loading

    try {
      // Call the centralized API utility function
      const data = await checkAtsScore(
        file,
        userEmail, // Pass user's email
        deepCheck,
        includeJD,
        jobTitle,
        jobDescription,
        userToken // Pass the authentication token
      );

      console.log("Response from server:", data);

      if (typeof data.score === "number") {
        setScore(data.score);
      } else if (data.message) {
        setError(data.message);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      if (err.message.includes("Authentication required") || err.message.includes("You need to be signed in")) {
        setError(err.message);
        setShowSignInPrompt(true);
        setFeatureClicked("ATS Score Check"); // Indicate that the check itself requires sign-in
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false); // End loading regardless of success or failure
    }
  };

  // Optional: Reset premium features if user logs out while modal is open
  useEffect(() => {
    if (!isSignedIn) {
      setIncludeJD(false);
      setDeepCheck(false);
      setJobTitle("");
      setJobDescription("");
    }
  }, [isSignedIn]); // Runs when isSignedIn changes

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-gray-100/95 px-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          className="relative w-full max-w-4xl rounded-2xl p-8 shadow-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-600 dark:text-gray-300 hover:text-red-500"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 text-center text-zinc-800 dark:text-white">
            📄 ATS Resume Score Checker
          </h2>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Panel */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-gray-200 mb-2">
                  Upload Resume
                </label>
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faFileUpload} className="text-blue-500" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Include Job Description Checkbox */}
              <label
                className={`flex items-center gap-3 text-zinc-700 dark:text-gray-200 cursor-pointer
                  ${!isSignedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="accent-green-600 w-5 h-5"
                  checked={includeJD}
                  onChange={() => checkSignInAndPrompt("Job Description", () => setIncludeJD(!includeJD))}
                  disabled={!isSignedIn && includeJD} // Disable if not signed in AND already checked
                />
                Include Job Description
              </label>

              {/* Enable Deep AI Check Checkbox */}
              <label
                className={`flex items-center gap-3 text-zinc-700 dark:text-gray-200 cursor-pointer
                  ${!isSignedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="accent-indigo-600 w-5 h-5"
                  checked={deepCheck}
                  onChange={() => checkSignInAndPrompt("Deep AI Check", () => setDeepCheck(!deepCheck))}
                  disabled={!isSignedIn && deepCheck} // Disable if not signed in AND already checked
                />
                <FontAwesomeIcon icon={faBolt} className="text-indigo-600" />
                Enable Deep AI Check
              </label>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col gap-5">
              {includeJD ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-gray-200 mb-2">
                      Job Title
                    </label>
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faBriefcase} className="text-emerald-600" />
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Frontend Developer"
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        disabled={!isSignedIn} // Disable input if not signed in
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-gray-200 mb-2">
                      Job Description
                    </label>
                    <textarea
                      rows={7}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste job description here..."
                      className="w-full p-3 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white resize-none"
                      disabled={!isSignedIn} // Disable textarea if not signed in
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic">
                  (Job description not included)
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleScoreCheck}
              disabled={loading}
              className="w-full py-3 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-transform flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  {/* Tailwind CSS spinner */}
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Check My ATS Score</span>
                </>
              )}
            </button>
          </div>

          {/* Show score */}
          {score !== null && (
            <motion.div
              className="mt-6 p-5 rounded-xl bg-green-100 dark:bg-green-900 text-center text-xl font-bold text-green-800 dark:text-green-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ✅ Your ATS Score: <span className="text-3xl">{score}%</span>
            </motion.div>
          )}

          {/* Show error */}
          {error && (
            <motion.div
              className="mt-6 p-5 rounded-xl bg-red-100 dark:bg-red-900 text-center text-xl font-bold text-red-800 dark:text-red-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ❌ {error}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* SignInPromptModal */}
      <SignInPromptModal
        isOpen={showSignInPrompt}
        onClose={handleCloseSignInPrompt}
        onSignInClick={handleSignIn}
        theme={"light"} // You might want to pass the actual theme from a parent component
      />
    </AnimatePresence>
  );
};

export default AtsScoreChecker;