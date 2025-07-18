// src/components/EditingComponents/DocEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
    filesState,
    filesLoadingState,
    filesErrorState,
    selectedTemplateState,
    selectedFileState
} from '../../../../services/fileatom';
import Loading from '../../../Shared/Loading'; // Assuming this is a full-page loading spinner

export default function DocEditor() {
    const allFiles = useRecoilValue(filesState);
    const filesAreLoading = useRecoilValue(filesLoadingState);
    const filesError = useRecoilValue(filesErrorState);
    const selectedTemplateFromGallery = useRecoilValue(selectedTemplateState);

    const selectedFile = useRecoilValue(selectedFileState);
    const setSelectedFile = useSetRecoilState(selectedFileState);

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [iframeLoading, setIframeLoading] = useState(false);

    const GOOGLE_DOCS_EDIT_BASE_URL = `https://docs.google.com/document/d/`;

    // Effect to manage initial file selection or clear if no files
    useEffect(() => {
        if (selectedTemplateFromGallery && !selectedFile) {
            setSelectedFile({
                fileName: selectedTemplateFromGallery.name,
                driveFileId: selectedTemplateFromGallery.googleDriveId || null,
                fileMimeType: 'template/placeholder',
                id: selectedTemplateFromGallery.id,
                description: selectedTemplateFromGallery.description,
                image: selectedTemplateFromGallery.image,
                webViewLink: selectedTemplateFromGallery.webViewLink || null,
            });
            return;
        }

        if (!filesAreLoading && !filesError && allFiles && allFiles.length > 0 && !selectedFile) {
            setSelectedFile(allFiles[0]);
        } else if (!filesAreLoading && !filesError && allFiles && allFiles.length === 0 && selectedFile) {
            setSelectedFile(null);
        }
    }, [filesAreLoading, filesError, allFiles, selectedFile, selectedTemplateFromGallery, setSelectedFile]);


    const handleFileSelectChange = useCallback((event) => {
        const selectedId = event.target.value;
        if (selectedId === '') {
            setSelectedFile(null);
            return;
        }

        const file = allFiles.find(f => f.mongoFileId === selectedId || f.driveFileId === selectedId);
        if (file) {
            setSelectedFile(file);
        } else if (selectedTemplateFromGallery && selectedTemplateFromGallery.id === selectedId) {
            setSelectedFile({
                fileName: selectedTemplateFromGallery.name,
                driveFileId: selectedTemplateFromGallery.googleDriveId || null,
                fileMimeType: 'template/placeholder',
                id: selectedTemplateFromGallery.id,
                description: selectedTemplateFromGallery.description,
                image: selectedTemplateFromGallery.image,
                webViewLink: selectedTemplateFromGallery.webViewLink || null,
            });
        }
    }, [allFiles, selectedTemplateFromGallery, setSelectedFile]);

    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    const handleActionButtonClick = useCallback(() => {
        if (!selectedFile) {
            showCustomAlert("Please select a document or template first.");
            return;
        }

        if (selectedFile.fileMimeType === 'application/vnd.google-apps.document' && selectedFile.driveFileId) {
            const editUrl = `${GOOGLE_DOCS_EDIT_BASE_URL}${selectedFile.driveFileId}/edit?usp=drivesdk`;
            window.open(editUrl, '_blank');
        } else if (selectedFile.fileMimeType === 'template/placeholder' && selectedFile.driveFileId) {
            const templateEditUrl = `${GOOGLE_DOCS_EDIT_BASE_URL}${selectedFile.driveFileId}/copy`;
            window.open(templateEditUrl, '_blank');
        } else if (selectedFile.webViewLink) {
            window.open(selectedFile.webViewLink, '_blank');
        } else if (selectedFile.image) {
            window.open(selectedFile.image, '_blank');
        } else {
            showCustomAlert("This document cannot be opened for editing or preview directly.");
        }
    }, [selectedFile, GOOGLE_DOCS_EDIT_BASE_URL]);

    const getButtonText = useCallback(() => {
        if (!selectedFile) {
            return "Select a Document";
        }
        if (selectedFile.fileMimeType === 'template/placeholder') {
            return selectedFile.driveFileId ? "Use Template in Google Docs" : "View Template Details";
        }
        if (selectedFile.fileMimeType === 'application/vnd.google-apps.document') {
            return "Edit in Google Docs";
        }
        if (selectedFile.webViewLink) {
            return "View Document";
        }
        return "Open Document";
    }, [selectedFile]);

    const getButtonIcon = useCallback(() => {
        if (selectedFile && (selectedFile.fileMimeType === 'application/vnd.google-apps.document' || (selectedFile.fileMimeType === 'template/placeholder' && selectedFile.driveFileId))) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
            </svg>
        );
    }, [selectedFile]);

    const getIframeSrc = useCallback(() => {
        if (!selectedFile) return null;

        if (selectedFile.fileMimeType === 'application/vnd.google-apps.document' && selectedFile.driveFileId) {
            return `${GOOGLE_DOCS_EDIT_BASE_URL}${selectedFile.driveFileId}/preview`;
        }

        if (selectedFile.fileMimeType === 'template/placeholder' && selectedFile.driveFileId) {
            return `${GOOGLE_DOCS_EDIT_BASE_URL}${selectedFile.driveFileId}/preview`;
        }

        if (selectedFile.webViewLink && !selectedFile.fileMimeType.startsWith('image/')) {
            if (selectedFile.webViewLink.includes('drive.google.com/file/d/')) {
                const fileIdMatch = selectedFile.webViewLink.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (fileIdMatch && fileIdMatch[1]) {
                    return `https://docs.google.com/document/d/${fileIdMatch[1]}/preview`;
                }
            }
            return selectedFile.webViewLink;
        }

        return null;
    }, [selectedFile, GOOGLE_DOCS_EDIT_BASE_URL]);

    const renderContent = useCallback(() => {
        if (filesError) {
            return (
                <div className="text-red-600 dark:text-red-400 text-center text-lg p-6 bg-white dark:bg-gray-700 rounded-lg max-w-lg mx-auto my-auto shadow-lg">
                    <p className="font-bold mb-2">Oops! Something went wrong.</p>
                    <p>{filesError}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please try refreshing the page or check your connection.</p>
                </div>
            );
        }

        if (filesAreLoading) {
            return <Loading />;
        }

        const iframeSrc = getIframeSrc();

        if (selectedFile && iframeSrc) {
            return (
                // This parent div now has an increased max-width
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent">
                    {iframeLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 bg-opacity-90 z-10 rounded-lg">
                            <Loading />
                            <p className="mt-4 text-lg font-medium text-blue-600 dark:text-blue-300 animate-pulse">
                                Preparing document preview...
                            </p>
                        </div>
                    )}
                    <iframe
                        src={iframeSrc}
                        className={`w-full h-[100%] border-none rounded-lg shadow-xl ${iframeLoading ? 'invisible' : 'visible'}`}
                        title={selectedFile.fileName || "Document Preview"}
                        allowFullScreen
                        loading="eager"
                        onLoad={() => setIframeLoading(false)}
                        onError={() => {
                            setIframeLoading(false);
                            showCustomAlert("Failed to load document preview. This file type might not be embeddable, or there's a network issue.");
                        }}
                    ></iframe>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Note: For full editing capabilities, please click the "Edit/View Document" button.
                    </p>
                </div>
            );
        }

        if (selectedFile && selectedFile.fileMimeType === 'template/placeholder' && !iframeSrc) {
            return (
                <div className="flex flex-col items-center p-8 bg-transparent rounded-lg w-full text-center h-[100vh]">
                    <h3 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 animate-fade-in">
                        ✨ Selected Template: {selectedFile.fileName}
                    </h3>
                    {selectedFile.image && (
                        <div className="w-full mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md max-w-lg">
                            <img
                                src={selectedFile.image}
                                alt={selectedFile.fileName}
                                className="w-full h-auto object-contain object-center"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x350/${e.target.closest('.dark') ? '374151' : 'E0E0E0'}/${e.target.closest('.dark') ? 'FFFFFF' : '000000'}?text=No+Image+Preview`; }}
                            />
                        </div>
                    )}
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl">
                        {selectedFile.description || "A wonderful template to get started with your next project!"}
                    </p>
                    <p className="text-md text-gray-600 dark:text-gray-400 mt-4">
                        {selectedFile.driveFileId ?
                            "Click 'Use Template in Google Docs' to create a new document based on this template." :
                            "This template has no direct Google Docs link for live preview. View its image preview above."
                        }
                    </p>
                </div>
            );
        }

        if (selectedFile && !iframeSrc) {
            return (
                <div className="flex flex-col items-center p-8 bg-transparent rounded-lg w-full text-center h-full">
                    <svg className="w-20 h-20 text-yellow-500 dark:text-yellow-400 mb-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {selectedFile.fileName}
                    </h3>
                    <p className="text-md text-gray-600 dark:text-gray-400 mt-4 max-w-xl">
                        This file type cannot be previewed directly here. <br />
                        No worries! Just click '<span className="font-semibold">{getButtonText()}</span>' to open it in a new browser tab.
                    </p>
                </div>
            );
        }

        // --- NEW: "Select Docs from Templates" when no document is selected/loaded ---
        return (
            <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg w-full text-center shadow-lg h-[100vh] justify-center">
                <svg className="w-28 h-28 text-indigo-600 dark:text-indigo-400 mb-8 animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path>
                </svg>
                <h2 className="text-4xl font-extrabold text-indigo-900 dark:text-indigo-200 mb-4 leading-tight">
                    Choose Your Document! 📚
                </h2>
                <p className="text-xl text-gray-800 dark:text-gray-300 mb-8 max-w-xl">
                    No document selected. Please **select a document from the dropdown** or **browse our templates** to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => showCustomAlert("Functionality to browse your documents will go here!")} // Simulate action
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"></path><path fillRule="evenodd" d="M11 6a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd"></path></svg>
                        Select from My Docs
                    </button>
                    <button
                        onClick={() => showCustomAlert("Navigate to the Gallery to explore templates!")} // Simulate action
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
                        Browse Templates
                    </button>
                </div>
            </div>
        );
    }, [filesError, filesAreLoading, allFiles, selectedTemplateFromGallery, selectedFile, getIframeSrc, getButtonText, showCustomAlert]);


    return (
        <div className="flex flex-col h-[100%] w-[100%] bg-transparent text-gray-900 dark:text-gray-100">
            {/* Custom Alert Modal */}
            {showAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center border border-blue-200 dark:border-blue-700 transform scale-y-105 animate-pop-in">
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5 leading-relaxed">{alertMessage}</p>
                        <button
                            onClick={() => setShowAlert(false)}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            <nav className="flex-shrink-0 bg-transparent dark:bg-transparent p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 ">
                {/* Action button - always visible */}
                <button
                    onClick={handleActionButtonClick}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg shadow-md transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    {getButtonIcon()}
                    {getButtonText()}
                </button>
            </nav>

            <div className="flex-grow overflow-hidden relative flex items-center justify-center p-4">
                {renderContent()}
            </div>
        </div>
    );
}