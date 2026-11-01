"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function FlipGridSizeSwitch({
  initialLayout = "large",
  duration = 0.8,
  ease = "power2.inOut",
  images = DEFAULT_IMAGES,
  smallLabel = "Small View",
  largeLabel = "Large View",
  itemLabel = "ITEM",
  imageAlt = "Gallery image",
  backgroundColor = "#0a0a0a",
  textColor = "#fafafa",
  activeBtnClass = "bg-amber-500 text-neutral-900 border-amber-500 hover:bg-amber-400 font-semibold shadow-md shadow-amber-500/10",
  disabledBtnClass = "bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-50",
  className = "",
}) {
  const [layout, setLayout] = useState(initialLayout);
  const containerRef = useRef(null);
  const libsRef = useRef(null);
  const tweenRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/Flip")]).then(([g, f]) => {
      if (cancelled) return;
      const gsap = g.gsap || g.default;
      const Flip = f.Flip || f.default;
      gsap.registerPlugin(Flip);
      libsRef.current = { gsap, Flip };
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (tweenRef.current) tweenRef.current.kill();
      tweenRef.current = null;
    };
  }, []);

  const handleLayoutChange = (nextLayout) => {
    if (layout === nextLayout) return;

    const libs = libsRef.current;
    if (!libs || !containerRef.current) {
      setLayout(nextLayout);
      return;
    }
    const { gsap, Flip } = libs;

    const targets = gsap.utils.toArray(
      containerRef.current.querySelectorAll(".gallery-item"),
    );
    const state = Flip.getState(targets);

    setLayout(nextLayout);

    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      tweenRef.current = Flip.from(state, {
        duration: duration,
        ease: ease,
        absolute: true,
        stagger: 0.02,
      });
    });
  };

  return (
    <div
      className={`w-full font-sans p-6 md:p-12 ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center mb-12">
        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => handleLayoutChange("small")}
            disabled={layout === "small"}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${layout === "small" ? disabledBtnClass : activeBtnClass}`}
          >
            {smallLabel}
          </button>
          <button
            onClick={() => handleLayoutChange("large")}
            disabled={layout === "large"}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${layout === "large" ? disabledBtnClass : activeBtnClass}`}
          >
            {largeLabel}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto overflow-hidden">
        <div
          ref={containerRef}
          className="flex flex-wrap justify-center gap-y-6 -mx-3"
        >
          {images.map((url, idx) => (
            <div
              key={idx}
              className={`gallery-item px-3 h-[300px] md:h-[400px] transition-[flex-basis] duration-0 ${layout === "small"
                  ? "flex-none basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-[16.66667%]"
                  : "flex-none basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                }`}
            >
              <div className="w-full h-[90%] group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-md transition-all duration-300 hover:border-neutral-700 hover:shadow-xl">
                <img
                  src={url}
                  alt={`${imageAlt} ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs font-mono tracking-wider text-neutral-300 bg-neutral-950/80 backdrop-blur-sm px-2 py-1 rounded">
                    {itemLabel} #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
