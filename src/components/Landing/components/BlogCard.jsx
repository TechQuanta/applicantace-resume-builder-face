import React from "react";

const BlogCard = ({ title, category, views, likes, onLike, liked }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md space-y-2 h-full">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{category}</p>
      <div className="flex justify-between items-center pt-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">👁️ {views}</span>
        <button
          onClick={onLike}
          disabled={liked}
          className={`px-3 py-1 text-sm rounded ${
            liked ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          👍 {likes}
        </button>
      </div>
    </div>
  );
};

export default BlogCard;