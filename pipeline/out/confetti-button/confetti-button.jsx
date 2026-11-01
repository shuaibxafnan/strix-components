"use client";

import { useEffect, useRef } from "react";

const generateParticles = (gsap, parent, quantity, x, y, minAngle, maxAngle, colors) => {
  for (let i = quantity - 1; i >= 0; i--) {
    const angle = gsap.utils.random(minAngle, maxAngle) * (Math.PI / 180);
    const velocity = gsap.utils.random(70, 140);
    const dot = document.createElement("div");

    dot.style.position = "absolute";
    dot.style.width = "4px";
    dot.style.height = "4px";
    dot.style.marginTop = "-2px";
    dot.style.marginLeft = "-2px";
    dot.style.borderRadius = "1px";
    dot.style.left = "0";
    dot.style.top = "0";
    dot.style.transformStyle = "preserve-3d";
    dot.style.background = colors[Math.floor(gsap.utils.random(0, colors.length))];

    parent.appendChild(dot);

    gsap.set(dot, {
      opacity: 0,
      x: x,
      y: y,
      scale: gsap.utils.random(0.4, 0.7),
    });

    const targetX = x + Math.cos(angle) * velocity * 1.5;
    const targetY = y + Math.sin(angle) * velocity * 1.5 + 120;

    gsap
      .timeline({
        onComplete() {
          dot.remove();
        },
      })
      .to(dot, { duration: 0.05, opacity: 1 }, 0)
      .to(
        dot,
        {
          duration: 1.8,
          x: targetX,
          y: targetY,
          rotationX: `-=${gsap.utils.random(720, 1440)}`,
          rotationZ: `+=${gsap.utils.random(720, 1440)}`,
          ease: "power2.out",
        },
        0,
      )
      .to(dot, { duration: 1, opacity: 0 }, 0.8);
  }
};

export default function ConfettiButton({
  label = "Confirm",
  variant = "dark",
  primaryColor = "#1E2235",
  textColor = "#F6F8FF",
  shadowColor = "#00093D",
  cannonDark = "#A6ACCD",
  cannonLight = "#F6F8FF",
  cannonShadow = "#0D0F18",
  confettiColors = ["#892AB8", "#EA4C89", "#FFFF04", "#4AF2FD"],
  confettiQuantity = 100,
  strokeWidth = 1,
  className = "",
}) {
  const buttonRef = useRef(null);
  const isWhite = variant === "white";
  const isGrey = variant === "grey";

  const finalBg = isWhite ? "#ffffff" : isGrey ? "#404660" : primaryColor;
  const finalColor = isWhite ? "#1E2235" : textColor;
  const finalCannonDark = isWhite ? "#103FC5" : isGrey ? "#D1D6EE" : cannonDark;
  const finalCannonLight = isWhite ? "#275EFE" : isGrey ? "#FFFFFF" : cannonLight;
  const finalCannonShadow = isWhite
    ? "rgba(0,9,61,0.2)"
    : isGrey
      ? "rgba(13,15,24,0.2)"
      : `color-mix(in srgb, ${cannonShadow} 90%, transparent)`;
  const finalBoxShadow = isWhite
    ? "none"
    : `0 4px 8px color-mix(in srgb, ${shadowColor} 24%, transparent)`;

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    let cancelled = false;
    let cleanupEvents = null;
    let gsapRef = null;
    const tweened = [];

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap || mod.default;
      gsapRef = gsap;
      const bounding = button.getBoundingClientRect();

      const handleMouseMove = (e) => {
        let dy = (e.clientY - bounding.top - bounding.height / 2) / -1;
        let dx = (e.clientX - bounding.left - bounding.width / 2) / 10;
        dy = dy > 10 ? 10 : dy < -10 ? -10 : dy;
        dx = dx > 4 ? 4 : dx < -4 ? -4 : dx;

        button.style.setProperty("--rx", dy);
        button.style.setProperty("--ry", dx);
        button.style.setProperty("--transform-duration", ".16s");
      };

      const handleMouseLeave = () => {
        button.style.setProperty("--rx", "0");
        button.style.setProperty("--ry", "0");
        button.style.setProperty("--transform-duration", ".4s");
      };

      const handleExplicitClick = () => {
        button.classList.add("success");
        button.style.setProperty("--confetti-scale", "0");
        button.style.setProperty("--stroke-dashoffset", "15");

        tweened.push(
          gsap.to(button, {
            "--icon-x": -3,
            "--icon-y": 3,
            "--z-before": 0,
            duration: 0.2,
            onComplete() {
              const emitter = button.querySelector(".emitter");
              if (emitter) {
                generateParticles(gsap, emitter, confettiQuantity, -4, 6, -80, -50, confettiColors);
              }
              tweened.push(
                gsap.to(button, {
                  "--icon-x": 0,
                  "--icon-y": 0,
                  "--z-before": -6,
                  duration: 1,
                  ease: "elastic.out(1, .5)",
                  onComplete() {
                    button.classList.remove("success");
                    button.style.removeProperty("--confetti-scale");
                    button.style.removeProperty("--stroke-dashoffset");
                  },
                }),
              );
            },
          }),
        );
      };

      button.addEventListener("mousemove", handleMouseMove);
      button.addEventListener("mouseleave", handleMouseLeave);
      button.addEventListener("click", handleExplicitClick);

      cleanupEvents = () => {
        button.removeEventListener("mousemove", handleMouseMove);
        button.removeEventListener("mouseleave", handleMouseLeave);
        button.removeEventListener("click", handleExplicitClick);
      };
    });

    return () => {
      cancelled = true;
      if (cleanupEvents) cleanupEvents();
      tweened.forEach((t) => t.kill());
      if (gsapRef) {
        gsapRef.killTweensOf(button);
        button.querySelectorAll(".emitter > div").forEach((d) => {
          gsapRef.killTweensOf(d);
          d.remove();
        });
      }
    };
  }, [confettiQuantity, confettiColors.join(",")]);

  return (
    <div className={`w-full h-screen flex items-center justify-center ${className}`}>
    <button
      ref={buttonRef}
      style={{
        "--background": finalBg,
        "--color": finalColor,
        "--shadow": finalBoxShadow,
        "--cannon-dark": finalCannonDark,
        "--cannon-light": finalCannonLight,
        "--cannon-shadow": finalCannonShadow,
        "--confetti-1": confettiColors[0],
        "--confetti-2": confettiColors[1],
        "--confetti-3": confettiColors[2],
        "--confetti-4": confettiColors[3],
        "--z-before": "-6",
        transform:
          "perspective(440px) rotateX(calc(var(--rx, 0) * 1deg)) rotateY(calc(var(--ry, 0) * 1deg)) translateZ(0)",
        transition: "transform var(--transform-duration, 0.4s)",
      }}
      className="group relative table select-none border-0 bg-none px-6 py-3 text-[14px] leading-[26px] outline-none cursor-pointer will-change-transform [transform-style:preserve-3d] [-webkit-appearance:none] [-webkit-tap-highlight-color:transparent]"
    >
      <div
        style={{
          boxShadow: isWhite
            ? "inset 0 0 0 1px #E1E6F9"
            : "0 4px 8px var(--shadow)",
          transform: "translateZ(calc(var(--z-before) * 1px))",
        }}
        className="absolute inset-0 rounded-[5px] bg-[var(--background)] pointer-events-none"
      />
      <div className="relative z-10 flex items-center justify-center">
        <div
          style={{
            transform:
              "translate(calc(var(--icon-x, 0) * 1px), calc(var(--icon-y, 0) * 1px)) translateZ(2px)",
          }}
          className="relative inline-block h-[14px] w-[24px] mr-[16px] align-top [transform-style:preserve-3d]"
        >
          <div className="absolute left-[17px] bottom-[9px]">
            <svg
              viewBox="0 0 18 16"
              style={{ strokeWidth: `${strokeWidth}px` }}
              className="block h-[16px] w-[18px] fill-none stroke-round"
            >
              <polyline
                points="1 10 4 7 4 5 6 1"
                style={{
                  strokeDasharray: "15 20",
                  strokeDashoffset: "var(--stroke-dashoffset, 0)",
                  stroke: "var(--confetti-3)",
                }}
                className="transition-[stroke-dashoffset] duration-200"
              />
              <path
                d="M4,13 C5.33333333,9 7,7 9,7 C11,7 12.3340042,6 13.0020125,4"
                style={{
                  strokeDasharray: "15 20",
                  strokeDashoffset: "var(--stroke-dashoffset, 0)",
                  stroke: "var(--confetti-2)",
                }}
                className="transition-[stroke-dashoffset] duration-200"
              />
              <path
                d="M6,15 C7.83362334,13.6666667 9.83362334,12.6666667 12,12 C14.1663767,11.3333333 15.8330433,9.66666667 17,7"
                style={{
                  strokeDasharray: "15 20",
                  strokeDashoffset: "var(--stroke-dashoffset, 0)",
                  stroke: "var(--confetti-1)",
                }}
                className="transition-[stroke-dashoffset] duration-200"
              />
            </svg>
            <i
              style={{
                transform: "scale(var(--confetti-scale, .5))",
                background: "var(--confetti-3)",
              }}
              className="absolute block h-[4px] w-[4px] rounded-[1px] left-[-1px] top-[3px] transition-transform duration-250"
            />
            <i
              style={{
                transform: "scale(var(--confetti-scale, .5))",
                background: "var(--confetti-4)",
              }}
              className="absolute block h-[4px] w-[4px] rounded-[2px] left-[9px] top-[-1px] transition-transform duration-250"
            />
            <i
              style={{
                transform: "scale(var(--confetti-scale, .5))",
                background: "var(--confetti-1)",
              }}
              className="absolute block h-[4px] w-[4px] rounded-[1px] left-[5px] top-[3px] transition-transform duration-250"
            />
            <i
              style={{
                transform: "scale(var(--confetti-scale, .5))",
                background: "var(--confetti-2)",
              }}
              className="absolute block h-[4px] w-[4px] rounded-[1px] left-[10px] top-[14px] transition-transform duration-250"
            />
            <i
              style={{
                transform: "scale(var(--confetti-scale, .5))",
                background: "var(--confetti-4)",
              }}
              className="absolute block h-[4px] w-[4px] rounded-[1px] left-[9px] top-[7px] transition-transform duration-250"
            />
            <i
              style={{
                transform: "scale(var(--confetti-scale, .5))",
                background: "var(--confetti-2)",
              }}
              className="absolute block h-[4px] w-[4px] rounded-[2px] left-[6px] top-[8px] transition-transform duration-250"
            />
            <div className="absolute left-[4px] bottom-[4px] pointer-events-none emitter" />
          </div>
          <div
            style={{ filter: "drop-shadow(-2px 2px 2px var(--cannon-shadow))" }}
            className="relative w-[24px] h-[14px] translate-y-[3px] -rotate-45"
          >
            <div
              style={{
                background:
                  "linear-gradient(var(--cannon-dark), var(--cannon-light) 50%, var(--cannon-dark))",
                clipPath: "polygon(25px -1px, 0 52%, 25px 15px)",
              }}
              className="w-full h-[14px]"
            />
            <div
              style={{
                boxShadow: "inset 0 0 0 .5px var(--cannon-light)",
                background:
                  "linear-gradient(90deg, var(--cannon-dark), var(--cannon-light))",
              }}
              className="absolute w-[6px] h-[14px] right-[-3px] top-0 rounded-full"
            />
          </div>
        </div>
        <span
          style={{ color: "var(--color)" }}
          className="relative inline-block align-top z-10 select-none"
        >
          {label}
        </span>
      </div>
    </button>
    </div>
  );
}
