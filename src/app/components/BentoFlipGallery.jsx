"use client";

import { useEffect, useId, useRef } from "react";

// ─── BentoFlipGallery ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images           array    (8 demo urls)   Array of { src, alt } — exactly 8 items map to the fixed bento grid areas
// inkColor         string   #0b0b0c         Darkroom background behind the gallery and the contact-sheet copy block
// paperColor       string   #f3efe6         Warm paper/off-white used for headline and body text
// safelightColor   string   #e8442c         Single accent (rules, eyebrow, frame index) — the "safelight" of the sheet
// kicker           string   "Contact Sheet" Small mono eyebrow line printed above the headline
// heading          string   "Eight frames, one roll"   Oversized serif-italic headline
// leadParagraph    string   (1 lorem para)  First paragraph, set large under the drop cap
// paragraphs       array    (7 lorem paras) Remaining paragraphs, set in the right-hand column
// itemGap          number   1               Gap between grid items, in vh, for both the start and final grid states
// colWidth         number   32.5            Column width in vw for the start ("bento") grid state
// rowHeight        number   23              Row height in vh for the start ("bento") grid state
// finalColWidth    number   100             Column width in vw for the final (fullscreen strip) grid state
// finalRowHeight   number   49.5            Row height in vh for the final (fullscreen strip) grid state
// scrubStart       string   "center center" ScrollTrigger start position
// scrubDistance    string   "+=100%"        ScrollTrigger end position, relative to start
// ease             string   "expoScale(1, 5)" GSAP ease used for the Flip tween
// pinContainer     boolean  true            Whether ScrollTrigger pins the gallery's parent while scrubbing
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  { src: "https://assets.codepen.io/16327/portrait-pattern-1.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-image-12.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-image-8.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-pattern-2.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-image-4.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-image-3.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-pattern-3.jpg", alt: "" },
  { src: "https://assets.codepen.io/16327/portrait-image-1.jpg", alt: "" },
];

const DEFAULT_LEAD =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const DEFAULT_PARAGRAPHS = Array.from(
  { length: 7 },
  () =>
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
);

export default function BentoFlipGallery({
  images = DEFAULT_IMAGES,
  inkColor = "#0b0b0c",
  paperColor = "#f3efe6",
  safelightColor = "#e8442c",
  kicker = "Contact Sheet",
  heading = "Eight frames, one roll",
  leadParagraph = DEFAULT_LEAD,
  paragraphs = DEFAULT_PARAGRAPHS,
  itemGap = 1,
  colWidth = 32.5,
  rowHeight = 23,
  finalColWidth = 100,
  finalRowHeight = 49.5,
  scrubStart = "center center",
  scrubDistance = "+=100%",
  ease = "expoScale(1, 5)",
  pinContainer = true,
}) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, "");
  const galleryRef = useRef(null);
  const flipCtxRef = useRef(null);

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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    let cleanupResize;

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
      ),
    ])
      .then(() => {
        const { gsap } = window;
        if (!gsap || !galleryRef.current) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(window.ScrollTrigger, window.Flip);

        const galleryElement = galleryRef.current;

        const createTween = () => {
          const galleryItems = galleryElement.querySelectorAll(
            `.gallery-item-${uid}`,
          );

          if (flipCtxRef.current) flipCtxRef.current.revert();

          galleryElement.classList.remove(`gallery-final-${uid}`);

          flipCtxRef.current = gsap.context(() => {
            galleryElement.classList.add(`gallery-final-${uid}`);
            const flipState = window.Flip.getState(galleryItems);
            galleryElement.classList.remove(`gallery-final-${uid}`);

            const flip = window.Flip.to(flipState, {
              simple: true,
              ease,
            });

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: galleryElement,
                start: scrubStart,
                end: scrubDistance,
                scrub: true,
                pin: pinContainer ? galleryElement.parentNode : false,
              },
            });

            tl.add(flip);

            return () => gsap.set(galleryItems, { clearProps: "all" });
          });
        };

        createTween();
        cleanupResize = createTween;
        window.addEventListener("resize", cleanupResize);
      })
      .catch((e) =>
        console.error("[BentoFlipGallery] GSAP load failed:", e.message),
      );

    return () => {
      if (cleanupResize) window.removeEventListener("resize", cleanupResize);
      if (flipCtxRef.current) flipCtxRef.current.revert();
    };
  }, [uid, ease, scrubStart, scrubDistance, pinContainer]);

  const gridCss =
    ".gallery-" +
    uid +
    " { display: grid; gap: " +
    itemGap +
    "vh; grid-template-columns: repeat(3, " +
    colWidth +
    "vw); grid-template-rows: repeat(4, " +
    rowHeight +
    "vh); justify-content: center; align-content: center; }" +
    ".gallery-final-" +
    uid +
    ".gallery-" +
    uid +
    " { grid-template-columns: repeat(3, " +
    finalColWidth +
    "vw); grid-template-rows: repeat(4, " +
    finalRowHeight +
    "vh); gap: " +
    itemGap +
    "vh; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(1) { grid-area: 1 / 1 / 3 / 2; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(2) { grid-area: 1 / 2 / 2 / 3; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(3) { grid-area: 2 / 2 / 4 / 3; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(4) { grid-area: 1 / 3 / 3 / 3; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(5) { grid-area: 3 / 1 / 3 / 2; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(6) { grid-area: 3 / 3 / 5 / 4; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(7) { grid-area: 4 / 1 / 5 / 2; }" +
    ".gallery-item-" +
    uid +
    ":nth-child(8) { grid-area: 4 / 2 / 5 / 3; }" +
    ".sprocket-" +
    uid +
    " { background-image: repeating-linear-gradient(to bottom, " +
    safelightColor +
    " 0px, " +
    safelightColor +
    " 6px, transparent 6px, transparent 22px); }";

  const frameCount = String(images.length).padStart(2, "0");

  return (
    <div style={{ backgroundColor: inkColor }}>
      <style dangerouslySetInnerHTML={{ __html: gridCss }} />

      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div
          ref={galleryRef}
          className={`gallery-${uid} relative w-full h-full flex-none`}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`gallery-item-${uid} relative flex-none bg-cover bg-center`}
            >
              <img
                src={img.src}
                alt={img.alt || ""}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="px-6 py-24 md:px-16 lg:px-24"
        style={{ color: paperColor }}
      >
        <div className="max-w-6xl mx-auto">
          {/* eyebrow + frame index */}
          <div className="flex items-baseline justify-between border-b border-white/15 pb-4 mb-10">
            <span
              className="font-mono text-xs uppercase tracking-[0.3em]"
              style={{ color: safelightColor }}
            >
              {kicker}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-50">
              No. {frameCount} / {frameCount}
            </span>
          </div>

          {/* headline */}
          <h2 className="font-serif italic tracking-tight text-[13vw] leading-[0.92] md:text-[7vw] mb-14">
            {heading}
          </h2>

          {/* sprocket rule + two-column copy */}
          <div className="grid grid-cols-1 md:grid-cols-[24px_1fr_1fr] gap-x-10 gap-y-8">
            <div
              className={`sprocket-${uid} hidden md:block w-[3px] rounded-full`}
            />

            <p className="text-2xl md:text-[1.7rem] leading-snug font-light">
              <span
                className="float-left font-serif italic text-6xl md:text-7xl leading-[0.8] pr-3 pt-1"
                style={{ color: safelightColor }}
              >
                {leadParagraph.charAt(0)}
              </span>
              {leadParagraph.slice(1)}
            </p>

            <div className="space-y-6">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-base leading-relaxed opacity-80">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
