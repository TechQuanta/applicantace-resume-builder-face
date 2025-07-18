import React, { useState } from "react";

// Section Component - Re-usable for consistent styling of content blocks
const Section = ({ title, children }) => (
  <div className="space-y-3">
    {/* Heading for the section with a border and specific font stack */}
    <h2 className="text-xl font-semibold border-l-4 border-blue-400 pl-3" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>
      {title}
    </h2>
    {/* Content within the section, also with the specific font stack */}
    <div className="ml-5 text-base space-y-2" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>
      {children}
    </div>
  </div>
);

const ResumeCVGuidelines = () => {
  const [showGlance, setShowGlance] = useState(false);

  return (
    // Main container for the guidelines with the primary ATS-friendly font stack applied
    <div
      className="relative h-[600px] w-full bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100"
      style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }} // Apply the font to the root
    >
      {/* Animated Background Blobs (visual flair, not affecting text) */}
      <div className="absolute top-[-5rem] left-[-5rem] w-72 h-72 bg-purple-300 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-[-5rem] right-[-5rem] w-72 h-72 bg-blue-300 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse z-0"></div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 overflow-y-auto h-full gap-2 max-w-5xl mx-auto p-6 animate-fadeInSlow"> {/* Added p-6 for overall padding */}

        {/* Callout Section */}
        <div className="bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 border-l-4 border-yellow-400 p-4 rounded shadow animate-bounceIn mb-6" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>
          <p className="font-semibold">
            🚨 Always tailor your resume to the job description. Highlight keywords using <span className="underline">bold</span> or <span className="italic">italic</span>. Use <span className="text-purple-600 font-bold">ApplicantMaster</span> for smart suggestions!
          </p>
        </div>

        {/* Resume Sections - Each uses the Section component for consistent font and layout */}
        <Section title="1. File Format">
          <ul className="list-disc pl-6 space-y-1">
            <li>✅ Use <strong>PDF</strong> (preferred) or <strong>DOCX</strong>.</li>
            <li>❌ Avoid image files like JPG or PNG – not ATS readable.</li>
          </ul>
        </Section>

        <Section title="2. Fonts & Typography">
          <ul className="list-disc pl-6 space-y-1">
            {/* The code tag is good here to highlight the fonts visually */}
            <li>✅ Use ATS-safe fonts: <code>Calibri, Arial, Helvetica, Times New Roman</code>.</li>
            <li>🆗 Font size: 10.5–12pt (body), 14–16pt (headings).</li>
            <li>🚫 Avoid decorative fonts (e.g., Comic Sans, cursive).</li>
          </ul>
        </Section>

        <Section title="3. Layout & Structure">
          <ul className="list-disc pl-6 space-y-1">
            <li>📐 Use 1-inch margins on all sides.</li>
            <li>📄 Keep layout clean – avoid columns or tables.</li>
            <li>🎯 Use sections: <code>Summary, Experience, Skills, Education</code>.</li>
            <li>🔁 Use reverse-chronological format for jobs.</li>
          </ul>
        </Section>

        <Section title="4. ATS Keywords & Optimization">
          <ul className="list-disc pl-6 space-y-1">
            <li>🧠 Pull keywords from the job description.</li>
            <li>🔑 Include acronyms and full terms (e.g., SEO & Search Engine Optimization).</li>
            <li>📊 Do not overuse – integrate them naturally.</li>
          </ul>
        </Section>

        <Section title="5. Highlight Important Text">
          <ul className="list-disc pl-6 space-y-1">
            <li>🖍️ Use <strong>bold</strong> and <em>italic</em> for achievements, tools, and certifications.</li>
            <li>🤖 Ask <span className="text-purple-600 font-bold">ApplicantMaster</span> what to highlight per job!</li>
          </ul>
        </Section>

        <Section title="6. Power Verbs & Impact">
          <ul className="list-disc pl-6 space-y-1">
            <li>🚀 Use verbs like: <strong>Led, Designed, Built, Improved</strong>.</li>
            <li>⚠️ Avoid: “Was responsible for”, “Worked on”.</li>
          </ul>
        </Section>

        <Section title="7. Length & File Naming">
          <ul className="list-disc pl-6 space-y-1">
            <li>📄 1 page for less than 7 years experience.</li>
            <li>📄 2 pages for senior roles or technical careers.</li>
            <li>💾 Save as: <code>Firstname_Lastname_Resume.pdf</code></li>
          </ul>
        </Section>

        <Section title="8. ❌ What to Avoid">
          <ul className="text-red-700 dark:text-red-300 list-disc pl-6 space-y-1">
            <li>🚫 No columns, tables, or text boxes.</li>
            <li>🚫 Avoid graphics, icons, and headshots.</li>
            <li>🚫 Don’t use custom headers/footers – they may be skipped by ATS.</li>
            <li>🚫 Never copy-paste large parts from job posts word-for-word.</li>
            <li>🚫 Don’t lie or exaggerate experience.</li>
          </ul>
        </Section>

        {/* Final Tips Section */}
        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg border border-blue-200 dark:border-blue-700 shadow-lg animate-fadeIn mt-6"> {/* Added mt-6 for spacing */}
          <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-300" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>💡 Final Pro Tips</h3>
          <ul className="list-disc pl-6 space-y-2" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>
            <li>
              🚀 Run your resume through <strong>our ATS checker</strong> to get your personalized <em>score</em> and see how well it gets scanned by our system.
            </li>
            <li>✅ Always proofread — grammar and formatting make a big difference!</li>
            <li>🎯 Customize your resume for every job you apply to boost your chances.</li>
            <li>🤖 Use <strong>ApplicantMaster</strong> for tailored, AI-powered suggestions that highlight what matters most.</li>
          </ul>
        </div>
      </div>

      {/* Resume Tips Button (Fixed) */}
      <button
        onClick={() => setShowGlance(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg animate-bounce"
        style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }} // Apply font to button as well
      >
        ℹ️ Resume Tips
      </button>

      {/* Modal */}
      {showGlance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-end sm:items-center p-4 z-50">
          <div
            className="bg-white dark:bg-gray-900 w-full sm:w-96 p-6 rounded-lg shadow-xl animate-fadeInUp space-y-4"
            style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }} // Apply font to modal content
          >
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>🚀 Resume Glance Tips</h2>
            <ul className="list-disc pl-5 text-gray-800 dark:text-gray-200 space-y-2 text-sm" style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }}>
              <li>Use only PDF/DOCX</li>
              <li>1-inch margins, no columns</li>
              <li>Highlight keywords with <strong>bold</strong></li>
              <li>Ask <strong>ApplicantMaster</strong> for job-specific guidance</li>
              <li>Proofread before sending!</li>
            </ul>
            <a
              href="/Blog"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-blue-600 hover:text-blue-800 underline font-medium"
              style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }} // Apply font to link
            >
              📖 Read Full Blog
            </a>
            <button
              onClick={() => setShowGlance(false)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              style={{ fontFamily: "Calibri, Arial, Helvetica, Times New Roman, sans-serif" }} // Apply font to button
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeCVGuidelines;