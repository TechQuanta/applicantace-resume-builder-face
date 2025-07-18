// MiddlePanel.jsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import Loading from '../../../Shared/Loading'; // Import the centralized Loading component

// --- Lazy Load Panel Components ---
const ResumeCVGuidelines = lazy(() => import("../EditingComponents/RACVGuidelines"));
const GitHubReferencePanel = lazy(() => import("../EditingComponents/GitHubReference"));
const TemplatesPanel = lazy(() => import("../EditingComponents/TemplatesPanel"));
const AiAssistantPanel = lazy(() => import("../EditingComponents/AiAssistantPanel"));
const History = lazy(() => import("../EditingComponents/History"));
const AtsScore = lazy(() => import("../EditingComponents/AtsScore"));
const Upload = lazy(() => import("../EditingComponents/Upload"));
const DesignAndFontShowcase = lazy(() => import("../EditingComponents/DesignAndFontShowcase"));

export default function MiddlePanel({ activePanel, setActivePanel, onCloseWithSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setIsOpen(!!activePanel);
  }, [activePanel]);

  const handleClose = () => {
    setIsOpen(false);
    setActivePanel(null);
    onCloseWithSidebarOpen?.();
  };

  const panelContent = () => {
    switch (activePanel) {
      case "rearrange":
        return <ResumeCVGuidelines />;
      case "templates":
        return <TemplatesPanel />;
      case "ai":
        return <AiAssistantPanel />;
      case "atscore":
        return <AtsScore />;
      case "history":
        return <History />;
      case "github":
        return <GitHubReferencePanel />;
      case "upload-file":
        return <Upload/>
      case "design-and-font":
        return <DesignAndFontShowcase />;
      default:
        // Ensures the default message is centered vertically and horizontally
        return (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-gray-500 dark:text-gray-400 font-sans">Select an option from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`h-full z-45 rounded-[30px] bg-transparent dark:bg-transparent transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0 " : "-translate-x-full"}
      ${isMobile ? "left-0 w-screen justify-center " : "left-[12rem] w-[390px] "}`}
    >
      {/* Panel Content - Wrapped in Suspense */}
      {/* This div correctly centers its content (either the panel or the Loading fallback) */}
      <div className="h-full pb-4 flex justify-center items-center">
        {/* Suspense boundary for lazy-loaded components, using the Loading component as fallback */}
        <Suspense fallback={<Loading />}>
          {panelContent()}
        </Suspense>
      </div>
    </div>
  );
}