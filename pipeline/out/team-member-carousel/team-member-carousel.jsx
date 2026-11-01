"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_MEMBERS = [
  {
    name: "Emily Kim",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=3687&auto=format&fit=crop",
  },
  {
    name: "Michael Steward",
    role: "Creative Director",
    img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=3870&auto=format&fit=crop",
  },
  {
    name: "Emma Rodriguez",
    role: "Lead Architect",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=60",
  },
  {
    name: "Julia Gimmel",
    role: "UX Experience Lead",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60",
  },
  {
    name: "Lisa Anderson",
    role: "Growth Strategy",
    img: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=900&auto=format&fit=crop&q=60",
  },
  {
    name: "James Wilson",
    role: "Head of Product",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=3687&auto=format&fit=crop",
  },
];

export default function TeamMemberCarousel({
  accentColor = "#6366f1",
  bgPrimary = "#030712",
  cardWidth = "300px",
  cardHeight = "350px",
  cardMobileWidth = "230px",
  cardMobileHeight = "270px",
  items = DEFAULT_MEMBERS,
  eyebrow = "Core Team",
  headingLead = "Meet the",
  headingEmphasis = "Visionaries",
  className = "",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [infoOpacity, setInfoOpacity] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [displayRole, setDisplayRole] = useState("");
  const [touchStartX, setTouchStartX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const timers = useRef([]);
  const totalItems = items.length;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (items.length > 0) {
      setDisplayName(items[0].name);
      setDisplayRole(items[0].role);
    }

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [items]);

  const updateCarousel = (newIndex) => {
    if (isAnimating || totalItems === 0) return;
    setIsAnimating(true);

    const targetIndex = (newIndex + totalItems) % totalItems;
    setCurrentIndex(targetIndex);
    setInfoOpacity(0);

    timers.current.push(setTimeout(() => {
      setDisplayName(items[targetIndex].name);
      setDisplayRole(items[targetIndex].role);
      setInfoOpacity(1);
    }, 200));

    timers.current.push(setTimeout(() => {
      setIsAnimating(false);
    }, 700));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") updateCarousel(currentIndex - 1);
      if (e.key === "ArrowRight") updateCarousel(currentIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isAnimating]);

  const handleTouchStart = (e) => setTouchStartX(e.changedTouches[0].screenX);
  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      updateCarousel(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between py-12 overflow-hidden relative select-none font-sans ${className}`}
      style={{ backgroundColor: bgPrimary }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] rounded-full blur-[160px] opacity-[0.12] pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />

      <div className="w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between z-10 mt-4">
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <p className="text-xs uppercase tracking-[0.3em] font-medium opacity-40 mb-1" style={{ color: accentColor }}>
            {eyebrow}
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white/90">
            {headingLead} <span className="font-medium text-white">{headingEmphasis}</span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-1.5 rounded-full">
          <button
            onClick={() => updateCarousel(currentIndex - 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] active:scale-95 transition-all duration-200 text-lg"
          >
            ‹
          </button>
          <div className="text-xs font-mono text-white/40 px-2 select-none">
            {String(currentIndex + 1).padStart(2, "0")} <span className="opacity-30">/</span> {String(totalItems).padStart(2, "0")}
          </div>
          <button
            onClick={() => updateCarousel(currentIndex + 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] active:scale-95 transition-all duration-200 text-lg"
          >
            ›
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1400px] relative [perspective:1400px] flex items-center justify-center my-auto">
        <div className="w-full h-full flex justify-center items-center relative [transform-style:preserve-3d]">
          {items.map((member, i) => {
            const offset = (i - currentIndex + totalItems) % totalItems;

            let transformStyles = "";
            let zIndex = "z-0";
            let opacity = "opacity-0 pointer-events-none scale-50";
            let filterStyles = "brightness-[0.15] blur-[4px]";
            let borderStyle = "border-white/[0.03]";


            if (offset === 0) {
              zIndex = "z-20";
              opacity = "opacity-100";
              filterStyles = "brightness-[0.95] blur-none";
              transformStyles = "scale(1.0) translateZ(60px) translateX(0px) rotateY(0deg)";
              borderStyle = "border-white/[0.15] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9)]";
            } else if (offset === 1) {
              zIndex = "z-10";
              opacity = "opacity-50";
              transformStyles = isMobile
                ? "translateX(120px) scale(0.8) translateZ(-100px) rotateY(-15deg)"
                : "translateX(260px) scale(0.83) translateZ(-150px) rotateY(-20deg)";
            } else if (offset === 2) {
              zIndex = "z-[5]";
              opacity = "opacity-10";
              transformStyles = isMobile
                ? "translateX(210px) scale(0.65) translateZ(-220px) rotateY(-25deg)"
                : "translateX(490px) scale(0.68) translateZ(-300px) rotateY(-35deg)";
            } else if (offset === totalItems - 1) {
              zIndex = "z-10";
              opacity = "opacity-50";
              transformStyles = isMobile
                ? "translateX(-120px) scale(0.8) translateZ(-100px) rotateY(15deg)"
                : "translateX(-260px) scale(0.83) translateZ(-150px) rotateY(20deg)";
            } else if (offset === totalItems - 2) {
              zIndex = "z-[5]";
              opacity = "opacity-10";
              transformStyles = isMobile
                ? "translateX(-210px) scale(0.65) translateZ(-220px) rotateY(25deg)"
                : "translateX(-490px) scale(0.68) translateZ(-300px) rotateY(35deg)";
            }

            return (
              <div
                key={i}
                onClick={() => updateCarousel(i)}
                className={`absolute rounded-[24px] overflow-hidden p-[1px] border transition-all duration-[750ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer ${zIndex} ${opacity} ${borderStyle}`}
                style={{
                  width: isMobile ? cardMobileWidth : cardWidth,
                  height: isMobile ? cardMobileHeight : cardHeight,
                  transform: transformStyles,
                  backgroundColor: "rgba(255, 255, 255, 0.01)",
                }}
              >
                <div className="w-full h-full relative rounded-[23px] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/0 z-10 opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <img
                    src={member.img}
                    alt={member.name}
                    className={`w-full h-full object-cover transition-all duration-[750ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] ${filterStyles}`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full flex flex-col items-center mt-4 px-6 z-10">
        <div
          className="text-center transition-all duration-[450ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] mb-8"
          style={{
            opacity: infoOpacity,
            transform: `translateY(${infoOpacity === 1 ? "0px" : "8px"})`,
          }}
        >
          <h3 className="text-4xl font-light tracking-tight text-white font-sans">
            {displayName}
          </h3>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mt-1.5 font-medium">
            {displayRole}
          </p>
        </div>

        <div className="flex justify-center items-center gap-1 bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-full backdrop-blur-sm">
          {items.map((_, i) => {
            const isActive = i === currentIndex;
            return (
              <div
                key={i}
                onClick={() => updateCarousel(i)}
                className="h-1 rounded-full cursor-pointer transition-all duration-500 ease-out"
                style={{
                  width: isActive ? "32px" : "6px",
                  backgroundColor: isActive ? accentColor : "rgba(255, 255, 255, 0.08)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}