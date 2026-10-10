"use client";

import { useEffect, useRef } from "react";

// ─── TelescopeZoomScroll ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #fff                          Page background color
// textColor            string   #1a1a1a                       Heading text color
// fontFamily           string   "'Playfair Display', serif"  Heading font family
// backImage            string   (unsplash)                    Full-bleed back layer image
// frontImage           string   (unsplash)                    Single "telescope" front image
// smallImages          string[] (unsplash, 10 items)          Small floating images scattered around the heading
// smallImagePositions  object[] (10 items)                    Per-image {top,left,right,bottom,width} CSS position strings
// leftText             string   "for the"                     Left half of the heading
// rightText            string   "planet"                      Right half of the heading
// headingFontSize      string   "3vw"                         Heading font size
// pinStart             string   "top top"                     ScrollTrigger start position
// pinEnd               string   "bottom top"                  ScrollTrigger end position
// scrub                bool|number  true                      ScrollTrigger scrub value
// frontImageScale      number   0.15                          Initial scale of the front image layer
// frontBlurAmount      number   2                              Initial blur (px) on the front image layer
// frontScaleDuration   number   1                              Duration of front image scaling to 1
// frontScaleDelay      number   0.1                            Delay before front image scale animation
// frontBlurDuration    number   1                              Duration of front image blur clearing
// frontBlurDelay       number   0.4                            Delay before front image blur animation
// frontAnimStart       number   0.6                            Timeline position (s) where front image animation starts
// smallImageTravel     string   "100vh"                        Z-axis translate distance for small images
// smallImageDuration   number   1                               Duration of small image travel animation
// smallImageStagger    number   0.2                             Total stagger spread (s) for small images, from center
// ease                 string   "power1.inOut"                  Easing used across all tweens
// maskImage            string   radial-gradient(...)            CSS mask-image applied to the front image layer
// ──────────────────────────────────────────────────────────────────────────

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
  headingFontSize = "3vw",
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
}) {
  const sectionRef = useRef(null);
  const frontRef = useRef(null);
  const smallRefs = useRef([]);
  smallRefs.current = [];

  const addSmallRef = (el) => {
    if (el && !smallRefs.current.includes(el)) smallRefs.current.push(el);
  };

  useEffect(() => {
    // Load the display font once
    const fontLinkId = "telescope-zoom-scroll-font";
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }

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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    let ctx;

    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"),
    ])
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger || !sectionRef.current) return;

        gsap.config({ trialWarn: false });
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
      })
      .catch((e) => console.error("[TelescopeZoomScroll] GSAP load failed:", e.message));

    return () => {
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
    <div className="w-full" style={{ backgroundColor: bgColor }}>
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