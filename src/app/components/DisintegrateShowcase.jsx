"use client";

import { useEffect, useRef, useState } from "react";

// ─── TilingRevealShowcase ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// logoText           string   Header brand typography moniker
// bannerText         string   Uppercase accent top intro segment tracker
// bannerTitle        string   Main headline tracking hero grid presentation
// bannerDescr        string   Paragraph element detailing product capabilities
// slides             Array    Collection holding image resources and titles
// preloaderDuration  number   Speed profile parameter for mask extraction (s)
// preloaderHold      number   Idle baseline window before trigger fire (s)
// revealDuration     number   Universal entry easing timing modifier (s)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    id: "01",
    title: "Luminous Vista",
    img: "https://zajno-storage0.s3.us-west-1.amazonaws.com/dev/codepen/tle/luminous.jpg",
  },
  {
    id: "02",
    title: "Celestial Symphony",
    img: "https://zajno-storage0.s3.us-west-1.amazonaws.com/dev/codepen/tle/celestial.jpg",
  },
];

export default function DisinterateShowcase({
  logoText = "TL/E",
  bannerText = "Inspired Tiling Solutions",
  bannerTitle = "Your home, your reflect/on.",
  bannerDescr = "Tile Emporium offers premium tiles for your home. Durable, versatile and beautiful options for floor and wall. Expert help available. Shop online or in-store. Start your renovation now.",
  slides = DEFAULT_SLIDES,
  preloaderDuration = 0.7,
  preloaderHold = 2.0,
  revealDuration = 1.0,
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Mount logic protecting runtime layout against server rendering mismatches
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
          reject(new Error(`Failed to load dependency: ${src}`));
        document.head.appendChild(el);
      });

    // Promise chain tracking chronological plugin generation requirements
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
    ])
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        ),
      )
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger || !containerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const elContext = containerRef.current;
        let activeIndex = slides.length - 1;
        let isAnimating = false;

        // Establish core element selectors matching markup topology
        const sliderImgs = elContext.querySelectorAll(".js-slider-img");
        const titleItems = elContext.querySelectorAll(".js-title-item");
        const numericItems = elContext.querySelectorAll(".js-numeric-item");
        const preloader = elContext.querySelector(".js-preloader");
        const preloaderWrapp = elContext.querySelector(".js-preloader-wrapp");
        const headerWrapp = elContext.querySelector(".js-header-wrapp");
        const sliderContainer = elContext.querySelector(".js-slider");
        const bannerMask = elContext.querySelector(".js-banner-mask");
        const collectionMask = elContext.querySelector(".js-collection-mask");
        const headerEl = elContext.querySelector(".js-header");
        const headerLinks = elContext.querySelectorAll(".js-header-link");
        const logoSvg = elContext.querySelector(".js-logo-svg");

        // Simple utility logic performing safe string lines separation manually
        const processSplitElements = () => {
          const splitTargets = elContext.querySelectorAll(".js-split");
          splitTargets.forEach((target) => {
            const text = target.textContent.trim();
            target.innerHTML = "";

            // Chunk paragraph structures roughly by logical breaks
            const parts =
              text.length > 50
                ? text.match(/[^.!?]+[.!?]*/g) || [text]
                : [text];

            parts.forEach((part) => {
              const lineWrap = document.createElement("div");
              lineWrap.className = "overflow-hidden block";
              const innerEl = document.createElement("div");
              innerEl.className =
                "js-fade-el block translate-y-[110%] line-height-[1.2]";
              innerEl.textContent = part.trim() + " ";
              lineWrap.appendChild(innerEl);
              target.appendChild(lineWrap);
            });
          });
        };

        processSplitElements();

        // ─── INIT PAGE TIMELINE ──────────────────────────────────────────────
        const initPage = () => {
          window.scrollTo(0, 0);
          activeIndex = slides.length - 1;

          sliderImgs.forEach((img, i) => {
            img.style.opacity = i === activeIndex ? "1" : "0";
            img.style.clipPath = "";
            img.style.transform =
              i === activeIndex ? "scale(1.1)" : "scale(1.1) translateX(-4%)";
          });

          gsap.set(titleItems, { y: "0%" });
          gsap.set(numericItems, { y: "0%" });

          const fadeElements = elContext.querySelectorAll(".js-fade-el");

          const tl = gsap.timeline();

          tl.to(preloaderWrapp, {
            y: "100%",
            duration: preloaderDuration,
            ease: "power3.inOut",
            delay: preloaderHold,
          })
            .set(preloader, { display: "none" })
            .fromTo(
              headerWrapp,
              { y: "-1rem" },
              { y: 0, duration: 0.85, ease: "power2.out" },
            )
            .to(
              fadeElements,
              { y: 0, duration: 0.85, stagger: 0.05, ease: "power2.out" },
              "<",
            )
            .fromTo(
              sliderContainer,
              { y: "50%" },
              { y: 0, duration: 1.05, ease: "power2.out" },
              "<",
            )
            .fromTo(
              elContext.querySelectorAll(".js-slider-img img"),
              { scale: 1.7 },
              { scale: 1.3, duration: 1 },
              "<",
            );
        };

        initPage();

        // ─── SLIDE TRANSITION LOGIC ──────────────────────────────────────────
        const nextSlide = () => {
          if (activeIndex > 0) {
            isAnimating = true;
            const currentActive = sliderImgs[activeIndex];
            const nextActive = sliderImgs[activeIndex - 1];

            if (currentActive) {
              currentActive.style.clipPath =
                "polygon(6.25% 0%, 6.25% 0%, 6.25% 100%, 6.25% 100%, 12.5% 100%, 12.5% 0%, 12.5% 0%, 12.5% 100%, 18.75% 100%, 18.75% 0%, 18.75% 0%, 18.75% 100%, 25% 100%, 25% 0%, 25% 0%, 25% 100%, 31.25% 100%, 31.25% 0%, 31.25% 0%, 31.25% 100%, 37.5% 100%, 37.5% 0%, 37.5% 0%, 37.5% 100%, 43.75% 100%, 43.75% 0%, 43.75% 0%, 43.75% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 56.25% 100%, 56.25% 0%, 56.25% 0%, 56.25% 100%, 62.5% 100%, 62.5% 0%, 62.5% 0%, 62.5% 100%, 68.75% 100%, 68.75% 0%, 68.75% 0%, 68.75% 100%, 75% 100%, 75% 0%, 75% 0%, 75% 100%, 81.25% 100%, 81.25% 0%, 81.25% 0%, 81.25% 100%, 87.5% 100%, 87.5% 0%, 87.5% 0%, 87.5% 100%, 93.75% 100%, 93.75% 0%, 93.75% 0%, 93.75% 100%, 100% 100%, 100% 0%, 100% 0%, 100% 100%, 6.25% 100%)";
              currentActive.style.transform = "scale(1.1) translateX(4%)";
              currentActive.style.transition =
                "clip-path 1.5s cubic-bezier(0.55, 0, 0.49, 1), transform 1.5s cubic-bezier(0.55, 0, 0.83, 0.83)";
            }

            if (nextActive) {
              nextActive.style.opacity = "1";
              nextActive.style.transform = "scale(1.1)";
              nextActive.style.transition =
                "clip-path 1.5s cubic-bezier(0.55, 0, 0.49, 1), transform 2s cubic-bezier(0.17, 0.17, 0.49, 1)";
            }

            gsap.to(numericItems, {
              y: "-=100%",
              duration: 1.4,
              ease: "power2.out",
            });

            gsap
              .timeline({
                onComplete: () => {
                  isAnimating = false;
                },
              })
              .to(titleItems, { y: "+=100%", duration: 0.7, ease: "power3.in" })
              .to(titleItems, {
                y: "+=100%",
                duration: 0.7,
                ease: "power2.out",
              });

            activeIndex--;
          } else {
            // Full loop restart via masking overlay injection
            isAnimating = true;
            const bodyClip = elContext.querySelector(".js-showcase-body");
            if (bodyClip) {
              bodyClip.style.clipPath =
                "polygon(6.25% 0%, 6.25% 0%, 6.25% 100%, 6.25% 100%, 12.5% 100%, 12.5% 0%, 12.5% 0%, 12.5% 100%, 18.75% 100%, 18.75% 0%, 18.75% 0%, 18.75% 100%, 25% 100%, 25% 0%, 25% 0%, 25% 100%, 31.25% 100%, 31.25% 0%, 31.25% 0%, 31.25% 100%, 37.5% 100%, 37.5% 0%, 37.5% 0%, 37.5% 100%, 43.75% 100%, 43.75% 0%, 43.75% 0%, 43.75% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 56.25% 100%, 56.25% 0%, 56.25% 0%, 56.25% 100%, 62.5% 100%, 62.5% 0%, 62.5% 0%, 62.5% 100%, 68.75% 100%, 68.75% 0%, 68.75% 0%, 68.75% 100%, 75% 100%, 75% 0%, 75% 0%, 75% 100%, 81.25% 100%, 81.25% 0%, 81.25% 0%, 81.25% 100%, 87.5% 100%, 87.5% 0%, 87.5% 0%, 87.5% 100%, 93.75% 100%, 93.75% 0%, 93.75% 0%, 93.75% 100%, 100% 100%, 100% 0%, 100% 0%, 100% 100%, 6.25% 100%)";
              bodyClip.style.transition = "clip-path 1.5s";
            }

            gsap
              .timeline({
                onComplete: () => {
                  if (bodyClip) bodyClip.style.clipPath = "";
                  preloader.style.display = "flex";
                  preloaderWrapp.style.transform = "translateY(0%)";
                  isAnimating = false;
                  initPage();
                },
              })
              .to({}, { duration: 1.5 });
          }
        };

        // ─── SCROLL INTERACTION HANDLING ─────────────────────────────────────
        let observerActive = false;

        const handleWheel = (e) => {
          if (!observerActive) return;
          if (e.deltaY > 0 && !isAnimating) {
            nextSlide();
          }
        };

        document.addEventListener("wheel", handleWheel, { passive: true });

        // ScrollTrigger controlling the fullscreen transition behavior
        ScrollTrigger.create({
          trigger: elContext.querySelector(".js-collection"),
          start: "top top+=2px",
          end: "bottom bottom",
          onEnter: () => {
            observerActive = true;
          },
          onEnterBack: () => {
            observerActive = true;
          },
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: elContext.querySelector(".js-banner"),
              start: "top top",
              end: "bottom top",
              scrub: true,
              onEnter: () => {
                observerActive = false;
              },
              onEnterBack: () => {
                observerActive = false;
              },
            },
          })
          .to(elContext.querySelector(".js-collection"), { padding: 0 })
          .to(sliderContainer, { borderRadius: 0 }, "<")
          .to(bannerMask, { opacity: 1 }, "<")
          .to(collectionMask, { opacity: 1 }, "<")
          .fromTo(
            elContext.querySelectorAll(".js-slider-img img"),
            { scale: 1.3 },
            { scale: 1 },
            "<",
          )
          .to(headerEl, { color: "#ffffff" }, "<0.3")
          .to(headerLinks, { color: "#ffffff" }, "<")
          .to(logoSvg, { filter: "invert(1)" }, "<");

        return () => {
          document.removeEventListener("wheel", handleWheel);
          ScrollTrigger.getAll().forEach((t) => t.kill());
        };
      })
      .catch((err) =>
        console.error("[TilingRevealShowcase] Init failed:", err),
      );
  }, [mounted, slides, preloaderDuration, preloaderHold, revealDuration]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#FFFAF6] text-[#131313] font-sans antialiased selection:bg-black/10"
    >
      {/* Dynamic Polygon Extraction Preloader */}
      <div className="js-preloader fixed inset-0 flex items-center justify-center bg-[#FFFAF6] z-[999]">
        <div className="w-[1.58rem] overflow-hidden">
          <div className="js-preloader-wrapp w-full will-change-transform">
            <div className="relative w-full max-w-[1.58rem] aspect-[159/36]">
              {/* Preloader Frame Sequence Render */}
              <div className="absolute inset-0 animate-[preloaderAnimation1_0.8s_infinite]">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 159 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="36" height="36" fill="#131313" />
                  <path
                    d="M18 0L25.1276 10.8724L36 18L25.1276 25.1276L18 36L10.8724 25.1276L0 18L10.8724 10.8724L18 0Z"
                    fill="#FFFAF6"
                  />
                  <g clipPath="url(#c0)">
                    <rect x="41" width="36" height="36" fill="#131313" />
                    <path
                      d="M71.7279 5.27211L77 18L71.7279 30.728L59 36L46.2721 30.728L41 18L46.2721 5.27211L59 0L71.7279 5.27211Z"
                      fill="#FFFAF6"
                    />
                  </g>
                  <g clipPath="url(#c1)">
                    <rect x="82" width="36" height="36" fill="#FFFAF6" />
                    <rect x="82" width="6" height="6" fill="black" />
                    <rect x="112" width="6" height="6" fill="black" />
                    <rect x="112" y="30" width="6" height="6" fill="black" />
                    <rect x="82" y="30" width="6" height="6" fill="black" />
                  </g>
                  <rect x="123" width="36" height="36" fill="#131313" />
                  <circle cx="141" cy="18" r="17" fill="#FFFAF6" />
                  <defs>
                    <clipPath id="c0">
                      <rect
                        width="36"
                        height="36"
                        fill="white"
                        transform="translate(41)"
                      />
                    </clipPath>
                    <clipPath id="c1">
                      <rect
                        width="36"
                        height="36"
                        fill="white"
                        transform="translate(82)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Layout Content Viewport wrapper */}
      <div className="js-showcase-body min-h-screen relative overflow-x-hidden [clip-path:polygon(0%_0%,_6.25%_0%,_6.25%_100%,_6.25%_100%,_6.25%_100%,_6.25%_0%,_12.5%_0%,_12.5%_100%,_12.5%_100%,_12.5%_0%,_18.75%_0%,_18.75%_100%,_18.75%_100%,_18.75%_0%,_25%_0%,_25%_100%,_25%_100%,_25%_0%,_31.25%_0%,_31.25%_100%,_31.25%_100%,_31.25%_0%,_37.5%_0%,_37.5%_100%,_37.5%_100%,_37.5%_0%,_43.75%_0%,_43.75%_100%,_43.75%_100%,_43.75%_0%,_50%_0%,_50%_100%,_50%_100%,_50%_0%,_56.25%_0%,_56.25%_100%,_56.25%_100%,_56.25%_0%,_62.5%_0%,_62.5%_100%,_62.5%_100%,_62.5%_0%,_68.75%_0%,_68.75%_100%,_68.75%_100%,_68.75%_0%,_75%_0%,_75%_100%,_75%_100%,_75%_0%,_81.25%_0%,_81.25%_100%,_81.25%_100%,_81.25%_0%,_87.5%_0%,_87.5%_100%,_87.5%_100%,_87.5%_0%,_93.75%_0%,_93.75%_100%,_93.75%_100%,_93.75%_0%,_100%_0%,_100%_100%,_0%_100%)]">
        {/* Navigation Control Header Strip */}
        <header className="js-header fixed top-0 left-0 w-full flex items-center justify-center z-[100] transition-colors duration-300">
          <div className="js-header-wrapp w-full grid grid-cols-5 items-baseline gap-[0.2rem] px-[0.2rem] py-[0.13rem] m-[0.06rem] text-[0.16rem] tracking-tight uppercase font-medium">
            <div className="flex items-center gap-[0.04rem]">
              {logoText}
              <svg
                className="js-logo-svg w-[0.13rem] aspect-square transition-all duration-300"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.5 0H0V6.5V13H6.5H13V6.5V0H6.5ZM6.5 0L3.92613 3.92613L0 6.5L3.92613 9.07387L6.5 13L9.07387 9.07387L13 6.5L9.07387 3.92613L6.5 0Z"
                  fill="#131313"
                />
              </svg>
            </div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
              Search
            </div>
            <div className="flex flex-col gap-[0.04rem] justify-self-end">
              <a
                href="#"
                className="js-header-link text-[#131313] no-underline hover:opacity-70 transition-opacity"
              >
                Product
              </a>
              <a
                href="#"
                className="js-header-link text-[#131313] no-underline hover:opacity-70 transition-opacity"
              >
                Collection
              </a>
              <a
                href="#"
                className="js-header-link text-[#131313] no-underline hover:opacity-70 transition-opacity"
              >
                3d model
              </a>
            </div>
            <a
              href="#"
              className="js-header-link text-[#131313] no-underline justify-self-end hover:opacity-70 transition-opacity"
            >
              Contact
            </a>
            <a
              href="#"
              className="js-header-link text-[#131313] no-underline justify-self-end hover:opacity-70 transition-opacity"
            >
              Cart (0)
            </a>
          </div>
        </header>

        <main>
          {/* Top Editorial Descriptive Block */}
          <section className="js-banner relative grid grid-cols-5 gap-[0.2rem] pt-[3.19rem] pb-[0.69rem] px-[0.2rem] select-none">
            <div className="js-banner-mask absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen bg-[#131313] opacity-0 pointer-events-none mix-blend-normal z-0" />
            <div className="js-split text-[0.14rem] tracking-wider uppercase font-semibold text-neutral-500 max-w-[2rem] z-10">
              {bannerText}
            </div>
            <div className="js-split col-span-3 text-[0.93rem] font-light tracking-tight leading-[1] -mt-[0.16rem] z-10">
              {bannerTitle}
            </div>
            <div className="js-split text-[0.14rem] uppercase tracking-normal text-neutral-600 leading-[1.4] font-medium z-10">
              {bannerDescr}
            </div>
          </section>

          {/* Slider Collection Presentation Area */}
          <section className="js-collection relative w-full h-screen px-[0.22rem] overflow-hidden z-10">
            <div className="js-collection-mask absolute inset-0 bg-[#131313] opacity-0 z-0 transition-opacity" />

            <div className="js-slider h-screen rounded-[0.22rem] translate-y-1/2 overflow-hidden relative z-10">
              <div className="relative w-full h-full">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="js-slider-img absolute inset-0 opacity-0 scale-[1.1] -translate-x-[4%] transition-all duration-[1500ms] will-change-transform"
                  >
                    <img
                      className="w-full h-full object-cover object-center select-none pointer-events-none"
                      src={slide.img}
                      alt={slide.title}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-t from-[#3D3830] via-[rgba(53,51,47,0)] to-transparent" />
                  </div>
                ))}
              </div>

              {/* Dynamic Overlay HUD Labels */}
              <div className="absolute left-[0.4rem] bottom-[0.28rem] max-w-[1.9rem] text-[0.14rem] tracking-widest uppercase text-white font-medium">
                Our Exquisite Collection of Tiles
              </div>

              {/* Rolling Vertical Typography Scroller */}
              <div className="absolute left-[3.09rem] bottom-[0.2rem] h-[1.3em] flex flex-col justify-end text-[0.94rem] text-white overflow-hidden tracking-tight font-light">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="js-title-item h-[1.3em] min-h-[1.3em] flex items-center will-change-transform"
                  >
                    {slide.title}
                  </div>
                ))}
              </div>

              {/* Fractional Tracking Counter */}
              <div className="absolute right-[0.4rem] bottom-[0.28rem] flex gap-[0.5em] text-[0.18rem] uppercase text-white tracking-widest font-mono">
                <div className="h-[1.3em] overflow-hidden">
                  {slides.map((slide) => (
                    <div
                      key={slide.id}
                      className="js-numeric-item h-[1.3em] flex items-center will-change-transform"
                    >
                      {slide.id}
                    </div>
                  ))}
                </div>
                <span className="opacity-40">-</span>
                <div>{String(slides.length).padStart(2, "0")}</div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Global CSS Injectable Animations for Infinite Preloader Sync */}
      <style jsx global>{`
        @keyframes preloaderAnimation1 {
          0%,
          100% {
            opacity: 0;
          }
          1%,
          25% {
            opacity: 1;
          }
          25.01% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
