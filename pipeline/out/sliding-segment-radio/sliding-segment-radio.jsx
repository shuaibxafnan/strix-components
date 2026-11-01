"use client";

import { useEffect, useId, useRef, useState } from "react";

const isLightColor = (color) => {
  const hex = String(color).trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}/.test(full)) return true;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

export default function SlidingSegmentRadio({
  variant = "hop",
  duration = 0.2,
  count = 5,
  match = true,
  wrap = true,
  knockout = "filter",
  initialIndex = 0,
  legend = "Capacity",
  options = ["128GB", "256GB", "512GB", "1TB", "2TB", "4TB", "8TB"],
  backgroundColor = "#000000",
  textColor = "#ffffff",
  accentColor = "#ffffff",
  accentTextColor = "#000000",
  borderColor = "rgba(255,255,255,0.2)",
  hoverColor = "rgba(255,255,255,0.1)",
  className = "",
}) {
  const style = variant === "anchor" ? "anchor" : "hop";
  const uid = useId();
  const containerRef = useRef(null);
  const labelsRef = useRef([]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [previousIndex, setPreviousIndex] = useState(null);

  const [positions, setPositions] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [svgMaskHtml, setSvgMaskHtml] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [resizeTick, setResizeTick] = useState(0);

  const activeOptions = options.slice(
    0,
    Math.max(2, Math.min(count, options.length)),
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const fieldsEl = containerRef.current.querySelector(".fields-wrapper");
    if (!fieldsEl) return;

    const animFrameId = requestAnimationFrame(() => {
      const containerRect = fieldsEl.getBoundingClientRect();
      setContainerDimensions({
        width: fieldsEl.offsetWidth,
        height: fieldsEl.offsetHeight,
      });

      const newPositions = activeOptions.map((_, i) => {
        const label = labelsRef.current[i];
        if (!label) return { width: 0, height: 0, left: 0, top: 0 };
        const rect = label.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
        };
      });

      setPositions(newPositions);

      if (style === "anchor") {
        const maskString = activeOptions
          .map((_, i) => {
            const label = labelsRef.current[i];
            if (!label) return "";
            const rect = label.getBoundingClientRect();
            const x = rect.left - containerRect.left;
            const y = rect.top - containerRect.top;
            return `<rect x="${x}" y="${y}" width="${rect.width}" height="${rect.height}" rx="${rect.height * 0.5}" ry="${rect.height * 0.5}" fill="#000"></rect>`;
          })
          .join("");
        setSvgMaskHtml(maskString);
      }
    });

    return () => cancelAnimationFrame(animFrameId);
  }, [
    currentIndex,
    count,
    style,
    activeOptions.length,
    isMounted,
    resizeTick,
  ]);

  const handleRadioChange = (index) => {
    setPreviousIndex(currentIndex);
    setCurrentIndex(index);
  };

  const currentPillWidth = positions[currentIndex]?.width || 0;
  const previousPillWidth =
    previousIndex !== null ? positions[previousIndex]?.width || 0 : 0;
  const maxPillWidth = Math.max(currentPillWidth, previousPillWidth);

  const activePositionStyle = positions[currentIndex]
    ? {
        left: `${positions[currentIndex].left}px`,
        top: `${positions[currentIndex].top}px`,
        width: `${positions[currentIndex].width}px`,
        height: `${positions[currentIndex].height}px`,
        transitionDuration: `${duration}s`,
        backgroundColor: accentColor,
      }
    : {};

  const encodedSvgMask = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${containerDimensions.width} ${containerDimensions.height}">${svgMaskHtml}</svg>`,
  )
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const svgMaskInlineStyle =
    knockout === "mask" && style === "anchor"
      ? {
          maskImage: `url(data:image/svg+xml;utf8,${encodedSvgMask})`,
          WebkitMaskImage: `url(data:image/svg+xml;utf8,${encodedSvgMask})`,
        }
      : {};

  const knockoutFilter = isLightColor(accentColor) ? "white" : "black";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen flex items-center justify-center p-4 font-mono select-none ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <svg
        className="absolute w-0 h-0 pointer-events-none invisible"
        aria-hidden="true"
      >
        <defs>
          <filter id="knockout-black" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 0 1"
            />
            <feComposite in="SourceGraphic" operator="out" />
          </filter>
          <filter id="knockout-white" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0"
            />
            <feComposite in="SourceGraphic" operator="out" />
          </filter>
        </defs>
      </svg>

      <div className="fields-wrapper relative flex flex-col w-full max-w-[296px]">
        {style === "anchor" && positions[currentIndex] && (
          <div
            className="absolute rounded-full pointer-events-none z-0 transition-all ease-out"
            style={activePositionStyle}
          />
        )}

        <fieldset className="border-0 m-0 p-0 flex flex-wrap gap-2 relative z-10">
          <legend className="text-xs font-light tracking-wider uppercase mb-2 ml-1 opacity-70">
            {legend}
          </legend>

          <div className="flex flex-wrap gap-2">
            {activeOptions.map((option, i) => {
              const isChecked = currentIndex === i;
              const isPrevious = previousIndex === i;

              let hopTranslationClass = "translate-x-0";
              if (style === "hop") {
                if (!isChecked && previousIndex !== null && i < currentIndex) {
                  hopTranslationClass = "translate-x-full";
                }
                if (i > currentIndex) {
                  hopTranslationClass = "-translate-x-full";
                }
              }

              if (style === "hop" && wrap && activeOptions.length >= 3) {
                if (
                  currentIndex === 0 &&
                  i === activeOptions.length - 1 &&
                  previousIndex !== null
                ) {
                  hopTranslationClass = "translate-x-full";
                }
                if (currentIndex === activeOptions.length - 1 && i === 0) {
                  hopTranslationClass = "-translate-x-full";
                }
              }

              const hopInlineStyles =
                style === "hop"
                  ? {
                      width: match ? `${maxPillWidth}px` : "100%",
                      transitionDuration: `${duration}s`,
                      backgroundColor: accentColor,
                    }
                  : {};

              const labelStyle = {
                borderColor,
                "--hover-bg": hoverColor,
              };
              if (style === "hop" && isChecked) {
                labelStyle.color = accentTextColor;
              }

              return (
                <div
                  key={option}
                  className="relative inline-block overflow-hidden rounded-full"
                >
                  <label
                    ref={(el) => {
                      labelsRef.current[i] = el;
                    }}
                    htmlFor={`${uid}-radio-${option}`}
                    style={labelStyle}
                    className={`
                      relative block px-4 py-2 text-sm font-medium border rounded-full cursor-pointer overflow-hidden z-10 transition-colors duration-200
                      hover:bg-[var(--hover-bg)]
                      ${style === "anchor" && isChecked ? "bg-transparent text-transparent pointer-events-none" : ""}
                    `}
                  >
                    <span className="relative z-20">{option}</span>

                    {style === "hop" && (isChecked || isPrevious) && (
                      <span
                        className={`absolute inset-0 rounded-full z-0 transition-transform ease-out ${hopTranslationClass}`}
                        style={hopInlineStyles}
                      />
                    )}
                  </label>

                  <input
                    type="radio"
                    name={`${uid}-capacity-group`}
                    id={`${uid}-radio-${option}`}
                    value={option}
                    checked={isChecked}
                    onChange={() => handleRadioChange(i)}
                    className="absolute opacity-0 scale-0 pointer-events-none"
                    aria-label={option}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        {style === "anchor" && knockout !== "none" && (
          <fieldset
            aria-hidden="true"
            className="absolute inset-0 top-6 m-0 p-0 flex flex-wrap gap-2 pointer-events-none z-20"
            style={{
              filter:
                knockout === "filter"
                  ? `url(#knockout-${knockoutFilter})`
                  : "none",
              ...svgMaskInlineStyle,
            }}
          >
            <legend className="text-xs opacity-0 mb-2 invisible">
              {legend}
            </legend>
            <div
              className="flex flex-wrap gap-2 w-full h-full p-1 rounded-xl"
              style={{ backgroundColor }}
            >
              {activeOptions.map((option) => (
                <label
                  key={`mask-${option}`}
                  className="px-4 py-2 text-sm font-medium border rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                    color: accentTextColor,
                  }}
                >
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
}
