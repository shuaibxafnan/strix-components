"use client";

import { useEffect, useRef, useState } from "react";

// ─── BlobCarousel ─────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// images               string[]     Array of image URLs to cycle through
// size                 number       800       SVG/carousel square size (px)
// bgFill               string       "#0d0d0f" Page background color
// blobBgFill           string       "#1a1a2e" Background blob fill color
// blobBgStroke         string       "#2a2a4a" Background blob stroke color
// blobBgStrokeWidth    number       1.5       Background blob stroke width
// segments             number       9         Blob smoothness (point count)
// minRadius            number       290       Blob minimum morph radius
// maxRadius            number       380       Blob maximum morph radius
// minDuration          number       1         Min animation duration per point
// maxDuration          number       3         Max animation duration per point
// btnLabel             string       "Next"    Label inside the click button
// btnBg                string       "#c084fc" Button background color
// btnShadowColor       string       "#c084fc" Button glow shadow color
// btnTextColor         string       "#0d0d0f" Button text color
// btnSize              number       110       Button diameter (px)
// counterColor         string       "#c084fc" Slide counter text color
// ease                 string       "cubic-bezier(0.29,0.57,0.12,0.99)"
// duration             string       "0.65s"   Image crossfade duration
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1595857819837-1c820f33e62d?auto=format&fit=crop&w=1534&q=80",
  "https://images.unsplash.com/photo-1595719078597-f8ba9cc6ae72?auto=format&fit=crop&w=1533&q=80",
  "https://images.unsplash.com/photo-1462804993656-fac4ff489837?auto=format&fit=crop&w=3150&q=80",
];

// ─── SupahBlob ────────────────────────────────────────────────────────────────
// Vanilla JS class, same as original — we just call it inside useEffect.

class SupahBlob {
  constructor(obj) {
    if (!obj.el) return;
    this.el = obj.el;
    this.segments = obj.segments || 8;
    this.centerX = obj.centerX || 400;
    this.centerY = obj.centerY || 400;
    this.minRadius = obj.minRadius || 300;
    this.maxRadius = obj.maxRadius || 380;
    this.minDuration = obj.minDuration || 1;
    this.maxDuration = obj.maxDuration || 2;
    this.maskEl = obj.maskEl || null;
    this.maskID = obj.maskID || null;
    this.init();
  }

  init() {
    this.points = [];
    const slice = (Math.PI * 2) / this.segments;
    const tl = new window.gsap.timeline({ onUpdate: () => this.update() });

    for (let i = 0; i < this.segments; i++) {
      const angle = slice * i;
      const duration = window.gsap.utils.random(
        this.minDuration,
        this.maxDuration,
      );
      const p = {
        x: this.centerX + Math.cos(angle) * this.minRadius,
        y: this.centerY + Math.sin(angle) * this.minRadius,
      };
      const tween = window.gsap.to(p, {
        duration,
        x: this.centerX + Math.cos(angle) * this.maxRadius,
        y: this.centerY + Math.sin(angle) * this.maxRadius,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      tl.add(tween, -duration);
      this.points.push(p);
    }
  }

  update() {
    this.el.setAttribute("d", this.createPath());
    if (this.maskEl) {
      this.maskEl.style.clipPath = "none";
      this.maskEl.style.webkitClipPath = "none";
      void this.maskEl.offsetWidth;
      this.maskEl.style.clipPath = `url("${this.maskID}")`;
      this.maskEl.style.webkitClipPath = `url("${this.maskID}")`;
    }
  }

  createPath() {
    const data = this.points;
    const size = data.length;
    let path = `M${data[0].x} ${data[0].y} C`;
    for (let i = 0; i < size; i++) {
      const p0 = data[(i - 1 + size) % size];
      const p1 = data[i];
      const p2 = data[(i + 1) % size];
      const p3 = data[(i + 2) % size];
      const x1 = p1.x + (p2.x - p0.x) * 0.15;
      const y1 = p1.y + (p2.y - p0.y) * 0.15;
      const x2 = p2.x - (p3.x - p1.x) * 0.15;
      const y2 = p2.y - (p3.y - p1.y) * 0.15;
      path += ` ${x1} ${y1} ${x2} ${y2} ${p2.x} ${p2.y}`;
    }
    return `${path}z`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlobCarousel({
  images = DEFAULT_IMAGES,
  size = 800,
  bgFill = "#0d0d0f",
  blobBgFill = "#1a1a2e",
  blobBgStroke = "#2a2a4a",
  blobBgStrokeWidth = 1.5,
  segments = 9,
  minRadius = 290,
  maxRadius = 380,
  minDuration = 1,
  maxDuration = 3,
  btnLabel = "Next",
  btnBg = "#c084fc",
  btnShadowColor = "#c084fc",
  btnTextColor = "#0d0d0f",
  btnSize = 110,
  counterColor = "#c084fc",
  ease = "cubic-bezier(0.29,0.57,0.12,0.99)",
  duration = "0.65s",
}) {
  const [active, setActive] = useState(0);
  const [prevActive, setPrevActive] = useState(null);

  const path1Ref = useRef(null); // mask path
  const path2Ref = useRef(null); // bg blob path
  const imagesRef = useRef(null);
  const maskId = useRef(`blob-mask-${Math.random().toString(36).slice(2, 8)}`);

  // Load GSAP and boot blobs
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[data-blob-src="${src}"]`)) {
          res();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.setAttribute("data-blob-src", src);
        s.onload = res;
        s.onerror = () => rej(new Error(`Failed: ${src}`));
        document.head.appendChild(s);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        if (!window.gsap || !path1Ref.current || !path2Ref.current) return;
        window.gsap.config({ trialWarn: false });

        new SupahBlob({
          el: path1Ref.current,
          segments,
          centerX: 400,
          centerY: 400,
          minRadius,
          maxRadius,
          minDuration,
          maxDuration,
          maskEl: imagesRef.current,
          maskID: `#${maskId.current}`,
        });

        new SupahBlob({
          el: path2Ref.current,
          segments,
          centerX: 400,
          centerY: 400,
          minRadius: minRadius + 20,
          maxRadius: maxRadius + 20,
          minDuration: minDuration + 1,
          maxDuration: maxDuration,
        });
      })
      .catch(console.error);
  }, [segments, minRadius, maxRadius, minDuration, maxDuration]);

  const handleNext = () => {
    setPrevActive(active);
    setActive((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const scaledSize = size;

  return (
    <div
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden"
      style={{ background: bgFill }}
    >
      {/* Ambient page glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${blobBgStroke}44 0%, transparent 70%)`,
        }}
      />

      {/* Grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]"
        aria-hidden="true"
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Carousel */}
      <div
        className="relative"
        style={{
          width: scaledSize,
          height: scaledSize,
          maxWidth: "min(800px, 90vw)",
          aspectRatio: "1",
        }}
      >
        {/* SVG: background blob + clip mask */}
        <svg
          viewBox="0 0 800 800"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <clipPath id={maskId.current}>
              <path ref={path1Ref} />
            </clipPath>
          </defs>
          {/* Background blob shape */}
          <path
            ref={path2Ref}
            fill={blobBgFill}
            stroke={blobBgStroke}
            strokeWidth={blobBgStrokeWidth}
          />
        </svg>

        {/* Images */}
        <div
          ref={imagesRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            zIndex: 2,
            clipPath: `url("#${maskId.current}")`,
            WebkitClipPath: `url("#${maskId.current}")`,
          }}
        >
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transition: `opacity ${duration} ${ease}, transform ${duration} ${ease}`,
                opacity: i === active ? 1 : 0,
                transform:
                  i === active
                    ? "scale(1) translateZ(0)"
                    : "scale(0.92) translateZ(0)",
                zIndex: i === active ? 2 : 1,
              }}
            />
          ))}

          {/* Inner vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>

        {/* Slide counter — top right */}
        <div
          className="absolute flex items-baseline gap-1 font-mono select-none"
          style={{
            zIndex: 10,
            top: "9%",
            right: "9%",
            color: counterColor,
          }}
        >
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1 }}
          >
            {String(active + 1).padStart(2, "0")}
          </span>
          <span
            className="font-normal tabular-nums"
            style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)", opacity: 0.45 }}
          >
            / {String(images.length).padStart(2, "0")}
          </span>
        </div>

        {/* Pip indicators — bottom center */}
        <div
          className="absolute flex gap-2 items-center"
          style={{
            zIndex: 10,
            bottom: "8%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActive(i)}
              className="rounded-full transition-all"
              style={{
                width: i === active ? "20px" : "6px",
                height: "6px",
                background: i === active ? counterColor : `${counterColor}44`,
                border: "none",
                cursor: "pointer",
                transition: `width 0.35s ${ease}, background 0.3s ease`,
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Next button — bottom left */}
        <button
          aria-label="Next slide"
          onClick={handleNext}
          className="absolute flex items-center justify-center rounded-full select-none cursor-pointer overflow-hidden group"
          style={{
            zIndex: 10,
            bottom: "9%",
            left: "9%",
            width: btnSize,
            height: btnSize,
            background: btnBg,
            boxShadow: `0 12px 32px -6px ${btnShadowColor}88, 0 0 0 1px ${btnShadowColor}22`,
            color: btnTextColor,
            transform: "rotate(-18deg)",
            transition: `transform 0.22s ${ease}, box-shadow 0.22s ease`,
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(-18deg) scale(1.06)";
            e.currentTarget.style.boxShadow = `0 18px 40px -6px ${btnShadowColor}99, 0 0 0 1px ${btnShadowColor}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(-18deg) scale(1)";
            e.currentTarget.style.boxShadow = `0 12px 32px -6px ${btnShadowColor}88, 0 0 0 1px ${btnShadowColor}22`;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "rotate(-5deg) scale(0.91)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "rotate(-18deg) scale(1)";
          }}
        >
          {/* Inset ring — shrinks on hover */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none group-hover:scale-100"
            style={{
              boxShadow: `inset 0 0 0 10px rgba(255,255,255,0.18)`,
              transform: "scale(1.2)",
              transition: `transform 0.4s ${ease}`,
            }}
          />
          <span
            className="relative z-10 font-bold tracking-widest uppercase"
            style={{ fontSize: "0.6rem", letterSpacing: "0.16em" }}
          >
            {btnLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
