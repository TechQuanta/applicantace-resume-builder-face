import React, { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "../components/Dashboard/components/NavBar/UserNav";
import Loading from "../components/Shared/Loading";

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setIsLoading(false);
    };
    loadPage();
  }, []);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-none">
          <Loading />
        </div>
      );
    }

    return (
      <>
        <div className="w-screen bg-none">
          <Navigation className="overflow-hidden" />
        </div>
        <div className="flex flex-col items-center bg-none w-screen ">
          <div className="max-w-8xl">
            <Outlet />
          </div>
        </div>
      </>
    );
  }, [isLoading]);

  return renderContent;
}