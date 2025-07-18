// Create a new file for this component
import React from 'react';

const RenameTab = ({ newFileName, setNewFileName, handleRename, isLoading, file }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-inner font-body"> {/* Apply font-body to the container */}
      <h3 className="text-xl font-headline font-semibold text-gray-900 dark:text-gray-100 mb-4"> {/* Apply font-headline */}
        Rename File
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-grow">
          <label htmlFor="rename-newFileName" className="block text-sm font-label text-gray-700 dark:text-gray-300 mb-1"> {/* Apply font-label */}
            New File Name
          </label>
          <input
            type="text"
            id="rename-newFileName"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter new file name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-body" // Apply font-body to input
          />
        </div>
        <button
          onClick={handleRename}
          disabled={isLoading || newFileName.trim() === file.fileName}
          className="px-6 py-2 bg-purple-600 text-white font-label font-semibold rounded-md shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" // Apply font-label
        >
          {isLoading ? "Renaming..." : "Rename"}
        </button>
      </div>
    </div>
  );
};

export default React.memo(RenameTab); // Use React.memo for performance optimization