"use client";

import { useEffect, useRef } from "react";

const DEFAULT_SECTIONS = [
  "In the cosmic ballet, stars twirl, painting the night sky with celestial wonders and mysteries.",
  "The vast expanse of space whispers tales of undiscovered realms, beckoning humanity's relentless exploration.",
];

export default function TextReveal({
  sections = DEFAULT_SECTIONS,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  lenisLerp = 0.07,
  stagger = 0.15,
  ease = "power1.inOut",
  debounceMs = 500,
  className = "",
}) {
  const appRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let lenis;
    let resizeObserver;
    let timer;
    let tickerFn;
    let gsapRef;
    let triggers = [];
    let splits = [];

    async function init() {
      const [gsapMod, stMod, lenisMod, splitMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
        import("split-type"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod.default || lenisMod.Lenis;
      const SplitType = splitMod.default || splitMod.SplitType;
      gsapRef = gsap;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: lenisLerp });
      lenis.on("scroll", ScrollTrigger.update);
      tickerFn = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);

      const cleanupAnimations = () => {
        triggers.forEach((t) => t.kill());
        triggers = [];
        splits.forEach((s) => s.revert());
        splits = [];
      };

      const setTextRevealAnimations = () => {
        if (!appRef.current) return;
        cleanupAnimations();
        appRef.current.querySelectorAll(".text-reveal").forEach((text) => {
          text.querySelectorAll(".line-wrapper").forEach((el) => el.remove());

          const splitText = new SplitType(text);
          splits.push(splitText);
          splitText.lines.forEach((line) => {
            const lineWrapper = document.createElement("div");
            lineWrapper.classList.add("line-wrapper");
            text.insertAdjacentElement("beforeend", lineWrapper);
            lineWrapper.appendChild(line);
          });

          const tween = gsap.to(splitText.lines, {
            y: 0,
            ease,
            stagger,
            scrollTrigger: {
              trigger: text,
              start: "top bottom",
              toggleActions: "play reset play reset",
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        });
      };

      setTextRevealAnimations();

      resizeObserver = new ResizeObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(setTextRevealAnimations, debounceMs);
      });
      resizeObserver.observe(document.body);

      init.cleanup = cleanupAnimations;
    }

    init();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      resizeObserver?.disconnect();
      if (gsapRef && tickerFn) gsapRef.ticker.remove(tickerFn);
      init.cleanup?.();
      lenis?.destroy?.();
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400&display=swap');
        .text-reveal-root { font-family: 'Poppins', sans-serif; }
        .text-reveal { font-kerning: none; }
        .text-reveal .line-wrapper { overflow: hidden; }
        .text-reveal .line { transform: translate3d(0, 100%, 0); }
      `}</style>

      <div
        ref={appRef}
        className={`text-reveal-root min-h-screen w-full overflow-hidden ${className}`}
        style={{
          fontSize: "max(24px, 3vw)",
          lineHeight: 1.4,
          backgroundColor,
          color: textColor,
        }}
      >
        {sections.map((text, i) => (
          <section
            key={i}
            className="flex items-center justify-center min-h-screen"
          >
            <div className="relative max-w-[90%] md:max-w-[60%] mx-auto">
              <p className="text-reveal">{text}</p>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
