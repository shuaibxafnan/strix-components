"use client";

import { useEffect, useRef, useState, useId, useCallback } from "react";

const FONT_IMPORT_ID = "survey-gallery-fonts";

const ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80",
    alt: "A calm alpine lake beneath steep cliffs at Seealpsee, Switzerland",
    title: "Seealpsee",
    elevation: 1141,
    coords: "47.2836°N, 9.4172°E",
    fact: "Seealpsee lies at eleven hundred meters in the Appenzell Alps, a sliver of meltwater cupped beneath the limestone walls of the Säntis. For much of the day the cliffs keep it in shadow, and its surface settles into a still, glassy green.",
  },
  {
    src: "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1600&q=80",
    alt: "Snow-covered summit of K2 under a clear sky",
    title: "K2",
    elevation: 8611,
    coords: "35.8825°N, 76.5133°E",
    fact: "K2 rises to 8,611 meters on the Pakistan-China border, the second-highest point on Earth and by far the more dangerous to climb. It went unclimbed in winter until 2021, decades after every other eight-thousander had already fallen.",
  },
  {
    src: "https://images.unsplash.com/photo-1546419793-1ee93d7cff56?auto=format&fit=crop&w=1600&q=80",
    alt: "Snow-covered mountain face under a blue sky",
    title: "The North Face",
    elevation: 3970,
    coords: "46.5773°N, 8.0053°E",
    fact: "A mountain's north face turns away from the sun, so its ice never fully lets go. The Eiger's is eighteen hundred meters of it, a wall so deadly that climbers renamed the Nordwand the Mordwand, the murder wall.",
  },
  {
    src: "https://images.unsplash.com/photo-1706341299879-4c52bd9c88fa?auto=format&fit=crop&w=1600&q=80",
    alt: "Snow-capped mountain range at Aoraki, Mount Cook, New Zealand",
    title: "Mount Cook",
    elevation: 3724,
    coords: "43.5950°S, 170.1418°E",
    fact: "Aoraki, or Mount Cook, is New Zealand's highest peak at 3,724 meters, though a 1991 rockfall sheared roughly ten meters off its summit overnight. Edmund Hillary trained on its slopes before he ever set eyes on Everest.",
  },
  {
    src: "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1600&q=80",
    alt: "Snow-covered ridgeline and valley at Mount Everest",
    title: "Mount Everest",
    elevation: 8849,
    coords: "27.9881°N, 86.9250°E",
    fact: "Mount Everest grows roughly four millimeters taller each year as the Indian plate keeps pushing into Asia. Its summit was once seabed, and fossilized marine creatures are still found near the top.",
  },
];

function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}

export default function SurveyGallery({
  items = ITEMS,
  bgColor = "#F4F5F1",
  inkColor = "#12181C",
  stoneColor = "#6E7A80",
  accentColor = "#2F5D62",
  flagColor = "#B5482A",
  slotWidthVw = 23,
  gapPx = 64,
  wheelLerp = 0.1,
  overlayBg = "#F4F5F1",
  label = "Field Survey / 5 Ascents",
  returnLabel = "Return",
  elevationSuffix = "m above sea level",
  className = "",
}) {
  const uid = useId();
  const trackRef = useRef(null);
  const slotRefs = useRef([]);
  const scrollX = useRef(0);
  const targetScrollX = useRef(0);
  const stepX = useRef(0);
  const periodX = useRef(0);
  const rafId = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    ensureFonts();
  }, []);

  const measure = useCallback(() => {
    const first = slotRefs.current[0];
    const w = first?.offsetWidth ?? 0;
    stepX.current = w + gapPx;
    periodX.current = items.length * stepX.current;
  }, [items.length, gapPx]);

  const applyTransforms = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const vw = window.innerWidth;
    const half = periodX.current / 2;
    const c = Math.floor(items.length / 2);
    for (let i = 0; i < items.length; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      let relX = (i - c) * stepX.current - scrollX.current;
      relX = ((relX % periodX.current) + periodX.current) % periodX.current;
      if (relX >= half) relX -= periodX.current;
      const x = vw / 2 + relX - (el.offsetWidth ?? 0) / 2;
      el.style.transform = `translateX(${x}px)`;
    }
  }, [items.length]);

  useEffect(() => {
    if (openIndex !== null) return;
    measure();
    applyTransforms();

    function onWheel(e) {
      e.preventDefault();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      targetScrollX.current += delta;
    }
    let touchX = 0;
    let touchY = 0;
    function onTouchStart(e) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }
    function onTouchMove(e) {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = touchX - x;
      const dy = touchY - y;
      touchX = x;
      touchY = y;
      targetScrollX.current += Math.abs(dx) > Math.abs(dy) ? dx : dy;
    }
    function onResize() {
      measure();
      applyTransforms();
    }
    function tick() {
      scrollX.current += (targetScrollX.current - scrollX.current) * wheelLerp;
      applyTransforms();
      rafId.current = requestAnimationFrame(tick);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [openIndex, measure, applyTransforms, wheelLerp]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const elevations = items.map((it) => it.elevation ?? 0);
  const maxElev = Math.max(1, ...elevations);
  const minElev = Math.min(0, ...elevations);
  const span = Math.max(1, maxElev - minElev);
  const sparkPoints = items
    .map((it, i) => {
      const x = items.length <= 1 ? 0 : (i / (items.length - 1)) * 100;
      const y = 100 - ((((it.elevation ?? 0) - minElev) / span) * 70 + 15);
      return `${x},${y}`;
    })
    .join(" ");

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <div
      className={"relative w-full h-screen overflow-hidden select-none " + className}
      style={{ backgroundColor: bgColor, fontFamily: "Inter, sans-serif" }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-24 w-full opacity-[0.35] pointer-events-none"
      >
        <polyline
          points={sparkPoints}
          fill="none"
          stroke={accentColor}
          strokeWidth="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute top-6 left-6 z-10 pr-6" style={{ color: inkColor }}>
        <p
          className="text-xs tracking-[0.15em] uppercase"
          style={{ fontFamily: "IBM Plex Mono, monospace", color: stoneColor }}
        >
          {label}
        </p>
      </div>

      <div ref={trackRef} className="absolute inset-0">
        {items.map((item, i) => (
          <button
            key={`${uid}-${i}`}
            type="button"
            ref={(el) => (slotRefs.current[i] = el)}
            onClick={() => setOpenIndex(i)}
            className="group absolute top-1/2 -translate-y-1/2 text-left"
            style={{ width: `max(${slotWidthVw}vw, 180px)` }}
            aria-label={`Open ${item.title}`}
          >
            <div className="relative overflow-hidden rounded-[2px]">
              <img
                src={item.src}
                alt={item.alt ?? item.title}
                draggable={false}
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(180deg, transparent 60%, ${inkColor}66 100%)`,
                }}
              />
            </div>
            <div className="flex items-baseline justify-between pt-3">
              <span
                className="text-sm tracking-wide"
                style={{ fontFamily: "Fraunces, serif", color: inkColor }}
              >
                {item.title}
              </span>
              <span
                className="text-[11px] tabular-nums"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  color: stoneColor,
                }}
              >
                {item.elevation ? `${item.elevation.toLocaleString()}m` : ""}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className={
          "fixed inset-0 z-50 transition-[opacity,visibility] duration-500 ease-out " +
          (active
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none")
        }
        style={{ backgroundColor: overlayBg }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!active}
      >
        <button
          type="button"
          onClick={() => setOpenIndex(null)}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-60"
          style={{ fontFamily: "IBM Plex Mono, monospace", color: inkColor }}
        >
          <span aria-hidden="true">&#8592;</span> {returnLabel}
        </button>

        {active && (
          <div className="flex flex-col md:flex-row w-full h-full">
            <div className="relative md:w-[62%] h-[48%] md:h-full overflow-hidden">
              <img
                src={active.src}
                alt={active.alt ?? active.title}
                className={
                  "w-full h-full object-cover transition-transform duration-[1200ms] ease-out " +
                  (active ? "scale-100" : "scale-110")
                }
              />
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 px-8 md:px-14 py-10 overflow-y-auto">
              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-2"
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    color: flagColor,
                  }}
                >
                  {active.coords ?? ""}
                </p>
                <h2
                  className="text-4xl md:text-5xl leading-[1.05]"
                  style={{ fontFamily: "Fraunces, serif", color: inkColor }}
                >
                  {active.title}
                </h2>
              </div>

              <div
                className="h-px w-16"
                style={{ backgroundColor: accentColor }}
              />

              <p
                className="text-sm tabular-nums tracking-wide"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  color: stoneColor,
                }}
              >
                {active.elevation
                  ? `${active.elevation.toLocaleString()} ${elevationSuffix}`
                  : ""}
              </p>

              <p
                className="text-base leading-relaxed max-w-md"
                style={{ color: inkColor }}
              >
                {active.fact}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
