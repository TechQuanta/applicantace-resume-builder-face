// src/InvalidLinkPage.jsx

import React from "react";
import { motion } from "framer-motion";

const InvalidLinkPage = () => {
  return (
    <div
      // Full viewport centering for content
      className="flex flex-col items-center justify-center min-h-screen w-screen bg-transparent text-gray-900 dark:text-white p-4 font-poppins"
    >
      {/* Animated container for the main error content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-transparent rounded-lg  p-6 sm:p-10 text-center max-w-lg w-full flex flex-col items-center"
      >
        {/* Error Image - replace '/images/error-404.png' with your actual image path */}
        <motion.img
          src="/pagenotfound.webp" // <--- IMPORTANT: Replace with the actual path to your downloaded image
          alt="Error or Page Not Found"
          className="w-48 h-48 sm:w-64 sm:h-64 mb-6 object-contain"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 150 }}
        />

        {/* Main Heading for the error */}
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 font-playfair-display text-red-600 dark:text-red-400">
          Page Not Found.
        </h2>

        {/* Specific message for invalid/expired link / general wrong URL */}
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-2 font-lato">
          It looks like you've hit a URL that doesn't exist, or perhaps the link
          you used is invalid or has expired.
        </p>

        {/* Optional: Add a simple message for redirection if there's no button */}
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-poppins mt-4">
          Please check the URL or try navigating from the main site.
        </p>
      </motion.div>
    </div>
  );
};

export default InvalidLinkPage;