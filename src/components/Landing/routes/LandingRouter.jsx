// src/routes/LandingRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import lazyWithPreload from "../../../utils/lazyloadingpreloads"; // Import the utility

// Using lazyWithPreload for code splitting for public pages
// Correct path for Layout (from src/routes to src/Layout)
const MainLayout = lazyWithPreload(() => import("../../../Layout/Layout"));

// Correct paths for pages (from src/routes to src/pages)
const Home = lazyWithPreload(() => import("../../../pages/Home"));
const Blog = lazyWithPreload(() => import("../pages/Blog")); // Assuming Blog is relative to src/routes
const FAQs = lazyWithPreload(() => import("../pages/FAQs")); // Assuming FAQs is relative to src/routes
const ResumeExamples = lazyWithPreload(() => import("../pages/ResumeExamples")); // Relative to src/routes
const ResumeTemplates = lazyWithPreload(() => import("../pages/ResumeTemplates")); // Relative to src/routes
const HelpLayout = lazyWithPreload(() => import("../../../Layout/HelpLayout"));
const HelpCenter = lazyWithPreload(() => import("../../../pages/helpcenter"));
const Documentation = lazyWithPreload(() => import("../../../pages/Documentation")); // Relative to src/routes
const AuthPage = lazyWithPreload(() => import("../../../pages/AuthPage")); // Assuming AuthPage handles both login/signup

// --- New: Map of route paths to their preloading functions ---
// This map will be imported by the Navigation component
export const preloadedComponentsMap = {
  "/": Home, // Home component
  "/blog": Blog,
  "/faq": FAQs,
  "/resume-examples": ResumeExamples,
  "/resume-templates": ResumeTemplates,
  "/SignUp": AuthPage,
  // Add HelpLayout and its children if you want to preload them on hover too,
  // but usually, layouts are loaded once.
  // We include them here for completeness if you want to enable preloading for them
  // based on specific navigation items.
  "/help": HelpCenter, // Assuming /help defaults to HelpCenter
  "/help/documentation": Documentation,
  // Add DashboardPage here if it's part of LandingRoutes
  // If DashboardPage is in a separate ProtectedRoutes file,
  // you'll create a similar map there and import it where needed.
};


const LandingRoutes = (
  <React.Fragment>
    <Route path="/" element={<MainLayout />}>
      {/* Default route for the application, shows Home page */}
      <Route index element={<Home />} />

      {/* Public accessible pages */}
      <Route path="blog" element={<Blog />} />
      <Route path="faq" element={<FAQs />} />
      <Route path="resume-examples" element={<ResumeExamples />} />
      <Route path="resume-templates" element={<ResumeTemplates />} />

      {/* Authentication related pages */}
      <Route path="SignUp" element={<AuthPage />} />
    </Route>
    <Route path="/help" element={<HelpLayout />}>
      <Route index element={<HelpCenter />} />
      <Route path="documentation" element={<Documentation />} />
    </Route>
  </React.Fragment>
);

export default LandingRoutes;