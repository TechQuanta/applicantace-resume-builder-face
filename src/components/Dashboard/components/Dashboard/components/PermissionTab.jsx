import React, { useState } from "react";

/**
 * Renders the permission management form within the FileDetailsModal.
 * Allows users to grant new permissions (reader/writer) or remove all existing permissions
 * for a specific user on a file using a single dropdown.
 *
 * This component is designed to be controlled by its parent (`FileDetailsModal`),
 * receiving state values and setter functions as props.
 *
 * @param {object} props - Component props.
 * @param {string} props.targetEmail - The email address for which to change permissions.
 * @param {function} props.setTargetEmail - Setter function for the `targetEmail` state.
 * @param {string} props.selectedPermissionOption - The currently selected option from the combined dropdown (e.g., "reader", "writer", "remove_all").
 * @param {function} props.setSelectedPermissionOption - Setter function for the `selectedPermissionOption` state.
 * @param {function} props.handlePermissionUpdate - Callback function to trigger the API call for permission update/removal.
 * @param {boolean} props.isLoading - Boolean indicating if an API operation is currently in progress.
 * @param {string} props.userEmail - The email of the current logged-in user (for client-side self-modification prevention).
 */
const PermissionTab = ({
    targetEmail,
    setTargetEmail,
    selectedPermissionOption, // Combines action and role
    setSelectedPermissionOption,
    handlePermissionUpdate,
    isLoading,
    userEmail, // Current logged-in user's email
}) => {
    // State for client-side email validation error
    const [emailError, setEmailError] = useState("");

    // Regex for basic email format validation
    const emailRegex = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Handler for target email input change
    const handleTargetEmailChange = (e) => {
        const value = e.target.value;
        setTargetEmail(value);

        // Client-side validation
        if (value.trim() === "") {
            setEmailError(""); // Clear error if empty
        } else if (value.toLowerCase() === userEmail.toLowerCase()) {
            setEmailError("You cannot modify your own permissions.");
        } else if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email address.");
        } else {
            setEmailError(""); // Clear error if valid
        }
    };

    // Determine button text based on selected option
    const buttonText = isLoading
        ? "Processing..."
        : selectedPermissionOption === "remove_all"
            ? "Remove All Permissions"
            : "Apply Permission";

    // Determine if the action button should be disabled
    // Button is disabled if target email is empty OR if there's an emailError OR if loading
    const isButtonDisabled = !targetEmail.trim() || !!emailError || isLoading;

    return (
        // Removed `h-full` from here to allow content to dictate height, aligning with modal changes
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-inner flex flex-col space-y-4 relative font-body">
            {/* Conditional Loader Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                    <div className="flex flex-col items-center text-purple-600 dark:text-purple-400">
                        {/* Simple SVG Spinner */}
                        <svg className="animate-spin h-10 w-10 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-3 text-lg font-label font-medium">Processing...</p>
                    </div>
                </div>
            )}

            {/* Main form content - will be covered by loader when isLoading is true */}
            <div className={`flex flex-col space-y-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Combined Permission Action and Role Selector */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="permissionType" className="block text-sm font-label text-gray-700 dark:text-gray-300">
                        Permission Type:
                    </label>
                    <select
                        id="permissionType"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition duration-150 ease-in-out font-body"
                        value={selectedPermissionOption}
                        onChange={(e) => setSelectedPermissionOption(e.target.value)}
                        aria-label="Select permission type"
                    >
                        <option value="reader">Reader (Can view)</option>
                        <option value="writer">Writer (Can view and edit)</option>
                        <option value="remove_all">Remove All Permissions</option>
                    </select>
                </div>

                <div className="flex flex-col space-y-2">
                    <label htmlFor="targetEmail" className="block text-sm font-label text-gray-700 dark:text-gray-300">
                        Target User Email:
                    </label>
                    <input
                        type="email"
                        id="targetEmail"
                        className={`w-full px-4 py-2 border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'} rounded-lg shadow-sm focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition duration-150 ease-in-out font-body`}
                        placeholder="e.g., collaborator@example.com"
                        value={targetEmail}
                        onChange={handleTargetEmailChange}
                        aria-label="Target user email for permission change"
                    />
                    {emailError && (
                        <p className="text-red-500 text-xs mt-1">{emailError}</p>
                    )}
                </div>

                <button
                    onClick={handlePermissionUpdate}
                    disabled={isButtonDisabled}
                    className={`w-full py-3 px-6 rounded-lg text-white font-label font-semibold text-lg shadow-md transition-all duration-300 ease-in-out
                        ${isButtonDisabled
                            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70"
                            : selectedPermissionOption === "remove_all"
                                ? "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800"
                                : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:bg-purple-700 dark:hover:bg-purple-800"
                        }`}
                    aria-label={buttonText}
                >
                    {buttonText}
                </button>

                {selectedPermissionOption === "remove_all" && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center italic font-body">
                        Note: Selecting "Remove All Permissions" will revoke all direct file access for the specified user.
                    </p>
                )}
            </div>
        </div>
    );
};

export default React.memo(PermissionTab);