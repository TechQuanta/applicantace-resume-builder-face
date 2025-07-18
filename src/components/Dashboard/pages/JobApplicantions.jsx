import React, { useState, useEffect } from 'react';
import { ChevronDown, ExternalLink, Mail, Briefcase, DollarSign, Users, MapPin, Calendar, Globe, Info } from 'lucide-react';

import Loading from '../../Shared/Loading'; // Ensure this path is correct

// Your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbznfk9RnVlYnne36m805fRhHv8OIRgTw_y3pND05weJWeR9Qeodih5hZsh_iWsPgkXmeA/exec';

// Helper function to format job details for display
const renderDetail = (label, value, IconComponent) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <p className="flex items-start text-lg text-gray-700 dark:text-gray-300 font-inter">
      {IconComponent && <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" />}
      <span className="font-semibold text-gray-800 dark:text-gray-100">{label}:</span> <span className="ml-2 break-words">{String(value)}</span>
    </p>
  );
};

export default function JobOpeningsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Job Data ---
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Data received is not an array. Check Apps Script output.');
        }
        setJobs(data);
        if (data.length > 0) {
          setSelectedJob(data[0]); // Select the first job by default
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load job listings. Please check your internet connection or try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // --- Handle Dropdown Selection ---
  const handleJobSelect = (event) => {
    const selectedJobHeading = event.target.value;
    const job = jobs.find(j => j.job_heading === selectedJobHeading);
    setSelectedJob(job);
  };

  // --- Conditional Render: Loading, Error, No Jobs ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-gray-700 dark:text-gray-200">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-xl shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4 font-raleway">Connection Error!</h2>
        <p className="text-lg mb-4 font-inter">{error}</p>
        <p className="text-gray-700 dark:text-gray-300 font-inter">Please ensure your Google Apps Script is deployed correctly, accessible (set to 'Anyone'), and the URL is accurate.</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-xl shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4 font-raleway">No Job Openings Available Right Now</h2>
        <p className="text-lg font-inter">We're constantly updating our listings. Please check back soon!</p>
      </div>
    );
  }

  // --- Main Content Render ---
  return (
    <div className="min-h-screen font-sans pt-16 lg:ml-20 lg:pl-32 bg-transparent text-gray-800 dark:text-gray-100 antialiased flex flex-col lg:flex-row">
      {/* Left Section: Enthusiastic GIF and Job Selection */}
      <div className="lg:w-1/3 p-6 lg:p-10 flex flex-col items-center lg:items-end justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg lg:shadow-none lg:border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out animate-fadeIn">
        <img
          src="/openings.gif" // Ensure this path is correct relative to your public folder
          alt="Team Enthusiasm"
          className="rounded-3xl shadow-xl w-full max-w-md lg:max-w-full border-4 border-blue-200 dark:border-gray-700 object-cover transform hover:scale-[1.01] transition-transform duration-300 mb-8 lg:mb-12"
        />
        <div className="text-center lg:text-right w-full max-w-md lg:max-w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-800 dark:text-white font-raleway leading-tight">
            Join Our Vibrant Team
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-blue-300 font-inter">
            Explore exciting career opportunities. Select a job title below to view its comprehensive details.
          </p>
        </div>
      </div>
      {/* Right Section: Selected Job Details (Full Width) */}
      <div className="lg:w-2/3 p-6 lg:p-10 flex flex-col justify-start bg-transparent shadow-inner rounded-l-none lg:rounded-l-2xl transition-all duration-300 ease-in-out animate-fadeIn">
        {selectedJob ? (
          <div className="w-full">
            <div className="relative flex items-center justify-center lg:justify-end pb-5">
              <select
                id="job-select"
                onChange={handleJobSelect}
                value={selectedJob ? selectedJob.job_heading : ''}
                className="block w-full py-4 pl-6 pr-12 text-xl font-semibold bg-white text-blue-800 border-gray-300 focus:ring-blue-400 dark:bg-gray-700 dark:text-blue-300 dark:border-gray-600 dark:focus:ring-blue-500 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:border-transparent appearance-none cursor-pointer transition-all duration-200 hover:border-blue-400 font-lato"
              >
                {!selectedJob && <option value="" disabled>Select a Job Title...</option>}
                {jobs.map((job) => (
                  <option key={job.job_heading} value={job.job_heading}>
                    {job.job_heading} ({job.job_position})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                <ChevronDown className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-blue-800 dark:text-blue-300 font-raleway leading-tight border-b pb-4 border-gray-200 dark:border-gray-700 transition-all duration-500 delay-100 animate-fadeIn">
              {selectedJob.job_heading}
            </h2>
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 transition-all duration-500 delay-200 animate-fadeIn">
              {renderDetail('Position', selectedJob.job_position, Briefcase)}
              {renderDetail('Level', selectedJob.job_level, Users)}
              {renderDetail('Interview Stage', selectedJob.job_interview_level, Calendar)}
              {renderDetail('Location', selectedJob.Location, MapPin)}
              {renderDetail('Posted On', selectedJob['Posted Date'], Globe)}
              {renderDetail('Income Range', selectedJob.job_income_description, DollarSign)}
            </div>
            {/* About the Role */}
            <div className="transition-all duration-500 delay-300 animate-fadeIn">
                <h3 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-400 font-raleway border-b pb-2 border-gray-200 dark:border-gray-700">About the Role:</h3>
                <p className="text-lg leading-relaxed whitespace-pre-wrap mb-8 text-gray-700 dark:text-gray-300 font-inter">
                  {selectedJob.job_description}
                </p>
            </div>
            {/* Benefits */}
            {selectedJob.job_benefits && (
              <div className="transition-all duration-500 delay-400 animate-fadeIn">
                <h3 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-400 font-raleway border-b pb-2 border-gray-200 dark:border-gray-700">Benefits:</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-8 font-inter">{selectedJob.job_benefits}</p>
              </div>
            )}
            {/* Apply Link Button */}
            {selectedJob.apply_link ? (
              <div className="mt-8 text-center transition-all duration-500 delay-500 animate-fadeIn">
                <a
                  href={selectedJob.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 font-quicksand"
                >
                  <ExternalLink className="w-6 h-6 mr-3" />
                  Apply Now
                </a>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center justify-center gap-3 font-semibold font-inter transition-all duration-500 delay-500 animate-fadeIn">
                <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                Application link not available for this position.
              </div>
            )}
            {/* HR Contact Email Section */}
            {selectedJob.hr_email && (
              <div className="mt-12 p-6 bg-blue-50 dark:bg-gray-700 rounded-lg shadow-inner border border-blue-200 dark:border-gray-600 transition-all duration-500 delay-600 animate-fadeIn">
                <h3 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300 flex items-center font-raleway">
                  <Mail className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Connect with HR
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-inter mb-3">
                  Have questions about this role or need more information? Feel free to reach out to our Human Resources team directly.
                </p>
                <a
                  href={`mailto:${selectedJob.hr_email}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-300 hover:underline font-semibold text-xl font-lato transition-colors duration-200"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {selectedJob.hr_email}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 font-inter text-xl py-20 transition-all duration-500 delay-100 animate-fadeIn">
            <Info className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-2xl font-semibold mb-2 font-raleway">No Job Selected</p>
            <p className="text-lg text-center max-w-sm font-inter">
              Please choose a job opening from the list on the left to see its full details here.
            </p>
          </div>
        )}
      </div>
      {/* Tailwind CSS Animation for fadeIn (add this to your main CSS file like index.css) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}