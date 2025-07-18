import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  faFileAlt,
  faChartBar,
  faMagnifyingGlassChart,
  faUpload,
  faBolt,
  faBriefcase,
  faCheckCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// IMPORTANT: Adjust this import path to where your actual useUserSession hook is located!
import { useUserSession } from "../../../../hooks/useUserSession";

// Core libraries for Markdown rendering and sanitization
import { marked } from "marked";
import DOMPurify from "dompurify";

// Import your correct ATS sub-components
import AtsResultDisplay from "../ATSComponents/AtsResultDisplay";
import AtsLoadingPopup from "../ATSComponents/AtsLoadingPopup";
import ErrorPopup from "../../../Shared/ErrorPopup";

// Import the new API utility - ensure this is updated to correctly send the token
import { checkAtsScore } from "../../../../utils/apiconfig"; // Adjust path as necessary

// --- MOCKED DEPENDENCIES (for cookie handling, replace with your actual utils if they exist) ---
const cookieUtils = {
  setCookie: (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },
  getCookie: (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0)
        return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  eraseCookie: (name) => {
    document.cookie = name + "=; Max-Age=-99999999;";
  },
};
// --- END MOCKED DEPENDENCIES ---

// --- MAIN ATS SCORE CHECKER COMPONENT ---
const AtsScoreChecker = () => {
  const modalRef = useRef(null);
  const { user } = useUserSession(); // Get the user object from the session hook
  
  // Directly get the token and email. If they are not available from the hook,
  // the backend should handle authentication failures.
  const userToken = user.selected?.token;
  const userEmail = user.selected?.email;

  // State variables for the ATS Checker
  const [activeTab, setActiveTab] = useState("input");
  const [file, setFile] = useState(null);
  const [includeJD, setIncludeJD] = useState(false); // Controls visibility of JD fields
  const [deepCheck, setDeepCheck] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [fullGeminiResponse, setFullGeminiResponse] = useState(null);
  const [extractedResumeContent, setExtractedResumeContent] = useState(null);
  const [error, setError] = useState(null);
  const [rateLimitMessage, setRateLimitMessage] = useState(null);

  // State for the animated speedometer in the loading popup
  const [animatedLoadingScore, setAnimatedLoadingScore] = useState(0);

  // Effect for the speedometer animation in the loading popup
  useEffect(() => {
    let animationFrameId;
    let startTime = null;
    const duration = 12000; // 12 seconds for one full sweep from 0 to near max
    const maxSweepValue = 98; // The point the needle will sweep up to (almost 100)

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progressInCycle = elapsedTime / duration; // Current progress within one cycle

      let newScore;
      if (progressInCycle < 1) {
        newScore = progressInCycle * maxSweepValue;
      } else {
        const cycleProgress = (elapsedTime % duration) / duration;
        newScore = Math.sin(cycleProgress * Math.PI) * maxSweepValue;
      }

      setAnimatedLoadingScore(Math.max(0, Math.min(100, Math.round(newScore))));

      if (loading) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (loading) {
      setAnimatedLoadingScore(0);
      startTime = null;
      animationFrameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId);
      setAnimatedLoadingScore(0);
      startTime = null;
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [loading]);

  // Load last ATS result from local storage on component mount
  useEffect(() => {
    try {
      const savedScore = localStorage.getItem("lastAtsScore");
      const savedFullResponse = localStorage.getItem(
        "lastAtsFullGeminiResponse"
      );
      const savedExtractedContent = localStorage.getItem(
        "lastAtsExtractedResumeContent"
      );

      if (savedScore && savedFullResponse && savedExtractedContent) {
        setScore(parseFloat(savedScore));
        setFullGeminiResponse(savedFullResponse);
        setExtractedResumeContent(savedExtractedContent);
        setActiveTab("results");
      }
    } catch (e) {
      console.error("Failed to load ATS data from local storage:", e);
    }
  }, []);

  // Save ATS result to local storage
  const saveAtsResultToLocalStorage = (
    newScore,
    newFullResponse,
    newExtractedContent
  ) => {
    try {
      localStorage.setItem("lastAtsScore", newScore.toString());
      localStorage.setItem("lastAtsFullGeminiResponse", newFullResponse);
      localStorage.setItem("lastAtsExtractedResumeContent", newExtractedContent);
    } catch (e) {
      console.error("Failed to save ATS data to local storage:", e);
    }
  };

  // Rate Limiting Constants
  const RATE_LIMIT_COOKIE_NAME = "lastAtsCheckTime";
  const RATE_LIMIT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  // Function to check and update rate limit status
  const checkRateLimit = () => {
    const lastCheckTime = cookieUtils.getCookie(RATE_LIMIT_COOKIE_NAME);
    if (lastCheckTime) {
      const timeElapsed = Date.now() - parseInt(lastCheckTime, 10);
      if (timeElapsed < RATE_LIMIT_DURATION_MS) {
        const remainingTime = RATE_LIMIT_DURATION_MS - timeElapsed;
        const minutes = Math.ceil(remainingTime / (1000 * 60));
        setRateLimitMessage(
          `You can check your resume again in ${minutes} minute(s).`
        );
        return false;
      }
    }
    setRateLimitMessage(null);
    return true;
  };

  // Check rate limit on component mount and when loading status changes
  useEffect(() => {
    checkRateLimit();
  }, [loading]);

  // Handler for file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setScore(null);
    setFullGeminiResponse(null);
    setExtractedResumeContent(null);
    setError(null);
    setActiveTab("input");
  };

  // Input validation logic - simplified
  const validateInputs = () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return false;
    }
    // Remove the explicit check for userEmail here, as the assumption is the user is logged in
    // and the backend will handle missing/invalid tokens.
    // However, userEmail might still be needed for backend logic even if authentication passes.
    // If userEmail can realistically be null even if a token is present, you might keep a warning.
    // For now, let's remove it as per the request to simplify "logged-in" checks.
    
    if (includeJD) {
      if (!jobTitle.trim()) {
        setError("Job Title is required if matching with Job Description.");
        return false;
      }
      if (!jobDescription.trim()) {
        setError(
          "Job Description cannot be empty if matching with Job Description."
        );
        return false;
      }
    }
    return true;
  };

  // Main handler for initiating the ATS score check
  const handleScoreCheck = async () => {
    setError(null);
    setScore(null);
    setFullGeminiResponse(null);
    setExtractedResumeContent(null);

    // No feature gate checks for isSignedIn directly here.
    // The backend is responsible for verifying if a feature is premium/requires login
    // based on the provided token.

    if (!validateInputs()) return;
    if (!checkRateLimit()) return;

    setLoading(true);

    try {
      const responseData = await checkAtsScore(
        file,
        userEmail, // Pass userEmail, it might be null/undefined if useUserSession is slow or fails
        deepCheck,
        includeJD,
        jobTitle,
        jobDescription,
        userToken // Pass the token directly
      );

      console.log("Response from server:", responseData);

      if (
        responseData &&
        responseData.score !== undefined &&
        responseData.fullGeminiResponse
      ) {
        setScore(responseData.score);
        setFullGeminiResponse(responseData.fullGeminiResponse);
        setExtractedResumeContent(responseData.extractedResumeContent);
        setError(null);
        saveAtsResultToLocalStorage(
          responseData.score,
          responseData.fullGeminiResponse,
          responseData.extractedResumeContent
        );
        cookieUtils.setCookie(RATE_LIMIT_COOKIE_NAME, Date.now().toString(), 1);
        checkRateLimit();
        setActiveTab("results");
      } else if (responseData && responseData.errorMessage) {
        setError(responseData.errorMessage);
        setActiveTab("input");
      } else {
        setError("Unexpected response from server. Please try again.");
        setActiveTab("input");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // More robust error message for the user, especially if it's an auth error
      if (err.message.includes("Unauthorized") || err.message.includes("Forbidden")) {
          setError("Session expired or invalid. Please refresh the page and try again.");
      } else {
          setError(err.message || "An unknown error occurred.");
      }
      setActiveTab("input");
    } finally {
      setLoading(false);
    }
  };

  // The submit button is only disabled by loading or rate limit.
  // We're removing the `!isSignedIn` disable logic here.
  const isSubmitDisabled = loading || !!rateLimitMessage;

  const renderMarkdown = (markdown) => {
    if (!markdown) {
      return { __html: "<p>No detailed AI analysis available.</p>" };
    }
    const rawHtml = marked.parse(markdown);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    return { __html: sanitizedHtml };
  };

  const getDisplayScore = () => {
    if (score !== null && typeof score === "number" && score >= 0) {
      return Math.round(score);
    }
    const match = fullGeminiResponse?.match(
      /(?:ATS Score:|Score:)?\s*(\d+)(?:%|\/100)?/i
    );
    return match ? Math.round(parseInt(match[1])) : 0;
  };
  const displayScore = getDisplayScore();

  return (
    <motion.div
      ref={modalRef}
      className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl rounded-2xl
                   bg-transparent border-none
                   transform transition-all duration-300 ease-in-out
                   h-[600px] max-h-[600px] overflow-hidden flex flex-col
                   font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <AtsLoadingPopup isLoading={loading} animatedScore={animatedLoadingScore} />

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <button
          className={`flex-1 py-3 px-4 text-sm sm:text-base font-semibold transition-colors duration-200 flex items-center justify-center gap-2
                            ${
                              activeTab === "input"
                                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                : "text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200"
                            }`}
          onClick={() => setActiveTab("input")}
        >
          <FontAwesomeIcon icon={faFileAlt} /> Send Request
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm sm:text-base font-semibold transition-colors duration-200 flex items-center justify-center gap-2
                            ${
                              activeTab === "results"
                                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                : "text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200"
                            }`}
          onClick={() => setActiveTab("results")}
          disabled={loading && !score && !fullGeminiResponse && !error}
        >
          <FontAwesomeIcon icon={faChartBar} /> Show Response
        </button>
      </div>

      {/* Tab content area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "input" && (
            <motion.div
              key="inputTab"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar flex flex-col gap-5 sm:gap-6 font-roboto min-h-[300px]">
                {/* Rate Limit Message */}
                {rateLimitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-orange-100 dark:bg-orange-900 border border-orange-400 dark:border-orange-700 text-orange-700 dark:text-orange-300 px-4 py-3 rounded-xl relative text-sm font-lato"
                    role="alert"
                  >
                    <strong className="font-bold">Rate Limit Exceeded:</strong>
                    <span className="block sm:inline ml-2">
                      {rateLimitMessage}
                    </span>
                  </motion.div>
                )}

                {/* File Upload Section */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex-shrink-0">
                  <label className="block text-base font-montserrat font-semibold text-zinc-700 dark:text-gray-200 mb-3">
                    Upload Your Resume (PDF Only):
                  </label>
                  <div
                    className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed
                                 rounded-xl cursor-pointer bg-white dark:bg-zinc-700
                                 border-gray-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-400
                                 transition-all duration-200 ease-in-out"
                    onClick={() => document.getElementById("resume-upload").click()}
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-4xl text-blue-500 dark:text-blue-400 mb-3"
                    />
                    <p className="mb-2 text-sm text-zinc-600 dark:text-gray-300">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-gray-400">
                      PDF (MAX. 5MB)
                    </p>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      hidden
                    />
                  </div>
                  {file && (
                    <p className="mt-3 text-sm text-zinc-600 dark:text-gray-300">
                      Selected file:{" "}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {file.name}
                      </span>
                    </p>
                  )}
                </div>

                {/* Premium Features Section - NO isSignedIn checks here */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex-shrink-0">
                  <p className="block text-base font-montserrat font-semibold text-zinc-700 dark:text-gray-200 mb-3">
                    Enhance Your Check:
                  </p>

                  {/* Include Job Description Checkbox */}
                  <label
                    className={`flex items-center gap-3 py-2 text-base font-lato cursor-pointer
                                 text-zinc-700 dark:text-gray-200 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200`}
                  >
                    <input
                      type="checkbox"
                      className="peer hidden"
                      checked={includeJD}
                      onChange={() => {
                        setIncludeJD(!includeJD);
                        // Clear job details when unchecking to prevent stale data
                        if (includeJD) {
                          setJobTitle("");
                          setJobDescription("");
                        }
                      }}
                      // Removed disabled={!isSignedIn}
                    />
                    <span
                      className="relative w-6 h-6 border-2 rounded-md transition-all duration-200 ease-in-out flex-shrink-0
                                  border-green-400 dark:border-green-600
                                  bg-white dark:bg-zinc-700
                                  peer-checked:bg-green-500 peer-checked:border-green-500 dark:peer-checked:bg-green-600 dark:peer-checked:border-green-600
                                  flex items-center justify-center text-white
                                  peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:outline-none"
                    >
                      {includeJD && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="block"
                        >
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-white text-sm"
                          />
                        </motion.span>
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      Match with Job Description
                    </span>
                  </label>

                  {/* Enable Deep AI Check Checkbox */}
                  <label
                    className={`flex items-center gap-3 py-2 text-base font-lato cursor-pointer
                                 text-zinc-700 dark:text-gray-200 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200`}
                  >
                    <input
                      type="checkbox"
                      className="peer hidden"
                      checked={deepCheck}
                      onChange={() => {
                        setDeepCheck(!deepCheck);
                      }}
                      // Removed disabled={!isSignedIn}
                    />
                    <span
                      className="relative w-6 h-6 border-2 rounded-md transition-all duration-200 ease-in-out flex-shrink-0
                                  border-indigo-400 dark:border-indigo-600
                                  bg-white dark:bg-zinc-700
                                  peer-checked:bg-indigo-500 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-600 dark:peer-checked:border-indigo-600
                                  flex items-center justify-center text-white
                                  peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:outline-none"
                    >
                      {deepCheck && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="block"
                        >
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-white text-sm"
                          />
                        </motion.span>
                      )}
                    </span>
                    <FontAwesomeIcon
                      icon={faBolt}
                      className="text-indigo-600 dark:text-indigo-400 text-lg"
                    />
                    <span className="flex-1 min-w-0">
                      Deep AI Check (Pro Feature)
                    </span>
                  </label>
                </div>

                {/* Job Details Section - Conditionally rendered with animation */}
                <AnimatePresence>
                  {includeJD && (
                    <motion.div
                      key="jobDetailsSection"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: "1.25rem" }} // Add margin when open
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex-shrink-0">
                        <p className="block text-base font-montserrat font-semibold text-zinc-700 dark:text-gray-200 mb-3">
                          Job Details for Matching:
                        </p>
                        <div className="mb-4">
                          <label
                            htmlFor="job-title-input"
                            className="block text-sm font-lato font-medium text-zinc-600 dark:text-gray-300 mb-2"
                          >
                            Job Title
                          </label>
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="text-emerald-600 text-xl"
                            />
                            <input
                              id="job-title-input"
                              type="text"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              placeholder="e.g. Frontend Developer"
                              className={`w-full p-2.5 rounded-lg border
                                         border-gray-300 dark:border-zinc-600
                                         bg-white dark:bg-zinc-700
                                         text-zinc-900 dark:text-white
                                         focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                         min-w-0 font-open-sans`}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="job-description-textarea"
                            className="block text-sm font-lato font-medium text-zinc-600 dark:text-gray-300 mb-2"
                          >
                            Job Description
                          </label>
                          <textarea
                            id="job-description-textarea"
                            rows={8}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here..."
                            className={`w-full p-3 rounded-lg border
                                       border-gray-300 dark:border-zinc-600
                                       bg-white dark:bg-zinc-700
                                       text-zinc-900 dark:text-white resize-y
                                       focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                       min-h-[8rem] font-open-sans`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main placeholder if no file is selected. */}
                <AnimatePresence mode="wait">
                  {!file && (
                    <motion.div
                      key="noFilePlaceholder"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center text-zinc-500 dark:text-gray-400 p-8 flex flex-col items-center gap-4"
                    >
                      <FontAwesomeIcon
                        icon={faMagnifyingGlassChart}
                        className="text-blue-400 dark:text-blue-500 text-5xl mb-3"
                      />
                      <p className="text-lg font-semibold text-zinc-700 dark:text-gray-300">
                        Upload your resume to get started!
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-gray-400">
                        Your file will be processed securely.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative text-sm font-lato"
                    role="alert"
                  >
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                    <span
                      className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                      onClick={() => setError(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <div
                className={`fixed bottom-0 backdrop-blur-sm right-0 left-0 p-4 border-t border-gray-200 dark:border-zinc-700 mt-auto flex-shrink-0`}
              >
                <button
                  onClick={handleScoreCheck}
                  className={` w-full py-3 px-6 rounded-lg text-white font-semibold flex items-center justify-center gap-2
                                    ${
                                      isSubmitDisabled
                                        ? "bg-gray-400 dark:bg-zinc-600 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                    }`}
                  disabled={isSubmitDisabled}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    "Get ATS Score"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div
              key="resultsTab"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col"
            >
              <AtsResultDisplay
                score={score}
                fullGeminiResponse={fullGeminiResponse}
                loading={loading}
                error={error}
                getDisplayScore={getDisplayScore}
                renderMarkdown={renderMarkdown}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AtsScoreChecker;