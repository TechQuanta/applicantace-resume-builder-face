// // src/services/authatom.js
// import { atom } from "recoil";

// // Define a consistent default structure for the user session
// const defaultUserSession = {
//   selected: null, // The currently active user account
//   accounts: [],   // Array of all logged-in accounts
// };

// // This function will be called once on atom initialization
// function getInitialUserState() {
//   try {
//     const saved = localStorage.getItem("userSession");
//     // Ensure that if 'saved' is null or parsing fails, we return the default structure
//     const parsed = saved ? JSON.parse(saved) : defaultUserSession;

//     // Optional: Basic validation to ensure the parsed object has the expected keys
//     if (!parsed || !Array.isArray(parsed.accounts) || typeof parsed.selected === 'undefined') {
//       console.warn("Invalid userSession structure found in localStorage. Resetting to default.");
//       return defaultUserSession;
//     }
//     return parsed;
//   } catch (e) {
//     console.error("Error parsing userSession from localStorage, resetting:", e);
//     return defaultUserSession; // Return default on error
//   }
// }

// export const userState = atom({
//   key: "userState",
//   default: getInitialUserState(),
//   effects_UNSTABLE: [
//     ({ onSet, setSelf }) => {
//       // Effect for writing changes FROM Recoil TO localStorage
//       onSet((newVal) => {
//         if (!newVal?.selected) { // If selected is null (e.g., after logout)
//           localStorage.removeItem("userSession");
//         } else {
//           localStorage.setItem("userSession", JSON.stringify(newVal));
//         }
//       });

//       // Effect for reading changes FROM localStorage TO Recoil (e.g., across tabs/windows)
//       const handleStorageChange = (e) => {
//         if (e.key === "userSession") {
//           // If e.newValue is null (item removed), set to default. Otherwise, parse.
//           setSelf(e.newValue ? JSON.parse(e.newValue) : defaultUserSession);
//         }
//       };
//       window.addEventListener("storage", handleStorageChange);

//       // Cleanup
//       return () => {
//         window.removeEventListener("storage", handleStorageChange);
//       };
//     },
//   ],
// });
// src/services/authatom.js
import { atom } from "recoil"; 

// Define a consistent default structure for the user session
const defaultUserSession = {
  selected: null, // The currently active user account
  accounts: [],   // Array of all logged-in accounts
};

// This function will be called once on atom initialization
function getInitialUserState() {
  try {
    const saved = localStorage.getItem("userSession");
    // Ensure that if 'saved' is null or parsing fails, we return the default structure
    const parsed = saved ? JSON.parse(saved) : defaultUserSession;

    // Optional: Basic validation to ensure the parsed object has the expected keys
    if (!parsed || !Array.isArray(parsed.accounts) || typeof parsed.selected === 'undefined') {
      console.warn("Invalid userSession structure found in localStorage. Resetting to default.");
      return defaultUserSession;
    }
    return parsed;
  } catch (e) {
    console.error("Error parsing userSession from localStorage, resetting:", e);
    return defaultUserSession; // Return default on error
  }
}

export const userState = atom({
  key: "userState",
  default: getInitialUserState(),
  effects_UNSTABLE: [
    ({ onSet, setSelf }) => {
      // Effect for writing changes FROM Recoil TO localStorage
      onSet((newVal) => {
        if (!newVal?.selected) { // If selected is null (e.g., after logout)
          localStorage.removeItem("userSession");
        } else {
          localStorage.setItem("userSession", JSON.stringify(newVal));
        }
      });

      // Effect for reading changes FROM localStorage TO Recoil (e.g., across tabs/windows)
      const handleStorageChange = (e) => {
        if (e.key === "userSession") {
          // If e.newValue is null (item removed), set to default. Otherwise, parse.
          setSelf(e.newValue ? JSON.parse(e.newValue) : defaultUserSession);
        }
      };
      window.addEventListener("storage", handleStorageChange);

      // Cleanup
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    },
  ],
});