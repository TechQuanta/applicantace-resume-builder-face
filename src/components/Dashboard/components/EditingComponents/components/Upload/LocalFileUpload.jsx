import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlusCircle, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { useUserSession } from '../../../../../../hooks/useUserSession';
import { uploadFileToDrive } from '../../../../../../utils/apiconfig';

// --- FileDetailsModal Component ---
const FileDetailsModal = ({
    isOpen,
    onClose,
    onUploadInitiate,
    selectedFile,
    isUploading,
    uploadProgress,
    theme,
    uploadMessage,
    uploadError
}) => {
    const fontPrimary = "font-poppins";
    const fontSecondary = "font-montserrat";

    const isDark = theme === "dark";

    const successIconColor = 'text-green-500';
    const errorIconColor = 'text-red-500';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center
                            ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                            transition-colors duration-300 transform border border-transparent`}
                    >
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                            aria-label="Close"
                            disabled={isUploading}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaTimesCircle />
                        </motion.button>


                        {selectedFile && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className={`mb-6 text-base text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}
                                    ${fontSecondary} leading-relaxed`}
                            >
                                <strong className="break-words text-indigo-500 dark:text-indigo-400 font-semibold">{selectedFile.name}</strong> (<span className="text-sm italic">{formatBytes(selectedFile.size)}</span>)
                            </motion.p>
                        )}

                        {/* Status Messages */}
                        <AnimatePresence mode="wait">
                            {uploadMessage && (
                                <motion.div
                                    key="success-message"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg mb-4 w-full text-center font-semibold text-base
                                        ${isDark ? 'bg-green-700/30 text-green-300' : 'bg-green-100 text-green-800'}
                                        ${fontSecondary} shadow-md`}
                                >
                                    <FaCheckCircle className={`inline mr-2 text-2xl ${successIconColor}`} /> {uploadMessage}
                                </motion.div>
                            )}
                            {uploadError && (
                                <motion.div
                                    key="error-message"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg mb-4 w-full text-center font-semibold text-base
                                        ${isDark ? 'bg-red-700/30 text-red-300' : 'bg-red-100 text-red-800'}
                                        ${fontSecondary} shadow-md animate-shake-slight`}
                                >
                                    <FaExclamationTriangle className={`inline mr-2 text-2xl ${errorIconColor}`} /> {uploadError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!uploadMessage && !uploadError && (
                            <motion.button
                                onClick={onUploadInitiate}
                                className={`w-full py-3 px-6 rounded-lg text-lg font-bold flex items-center justify-center transition disabled:opacity-60 disabled:cursor-not-allowed
                                    bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg
                                    hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75
                                    transform hover:scale-102 active:scale-98 duration-200 ease-in-out
                                    ${fontPrimary} tracking-wide`}
                                disabled={isUploading}
                                whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(99, 102, 241, 0.6)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isUploading ? (
                                    <motion.div
                                        className="flex items-center"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <FaSpinner className="mr-2 text-xl" />
                                    </motion.div>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt className="mr-2 text-xl" /> Start Upload
                                    </>
                                )}
                            </motion.button>
                        )}

                        {isUploading && (
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                ></motion.div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const LocalFileUpload = () => {
    const { user, updateStorage } = useUserSession();
    const [localFile, setLocalFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [theme, setTheme] = useState("light");
    const [showModal, setShowModal] = useState(false);
    const [uploadMessage, setUploadMessage] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [isCardLoading, setIsCardLoading] = useState(false); // New state for initial card loader

    const userId = user?.selected?.email;
    const folderId = user?.selected?.driveFolderId;
    const userEmail = user?.selected?.email;
    const currentStorageUsageMb = user?.selected?.currentStorageUsageMb;
    const maxStorageQuotaMb = user?.selected?.maxStorageQuotaMb;

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => setTheme(e.matches ? "dark" : "light");
        setTheme(prefersDark.matches ? "dark" : "light");
        prefersDark.addEventListener("change", handler);
        return () => prefersDark.removeEventListener("change", handler);
    }, []);

    const handleActualFileUpload = useCallback(async (file) => {
        if (!file) {
            setUploadError("No file selected for upload.");
            setIsUploading(false);
            setIsCardLoading(false);
            return;
        }

        if (!userEmail) {
            setUploadError("User email is missing. Please log in again.");
            setIsUploading(false);
            setIsCardLoading(false);
            return;
        }
        if (!userId || !folderId) {
            setUploadError("User authentication data (ID or Drive folder) is missing. Please log in again.");
            setIsUploading(false);
            setIsCardLoading(false);
            return;
        }

        const QUOTA_THRESHOLD_PERCENTAGE = 98;

        if (maxStorageQuotaMb && currentStorageUsageMb !== undefined) {
            const maxQuotaBytes = maxStorageQuotaMb * 1024 * 1024;
            const currentUsageBytes = currentStorageUsageMb * 1024 * 1024;
            const uploadFileSize = file.size;
            const quotaThresholdBytes = maxQuotaBytes * (QUOTA_THRESHOLD_PERCENTAGE / 100.0);

            if ((currentUsageBytes + uploadFileSize) > quotaThresholdBytes) {
                const remainingSpaceBeforeThreshold = Math.max(0, quotaThresholdBytes - currentUsageBytes);
                let errorMessage = `Upload aborted: Adding "${file.name}" (${formatBytes(uploadFileSize)}) would exceed your ${QUOTA_THRESHOLD_PERCENTAGE}% storage threshold.`;
                if (remainingSpaceBeforeThreshold > 0) {
                    errorMessage += ` You can upload approximately ${formatBytes(remainingSpaceBeforeThreshold)} more before hitting this limit.`;
                } else {
                    errorMessage += ` You are already at or above your ${QUOTA_THRESHOLD_PERCENTAGE}% storage limit. Please delete some files or consider upgrading your plan.`;
                }
                setUploadError(errorMessage);
                setIsUploading(false);
                setIsCardLoading(false);
                return;
            }
        } else {
            setUploadError("Storage quota information is not fully available. Upload might be blocked by backend.");
            setIsUploading(false);
            setIsCardLoading(false);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadMessage(null);
        setUploadError(null);
        setIsCardLoading(false);

        try {
            const responseData = await uploadFileToDrive(
                file,
                userEmail,
                userId,
                folderId,
                setUploadProgress
            );

            if (responseData.success) {
                setUploadMessage(`File uploaded: ${responseData.fileName}.`);
                updateStorage(responseData.currentStorageUsageMb, responseData.maxStorageQuotaMb);
                setLocalFile(null);
            } else {
                setUploadError(responseData.message || 'File upload failed with an unknown error.');
            }
        } catch (err) {
            setUploadError(err.message || "An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
            const autoCloseDelay = uploadError ? 5000 : 3000;
            setTimeout(() => {
                setShowModal(false);
                setUploadMessage(null);
                setUploadError(null);
            }, autoCloseDelay);
        }
    }, [userId, folderId, userEmail, updateStorage, currentStorageUsageMb, maxStorageQuotaMb, uploadError]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLocalFile(file);
            setUploadMessage(null);
            setUploadError(null);
            setIsCardLoading(true);
            setShowModal(true);
            event.target.value = null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative p-8 sm:p-10 rounded-2xl shadow-lg
            bg-white/10 dark:bg-black/10 flex flex-col justify-between h-full
            transition-all duration-300 ease-in-out group cursor-pointer backdrop-blur-sm
            hover:shadow-xl hover:scale-[1.01]"
            onClick={() => {
                if (!isUploading && !isCardLoading) {
                    document.getElementById('local-file-input').click();
                }
            }}
        >
            <div className="flex flex-col items-center justify-center flex-grow text-center">
                {isCardLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-blue-500 dark:text-blue-300 mb-6"
                    >
                        <FaSpinner size={60} className="animate-spin" />
                        <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Preparing...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                        className="text-purple-600 dark:text-purple-400 mb-6"
                    >
                        <FaPlusCircle size={70} className="transition-all duration-300 group-hover:scale-110 group-active:scale-95" />
                    </motion.div>
                )}
                <h2 className="font-bold text-3xl sm:text-4xl text-gray-900 dark:text-gray-100 leading-tight mb-3
                    font-poppins drop-shadow-sm">
                    Upload File
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300
                    font-montserrat leading-snug">
                    Click to select a file for upload.
                </p>
            </div>

            <input
                id="local-file-input"
                type="file"
                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading || isCardLoading}
            />

            <FileDetailsModal
                isOpen={showModal}
                onClose={() => {
                    if (!isUploading || uploadMessage || uploadError) {
                        setShowModal(false);
                        setLocalFile(null);
                        setUploadMessage(null);
                        setUploadError(null);
                        setIsCardLoading(false);
                    }
                }}
                onUploadInitiate={() => handleActualFileUpload(localFile)}
                selectedFile={localFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                theme={theme}
                uploadMessage={uploadMessage}
                uploadError={uploadError}
            />
        </motion.div>
    );
};

export default LocalFileUpload;