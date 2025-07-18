import React from "react";
import Modal from "./Modal"; // Import the base Modal component

/**
 * A confirmation dialog component that prompts the user to confirm an action.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback function to be called when the dialog is cancelled or confirmed.
 * @param {function} props.onConfirm - Callback function to be called when the user confirms the action.
 * @param {string} props.title - The title of the confirmation dialog.
 * @param {string} props.message - The message content requesting confirmation.
 * @returns {JSX.Element} The ConfirmDialog component.
 */
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-gray-700 dark:text-gray-300 mb-7 text-lg leading-relaxed font-body"> {/* Applied font-body here */}
      {message}
    </p>
    <div className="flex justify-end gap-4">
      <button
        onClick={onClose}
        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-label font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50" // Applied font-label
      >
        Cancel
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className="px-6 py-2 bg-red-600 text-white rounded-lg font-label font-semibold hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" // Applied font-label
      >
        Confirm
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;