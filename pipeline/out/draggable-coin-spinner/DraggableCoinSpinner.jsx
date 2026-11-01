"use client";

import { useEffect, useRef, useState } from "react";

export default function DraggableCoinSpinner({
  bgColor = "#131318",
  description = "Drag horizontally to spin the coin",

  frameBaseUrl = "https://cerpow.github.io/cerpow-img/coin/",
  frameExtension = ".png",
  framePad = 4,
  frameCount = 260,
  fps = 100,
  autoPlayIntervalMs = 20,
  canvasSize = 600,
  coinSize = "3em",
  canvasMarginTop = "0em",

  enableInertia = true,
  throwResistance = 2200,
  dragResistance = 0.6,
  mobileThrowResistance = 1800,
  mobileDragResistance = 0.42,

  descriptionColor = "rgba(114, 119, 128, 0.8)",
  selectionColor = "rgba(0, 178, 200, 0.57)",
  mainFontSize = "clamp(5.4375rem, 1.2946rem + 20.7143vw, 9.0625rem)",
  className = "",
}) {
  const coinRef = useRef(null);
  const canvasRef = useRef(null);

  const proxyRef = useRef(null);

  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const newFrameRef = useRef(0);
  const rafRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const draggableRef = useRef(null);
  const gsapRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    const resetWithinBounds = (frame) => {
      const value = frame % frameCount;
      return value < 0 ? Math.floor(frameCount + value) : Math.floor(value);
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const canvas = canvasRef.current;
      const ctx = canvas && canvas.getContext("2d");
      if (!ctx) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      if (elapsed > 1000 / fps) {
        startTimeRef.current = now - (elapsed % 1000) / fps;

        if (currentFrameRef.current !== newFrameRef.current) {
          const img = imagesRef.current[currentFrameRef.current];
          if (img) {

            const s = canvasSize / 600;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
              img,
              canvas.width * 0.5 - 210 * s,
              0,
              canvas.width - 200 * s,
              canvas.height - 200 * s,
            );
          }
          newFrameRef.current = currentFrameRef.current;
        }
      }
    };

    const preloadImages = (cb) => {
      let settled = 0;
      const total = frameCount + 1;
      const done = () => {
        settled += 1;
        if (settled === total && !cancelled) cb();
      };
      for (let i = 0; i < total; i++) {
        const img = new Image();
        img.onload = done;
        img.onerror = done;
        img.src = `${frameBaseUrl}${String(i).padStart(
          framePad,
          "0",
        )}${frameExtension}`;
        imagesRef.current[i] = img;
      }
    };

    const autoPlay = () => {
      const gsap = gsapRef.current;
      if (!gsap || !proxyRef.current) return;

      if (draggableRef.current) {
        draggableRef.current.kill();
        gsap.set(proxyRef.current, { x: 0 });
        draggableRef.current.enable();
      }
      clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        currentFrameRef.current = resetWithinBounds(
          currentFrameRef.current + 1,
        );
      }, autoPlayIntervalMs);
    };

    let startDragFrame = 0;
    let isDragActive = false;

    Promise.all([
      import("gsap"),
      import("gsap/Draggable"),
      import("gsap/InertiaPlugin"),
    ])
      .then(([{ gsap }, { Draggable }, { InertiaPlugin }]) => {
        if (cancelled) return;
        if (!coinRef.current || !proxyRef.current) return;

        gsap.registerPlugin(Draggable, InertiaPlugin);
        gsapRef.current = gsap;

        draggableRef.current = Draggable.create(proxyRef.current, {
          type: "x",
          trigger: coinRef.current,
          inertia: enableInertia,
          allowContextMenu: true,
          minimumMovement: 0,
          allowNativeTouchScrolling: "y",
          throwResistance: isMobile ? mobileThrowResistance : throwResistance,
          dragResistance: isMobile ? mobileDragResistance : dragResistance,
          minDuration: 0.3,
          maxDuration: 1.5,
          onPress() {
            if (isDragActive) return;
            isDragActive = true;
            clearInterval(intervalRef.current);
            startDragFrame = currentFrameRef.current;
          },
          onDrag() {
            currentFrameRef.current = resetWithinBounds(
              startDragFrame + this.x,
            );
          },
          onThrowUpdate() {
            currentFrameRef.current = resetWithinBounds(
              startDragFrame + this.x,
            );
          },
          onThrowComplete() {
            isDragActive = false;
            startDragFrame = 0;
            setTimeout(autoPlay, 50);
          },
          onRelease() {
            if (this.isThrowing) return;
            isDragActive = false;
            startDragFrame = 0;
            autoPlay();
          },
        })[0];

        autoPlay();

        preloadImages(() => {
          if (cancelled) return;
          setReady(true);
          startTimeRef.current = Date.now();
          rafRef.current = requestAnimationFrame(animate);
          setTimeout(() => {
            if (!cancelled) setLoaded(true);
          }, 350);
        });
      })
      ;

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      clearInterval(intervalRef.current);
      if (draggableRef.current) draggableRef.current.kill();
      draggableRef.current = null;
    };
  }, [
    frameBaseUrl,
    frameExtension,
    framePad,
    frameCount,
    fps,
    autoPlayIntervalMs,
    canvasSize,
    canvasMarginTop,
    enableInertia,
    throwResistance,
    dragResistance,
    mobileThrowResistance,
    mobileDragResistance,
  ]);

  return (
    <div
      className={`coin-spinner-root relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-center antialiased leading-[2] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale] ${className}`}
      style={{ backgroundColor: bgColor, fontSize: mainFontSize }}
    >
      <style>{`
        @keyframes coinLoader {
          0%   { opacity: 0; transform: translateX(0%); }
          50%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(300%); }
        }
        .coin-loader-bar { animation: coinLoader 1.3s infinite alternate ease-in-out; }
        .coin-spinner-root ::selection {
          background-color: ${selectionColor};
          color: white;
          text-shadow: none;
        }
        .coin-spinner-root ::-moz-selection {
          background-color: ${selectionColor};
          color: white;
          text-shadow: none;
        }
      `}</style>

          <div
          ref={proxyRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute h-px w-px"
        />

          <div
          ref={coinRef}
          className="flex-shrink-0 cursor-grab select-none active:cursor-grabbing"
          style={{ width: coinSize, marginTop: canvasMarginTop }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="h-auto w-full [aspect-ratio:1] [filter:drop-shadow(25px_70px_20px_rgba(34,38,48,0.5))]"
          />
        </div>

        <p
          className={`mt-[0.15em] px-[30px] text-[0.095em] font-normal uppercase tracking-[1.7px] [transition:opacity_1.6s_ease,transform_1.6s_ease] [transition-delay:400ms] ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-[0.9]"
          }`}
          style={{ color: descriptionColor }}
        >
          {description}
        </p>

          <div
          className={`absolute left-1/2 top-1/2 h-[2px] w-[90%] max-w-[150px] -translate-x-1/2 -translate-y-1/2 bg-white/20 [transition:opacity_500ms_ease,visibility_500ms_ease] ${
            ready ? "invisible opacity-0" : "visible opacity-100"
          }`}
        >
          <span className="coin-loader-bar flex h-full w-1/4 bg-white" />
        </div>
    </div>
  );
}
