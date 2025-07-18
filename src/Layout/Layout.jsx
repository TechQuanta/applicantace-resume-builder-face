import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "../components/Landing/components/NavBar/Navigation";
import Footer from "../components/Landing/components/Footer/Footer";
import Loading from "../components/Shared/Loading";

export default function Layout() {
  const { pathname } = useLocation();
  const hideFooter = pathname === "/SignUp";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-color)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen justify-center items-center flex flex-col bg-[var(--bg-color)]">
      <Navigation />
      <div className="h-[70px]" />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}