// src/services/apiservice.js
import axios from 'axios';

// --- Configuration Section (Consolidated) ---
const GITHUB_BASE_URL = 'https://api.github.com';

// Duration for caching GitHub repository data in session storage (e.g., 5 minutes)
export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Defines the GitHub username whose Personal Access Token (PAT) will be used for authentication.
 * This is "ashmeet07" as per your requirement.
 * This username is purely for identifying the token's owner, not the user being searched.
 */
const AUTH_GITHUB_USERNAME = ''; // Hardcoded username for authentication context

/**
 * Gathers the GitHub Personal Access Token from environment variables.
 * Assumes the token is named VITE_GITHUB_TOKEN (Vite's default prefix without vite.config.js modification).
 *
 * @returns {string} The GitHub Personal Access Token.
 * @throws {Error} If the VITE_GITHUB_TOKEN environment variable is not set.
 */
const getGithubAuthToken = () => {
    // Accessing environment variable via import.meta.env, with VITE_ prefix.
    const token = import.meta.env.GITHUB_TOKEN; // Correct for unchanged vite.config.js

    if (!token) {
        console.error("[apiservice] Error: VITE_GITHUB_TOKEN environment variable is not set. API calls will fail.");
        throw new Error("GitHub Personal Access Token (VITE_GITHUB_TOKEN) is not configured.");
    }
    return token;
};


// --- Service Functions Section ---

/**
 * Fetches public repositories for a given GitHub numeric user ID using the authenticated PAT.
 * This function will use the token from VITE_GITHUB_TOKEN for authentication,
 * regardless of which user's repos are being fetched.
 *
 * @param {string} githubNumericId - The numeric ID of the GitHub user (e.g., 91828139) to fetch repos FOR.
 * @returns {Promise<{repos: Array, githubLogin: string|null}>} - An object containing the array of repositories and the GitHub username.
 * @throws {Error} If no valid numeric ID or token is available, or API calls fail.
 */
export const fetchGitHubRepositories = async (githubNumericId) => {
    if (!githubNumericId || isNaN(githubNumericId)) {
        throw new Error("Invalid GitHub numeric ID provided. Please ensure it's a valid number.");
    }

    const token = getGithubAuthToken(); // Get the token internally

    try {
        console.log(`[apiservice] Attempting to fetch repos for ID ${githubNumericId} using token from '${AUTH_GITHUB_USERNAME}'...`);

        const response = await axios.get(
            `${GITHUB_BASE_URL}/user/${githubNumericId}/repos?type=public`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        const repos = response.data;
        let githubLogin = null;

        // Try to get the GitHub login from the first repository owner
        if (repos.length > 0 && repos[0].owner && repos[0].owner.login) {
            githubLogin = repos[0].owner.login;
        } else {
            // Fallback: If no repos or owner login, fetch user profile separately
            try {
                console.log(`[apiservice] Fetching user profile for ID ${githubNumericId} to get login name with '${AUTH_GITHUB_USERNAME}' token...`);
                const userProfileResponse = await axios.get(
                    `${GITHUB_BASE_URL}/user/${githubNumericId}`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                        },
                    }
                );
                githubLogin = userProfileResponse.data.login;
            } catch (profileError) {
                console.warn(`[apiservice] Could not fetch GitHub login for ID ${githubNumericId} using user profile API with token from '${AUTH_GITHUB_USERNAME}':`, profileError.message);
                // Don't rethrow, as we might still have repos even if username fetch failed
            }
        }

        return { repos, githubLogin };

    } catch (err) {
        console.error(`[apiservice] API call failed for repos with token from '${AUTH_GITHUB_USERNAME}': Status ${err.response?.status || 'N/A'}, Message: ${err.message}`);

        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 403 || err.response.status === 401) {
                throw new Error(`Authentication failed or rate limit exceeded for token from '${AUTH_GITHUB_USERNAME}'. Please check the token's validity and rate limits. Original error: ${err.message}`);
            } else if (err.response.status === 404) {
                console.warn(`[apiservice] No public repositories found or user ID ${githubNumericId} not found (404).`);
                return { repos: [], githubLogin: null }; // Return empty for 404
            }
        }
        throw err; // Re-throw other types of errors
    }
};

/**
 * Fetches GitHub user data (including numeric ID and login) by username.
 * Uses the authenticated PAT for authentication.
 *
 * @param {string} usernameToSearch - The GitHub username to search for (entered by the user).
 * @returns {Promise<{id: string, login: string}|null>} - An object containing the numeric ID and login, or null if not found.
 * @throws {Error} If no token is available or the token fails for reasons other than 404.
 */
export const fetchGitHubUserByUsername = async (usernameToSearch) => {
    if (!usernameToSearch || usernameToSearch.trim() === '') {
        throw new Error("Username to search cannot be empty.");
    }

    const token = getGithubAuthToken(); // Get the token internally

    try {
        console.log(`[apiservice] Attempting to fetch user '${usernameToSearch}' using token from '${AUTH_GITHUB_USERNAME}'...`);
        const response = await axios.get(
            `${GITHUB_BASE_URL}/users/${usernameToSearch}`, // This fetches the user profile for the specified username
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );
        // Ensure ID is a string if it comes as a number, as often treated as string in URLs/params
        return { id: response.data.id.toString(), login: response.data.login };
    } catch (err) {
        console.error(`[apiservice] Failed to fetch user '${usernameToSearch}' with token from '${AUTH_GITHUB_USERNAME}': Status ${err.response?.status || 'N/A'}, Message: ${err.message}`);

        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 404) {
                console.warn(`[apiservice] User '${usernameToSearch}' not found (404).`);
                return null; // User not found, return null
            } else if (err.response.status === 403 || err.response.status === 401) {
                throw new Error(`Authentication failed or rate limit exceeded for token from '${AUTH_GITHUB_USERNAME}' while fetching user '${usernameToSearch}'. Original error: ${err.message}`);
            }
        }
        throw err; // Re-throw other types of errors
    }
};