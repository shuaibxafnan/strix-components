"use client";

import { useEffect, useRef, useState } from "react";

// ─── DynamicCustomCursor ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor           string   "bg-[#0a0a0c]"           Cinematic dark background base
// cursorColor       string   "bg-white"               High-contrast crisp white indicator badge
// cursorTextColor   string   "text-[#0a0a0c]"         Dark fill for the text badge contrast
// primaryBtnBg      string   "bg-zinc-900/40"         Glassmorphic translucent container cards
// secondaryBtnBg    string   "bg-zinc-900/40"         Translucent container secondary cards
// cardBorder        string   "border-zinc-800/80"     Sleek premium dividing borders
// glowColor         string   "from-indigo-500/10"     Radiant glowing micro-interaction gradients
// initialCursorText string   "DISCOVER"               Modernized capitalization defaults
// defaultXOffset    number   12                       Pixel offset to the right of cursor
// defaultYOffset    number   12                       Pixel offset below cursor
// ──────────────────────────────────────────────────────────────────────────

export default function DynamicCustomCursor({
  bgColor = "bg-[#0a0a0c]",
  cursorColor = "bg-white",
  cursorTextColor = "text-[#0a0a0c]",
  primaryBtnBg = "bg-zinc-900/40",
  secondaryBtnBg = "bg-zinc-900/40",
  cardBorder = "border-zinc-800/80",
  glowColor = "from-indigo-500/10",
  initialCursorText = "DISCOVER",
  defaultXOffset = 12,
  defaultYOffset = 12,
}) {
  const containerRef = useRef(null);
  const cursorItemRef = useRef(null);
  const [cursorText, setCursorText] = useState(initialCursorText);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let ctx;

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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !containerRef.current || !cursorItemRef.current) return;

        ctx = gsap.context(() => {
          const targets = containerRef.current.querySelectorAll("[data-cursor]");
          let currentTarget = null;
          let lastText = initialCursorText;

          gsap.set(containerRef.current, { cursor: "none" });
          gsap.set(cursorItemRef.current, { x: -9999, y: -9999 });

          const xTo = gsap.quickTo(cursorItemRef.current, "x", {
            ease: "power3.out",
            duration: 0.18,
          });
          const yTo = gsap.quickTo(cursorItemRef.current, "y", {
            ease: "power3.out",
            duration: 0.18,
          });

          const handleMouseMove = (e) => {
            const cursorEl = cursorItemRef.current;
            if (!cursorEl) return;

            const cursorX = e.clientX;
            const cursorY = e.clientY;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Measure badge dimensions for accurate flip
            const rect = cursorEl.getBoundingClientRect();
            const badgeW = rect.width || 120;
            const badgeH = rect.height || 32;

            const flipX = cursorX + badgeW + defaultXOffset > windowWidth;
            const flipY = cursorY + badgeH + defaultYOffset > windowHeight;

            const offsetX = flipX ? -(badgeW + defaultXOffset) : defaultXOffset;
            const offsetY = flipY ? -(badgeH + defaultYOffset) : defaultYOffset;

            // Offset via CSS transform — no competing GSAP tween
            cursorEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

            if (currentTarget) {
              const newText = currentTarget.getAttribute("data-cursor");
              if (newText && newText !== lastText) {
                setCursorText(newText);
                lastText = newText;
              }
            }

            xTo(cursorX);
            yTo(cursorY);
          };

          window.addEventListener("mousemove", handleMouseMove, { passive: true });

          const enterListeners = [];
          targets.forEach((target) => {
            const onMouseEnter = (e) => {
              currentTarget = e.currentTarget;
              const newText = currentTarget.getAttribute("data-cursor");
              if (newText && newText !== lastText) {
                setCursorText(newText);
                lastText = newText;
              }
              gsap.fromTo(
                cursorItemRef.current,
                { scale: 0.85 },
                { scale: 1, duration: 0.2, ease: "back.out(1.2)", overwrite: "auto" }
              );
            };

            const onMouseLeave = () => {
              currentTarget = null;
              setCursorText(initialCursorText);
              lastText = initialCursorText;
            };

            target.addEventListener("mouseenter", onMouseEnter);
            target.addEventListener("mouseleave", onMouseLeave);
            enterListeners.push({ target, onMouseEnter, onMouseLeave });
          });

          return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            enterListeners.forEach(({ target, onMouseEnter, onMouseLeave }) => {
              target.removeEventListener("mouseenter", onMouseEnter);
              target.removeEventListener("mouseleave", onMouseLeave);
            });
          };
        }, containerRef.current);
      })
      .catch((err) =>
        console.error("[DynamicCustomCursor] Dependency initialization failed:", err)
      );

    return () => {
      if (ctx) ctx.revert();
    };
  }, [mounted, initialCursorText, defaultXOffset, defaultYOffset]);

  if (!mounted) {
    return (
      <div className={`w-full min-h-screen ${bgColor} flex flex-col justify-center items-center p-6 relative overflow-hidden`} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen ${bgColor} flex flex-col justify-center items-center p-6 relative overflow-hidden group/canvas`}
      style={{ cursor: "none" }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-6 items-center w-full justify-center max-w-6xl z-10 select-none">

        <a
          data-cursor="LOOKS CRISP, RIGHT?"
          href="#"
          className={`group/btn w-full h-[14rem] px-8 rounded-2xl border ${cardBorder} ${primaryBtnBg} backdrop-blur-md no-underline flex flex-col relative items-start justify-end pb-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5`}
          style={{ cursor: "none" }}
        >
          <div className={`absolute inset-0 bg-gradient-to-tr ${glowColor} to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none`} />
          <div className="absolute top-6 left-8 text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase pointer-events-none">Interactive Node 01</div>
          <span className="z-10 relative font-sans text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 transition-colors duration-200 group-hover/btn:text-white pointer-events-none">
            GSAP-powered custom tracking cursor
          </span>
        </a>

        <a
          data-cursor="READING ATTRIBUTE VALUES"
          href="#"
          className={`group/btn w-full h-[14rem] px-8 rounded-2xl border ${cardBorder} ${secondaryBtnBg} backdrop-blur-md no-underline flex flex-col relative items-start justify-end pb-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/5`}
          style={{ cursor: "none" }}
        >
          <div className={`absolute inset-0 bg-gradient-to-tr ${glowColor} to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none`} />
          <div className="absolute top-6 left-8 text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase pointer-events-none">Interactive Node 02</div>
          <span className="z-10 relative font-sans text-xl md:text-2xl font-semibold tracking-tight text-zinc-300 transition-colors duration-200 group-hover/btn:text-white pointer-events-none">
            Utilizes custom reactive markup data
          </span>
        </a>
      </div>

      <div
        ref={cursorItemRef}
        className={`z-[1000] fixed top-0 left-0 opacity-0 pointer-events-none rounded-full px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase shadow-xl group-hover/canvas:opacity-100 transition-opacity duration-300 ${cursorColor} ${cursorTextColor} flex items-center justify-center border border-white/20`}
      >
        <span className="whitespace-nowrap pointer-events-none">{cursorText}</span>
      </div>
    </div>
  );
}