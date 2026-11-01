"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_CARDS = [
  {
    label: "Interactive Node 01",
    title: "GSAP-powered custom tracking cursor",
    cursorText: "LOOKS CRISP, RIGHT?",
    href: "#",
    titleColor: "text-zinc-100",
    hoverShadow: "hover:shadow-indigo-500/5",
  },
  {
    label: "Interactive Node 02",
    title: "Utilizes custom reactive markup data",
    cursorText: "READING ATTRIBUTE VALUES",
    href: "#",
    titleColor: "text-zinc-300",
    hoverShadow: "hover:shadow-purple-500/5",
  },
];

export default function DynamicCustomCursor({
  cards = DEFAULT_CARDS,
  bgColor = "bg-[#0a0a0c]",
  cursorColor = "bg-white",
  cursorTextColor = "text-[#0a0a0c]",
  primaryBtnBg = "bg-zinc-900/40",
  secondaryBtnBg = "bg-zinc-900/40",
  cardBorder = "border-zinc-800/80",
  glowColor = "from-indigo-500/10",
  labelColor = "text-zinc-500",
  initialCursorText = "DISCOVER",
  defaultXOffset = 12,
  defaultYOffset = 12,
  className = "",
}) {
  const containerRef = useRef(null);
  const cursorItemRef = useRef(null);
  const [cursorText, setCursorText] = useState(initialCursorText);

  useEffect(() => {
    let ctx;
    let cancelled = false;

    import("gsap").then(({ gsap }) => {
      if (cancelled || !containerRef.current || !cursorItemRef.current) return;

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

          const rect = cursorEl.getBoundingClientRect();
          const badgeW = rect.width || 120;
          const badgeH = rect.height || 32;

          const flipX = cursorX + badgeW + defaultXOffset > windowWidth;
          const flipY = cursorY + badgeH + defaultYOffset > windowHeight;

          const offsetX = flipX ? -(badgeW + defaultXOffset) : defaultXOffset;
          const offsetY = flipY ? -(badgeH + defaultYOffset) : defaultYOffset;

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
    });

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, [initialCursorText, defaultXOffset, defaultYOffset, cards]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen ${bgColor} flex flex-col items-center justify-center p-6 relative overflow-hidden group/canvas ${className}`}
      style={{ cursor: "none" }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-6 items-center w-full justify-center max-w-6xl z-10 select-none">
        {cards.map((card, i) => (
          <a
            key={i}
            data-cursor={card.cursorText}
            href={card.href || "#"}
            className={`group/btn w-full h-[14rem] px-8 rounded-2xl border ${cardBorder} ${i % 2 === 0 ? primaryBtnBg : secondaryBtnBg} backdrop-blur-md no-underline flex flex-col relative items-start justify-end pb-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${card.hoverShadow || ""}`}
            style={{ cursor: "none" }}
          >
            <div className={`absolute inset-0 bg-gradient-to-tr ${glowColor} to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            <div className={`absolute top-6 left-8 text-xs font-mono tracking-[0.2em] ${labelColor} uppercase pointer-events-none`}>{card.label}</div>
            <span className={`z-10 relative font-sans text-xl md:text-2xl font-semibold tracking-tight ${card.titleColor || "text-zinc-100"} transition-colors duration-200 group-hover/btn:text-white pointer-events-none`}>
              {card.title}
            </span>
          </a>
        ))}
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
