import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserSession } from "../hooks/useUserSession"; // Import your useUserSession hook
import ErrorPopup from "../components/Shared/ErrorPopup"; // Import the ErrorPopup component

const AuthForm = ({ isLogin }) => { // Removed onAuthError prop
    // State for form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [linkedinProfileUrl, setLinkedinProfileUrl] = useState("");
    const [otp, setOtp] = useState("");
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState(null); // This state will now be directly passed to the ErrorPopup
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [signupSuccessEmail, setSignupSuccessEmail] = useState(null);
    const [showLinkedinUrlInput, setShowLinkedinUrlUrlInput] = useState(false);
    const [showForgotPasswordInput, setShowForgotPasswordInput] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null); // This can still be displayed inline for specific forgot password messages

    const BASE_URL = "https://api.techquanta.tech";

    const navigate = useNavigate();
    // Destructure both login function AND the current user session state
    const { login, user } = useUserSession(); // <-- IMPORTANT: Added 'user' here

    /**
     * Handles the login submission for website users.
     */
    const handleLoginSubmit = async () => {
        setIsLoading(true);
        setFormError(null); // Clear previous errors
        setForgotPasswordMessage(null); // Clear other messages

        if (!email || !password) {
            setFormError("Email and password are required.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/ace/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                // Call login to update the Recoil state
                // Pass the 'data' object directly. The useUserSession hook will now correctly
                // map the 'token' property from 'data' to its internal 'token' state.
                login(data);

                // IMPORTANT CHANGE: Navigate ONLY after the session is confirmed in useUserSession
                // Access the username from the 'user.selected' state provided by useUserSession
                if (user.selected && user.selected.username) {
                    navigate(`/${user.selected.username}/dashboard`);
                } else {
                    // Fallback in case user.selected isn't immediately available (shouldn't happen with synchronous login)
                    // Use the username from the 'data' received, as useUserSession would have processed it.
                    navigate(`/${data.username || data.email}/dashboard`);
                }

                setEmail("");
                setPassword("");
                setFormError(null); // Clear error on success
            } else {
                const errorMessage = data.message || "An unknown error occurred during login.";
                setFormError(errorMessage); // Set error for popup
            }
        } catch (err) {
            setFormError("Could not connect to the server or process response. Please try again later."); // Set error for popup
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Initiates the signup process by sending user details to request an OTP.
     */
    const handleSignupSubmit = async () => {
        setIsLoading(true);
        setFormError(null); // Clear previous errors
        setForgotPasswordMessage(null); // Clear other messages

        if (!name || !email || !password || !confirmPassword) {
            setFormError("All fields are required for signup.");
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setFormError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (linkedinProfileUrl && !/^https:\/\/(www\.)?linkedin\.com\/in\//.test(linkedinProfileUrl)) {
            setFormError("Please enter a valid LinkedIn Profile URL starting with 'https://www.linkedin.com/in/'.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/ace/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: name,
                    email,
                    password,
                    linkedinProfileUrl,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setSignupSuccessEmail(email);
                setShowOtpInput(true);
                setFormError(null); // Clear error on success
            } else {
                const errorMessage = data.message || "An unknown error occurred during signup initiation.";
                setFormError(errorMessage); // Set error for popup
            }
        } catch (err) {
            setFormError("Could not connect to the server or process response. Please try again later."); // Set error for popup
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles OTP verification and then the final signup completion.
     */
    const handleOtpVerification = async () => {
        setIsLoading(true);
        setFormError(null); // Clear previous errors
        setForgotPasswordMessage(null); // Clear other messages

        if (!otp) {
            setFormError("Please enter the OTP.");
            setIsLoading(false);
            return;
        }
        if (!signupSuccessEmail) {
            setFormError("No pending signup to verify. Please try signing up again.");
            setIsLoading(false);
            return;
        }

        try {
            // Step 2: Verify OTP
            const verifyOtpResponse = await fetch(`${BASE_URL}/ace/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: signupSuccessEmail, otp }),
            });

            if (!verifyOtpResponse.ok) {
                const errorData = await verifyOtpResponse.json();
                throw new Error(errorData.message || "OTP verification failed due to an unknown error.");
            }

            // Step 3: Complete Signup - This is the call that returns the token, driveFolderId, and authProvider
            const completeSignupResponse = await fetch(`${BASE_URL}/ace/auth/complete-signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: name,
                    email: signupSuccessEmail,
                    password: password,
                    linkedinProfileUrl: linkedinProfileUrl,
                }),
            });
            const completeSignupData = await completeSignupResponse.json();

            if (!completeSignupResponse.ok) {
                throw new Error(completeSignupData.message || "Signup finalization failed.");
            }

            // Call login to update the Recoil state
            // Pass the 'completeSignupData' object directly. The useUserSession hook will now correctly
            // map the 'token' property from 'completeSignupData' to its internal 'token' state.
            login(completeSignupData);

            // IMPORTANT CHANGE: Navigate ONLY after the session is confirmed in useUserSession
            // Access the username from the 'user.selected' state provided by useUserSession
            if (user.selected && user.selected.username) {
                navigate(`/${user.selected.username}/dashboard`);
            } else {
                // Fallback in case user.selected isn't immediately available (shouldn't happen with synchronous login)
                // Use the username from the 'completeSignupData' received, as useUserSession would have processed it.
                navigate(`/${completeSignupData.username || completeSignupData.email}/dashboard`);
            }

            // Clear all form states after successful signup and navigation
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setLinkedinProfileUrl("");
            setShowLinkedinUrlUrlInput(false);
            setOtp("");
            setShowOtpInput(false);
            setSignupSuccessEmail(null);
            setFormError(null); // Clear error on success
        } catch (err) {
            setFormError(err.message); // Set error for popup
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the request to send a password reset link.
     */
    const handleForgotPasswordRequest = async () => {
        setIsLoading(true);
        setForgotPasswordMessage(null);
        setFormError(null); // Clear form error before new request

        if (!forgotPasswordEmail) {
            setForgotPasswordMessage("Please enter your email.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/ace/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const responseMessage = await response.text();

            if (response.ok) {
                setForgotPasswordMessage(responseMessage || "If an account with that email exists, a password reset link has been sent to your email.");
                setForgotPasswordEmail("");
            } else {
                setForgotPasswordMessage(responseMessage || "Failed to send password reset link. Please try again.");
            }
        } catch (err) {
            setForgotPasswordMessage("Could not connect to the server or process response. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null); // Always clear the popup error at the start of a submission
        setForgotPasswordMessage(null);

        if (showForgotPasswordInput) {
            handleForgotPasswordRequest();
        } else if (isLogin) {
            handleLoginSubmit();
        } else {
            if (showOtpInput) {
                handleOtpVerification();
            } else {
                handleSignupSubmit();
            }
        }
    };

    // --- Animation Variants for smoother transitions ---
    const fadeInGrow = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const inputVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    };

    const buttonVariants = {
        hover: { scale: 1.03, transition: { type: "spring", stiffness: 300 } },
        tap: { scale: 0.97 },
    };

    // Minimalist Monochrome Theme
const inputStyle =
  "w-full p-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 " +
  "bg-white dark:bg-black text-gray-900 dark:text-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#C0C0C0] focus:border-transparent " +
  "shadow-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500";

const primaryButtonStyle = "w-full " +
  "bg-[#36454F] hover:bg-[#58646E] " +
  "text-white font-bold py-3 px-5 rounded-lg shadow-md " +
  "transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed " +
  "tracking-wide uppercase text-lg";

const secondaryButtonStyle = "text-[#708090] hover:text-[#708090]/80 " +
  "hover:underline text-sm font-medium transition-colors duration-200";
    return (
        <>
            {/* Error Popup component to display centralized errors */}
            <ErrorPopup message={formError} onClose={() => setFormError(null)} />

            {/* Overall form container styling with a slightly more prominent shadow and background */}
            <motion.form
                initial="hidden"
                animate="visible"
                variants={fadeInGrow} // Apply fade-in and subtle growth animation to the whole form
                onSubmit={handleSubmit}
                className={`w-full flex flex-col items-center font-oxygen p-8 sm:p-10 lg:p-12 bg-transparent rounded-2xl shadow-3xl space-y-5 `}
            >
                {/* Form Title - Dynamic based on state, larger bottom margin */}
                <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
                    {showForgotPasswordInput
                        ? "Reset Your Password"
                        : isLogin
                        ? "Welcome Back!"
                        : showOtpInput
                        ? "Verify Your Account"
                        : "Join Our Community"}
                </h2>

                {/* Forgot Password UI */}
                {showForgotPasswordInput ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className={inputStyle}
                            required
                            disabled={isLoading}
                        />
                        {forgotPasswordMessage && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`text-sm text-center ${forgotPasswordMessage.includes("sent") || forgotPasswordMessage.includes("exists") ? "text-green-500" : "text-red-500"}`}
                            >
                                {forgotPasswordMessage}
                            </motion.p>
                        )}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={primaryButtonStyle}
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForgotPasswordInput(false);
                                setForgotPasswordEmail("");
                                setForgotPasswordMessage(null);
                                setFormError(null); // Clear popup error when switching back
                            }}
                            className={secondaryButtonStyle + " w-full mt-2"}
                        >
                            Back to Login
                        </button>
                    </motion.div>
                ) : (
                    // Login/Signup UI
                    <>
                        {!showOtpInput ? (
                            // Regular Login/Signup Inputs
                            <>
                                {!isLogin && (
                                    <div className="w-full flex flex-col sm:flex-row sm:space-x-4">
                                        <motion.input
                                            variants={inputVariants}
                                            initial="hidden"
                                            animate="visible"
                                            type="text"
                                            placeholder="Full Name (Used as Username)"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={inputStyle + " sm:flex-1"}
                                            required
                                            disabled={isLoading}
                                        />
                                        {showLinkedinUrlInput ? (
                                            <motion.input
                                                variants={inputVariants}
                                                initial="hidden"
                                                animate="visible"
                                                type="url"
                                                placeholder="LinkedIn Profile URL (Optional)"
                                                value={linkedinProfileUrl}
                                                onChange={(e) => setLinkedinProfileUrl(e.target.value)}
                                                className={inputStyle + " sm:flex-1"}
                                                disabled={isLoading}
                                            />
                                        ) : (
                                            <motion.button
                                                type="button"
                                                onClick={() => setShowLinkedinUrlUrlInput(true)}
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                className="sm:flex-1 text-sm text-blue-600 border border-blue-600 py-2.5 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700 transition duration-300 ease-in-out font-medium"
                                            >
                                                Add LinkedIn Profile URL
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                                <motion.input
                                    variants={inputVariants}
                                    initial="hidden"
                                    animate="visible"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputStyle}
                                    required
                                    disabled={isLoading}
                                />
                                <motion.input
                                    variants={inputVariants}
                                    initial="hidden"
                                    animate="visible"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputStyle}
                                    required
                                    disabled={isLoading}
                                />
                                {!isLogin && (
                                    <motion.input
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputStyle}
                                        required
                                        disabled={isLoading}
                                    />
                                )}
                            </>
                        ) : (
                            // OTP Input UI
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={inputStyle}
                                    required
                                    disabled={isLoading}
                                />
                                {signupSuccessEmail && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                        An OTP has been sent to **{signupSuccessEmail}**.
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Main Action Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={primaryButtonStyle}
                        >
                            {isLoading
                                ? "Processing..."
                                : isLogin
                                ? "Login"
                                : showOtpInput
                                ? "Verify OTP"
                                : "Sign Up"}
                        </motion.button>

                        {/* Forgot Password Link for Login form */}
                        {isLogin && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPasswordInput(true);
                                    setFormError(null); // Clear popup error when switching to forgot password
                                }}
                                className={secondaryButtonStyle + ""}
                            >
                                Forgot Password?
                            </button>
                        )}
                    </>
                )}
            </motion.form>
        </>
    );
};

export default AuthForm;