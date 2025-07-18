import React, { useState, useEffect } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserSession } from "../hooks/useUserSession";
import ErrorPopup from "../components/Shared/ErrorPopup"; // Assuming this path is correct

import { auth, googleProvider, signInWithPopup } from "../utils/firebase"; // Assuming these Firebase imports are correct
import { fetchSignInMethodsForEmail } from "firebase/auth";


const GoogleAuthButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [shouldNavigate, setShouldNavigate] = useState(false); // New state for navigation
    const { login, user } = useUserSession();
    const navigate = useNavigate();

    const handleError = (message) => {
        setErrorMessage(message);
    };

    const clearError = () => {
        setErrorMessage(null);
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        clearError();
        setShouldNavigate(false); // Reset navigation flag at the start of login attempt

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const backendResponse = await fetch("https://api.techquanta.tech/ace/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            const rawResponseText = await backendResponse.text();

            if (!backendResponse.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(rawResponseText);
                } catch (e) {
                    errorData = { message: `Non-JSON error response or unparsable: ${rawResponseText}` };
                }
                throw new Error(errorData.message || `Backend error: ${backendResponse.statusText}`);
            }

            const userDataFromBackend = JSON.parse(rawResponseText);

            if (!userDataFromBackend.token) {
                throw new Error("JWT token not found in backend response. Cannot establish session.");
            }

            if (!userDataFromBackend.authProvider) {
                userDataFromBackend.authProvider = "GOOGLE";
            }

            const userDataForSession = {
                jwtToken: userDataFromBackend.token,
                expirationTime: userDataFromBackend.expirationTime,
                email: userDataFromBackend.email,
                username: userDataFromBackend.username,
                imageUrl: userDataFromBackend.imageUrl,
                authProvider: userDataFromBackend.authProvider,
                currentStorageUsageMb: userDataFromBackend.currentStorageUsageMb || 0,
                userDriveQuotaMb: userDataFromBackend.userDriveQuotaMb || 10,
                driveFolderId: userDataFromBackend.driveFolderId,
            };

            login(userDataForSession);
            setShouldNavigate(true); // Set flag to true only upon successful login and session update

        } catch (error) {
            if (error.code === 'auth/account-exists-with-different-credential') {
                const email = error.customData.email;
                try {
                    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
                    let errorMessageText = `The email ${email} is already associated with an account.`;
                    if (signInMethods && signInMethods.length > 0) {
                        errorMessageText += ` Please sign in using: ${signInMethods.join(', ')} to link your Google account.`;
                    } else {
                        errorMessageText += ` Please try signing in with a different method.`;
                    }
                    handleError(errorMessageText);
                } catch (fetchError) {
                    handleError(`Failed to check existing account for ${email}. Please try again later.`);
                }
            } else {
                const errorMessageText = error.code
                    ? `Firebase Auth Error: ${error.message}`
                    : error.message || "Google login failed. Please check console.";
                handleError(errorMessageText);
            }

        } finally {
            setIsLoading(false);
        }
    };

    // Modified useEffect to handle navigation
    useEffect(() => {
        // Navigate only if shouldNavigate is true AND user data is ready
        if (shouldNavigate && user && user.selected && user.selected.username) {
            navigate(`/${user.selected.username}/dashboard`);
        }
    }, [shouldNavigate, user, navigate]);

    return (
        <>
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center text-white bg-gray-700 justify-center gap-3 dark:bg-white hover:bg-blue-600 dark:text-black dark:hover:bg-blue-200 font-semibold py-2 px-6 rounded-lg shadow-md w-full max-w-xs transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FaGoogle className="text-2xl" />
                <span>{isLoading ? "Connecting..." : "Google"}</span>
            </button>

            {errorMessage && <ErrorPopup message={errorMessage} onClose={clearError} />}
        </>
    );
};

export default GoogleAuthButton;