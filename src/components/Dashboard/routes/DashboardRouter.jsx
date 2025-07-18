// src/routes/DashboardRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../../../router/ProtectedRouter"; // Adjust path if needed

// Using React.lazy for code splitting for protected dashboard pages
const UserLayout = React.lazy(() => import("../../../Layout/UserLayout")); // Adjust path if your UserLayout is elsewhere
const Documents = React.lazy(() => import("../pages/Documents"));
const ResumeEditor = React.lazy(() => import("../pages/EditResume"));
const CompareTemplates = React.lazy(() => import("../pages/CompareTemplate"));
const Applications = React.lazy(() => import("../pages/JobApplicantions"));

const DashboardRoutes = (
  // All nested routes here will automatically be protected by ProtectedRoute
  <Route element={<ProtectedRoute />}>
    {/* Main dashboard path with dynamic username segment */}
    <Route path="/:username/dashboard" element={<UserLayout />}>
      {/* Default page for /:username/dashboard (e.g., Documents) */}
      <Route index element={<Documents />} />

      {/* Specific sub-pages within the dashboard */}
      <Route path="opennings" element={<Applications />} />
      <Route path="documents" element={<Documents />} />
      <Route path="edit-resume" element={<ResumeEditor />} />
      <Route path="compare-templates" element={<CompareTemplates />} />
    </Route>
  </Route>
);

export default DashboardRoutes;