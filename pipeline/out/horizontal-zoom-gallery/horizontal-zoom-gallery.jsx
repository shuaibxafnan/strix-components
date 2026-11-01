"use client";

import { useId } from "react";

const DEFAULT_ITEMS = [
  "photo-1618005182384-a83a8bd57fbe",
  "photo-1634017839464-5c339ebe3cb4",
  "photo-1604871000636-074fa5117945",
  "photo-1614850523459-c2f4c699c52e",
  "photo-1633167606207-d840b5070fc2",
  "photo-1607604276583-eef5d076aa5f",
].map((id, i) => ({
  src: `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`,
  alt: `Gallery image ${i + 1}`,
  label: `Exhibit // 0${i + 1}`,
  title: "Minimal Artifact",
}));

export default function HorizontalZoomGallery({
  items = DEFAULT_ITEMS,
  scaleAmount = 1.35,
  hintText = "[ Scroll Sideways to Explore ]",
  backgroundColor = "#09090b",
  textColor = "#f5f5f5",
  accentColor = "#E2E8F0",
  className = "",
}) {
  const componentId = useId().replace(/:/g, "");

  return (
    <div
      className={`relative w-full antialiased selection:bg-white/10 ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar-${componentId}::-webkit-scrollbar { display: none; }
        .hide-scrollbar-${componentId} { -ms-overflow-style: none; scrollbar-width: none; }

        @supports (animation-timeline: scroll()) {
          .zoom-track-${componentId} {
            view-timeline: --track inline;
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

      <div className="relative w-full h-screen flex items-center justify-center">
        <div
          className={`hide-scrollbar-${componentId} flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth py-24 px-[max(4vw,1.5rem)] gap-8 md:gap-16`}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`zoom-track-${componentId} relative aspect-[3/4] w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[28vw] shrink-0 snap-center group`}
            >
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-2xl transition-all duration-500 ease-out group-hover:ring-white/20">
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`zoom-img-${componentId} w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform`}
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/20 opacity-90 transition-opacity duration-500 group-hover:opacity-70" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-1 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
                    {item.label}
                  </span>
                  <h3 className="text-lg md:text-xl font-medium tracking-tight text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="fixed bottom-12 left-12 hidden lg:flex flex-col gap-2 text-[11px] font-mono tracking-widest uppercase z-10 pointer-events-none"
          style={{ color: accentColor }}
        >
          <div>{hintText}</div>
        </div>
      </div>
    </div>
  );
}
