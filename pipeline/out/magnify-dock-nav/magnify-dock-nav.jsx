"use client";

import { useId, useState } from "react";

const DEFAULT_ITEMS = [
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg",
    label: "Notion",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    label: "GitHub",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg",
    label: "Slack",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    label: "VS Code",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/spotify.svg",
    label: "Spotify",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webflow/webflow-original.svg",
    label: "Webflow",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg",
    label: "Discord",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg",
    label: "Adobe Illustrator",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
    label: "Figma",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg",
    label: "Photoshop",
    href: "#",
  },
  {
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/adobepremierepro.svg",
    label: "Premiere Pro",
    href: "#",
  },
];

export default function MagnifyDockNav({
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
  className = "",
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
      className={`pointer-events-none fixed left-0 right-0 top-0 z-[100] flex items-end justify-center ${className}`}
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
  );
}
