"use client";

import { useEffect, useRef, useState } from "react";

// ─── CosmicWarpSlideshow ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slidesData       array    List of visual elements containing background images
// slideTitles      array    Sequential typography overlays loaded side-by-side
// seriesTitle      string   Context layout header tracking title
// lineBaseHeight   number   Minimum idle height tracking line elements (px)
// lineMaxHeight    number   Maximum peak scale height for active wave lines (px)
// totalDragLines   number   Total inline bars generated inside the tracking container
// thumbWidth       string   Width mapping rule assigned to every sliding thumbnail
// hintText         string   Top-right dynamic text element informing usability
// ──────────────────────────────────────────────────────────────────────────

const COSMIC_SLIDES = [
  {
    img: "https://cdn.cosmos.so/1d4dbaff-8087-4451-a727-9d3266b573dd?format=jpeg",
  },
  {
    img: "https://cdn.cosmos.so/67ef01f5-09c8-4117-9199-04ec5323d64f?format=jpeg",
  },
  {
    img: "https://cdn.cosmos.so/77f73423-0eb7-4eaa-a782-036457985290?format=jpeg",
  },
  {
    img: "https://cdn.cosmos.so/3dd498a9-169d-4b69-8e2e-df042123c124?format=jpeg",
  },
  {
    img: "https://cdn.cosmos.so/ca346107-04c8-4241-85e6-f26c8b64c85c?format=jpeg",
  },
  {
    img: "https://cdn.cosmos.so/7d2c5113-b2d3-4f9d-8215-f46fbb679f31?format=jpeg",
  },
];

const COSMIC_TITLES = [
  "Cosmic Harmony",
  "Astral Journey",
  "Ethereal Vision",
  "Quantum Field",
  "Celestial Path",
  "Cosmic Whisper",
];

export default function CosmicWarpSlideshow({
  slidesData = COSMIC_SLIDES,
  slideTitles = COSMIC_TITLES,
  seriesTitle = "COSMIC SERIES",
  lineBaseHeight = 15,
  lineMaxHeight = 50,
  totalDragLines = 60,
  thumbWidth = "120px",
  hintText = "scroll or drag",
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Mount logic protecting runtime variables against hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

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
        el.onerror = () =>
          reject(new Error(`Failed to load dependency script: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !containerRef.current) return;

        const elContext = containerRef.current;

        // Constants matching navigation instructions
        const NEXT = 1;
        const PREV = -1;

        // Reactive tracking states local to context execution
        let currentHoveredThumb = null;
        let mouseOverThumbnails = false;
        let lastHoveredThumbIndex = null;
        let isAnimating = false;
        let pendingNavigation = null;

        // Interior dynamic layout tracking configurations
        const lines = elContext.querySelectorAll(".js-drag-line");
        const thumbs = elContext.querySelectorAll(".js-slide-thumb");
        const navButtons = elContext.querySelectorAll(".js-counter-nav");

        class Slideshow {
          constructor(domEl) {
            this.el = domEl;
            this.slides = [...this.el.querySelectorAll(".js-slide")];
            this.slidesInner = this.slides.map((item) =>
              item.querySelector(".js-slide-img"),
            );
            this.current = 0;
            this.slidesTotal = this.slides.length;

            if (this.slides[this.current]) {
              this.slides[this.current].classList.add(
                "!pointer-events-auto",
                "!opacity-100",
              );
            }
          }

          next() {
            this.navigate(NEXT);
          }

          prev() {
            this.navigate(PREV);
          }

          goTo(index) {
            if (isAnimating) {
              pendingNavigation = { type: "goto", index };
              return false;
            }

            if (index === this.current) return false;

            isAnimating = true;
            updateNavigationUI(true);

            const previous = this.current;
            this.current = index;

            thumbs.forEach((thumb, i) => {
              thumb.classList.toggle("!opacity-100", i === index);
            });

            updateSlideCounter(index);
            updateSlideTitle(index);
            updateDragLines(index, true);

            const direction = index > previous ? 1 : -1;
            this.performTransition(previous, index, direction);
          }

          navigate(direction) {
            if (isAnimating) {
              pendingNavigation = { type: "navigate", direction };
              return false;
            }

            isAnimating = true;
            updateNavigationUI(true);

            const previous = this.current;
            this.current =
              direction === NEXT
                ? this.current < this.slidesTotal - 1
                  ? this.current + 1
                  : 0
                : this.current > 0
                  ? this.current - 1
                  : this.slidesTotal - 1;

            thumbs.forEach((thumb, index) => {
              thumb.classList.toggle("!opacity-100", index === this.current);
            });

            updateSlideCounter(this.current);
            updateSlideTitle(this.current);
            updateDragLines(this.current, true);

            this.performTransition(previous, this.current, direction);
          }

          performTransition(previous, index, direction) {
            const currentSlide = this.slides[previous];
            const currentInner = this.slidesInner[previous];
            const upcomingSlide = this.slides[index];
            const upcomingInner = this.slidesInner[index];

            gsap
              .timeline({
                onStart: () => {
                  if (upcomingSlide) {
                    upcomingSlide.classList.add(
                      "!pointer-events-auto",
                      "!opacity-100",
                    );
                    gsap.set(upcomingSlide, { zIndex: 99 });
                  }
                },
                onComplete: () => {
                  if (currentSlide) {
                    currentSlide.classList.remove(
                      "!pointer-events-auto",
                      "!opacity-100",
                    );
                  }
                  if (upcomingSlide) {
                    gsap.set(upcomingSlide, { zIndex: 1 });
                  }

                  isAnimating = false;
                  updateNavigationUI(false);

                  if (pendingNavigation) {
                    const {
                      type,
                      index: pIndex,
                      direction: pDirection,
                    } = pendingNavigation;
                    pendingNavigation = null;

                    setTimeout(() => {
                      if (type === "goto") this.goTo(pIndex);
                      else if (type === "navigate") this.navigate(pDirection);
                    }, 50);
                  }

                  if (mouseOverThumbnails && lastHoveredThumbIndex !== null) {
                    currentHoveredThumb = lastHoveredThumbIndex;
                    updateDragLines(lastHoveredThumbIndex, true);
                  }
                },
              })
              .addLabel("start", 0)
              .fromTo(
                upcomingSlide,
                {
                  autoAlpha: 1,
                  scale: 0.1,
                  yPercent: direction === 1 ? 100 : -100,
                },
                {
                  duration: 0.7,
                  ease: "expo",
                  scale: 0.4,
                  yPercent: 0,
                },
                "start",
              )
              .fromTo(
                upcomingInner,
                {
                  filter: "contrast(100%) saturate(100%)",
                  transformOrigin: "100% 50%",
                  scaleY: 4,
                },
                {
                  duration: 0.7,
                  ease: "expo",
                  scaleY: 1,
                },
                "start",
              )
              .fromTo(
                currentInner,
                { filter: "contrast(100%) saturate(100%)" },
                {
                  duration: 0.7,
                  ease: "expo",
                  filter: "contrast(120%) saturate(140%)",
                },
                "start",
              )
              .addLabel("middle", "start+=0.6")
              .to(
                upcomingSlide,
                {
                  duration: 1,
                  ease: "power4.inOut",
                  scale: 1,
                },
                "middle",
              )
              .to(
                currentSlide,
                {
                  duration: 1,
                  ease: "power4.inOut",
                  scale: 0.98,
                  autoAlpha: 0,
                },
                "middle",
              );
          }
        }

        const slideshow = new Slideshow(elContext.querySelector(".js-slides"));

        function updateNavigationUI(disabled) {
          navButtons.forEach((btn) => {
            btn.style.opacity = disabled ? "0.3" : "";
            btn.style.pointerEvents = disabled ? "none" : "";
          });
          thumbs.forEach((thumb) => {
            thumb.style.pointerEvents = disabled ? "none" : "";
          });
        }

        function updateSlideCounter(index) {
          const currentSlideEl = elContext.querySelector(".js-current-slide");
          if (currentSlideEl) {
            currentSlideEl.textContent = String(index + 1).padStart(2, "0");
          }
        }

        function updateSlideTitle(index) {
          const titleContainer = elContext.querySelector(
            ".js-slide-title-container",
          );
          const currentTitle = elContext.querySelector(".js-slide-title");
          if (!titleContainer || !currentTitle) return;

          const newTitle = document.createElement("div");
          newTitle.className =
            "js-slide-title absolute w-full text-white text-[1.2rem] opacity-0 left-0 translate-y-[30px] transition-all duration-500 ease-in-out";
          newTitle.textContent = slideTitles[index];

          titleContainer.appendChild(newTitle);
          currentTitle.classList.add("-translate-y-[30px]", "!opacity-0");

          void newTitle.offsetWidth;

          setTimeout(() => {
            newTitle.classList.remove("translate-y-[30px]", "opacity-0");
            newTitle.classList.add("opacity-80");
          }, 10);

          setTimeout(() => {
            currentTitle.remove();
          }, 500);
        }

        function updateDragLines(activeIndex, forceUpdate = false) {
          if (!lines.length) return;

          lines.forEach((line) => {
            line.style.height = `${lineBaseHeight}px`;
            line.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
          });

          if (activeIndex === null) return;

          const slideCount = slidesData.length;
          const lineCount = lines.length;
          const calculatedThumbWidth = 720 / slideCount;
          const centerPosition = (activeIndex + 0.5) * calculatedThumbWidth;
          const lineWidth = 720 / lineCount;

          for (let i = 0; i < lineCount; i++) {
            const linePosition = (i + 0.5) * lineWidth;
            const distFromCenter = Math.abs(linePosition - centerPosition);
            const maxDistance = calculatedThumbWidth * 0.7;

            if (distFromCenter <= maxDistance) {
              const normalizedDist = distFromCenter / maxDistance;
              const waveHeight = Math.cos((normalizedDist * Math.PI) / 2);
              const height =
                lineBaseHeight + waveHeight * (lineMaxHeight - lineBaseHeight);
              const opacity = 0.3 + waveHeight * 0.4;
              const delay = normalizedDist * 100;

              if (forceUpdate) {
                lines[i].style.height = `${height}px`;
                lines[i].style.backgroundColor =
                  `rgba(255, 255, 255, ${opacity})`;
              } else {
                setTimeout(() => {
                  if (
                    currentHoveredThumb === activeIndex ||
                    (mouseOverThumbnails &&
                      lastHoveredThumbIndex === activeIndex)
                  ) {
                    lines[i].style.height = `${height}px`;
                    lines[i].style.backgroundColor =
                      `rgba(255, 255, 255, ${opacity})`;
                  }
                }, delay);
              }
            }
          }
        }

        // Attach interface element handling actions
        thumbs.forEach((thumb, index) => {
          thumb.addEventListener("click", () => {
            lastHoveredThumbIndex = index;
            slideshow.goTo(index);
          });

          thumb.addEventListener("mouseenter", () => {
            currentHoveredThumb = index;
            lastHoveredThumbIndex = index;
            mouseOverThumbnails = true;

            if (!isAnimating) {
              updateDragLines(index, true);
            }
          });

          thumb.addEventListener("mouseleave", () => {
            if (currentHoveredThumb === index) {
              currentHoveredThumb = null;
            }
          });
        });

        const prevButton = elContext.querySelector(".js-prev-slide");
        const nextButton = elContext.querySelector(".js-next-slide");

        if (prevButton)
          prevButton.addEventListener("click", () => slideshow.prev());
        if (nextButton)
          nextButton.addEventListener("click", () => slideshow.next());

        const thumbsArea = elContext.querySelector(".js-thumbs-container");
        if (thumbsArea) {
          thumbsArea.addEventListener("mouseenter", () => {
            mouseOverThumbnails = true;
          });

          thumbsArea.addEventListener("mouseleave", () => {
            mouseOverThumbnails = false;
            currentHoveredThumb = null;
            updateDragLines(null);
          });
        }

        const handleWheel = (e) => {
          if (isAnimating) return;
          if (e.deltaY > 0) slideshow.next();
          else slideshow.prev();
        };

        let touchStartY = 0;
        const handleTouchStart = (e) => {
          touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
          if (isAnimating) return;
          const touchEndY = e.changedTouches[0].clientY;
          const diff = touchEndY - touchStartY;

          if (Math.abs(diff) > 50) {
            if (diff > 0) slideshow.prev();
            else slideshow.next();
          }
        };

        const handleKeyDown = (e) => {
          if (isAnimating) return;
          if (e.key === "ArrowRight") slideshow.next();
          else if (e.key === "ArrowLeft") slideshow.prev();
        };

        document.addEventListener("wheel", handleWheel, { passive: true });
        document.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });
        document.addEventListener("touchend", handleTouchEnd, {
          passive: true,
        });
        document.addEventListener("keydown", handleKeyDown);

        // Cleanup tracking interfaces on component destruction
        return () => {
          document.removeEventListener("wheel", handleWheel);
          document.removeEventListener("touchstart", handleTouchStart);
          document.removeEventListener("touchend", handleTouchEnd);
          document.removeEventListener("keydown", handleKeyDown);
        };
      })
      .catch((err) =>
        console.error(
          "[CosmicWarpSlideshow] Dependencies initialization failed:",
          err,
        ),
      );
  }, [mounted, slidesData, slideTitles, lineBaseHeight, lineMaxHeight]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black text-white select-none font-sans"
    >
      {/* Top right informative navigation tag */}
      <div className="fixed top-8 right-8 text-white z-[100] text-[1rem]">
        {hintText}
      </div>

      {/* Main Structural Bottom HUD controls */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[720px] max-w-full确 z-[100] pb-8 flex flex-col items-center">
        <div className="text-white text-[1.8rem] font-bold w-full text-center opacity-90 tracking-[1px] mb-9">
          {seriesTitle}
        </div>

        <div className="flex items-center w-full justify-between text-white text-[0.825rem] mb-6">
          <div className="js-prev-slide js-counter-nav w-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300">
            ⟪
          </div>
          <div className="flex items-center gap-2.5">
            <span className="js-current-slide">01</span>
            <span className="opacity-60 text-[0.8rem]">//</span>
            <span className="js-total-slides">
              {String(slidesData.length).padStart(2, "0")}
            </span>
          </div>
          <div className="js-next-slide js-counter-nav w-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300">
            ⟫
          </div>
        </div>

        <div className="js-slide-title-container w-full text-center h-[30px] overflow-hidden mb-4 relative">
          <div className="js-slide-title absolute w-full text-white text-[1.2rem] opacity-80 transition-all duration-500 ease-in-out left-0">
            {slideTitles[0]}
          </div>
        </div>

        {/* Waves Tracking Indicator Section */}
        <div className="w-full h-[50px] pointer-events-none mb-2 relative">
          <div className="flex h-full w-full relative items-end justify-between">
            {Array.from({ length: totalDragLines }).map((_, i) => (
              <div
                key={i}
                className="js-drag-line w-[2px] bg-white/30 origin-bottom transition-[height,background-color] duration-[600ms] [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)]"
                style={{ height: `${lineBaseHeight}px` }}
              />
            ))}
          </div>
        </div>

        {/* Gallery Thumbnails Strip */}
        <div className="js-thumbs-container w-full bg-black/50 overflow-hidden">
          <div className="flex relative bg-transparent p-0 z-10 gap-0">
            {slidesData.map((slide, index) => (
              <div
                key={index}
                className={`js-slide-thumb h-20 bg-cover bg-left bg-no-repeat cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-300 border-none outline-none shadow-none m-0 relative z-10 ${
                  index === 0 ? "!opacity-100" : ""
                }`}
                style={{
                  width: thumbWidth,
                  backgroundImage: `url(${slide.img})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Structural Slides Container Backdrop viewport */}
      <div className="js-slides w-full h-screen overflow-hidden grid grid-rows-1 grid-cols-1 place-items-center">
        {slidesData.map((slide, index) => (
          <div
            key={index}
            className="js-slide w-full h-full [grid-area:1/1/-1/-1] pointer-events-none opacity-0 overflow-hidden relative grid place-items-center will-change-transform"
          >
            <div
              className="js-slide-img w-full h-full bg-cover bg-left bg-no-repeat will-change-transform"
              style={{ backgroundImage: `url(${slide.img})` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
