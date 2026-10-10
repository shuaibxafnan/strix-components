"use client";

import { useEffect, useRef, useState } from "react";

// ─── CoinSpinner ─────────────────────────────────────────────────────────────
//
// Drag-to-spin 3D coin built from a preloaded image sequence drawn to <canvas>,
// with GSAP Draggable + InertiaPlugin for flick/throw momentum. Ported from
// Voicu Apostol's CodePen (www.cerpow.com).
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor               string   #131318    Page background
// description           string   ...         Helper text under the coin
//
// frameBaseUrl          string   <cdn>       Base URL for the frame sequence
// frameExtension        string   .png        Frame file extension
// framePad              number   4           Zero-pad width for frame index
// frameCount            number   260         Total frames in the sequence
// fps                   number   100         Max canvas redraw rate
// autoPlayIntervalMs    number   20          Idle auto-rotate tick interval (ms)
// canvasSize            number   600         Canvas pixel width/height (square)
// coinSize              string   3em         Rendered coin width (em scales w/ root)
// canvasMarginTop       string   0em         Vertical lift of the coin (em)
//
// enableInertia         boolean  true        Use throw momentum (needs plugin)
// throwResistance       number   2200        Desktop throw resistance
// dragResistance        number   0.6         Desktop drag resistance
// mobileThrowResistance number   1800        Mobile throw resistance
// mobileDragResistance  number   0.42        Mobile drag resistance
//
// descriptionColor      string   rgba(...)   Description color
// selectionColor        string   rgba(...)   Text-selection highlight color
// mainFontSize          string   clamp(...)  Root em sizing (drives layout)
// ──────────────────────────────────────────────────────────────────────────

export default function CoinSpinCard3D({
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
}) {
  // DOM refs
  const coinRef = useRef(null); // visible coin = drag trigger
  const canvasRef = useRef(null);
  // Invisible proxy that actually receives the GSAP transform, so the
  // visible coin never moves — it's only used as the drag trigger.
  const proxyRef = useRef(null);

  // Mutable animation state — refs so the rAF loop / Draggable callbacks
  // never read stale closure values and never trigger re-renders.
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const newFrameRef = useRef(0);
  const rafRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const draggableRef = useRef(null);

  // Render-affecting state (drives the CSS fade-in transitions)
  const [ready, setReady] = useState(false); // hides the loader
  const [loaded, setLoaded] = useState(false); // fades in the text

  useEffect(() => {
    let cancelled = false;

    // ─── loadScript CDN helper (deduped via data-id) ────────────────────────
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    // Check if mobile device (client-only — avoids SSR access to navigator)
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Keep frame index within [0, frameCount)
    const resetWithinBounds = (frame) => {
      const value = frame % frameCount;
      return value < 0 ? Math.floor(frameCount + value) : Math.floor(value);
    };

    // ─── Canvas render loop (fps-limited) ───────────────────────────────────
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
            // Faithful draw math, scaled to canvasSize (tuned at 600px).
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

    // ─── Preload the frame sequence ─────────────────────────────────────────
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
        img.onerror = done; // never hang on a missing frame
        img.src = `${frameBaseUrl}${String(i).padStart(
          framePad,
          "0",
        )}${frameExtension}`;
        imagesRef.current[i] = img;
      }
    };

    // ─── Idle auto-rotate ───────────────────────────────────────────────────
    const autoPlay = () => {
      const { gsap, Draggable } = window;
      if (!gsap || !Draggable || !proxyRef.current) return;

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

    // ─── Boot: load GSAP + plugins, then preload, then run ──────────────────
    let startDragFrame = 0;
    let isDragActive = false;

    Promise.resolve()
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        ),
      )
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js",
        ),
      )
      // InertiaPlugin is a GreenSock Club plugin (trial CDN). Non-fatal:
      // without it, dragging still works — just no throw momentum.
      .then(() =>
        enableInertia
          ? loadScript(
              "https://assets.codepen.io/16327/InertiaPlugin.min.js",
            ).catch(() => null)
          : null,
      )
      .then(() => {
        if (cancelled) return;
        const { gsap, Draggable, InertiaPlugin } = window;
        if (!gsap || !Draggable || !coinRef.current || !proxyRef.current)
          return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(Draggable);
        if (InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
        const useInertia = enableInertia && !!InertiaPlugin;

        // Drag the invisible proxy (target), triggered by the visible coin.
        // The coin never receives a transform, so only the frames spin.
        draggableRef.current = Draggable.create(proxyRef.current, {
          type: "x",
          trigger: coinRef.current,
          inertia: useInertia,
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

        // Begin idle rotation immediately, then wait on the image preload.
        autoPlay();

        preloadImages(() => {
          if (cancelled) return;
          setReady(true); // hide loader
          startTimeRef.current = Date.now();
          rafRef.current = requestAnimationFrame(animate);
          setTimeout(() => {
            if (!cancelled) setLoaded(true); // fade text in
          }, 350);
        });
      })
      .catch((e) =>
        console.error("[CoinSpinner] GSAP load failed:", e.message),
      );

    // ─── Cleanup ────────────────────────────────────────────────────────────
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
      className="coin-spinner-root min-h-screen overflow-hidden text-center antialiased leading-[2] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]"
      style={{ backgroundColor: bgColor }}
    >
      {/* Scoped keyframes + selection styling (runtime selection color) */}
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

      <main
        className="relative mx-auto flex h-[100svh] max-w-[1024px] flex-col items-center justify-center"
        style={{ fontSize: mainFontSize }}
      >
        {/* Invisible GSAP drag target — see proxyRef note above */}
        <div
          ref={proxyRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute h-px w-px"
        />

        {/* Visible coin — drag TRIGGER only; never receives a transform */}
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

        {/* Preloader bar */}
        <div
          className={`absolute left-1/2 top-1/2 h-[2px] w-[90%] max-w-[150px] -translate-x-1/2 -translate-y-1/2 bg-white/20 [transition:opacity_500ms_ease,visibility_500ms_ease] ${
            ready ? "invisible opacity-0" : "visible opacity-100"
          }`}
        >
          <span className="coin-loader-bar flex h-full w-1/4 bg-white" />
        </div>
      </main>
    </div>
  );
}
