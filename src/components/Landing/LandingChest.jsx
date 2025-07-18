// src/pages/Home/FloatingImages.jsx (or wherever it's located)
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AtsScoreChecker from "./components/AtsScoreChecker";
import SignInPromptModal from "../../components/Shared/SignInPromptModal";
import { useUserSession } from "../../hooks/useUserSession"; // Correct import and usage
import GRAPHICS1 from "../../assets/main/graphics1.png";
import GRAPHICS2 from "../../assets/main/graphics2.png";
import GRAPHICS3 from "../../assets/main/graphics3.png";


const images = [
  "https://assets.visme.co/templates/banners/thumbnails/i_Sleek-Financial-Consultant-Bio_full.jpg",
  GRAPHICS1,
  GRAPHICS2,
  GRAPHICS3,
];

const texts = [
  ["ATS Friendly", "Get Selected", "Stand Out", "Professional"],
  ["Easy to Use", "Modern Design", "Customizable", "Fast"],
  ["Secure", "Reliable", "Efficient", "User-Friendly"],
  ["Innovative", "Creative", "Unique", "Effective"],
  ["Comprehensive", "Detailed", "Thorough", "Accurate"]
];

const getRandomDirection = () => {
  const directions = [
    { x: [-200, 0, 150], y: 150 },
    { x: [200, 0, -150], y: -150 },
    { x: [-100, 0, 200], y: 100 },
    { x: [150, 0, -100], y: -100 },
    { x: [-120, 0, 180], y: 80 }
  ];
  return directions[Math.floor(Math.random() * directions.length)];
};

const textVariants = (index) => {
  const dir = getRandomDirection();
  return {
    initial: {
      opacity: 0,
      x: dir.x[0] + index * 8,
      y: dir.y + index * 4,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      x: dir.x[1] + index * 8,
      y: dir.y + index * 4,
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: dir.x[2] + index * 8,
      y: dir.y + index * 4,
      scale: 0.8,
      rotate: 360,
    },
  };
};

const FloatingImages = () => {
  const navigate = useNavigate();
  const { user, login } = useUserSession();
  const isUserLoggedIn = !!user.selected;

  const [showATSModal, setShowATSModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingActionPath, setPendingActionPath] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Effect for dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Effect for image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handler for "Get Your Resume" button click
  const handleGetYourResumeClick = useCallback(() => {
    if (isUserLoggedIn) {
      const username = user.selected.username;
      if (username) {
        navigate(`/${username}/dashboard/edit-resume`);
        console.log(`User logged in. Navigating to: /${username}/dashboard/edit-resume`);
      } else {
        console.warn("User is logged in but username is missing. Navigating to generic dashboard.");
        navigate("/dashboard/edit-resume");
      }
    } else {
      setPendingActionPath("/dashboard/edit-resume");
      setShowSignInModal(true);
      console.log("User not logged in. Showing sign-in prompt for resume access.");
    }
  }, [isUserLoggedIn, navigate, user.selected]);

  // Handler for successful sign-in from the modal
  const handleSignInSuccess = useCallback(() => {
    setShowSignInModal(false);
    console.log("Sign-in process initiated. Replace this with your actual authentication logic.");
    console.log("Once signed in, your 'useUserSession.login()' function should be called with REAL user data.");
    console.log("Then, navigation to the pending path will occur.");

    // This part is crucial: if a successful login has happened and updated user.selected,
    // the application state will reflect that. The navigation below *assumes*
    // that your actual login process (triggered by the modal) would have updated `user.selected`.
    if (user.selected && pendingActionPath) {
      const loggedInUsername = user.selected.username || "default-user";
      navigate(`/${loggedInUsername}${pendingActionPath}`);
      setPendingActionPath(null);
    } else if (pendingActionPath) {
      console.warn("Pending action exists, but user.selected not immediately available for navigation. Navigation will attempt to use a default or assume state update is pending.");
      navigate("/dashboard/edit-resume");
      setPendingActionPath(null);
    }
  }, [navigate, login, user.selected, pendingActionPath]);

  return (
    <div className={`floating-images-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Glowing Background */}
      <motion.div
        className="glowing-background"
        animate={{
          background: isDarkMode
            ? [
                "radial-gradient(circle at 30% 30%, #0f172a, #1e293b, #334155)",
                "radial-gradient(circle at 70% 70%, #1e293b, #0f172a, #475569)"
              ]
            : [
                "radial-gradient(circle at 30% 30%, #00ffd5, rgb(255, 0, 157), #7700ff)",
                "radial-gradient(circle at 70% 70%, #00ffc3, #0055ff, #ff00aa)"
              ]
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Main Content */}
      <div className="main-content-wrapper">
        {/* Left Section */}
        <div className="left-content">
          <h1 className="main-heading">
            <span className="gradient-text-pink-purple-indigo">
              ApplicantAce
            </span>{" "}
            Resume Builder
          </h1>
          <h2 className="sub-heading">
            Get Hired at{" "}
            <span className="gradient-text-blue-cyan">
              Top Companies
            </span>
          </h2>
          <p className="description-text">
            Build your perfect resume in minutes with powerful features that help you stand out.
          </p>

          {/* Buttons */}
          <div className="button-group">
            <button
              onClick={handleGetYourResumeClick}
              className="main-button primary-button"
            >
              🚀 Get Your Resume
            </button>
            <button
              onClick={() => setShowATSModal(true)}
              className="main-button secondary-button"
            >
              📊 Get Your Resume Score
            </button>
          </div>

          {/* ATS Score Checker Modal */}
          {showATSModal && <AtsScoreChecker onClose={() => setShowATSModal(false)} />}
        </div>

        {/* Right Section - Floating Images and Texts */}
        <div className="right-content">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="image-animation-container"
          >
            <motion.img
              src={images[currentImage]}
              alt="Floating Resume"
              className="floating-image"
              animate={{ y: [0, -12, 0], rotate: [0, 1, -1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.03, rotate: 1 }}
            />
            {texts[currentImage].map((text, index) => (
              <motion.div
                key={index}
                className="floating-text-bubble"
                style={{
                  top: `${30 + index * 12}%`,
                  left: index % 2 === 0 ? "5%" : "auto",
                  right: index % 2 !== 0 ? "5%" : "auto",
                }}
                variants={textVariants(index)}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.3
                }}
              >
                {text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Sign-in Prompt Modal */}
      {showSignInModal && (
        <div className="modal-backdrop">
          <SignInPromptModal
            isOpen={true}
            onClose={() => {
              setShowSignInModal(false);
              setPendingActionPath(null);
            }}
            onSignInClick={handleSignInSuccess}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </div>
      )}
    </div>
  );
};

export default FloatingImages;