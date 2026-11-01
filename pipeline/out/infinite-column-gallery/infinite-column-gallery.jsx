"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_COLUMNS = [
  [
    "https://images.pexels.com/photos/10324713/pexels-photo-10324713.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/10533885/pexels-photo-10533885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/10253213/pexels-photo-10253213.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  [
    "https://images.pexels.com/photos/10050979/pexels-photo-10050979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/1128660/pexels-photo-1128660.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/9699293/pexels-photo-9699293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  [
    "https://images.pexels.com/photos/6405575/pexels-photo-6405575.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/10162526/pexels-photo-10162526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/4394807/pexels-photo-4394807.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
];

export default function InfiniteColumnGallery({
  baseDuration = 20,
  oddDuration = 26,
  scrollIntensity = 300,
  boostDecay = 1.5,
  gapX = "16px",
  gapY = "16px",
  bgColor = "#EEE",
  headlineText = "Gallery",
  headlineColor = "#ffffff",
  headlineFontSize = "10vw",
  headlineFont = "Bebas Neue",
  grayscale = true,
  imageRadius = "0px",
  columns = DEFAULT_COLUMNS,
  className = "",
}) {
  const stripRefs = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(function () {
    setMounted(true);
  }, []);

  useEffect(
    function () {
      if (!mounted) return;

      let cancelled = false;
      let cleanup = null;

      const id = "gfont-" + headlineFont.replace(/\s+/g, "-");
      let link = document.getElementById(id);
      let addedLink = false;
      if (!link) {
        link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=" +
          encodeURIComponent(headlineFont) +
          "&display=swap";
        document.head.appendChild(link);
        addedLink = true;
      }

      import("gsap").then(function (mod) {
        if (cancelled) return;
        const gsap = mod.gsap || mod.default;

        const tweens = [];

        stripRefs.current.forEach(function (strip, i) {
          if (!strip) return;

          const isOdd = i % 2 !== 0;
          const duration = isOdd ? oddDuration : baseDuration;

          const tween = gsap.fromTo(
            strip,
            { y: isOdd ? "-50%" : "0%" },
            {
              y: isOdd ? "0%" : "-50%",
              duration: duration,
              ease: "none",
              repeat: -1,
              immediateRender: true,
            },
          );

          tweens.push(tween);
        });

        let lastScrollY = window.scrollY;
        let lastScrollTime = performance.now();
        let decayAnims = [];

        const onScroll = function () {
          const now = performance.now();
          const dy = window.scrollY - lastScrollY;
          const dt = now - lastScrollTime;

          lastScrollY = window.scrollY;
          lastScrollTime = now;

          if (dt === 0) return;

          const velocity = Math.abs(dy / dt) * 1000;
          if (velocity < 10) return;

          decayAnims.forEach(function (a) {
            if (a) a.kill();
          });
          decayAnims = [];

          const boost = 1 + velocity / scrollIntensity;

          tweens.forEach(function (tween) {
            tween.timeScale(boost);

            const proxy = { ts: boost };
            const decay = gsap.to(proxy, {
              ts: 1,
              duration: boostDecay,
              ease: "power2.out",
              onUpdate: function () {
                tween.timeScale(proxy.ts);
              },
            });
            decayAnims.push(decay);
          });
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        cleanup = function () {
          window.removeEventListener("scroll", onScroll);
          decayAnims.forEach(function (a) {
            if (a) a.kill();
          });
          tweens.forEach(function (t) {
            t.kill();
          });
        };
      });

      return function () {
        cancelled = true;
        if (cleanup) cleanup();
        if (addedLink && link.parentNode) link.parentNode.removeChild(link);
      };
    },
    [
      mounted,
      baseDuration,
      oddDuration,
      scrollIntensity,
      boostDecay,
      headlineFont,
      columns,
    ],
  );

  if (!mounted) return null;

  const imgClass =
    "w-full object-cover block " +
    (grayscale
      ? "grayscale hover:grayscale-0 transition-[filter] duration-300 ease-out"
      : "");

  return (
    <div
      className={"relative w-full min-h-[500vh] " + className}
      style={{ backgroundColor: bgColor }}
    >
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <h1
          className="uppercase select-none text-center leading-none mix-blend-difference"
          style={{
            fontFamily: "'" + headlineFont + "', sans-serif",
            fontSize: headlineFontSize,
            color: headlineColor,
            letterSpacing: "0.02em",
          }}
        >
          {headlineText}
        </h1>
      </div>

      <div
        className="fixed inset-0 z-10 flex flex-row overflow-hidden"
        style={{ gap: gapX }}
      >
        {columns.map(function (colImages, colIndex) {
          return (
            <div key={colIndex} className="relative flex-1 overflow-hidden">
              <div
                ref={function (el) {
                  stripRefs.current[colIndex] = el;
                }}
                className="flex flex-col will-change-transform"
                style={{
                  gap: gapY,
                  paddingBottom: gapY,
                }}
              >
                {colImages.map(function (src, imgIndex) {
                  return (
                    <div
                      key={"orig-" + imgIndex}
                      className="w-full flex-shrink-0 overflow-hidden"
                      style={{ borderRadius: imageRadius }}
                    >
                      <img
                        src={src}
                        alt={
                          "Gallery col " +
                          (colIndex + 1) +
                          " image " +
                          (imgIndex + 1)
                        }
                        className={imgClass}
                      />
                    </div>
                  );
                })}

                {colImages.map(function (src, imgIndex) {
                  return (
                    <div
                      key={"clone-" + imgIndex}
                      className="w-full flex-shrink-0 overflow-hidden"
                      style={{ borderRadius: imageRadius }}
                      aria-hidden="true"
                    >
                      <img src={src} alt="" className={imgClass} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
