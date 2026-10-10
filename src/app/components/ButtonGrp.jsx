"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── ButtonGrp ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// containerBg      string   '#2a2a2a'    The background color of the outer screen container
// groupBg          string   '#000000'    The background color of the button bar
// activeBg         string   '#0a0a0a'    The background of the active button
// defaultColor     string   '#6a6a6a'    Default icon/text color for inactive states
// activeColor      string   '#fdd901'    Color for the active indicator line and icon
// groupWidth       string   '300px'      Width of the entire group wrapper
// groupHeight      string   '60px'       Height of the entire group wrapper
// initialActive    number   0            Index of the button active by default
// onChange         function undefined    Optional callback receiving the active index
// ──────────────────────────────────────────────────────────────────────────

export default function ButtonGrp({
  containerBg = "#2a2a2a",
  groupBg = "#000000",
  activeBg = "#0a0a0a",
  defaultColor = "#6a6a6a",
  activeColor = "#fdd901",
  groupWidth = "300px",
  groupHeight = "60px",
  initialActive = 0,
  onChange,
}) {
  const [activeIndex, setActiveIndex] = useState(initialActive);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  // Prevent SSR/Hydration structural mismatch issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleButtonClick = (index) => {
    setActiveIndex(index);
    if (onChange) {
      onChange(index);
    }
  };

  const itemWidthPercent = 100 / 3;
  const indicatorLeft = isMounted ? `${activeIndex * 99.3 + 1}px` : "1px";

  // Configuration matrix for the buttons
  const buttonsData = [
    {
      id: 0,
      label: "Cut",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-[1.45rem] h-[1.45rem] fill-current mx-auto transition-transform duration-300 group-hover:scale-110"
        >
          <path d="M120 288c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32zm0 64c-53 0-96-43-96-96s43-96 96-96c36.4 0 68 20.3 84.4 50.4l34.8-59C222.1 124.6 201 96 176 96c-53 0-96 43-96 96s43 96 96 96c21.5 0 41.3-7.1 57.3-19.1L301.7 384H400c17.7 0 32 14.3 32 32s-14.3 32-32 32H301.7l-94.4-159.2c-1.4 2.4-3 4.8-4.7 7.1L271.3 416H240l-45.5-76.8L149 416h-29c-53 0-96-43-96-96s43-96 96-96c25 0 46.1 28.6 63.3 55.4l34.8 59C201.7 332.3 170.1 352 120 352zm280-224c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32z" />
        </svg>
      ),
    },
    {
      id: 1,
      label: "Copy",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-[1.45rem] h-[1.45rem] fill-current mx-auto transition-transform duration-300 group-hover:scale-110"
        >
          <path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1c4.2 0 8.3 1.7 11.3 4.7l51.9 51.9c3 3 4.7 7.1 4.7 11.3V320c0 8.8-7.2 16-16 16zM192 0c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V115.9c0-17-6.7-33.3-18.7-45.3L377.3 18.7C365.3 6.7 349 0 332.1 0H192zM64 128C28.7 128 0 156.7 0 192V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z" />
        </svg>
      ),
    },
    {
      id: 2,
      label: "Paste",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-[1.45rem] h-[1.45rem] fill-current mx-auto transition-transform duration-300 group-hover:scale-110"
        >
          <path d="M208 0c17.7 0 32 14.3 32 32V48h16c26.5 0 48 21.5 48 48v48H144V96c0-26.5 21.5-48 48-48h16V32c0-17.7 14.3-32 32-32zM80 96c0-17.7 14.3-32 32-32h16v48c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32V64h16c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H112c-17.7 0-32-14.3-32-32V96zM32 384H48v32c0 35.3 28.7 64 64 64H336c35.3 0 64-28.7 64-64V384h16c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H400v32c0 8.8-7.2 16-16 16H352v16c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V160H64c-8.8 0-16-7.2-16-16V112H32c-17.7 0-32 14.3-32 32V352c0 17.7 14.3 32 32 32z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden m-0 p-0"
      style={{ backgroundColor: containerBg }}
    >
      <div
        ref={containerRef}
        className="relative shadow-[0_4px_20px_rgba(18,22,18,0.9)]"
        style={{
          width: groupWidth,
          height: groupHeight,
          backgroundColor: groupBg,
        }}
      >
        {buttonsData.map((button) => {
          const isActive = activeIndex === button.id;
          return (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button.id)}
              /* Replaced <style jsx> injection with a completely safe inline custom Tailwind keyframe animation sequence
               */
              className={`group float-left relative h-[58px] cursor-pointer outline-none border-none transition-all duration-400 flex items-center justify-center
                ${isActive ? "animate-[bounce_0.6s_linear]" : ""}
              `}
              style={{
                width: `${itemWidthPercent}%`,
                color: isActive ? activeColor : defaultColor,
                backgroundColor: isActive ? activeBg : "transparent",
                boxShadow: isActive ? `inset 0 0 1px ${activeColor}` : "none",
              }}
              aria-label={button.label}
            >
              {button.icon}
            </button>
          );
        })}

        {/* Active bottom slider element */}
        <div
          className="w-[100px] h-[3px] absolute transition-all duration-400 ease-out"
          style={{
            backgroundColor: activeColor,
            marginTop: "58px",
            marginLeft: indicatorLeft,
          }}
        />
      </div>
    </div>
  );
}
