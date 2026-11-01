"use client";

import { useEffect, useState, useCallback } from "react";

const defaultSlides = [
  {
    id: "tokyo",
    city: "Explore Tokyo",
    href: "#",
    description:
      "Tokyo, Japan's busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.",
    imageUrl:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "kyoto",
    city: "Explore Kyoto",
    href: "#",
    description:
      "Kyoto is famous for its numerous classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.",
    imageUrl:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "osaka",
    city: "Explore Osaka",
    href: "#",
    description:
      "Osaka is a large port city and commercial center known for its modern architecture, nightlife and hearty street food.",
    imageUrl:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "hokkaido",
    city: "Explore Hokkaido",
    href: "#",
    description:
      "Hokkaido, the northernmost of Japan's main islands, is known for its volcanoes, natural hot springs and ski areas.",
    imageUrl:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=1600&q=80",
  },
];

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

function SlideItem({ slide, isActive, accentColor, label, textColor, mutedColor, backgroundColor }) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isActive) setAnimKey((k) => k + 1);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <li className="block">
      <div
        key={`img-wrap-${animKey}`}
        className="relative overflow-hidden w-full"
      >
        <img
          src={slide.imageUrl}
          alt={slide.city}
          className="w-full h-[50vh] md:h-[65vh] object-cover block"
        />
        <span className="absolute inset-0 origin-right pointer-events-none z-20 [animation:revealRight_1s_cubic-bezier(0.23,1,0.75,1)_forwards]" style={{ backgroundColor }} />
        <div
          key={`desktop-title-${animKey}`}
          className="hidden md:flex absolute left-0 bottom-0 z-10 opacity-0 [animation:fadeInUp_0.7s_0.55s_ease_forwards]"
        >
          <a href={slide.href} className="group block">
            <div className="px-8 pt-8 pb-6 max-w-[320px]" style={{ backgroundColor }}>
              <p
                className="text-xs uppercase tracking-[0.18em] mb-3 font-semibold"
                style={{ color: accentColor }}
              >
                {label}
              </p>
              <h1 style={{ color: textColor }} className="text-[2.6rem] xl:text-[3.2rem] font-semibold leading-[1.05] underline decoration-[1.5px] underline-offset-4 group-hover:opacity-70 transition-opacity">
                {slide.city}
              </h1>
            </div>
          </a>
        </div>
        <div
          className="hidden md:block absolute inset-x-0 bottom-0 h-32 pointer-events-none z-[5]"
          style={{
            background: `linear-gradient(to top, ${backgroundColor}99 0%, transparent 100%)`,
          }}
        />
      </div>
      <div className="md:hidden mt-5 mb-1">
        <div
          key={`mob-title-${animKey}`}
          className="opacity-0 [animation:fadeIn_0.8s_0.4s_ease_forwards]"
        >
          <p
            className="text-xs uppercase tracking-[0.18em] mb-2 font-semibold"
            style={{ color: accentColor }}
          >
            {label}
          </p>
          <a href={slide.href}>
            <h1 style={{ color: textColor }} className="text-[1.9rem] font-semibold leading-[1.1] underline decoration-2 underline-offset-4">
              {slide.city}
            </h1>
          </a>
        </div>
      </div>
      <div className="mt-4 md:mt-5 max-w-2xl">
        <p
          key={`desc-${animKey}`}
          style={{ color: mutedColor }}
          className="text-[0.95rem] md:text-[1.1rem] leading-relaxed opacity-0 [animation:fadeIn_0.8s_0.7s_ease_forwards]"
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

export default function DestinationSlider({
  slides = defaultSlides,
  accentColor = "#e83f43",
  label = "Destination",
  textColor = "#232323",
  mutedColor = "#8d8d8d",
  backgroundColor = "#ffffff",
  autoPlay = false,
  autoPlayInterval = 4000,
  showDots = true,
  showCounter = true,
  className = "",
}) {
  const [count, setCount] = useState(0);
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
    <div
      className={`w-full overflow-x-hidden text-[1.125rem] font-normal leading-[1.6] ${className}`}
      style={{ backgroundColor, color: mutedColor }}
    >
      <main className="px-5 md:px-10 pt-5 md:pt-6">
        <div className="max-w-6xl mx-auto">
          <ul className="list-none m-0 p-0">
            {slides.map((slide, i) => (
              <SlideItem
                key={slide.id}
                slide={slide}
                isActive={i === count}
                accentColor={accentColor}
                label={label}
                textColor={textColor}
                mutedColor={mutedColor}
                backgroundColor={backgroundColor}
              />
            ))}
          </ul>
          <div className="flex items-center justify-between mt-5 md:mt-6 pb-8">
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
            <div className="flex">
              <button
                onClick={showPrevious}
                aria-label="Previous slide"
                className="w-[52px] h-[52px] flex items-center justify-center border bg-transparent cursor-pointer transition-opacity duration-200 hover:opacity-60"
                style={{ borderColor: textColor, color: textColor }}
              >
                <ArrowLeft />
              </button>
              <button
                onClick={showNext}
                aria-label="Next slide"
                className="w-[52px] h-[52px] flex items-center justify-center border-t border-r border-b bg-transparent cursor-pointer transition-opacity duration-200 hover:opacity-60"
                style={{ borderColor: textColor, color: textColor }}
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
