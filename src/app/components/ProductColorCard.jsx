"use client";

import { useState } from "react";
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

/* ─── data ───────────────────────────────────────────────────────── */

const DEFAULT_VARIANTS = [
  {
    id: "v1",
    label: "Terracotta",
    hex: "#c9685a",
    image: "https://assets.codepen.io/1462889/ch1.png",
    swatch: "https://assets.codepen.io/1462889/mat1.jpg",
  },
  {
    id: "v2",
    label: "Onyx",
    hex: "#3a3a3a",
    image: "https://assets.codepen.io/1462889/ch2.png",
    swatch: "https://assets.codepen.io/1462889/mat2.jpg",
  },
  {
    id: "v3",
    label: "Slate",
    hex: "#6d8fa8",
    image: "https://assets.codepen.io/1462889/ch3.png",
    swatch: "https://assets.codepen.io/1462889/mat3.jpg",
  },
  {
    id: "v4",
    label: "Steel",
    hex: "#7a9dbc",
    image: "https://assets.codepen.io/1462889/ch4.png",
    swatch: "https://assets.codepen.io/1462889/mat4.jpg",
  },
  {
    id: "v5",
    label: "Mocha",
    hex: "#9e8e84",
    image: "https://assets.codepen.io/1462889/ch5.png",
    swatch: "https://assets.codepen.io/1462889/mat5.jpg",
  },
  {
    id: "v6",
    label: "Ash",
    hex: "#959895",
    image: "https://assets.codepen.io/1462889/ch6.png",
    swatch: "https://assets.codepen.io/1462889/mat6.jpg",
  },
];

const DEFAULT_DIMENSIONS = { length: 76, width: 68, height: 87, weight: 10 };

/* ─── component ──────────────────────────────────────────────────── */

export default function ProductColorCard({
  productName = "Sella Gastro",
  category = "Modern Chair",
  price = 174,
  originalPrice = 237,
  currency = "$",
  description = "Solid ash frame, hand-finished. Upholstery and wood tone made to order.",
  dimensions = DEFAULT_DIMENSIONS,
  variants = DEFAULT_VARIANTS,
  defaultVariant = DEFAULT_VARIANTS[0].id,
  onAddToCart = () => {},
  cartLabel = "Add to cart",
  showBadge = false,
  badgeText = "New arrival",
}) {
  const [activeId, setActiveId] = useState(defaultVariant);
  const [tab, setTab] = useState("desc");
  const [animKey, setAnimKey] = useState(0);
  const [added, setAdded] = useState(false);

  const active = variants.find((v) => v.id === activeId) ?? variants[0];
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const dimRows = [
    { full: "Length", value: dimensions.length, unit: "cm" },
    { full: "Width", value: dimensions.width, unit: "cm" },
    { full: "Height", value: dimensions.height, unit: "cm" },
    { full: "Weight", value: dimensions.weight, unit: "kg" },
  ];

  function selectVariant(v) {
    if (v.id === activeId) return;
    setActiveId(v.id);
    setAnimKey((k) => k + 1);
  }

  function handleCart() {
    setAdded(true);
    onAddToCart(activeId);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div
      className={`
      ${dmSans.variable} ${dmSerif.variable}
      [font-family:var(--font-dm-sans)]
      min-h-screen w-full bg-[#0d0d0c]
      flex items-center justify-center p-6 md:p-10
    `}
    >
      <style>{`
        @keyframes pcc-rise {
          from { opacity: 0; transform: translateY(1.125rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pcc-fade-up {
          from { opacity: 0; transform: translateY(0.375rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pcc-rise     { animation: pcc-rise 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .pcc-fade-up  { animation: pcc-fade-up 0.2s ease both; }
        .pcc-dot      { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .pcc-dot:hover { transform: scale(1.15); }
        .pcc-dot-active {
          transform: scale(1.2);
          box-shadow: 0 0 0 2px #111110, 0 0 0 3px currentColor;
        }
        .pcc-strip    { transition: opacity 0.2s ease; }
        .pcc-strip:hover { opacity: 1 !important; }
        .pcc-cta      { transition: background-color 0.25s ease, color 0.25s ease, transform 0.15s ease; }
        .pcc-cta:hover  { transform: translateY(-1px); }
        .pcc-cta:active { transform: translateY(0); }
      `}</style>

      {/* Card */}
      <div className="relative w-full max-w-5xl bg-[#111110] text-white overflow-hidden rounded-sm">
        {/* Top accent rule — colour is runtime active.hex, must stay inline */}
        <div
          className="absolute inset-x-0 top-0 h-0.5 transition-colors duration-500 z-10"
          style={{ backgroundColor: active.hex }}
        />

        <div className="flex flex-col md:flex-row md:min-h-[560px]">
          {/* ── IMAGE PANEL ─────────────────────────────────────── */}
          <div className="relative md:w-5/12 bg-[#191918] flex items-end justify-center overflow-hidden">
            {/* Ghost watermark */}
            <span className="[font-family:var(--font-dm-serif)] pointer-events-none select-none absolute inset-0 flex items-center justify-center text-white opacity-[0.035] font-bold leading-none text-9xl">
              {price}
            </span>

            {showBadge && (
              <span className="absolute top-5 left-5 text-xs font-medium tracking-widest uppercase text-white/50 border border-white/10 px-3 py-1 rounded-sm">
                {badgeText}
              </span>
            )}

            {/* Product image */}
            <div
              key={animKey}
              className="pcc-rise relative w-full max-w-xs px-6"
            >
              <img
                src={active.image}
                alt={active.label}
                className="w-full max-h-96 object-contain object-bottom"
              />
            </div>

            {/* Material strip — swatch backgroundImage is a URL prop, must stay inline */}
            <div className="absolute inset-x-0 bottom-0 flex border-t border-white/5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => selectVariant(v)}
                  title={v.label}
                  className="pcc-strip flex-1 h-1.5 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${v.swatch})`,
                    opacity: activeId === v.id ? 1 : 0.35,
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── INFO PANEL ──────────────────────────────────────── */}
          <div className="md:w-7/12 flex flex-col justify-between p-10 border-l border-white/[0.06]">
            {/* Top section */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-white/30 mb-5">
                {category}
              </p>

              <h2 className="[font-family:var(--font-dm-serif)] text-5xl font-normal leading-tight text-white mb-1">
                {productName}
              </h2>

              {/* Active variant label — colour is runtime active.hex, must stay inline */}
              <p
                className="[font-family:var(--font-dm-serif)] text-base italic mb-8 transition-colors duration-300"
                style={{ color: active.hex }}
              >
                {active.label}
              </p>

              <div className="h-px bg-white/[0.07] mb-7" />

              {/* Tabs */}
              <div className="flex gap-7 mb-5">
                {[
                  { key: "desc", label: "Description" },
                  { key: "details", label: "Details" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={[
                      "text-xs tracking-widest uppercase font-medium pb-1 border-b transition-all duration-200",
                      tab === key
                        ? "text-white border-white"
                        : "text-white/30 border-transparent hover:text-white/60",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab body */}
              <div className="min-h-20">
                {tab === "desc" && (
                  <p
                    key="desc"
                    className="pcc-fade-up text-sm leading-relaxed text-white/45 font-light"
                  >
                    {description}
                  </p>
                )}
                {tab === "details" && (
                  <div
                    key="details"
                    className="pcc-fade-up grid grid-cols-4 gap-px bg-white/[0.06]"
                  >
                    {dimRows.map((d) => (
                      <div
                        key={d.full}
                        className="bg-[#111110] px-3 py-3 text-center"
                      >
                        <p className="[font-family:var(--font-dm-serif)] text-xl font-normal text-white leading-none">
                          {d.value}
                          <span className="text-xs text-white/30 ml-0.5">
                            {d.unit}
                          </span>
                        </p>
                        <p className="text-xs tracking-widest uppercase text-white/25 mt-1.5">
                          {d.full}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom section */}
            <div>
              {/* Swatch dots — swatch backgroundImage + color token are runtime, must stay inline */}
              <div className="flex gap-2.5 mb-8">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVariant(v)}
                    title={v.label}
                    className={`pcc-dot w-4 h-4 rounded-full bg-cover bg-center ${activeId === v.id ? "pcc-dot-active" : ""}`}
                    style={{
                      backgroundImage: `url(${v.swatch})`,
                      color: v.hex, // used by pcc-dot-active box-shadow currentColor
                    }}
                  />
                ))}
              </div>

              {/* Price row */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="[font-family:var(--font-dm-serif)] text-4xl font-normal text-white leading-none">
                  {currency}
                  {price}
                </span>
                {originalPrice > price && (
                  <span className="text-sm text-white/25 line-through font-light">
                    {currency}
                    {originalPrice}
                  </span>
                )}
                {/* Discount badge — border colour is runtime active.hex, must stay inline */}
                {discount && (
                  <span
                    className="text-xs font-medium tracking-widest uppercase px-2 py-0.5 rounded-sm transition-colors duration-300"
                    style={{
                      color: active.hex,
                      border: `1px solid ${active.hex}55`,
                    }}
                  >
                    −{discount}%
                  </span>
                )}
              </div>

              {/* CTA — bg and text colour flip on added state, both are runtime values */}
              <button
                onClick={handleCart}
                className="pcc-cta w-full h-11 text-xs tracking-widest uppercase font-medium rounded-sm"
                style={{
                  backgroundColor: added ? "#ffffff" : active.hex,
                  color: added ? "#111110" : "#ffffff",
                }}
              >
                {added ? "✓  Added" : cartLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
