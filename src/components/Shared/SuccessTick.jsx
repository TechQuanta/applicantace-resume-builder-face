// components/SuccessTick.jsx (or wherever you prefer)
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa'; // Assuming you have react-icons installed

/**
 * A reusable component to display a success tick mark.
 * @param {object} props - Component props.
 * @param {string} [props.className="text-green-500"] - Additional CSS classes for styling the icon.
 * @param {number} [props.size=48] - Size of the icon in pixels.
 * @returns {JSX.Element} The SuccessTick component.
 */
const SuccessTick = ({ className = "text-green-500", size = 48 }) => {
  return (
    <div className="flex justify-center items-center py-4">
      <FaCheckCircle className={className} size={size} />
    </div>
  );
};

export default SuccessTick;