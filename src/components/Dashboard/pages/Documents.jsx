import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, UploadCloud, RefreshCw, HardDrive } from "lucide-react"; // Import HardDrive icon

import { userState } from "../../../services/authatom";
import { filesState, filesLoadingState, filesErrorState } from "../../../services/fileatom";
import Loading from "../../Shared/Loading";

import { formatBytes, formatDate } from "../../../utils/FileUtil";
import FileCard from "../components/Dashboard/FileCard";

// --- Lazy Loadable Components ---
const AlertDialog = lazy(() => import("../components/Dashboard/AlertDialog"));
const ConfirmDialog = lazy(() => import("../components/Dashboard/ConfirmDialog"));
const FileDetailsModal = lazy(() => import("../components/Dashboard/FileDetailsModal"));
const TemplateReplicateModal = lazy(() => import("../components/Dashboard/TemplateReplicateModal"));
const LocalFileUpload = lazy(() => import("../components/EditingComponents/components/Upload/LocalFileUpload"));

// --- Helper Functions (these are generic and can be moved to a `utils` folder) ---
// These will now be imported from utils/FileUtil.js
// const formatBytes = (bytes, decimals = 2) => { /* ... */ };
// const formatDate = (isoString) => { /* ... */ };


// --- Dashboard Component ---
export default function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [files, setFiles] = useRecoilState(filesState);
    const [loading, setLoading] = useRecoilState(filesLoadingState);
    const [error, setError] = useRecoilState(filesErrorState);

    const [userRecoilData, setUserRecoilData] = useRecoilState(userState);
    // Prefer `selected` if it exists, otherwise use the top-level userRecoilData
    const user = userRecoilData?.selected || userRecoilData;

    // --- Dialog/Modal States ---
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [alertDialogProps, setAlertDialogProps] = useState({ title: '', message: '', type: 'info' });

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogProps, setConfirmDialogProps] = useState({ title: '', message: '', onConfirm: () => { } });

    const [showFileDetailsModal, setShowFileDetailsModal] = useState(false);
    const [selectedFileForDetails, setSelectedFileForDetails] = useState(null);
    const [initialActionForDetailsModal, setInitialActionForDetailsModal] = useState(null); // State to control initial tab

    const [showTemplateReplicateModal, setShowTemplateReplicateModal] = useState(false);
    const [templateToReplicate, setTemplateToReplicate] = useState(null);

    const [showLocalFileUploadModal, setShowLocalFileUploadModal] = useState(false);

    const currentPage = parseInt(searchParams.get("page")) || 0;

    const filteredAndSearchedFiles = files.filter(file => {
        const lowerCaseFileName = file.fileName ? file.fileName.toLowerCase() : "";
        const matchesSearch = searchTerm ? lowerCaseFileName.includes(searchTerm.toLowerCase()) : true;

        switch (currentPage) {
            case 0: return matchesSearch; // All documents
            case 1: return matchesSearch && lowerCaseFileName.includes('resume');
            case 2: return matchesSearch && lowerCaseFileName.includes('cover letter');
            default: return matchesSearch;
        }
    });

    const tabs = [
        { label: "All documents", query: 0, count: `(${files.length})` },
        { label: "Resumes", query: 1, count: `(${files.filter(f => (f.fileName || "").toLowerCase().includes('resume')).length})` },
        { label: "Cover letters", query: 2, count: `(${files.filter(f => (f.fileName || "").toLowerCase().includes('cover letter')).length})` },
    ];

    // --- Refs for controlling fetch behavior ---
    const isFetchingRef = useRef(false);
    const hasFetchedInitialDataRef = useRef(false);
    const lastFetchHadNoFilesRef = useRef(false);

    // --- initiateFilesFetch: The ONLY core API calling function to get the list of files ---
    const initiateFilesFetch = useCallback(async (forceSpinner = false) => {
        const { email, driveFolderId, token, authProvider } = user || {};

        // --- DEBUGGING: Log user data and token presence ---
        
        if (!token) {
            console.error("initiateFilesFetch: Authentication token is missing or null. Cannot proceed with file fetch.");
        }
        // --- END DEBUGGING ---

        if (isFetchingRef.current) {
            return;
        }

        if (!email || !driveFolderId || !token) {
            if (error !== "User information or authentication token unavailable for file fetch.") {
                setFiles([]);
                setLoading(false);
                setError("User information or authentication token unavailable for file fetch.");
            }
            hasFetchedInitialDataRef.current = false;
            lastFetchHadNoFilesRef.current = true;
            return;
        }

        isFetchingRef.current = true;
        if (!hasFetchedInitialDataRef.current || forceSpinner || files.length === 0) {
            setLoading(true);
        }
        setError(null);
        lastFetchHadNoFilesRef.current = false;

        try {
            const endpoint = authProvider === 'WEBSITE' ? "https://api.techquanta.tech/ace/local/files" : "https://api.techquanta.tech/ace/drive/files";

            const response = await axios.post(endpoint, {
                userEmail: email,
                folderId: driveFolderId,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000
            });

            if (response.data.success) {
                setFiles(response.data.files);
                hasFetchedInitialDataRef.current = true;
                if (response.data.files.length === 0) {
                    lastFetchHadNoFilesRef.current = true;
                }

                if (response.data.currentStorageUsageMb !== undefined && response.data.maxStorageQuotaMb !== undefined) {
                    setUserRecoilData(prevUserData => ({
                        ...prevUserData,
                        selected: {
                            ...prevUserData.selected,
                            currentStorageUsageMb: response.data.currentStorageUsageMb,
                            maxStorageQuotaMb: response.data.maxStorageQuotaMb
                        }
                    }));
                }

            } else {
                setError(response.data.message || "Failed to retrieve files.");
                setFiles([]);
                hasFetchedInitialDataRef.current = false;
                lastFetchHadNoFilesRef.current = true;
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
                setError("File retrieval timed out. The server took too long to respond. Please refresh to try again.");
            } else {
                setError(err.response?.data?.message || "An unexpected network error occurred while fetching files.");
            }
            setFiles([]);
            hasFetchedInitialDataRef.current = false;
            lastFetchHadNoFilesRef.current = true;
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [user, setFiles, setLoading, setError, setUserRecoilData, files.length, error]);

    // --- useEffect for Initial Data Fetch on Component Mount / User Data Ready ---
    useEffect(() => {
        const { email, driveFolderId, token } = user || {};

        if (email && driveFolderId && token && !hasFetchedInitialDataRef.current) {
            initiateFilesFetch(true);
        } else if ((!email || !driveFolderId || !token) && files.length > 0) {
            // Clear files if user data becomes unavailable after files were loaded
            setFiles([]);
            setError("User information or authentication token unavailable. Please log in.");
            setLoading(false);
            hasFetchedInitialDataRef.current = false;
            lastFetchHadNoFilesRef.current = true;
        }
    }, [user?.email, user?.driveFolderId, user?.token, initiateFilesFetch, setFiles, setLoading, setError, files.length]);


    // --- handleFileNameClick: Opens the FileDetailsModal for a given file ---
    const handleFileNameClick = useCallback((file) => {
        setSelectedFileForDetails(file);
        setInitialActionForDetailsModal("rename"); // Default to rename tab when clicking file name
        setShowFileDetailsModal(true);
    }, []);

    // --- Handler for closing FileDetailsModal ---
    const handleCloseFileDetailsModal = useCallback(() => {
        setShowFileDetailsModal(false);
        setSelectedFileForDetails(null);
        setInitialActionForDetailsModal(null); // Crucial: Reset initial action when modal closes
    }, []);

    // --- Callback for FileDetailsModal to reset initial action after it closes ---
    const handleModalCloseAndResetInitialAction = useCallback(() => {
        setInitialActionForDetailsModal(null);
    }, []);

    // --- Handlers for actions that should re-fetch data ---
    const handleUploadSuccess = useCallback(() => {
        setShowLocalFileUploadModal(false);
        setAlertDialogProps({ title: "Upload Complete", message: "Your file has been successfully uploaded!", type: "success" });
        setShowAlertDialog(true);
        initiateFilesFetch(true); // Re-fetch all files after a successful upload
    }, [initiateFilesFetch, setAlertDialogProps, setShowAlertDialog]);

    const handleReplicateSuccess = useCallback(() => {
        setShowTemplateReplicateModal(false);
        setAlertDialogProps({ title: "Replication Complete", message: "Template replicated successfully!", type: "success" });
        setShowAlertDialog(true);
        initiateFilesFetch(true); // Re-fetch all files after a successful replication
    }, [initiateFilesFetch, setAlertDialogProps, setShowAlertDialog]);

    // This is a generic alert trigger used by FileDetailsModal to show alerts
    const onTriggerAlert = useCallback((type, title, message) => {
        setAlertDialogProps({ type, title, message });
        setShowAlertDialog(true);
    }, []);


    /**
     * Centralized handler for all file actions triggered from FileCard.
     * This function performs the API call and handles the UI consequences (alerts, state updates).
     * @param {string} action - The action to perform (e.g., 'download', 'delete', 'replicate').
     * @param {object} file - The full file object from FileCard.
     * @param {object} user - The user object.
     */
    const handleAction = useCallback(async (action, file, user) => {
        const { email, driveFolderId, token, authProvider } = user || {};

        // --- DEBUGGING: Log user data and token presence before action ---
        console.log(`handleAction (${action}): User data - Email:`, email, "Token exists:", !!token, "Auth Provider:", authProvider);
        if (!token) {
            console.error(`handleAction (${action}): Authentication token is missing or null. Cannot perform action.`);
        }
        // --- END DEBUGGING ---

        if (!email || !driveFolderId || !token) {
            setAlertDialogProps({ title: "Authentication Required", message: "Please log in to perform this action, or your token is missing.", type: "error" });
            setShowAlertDialog(true);
            return;
        }

        // Use the file object directly from FileCard
        const fileToActOn = file;
        const fileId = authProvider === 'GOOGLE' ? file.driveFileId : file.mongoFileId;
        const fileName = file.fileName;
        const webViewLink = file.webViewLink;


        try {
            const BASE_URL_FOR_ACTIONS = "https://api.techquanta.tech/ace/"; // Consolidated base URL
            const providerSegment = authProvider === 'WEBSITE' ? "local" : "drive";

            switch (action) {
                case "open":
                    if (authProvider === 'WEBSITE') {
                        setAlertDialogProps({ title: "Local File", message: "This file is stored locally and does not have a direct web view link.", type: "info" });
                        setShowAlertDialog(true);
                    } else if (webViewLink) {
                        window.open(webViewLink, '_blank');
                    } else {
                        setAlertDialogProps({ title: "No View Link", message: "This file does not have a direct web view link.", type: "info" });
                        setShowAlertDialog(true);
                    }
                    break;

                case "replicate":
                    setTemplateToReplicate(fileToActOn);
                    setShowTemplateReplicateModal(true);
                    break;

                case "permission":
                    if (authProvider === 'WEBSITE') {
                        setAlertDialogProps({ title: "Action Not Available", message: "Permission changes are not available for locally stored files.", type: "info" });
                        setShowAlertDialog(true);
                        return; // Prevent modal from opening
                    }
                    setSelectedFileForDetails(fileToActOn); // Ensure modal has the correct file
                    setInitialActionForDetailsModal("permission"); // Set the initial tab
                    setShowFileDetailsModal(true);
                    break;

                case "export":
                    if (authProvider === 'WEBSITE') {
                        setAlertDialogProps({ title: "Action Not Available", message: "Export functionality is not available for locally stored files in this manner.", type: "info" });
                        setShowAlertDialog(true);
                        return; // Prevent modal from opening
                    }
                    setSelectedFileForDetails(fileToActOn); // Ensure modal has the correct file
                    setInitialActionForDetailsModal("export"); // Set the initial tab
                    setShowFileDetailsModal(true);
                    break;

                case "download":
                    setLoading(true); // Start loading for direct download
                    const downloadResponse = await fetch(`${BASE_URL_FOR_ACTIONS}${providerSegment}/download/${fileId}?userEmail=${encodeURIComponent(email)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!downloadResponse.ok) {
                        const errorText = await downloadResponse.text();
                        throw new Error(`Failed to download: ${downloadResponse.status} - ${errorText}`);
                    }

                    const blob = await downloadResponse.blob();
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);

                    const contentDisposition = downloadResponse.headers.get('content-disposition');
                    let downloadedFileName = fileName;
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*?)['"]?$/i);
                        if (filenameMatch && filenameMatch[1]) {
                            downloadedFileName = decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
                        }
                    }
                    link.setAttribute('download', downloadedFileName);

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);

                    setAlertDialogProps({ title: "Download Initiated", message: `"${downloadedFileName}" download started.`, type: "success" });
                    setShowAlertDialog(true);
                    break;

                case "delete":
                    setConfirmDialogProps({
                        title: "Confirm Deletion",
                        message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
                        onConfirm: async () => {
                            setLoading(true); // Start loading for delete confirmation
                            try {
                                const response = await axios.delete(`${BASE_URL_FOR_ACTIONS}${providerSegment}/delete`, {
                                    data: {
                                        userEmail: email,
                                        fileId: fileId,
                                    },
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                });
                                if (response.data.success) {
                                    // Remove the file from the Recoil state directly for instant UI update
                                    setFiles(prevFiles => prevFiles.filter(f =>
                                        (authProvider === 'GOOGLE' && f.driveFileId !== fileId) ||
                                        (authProvider === 'WEBSITE' && f.mongoFileId !== fileId)
                                    ));
                                    setAlertDialogProps({ title: "Success", message: `${fileName} deleted successfully!`, type: "success" });
                                    setShowAlertDialog(true);
                                    // Update storage usage in Recoil user state if provided in response
                                    if (response.data.currentStorageUsageMb !== undefined && response.data.maxStorageQuotaMb !== undefined) {
                                        setUserRecoilData(prevUserData => ({
                                            ...prevUserData,
                                            selected: {
                                                ...prevUserData.selected,
                                                currentStorageUsageMb: response.data.currentStorageUsageMb,
                                                maxStorageQuotaMb: response.data.maxStorageQuotaMb
                                            }
                                        }));
                                    }
                                } else {
                                    setAlertDialogProps({ title: "Deletion Failed", message: response.data.message || "Failed to delete file.", type: "error" });
                                    setShowAlertDialog(true);
                                }
                            } catch (err) {
                                setAlertDialogProps({ title: "Error", message: err.response?.data?.message || `An error occurred while trying to delete ${fileName}.`, type: "error" });
                                setShowAlertDialog(true);
                            } finally {
                                setShowConfirmDialog(false); // Close the confirmation dialog
                                setLoading(false); // End loading for delete operation
                            }
                        }
                    });
                    setShowConfirmDialog(true);
                    break; // Important: Don't let delete fall through to general finally setLoading(false)
                default:
                    setAlertDialogProps({ title: "Unknown Action", message: "This action is not recognized.", type: "error" });
                    setShowAlertDialog(true);
            }
        } catch (err) {
            // Catch any errors from fetch/axios calls outside the specific action blocks
            setAlertDialogProps({ title: "Action Error", message: err.message || `An unexpected error occurred while trying to ${action} ${fileName}. Please try again.`, type: "error" });
            setShowAlertDialog(true);
        } finally {
            // Only set loading to false here if the action doesn't have its own loading management (e.g., modals)
            if (action !== "delete") { // Delete handles its own loading within onConfirm
                setLoading(false);
            }
        }
    }, [user, files, setFiles, setUserRecoilData, setAlertDialogProps, setShowAlertDialog, setConfirmDialogProps, setShowConfirmDialog, setSelectedFileForDetails, setShowFileDetailsModal, setInitialActionForDetailsModal, setTemplateToReplicate, setShowTemplateReplicateModal, setLoading]);


    // --- Callbacks for FileDetailsModal actions (to refresh Dashboard data or update state) ---
    const handleRenameSuccess = useCallback((fileId, newName, newWebViewLink) => {
        setFiles(prevFiles =>
            prevFiles.map(file =>
                (file.driveFileId === fileId || file.mongoFileId === fileId) ? { ...file, fileName: newName, webViewLink: newWebViewLink } : file
            )
        );
        // Also update the selectedFileForDetails so the modal's internal state is consistent
        setSelectedFileForDetails(prevDetails =>
            prevDetails && (prevDetails.driveFileId === fileId || prevDetails.mongoFileId === fileId) ? { ...prevDetails, fileName: newName, webViewLink: newWebViewLink } : prevDetails
        );
        setShowFileDetailsModal(false); // Close modal after successful rename
        // Alert is now handled by onTriggerAlert passed to FileDetailsModal
    }, [setFiles]);
    const [isHovered, setIsHovered] = useState(false); // State to track hover


    const handlePermissionUpdateSuccess = useCallback(() => {
        setShowFileDetailsModal(false); // Close modal after successful permission update
        // Alert is now handled by onTriggerAlert passed to FileDetailsModal
        // Re-fetch to ensure the latest permissions are reflected if needed (e.g., if UI shows shared status)
        initiateFilesFetch(false);
    }, [initiateFilesFetch]);

    const handleExportSuccess = useCallback((fileId, exportMimeType, exportedFileName) => {
        setShowFileDetailsModal(false); // Close modal after successful export
        // Alert is now handled by onTriggerAlert passed to FileDetailsModal
        // If an export creates a new file in the user's drive (e.g., converting Google Docs to PDF might save a copy),
        // consider re-fetching files. For direct downloads, it's not usually needed.
        if (exportMimeType.includes('google-apps')) { // This is an example condition
            initiateFilesFetch(false);
        }
    }, [initiateFilesFetch]);

    const handleAddNewDocumentClick = useCallback(() => {
        if (!user?.email || !user?.driveFolderId) {
            setAlertDialogProps({ title: "Authentication Required", message: "Please log in to upload documents.", type: "error" });
            setShowAlertDialog(true);
            return;
        }
        setShowLocalFileUploadModal(true);
    }, [user?.email, user?.driveFolderId, setAlertDialogProps, setShowAlertDialog]);

    const handleRefreshClick = useCallback(() => {
        initiateFilesFetch(true); // Always force spinner and re-fetch when refresh is clicked
    }, [initiateFilesFetch]);


    const renderSectionContent = () => {
        const baseGridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

        if (loading && (!hasFetchedInitialDataRef.current || isFetchingRef.current || files.length === 0)) {
            return (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-center min-h-[60vh] w-full"
                >
                    <Loading />
                </motion.div>
            );
        }

        if (error && files.length === 0) {
            return (
                <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] w-full text-red-600 dark:text-red-400 text-center px-4"
                >
                    <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
                    <p>{error}</p>
                    <button
                        onClick={handleRefreshClick}
                        className="mt-4 inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200 gap-2"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </motion.div>
            );
        }

        // Display initial empty state only if no files, no search term, on "All documents" tab, and initial fetch concluded with no files.
        if (files.length === 0 && searchTerm === '' && currentPage === 0 && hasFetchedInitialDataRef.current && lastFetchHadNoFilesRef.current) {
            return (
                <motion.div
                    key="no-files-initial"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center py-16 px-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800"
                >
                    <UploadCloud className="w-20 h-20 mx-auto mb-6 text-purple-500 dark:text-purple-400 animate-pulse" />
                    <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 mb-4">
                        Your Document Vault Awaits!
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                        Looks like your digital vault is currently empty. This is the perfect spot for all your important career documents.
                    </p>
                    <button
                        className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 ease-in-out gap-2"
                        onClick={handleAddNewDocumentClick}
                    >
                        <Plus size={20} />
                        Upload Your First Document
                    </button>
                    <button
                        onClick={handleRefreshClick}
                        className="mt-4 inline-flex items-center px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow hover:bg-gray-700 transition-colors duration-200 gap-2"
                    >
                        <RefreshCw size={18} /> Check for Documents
                    </button>
                </motion.div>
            );
        }

        // Display no results for search/filter if files exist but none match
        if (filteredAndSearchedFiles.length === 0 && (searchTerm !== '' || currentPage !== 0) && hasFetchedInitialDataRef.current) {
            return (
                <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center px-4"
                >
                    <div className="text-gray-600 dark:text-gray-400 mt-8">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl font-semibold mb-2">No documents found matching your criteria.</p>
                        <p>Try adjusting your search or selecting a different tab.</p>
                    </div>
                </motion.div>
            );
        }

        if (hasFetchedInitialDataRef.current && filteredAndSearchedFiles.length > 0) {
            return (
                <motion.div
                    key="files-present"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={baseGridClass}
                >
                    <AnimatePresence>
                        {filteredAndSearchedFiles.map((file) => (
                            <FileCard
                                key={file.mongoFileId || file.driveFileId}
                                file={file}
                                onFileActionTrigger={handleAction} // Renamed prop to match FileCard expectation
                                onFileNameClick={handleFileNameClick}
                                user={user} // Pass user object to FileCard
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            );
        }
        return null;
    };

    // Calculate storage usage percentage
    const currentStorageMb = user?.currentStorageUsageMb || 0;
    const maxStorageMb = user?.maxStorageQuotaMb || 0;
    const storagePercentage = maxStorageMb > 0 ? (currentStorageMb / maxStorageMb) * 100 : 0;

    return (
        <div className="h-full w-full pt-[80px] pb-3 text-gray-800 dark:text-gray-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6 ">
                <h1 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
                    Welcome back,{" "}
                    <span className="text-purple-600 dark:text-purple-400 font-pacifico">
                        {user?.username || user?.email?.split('@')[0] || "Guest"}
                    </span>
                    !
                </h1>

                <div className="relative flex items-center w-full sm:w-80">
                    <Search className="absolute left-3 text-gray-500 dark:text-gray-400" size={18} />
                    <input
                        type="search"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm"
                    />
                    <button
                        onClick={handleRefreshClick}
                        className="ml-2 p-2 rounded-md text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        aria-label="Refresh documents"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>
              <div className="mb-8 flex justify-start">
            <motion.button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleAddNewDocumentClick}
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300 ease-in-out gap-2 h-10 px-2.5 overflow-hidden" // Added h-10, px-2.5 (initial padding) and overflow-hidden
                // Framer Motion 'animate' for width expansion
                animate={{
                    width: isHovered ? "200px" : "40px", // Adjust these pixel values as needed
                    paddingRight: isHovered ? "16px" : "10px" // Adjust padding for text reveal
                }}
                transition={{
                    type: "spring",
                    stiffness: 250, // Slightly higher stiffness for a snappier feel
                    damping: 20,
                    duration: 0.3,
                    ease: "easeOut"
                }}
                whileTap={{ scale: 0.95 }}
                // Removed whileHover as 'animate' will handle the scaling implicitly through width
            >
                {/* Plus Icon - always visible */}
                <Plus size={24} />

                {/* Animated Label - appears to the right of the icon */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }} // Start slightly left and transparent
                            animate={{ opacity: 1, x: 0 }}   // Fade in and slide to position
                            exit={{ opacity: 0, x: -10 }}    // Fade out and slide back left
                            transition={{
                                duration: 0.2, // Quick fade and slide
                                ease: "easeOut"
                            }}
                            className="whitespace-nowrap text-base font-medium" // Ensure text stays on one line
                        >
                            Add New Document
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
             {showLocalFileUploadModal && (
                        <LocalFileUpload
                            user={user}
                            onClose={() => setShowLocalFileUploadModal(false)}
                            onUploadSuccess={handleUploadSuccess}
                            // Assuming maxStorageQuotaMb and currentStorageUsageMb are available in the user object
                            maxStorageMb={user?.maxStorageQuotaMb}
                            currentStorageUsageMb={user?.currentStorageUsageMb}
                        />
                    )}

            {/* Tabs for filtering documents */}
            <nav className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                    {tabs.map((tab) => (
                        <li key={tab.query} className="me-2" role="presentation">
                            <button
                                className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors duration-200
                                    ${currentPage === tab.query
                                        ? "text-purple-600 border-purple-600 dark:text-purple-400 dark:border-purple-400"
                                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-400 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500"
                                    }`}
                                id={`tab-${tab.query}`}
                                type="button"
                                role="tab"
                                aria-controls={`panel-${tab.query}`}
                                aria-selected={currentPage === tab.query}
                                onClick={() => setSearchParams({ page: tab.query })}
                            >
                                {tab.label} <span className="text-xs font-normal opacity-80">{tab.count}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Storage Usage Display */}
            {user?.authProvider === 'WEBSITE' && (
                <div className="mb-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner flex items-center gap-4">
                    <HardDrive size={24} className="text-purple-500 dark:text-purple-400" />
                    <div className="flex-grow">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Storage Used: {formatBytes(currentStorageMb * 1024 * 1024)} / {formatBytes(maxStorageMb * 1024 * 1024)}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: `${storagePercentage}%` }}
                                aria-valuenow={storagePercentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                    </div>
                </div>
            )}


            <AnimatePresence mode="wait">
                {renderSectionContent()}
            </AnimatePresence>

            {/* Modals and Dialogs */}
            <Suspense fallback={<Loading />}>
                <AnimatePresence>
                    {showAlertDialog && (
                        <AlertDialog
                            {...alertDialogProps}
                            onClose={() => setShowAlertDialog(false)}
                        />
                    )}
                    {showConfirmDialog && (
                        <ConfirmDialog
                            {...confirmDialogProps}
                            onClose={() => setShowConfirmDialog(false)}
                        />
                    )}
                    {showFileDetailsModal && selectedFileForDetails && (
                        <FileDetailsModal
                            isOpen={showFileDetailsModal}
                            file={selectedFileForDetails}
                            user={user} // Pass the full user object
                            onClose={handleCloseFileDetailsModal}
                            initialAction={initialActionForDetailsModal}
                            onRenameSuccess={handleRenameSuccess}
                            onPermissionUpdateSuccess={handlePermissionUpdateSuccess}
                            onExportSuccess={handleExportSuccess}
                            onModalCloseAndResetInitialAction={handleModalCloseAndResetInitialAction} // New prop
                            onTriggerAlert={onTriggerAlert} // Pass the alert trigger
                        />
                    )}
                    {showTemplateReplicateModal && templateToReplicate && (
                        <TemplateReplicateModal
                            template={templateToReplicate}
                            user={user}
                            onClose={() => setShowTemplateReplicateModal(false)}
                            onSuccess={handleReplicateSuccess}
                        />
                    )}
                </AnimatePresence>
            </Suspense>
        </div>
    );
}