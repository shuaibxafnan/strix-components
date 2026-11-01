"use client";

import { useId } from "react";

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;

const DEFAULT_ITEMS = [
  { src: img("1618005182384-a83a8bd57fbe"), alt: "Gallery image 1", eyebrow: "Exhibit // 01", title: "Minimal Artifact" },
  { src: img("1634017839464-5c339ebe3cb4"), alt: "Gallery image 2", eyebrow: "Exhibit // 02", title: "Minimal Artifact" },
  { src: img("1604871000636-074fa5117945"), alt: "Gallery image 3", eyebrow: "Exhibit // 03", title: "Minimal Artifact" },
  { src: img("1614850523459-c2f4c699c52e"), alt: "Gallery image 4", eyebrow: "Exhibit // 04", title: "Minimal Artifact" },
  { src: img("1633167606207-d840b5070fc2"), alt: "Gallery image 5", eyebrow: "Exhibit // 05", title: "Minimal Artifact" },
  { src: img("1607604276583-eef5d076aa5f"), alt: "Gallery image 6", eyebrow: "Exhibit // 06", title: "Minimal Artifact" },
];

export default function ScrollZoomGallery({
  items = DEFAULT_ITEMS,
  scaleAmount = 1.35,
  bgColor = "#09090b",
  textColor = "#f5f5f5",
  eyebrowColor = "#a3a3a3",
  className = "",
}) {
  const componentId = useId().replace(/:/g, "");

  return (
    <div
      className={`relative w-full antialiased selection:bg-white/10 ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
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

      <div className="relative w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center w-full py-24 px-6 gap-12 md:gap-20">
          {items.map((item, index) => (
            <div
              key={index}
              className={`zoom-track-${componentId} relative aspect-square w-full max-w-[85vw] sm:max-w-[55vw] md:max-w-[42vw] lg:max-w-[30vw] xl:max-w-[24vw] shrink-0 snap-center group`}
            >
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-500 ease-out group-hover:ring-white/20">
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`zoom-img-${componentId} w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform`}
                  loading="lazy"
                />

                <div
                  className="absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-70"
                  style={{
                    backgroundImage: `linear-gradient(to top, ${bgColor}e6, ${bgColor}33, transparent)`,
                  }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-1 transition-all transform translate-y-1 group-hover:translate-y-0 duration-300">
                  <span
                    className="text-[10px] font-mono tracking-[0.3em] uppercase"
                    style={{ color: eyebrowColor }}
                  >
                    {item.eyebrow}
                  </span>
                  <h3 className="text-lg md:text-xl font-medium tracking-tight">
                    {item.title}
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
