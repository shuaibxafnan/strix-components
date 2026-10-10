"use client";

import { useEffect, useState } from "react";

// ─── StepProgress ────────────────────────────────────────────────────────────
//
// A horizontal step indicator: a track with circular nodes (icon + caption) that
// light up as you advance, a fill bar that grows between them, and Prev/Next
// buttons that clamp at the ends. Ported from a vanilla JS CodePen — the DOM
// class-toggling is replaced by React state, so there's no imperative updating.
//
// Runtime/prop-driven values (colors + sizes) are exposed as CSS variables on the
// root and consumed through Tailwind arbitrary values; the only inline style that
// truly changes at runtime is the fill width. Font Awesome is optional and
// injected as a stylesheet so the default spooky icons work out of the box.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// steps             array    (4 demo)  [{ icon, caption }]. `icon` is a Font
//                                       Awesome class string OR a React node.
// initialStep       number   1         1-based starting step (clamped to range).
// accentColor       string   #b036e0   Active node + fill + button color.
// trackColor        string   #c4c1c1   Inactive node + track + disabled button.
// bgColor           string   #eeeeee   Page background.
// width             number   350       Track width in px (max 100%).
// circleSize        number   10        Node diameter in px.
// borderWidth       number   3         Node border thickness in px.
// lineThickness     number   4         Track/fill height in px.
// iconSize          number   25        Icon font size in px.
// prevLabel         string   Prev      Previous button text.
// nextLabel         string   Next      Next button text.
// loadFontAwesome   boolean  true      Inject the Font Awesome stylesheet.
// onChange          fn       —         Called with the new 1-based step on change.
// className         string   ""        Extra classes on the root element.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_STEPS = [
  { icon: "fa-solid fa-ghost", caption: "ghost" },
  { icon: "fa-solid fa-cat", caption: "cat" },
  { icon: "fa-solid fa-spider", caption: "spider" },
  { icon: "fa-solid fa-skull", caption: "skull" },
];

const FA_HREF =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css";

export default function ProgressTimeline({
  steps = DEFAULT_STEPS,
  initialStep = 1,
  accentColor = "#b036e0",
  trackColor = "#c4c1c1",
  bgColor = "#eeeeee",
  width = 350,
  circleSize = 10,
  borderWidth = 3,
  lineThickness = 4,
  iconSize = 25,
  prevLabel = "Prev",
  nextLabel = "Next",
  loadFontAwesome = true,
  onChange,
  className = "",
}) {
  const total = steps.length;

  // 1-based active step, clamped into [1, total]. Deterministic on server and
  // client → no hydration mismatch.
  const [active, setActive] = useState(() =>
    Math.min(Math.max(initialStep, 1), total),
  );

  // Inject the Font Awesome stylesheet once (client only), if requested.
  useEffect(() => {
    if (!loadFontAwesome) return;
    if (document.querySelector('link[data-id="' + FA_HREF + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FA_HREF;
    link.setAttribute("data-id", FA_HREF);
    document.head.appendChild(link);
  }, [loadFontAwesome]);

  const goTo = (next) => {
    const clamped = Math.min(Math.max(next, 1), total);
    setActive(clamped);
    if (onChange) onChange(clamped);
  };

  // Fill percentage between the first and last node — the one genuinely
  // runtime value that can't live in a class.
  const fillPct = total > 1 ? ((active - 1) / (total - 1)) * 100 : 0;

  // CSS variables drive every prop-tweakable color/size; Tailwind reads them via
  // arbitrary values so the markup stays declarative.
  const rootVars = {
    "--sp-accent": accentColor,
    "--sp-track": trackColor,
    "--sp-circle": circleSize + "px",
    "--sp-border": borderWidth + "px",
    "--sp-line": lineThickness + "px",
    "--sp-icon": iconSize + "px",
    backgroundColor: bgColor,
  };

  const renderIcon = (icon) =>
    typeof icon === "string" ? <i className={"icon " + icon} /> : icon;

  return (
    <div
      style={rootVars}
      className={
        "flex items-center justify-center w-full min-h-screen [font-family:Poppins,sans-serif] " +
        className
      }
    >
      <div className="text-center">
        {/* Track + nodes */}
        <div
          className="relative flex justify-between mb-[60px] max-w-full"
          style={{ width: width + "px" }}
        >
          {/* Grey track behind everything */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[var(--sp-line)] w-full z-0 bg-[var(--sp-track)]" />

          {/* Accent fill — width is the live value */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-[var(--sp-line)] z-0 bg-[var(--sp-accent)] transition-all duration-[400ms] ease-in-out"
            style={{ width: fillPct + "%" }}
          />

          {/* Circles */}
          {steps.map((step, idx) => {
            const isActive = idx < active; // nodes up to & including current
            return (
              <div
                key={idx}
                className={
                  "relative z-10 flex items-center justify-center rounded-full " +
                  "h-[var(--sp-circle)] w-[var(--sp-circle)] " +
                  "border-[length:var(--sp-border)] transition-all duration-[400ms] ease-in-out " +
                  (isActive
                    ? "border-[color:var(--sp-accent)] text-[color:var(--sp-accent)] bg-white scale-110"
                    : "border-[color:var(--sp-track)] text-[color:var(--sp-track)] bg-[var(--sp-track)]")
                }
              >
                <span className="absolute bottom-[25px] text-[length:var(--sp-icon)] leading-none">
                  {renderIcon(step.icon)}
                </span>
                {step.caption ? (
                  <span className="absolute -bottom-[30px] text-sm font-extrabold whitespace-nowrap">
                    {step.caption}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 1}
          className="rounded-[20px] cursor-pointer px-[30px] py-[8px] m-[5px] text-white text-[inherit] [font-family:inherit] bg-[var(--sp-accent)] active:scale-90 focus:outline-none disabled:bg-[var(--sp-track)] disabled:cursor-not-allowed"
        >
          {prevLabel}
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === total}
          className="rounded-[20px] cursor-pointer px-[30px] py-[8px] m-[5px] text-white text-[inherit] [font-family:inherit] bg-[var(--sp-accent)] active:scale-90 focus:outline-none disabled:bg-[var(--sp-track)] disabled:cursor-not-allowed"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
