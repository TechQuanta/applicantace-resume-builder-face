import React from "react";
import Modal from "./Modal"; // Import the base Modal component

/**
 * A simple alert dialog component for displaying messages to the user.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback function to be called when the dialog is closed.
 * @param {string} props.title - The title of the alert dialog.
 * @param {string} props.message - The message content of the alert dialog.
 * @returns {JSX.Element} The AlertDialog component.
 */
const AlertDialog = ({ isOpen, onClose, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-gray-700 dark:text-gray-300 mb-7 text-lg leading-relaxed font-body"> {/* Applied font-body here */}
      {message}
    </p>
    <button
      onClick={onClose}
      className="w-full bg-purple-600 text-white font-label font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50" // Applied font-label
    >
      OK
    </button>
  </Modal>
);

export default AlertDialog;