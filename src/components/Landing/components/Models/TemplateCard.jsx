// src/components/templatecard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const TemplateCard = ({ image, onClick, theme }) => {
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Adjusted placeholder to be taller, reflecting a resume aspect ratio (approx A4/US Letter)
  // Ensure the placeholder itself is long to accurately represent the space
  const defaultImageUrl = `https://placehold.co/400x600/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=Resume+Preview`;

  const handleImageLoad = () => {
    setLoading(false);
    setImageError(false); // Reset error state on successful load
  };

  const handleImageError = (e) => {
    console.error("TemplateCard image failed to load:", e.target.src);
    e.target.onerror = null; // Prevent infinite loop if default image also fails
    e.target.src = defaultImageUrl; // Fallback to a placeholder
    setImageError(true); // Indicate that there was an image loading error
    setLoading(false); // Stop loading animation even if error occurs
  };

  return (
    <motion.div
      onClick={onClick}
      // REMOVED 'rounded-xl' from this line
      className={`relative  shadow-lg border group
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer
        w-full h-full flex-shrink-0 flex-grow-0`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Loading overlay for initial image load */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 z-10">
            <div className="text-white text-lg font-semibold">Loading...</div>
          </div>
        )}

        {/* The image itself */}
        <img
          src={image || defaultImageUrl}
          alt="Resume Template Preview"
          className=" w-full h-full  transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Error message or placeholder if image fails to load */}
        {imageError && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-70 text-white text-center p-2 text-sm z-10">
            <p>Image failed to load. Using placeholder.</p>
          </div>
        )}

        {/* Hover Overlay */}
        {!loading && !imageError && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-lg font-semibold">Preview</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TemplateCard;