// src/components/Home/ChatComponents/ChatSettings.jsx
import React from 'react';
import { Sun, Moon, BookOpen, Mail, Lightbulb } from 'lucide-react'; // Ensure Lightbulb is imported

const ChatSettings = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  researchedMode,
  setResearchedMode,
  autoCoverLetterMode,
  setAutoCoverLetterMode,
  matchJobDescription,
  setMatchJobDescription,
  jobDescription,
  setJobDescription,
  onClearHistory,
  // PROPS FOR SUGGESTIONS (correctly destructured here)
  enableSuggestions,
  setEnableSuggestions,
}) => {
  return (
    <div className="flex flex-col gap-4">

      {/* Font Size Selector */}
      <label className="flex items-center justify-between text-zinc-800 dark:text-white">
        <span>Font Size:</span>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm font-medium
            bg-white dark:bg-zinc-700 text-zinc-900 dark:text-gray-100
            border-gray-300 dark:border-zinc-600"
        >
          <option value="text-sm">Small</option>
          <option value="text-base">Medium</option>
          <option value="text-lg">Large</option>
        </select>
      </label>

      {/* Researched Mode Toggle - Now descriptive */}
      <label className="flex items-center justify-between text-zinc-800 dark:text-white">
        <span>Researched Mode:</span>
        <button
          onClick={() => setResearchedMode(prev => !prev)}
          className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-2 font-semibold transition-colors duration-200
            ${researchedMode
              ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
              : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-600'
            }`}
        >
          <BookOpen size={16} />
          {researchedMode ? 'Data-driven' : 'Standard'}
        </button>
      </label>

      {/* Auto Write Cover Letter Toggle - Now descriptive */}
      <label className="flex items-center justify-between text-zinc-800 dark:text-white">
        <span>Auto Cover Letter:</span>
        <button
          onClick={() => setAutoCoverLetterMode(prev => !prev)}
          className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-2 font-semibold transition-colors duration-200
            ${autoCoverLetterMode
              ? 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700'
              : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-600'
            }`}
        >
          <Mail size={16} />
          {autoCoverLetterMode ? 'Generate CL' : 'Manual'}
        </button>
      </label>

      {/* Enable Keyword Suggestions Toggle - Now descriptive ("Bold & Italic") */}
      <label className="flex items-center justify-between text-zinc-800 dark:text-white">
        <span>Enable Keyword Suggestions:</span>
        <button
          onClick={() => setEnableSuggestions(prev => !prev)}
          className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-2 font-semibold transition-colors duration-200
            ${enableSuggestions
              ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' // Green for ON
              : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:border-zinc-600 dark:hover:bg-zinc-600'
            }`}
        >
          <Lightbulb size={16} />
          {enableSuggestions ? 'Bold & Italic' : 'Disabled'}
        </button>
      </label>

      {/* Match Job Description (checkbox, remains as is) */}
      <label className="flex items-center gap-2 text-zinc-800 dark:text-white">
        <input
          type="checkbox"
          checked={matchJobDescription}
          onChange={() => setMatchJobDescription(!matchJobDescription)}
          className="form-checkbox h-5 w-5 text-indigo-600 dark:bg-gray-700 dark:border-gray-600 rounded"
        />
        Match Job Description
      </label>
      {matchJobDescription && (
        <textarea
          rows={3}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter job description for highlighting relevant terms..."
          className="w-full border rounded-lg px-3 py-2 text-sm font-medium
            bg-white dark:bg-zinc-700 text-zinc-900 dark:text-gray-100
            border-gray-300 dark:border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
        />
      )}

      <hr className="border-t border-gray-200 dark:border-zinc-700 my-2" />

      {/* Clear History Button */}
      <button
        onClick={onClearHistory}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
      >
        Clear All History
      </button>
    </div>
  );
};

export default ChatSettings;