"use client";

import { useEffect, useRef } from "react";

// ─── SlideshowCurtainWipe ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    [3 urls]   Image URLs used for each slide
// bgColor           string   #000       Page/container background color
// textColor         string   #fff       Color of the scroll hint text
// decoColor         string   #8c718e    Background color of the curtain/deco panel
// exitDuration      number   0.4        Duration of the outgoing slide's initial exit (s)
// exitEase          string   power2.in  GSAP easing for the outgoing slide's initial exit
// exitInnerParallax number   75         Parallax % offset applied to the outgoing inner image
// exitInnerRotation number   2          Rotation degrees applied to the outgoing inner image
// decoDelay         number   0.5        Delay before the curtain sweeps away (s)
// enterEase         string   expo       GSAP easing for the curtain sweep and incoming slide
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
];

export default function SlideshowCurtainWipe({
  images = DEFAULT_IMAGES,
  bgColor = "#000",
  textColor = "#fff",
  decoColor = "#8c718e",
  exitDuration = 0.4,
  exitEase = "power2.in",
  exitInnerParallax = 75,
  exitInnerRotation = 2,
  decoDelay = 0.5,
  enterEase = "expo",
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
  const decoRef = useRef(null);
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
        const inners = innerRef.current;
        const deco = decoRef.current;

        gsap.set(slides, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(slides[0], { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(deco, { autoAlpha: 0 });
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

          gsap
            .timeline({
              defaults: {
                duration: 1.3,
              },
              onComplete: () => {
                gsap.set(currentSlide, { pointerEvents: "none" });
                isAnimatingRef.current = false;
              },
            })
            .addLabel("start", 0)
            .to(
              currentSlide,
              {
                duration: exitDuration,
                ease: exitEase,
                yPercent: -direction * 100,
              },
              "start",
            )
            .to(
              currentInner,
              {
                duration: exitDuration,
                ease: exitEase,
                yPercent: direction * exitInnerParallax,
                rotation: -direction * exitInnerRotation,
              },
              "start",
            )
            .fromTo(
              deco,
              {
                yPercent: direction * 100,
                autoAlpha: 1,
              },
              {
                duration: exitDuration,
                ease: exitEase,
                yPercent: 0,
              },
              "start",
            )
            .addLabel("middle", `start+=${decoDelay}`)
            .to(
              deco,
              {
                ease: enterEase,
                yPercent: -direction * 100,
              },
              "middle",
            )
            .fromTo(
              upcomingSlide,
              {
                autoAlpha: 1,
                yPercent: direction * 100,
              },
              {
                ease: enterEase,
                yPercent: 0,
                onStart: () =>
                  gsap.set(upcomingSlide, { pointerEvents: "auto" }),
              },
              "middle",
            )
            .fromTo(
              upcomingInner,
              {
                yPercent: -direction * exitInnerParallax,
                rotation: direction * exitInnerRotation,
              },
              {
                ease: enterEase,
                yPercent: 0,
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
          "[SlideshowCurtainWipe] failed to initialize:",
          e.message,
        ),
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
    exitDuration,
    exitEase,
    exitInnerParallax,
    exitInnerRotation,
    decoDelay,
    enterEase,
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
        <div
          ref={decoRef}
          className="col-start-1 row-start-1 col-end-2 row-end-2 w-full h-full pointer-events-none opacity-0"
          style={{
            backgroundColor: decoColor,
            willChange: "transform, opacity",
          }}
        />
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
