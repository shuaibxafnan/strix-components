"use client";

import { useState } from "react";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";

const labelFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic"],
});

const bodyFont = Josefin_Sans({
  subsets: ["latin"],
  weight: ["200", "300"],
});

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=900&q=80",
    alt: "Viola",
  },
  {
    src: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=900&q=80",
    alt: "Mathia",
  },
  {
    src: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=900&q=80",
    alt: "Arctica",
  },
  {
    src: "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=900&q=80",
    alt: "Taria",
  },
];

const NOISE_URL = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

export default function ThumbnailCrossfadeGallery({
  images = DEFAULT_IMAGES,
  heading = "Fluffy Philharmonic",
  description = "Select a performer",
  bgColor = "#000000",
  textColor = "#ffffff",
  accentColor = "#ffffff",
  showNoise = true,
  className = "",
}) {
  const items = images.slice(0, 4);
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${bodyFont.className} relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        "--accent": accentColor,
      }}
    >
      {showNoise && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] opacity-60 mix-blend-overlay"
          style={{ backgroundImage: NOISE_URL }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,color-mix(in_srgb,var(--accent)_8%,transparent)_0%,transparent_70%)]" />

      <div className="relative flex w-full max-w-[520px] flex-col items-center gap-6 px-5 py-8 sm:gap-8 sm:px-8">
        <div className="flex w-full flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
            {description}
          </p>
          <h1
            className={`${labelFont.className} text-center text-[1.75rem] font-light tracking-[0.04em] sm:text-[2rem]`}
          >
            {heading}
          </h1>
        </div>

        <div className="flex w-full gap-2 sm:gap-3">
          <div className="relative aspect-square flex-1 overflow-hidden rounded-[3px] bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {items.map((item, i) => (
              <img
                key={i}
                src={item.src}
                alt={item.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${active === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
              />
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 flex w-fit items-center gap-4 rounded-[4px] border border-white/10 bg-white/10 px-3 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <span
                className={`${labelFont.className} text-[1.1rem] font-light leading-none tracking-[0.04em] text-white`}
              >
                {items[active].alt}
              </span>
              <span className="ml-auto h-1 w-1 rounded-full bg-[color:var(--accent)]" />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                aria-label={item.alt}
                onClick={() => setActive(i)}
                className="block aspect-square w-14 overflow-hidden rounded-[3px] bg-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:w-[4.75rem]"
              >
                <img
                  src={item.src}
                  alt=""
                  className={`h-full w-full object-cover transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.06] hover:opacity-100 hover:shadow-[0_0_0_1px_var(--accent)] ${active === i
                    ? "opacity-100 shadow-[0_0_0_1.5px_var(--accent)]"
                    : "opacity-40"
                    }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}