"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";

const unsplash = (id, size) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&${size}&q=80`;

const IMAGE_IDS = [
  "photo-1749330513873-09ffa91b0aae",
  "photo-1627896157734-4d7d4388f28b",
  "photo-1778789172736-e8ba37c71124",
  "photo-1778961938903-96617183f739",
  "photo-1678112553355-a9dab855ebf3",
  "photo-1743309411498-a0f4f4b96b65",
  "photo-1490682143684-14369e18dce8",
  "photo-1634325232058-e7b8f80cc20b",
  "photo-1759458856846-097935f54111",
  "photo-1533387520709-752d83de3630",
  "photo-1752150127767-77bccbed07e2",
  "photo-1781935307999-e8bb5e62ebb1",
  "photo-1595598034023-ca08624ce05d",
  "photo-1781798715946-2e198afc29a7",
  "photo-1725161834547-ba8a90bf5a15",
  "photo-1782806007529-90a2ab4b98d9",
  "photo-1779877716206-f441d5d384d4",
  "photo-1779862946918-a129ac57c60e",
  "photo-1780580940878-248a6ad4b626",
  "photo-1781513747645-757fb2619e57",
  "photo-1780163930838-1502715c3bc1",
  "photo-1780269579991-79bc18ee6f56",
  "photo-1611419010196-a360856fc42f",
  "photo-1777902609361-a8b8b7a697fb",
  "photo-1777947085284-d454d1aa2f40",
];

const DEFAULT_IMAGES = IMAGE_IDS.map((id, index) => ({
  src: unsplash(id, "w=640&h=640"),
  full: unsplash(id, "w=1400&h=1600"),
  alt: `Gallery image ${index + 1}`,
}));

const DEFAULT_SLIDES = [
  {
    number: "01",
    title: "Begin With the Clay",
    description:
      "Every vessel starts as a quiet lump on the wheel. Center it, steady your hands, and let the shape rise.",
  },
  {
    number: "02",
    title: "Space Inside",
    description:
      "The hollow is the point. A vase is made of the room it leaves for something else.",
  },
  {
    number: "03",
    title: "Pressure and Patience",
    description:
      "Press too hard and the wall folds. Press too lightly and it never stands. The wheel teaches the middle.",
  },
  {
    number: "04",
    title: "Slow Drying",
    description:
      "Rushed clay cracks. Give it days, turn it often, and let the water leave on its own schedule.",
  },
  {
    number: "05",
    title: "Fire Decides",
    description:
      "The kiln keeps the final say. You load it with hope and open it with respect.",
  },
  {
    number: "06",
    title: "Glaze and Light",
    description:
      "Color pools in the curves and thins at the edges. Light finishes what the brush began.",
  },
  {
    number: "07",
    title: "Hand Marks",
    description:
      "A fingerprint near the foot, a ridge from the thumb. These are signatures nobody asked for.",
  },
  {
    number: "08",
    title: "Shelf Life",
    description:
      "A good vase belongs in daily life, filled with flowers or left empty, always worth looking at.",
  },
  {
    number: "09",
    title: "Pairs and Groups",
    description:
      "Two vessels talk to each other. Three start a conversation. The space between them matters most.",
  },
  {
    number: "10",
    title: "Keep Making",
    description:
      "The next piece is always better than the last. Wedge the clay, sit at the wheel, begin again.",
  },
];

const gapForZoom = (zoom) => (zoom >= 1 ? 16 : zoom >= 0.6 ? 32 : 64);

export default function ZoomableDragGallery({
  images = DEFAULT_IMAGES,
  slides = DEFAULT_SLIDES,
  rows = 8,
  cols = 12,
  itemSize = 320,
  initialZoom = 0.6,
  zoomOutLevel = 0.3,
  zoomInLevel = 1.0,
  backgroundColor = "bg-black",
  textColor = "text-white",
  preloaderBackground = "bg-black",
  preloaderDuration = 2000,
  loadingLabel = "Loading",
  zoomOutLabel = "Zoom Out",
  normalLabel = "Normal",
  zoomInLabel = "Zoom In",
  fitLabel = "Fit",
  closeLabel = "Close zoom view",
  className = "",
}) {
  const [phase, setPhase] = useState("loading");
  const [mode, setMode] = useState("grid");
  const [percent, setPercent] = useState(Math.round(initialZoom * 100));
  const [activeSwitch, setActiveSwitch] = useState(1);

  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const wrapperRef = useRef(null);
  const itemRefs = useRef([]);
  const splitScreenRef = useRef(null);
  const zoomTargetRef = useRef(null);
  const overlayRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const closeRef = useRef(null);
  const controlsRef = useRef(null);
  const percentRef = useRef(null);
  const switchRef = useRef(null);
  const apiRef = useRef(null);

  const initialGap = gapForZoom(initialZoom);
  const total = rows * cols;

  useEffect(() => {
    const fade = setTimeout(() => setPhase("fading"), preloaderDuration);
    const ready = setTimeout(() => setPhase("ready"), preloaderDuration + 800);
    return () => {
      clearTimeout(fade);
      clearTimeout(ready);
    };
  }, [preloaderDuration]);

  useEffect(() => {
    if (phase !== "ready") return undefined;

    gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, Flip);
    CustomEase.create("gallery-smooth", ".87,0,.13,1");
    CustomEase.create("gallery-center", ".25,.46,.45,.94");

    const root = rootRef.current;
    const viewport = viewportRef.current;
    const wrapper = wrapperRef.current;
    const splitScreen = splitScreenRef.current;
    const zoomTarget = zoomTargetRef.current;
    const overlayText = overlayRef.current;
    const closeButton = closeRef.current;
    const controls = controlsRef.current;
    const items = itemRefs.current.slice(0, total).filter(Boolean);
    if (!root || !viewport || !wrapper || items.length === 0) return undefined;

    let zoom = initialZoom;
    let gap = gapForZoom(zoom);
    let zoomActive = false;
    let selected = null;
    let overlay = null;
    let flipTween = null;
    let draggable = null;
    let observer = null;
    let lines = null;
    const timers = [];

    const base = items.map((_, i) => ({
      x: (i % cols) * (itemSize + gap),
      y: Math.floor(i / cols) * (itemSize + gap),
    }));

    const dims = (g) => ({
      width: cols * (itemSize + g) - g,
      height: rows * (itemSize + g) - g,
    });

    const centerFor = (scale, g) => {
      const d = dims(g);
      return {
        x: (window.innerWidth - d.width * scale) / 2,
        y: (window.innerHeight - d.height * scale) / 2,
      };
    };

    const getBounds = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const d = dims(gap);
      const scaledWidth = d.width * zoom;
      const scaledHeight = d.height * zoom;
      const margin = gap * zoom;
      const horizontal =
        scaledWidth <= vw
          ? { minX: (vw - scaledWidth) / 2, maxX: (vw - scaledWidth) / 2 }
          : { minX: vw - scaledWidth - margin, maxX: margin };
      const vertical =
        scaledHeight <= vh
          ? { minY: (vh - scaledHeight) / 2, maxY: (vh - scaledHeight) / 2 }
          : { minY: vh - scaledHeight - margin, maxY: margin };
      return { ...horizontal, ...vertical };
    };

    const initDraggable = () => {
      draggable?.kill();
      draggable = Draggable.create(wrapper, {
        type: "x,y",
        bounds: getBounds(),
        edgeResistance: 0.8,
        inertia: true,
        throwResistance: 300,
        onDragStart: () => {
          root.dataset.dragging = "true";
        },
        onDragEnd: () => {
          root.dataset.dragging = "false";
        },
      })[0];
    };

    const setupObserver = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (selected !== null && entry.target === items[selected]) return;
            gsap.to(entry.target, {
              opacity: entry.isIntersecting ? 1 : 0.1,
              duration: 0.6,
              ease: "power2.out",
            });
          });
        },
        { root: null, threshold: 0.15, rootMargin: "10%" },
      );
      items.forEach((item) => observer.observe(item));
    };

    const playIntro = () => {
      const matrix = new DOMMatrix(getComputedStyle(wrapper).transform);
      const centerX = (window.innerWidth / 2 - matrix.m41) / matrix.a - itemSize / 2;
      const centerY = (window.innerHeight / 2 - matrix.m42) / matrix.a - itemSize / 2;

      items.forEach((el, i) =>
        gsap.set(el, {
          left: centerX,
          top: centerY,
          scale: 0.8,
          zIndex: items.length - i,
          opacity: 0,
        }),
      );

      gsap.to(items, {
        duration: 0.2,
        left: (i) => base[i].x,
        top: (i) => base[i].y,
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        stagger: { amount: 1.5, from: "start", grid: [rows, cols] },
        onComplete: () => {
          items.forEach((el) => gsap.set(el, { zIndex: 1 }));
          gsap.set(controls, { opacity: 0 });
          gsap.set(percentRef.current, { x: "-3em" });
          gsap.set(switchRef.current, { y: "2em" });
          gsap
            .timeline()
            .to(controls, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
            .to(percentRef.current, { x: 0, duration: 0.2, ease: "power2.out" }, 0.25)
            .to(switchRef.current, { y: 0, duration: 0.2, ease: "power2.out" }, 0.3);
        },
      });
    };

    const reposition = (newGap) => {
      items.forEach((el, i) => {
        base[i] = {
          x: (i % cols) * (itemSize + newGap),
          y: Math.floor(i / cols) * (itemSize + newGap),
        };
        gsap.to(el, {
          duration: 1,
          left: base[i].x,
          top: base[i].y,
          ease: "gallery-smooth",
        });
      });
      const d = dims(newGap);
      gsap.to(wrapper, {
        duration: 1,
        width: d.width,
        height: d.height,
        ease: "gallery-smooth",
      });
      gap = newGap;
    };

    const splitLines = (element, text) => {
      element.innerHTML = "";
      const style = getComputedStyle(element);
      const probe = document.createElement("div");
      probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-family:${style.fontFamily};font-size:${style.fontSize};font-weight:${style.fontWeight};letter-spacing:${style.letterSpacing};`;
      document.body.appendChild(probe);

      const maxWidth = element.offsetWidth;
      const result = [];
      let current = "";
      text.split(/\s+/).forEach((word) => {
        const attempt = current ? `${current} ${word}` : word;
        probe.textContent = attempt;
        if (probe.offsetWidth > maxWidth && current) {
          result.push(current);
          current = word;
        } else {
          current = attempt;
        }
      });
      if (current) result.push(current);
      document.body.removeChild(probe);

      result.forEach((lineText) => {
        const span = document.createElement("span");
        span.setAttribute("data-line", "");
        span.className = "block text-base font-light leading-snug text-white/80";
        span.textContent = lineText;
        element.appendChild(span);
      });
      return element.querySelectorAll("[data-line]");
    };

    const showText = (index) => {
      const data = slides[index % slides.length];
      numberRef.current.textContent = data.number;
      titleRef.current.textContent = data.title;
      lines = splitLines(descRef.current, data.description);

      gsap.set(numberRef.current, { y: 20, opacity: 0 });
      gsap.set(titleRef.current, { y: 60, opacity: 0 });
      gsap.set(lines, { y: 80, opacity: 0 });
      gsap.to(overlayText, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(numberRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "gallery-smooth",
        delay: 0.1,
      });
      gsap.to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "gallery-smooth",
        delay: 0.15,
      });
      gsap.to(lines, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "gallery-smooth",
        delay: 0.2,
        stagger: 0.15,
      });
    };

    const createOverlay = (sourceImg, imageData) => {
      const node = document.createElement("div");
      node.className = "fixed left-0 top-0 z-[3] pointer-events-none will-change-transform";
      const img = document.createElement("img");
      img.src = sourceImg.src;
      img.alt = sourceImg.alt;
      img.className = "block h-full w-full object-cover";
      node.appendChild(img);
      document.body.appendChild(node);

      const rect = sourceImg.getBoundingClientRect();
      gsap.set(node, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        opacity: 1,
      });

      const hiRes = new Image();
      hiRes.onload = () => {
        img.src = imageData.full;
      };
      hiRes.src = imageData.full;
      return node;
    };

    const enterZoom = (index) => {
      if (zoomActive) return;
      zoomActive = true;
      selected = index;
      setMode("zoom");
      draggable?.disable();

      const img = items[index].querySelector("img");
      gsap.to(splitScreen, { opacity: 1, duration: 1.2, ease: "gallery-smooth" });

      overlay = createOverlay(img, images[index % images.length]);
      gsap.set(img, { opacity: 0 });

      flipTween = Flip.fit(overlay, zoomTarget, {
        duration: 1.2,
        ease: "gallery-smooth",
        absolute: true,
        onComplete: () => showText(index),
      });

      gsap.fromTo(
        closeButton,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.9 },
      );
    };

    const exitZoom = () => {
      if (!zoomActive || selected === null || !overlay) return;
      setMode("closing");
      flipTween?.kill();

      const element = items[selected];
      const img = element.querySelector("img");

      gsap.to(overlayText, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(numberRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" });
      gsap.to(titleRef.current, { y: -60, opacity: 0, duration: 0.4, ease: "power2.out" });
      if (lines) {
        gsap.to(lines, {
          y: -80,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: -0.05,
        });
      }
      gsap.to(closeButton, { opacity: 0, x: 40, duration: 0.3, ease: "power2.in" });
      gsap.to(splitScreen, { opacity: 0, duration: 0.8, ease: "power2.out" });

      Flip.fit(overlay, element, {
        duration: 1.2,
        ease: "gallery-smooth",
        absolute: true,
        onComplete: () => {
          gsap.set(img, { opacity: 1 });
          overlay?.remove();
          overlay = null;
          setMode("grid");
          draggable?.enable();
          zoomActive = false;
          selected = null;
          flipTween = null;
        },
      });
      gsap.to(overlay, { opacity: 0.4, duration: 0.8, ease: "power2.out" });
    };

    const applyZoom = (target, switchIndex) => {
      if (zoomActive) {
        exitZoom();
        return;
      }
      const newGap = gapForZoom(target);
      const oldZoom = zoom;
      zoom = target;
      setPercent(Math.round(target * 100));
      if (switchIndex !== undefined) setActiveSwitch(switchIndex);

      const start = centerFor(oldZoom, gap);
      gsap.to(wrapper, {
        duration: 0.6,
        x: start.x,
        y: start.y,
        ease: "gallery-center",
        onComplete: () => {
          if (newGap !== gap) reposition(newGap);
          const end = centerFor(target, gap);
          gsap.to(wrapper, {
            duration: 1.2,
            scale: target,
            x: end.x,
            y: end.y,
            ease: "gallery-smooth",
            onComplete: initDraggable,
          });
        },
      });
    };

    const fitZoom = () => {
      const g = gapForZoom(1);
      const d = dims(g);
      const margin = 40;
      const fitWidth = (window.innerWidth - margin * 2) / d.width;
      const fitHeight = (window.innerHeight - 80 - margin * 2) / d.height;
      return Math.max(0.1, Math.min(2, Math.min(fitWidth, fitHeight)));
    };

    const resetPosition = () => {
      if (zoomActive) return;
      const target = centerFor(zoom, gap);
      gsap.to(wrapper, {
        duration: 1,
        x: target.x,
        y: target.y,
        ease: "gallery-center",
        onComplete: initDraggable,
      });
    };

    apiRef.current = {
      enter: enterZoom,
      exit: exitZoom,
      zoom: applyZoom,
      fit: (switchIndex) => applyZoom(fitZoom(), switchIndex),
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        exitZoom();
        return;
      }
      if (zoomActive) return;
      if (e.key === "1") applyZoom(zoomOutLevel, 0);
      else if (e.key === "2") applyZoom(initialZoom, 1);
      else if (e.key === "3") applyZoom(zoomInLevel, 2);
      else if (e.key === "f" || e.key === "F") applyZoom(fitZoom(), 3);
    };

    const onResize = () => timers.push(setTimeout(resetPosition, 100));
    const onLeave = (e) => {
      if (draggable?.isDragging) draggable.endDrag(e);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    document.addEventListener("mouseleave", onLeave);

    const start = centerFor(zoom, gap);
    gsap.set(wrapper, { scale: zoom, x: start.x, y: start.y });
    gsap.to(viewport, {
      duration: 0.6,
      opacity: 1,
      ease: "power2.inOut",
      onComplete: () => {
        playIntro();
        timers.push(
          setTimeout(() => {
            initDraggable();
            setupObserver();
          }, 1500),
        );
      },
    });

    return () => {
      apiRef.current = null;
      timers.forEach(clearTimeout);
      observer?.disconnect();
      draggable?.kill();
      flipTween?.kill();
      overlay?.remove();
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf([
        ...items,
        wrapper,
        viewport,
        splitScreen,
        overlayText,
        closeButton,
        controls,
      ]);
    };
  }, [phase]);

  const interactive = mode !== "grid";
  const switchButtons = [
    { label: zoomOutLabel, level: zoomOutLevel },
    { label: normalLabel, level: initialZoom },
    { label: zoomInLabel, level: zoomInLevel },
  ];
  const switchClass = (index) =>
    `relative cursor-pointer whitespace-nowrap border-0 bg-transparent px-1.5 py-1 text-[10px] sm:px-2.5 sm:text-xs uppercase transition-colors duration-300 font-mono ${activeSwitch === index ? "text-white" : "text-neutral-500 hover:text-neutral-300"
    }`;

  return (
    <div
      ref={rootRef}
      data-dragging="false"
      className={`relative h-screen w-full select-none overflow-hidden font-sans ${interactive ? "cursor-default" : "cursor-grab data-[dragging=true]:cursor-grabbing"} ${backgroundColor} ${textColor} ${className}`}
    >
      {phase !== "ready" ? (
        <div
          className={`fixed inset-0 z-[100000] flex items-center justify-center transition-opacity duration-700 ${textColor} ${preloaderBackground} ${phase === "fading" ? "opacity-0" : "opacity-100"
            }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-xs uppercase tracking-[0.2em] font-mono">
              {loadingLabel}
            </span>
          </div>
        </div>
      ) : null}

      <div
        ref={viewportRef}
        className="fixed inset-0 z-[1] h-screen w-screen overflow-hidden opacity-0"
      >
        <div
          ref={wrapperRef}
          className="absolute left-0 top-0 isolate origin-top-left will-change-transform"
          style={{
            width: cols * (itemSize + initialGap) - initialGap,
            height: rows * (itemSize + initialGap) - initialGap,
          }}
        >
          <div className="relative h-full w-full">
            {Array.from({ length: total }, (_, i) => {
              const image = images[i % images.length];
              return (
                <div
                  key={i}
                  ref={(el) => (itemRefs.current[i] = el)}
                  onClick={() => apiRef.current?.enter(i)}
                  className="absolute z-[1] cursor-pointer opacity-0 will-change-transform"
                  style={{
                    width: itemSize,
                    height: itemSize,
                    left: (i % cols) * (itemSize + initialGap),
                    top: Math.floor(i / cols) * (itemSize + initialGap),
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    draggable={false}
                    className="pointer-events-none block h-full w-full select-none object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        ref={splitScreenRef}
        className={`fixed inset-0 z-[2] flex h-screen w-screen opacity-0 ${interactive ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        <div
          onClick={(e) => e.target === e.currentTarget && apiRef.current?.exit()}
          className="relative z-[1] flex h-screen w-1/2 cursor-pointer items-center justify-center bg-black/60"
        >
          <div ref={zoomTargetRef} className="relative z-[1] h-full w-full" />
        </div>
        <div
          onClick={(e) => e.target === e.currentTarget && apiRef.current?.exit()}
          className="relative z-[1] flex h-screen w-1/2 cursor-pointer items-center justify-center bg-black/60"
        />
      </div>

      <div
        ref={overlayRef}
        className="pointer-events-none absolute bottom-10 left-10 z-[4] text-white opacity-0"
      >
        <div className="mb-2 h-5 w-[400px] max-w-[calc(100vw-5rem)] overflow-hidden max-[900px]:h-[18px] max-[900px]:w-[300px]">
          <span
            ref={numberRef}
            className="block text-xs uppercase leading-normal tracking-[0.1em] will-change-transform font-mono max-[900px]:text-[10px]"
          />
        </div>
        <div className="relative mb-4 h-[60px] w-[400px] max-w-[calc(100vw-5rem)] overflow-hidden max-[900px]:h-[50px] max-[900px]:w-[300px]">
          <h1
            ref={titleRef}
            className="m-0 whitespace-nowrap text-5xl font-medium leading-tight tracking-[-0.02em] will-change-transform max-[900px]:text-4xl"
          />
        </div>
        <div
          ref={descRef}
          className="relative min-h-[80px] w-[400px] max-w-[calc(100vw-5rem)] overflow-hidden text-base font-light leading-snug max-[900px]:min-h-[70px] max-[900px]:w-[300px]"
        />
      </div>

      <button
        ref={closeRef}
        type="button"
        aria-label={closeLabel}
        onClick={() => apiRef.current?.exit()}
        className={`fixed right-5 top-1/2 z-[5] flex h-16 w-16 -translate-y-1/2 items-center justify-center opacity-0 transition-opacity duration-200 hover:!opacity-70 ${interactive ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="rotate-180"
          aria-hidden="true"
        >
          <path d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z" />
        </svg>
      </button>

      <div
        ref={controlsRef}
        className={`fixed bottom-5 z-[6] flex -translate-x-1/2 opacity-0 transition-[left] duration-[1200ms] [transition-timing-function:cubic-bezier(0.87,0,0.13,1)] ${mode === "zoom" ? "left-1/2 md:left-3/4" : "left-1/2"
          }`}
      >
        <div
          ref={percentRef}
          className="flex min-w-[5em] items-center justify-center whitespace-nowrap rounded-l-md bg-neutral-100 px-3 py-2.5 text-xs uppercase text-neutral-800 sm:px-5 font-mono"
        >
          {percent}%
        </div>
        <div
          ref={switchRef}
          className="flex gap-1 rounded-r-md bg-neutral-900 px-2 py-2.5 sm:gap-5 sm:px-5"
        >
          {switchButtons.map(({ label, level }, index) => (
            <button
              key={label}
              type="button"
              onClick={() => apiRef.current?.zoom(level, index)}
              className={switchClass(index)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => apiRef.current?.fit(3)}
            className={switchClass(3)}
          >
            {fitLabel}
          </button>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[9998]">
        <div className="absolute inset-0 mix-blend-overlay [background:linear-gradient(to_bottom,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.5)_20%,transparent_40%)]" />
      </div>
    </div>
  );
}