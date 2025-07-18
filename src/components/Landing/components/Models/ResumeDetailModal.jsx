import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserSession } from "../../../../hooks/useUserSession"; // Adjust path as necessary
import { replicateTemplate } from "../../../../utils/apiconfig"; // Import the API function
import SignInPromptBanner from '../../../Shared/SignInPromptModal'; // Import the SignInPromptBanner component

const ResumeDetailModal = ({ isOpen, onClose, template, theme, onReplicationSuccess }) => {
  if (!isOpen || !template) return null;

  const navigate = useNavigate();
  const isDark = theme === "dark";
  const { user, isLoading: userSessionLoading, handleTokenInvalidation } = useUserSession();

  const [replicationStatus, setReplicationStatus] = useState({
    loading: false,
    error: null,
    success: false,
    replicatedFileLink: null,
    replicatedFileId: null,
    replicatedFileName: null,
    mimeType: null,
  });

  const [showSignInBanner, setShowSignInBanner] = useState(false);

  // Determine if the user is logged in based on essential session data
  const isLoggedIn = !!user?.selected?.email && !!user?.selected?.driveFolderId && !!user?.selected?.token;

  useEffect(() => {
    if (isOpen && template) {
      // Reset replication status when modal opens for a new template or reopens
      setReplicationStatus({
        loading: false,
        error: null,
        success: false,
        replicatedFileLink: null,
        replicatedFileId: null,
        replicatedFileName: null,
        mimeType: null,
      });
      setShowSignInBanner(false);
    }
  }, [isOpen, template]);

  const handleReplicateAndNavigate = async () => {
    setReplicationStatus(prev => ({ ...prev, loading: true, error: null, success: false }));

    if (userSessionLoading) {
      setReplicationStatus(prev => ({ ...prev, error: "Loading user session. Please wait." }));
      return;
    }

    const currentUserEmail = user?.selected?.email;
    const username = user?.selected?.username; // Used for navigation path
    const userDriveFolderId = user?.selected?.driveFolderId;

    // Frontend validation for core data needed for the API call
    if (!currentUserEmail || !userDriveFolderId) {
      let specificError = "";
      if (!currentUserEmail) {
        specificError = "User email missing. Please sign in again.";
      } else if (!userDriveFolderId) {
        specificError = "Your Google Drive is not connected. Please connect it in your profile settings.";
      } else {
        specificError = "User data is incomplete. Please try signing in again.";
      }
      setReplicationStatus(prev => ({ ...prev, error: specificError, loading: false }));
      setShowSignInBanner(true); // Show sign-in banner if essential user data is missing
      return;
    }

    // Automatically determine newFileName based on template name
    const autoNewFileName = template.name ? `${template.name} - My Copy` : 'My New Document';

    // Ensure template.size is available and valid for fileSize
    if (template.size === undefined || template.size === null) {
      setReplicationStatus(prev => ({ ...prev, error: "Template file size is missing. Cannot replicate.", loading: false }));
      return;
    }

    // --- Assembling the CORRECT Request Body for a user's replicated file ---
    const requestBody = {
      email: currentUserEmail,
      userId: currentUserEmail, // Using email as userId for consistency if no dedicated ID
      sourceFileId: template.id, // This is the Google Drive ID of the source template file
      destinationFolderId: userDriveFolderId, // User's designated Drive folder ID
      newFileName: autoNewFileName, // Using the automatically generated file name
      fileSize: template.size, // ⭐ Sending file size from the template here ⭐

      // ⭐ CRITICAL: When a user replicates a template to create their own document,
      // this is NOT creating a new *template* in the system.
      // Therefore, `isTemplate` must be `false`.
      isTemplate: false, // <--- THIS IS THE KEY CHANGE for user file replication

      // These template-specific fields are irrelevant for a user's *copy*,
      // but the backend handler expects them, so send them as null/empty.
      // The backend will set them to null based on `isTemplate: false`.
      templateName: null,
      templateCategory: null,
      templateDescription: null,
      templateTags: [],
      templateVisibility: 'private', // User's own file is always private to them
      templateImageUrl: null,
      templateSpotlight: null,
      templateProvider: null,
      originalTemplateDriveId: template.id, // Store the Drive ID of the template it was copied from
    };

    try {
      const data = await replicateTemplate(requestBody);

      const replicatedDriveFile = data.driveFile; // Contains Google Drive details of the new file
      const savedUserFile = data.savedUserFile; // Contains MongoDB document details (including _id)

      setReplicationStatus({
        loading: false,
        error: null,
        success: true,
        replicatedFileId: replicatedDriveFile.driveFileId,
        replicatedFileName: replicatedDriveFile.filename,
        replicatedFileLink: replicatedDriveFile.webViewLink,
        mimeType: replicatedDriveFile.mimeType,
      });

      // Prepare the new file object for onReplicationSuccess callback
      const newReplicatedFile = {
        id: replicatedDriveFile.driveFileId,
        fileName: replicatedDriveFile.filename,
        mimeType: replicatedDriveFile.mimeType,
        webContentLink: replicatedDriveFile.webContentLink,
        webViewLink: replicatedDriveFile.webViewLink, // Often useful for direct links
        size: replicatedDriveFile.size, // This will now come from the backend, which received it from frontend (template.size)
        createdTime: replicatedDriveFile.uploadedAt, // Use the ISO string from backend
        modifiedTime: replicatedDriveFile.lastModified, // Use the ISO string from backend
        provider: 'APPLICANTACE', // This might need to be dynamic or configured based on your platform
        shared: false, // Assuming it's not shared by default
        // Include other relevant fields from savedUserFile if needed for the UI
        mongoId: savedUserFile._id,
        isTemplate: savedUserFile.isTemplate, // Should be false
        originalTemplateDriveId: savedUserFile.originalTemplateDriveId,
      };

      if (onReplicationSuccess) {
        onReplicationSuccess(newReplicatedFile);
      }

      // Navigate after a slight delay for better UX
      setTimeout(() => {
        navigate(`/${username}/dashboard/edit-resume`, {
          state: {
            replicatedFileId: replicatedDriveFile.driveFileId,
            replicatedFileName: replicatedDriveFile.filename,
            // Pass other necessary data to the edit page if needed
            mimeType: replicatedDriveFile.mimeType,
            webViewLink: replicatedDriveFile.webViewLink,
          }
        });
        onClose(); // Close the modal after navigation
      }, 1500);

    } catch (err) {
      console.error("Error during template replication:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to replicate template. Please try again.";
      const statusCode = err.response?.status || err.statusCode;

      if (statusCode === 401 || statusCode === 403) {
        handleTokenInvalidation(currentUserEmail);
        setShowSignInBanner(true);
        setReplicationStatus(prev => ({
          ...prev,
          loading: false,
          error: "Your session has expired or is invalid. Please sign in again.",
          success: false,
        }));
      } else {
        setReplicationStatus(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));
      }
    } finally {
      // Ensure loading is false after attempt
      setReplicationStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSignInBannerClick = () => {
    setShowSignInBanner(false);
    navigate("/SignUp"); // Assuming this is your sign-up/login route
  };

  const modalBgClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const buttonFocusRing = isDark ? 'focus:ring-red-400' : 'focus:ring-red-500';
  const imageCardBgBorder = isDark ? 'bg-gray-700 border-2 border-blue-400/50' : 'bg-gray-50 border-2 border-blue-400';
  const categoryTagColors = isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700';
  const descriptionTextColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const spotlightTextColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <AnimatePresence>
      {isOpen && template && (
        <motion.div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-40 p-4 sm:p-6 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <SignInPromptBanner
            isOpen={!userSessionLoading && showSignInBanner && !isLoggedIn}
            onClose={() => setShowSignInBanner(false)}
            onSignInClick={handleSignInBannerClick}
            theme={theme}
          />
          <motion.div
            className={`relative ${modalBgClass} rounded-2xl shadow-3xl p-6 md:p-10 w-full max-w-6xl max-h-[95vh] overflow-y-auto transform scale-95
            ${isDark ? 'shadow-dark-bottom-lg' : 'shadow-bottom-lg'} `}
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400
                  text-4xl leading-none font-light p-2 rounded-full transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonFocusRing} font-quicksand`}
              aria-label="Close template detail view"
              disabled={replicationStatus.loading}
            >
              &times;
            </button>

            {/* Main Content Layout */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-stretch">
              {/* Left Column: Template Image Card */}
              <div className={`w-full md:w-1/2 flex justify-center items-center flex-shrink-0 p-4 rounded-2xl shadow-2xl ${imageCardBgBorder}`}>
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
                  <img
                    src={template.image || `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=No+Image+Available`}
                    alt={`Preview of ${template.name}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=Image+Load+Error`;
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Template Details and "Choose" Button */}
              <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-between h-full">
                <div>
                  {/* Template Name/Title */}
                  <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 py-2 leading-tight ${isDark ? 'text-white' : 'text-gray-900'} font-raleway`}>
                    {template.name || "Untitled Template"}
                  </h2>

                  {/* Template Category Tag */}
                  <span className={`text-md font-semibold px-4 py-1.5 rounded-full mb-6 inline-block ${categoryTagColors} font-lato`}>
                    {template.category || "General"}
                  </span>

                  {/* Template Description */}
                  <p className={`text-lg sm:text-xl mb-6 leading-relaxed ${descriptionTextColor} font-open-sans`}>
                    {template.description || "No detailed description available for this template."}
                  </p>

                  {/* Template Spotlights (if available) */}
                  {template.spotlights && (
                    <p className={`text-md italic mb-8 ${spotlightTextColor} font-roboto`}>
                      <span className="font-bold">Key Features:</span> {template.spotlights}
                    </p>
                  )}

                  {/* Replication Status Messages */}
                  {userSessionLoading ? (
                    <p className={`text-blue-500 dark:text-blue-300 text-center text-lg font-semibold my-2 font-lato`}>
                      Loading user session...
                    </p>
                  ) : replicationStatus.error ? (
                    <p className="text-red-600 dark:text-red-400 text-center text-lg font-semibold my-2 font-lato">{replicationStatus.error}</p>
                  ) : replicationStatus.success && (
                    <p className="text-green-600 dark:text-green-400 text-center text-lg font-semibold my-2 font-lato">
                      Template replicated successfully! Redirecting...
                    </p>
                  )}
                </div>

                {/* "Choose This Template" Button */}
                <button
                  onClick={handleReplicateAndNavigate}
                  className={`w-full md:w-auto md:self-end mt-6 md:mt-auto px-10 py-4 rounded-xl text-lg font-bold shadow-xl
                      bg-gradient-to-r from-blue-600 to-blue-800 text-white
                      hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 active:scale-95
                      transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75
                      flex items-center justify-center space-x-2
                      ${replicationStatus.loading || replicationStatus.success || userSessionLoading || !isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}
                      font-quicksand`}
                  disabled={replicationStatus.loading || replicationStatus.success || userSessionLoading || !isLoggedIn}
                >
                  {userSessionLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">Loading Session...</span>
                    </>
                  ) : replicationStatus.loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">Creating Document...</span>
                    </>
                  ) : replicationStatus.success ? (
                    'Document Created!'
                  ) : (
                    isLoggedIn ? 'Choose This Template' : 'Sign in to Choose Template'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResumeDetailModal;