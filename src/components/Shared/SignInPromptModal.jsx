import React from "react";
import { motion, AnimatePresence } from "framer-motion";
// XCircleIcon is not used in the provided code, but kept for context if it was intended elsewhere
// import { XCircleIcon } from "@heroicons/react/24/solid"; 

const SignInPromptBanner = ({ isOpen, onClose, onSignInClick, theme }) => {
  const isDark = theme === "dark";

  // Animation variants for the background gradient
  const gradientVariants = {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 20, // Even slower for a more majestic, flowing feel
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle, darker overlay for a more pronounced separation */}
          <motion.div
            className="fixed inset-0 z-40 bg-black bg-opacity-40" // Darker, semi-transparent overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }} // Slightly longer transition for a smoother fade
            onClick={onClose}
          />

          <motion.div
            className={`fixed top-0 left-0 right-0 z-50 px-6 py-1 text-white shadow-2xl // Increased padding, more prominent shadow
              flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6 // Adjusted spacing and justification
              overflow-hidden
              ${isDark
                ? 'bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950' // Deeper, richer dark gradient
                : 'bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700' // More vibrant, unified light gradient
              }
              bg-[length:200%_auto]
            `}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 25 }} // Slightly more pronounced spring
            variants={gradientVariants}
            // Add a subtle border for definition, especially in light mode
            style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}
          >
            {/* Message with enhanced text styling */}
            <motion.p
              // Applying 'font-montserrat' for the main message.
              // It's a strong, modern sans-serif that works well for headlines and prominent calls to action.
              className="flex-grow text-xl text-center sm:text-left tracking-wide font-montserrat // Added font-montserrat
                          leading-snug" // Improved line height for readability
              initial={{ opacity: 0, x: -30 }} // Slightly more pronounced initial offset
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }} // Longer delay and duration for a more deliberate animation
              style={{ textShadow: '0 3px 6px rgba(0,0,0,0.4), 0 0 10px rgba(255,255,255,0.1)' }} // Enhanced text shadow for depth and subtle glow
            >
              ↗️<strong>Unlock Exclusive Features!</strong> Sign in to save progress & access more.
            </motion.p>

            {/* Google-looking Sign-in Button with improved styling */}
            <motion.button
              onClick={() => window.location.href = "/SignUp"} // Assuming you have a route set up for Google sign-in
              // Applying 'font-roboto' for the button text.
              // Roboto is a very clean and readable sans-serif, excellent for button labels.
              className={`px-3 py-0.5 rounded-full text-lg font-semibold flex items-center justify-center 
                transition-all duration-300 ease-in-out transform 
                bg-white text-gray-800 border border-gray-200 shadow-lg whitespace-nowrap 
                hover:bg-gray-100 active:bg-gray-200 
                focus:outline-none font-roboto // Added font-roboto
              `}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }} // More pronounced hover, added shadow
              whileTap={{ scale: 0.95 }} // More noticeable tap
            >
              {/* Google G icon SVG */}
              <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"> {/* Increased margin */}
                <path d="M44.5 20H24v8.5h11.8c-.7 4.3-3.2 8.7-8.3 11.7L31 43.5c4.7-4.4 7.6-10.8 7.6-17.5 0-1.5-.2-2.9-.5-4.3z" fill="#4285F4"/>
                <path d="M24 44.9c6.6 0 12.2-2.2 16.2-6L31 32.2c-2.3 1.7-5.2 2.7-8.3 2.7-6.4 0-11.8-4.3-13.8-10H3.3l-.1 3.5c2.4 4.8 6.5 8.7 11.6 11.2l9.2 6.5z" fill="#34A853"/>
                <path d="M10.2 28.5c-.5-1.7-.8-3.5-.8-5.5s.3-3.8.8-5.5L3.3 9.4c-2.4 4.8-2.4 10.3 0 15.1l6.9-5.9z" fill="#FBBC05"/>
                <path d="M24 7.1c3.5 0 6.6 1.2 9.1 3.4l6.5-6.5C35.9 3 30.3 0 24 0 17.3 0 11.7 2.2 7.8 6.3L15.6 12c2-6.4 7.4-10.9 13.8-10.9z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignInPromptBanner;