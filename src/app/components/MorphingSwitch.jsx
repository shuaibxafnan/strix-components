"use client";

import { useEffect, useRef, useState } from "react";

// ─── MorphingSwitch ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// defaultChecked     boolean   false       Initial switch toggle state
// onChange           function  undefined   State change callback event
// colorDefault       string    #D1D6EE     Unchecked background status
// colorHover         string    #CACFE6     Hover state accentuation background
// colorActive        string    #275EFE     Checked toggle background color
// colorDot           string    #ffffff     Splat/Dot fill profile vector
// scaleDuration      number    0.15        Duration for press stretch transitions
// settleDuration     number    0.5         Duration for elastic settle recoil
// ──────────────────────────────────────────────────────────────────────────

export default function MorphingSwitch({
  defaultChecked = false,
  onChange,
  colorDefault = "#D1D6EE",
  colorHover = "#CACFE6",
  colorActive = "#275EFE",
  colorDot = "#ffffff",
  scaleDuration = 0.15,
  settleDuration = 0.5,
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathRef = useRef(null);
  const svgRef = useRef(null);

  // SVG Path Configurations representing the morph keyframe geometry states
  const paths = {
    base: "M18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9Z",
    hover:
      "M20 9C20 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C13.9706 0 20 5.02944 20 9Z",
    stretch:
      "M36 9C36 15.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C13.9706 0 36 2.02944 36 9Z",
    recoil:
      "M35.9954 9C35.9954 13.9706 31.9659 18 26.9954 18C22.0248 18 23.9954 12.9706 23.9954 9C23.9954 5.02944 22.0248 0 26.9954 0C31.9659 0 35.9954 4.02944 35.9954 9Z",
    destination:
      "M36 9C36 13.9706 31.9706 18 27 18C22.0294 18 18 13.9706 18 9C18 4.02944 22.0294 0 27 0C31.9706 0 36 4.02944 36 9Z",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Script dynamic asynchronous payload orchestration for loading free-tier compatible GSAP
  useEffect(() => {
    if (!mounted) return;

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
          reject(new Error(`Failed to initialize pipeline component: ${src}`));
        document.head.appendChild(el);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    ).catch((e) =>
      console.error(
        "[MorphingSwitch] Deployment pipeline injection fault:",
        e.message,
      ),
    );
  }, [mounted]);

  // Hover expansion and configuration handler
  useEffect(() => {
    if (!mounted || !window.gsap || isAnimating) return;
    const { gsap } = window;

    // Fluid interpolation fallback handling via geometric attribute morphing mutations
    gsap.to(pathRef.current, {
      attr: { d: isHovered ? paths.hover : paths.base },
      duration: scaleDuration,
      overwrite: "auto",
    });
  }, [isHovered, isAnimating, mounted]);

  if (!mounted) return null;

  const handleToggleClick = (e) => {
    e.preventDefault();
    if (isAnimating) return;

    const { gsap } = window;
    if (!gsap) {
      // Fallback structural toggle if script layer delivery drops frame
      const nextState = !checked;
      setChecked(nextState);
      if (onChange) onChange(nextState);
      return;
    }

    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        const nextState = !checked;
        setChecked(nextState);
        if (onChange) onChange(nextState);

        // Reset geometry back immediately to prepare for inverse directional toggle flow
        gsap.set(pathRef.current, { attr: { d: paths.base } });
        setIsAnimating(false);
      },
    });

    // Elastic fluid blob morphology structural configuration timeline
    timeline
      .to(pathRef.current, {
        attr: { d: paths.textContent || paths.stretch },
        duration: scaleDuration,
        ease: "power1.out",
      })
      .to(pathRef.current, {
        attr: { d: paths.recoil },
        duration: scaleDuration,
        ease: "power1.in",
      })
      .to(pathRef.current, {
        attr: { d: paths.destination },
        duration: settleDuration,
        ease: "elastic.out(1, 0.8)",
      });
  };

  return (
    <div className="relative inline-block select-none">
      <label
        onClick={handleToggleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative block w-10 h-[22px] cursor-pointer"
      >
        <input type="checkbox" checked={checked} readOnly className="sr-only" />

        {/* Track Chassis Interface Area */}
        <div
          style={{
            backgroundColor: isAnimating
              ? colorActive
              : checked
                ? colorActive
                : isHovered
                  ? colorHover
                  : colorDefault,
          }}
          className="w-full h-full rounded-[11px] transition-colors duration-300 pointer-events-none"
        />

        {/* Floating Morphing Dot Vector Asset Frame */}
        <svg
          ref={svgRef}
          viewBox="0 0 36 18"
          style={{ fill: colorDot }}
          className={`absolute top-0.5 left-0.5 w-9 h-[18px] pointer-events-none transition-transform duration-300 [filter:drop-shadow(0_0.5px_0.5px_rgba(0,9,61,0.1))] ${
            checked && !isAnimating ? "rotate-180 [transform:scaleX(-1)]" : ""
          }`}
        >
          <path ref={pathRef} d={paths.base} />
        </svg>
      </label>
    </div>
  );
}
