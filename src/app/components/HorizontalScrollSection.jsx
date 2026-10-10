"use client";

import { useEffect, useState, useRef } from "react";

const EDITORIAL_ITEMS = [
  {
    type: "text",
    tag: "01 / OVERVIEW",
    title: "Curated Textures",
    content:
      "An exploration of tactile digital minimalist aesthetics, blending smooth viewport control with deliberate structural layout layout systems.",
  },
  {
    type: "image",
    tag: "02 / ARCHIVE",
    title: "Monolithic Form",
    src: "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Minimal concrete architecture",
  },
  {
    type: "image",
    tag: "03 / GALLERY",
    title: "Shadow Study",
    src: "https://images.pexels.com/photos/3371358/pexels-photo-3371358.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Abstract lighting and architectural lines",
  },
  {
    type: "image",
    tag: "04 / CAPTURE",
    title: "Ocean Brutalism",
    src: "https://images.pexels.com/photos/3618545/pexels-photo-3618545.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Crashing water against dark rocks",
  },
];

export default function HorizontalScrollSection({
  sectionOneBg = "bg-[#0a0a0a]",
  sectionOneTextColor = "text-neutral-100",
  sectionThreeBg = "bg-[#0d0d0d]",
  sectionThreeTextColor = "text-neutral-400",
  horizontalBg = "bg-[#111111]",
  accentColor = "bg-amber-200/90",
  multiplier = 1.1,
  scrub = 0.5,
  items = EDITORIAL_ITEMS,
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const pinWrapRef = useRef(null);
  const pinSectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    Promise.all([
      loadScript(
        "https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
    ])
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        ),
      )
      .then(() => {
        const { gsap, ScrollTrigger, LocomotiveScroll } = window;

        if (!gsap || !ScrollTrigger || !LocomotiveScroll) return;

        gsap.registerPlugin(ScrollTrigger);

        const scroller = new LocomotiveScroll({
          el: containerRef.current,
          smooth: true,
          multiplier: multiplier,
        });

        scroller.on("scroll", ScrollTrigger.update);

        ScrollTrigger.scrollerProxy(containerRef.current, {
          scrollTop(value) {
            return arguments.length
              ? scroller.scrollTo(value, 0, 0)
              : scroller.scroll.instance.scroll.y;
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

        const pinWrap = pinWrapRef.current;
        const pinSection = pinSectionRef.current;

        if (!pinWrap || !pinSection) return;

        const getHorizontalScrollLength = () =>
          pinWrap.offsetWidth - window.innerWidth;

        gsap.to(pinWrap, {
          scrollTrigger: {
            scroller: containerRef.current,
            scrub: scrub,
            trigger: pinSection,
            pin: true,
            start: "top top",
            end: () => `+=${getHorizontalScrollLength()}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Map total active tracking updates smoothly straight to state
              setScrollProgress(self.progress);
            },
          },
          x: () => -getHorizontalScrollLength(),
          ease: "power1.out",
        });

        const handleRefresh = () => scroller.update();
        ScrollTrigger.addEventListener("refresh", handleRefresh);
        ScrollTrigger.refresh();

        return () => {
          ScrollTrigger.removeEventListener("refresh", handleRefresh);
          scroller.destroy();
          ScrollTrigger.getAll().forEach((t) => t.kill());
        };
      })
      .catch((err) =>
        console.error(
          "[ScrollComponent] Global bundle script load failure:",
          err,
        ),
      );
  }, [mounted, multiplier, scrub]);

  if (!mounted) {
    return <div className="w-full min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css"
      />

      <div
        ref={containerRef}
        className="container select-none overflow-x-hidden max-w-full w-full [overscroll-behavior:none] bg-[#0a0a0a]"
      >
        {/* Section 1: Hero Editorial Intro */}
        <section
          className={`min-h-screen w-full relative flex items-center justify-start px-8 md:px-[12vw] ${sectionOneBg}`}
        >
          <div className="max-w-4xl space-y-6">
            <span className="text-xs font-mono tracking-[0.4em] uppercase text-neutral-500 block">
              Editorial Showcase / Volume I
            </span>
            <h1
              className={`text-4xl md:text-7xl font-light font-serif tracking-tight leading-[1.15] ${sectionOneTextColor}`}
            >
              Horizontal <br />
              <span className="italic font-normal text-neutral-400">
                scrolling structural
              </span>{" "}
              <br />
              canvas platform.
            </h1>
            <div className="w-24 h-[1px] bg-neutral-800 my-8" />
            <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest max-w-sm leading-relaxed">
              Driven via GSAP dynamic ScrollTrigger systems tied safely to an
              unified Locomotive context wrapper.
            </p>
          </div>
        </section>

        {/* Section 2: Horizontal Scroll Track Container */}
        <section
          ref={pinSectionRef}
          className={`h-screen overflow-hidden flex relative left-0 border-y border-neutral-900 ${horizontalBg}`}
        >
          {/* Subtle Fixed Background Watermark label */}
          <div className="absolute top-12 left-12 text-[10vh] font-serif font-black text-white/[0.015] select-none pointer-events-none tracking-tight">
            EXHIBITION
          </div>

          <div
            ref={pinWrapRef}
            className="pin-wrap h-screen flex justify-start items-center pl-[12vw] pr-0 will-change-transform"
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="w-[55vw] md:w-[45vw] pr-[12vw] flex-shrink-0 flex flex-col justify-center items-start group"
              >
                {/* Meta Labels */}
                <div className="mb-4 space-y-1 font-mono text-xs tracking-widest text-neutral-500 uppercase">
                  <div>{item.tag}</div>
                </div>

                {item.type === "text" ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl md:text-4xl font-serif text-neutral-200 font-light tracking-wide">
                      {item.title}
                    </h2>
                    <p className="text-neutral-400 font-sans font-light leading-relaxed text-base max-w-sm">
                      {item.content}
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="w-full overflow-hidden border border-neutral-800 bg-neutral-950 aspect-[4/5] md:aspect-[3/2] rounded-sm relative shadow-2xl">
                      <img
                        src={item.src}
                        alt={item.alt || ""}
                        className="w-full h-full object-cover block filter grayscale brightness-[90%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1)"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent pointer-events-none" />
                    </div>
                    <h3 className="text-sm font-sans tracking-wide text-neutral-300 font-light">
                      {item.title}
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Minimal Dynamic Progress Counter Frame */}
          <div className="absolute bottom-12 right-12 z-50 flex items-center gap-4 font-mono text-xs tracking-widest text-neutral-500">
            <span>INDEX / NAV</span>
            <div className="w-24 h-[1px] bg-neutral-800 relative">
              <div
                className={`absolute inset-y-0 left-0 transition-transform duration-100 ${accentColor}`}
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Professional Sign-off Block */}
        <section
          className={`min-h-screen w-full relative flex flex-col md:flex-row items-center justify-between gap-12 py-24 px-8 md:px-[12vw] ${sectionThreeBg}`}
        >
          <div className="w-full md:w-1/2 max-w-md overflow-hidden rounded-sm border border-neutral-900 aspect-square relative shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <img
              src="https://images.pexels.com/photos/4791474/pexels-photo-4791474.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Signoff Portrait"
              className="w-full h-full object-cover filter contrast-[102%] brightness-[85%] mix-blend-luminosity"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center items-start space-y-4">
            <span className="text-xs font-mono text-neutral-600 tracking-[0.3em] uppercase block">
              COLLABORATION
            </span>
            <h2
              className={`text-3xl md:text-5xl font-serif font-light tracking-wide ${sectionOneTextColor}`}
            >
              Let&apos;s map new digital directions.
            </h2>
            <div className="pt-6">
              <a
                href="https://madebybeings.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm uppercase tracking-[0.2em] inline-flex items-center gap-3 pb-1 border-b border-neutral-800 hover:border-neutral-200 transition-colors ${sectionThreeTextColor}`}
              >
                <span>Made by Beings</span>
                <span className="text-xs font-serif italic text-neutral-500">
                  →
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
