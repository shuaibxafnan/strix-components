"use client";

import { useEffect, useRef, useState } from "react";

// ─── StarToggle (Hydration-Safe / JSX) ───────────────────────────────────

export default function StarToggle({
  defaultChecked = false,
  onChange,
  size = 40,
  containerBg = "#1A1A20",
  colorDefault = "#7E7E86",
  faceColorDefault = "#1A1A20",
  colorActive = "#F6C206",
  faceColorActive = "#845901",
  holeBg = "#09090C",
  holeInnerShadow = "#121218",
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isChecked, setIsChecked] = useState(defaultChecked);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Flag mounted state immediately to eliminate SSR vs Client string issues
    setMounted(true);

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {})
      .catch((err) =>
        console.error("[StarToggle] GSAP loader runtime error:", err.message),
      );
  }, []);

  const handleToggleClick = (e) => {
    e.preventDefault();
    const wrapper = containerRef.current;
    const checkbox = inputRef.current;
    const gsap = window.gsap;

    if (!wrapper || !checkbox || !gsap) return;
    if (wrapper.classList.contains("animated")) return;

    wrapper.classList.add("animated");
    const targetNextState = !checkbox.checked;

    gsap.to(wrapper, {
      keyframes: [
        { "--y": "-48px", duration: 0.3, ease: "power2.out" },
        {
          "--y": "68px",
          "--scale": 0.4,
          duration: 0.325,
          onStart() {
            wrapper.classList.add("star-round");
          },
        },
        {
          "--y": "-80px",
          "--scale": 1,
          duration: 0.45,
          ease: "power2.out",
          onStart() {
            checkbox.checked = targetNextState;
            setIsChecked(targetNextState);
            if (onChange) onChange(targetNextState);
            setTimeout(() => wrapper.classList.remove("star-round"), 100);
          },
        },
        {
          "--y": "0px",
          duration: 0.45,
          ease: "power2.in",
          onComplete() {
            wrapper.classList.add("star-bottom");
            setTimeout(() => wrapper.classList.remove("star-bottom"), 200);
          },
        },
        { "--toggle-y": "3px", duration: 0.2 },
        {
          "--toggle-y": "0px",
          "--face-scale": targetNextState ? 1 : 0.4,
          "--face-tear-o": targetNextState ? 1 : 0.4,
          "--face-tear-y": targetNextState ? "0px" : "-6px",
          "--face-tear-s": targetNextState ? 1.5 : 1,
          duration: 0.125,
        },
        {
          "--face-scale": 1,
          "--face-tear-o": 0,
          "--face-tear-y": targetNextState ? "4px" : "-6px",
          "--face-tear-s": targetNextState ? 2.5 : 1,
          duration: 0.15,
        },
      ],
      clearProps: "transform",
      onComplete() {
        wrapper.classList.remove("animated");
      },
    });

    gsap.to(wrapper, {
      keyframes: [
        { "--hole-scale": 0.8, duration: 0.5, ease: "elastic.out(1, 0.75)" },
        { "--hole-scale": 0, duration: 0.2, delay: 0.2 },
      ],
    });

    gsap.to(wrapper, {
      "--rotate": "360deg",
      duration: 1.55,
      onComplete() {
        gsap.set(wrapper, { "--rotate": "0deg" });
      },
    });
  };

  const runtimeVariables = {
    "--color-default": colorDefault,
    "--face-color-default": faceColorDefault,
    "--color-active": colorActive,
    "--face-color-active": faceColorActive,
    "--hole": holeBg,
    "--hole-inner": holeInnerShadow,
    width: `${size}px`,
    height: `${size}px`,
  };

  // Prevent initial tree comparison error on the server by rendering a layout match container placeholder
  if (!mounted) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center select-none antialiased"
        style={{ backgroundColor: containerBg }}
      >
        <div style={{ width: `${size}px`, height: `${size}px` }} />
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center select-none antialiased"
      style={{ backgroundColor: containerBg }}
    >
      <div
        ref={containerRef}
        onClick={handleToggleClick}
        style={runtimeVariables}
        className="star-toggle relative block cursor-pointer [transform:translateY(var(--toggle-y,0px))_translateZ(0)] active:[--icon-s:0.95]"
      >
        <input
          ref={inputRef}
          type="checkbox"
          className="hidden"
          defaultChecked={defaultChecked}
          aria-label="Favorite Star Toggle"
        />

        <div
          className="icon w-[64px] h-[140px] flex pointer-events-none relative [clip-path:ellipse(150%_50%_at_50%_50%)] -mt-[100px] mr-0 mb-0 -ml-[12px] [transform:scale(var(--icon-s,1))_translateZ(0)] [transform-origin:50%_108px] transition-transform duration-100"
          style={{
            "--color": isChecked
              ? "var(--color-active)"
              : "var(--color-default)",
            "--face-color": isChecked
              ? "var(--face-color-active)"
              : "var(--face-color-default)",
            "--face-radius": isChecked ? "0_0_4px_4px" : "4px_4px_0_0",
          }}
        >
          {/* Bottom Warp Base Portal Hole */}
          <div className="mt-auto block w-[64px] h-[20px] bg-[var(--hole)] [box-shadow:inset_0_6px_0_0_var(--hole-inner)] rounded-[100px/30px] [transform:scale(var(--hole-scale,0))] [transform-origin:50%_100%]" />

          {/* Star Geometry Matrix Vector Layer */}
          <div
            className="star w-[40px] h-[40px] absolute left-[12px] bottom-0 [transform:translateY(var(--y,0px))_rotate(var(--rotate,0deg))_scale(var(--scale,1))] bg-[var(--color)] transition-[clip-path,border-radius,background] duration-200
              [clip-path:var(--clip,polygon(50%_0,_65%_32%,_100%_37%,_75%_63%,_80%_100%,_50%_79%,_20%_100%,_25%_63%,_0%_37%,_35%_32%))]
              [.star-round_&]:[--clip:polygon(50%_0%,_100%_0%,_100%_37%,_100%_63%,_100%_100%,_50%_100%,_0%_100%,_0%_63%,_0%_37%,_0%_0%)] [.star-round_&]:rounded-full
              [.star-bottom_&]:[--clip:polygon(50%_0,_65%_32%,_100%_37%,_75%_63%,_83%_96%,_50%_79%,_17%_96%,_25%_63%,_0%_37%,_35%_32%)]"
          >
            {/* Left Eye Element & Dropping Tear Feature */}
            <div
              className="absolute w-[4px] h-[4px] rounded-full left-[15px] top-[16px] bg-[var(--face-color)] [transform:scaleY(var(--face-scale,1))] transition-colors duration-200
                after:content-[''] after:absolute after:-left-[1px] after:top-[5px] after:w-[2px] after:h-[2px] after:rounded-full after:bg-[var(--face-color-default)]
                after:[transform:translateY(var(--face-tear-y,-6px))_scaleY(var(--face-tear-s,1))] after:opacity-[var(--face-tear-o,0)]"
            />

            {/* Right Eye Element */}
            <div className="absolute w-[4px] h-[4px] rounded-full left-[21px] top-[16px] bg-[var(--face-color)] [transform:scaleY(var(--face-scale,1))] transition-colors duration-200" />

            {/* Mouth Element */}
            <div
              className="absolute w-[10px] h-[4px] left-[15px] top-[23px] bg-[var(--face-color)] transition-all duration-200"
              style={{ borderRadius: "var(--face-radius)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
