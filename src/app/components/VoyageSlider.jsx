"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    id: "scotland",
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1600&q=80",
    title: "Highlands",
    subtitle: "Scotland",
    description: "The mountains are calling",
  },
  {
    id: "peru",
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1600&q=80",
    title: "Machu Picchu",
    subtitle: "Peru",
    description: "Adventure is never far away",
  },
  {
    id: "france",
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1600&q=80",
    title: "Chamonix",
    subtitle: "France",
    description: "Let your dreams come true",
  },
];


export default function VoyageSlider({
  slidesData = DEFAULT_SLIDES,
  slideWidth = "min(25vw,300px)",
  slideAspect = "2/3",
  transitionDuration = "800ms",
}) {
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef(null);
  const rafInstanceRef = useRef(null);
  const tiltInstancesRef = useRef([]);

  // Math Utilities
  const wrap = (n, max) => (n + max) % max;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Shared RequestAnimationFrame Engine
  class Raf {
    constructor() {
      this.rafId = 0;
      this.callbacks = [];
      this.raf = this.raf.bind(this);
      this.start();
    }
    start() {
      this.raf();
    }
    stop() {
      cancelAnimationFrame(this.rafId);
    }
    raf() {
      this.callbacks.forEach(({ callback }) => callback());
      this.rafId = requestAnimationFrame(this.raf);
    }
    add(callback, id) {
      this.callbacks.push({ callback, id });
    }
    remove(id) {
      this.callbacks = this.callbacks.filter((item) => item.id !== id);
    }
  }

  class Vec2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    set(x, y) {
      this.x = x;
      this.y = y;
    }
    lerp(v, t) {
      this.x = lerp(this.x, v.x, t);
      this.y = lerp(this.y, v.y, t);
    }
  }

  const createTilt = (triggerEl, targetEls) => {
    let lerpAmount = 0.06;
    const rotDeg = { current: new Vec2(), target: new Vec2() };
    const bgPos = { current: new Vec2(), target: new Vec2() };
    const uniqueRafId = Math.random().toString(36).substring(2, 9);

    const ticker = () => {
      rotDeg.current.lerp(rotDeg.target, lerpAmount);
      bgPos.current.lerp(bgPos.target, lerpAmount);

      targetEls.forEach((el) => {
        if (!el) return;
        el.style.setProperty("--rotX", `${rotDeg.current.y.toFixed(2)}deg`);
        el.style.setProperty("--rotY", `${rotDeg.current.x.toFixed(2)}deg`);
        el.style.setProperty("--bgPosX", `${bgPos.current.x.toFixed(2)}%`);
        el.style.setProperty("--bgPosY", `${bgPos.current.y.toFixed(2)}%`);
      });
    };

    const onMouseMove = (e) => {
      lerpAmount = 0.1;
      const rect = triggerEl.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      targetEls.forEach((el) => {
        if (!el) return;
        const ox = (offsetX - rect.width * 0.5) / (Math.PI * 3);
        const oy = -(offsetY - rect.height * 0.5) / (Math.PI * 4);
        rotDeg.target.set(ox, oy);
        bgPos.target.set(-ox * 0.3, oy * 0.3);
      });
    };

    const onMouseLeave = () => {
      lerpAmount = 0.06;
      rotDeg.target.set(0, 0);
      bgPos.target.set(0, 0);
    };

    triggerEl.addEventListener("mousemove", onMouseMove);
    triggerEl.addEventListener("mouseleave", onMouseLeave);

    if (rafInstanceRef.current) {
      rafInstanceRef.current.add(ticker, uniqueRafId);
    }

    return {
      destroy: () => {
        triggerEl.removeEventListener("mousemove", onMouseMove);
        triggerEl.removeEventListener("mouseleave", onMouseLeave);
        if (rafInstanceRef.current) {
          rafInstanceRef.current.remove(uniqueRafId);
        }
      },
    };
  };

  useEffect(() => {
    setMounted(true);
    rafInstanceRef.current = new Raf();

    return () => {
      if (rafInstanceRef.current) rafInstanceRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadScript("https://unpkg.com/imagesloaded@5.0.0/imagesloaded.pkgd.min.js")
      .then(() => {
        const imagesLoaded = window.imagesLoaded;
        if (!imagesLoaded || !containerRef.current) return;

        const imgElements = containerRef.current.querySelectorAll("img");
        const totalImages = imgElements.length;

        if (totalImages === 0) {
          setIsLoaded(true);
          return;
        }

        let loadedCount = 0;
        let progressTracking = { current: 0, target: 0 };
        const uniqueProgressId = "loader_progress_loop";

        imgElements.forEach((img) => {
          const imgLoader = imagesLoaded(img);
          imgLoader.on("always", () => {
            loadedCount++;
            progressTracking.target = loadedCount / totalImages;
          });
        });

        rafInstanceRef.current.add(() => {
          progressTracking.current = lerp(
            progressTracking.current,
            progressTracking.target,
            0.06,
          );
          const percentInt = Math.round(progressTracking.current * 100);

          setLoadingProgress(percentInt);

          if (percentInt >= 100) {
            setIsLoaded(true);
            rafInstanceRef.current.remove(uniqueProgressId);

            setTimeout(() => {
              const slideWrappers =
                containerRef.current.querySelectorAll("[data-slide-item]");
              slideWrappers.forEach((slideNode, idx) => {
                const innerSlide =
                  slideNode.querySelector("[data-slide-inner]");
                const infoNode = containerRef.current.querySelector(
                  `[data-info-inner="${idx}"]`,
                );
                if (innerSlide && infoNode) {
                  const instance = createTilt(slideNode, [
                    innerSlide,
                    infoNode,
                  ]);
                  tiltInstancesRef.current.push(instance);
                }
              });
            }, 100);
          }
        }, uniqueProgressId);
      })
      .catch((err) => console.error("Voyage Slider setup failed:", err));

    return () => {
      tiltInstancesRef.current.forEach((inst) => inst.destroy?.());
      tiltInstancesRef.current = [];
    };
  }, [mounted, slidesData]);

  if (!mounted) {
    return <div className="fixed inset-0 bg-black" />;
  }

  const prevIdx = wrap(currentIndex - 1, slidesData.length);
  const nextIdx = wrap(currentIndex + 1, slidesData.length);

  const handleStep = (direction) => {
    setCurrentIndex((prev) => wrap(prev + direction, slidesData.length));
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex items-center justify-center overflow-hidden bg-neutral-950/95 font-sans relative antialiased"
      style={{
        "--slide-width": slideWidth,
        "--slide-aspect": slideAspect,
        "--slide-transition-duration": transitionDuration,
        "--slide-transition-easing": "ease",
      }}
    >
      {/* Background Projections */}
      {slidesData.map((slide, i) => {
        let stateAttr = {};
        if (i === currentIndex) stateAttr["data-current"] = true;
        else if (i === nextIdx) stateAttr["data-next"] = true;
        else if (i === prevIdx) stateAttr["data-previous"] = true;

        return (
          <div
            key={`bg-${slide.id}`}
            {...stateAttr}
            style={{ "--bg": `url(${slide.image})` }}
            className="fixed inset-[-20%] bg-[image:var(--bg)] bg-cover bg-center z-0 pointer-events-none transition-all duration-[var(--slide-transition-duration)] var(--slide-transition-easing) before:absolute before:inset-0 before:bg-black/75 before:backdrop-blur-md not-[[data-current]]:opacity-0 data-[data-previous]:-translate-x-10 data-[data-next]:translate-x-10"
          />
        );
      })}

      {/* Main Container Track */}
      <div className="w-[calc(3*var(--slide-width))] h-[calc(2*(var(--slide-width)*1.5))] flex items-center justify-between px-4 z-10 relative">
        <button
          onClick={() => handleStep(-1)}
          aria-label="Previous Slide"
          className="w-12 h-12 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity z-50 group"
        >
          <svg
            className="w-10 h-10 stroke-white fill-none stroke-2 transition-transform group-hover:-translate-x-0.5"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="flex-1 h-full grid place-items-center relative">
          {/* Images Layer */}
          <div className="w-full h-full grid place-items-center [grid-area:1/-1] pointer-events-none z-10">
            {slidesData.map((slide, i) => {
              const isCurrent = i === currentIndex;
              const isNext = i === nextIdx;
              const isPrev = i === prevIdx;

              let placementStyles =
                "opacity-0 scale-75 blur-md pointer-events-none";
              let zIndexClass = "z-10";

              // RESTORED 3D Look: Keeps your stylish rotation configurations intact.
              if (isCurrent) {
                placementStyles =
                  "translate-x-0 scale-105 rotate-0 opacity-100 blur-none pointer-events-auto";
                zIndexClass = "z-30";
              } else if (isNext) {
                placementStyles =
                  "translate-x-[calc(0.75*var(--slide-width))] -rotate-6 scale-90 opacity-60 blur-[2px]";
                zIndexClass = "z-20";
              } else if (isPrev) {
                placementStyles =
                  "translate-x-[calc(-0.75*var(--slide-width))] rotate-6 scale-90 opacity-60 blur-[2px]";
                zIndexClass = "z-20";
              }

              return (
                <div
                  key={`slide-${slide.id}`}
                  data-slide-item
                  className={`w-[var(--slide-width)] aspect-[var(--slide-aspect)] select-none [perspective:1200px] [grid-area:1/-1] transition-all duration-[var(--slide-transition-duration)] var(--slide-transition-easing) ${placementStyles} ${zIndexClass}`}
                >
                  {/* Added backface-visibility and isolating properties to keep the corners rendered perfectly smooth */}
                  <div
                    data-slide-inner
                    className="w-full h-full relative [transform-style:preserve-3d] [backface-visibility:hidden] [transform:rotateX(var(--rotX,0deg))_rotateY(var(--rotY,0deg))]"
                  >
                    <div className="w-full h-full relative shadow-2xl [transform:translateZ(0px)] [mask-image:linear-gradient(white,white)]">
                      <img
                        className={`w-full h-full object-cover absolute top-50 left-50 [transform:translate(-50%,-50%)_scale(1.15)_translate3d(var(--bgPosX,0%),var(--bgPosY,0%),0px)] [backface-visibility:hidden] transition-all duration-300 ${isCurrent ? "brightness-[0.85]" : "brightness-[0.45]"
                          }`}
                        src={slide.image}
                        alt={slide.title}
                        loading="eager"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typography Copy Layer */}
          <div className="w-full h-full grid place-items-center [grid-area:1/-1] pointer-events-none z-40">
            {slidesData.map((slide, i) => {
              const isCurrent = i === currentIndex;

              return (
                <div
                  key={`info-${slide.id}`}
                  className="w-[var(--slide-width)] aspect-[var(--slide-aspect)] select-none [perspective:1200px] [grid-area:1/-1] relative"
                >
                  <div
                    data-info-inner={i}
                    className="w-full h-full relative [transform-style:preserve-3d] [transform:rotateX(var(--rotX,0deg))_rotateY(var(--rotY,0deg))]"
                  >
                    <div className="absolute left-[-5%] bottom-[12%] h-fit text-white pointer-events-none [transform:translateZ(60px)] z-50">
                      <div className="overflow-hidden font-bold uppercase tracking-wider text-[calc(1.4rem+1cqw)] leading-none drop-shadow-md">
                        <span
                          className={`block transition-all duration-[var(--slide-transition-duration)] var(--slide-transition-easing) delay-100 ${isCurrent
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-full"
                            }`}
                        >
                          {slide.title}
                        </span>
                      </div>

                      <div className="overflow-hidden font-semibold text-neutral-200 uppercase tracking-wide text-[calc(0.9rem+0.5cqw)] mt-1.5 ml-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                        <span
                          className={`block transition-all duration-[var(--slide-transition-duration)] var(--slide-transition-easing) delay-150 ${isCurrent
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-full"
                            }`}
                        >
                          {slide.subtitle}
                        </span>
                      </div>

                      <div className="overflow-hidden font-light text-neutral-300 text-xs tracking-normal mt-2 ml-1.5 font-serif italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                        <span
                          className={`block transition-all duration-[var(--slide-transition-duration)] var(--slide-transition-easing) delay-200 ${isCurrent
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-full"
                            }`}
                        >
                          {slide.description}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => handleStep(1)}
          aria-label="Next Slide"
          className="w-12 h-12 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity z-50 group"
        >
          <svg
            className="w-10 h-10 stroke-white fill-none stroke-2 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Preloading Screen Loader */}
      <div
        className={`fixed inset-0 bg-neutral-950 grid place-items-center transition-opacity duration-500 z-[9999] pointer-events-none ${isLoaded ? "opacity-0" : "opacity-100"
          }`}
      >
        <div className="text-center space-y-2">
          <span className="block font-black tracking-widest text-white text-4xl md:text-6xl uppercase select-none">
            {loadingProgress}%
          </span>
          <span className="block text-[10px] uppercase text-neutral-500 tracking-[0.3em] animate-pulse">
            Syncing Environments
          </span>
        </div>
      </div>
    </div>
  );
}
