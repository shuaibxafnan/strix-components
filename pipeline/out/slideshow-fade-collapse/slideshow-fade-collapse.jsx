"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function SlideshowFadeCollapse({
  images = DEFAULT_IMAGES,
  bgColor = "#000",
  textColor = "#fff",
  shrinkDuration = 0.4,
  shrinkEase = "sine",
  shrinkScale = 0.9,
  shrinkAlpha = 0.2,
  exitOffset = 20,
  mainDuration = 1.25,
  mainEase = "power4.inOut",
  startOffset = 0.1,
  innerParallax = 50,
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

    let tl = null;

    Promise.all([import("gsap"), import("gsap/Observer")])
      .then(([g, o]) => preloadImages(images).then(() => [g, o]))
      .then(([g, o]) => {
        if (cancelled) return;
        const gsap = g.gsap || g.default;
        const Observer = o.Observer || o.default;
        if (!containerRef.current) return;

        gsap.registerPlugin(Observer);
        gsap.config({ trialWarn: false });

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
          const upcomingSlide = slides[currentRef.current];
          const upcomingInner = inners[currentRef.current];

          tl = gsap
            .timeline({
              defaults: {
                duration: mainDuration,
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
                duration: shrinkDuration,
                ease: shrinkEase,
                scale: shrinkScale,
                autoAlpha: shrinkAlpha,
              },
              "start",
            )
            .to(
              currentSlide,
              {
                yPercent: -direction * exitOffset,
                autoAlpha: 0,
              },
              `start+=${startOffset}`,
            )
            .fromTo(
              upcomingSlide,
              {
                autoAlpha: 1,
                scale: 1,
                yPercent: direction * 100,
              },
              {
                yPercent: 0,
              },
              `start+=${startOffset}`,
            )
            .fromTo(
              upcomingInner,
              {
                yPercent: -direction * innerParallax,
              },
              {
                yPercent: 0,
              },
              `start+=${startOffset}`,
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
      .catch(() => {});

    return () => {
      cancelled = true;
      if (tl) tl.kill();
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
    };
  }, [
    images,
    shrinkDuration,
    shrinkEase,
    shrinkScale,
    shrinkAlpha,
    exitOffset,
    mainDuration,
    mainEase,
    startOffset,
    innerParallax,
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
