// src/components/ResumeCarousel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SignInPromptModal from "../../components/Shared/SignInPromptModal";
import { useUserSession } from "../../hooks/useUserSession";
import { useRecoilValueLoadable } from 'recoil';
import { templateDataQuery } from '../../services/templateAtom';

// Import the ResumeDetailModal
import ResumeDetailModal from './components/Models/ResumeDetailModal'; // Adjust the path as per your project structure

// Icons (assuming you have these accessible, e.g., via a library like react-icons or SVG imports)
// For demonstration, I'm embedding simple SVG placeholders.
const IconDownload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
  </svg>
);

const IconEye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
  </svg>
);

// --- START: Skeleton Carousel Card Component ---
const SkeletonCarouselCard = ({ theme }) => {
  const isDark = theme === "dark";
  const bgColorClass = isDark ? "bg-gray-700" : "bg-gray-100";
  const pulseColorClass = isDark ? "bg-gray-600" : "bg-gray-300";

  return (
    <div className={`skeleton-card ${bgColorClass} dark:bg-gray-800 dark:border-gray-700`}>
      <div className={`skeleton-image ${bgColorClass}`}></div>
      <div className={`skeleton-text-line ${pulseColorClass}`}></div>
      <div className={`skeleton-button-area ${pulseColorClass}`}></div>
    </div>
  );
};
// --- END: Skeleton Carousel Card Component ---

const ResumeCarousel = ({ onChooseTemplate }) => {
  const { user } = useUserSession();
  const navigate = useNavigate();

  const templatesLoadable = useRecoilValueLoadable(templateDataQuery);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [templateToUseId, setTemplateToUseId] = useState(null);

  // New states for the Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);

  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    setTheme(prefersDark.matches ? "dark" : "light");
    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);
  const isDark = theme === "dark";

  const templates = templatesLoadable.state === 'hasValue' ? templatesLoadable.contents : [];
  const loading = templatesLoadable.state === 'loading';
  const error = templatesLoadable.state === 'hasError' ? templatesLoadable.contents : null;

  const total = templates.length;

  const getPositionClass = useCallback((index) => {
    if (total === 0) return "carousel-item--hidden";
    if (index === activeIndex) return "carousel-item--active";
    if ((index + 1) % total === activeIndex) return "carousel-item--left-neighbor";
    if ((index - 1 + total) % total === activeIndex) return "carousel-item--right-neighbor";
    return "carousel-item--far";
  }, [total, activeIndex]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  // Modified: This now opens the Detail Modal
  const handleViewDetailsAndUse = (template) => {
    setSelectedTemplateDetails(template);
    setShowDetailModal(true);
    console.log("Showing detail modal for template:", template.name);
  };

  // This function is passed to the ResumeDetailModal and is called when "Choose This Template" is clicked inside it.
  const handleUseTemplateFromModal = useCallback((templateId) => {
    if (user?.selected) {
      onChooseTemplate?.(templateId);
      console.log(`User ${user.selected.username} signed in. Sending template ID (Drive File ID): ${templateId} to backend.`);
    } else {
      setTemplateToUseId(templateId);
      setShowSignInModal(true);
      console.log("User not signed in. Showing sign-in prompt for template selection.");
    }
    setShowDetailModal(false); // Close the detail modal after action
  }, [user, onChooseTemplate]);

  const handleSignInNow = useCallback(() => {
    setShowSignInModal(false);
    navigate('/auth');
  }, [navigate]);

  const renderContent = (content) => (
    <div className={`carousel-container ${isDark ? 'dark-mode' : 'light-mode'} `}>
      {content}
    </div>
  );

  if (loading) {
    return renderContent(<SkeletonCarouselCard theme={theme} />);
  }

  if (error) {
    return renderContent(<p className="carousel-error-message">Failed to load templates: {error.message}</p>);
  }

  if (templates.length === 0) {
    return renderContent(<p className="carousel-no-templates-message">No resume templates found.</p>);
  }

  return (
    <div className={`carousel-container ${isDark ? 'dark-mode' : 'light-mode'}`}>
      {/* Navigation Buttons */}
      <button
        aria-label="Previous"
        onClick={handlePrev}
        className="carousel-nav-button carousel-nav-button--prev"
      >
        ❮
      </button>

      <div className="carousel-items-wrapper">
        {templates.map((template, index) => (
          <div
            key={template.id}
            className={`carousel-item ${getPositionClass(index)}`}
            style={{
              fontFamily: "'Inter', sans-serif",
              // Box shadow handled by CSS based on dark-mode class
            }}
          >
            <div className="carousel-item-inner">
              <img
                src={template.image || `https://placehold.co/300x400/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=No+Image`}
                alt={`Resume Template ${template.name || template.id}`}
                className="carousel-item-image"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x400/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=Image+Load+Error`; }}
              />

              {index === activeIndex && (
                <div className="carousel-item-overlay">
                  <h3 className="carousel-item-title">
                    {template.name || "Untitled Template"}
                  </h3>

                  <div className="carousel-item-buttons">
                    <button
                      onClick={() => handleViewDetailsAndUse(template)}
                      className="carousel-button carousel-button--use"
                      title="Choose Template"
                    >
                      <IconDownload className="carousel-button-icon" /> Use It
                    </button>
                    {template.previewUrl && (
                      <a
                        href={template.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="carousel-button carousel-button--preview"
                        title="Preview Template"
                      >
                        <IconEye className="carousel-button-icon" /> Preview
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        aria-label="Next"
        onClick={handleNext}
        className="carousel-nav-button carousel-nav-button--next"
      >
        ❯
      </button>

      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInClick={handleSignInNow}
        theme={theme}
        username={user?.selected?.username}
        email={user?.selected?.email}
      />

      {/* Resume Detail Modal */}
      <ResumeDetailModal
        className="z-30"
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        template={selectedTemplateDetails} // Pass the selected template details
        onUseTemplate={handleUseTemplateFromModal} // Pass the handler for "Choose This Template" from modal
        theme={theme}
      />
    </div>
  );
};

export default ResumeCarousel;