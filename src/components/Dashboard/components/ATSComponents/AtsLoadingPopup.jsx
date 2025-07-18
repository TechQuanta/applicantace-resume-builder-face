// AtsLoadingPopup.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactSpeedometer from "react-d3-speedometer";

/**
 * AtsLoadingPopup Component
 * Displays a loading popup with an animated speedometer while the ATS analysis is in progress.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isLoading - A boolean indicating whether the loading popup should be visible.
 * @param {number} props.animatedScore - The current value for the speedometer needle animation.
 * @param {function} props.onClose - A function to call when the popup needs to be closed (e.g., by a manual close button).
 */
const AtsLoadingPopup = ({ isLoading, animatedScore }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white dark:bg-zinc-900   p-8 max-w-md w-full text-center border border-gray-200 dark:border-zinc-700"
          >
            <h2 className="text-2xl font-poppins font-bold text-blue-700 dark:text-blue-400 mb-6">
              Analyzing Your Resume...
            </h2>
            <div className="w-full flex justify-center py-4">
              <ReactSpeedometer
                maxValue={100}
                value={animatedScore} // This value drives the needle animation
                needleColor="#334155"
                segments={1000} // More segments for smoother color transitions
                segmentColors={[
                  "#ef4444", // Red (Awful)
                  "#f97316", // Orange (Poor)
                  "#facc15", // Yellow (Fair)
                  "#84cc16", // Light Green (Good)
                  "#22c55e", // Green (Excellent)
                  "#16a34a"  // Dark Green (Perfect!)
                ]}
                customSegmentStops={[0, 20, 40, 60, 80, 95, 100]} // Define segment boundaries
                currentValueText="Analyzing..." // Text displayed in the center
                valueTextFontWeight="bold"
                valueTextFontSize="32px"
                valueTextFontFamily="space-grotesk" // Applied new font
                labelFontWeight="normal"
                height={200}
                width={300}
                ringWidth={35} // Increased ring width for visual impact
                needleTransitionDuration={10} // Speed of the needle's instantaneous movement
                needleTransition="easeCubicOut"
                needleHeightRatio={0.8}
                maxSegmentLabels={5} // Limit the number of labels to avoid clutter
                valueTextColor="#334155"
                segmentScale={1}
                fluidWidth={false}
                forceRender={true}
                paddingHorizontal={0}
                paddingVertical={0}
                customSegmentLabels={[
                  { text: "Awful", position: "OUTSIDE", color: "#ef4444", fontSize: "10px", fontFamily: "lato" },
                  { text: "Poor", position: "OUTSIDE", color: "#f97316", fontSize: "10px", fontFamily: "lato" },
                  { text: "Fair", position: "OUTSIDE", color: "#facc15", fontSize: "10px", fontFamily: "lato" },
                  { text: "Good", position: "OUTSIDE", color: "#84cc16", fontSize: "10px", fontFamily: "lato" },
                  { text: "Excellent", position: "OUTSIDE", color: "#22c55e", fontSize: "10px", fontFamily: "lato" },
                  { text: "Perfect!", position: "OUTSIDE", color: "#16a34a", fontSize: "10px", fontFamily: "lato" },
                ]}
              />
            </div>
            <p className="text-center font-open-sans text-blue-500 dark:text-blue-400 text-md mt-4 animate-pulse">
              Please wait while we process your resume...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AtsLoadingPopup;