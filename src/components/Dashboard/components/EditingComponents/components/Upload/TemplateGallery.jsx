// src/components/Dashboard/components/EditingComponents/components/Upload/TemplateGallery.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faFileLines, faFileContract } from '@fortawesome/free-solid-svg-icons';

import { filesState, filesLoadingState, filesErrorState, selectedFileState } from '../../../../../../services/fileatom';
import { useUserSession } from '../../../../../../hooks/useUserSession';

const TemplateGallery = ({ theme }) => {
    const allFiles = useRecoilValue(filesState);
    const filesLoading = useRecoilValue(filesLoadingState);
    const filesError = useRecoilValue(filesErrorState);

    const [activeDocumentType, setActiveDocumentType] = useState('All');

    const setSelectedFileAtom = useSetRecoilState(selectedFileState);

    const { userSession, isLoading: userSessionLoading } = useUserSession();

    const isDark = theme === "dark";

    const loading = filesLoading;
    const error = filesError;

    const templatesToDisplay = useMemo(() => {
        const APPLICANTACEProviderFiles = allFiles.filter(file => file.provider === 'APPLICANTACE');

        if (activeDocumentType === 'Resume') {
            const filteredResumes = APPLICANTACEProviderFiles.filter(file =>
                (file.templateCategory && file.templateCategory.toLowerCase().includes('resume')) ||
                (file.tags && file.tags.some(tag => tag.toLowerCase().includes('resume'))) ||
                (file.fileName && file.fileName.toLowerCase().includes('resume'))
            );
            return filteredResumes;
        } else if (activeDocumentType === 'Cover Letter') {
            const filteredCoverLetters = APPLICANTACEProviderFiles.filter(file =>
                (file.templateCategory && file.templateCategory.toLowerCase().includes('cover letter')) ||
                (file.tags && file.tags.some(tag => tag.toLowerCase().includes('cover letter'))) ||
                (file.fileName && file.fileName.toLowerCase().includes('cover letter'))
            );
            return filteredCoverLetters;
        }
        return APPLICANTACEProviderFiles;
    }, [allFiles, activeDocumentType]);

    const handleTemplateClick = (template) => {
        if (template.driveFileId || template.webViewLink) {
            setSelectedFileAtom(template);
        } else {
            alert("This template cannot be viewed directly as it lacks a Google Drive ID or web view link.");
        }
    };

    if (loading || userSessionLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[200px]">
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading templates and user session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full min-h-auto text-red-600 dark:text-red-400 p-4 text-center">
                <p className="text-sm">Please check the network connection or the API URL.</p>
                <p className="text-xs italic mt-2">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 w-full items-center">
            <div className="flex justify-center mb-6 w-full max-w-md">
                <button
                    onClick={() => setActiveDocumentType('All')}
                    className={`px-6 py-3 rounded-l-lg text-lg font-semibold transition-colors duration-300 flex items-center justify-center
                                ${activeDocumentType === 'All'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                    title="Show All Templates"
                >
                    <FontAwesomeIcon icon={faTh} className="text-2xl" />
                </button>
                <button
                    onClick={() => setActiveDocumentType('Resume')}
                    className={`px-6 py-3 text-lg font-semibold transition-colors duration-300 flex items-center justify-center
                                ${activeDocumentType === 'Resume'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                    title="Show Resume Templates"
                >
                    <FontAwesomeIcon icon={faFileLines} className="text-2xl" />
                </button>
                <button
                    onClick={() => setActiveDocumentType('Cover Letter')}
                    className={`px-6 py-3 rounded-r-lg text-lg font-semibold transition-colors duration-300 flex items-center justify-center
                                ${activeDocumentType === 'Cover Letter'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                    title="Show Cover Letter Templates"
                >
                    <FontAwesomeIcon icon={faFileContract} className="text-2xl" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 w-full max-w-7xl">
                {templatesToDisplay.length > 0 ? (
                    templatesToDisplay.map((template, index) => (
                        <div
                            key={template.mongoFileId || template.driveFileId || index}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative cursor-pointer`}
                            onClick={() => handleTemplateClick(template)}
                        >
                            <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                                <img
                                    src={template.thumbnailLink || template.image || `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=No+Image+Available`}
                                    alt={template.fileName || 'Template Image'}
                                    className="w-full h-full object-contain object-center"
                                    loading="lazy"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=Image+Error`; }}
                                />
                            </div>
                            {/* Removed the template name and description section entirely */}
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-600 dark:text-gray-300 text-lg">
                        {activeDocumentType === 'Resume'
                            ? "No resume templates found from APPLICANTACE provider."
                            : activeDocumentType === 'Cover Letter'
                                ? "No cover letter templates found from APPLICANTACE provider."
                                : "No templates found from APPLICANTACE provider."
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default TemplateGallery;