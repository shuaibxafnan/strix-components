"use client";

import { useEffect, useRef } from "react";

// ─── SlideshowMultiPanelBlinds ───────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    [5 urls]   Image URLs used for each slide
// decoCount         number   6          Number of staggered blind panels (paired, alternating direction)
// bgColor           string   #000       Page/container background color
// textColor         string   #fff       Color of the scroll hint text
// decoColors        array    [3 colors] Background colors cycled across the panel pairs
// panelDuration     number   0.8        Duration of each panel's tween (s)
// panelEase         string   power4.inOut  GSAP easing for the panel tweens
// closeStagger      number   0.14       Stagger delay between panel pairs closing in (s)
// openStagger       number   0.12       Stagger delay between panel pairs opening back out (s)
// exitEase          string   power4.in  GSAP easing for the outgoing slide's shrink
// exitScale         number   0.1        Scale the outgoing slide shrinks to while covered
// enterStartScale   number   0.6        Starting scale of the incoming slide as panels open
// enterDuration     number   1.1        Duration of the incoming slide's scale-in (s)
// enterEase         string   expo       GSAP easing for the incoming slide's scale-in
// enterLead         number   0.8        How much earlier (s) the incoming slide starts before panels fully open
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
      .catch((e) =>
        console.error(
          "[SlideshowMultiPanelBlinds] failed to initialize:",
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
