"use client";

import { useEffect, useRef, useState } from "react";
const SLIDE_DEFAULTS = [
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1600&q=80",
    title: "URBAN GEOMETRY",
    paragraph:
      "The city speaks in angles and lines. What appears chaotic is actually ordered. When we slow down enough to truly see, patterns emerge from noise. Photography is meditation—a practice of presence that reveals the hidden structure beneath the surface of our daily experience.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1600&q=80",
    title: "NATURAL ABSTRACTIONS",
    paragraph:
      "Nature doesn't try to be beautiful. It simply is. These patterns exist whether we observe them or not. The creative act is not about making something new, but about seeing what's already there. True art emerges when we remove ourselves from the equation.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1600&q=80",
    title: "SHADOW PLAY",
    paragraph:
      "Light creates shadow. Shadow defines light. Neither exists without the other. This duality mirrors our own inner landscape. The photograph captures not just the external world, but the photographer's state of mind. What we choose to frame reveals what we value.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1600&q=80",
    title: "MINIMALIST FORMS",
    paragraph:
      "When we strip away the unnecessary, what remains? The essence. The truth. These images aren't about what's there, but what isn't. Silence between notes creates the music. The space between thoughts is where creativity lives. Simplicity is the ultimate sophistication.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1600&q=80",
    title: "MONOCHROME SERIES",
    paragraph:
      "Without color, we see differently. Form and texture speak louder. The world simplified to light and dark reveals truths that color often conceals. In this space between extremes, we find clarity. The photograph becomes a mirror reflecting not just what we see, but how we see.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=1600&q=80",
    title: "TEXTURAL STUDIES",
    paragraph:
      "Touch with your eyes. Feel the rough and smooth. These surfaces tell stories of time and transformation. Our minds crave texture—it grounds us in the physical world. In an increasingly digital existence, these tactile reminders connect us to our primal nature and the healing power of sensory experience.",
  },
];

// ─── loadScript ───────────────────────────────────────────────────────────────
// Injects a <script> tag once; resolves when loaded. Never uses import() so
// Turbopack never tries to bundle external CDN URLs at build time.
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-cdn="${src}"]`);
    if (existing) {
      if (existing.dataset.ready === "1") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Failed: ${src}`)),
          { once: true },
        );
      }
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-cdn", src);
    el.onload = () => {
      el.dataset.ready = "1";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

// ─── GridSlider ───────────────────────────────────────────────────────────────
export default function SeamlessGrid({
  slides = SLIDE_DEFAULTS,
  bgColor = "#111",
  textColor = "#f0f0f0",
  accentColor = "#ffffff",
  fontDisplay = "'PP Neue Montreal', 'Helvetica Neue', sans-serif",
  fontMono = "'TheGoodMonolith', 'Courier New', monospace",
  preloaderDuration = 2048,
  defaultActiveIndex = 4,
  thumbnailWidth = "60px",
  thumbnailHeight = "40px",
  gridCols = 3,
  gridRows = 2,
}) {
  // ── React state — only for preloader counter (pure display) ─────────────────
  const [count, setCount] = useState(0);
  const [preloaderHidden, setPreloaderHidden] = useState(false);
  const [ready, setReady] = useState(false);

  // ── DOM refs — everything GSAP touches must be a ref, not state ──────────────
  const gridRef = useRef(null);
  const sliderImageRef = useRef(null);
  const sliderImageBgRef = useRef(null);
  const sliderImageNextRef = useRef(null);
  const transitionOverlayRef = useRef(null);
  const contentRef = useRef(null);
  const contentTitleSpanRef = useRef(null);
  const contentParagraphRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const switchContainerRef = useRef(null);
  const gridItemRefs = useRef([]);

  // ── Internal mutable state (not React state — avoids stale closures) ─────────
  const stateRef = useRef({
    currentMode: "grid",
    isAnimating: false,
    activeIndex: defaultActiveIndex,
    slideDirection: "right",
  });

  // ── Font injection ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("gridslider-fonts")) return;
    const link = document.createElement("link");
    link.id = "gridslider-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/thegoodmonolith";
    document.head.appendChild(link);
  }, []);

  // ── Preloader counter ─────────────────────────────────────────────────────────
  useEffect(() => {
    const increment = 5;
    const interval = preloaderDuration / (100 / increment); // keep same pace regardless of duration
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current <= 100) {
        setCount(current);
      } else {
        setCount(100);
        clearInterval(timer);
        setTimeout(() => {
          setPreloaderHidden(true);
          setTimeout(() => setReady(true), 256);
        }, 256);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [preloaderDuration]);

  // ── GSAP init — runs once component is "ready" ────────────────────────────────
  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    const init = async () => {
      try {
        // Load GSAP + plugins via script tag (Turbopack-safe)
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
        );
        if (cancelled) return;

        const { gsap, Flip, CustomEase } = window;
        gsap.registerPlugin(Flip, CustomEase);
        gsap.config({ trialWarn: false });

        // ── Custom eases (match original exactly) ───────────────────────────
        CustomEase.create("mainEase", "M0,0 C0.65,0.05 0.36,1 1,1");
        CustomEase.create("sideEase", "M0,0 C0.86,0 0.07,1 1,1");

        // ── Timing constants (power-of-2 ms → seconds) ──────────────────────
        const T = {
          BASE: 0.512,
          SHORTEST: 0.256,
          SHORT: 0.384,
          LONG: 0.768,
          STAGGER_TINY: 0.032,
          STAGGER_SMALL: 0.064,
          STAGGER_MED: 0.128,
        };

        const st = stateRef.current;
        const grid = gridRef.current;
        const sliderImage = sliderImageRef.current;
        const sliderImageBg = sliderImageBgRef.current;
        const sliderImageNext = sliderImageNextRef.current;
        const transitionOverlay = transitionOverlayRef.current;
        const contentEl = contentRef.current;
        const titleSpan = contentTitleSpanRef.current;
        const paragraph = contentParagraphRef.current;
        const thumbs = thumbnailRefs.current;

        if (!grid || !sliderImage) return;

        // ── updateContent ──────────────────────────────────────────────────
        const updateContent = (index) => {
          if (titleSpan) titleSpan.textContent = slides[index].title;
          if (paragraph) paragraph.textContent = slides[index].paragraph;
        };

        // ── showSliderView ─────────────────────────────────────────────────
        const showSliderView = () =>
          new Promise((resolve) => {
            const activeItem = gridItemRefs.current[st.activeIndex];
            if (!activeItem) return resolve();
            const rect = activeItem.getBoundingClientRect();

            const imgUrl = `url(${slides[st.activeIndex].image})`;
            sliderImage.style.backgroundImage = imgUrl;
            sliderImageBg.style.backgroundImage = imgUrl;
            updateContent(st.activeIndex);

            gsap.set(sliderImage, {
              width: rect.width,
              height: rect.height,
              x: rect.left,
              y: rect.top,
              opacity: 1,
              visibility: "visible",
            });

            // Step 1 — expand height
            const heightState = Flip.getState(sliderImage);
            gsap.set(sliderImage, {
              height: "100vh",
              y: 0,
              width: rect.width,
              x: rect.left,
            });
            Flip.from(heightState, {
              duration: T.BASE,
              ease: "mainEase",
              onComplete: () => {
                // Step 2 — expand width
                const widthState = Flip.getState(sliderImage);
                gsap.set(sliderImage, { width: "100vw", x: 0 });
                Flip.from(widthState, {
                  duration: T.BASE,
                  ease: "mainEase",
                  onComplete: () => {
                    gsap.to(grid, {
                      opacity: 0,
                      duration: T.SHORTEST,
                      ease: "power2.inOut",
                    });

                    const tl = gsap.timeline({ onComplete: resolve });
                    tl.to(
                      contentEl,
                      { opacity: 1, duration: T.SHORT, ease: "mainEase" },
                      0,
                    );
                    tl.to(
                      titleSpan,
                      { y: 0, duration: T.BASE, ease: "sideEase" },
                      T.STAGGER_TINY,
                    );
                    tl.to(
                      paragraph,
                      { opacity: 1, duration: T.BASE, ease: "mainEase" },
                      T.STAGGER_SMALL,
                    );
                    tl.to(
                      thumbs,
                      {
                        opacity: 1,
                        y: 0,
                        duration: T.SHORT,
                        stagger: T.STAGGER_TINY,
                        ease: "sideEase",
                      },
                      T.STAGGER_MED,
                    );
                  },
                });
              },
            });
          });

        // ── showGridView ───────────────────────────────────────────────────
        const showGridView = () =>
          new Promise((resolve) => {
            const activeItem = gridItemRefs.current[st.activeIndex];
            if (!activeItem) return resolve();
            const rect = activeItem.getBoundingClientRect();

            const tl = gsap.timeline({
              onComplete: () => {
                gsap.to(grid, {
                  opacity: 1,
                  duration: T.SHORTEST,
                  ease: "power2.inOut",
                });
                gsap.set([sliderImageNext, sliderImageBg, transitionOverlay], {
                  opacity: 0,
                  visibility: "hidden",
                });

                // Step 1 — shrink width
                const widthState = Flip.getState(sliderImage);
                gsap.set(sliderImage, {
                  width: rect.width,
                  x: rect.left,
                  height: "100vh",
                  y: 0,
                });
                Flip.from(widthState, {
                  duration: T.BASE,
                  ease: "mainEase",
                  onComplete: () => {
                    // Step 2 — shrink height
                    const heightState = Flip.getState(sliderImage);
                    gsap.set(sliderImage, { height: rect.height, y: rect.top });
                    Flip.from(heightState, {
                      duration: T.BASE,
                      ease: "mainEase",
                      onComplete: () => {
                        gsap.to(sliderImage, {
                          opacity: 0,
                          duration: T.SHORTEST,
                          ease: "power2.inOut",
                          onComplete: () => {
                            sliderImage.style.visibility = "hidden";
                            resolve();
                          },
                        });
                      },
                    });
                  },
                });
              },
            });

            tl.to(
              thumbs,
              {
                opacity: 0,
                y: 20,
                duration: T.SHORT,
                stagger: -T.STAGGER_TINY,
                ease: "sideEase",
              },
              0,
            );
            tl.to(
              paragraph,
              { opacity: 0, duration: T.SHORT, ease: "mainEase" },
              T.STAGGER_TINY,
            );
            tl.to(
              titleSpan,
              { y: "100%", duration: T.SHORT, ease: "sideEase" },
              T.STAGGER_SMALL,
            );
            tl.to(
              contentEl,
              { opacity: 0, duration: T.SHORT, ease: "mainEase" },
              T.STAGGER_MED,
            );
          });

        // ── transitionToSlide ──────────────────────────────────────────────
        const transitionToSlide = (index) => {
          if (st.isAnimating || index === st.activeIndex) return;
          st.isAnimating = true;
          st.slideDirection = index > st.activeIndex ? "right" : "left";

          // Update active thumbnail highlight
          thumbs.forEach((t, i) => {
            if (!t) return;
            t.style.border = i === index ? `2px solid ${accentColor}` : "";
          });

          const newUrl = `url(${slides[index].image})`;
          sliderImageNext.style.backgroundImage = newUrl;
          sliderImageBg.style.backgroundImage = newUrl;

          gsap.set([sliderImageNext, sliderImageBg], { visibility: "visible" });

          const xOffset = st.slideDirection === "right" ? "100%" : "-100%";
          gsap.set(sliderImageNext, {
            x: xOffset,
            y: 0,
            opacity: 1,
            width: "100vw",
            height: "100vh",
          });
          gsap.set(sliderImageBg, {
            x: xOffset,
            y: 0,
            opacity: 0.9,
            width: "100vw",
            height: "100vh",
            scale: 1,
          });

          const masterTl = gsap.timeline({
            onComplete: () => {
              sliderImage.style.backgroundImage = newUrl;
              gsap.set([sliderImageNext, sliderImageBg, transitionOverlay], {
                opacity: 0,
                x: 0,
                y: 0,
                visibility: "hidden",
              });
              gsap.set(sliderImage, { x: 0, opacity: 1 });
              updateContent(index);
              st.activeIndex = index;

              const showTl = gsap.timeline({
                onComplete: () => {
                  st.isAnimating = false;
                },
              });
              showTl.to(
                titleSpan,
                { y: 0, duration: T.BASE, ease: "sideEase" },
                0,
              );
              showTl.to(
                paragraph,
                { opacity: 1, duration: T.BASE, ease: "mainEase" },
                T.STAGGER_SMALL,
              );
            },
          });

          masterTl.to(
            paragraph,
            { opacity: 0, duration: T.SHORT, ease: "mainEase" },
            0,
          );
          masterTl.to(
            titleSpan,
            { y: "100%", duration: T.SHORT, ease: "sideEase" },
            T.STAGGER_TINY,
          );
          masterTl.to(
            transitionOverlay,
            {
              opacity: 0.15,
              duration: T.SHORTEST,
              ease: "power1.in",
              visibility: "visible",
            },
            T.STAGGER_SMALL,
          );
          masterTl.to(
            transitionOverlay,
            { opacity: 0, duration: T.SHORT, ease: "power1.out" },
            T.STAGGER_MED,
          );
          masterTl.to(
            sliderImage,
            {
              x: st.slideDirection === "right" ? "-35%" : "35%",
              opacity: 1,
              duration: T.LONG,
              ease: "mainEase",
            },
            0,
          );
          masterTl.to(
            sliderImageBg,
            {
              x: st.slideDirection === "right" ? "-10%" : "10%",
              y: 0,
              opacity: 0.95,
              scale: 1,
              duration: T.LONG,
              ease: "sideEase",
            },
            T.STAGGER_TINY,
          );
          masterTl.to(
            sliderImageNext,
            { x: 0, opacity: 1, duration: T.LONG, ease: "sideEase" },
            T.STAGGER_SMALL,
          );
        };

        // ── toggleView ─────────────────────────────────────────────────────
        const toggleView = (mode) => {
          if (st.isAnimating || st.currentMode === mode) return;
          st.isAnimating = true;
          st.currentMode = mode;
          if (mode === "slider")
            showSliderView().then(() => {
              st.isAnimating = false;
            });
          else
            showGridView().then(() => {
              st.isAnimating = false;
            });
        };

        // ── Expose toggleView + transitionToSlide on the DOM nodes so event
        //    listeners attached below can call them without closure staleness ──
        if (switchContainerRef.current) {
          switchContainerRef.current.__toggleView = toggleView;
        }
        if (gridRef.current) {
          gridRef.current.__transitionToSlide = transitionToSlide;
        }

        // ── Thumbnail click handlers ───────────────────────────────────────
        thumbs.forEach((thumb, i) => {
          if (!thumb) return;
          thumb.addEventListener("click", () => {
            if (st.currentMode !== "slider") return;
            transitionToSlide(i);
          });
        });

        // ── Keyboard navigation ────────────────────────────────────────────
        const onKeyDown = (e) => {
          if (st.currentMode !== "slider" || st.isAnimating) return;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            transitionToSlide((st.activeIndex + 1) % slides.length);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            transitionToSlide(
              (st.activeIndex - 1 + slides.length) % slides.length,
            );
          }
        };
        document.addEventListener("keydown", onKeyDown);

        // ── Touch / swipe ──────────────────────────────────────────────────
        let touchStartX = 0;
        const onTouchStart = (e) => {
          touchStartX = e.changedTouches[0].screenX;
        };
        const onTouchEnd = (e) => {
          if (st.currentMode !== "slider" || st.isAnimating) return;
          const diff = touchStartX - e.changedTouches[0].screenX;
          if (Math.abs(diff) < 50) return;
          transitionToSlide(
            diff > 0
              ? (st.activeIndex + 1) % slides.length
              : (st.activeIndex - 1 + slides.length) % slides.length,
          );
        };
        document.addEventListener("touchstart", onTouchStart);
        document.addEventListener("touchend", onTouchEnd);

        // ── Resize handler ─────────────────────────────────────────────────
        const onResize = () => {
          if (st.currentMode !== "slider") return;
          gsap.set(sliderImage, {
            width: "100vw",
            height: "100vh",
            x: 0,
            y: 0,
          });
        };
        window.addEventListener("resize", onResize);

        // Store cleanups
        stateRef.current._cleanup = () => {
          document.removeEventListener("keydown", onKeyDown);
          document.removeEventListener("touchstart", onTouchStart);
          document.removeEventListener("touchend", onTouchEnd);
          window.removeEventListener("resize", onResize);
        };
      } catch (e) {
        console.error("[GridSlider] GSAP init failed:", e.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      stateRef.current._cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ── Switch button handlers (stable — read mode via stateRef) ─────────────────
  const handleSwitchGrid = () => {
    switchContainerRef.current?.__toggleView?.("grid");
  };
  const handleSwitchSlider = () => {
    switchContainerRef.current?.__toggleView?.("slider");
  };

  // ── Switch button hover padding (runtime, can't be Tailwind) ─────────────────
  const onSwitchEnter = (side) => {
    if (!switchContainerRef.current) return;
    switchContainerRef.current.style[
      side === "grid" ? "paddingLeft" : "paddingRight"
    ] = "30px";
  };
  const onSwitchLeave = () => {
    if (!switchContainerRef.current) return;
    switchContainerRef.current.style.paddingLeft = "20px";
    switchContainerRef.current.style.paddingRight = "20px";
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontMono,
      }}
    >
      {/* ── Preloader ────────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[9999] transition-[opacity,visibility] duration-500 ease-in-out ${preloaderHidden ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
        style={{ backgroundColor: bgColor }}
      >
        <span
          className="text-[3rem]"
          style={{ color: textColor, fontFamily: fontMono }}
        >
          {count}
        </span>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={gridRef}
          className="w-full h-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            willChange: "transform",
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              ref={(el) => {
                gridItemRefs.current[i] = el;
              }}
              data-index={i}
              className="relative overflow-hidden"
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Slider layers (stacking order matches original exactly) ──────────── */}

      {/* Base layer — current slide */}
      <div
        ref={sliderImageRef}
        className="fixed inset-0 w-full h-screen bg-cover bg-center invisible opacity-0"
        style={{ zIndex: 80, willChange: "transform, opacity" }}
      />

      {/* Background parallax layer */}
      <div
        ref={sliderImageBgRef}
        className="fixed top-0 left-0 bg-cover bg-center invisible opacity-0"
        style={{
          width: "110%",
          height: "110vh",
          zIndex: 85,
          willChange: "transform",
          transformOrigin: "center",
        }}
      />

      {/* Top layer — next slide */}
      <div
        ref={sliderImageNextRef}
        className="fixed inset-0 w-full h-screen bg-cover bg-center invisible opacity-0"
        style={{
          zIndex: 90,
          willChange: "transform",
          transformOrigin: "center",
        }}
      />

      {/* Transition overlay */}
      <div
        ref={transitionOverlayRef}
        className="fixed inset-0 w-full h-screen invisible opacity-0"
        style={{ backgroundColor: "#000", zIndex: 95, willChange: "opacity" }}
      />

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="fixed inset-0 w-full h-full pointer-events-none opacity-0 flex flex-col justify-end"
        style={{ zIndex: 100, padding: "10% 10%" }}
      >
        {/* Title with overflow hidden for slide-up reveal */}
        <h1
          className="text-left text-[5rem] uppercase mb-6 overflow-hidden"
          style={{
            fontFamily: fontDisplay,
            color: textColor,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <span
            ref={contentTitleSpanRef}
            className="block"
            style={{ transform: "translateY(100%)" }}
          >
            {slides[defaultActiveIndex].title}
          </span>
        </h1>

        {/* Body paragraph */}
        <p
          ref={contentParagraphRef}
          className="text-left text-[1rem] max-w-[600px] opacity-0 mb-[10%]"
          style={{ fontFamily: fontMono, color: textColor, lineHeight: 1.3 }}
        >
          {slides[defaultActiveIndex].paragraph}
        </p>
      </div>

      {/* ── Thumbnails ───────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-5 right-5 flex gap-[10px]"
        style={{ zIndex: 200 }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              thumbnailRefs.current[i] = el;
            }}
            data-index={i}
            className="rounded-[4px] overflow-hidden cursor-pointer opacity-0 hover:border-2 hover:border-white/70 transition-[border] duration-300"
            style={{
              width: thumbnailWidth,
              height: thumbnailHeight,
              transform: "translateY(20px)",
              border:
                i === defaultActiveIndex ? `2px solid ${accentColor}` : "",
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </div>
        ))}
      </div>

      {/* ── Switch buttons ────────────────────────────────────────────────────── */}
      <div
        ref={switchContainerRef}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-5 rounded-[4px] z-[1000] transition-[padding] duration-300 ease-in-out"
        style={{ backgroundColor: "#222", padding: "10px 20px" }}
      >
        {/* GRID button */}
        {/* GRID button — group so the dot responds to button hover, not just its own */}
        <button
          onClick={handleSwitchGrid}
          onMouseEnter={() => onSwitchEnter("grid")}
          onMouseLeave={onSwitchLeave}
          className="group switch-button-grid relative bg-transparent border-none cursor-pointer text-[14px] px-[10px] py-[5px] transition-all duration-300 ease-in-out"
          style={{ fontFamily: fontMono, color: textColor }}
        >
          {/* Indicator dot — left side, shown on group (button) hover */}
          <span
            className="absolute w-[5px] h-[5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundColor: textColor,
              top: "50%",
              left: "-8px",
              transform: "translateY(-50%)",
            }}
          />
          GRID
        </button>

        {/* SLIDER button */}
        <button
          onClick={handleSwitchSlider}
          onMouseEnter={() => onSwitchEnter("slider")}
          onMouseLeave={onSwitchLeave}
          className="group switch-button-slider relative bg-transparent border-none cursor-pointer text-[14px] px-[10px] py-[5px] text-[#666] transition-all duration-300 ease-in-out"
          style={{ fontFamily: fontMono }}
        >
          SLIDER
          {/* Indicator dot — right side, shown on group (button) hover */}
          <span
            className="absolute w-[5px] h-[5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundColor: textColor,
              top: "50%",
              right: "-8px",
              transform: "translateY(-50%)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
