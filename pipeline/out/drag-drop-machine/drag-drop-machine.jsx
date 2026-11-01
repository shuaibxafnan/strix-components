"use client";

import { useEffect, useState, useRef } from "react";

export default function DragDropMachine({
  fileBgColor = "from-orange-500 to-amber-600",
  folderBgColor = "from-blue-500 to-indigo-600",
  hintText = "Drag the element to safely process the operation",
  resetDuration = 1200,
  bgColor = "#0c0a09",
  stateLabel = "Machine State:",
  sourceLabel = "Source Asset",
  targetLabel = "Drop Target",
  targetActiveLabel = "Release Item",
  doneLabel = "Processing Done",
  instructionsTitle = "Instructions",
  activeHintText = "Drop to register element actions",
  doneHintText = "✔ Transaction successfully resolved",
  className = "",
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState("idle");
  const [context, setContext] = useState({
    dx: 0,
    dy: 0,
    pointerx: 0,
    pointery: 0,
  });

  const stateRef = useRef(state);
  const contextRef = useRef(context);
  const timerRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
    contextRef.current = context;
  }, [state, context]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (event) => {
      if (stateRef.current.startsWith("dragging")) {
        setContext((prev) => ({
          ...prev,
          dx: event.clientX - prev.pointerx,
          dy: event.clientY - prev.pointery,
        }));
      }
    };

    const handleMouseUp = () => {
      if (stateRef.current === "dragging.inside") {
        setState("dropped");
        timerRef.current = setTimeout(() => {
          setState("idle");
          setContext({ dx: 0, dy: 0, pointerx: 0, pointery: 0 });
        }, resetDuration);
      } else if (stateRef.current === "dragging.outside") {
        setState("idle");
        setContext({ dx: 0, dy: 0, pointerx: 0, pointery: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      clearTimeout(timerRef.current);
    };
  }, [isMounted, resetDuration]);

  const handleFileMouseDown = (event) => {
    if (state !== "idle") return;
    setState("dragging.outside");
    setContext({
      dx: 0,
      dy: 0,
      pointerx: event.clientX,
      pointery: event.clientY,
    });
  };

  const handleFolderMouseEnter = () => {
    if (stateRef.current === "dragging.outside") {
      setState("dragging.inside");
    }
  };

  const handleFolderMouseLeave = () => {
    if (stateRef.current === "dragging.inside") {
      setState("dragging.outside");
    }
  };

  if (!isMounted) return null;

  const isDragging = state.startsWith("dragging");
  const isInside = state === "dragging.inside";
  const isDropped = state === "dropped";

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`w-full h-screen text-stone-200 flex flex-col justify-center items-center select-none antialiased relative overflow-hidden font-sans ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="absolute top-8 left-8 flex items-center gap-3 backdrop-blur-md bg-stone-900/60 border border-stone-800 px-4 py-2 rounded-full shadow-2xl transition-all duration-300">
        <span
          className={`w-2 h-2 rounded-full ${isDropped ? "bg-emerald-500 animate-ping" : isInside ? "bg-amber-400 animate-pulse" : isDragging ? "bg-sky-400 animate-pulse" : "bg-stone-600"}`}
        />
        <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
          {stateLabel}
        </span>
        <span className="font-mono text-xs font-semibold text-stone-100">
          {state}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 z-10 w-full max-w-4xl px-6">
          <div className="flex flex-col items-center gap-4">
          <div
            onMouseDown={handleFileMouseDown}
            style={{
              transform: `translate(${context.dx}px, ${context.dy}px) ${
                isDragging
                  ? "scale(0.9) rotate(-6deg)"
                  : isDropped
                    ? "scale(0)"
                    : "scale(1)"
              }`,
              transition: isDragging
                ? "none"
                : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s",
            }}
            className={`w-36 h-36 rounded-3xl bg-gradient-to-br ${fileBgColor} shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative flex items-center justify-center transition-all group border border-white/10 ${
              isDragging
                ? "cursor-grabbing opacity-90 z-30 pointer-events-none shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                : "cursor-grab hover:scale-105 active:scale-95"
            }`}
          >
                  <div className="absolute inset-0.5 rounded-[22px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-100" />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-16 h-16 fill-white drop-shadow-md"
            >
              <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M6.12,15.5L9.86,19.24L11.28,17.83L8.95,15.5L11.28,13.17L9.86,11.76L6.12,15.5M17.28,15.5L13.54,11.76L12.12,13.17L14.45,15.5L12.12,17.83L13.54,19.24L17.28,15.5Z" />
            </svg>
          </div>
          <span
            className={`text-xs font-mono tracking-wider transition-opacity duration-300 uppercase text-stone-500 ${isDragging ? "opacity-20" : "opacity-100"}`}
          >
            {sourceLabel}
          </span>
        </div>

          <div className="flex flex-col items-center gap-4">
          <div
            onMouseEnter={handleFolderMouseEnter}
            onMouseLeave={handleFolderMouseLeave}
            className={`w-36 h-36 rounded-3xl relative flex items-center justify-center transition-all duration-300 border ${
              isInside
                ? `bg-gradient-to-br ${folderBgColor} scale-110 shadow-[0_0_40px_rgba(59,130,246,0.4)] border-blue-400/50 z-10`
                : isDropped
                  ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  : "bg-stone-900/80 border-stone-800 shadow-xl"
            }`}
          >
                  <div
              className={`absolute inset-0 rounded-3xl transition-opacity duration-300 blur-xl opacity-40 bg-gradient-to-br ${folderBgColor} ${isInside ? "opacity-70" : "opacity-0"}`}
            />

                  <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`w-16 h-16 absolute transition-all duration-300 ${
                isInside || isDropped
                  ? "opacity-0 scale-75 transform"
                  : "opacity-70 fill-stone-400"
              }`}
            >
              <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
            </svg>

                  <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`w-16 h-16 absolute fill-white drop-shadow-md transition-all duration-300 ${
                isInside || isDropped
                  ? "opacity-100 scale-100 transform"
                  : "opacity-0 scale-90"
              }`}
            >
              <path d="M19,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4H10L12,6H19A2,2 0 0,1 21,8H21L4,8V18L6.14,10H23.21L20.93,18.5C20.7,19.37 19.92,20 19,20Z" />
            </svg>
          </div>
          <span
            className={`text-xs font-mono tracking-wider transition-colors duration-300 uppercase ${isInside ? "text-blue-400 font-bold" : isDropped ? "text-emerald-400 font-bold" : "text-stone-500"}`}
          >
            {isDropped
              ? doneLabel
              : isInside
                ? targetActiveLabel
                : targetLabel}
          </span>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full text-center px-4 max-w-sm pointer-events-none">
        <p className="font-mono text-xs text-stone-500 uppercase tracking-[0.2em] mb-2">
          {instructionsTitle}
        </p>
        <p className="text-sm text-stone-400 font-medium transition-all duration-300">
          {isDropped
            ? doneHintText
            : isInside
              ? activeHintText
              : hintText}
        </p>
      </div>
    </div>
  );
}
