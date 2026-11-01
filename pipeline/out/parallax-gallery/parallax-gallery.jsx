"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1498598457418-36ef20772bb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1535916707207-35f97e715e1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
];

export default function ParallaxGallery({
  images = DEFAULT_IMAGES,
  imgAlt = "",
  bgColor = "#171717",
  lenisLerp = 0.07,
  yPercentFrom = -20,
  yPercentTo = 20,
  imgScale = 1.4,
  borderRadius = "32px",
  className = "",
}) {
  const containerRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;
    let lenis;
    let tick;
    let ctx;
    let gsapRef;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      lenis = new Lenis({ lerp: lenisLerp });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);

      ctx = gsap.context(() => {
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
      });
    })();

    return () => {
      cancelled = true;
      if (gsapRef && tick) gsapRef.ticker.remove(tick);
      ctx?.revert();
      lenis?.destroy?.();
    };
  }, []);

  return (
    <div
      className={`block min-h-screen overflow-hidden ${className}`}
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
                alt={imgAlt}
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
