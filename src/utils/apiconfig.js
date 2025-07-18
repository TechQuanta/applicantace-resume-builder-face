//write your own api configuration here
import axios from "axios";

// --- API Endpoints and Configuration ---
const BACKEND_BASE_URL = 'https://api.techquanta.tech'; // Your main backend base URL
// NOTE: Added USER_SERVICE_BASE_URL as it's used in deleteUserAccount. Adjust if it's different.
const USER_SERVICE_BASE_URL = `${BACKEND_BASE_URL}/ace/auth`; // Assuming a /users endpoint for user management

// Chatbot/Paraphrasing API
export const CHATBOT_API_ENDPOINT = import.meta.env.REACT_APP_CHATBOT_API || `${BACKEND_BASE_URL}/ace/jot`;
export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Google Drive API
export const GOOGLE_DRIVE_UPLOAD_ENDPOINT = import.meta.env.REACT_APP_GOOGLE_DRIVE_UPLOAD_API || `${BACKEND_BASE_URL}/ace/drive/upload`;

// Microsoft OneDrive API (Microsoft Graph endpoint is external, but related backend uploads are here)
export const MICROSOFT_GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';
export const ONEDRIVE_BACKEND_UPLOAD_ENDPOINT = `${BACKEND_BASE_URL}/ace/drive/onedrive/upload`; // Backend endpoint for OneDrive file processing


// ATS Checker API
export const ATS_CHECKER_SCORE_ENDPOINT = `${BACKEND_BASE_URL}/ats/checker/score`;
export const ATS_CHECKER_EXTRACT_ENDPOINT = `${BACKEND_BASE_URL}/ats/checker/extract`;
export const MAX_FILE_SIZE_KB = 200; // Max file size for ATS extraction/check

// GitHub GraphQL Endpoint
export const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
// IMPORTANT: For production, secure this token (e.g., environment variable, server-side fetch)


// PDF Conversion Service URL
// Assuming this is still a separate service or integrated into your main backend under a specific path
export const MY_BACKEND_PDF_CONVERT_URL = "https://acebackendapi.vercel.app/api/convert-to-pdf"; // Adjust if this moves to your main backend


// --- API Functions ---

/**
 * Helper function to create authorization headers for backend JWT tokens.
 * This function now only sets the Authorization header. Content-Type should be set
 * specifically by the calling function based on the payload type (JSON or FormData).
 *
 * @param {string} token - The JWT token.
 * @returns {object} Headers object with Authorization, or throws an error if token is invalid.
 */
const createAuthHeaders = (token) => {
    const headers = {}; // <--- MODIFIED: Removed default Content-Type

    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.error("Authentication Error: No valid JWT token provided. Operation requires authentication.");
        throw new Error("Authentication token is required.");
    }
    return headers;
};


/**
 * Sends a message payload to the chatbot backend API for paraphrasing/jotting.
 * This endpoint requires a JWT token for authentication.
 *
 * @param {object} payload - The data transfer object (DTO) to send to the backend.
 * @param {string} payload.input - The user's input, potentially combined with previous context.
 * @param {string} payload.tone - The selected tone for the response (e.g., 'Formal', 'Researched').
 * @param {string} payload.style - The selected sub-tool/style (e.g., 'Data-driven', 'Email').
 * @param {string | null} payload.jobDescription - The job description if matchJobDescription is enabled, otherwise null.
 * @param {boolean} payload.autoCoverLetterMode - Flag indicating if auto cover letter mode is active.
 * @param {boolean} payload.researchedMode - Flag indicating if researched mode is active.
 * @param {boolean} payload.enableSuggestions - Flag indicating if suggestions are enabled.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<object>} - A promise that resolves with the backend's paraphrased content.
 * @throws {Error} - Throws an error if the API call fails or the backend returns an error.
 */
export const sendMessageToChatbot = async (payload, token) => {
    console.log("apiService (chatbot): Sending payload to backend chatbot API.");

    try {
        const headers = { // <--- MODIFIED: Set Content-Type specifically for JSON payload
            'Content-Type': 'application/json',
            ...createAuthHeaders(token)
        };

        console.log("apiService (chatbot): Preparing to send request:");
        console.log("   URL:", CHATBOT_API_ENDPOINT);
        console.log("   Method:", 'POST');
        // console.log("   Headers:", headers); // Avoid logging sensitive info in production
        // console.log("   Body (JSON stringified):", JSON.stringify(payload)); // Don't log sensitive info

        const response = await fetch(CHATBOT_API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        console.log("apiService (chatbot): Raw HTTP response received from backend:", response);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (jsonErr) {
                console.warn("apiService (chatbot): Could not parse error response as JSON:", jsonErr);
            }
            console.error("apiService (chatbot): Backend returned non-OK HTTP status:", response.status, "Error data:", errorData);
            const errorMessage = errorData.message || errorData.error || response.statusText || 'Unknown HTTP error';
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
        }

        const data = await response.json();
        console.log("apiService (chatbot): Parsed JSON data from backend:", data);

        if (data.error === true) {
            console.error("apiService (chatbot): Backend reported an error (data.error is true):", data.errorMessage, data);
            throw new Error(`Backend Error: ${data.errorMessage || 'An unknown error occurred on the backend.'}`);
        }

        const botResponseContent = typeof data.paraphrasedContent === 'string'
            ? data.paraphrasedContent
            : 'No content received from AI.';

        console.log("apiService (chatbot): Successfully processed response. Content to display:", botResponseContent.substring(0, 50) + "...");
        return { success: true, content: botResponseContent, rawData: data };

    } catch (err) {
        console.error("apiService (chatbot): Error in sendMessageToChatbot service:", err);
        // Rethrow the error so calling component can handle it
        throw err;
    }
};


// const UPLOAD_ENDPOINT = "https://acebackendapi.vercel.app/api/upload-resume-file"; // <-- MUST point to your Vercel backend

// export const uploadFileToDrive = (file, userEmail, folderId, onProgress) => {
//     return new Promise(async (resolve, reject) => {
//         console.log("apiService (drive): Initiating file upload to Express.js backend (Base64 JSON request).");

//         if (!file) {
//             console.error("apiService (drive): Error - No file provided for upload.");
//             return reject(new Error("No file provided for upload."));
//         }
//         if (!folderId) {
//             console.error("apiService (drive): Error - Drive folder ID is missing. File cannot be uploaded without a destination.");
//             return reject(new Error("Drive folder ID is missing."));
//         }

//         console.log("apiService (drive): Reading file for Base64 encoding...");

//         const reader = new FileReader();
//         reader.readAsDataURL(file);

//         reader.onload = async () => {
//             const base64DataWithPrefix = reader.result;
//             const base64Data = base64DataWithPrefix.split(',')[1];

//             const requestBody = {
//                 base64Data: base64Data,
//                 fileName: file.name,
//                 mimeType: file.type,
//                 destinationFolderId: folderId,
//                 userEmail: userEmail, // Added userEmail to the requestBody as per previous examples
//             };

//             console.log("apiService (drive): Base64 data and payload prepared. Sending request to:", UPLOAD_ENDPOINT);
//             console.log("apiService (drive): File name:", file.name, "MIME Type:", file.type);

//             // REMOVED: No JWT token or Authorization header as per your request
//             const headers = {
//                 'Content-Type': 'application/json', // This is crucial for JSON body
//             };

//             try {
//                 const response = await axios.post(
//                     UPLOAD_ENDPOINT,
//                     requestBody, // Send JSON body
//                     {
//                         headers: headers,
//                         onUploadProgress: (progressEvent) => {
//                             if (progressEvent.lengthComputable) {
//                                 // Calculate progress based on the size of the JSON string
//                                 const totalSize = new TextEncoder().encode(JSON.stringify(requestBody)).length;
//                                 const percentCompleted = Math.round((progressEvent.loaded * 100) / totalSize);
//                                 if (typeof onProgress === 'function') {
//                                     onProgress(percentCompleted);
//                                 } else {
//                                     console.warn("onProgress is not a function in onUploadProgress callback.");
//                                 }
//                             }
//                         },
//                         validateStatus: (status) => true
//                     }
//                 );

//                 console.log("apiService (drive): Axios response received. HTTP Status:", response.status);
//                 const responseData = response.data;

//                 if (response.status >= 200 && response.status < 300) {
//                     console.log("apiService (drive): Upload successful. Parsed response data:", responseData);
//                     resolve(responseData);
//                 } else {
//                     console.error("apiService (drive): Upload failed. Server responded with status:", response.status, "Error data:", responseData);
//                     const error = new Error(responseData?.message || `Upload failed: Server error ${response.status}.`);
//                     error.statusCode = response.status;
//                     error.response = responseData;
//                     reject(error);
//                 }

//             } catch (err) {
//                 console.error("apiService (drive): Axios request failed:", err);
//                 if (err.response) {
//                     const error = new Error(err.response.data?.message || `Network error: Server responded with status ${err.response.status}.`);
//                     error.statusCode = err.response.status;
//                     error.response = err.response.data;
//                     reject(error);
//                 } else if (err.request) {
//                     console.error('apiService (drive): No response received from server:', err.request);
//                     reject(new Error('Network error: Could not connect to the server or server did not respond.'));
//                 } else {
//                     console.error('apiService (drive): Error setting up Axios request:', err.message);
//                     reject(new Error(`An unexpected client-side error occurred: ${err.message}`));
//                 }
//             }
//         };

//         reader.onerror = (error) => {
//             console.error("apiService (drive): FileReader error:", error);
//             reject(new Error("Failed to read file for upload."));
//         };
//     });
// };

/**
 * Fetches a list of supported document files from the user's OneDrive root folder.
 * Filters for PDF, DOC, DOCX, and TXT files.
 * This uses a Microsoft Graph Access Token, not your backend's JWT.
 *
 * @param {string} accessToken - The Microsoft Graph Access Token.
 * @returns {Promise<Array>} - A promise that resolves with an array of filtered OneDrive file objects.
 * @throws {Error} - Throws an error if the API call fails or the access token is invalid.
 */
export const fetchOneDriveDocuments = async (accessToken) => {
    console.log("apiService (onedrive): Initiating fetch for OneDrive documents.");
    if (!accessToken || accessToken === "YOUR_MICROSOFT_GRAPH_ACCESS_TOKEN_HERE" || accessToken.trim() === '') {
        const errMsg = "Microsoft Access Token not provided or is a placeholder. Cannot fetch OneDrive files.";
        console.error("apiService (onedrive): Error -", errMsg);
        throw new Error(errMsg);
    }

    try {
        console.log("apiService (onedrive): Sending request to Microsoft Graph API for root children.");
        const response = await fetch(`${MICROSOFT_GRAPH_ENDPOINT}/me/drive/root/children`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // This is Microsoft's Access Token
                'Content-Type': 'application/json'
            }
        });

        console.log("apiService (onedrive): Raw HTTP response received from OneDrive:", response);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (jsonErr) {
                console.warn("apiService (onedrive): Could not parse error response as JSON:", jsonErr);
            }
            console.error("apiService (onedrive): OneDrive API returned non-OK status:", response.status, "Error data:", errorData);
            throw new Error(`Failed to fetch OneDrive files: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log("apiService (onedrive): Parsed JSON data from OneDrive:", data);

        const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt'];

        const files = data.value.filter(item =>
            item.file &&
            item['@microsoft.graph.downloadUrl'] &&
            supportedExtensions.some(ext => item.name.toLowerCase().endsWith(ext))
        );

        if (files.length === 0) {
            console.warn("apiService (onedrive): No supported document files (.pdf, .doc, .docx, .txt) found in your OneDrive root.");
        }
        console.log("apiService (onedrive): Filtered OneDrive documents:", files);
        return files;
    } catch (err) {
        console.error("apiService (onedrive): Error in fetchOneDriveDocuments:", err);
        throw new Error(`Failed to fetch OneDrive documents: ${err.message}`);
    }
};

/**
 * Downloads the blob content of a specific OneDrive file.
 * This uses a Microsoft Graph Access Token, not your backend's JWT.
 *
 * @param {string} downloadUrl - The @microsoft.graph.downloadUrl property of the OneDrive file.
 * @param {string} accessToken - The Microsoft Graph Access Token.
 * @returns {Promise<Blob>} - A promise that resolves with the file's Blob data.
 * @throws {Error} - Throws an error if the download fails.
 */
export const downloadOneDriveFileBlob = async (downloadUrl, accessToken) => {
    console.log("apiService (onedrive): Initiating download of OneDrive file blob from URL:", downloadUrl);
    if (!downloadUrl) {
        console.error("apiService (onedrive): Error - Download URL for OneDrive file is missing.");
        throw new Error("Download URL for OneDrive file is missing.");
    }
    if (!accessToken || accessToken.trim() === '') {
        console.error("apiService (onedrive): Error - Microsoft Access Token is required to download file.");
        throw new Error("Microsoft Access Token is required to download file.");
    }

    try {
        const response = await fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // This is Microsoft's Access Token
            },
        });

        console.log("apiService (onedrive): Raw HTTP response received for blob download:", response);

        if (!response.ok) {
            console.error("apiService (onedrive): Error downloading file from OneDrive. Status:", response.status, "Text:", response.statusText);
            throw new Error(`Error downloading file from OneDrive: ${response.status} ${response.statusText}`);
        }

        const fileBlob = await response.blob();
        console.log("apiService (onedrive): OneDrive file blob downloaded successfully. Blob size:", fileBlob.size, "bytes.");
        return fileBlob;
    } catch (err) {
        console.error("apiService (onedrive): Error in downloadOneDriveFileBlob:", err);
        throw new Error(`Failed to download OneDrive file: ${err.message}`);
    }
};

/**
 * Uploads a file (blob) to your custom backend endpoint.
 * This is distinct from the OneDrive API calls, but is part of the OneDrive upload flow.
 * This endpoint requires a JWT token for authorization.
 *
 * @param {Blob} fileBlob - The blob data of the file.
 * @param {string} fileName - The original name of the file.
 * @param {string} originalOneDriveId - The ID of the file in OneDrive.
 * @param {string} jwtToken - The JWT token for authorization.
 * @param {function} onProgress - Callback function for upload progress (receives percentage).
 * @returns {Promise<Object>} - A promise that resolves with the API response data from your backend.
 * @throws {Error} - Throws an error if the backend upload fails.
 */
export const uploadBlobToBackend = (fileBlob, fileName, originalOneDriveId, jwtToken, onProgress) => {
    return new Promise((resolve, reject) => {
        console.log("apiService (onedrive): Initiating upload of blob to custom backend endpoint:", ONEDRIVE_BACKEND_UPLOAD_ENDPOINT);
        if (!fileBlob) {
            console.error("apiService (onedrive): Error - No file blob provided for backend upload.");
            return reject(new Error("No file blob provided for backend upload."));
        }
        if (!fileName) {
            console.error("apiService (onedrive): Error - File name is missing for backend upload.");
            return reject(new Error("File name is missing for backend upload."));
        }
        // Use the common token validation logic
        if (!jwtToken || jwtToken === 'null' || jwtToken === 'undefined' || jwtToken.trim() === '') {
            console.error("apiService (onedrive): Error - Authentication token is missing or invalid for backend upload.");
            return reject(new Error("Authentication token is required for this operation."));
        }

        const formData = new FormData();
        formData.append('file', fileBlob, fileName);
        formData.append('originalOneDriveId', originalOneDriveId); // Include original OneDrive ID

        console.log("apiService (onedrive): FormData prepared for backend upload. File name:", fileName);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', ONEDRIVE_BACKEND_UPLOAD_ENDPOINT, true); // Use the dedicated OneDrive backend upload endpoint
        xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`); // Set your backend's JWT

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            console.log("apiService (onedrive): XHR onload for backend upload triggered. Status:", xhr.status);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    console.log("apiService (onedrive): Backend upload successful. Parsed responseData:", responseData);
                    resolve(responseData);
                } catch (e) {
                    console.error("apiService (onedrive): Failed to parse backend upload response JSON:", e, "Raw response:", xhr.responseText);
                    reject(new Error('Backend upload succeeded, but could not parse server response.'));
                }
            } else {
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    console.error("apiService (onedrive): Backend upload failed with server error:", xhr.status, "Error data:", errorData);
                    reject(new Error(errorData.message || `Backend upload failed: Server error ${xhr.status}.`));
                } catch (e) {
                    console.error('apiService (onedrive): Failed to parse backend error response JSON:', e, "Raw response:", xhr.responseText);
                    reject(new Error(`Backend upload failed: Server error ${xhr.status}. Check console for details.`));
                }
            }
        };

        xhr.onerror = () => {
            console.error('apiService (onedrive): Network error during backend upload. XHR object:', xhr);
            reject(new Error('Network error: Could not connect to the backend server.'));
        };

        xhr.send(formData);
        console.log("apiService (onedrive): XHR request sent for backend upload.");
    });
};

/**
 * Sends a request to the ATS score checker API.
 * This endpoint requires a JWT token.
 *
 * @param {File} file - The resume PDF file to upload.
 * @param {string} email - The user's email.
 * @param {boolean} deepCheck - Whether to perform a deep AI check.
 * @param {boolean} includeJD - Whether to include job description for matching.
 * @param {string} jobTitle - The job title (if includeJD is true).
 * @param {string} jobDescription - The job description (if includeJD is true).
 * @param {string} token - The user authentication token (JWT).
 * @returns {Promise<Object>} The API response data.
 * @throws {Error} If the API call fails or returns an unexpected response.
 */
export const checkAtsScore = async (
    file,
    email,
    deepCheck,
    includeJD,
    jobTitle,
    jobDescription,
    token
) => {
    console.log("apiService (ats): Initiating ATS score check.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    formData.append("deepCheck", deepCheck);

    if (includeJD) {
        formData.append("jobTitle", jobTitle.trim());
        formData.append("jobDescription", jobDescription.trim());
        console.log("apiService (ats): Including Job Description for ATS check.");
    }

    try {
        const authHeaders = createAuthHeaders(token); // Only contains Authorization

        console.log("apiService (ats): Sending request to " + ATS_CHECKER_SCORE_ENDPOINT);
        const res = await axios.post(
            ATS_CHECKER_SCORE_ENDPOINT,
            formData,
            {
                headers: authHeaders, // <--- MODIFIED: Axios handles Content-Type for FormData automatically
            }
        );

        console.log("apiService (ats): Raw Axios response object:", res);
        console.log("apiService (ats): Parsed ATS score response data:", res.data);

        if (res.data) {
            console.log("apiService (ats): ATS score check successful.");
            return res.data;
        } else {
            console.error("apiService (ats): Empty response data received from ATS server.");
            throw new Error("Empty response from server.");
        }
    } catch (err) {
        console.error("apiService (ats): API Call Error during ATS score check:", err.response || err.message);
        // Rethrow the error so calling component can handle it more specifically
        throw err;
    }
};

/**
 * Sends a resume file to the backend for content extraction.
 * This endpoint requires a JWT token.
 *
 * @param {File} file - The resume PDF/DOC/DOCX file to upload.
 * @param {string} token - User authentication token (JWT).
 * @returns {Promise<Object>} The API response data containing the extracted content.
 * @throws {Error} If the file is invalid, too large, or the API call fails.
*/
export const extractResumeContent = async (file, token) => {
    console.log("apiService (ats): Initiating resume content extraction.");
    if (!file) {
        console.error("apiService (ats): Error - No file selected for extraction.");
        throw new Error("No file selected for extraction.");
    }

    // Client-side file size validation
    if (file.size > MAX_FILE_SIZE_KB * 1024) {
        const errMsg = `File size exceeds ${MAX_FILE_SIZE_KB}KB limit. Please upload a smaller file.`;
        console.error("apiService (ats): Error -", errMsg);
        throw new Error(errMsg);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const authHeaders = createAuthHeaders(token); // Only contains Authorization

        console.log(`apiService (ats): Attempting to extract content from file: ${file.name} (Size: ${file.size} bytes)`);

        const response = await axios.post(ATS_CHECKER_EXTRACT_ENDPOINT, formData, {
            headers: authHeaders, // <--- MODIFIED: Axios handles Content-Type for FormData automatically
        });
        console.log("apiService (ats): Raw Axios response object for extraction:", response);
        console.log("apiService (ats): Extraction successful, parsed response data:", response.data);
        return response.data;
    } catch (err) {
        console.error("apiService (ats): API Call Error during resume extraction:", err.response || err.message);
        // Rethrow the error so calling component can handle it more specifically
        throw err;
    }
};
// src/utils/apiconfig.js


// WARNING: Storing PATs directly in frontend code is INSECURE for production.
// This is for demonstration/testing purposes only.
// // In a real application, these should be stored on a secure backend.
// export const GITHUB_PAT_MAP = {
//     // IMPORTANT: Replace these placeholder values with your actual GitHub Personal Access Tokens
//     "ashmeet07": "YOUR_ASHMEET07_PAT",
//     "himanshusahu-07": "YOUR_HIMANSHUSAHU07_PAT",
//     "vishal6268": "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",
//     // Fallback to an environment variable token if available, or leave empty if none
//     "default": import.meta.env.REACT_APP_GITHUB_GRAPHQL_TOKEN || "",
// };

/**
 * Returns an array of all available GitHub PATs from the map.
 * This can be used for token rotation/retry logic.
 * Prioritizes explicitly defined user PATs, then the default.
 */
// src/utils/apiconfig.js

// ... (Rest of getAllGithubPats and GITHUB_PAT_MAP from apiconfig.js remains the same)
// Note: In a real app, apiconfig.js might be better for getAllGithubPats,
// but for simplicity, keeping it here for now with the service functions.
const GITHUB_PAT_MAP = {
    ashmeet07: "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",
};

export const getAllGithubPats = () => {
    const pats = [];
    for (const username in GITHUB_PAT_MAP) {
        if (GITHUB_PAT_MAP[username]) {
            pats.push(GITHUB_PAT_MAP[username]);
        }
    }
    const envPat = import.meta.env.VITE_REACT_APP_GITHUB_GRAPHQL_TOKEN;
    if (envPat && !pats.includes(envPat)) {
        pats.push(envPat);
    }
    return [...new Set(pats)];
};
/**
 * Calls the backend API to convert HTML content to a PDF and returns the PDF's download URL.
 * This endpoint requires a JWT token for authorization.
 *
 * @param {string} htmlContent The full HTML string to be converted.
 * @param {object} pdfOptions Options for PDF generation (orientation, page_size, margins).
 * @param {string} token - The JWT token for authorization.
 * @returns {Promise<string>} A promise that resolves with the PDF download URL.
 * @throws {Error} Throws an error if the API call fails or no URL is returned.
 */
export const generatePdfFromHtml = async (htmlContent, pdfOptions) => {
    console.log("apiService (pdf): Initiating HTML to PDF conversion.");

    try {
        const headers = { // <--- MODIFIED: Set Content-Type specifically for JSON payload
            'Content-Type': 'application/json',
        };

        const payload = {
            htmlContent,
            pdfOptions: pdfOptions || {
                orientation: "portrait",
                page_size: "A4",
                margin_top: "1in",
                margin_right: "1in",
                margin_bottom: "1in",
                margin_left: "1in",
            },
        };

        console.log("apiService (pdf): Sending conversion request to:", MY_BACKEND_PDF_CONVERT_URL);
        const response = await fetch(MY_BACKEND_PDF_CONVERT_URL, {
            method: 'POST',
            headers: headers, // Use the headers which now include Content-Type
            body: JSON.stringify(payload),
        });

        console.log("apiService (pdf): Raw HTTP response from PDF conversion backend:", response);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (jsonErr) {
                console.warn("apiService (pdf): Could not parse error response as JSON:", jsonErr);
            }
            console.error("apiService (pdf): PDF backend returned non-OK status:", response.status, "Error data:", errorData);
            throw new Error(`PDF Conversion Error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log("apiService (pdf): Parsed JSON data from PDF conversion:", data);

        if (data.pdfUrl) {
            console.log("apiService (pdf): PDF conversion successful. Download URL:", data.pdfUrl);
            return data.pdfUrl;
        } else {
            console.error("apiService (pdf): PDF conversion response missing pdfUrl:", data);
            throw new Error("PDF conversion failed: No PDF URL received.");
        }
    } catch (err) {
        console.error("apiService (pdf): Error in generatePdfFromHtml service:", err);
        // Rethrow the error so calling component can handle it
        throw err;
    }
};

/**
 * Deletes a user account from the backend.
 * This endpoint requires a JWT token for authentication.
 *
 * @param {string} email - The email of the account to delete.
 * @param {string} firebaseUid - The Firebase UID associated with the account. (Backend currently doesn't use this directly but good to pass if Firebase is involved)
 * @param {string} token - The authentication token (e.g., Bearer token).
 * @returns {Promise<string>} - A promise that resolves with a success message or rejects with an error.
 */
export const deleteUserAccount = async (email, firebaseUid, token) => {
    try {
        // NOTE: USER_SERVICE_BASE_URL was not defined in the provided code snippets.
        // Assuming it's related to BACKEND_BASE_URL for user services.
        // You might need to define `USER_SERVICE_BASE_URL` at the top of your file.
        // For example: `const USER_SERVICE_BASE_URL = `${BACKEND_BASE_URL}/users`;`
        const headers = { // <--- MODIFIED: Set Content-Type specifically for JSON payload
            'Content-Type': 'application/json',
            ...createAuthHeaders(token)
        };

        const response = await fetch(`${USER_SERVICE_BASE_URL}/delete`, {
            method: 'DELETE',
            headers: headers, // Use the headers which now include Content-Type
            body: JSON.stringify({ email, firebaseUid }), // Send both if backend expects
        });

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        let responseData = {};
        // Only attempt to parse JSON if content-type is JSON and response is not 204 No Content, and has content
        if (isJson && response.status !== 204 && response.headers.get('content-length') !== '0') {
            try {
                responseData = await response.json();
            } catch (jsonError) {
                console.error("Frontend: Error parsing JSON response:", jsonError);
                // If JSON parsing fails, try to read as text to get raw error for debugging
                const rawText = await response.text();
                throw new Error(`Server returned invalid JSON. Raw response: ${rawText || 'Empty or malformed response'}`);
            }
        } else if (!response.ok && response.status !== 204) {
            // For non-OK non-204 responses that aren't JSON, get raw text error
            const rawText = await response.text();
            throw new Error(`Server error (${response.status}): ${rawText || response.statusText}`);
        }

        if (!response.ok) {
            // If the response was not OK (e.g., 4xx, 5xx status)
            const errorMessage = responseData.message || responseData.error || `Failed to delete account. Status: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // If deletion was successful (e.g., 200 OK with message, or 204 No Content)
        // Backend sends {"status": "success", "message": "..."}
        return responseData.message || "Account deleted successfully!";

    } catch (error) {
        console.error("Frontend: Error in deleteUserAccount API service:", error.message);
        throw error; // Re-throw the enhanced error for the component to handle
    }
};


const API_BASE_URL = "https://api.techquanta.tech/ace"; // Base URL for your API

/**
 * Fetches files data from the backend.
 * @param {object} userData - Object containing user email, drive folder ID, and auth token.
 * @param {string} userData.userEmail
 * @param {string} userData.driveFolderId
 * @param {string} userData.authToken
 * @param {'WEBSITE'|'GOOGLE'} authProvider - The authentication provider (e.g., 'WEBSITE' for local, 'GOOGLE' for Drive).
 * @returns {Promise<object>} - A promise that resolves to an object containing files, currentStorageUsageMb, success status, or error message.
 */
export const fetchFilesData = async ({ userEmail, driveFolderId, authToken, authProvider }) => {
    try {
        if (!userEmail || !driveFolderId || !authToken) {
            return {
                success: false,
                message: "User information or authentication token unavailable for file fetch.",
                files: [],
                currentStorageUsageMb: 0,
            };
        }

        const endpoint = authProvider === 'WEBSITE' ? `${API_BASE_URL}/local/files` : `${API_BASE_URL}/drive/files`;

        console.log(`[apiService] Fetching files from: ${endpoint} for ${userEmail}`);

        const response = await axios.post(endpoint, {
            userEmail: userEmail,
            folderId: driveFolderId,
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.data.success) {
            console.log("[apiService] Files fetched successfully.");
            return {
                success: true,
                files: response.data.files,
                currentStorageUsageMb: response.data.currentStorageUsageMb,
                message: "Files fetched successfully."
            };
        } else {
            console.error("[apiService] Backend reported an error:", response.data.message);
            return {
                success: false,
                message: response.data.message || "Failed to retrieve files.",
                files: [],
                currentStorageUsageMb: 0,
            };
        }
    } catch (err) {
        console.error("[apiService] An unexpected error occurred during file fetch:", err.message, err.response?.data);
        return {
            success: false,
            message: err.response?.data?.message || "An unexpected network error occurred while fetching files.",
            files: [],
            currentStorageUsageMb: 0,
        };
    }
};

/**
 * Handles actions (download, delete, etc.) on a file.
 * @param {string} action - The action to perform (e.g., 'download', 'delete').
 * @param {object} fileData - Object containing file-specific data.
 * @param {string} fileData.mongoFileId - For 'WEBSITE' provider files.
 * @param {string} fileData.driveFileId - For 'GOOGLE' provider files.
 * @param {string} fileData.fileName
 * @param {string} fileData.webViewLink (optional, for 'open' action)
 * @param {object} userData - User session data.
 * @param {string} userData.userEmail
 * @param {string} userData.authToken
 * @param {'WEBSITE'|'GOOGLE'} userData.authProvider
 * @returns {Promise<object>} - A promise that resolves to an object with success status and message.
 */
export const handleFileAction = async (action, fileData, userData) => {
    const { userEmail, authToken, authProvider } = userData;
    // Destructure mongoFileId as well, as it's needed for WEBSITE provider files
    const { mongoFileId, driveFileId, fileName, webViewLink } = fileData;

    if (!userEmail || !authToken) {
        return { success: false, message: "Authentication required or token missing." };
    }

    // Your backend likely expects different endpoints for 'WEBSITE' vs 'GOOGLE' files.
    // For 'delete', we'll use the specific endpoint you provided.
    // Ensure API_BASE_URL is correctly imported/defined in this file
    const API_BASE_URL = 'https://api.techquanta.tech/ace'; // Or wherever your base API URL is defined
    const DELETE_ENDPOINT = `${API_BASE_URL}/drive/delete`; // The specific delete endpoint you provided

    const headers = { 'Authorization': `Bearer ${authToken}` };

    try {
        switch (action) {
            case "open":
                if (authProvider === 'WEBSITE') {
                    return { success: false, message: "This file is stored locally and does not have a direct web view link.", type: "info" };
                }
                if (webViewLink) {
                    window.open(webViewLink, '_blank');
                    return { success: true, message: "File opened in new tab." };
                } else {
                    return { success: false, message: "This file does not have a direct web view link.", type: "info" };
                }
            case "download":
                console.log(`[apiService] Initiating download for ${fileName} (${driveFileId || mongoFileId})`);
                const downloadBaseUrl = authProvider === 'WEBSITE' ? `${API_BASE_URL}/local` : `${API_BASE_URL}/drive`;
                const fileIdentifierForDownload = authProvider === 'WEBSITE' ? mongoFileId : driveFileId;

                if (!fileIdentifierForDownload) {
                    return { success: false, message: "File ID missing for download." };
                }

                const downloadResponse = await fetch(`${downloadBaseUrl}/download/${fileIdentifierForDownload}?userEmail=${encodeURIComponent(userEmail)}`, { headers });

                if (!downloadResponse.ok) {
                    const errorText = await downloadResponse.text();
                    throw new Error(`Failed to download: ${downloadResponse.status} - ${errorText}`);
                }

                const blob = await downloadResponse.blob();
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                const contentDisposition = downloadResponse.headers.get('content-disposition');
                let downloadedFileName = fileName;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*?)['"]?$/i);
                    if (filenameMatch && filenameMatch[1]) {
                        downloadedFileName = decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
                    }
                }
                link.setAttribute('download', downloadedFileName);

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(link.href);

                return { success: true, message: `"${downloadedFileName}" download started.`, type: "success" };

            case "delete":
                console.log(`[apiService] Deleting file ${fileName} (ID: ${driveFileId || mongoFileId})`);

                // Determine which file ID to send based on authProvider
                const fileIdToDelete = authProvider === 'WEBSITE' ? mongoFileId : driveFileId;

                if (!fileIdToDelete) {
                    return { success: false, message: "File ID is missing for deletion." };
                }

                try {
                    // Use axios.delete with the data property for the request body
                    const deleteResponse = await axios.delete(DELETE_ENDPOINT, {
                        data: { // Data sent in the request body
                            userEmail: userEmail,
                            fileId: fileIdToDelete // Send the appropriate ID
                        },
                        headers: headers, // Headers like Authorization
                    });

                    // Check if the backend explicitly indicates success
                    if (deleteResponse.data.success) {
                        return {
                            success: true,
                            message: `${fileName} deleted successfully!`,
                            currentStorageUsageMb: deleteResponse.data.currentStorageUsageMb // Include updated storage if provided by backend
                        };
                    } else {
                        // If backend explicitly sends success: false, use its message
                        return {
                            success: false,
                            message: deleteResponse.data.message || `Failed to delete ${fileName}.`
                        };
                    }
                } catch (deleteError) {
                    // Handle network errors or non-2xx HTTP responses from the server
                    console.error(`[apiService] Delete error for ${fileName}:`, deleteError.response?.data || deleteError.message);
                    return {
                        success: false,
                        message: deleteError.response?.data?.message || `An unexpected error occurred while trying to delete ${fileName}.`
                    };
                }

            case "replicate":
                // For replicate, you typically just need the file data to open a modal
                return { success: true, message: "Replication initiated." };
            case "permission":
                if (authProvider === 'WEBSITE') {
                    return { success: false, message: "Permission changes are not available for locally stored files.", type: "info" };
                }
                return { success: true, message: "Permission modal opened." };
            case "export":
                if (authProvider === 'WEBSITE') {
                    return { success: false, message: "Export functionality is not available for locally stored files in this manner.", type: "info" };
                }
                return { success: true, message: "Export modal opened." };
            default:
                return { success: false, message: "Unknown action." };
        }
    } catch (err) {
        // This catch block handles errors for actions other than 'delete' if they use `fetch`
        // or general errors not caught by specific action blocks.
        console.error(`[apiService] General error performing ${action} on file:`, err.message, err.response?.data);
        return {
            success: false,
            message: err.response?.data?.message || `An unexpected error occurred while trying to ${action} ${fileName}.`,
        };
    }
};
// You can add more API functions here for other operations (e.g., upload, rename, etc.)
// For instance:
/*
export const uploadFile = async (formData, userData) => {
    const { userEmail, authToken, authProvider, driveFolderId } = userData;
    // ... API call logic for upload
};

export const renameFile = async (fileId, newName, userData) => {
    const { userEmail, authToken, authProvider } = userData;
    // ... API call logic for rename
};
*/
// src/utils/templateApi.js
// frontend-react-app/src/utils/api.js

// IMPORTANT: Ensure this matches your Express.js backend's URL and the correct endpoint
// For local development, this would be your backend's URL (e.g., http://localhost:3000)
// For Vercel/production, this would be your deployed backend's URL.
// frontend-react-app/src/utils/api.js

// const REPLICATE_ENDPOINT = "/api/replicate-drive-file";

// export const replicateTemplate = async (requestData) => {
//   try {
//     const response = await fetch(`https://acebackendapi.vercel.app${REPLICATE_ENDPOINT}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       const error = new Error(data.message || `API error: ${response.status} ${response.statusText}`);
//       error.statusCode = response.status;
//       error.response = data;
//       throw error;
//     }

//     return data;
//   } catch (err) {
//     console.error("Error in replicateTemplate API call:", err);
//     throw err;
//   }
// };
// utils/apiconfig.js


// apiconfig.js


// src/utils/apiconfig.js

const UPLOAD_ENDPOINT = "https://acebackendapi.vercel.app/api/upload-resume-file";
const REPLICATE_ENDPOINT_BASE_URL = "https://acebackendapi.vercel.app"; // Base URL for replication

// Changed parameter order to match frontend calling convention (file, userEmail, userId, ...)
export const uploadFileToDrive = (file, userEmail, userId, folderId, onProgress) => {
    return new Promise(async (resolve, reject) => {
        console.log("apiService (drive): Initiating file upload to Express.js backend (Base64 JSON request).");

        if (!file) {
            console.error("apiService (drive): Error - No file provided for upload.");
            return reject(new Error("No file provided for upload."));
        }
        if (!folderId) {
            console.error("apiService (drive): Error - Drive folder ID is missing. File cannot be uploaded without a destination.");
            return reject(new Error("Drive folder ID is missing."));
        }
        if (!userId) {
            console.error("apiService (drive): Error - User ID is missing for upload.");
            return reject(new Error("User ID is required for file upload."));
        }

        // --- IMPORTANT: Validate MIME type on the client side as a first check ---
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];

        // ADDED/CONFIRMED CONSOLE LOG HERE:
        console.log(`[apiconfig] Debug: file.type (from browser File object): '${file.type}'`);
        console.log(`[apiconfig] Debug: Allowed MIME types for client-side validation:`, allowedMimeTypes);


        if (!allowedMimeTypes.includes(file.type)) {
            console.error(`apiService (drive): Error - File type '${file.type}' not allowed by client-side validation.`);
            return reject(new Error("File type not allowed. Only PDF, DOC, and DOCX files are accepted."));
        }
        // --- END Client-side MIME type validation ---


        console.log("apiService (drive): Reading file for Base64 encoding...");

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64DataWithPrefix = reader.result;
            const base64Data = base64DataWithPrefix.split(',')[1];

            const requestBody = {
                userId: userId,
                email: userEmail,
                base64Data: base64Data,
                fileName: file.name,
                mimeType: file.type, // This is the mimeType being sent
                fileSize: file.size,
                destinationFolderId: folderId,
            };

            console.log("apiService (drive): Base64 data and payload prepared. Sending request to:", UPLOAD_ENDPOINT);
            console.log("apiService (drive): File name:", file.name, "MIME Type (from File object):", file.type, "File Size:", file.size);
            // ADDED CONSOLE LOG HERE TO CONFIRM WHAT'S IN THE REQUEST BODY:
            console.log(`[apiconfig] Debug: MIME Type in requestBody sent to backend: '${requestBody.mimeType}'`);


            const headers = {
                'Content-Type': 'application/json',
            };

            try {
                const response = await axios.post(
                    UPLOAD_ENDPOINT,
                    requestBody,
                    {
                        headers: headers,
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.lengthComputable) {
                                const totalSize = new TextEncoder().encode(JSON.stringify(requestBody)).length;
                                const percentCompleted = Math.round((progressEvent.loaded * 100) / totalSize);
                                if (typeof onProgress === 'function') {
                                    onProgress(percentCompleted);
                                } else {
                                    console.warn("onProgress is not a function in onUploadProgress callback.");
                                }
                            }
                        },
                        validateStatus: (status) => true
                    }
                );

                console.log("apiService (drive): Axios response received. HTTP Status:", response.status);
                const responseData = response.data;

                if (responseData.status === 'success') { // Changed condition to check responseData.status
                    console.log("apiService (drive): Upload successful. Parsed response data:", responseData);
                    resolve(responseData);
                } else {
                    console.error("apiService (drive): Upload failed. Server responded with status:", response.status, "Error data:", responseData);
                    const error = new Error(responseData?.message || `Upload failed: Server error ${response.status}.`);
                    error.statusCode = response.status;
                    error.response = responseData;
                    reject(error);
                }

            } catch (err) {
                console.error("apiService (drive): Axios request failed:", err);
                if (err.response) {
                    const error = new Error(err.response.data?.message || `Network error: Server responded with status ${err.response.status}.`);
                    error.statusCode = err.response.status;
                    error.response = err.response.data;
                    reject(error);
                } else if (err.request) {
                    console.error('apiService (drive): No response received from server:', err.request);
                    reject(new Error('Network error: Could not connect to the server or server did not respond.'));
                } else {
                    console.error('apiService (drive): Error setting up Axios request:', err.message);
                    reject(new Error(`An unexpected client-side error occurred: ${err.message}`));
                }
            }
        };

        reader.onerror = (error) => {
            console.error("apiService (drive): FileReader error:", error);
            reject(new Error("Failed to read file for upload."));
        };
    });
};
export const replicateTemplate = async (requestData) => { // requestData already contains newFileName, sourceFileId, destinationFolderId, etc.
  try {
    // requestData should already contain the userId from the component
    // Example: { userId: '...', sourceFileId: '...', destinationFolderId: '...', newFileName: '...' }
    if (!requestData.userId) { // New validation for userId
        throw new Error("User ID is required for template replication.");
    }
    
    console.log("apiService (replicate): Sending replication request with payload:", requestData);
    const response = await fetch(`${REPLICATE_ENDPOINT_BASE_URL}/api/replicate-drive-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `API error: ${response.status} ${response.statusText}`);
      error.statusCode = response.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in replicateTemplate API call:", err);
    throw err;
  }
};


const BASE_URL = "https://api.techquanta.tech";

// /**
//  * Renames a file.
//  * @param {string} userEmail - The email of the user performing the action.
//  * @param {string} fileId - The ID of the file to rename.
//  * @param {string} newFileName - The new name for the file.
//  * @param {string} userAuthProvider - The authentication provider ('WEBSITE' or other).
//  * @returns {Promise<object>} The response data from the API.
//  */
// export const renameFile = async (userEmail, fileId, newFileName, userAuthProvider) => {
//     const endpoint = userAuthProvider === 'WEBSITE' ? `${BASE_URL}/local/rename` : `${BASE_URL}/drive/rename`;
//     const response = await axios.post(endpoint, {
//         userEmail: userEmail,
//         fileId: fileId,
//         newFileName: newFileName,
//     });
//     return response.data;
// };

/**
 * Updates permissions for a file.
 * @param {string} userEmail - The email of the user performing the action.
 * @param {string} fileId - The ID of the file to update permissions for.
 * @param {string} targetEmail - The email of the user whose permissions are being changed.
 * @param {string} selectedPermissionOption - The selected permission option (e.g., 'reader', 'writer', 'remove_all').
 * @returns {Promise<object>} The response data from the API.
 */
export const updateFilePermission = async (userEmail, fileId, targetEmail, selectedPermissionOption) => {
    const action = selectedPermissionOption === "remove_all" ? "remove" : "add";
    const role = selectedPermissionOption;

    const payload = {
        userEmail: userEmail,
        fileId: fileId,
        targetEmail: targetEmail.trim(),
        action: action,
        role: role,
    };
    const response = await axios.post(`${BASE_URL}/drive/update-permission`, payload);
    return response.data;
};

/**
 * Initiates a direct download or export of a file from Google Drive.
 * This function constructs the download URL and triggers the download in the browser.
 * It handles both direct downloads for non-Google files and exports for Google Workspace files.
 * @param {object} file - The file object containing details like driveFileId, fileName, fileMimeType, and thumbnailLink.
 * @param {object | null} selectedFormat - For Google Workspace files, an object { mimeType, extension } specifying the desired export format. Null for direct download of non-Google files.
 * @returns {object} An object indicating success and a message, or null if fileId is missing.
 */
export const initiateFileDownload = (file, selectedFormat = null) => {
    if (!file || !file.driveFileId) {
        return { success: false, message: "File ID is missing for direct download." };
    }

    let downloadUrl = `https://drive.google.com/uc?export=download&id=${file.driveFileId}`;
    let suggestedFileName = file.fileName;

    const GOOGLE_WORKSPACE_EXPORT_OPTIONS = {
        "application/vnd.google-apps.document": [
            { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
            { label: "Microsoft Word", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" },
            { label: "OpenDocument Text", mimeType: "application/vnd.oasis.opendocument.text", extension: "odt" },
            { label: "Rich Text Format", mimeType: "application/rtf", extension: "rtf" },
            { label: "Plain Text", mimeType: "text/plain", extension: "txt" },
            { label: "Web Page", mimeType: "application/zip", extension: "zip" },
            { label: "EPUB Publication", mimeType: "application/epub+zip", extension: "epub" },
        ],
        "application/vnd.google-apps.spreadsheet": [
            { label: "Microsoft Excel", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" },
            { label: "OpenDocument Sheet", mimeType: "application/vnd.oasis.opendocument.spreadsheet", extension: "ods" },
            { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
            { label: "Comma Separated Values", mimeType: "text/csv", extension: "csv" },
            { label: "Tab Separated Values", mimeType: "text/tab-separated-values", extension: "tsv" },
            { label: "Web Page", mimeType: "application/zip", extension: "zip" },
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

    const isGoogleWorkspaceFile = !!GOOGLE_WORKSPACE_EXPORT_OPTIONS[file.fileMimeType];

    if (isGoogleWorkspaceFile && selectedFormat) {
        downloadUrl += `&mimeType=${selectedFormat.mimeType}`;
        const baseName = file.fileName.includes('.')
            ? file.fileName.substring(0, file.fileName.lastIndexOf('.'))
            : file.fileName;
        suggestedFileName = `${baseName}.${selectedFormat.extension}`;
    } else {
        if (!suggestedFileName.includes('.') && file.fileMimeType) {
            if (file.fileMimeType.includes('image/jpeg')) suggestedFileName += '.jpeg';
            else if (file.fileMimeType.includes('image/png')) suggestedFileName += '.png';
            else if (file.fileMimeType.includes('application/pdf')) suggestedFileName += '.pdf';
        }
    }

    try {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = suggestedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return { success: true, message: `"${suggestedFileName}" download initiated.`, fileName: suggestedFileName };
    } catch (error) {
        console.error("Direct download failed:", error);
        return { success: false, message: "Failed to initiate download. Please ensure you have access to the file and your browser allows downloads." };
    }
};

// src/services/fileApiService.js

// Define your API base URL. It's often good to put this in an environment variable.
// For now, we'll keep the hardcoded value from your original file.

/**
 * Renames a file on the backend.
 * @param {string} fileId - The ID of the file to rename (Drive ID or Mongo ID).
 * @param {string} newFileName - The new name for the file.
 * @param {string} userEmail - The email of the authenticated user.
 * @param {string} authToken - The authentication token.
 * @param {'WEBSITE'|'GOOGLE'} authProvider - The authentication provider (determines local vs. Drive endpoint).
 * @returns {Promise<object>} - A promise that resolves with the API response data.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const renameFile = async (fileId, newFileName, userEmail, authToken, authProvider) => {
    const endpoint = authProvider === 'WEBSITE' ? `${API_BASE_URL}/local/rename` : `${API_BASE_URL}/drive/rename`;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    const payload = {
        userEmail: userEmail,
        fileId: fileId,
        newFileName: newFileName,
    };

    try {
        const response = await axios.post(endpoint, payload, { headers });
        return response.data;
    } catch (error) {
        // Re-throw the error so the calling component can handle it
        throw error;
    }
};

/**
 * Updates permissions for a Google Drive file.
 * @param {string} fileId - The Drive ID of the file.
 * @param {string} targetEmail - The email of the user whose permissions are being changed.
 * @param {'add'|'remove'} action - 'add' to grant permission, 'remove' to revoke all permissions.
 * @param {'reader'|'writer'|'commenter'|'owner'|null} role - The role to assign if action is 'add'. Null if action is 'remove'.
 * @param {string} userEmail - The email of the authenticated user.
 * @param {string} authToken - The authentication token.
 * @returns {Promise<object>} - A promise that resolves with the API response data.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const updateFilePermissions = async (fileId, targetEmail, action, role, userEmail, authToken) => {
    const endpoint = `${API_BASE_URL}/drive/update-permission`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    const payload = {
        userEmail: userEmail,
        fileId: fileId,
        targetEmail: targetEmail.trim(),
        action: action,
    };
    if (action === 'add') {
        payload.role = role;
    }

    try {
        const response = await axios.post(endpoint, payload, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Initiates a file download directly from Google Drive.
 * This function constructs the Google Drive direct download URL and triggers the download.
 * It does not involve your backend API for the actual file transfer.
 * @param {string} driveFileId - The Google Drive file ID.
 * @param {string} fileName - The original file name.
 * @param {string} fileMimeType - The MIME type of the file.
 * @param {object | null} selectedFormat - Optional: { mimeType, extension } for Google Workspace exports.
 * @param {object} googleWorkspaceExportOptions - The mapping for Google Workspace export formats.
 * @returns {object} - An object with `success: true` and `suggestedFileName`, `mimeType` of the downloaded file.
 */
export const initiateDriveFileDownload = (
    driveFileId,
    fileName,
    fileMimeType,
    selectedFormat = null,
    googleWorkspaceExportOptions // Pass the options from the component
) => {
    let downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
    let suggestedFileName = fileName;

    const isGoogleWorkspaceFile = !!googleWorkspaceExportOptions[fileMimeType];

    if (isGoogleWorkspaceFile && selectedFormat) {
        downloadUrl += `&mimeType=${selectedFormat.mimeType}`;
        const baseName = fileName.includes('.')
            ? fileName.substring(0, fileName.lastIndexOf('.'))
            : fileName;
        suggestedFileName = `${baseName}.${selectedFormat.extension}`;
    } else {
        // For non-Google Workspace files, or if no specific format is selected
        // Add a default extension if missing based on MIME type
        if (!suggestedFileName.includes('.') && fileMimeType) {
            if (fileMimeType.includes('image/jpeg')) suggestedFileName += '.jpeg';
            else if (fileMimeType.includes('image/png')) suggestedFileName += '.png';
            else if (fileMimeType.includes('application/pdf')) suggestedFileName += '.pdf';
            // Add more common types if needed
        }
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = suggestedFileName; // Suggests the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return { success: true, suggestedFileName: suggestedFileName, mimeType: selectedFormat ? selectedFormat.mimeType : fileMimeType };
};