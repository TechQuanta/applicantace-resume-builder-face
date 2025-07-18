import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

const LinkedInIcon = () => (
    <svg
      className="w-5 h-5 inline-block text-blue-600 dark:text-blue-400"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="img"
    >
      <path d="M4.983 3.5C3.668 3.5 2.5 4.667 2.5 5.982a1.5 1.5 0 0 0 3 0c0-1.315-1.168-2.482-2.517-2.482zM2 8h6v12H2V8zm7 0h5.5v1.737h.078c.768-1.45 2.644-2.978 5.444-2.978 5.823 0 6.5 3.838 6.5 8.827V20H18v-7.5c0-1.7-.035-3.886-2.37-3.886-2.37 0-2.73 1.849-2.73 3.75V20H9V8z" />
    </svg>
  );

const developers = [
    {
      name: "Ashmeet Singh",
      role: "Data Science Engineer",
      linkedin: "https://www.linkedin.com/in/ashmeet-singh-192610225/",
    },
    {
      name: "Prerna Perwani",
      role: "Software Developer",
      linkedin: "https://www.linkedin.com/in/prernaperwani/", 
    },
    {
      name: "Himanshu Sahu",
      role: "Data Science Engineer",
      linkedin: "https://www.linkedin.com/in/himanshu-sahu-239b97223/", 
    },
  ];

const Documentation = () => {
  return (
    <section className="flex flex-col items-center justify-center w-full min-h-[70vh] px-6 py-8 gap-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-open-sans text-center">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-4 font-montserrat">
          Documentation
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 font-open-sans">
          This section is coming soon.
        </p>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {developers.map((dev) => (
            <motion.article
              key={dev.name}
              className="
                bg-transparent
                border-none   
                p-6
                flex flex-col items-center text-center
                transition-transform duration-300 ease-in-out
                hover:-translate-y-1 hover:shadow-2xl
              "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              aria-label={`${dev.name} - ${dev.role}`}
            >
              <a
                href={dev.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex space-x-3
                  ml-16 mt-[-10%]
                  bg-transparent dark:bg-transparent
                  text-black dark:text-gray-100
                  rounded-lg
                  font-semibold
                  hover:bg-none dark:hover:bg-blue-600
                  transition-colors duration-200
                "
                aria-label={`LinkedIn profile of ${dev.name}`}
              >
                <LinkedInIcon />
              </a>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 font-montserrat">{dev.name}</h4>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-5 font-open-sans">{dev.role}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Documentation;