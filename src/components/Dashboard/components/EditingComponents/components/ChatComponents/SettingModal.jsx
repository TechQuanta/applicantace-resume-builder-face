import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 backdrop-blur-sm" // ADDED backdrop-blur-sm
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <motion.div
            className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-xl w-full max-w-md relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h3 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white font-montserrat">Settings</h3>
            {children}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              aria-label="Close settings"
            >
              &times;
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;