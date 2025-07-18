// src/components/Home/TopNav.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';

const TopNav = ({ activeEditorType, setActiveEditorType, isLargeScreen }) => {
    // If screen is not large, don't render the top navigation
    if (!isLargeScreen) {
        return null;
    }

    return (
        <div className="flex flex-row justify-center items-center px-4 w-full h-[70px] fixed top-0 left-0 bg-white dark:bg-transparent dark:backdrop-blur-md  z-40 backdrop-blur-md">
            {/* Centered buttons */}
            <div className="flex flex-row gap-4">
                <div className="relative group flex flex-col items-center">
                    <button
                        onClick={() => setActiveEditorType('resume-editor')}
                        className={`px-4 py-3 rounded-lg transition-colors duration-200
                            ${activeEditorType === 'resume-editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        title="Resume Editor"
                    >
                        <FontAwesomeIcon icon={faFileAlt} className="text-2xl" />
                    </button>
                    <span className="absolute top-full mt-2 hidden group-hover:block px-3 py-1 text-xs text-white bg-gray-700 dark:bg-gray-200 dark:text-gray-800 rounded-md whitespace-nowrap">
                        Resume Editor
                    </span>
                </div>
                <div className="relative group flex flex-col items-center">
                    <button
                        onClick={() => setActiveEditorType('cover-letter')}
                        className={`px-4 py-3 rounded-lg transition-colors duration-200
                            ${activeEditorType === 'cover-letter' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        title="Cover Letter Editor"
                    >
                        <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-2xl" />
                    </button>
                    <span className="absolute top-full mt-2 hidden group-hover:block px-3 py-1 text-xs text-white bg-gray-700 dark:bg-gray-200 dark:text-gray-800 rounded-md whitespace-nowrap">
                        Cover Letter Editor
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TopNav;