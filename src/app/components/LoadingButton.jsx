"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── phase: "idle" | "loading" | "paused" | "completing" | "done" ──────────

const SVG_PERIMETER = 525; // (210 + 60) * 2 - 8 * corner + 2π * corner ≈ 525

// ─── helpers ──────────────────────────────────────────────────────────────

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function rafOver(durationMs, onTick, onDone) {
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / durationMs, 1);
    onTick(p);
    if (p < 1) requestAnimationFrame(frame);
    else onDone?.();
  }
  requestAnimationFrame(frame);
}

// ─── useRAF — starts/stops a loop based on `running` ─────────────────────

function useRAF(callback, running) {
  const cbRef = useRef(callback);
  const idRef = useRef(null);
  cbRef.current = callback;

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(idRef.current);
      return;
    }
    const loop = (ts) => {
      cbRef.current(ts);
      idRef.current = requestAnimationFrame(loop);
    };
    idRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(idRef.current);
  }, [running]);
}

// ─── icons ────────────────────────────────────────────────────────────────

function IconSpinner({ fill }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 3C17.1 3 16.5 3.6 16.5 4.5V8.25C16.5 9.15 17.1 9.75 18 9.75C18.9 9.75 19.5 9.15 19.5 8.25V4.5C19.5 3.6 18.9 3 18 3Z"
        fill={fill}
      />
      <path
        d="M10.0504 12.1504C10.3504 12.4504 10.8004 12.6004 11.1004 12.6004C11.4004 12.6004 11.8504 12.4504 12.1504 12.1504C12.7504 11.5504 12.7504 10.6504 12.1504 10.0504L9.45039 7.35039C8.85039 6.75039 7.95039 6.75039 7.35039 7.35039C6.75039 7.95039 6.75039 8.85039 7.35039 9.45039L10.0504 12.1504Z"
        fill={fill}
      />
      <path
        d="M9.75 18C9.75 17.1 9.15 16.5 8.25 16.5H4.5C3.6 16.5 3 17.1 3 18C3 18.9 3.6 19.5 4.5 19.5H8.25C9 19.5 9.75 18.9 9.75 18Z"
        fill={fill}
      />
      <path
        d="M10.0508 23.8504L7.50078 26.4004C6.90078 27.0004 6.90078 27.9004 7.50078 28.5004C7.80078 28.8004 8.25078 28.9504 8.55078 28.9504C8.85078 28.9504 9.30078 28.8004 9.60078 28.5004L12.1508 25.9504C12.7508 25.3504 12.7508 24.4504 12.1508 23.8504C11.5508 23.2504 10.6508 23.2504 10.0508 23.8504Z"
        fill={fill}
      />
      <path
        d="M18 26.25C17.1 26.25 16.5 26.85 16.5 27.75V31.5C16.5 32.4 17.1 33 18 33C18.9 33 19.5 32.4 19.5 31.5V27.75C19.5 27 18.9 26.25 18 26.25Z"
        fill={fill}
      />
      <path
        d="M25.9504 23.8504C25.3504 23.2504 24.4504 23.2504 23.8504 23.8504C23.2504 24.4504 23.2504 25.3504 23.8504 25.9504L26.4004 28.5004C26.7004 28.8004 27.1504 28.9504 27.4504 28.9504C27.7504 28.9504 28.2004 28.8004 28.5004 28.5004C29.1004 27.9004 29.1004 27.0004 28.5004 26.4004L25.9504 23.8504Z"
        fill={fill}
      />
      <path
        d="M31.5 16.5H27.75C26.85 16.5 26.25 17.1 26.25 18C26.25 18.9 26.85 19.5 27.75 19.5H31.5C32.4 19.5 33 18.9 33 18C33 17.1 32.4 16.5 31.5 16.5Z"
        fill={fill}
      />
      <path
        d="M24.9004 12.5998C25.3504 12.5998 25.6504 12.4498 25.9504 12.1498L28.5004 9.5998C29.1004 8.9998 29.1004 8.0998 28.5004 7.4998C27.9004 6.8998 27.0004 6.8998 26.4004 7.4998L23.8504 10.0498C23.2504 10.6498 23.2504 11.5498 23.8504 12.1498C24.1504 12.4498 24.6004 12.5998 24.9004 12.5998Z"
        fill={fill}
      />
    </svg>
  );
}

function IconPause({ fill }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25 6C6.97843 6 6 6.97843 6 8.25V27.75C6 29.0216 6.97843 30 8.25 30H10.65C11.7358 30 12.7805 29.0469 12.9 27.8353V8.25C12.9 6.97843 11.9216 6 10.65 6H8.25ZM3 8.25C3 5.32157 5.32157 3 8.25 3H10.65C13.5784 3 15.9 5.32157 15.9 8.25V27.9C15.9 27.9384 15.8985 27.9768 15.8956 28.015C15.6906 30.6796 13.4492 33 10.65 33H8.25C5.32157 33 3 30.6784 3 27.75V8.25Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.3496 6C24.078 6 23.0996 6.97843 23.0996 8.25V27.75C23.0996 29.0216 24.078 30 25.3496 30H27.7496C29.0613 30 29.9996 28.982 29.9996 27.9V8.25C29.9996 6.97843 29.0212 6 27.7496 6H25.3496ZM20.0996 8.25C20.0996 5.32157 22.4212 3 25.3496 3H27.7496C30.678 3 32.9996 5.32157 32.9996 8.25V27.9C32.9996 30.718 30.6379 33 27.7496 33H25.3496C22.4212 33 20.0996 30.6784 20.0996 27.75V8.25Z"
        fill={fill}
      />
    </svg>
  );
}

function IconPlay({ fill }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 7.33761C3 2.58639 8.08368 0.177285 12.0217 2.27008C12.0446 2.28222 12.0671 2.29495 12.0893 2.30826L30.0453 13.0771C33.9849 15.2998 33.9849 20.6354 30.0453 22.8581L12.0893 33.627L12.0701 33.6383C8.06754 35.9588 3 33.3067 3 28.7474V7.33761ZM10.5822 4.90258C8.33198 3.73209 6 5.21176 6 7.33761V28.7474C6 30.7729 8.36369 32.3115 10.5566 31.048L28.5205 20.2745C28.5334 20.2667 28.5465 20.2591 28.5597 20.2518C30.4801 19.1775 30.4801 16.7578 28.5597 15.6835C28.5521 15.6792 28.5445 15.6749 28.537 15.6705C28.5315 15.6673 28.526 15.6641 28.5205 15.6608L10.5822 4.90258Z"
        fill={fill}
      />
    </svg>
  );
}

function IconReset() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

// ─── Checkmarks — progress1/2 are 0→1 per tick ────────────────────────────

function IconDoubleCheck({ progress1, progress2 }) {
  return (
    <svg viewBox="0 0 52.71 28.57" className="w-10 h-5" aria-hidden="true">
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="52"
        strokeDashoffset={52 * (1 - progress1)}
        opacity={progress1 > 0 ? 1 : 0}
        d="M2,12.42,16.14,26.57,34.71,2"
      />
      <path
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="52"
        strokeDashoffset={52 * (1 - progress2)}
        opacity={progress2 > 0 ? 1 : 0}
        d="M18,12.42,32.14,26.57,50.71,2"
      />
    </svg>
  );
}

// ─── useLoadingSequence ────────────────────────────────────────────────────

function useLoadingSequence({ durationMs, startDelay, onComplete }) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0); // 0–100 integer
  const [spinAngle, setSpinAngle] = useState(0); // degrees, continuous
  const [tick1, setTick1] = useState(0); // 0–1
  const [tick2, setTick2] = useState(0); // 0–1
  const [doneSlide, setDoneSlide] = useState(0); // 0–1 (0 = hidden below, 1 = in place)

  const startTsRef = useRef(null); // RAF timestamp when current run began
  const accumulatedRef = useRef(0); // ms elapsed before last pause
  const completedRef = useRef(false);

  // Spin loop — independent, runs only while loading
  useRAF(() => {
    setSpinAngle((a) => (a + 1.8) % 360);
  }, phase === "loading");

  // Progress loop
  useRAF((ts) => {
    if (startTsRef.current === null) startTsRef.current = ts;
    const elapsed = accumulatedRef.current + (ts - startTsRef.current);
    const raw = Math.min(elapsed / durationMs, 1);

    setProgress(Math.round(easeInOutCubic(raw) * 100));

    if (raw >= 1 && !completedRef.current) {
      completedRef.current = true;
      setProgress(100);
      setPhase("completing");
    }
  }, phase === "loading");

  // Completion sequence — pure setTimeout + RAF, no libraries
  useEffect(() => {
    if (phase !== "completing") return;
    const timers = [];

    timers.push(setTimeout(() => rafOver(500, (p) => setTick1(p)), 1000));
    timers.push(setTimeout(() => rafOver(500, (p) => setTick2(p)), 1250));
    timers.push(
      setTimeout(
        () => rafOver(1000, (p) => setDoneSlide(easeOutCubic(p))),
        1250,
      ),
    );
    timers.push(
      setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 2500),
    );

    return () => timers.forEach(clearTimeout);
  }, [phase, onComplete]);

  const start = useCallback(() => {
    if (phase !== "idle") return;
    completedRef.current = false;
    accumulatedRef.current = 0;
    startTsRef.current = null;
    const id = setTimeout(() => setPhase("loading"), startDelay);
    return () => clearTimeout(id);
  }, [phase, startDelay]);

  // restart: reset all state then immediately kick off loading (bypasses stale `phase` in start())
  const restart = useCallback(() => {
    completedRef.current = false;
    accumulatedRef.current = 0;
    startTsRef.current = null;
    setProgress(0);
    setSpinAngle(0);
    setTick1(0);
    setTick2(0);
    setDoneSlide(0);
    setPhase("idle");
    // Use a microtask so state flushes before we switch to "loading"
    Promise.resolve().then(() => {
      setTimeout(() => setPhase("loading"), startDelay);
    });
  }, [startDelay]);

  const togglePause = useCallback(() => {
    if (phase === "loading") {
      accumulatedRef.current +=
        performance.now() - (startTsRef.current ?? performance.now());
      startTsRef.current = null;
      setPhase("paused");
    } else if (phase === "paused") {
      startTsRef.current = null;
      setPhase("loading");
    }
  }, [phase]);

  const reset = useCallback(() => {
    completedRef.current = false;
    accumulatedRef.current = 0;
    startTsRef.current = null;
    setPhase("idle");
    setProgress(0);
    setSpinAngle(0);
    setTick1(0);
    setTick2(0);
    setDoneSlide(0);
  }, []);

  return {
    phase,
    progress,
    spinAngle,
    tick1,
    tick2,
    doneSlide,
    start,
    restart,
    togglePause,
    reset,
  };
}

// ─── LoadingButton ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// durationMs   number   5500      Total loading duration in milliseconds
// startDelay   number   1000      Delay (ms) before progress begins on mount
// autoStart    boolean  true      Auto-start on mount; false = call start() manually
// onComplete   fn       —         Called once when the done phase is reached
// onReset      fn       —         Called after a reset
// accentColor  string   #1578ff   Border stroke, spinner, play icon, label
// pauseColor   string   #ff542b   Pause icon color
// doneLabel    string   "Done"    Text shown in the completed state
// className    string   ""        Extra classes forwarded to the root element
// ──────────────────────────────────────────────────────────────────────────

export default function LoadingButton({
  durationMs = 5500,
  startDelay = 1000,
  autoStart = true,
  onComplete,
  onReset,
  accentColor = "#1578ff",
  pauseColor = "#ff542b",
  doneLabel = "Done",
  className = "",
}) {
  const {
    phase,
    progress,
    spinAngle,
    tick1,
    tick2,
    doneSlide,
    start,
    restart,
    togglePause,
    reset,
  } = useLoadingSequence({ durationMs, startDelay, onComplete });

  useEffect(() => {
    if (autoStart) return start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    onReset?.();
    restart();
  };

  const isActive = phase === "loading" || phase === "paused";
  const isDone = phase === "done" || phase === "completing";
  const dashOffset = SVG_PERIMETER - (progress / 100) * SVG_PERIMETER;

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center bg-[#f8f7fc] ${className}`}
    >
      <div
        className="relative select-none"
        style={{ width: 212, height: 62 }}
        role="status"
        aria-label={
          isDone ? doneLabel : isActive ? `Loading ${progress}%` : "Ready"
        }
      >
        {/* Base fill rect — faint, brightens on hover */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.15] hover:opacity-25 transition-opacity duration-[250ms]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            rx="10"
            ry="10"
            width="210"
            height="60"
            stroke={accentColor}
            strokeWidth="2"
            fill={isDone ? accentColor : "#fff"}
            className="transition-[fill] duration-500 ease-in"
          />
        </svg>

        {/* Border stroke that draws around the rect as progress increases */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            rx="10"
            ry="10"
            width="210"
            height="60"
            fill={isDone ? accentColor : "none"}
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={SVG_PERIMETER}
            strokeDashoffset={isDone ? 0 : dashOffset}
            className="transition-[fill] duration-500 ease-in"
          />
        </svg>

        {/* ── Loading / paused view ── */}
        {!isDone && (
          <div
            className="absolute inset-0 flex items-center justify-evenly"
            style={{ color: accentColor }}
          >
            {/* Spinner + percentage */}
            <div className="flex items-center">
              {/* rotate and opacity are JS-driven per-frame — must be inline */}
              <span
                className="mr-4 transition-opacity duration-[750ms]"
                style={{
                  transform: `rotate(${spinAngle}deg)`,
                  opacity: isActive ? 1 : 0,
                }}
              >
                <IconSpinner fill={accentColor} />
              </span>
              <span className="w-12 text-right text-sm font-medium tabular-nums font-[\'Plus_Jakarta_Sans\',sans-serif]">
                {progress} %
              </span>
            </div>

            {/* Divider */}
            <div
              className="self-stretch w-px my-3"
              style={{ background: `${accentColor}44` }}
            />

            {/* Pause / play toggle */}
            <button
              onClick={togglePause}
              aria-label={phase === "loading" ? "Pause" : "Resume"}
              className="relative flex items-center h-5 overflow-hidden px-4 border-none bg-transparent cursor-pointer"
            >
              {/* Pause slides out upward when paused */}
              <span
                className="flex items-center transition-[transform,opacity] duration-[250ms]"
                style={{
                  transform: `translateY(${phase === "paused" ? -40 : 0}px)`,
                  opacity: phase === "paused" ? 0 : 0.5,
                }}
              >
                <IconPause fill={pauseColor} />
              </span>

              {/* Play slides in from below when paused */}
              <span
                className="absolute flex items-center transition-[transform,opacity] duration-[250ms]"
                style={{
                  transform: `translateY(${phase === "paused" ? 0 : 40}px)`,
                  opacity: phase === "paused" ? 0.5 : 0,
                }}
              >
                <IconPlay fill={accentColor} />
              </span>
            </button>
          </div>
        )}

        {/* ── Done view ── */}
        {isDone && (
          <div className="absolute inset-0 flex items-center justify-around text-white">
            {/* Double checkmark */}
            <div className="flex items-center pr-4 mr-2 border-r border-white/30">
              <IconDoubleCheck progress1={tick1} progress2={tick2} />
            </div>

            {/* Done label — slides up from below via JS-driven value */}
            <span
              className="inline-block text-sm font-medium text-white/95 font-[\'Plus_Jakarta_Sans\',sans-serif]"
              style={{
                opacity: doneSlide,
                transform: `translateY(${(1 - doneSlide) * 25}px)`,
              }}
            >
              {doneLabel}
            </span>

            {/* Reset */}
            <button
              onClick={handleReset}
              aria-label="Reset"
              className="ml-2 opacity-40 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer text-white"
            >
              <IconReset />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
