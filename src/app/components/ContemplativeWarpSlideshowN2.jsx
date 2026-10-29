"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1600&q=80",
    lines: ["BETWEEN SHADOW", "AND LIGHT"],
  },
  {
    img: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
    lines: ["SILENCE SPEAKS", "THROUGH FORM"],
  },
  {
    img: "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1600&q=80",
    lines: ["ESSENCE BEYOND", "PERCEPTION"],
  },
  {
    img: "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1600&q=80",
    lines: ["TRUTH IN", "EMPTINESS"],
  },
  {
    img: "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1600&q=80",
    lines: ["SURRENDER TO", "THE VOID"],
  },
];

export default function ContemplativeWarpSlideshowN2({
  slidesData = DEFAULT_SLIDES,
  slideDuration = 1.5,
  cursorActiveTime = 2000,
  fontClass = "font-sans",
  textTracking = "tracking-[-0.02em]",
  seriesTitle = "Contemplative Series",
  seriesDesc = "Navigate through a visual journey exploring the boundaries between form and emptiness.",
}) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
        el.onerror = () => reject(new Error(`Script fallback broken: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
      ),
    ])
      .then(() => {
        const { gsap, CustomEase } = window;
        // Strict baseline defensive checkpoint
        if (!gsap || !CustomEase || !containerRef.current) return;

        gsap.registerPlugin(CustomEase);

        CustomEase.create("textReveal", "0.77, 0, 0.175, 1");
        CustomEase.create("counterSlide", "0.25, 1, 0.5, 1");
        CustomEase.create("zoomIn", "0.16, 1, 0.3, 1");
        CustomEase.create("zoomOut", "0.7, 0, 0.3, 1");
        CustomEase.create("bounceOut", "0.22, 1.2, 0.36, 1");

        const elContext = containerRef.current;
        const slides = elContext.querySelectorAll(".js-slide");
        const slideImages = elContext.querySelectorAll(".js-slide-img");
        const counterStrip = elContext.querySelector(".js-counter-strip");
        const cursorEl = cursorRef.current;

        let currentIndex = 0;
        let isAnimating = false;
        let mouseX = 0;
        let cursorTimeout;

        const NEXT = 1;
        const PREV = -1;

        if (counterStrip) {
          gsap.set(counterStrip, { y: 0 });
        }

        if (slides[0]) {
          const firstSlideTextLines =
            slides[0].querySelectorAll(".js-text-line");
          gsap.to(firstSlideTextLines, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            delay: 0.5,
            ease: "textReveal",
          });
        }

        function animateCounter(targetIndex, timeline) {
          // Verify component context availability safely prior to execution
          if (!containerRef.current || !counterStrip) return;

          const progressBar =
            containerRef.current.querySelector(".js-progress-bar");
          const targetY = -targetIndex * 1.0;

          timeline.to(
            counterStrip,
            {
              y: `${targetY}rem`,
              duration: slideDuration,
              ease: "counterSlide",
            },
            0.2,
          );

          if (progressBar) {
            timeline.to(
              progressBar,
              {
                scaleX: (targetIndex + 1) / slidesData.length,
                duration: slideDuration,
                ease: "counterSlide",
              },
              0.2,
            );
          }
        }

        function navigate(direction) {
          if (isAnimating || !containerRef.current) return;

          const prevIndex = currentIndex;
          if (direction === NEXT) {
            currentIndex =
              currentIndex < slidesData.length - 1 ? currentIndex + 1 : 0;
          } else {
            currentIndex =
              currentIndex > 0 ? currentIndex - 1 : slidesData.length - 1;
          }

          performNavigation(prevIndex, currentIndex, direction);
        }

        function performNavigation(prevIndex, nextIndex, direction) {
          if (!containerRef.current || !slides[prevIndex] || !slides[nextIndex])
            return;

          isAnimating = true;

          const currentSlide = slides[prevIndex];
          const currentImage = slideImages[prevIndex];
          const currentTextLines =
            currentSlide.querySelectorAll(".js-text-line");

          const nextSlide = slides[nextIndex];
          const nextImage = slideImages[nextIndex];
          const nextTextLines = nextSlide.querySelectorAll(".js-text-line");

          const tl = gsap.timeline({
            defaults: { duration: slideDuration, ease: "power2.inOut" },
            onComplete: () => {
              if (!containerRef.current) return;
              gsap.set(currentSlide, { visibility: "hidden" });
              currentSlide.classList.remove("active");
              nextSlide.classList.add("active");
              isAnimating = false;
            },
          });

          animateCounter(nextIndex, tl);

          tl.to(
            currentTextLines,
            {
              y: "-80%",
              opacity: 0,
              duration: 0.7,
              stagger: 0.05,
              ease: "power2.in",
            },
            0,
          );

          const zoomDirection = direction === NEXT ? 1 : -1;

          gsap.set(nextSlide, {
            visibility: "visible",
            scale: zoomDirection === 1 ? 0.7 : 1.3,
            opacity: 0,
            y: "0%",
            x: "0%",
            transformOrigin: "center center",
          });

          if (nextImage) {
            gsap.set(nextImage, {
              scale: zoomDirection === 1 ? 1.3 : 0.8,
              opacity: 0.5,
              transformOrigin: "center center",
            });
          }

          tl.to(
            currentSlide,
            {
              scale: zoomDirection === 1 ? 1.3 : 0.7,
              opacity: 0,
              ease: "zoomOut",
            },
            0.2,
          );

          if (currentImage) {
            tl.to(
              currentImage,
              {
                scale: zoomDirection === 1 ? 0.8 : 1.3,
                ease: "zoomOut",
              },
              0.2,
            );
          }

          tl.to(
            nextSlide,
            {
              scale: 1,
              opacity: 1,
              ease: "bounceOut",
            },
            0.4,
          );

          if (nextImage) {
            tl.to(
              nextImage,
              {
                scale: 1,
                opacity: 1,
                ease: "zoomIn",
              },
              0.4,
            );
          }

          gsap.set(nextTextLines, {
            y: "100%",
            opacity: 0,
          });

          tl.to(
            nextTextLines,
            {
              y: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.1,
              ease: "textReveal",
              delay: 0.3,
            },
            0.7,
          );
        }

        const handleMouseMove = (e) => {
          if (!containerRef.current || !cursorEl) return;

          gsap.to(cursorEl, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
          });

          mouseX = e.clientX;
          cursorEl.classList.add("scale-100");
          cursorEl.classList.remove("scale-0");

          const windowWidth = window.innerWidth;
          const prevArrow = cursorEl.querySelector(".js-arrow-prev");
          const nextArrow = cursorEl.querySelector(".js-arrow-next");

          if (e.clientX < windowWidth / 2) {
            prevArrow?.classList.remove("opacity-0");
            prevArrow?.classList.add("opacity-100");
            nextArrow?.classList.remove("opacity-100");
            nextArrow?.classList.add("opacity-0");
          } else {
            nextArrow?.classList.remove("opacity-0");
            nextArrow?.classList.add("opacity-100");
            prevArrow?.classList.remove("opacity-100");
            prevArrow?.classList.add("opacity-0");
          }

          clearTimeout(cursorTimeout);
          cursorTimeout = setTimeout(() => {
            if (cursorEl) {
              cursorEl.classList.remove("scale-100");
              cursorEl.classList.add("scale-0");
            }
          }, cursorActiveTime);
        };

        const handleMouseLeave = () => {
          if (!cursorEl) return;
          cursorEl.classList.remove("scale-100");
          cursorEl.classList.add("scale-0");
        };

        const handleWheel = (e) => {
          if (!containerRef.current) return;
          if (e.deltaY > 0) {
            navigate(NEXT);
          } else {
            navigate(PREV);
          }
        };

        const handleClick = () => {
          if (!containerRef.current) return;
          if (mouseX < window.innerWidth / 2) {
            navigate(PREV);
          } else {
            navigate(NEXT);
          }
        };

        const handleKeyDown = (e) => {
          if (!containerRef.current) return;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            navigate(NEXT);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            navigate(PREV);
          }
        };

        let touchStartY = 0;
        const handleTouchStart = (e) => {
          touchStartY = e.changedTouches[0].screenY;
        };
        const handleTouchEnd = (e) => {
          if (!containerRef.current) return;
          const touchEndY = e.changedTouches[0].screenY;
          if (touchStartY > touchEndY + 5) {
            navigate(NEXT);
          } else if (touchStartY < touchEndY - 5) {
            navigate(PREV);
          }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("wheel", handleWheel, { passive: true });
        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseleave", handleMouseLeave);
          window.removeEventListener("wheel", handleWheel);
          document.removeEventListener("click", handleClick);
          document.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("touchstart", handleTouchStart);
          document.removeEventListener("touchend", handleTouchEnd);
          clearTimeout(cursorTimeout);
        };
      })
      .catch((err) =>
        console.error(
          "[ContemplativeWarpSlideshow] GSAP execution failure:",
          err,
        ),
      );
  }, [mounted, slidesData, slideDuration, cursorActiveTime]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-[#000] text-[#fff] select-none ${fontClass}`}
    >
      <div className="relative w-full h-screen overflow-hidden">
        {slidesData.map((slide, sIdx) => (
          <div
            key={sIdx}
            className={`js-slide absolute top-0 left-0 w-full h-full overflow-hidden transform-gpu origin-center ${sIdx === 0 ? "visible active" : "invisible"
              }`}
          >
            <div
              className="js-slide-img absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-cover bg-center will-change-transform origin-center after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-b after:from-[rgba(0,0,0,0.2)] after:to-[rgba(0,0,0,0)] after:to-[40%]"
              style={{ backgroundImage: `url(${slide.img})` }}
            />
            <div className="absolute bottom-[5rem] left-[5rem] max-w-[80%] overflow-hidden z-[5] md:max-w-[90%] md:bottom-[3rem] md:left-[2rem]">
              {slide.lines.map((line, lIdx) => (
                <span
                  key={lIdx}
                  className={`js-text-line block text-[4.5rem] leading-[1] font-bold uppercase ${textTracking} transform translate-y-full opacity-0 md:text-[3rem]`}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed top-[2rem] right-[2rem] z-10 mix-blend-difference">
        <div className="text-[#fff] text-[0.65rem] font-mono tracking-[0.2em] opacity-40 uppercase">
          scroll / click to browse
        </div>
      </div>

      <div className="fixed top-[2rem] left-[2rem] text-[0.8rem] font-normal opacity-70 z-10 max-w-[15rem] mix-blend-difference">
        <div className="font-mono text-[0.65rem] tracking-[0.15em] uppercase mb-1 text-white opacity-90">
          {seriesTitle}
        </div>
        <div className="text-[0.7rem] font-sans leading-relaxed tracking-wide text-white/60">
          {seriesDesc}
        </div>
      </div>

      <div className="fixed bottom-[3rem] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2.5 z-10 pointer-events-none select-none mix-blend-difference">
        <div className="flex items-baseline font-mono text-[0.7rem] tracking-[0.15em] text-white/40 uppercase">
          <div className="relative w-[1.2rem] h-[1rem] overflow-hidden text-right">
            <div className="js-counter-strip absolute top-0 right-0 w-full text-right text-white font-medium">
              {slidesData.map((_, idx) => (
                <div key={idx} className="h-[1rem] block leading-none">
                  {formatNumber(idx + 1)}
                </div>
              ))}
            </div>
          </div>
          <span className="mx-2 opacity-20 font-sans font-light">/</span>
          <span className="w-[1.2rem] text-left leading-none">
            {formatNumber(slidesData.length)}
          </span>
        </div>

        <div className="relative w-[48px] h-[1px] bg-white/10 overflow-hidden">
          <div
            className="js-progress-bar absolute top-0 left-0 h-full w-full bg-white/60 origin-left"
            style={{
              transform: `scaleX(${1 / slidesData.length})`,
            }}
          />
        </div>
      </div>

      <div
        ref={cursorRef}
        className="fixed w-[60px] h-[60px] rounded-full border border-[rgba(255,255,255,0.3)] mt-[-30px] ml-[-30px] z-[9999] pointer-events-none scale-0 transition-transform duration-300 ease-out mix-blend-difference flex items-center justify-center"
      >
        <div className="js-arrow-prev absolute text-[1.2rem] opacity-0 transition-opacity duration-150 text-white">
          ←
        </div>
        <div className="js-arrow-next absolute text-[1.2rem] opacity-0 transition-opacity duration-150 text-white">
          →
        </div>
      </div>
    </div>
  );
}
