"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Journal", href: "#journal" },
  { label: "Guide", href: "#guide", featured: true },
  { label: "Contact", href: "#contact" },
];

const ArrowIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const css = `
@keyframes pdn-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(0.1); }
}
`;

export default function PillarDropNav({
  logoHref = "#",
  logoLabel = "Home",
  links = DEFAULT_LINKS,
  backgroundColor = "#ffffff",
  pillarColor = "#ffffff",
  dividerColor = "#f5f5f5",
  textColor = "#404040",
  accentColor = "#ff1e1e",
  className = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const nonFeaturedCount = links.filter((l) => !l.featured).length;

  return (
    <nav
      className={`h-[60px] w-full sticky top-0 left-0 right-0 uppercase text-[14px] z-50 font-mono tracking-tight select-none ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        borderBottom: `1px solid ${dividerColor}`,
      }}
    >
      <style>{css}</style>
      <div className="flex h-full gap-4 mx-auto relative justify-between items-center w-[1100px] max-w-[calc(100%-2rem)]">
        <a
          href={logoHref}
          aria-label={logoLabel}
          className="flex items-center px-4 no-underline text-current group"
        >
          <svg
            viewBox="0 0 969 955"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 transition-transform duration-300 group-hover:scale-105"
          >
            <circle
              cx="161.191"
              cy="332.736"
              r="133.191"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle
              cx="806.809"
              cy="332.736"
              r="133.191"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle
              className="origin-center fill-current animate-[pdn-blink_6s_-2s_infinite]"
              cx="695.019"
              cy="600.278"
              r="31.4016"
            />
            <circle
              className="origin-center fill-current animate-[pdn-blink_6s_-2s_infinite]"
              cx="272.981"
              cy="600.278"
              r="31.4016"
            />
            <path
              d="M564.388 724.628C564.388 756.538 526.035 792.455 483.372 792.455C440.709 792.455 402.356 756.538 402.356 724.628C402.356 692.717 440.709 676.897 483.372 676.897C526.035 676.897 564.388 692.717 564.388 724.628Z"
              fill="currentColor"
            />
            <rect
              x="310.42"
              y="460.854"
              width="343.468"
              height="51.4986"
              fill={accentColor}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M745.643 300.784C815.368 356.729 854.539 445.167 854.539 524.286H614.938V467.196C614.938 445.657 597.477 428.196 575.938 428.196H388.37C366.831 428.196 349.37 445.657 349.37 467.196V524.286L110.949 524.286C110.949 445.167 150.12 356.729 219.845 300.784C289.57 244.839 384.138 213.41 482.744 213.41C581.35 213.41 675.918 244.839 745.643 300.784Z"
              fill="currentColor"
            />
          </svg>
        </a>

        <div className="w-[60px] md:hidden h-full flex items-center justify-center">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
            className="grid place-items-center h-[60px] w-full cursor-pointer bg-transparent border-0 p-0 text-current"
          >
            <span
              className={`block transform-gpu transition-transform duration-300 ${menuOpen ? "rotate-45" : "rotate-0"}`}
            >
              <PlusIcon />
            </span>
          </button>
        </div>

        <div className="hidden md:flex flex-1 h-full isolation-auto group/nav">
          {links.map((link, i) => {
            const isFeatured = !!link.featured;
            const hasDivider = !isFeatured && i < nonFeaturedCount - 1;

            return (
              <a
                key={i}
                href={link.href}
                style={{
                  "--pdn-pillar": pillarColor,
                  "--pdn-divider": dividerColor,
                  borderRight: hasDivider
                    ? `2px solid ${dividerColor}`
                    : undefined,
                }}
                className={`relative flex items-center justify-between px-4 lg:px-8 h-[60px] no-underline overflow-visible text-current
                  transition-all duration-300 transform-gpu will-change-transform ease-out
                  before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-[300%] before:z-[-1] before:transition-colors before:duration-300
                  before:bg-[var(--pdn-pillar)] before:border-r-2 before:border-[var(--pdn-divider)]
                  hover:translate-y-[80%] hover:z-30
                  [&:hover+a]:translate-y-[40%] [&:hover+a]:z-20
                  [&:hover+a+a]:translate-y-[13.6%] [&:hover+a+a]:z-10
                  ${isFeatured ? "hidden xl:flex" : "flex-1"}
                `}
              >
                <span className="font-medium tracking-wide">{link.label}</span>
                <span className="opacity-0 -rotate-0 scale-100 transition-all duration-300 group-hover/nav:delay-75 group-hover:opacity-100 group-hover:-rotate-45 group-hover:scale-110">
                  <ArrowIcon />
                </span>
              </a>
            );
          })}
        </div>

        <div
          className={`md:hidden absolute right-[-1rem] top-full w-[calc(100%+2rem)] z-[-1] transition-transform duration-300 transform-gpu border-b shadow-xl
            ${menuOpen ? "translate-y-0" : "-translate-y-[calc(100%+60px)]"}
          `}
          style={{ backgroundColor, borderColor: dividerColor }}
        >
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                borderBottom:
                  i < links.length - 1
                    ? `1px solid ${dividerColor}`
                    : undefined,
              }}
              className="flex items-center justify-between px-8 h-[60px] no-underline text-current transition-opacity duration-150 group"
            >
              <span>{link.label}</span>
              <span className="opacity-60 group-hover:opacity-100 group-hover:-rotate-45 group-hover:scale-110 transition-all duration-200">
                <ArrowIcon />
              </span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
