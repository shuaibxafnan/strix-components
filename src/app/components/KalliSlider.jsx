"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── TileSlider ───────────────────────────────────────────────────────────────
//
// A full-screen image slideshow with a modern minimal "next" trigger.
// Core GSAP slide mechanic preserved from original; visual language
// updated to current-gen portfolio/agency aesthetic:
//   – small monospaced counter top-left
//   – compact headline, lowercase, tight tracking
//   – slim dark pill bottom-right replaces tall white card
//   – thin progress bar at the very bottom edge
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// tiles            array    DEFAULT_TILES   Each item:
//                                             image     string  Full-size URL
//                                             thumb     string  Thumb URL
//                                             title     string  Headline (HTML ok, <br /> ok)
//                                             category  string  Small label above headline
//
// accentColor      string   "#e8ff57"       Progress bar + arrow accent (yellow-green)
// overlayOpacity   number   0.38            Dark gradient overlay over image (0–1)
//
// titleSize        string   "3.6rem"        Headline font-size
// titleLeft        string   "4rem"          Headline distance from left edge
//
// pillBg           string   "rgba(0,0,0,0.72)"  "Next" pill background
// pillBlur         string   "12px"              backdrop-filter blur on pill
//
// swingDuration    number   0.7             Slide transition duration in seconds
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TILES = [
  {
    image:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/ui8-alex-shutin-kKvQJ6rK6S4-unsplash.jpg",
    thumb:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/ui8-alex-shutin-kKvQJ6rK6S4-unsplash--thumb.jpg",
    title: "Summer treads on<br />the heels of spring.",
    category: "Landscapes",
  },
  {
    image:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/ui8-marat-gilyadzinov-MYadhrkenNg-unsplash.jpg",
    thumb:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/ui8-marat-gilyadzinov-MYadhrkenNg-unsplash--thumb.jpg",
    title: "Jellyfish make<br />everything better.",
    category: "Ocean",
  },
  {
    image:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/ui8-luca-bravo-bTxMLuJOff4-unsplash.jpg",
    thumb:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/ui8-luca-bravo-bTxMLuJOff4-unsplash--thumb.jpg",
    title: "Design adds value<br />faster than cost.",
    category: "Abstract",
  },
];

// ── Scoped styles — keyframes + font import only.
// Runtime values (colors, sizes) go on inline style={{}}.
// Static layout goes in Tailwind.
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&family=Space+Mono&display=swap');

  .ts-root { font-family: 'Space Grotesk', sans-serif; }
  .ts-mono  { font-family: 'Space Mono', monospace; }

  @keyframes ts-bar {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .ts-progress-fill {
    transform-origin: left center;
    animation: ts-bar var(--ts-dur, 0.7s) ease-out forwards;
  }

  @keyframes ts-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ts-cat-anim { animation: ts-fadein 0.45s ease-out both; }

  .ts-next-btn:hover .ts-arrow-wrap {
    transform: translateX(3px);
  }
  .ts-arrow-wrap {
    transition: transform 0.2s ease;
  }
`;

export default function KalliSlider({
  tiles = DEFAULT_TILES,
  accentColor = "#e8ff57",
  overlayOpacity = 0.38,
  titleSize = "3.6rem",
  titleLeft = "4rem",
  pillBg = "rgba(0,0,0,0.72)",
  pillBlur = "12px",
  swingDuration = 0.7,
}) {
  // ── DOM refs ───────────────────────────────────────────────────────────────
  const rootRef = useRef(null);
  const imgFirstRef = useRef(null);
  const imgLastRef = useRef(null);
  const titleWrapRef = useRef(null); // overflow:hidden clip
  const titleContRef = useRef(null); // gsap scrolls this
  const titleFirstRef = useRef(null);
  const titleLastRef = useRef(null);
  const catFirstRef = useRef(null);
  const catLastRef = useRef(null);
  const counterRef = useRef(null); // "01 / 03"
  const progressRef = useRef(null); // fill bar element
  const pillTitleFirstRef = useRef(null);
  const pillTitleLastRef = useRef(null);
  const pillThumbFirstRef = useRef(null);
  const pillThumbLastRef = useRef(null);
  const pillRef = useRef(null); // the whole pill (for slide-in)

  // ── Mutable state ──────────────────────────────────────────────────────────
  const activeIdxRef = useRef(0);
  const busyRef = useRef(false);
  const gsapRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const total = tiles.length;

  const getNext = useCallback(
    (skip = 0) => (activeIdxRef.current + 1 + skip) % total,
    [total],
  );

  const pad = (n) => String(n + 1).padStart(2, "0");

  const updateCounter = useCallback(() => {
    if (counterRef.current) {
      counterRef.current.textContent =
        pad(activeIdxRef.current) + " / " + pad(total - 1);
    }
  }, [total]);

  // Manual cover-fit — same reason as original (GSAP + CSS cover stutters)
  const fitImages = useCallback(() => {
    if (!rootRef.current) return;
    const W = rootRef.current.clientWidth;
    const H = rootRef.current.clientHeight;
    const ratio = W / H;
    const imgRatio = 3000 / 2000;
    [imgFirstRef.current, imgLastRef.current].forEach((img) => {
      if (!img) return;
      if (ratio < imgRatio) {
        img.style.width = "auto";
        img.style.height = "100%";
      } else {
        img.style.width = "100%";
        img.style.height = "auto";
      }
    });
  }, []);

  // Restart the progress bar CSS animation by swapping the element's key trick
  // (we toggle a class off/on so the animation re-fires)
  const resetProgress = useCallback(() => {
    const el = progressRef.current;
    if (!el) return;
    el.classList.remove("ts-progress-fill");
    // force reflow
    void el.offsetWidth;
    el.style.setProperty("--ts-dur", swingDuration + 1.2 + "s");
    el.classList.add("ts-progress-fill");
  }, [swingDuration]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
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
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap) return;
        gsapRef.current = gsap;

        const ni0 = getNext(0);
        const ni1 = getNext(1);

        // Seed content (empty at SSR to avoid hydration mismatch)
        imgFirstRef.current.src = tiles[0].image;
        imgLastRef.current.src = tiles[ni0].image;
        titleFirstRef.current.innerHTML = tiles[0].title;
        titleLastRef.current.innerHTML = tiles[ni0].title;
        if (catFirstRef.current)
          catFirstRef.current.textContent = tiles[0].category;
        if (catLastRef.current)
          catLastRef.current.textContent = tiles[ni0].category;
        pillTitleFirstRef.current.textContent = tiles[ni0].category || "";
        pillTitleLastRef.current.textContent = tiles[ni1].category || "";
        pillThumbFirstRef.current.src = tiles[ni0].thumb;
        pillThumbLastRef.current.src = tiles[ni1].thumb;

        updateCounter();
        fitImages();
        resetProgress();

        // ── GSAP .set() for anything GSAP will animate ─────────────────────
        gsap.set(imgFirstRef.current, {
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          opacity: 1,
          scale: 1,
        });
        gsap.set(imgLastRef.current, {
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          opacity: 0.001,
          scale: 1.08,
        });
        gsap.set(pillThumbFirstRef.current, {
          position: "absolute",
          top: "50%",
          left: 0,
          y: "-50%",
          opacity: 1,
          scale: 1,
        });
        gsap.set(pillThumbLastRef.current, {
          position: "absolute",
          top: "50%",
          left: 0,
          y: "-50%",
          opacity: 0,
          scale: 1.5,
        });
        gsap.set(titleContRef.current, {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        });
        gsap.set(titleFirstRef.current, { opacity: 1 });
        gsap.set(titleLastRef.current, { opacity: 0 });
        gsap.set(pillTitleFirstRef.current, { opacity: 1 });
        gsap.set(pillTitleLastRef.current, { opacity: 0 });
      })
      .catch((e) => console.error("[TileSlider] GSAP load failed:", e.message));

    const onResize = () => fitImages();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [tiles, getNext, fitImages, updateCounter, resetProgress]);

  // ── Transition ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    const gsap = gsapRef.current;
    if (!gsap || busyRef.current) return;
    busyRef.current = true;

    activeIdxRef.current = getNext(0);
    const ni0 = getNext(0);
    const ni1 = getNext(1);

    updateCounter();
    resetProgress();

    // Refresh category label
    if (catFirstRef.current)
      catFirstRef.current.textContent = tiles[activeIdxRef.current].category;

    // ── Title scroll ────────────────────────────────────────────────────────
    const d = swingDuration;
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(titleContRef.current, { yPercent: 0 });
          gsap.set(titleFirstRef.current, { opacity: 1 });
          gsap.set(titleLastRef.current, { opacity: 0 });
          titleFirstRef.current.innerHTML = tiles[activeIdxRef.current].title;
          titleLastRef.current.innerHTML = tiles[ni0].title;
        },
      })
      .to(
        titleContRef.current,
        { ease: "power2.out", yPercent: -50, duration: d * 1.1 },
        "ta",
      )
      .to(titleFirstRef.current, { opacity: 0, duration: d * 0.7 }, "ta");

    // ── Pill label cross-fade ───────────────────────────────────────────────
    const labelTl = gsap.timeline({ paused: true });
    labelTl
      .to(pillTitleFirstRef.current, { opacity: 0, duration: 0.3 }, "lc")
      .to(pillTitleLastRef.current, { opacity: 1, duration: 0.3 }, "lc");

    // ── Main image + pill animation ─────────────────────────────────────────
    gsap
      .timeline({
        onComplete: () => {
          busyRef.current = false;

          // Reset all GSAP-owned values
          gsap.set(imgFirstRef.current, { opacity: 1, scale: 1 });
          gsap.set(imgLastRef.current, { opacity: 0.001, scale: 1.08 });
          gsap.set(pillThumbFirstRef.current, { opacity: 1, scale: 1 });
          gsap.set(pillThumbLastRef.current, { opacity: 0, scale: 1.5 });
          gsap.set(pillTitleFirstRef.current, { opacity: 1 });
          gsap.set(pillTitleLastRef.current, { opacity: 0 });
          gsap.set(pillRef.current, { xPercent: 0 });

          imgFirstRef.current.src = tiles[activeIdxRef.current].image;
          imgLastRef.current.src = tiles[ni0].image;
          pillThumbFirstRef.current.src = tiles[ni0].thumb;
          pillThumbLastRef.current.src = tiles[ni1].thumb;
          pillTitleFirstRef.current.textContent = tiles[ni0].category || "";
          pillTitleLastRef.current.textContent = tiles[ni1].category || "";
        },
      })
      // Pill briefly slides out-right to show thumb swap, then returns
      .to(pillRef.current, {
        ease: "power1.out",
        xPercent: 110,
        duration: d * 0.85,
      })
      // New full-size image scales + fades in
      .to(
        imgLastRef.current,
        { ease: "sine.out", opacity: 1, scale: 1, duration: d },
        0,
      )
      // Thumb swap: hide first, reveal second
      .to(pillThumbFirstRef.current, { opacity: 0, duration: 0 }, "thumbSwap")
      .to(
        pillThumbLastRef.current,
        { ease: "sine.out", opacity: 1, scale: 1, duration: d * 0.8 },
        "thumbSwap",
      )
      // Pill slides back in
      .to(
        pillRef.current,
        { ease: "back.out(1.4)", xPercent: 0, duration: d * 0.7 },
        "thumbSwap+=0.1",
      )
      // Labels cross-fade during the pill return
      .add(() => labelTl.play(), "-=0.4");
  }, [tiles, getNext, swingDuration, updateCounter, resetProgress]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={rootRef}
      className="ts-root relative w-full h-screen overflow-hidden bg-black select-none"
    >
      <style>{STYLES}</style>

      {/* ── Background images ── */}
      <img ref={imgFirstRef} alt="" className="absolute" />
      <img ref={imgLastRef} alt="" className="absolute" />

      {/* ── Dark gradient overlay for text legibility ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0," +
            overlayOpacity * 1.4 +
            ") 0%, rgba(0,0,0," +
            overlayOpacity * 0.6 +
            ") 60%, rgba(0,0,0," +
            overlayOpacity * 0.2 +
            ") 100%)",
        }}
      />

      {/* ── Top-left counter ── */}
      {/*
        Monospaced "01 / 03" — tiny, uppercase-ish, sits at the very
        corner. A simple editorial device that immediately signals
        "there is more to see".
      */}
      <div
        className="ts-mono absolute top-[2.4rem] left-0 text-white/60 tracking-widest uppercase"
        style={{ left: titleLeft, fontSize: "1.1rem" }}
      >
        <span ref={counterRef} />
      </div>

      {/* ── Category label ── */}
      {/*
        Small label above the headline — changes with each slide.
        GSAP-independent: we just overwrite .textContent so React
        doesn't fight us.
      */}
      <div
        className="ts-cat-anim absolute text-white/50 tracking-[0.18em] uppercase"
        style={{ left: titleLeft, top: "calc(50% - 10rem)", fontSize: "1rem" }}
      >
        <span ref={catFirstRef} />
      </div>

      {/* ── Headline ── */}
      {/*
        Overflow:hidden clip. GSAP scrolls titleContRef upward (yPercent -50),
        so the "last" text (below the first in DOM flow) scrolls into view.
        The &nbsp;<br/>&nbsp; spacer sets a natural line-height before
        GSAP runs so the clip box has height.
      */}
      <div
        ref={titleWrapRef}
        className="absolute overflow-hidden font-light leading-[1.2] text-white"
        style={{
          top: "50%",
          left: titleLeft,
          fontSize: titleSize,
          width: "55%",
          letterSpacing: "-0.02em",
          marginTop: "-1rem",
        }}
      >
        &nbsp;
        <br />
        &nbsp;
        <div ref={titleContRef}>
          <div
            ref={titleFirstRef}
            className="absolute top-0 left-0 w-full"
            dangerouslySetInnerHTML={{ __html: "" }}
          />
          <div
            ref={titleLastRef}
            className="absolute top-0 left-0 w-full opacity-0"
            dangerouslySetInnerHTML={{ __html: "" }}
          />
        </div>
      </div>

      {/* ── Progress bar ── */}
      {/*
        1px line at the very bottom edge. Accent color, CSS animation
        restarted on each slide change via the resetProgress() helper.
      */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          ref={progressRef}
          className="ts-progress-fill absolute inset-0"
          style={{ background: accentColor, transformOrigin: "left center" }}
        />
      </div>

      {/* ── "Next" pill ── */}
      {/*
        Replaces the original tall white panel + preview strip.
        A compact glassmorphism pill: thumbnail thumbnail square on the left,
        label + arrow on the right. GSAP sweeps it off-screen right
        (xPercent 110) during the transition then springs it back.
      */}
      <button
        ref={pillRef}
        onClick={handleNext}
        aria-label="Next slide"
        className="ts-next-btn absolute bottom-[3.2rem] right-[3.2rem] flex items-center gap-0 overflow-hidden cursor-pointer border-0 p-0 z-50 [-webkit-tap-highlight-color:rgba(0,0,0,0)]"
        style={{
          borderRadius: "1.2rem",
          background: pillBg,
          backdropFilter: "blur(" + pillBlur + ")",
          WebkitBackdropFilter: "blur(" + pillBlur + ")",
          border: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Thumbnail rectangle */}
        <span
          className="relative overflow-hidden flex-shrink-0"
          style={{ width: "7rem", height: "8rem" }}
        >
          <img ref={pillThumbFirstRef} alt="" className="absolute w-full" />
          <img
            ref={pillThumbLastRef}
            alt=""
            className="absolute w-full opacity-0"
          />
        </span>

        {/* Label + arrow */}
        <span className="flex items-center gap-[1.6rem] px-[1.8rem]">
          {/* "Up next" label + slide title stacked */}
          <span className="flex flex-col items-start gap-[0.4rem]">
            <span
              className="ts-mono text-white/40 uppercase tracking-widest"
              style={{ fontSize: "0.72rem" }}
            >
              up next
            </span>
            <span
              className="block text-white font-light"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.3,
                position: "relative",
                minWidth: "7rem",
              }}
            >
              <span ref={pillTitleFirstRef} className="absolute top-0 left-0" />
              <span
                ref={pillTitleLastRef}
                className="absolute top-0 left-0 opacity-0"
              />
              {/* Spacer so the span has height */}
              &nbsp;
            </span>
          </span>

          {/* Arrow */}
          <span
            className="ts-arrow-wrap flex-shrink-0"
            style={{ color: accentColor }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}
