"use client";

import { useRef, useState } from "react";

const DEFAULT_CARDS = [
  {
    id: 1,
    title: "Sign Language",
    description:
      "Real-time interpretation pipelines built for accessibility at scale. Breaking barriers one gesture at a time.",
    svgViewBox: "0 0 640 512",
    svgPath:
      "M290.547 189.039c-20.295-10.149-44.147-11.199-64.739-3.89 42.606 0 71.208 20.475 85.578 50.576 8.576 17.899-5.148 38.071-23.617 38.071 18.429 0 32.211 20.136 23.617 38.071-14.725 30.846-46.123 50.854-80.298 50.854-.557 0-94.471-8.615-94.471-8.615l-66.406 33.347c-9.384 4.693-19.815.379-23.895-7.781L1.86 290.747c-4.167-8.615-1.111-18.897 6.946-23.621l58.072-33.069L108 159.861c6.39-57.245 34.731-109.767 79.743-146.726 11.391-9.448 28.341-7.781 37.51 3.613 9.446 11.394 7.78 28.067-3.612 37.516-12.503 10.559-23.618 22.509-32.509 35.57 21.672-14.729 46.679-24.732 74.186-28.067 14.725-1.945 28.063 8.336 29.73 23.065 1.945 14.728-8.336 28.067-23.062 29.734-16.116 1.945-31.12 7.503-44.178 15.284 26.114-5.713 58.712-3.138 88.079 11.115 13.336 6.669 18.893 22.509 12.224 35.848-6.389 13.06-22.504 18.617-35.564 12.226zm-27.229 69.472c-6.112-12.505-18.338-20.286-32.231-20.286a35.46 35.46 0 0 0-35.565 35.57c0 21.428 17.808 35.57 35.565 35.57 13.893 0 26.119-7.781 32.231-20.286 4.446-9.449 13.614-15.006 23.339-15.284-9.725-.277-18.893-5.835-23.339-15.284zm374.821-37.237c4.168 8.615 1.111 18.897-6.946 23.621l-58.071 33.069L532 352.16c-6.39 57.245-34.731 109.767-79.743 146.726-10.932 9.112-27.799 8.144-37.51-3.613-9.446-11.394-7.78-28.067 3.613-37.516 12.503-10.559 23.617-22.509 32.508-35.57-21.672 14.729-46.679 24.732-74.186 28.067-10.021 2.506-27.552-5.643-29.73-23.065-1.945-14.728 8.336-28.067 23.062-29.734 16.116-1.946 31.12-7.503 44.178-15.284-26.114 5.713-58.712 3.138-88.079-11.115-13.336-6.669-18.893-22.509-12.224-35.848 6.389-13.061 22.505-18.619 35.565-12.227 20.295 10.149 44.147 11.199 64.739 3.89-42.606 0-71.208-20.475-85.578-50.576-8.576-17.899 5.148-38.071 23.617-38.071-18.429 0-32.211-20.136-23.617-38.071 14.033-29.396 44.039-50.887 81.966-50.854l92.803 8.615 66.406-33.347c9.408-4.704 19.828-.354 23.894 7.781l44.455 88.926zm-229.227-18.618c-13.893 0-26.119 7.781-32.231 20.286-4.446 9.449-13.614 15.006-23.339 15.284 9.725.278 18.893 5.836 23.339 15.284 6.112 12.505 18.338 20.286 32.231 20.286a35.46 35.46 0 0 0 35.565-35.57c0-21.429-17.808-35.57-35.565-35.57z",
  },
  {
    id: 2,
    title: "Navigation Architecture",
    description:
      "Anchor your product with deep-linked routing and seamless multi-surface navigation architectures.",
    svgViewBox: "0 0 576 512",
    svgPath:
      "M12.971 352h32.394C67.172 454.735 181.944 512 288 512c106.229 0 220.853-57.38 242.635-160h32.394c10.691 0 16.045-12.926 8.485-20.485l-67.029-67.029c-4.686-4.686-12.284-4.686-16.971 0l-67.029 67.029c-7.56 7.56-2.206 20.485 8.485 20.485h35.146c-20.29 54.317-84.963 86.588-144.117 94.015V256h52c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-52v-5.47c37.281-13.178 63.995-48.725 64-90.518C384.005 43.772 341.605.738 289.37.01 235.723-.739 192 42.525 192 96c0 41.798 26.716 77.35 64 90.53V192h-52c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h52v190.015c-58.936-7.399-123.82-39.679-144.117-94.015h35.146c10.691 0 16.045-12.926 8.485-20.485l-67.029-67.029c-4.686-4.686-12.284-4.686-16.971 0L4.485 331.515C-3.074 339.074 2.28 352 12.971 352zM288 64c17.645 0 32 14.355 32 32s-14.355 32-32 32-32-14.355-32-32 14.355-32 32-32z",
  },
  {
    id: 3,
    title: "Global Monetisation",
    description:
      "Stacked revenue streams, granular analytics, and payout infrastructure ready to scale globally.",
    svgViewBox: "0 0 512 512",
    svgPath:
      "M0 405.3V448c0 35.3 86 64 192 64s192-28.7 192-64v-42.7C342.7 434.4 267.2 448 192 448S41.3 434.4 0 405.3zM320 128c106 0 192-28.7 192-64S426 0 320 0 128 28.7 128 64s86 64 192 64zM0 300.4V352c0 35.3 86 64 192 64s192-28.7 192-64v-51.6c-41.3 34-116.9 51.6-192 51.6S41.3 334.4 0 300.4zm416 11c57.3-11.1 96-31.7 96-55.4v-42.7c-23.2 16.4-57.3 27.6-96 34.5v63.6zM192 160C86 160 0 195.8 0 240s86 80 192 80 192-35.8 192-80-86-80-192-80zm219.3 56.3c60-10.8 100.7-32 100.7-56.3v-42.7c-35.5 25.1-96.5 38.6-160.7 41.8 29.5 14.3 51.2 33.5 60 57.2z",
  },
  {
    id: 4,
    title: "Optimised Toolchain",
    description:
      "From scaffolding to CI, a precision build system that keeps your workflow sharp and your deploys clean.",
    svgViewBox: "0 0 576 512",
    svgPath:
      "M571.31 193.94l-22.63-22.63c-6.25-6.25-16.38-6.25-22.63 0l-11.31 11.31-28.9-28.9c5.63-21.31.36-44.9-16.35-61.61l-45.25-45.25c-62.48-62.48-163.79-62.48-226.28 0l90.51 45.25v18.75c0 16.97 6.74 33.25 18.75 45.25l49.14 49.14c16.71 16.71 40.3 21.98 61.61 16.35l28.9 28.9-11.31 11.31c-6.25 6.25-6.25 16.38 0 22.63l22.63 22.63c6.25 6.25 16.38 6.25 22.63 0l90.51-90.51c6.23-6.24 6.23-16.37-.02-22.62zm-286.72-15.2c-3.7-3.7-6.84-7.79-9.85-11.95L19.64 404.96c-25.57 23.88-26.26 64.19-1.53 88.93s65.05 24.05 88.93-1.53l238.13-255.07c-3.96-2.91-7.9-5.87-11.44-9.41l-49.14-49.14z",
  },
  {
    id: 5,
    title: "Hyper Performance",
    description:
      "Sub-millisecond edge compute, solar-grade optimisation, and zero-compromise load times baked in.",
    svgViewBox: "0 0 512 512",
    svgPath:
      "M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z",
  },
  {
    id: 6,
    title: "Deep Research",
    description:
      "Microscopic precision meets macro ambition. Deep-dive analysis pipelines for data-first teams.",
    svgViewBox: "0 0 512 512",
    svgPath:
      "M160 320h12v16c0 8.84 7.16 16 16 16h40c8.84 0 16-7.16 16-16v-16h12c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32V16c0-8.84-7.16-16-16-16h-64c-8.84 0-16 7.16-16 16v16c-17.67 0-32 14.33-32 32v224c0 17.67 14.33 32 32 32zm304 128h-1.29C493.24 413.99 512 369.2 512 320c0-105.88-86.12-192-192-192v64c70.58 0 128 57.42 128 128s-57.42 128-128 128H48c-26.51 0-48 21.49-48 48 0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48zm-360-32h208c4.42 0 8-3.58 8-8v-16c0-4.42-3.58-8-8-8H104c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8z",
  },
];

function Card({
  card,
  index,
  isFeatured,
  onClick,
  onClose,
  accentColor,
  accentColorRgb,
  cardBg,
  cardBorder,
  featuredBg,
  iconColor,
  iconColorHover,
  iconFeaturedColor,
  titleColor,
  textColor,
  hoverTranslateY,
  transitionDuration,
  activeLabel,
  exploreLabel,
  closeLabel,
  detailsLabel,
}) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    background: isFeatured ? featuredBg : cardBg,
    borderColor: isFeatured
      ? `${accentColor}55`
      : hovered
        ? `${accentColor}30`
        : cardBorder,
    boxShadow: isFeatured
      ? `0 0 0 1px ${accentColor}22, 0 20px 60px -12px rgba(${accentColorRgb},0.18), inset 0 1px 0 rgba(${accentColorRgb},0.08)`
      : hovered
        ? `0 20px 40px -12px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}18`
        : "0 1px 3px rgba(0,0,0,0.3)",
    transform: isFeatured
      ? "none"
      : hovered
        ? `translateY(${hoverTranslateY})`
        : "translateY(0)",
    transition: `transform ${transitionDuration} cubic-bezier(0.34,1.56,0.64,1), box-shadow ${transitionDuration} ease, border-color ${transitionDuration} ease, background ${transitionDuration} ease`,
  };

  const iconWrapStyle = {
    background: isFeatured
      ? `rgba(${accentColorRgb},0.1)`
      : hovered
        ? `rgba(${accentColorRgb},0.06)`
        : "rgba(255,255,255,0.04)",
    borderColor: isFeatured
      ? `rgba(${accentColorRgb},0.3)`
      : hovered
        ? `rgba(${accentColorRgb},0.18)`
        : "rgba(255,255,255,0.07)",
    transition: `background ${transitionDuration} ease, border-color ${transitionDuration} ease`,
  };

  const iconStyle = {
    fill: isFeatured ? iconFeaturedColor : hovered ? iconColorHover : iconColor,
    transition: `fill ${transitionDuration} ease`,
  };

  return (
    <div
      onClick={() => onClick(card.id)}
      onMouseEnter={() => !isFeatured && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "relative overflow-hidden cursor-pointer select-none rounded-2xl border",
        isFeatured ? "col-span-full order-first" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={cardStyle}
    >
      {isFeatured && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}88 40%, ${accentColor} 50%, ${accentColor}88 60%, transparent 100%)`,
          }}
        />
      )}
      {isFeatured && (
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${accentColorRgb},0.07) 0%, transparent 70%)`,
          }}
        />
      )}
      {!isFeatured && hovered && (
        <div
          className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${accentColorRgb},0.12) 0%, transparent 70%)`,
          }}
        />
      )}

      <div
        className={
          isFeatured
            ? "relative z-10 flex flex-col md:flex-row items-start gap-6 p-8 md:p-10"
            : "relative z-10 flex flex-col justify-between gap-6 p-6 h-full"
        }
      >
        <div
          className={
            isFeatured
              ? "flex flex-col md:flex-row items-start gap-6 flex-1 min-w-0"
              : "flex flex-col gap-4 flex-1"
          }
        >
          <div
            className={[
              "shrink-0 rounded-xl flex items-center justify-center border",
              isFeatured ? "w-14 h-14" : "w-11 h-11",
            ].join(" ")}
            style={iconWrapStyle}
          >
            <svg
              viewBox={card.svgViewBox}
              className={isFeatured ? "w-7 h-7" : "w-5 h-5"}
              aria-hidden="true"
              style={iconStyle}
            >
              <path d={card.svgPath} />
            </svg>
          </div>
          <div className="space-y-2 min-w-0 flex flex-col gap-2">
            {isFeatured && (
              <span
                className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                style={{
                  background: `rgba(${accentColorRgb},0.1)`,
                  borderColor: `rgba(${accentColorRgb},0.25)`,
                  color: accentColor,
                }}
              >
                <span
                  className="w-1 h-1 rounded-full animate-ping"
                  style={{ background: accentColor }}
                />
                {activeLabel}
              </span>
            )}
            <h2
              className={[
                "font-bold tracking-tight leading-tight",
                isFeatured ? "text-2xl" : "text-base",
              ].join(" ")}
              style={{ color: titleColor }}
            >
              {card.title}
            </h2>
            <p
              className={[
                "leading-relaxed",
                isFeatured ? "text-base max-w-xl" : "text-sm",
              ].join(" ")}
              style={{ color: textColor }}
            >
              {card.description}
            </p>
          </div>
        </div>
        {isFeatured ? (
          <div className="shrink-0 md:self-end">
            <button
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold tracking-wide transition-all active:scale-95"
              style={{
                boxShadow: `0 4px 20px rgba(${accentColorRgb},0.35)`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              {exploreLabel}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium transition-opacity duration-200"
              style={{
                color: accentColor,
                opacity: hovered ? 1 : 0,
              }}
            >
              {detailsLabel}
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: `${textColor}77` }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
      {isFeatured && (
        <button
          aria-label={closeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all active:scale-90"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: textColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `rgba(${accentColorRgb},0.15)`;
            e.currentTarget.style.borderColor = `rgba(${accentColorRgb},0.4)`;
            e.currentTarget.style.color = accentColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = textColor;
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function BentoUnfoldGrid({
  className = "",
  activeLabel = "Active",
  exploreLabel = "Explore →",
  closeLabel = "Close featured card",
  detailsLabel = "View details →",
  cards = DEFAULT_CARDS,
  bgColor = "#0a0a0c",
  accentColor = "#a78bfa",
  accentColorRgb = "167,139,250",
  gridGap = "1.25rem",
  cardBg = "rgba(24,24,27,0.6)",
  cardBorder = "rgba(63,63,70,0.7)",
  featuredBg = "#0f0c1e",
  iconColor = "#52525b",
  iconColorHover = "#a1a1aa",
  iconFeaturedColor = "#a78bfa",
  titleColor = "#f4f4f5",
  textColor = "#71717a",
  hoverTranslateY = "-4px",
  transitionDuration = "240ms",
  showHeader = true,
  headerTagText = "System Architecture",
  headerTitle = "Engineered Core Modality",
  headerSubtitle = "Select a processing partition to scale its operational pipeline, monitor performance threads, and review integration docs.",
}) {
  const [featuredId, setFeaturedId] = useState(null);
  const containerRef = useRef(null);

  const handleClick = (id) => {
    const next = featuredId === id ? null : id;
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => setFeaturedId(next));
    } else {
      setFeaturedId(next);
    }
  };

  const handleClose = () => {
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => setFeaturedId(null));
    } else {
      setFeaturedId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full overflow-hidden antialiased ${className}`}
      style={{ background: bgColor, color: titleColor }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, rgba(${accentColorRgb},0.09) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-20 space-y-10">
        {showHeader && (
          <div className="max-w-lg space-y-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: textColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#34d399" }}
              />
              {headerTagText}
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
              style={{ color: titleColor }}
            >
              {headerTitle}
            </h1>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{ color: textColor }}
            >
              {headerSubtitle}
            </p>
          </div>
        )}

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: gridGap }}
        >
          {cards.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              index={i}
              isFeatured={featuredId === card.id}
              onClick={handleClick}
              onClose={handleClose}
              accentColor={accentColor}
              accentColorRgb={accentColorRgb}
              cardBg={cardBg}
              cardBorder={cardBorder}
              featuredBg={featuredBg}
              iconColor={iconColor}
              iconColorHover={iconColorHover}
              iconFeaturedColor={iconFeaturedColor}
              titleColor={titleColor}
              textColor={textColor}
              hoverTranslateY={hoverTranslateY}
              transitionDuration={transitionDuration}
              activeLabel={activeLabel}
              exploreLabel={exploreLabel}
              closeLabel={closeLabel}
              detailsLabel={detailsLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
