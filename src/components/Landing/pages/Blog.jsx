import React, { useState, useEffect, useRef, useCallback } from 'react';
import SkeletonCard from '../components/SkeletonShell';
import { useUserSession } from '../../../hooks/useUserSession';
import SignInPromptModal from '../../Shared/SignInPromptModal';
import BlogStoryModal from '../components/BlogStoryModal';
import EditPostModal from '../components/EditPostModal'; // <--- Import EditPostModal

// Define an array of attractive gradient classes for the blog cards
const cardGradients = [
  "from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-950",
  "from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-950",
  "from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-950",
  "from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-950",
  "from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-950",
];

// --- IMPORTANT: ADD A 'story' AND 'userId' PROPERTY TO EACH POST OBJECT ---
// userId will be null for pre-defined posts. For user-posted ones, it will be the user's ID.
// Also add a unique 'id' to each post for easier manipulation.
const initialAllPosts = [
  {
    name: 'Enhancv Study',
    question: 'Who Do You Trust for Career Advice? A 2025 Enhancv Study',
    published: 'Oct 18, 2024',
    updated: 'May 8, 2025',
    readTime: '7 min read',
    story: 'In a rapidly evolving professional landscape, understanding who to trust for career advice is more critical than ever. This comprehensive 2025 Enhancv study surveyed thousands of professionals across various industries to identify the most credible sources of guidance. Findings reveal a significant shift towards peer-to-peer mentorship and specialized online communities, surpassing traditional HR departments and general career counselors. The study also highlights the growing influence of AI-powered career tools, with users reporting increased efficiency in resume optimization and interview preparation. Despite the rise of digital resources, the importance of human connection remains paramount, with many professionals still valuing personalized advice from mentors who have walked similar paths. This research provides invaluable insights for job seekers and career changers, emphasizing the need to diversify their advice-seeking strategies and leverage both technological advancements and authentic human connections.',
    userId: null,
    id: 'post-1'
  },
  {
    name: 'Workplace Survey',
    question: '1 in 3 Gen Z Employees Lie About Their Political Beliefs at Work',
    published: 'Sep 4, 2024',
    updated: 'May 8, 2025',
    readTime: '6 min read',
    story: 'A groundbreaking new survey reveals that approximately one-third of Gen Z employees admit to fabricating or concealing their true political beliefs in the workplace. This trend points to a broader concern about psychological safety and freedom of expression in professional environments. Researchers attribute this phenomenon to a heightened awareness of cancel culture, fear of professional repercussions, and a desire to maintain workplace harmony. The study suggests that companies need to foster more inclusive cultures where employees feel safe to express diverse viewpoints without fear of judgment or retaliation. This includes implementing clear communication policies, offering workshops on respectful discourse, and promoting leadership that models open-mindedness. The findings have significant implications for employee engagement, innovation, and retention, particularly as Gen Z constitutes an increasingly larger portion of the global workforce.',
    userId: null,
    id: 'post-2'
  },
  {
    name: 'AI Trends',
    question: 'Men Are 35% More Likely Than Women To Use AI To Write Their Resume',
    published: 'Jul 30, 2024',
    updated: 'May 8, 2025',
    readTime: '4 min read',
    story: 'A recent analysis of AI adoption in job search practices indicates a notable disparity: men are 35% more likely than women to utilize artificial intelligence tools for crafting their resumes. This data raises questions about access, awareness, and comfort levels with new technologies across genders in career development. Potential factors contributing to this gap include differences in early exposure to tech, marketing strategies of AI tools, or varying perceptions of AI’s efficacy. Experts suggest that career guidance platforms and educational institutions should actively promote AI literacy and tool accessibility to all individuals, ensuring that no demographic is left behind in leveraging cutting-edge resources for professional advancement. Bridging this gap could lead to more equitable opportunities in the competitive job market.',
    userId: null,
    id: 'post-3'
  },
  {
    name: 'Salary Expert',
    question: 'How to Negotiate Your Salary over the Phone in 2025: Job Offers 101',
    published: 'Jul 5, 2024',
    updated: 'May 8, 2025',
    readTime: '12 min read',
    story: 'Negotiating your salary over the phone can be intimidating, but in 2025, it remains a crucial step in securing the compensation you deserve. This comprehensive guide provides job seekers with a step-by-step framework for successful phone negotiations. It covers essential preparation, including researching industry benchmarks and personal value propositions. The article then delves into effective communication strategies, such as active listening, managing silence, and confidently articulating your worth. Practical advice on handling counter-offers, understanding benefits packages, and knowing when to push or pause is also included. By mastering these techniques, candidates can approach phone salary discussions with confidence, leading to more favorable outcomes and a stronger start to their new role.',
    userId: null,
    id: 'post-4'
  },
  {
    name: 'Career Coach',
    question: 'How (and When) to Add Your 2025 Promotions to Your Linkedin Profile',
    published: 'Jun 25, 2024',
    updated: 'May 8, 2025',
    readTime: '9 min read',
    story: 'Maximizing your professional visibility on LinkedIn after a promotion in 2025 requires strategic timing and thoughtful content. This guide from a leading career coach offers actionable advice on when precisely to update your LinkedIn profile, advising against premature announcements and recommending updates after formal confirmation. It provides detailed instructions on how to articulate your new role and responsibilities effectively, emphasizing quantifiable achievements and new skills. Tips include leveraging keywords for increased search visibility, requesting recommendations from colleagues, and engaging with industry leaders to highlight your career progression. Properly showcasing your promotions on LinkedIn can significantly boost your professional brand, attract new opportunities and expand your network.',
    userId: null,
    id: 'post-5'
  },
  {
    name: 'Resume Guide',
    question: 'How to Add Your Best Professional Affiliations to Your 2025 Resume',
    published: 'Jun 13, 2024',
    updated: 'May 8, 2025',
    readTime: '9 min read',
    story: 'Enhancing your resume with professional affiliations can significantly boost your credibility and demonstrate your commitment to your field. This 2025 guide provides expert advice on selecting and strategically listing your best professional memberships, certifications, and volunteer positions. It covers formatting tips to ensure these affiliations stand out without cluttering the document, suggesting placement within a dedicated section or integrated into relevant experience descriptions. The article also advises on tailoring affiliations to specific job descriptions, highlighting those most relevant to the target role. By effectively incorporating these credentials, job seekers can showcase their industry engagement, leadership qualities, and continuous professional development, making their resume more impactful.',
    userId: null,
    id: 'post-6'
  },
];

const BATCH_SIZE = 6;

const CareerGrowthPage = () => {
  // Use a state for allPosts to allow adding/editing
  const [posts, setPosts] = useState(initialAllPosts);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const observer = useRef(null);
  const [batchIndex, setBatchIndex] = useState(0);
  const loaderRef = useRef();

  const [form, setForm] = useState({ name: '', question: '' });
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // For viewing story modal
  const [postToEdit, setPostToEdit] = useState(null); // For editing modal
  const [showConfirmation, setShowConfirmation] = useState(null); // For confirmation messages
  const [filterMyPosts, setFilterMyPosts] = useState(false); // New state for filtering

  // Simulate a logged-in user with a unique ID
  const { user } = useUserSession();
  const isLoggedIn = user && user.selected && user.selected.token;
  // IMPORTANT: Replace 'mock-user-id-123' with the actual user ID from your session
  const currentUserId = isLoggedIn ? user.selected.uid || 'mock-user-id-123' : null;

  // Function to load more posts with a simulated delay, considering the filter
  const loadMore = useCallback(() => {
    // Determine which posts to slice from based on the filter
    const postsToRender = filterMyPosts && currentUserId
      ? posts.filter(p => p.userId === currentUserId)
      : posts;

    // Check if all relevant posts are loaded
    if (batchIndex * BATCH_SIZE >= postsToRender.length) {
      setLoading(false); // No more to load
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const nextBatch = postsToRender.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
      setVisiblePosts((prev) => {
        // If filtering or starting new load, replace previous, else append
        return batchIndex === 0 ? [...nextBatch] : [...prev, ...nextBatch];
      });
      setBatchIndex((prev) => prev + 1);
      setLoading(false);
    }, 600);
  }, [batchIndex, posts, filterMyPosts, currentUserId]); // Add dependencies

  // Effect to re-load posts when filter or user changes
  useEffect(() => {
    setVisiblePosts([]); // Clear visible posts to re-load from scratch
    setBatchIndex(0);    // Reset batch index
  }, [filterMyPosts, posts, currentUserId]); // Trigger reload when filter/posts/user changes

  useEffect(() => {
    loadMore(); // Initial load or reload after filter/user change
  }, [batchIndex, loadMore]); // Only trigger when batchIndex or loadMore changes

  // Set up Intersection Observer for infinite scrolling
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.current.observe(loaderRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loadMore, loading]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowSignInModal(true);
      return;
    }

    if (form.name.trim() && form.question.trim()) {
      const newPost = {
        name: form.name.trim(),
        question: form.question.trim(),
        published: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '5 min read',
        story: `This is the user-submitted story for: "${form.question}". It was posted by ${form.name}. This is a dynamic placeholder. In a production environment, this content would be stored and retrieved from a backend database.`,
        userId: currentUserId, // Assign current user's ID
        id: `user-post-${Date.now()}` // Unique ID for new post
      };

      // Simulate API call delay
      setLoading(true);
      setTimeout(() => {
        setPosts((prev) => [newPost, ...prev]); // Add to the main posts array
        setForm({ name: '', question: '' });
        setShowConfirmation('Post added successfully!');
        setTimeout(() => setShowConfirmation(null), 3000); // Hide after 3 seconds
        setLoading(false);
      }, 500); // Simulate network latency
    } else {
      alert('Please fill in both your name and question.');
    }
  };

  const handleSignInClick = () => {
    console.log("Redirecting to sign-in page...");
    setShowSignInModal(false);
  };

  const openStoryModal = (post) => {
    setSelectedPost(post);
  };

  const closeStoryModal = () => {
    setSelectedPost(null);
  };

  // --- NEW: Edit Post Handlers ---
  const openEditModal = (post) => {
    setPostToEdit(post);
  };

  const closeEditModal = () => {
    setPostToEdit(null);
  };

  const handleSaveEditedPost = (updatedPost) => {
    // Simulate API call delay for saving
    setLoading(true);
    setTimeout(() => {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
      setShowConfirmation('Post updated successfully!');
      setTimeout(() => setShowConfirmation(null), 3000);
      setLoading(false);
      // The `useEffect` listening to `posts` state will trigger a re-render of `visiblePosts`
    }, 500);
  };

  const handleFilterToggle = () => {
    setFilterMyPosts(prev => !prev);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 pb-20 font-sans text-gray-900 dark:text-gray-100">
      {/* Header Banner */}
      <div className="relative w-full h-72 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('main/banner.jpg')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent flex items-end justify-center pb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg animate-fade-in-up">
            Pathways to Professional Excellence
          </h1>
        </div>
      </div>

      {/* Confirmation Message */}
      {showConfirmation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl text-lg animate-fade-in-down">
          {showConfirmation}
        </div>
      )}

      {/* Posts Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mt-16">
        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-6 text-center animate-slide-in-right">
          Latest Career Insights & Stories
        </h2>

        {/* Filter My Posts Button */}
        {isLoggedIn && (
          <div className="flex justify-center mb-10 animate-fade-in">
            <button
              onClick={handleFilterToggle}
              className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out flex items-center shadow-md
                ${filterMyPosts
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0H9m7 0h-1.5M12 21v-3m-3 3h6"></path></svg>
              {filterMyPosts ? 'Showing My Posts' : 'Show Only My Posts'}
            </button>
          </div>
        )}


        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {visiblePosts.length === 0 && !loading && filterMyPosts && isLoggedIn && (
            <p className="col-span-full text-center text-xl text-gray-600 dark:text-gray-300 py-10">
              You haven't posted anything yet. Be the first!
            </p>
          )}

          {visiblePosts.map((post, index) => (
            <div
              key={post.id || `post-${index}`} // Use unique ID as key
              className={`bg-gradient-to-br ${cardGradients[index % cardGradients.length]}
                          p-7 rounded-3xl shadow-xl hover:shadow-2xl
                          transform hover:-translate-y-2 transition-all duration-500 ease-out
                          border border-transparent hover:border-blue-400 dark:hover:border-blue-600
                          cursor-pointer group relative overflow-hidden`}
            >
              {/* Optional: Add a subtle patterned overlay */}
              <div className="absolute inset-0 bg-dots opacity-5 dark:opacity-10 z-0"></div>

              <div className="relative z-10 flex flex-col h-full" onClick={() => openStoryModal(post)}>
                {/* Category Tag */}
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 mb-4 shadow-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Career Growth
                </span>

                {/* Question/Title */}
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight line-clamp-3 group-hover:text-indigo-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                  {post.question}
                </h3>

                {/* Post Metadata */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Published: {post.published}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 16.087V18m-2.5-4.242h-.008M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Updated: {post.updated}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477-4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>
                    {post.readTime}
                  </p>
                </div>
              </div>

              {/* --- NEW: Edit Button (Conditional) --- */}
              {isLoggedIn && post.userId === currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening story modal when clicking edit
                    openEditModal(post);
                  }}
                  className="absolute bottom-4 right-4 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md transition-transform transform scale-95 hover:scale-100 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  Edit
                </button>
              )}
            </div>
          ))}

          {/* Skeleton Loaders for infinite scroll */}
          {loading &&
            Array.from({ length: BATCH_SIZE }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </div>
        {/* Loader Observer Div */}
        <div ref={loaderRef} className="h-10 mt-10" />
      </section>

      {/* Blog Input Form / Sign-In Prompt Section */}
      <section className="max-w-3xl mx-auto mt-24 px-6 lg:px-8">
        {isLoggedIn ? (
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-700 animate-slide-in-down">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Share Your Career Journey, Ask Your Questions!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center leading-relaxed">
              Have a burning question about career growth or a valuable insight to share? Post it here and join the conversation with our thriving community!
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Floating Label Input: Name */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  className="block py-3 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="name"
                  className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Your Name
                </label>
              </div>

              {/* Floating Label Textarea: Question */}
              <div className="relative z-0 w-full mb-6 group">
                <textarea
                  name="question"
                  id="question"
                  value={form.question}
                  onChange={handleChange}
                  rows="5"
                  className="block py-3 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-y"
                  placeholder=" "
                  required
                ></textarea>
                <label
                  htmlFor="question"
                  className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  What's your question or story about career growth?
                </label>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Post Your Insight
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-3xl shadow-2xl text-center border border-gray-100 dark:border-gray-700 animate-slide-in-down">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Unlock Your Voice!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Sign in to share your valuable career growth questions and insights with our vibrant community. Let's learn and grow together!
            </p>
            <button
              onClick={() => setShowSignInModal(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xl rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
            >
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              Sign In to Post
            </button>
          </div>
        )}
      </section>

      {/* Sign-In Modal */}
      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInClick={handleSignInClick}
        theme={"light"}
      />

      {/* Blog Story Modal */}
      <BlogStoryModal
        isOpen={!!selectedPost}
        onClose={closeStoryModal}
        post={selectedPost}
      />

      {/* --- NEW: Edit Post Modal --- */}
      <EditPostModal
        isOpen={!!postToEdit}
        onClose={closeEditModal}
        postToEdit={postToEdit}
        onSave={handleSaveEditedPost}
      />
    </div>
  );
};

export default CareerGrowthPage;