"use client";

import { useEffect, useRef, useId, useState } from "react";

// ─── ProximityScaleGrid ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #0e100f    Page background
// textColor        string   #fffce1    Card title text color
// accentColor      string   #0ae448    Accent color used for controls (thumb/value text)
// cards            array    (see below) List of { icon, title, x, y, r } items to render
// radius           number   200        Proximity radius in px — distance at which scale reaches 1
// maxScale         number   2.5        Max scale applied to a card directly under the cursor
// duration         number   0.35       gsap.to duration (s) for the hover-in scale tween
// leaveDuration    number   0.7        gsap.to duration (s) for the reset tween on mouse leave
// ease             string   power2.out Ease used for both hover and leave tweens
// gridHeight       number   620        Height of the scatter grid stage (px)
// showControls     bool     true       Render the Radius / Max Scale / Duration range sliders
// showLabel        bool     true       Render the "move cursor over grid" corner label
// ──────────────────────────────────────────────────────────────────────────
//
// `cards` item shape: { icon: string (image url), title: string, x: string ("5%"), y: string ("8%"), r: string ("-3deg") }

const DEFAULT_CARDS = [
  {
    icon: "https://assets.codepen.io/16327/2D-keyframe.png",
    title: "gsap.to()",
    x: "5%",
    y: "8%",
    r: "-3deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-flower.png",
    title: "gsap.from()",
    x: "28%",
    y: "2%",
    r: "2deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-diamond.png",
    title: "gsap.fromTo()",
    x: "55%",
    y: "5%",
    r: "-1deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-circle.png",
    title: "gsap.set()",
    x: "80%",
    y: "3%",
    r: "4deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-star.png",
    title: "timeline()",
    x: "12%",
    y: "32%",
    r: "2deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-circles.png",
    title: "stagger",
    x: "40%",
    y: "28%",
    r: "-4deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-sparkle.png",
    title: "ScrollTrigger",
    x: "68%",
    y: "30%",
    r: "1deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-wobble.png",
    title: "ease",
    x: "3%",
    y: "58%",
    r: "-2deg",
  },
  {
    icon: "https://assets.codepen.io/16327/3D-hoop.png",
    title: "Flip",
    x: "30%",
    y: "55%",
    r: "3deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-morph.png",
    title: "MotionPath",
    x: "58%",
    y: "60%",
    r: "-3deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-label.png",
    title: "SplitText",
    x: "82%",
    y: "55%",
    r: "2deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-lock.png",
    title: "overwrite",
    x: "18%",
    y: "82%",
    r: "-1deg",
  },
  {
    icon: "https://assets.codepen.io/16327/3D-cone.png",
    title: "defaults()",
    x: "48%",
    y: "85%",
    r: "3deg",
  },
  {
    icon: "https://assets.codepen.io/16327/2D-windmill.png",
    title: "killTweensOf()",
    x: "75%",
    y: "80%",
    r: "-2deg",
  },
];

export default function ProximityScaleGrid({
  bgColor = "#0e100f",
  textColor = "#fffce1",
  accentColor = "#0ae448",
  cards = DEFAULT_CARDS,
  radius = 200,
  maxScale = 2.5,
  duration = 0.35,
  leaveDuration = 0.7,
  ease = "power2.out",
  gridHeight = 620,
  showControls = true,
  showLabel = true,
}) {
  const uid = useId().replace(/:/g, "");
  const stageRef = useRef(null);

  const [liveRadius, setLiveRadius] = useState(radius);
  const [liveMaxScale, setLiveMaxScale] = useState(maxScale);
  const [liveDuration, setLiveDuration] = useState(duration);

  const radiusRef = useRef(liveRadius);
  const maxScaleRef = useRef(liveMaxScale);
  const durationRef = useRef(liveDuration);

  useEffect(() => {
    radiusRef.current = liveRadius;
  }, [liveRadius]);

  useEffect(() => {
    maxScaleRef.current = liveMaxScale;
  }, [liveMaxScale]);

  useEffect(() => {
    durationRef.current = liveDuration;
  }, [liveDuration]);

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

    let cleanupFns = [];
    let cancelled = false;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        const stage = stageRef.current;
        if (!gsap || !stage) return;

        gsap.config({ trialWarn: false });

        const cardEls = Array.from(stage.querySelectorAll(".proximity-card"));

        function handleMouseMove(e) {
          const mx = e.clientX;
          const my = e.clientY;
          cardEls.forEach((card) => {
            const r = card.getBoundingClientRect();
            const d = Math.hypot(
              mx - (r.left + r.width / 2),
              my - (r.top + r.height / 2),
            );
            const p = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(0, radiusRef.current, 1, 0, d),
            );
            gsap.to(card, {
              scale: 1 + (maxScaleRef.current - 1) * p,
              duration: durationRef.current,
              overwrite: true,
              ease,
            });
          });
        }

        function handleMouseLeave() {
          cardEls.forEach((card) => {
            gsap.to(card, {
              scale: 1,
              duration: leaveDuration,
              overwrite: true,
              ease,
            });
          });
        }

        stage.addEventListener("mousemove", handleMouseMove);
        stage.addEventListener("mouseleave", handleMouseLeave);

        cleanupFns.push(() => {
          stage.removeEventListener("mousemove", handleMouseMove);
          stage.removeEventListener("mouseleave", handleMouseLeave);
          gsap.killTweensOf(cardEls);
        });
      })
      .catch((e) =>
        console.error("[ProximityScaleGrid] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [cards, ease, leaveDuration]);

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center gap-9 px-6 py-12"
      style={{ backgroundColor: bgColor }}
    >
      {showControls && (
        <div className="flex flex-wrap justify-center items-end gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.6rem] uppercase tracking-wide text-[#7c7c6f]">
              Radius
            </label>
            <input
              type="range"
              min={80}
              max={400}
              step={10}
              value={liveRadius}
              onChange={(e) => setLiveRadius(Number(e.target.value))}
              className="min-w-[130px] h-1.5 rounded-full bg-[#42433d] appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0e100f] [&::-webkit-slider-thumb]:[background-color:var(--proximity-accent)]"
              style={{ "--proximity-accent": accentColor }}
            />
            <span
              className="font-mono text-[0.6rem] text-right"
              style={{ color: accentColor }}
            >
              {liveRadius}px
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.6rem] uppercase tracking-wide text-[#7c7c6f]">
              Max Scale
            </label>
            <input
              type="range"
              min={1.2}
              max={4}
              step={0.1}
              value={liveMaxScale}
              onChange={(e) => setLiveMaxScale(Number(e.target.value))}
              className="min-w-[130px] h-1.5 rounded-full bg-[#42433d] appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0e100f] [&::-webkit-slider-thumb]:[background-color:var(--proximity-accent)]"
              style={{ "--proximity-accent": accentColor }}
            />
            <span
              className="font-mono text-[0.6rem] text-right"
              style={{ color: accentColor }}
            >
              {liveMaxScale.toFixed(1)}×
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.6rem] uppercase tracking-wide text-[#7c7c6f]">
              Duration
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={liveDuration}
              onChange={(e) => setLiveDuration(Number(e.target.value))}
              className="min-w-[130px] h-1.5 rounded-full bg-[#42433d] appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0e100f] [&::-webkit-slider-thumb]:[background-color:var(--proximity-accent)]"
              style={{ "--proximity-accent": accentColor }}
            />
            <span
              className="font-mono text-[0.6rem] text-right"
              style={{ color: accentColor }}
            >
              {liveDuration.toFixed(2)}s
            </span>
          </div>
        </div>
      )}

      <div
        ref={stageRef}
        className="relative w-full max-w-[900px] cursor-crosshair"
      >
        <div
          className="relative w-full pointer-events-none"
          style={{ height: `${gridHeight}px` }}
        >
          {cards.map((card, i) => (
            <div
              key={`${uid}-${i}`}
              className="proximity-card absolute flex flex-col items-center justify-center gap-2.5 rounded-full bg-transparent pointer-events-none [transform-origin:center_center]"
              style={{
                left: card.x,
                top: card.y,
                rotate: card.r || "0deg",
              }}
            >
              <div className="w-10 h-10 shrink-0">
                <img
                  src={card.icon}
                  alt=""
                  className="w-full h-full object-contain block"
                />
              </div>
              <span
                className="font-sans font-semibold text-sm text-center inline-block"
                style={{ color: textColor }}
              >
                {card.title}
              </span>
            </div>
          ))}
        </div>

        {showLabel && (
          <span className="absolute -bottom-5 right-3.5 font-mono text-[0.54rem] text-[#42433d] pointer-events-none">
            move cursor over grid
          </span>
        )}
      </div>
    </div>
  );
}
