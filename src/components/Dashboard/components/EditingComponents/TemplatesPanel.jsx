// src/App.jsx (or src/TemplatePanel.jsx, renamed for clarity in this example)
import React, { useState, useEffect } from 'react';
import TemplateGallery from './components/Upload/TemplateGallery'; // Renamed to clarify its role
import UserDocumentsPanel from './components/Upload/UserDocumentsPanel'; // New component
import { useUserSession } from '../../../../hooks/useUserSession'; // Your custom hook
import { useRecoilValue } from 'recoil';
import { filesErrorState } from '../../../../services/fileatom'; // To display errors related to user files
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFilePdf } from '@fortawesome/free-solid-svg-icons';


const TemplatePanel = () => {
  const [openedDocumentUrl, setOpenedDocumentUrl] = useState(null);
  // Initialize theme based on system preference
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
  const [activeTab, setActiveTab] = useState('template-gallery'); // Default active tab

  const { user } = useUserSession(); // Use your user session hook
  const filesError = useRecoilValue(filesErrorState); // Get file fetch errors

  // IMPORTANT: Replace with your actual backend endpoint to get document content by ID
  // This endpoint should be capable of serving the content of a document given its ID (e.g., Google Drive File ID).
  // Example: 'http://localhost:8081/ace/document/YOUR_FILE_ID_HERE'
  //
  // If template_url in your data is a Google Drive File ID and you want to use Google's viewer:
  // For instance, to embed a publicly shared Google Doc for preview:
  // const YOUR_DOCUMENT_CONTENT_ENDPOINT_BASE = 'https://docs.google.com/document/d/';
  // In this case, `handleOpenDocument` would need to append '/preview' or similar:
  // const docUrl = `${YOUR_DOCUMENT_CONTENT_ENDPOINT_BASE}${fileId}/preview`;
  const YOUR_DOCUMENT_CONTENT_ENDPOINT_BASE = 'http://localhost:8081/ace/document/';


  // Effect to listen for system theme changes and apply 'dark' class to body
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      // Apply/remove 'dark' class to the body for global theme styling
      document.body.classList.toggle('dark', newTheme === 'dark');
    };

    // Initial theme application
    document.body.classList.toggle('dark', theme === 'dark');

    prefersDark.addEventListener('change', handler);
    // Cleanup listener on component unmount
    return () => prefersDark.removeEventListener('change', handler);
  }, [theme]); // Rerun if theme state itself changes (e.g., if you add a theme toggle button)


  // Function to be passed to TemplateGallery and UserDocumentsPanel to open a document
  const handleOpenDocument = (fileId) => {
    // Construct the URL based on your backend endpoint and the fileId from the template data.
    const docUrl = `${YOUR_DOCUMENT_CONTENT_ENDPOINT_BASE}${fileId}`;
    setOpenedDocumentUrl(docUrl);
  };

  const closeDocumentViewer = () => {
    setOpenedDocumentUrl(null);
  };

  const tabs = [
    {
      id: 'template-gallery',
      label: 'Template Gallery',
      content: <TemplateGallery onOpenDocument={handleOpenDocument} />,
    },
    {
      id: 'user-documents',
      label: 'Your Documents',
      content: <UserDocumentsPanel onOpenDocument={handleOpenDocument} />,
    },
  ];

  return (
    // The main container now represents the "window" with a proper border and fixed at 600px height
    <div className={`max-h-[600px] h-[600px] flex flex-col font-sans mx-auto w-full overflow-hidden
      bg-transparent text-gray-900 dark:bg-transparent backdrop-blur-md dark:text-white
      transition-colors duration-300 rounded-lg  border-none`}>

      {/* Tab Headers - now a more "normal" looking navigation bar */}
      <div className="flex flex-wrap justify-center flex-shrink-0 px-2 pt-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-lg font-semibold rounded-t-lg rounded-b-none
              ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md' // Active tab styling
                : 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700' // Inactive tab styling - transparent background
              }
              transition-colors duration-300 ease-in-out
              focus:outline-none focus:ring-4 focus:ring-indigo-300
              whitespace-nowrap overflow-hidden text-ellipsis
            `}
            style={{ minWidth: '120px', maxWidth: '250px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area - This is the "inner window" that will take remaining height and scroll its content */}
      <div className={`flex-grow overflow-y-auto w-full
        bg-white dark:bg-gray-700`}>
        {/* Render the content of the active tab */}
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>

      {/* Document Viewer Section - Appears as an overlay or separate panel when opened */}
      {openedDocumentUrl && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="relative w-full max-w-3xl h-[80vh] rounded-lg shadow-2xl overflow-hidden
            bg-white text-gray-900 dark:bg-gray-800 dark:text-white
            transition-colors duration-300 border border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl sm:text-2xl font-bold font-sans">Document Viewer</h2> {/* Applied font-sans */}
              <button
                onClick={closeDocumentViewer}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5 inline-block mr-1" />
                Close
              </button>
            </div>
            {/* Iframe for document viewing */}
            <iframe
              src={openedDocumentUrl}
              title="Document Viewer"
              className="w-full h-[calc(100%-70px)] border-t border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: theme === 'dark' ? '#333' : '#eee' }}
              // `sandbox` attributes enhance security, limiting what the iframe content can do
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            >
              <p className="text-center text-gray-600 dark:text-gray-300 font-sans">Your browser does not support iframes.</p> {/* Applied font-sans */}
            </iframe>
            <p className="p-2 text-xs text-gray-500 text-center dark:text-gray-400 font-sans"> {/* Applied font-sans */}
              Note: For advanced editing, dedicated document editor integrations are recommended.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePanel;