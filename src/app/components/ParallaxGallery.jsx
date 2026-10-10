"use client";

import { useEffect, useRef } from "react";

// ─── ParallaxGallery ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images        string[]    3 unsplash URLs    Array of image URLs
// bgColor       string      #171717            Page background color
// lenisLerp     number      0.07               Lenis smooth scroll lerp factor
// yPercentFrom  number      -20                GSAP parallax start yPercent
// yPercentTo    number      20                 GSAP parallax end yPercent
// imgScale      number      1.4                Initial image scale (overflow room)
// borderRadius  string      32px               Image container border radius
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1498598457418-36ef20772bb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1535916707207-35f97e715e1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
];

export default function ParallaxGallery({
  images = DEFAULT_IMAGES,
  bgColor = "#171717",
  lenisLerp = 0.07,
  yPercentFrom = -20,
  yPercentTo = 20,
  imgScale = 1.4,
  borderRadius = "32px",
}) {
  const containerRefs = useRef([]);

  useEffect(() => {
    let lenis;

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
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    async function init() {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        );
        await loadScript("https://unpkg.com/lenis@1.3.23/dist/lenis.min.js");
      } catch (err) {
        console.error("[ParallaxGallery] Script load failed:", err.message);
        return;
      }

      const { gsap, ScrollTrigger, Lenis } = window;
      if (!gsap || !ScrollTrigger || !Lenis) {
        console.error("[ParallaxGallery] Missing globals after load.");
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: lenisLerp });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      containerRefs.current.forEach((container) => {
        if (!container) return;
        const img = container.querySelector("img");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            scrub: true,
            pin: false,
          },
        });
        tl.fromTo(
          img,
          { yPercent: yPercentFrom, ease: "none" },
          { yPercent: yPercentTo, ease: "none" },
        );
      });
    }

    init();

    return () => {
      lenis?.destroy?.();
      window.ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className="block min-h-screen overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {images.map((src, i) => (
        <section
          key={i}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="relative w-[min(80vw,900px)] p-[10vw]">
            <div
              ref={(el) => (containerRefs.current[i] = el)}
              className="w-full relative overflow-hidden"
              style={{ paddingTop: "80%", borderRadius }}
            >
              <img
                src={src}
                alt=""
                className="w-auto h-full absolute top-0 left-1/2"
                style={{
                  transform: `translateX(-50%) scale(${imgScale})`,
                  transformOrigin: "50% 50%",
                }}
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
