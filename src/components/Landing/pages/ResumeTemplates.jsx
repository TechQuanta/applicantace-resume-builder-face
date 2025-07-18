// src/pages/ResumeTemplates.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue, useSetRecoilState, useRecoilState, useRecoilValueLoadable } from 'recoil';
import {
  FaThLarge,
  FaCube,
  FaFeatherAlt,
  FaAlignLeft,
  FaCameraRetro,
  FaLinkedin,
  FaFileUpload,
  FaStar,
  FaRegStar
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Importing separate components
import SkeletonCard from "../components/SkeletonShell";
import TemplateCard from "../components/Models/TemplateCard";
import SignInPromptModal from "../../Shared/SignInPromptModal";
import ResumeDetailModal from "../components/Models/ResumeDetailModal"; // Ensure this import is correct

// NEW: Import global CSS file
import '../style/template.css';

// Import Recoil atoms and selectors from your templateAtom.jsx file
import {
  templatesState,
  selectedCategoryState,
  isPageLoadingState,
  isMoreLoadingState,
  errorState,
  isAsmaeLoggedInState,
  filteredTemplatesSelector,
  categoriesSelector,
  templateDataQuery // Correctly import the renamed selector
} from '../../../services/templateAtom'; // Adjust path if you named it .js or placed it elsewhere

// NEW: Import necessary atoms/hooks from fileatom and authatom
import { filesState } from '../../../services/fileatom'; // To update the user's files after replication
import { useUserSession } from '../../../hooks/useUserSession'; // To get user email and username

// --- Component responsible for fetching and setting initial template data ---
const TemplateDataFetcher = () => {
  const templateLoadable = useRecoilValueLoadable(templateDataQuery);
  const setTemplates = useSetRecoilState(templatesState);
  const setIsLoading = useSetRecoilState(isPageLoadingState);
  const setError = useSetRecoilState(errorState);

  useEffect(() => {
    setIsLoading(templateLoadable.state === 'loading');

    if (templateLoadable.state === 'hasValue') {
      setTemplates(templateLoadable.contents);
      setError(null);
    } else if (templateLoadable.state === 'hasError') {
      setError({ message: templateLoadable.contents?.message || "An unknown error occurred during template fetch." });
      setTemplates([]);
      console.error("Error fetching templates:", templateLoadable.contents);
    }
  }, [templateLoadable.state, templateLoadable.contents, setTemplates, setIsLoading, setError]);

  return null;
};
// --- END TemplateDataFetcher COMPONENT ---

const ResumeTemplates = ({ onChooseTemplate }) => {
  // --- Replace local state with Recoil state where appropriate ---
  const [templates, setTemplates] = useRecoilState(templatesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);
  const [isPageLoading, setIsPageLoading] = useRecoilState(isPageLoadingState);
  const [isMoreLoading, setIsMoreLoading] = useRecoilState(isMoreLoadingState);
  const [error, setError] = useRecoilState(errorState);
  const [isAsmaeLoggedIn, setIsAsmaeLoggedIn] = useRecoilState(isAsmaeLoggedInState); // This might be redundant if using useUserSession for login status
  const [currentGif, setCurrentGif] = useState(0);

  // --- Recoil Selectors for derived state ---
  const currentFilteredTemplates = useRecoilValue(filteredTemplatesSelector);
  const categories = useRecoilValue(categoriesSelector);

  // --- User Session Hook ---
  const { user, isLoading: userSessionLoading } = useUserSession(); // Get user session info
  const setFilesState = useSetRecoilState(filesState); // To update user's documents after replication

  // --- Remaining local states ---
  const loaderRef = useRef(null);
  const itemsPerLoad = 8;
  const [page, setPage] = useState(1);
  const [visibleTemplates, setVisibleTemplates] = useState([]);
  const [linkedinURL, setLinkedinURL] = useState("");
  const [showLinkedInInput, setShowLinkedInInput] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [templateToUseId, setTemplateToUseId] = useState(null); // Keep this for pre-login template selection
  const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState(null); // Template object for the modal

  const gifs = [
    "/main/main1.gif",
    "/main/main2.gif",
    "/main/main3.gif",
    "/main/main4.gif",
  ];

  // Demo Login: Use userSession hook for real login status if available
  useEffect(() => {
    // If you're using useUserSession for actual login, this demo login might be removed or adapted.
    // For now, keeping it as is, but be aware of potential conflict/redundancy.
    // if (user?.selected) {
    //   setIsAsmaeLoggedIn(true);
    // } else {
    //   const simulateLogin = setTimeout(() => {
    //     setIsAsmaeLoggedIn(true);
    //     console.log("Demo: Asmae is now 'logged in' for template selection.");
    //   }, 3000);
    //   return () => clearTimeout(simulateLogin);
    // }
  }, [user, setIsAsmaeLoggedIn]); // Add user to dependencies if you integrate it here

  // Theme detection
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);
  const isDark = theme === "dark";

  // Pagination logic
  useEffect(() => {
    if (!isPageLoading) {
      setVisibleTemplates(currentFilteredTemplates.slice(0, page * itemsPerLoad));
    }
  }, [currentFilteredTemplates, page, itemsPerLoad, isPageLoading]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const loadMore = useCallback(() => {
    if (isMoreLoading || isPageLoading || visibleTemplates.length >= currentFilteredTemplates.length) return;
    setIsMoreLoading(true);
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1);
      setIsMoreLoading(false);
    }, 800);
  }, [isMoreLoading, isPageLoading, visibleTemplates.length, currentFilteredTemplates.length, setIsMoreLoading]);

  // Intersection Observer
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

  // GIF Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGif((prev) => (prev + 1) % gifs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [gifs.length]);

  // LinkedIn/File Upload handlers
  const handleLinkedInImport = () => {
    if (!linkedinURL.trim()) {
      console.log("Please enter a LinkedIn profile URL");
      return;
    }
    console.log(`Fetching data from LinkedIn: ${linkedinURL}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    console.log(`Uploaded: ${file.name}`);
  };

  // This `handleUseTemplate` function now directly opens the modal for replication
  const handleUseTemplate = useCallback((template) => {
    if (user?.selected) { // Check for a logged-in user session
      setSelectedTemplateForDetail(template); // Pass the entire template object
    } else {
      setTemplateToUseId(template.id); // Store template ID if user needs to sign in
      setShowSignInModal(true);
      console.log("User not logged in. Showing sign-in prompt for template selection.");
    }
  }, [user]);

  // Handle successful sign-in from modal
  const handleSignInSuccess = useCallback(() => {
    // setIsAsmaeLoggedIn(true); // This might become redundant if user session state is the single source of truth
    setShowSignInModal(false);
    if (templateToUseId && user?.selected) { // Ensure user is now logged in
      // Re-call handleUseTemplate with the stored template ID to proceed with opening the detail modal
      // This part needs adjustment if `handleUseTemplate` expects the full template object.
      // For simplicity, let's just close the sign-in modal and let the user click the template again.
      // Or, better, pass the full template object to the sign-in modal to preserve it.
      // For now, if a template was chosen before login, we'll reopen the detail modal directly.
      const chosenTemplate = templates.find(t => t.id === templateToUseId);
      if (chosenTemplate) {
        setSelectedTemplateForDetail(chosenTemplate);
      }
      setTemplateToUseId(null);
    }
  }, [templateToUseId, user, templates]); // Added templates to dependency

  // Function to get the React Icon component
  const getCategoryIcon = useCallback((iconString) => {
    switch (iconString) {
      case 'FaCube': return <FaCube />;
      case 'FaFeatherAlt': return <FaFeatherAlt />;
      case 'FaAlignLeft': return <FaAlignLeft />;
      case 'FaCameraRetro': return <FaCameraRetro />;
      case 'FaStar': return <FaStar />;
      case 'FaRegStar': return <FaRegStar />;
      default: return <FaThLarge />;
    }
  }, []);

  return (
    <div className={`main-container ${isDark ? 'dark-mode' : ''}`}>
      <TemplateDataFetcher />

      <div className={`background-grid ${isDark ? 'background-grid-dark' : 'background-grid-light'}`} />

      {isPageLoading && !error ? (
        <div className="loading-overlay">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="loading-spinner"
          />
          {/* Apply font-roboto for loading text */}
          <p className="loading-text font-roboto">Loading templates...</p>
        </div>
      ) : error ? (
        // Apply font-roboto for error message
        <p className="error-message font-roboto">Error: {error.message}</p>
      ) : (
        <div className="content-wrapper">
          <div className="top-section">
            <div className="text-section">
              {/* Apply font-lato for breadcrumb */}
              <p className="breadcrumb-text font-lato">
                <Link to="/" className="breadcrumb-link">Home</Link> &gt; Resume Templates
              </p>
              {/* Apply font-oswald for main heading */}
              <h1 className="heading-primary font-oswald">
                RESUME{" "}
                <span className="heading-gradient">TEMPLATES</span>
              </h1>
              {/* Apply font-open-sans for description text */}
              <p className="description-text font-open-sans">
                Choose a free Resume Template and build your resume. Use our intuitive drag-and-drop resume builder and save it as a PDF in minutes. Start building your resume right now.
              </p>

              {showLinkedInInput && (
                <div className="linkedin-input-group">
                  {/* Apply font-roboto for input field */}
                  <input
                    type="text"
                    placeholder="Enter LinkedIn profile URL"
                    className="linkedin-input-field font-roboto"
                    value={linkedinURL}
                    onChange={(e) => setLinkedinURL(e.target.value)}
                  />
                  {/* Apply font-roboto for button */}
                  <button onClick={handleLinkedInImport} className="linkedin-import-button font-roboto">
                    Import
                  </button>
                </div>
              )}
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
                // Apply font-montserrat for filter button text
                className={`filter-button ${selectedCategory === item.category ? 'filter-button-selected' : ''} font-montserrat`}
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
                onClick={() => handleUseTemplate(template)} // Pass the full template object
                theme={theme}
                className="template-card-base"
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
              // Apply font-lato for loading more text
              <p className="loading-more-text font-lato">Loading more templates...</p>
            ) : visibleTemplates.length < currentFilteredTemplates.length ? (
              // Apply font-lato for load more button
              <button onClick={loadMore} className="load-more-button font-lato">
                Load More
              </button>
            ) : (
              templates.length > 0 ? (
                // Apply font-lato for end of list text
                <p className="end-of-list-text font-lato">You've seen all available templates!</p>
              ) : (
                <div className="empty-space"></div>
              )
            )}
          </div>
        </div>
      )}

      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInClick={handleSignInSuccess}
        theme={theme}
      />
      <ResumeDetailModal
        isOpen={!!selectedTemplateForDetail}
        onClose={() => setSelectedTemplateForDetail(null)}
        template={selectedTemplateForDetail}
        // No longer pass onUseTemplate, modal handles replication directly
        theme={theme}
        // Pass setFilesState to update the Recoil filesState after replication
        onReplicationSuccess={(newFile) => {
          setFilesState(prevFiles => [...prevFiles, newFile]);
          setSelectedTemplateForDetail(null); // Close modal on success
        }}
      />
    </div>
  );
};

export default ResumeTemplates;