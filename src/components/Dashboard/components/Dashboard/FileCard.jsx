import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
    FaFilePdf,
    FaFileImage,
    FaFileAlt,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileCode,
    FaDownload,
    FaTrashAlt,
    FaShareAlt,
    FaRegCopy,
    FaEllipsisV // Font Awesome for consistency
} from "react-icons/fa";
import {
    FileText,
    Settings,
    Calendar,
    HardDrive,
    Eye // For "Open" action
} from "lucide-react"; // Importing Lucide icons

import { formatBytes, formatDate } from "../../../../utils/FileUtil"; // Adjust path as needed

// --- Inline Portal Component (unchanged) ---
const InlinePortal = ({ children, wrapperId = "react-portal-wrapper" }) => {
    const [wrapperElement, setWrapperElement] = useState(null);

    useEffect(() => {
        let element = document.getElementById(wrapperId);
        let systemCreated = false;

        if (!element) {
            systemCreated = true;
            element = document.createElement('div');
            element.setAttribute('id', wrapperId);
            document.body.appendChild(element);
        }
        setWrapperElement(element);

        return () => {
            if (systemCreated && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, [wrapperId]);

    if (wrapperElement === null) return null;
    return createPortal(children, wrapperElement);
};
// --- End Inline Portal Component ---

/**
 * Renders a card for a single file, displaying its details and available actions.
 * @param {object} props - Component props.
 * @param {object} props.file - The file object with details like fileName, mimeType, size, etc.
 * @param {object} props.user - Object containing user session data (email, token, authProvider).
 * @param {function} props.onFileActionTrigger - Callback function to notify parent of an action trigger.
 * @param {function} props.onFileNameClick - Callback function when the file name is clicked, typically to open a details modal.
 * @returns {JSX.Element} The FileCard component.
 */
function FileCard({ file, user, onFileActionTrigger, onFileNameClick }) {
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const actionsButtonRef = useRef(null);
    const cardRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                actionsButtonRef.current &&
                !actionsButtonRef.current.contains(event.target) &&
                !event.target.closest('.portal-menu')
            ) {
                setShowActionsMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Position the menu relative to the button, ensuring it stays within viewport
    useEffect(() => {
        if (showActionsMenu && actionsButtonRef.current) {
            const buttonRect = actionsButtonRef.current.getBoundingClientRect();
            const menuWidth = 208; // Tailwind w-52 is 208px
            const menuHeight = 250; // Approximate height for the menu to check against viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = buttonRect.bottom + window.scrollY + 8; // 8px offset from button bottom
            let right = viewportWidth - (buttonRect.right + window.scrollX); // Position relative to viewport right edge

            // Adjust if menu goes off right edge
            if (buttonRect.right + menuWidth > viewportWidth) {
                 // Try to align to the right edge of the button
                right = viewportWidth - buttonRect.right;
            }

            // Adjust if menu goes off bottom edge
            if (top + menuHeight > viewportHeight + window.scrollY) {
                top = buttonRect.top + window.scrollY - menuHeight - 8; // Position above the button
            }

            setMenuPosition({ top, right });
        }
    }, [showActionsMenu]);

    const getFileIcon = useCallback((mimeType) => {
        const iconSize = 32; // Slightly smaller icons for compactness
        const defaultColor = "text-gray-500 dark:text-gray-400";

        if (!mimeType) return <FileText className={defaultColor} size={iconSize} />;
        if (mimeType.includes("pdf")) return <FaFilePdf className="text-red-600 dark:text-red-400" size={iconSize} />;
        if (mimeType.includes("image")) return <FaFileImage className="text-blue-600 dark:text-blue-400" size={iconSize} />;
        if (mimeType.includes("wordprocessingml") || mimeType.includes("doc") || mimeType.includes("msword"))
            return <FaFileWord className="text-indigo-700 dark:text-indigo-400" size={iconSize} />;
        if (mimeType.includes("spreadsheetml") || mimeType.includes("xls"))
            return <FaFileExcel className="text-green-700 dark:text-green-400" size={iconSize} />;
        if (mimeType.includes("presentationml") || mimeType.includes("ppt"))
            return <FaFilePowerpoint className="text-orange-600 dark:text-orange-400" size={iconSize} />;
        if (mimeType.includes("text/plain") || mimeType.includes("text/html"))
            return <FaFileAlt className={defaultColor} size={iconSize} />;
        if (mimeType.includes("code") || mimeType.includes("json"))
            return <FaFileCode className="text-purple-600 dark:text-purple-400" size={iconSize} />;
        return <FileText className={defaultColor} size={iconSize} />;
    }, []);

    const handleActionClick = (actionName) => {
        setShowActionsMenu(false);
        if (onFileActionTrigger) {
            onFileActionTrigger(actionName, file, user);
        } else {
            console.warn("onFileActionTrigger prop is not provided to FileCard.");
        }
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative p-3 sm:p-4 rounded-2xl shadow-lg bg-white dark:bg-zinc-900
                       flex flex-col justify-between h-[150px] sm:h-[160px] md:h-[170px]
                       transition-all duration-300 ease-in-out
                       hover:shadow-xl hover:scale-[1.01] border border-gray-200 dark:border-zinc-800 group font-sans
                       overflow-hidden cursor-pointer transform-gpu"
            onClick={() => onFileNameClick(file)}
        >
            {/* --- TOP LAYER AESTHETICS --- */}
            {/* Subtle Inner Glow on Hover (Astonishing effect 1) */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                initial={{ background: 'radial-gradient(circle at top left, transparent 0%, transparent 100%)' }}
                whileHover={{ background: 'radial-gradient(circle at top left, rgba(168, 85, 247, 0.05) 0%, transparent 70%)' }}
                transition={{ duration: 0.5 }}
            />
            {/* Background Pattern - more subtle */}
            <div className="absolute inset-0 z-0 opacity-8 dark:opacity-3">
                <svg className="w-full h-full" fill="none" viewBox="0 0 100 100">
                    <defs>
                        <pattern id="pattern-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pattern-dots)" className="text-indigo-400 dark:text-zinc-700" />
                </svg>
            </div>
            {/* Subtle Gradient Overlay - Adjusted for more depth on hover */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-purple-50 dark:to-zinc-800 opacity-10 dark:opacity-20 rounded-2xl group-hover:opacity-20 group-hover:dark:opacity-30 transition-opacity duration-300"></div>


            {/* --- CONTENT LAYOUT --- */}
            <div className="relative z-10 flex items-start gap-3 flex-grow min-h-0">
                {/* Thumbnail or Icon */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-inner-sm overflow-hidden p-1 border border-gray-200 dark:border-zinc-700">
                    {file.thumbnailLink ? (
                        <img
                            src={file.thumbnailLink}
                            alt={`Thumbnail for ${file.fileName}`}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; e.currentTarget.alt = 'Thumbnail failed to load. Showing icon instead.'; e.currentTarget.replaceWith(getFileIcon(file.fileMimeType)) }}
                        />
                    ) : (
                        getFileIcon(file.fileMimeType)
                    )}
                </div>

                {/* File Name & Secondary Info (Compact) */}
                <div className="flex-grow flex flex-col justify-center min-w-0">
                    <h2
                        className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                        title={file.fileName}
                    >
                        {file.fileName}
                    </h2>
                    {/* Compact Type & Date on a single line for ultimate compactness */}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                            {file.fileMimeType ? file.fileMimeType.split('/').pop().toUpperCase().replace('WORDPROCESSINGML.DOCUMENT', 'DOCX').replace('SPREADSHEETML.SHEET', 'XLSX').replace('PRESENTATIONML.PRESENTATION', 'PPTX').replace('APPLICATION', '').replace('OCTET-STREAM', 'Binary').trim() : 'UNKNOWN'}
                        </span>
                        <span className="mx-1">•</span>
                        {formatDate(file.uploadedAt)}
                    </p>
                </div>

                {/* More Options / Actions Button */}
                <div className="relative flex-shrink-0 ml-auto">
                    <motion.button
                        ref={actionsButtonRef}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setShowActionsMenu(!showActionsMenu); }}
                        className="p-1.5 sm:p-2 rounded-full text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors duration-200 shadow-sm
                                   opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
                        aria-label="More file actions"
                    >
                        <FaEllipsisV size={16} />
                    </motion.button>
                </div>
            </div>

            {/* --- BOTTOM SECTION: Size & Action Bar (Revealed on Hover) --- */}
            <AnimatePresence>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800"
                >
                    {/* Size */}
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <HardDrive size={14} className="text-green-500 dark:text-green-400" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formatBytes(file.fileSizeInBytes)}
                        </span>
                    </div>

                    {/* Quick Actions (only "Download" and "Delete" for ultimate compactness, "Open" handled by card click)
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(34, 197, 94, 0.1)" }} // Green-500 transparent
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleActionClick("download"); }}
                            className="p-1.5 rounded-full text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
                            aria-label="Download file"
                        >
                            <FaDownload size={16} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.1)" }} // Red-500 transparent
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleActionClick("delete"); }}
                            className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                            aria-label="Delete file"
                        >
                            <FaTrashAlt size={16} />
                        </motion.button>
                    </div> */}
                </motion.div>
            </AnimatePresence>

            {/* Portal for the actions menu */}
            <AnimatePresence>
                {showActionsMenu && (
                    <InlinePortal>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{ top: menuPosition.top, right: menuPosition.right }}
                            className="absolute w-52 bg-white dark:bg-zinc-800 rounded-lg shadow-xl py-1 z-[9999] border border-gray-200 dark:border-zinc-700 transform-gpu origin-top-right portal-menu"
                        >
                            <button
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                                onClick={() => handleActionClick("open")}
                            >
                                <Eye size={15} className="text-blue-600 dark:text-blue-400" /> Open
                            </button>
                            <button
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                                onClick={() => handleActionClick("download")}
                            >
                                <FaDownload size={15} className="text-green-600 dark:text-green-400" /> Download
                            </button>
                            <button
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                                onClick={() => handleActionClick("replicate")}
                            >
                                <FaRegCopy size={15} className="text-indigo-600 dark:text-indigo-400" /> Replicate
                            </button>
                            <button
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                                onClick={() => handleActionClick("permission")}
                            >
                                <FaShareAlt size={15} className="text-teal-600 dark:text-teal-400" /> Permissions
                            </button>
                            <button
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-150"
                                onClick={() => handleActionClick("export")}
                            >
                                <Settings size={15} className="text-yellow-600 dark:text-yellow-400" /> Export
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-zinc-700" />
                            {/* <button
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-150"
                                onClick={() => handleActionClick("delete")}
                            >
                                <FaTrashAlt size={15} className="text-red-600 dark:text-red-400" /> Delete
                            </button> */}
                        </motion.div>
                    </InlinePortal>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default FileCard;