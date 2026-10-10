"use client";

// ─── EmberToggle ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// checked            boolean    false         Controlled checked state
// defaultChecked     boolean    false         Uncontrolled initial state
// onChange           function   undefined     Callback: (checked: boolean) => void
//
// Track
// trackWidth         string     "w-[76px]"    Tailwind width of the track
// trackHeight        string     "h-[38px]"    Tailwind height of the track
// trackRadius        string     "rounded-[6px]" Track border radius
//
// Thumb
// thumbSize          string     "w-[26px] h-[26px]"  Tailwind size of thumb
// thumbActiveWidth   string     "w-[32px]"   Width when pressed (active state)
// thumbRadius        string     "rounded-[4px]"      Thumb border radius
// innerDotSize       string     "w-3 h-3"    Inner dot size
//
// Colors (runtime-dynamic, so style= is used where Tailwind can't help)
// offBorderColor     string     "#3a302a"     Track border color when OFF
// onBorderColor      string     "#b04528"     Track border color when ON
// offThumbBorder     string     "#6a5a4a"     Thumb border color when OFF
// onThumbBorder      string     "#ff7040"     Thumb border color when ON
// onGlowColor        string     "224, 90, 48" RGB values for ON glow (no #)
// labelOffColor      string     "#5a5040"     OFF label color
// labelOnColor       string     "#e05a30"     ON label color
//
// Label
// showLabel          boolean    true          Show the OFF/ON text label
// labelOff           string     "OFF"         Text when toggled off
// labelOn            string     "ON"          Text when toggled on
// labelClassName     string     ""            Extra Tailwind classes on label
//
// Misc
// disabled           boolean    false         Disable interaction
// className          string     ""            Wrapper className override
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useId } from "react";

export default function EmberToggle({
  // State
  checked,
  defaultChecked = false,
  onChange,

  // Track
  trackWidth = "w-[76px]",
  trackHeight = "h-[38px]",
  trackRadius = "rounded-[6px]",

  // Thumb
  thumbSize = "w-[26px] h-[26px]",
  thumbActiveWidth = "w-[32px]",
  thumbRadius = "rounded-[4px]",
  innerDotSize = "w-3 h-3",

  // Colors
  offBorderColor = "#3a302a",
  onBorderColor = "#b04528",
  offThumbBorder = "#6a5a4a",
  onThumbBorder = "#ff7040",
  onGlowColor = "224, 90, 48",
  labelOffColor = "#5a5040",
  labelOnColor = "#e05a30",

  // Label
  showLabel = true,
  labelOff = "OFF",
  labelOn = "ON",
  labelClassName = "",

  // Misc
  disabled = false,
  className = "",
}) {
  const id = useId();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : internalChecked;

  const handleChange = (e) => {
    if (disabled) return;
    const next = e.target.checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  /* ── derived shadow strings (runtime values → style=) ── */
  const thumbOffShadow =
    "0 4px 14px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)";
  const thumbOnShadow = `0 4px 24px rgba(${onGlowColor},0.65), 0 0 35px rgba(${onGlowColor},0.45), 0 0 70px rgba(${onGlowColor},0.25), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)`;
  const thumbOnHoverShadow = `0 6px 28px rgba(${onGlowColor},0.75), 0 0 50px rgba(${onGlowColor},0.55), 0 0 90px rgba(${onGlowColor},0.3), inset 0 1px 0 rgba(255,255,255,0.3)`;
  const trackOffShadow =
    "inset 0 4px 12px rgba(0,0,0,0.5), inset 0 -2px 6px rgba(255,255,255,0.02), 0 4px 16px rgba(0,0,0,0.4)";
  const trackOnShadow = `inset 0 4px 12px rgba(0,0,0,0.5), inset 0 -2px 6px rgba(${onGlowColor},0.08), 0 4px 24px rgba(${onGlowColor},0.25), 0 0 50px rgba(${onGlowColor},0.15)`;

  return (
    <>
      {/* ── Keyframe injector ── */}
      <style>{`
        @keyframes _emberGlow {
          0%,100% {
            box-shadow: 0 0 14px rgba(255,144,96,0.9), 0 0 28px rgba(255,112,64,0.6);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 18px rgba(255,144,96,1), 0 0 36px rgba(255,112,64,0.8), 0 0 54px rgba(255,90,50,0.4);
            transform: scale(1.08);
          }
        }
        @keyframes _glowPulse {
          0%,100% { opacity: 0.7; filter: brightness(1); }
          50%      { opacity: 1;   filter: brightness(1.2); }
        }
        @keyframes _labelGlow {
          0%,100% { text-shadow: 0 0 12px rgba(224,90,48,0.6), 0 0 24px rgba(224,90,48,0.3); }
          50%      { text-shadow: 0 0 16px rgba(224,90,48,0.8), 0 0 32px rgba(224,90,48,0.5); }
        }
      `}</style>

      <label
        htmlFor={id}
        className={[
          "inline-flex items-center gap-4 cursor-pointer select-none relative group",
          disabled && "opacity-50 pointer-events-none",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* ── Hidden input ── */}
        <input
          id={id}
          type="checkbox"
          className="absolute opacity-0 w-0 h-0 peer"
          checked={isOn}
          onChange={handleChange}
          disabled={disabled}
        />

        {/* ── Track ── */}
        <span
          className={[
            "relative flex-shrink-0 overflow-hidden box-border transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]",
            trackWidth,
            trackHeight,
            trackRadius,
            "border-2",
            "group-hover:scale-[1.03]",
          ].join(" ")}
          style={{
            background: isOn
              ? "linear-gradient(160deg,#281815 0%,#140a08 40%,#1c100c 100%)"
              : "linear-gradient(160deg,#1c1c1c 0%,#0a0a0a 40%,#151515 100%)",
            borderColor: isOn ? onBorderColor : offBorderColor,
            boxShadow: isOn ? trackOnShadow : trackOffShadow,
          }}
        >
          {/* Grid texture */}
          <span
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background:
                "repeating-linear-gradient(90deg,transparent 0px,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)",
            }}
          />

          {/* Top sheen */}
          <span
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)",
            }}
          />

          {/* Rust layer */}
          <span
            className="absolute inset-0 pointer-events-none transition-all duration-[600ms]"
            style={{
              background: isOn
                ? `radial-gradient(ellipse at 5% 90%,rgba(179,74,40,0.2) 0%,transparent 35%),
                   radial-gradient(ellipse at 95% 10%,rgba(220,90,45,0.3) 0%,transparent 45%),
                   radial-gradient(ellipse at 80% 50%,rgba(255,120,60,0.15) 0%,transparent 55%)`
                : `radial-gradient(ellipse at 5% 90%,rgba(139,69,19,0.2) 0%,transparent 35%),
                   radial-gradient(ellipse at 95% 10%,rgba(120,60,20,0.15) 0%,transparent 30%),
                   radial-gradient(ellipse at 50% 100%,rgba(100,50,15,0.1) 0%,transparent 40%)`,
            }}
          />

          {/* Ember glow cone */}
          <span
            className="absolute inset-0 pointer-events-none transition-opacity duration-[600ms]"
            style={{
              background: `radial-gradient(ellipse at 78% 50%,rgba(255,100,50,0.3) 0%,transparent 55%)`,
              opacity: isOn ? 1 : 0,
              animation: isOn ? "_glowPulse 2.5s ease-in-out infinite" : "none",
            }}
          />

          {/* Thumb */}
          <span
            className={[
              "absolute top-1 flex items-center justify-center box-border z-[2]",
              "border transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]",
              thumbRadius,
              isOn
                ? thumbActiveWidth.replace("w-", "w-[") +
                  (thumbActiveWidth.includes("[") ? "" : "px]")
                : thumbSize.split(" ")[0],
              thumbSize.split(" ")[1] ?? "h-[26px]",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: isOn ? "calc(100% - 30px)" : "4px",
              background: isOn
                ? "linear-gradient(145deg,#e05a30 0%,#b04020 40%,#d04a28 100%)"
                : "linear-gradient(145deg,#5a5048 0%,#3a3028 40%,#4a4038 100%)",
              borderColor: isOn ? onThumbBorder : offThumbBorder,
              boxShadow: isOn ? thumbOnShadow : thumbOffShadow,
              width: isOn ? "26px" : "26px", // overridden by active below
            }}
          >
            {/* Inner dot */}
            <span
              className={[
                "rounded-full relative transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]",
                innerDotSize,
              ].join(" ")}
              style={{
                background: isOn
                  ? "linear-gradient(145deg,#ff9060 0%,#ff7040 100%)"
                  : "linear-gradient(145deg,#6a5a4a 0%,#4a3a30 100%)",
                boxShadow: isOn
                  ? "0 0 14px rgba(255,144,96,0.9), 0 0 28px rgba(255,112,64,0.6), 0 0 42px rgba(255,90,50,0.3), inset 0 1px 2px rgba(255,255,255,0.4)"
                  : "inset 0 2px 4px rgba(0,0,0,0.4)",
                animation: isOn
                  ? "_emberGlow 1.2s ease-in-out infinite"
                  : "none",
              }}
            />

            {/* Thumb shine */}
            <span
              className={[
                "absolute top-0 left-0 right-0 h-[45%] pointer-events-none",
                thumbRadius,
              ].join(" ")}
              style={{
                background: isOn
                  ? "linear-gradient(180deg,rgba(255,255,255,0.25) 0%,transparent 100%)"
                  : "linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%)",
                borderRadius: "4px 4px 0 0",
              }}
            />
          </span>

          {/* Icons row */}
          <span className="absolute inset-0 flex items-center justify-between px-[11px] pointer-events-none z-[1]">
            {/* Sun — OFF icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]"
              style={{
                color: isOn ? "#3a3028" : "#6a6050",
                opacity: isOn ? 0.15 : 1,
                transform: isOn
                  ? "rotate(180deg) scale(0.8)"
                  : "rotate(0deg) scale(1)",
              }}
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>

            {/* Moon — ON icon */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]"
              style={{
                color: isOn ? "#ff9060" : "#4a3828",
                opacity: isOn ? 1 : 0.35,
                transform: isOn
                  ? "rotate(0deg) scale(1.1)"
                  : "rotate(-20deg) scale(0.9)",
                filter: isOn
                  ? "drop-shadow(0 0 8px rgba(255,144,96,0.7))"
                  : "none",
              }}
            >
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z" />
            </svg>
          </span>
        </span>

        {/* ── Label ── */}
        {showLabel && (
          <span
            className={[
              "relative font-mono text-[0.8rem] font-bold tracking-[3px] uppercase h-6 flex items-center min-w-[32px]",
              labelClassName,
            ].join(" ")}
          >
            <span
              className="absolute transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]"
              style={{
                color: labelOffColor,
                opacity: isOn ? 0 : 1,
                transform: isOn ? "translateY(-10px)" : "translateY(0)",
              }}
            >
              {labelOff}
            </span>
            <span
              className="absolute transition-all duration-[600ms] [cubic-bezier(0.16,1,0.3,1)]"
              style={{
                color: labelOnColor,
                opacity: isOn ? 1 : 0,
                transform: isOn ? "translateY(0)" : "translateY(10px)",
                animation: isOn ? "_labelGlow 2s ease-in-out infinite" : "none",
              }}
            >
              {labelOn}
            </span>
          </span>
        )}
      </label>
    </>
  );
}
