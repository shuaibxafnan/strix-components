"use client";

import { useState, useRef, useEffect } from "react";

// ─── ModernZoomableGallery ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images          array    [...]     Enhanced content objects containing images, contextual titles, indices, and credits
// zoomFactor      number   2.2       Premium magnification scale factor for crisp rendering
// lensSize        number   140       Diameter of the glassmorphic viewport lens (px)
// cardWidth       string   "max-w-xl" Contemporary layout width restriction constraints
// ──────────────────────────────────────────────────────────────────────────

export default function ZoomableImageStack({
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

    // Calculate cursor positions matching relative element spaces
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    // Center lens accurately over the precise cursor midpoint
    const lensLeft = localX - lensSize / 2;
    const lensTop = localY - lensSize / 2;

    // Map background positioning inversely proportional to zoom dynamics
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
    <div className="bg-[#0b0c10] text-[#e5e7eb] font-sans min-h-screen py-24 px-4 selection:bg-[#9ab504] selection:text-black antialiased">
      <div className="max-w-3xl mx-auto mb-20 text-center">
        <span className="text-[10px] tracking-[0.3em] text-[#9ab504] font-bold uppercase block mb-3">
          Interactive Optics
        </span>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
          Tactile Realism
        </h1>
        <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
      </div>

      <div className="space-y-32 flex flex-col items-center">
        {images.map((img, index) => (
          <div key={index} className={`w-full ${cardWidth} group/card`}>
            {/* Minimalist Header Metadata */}
            <div className="flex justify-between items-baseline mb-4 px-1">
              <span className="text-xs font-mono text-zinc-500">
                [ 0{index + 1} // CATALOG ]
              </span>
              <span className="text-xs font-medium text-zinc-400 bg-zinc-900/60 px-2.5 py-1 rounded-full border border-zinc-800/40 backdrop-blur-sm">
                {img.tag}
              </span>
            </div>

            {/* Premium Container Card Framework */}
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

              {/* Seamless Cinematic Shadow Vignette overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/10 mix-blend-multiply" />

              {/* Floating Curated Lens Element */}
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

            {/* Contemporary Typography Block */}
            <div className="mt-6 px-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h3 className="text-lg font-medium text-white tracking-tight leading-snug">
                  {img.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Exhibition Archive Specimen
                </p>
              </div>
              <div className="text-xs font-mono text-zinc-400 sm:text-right mt-1 sm:mt-0">
                <span className="text-zinc-600 block sm:inline mr-1">
                  Captured by
                </span>
                <a
                  href={img.creditLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[#9ab504] transition-colors underline decoration-zinc-800 underline-offset-4 hover:decoration-[#9ab504]"
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
