// src/components/Navigation/Navigation.js

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FaBars,
  FaTimes,
  FaFileAlt,
  FaBookOpen,
  FaBlog,
  FaQuestionCircle,
  FaGithub,
  FaSignInAlt,
  FaUserCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // Make sure AnimatePresence is imported
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../../../../services/authatom";

import { preloadedComponentsMap } from "../../routes/LandingRouter";
import Loading from '../../../Shared/Loading';

const Navigation = () => {
  const user = useRecoilValue(userState);
  const isLoggedIn = !!user?.selected;

  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State to control menu open/close
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLoadingTrigger, setShowLoadingTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef(null);

  const navItems = useMemo(
    () => [
      { to: "/resume-templates", icon: <FaFileAlt />, label: "Templates", type: "internal" },
      { to: "/resume-examples", icon: <FaBookOpen />, label: "Examples", type: "internal" },
      { to: "/blog", icon: <FaBlog />, label: "Blog", type: "internal" },
      { to: "/faq", icon: <FaQuestionCircle />, label: "FAQ", type: "internal" },
    ],
    []
  );

  const handlePreload = useCallback((path) => {
    if (preloadedComponentsMap[path] && preloadedComponentsMap[path].preload) {
      preloadedComponentsMap[path].preload();
      console.log(`Preloading: ${path}`);
    }
  }, []);

  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkQuery.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    darkQuery.addEventListener("change", handleChange);
    return () => darkQuery.removeEventListener("change", handleChange);
  }, []);

  // Control body overflow when menu is open/closed
  useEffect(() => {
    if (screenWidth <= 823) {
      document.body.style.overflow = menuOpen ? "hidden" : "auto";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto"; // Ensure body overflow is reset on unmount
    };
  }, [menuOpen, screenWidth]);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setScreenWidth(currentWidth);
      if (menuOpen && currentWidth > 823) {
        setMenuOpen(false); // Close menu if resized to desktop view
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);


  // Trigger loading bar on path change (already implemented)
  useEffect(() => {
    // If the menu is open, close it instantly when the path changes.
    // This is crucial for a smooth navigation experience AFTER the menu is closing.
    // The animation for closing is handled by AnimatePresence.
    if (menuOpen) {
      // Don't call setMenuOpen(false) here, as AnimatePresence handles the exit.
      // We rely on the NavLink's onClick to close the menu.
    }
    setShowLoadingTrigger(prev => prev + 1);
  }, [location.pathname]); // Depend on location.pathname

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []); // This will now trigger the exit animation for AnimatePresence

  const handleMyDocumentsClick = useCallback(() => {
    closeMenu(); // Call closeMenu to trigger animation
    if (user?.selected?.username) {
      navigate(`/${user.selected.username}/dashboard`);
    } else {
      navigate("/SignUp");
    }
  }, [user, navigate, closeMenu]);

  const handleSignInClick = useCallback(() => {
    closeMenu(); // Call closeMenu to trigger animation
    navigate("/SignUp");
  }, [navigate, closeMenu]);

  const handleGitHubLoginClick = useCallback(() => {
    closeMenu(); // Call closeMenu to trigger animation
    window.location.href = "https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&scope=user:email";
  }, [closeMenu]);

  // --- Edge-Swipe to Open Logic (no change) ---
  useEffect(() => {
    if (screenWidth > 823 || !containerRef.current) {
      return;
    }

    let touchStartX = 0;
    const EDGE_THRESHOLD = 30;
    const SWIPE_DISTANCE_THRESHOLD = 50;

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e) => {
      if (menuOpen || touchStartX === 0) return;

      const touchCurrentX = e.touches[0].clientX;
      const swipeDistance = touchCurrentX - touchStartX;

      if (touchStartX < EDGE_THRESHOLD && swipeDistance > SWIPE_DISTANCE_THRESHOLD) {
        setMenuOpen(true);
        e.preventDefault();
        touchStartX = 0;
      }
    };

    let mouseStartX = 0;
    const handleMouseDown = (e) => {
      if (e.button === 0 && e.clientX < EDGE_THRESHOLD) {
        mouseStartX = e.clientX;
      }
    };

    const handleMouseMove = (e) => {
      if (menuOpen || mouseStartX === 0) return;

      const mouseCurrentX = e.clientX;
      const swipeDistance = mouseCurrentX - mouseStartX;

      if (mouseStartX < EDGE_THRESHOLD && swipeDistance > SWIPE_DISTANCE_THRESHOLD) {
        setMenuOpen(true);
        mouseStartX = 0;
      }
    };

    const handleMouseUp = () => {
      mouseStartX = 0;
    };

    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("touchstart", handleTouchStart, { passive: false });
      currentContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
      currentContainer.addEventListener("mousedown", handleMouseDown);
      currentContainer.addEventListener("mousemove", handleMouseMove);
      currentContainer.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("touchstart", handleTouchStart);
        currentContainer.removeEventListener("touchmove", handleTouchMove);
        currentContainer.removeEventListener("mousedown", handleMouseDown);
        currentContainer.removeEventListener("mousemove", handleMouseMove);
        currentContainer.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [menuOpen, screenWidth]);

  return (
    <div className="w-screen z-50 overflow-hidden" ref={containerRef}>
      <Loading trigger={showLoadingTrigger} />

      <motion.nav
        className={`fixed top-0 left-0 w-full transition-all duration-300 ${
          isScrolled ? "backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-lg" : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[70px]">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <NavLink to="/" onClick={closeMenu}> {/* Close menu on logo click too */}
              <img
                src={isDarkMode ? "/darklogo.png" : "/lightlogo.png"}
                alt="Logo"
                className="w-23 h-10 object-contain transition-all duration-300 drop-shadow-xl"
              />
            </NavLink>
          </div>

          {/* Desktop Nav (unchanged) */}
          {screenWidth >= 824 && (
            <div className="flex items-center space-x-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-lg px-5 py-2">
              {navItems.map(({ to, icon, label, type }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-sm transition-transform transform hover:-translate-y-1 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-700 dark:text-white"
                    } hover:text-blue-600 dark:hover:text-blue-400`
                  }
                  onMouseEnter={() => handlePreload(to)}
                  onTouchStart={() => handlePreload(to)}
                >
                  {icon}
                  {label}
                </NavLink>
              ))}

              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMyDocumentsClick}
                  onMouseEnter={() => handlePreload(`/${user?.selected?.username}/dashboard`)}
                  onTouchStart={() => handlePreload(`/${user?.selected?.username}/dashboard`)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md transition-all duration-200"
                >
                  <FaUserCircle /> My Documents
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignInClick}
                  onMouseEnter={() => handlePreload("/SignUp")}
                  onTouchStart={() => handlePreload("/SignUp")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md transition-all duration-200"
                >
                  <FaSignInAlt /> Sign In
                </motion.button>
              )}
            </div>
          )}

          {/* Mobile Menu Icon (Hamburger) */}
          {screenWidth <= 823 && (
            <button
              className="md:hidden text-gray-800 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={openMenu}
              aria-label="Open navigation menu"
            >
              <FaBars size={24} />
            </button>
          )}
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      {/* AnimatePresence allows components to animate when they are removed from the DOM */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay with subtle blur */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeMenu} // Close menu when clicking outside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} // Quick fade for overlay
            />
            {/* Sidebar itself */}
            <motion.aside
              initial={{ x: "-100%" }} // Starts off-screen to the left
              animate={{ x: 0 }}      // Slides in to 0 (visible)
              exit={{ x: "-100%" }}   // Slides out to -100% (off-screen)
              transition={{ type: "spring", stiffness: 300, damping: 30 }} // Spring physics for a bouncy feel
              className="fixed top-0 left-0 w-[75vw] max-w-[320px] h-full bg-white dark:bg-gray-950 shadow-2xl z-50 p-6 flex flex-col justify-between border-r border-gray-200 dark:border-gray-800"
            >
              <div>
                {/* Sidebar Header with Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <NavLink to="/" onClick={closeMenu}>
                    <img
                      src={isDarkMode ? "/darklogo.png" : "/lightlogo.png"}
                      alt="Logo"
                      className="w-24 h-11 object-contain drop-shadow-xl"
                    />
                  </NavLink>
                  <button
                    onClick={closeMenu} // Closes the menu
                    className="text-gray-600 dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Sidebar Links */}
                <nav className="flex flex-col space-y-4">
                  {navItems.map(({ to, icon, label, type }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeMenu} // This is the key: Clicking a NavLink closes the menu with animation
                      className={({ isActive }) =>
                        `flex items-center gap-4 text-xl font-medium p-3 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`
                      }
                      onMouseEnter={() => handlePreload(to)}
                      onTouchStart={() => handlePreload(to)}
                    >
                      {icon}
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Sidebar CTA */}
              <div className="space-y-4">
                <hr className="border-gray-200 dark:border-gray-700" />
                {isLoggedIn ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMyDocumentsClick}
                    onMouseEnter={() => handlePreload(`/${user?.selected?.username}/dashboard`)}
                    onTouchStart={() => handlePreload(`/${user?.selected?.username}/dashboard`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl flex items-center justify-center gap-3 text-lg shadow-md hover:opacity-90 transition-all duration-200"
                  >
                    <FaUserCircle /> My Documents
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignInClick}
                      onMouseEnter={() => handlePreload("/SignUp")}
                      onTouchStart={() => handlePreload("/SignUp")}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl flex items-center justify-center gap-3 text-lg shadow-md hover:opacity-90 transition-all duration-200"
                    >
                      <FaSignInAlt /> Sign In
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGitHubLoginClick}
                      className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-xl flex items-center justify-center gap-3 text-lg shadow-md hover:opacity-90 transition-all duration-200"
                    >
                      <FaGithub /> GitHub Login
                    </motion.button>
                  </>
                )}
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
                  Craft resumes effortlessly with <strong>AA</strong>
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navigation;