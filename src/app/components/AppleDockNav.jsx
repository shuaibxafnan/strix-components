"use client";

import { useId, useState } from "react";

// ─── AppleDockNav ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #d4d4d4    Page background
// textColor          string   #131313    Base text color (credits link color)
// tooltipBgColor     string   #f5f5f5    Tooltip background
// tooltipTextColor   string   #131313    Tooltip text color
// items              array    [see below]   Dock items — each { icon, label, href }
// baseSize           string   5em        Resting width/height of each dock item
// hoverSize          string   8em        Width/height of the item directly under the cursor
// siblingCloseSize   string   7em        Width/height of the immediate neighbor (±1) of the hovered item
// siblingFarSize     string   6em        Width/height of the second-ring neighbor (±2) of the hovered item
// transitionDuration string   500ms      Speed of the width/height "magnify" transition
// transitionEase     string   cubic-bezier(0.16,1,0.3,1)   Easing curve for the magnify transition
// gapFromBottom      string   10vh       Distance from the bottom of the viewport to the dock
// fontScale          string   1.4vw      Base font-size driving the em-sized dock (icon/tooltip scale together)
// tooltipOffset      string   -140%      Y-translate applied to the tooltip when visible (how far above the icon it floats)
// showCredits        boolean  true       Toggles the bottom "Resource by Osmo" credit bar
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be92ee5ddf0080fb90_notion.png",
    label: "Notion",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bef9d004f8a9cf3b29_asana.png",
    label: "Asana",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be8c099d4e1ed55770_slack.png",
    label: "Slack",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be5b31ba243e4da377_loom.png",
    label: "Loom",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bea97e140677496dae_spotify.png",
    label: "Spotify",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bea73fcc6ee568f6f0_webflow.png",
    label: "Webflow",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728b10be6bc07649a51369e_Osmo.png",
    label: "Osmo",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bdf9d004f8a9cf3b09_adobe-illustrator.png",
    label: "Adobe Illustrator",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be1de916069b5e1aaa_figma.png",
    label: "Figma",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be1de916069b5e1a86_adobe-photoshop.png",
    label: "Photoshop",
    href: "#",
  },
  {
    icon: "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be051d32942a7aa31e_adobe-premierepro.png",
    label: "Premiere Pro",
    href: "#",
  },
];

export default function AppleDockNav({
  bgColor = "#d4d4d4",
  textColor = "#131313",
  tooltipBgColor = "#f5f5f5",
  tooltipTextColor = "#131313",
  items = DEFAULT_ITEMS,
  baseSize = "5em",
  hoverSize = "8em",
  siblingCloseSize = "7em",
  siblingFarSize = "6em",
  transitionDuration = "500ms",
  transitionEase = "cubic-bezier(0.16,1,0.3,1)",
  gapFromBottom = "10vh",
  fontScale = "1.4vw",
  tooltipOffset = "-140%",
  showCredits = true,
}) {
  const uid = useId().replace(/:/g, "");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const widthFor = (index) => {
    if (hoveredIndex === null) return baseSize;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return hoverSize;
    if (distance === 1) return siblingCloseSize;
    if (distance === 2) return siblingFarSize;
    return baseSize;
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[100] flex items-end justify-center"
        style={{ bottom: gapFromBottom }}
      >
        <ul
          className="pointer-events-auto m-0 flex flex-row items-end justify-center p-0"
          style={{ fontSize: fontScale }}
        >
          {items.map((item, index) => (
            <li
              key={`${item.label}-${uid}-${index}`}
              className="relative flex shrink-0 items-center justify-center"
              style={{
                width: widthFor(index),
                height: widthFor(index),
                transitionProperty: "width, height",
                transitionDuration,
                transitionTimingFunction: transitionEase,
              }}
            >
              <a
                href={item.href}
                className="pointer-events-auto relative z-[1] flex h-full w-full items-center justify-center px-[0.5em]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={item.icon}
                  loading="eager"
                  alt={`${item.label} app icon`}
                  className="w-full object-contain"
                  draggable={false}
                />
              </a>

              <div
                className="pointer-events-none absolute top-0 z-0 whitespace-nowrap rounded-[0.25em] px-[0.5em] py-[0.4em] text-[1em] font-normal transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  backgroundColor: tooltipBgColor,
                  color: tooltipTextColor,
                  opacity: hoveredIndex === index ? 1 : 0,
                  transform:
                    hoveredIndex === index
                      ? `translate(0, ${tooltipOffset})`
                      : "translate(0, -80%)",
                }}
              >
                {item.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
