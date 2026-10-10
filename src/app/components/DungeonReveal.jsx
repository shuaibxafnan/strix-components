"use client";

import { useEffect, useRef, useState } from "react";

export default function DungeonReveal() {
  const overlayRef = useRef(null);
  const cursorRef = useRef(null);
  const radiusRef = useRef(110);
  const flickerTimeRef = useRef(0);
  const rafRef = useRef(null);
  const [radius, setRadius] = useState(110);

  function setPos(clientX, clientY) {
    const overlay = overlayRef.current;
    const cursor = cursorRef.current;
    if (!overlay || !cursor) return;
    const rect = overlay.getBoundingClientRect();
    overlay.style.setProperty("--x", clientX - rect.left + "px");
    overlay.style.setProperty("--y", clientY - rect.top + "px");
    cursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
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
    // cursor:none has no Tailwind utility — kept inline
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#111]"
      style={{
        cursor: "none",
        fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <style>{`
        #overlay {
          -webkit-mask-image: radial-gradient(
            circle var(--r, 110px) at var(--x, 50%) var(--y, 50%),
            transparent 0%, transparent 60%, black 100%
          );
          mask-image: radial-gradient(
            circle var(--r, 110px) at var(--x, 50%) var(--y, 50%),
            transparent 0%, transparent 60%, black 100%
          );
          transition: -webkit-mask-position 0.06s linear;
          transition: mask-position 0.06s linear;
        }
        #controls input[type="range"] { vertical-align: middle; }
      `}</style>

      {/* Dungeon iframe */}
      <iframe
        id="dungeon"
        src="https://watabou.github.io/one-page-dungeon/?seed=1022591351"
        className="absolute inset-0 w-full h-full border-0"
      />

      {/* Mask overlay — bg must be inline (opaque black, not a Tailwind opacity class) */}
      <div
        id="overlay"
        ref={overlayRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ background: "rgba(0,0,0,1)" }}
      />

      {/* Custom torch cursor — initial transform kept inline; JS overwrites it each frame */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
        >
          <path
            fill="#f9aa47"
            d="M6 20h12q.425 0 .713-.288T19 19H5q0 .425.288.713T6 20m6-12q-1.2 0-2-.837t-.75-2.038q.05-1.3.913-2.287T12 1q.975.85 1.838 1.838t.912 2.287q.05 1.2-.75 2.038T12 8m-1 9h2v-6h-2zm1-11q.325 0 .538-.225t.212-.55q0-.425-.238-.775T12 3.775q-.275.325-.513.675t-.237.775q0 .325.213.55T12 6m8.25 11q.325 0 .538-.213T21 16.25t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212M18 22H6q-1.25 0-2.125-.875T3 19v-2h6V9h6v8h2.6q-.05-.2-.075-.375t-.025-.375q0-1.15.8-1.95t1.95-.8t1.95.8t.8 1.95q0 .95-.562 1.675T21 18.9v.1q0 1.25-.875 2.125T18 22m-7-5h2zm1-12.1"
          />
        </svg>
      </div>

      {/* Radius controls */}
      <div
        id="controls"
        className="absolute z-40 top-3 right-3 text-[#eee] text-[13px] px-[10px] py-2 rounded-lg backdrop-blur-[4px] bg-white/[0.06]"
      >
        <label className="flex items-center gap-1.5">
          <input
            type="range"
            min={40}
            max={300}
            value={radius}
            onChange={handleRadiusChange}
            className="align-middle"
          />
          radius
        </label>
      </div>
    </div>
  );
}
