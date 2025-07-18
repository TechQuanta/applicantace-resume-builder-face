import React, { useState, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTh, faFileLines, faFileContract, faEye, faTimesCircle,
    faFilePdf, faFileWord, faFileAlt, faSpinner, faExclamationCircle,
    faCloudUploadAlt, faUser, faBars, faTimes, faChevronRight,
    faCheckCircle, faFolderOpen, faMagnifyingGlass, faTrashCan,
    faSyncAlt
} from '@fortawesome/free-solid-svg-icons';

import { filesState, filesLoadingState, filesErrorState } from '../../../services/fileatom';
import { userState } from '../../../services/authatom';
import { useUserSession } from '../../../hooks/useUserSession';

import { motion, AnimatePresence } from 'framer-motion';

// --- Import the Loading component here ---
import Loading from '../../Shared/Loading'; // ADJUST THIS PATH BASED ON YOUR FILE STRUCTURE
import styles from '../style/TemplateComparisonPage.module.css'; // Import the CSS module

const NAV_HEIGHT = '70px'; // Define navigation height

const TemplateComparisonPage = ({ theme }) => {
    // Recoil and User Session Hooks
    const allFiles = useRecoilValue(filesState);
    const filesLoading = useRecoilValue(filesLoadingState);
    const filesError = useRecoilValue(filesErrorState);
    const currentUser = useRecoilValue(userState);

    const { user: userSessionData, isLoading: userSessionLoading } = useUserSession();
    const effectiveUser = currentUser?.selected || userSessionData?.selected;

    // Local State for Component
    const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'userDocuments'
    const [activeDocumentType, setActiveDocumentType] = useState('All'); // For APPLICANTACE templates
    const [selectedForComparison, setSelectedForComparison] = useState([]); // State for up to 2 templates/documents
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar starts closed on small screens

    const isDark = theme === "dark";

    // Combined Loading and Error States
    const loading = filesLoading || userSessionLoading;
    const error = filesError;

    // --- Memoized File Lists ---
    const applicantaceTemplates = useMemo(() => {
        const providerFiles = allFiles.filter(file => file.provider === 'APPLICANTACE');
        if (activeDocumentType === 'Resume') {
            return providerFiles.filter(file =>
                (file.templateCategory && file.templateCategory.toLowerCase().includes('resume')) ||
                (file.tags && file.tags.some(tag => tag.toLowerCase().includes('resume'))) ||
                (file.fileName && file.fileName.toLowerCase().includes('resume'))
            );
        } else if (activeDocumentType === 'Cover Letter') {
            return providerFiles.filter(file =>
                (file.templateCategory && file.templateCategory.toLowerCase().includes('cover letter')) ||
                (file.tags && file.tags.some(tag => tag.toLowerCase().includes('cover letter'))) ||
                (file.fileName && file.fileName.toLowerCase().includes('cover letter'))
            );
        }
        return providerFiles;
    }, [allFiles, activeDocumentType]);

    const userDocuments = useMemo(() => {
        return allFiles.filter(file => file.provider !== 'APPLICANTACE');
    }, [allFiles]);

    // --- File Icon Helper for User Documents ---
    const getFileIcon = (name) => {
        if (name.toLowerCase().endsWith('.pdf')) {
            return faFilePdf;
        } else if (name.toLowerCase().endsWith('.doc') || name.toLowerCase().endsWith('.docx')) {
            return faFileWord;
        }
        return faFileAlt;
    };

    // --- Handle File Selection for Comparison ---
    const handleFileForComparisonClick = (file) => {
        if (!file.driveFileId) {
            alert("This document/template cannot be viewed in comparison as it lacks a Google Drive ID.");
            return;
        }

        const isSelected = selectedForComparison.some(
            (item) => (item.mongoFileId && item.mongoFileId === file.mongoFileId) || (item.driveFileId && item.driveFileId === file.driveFileId)
        );

        if (isSelected) {
            setSelectedForComparison(prev =>
                prev.filter(
                    (item) => !((item.mongoFileId && item.mongoFileId === file.mongoFileId) || (item.driveFileId && item.driveFileId === file.driveFileId))
                )
            );
        } else {
            if (selectedForComparison.length < 2) {
                setSelectedForComparison(prev => [...prev, file]);
                // Close sidebar after selection on smaller screens
                if (window.innerWidth < 1024) { // Assuming lg breakpoint is 1024px
                    setIsSidebarOpen(false);
                }
            } else {
                alert("You can only compare a maximum of two documents. Please deselect one to add another.");
            }
        }
    };

    const handleClearComparison = () => {
        setSelectedForComparison([]);
    };

    // --- Google Drive Embed URL Helper ---
    const getDriveEmbedSrc = (driveFileId) => {
        if (driveFileId) {
            return `https://docs.google.com/gview?url=${encodeURIComponent(`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`)}&embedded=true`;
        }
        return '';
    };

    // --- Media Query for initial sidebar state and dynamic adjustment ---
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)'); // Tailwind's 'lg' breakpoint
        const handleMediaQueryChange = (e) => {
            setIsSidebarOpen(e.matches); // Open sidebar by default on large screens, close on small
        };

        // Set initial state
        setIsSidebarOpen(mediaQuery.matches);

        // Listen for changes
        mediaQuery.addEventListener('change', handleMediaQueryChange);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
    }, []);


    // --- Loading, Error, and Empty States (full screen) ---
    if (loading) {
        // --- REPLACE the old loading div with your imported Loading component ---
        return <Loading isDark={isDark} />;
    }

    if (error) {
        return (
            <div className={`${styles.errorContainer} ${isDark ? styles.errorContainerDark : styles.errorContainerLight}`}>
                <FontAwesomeIcon icon={faExclamationCircle} size="4x" className={styles.errorIcon} />
                <p className={styles.errorMessageTitle}>Oops! An Error Occurred</p>
                <p className={styles.errorMessageText}>We couldn't retrieve your documents or templates.</p>
                <p className={styles.errorMessageItalic}>{error.message || "Please check your internet connection or try refreshing the page."}</p>
                <button
                    onClick={() => window.location.assign(`http://aceresume.techquanta.tech/${effectiveUser?.username}/dashboard` || "")}
                    className={styles.errorRetryButton}
                >
                    <FontAwesomeIcon icon={faSyncAlt} className={styles.errorRetryButtonIcon} /> Try Again
                </button>
            </div>
        );
    }

    // --- Main Page Render ---
    return (
        <div className={`${styles.mainContainer} ${isDark ? styles.mainContainerDark : styles.mainContainerLight}`} style={{ marginTop: NAV_HEIGHT }}>
            {/* Main Content Area */}
            <div className={styles.contentArea} style={{ height: `calc(100vh)`,width: `calc(100vw-10vw)`,paddingLeft:`70px`  }}>
                {/* Overlay for small screens when sidebar is open */}
                <AnimatePresence>
                    {isSidebarOpen && window.innerWidth < 1024 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }} // Increased opacity for better overlay effect
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={styles.sidebarOverlay}
                            onClick={() => setIsSidebarOpen(false)} // Click to close sidebar
                            aria-label="Close sidebar overlay"
                        />
                    )}
                </AnimatePresence>

                {/* Left Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className={`${styles.sidebar} ${isDark ? styles.sidebarDark : styles.sidebarLight}`}
                            style={window.innerWidth < 1024 ? { top: NAV_HEIGHT, height: `calc(100vh - ${NAV_HEIGHT})`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: isDark ? 'rgba(31, 41, 55, 0.85)' : 'rgba(255, 255, 255, 0.85)' } : {}} // Added backdrop-filter for blur effect
                        >
                            {/* Close button for mobile sidebar (moved to top right) */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className={styles.sidebarCloseButton}
                                aria-label="Close sidebar"
                                title="Close document list"
                            >
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>

                            {/* Tab Navigation (starts below nav height on mobile) */}
                            <div className={`${styles.tabNavigation} ${isDark ? styles.tabNavigationDark : styles.tabNavigationLight}`}>
                                <button
                                    onClick={() => setActiveTab('templates')}
                                    className={`${styles.tabButton} ${styles.tabButtonLeft} ${activeTab === 'templates' ? (isDark ? styles.tabButtonActiveDark : styles.tabButtonActiveLight) : (isDark ? styles.tabButtonInactiveDark : styles.tabButtonInactiveLight)}`}
                                    aria-controls="template-list"
                                    aria-selected={activeTab === 'templates'}
                                    role="tab"
                                >
                                    <FontAwesomeIcon icon={faFolderOpen} className={styles.tabButtonIcon} /> Templates
                                </button>
                                <button
                                    onClick={() => setActiveTab('userDocuments')}
                                    className={`${styles.tabButton} ${styles.tabButtonRight} ${activeTab === 'userDocuments' ? (isDark ? styles.tabButtonActiveDark : styles.tabButtonActiveLight) : (isDark ? styles.tabButtonInactiveDark : styles.tabButtonInactiveLight)}`}
                                    aria-controls="user-document-list"
                                    aria-selected={activeTab === 'userDocuments'}
                                    role="tab"
                                >
                                    <FontAwesomeIcon icon={faUser} className={styles.tabButtonIcon} /> Your Docs
                                </button>
                            </div>

                            {/* Selected for Comparison Display */}
                            {selectedForComparison.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`${styles.comparisonDisplay} ${isDark ? styles.comparisonDisplayDark : styles.comparisonDisplayLight}`}
                                >
                                    <h3 className={`${styles.comparisonTitle} ${isDark ? styles.comparisonTitleDark : styles.comparisonTitleLight}`}>
                                        <FontAwesomeIcon icon={faEye} className={styles.comparisonTitleIcon} /> Comparing:
                                    </h3>
                                    <ul className={`${styles.comparisonList} ${isDark ? styles.comparisonListDark : styles.comparisonListLight}`}>
                                        {selectedForComparison.map((file, idx) => (
                                            <li key={file.id || file.driveFileId || file.mongoFileId || idx} className={`${styles.comparisonListItem} ${isDark ? styles.comparisonListItemDark : styles.comparisonListItemLight}`}>
                                                <span className={styles.comparisonFileName}>
                                                    <FontAwesomeIcon icon={getFileIcon(file.fileName || '')} className={styles.comparisonFileIcon} />
                                                    {file.fileName || `Document ${idx + 1}`}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedForComparison(prev => prev.filter(item =>
                                                            !((item.mongoFileId && item.mongoFileId === file.mongoFileId) || (item.driveFileId && item.driveFileId === file.driveFileId))
                                                        ));
                                                    }}
                                                    className={styles.comparisonRemoveButton}
                                                    title={`Remove ${file.fileName || `Document ${idx + 1}`} from comparison`}
                                                >
                                                    <FontAwesomeIcon icon={faTimesCircle} size="sm" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleClearComparison}
                                        className={styles.clearComparisonButton}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} className={styles.clearComparisonButtonIcon} /> Clear All
                                    </button>
                                </motion.div>
                            )}

                            {/* Content based on Active Tab */}
                            <div className={styles.tabContentContainer}>
                                {activeTab === 'templates' && (
                                    <>
                                        {/* Document Type Filter for Templates */}
                                        <div className={`${styles.templateFilter} ${isDark ? styles.templateFilterDark : styles.templateFilterLight}`}>
                                            <button
                                                onClick={() => setActiveDocumentType('All')}
                                                className={`${styles.templateFilterButton} ${styles.templateFilterButtonLeft} ${activeDocumentType === 'All' ? styles.templateFilterButtonActive : (isDark ? styles.templateFilterButtonInactiveDark : styles.templateFilterButtonInactiveLight)}`}
                                                title="Show All Templates"
                                            >
                                                <FontAwesomeIcon icon={faTh} className={styles.templateFilterButtonIcon} /> All
                                            </button>
                                            <button
                                                onClick={() => setActiveDocumentType('Resume')}
                                                className={`${styles.templateFilterButton} ${activeDocumentType === 'Resume' ? styles.templateFilterButtonActive : (isDark ? styles.templateFilterButtonInactiveDark : styles.templateFilterButtonInactiveLight)}`}
                                                title="Show Resume Templates"
                                            >
                                                <FontAwesomeIcon icon={faFileLines} className={styles.templateFilterButtonIcon} /> Resume
                                            </button>
                                            <button
                                                onClick={() => setActiveDocumentType('Cover Letter')}
                                                className={`${styles.templateFilterButton} ${styles.templateFilterButtonRight} ${activeDocumentType === 'Cover Letter' ? styles.templateFilterButtonActive : (isDark ? styles.templateFilterButtonInactiveDark : styles.templateFilterButtonInactiveLight)}`}
                                                title="Show Cover Letter Templates"
                                            >
                                                <FontAwesomeIcon icon={faFileContract} className={styles.templateFilterButtonIcon} /> Cover Letter
                                            </button>
                                        </div>

                                        {/* APPLICANTACE Templates Grid */}
                                        <div className={styles.templatesGrid}>
                                            {applicantaceTemplates.length > 0 ? (
                                                applicantaceTemplates.map((template, index) => {
                                                    const isCurrentlySelected = selectedForComparison.some(
                                                        (item) => (item.mongoFileId && item.mongoFileId === template.mongoFileId) || (item.driveFileId && item.driveFileId === template.driveFileId)
                                                    );
                                                    return (
                                                        <motion.div
                                                            key={template.mongoFileId || template.driveFileId || index}
                                                            className={`${styles.templateCard} ${isCurrentlySelected ? styles.templateCardSelected : (isDark ? styles.templateCardDark : styles.templateCardLight)}`}
                                                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.3 }}
                                                            onClick={() => handleFileForComparisonClick(template)}
                                                            title={`Click to ${isCurrentlySelected ? 'deselect' : 'select'} ${template.fileName || 'Template'} for comparison`}
                                                        >
                                                            <div className={`${styles.templateThumbnailContainer} ${isDark ? styles.templateThumbnailContainerDark : styles.templateThumbnailContainerLight}`}>
                                                                <img
                                                                    src={template.thumbnailLink || template.templateImageUrl || `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=No+Image+Available`}
                                                                    alt={template.fileName || 'Template Image'}
                                                                    className={styles.templateThumbnailImage}
                                                                    loading="lazy"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=Image+Error`; }}
                                                                />
                                                                {isCurrentlySelected && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        className={styles.templateSelectedIcon}
                                                                        title="Selected for comparison"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCheckCircle} size="sm" />
                                                                    </motion.div>
                                                                )}
                                                                <div className={styles.templateHoverOverlay}>
                                                                    <FontAwesomeIcon icon={faEye} size="2x" className={styles.templateHoverIcon} />
                                                                </div>
                                                            </div>
                                                            <div className={`${styles.templateCardFooter} ${isDark ? styles.templateCardFooterDark : styles.templateCardFooterLight}`}>
                                                                <p className={styles.templateFileName}>
                                                                    {template.fileName || "Untitled Template"}
                                                                </p>
                                                                <span className={`${styles.templateViewIconWrapper} ${isCurrentlySelected ? styles.templateViewIconWrapperSelected : styles.templateViewIconWrapperDefault}`}>
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className={`${styles.emptyStateMessage} ${isDark ? styles.emptyStateMessageDark : styles.emptyStateMessageLight}`}>
                                                    <FontAwesomeIcon icon={faFileAlt} size="3x" className={styles.emptyStateIconBlue} />
                                                    <p className={styles.emptyStateTitle}>
                                                        {activeDocumentType === 'Resume'
                                                            ? "No resume templates found from APPLICANTACE provider."
                                                            : activeDocumentType === 'Cover Letter'
                                                                ? "No cover letter templates found from APPLICANTACE provider."
                                                                : "No templates found from APPLICANTACE provider."
                                                        }
                                                    </p>
                                                    <p className={styles.emptyStateText}>Try selecting a different document type or check back later for new additions!</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeTab === 'userDocuments' && (
                                    <>
                                        {!effectiveUser?.email ? (
                                            <div className={`${styles.emptyStateMessage} ${isDark ? styles.emptyStateMessageDark : styles.emptyStateMessageLight}`}>
                                                <FontAwesomeIcon icon={faCloudUploadAlt} size="4x" className={styles.emptyStateIconBlue} />
                                                <p className={styles.emptyStateTitle}>Sign In to See Your Documents!</p>
                                                <p className={styles.emptyStateText}>
                                                    Log in to access and manage your uploaded resumes and cover letters. Your personal documents will appear here for easy comparison.
                                                </p>
                                                {/* Optionally add a Login/Sign Up button here */}
                                            </div>
                                        ) : userDocuments.length === 0 ? (
                                            <div className={`${styles.emptyStateMessage} ${isDark ? styles.emptyStateMessageDark : styles.emptyStateMessageLight}`}>
                                                <FontAwesomeIcon icon={faFileAlt} size="4x" className={styles.emptyStateIconOrange} />
                                                <p className={styles.emptyStateTitle}>No documents uploaded yet!</p>
                                                <p className={styles.emptyStateText}>
                                                    Your uploaded files will appear here. Start by using the "Upload Document" feature to add your resumes or cover letters.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className={styles.userDocumentsGrid}>
                                                {userDocuments.map((doc, index) => {
                                                    const isCurrentlySelected = selectedForComparison.some(
                                                        (item) => (item.mongoFileId && item.mongoFileId === doc.mongoFileId) || (item.driveFileId && item.driveFileId === doc.driveFileId)
                                                    );
                                                    return (
                                                        <motion.div
                                                            key={doc.mongoFileId || doc.driveFileId || index}
                                                            className={`${styles.documentCard} ${isCurrentlySelected ? styles.documentCardSelected : (isDark ? styles.documentCardDark : styles.documentCardLight)}`}
                                                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.3 }}
                                                            onClick={() => handleFileForComparisonClick(doc)}
                                                            title={`Click to ${isCurrentlySelected ? 'deselect' : 'select'} ${doc.fileName || 'Document'} for comparison`}
                                                        >
                                                            <div className={`${styles.documentThumbnailContainer} ${isDark ? styles.documentThumbnailContainerDark : styles.documentThumbnailContainerLight}`}>
                                                                {doc.thumbnailLink ? (
                                                                    <img
                                                                        src={doc.thumbnailLink}
                                                                        alt={doc.fileName || 'Document Thumbnail'}
                                                                        className={styles.documentThumbnailImage}
                                                                        loading="lazy"
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x550/${isDark ? '374151' : 'E0E0E0'}/${isDark ? 'FFFFFF' : '000000'}?text=Image+Error`; }}
                                                                    />
                                                                ) : (
                                                                    <div className={styles.documentPlaceholderIcon}>
                                                                        <FontAwesomeIcon icon={getFileIcon(doc.fileName || '')} size="4x" />
                                                                    </div>
                                                                )}
                                                                {isCurrentlySelected && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        className={styles.documentSelectedIcon}
                                                                        title="Selected for comparison"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCheckCircle} size="sm" />
                                                                    </motion.div>
                                                                )}
                                                                <div className={styles.documentHoverOverlay}>
                                                                    <FontAwesomeIcon icon={faEye} size="2x" className={styles.documentHoverIcon} />
                                                                </div>
                                                            </div>
                                                            <div className={`${styles.documentCardFooter} ${isDark ? styles.documentCardFooterDark : styles.documentCardFooterLight}`}>
                                                                <p className={styles.documentFileName}>
                                                                    {doc.fileName || "Untitled Document"}
                                                                </p>
                                                                <span className={`${styles.documentViewIconWrapper} ${isCurrentlySelected ? styles.documentViewIconWrapperSelected : styles.documentViewIconWrapperDefault}`}>
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Document Comparison Panel */}
                <div className={styles.comparisonPanel}>
                    {selectedForComparison.length > 0 ? (
                        selectedForComparison.length === 1 ? (
                            <div className={styles.singleDocumentView}>
                                <iframe
                                    src={getDriveEmbedSrc(selectedForComparison[0].driveFileId)}
                                    className={styles.documentIframe}
                                    allowFullScreen
                                    title={selectedForComparison[0].fileName || 'Document 1'}
                                ></iframe>
                            </div>
                        ) : (
                            <div className={styles.twoDocumentView}>
                                <div className={styles.documentPane}>
                                    <iframe
                                        src={getDriveEmbedSrc(selectedForComparison[0].driveFileId)}
                                        className={styles.documentIframe}
                                        allowFullScreen
                                        title={selectedForComparison[0].fileName || 'Document 1'}
                                    ></iframe>
                                </div>
                                <div className={styles.documentPane}>
                                    <iframe
                                        src={getDriveEmbedSrc(selectedForComparison[1].driveFileId)}
                                        className={styles.documentIframe}
                                        allowFullScreen
                                        title={selectedForComparison[1].fileName || 'Document 2'}
                                    ></iframe>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className={`${styles.noSelectionMessage} ${isDark ? styles.noSelectionMessageDark : styles.noSelectionMessageLight}`}>
                            <FontAwesomeIcon icon={faChevronRight} size="4x" className={styles.noSelectionIcon} />
                            <h2 className={styles.noSelectionTitle}>Select Documents to Compare</h2>
                            <p className={styles.noSelectionText}>
                                Choose up to two templates or your own uploaded documents from the left sidebar to view them side-by-side here.
                            </p>
                            <p className={styles.noSelectionSubtext}>
                                Click on any document in the list to add it for comparison.
                                Don't compare on mobile devices as the view might be cramped.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateComparisonPage;