import React from "react";


const TemplateCard = ({ title, description, image, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.03] hover:ring-2 hover:ring-blue-500 cursor-pointer"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-44 sm:h-48 object-cover rounded-t-2xl"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default TemplateCard;