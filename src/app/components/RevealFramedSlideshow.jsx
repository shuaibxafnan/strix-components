"use client";

import { useEffect, useRef, useId, useState } from "react";

// ─── RevealFramedSlideshow ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides           array     []          [{ image, frameSize, slicesTotal }]
//                                         frameSize: "wide" | "tall" | "square"
// slicesColor      string    "#ffffff"   Color of the covering slices
// bgColor          string    "#ffffff"   Page background color
// accentColor      string    "#333333"   Color for pagination / arrows
// orientation      string    "horizontal" Slice orientation for every frame
// showFrom         string    "left"      Direction slices wipe away to reveal
// hideTo           string    "right"     Direction slices wipe in from to cover
// sliceDuration    number    600         Slice animation duration (ms)
// sliceStagger     number    50          Delay between each slice (ms)
// sliceEasing      string    "easeInOutCirc"  Easing for slice motion
// frameMaxWidth    string    "800px"     Max width for any frame
// frameMaxHeight   string    "1200px"    Max height for any frame
// showArrows       bool      true        Show prev/next arrow controls
// showPagination   bool      true        Show numbered pagination
// height           string    "100vh"     Height of the slideshow container
// ──────────────────────────────────────────────────────────────────────────

const FRAME_STYLES = {
  wide: { width: "60vw", height: "60vh" },
  tall: { width: "40vw", height: "56vw" },
  square: { width: "40vw", height: "40vw" },
};

export default function RevealFramedSlideshow({
  slides = [
    {
      image:
        "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1200&q=80",
      frameSize: "tall",
      slicesTotal: 11,
    },
    {
      image:
        "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80",
      frameSize: "wide",
      slicesTotal: 8,
    },
    {
      image:
        "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1200&q=80",
      frameSize: "tall",
      slicesTotal: 11,
    },
    {
      image:
        "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1200&q=80",
      frameSize: "square",
      slicesTotal: 8,
    },
    {
      image:
        "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1200&q=80",
      frameSize: "wide",
      slicesTotal: 8,
    },
  ],
  slicesColor = "#ffffff",
  bgColor = "#ffffff",
  accentColor = "#333333",
  orientation = "horizontal",
  showFrom = "left",
  hideTo = "right",
  sliceDuration = 600,
  sliceStagger = 50,
  sliceEasing = "easeInOutCirc",
  frameMaxWidth = "800px",
  frameMaxHeight = "1200px",
  showArrows = true,
  showPagination = true,
  height = "100vh",
}) {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef(null);
  const animeRef = useRef(null);
  const instancesRef = useRef([]);
  const currentRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

  const cls = (name) => `rfs-${uid}__${name}`;

  const axis = orientation === "vertical" ? "translateY" : "translateX";
  const signFor = (side) =>
    side === "top" || side === "left" ? "-100%" : "100%";

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

    let cancelled = false;

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js",
    )
      .then(() => {
        if (cancelled || !rootRef.current) return;
        animeRef.current = window.anime;

        const frames = Array.from(
          rootRef.current.querySelectorAll(`.${cls("frame")}`),
        );
        instancesRef.current = frames.map((frame) => ({
          slices: Array.from(frame.querySelectorAll(`.${cls("slice")}`)),
        }));

        setReady(true);
        revealSlide(0);
      })
      .catch((e) =>
        console.error(
          "[RevealFramedSlideshow] anime.js load failed:",
          e.message,
        ),
      );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealSlide = (pos) => {
    const anime = animeRef.current;
    const inst = instancesRef.current[pos];
    if (!anime || !inst) return;

    anime.set(inst.slices, { translateX: 0, translateY: 0 });
    isAnimatingRef.current = true;

    const showAnim = anime({
      targets: inst.slices,
      duration: sliceDuration,
      delay: anime.stagger(sliceStagger),
      easing: sliceEasing,
      [axis]: signFor(showFrom),
    });

    showAnim.finished.then(() => {
      isAnimatingRef.current = false;
    });
  };

  const coverSlide = (pos) =>
    new Promise((resolve) => {
      const anime = animeRef.current;
      const inst = instancesRef.current[pos];
      if (!anime || !inst) {
        resolve();
        return;
      }
      anime({
        targets: inst.slices,
        duration: sliceDuration,
        delay: anime.stagger(sliceStagger),
        easing: sliceEasing,
        [axis]: [signFor(hideTo), "0%"],
      }).finished.then(resolve);
    });

  const navigate = (pos) => {
    if (!ready || isAnimatingRef.current || pos === currentRef.current) return;
    if (pos < 0 || pos > slides.length - 1) return;
    isAnimatingRef.current = true;
    coverSlide(currentRef.current).then(() => {
      currentRef.current = pos;
      setCurrent(pos);
      revealSlide(pos);
    });
  };

  const goPrev = () => navigate(current > 0 ? current - 1 : slides.length - 1);
  const goNext = () => navigate(current < slides.length - 1 ? current + 1 : 0);

  return (
    <div
      ref={rootRef}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height, backgroundColor: bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${cls("frame")} {
              position: absolute;
              opacity: 0;
              pointer-events: none;
              min-width: 280px;
              min-height: 280px;
              max-width: ${frameMaxWidth};
              max-height: ${frameMaxHeight};
              background-size: cover;
              background-position: 50% 50%;
            }
            .${cls("frame")}[data-active="true"] { opacity: 1; pointer-events: auto; }
            .${cls("slices")} { position:absolute; inset:0; display:flex; }
            .${cls("slices")}[data-orientation="vertical"] { flex-direction:row; }
            .${cls("slices")}[data-orientation="horizontal"] { flex-direction:column; }
            .${cls("slice")} { flex:1; background-color:${slicesColor}; }
            .${cls("slices")}[data-orientation="vertical"] .${cls("slice")} { box-shadow: 1px 0 0 ${slicesColor}; }
            .${cls("slices")}[data-orientation="horizontal"] .${cls("slice")} { box-shadow: 0 1px 0 ${slicesColor}; }
          `,
        }}
      />

      {slides.map((cfg, i) => {
        const size = FRAME_STYLES[cfg.frameSize || "square"];
        return (
          <div
            key={i}
            className={cls("frame")}
            data-active={i === current}
            style={{ backgroundImage: `url(${cfg.image})`, ...size }}
          >
            <div className={cls("slices")} data-orientation={orientation}>
              {Array.from({ length: cfg.slicesTotal || 8 }).map((_, s) => (
                <div key={s} className={cls("slice")} />
              ))}
            </div>
          </div>
        );
      })}

      {showArrows && (
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20 pointer-events-none">
          <button
            onClick={goPrev}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full border transition-opacity hover:opacity-60"
            style={{ borderColor: accentColor, color: accentColor }}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full border transition-opacity hover:opacity-60"
            style={{ borderColor: accentColor, color: accentColor }}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      )}

      {showPagination && (
        <div className="absolute bottom-6 right-6 z-20 flex gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i)}
              className="text-lg font-bold transition-opacity"
              style={{ color: accentColor, opacity: i === current ? 1 : 0.4 }}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
