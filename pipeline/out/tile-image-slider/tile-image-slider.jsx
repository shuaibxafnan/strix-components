"use client";

import { useEffect, useRef, useCallback } from "react";

const DEFAULT_TILES = [
  {
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1600&q=80",
    thumb:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=400&q=60",
    alt: "Rolling green landscape in spring",
    title: "Summer treads on<br />the heels of spring.",
    category: "Landscapes",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1600&q=80",
    thumb:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=400&q=60",
    alt: "Jellyfish glowing in dark water",
    title: "Jellyfish make<br />everything better.",
    category: "Ocean",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
    thumb:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=400&q=60",
    alt: "Abstract colorful design",
    title: "Design adds value<br />faster than cost.",
    category: "Abstract",
  },
];

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

export default function TileImageSlider({
  tiles = DEFAULT_TILES,
  accentColor = "#e8ff57",
  overlayOpacity = 0.38,
  titleSize = "clamp(2rem, 6vw, 3.6rem)",
  titleLeft = "clamp(1.25rem, 4vw, 4rem)",
  nextLabel = "up next",
  buttonAriaLabel = "Next slide",
  className = "",
  pillBg = "rgba(0,0,0,0.72)",
  pillBlur = "12px",
  swingDuration = 0.7,
}) {

  const rootRef = useRef(null);
  const imgFirstRef = useRef(null);
  const imgLastRef = useRef(null);
  const titleWrapRef = useRef(null);
  const titleContRef = useRef(null);
  const titleFirstRef = useRef(null);
  const titleLastRef = useRef(null);
  const catFirstRef = useRef(null);
  const catLastRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const pillTitleFirstRef = useRef(null);
  const pillTitleLastRef = useRef(null);
  const pillThumbFirstRef = useRef(null);
  const pillThumbLastRef = useRef(null);
  const pillRef = useRef(null);

  const activeIdxRef = useRef(0);
  const busyRef = useRef(false);
  const gsapRef = useRef(null);
  const timelinesRef = useRef([]);

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

  const resetProgress = useCallback(() => {
    const el = progressRef.current;
    if (!el) return;
    el.classList.remove("ts-progress-fill");

    void el.offsetWidth;
    el.style.setProperty("--ts-dur", swingDuration + 1.2 + "s");
    el.classList.add("ts-progress-fill");
  }, [swingDuration]);

  useEffect(() => {
    let cancelled = false;

    import("gsap")
      .then((mod) => {
        const gsap = mod.gsap || mod.default;
        if (cancelled || !gsap || !imgFirstRef.current) return;
        gsapRef.current = gsap;

        const ni0 = getNext(0);
        const ni1 = getNext(1);

        imgFirstRef.current.src = tiles[0].image;
        imgFirstRef.current.alt = tiles[0].alt || "";
        imgLastRef.current.src = tiles[ni0].image;
        imgLastRef.current.alt = tiles[ni0].alt || "";
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
      .catch(() => {});

    const onResize = () => fitImages();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      const gsap = gsapRef.current;
      if (gsap) {
        timelinesRef.current.forEach((tl) => tl.kill());
        timelinesRef.current = [];
        gsap.killTweensOf([
          imgFirstRef.current,
          imgLastRef.current,
          titleContRef.current,
          titleFirstRef.current,
          titleLastRef.current,
          pillRef.current,
          pillThumbFirstRef.current,
          pillThumbLastRef.current,
          pillTitleFirstRef.current,
          pillTitleLastRef.current,
        ]);
      }
      busyRef.current = false;
    };
  }, [tiles, getNext, fitImages, updateCounter, resetProgress]);

  const handleNext = useCallback(() => {
    const gsap = gsapRef.current;
    if (!gsap || busyRef.current) return;
    busyRef.current = true;

    activeIdxRef.current = getNext(0);
    const ni0 = getNext(0);
    const ni1 = getNext(1);

    updateCounter();
    resetProgress();

    if (catFirstRef.current)
      catFirstRef.current.textContent = tiles[activeIdxRef.current].category;

    const d = swingDuration;
    const titleTl = gsap
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
    timelinesRef.current.push(titleTl);

    const labelTl = gsap.timeline({ paused: true });
    labelTl
      .to(pillTitleFirstRef.current, { opacity: 0, duration: 0.3 }, "lc")
      .to(pillTitleLastRef.current, { opacity: 1, duration: 0.3 }, "lc");

    const mainTl = gsap
      .timeline({
        onComplete: () => {
          busyRef.current = false;

          gsap.set(imgFirstRef.current, { opacity: 1, scale: 1 });
          gsap.set(imgLastRef.current, { opacity: 0.001, scale: 1.08 });
          gsap.set(pillThumbFirstRef.current, { opacity: 1, scale: 1 });
          gsap.set(pillThumbLastRef.current, { opacity: 0, scale: 1.5 });
          gsap.set(pillTitleFirstRef.current, { opacity: 1 });
          gsap.set(pillTitleLastRef.current, { opacity: 0 });
          gsap.set(pillRef.current, { xPercent: 0 });

          imgFirstRef.current.src = tiles[activeIdxRef.current].image;
          imgFirstRef.current.alt = tiles[activeIdxRef.current].alt || "";
          imgLastRef.current.src = tiles[ni0].image;
          imgLastRef.current.alt = tiles[ni0].alt || "";
          pillThumbFirstRef.current.src = tiles[ni0].thumb;
          pillThumbLastRef.current.src = tiles[ni1].thumb;
          pillTitleFirstRef.current.textContent = tiles[ni0].category || "";
          pillTitleLastRef.current.textContent = tiles[ni1].category || "";
        },
      })

      .to(pillRef.current, {
        ease: "power1.out",
        xPercent: 110,
        duration: d * 0.85,
      })

      .to(
        imgLastRef.current,
        { ease: "sine.out", opacity: 1, scale: 1, duration: d },
        0,
      )

      .to(pillThumbFirstRef.current, { opacity: 0, duration: 0 }, "thumbSwap")
      .to(
        pillThumbLastRef.current,
        { ease: "sine.out", opacity: 1, scale: 1, duration: d * 0.8 },
        "thumbSwap",
      )

      .to(
        pillRef.current,
        { ease: "back.out(1.4)", xPercent: 0, duration: d * 0.7 },
        "thumbSwap+=0.1",
      )

      .add(() => labelTl.play(), "-=0.4");
    timelinesRef.current.push(labelTl, mainTl);
  }, [tiles, getNext, swingDuration, updateCounter, resetProgress]);

  return (
    <div
      ref={rootRef}
      className={"ts-root relative w-full h-screen overflow-hidden bg-black select-none " + className}
    >
      <style>{STYLES}</style>

      <img ref={imgFirstRef} alt="" className="absolute" />
      <img ref={imgLastRef} alt="" className="absolute" />

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

      <div
        className="ts-mono absolute top-[1.6rem] md:top-[2.4rem] left-0 text-white/60 tracking-widest uppercase"
        style={{ left: titleLeft, fontSize: "1.1rem" }}
      >
        <span ref={counterRef} />
      </div>

      <div
        className="ts-cat-anim absolute text-white/50 tracking-[0.18em] uppercase"
        style={{ left: titleLeft, top: "calc(50% - 10rem)", fontSize: "1rem" }}
      >
        <span ref={catFirstRef} />
      </div>

      <div
        ref={titleWrapRef}
        className="absolute overflow-hidden font-light leading-[1.2] text-white w-[85%] md:w-[55%]"
        style={{
          top: "50%",
          left: titleLeft,
          fontSize: titleSize,
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

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          ref={progressRef}
          className="ts-progress-fill absolute inset-0"
          style={{ background: accentColor, transformOrigin: "left center" }}
        />
      </div>

      <button
        ref={pillRef}
        onClick={handleNext}
        aria-label={buttonAriaLabel}
        className="ts-next-btn absolute bottom-[1.5rem] right-[1rem] md:bottom-[3.2rem] md:right-[3.2rem] max-w-[calc(100%-2rem)] flex items-center gap-0 overflow-hidden cursor-pointer border-0 p-0 z-50 [-webkit-tap-highlight-color:rgba(0,0,0,0)]"
        style={{
          borderRadius: "1.2rem",
          background: pillBg,
          backdropFilter: "blur(" + pillBlur + ")",
          WebkitBackdropFilter: "blur(" + pillBlur + ")",
          border: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <span
          className="relative overflow-hidden flex-shrink-0 w-[4.5rem] h-[6rem] md:w-[7rem] md:h-[8rem]"
        >
          <img ref={pillThumbFirstRef} alt="" className="absolute w-full" />
          <img
            ref={pillThumbLastRef}
            alt=""
            className="absolute w-full opacity-0"
          />
        </span>

        <span className="flex items-center gap-[0.8rem] px-[1rem] md:gap-[1.6rem] md:px-[1.8rem]">
          <span className="flex flex-col items-start gap-[0.4rem]">
            <span
              className="ts-mono text-white/40 uppercase tracking-widest"
              style={{ fontSize: "0.72rem" }}
            >
              {nextLabel}
            </span>
            <span
              className="block text-white font-light min-w-[5rem] md:min-w-[7rem]"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.3,
                position: "relative",
              }}
            >
              <span ref={pillTitleFirstRef} className="absolute top-0 left-0" />
              <span
                ref={pillTitleLastRef}
                className="absolute top-0 left-0 opacity-0"
              />
              &nbsp;
            </span>
          </span>

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
