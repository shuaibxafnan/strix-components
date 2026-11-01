"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_CARDS = [
  {
    id: "pregnancy",
    type: "wave",
    category: "HEALTH",
    heading: "PREGNANCY",
    subheading: "DUE DATE CALCULATOR",
    body: "Calculate your expected delivery date with precision based on your last period or conception date.",
    link: "#",
    textColorClass: "text-black",
    isRightAligned: false,
    gradients: {
      bg: ["#FF6B6B", "#FF8E8E"],
      wave1: ["#FF7E7E", "#FFA0A0", "#FF7E7E"],
      wave2: ["#FFA0A0", "#FFBCBC", "#FFA0A0"],
      wave3: "#FFD4D4",
    },
  },
  {
    id: "baby-eye",
    type: "wave",
    category: "BIOLOGY",
    heading: "BABY EYE",
    subheading: "COLOR CALCULATOR",
    body: "Predict possible eye colors for your baby based on parental genetics and inheritance patterns.",
    link: "#",
    textColorClass: "text-black",
    isRightAligned: false,
    gradients: {
      bg: ["#4ECDC4", "#7EE8E1"],
      wave1: ["#5DDED5", "#8CEEEA", "#5DDED5"],
      wave2: ["#8CEEEA", "#BCF6F4", "#8CEEEA"],
      wave3: "#D6F9F7",
    },
  },
  {
    id: "percentage",
    type: "grid",
    category: "MATH",
    heading: "PERCENTAGE",
    subheading: "PRECISION CALCULATOR",
    body: "Calculate percentages for discounts, taxes, tips, and any percentage-based math with ease and accuracy.",
    link: "#",
    textColorClass: "text-black",
    isRightAligned: true,
  },
  {
    id: "boiled-egg",
    type: "grid",
    category: "FOOD",
    heading: "PERFECT EGG",
    subheading: "BOILED TO PERFECTION",
    body: "Get the exact cooking time for your perfect soft, medium, or hard-boiled eggs every single time.",
    link: "#",
    textColorClass: "text-black",
    isRightAligned: false,
  },
  {
    id: "sleep-cycle",
    type: "wave",
    category: "HEALTH",
    heading: "SLEEP CYCLE",
    subheading: "OPTIMIZE YOUR REST",
    body: "Optimize your sleep schedule by finding the perfect bedtimes and wake times for natural sleep cycles.",
    link: "#",
    textColorClass: "text-white",
    isRightAligned: false,
    gradients: {
      bg: ["#118AB2", "#5AC8E3"],
      wave1: ["#2B97BC", "#73D5EC", "#2B97BC"],
      wave2: ["#73D5EC", "#9DE4F4", "#73D5EC"],
      wave3: "#C0EDF7",
    },
  },
  {
    id: "age-calc",
    type: "wave",
    category: "TIME",
    heading: "AGE",
    subheading: "PRECISE TO THE SECOND",
    body: "Calculate your exact age in years, months, weeks, days, hours, minutes, and seconds with precision.",
    link: "#",
    textColorClass: "text-white",
    isRightAligned: false,
    gradients: {
      bg: ["#073B4C", "#3C7C8C"],
      wave1: ["#185064", "#4A8A9A", "#185064"],
      wave2: ["#4A8A9A", "#7AADBF", "#4A8A9A"],
      wave3: "#A0C5D1",
    },
  },
];

export default function DeconstructedCarousel({
  cardWidthMobile = 280,
  cardWidthDesktop = 300,
  cardHeightMobile = 380,
  cardHeightDesktop = 400,
  gap = 40,
  rotationFactor = 8,
  translationFactor = 10,
  cards = DEFAULT_CARDS,
  linkLabel = "OPEN CALCULATOR",
  backgroundColor = "#f1f1f1",
  textColor = "#080808",
  controlColor = "#080808",
  controlIconColor = "#fafafa",
  className = "",
}) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: cardWidthDesktop,
    height: cardHeightDesktop,
  });

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDimensions({ width: cardWidthMobile, height: cardHeightMobile });
      } else {
        setDimensions({ width: cardWidthDesktop, height: cardHeightDesktop });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cardWidthMobile, cardWidthDesktop, cardHeightMobile, cardHeightDesktop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) handleNext();
    if (touchEnd - touchStart > 50) handlePrev();
  };

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setHoveredIndex(index);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setMousePos({ x: 0.5, y: 0.5 });
  };

  if (!isMounted) {
    return (
      <div
        className={`min-h-screen w-full ${className}`}
        style={{ backgroundColor }}
      />
    );
  }

  const totalCardStepWidth = dimensions.width + gap;
  const currentTrackTranslation = -currentIndex * totalCardStepWidth;

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-center items-center overflow-x-hidden antialiased selection:bg-[#ff2d55] selection:text-white font-sans relative ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[1400px] py-[5vh] px-4 md:px-12"
      >
        <div
          ref={trackRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] py-10"
          style={{
            transform: `translateX(${currentTrackTranslation}px)`,
            gap: `${gap}px`,
          }}
        >
          {cards.map((card, idx) => {
            const isThisHovered = hoveredIndex === idx;

            const calculateLayerTransform = (layerIndex) => {
              if (!isThisHovered) return "translate3d(0px, 0px, 0px)";

              const depth = 15 * layerIndex;
              const offsetX =
                (mousePos.x - 0.5) * translationFactor * (layerIndex + 1);
              const offsetY =
                (mousePos.y - 0.5) * translationFactor * (layerIndex + 1);
              return `translate3d(${offsetX}px, ${offsetY}px, ${depth}px)`;
            };

            const calculateBaseCardTransform = () => {
              if (!isThisHovered)
                return "perspective(1200px) rotateX(0deg) rotateY(0deg)";
              const xDeg = (mousePos.y - 0.5) * rotationFactor;
              const yDeg = (mousePos.x - 0.5) * -rotationFactor;
              return `perspective(1200px) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
            };

            const calculateWaveTransform = () => {
              if (!isThisHovered) return "translate(0px, 0px) scale(1)";
              const moveX = (mousePos.x - 0.5) * -20;
              const moveY = (mousePos.y - 0.5) * -20;
              return `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            };

            const calculateInnerWaveTransform = (waveIndex) => {
              if (!isThisHovered) return "translate(0px, 0px)";
              const moveX = (mousePos.x - 0.5) * -20;
              const moveY = (mousePos.y - 0.5) * -20;
              const factor = 1 + waveIndex * 0.5;
              return `translate(${moveX * factor * 0.5}px, ${moveY * factor * 0.3}px)`;
            };

            const calculateGridObjectTransform = (objType) => {
              if (!isThisHovered) {
                if (objType === "square")
                  return "rotate(45deg) translateY(-20px)";
                if (objType === "triangle")
                  return "translate(-50%, -50%) scale(0.5)";
                return "translateY(20px)";
              }
              const moveX = (mousePos.x - 0.5) * 15;
              const moveY = (mousePos.y - 0.5) * 12;
              if (objType === "square")
                return `rotate(45deg) translate(${moveX}px, ${moveY}px)`;
              if (objType === "triangle")
                return `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1)`;
              return `translate(${moveX}px, ${moveY}px)`;
            };

            return (
              <article
                key={card.id}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={handleMouseLeave}
                style={{
                  width: `${dimensions.width}px`,
                  height: `${dimensions.height}px`,
                  transform: calculateBaseCardTransform(),
                }}
                className="group relative cursor-pointer flex-shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d]"
              >
                                <div
                  style={{ transform: calculateLayerTransform(0) }}
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-[1] overflow-hidden"
                >
                  {card.type === "wave" ? (
                    <svg
                      style={{ transform: calculateWaveTransform() }}
                      className="w-full h-full block transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      viewBox="0 0 300 400"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id={`bgGrad-${card.id}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor={card.gradients.bg[0]} />
                          <stop
                            offset="100%"
                            stopColor={card.gradients.bg[1]}
                          />
                        </linearGradient>
                        <linearGradient
                          id={`waveGrad1-${card.id}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            stopColor={card.gradients.wave1[0]}
                          />
                          <stop
                            offset="50%"
                            stopColor={card.gradients.wave1[1]}
                          />
                          <stop
                            offset="100%"
                            stopColor={card.gradients.wave1[2]}
                          />
                        </linearGradient>
                        <linearGradient
                          id={`waveGrad2-${card.id}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            stopColor={card.gradients.wave2[0]}
                          />
                          <stop
                            offset="50%"
                            stopColor={card.gradients.wave2[1]}
                          />
                          <stop
                            offset="100%"
                            stopColor={card.gradients.wave2[2]}
                          />
                        </linearGradient>
                      </defs>
                      <rect
                        width="100%"
                        height="100%"
                        fill={`url(#bgGrad-${card.id})`}
                      />
                      <path
                        style={{ transform: calculateInnerWaveTransform(1) }}
                        d="M0,230 C30,220 60,240 90,230 C120,220 150,240 180,230 C210,220 240,240 270,230 C290,225 295,230 300,225 L300,400 L0,400 Z"
                        fill={`url(#waveGrad1-${card.id})`}
                        opacity="0.8"
                      />
                      <path
                        style={{ transform: calculateInnerWaveTransform(2) }}
                        d="M0,260 C40,250 80,270 120,260 C160,250 200,270 240,260 C280,250 290,260 300,255 L300,400 L0,400 Z"
                        fill={`url(#waveGrad2-${card.id})`}
                        opacity="0.9"
                      />
                      <path
                        d="M0,290 C50,280 100,300 150,290 C200,280 250,300 300,290 L300,400 L0,400 Z"
                        fill={card.gradients.wave3}
                        opacity="0.9"
                      />
                    </svg>
                  ) : (
                    <div className="absolute inset-0 bg-[#fafafa] z-0">
                                            <div className="absolute inset-0 w-full h-full">
                        <div
                          style={{ top: "25%" }}
                          className="absolute left-0 w-full h-[1px] bg-black/10 scale-x-[0.3] group-hover:scale-x-100 origin-left transition-transform duration-700 group-hover:delay-100"
                        />
                        <div
                          style={{ top: "50%" }}
                          className="absolute left-0 w-full h-[1px] bg-black/10 scale-x-[0.3] group-hover:scale-x-100 origin-left transition-transform duration-700 group-hover:delay-200"
                        />
                        <div
                          style={{ top: "75%" }}
                          className="absolute left-0 w-full h-[1px] bg-black/10 scale-x-[0.3] group-hover:scale-x-100 origin-left transition-transform duration-700 group-hover:delay-300"
                        />
                        <div
                          style={{ left: "33.33%" }}
                          className="absolute top-0 h-full w-[1px] bg-black/10 scale-y-[0.3] group-hover:scale-y-100 origin-top transition-transform duration-700 group-hover:delay-[150ms]"
                        />
                        <div
                          style={{ left: "66.66%" }}
                          className="absolute top-0 h-full w-[1px] bg-black/10 scale-y-[0.3] group-hover:scale-y-100 origin-top transition-transform duration-700 group-hover:delay-[250ms]"
                        />
                      </div>

                                            <div className="absolute inset-0 pointer-events-none">
                        <div
                          style={{
                            transform: calculateGridObjectTransform("circle"),
                          }}
                          className="absolute w-[100px] h-[100px] rounded-full border border-black/10 bottom-10 -left-[30px] opacity-30 group-hover:opacity-100 transition-all duration-700"
                        />
                        <div
                          style={{
                            transform: calculateGridObjectTransform("square"),
                          }}
                          className="absolute w-15 h-15 border border-black/10 top-10 right-[30px] opacity-30 group-hover:opacity-100 transition-all duration-700"
                        />
                        <div
                          style={{
                            transform: calculateGridObjectTransform("triangle"),
                          }}
                          className="absolute w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-bottom-[70px] border-bottom-black/[0.05] top-1/2 left-1/2 opacity-30 group-hover:opacity-100 transition-all duration-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                                <div
                  style={{ transform: calculateLayerTransform(2) }}
                  className={`absolute inset-0 p-5 md:p-[30px] flex flex-col justify-between h-full z-[3] ${card.textColorClass}`}
                >
                                    <div
                    className={`flex items-center gap-2.5 mb-8 ${card.isRightAligned ? "self-end text-right" : ""}`}
                  >
                    {!card.isRightAligned && (
                      <div className="w-10 h-[1px] bg-current scale-x-[0.5] group-hover:scale-x-100 origin-left transition-transform duration-300 group-hover:delay-50" />
                    )}
                    <span className="font-mono text-[12px] tracking-wider opacity-60 translate-x-[-5px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 group-hover:delay-[150ms]">
                      {card.category}
                    </span>
                    {card.isRightAligned && (
                      <div className="w-10 h-[1px] bg-current scale-x-[0.5] group-hover:scale-x-100 origin-right transition-transform duration-300 group-hover:delay-50" />
                    )}
                  </div>

                                    <div
                    className={`mt-auto mb-6 ${card.isRightAligned ? "text-right" : ""}`}
                  >
                    <h2 className="text-[2rem] font-black leading-none tracking-tight opacity-70 translate-y-2.5 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 group-hover:delay-50">
                      {card.heading}
                    </h2>
                    <h3 className="text-[14px] font-medium tracking-wider mt-4 opacity-50 translate-y-2.5 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 group-hover:delay-50">
                      {card.subheading}
                    </h3>
                  </div>

                                    <div
                    className={`max-w-[85%] my-6 ${card.isRightAligned ? "self-end text-right" : ""}`}
                  >
                    <p className="text-[14px] font-normal leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity duration-300 group-hover:delay-100">
                      {card.body}
                    </p>
                  </div>

                                    <div
                    className={`mt-auto overflow-visible ${card.isRightAligned ? "self-end text-right" : ""}`}
                  >
                    <a
                      href={card.link}
                      target={card.link.startsWith("#") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="inline-flex items-center py-2 relative group/link text-decoration-none"
                    >
                      <div
                        className={`absolute top-0 bottom-0 -left-2.5 w-[calc(100%+20px)] h-full bg-current scale-x-0 transition-transform duration-300 group-hover/link:scale-x-100`}
                        style={{
                          transformOrigin: card.isRightAligned
                            ? "right"
                            : "left",
                        }}
                      />
                                            <span
                        className={`relative font-mono text-[12px] font-bold tracking-widest opacity-70 translate-x-[-5px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 group-hover:delay-200 ${
                          card.textColorClass === "text-white"
                            ? "group-hover/link:text-black"
                            : "group-hover/link:text-white"
                        }`}
                      >
                        {linkLabel}
                      </span>
                    </a>
                  </div>
                </div>

                                <div
                  style={{ transform: calculateLayerTransform(1) }}
                  className="absolute inset-0 pointer-events-none z-[2]"
                >
                  <svg
                    className="w-full h-full block"
                    viewBox="0 0 300 400"
                    preserveAspectRatio="none"
                  >
                    <path
                      className="fill-none stroke-black/80 stroke-[1px] transition-[stroke-dashoffset] duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{
                        strokeDasharray: 1520,
                        strokeDashoffset: isThisHovered ? 0 : 1520,
                      }}
                      d="M 20,20 H 280 V 380 H 20 Z"
                    />
                  </svg>
                </div>
              </article>
            );
          })}
        </div>
      </div>

            <div className="flex justify-center gap-5 mt-8 z-10">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="disabled:opacity-40 border-none w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          aria-label="Previous slide"
          style={{ backgroundColor: controlColor, color: controlIconColor }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="disabled:opacity-40 border-none w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          aria-label="Next slide"
          style={{ backgroundColor: controlColor, color: controlIconColor }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

            <div className="flex justify-center gap-2 mt-5 z-10">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full border-none p-0 transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? "scale-[1.3] opacity-100"
                : "opacity-30"
            }`}
            style={{ backgroundColor: controlColor }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
