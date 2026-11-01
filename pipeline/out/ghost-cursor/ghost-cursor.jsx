"use client";

import { useEffect, useRef } from "react";

export default function GhostCursor({
  bgColor = "#161616",
  ghostColor = "#ffffff",
  ghostSize = 90,
  followSpeed = 10,
  skewStrength = 50,
  stretchStrength = 2.0,
  eyeSquishMin = 0.1,
  ripCount = 5,
  ripDuration = "1.2s",
  ripSpacing = 31,
  className = "",
}) {
  const ghostRef = useRef(null);
  const mouthRef = useRef(null);
  const eyesRef = useRef(null);

  useEffect(() => {
    if (!ghostRef.current) return;

    let mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    let clicked = false;

    const getMouse = (e) => {
      mouse = {
        x:
          e.clientX ||
          e.pageX ||
          (e.touches && e.touches[0]?.pageX) ||
          window.innerWidth / 2,
        y:
          e.clientY ||
          e.pageY ||
          (e.touches && e.touches[0]?.pageY) ||
          window.innerHeight / 2,
      };
    };

    ["mousemove", "touchstart", "touchmove"].forEach((ev) =>
      window.addEventListener(ev, getMouse),
    );
    const onDown = (e) => {
      e.preventDefault();
      clicked = true;
    };
    const onUp = () => {
      clicked = false;
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    const map = (num, inMin, inMax, outMin, outMax) =>
      ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

    const pos = { x: mouse.x, y: mouse.y };

    let rafId;

    const follow = () => {
      const distX = mouse.x - pos.x;
      const distY = mouse.y - pos.y;

      const velX = distX / 8;
      const velY = distY / 8;

      pos.x += distX / followSpeed;
      pos.y += distY / followSpeed;

      const skewX = map(velX, 0, 100, 0, -skewStrength);
      const scaleY = map(velY, 0, 100, 1, stretchStrength);
      const scaleEyeX = map(Math.abs(velX), 0, 100, 1, 1.2);
      let scaleEyeY = map(Math.abs(velX * 2), 0, 100, 1, eyeSquishMin);
      let scaleMouth = Math.min(
        Math.max(
          map(Math.abs(velX * 1.5), 0, 100, 0, 10),
          map(Math.abs(velY * 1.2), 0, 100, 0, 5),
        ),
        2,
      );

      if (clicked) {
        scaleEyeY = 0.4;
        scaleMouth = -scaleMouth;
      }

      ghostRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(0.7) skew(${skewX}deg) rotate(${-skewX}deg) scaleY(${scaleY})`;
      eyesRef.current.style.transform = `translateX(-50%) scale(${scaleEyeX}, ${scaleEyeY})`;
      mouthRef.current.style.transform = `translate(${-skewX * 0.5 - 10}px) scale(${scaleMouth})`;

      rafId = requestAnimationFrame(follow);
    };

    rafId = requestAnimationFrame(follow);

    return () => {
      cancelAnimationFrame(rafId);
      ["mousemove", "touchstart", "touchmove"].forEach((ev) =>
        window.removeEventListener(ev, getMouse),
      );
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [followSpeed, skewStrength, stretchStrength, eyeSquishMin]);

  const ripShadow = Array.from(
    { length: ripCount - 1 },
    (_, i) => `${-(ripCount - 1 - i) * ripSpacing}px 0 0 ${ghostColor}`,
  )
    .concat(
      Array.from(
        { length: ripCount - 1 },
        (_, i) => `${(i + 1) * ripSpacing}px 0 0 ${ghostColor}`,
      ),
    )
    .join(", ");

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        className="absolute w-0 h-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="ghost-goo-filter">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="ghost-blur"
            />
            <feColorMatrix
              in="ghost-blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7"
              result="ghost-gooey"
            />
          </filter>
        </defs>
      </svg>

      <div
        className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <div
          ref={ghostRef}
          className="absolute z-[1]"
          style={{
            width: ghostSize,
            marginLeft: -(ghostSize / 2),
            marginTop: 20,
            transformOrigin: "center",
          }}
        >
          <div className="relative">
            <div
              ref={eyesRef}
              className="absolute z-[1] rounded-full"
              style={{
                width: 15,
                height: 15,
                top: 34,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: bgColor,
                marginLeft: -20,
                transformOrigin: "center",

                boxShadow: `40px 0 0 ${bgColor}`,
              }}
            />

            <div
              ref={mouthRef}
              className="absolute z-[1] overflow-hidden"
              style={{
                width: 20,
                height: 15,
                top: 60,
                left: "50%",
                transform: "scale(0)",
                borderRadius: "20px 20px 12px 12px",
                backgroundColor: bgColor,
                transformOrigin: "center bottom",
              }}
            />
          </div>

          <div
            className="absolute w-full z-[-1]"
            style={{
              top: 82,
              height: 55,
              filter: "url(#ghost-goo-filter)",
            }}
          >
            <div
              className="absolute w-full"
              style={{
                backgroundColor: ghostColor,
                bottom: 35,
                left: 0,
                height: 100,
                borderRadius: "40px 40px 5px 5px",
              }}
            />

            <div
              className="absolute rounded-full"
              style={{
                width: 15,
                height: 28,
                backgroundColor: ghostColor,
                top: 15,

                left: ripSpacing * Math.floor(ripCount / 2),
                boxShadow: ripShadow,
                animation: `ghost-rip-anim ${ripDuration} linear infinite`,
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ghost-rip-anim {
          0%   { left: ${ripSpacing * Math.floor(ripCount / 2)}px; top: 12px; }
          50%  { left: ${ripSpacing * Math.floor(ripCount / 2) + ripSpacing}px; top: 20px; }
          100% { left: ${ripSpacing * Math.floor(ripCount / 2) + ripSpacing * 2}px; top: 12px; }
        }
      `}</style>
    </>
  );
}
