"use client";

import { useEffect, useRef } from "react";

// ─── OsmoNav ─────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// bgColor          string   #e8e4dc    Page background (--color-neutral-300)
// textColor        string   #131313    Page + menu text color (--color-dark)
// accentColor      string   #e8571a    Eyebrow numbers + social underline (--color-primary)
// panelColor1      string   #e8571a    Outermost wipe panel — accent (--color-primary)
// panelColor2      string   #f0ece4    Middle wipe panel — near-white (--color-neutral-100)
// panelColor3      string   #e8e4dc    Final menu surface — matches page (--color-neutral-300)
// darkBg           string   #1a1a1a    Menu-link hover fill (--color-neutral-800)
// menuWidth        string   35em       CSS width of the slide-in drawer
// menuPadding      string   2em        Drawer inner padding (--menu-padding)
// menuBorderRadius string   1.25em     Border radius on left edges of drawer panels
// overlayColor     string   #13131366  Translucent dark overlay backdrop
// menuLinks        array    [...]      [{ label, href }] main nav items
// socialLinks      array    [...]      [{ label, href }] social footer items
// logoHref         string   /          Logo <a> href
// animDuration     number   0.7        GSAP default duration (s)
// ──────────────────────────────────────────────────────────────────────────────

// ─── Static SVG paths ────────────────────────────────────────────────────────
const OSMO_ICON_PATH =
  "M94.8284 53.8578C92.3086 56.3776 88 54.593 88 51.0294V0H72V59.9999C72 66.6273 66.6274 71.9999 60 71.9999H0V87.9999H51.0294C54.5931 87.9999 56.3777 92.3085 53.8579 94.8283L18.3431 130.343L29.6569 141.657L65.1717 106.142C67.684 103.63 71.9745 105.396 72 108.939V160L88.0001 160L88 99.9999C88 93.3725 93.3726 87.9999 100 87.9999H160V71.9999H108.939C105.407 71.9745 103.64 67.7091 106.12 65.1938L106.142 65.1716L141.657 29.6568L130.343 18.3432L94.8284 53.8578Z";

// ─── Default content ─────────────────────────────────────────────────────────
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

// ─── GSAP CDN ────────────────────────────────────────────────────────────────
const GSAP_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
const CUSTOM_EASE_URL =
  "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/CustomEase.min.js";

export default function OsmoNav({
  bgColor = "#e8e4dc",
  textColor = "#131313",
  accentColor = "#e8571a",
  panelColor1 = "#e8571a",
  panelColor2 = "#f0ece4",
  panelColor3 = "#e8e4dc",
  darkBg = "#1a1a1a",
  menuWidth = "35em",
  menuPadding = "2em",
  menuBorderRadius = "1.25em",
  overlayColor = "#13131366",
  menuLinks = DEFAULT_MENU_LINKS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  logoHref = "/",
  animDuration = 0.7,
}) {
  // ─── Refs ─────────────────────────────────────────────────────────────────
  const navRef = useRef(null);
  const overlayRef = useRef(null);
  const menuRef = useRef(null);
  const bgPanel1Ref = useRef(null);
  const bgPanel2Ref = useRef(null);
  const bgPanel3Ref = useRef(null);
  // menuLinkEls → the <a> tags (GSAP: yPercent:140→0, rotate:10→0)
  const menuLinkEls = useRef([]);
  // fadeTargetEls → [data-menu-fade]: "Socials" <p> + social <a> tags
  const fadeTargetEls = useRef([]);
  // menuButtonTextEls → the two <p> ("Menu", "Close") inside the button stack
  const menuButtonTextEls = useRef([]);
  const menuButtonIconRef = useRef(null);
  // Open state tracked as ref — no re-render needed
  const isOpenRef = useRef(false);
  const tlRef = useRef(null);

  // ─── Script loader (deduped via data-id attr) ─────────────────────────────
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-id="${src}"]`)) {
        resolve();
        return;
      }
      const el = document.createElement("script");
      el.src = src;
      el.setAttribute("data-id", src);
      el.onload = resolve;
      el.onerror = () => reject(new Error(`Failed: ${src}`));
      document.head.appendChild(el);
    });

  useEffect(() => {
    // Sequential load: GSAP → CustomEase → wire menu
    loadScript(GSAP_URL)
      .then(() => loadScript(CUSTOM_EASE_URL))
      .then(() => {
        const { gsap, CustomEase } = window;
        if (!gsap || !CustomEase) return;

        gsap.registerPlugin(CustomEase);
        CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: animDuration });

        // Nav wrapper hidden on mount — GSAP owns display
        gsap.set(navRef.current, { display: "none" });

        tlRef.current = gsap.timeline();

        const openNav = () => {
          isOpenRef.current = true;
          tlRef.current
            .clear()
            .set(navRef.current, { display: "block" })
            // Reset menu x before animating panels
            .set(menuRef.current, { xPercent: 0 }, "<")
            // Button text: "Menu" scrolls up, "Close" revealed
            .fromTo(
              menuButtonTextEls.current,
              { yPercent: 0 },
              { yPercent: -100, stagger: 0.2 },
            )
            // Button icon rotates to 315deg (becomes ×)
            .fromTo(
              menuButtonIconRef.current,
              { rotate: 0 },
              { rotate: 315 },
              "<",
            )
            // Overlay fades in
            .fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
            // Three bg panels wipe in from right edge, staggered
            .fromTo(
              [bgPanel1Ref.current, bgPanel2Ref.current, bgPanel3Ref.current],
              { xPercent: 101 },
              { xPercent: 0, stagger: 0.12, duration: 0.575 },
              "<",
            )
            // Menu link <a> tags rise from below — li overflow:hidden clips entry
            .fromTo(
              menuLinkEls.current,
              { yPercent: 140, rotate: 10 },
              { yPercent: 0, rotate: 0, stagger: 0.05 },
              "<+=0.35",
            )
            // Socials label + links fade + rise in
            .fromTo(
              fadeTargetEls.current,
              { autoAlpha: 0, yPercent: 50 },
              { autoAlpha: 1, yPercent: 0, stagger: 0.04 },
              "<+=0.2",
            );
        };

        const closeNav = () => {
          isOpenRef.current = false;
          tlRef.current
            .clear()
            // Overlay fades out, menu slides off right
            .to(overlayRef.current, { autoAlpha: 0 })
            .to(menuRef.current, { xPercent: 120 }, "<")
            // Button text and icon reset
            .to(menuButtonTextEls.current, { yPercent: 0 }, "<")
            .to(menuButtonIconRef.current, { rotate: 0 }, "<")
            .set(navRef.current, { display: "none" });
        };

        const handleToggle = () => {
          if (isOpenRef.current) closeNav();
          else openNav();
        };

        const handleKeydown = (e) => {
          if (e.key === "Escape" && isOpenRef.current) closeNav();
        };

        // [data-menu-toggle] = header button + overlay div
        const toggleEls = document.querySelectorAll("[data-menu-toggle]");
        toggleEls.forEach((el) => el.addEventListener("click", handleToggle));
        document.addEventListener("keydown", handleKeydown);

        return () => {
          toggleEls.forEach((el) =>
            el.removeEventListener("click", handleToggle),
          );
          document.removeEventListener("keydown", handleKeydown);
        };
      })
      .catch((e) => console.error("[OsmoNav] GSAP load failed:", e.message));
  }, [animDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* ─── Font face + scoped hover rules ──────────────────────────────── */}
      <style>{`
        @font-face {
          font-family: 'PP Neue Corp Tight';
          src: url('https://cdn.prod.website-files.com/673af51dea86ab95d124c3ee/673b0f5784f7060c0ac05534_PPNeueCorp-TightUltrabold.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        /* Menu button: icon rotates 90deg on hover */
        .osmo-menu-btn:hover .osmo-icon-wrap { transform: rotate(90deg); }
        .osmo-icon-wrap { transition: transform 0.4s cubic-bezier(0.65, 0.05, 0, 1); }

        /* .menu-link-bg — initial collapsed state + transition MUST live in the
           stylesheet (not inline style) so the hover rule below can override it */
        .osmo-menu-link-bg {
          transform-origin: 50% 100%;
          transform: scale3d(1, 0, 1);
          transition: transform 0.55s cubic-bezier(0.65, 0.05, 0, 1);
        }

        /* .menu-link-heading — base color via CSS var (set inline on <a>),
           transitions both transform and color */
        .osmo-menu-heading {
          color: var(--osmo-text);
          transition: transform 0.55s cubic-bezier(0.65, 0.05, 0, 1),
                      color 0.55s cubic-bezier(0.65, 0.05, 0, 1);
        }

        /* On hover: bg wipes up, heading slides up and flips to light */
        .osmo-menu-link:hover .osmo-menu-link-bg {
          transform: scale(1, 1);
        }
        .osmo-menu-link:hover .osmo-menu-heading {
          transform: translate(0px, -1em);
          color: #f5f5f5 !important;
          text-shadow: 0px 1em 0px #f5f5f5 !important;
        }

        /* Social links: underline slides in left on hover, uses --osmo-accent var */
        .osmo-text-link { position: relative; }
        .osmo-text-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background: var(--osmo-accent);
          transform-origin: right center;
          transform: scale(0, 1);
          transition: transform 0.4s cubic-bezier(0.65, 0.05, 0, 1);
        }
        .osmo-text-link:hover::after {
          transform-origin: left center;
          transform: scale(1, 1);
        }
      `}</style>

      {/* ─── Fixed header — z:110, pointer-events off on wrapper ─────────── */}
      <header
        className="fixed inset-x-0 top-0 z-[110] pointer-events-none"
        style={{ paddingTop: "1.5rem", color: textColor }}
      >
        <div className="w-full px-6 sm:px-10 mx-auto relative z-[1]">
          <nav className="flex items-center justify-between w-full">
            {/* Logo row: wordmark + cross icon */}
            <a
              href={logoHref}
              aria-label="home"
              className="pointer-events-auto flex items-center justify-between no-underline"
              style={{ width: "13em" }}
            >
              {/* Wordmark — width:4em per original .nav-logo__wordmark */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 66 20"
                fill="none"
                style={{ width: "4em" }}
              >
                <path
                  d="M9.675 19.35C4.325 19.35.9 15.425.9 10.05.9 4.675 4.325.775 9.675.775c5.35 0 8.775 3.9 8.775 9.275 0 5.375-3.425 9.3-8.775 9.3ZM3.775 10.05c0 3.675 1.675 6.925 5.9 6.925s5.9-3.25 5.9-6.925S13.9 3.15 9.675 3.15c-4.225 0-5.9 3.225-5.9 6.9Z"
                  fill="currentColor"
                />
                <path
                  d="M25.712 19.35c-3.875 0-5.8-2-5.875-4.6h2.475c.1 1.475 1 2.625 3.375 2.625 2.15 0 2.725-.95 2.725-1.875 0-1.6-1.7-1.775-3.35-2.125-2.225-.525-4.775-1.175-4.775-3.825 0-2.2 1.775-3.675 4.85-3.675 3.5 0 5.175 1.875 5.35 4.075h-2.475c-.175-.975-.7-2.1-2.825-2.1-1.65 0-2.35.65-2.35 1.6 0 1.325 1.425 1.45 3.225 1.85 2.35.55 4.9 1.225 4.9 4.075 0 2.475-1.9 3.975-5.25 3.975Z"
                  fill="currentColor"
                />
                <path
                  d="M40.544 10.825c0-1.7-.35-2.85-2.225-2.85s-3.025 1.275-3.025 3.2V19h-2.45V6.25h2.45v1.6h.05c.675-.975 1.85-1.975 3.775-1.975 1.775 0 2.875.8 3.375 2.225h.05c.925-1.225 2.225-2.225 4.175-2.225 2.575 0 3.875 1.55 3.875 4.275V19h-2.45v-8.175c0-1.7-.35-2.85-2.225-2.85s-3.15 1.275-3.15 3.2V19h-2.45v-8.175Z"
                  fill="currentColor"
                />
                <path
                  d="M59.028 19.375c-3.975 0-6.375-2.75-6.375-6.75 0-3.975 2.4-6.775 6.4-6.775s6.4 2.775 6.4 6.75-2.4 6.775-6.425 6.775Zm-3.825-6.75c0 2.65 1.2 4.725 3.85 4.725s4.05-2.075 4.05-4.725c0-2.675-1.2-4.725-3.85-4.725s-4.05 2.05-4.05 4.725Z"
                  fill="currentColor"
                />
              </svg>

              {/* Cross icon — w:1.5em h:1.5em per original .nav-logo__icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 160 160"
                fill="none"
                style={{ width: "1.5em", height: "1.5em" }}
              >
                <path d={OSMO_ICON_PATH} fill="currentColor" />
              </svg>
            </a>

            {/* Right side — menu toggle button */}
            <div
              className="pointer-events-auto flex items-center justify-end"
              style={{ gap: "0.625rem" }}
            >
              <button
                data-menu-toggle=""
                className="osmo-menu-btn flex items-center justify-end bg-transparent border-none cursor-pointer"
                style={{ gap: "0.625em", margin: "-1em", padding: "1em" }}
              >
                {/* "Menu" / "Close" text — overflow hidden so only one shows at a time */}
                <div
                  className="flex flex-col items-end justify-start overflow-hidden"
                  style={{ height: "1.125em" }}
                >
                  {["Menu", "Close"].map((word, i) => (
                    <p
                      key={word}
                      ref={(el) => {
                        if (el) menuButtonTextEls.current[i] = el;
                      }}
                      className="m-0"
                      style={{
                        fontSize: "1.125em",
                        lineHeight: 1,
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      {word}
                    </p>
                  ))}
                </div>

                {/* Plus/× icon — GSAP rotates to 315deg on open */}
                <div
                  ref={menuButtonIconRef}
                  className="osmo-icon-wrap"
                  style={{ width: "1em", height: "1em" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-full h-full"
                  >
                    <path d="M7.333 16V0h1.334v16H7.333Z" fill="currentColor" />
                    <path d="M16 8.667H0V7.333h16v1.334Z" fill="currentColor" />
                    <path
                      d="M6 7.333h1.333V6A1.333 1.333 0 0 1 6 7.333Z"
                      fill="currentColor"
                    />
                    <path
                      d="M10 7.333H8.667V6A1.333 1.333 0 0 1 10 7.333Z"
                      fill="currentColor"
                    />
                    <path
                      d="M6 8.667h1.333V10A1.333 1.333 0 0 1 6 8.667Z"
                      fill="currentColor"
                    />
                    <path
                      d="M10 8.667H8.667V10A1.333 1.333 0 0 1 10 8.667Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ─── Page content — centered Osmo icon ───────────────────────────── */}
      <section
        className="relative flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          padding: "5rem 2.5rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 160 160"
          fill="none"
          style={{ width: "8em" }}
        >
          <path d={OSMO_ICON_PATH} fill="currentColor" />
        </svg>

        {/* ─── Full-screen nav wrapper — z:100, GSAP controls display ───── */}
        <div
          ref={navRef}
          data-nav="closed"
          className="fixed inset-0 z-[100] w-full h-screen"
          style={{ color: textColor }}
        >
          {/* Dim overlay — data-menu-toggle closes on click */}
          <div
            ref={overlayRef}
            data-menu-toggle=""
            className="absolute inset-0 z-0 w-full h-full cursor-pointer"
            style={{ backgroundColor: overlayColor }}
          />

          {/* ── .menu — position:relative, margin-left:auto (right-aligns in fixed parent) */}
          <div
            ref={menuRef}
            className="relative ml-auto flex flex-col justify-between items-start overflow-auto h-full"
            style={{
              width: menuWidth,
              paddingTop: `calc(3 * ${menuPadding})`,
              paddingBottom: menuPadding,
              gap: "5em",
            }}
          >
            {/* .menu-bg — three absolutely stacked wipe panels */}
            <div className="absolute inset-0 z-0">
              {/* panel.first — accent color, wipes in first */}
              <div
                ref={bgPanel1Ref}
                className="absolute inset-0"
                style={{
                  backgroundColor: panelColor1,
                  borderTopLeftRadius: menuBorderRadius,
                  borderBottomLeftRadius: menuBorderRadius,
                }}
              />
              {/* panel.second — near-white, wipes in second */}
              <div
                ref={bgPanel2Ref}
                className="absolute inset-0"
                style={{
                  backgroundColor: panelColor2,
                  borderTopLeftRadius: menuBorderRadius,
                  borderBottomLeftRadius: menuBorderRadius,
                }}
              />
              {/* panel (no modifier) — final cream surface, wipes in last */}
              <div
                ref={bgPanel3Ref}
                className="absolute inset-0"
                style={{
                  backgroundColor: panelColor3,
                  borderTopLeftRadius: menuBorderRadius,
                  borderBottomLeftRadius: menuBorderRadius,
                }}
              />
            </div>

            {/* .menu-inner — z:1, sits above panels, full height, flex column */}
            <div
              className="relative z-[1] flex flex-col justify-between items-start w-full h-full overflow-auto"
              style={{ gap: "5em" }}
            >
              {/* .menu-list */}
              <ul className="flex flex-col w-full list-none m-0 p-0">
                {menuLinks.map(({ label, href }, i) => (
                  // .menu-list-item — overflow:hidden clips the entering <a>
                  <li key={i} className="relative overflow-hidden">
                    <a
                      href={href}
                      ref={(el) => {
                        // GSAP animates the <a> directly (yPercent + rotate)
                        if (el) menuLinkEls.current[i] = el;
                      }}
                      className="osmo-menu-link relative flex items-center w-full no-underline"
                      style={{
                        paddingTop: "0.75em",
                        paddingBottom: "0.75em",
                        paddingLeft: menuPadding,
                        gap: "0.75em",
                        // --osmo-text drives heading base color via CSS var
                        // (prop is runtime so can't live in static stylesheet)
                        "--osmo-text": textColor,
                      }}
                    >
                      {/* .menu-link-heading — large uppercase, ghost shadow below */}
                      <p
                        className="osmo-menu-heading relative z-[1] uppercase font-bold m-0"
                        style={{
                          fontFamily: "'PP Neue Corp Tight', Arial, sans-serif",
                          fontSize: "5.625em",
                          lineHeight: 0.75,
                          // Ghost duplicate — same color as real text, sits 1em below,
                          // slides into view when heading translates up on hover
                          textShadow: `0px 1em 0px ${textColor}`,
                          // transition lives in <style> tag (color + transform both)
                        }}
                      >
                        {label}
                      </p>

                      {/* .eyebrow — small numbered label in accent color */}
                      <p
                        className="relative z-[1] uppercase font-normal m-0"
                        style={{
                          fontFamily: "monospace",
                          color: accentColor,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </p>

                      {/* .menu-link-bg — dark panel; transform/transition live in <style>
                           so CSS hover rule can override them (inline beats stylesheet) */}
                      <div
                        className="osmo-menu-link-bg absolute inset-0 z-0"
                        style={{ backgroundColor: darkBg }}
                      />
                    </a>
                  </li>
                ))}
              </ul>

              {/* .menu-details — socials block at bottom of drawer */}
              <div
                className="flex flex-col items-start justify-start"
                style={{ paddingLeft: menuPadding, gap: "1.25em" }}
              >
                {/* "Socials" label — [data-menu-fade] */}
                <p
                  ref={(el) => {
                    if (el) fadeTargetEls.current[0] = el;
                  }}
                  data-menu-fade=""
                  className="m-0"
                  style={{
                    fontSize: "0.875em",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  Socials
                </p>

                {/* .socials-row */}
                <div
                  className="flex flex-row flex-wrap"
                  style={{ gap: "1.5em" }}
                >
                  {socialLinks.map(({ label, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      ref={(el) => {
                        if (el) fadeTargetEls.current[i + 1] = el;
                      }}
                      data-menu-fade=""
                      className="osmo-text-link no-underline"
                      style={{
                        fontSize: "1.125em",
                        fontFamily: "Arial, Helvetica, sans-serif",
                        // --osmo-accent drives the ::after underline color
                        "--osmo-accent": accentColor,
                      }}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
