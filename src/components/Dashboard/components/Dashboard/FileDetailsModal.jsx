// File: FileDetailsModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
    FaFilePdf, FaFileImage, FaFileAlt, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCode,
} from "react-icons/fa";

import Modal from "./Modal";
import AlertDialog from "./AlertDialog";

// Import the API service functions
import { renameFile, updateFilePermissions, initiateDriveFileDownload } from "../../../../utils/apiconfig"; // Adjust path as needed

import RenameTab from "../Dashboard/components/RenameTab";
import PermissionTab from "../Dashboard/components/PermissionTab";
import ExportTab from "../Dashboard/components/ExportTab";

import { formatBytes, formatDate } from "../../../../utils/FileUtil";

import ErrorPopup from "../../../Shared/ErrorPopup";

// Import the useUserSession hook
import { useUserSession } from "../../../../hooks/useUserSession"; // Adjust path as needed

// Define comprehensive export options for Google Workspace file types
const GOOGLE_WORKSPACE_EXPORT_OPTIONS = {
    "application/vnd.google-apps.document": [
        { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
        { label: "Microsoft Word", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" },
        { label: "OpenDocument Text", mimeType: "application/vnd.oasis.opendocument.text", extension: "odt" },
        { label: "Rich Text Format", mimeType: "application/rtf", extension: "rtf" },
        { label: "Plain Text", mimeType: "text/plain", extension: "txt" },
        { label: "Web Page", mimeType: "application/zip", extension: "zip" }, // HTML download comes as zip
        { label: "EPUB Publication", mimeType: "application/epub+zip", extension: "epub" },
    ],
    "application/vnd.google-apps.spreadsheet": [
        { label: "Microsoft Excel", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" },
        { label: "OpenDocument Sheet", mimeType: "application/vnd.oasis.opendocument.spreadsheet", extension: "ods" },
        { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
        { label: "Comma Separated Values", mimeType: "text/csv", extension: "csv" },
        { label: "Tab Separated Values", mimeType: "text/tab-separated-values", extension: "tsv" },
        { label: "Web Page", mimeType: "application/zip", extension: "zip" }, // HTML download comes as zip
    ],
    "application/vnd.google-apps.presentation": [
        { label: "Microsoft PowerPoint", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx" },
        { label: "OpenDocument Presentation", mimeType: "application/vnd.oasis.opendocument.presentation", extension: "odp" },
        { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
        { label: "Plain Text", mimeType: "text/plain", extension: "txt" },
        { label: "JPEG image", mimeType: "image/jpeg", extension: "jpeg" },
        { label: "PNG image", mimeType: "image/png", extension: "png" },
        { label: "Scalable Vector Graphics", mimeType: "image/svg+xml", extension: "svg" },
    ],
};

const FileDetailsModal = ({
    isOpen,
    onClose,
    file,
    onRenameSuccess,
    onPermissionUpdateSuccess,
    onExportSuccess,
    userStorageInfo,
    authProvider,
    initialAction,
}) => {
    // --- Get user session data using the hook ---
    const { user } = useUserSession();
    const userEmail = user?.selected?.email;
    const authToken = user?.selected?.token;

    const [newFileName, setNewFileName] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [selectedPermissionOption, setSelectedPermissionOption] = useState("reader");

    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [currentError, setCurrentError] = useState(null);

    const [currentActiveTab, setCurrentActiveTab] = useState("rename");

    useEffect(() => {
        if (file) {
            setNewFileName(file.fileName || "");
            setTargetEmail("");
            setSelectedPermissionOption("reader");
            setIsLoading(false);
            setAlert({ isOpen: false, title: "", message: "", type: "info" });
            setCurrentError(null);

            if (initialAction && ["rename", "permission", "export"].includes(initialAction)) {
                setCurrentActiveTab(initialAction);
            } else {
                setCurrentActiveTab("rename");
            }
        }
    }, [file, isOpen, initialAction]);

    const getFileIcon = (mimeType) => {
        if (!mimeType) return <FaFileAlt className="text-gray-500" size={36} />;
        if (mimeType.includes("pdf")) return <FaFilePdf className="text-red-500" size={36} />;
        if (mimeType.includes("image")) return <FaFileImage className="text-blue-500" size={36} />;
        if (
            mimeType.includes("wordprocessingml") ||
            mimeType.includes("doc") ||
            mimeType.includes("msword")
        )
            return <FaFileWord className="text-blue-600" size={36} />;
        if (mimeType.includes("spreadsheetml") || mimeType.includes("xls"))
            return <FaFileExcel className="text-green-600" size={36} />;
        if (mimeType.includes("presentationml") || mimeType.includes("ppt"))
            return <FaFilePowerpoint className="text-orange-600" size={36} />;
        if (mimeType.includes("text/plain") || mimeType.includes("text/html"))
            return <FaFileAlt className="text-gray-500" size={36} />;
        if (mimeType.includes("code") || mimeType.includes("json"))
            return <FaFileCode className="text-purple-500" size={36} />;
        return <FaFileAlt className="text-gray-500" size={36} />;
    };

    const handleRename = useCallback(async () => {
        setCurrentError(null);
        if (!file || !file.fileName || !userEmail || !newFileName.trim()) {
            setCurrentError("File data, user email, or new file name is missing.");
            return;
        }
        if (newFileName.trim() === file.fileName) {
            setAlert({ isOpen: true, title: "No Change", message: "New file name is the same as the current file name.", type: "info" });
            return;
        }
        if (!authToken) {
            setCurrentError("Authentication token is missing. Please log in.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const fileIdentifier = authProvider === 'WEBSITE' ? file.mongoFileId : file.driveFileId;
            if (authProvider !== 'WEBSITE' && !fileIdentifier) {
                setCurrentError("Google Drive File ID is missing for rename operation.");
                setIsLoading(false);
                return;
            }

            const response = await renameFile(
                fileIdentifier,
                newFileName,
                userEmail,
                authToken,
                authProvider
            );

            if (response.success) {
                setAlert({ isOpen: true, title: "Success!", message: `${file.fileName} successfully renamed to ${newFileName}.`, type: "success" });
                onRenameSuccess(fileIdentifier, newFileName, response.webViewLink, authProvider);
            } else {
                setCurrentError(response.message || "Failed to rename file.");
            }
        } catch (error) {
            setCurrentError(error.response?.data?.message || "An unexpected error occurred during rename.");
        } finally {
            setIsLoading(false);
        }
    }, [file, userEmail, newFileName, onRenameSuccess, authProvider, authToken]);

    const handlePermissionUpdate = useCallback(async () => {
        setCurrentError(null);
        if (!file || !file.driveFileId || !userEmail || !targetEmail.trim() || !selectedPermissionOption) {
            setCurrentError("All fields (file ID, user email, target email, permission type) are required.");
            return;
        }
        if (authProvider === 'WEBSITE') {
            setAlert({ isOpen: true, title: "Not Applicable", message: "Permission changes are not available for locally stored files.", type: "info" });
            return;
        }

        const action = selectedPermissionOption === "remove_all" ? "remove" : "add";
        const role = selectedPermissionOption;

        if (targetEmail.trim().toLowerCase() === userEmail.toLowerCase()) {
            setAlert({ isOpen: true, title: "Cannot Modify Self", message: "You cannot change your own permissions for this file.", type: "info" });
            return;
        }
        if (!authToken) {
            setCurrentError("Authentication token is missing. Please log in.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await updateFilePermissions(
                file.driveFileId,
                targetEmail,
                action,
                role,
                userEmail,
                authToken
            );

            if (response.success) {
                setAlert({ isOpen: true, title: "Success!", message: response.message, type: "success" });
                onPermissionUpdateSuccess();
                setTargetEmail("");
                setSelectedPermissionOption("reader");
            } else {
                setCurrentError(response.message || "Failed to update permissions.");
            }
        } catch (error) {
            setCurrentError(error.response?.data?.message || "An unexpected error occurred during permission update.");
        } finally {
            setIsLoading(false);
        }
    }, [file, userEmail, targetEmail, selectedPermissionOption, onPermissionUpdateSuccess, authToken, authProvider]);

    const handleDirectDownload = useCallback(() => {
        setCurrentError(null);
        if (!file || !file.driveFileId) {
            setCurrentError("File ID is missing for download.");
            return;
        }
        if (authProvider === 'WEBSITE') {
            setAlert({ isOpen: true, title: "Not Applicable", message: "This 'Export' function is for Google Drive files. For local files, use the 'Download' action from the file card.", type: "info" });
            return;
        }

        setIsLoading(true);

        try {
            const downloadResult = initiateDriveFileDownload(
                file.driveFileId,
                file.fileName,
                file.fileMimeType,
                null,
                GOOGLE_WORKSPACE_EXPORT_OPTIONS
            );

            if (downloadResult.success) {
                setAlert({ isOpen: true, title: "Download Started", message: `"${downloadResult.suggestedFileName}" download initiated.`, type: "success" });
                onExportSuccess(file.driveFileId, downloadResult.mimeType, downloadResult.suggestedFileName);
            } else {
                setCurrentError("Failed to initiate download.");
            }
        } catch (error) {
            setCurrentError("Failed to initiate download. Please ensure you have access to the file and your browser allows downloads.");
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [file, onExportSuccess, authProvider]);

    const handleExportAsFormat = useCallback(async (selectedFormat) => {
        setCurrentError(null);
        if (!file || !file.driveFileId) {
            setCurrentError("File ID is missing for export.");
            return;
        }
        if (authProvider === 'WEBSITE') {
            setAlert({ isOpen: true, title: "Not Applicable", message: "This 'Export' function is for Google Drive files. For local files, use the 'Download' action from the file card.", type: "info" });
            return;
        }

        setIsLoading(true);
        try {
            const exportResult = initiateDriveFileDownload(
                file.driveFileId,
                file.fileName,
                file.fileMimeType,
                selectedFormat,
                GOOGLE_WORKSPACE_EXPORT_OPTIONS
            );

            if (exportResult.success) {
                setAlert({ isOpen: true, title: "Export Started", message: `"${exportResult.suggestedFileName}" download initiated (exported as ${selectedFormat.extension.toUpperCase()}).`, type: "success" });
                onExportSuccess(file.driveFileId, exportResult.mimeType, exportResult.suggestedFileName);
            } else {
                setCurrentError("Failed to initiate export.");
            }
        } catch (error) {
            setCurrentError("Failed to initiate export. Please ensure you have access to the file and your browser allows downloads.");
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [file, onExportSuccess, authProvider]);


    if (!file) return null;

    const availableExportFormats = GOOGLE_WORKSPACE_EXPORT_OPTIONS[file.fileMimeType] || [];
    const isExportableGoogleWorkspaceFile = availableExportFormats.length > 0;

    const fileInfoPanel = (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner flex flex-col items-center justify-start gap-4 p-4 text-gray-700 dark:text-gray-300 h-full overflow-y-auto font-body">
            <div className="mb-4">
                {file.thumbnailLink ? (
                    <img
                        src={file.thumbnailLink}
                        alt={`Thumbnail for ${file.fileName}`}
                        className="w-24 h-24 object-contain rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.alt = 'Thumbnail failed to load. Showing icon instead.'; e.target.replaceWith(getFileIcon(file.fileMimeType)) }}
                    />
                ) : (
                    getFileIcon(file.fileMimeType)
                )}
            </div>
            <h3 className="font-headline font-bold text-xl text-gray-900 dark:text-gray-100 text-center line-clamp-2 break-all leading-tight">
                {file.fileName}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 w-full space-y-2 font-body leading-relaxed">
                <p className="flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Type:
                    </span>{" "}
                    <span>{file.fileMimeType || "N/A"}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Uploaded:
                    </span>{" "}
                    <span>{formatDate(file.uploadedAt)}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Size:
                    </span>{" "}
                    <span>{formatBytes(file.fileSizeInBytes)}</span>
                </p>
                {file.webViewLink && authProvider !== 'WEBSITE' && (
                    <p className="flex justify-between items-center break-all">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Link:
                        </span>{" "}
                        <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm ml-2 font-label"
                        >
                            Open in Drive
                        </a>
                    </p>
                )}
            </div>
            {authProvider !== 'WEBSITE' && userStorageInfo && (
                <div className="mt-6 w-full text-center text-sm text-gray-500 dark:text-gray-400 font-body leading-normal">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Storage Usage:</p>
                    <p>
                        {formatBytes(userStorageInfo.currentStorageUsageMb * 1024 * 1024)} of{" "}
                        {formatBytes(userStorageInfo.maxStorageQuotaMb * 1024 * 1024)}{" "}
                        ({((userStorageInfo.currentStorageUsageMb / userStorageInfo.maxStorageQuotaMb) * 100).toFixed(2)}% used)
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{ width: `${(userStorageInfo.currentStorageUsageMb / userStorageInfo.maxStorageQuotaMb) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );

    const allTabs = [
        {
            id: "rename",
            label: "Rename File",
            content: (
                <RenameTab
                    newFileName={newFileName}
                    setNewFileName={setNewFileName}
                    handleRename={handleRename}
                    isLoading={isLoading}
                    file={file}
                />
            ),
        },
        {
            id: "permission",
            label: "Change Permission",
            disabled: authProvider === 'WEBSITE',
            content: (
                <PermissionTab
                    targetEmail={targetEmail}
                    setTargetEmail={setTargetEmail}
                    selectedPermissionOption={selectedPermissionOption}
                    setSelectedPermissionOption={setSelectedPermissionOption}
                    handlePermissionUpdate={handlePermissionUpdate}
                    isLoading={isLoading}
                    userEmail={userEmail}
                />
            ),
        },
        {
            id: "export",
            label: "Download File",
            disabled: authProvider === 'WEBSITE',
            content: (
                <ExportTab
                    handleDownloadClick={handleDirectDownload}
                    handleExportAsFormat={handleExportAsFormat}
                    isLoading={isLoading}
                    availableExportFormats={availableExportFormats}
                    isGoogleWorkspaceFile={isExportableGoogleWorkspaceFile}
                />
            ),
        },
    ];

    const tabsConfiguration = allTabs.filter(tab => {
        if (authProvider === 'WEBSITE') {
            return tab.id === 'rename';
        }
        return true;
    });

    useEffect(() => {
        const currentTabConfig = tabsConfiguration.find(tab => tab.id === currentActiveTab);
        if (currentTabConfig && currentTabConfig.disabled) {
            setCurrentActiveTab('rename');
        }
    }, [currentActiveTab, tabsConfiguration]);


    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={"File Operations"}
                fixedContentLeft={fileInfoPanel}
                tabsConfig={tabsConfiguration}
                activeTab={currentActiveTab}
                setActiveTab={setCurrentActiveTab}
            >
                <AlertDialog
                    isOpen={alert.isOpen}
                    onClose={() => setAlert({ ...alert, isOpen: false })}
                    title={alert.title}
                    message={alert.message}
                    type={alert.type}
                />
            </Modal>
            <ErrorPopup error={currentError} onClose={() => setCurrentError(null)} />
        </>
    );
};

export default FileDetailsModal;