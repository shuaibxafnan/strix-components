"use client";

import { useState } from "react";

// ─── AnimatedCheckbox ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items               {id, label, defaultChecked?}[]   Checkbox list items
// title               string      "Your list"          Section heading
// bgColor             string      "#0e0e0f"            Page background
// cardBg              string      "#161618"            Card background
// borderColor         string      "#2a2a2e"            Card / item borders
// accentColor         string      "#6ee7b7"            Check mark + strike color
// accentDim           string      "#1f3d33"            Checked bg pill
// textColor           string      "#e8e8ea"            Primary text
// textDimColor        string      "#4a4a52"            Struck-through text
// animDuration        string      "0.55s"              Strike animation duration
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { id: "a", label: "Apples", defaultChecked: true },
  { id: "b", label: "Bananas", defaultChecked: false },
  { id: "c", label: "Cherries", defaultChecked: false },
  { id: "d", label: "Oranges", defaultChecked: false },
  { id: "e", label: "Mangoes", defaultChecked: false },
];

export default function AnimatedCheckbox({
  items = DEFAULT_ITEMS,
  title = "Your list",
  bgColor = "#0e0e0f",
  cardBg = "#161618",
  borderColor = "#2a2a2e",
  accentColor = "#6ee7b7",
  accentDim = "#1a3028",
  textColor = "#e8e8ea",
  textDimColor = "#6a7a72",
  animDuration = "0.55s",
}) {
  // Map of id → { checked, pristine }
  const [state, setState] = useState(() =>
    Object.fromEntries(
      items.map((item) => [
        item.id,
        { checked: !!item.defaultChecked, pristine: true },
      ]),
    ),
  );

  const toggle = (id) => {
    setState((prev) => ({
      ...prev,
      [id]: { checked: !prev[id].checked, pristine: false },
    }));
  };

  const checkedCount = Object.values(state).filter((s) => s.checked).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

        /* ── Strike animation ── */
        @keyframes acb-strike {
          from {
            clip-path: inset(0 100% 0 0);
            opacity: 1;
          }
          to {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
        }
        @keyframes acb-unstrike {
          from {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
          60% {
            clip-path: inset(0 0% 0 0);
            opacity: 0.6;
          }
          to {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
          }
        }
        @keyframes acb-check-pop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.25) rotate(4deg); opacity: 1; }
          80%  { transform: scale(0.9) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes acb-check-out {
          0%   { transform: scale(1); opacity: 1; }
          40%  { transform: scale(1.15); opacity: 0.6; }
          100% { transform: scale(0) rotate(8deg); opacity: 0; }
        }
        @keyframes acb-label-dim {
          from { opacity: 1; }
          to   { opacity: 0.35; }
        }
        @keyframes acb-label-brighten {
          from { opacity: 0.35; }
          to   { opacity: 1; }
        }
        @keyframes acb-row-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .acb-row {
          animation: acb-row-in 0.4s ease both;
        }

        /* strike line */
        .acb-strike-line {
          pointer-events: none;
          position: absolute;
          left: 0; right: 0;
          top: 50%;
          height: 1.5px;
          transform: translateY(-50%);
          background: currentColor;
          border-radius: 2px;
          clip-path: inset(0 100% 0 0);
          opacity: 0;
        }
        .acb-strike-line.striking {
          animation: acb-strike var(--acb-dur) cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .acb-strike-line.unstriking {
          animation: acb-unstrike var(--acb-dur) cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .acb-strike-line.struck {
          clip-path: inset(0 0% 0 0);
          opacity: 1;
        }

        /* check mark */
        .acb-check-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0);
        }
        .acb-check-icon.checking {
          animation: acb-check-pop var(--acb-dur) cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .acb-check-icon.unchecking {
          animation: acb-check-out calc(var(--acb-dur) * 0.6) ease both;
        }
        .acb-check-icon.checked {
          opacity: 1;
          transform: scale(1);
        }

        /* label */
        .acb-label-text.dimming {
          animation: acb-label-dim var(--acb-dur) ease both;
        }
        .acb-label-text.brightening {
          animation: acb-label-brighten calc(var(--acb-dur) * 0.5) ease both;
        }
      `}</style>

      <div
        className="min-h-screen w-full flex items-center justify-center p-6"
        style={{ background: bgColor, fontFamily: "'Outfit', sans-serif" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            className="px-6 pt-6 pb-5 flex items-end justify-between"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-1.5 font-medium"
                style={{ color: accentColor, opacity: 0.7 }}
              >
                Checklist
              </p>
              <h1
                className="text-xl font-semibold leading-none"
                style={{ color: textColor }}
              >
                {title}
              </h1>
            </div>
            {/* progress pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium tabular-nums"
              style={{
                background:
                  checkedCount === items.length ? accentDim : `${borderColor}`,
                color:
                  checkedCount === items.length ? accentColor : textDimColor,
                border: `1px solid ${checkedCount === items.length ? accentColor + "30" : borderColor}`,
                transition: "all 0.3s ease",
              }}
            >
              <span>{checkedCount}</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span>{items.length}</span>
            </div>
          </div>

          {/* Items */}
          <ul className="px-2 py-2">
            {items.map((item, idx) => {
              const s = state[item.id];
              return (
                <li
                  key={item.id}
                  className="acb-row mb-1.5 last:mb-0"
                  style={{
                    animationDelay: `${idx * 60}ms`,
                    "--acb-dur": animDuration,
                  }}
                >
                  <label
                    className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl cursor-pointer group select-none"
                    style={{
                      background: s.checked ? `${accentDim}` : "transparent",
                      border: `1px solid ${s.checked ? accentColor + "18" : "transparent"}`,
                      transition:
                        "background 0.3s ease, border-color 0.3s ease",
                    }}
                  >
                    {/* Hidden native checkbox */}
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={s.checked}
                      onChange={() => toggle(item.id)}
                    />

                    {/* Custom checkbox box */}
                    <div
                      className="relative flex-shrink-0 rounded-lg"
                      style={{
                        width: 22,
                        height: 22,
                        background: s.checked ? accentDim : `${borderColor}80`,
                        border: `1.5px solid ${s.checked ? accentColor + "60" : borderColor}`,
                        transition:
                          "background 0.25s ease, border-color 0.25s ease",
                      }}
                    >
                      {/* Check mark SVG */}
                      <span
                        className={`acb-check-icon ${
                          s.pristine
                            ? s.checked
                              ? "checked"
                              : ""
                            : s.checked
                              ? "checking"
                              : "unchecking"
                        }`}
                        style={{
                          color: accentColor,
                          "--acb-dur": animDuration,
                        }}
                      >
                        <svg
                          width="12"
                          height="9"
                          viewBox="0 0 12 9"
                          fill="none"
                        >
                          <path
                            d="M1 4L4.5 7.5L11 1"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>

                    {/* Label with animated strike-through */}
                    <span
                      className="relative flex-1 text-sm font-medium leading-none"
                      style={{ "--acb-dur": animDuration }}
                    >
                      {/* Label text */}
                      <span
                        className={`acb-label-text relative z-10 ${
                          s.pristine
                            ? ""
                            : s.checked
                              ? "dimming"
                              : "brightening"
                        }`}
                        style={{
                          color: s.checked ? textDimColor : textColor,
                          display: "block",
                          transition: s.pristine ? "none" : undefined,
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Strike line overlay */}
                      <span
                        className={`acb-strike-line ${
                          s.pristine
                            ? s.checked
                              ? "struck"
                              : ""
                            : s.checked
                              ? "striking"
                              : "unstriking"
                        }`}
                        style={{
                          color: s.checked ? accentColor : textDimColor,
                          "--acb-dur": animDuration,
                        }}
                      />
                    </span>

                    {/* Trailing counter index */}
                    <span
                      className="text-[10px] font-semibold tabular-nums"
                      style={{
                        color: s.checked ? accentColor : textDimColor,
                        opacity: s.checked ? 0.6 : 0.3,
                        transition: "color 0.3s ease, opacity 0.3s ease",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <button
              onClick={() =>
                setState(
                  Object.fromEntries(
                    items.map((it) => [
                      it.id,
                      { checked: false, pristine: false },
                    ]),
                  ),
                )
              }
              className="text-[11px] font-medium tracking-wide transition-opacity duration-150 hover:opacity-100"
              style={{ color: textDimColor, opacity: 0.5 }}
            >
              Clear all
            </button>
            <button
              onClick={() =>
                setState(
                  Object.fromEntries(
                    items.map((it) => [
                      it.id,
                      { checked: true, pristine: false },
                    ]),
                  ),
                )
              }
              className="text-[11px] font-medium tracking-wide transition-opacity duration-150 hover:opacity-100"
              style={{ color: accentColor, opacity: 0.6 }}
            >
              Check all
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
