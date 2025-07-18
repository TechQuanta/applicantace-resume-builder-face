import { atom } from 'recoil';

// --- Persistence Helper Functions for Files ---

const defaultFilesState = []; // Default empty array for files

function getInitialFilesState() {
  try {
    const saved = localStorage.getItem("userFiles"); // Use a distinct key
    const parsed = saved ? JSON.parse(saved) : defaultFilesState;

    if (!Array.isArray(parsed)) {
      console.warn("Invalid userFiles structure found in localStorage. Resetting to default.");
      return defaultFilesState;
    }
    return parsed;
  } catch (e) {
    console.error("Error parsing userFiles from localStorage, resetting:", e);
    return defaultFilesState;
  }
}

function getInitialSelectedFileState() {
    try {
        const saved = localStorage.getItem("selectedUserFile");
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed;
    } catch (e) {
        console.error("Error parsing selectedUserFile from localStorage, resetting:", e);
        return null;
    }
}


/**
 * Recoil atom to store the array of file details fetched for the current user.
 * This global state allows any component to access the list of files
 * without prop drilling. It now persists to localStorage.
 */
export const filesState = atom({
  key: 'filesState', // Unique ID for this atom
  default: getInitialFilesState(), // Load initial state from localStorage
  effects_UNSTABLE: [
    ({ onSet, setSelf }) => {
      // Effect for writing changes FROM Recoil TO localStorage
      onSet((newVal) => {
        // Only save if there are files or if it's explicitly being cleared to an empty array
        if (newVal && newVal.length > 0) {
          localStorage.setItem("userFiles", JSON.stringify(newVal));
        } else {
          // If the files list becomes empty (e.g., user logs out, or deletes all files)
          localStorage.removeItem("userFiles");
        }
      });

      // Effect for reading changes FROM localStorage TO Recoil (e.g., across tabs/windows)
      const handleStorageChange = (e) => {
        if (e.key === "userFiles") {
          setSelf(e.newValue ? JSON.parse(e.newValue) : defaultFilesState);
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

/**
 * Recoil atom to manage the loading status when fetching the user's files.
 * This indicates whether the file data is currently being loaded from the backend.
 * This atom does not need persistence as it's a transient state.
 */
export const filesLoadingState = atom({
  key: 'filesLoadingState', // Unique ID
  default: true,            // Default to true, as files will typically be loaded on component mount
});

/**
 * Recoil atom to store any error message that occurs during the process
 * of fetching the user's files.
 * This atom does not need persistence.
 */
export const filesErrorState = atom({
  key: 'filesErrorState', // Unique ID
  default: null,            // Default to null, indicating no error initially
});


/**
 * Recoil atom to store the details of the currently selected template from the gallery.
 * This is for *displaying template details*, NOT for the user's replicated file.
 * It will persist in localStorage so the selection can be remembered across sessions
 * until the user explicitly clears it or selects a new one.
 */
export const selectedTemplateState = atom({
  key: 'selectedTemplateState', // Unique ID for this atom
  default: null, // Default value is null, meaning no template is selected initially
  effects_UNSTABLE: [
    ({ onSet, setSelf }) => {
      // Load initial state from localStorage if available
      const savedTemplate = localStorage.getItem("selectedTemplate");
      if (savedTemplate) {
        try {
          setSelf(JSON.parse(savedTemplate));
        } catch (e) {
          console.error("Error parsing selectedTemplate from localStorage:", e);
          localStorage.removeItem("selectedTemplate"); // Clear invalid data
        }
      }

      // Persist changes to localStorage
      onSet((newValue, oldValue) => {
        if (newValue) {
          localStorage.setItem("selectedTemplate", JSON.stringify(newValue));
        } else {
          localStorage.removeItem("selectedTemplate"); // Remove if cleared
        }
      });

      // Listen for changes from other tabs/windows (optional, but good for multi-tab consistency)
      const handleStorageChange = (e) => {
        if (e.key === "selectedTemplate") {
          setSelf(e.newValue ? JSON.parse(e.newValue) : null);
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

/**
 * Recoil atom to store the details of the currently selected *user-owned file*.
 * This will be used when a user clicks on a file in their dashboard list
 * or when a new file is replicated and immediately selected for editing.
 * This atom persists to localStorage.
 */
export const selectedFileState = atom({
    key: 'selectedFileState', // Unique ID
    default: getInitialSelectedFileState(), // Load initial state from localStorage
    effects_UNSTABLE: [
        ({ onSet, setSelf }) => {
            // Persist changes to localStorage
            onSet((newValue) => {
                if (newValue) {
                    localStorage.setItem("selectedUserFile", JSON.stringify(newValue));
                } else {
                    localStorage.removeItem("selectedUserFile"); // Remove if cleared
                }
            });

            // Listen for changes from other tabs/windows
            const handleStorageChange = (e) => {
                if (e.key === "selectedUserFile") {
                    setSelf(e.newValue ? JSON.parse(e.newValue) : null);
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