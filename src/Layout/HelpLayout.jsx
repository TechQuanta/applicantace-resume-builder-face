import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Loading from "../components/Shared/Loading";

const tabs = [
  { name: "Help Center", path: "" },
  { name: "Documentation", path: "/documentation" },
];

const HelpLayout = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for content
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const currentPathSegment = location.pathname.split('/').pop();
    const newIndex = tabs.findIndex((tab) => tab.path.split('/').pop() === currentPathSegment);

    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    } else if (newIndex === -1 && location.pathname.endsWith("/help")) {
      if (activeIndex !== 0) {
        setActiveIndex(0);
      }
    }
  }, [location.pathname, activeIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 px-4 py-6 h-screen w-screen overflow-hidden font-open-sans">
      <div className="relative mb-0 ml-3">
        <div className="flex space-x-3">
          {tabs.map((tab, index) => {
            const fullPath = tab.path === ""
              ? `${location.pathname.split('/help')[0]}/help`
              : `${location.pathname.split('/help')[0]}/help${tab.path}`;
            
            const isActive = index === activeIndex;

            return (
              <NavLink
                key={tab.path}
                to={fullPath}
                className={`relative px-5 py-2 text-sm font-medium rounded-t-xl ${
                  isActive
                    ? "bg-white dark:bg-gray-900 text-black dark:text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                } font-prompt`}
                style={{
                  marginBottom: isActive ? "-1px" : "0px",
                  transition: "background-color 350ms cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                {tab.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="relative border border-t-0 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 p-6 flex-grow overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default HelpLayout;