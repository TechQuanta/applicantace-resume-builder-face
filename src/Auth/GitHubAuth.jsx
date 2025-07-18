// src/components/GitHubAuthButton.jsx
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserSession } from "../hooks/useUserSession";
import ErrorPopup from "../components/Shared/ErrorPopup";

import { auth, githubProvider, signInWithPopup } from "../utils/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";

const GitHubAuthButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { login, user } = useUserSession();
    const navigate = useNavigate();

    const handleError = (message) => {
        console.error("Authentication Error:", message); // Log all errors
        setErrorMessage(message);
    };

    const clearError = () => {
        setErrorMessage(null);
    };

    const handleGitHubLogin = async () => {
        setIsLoading(true);
        clearError(); // Clear previous errors before a new attempt

        try {
            console.log("--- Starting GitHub Login Process ---");
            console.log("1. Attempting Firebase signInWithPopup...");
            const result = await signInWithPopup(auth, githubProvider);
            console.log("1.1 Firebase signInWithPopup successful. Result:", result);
            console.log("1.2 Firebase User object:", result.user);

            console.log("2. Obtaining Firebase ID Token...");
            const idToken = await result.user.getIdToken();
            console.log("2.1 Firebase ID Token successfully obtained. Token (first 20 chars):", idToken.substring(0, 20) + '...');

            console.log("3. Making backend API call to 'https://api.techquanta.tech/ace/auth/github'...");
            const apiEndpoint = "https://api.techquanta.tech/ace/auth/github";
            const requestBody = JSON.stringify({ idToken });
            console.log("3.1 API Method: POST");
            console.log("3.2 API Headers: Content-Type: application/json");
            console.log("3.3 API Request Body (stringified JSON):", requestBody.substring(0, 100) + '...'); // Log a snippet

            const backendResponse = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody,
            });

            console.log("4. Received response from backend API.");
            console.log("4.1 Backend Response Status:", backendResponse.status);
            console.log("4.2 Backend Response Status Text:", backendResponse.statusText);
            console.log("4.3 Backend Response OK status (true/false):", backendResponse.ok);

            const rawResponseText = await backendResponse.text();
            console.log("4.4 Backend Raw Response Text (full):", rawResponseText);

            if (!backendResponse.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(rawResponseText);
                    console.error("5.1 Backend error: Response parsed as JSON:", errorData);
                } catch (e) {
                    console.error("5.1 Backend error: Failed to parse response as JSON. Raw text:", rawResponseText, "Parsing error:", e);
                    errorData = { message: `Non-JSON error response or unparsable: ${rawResponseText}` };
                }
                const errorMessageForPopup = errorData.message || `Backend error: ${backendResponse.statusText}. Response: ${rawResponseText}`;
                throw new Error(errorMessageForPopup); // Propagate as a general error
            }

            console.log("5. Backend response is OK. Attempting to parse as JSON...");
            const userDataFromBackend = JSON.parse(rawResponseText);
            console.log("5.1 Backend Response (parsed JSON data):", userDataFromBackend);

            // Backend is expected to send authProvider, but add a fallback just in case
            userDataFromBackend.authProvider = userDataFromBackend.authProvider || "GITHUB";
            console.log("6. Calling useUserSession login function with processed data...");
            // IMPORTANT CHANGE: Capture the returned account data from login function
            const loggedInAccount = login(userDataFromBackend);
            console.log("6.1 useUserSession login completed. Resulting loggedInAccount:", loggedInAccount);

            console.log("7. Checking for navigation conditions...");
            // Navigate using the username from the immediately available loggedInAccount object
            if (loggedInAccount && loggedInAccount.username) {
                console.log(`7.1 Navigating to dashboard: /${loggedInAccount.username}/dashboard`);
                navigate(`/${loggedInAccount.username}/dashboard`);
            } else if (userDataFromBackend.username) {
                // Fallback, though with the above change, this should ideally not be hit
                console.warn(`7.1 Fallback navigation: Navigating to /${userDataFromBackend.username}/dashboard (loggedInAccount.username was null/undefined)`);
                navigate(`/${userDataFromBackend.username}/dashboard`);
            } else {
                console.error("7.1 Critical Error: No username found in either loggedInAccount or userDataFromBackend for navigation.");
                handleError("Login successful, but a username was not provided for navigation.");
            }

        } catch (error) {
            console.error("--- Error during GitHub Login Process ---");
            console.error("Caught exception:", error);

            if (error.code === 'auth/account-exists-with-different-credential') {
                const email = error.customData.email;
                console.log(`Auth Error: Account exists with different credential for email: ${email}`);

                try {
                    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
                    console.log("Auth Error: Found sign-in methods for email:", signInMethods);

                    const providerMap = {
                        'google.com': 'Google', 'github.com': 'GitHub', 'password': 'Email and Password',
                        'facebook.com': 'Facebook', 'twitter.com': 'Twitter', 'microsoft.com': 'Microsoft',
                    };

                    const friendlySignInMethods = signInMethods.map(method => providerMap[method] || method);

                    let errorMessageText = `The email ${email} is already associated with an account.`;
                    if (friendlySignInMethods.length > 0) {
                        errorMessageText += ` Please sign in using your existing account with: ${friendlySignInMethods.join(' or ')}.`;
                    } else {
                        errorMessageText += ` Please try signing in with a different method.`;
                    }
                    handleError(errorMessageText);

                } catch (fetchError) {
                    console.error("Auth Error: Failed to check existing account sign-in methods:", fetchError);
                    handleError(`Failed to check existing account for ${email}. Please try again later.`);
                }
            } else if (error.code === 'auth/popup-closed-by-user') {
                console.log("Auth Warning: Firebase popup was closed by the user.");
                handleError("Sign-in process cancelled. The pop-up window was closed.");
            } else if (error.code === 'auth/cancelled-popup-request') {
                console.log("Auth Warning: Firebase popup request was cancelled (e.g., another popup opened).");
                handleError("Sign-in process cancelled. Another pop-up request was made.");
            } else {
                // General error handler
                const errorMessageText = error.message || "An unknown error occurred during GitHub login.";
                handleError(errorMessageText);
            }

        } finally {
            setIsLoading(false);
            console.log("--- GitHub Login Process Finished ---");
        }
    };

    return (
        <>
            <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-white hover:text-black transition-all text-white font-semibold py-4 px-6 rounded-lg shadow-md w-full max-w-xs dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Login with GitHub"
                type="button"
            >
                <FaGithub className="text-2xl font-oxygen" />
                <span>{isLoading ? "Connecting..." : "GitHub"}</span>
            </button>

            <ErrorPopup message={errorMessage} onClose={clearError} />
        </>
    );
};

export default GitHubAuthButton;