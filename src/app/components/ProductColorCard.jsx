"use client";

import { useEffect, useRef, useState } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
});

const REPO =
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main";

const DEFAULT_VARIANTS = [
  { id: "v1", label: "Clay", hex: "#b8704f", image: `${REPO}/clay.png` },
  { id: "v2", label: "Umber", hex: "#6b4a3a", image: `${REPO}/duo-brown.png` },
  { id: "v3", label: "Indigo", hex: "#2b3a67", image: `${REPO}/solid-dblue.png` },
  { id: "v4", label: "Chestnut", hex: "#8b5a3c", image: `${REPO}/brown-solid.png` },
  { id: "v5", label: "Cobalt", hex: "#3b6ea5", image: `${REPO}/duo-blue.png` },
  { id: "v6", label: "Sienna", hex: "#a0522d", image: `${REPO}/pattern-brown.png` },
];

const DEFAULT_DIMENSIONS = [
  { label: "Height", value: 32, unit: "cm" },
  { label: "Width", value: 18, unit: "cm" },
  { label: "Opening", value: 8, unit: "cm" },
  { label: "Weight", value: 2, unit: "kg" },
];

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

const enter = (el, distance, duration, easing) =>
  el?.animate(
    [
      { opacity: 0, transform: `translateY(${distance})` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration, easing },
  );

export default function ProductColorCard({
  productName = "Terra Amphora",
  category = "Handmade Vase",
  price = 174,
  originalPrice = 237,
  currency = "$",
  description = "Hand thrown ceramic with a hand rubbed glaze. Each piece is fired and finished to order.",
  dimensions = DEFAULT_DIMENSIONS,
  variants = DEFAULT_VARIANTS,
  defaultVariant = DEFAULT_VARIANTS[0].id,
  onAddToCart = () => { },
  descriptionTabLabel = "Description",
  detailsTabLabel = "Details",
  cartLabel = "Add to cart",
  addedLabel = "Added",
  showBadge = false,
  badgeText = "New arrival",
  backgroundColor = "bg-black",
  cardColor = "bg-neutral-950",
  panelColor = "bg-neutral-900",
}) {
  const [activeId, setActiveId] = useState(defaultVariant);
  const [tab, setTab] = useState("desc");
  const [added, setAdded] = useState(false);
  const imageRef = useRef(null);
  const tabRef = useRef(null);
  const timerRef = useRef(null);

  const active = variants.find((v) => v.id === activeId) ?? variants[0];
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  useEffect(() => {
    enter(imageRef.current, "1.125rem", 450, EASE_OUT);
  }, [activeId]);

  useEffect(() => {
    enter(tabRef.current, "0.375rem", 200, "ease");
  }, [tab]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const selectVariant = (v) => {
    if (v.id !== activeId) setActiveId(v.id);
  };

  const handleCart = () => {
    setAdded(true);
    onAddToCart(activeId);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  const tabs = [
    { key: "desc", label: descriptionTabLabel },
    { key: "details", label: detailsTabLabel },
  ];

  return (
    <div
      className={`${dmSans.variable} ${dmSerif.variable} flex min-h-screen w-full items-center justify-center p-4 [font-family:var(--font-dm-sans)] md:p-10 ${backgroundColor}`}
    >
      <div
        className={`relative w-full max-w-5xl overflow-hidden rounded-sm text-white ${cardColor}`}
      >
        <div
          className="absolute inset-x-0 top-0 z-10 h-0.5 transition-colors duration-500"
          style={{ backgroundColor: active.hex }}
        />

        <div className="flex flex-col md:min-h-[560px] md:flex-row">
          <div
            className={`relative flex min-h-[26rem] items-center justify-center overflow-hidden py-12 md:w-5/12 ${panelColor}`}
          >

            {showBadge ? (
              <span className="absolute left-5 top-5 rounded-sm border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/50">
                {badgeText}
              </span>
            ) : null}

            <div ref={imageRef} className="relative w-full max-w-sm px-6 md:max-w-md">
              <img
                src={active.image}
                alt={active.label}
                className="h-[300px] w-full object-cover object-center"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex border-t border-white/5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVariant(v)}
                  title={v.label}
                  aria-label={v.label}
                  className={`h-1.5 flex-1 transition-opacity duration-200 hover:opacity-100 ${activeId === v.id ? "opacity-100" : "opacity-35"
                    }`}
                  style={{ backgroundColor: v.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between border-white/[0.06] p-6 md:w-7/12 md:border-l md:p-10">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-widest text-white/30">
                {category}
              </p>

              <h2 className="mb-1 text-4xl font-normal leading-tight text-white [font-family:var(--font-dm-serif)] md:text-5xl">
                {productName}
              </h2>

              <p
                className="mb-8 text-base italic transition-colors duration-300 [font-family:var(--font-dm-serif)]"
                style={{ color: active.hex }}
              >
                {active.label}
              </p>

              <div className="mb-7 h-px bg-white/[0.07]" />

              <div className="mb-5 flex gap-7">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`border-b pb-1 text-xs font-medium uppercase tracking-widest transition-all duration-200 ${tab === key
                        ? "border-white text-white"
                        : "border-transparent text-white/30 hover:text-white/60"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div ref={tabRef} className="min-h-20">
                {tab === "desc" ? (
                  <p className="text-sm font-light leading-relaxed text-white/45">
                    {description}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-px bg-white/[0.06] sm:grid-cols-4">
                    {dimensions.map((d) => (
                      <div
                        key={d.label}
                        className={`px-3 py-3 text-center ${cardColor}`}
                      >
                        <p className="text-xl font-normal leading-none text-white [font-family:var(--font-dm-serif)]">
                          {d.value}
                          <span className="ml-0.5 text-xs text-white/30">
                            {d.unit}
                          </span>
                        </p>
                        <p className="mt-1.5 text-xs uppercase tracking-widest text-white/25">
                          {d.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-8 flex gap-2.5">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => selectVariant(v)}
                    title={v.label}
                    aria-label={v.label}
                    className={`h-4 w-4 rounded-full transition-transform duration-200 hover:scale-110 ${activeId === v.id
                        ? "scale-[1.2] ring-1 ring-[color:var(--c)] ring-offset-2 ring-offset-neutral-950"
                        : ""
                      }`}
                    style={{ backgroundColor: v.hex, "--c": v.hex }}
                  />
                ))}
              </div>

              <div className="mb-5 flex items-baseline gap-3">
                <span className="text-4xl font-normal leading-none text-white [font-family:var(--font-dm-serif)]">
                  {currency}
                  {price}
                </span>
                {discount ? (
                  <span className="text-sm font-light text-white/25 line-through">
                    {currency}
                    {originalPrice}
                  </span>
                ) : null}
                {discount ? (
                  <span
                    className="rounded-sm border px-2 py-0.5 text-xs font-medium uppercase tracking-widest transition-colors duration-300"
                    style={{ color: active.hex, borderColor: `${active.hex}55` }}
                  >
                    -{discount}%
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleCart}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-sm text-xs font-medium uppercase tracking-widest transition duration-200 hover:-translate-y-px active:translate-y-0"
                style={{
                  backgroundColor: added ? "#ffffff" : active.hex,
                  color: added ? "#000000" : "#ffffff",
                }}
              >
                {added ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : null}
                {added ? addedLabel : cartLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}