"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_MAP =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Castle_of_Doom_(Eamon).png?width=2000";

export default function DungeonReveal({
  mapSrc = DEFAULT_MAP,
  mapAlt = "Dungeon map",
  radiusLabel = "radius",
  minRadius = 40,
  maxRadius = 300,
  initialRadius = 110,
  torchColor = "#f9aa47",
  bgColor = "#111111",
  className = "",
}) {
  const overlayRef = useRef(null);
  const cursorRef = useRef(null);
  const radiusRef = useRef(initialRadius);
  const flickerTimeRef = useRef(0);
  const rafRef = useRef(null);
  const [radius, setRadius] = useState(initialRadius);

  function setPos(clientX, clientY) {
    const overlay = overlayRef.current;
    const cursor = cursorRef.current;
    if (!overlay || !cursor) return;
    const rect = overlay.getBoundingClientRect();
    overlay.style.setProperty("--x", clientX - rect.left + "px");
    overlay.style.setProperty("--y", clientY - rect.top + "px");
    cursor.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
  }

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.style.setProperty("--r", radiusRef.current + "px");
    setPos(window.innerWidth / 2, window.innerHeight / 2);

    const onMouseMove = (e) => setPos(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches?.[0]) setPos(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    };

    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      overlay.removeEventListener("mousemove", onMouseMove);
      overlay.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    function animateFlicker() {
      flickerTimeRef.current += 0.05;
      const offset = Math.sin(flickerTimeRef.current * 3) * 3;
      overlayRef.current?.style.setProperty(
        "--r",
        radiusRef.current + offset + "px",
      );
      rafRef.current = requestAnimationFrame(animateFlicker);
    }
    rafRef.current = requestAnimationFrame(animateFlicker);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function handleRadiusChange(e) {
    const val = Number(e.target.value);
    setRadius(val);
    radiusRef.current = val;
  }

  return (
    <div
      className={`relative h-screen w-full cursor-none overflow-hidden bg-[var(--bg)] font-sans ${className}`}
      style={{ "--bg": bgColor }}
    >
      <img
        src={mapSrc}
        alt={mapAlt}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />

      <div
        ref={overlayRef}
        className="pointer-events-auto absolute inset-0 bg-black [-webkit-mask-image:radial-gradient(circle_var(--r,110px)_at_var(--x,50%)_var(--y,50%),transparent_0%,transparent_60%,black_100%)] [mask-image:radial-gradient(circle_var(--r,110px)_at_var(--x,50%)_var(--y,50%),transparent_0%,transparent_60%,black_100%)]"
      />

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[999]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
        >
          <path
            fill={torchColor}
            d="M6 20h12q.425 0 .713-.288T19 19H5q0 .425.288.713T6 20m6-12q-1.2 0-2-.837t-.75-2.038q.05-1.3.913-2.287T12 1q.975.85 1.838 1.838t.912 2.287q.05 1.2-.75 2.038T12 8m-1 9h2v-6h-2zm1-11q.325 0 .538-.225t.212-.55q0-.425-.238-.775T12 3.775q-.275.325-.513.675t-.237.775q0 .325.213.55T12 6m8.25 11q.325 0 .538-.213T21 16.25t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212M18 22H6q-1.25 0-2.125-.875T3 19v-2h6V9h6v8h2.6q-.05-.2-.075-.375t-.025-.375q0-1.15.8-1.95t1.95-.8t1.95.8t.8 1.95q0 .95-.562 1.675T21 18.9v.1q0 1.25-.875 2.125T18 22m-7-5h2zm1-12.1"
          />
        </svg>
      </div>

      <div className="absolute right-3 top-3 z-40 rounded-lg bg-white/[0.06] px-[10px] py-2 text-[13px] text-[#eee] backdrop-blur-[4px]">
        <label className="flex items-center gap-1.5">
          <input
            type="range"
            min={minRadius}
            max={maxRadius}
            value={radius}
            onChange={handleRadiusChange}
            className="align-middle"
          />
          {radiusLabel}
        </label>
      </div>
    </div>
  );
}