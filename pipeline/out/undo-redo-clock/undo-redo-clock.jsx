"use client";

import React, { useState } from "react";

export default function UndoRedoClock({
  hue = 223,
  initialIndex = 4,
  totalActions = 9,
  scaleSize = "75px",
  undoLabel = "Undo",
  redoLabel = "Redo",
  className = "",
  onUndo,
  onRedo,
}) {
  const [actionIndex, setActionIndex] = useState(initialIndex);
  const [activeSide, setActiveSide] = useState(null);
  const handleUndo = () => {
    if (actionIndex > 0) {
      const nextIndex = actionIndex - 1;
      setActionIndex(nextIndex);
      if (onUndo) onUndo(nextIndex);
    }
  };

  const handleRedo = () => {
    if (actionIndex < totalActions - 1) {
      const nextIndex = actionIndex + 1;
      setActionIndex(nextIndex);
      if (onRedo) onRedo(nextIndex);
    }
  };

  const isUndoDisabled = actionIndex === 0;
  const isRedoDisabled = actionIndex === totalActions - 1;

  const primaryColor = `hsl(${hue}, 90%, 50%)`;
  const baseComponentBg = `hsl(${hue}, 90%, 60%)`;
  const tickColor = `hsl(${hue}, 90%, 70%)`;

  const clockTicks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center transition-colors duration-300 overflow-hidden ${className}`}
      style={{ fontSize: scaleSize }}
    >
      <div
        className="relative flex justify-between w-[3em] h-[1.5em] rounded-[0.75em]"
        style={{ backgroundColor: baseComponentBg }}
      >
        <button
          type="button"
          disabled={isUndoDisabled}
          onClick={handleUndo}
          onMouseDown={() => !isUndoDisabled && setActiveSide("undo")}
          onMouseUp={() => setActiveSide(null)}
          onMouseLeave={() => setActiveSide(null)}
          onTouchStart={() => !isUndoDisabled && setActiveSide("undo")}
          onTouchEnd={() => setActiveSide(null)}
          className={`flex items-center w-[1.5em] h-full rounded-[0.75em_0_0_0.75em] outline-none outline-transparent p-[0.25em_0.15em_0.25em_0.225em] transition-colors duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent]
            ${isUndoDisabled ? "cursor-not-allowed" : "cursor-pointer"}
            ${!isUndoDisabled ? "hover:bg-[hsla(var(--custom-hue),90%,70%,1)] focus:bg-[hsla(var(--custom-hue),90%,70%,1)]" : "bg-transparent"}
          `}
          style={{ "--custom-hue": hue }}
          aria-label={undoLabel}
        >
          <svg
            className={`w-[0.375em] h-[0.375em] text-white transition-opacity duration-300 ease-in-out ${isUndoDisabled ? "opacity-40" : "opacity-100"}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M10.3,4.1H2.7l2.8-2.8l-1-1L0,4.8l4.5,4.5l1-1L2.7,5.7h7.6c2.4,0,4.3,1.9,4.3,4.3s-1.9,4.3-4.3,4.3H7.4v1.4h2.9c3.1,0,5.7-2.6,5.7-5.7S13.4,4.1,10.3,4.1z" />
          </svg>
        </button>

        <button
          type="button"
          disabled={isRedoDisabled}
          onClick={handleRedo}
          onMouseDown={() => !isRedoDisabled && setActiveSide("redo")}
          onMouseUp={() => setActiveSide(null)}
          onMouseLeave={() => setActiveSide(null)}
          onTouchStart={() => !isRedoDisabled && setActiveSide("redo")}
          onTouchEnd={() => setActiveSide(null)}
          className={`flex items-center justify-end w-[1.5em] h-full rounded-[0_0.75em_0.75em_0] outline-none outline-transparent p-[0.25em_0.225em_0.25em_0.15em] transition-colors duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent]
            ${isRedoDisabled ? "cursor-not-allowed" : "cursor-pointer"}
            ${!isRedoDisabled ? "hover:bg-[hsla(var(--custom-hue),90%,70%,1)] focus:bg-[hsla(var(--custom-hue),90%,70%,1)]" : "bg-transparent"}
          `}
          style={{ "--custom-hue": hue }}
          aria-label={redoLabel}
        >
          <svg
            className={`w-[0.375em] h-[0.375em] text-white transition-opacity duration-300 ease-in-out ${isRedoDisabled ? "opacity-40" : "opacity-100"}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M5.7,4.1h7.6l-2.8-2.8l1-1L16,4.8l-4.5,4.5l-1-1l2.8-2.7H5.7c-2.4,0-4.3,1.9-4.3,4.3s1.9,4.3,4.3,4.3h2.9v1.4H5.7C2.6,15.6,0,13.1,0,10S2.6,4.1,5.7,4.1z" />
          </svg>
        </button>

        <div
          className="absolute top-0 left-1/2 w-[0.75em] h-[1.5em] pointer-events-none origin-[0_50%] transition-transform duration-300 cubic-bezier(0.58,0,0.42,1) z-[1]"
          style={{
            backgroundColor: baseComponentBg,
            transform:
              activeSide === "undo"
                ? "scaleX(-1)"
                : activeSide === "redo"
                  ? "scaleX(1)"
                  : "scaleX(0)",
          }}
        />

        <div
          className="absolute top-0 left-[calc(50%-0.75em)] w-[1.5em] h-[1.5em] bg-white rounded-full pointer-events-none transition-transform duration-300 cubic-bezier(0.58,0,0.42,1) z-[2]"
          style={{
            transform:
              activeSide === "undo"
                ? "translateX(-0.75em)"
                : activeSide === "redo"
                  ? "translateX(0.75em)"
                  : "translateX(0)",
          }}
        >
            {clockTicks.map((rotationAngle, idx) => (
            <div
              key={idx}
              className="absolute top-1/2 left-1/2 h-[max(2px,0.1em)] w-[max(1px,0.05em)] origin-[50%_0%]"
              style={{
                backgroundColor: tickColor,
                transform: `translateX(-50%) rotate(${rotationAngle}deg) translateY(-0.625em)`,
              }}
            />
          ))}

            <div className="absolute top-1/2 left-1/2 [transform:translate3d(0,0,0)] [filter:drop-shadow(0.0625em_0.0625em_rgba(0,0,0,0.06))]">
                <div
              className="absolute bottom-[-0.05em] left-[-0.05em] w-[0.1em] h-[0.55em] rounded-[0.1em] origin-[50%_calc(100%-0.05em)] transition-transform duration-[450ms] cubic-bezier(0.58,0,0.42,1.42) z-[3]"
              style={{
                backgroundColor: primaryColor,
                transform:
                  activeSide === "undo"
                    ? "rotate(-360deg)"
                    : activeSide === "redo"
                      ? "rotate(360deg)"
                      : "rotate(0deg)",
              }}
            />
                <div
              className="absolute bottom-[-0.05em] left-[-0.05em] w-[0.1em] h-[0.375em] rounded-[0.1em] origin-[50%_calc(100%-0.05em)] transition-transform duration-[450ms] cubic-bezier(0.58,0,0.42,1.42) z-[3]"
              style={{
                backgroundColor: primaryColor,
                transform:
                  activeSide === "undo"
                    ? "rotate(60deg)"
                    : activeSide === "redo"
                      ? "rotate(120deg)"
                      : "rotate(90deg)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
