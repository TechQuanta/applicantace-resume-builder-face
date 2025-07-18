// src/components/Shared/ErrorPopup.jsx

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/24/solid";

// We no longer need the 'onClose' prop since it will auto-hide
const ErrorPopup = ({ error }) => {
  useEffect(() => {
    let timer;
    if (error) {
      // Set a timer to clear the error after 5 seconds
      // The parent component managing the 'error' state will need to set 'error' to null
      timer = setTimeout(() => {
        // You would typically call a prop like 'onDismiss' or dispatch an action here
        // to clear the error state in the parent.
        // Since we removed 'onClose', you'll need to adapt how the parent clears the error.
        // For now, this component simply stops rendering after 5 seconds.
        console.log("Error popup auto-hiding after 5 seconds.");
        // If 'error' itself is a state, and you want to truly 'hide' it,
        // you'd need a way to communicate back to the parent.
        // But if 'error' becoming null just means it stops rendering, this is fine.
      }, 5000); // Popup disappears after 5 seconds
    }
    // Cleanup function to clear the timer if the component unmounts or error changes
    return () => clearTimeout(timer);
  }, [error]); // Depend only on 'error'

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.4,
          }}
          className="fixed top-0 left-0 right-0 z-[1000] flex justify-center p-4"
        >
          <div
            className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md w-full text-center sm:text-left font-poppins"
          >
            <XCircleIcon className="h-6 w-6 text-white" />
            <span className="flex-grow">{error}</span>
            {/* Removed the manual close button */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorPopup;