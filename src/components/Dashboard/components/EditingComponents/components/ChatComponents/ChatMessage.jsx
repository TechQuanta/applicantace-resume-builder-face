import React, { useRef, useEffect } from 'react';
import { MessageSquare, History } from 'lucide-react';
import { motion } from 'framer-motion';

const getMessageBubbleClasses = (msgType, theme) => {
  if (msgType === 'user') {
    return 'bg-blue-500/80 dark:bg-blue-700/80 text-white dark:text-gray-100 rounded-tr-none';
  } else {
    // Adjusted opacity for bot messages as well
    return 'bg-gray-200/80 dark:bg-zinc-700/80 text-zinc-900 dark:text-gray-100 rounded-tl-none';
  }
};

const highlightRelevantWords = (text, jobDesc) => {
  if (!jobDesc || !jobDesc.trim()) return text;
  const words = jobDesc.toLowerCase().split(/\W+/).filter(Boolean);
  words.sort((a, b) => b.length - a.length);

  const escapedWords = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

  return text.replace(regex, (match) => `<b>${match}</b>`);
};

const ChatMessages = ({ messages, loading, error, showHistory, theme, fontSize, autoCoverLetterMode, jobDescription, matchJobDescription, renderMarkdown }) => {
  const messagesContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (messagesContainerRef.current) {
        if (messagesContainerRef.current.scrollHeight > messagesContainerRef.current.clientHeight) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
      return;
    }

    if (messagesContainerRef.current && !showHistory) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, showHistory, loading]);

  const renderMessageContent = (msg) => {
    let contentToProcess = msg.content;

    if (msg.type === 'bot' && matchJobDescription && msg.jobDescription && msg.jobDescription.trim()) {
      contentToProcess = highlightRelevantWords(contentToProcess, msg.jobDescription);
    }

    return renderMarkdown(contentToProcess);
  };

  return (
    // Applied backdrop-blur-md to the overall messages container
    // Added more vertical padding 'py-6' for better spacing
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 px-4 py-6 custom-scrollbar backdrop-blur-md">
      {showHistory ? (
        messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 italic text-center">
            <History size={48} className="mb-4" />
            <p>Your chat history is empty.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                // Reduced padding on bubbles to 'p-3' and added more to container
                className={`p-3 rounded-xl max-w-[80%] shadow-md
                ${getMessageBubbleClasses(msg.type, theme)} ${fontSize}
                overflow-wrap-anywhere break-words
                `}
              >
                <span dangerouslySetInnerHTML={renderMessageContent(msg)} />
              </div>
            </div>
          ))
        )
      ) : ( // Normal chat view
        <>
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 italic text-center">
              <MessageSquare size={48} className="mb-4" />
              <p>Start a conversation by typing a message below.</p>
              {autoCoverLetterMode && <p className="mt-2">In this mode, tell me details for your cover letter!</p>}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  // Reduced padding on bubbles to 'p-3' and added more to container
                  className={`p-3 rounded-xl max-w-[80%] shadow-md
                    ${getMessageBubbleClasses(msg.type, theme)} ${fontSize}
                    overflow-wrap-anywhere break-words
                    `}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span dangerouslySetInnerHTML={renderMessageContent(msg)} />
                </motion.div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <motion.div
                // Reduced padding on bubbles to 'p-3' and added more to container
                className={`p-3 rounded-xl max-w-[80%] shadow-md bg-gray-200/80 dark:bg-zinc-700/80 text-zinc-900 dark:text-gray-100 rounded-tl-none ${fontSize}
                overflow-wrap-anywhere break-words
                `}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </motion.div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center text-sm mt-2 font-medium">
              ⚠️ {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatMessages;