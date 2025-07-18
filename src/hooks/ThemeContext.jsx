// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react'; // Added useCallback for memoization

// 1. Create the Context
export const ThemeContext = createContext({
  theme: 'light', // Default fallback value
  toggleTheme: () => {}, // Default fallback function (might be unused if strictly system-based)
});

// Helper function to get the current system preference
const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default to light if window/matchMedia is not available (e.g., during SSR)
};

// 2. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  // Initialize theme based on system preference
  const [theme, setTheme] = useState(getSystemTheme);

  // Effect to apply 'dark' class to html element and listen for system theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Function to apply/remove 'dark' class
    const applyTheme = (currentTheme) => {
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Apply initial theme
    applyTheme(theme);

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme); // Update React state
      applyTheme(newTheme); // Ensure HTML class is updated immediately
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on component unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]); // Dependency on 'theme' to re-run if theme state changes (e.g., if a manual toggle was reintroduced)

  // This toggleTheme function will *not* change the theme permanently
  // It will simply flip it once, but if the system preference changes back,
  // the system preference will override it due to the useEffect listener.
  // If you want to allow *overriding* system preference, this logic needs to be more complex
  // (e.g., introduce a 'mode' state like 'system', 'light', 'dark' and save 'light'/'dark' overrides to localStorage).
  // For now, it will provide a *temporary* override until system preference changes.
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Note: If you want to persist an *override* of system preference,
      // this is where you'd save it to localStorage (e.g., localStorage.setItem('user-theme-override', newTheme);
      return newTheme;
    });
  }, []);

  // Memoize the context value
  const contextValue = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Custom Hook for easy consumption
export const useTheme = () => {
  return useContext(ThemeContext);
};