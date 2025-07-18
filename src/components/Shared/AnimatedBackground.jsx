// src/components/AnimatedBackground.jsx
import React from "react";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
      {/* Floating circles */}
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white opacity-20 animate-float"
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
