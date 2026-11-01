"use client";

import { useState, useEffect } from "react";

export default function DynamicTabPills({
  items = ["Playlists", "Artists", "Albums", "Podcasts", "Downloaded"],
  initialActive = [0, 1, 3],
  baseFontSize = "14px",
  backgroundColor = "#1d1e22",
  activeBg = "rgb(58, 61, 66)",
  activeBorder = "rgb(106, 109, 114)",
  idleBorder = "rgb(42, 45, 50)",
  hoverBorder = "rgb(58, 61, 66)",
  separatorColor = "rgb(106, 109, 114)",
  textColor = "rgb(149, 152, 167)",
  className = "",
}) {
  const [activeTabs, setActiveTabs] = useState(initialActive);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleToggle = (index) => {
    setActiveTabs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div
      style={{
        color: textColor,
        backgroundColor,
        "--font-size-base": baseFontSize,
        "--hover-border-override": hoverBorder,
        "--sep-color": separatorColor,
      }}
      className={`relative w-full h-screen flex items-center justify-center font-sans box-border select-none ${className}`}
    >
      <div className="w-full text-center whitespace-nowrap px-4 overflow-x-auto py-4">
        {items.map((item, idx) => {
          const isActive = activeTabs.includes(idx);
          const hasActiveLeftSibling =
            isActive && idx > 0 && activeTabs.includes(idx - 1);

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
              className={`relative z-10 inline-block border border-solid cursor-pointer appearance-none transition-all duration-200 ease-out outline-none max-[600px]:[--font-size-base:10px] hover:border-t-[var(--hover-border-override)] hover:border-r-[var(--hover-border-override)] hover:border-b-[var(--hover-border-override)] hover:border-l-[var(--hover-border-override)] before:content-[''] before:absolute before:h-full before:top-0 before:w-px before:left-[calc(var(--font-size-base)*0.7)] before:bg-[var(--sep-color)] before:transition-transform before:duration-200 before:ease-in-out ${hasActiveLeftSibling ? "before:scale-y-100" : "before:scale-y-0"}`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
