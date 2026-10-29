"use client";

import { useEffect, useState } from "react";

const IMG = (n) =>
  `https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/${n}.png`;

const DEFAULT_ITEMS = [
  {
    name: ["Duo", "Blue"],
    tagline: "Twin-neck ceramic in deep cobalt",
    color: "#2C5282",
    image: IMG("duo-blue"),
    specs: [
      { val: "38 cm", desc: "Height" },
      { val: "Ceramic", desc: "Material" },
      { val: "Gloss", desc: "Finish" },
      { val: "2.1 L", desc: "Capacity" },
      { val: "1.6 kg", desc: "Weight" },
    ],
  },
  {
    name: ["Raw", "Clay"],
    tagline: "Hand-formed terracotta, left unglazed",
    color: "#9B2C2C",
    image: IMG("clay"),
    specs: [
      { val: "45 cm", desc: "Height" },
      { val: "Clay", desc: "Material" },
      { val: "Raw", desc: "Finish" },
      { val: "3.0 L", desc: "Capacity" },
      { val: "2.2 kg", desc: "Weight" },
    ],
  },
  {
    name: ["Duo", "Umber"],
    tagline: "Paired vessels in warm earth tones",
    color: "#B7791F",
    image: IMG("duo-brown"),
    specs: [
      { val: "34 cm", desc: "Height" },
      { val: "Ceramic", desc: "Material" },
      { val: "Satin", desc: "Finish" },
      { val: "1.8 L", desc: "Capacity" },
      { val: "1.4 kg", desc: "Weight" },
    ],
  },
  {
    name: ["Solid", "Indigo"],
    tagline: "A single dense form in midnight glaze",
    color: "#553C9A",
    image: IMG("solid-dblue"),
    specs: [
      { val: "50 cm", desc: "Height" },
      { val: "Ceramic", desc: "Material" },
      { val: "Matte", desc: "Finish" },
      { val: "3.6 L", desc: "Capacity" },
      { val: "2.9 kg", desc: "Weight" },
    ],
  },
];

export default function VaseShowcase({
  items = DEFAULT_ITEMS,
  autoPlayDuration = 4500,
  dotLabel = "Show vase",
  backgroundColor = "bg-black",
  textColor = "text-white",
  panelBgColor = "bg-white",
  panelTextColor = "text-black",
  labelTextColor = "text-black/60",
}) {
  const [index, setIndex] = useState(0);
  const [next, setNext] = useState(null);

  const sliding = next !== null;
  const current = items[index];
  const overlayColor = items[next ?? index].color;

  useEffect(() => {
    if (!sliding) return;
    const swap = setTimeout(() => setIndex(next), 400);
    const done = setTimeout(() => setNext(null), 1200);
    return () => {
      clearTimeout(swap);
      clearTimeout(done);
    };
  }, [sliding, next]);

  useEffect(() => {
    if (sliding || items.length < 2) return;
    const id = setTimeout(
      () => setNext((index + 1) % items.length),
      autoPlayDuration,
    );
    return () => clearTimeout(id);
  }, [index, sliding, items.length, autoPlayDuration]);

  const go = (i) => {
    if (!sliding && i !== index) setNext(i);
  };

  const fade = sliding ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0";

  return (
    <div
      className={`flex min-h-screen w-full items-center justify-center p-6 antialiased ${backgroundColor} ${textColor}`}
    >
      <div
        className="relative h-[520px] w-full max-w-[640px] select-none overflow-hidden rounded-md transition-colors duration-300"
        style={{ backgroundColor: current.color }}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${sliding ? "translate-y-0" : "-translate-y-full"
            }`}
          style={{ backgroundColor: overlayColor }}
        />

        <div className="relative z-20 flex h-full flex-col justify-between p-6 sm:p-10">
          <div
            className={`mt-2 text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${fade}`}
          >
            <h2 className="m-0 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              {current.name[0]}{" "}
              <span className="font-light italic opacity-80">
                {current.name[1]}
              </span>
            </h2>
            <p className="mt-1.5 text-xs font-medium uppercase tracking-wide opacity-60">
              {current.tagline}
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-[25%] mt-4 top-[20%] flex items-center justify-center">
            <img
              src={current.image}
              alt={current.name.join(" ")}
              draggable={false}
              className={`h-full w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${sliding ? "scale-90 opacity-0" : "scale-100 opacity-100"
                }`}
            />
          </div>

          <div
            className={`flex w-full items-center justify-between rounded-md border border-black/10 px-4 py-4 transition-all duration-500 motion-reduce:transition-none sm:px-6 sm:py-5 ${panelBgColor} ${sliding ? "translate-y-4 opacity-30" : "translate-y-0 opacity-100"
              }`}
          >
            {current.specs.map((spec) => (
              <div
                key={spec.desc}
                className="flex-1 border-r border-black/10 text-center last:border-r-0"
              >
                <div
                  className={`text-base font-black tracking-tight sm:text-lg ${panelTextColor}`}
                >
                  {spec.val}
                </div>
                <div
                  className={`mt-1 text-[9px] font-bold uppercase tracking-widest ${labelTextColor}`}
                >
                  {spec.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-6 top-6 z-30 flex flex-col gap-1 sm:right-8 sm:top-8">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`${dotLabel} ${i + 1}`}
              aria-current={i === index}
              className="flex h-5 w-5 items-center justify-center"
            >
              <span
                className={`h-3.5 w-3.5 rounded-full border-2 border-white transition-all duration-300 ${i === index ? "bg-white" : "bg-transparent opacity-50 hover:opacity-100"
                  }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}