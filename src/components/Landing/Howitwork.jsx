// src/components/HowItWorks.jsx
import React, { useState, useEffect } from "react";

const steps = [
  {
    id: 1,
    title: "Select a template.",
    image: "main/template.gif",
  },
  {
    id: 2,
    title: "Fill in your details.",
    image: "main/main2.gif",
  },
  {
    id: 3,
    title: "Customize your design.",
    image: "main/main3.gif",
  },
  {
    id: 4,
    title: "Tailor, Check for Errors, and Download.",
    image: "main/main4.gif",
  },
];

const HowItWorks = () => {
  // Theme detection for proper dark mode styling
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    setTheme(prefersDark.matches ? "dark" : "light"); // Set initial theme correctly
    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);

  const isDark = theme === "dark";

  return (
    <section className={`how-it-works-section ${isDark ? 'dark-mode' : 'light-mode'}`}>
      <div className="how-it-works-container">
        {/* Main Title - Using 'font-playfair-display' for an elegant heading */}
        <h2 className={`how-it-works-title font-playfair-display`}>How It Works</h2>

        <div className="how-it-works-grid">
          {steps.map(({ id, title, image }) => (
            <div
              key={id}
              className={`how-it-works-card ${isDark ? 'dark-mode' : 'light-mode'}`}
            >
              {/* Step Title - Using 'font-montserrat' for clear and modern step descriptions */}
              <p className={`how-it-works-card-title ${isDark ? 'dark-mode' : 'light-mode'} font-montserrat`}>{title}</p>
              {/* Step Image */}
              <img
                src={image}
                alt={title}
                className="how-it-works-card-image"
                loading="lazy"
              />

              {/* Step Number - Using 'font-roboto' for clean, readable numbers */}
              <div className={`how-it-works-card-number ${isDark ? 'dark-mode' : 'light-mode'} font-roboto`}>
                {id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;