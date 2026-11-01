"use client";

import { useEffect, useRef } from "react";

const LETTER_PATHS = [
  "m 18.33988,18.473947 2.972799,21.264027 h 6.897396 l 0.775947,-10.56614 1.138518,10.56614 h 5.695787 L 39.166408,18.473947 H 33.07115 L 32.697866,29.705355 31.532573,18.473947 h -5.24299 L 25.360746,29.705355 24.624891,18.473947 Z",
  "m 39.996414,18.473947 v 21.264027 h 9.993666 v -4.85919 h -4.680578 v -3.170869 h 2.840073 v -5.388356 h -2.840073 v -2.986422 h 4.680578 v -4.85919 z",
  "m 50.93967,18.473947 v 21.264027 h 9.993663 v -4.85919 h -4.680577 v -3.170869 h 2.840074 v -5.388356 h -2.840074 v -2.986422 h 4.680577 v -4.85919 z",
  "m 67.132759,18.473947 h -5.313086 v 21.264027 h 5.313086 V 31.85948 l 3.099302,7.878494 h 5.313088 l -3.66856,-10.197247 3.66856,-11.06678 h -5.313088 l -3.099302,8.748026 z",
  "m 76.532304,18.473947 v 21.264027 h 9.993663 v -4.85919 h -4.680575 v -3.170869 h 2.840072 v -5.388356 h -2.840072 v -2.986422 h 4.680575 v -4.85919 z",
  "m 87.349058,18.473947 v 21.264027 h 5.842254 l -1.058333,-10.452033 3.202647,10.452033 h 6.578104 V 18.473947 h -5.842247 l 1.05833,10.452033 -3.202646,-10.452033 z",
  "M 114.98702,35.759203 V 22.452718 c 0,-1.212076 0.31626,-2.661297 -1.39152,-3.372733 -1.77103,-0.737785 -5.75585,-0.606038 -7.96962,-0.606038 h -2.78305 v 21.264027 h 2.78305 c 2.21377,0 6.19859,0.105398 7.96962,-0.606038 1.70778,-0.711436 1.39152,-2.160657 1.39152,-3.372733 z m -5.27168,-12.349195 -0.0414,11.365555 c -5.8e-4,0.158097 0.12651,0.632388 -0.94876,0.632388 h -0.0884 V 22.80397 h 0.0884 c 1.07527,0 0.99017,0.737785 0.99017,0.606038 z",
];

const DEFAULT_LAYER_DELAYS = [0.15, 0.1, 0.05, 0];

export default function StretchMorphText({
  bgColor = "#000",
  colorOne = "#F41144",
  colorTwo = "#6E0DFE",
  colorThree = "#F3C607",
  colorFour = "#ffffff",
  stretchScale = 4.5,
  squishScale = 0.35,
  squishShift = 68,
  stretchShift = -52,
  morphDuration = 0.22,
  morphDelay = 0.12,
  staggerEach = 0.065,
  layerDelays = DEFAULT_LAYER_DELAYS,
  repeatDelay = 0.65,
  className = "",
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    let timelines = [];
    let cancelled = false;

    import("gsap").then(({ gsap }) => {
      const svg = svgRef.current;
      if (cancelled || !svg) return;

      const layerClasses = [".layer-one", ".layer-two", ".layer-three", ".layer-four"];

      const tlDefaults = {
        duration: morphDuration,
        delay: morphDelay,
        stagger: { each: staggerEach },
        transformOrigin: "50% 100%",
        ease: "power2.inOut",
      };

      layerClasses.forEach((selector, idx) => {
        const delay = layerDelays[idx] ?? 0;
        const targets = svg.querySelectorAll(`${selector} path`);

        const tl = gsap
          .timeline({ delay, defaults: tlDefaults, repeat: -1, repeatDelay })
          .to(targets, { scaleY: stretchScale, y: stretchShift })
          .to(targets, { scaleY: squishScale, y: squishShift })
          .to(targets, { scaleY: stretchScale, y: stretchShift })
          .to(targets, { scaleY: 1, y: 0 });

        timelines.push(tl);
      });
    });

    return () => {
      cancelled = true;
      timelines.forEach((tl) => tl.kill());
      timelines = [];
    };
  }, [
    stretchScale,
    squishScale,
    squishShift,
    stretchShift,
    morphDuration,
    morphDelay,
    staggerEach,
    layerDelays,
    repeatDelay,
  ]);

  const layers = [
    ["layer-one", colorOne],
    ["layer-two", colorTwo],
    ["layer-three", colorThree],
    ["layer-four", colorFour],
  ];

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 132.29167 132.29167"
        className="w-full max-w-lg"
      >
        {layers.map(([cls, color]) => (
          <g key={cls} className={cls} style={{ fill: color }}>
            {LETTER_PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
