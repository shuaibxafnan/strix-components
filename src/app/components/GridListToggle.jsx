"use client";

import { useEffect, useState } from "react";

// ─── GridListToggleButton ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// canvasBg         string    "#ECEFFC"    Viewport wrapper background canvas
// darkBtnBg        string    "#2B3044"    Default state button face fill
// darkBtnHover     string    "#1E2235"    Default state button hover color
// lightBtnBg       string    "#275EFE"    "Without Text" button profile fill
// lightBtnHover    string    "#1548DB"    "Without Text" button hover alternate
// activeTextColor  string    "#F6F8FF"    Typography label stroke text fill
// iconColorDefault string    "#BBC1E1"    Icon geometry fill color (standard mode)
// iconColorAlt     string    "#FFFFFF"    Icon geometry fill color (no-text mode)
// dotsDuration     string    "0.5s"       Timing lifecycle for morphing dot keys
// linesDuration    string    "0.15s"      Timing lifecycle for expanding list lines
// ──────────────────────────────────────────────────────────────────────────

export default function GridListToggleButton({
  canvasBg = "#ECEFFC",
  darkBtnBg = "#2B3044",
  darkBtnHover = "#1E2235",
  lightBtnBg = "#275EFE",
  lightBtnHover = "#1548DB",
  activeTextColor = "#F6F8FF",
  iconColorDefault = "#BBC1E1",
  iconColorAlt = "#FFFFFF",
  dotsDuration = "0.5s",
  linesDuration = "0.15s",
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Track animation state pipelines independently for each button setup
  const [btn1State, setBtn1State] = useState({
    animated: false,
    active: false,
  });
  const [btn2State, setBtn2State] = useState({
    animated: false,
    active: false,
  });

  // Guard against SSR mismatched layout shifts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const triggerToggle = (target) => {
    if (target === 1) {
      setBtn1State((prev) => ({
        animated: true,
        active: !prev.active,
      }));
    } else {
      setBtn2State((prev) => ({
        animated: true,
        active: !prev.active,
      }));
    }
  };

  if (!isMounted) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center font-sans antialiased"
        style={{ backgroundColor: canvasBg }}
      />
    );
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center font-sans antialiased"
      style={{ backgroundColor: canvasBg }}
    >
      {/* Global CSS Keyframes Injector for Complex Geometric Offsets */}
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

      {/* Wrapper Layout Track */}
      <div className="flex items-center space-x-5">
        {/* ─── BUTTON 1: Icon Only ("Without Text") ─── */}
        <button
          onClick={() => triggerToggle(1)}
          className="group relative flex p-1.5 border-none outline-none rounded-[9px] cursor-pointer select-none transition-all duration-300 active:scale-[0.95]"
          style={{
            backgroundColor: btn1State.active ? lightBtnHover : lightBtnBg,
          }}
        >
          <div className="relative w-6 h-6">
            {/* Dots Grid Layout Elements */}
            <div className="absolute inset-0">
              <i
                className="absolute left-[4px] top-[4px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorAlt,
                  animation: btn1State.animated
                    ? `${btn1State.active ? "gl-move-1" : "gl-back-1"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
              <i
                className="absolute left-[13px] top-[4px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorAlt,
                  animation: btn1State.animated
                    ? `${btn1State.active ? "gl-move-2" : "gl-back-2"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
              <i
                className="absolute left-[4px] top-[13px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorAlt,
                  animation: btn1State.animated
                    ? `${btn1State.active ? "gl-move-3" : "gl-back-3"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
              <i
                className="absolute left-[13px] top-[13px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorAlt,
                  animation: btn1State.animated
                    ? `${btn1State.active ? "gl-move-4" : "gl-back-4"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
            </div>

            {/* Horizontal Line Rules Track */}
            <div className="absolute inset-0">
              {[3, 8, 13, 18].map((topVal, index) => {
                const originClass =
                  index === 2 || index === 3
                    ? btn1State.active
                      ? "origin-[0%_50%]"
                      : "origin-[100%_50%]"
                    : btn1State.active
                      ? "origin-[100%_50%]"
                      : "origin-[0%_50%]";

                return (
                  <i
                    key={index}
                    className={`absolute left-[9px] block h-[2px] w-[11px] rounded-[1px] transition-transform ${originClass}`}
                    style={{
                      top: `${topVal}px`,
                      backgroundColor: iconColorAlt,
                      transform: btn1State.active
                        ? "translateY(20%) scaleX(1)"
                        : "translateY(20%) scaleX(0)",
                      transitionDuration: linesDuration,
                      transitionDelay: btn1State.active ? "0.3s" : "0s",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </button>

        {/* ─── BUTTON 2: Interactive Grid/List Variant With Text ─── */}
        <button
          onClick={() => triggerToggle(2)}
          className="group relative flex items-center py-1.5 pr-3 pl-2 border-none outline-none rounded-[9px] cursor-pointer select-none transition-all duration-400 active:scale-[0.95]"
          style={{
            backgroundColor: btn2State.active ? darkBtnHover : darkBtnBg,
          }}
        >
          <div className="relative w-6 h-6">
            {/* Dots Grid Layout Elements */}
            <div className="absolute inset-0">
              <i
                className="absolute left-[4px] top-[4px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorDefault,
                  animation: btn2State.animated
                    ? `${btn2State.active ? "gl-move-1" : "gl-back-1"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
              <i
                className="absolute left-[13px] top-[4px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorDefault,
                  animation: btn2State.animated
                    ? `${btn2State.active ? "gl-move-2" : "gl-back-2"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
              <i
                className="absolute left-[4px] top-[13px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorDefault,
                  animation: btn2State.animated
                    ? `${btn2State.active ? "gl-move-3" : "gl-back-3"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
              <i
                className="absolute left-[13px] top-[13px] block w-[7px] h-[7px] rounded-[2px]"
                style={{
                  backgroundColor: iconColorDefault,
                  animation: btn2State.animated
                    ? `${btn2State.active ? "gl-move-4" : "gl-back-4"} ${dotsDuration} linear forwards`
                    : "none",
                }}
              />
            </div>

            {/* Horizontal Line Rules Track */}
            <div className="absolute inset-0">
              {[3, 8, 13, 18].map((topVal, index) => {
                const originClass =
                  index === 2 || index === 3
                    ? btn2State.active
                      ? "origin-[0%_50%]"
                      : "origin-[100%_50%]"
                    : btn2State.active
                      ? "origin-[100%_50%]"
                      : "origin-[0%_50%]";

                return (
                  <i
                    key={index}
                    className={`absolute left-[9px] block h-[2px] w-[11px] rounded-[1px] transition-transform ${originClass}`}
                    style={{
                      top: `${topVal}px`,
                      backgroundColor: iconColorDefault,
                      transform: btn2State.active
                        ? "translateY(20%) scaleX(1)"
                        : "translateY(20%) scaleX(0)",
                      transitionDuration: linesDuration,
                      transitionDelay: btn2State.active ? "0.3s" : "0s",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Sliding Typography Copy Containers */}
          <div
            className="relative ml-1 h-6 min-w-[28px] font-semibold text-[14px] leading-6 overflow-hidden"
            style={{ color: activeTextColor }}
          >
            {/* "Grid" State Label */}
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
              Grid
            </span>
            {/* "List" State Label */}
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
              List
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
