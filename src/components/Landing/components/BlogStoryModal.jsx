import React from 'react';

// This component uses basic Tailwind CSS for transitions.
// If you want more advanced animations (like spring animations),
// you might consider installing 'framer-motion' (npm install framer-motion)
// and uncommenting the AnimatePresence and motion imports/components.

const BlogStoryModal = ({ isOpen, onClose, post }) => {
  // If the modal isn't open or there's no post data, don't render anything.
  if (!isOpen || !post) return null;

  // Placeholder story content. In a real application, 'post.story' would
  // ideally come from a full article fetched from an API or be pre-loaded.
  const storyContent = post.story || `
    This is a placeholder story for "${post.question}".

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    **Further Details:**

    Proin efficitur, felis et tristique eleifend, libero dolor mollis sem, id pulvinar justo metus in odio. Nam at augue sit amet erat euismod finibus. Mauris quis felis vitae enim consequat feugiat eget id nulla. Praesent in sem eu justo efficitur fringilla vel ac sapien. Aliquam erat volutpat. Curabitur consectetur, mi eget ultricies commodo, libero est dictum turpis, nec gravida mauris nulla vel purus.

    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus eu magna sit amet libero scelerisque dignissim. Fusce ac tortor sed tortor convallis auctor. Sed non orci et neque vulputate aliquet. Etiam vel est nec justo cursus consectetur. Proin vitae libero sit amet sapien tincidunt commodo. Quisque et orci et nisi vulputate ullamcorper at nec mauris. Praesent in purus non nisi ullamcorper rhoncus.
    ${post.name ? `\n\n--- By ${post.name}` : ''}
  `;

  return (
    // Backdrop overlay: Fixed, full screen, semi-transparent. Closes modal on click outside.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm transition-opacity duration-300 ease-out"
      onClick={onClose}
    >
      {/* Modal content container: Centered, responsive size, white/dark background, rounded, shadow. */}
      {/* Uses transform for initial off-screen positioning and transition for smooth entry. */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col transform scale-95 opacity-0 transition-all duration-300 ease-out"
        // Prevent click inside modal from closing it
        onClick={(e) => e.stopPropagation()}
        // Add classes for entry animation (will be overridden by 'isOpen' state with the parent)
        style={isOpen ? { transform: 'scale(1) translateY(0)', opacity: 1 } : {}}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close story"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Modal Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2 pr-10">
            {post.question}
          </h2>
          <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-400 gap-x-4 gap-y-1">
            <span>By **{post.name || 'Anonymous'}**</span>
            <span>• Published: {post.published}</span>
            <span>• Read Time: {post.readTime}</span>
          </div>
        </div>

        {/* Modal Content (Scrollable) */}
        {/* The 'prose' class from Tailwind Typography Plugin helps format text nicely. */}
        {/* If you don't have it, install: npm install -D @tailwindcss/typography */}
        {/* Then add to tailwind.config.js: plugins: [require('@tailwindcss/typography')] */}
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-lg text-gray-800 dark:text-gray-200 leading-relaxed prose dark:prose-invert max-w-none">
          {/* Using dangerouslySetInnerHTML for markdown-like text. Be careful with external user input. */}
          <p dangerouslySetInnerHTML={{ __html: storyContent.replace(/\n/g, '<br />') }}></p>
        </div>

        {/* Optional: Footer in Modal */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Enjoyed this insight? Share it with your network!
        </div>
      </div>
    </div>
  );
};

export default BlogStoryModal;

/*
  Add these custom scrollbar styles to your main CSS file (e.g., globals.css or index.css)
  for a cleaner look of the scrollbar within the modal:

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #a8b0c0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #888;
  }

  @media (prefers-color-scheme: dark) {
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #374151; // dark-gray-700
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #4b5563; // dark-gray-600
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #6b7280; // dark-gray-500
    }
  }
*/