// src/hooks/useGitHubRepos.js
import { useState, useEffect, useCallback } from 'react';
import { fetchGitHubRepositories, fetchGitHubUserByUsername, CACHE_DURATION_MS } from '../services/apiservice';

const REPO_CACHE_KEY_PREFIX = 'github_repos_cache_';
const LAST_FETCH_TIMESTAMP_KEY_PREFIX = 'github_repos_last_fetch_';
const USER_ID_CACHE_KEY_PREFIX = 'github_user_id_cache_';

/**
 * Custom React hook to fetch and manage GitHub repositories.
 * Can fetch by a specific user-entered username or the authenticated session's GitHub username.
 * Includes caching for user IDs and repositories.
 *
 * @param {string | number | null} sessionGithubNumericId - Numeric ID from the user session (if authenticated).
 * @param {string | null} sessionGithubUsername - Username from the user session (if authenticated).
 * @param {string | null} authProvider - The authentication provider (e.g., 'GITHUB').
 * @param {string | null} usernameToFetch - The username explicitly entered in the search bar, or null.
 * @returns {{repositories: Array, githubLogin: string|null, loading: boolean, error: string|null, foundNumericId: string|null, setRepositories: Function, setGithubLogin: Function, setError: Function, setFoundNumericId: Function}}
 */
export const useGitHubRepos = (sessionGithubNumericId, sessionGithubUsername, authProvider, usernameToFetch = null) => {
    const [repositories, setRepositories] = useState([]);
    const [githubLogin, setGithubLogin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [foundNumericId, setFoundNumericId] = useState(null);

    const fetchRepos = useCallback(async () => {
        let targetUsername = null;

        // Priority 1: Explicit username from the search bar
        if (usernameToFetch && usernameToFetch.trim() !== '') {
            targetUsername = usernameToFetch.trim();
        }
        // Priority 2: Authenticated GitHub session username (if no explicit search)
        else if (authProvider === 'GITHUB' && sessionGithubUsername) {
            targetUsername = sessionGithubUsername;
        }

        // If no valid target username, clear all states and exit
        if (!targetUsername) {
            setRepositories([]);
            setGithubLogin(null);
            setFoundNumericId(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        setRepositories([]); // Clear previous repos immediately
        setGithubLogin(null);
        setFoundNumericId(null);

        let numericIdToUse = null;
        let loginToUse = null;

        try {
            // Step 1: Get Numeric ID and Login for the targetUsername
            // Check session cache first for the user's ID by their username
            const userIdCacheKey = `${USER_ID_CACHE_KEY_PREFIX}${targetUsername.toLowerCase()}`;
            const cachedUserIdData = sessionStorage.getItem(userIdCacheKey);

            if (cachedUserIdData) {
                try {
                    const parsedCache = JSON.parse(cachedUserIdData);
                    numericIdToUse = parsedCache.id;
                    loginToUse = parsedCache.login;
                    console.log(`[useGitHubRepos] Using cached numeric ID for '${targetUsername}': ${numericIdToUse}`);
                } catch (e) {
                    console.warn("[useGitHubRepos] Corrupted user ID cache, refetching.", e);
                    sessionStorage.removeItem(userIdCacheKey); // Clear corrupted cache
                }
            }

            // If numeric ID not found in cache, fetch it from GitHub API
            if (!numericIdToUse) {
                console.log(`[useGitHubRepos] Fetching numeric ID for username: '${targetUsername}'...`);
                const userData = await fetchGitHubUserByUsername(targetUsername);
                if (userData) {
                    numericIdToUse = userData.id;
                    loginToUse = userData.login;
                    sessionStorage.setItem(userIdCacheKey, JSON.stringify(userData)); // Cache the fetched user ID
                } else {
                    setError(`GitHub user '${targetUsername}' not found or has no public profile.`);
                    setLoading(false);
                    return;
                }
            }

            setFoundNumericId(numericIdToUse);
            setGithubLogin(loginToUse); // Set the login name for display

            // Step 2: Fetch Repositories using the determined numericIdToUse
            const repoCacheKey = `${REPO_CACHE_KEY_PREFIX}${numericIdToUse}`;
            const lastFetchTimeKey = `${LAST_FETCH_TIMESTAMP_KEY_PREFIX}${numericIdToUse}`;

            const cachedReposData = sessionStorage.getItem(repoCacheKey);
            const lastFetchTime = sessionStorage.getItem(lastFetchTimeKey);

            let reposToSet = [];

            if (cachedReposData && lastFetchTime) {
                const parsedLastFetchTime = parseInt(lastFetchTime, 10);
                if ((Date.now() - parsedLastFetchTime) < CACHE_DURATION_MS) {
                    console.log(`[useGitHubRepos] Loading repositories from cache for numeric ID ${numericIdToUse}.`);
                    try {
                        const parsedData = JSON.parse(cachedReposData);
                        reposToSet = parsedData.repos;
                    } catch (e) {
                        console.warn("[useGitHubRepos] Corrupted repository cache, refetching.", e);
                        sessionStorage.removeItem(repoCacheKey);
                        sessionStorage.removeItem(lastFetchTimeKey);
                    }
                } else {
                    console.log(`[useGitHubRepos] Cache expired for numeric ID ${numericIdToUse}, fetching new data.`);
                    sessionStorage.removeItem(repoCacheKey);
                    sessionStorage.removeItem(lastFetchTimeKey);
                }
            }

            if (reposToSet.length === 0) {
                console.log(`[useGitHubRepos] Initiating fetch from GitHub API for numeric ID ${numericIdToUse}...`);
                const { repos: fetchedRepos } = await fetchGitHubRepositories(numericIdToUse);
                reposToSet = fetchedRepos;

                sessionStorage.setItem(repoCacheKey, JSON.stringify({ repos: fetchedRepos }));
                sessionStorage.setItem(lastFetchTimeKey, Date.now().toString());
            }

            setRepositories(reposToSet);

        } catch (err) {
            console.error("[useGitHubRepos] Error in fetchRepos:", err);
            // Check for specific error messages to provide better user feedback
            if (err.message.includes("API rate limit exceeded")) {
                setError("GitHub API rate limit exceeded. Please try again later or use a GitHub PAT.");
            } else if (err.message.includes("User not found")) {
                setError(`GitHub user '${targetUsername}' not found or has no public profile.`);
            } else {
                setError(err.message || "Failed to fetch GitHub data. Check your network or the username.");
            }
            setRepositories([]); // Clear repositories on error
            setGithubLogin(null);
            setFoundNumericId(null);
        } finally {
            setLoading(false);
        }
    }, [usernameToFetch, sessionGithubNumericId, sessionGithubUsername, authProvider]); // Added sessionGithubUsername as dependency

    useEffect(() => {
        // This effect will trigger the fetch when relevant props change
        fetchRepos();
    }, [fetchRepos]); // Safe because fetchRepos is memoized by useCallback

    return { repositories, githubLogin, loading, error, foundNumericId, setRepositories, setGithubLogin, setError, setFoundNumericId };
};