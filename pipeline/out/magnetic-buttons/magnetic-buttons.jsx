"use client";

import React, { useEffect, useState, useRef } from "react";

export default function MagneticButtons({
  buttonBgColor = "#4F29F0",
  buttonTextColor = "#414856",
  buttonLightColor = "#ffffff",
  buttonBorderColor = "#C3C8DE",
  cursorColor = "#C3C8DE",
  magneticPullBtn = 0.15,
  magneticPullRot = -0.1,
  magneticPullTxt = 0.025,
  fillLabel = "Contact me",
  hollowLabel = "Contact me",
  className = "",
}) {
  const fillButtonRef = useRef(null);
  const hollowButtonRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveredLink, setIsHoveredLink] = useState(false);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setMousePos({ x: e.pageX, y: e.pageY });
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, []);

  const handleButtonMouseMove = (e, ref) => {
    const el = ref.current;
    if (!el) return;

    const pos = el.getBoundingClientRect();

    const mx = e.clientX - pos.left - pos.width / 2;
    const my = e.clientY - pos.top - pos.height / 2;

    el.style.transform = `translate(${mx * magneticPullBtn}px, ${my * (magneticPullBtn * 2)}px) rotate3d(${mx * magneticPullRot}, ${my * (magneticPullRot * 3)}, 0, 12deg)`;

    const textSpan = el.children[0];
    if (textSpan) {
      textSpan.style.transform = `translate(${mx * magneticPullTxt}px, ${my * (magneticPullTxt * 3)}px)`;
    }
  };

  const handleButtonMouseLeave = (ref) => {
    const el = ref.current;
    if (!el) return;

    el.style.transform = "translate3d(0px, 0px, 0px) rotate3d(0, 0, 0, 0deg)";

    const textSpan = el.children[0];
    if (textSpan) {
      textSpan.style.transform = "translate3d(0px, 0px, 0px)";
    }
  };

  return (
    <div
      className={`relative w-full h-screen flex justify-center items-center overflow-hidden font-['Varela_Round',_sans-serif] select-none ${className}`}
    >
      <div className="flex flex-wrap justify-center gap-y-4 z-10">
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
            {fillLabel}
          </span>
        </button>

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
            {hollowLabel}
          </span>
        </button>
      </div>

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
    </div>
  );
}
