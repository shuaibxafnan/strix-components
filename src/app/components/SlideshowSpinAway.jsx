"use client";

import { useEffect, useRef } from "react";

// ─── SlideshowSpinAway ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    [5 urls]   Image URLs used for each slide
// bgColor           string   #000       Page/container background color
// textColor         string   #fff       Color of the scroll hint text
// mainEase          string   expo       Default GSAP easing applied to the timeline
// exitDuration      number   1          Duration of the outgoing slide's spin/shrink (s)
// exitEase          string   power4     GSAP easing for the outgoing spin/shrink
// exitRotation      number   500        Rotation degrees applied to the outgoing slide
// exitXPercent      number   -20        Horizontal shift applied to the outgoing slide
// enterDelay        number   0.3        Delay before the incoming slide starts (s)
// enterDuration     number   0.6        Duration of the incoming slide's spin-in (s)
// enterEase         string   power4     GSAP easing for the incoming spin-in
// enterStartScale   number   1.4        Starting scale of the incoming slide
// enterStartRotation number  -90        Starting rotation degrees of the incoming slide
// enterXPercent     number   20         Starting horizontal offset of the incoming slide
// wheelSpeed        number   -1         Wheel direction multiplier (-1 inverts scroll)
// wheelTolerance    number   10         Minimum wheel/touch delta to trigger navigation
// showNavButtons    boolean  true       Show/hide the prev/next circular buttons
// scrollHintText    string   "scroll / drag"  Label shown next to the nav buttons
// navButtonBg       string   #fff       Background color of the nav buttons
// navButtonColor    string   #000       Icon/text color of the nav buttons
// navButtonSize     number   60         Diameter of the nav buttons (px)
// navButtonHoverBg  string   #ccc       Background color of the nav buttons on hover
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function SlideshowSpinAway({
  images = DEFAULT_IMAGES,
  bgColor = "#000",
  textColor = "#fff",
  mainEase = "expo",
  exitDuration = 1,
  exitEase = "power4",
  exitRotation = 500,
  exitXPercent = -20,
  enterDelay = 0.3,
  enterDuration = 0.6,
  enterEase = "power4",
  enterStartScale = 1.4,
  enterStartRotation = -90,
  enterXPercent = 20,
  wheelSpeed = -1,
  wheelTolerance = 10,
  showNavButtons = true,
  scrollHintText = "scroll / drag",
  navButtonBg = "#fff",
  navButtonColor = "#000",
  navButtonSize = 60,
  navButtonHoverBg = "#ccc",
}) {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const innerRef = useRef([]);
  const currentRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const observerRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    slidesRef.current = slidesRef.current.slice(0, images.length);
    innerRef.current = innerRef.current.slice(0, images.length);

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

    const preloadImages = (urls) =>
      Promise.all(
        urls.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = src;
              img.onload = resolve;
              img.onerror = resolve;
            }),
        ),
      );

    let cancelled = false;

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Observer.min.js",
      ),
    ])
      .then(() => preloadImages(images))
      .then(() => {
        if (cancelled) return;
        const { gsap, Observer } = window;
        if (!gsap || !Observer || !containerRef.current) return;

        gsap.registerPlugin(Observer);
        gsap.config({ trialWarn: false });

        const slides = slidesRef.current;

        gsap.set(slides, { autoAlpha: 0, pointerEvents: "none", zIndex: 1 });
        gsap.set(slides[0], { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(containerRef.current, { visibility: "visible" });

        const navigate = (direction) => {
          if (isAnimatingRef.current) return;
          isAnimatingRef.current = true;

          const previous = currentRef.current;
          const total = slides.length;
          currentRef.current =
            direction === 1
              ? previous < total - 1
                ? previous + 1
                : 0
              : previous > 0
                ? previous - 1
                : total - 1;

          const currentSlide = slides[previous];
          const upcomingSlide = slides[currentRef.current];

          gsap
            .timeline({
              defaults: {
                ease: mainEase,
              },
              onStart: () => {
                gsap.set(upcomingSlide, { zIndex: 99, pointerEvents: "auto" });
              },
              onComplete: () => {
                gsap.set(currentSlide, { pointerEvents: "none" });
                gsap.set(upcomingSlide, { zIndex: 1 });
                isAnimatingRef.current = false;
              },
            })
            .addLabel("start", 0)
            .to(
              currentSlide,
              {
                duration: exitDuration,
                ease: exitEase,
                rotation: exitRotation,
                scale: 0,
                xPercent: exitXPercent,
                onComplete: () =>
                  gsap.set(currentSlide, {
                    rotation: 0,
                    scale: 1,
                    autoAlpha: 0,
                  }),
              },
              "start",
            )
            .fromTo(
              upcomingSlide,
              {
                autoAlpha: 0,
                scale: enterStartScale,
                rotation: enterStartRotation,
                xPercent: enterXPercent,
              },
              {
                duration: enterDuration,
                ease: enterEase,
                autoAlpha: 1,
                scale: 1,
                rotation: 0,
                xPercent: 0,
              },
              `start+=${enterDelay}`,
            );
        };

        navRef.current = { next: () => navigate(1), prev: () => navigate(-1) };

        observerRef.current = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onDown: () => navigate(-1),
          onUp: () => navigate(1),
          wheelSpeed,
          tolerance: wheelTolerance,
        });
      })
      .catch((e) =>
        console.error("[SlideshowSpinAway] failed to initialize:", e.message),
      );

    return () => {
      cancelled = true;
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
    };
  }, [
    images,
    mainEase,
    exitDuration,
    exitEase,
    exitRotation,
    exitXPercent,
    enterDelay,
    enterDuration,
    enterEase,
    enterStartScale,
    enterStartRotation,
    enterXPercent,
    wheelSpeed,
    wheelTolerance,
  ]);

  const handlePrev = () => navRef.current && navRef.current.prev();
  const handleNext = () => navRef.current && navRef.current.next();

  return (
    <div
      className="w-full h-screen relative overflow-hidden invisible"
      style={{ backgroundColor: bgColor }}
      ref={containerRef}
    >
      <div className="absolute inset-0 grid">
        {images.map((src, i) => (
          <div
            key={i}
            ref={(el) => (slidesRef.current[i] = el)}
            className="col-start-1 row-start-1 col-end-2 row-end-2 w-full h-full grid place-items-center overflow-hidden opacity-0 pointer-events-none"
            style={{ willChange: "transform, opacity" }}
          >
            <div
              ref={(el) => (innerRef.current[i] = el)}
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${src})`,
                willChange: "transform, opacity",
              }}
            />
          </div>
        ))}
      </div>

      {showNavButtons && (
        <div
          className="absolute bottom-8 right-8 flex items-center gap-2 z-10"
          style={{ color: textColor }}
        >
          <span className="mr-8 text-sm whitespace-nowrap">
            {scrollHintText}
          </span>
          <button
            onClick={handlePrev}
            className="rounded-full grid place-items-center border-0 cursor-pointer transition-colors duration-300"
            style={{
              width: navButtonSize,
              height: navButtonSize,
              backgroundColor: navButtonBg,
              color: navButtonColor,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = navButtonHoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = navButtonBg)
            }
          >
            &larr;
          </button>
          <button
            onClick={handleNext}
            className="rounded-full grid place-items-center border-0 cursor-pointer transition-colors duration-300"
            style={{
              width: navButtonSize,
              height: navButtonSize,
              backgroundColor: navButtonBg,
              color: navButtonColor,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = navButtonHoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = navButtonBg)
            }
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
