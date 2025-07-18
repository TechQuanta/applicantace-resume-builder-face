import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({
    isOpen,
    onClose,
    title,
    className,
    disableClickOutside = false,
    fixedContentLeft,
    tabsConfig = [],
    activeTab,
    setActiveTab,
}) => {
    const modalContentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                modalContentRef.current &&
                !modalContentRef.current.contains(event.target) &&
                !disableClickOutside
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, disableClickOutside]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // Outer overlay: allows the entire page to scroll if modal content overflows
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-start justify-center p-6 z-50 font-body" // Changed items-center to items-start for top alignment, removed overflow-y-auto here
                >
                    <motion.div
                        ref={modalContentRef}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className={`
                            bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative mt-10 mb-10 // Added mt-10 mb-10 for vertical spacing
                            w-full flex flex-col font-body // No fixed height or max-height here
                            ${className || ''}
                            
                            max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl
                        `}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? "modal-title" : undefined}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        {/* General Modal Title (e.g., "File Operations") - now optional */}
                        {title && (
                            <h3
                                id="modal-title"
                                className="text-2xl font-headline font-bold pt-6 px-6 pb-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pr-10 leading-tight"
                            >
                                {title}
                            </h3>
                        )}

                        {/* Main content area for fixed left and tabbed right. */}
                        {/* Removed all max-height and overflow classes here */}
                        <div className={`flex flex-1 flex-col text-gray-700 dark:text-gray-300
                                         lg:flex-row`}>

                            {/* Fixed Left Panel - HIDDEN ON MOBILE, VISIBLE ON LARGE SCREENS */}
                            {fixedContentLeft && (
                                <div className={`
                                        ${tabsConfig.length > 0 ? 'w-full lg:w-1/3' : 'w-full'} 
                                        hidden lg:block 
                                        p-6 // Padding for content within this panel
                                        font-body text-base leading-relaxed // Removed overflow-y-auto
                                        border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700
                                `}>
                                    {fixedContentLeft}
                                </div>
                            )}

                            {/* Tabbed Right Panel (now full width on mobile if fixedContentLeft is hidden) */}
                            {tabsConfig.length > 0 && (
                                <div className={`${fixedContentLeft ? 'w-full lg:flex-1' : 'w-full'} flex flex-col`}> {/* Removed overflow-hidden */}
                                    {/* Tab Navigation */}
                                    <div className="flex-shrink-0"> {/* Removed overflow-x-auto, scrollbar-hide */}
                                        <div className="flex border-b border-gray-200 overflow-y-auto dark:border-gray-700 px-6 whitespace-nowrap">
                                            {tabsConfig.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    disabled={tab.disabled}
                                                    className={`
                                                        py-3 px-4 text-sm font-label font-medium
                                                        ${activeTab === tab.id
                                                            ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400 font-semibold"
                                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        }
                                                        ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
                                                        focus:outline-none transition-colors duration-200 flex-shrink-0
                                                    `}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tab Content Area */}
                                    <div className="flex-1 relative p-6 font-body text-base leading-normal"> {/* Removed overflow-y-auto */}
                                        {tabsConfig.map((tab) => (
                                            <div
                                                key={tab.id}
                                                className={`absolute inset-0 transition-opacity duration-200 ${
                                                    activeTab === tab.id
                                                        ? "opacity-100 pointer-events-auto"
                                                        : "opacity-0 pointer-events-none"
                                                }`}
                                            >
                                                {tab.content}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;