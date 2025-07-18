import React from "react";


const FeaturedBlog = () => {
  return (
    <div className="backdrop-blur-md bg-white/60 border border-white/30 shadow-xl rounded-3xl overflow-hidden flex flex-col lg:flex-row">
      <div className="lg:w-1/2 bg-cyan-200/40 p-6 flex justify-center items-center">
        <img
          src="main/createresume.gif" // or your uploaded image path
          alt="Featured"
          className="max-w-full rounded-xl"
        />
      </div>
      <div className="lg:w-1/2 p-8 space-y-4">
        <span className="text-xs tracking-widest uppercase text-gray-600 font-semibold bg-white/40 px-3 py-1 rounded-full">
          Start Here
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          The 10-Step Guide to Writing a Winning Resume
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          Craft a standout resume that captures your unique strengths and propels you
          toward your dream career with these expert tips and strategies.
        </p>
        <a
          href="https://www.michaelpage.co.in/advice/career-advice/resume-and-cover-letter/how-to-write-winning-resume"
          className="inline-block mt-2 text-sm font-medium text-purple-700 hover:underline transition"
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
};

export default FeaturedBlog;