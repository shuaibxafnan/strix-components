"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
  { label: "Newsletter", href: "#newsletter", extra: true },
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

export default function StickyNav({
  logoLabel = "Studio",
  logoHref = "#",
  links = DEFAULT_LINKS,
  bgColor = "#ffffff",
  pillarColor = "#ffffff",
  textColor = "#404040",
  dividerColor = "#f5f5f5",
  className = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const nonExtraCount = links.filter((l) => !l.extra).length;

  return (
    <nav
      className={`h-[60px] w-full sticky top-0 left-0 right-0 uppercase text-[14px] z-50 transition-colors duration-300 font-mono tracking-tight select-none ${className}`}
      style={{
        fontFamily: "'DM Mono', monospace",
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: `1px solid ${dividerColor}`,
        "--snav-pillar": pillarColor,
        "--snav-divider": dividerColor,
      }}
    >
      <div
        className="flex h-full gap-4 mx-auto relative justify-between items-center w-[1100px] max-w-[calc(100%-2rem)] transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
      >
        <a
          href={logoHref}
          className="flex items-center px-4 no-underline text-current font-medium tracking-wide"
        >
          {logoLabel}
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
            const isExtra = !!link.extra;
            const showDivider = !isExtra && i < nonExtraCount - 1;

            return (
              <a
                key={i}
                href={link.href}
                className={`relative flex items-center justify-between px-4 lg:px-8 h-[60px] no-underline overflow-visible text-current
                  transition-all duration-300 transform-gpu will-change-transform ease-out
                  before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-[300%] before:z-[-1] before:transition-colors before:duration-300 before:bg-[var(--snav-pillar)] before:border-r-2 before:border-[var(--snav-divider)]
                  hover:translate-y-[80%] hover:z-30
                  [&:hover+a]:translate-y-[40%] [&:hover+a]:z-20
                  [&:hover+a+a]:translate-y-[13.6%] [&:hover+a+a]:z-10
                  ${isExtra ? "hidden xl:flex" : "flex-1"}
                  ${showDivider ? "border-r-2 border-[var(--snav-divider)]" : ""}
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
          className={`md:hidden absolute right-[-1rem] top-full w-[calc(100%+2rem)] z-[-1] transition-transform duration-300 transform-gpu border-b shadow-xl ${menuOpen ? "translate-y-0" : "-translate-y-[calc(100%+60px)]"}`}
          style={{ backgroundColor: bgColor, borderColor: dividerColor }}
        >
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-8 h-[60px] no-underline text-current transition-opacity duration-150 group hover:opacity-70"
              style={
                i < links.length - 1
                  ? { borderBottom: `1px solid ${dividerColor}` }
                  : undefined
              }
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
