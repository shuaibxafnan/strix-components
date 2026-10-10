"use client";

import { useEffect, useRef, useState } from "react";

// ─── Liquid Horizon Cinematic Engine ─────────────────────────────────────────
//
// A high-performance horizontal looping canvas built around dynamic depth,
// variable fluid damping, and asymmetrical editorial layouts.
// ──────────────────────────────────────────────────────────────────────────

export default function InfiniteCinematicHorizon({
  smoothFactor = 0.045, // Calibrated heavy-inertia physics friction
  touchSensitivity = 2.4,
  bufferSize = 2,
}) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const progressLineRef = useRef(null);

  // Decoupled structural matrices for handling organic parallax frames
  const parallaxMediaRef = useRef([]);
  const textShiftersRef = useRef([]);

  const stateRef = useRef({
    targetScrollX: 0,
    currentScrollX: 0,
    isAnimating: false,
    currentProgressScale: 0,
    targetProgressScale: 0,
    lastPercentage: 0,
    isDown: false,
    lastTouchX: 0,
    touchVelocity: 0,
    lastTouchTime: 0,
    sequenceWidth: 0,
  });

  const [percentageDisplay, setPercentageDisplay] = useState(0);

  useEffect(() => {
    if (!scrollerRef.current || !containerRef.current) return;

    const scroller = scrollerRef.current;
    const container = containerRef.current;
    const state = stateRef.current;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    // Advanced multithreaded-emulated layout tracking for high-end optical depth
    const renderDepthLayers = () => {
      // 1. Fluid Parallax Windows
      parallaxMediaRef.current.forEach((media) => {
        if (!media) return;
        const parent = media.closest("section");
        if (!parent) return;
        const rect = parent.getBoundingClientRect();

        // Multiplier controls the internal fluid drift rate within the cropped container
        const dynamicTranslate = rect.left * -0.18;
        media.style.transform = `scale(1.25) translateX(${dynamicTranslate}px)`;
      });

      // 2. Variable Text Velocity Stretching
      textShiftersRef.current.forEach((text) => {
        if (!text) return;
        const parent = text.closest("section");
        if (!parent) return;
        const rect = parent.getBoundingClientRect();

        // Causes typography to float faster than the frame structure
        const textDrift = rect.left * 0.08;
        text.style.transform = `translateX(${textDrift}px)`;
      });
    };

    const setupScroll = () => {
      // Flush historical programmatic nodes inside hot-reloading context
      scroller
        .querySelectorAll(".clone-section")
        .forEach((clone) => clone.remove());

      const originalSections = Array.from(
        scroller.querySelectorAll("section:not(.clone-section)"),
      );

      let seqWidth = 0;
      originalSections.forEach((section) => {
        seqWidth += parseFloat(window.getComputedStyle(section).width);
      });

      // Prepend Loop Cushion Track
      for (let i = -bufferSize; i < 0; i++) {
        originalSections.forEach((section) => {
          const clone = section.cloneNode(true);
          clone.classList.add("clone-section");
          scroller.appendChild(clone);
        });
      }

      // Append Loop Cushion Track
      for (let i = 1; i <= bufferSize; i++) {
        originalSections.forEach((section) => {
          const clone = section.cloneNode(true);
          clone.classList.add("clone-section");
          scroller.appendChild(clone);
        });
      }

      scroller.style.width = `${seqWidth * (1 + bufferSize * 2)}px`;
      state.sequenceWidth = seqWidth;
      state.targetScrollX = seqWidth * bufferSize;
      state.currentScrollX = state.targetScrollX;
      scroller.style.transform = `translateX(-${state.currentScrollX}px)`;

      // Map interactive tracking nodes
      parallaxMediaRef.current = Array.from(
        scroller.querySelectorAll(".horizon-depth-media"),
      );
      textShiftersRef.current = Array.from(
        scroller.querySelectorAll(".kinetic-text"),
      );
    };

    const checkBoundaryAndReset = () => {
      const { sequenceWidth, currentScrollX } = state;
      if (currentScrollX > sequenceWidth * (bufferSize + 0.5)) {
        state.targetScrollX -= sequenceWidth;
        state.currentScrollX -= sequenceWidth;
        scroller.style.transform = `translateX(-${currentScrollX}px)`;
        return true;
      }

      if (currentScrollX < sequenceWidth * (bufferSize - 0.5)) {
        state.targetScrollX += sequenceWidth;
        state.currentScrollX += sequenceWidth;
        scroller.style.transform = `translateX(-${currentScrollX}px)`;
        return true;
      }
      return false;
    };

    const updateProgress = (forceReset = false) => {
      const { sequenceWidth, currentScrollX, lastPercentage } = state;
      if (sequenceWidth === 0) return;

      const basePosition = sequenceWidth * bufferSize;
      let currentPosition = (currentScrollX - basePosition) % sequenceWidth;
      let percentage = (currentPosition / sequenceWidth) * 100;

      if (percentage < 0) {
        percentage = 100 + percentage;
      }

      const isWrapping =
        (lastPercentage > 80 && percentage < 20) ||
        (lastPercentage < 20 && percentage > 80) ||
        forceReset;

      setPercentageDisplay(Math.round(percentage));
      state.targetProgressScale = percentage / 100;

      if (isWrapping && progressLineRef.current) {
        state.currentProgressScale = state.targetProgressScale;
        progressLineRef.current.style.transform = `scaleX(${state.currentProgressScale})`;
      }

      state.lastPercentage = percentage;
    };

    const animate = (forceProgressReset = false) => {
      state.currentScrollX = lerp(
        state.currentScrollX,
        state.targetScrollX,
        smoothFactor,
      );
      scroller.style.transform = `translateX(-${state.currentScrollX}px)`;

      renderDepthLayers();
      updateProgress(forceProgressReset);

      if (!forceProgressReset) {
        state.currentProgressScale = lerp(
          state.currentProgressScale,
          state.targetProgressScale,
          smoothFactor,
        );
      }

      if (progressLineRef.current) {
        progressLineRef.current.style.transform = `scaleX(${state.currentProgressScale})`;
      }

      if (Math.abs(state.targetScrollX - state.currentScrollX) > 0.01) {
        requestAnimationFrame(() => animate(false));
      } else {
        state.isAnimating = false;
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();

      // Amplifies heavy scrolling gestures into sleek variable acceleration curves
      const adaptiveDelta = e.deltaY * (Math.abs(e.deltaY) > 50 ? 1.4 : 1.0);
      state.targetScrollX += adaptiveDelta;
      const needsReset = checkBoundaryAndReset();

      if (!state.isAnimating) {
        state.isAnimating = true;
        requestAnimationFrame(() => animate(needsReset));
      }
    };

    const handleTouchStart = (e) => {
      state.isDown = true;
      state.lastTouchX = e.touches[0].clientX;
      state.lastTouchTime = Date.now();
      state.targetScrollX = state.currentScrollX;
    };

    const handleTouchMove = (e) => {
      if (!state.isDown) return;
      e.preventDefault();

      const currentTouchX = e.touches[0].clientX;
      const touchDelta = state.lastTouchX - currentTouchX;

      state.targetScrollX += touchDelta * touchSensitivity;

      const currentTime = Date.now();
      const timeDelta = currentTime - state.lastTouchTime;
      if (timeDelta > 0) {
        state.touchVelocity = (touchDelta / timeDelta) * 15;
      }
      state.lastTouchX = currentTouchX;
      state.lastTouchTime = currentTime;

      const needsReset = checkBoundaryAndReset();
      if (!state.isAnimating) {
        state.isAnimating = true;
        requestAnimationFrame(() => animate(needsReset));
      }
    };

    const handleTouchEnd = () => {
      state.isDown = false;

      if (Math.abs(state.touchVelocity) > 0.1) {
        state.targetScrollX += state.touchVelocity * 22;

        const decayVelocity = () => {
          state.touchVelocity *= 0.94; // Premium organic slowdown friction

          if (Math.abs(state.touchVelocity) > 0.1) {
            state.targetScrollX += state.touchVelocity;
            const needsReset = checkBoundaryAndReset();

            if (needsReset) {
              updateProgress(true);
            }
            requestAnimationFrame(decayVelocity);
          }
        };
        requestAnimationFrame(decayVelocity);
      }
    };

    setupScroll();
    updateProgress(true);
    renderDepthLayers();

    if (progressLineRef.current) {
      progressLineRef.current.style.transform = `scaleX(${state.currentProgressScale})`;
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [smoothFactor, touchSensitivity, bufferSize]);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen overflow-hidden select-none bg-[#070707] font-sans antialiased"
    >
      {/* Dynamic Digital Film Noise Layer */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.045] mix-blend-overlay bg-repeat scale-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Kinetic Minimal Header Tracking Line */}
      <div
        ref={progressLineRef}
        className="fixed top-0 left-0 w-screen origin-left will-change-transform z-40 bg-gradient-to-r from-neutral-800 via-neutral-300 to-neutral-800 h-[2px]"
      />

      {/* Floating Modern Framing Counter */}
      <div className="fixed bottom-8 right-8 z-40 mix-blend-difference text-neutral-200">
        <div className="overflow-hidden flex items-baseline gap-1">
          <h1 className="font-['Syne',sans-serif] text-[5vw] font-bold leading-none tracking-tighter">
            {percentageDisplay.toString().padStart(3, "0")}
          </h1>
          <span className="text-xs font-mono text-neutral-500">/100</span>
        </div>
      </div>

      {/* Master Horizontal Layout Track */}
      <div
        ref={scrollerRef}
        className="relative h-screen flex will-change-transform items-center"
      >
        {/* PANEL 1: Editorial Hero Core Opening */}
        <section className="relative h-screen w-[90vw] flex flex-col justify-between items-start p-20 bg-[#0a0a0a] text-white flex-shrink-0 border-r border-neutral-900">
          <div className="flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-mono">
              EDITION // 2026_V1
            </span>
          </div>

          <div className="max-w-[75vw] my-auto relative">
            <h1 className="font-['Syne',sans-serif] text-[8vw] font-extrabold leading-[0.9] tracking-tighter text-white uppercase">
              THE ART OF <br />
              <span className="font-light italic font-['Playfair_Display',serif] text-neutral-400 normal-case tracking-normal">
                displacement.
              </span>
            </h1>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm font-light text-neutral-500 max-w-md mt-10 leading-relaxed tracking-wide">
              An interactive spatial essay evaluating the friction between
              horizontal linear momentum and luxury digital architecture.
            </p>
          </div>

          <div className="flex items-center gap-12 text-[10px] font-mono text-neutral-600">
            <span>INDEX_REF // 001-008</span>
            <span>BOUNDLESS CANVAS ENGINE</span>
          </div>
        </section>

        {/* PANEL 2: Extended Cinematic Window Frame */}
        <section className="relative h-screen w-[85vw] flex justify-center items-center p-24 bg-[#070707] flex-shrink-0 border-r border-neutral-900">
          <div className="relative w-full h-[65svh] overflow-hidden bg-neutral-950 shadow-[0_50px_100px_rgba(0,0,0,0.9)] filter grayscale contrast-[1.1] hover:grayscale-0 transition-all duration-[1.4s] ease-out group rounded-sm">
            <img
              className="horizon-depth-media w-full h-full object-cover will-change-transform origin-center scale-125 group-hover:brightness-110 transition-all duration-[2.5s] ease-out"
              src="https://images.unsplash.com/photo-1504890001746-a9a68eda46e2?q=80&w=1687&auto=format&fit=crop"
              alt="Cinematic View 1"
            />
            <div className="absolute top-6 left-6 font-mono text-[10px] text-white/50 bg-black/40 px-3 py-1 backdrop-blur-sm tracking-widest rounded-sm">
              FRAME_01
            </div>
          </div>
        </section>

        {/* PANEL 3: Floating Asymmetric Typography Matrix */}
        <section className="relative h-screen w-[100vw] flex flex-col justify-between items-start p-20 bg-[#0d0d0c] text-neutral-200 flex-shrink-0 border-r border-neutral-900">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono">
            02 // DISRUPTION CONTRAST
          </span>

          <div className="my-auto max-w-5xl">
            <h2 className="kinetic-text font-['Playfair_Display',serif] text-[4.8vw] font-light leading-[1.3] tracking-tight text-neutral-300 will-change-transform">
              “Logic leaves you structured. <br />
              <span className="font-['Syne',sans-serif] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600 uppercase italic">
                Pure asymmetry
              </span>{" "}
              leaves you memorable.”
            </h2>
          </div>

          <div className="w-full h-[1px] bg-neutral-800/30" />
        </section>

        {/* PANEL 4: Combined Triple Split Portrait Grid */}
        <section className="relative h-screen w-[125vw] flex flex-col justify-between items-start p-20 bg-[#0a0b0a] text-white flex-shrink-0 border-r border-neutral-900">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono">
            03 // GEOMETRIC EXCHANGES
          </span>

          <div className="grid grid-cols-12 gap-16 w-full my-auto items-center">
            <div className="col-span-4 space-y-8 pr-6">
              <div className="h-[1px] w-12 bg-neutral-600" />
              <h3 className="font-['Syne',sans-serif] text-2xl font-bold tracking-tight uppercase">
                The Compositional Axis
              </h3>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs font-light text-neutral-400 leading-relaxed tracking-wider">
                By detaching the text modules from fixed layout positions,
                characters float freely through empty space, reacting
                intuitively with the scrolling user.
              </p>
            </div>

            <div className="col-span-8 aspect-[16/9] overflow-hidden bg-neutral-950 shadow-2xl relative group rounded-sm">
              <img
                className="horizon-depth-media w-full h-full object-cover will-change-transform scale-125"
                src="https://images.unsplash.com/photo-1742753103280-52d5efc0709b?q=80&w=1740&auto=format&fit=crop"
                alt="Cinematic View 2"
              />
              <div className="absolute inset-0 bg-neutral-950/20 mix-blend-color group-hover:opacity-0 transition-opacity duration-1000" />
            </div>
          </div>

          <div className="w-full h-[1px] bg-neutral-900" />
        </section>

        {/* PANEL 5: Giant Landscape Bleed Window */}
        <section className="relative h-screen w-[90vw] flex justify-center items-center p-0 bg-[#070707] flex-shrink-0 border-r border-neutral-900">
          <div className="relative w-full h-full overflow-hidden filter brightness-75 contrast-125 hover:brightness-90 transition-all duration-[1.5s]">
            <img
              className="horizon-depth-media w-full h-full object-cover scale-125 will-change-transform"
              src="https://images.unsplash.com/photo-1702471897038-3d3c88379fb0?q=80&w=1674&auto=format&fit=crop"
              alt="Cinematic View 3"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          </div>
        </section>

        {/* PANEL 6: Dynamic Typography Velocity Wall */}
        <section className="relative h-screen w-[105vw] flex flex-col justify-between items-start p-20 bg-[#0a0a0a] text-neutral-200 flex-shrink-0 border-r border-neutral-900">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono">
            04 // KINETIC AXIS
          </span>

          <div className="space-y-2 my-auto w-full group/wall">
            <div className="overflow-hidden border-b border-neutral-900 pb-4">
              <h1 className="font-['Syne',sans-serif] text-[6vw] font-extrabold tracking-tighter text-neutral-700 hover:text-white hover:translate-x-8 transition-all duration-700 cursor-pointer uppercase leading-none">
                PERSISTENT{" "}
                <span className="font-['Playfair_Display',serif] font-light italic text-neutral-500 normal-case tracking-tight">
                  motion.
                </span>
              </h1>
            </div>
            <div className="overflow-hidden border-b border-neutral-900 py-4">
              <h1 className="font-['Syne',sans-serif] text-[6vw] font-extrabold tracking-tighter text-neutral-700 hover:text-white hover:translate-x-8 transition-all duration-700 cursor-pointer uppercase leading-none">
                ABSOLUTE{" "}
                <span className="font-['Playfair_Display',serif] font-light italic text-neutral-400 normal-case tracking-tight">
                  clarity.
                </span>
              </h1>
            </div>
            <div className="overflow-hidden py-4">
              <h1 className="font-['Syne',sans-serif] text-[6vw] font-extrabold tracking-tighter text-neutral-800 hover:text-white hover:translate-x-8 transition-all duration-700 cursor-pointer uppercase leading-none">
                UNMATCHED{" "}
                <span className="font-['Playfair_Display',serif] font-light italic text-neutral-600 normal-case tracking-tight">
                  depth.
                </span>
              </h1>
            </div>
          </div>

          <div className="w-full h-[1px] bg-neutral-900" />
        </section>

        {/* PANEL 7: Atmospheric Isolation Portal */}
        <section className="relative h-screen w-[80vw] flex justify-center items-center p-28 bg-[#070707] flex-shrink-0 border-r border-neutral-900">
          <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-sm filter mix-blend-luminosity brightness-50 contrast-125 hover:mix-blend-normal hover:brightness-100 transition-all duration-1000">
            <img
              className="horizon-depth-media w-full h-full object-cover scale-125 will-change-transform"
              src="https://images.unsplash.com/photo-1696258686454-60082b2c33e2?q=80&w=1740&auto=format&fit=crop"
              alt="Cinematic View 4"
            />
          </div>
        </section>

        {/* PANEL 8: Minimal Signature Luxury Outro */}
        <section className="relative h-screen w-[85vw] flex flex-col justify-between items-start p-20 bg-[#09090b] text-neutral-300 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono">
            05 // EPILOGUE ARCHIVE
          </span>

          <div className="my-auto">
            <h1 className="kinetic-text font-['Syne',sans-serif] text-[6.5vw] font-extrabold tracking-tight uppercase leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-neutral-100 to-neutral-700 will-change-transform">
              THE LOOP <br />
              IS INFINITE.
            </h1>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] uppercase tracking-[0.5em] text-neutral-500 mt-8 font-light">
              EXPERIMENTS IN HIGH-FIDELITY INTERACTION.
            </p>
          </div>

          <div className="flex w-full justify-between items-center text-[9px] text-neutral-600 font-mono border-t border-neutral-900 pt-6">
            <span>DESIGN LABS // VOL_04</span>
            <span>© 2026 LAB_STUDIOS</span>
          </div>
        </section>
      </div>
    </div>
  );
}
