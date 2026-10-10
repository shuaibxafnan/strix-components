"use client";

import { useEffect, useRef } from "react";

// ─── TextReveal ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sections      string[]    2 cosmic strings    Array of paragraph texts
// lenisLerp     number      0.07                Lenis smooth scroll lerp
// stagger       number      0.15                GSAP line stagger delay
// ease          string      power1.inOut         GSAP ease
// debounceMs    number      500                 Resize debounce delay (ms)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS = [
  "In the cosmic ballet, stars twirl, painting the night sky with celestial wonders and mysteries.",
  "The vast expanse of space whispers tales of undiscovered realms, beckoning humanity's relentless exploration.",
];

export default function TextReveal({
  sections = DEFAULT_SECTIONS,
  lenisLerp = 0.07,
  stagger = 0.15,
  ease = "power1.inOut",
  debounceMs = 500,
}) {
  const appRef = useRef(null);

  useEffect(() => {
    let lenis;
    let resizeObserver;

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

    const debounce = (func, timeout = 300) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    };

    async function init() {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        );
        await loadScript("https://unpkg.com/lenis@1.3.23/dist/lenis.min.js");
        await loadScript("https://unpkg.com/split-type@0.3.4/umd/index.min.js");
      } catch (err) {
        console.error("[TextReveal] Script load failed:", err.message);
        return;
      }

      const { gsap, ScrollTrigger, Lenis, SplitType } = window;
      if (!gsap || !ScrollTrigger || !Lenis || !SplitType) {
        console.error("[TextReveal] Missing globals after load.");
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: lenisLerp });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      const setTextRevealAnimations = () => {
        if (!appRef.current) return;
        appRef.current.querySelectorAll(".text-reveal").forEach((text) => {
          // clear previous split wrappers
          text.querySelectorAll(".line-wrapper").forEach((el) => el.remove());

          const splitText = new SplitType(text);
          splitText.lines.forEach((line) => {
            const lineWrapper = document.createElement("div");
            lineWrapper.classList.add("line-wrapper");
            text.insertAdjacentElement("beforeend", lineWrapper);
            lineWrapper.appendChild(line);
          });

          gsap.to(splitText.lines, {
            y: 0,
            ease,
            stagger,
            scrollTrigger: {
              trigger: text,
              start: "top bottom",
              toggleActions: "play reset play reset",
            },
          });
        });
      };

      setTextRevealAnimations();

      resizeObserver = new ResizeObserver(
        debounce(() => {
          setTextRevealAnimations();
        }, debounceMs),
      );
      resizeObserver.observe(document.body);
    }

    init();

    return () => {
      lenis?.destroy?.();
      resizeObserver?.disconnect();
      window.ScrollTrigger?.getAll().forEach((t) => t.kill());
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
        className="text-reveal-root bg-white text-black min-h-screen overflow-hidden"
        style={{ fontSize: "max(24px, 3vw)", lineHeight: 1.4 }}
      >
        {sections.map((text, i) => (
          <section
            key={i}
            className="flex items-center justify-center min-h-screen"
          >
            <div className="relative max-w-[60%] mx-auto">
              <p className="text-reveal">{text}</p>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
