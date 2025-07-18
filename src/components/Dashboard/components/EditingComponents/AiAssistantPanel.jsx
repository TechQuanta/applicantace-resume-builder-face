// src/components/Home/Chatbot.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Mail, ArrowUp } from 'lucide-react';
import ChatHeader from './components/ChatComponents/ChatHeader';
import FilterOptions from './components/ChatComponents/FilterOptions';
import ChatMessages from './components/ChatComponents/ChatMessage';
import SettingsModal from './components/ChatComponents/SettingModal';
import ChatSettings from './components/ChatComponents/ChatSettings';

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Import the service function
import { sendMessageToChatbot } from '../../../../utils/apiconfig';

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
        // Handle error if needed, but no console.error as per request
    }
};

// Main Chatbot Component
export default function Chatbot() {
    const { user: userSession } = useUserSession();
    const authToken = userSession?.selected?.token || null;
    const userEmail = userSession?.selected?.email || null; // Get the user's email

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect to reload history whenever the user email changes
    useEffect(() => {
        setMessages(loadChatHistoryFromLocalStorage(userEmail));
    }, [userEmail]);

    // Filter States
    const [selectedTone, setSelectedTone] = useState('Formal');
    const [selectedSubTool, setSelectedSubTool] = useState('');
    const [researchedMode, setResearchedMode] = useState(false);
    const [matchJobDescription, setMatchJobDescription] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [autoCoverLetterMode, setAutoCoverLetterMode] = useState(false);
    const [enableSuggestions, setEnableSuggestions] = useState(false);

    const [lastAutoClResponse, setLastAutoClResponse] = useState('');

    // Theme and Font Size states
    const [theme, setTheme] = useState(() =>
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    );
    const [fontSize, setFontSize] = useState('text-base');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark' : '';
    }, [theme]);

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
        prefersDark.addEventListener('change', handler);
        return () => prefersDark.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (researchedMode) {
            setSelectedTone('Researched');
            setSelectedSubTool('Data-driven');
            setAutoCoverLetterMode(false);
            setEnableSuggestions(false);
        } else {
            setSelectedTone('Formal');
            setSelectedSubTool('');
        }
    }, [researchedMode]);

    useEffect(() => {
        if (autoCoverLetterMode) {
            setResearchedMode(false);
            setEnableSuggestions(false);
            setSelectedTone('Professional');
            setSelectedSubTool('Email');

            const latestCLMessage = messages
                .filter(msg => msg.type === 'bot' && msg.autoCoverLetterMode && msg.content && msg.content.trim() !== '' && !msg.content.includes("Oops! Something went wrong:"))
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .pop();

            if (latestCLMessage) {
                setLastAutoClResponse(latestCLMessage.content);
            } else {
                setLastAutoClResponse('');
            }
        } else {
            setSelectedTone('Formal');
            setSelectedSubTool('');
            setLastAutoClResponse('');
        }
    }, [autoCoverLetterMode, messages]);

    useEffect(() => {
        if (!matchJobDescription) {
            setJobDescription('');
        }
    }, [matchJobDescription]);

    const renderMarkdown = useCallback((markdownText) => {
        if (typeof markdownText !== 'string') {
            return { __html: '' };
        }
        const rawMarkup = marked.parse(markdownText);
        const cleanMarkup = DOMPurify.sanitize(rawMarkup, { USE_PROFILES: { html: true } });
        return { __html: cleanMarkup };
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (loading) {
            return;
        }
        if (!input.trim()) {
            return;
        }

        if (!authToken || !userEmail) { // Ensure both token and email are available
            const errorMessage = "You are not authenticated. Please log in to use the chatbot.";
            setError(errorMessage);
            setMessages((prevMessages) => {
                const unauthenticatedMessage = {
                    id: Date.now() + '-unauth-error',
                    type: 'bot',
                    content: errorMessage,
                    timestamp: new Date().toISOString(),
                };
                return [...prevMessages, unauthenticatedMessage];
            });
            setLoading(false);
            return;
        }

        setError(null);
        setLoading(true);

        const currentTone = researchedMode ? 'Researched' : selectedTone;
        const currentStyle = selectedSubTool;
        const currentJobDescription = matchJobDescription ? jobDescription : null;
        const currentEnableSuggestions = enableSuggestions;

        let combinedInput = input;
        if (autoCoverLetterMode && lastAutoClResponse) {
            combinedInput = `Previous Cover Letter Context:\n\n${lastAutoClResponse}\n\nUser's new request: ${input}`;
        }

        const payload = {
            input: combinedInput,
            tone: currentTone,
            style: currentStyle,
            jobDescription: currentJobDescription,
            keywords: null,
            wordLimit: null,
            enableSuggestions: currentEnableSuggestions,
            autoCoverLetterMode: autoCoverLetterMode,
            researchedMode: researchedMode,
        };

        const userMessage = {
            id: Date.now() + '-user',
            type: 'user',
            content: input,
            tone: currentTone,
            style: currentStyle,
            jobDescription: currentJobDescription,
            autoCoverLetterMode: autoCoverLetterMode,
            researchedMode: researchedMode,
            enableSuggestions: currentEnableSuggestions,
            timestamp: new Date().toISOString(),
        };

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages, userMessage];
            saveChatHistoryToLocalStorage(newMessages, userEmail); // Pass the user email
            return newMessages;
        });

        setInput('');

        try {
            const responseData = await sendMessageToChatbot(payload, authToken);

            const botMessage = {
                id: Date.now() + '-bot',
                type: 'bot',
                content: responseData.content,
                tone: 'bot',
                timestamp: new Date().toISOString(),
                jobDescription: currentJobDescription,
                autoCoverLetterMode: autoCoverLetterMode,
                researchedMode: researchedMode,
                enableSuggestions: currentEnableSuggestions,
            };

            setMessages((prevMessages) => {
                const newMessages = [...prevMessages, botMessage];
                saveChatHistoryToLocalStorage(newMessages, userEmail); // Pass the user email
                return newMessages;
            });

            if (autoCoverLetterMode) {
                setLastAutoClResponse(responseData.content);
            }
        } catch (err) {
            const errorMessageForUser = `Oops! Something went wrong: ${err.message || 'An unexpected error occurred.'}`;
            setError(errorMessageForUser);
            setMessages((prevMessages) => {
                const errorBotMessage = {
                    id: Date.now() + '-error',
                    type: 'bot',
                    content: errorMessageForUser,
                    timestamp: new Date().toISOString(),
                    jobDescription: currentJobDescription,
                    autoCoverLetterMode: autoCoverLetterMode,
                    researchedMode: researchedMode,
                    enableSuggestions: enableSuggestions,
                };
                const newMessages = [...prevMessages, errorBotMessage];
                saveChatHistoryToLocalStorage(newMessages, userEmail); // Pass the user email
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
    }, [
        input, messages, selectedTone, selectedSubTool, researchedMode,
        autoCoverLetterMode, matchJobDescription, jobDescription, enableSuggestions, lastAutoClResponse, loading, authToken, userEmail
    ]);

    const clearChatHistory = useCallback(() => {
        if (window.confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
            setMessages([]);
            saveChatHistoryToLocalStorage([], userEmail); // Pass the user email
            setLastAutoClResponse('');
        }
    }, [userEmail]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default new line
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const handleFormSubmit = useCallback((e) => {
        e.preventDefault();
        handleSendMessage();
    }, [handleSendMessage]);

    const placeholderText = autoCoverLetterMode
        ? 'Tell Jot details for your cover letter (e.g., role, company, skills, passion)...'
        : (matchJobDescription ? 'Describe your experience...' : 'Type your message...');

    return (
        <div
            className={`flex flex-col h-[600px] w-full max-w-2xl rounded-2xl overflow-hidden  transition-all duration-300
                ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-zinc-900 text-white'}
                border-none`}
            style={{
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <ChatHeader
                theme={theme}
                showHistory={showHistory}
                onToggleHistory={() => setShowHistory(prev => !prev)}
                onOpenSettings={() => setSettingsOpen(true)}
            />

            {!researchedMode && !autoCoverLetterMode && !showHistory && (
                <FilterOptions
                    theme={theme}
                    selectedTone={selectedTone}
                    onToneSelect={setSelectedTone}
                    onSubToolSelect={setSelectedSubTool}
                    selectedSubTool={selectedSubTool}
                />
            )}

            {researchedMode && !showHistory && (
                <div
                    className={`flex flex-col sm:flex-row items-center justify-center px-4 py-2 border-b text-sm font-bold text-center
                        ${theme === 'light'
                            ? 'bg-blue-100 text-gray-800 border-blue-200'
                            : 'bg-indigo-900 text-gray-100 border-indigo-800'
                        }`}
                >
                    <BookOpen size={16} className="mr-0 sm:mr-2 mb-1 sm:mb-0" />
                    <span className="ml-1">**Researched Mode:** Applied **Predefined Filter** ('**Data-driven**')</span>
                </div>
            )}

            {autoCoverLetterMode && !showHistory && (
                <div
                    className={`flex flex-col sm:flex-row items-center justify-center px-4 py-2 border-b text-sm font-bold text-center
                        ${theme === 'light'
                            ? 'bg-green-100 text-gray-800 border-green-200'
                            : 'bg-teal-900 text-gray-100 border-teal-800'
                        }`}
                >
                    <Mail size={16} className="mr-0 sm:mr-2 mb-1 sm:mb-0" />
                    <span className="ml-1">**Auto Cover Letter Mode:** Tell Jot your details (e.g., role, company, skills).</span>
                </div>
            )}

            <ChatMessages
                messages={messages}
                loading={loading}
                error={error}
                showHistory={showHistory}
                theme={theme}
                fontSize={fontSize}
                autoCoverLetterMode={autoCoverLetterMode}
                jobDescription={jobDescription}
                matchJobDescription={matchJobDescription}
                renderMarkdown={renderMarkdown}
            />

            {/* INLINED CHAT INPUT COMPONENT START */}
            <div className={`flex items-end p-4 border-t ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-zinc-800 border-zinc-700'} flex-shrink-0 rounded-b-3xl`}>
                <form onSubmit={handleFormSubmit} className="flex flex-grow items-end">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholderText}
                        rows={1} // Start with 1 row
                        style={{ resize: 'none', minHeight: '42px', maxHeight: '120px' }} // Added min/max height for textarea
                        className={`flex-grow px-4 py-2 border outline-none mr-3 shadow-sm overflow-hidden
                            ${theme === 'light'
                                ? 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                                : 'bg-zinc-700 border-zinc-600 text-gray-100 focus:ring-blue-400 focus:border-blue-400'
                            } ${fontSize} rounded-lg`} 
                        disabled={loading || showHistory}
                    />
                    <button
                        type="submit"
                        className={`p-3 rounded-full shadow-md transition-all duration-200 flex-shrink-0
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
            {/* INLINED CHAT INPUT COMPONENT END */}

            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}>
                <ChatSettings
                    theme={theme}
                    setTheme={setTheme}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    researchedMode={researchedMode}
                    setResearchedMode={setResearchedMode}
                    autoCoverLetterMode={autoCoverLetterMode}
                    setAutoCoverLetterMode={setAutoCoverLetterMode}
                    matchJobDescription={matchJobDescription}
                    setMatchJobDescription={setMatchJobDescription}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    onClearHistory={clearChatHistory}
                    enableSuggestions={enableSuggestions}
                    setEnableSuggestions={setEnableSuggestions}
                />
            </SettingsModal>
        </div>
    );
}