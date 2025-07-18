// src/pages/MainPageWrapper.jsx
import React, { useState, useEffect } from "react";
import LeftPanel from "../components/Home/LeftPanel";
import RightContent from "../components/Home/RightContent";
import MiddlePanel from "../components/Home/Middle";
import TopNav from "../components/Home/components/TopNav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BsTextParagraph } from 'react-icons/bs';
import { faFileUpload, faFileContract, faPalette, faCalendarCheck, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

// AI Button with responsive sizing, and a theme-aware background color
const FloatingAIButton = ({ onClick }) => {
    const iconUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLIZai2fudVepvX3CgPUccfZBHfiyW6uFWng&s";
    return (
        <button
            onClick={onClick}
            className="p-3 md:p-4 lg:p-5 text-lg md:text-xl lg:text-2xl
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-lg
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Open AI Assistant"
        >
            <img src={iconUrl} alt="AI Assistant" className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full" />
        </button>
    );
};

// Professional-looking Floating Upload Button
const FloatingUploadButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 md:p-3 lg:p-4 text-lg md:text-xl lg:text-2xl
                bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
            title="Upload File"
        >
            <FontAwesomeIcon icon={faFileUpload} />
        </button>
    );
};

// Professional-looking Floating ATS Button
const FloatingATSButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 md:p-3 lg:p-4 text-lg md:text-xl lg:text-2xl
                bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
            aria-label="ATS Score"
        >
            <FontAwesomeIcon icon={faFileContract} />
        </button>
    );
};

// Professional-looking Floating Design Button
const FloatingDesignButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 md:p-3 lg:p-4 text-lg md:text-xl lg:text-2xl
                bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-rose-500 focus:ring-opacity-50"
            aria-label="Design & Font"
        >
            <FontAwesomeIcon icon={faPalette} />
        </button>
    );
};

// Professional-looking Floating Deadlines Button
const FloatingDeadlinesButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 md:p-3 lg:p-4 text-lg md:text-xl lg:text-2xl
                bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50"
            aria-label="Deadlines"
        >
            <FontAwesomeIcon icon={faCalendarCheck} />
        </button>
    );
};

// Professional-looking Floating GitHub Button
const FloatingGitHubButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 md:p-3 lg:p-4 text-lg md:text-xl lg:text-2xl
                bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-gray-700 focus:ring-opacity-50"
            aria-label="GitHub Reference"
        >
            <FontAwesomeIcon icon={faGithub} />
        </button>
    );
};

// Professional-looking Floating Templates Button
const FloatingTemplatesButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 md:p-3 lg:p-4 text-lg md:text-xl lg:text-2xl
                bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-110
                focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50"
            aria-label="Templates"
        >
            <BsTextParagraph />
        </button>
    );
};

const MainPageWrapper = () => {
    const [activeEditorType, setActiveEditorType] = useState('cover-letter');
    const [activePanel, setActivePanel] = useState(null);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1170);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1300);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleAIButtonClick = () => {
        setActivePanel(activePanel === 'ai' ? null : 'ai');
    };

    const handleUploadButtonClick = () => {
        setActivePanel(activePanel === 'upload-file' ? null : 'upload-file');
    };

    const handleATSButtonClick = () => {
        setActivePanel(activePanel === 'atscore' ? null : 'atscore');
    };

    const handleDesignButtonClick = () => {
        setActivePanel(activePanel === 'design-and-font' ? null : 'design-and-font');
    };

    const handleDeadlinesButtonClick = () => {
        setActivePanel(activePanel === 'rearrange' ? null : 'rearrange');
    };

    const handleTemplatesButtonClick = () => {
        setActivePanel(activePanel === 'templates' ? null : 'templates');
    };

    const handleGitHubButtonClick = () => {
        setActivePanel(activePanel === 'github' ? null : 'github');
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-none lg:flex-row lg:justify-center">
            <TopNav
                activeEditorType={activeEditorType}
                setActiveEditorType={setActiveEditorType}
                isLargeScreen={isLargeScreen}
            />
            <div className="w-full h-auto lg:h-full lg:flex lg:justify-center">
                <div className="w-full lg:max-w-7xl lg:mx-auto lg:flex lg:h-full lg:mt-[70px]">
                    {!isLargeScreen && (
                        <div className="w-full lg:w-2/4 lg:h-full">
                            <LeftPanel
                                activeEditorType={activeEditorType}
                                setActiveEditorType={setActiveEditorType}
                                activePanel={activePanel}
                                setActivePanel={setActivePanel}
                                onUploadClick={handleUploadButtonClick}
                                onATSClick={handleATSButtonClick}
                                onDesignClick={handleDesignButtonClick}
                                onDeadlinesClick={handleDeadlinesButtonClick}
                                onTemplatesClick={handleTemplatesButtonClick}
                                onGitHubClick={handleGitHubButtonClick}
                                isLargeScreen={isLargeScreen}
                            />
                        </div>
                    )}
                    {isLargeScreen && activePanel && (
                        <div className="w-full lg:w-1/4 h-screen">
                            <MiddlePanel
                                activePanel={activePanel}
                                setActivePanel={setActivePanel}
                            />
                        </div>
                    )}
                    <div className="w-full lg:w-full h-screen">
                        <RightContent
                            activeEditorType={activeEditorType}
                            setActiveEditorType={setActiveEditorType}
                            activePanel={activePanel}
                            setActivePanel={setActivePanel}
                        />
                    </div>
                </div>
            </div>
            {isLargeScreen && (
                <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] flex flex-col items-end gap-4">
                    <FloatingATSButton onClick={handleATSButtonClick} />
                    <FloatingUploadButton onClick={handleUploadButtonClick} />
                    <FloatingDesignButton onClick={handleDesignButtonClick} />
                    <FloatingAIButton onClick={handleAIButtonClick} />
                    <FloatingDeadlinesButton onClick={handleDeadlinesButtonClick} />
                    <FloatingGitHubButton onClick={handleGitHubButtonClick} />
                    <FloatingTemplatesButton onClick={handleTemplatesButtonClick} />
                </div>
            )}
        </div>
    );
};

export default MainPageWrapper;