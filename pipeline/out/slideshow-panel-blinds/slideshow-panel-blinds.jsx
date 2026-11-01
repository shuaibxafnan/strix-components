"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_DECO_COLORS = ["#060b17", "#34365c", "#9f6794"];

export default function SlideshowPanelBlinds({
  images = DEFAULT_IMAGES,
  decoCount = 6,
  bgColor = "#000",
  textColor = "#fff",
  decoColors = DEFAULT_DECO_COLORS,
  panelDuration = 0.8,
  panelEase = "power4.inOut",
  closeStagger = 0.14,
  openStagger = 0.12,
  exitEase = "power4.in",
  exitScale = 0.1,
  enterStartScale = 0.6,
  enterDuration = 1.1,
  enterEase = "expo",
  enterLead = 0.8,
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
    decoRef.current = decoRef.current.slice(0, decoCount);

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

    let tlActive = null;
    let gsapRef = null;

    Promise.all([import("gsap"), import("gsap/Observer")])
      .then(async ([g, o]) => {
        await preloadImages(images);
        return [g.gsap || g.default, o.Observer || o.default];
      })
      .then(([gsap, Observer]) => {
        if (cancelled) return;
        if (!gsap || !Observer || !containerRef.current) return;
        gsapRef = gsap;

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

          const tl = gsap.timeline({
            defaults: {
              duration: panelDuration,
              ease: panelEase,
            },
            onComplete: () => {
              gsap.set(currentSlide, { pointerEvents: "none" });
              isAnimatingRef.current = false;
            },
          });

          tlActive = tl;
          tl.addLabel("start", 0);

          decoPanels.forEach((_, pos, arr) => {
            const panel = arr[arr.length - 1 - pos];
            tl.fromTo(
              panel,
              {
                xPercent: () => (pos % 2 === 1 ? -100 : 100),
                autoAlpha: 1,
              },
              {
                xPercent: () => (pos % 2 === 1 ? -50 : 50),
                onComplete: () => {
                  if (pos === arr.length - 1) {
                    gsap.set(upcomingSlide, {
                      autoAlpha: 1,
                      pointerEvents: "auto",
                    });
                  }
                },
              },
              `start+=${Math.floor((arr.length - 1 - pos) / 2) * closeStagger}`,
            );
            if (!pos) {
              tl.addLabel("middle", ">");
            }
          });

          tl.to(
            currentSlide,
            {
              ease: exitEase,
              scale: exitScale,
              onComplete: () => gsap.set(currentSlide, { scale: 1 }),
            },
            "start",
          );

          decoPanels.forEach((_, pos, arr) => {
            const panel = arr[arr.length - 1 - pos];
            tl.to(
              panel,
              {
                xPercent: () => (pos % 2 === 1 ? -100 : 100),
              },
              `middle+=${Math.floor(pos / 2) * openStagger}`,
            );
          });

          tl.fromTo(
            upcomingSlide,
            { scale: enterStartScale },
            {
              duration: enterDuration,
              ease: enterEase,
              scale: 1,
            },
            `>-${enterLead}`,
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
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
      if (tlActive) tlActive.kill();
      if (gsapRef) {
        gsapRef.killTweensOf([
          ...slidesRef.current,
          ...decoRef.current,
        ]);
      }
      navRef.current = null;
      isAnimatingRef.current = false;
      currentRef.current = 0;
    };
  }, [
    images,
    decoCount,
    decoColors,
    panelDuration,
    panelEase,
    closeStagger,
    openStagger,
    exitEase,
    exitScale,
    enterStartScale,
    enterDuration,
    enterEase,
    enterLead,
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
        {Array.from({ length: decoCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (decoRef.current[i] = el)}
            className="col-start-1 row-start-1 col-end-2 row-end-2 w-full h-full pointer-events-none opacity-0"
            style={{
              backgroundColor:
                decoColors[Math.floor(i / 2) % decoColors.length],
              willChange: "transform, opacity",
            }}
          />
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
