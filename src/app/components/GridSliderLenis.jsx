"use client";

import { useEffect, useRef, useState } from "react";

// ─── FlowGallery ──────────────────────────────────────────────────────────────
//
// An immersive full-viewport gallery experience with:
//  • Counting preloader (0 → 100)
//  • 4-column parallax image grid (2 scroll up, 2 scroll down)
//  • "Enter the Flow" button that triggers a zoom → expand → reveal sequence
//  • Expanding hero image that grows from the leftmost visible slide
//  • Per-slide title (char-stagger animated), caption, category, paragraph
//  • Thumbnail strip for switching slides
//  • Scroll-driven parallax that shrinks the hero and fades content
//  • Lenis smooth scroll + GSAP ScrollTrigger
//  • Animated film-grain noise overlay
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// — Colours —
// bgColor          string  "#111111"         Page background
// textColor        string  "rgba(255,255,255,0.9)"  Primary text
// titleColor       string  "rgba(255,255,255,0.95)" Hero title
//
// — Typography —
// fontFamily       string  "'TheGoodMonolith', monospace"  All UI text
// titleSize        string  "clamp(2rem, 13.85vw, 14rem)"   Hero title font-size
//
// — Grid —
// gridItemWidth    string  "50vw"   Width of each column item
// gridItemHeight   string  "100vh"  Height of each column item
//
// — Enter button —
// enterLabel       string  "ENTER THE FLOW"   Button label text
// enterBg          string  "rgba(34,34,34,0.8)"  Button container background
//
// — Slides (the core data) —
// slides           array   See DEFAULT_SLIDES below.
//                          Each entry: { image, title1, title2, caption,
//                                        category, paragraph }
//                          title1/title2 are the two words of the big hero title.
//
// — Column image layout —
// columnImages     array   See DEFAULT_COLUMN_IMAGES.
//                          Flat list of { url, index } defining which images
//                          appear in each of the 4 columns (5 items each).
//                          Columns 0 & 2 scroll up; columns 1 & 3 scroll down.
//
// — Preloader —
// preloaderDuration number  2000    Ms for the counter to count 0→100
//
// — Footer —
// footerPrompt     string  "{{ GET IN TOUCH }}"
// footerEmail      string  "HI@STUDIO.COM"
// footerEmailHref  string  "mailto:hi@studio.com"
//
// — Scroll text —
// scrollLabel      string  "{{ SCROLL }}"
// ──────────────────────────────────────────────────────────────────────────────

// ─── Default slide data ───────────────────────────────────────────────────────
const DEFAULT_SLIDES = [
  {
    image:
      "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg",
    title1: "Between",
    title2: "Worlds",
    caption: "01 / PERCEPTION",
    category: "VISUAL ESSAY",
    paragraph:
      "The space between what we see and what exists is where truth resides. In stillness, we find motion. In silence, we hear everything. The photograph captures not just light, but the absence of noise.",
  },
  {
    image:
      "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg",
    title1: "Eternal",
    title2: "Now",
    caption: "02 / PRESENCE",
    category: "MEDITATION",
    paragraph:
      "There is only this moment. The past and future are constructs. These images exist in an eternal now, suspended between breaths. When we truly see, time dissolves.",
  },
  {
    image:
      "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg",
    title1: "Shadow",
    title2: "Self",
    caption: "03 / DUALITY",
    category: "EXPLORATION",
    paragraph:
      "We are both the observer and the observed. The shadow self contains what we hide, even from ourselves. These images reveal the dance between what we show and what we conceal.",
  },
  {
    image:
      "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg",
    title1: "Empty",
    title2: "Space",
    caption: "04 / ESSENCE",
    category: "CONTEMPLATION",
    paragraph:
      "Emptiness is not nothing. It is the canvas upon which everything appears. The negative space defines the subject more than the subject itself.",
  },
  {
    image:
      "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg",
    title1: "Surface",
    title2: "Depth",
    caption: "05 / TEXTURE",
    category: "SENSATION",
    paragraph:
      "The world speaks through texture. Rough against smooth. Soft against hard. The eye can feel what the hand cannot touch. Sensation transcends the visual.",
  },
  {
    image:
      "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg",
    title1: "Visible",
    title2: "Unseen",
    caption: "06 / PATTERN",
    category: "OBSERVATION",
    paragraph:
      "Chaos contains order. Order contains chaos. The city, like nature, follows invisible patterns revealed when we step back and observe without judgment.",
  },
  {
    image:
      "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg",
    title1: "Moment",
    title2: "Echo",
    caption: "07 / AWARENESS",
    category: "PRACTICE",
    paragraph:
      "Photography is not about capturing. It is about becoming aware. These images don't freeze moments; they extend them into eternity.",
  },
];

// Default column image assignments — 4 columns × 5 items each
const DEFAULT_COLUMN_IMAGES = [
  // col 0 (moveup)
  [6, 0, 1, 2, 3],
  // col 1 (movedown)
  [4, 5, 6, 0, 1],
  // col 2 (moveup)
  [2, 3, 4, 5, 6],
  // col 3 (movedown)
  [0, 1, 2, 3, 4],
];

// ─── Lightweight char-split (replaces GSAP SplitText Club plugin) ─────────────
// Wraps each character in a <span class="fg-char"> inside a
// <span class="fg-word fg-overflow-hidden"> word container so we can animate
// yPercent per character with overflow:hidden clipping.
function splitIntoChars(element) {
  const spans = element.querySelectorAll("span.content-title");
  const allChars = [];

  spans.forEach((span) => {
    const text = span.textContent;
    span.innerHTML = "";
    // Wrap the whole span in an overflow-hidden word div
    const wordWrapper = document.createElement("span");
    wordWrapper.className = "fg-word";
    wordWrapper.style.cssText =
      "display:inline-block;overflow:hidden;vertical-align:bottom;";

    text.split("").forEach((ch) => {
      const charEl = document.createElement("span");
      charEl.className = "fg-char";
      charEl.style.cssText = "display:inline-block;";
      charEl.textContent = ch === " " ? "\u00a0" : ch;
      wordWrapper.appendChild(charEl);
      allChars.push(charEl);
    });

    span.appendChild(wordWrapper);
  });

  return allChars;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GridSliderLenis({
  // Colours
  bgColor = "#111111",
  textColor = "rgba(255,255,255,0.9)",
  titleColor = "rgba(255,255,255,0.95)",
  // Typography
  fontFamily = "'TheGoodMonolith', monospace",
  titleSize = "clamp(2rem, 13.85vw, 14rem)",
  // Grid
  gridItemWidth = "50vw",
  gridItemHeight = "100vh",
  // Enter button
  enterLabel = "ENTER THE FLOW",
  enterBg = "rgba(34,34,34,0.8)",
  // Data
  slides = DEFAULT_SLIDES,
  columnImages = DEFAULT_COLUMN_IMAGES,
  // Preloader
  preloaderDuration = 2000,
  // Footer
  footerPrompt = "{{ GET IN TOUCH }}",
  footerEmail = "HI@STUDIO.COM",
  footerEmailHref = "mailto:hi@studio.com",
  // Scroll hint
  scrollLabel = "{{ SCROLL }}",
}) {
  // ── Phase ──────────────────────────────────────────────────────────────────
  // "loading"  → preloader visible, main hidden
  // "idle"     → preloader done, enter button visible
  // "entering" → animation in progress
  // "entered"  → full experience active
  const [phase, setPhase] = useState("loading");
  const [counter, setCounter] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mainRef = useRef(null);
  const gridRef = useRef(null);
  const colUpRefs = useRef([]); // .column-inner for moveup columns
  const colDownRefs = useRef([]); // .column-inner for movedown columns
  const expandRef = useRef(null); // expanding image div
  const titleRef = useRef(null); // h1 title wrapper
  const captionRef = useRef(null);
  const categoryRef = useRef(null);
  const paragraphRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const thumbnailEls = useRef([]);
  const scrollTextRef = useRef(null);
  const switchRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  // Mutable animation state — never triggers re-renders
  const stateRef = useRef({
    activeIndex: 0,
    isAnimating: false,
    isEntered: false,
    lenis: null,
  });

  // ── Script loader ──────────────────────────────────────────────────────────
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
      el.onerror = () => reject(new Error(`[FlowGallery] Failed: ${src}`));
      document.head.appendChild(el);
    });

  // ── Animate title chars ────────────────────────────────────────────────────
  // Called after innerHTML is updated. Returns a GSAP timeline.
  const animateTitleChars = (gsap, delay = 0) => {
    const el = titleRef.current;
    if (!el) return gsap.timeline();
    gsap.set(el, { opacity: 1 });
    const chars = splitIntoChars(el);
    const spans = el.querySelectorAll("span.content-title");
    const tl = gsap.timeline();

    spans.forEach((span, si) => {
      const spanChars = span.querySelectorAll(".fg-char");
      tl.from(
        spanChars,
        {
          yPercent: 100,
          opacity: 0.2,
          duration: 0.9,
          stagger: 0.03,
          ease: "power2.out",
        },
        si === 0 ? delay : "-=0.5",
      );
    });

    return tl;
  };

  // ── Animate paragraph chars ────────────────────────────────────────────────
  const animateParagraphChars = (gsap, el, delay = 0) => {
    if (!el) return gsap.timeline();
    gsap.set(el, { opacity: 1 });
    // Split paragraph into individual chars
    const text = el.textContent;
    el.innerHTML = "";
    const chars = text.split("").map((ch) => {
      const s = document.createElement("span");
      s.style.cssText = "display:inline-block;";
      s.textContent = ch === " " ? "\u00a0" : ch;
      el.appendChild(s);
      return s;
    });
    const tl = gsap.timeline();
    tl.from(chars, {
      yPercent: 100,
      opacity: 0,
      duration: 0.7,
      stagger: 0.01,
      ease: "power2.out",
      delay,
    });
    return tl;
  };

  // ── Update all slide content ───────────────────────────────────────────────
  const updateSlideContent = (gsap, index) => {
    const slide = slides[index];
    if (!slide) return;

    // Update DOM text
    if (titleRef.current) {
      titleRef.current.innerHTML = `
        <span class="content-title">${slide.title1}</span>
        <span class="content-title">${slide.title2}</span>
      `;
    }
    if (paragraphRef.current)
      paragraphRef.current.textContent = slide.paragraph;
    if (captionRef.current) captionRef.current.textContent = slide.caption;
    if (categoryRef.current) categoryRef.current.textContent = slide.category;

    const master = gsap.timeline();
    master.fromTo(
      [captionRef.current, categoryRef.current].filter(Boolean),
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      0,
    );
    master.add(animateTitleChars(gsap, 0.05), 0);
    master.add(animateParagraphChars(gsap, paragraphRef.current, 0.4), 0);

    // Sync active thumbnail
    thumbnailEls.current.forEach((th, i) => {
      th?.classList.toggle("fg-thumb-active", i === index);
    });

    return master;
  };

  // ── Find leftmost visible image ────────────────────────────────────────────
  const findLeftmostImage = () => {
    const images = document.querySelectorAll(".fg-col-img");
    let best = null,
      bestX = Infinity;
    images.forEach((img) => {
      const r = img.getBoundingClientRect();
      if (
        r.left < window.innerWidth &&
        r.right > 0 &&
        r.top < window.innerHeight &&
        r.bottom > 0
      ) {
        if (r.left < bestX) {
          bestX = r.left;
          best = img;
        }
      }
    });
    return best;
  };

  // ── Enter the flow ─────────────────────────────────────────────────────────
  const enterTheFlow = () => {
    const s = stateRef.current;
    if (s.isAnimating || s.isEntered) return;
    s.isAnimating = true;
    setPhase("entering");

    const { gsap, ScrollTrigger, Lenis } = window;
    if (!gsap) return;

    const sw = switchRef.current;
    const expImg = expandRef.current;
    const grid = gridRef.current;

    // Fade out enter button
    gsap.to(sw, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        if (sw) sw.style.display = "none";
      },
    });

    contentRef.current?.classList.add("fg-content-current");

    const tl = gsap.timeline({
      onComplete: () => {
        s.isAnimating = false;
        s.isEntered = true;
        setPhase("entered");

        // Switch fixed → absolute so the HUD scrolls with the page.
        // Only the two top-level fixed elements need switching;
        // caption/category/paragraph/thumbnails/scroll-hint are now
        // children of contentRef and inherit its position.
        [expImg, contentRef.current].forEach((el) => {
          if (el) el.style.position = "absolute";
        });

        // Init Lenis
        if (Lenis && !s.lenis) {
          s.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: false,
            touchMultiplier: 2,
          });
          if (ScrollTrigger) s.lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time) => s.lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
        }

        document.body.style.overflow = "auto";

        gsap.to(scrollTextRef.current, {
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
        });

        // Scroll-driven parallax
        if (ScrollTrigger) {
          ScrollTrigger.create({
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              gsap.set(heroRef.current, { height: `${100 - p * 40}vh` });
              gsap.set(expImg, {
                scale: 1 + p * 0.1,
                y: `-${p * 25}%`,
                width: "100vw",
                height: `${100 + p * 30}vh`,
              });
              // Entire HUD grid fades and rises together as one unit
              gsap.set(contentRef.current, {
                y: `-${p * 30}%`,
                opacity: 1 - p * 0.8,
              });
            },
          });
        }
      },
    });

    // 1 — Zoom the grid to full scale and split columns
    tl.to(grid, { scale: 1, duration: 0.8, ease: "power2.inOut" }, 0);
    colUpRefs.current.forEach((el) => {
      if (el)
        tl.to(el, { y: "-200vh", duration: 0.8, ease: "power2.inOut" }, 0);
    });
    colDownRefs.current.forEach((el) => {
      if (el) tl.to(el, { y: "200vh", duration: 0.8, ease: "power2.inOut" }, 0);
    });

    // 2 — Grab leftmost image, position expanding div on top of it
    tl.add(() => {
      const leftImg = findLeftmostImage();
      if (!leftImg || !expImg) return;
      const r = leftImg.getBoundingClientRect();
      const bg = window.getComputedStyle(leftImg).backgroundImage;
      Object.assign(expImg.style, {
        backgroundImage: bg,
        top: `${r.top}px`,
        left: `${r.left}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        opacity: "1",
      });
      s.activeIndex = parseInt(leftImg.dataset.index ?? "0", 10);
    }, 0.8);

    // 3 — Expand the image to full width
    tl.to(expImg, { width: "100vw", duration: 0.7, ease: "power2.inOut" }, 1.0);
    tl.to(grid, { opacity: 0, duration: 0.3 }, 1.2);

    // 4 — Reveal content and thumbnails
    tl.add(() => updateSlideContent(gsap, s.activeIndex), 1.8);
    tl.set(thumbnailsRef.current, { opacity: 1 }, 2.2);
    tl.to(
      thumbnailEls.current.filter(Boolean),
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      2.3,
    );
  };

  // ── Preloader counter ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = 20;
    const increment = 100 / (preloaderDuration / interval);
    let current = 0;
    const id = setInterval(() => {
      current += increment;
      if (current >= 100) {
        current = 100;
        clearInterval(id);
        setCounter(100);
        // Short pause then transition to idle
        setTimeout(() => setPhase("idle"), 500);
      } else {
        setCounter(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(id);
  }, [phase, preloaderDuration]);

  // ── Boot: load GSAP + Lenis, init grid ────────────────────────────────────
  useEffect(() => {
    if (phase !== "idle") return;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        ),
      )
      .then(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js",
        ),
      )
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap) return;
        if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

        // Reveal main, animate columns in
        gsap.set(mainRef.current, { opacity: 1, visibility: "visible" });
        gsap
          .timeline()
          .set(gridRef.current, { opacity: 1 })
          .fromTo(
            ".fg-column",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              duration: 0.6,
              ease: "power2.out",
            },
          );
      })
      .catch((e) => console.error(e.message));

    // Scroll → hide scroll hint text once user scrolls past 100px
    const onScroll = () => {
      const { gsap } = window;
      if (!gsap || !stateRef.current.isEntered) return;
      gsap.to(scrollTextRef.current, {
        opacity: window.scrollY > 100 ? 0 : 1,
        duration: 0.3,
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Cleanup Lenis on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stateRef.current.lenis?.destroy?.();
    };
  }, []);

  // ── Thumbnail click handler ────────────────────────────────────────────────
  const handleThumbClick = (index) => {
    const s = stateRef.current;
    if (!s.isEntered || s.isAnimating) return;
    const { gsap } = window;
    if (!gsap) return;

    s.activeIndex = index;
    const expImg = expandRef.current;

    gsap.to(expImg, {
      opacity: 0.5,
      duration: 0.3,
      onComplete: () => {
        if (expImg)
          expImg.style.backgroundImage = `url(${slides[index].image})`;
        gsap.to(expImg, { opacity: 1, duration: 0.3 });
      },
    });

    if (captionRef.current)
      gsap.set(captionRef.current, { opacity: 0, y: -20 });
    if (categoryRef.current)
      gsap.set(categoryRef.current, { opacity: 0, y: -20 });
    updateSlideContent(gsap, index);
  };

  // ── Derived: is preloader showing? ────────────────────────────────────────
  const showPreloader = phase === "loading";
  const showMain = phase !== "loading";

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Scoped styles: noise overlay, grid item sizes, column scroll ── */}
      <style>{`
        @font-face {
          font-family: "TheGoodMonolith";
          font-style: normal; font-weight: 500;
          src: url("https://fonts.cdnfonts.com/s/32398/TheGoodMonolith.woff") format("woff");
        }
        /* Noise overlay */
        .fg-root::before {
          content: "";
          position: fixed; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0;
          background-size: 300px 300px;
          animation: fg-noise 0.3s steps(5) infinite;
          opacity: 0.9; will-change: transform;
          z-index: 100; pointer-events: none;
        }
        @keyframes fg-noise {
          0%   { transform: translate(0,0); }   10% { transform: translate(-2%,-3%); }
          20%  { transform: translate(-4%,2%); } 30% { transform: translate(2%,-4%); }
          40%  { transform: translate(-2%,5%); } 50% { transform: translate(-4%,2%); }
          60%  { transform: translate(3%,0); }   70% { transform: translate(0,3%); }
          80%  { transform: translate(-3%,0); }  90% { transform: translate(2%,2%); }
          100% { transform: translate(1%,0); }
        }
        /* Column item sizing from props — runtime values can't go in Tailwind */
        .fg-col-item   { width: ${gridItemWidth}; height: ${gridItemHeight}; }
        /* Active thumbnail border */
        .fg-thumb-active { border: 2px solid #fff !important; }
        /* Content pointer-events when active */
        .fg-content-current { pointer-events: auto !important; }
      `}</style>

      <div
        className="fg-root relative w-full overflow-x-hidden"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily,
          overflowY: showPreloader ? "hidden" : undefined,
        }}
      >
        {/* ── Preloader ── */}
        {showPreloader && (
          <div
            className="fixed inset-0 flex items-center justify-center z-[10000]"
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-[2rem] text-white" style={{ fontFamily }}>
              {counter}
            </span>
          </div>
        )}

        {/* ── Main ── */}
        <main
          ref={mainRef}
          className="w-full relative"
          style={{
            opacity: showMain ? undefined : 0,
            visibility: showMain ? undefined : "hidden",
          }}
        >
          {/* ── Hero section ── */}
          <div
            ref={heroRef}
            className="w-full h-screen relative overflow-hidden will-change-transform"
          >
            {/* Enter button */}
            {(phase === "idle" || phase === "entering") && (
              <div
                ref={switchRef}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-5 px-5 py-2.5 rounded"
                style={{ backgroundColor: enterBg }}
              >
                <button
                  className="relative inline-block cursor-pointer text-[14px] tracking-[1px] bg-transparent border-0 px-2.5 py-1 text-white group"
                  style={{ fontFamily }}
                  onClick={enterTheFlow}
                >
                  {/* Indicator dot */}
                  <span className="absolute w-[5px] h-[5px] bg-[#f0f0f0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-1/2 -translate-y-1/2 -left-2" />
                  {enterLabel}
                </button>
              </div>
            )}

            {/* 4-column image grid */}
            <div
              ref={gridRef}
              className="w-full h-screen relative flex justify-center items-center will-change-transform"
              style={{ transform: "scale(0.5, 0.4)", opacity: 0 }}
            >
              {columnImages.map((colImgIndices, ci) => {
                const isUp = ci % 2 === 0;
                return (
                  <div
                    key={ci}
                    className="fg-column relative grid will-change-transform"
                  >
                    <div
                      ref={(el) => {
                        if (isUp) colUpRefs.current[Math.floor(ci / 2)] = el;
                        else colDownRefs.current[Math.floor(ci / 2)] = el;
                      }}
                      className="relative will-change-transform"
                    >
                      {colImgIndices.map((slideIdx, ii) => (
                        <figure
                          key={ii}
                          className="fg-col-item relative z-[1] m-0"
                        >
                          <div className="w-full h-full relative overflow-hidden">
                            <div
                              className="fg-col-img w-full h-full bg-cover bg-center will-change-transform"
                              style={{
                                backgroundImage: `url(${slides[slideIdx]?.image})`,
                              }}
                              data-index={slideIdx}
                            />
                          </div>
                        </figure>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expanding hero image */}
            <div
              ref={expandRef}
              className="fixed top-0 left-0 h-screen bg-cover bg-center will-change-transform"
              style={{ width: "50vw", zIndex: 85, opacity: 0 }}
            />

            {/*
              ── Single HUD overlay — 3-row grid ──────────────────────────────
              Row 1 (top bar):    caption left  |  category right
              Row 2 (middle):     title centred across full width
              Row 3 (bottom bar): paragraph left + scroll hint  |  thumbnails right

              All five previously-scattered fixed elements now live here so
              they can never overlap each other. GSAP still targets each
              individual ref for opacity/y animations — only the layout
              container changes.
            */}
            <div
              ref={contentRef}
              className="fg-content-current pointer-events-none fixed inset-0 w-full h-screen grid"
              style={{
                gridTemplateRows: "auto 1fr auto",
                zIndex: 90,
              }}
            >
              {/* ── Row 1: top bar ── */}
              <div className="flex items-start justify-between px-10 pt-10">
                <div
                  ref={captionRef}
                  className="text-[0.85rem] tracking-[1px] opacity-0"
                  style={{ fontFamily }}
                >
                  {slides[0]?.caption}
                </div>
                <div
                  ref={categoryRef}
                  className="text-[0.85rem] tracking-[1px] opacity-0"
                  style={{ fontFamily }}
                >
                  {slides[0]?.category}
                </div>
              </div>

              {/* ── Row 2: title centred vertically ── */}
              <div className="flex items-center justify-center">
                <h1
                  ref={titleRef}
                  className="opacity-0 uppercase m-0 font-medium w-full flex justify-center pointer-events-none"
                  style={{
                    fontSize: titleSize,
                    fontFamily,
                    color: titleColor,
                    gap: "3vw",
                    alignItems: "flex-start",
                    padding: "0 0.5rem",
                  }}
                >
                  <span
                    className="content-title"
                    style={{
                      display: "block",
                      lineHeight: 1,
                      paddingTop: "0.075em",
                    }}
                  >
                    {slides[0]?.title1}
                  </span>
                  <span
                    className="content-title"
                    style={{
                      display: "block",
                      lineHeight: 1,
                      paddingTop: "0.075em",
                      marginTop: 40,
                    }}
                  >
                    {slides[0]?.title2}
                  </span>
                </h1>
              </div>

              {/* ── Row 3: bottom bar ── */}
              <div className="flex items-end justify-between px-10 pb-6 gap-8">
                {/* Left: paragraph + scroll hint stacked */}
                <div className="flex flex-col gap-4 max-w-[420px]">
                  <div
                    ref={paragraphRef}
                    className="opacity-0 leading-[1.4] text-[0.85rem]"
                    style={{ fontFamily, color: "#f0f0f0" }}
                  >
                    {slides[0]?.paragraph}
                  </div>
                  <div
                    ref={scrollTextRef}
                    className="opacity-0 text-[13px] tracking-[1px] transition-opacity duration-500"
                    style={{ fontFamily, color: textColor }}
                  >
                    {scrollLabel}
                  </div>
                </div>

                {/* Right: thumbnail strip */}
                <div
                  ref={thumbnailsRef}
                  className="flex gap-2.5 opacity-0 pointer-events-auto flex-shrink-0"
                >
                  {slides.map((slide, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        thumbnailEls.current[i] = el;
                      }}
                      className="w-[60px] h-[40px] rounded overflow-hidden cursor-pointer opacity-0 translate-y-5 hover:border-2 hover:border-[rgba(255,255,255,0.7)] transition-[border] duration-300"
                      data-index={i}
                      onClick={() => handleThumbClick(i)}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* /hero-section */}

          {/* Dummy scroll area */}
          <div
            className="w-full relative z-[80] mt-[100vh]"
            style={{ minHeight: "200vh", backgroundColor: bgColor }}
          />

          {/* Footer */}
          <div
            className="w-full h-[50vh] relative z-[80] flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: bgColor }}
          >
            <p
              className="text-[1.2rem] tracking-[2px] mb-4"
              style={{ fontFamily }}
            >
              {footerPrompt}
            </p>
            <a
              href={footerEmailHref}
              className="text-[1.5rem] tracking-[1px] no-underline transition-colors duration-300 hover:text-white"
              style={{ color: textColor, fontFamily }}
            >
              {footerEmail}
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
