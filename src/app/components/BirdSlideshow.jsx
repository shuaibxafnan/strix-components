"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── AnimatedSlider ────────────────────────────────────────────────────────
//
// A full-viewport hero carousel with a floating thumbnail strip, animated
// content entrance, arrow controls, and a top-edge progress bar.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides              array    required   Array of slide objects (see shape below)
//
// Slide shape:
//   { image: string, title: string, name: string, description: string }
//     image       — URL for the background image
//     title       — Small eyebrow label (e.g. "SLIDER")
//     name        — Large headline (e.g. "EAGLE")
//     description — Body copy shown beneath the headline
//
// accentColor         string   "#14FF72CB"  Accent used on eyebrow, buttons, progress bar, arrows
// contentLeft         string   "100px"      Left offset of the slide content text block
// contentWidth        string   "400px"      Max-width of the slide content text block
// timeRunning         number   3000         Transition animation duration in ms
// timeAutoNext        number   7000         Auto-advance interval in ms
// thumbWidth          string   "180px"      Width of each thumbnail card in the strip
// thumbHeight         string   "250px"      Height of each thumbnail card in the strip
// thumbTop            string   "80%"        Vertical centre of the thumbnail strip
// thumbStartLeft      string   "67%"        Left edge where the thumbnail strip begins
// thumbGap            number   200          Pixel gap between consecutive thumbnails
// titleFontSize       string   "100px"      Font size for the eyebrow title
// nameFontSize        string   "100px"      Font size for the slide name headline
// desFontSize         string   "18px"       Font size for the description text
// progressHeight      string   "4px"        Height of the top progress bar
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    image: "https://u.cubeupload.com/Leo21/eagel1.jpg",
    title: "SLIDER",
    name: "EAGLE",
    description:
      "Eagles are majestic birds of prey known for their incredible strength, sharp vision, and powerful talons",
  },
  {
    image: "https://u.cubeupload.com/Leo21/owl1.jpg",
    title: "SLIDER",
    name: "OWL",
    description:
      "Owls are nocturnal birds of prey, shrouded in an aura of mystery and wisdom",
  },
  {
    image: "https://u.cubeupload.com/Leo21/crow.jpg",
    title: "SLIDER",
    name: "CROW",
    description:
      "Crows are highly intelligent and adaptable birds known for their glossy black plumage and distinctive calls.",
  },
  {
    image: "https://u.cubeupload.com/Leo21/butterfly1.jpeg",
    title: "SLIDER",
    name: "BUTTERFLY",
    description:
      "Butterflies, with their vibrant wings and graceful flight, are a symbol of transformation and beauty in the natural world",
  },
  {
    image: "https://u.cubeupload.com/Leo21/owl2.jpg",
    title: "SLIDER",
    name: "OWL",
    description:
      "Owls have long been associated with mystery, wisdom, and the supernatural in various cultures",
  },
  {
    image: "https://u.cubeupload.com/Leo21/eagel3.jpg",
    title: "SLIDER",
    name: "EAGLE",
    description:
      "Eagles represent freedom, power, and nobility in many cultures",
  },
  {
    image: "https://u.cubeupload.com/Leo21/kingfirser2.jpeg",
    title: "SLIDER",
    name: "KINGFISHER",
    description:
      "Kingfishers, with their dazzling plumage, are vibrant jewels of the aquatic world",
  },
  {
    image: "https://u.cubeupload.com/Leo21/parrot2.jpg",
    title: "SLIDER",
    name: "PARROT",
    description:
      "Parrots are social creatures, often living in flocks and exhibiting complex communication patterns",
  },
  {
    image: "https://u.cubeupload.com/Leo21/heron.jpeg",
    title: "SLIDER",
    name: "HERON",
    description:
      "Herons are known for their striking appearance, often characterized by graceful necks and stilt-like legs",
  },
  {
    image: "https://u.cubeupload.com/Leo21/butterfly2.jpg",
    title: "SLIDER",
    name: "BUTTERFLY",
    description:
      "Butterflies, with their delicate wings and vibrant colors, are among the most enchanting creatures in the natural world",
  },
  {
    image: "https://u.cubeupload.com/Leo21/parrot1.jpg",
    title: "SLIDER",
    name: "PARROT",
    description:
      "Parrots are known for their long lifespans, with some species living for several decades",
  },
];

export default function BirdSlideshow({
  slides = DEFAULT_SLIDES,
  // ── visual tokens ──────────────────────────────────────────────────────
  accentColor = "#14FF72CB",
  // ── content block ──────────────────────────────────────────────────────
  contentLeft = "100px",
  contentWidth = "400px",
  titleFontSize = "100px",
  nameFontSize = "100px",
  desFontSize = "18px",
  // ── thumbnail strip ────────────────────────────────────────────────────
  thumbWidth = "180px",
  thumbHeight = "250px",
  thumbTop = "80%",
  thumbStartLeft = "67%",
  thumbGap = 200,
  // ── timing ─────────────────────────────────────────────────────────────
  timeRunning = 3000,
  timeAutoNext = 7000,
  // ── progress bar ───────────────────────────────────────────────────────
  progressHeight = "4px",
}) {
  // ── refs ────────────────────────────────────────────────────────────────
  const carouselRef = useRef(null);
  const listRef = useRef(null);
  const progressRef = useRef(null);
  const runTimeOutRef = useRef(null);
  const runNextAutoRef = useRef(null);

  // ── helpers ─────────────────────────────────────────────────────────────

  // Restarts the CSS progress-bar animation by forcing a reflow
  const resetTimeAnimation = useCallback(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.animation = "none";
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight; // trigger reflow
    el.style.animation = `sliderProgress ${timeAutoNext}ms linear 1 forwards`;
  }, [timeAutoNext]);

  // Moves items in the DOM and toggles transition classes
  const showSlider = useCallback(
    (type) => {
      const listEl = listRef.current;
      const carouselEl = carouselRef.current;
      if (!listEl || !carouselEl) return;

      const items = listEl.querySelectorAll(".slider-item");

      if (type === "next") {
        listEl.appendChild(items[0]);
        carouselEl.classList.add("slider-next");
      } else {
        listEl.prepend(items[items.length - 1]);
        carouselEl.classList.add("slider-prev");
      }

      // Remove transition class after animation completes
      clearTimeout(runTimeOutRef.current);
      runTimeOutRef.current = setTimeout(() => {
        carouselEl.classList.remove("slider-next");
        carouselEl.classList.remove("slider-prev");
      }, timeRunning);

      // Schedule next auto-advance
      clearTimeout(runNextAutoRef.current);
      runNextAutoRef.current = setTimeout(() => {
        showSlider("next");
      }, timeAutoNext);

      resetTimeAnimation();
    },
    [timeRunning, timeAutoNext, resetTimeAnimation],
  );

  // ── lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    // Kick off the first auto-advance and progress animation
    resetTimeAnimation();
    runNextAutoRef.current = setTimeout(() => {
      showSlider("next");
    }, timeAutoNext);

    return () => {
      clearTimeout(runTimeOutRef.current);
      clearTimeout(runNextAutoRef.current);
    };
  }, [showSlider, resetTimeAnimation, timeAutoNext]);

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Scoped styles ──────────────────────────────────────────────────
          Only used for:
          1. CSS @keyframes (cannot live in Tailwind)
          2. nth-child positioning rules (dynamic, index-dependent)
          3. Transition classes (.slider-next / .slider-prev) applied via JS
          4. Content entrance animation on :nth-child(2)
          Everything else is Tailwind.
      ──────────────────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&family=Turret+Road:wght@400;700;800&display=swap');

        /* ── Progress bar keyframe ── */
        @keyframes sliderProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── Content entrance keyframe ── */
        @keyframes sliderContentIn {
          from { opacity: 0; transform: translateY(100px); filter: blur(33px); }
          to   { opacity: 1; transform: translateY(0);     filter: blur(0); }
        }

        /* ── Thumbnail item positioning ── */
        .slider-item {
          width: ${thumbWidth};
          height: ${thumbHeight};
          position: absolute;
          top: ${thumbTop};
          transform: translateY(-70%);
          left: ${thumbStartLeft};
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.1);
          background-position: center;
          background-size: cover;
          z-index: 100;
          transition: left 1s, top 1s, transform 1s, width 1s, height 1s, border-radius 1s;
        }

        /* Items 1 & 2 become the full-screen hero */
        .slider-item:nth-child(1),
        .slider-item:nth-child(2) {
          top: 0; left: 0;
          transform: translate(0, 0);
          border-radius: 0;
          width: 100%; height: 100%;
        }

        /* Thumbnail strip positions */
        .slider-item:nth-child(3) { left: ${thumbStartLeft}; }
        .slider-item:nth-child(4) { left: calc(${thumbStartLeft} + ${thumbGap}px); }
        .slider-item:nth-child(5) { left: calc(${thumbStartLeft} + ${thumbGap * 2}px); }
        .slider-item:nth-child(6) { left: calc(${thumbStartLeft} + ${thumbGap * 3}px); }
        .slider-item:nth-child(n+7) { left: calc(${thumbStartLeft} + ${thumbGap * 4}px); opacity: 0; }

        /* ── Slide content — only visible on item 2 ── */
        .slider-content { display: none; }
        .slider-item:nth-child(2) .slider-content { display: block; }

        /* Content entrance animations (staggered) */
        .slider-content .slide-title {
          opacity: 0;
          animation: sliderContentIn 1s ease-in-out 0.3s 1 forwards;
        }
        .slider-content .slide-name {
          opacity: 0;
          animation: sliderContentIn 1s ease-in-out 0.6s 1 forwards;
        }
        .slider-content .slide-des {
          opacity: 0;
          animation: sliderContentIn 1s ease-in-out 0.9s 1 forwards;
        }
        .slider-content .slide-btn {
          opacity: 0;
          animation: sliderContentIn 1s ease-in-out 1.2s 1 forwards;
        }

        /* ── Next/Prev transition overrides ── */
        .slider-next .slider-item:nth-child(1) { left: -100%; }
        .slider-prev .slider-item:nth-child(2) { left: -100%; }

        .slider-next .slider-item:nth-child(2) {
          left: 0; top: 0; transform: translate(0); width: 100%; height: 100%; border-radius: 0;
        }
        .slider-prev .slider-item:nth-child(3) {
          left: 0; top: 0; transform: translate(0); width: 100%; height: 100%; border-radius: 0;
        }

        .slider-next .slider-item:nth-child(3) { left: ${thumbStartLeft}; }
        .slider-next .slider-item:nth-child(4) { left: calc(${thumbStartLeft} + ${thumbGap}px); }
        .slider-next .slider-item:nth-child(5) { left: calc(${thumbStartLeft} + ${thumbGap * 2}px); }
        .slider-next .slider-item:nth-child(6) { left: calc(${thumbStartLeft} + ${thumbGap * 3}px); }

        .slider-prev .slider-item:nth-child(4) { left: calc(${thumbStartLeft} + ${thumbGap}px); }
        .slider-prev .slider-item:nth-child(5) { left: calc(${thumbStartLeft} + ${thumbGap * 2}px); }

        @media (max-width: 999px) {
          .slider-content { left: 50px !important; }
          .slide-title, .slide-name { font-size: 70px !important; }
          .slide-des { font-size: 16px !important; }
        }
        @media (max-width: 690px) {
          .slider-content { top: 40% !important; }
          .slide-title, .slide-name { font-size: 45px !important; }
          .slide-btn button { padding: 10px 15px !important; font-size: 14px !important; }
        }
        @media (max-width: 450px) {
          .slider-content { width: 300px !important; left: 20px !important; }
        }
      `}</style>

      {/* ── Carousel wrapper ───────────────────────────────────────────────── */}
      <div
        ref={carouselRef}
        className="relative w-screen h-screen overflow-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* ── Slide list ───────────────────────────────────────────────────── */}
        <div ref={listRef} className="w-full h-full">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="slider-item"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              {/* Content — CSS hides this on all items except :nth-child(2) */}
              <div
                className="slider-content absolute text-white text-left"
                style={{
                  top: "50%",
                  left: contentLeft,
                  transform: "translateY(-50%)",
                  width: contentWidth,
                }}
              >
                {/* Eyebrow title */}
                <div
                  className="slide-title font-bold uppercase leading-none"
                  style={{ fontSize: titleFontSize, color: accentColor }}
                >
                  {slide.title}
                </div>

                {/* Hero name */}
                <div
                  className="slide-name font-bold uppercase leading-none"
                  style={{
                    fontSize: nameFontSize,
                    textShadow: "3px 4px 4px rgba(255,255,255,0.8)",
                  }}
                >
                  {slide.name}
                </div>

                {/* Description */}
                <div
                  className="slide-des mt-2.5 mb-5 ml-1"
                  style={{ fontSize: desFontSize }}
                >
                  {slide.description}
                </div>

                {/* CTA buttons */}
                <div className="slide-btn ml-1 flex gap-3">
                  <button
                    className="px-5 py-2.5 text-base font-medium text-white cursor-pointer transition-colors duration-300"
                    style={{ border: `2px solid #FFFFFF` }}
                  >
                    See More
                  </button>
                  <button
                    className="px-5 py-2.5 text-base font-medium cursor-pointer transition-colors duration-300"
                    style={{
                      backgroundColor: "transparent",
                      color: accentColor,
                      border: "2px solid #FFFFFF",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = accentColor;
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.borderColor = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = accentColor;
                      e.currentTarget.style.borderColor = "#FFFFFF";
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Arrow controls ───────────────────────────────────────────────── */}
        <div
          className="absolute z-[100] flex gap-2.5 items-center"
          style={{ top: "80%", right: "52%", width: "300px", maxWidth: "30%" }}
        >
          <button
            className="w-[50px] h-[50px] rounded-full font-mono font-bold text-base text-white border-none outline-none cursor-pointer transition-colors duration-500"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.color = "#000000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = accentColor;
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onClick={() => showSlider("prev")}
          >
            {"<"}
          </button>
          <button
            className="w-[50px] h-[50px] rounded-full font-mono font-bold text-base text-white border-none outline-none cursor-pointer transition-colors duration-500"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.color = "#000000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = accentColor;
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onClick={() => showSlider("next")}
          >
            {">"}
          </button>
        </div>

        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        {/*
          width is animated by CSS (@keyframes sliderProgress), so it cannot
          live in a Tailwind class — it's driven at runtime by resetTimeAnimation().
          Everything else (height, position, z-index, color) is Tailwind.
        */}
        <div
          ref={progressRef}
          className="absolute left-0 top-0 z-[1000]"
          style={{
            height: progressHeight,
            backgroundColor: accentColor,
            width: "0%", // JS / CSS animation takes over immediately
          }}
        />
      </div>
    </>
  );
}
