import React, { useState, useEffect } from 'react';

const EditPostModal = ({ isOpen, onClose, postToEdit, onSave }) => {
  const [form, setForm] = useState({ name: '', question: '', story: '' });

  useEffect(() => {
    // Populate form fields when postToEdit changes (i.e., modal opens or new post selected)
    if (postToEdit) {
      setForm({
        name: postToEdit.name || '',
        question: postToEdit.question || '',
        story: postToEdit.story || '',
      });
    }
  }, [postToEdit]);

  if (!isOpen || !postToEdit) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name.trim() && form.question.trim() && form.story.trim()) {
      onSave({
        ...postToEdit, // Keep existing properties like ID, published date
        name: form.name.trim(),
        question: form.question.trim(),
        story: form.story.trim(),
        updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
      onClose(); // Close the modal after saving
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm transition-opacity duration-300 ease-out"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col transform scale-95 opacity-0 transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={isOpen ? { transform: 'scale(1) translateY(0)', opacity: 1 } : {}}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close edit form"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Your Story
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {/* Floating Label Input: Name */}
          <div className="relative z-0 w-full group">
            <input
              type="text"
              name="name"
              id="edit-name"
              value={form.name}
              onChange={handleChange}
              className="block py-3 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label
              htmlFor="edit-name"
              className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Your Name
            </label>
          </div>

          {/* Floating Label Textarea: Question/Title */}
          <div className="relative z-0 w-full group">
            <textarea
              name="question"
              id="edit-question"
              value={form.question}
              onChange={handleChange}
              rows="2"
              className="block py-3 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-y"
              placeholder=" "
              required
            ></textarea>
            <label
              htmlFor="edit-question"
              className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Question or Title
            </label>
          </div>

          {/* Floating Label Textarea: Story Content */}
          <div className="relative z-0 w-full group">
            <textarea
              name="story"
              id="edit-story"
              value={form.story}
              onChange={handleChange}
              rows="10"
              className="block py-3 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-y"
              placeholder=" "
              required
            ></textarea>
            <label
              htmlFor="edit-story"
              className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Your Full Story
            </label>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;