"use client";

import { useEffect, useRef, useState } from "react";

// ─── MoreMenu ─────────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// items                MenuItem[]   Menu items array (see shape below)
// btnSize              number       48        Trigger button diameter (px)
// btnBg                string       "#6366f1" Trigger button background
// btnHoverBg           string       "#4f46e5" Trigger button hover background
// btnRingColor         string       "#6366f1" Pulse ring color (rgba base)
// menuBg               string       "#18181b" Dropdown background
// menuBorder           string       "#2d2d35" Dropdown border color
// menuWidth            number       168       Dropdown width (px)
// menuRadius           number       14        Dropdown border radius (px)
// itemColor            string       "#a1a1aa" Item default text/icon color
// itemHoverColor       string       "#f4f4f5" Item hover text/icon color
// itemHoverBg          string       "#27272a" Item hover background
// itemDivider          string       "#2d2d35" Item divider color
// iconSize             number       16        Icon width/height (px)
// fontSize             string       "13px"    Item label font size
// position             string       "bottom-right" Dropdown anchor: "bottom-right"|"bottom-left"|"top-right"|"top-left"
// staggerDelay         number       80        Ms between each item fade-in
// onSelect             function     noop      Called with item.id when clicked
// ─────────────────────────────────────────────────────────────────────────────
//
// MenuItem shape:
// { id, label, icon: ReactNode, danger?: boolean }

const SettingsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const ShareIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);

const DEFAULT_ITEMS = [
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  { id: "copy", label: "Copy", icon: <CopyIcon /> },
  { id: "share", label: "Share", icon: <ShareIcon /> },
  { id: "delete", label: "Delete", icon: <TrashIcon />, danger: true },
];

// ─── Hamburger icon — animates to X ──────────────────────────────────────────
function HamburgerIcon({ open, color = "#fff" }) {
  const base = {
    display: "block",
    height: "1.5px",
    borderRadius: "2px",
    background: color,
    transformOrigin: "center",
    transition:
      "transform 300ms cubic-bezier(0.52,-0.8,0.52,0.52), opacity 200ms ease, width 200ms ease",
  };
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "18px",
      }}
    >
      <span
        style={{
          ...base,
          width: "9px",
          alignSelf: "flex-end",
          transform: open ? "translateY(6.5px) rotate(45deg)" : "none",
          width: open ? "18px" : "9px",
        }}
      />
      <span
        style={{
          ...base,
          width: "18px",
          opacity: open ? 0 : 1,
          transform: open ? "scaleX(0)" : "scaleX(1)",
        }}
      />
      <span
        style={{
          ...base,
          width: "9px",
          alignSelf: "flex-start",
          transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none",
          width: open ? "18px" : "9px",
        }}
      />
    </span>
  );
}

// ─── Single menu item ─────────────────────────────────────────────────────────
function MenuItem({
  item,
  index,
  open,
  itemColor,
  itemHoverColor,
  itemHoverBg,
  itemDivider,
  iconSize,
  fontSize,
  staggerDelay,
  isLast,
  onSelect,
  dangerColor = "#f87171",
}) {
  const [hovered, setHovered] = useState(false);
  const color = hovered
    ? item.danger
      ? dangerColor
      : itemHoverColor
    : item.danger
      ? `${dangerColor}bb`
      : itemColor;

  return (
    <li
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        color,
        background: hovered ? itemHoverBg : "transparent",
        position: "relative",
        transition:
          "background 150ms ease, color 150ms ease, transform 150ms ease, opacity 150ms ease",
        // staggered slide-in
        opacity: open ? 1 : 0,
        transform: open ? "translateX(0)" : "translateX(-8px)",
        transitionDelay: open ? `${staggerDelay * index}ms` : "0ms",
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: iconSize,
          height: iconSize,
          flexShrink: 0,
          display: "flex",
        }}
      >
        {item.icon}
      </span>
      <span
        style={{
          fontSize,
          fontWeight: 500,
          letterSpacing: "0.01em",
          lineHeight: 1,
        }}
      >
        {item.label}
      </span>

      {/* Divider */}
      {!isLast && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: "12px",
            right: "12px",
            height: "1px",
            background: itemDivider,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
      )}
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MoreMenu({
  items = DEFAULT_ITEMS,
  btnSize = 48,
  btnBg = "#6366f1",
  btnHoverBg = "#4f46e5",
  btnRingColor = "#6366f1",
  menuBg = "#18181b",
  menuBorder = "#2d2d35",
  menuWidth = 168,
  menuRadius = 14,
  itemColor = "#a1a1aa",
  itemHoverColor = "#f4f4f5",
  itemHoverBg = "#27272a",
  itemDivider = "#2d2d35",
  iconSize = 16,
  fontSize = "13px",
  position = "bottom-right",
  staggerDelay = 75,
  onSelect = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => {
    if (!open) setPulse(true);
    setOpen((v) => !v);
  };

  // Dropdown position
  const menuPos = {
    "bottom-right": { top: `calc(100% + 10px)`, right: 0 },
    "bottom-left": { top: `calc(100% + 10px)`, left: 0 },
    "top-right": { bottom: `calc(100% + 10px)`, right: 0 },
    "top-left": { bottom: `calc(100% + 10px)`, left: 0 },
  }[position] ?? { top: `calc(100% + 10px)`, right: 0 };

  const transformOrigin =
    {
      "bottom-right": "top right",
      "bottom-left": "top left",
      "top-right": "bottom right",
      "top-left": "bottom left",
    }[position] ?? "top right";

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Trigger button */}
      <button
        aria-label="Open menu"
        aria-expanded={open}
        onClick={toggle}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        onAnimationEnd={() => setPulse(false)}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          background: btnHovered ? btnHoverBg : btnBg,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          transition: "background 200ms ease, box-shadow 200ms ease",
          boxShadow: btnHovered
            ? `0 0 0 10px ${btnRingColor}22`
            : `0 0 0 5px ${btnRingColor}33`,
          animation: pulse ? "btnPulse 550ms ease forwards" : "none",
        }}
      >
        <HamburgerIcon open={open} />

        {/* Subtle inner gloss */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      </button>

      {/* Dropdown */}
      <ul
        role="menu"
        style={{
          position: "absolute",
          ...menuPos,
          width: menuWidth,
          background: menuBg,
          border: `1px solid ${menuBorder}`,
          borderRadius: menuRadius,
          listStyle: "none",
          margin: 0,
          padding: "6px",
          zIndex: 10,
          boxShadow:
            "0 20px 40px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
          transformOrigin,
          transform: open ? "scale(1)" : "scale(0.88)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition:
            "transform 280ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {items.map((item, i) => (
          <MenuItem
            key={item.id}
            item={item}
            index={i}
            open={open}
            itemColor={itemColor}
            itemHoverColor={itemHoverColor}
            itemHoverBg={itemHoverBg}
            itemDivider={itemDivider}
            iconSize={iconSize}
            fontSize={fontSize}
            staggerDelay={staggerDelay}
            isLast={i === items.length - 1}
            onSelect={(id) => {
              onSelect(id);
              setOpen(false);
            }}
          />
        ))}
      </ul>

      <style>{`
        @keyframes btnPulse {
          0%   { box-shadow: 0 0 0 0px ${btnRingColor}44; }
          50%  { box-shadow: 0 0 0 14px ${btnRingColor}11; }
          100% { box-shadow: 0 0 0 5px ${btnRingColor}33; }
        }
      `}</style>
    </div>
  );
}
