"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PREMIUM_SLIDES = [
  {
    id: 1,
    number: "01",
    subtitle: "ARCHITECTURAL CONCEPTS",
    title: "Cosmic Dreams",
    description: "A profound journey through infinite minimalist expanses, where raw reality bends beautifully to accommodate structural imagination.",
    bgImg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
    thumbImg: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    number: "02",
    subtitle: "METROPOLITAN SYMPHONIES",
    title: "Urban Pulse",
    description: "Capturing the calculated rhythm of modern structures where minimalist light signatures pierce through monolithic shadows.",
    bgImg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
    thumbImg: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    number: "03",
    subtitle: "ABYSSAL PERSPECTIVES",
    title: "Ocean Depths",
    description: "Dive deeply into mysterious, uncharted waters where ancient oceanic patterns whisper through silent corridors of time.",
    bgImg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    thumbImg: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    number: "04",
    subtitle: "MINIMALIST LANDSCAPES",
    title: "Desert Mirage",
    description: "Witness the quiet, cinematic dance of light and sand, where raw mirages expose crisp truths within a vast golden horizon.",
    bgImg: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80",
    thumbImg: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    number: "05",
    subtitle: "ORGANIC MATRICES",
    title: "Forest Magic",
    description: "Step inside pristine, untamed woods where natural geometries interweave to anchor ancient primordial ecosystems.",
    bgImg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
    thumbImg: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80"
  }
];

export default function SlantedCarousel({
  slidesData = PREMIUM_SLIDES,
  autoPlay = true,
  intervalDuration = 5500,
  accentColor = "#D4AF37",
  enableParallax = true,
  backgroundColor = "#0A0A0B",
  className = ""
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  const totalSlides = slidesData.length;
  const autoPlayTimerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const animTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(animTimerRef.current), []);
  useEffect(() => {
    if (!document.querySelector('link[href*="playfair-display"]')) {
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap";
      document.head.appendChild(linkEl);
    }
  }, []);

  const handleTransition = useCallback((targetIndex) => {
    if (isAnimating || targetIndex === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(targetIndex);

    clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 1400);
  }, [isAnimating, currentSlide]);

  const handleNext = useCallback(() => {
    handleTransition((currentSlide + 1) % totalSlides);
  }, [currentSlide, totalSlides, handleTransition]);

  const handlePrev = useCallback(() => {
    handleTransition((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, totalSlides, handleTransition]);
  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      setParallaxOffset({ x: normX * 20, y: normY * 12 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableParallax]);
  useEffect(() => {
    if (autoPlay) {
      autoPlayTimerRef.current = setInterval(handleNext, intervalDuration);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [autoPlay, handleNext, intervalDuration]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);
  const handleTouchStart = (e) => { touchStartXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) diff > 0 ? handleNext() : handlePrev();
  };

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] ${className}`}
      style={{ backgroundColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {slidesData.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute top-0 left-0 w-full h-full transition-all duration-[1400ms] cubic-bezier(0.16,1,0.3,1) ${
                isActive 
                  ? "opacity-100 visible scale-100 z-10" 
                  : "opacity-0 invisible scale-[1.03] z-0"
              }`}
            >
              <div 
                className={`absolute inset-[-4%] bg-cover bg-center transition-transform duration-[1800ms] ease-out ${
                  isActive ? "skew-x-[-4deg] opacity-100 scale-100" : "skew-x-[-6deg] opacity-90 scale-105"
                }`}
                style={{ 
                  backgroundImage: `url('${slide.bgImg}')`,
                  transform: isActive && enableParallax 
                    ? `skewX(-4deg) translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)` 
                    : "skewX(-4deg)"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0E11]/95 via-[#0D0E11]/60 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-black/20" />
              <div className="absolute top-1/2 left-[8%] md:left-[12%] transform -translate-y-1/2 text-[#FBFBFD] z-30 max-w-[620px]">
                <div className={`text-[11px] font-semibold tracking-[0.3em] text-white/40 uppercase mb-5 transition-all duration-[1000ms] delay-200 ${
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}>
                  {slide.subtitle}
                </div>
                <h1 className={`text-4xl sm:text-7xl font-light font-['Playfair_Display',serif] tracking-wide mb-6 leading-[1.15] transition-all duration-[1200ms] delay-300 ${
                  isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                }`}>
                  {slide.title}
                </h1>
                <p className={`text-sm sm:text-base font-light leading-relaxed text-white/70 tracking-wide transition-all duration-[1200ms] delay-450 ${
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}>
                  {slide.description}
                </p>
              </div>
              <div className={`hidden lg:block absolute top-1/2 right-[12%] w-[340px] h-[440px] transform -translate-y-1/2 rounded-sm overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/10 z-20 transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive 
                  ? "skew-x-[-4deg] translate-x-0 opacity-100 scale-100" 
                  : "skew-x-[-8deg] translate-x-16 opacity-0 scale-95"
              }`}>
                <div className="absolute inset-0 bg-black/10 z-10 transition-opacity duration-700 hover:opacity-0" />
                <img 
                  src={slide.thumbImg} 
                  alt={slide.alt || ""} 
                  className="w-full h-full object-cover grayscale-[30%] contrast-[110%] transition-transform duration-[3000ms] hover:scale-105" 
                  loading="lazy" 
                />
              </div>
              <div className={`absolute bottom-20 right-[12%] text-[9rem] font-['Playfair_Display',serif] italic font-semibold text-white/[0.03] select-none pointer-events-none transition-all duration-[1500ms] ${
                isActive ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
              }`}>
                {slide.number}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-12 right-[8%] md:right-[12%] flex gap-3 z-50">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full border border-white/10 bg-[#0D0E11]/40 backdrop-blur-md cursor-pointer flex items-center justify-center transition-all duration-300 text-white/60 hover:text-[#FBFBFD] hover:border-white/30 hover:bg-[#0D0E11]/80 active:scale-95"
          aria-label="Previous frame"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full border border-white/10 bg-[#0D0E11]/40 backdrop-blur-md cursor-pointer flex items-center justify-center transition-all duration-300 text-white/60 hover:text-[#FBFBFD] hover:border-white/30 hover:bg-[#0D0E11]/80 active:scale-95"
          aria-label="Next frame"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-[70px] left-[8%] md:left-[12%] flex items-center gap-4 sm:gap-6 z-50">
        {slidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTransition(index)}
            className="group relative py-2 cursor-pointer outline-none"
            aria-label={`Maps to layout ${index + 1}`}
          >
            <div 
              className="h-[2px] transition-all duration-[600ms] cubic-bezier(0.16,1,0.3,1)" 
              style={{
                width: index === currentSlide ? "48px" : "16px",
                backgroundColor: index === currentSlide ? accentColor : "rgba(255,255,255,0.2)"
              }}
            />
            <span className="absolute -top-4 left-0 text-[9px] font-medium tracking-widest text-white/0 group-hover:text-white/40 transition-colors duration-300">
              0{index + 1}
            </span>
          </button>
        ))}
      </div>
      {autoPlay && (
        <div 
          key={currentSlide} 
          className="absolute bottom-0 left-0 h-[2px] w-full z-50 origin-left"
          style={{ 
            backgroundColor: accentColor,
            animation: `linearTimerRun ${intervalDuration}ms linear forwards`
          }}
        />
      )}
      <style>{`
        @keyframes linearTimerRun {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}