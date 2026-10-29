"use client";

import { useState } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-serif",
});

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=80`;

const DEFAULT_LINKS = [
  {
    num: "01",
    label: "The Gathering",
    sub: "ABOUT US",
    href: "#",
    bg: unsplash("photo-1749330513873-09ffa91b0aae"),
    bgAlt: "Background image one",
  },
  {
    num: "02",
    label: "Collection",
    sub: "OUR WORK",
    href: "#",
    bg: unsplash("photo-1627896157734-4d7d4388f28b"),
    bgAlt: "Background image two",
  },
  {
    num: "03",
    label: "Journeys",
    sub: "CURATED TOURS",
    href: "#",
    bg: unsplash("photo-1778789172736-e8ba37c71124"),
    bgAlt: "Background image three",
  },
  {
    num: "04",
    label: "Reach Out",
    sub: "CONNECT WITH US",
    href: "#",
    bg: unsplash("photo-1778961938903-96617183f739"),
    bgAlt: "Background image four",
  },
];

export default function MountainMenu({
  logoTextTop = "STUDIO",
  logoTextBottom = "HOME",
  linksData = DEFAULT_LINKS,
  heroImage = unsplash("photo-1743309411498-a0f4f4b96b65"),
  heroAlt = "Hero background",
  videoSrc = "https://www.pexels.com/download/video/12426854/",
  toggleLabel = "Toggle menu",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = () => {
    setIsOpen((open) => !open);
    setActiveIndex(null);
  };

  const baseOpacity = !isOpen
    ? "opacity-100"
    : activeIndex === null
      ? "opacity-40"
      : "opacity-10";

  const scrim = !isOpen
    ? "bg-black/30"
    : activeIndex !== null
      ? "bg-black/65"
      : "bg-black/45";

  return (
    <div
      className={`${serif.variable} ${sans.variable} relative h-screen w-full select-none overflow-hidden bg-black text-white antialiased [font-family:var(--font-sans)] ${className}`}
    >
      <div className="absolute left-10 top-10 z-[99] cursor-pointer text-left text-xs uppercase tracking-[0.3em] mix-blend-difference transition-opacity duration-300 hover:opacity-70">
        <div className="font-semibold tracking-[0.25em]">{logoTextTop}</div>
        <div className="mt-1 text-[10px] font-light tracking-[0.4em] opacity-40">
          {logoTextBottom}
        </div>
      </div>

      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
        {videoSrc ? (
          <video
            loop
            muted
            autoPlay
            playsInline
            src={videoSrc}
            poster={heroImage}
            className={`absolute inset-0 h-full w-full scale-[1.03] object-cover transition-opacity duration-700 ease-in-out ${baseOpacity}`}
          />
        ) : (
          <img
            src={heroImage}
            alt={heroAlt}
            className={`absolute inset-0 h-full w-full scale-[1.03] object-cover transition-opacity duration-700 ease-in-out ${baseOpacity}`}
          />
        )}

        {linksData.map((link, i) => {
          const visible = isOpen && activeIndex === i;
          return (
            <img
              key={i}
              src={link.bg}
              alt={link.bgAlt ?? ""}
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
            />
          );
        })}

        <div
          className={`pointer-events-none absolute inset-0 backdrop-blur-[1px] transition-colors duration-500 ease-out ${scrim}`}
        />
      </div>

      <div
        className={`absolute bottom-12 right-6 z-10 flex w-full max-w-xl flex-col items-end transition-all duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:bottom-16 sm:right-12 md:bottom-20 md:right-20 ${isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[30px] opacity-0"
          }`}
      >
        <nav className="flex w-full flex-col space-y-4 text-right md:space-y-5">
          {linksData.map((link, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              className="group relative flex cursor-pointer flex-col items-end overflow-hidden border-b border-white/5 pb-3"
            >
              <div className="mb-1 flex items-center space-x-3 transition-transform duration-500 group-hover:-translate-x-1">
                <span className="text-[9px] font-light uppercase tracking-[0.15em] text-white/30 group-hover:text-white/60">
                  {link.sub}
                </span>
                <span className="text-[10px] font-light tracking-widest opacity-20 group-hover:opacity-40">
                  {link.num}
                </span>
              </div>

              <a
                href={link.href}
                className="inline-block text-3xl font-normal italic text-white/70 transition-all duration-500 [font-family:var(--font-serif)] group-hover:-translate-x-2 group-hover:text-white sm:text-4xl md:text-5xl"
              >
                {link.label}
              </a>

              <span className="absolute bottom-0 right-0 h-px w-0 bg-white/40 transition-all duration-500 ease-out group-hover:w-1/2" />
            </div>
          ))}
        </nav>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={toggleLabel}
        aria-expanded={isOpen}
        className="absolute right-10 top-10 z-[99] flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-black/60"
      >
        <div className="relative flex h-4 w-5 flex-col justify-between p-0.5">
          <span
            className={`h-[1.5px] w-full origin-center bg-white transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
          />
          <span
            className={`h-[1.5px] w-full origin-center bg-white transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
          />
        </div>
      </button>
    </div>
  );
}