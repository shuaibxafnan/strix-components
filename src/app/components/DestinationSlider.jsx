"use client";

import { useEffect, useState, useCallback } from "react";

const defaultSlides = [
  {
    id: "tokyo",
    city: "Explore Tokyo",
    description:
      "Tokyo, Japan's busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.",
    imageUrl:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "kyoto",
    city: "Explore Kyoto",
    description:
      "Kyoto is famous for its numerous classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.",
    imageUrl:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "osaka",
    city: "Explore Osaka",
    description:
      "Osaka is a large port city and commercial center known for its modern architecture, nightlife and hearty street food.",
    imageUrl:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "hokkaido",
    city: "Explore Hokkaido",
    description:
      "Hokkaido, the northernmost of Japan's main islands, is known for its volcanoes, natural hot springs and ski areas.",
    imageUrl:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=1600&q=80",
  },
];

const defaultNavLinks = [
  { label: "About", href: "#" },
  { label: "Discover", href: "#" },
  { label: "Plan Your Trip", href: "#" },
];

// ── Arrow icons ────────────────────────────────────────────────────────────
function ArrowLeft() {
  return (
    <span className="relative inline-block w-5 h-px bg-current">
      <span className="absolute left-px top-[-4px] w-[9px] h-[9px] border-t border-r border-current rotate-[-135deg]" />
    </span>
  );
}

function ArrowRight() {
  return (
    <span className="relative inline-block w-5 h-px bg-current">
      <span className="absolute right-px top-[-4px] w-[9px] h-[9px] border-t border-r border-current rotate-45" />
    </span>
  );
}

// ── SlideItem ──────────────────────────────────────────────────────────────
function SlideItem({ slide, isActive, accentColor }) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isActive) setAnimKey((k) => k + 1);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <li className="block">
      {/* ── Full-width image container with overlaid title ── */}
      <div
        key={`img-wrap-${animKey}`}
        className="relative overflow-hidden w-full"
      >
        {/* Image */}
        <img
          src={slide.imageUrl}
          alt={slide.city}
          className="w-full h-[50vh] md:h-[65vh] object-cover block"
        />

        {/* White reveal overlay — sweeps left to right off the image */}
        <span className="absolute inset-0 bg-white origin-right pointer-events-none z-20 [animation:revealRight_1s_cubic-bezier(0.23,1,0.75,1)_forwards]" />

        {/* ── Desktop: title card pinned to left edge, overlapping image ── */}
        <div
          key={`desktop-title-${animKey}`}
          className="hidden md:flex absolute left-0 bottom-0 z-10 opacity-0 [animation:fadeInUp_0.7s_0.55s_ease_forwards]"
        >
          <a href="#" className="group block">
            <div className="bg-white px-8 pt-8 pb-6 max-w-[320px]">
              {/* Small label */}
              <p
                className="text-xs uppercase tracking-[0.18em] mb-3 font-semibold"
                style={{ color: accentColor }}
              >
                Destination
              </p>
              <h1 className="text-[2.6rem] xl:text-[3.2rem] font-semibold leading-[1.05] text-[#232323] underline decoration-[1.5px] underline-offset-4 group-hover:opacity-70 transition-opacity">
                {slide.city}
              </h1>
            </div>
          </a>
        </div>

        {/* ── Gradient scrim for bottom of image (desktop) ── */}
        <div
          className="hidden md:block absolute inset-x-0 bottom-0 h-32 pointer-events-none z-[5]"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,0.6) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Mobile title (below image) ── */}
      <div className="md:hidden mt-5 mb-1">
        <div
          key={`mob-title-${animKey}`}
          className="opacity-0 [animation:fadeIn_0.8s_0.4s_ease_forwards]"
        >
          <p
            className="text-xs uppercase tracking-[0.18em] mb-2 font-semibold"
            style={{ color: accentColor }}
          >
            Destination
          </p>
          <a href="#">
            <h1 className="text-[1.9rem] font-semibold leading-[1.1] text-[#232323] underline decoration-2 underline-offset-4">
              {slide.city}
            </h1>
          </a>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="mt-4 md:mt-5 max-w-2xl">
        <p
          key={`desc-${animKey}`}
          className="text-[0.95rem] md:text-[1.1rem] text-[#8d8d8d] leading-relaxed opacity-0 [animation:fadeIn_0.8s_0.7s_ease_forwards]"
        >
          {slide.description}
        </p>
      </div>

      <style>{`
        @keyframes revealRight {
          0%   { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        @keyframes fadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </li>
  );
}

// ── JapanSlider ─────────────────────────────────────────────────────────────
export default function DestinationSlider({
  slides = defaultSlides,
  accentColor = "#e83f43",
  logoText = "Japan",
  navLinks = defaultNavLinks,
  autoPlay = false,
  autoPlayInterval = 4000,
  showDots = true,
  showCounter = true,
}) {
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = slides.length;

  const showNext = useCallback(() => {
    setCount((c) => (c < itemCount - 1 ? c + 1 : 0));
  }, [itemCount]);

  const showPrevious = useCallback(() => {
    setCount((c) => (c > 0 ? c - 1 : itemCount - 1));
  }, [itemCount]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") showPrevious();
      if (e.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showNext, showPrevious]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(showNext, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval, showNext]);

  const pad = (n) => String(n + 1).padStart(2, "0");

  return (
    <div className="font-['Barlow',sans-serif] text-[1.125rem] font-normal leading-[1.6] text-[#8d8d8d] bg-white overflow-x-hidden min-h-screen">
      {/* ── Nav ── */}
      <nav className="relative z-20 px-5 md:px-10 py-5 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-[#232323] font-bold text-[1.1rem] md:text-[1.2rem] m-0 tracking-tight">
              {logoText}
              <span style={{ color: accentColor }}>.</span>
            </p>

            {/* Desktop links */}
            <ul className="hidden md:flex gap-10 list-none m-0 p-0">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.78rem] uppercase tracking-[0.14em] text-[#8d8d8d] hover:text-[#232323] transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-sm text-[#8d8d8d] flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 font-['Barlow',sans-serif]"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              Menu
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {menuOpen && (
            <ul className="md:hidden mt-3 flex flex-col items-center gap-4 list-none p-5 bg-white border-t border-gray-100">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm uppercase tracking-widest text-[#8d8d8d] hover:text-[#232323] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* ── Slider ── */}
      <main className="px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <ul className="list-none m-0 p-0">
            {slides.map((slide, i) => (
              <SlideItem
                key={slide.id}
                slide={slide}
                isActive={i === count}
                accentColor={accentColor}
              />
            ))}
          </ul>

          {/* ── Controls row ── */}
          <div className="flex items-center justify-between mt-5 md:mt-6 pb-8">
            {/* Left: dots + counter */}
            <div className="flex items-center gap-5">
              {showDots && (
                <div className="flex items-center gap-[6px]">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setCount(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="p-0 border-0 bg-transparent cursor-pointer rounded-full transition-all duration-300"
                      style={{
                        width: i === count ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: i === count ? accentColor : "#d1d1d1",
                      }}
                    />
                  ))}
                </div>
              )}
              {showCounter && (
                <span className="text-[0.78rem] tracking-[0.1em] text-[#b0b0b0] font-medium tabular-nums">
                  {pad(count)} <span className="text-[#d8d8d8]">/</span>{" "}
                  {pad(itemCount - 1)}
                </span>
              )}
            </div>

            {/* Right: prev / next buttons */}
            <div className="flex">
              <button
                onClick={showPrevious}
                aria-label="Previous slide"
                className="w-[52px] h-[52px] flex items-center justify-center border border-[#232323] text-[#232323] bg-transparent cursor-pointer hover:bg-[#232323] hover:text-white transition-colors duration-200"
              >
                <ArrowLeft />
              </button>
              <button
                onClick={showNext}
                aria-label="Next slide"
                className="w-[52px] h-[52px] flex items-center justify-center border-t border-r border-b border-[#232323] text-[#232323] bg-transparent cursor-pointer hover:bg-[#232323] hover:text-white transition-colors duration-200"
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
