"use client";

import { useEffect, useRef } from "react";


const CURATED_ITEMS = [
  {
    tag: "01 // RETROGRADE",
    title: "Highway Vinyl Nights",
    description:
      "The headlights hum along the painted lines.\nWe twist the dial till static turns to choir.\nYour hand keeps time on the wheel and the night leans in.\nEvery mile is a chorus we have not written yet.",
    img: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
    direction: "left",
  },
  {
    tag: "02 // MIDNIGHT",
    title: "Last Diner on Route 9",
    description:
      "The coffee tastes like rainwater and luck.\nNeon flickers slow while the jukebox spins a waltz.\nWe carve our names in steam on the window glass.\nStay till sunrise and the road will wait its turn.",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    direction: "right",
  },
  {
    tag: "03 // ECLIPSE",
    title: "Stardust Ballroom",
    description:
      "Mirror tiles catch every hopeful face.\nRecords spin thin silver threads through the dark.\nWe move like planets pulled by quiet drums.\nHold the beat and the night will never close.",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    direction: "left",
  },
  {
    tag: "04 // HORIZON",
    title: "Sky Without Borders",
    description:
      "Lay your worries down beneath the porchlight glow.\nThe crickets stitch soft rhythm in the grass.\nWe trade small dreams and make them loud together.\nA sky without borders is waiting past the trees.",
    img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
    direction: "right",
  },
];


export default function ScrollRevealList({
  items = CURATED_ITEMS,
  heroTitle = "Cinematic Motion",
  heroSubtitle = "An editorial exploration of scroll-driven interface depth.",
  animDuration = 1.3,
  animEase = "power3.out",
  offsetDistance = 70,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
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
        el.onerror = () => reject(new Error(`Script pipeline error: ${src}`));
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

        // 1. Setup Image Animations (Distinct Left / Right slide entries)
        const imageContainers =
          containerRef.current.querySelectorAll(".js-reveal-img");
        imageContainers.forEach((imgContainer) => {
          const isSlideLeft = imgContainer.classList.contains("js-slide-left");
          const startX = isSlideLeft ? -offsetDistance : offsetDistance;

          gsap.set(imgContainer, { autoAlpha: 0 });

          ScrollTrigger.create({
            trigger: imgContainer,
            start: "top 88%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              gsap.fromTo(
                imgContainer,
                { x: startX, y: 0, autoAlpha: 0 },
                {
                  duration: animDuration,
                  x: 0,
                  y: 0,
                  autoAlpha: 1,
                  ease: animEase,
                  overwrite: "auto",
                },
              );
            },
            onLeaveBack: () => {
              gsap.to(imgContainer, {
                duration: 0.5,
                x: startX,
                y: 0,
                autoAlpha: 0,
                ease: "power2.in",
                overwrite: "auto",
              });
            },
          });
        });

        // 2. Setup Text Block Group Animations (All reveal vertically upward in unison)
        const textBlocks =
          containerRef.current.querySelectorAll(".js-text-block");
        textBlocks.forEach((block) => {
          const elementsToReveal = block.querySelectorAll(".js-reveal-txt");

          // Pre-hide text nodes instantly via GSAP to block single-frame initial layout flashes
          gsap.set(elementsToReveal, { autoAlpha: 0 });

          ScrollTrigger.create({
            trigger: block,
            start: "top 85%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              gsap.fromTo(
                elementsToReveal,
                { y: 40, x: 0, autoAlpha: 0 },
                {
                  duration: animDuration,
                  y: 0,
                  autoAlpha: 1,
                  ease: animEase,
                  stagger: 0.1, // Creates a high-end, layered delay down the text stack
                  overwrite: "auto",
                },
              );
            },
            onLeaveBack: () => {
              gsap.to(elementsToReveal, {
                duration: 0.5,
                y: 30,
                autoAlpha: 0,
                ease: "power2.in",
                stagger: 0.05,
                overwrite: "auto",
              });
            },
          });
        });

        // 3. Setup Landing Hero Text Animations
        const heroElements =
          containerRef.current.querySelectorAll(".js-reveal-hero");
        gsap.set(heroElements, { autoAlpha: 0 });
        gsap.fromTo(
          heroElements,
          { y: 50, autoAlpha: 0 },
          { duration: 1.5, y: 0, autoAlpha: 1, ease: animEase, stagger: 0.15 },
        );
      })
      .catch((err) =>
        console.error("[ScrollRevealList] Lifecycle error:", err.message),
      );
  }, [items, animDuration, animEase, offsetDistance]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-neutral-800 selection:text-white font-sans antialiased overflow-x-hidden"
    >
      {/* Editorial Landing Hero */}
      <div className="w-full h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 border-b border-neutral-900 relative">
        <div className="max-w-4xl space-y-4">
          <p className="js-reveal-hero text-xs uppercase tracking-[0.3em] text-neutral-500 font-mono opacity-0 invisible">
            Creative Direction Portfolio
          </p>
          <h1 className="js-reveal-hero text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white font-serif leading-[1.1] opacity-0 invisible will-change-[transform,opacity]">
            {heroTitle}
          </h1>
          <p className="js-reveal-hero text-sm md:text-base text-neutral-400 font-light max-w-md pt-4 opacity-0 invisible will-change-[transform,opacity]">
            {heroSubtitle}
          </p>
        </div>
        <div className="absolute bottom-12 left-6 md:left-12 lg:left-24 animate-pulse text-neutral-600 text-xs font-mono tracking-widest uppercase">
          ↓ Scroll to Observe
        </div>
      </div>

      {/* Main Structural Content Feed */}
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-32 space-y-48 md:space-y-64">
        {items.map((item, idx) => {
          const isLeft = item.direction === "left";

          return (
            <div
              key={idx}
              className={`flex flex-col md:flex-row ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                } items-center justify-between gap-12 md:gap-16 lg:gap-24`}
            >
              {/* Image Container with Custom Slide Tagging */}
              <div className="w-full md:w-[45%] lg:w-[40%] flex justify-center">
                <div
                  className={`js-reveal-img ${isLeft ? "js-slide-left" : "js-slide-right"
                    } w-full max-w-md aspect-[3/4] overflow-hidden bg-neutral-900 group relative opacity-0 invisible will-change-[transform,opacity]`}
                >
                  <div className="absolute inset-0 bg-black/10 z-10 transition-colors duration-500 group-hover:bg-transparent" />
                  <img
                    className="w-full h-full object-cover grayscale contrast-[1.1] transition-transform duration-700 ease-out group-hover:scale-105"
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text Blocks — Standardized to purely vertical unified upward arrivals */}
              <div
                className={`js-text-block w-full md:w-[50%] space-y-6 ${isLeft ? "text-left" : "text-left md:text-right"}`}
              >
                <div className="space-y-2">
                  <p className="js-reveal-txt text-xs font-mono tracking-wider text-neutral-500 opacity-0 invisible will-change-[transform,opacity]">
                    {item.tag}
                  </p>
                  <h2 className="js-reveal-txt text-3xl md:text-4xl lg:text-5xl font-light font-serif tracking-tight text-white leading-tight opacity-0 invisible will-change-[transform,opacity]">
                    {item.title}
                  </h2>
                </div>

                <p
                  className={`js-reveal-txt text-sm md:text-base leading-[1.8] text-neutral-400 font-light max-w-xl ${!isLeft && "md:ml-auto"} opacity-0 invisible will-change-[transform,opacity]`}
                >
                  {item.description.split("\n").map((line, lIdx) => (
                    <span key={lIdx} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
