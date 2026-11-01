"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Anton } from "next/font/google";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const DEFAULT_MENU_LINKS = [
  { label: "About us", href: "#" },
  { label: "Our work", href: "#" },
  { label: "Services", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact us", href: "#" },
];

const DEFAULT_SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "X/Twitter", href: "#" },
  { label: "Awwwards", href: "#" },
];

const StarIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" />
    <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" transform="rotate(45 12 12)" />
  </svg>
);

export default function SlideInMenu({
  brandName = "Studio",
  menuLabel = "Menu",
  closeLabel = "Close",
  socialsLabel = "Socials",
  homeLabel = "Home",
  logoHref = "/",
  menuLinks = DEFAULT_MENU_LINKS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  textColor = "#000000",
  accentColor = "#737373",
  panelColor1 = "#000000",
  panelColor2 = "#e5e5e5",
  panelColor3 = "#ffffff",
  hoverFillColor = "#000000",
  hoverTextColor = "#ffffff",
  overlayColor = "#00000066",
  menuWidth = "35em",
  menuPadding = "2em",
  menuBorderRadius = "1.25em",
  animDuration = 0.7,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const overlayRef = useRef(null);
  const menuRef = useRef(null);
  const panelRefs = useRef([]);
  const linkRefs = useRef([]);
  const fadeRefs = useRef([]);
  const buttonTextRefs = useRef([]);
  const iconRef = useRef(null);
  const timelineRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("nav-main", "0.65, 0.01, 0.05, 0.99");
    timelineRef.current = gsap.timeline({
      defaults: { ease: "nav-main", duration: animDuration },
    });

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf([
        navRef.current,
        overlayRef.current,
        menuRef.current,
        iconRef.current,
        ...panelRefs.current,
        ...linkRefs.current,
        ...fadeRefs.current,
        ...buttonTextRefs.current,
      ]);
    };
  }, [animDuration]);

  const openNav = () => {
    const tl = timelineRef.current;
    if (!tl) return;
    openRef.current = true;
    setOpen(true);

    tl.clear()
      .set(navRef.current, { display: "block" })
      .set(menuRef.current, { xPercent: 0 }, "<")
      .fromTo(
        buttonTextRefs.current,
        { yPercent: 0 },
        { yPercent: -100, stagger: 0.2 },
      )
      .fromTo(iconRef.current, { rotate: 0 }, { rotate: 315 }, "<")
      .fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .fromTo(
        panelRefs.current,
        { xPercent: 101 },
        { xPercent: 0, stagger: 0.12, duration: 0.575 },
        "<",
      )
      .fromTo(
        linkRefs.current,
        { yPercent: 140, rotate: 10 },
        { yPercent: 0, rotate: 0, stagger: 0.05 },
        "<+=0.35",
      )
      .fromTo(
        fadeRefs.current,
        { autoAlpha: 0, yPercent: 50 },
        { autoAlpha: 1, yPercent: 0, stagger: 0.04 },
        "<+=0.2",
      );
    tl.play(0);
  };

  const closeNav = () => {
    const tl = timelineRef.current;
    if (!tl) return;
    openRef.current = false;
    setOpen(false);

    tl.clear()
      .to(overlayRef.current, { autoAlpha: 0 })
      .to(menuRef.current, { xPercent: 120 }, "<")
      .to(buttonTextRefs.current, { yPercent: 0 }, "<")
      .to(iconRef.current, { rotate: 0 }, "<")
      .set(navRef.current, { display: "none" });
    tl.play(0);
  };

  const toggle = () => (openRef.current ? closeNav() : openNav());

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeNav();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      className={`${display.variable} ${className}`}
      style={{
        "--text": textColor,
        "--accent": accentColor,
        "--menu-w": menuWidth,
        "--pad": menuPadding,
        "--radius": menuBorderRadius,
        "--panel-1": panelColor1,
        "--panel-2": panelColor2,
        "--panel-3": panelColor3,
        "--hover-fill": hoverFillColor,
        "--hover-text": hoverTextColor,
        "--overlay": overlayColor,
      }}
    >
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[110] pt-6 text-[var(--text)]">
        <div className="relative z-[1] mx-auto w-full px-6 sm:px-10">
          <nav className="flex w-full items-center justify-between">
            <a
              href={logoHref}
              aria-label={homeLabel}
              className="pointer-events-auto flex items-center gap-3 no-underline"
            >
              <span className="text-[1.75em] uppercase leading-none tracking-wide [font-family:var(--font-display)]">
                {brandName}
              </span>
              <StarIcon className="h-[1.5em] w-[1.5em]" />
            </a>

            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="site-menu"
              className="group pointer-events-auto -m-4 flex cursor-pointer items-center justify-end gap-[0.625em] border-none bg-transparent p-4 text-inherit"
            >
              <div className="flex h-[1.125em] flex-col items-end justify-start overflow-hidden">
                {[menuLabel, closeLabel].map((word, i) => (
                  <p
                    key={i}
                    ref={(el) => (buttonTextRefs.current[i] = el)}
                    className="m-0 text-[1.125em] leading-none"
                  >
                    {word}
                  </p>
                ))}
              </div>

              <div ref={iconRef} className="h-4 w-4">
                <div className="h-full w-full transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(0.65,0.05,0,1)] group-hover:rotate-90">
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <rect x="7.333" y="0" width="1.334" height="16" />
                    <rect x="0" y="7.333" width="16" height="1.334" />
                  </svg>
                </div>
              </div>
            </button>
          </nav>
        </div>
      </header>

        <div
          ref={navRef}
          id="site-menu"
          className="fixed inset-0 z-[100] hidden h-screen w-full text-[var(--text)]"
        >
          <div
            ref={overlayRef}
            onClick={closeNav}
            className="absolute inset-0 z-0 h-full w-full cursor-pointer bg-[var(--overlay)]"
          />

          <div
            ref={menuRef}
            className="relative ml-auto flex h-full w-[var(--menu-w)] max-w-full flex-col items-start justify-between gap-[5em] overflow-auto pb-[var(--pad)] pt-[calc(3*var(--pad))]"
          >
            <div className="absolute inset-0 z-0">
              {["bg-[var(--panel-1)]", "bg-[var(--panel-2)]", "bg-[var(--panel-3)]"].map(
                (color, i) => (
                  <div
                    key={i}
                    ref={(el) => (panelRefs.current[i] = el)}
                    className={`absolute inset-0 rounded-l-[var(--radius)] ${color}`}
                  />
                ),
              )}
            </div>

            <div className="relative z-[1] flex h-full w-full flex-col items-start justify-between gap-[5em] overflow-auto">
              <ul className="m-0 flex w-full list-none flex-col p-0">
                {menuLinks.map(({ label, href }, i) => (
                  <li key={i} className="relative overflow-hidden">
                    <a
                      href={href}
                      ref={(el) => (linkRefs.current[i] = el)}
                      onClick={closeNav}
                      className="group relative flex w-full items-center gap-[0.75em] py-[0.75em] pl-[var(--pad)] no-underline"
                    >
                      <p className="relative z-[1] m-0 text-[clamp(3rem,10vw,5.625rem)] uppercase leading-[0.75] text-[var(--text)] [font-family:var(--font-display)] [text-shadow:0_1em_0_var(--text)] transition-[transform,color,text-shadow] duration-[550ms] [transition-timing-function:cubic-bezier(0.65,0.05,0,1)] group-hover:-translate-y-[1em] group-hover:text-[var(--hover-text)] group-hover:[text-shadow:0_1em_0_var(--hover-text)]">
                        {label}
                      </p>
                      <p className="relative z-[1] m-0 font-mono text-sm uppercase text-[var(--accent)]">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <div className="absolute inset-0 z-0 origin-bottom scale-y-0 bg-[var(--hover-fill)] transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(0.65,0.05,0,1)] group-hover:scale-y-100" />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-start justify-start gap-[1.25em] pl-[var(--pad)]">
                <p
                  ref={(el) => (fadeRefs.current[0] = el)}
                  className="m-0 text-[0.875em]"
                >
                  {socialsLabel}
                </p>
                <div className="flex flex-row flex-wrap gap-[1.5em]">
                  {socialLinks.map(({ label, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      ref={(el) => (fadeRefs.current[i + 1] = el)}
                      className="relative text-[1.125em] no-underline after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[400ms] after:content-[''] after:[transition-timing-function:cubic-bezier(0.65,0.05,0,1)] hover:after:origin-left hover:after:scale-x-100"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}