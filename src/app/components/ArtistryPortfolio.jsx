"use client";

import React, { useState, useEffect } from "react";

/**
 * ModernMinimalPortfolio
 *
 * @param {string} title - The large structural title for the hero section
 * @param {string} aboutText - Main bio or artist statement
 * @param {string} quote - Centered emphasis quote or philosophy line
 * @param {string} email - Contact and footer email endpoint
 * @param {Array<string>} images - Array of exactly 4 strings containing valid image paths/URLs for the grid
 * @param {Array<{year: string, title: string, location: string, type: string}>} exhibitions - Chronology array
 */
export default function ModernMinimalPortfolio({
  title = "The Architecture of Silent Canvas.",
  aboutText = "I am a visual artist exploring the intersection of mental landscapes and corporal reality. Through stark structures and negative space, my canvas strips away chaos to present what remains.",
  quote = '"When the mind becomes a labyrinth of anxious thoughts, art offers a thin structural thread back to reality."',
  email = "hi@filip.fyi",
  images = [
    "https://cdn.cosmos.so/3be2e4e2-4ba8-47c2-9bd7-6b09cc6b82e3?format=jpeg",
    "https://cdn.cosmos.so/91da03b4-8f72-40bd-9531-ce101ecb9508?format=jpeg",
    "https://cdn.cosmos.so/9dbf17e4-d4fa-4095-98dd-d6527d4bb53a?format=jpeg",
    "https://cdn.cosmos.so/bed49b37-4a4a-4cec-ac80-86f5d2edbb8d?format=jpeg",
  ],
  exhibitions = [
    {
      year: "2026",
      title: "Monolithic Void",
      location: "Metropolitan Gallery, Berlin",
      type: "Solo Exhibition",
    },
    {
      year: "2025",
      title: "Brutalist Mindscapes",
      location: "Espace Minimal, Paris",
      type: "Group Show",
    },
    {
      year: "2024",
      title: "Echoes of Silence",
      location: "Somerset House, London",
      type: "Curated Showcase",
    },
    {
      year: "2023",
      title: "Anxious Geometry",
      location: "Modernist Archive, New York",
      type: "Solo Debut",
    },
  ],
}) {
  // Fix hydration issues by only rendering client-dependent elements after mount
  const [mounted, setMounted] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent flash or server/client attribute mismatch during initial SSR compilation
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fbfbfa] text-[#1c1c1b] flex items-center justify-center font-mono text-xs tracking-widest">
        LOADING / ARTISTRY
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#fbfbfa] text-[#1c1c1b] selection:bg-zinc-200 antialiased font-sans">
      {/* Subtle Film Grain Overlay */}
      <div className="film-grain fixed inset-0 pointer-events-none z-[90] opacity-[0.15]" />

      {/* RE-DESIGNED HEADER */}
      <header className="fixed top-0 left-0 w-full bg-[#fbfbfa]/70 backdrop-blur-md py-6 z-50 border-b border-zinc-100 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Enhanced Logo Typography */}
          <div className="flex flex-col">
            <span className="text-base font-black tracking-[0.25em] uppercase leading-none">
              FILIP . FYI
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 mt-1 uppercase">
              Visual Archetype Studio
            </span>
          </div>

          {/* Interactive Navigation Track */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-12">
            <div className="w-full h-[1px] bg-zinc-200/80 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-zinc-900 transition-all duration-300 ease-out"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

          <nav className="flex items-center gap-8 font-mono text-xs tracking-widest">
            {["home", "about", "exhibitions"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                onMouseEnter={() => setHoveredNav(item)}
                onMouseLeave={() => setHoveredNav(null)}
                className="relative py-1 text-[#1c1c1b] transition-opacity duration-300"
                style={{
                  opacity: hoveredNav && hoveredNav !== item ? 0.4 : 1,
                }}
              >
                {item}
                {hoveredNav === item && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-900 animate-fade-in" />
                )}
              </a>
            ))}

            <a
              href={`mailto:${email}`}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#1c1c1b] text-white hover:bg-zinc-800 transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-40 space-y-40 md:space-y-56">
        {/* HERO SECTION */}
        <section
          id="home"
          className="min-h-[75vh] flex flex-col justify-center pt-4"
        >
          <div className="w-full mb-12 md:mb-20 overflow-hidden">
            <h1 className="text-[10vw] md:text-[7.5vw] font-extralight tracking-tighter leading-[0.9] uppercase whitespace-pre-line">
              {title}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="col-span-1 md:col-span-7 relative group overflow-hidden bg-zinc-100 aspect-[4/5] md:aspect-[16/10]">
              <img
                src="https://cdn.cosmos.so/2200c8e1-2901-4fdb-806c-a2596b3e9c49?format=jpeg"
                alt="Primary Visual Canvas Archetype Portrait"
                className="w-full h-full object-cover grayscale contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            <div className="col-span-1 md:col-span-5 flex flex-col justify-end pt-4 md:pt-12">
              <div className="h-[1px] w-16 bg-zinc-900 mb-6" />
              <p className="text-base md:text-lg font-light leading-relaxed text-zinc-600 max-w-md">
                {aboutText}
              </p>
            </div>
          </div>
        </section>

        {/* GALLERY GRID */}
        <section id="about" className="w-full space-y-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {images.slice(0, 4).map((src, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-zinc-100 overflow-hidden relative group"
              >
                <img
                  src={src}
                  alt={`Symmetric Gallery Display Item ${i + 1}`}
                  className="w-full h-full object-cover grayscale contrast-105 transition-all duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {quote && (
            <div className="max-w-3xl mx-auto text-center pt-4">
              <p className="text-base md:text-xl font-serif italic leading-relaxed text-zinc-700">
                {quote}
              </p>
            </div>
          )}
        </section>

        {/* EXHIBITIONS CHRONOLOGY SECTION */}
        <section
          id="exhibitions"
          className="w-full border-t border-zinc-200/80 pt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="col-span-1 md:col-span-4">
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400 sticky top-32">
                Selected Exhibitions / <br />
                Chronology
              </h2>
            </div>

            <div className="col-span-1 md:col-span-8 divide-y divide-zinc-200/60 font-sans">
              {exhibitions.map((exhibit, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 py-6 gap-2 group hover:bg-zinc-50 transition-colors px-2"
                >
                  <div className="col-span-2 font-mono text-xs text-zinc-400 pt-1">
                    {exhibit.year}
                  </div>
                  <div className="col-span-6">
                    <h3 className="text-base font-medium tracking-tight text-zinc-900 group-hover:translate-x-1 transition-transform duration-300">
                      {exhibit.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {exhibit.location}
                    </p>
                  </div>
                  <div className="col-span-4 text-right font-mono text-xs text-zinc-400 pt-1">
                    {exhibit.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* RE-DESIGNED PREMIUM FOOTER */}
      <footer className="w-full border-t border-zinc-200/60 mt-40 bg-zinc-900 text-zinc-100 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-8 md:space-y-0">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400 block">
                Available for Global Collaborations
              </span>
              <a
                href={`mailto:${email}`}
                className="text-2xl md:text-4xl font-extralight tracking-tight text-white hover:text-zinc-300 transition-colors border-b border-zinc-700 pb-1"
              >
                {email}
              </a>
            </div>

            <div className="flex gap-16 font-mono text-xs tracking-wider text-zinc-400">
              <div className="flex flex-col space-y-2">
                <span className="text-white font-sans uppercase text-[10px] tracking-[0.2em]">
                  Socials
                </span>
                <a
                  href="#instagram"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="#twitter"
                  className="hover:text-white transition-colors"
                >
                  Twitter
                </a>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-white font-sans uppercase text-[10px] tracking-[0.2em]">
                  Studio
                </span>
                <span>Stockholm, SE</span>
                <span>Remote / Worldwide</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-zinc-800" />

          <div className="flex flex-col md:flex-row items-center justify-between font-mono text-[11px] text-zinc-500 space-y-4 md:space-y-0">
            <div>
              &copy; {new Date().getFullYear()} FILIP.FYI. All Architectural
              Rights Reserved.
            </div>
            <a
              href="#home"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group"
            >
              Back to top
              <span className="group-hover:-translate-y-0.5 transition-transform duration-300">
                ↑
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
