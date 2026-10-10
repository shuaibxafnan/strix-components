"use client";

import { useEffect, useRef, useState } from "react";

// ─── FavoriteButton ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// label               string    "Favorite"       Button text
// defaultBg           string    "#313440"        Idle background color
// activeBg            string    "#313440"        Active state background color
// textColor           string    "#FAFBFF"        Label text color
// starDefaultColor    string    "#62677C"        Idle star filling
// starActiveColor     string    "#F6C206"        Active star filling
// starFaceDefault     string    "#1F2128"        Idle star face features
// starFaceActive      string    "#845901"        Active star face features
// starHoleColor       string    "#16181E"        Drop tray / hole shadow
// starHoleInnerColor  string    "#20232C"        Drop tray inset glow
// minWidth            string    "125px"          Button minimum width style
// ──────────────────────────────────────────────────────────────────────────

export default function FavoriteButton({
  label = "Favorite",
  defaultBg = "#313440",
  activeBg = "#313440",
  textColor = "#FAFBFF",
  starDefaultColor = "#62677C",
  starActiveColor = "#F6C206",
  starFaceDefault = "#1F2128",
  starFaceActive = "#845901",
  starHoleColor = "#16181E",
  starHoleInnerColor = "#20232C",
  minWidth = "125px",
}) {
  const buttonRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !buttonRef.current) return;

    const button = buttonRef.current;

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
        el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap) return;

        const handleClick = (e) => {
          e.preventDefault();

          if (button.classList.contains("animated")) return;
          button.classList.add("animated");

          gsap.to(button, {
            keyframes: [
              { "--star-y": "-36px", duration: 0.3, ease: "power2.out" },
              {
                "--star-y": "48px",
                "--star-scale": 0.4,
                duration: 0.325,
                onStart() {
                  button.classList.add("star-round");
                },
              },
              {
                "--star-y": "-64px",
                "--star-scale": 1,
                duration: 0.45,
                ease: "power2.out",
                onStart() {
                  button.classList.toggle("active");
                  setTimeout(() => button.classList.remove("star-round"), 100);
                },
              },
              { "--star-y": "0px", duration: 0.45, ease: "power2.in" },
              { "--button-y": "3px", duration: 0.11 },
              {
                "--button-y": "0px",
                "--star-face-scale": 0.65,
                duration: 0.125,
              },
              { "--star-face-scale": 1, duration: 0.15 },
            ],
            // FIX: Explicitly clear only the animated properties instead of breaking React's style object
            clearProps: "--star-y,--star-scale,--button-y,--star-face-scale",
            onComplete() {
              button.classList.remove("animated");
            },
          });

          gsap.to(button, {
            keyframes: [
              {
                "--star-hole-scale": 0.8,
                duration: 0.5,
                ease: "elastic.out(1, .75)",
              },
              { "--star-hole-scale": 0, duration: 0.2, delay: 0.2 },
            ],
          });

          gsap.to(button, {
            "--star-rotate": "360deg",
            duration: 1.55,
            // FIX: Safely clear only the rotation variable
            clearProps: "--star-rotate",
          });
        };

        button.addEventListener("click", handleClick);
        return () => button.removeEventListener("click", handleClick);
      })
      .catch((err) => console.error("[FavoriteButton] GSAP load failed:", err));
  }, [mounted]);

  const buttonInlineStyles = {
    "--background-default": defaultBg,
    "--background-active": activeBg,
    "--text-color-default": textColor,
    "--star-color-default": starDefaultColor,
    "--star-color-active": starActiveColor,
    "--star-face-color-default": starFaceDefault,
    "--star-face-color-active": starFaceActive,
    "--star-hole": starHoleColor,
    "--star-hole-inner": starHoleInnerColor,
    minWidth: minWidth,
  };

  return (
    <button
      ref={buttonRef}
      style={buttonInlineStyles}
      className="[--button-y:0px] [--star-y:0px] [--star-scale:1] [--star-rotate:0deg] [--star-hole-scale:0] [--star-face-scale:1] [--text-x:0px] [--text-o:1] [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale] relative flex items-center border-none outline-none m-0 p-[12px_24px_12px_16px] cursor-pointer bg-none select-none font-sans font-medium text-[14px] leading-[19px] [color:var(--text-color-default)] [transform:translateY(var(--button-y))_translateZ(0)] [-webkit-tap-highlight-color:transparent] before:content-[''] before:absolute before:inset-0 before:rounded-[9px] before:transition-transform before:duration-200 before:bg-[var(--background-default)] before:[transform:scale(var(--background-scale-x,1),var(--background-scale-y,1))_translateZ(0)] active:before:[--background-scale-x:0.98] active:before:[--background-scale-y:0.96] [&.active]:before:bg-[var(--background-active)] [&.active]:[--star-color:var(--star-color-active)] [&.active]:[--star-face-color:var(--star-face-color-active)] [&.active]:[--star-face-radius:0_0_2px_2px] [&.star-round]:[--star-clip:polygon(10px_0,20px_0,20px_7px,20px_12px,20px_19px,10px_19px,0_19px,0_12px,0_7px,0_0)] [&.star-round]:[--star-radius:50%]"
    >
      {/* Icon Container */}
      <div className="relative pointer-events-none w-[36px] height-[119px] h-[119px] flex mt-[-100px] mr-[2px] mb-0 ml-[-8px] [clip-path:ellipse(150%_50%_at_50%_50%)] before:content-[''] before:mt-auto before:block before:w-[36px] before:h-[12px] before:bg-[var(--star-hole)] before:[box-shadow:inset_0_3px_0_0_var(--star-hole-inner)] before:rounded-[100px_/_30px] before:[transform:scale(var(--star-hole-scale))] before:[transform-origin:50%_100%]">
        {/* Star */}
        <div className="absolute left-[8px] bottom-0 w-[20px] h-[19px] transition-[clip-path,border-radius,background] duration-200 rounded-[var(--star-radius,0px)] bg-[var(--star-color,var(--star-color-default))] [clip-path:var(--star-clip,polygon(10px_0,13px_6px,20px_7px,15px_12px,16px_19px,10px_15px,4px_19px,5px_12px,0_7px,7px_6px))] [transform:translateY(var(--star-y))_rotate(var(--star-rotate))_scale(var(--star-scale))] before:content-[''] before:absolute before:w-[2px] before:h-[2px] before:rounded-full before:left-[7px] before:top-[8px] before:bg-[var(--star-face-color,var(--star-face-color-default))] before:[box-shadow:4px_0_0_0_var(--star-face-color,var(--star-face-color-default))] before:transition-[background,box-shadow] before:duration-200 before:[transform:scaleY(var(--star-face-scale))] after:content-[''] after:absolute after:w-[4px] after:h-[2px] after:left-[8px] after:top-[11px] after:bg-[var(--star-face-color,var(--star-face-color-default))] after:rounded-[var(--star-face-radius,2px_2px_0_0)] after:transition-[background,border-radius] after:duration-200" />
      </div>

      {/* Button Text */}
      <span className="relative block opacity-[var(--text-o)] [transform:translateX(var(--text-x))]">
        {label}
      </span>
    </button>
  );
}
