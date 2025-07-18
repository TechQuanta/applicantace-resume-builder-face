import React, { useState, useEffect } from "react";

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let currentProgress = 0;
    let interval;

    const startLoadingSimulation = () => {
      setIsVisible(true);
      currentProgress = 0;
      setProgress(0);

      interval = setInterval(() => {
        // Increment progress randomly for a more natural, non-linear feel
        currentProgress += Math.random() * (15 - 5) + 5;

        if (currentProgress >= 100) {
          currentProgress = 100; // Cap at 100%
          clearInterval(interval); // Stop the interval
          setProgress(100); // Set final progress to 100%

          // After reaching 100%, keep the bar visible for a short duration, then hide it
          setTimeout(() => {
            setIsVisible(false); // Hide the component
          }, 500); // Bar stays at 100% for 0.5 seconds before disappearing
        } else {
          setProgress(Math.floor(currentProgress)); // Update state with integer progress
        }
      }, 150); // Update every 150 milliseconds (adjust for speed)
    };

    startLoadingSimulation(); // Start the simulation when the component mounts

    // Cleanup function: Clear the interval if the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // If the bar is not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  const glowLight = 'drop-shadow-[0_0_5px_rgba(59,130,246,0.7)] dark:drop-shadow-[0_0_7px_rgba(96,165,250,0.8)]'; // Blue glow
  const glowDark = 'drop-shadow-[0_0_5px_rgba(139,92,246,0.7)] dark:drop-shadow-[0_0_7px_rgba(168,122,255,0.8)]'; // Purple glow

  return (
    // Outer container: Fixed at the top, spans full width, acts as the track for the progress bar.
    // The track color also changes based on the theme.
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-gray-200 dark:bg-gray-700 overflow-hidden">
      {/* Inner div: This is the actual progress bar that fills up. */}
      {/* Added 'drop-shadow' classes for the glowing effect. */}
      <div
        className={`h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                   dark:from-cyan-400 dark:via-indigo-500 dark:to-purple-600
                   ${glowLight} rounded-sm
                   transition-all duration-300 ease-out flex items-center justify-end pr-1`}
        style={{ width: `${progress}%` }}
      >
        {/* Percentage display: Only shown if there's enough space */}
        {progress >= 10 && (
          <span className="text-[0.6rem] font-bold text-white leading-none">
            {progress}%
          </span>
        )}
      </div>
    </div>
  );
};

export default Loading;