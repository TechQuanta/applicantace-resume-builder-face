import React, { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaGoogle,
    FaGithub,
    FaUserCircle,
    FaEdit,
    FaChevronDown,
    FaLightbulb,
    FaRocket,
    FaFileAlt,
    FaTimes,
    FaRegSadTear,
    FaTrashAlt,
    FaPowerOff,
    FaPlus, // For 'Add New Account' button
    FaEnvelope, // For Email/Password provider
    FaSpinner, // For loading states
    FaExclamationTriangle, // For delete confirmation
} from "react-icons/fa";

import toast from "react-hot-toast";

import { useUserSession } from "../../../../hooks/useUserSession"; // Adjust path as needed

// Directly import your existing auth buttons
import GoogleAuthButton from "../../../../Auth/GoogleAuth"; // Adjust path as needed
import GitHubAuthButton from "../../../../Auth/GitHubAuth"; // Adjust path as needed

// --- Import the new API service function ---
import { deleteUserAccount } from "../../../../utils/apiconfig"; // Adjust path as needed

const UserProfileModal = ({ onClose }) => {
    const navigate = useNavigate();
    const { user, login, switchAccount, logoutAll, removeSelectedAccount } = useUserSession();

    // Ensure 'user' and its properties are safely accessed
    // Default values provide a safe initial state before user data loads
    const current = user?.selected || {
        name: "",
        email: "",
        authProvider: "",
        avatarUrl: null,
        username: "",
        documentCount: 0, // Default to 0
        currentStorageUsageMb: 0, // Default to 0
        maxStorageQuotaMb: 10, // Default to 10
        token: "",
        uid: "",
    };
    const accounts = Array.isArray(user?.accounts) ? user.accounts : [];

    const fileRef = useRef(null);
    const [showSwitchAccountDropdown, setShowSwitchAccountDropdown] = useState(false);
    const [showAddAccountProviderDropdown, setShowAddAccountProviderDropdown] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [authError, setAuthError] = useState(null); // For displaying auth errors from the buttons
    const [isLoadingUser, setIsLoadingUser] = useState(true); // New state for initial user data loading

    // Common animation variants for consistent motion
    const springConfig = { type: "spring", stiffness: 200, damping: 20 };
    const fadeConfig = { opacity: 0, scale: 0.9, y: 10 };

    // Simulate user loading for initial render, remove if user data is always instantly available
    useEffect(() => {
        // This effect will run whenever the `user` object (from `useUserSession`) changes.
        // `user.selected` contains the active account's details including documentCount.
        // We set isLoadingUser to false once user data is available.
        if (user && user.selected) {
            setIsLoadingUser(false);
        } else if (!user) {
            // If user becomes null (e.g., after logout), also set loading to false
            setIsLoadingUser(false);
        }
    }, [user]); // Depend on the entire 'user' object


    // --- Dynamic Greeting ---
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    // --- Handlers ---
    const handleProfileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic file size validation (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // Optimistically update avatar in session (you might want to send to backend too)
            login({ ...current, avatarUrl: reader.result });
            setImageLoaded(false); // Force reload to ensure new image is rendered
            toast.success("Profile picture updated!");
        };
        reader.readAsDataURL(file);
    };

    const handleSwitchAccount = (acc) => {
        switchAccount(acc.email); // Update the session/local storage with the new selected account
        setShowSwitchAccountDropdown(false);
        setImageLoaded(false); // Force reload of avatar
        toast.success(`Switched to ${acc.name || acc.username}'s account.`, { icon: "🔄" });

        onClose(); // Close the current modal first for a cleaner transition

        // Construct the URL for the new account's dashboard
        const newDashboardPath = `/${acc.username || acc.name?.replace(/\s+/g, '') || 'dashboard'}/dashboard`;

        // Navigate to the new dashboard path and force a full page reload.
        // This ensures all state (React, Recoil, etc.) is completely reset and re-initialized
        // based on the newly active user in the session.
        window.location.href = newDashboardPath;
    };

    const handleLogoutAll = () => {
        toast.success("Logged out of all accounts!");
        logoutAll();
        onClose();
        navigate("/SignUp", { replace: true });
    };

    const handleAuthButtonError = (errorMessage) => {
        setAuthError(errorMessage);
        toast.error(errorMessage);
        setShowAddAccountProviderDropdown(false); // Close dropdown on error
    };

    // --- Account Deletion Logic ---
    const handleDeleteAccount = async () => {
        if (!current.email) {
            toast.error("No account selected for deletion.");
            return;
        }

        // New: Check for the exact confirmation input
        if (deleteConfirmationInput !== "account/delete") {
            toast.error("Please type 'account/delete' to confirm.");
            return;
        }

        setIsDeleting(true); // Set loading state
        try {
            // --- Call the new API service function ---
            await deleteUserAccount(current.email, current.uid, current.token);

            toast.success("Account deleted successfully!");
            removeSelectedAccount(); // Update session state
            setConfirmDelete(false); // Hide confirmation
            setDeleteConfirmationInput(""); // Clear the input

            // After successful deletion, logout all users and navigate to login/signup
            toast("Logging out now...", { icon: "👋" });
            logoutAll(); // This logs out all active sessions
            onClose(); // Close the modal

            // Navigate to the signup/login page after a short delay for toast to show
            setTimeout(() => {
                navigate("/SignUp", { replace: true });
            }, 500);

        } catch (error) {
            // Removed console.error(error)
            toast.error(error.message || "An error occurred during deletion.");
        } finally {
            setIsDeleting(false); // Reset loading state
        }
    };

    // --- Helper for Provider Icon ---
    const getProviderIcon = (provider) => {
        const base = "w-4 h-4 p-0.5 rounded-full flex items-center justify-center ";
        switch (provider?.toLowerCase()) {
            case "google": return <FaGoogle className={`${base} text-blue-500 bg-white`} />;
            case "github": return <FaGithub className={`${base} text-white bg-black`} />;
            case "email": case "password": case "website": return <FaEnvelope className={`${base} text-blue-500 bg-white`} />;
            default: return <FaUserCircle className={`${base} text-gray-300 dark:text-gray-600 bg-gray-600 dark:bg-gray-800`} />;
        }
    };

    // --- Dynamic Storage Message ---
    const storagePercentage = current.maxStorageQuotaMb > 0 ? (current.currentStorageUsageMb / current.maxStorageQuotaMb) : 0;
    const storageMessage = useMemo(() => {
        if (storagePercentage >= 0.9) return "Storage almost full! Consider upgrading.";
        if (storagePercentage >= 0.7) return "You're using a lot of space. Keep an eye on it!";
        if (storagePercentage >= 0.5) return "Halfway there! Keep managing your documents.";
        return "Plenty of space available. Keep creating!";
    }, [storagePercentage]);

    const storageColor = useMemo(() => {
        if (storagePercentage > 0.8) return '#EF4444'; // Red-500
        if (storagePercentage > 0.5) return '#F59E0B'; // Amber-500
        return '#2563EB'; // Blue-600
    }, [storagePercentage]);

    // Show loading spinner or "Loading user data..." if `isLoadingUser` is true
    if (isLoadingUser) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px] w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 bg-gradient-to-br from-white/95 to-blue-50/95 dark:from-zinc-900/95 dark:to-zinc-800/95 backdrop-blur-xl rounded-2xl shadow-3xl border border-blue-200/50 dark:border-zinc-700/50 font-raleway">
                <FaSpinner className="animate-spin text-4xl text-blue-500 dark:text-blue-400" />
                <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading user data...</p>
            </div>
        );
    }


    return (
        <div className="relative w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 bg-gradient-to-br from-white/95 to-blue-50/95 dark:from-zinc-900/95 dark:to-zinc-800/95 backdrop-blur-xl rounded-2xl shadow-3xl border border-blue-200/50 dark:border-zinc-700/50 font-raleway min-h-[500px] flex flex-col justify-between">
            {/* Astonishing Background Particles */}
            <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none ">
                <div className="absolute top-16 -left-16 w-40 h-40 bg-purple-400 rounded-full mix-blend-screen filter blur-xl animate-blob-slow" />
                <div className="absolute -top-16 left-1/4 w-32 h-32 bg-blue-400 rounded-full mix-blend-screen filter blur-xl animate-blob-slow animation-delay-2000" />
                <div className="absolute -bottom-10 right-1/4 w-36 h-36 bg-pink-400 rounded-full mix-blend-screen filter blur-xl animate-blob-slow animation-delay-4000" />
                <div className="absolute bottom-1/4 right-1/2 w-44 h-44 bg-yellow-400 rounded-full mix-blend-screen filter blur-xl animate-blob-slow animation-delay-6000" />
            </div>

            {/* Top Controls - Icons on Left, Close on Right */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                {/* Left-side actions (Logout All, Delete Account) */}
                <div className="flex space-x-2">
                    <motion.button
                        onClick={handleLogoutAll}
                        className="group relative p-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-md transition-all opacity-90 hover:opacity-100 transform hover:scale-110 active:scale-95"
                        title="Logout All Accounts"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <FaPowerOff className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap font-montserrat">
                            Sign out of all sessions
                        </span>
                    </motion.button>

                    <motion.button
                        onClick={() => setConfirmDelete(true)}
                        className="group relative p-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-md transition-all opacity-90 hover:opacity-100 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete This Account"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        disabled={confirmDelete || isDeleting}
                    >
                        <FaTrashAlt className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap font-montserrat">
                            Permanently remove this account
                        </span>
                    </motion.button>
                </div>

                {/* Right-aligned Add Account and Close */}
                <div className="flex space-x-2">
                    {/* Add New Account Button with Dropdown */}
                    <div className="relative">
                        <motion.button
                            onClick={() => setShowAddAccountProviderDropdown(v => !v)}
                            className="group relative p-2 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 hover:from-emerald-600 hover:to-green-800 text-white shadow-md transition-all opacity-90 hover:opacity-100 transform hover:scale-110 active:scale-95"
                            title="Add New Account"
                            aria-expanded={showAddAccountProviderDropdown}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            <FaPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap font-montserrat">
                                Link another account to your profile
                            </span>
                        </motion.button>

                        <AnimatePresence>
                            {showAddAccountProviderDropdown && (
                                <motion.ul
                                    initial={fadeConfig}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={fadeConfig}
                                    transition={{ duration: 0.2 }}
                                    className="absolute z-40 mt-2 right-0 w-48 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-xl p-2 origin-top-right font-lato text-gray-800 dark:text-gray-200"
                                >
                                    {/* Google Auth Button - direct import */}
                                    <li className="p-0"> {/* Wrapper to fit button styling */}
                                        <GoogleAuthButton onAuthError={handleAuthButtonError} />
                                    </li>
                                    {/* GitHub Auth Button - direct import */}
                                    <li className="p-0 mt-2"> {/* Wrapper to fit button styling, add margin */}
                                        <GitHubAuthButton onAuthError={handleAuthButtonError} />
                                    </li>
                                    <li
                                        onClick={() => {
                                            setShowAddAccountProviderDropdown(false);
                                            onClose(); // Close modal to show signup page
                                            navigate("/signup?multi=true"); // Navigate to a dedicated signup page for email/password, potentially with a param to indicate multi-account
                                        }}
                                        className="cursor-pointer flex items-center gap-2 p-2 hover:bg-purple-600 hover:text-white rounded-lg text-sm transition-colors duration-200 group mt-2" // Add mt-2 for spacing
                                    >
                                        <FaEnvelope className="group-hover:scale-110 transition-transform" /> Sign in with Email
                                    </li>
                                    {authError && (
                                        <li className="text-red-500 text-xs px-2 pt-2 text-center">{authError}</li>
                                    )}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        onClick={onClose}
                        className="group relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 shadow-md transition-all opacity-90 hover:opacity-100 transform hover:scale-110 active:scale-95"
                        title="Close"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <FaTimes className="w-4 h-4" />
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap font-montserrat">
                            Close Profile
                        </span>
                    </motion.button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col md:flex-row gap-8 pt-12 items-center md:items-start">
                {/* Left Panel: Profile Info & Account Switching */}
                <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left pr-0 md:pr-6 md:border-r border-blue-200/50 dark:border-zinc-700/50 w-full md:w-auto min-w-0 md:min-w-[350px]">
                    <motion.div
                        className="relative group cursor-pointer w-32 h-32 mb-4 flex-shrink-0 border-4 border-blue-500 dark:border-blue-400 rounded-full shadow-lgtransition-all duration-300 ease-out hover:shadow-xl"
                        onClick={() => fileRef.current?.click()}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, ...springConfig }}
                    >
                        {(current.avatarUrl || current.imageUrl) ? (
                            <>
                                {!imageLoaded && (
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-800 animate-pulse flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-montserrat">Loading...</div>
                                )}
                                <img
                                    src={current.avatarUrl || current.imageUrl}
                                    alt="Profile"
                                    onLoad={() => setImageLoaded(true)}
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(current.name || current.username || 'User')}&background=random&color=fff&size=128`;
                                        setImageLoaded(true);
                                    }}
                                    className={`rounded-full transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"} w-full h-full object-cover group-hover:scale-105 transition-transform ease-out`}
                                />
                            </>
                        ) : (
                            <FaUserCircle className="w-full h-full text-gray-400 dark:text-zinc-600 rounded-full group-hover:scale-105 transition-transform shadow-lg" />
                        )}
                        <input type="file" accept="image/*" hidden ref={fileRef} onChange={handleProfileUpload} />
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                            className="absolute bottom-2 right-2 p-2 rounded-full bg-blue-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1"
                            aria-label="Change profile picture"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <FaEdit className="w-4 h-4" />
                        </motion.button>
                    </motion.div>

                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white truncate w-full max-w-[280px] leading-tight mb-1 drop-shadow-md font-poppins">
                        {greeting}, {current.username || current.name || "Guest"}!
                    </h2>
                    <p className="text-base text-gray-700 dark:text-gray-300 truncate w-full max-w-[280px] mb-4 font-lato">
                        {current.email || "No email provided"}
                    </p>
                    <div className="flex items-center gap-2 py-1.5 px-4 bg-blue-100 dark:bg-zinc-800 rounded-full text-blue-700 dark:text-blue-300 text-sm font-semibold uppercase shadow-inner border border-blue-200 dark:border-zinc-700 font-montserrat tracking-wide">
                        {getProviderIcon(current.authProvider)}
                        <span>{current.authProvider || "Unknown"}</span>
                    </div>

                    {/* Switch Accounts Section */}
                    <div className="relative mt-8 w-full max-w-[280px]">
                        <motion.button
                            onClick={() => setShowSwitchAccountDropdown((v) => !v)}
                            className="group relative w-full flex justify-center items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-md font-semibold hover:scale-[1.01] active:scale-98 font-montserrat"
                            aria-expanded={showSwitchAccountDropdown}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span>Switch Account</span>
                            <FaChevronDown className={`w-4 h-4 transition-transform ${showSwitchAccountDropdown ? "rotate-180" : ""}`} />
                            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 font-lato">
                                Change to another logged-in account
                            </span>
                        </motion.button>
                        <AnimatePresence>
                            {showSwitchAccountDropdown && (
                                <motion.ul
                                    initial={fadeConfig}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={fadeConfig}
                                    transition={{ duration: 0.2 }}
                                    className="absolute z-40 mt-2 w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-xl max-h-40 p-2 font-lato text-gray-800 dark:text-gray-200 custom-scrollbar"
                                >
                                    <li className="p-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-700 font-medium bg-gray-50 dark:bg-zinc-700/50 rounded-md">
                                        Current: <span className="font-semibold text-blue-600 dark:text-blue-400">{current.username || current.name}</span>
                                    </li>
                                    {accounts
                                        .filter((acc) => acc.email !== current.email)
                                        .map((acc, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSwitchAccount(acc)}
                                                className="cursor-pointer flex items-center gap-3 p-3 hover:bg-blue-500 hover:text-white rounded-lg text-sm transition-colors duration-200 group"
                                            >
                                                {getProviderIcon(acc.authProvider)}
                                                <span className="truncate">{acc.username || acc.name}</span>
                                            </li>
                                        ))}
                                    {accounts.filter((acc) => acc.email !== current.email).length === 0 && (
                                        <li className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">No other accounts available.</li>
                                    )}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Account Details & Actions */}
                <div className="flex-1 pl-0 md:pl-6 w-full md:w-auto min-w-0 md:min-w-[400px]">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 mt-8 md:mt-0 font-poppins">
                        <FaLightbulb className="text-yellow-500 dark:text-yellow-400 text-2xl animate-pulse-light" /> Your Insights & Actions
                    </h3>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base font-lato">
                        <div className="flex justify-between items-center pb-2 border-b border-blue-100 dark:border-zinc-700">
                            <span className="font-medium text-gray-800 dark:text-gray-200">Login Provider:</span>
                            <span>{current.authProvider || "N/A"}</span>
                        </div>
                        <motion.div
                            className="flex justify-between items-center pb-2 border-b border-blue-100 dark:border-zinc-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="font-medium text-gray-800 dark:text-gray-200">Documents:</span>
                            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-300 text-lg font-bold font-oswald tracking-wide">
                                <FaFileAlt className="w-5 h-5" />
                                <motion.span
                                    key={current.documentCount} // Key changed to documentCount for animation
                                    initial={{ y: -8, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ ...springConfig, duration: 0.4 }}
                                >
                                    {current.documentCount !== undefined ? current.documentCount : '0'}
                                </motion.span>
                            </span>
                        </motion.div>
                        {current.currentStorageUsageMb !== undefined && current.maxStorageQuotaMb !== undefined && (
                            <motion.div
                                className="flex flex-col items-center py-2 bg-blue-50 dark:bg-zinc-800 rounded-lg shadow-inner border border-blue-200 dark:border-zinc-700"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="font-medium text-gray-800 dark:text-gray-200 mb-2 font-montserrat">Storage Usage:</span>
                                <div className="relative w-28 h-28 mb-2">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            className="text-gray-200 dark:text-zinc-700 stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        ></circle>
                                        <motion.circle
                                            className="stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeLinecap="round"
                                            style={{
                                                strokeDasharray: 2 * Math.PI * 40,
                                                strokeDashoffset: 2 * Math.PI * 40 * (1 - storagePercentage),
                                                transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease-out',
                                                stroke: storageColor
                                            }}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - storagePercentage) }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        ></motion.circle>
                                        <text
                                            x="50"
                                            y="50"
                                            className={`text-xl font-bold font-oswald ${storagePercentage > 0.8 ? 'fill-red-600 dark:fill-red-400' : 'fill-blue-600 dark:fill-blue-400'}`}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            {`${Math.round(storagePercentage * 100)}%`}
                                        </text>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-montserrat text-center">
                                    {current.currentStorageUsageMb.toFixed(2)} MB of {current.maxStorageQuotaMb} MB used. {storageMessage}
                                </p>
                                {storagePercentage >= 0.9 && (
                                    <motion.button
                                        className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors text-sm flex items-center gap-2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaRocket /> Upgrade Plan
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Delete Account Confirmation */}
                        <AnimatePresence>
                            {confirmDelete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 p-4 rounded-lg shadow-inner flex flex-col items-center text-center mt-6"
                                >
                                    <FaExclamationTriangle className="text-4xl mb-3 text-red-600 dark:text-red-400" />
                                    <p className="font-semibold text-lg mb-2">Confirm Account Deletion</p>
                                    <p className="text-sm mb-4">
                                        To permanently delete your account **{current.email}**, please type "<strong className="text-red-700 dark:text-red-300">account/delete</strong>" in the box below:
                                    </p>
                                    <input
                                        type="text"
                                        value={deleteConfirmationInput}
                                        onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                        placeholder="Type 'account/delete' to confirm"
                                        className="w-full max-w-xs p-2 mb-4 text-center border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 focus:ring-red-500 focus:border-red-500 transition-all"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setConfirmDelete(false);
                                                setDeleteConfirmationInput(""); // Clear input on cancel
                                            }}
                                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors font-semibold disabled:opacity-50"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-semibold disabled:opacity-50"
                                            disabled={isDeleting || deleteConfirmationInput !== "account/delete"} // Disable unless typed correctly
                                        >
                                            {isDeleting ? <FaSpinner className="animate-spin inline mr-2" /> : <FaTrashAlt className="inline mr-2" />}
                                            {isDeleting ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;