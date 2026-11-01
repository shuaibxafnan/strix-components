"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_IMAGES = [
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

const DEFAULT_GALLERY_LAYOUT = [
  { width: "20%", left: "15%", top: "8%", endScale: 2.5, aspect: "3/4" },
  { width: "20.8%", right: "14%", top: "35%", endScale: 2.5, aspect: "3/4" },
  { width: "20%", left: "20%", top: "69%", endScale: 2.8, aspect: "4/3" },
  { width: "20%", right: "37.5%", top: "69%", endScale: 2.6, aspect: "3/4" },
  { width: "25%", left: "50%", top: "50%", endScale: 2, aspect: "4/3" },
  { width: "34%", left: "37.5%", top: "8%", endScale: 2.3, aspect: "16/9" },
];

const DEFAULT_SLIDES = [
  {
    title: "Teodor Kuduschiev",
    meta: ["Osaka, Japan", "Published 7 days ago", "FUJIFILM, X-T1"],
    imageIndex: 6,
  },
  {
    title: "Vadim Berg",
    meta: ["Warsaw, Poland", "Published 3 days ago", "Canon, EOS 6D Mark II"],
    imageIndex: 7,
  },
  {
    title: "Tiago Ferreira",
    meta: ["Lisboa, Portugal", "Published 18 days ago", "SONY, ILCE-7M3"],
    imageIndex: 8,
  },
];

const OPEN_CLIP = "polygon(0 0, 0 100%, 100% 100%, 100% 0)";
const CLOSED_CLIP = "polygon(0 0, 0 0%, 100% 0%, 100% 0)";

export default function ClippedScrollGallery({
  images = DEFAULT_IMAGES,
  bgColor = "#0a0a0a",
  textColor = "#f5f5f5",
  headerLabel = "scroll down",
  footerLabel = "scroll up",
  showBookends = true,
  spacerCount = 2,
  perspective = "100dvh",
  galleryScrollLength = 3,
  galleryEndZ = "50dvh",
  galleryLayout = DEFAULT_GALLERY_LAYOUT,
  galleryCenterIndex = 4,
  slides = DEFAULT_SLIDES,
  parallaxScrollLength = 3,
  parallaxScrub = 1,
  blurAmount = 12,
  blurScale = 1.1,
  thumbWidth = "35%",
  thumbLeft = "7.5%",
  thumbAspect = "1/1",
  imageAlts = [],
  className = "",
}) {
  const uid = useId().replace(/[:]/g, "");

  const rootRef = useRef(null);
  const galleryOuterRef = useRef(null);
  const galleryStageRef = useRef(null);
  const galleryWrapperRef = useRef(null);
  const parallaxOuterRef = useRef(null);
  const parallaxStageRef = useRef(null);

  useEffect(() => {
    let ctx;
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const medias = gsap.utils.toArray(`.pg-media-${uid}`);

        if (galleryStageRef.current && medias.length) {
          const galleryTl = gsap.timeline({
            scrollTrigger: {
              trigger: galleryOuterRef.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * galleryScrollLength,
              scrub: true,
              pin: galleryStageRef.current,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          galleryTl.to(galleryWrapperRef.current, {
            z: galleryEndZ,
            ease: "none",
          });

          medias.forEach((media, index) => {
            galleryTl.to(
              media,
              {
                scale: galleryLayout[index]?.endScale ?? 2,
                ease: "none",
              },
              "<=",
            );
          });
        }

        const sections = gsap.utils.toArray(`.pg-section-${uid}`);
        const thumbs = gsap.utils.toArray(`.pg-thumb-${uid}`);

        if (parallaxStageRef.current && sections.length > 1) {
          sections.slice(0, -1).forEach((section) => {
            gsap.set(section, { clipPath: OPEN_CLIP });
          });
          thumbs.slice(0, -1).forEach((thumb) => {
            gsap.set(thumb, { clipPath: OPEN_CLIP });
          });

          const sectionTl = gsap.timeline({
            scrollTrigger: {
              trigger: parallaxOuterRef.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * parallaxScrollLength,
              scrub: true,
              pin: parallaxStageRef.current,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          sections.slice(0, -1).forEach((section) => {
            sectionTl.to(section, { clipPath: CLOSED_CLIP, ease: "none" });
          });

          const thumbTl = gsap.timeline({
            scrollTrigger: {
              trigger: parallaxOuterRef.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * parallaxScrollLength,
              scrub: parallaxScrub,
              invalidateOnRefresh: true,
            },
          });

          thumbs.slice(0, -1).forEach((thumb) => {
            thumbTl.to(thumb, { clipPath: CLOSED_CLIP, ease: "none" });
          });
        }

        ScrollTrigger.refresh();
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, [
    uid,
    galleryScrollLength,
    galleryEndZ,
    galleryLayout,
    parallaxScrollLength,
    parallaxScrub,
    slides,
  ]);

  const galleryOuterHeight = `${(galleryScrollLength + 1) * 100}vh`;
  const parallaxOuterHeight = `${(parallaxScrollLength + 1) * 100}vh`;

  return (
    <div
      ref={rootRef}
      className={`relative z-[1] flex w-full flex-col font-[Helvetica,Arial,sans-serif] ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {showBookends && (
        <header className="flex h-[100dvh] items-center justify-center text-[2vmax] tracking-tight">
          {headerLabel}
        </header>
      )}

      <div ref={galleryOuterRef} style={{ height: galleryOuterHeight }}>
        <div
          ref={galleryStageRef}
          className="relative box-border h-[100dvh] w-full overflow-hidden"
          style={{ perspective }}
        >
          <div
            ref={galleryWrapperRef}
            className="absolute inset-0 h-[100dvh] w-full [transform-style:preserve-3d]"
          >
            {galleryLayout.map((item, i) => (
              <div
                key={i}
                className={`pg-media-${uid} absolute inset-0 h-[100dvh] w-full will-change-transform`}
              >
                <div
                  className="absolute overflow-hidden"
                  style={{
                    width: item.width,
                    left: item.left,
                    right: item.right,
                    top: item.top,
                    aspectRatio: item.aspect || "3/4",
                    transform:
                      i === galleryCenterIndex
                        ? "translate(-50%, -50%)"
                        : undefined,
                  }}
                >
                  <img
                    src={images[i % images.length]}
                    alt={imageAlts[i % images.length] ?? ""}
                    draggable={false}
                    className="block h-full w-full select-none object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {Array.from({ length: spacerCount }).map((_, i) => (
        <div key={i} className="h-screen" />
      ))}

      <div ref={parallaxOuterRef} style={{ height: parallaxOuterHeight }}>
        <div
          ref={parallaxStageRef}
          className="relative h-[100dvh] w-full overflow-hidden"
        >
          <div
            className="absolute top-1/2 z-10 -translate-y-1/2 overflow-hidden"
            style={{
              width: thumbWidth,
              left: thumbLeft,
              aspectRatio: thumbAspect,
            }}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`pg-thumb-${uid} absolute inset-0`}
                style={{ zIndex: slides.length - i }}
              >
                <img
                  src={images[slide.imageIndex % images.length]}
                  alt={imageAlts[slide.imageIndex % images.length] ?? ""}
                  draggable={false}
                  className="block h-full w-full select-none object-cover"
                />
              </div>
            ))}
          </div>

          {slides.map((slide, i) => (
            <section
              key={i}
              className={`pg-section-${uid} absolute inset-0 flex h-[100dvh] max-w-full overflow-hidden`}
              style={{ zIndex: slides.length - i }}
            >
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={images[slide.imageIndex % images.length]}
                  alt={imageAlts[slide.imageIndex % images.length] ?? ""}
                  draggable={false}
                  className="block h-full w-full select-none object-cover"
                  style={{
                    filter: `blur(${blurAmount}px)`,
                    transform: `scale(${blurScale})`,
                  }}
                />
              </div>

              <div className="relative z-[1] ml-[50%] flex w-1/2 flex-col justify-center gap-[6vmax]">
                <h3 className="text-[3vmax] leading-none">{slide.title}</h3>
                <ul className="flex flex-col gap-[0.75vmax] text-[1.1vmax] uppercase tracking-[0.08em]">
                  {slide.meta.map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      {showBookends && (
        <footer className="flex h-[100dvh] items-center justify-center text-[2vmax] tracking-tight">
          {footerLabel}
        </footer>
      )}
    </div>
  );
}