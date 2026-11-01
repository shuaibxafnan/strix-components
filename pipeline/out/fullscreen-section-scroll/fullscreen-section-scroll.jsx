"use client";

import { useEffect, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    text: "Scroll down",
    img: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    text: "Animated sections",
    img: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    text: "Full screen",
    img: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
  },
  {
    text: "Smooth transitions",
    img: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1600&q=80",
  },
  {
    text: "Keep scrolling",
    img: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1600&q=80",
    position: "50% 45%",
  },
];

export default function FullscreenSectionScroll({
  slides = DEFAULT_SLIDES,
  headerTitle = "Animated Sections",
  animDuration = 1.25,
  animEase = "power1.inOut",
  textAnimEase = "power2.out",
  bgGradient = "linear-gradient(180deg, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.1) 100%)",
  textColor = "#ffffff",
  backgroundColor = "#000000",
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let observerInstance = null;
    let activeTl = null;
    let gsapRef = null;

    (async () => {
      const gsapModule = await import("gsap");
      const observerModule = await import("gsap/Observer");
      if (cancelled || !containerRef.current) return;
      const gsap = gsapModule.gsap || gsapModule.default;
      const Observer = observerModule.Observer || observerModule.default;
      gsapRef = gsap;
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
        activeTl = tl;

        if (currentIndex >= 0) {
          gsap.set(sections[currentIndex], { zIndex: 0 });
          tl.to(images[currentIndex], { yPercent: -15 * dFactor }).set(
            sections[currentIndex],
            { autoAlpha: 0 },
          );
        }

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

      observerInstance = Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => !isAnimating && gotoSection(currentIndex - 1, -1),
        onUp: () => !isAnimating && gotoSection(currentIndex + 1, 1),
        tolerance: 10,
        preventDefault: true,
      });

      gotoSection(0, 1);
    })();

    return () => {
      cancelled = true;
      if (observerInstance) observerInstance.kill();
      if (activeTl) activeTl.kill();
      if (gsapRef && containerRef.current) {
        gsapRef.killTweensOf(containerRef.current.querySelectorAll("*"));
      }
    };
  }, [slides, animDuration, animEase, textAnimEase, bgGradient]);

  return (
    <div
      ref={containerRef}
      className={`m-0 p-0 h-screen w-full overflow-hidden select-none uppercase antialiased ${className}`}
      style={{ color: textColor, backgroundColor }}
    >
      <header className="fixed top-0 left-0 flex items-center justify-between px-[5%] w-full h-[7em] z-[3] text-[clamp(0.66rem,2vw,1rem)] tracking-[0.5em]">
        <div>{headerTitle}</div>
      </header>

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
                  backgroundPosition: slide.position || "center",
                }}
              >
                <h2 className="w-[90vw] max-w-[1200px] text-center font-semibold leading-[1.2] text-[clamp(1.5rem,5vw,6rem)] normal-case tracking-normal z-10 mr-[-0.5em]">
                  {slide.text.split(" ").map((word, wIdx, wordArr) => (
                    <span
                      key={wIdx}
                      className="inline-block whitespace-nowrap overflow-hidden py-[0.1em] align-bottom"
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
