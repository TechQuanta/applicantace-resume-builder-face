import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for exit animations
import {
  FaEnvelopeOpenText, // Ensure FaEnvelopeOpenText is imported
  FaTimes, // For close button icon
} from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA component

import SignInPromptModal from "../../../Shared/SignInPromptModal";
import { useUserSession } from "../../../../hooks/useUserSession";

// Define gradient colors for the background hover effect
const gradientColors = [
  "#0070F3", "#00E6A7", "#9B00F3", "#FF00A6", "#FF4500",
];

// NavLink Subcomponent - Applied `font-lato` for readability
const NavLink = ({ link, label, onLinkClick }) => (
  <li className="flex items-center space-x-2 relative group font-lato"> {/* Applied font here */}
    <button
      onClick={() => onLinkClick(link)} // Pass the specific link
      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer text-left"
    >
      {label}
    </button>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
  </li>
);

NavLink.propTypes = {
  link: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

// Popup Modal Component - Applied `font-quicksand` for a friendly, clear message
const StatusPopup = ({ isOpen, message, type, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, type === 'success' ? 3000 : 5000); // Auto-close after 3 seconds for success, 5 for error
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  if (!isOpen) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const textColor = 'text-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`relative ${bgColor} ${textColor} p-6 rounded-lg shadow-xl max-w-sm w-full text-center font-quicksand`}
      >
        <p className="text-lg font-semibold">{message}</p>
      </motion.div>
    </motion.div>
  );
};

StatusPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  onClose: PropTypes.func.isRequired,
};

// Main Footer Component
const Footer = () => {
  const navigate = useNavigate();
  const { user } = useUserSession();
  const isUserLoggedIn = !!user.selected;

  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gradientIndex, setGradientIndex] = useState(0);

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingActionPath, setPendingActionPath] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // States for your custom newsletter form
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("idle"); // 'idle', 'submitting', 'success', 'error'
  const [popupState, setPopupState] = useState({ isOpen: false, message: '', type: '' });

  // Ref for the ReCAPTCHA component
  const recaptchaRef = useRef(null);

  const MAILERLITE_FORM_ACTION_URL = import.meta.env.VITE_APP_MAILERLITE_FORM_ACTION_URL || "https://assets.mailerlite.com/jsonp/1631401/forms/158646466674427328/subscribe";
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY || "6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD"; // Your reCAPTCHA Site Key (public)

  // Theme detection useEffect
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDarkMode(e.matches);
    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);

  // Effect to cycle through gradient colors
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prev) => (prev + 1) % gradientColors.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Handler for mouse movement
  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - left, y: e.clientY - top });
  };

  // Central handler for all NavLink clicks
  const handleNavLinkClick = useCallback((link) => {
    if (isUserLoggedIn) {
      const username = user.selected.username || "user";
      let targetPath;

      // Determine the target path based on the clicked link
      if (link === "/create-cvs") {
        targetPath = `/${username}/dashboard/edit-resume`;
      } else if (link === "/one-click-document") {
        targetPath = `/${username}/dashboard/edit-resume`; // Assuming this also goes to edit-resume
      } else if (link === "/job-listings") {
        targetPath = `/${username}/dashboard/opennings`;
      } else if (link === "/compare-templates") {
        targetPath = `/${username}/dashboard/compare-templates`;
      } else if (link === "/create-resume") {
        targetPath = `/${username}/dashboard/edit-resume`; // Direct to edit-resume as it's about creating
      } else if (link === "/github-ref-docs") {
        targetPath = `/${username}/dashboard`; // Or a specific docs page if you have one
      } else {
        // Fallback for any other link that might not have a specific dashboard route
        targetPath = `/${username}/dashboard`;
      }
      navigate(targetPath);
    } else {
      setPendingActionPath(link); // Store the specific link that was clicked
      setShowSignInModal(true);
    }
  }, [isUserLoggedIn, navigate, user.selected]);

  // Handler for successful sign-in from the modal
  const handleSignInSuccess = useCallback(() => {
    setShowSignInModal(false);

    if (user.selected && pendingActionPath) {
      const loggedInUsername = user.selected.username || "default-user";
      let targetPath;

      // Use the stored pendingActionPath to determine where to redirect
      if (pendingActionPath === "/create-cvs") {
        targetPath = `/${loggedInUsername}/dashboard/edit-resume`;
      } else if (pendingActionPath === "/one-click-document") {
        targetPath = `/${loggedInUsername}/dashboard/edit-resume`;
      } else if (pendingActionPath === "/job-listings") {
        targetPath = `/${loggedInUsername}/dashboard/opennings`;
      } else if (pendingActionPath === "/compare-templates") {
        targetPath = `/${loggedInUsername}/dashboard/compare-templates`;
      } else if (pendingActionPath === "/create-resume") {
        targetPath = `/${loggedInUsername}/dashboard/edit-resume`;
      } else if (pendingActionPath === "/github-ref-docs") {
        targetPath = `/${loggedInUsername}/dashboard`;
      } else {
        // Fallback if pendingActionPath doesn't match a specific rule
        targetPath = `/${loggedInUsername}/dashboard`;
      }

      navigate(targetPath);
      setPendingActionPath(null); // Clear the pending action
    } else if (pendingActionPath) {
      navigate("/dashboard"); // Fallback to generic dashboard
      setPendingActionPath(null);
    }
  }, [navigate, user.selected, pendingActionPath]);

  // NEW: Handle newsletter subscription directly to MailerLite's form action URL
  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setPopupState({ isOpen: true, message: "Please enter a valid email address.", type: "error" });
      setSubscribeStatus("error");
      return;
    }

    // Get reCAPTCHA value
    const recaptchaValue = recaptchaRef.current ? recaptchaRef.current.getValue() : null;
    if (!recaptchaValue) {
      setPopupState({ isOpen: true, message: "Please complete the reCAPTCHA verification.", type: "error" });
      setSubscribeStatus("error");
      return;
    }

    // Check if MailerLite Form Action URL is configured
    if (!MAILERLITE_FORM_ACTION_URL) {
      setPopupState({ isOpen: true, message: "MailerLite Form Action URL is not configured. Please ensure VITE_APP_MAILERLITE_FORM_ACTION_URL is set in your .env file and restart the server.", type: "error" });
      setSubscribeStatus("error");
      return;
    }

    setSubscribeStatus("submitting");
    setPopupState({ isOpen: true, message: "Subscribing...", type: "success" }); // Temporary message while submitting

    try {
      // Construct the JSONP-like URL for MailerLite form submission
      const mailerliteUrl = new URL(MAILERLITE_FORM_ACTION_URL);
      mailerliteUrl.searchParams.append('fields[email]', email);
      mailerliteUrl.searchParams.append('g-recaptcha-response', recaptchaValue);
      mailerliteUrl.searchParams.append('ajax', '1'); // Indicate it's an AJAX request

      // For direct client-side submission like this, we use 'no-cors' mode.
      // This sends the request but prevents us from reading the response body or status.
      // We assume success if the request is sent without a network error.
      await fetch(mailerliteUrl.toString(), {
        method: 'GET', // MailerLite form submissions often use GET for JSONP
        mode: 'no-cors', // Critical for cross-origin requests without server-side proxy
      });

      setSubscribeStatus("success");
      setPopupState({ isOpen: true, message: "Welcome to Our Community 🎉!", type: "success" });
      setEmail(""); // Clear the input on success
      if (recaptchaRef.current) {
        recaptchaRef.current.reset(); // Reset reCAPTCHA after successful submission
      }
    } catch (error) {
      setSubscribeStatus("error");
      setPopupState({ isOpen: true, message: "Failed to subscribe. Please check your network connection.", type: "error" });
    }
  };


  return (
    <footer
      className="relative w-full py-10 px-6 sm:px-10 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Footer Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left relative z-10">
        {/* Logo and Motto Section */}
        <div className="text-center sm:text-left">
          <a href="/" className="inline-block mb-4">
            <img
              src={isDarkMode ? "/darklogo.png" : "/lightlogo.png"}
              alt="ApplicantAce"
              className="w-28 mx-auto sm:mx-0 transition-all duration-300 hover:scale-105 drop-shadow-xl"
            />
          </a>
          <p className="text-sm font-lora italic"> {/* Applied font-lora */}
            "Empowering careers, simplifying job applications."
          </p>
        </div>

        {/* Quick Links Section */}
        <div>
          <h4 className="text-lg font-montserrat font-bold uppercase tracking-widest mb-4 pb-2"> {/* Applied font-montserrat */}
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            {/* Changed link props to unique identifiers */}
            <NavLink link="/create-cvs" label="Create CV's" onLinkClick={handleNavLinkClick} />
            <NavLink link="/one-click-document" label="One Click Document" onLinkClick={handleNavLinkClick} />
            <NavLink link="/job-listings" label="Community Opportunities" onLinkClick={handleNavLinkClick} />
          </ul>
        </div>

        {/* Company Info Section */}
        <div>
          <h4 className="text-lg font-montserrat font-bold uppercase tracking-widest mb-4 pb-2"> {/* Applied font-montserrat */}
            Company
          </h4>
          <ul className="space-y-3 text-sm">
            {/* Changed link props to unique identifiers */}
            <NavLink link="/compare-templates" label="Compare & Choose" onLinkClick={handleNavLinkClick} />
            <NavLink link="/create-resume" label="Create Resume" onLinkClick={handleNavLinkClick} />
            <NavLink link="/github-ref-docs" label="Github Ref Docs" onLinkClick={handleNavLinkClick} />
          </ul>
        </div>

        {/* Newsletter and Social Links Section */}
        <div>
          <h4 className="text-lg font-prompt font-semibold mb-3">Stay Connected</h4> {/* Applied font-prompt */}
          <p className="text-sm mb-3 font-open-sans">Get career insights & job updates.</p> {/* Applied font-open-sans */}

          {/* Your custom Email Subscription Input with React State and direct API call */}
          <div className="flex w-full items-center bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 w-full text-sm bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto" // Applied font-roboto
              disabled={subscribeStatus === 'submitting'}
            />
            <button
              onClick={handleSubscribe} // Call the new subscribe handler
              className="px-4 sm:px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-bebas-neue" // Applied font-bebas-neue
              disabled={subscribeStatus === 'submitting'}
            >
              {subscribeStatus === 'submitting' ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FaEnvelopeOpenText /> // Using the imported icon here
              )}
            </button>
          </div>
          {/* ReCAPTCHA component added here */}
          {RECAPTCHA_SITE_KEY && (
            <div className="mt-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                // Optional: Add onChange handler if you need to react to reCAPTCHA completion
                // onChange={(token) => console.log("reCAPTCHA token:", token)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Divider Line */}
      <hr className="my-4 border-gray-300 dark:border-gray-600" />

      {/* Footer Bottom Section (Copyright and Credits) */}
      <div className="text-center sm:flex sm:justify-between sm:items-center text-sm space-y-2 sm:space-y-0 mb-[-20px] relative z-10">
        <p className="text-gray-600 dark:text-gray-400 font-arimo"> {/* Applied font-arimo */}
          © {new Date().getFullYear()} ApplicantAce. All rights reserved.
        </p>
        <p className="flex justify-center sm:justify-start items-center gap-1 font-nunito"> {/* Applied font-nunito */}
          Made by
          <span className="font-semibold"> Applicant <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-pulse">ACE</span></span>
          Team
        </p>
      </div>

      {/* Dynamic Gradient Hover Effect */}
      {hovered && (
        <motion.div
          className="absolute w-[45vw] h-[50vh] blur-[120px] opacity-20 z-0 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            background: `linear-gradient(45deg, ${gradientColors[gradientIndex]}, ${gradientColors[(gradientIndex + 1) % gradientColors.length]})`,
          }}
          animate={{ x: mousePos.x - 200, y: mousePos.y - 200 }}
          transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
        />
      )}

      {/* Sign-in Prompt Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
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

      {/* Subscription Status Popup */}
      <AnimatePresence>
        {popupState.isOpen && (
          <StatusPopup
            isOpen={popupState.isOpen}
            message={popupState.message}
            type={popupState.type}
            onClose={() => setPopupState({ isOpen: false, message: '', type: '' })}
          />
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;