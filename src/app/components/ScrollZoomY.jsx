"use client";

import { useId } from "react";

// ─── ScrollZoomY ────────────────────────────────────
// images          string[]   List of clean, high-res portrait/landscape imagery
// scaleAmount     number     Final scale factor modifier (default: 1.35)
// accentColor     string     Sleek text accent / highlight hue
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop",
];

export default function ScrollZoomY({
  images = DEFAULT_IMAGES,
  scaleAmount = 1.35,
  accentColor = "#E2E8F0",
}) {
  const componentId = useId().replace(/:/g, "");

  return (
    <div className="relative w-full bg-zinc-950 text-neutral-100 antialiased selection:bg-white/10">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar-${componentId}::-webkit-scrollbar { display: none; }
        .hide-scrollbar-${componentId} { -ms-overflow-style: none; scrollbar-width: none; }

        @supports (animation-timeline: scroll()) {
          .zoom-track-${componentId} {
            view-timeline: --track block;
          }
          .zoom-img-${componentId} {
            animation: modernZoom-${componentId} linear both;
            animation-timeline: --track;
            animation-range: entry 0% exit 100%;
          }
          @keyframes modernZoom-${componentId} {
            0% { transform: scale(1); filter: brightness(0.65) grayscale(0.2); }
            50% { transform: scale(${scaleAmount}); filter: brightness(1.1) grayscale(0); }
            100% { transform: scale(1); filter: brightness(0.65) grayscale(0.2); }
          }
        }
      `,
        }}
      />

      {/* Main Vertical Feed */}
      <div className="relative w-full flex flex-col items-center justify-center">
        <div
          className={`hide-scrollbar-${componentId} flex flex-col items-center w-full py-24 px-6 gap-12 md:gap-20`}
        >
          {images.map((src, index) => (
            <div
              key={index}
              className={`zoom-track-${componentId} relative aspect-square w-full max-w-[85vw] sm:max-w-[55vw] md:max-w-[42vw] lg:max-w-[30vw] xl:max-w-[24vw] shrink-0 snap-center group`}
            >
              {/* Card Container Layout */}
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-500 ease-out group-hover:ring-white/20">
                <img
                  src={src}
                  alt={`Gallery project collection node ${index + 1}`}
                  className={`zoom-img-${componentId} w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform`}
                  loading="lazy"
                />

                {/* Dark atmospheric mask gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />

                {/* Typography metadata */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-1 transition-all transform translate-y-1 group-hover:translate-y-0 duration-300">
                  <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 uppercase">
                    Exhibit // 0${index + 1}
                  </span>
                  <h3 className="text-lg md:text-xl font-medium tracking-tight text-white">
                    Minimal Artifact
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
