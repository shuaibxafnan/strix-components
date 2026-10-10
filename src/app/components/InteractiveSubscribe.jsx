"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveSubscribe({
  accentColor = "#FF79F1",
  characterFill = "#BD00A9",
  skinColor = "#FFDBE4",
  successBg = "#29D259",
  sensitivity = 400,
  maxPupilMoveX = 16,
  maxPupilMoveY = 20,
}) {
  // ─── State Management ──────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // ─── Ref Anchors ───────────────────────────────────────────────────────────
  const trackRef = useRef(null);
  const chloeRef = useRef(null);
  const inputRef = useRef(null);
  const successBoxRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // ─── Structural Coordinate Geometry ────────────────────────────────────────
  const dragPlane = useRef({
    startPointerX: 0,
    startOffset: 0,
    prevOffset: 0,
    maxOffset: 0,
    velocity: 0,
    lastTime: 0,
    lastPointerX: null,
    lastPointerY: null,
  });

  const EYE_TOP_FROM_CHLOE = 95;
  const EYE_RADIUS = 22;
  const LEFT_BASE_X = -40;
  const RIGHT_BASE_X = 40;
  const LEFT_SCALE_X = 0.95;
  const RIGHT_SCALE_X = 1.05;

  // ─── Mathematical Utility Vectors ──────────────────────────────────────────
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const rubberBand = (over, limit = 120) =>
    limit * (1 - 1 / (over / limit + 1));

  const ellipseClamp = (dx, dy, rx, ry) => {
    const nx = dx / rx;
    const ny = dy / ry;
    const d = Math.hypot(nx, ny);
    if (d <= 1 || d === 0) return [dx, dy];
    return [(nx / d) * rx, (ny / d) * ry];
  };

  // ─── Confetti Module Loader ───────────────────────────────────────────────
  const burstAtElement = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    import("https://esm.sh/canvas-confetti")
      .then((m) => {
        const confetti = m.default;
        confetti({
          particleCount: 90,
          spread: 70,
          startVelocity: 40,
          origin: { x, y },
        });
        confetti({
          particleCount: 50,
          spread: 100,
          startVelocity: 25,
          decay: 0.9,
          scalar: 0.9,
          origin: { x, y },
        });
      })
      .catch(() => null);
  };

  // ─── Layout Coordinate Calculation Engine ──────────────────────────────────
  const computeMaxOffset = () => {
    if (!trackRef.current || !chloeRef.current) return;
    const trackW = trackRef.current.clientWidth;
    const chloeW = chloeRef.current.getBoundingClientRect().width || 232;
    const maxVal = Math.max(0, trackW - chloeW);
    dragPlane.current.maxOffset = maxVal;
    return maxVal;
  };

  const getCaretPoint = () => {
    if (!inputRef.current) return { x: 0, y: 0 };
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    const cs = window.getComputedStyle(input);

    const canvas = document.createElement("canvas");
    const measureCtx = canvas.getContext("2d");
    measureCtx.font = `${cs.fontWeight || 400} ${cs.fontSize || "14px"} ${cs.fontFamily || "Arial,sans-serif"}`;

    const selStart = input.selectionStart ?? input.value.length;
    const before = input.value.slice(0, selStart);
    const w = measureCtx.measureText(before).width;

    const padL = parseFloat(cs.paddingLeft) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const innerW = rect.width - padL - padR;
    const xInside = Math.min(w, innerW) - input.scrollLeft;

    return {
      x: rect.left + padL + Math.max(0, xInside),
      y: rect.top + rect.height / 2,
    };
  };

  const lookAt = (targetX, targetY) => {
    if (!chloeRef.current || !leftEyeRef.current || !rightEyeRef.current)
      return;
    const r = chloeRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + EYE_TOP_FROM_CHLOE + EYE_RADIUS;

    const computeEyeTransform = (baseX, scaleX) => {
      const dx = targetX - (cx + baseX);
      const dy = targetY - cy;
      const dist = Math.hypot(dx, dy);
      const p = Math.min(1, dist / sensitivity);
      const ang = Math.atan2(dy, dx);

      let mx = Math.cos(ang) * maxPupilMoveX * p * scaleX;
      let my = Math.sin(ang) * maxPupilMoveY * p;
      [mx, my] = ellipseClamp(mx, my, maxPupilMoveX, maxPupilMoveY);

      return `translateX(-50%) translateX(${baseX}px) translate(${mx}px, ${my}px)`;
    };

    leftEyeRef.current.style.transform = computeEyeTransform(
      LEFT_BASE_X,
      LEFT_SCALE_X,
    );
    rightEyeRef.current.style.transform = computeEyeTransform(
      RIGHT_BASE_X,
      RIGHT_SCALE_X,
    );
  };

  const neutralEyes = () => {
    if (!leftEyeRef.current || !rightEyeRef.current) return;
    leftEyeRef.current.style.transform = `translateX(-50%) translateX(${LEFT_BASE_X}px)`;
    rightEyeRef.current.style.transform = `translateX(-50%) translateX(${RIGHT_BASE_X}px)`;
  };

  const syncEyeTracking = () => {
    if (document.activeElement === inputRef.current) {
      requestAnimationFrame(() => {
        const { x, y } = getCaretPoint();
        lookAt(x, y);
      });
    } else if (dragPlane.current.lastPointerX !== null) {
      lookAt(dragPlane.current.lastPointerX, dragPlane.current.lastPointerY);
    } else {
      neutralEyes();
    }
  };

  // ─── Event Handlers ────────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    e.preventDefault();
    if (!chloeRef.current) return;

    setIsDragging(true);
    chloeRef.current.setPointerCapture?.(e.pointerId);
    chloeRef.current.style.transition = "none";

    dragPlane.current.startPointerX = e.clientX;
    dragPlane.current.startOffset = dragOffset;
    dragPlane.current.prevOffset = dragOffset;
    dragPlane.current.velocity = 0;
    dragPlane.current.lastTime = performance.now();
  };

  const onPointerMove = (e) => {
    if (!setIsDragging || !isDragging) return;

    const now = performance.now();
    const dt = Math.max(1, now - dragPlane.current.lastTime);
    const dx = e.clientX - dragPlane.current.startPointerX;

    let desired = dragPlane.current.startOffset + dx;
    if (desired < 0) {
      desired = -rubberBand(-desired);
    } else if (desired > dragPlane.current.maxOffset) {
      desired =
        dragPlane.current.maxOffset +
        rubberBand(desired - dragPlane.current.maxOffset);
    }

    dragPlane.current.velocity = (desired - dragPlane.current.prevOffset) / dt;
    dragPlane.current.prevOffset = desired;
    dragPlane.current.lastTime = now;

    setDragOffset(desired);
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    chloeRef.current?.releasePointerCapture?.(e.pointerId);

    const current = dragOffset;
    const bounds = dragPlane.current.maxOffset;
    const clamped = clamp(current, 0, bounds);

    if (current < 0 || current > bounds) {
      const dist = Math.abs(current - clamped);
      const dur = Math.min(600, 260 + dist * 0.9);
      if (chloeRef.current) {
        chloeRef.current.style.transition = `transform ${dur}ms cubic-bezier(.34,1.56,.64,1)`;
      }
      setDragOffset(clamped);
      return;
    }

    const inertia = dragPlane.current.velocity * 160;
    const projected = clamp(current + inertia, 0, bounds);
    const dur = Math.min(400, 180 + Math.abs(inertia) * 0.6);

    if (chloeRef.current) {
      chloeRef.current.style.transition = `transform ${dur}ms cubic-bezier(.22,.61,.36,1)`;
    }
    setDragOffset(projected);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValid = inputRef.current?.checkValidity();

    if (!isValid) {
      setHasError(true);
      inputRef.current?.focus();
      return;
    }

    setHasError(false);
    setIsSuccess(true);
    setTimeout(() => burstAtElement(successBoxRef.current), 50);
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setIsSuccess(false);
    if (e.target.value.includes("@")) {
      setHasError(false);
    }
  };

  // ─── Lifecycle Synchronizer Hooks ──────────────────────────────────────────
  useEffect(() => {
    const limits = computeMaxOffset();
    setDragOffset(Math.round(limits / 2));

    const handleGlobalPointerMove = (e) => {
      dragPlane.current.lastPointerX = e.clientX;
      dragPlane.current.lastPointerY = e.clientY;
      if (document.activeElement !== inputRef.current) {
        lookAt(e.clientX, e.clientY);
      }
    };

    const handleLayoutRestructure = () => {
      computeMaxOffset();
      syncEyeTracking();
    };

    document.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("resize", handleLayoutRestructure);
    window.addEventListener("scroll", handleLayoutRestructure);

    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("resize", handleLayoutRestructure);
      window.removeEventListener("scroll", handleLayoutRestructure);
    };
  }, []);

  useEffect(() => {
    syncEyeTracking();
  }, [dragOffset, isFocused, email]);

  return (
    /* Full Viewport Layout Centering Context */
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#050507] p-4 box-border overflow-hidden">
      {/* Premium Minimal Interactive Shell Card */}
      <div className="relative select-none text-neutral-200 font-sans antialiased w-full max-w-md p-7 rounded-[28px] bg-gradient-to-b from-[#0A0A0E] to-[#08080A] border border-neutral-900/80 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.9)] overflow-visible">
        {/* Subtle dynamic glow matrix radiating behind header layer */}
        <div
          style={{ backgroundColor: hasError ? "#EF4444" : accentColor }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 blur-[80px] opacity-[0.08] transition-colors duration-500 pointer-events-none"
        />

        {/* Header Layout Module */}
        <div className="flex justify-between items-center mb-6 px-0.5">
          <div>
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
              Join Orbit
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Drag to calibrate track position
            </p>
          </div>
          <div className="h-5 px-2 rounded-full bg-neutral-950 border border-neutral-900 flex items-center gap-1.5 text-[9px] font-medium tracking-wider text-neutral-400 uppercase">
            <span
              className={`w-1 h-1 rounded-full ${isFocused ? "animate-pulse" : ""}`}
              style={{ backgroundColor: accentColor }}
            />
            Active
          </div>
        </div>

        {/* Character Slider Workspace Track */}
        <div
          ref={trackRef}
          className="w-full h-[170px] relative rounded-2xl bg-[#070709] border border-neutral-900/50 overflow-visible mb-5 shadow-inner"
        >
          <div
            ref={chloeRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              transform: `translateY(24px) translateX(${Math.round(dragOffset)}px)`,
              "--chx": `${Math.round(dragOffset)}px`,
            }}
            className={`absolute top-0 left-0 inline-block touch-none select-none z-10 transition-transform duration-[220ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
              isDragging ? "cursor-grabbing scale-[1.02]" : "cursor-grab"
            }`}
            aria-label="Character viewport node"
          >
            {/* Curved Validation Error Overlay */}
            <svg
              className={`absolute top-[-38%] left-0 w-full pointer-events-none transition-all duration-300 ${
                hasError
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-1"
              }`}
              viewBox="0 0 500 500"
            >
              <path
                id="curve"
                fill="transparent"
                d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
              />
              <text
                className="text-[30px] font-bold tracking-[0.1em] uppercase"
                fill="#EF4444"
                textAnchor="middle"
              >
                <textPath href="#curve" startOffset="50%">
                  Invalid Email Target
                </textPath>
              </text>
            </svg>

            {/* Sclera Eyewhites Structural Mask */}
            <div className="absolute top-[83px] left-1/2 -translate-x-1/2 z-0 overflow-hidden pointer-events-none">
              <svg
                width="118"
                height="57"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="99" cy="28" fill="#FFFFFF" rx="19" ry="28" />
                <ellipse cx="19" cy="28" fill="#FFFFFF" rx="19" ry="28" />
              </svg>
            </div>

            {/* Left Cornea Pupil Vector */}
            <div
              ref={leftEyeRef}
              className="absolute top-[95px] left-1/2 z-[1] will-change-transform pointer-events-none transition-transform duration-[120ms] ease-[cubic-bezier(.22,.61,.36,1)]"
              style={{
                transform: `translateX(-50%) translateX(${LEFT_BASE_X}px)`,
              }}
            >
              <svg
                width="44"
                height="44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="20" fill="url(#left-gradient)" />
                <circle cx="22" cy="11" r="6" fill="#FCF5F3" />
                <circle cx="25" cy="20" r="3" fill="#FCF5F3" />
                <defs>
                  <linearGradient
                    id="left-gradient"
                    x1="0"
                    x2="35"
                    y1="17.5"
                    y2="17.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset=".317" stopColor={characterFill} />
                    <stop offset="1" stopColor="#1E001A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Right Cornea Pupil Vector */}
            <div
              ref={rightEyeRef}
              className="absolute top-[95px] left-1/2 z-[1] will-change-transform pointer-events-none transition-transform duration-[120ms] ease-[cubic-bezier(.22,.61,.36,1)]"
              style={{
                transform: `translateX(-50%) translateX(${RIGHT_BASE_X}px)`,
              }}
            >
              <svg
                width="44"
                height="44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="20" fill="url(#right-gradient)" />
                <circle cx="23" cy="11" r="6" fill="#FCF5F3" />
                <circle cx="26" cy="20" r="3" fill="#FCF5F3" />
                <defs>
                  <linearGradient
                    id="right-gradient"
                    x1="0"
                    x2="35"
                    y1="17.5"
                    y2="17.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset=".317" stopColor={characterFill} />
                    <stop offset="1" stopColor="#1E001A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Face Mesh Mask Geometry Overlay */}
            <div className="relative z-[2] pointer-events-none">
              <svg
                width="232"
                height="172"
                fill="none"
                viewBox="0 0 232 172"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-a"
                    x1="117.999"
                    x2="118.004"
                    y1="0"
                    y2="168"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFE5EB" />
                    <stop offset=".2" stopColor="#FFAEC8" />
                    <stop offset=".5" stopColor="#E8539B" />
                    <stop offset=".75" stopColor="#A31C77" />
                    <stop offset="1" stopColor="#4A0648" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#gradient-a)"
                  d="M115.972 0c18.723 0 36.111 5.717 50.512 15.501 8.836-12.564 25.962-16.522 39.52-8.694 14.349 8.284 19.264 26.631 10.98 40.98A29.875 29.875 0 0 1 201.197 61c3.096 9.1 4.775 18.853 4.775 29 0 49.706-40.294 78-90 78-49.705 0-90-28.294-90-78 0-11.353 2.103-22.215 5.939-32.218a29.86 29.86 0 0 1-12.888-11.994c-8.284-14.349-3.368-32.696 10.98-40.98 13.405-7.74 30.3-3.958 39.219 8.272C82.847 4.78 98.852 0 115.972 0ZM75.023 82.807c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Zm80 0c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Z"
                />
                <path
                  fill={skinColor}
                  d="M115.023 43.807c40.87 0 74 29.001 74 64.776 0 35.775-33.131 55.224-74 55.224s-74-19.449-74-55.224c0-35.775 33.131-64.776 74-64.776Zm-40 39c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Zm80 0c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Z"
                />
                <path
                  fill={characterFill}
                  d="M75.504 75.077c-2.605-.046-8.154 1.337-12.012 3.029-.954.418-.556 1.312.467 1.114 12.928-2.505 20.976 1.09 20.976 1.09.985.357 1.706-.947.879-1.591l-.349-.271c-2.507-2.534-6.355-3.308-9.962-3.371ZM151.051 75.077c2.605-.046 8.153 1.337 12.012 3.029.954.418.556 1.312-.467 1.114-12.928-2.505-20.976 1.09-20.976 1.09-.985.357-1.706-.947-.879-1.591l.348-.271c2.507-2.534 6.355-3.308 9.962-3.371Z"
                />
                <path
                  stroke="#EFC6B8"
                  strokeWidth="2"
                  d="M115 45c40.442 0 73 28.789 73 64.04 0 17.605-8.098 31.049-21.242 40.128C153.58 158.271 135.296 163 115 163c-20.296 0-38.58-4.729-51.758-13.832C50.1 140.089 42 126.645 42 109.04 42 73.789 74.558 45 115 45Z"
                />
                <ellipse
                  cx="155.023"
                  cy="110.807"
                  stroke={characterFill}
                  strokeWidth="2"
                  rx="19"
                  ry="28"
                />
                <ellipse
                  cx="75.023"
                  cy="110.807"
                  stroke={characterFill}
                  strokeWidth="2"
                  rx="19"
                  ry="28"
                />
                <path
                  fill={characterFill}
                  stroke={characterFill}
                  d="M118 121.5c1.644 0 3.036.174 4.005.697.473.256.839.591 1.09 1.029.251.439.405 1.014.405 1.774 0 .663-.296 1.333-.804 1.991-.506.657-1.196 1.265-1.912 1.79a4.696 4.696 0 0 1-5.568 0c-.716-.525-1.406-1.133-1.912-1.79-.508-.658-.804-1.328-.804-1.991 0-.76.154-1.335.405-1.774.251-.438.617-.773 1.09-1.029.969-.523 2.361-.697 4.005-.697Z"
                />
                <ellipse cx="120" cy="124.501" fill="#FCF5F3" rx="2" ry="1.5" />

                {hasError ? (
                  <ellipse
                    cx="118"
                    cy="147.5"
                    rx="6"
                    ry="10"
                    fill={characterFill}
                  />
                ) : (
                  <path
                    stroke={characterFill}
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M130.283 141.002c-3.315 2.561-7.811 4-12.5 4-4.688 0-9.185-1.439-12.5-4M132.863 141.968l-.879-.424a5.134 5.134 0 0 1-2.467-2.543M103 142.299l.831-.513A5.137 5.137 0 0 0 106.02 139"
                  />
                )}

                <path
                  fill={skinColor}
                  stroke="#EBB6A5"
                  strokeWidth="2"
                  d="M17.105 139h24.98l5.031 5.031a53.938 53.938 0 0 0 6.972 5.881l5.77 4.088H31.532v2.169c0 6.817-2.99 12.999-9.164 14.242-1.919.387-3.769.589-5.262.589C8.204 171 1 163.831 1 155c0-8.693 6.981-15.776 15.69-15.995l.415-.005ZM214.895 139h-24.981l-5.03 5.031a53.988 53.988 0 0 1-6.972 5.881l-5.77 4.088h28.326v2.169c0 6.817 2.99 12.999 9.164 14.242 1.919.387 3.769.589 5.263.589 8.9 0 16.105-7.169 16.105-16 0-8.693-6.981-15.776-15.689-15.995l-.416-.005Z"
                />
                <path
                  fill="#FFFFFF"
                  d="M226.009 149.937c1.616 3.555 1.245 7.201-.829 8.144-2.073.943-1.31-2.882-2.926-6.437s-5-5.494-2.926-6.437c2.074-.943 5.065 1.175 6.681 4.73ZM27.603 149.937c1.616 3.555 1.245 7.201-.829 8.144-2.074.943-1.31-2.882-2.926-6.437s-5-5.494-2.926-6.437c2.073-.943 5.065 1.175 6.68 4.73Z"
                />
                <path
                  fill="#FFFFFF"
                  d="M117.5 31c27.062 0 46.5 13.773 46.5 13.773 0 2.45-19.438-9.273-46.5-9.273S71.5 46 66 44.773C66 44.773 90.438 31 117.5 31Z"
                  opacity=".4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Subscription Action Form Module */}
        {!isSuccess ? (
          <form
            onSubmit={handleFormSubmit}
            noValidate
            className="relative w-full"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSelect={syncEyeTracking}
                onKeyUp={syncEyeTracking}
                onKeyDown={syncEyeTracking}
                onMouseUp={syncEyeTracking}
                placeholder="name@domain.com"
                required
                style={{
                  borderColor: hasError ? "#EF4444" : undefined,
                  boxShadow: hasError ? "0 0 0 1px #EF4444" : undefined,
                  "--accent-focus": accentColor,
                }}
                className="w-full h-11 pl-4 pr-28 rounded-xl border border-neutral-900 bg-[#0C0C10] text-white text-xs outline-none transition-all duration-150 placeholder:text-neutral-700 font-normal focus:border-[var(--accent-focus)] focus:bg-[#101015]"
              />

              <button
                type="submit"
                style={{
                  backgroundColor: isFocused ? accentColor : "#FFFFFF",
                  color: "#000000",
                }}
                className="absolute right-1 top-1 h-9 px-4 rounded-lg font-semibold text-[11px] transition-all duration-200 active:scale-[0.96] hover:opacity-90 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </form>
        ) : (
          /* Form Submission Success Banner */
          <div
            ref={successBoxRef}
            role="button"
            tabIndex={0}
            onClick={() => burstAtElement(successBoxRef.current)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                burstAtElement(successBoxRef.current);
              }
            }}
            style={{ borderColor: `${successBg}25`, color: successBg }}
            className="w-full h-11 rounded-xl border bg-neutral-950/40 text-[11px] font-semibold flex items-center justify-center text-center cursor-pointer transition-all duration-300 animate-in fade-in-50 zoom-in-95"
          >
            <span className="flex items-center gap-2 tracking-widest uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: successBg }}
              />
              Access Granted
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
