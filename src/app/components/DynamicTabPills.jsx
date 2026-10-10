"use client";

import { useState, useEffect } from "react";

// ─── DynamicTabPills ─────────────────────────────────────────────────────────
//
// Props
// ────────────────────────────────────────────────────────────────────────────
// initialItems       array     ["Playlists", "Artists", "Albums", "Podcasts", "Downloaded"]
// initialActive      array     [0, 1, 3] (Indices to activate on mount sequence)
// baseFontSize       string    "14px"    Configurable scale matrix
// activeBg           string    "#3a3d42" Background fill color for selected pills
// activeBorder       string    "#6a6d72" Boundary border line for active components
// idleBorder         string    "#2a2d32" Boundary border line for unselected elements
// hoverBorder        string    "#3a3d42" Interactive edge preview lines
// separatorColor     string    "#6a6d72" Inter-pill separator line fill color
// textColor          string    "#9598a7" Global inactive component base font tracking color
// ────────────────────────────────────────────────────────────────────────────

export default function DynamicTabPills({
  initialItems = ["Playlists", "Artists", "Albums", "Podcasts", "Downloaded"],
  initialActive = [0, 1, 3],
  baseFontSize = "14px",
  activeBg = "rgb(58, 61, 66)",
  activeBorder = "rgb(106, 109, 114)",
  idleBorder = "rgb(42, 45, 50)",
  hoverBorder = "rgb(58, 61, 66)",
  separatorColor = "rgb(106, 109, 114)",
  textColor = "rgb(149, 152, 167)",
}) {
  const [activeTabs, setActiveTabs] = useState(initialActive);
  const [isMounted, setIsMounted] = useState(false);

  // Clear hydration shifts for consistent server/client layouts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Handler execution framework for multi-selectable toggles
  const handleToggle = (index) => {
    setActiveTabs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div
      style={{
        color: textColor,
        "--font-size-base": baseFontSize,
      }}
      className="relative w-full min-h-screen flex items-center justify-center bg-[#1d1e22] font-sans box-border select-none"
    >
      {/* ── Tabs Cluster Wrapper Container ──────────────────────────────────── */}
      <div className="w-full text-center whitespace-nowrap px-4 overflow-x-auto py-4">
        {initialItems.map((item, idx) => {
          const isActive = activeTabs.includes(idx);
          const hasActiveLeftSibling =
            isActive && idx > 0 && activeTabs.includes(idx - 1);

          // Calculate layout primitives dynamically to completely avoid mixed shorthand/directional re-render warnings
          const calculatedBorderColor = isActive ? activeBorder : idleBorder;
          const currentMarginLeft = hasActiveLeftSibling
            ? "calc(var(--font-size-base) * -2)"
            : "calc(var(--font-size-base) * 0.25)";

          const currentPaddingLeft = hasActiveLeftSibling
            ? "1.6em"
            : "calc(var(--font-size-base) * 1.6)";

          return (
            <button
              key={`tab-pill-${idx}`}
              onClick={() => handleToggle(idx)}
              style={{
                fontSize: "var(--font-size-base)",
                backgroundColor: isActive ? activeBg : "transparent",

                // Explicitly defining unique directional targets to guarantee reconciliation speed
                borderTopColor: calculatedBorderColor,
                borderRightColor: calculatedBorderColor,
                borderBottomColor: calculatedBorderColor,
                borderLeftColor: hasActiveLeftSibling
                  ? "transparent"
                  : calculatedBorderColor,

                marginTop: "0px",
                marginBottom: "0px",
                marginRight: "calc(var(--font-size-base) * 0.25)",
                marginLeft: currentMarginLeft,

                paddingTop: "calc(var(--font-size-base) * 0.8)",
                paddingBottom: "calc(var(--font-size-base) * 0.8)",
                paddingRight: "calc(var(--font-size-base) * 1.6)",
                paddingLeft: currentPaddingLeft,

                borderRadius: hasActiveLeftSibling
                  ? "0px 20px 20px 0px"
                  : "20px",
              }}
              className={`
                relative z-10 inline-block border border-solid cursor-pointer appearance-none transition-all duration-200 ease-out outline-none
                
                /* Custom Media Queries matching original responsive properties */
                max-[600px]:[!--font-size-base:10px]

                /* Interactive Hover Configuration */
                hover:not(:disabled):border-t-[var(--hover-border-override,${hoverBorder})]
                hover:not(:disabled):border-r-[var(--hover-border-override,${hoverBorder})]
                hover:not(:disabled):border-b-[var(--hover-border-override,${hoverBorder})]
                hover:not(:disabled):border-l-[var(--hover-border-override,${hoverBorder})]

                /* Before line element pseudo-selector recreating the original scaling inner loop separator */
                before:content-[""] before:absolute before:h-full before:top-0 before:w-px
                before:left-[calc(var(--font-size-base)*0.7)]
                before:bg-[var(--sep-color,${separatorColor})]
                before:scale-y-0 before:transition-transform before:duration-200 before:ease-in-out
                
                /* Triggering scale matrix manually if sibling conditions pass */
                ${hasActiveLeftSibling ? "before:scale-y-100" : "before:scale-y-0"}
              `}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* ── Authorship Credits Section ──────────────────────────────────────── */}
      <div className="fixed z-10 bottom-5 left-5 text-current text-left">
        <a
          href="https://linktr.ee/supahfunk"
          target="_blank"
          rel="noreferrer"
          className="no-underline text-current group"
        >
          <h1 className="m-0 mt-[-2px] p-0 text-[10px] font-normal tracking-wide text-zinc-500 group-hover:text-zinc-300 transition-colors">
            Fabio Ottaviani
          </h1>
          <h2 className="m-0 my-[-1px] text-[14.1px] font-normal tracking-tight text-zinc-400 group-hover:text-white transition-colors">
            Supahfunk
          </h2>
        </a>
      </div>
    </div>
  );
}
