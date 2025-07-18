import React, { useEffect, useState, useMemo } from "react";
import Body from "../components/Landing/LandingChest";
import Network from "../components/Landing/LandingStomac";
import CardsSection from "../components/Landing/CardsSection";
import ResumeCards from "../components/Landing/ResumeCards";
import HowItWorks from "../components/Landing/Howitwork";
import "../components/Landing/style/home.css";
const Home = () => {
  const [showNetwork, setShowNetwork] = useState(window.innerWidth >= 984);

  useEffect(() => {
    const handleResize = () => setShowNetwork(window.innerWidth >= 984);
    const throttledResize = () => {
      let resizeTimer;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", throttledResize);
    return () => window.removeEventListener("resize", throttledResize);
  }, []);

  const memoizedNetwork = useMemo(() => showNetwork && <Network />, [showNetwork]);

  return (
    <main className="home-wrapper overflow-hidden">
      <Body />
      <HowItWorks />
      <ResumeCards />
      <CardsSection />
      {memoizedNetwork}
    </main>
  );
};

export default Home;