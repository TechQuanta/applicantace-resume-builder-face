// src/pages/UploadPage.jsx
import React from 'react';
import LocalFileUpload from './components/Upload/LocalFileUpload'; // Adjust path if needed
// import DriveFilePicker from './components/Upload/OneDriveFilePicker'; // Adjust path if needed

const UploadPage = () => {
  return (
    <div className="flex flex-col gap-8 p-8 h-auto  custom-scrollbar
                    bg-transparent rounded-lg justify-center items-center">

      {/* Local File Upload Section */}
      <div className="bg-gray-50 dark:bg-zinc-850 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Upload from Your Device
        </h3>
        <LocalFileUpload />
      </div>

      {/* You can uncomment and integrate other upload options here in the future,
          for example:
      <div className="bg-gray-50 dark:bg-zinc-850 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Upload from OneDrive
        </h3>
        <DriveFilePicker />
      </div>
      */}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        Your privacy is important. Files are securely stored.
      </p>
    </div>
  );
};

export default UploadPage;