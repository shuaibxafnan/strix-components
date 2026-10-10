"use client";

import { useState } from "react";

// ─── StickyNav ───────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// logoHref    string    https://jhey.dev/links    Logo link href
// links       { label, href, ebook? }[]           Nav links array
// xHref       string    twitter follow URL         X / Twitter fixed link
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_LINKS = [
  {
    label: "Follow",
    href: "https://twitter.com/intent/follow?screen_name=jh3yy",
  },
  { label: "YouTube", href: "https://www.youtube.com/@jh3y" },
  { label: "CodePen", href: "https://codepen.io/jh3y" },
  {
    label: "ebook",
    href: "https://gumroad.com/l/move-things-with-css/",
    ebook: true,
  },
  { label: "Twitch", href: "https://twitch.tv/jh3yy" },
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
  logoHref = "https://jhey.dev/links",
  links = DEFAULT_LINKS,
  xHref = "https://twitter.com/intent/follow?screen_name=jh3yy",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const applyChange = () => setIsDark((prev) => !prev);

    if (!document.startViewTransition) {
      applyChange();
      return;
    }
    document.startViewTransition(() => applyChange());
  };

  // Pre-filter clean length counters for explicit flex calculations
  const nonEbookCount = links.filter((l) => !l.ebook).length;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 font-mono text-sm tracking-tight select-none
        ${isDark ? "bg-black text-neutral-100" : "bg-neutral-100 text-neutral-700"}
      `}
      style={{
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {/* ── Navbar Container ── */}
      <nav
        className={`h-[60px] sticky top-0 left-0 right-0 uppercase text-[14px] z-50 transition-colors duration-300 border-b border-black/5 dark:border-white/5
          ${isDark ? "bg-neutral-900" : "bg-white"}
        `}
      >
        <div
          className={`flex h-full gap-4 mx-auto relative justify-between items-center w-[1100px] max-w-[calc(100%-2rem)] transition-colors duration-300
            ${isDark ? "bg-neutral-900" : "bg-white"}
          `}
        >
          {/* Logo Brand Anchor */}
          <a
            href={logoHref}
            target="_blank"
            rel="noopener noreferrer"
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
                className="origin-center fill-current animate-[snav-blink_6s_-2s_infinite]"
                cx="695.019"
                cy="600.278"
                r="31.4016"
              />
              <circle
                className="origin-center fill-current animate-[snav-blink_6s_-2s_infinite]"
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
                fill="#FF1E1E"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M745.643 300.784C815.368 356.729 854.539 445.167 854.539 524.286H614.938V467.196C614.938 445.657 597.477 428.196 575.938 428.196H388.37C366.831 428.196 349.37 445.657 349.37 467.196V524.286L110.949 524.286C110.949 445.167 150.12 356.729 219.845 300.784C289.57 244.839 384.138 213.41 482.744 213.41C581.35 213.41 675.918 244.839 745.643 300.784Z"
                fill="currentColor"
              />
            </svg>
          </a>

          {/* Mobile Target Trigger Button */}
          <div className="w-[60px] md:hidden h-full flex items-center justify-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              className="grid place-items-center h-[60px] w-full cursor-pointer bg-transparent border-0 p-0 text-current"
            >
              <span
                className={`block transform-gpu transition-transform duration-300 ${menuOpen ? "rotate-45" : "rotate-0"}`}
              >
                <PlusIcon />
              </span>
            </button>
          </div>

          {/* Desktop Adaptive Link Grid Deck */}
          <div className="hidden md:flex flex-1 h-full isolation-auto group/nav">
            {links.map((link, i) => {
              const isEbook = !!link.ebook;

              // Standard calculated border colors targeting runtime changes
              const borderStyle =
                !isEbook && i < nonEbookCount - 1
                  ? isDark
                    ? "border-r-2 border-black"
                    : "border-r-2 border-neutral-100"
                  : "";

              return (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative flex items-center justify-between px-8 h-[60px] no-underline overflow-visible text-current
                    transition-all duration-300 transform-gpu will-change-transform ease-out
                    
                    /* Background Pillars */
                    before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-[300%] before:z-[-1] before:transition-colors before:duration-300
                    ${isDark ? "before:bg-neutral-950 before:border-r-2 before:border-black" : "before:bg-white before:border-r-2 before:border-neutral-100"}
                    
                    /* Elastic Dynamic Fish-Eye Wave Effect States */
                    hover:translate-y-[80%] hover:z-30
                    
                    /* Dynamic Adjacent Neighbor Offsets via Tailwind Group Selectors */
                    [&:hover+a]:translate-y-[40%] [&:hover+a]:z-20
                    [&:hover+a+a]:translate-y-[13.6%] [&:hover+a+a]:z-10
                    
                    /* Legacy functional selection matching checks */
                    ${isEbook ? "hidden xl:flex" : "flex-1"}
                    ${borderStyle}
                  `}
                >
                  <span className="font-medium tracking-wide">
                    {link.label}
                  </span>
                  <span className="opacity-0 -rotate-0 scale-100 transition-all duration-300 group-hover/nav:delay-75 group-hover:opacity-100 group-hover:-rotate-45 group-hover:scale-110">
                    <ArrowIcon />
                  </span>
                </a>
              );
            })}
          </div>

          {/* Mobile Overlay Dropdown Drawer Panel */}
          <div
            className={`md:hidden absolute right-[-1rem] top-full w-[calc(100%+2rem)] z-[-1] transition-transform duration-300 transform-gpu border-b shadow-xl
              ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}
              ${menuOpen ? "translate-y-0" : "-translate-y-[calc(100%+60px)]"}
            `}
          >
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between px-8 h-[60px] no-underline text-current transition-colors duration-150 group
                  ${isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-50"}
                  ${i < links.length - 1 ? (isDark ? "border-b border-black" : "border-b border-neutral-100") : ""}
                `}
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

      {/* ── Fixed Floating Action Buttons ── */}

      {/* Dynamic Native Theme Switcher Controller */}
      <button
        aria-pressed={isDark}
        onClick={toggleTheme}
        className={`fixed bottom-4 right-4 w-12 aspect-square p-0 border-0 grid place-items-center rounded-[12px] bg-transparent cursor-pointer z-50 text-current transition-colors duration-200
          ${isDark ? "hover:bg-neutral-900" : "hover:bg-white"}
          
          /* Custom Visibility Layer Selection mapping inside raw SVG paths */
          ${isDark ? "[&_path:first-of-type]:hidden [&_path:last-of-type]:block" : "[&_path:first-of-type]:block [&_path:last-of-type]:hidden"}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-1/2"
        >
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">Toggle Theme</span>
      </button>

      {/* Fixed External X Handle Anchor */}
      <a
        href={xHref}
        target="_blank"
        rel="noreferrer noopener"
        className="fixed bottom-4 left-4 w-12 aspect-square grid place-items-center opacity-70 hover:opacity-100 text-current transition-opacity duration-200 z-50"
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-1/2"
        >
          <title>X</title>
          <path
            d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </div>
  );
}
