"use client";

import { useEffect, useRef } from "react";

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

export default function StaggerToggleSwitches({
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
  labelColor = "#a3a7ad",
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const changeHandlers = [];

    (async () => {
      const { gsap } = await import("gsap");
      const { EasePack, RoughEase } = await import("gsap/EasePack");
      if (cancelled || !containerRef.current) return;

      gsap.registerPlugin(EasePack);

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
        changeHandlers.push({ inputEl, handler, nodes: () => inputEl.nextElementSibling.querySelectorAll(".switch rect"), gsap });
      });
    })();

    return () => {
      cancelled = true;
      changeHandlers.forEach(({ inputEl, handler, nodes, gsap }) => {
        inputEl.removeEventListener("change", handler);
        gsap.killTweensOf(nodes());
      });
    };
  }, [switches, travelDistance]);

  return (
    <div
      className={`stagger-toggle-root w-full h-screen flex items-center justify-center text-xs font-light ${className}`}
      style={{ color: labelColor }}
    >
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
            .stagger-toggle-root input[type="checkbox"]:checked + div {
              border-color: ${borderColorActive};
            }
            .stagger-toggle-root input[type="checkbox"]:checked + div .switch rect {
              fill: ${dotColorActive};
            }
            .stagger-toggle-root input[type="checkbox"]:focus-visible + div {
              border-color: ${borderColorFocus};
            }
          `,
        }}
      />
    </div>
  );
}
