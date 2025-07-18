// src/components/panels/GitHubReferencePanel/GitHubReferencePanel.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useUserSession } from "../../../../hooks/useUserSession";
import { useGitHubRepos } from "../../../../hooks/useGithubRepos";
import { CACHE_DURATION_MS } from "../../../../services/apiservice";
import GitHubAuthButton from '../../../../Auth/GitHubAuth'; // Import the GitHubAuthButton

const loadingMessages = [
    "Pulling data from GitHub...",
    "Fetching repositories...",
    "Compiling results...",
    "Almost there!",
    "Just a moment...",
    "Building the graph...",
    "Analyzing code...",
    "Synchronizing data...",
];

const extractUrls = (text) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    return text.match(urlRegex) || [];
};

const GitHubReferencePanel = () => {
    const { user } = useUserSession();
    const authProvider = user.selected?.authProvider;
    const sessionGithubNumericId = user.selected?.githubId;
    const sessionGithubUsername = user.selected?.username;

    const [searchUsernameInput, setSearchUsernameInput] = useState('');
    const [usernameToFetch, setUsernameToFetch] = useState(null);
    const [showAuthPromptForSearch, setShowAuthPromptForSearch] = useState(false);

    const searchInputRef = useRef(null);

    const { repositories, githubLogin, loading, error, foundNumericId } = useGitHubRepos(
        sessionGithubNumericId,
        sessionGithubUsername,
        authProvider,
        usernameToFetch
    );

    const [selectedRepoId, setSelectedRepoId] = useState(null);
    const [copiedMessage, setCopiedMessage] = useState('');
    const [theme, setTheme] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);

    // Initial load/session setup
    useEffect(() => {
        // If the user *is* authenticated with GitHub, and no specific search is active,
        // display their own username.
        if (authProvider === 'GitHub' && sessionGithubUsername && !usernameToFetch) {
            setSearchUsernameInput(sessionGithubUsername);
            setUsernameToFetch(sessionGithubUsername);
            setShowAuthPromptForSearch(false); // No auth prompt needed if already logged in via GitHub
        } else if (!sessionGithubUsername && !usernameToFetch) {
            // If no session username and no manual search, clear input.
            // Don't show auth prompt initially unless a search is attempted.
            setSearchUsernameInput('');
            setUsernameToFetch(null);
            setShowAuthPromptForSearch(false);
        }
        // If user is NOT GitHub auth and there's no username to fetch, ensure prompt is off
        if (authProvider !== 'GitHub' && !usernameToFetch) {
            setShowAuthPromptForSearch(false);
        }

    }, [sessionGithubUsername, usernameToFetch, authProvider]);


    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => { mediaQuery.removeEventListener('change', handleChange); };
    }, [theme]);

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setCurrentLoadingMessageIndex(prevIndex =>
                    (prevIndex + 1) % loadingMessages.length
                );
            }, 1500);
        } else {
            setCurrentLoadingMessageIndex(0);
            if (interval) clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [loading]);

    const handleRepoClick = (repoId) => {
        setSelectedRepoId(prev => (prev === repoId ? null : repoId));
        setCopiedMessage('');
    };

    const copyToClipboard = (text) => {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiedMessage('Copied!');
            setTimeout(() => setCopiedMessage(''), 2000);
        } catch (err) {
            setCopiedMessage('Failed to copy!');
            setTimeout(() => setCopiedMessage(''), 2000);
        }
    };

    const ExternalLinkIcon = ({ className = "h-5 w-5" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );

    const CopyIcon = ({ className = "h-5 w-5" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v4a1 1 0 001 1h4a1 1 0 001-1V7m0 0a1 1 0 001-1V4a1 1 0 00-1-1H9a1 1 0 00-1 1v2m0 0a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1h2m-2-4h8m-8 0V4m0 8h.01M17 17H9a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2z" />
        </svg>
    );

    // Modified handleSearch logic
    const handleSearch = () => {
        const trimmedUsername = searchUsernameInput.trim();

        // If the user is NOT authenticated with GitHub AND they have entered a username to search
        if (authProvider !== 'GitHub' && trimmedUsername !== '') {
            setShowAuthPromptForSearch(true); // Show the GitHub auth button
            setUsernameToFetch(null); // Clear any pending fetch
        } else if (trimmedUsername !== '') {
            // User IS authenticated with GitHub or is searching for their own repos
            setShowAuthPromptForSearch(false); // Hide the auth button
            setUsernameToFetch(trimmedUsername); // Proceed with fetching
        } else {
            // Search bar is empty, and user clicks search.
            // If they are GitHub authenticated, show their own repos.
            // If not, clear usernameToFetch and don't show prompt unless they type something again.
            setUsernameToFetch(sessionGithubUsername && authProvider === 'GitHub' ? sessionGithubUsername : null);
            setShowAuthPromptForSearch(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const displayedRepos = repositories;

    // Conditionally render the content based on auth state and search intent
    const renderContent = useCallback(() => {
        // If a non-GitHub user tries to search, show the auth prompt
        if (showAuthPromptForSearch) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Connect your GitHub account to search for other users' repositories.
                    </p>
                    {/* Replaced the generic button with GitHubAuthButton */}
                    <GitHubAuthButton />
                </div>
            );
        }

        if (loading) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-500 dark:text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className={`text-base sm:text-lg lg:text-xl font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {loadingMessages[currentLoadingMessageIndex]}
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 text-sm sm:text-base">{error}</div>
                </div>
            );
        }

        // If no username is currently being fetched (initial state or cleared search)
        if (!usernameToFetch && !sessionGithubUsername) {
            return (
                <div className="flex-1 flex items-center justify-center p-4">
                     <p className={`text-center text-base sm:text-lg lg:text-xl ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'}`}>
                        Enter a GitHub username to find repositories.
                    </p>
                </div>
            )
        }

        if (displayedRepos?.length === 0 && usernameToFetch) {
            return (
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className={`text-center text-base sm:text-lg lg:text-xl ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'}`}>
                        No public repositories found for "{githubLogin || usernameToFetch}".
                    </p>
                </div>
            );
        }
        
        // Default: Display repositories
        return (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col">
                {displayedRepos?.map((repo) => (
                    <div key={repo.id} className="mb-3 sm:mb-4">
                        <div
                            className={`flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg cursor-pointer transition-colors duration-200
                                ${selectedRepoId === repo.id
                                    ? (theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100')
                                    : (theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100')
                                }`}
                            onClick={() => handleRepoClick(repo.id)}
                        >
                            <span className={`text-base sm:text-lg lg:text-xl font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                                {repo.name}
                            </span>
                            <span className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {selectedRepoId === repo.id ? '▲' : '▼'}
                            </span>
                        </div>

                        {selectedRepoId === repo.id && (
                            <div className={`p-3 sm:p-4 rounded-b-lg space-y-2 sm:space-y-3 shadow-inner
                                ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {repo.description || 'No description provided.'}
                                </p>

                                {repo.url && (
                                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-md text-xs sm:text-sm
                                        ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} gap-2 sm:gap-0`}>
                                        <a href={repo.url} target="_blank" rel="noopener noreferrer"
                                            className={`flex items-center gap-1 sm:gap-2 overflow-hidden text-ellipsis flex-grow hover:underline w-full sm:w-auto
                                            ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                            <ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="truncate">{repo.url}</span>
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(repo.url)}
                                            className="flex-shrink-0 flex items-center gap-1 bg-green-600 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-md hover:bg-green-700 transition-colors duration-200 w-full sm:w-auto text-white"
                                            title="Copy Repository URL"
                                        >
                                            <CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Copy
                                        </button>
                                    </div>
                                )}

                                {repo.homepageUrl && repo.homepageUrl !== repo.url && (
                                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-md text-xs sm:text-sm
                                        ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} gap-2 sm:gap-0`}>
                                        <a href={repo.homepageUrl} target="_blank" rel="noopener noreferrer"
                                            className={`flex items-center gap-1 sm:gap-2 overflow-hidden text-ellipsis flex-grow hover:underline w-full sm:w-auto
                                            ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                            <ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="truncate">{repo.homepageUrl}</span>
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(repo.homepageUrl)}
                                            className="flex-shrink-0 flex items-center gap-1 bg-green-600 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-md hover:bg-green-700 transition-colors duration-200 w-full sm:w-auto text-white"
                                            title="Copy Homepage URL"
                                        >
                                            <CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Copy
                                        </button>
                                    </div>
                                )}

                                {extractUrls(repo.description).length > 0 && (
                                    <div className="space-y-1 sm:space-y-2">
                                        {extractUrls(repo.description).map((url, index) => (
                                            <div key={index} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-md text-xs sm:text-sm
                                                ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} gap-2 sm:gap-0`}>
                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                    className={`flex items-center gap-1 sm:gap-2 overflow-hidden flex-grow hover:underline w-full sm:w-auto
                                                    ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                                                    <ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="truncate">{url}</span>
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(url)}
                                                    className="flex-shrink-0 flex items-center gap-1 bg-green-600 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-md hover:bg-green-700 transition-colors duration-200 w-full sm:w-auto text-white"
                                                    title="Copy URL from Description"
                                                >
                                                    <CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    Copy
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {copiedMessage && (
                                    <div className="text-center text-green-400 dark:text-green-300 text-xs font-medium mt-2 sm:mt-3">{copiedMessage}</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }, [loading, error, showAuthPromptForSearch, theme, displayedRepos, githubLogin, usernameToFetch, selectedRepoId, copiedMessage, currentLoadingMessageIndex]);

    return (
        <div className={`p-4 sm:p-6 md:p-8 lg:p-10 min-h-[600px] rounded-2xl flex flex-col font-monospace
            ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
            transition-colors duration-300 w-full max-w-full mx-auto`}>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-center sm:text-left w-full sm:w-auto`}>
                    GitHub Projects
                </h1>
            </div>

            {/* Always show the search input and button */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    ref={searchInputRef}
                    placeholder="Enter GitHub username (e.g., ashmeet07)"
                    value={searchUsernameInput}
                    onChange={(e) => setSearchUsernameInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`flex-grow px-4 py-2 rounded-md border
                        ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                        focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}`}
                />
            </div>
            <button
                onClick={handleSearch}
                className={`px-4 py-2 rounded-md font-semibold w-full sm:w-auto mb-4
                    ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                    transition-colors duration-200`}
            >
                Search
            </button>

            {/* Display info/error messages based on state */}
            {!showAuthPromptForSearch && !loading && !error && (
                <p className={`text-sm sm:text-base lg:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {githubLogin ? `for ${githubLogin} (ID: ${foundNumericId || 'N/A'})` : (usernameToFetch ? `Searching for ${usernameToFetch}...` : 'Enter a username to search GitHub projects.')}
                </p>
            )}
            
            {!showAuthPromptForSearch && !loading && !error && (
                <p className={`text-xs sm:text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Note: API calls cached in session storage for {Math.round(CACHE_DURATION_MS / 60000)} minutes.
                </p>
            )}

            {/* Render the main content (auth button, loading, errors, or repos) */}
            {renderContent()}
        </div>
    );
};

export default GitHubReferencePanel;