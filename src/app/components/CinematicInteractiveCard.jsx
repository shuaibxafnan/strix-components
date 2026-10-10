"use client";

import { useState, useEffect } from "react";

// ─── CinematicInteractiveCard ────────────────────────────────────────────────
//
// Props
// ────────────────────────────────────────────────────────────────────────────
// title              string    "I know exactly what I'm doing"
// subtitleText       string    "But in a much more real sense, I have no idea what I'm doing."
// iconClass          string    "fa-solid fa-hat-witch" -> FontAwesome or custom asset class mapping
// wordDelayOffset    number    40             Stagger delay step modifier per word (ms)
// cardWidth          string    "56vmin"       Responsive width bounding matrix
// cardAspectRatio    string    "1/1.6"        Aspect constraint layout scaling
// borderColor        string    "#03a9f4"      Default border edge glow vector line
// gradColor1         string    "#6200ea"      Gradient wave color stop 1 (Deep Purple Pulse)
// gradColor2         string    "#ec407a"      Gradient wave color stop 2 (Hot Pink Core)
// gradColor3         string    "#fdd835"      Gradient wave color stop 3 (Acid Gold Crown)
// dotGridOpacity     string    "0.2"          Polka matrix mask alpha layer density
// ────────────────────────────────────────────────────────────────────────────

export default function CinematicInteractiveCard({
  title = "I know exactly what I'm doing",
  subtitleText = "But in a much more real sense, I have no idea what I'm doing.",
  iconClass = "fa-solid fa-hat-witch",
  wordDelayOffset = 40,
  cardWidth = "56vmin",
  cardAspectRatio = "1/1.6",
  borderColor = "rgb(3, 169, 244)",
  gradColor1 = "rgb(98, 0, 234)",
  gradColor2 = "rgb(236, 64, 122)",
  gradColor3 = "rgb(253, 216, 53)",
  dotGridOpacity = "0.2",
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Eliminate any hybrid SSR or layout shift hydration alerts securely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Split your text string array targeting modular delay sequences natively
  const subtitleWords = subtitleText.split(" ");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[rgb(10,10,10)] m-0 p-0 select-none">
      {/* ── Metadata Target Tracker Elements ────────────────────────────────── */}
      <a
        id="source-link"
        className="fixed top-[60px] left-[10px] z-[10000] inline-flex items-center gap-[5px] px-5 py-2.5 rounded-md border border-white/10 bg-white/5 backdrop-blur-[3px] shadow-[2px_2px_2px_rgba(0,0,0,0.1)] no-underline transition-all duration-300 hover:bg-white/10 hover:border-white/25 group"
        href="https://brand.twitch.tv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-solid fa-link text-[rgb(94,106,210)] h-5 leading-5"></i>
        <span className="font-mono text-white text-xs h-5 leading-5 tracking-tight">
          Source
        </span>
      </a>

      <a
        id="yt-link"
        className="fixed top-[10px] left-[10px] z-[10000] inline-flex items-center gap-[5px] px-5 py-2.5 rounded-md border border-white/10 bg-white/5 backdrop-blur-[3px] shadow-[2px_2px_2px_rgba(0,0,0,0.1)] no-underline transition-all duration-300 hover:bg-white/10 hover:border-white/25 group"
        href="https://youtu.be/joDhIH6Xumw"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-youtube text-[rgb(239,83,80)] h-5 leading-5"></i>
        <span className="text-white text-xs h-5 leading-5 tracking-tight font-sans">
          3 min tutorial
        </span>
      </a>

      {/* ── Core Interlock Animation Card ────────────────────────────────────── */}
      <div
        style={{
          width: cardWidth,
          aspectRatio: cardAspectRatio,
          "--card-border-target": borderColor,
          "--g1": gradColor1,
          "--g2": gradColor2,
          "--g3": gradColor3,
        }}
        className={`
          relative cursor-pointer group box-border
          border-[0.5vmin] border-solid border-[var(--card-border-target)]
          
          /* Linear-Gradient Backing Mesh */
          before:content-[""] before:absolute before:inset-0 before:z-10 before:pointer-events-none
          before:bg-[linear-gradient(130deg,transparent_0%_33%,var(--g1)_66%,var(--g2)_83.5%,var(--g3)_100%)]
          before:bg-[length:300%_300%] before:bg-[0%_0%]
          before:transition-[background-position_350ms_ease,transform_350ms_ease]
          
          /* Hover Matrix Modifications */
          hover:before:bg-[100%_100%] hover:before:scale-[1.08,1.03]
        `}
      >
        {/* Card Content Radial Polka Panel Grid */}
        <div
          style={{ "--dot-alpha": dotGridOpacity }}
          className={`
            relative z-20 h-[calc(100%-10vmin)] w-[calc(100%-10vmin)] p-[5vmin] box-content
            bg-[radial-gradient(rgba(255,255,255,var(--dot-alpha))_8%,transparent_8%)]
            bg-[0%_0%] bg-[size:5vmin_5vmin]
            transition-[background-position] duration-350 ease-out
            group-hover:bg-[-10%_0%]
          `}
        >
          {/* Main Title Interface Typography */}
          <h3 className="m-0 p-0 text-white font-normal text-[6vmin] leading-tight font-sans tracking-tight">
            {title}
          </h3>

          {/* Staggered Word Node Mount Box */}
          <h4 className="m-0 p-0 text-white font-normal text-[3vmin] mt-[2vmin] font-sans tracking-wide">
            {subtitleWords.map((word, idx) => (
              <span
                key={`word-${idx}`}
                style={{
                  transitionDelay: `${idx * wordDelayOffset}ms`,
                }}
                className={`
                  inline-block my-0 mx-[0.3vmin] relative opacity-0 translate-y-[40%] transition-none
                  
                  /* Hover reveal engine parsing */
                  group-hover:opacity-100 group-hover:translate-y-0
                  group-hover:transition-[opacity_0ms,transform_200ms_cubic-bezier(0.9,0.06,0.15,0.9)]
                `}
              >
                {word}&nbsp;
              </span>
            ))}
          </h4>
        </div>

        {/* Ambient Footer Control Graphic Asset Icon */}
        <i
          className={`
            absolute left-0 bottom-0 z-20 m-[5vmin] text-[7vmin]
            text-white/50 transition-colors duration-250 ease-out
            group-hover:text-white
            ${iconClass}
          `}
        />
      </div>
    </div>
  );
}
