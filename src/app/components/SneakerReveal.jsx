"use client";

import { useEffect, useRef, useState } from "react";

// ─── SneakerReveal ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// logoSrc      string   cloudinary URL    Brand logo image src
// logoHref     string   thecleanindustry  Logo link href
// logoAlt      string   The Clean Industry
// cleanSrc     string   cloudinary URL    Clean sneaker image
// dirtySrc     string   cloudinary URL    Dirty sneaker image
// friction     number   0.15              Lerp speed on pointer enter
// frictionOut  number   0.075             Lerp speed on pointer leave
// accentColor  string   #EA0000           Divider + accent color
// brand        string   The Clean Industry®
// tagline      string   Authentic Sneaker Care
// ──────────────────────────────────────────────────────────────────────────

export default function SneakerReveal({
  logoSrc = "https://res.cloudinary.com/losrodriguez/image/upload/v1659457503/cleanIndustry_logo_tfhwml.png",
  logoHref = "http://thecleanindustry.com/",
  logoAlt = "The Clean Industry",
  cleanSrc = "https://res.cloudinary.com/losrodriguez/image/upload/v1659457324/tci-sneaker-clean_xmvucf.png",
  dirtySrc = "https://res.cloudinary.com/losrodriguez/image/upload/v1659457324/tci-sneaker-dirty_lwxyzt.png",
  friction = 0.15,
  frictionOut = 0.075,
  accentColor = "#EA0000",
  brand = "The Clean Industry®",
  tagline = "Authentic Sneaker Care",
}) {
  const containerRef = useRef(null);
  const dirtyRef = useRef(null);
  const dividerRef = useRef(null);
  const [pctX, setPctX] = useState(50);

  const stateRef = useRef({
    x: 50,
    inOver: false,
    friction: friction,
    mouse: { x: 0, y: 0 },
    rafId: null,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.friction = friction;
    const container = containerRef.current;
    const dirty = dirtyRef.current;
    const divider = dividerRef.current;
    if (!container || !dirty) return;

    const percentX = () => {
      if (!s.inOver) return 50;
      const r = container.getBoundingClientRect();
      return Math.round(((s.mouse.x - r.left) / r.width) * 100);
    };

    const render = () => {
      s.x += (percentX() - s.x) * s.friction;
      const clamped = Math.max(0, Math.min(100, s.x));
      dirty.style.clipPath = `inset(0% ${100 - clamped}% 0% 0%)`;
      if (divider) divider.style.left = `${clamped}%`;
      setPctX(clamped);
    };

    const animate = () => {
      s.rafId = requestAnimationFrame(animate);
      render();
    };

    const onPointerEnter = () => {
      s.friction = friction;
      s.inOver = true;
    };
    const onPointerLeave = () => {
      s.friction = frictionOut;
      s.inOver = false;
    };
    const onPointerMove = (e) => {
      s.mouse = { x: e.clientX, y: e.clientY };
    };

    container.addEventListener("pointerenter", onPointerEnter, false);
    container.addEventListener("pointerleave", onPointerLeave, false);
    container.addEventListener("pointermove", onPointerMove, false);

    animate();

    return () => {
      cancelAnimationFrame(s.rafId);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointermove", onPointerMove);
    };
  }, [friction, frictionOut]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400&display=swap');
        .font-bebas  { font-family: 'Bebas Neue', sans-serif; }
        .font-dmsans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* page */}
      <main className="font-dmsans absolute inset-0 flex flex-col items-center justify-center bg-white overflow-hidden">
        {/* logo */}
        <a
          href={logoHref}
          title={logoAlt}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-[18px] top-[18px] z-30 transition-all duration-[250ms] ease-out hover:scale-105 hover:opacity-70 hover:duration-[150ms] hover:ease-in"
        >
          <img src={logoSrc} alt={logoAlt} className="w-[72px]" />
        </a>

        {/* top rule */}
        <div
          className="absolute top-0 inset-x-0 h-[3px] z-30"
          style={{ background: accentColor }}
        />

        {/* sneaker stage */}
        <div
          ref={containerRef}
          className="relative cursor-col-resize select-none w-[90vw] max-w-[560px]"
        >
          {/* Before label */}
          <div className="absolute top-3 left-4 z-30 pointer-events-none select-none">
            <span className="text-[10px] font-light tracking-[0.18em] uppercase text-[#aaa]">
              Before
            </span>
          </div>

          {/* After label */}
          <div className="absolute top-3 right-4 z-30 pointer-events-none select-none">
            <span
              className="text-[10px] font-light tracking-[0.18em] uppercase"
              style={{ color: accentColor }}
            >
              After
            </span>
          </div>

          {/* clean image (base) */}
          <img
            src={cleanSrc}
            alt="Clean sneaker"
            draggable={false}
            className="block w-full h-auto pointer-events-none select-none"
          />

          {/* dirty image (clipped) */}
          <img
            ref={dirtyRef}
            src={dirtySrc}
            alt="Dirty sneaker"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none select-none"
            style={{ clipPath: "inset(0% 50% 0% 0%)" }}
          />

          {/* divider — line + circle handle + arrow icon, all real DOM */}
          <div
            ref={dividerRef}
            className="absolute top-0 bottom-0 z-20 pointer-events-none -translate-x-1/2"
            style={{ left: "50%", width: 2, background: accentColor }}
          >
            {/* circle knob */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] flex items-center justify-center"
              style={{ border: `2px solid ${accentColor}` }}
            >
              {/* arrow icon */}
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5H13M1 5L4 2M1 5L4 8M13 5L10 2M13 5L10 8"
                  stroke={accentColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* footer */}
        <footer className="mt-6 text-center">
          <p className="font-dmsans text-[10px] font-light tracking-[0.22em] uppercase text-[#999] mb-1 pointer-events-none select-none">
            {brand}
          </p>
          <h1
            className="font-bebas text-[2.6rem] leading-none tracking-wide m-0"
            style={{ color: accentColor }}
          >
            {tagline} <sup className="text-[1.1rem] align-super">+</sup>
          </h1>
        </footer>

        {/* bottom rule */}
        <div
          className="absolute bottom-0 inset-x-0 h-[3px]"
          style={{ background: accentColor }}
        />
      </main>
    </>
  );
}
