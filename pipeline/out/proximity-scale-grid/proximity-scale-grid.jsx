"use client";

import { useEffect, useRef, useId } from "react";

const icon = (folder, file) =>
  `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodeURIComponent(folder)}/3D/${file}_3d.png`;

const DEFAULT_CARDS = [
  { icon: icon("Right arrow", "right_arrow"), title: "gsap.to()", x: "5%", y: "8%", r: "-3deg" },
  { icon: icon("Left arrow", "left_arrow"), title: "gsap.from()", x: "28%", y: "2%", r: "2deg" },
  { icon: icon("Left-right arrow", "left-right_arrow"), title: "gsap.fromTo()", x: "55%", y: "5%", r: "-1deg" },
  { icon: icon("Pushpin", "pushpin"), title: "gsap.set()", x: "80%", y: "3%", r: "4deg" },
  { icon: icon("Stopwatch", "stopwatch"), title: "timeline()", x: "12%", y: "32%", r: "2deg" },
  { icon: icon("Bar chart", "bar_chart"), title: "stagger", x: "40%", y: "28%", r: "-4deg" },
  { icon: icon("Computer mouse", "computer_mouse"), title: "ScrollTrigger", x: "68%", y: "30%", r: "1deg" },
  { icon: icon("Water wave", "water_wave"), title: "ease", x: "3%", y: "58%", r: "-2deg" },
  { icon: icon("Counterclockwise arrows button", "counterclockwise_arrows_button"), title: "Flip", x: "30%", y: "55%", r: "3deg" },
  { icon: icon("World map", "world_map"), title: "MotionPath", x: "58%", y: "60%", r: "-3deg" },
  { icon: icon("Scissors", "scissors"), title: "SplitText", x: "82%", y: "55%", r: "2deg" },
  { icon: icon("Pencil", "pencil"), title: "overwrite", x: "18%", y: "82%", r: "-1deg" },
  { icon: icon("Gear", "gear"), title: "defaults()", x: "48%", y: "85%", r: "3deg" },
  { icon: icon("Cross mark", "cross_mark"), title: "killTweensOf()", x: "75%", y: "80%", r: "-2deg" },
];

export default function ProximityScaleGrid({
  bgColor = "#0e100f",
  textColor = "#fffce1",
  cards = DEFAULT_CARDS,
  radius = 200,
  maxScale = 2.5,
  duration = 0.35,
  leaveDuration = 0.7,
  ease = "power2.out",
  gridHeight = 620,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const stageRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = null;

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap || mod.default;
      const stage = stageRef.current;
      if (!stage) return;

      const cardEls = Array.from(stage.querySelectorAll(".proximity-card"));

      function handleMove(e) {
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
            gsap.utils.mapRange(0, radius, 1, 0, d),
          );
          gsap.to(card, {
            scale: 1 + (maxScale - 1) * p,
            duration,
            overwrite: true,
            ease,
          });
        });
      }

      function handleLeave() {
        cardEls.forEach((card) => {
          gsap.to(card, {
            scale: 1,
            duration: leaveDuration,
            overwrite: true,
            ease,
          });
        });
      }

      stage.addEventListener("pointermove", handleMove);
      stage.addEventListener("pointerleave", handleLeave);

      cleanup = () => {
        stage.removeEventListener("pointermove", handleMove);
        stage.removeEventListener("pointerleave", handleLeave);
        gsap.killTweensOf(cardEls);
      };
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [cards, radius, maxScale, duration, ease, leaveDuration]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden px-6 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={stageRef}
        className="relative w-full max-w-[900px] cursor-crosshair"
      >
        <div
          className="relative w-full pointer-events-none"
          style={{ height: `${gridHeight}px`, maxHeight: "85vh" }}
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
      </div>
    </div>
  );
}
