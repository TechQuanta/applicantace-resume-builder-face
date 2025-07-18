import { useRecoilState } from "recoil";
import { userState } from "../services/authatom"; // Import userState from its dedicated file

export const useUserSession = () => {
  const [userSession, setUserSession] = useRecoilState(userState);

  /**
   * Helper function to check if a JWT token is expired or if the expiration time is missing/invalid.
   * A missing or invalid expiration time is treated as an invalid/expired token.
   * @param {number | null | undefined} expirationTimeMillis - The expiration time of the token in milliseconds since epoch.
   * @returns {boolean} True if the token is expired or expiration time is missing/invalid, false otherwise.
   */
  const isTokenExpired = (expirationTimeMillis) => {
    // If expiration time is null, undefined, or not a valid number, treat as expired/invalid.
    // Also, ensure it's not a very small number that could signify an invalid date (e.g., 0).
    if (
      !expirationTimeMillis ||
      typeof expirationTimeMillis !== "number" ||
      isNaN(expirationTimeMillis) ||
      expirationTimeMillis <= 0
    ) {
      console.warn("Token has no or invalid expiration time. Treating as expired.");
      return true;
    }
    // Compare token's expiration time with current time (both in milliseconds).
    // Add a small buffer (e.g., 60 seconds * 1000 ms) for clock skew
    // This is good practice for production environments.
    const now = new Date().getTime();
    const expirationWithBuffer = expirationTimeMillis + (60 * 1000); // 1 minute buffer
    return expirationWithBuffer < now;
  };

  /**
   * This method is used when a user successfully logs in (either new or existing)
   * via email/password, Google, or GitHub. It maps the backend response
   * to a consistent user session structure, now including driveFolderId, storage, and token expiration.
   * @param {object} accountDataFromBackend - The user data object received from the backend.
   * Expected to contain: jwtToken (for OAuth), token (for email/password), email, username, imageUrl, authProvider,
   * currentStorageUsageMb, userDriveQuotaMb (for maxStorageQuotaMb), driveFolderId, and expirationTime (number in seconds).
   */
  const login = (accountDataFromBackend) => {
    let expirationTimeMillis = null;
    if (accountDataFromBackend.expirationTime) {
      if (typeof accountDataFromBackend.expirationTime === "string") {
        // If it's an ISO string (e.g., "2025-07-08T18:46:28.897+05:30"),
        // the Date constructor can parse it, and getTime() gets milliseconds.
        expirationTimeMillis = new Date(accountDataFromBackend.expirationTime).getTime();
      } else if (typeof accountDataFromBackend.expirationTime === "number") {
        // JWT 'exp' claim is in SECONDS since epoch.
        // JavaScript's Date.getTime() and `new Date().getTime()` use MILLISECONDS since epoch.
        // So, we convert seconds to milliseconds.
        expirationTimeMillis = accountDataFromBackend.expirationTime * 1000;
      } else if (accountDataFromBackend.expirationTime instanceof Date) {
        // If it's already a Date object, get its milliseconds.
        expirationTimeMillis = accountDataFromBackend.expirationTime.getTime();
      }
    }

    // --- START: Username Sanitization Logic ---
    let cleanUsername = accountDataFromBackend.username;
    // If the username looks like an email, extract the part before '@'
    if (cleanUsername && cleanUsername.includes("@") && cleanUsername.includes(".")) {
      cleanUsername = cleanUsername.split("@")[0];
    }
    // Further clean the username (e.g., remove spaces, convert to lowercase if desired)
    // This makes it suitable for URL paths like /username/dashboard
    if (cleanUsername) {
      cleanUsername = cleanUsername.toLowerCase().replace(/\s+/g, '');
    }
    // --- END: Username Sanitization Logic ---

    const newAccount = {
      // **CRITICAL CHANGE HERE:** Use jwtToken if present, otherwise use token
      token: accountDataFromBackend.jwtToken || accountDataFromBackend.token,
      email: accountDataFromBackend.email,
      username: cleanUsername, // Use the sanitized username
      imageUrl: accountDataFromBackend.imageUrl,
      authProvider: accountDataFromBackend.authProvider ? accountDataFromBackend.authProvider.toUpperCase() : null,
      loginMethod: accountDataFromBackend.authProvider ? accountDataFromBackend.authProvider.toLowerCase() : null,
      currentStorageUsageMb: accountDataFromBackend.currentStorageUsageMb || 0, // Ensure default
      maxStorageQuotaMb: accountDataFromBackend.userDriveQuotaMb || 10, // Use userDriveQuotaMb from backend, ensure default
      driveFolderId: accountDataFromBackend.driveFolderId, // Explicitly include the Drive folder ID
      expirationTime: expirationTimeMillis, // Store expiration time in milliseconds
    };

    // Basic validation for essential login data
    // Ensure all critical fields are present and expirationTime is a valid number.
    if (
      !newAccount.token || // This will now correctly check for the 'token' property derived from 'jwtToken' or 'token'
      !newAccount.email ||
      !newAccount.username ||
      !newAccount.authProvider ||
      newAccount.expirationTime === null ||
      typeof newAccount.expirationTime !== 'number' ||
      isNaN(newAccount.expirationTime)
    ) {
      console.error("Login attempt with incomplete or invalid data:", accountDataFromBackend);
      throw new Error("Missing essential user data or invalid expiration time for session creation.");
    }

    // Immediately check if the newly received token is already expired
    if (isTokenExpired(newAccount.expirationTime)) {
      console.warn("Attempting to log in with an already expired token. This token should ideally be rejected by the backend or trigger a refresh.");
      throw new Error("The provided session token is already expired. Please log in again.");
    }

    // Add or update the account in the list
    const updatedAccounts = [
      ...(userSession?.accounts || []).filter(
        (acc) => acc.email !== newAccount.email // Remove old entry for this email if it exists
      ),
      newAccount, // Add or update with the new account data
    ];

    const newSessionState = {
      selected: newAccount, // The newly logged-in account becomes selected
      accounts: updatedAccounts,
    };

    setUserSession(newSessionState); // This will trigger the Recoil effect to save to localStorage
    console.log("User session updated via useUserSession.login:", newSessionState);
  };

  /**
   * Updates the storage usage for the currently selected account in the session.
   * This is useful after operations like file uploads or deletions.
   * @param {number} newCurrentUsageMb - The new current storage usage in MB.
   * @param {number} newMaxQuotaMb - The new maximum storage quota in MB.
   */
  const updateStorage = (newCurrentUsageMb, newMaxQuotaMb) => {
    setUserSession((prevSession) => {
      if (!prevSession.selected) {
        console.warn("No selected user to update storage for.");
        return prevSession;
      }

      const updatedSelected = {
        ...prevSession.selected,
        currentStorageUsageMb: newCurrentUsageMb,
        maxStorageQuotaMb: newMaxQuotaMb,
      };

      const updatedAccounts = prevSession.accounts.map((account) =>
        account.email === updatedSelected.email ? updatedSelected : account
      );

      const newState = {
        ...prevSession,
        selected: updatedSelected,
        accounts: updatedAccounts,
      };
      console.log("User storage updated in session:", newState);
      return newState; // This will trigger the Recoil effect to save to localStorage
    });
  };

  /**
   * Switches the currently selected account to the one specified by email.
   * Performs a proactive check for token expiration on the target account.
   * @param {string} emailToSwitchTo - The email of the account to switch to.
   */
  const switchAccount = (emailToSwitchTo) => {
    const foundAccount = userSession.accounts.find(
      (acc) => acc.email === emailToSwitchTo
    );

    if (foundAccount) {
      // Proactive check: If switching to an account with an expired/invalid token, handle it
      if (isTokenExpired(foundAccount.expirationTime)) {
        console.warn(
          `Attempted to switch to account ${emailToSwitchTo} with an expired/invalid token. Removing this account.`
        );
        // Directly call handleTokenInvalidation for this specific email to clean up and potentially shift
        handleTokenInvalidation(emailToSwitchTo);
        return; // Stop the switch operation
      }
      const newSessionState = { ...userSession, selected: foundAccount };
      setUserSession(newSessionState); // This will trigger the Recoil effect to save to localStorage
      console.log("Switched account to:", emailToSwitchTo);
    } else {
      console.warn(
        "Attempted to switch to a non-existent account with email:",
        emailToSwitchTo
      );
    }
  };

  /**
   * Removes a specific account from the session.
   * If the removed account was the selected one, it tries to select another or logs out all.
   * @param {string} emailToRemove - The email of the account to remove.
   */
  const removeAccountByEmail = (emailToRemove) => {
    // If there's no selected account or the account to remove isn't found, do nothing
    if (
      !userSession.selected &&
      !userSession.accounts.find((acc) => acc.email === emailToRemove)
    ) {
      console.warn(`Attempted to remove non-existent or unselected account: ${emailToRemove}`);
      return;
    }

    const wasSelected = userSession.selected?.email === emailToRemove;

    const remainingAccounts = userSession.accounts.filter(
      (acc) => acc.email !== emailToRemove
    );

    let newSelected = null;
    if (wasSelected && remainingAccounts.length > 0) {
      // If the removed account was selected, try to select the first remaining one
      newSelected = remainingAccounts[0];
      console.log(
        `Removed selected account ${emailToRemove}. Shifting to next account: ${newSelected.email}`
      );
    } else if (wasSelected && remainingAccounts.length === 0) {
      // If the removed account was selected and no other accounts, fully log out
      console.log(`Removed last account ${emailToRemove}. Logging out all.`);
      logoutAll(); // Clears everything via Recoil state update
      return; // Exit as logoutAll already sets state
    } else {
      // If the removed account was not selected, keep the current selected or null if it was already null
      newSelected = userSession.selected;
      console.log(
        `Removed non-selected account ${emailToRemove}. Current selected account remains.`
      );
    }

    const newSessionState = {
      selected: newSelected,
      accounts: remainingAccounts,
    };

    setUserSession(newSessionState); // This will trigger the Recoil effect to save to localStorage
  };

  /**
   * Removes the currently selected account.
   */
  const removeSelectedAccount = () => {
    const currentSelectedEmail = userSession.selected?.email;
    if (!currentSelectedEmail) {
      console.warn("No account selected to remove.");
      return;
    }
    removeAccountByEmail(currentSelectedEmail);
  };

  /**
   * Logs out all accounts by clearing the user session state.
   */
  const logoutAll = () => {
    setUserSession({ selected: null, accounts: [] }); // This will trigger the Recoil effect to clear localStorage
    console.log("Logged out all accounts.");
  };

  /**
   * Handles the scenario where a token is found to be invalid (expired, malformed, missing expiration).
   * It removes the specific account associated with that token and attempts to shift to another.
   * This is the primary function to call from API error handlers or proactive checks.
   * @param {string | null} emailToInvalidate - The email of the user whose token is invalid.
   * If null, it means the current selected token is invalid
   * but we don't have its email for some reason,
   * or it's a general invalidation (e.g., no selected user found).
   */
  const handleTokenInvalidation = (emailToInvalidate = null) => {
    console.warn(
      `Handling token invalidation for: ${emailToInvalidate || "current selected user (if any)"}`
    );

    let targetEmail = emailToInvalidate;

    // If no email is explicitly provided, assume it's the currently selected one
    if (!targetEmail && userSession.selected) {
      targetEmail = userSession.selected.email;
    }

    if (targetEmail) {
      // Remove the specific account identified
      removeAccountByEmail(targetEmail); // This function intelligently handles shifting or logging out
    } else {
      // If no specific email, and no selected user, then just log out all
      console.log("No specific email to invalidate or selected user. Performing full logout.");
      logoutAll();
    }
  };

  return {
    user: userSession,
    login,
    logoutAll,
    switchAccount,
    removeSelectedAccount,
    updateStorage,
    isTokenExpired, // Expose for proactive checks
    handleTokenInvalidation, // Expose this for API error handlers and general invalidation
  };
};