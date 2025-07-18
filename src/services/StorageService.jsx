
const STORAGE_KEYS = {
  liked: "likedQuestions",
  viewed: "viewedQuestions",
  clicked: "clickedQuestions",
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Clean old entries older than 7 days
const filterOldEntries = (data) => {
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(data).filter(([_, ts]) => now - ts < ONE_WEEK_MS)
  );
};

// Get stored object (filtered by age)
export const getStoredData = (key) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    const parsed = raw ? JSON.parse(raw) : {};
    const cleaned = filterOldEntries(parsed);
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return {};
  }
};

// Save data to localStorage
export const setStoredData = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} data`, err);
  }
};
