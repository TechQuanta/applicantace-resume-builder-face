// src/components/Upload/OneDriveFilePicker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaMicrosoft, FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';
import { fetchOneDriveDocuments, downloadOneDriveFileBlob, uploadBlobToBackend } from '../../../../../../utils/apiconfig'; // NEW: Import service functions

// IMPORTANT: Replace with your actual backend endpoint for OneDrive-sourced file uploads
const YOUR_ONEDRIVE_UPLOAD_ENDPOINT = process.env.REACT_APP_ONEDRIVE_UPLOAD_API || 'http://localhost:8081/ace/upload-onedrive-file';

// IMPORTANT: You need a valid Microsoft Access Token for this to work.
// This is a placeholder. In a real app, this would come from your Microsoft authentication flow.
// Consider getting this from useUserSession or a dedicated auth context/hook.
const MOCK_MICROSOFT_ACCESS_TOKEN = "YOUR_MICROSOFT_GRAPH_ACCESS_TOKEN_HERE"; // <<< REPLACE THIS!

const OneDriveFilePicker = () => {
    // In a real application, you'd get this from your auth system (e.g., useUserSession, an AuthContext)
    // For now, we'll keep the mock token for demonstration.
    const microsoftAccessToken = MOCK_MICROSOFT_ACCESS_TOKEN;

    const [oneDriveFiles, setOneDriveFiles] = useState([]);
    const [selectedOneDriveFile, setSelectedOneDriveFile] = useState(null);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // Changed to boolean for clarity
    const [uploadProgress, setUploadProgress] = useState(0);
    const [theme, setTheme] = useState("light");
    const [uploadMessage, setUploadMessage] = useState(null); // To show success message
    const [uploadError, setUploadError] = useState(null); // To show specific upload errors

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => setTheme(e.matches ? "dark" : "light");
        setTheme(prefersDark.matches ? "dark" : "light");
        prefersDark.addEventListener("change", handler);
        return () => prefersDark.removeEventListener("change", handler);
    }, []);

    const isDark = theme === "dark";

    // --- Fetch OneDrive Files ---
    const fetchFiles = useCallback(async () => { // Renamed for clarity
        setFetchError(null); // Clear previous errors
        setUploadMessage(null); // Clear messages
        setUploadError(null); // Clear upload errors

        // Add a check for the actual token value here as well, if it's still the placeholder
        if (microsoftAccessToken === MOCK_MICROSOFT_ACCESS_TOKEN) {
            setFetchError("Microsoft Access Token is a placeholder. Please configure it for OneDrive features.");
            setOneDriveFiles([]);
            return;
        }

        setIsLoadingFiles(true);
        try {
            // NEW: Use the service function to fetch files
            const files = await fetchOneDriveDocuments(microsoftAccessToken);
            setOneDriveFiles(files);
            if (files.length === 0) {
                setFetchError("No supported document files (.pdf, .doc, .docx, .txt) found in your OneDrive root.");
            }
        } catch (err) {
            console.error("Error fetching OneDrive files:", err);
            setFetchError(`Error fetching OneDrive files: ${err.message}`);
        } finally {
            setIsLoadingFiles(false);
        }
    }, [microsoftAccessToken]);

    // --- Handle Upload to Backend ---
    const handleUploadOneDriveFileToBackend = useCallback(async () => {
        if (!selectedOneDriveFile || !selectedOneDriveFile['@microsoft.graph.downloadUrl']) {
            setUploadError("No OneDrive file selected or download URL is missing.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadMessage(null); // Clear previous messages
        setUploadError(null); // Clear previous errors

        try {
            // NEW: Use the service function to download the file blob
            const fileBlob = await downloadOneDriveFileBlob(
                selectedOneDriveFile['@microsoft.graph.downloadUrl'],
                microsoftAccessToken
            );

            // NEW: Use the service function to upload the blob to your backend
            const backendResponse = await uploadBlobToBackend(
                fileBlob,
                selectedOneDriveFile.name,
                selectedOneDriveFile.id,
                YOUR_ONEDRIVE_UPLOAD_ENDPOINT,
                setUploadProgress // Pass the setUploadProgress callback
            );

            if (backendResponse.success) { // Assuming your backend returns a 'success' field
                setUploadMessage(`File "${selectedOneDriveFile.name}" uploaded successfully to backend!`);
                setSelectedOneDriveFile(null);
                setOneDriveFiles([]); // Optionally clear file list after successful upload
                setFetchError(null); // Clear any previous fetch errors
                // If you have a useUserSession or similar to update storage quota, call it here:
                // updateStorage(backendResponse.currentStorageUsageMb, backendResponse.maxStorageQuotaMb);
            } else {
                // If backend responds with success: false or an error message in body
                setUploadError(backendResponse.message || 'Backend upload failed with an unknown error.');
            }

        } catch (error) {
            console.error('Error during OneDrive file upload to backend:', error);
            setUploadError(error.message || 'An unexpected error occurred during upload.');
        } finally {
            setIsUploading(false);
            // Optionally clear progress after a short delay
            setTimeout(() => setUploadProgress(0), 1000);
        }
    }, [selectedOneDriveFile, microsoftAccessToken, YOUR_ONEDRIVE_UPLOAD_ENDPOINT]);


    return (
        <div
            className={`flex-grow p-4 sm:p-6 flex flex-col items-center justify-between rounded-xl border shadow-lg transition-all duration-300 text-center
             ${isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-green-50 text-gray-900 border-green-200'}
            `}
            style={{
                borderRadius: "1rem",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Consistent shadow
            }}
        >
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 flex flex-col items-center
                ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <FaMicrosoft className="text-4xl mb-2" />
                Upload from OneDrive
            </h2>

            {microsoftAccessToken === MOCK_MICROSOFT_ACCESS_TOKEN && (
                <p className="text-red-500 mb-3 text-center text-xs dark:text-red-400">
                    WARNING: Microsoft Access Token is a placeholder. OneDrive features will not work without a valid token.
                </p>
            )}

            {/* Main button to connect to OneDrive */}
            <button
                onClick={fetchFiles}
                className={`w-full py-4 px-6 rounded-full text-base sm:text-lg font-semibold flex items-center justify-center cursor-pointer
                    text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    bg-gradient-to-r from-blue-600 via-green-500 to-red-500 // Microsoft brand colors
                    hover:from-blue-700 hover:via-green-600 hover:to-red-600
                    transform hover:scale-105 active:scale-95 transition-all duration-300`}
                disabled={isLoadingFiles || isUploading}
            >
                {isLoadingFiles ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                    </>
                ) : (
                    <>
                        <FaMicrosoft className="mr-3 text-2xl group-hover:animate-bounce-y" /> {/* Added bounce-y animation */}
                        Connect to OneDrive
                    </>
                )}
            </button>

            {fetchError && (
                <p className="text-red-500 mt-4 text-center dark:text-red-400">{fetchError}</p>
            )}
             {uploadError && (
                <p className="text-red-500 mt-4 text-center dark:text-red-400">{uploadError}</p>
            )}
            {uploadMessage && (
                <p className="text-green-600 mt-4 text-center dark:text-green-400">{uploadMessage}</p>
            )}

            {/* Display selected file and upload button only if files are loaded and a file is selected */}
            {oneDriveFiles.length > 0 && !fetchError && !isLoadingFiles && (
                <>
                    <h3 className={`text-base font-semibold mt-6 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select a file from your OneDrive:</h3>
                    <div className={`w-full max-h-40 overflow-y-auto border rounded-md p-2 mb-3 text-left
                        ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                        <ul className="list-none p-0 m-0">
                            {oneDriveFiles.map(file => (
                                <li
                                    key={file.id}
                                    className={`cursor-pointer p-2 rounded-md flex items-center text-sm
                                        ${selectedOneDriveFile?.id === file.id
                                            ? (isDark ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-800')
                                            : (isDark ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800')
                                        } transition-colors duration-150`}
                                    onClick={() => {
                                        setSelectedOneDriveFile(file);
                                        setUploadProgress(0); // Reset progress on new selection
                                        setUploadMessage(null); // Clear messages on new selection
                                        setUploadError(null); // Clear errors on new selection
                                    }}
                                >
                                    <FaFileAlt className={`inline mr-2 text-xs ${isDark ? 'text-blue-300' : 'text-blue-500'}`} /> {file.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {selectedOneDriveFile && (
                        <div className={`w-full p-3 rounded-md flex flex-col gap-2 items-center
                            ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Selected: <strong>{selectedOneDriveFile.name}</strong> ({selectedOneDriveFile.size ? Math.round(selectedOneDriveFile.size / 1024) + ' KB' : 'Size unknown'})
                            </span>
                            <button
                                onClick={handleUploadOneDriveFileToBackend}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed
                                    bg-green-600 hover:bg-green-700 text-white`}
                                disabled={isUploading || !selectedOneDriveFile['@microsoft.graph.downloadUrl']}
                            >
                                {isUploading ? (
                                    <>
                                        <FaCloudUploadAlt className="mr-2 animate-pulse" />
                                        Uploading {Math.round(uploadProgress)}%
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt className="mr-2" /> Upload to Backend
                                    </>
                                )}
                            </button>
                            {isUploading && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
                                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OneDriveFilePicker;