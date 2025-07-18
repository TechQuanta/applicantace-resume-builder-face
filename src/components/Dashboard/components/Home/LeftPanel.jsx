// src/components/Home/LeftPanel.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsTextParagraph, BsFillFileEarmarkTextFill } from "react-icons/bs";
import { RiFontSize, RiFileEditLine } from "react-icons/ri";
import { LuArrowUpDown } from "react-icons/lu";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faEnvelopeOpenText, faFileAlt, faFileContract, faPalette, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

import { faGithub } from '@fortawesome/free-brands-svg-icons'; // Correct import for the GitHub icon
import MiddlePanel from "./Middle";

const MenuItem = ({ icon, text, onClick, isMobile, isActive = false, onMouseEnter, onMouseLeave, disabled = false, className = "" }) => (
    <button
        className={`flex items-center gap-3 p-3 w-full rounded-lg transition-colors duration-200
            ${isActive
                ? 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-white shadow-inner'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
            ${isMobile ? 'justify-center' : 'justify-start'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            group
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={disabled}
    >
        <span className="text-xl text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
            {icon}
        </span>
        {!isMobile && (
            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                {text}
            </span>
        )}
    </button>
);

const LeftPanel = ({
    activeEditorType,
    setActiveEditorType,
    generatePdfFromHtml,
    showMessage,
    editorContent,
    pageMargin,
    GOOGLE_FONTS_IMPORT_URLS,
    FONT_WHITELIST,
    COMPANY_LOGO_URL,
    WATERMARK_TEXT,
    getDownloadPdfHtmlTemplate,
    activePanel,
    setActivePanel,
    onUploadClick,
    onATSClick,
    onDesignClick,
    onDeadlinesClick,
    onTemplatesClick,
    onGitHubClick,
    isLargeScreen
}) => {
    const [detailPanel, setDetailPanel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showEditorOptions, setShowEditorOptions] = useState(false);
    const swapEditorContainerRef = useRef(null);
    const downloadContainerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1300);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (swapEditorContainerRef.current && !swapEditorContainerRef.current.contains(event.target)) {
                setShowEditorOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMenuClick = (panel) => {
        setActivePanel(panel);
        setDetailPanel(null);
        setShowEditorOptions(false);
        if (isMobile && panel !== "swap-editor") {
            setIsSidebarOpen(false);
        }
    };

    const handleMiddlePanelClose = useCallback(() => {
        setActivePanel(null);
        setDetailPanel(null);
        if (isMobile) setIsSidebarOpen(true);
    }, [isMobile, setActivePanel]);

    const handleEditorOptionClick = (editorType) => {
        setActiveEditorType(editorType);
        setShowEditorOptions(false);
        // *** Remove this line to keep the middle panel open ***
        // setActivePanel(null);
        setDetailPanel(null);
        if (isMobile) setIsSidebarOpen(false);
    };

    return (
        <div className="relative h-[calc(100vh)] w-full grid lg:grid-cols-[auto_1fr] items-start overflow-hidden">
            {isMobile && (
                <button
                    className="fixed top-3 right-4 z-[100] bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    {isSidebarOpen ? <FaEyeSlash className="text-xl text-gray-700 dark:text-gray-300" /> : <FaEye className="text-xl text-gray-700 dark:text-gray-300" />}
                </button>
            )}

            {/* Main Wrapper for sidebar and content */}
            <div
                className={`
                    ${isMobile ? "fixed top-[80px] left-0 h-[calc(100vh-80px)]" : "relative"}
                    z-50 transition-transform duration-300 ease-in-out
                    ${isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}
                `}
            >
                <aside
                    className={`h-full bg-white/90 dark:bg-gray-900/90 shadow-lg p-2 rounded-r-md backdrop-blur-md
                    ${isMobile ? "w-[4.5rem]" : "lg:w-[14rem] lg:fixed lg:top-0 lg:left-0 lg:h-full lg:rounded-none"}
                    font-roboto flex flex-col items-center justify-between py-4`}
                >
                    <nav className="flex flex-col gap-3 w-full px-1">
                        <MenuItem
                            icon={<BsTextParagraph />}
                            text="Templates"
                            onClick={onTemplatesClick}
                            isMobile={isMobile}
                            isActive={activePanel === "templates"}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faGithub} />}
                            text="GitHub Reference"
                            onClick={onGitHubClick}
                            isMobile={isMobile}
                            isActive={activePanel === "github"}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faCalendarCheck} />}
                            text="Deadlines"
                            onClick={onDeadlinesClick}
                            isMobile={isMobile}
                            isActive={activePanel === "deadlines"}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faPalette} />}
                            text="Design & Font"
                            onClick={onDesignClick}
                            isMobile={isMobile}
                            isActive={activePanel === "design-and-font"}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faFileUpload} />}
                            text="Upload File"
                            onClick={onUploadClick}
                            isMobile={isMobile}
                            isActive={activePanel === "upload-file"}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faFileContract} />}
                            text="Check Your Score"
                            onClick={onATSClick}
                            isMobile={isMobile}
                            isActive={activePanel === "atscore"}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faEnvelopeOpenText} />}
                            text="Cover Letter"
                            onClick={() => handleEditorOptionClick('cover-letter')}
                            isMobile={isMobile}
                            isActive={activeEditorType === 'cover-letter'}
                        />
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faFileAlt} />}
                            text="Resume Editor"
                            onClick={() => handleEditorOptionClick('resume-editor')}
                            isMobile={isMobile}
                            isActive={activeEditorType === 'resume-editor'}
                        />
                        <MenuItem
                            icon={<RiFileEditLine />}
                            text="ATS Guidelines"
                            onClick={() => handleMenuClick("rearrange")}
                            isMobile={isMobile}
                            isActive={activePanel === "rearrange"}
                        />
                    </nav>
                </aside>
            </div>
            {activePanel && (
                <div className="relative w-full overflow-visible z-40">
                    <MiddlePanel
                        activePanel={activePanel}
                        setActivePanel={setActivePanel}
                        detailPanel={detailPanel}
                        setDetailPanel={setDetailPanel}
                        onCloseWithSidebarOpen={handleMiddlePanelClose}
                    />
                </div>
            )}
        </div>
    );
};

export default LeftPanel;