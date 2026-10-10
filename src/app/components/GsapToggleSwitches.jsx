"use client";

import { useEffect, useRef } from "react";

// ─── GsapToggleSwitches ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// switches         array    [4 default toggles]   Array of toggle configs, each:
//                                                  { id, label, duration, offset,
//                                                    random, easeType, easeStrength,
//                                                    easePoints, elasticAmplitude,
//                                                    elasticPeriod }
//                                                  easeType is "rough" or "elastic"
// rows              number   12                     Number of rects drawn in each switch track
// railWidth         number   84                     SVG width (toggle track width, px)
// railHeight        number   36                     SVG height (toggle track height, px)
// travelDistance    number   48                      X distance rects animate on toggle
// stripeColorA      string   #181a29                 Background gradient stripe color A
// stripeColorB      string   #202436                 Background gradient stripe color B
// dotColor          string   #484a57                 Unchecked rect fill color
// dotColorActive    string   #76b3fa                 Checked rect fill color
// borderColor       string   #575969                 Unchecked border color
// borderColorActive string   #76b3fa                 Checked border color
// borderColorFocus  string   #faed76                 Focus-visible border color
// glowColorActive   string   #0763f7                 Checked box-shadow glow color
// glowColorFocus    string   #c96220                 Focus-visible box-shadow glow color
// bgColor           string   #3d3e4a                 Page background color
// headingColor      string   #76b3fa                 Heading text color
// headingBgColor    string   rgba(0,0,0,0.5)          Heading background color
// labelColor        string   #a3a7ad                  Toggle label text color
// heading           string   "GSAP animated checkboxes"  Heading text
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SWITCHES = [
  {
    id: "elastic-slide-toggle-control",
    label: "Elastic",
    duration: 1.8,
    offset: 0.015,
    random: true,
    easeType: "elastic",
    elasticAmplitude: 1.4,
    elasticPeriod: 0.4,
  },
  {
    id: "uniform-elastic-slide-toggle-control",
    label: "Elastic 2",
    duration: 1.8,
    offset: 0.015,
    random: false,
    easeType: "elastic",
    elasticAmplitude: 1.4,
    elasticPeriod: 0.4,
  },
  {
    id: "rough-slide-toggle-control",
    label: "Glitch",
    duration: 0.4,
    offset: 0.015,
    random: true,
    easeType: "rough",
    easeStrength: 5,
    easePoints: 20,
  },
  {
    id: "uniform-rough-slide-toggle-control",
    label: "Glitch 2",
    duration: 0.4,
    offset: 0.015,
    random: false,
    easeType: "rough",
    easeStrength: 3,
    easePoints: 15,
  },
];

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GsapToggleSwitches({
  switches = DEFAULT_SWITCHES,
  rows = 12,
  railWidth = 84,
  railHeight = 36,
  travelDistance = 48,
  stripeColorA = "#181a29",
  stripeColorB = "#202436",
  dotColor = "#484a57",
  dotColorActive = "#76b3fa",
  borderColor = "#575969",
  borderColorActive = "#76b3fa",
  borderColorFocus = "#faed76",
  glowColorActive = "#0763f7",
  glowColorFocus = "#c96220",
  bgColor = "#3d3e4a",
  headingColor = "#76b3fa",
  headingBgColor = "rgba(0, 0, 0, 0.5)",
  labelColor = "#a3a7ad",
  heading = "GSAP animated checkboxes",
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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const changeHandlers = [];

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/EasePack.min.js",
        ),
      )
      .then(() => {
        const { gsap, RoughEase } = window;
        if (!gsap || !containerRef.current) return;

        gsap.registerPlugin(window.EasePack);

        switches.forEach((cfg) => {
          const inputEl = containerRef.current.querySelector(`#${cfg.id}`);
          if (!inputEl) return;

          const ease =
            cfg.easeType === "rough"
              ? RoughEase.ease.config({
                  strength: cfg.easeStrength ?? 5,
                  points: cfg.easePoints ?? 20,
                })
              : `elastic.out(${cfg.elasticAmplitude ?? 1.4}, ${
                  cfg.elasticPeriod ?? 0.4
                })`;

          const handler = () => {
            let nodes = [
              ...inputEl.nextElementSibling.querySelectorAll(".switch rect"),
            ];

            if (cfg.random) {
              nodes = shuffleArray(nodes);
            }

            gsap.to(nodes, {
              duration: cfg.duration ?? 0.4,
              ease,
              x: inputEl.checked ? travelDistance : 0,
              stagger: cfg.offset ?? 0.015,
              overwrite: true,
            });
          };

          inputEl.addEventListener("change", handler);
          changeHandlers.push({ inputEl, handler });
        });
      })
      .catch((e) =>
        console.error("[GsapToggleSwitches] script load failed:", e.message),
      );

    return () => {
      changeHandlers.forEach(({ inputEl, handler }) =>
        inputEl.removeEventListener("change", handler),
      );
    };
  }, [switches, travelDistance]);

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center py-10 font-[IBM_Plex_Mono,monospace] text-xs font-light"
      style={{ backgroundColor: bgColor, color: labelColor }}
    >
      <h1
        className="mb-8 w-full py-5 text-center font-[Lexend_Deca,sans-serif] text-xl font-light"
        style={{ backgroundColor: headingBgColor, color: headingColor }}
      >
        {heading}
      </h1>

      <div ref={containerRef} className="m-2.5 flex flex-wrap justify-center">
        {switches.map((cfg, idx) => (
          <div
            key={cfg.id}
            className="relative m-2.5 mx-5 flex cursor-pointer flex-col items-center rounded-lg"
          >
            <label className="mb-4 flex cursor-pointer flex-col items-center bg-transparent">
              <input
                id={cfg.id}
                type="checkbox"
                name="options[]"
                value={idx + 1}
                aria-labelledby={`label-${cfg.id}`}
                className="pointer-events-auto absolute cursor-pointer opacity-0 peer"
              />
              <div
                className="flex overflow-hidden rounded [border-width:2px] [transition:border-color_300ms_ease-in-out,box-shadow_300ms_ease-in-out] peer-checked:[box-shadow:0_0_20px_0_var(--glow-active)] peer-focus-visible:[box-shadow:0_0_20px_0_var(--glow-focus)]"
                style={{
                  borderColor: borderColor,
                  "--glow-active": glowColorActive,
                  "--glow-focus": glowColorFocus,
                }}
              >
                <svg
                  height={railHeight}
                  width={railWidth}
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id={`gradient-pattern-${cfg.id}`}
                      patternUnits="userSpaceOnUse"
                      width="1"
                      height="4"
                    >
                      <rect width="100%" height="2" fill={stripeColorA} />
                      <rect y="2" width="100%" height="2" fill={stripeColorB} />
                    </pattern>
                  </defs>

                  <rect
                    x="0"
                    y="0"
                    width={railWidth}
                    height={railHeight}
                    fill={`url(#gradient-pattern-${cfg.id})`}
                  />

                  <g className="switch">
                    {Array.from({ length: rows }).map((_, i) => (
                      <rect
                        key={i}
                        x="6"
                        y={6 + i * 2}
                        width="24"
                        height="2"
                        fill={dotColor}
                      />
                    ))}
                  </g>
                </svg>
              </div>
              <span id={`label-${cfg.id}`} className="mt-4">
                {cfg.label}
              </span>
            </label>
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            input[type="checkbox"]:checked + div {
              border-color: ${borderColorActive};
            }
            input[type="checkbox"]:checked + div .switch rect {
              fill: ${dotColorActive};
            }
            input[type="checkbox"]:focus-visible + div {
              border-color: ${borderColorFocus};
            }
          `,
        }}
      />
    </div>
  );
}
