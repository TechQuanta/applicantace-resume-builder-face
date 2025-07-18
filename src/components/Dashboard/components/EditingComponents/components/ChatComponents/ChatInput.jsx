import React from 'react';
import { ArrowUp } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSendMessage, loading, showHistory, autoCoverLetterMode, matchJobDescription, theme, fontSize }) => {
  const placeholderText = autoCoverLetterMode
    ? 'Tell Jot details for your cover letter (e.g., role, company, skills, passion)...'
    : (matchJobDescription ? 'Describe your experience...' : 'Type your message...');

  // The onSubmit handler is the SOLE entry point for sending the message
  const onSubmit = (e) => {
    e.preventDefault(); // IMPORTANT: Prevent default browser form submission
    // Add the checks here so handleSendMessage is only called if conditions are met
    if (!input.trim() || loading || showHistory) {
      // Input is empty, loading, or history visible. Not sending.
      return;
    }
    handleSendMessage();
  };

  return (
    <div className={`flex items-center p-4 border-t ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-zinc-800 border-zinc-700'} flex-shrink-0 rounded-b-3xl`}>
      <form onSubmit={onSubmit} className="flex flex-grow">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              // Only prevent default if it's a plain Enter to avoid newline
              e.preventDefault();
            }
          }}
          placeholder={placeholderText}
          className={`flex-grow rounded-full px-5 py-2.5 border outline-none mr-3 shadow-sm
            ${theme === 'light'
              ? 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
              : 'bg-zinc-700 border-zinc-600 text-gray-100 focus:ring-blue-400 focus:border-blue-400'
            } ${fontSize}`}
          disabled={loading || showHistory}
        />
        <button
          type="submit" // Keep type="submit" to trigger form onSubmit
          className={`p-3 rounded-full shadow-md transition-all duration-200
            ${input.trim() && !loading && !showHistory
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 dark:bg-zinc-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          disabled={!input.trim() || loading || showHistory}
          aria-label="Send message"
        >
          <ArrowUp size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;