"use client";

import { useEffect, useRef } from "react";

// ─── AnimatedSections ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides          array    [...]     Array containing text configurations & image sources
// headerTitle     string   "..."     Branding text positioned inside the sticky header
// headerLinkText  string   "..."     Right-hand navigation string asset representation
// headerLinkUrl   string   "..."     Hyperlink assignment tied to header interaction
// animDuration    number   1.25      Global slide transit interpolation step duration
// animEase        string   "..."     Primary easing style applied to physical layers
// textAnimEase    string   "..."     Target tracking motion style for letter staggers
// bgGradient      string   "..."     CSS gradient styling providing visual text safety
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    text: "Scroll down",
    img: "https://assets.codepen.io/16327/site-landscape-1.jpg",
  },
  {
    text: "Animated with GSAP",
    img: "https://assets.codepen.io/16327/site-landscape-2.jpg",
  },
  {
    text: "GreenSock",
    img: "https://assets.codepen.io/16327/site-landscape-3.jpg",
  },
  {
    text: "Animation platform",
    img: "https://assets.codepen.io/16327/site-landscape-4.jpg",
  },
  {
    text: "Keep scrolling",
    img: "https://assets.codepen.io/16327/site-landscape-5.jpg",
  },
];

export default function GreenSockScroll({
  slides = DEFAULT_SLIDES,
  headerTitle = "Animated Sections",
  animDuration = 1.25,
  animEase = "power1.inOut",
  textAnimEase = "power2.out",
  bgGradient = "linear-gradient(180deg, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.1) 100%)",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
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

    // Dynamically request vendor bundles containing GSAP Core and the Observer plugin
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Observer.min.js",
      ),
    ])
      .then(() => {
        const { gsap, Observer } = window;
        if (!gsap || !Observer || !containerRef.current) return;

        gsap.registerPlugin(Observer);

        const sections = containerRef.current.querySelectorAll(".js-section");
        const images = containerRef.current.querySelectorAll(".js-bg");
        const outerWrappers = gsap.utils.toArray(
          containerRef.current.querySelectorAll(".js-outer"),
        );
        const innerWrappers = gsap.utils.toArray(
          containerRef.current.querySelectorAll(".js-inner"),
        );

        let currentIndex = -1;
        const wrap = gsap.utils.wrap(0, sections.length);
        let isAnimating = false;

        // Establish core presentation states across structural layout layers
        gsap.set(outerWrappers, { yPercent: 100 });
        gsap.set(innerWrappers, { yPercent: -100 });

        function gotoSection(index, direction) {
          index = wrap(index);
          isAnimating = true;

          const fromTop = direction === -1;
          const dFactor = fromTop ? -1 : 1;

          const tl = gsap.timeline({
            defaults: { duration: animDuration, ease: animEase },
            onComplete: () => {
              isAnimating = false;
            },
          });

          // Transition old slide out of view if this isn't the initial load
          if (currentIndex >= 0) {
            gsap.set(sections[currentIndex], { zIndex: 0 });
            tl.to(images[currentIndex], { yPercent: -15 * dFactor }).set(
              sections[currentIndex],
              { autoAlpha: 0 },
            );
          }

          // Transition new slide into view
          gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });

          tl.fromTo(
            [outerWrappers[index], innerWrappers[index]],
            { yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor) },
            { yPercent: 0 },
            0,
          ).fromTo(
            images[index],
            { yPercent: 15 * dFactor },
            { yPercent: 0 },
            0,
          );

          // Animate the text characters inside the target container section
          const targetHeadingChars =
            sections[index].querySelectorAll(".js-char");
          if (targetHeadingChars.length > 0) {
            tl.fromTo(
              targetHeadingChars,
              { autoAlpha: 0, yPercent: 150 * dFactor },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: 1,
                ease: textAnimEase,
                stagger: { each: 0.02, from: "random" },
              },
              0.2,
            );
          }

          currentIndex = index;
        }

        // Initialize runtime interaction listeners
        const observerInstance = Observer.create({
          type: "wheel,touch,pointer",
          wheelSpeed: -1,
          onDown: () => !isAnimating && gotoSection(currentIndex - 1, -1),
          onUp: () => !isAnimating && gotoSection(currentIndex + 1, 1),
          tolerance: 10,
          preventDefault: true,
        });

        // Trigger presentation configuration on index item zero
        gotoSection(0, 1);

        return () => {
          if (observerInstance) observerInstance.kill();
        };
      })
      .catch((err) =>
        console.error("[AnimatedSections] Execution halted:", err.message),
      );
  }, [slides, animDuration, animEase, textAnimEase, bgGradient]);

  return (
    <div
      ref={containerRef}
      className="m-0 p-0 h-screen w-full overflow-hidden text-white select-none uppercase antialiased bg-black"
    >
      {/* Global Sticky Header */}
      <header className="fixed top-0 left-0 flex items-center justify-between px-[5%] w-full h-[7em] z-[3] text-[clamp(0.66rem,2vw,1rem)] tracking-[0.5em]">
        <div>{headerTitle}</div>
      </header>

      {/* Screen Sections Track */}
      {slides.map((slide, sIdx) => (
        <section
          key={sIdx}
          className="js-section fixed top-0 left-0 w-full h-full invisible overflow-hidden"
        >
          <div className="js-outer w-full h-full overflow-hidden">
            <div className="js-inner w-full h-full overflow-hidden">
              <div
                className="js-bg absolute top-0 left-0 w-full h-full bg-cover bg-center flex items-center justify-center"
                style={{
                  backgroundImage: `${bgGradient}, url("${slide.img}")`,
                  backgroundPosition: sIdx === 4 ? "50% 45%" : "center",
                }}
              >
                <h2 className="w-[90vw] max-w-[1200px] text-center font-semibold leading-[1.2] text-[clamp(1.5rem,5vw,6rem)] normal-case tracking-normal z-10 mr-[-0.5em]">
                  {/* Safely split sentences into clean inline character structures */}
                  {slide.text.split(" ").map((word, wIdx, wordArr) => (
                    <span
                      key={wIdx}
                      className="inline-block whitespace-nowrap overflow-hidden py-[0.1em] vertical-align-bottom"
                    >
                      {word.split("").map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className="js-char inline-block will-change-transform"
                        >
                          {char}
                        </span>
                      ))}
                      {wIdx < wordArr.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                      )}
                    </span>
                  ))}
                </h2>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
