"use client";

import { useEffect, useRef, useId, useState } from "react";

export default function SlicedRevealSlideshow({
  slides = [
    {
      image:
        "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80",
      slicesTotal: 4,
      orientation: "vertical",
      showFrom: "top",
      hideTo: "bottom",
    },
    {
      image:
        "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1600&q=80",
      slicesTotal: 7,
      orientation: "horizontal",
      showFrom: "right",
      hideTo: "right",
    },
    {
      image:
        "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1600&q=80",
      slicesTotal: 9,
      orientation: "vertical",
      showFrom: "bottom",
      hideTo: "bottom",
    },
    {
      image:
        "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1600&q=80",
      slicesTotal: 5,
      orientation: "horizontal",
      showFrom: "left",
      hideTo: "left",
    },
    {
      image:
        "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1600&q=80",
      slicesTotal: 6,
      orientation: "vertical",
      showFrom: "bottom",
      hideTo: "bottom",
    },
  ],
  slicesColor = "#111111",
  bgColor = "#000000",
  accentColor = "#ffffff",
  sliceDuration = 800,
  sliceStagger = 80,
  sliceEasing = "easeInOutQuart",
  imageScaleFrom = 1.3,
  imageDuration = 800,
  imageDelay = 350,
  imageEasing = "easeOutCubic",
  showArrows = true,
  showPagination = true,
  height = "100vh",
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef(null);
  const animeRef = useRef(null);
  const instancesRef = useRef([]);
  const currentRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

  const cls = (name) => `rss-${uid}__${name}`;

  const axisFor = (orientation) =>
    orientation === "vertical" ? "translateY" : "translateX";
  const signFor = (side) =>
    side === "top" || side === "left" ? "-100%" : "100%";

  useEffect(() => {
    let cancelled = false;

    import("animejs")
      .then((mod) => {
        if (cancelled || !rootRef.current) return;
        animeRef.current = mod.default || mod;

        const slideEls = Array.from(
          rootRef.current.querySelectorAll(`.${cls("slide")}`),
        );
        instancesRef.current = slideEls.map((slide) => ({
          img: slide.querySelector(`.${cls("img")}`),
          slices: Array.from(slide.querySelectorAll(`.${cls("slice")}`)),
        }));

        setReady(true);
        revealSlide(0);
      })
      .catch((e) =>
        console.error("[SlicedRevealSlideshow] anime.js load failed:", e.message),
      );

    return () => {
      cancelled = true;
      const anime = animeRef.current;
      if (anime) {
        instancesRef.current.forEach((inst) => {
          anime.remove(inst.slices);
          anime.remove(inst.img);
        });
      }
    };
  }, []);

  const revealSlide = (pos) => {
    const anime = animeRef.current;
    const inst = instancesRef.current[pos];
    const cfg = slides[pos];
    if (!anime || !inst || !cfg) return;

    const orientation = cfg.orientation || "vertical";
    const showFrom =
      cfg.showFrom || (orientation === "vertical" ? "bottom" : "left");
    const axis = axisFor(orientation);

    anime.set(inst.slices, { translateX: 0, translateY: 0 });
    anime.set(inst.img, { scale: imageScaleFrom });

    isAnimatingRef.current = true;

    const showAnim = anime({
      targets: inst.slices,
      duration: sliceDuration,
      delay: anime.stagger(sliceStagger),
      easing: sliceEasing,
      [axis]: signFor(showFrom),
    });

    anime({
      targets: inst.img,
      duration: imageDuration,
      delay: imageDelay,
      easing: imageEasing,
      scale: [imageScaleFrom, 1],
    });

    showAnim.finished.then(() => {
      isAnimatingRef.current = false;
    });
  };

  const coverSlide = (pos) =>
    new Promise((resolve) => {
      const anime = animeRef.current;
      const inst = instancesRef.current[pos];
      const cfg = slides[pos];
      if (!anime || !inst || !cfg) {
        resolve();
        return;
      }
      const orientation = cfg.orientation || "vertical";
      const hideTo =
        cfg.hideTo || (orientation === "vertical" ? "bottom" : "left");
      const axis = axisFor(orientation);

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
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height, backgroundColor: bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${cls("slide")} { position:absolute; inset:0; opacity:0; pointer-events:none; }
            .${cls("slide")}[data-active="true"] { opacity:1; pointer-events:auto; }
            .${cls("img")} { position:absolute; inset:0; background-size:cover; background-position:50% 50%; }
            .${cls("slices")} { position:absolute; inset:0; display:flex; }
            .${cls("slices")}[data-orientation="vertical"] { flex-direction:row; }
            .${cls("slices")}[data-orientation="horizontal"] { flex-direction:column; }
            .${cls("slice")} { flex:1; background-color:${slicesColor}; }
            .${cls("slices")}[data-orientation="vertical"] .${cls("slice")} { box-shadow: 1px 0 0 ${slicesColor}; }
            .${cls("slices")}[data-orientation="horizontal"] .${cls("slice")} { box-shadow: 0 1px 0 ${slicesColor}; }
          `,
        }}
      />

      {slides.map((cfg, i) => (
        <div key={i} className={cls("slide")} data-active={i === current}>
          <div
            className={cls("img")}
            style={{ backgroundImage: `url(${cfg.image})` }}
          />
          <div
            className={cls("slices")}
            data-orientation={cfg.orientation || "vertical"}
          >
            {Array.from({ length: cfg.slicesTotal || 6 }).map((_, s) => (
              <div key={s} className={cls("slice")} />
            ))}
          </div>
        </div>
      ))}

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
