"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const DEFAULT_COLORS = ["#000000", "#262626", "#404040"];

const DEFAULT_SCENES = [
  {
    name: "The Clay",
    vaseImg:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/clay.png",
    specs: [
      { label: "Height", value: "32cm" },
      { label: "Shape", value: "Amphora" },
      { label: "Material", value: "Stoneware" },
      { label: "Finish", value: "Matte Slip" },
      { label: "Handles", value: "Two" },
      { label: "Capacity", value: "3.5L" },
    ],
    topPhoto: unsplash("photo-1753164725848-471a8abbb6f5"),
    topPhotoAlt: "A potter shaping a clay vase on a spinning wheel",
    bottomPhoto: unsplash("photo-1757083821615-62de7719c864"),
    bottomPhotoAlt: "Clay jug with a flower design on a wooden stand",
    makerName: "Maya Ortiz",
    makerTag: "Maker of The Clay",
  },
  {
    name: "The Indigo",
    vaseImg:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/solid-dblue.png",
    specs: [
      { label: "Height", value: "28cm" },
      { label: "Shape", value: "Bottle Neck" },
      { label: "Material", value: "Porcelain" },
      { label: "Finish", value: "Gloss Glaze" },
      { label: "Opening", value: "Narrow" },
      { label: "Capacity", value: "2.2L" },
    ],
    topPhoto: unsplash("photo-1656088239658-ca839d7e8841"),
    topPhotoAlt: "Close-up of a ceramic vase",
    bottomPhoto: unsplash("photo-1738858363202-dd019dadce76"),
    bottomPhotoAlt: "A large gray vase on a tile floor",
    makerName: "Elias Brandt",
    makerTag: "Maker of The Indigo",
  },
  {
    name: "The Umber",
    vaseImg:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/duo-brown.png",
    specs: [
      { label: "Height", value: "36cm" },
      { label: "Shape", value: "Tall Oval" },
      { label: "Material", value: "Terracotta" },
      { label: "Finish", value: "Two Tone Glaze" },
      { label: "Opening", value: "Wide" },
      { label: "Capacity", value: "4.8L" },
    ],
    topPhoto: unsplash("photo-1769203905448-0ba060069e6f"),
    topPhotoAlt: "Earthenware jug with a handle on draped fabric",
    bottomPhoto: unsplash("photo-1771627278991-8922851b9435"),
    bottomPhotoAlt: "Several clay jugs and bottles on a stone surface",
    makerName: "Noor Haddad",
    makerTag: "Maker of The Umber",
  },
];

const EASE = "ease-[cubic-bezier(0.55,0,0.1,1)]";
const WIPE_EASING = "cubic-bezier(0.55, 0, 0.1, 1)";

const motion = (state, transitionClass, ms) => ({
  className: state === "wait" ? "transition-none" : `${transitionClass} ${EASE}`,
  style: {
    transitionDuration: `${ms}ms`,
    transitionDelay: `${state === "enter" ? ms / 2 : 0}ms`,
  },
});

const slideClass = (state, fade = true) => {
  const x =
    state === "enter"
      ? "translate-x-0 z-[2]"
      : state === "exit"
        ? "-translate-x-full z-[2]"
        : "translate-x-full z-[1]";
  if (!fade) return x;
  return `${x} ${state === "enter" ? "opacity-100" : "opacity-0"}`;
};

const ArrowIcon = ({ direction }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path
      d={
        direction === "left"
          ? "M19 12H5M12 19l-7-7 7-7"
          : "M5 12h14M12 5l7 7-7 7"
      }
    />
  </svg>
);

export default function NitroShowcase({
  brandName = "Kiln",
  transitionMs = 500,
  sceneColors = DEFAULT_COLORS,
  scenes = DEFAULT_SCENES,
  prevLabel = "Prev",
  nextLabel = "Next",
  prevAriaLabel = "Previous vase",
  nextAriaLabel = "Next vase",
  headingFont = "Barlow Condensed",
  bodyFont = "Space Grotesk",
  backgroundColor = "bg-white",
  textColor = "text-black",
  className = "",
}) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const lockedRef = useRef(false);
  const timerRef = useRef(null);
  const coverRefs = useRef([]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const navigate = useCallback(
    (step) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const total = scenes.length;
      const next = (((current + step) % total) + total) % total;
      setPrev(current);
      setCurrent(next);

      coverRefs.current.forEach((el) =>
        el?.animate(
          [
            { transform: "translateX(-100%)", easing: WIPE_EASING },
            { transform: "translateX(0%)", offset: 0.5, easing: WIPE_EASING },
            { transform: "translateX(100%)" },
          ],
          { duration: transitionMs },
        ),
      );

      timerRef.current = setTimeout(() => {
        setPrev(null);
        lockedRef.current = false;
      }, transitionMs);
    },
    [current, scenes.length, transitionMs],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const layerState = (i) => (i === current ? "enter" : i === prev ? "exit" : "wait");
  const headingStack = `'${headingFont}', ui-sans-serif, sans-serif`;
  const bodyStack = `'${bodyFont}', ui-sans-serif, system-ui, sans-serif`;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, "+")}:wght@400;700;800&family=${bodyFont.replace(/ /g, "+")}:wght@300;400;500&display=swap`}
        precedence="default"
      />

      <div
        className={`flex h-[100dvh] w-full flex-col overflow-hidden md:flex-row ${className}`}
        style={{ fontFamily: bodyStack }}
      >
        <div
          className={`relative order-2 flex min-h-0 flex-1 flex-col md:order-1 md:w-1/3 md:flex-none ${backgroundColor} ${textColor}`}
        >
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {scenes.map((scene, i) => {
              const state = layerState(i);
              const m = motion(state, "transition-[transform,opacity]", transitionMs);
              return (
                <div
                  key={i}
                  aria-hidden={state !== "enter"}
                  className={`absolute inset-0 flex flex-col ${backgroundColor} ${slideClass(state)} ${m.className}`}
                  style={m.style}
                >
                  <div className="flex shrink-0 items-baseline justify-between px-5 pb-2 pt-5">
                    <span
                      className="select-none text-[clamp(0.65rem,0.9vw,0.85rem)] font-bold uppercase tracking-[0.3em] opacity-30"
                      style={{ fontFamily: headingStack }}
                    >
                      {brandName}
                    </span>
                    <span className="select-none text-[clamp(0.65rem,0.8vw,0.75rem)] font-light opacity-30">
                      {pad(i + 1)} / {pad(scenes.length)}
                    </span>
                  </div>

                  <div className="shrink-0 px-5">
                    <h2
                      className="m-0 text-[clamp(2rem,5.5vw,5rem)] font-extrabold uppercase leading-none tracking-[-0.01em]"
                      style={{
                        fontFamily: headingStack,
                        color: sceneColors[i % sceneColors.length],
                      }}
                    >
                      {scene.name}
                    </h2>
                  </div>

                  <div className="relative min-h-0 flex-1">
                    <img
                      src={scene.vaseImg}
                      alt={scene.name}
                      className="absolute inset-0 m-auto h-[70%] w-[70%] object-contain"
                    />
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 md:grid-cols-1 md:gap-y-[5px]">
                    {scene.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="grid md:grid-cols-[1fr_1.5fr] md:gap-x-3"
                      >
                        <span className="text-[clamp(0.65rem,0.75vw,0.72rem)] uppercase tracking-wider opacity-50 md:text-right">
                          {spec.label}
                        </span>
                        <span
                          className="text-[clamp(0.7rem,0.85vw,0.82rem)] font-bold uppercase tracking-[0.05em]"
                          style={{ fontFamily: headingStack }}
                        >
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex h-[52px] shrink-0 items-stretch border-t border-neutral-500/20">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={prevAriaLabel}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 border-r border-neutral-500/20 transition active:scale-95 hover:bg-neutral-500/10"
            >
              <ArrowIcon direction="left" />
              <span
                className="text-[clamp(0.7rem,1vw,0.9rem)] font-bold uppercase tracking-[0.2em]"
                style={{ fontFamily: headingStack }}
              >
                {prevLabel}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label={nextAriaLabel}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 transition active:scale-95 hover:bg-neutral-500/10"
            >
              <span
                className="text-[clamp(0.7rem,1vw,0.9rem)] font-bold uppercase tracking-[0.2em]"
                style={{ fontFamily: headingStack }}
              >
                {nextLabel}
              </span>
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="relative order-1 h-[45%] shrink-0 overflow-hidden md:order-2 md:h-auto md:w-2/3 md:flex-none">
          {scenes.map((_, i) => {
            const state = layerState(i);
            const m = motion(state, "transition-transform", transitionMs);
            const position =
              state === "enter"
                ? "translate-x-0 z-[2]"
                : state === "exit"
                  ? "translate-x-0 z-[1] transition-none"
                  : "translate-x-full z-[1]";
            return (
              <div
                key={i}
                className={`absolute inset-0 ${position} ${state === "exit" ? "" : m.className}`}
                style={{
                  ...m.style,
                  backgroundColor: sceneColors[i % sceneColors.length],
                }}
              />
            );
          })}

          <div className="absolute left-[6%] top-[8%] z-[3] h-[40%] w-[44%] overflow-hidden md:left-[10%] md:top-[10%] md:w-[40%]">
            {scenes.map((scene, i) => {
              const state = layerState(i);
              const m = motion(state, "transition-opacity", transitionMs);
              return (
                <img
                  key={i}
                  src={scene.topPhoto}
                  alt={state === "enter" ? scene.topPhotoAlt : ""}
                  className={`absolute inset-0 h-full w-full object-cover ${state === "enter" ? "opacity-100" : "opacity-0"
                    } ${m.className}`}
                  style={m.style}
                />
              );
            })}
            <div
              ref={(el) => (coverRefs.current[0] = el)}
              className="absolute inset-0 z-10 -translate-x-full bg-black"
            />
          </div>

          <div className="absolute left-[22%] top-[34%] z-[2] h-[40%] w-[68%] overflow-hidden md:left-[20%] md:top-[40%] md:h-[50%] md:w-[65%]">
            {scenes.map((scene, i) => {
              const state = layerState(i);
              const m = motion(state, "transition-opacity", transitionMs);
              return (
                <img
                  key={i}
                  src={scene.bottomPhoto}
                  alt={state === "enter" ? scene.bottomPhotoAlt : ""}
                  className={`absolute inset-0 h-full w-full object-cover ${state === "enter" ? "opacity-100" : "opacity-0"
                    } ${m.className}`}
                  style={m.style}
                />
              );
            })}
            <div
              ref={(el) => (coverRefs.current[1] = el)}
              className="absolute inset-0 z-10 -translate-x-full bg-white"
            />
          </div>

          <div className="absolute bottom-[4%] left-[6%] z-[5] w-[80%] overflow-hidden md:bottom-[5%] md:left-[10%] md:w-[45%]">
            <div className="relative min-h-16">
              {scenes.map((scene, i) => {
                const state = layerState(i);
                const m = motion(state, "transition-transform", transitionMs);
                return (
                  <div
                    key={i}
                    aria-hidden={state !== "enter"}
                    className={`absolute left-0 top-0 w-full ${slideClass(state, false)} ${m.className}`}
                    style={m.style}
                  >
                    <span
                      className="block text-[clamp(1.1rem,2.2vw,1.9rem)] font-extrabold uppercase tracking-[0.04em] text-white"
                      style={{ fontFamily: headingStack }}
                    >
                      {scene.makerName}
                    </span>
                    <span className="mt-0.5 block text-[clamp(0.65rem,1vw,0.85rem)] font-light uppercase tracking-[0.08em] text-white/60">
                      {scene.makerTag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}