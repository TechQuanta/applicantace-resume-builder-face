import React,{ useState, useEffect } from "react";




const WindingRoad = () => {
  const [popups, setPopups] = useState([false, false, false, false, false]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPopups((prev) => [true, prev[1], prev[2], prev[3], prev[4]]), 1000),
      setTimeout(() => setPopups((prev) => [prev[0], true, prev[2], prev[3], prev[4]]), 2000),
      setTimeout(() => setPopups((prev) => [prev[0], prev[1], true, prev[3], prev[4]]), 3000),
      setTimeout(() => setPopups((prev) => [prev[0], prev[1], prev[2], true, prev[4]]), 4000),
      setTimeout(() => setPopups((prev) => [prev[0], prev[1], prev[2], prev[3], true]), 5000),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  // Styles object
  const styles = {
    container: {
      backgroundImage:"transparent",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    fogEffect: {
      opacity: Math.max(1 - scrollY / 300, 0),
      filter: `blur(${Math.max(10 - scrollY / 30, 0)}px)`,
    },
    roadSvg: {
      opacity: Math.min(scrollY / 200, 1),
      transition: "opacity 0.7s ease-in-out",
    },
    imageStyle: {
      transition: "opacity 0.7s ease-in-out",
      opacity: scrollY / 300,
      height: "auto",
      borderRadius: "12px",
      duration: "700",
    },
popupStyle: {
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(133, 36, 218, 0.44)",
      color: "white",
      padding: "12px",
      borderRadius: "12px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.31)",
      border: "1px solid rgba(255, 255, 255, 0)",
    },
  };

  return (
    <div className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden" style={styles.container}>
      {/* Background Image */}
      {/* Fog Effect */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-transparent to-transparent"
        style={styles.fogEffect}
      />

      {/* Curved Road */}
      <svg
        viewBox="0 0 100 100"
        className="absolute left-[120px] w-full h-full bg-none "
        preserveAspectRatio="none"
        style={styles.roadSvg}
      >
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="40%" y2="120%">
            <stop offset="0%" style={{ stopColor: "#ECEFF1", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#B0BEC5", stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="40%" y2="120%">
            <stop offset="0%" style={{ stopColor: "#CFD8DC", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#78909C", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Road Path with Border and Shadow */}
        <path
          d="M 50 -10 Q 10 30, 20 40 T 50 60 T 10 180 "
          stroke="url(#roadGradient)"  // Apply gradient
          strokeWidth="12"
          fill="none"
          className="drop-shadow-xl z-[1] overflow-hidden "
          strokeLinecap="round"
          filter="url(#dropShadow)"
          
        />

        {/* Road Inner Fill */}
        <path
          d="M 50 -10 Q 10 30, 20 40 T 50 60 T 10 180 "
          stroke="#333"
          strokeWidth="10"
          className=" z-[1]"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Inner Lane Markings */}
        <path
          d="M 50 -10 Q 10 30, 20 40 T 50 60 T 10 180 "
          stroke="white"
          strokeWidth="0.6"
          className=" z-[1]"
          strokeDasharray="5,8"
          fill="none"
        />
      </svg>

          

      {/* Images Placed Along the Road */}
      <img
        src="main/Building1.png"
        alt="Point 1"
        className="absolute left-[50%] top-[12%] w-17  md:w-14 "
        style={styles.imageStyle}
      />
      {popups[0] && (
        <div className="absolute left-[50%] top-[7%] backdrop-blur-lg bg-white/20 text-white p-3 rounded-xl shadow-lg border border-white/30"
        style={{ ...styles.popupStyle, opacity: scrollY > 200 ? 1 : 0 }}>
          Reject
        </div>
      )}

      <img
        src="main/Building2.png"
        alt="Point 2"
        className="absolute left-[10%] top-[25%] w-24 md:w-[120px] "
        style={styles.imageStyle}
      />
      {popups[1] && (
        <div className="absolute left-[10%] top-[28%] backdrop-blur-lg bg-white/20 text-white p-3 rounded-xl shadow-lg border border-white/30"
        style={{ ...styles.popupStyle, opacity: scrollY > 200 ? 1 : 0 }}>
          Reject
        </div>
      )}

      <img
        src="lightnavlogo.png"
        alt="Point 3"
        className="absolute left-[50%] top-[30%] w-24 md:w-[110px] "
        style={styles.imageStyle}
      />
      {popups[2] && (
        <div className="absolute left-[50%] top-[28%] backdrop-blur-lg bg-white/20 text-white p-3 rounded-xl shadow-lg border border-white/30"
        style={{ ...styles.popupStyle, opacity: scrollY > 200 ? 1 : 0 }}>
          Hello, I am Applicant Ace here to help
        </div>
      )}

      <img
        src="main/Building2.png"
        alt="Point 4"
        className="absolute left-[45%] top-[60%]  w-20 md:w-[110px] "
        style={styles.imageStyle}
      />
      {popups[3] && (
        <div className="absolute left-[40%] top-[65%] backdrop-blur-lg bg-white/20 text-white p-3 rounded-xl shadow-lg border border-white/30"
        style={{ ...styles.popupStyle, opacity: scrollY > 200 ? 1 : 0 }}>
          Selected for next round
        </div>
      )}

      <img
        src="main/Building1.png"
        alt="Point 5"
        className="absolute left-[70%] top-[90%]  w-20 md:w-[90px] "
        style={styles.imageStyle}
      />
      {popups[4] && (
        <div className="absolute left-[70%] top-[85%] backdrop-blur-lg bg-white/20 text-white p-3 rounded-xl shadow-lg border border-white/30"
        style={{ ...styles.popupStyle, opacity: scrollY > 200 ? 1 : 0 }}>
          Shortlisted
        </div>
      )}
    </div>
  );
};

export default WindingRoad;
