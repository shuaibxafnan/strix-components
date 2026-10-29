"use client";

import { useEffect, useRef, useState } from "react";


const DEFAULT_MOVIES = [
  {
    id: "wall-e",
    title: "WALL-E",
    year: "2010",
    genres: ["Animation", "Family", "Sci-Fi"],
    image:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "dunkirk",
    title: "Dunkirk",
    year: "2017",
    genres: ["Action", "Drama", "History"],
    image:
      "https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "coraline",
    title: "Coraline",
    year: "2010",
    genres: ["Animation", "Family", "Fantasy"],
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "deadpool",
    title: "Deadpool",
    year: "2016",
    genres: ["Action", "Adventure", "Comedy"],
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "pans-labyrinth",
    title: "Pan's Labyrinth",
    year: "2006",
    genres: ["Fantasy", "Drama", "War"],
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1280&q=80",
  },
];


export default function StackedCarousel({
  initialCards = DEFAULT_MOVIES,
  bodyBgColor = "#0a0a0c",
  cardWidth = "315px",
  cardHeight = "560px",
}) {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () =>
          reject(new Error(`Failed resource acquisition: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
    ])
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger || !containerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const wrappers = gsap.utils.toArray(
          containerRef.current.querySelectorAll(".js-animate-wrapper"),
        );
        const totalCards = wrappers.length;

        wrappers.forEach((wrapper, index) => {
          const distanceToScrollRemaining =
            (totalCards - 1 - index) * window.innerHeight;

          ScrollTrigger.create({
            trigger: wrapper,
            start: "top top",
            end: () => `+=${distanceToScrollRemaining + 400}`,
            pin: wrapper.querySelector(".js-pin-content"),
            pinSpacing: false,
            ease: "none",
            invalidateOnRefresh: true,
          });
        });

        ScrollTrigger.refresh();
      })
      .catch((err) =>
        console.error("[ModernStackedCarousel] Engine deployment failed:", err),
      );

    return () => {
      const { ScrollTrigger } = window;
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, [isMounted, initialCards]);

  if (!isMounted) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: bodyBgColor }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col justify-start items-center m-0 p-0 antialiased selection:bg-white/10 selection:text-white font-sans text-neutral-200 relative"
      style={{ backgroundColor: bodyBgColor }}
    >
      {/* Background ambient lighting blur ring */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Structural Scrolling Layout Matrix */}
      <div className="relative w-full flex flex-col items-center z-10">
        {initialCards.map((card, index) => {
          // Direct styling classes to apply alternating opposing rotation configurations
          let rotationClass = "rotate-0";
          if ((index + 1) % 3 === 0) {
            rotationClass = "-rotate-3 group-hover:rotate-0";
          } else if ((index + 1) % 2 === 0) {
            rotationClass = "rotate-2 group-hover:rotate-0";
          } else {
            rotationClass = "-rotate-2 group-hover:rotate-0";
          }

          return (
            <div
              key={card.id || index}
              className="js-animate-wrapper w-full h-screen flex flex-col items-center justify-start relative"
            >
              {/* Target Element Content Node to be Pinned */}
              <div
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  // Stacks cards nicely over each other with a subtle vertical stair offset
                  top: `${60 + index * 4}px`,
                  zIndex: index + 1,
                }}
                className="js-pin-content flex items-center justify-center will-change-transform"
              >
                <div
                  className={`relative w-full h-full rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)] group overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] ${rotationClass}`}
                  style={{
                    transformOrigin: "center center",
                  }}
                >
                  {/* Media Graphic Frame Component */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                    />
                    {/* Shadow masking exposure treatment */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/30 to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>

                  {/* Contextual Typography Block */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-white flex items-baseline gap-2 mb-1 drop-shadow-md">
                        {card.title}
                        <span className="text-xs font-mono font-medium text-neutral-400 tracking-wider">
                          {card.year}
                        </span>
                      </h1>
                    </div>

                    {/* Metadata Badges Container */}
                    <div className="flex flex-wrap gap-1.5 mt-3 opacity-85 group-hover:opacity-100 transition-opacity duration-500">
                      {card.genres.map((genre, gIdx) => (
                        <span
                          key={gIdx}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md backdrop-blur-sm text-[10px] font-bold tracking-widest text-neutral-300 uppercase transition-colors duration-200"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Outer Premium High-End Accent Border Stroke Ring */}
                  <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none z-30 group-hover:border-white/20 transition-colors duration-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Viewport tracking margin offset box */}
      <div
        className="w-full h-[30vh] pointer-events-none block z-0"
        aria-hidden="true"
      />
    </div>
  );
}
