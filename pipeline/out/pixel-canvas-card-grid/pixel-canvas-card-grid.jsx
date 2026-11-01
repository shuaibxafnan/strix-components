"use client";

import { useEffect, useRef } from "react";


const ICONS = {
  layout: (
    <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V98H38V56A2,2,0,0,1,40,54ZM38,200V110H98v92H40A2,2,0,0,1,38,200Zm178,2H110V110H218v90A2,2,0,0,1,216,202Z" />
  ),
  code: (
    <path d="M67.84,92.61,25.37,128l42.47,35.39a6,6,0,1,1-7.68,9.22l-48-40a6,6,0,0,1,0-9.22l48-40a6,6,0,0,1,7.68,9.22Zm176,30.78-48-40a6,6,0,1,0-7.68,9.22L230.63,128l-42.47,35.39a6,6,0,1,0,7.68,9.22l48-40a6,6,0,0,0,0-9.22Zm-81.79-89A6,6,0,0,0,154.36,38l-64,176A6,6,0,0,0,94,221.64a6.15,6.15,0,0,0,2,.36,6,6,0,0,0,5.64-3.95l64-176A6,6,0,0,0,162.05,34.36Z" />
  ),
  command: (
    <path d="M180,146H158V110h22a34,34,0,1,0-34-34V98H110V76a34,34,0,1,0-34,34H98v36H76a34,34,0,1,0,34,34V158h36v22a34,34,0,1,0,34-34ZM158,76a22,22,0,1,1,22,22H158ZM54,76a22,22,0,0,1,44,0V98H76A22,22,0,0,1,54,76ZM98,180a22,22,0,1,1-22-22H98Zm12-70h36v36H110Zm70,92a22,22,0,0,1-22-22V158h22a22,22,0,0,1,0,44Z" />
  ),
  dropper: (
    <path d="M222,67.34a33.81,33.81,0,0,0-10.64-24.25C198.12,30.56,176.68,31,163.54,44.18L142.82,65l-.63-.63a22,22,0,0,0-31.11,0l-9,9a14,14,0,0,0,0,19.81l3.47,3.47L53.14,149.1a37.81,37.81,0,0,0-9.84,36.73l-8.31,19a11.68,11.68,0,0,0,2.46,13A13.91,13.91,0,0,0,47.32,222,14.15,14.15,0,0,0,53,220.82L71,212.92a37.92,37.92,0,0,0,35.84-10.07l52.44-52.46,3.47,3.48a14,14,0,0,0,19.8,0l9-9a22.06,22.06,0,0,0,0-31.13l-.66-.65L212,91.85A33.76,33.76,0,0,0,222,67.34Zm-123.61,127a26,26,0,0,1-26,6.47,6,6,0,0,0-4.17.24l-20,8.75a2,2,0,0,1-2.09-.31l9.12-20.9a5.94,5.94,0,0,0,.19-4.31A25.91,25.91,0,0,1,56,166h70.78ZM138.78,154H65.24l48.83-48.84,36.76,36.78Zm64.77-70.59L178.17,108.9a6,6,0,0,0,0,8.47l4.88,4.89a10,10,0,0,1,0,14.15l-9,9a2,2,0,0,1-2.82,0l-60.69-60.7a2,2,0,0,1,0-2.83l9-9a10,10,0,0,1,14.14,0l4.89,4.89a6,6,0,0,0,4.24,1.75h0a6,6,0,0,0,4.25-1.77L172,52.66c8.57-8.58,22.51-9,31.07-.85a22,22,0,0,1,.44,31.57Z" />
  ),
};

const CARD_DEFAULTS = [
  {
    label: "Layout",
    icon: "layout",
    pixelColors: ["#f8fafc", "#f1f5f9", "#cbd5e1"],
    pixelGap: 5,
    pixelSpeed: 35,
  },
  {
    label: "Code",
    icon: "code",
    activeColor: "#e0f2fe",
    pixelColors: ["#e0f2fe", "#7dd3fc", "#0ea5e9"],
    pixelGap: 10,
    pixelSpeed: 25,
  },
  {
    label: "Command",
    icon: "command",
    activeColor: "#fef08a",
    pixelColors: ["#fef08a", "#fde047", "#eab308"],
    pixelGap: 3,
    pixelSpeed: 20,
  },
  {
    label: "Dropper",
    icon: "dropper",
    activeColor: "#fecdd3",
    pixelColors: ["#fecdd3", "#fda4af", "#e11d48"],
    pixelGap: 6,
    pixelSpeed: 80,
    noFocus: true,
  },
];

function PixelCanvas({ colors, gap, speed, noFocus, parentRef }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const pixelsRef = useRef([]);
  const prevTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = parentRef.current;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    const timeInterval = 1000 / 60;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const clampedGap = Math.min(50, Math.max(4, gap));
    const clampedSpeed = reducedMotion
      ? 0
      : Math.min(100, Math.max(0, speed)) * 0.001;

    class Pixel {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = (Math.random() * 0.8 + 0.1) * clampedSpeed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInt = 2;
        this.maxSize =
          Math.random() * (this.maxSizeInt - this.minSize) + this.minSize;
        this.delay = reducedMotion
          ? 0
          : Math.sqrt(
              Math.pow(x - canvas.width / 2, 2) +
                Math.pow(y - canvas.height / 2, 2),
            );
        this.counter = 0;
        this.counterStep =
          Math.random() * 4 + (canvas.width + canvas.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
      }

      draw() {
        const off = this.maxSizeInt * 0.5 - this.size * 0.5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + off, this.y + off, this.size, this.size);
      }

      shimmer() {
        if (this.size >= this.maxSize) this.isReverse = true;
        if (this.size <= this.minSize) this.isReverse = false;
        this.isReverse ? (this.size -= this.speed) : (this.size += this.speed);
      }

      appear() {
        this.isIdle = false;
        if (this.counter <= this.delay) {
          this.counter += this.counterStep;
          return;
        }
        if (this.size >= this.maxSize) this.isShimmer = true;
        this.isShimmer ? this.shimmer() : (this.size += this.sizeStep);
        this.draw();
      }

      disappear() {
        this.isShimmer = false;
        this.counter = 0;
        if (this.size <= 0) {
          this.isIdle = true;
          return;
        }
        this.size -= 0.1;
        this.draw();
      }
    }

    const initCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      pixelsRef.current = [];
      for (let x = 0; x < canvas.width; x += clampedGap) {
        for (let y = 0; y < canvas.height; y += clampedGap) {
          pixelsRef.current.push(new Pixel(x, y));
        }
      }
    };

    const animate = (fnName) => {
      animRef.current = requestAnimationFrame(() => animate(fnName));
      const now = performance.now();
      const elapsed = now - prevTimeRef.current;
      if (elapsed < timeInterval) return;
      prevTimeRef.current = now - (elapsed % timeInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pixelsRef.current) p[fnName]();
      if (pixelsRef.current.every((p) => p.isIdle))
        cancelAnimationFrame(animRef.current);
    };

    const handleAnimation = (name) => {
      cancelAnimationFrame(animRef.current);
      animate(name);
    };

    const onEnter = () => handleAnimation("appear");
    const onLeave = () => handleAnimation("disappear");
    const onFocusIn = (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) handleAnimation("appear");
    };
    const onFocusOut = (e) => {
      if (!e.currentTarget.contains(e.relatedTarget))
        handleAnimation("disappear");
    };

    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);
    if (!noFocus) {
      parent.addEventListener("focusin", onFocusIn);
      parent.addEventListener("focusout", onFocusOut);
    }

    const ro = new ResizeObserver(initCanvas);
    ro.observe(parent);

    initCanvas();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
      if (!noFocus) {
        parent.removeEventListener("focusin", onFocusIn);
        parent.removeEventListener("focusout", onFocusOut);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

function Card({
  label,
  icon,
  activeColor,
  pixelColors,
  pixelGap,
  pixelSpeed,
  noFocus,
}) {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="pc-card group relative overflow-hidden grid place-items-center aspect-[4/5] border border-[#27272a] isolate select-none cursor-pointer transition-[border-color] duration-[800ms] focus-within:outline focus-within:outline-[5px] focus-within:outline-[Highlight]"
      style={activeColor ? { "--active-color": activeColor } : undefined}
      tabIndex={-1}
    >
      <PixelCanvas
        colors={pixelColors}
        gap={pixelGap}
        speed={pixelSpeed}
        noFocus={noFocus}
        parentRef={cardRef}
      />

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-[900ms] group-hover:opacity-0"
        style={{
          background:
            "radial-gradient(circle at bottom left, transparent 55%, #101012)",
          boxShadow: "#09090b -0.5cqi 0.5cqi 2.5cqi inset",
        }}
      />

      <div
        className="absolute inset-0 m-auto aspect-square pointer-events-none opacity-0 transition-opacity duration-[800ms] group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle, #09090b, transparent 65%)",
        }}
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        viewBox="0 0 256 256"
        className="relative z-10 w-[30%] h-auto transition-[color,scale] duration-300 group-hover:scale-110"
        style={{ color: "var(--active-color, #52525b)" }}
      >
        {ICONS[icon] ?? ICONS.layout}
      </svg>

      <button className="opacity-0 absolute" tabIndex={0} aria-label={label}>
        {label}
      </button>
    </div>
  );
}

export default function PixelCanvasCardGrid({
  bgColor = "#09090b",
  cards = CARD_DEFAULTS,
  className = "",
}) {
  return (
    <div
      className={`w-full h-screen flex items-center justify-center p-4 ${className}`}
      style={{ background: bgColor, color: "#e3e3e3" }}
    >
      <style>{`
        .pc-card:where(:hover, :focus-within) {
          border-color: var(--active-color, #e3e3e3);
          transition: border-color 800ms cubic-bezier(0.45,0,0.55,1);
        }
        .pc-card:where(:hover, :focus-within) svg {
          transition: color 300ms cubic-bezier(0.45,0,0.55,1), scale 300ms cubic-bezier(0.45,0,0.55,1);
        }
      `}</style>

      <div className="w-full max-w-[20rem] grid grid-cols-2 gap-4 sm:max-w-[30rem] lg:max-w-[60rem] lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i} {...card} />
        ))}
      </div>
    </div>
  );
}
