"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
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

function pick(start, count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(IMAGES[(start + i) % IMAGES.length]);
  }
  return out;
}

const SLIDES = [
  {
    layout: "split",
    images: pick(0, 3),
    title: "Now or Never",
    text: "Our battered suitcases were piled on the sidewalk again; we had longer ways to go. But no matter, the road is life.",
  },
  {
    layout: "stack",
    images: pick(3, 5),
    title: "Crazy Breed",
    text: "There's those thinking more or less less is more. But if less is more how you're keeping score?",
    caption: "Today is someday",
  },
  {
    layout: "deck",
    images: pick(8, 7),
    title: "Safe Harbor",
    text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do.",
  },
  {
    layout: "scatter",
    images: pick(15, 4),
    title: "Our Freedom",
    text: "For to be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others.",
  },
  {
    layout: "grid",
    images: pick(0, 18),
    title: "Stopping Time",
    text: "Emancipate yourselves from mental slavery, none but ourselves can free our minds.",
  },
  {
    layout: "orbit",
    images: pick(19, 3),
    title: "Walk the Walk",
    text: "The trouble with being in the rat race is that even if you win, you're still a rat.",
  },
  {
    layout: "shear",
    images: pick(22, 3),
    title: "Caged Birds",
    text: "They told me to grow roots, instead I grew wings. Birds born in a cage think flying is an illness.",
  },
];

const EASINGS = {
  outQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
  outExpo: "cubic-bezier(0.19, 1, 0.22, 1)",
  outBack: "cubic-bezier(0.34, 1.46, 0.64, 1)",
  inBack: "cubic-bezier(0.36, 0, 0.66, -0.56)",
};

const LAYOUT_MOTION = {
  split: {
    out: {
      translateX: { next: "-100%", prev: "100%" },
      rotateZ: { next: () => rand(-15, 0), prev: () => rand(0, 15) },
      opacity: 0,
      duration: 1200,
      easing: EASINGS.outQuint,
      itemsDelay: 80,
    },
    in: {
      from: {
        translateX: { next: "100%", prev: "-100%" },
        rotateZ: { next: () => rand(0, 15), prev: () => rand(-15, 0) },
        opacity: 0,
      },
      translateX: "0%",
      rotateZ: 0,
      opacity: 1,
      duration: 700,
      easing: EASINGS.outQuint,
      itemsDelay: 80,
    },
  },
  stack: {
    out: {
      translateX: () => rand(-50, 50) + "%",
      translateY: () => rand(-50, 50) + "%",
      opacity: 0,
      duration: 1200,
      easing: EASINGS.outQuint,
      itemsDelay: 10,
    },
    in: {
      from: {
        translateX: { next: "100%", prev: "-100%" },
        rotateZ: { next: () => rand(0, 90), prev: () => rand(-90, 0) },
        opacity: 0,
      },
      translateX: "0%",
      rotateZ: 0,
      opacity: 1,
      duration: 900,
      easing: EASINGS.outExpo,
      itemsDelay: 30,
    },
  },
  deck: {
    out: {
      translateX: "-10%",
      rotateZ: 0,
      opacity: 0,
      duration: 500,
      easing: EASINGS.outExpo,
      itemsDelay: 0,
    },
    in: {
      from: { translateX: "-10%", rotateZ: 0, opacity: 0 },
      translateX: 0,
      rotateZ: (index) => index * 6,
      opacity: 1,
      duration: 1200,
      easing: EASINGS.outBack,
      itemsDelay: 60,
    },
  },
  scatter: {
    out: {
      translateY: { next: "60%", prev: "-60%" },
      opacity: 0,
      duration: 700,
      easing: EASINGS.outQuint,
      itemsDelay: 50,
    },
    in: {
      from: { translateY: { next: "-60%", prev: "60%" }, opacity: 0 },
      translateY: "0%",
      opacity: 1,
      duration: 700,
      easing: EASINGS.outQuint,
      itemsDelay: 50,
      delay: 250,
    },
  },
  grid: {
    out: {
      scale: 0.5,
      opacity: 0,
      duration: 500,
      easing: EASINGS.outExpo,
      itemsDelay: 20,
    },
    in: {
      from: { scale: 0.5, opacity: 0 },
      scale: 1,
      opacity: 1,
      duration: 500,
      easing: EASINGS.outExpo,
      itemsDelay: 20,
      delay: 300,
    },
  },
  orbit: {
    out: {
      scale: 0.5,
      opacity: 0,
      duration: 300,
      easing: EASINGS.inBack,
      itemsDelay: 20,
    },
    in: {
      from: { scale: 0.5, opacity: 0 },
      scale: 1,
      opacity: 1,
      duration: 1000,
      easing: EASINGS.outBack,
      itemsDelay: 50,
      delay: 400,
    },
  },
  shear: {
    out: {
      translateX: { next: "-100%", prev: "100%" },
      opacity: 0,
      duration: 1200,
      easing: EASINGS.outQuint,
      itemsDelay: 40,
    },
    in: {
      from: {
        translateX: { next: "100%", prev: "-100%" },
        rotateZ: { next: () => rand(0, 25), prev: () => rand(-25, 0) },
        opacity: 0,
      },
      translateX: "0%",
      rotateZ: 0,
      opacity: 1,
      duration: 700,
      easing: EASINGS.outQuint,
      itemsDelay: 40,
      delay: 250,
    },
  },
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function resolve(value, dir, index) {
  let out = value;
  if (
    out &&
    typeof out === "object" &&
    (out.next !== undefined || out.prev !== undefined)
  ) {
    out = out[dir];
  }
  if (typeof out === "function") {
    out = out(index);
  }
  return out;
}

function toPx(value, size) {
  if (typeof value === "string" && value.indexOf("%") !== -1) {
    return (parseFloat(value) / 100) * size;
  }
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

function buildTransform(config, dir, index, dims) {
  let out = "";
  if (config.translateX !== undefined) {
    out +=
      " translateX(" +
      toPx(resolve(config.translateX, dir, index), dims.width) +
      "px)";
  }
  if (config.translateY !== undefined) {
    out +=
      " translateY(" +
      toPx(resolve(config.translateY, dir, index), dims.height) +
      "px)";
  }
  if (config.rotateZ !== undefined) {
    out += " rotateZ(" + resolve(config.rotateZ, dir, index) + "deg)";
  }
  if (config.scale !== undefined) {
    out += " scale(" + resolve(config.scale, dir, index) + ")";
  }
  return out === "" ? "none" : out.trim();
}

function wrapStyle(layout) {
  if (layout === "grid") {
    return {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignContent: "center",
      padding: "8% 0",
      width: "80%",
      margin: "0 auto",
    };
  }
  return { width: "100%", margin: "0 auto" };
}

function itemStyle(layout, index, total) {
  if (layout === "split") {
    if (index === 0) {
      return {
        position: "absolute",
        left: "0.5em",
        width: "calc(50% - 1em)",
        height: "100%",
      };
    }
    return {
      position: "absolute",
      left: "calc(50% + 0.5em)",
      width: "calc(50% - 1em)",
      height: "calc(50% - 0.5em)",
      top: index === 2 ? "calc(50% + 0.5em)" : 0,
    };
  }

  if (layout === "stack") {
    const isLast = index === total - 1;
    const offsets = [
      "translate3d(-60%,-40%,0) rotate(-16deg)",
      "translate3d(60%,-40%,0) rotate(10deg)",
      "translate3d(60%,40%,0) rotate(-15deg)",
      "translate3d(-60%,40%,0) rotate(10deg)",
    ];
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: isLast ? "clamp(180px, 30vw, 430px)" : "clamp(96px, 16vw, 280px)",
      height: isLast ? "clamp(160px, 27vw, 380px)" : "clamp(96px, 16vw, 280px)",
      transform:
        "translate3d(-50%,-50%,0)" +
        (isLast ? "" : " " + offsets[index % offsets.length]),
    };
  }

  if (layout === "deck") {
    return {
      position: "absolute",
      top: "40%",
      left: "50%",
      width: "clamp(190px, 32vw, 430px)",
      height: "clamp(190px, 32vw, 430px)",
      transform:
        "translate3d(-50%,-50%,0) translate3d(-50%,0,0) rotate(-10deg)",
    };
  }

  if (layout === "scatter") {
    const boxes = [
      { top: "40%", left: "5%", width: "80%", height: "60%" },
      { top: "15%", left: "15%", width: "30%", height: "50%" },
      { top: "0%", left: "40%", width: "40%", height: "60%" },
      { top: "50%", left: "75%", width: "22.5%", height: "42.5%" },
    ];
    return { position: "absolute", ...boxes[index % boxes.length] };
  }

  if (layout === "grid") {
    return {
      position: "relative",
      width: "calc((100% / 6) - 10px)",
      paddingBottom: "calc((100% / 6) - 10px)",
      minHeight: "clamp(52px, 9vw, 150px)",
      margin: 5,
    };
  }

  if (layout === "orbit") {
    const transforms = [
      "translate3d(0%,-40%,0) scale(0.6)",
      "translate3d(-50%,-50%,0)",
      "translate3d(-100%,-60%,0) scale(0.75)",
    ];
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "45%",
      paddingBottom: "45%",
      transform: transforms[index % transforms.length],
    };
  }

  return {
    position: "absolute",
    top: "10%",
    width: "40%",
    height: "80%",
    left: index === 0 ? "0%" : index === 1 ? "30%" : "60%",
  };
}

function innerStyle(layout, index, total, accentColor) {
  const base = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    backgroundPosition: "50% 50%",
    backgroundSize: "cover",
    backfaceVisibility: "hidden",
    willChange: "transform, opacity",
    transform: "rotateZ(0deg)",
  };

  if (layout === "stack") {
    const isLast = index === total - 1;
    return {
      ...base,
      border: (isLast ? 10 : 5) + "px solid " + accentColor,
      borderBottomWidth: isLast ? "clamp(28px, 5vw, 62px)" : 5,
    };
  }
  if (layout === "deck") {
    return { ...base, transformOrigin: "50% 200%" };
  }
  if (layout === "orbit") {
    return { ...base, borderRadius: "50%" };
  }
  if (layout === "shear") {
    return { ...base, clipPath: "polygon(0% 100%, 30% 0%, 100% 0%, 70% 100%)" };
  }
  return base;
}

export default function LayoutSlideshow({
  slides = SLIDES,
  startIndex = 0,
  height = "100vh",
  maxHeight = "1000px",
  maxWidth = "1600px",
  stagePadding = "clamp(3em, 10vh, 6em) clamp(1em, 8vw, 5em)",
  bgColor = "#17181a",
  accentColor = "#ffe14d",
  titleColor = "#ececea",
  textColor = "#9a9c9e",
  titleFont = "'Times New Roman', Georgia, serif",
  titleSize = "clamp(2.6rem, 9vw, 7.2rem)",
  bodyFont = "'Lucida Console', Menlo, Monaco, monospace",
  imageOpacity = 0.62,
  wrapInset = "clamp(0.5em, 3vw, 3em)",
  loop = true,
  keyboard = true,
  autoplay = false,
  autoplayDelay = 5000,
  showArrows = true,
  showCounter = true,
  showLoader = true,
  arrowColor = "",
  arrowHoverColor = "#ffffff",
  transitionSpeed = 1,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(startIndex);

  const stageRef = useRef(null);
  const slideRefs = useRef([]);
  const itemRefs = useRef([]);
  const titleRefs = useRef([]);
  const currentRef = useRef(startIndex);
  const animatingRef = useRef(false);
  const timersRef = useRef([]);

  const setSlideRef = useCallback((el, i) => {
    slideRefs.current[i] = el;
  }, []);

  const setTitleRef = useCallback((el, i) => {
    titleRefs.current[i] = el;
  }, []);

  const setItemRef = useCallback((el, slide, i) => {
    if (!itemRefs.current[slide]) itemRefs.current[slide] = [];
    itemRefs.current[slide][i] = el;
  }, []);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    let alive = true;
    const urls = slides.reduce((all, slide) => all.concat(slide.images), []);
    let pending = urls.length;
    if (pending === 0) {
      setLoaded(true);
      return undefined;
    }
    const done = () => {
      pending -= 1;
      if (pending <= 0 && alive) setLoaded(true);
    };
    urls.forEach((url) => {
      const img = new window.Image();
      img.onload = done;
      img.onerror = done;
      img.src = url;
    });
    return () => {
      alive = false;
    };
  }, [slides]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const showSlide = useCallback((index, on) => {
    const el = slideRefs.current[index];
    if (!el) return;
    el.style.opacity = on ? "1" : "0";
    el.style.pointerEvents = on ? "auto" : "none";
  }, []);

  const navigate = useCallback(
    (dir) => {
      if (animatingRef.current || slides.length < 2) return;

      const from = currentRef.current;
      let to = dir === "next" ? from + 1 : from - 1;
      if (to >= slides.length) {
        if (!loop) return;
        to = 0;
      }
      if (to < 0) {
        if (!loop) return;
        to = slides.length - 1;
      }

      animatingRef.current = true;
      currentRef.current = to;

      const stage = stageRef.current;
      const dims = {
        width: stage ? stage.offsetWidth : 0,
        height: stage ? stage.offsetHeight : 0,
      };

      const outMotion = (
        LAYOUT_MOTION[slides[from].layout] || LAYOUT_MOTION.split
      ).out;
      const inMotion = (LAYOUT_MOTION[slides[to].layout] || LAYOUT_MOTION.split)
        .in;

      const outItems = (itemRefs.current[from] || []).filter(Boolean);
      const outDuration = outMotion.duration * transitionSpeed;

      outItems.forEach((el, i) => {
        const stagger =
          (dir === "next" ? i : outItems.length - 1 - i) * outMotion.itemsDelay;
        el.style.transition =
          "transform " +
          outDuration +
          "ms " +
          outMotion.easing +
          " " +
          stagger +
          "ms, " +
          "opacity " +
          outDuration +
          "ms " +
          outMotion.easing +
          " " +
          stagger +
          "ms";
        el.style.transform = buildTransform(outMotion, dir, i, dims);
        if (outMotion.opacity !== undefined)
          el.style.opacity = String(outMotion.opacity);
      });

      const outTitle = titleRefs.current[from];
      if (outTitle) {
        outTitle.style.transition = "opacity 200ms " + EASINGS.outExpo;
        outTitle.style.opacity = "0";
      }

      later(
        () => showSlide(from, false),
        outDuration + outItems.length * outMotion.itemsDelay,
      );

      later(
        () => {
          const inItems = (itemRefs.current[to] || []).filter(Boolean);
          const inDuration = inMotion.duration * transitionSpeed;

          inItems.forEach((el, i) => {
            el.style.transition = "none";
            el.style.transform = buildTransform(inMotion.from, dir, i, dims);
            if (inMotion.from.opacity !== undefined) {
              el.style.opacity = String(inMotion.from.opacity);
            }
          });

          const inTitle = titleRefs.current[to];
          if (inTitle) {
            inTitle.style.transition = "none";
            inTitle.style.opacity = "0";
          }

          if (stage) void stage.offsetHeight;
          showSlide(to, true);
          setActive(to);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              inItems.forEach((el, i) => {
                const stagger =
                  (dir === "next" ? i : inItems.length - 1 - i) *
                  inMotion.itemsDelay;
                el.style.transition =
                  "transform " +
                  inDuration +
                  "ms " +
                  inMotion.easing +
                  " " +
                  stagger +
                  "ms, " +
                  "opacity " +
                  inDuration +
                  "ms " +
                  inMotion.easing +
                  " " +
                  stagger +
                  "ms";
                el.style.transform = buildTransform(inMotion, dir, i, dims);
                if (inMotion.opacity !== undefined)
                  el.style.opacity = String(inMotion.opacity);
              });

              if (inTitle) {
                inTitle.style.transition = "opacity 500ms " + EASINGS.outExpo;
                inTitle.style.opacity = "1";
              }
            });
          });

          later(
            () => {
              animatingRef.current = false;
            },
            inDuration + inItems.length * inMotion.itemsDelay + 60,
          );
        },
        (inMotion.delay || 150) * transitionSpeed,
      );
    },
    [later, loop, showSlide, slides, transitionSpeed],
  );

  useEffect(() => {
    if (!loaded) return;
    showSlide(currentRef.current, true);
    const title = titleRefs.current[currentRef.current];
    if (title) title.style.opacity = "1";
  }, [loaded, showSlide]);

  useEffect(() => {
    if (!keyboard) return undefined;
    const onKey = (event) => {
      if (event.key === "ArrowLeft") navigate("prev");
      if (event.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, navigate]);

  useEffect(() => {
    if (!autoplay || !loaded) return undefined;
    const id = setInterval(() => navigate("next"), autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, autoplayDelay, loaded, navigate]);

  const arrowTone = arrowColor || accentColor;

  return (
    <div
      className={"relative w-full overflow-hidden " + className}
      style={{ backgroundColor: bgColor, fontFamily: bodyFont }}
    >
      <div
        ref={stageRef}
        className="relative mx-auto w-full"
        style={{ height, maxHeight, maxWidth }}
      >
        {showLoader && !loaded ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2">
            <div
              className="h-full w-full animate-spin rounded-full"
              style={{
                border: "6px solid rgba(255,255,255,0.08)",
                borderTopColor: accentColor,
                animationDuration: "0.8s",
              }}
            />
          </div>
        ) : null}

        {slides.map((slide, slideIndex) => (
          <div
            key={slide.title + slideIndex}
            ref={(el) => setSlideRef(el, slideIndex)}
            className="absolute left-0 top-0 h-full w-full opacity-0"
            style={{ padding: stagePadding, pointerEvents: "none" }}
          >
            <div
              className="relative h-full"
              style={{
                ...wrapStyle(slide.layout),
                width:
                  slide.layout === "grid"
                    ? "80%"
                    : "calc(100% - " + wrapInset + " - " + wrapInset + ")",
                opacity: imageOpacity,
              }}
            >
              {slide.images.map((src, imageIndex) => (
                <div
                  key={src + imageIndex}
                  style={itemStyle(
                    slide.layout,
                    imageIndex,
                    slide.images.length,
                  )}
                >
                  <div
                    ref={(el) => setItemRef(el, slideIndex, imageIndex)}
                    style={{
                      ...innerStyle(
                        slide.layout,
                        imageIndex,
                        slide.images.length,
                        accentColor,
                      ),
                      backgroundImage: "url(" + src + ")",
                    }}
                  >
                    {slide.caption && imageIndex === slide.images.length - 1 ? (
                      <span
                        className="absolute left-0 top-full w-full px-2 py-4 text-center text-[13px]"
                        style={{ color: "#20262f" }}
                      >
                        {slide.caption}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div
              ref={(el) => setTitleRef(el, slideIndex)}
              className="absolute bottom-0 left-0 w-full max-w-3xl opacity-0"
              style={{ padding: "2em", pointerEvents: "none" }}
            >
              <h3
                className="m-0 inline-block leading-[0.85]"
                style={{
                  fontFamily: titleFont,
                  fontSize: titleSize,
                  color: titleColor,
                  letterSpacing: "-0.02em",
                }}
              >
                {slide.title}
              </h3>
              <p
                className="mt-6 max-w-xl text-[13px] leading-relaxed"
                style={{ color: textColor }}
              >
                {slide.text}
              </p>
            </div>
          </div>
        ))}

        {showCounter ? (
          <div
            className="absolute left-0 top-0 flex items-center gap-2 p-8 text-[11px] uppercase tracking-[0.2em]"
            style={{ color: textColor }}
          >
            <span style={{ color: accentColor }}>
              {String(active + 1).padStart(2, "0")}
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>
        ) : null}

        {showArrows ? (
          <nav className="absolute bottom-0 right-0 flex items-center gap-4 p-8">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => navigate("prev")}
              className="cursor-pointer border-0 bg-transparent p-0 transition-colors duration-200 hover:text-[var(--arrow-hover)]"
              style={{ color: arrowTone, "--arrow-hover": arrowHoverColor }}
            >
              <svg
                viewBox="0 0 100 50"
                className="h-6 w-16"
                fill="currentColor"
              >
                <polygon points="5.4,25 18.7,38.2 22.6,34.2 16.2,27.8 94.6,27.8 94.6,22.2 16.2,22.2 22.6,15.8 18.7,11.8" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => navigate("next")}
              className="cursor-pointer border-0 bg-transparent p-0 transition-colors duration-200 hover:text-[var(--arrow-hover)]"
              style={{ color: arrowTone, "--arrow-hover": arrowHoverColor }}
            >
              <svg
                viewBox="0 0 100 50"
                className="h-6 w-16"
                fill="currentColor"
              >
                <polygon points="81.3,11.8 77.4,15.8 83.8,22.2 5.4,22.2 5.4,27.8 83.8,27.8 77.4,34.2 81.3,38.2 94.6,25" />
              </svg>
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
