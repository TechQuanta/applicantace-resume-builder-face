// src/components/ResumeCards.jsx
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SignInPromptModal from "../Shared/SignInPromptModal";


// --- START: Inner Card Component ---
const Card = ({ title, description, buttonText, buttonColor, index, icon, iconBehavior, onActionClick, buttonLink, theme }) => {
  const isDark = theme === "dark";

  const handleButtonClick = () => {
    onActionClick(buttonLink);
  };

  return (
    <motion.div
      className={`card ${isDark ? 'dark-mode' : 'light-mode'}`}
      whileHover={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {/* Floating Number */}
      <motion.div
        className={`card-number ${isDark ? 'dark-mode' : 'light-mode'}`}
        initial={{ y: 120 }}
        whileHover={{ y: 120 }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.div>

      {/* Icon (Font Awesome classes assumed) */}
      <div className={`card-icon-wrapper ${isDark ? 'dark-mode' : 'light-mode'}`}>
        <i className={icon} ></i>
        {iconBehavior === "write" && (
          <motion.div
            className="card-icon-tooltip card-icon-tooltip--write "
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            Writing...
          </motion.div>
        )}
        {iconBehavior === "message" && (
          <motion.div
            className="card-icon-tooltip card-icon-tooltip--message"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            New message!
          </motion.div>
        )}
      </div>

      {/* Card Content */}
      <div className="card-content-area">
        <div className={`card-content ${isDark ? 'dark-mode' : 'light-mode'}`}>
          <h3 className={`card-title ${isDark ? 'dark-mode' : 'light-mode'}`}>{title}</h3>
          <p className={`card-description ${isDark ? 'dark-mode' : 'light-mode'}`}>{description}</p>
          <button
            onClick={handleButtonClick}
            // Use a more specific class for button color derived from prop
            className={`card-button card-button--${buttonColor.replace('bg-', '')}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// PropTypes for the Card component
Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonColor: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  iconBehavior: PropTypes.string,
  onActionClick: PropTypes.func.isRequired,
  buttonLink: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};
// --- END: Inner Card Component ---

const cardData = [
  {
    title: "Pick a resume template",
    description: "With a good resume template, you don't need to worry about details like formatting.",
    buttonText: "Get a professional template",
    buttonColor: "bg-blue-500", // Keep this identifier, CSS will map it
    icon: "fas fa-pencil-alt",
    iconBehavior: "write",
    buttonLink: "/resume-templates",
  },
    {
    title: "Attach a cover letter",
    description: "A resume will get you the job, but a cover letter will get your foot in the door.",
    buttonText: "Write a winning cover letter",
    buttonColor: "bg-pink-500",
    icon: "fas fa-file-alt",
    iconBehavior: "",
    buttonLink: "/Blog",
  },
  {
    title: "Expert Blogs",
    description: "Fill in your personal information and write about your work experience.",
    buttonText: "Learn how to write a resume",
    buttonColor: "bg-orange-500",
    icon: "fas fa-envelope-open",
    iconBehavior: "message",
    buttonLink: "/resume-examples",
  },
  
  {
    title: "Emphasize your skills",
    description: "Take skills from the job advertisement, then tie them into your resume.",
    buttonText: "Pick skills for your resume",
    buttonColor: "bg-green-500",
    icon: "fas fa-lightbulb",
    iconBehavior: "",
    buttonLink: "/Blog",
  },
];

export default function ResumeCards() {
  const navigate = useNavigate();

  // Simulate user session state (replace with actual auth context in a real app)
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingActionLink, setPendingActionLink] = useState(null);

  // Theme detection for proper dark mode styling
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

  // Simulate automatic sign-in after a delay for demonstration
  useEffect(() => {
    const demoSignInTimer = setTimeout(() => {
      setIsUserSignedIn(true); // User is "signed in" after 3 seconds
      console.log("Demo: User is now 'signed in'.");
    }, 3000);
    return () => clearTimeout(demoSignInTimer);
  }, []);

  // Handler for card button clicks, checks sign-in status
  const handleCardActionClick = useCallback((link) => {
    if (isUserSignedIn) {
      navigate(link);
      console.log(`User signed in. Navigating to: ${link}`);
    } else {
      setPendingActionLink(link);
      setShowSignInModal(true);
      console.log(`User not signed in. Prompting for sign-in for link: ${link}`);
    }
  }, [isUserSignedIn, navigate]);

  // Handler for successful sign-in from the modal
  const handleSignInSuccess = useCallback(() => {
    setIsUserSignedIn(true); // Update sign-in status
    setShowSignInModal(false); // Close the modal
    if (pendingActionLink) {
      navigate(pendingActionLink);
      setPendingActionLink(null); // Clear the pending link
      console.log(`Sign-in successful. Proceeding to: ${pendingActionLink}`);
    } else {
      console.log("Sign-in successful, but no pending action.");
    }
  }, [navigate, pendingActionLink]);

  return (
    <div className={`resume-cards-container ${isDark ? 'dark-mode' : 'light-mode'}`}>
      {/* Tailwind CSS CDN and Font Link (ideally in public/index.html or main entry) */}
      {/* IMPORTANT: These lines should be removed from here if you're managing CSS externally */}
      {/* <script src="https://cdn.tailwindcss.com"></script> */}
      {/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" /> */}

      {cardData.map((card, index) => (
        <Card
          key={index}
          {...card}
          index={index}
          onActionClick={handleCardActionClick}
          theme={theme}
        />
      ))}

      {/* Sign-in Prompt Modal */}
      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInClick={handleSignInSuccess}
        theme={theme}
      />
    </div>
  );
}