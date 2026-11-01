"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function SlideshowContrastPop({
  images = DEFAULT_IMAGES,
  bgColor = "#000",
  textColor = "#fff",
  phase1Duration = 0.7,
  phase1Ease = "expo",
  enterStartScale = 0.1,
  enterMidScale = 0.4,
  stretchScaleX = 4,
  contrastAmount = 120,
  saturateAmount = 140,
  phase2Delay = 0.6,
  phase2Duration = 1,
  phase2Ease = "power4.inOut",
  exitScale = 0.98,
  wheelSpeed = -1,
  wheelTolerance = 10,
  showNavButtons = true,
  scrollHintText = "scroll / drag",
  navButtonBg = "#fff",
  navButtonColor = "#000",
  navButtonSize = 60,
  navButtonHoverBg = "#ccc",
  className = "",
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
    let ctx = null;
    let timeline = null;

    Promise.all([import("gsap"), import("gsap/Observer"), preloadImages(images)])
      .then(([gsapModule, observerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap || gsapModule.default;
        const Observer = observerModule.Observer || observerModule.default;
        if (!containerRef.current) return;
        ctx = gsap;

        gsap.registerPlugin(Observer);

        const slides = slidesRef.current;
        const inners = innerRef.current;

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
          const currentInner = inners[previous];
          const upcomingSlide = slides[currentRef.current];
          const upcomingInner = inners[currentRef.current];

          timeline = gsap
            .timeline({
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
            .fromTo(
              upcomingSlide,
              {
                autoAlpha: 1,
                scale: enterStartScale,
                xPercent: direction * 100,
              },
              {
                duration: phase1Duration,
                ease: phase1Ease,
                scale: enterMidScale,
                xPercent: 0,
              },
              "start",
            )
            .fromTo(
              upcomingInner,
              {
                filter: "contrast(100%) saturate(100%)",
                transformOrigin: "100% 50%",
                scaleX: stretchScaleX,
              },
              {
                duration: phase1Duration,
                ease: phase1Ease,
                scaleX: 1,
              },
              "start",
            )
            .fromTo(
              currentInner,
              {
                filter: "contrast(100%) saturate(100%)",
              },
              {
                duration: phase1Duration,
                ease: phase1Ease,
                filter: `contrast(${contrastAmount}%) saturate(${saturateAmount}%)`,
              },
              "start",
            )
            .addLabel("middle", `start+=${phase2Delay}`)
            .to(
              upcomingSlide,
              {
                duration: phase2Duration,
                ease: phase2Ease,
                scale: 1,
              },
              "middle",
            )
            .to(
              currentSlide,
              {
                duration: phase2Duration,
                ease: phase2Ease,
                scale: exitScale,
                autoAlpha: 0,
              },
              "middle",
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
        console.error(
          "[SlideshowContrastPop] failed to initialize:",
          e.message,
        ),
      );

    return () => {
      cancelled = true;
      if (timeline) timeline.kill();
      if (ctx) {
        ctx.killTweensOf([...slidesRef.current, ...innerRef.current]);
      }
      isAnimatingRef.current = false;
      navRef.current = null;
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
    };
  }, [
    images,
    phase1Duration,
    phase1Ease,
    enterStartScale,
    enterMidScale,
    stretchScaleX,
    contrastAmount,
    saturateAmount,
    phase2Delay,
    phase2Duration,
    phase2Ease,
    exitScale,
    wheelSpeed,
    wheelTolerance,
  ]);

  const handlePrev = () => navRef.current && navRef.current.prev();
  const handleNext = () => navRef.current && navRef.current.next();

  return (
    <div
      className={`w-full h-screen relative overflow-hidden invisible ${className}`}
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
                willChange: "transform, opacity, filter",
              }}
            />
          </div>
        ))}
      </div>

      {showNavButtons && (
        <div
          className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center gap-2 z-10"
          style={{ color: textColor }}
        >
          <span className="mr-2 sm:mr-8 text-sm whitespace-nowrap">
            {scrollHintText}
          </span>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
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
            aria-label="Next slide"
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
