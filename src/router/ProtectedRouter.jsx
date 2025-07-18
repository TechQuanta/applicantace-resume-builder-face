// src/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '../services/authatom'; // Adjust path as needed

const ProtectedRoute = () => {
  const userSession = useRecoilValue(userState); // Get the current user session from Recoil
  const isAuthenticated = userSession.selected !== null; // Check if a user is currently selected (logged in)

  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/SignUp" replace />;
  }

  // If authenticated, render the child routes defined within this ProtectedRoute
  return <Outlet />;
};

export default ProtectedRoute;