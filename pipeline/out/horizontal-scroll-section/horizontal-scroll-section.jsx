"use client";

import { useEffect, useState, useRef } from "react";

const EDITORIAL_ITEMS = [
  {
    type: "text",
    tag: "01 / OVERVIEW",
    title: "Curated Textures",
    content:
      "An exploration of tactile digital minimalist aesthetics, blending smooth viewport control with deliberate structural layout systems.",
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

const LOCO_CSS = `
html.has-scroll-smooth { overflow: hidden; }
html.has-scroll-dragging { user-select: none; }
.has-scroll-smooth body { overflow: hidden; }
.has-scroll-smooth [data-scroll-container] { min-height: 100vh; }
`;

export default function HorizontalScrollSection({
  introLabel = "Editorial Showcase / Volume I",
  introTitleStart = "Horizontal",
  introTitleAccent = "scrolling structural",
  introTitleEnd = "canvas platform.",
  introText = "Scroll down and the exhibition slides sideways while the section stays pinned in place.",
  exhibitionLabel = "EXHIBITION",
  navLabel = "INDEX / NAV",
  outroLabel = "COLLABORATION",
  outroTitle = "Let's map new digital directions.",
  outroImageSrc = "https://images.pexels.com/photos/4791474/pexels-photo-4791474.jpeg?auto=compress&cs=tinysrgb&w=800",
  outroImageAlt = "Signoff Portrait",
  linkLabel = "Get in touch",
  linkHref = "#",
  sectionOneBg = "bg-[#0a0a0a]",
  sectionOneTextColor = "text-neutral-100",
  sectionThreeBg = "bg-[#0d0d0d]",
  sectionThreeTextColor = "text-neutral-400",
  horizontalBg = "bg-[#111111]",
  accentColor = "bg-amber-200/90",
  multiplier = 1.1,
  scrub = 0.5,
  items = EDITORIAL_ITEMS,
  className = "",
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

    let cancelled = false;
    let cleanup = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, locoModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("locomotive-scroll"),
      ]);
      if (cancelled || !containerRef.current) return;

      const LocomotiveScroll = locoModule.default;

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

      if (!pinWrap || !pinSection) {
        scroller.destroy();
        return;
      }

      const getHorizontalScrollLength = () =>
        pinWrap.offsetWidth - window.innerWidth;

      const tween = gsap.to(pinWrap, {
        scrollTrigger: {
          scroller: containerRef.current,
          scrub: scrub,
          trigger: pinSection,
          pin: true,
          start: "top top",
          end: () => `+=${getHorizontalScrollLength()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
        x: () => -getHorizontalScrollLength(),
        ease: "power1.out",
      });

      const handleRefresh = () => scroller.update();
      ScrollTrigger.addEventListener("refresh", handleRefresh);
      ScrollTrigger.refresh();

      cleanup = () => {
        ScrollTrigger.removeEventListener("refresh", handleRefresh);
        tween.scrollTrigger && tween.scrollTrigger.kill();
        tween.kill();
        scroller.destroy();
        ScrollTrigger.clearScrollMemory();
      };
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [mounted, multiplier, scrub]);

  if (!mounted) {
    return <div className={`w-full min-h-screen bg-[#0a0a0a] ${className}`} />;
  }

  return (
    <>
      <style>{LOCO_CSS}</style>

      <div
        ref={containerRef}
        data-scroll-container
        className={`container select-none overflow-x-hidden max-w-full w-full [overscroll-behavior:none] bg-[#0a0a0a] ${className}`}
      >
        <section
          className={`min-h-screen w-full relative flex items-center justify-start px-8 md:px-[12vw] ${sectionOneBg}`}
        >
          <div className="max-w-4xl space-y-6">
            <span className="text-xs font-mono tracking-[0.4em] uppercase text-neutral-500 block">
              {introLabel}
            </span>
            <h1
              className={`text-4xl md:text-7xl font-light font-serif tracking-tight leading-[1.15] ${sectionOneTextColor}`}
            >
              {introTitleStart} <br />
              <span className="italic font-normal text-neutral-400">
                {introTitleAccent}
              </span>{" "}
              <br />
              {introTitleEnd}
            </h1>
            <div className="w-24 h-[1px] bg-neutral-800 my-8" />
            <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest max-w-sm leading-relaxed">
              {introText}
            </p>
          </div>
        </section>

        <section
          ref={pinSectionRef}
          className={`h-screen overflow-hidden flex relative left-0 border-y border-neutral-900 ${horizontalBg}`}
        >
          <div className="absolute top-12 left-12 text-[10vh] font-serif font-black text-white/[0.015] select-none pointer-events-none tracking-tight">
            {exhibitionLabel}
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

          <div className="absolute bottom-12 right-12 z-50 flex items-center gap-4 font-mono text-xs tracking-widest text-neutral-500">
            <span>{navLabel}</span>
            <div className="w-24 h-[1px] bg-neutral-800 relative">
              <div
                className={`absolute inset-y-0 left-0 transition-transform duration-100 ${accentColor}`}
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </section>

        <section
          className={`min-h-screen w-full relative flex flex-col md:flex-row items-center justify-between gap-12 py-24 px-8 md:px-[12vw] ${sectionThreeBg}`}
        >
          <div className="w-full md:w-1/2 max-w-md overflow-hidden rounded-sm border border-neutral-900 aspect-square relative shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <img
              src={outroImageSrc}
              alt={outroImageAlt}
              className="w-full h-full object-cover filter contrast-[102%] brightness-[85%] mix-blend-luminosity"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center items-start space-y-4">
            <span className="text-xs font-mono text-neutral-600 tracking-[0.3em] uppercase block">
              {outroLabel}
            </span>
            <h2
              className={`text-3xl md:text-5xl font-serif font-light tracking-wide ${sectionOneTextColor}`}
            >
              {outroTitle}
            </h2>
            <div className="pt-6">
              <a
                href={linkHref}
                className={`text-sm uppercase tracking-[0.2em] inline-flex items-center gap-3 pb-1 border-b border-neutral-800 hover:border-neutral-200 transition-colors ${sectionThreeTextColor}`}
              >
                <span>{linkLabel}</span>
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
