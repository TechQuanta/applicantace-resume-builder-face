// src/components/Home/HistoryPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  History as HistoryIcon, Type, Smile, Feather, BookOpen,
  ChevronLeft, Briefcase, Sun, Lightbulb, Compass, Mail, Trash2
} from 'lucide-react';

// Import the useUserSession hook
import { useUserSession } from '../../../../hooks/useUserSession';

// Helper to load history from localStorage based on user email
const loadChatHistoryFromLocalStorage = (email) => {
    if (!email) {
        return [];
    }
    try {
        const key = `chatHistory_${email}`;
        const storedHistory = localStorage.getItem(key);
        return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (e) {
        console.error("Error loading chat history from local storage:", e);
        return [];
    }
};

// Helper to save history to localStorage based on user email
const saveChatHistoryToLocalStorage = (history, email) => {
    if (!email) {
        return;
    }
    try {
        const key = `chatHistory_${email}`;
        localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
        console.error("Error saving chat history to local storage:", e);
    }
};


export default function HistoryPage() {
  // Get the user's email from the session hook
  const { user: userSession } = useUserSession();
  const userEmail = userSession?.selected?.email || null;

  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showClearHistoryTooltip, setShowClearHistoryTooltip] = useState(false);

  // Formats raw messages into paired user-bot history entries
  const formatAndSetHistory = useCallback((messages) => {
    const pairedHistory = [];
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].type === 'user' && messages[i + 1].type === 'bot') {
        pairedHistory.push({
          id: messages[i].id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userInput: messages[i].content,
          botOutput: messages[i + 1].content,
          tone: messages[i].tone || messages[i + 1].tone,
          style: messages[i].style || messages[i + 1].style,
          jobDescription: messages[i].jobDescription || messages[i + 1].jobDescription,
          researchedModeHistory: messages[i].researchedMode || false,
          autoCoverLetterModeHistory: messages[i].autoCoverLetterMode || false,
          timestamp: messages[i].timestamp || new Date().toISOString(),
        });
        i++; // Skip the bot message as it's paired
      }
    }
    // Sort history by timestamp, newest first
    pairedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setHistory(pairedHistory);
  }, []);

  // Effect to load history based on user email
  useEffect(() => {
    const messages = loadChatHistoryFromLocalStorage(userEmail);
    formatAndSetHistory(messages);
  }, [userEmail, formatAndSetHistory]);

  // Determines which Lucide icon to display based on the tone
  const getIconForTone = (tone) => {
    switch (tone) {
      case 'Formal': return <Type size={14} className="text-indigo-600 dark:text-indigo-300" />;
      case 'Casual': return <Smile size={14} className="text-lime-600 dark:text-lime-300" />;
      case 'Creative': return <Feather size={14} className="text-rose-600 dark:text-rose-300" />;
      case 'Researched': return <BookOpen size={14} className="text-teal-600 dark:text-teal-300" />;
      case 'Professional': return <Briefcase size={14} className="text-blue-600 dark:text-blue-300" />;
      default: return <Lightbulb size={14} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  // Sets the selected entry for detailed view
  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
  };

  // Clears the selected entry to return to the history list
  const handleBackToHistory = () => {
    setSelectedEntry(null);
  };

  // Clears all chat history from local storage and state
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
      // Clear the history for the current user's email
      saveChatHistoryToLocalStorage([], userEmail);
      setHistory([]);
      setSelectedEntry(null);
      setShowClearHistoryTooltip(false);
    }
  };

  // Render a message when history is empty
  if (history.length === 0) {
    return (
      <div className="w-full h-[700px] flex flex-col justify-center items-center p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 animate-fade-in text-center">
        <Compass size={48} className="text-gray-400 dark:text-gray-600 mb-4 animate-pulse-slow" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Destiny's blank pages await.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Start your journey, illuminate this sacred record.
        </p>
        <div className="mt-6">
          <button className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1 text-sm">
            New Vaak <Sun size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Main rendering of history list or detailed entry view
  return (
    <div className="w-full h-[600px] flex flex-col px-3 py-2 bg-transparent font-serif antialiased">
      <h1 className="text-2xl font-extrabold text-center mb-4 flex items-center justify-center gap-2 text-gray-900 dark:text-amber-300 drop-shadow-sm">
        <div
          className="relative ml-4"
          onMouseEnter={() => setShowClearHistoryTooltip(true)}
          onMouseLeave={() => setShowClearHistoryTooltip(false)}
        >
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
            aria-label="Clear History"
          >
            <Trash2 size={20} />
          </button>
          {showClearHistoryTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap animate-fade-in-up z-10">
              Clear All History
            </div>
          )}
        </div>
        <HistoryIcon className="text-gray-700 dark:text-amber-300" size={28} /> History
      </h1>

      {selectedEntry ? (
        // Detailed view of a single history entry
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-4 bg-transparent dark:bg-gray-850 rounded-lg shadow-lg relative animate-fade-in">
          <button
            onClick={handleBackToHistory}
            className="absolute top-4 left-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 text-sm font-semibold"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="pt-12 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-amber-300 mb-4 text-center">
              Detailed Entry
            </h2>

            <div className="space-y-6">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-1.5">
                  <Sun size={18} className="text-yellow-600" /> Your Vaak :
                </p>
                <div className="
                  text-gray-800 dark:text-gray-200
                  bg-blue-50 dark:bg-gray-700 p-3 rounded-md
                  border border-blue-100 dark:border-gray-600
                  text-sm leading-relaxed whitespace-pre-wrap
                ">
                  {selectedEntry.userInput}
                </div>
              </div>

              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb size={18} className="text-indigo-600" /> Jot :
                </p>
                <div
                  className="
                    text-gray-800 dark:text-gray-200
                    bg-purple-50 dark:bg-purple-900 p-3 rounded-md
                    border border-purple-100 dark:border-purple-700
                    text-sm leading-relaxed whitespace-pre-wrap
                  "
                  dangerouslySetInnerHTML={{ __html: selectedEntry.botOutput?.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") || '' }}
                />
              </div>

              {selectedEntry.jobDescription && (
                <div className="
                  text-xs text-gray-700 dark:text-gray-300
                  flex items-start mt-3 p-2
                  bg-gray-100 dark:bg-gray-750 rounded-md
                  border border-gray-200 dark:border-gray-650
                ">
                  <Briefcase size={14} className="mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                  <div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">Karm-Kshetra Context:</span>
                    <p className="italic mt-0.5 whitespace-pre-wrap">{selectedEntry.jobDescription}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // List of history entries
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((entry, index) => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              getIconForTone={getIconForTone}
              onClick={() => handleEntryClick(entry)}
              isFirst={index === 0}
              isLast={index === history.length - 1}
              researchedModeHistory={entry.researchedModeHistory}
              autoCoverLetterModeHistory={entry.autoCoverLetterModeHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// HistoryEntry Component
function HistoryEntry({ entry, getIconForTone, onClick, isFirst, isLast, researchedModeHistory, autoCoverLetterModeHistory }) {
  const requestTime = new Date(entry.timestamp).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  });

  const baseClasses = `
    relative
    bg-transparent dark:bg-gray-850
    shadow-sm border border-gray-200 dark:border-gray-700
    overflow-hidden
    font-sans text-gray-800 dark:text-gray-200
    transition-all duration-300 ease-in-out
    cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
  `;

  const dynamicClasses = `
    ${isFirst ? 'rounded-t-lg' : ''}
    ${isLast ? 'rounded-b-lg' : ''}
    ${!isFirst && !isLast ? 'border-t-0' : ''}
    ${isLast ? '' : 'border-b'}
  `;

  return (
    <div className={`${baseClasses} ${dynamicClasses}`} onClick={onClick}>
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-rose-400 dark:from-amber-500 dark:via-orange-500 dark:to-red-500"></div>

      <div className="w-full text-left pl-5 pr-4 py-3 flex items-center justify-between">
        <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 flex-grow">
          {entry.tone && (
            <span className="mr-2 flex-shrink-0">
              {getIconForTone(entry.tone)}
            </span>
          )}
          <span className="mr-3 text-base font-medium text-blue-700 dark:text-blue-300 flex-shrink-0">
            {entry.tone || "General"}
          </span>

          {/* Conditional Tags for Filter Operations - PRIORITIZED */}
          {autoCoverLetterModeHistory ? (
            <span className="
              ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300
              px-2 py-0.5 rounded-full text-xs font-medium border border-green-300 dark:border-green-600
              flex items-center gap-1
            ">
              <Mail size={12} /> Auto CL
            </span>
          ) : researchedModeHistory ? (
            <span className="
              ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300
              px-2 py-0.5 rounded-full text-xs font-medium border border-blue-300 dark:border-blue-600
              flex items-center gap-1
            ">
              <BookOpen size={12} /> Researched
            </span>
          ) : (
            null
          )}

          <div className="ml-auto text-xs italic text-gray-600 dark:text-gray-300 flex-shrink-0 hidden sm:block">
            {requestTime}
          </div>
        </div>
      </div>
    </div>
  );
}