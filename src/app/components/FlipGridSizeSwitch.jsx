"use client";

import { useEffect, useRef, useState } from "react";

// ─── FlipGridSizeSwitch ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// initialLayout   string    "large"            Starting grid layout state ("small" | "large")
// duration        number    0.8                Animation transition runtime in seconds
// ease            string    "power2.inOut"     GSAP structural positioning easing profile
// images          array     [14 items]         Target array list containing image URL sources
// activeBtnClass  string    [Tailwind Classes] Applied styles for clickable control elements
// disabledBtnClass string   [Tailwind Classes] Applied styles for disabled state indicators
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://assets.codepen.io/16327/portrait-image-1.jpg",
  "https://assets.codepen.io/16327/portrait-image-2.jpg",
  "https://assets.codepen.io/16327/portrait-image-3.jpg",
  "https://assets.codepen.io/16327/portrait-image-4.jpg",
  "https://assets.codepen.io/16327/portrait-image-5.jpg",
  "https://assets.codepen.io/16327/portrait-image-6.jpg",
  "https://assets.codepen.io/16327/portrait-image-7.jpg",
  "https://assets.codepen.io/16327/portrait-image-8.jpg",
  "https://assets.codepen.io/16327/portrait-image-9.jpg",
  "https://assets.codepen.io/16327/portrait-image-10.jpg",
  "https://assets.codepen.io/16327/portrait-image-11.jpg",
  "https://assets.codepen.io/16327/portrait-image-12.jpg",
  "https://assets.codepen.io/16327/portrait-image-13.jpg",
  "https://assets.codepen.io/16327/portrait-image-14.jpg",
];

export default function FlipGridSizeSwitch({
  initialLayout = "large",
  duration = 0.8,
  ease = "power2.inOut",
  images = DEFAULT_IMAGES,
  activeBtnClass = "bg-amber-500 text-neutral-900 border-amber-500 hover:bg-amber-400 font-semibold shadow-md shadow-amber-500/10",
  disabledBtnClass = "bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-50",
}) {
  const [layout, setLayout] = useState(initialLayout);
  const containerRef = useRef(null);

  // Dynamic asynchronous loading of CDN script tags to avoid window/SSR runtime drops
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () =>
          reject(new Error(`Failed to load dependency: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js",
      ),
    ])
      .then(() => {
        const { gsap, Flip } = window;
        if (gsap && Flip) {
          gsap.registerPlugin(Flip);
        }
      })
      .catch((err) =>
        console.error("[FlipGrid] Dependancy initialization failed:", err),
      );
  }, []);

  // Structural handler executing state interpolation via layout mutations
  const handleLayoutChange = (nextLayout) => {
    if (layout === nextLayout) return;

    const { gsap, Flip } = window;
    if (!gsap || !Flip || !containerRef.current) {
      setLayout(nextLayout); // Fallback layout swap if scripts haven't finished fetching
      return;
    }

    // Collect DOM bounding snapshots before rendering structural DOM changes
    const targets = gsap.utils.toArray(
      containerRef.current.querySelectorAll(".gallery-item"),
    );
    const state = Flip.getState(targets);

    // Apply the class/layout update immediately to change state dimensions
    setLayout(nextLayout);

    // Force Next.js / React reconciliation frame updates prior running GSAP transitions
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: duration,
        ease: ease,
        absolute: true, // Smooth absolute positioning handling over element row wrapping
        stagger: 0.02, // Slight organic offset delay sequence
      });
    });
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-50 selection:bg-amber-500 selection:text-neutral-900 font-sans p-6 md:p-12">
      {/* Structural Header and Navigation Layer */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
            Flip Grid Size Switch
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Fluid Layout Transitions leveraging GSAP state interpolation.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => handleLayoutChange("small")}
            disabled={layout === "small"}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
              layout === "small" ? disabledBtnClass : activeBtnClass
            }`}
          >
            Small View
          </button>
          <button
            onClick={() => handleLayoutChange("large")}
            disabled={layout === "large"}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
              layout === "large" ? disabledBtnClass : activeBtnClass
            }`}
          >
            Large View
          </button>
        </div>
      </header>

      {/* Main Structural Layout Container Wrapper */}
      <main className="max-w-7xl mx-auto">
        <div
          ref={containerRef}
          className="flex flex-wrap justify-center gap-y-6 -mx-3"
        >
          {images.map((url, idx) => (
            <div
              key={idx}
              className={`gallery-item px-3 h-[300px] md:h-[400px] transition-[flex-basis] duration-0 ${
                layout === "small"
                  ? "flex-none basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-[16.66667%]"
                  : "flex-none basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              }`}
            >
              {/* Card Container Framework */}
              <div className="w-full h-[90%] group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-md transition-all duration-300 hover:border-neutral-700 hover:shadow-xl">
                <img
                  src={url}
                  alt={`Gallery instance thumbnail context - id ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs font-mono tracking-wider text-neutral-300 bg-neutral-950/80 backdrop-blur-sm px-2 py-1 rounded">
                    ITEM #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
