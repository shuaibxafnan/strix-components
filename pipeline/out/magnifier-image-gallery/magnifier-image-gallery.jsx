"use client";

import { useState, useRef, useEffect } from "react";

export default function MagnifierImageGallery({
  images = [
    {
      src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2043&q=80",
      alt: "Feline Portrait",
      title: "Serenade in the Shadows",
      tag: "Exotic Shorthair",
      credit: "Manja Vitolic",
      creditLink: "https://unsplash.com/@madhatterzone",
    },
    {
      src: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      alt: "Cat Studio Portrait",
      title: "Elegance of the Domestic Form",
      tag: "Tabby Native",
      credit: "Jae Park",
      creditLink: "https://unsplash.com/@jaehunpark",
    },
  ],
  zoomFactor = 2.2,
  lensSize = 140,
  cardWidth = "max-w-xl",
  catalogLabel = "CATALOG",
  subtitle = "Exhibition Archive Specimen",
  creditLabel = "Captured by",
  backgroundColor = "#0b0c10",
  textColor = "#e5e7eb",
  accentColor = "#9ab504",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeState, setActiveState] = useState({
    index: null,
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
    imgWidth: 0,
    visible: false,
  });

  const imgRefs = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleMouseMove = (e, index) => {
    const item = imgRefs.current[index];
    if (!item) return;

    const rect = item.getBoundingClientRect();

    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    const lensLeft = localX - lensSize / 2;
    const lensTop = localY - lensSize / 2;

    const bgX = -localX * zoomFactor + lensSize / 2;
    const bgY = -localY * zoomFactor + lensSize / 2;

    setActiveState({
      index,
      x: lensLeft,
      y: lensTop,
      bgX,
      bgY,
      imgWidth: rect.width,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setActiveState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      className={`font-sans py-24 px-4 selection:bg-[var(--mig-accent)] selection:text-black antialiased ${className}`}
      style={{ backgroundColor, color: textColor, "--mig-accent": accentColor }}
    >
      <div className="space-y-32 flex flex-col items-center">
        {images.map((img, index) => (
          <div key={index} className={`w-full ${cardWidth} group/card`}>
            <div className="flex justify-between items-baseline mb-4 px-1">
              <span className="text-xs font-mono text-zinc-500">
                [ 0{index + 1} // {catalogLabel} ]
              </span>
              <span className="text-xs font-medium text-zinc-400 bg-zinc-900/60 px-2.5 py-1 rounded-full border border-zinc-800/40 backdrop-blur-sm">
                {img.tag}
              </span>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl transition-all duration-700 ease-out will-change-transform group-hover/card:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] group-hover/card:border-zinc-800"
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
            >
              <img
                ref={(el) => (imgRefs.current[index] = el)}
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-cover opacity-90 transition-all duration-700 ease-out grayscale-[20%] group-hover/card:grayscale-0 group-hover/card:scale-[1.02] cursor-none"
              />

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/10 mix-blend-multiply" />

                {activeState.index === index && (
                <div
                  className={`absolute pointer-events-none rounded-full border border-white/30 bg-no-repeat shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(212,212,216,0.2)] transition-opacity duration-300 ease-out backdrop-blur-[1px]`}
                  style={{
                    width: `${lensSize}px`,
                    height: `${lensSize}px`,
                    left: `${activeState.x}px`,
                    top: `${activeState.y}px`,
                    backgroundImage: `url('${img.src}')`,
                    backgroundSize: `${activeState.imgWidth * zoomFactor}px`,
                    backgroundPosition: `${activeState.bgX}px ${activeState.bgY}px`,
                    opacity: activeState.visible ? 1 : 0,
                  }}
                />
              )}
            </div>

            <div className="mt-6 px-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h3 className="text-lg font-medium text-white tracking-tight leading-snug">
                  {img.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {subtitle}
                </p>
              </div>
              <div className="text-xs font-mono text-zinc-400 sm:text-right mt-1 sm:mt-0">
                <span className="text-zinc-600 block sm:inline mr-1">
                  {creditLabel}
                </span>
                <a
                  href={img.creditLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[var(--mig-accent)] transition-colors underline decoration-zinc-800 underline-offset-4 hover:decoration-[var(--mig-accent)]"
                >
                  {img.credit}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
