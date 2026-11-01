"use client";

import { useEffect, useRef } from "react";

export default function ElasticGlitchSlider({
  steps = 6,
  initialStep = 3,
  width = "600px",
  trackHeight = "4px",
  bubbleSize = "48px",
  yellowColor = "#ffff00",
  magentaColor = "#ff00ff",
  cyanColor = "#00ffff",
  trackBg = "#040404",
  onChange = null,
  className = "",
}) {
  const totalRef = useRef(null);
  const yellowRef = useRef(null);
  const magentaRef = useRef(null);
  const cyanRef = useRef(null);
  const previousRef = useRef(null);
  const nextRef = useRef(null);
  const isDownRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap || mod.default;
      const trackBar = totalRef.current;
      if (!gsap || !trackBar) return;

      const targets = [
        yellowRef.current,
        magentaRef.current,
        cyanRef.current,
        previousRef.current,
        nextRef.current,
      ];

      const changeStep = (xFactor) => {
        const totalWidth = trackBar.offsetWidth;
        let calculatedX = xFactor * (totalWidth / (steps + 1));

        calculatedX = Math.max(0, Math.min(calculatedX, totalWidth));

        gsap.to(yellowRef.current, {
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          x: calculatedX - 16,
        });

        gsap.to(magentaRef.current, {
          duration: 0.75,
          ease: "elastic.out(1, 0.5)",
          x: calculatedX - 16,
        });

        gsap.to(cyanRef.current, {
          duration: 0.9,
          ease: "elastic.out(1, 0.5)",
          x: calculatedX - 16,
        });

        if (calculatedX - 32 < 0.1) {
          gsap.to(previousRef.current, {
            duration: 0.12,
            ease: "power4.out",
            width: Math.max(calculatedX - 32, 0) + "px",
          });
        } else {
          gsap.to(previousRef.current, {
            duration: 0.75,
            ease: "elastic.out(1, 0.5)",
            width: Math.max(calculatedX - 32, 0) + "px",
          });
        }

        if (totalWidth - calculatedX - 24 < 0) {
          gsap.to(nextRef.current, {
            duration: 0.12,
            ease: "power4.out",
            width: Math.max(totalWidth - calculatedX - 52, 0) + "px",
          });
        } else {
          gsap.to(nextRef.current, {
            duration: 0.75,
            ease: "elastic.out(1, 0.5)",
            width: Math.max(totalWidth - calculatedX - 52, 0) + "px",
          });
        }

        if (onChangeRef.current) {
          onChangeRef.current(Math.round(xFactor));
        }
      };

      const processCoordinates = (e) => {
        const rect = trackBar.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const factorX = targetX / (trackBar.offsetWidth / (steps + 1));
        changeStep(factorX);
      };

      const handleContainerClick = (e) => {
        processCoordinates(e);
      };

      const handlePointerDown = () => {
        isDownRef.current = true;
      };

      const handlePointerMove = (e) => {
        if (isDownRef.current) {
          processCoordinates(e);
        }
      };

      const handlePointerUp = () => {
        isDownRef.current = false;
      };

      changeStep(initialStep);
      const timer1 = setTimeout(() => changeStep(5), 1500);
      const timer2 = setTimeout(() => changeStep(1), 2500);

      trackBar.addEventListener("click", handleContainerClick);
      trackBar.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);

      cleanup = () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        trackBar.removeEventListener("click", handleContainerClick);
        trackBar.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
        gsap.killTweensOf(targets);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [steps, initialStep]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      <div
        className="m-auto flex items-center justify-center max-w-full px-4"
        style={{ width: width }}
      >
        <div
          ref={totalRef}
          className="w-full relative cursor-pointer py-2 px-1 flex items-center touch-none"
          style={{ height: bubbleSize }}
        >
          <div
            ref={previousRef}
            className="absolute left-0 rounded-2xl pointer-events-none origin-left"
            style={{
              backgroundColor: trackBg,
              height: trackHeight,
              top: `calc(50% - ${trackHeight} / 2)`,
            }}
          />

          <div
            className="relative pointer-events-none"
            style={{ width: bubbleSize, height: bubbleSize }}
          >
            <div
              ref={yellowRef}
              className="absolute inset-0 rounded-full mix-blend-multiply will-change-transform"
              style={{ backgroundColor: yellowColor }}
            />
            <div
              ref={magentaRef}
              className="absolute inset-0 rounded-full mix-blend-multiply will-change-transform"
              style={{ backgroundColor: magentaColor }}
            />
            <div
              ref={cyanRef}
              className="absolute inset-0 rounded-full mix-blend-multiply will-change-transform"
              style={{ backgroundColor: cyanColor }}
            />
          </div>

          <div
            ref={nextRef}
            className="absolute right-0 rounded-2xl pointer-events-none origin-right"
            style={{
              backgroundColor: trackBg,
              height: trackHeight,
              top: `calc(50% - ${trackHeight} / 2)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
