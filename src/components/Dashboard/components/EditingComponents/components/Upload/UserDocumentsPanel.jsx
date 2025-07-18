// src/components/Dashboard/components/EditingComponents/components/Upload/UserDocumentsPanel.jsx

import React, { useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { filesState, filesLoadingState, filesErrorState, selectedFileState } from '../../../../../../services/fileatom';
import { userState } from '../../../../../../services/authatom';
import { useUserSession } from '../../../../../../hooks/useUserSession';

import { motion, AnimatePresence } from 'framer-motion';

// --- FontAwesome Imports ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFilePdf, faFileWord, faFileAlt, faSpinner,
    faExclamationCircle, faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';

const UserDocumentsPanel = ({ onConfirmDeleteDocument }) => {
    const { user } = useUserSession();
    const currentUser = useRecoilValue(userState);

    const allFiles = useRecoilValue(filesState);
    const loading = useRecoilValue(filesLoadingState);
    const error = useRecoilValue(filesErrorState);
    const setSelectedFile = useSetRecoilState(selectedFileState);

    const effectiveUser = currentUser?.selected || user?.selected;

    // The logic to filter out APPLICANTACE files remains, as requested in previous interactions.
    const userFiles = useMemo(() => {
        return allFiles.filter(file => file.provider !== 'APPLICANTACE');
    }, [allFiles]);

    // The getFileIcon function remains the same, as it only handles icon display and not file selection logic.
    const getFileIcon = (name) => {
        if (name.toLowerCase().endsWith('.pdf')) {
            return faFilePdf;
        } else if (name.toLowerCase().endsWith('.doc') || name.toLowerCase().endsWith('.docx')) {
            return faFileWord;
        }
        return faFileAlt;
    };

    // The handleFileClick function is simplified to only select the file.
    // The file type check and the popup logic have been removed.
    const handleFileClick = (file) => {
        setSelectedFile(file);
    };

    if (!effectiveUser?.email) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center p-4">
                <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" className="mb-4 text-blue-500" />
                <p className="text-lg font-semibold">Sign In to See Your Documents!</p>
                <p className="text-sm mt-2">
                    Log in to access and manage your uploaded resumes and cover letters.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4" />
                <p>Loading your documents...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-600 dark:text-red-400 text-center px-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Please try refreshing the main dashboard page.</p>
            </div>
        );
    }

    if (userFiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
                <FontAwesomeIcon icon={faFileAlt} size="3x" className="mb-4" />
                <p className="text-lg font-semibold">No documents uploaded yet!</p>
                <p className="text-sm text-center mt-2">
                    Your uploaded files will appear here. Start by using the "Upload Document" feature.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 relative"
        >
            {/* The popup message and its associated AnimatePresence component have been removed. */}

            <AnimatePresence>
                {userFiles.map((file) => (
                    <motion.div
                        key={file.id || file.driveFileId || file.mongoFileId}
                        className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700
                                 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex flex-col cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleFileClick(file)}
                    >
                        <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-zinc-700 flex items-center justify-center rounded-lg overflow-hidden">
                            {file.thumbnailLink ? (
                                <img
                                    src={file.thumbnailLink}
                                    alt={file.fileName}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x550/${'E0E0E0'}/${'000000'}?text=Error`; }}
                                />
                            ) : (
                                <FontAwesomeIcon icon={getFileIcon(file.fileName)} className="text-blue-400 dark:text-blue-300 text-6xl" />
                            )}
                        </div>
                        {/* Removed the file name and other details section entirely */}
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserDocumentsPanel;