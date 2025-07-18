// src/components/Home/RightContent.jsx
import React, { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserSession } from "../../../../hooks/useUserSession";
import Loading from '../../../Shared/Loading';
import { motion, AnimatePresence } from "framer-motion";
import {
    FiMenu,
    FiArrowLeft,
    FiLogIn,
    FiClock,
    FiUsers,
    FiEdit,
    FiRefreshCw,
    FiHelpCircle
} from "react-icons/fi";

const LazyUserProfileModal = lazy(() => import("../AccManager/UserAcountHandler"));
const HistoryComponent = lazy(() => import("../EditingComponents/History"));

const BREAKPOINTS = {
    MOBILE_MENU: 700,
    DESKTOP_NAV: 1300, // New breakpoint for desktop nav visibility
};

const Navbar = ({ setActivePanel }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const modalRef = useRef(null);
    const mobileNavRef = useRef(null);
    const menuButtonRef = useRef(null);
    const { user } = useUserSession();
    const navigate = useNavigate();

    // Update isDesktop to use the new breakpoint
    const isDesktop = useMemo(() => windowWidth >= BREAKPOINTS.DESKTOP_NAV, [windowWidth]);

    const currentStorage = parseFloat(user?.selected?.currentStorageUsageMb) || 0;
    const maxStorage = parseFloat(user?.selected?.maxStorageQuotaMb) || 10;
    let storagePercentage = (currentStorage / maxStorage) * 100;
    if (currentStorage > 0 && storagePercentage < 1) storagePercentage = 1;
    if (storagePercentage > 100) storagePercentage = 100;
    const displayPercentage = Math.max(0, storagePercentage);
    const circleCircumference = 2 * Math.PI * 18;
    const strokeDashoffset = circleCircumference - (displayPercentage / 100) * circleCircumference;

    const getStorageColor = useCallback(() => {
        if (displayPercentage >= 90) return "stroke-red-500";
        if (displayPercentage >= 75) return "stroke-yellow-400";
        return "stroke-blue-500";
    }, [displayPercentage]);

    const toggleMobileNav = useCallback(() => setIsMobileNavOpen(prev => !prev), []);
    const toggleHistory = useCallback(() => setIsHistoryOpen(prev => !prev), []);

    const handleClickOutside = useCallback((event) => {
        if (profileOpen && modalRef.current && !modalRef.current.contains(event.target)) {
            setProfileOpen(false);
        }
        if (isMobileNavOpen && mobileNavRef.current && !mobileNavRef.current.contains(event.target) && (!menuButtonRef.current || !menuButtonRef.current.contains(event.target))) {
            setIsMobileNavOpen(false);
        }
    }, [profileOpen, isMobileNavOpen]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Prevent shortcuts from firing when the user is typing in an input field
            const isInputFocused = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
            if (isInputFocused) return;

            // This ensures the custom shortcuts only work on the dashboard
            if (window.location.pathname.includes('dashboard')) {
                if (event.ctrlKey && event.altKey) {
                    switch (event.key) {
                        case '1':
                            event.preventDefault();
                            navigate('edit-resume');
                            break;
                        case '2':
                            event.preventDefault();
                            navigate('compare-templates');
                            break;
                        case '3':
                            event.preventDefault();
                            toggleHistory();
                            break;
                        default:
                            break;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate, toggleHistory]);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            // Update the mobile nav open logic to use the new breakpoint
            if (window.innerWidth >= BREAKPOINTS.DESKTOP_NAV && isMobileNavOpen) {
                setIsMobileNavOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setIsDark(e.matches);
        mediaQuery.addEventListener("change", handleChange);

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", handleResize);
            mediaQuery.removeEventListener("change", handleChange);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileNavOpen, handleClickOutside]);

    useEffect(() => {
        document.body.style.overflow = (profileOpen || isMobileNavOpen || isHistoryOpen) ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [profileOpen, isMobileNavOpen, isHistoryOpen]);

    const formatName = (name) => (name ? name.replace(/\s+/g, "") : "");
    const dashboardPath = user?.selected?.username ? `/${user.selected.username}/dashboard` : user?.selected?.name ? `/${formatName(user.selected.name)}/dashboard` : "/dashboard";

    const navLinks = useMemo(() => [
    { name: "Job Applicants", path: "opennings", icon: <FiUsers /> },
    { name: "Edit Documents", path: `edit-resume`, icon: <FiEdit />, shortcut: "Ctrl+Alt+1" },
    { name: "Compare Templates", path: `compare-templates`, icon: <FiRefreshCw />, shortcut: "Ctrl+Alt+2" },
    { name: "History", onClick: toggleHistory, icon: <FiClock />, shortcut: "Ctrl+Alt+3" },
    { name: "Help", path: "/help", icon: <FiHelpCircle /> },
], [toggleHistory]);

    const getUserProfileImage = useCallback(() => {
        if (user?.selected?.avatarUrl || user?.selected?.imageUrl) {
            return user.selected.avatarUrl || user.selected.imageUrl;
        }
        const nameForAvatar = user?.selected?.name || user?.selected?.username || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random&color=fff`;
    }, [user]);

    const NavLinkItem = ({ to, name, icon, onClick, activePath, shortcut }) => {
        const isActive = to && activePath === to;
        const linkClasses = `relative z-10 p-3 rounded-full transition-colors duration-300 ${isActive ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-zinc-800" : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`;
        const tooltipClasses = `absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white px-3 py-2 rounded-lg shadow-lg whitespace-normal text-sm opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 ease-in-out flex flex-col items-start gap-1 max-w-xs`;

        return (
            <div className="relative w-full flex justify-center group/item">
                {to ? (
                    <NavLink to={to} className={linkClasses}>{icon}</NavLink>
                ) : (
                    <button onClick={onClick} className={linkClasses}>{icon}</button>
                )}
                <span className={tooltipClasses}>
                    <strong className="text-base">{name}</strong>
                    {shortcut && (
                        <>
                            <br />
                            <kbd className="inline-block px-1 py-0.5 text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 rounded-sm">{shortcut}</kbd>
                        </>
                    )}
                </span>
            </div>
        );
    };

    const MobileNavLinkItem = ({ to, name, icon, onClick, shortcut }) => {
        const linkClasses = ({ isActive }) =>
            `flex items-center gap-3 w-full justify-end px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 relative ${isActive ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-600 dark:before:bg-blue-400 pl-6" : "text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-zinc-800"}`;

        const content = (
            <>
                {icon && <span className="text-xl">{icon}</span>}
                {name}
                {shortcut && (
                    <span className="ml-auto text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 rounded-sm px-1 py-0.5">
                        {shortcut}
                    </span>
                )}
            </>
        );

        return to ? (
            <NavLink to={to} onClick={toggleMobileNav} className={linkClasses}>{content}</NavLink>
        ) : (
            <button onClick={() => { onClick(); setIsMobileNavOpen(false); }} className={`w-full ${linkClasses({ isActive: false })}`}>
                {content}
            </button>
        );
    };

    return (
        <>
            {isDesktop ? (
                <nav className="fixed top-0 left-0 h-full flex flex-col items-center py-6 backdrop-blur-xl z-[100] w-20">
                    <NavLink to={user?.selected ? dashboardPath : "/"} className="flex flex-col items-center pt-8 pb-6">
                        <motion.img
                            src={isDark ? "/darklogo.png" : "/lightlogo.png"}
                            alt="Logo"
                            className="h-8 transform rotate-90"
                        />
                    </NavLink>
                    <div className="flex flex-col items-start gap-2 mt-8">
                        {navLinks.map((item, idx) => (
                            <NavLinkItem
                                key={idx}
                                to={item.path}
                                name={item.name}
                                icon={item.icon}
                                onClick={item.onClick}
                                activePath={window.location.pathname.substring(1)}
                                shortcut={item.shortcut}
                            />
                        ))}
                    </div>
                    {user?.selected && (
                        <div className="relative my-6 flex items-center justify-center">
                            <svg className="w-14 h-14 transform rotate-90">
                                <circle
                                    className="text-gray-300 dark:text-gray-700"
                                    strokeWidth="4"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="18"
                                    cx="28"
                                    cy="28"
                                />
                                <motion.circle
                                    className={`${getStorageColor()}`}
                                    strokeWidth="4"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="18"
                                    cx="28"
                                    cy="28"
                                    initial={{ strokeDashoffset: circleCircumference }}
                                    animate={{ strokeDashoffset: strokeDashoffset }}
                                    transition={{ duration: 1 }}
                                />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                                {Math.round(displayPercentage)}%
                            </div>
                        </div>
                    )}
                    <div className="mt-auto">
                        {user?.selected ? (
                            <motion.button
                                onClick={() => setProfileOpen(true)}
                                className="relative focus:outline-none rounded-full overflow-hidden p-1.5 ring-2 ring-blue-400 dark:ring-purple-500 hover:ring-blue-600 dark:hover:ring-purple-700 transition-all duration-300"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src={getUserProfileImage()}
                                    alt={user.selected.name || "User Profile"}
                                    className="h-10 w-10 rounded-full object-cover shadow-md"
                                    loading="lazy"
                                />
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={() => navigate("/signup")}
                                className="text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform font-inter"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiLogIn className="inline-block mr-2 text-xl" /> Login
                            </motion.button>
                        )}
                    </div>
                </nav>
            ) : (
                <>
                    {!isMobileNavOpen && (
                        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-transparent dark:bg-transparent border-b border-gray-100 dark:border-zinc-800">
                            <div className="container mx-auto flex items-center justify-between py-2 px-4 sm:px-6 lg:px-8">
                                <motion.button
                                    ref={menuButtonRef}
                                    onClick={toggleMobileNav}
                                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
                                    aria-expanded={isMobileNavOpen}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isMobileNavOpen ? <FiArrowLeft className="h-7 w-7" /> : <FiMenu className="h-7 w-7" />}
                                </motion.button>
                                <NavLink to={user?.selected ? dashboardPath : "/"} className="flex flex-col items-center">
                                    <motion.img
                                        src={isDark ? "/darklogo.png" : "/lightlogo.png"}
                                        alt="Logo"
                                        className="h-8 cursor-pointer"
                                    />
                                </NavLink>
                                <div className="flex items-center">
                                    {user?.selected ? (
                                        <motion.button
                                            onClick={() => setProfileOpen(true)}
                                            className="relative focus:outline-none rounded-full overflow-hidden p-1.5"
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <img
                                                src={getUserProfileImage()}
                                                alt={user.selected.name || "User Profile"}
                                                className="h-8 w-8 rounded-full object-cover shadow-md ring-1 ring-blue-400 dark:ring-purple-500"
                                                loading="lazy"
                                            />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={() => navigate("/signup")}
                                            className="text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 px-3 py-1.5 rounded-full shadow-lg transition-all"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiLogIn className="inline-block mr-1" /> Login
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </nav>
                    )}
                    <AnimatePresence>
                        {isMobileNavOpen && (
                            <motion.div
                                ref={mobileNavRef}
                                initial={{ opacity: 0, x: "-100%" }}
                                animate={{ opacity: 1, x: "0%" }}
                                exit={{ opacity: 0, x: "-100%" }}
                                transition={{ duration: 0.3 }}
                                className="fixed top-0 left-0 w-full h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl py-6 border-r border-gray-100 dark:border-zinc-800 z-[40] flex flex-col items-center"
                            >
                                <div className="flex items-center justify-between w-full px-4 mb-6">
                                    <motion.button
                                        onClick={toggleMobileNav}
                                        className="p-2 rounded-full text-gray-700 dark:text-gray-300 transition-colors duration-200 focus:outline-none hover:bg-gray-100 dark:hover:bg-zinc-800"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiArrowLeft className="h-7 w-7" />
                                    </motion.button>
                                    <NavLink to={user?.selected ? dashboardPath : "/"} onClick={toggleMobileNav}>
                                        <motion.img
                                            src={isDark ? "/darklogo.png" : "/lightlogo.png"}
                                            alt="Logo"
                                            className="h-10 cursor-pointer"
                                        />
                                    </NavLink>
                                </div>
                                <nav className="flex flex-col items-end gap-4 w-full px-4 flex-grow">
                                    {navLinks.map((item, idx) => (
                                        <MobileNavLinkItem
                                            key={idx}
                                            to={item.path}
                                            name={item.name}
                                            icon={item.icon}
                                            onClick={item.onClick}
                                            shortcut={item.shortcut}
                                        />
                                    ))}
                                </nav>
                                <div className="py-6 w-full px-4">
                                    {user?.selected ? (
                                        <motion.button
                                            onClick={() => { setProfileOpen(true); setIsMobileNavOpen(false); }}
                                            className="flex items-center gap-3 w-full justify-start px-4 py-2 rounded-lg text-base font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors duration-300"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <img
                                                src={getUserProfileImage()}
                                                alt={user.selected.name || "User Profile"}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                            <span className="truncate">{user.selected.name || user.selected.username}</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={() => { navigate("/signup"); setIsMobileNavOpen(false); }}
                                            className="text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 px-5 py-2.5 rounded-full shadow-lg transition-all transform font-inter w-full flex items-center justify-start"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiLogIn className="inline-block mr-2 text-xl" /> Login
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            <Suspense fallback={<Loading />}>
                <AnimatePresence>
                    {profileOpen && (
                        <div
                            className="fixed inset-0 z-[100] flex flex-col items-center py-4 bg-black/30 backdrop-blur-sm overflow-y-auto"
                            onClick={() => setProfileOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <LazyUserProfileModal
                                    isOpen={profileOpen}
                                    onClose={() => setProfileOpen(false)}
                                    modalRef={modalRef}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isHistoryOpen && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: "0%" }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg z-50 overflow-y-auto"
                        >
                            <div className="flex justify-start p-4">
                                <motion.button
                                    onClick={toggleHistory}
                                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 transition-colors duration-200 focus:outline-none hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Close history"
                                >
                                    <FiArrowLeft className="h-6 w-6" />
                                </motion.button>
                            </div>
                            <HistoryComponent />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Suspense>
        </>
    );
};

export default Navbar;