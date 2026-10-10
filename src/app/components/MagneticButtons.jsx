"use client";

import React, { useEffect, useState, useRef } from "react";

// ─── MagneticButtons ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor           string   "#E8EBF3"  Layout backdrop background color
// buttonBgColor     string   "#4F29F0"  Background color of the primary (.fill) button
// buttonTextColor   string   "#414856"  Base button typography color
// buttonLightColor  string   "#ffffff"  Text color used inside filled buttons
// buttonBorderColor string   "#C3C8DE"  Border color for the hollow button
// cursorColor       string   "#C3C8DE"  Custom global tracking circle border color
// magneticPullBtn   number   0.15       Multiplier determining how aggressively the button frame tracks the pointer
// magneticPullRot   number   -0.1       Multiplier determining button 3D rotation intensity along X/Y axes
// magneticPullTxt   number   0.025      Multiplier tracking text layers inside the button
// ──────────────────────────────────────────────────────────────────────────

export default function MagneticButtons({
  bgColor = "#E8EBF3",
  buttonBgColor = "#4F29F0",
  buttonTextColor = "#414856",
  buttonLightColor = "#ffffff",
  buttonBorderColor = "#C3C8DE",
  cursorColor = "#C3C8DE",
  magneticPullBtn = 0.15,
  magneticPullRot = -0.1,
  magneticPullTxt = 0.025,
}) {
  // Target refs for specific element state adjustments
  const fillButtonRef = useRef(null);
  const hollowButtonRef = useRef(null);

  // Layout mouse coordinate states for our custom tracking bubble
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveredLink, setIsHoveredLink] = useState(false);

  // Synchronize global mouse tracking position safely across client render
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setMousePos({ x: e.pageX, y: e.pageY });
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, []);

  // Standardized Magnetic Element Event Handlers
  const handleButtonMouseMove = (e, ref) => {
    const el = ref.current;
    if (!el) return;

    const pos = el.getBoundingClientRect();
    // Locate cursor offset values directly relative to current element center coords
    const mx = e.clientX - pos.left - pos.width / 2;
    const my = e.clientY - pos.top - pos.height / 2;

    // Apply exact translations mapping back to your calculated operational constants
    el.style.transform = `translate(${mx * magneticPullBtn}px, ${my * (magneticPullBtn * 2)}px) rotate3d(${mx * magneticPullRot}, ${my * (magneticPullRot * 3)}, 0, 12deg)`;

    const textSpan = el.children[0];
    if (textSpan) {
      textSpan.style.transform = `translate(${mx * magneticPullTxt}px, ${my * (magneticPullTxt * 3)}px)`;
    }
  };

  const handleButtonMouseLeave = (ref) => {
    const el = ref.current;
    if (!el) return;

    // Gracefully drop transforms back down to zero states when moving off-bounds
    el.style.transform = "translate3d(0px, 0px, 0px) rotate3d(0, 0, 0, 0deg)";

    const textSpan = el.children[0];
    if (textSpan) {
      textSpan.style.transform = "translate3d(0px, 0px, 0px)";
    }
  };

  return (
    <div
      className="relative w-full h-screen flex justify-center items-center overflow-hidden font-['Varela_Round',_sans-serif] select-none"
      style={{ backgroundColor: bgColor }}
    >
      {/* ─── Button Content Wrapper ─── */}
      <div className="flex z-10">
        {/* Filled Button Variant */}
        <button
          ref={fillButtonRef}
          onMouseMove={(e) => handleButtonMouseMove(e, fillButtonRef)}
          onMouseLeave={() => handleButtonMouseLeave(fillButtonRef)}
          onMouseEnter={() => setIsHoveredLink(true)}
          onMouseOut={() => setIsHoveredLink(false)}
          className="mx-[10px] flex items-center justify-center relative border-0 px-[30px] w-auto h-[60px] rounded-[2px] bg-none outline-none shadow-[0_10px_30px_rgba(65,72,86,0.1)] transition-transform duration-100 ease-linear [cursor:none]"
          style={{
            backgroundColor: buttonBgColor,
            color: buttonLightColor,
          }}
        >
          <span className="inline-block relative z-20 text-[16px] font-normal transition-transform duration-150 ease-linear pointer-events-none">
            Contact me
          </span>
        </button>

        {/* Hollow Border Button Variant */}
        <button
          ref={hollowButtonRef}
          onMouseMove={(e) => handleButtonMouseMove(e, hollowButtonRef)}
          onMouseLeave={() => handleButtonMouseLeave(hollowButtonRef)}
          onMouseEnter={() => setIsHoveredLink(true)}
          onMouseOut={() => setIsHoveredLink(false)}
          className="mx-[10px] flex items-center justify-center relative px-[30px] w-auto h-[60px] rounded-[2px] border bg-none outline-none shadow-[0_10px_30px_rgba(65,72,86,0.1)] transition-transform duration-100 ease-linear [cursor:none]"
          style={{
            borderColor: buttonBorderColor,
            color: buttonTextColor,
          }}
        >
          <span className="inline-block relative z-20 text-[16px] font-normal transition-transform duration-150 ease-linear pointer-events-none">
            Contact me
          </span>
        </button>
      </div>

      {/* ─── Custom Floating Target Cursor ─── */}
      <div
        className="fixed z-[99] w-[40px] h-[40px] rounded-full bg-none border-2 pointer-events-none transition-[transform,_background-color,_border-color] duration-300 ease-out"
        style={{
          left: `${mousePos.x - 25}px`,
          top: `${mousePos.y - 25}px`,
          borderColor: isHoveredLink ? "#fff" : cursorColor,
          backgroundColor: isHoveredLink ? "#fff" : "transparent",
          transform: isHoveredLink ? "scale(1.5)" : "scale(1)",
          mixBlendMode: isHoveredLink ? "difference" : "normal",
        }}
      />

      {/* ─── Static Footer Social Badges ─── */}
      <div className="fixed block left-5 bottom-5 z-20">
        {/* Dribbble Link Anchor */}
        <a
          className="block w-[30px] opacity-20 scale-[0.8] hover:scale-100 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.38,-0.12,0.24,1.91)] mb-3"
          href="https://dribbble.com/shots/14882445-Magnetic-button-animation-CodePen"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHoveredLink(true)}
          onMouseLeave={() => setIsHoveredLink(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 32 32"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16 0C7.16703 0 0 7.16703 0 16C0 24.833 7.16703 32 16 32C24.8156 32 32 24.833 32 16C32 7.16703 24.8156 0 16 0ZM26.5683 7.37527C28.4772 9.70065 29.6226 12.6681 29.6573 15.8785C29.2061 15.7918 24.6941 14.872 20.1475 15.4447C20.0434 15.2191 19.9566 14.9761 19.8525 14.7332C19.5748 14.0738 19.2625 13.397 18.9501 12.7549C23.9826 10.7072 26.2733 7.75705 26.5683 7.37527ZM16 2.36009C19.4707 2.36009 22.6464 3.66161 25.0586 5.7961C24.8156 6.14317 22.7505 8.90239 17.8915 10.7245C15.6529 6.61171 13.1714 3.24512 12.7896 2.72451C13.8134 2.48156 14.8894 2.36009 16 2.36009ZM10.1866 3.64425C10.551 4.13015 12.9805 7.5141 15.2538 11.5401C8.86768 13.2408 3.22777 13.2061 2.62039 13.2061C3.50542 8.9718 6.36876 5.44902 10.1866 3.64425ZM2.32538 16.0174C2.32538 15.8785 2.32538 15.7397 2.32538 15.6009C2.9154 15.6182 9.54447 15.705 16.3644 13.6573C16.7636 14.4208 17.128 15.2017 17.4751 15.9826C17.3015 16.0347 17.1106 16.0868 16.9371 16.1388C9.89154 18.4121 6.14317 24.6247 5.8308 25.1453C3.6616 22.7332 2.32538 19.5228 2.32538 16.0174ZM16 29.6746C12.8416 29.6746 9.92625 28.5987 7.61822 26.7939C7.86117 26.2907 10.6377 20.9458 18.3427 18.256C18.3774 18.2386 18.3948 18.2386 18.4295 18.2213C20.3557 23.2017 21.1367 27.3839 21.3449 28.5813C19.6963 29.2928 17.8915 29.6746 16 29.6746ZM23.6182 27.3319C23.4794 26.4989 22.7505 22.5076 20.9631 17.5965C25.2495 16.9197 28.9978 18.0304 29.4664 18.1866C28.8764 21.987 26.6898 25.2668 23.6182 27.3319Z"
              fill="#EA4C89"
            />
          </svg>
        </a>

        {/* Twitter Link Anchor */}
        <a
          className="block w-[30px] opacity-20 scale-[0.8] hover:scale-100 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.38,-0.12,0.24,1.91)]"
          href="https://twitter.com/MilanRaring"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHoveredLink(true)}
          onMouseLeave={() => setIsHoveredLink(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 72 72"
          >
            <path
              fill="black"
              d="M67.812 16.141a26.246 26.246 0 0 1-7.519 2.06 13.134 13.134 0 0 0 5.756-7.244 26.127 26.127 0 0 1-8.313 3.176A13.075 13.075 0 0 0 48.182 10c-7.229 0-13.092 5.861-13.092 13.093 0 1.026.118 2.021.338 2.981-10.885-.548-20.528-5.757-26.987-13.679a13.048 13.048 0 0 0-1.771 6.581c0 4.542 2.312 8.551 5.824 10.898a13.048 13.048 0 0 1-5.93-1.638c-.002.055-.002.11-.002.162 0 6.345 4.513 11.638 10.504 12.84a13.177 13.177 0 0 1-3.449.457c-.846 0-1.667-.078-2.465-.231 1.667 5.2 6.499 8.986 12.23 9.09a26.276 26.276 0 0 1-16.26 5.606A26.21 26.21 0 0 1 4 55.976a37.036 37.036 0 0 0 20.067 5.882c24.083 0 37.251-19.949 37.251-37.249 0-.566-.014-1.134-.039-1.694a26.597 26.597 0 0 0 6.533-6.774z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
