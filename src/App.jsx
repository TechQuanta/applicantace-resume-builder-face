// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RouterWithSuspense from "./router/AppRouter";
import { useSetRecoilState } from "recoil"; // Import useSetRecoilState
import { blogCardsState, blogLoadingState } from "./services/blogAtom"; // Import your blog atoms

const FETCH_URL =
  "https://script.google.com/macros/s/AKfycbyYnPueLr68BIrwmg04JsrLegDciYTCyHyWqjybVCmdFvJmFp9xN7jy61NNoBIsQ-dj/exec";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Recoil setters for blog data
  const setBlogCards = useSetRecoilState(blogCardsState);
  const setBlogLoading = useSetRecoilState(blogLoadingState);

  useEffect(() => {
    // System theme detection
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(prefersDark.matches);

    const handleChange = (e) => setIsDark(e.matches);
    prefersDark.addEventListener("change", handleChange);

    // --- Start: Fetch Blog Data on App Load ---
    const fetchBlogData = async () => {
      setBlogLoading(true); // Indicate that blog data is loading
      try {
        const res = await fetch(FETCH_URL);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        const formatted = data.map((item, idx) => ({
          id: idx,
          title: item.Question,
          category: "Resume Advice",
          views: Math.floor(Number(item.View || 0) / 2),
          likes: Number(item.Like || 0),
          clicks: Math.floor(Number(item.Click || 0) / 2),
          answer: item.Answer,
          rating: Number(item.Rating || 0),
        }));

        formatted.sort((a, b) => b.rating - a.rating);
        setBlogCards(formatted); // Store fetched data in Recoil
      } catch (err) {
        console.error("Failed to fetch blog data in App.jsx:", err);
        // Optionally, handle error state for blog data
      } finally {
        setBlogLoading(false); // Blog data loading complete
      }
    };

    fetchBlogData();
    // --- End: Fetch Blog Data on App Load ---

    // Initial loading screen timer
    const appLoadTimer = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      clearTimeout(appLoadTimer);
      prefersDark.removeEventListener("change", handleChange);
    };
  }, [setBlogCards, setBlogLoading]); // Dependencies for useEffect: Recoil setters

  // Memoized motion components for performance
  const MotionDiv = useMemo(() => motion.div, []);
  const MotionImg = useMemo(() => motion.img, []);
  const MotionP = useMemo(() => motion.p, []);
  const MotionSpan = useMemo(() => motion.span, []);

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
  };

  const patternSquareVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const commonMotionProps = (duration = 1.5, delay = 0.2, ease = "easeOut") => ({
    transition: { duration, ease, delay },
  });

  const loadingAnimation = useMemo(() => (
    <AnimatePresence mode="wait">
      <MotionDiv
        key="loader"
        className={`h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden
                    ${isDark ? "dark:from-[#0f0f1a] dark:via-[#1c1c2b] dark:to-[#0f0f1a]" : "bg-gradient-to-br from-indigo-100 via-purple-200 to-blue-100"}`}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, ...commonMotionProps(0.8) }}
      >
        <MotionDiv
          className="absolute inset-0 z-0 opacity-40"
          variants={backgroundVariants}
          initial="hidden"
          animate="visible"
        >
          {[...Array(25)].map((_, i) => (
            <MotionDiv
              key={i}
              className={`absolute rounded-full ${isDark ? "bg-purple-600/20" : "bg-blue-300/30"}`}
              style={{
                width: `${Math.random() * 50 + 20}px`,
                height: `${Math.random() * 50 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: `blur(${Math.random() * 10 + 5}px)`,
              }}
              variants={patternSquareVariants}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: Math.random() * 8 + 4,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </MotionDiv>

        <MotionImg
          src={isDark ? "/lightnavlogo.png" : "/darknavlogo.png"}
          alt="ApplicantAce Logo"
          className="w-36 h-36 md:w-48 md:h-48 z-10 drop-shadow-lg"
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: [0.5, 1.2, 1], opacity: 1, y: 0 }}
          {...commonMotionProps()}
        />

        <div className="w-64 md:w-80 h-4 mt-10 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden relative z-10 shadow-xl">
          <MotionDiv
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            {...commonMotionProps(2.5, 0, "easeInOut")}
          />
          <MotionDiv
            className="absolute top-0 left-0 h-full w-1/4 bg-white/50 dark:bg-white/30 transform -skew-x-12"
            initial={{ x: "-100%" }}
            animate={{ x: "400%" }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity, repeatDelay: 0.5 }}
          />
        </div>

        <MotionP
          className="mt-8 text-xl md:text-2xl font-extrabold tracking-wide text-gray-800 dark:text-gray-100 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...commonMotionProps(1, 1.8)}
        >
          Welcome to{" "}
          <MotionSpan
            className="inline-block text-indigo-700 dark:text-purple-400"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.05, 1] }}
            {...commonMotionProps(0.8, 2.2)}
          >
            ApplicantAce
          </MotionSpan>
        </MotionP>

        <MotionDiv
          className="flex space-x-2 mt-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          {[0, 1, 2].map((i) => (
            <MotionSpan
              key={i}
              className="block w-3 h-3 rounded-full bg-indigo-500 dark:bg-purple-300"
              animate={{ y: ["0%", "-50%", "0%"], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          ))}
        </MotionDiv>

        <p className="absolute bottom-6 right-6 text-sm text-gray-600 dark:text-gray-400 z-10">
          Trouble loading?{" "}
          <a
            href="/help"
            className="underline font-medium hover:text-indigo-700 dark:hover:text-purple-300 transition-colors"
            rel="noopener noreferrer"
            aria-label="Go to Help Centre"
          >
            Help Centre of ApplicantAce
          </a>
        </p>
      </MotionDiv>
    </AnimatePresence>
  ), [isDark]);

  return isLoading ? loadingAnimation : <RouterWithSuspense />;
};

export default App;