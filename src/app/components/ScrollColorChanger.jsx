"use client";

import { useEffect, useRef } from "react";

// ─── ScrollColorChanger ───────────────────────────────────────────────────────
const DEFAULT_SECTIONS = [
  {
    bgcolor: "#0B1325", // Deep midnight blue
    textcolor: "#FFFFFF",
    tagline: "EXPERIENCE THE CHANGE",
    heading: "Dynamic Transitions Crafted with GSAP & Locomotive",
    headingSize: "clamp(2.5rem, 5vw, 4.5rem)", 
    scrollSpeed: 2,
    imgSrc: "https://images.pexels.com/photos/3062948/pexels-photo-3062948.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000",
    imgAlt: "Hero cinematic background",
    isHero: true,
  },
  {
    bgcolor: "#F4EFEA", // Premium warm off-white
    textcolor: "#1E2522", // Deep forest charcoal
    tagline: "01 / METICULOUS DETAIL",
    heading: "Layouts that breathe and follow your rhythm.",
    headingSize: "clamp(1.8rem, 3vw, 2.8rem)",
    scrollSpeed: 1,
    imgSrc: "https://images.pexels.com/photos/4467879/pexels-photo-4467879.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=600",
    imgAlt: "Editorial minimalist photography",
    isHero: false,
  },
  {
    bgcolor: "#1E2522", // Deep forest charcoal
    textcolor: "#F4EFEA", // Warm off-white
    tagline: "02 / THE DARK MODE PARADIGM",
    heading: "Immersive contrast shifting perfectly on scroll.",
    headingSize: "clamp(1.8rem, 3vw, 2.8rem)",
    scrollSpeed: 1.5,
    imgSrc: "https://images.pexels.com/photos/5604966/pexels-photo-5604966.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=600",
    imgAlt: "Atmospheric abstract aesthetic",
    isHero: false,
  },
  {
    bgcolor: "#E29578", // Smooth muted terracotta
    textcolor: "#111111",
    tagline: "03 / CAPTIVATE EMOTION",
    heading: "Fluid layouts meeting pristine organic design systems.",
    headingSize: "clamp(1.8rem, 3vw, 2.8rem)",
    scrollSpeed: 1,
    imgSrc: "https://images.pexels.com/photos/4791474/pexels-photo-4791474.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=600",
    imgAlt: "Vibrant art architecture",
    isHero: false,
  },
];

export default function ScrollColorChanger({
  transitionDuration = 0.4, // Bumped slightly for a more luxurious fluid blend
  smoothScrollSpeed = 1,
  sections = DEFAULT_SECTIONS,
  creditText = "Made by Beings",
  creditUrl = "https://madebybeings.com",
}) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScript = (src, id) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-sid="${id}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-sid", id);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    const loadStyle = (href, id) => {
      if (document.querySelector(`link[data-sid="${id}"]`)) return;
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      el.setAttribute("data-sid", id);
      document.head.appendChild(el);
    };

    const init = async () => {
      try {
        loadStyle(
          "https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css",
          "loco-css"
        );

        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
          "gsap"
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
          "st"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js",
          "loco-js"
        );

        const { gsap, ScrollTrigger, LocomotiveScroll } = window;
        if (!gsap || !ScrollTrigger || !LocomotiveScroll) return;
        if (!containerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        // Set initial bg/text from first section smoothly
        const first = sections[0];
        if (first) {
          gsap.set("body", {
            backgroundColor: first.bgcolor,
            color: first.textcolor,
          });
        }

        // Locomotive smooth scroll init
        const locoScroll = new LocomotiveScroll({
          el: containerRef.current,
          smooth: true,
          multiplier: smoothScrollSpeed,
        });
        scrollerRef.current = locoScroll;

        locoScroll.on("scroll", ScrollTrigger.update);

        ScrollTrigger.scrollerProxy(containerRef.current, {
          scrollTop(value) {
            return arguments.length
              ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
              : locoScroll.scroll.instance.scroll.y;
          },
          getBoundingClientRect() {
            return {
              left: 0,
              top: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            };
          },
          pinType: containerRef.current.style.transform ? "transform" : "fixed",
        });

        ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
        ScrollTrigger.refresh();

        // Color change triggers mapping
        const colorElems = containerRef.current.querySelectorAll("[data-bgcolor]");
        colorElems.forEach((section, i) => {
          const prevBg = i === 0 ? first?.bgcolor ?? "" : colorElems[i - 1].dataset.bgcolor;
          const prevText = i === 0 ? first?.textcolor ?? "" : colorElems[i - 1].dataset.textcolor;

          ScrollTrigger.create({
            trigger: section,
            scroller: containerRef.current,
            start: "top 40%", // Trigger changes slightly early for visual fluidity
            onEnter: () =>
              gsap.to("body", {
                backgroundColor: section.dataset.bgcolor,
                color: section.dataset.textcolor,
                duration: transitionDuration,
                ease: "power2.out",
                overwrite: "auto",
              }),
            onLeaveBack: () =>
              gsap.to("body", {
                backgroundColor: prevBg,
                color: prevText,
                duration: transitionDuration,
                ease: "power2.out",
                overwrite: "auto",
              }),
          });
        });
      } catch (err) {
        console.error("[ScrollColorChanger] init error:", err.message);
      }
    };

    init();

    return () => {
      if (scrollerRef.current) {
        scrollerRef.current.destroy();
        scrollerRef.current = null;
      }
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          transition: background-color ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1),
                      color ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        [data-scroll-container] {
          overflow: hidden;
        }
      `}</style>

      {/* Locomotive scroll wrapper container */}
      <div ref={containerRef} data-scroll-container className="w-full">
        {sections.map((sec, i) => {
          // Render Strategy 1: The Luxury Editorial Hero Layout
          if (sec.isHero) {
            return (
              <section
                key={i}
                data-bgcolor={sec.bgcolor}
                data-textcolor={sec.textcolor}
                className="relative min-h-screen w-full flex flex-col justify-end px-[5vw] pb-[10vh] overflow-hidden"
              >
                {/* Background image component utilizing locomotive subtle parallax speed */}
                {sec.imgSrc && (
                  <div 
                    className="absolute inset-0 w-full h-[120%] -z-10 opacity-40 select-none pointer-events-none"
                    data-scroll
                    data-scroll-speed="-1.5"
                  >
                    <img
                      src={sec.imgSrc}
                      alt={sec.imgAlt || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Text Hero Box Container */}
                <div className="max-w-[85rem] w-full mix-blend-difference" data-scroll data-scroll-speed="0.5">
                  {sec.tagline && (
                    <span className="block text-xs font-semibold tracking-[0.3em] uppercase opacity-70 mb-4">
                      {sec.tagline}
                    </span>
                  )}
                  <h1
                    className="font-black tracking-tight leading-[1.05]"
                    style={{ fontSize: sec.headingSize ?? "3.5rem" }}
                  >
                    {sec.heading}
                  </h1>
                </div>
              </section>
            );
          }

          // Render Strategy 2: Modern Dynamic Alternating Row Sections
          const isEven = i % 2 === 0;
          return (
            <section
              key={i}
              data-bgcolor={sec.bgcolor}
              data-textcolor={sec.textcolor}
              className="relative min-h-screen w-full flex items-center justify-center py-[12vh] px-[6vw]"
            >
              <div 
                className={`max-w-[1200px] w-full flex flex-col md:flex-row gap-12 md:gap-20 items-center justify-between ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Image Showcase Container */}
                {sec.imgSrc && (
                  <div 
                    className="w-full md:w-1/2 aspect-[4/5] max-h-[70vh] overflow-hidden rounded-xl bg-black/5 shadow-2xl"
                    data-scroll
                    data-scroll-speed={sec.scrollSpeed ?? 1}
                  >
                    <img
                      src={sec.imgSrc}
                      alt={sec.imgAlt || ""}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                )}

                {/* Typography / Copy block */}
                <div 
                  className="w-full md:w-1/2 flex flex-col justify-center"
                  data-scroll
                  data-scroll-speed={(sec.scrollSpeed ?? 1) * 0.5}
                >
                  {sec.tagline && (
                    <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60 mb-3 block">
                      {sec.tagline}
                    </span>
                  )}
                  <h2
                    className="font-bold tracking-tight leading-[1.2] max-w-[500px]"
                    style={{ fontSize: sec.headingSize ?? "2rem" }}
                  >
                    {sec.heading}
                  </h2>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}