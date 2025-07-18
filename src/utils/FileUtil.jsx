
/**
 * Formats a number of bytes into a human-readable string (e.g., "1.23 MB").
 * @param {number} bytes The number of bytes.
 * @param {number} [decimals=2] The number of decimal places to include.
 * @returns {string} The formatted size string.
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formats an ISO date string into a localized date and time string.
 * @param {string} isoString The ISO 8601 date string.
 * @returns {string} The formatted date string.
 */
export const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleDateString(undefined, options);
};

/**
 * A utility map for common MIME types to their default file extensions.
 */
export const MimeTypeMap = {
    /**
     * Returns the default file extension for a given MIME type.
     * @param {string} mimeType The MIME type (e.g., "application/pdf").
     * @returns {string} The corresponding file extension (e.g., "pdf"), or "bin" if not found.
     */
    getDefaultExtensionFromMimeType: (mimeType) => {
        const map = {
            "application/pdf": "pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
            "application/vnd.oasis.opendocument.text": "odt",
            "application/rtf": "rtf",
            "text/plain": "txt",
            "text/html": "html",
            "application/zip": "zip",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
            "application/vnd.oasis.opendocument.spreadsheet": "ods",
            "text/csv": "csv",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
            "application/vnd.oasis.opendocument.presentation": "odp",
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/bmp": "bmp",
            "image/tiff": "tiff",
            "image/webp": "webp",
            "image/svg+xml": "svg",
        };
        return map[mimeType] || "bin";
    },
};
