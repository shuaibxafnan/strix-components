"use client";

import { useEffect, useRef, useState } from "react";

// ─── Modern3DCarousel ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// cardsData        array    Objects containing text content and background images
// perspective      number   350        CSS 3D perspective depth in pixels
// cardMaxWidth     number   420        Maximum card horizontal expansion (px)
// cardMaxHeight    number   580        Maximum card vertical expansion (px)
// scrollHeight     string   "800vh"    Total scrollable height of the wrapper
// arrowColor       string   "#FFFFFF"  Stroke fill for the guide anchor arrow
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_CARDS = [
  { title: "Sleek Design", category: "Concept", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  { title: "Pure Power", category: "Performance", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
  { title: "Vibrant Hue", category: "Branding", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80" },
  { title: "Crisp Layout", category: "Minimal", img: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80" },
  { title: "Bold Motion", category: "UX/UI", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" },
  { title: "Deep Depth", category: "Creative", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" },
  { title: "Grand Finish", category: "Modern", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80" },
];

export default function Cards3DCarousel({
  cardsData = DEFAULT_CARDS,
  perspective = 350,
  cardMaxWidth = 420,
  cardMaxHeight = 580,
  scrollHeight = "800vh",
  arrowColor = "#FFFFFF",
}) {
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const arrowPathRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"),
    ])
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger || !containerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        // Main GSAP Timeline mapping 3D fan-out and fall effects
        const tl = gsap.timeline({ defaults: { duration: 2 } })
          .set(".carousel-card", {
            transformOrigin: "50% 1200px -150px",
            x: "-50%",
            y: "-50%",
            z: -600,
            rotateX: 3,
          })
          .to(".carousel-card", {
            z: 20,
            rotateX: -4,
            stagger: -1,
          }, 0)
          .to(".carousel-card", {
            yPercent: 110,
            stagger: -1,
            ease: "back.in(1.7)",
          }, 0)
          .to(".carousel-card", {
            duration: 1,
            stagger: -1,
            ease: "power3.in",
          }, 0)
          .to(".carousel-card", {
            duration: 0.1,
            autoAlpha: 0,
            stagger: -1,
          }, 1.9)
          .pause(1);

        // Entrance timeline initialization
        gsap.timeline()
          .to(carouselRef.current, { duration: 0.8, opacity: 1, ease: "power2.inOut" })
          .fromTo(tl, { progress: 1 }, {
            duration: 1.6,
            progress: 0.05,
            ease: "expo.out",
            onComplete: () => {
              // ScrollTrigger pairing loop
              gsap.to(tl, {
                progress: 1,
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top top",
                  end: "100% 100%",
                  scrub: true,
                  pin: carouselRef.current,
                },
              });

              // Looping arrow stroke indicators
              gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
                .to(arrowPathRef.current, { attr: { d: "M0,0 0,10" }, ease: "power3.inOut" })
                .to(arrowPathRef.current, { attr: { d: "M0,10 0,10" }, ease: "power3.inOut" });

              // Dynamic fade on trigger layout entries
              gsap.to(".carousel-scroll-arrow", {
                opacity: 0,
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top top",
                  end: "12px top",
                  scrub: 1,
                },
              });
            },
          }, 0);
      })
      .catch((err) => console.error("[Modern3DCarousel] Setup execution failed:", err));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <main
      ref={containerRef}
      className="w-full select-none bg-[#0a0a0a] relative overflow-x-hidden overflow-y-visible hide-scrollbar-axis"
      style={{ height: scrollHeight }}
    >
      {/* Dynamic injection to suppress nested sub-container tracks */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar-axis::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .hide-scrollbar-axis { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}}/>

      {/* 3D Core Viewport */}
      <div
        ref={carouselRef}
        className="w-full h-screen overflow-hidden opacity-0 sticky top-0"
        style={{ perspective: `${perspective}px` }}
      >
        {cardsData.map((card, index) => (
          <div
            key={index}
            className="carousel-card absolute left-1/2 top-1/2 w-[65%] h-[75%] flex flex-col justify-end p-8 text-white rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] group border border-white/10 grayscale contrast-125 brightness-90 hover:grayscale-0 transition-[filter] duration-500"
            style={{
              maxWidth: `${cardMaxWidth}px`,
              maxHeight: `${cardMaxHeight}px`,
            }}
          >
            {/* Background Layer with Integrated Black Vignette/Gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%), url(${card.img})`,
              }}
            />

            {/* Context Contents details metadata view */}
            <div className="relative z-10 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-white/60 mb-2 block">
                {card.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white font-sans leading-none">
                {card.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Minimal Scroll Cue */}
      <svg
        className="carousel-scroll-arrow fixed bottom-[6vh] left-1/2 h-[7vh] -translate-x-1/2 pointer-events-none z-50 mix-blend-difference"
        viewBox="0 0 2 10"
      >
        <path
          ref={arrowPathRef}
          stroke={arrowColor}
          d="M0,0 0,0"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
      </svg>
    </main>
  );
}