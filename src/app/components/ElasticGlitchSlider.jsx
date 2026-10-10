"use client";

import { useEffect, useRef, useState } from "react";

// ─── ElasticColorSlider ──────────────────────────────────────────────────────
//
// Props Explanation
// ──────────────────────────────────────────────────────────────────────────
// steps             number    6         Total selectable structural intervals
// initialStep       number    3         The baseline step chosen on initial mount
// width             string    600px     Max width of the entire tracking bar container
// trackHeight       string    4px       Thickness of the dark slider tracking track line
// bubbleSize        string    48px      The structural height/width of the color lens components
// yellowColor       string    #ffff00   Hex/CSS value matching the Subtractive Yellow channel
// magentaColor      string    #ff00ff   Hex/CSS value matching the Subtractive Magenta channel
// cyanColor         string    #00ffff   Hex/CSS value matching the Subtractive Cyan channel
// trackBg           string    #040404   Color style for the structural completion bars
// pageBg            string    #FBFBFB   Root backdrop layout container fill background
// onChange          function  null      Optional callback handling state changes: (stepIndex) => {}
// ──────────────────────────────────────────────────────────────────────────

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
  pageBg = "#FBFBFB",
  onChange = null,
}) {
  const totalRef = useRef(null);
  const yellowRef = useRef(null);
  const magentaRef = useRef(null);
  const cyanRef = useRef(null);
  const previousRef = useRef(null);
  const nextRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const isDownRef = useRef(false);

  // Eliminate server-side hydration mismatches completely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Helper method to resolve dynamic external animation script libraries
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
        el.onerror = () =>
          reject(new Error(`Failed to load dependency script: ${src}`));
        document.head.appendChild(el);
      });

    // Request legacy animation layers or matching global fallbacks cleanly
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const gsap = window.gsap;
        if (!gsap) return;

        // Custom function to compute dynamic positional calculations on the bar
        const changeStep = (xFactor) => {
          const totalWidth = totalRef.current.offsetWidth;
          let calculatedX = xFactor * (totalWidth / (steps + 1));

          // Clamp values safely
          calculatedX = Math.max(0, Math.min(calculatedX, totalWidth));

          // Animate the three subtractive CMY color dots with staggered elastic delay matrices
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

          // Animate left trailing track bar
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

          // Animate right trailing track bar
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

          // Trigger optional component hooks safely
          if (onChange) {
            onChange(Math.round(xFactor));
          }
        };

        // Execution logic for tracking explicit client position coordinates
        const processCoordinates = (e) => {
          const rect = totalRef.current.getBoundingClientRect();
          const targetX = e.clientX - rect.left;
          const factorX =
            targetX / (totalRef.current.offsetWidth / (steps + 1));
          changeStep(factorX);
        };

        // Event handler registrations
        const handleContainerClick = (e) => {
          processCoordinates(e);
        };

        const handleMouseDown = () => {
          isDownRef.current = true;
        };

        const handleMouseMove = (e) => {
          if (isDownRef.current) {
            processCoordinates(e);
          }
        };

        const handleMouseUp = () => {
          isDownRef.current = false;
        };

        // Programmatic micro-stagger timeline demonstration out of the box
        changeStep(initialStep);
        const timer1 = setTimeout(() => changeStep(5), 1500);
        const timer2 = setTimeout(() => changeStep(1), 2500);

        const trackBar = totalRef.current;
        trackBar.addEventListener("click", handleContainerClick);
        trackBar.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          trackBar.removeEventListener("click", handleContainerClick);
          trackBar.removeEventListener("mousedown", handleMouseDown);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };
      })
      .catch((err) =>
        console.error("[ElasticColorSlider] Load breakdown:", err),
      );
  }, [isMounted, steps, initialStep, onChange]);

  if (!isMounted) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: pageBg }} />
    );
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: pageBg }}
    >
      <div
        id="container"
        className="m-auto flex items-center justify-center"
        style={{ width: width }}
      >
        <div
          ref={totalRef}
          className="w-full relative cursor-pointer py-2 px-1 flex items-center"
          style={{ height: bubbleSize }}
        >
          {/* Previous/Left Active Track Line Segment */}
          <div
            ref={previousRef}
            className="absolute left-0 rounded-2xl pointer-events-none origin-left"
            style={{
              backgroundColor: trackBg,
              height: trackHeight,
              top: `calc(50% - ${trackHeight} / 2)`,
            }}
          />

          {/* Core Interactive Color Blending Stack Layer */}
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

          {/* Next/Right Active Track Line Segment */}
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
