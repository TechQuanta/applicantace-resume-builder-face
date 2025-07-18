import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Style/EditorSytle.css";
import {
  FaRobot,
  FaDownload,
  FaMinus,
  FaPlus,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaTextHeight,
  FaPaintBrush,
  FaPalette,
  FaImage,
  FaFont,
  FaQuoteRight,
  FaEraser,
  FaSubscript,
  FaSuperscript,
  FaCode,
  FaUndo,
  FaRedo,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListOl,
  FaListUl,
  FaLink,
  FaExpandAlt,
  FaCompressAlt,
} from "react-icons/fa";

// Import the new PDF API service
import { generatePdfFromHtml } from '../../../../utils/apiconfig';
// Import the useUserSession hook
import { useUserSession } from '../../../../hooks/useUserSession';

// Import all constants from the new constants file
import {
  MY_BACKEND_PDF_CONVERT_URL,
  COMPANY_LOGO_URL,
  FONT_WHITELIST,
  FONT_OPTIONS,
  COLORS_WHITELIST,
  MIN_MARGIN_INCHES,
  MAX_MARGIN_INCHES,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  FONT_SIZE_STEP,
  WATERMARK_TEXT,
  getPdfHtmlTemplate 
} from '../../../../utils/constants';

// Assuming useEditorContentAtom is a custom hook for global state management
// We will modify this to accept the user's email
const useEditorContentAtom = (initialContent) => {
  const [editorContent, setEditorContent] = useState(initialContent);

  // The function now takes 'email' as an argument
  const loadLatestBotMessage = useCallback((email) => {
    if (!email) {
      console.log("Editor: No email provided, cannot load history.");
      return;
    }
    try {
      const key = `chatHistory_${email}`; // Use the user-specific key
      const storedHistory = localStorage.getItem(key);
      if (storedHistory) {
        const messages = JSON.parse(storedHistory);
        const latestBotMessage = messages
          .filter((msg) => msg.type === "bot" && msg.content?.trim())
          .pop();
        if (latestBotMessage) {
          const cleanContent = latestBotMessage.content
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br/>");
          const finalHtml =
            cleanContent.startsWith("<p>") ||
            cleanContent.startsWith("<div") ||
            cleanContent.startsWith("<h")
              ? cleanContent
              : `<p>${cleanContent}</p>`;
          setEditorContent(finalHtml);
          console.log("Editor: Loaded latest AI message.");
        } else {
          console.log("Editor: No latest AI message found in history for this user.");
        }
      } else {
        console.log("Editor: No history found for this user.");
      }
    } catch (e) {
      console.error("Error loading latest bot message:", e);
    }
  }, []);

  const customSetEditorContent = useCallback((html, fromAi = true) => {
    setEditorContent(html);
  }, []);

  return {
    editorContent,
    setEditorContent: customSetEditorContent,
    loadLatestBotMessage,
  };
};


// Initialize Quill and its modules (unchanged, but uses imported constants)
const Parchment = Quill.import("parchment");
const FontSizeStyle = new Parchment.Attributor.Style("fontSize", "font-size", { scope: Parchment.Scope.INLINE });
Quill.register(FontSizeStyle, true);

const Font = Quill.import("formats/font");
Font.whitelist = FONT_WHITELIST.map((f) => f.toLowerCase().replace(/\s/g, "-"));
Quill.register(Font, true);

const Color = Quill.import("attributors/style/color");
const Background = Quill.import("attributors/style/background");

Color.whitelist = COLORS_WHITELIST;
Background.whitelist = COLORS_WHITELIST;

Quill.register(Color, true);
Quill.register(Background, true);

// Custom Message Display Component (unchanged)
const MessageDisplay = ({ message }) => {
  if (!message.text) return null;
  return (
    <div className={`message-display message-${message.type}`}>
      {message.text}
    </div>
  );
};

// The `CoverLetterEditor` component
const CoverLetterEditor = forwardRef((props, ref) => {
  // --- 1. Get user email from session ---
  const { user: userSession } = useUserSession();
  const userEmail = userSession?.selected?.email || null;

  const initialPlaceholderContent = useMemo(
    () => `
        <p>✨ Welcome! Start crafting your perfect document right here.</p>
        <p>🚀 Toggle <strong>Jot</strong> on the toolbar to automatically load the latest generated content from the AI.</p>
        <p>📜 Use the <strong>History Dropdown</strong> to select and load specific past entries when Jot is off.</p>
        <p><br></p>
        <p>This editor is designed to flow seamlessly as you type. The scrollbar appears automatically when your content grows, keeping the editor window neat and fixed.</p>
        <p><br></p>
        <p><em>"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</em></p>
        <p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>
    `,
    []
  );

  const { editorContent, setEditorContent, loadLatestBotMessage } =
    useEditorContentAtom(initialPlaceholderContent);

  const [isJotEnabled, setIsJotEnabled] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [currentTextSize, setCurrentTextSize] = useState(16);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [pageMargin, setPageMargin] = useState(1); // Default to 1 inch for all sides

  const toolbarContainerRef = useRef(null);
  const internalQuillEditorRef = useRef(null);
  const editorWrapperRef = useRef(null);

  const [quillModules, setQuillModules] = useState(null);


  const showMessage = useCallback((text, type = "info", duration = 3000) => {
    setMessage({ text, type });
    if (duration > 0) {
      setTimeout(() => setMessage({ text: "", type: "" }), duration);
    }
  }, []);

  // The function now takes 'email' as an argument
  const loadAllHistoryForDropdown = useCallback((email) => {
    if (!email) {
      setHistoryItems([]);
      return;
    }
    try {
      const key = `chatHistory_${email}`; // Use the user-specific key
      const storedHistory = localStorage.getItem(key);
      if (storedHistory) {
        const messages = JSON.parse(storedHistory);
        const botMessages = messages.filter(
          (msg) => msg.type === "bot" && msg.content?.trim()
        );

        const formattedHistory = botMessages.map((msg, index) => ({
          id: msg.id || `history-${index}-${new Date(msg.timestamp).getTime()}`,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        }));
        setHistoryItems(formattedHistory.reverse());
      } else {
        setHistoryItems([]);
      }
    } catch (e) {
      console.error("❌ Error loading history for dropdown:", e);
      setHistoryItems([]);
    }
  }, []);

  // Update the dependencies and function calls
  useEffect(() => {
    if (isJotEnabled) {
      loadLatestBotMessage(userEmail);
    }
    loadAllHistoryForDropdown(userEmail);
  }, [isJotEnabled, userEmail, loadLatestBotMessage, loadAllHistoryForDropdown]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      // Check for the specific user's history key
      const key = `chatHistory_${userEmail}`;
      if (event.key === key) {
        console.log("Editor: Detected 'chatHistory' change, updating UI...");
        loadAllHistoryForDropdown(userEmail);
        if (isJotEnabled) {
          loadLatestBotMessage(userEmail);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isJotEnabled, userEmail, loadLatestBotMessage, loadAllHistoryForDropdown]);

  const handleJotToggle = useCallback(() => {
    setIsJotEnabled((prev) => {
      const newState = !prev;
      console.log("Toggle Jot:", newState ? "Enabled" : "Disabled");
      if (newState) {
        loadLatestBotMessage();
      }
      return newState;
    });
  }, [loadLatestBotMessage]);

  const handleHistorySelect = useCallback(
    (event) => {
      const selectedId = event.target.value;
      setIsJotEnabled(false);

      if (selectedId === "") {
        setEditorContent(initialPlaceholderContent, false);
        console.log("Editor: Reverted to placeholder content.");
        return;
      }

      const selectedItem = historyItems.find((item) => item.id === selectedId);
      if (selectedItem && selectedItem.content) {
        const cleanContent = selectedItem.content
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n\n/g, "</p><p>")
          .replace(/\n/g, "<br/>");

        const finalHtml =
          cleanContent.startsWith("<p>") ||
          cleanContent.startsWith("<div") ||
          cleanContent.startsWith("<h")
            ? cleanContent
            : `<p>${cleanContent}</p>`;

        setEditorContent(finalHtml, false);
        console.log(`Editor: Loaded history item ID: ${selectedId}`);
      }
    },
    [historyItems, initialPlaceholderContent, setEditorContent]
  );

  const applyTextSize = useCallback(
    (size) => {
      const validatedSize = Math.max(
        MIN_FONT_SIZE,
        Math.min(MAX_FONT_SIZE, size)
      );
      if (internalQuillEditorRef.current) {
        const quill = internalQuillEditorRef.current.getEditor();
        quill.format("fontSize", `${validatedSize}px`);
      }
      setCurrentTextSize(validatedSize);
    },
    []
  );

  const handleFontSizeSliderChange = useCallback(
    (event) => {
      applyTextSize(parseInt(event.target.value, 10));
    },
    [applyTextSize]
  );

  const handleFontSizeInputChange = useCallback(
    (event) => {
      const size = parseInt(event.target.value, 10);
      if (!isNaN(size)) {
        applyTextSize(size);
      }
    },
    [applyTextSize]
  );

  const handleIncreaseFontSize = useCallback(() => {
    applyTextSize(currentTextSize + FONT_SIZE_STEP);
  }, [currentTextSize, applyTextSize]);

  const handleDecreaseFontSize = useCallback(() => {
    applyTextSize(currentTextSize - FONT_SIZE_STEP);
  }, [currentTextSize, applyTextSize]);

  useEffect(() => {
    if (internalQuillEditorRef.current) {
      const quill = internalQuillEditorRef.current.getEditor();
      const handleSelectionChange = (range) => {
        if (range && quill) {
          const formats = quill.getFormat(range);
          const newSize = formats["fontSize"]
            ? parseInt(formats["fontSize"], 10)
            : quill.root.style.fontSize
            ? parseInt(quill.root.style.fontSize, 10)
            : parseInt(getComputedStyle(quill.root).fontSize, 10);
          if (!isNaN(newSize) && newSize !== currentTextSize) {
            setCurrentTextSize(newSize);
          }
        } else if (currentTextSize !== 16) {
          setCurrentTextSize(16);
        }
      };
      quill.on("selection-change", handleSelectionChange);
      quill.on("text-change", handleSelectionChange);
      return () => {
        if (quill && quill.off) {
          quill.off("selection-change", handleSelectionChange);
        }
      };
    }
  }, [currentTextSize]);

  const handleFontSelect = useCallback((event) => {
    const selectedFont = event.target.value;
    if (internalQuillEditorRef.current && selectedFont) {
      const quill = internalQuillEditorRef.current.getEditor();
      quill.format("font", selectedFont, "user");
    }
  }, []);

  const handleApplyFontToAll = useCallback(() => {
    if (internalQuillEditorRef.current) {
      const quill = internalQuillEditorRef.current.getEditor();
      let currentFontValue = quill.getFormat().font || "inter";

      quill.setSelection(0, quill.getLength(), "user");
      quill.format("font", currentFontValue, "user");

      const fontLabel =
        FONT_OPTIONS.find((f) => f.value === currentFontValue)?.label ||
        currentFontValue;
      showMessage(`Font '${fontLabel}' applied to all text.`, "success");

      quill.setSelection(0, 0, "silent");
    } else {
      showMessage("Editor not ready. Please try again.", "error");
    }
  }, [showMessage, FONT_OPTIONS]);

  const handleImageInsert = useCallback(() => {
    if (internalQuillEditorRef.current) {
      const quill = internalQuillEditorRef.current.getEditor();
      const range = quill.getSelection();
      const url = prompt("Enter image URL:");
      if (url) {
        quill.insertEmbed(range.index, "image", url);
        quill.setSelection(range.index + 1);
      }
    }
  }, []);

  const handleClearFormatting = useCallback(() => {
    if (internalQuillEditorRef.current) {
      const quill = internalQuillEditorRef.current.getEditor();
      const range = quill.getSelection();
      if (range && range.length > 0) {
        quill.removeFormat(range.index, range.length);
      } else {
        quill.removeFormat(0, quill.getLength());
      }
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (internalQuillEditorRef.current) {
      internalQuillEditorRef.current.getEditor().history.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (internalQuillEditorRef.current) {
      internalQuillEditorRef.current.getEditor().history.redo();
    }
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (editorWrapperRef.current) {
      if (!isFullScreen) {
        if (editorWrapperRef.current.requestFullscreen) {
          editorWrapperRef.current.requestFullscreen();
        } else if (editorWrapperRef.current.mozRequestFullScreen) {
          editorWrapperRef.current.mozRequestFullScreen();
        } else if (editorWrapperRef.current.webkitRequestFullscreen) {
          editorWrapperRef.current.webkitRequestFullscreen();
        } else if (editorWrapperRef.current.msRequestFullscreen) {
          editorWrapperRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      setIsFullScreen((prev) => !prev);
    }
  }, [isFullScreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const newFullScreenState =
        (document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement) !== null;
      setIsFullScreen(newFullScreenState);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    if (toolbarContainerRef.current) {
      setQuillModules({
        toolbar: {
          container: toolbarContainerRef.current,
          handlers: {
            image: handleImageInsert,
            undo: handleUndo,
            redo: handleRedo,
          },
        },
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true,
        },
        clipboard: {
          matchVisual: false,
        },
      });
    }
  }, [toolbarContainerRef.current, handleImageInsert, handleUndo, handleRedo]);

  const formats = useMemo(
    () => [
      "header", "font", "size", "fontSize", "bold", "italic", "underline", "strike",
      "blockquote", "code-block", "list", "bullet", "indent", "link", "image",
      "color", "background", "align", "script",
    ],
    []
  );

  useImperativeHandle(ref, () => ({
    getEditorContent: () => editorContent,
    setEditorContent: (html) => setEditorContent(html, false),
    getQuillInstance: () => internalQuillEditorRef.current?.getEditor(),
  }));

  const GOOGLE_FONTS_IMPORT_URLS = useMemo(() => {
    return FONT_WHITELIST.map((font) => {
      const fontNameForUrl = font.replace(/\s/g, "+");
      return `@import url('https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@400;700&display=swap');`;
    }).join("\n");
  }, [FONT_WHITELIST]);

  /**
   * Handles the entire workflow for converting editor HTML content to a PDF
   * using the PDFEndpoint API via your Vercel backend.
   */
  const handleDownloadPdf = useCallback(async () => {
    showMessage(
      "Generating PDF, please wait...",
      "info",
      7000
    );

    setIsProcessingPdf(true);

    try {
      // Use the imported function to get the HTML content
      const fullHtmlContent = getPdfHtmlTemplate(
        editorContent,
        pageMargin,
        GOOGLE_FONTS_IMPORT_URLS,
        FONT_WHITELIST,
        COMPANY_LOGO_URL,
        WATERMARK_TEXT
      );

      const pdfOptions = {
        orientation: "vertical",
        page_size: "A4",
        margin_top: `${pageMargin}in`,
        margin_bottom: `${pageMargin}in`,
        margin_left: `${pageMargin}in`,
        margin_right: `${pageMargin}in`
      };

      const downloadUrl = await generatePdfFromHtml(fullHtmlContent, pdfOptions);

      if (downloadUrl) {
        console.log("✅ PDF URL received. Opening in new tab:", downloadUrl);
        window.open(downloadUrl, "_blank");
        showMessage("PDF generation complete. Opening in a new tab.", "success", 5000);
      } else {
        throw new Error("Download URL not received from the backend.");
      }

    } catch (error) {
      console.error("❌ An error occurred during PDF generation:", error);
      showMessage(
        `Oops! Failed to generate PDF: ${error.message}. Please check your console for details.`,
        "error",
        7000
      );
    } finally {
      setIsProcessingPdf(false);
    }
  }, [
    editorContent,
    pageMargin,
    showMessage,
    GOOGLE_FONTS_IMPORT_URLS,
    FONT_WHITELIST, // Pass FONT_WHITELIST to the template function
    COMPANY_LOGO_URL, // Pass COMPANY_LOGO_URL to the template function
    WATERMARK_TEXT // Pass WATERMARK_TEXT to the template function
  ]);

  /**
   * Handles downloading the editor content as an HTML file. (unchanged, but uses imported constants)
   */
  const handleDownloadHtml = useCallback(() => {
    // For HTML download, you might still keep the template here
    // or create a separate `getHtmlDownloadTemplate` function if it differs significantly
    const fullHtmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Document</title>
                <style>
                    /* Import Google Fonts */
                    ${GOOGLE_FONTS_IMPORT_URLS}

                    /* Embed your editor's CSS styles directly for standalone HTML */
                    body {
                        font-family: 'Inter', sans-serif; /* Default font for the HTML file */
                        margin: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .document-content {
                        max-width: 800px;
                        /* Removed margin: 0 auto; to prevent centering */
                        padding: 20px;
                        border: 1px solid #eee;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        background-color: #fff;
                        text-align: left; /* Ensure content starts from the left */
                    }
                    /* Include Quill-generated classes for fonts, sizes, alignment etc. */
                    .ql-align-left { text-align: left; }
                    .ql-align-center { text-align: center; }
                    .ql-align-right { text-align: right; }
                    .ql-align-justify { text-align: justify; }
                    /* Indentation */
                    .ql-indent-1 { margin-left: 3em; }
                    .ql-indent-2 { margin-left: 6em; }
                    .ql-indent-3 { margin-left: 9em; }
                    .ql-indent-4 { margin-left: 12em; }
                    .ql-indent-5 { margin-left: 15em; }
                    .ql-indent-6 { margin-left: 18em; }
                    .ql-indent-7 { margin-left: 21em; }
                    .ql-indent-8 { margin-left: 24em; }

                    /* Font styles based on FONT_WHITELIST */
                    ${FONT_WHITELIST.map(
                      (font) =>
                        `.ql-font-${font
                          .toLowerCase()
                          .replace(
                            /\s/g,
                            "-"
                          )}{font-family:'${font}', sans-serif;}`
                    ).join("\n")}

                    /* Font size styles */
                    [style*="font-size"] { font-size: inherit !important; }
                    .ql-size-small { font-size: 0.75em; }
                    .ql-size-large { font-size: 1.25em; }
                    .ql-size-huge { font-size: 1.5em; }

                    /* Color and Background Color */
                    [style*="color"] { color: inherit !important; }
                    [style*="background-color"] { background-color: inherit !important; }

                    /* Basic text formatting */
                    strong, b { font-weight: bold; }
                    em, i { font-style: italic; }
                    u { text-decoration: underline; }
                    s, strike { text-decoration: line-through; }
                    sub { vertical-align: sub; font-size: smaller; }
                    sup { vertical-align: super; font-size: smaller; }
                    blockquote { margin: 1em 40px; border-left: 4px solid #ccc; padding-left: 1em; color: #555; }
                    pre.ql-syntax {
                        background-color: #f0f0f0;
                        border-radius: 5px;
                        padding: 10px;
                        margin: 1em 0;
                        font-family: 'Consolas', 'Courier New', monospace;
                        font-size: 0.9em;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    ol, ul { margin: 1em 0; padding-left: 2.5em; }
                    a { color: #007bff; text-decoration: underline; }
                    p { margin: 0 0 1em 0; text-align: left; }
                    h1, h2, h3, h4, h5, h6 { text-align: left; }
                    h1 { font-size: 2em; margin: 0.67em 0; }
                    h2 { font-size: 1.5em; margin: 0.83em 0; }
                    h3 { font-size: 1.17em; margin: 1em 0; }
                    h4 { font-size: 1em; margin: 1.33em 0; }
                    h5 { font-size: 0.83em; margin: 1.67em 0; }
                    h6 { font-size: 0.67em; margin: 2.33em 0; }
                    img { max-width: 100%; height: auto; display: block; margin: 10px auto; }
                </style>
            </head>
            <body>
                <div class="document-content">
                    ${editorContent}
                </div>
            </body>
            </html>
        `;

    const blob = new Blob([fullHtmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover_letter.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editorContent, GOOGLE_FONTS_IMPORT_URLS, FONT_WHITELIST]);

  return (
    <div
      className={`editor-container ${isFullScreen ? "fullscreen-active" : ""}`}
      ref={editorWrapperRef}
    >
      {/* Custom Toolbar */}
      <div
        id="toolbar"
        ref={toolbarContainerRef}
        className="ql-toolbar ql-snow"
      >
        <span className="ql-formats">
          {/* Group 1: Core Editing Actions (Undo/Redo, Clear Formatting) */}
          <button className="ql-undo" onClick={handleUndo} title="Undo">
            <FaUndo />
          </button>
          <button className="ql-redo" onClick={handleRedo} title="Redo">
            <FaRedo />
          </button>

          {/* Group 2: Font & Basic Text Styling (Font, Apply to All, Bold, Italic, Underline, Strikethrough) */}
          <FaFont className="toolbar-icon" title="Font Family" />
          <select
            className="ql-font h-[200px] w-[100px]"
            onChange={handleFontSelect}
            title="Select Font"
          >
            {FONT_OPTIONS.map((font) => (
              <option
                key={font.value}
                value={font.value}
                className={`ql-font-${font.value}`}
              >
                {font.label}
              </option>
            ))}
          </select>
          <button
            className="toolbar-button"
            onClick={handleApplyFontToAll}
            title="Apply Font to All Text"
          >
            <FaTextHeight />
          </button>
          <button className="ql-bold" title="Bold">
            <FaBold />
          </button>
          <button className="ql-italic" title="Italic">
            <FaItalic />
          </button>
          <button className="ql-underline" title="Underline">
            <FaUnderline />
          </button>
          <button className="ql-strike" title="Strikethrough">
            <FaStrikethrough />
          </button>

          {/* Group 3: Text Color & Highlight */}
          <span className="ql-color-picker-group">
            <FaPalette className="toolbar-icon" title="Text Color" />
            <select className="ql-color" title="Text Color"></select>
          </span>
          <span className="ql-background-picker-group">
            <FaPaintBrush className="toolbar-icon" title="Background Color" />
            <select className="ql-background" title="Highlight Color"></select>
          </span>
          <button
            className="toolbar-button"
            onClick={handleDownloadPdf}
            disabled={isProcessingPdf}
            title="Download as PDF"
          >
            {isProcessingPdf ? (
              <span className="spinner"></span>
            ) : (
              <FaDownload />
            )}{" "}
            {isProcessingPdf ? "Generating..." : "PDF"}
          </button>
          <button
            className="toolbar-button"
            onClick={handleDownloadHtml}
            title="Download as HTML"
          >
            <FaDownload /> HTML
          </button>
          <hr class="editor-content-separator"></hr>
          {/* Group 4: Font Size Controls (Decrease, Slider, Input, Increase) */}
          <button
            onClick={handleDecreaseFontSize}
            title="Decrease Font Size"
            className="toolbar-button"
          >
            <FaMinus />
          </button>
          <input
            type="range"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            value={currentTextSize}
            onChange={handleFontSizeSliderChange}
            className="font-size-slider"
            title="Adjust Font Size"
          />
          <input
            type="number"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            value={currentTextSize}
            onChange={handleFontSizeInputChange}
            className="font-size-input"
            title="Font Size (px)"
          />
          <button
            onClick={handleIncreaseFontSize}
            title="Increase Font Size"
            className="toolbar-button"
          >
            <FaPlus />
          </button>

          {/* Group 5: Alignment */}
          <button className="ql-align" value="" title="Align Left">
            <FaAlignLeft />
          </button>
          <button className="ql-align" value="center" title="Align Center">
            <FaAlignCenter />
          </button>
          <button className="ql-align" value="right" title="Align Right">
            <FaAlignRight />
          </button>
          <button className="ql-align" value="justify" title="Justify">
            <FaAlignJustify />
          </button>

          {/* Group 6: Lists & Indentation */}
          <button className="ql-list" value="ordered" title="Ordered List">
            <FaListOl />
          </button>
          <button className="ql-list" value="bullet" title="Unordered List">
            <FaListUl />
          </button>

          <button
            className="ql-indent"
            value="-1"
            title="Decrease Indent"
          ></button>
          <button
            className="ql-indent"
            value="+1"
            title="Increase Indent"
          ></button>
          <hr class="editor-content-separator"></hr>
          {/* Group 7: Blockquote, Code Block, Subscript, Superscript */}
          <button className="ql-blockquote" title="Blockquote">
            <FaQuoteRight />
          </button>
          <button className="ql-code-block" title="Code Block">
            <FaCode />
          </button>
          <button className="ql-script" value="sub" title="Subscript">
            <FaSubscript />
          </button>
          <button className="ql-script" value="super" title="Superscript">
            <FaSuperscript />
          </button>

          {/* Group 8: Inserts (Link, Image) & Document Actions (Download PDF/HTML, Margins, Fullscreen) */}
          <button className="ql-link" title="Insert Link">
            <FaLink />
          </button>
          <button className="ql-image" title="Insert Image">
            <FaImage />
          </button>

          <button
            className={`jot-toggle ${isJotEnabled ? "active" : ""}`}
            onClick={handleJotToggle}
            title={isJotEnabled ? "Jot Enabled (AI auto-load)" : "Jot Disabled"}
          >
            <FaRobot className="toolbar-icon" />{" "}
          </button>
          <span className="margin-control-group">
            <label
              htmlFor="page-margin-input"
              className="margin-label"
              title="Set Page Margins (inches)"
            >
              Margins:
            </label>
            <input
              id="page-margin-input"
              type="number"
              step="0.1"
              min={MIN_MARGIN_INCHES}
              max={MAX_MARGIN_INCHES}
              value={pageMargin}
              onChange={(e) => setPageMargin(parseFloat(e.target.value))}
              className="margin-input"
              title="Page Margins (inches)"
            />
            <span className="margin-unit">in</span>
          </span>
          <button
            className="toolbar-button"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? <FaCompressAlt /> : <FaExpandAlt />}
          </button>
          <button
            className="toolbar-button"
            onClick={handleClearFormatting}
            title="Clear Formatting"
          >
            <FaEraser />
          </button>
        </span>
      </div>
      {/* ReactQuill Editor Area */}
      {quillModules && ( // Render ReactQuill only when modules are ready
        <ReactQuill
          ref={internalQuillEditorRef}
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          modules={quillModules}
          formats={formats}
          placeholder={initialPlaceholderContent}
          className="quill-editor-main"
        />
      )}
      <MessageDisplay message={message} />
    </div>
  );
});

export default CoverLetterEditor;