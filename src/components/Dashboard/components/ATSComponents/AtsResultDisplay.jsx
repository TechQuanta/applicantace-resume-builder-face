import React, { useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartBar // Used for the placeholder
} from "@fortawesome/free-solid-svg-icons";

const AtsResultDisplay = ({
    score,
    fullGeminiResponse,
    error,
}) => {
    useEffect(() => {
        // Configure marked.js options
        marked.setOptions({
            gfm: true,     // Enable GitHub Flavored Markdown
            breaks: true,  // Convert newlines to <br> tags
        });
    }, []);

    const renderMarkdown = (markdown) => {
        if (!markdown) {
            return { __html: "<p>No detailed AI analysis available.</p>" };
        }

        // --- NEW LOGIC: Add a blank line before each markdown heading (h1-h6) ---
        // This regex looks for lines starting with 1 to 6 '#' characters
        // and inserts an extra newline character before them if they aren't already preceded by one.
        // It avoids adding multiple blank lines if one already exists.
        const formattedMarkdown = markdown.replace(/(\n|^)(#+\s.*)/g, '\n\n$2');

        // Parse markdown to HTML
        const rawHtml = marked.parse(formattedMarkdown);

        // Sanitize the HTML to prevent XSS attacks
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);

        return { __html: sanitizedHtml };
    };

    const getDisplayScore = () => {
        if (score !== null && typeof score === 'number' && score >= 0) {
            return Math.round(score);
        }
        // Fallback if score prop isn't a number
        const match = fullGeminiResponse?.match(/(?:ATS Score:|Score:)?\s*(\d+)(?:%|\/100)?/i);
        return match ? Math.round(parseInt(match[1])) : 0;
    };

    const displayScore = getDisplayScore();

    // --- Error Display ---
    if (error) {
        return (
            <motion.div
                className="mt-6 sm:mt-8 p-5 sm:p-6 text-center text-lg sm:text-xl font-montserrat font-bold
                           bg-red-100 dark:bg-red-900
                           text-red-800 dark:text-red-300
                           border border-red-200 dark:border-red-700 shadow-md flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                ⚠️ Error: {error}
            </motion.div>
        );
    }

    // --- Placeholder for "Show Response" tab when no results yet ---
    if (!score && !fullGeminiResponse) {
        return (
            <div className="text-center font-roboto text-zinc-500 dark:text-gray-400 p-8 flex flex-col items-center gap-4">
                <FontAwesomeIcon icon={faChartBar} className="text-blue-400 dark:text-blue-500 text-5xl mb-3" />
                <p className="text-lg font-semibold text-zinc-700 dark:text-gray-300">
                    Your ATS analysis results will appear here.
                </p>
                <p className="text-sm text-zinc-500 dark:text-gray-400">
                    Go to the "Send Request" tab, upload your resume, and click "Get ATS Score" to begin.
                </p>
            </div>
        );
    }

    // --- Main Results Display ---
    return (
        <motion.div
            className="p-5 sm:p-6 bg-gray-50 dark:bg-zinc-800 border border-gray-200 backdrop-blur-sm dark:border-zinc-700 shadow-md flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Final ATS Score Display (as number/percentage) */}
            <div className="flex flex-col items-center justify-center">
                <motion.p
                    className={`text-sm font-montserrat font-bold ${
                        displayScore >= 75 ? 'text-green-600 dark:text-green-400' :
                        displayScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                    }`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                >
                    {displayScore}% ATS Friendly
                </motion.p>
                {displayScore <= 50 && (
                    <p className="text-center font-open-sans text-red-500 dark:text-red-400 text-md mt-4">
                        Your score is low. Review the analysis for significant improvements.
                    </p>
                )}
                {displayScore > 50 && displayScore < 75 && (
                    <p className="text-center font-open-sans text-yellow-600 dark:text-yellow-400 text-md mt-4">
                        Your score is fair. There's room for improvement!
                    </p>
                )}
                {displayScore >= 75 && (
                    <p className="text-center font-open-sans text-green-600 dark:text-green-400 text-md mt-4">
                        Excellent score! Your resume is highly optimized.
                    </p>
                )}
            </div>

            {/* Detailed AI Analysis (Response content) */}
            {fullGeminiResponse && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key="analysis-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex-grow text-zinc-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed overflow-y-auto custom-scrollbar p-2 -mr-2 mb-4 mt-4 font-roboto"
                    >
                        {/* This heading is manually added and styled */}
                        <h3 className="text-lg font-montserrat font-semibold mb-2 text-zinc-700 dark:text-gray-200">Detailed AI Analysis:</h3>
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={renderMarkdown(fullGeminiResponse)}
                        ></div>
                    </motion.div>
                </AnimatePresence>
            )}
        </motion.div>
    );
};

export default AtsResultDisplay;