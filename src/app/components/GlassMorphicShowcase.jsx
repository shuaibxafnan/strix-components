"use client";

import React, { useEffect, useRef, useState } from "react";

const DEFAULT_IMAGES = [
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/iphone-side.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/iphone-screen.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/iphone.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/iphone-teardown.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/iphone-portrait.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/iphone-landscape.png",
];

export default function GlassMorphicShowcase({
  activeIndex = null,
  animationSpeed = 0.65,
  width = "360px",
  initialSizing = "68px",
  accentColor = "#f43f5e",
  showTweakpane = false,
  showFollowBear = true,
  images = DEFAULT_IMAGES,
}) {
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState(activeIndex);
  const [checkingDetails, setCheckingDetails] = useState(activeIndex !== null);
  const [theme, setTheme] = useState("dark");
  const [debug, setDebug] = useState(false);

  // Dynamic tracker positioning states
  const [trackerStyles, setTrackerStyles] = useState({
    height: "0px",
    transform: "translateY(0px)",
    opacity: 0,
  });

  const sectionRef = useRef(null);
  const tweakpaneRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !sectionRef.current) return;
    const root = sectionRef.current;
    root.style.setProperty("--speed", `${animationSpeed}s`);
    root.style.setProperty("--width", width);
    root.style.setProperty("--sizing", initialSizing);
    root.style.setProperty("--accent", accentColor);

    const bgVal =
      theme === "light"
        ? "rgba(255, 255, 255, 0.35)"
        : "rgba(10, 10, 10, 0.35)";
    const hoverBgVal =
      theme === "light"
        ? "rgba(255, 255, 255, 0.65)"
        : "rgba(20, 20, 20, 0.65)";

    root.style.setProperty("--background", bgVal);
    root.style.setProperty("--hover-background", hoverBgVal);
  }, [mounted, animationSpeed, width, initialSizing, theme, accentColor]);

  // Recalculate Tracker Position Dynamically based on the selected item's real height layout
  useEffect(() => {
    if (openIndex !== null && itemRefs.current[openIndex]) {
      const activeElement = itemRefs.current[openIndex];
      const targetHeight = 48; // Static visual accent length tracking indicator
      setTrackerStyles({
        height: `${targetHeight}px`,
        transform: `translateY(${activeElement.offsetTop + activeElement.offsetHeight / 2 - targetHeight / 2}px)`,
        opacity: 1,
      });
    } else {
      setTrackerStyles({
        height: "0px",
        transform: "translateY(0px)",
        opacity: 0,
      });
    }
  }, [openIndex, mounted]);

  useEffect(() => {
    if (!mounted || !showTweakpane) return;

    let paneInstance;
    let draggableInstance;

    Promise.all([
      import("https://esm.sh/gsap@3.13.0"),
      import("https://esm.sh/gsap@3.13.0/Draggable"),
      import("https://esm.sh/tweakpane@4.0.4"),
    ])
      .then(([{ default: gsap }, { default: Draggable }, { Pane }]) => {
        gsap.registerPlugin(Draggable);

        paneInstance = new Pane({
          title: "Interface Controls",
          expanded: false,
          container: tweakpaneRef.current,
        });

        paneInstance
          .addBinding({ theme }, "theme", {
            options: { system: "system", light: "light", dark: "dark" },
          })
          .on("change", (ev) => setTheme(ev.value));

        paneInstance
          .addBinding({ debug }, "debug")
          .on("change", (ev) => setDebug(ev.value));

        draggableInstance = Draggable.create(tweakpaneRef.current, {
          type: "x,y",
          edgeResistance: 0.65,
        });
      })
      .catch((err) => console.error("Pane Engine Exception: ", err));

    return () => {
      if (paneInstance) paneInstance.dispose();
      if (draggableInstance && draggableInstance[0])
        draggableInstance[0].kill();
    };
  }, [mounted, showTweakpane]);

  if (!mounted) return null;

  const handleToggle = (index, e) => {
    e.preventDefault();
    if (openIndex === index) {
      setOpenIndex(null);
      setCheckingDetails(false);
    } else {
      setOpenIndex(index);
      setCheckingDetails(true);
    }
  };

  const nextSlide = () => {
    if (openIndex !== null) setOpenIndex((openIndex + 1) % 5);
  };

  const prevSlide = () => {
    if (openIndex !== null) setOpenIndex((openIndex - 1 + 5) % 5);
  };

  const closeAll = () => {
    setOpenIndex(null);
    setCheckingDetails(false);
  };

  const features = [
    {
      title: "Core Synthesis Architecture",
      desc: "A structural foundation leveraging low-level disclosure capabilities. Zero render blocking, multi-threaded painting lifecycle ready.",
    },
    {
      title: "Quantum Layout Sizing",
      desc: "Bypasses traditional layout computation trees entirely using intrinsic dimensional markers to align elements safely.",
    },
    {
      title: "Elastic Kinetic Trajectories",
      desc: "Engineered structural spring arrays mapped via native interpolation data paths to remove screen-refresh microstutter.",
    },
    {
      title: "Ecosystem Interactivity",
      desc: "Designed for seamless data handoffs across modular layout layers. Micro-contrast transitions shift predictably with context.",
    },
    {
      title: "Premium Engineering Track",
      desc: "Instantly deploy global structural layout standards into fast, highly concurrent production viewports.",
    },
  ];

  return (
    <main
      className={`relative w-full min-h-screen grid place-items-center font-sans overflow-x-hidden selection:bg-neutral-500/20 ${theme === "dark" ? "bg-[#030303] text-white" : "bg-[#fafafa] text-neutral-900"}`}
    >
      

      {/* Cyber Grid Sub-Layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0"
        style={{
          backgroundImage: `linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(circle at 50% 50%, white, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, white, transparent 75%)",
        }}
      />

      <style jsx global>{`
        :root {
          --ease-premium: cubic-bezier(0.2, 0.8, 0.2, 1);
          --bounce: linear(
            0 0%,
            0.4214 6.61%,
            0.5762 9.59%,
            0.7047 12.55%,
            0.8115 15.61%,
            0.8964 18.78%,
            0.9614 22.13%,
            1.0078 25.74%,
            1.0282 28.18%,
            1.0422 30.82%,
            1.0503 33.7%,
            1.0527 36.95%,
            1.0468 42.53%,
            1.015 58.45%,
            1.0045 67.2%,
            0.9987 80.44%,
            1 100%
          );
        }
      `}</style>

      {/* Main Glass Showcase Block */}
      <section
        ref={sectionRef}
        data-checking-details={checkingDetails ? "true" : "false"}
        className={`relative my-8 flex items-center justify-start gap-12 py-8 max-h-[600px] aspect-[1.5/1] w-[980px] max-w-[calc(100vw-2rem)] rounded-[32px] overflow-hidden border z-10 select-none shadow-[0_32px_90px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-700 ease-[--ease-premium] ${
          theme === "dark"
            ? "bg-neutral-950/20 border-neutral-800/40 shadow-black"
            : "bg-white/20 border-neutral-200/50 shadow-neutral-200"
        }`}
      >
        {/* Dynamic Structural Tracking Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-800/30 dark:bg-neutral-800/20 z-20">
          <div
            className="w-full bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent rounded-full transition-all duration-500 ease-[--ease-premium]"
            style={{
              height: trackerStyles.height,
              transform: trackerStyles.transform,
              opacity: trackerStyles.opacity,
            }}
          />
        </div>

        {/* Dynamic Interactive Accordion Stack */}
        <div
          className="pl-14 flex flex-col justify-start gap-3 z-20 flex-initial transition-all duration-700 ease-[--ease-premium]"
          style={{ width: `calc(${width} + 24px)` }}
        >
          {features.map((feat, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={(e) => handleToggle(idx, e)}
                className={`group relative inline-block w-full rounded-2xl overflow-hidden min-h-[var(--sizing)] border transition-all duration-500 ease-[--ease-premium] cursor-pointer ${
                  isOpen
                    ? "border-neutral-500/20 shadow-inner dark:bg-neutral-900/10 cursor-default"
                    : "border-transparent hover:bg-neutral-500/[0.02]"
                }`}
                style={{ backgroundColor: "var(--background)" }}
              >
                {/* Micro Ambient Glow Border for Opened Components */}
                {isOpen && (
                  <div className="absolute inset-0 border border-[var(--accent)]/30 rounded-2xl pointer-events-none animate-pulse duration-[3s]" />
                )}

                {/* Closed Summary view - Completely unmounted when card opens */}
                {!isOpen ? (
                  <div
                    className={`inline-flex gap-4 items-center px-6 h-[var(--sizing)] min-h-[var(--sizing)] relative font-medium whitespace-nowrap transition-all duration-500 ease-[--ease-premium] w-full text-neutral-400 hover:text-neutral-100 ${
                      theme === "light" &&
                      "!text-neutral-500 hover:!text-neutral-900"
                    }`}
                  >
                    <span className="text-[11px] font-mono tracking-widest px-2.5 py-0.5 rounded-md border border-neutral-800 dark:border-neutral-800/60 text-neutral-500 group-hover:border-neutral-700 dark:group-hover:border-neutral-700/50 group-hover:text-neutral-300 transition-all duration-300">
                      0{idx + 1}
                    </span>
                    <span className="text-[15px] font-normal tracking-tight">
                      {feat.title}
                    </span>
                  </div>
                ) : (
                  /* Expanded Inner Content View with Safe Padded Horizontal Margins */
                  <div
                    className="w-full transition-all duration-500 opacity-100 block"
                    style={{ transitionTimingFunction: "var(--bounce)" }}
                  >
                    <div className="px-8 py-6 block w-full box-border whitespace-normal break-words">
                      <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--accent)] uppercase mb-3 opacity-90">
                        System Node // 0{idx + 1}
                      </div>
                      <h3
                        className={`text-xl font-normal mb-2.5 tracking-tight ${theme === "light" ? "text-neutral-900" : "text-neutral-100"}`}
                      >
                        {feat.title}
                      </h3>
                      <p
                        className={`text-sm font-light ${theme === "light" ? "text-neutral-600" : "text-neutral-400"}`}
                      >
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right-Side Infinite Spatial Display Wall */}
        <div className="absolute right-0 top-0 w-[50%] h-full pointer-events-none z-0 overflow-hidden">
          {/* Asymmetric Radial Depth Masking Layer */}
          <div
            className="absolute inset-y-0 left-0 w-35 z-20 pointer-events-none"
            style={{
              backgroundImage:
                theme === "dark"
                  ? "linear-gradient(to right, #030303, transparent)"
                  : "linear-gradient(to right, #fafafa, transparent)",
            }}
          />

          {images.map((imgSrc, imgIdx) => {
            let isCurrentTarget =
              openIndex !== null && openIndex + 1 === imgIdx;
            if (openIndex === null && imgIdx === 0) isCurrentTarget = true;

            return (
              <div
                key={imgIdx}
                className="absolute inset-0 transition-all duration-1000 ease-[var(--ease-premium)]"
                style={{
                  zIndex: isCurrentTarget ? 10 : 1,
                  transform: isCurrentTarget
                    ? "translateY(0px) rotate(0deg) scale(1)"
                    : "translateY(40px) rotate(1deg) scale(0.96)",
                  opacity: isCurrentTarget ? 1 : 0,
                }}
              >
                <div className="w-full h-full transition-all duration-700">
                  <img
                    src={imgSrc}
                    alt={`Premium Viewport Render ${imgIdx}`}
                    className="w-full h-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-premium)]"
                    style={{
                      transform: "scale(1)",
                      objectPosition: "center",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Command Action Hub Floating Bar */}
        {openIndex !== null && (
          <div
            className={`absolute right-6 bottom-6 flex items-center gap-1.5 p-1.5 rounded-full border backdrop-blur-xl z-30 shadow-2xl transition-all duration-500 ease-[--ease-premium] ${
              theme === "dark"
                ? "bg-neutral-900/40 border-neutral-800/80 shadow-black"
                : "bg-white/60 border-neutral-200/80 shadow-neutral-200/50"
            }`}
          >
            <button
              onClick={prevSlide}
              aria-label="Previous System Element"
              className="grid place-items-center w-9 h-9 rounded-full transition-all duration-300 hover:bg-neutral-500/10 text-neutral-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-3.5 h-3.5 -rotate-90"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next System Element"
              className="grid place-items-center w-9 h-9 rounded-full transition-all duration-300 hover:bg-neutral-500/10 text-neutral-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-3.5 h-3.5 rotate-90"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            </button>
            <div className="w-px h-4 bg-neutral-800/80 dark:bg-neutral-800/40 mx-0.5" />
            <button
              onClick={closeAll}
              aria-label="Terminate View System"
              className="grid place-items-center w-9 h-9 rounded-full transition-all duration-300 hover:bg-rose-500/10 text-neutral-400 hover:text-[var(--accent)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-3.5 h-3.5 rotate-45"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Control Pane Injection Node */}
      <div ref={tweakpaneRef} className="fixed top-6 right-6 z-[99999] w-64" />

      {/* Bear Identity Anchor */}
      {showFollowBear && (
        <a
          aria-label="Author Profile"
          className="fixed bottom-6 left-6 w-10 h-10 grid place-items-center opacity-30 hover:opacity-100 transition-all z-50 text-current hover:scale-105"
          href="https://x.com/intent/follow?screen_name=jh3yy"
          target="_blank"
          rel="noreferrer noopener"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 969 955"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="161.191"
              cy="320.191"
              r="133.191"
              stroke="currentColor"
              strokeWidth="30"
            />
            <circle
              cx="806.809"
              cy="320.191"
              r="133.191"
              stroke="currentColor"
              strokeWidth="30"
            />
            <circle cx="695.019" cy="587.733" r="36" fill="currentColor" />
            <circle cx="272.981" cy="587.733" r="36" fill="currentColor" />
            <path
              d="M564.388 712.083C564.388 743.994 526.035 779.911 483.372 779.911C440.709 779.911 402.356 743.994 402.356 712.083C402.356 680.173 440.709 664.353 483.372 664.353C526.035 664.353 564.388 680.173 564.388 712.083Z"
              fill="currentColor"
            />
            <rect
              x="310.42"
              y="448.31"
              width="343.468"
              height="44"
              fill={accentColor}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M745.643 288.24C815.368 344.185 854.539 432.623 854.539 511.741H614.938V454.652C614.938 433.113 597.477 415.652 575.938 415.652H388.37C366.831 415.652 349.37 433.113 349.37 454.652V511.741L110.949 511.741C110.949 432.623 150.12 344.185 219.845 288.24C289.57 232.295 384.138 200.865 482.744 200.865C581.35 200.865 675.918 232.295 745.643 288.24Z"
              fill="currentColor"
            />
          </svg>
        </a>
      )}
    </main>
  );
}
