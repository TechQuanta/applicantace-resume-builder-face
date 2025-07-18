import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useUserSession } from "../hooks/useUserSession"; // Ensure this path is correct
import { User, LifeBuoy, XCircle } from 'lucide-react';
import Subscribe from "../assets/subscribe.gif";
import Navigation from "../assets/navigation.gif";
const formatName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const faqs = [
  {
    question: "How to Use the Site?",
    answer: "To get started, simply navigate to the main site. You can explore various features using the navigation bar located at the top of the page. You'll find sections for different tools, your profile, and the help center. To use any of the AI-powered features, you'll first need to log in or create an account.",
    gif: Navigation,
  },
  {
    question: "How to Use the AI Assist Jot?",
    answer: "The <strong>AI Assist Jot</strong> tool is your personal chatbot, designed to help you craft professional cover letters, resumes, and other job-related documents. Just follow these simple steps:<br/><br/>1. Select the tool: Click on \"AI Assist Jot\" from the main menu.<br/>2. Provide your details: The tool will prompt you to enter information like your job title, company, skills, and qualifications. The more detail you provide, the better the output will be.<br/>3. Generate content: Click the \"Generate\" button. The AI will then create a draft for you.<br/>4. Review and edit: You can review the generated content and make any necessary edits directly on the page.",
    gif: "https://your-gif-link-here.com/ai-assist-jot.gif",
  },
  {
    question: "How to Use the AI CL Generator?",
    answer: "The <strong>AI Cover Letter (CL) Generator</strong> helps you create customized cover letters in minutes. <br/><br/>1. Open the tool: Find and select the \"AI CL Generator\" from the tools section.<br/>2. Input information: Enter the job description and details about your professional background. The AI uses this information to tailor the cover letter.<br/>3. Generate and refine: Once you've entered all the necessary information, click \"Generate Cover Letter.\" You can then edit and download the letter as a PDF or Word document.",
    gif: "https://your-gif-link-here.com/ai-cl-generator.gif",
  },
  {
    question: "How to Use the ATS Checker?",
    answer: "An <strong>ATS (Applicant Tracking System) checker</strong> helps you optimize your resume to pass automated screening systems. <br/><br/>1. Upload your resume: On the ATS Checker page, upload your resume file (PDF or DOCX).<br/>2. Enter the job description: Copy and paste the job description you're applying for into the provided text box.<br/>3. Get your score: Click \"Analyze.\" The tool will provide a compatibility score and highlight keywords you're missing from the job description to help you improve your resume.",
    gif: "https://your-gif-link-here.com/ats-checker.gif",
  },
  {
    question: "How to Subscribe for Updates?",
    answer: "Stay up-to-date with new features and community news by subscribing to our newsletter.<br/><br/>",
    gif: Subscribe,
  },
  {
    question: "How to Use Google Docs in Our App?",
    answer: "Our platform integrates with <strong>Google Docs</strong> for a seamless experience.<br/><br/>1. Connect your Google account: Go to your profile settings and link your Google account. This will give our app permission to access and save files to your Google Drive.<br/>2. Save your work: When you're using our tools, you'll see a \"Save to Google Docs\" button. Click this to automatically save your generated documents to your Drive.<br/>3. Edit in Docs: You can open and edit these documents directly in Google Docs from our app.",
    gif: "https://your-gif-link-here.com/google-docs.gif",
  },
  {
    question: "Other Things",
    answer: "If you have any other questions or need further assistance, you can:<br/><br/><strong>Contact Support</strong>: Email our support team at <strong>techquanta.community@gmail.com</strong>.<br/><strong> Check FAQs</strong>: Visit our main page for a list of frequently asked questions.<br/><strong> Join the Community </strong>: Connect with other users on our <strong>TechQuanta</strong> community to share tips and get advice. <a href='https://techquanta.tech'>TechQuanta</a>",
    gif: "https://your-gif-link-here.com/other-things.gif",
  },
];

const HelpCenter = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalGif, setModalGif] = useState(null); // New state for the modal
  const { user } = useUserSession();
  const isLoggedIn = !!user.selected;

  const dashboardPath = user?.selected?.username
    ? `/${user.selected.username}/dashboard`
    : user?.selected?.name
    ? `/${formatName(user.selected.name)}/dashboard`
    : "/dashboard";

  const handleBackClick = () => {
    setSelectedIndex(null);
  };

  const handleQuestionClick = (index) => {
    setSelectedIndex(index);
  };

  const openModal = (gifUrl) => {
    setModalGif(gifUrl);
  };

  const closeModal = () => {
    setModalGif(null);
  };

  return (
    <section className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg min-h-[400px] relative">
      {isLoggedIn ? (
        <Link
          to={dashboardPath}
          className="absolute top-4 left-4 p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
          aria-label="Go to user dashboard"
        >
          <User size={24} />
        </Link>
      ) : (
        <button
          className="absolute top-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
          aria-label="Help Center"
        >
          <LifeBuoy size={24} />
        </button>
      )}

      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Help Center
      </h2>

      {selectedIndex === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {faqs.map(({ question }, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(index)}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-center items-start text-left focus:outline-none focus:ring-4 focus:ring-blue-600"
              aria-label={`View answer for: ${question}`}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {question}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                Click to view answer
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedIndex !== null && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl mx-auto" aria-live="polite" aria-atomic="true">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {faqs[selectedIndex].question}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: faqs[selectedIndex].answer }} />
          <div className="mb-6 text-center">
            {/* The image is now a button to open the modal */}
            <button
              onClick={() => openModal(faqs[selectedIndex].gif)}
              className="inline-block p-2 rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-600"
              aria-label={`View larger GIF for ${faqs[selectedIndex].question}`}
            >
              <img
                src={faqs[selectedIndex].gif}
                alt={`GIF for ${faqs[selectedIndex].question}`}
                className="w-full max-w-lg mx-auto rounded-lg shadow-md"
              />
            </button>
          </div>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            aria-label="Go back to question list"
          >
            ← Back to questions
          </button>
        </div>
      )}

      {/* The GIF Modal Component */}
      {modalGif && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-transparent rounded-lg max-w-4xl max-h-full overflow-hidden"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white z-10"
              aria-label="Close GIF"
            >
              <XCircle size={36} />
            </button>
            <img
              src={modalGif}
              alt="Expanded GIF"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HelpCenter;