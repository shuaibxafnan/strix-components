"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/sparkles.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/star.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/heart.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/bolt.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/sun.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/moon.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/cube.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/rocket-launch.svg",
  "https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/solid/flower.svg",
];

export default function MouseFlairTrail({
  images = DEFAULT_IMAGES,
  prompt = "wiggle your mouse around.",
  bgColor = "#fff",
  textColor = "#111",
  flairWidth = 50,
  gap = 100,
  followLerp = 0.1,
  popDuration = 1,
  popEase = "elastic.out(1,0.3)",
  fallEase = "back.in(.4)",
  fallDistance = "120vh",
  rotationRange = [-360, 360],
  className = "",
}) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, "");
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let handleMouseMove;
    let tickerFn;
    let gsapRef;
    let ctx;

    import("gsap")
      .then((mod) => {
        const gsap = mod.gsap || mod.default;
        if (cancelled || !gsap || !containerRef.current) return;
        gsapRef = gsap;

        ctx = gsap.context(() => {
          gsap.defaults({ duration: popDuration });

          const flair = gsap.utils.toArray(
            containerRef.current.querySelectorAll(`.flair-${uid}`),
          );
          let index = 0;
          const wrapper = gsap.utils.wrap(0, flair.length);

          let mousePos = { x: 0, y: 0 };
          let lastMousePos = mousePos;
          const cachedMousePos = { x: 0, y: 0 };

          const playAnimation = (shape) => {
            const tl = gsap.timeline();
            tl.from(shape, {
              opacity: 0,
              scale: 0,
              ease: popEase,
            })
              .to(
                shape,
                {
                  rotation: `random([${rotationRange[0]}, ${rotationRange[1]}])`,
                },
                "<",
              )
              .to(
                shape,
                {
                  y: fallDistance,
                  ease: fallEase,
                  duration: 1,
                },
                0,
              );
          };

          const animateImage = () => {
            const wrappedIndex = wrapper(index);
            const img = flair[wrappedIndex];
            gsap.killTweensOf(img);
            gsap.set(img, { clearProps: "all" });
            gsap.set(img, {
              opacity: 1,
              left: mousePos.x,
              top: mousePos.y,
              xPercent: -50,
              yPercent: -50,
            });
            playAnimation(img);
            index++;
          };

          const imageTrail = () => {
            const travelDistance = Math.hypot(
              lastMousePos.x - mousePos.x,
              lastMousePos.y - mousePos.y,
            );
            cachedMousePos.x = gsap.utils.interpolate(
              cachedMousePos.x || mousePos.x,
              mousePos.x,
              followLerp,
            );
            cachedMousePos.y = gsap.utils.interpolate(
              cachedMousePos.y || mousePos.y,
              mousePos.y,
              followLerp,
            );
            if (travelDistance > gap) {
              animateImage();
              lastMousePos = mousePos;
            }
          };

          handleMouseMove = (e) => {
            mousePos = { x: e.clientX, y: e.clientY };
          };
          window.addEventListener("pointermove", handleMouseMove);

          tickerFn = imageTrail;
          gsap.ticker.add(tickerFn);
        }, containerRef);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (handleMouseMove)
        window.removeEventListener("pointermove", handleMouseMove);
      if (tickerFn && gsapRef) gsapRef.ticker.remove(tickerFn);
      if (ctx) ctx.revert();
    };
  }, [
    uid,
    gap,
    followLerp,
    popDuration,
    popEase,
    fallEase,
    fallDistance,
    rotationRange,
  ]);

  const flairCss = ".flair-" + uid + " { width: " + flairWidth + "px; }";

  return (
    <div
      className={`relative flex items-center justify-center w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
      ref={containerRef}
    >
      <style dangerouslySetInnerHTML={{ __html: flairCss }} />

      <p className="text-lg md:text-xl px-4 text-center" style={{ color: textColor }}>
        {prompt}
      </p>

      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`flair-${uid} fixed opacity-0`}
        />
      ))}
    </div>
  );
}
