"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function SlideshowCurtainZoom({
  images = DEFAULT_IMAGES,
  bgColor = "#000",
  textColor = "#fff",
  decoColor = "#000",
  phase1Duration = 0.8,
  phase1Ease = "power3.inOut",
  zoomScale = 1.1,
  zoomRotation = 2,
  phase2Duration = 1.1,
  phase2Ease = "expo",
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
  const decoRef = useRef([]);
  const currentRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const observerRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    slidesRef.current = slidesRef.current.slice(0, images.length);
    decoRef.current = decoRef.current.slice(0, 2);

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

    let gsap = null;

    Promise.all([import("gsap"), import("gsap/Observer")])
      .then(([g, o]) => {
        gsap = g.gsap || g.default;
        return Promise.all([o.Observer || o.default, preloadImages(images)]).then(
          ([Observer]) => [Observer],
        );
      })
      .then(([Observer]) => {
        if (cancelled) return;
        if (!gsap || !Observer || !containerRef.current) return;

        gsap.registerPlugin(Observer);
        
        const slides = slidesRef.current;
        const decoPanels = decoRef.current;

        gsap.set(slides, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(slides[0], { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(decoPanels, { autoAlpha: 0 });
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
                duration: phase1Duration,
                ease: phase1Ease,
              },
              onComplete: () => {
                gsap.set(currentSlide, { pointerEvents: "none" });
                isAnimatingRef.current = false;
              },
            })
            .addLabel("start", 0)
            .fromTo(
              decoPanels,
              {
                yPercent: (pos) => (pos ? -100 : 100),
                autoAlpha: 1,
              },
              {
                yPercent: (pos) => (pos ? -50 : 50),
              },
              "start",
            )
            .to(
              currentSlide,
              {
                scale: zoomScale,
                rotation: direction * zoomRotation,
              },
              "start",
            )
            .addLabel("middle", ">")
            .add(() => {
              gsap.set(upcomingSlide, {
                autoAlpha: 1,
                pointerEvents: "auto",
              });
            }, "middle")
            .to(
              decoPanels,
              {
                duration: phase2Duration,
                ease: phase2Ease,
                yPercent: (pos) => (pos ? -100 : 100),
              },
              "middle",
            )
            .fromTo(
              upcomingSlide,
              {
                scale: zoomScale,
                rotation: direction * zoomRotation,
              },
              {
                duration: phase2Duration,
                ease: phase2Ease,
                scale: 1,
                rotation: 0,
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
          "[SlideshowCurtainZoom] failed to initialize:",
          e.message,
        ),
      );

    return () => {
      cancelled = true;
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
      if (gsap) {
        gsap.killTweensOf([
          ...slidesRef.current,
          ...decoRef.current,
        ]);
      }
      isAnimatingRef.current = false;
    };
  }, [
    images,
    phase1Duration,
    phase1Ease,
    zoomScale,
    zoomRotation,
    phase2Duration,
    phase2Ease,
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
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${src})`,
                willChange: "transform, opacity",
              }}
            />
          </div>
        ))}
        {[0, 1].map((i) => (
          <div
            key={i}
            ref={(el) => (decoRef.current[i] = el)}
            className="col-start-1 row-start-1 col-end-2 row-end-2 w-full h-full pointer-events-none opacity-0"
            style={{
              backgroundColor: decoColor,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>

      {showNavButtons && (
        <div
          className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center gap-2 z-10"
          style={{ color: textColor }}
        >
          <span className="mr-2 sm:mr-8 text-sm whitespace-nowrap hidden sm:inline">
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
