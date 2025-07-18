import React from 'react';
import { Bot, Settings, MessageSquare, History } from 'lucide-react';
// motion from framer-motion is not directly used here, so it can be removed
// import { motion } from 'framer-motion';

const ChatHeader = ({ theme, showHistory, onToggleHistory, onOpenSettings }) => (
  <div className={`flex items-center justify-between p-2 border-b ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-zinc-800 border-zinc-700'} flex-shrink-0 rounded-t-3xl`}>
    {/* Applied font-poppins for the "JOT" heading */}
    <h2 className={`text-xl font-extrabold ${theme === 'light' ? 'text-zinc-800' : 'text-white'} font-poppins`}>
      <Bot size={20} className="inline mr-2 text-green-500" /> JOT
    </h2>
    <div className="flex gap-2 pr-7">
      {/* Toggle History Button */}
      <button
        onClick={onToggleHistory}
        className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-2 font-semibold transition-colors duration-200
          ${showHistory
            ? 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700'
            : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-600'
          }`}
        aria-label={showHistory ? "Back to Chat" : "View Chat History"}
      >
        {showHistory ? <MessageSquare size={16} /> : <History size={16} />}
        <span className="hidden sm:inline">{showHistory ? '' : ''}</span>
      </button>

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        aria-label="Open settings"
        className={`p-2 rounded-full transition-colors duration-200
          ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:bg-zinc-700'}`}
      >
        <Settings size={20} />
      </button>
    </div>
  </div>
);

export default ChatHeader;