// src/components/DesignAndFontShowcase.jsx

import React from 'react';
import { FONT_OPTIONS } from '../../../../utils/constants'; // Adjust path if necessary

const DesignAndFontShowcase = () => {
    // Base example text for normal styles
    const exampleText = "Your resume is your professional spotlight";
    // Separate, shorter example text for italic style, maintaining the theme
    const exampleTextItalic = "Showcase your talents and take control of your future.";

    // Define the weights we want to display for normal style.
    const fontWeights = [
        { className: 'font-light' },
        { className: 'font-normal' },
        { className: 'font-bold' },
        { className: 'font-black' }, // Tailwind's highest weight is 'black' (900)
    ];

    // Helper to generate a random pastel-like color for card backgrounds
    const getRandomPastelColor = () => {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 20) + 70; // 70-90% saturation
        const lightness = Math.floor(Math.random() * 10) + 80; // 80-90% lightness
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    return (
        // Main container with fixed height, overflow, and the background effects
        <div
            className="relative h-[600px] w-full bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100"
        >
            {/* Animated Background Blobs */}
            <div className="absolute top-[-5rem] left-[-5rem] w-72 h-72 bg-purple-300 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse z-0"></div>
            <div className="absolute bottom-[-5rem] right-[-5rem] w-72 h-72 bg-blue-300 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700 z-0"></div>

            {/* Scrollable Content Container */}
            <div className="relative z-10 overflow-y-auto h-full p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-headline text-center">
                    Available Font Styles & Weights
                </h2>
                {/* Grid layout for font cards */}
                <div className="grid grid-cols-1 gap-4">
                    {FONT_OPTIONS.map((font, index) =>
                        // Skip the "Default (Choose Fonts)" option
                        font.value === '' ? null : (
                            <div
                                key={index}
                                // Apply a random pastel background color as the base
                                style={{ backgroundColor: getRandomPastelColor() }}
                                className="relative p-3 rounded-lg shadow-md overflow-hidden
                                           border border-gray-200 dark:border-gray-600
                                           group hover:scale-[1.02] transition-transform duration-200 ease-in-out"
                            >
                                {/* This is the blur overlay that creates the "frosted glass" effect
                                    It sits on top of the solid pastel background but behind the text content. */}
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-0 rounded-lg"></div> {/* Increased opacity for better blur visibility */}

                                <div className="relative z-10 backdrop-blur-sm"> {/* Ensure text content is above the blur overlay */}
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 font-label">
                                        {font.label}
                                    </h3>
                                    <div className="space-y-2">
                                        {fontWeights.map((weight, weightIndex) => (
                                            <div key={weightIndex}>
                                                <p className={`text-base text-gray-800 dark:text-gray-200
                                                              ${`font-${font.value}`} ${weight.className}`}>
                                                    {exampleText}
                                                </p>
                                            </div>
                                        ))}
                                        {/* Show Italic only once at the end, for normal weight */}
                                        <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                                            <p className={`text-base text-gray-800 dark:text-gray-200
                                                           ${`font-${font.value}`} font-normal italic`}>
                                                {exampleTextItalic}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignAndFontShowcase;