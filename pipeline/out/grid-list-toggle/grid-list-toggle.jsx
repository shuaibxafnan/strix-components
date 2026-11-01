"use client";

import { useState } from "react";

const DOTS = [
  { left: 4, top: 4 },
  { left: 13, top: 4 },
  { left: 4, top: 13 },
  { left: 13, top: 13 },
];

function ToggleIcon({ state, color, dotsDuration, linesDuration }) {
  return (
    <div className="relative w-6 h-6">
      <div className="absolute inset-0">
        {DOTS.map((dot, i) => (
          <i
            key={i}
            className="absolute block w-[7px] h-[7px] rounded-[2px]"
            style={{
              left: `${dot.left}px`,
              top: `${dot.top}px`,
              backgroundColor: color,
              animation: state.animated
                ? `${state.active ? "gl-move" : "gl-back"}-${i + 1} ${dotsDuration} linear forwards`
                : "none",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {[3, 8, 13, 18].map((topVal, index) => {
          const originClass =
            index === 2 || index === 3
              ? state.active
                ? "origin-[0%_50%]"
                : "origin-[100%_50%]"
              : state.active
                ? "origin-[100%_50%]"
                : "origin-[0%_50%]";

          return (
            <i
              key={index}
              className={`absolute left-[9px] block h-[2px] w-[11px] rounded-[1px] transition-transform ${originClass}`}
              style={{
                top: `${topVal}px`,
                backgroundColor: color,
                transform: state.active
                  ? "translateY(20%) scaleX(1)"
                  : "translateY(20%) scaleX(0)",
                transitionDuration: linesDuration,
                transitionDelay: state.active ? "0.3s" : "0s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function GridListToggle({
  darkBtnBg = "#2B3044",
  darkBtnHover = "#1E2235",
  lightBtnBg = "#275EFE",
  lightBtnHover = "#1548DB",
  activeTextColor = "#F6F8FF",
  iconColorDefault = "#BBC1E1",
  iconColorAlt = "#FFFFFF",
  dotsDuration = "0.5s",
  linesDuration = "0.15s",
  gridLabel = "Grid",
  listLabel = "List",
  className = "",
}) {
  const [btn1State, setBtn1State] = useState({
    animated: false,
    active: false,
  });
  const [btn2State, setBtn2State] = useState({
    animated: false,
    active: false,
  });

  const triggerToggle = (target) => {
    const setter = target === 1 ? setBtn1State : setBtn2State;
    setter((prev) => ({
      animated: true,
      active: !prev.active,
    }));
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center font-sans antialiased ${className}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes gl-move-1 { 50% { transform: translate(-8px, 10px) scale(0.4); } 100% { transform: translate(-2px, 12px) scale(0.4); } }
        @keyframes gl-move-2 { 50% { transform: translate(-12px, 5px) scale(0.4); } 100% { transform: translate(-11px, 7px) scale(0.4); } }
        @keyframes gl-move-3 { 50% { transform: translate(4px, -5px) scale(0.4); } 100% { transform: translate(-2px, -7px) scale(0.4); } }
        @keyframes gl-move-4 { 50% { transform: translate(0px, -10px) scale(0.4); } 100% { transform: translate(-11px, -12px) scale(0.4); } }

        @keyframes gl-back-1 { 0%, 15% { transform: translate(-2px, 12px) scale(0.4); } 50% { transform: translate(10px, 7px) scale(0.5); } 100% { transform: translate(0, 0) scale(1); } }
        @keyframes gl-back-2 { 0%, 15% { transform: translate(-11px, 7px) scale(0.4); } 50% { transform: translate(-3px, 1px) scale(0.5); } 100% { transform: translate(0, 0) scale(1); } }
        @keyframes gl-back-3 { 0%, 15% { transform: translate(-2px, -7px) scale(0.4); } 50% { transform: translate(-5px, 0px) scale(0.5); } 100% { transform: translate(0, 0) scale(1); } }
        @keyframes gl-back-4 { 0%, 15% { transform: translate(-11px, -12px) scale(0.4); } 50% { transform: translate(-14px, -8px) scale(0.5); } 100% { transform: translate(0, 0) scale(1); } }

        @keyframes gl-text-out { 0% { opacity: 0; transform: translateY(-12px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes gl-text-in { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-12px); } }
      `,
        }}
      />

      <div className="flex items-center space-x-5">
        <button
          onClick={() => triggerToggle(1)}
          className="group relative flex p-1.5 border-none outline-none rounded-[9px] cursor-pointer select-none transition-all duration-300 active:scale-[0.95]"
          style={{
            backgroundColor: btn1State.active ? lightBtnHover : lightBtnBg,
          }}
        >
          <ToggleIcon
            state={btn1State}
            color={iconColorAlt}
            dotsDuration={dotsDuration}
            linesDuration={linesDuration}
          />
        </button>

        <button
          onClick={() => triggerToggle(2)}
          className="group relative flex items-center py-1.5 pr-3 pl-2 border-none outline-none rounded-[9px] cursor-pointer select-none transition-all duration-400 active:scale-[0.95]"
          style={{
            backgroundColor: btn2State.active ? darkBtnHover : darkBtnBg,
          }}
        >
          <ToggleIcon
            state={btn2State}
            color={iconColorDefault}
            dotsDuration={dotsDuration}
            linesDuration={linesDuration}
          />

          <div
            className="relative ml-1 h-6 min-w-[28px] font-semibold text-[14px] leading-6 overflow-hidden"
            style={{ color: activeTextColor }}
          >
            <span
              className="block"
              style={{
                animation: btn2State.animated
                  ? `${btn2State.active ? "gl-text-in" : "gl-text-out"} 0.4s ease forwards`
                  : "none",
                opacity: btn2State.active ? 0 : 1,
                transform: btn2State.active
                  ? "translateY(-12px)"
                  : "translateY(0px)",
              }}
            >
              {gridLabel}
            </span>
            <span
              className="absolute left-0 top-0 block"
              style={{
                animation: btn2State.animated
                  ? `${btn2State.active ? "gl-text-out" : "gl-text-in"} 0.4s ease forwards`
                  : "none",
                opacity: btn2State.active ? 1 : 0,
                transform: btn2State.active
                  ? "translateY(0px)"
                  : "translateY(12px)",
              }}
            >
              {listLabel}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
