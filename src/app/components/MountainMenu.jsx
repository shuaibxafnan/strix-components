"use client";

import { useEffect, useState } from "react";

// ─── Luxury Bottom-Right Menu Component ──────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// logoTextTop      string   "MOUNTAIN"   Primary brand wordmark
// logoTextBottom   string   "HOME"       Sub brand wordmark
// videoSrc         string   "..."        Ambient background fallback loop
// posterSrc        string   "..."        High-res thumbnail while loading
// linksData        array    [...]        Editorial section anchors & nature imagery
// initialBgImage   string   "..."        Default cover image backdrop
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_LINKS = [
  {
    num: "01",
    label: "The Gathering",
    sub: "ABOUT OUR TRIBE",
    href: "#",
    bg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop", // Deep misty mountains
  },
  {
    num: "02",
    label: "Alpine Kit",
    sub: "PREMIUM EQUIPMENT",
    href: "#",
    bg: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2000&auto=format&fit=crop", // Deep evergreen forest
  },
  {
    num: "03",
    label: "Expeditions",
    sub: "CURATED TOURS",
    href: "#",
    bg: "https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=2000&auto=format&fit=crop", // Green valley ridges
  },
  {
    num: "04",
    label: "Reach Out",
    sub: "CONNECT WITH US",
    href: "#",
    bg: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop", // Yosemite river canyon
  },
];

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop"; // Alpine meadow mist

export default function MountainMenu({
  logoTextTop = "MOUNTAIN",
  logoTextBottom = "HOME",
  videoSrc = "https://assets.codepen.io/1651485/Camping+At+A+Forest.mp4",
  posterSrc = "https://wallpaperaccess.com/full/428865.jpg",
  linksData = DEFAULT_LINKS,
  initialBgImage = FALLBACK_BG,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBg, setActiveBg] = useState(initialBgImage);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-screen bg-[#0a0a0a]" />;
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setActiveBg(initialBgImage);
      setIsHoveringLink(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] antialiased select-none text-white font-sans">
      {/* ─── Editorial Minimal Branding ──────────────────────────────────── */}
      <div className="absolute top-10 left-10 text-left z-[99] cursor-pointer tracking-[0.3em] text-xs mix-blend-difference uppercase transition-all duration-300 hover:opacity-70">
        <div className="font-semibold tracking-[0.25em]">{logoTextTop}</div>
        <div className="opacity-40 font-light tracking-[0.4em] mt-1 text-[10px]">
          {logoTextBottom}
        </div>
      </div>

      {/* ─── Unified Background Canvas Stack ──────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Layer A: Video Base (Fades down cleanly when menu unfolds) */}
        <video
          loop
          muted
          autoPlay
          playsInline
          poster={posterSrc}
          className="absolute inset-0 w-full h-full object-cover transform scale-[1.03] transition-opacity duration-700 ease-in-out"
          style={{ opacity: isOpen ? 0.1 : 1 }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Layer B: Interactive Fullscreen Image Canvas (Controlled transitions) */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            backgroundImage: `url('${activeBg}')`,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "scale(1)" : "scale(1.05)",
          }}
        />

        {/* Layer C: Cinematic Scrim (Adjusts opacity based on interaction states) */}
        <div
          className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] transition-colors duration-500 ease-out pointer-events-none"
          style={{
            backgroundColor: isOpen
              ? isHoveringLink
                ? "rgba(10, 10, 10, 0.65)"
                : "rgba(10, 10, 10, 0.45)"
              : "rgba(0, 0, 0, 0.3)",
          }}
        />
      </div>

      {/* ─── Bottom-Right Anchored Navigation Panel ─────────────────────── */}
      <div
        className="absolute bottom-12 right-6 sm:bottom-16 sm:right-12 md:bottom-20 md:right-20 max-w-xl w-full flex flex-col items-end transition-all duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
        style={{
          transform: isOpen ? "translateY(0)" : "translateY(30px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <nav className="flex flex-col space-y-4 md:space-y-5 text-right w-full">
          {linksData.map((link, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-end pb-3 overflow-hidden cursor-pointer border-b border-white/5"
              onMouseEnter={() => {
                setActiveBg(link.bg || initialBgImage);
                setIsHoveringLink(true);
              }}
              onMouseLeave={() => setIsHoveringLink(false)}
            >
              {/* Top Meta Line: Index + Tagline */}
              <div className="flex items-center space-x-3 mb-1 transform transition-transform duration-500 group-hover:-translate-x-1">
                <span className="font-sans font-light tracking-[0.15em] text-[9px] text-white/30 group-hover:text-white/60 uppercase">
                  {link.sub}
                </span>
                <span className="font-sans font-light text-[10px] tracking-widest opacity-20 group-hover:opacity-40">
                  {link.num || `0${idx + 1}`}
                </span>
              </div>

              {/* Main Elegant Serif Link Component (Slightly Downscaled) */}
              <a
                href={link.href}
                className="font-serif italic font-normal text-3xl sm:text-4xl md:text-5xl text-white/70 group-hover:text-white transition-all duration-500 transform group-hover:-translate-x-2 inline-block"
              >
                {link.label}
              </a>

              {/* Progressive Border Highlight Accent */}
              <span className="absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 transition-all duration-500 ease-out group-hover:w-1/2" />
            </div>
          ))}
        </nav>
      </div>

      {/* ─── Refined Micro Toggle Controller ─────────────────────────────── */}
      <button
        onClick={handleToggle}
        aria-label="Toggle Interface Menu"
        className="absolute top-10 right-10 z-[99] flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-neutral-950/20 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-neutral-950/60"
      >
        <div className="relative w-5 h-4 flex flex-col justify-between p-0.5">
          <span
            className="w-full h-[1.5px] bg-white transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-center"
            style={{
              transform: isOpen ? "translateY(6px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="w-full h-[1.5px] bg-white transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-center"
            style={{
              transform: isOpen ? "translateY(-6px) rotate(-45deg)" : "none",
            }}
          />
        </div>
      </button>
    </div>
  );
}
