"use client";

import { useEffect, useRef, useState } from "react";

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

export default function MorphingSwitch({
  defaultChecked = false,
  onChange,
  colorDefault = "#D1D6EE",
  colorHover = "#CACFE6",
  colorActive = "#275EFE",
  colorDot = "#ffffff",
  scaleDuration = 0.15,
  settleDuration = 0.5,
  className = "",
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gsap, setGsap] = useState(null);

  const pathRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import("gsap").then((mod) => {
      if (!cancelled) setGsap(mod.gsap || mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      if (gsap && pathRef.current) gsap.killTweensOf(pathRef.current);
    };
  }, [gsap]);

  useEffect(() => {
    if (!gsap || isAnimating) return;
    gsap.to(pathRef.current, {
      attr: { d: isHovered ? paths.hover : paths.base },
      duration: scaleDuration,
      overwrite: "auto",
    });
  }, [isHovered, isAnimating, gsap]);

  const handleToggleClick = (e) => {
    e.preventDefault();
    if (isAnimating || !gsap) return;

    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        const nextState = !checked;
        setChecked(nextState);
        if (onChange) onChange(nextState);

        gsap.set(pathRef.current, { attr: { d: paths.base } });
        setIsAnimating(false);
      },
    });
    timelineRef.current = timeline;

    timeline
      .to(pathRef.current, {
        attr: { d: paths.stretch },
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
    <div
      className={`w-full h-screen flex items-center justify-center select-none ${className}`}
    >
      <label
        onClick={handleToggleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative block w-10 h-[22px] cursor-pointer"
      >
        <input type="checkbox" checked={checked} readOnly className="sr-only" />

        <div
          style={{
            backgroundColor:
              isAnimating || checked
                ? colorActive
                : isHovered
                  ? colorHover
                  : colorDefault,
          }}
          className="w-full h-full rounded-[11px] transition-colors duration-300 pointer-events-none"
        />

        <svg
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
