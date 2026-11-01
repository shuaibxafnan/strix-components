"use client";

import { useEffect, useRef } from "react";

const DEFAULT_BACK_IMAGE =
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80";

const DEFAULT_FRONT_IMAGE =
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1600&q=80";

const DEFAULT_SMALL_IMAGES = [
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_SMALL_IMAGE_POSITIONS = [
  { top: "15vw", left: "-3vw", width: "10vw" },
  { top: "5vw", left: "20vw", width: "10vw" },
  { top: "8vw", left: "26.5vw", width: "10vw" },
  { top: "18vw", right: "18vw", width: "10vw" },
  { top: "5vw", right: "10vw", width: "10vw" },
  { bottom: "5vw", left: "10vw", width: "10vw" },
  { bottom: "8vw", left: "22.5vw", width: "10vw" },
  { bottom: "3vw", left: "45vw", width: "10vw" },
  { bottom: "5vw", right: "15vw", width: "10vw" },
  { bottom: "9vw", right: "7vw", width: "10vw" },
];

export default function TelescopeZoomScroll({
  bgColor = "#fff",
  textColor = "#1a1a1a",
  fontFamily = "'Playfair Display', Georgia, serif",
  backImage = DEFAULT_BACK_IMAGE,
  frontImage = DEFAULT_FRONT_IMAGE,
  smallImages = DEFAULT_SMALL_IMAGES,
  smallImagePositions = DEFAULT_SMALL_IMAGE_POSITIONS,
  leftText = "for the",
  rightText = "planet",
  headingFontSize = "clamp(1.5rem, 3vw, 4rem)",
  pinStart = "top top",
  pinEnd = "bottom top",
  scrub = true,
  frontImageScale = 0.15,
  frontBlurAmount = 2,
  frontScaleDuration = 1,
  frontScaleDelay = 0.1,
  frontBlurDuration = 1,
  frontBlurDelay = 0.4,
  frontAnimStart = 0.6,
  smallImageTravel = "100vh",
  smallImageDuration = 1,
  smallImageStagger = 0.2,
  ease = "power1.inOut",
  maskImage = "radial-gradient(circle, black 55%, transparent 100%)",
  className = "",
}) {
  const sectionRef = useRef(null);
  const frontRef = useRef(null);
  const smallRefs = useRef([]);
  smallRefs.current = [];

  const addSmallRef = (el) => {
    if (el && !smallRefs.current.includes(el)) smallRefs.current.push(el);
  };

  useEffect(() => {

    let ctx;
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const section = sectionRef.current;
        const front = frontRef.current;
        const smalls = smallRefs.current;

        gsap.set(section, { "--progress": 0 });

        if (front) {
          gsap.set(front, {
            scale: frontImageScale,
            filter: `blur(${frontBlurAmount}px)`,
          });
        }

        gsap.set(smalls, {
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          force3D: true,
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: pinStart,
            end: pinEnd,
            scrub,
            pin: true,
            onUpdate: (self) => {
              const eased = gsap.parseEase(ease)(self.progress);
              section.style.setProperty("--progress", eased);
            },
          },
        });

        timeline.to(smalls, {
          z: smallImageTravel,
          duration: smallImageDuration,
          ease,
          stagger: { amount: smallImageStagger, from: "center" },
        });

        if (front) {
          timeline.to(
            front,
            {
              scale: 1,
              duration: frontScaleDuration,
              ease,
              delay: frontScaleDelay,
            },
            frontAnimStart,
          );

          timeline.to(
            front,
            {
              duration: frontBlurDuration,
              filter: "blur(0px)",
              ease,
              delay: frontBlurDelay,
            },
            frontAnimStart,
          );
        }
      }, sectionRef);
    })();

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, [
    pinStart,
    pinEnd,
    scrub,
    frontImageScale,
    frontBlurAmount,
    frontScaleDuration,
    frontScaleDelay,
    frontBlurDuration,
    frontBlurDelay,
    frontAnimStart,
    smallImageTravel,
    smallImageDuration,
    smallImageStagger,
    ease,
  ]);

  return (
    <div className={`w-full ${className}`} style={{ backgroundColor: bgColor }}>
      <section
        ref={sectionRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ "--progress": 0 }}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{ transform: "scale(var(--progress))" }}
        >
          <div className="absolute inset-0 w-full h-full">
            <img
              src={backImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          <div
            ref={frontRef}
            className="absolute inset-0 w-full h-full"
            style={{ filter: `blur(${frontBlurAmount}px)` }}
          >
            <img
              src={frontImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                maskImage,
                WebkitMaskImage: maskImage,
                maskPosition: "50% 50%",
                WebkitMaskPosition: "50% 50%",
                maskSize: "cover",
                WebkitMaskSize: "cover",
              }}
            />
          </div>
        </div>

        <h1
          className="flex font-semibold"
          style={{
            fontSize: headingFontSize,
            color: textColor,
            fontFamily,
            transform: "translateY(-15%)",
          }}
        >
          <span
            className="inline-block"
            style={{
              transform:
                "translate3d(calc(var(--progress) * (-66vw + 100%) - 0.5vw), 0, 0)",
            }}
          >
            {leftText}
          </span>
          <span
            className="inline-block"
            style={{
              transform: "translate3d(calc(var(--progress) * (66vw - 100%)), 0, 0)",
            }}
          >
            {rightText}
          </span>
        </h1>

        <div
          className="absolute inset-0 w-screen h-screen pointer-events-none"
          style={{ perspective: "100vh" }}
        >
          {smallImages.map((src, i) => {
            const pos = smallImagePositions[i] || {};
            return (
              <img
                key={i}
                ref={addSmallRef}
                src={src}
                alt=""
                className="absolute object-cover object-center"
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  bottom: pos.bottom,
                  width: pos.width || "10vw",
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}