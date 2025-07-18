// src/hooks/useEditorContentAtom.js
import { useState, useEffect, useCallback, useRef } from 'react';

const EDITOR_CONTENT_KEY = 'editorContent'; // localStorage key for editor's primary content

export const useEditorContentAtom = (initialPlaceholderHtml) => {
    // State for the editor's current content, initialized from localStorage or placeholder
    const [content, setContent] = useState(() => {
        const storedContent = localStorage.getItem(EDITOR_CONTENT_KEY);
        return storedContent || initialPlaceholderHtml;
    });

    // Ref to track if the content was last updated by AI assist
    const lastContentSourceIsAI = useRef(false);

    // Effect to persist content to localStorage whenever it changes
    useEffect(() => {
        // Only save if the content has actually changed to avoid unnecessary localStorage writes
        if (localStorage.getItem(EDITOR_CONTENT_KEY) !== content) {
            localStorage.setItem(EDITOR_CONTENT_KEY, content);
            console.log("Atom: Editor content saved to localStorage.");
        }
    }, [content]);

    // Function to update content, optionally marking its source
    const updateContent = useCallback((newContent, fromAI = false) => {
        if (newContent !== content) { // Prevent unnecessary state updates
            setContent(newContent);
            lastContentSourceIsAI.current = fromAI;
            console.log(`Atom: Content updated. Source: ${fromAI ? 'AI' : 'User/Manual'}.`);
        }
    }, [content]); // Dependency on `content` to prevent stale closure if `content` is needed in comparison

    // Function to load the latest bot message from chatHistory
    const loadLatestBotMessage = useCallback(() => {
        try {
            const storedHistory = localStorage.getItem('chatHistory');
            if (storedHistory) {
                const messages = JSON.parse(storedHistory);
                // Find the latest bot message that actually has content
                const latestBotMessage = messages.slice().reverse().find(msg => msg.type === 'bot' && msg.content);

                if (latestBotMessage && latestBotMessage.content) {
                    // Simple markdown to HTML conversion for bold text
                    const cleanContent = latestBotMessage.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    // Only update if the content from AI is different from current content
                    if (content !== cleanContent) {
                        updateContent(cleanContent, true); // Mark as from AI
                        console.log("Atom: Loaded latest bot message into editor content.");
                    } else {
                        console.log("Atom: Latest bot message is same as current editor content, no update needed.");
                    }
                } else {
                    // If no bot messages found, and current content is not user-edited and not initial placeholder, revert.
                    // This logic prevents overwriting user edits.
                    if (!lastContentSourceIsAI.current && content !== initialPlaceholderHtml) {
                        // If it's not from AI and not the initial placeholder, it means user edited it.
                        // We should NOT revert it to placeholder just because there are no bot messages.
                        console.log("Atom: No bot messages found, but editor content was user-edited or is placeholder. No automatic revert.");
                    } else if (lastContentSourceIsAI.current || content === initialPlaceholderHtml) {
                        // If it *was* from AI or is the initial placeholder, and now no bot message, then revert to placeholder.
                        if (content !== initialPlaceholderHtml) { // Only update if actually different
                            updateContent(initialPlaceholderHtml, false);
                            console.log("Atom: No bot messages found and content was AI-sourced/placeholder, reverting to initial placeholder.");
                        }
                    }
                }
            } else {
                // No chat history at all, revert to placeholder if current content was AI-sourced or is placeholder.
                if (lastContentSourceIsAI.current || content === initialPlaceholderHtml) {
                    if (content !== initialPlaceholderHtml) {
                        updateContent(initialPlaceholderHtml, false);
                        console.log("Atom: No chat history, reverting to initial placeholder.");
                    }
                } else {
                    console.log("Atom: No chat history, but editor content was user-edited. No automatic revert.");
                }
            }
        } catch (e) {
            console.error("Atom: Error loading chat history for auto-load:", e);
            // Fallback to placeholder on error if content was AI-sourced or placeholder
            if (lastContentSourceIsAI.current || content === initialPlaceholderHtml) {
                if (content !== initialPlaceholderHtml) {
                    updateContent(initialPlaceholderHtml, false);
                    console.log("Atom: Error in chat history, reverting to initial placeholder.");
                }
            }
        }
    }, [content, initialPlaceholderHtml, updateContent]);

    // Listener for localStorage changes (specifically 'chatHistory')
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'chatHistory') {
                console.log("Atom: localStorage 'chatHistory' change detected.");
                // Trigger an update to check for new bot messages
                // This will only load if AI Assist is enabled in the editor,
                // but the atom doesn't directly control AI Assist state, it just loads.
                // The editor component will decide when to call `loadLatestBotMessage`.
                // However, if we want the atom to _react_ to history changes
                // *even if* AI Assist wasn't explicitly toggled (e.g., if AI Assist was ON
                // and a new message came in), this is where it happens.
                // For direct coupling with AI Assist, the call should be conditionally in the editor.
                // For now, let's have the editor trigger it based on AI Assist state.
                // So, no direct call here, the `useEffect` in `CoverLetterEditor` will call `loadLatestBotMessage`
                // when `isAiAssistEnabled` is true and `chatHistory` changes.
            } else if (event.key === EDITOR_CONTENT_KEY) {
                // If the editor content itself was changed externally (unlikely for this setup)
                // or initialized, make sure our internal state reflects it.
                // This handles scenarios where multiple tabs might be syncing content.
                const newContentFromStorage = localStorage.getItem(EDITOR_CONTENT_KEY);
                if (newContentFromStorage !== null && newContentFromStorage !== content) {
                    setContent(newContentFromStorage);
                    console.log("Atom: Editor content updated from localStorage storage event.");
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [content]); // Depend on content to ensure the `if (newContentFromStorage !== content)` check is accurate

    // Expose the state and updater function
    return {
        editorContent: content,
        setEditorContent: updateContent, // Use the controlled updater
        loadLatestBotMessage, // Expose this for manual trigger if needed (e.g., by AI Assist toggle)
        lastContentSourceIsAI: lastContentSourceIsAI.current // Expose for conditional logic in editor
    };
};