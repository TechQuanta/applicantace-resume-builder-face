// src/constants/appConstants.js

// --- API Endpoints ---
export const MY_BACKEND_PDF_CONVERT_URL = "https://acebackendapi.vercel.app/api/convert-to-pdf";

// --- Company Logo URL ---
export const COMPANY_LOGO_URL = "https://www.techquanta.tech/darklogo.png";

// --- Font Whitelist and Options ---
export const FONT_WHITELIST = [
    "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Impact", "Lucida Sans Unicode",
    "Lato", "Open Sans", "Roboto", "Inter", "Montserrat", "Oswald", "PT Sans", "Noto Sans",
    "Ubuntu", "Source Sans Pro", "Fira Sans", "Quicksand", "Nunito", "Karla", "Rubik",
    "IBM Plex Sans", "Exo 2", "Cabin", "Franklin Gothic Medium", "Gill Sans MT", "Calibri", "Candara",
    "Georgia", "Times New Roman", "Palatino Linotype", "Book Antiqua", "Garamond", "Cambria",
    "Merriweather", "Playfair Display", "Lora", "Bitter", "Crimson Text", "Vollkorn", "Literata",
    "Lucida Console", "Courier New", "Monaco", "Consolas", "Space Mono", "Brush Script MT",
];

export const FONT_OPTIONS = [
    { label: "Default (Inter)", value: "" },
    { label: "Arial", value: "arial" }, { label: "Verdana", value: "verdana" },
    { label: "Helvetica", value: "helvetica" }, { label: "Tahoma", value: "tahoma" },
    { label: "Trebuchet MS", value: "trebuchet-ms" }, { label: "Impact", value: "impact" },
    { label: "Lucida Sans Unicode", value: "lucida-sans-unicode" }, { label: "Lato", value: "lato" },
    { label: "Open Sans", value: "open-sans" }, { label: "Roboto", value: "roboto" },
    { label: "Inter", value: "inter" }, { label: "Montserrat", value: "montserrat" },
    { label: "Oswald", value: "oswald" }, { label: "PT Sans", value: "pt-sans" },
    { label: "Noto Sans", value: "noto-sans" }, { label: "Ubuntu", value: "ubuntu" },
    { label: "Source Sans Pro", value: "source-sans-pro" }, { label: "Fira Sans", value: "fira-sans" },
    { label: "Quicksand", value: "quicksand" }, { label: "Nunito", value: "nunito" },
    { label: "Karla", value: "karla" }, { label: "Rubik", value: "rubik" },
    { label: "IBM Plex Sans", value: "ibm-plex-sans" }, { label: "Exo 2", value: "exo-2" },
    { label: "Cabin", value: "cabin" }, { label: "Franklin Gothic Medium", value: "franklin-gothic-medium" },
    { label: "Gill Sans MT", value: "gill-sans-mt" }, { label: "Calibri", value: "calibri" },
    { label: "Candara", value: "candara" },
    { label: "Georgia", value: "georgia" }, { label: "Times New Roman", value: "times-new-roman" },
    { label: "Palatino Linotype", value: "palatino-linotype" }, { label: "Book Antiqua", value: "book-antiqua" },
    { label: "Garamond", value: "garamond" }, { label: "Cambria", value: "cambria" },
    { label: "Merriweather", value: "merriweather" }, { label: "Playfair Display", value: "playfair-display" },
    { label: "Lora", value: "lora" }, { label: "Bitter", value: "bitter" },
    { label: "Crimson Text", value: "crimson-text" }, { label: "Vollkorn", value: "vollkorn" },
    { label: "Literata", value: "literata" },
    { label: "Lucida Console", value: "lucida-console" }, { label: "Courier New", value: "courier-new" },
    { label: "Monaco", value: "monaco" }, { label: "Consolas", value: "consolas" },
    { label: "Space Mono", value: "space-mono" },
    { label: "Brush Script MT", value: "brush-script-mt" },
];

// --- Color Whitelist ---
export const COLORS_WHITELIST = [
    "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff",
    "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#cbccff", "#e5ccff", "#990000",
    "#b26500", "#b2b200", "#006600", "#0047b2", "#6622cc", "#858585", "#cccccc", "#737373",
    "#404040", "#999999", "#c00000", "#ff6600", "#808000", "#004d00", "#003380", "#660099",
    "#333333", "#666666", "#a6a6a6", "#4d4d4d", "#262626", "#1a1a1a", "#0d0d0d", "#000000",
    "#FF4500", "#FFD700", "#ADFF2F", "#00FF7F", "#00CED1", "#4169E1", "#8A2BE2", "#FF69B4",
    "#FF1493", "#8B0000", "#B8860B", "#556B2F", "#2F4F4F", "#4682B4", "#6A5ACD", "#DDA0DD",
];

// --- Margin Constants (in inches) ---
export const MIN_MARGIN_INCHES = 0.1;
export const MAX_MARGIN_INCHES = 2.0;

// --- Font Size Constants (in px) ---
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 72;
export const FONT_SIZE_STEP = 1;

// --- Watermark Text ---
export const WATERMARK_TEXT = "AceAI"; // You can change this
// src/utils/pdfTemplate.js

// This function takes dynamic variables and returns the full HTML string
export const getPdfHtmlTemplate = (
  editorContent,
  pageMargin,
  googleFontsImportUrls,
  fontWhitelist,
  companyLogoUrl,
  watermarkText
) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Document</title>
        <style>
            /* Import Google Fonts */
            ${googleFontsImportUrls}

            /* Base styles for the PDF document */
            body {
                font-family: 'Arial', sans-serif; /* Default fallback font */
                margin: ${pageMargin}in; /* Adjusted to use single pageMargin */
                font-size: 11pt; /* Base font size for PDF */
                line-height: 1.5;
                color: #333;
                background-color: #ffffff; /* Ensure white background for document content */
            }
            
            /* Watermark Styling (main text watermark) */
            .watermark {
                position: fixed; /* Ensures it stays relative to the page/viewport */
                bottom: 2cm;    /* 2cm from the bottom edge of the page */
                right: 2cm;     /* 2cm from the right edge of the page */
                font-size: 8pt;
                color: rgba(0, 0, 0, 0.15); /* Light, semi-transparent gray */
                z-index: 1000;  /* Ensure it overlaps content */
                white-space: nowrap; /* Prevent text wrapping */
                transform: rotate(-15deg); /* Optional: slight rotation for "watermark" effect */
                transform-origin: bottom right; /* Rotate around the bottom-right corner */
                pointer-events: none; /* Crucial: ensures it doesn't interfere with text selection on PDF */
            }

            /* Company Logo Styling (positioned as a subtle bottom-right watermark) */
            .company-logo-watermark {
                position: fixed; /* Ensures it stays relative to the page/viewport */
                bottom: 3cm;   /* Slightly above the text watermark, adjust as needed */
                right: 2cm;    /* Aligned with text watermark, 2cm from right */
                max-width: 70px; /* Made smaller for subtlety */
                height: auto;
                opacity: 0.1; /* Made more transparent for subtlety */
                z-index: 999; /* Below text watermark, above content */
                pointer-events: none;
            }

            /* General image styling within Quill content (for images added via editor) */
            .ql-editor img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 10px auto; /* Still center images by default, user can align via Quill */
            }

            /* Quill-specific styles to ensure accurate rendering from editor */
            .ql-align-left { text-align: left; }
            .ql-align-center { text-align: center; }
            .ql-align-right { text-align: right; }
            .ql-align-justify { text-align: justify; }

            /* Indentation styles for lists and blocks */
            .ql-indent-1 { margin-left: 3em; }
            .ql-indent-2 { margin-left: 6em; }
            .ql-indent-3 { margin-left: 9em; }
            .ql-indent-4 { margin-left: 12em; }
            .ql-indent-5 { margin-left: 15em; }
            .ql-indent-6 { margin-left: 18em; }
            .ql-indent-7 { margin-left: 21em; }
            .ql-indent-8 { margin-left: 24em; }

            /* Apply specific font families from our whitelist */
            ${fontWhitelist.map(
              (font) =>
                `.ql-font-${font
                  .toLowerCase()
                  .replace(
                    /\s/g,
                    "-"
                  )}{font-family:'${font}', sans-serif;}`
            ).join("\n")}

            /* Crucial: Let Quill's inline font-size, color, and background-color styles take precedence for precise sizing */
            [style*="font-size"] { font-size: inherit !important; }
            [style*="color"] { color: inherit !important; }
            [style*="background-color"] { background-color: inherit !important; }

            /* Quill's default size classes (if used, although we use custom fontSize) */
            .ql-size-small { font-size: 0.75em; }
            .ql-size-large { font-size: 1.25em; }
            .ql-size-huge { font-size: 1.5em; }

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
            
            /* Default paragraph spacing and alignment */
            p { margin: 0 0 1em 0; text-align: left; }
            
            /* Headings: Ensure they are left-aligned by default */
            h1, h2, h3, h4, h5, h6 { text-align: left; }
            h1 { font-size: 2em; margin: 0.67em 0; }
            h2 { font-size: 1.5em; margin: 0.83em 0; }
            h3 { font-size: 1.17em; margin: 1em 0; }
            h4 { font-size: 1em; margin: 1.33em 0; }
            h5 { font-size: 0.83em; margin: 1.67em 0; }
            h6 { font-size: 0.67em; margin: 2.33em 0; }
        </style>
    </head>
    <body>
        ${editorContent}
        ${
          companyLogoUrl
            ? `<img src="${companyLogoUrl}" alt="Company Logo" class="company-logo-watermark">`
            : ""
        }
        <div class="watermark">${watermarkText}</div>
    </body>
    </html>
`;