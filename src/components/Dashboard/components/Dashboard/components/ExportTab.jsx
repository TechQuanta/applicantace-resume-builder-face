import React from 'react';

/**
 * Renders an export/download tab with buttons for each available format.
 *
 * @param {object} props - Component props.
 * @param {function} props.handleDownloadClick - Callback function to trigger the direct download logic (for original file).
 * @param {function} props.handleExportAsFormat - Callback function to trigger export for specific formats (Google Workspace files).
 * @param {boolean} props.isLoading - Boolean indicating if a download operation is currently in progress.
 * @param {Array<Object>} props.availableExportFormats - List of formats { label, mimeType, extension } available for the current file.
 * @param {boolean} props.isGoogleWorkspaceFile - True if the file is a native Google Workspace document.
 */
const ExportTab = ({
    handleDownloadClick,
    handleExportAsFormat, // This is the new prop for specific format export
    isLoading,
    availableExportFormats,
    isGoogleWorkspaceFile,
}) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-inner font-body">
            <h3 className="text-xl font-headline font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Download File
            </h3>

            {isGoogleWorkspaceFile && availableExportFormats.length > 0 ? (
                <>
                    <p className="text-gray-700 dark:text-gray-300 font-body mb-4">
                        Select the format you'd like to download this Google Workspace file as:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-start mb-4">
                        {availableExportFormats.map((format) => (
                            <button
                                key={format.mimeType}
                                onClick={() => handleExportAsFormat(format)} // Use handleExportAsFormat for specific formats
                                disabled={isLoading}
                                className={`px-3 py-1 text-sm rounded-md shadow-sm transition-colors duration-200
                                    ${isLoading
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300'
                                        : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                                    }`}
                            >
                                {format.label.split('(')[0].trim()} {/* Display only "PDF Document" etc. */}
                                ({format.extension.toUpperCase()})
                            </button>
                        ))}
                    </div>
                    {isLoading && (
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Preparing Download...
                        </p>
                    )}
                </>
            ) : (
                <>
                    <p className="text-gray-700 dark:text-gray-300 font-body mb-4">
                        Click the button below to download the original file.
                    </p>
                    <div className="flex justify-start"> {/* Use flex justify-start for a single button too */}
                        <button
                            onClick={() => handleDownloadClick(null)} // handleDownloadClick for original non-Google files
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm rounded-md shadow-md transition-colors duration-200
                                ${isLoading
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                                }`}
                        >
                            {isLoading ? "Downloading..." : "Download Original File"}
                        </button>
                    </div>
                </>
            )}

            {!isGoogleWorkspaceFile && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Note: For non-Google Workspace files, the original file type will be downloaded.
                </p>
            )}
        </div>
    );
};

export default React.memo(ExportTab);