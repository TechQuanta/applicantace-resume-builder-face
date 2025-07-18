// src/pages/ResumeExamples.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState, useRecoilState, useRecoilValueLoadable } from 'recoil';
import {
  FaThLarge,
  FaCube,
  FaFeatherAlt,
  FaAlignLeft,
  FaCameraRetro,
  FaFileUpload,
  FaFileAlt,
  FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Import marked and DOMPurify
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Importing necessary components
import SkeletonCard from "../components/SkeletonShell";
import TemplateCard from "../components/Models/TemplateCard";
import "../style/template.css";

// Import Recoil atoms and selectors from your templateAtom.jsx file
import {
  templatesState,
  selectedCategoryState,
  isPageLoadingState,
  isMoreLoadingState,
  errorState,
  filteredTemplatesSelector,
  categoriesSelector,
  templateDataQuery
} from '../../../services/templateAtom';

// Import the new resume extraction service
import { extractResumeContent } from '../../../utils/apiconfig';

// Import the user session hook
import { useUserSession } from '../../../hooks/useUserSession';

// Import the SignInPromptBanner component
import SignInPromptBanner from '../../Shared/SignInPromptModal';

// --- Constants for file validation ---
const MAX_FILE_SIZE_KB = 300;
const ACCEPTED_FILE_TYPE = 'application/pdf'; // Only PDF allowed

// --- Component responsible for fetching and setting initial template data into Recoil ---
const TemplateDataFetcher = () => {
  const templateLoadable = useRecoilValueLoadable(templateDataQuery);
  const setTemplates = useSetRecoilState(templatesState);
  const setIsLoading = useSetRecoilState(isPageLoadingState);
  const [error, setError] = useRecoilState(errorState);

  useEffect(() => {
    setIsLoading(templateLoadable.state === 'loading');

    if (templateLoadable.state === 'hasValue') {
      setTemplates(templateLoadable.contents);
      setError(null);
    } else if (templateLoadable.state === 'hasError') {
      setError({ message: templateLoadable.contents?.message || "An unknown error occurred during template fetch." });
      setTemplates([]);
      console.error("Error fetching templates in TemplateDataFetcher:", templateLoadable.contents);
    }
  }, [templateLoadable.state, templateLoadable.contents, setTemplates, setIsLoading, setError]);

  return null;
};

// --- New component for the extraction result popup ---
const ExtractionResultModal = ({ isOpen, onClose, data, error, isLoading }) => {
  if (!isOpen) return null;

  const contentToParse = typeof data === 'string'
    ? data
    : (data?.extractedText || data?.content || '');

  const rawHtml = marked.parse(contentToParse);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resume Extraction Result</h2>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Extracting content...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {data && (
          <div className="mt-4 text-gray-800 dark:text-gray-200 text-base">
            <h3 className="font-semibold text-lg mb-2">Extracted Resume Content:</h3>
            <div
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md prose dark:prose-invert"
              style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


const ResumeExamples = () => {
  const navigate = useNavigate();

  const templates = useRecoilValue(templatesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);
  const isPageLoading = useRecoilValue(isPageLoadingState);
  const [isMoreLoading, setIsMoreLoading] = useRecoilState(isMoreLoadingState);
  const error = useRecoilValue(errorState);

  const currentFilteredTemplates = useRecoilValue(filteredTemplatesSelector);
  const categories = useRecoilValue(categoriesSelector);

  // States for file upload and extraction
  const [fileToExtract, setFileToExtract] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [fileValidationError, setFileValidationError] = useState(null); // New state for file validation errors
  const [showExtractionResultModal, setShowExtractionResultModal] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [extractionError, setExtractionError] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Get user session and token invalidation handler
  const { user, handleTokenInvalidation } = useUserSession();
  const isLoggedIn = useMemo(() => !!user.selected?.email, [user.selected?.email]);
  const userToken = user.selected?.token;

  // State to control the visibility of the SignInPromptBanner
  const [showSignInBanner, setShowSignInBanner] = useState(false);

  // Remaining local states
  const loaderRef = useRef(null);
  const itemsPerLoad = 8;
  const [page, setPage] = useState(1);
  const [visibleTemplates, setVisibleTemplates] = useState([]);

  const [currentGif, setCurrentGif] = useState(0);
  const gifs = [
    "/main/template.gif",
    "/main/main1.gif",
    "/main/main2.gif",
  ];

  // Theme detection
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
      if (e.matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };
    prefersDark.addEventListener('change', handler);

    if (prefersDark.matches) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    return () => prefersDark.removeEventListener('change', handler);
  }, []);
  const isDark = theme === "dark";


  // Pagination logic
  useEffect(() => {
    if (!isPageLoading) {
      setVisibleTemplates(currentFilteredTemplates.slice(0, page * itemsPerLoad));
    }
  }, [currentFilteredTemplates, page, itemsPerLoad, isPageLoading]);

  // Reset page to 1 when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const loadMore = useCallback(() => {
    if (isMoreLoading || isPageLoading || visibleTemplates.length >= currentFilteredTemplates.length) {
        return;
    }

    setIsMoreLoading(true);
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1);
      setIsMoreLoading(false);
    }, 800);
  }, [isMoreLoading, isPageLoading, visibleTemplates, currentFilteredTemplates, setIsMoreLoading]);

  // Intersection Observer for "load more"
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isMoreLoading && !isPageLoading && visibleTemplates.length < currentFilteredTemplates.length) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef, isMoreLoading, isPageLoading, visibleTemplates, currentFilteredTemplates, loadMore]);

  // GIF Carousel Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGif((prev) => (prev + 1) % gifs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [gifs.length]);

  // Handler for file upload (for extraction)
  const handleFileChangeForExtraction = (e) => {
    setFileValidationError(null); // Clear previous validation errors
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      if (file.type !== ACCEPTED_FILE_TYPE) {
        setFileValidationError(`Invalid file type. Please upload a PDF file (.pdf).`);
        setFileToExtract(null);
        setUploadedFileName("");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_KB * 1024) { // Convert KB to bytes
        setFileValidationError(`File size exceeds ${MAX_FILE_SIZE_KB}KB limit. Please upload a smaller PDF.`);
        setFileToExtract(null);
        setUploadedFileName("");
        return;
      }

      // If validation passes
      setFileToExtract(file);
      setUploadedFileName(file.name);
      setExtractionError(null);
      setExtractionResult(null);
    } else {
      setFileToExtract(null);
      setUploadedFileName("");
      setFileValidationError(null); // Clear validation error if no file is selected
    }
  };

  // Handler for resume extraction API call
  const handleExtractResumeContent = async () => {
    // If not logged in, show banner and prevent API call
    if (!isLoggedIn) {
      setShowSignInBanner(true);
      setExtractionError("Please sign in to extract resume content.");
      setShowExtractionResultModal(true);
      return;
    }

    // Check for file before proceeding
    if (!fileToExtract) {
      setExtractionError("Please select a resume file to extract content.");
      setShowExtractionResultModal(true);
      return;
    }

    // Check for client-side validation errors before proceeding
    if (fileValidationError) {
        setExtractionError(fileValidationError); // Display the existing file validation error
        setShowExtractionResultModal(true);
        return;
    }


    setExtractionResult(null);
    setExtractionError(null);
    setIsExtracting(true);
    setShowExtractionResultModal(true);

    try {
      const data = await extractResumeContent(fileToExtract, userToken);
      setExtractionResult(data);
    } catch (err) {
      const clientErrorMessage = err.response?.data?.message || err.message || "Failed to extract resume content.";
      setExtractionError(clientErrorMessage);
      console.error("Resume extraction error in component:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        handleTokenInvalidation(user.selected?.email);
        setExtractionError("Your session has expired. Please log in again.");
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Handler for when a template card is clicked
  const handleTemplateCardClick = useCallback((templateId, templateName) => {
    console.log(`Clicked example template: ${templateName} (ID: ${templateId}). No detail modal on this page.`);
  }, []);

  // Function to get the React Icon component based on the string identifier
  const getCategoryIcon = useCallback((iconString) => {
    switch (iconString) {
      case 'FaCube': return <FaCube />;
      case 'FaFeatherAlt': return <FaFeatherAlt />;
      case 'FaAlignLeft': return <FaAlignLeft />;
      case 'FaCameraRetro': return <FaCameraRetro />;
      default: return <FaThLarge />;
    }
  }, []);

  // Function to navigate to the sign-up page
  const handleSignInBannerClick = () => {
    setShowSignInBanner(false);
    navigate("/SignUp");
  };

  return (
    <div className={`main-container ${isDark ? 'dark-mode' : ''}`}>
      <TemplateDataFetcher />

      <SignInPromptBanner
        isOpen={showSignInBanner && !isLoggedIn}
        onClose={() => setShowSignInBanner(false)}
        onSignInClick={handleSignInBannerClick}
        theme={theme}
      />

      <div className={`background-grid ${isDark ? 'background-grid-dark' : 'background-grid-light'}`} />

      {isPageLoading && !error ? (
        <div className="loading-overlay">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="loading-spinner"
          />
          <p className="loading-text font-roboto">Loading examples...</p>
        </div>
      ) : error ? (
        <p className="error-message font-roboto">Error: {error.message}</p>
      ) : (
        <div className="content-wrapper">
          <div className="top-section">
            <div className="text-section">
              <p className="breadcrumb-text font-lato">
                <Link to="/" className="breadcrumb-link">Home</Link> &gt; Resume Examples
              </p>

              <h1 className="heading-primary font-oswald">
                RESUME{" "}
                <span className="heading-gradient">
                  Examples
                </span>
              </h1>

              <p className="description-text font-open-sans">
                Here are some top most examples of resumes that you can use to create your own. You can also upload your own resume and we will help you to create a new one.
              </p>

              <div className="button-group">
                {/* File Upload for Extraction - Disabled if not logged in */}
                <label
                  className={`file-upload-label font-poppins ${!isLoggedIn ? 'cursor-not-allowed opacity-60' : ''}`}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      setShowSignInBanner(true);
                    }
                  }}
                >
                  <FaFileUpload />
                  {uploadedFileName ? "Selected: " + uploadedFileName : "Select Resume File"}
                  <input
                    type="file"
                    accept=".pdf" // Restrict file type here
                    className="file-upload-input"
                    onChange={handleFileChangeForExtraction}
                    disabled={!isLoggedIn}
                  />
                </label>

                {/* File Validation Error Message */}
                {fileValidationError && (
                    <p className="text-red-500 text-sm mt-2 font-lato">
                        {fileValidationError}
                    </p>
                )}

                {/* New "Extract Resume Content" Button - Disabled if not logged in or validation fails */}
                <button
                  onClick={handleExtractResumeContent}
                  className={`extract-button font-poppins ${!isLoggedIn || isExtracting || !fileToExtract || fileValidationError ? 'cursor-not-allowed opacity-60' : ''}`}
                  disabled={!isLoggedIn || isExtracting || !fileToExtract || fileValidationError}
                >
                  <FaFileAlt className="extract-icon" />
                  {isExtracting ? "Extracting..." : "Extract Resume Content"}
                </button>
              </div>
            </div>

            <div className="gif-container-wrapper">
              <div className="gif-display-area">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentGif}
                    src={gifs[currentGif]}
                    alt={`Resume gif ${currentGif + 1}`}
                    className="gif-image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="filter-container">
            {categories.map((item) => (
              <button
                key={item.category}
                className={`filter-button ${selectedCategory === item.category ? "filter-button-selected" : ""} font-montserrat`}
                onClick={() => setSelectedCategory(item.category)}
              >
                {getCategoryIcon(item.icon)}
                {item.label}
              </button>
            ))}
          </div>

          <div className="template-grid">
            {visibleTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                image={template.image}
                onClick={() => handleTemplateCardClick(template.id, template.name)}
                className="template-card-base"
                theme={theme}
              />
            ))}
            {isMoreLoading && visibleTemplates.length < currentFilteredTemplates.length &&
              Array.from({ length: itemsPerLoad }).map((_, i) => (
                <SkeletonCard key={`more-skeleton-${i}`} theme={theme} />
              ))
            }
          </div>

          <div ref={loaderRef} className="loader-section">
            {isMoreLoading && visibleTemplates.length < currentFilteredTemplates.length ? (
              <p className="loading-more-text font-lato">Loading more examples...</p>
            ) : visibleTemplates.length < currentFilteredTemplates.length ? (
              <button
                onClick={loadMore}
                className="load-more-button font-lato"
              >
                Load More
              </button>
            ) : (
              templates.length > 0 ? (
                <p className="end-of-list-text font-lato">You've seen all available examples!</p>
              ) : (
                <div className="empty-space"></div>
              )
            )}
          </div>
        </div>
      )}

      {/* Extraction Result Modal */}
      <ExtractionResultModal
        isOpen={showExtractionResultModal}
        onClose={() => setShowExtractionResultModal(false)}
        data={extractionResult}
        error={extractionError}
        isLoading={isExtracting}
      />
    </div>
  );
};

export default ResumeExamples;