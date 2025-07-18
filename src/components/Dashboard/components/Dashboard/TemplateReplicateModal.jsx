import React, { useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import AlertDialog from "./AlertDialog";

/**
 * A modal component for replicating a master template file into a user's folder.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to be called when the modal is closed.
 * @param {string} props.userEmail - The email of the currently logged-in user.
 * @param {string} props.masterTemplateFileId - The Google Drive ID of the template file to be replicated.
 * @param {function} props.onReplicateSuccess - Callback for when the template is successfully replicated.
 * @returns {JSX.Element} The TemplateReplicateModal component.
 */
const TemplateReplicateModal = ({
  isOpen,
  onClose,
  userEmail,
  masterTemplateFileId,
  onReplicateSuccess,
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [isReplicating, setIsReplicating] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });

  // Effect to reset input when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setNewFileName("");
    }
  }, [isOpen]);

  /**
   * Handles the template replication submission.
   */
  const handleReplicate = async () => {
    if (!newFileName.trim()) {
      setAlert({
        isOpen: true,
        title: "Input Required",
        message: "Please enter a name for the new document.",
      });
      return;
    }
    if (!userEmail || !masterTemplateFileId) {
      setAlert({
        isOpen: true,
        title: "Error",
        message: "Missing user or template information. Please try again.",
      });
      return;
    }

    setIsReplicating(true);
    try {
      const response = await axios.post(
        "http://localhost:8081/ace/drive/replicate-template",
        {
          userEmail: userEmail,
          masterTemplateFileId: masterTemplateFileId,
          newFileName: newFileName.trim(),
        }
      );

      if (response.data.success) {
        setAlert({
          isOpen: true,
          title: "Success",
          message: `Template replicated as "${newFileName.trim()}" successfully!`,
        });
        onReplicateSuccess(response.data);
        onClose(); // Close modal on successful replication
      } else {
        setAlert({
          isOpen: true,
          title: "Replication Failed",
          message: response.data.message || "Failed to replicate template.",
        });
      }
    } catch (err) {
      setAlert({
        isOpen: true,
        title: "Error",
        message:
          err.response?.data?.message ||
          "An unexpected error occurred during replication.",
      });
    } finally {
      setIsReplicating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Replicate Template">
      <div className="mb-6 text-gray-700 dark:text-gray-300 text-base">
        <p className="mb-3">
          Provide a descriptive name for your new document, which will be
          created from the template.
        </p>
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="e.g., My Project Brief"
          className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          aria-label="New document name"
        />
      </div>
      <button
        onClick={handleReplicate}
        disabled={isReplicating || !newFileName.trim()}
        className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${
            isReplicating || !newFileName.trim()
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          }`}
      >
        {isReplicating ? "Replicating..." : "Replicate Document"}
      </button>
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
      />
    </Modal>
  );
};

export default TemplateReplicateModal;