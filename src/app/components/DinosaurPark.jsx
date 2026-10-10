"use client";

import { useEffect, useRef } from "react";

// ─── DinosaurPark ─────────────────────────────────────────────────────────────
//
// Full-page scroll-snapped park landing page. Four sections snap into view;
// each section animates its content in when it crosses the intersection
// threshold. Modernised with oversized typography, colour-blocked sections,
// and a physical slide-in entrance per section.
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// heroImgSrc          string   CDN url          Hero background image
// heroTitle           string   "Dinosaur\nPark"  Hero title (\n = line break)
// heroSubtitle        string   "Get ready..."   Hero tagline
// heroFootprintSrc    string   CDN url          Footprint SVG watermark
// heroAccentColor     string   "#ffa700"        Accent used on hero text/cta
//
// navItems            array    [{label,href}]   Left-side nav links
// ctaLabel            string   "Book now"       CTA button label
// ctaHref             string   "/"              CTA button href
//
// sections            array    See SECTION SHAPE below
// intersectionThreshold number 0.6             Fraction visible before animating
//
// SECTION SHAPE
// ─────────────────────────────────────────────────────────────────────────────
// eyebrow       string    Small uppercase zone label
// count         string    Zone creature count — shown as oversized bg texture
// title         string    Large display title (\n = line break)
// intro         string    Body paragraph
// linkLabel     string    CTA link text
// linkHref      string    CTA link href
// imgSrc        string    Dinosaur illustration URL
// imgAlt        string    Alt text
// imgSide       "left"|"right"  Which side the dino appears on
// bgColor       string    CSS color (section background)
// accentColor   string    CSS color (used for eyebrow, link, glow)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS = [
  {
    eyebrow: "Zone 01",
    count: "47",
    title: "Gentle\nGiants",
    intro:
      "Go on safari and come face to face with the largest animals to have ever walked the earth — towering herbivores whose footsteps shake the ground beneath you.",
    linkLabel: "Explore the zone",
    linkHref: "/",
    imgSrc:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/85648/parasaurolophus.svg",
    imgAlt: "Parasaurolophus",
    imgSide: "right",
    bgColor: "#0d2b27",
    accentColor: "#3de0c4",
  },
  {
    eyebrow: "Zone 02",
    count: "12",
    title: "Carnivore\nKingdom",
    intro:
      "Step inside the most dangerous square mile on the planet. Fiercest predators in history — separated from you by nothing but reinforced glass and a prayer.",
    linkLabel: "Enter if you dare",
    linkHref: "/",
    imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/85648/trex.svg",
    imgAlt: "T-Rex",
    imgSide: "left",
    bgColor: "#1e0a04",
    accentColor: "#ff5a1f",
  },
  {
    eyebrow: "Zone 03",
    count: "28",
    title: "Aerial\nAdventure",
    intro:
      "Look up. Magnificent winged predators circle the skies of our open-air aviary — the largest in the world. A spectacle not for the faint-hearted.",
    linkLabel: "Take flight",
    linkHref: "/",
    imgSrc:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/85648/pterodactyl.svg",
    imgAlt: "Pterodactyl",
    imgSide: "right",
    bgColor: "#110920",
    accentColor: "#b97fff",
  },
];

export default function DinosaurPark({
  heroImgSrc = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/85648/hero_1200.jpg",
  heroTitle = "Dinosaur\nPark",
  heroSubtitle = "Get ready for the ultimate adventure",
  heroFootprintSrc = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/85648/footprint_01a.svg",
  heroAccentColor = "#ffa700",

  navItems = [
    { label: "Our mission", href: "/" },
    { label: "Get in touch", href: "/" },
  ],
  ctaLabel = "Book now",
  ctaHref = "/",

  sections = DEFAULT_SECTIONS,
  intersectionThreshold = 0.6,
}) {
  const mainRef = useRef(null);

  useEffect(() => {
    const sectionEls = mainRef.current?.querySelectorAll("section") ?? [];

    // Stagger each direct child of [data-content] via CSS custom property
    sectionEls.forEach((sec) => {
      const contentEl = sec.querySelector("[data-content]");
      if (!contentEl) return;
      [...contentEl.children].forEach((child, i) => {
        child.style.setProperty("--delay", `${i * 110}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, intersectionRatio }) => {
          if (intersectionRatio >= intersectionThreshold) {
            target.classList.add("dp-visible");
          } else {
            target.classList.remove("dp-visible");
          }
        });
      },
      { rootMargin: "0px", threshold: intersectionThreshold },
    );

    sectionEls.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [intersectionThreshold]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&family=Overpass+Mono:wght@600&display=swap');

        /* ── Scroll snap container ─────────────────────────────── */
        .dp-main {
          scroll-snap-type: y mandatory;
          height: 100vh;
          overflow-y: scroll;
          scrollbar-width: none;
        }
        .dp-main::-webkit-scrollbar { display: none; }

        /* ── Section snap ──────────────────────────────────────── */
        .dp-section { scroll-snap-align: center; }

        /* ── Typography ────────────────────────────────────────── */
        .dp-anton {
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          line-height: 0.9;
          letter-spacing: -0.01em;
        }
        .dp-sans { font-family: 'DM Sans', sans-serif; }

        /* ── Entrance animations ───────────────────────────────── */
        .dp-from-left {
          opacity: 0;
          transform: translateX(-50px);
          transition:
            opacity 650ms ease var(--delay, 0ms),
            transform 650ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms);
        }
        .dp-from-right {
          opacity: 0;
          transform: translateX(50px);
          transition:
            opacity 650ms ease var(--delay, 0ms),
            transform 650ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms);
        }
        .dp-from-bottom {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 650ms ease var(--delay, 0ms),
            transform 650ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms);
        }

        /* ── Resolve all entrance animations when section is live ── */
        .dp-visible .dp-from-left,
        .dp-visible .dp-from-right,
        .dp-visible .dp-from-bottom {
          opacity: 1 !important;
          transform: translate(0, 0) !important;
        }

        /* ── Hero background darkening transition ──────────────── */
        .dp-hero-overlay {
          transition: opacity 3.5s ease;
          opacity: 1;
        }
        .dp-section.dp-visible .dp-hero-overlay { opacity: 0.6; }

        /* ── Ghost background number ───────────────────────────── */
        .dp-ghost {
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          position: absolute;
          line-height: 1;
          font-size: clamp(180px, 32vw, 400px);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 1.1s ease 0.08s, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.08s;
          user-select: none;
          pointer-events: none;
          color: white;
        }
        .dp-visible .dp-ghost {
          opacity: 0.04;
          transform: translateY(0);
        }

        /* ── CTA border button ─────────────────────────────────── */
        .dp-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 14px 30px;
          border: 1px solid currentColor;
          transition: background 0.25s, color 0.25s;
        }
        .dp-btn:hover { filter: brightness(1.2); }

        /* ── Nav CTA — original amber pill ─────────────────────── */
        .dp-nav-cta {
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          text-decoration: none;
          display: block;
          padding: 12px 20px;
          font-size: 1.25rem;
          line-height: 1;
          border-radius: 6px;
          min-width: 180px;
          text-align: center;
          color: #000;
          transition: filter 0.2s;
        }
        .dp-nav-cta:hover,
        .dp-nav-cta:focus { filter: brightness(0.85); text-decoration: none; }

        /* ── Nav text links — original white ───────────────────── */
        .dp-nav-link {
          font-family: 'Overpass Mono', monospace;
          color: white;
          text-decoration: none;
          display: block;
          padding: 12px 20px;
        }
        .dp-nav-link:hover,
        .dp-nav-link:focus { text-decoration: underline; }

        /* ── Section content two-column grid ───────────────────── */
        .dp-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
        }
        @media (min-width: 860px) {
          .dp-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Scroll progress dots ──────────────────────────────── */
        .dp-dots {
          position: fixed;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 30;
        }
        .dp-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transition: background 0.3s, transform 0.3s;
          cursor: pointer;
        }
        .dp-dot.dp-dot-active {
          background: rgba(255,255,255,0.85);
          transform: scale(1.6);
        }
      `}</style>

      {/* ── Fixed navigation — original style ───────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-20">
        <nav>
          <ul className="flex h-20 items-center justify-end px-5 gap-0 m-0 p-0 list-none">
            {navItems.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="dp-nav-link">
                  {label}
                </a>
              </li>
            ))}
            <li className="ml-5">
              <a
                href={ctaHref}
                className="dp-nav-cta"
                style={{ backgroundColor: heroAccentColor }}
              >
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* ── Section indicator dots ───────────────────────────────────────── */}
      <DotsIndicator count={sections.length + 1} mainRef={mainRef} />

      {/* ── Scroll container ─────────────────────────────────────────────── */}
      <main ref={mainRef} className="dp-main">
        {/* ══ HERO — original centered style ═══════════════════════════════ */}
        <section
          className="dp-section relative flex flex-col text-white overflow-hidden"
          style={{
            height: "100vh",
            backgroundColor: "#364b3b",
            maxHeight: "800px",
          }}
        >
          {/* Fixed parallax bg */}
          <div className="fixed inset-0 z-0">
            <img
              src={heroImgSrc}
              alt="Rainforest view with sunset"
              className="w-full h-full object-cover block"
            />
            <div
              className="dp-hero-overlay absolute inset-0"
              style={{
                background:
                  "radial-gradient(rgba(0,0,0,0.6) 70%, rgba(0,0,0,1))",
              }}
            />
          </div>

          {/* Centered hero text */}
          <div
            className="relative z-10 flex-grow flex items-center justify-center p-5"
            data-content
          >
            <div
              className="relative text-center flex flex-wrap justify-center items-center"
              style={{ textShadow: "0 0.1em 0.94rem rgba(0,0,0,0.25)" }}
            >
              {/* Footprint watermark behind text */}
              <img
                src={heroFootprintSrc}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none"
                style={{
                  width: "150%",
                  height: "150%",
                  objectFit: "contain",
                  opacity: 0.7,
                }}
              />
              <h1
                className="dp-anton dp-from-bottom text-white w-full z-10 m-0"
                style={{ fontSize: "clamp(3rem, 10vw, 6.875rem)" }}
              >
                {heroTitle.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p
                className="dp-from-bottom dp-sans text-white w-full z-10 mt-3 m-0"
                style={{ fontSize: "clamp(1rem, 2vw, 1.375rem)" }}
              >
                {heroSubtitle}
              </p>
            </div>
          </div>
        </section>

        {/* ══ CONTENT SECTIONS ══════════════════════════════════════════════ */}
        {sections.map((sec, idx) => {
          const imgLeft = sec.imgSide === "left";

          return (
            <section
              key={idx}
              className="dp-section relative flex flex-col overflow-hidden text-white"
              style={{ height: "100vh", backgroundColor: sec.bgColor }}
            >
              {/* Ghost number — visual texture only */}
              <span
                className="dp-ghost"
                style={{
                  bottom: "-0.08em",
                  [imgLeft ? "right" : "left"]: "-0.04em",
                }}
              >
                {sec.count}
              </span>

              {/* Two-column layout */}
              <div className="dp-grid flex-grow" data-content>
                {/* ── Text panel ────────────────────────────────── */}
                <div
                  className={[
                    "flex flex-col justify-center gap-7 px-8 md:px-16 py-20",
                    imgLeft ? "order-2" : "order-1",
                  ].join(" ")}
                >
                  {/* Zone label */}
                  <div
                    className={`dp-sans dp-from-${imgLeft ? "right" : "left"} text-[11px] tracking-[0.28em] uppercase font-medium`}
                    style={{ color: sec.accentColor }}
                  >
                    {sec.eyebrow}
                  </div>

                  {/* Title */}
                  <h2
                    className={`dp-anton dp-from-${imgLeft ? "right" : "left"} text-white m-0`}
                    style={{ fontSize: "clamp(3rem, 7.5vw, 7.5rem)" }}
                  >
                    {sec.title.split("\n").map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>

                  {/* Body text */}
                  <p
                    className={`dp-sans dp-from-${imgLeft ? "right" : "left"} text-white/50 font-light leading-loose m-0 max-w-[34ch]`}
                    style={{ fontSize: "0.975rem" }}
                  >
                    {sec.intro}
                  </p>

                  {/* CTA */}
                  <a
                    href={sec.linkHref}
                    className={`dp-btn dp-from-${imgLeft ? "right" : "left"} self-start`}
                    style={{
                      color: sec.accentColor,
                      borderColor: sec.accentColor,
                    }}
                  >
                    {sec.linkLabel}{" "}
                    <span style={{ fontSize: "1.1rem" }}>→</span>
                  </a>
                </div>

                {/* ── Dino panel ────────────────────────────────── */}
                <div
                  className={[
                    "relative flex items-end justify-center overflow-hidden",
                    imgLeft ? "order-1" : "order-2",
                  ].join(" ")}
                  style={{ minHeight: "38vh" }}
                >
                  {/* Accent radial wash behind illustration */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 80%, ${sec.accentColor}1a 0%, transparent 68%)`,
                    }}
                  />
                  <img
                    src={sec.imgSrc}
                    alt={sec.imgAlt}
                    className={`dp-from-${imgLeft ? "left" : "right"} relative z-10 select-none`}
                    style={{
                      width: "90%",
                      maxWidth: "500px",
                      height: "auto",
                      objectFit: "contain",
                      filter: `drop-shadow(0 0 80px ${sec.accentColor}55)`,
                    }}
                  />
                </div>
              </div>

              {/* Section counter */}
              <div className="dp-sans absolute bottom-7 right-8 text-white/20 text-[10px] tracking-[0.3em] uppercase z-10">
                {String(idx + 1).padStart(2, "0")} /{" "}
                {String(sections.length).padStart(2, "0")}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}

// ── DotsIndicator ──────────────────────────────────────────────────────────
// Fixed right-side position dots, one per section, active on intersection.
function DotsIndicator({ count, mainRef }) {
  const dotsRef = useRef(null);

  useEffect(() => {
    const container = mainRef.current;
    if (!container || !dotsRef.current) return;

    const dots = [...dotsRef.current.querySelectorAll(".dp-dot")];
    const sections = [...container.querySelectorAll("section")];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) {
            const idx = sections.indexOf(entry.target);
            dots.forEach((d, i) =>
              d.classList.toggle("dp-dot-active", i === idx),
            );
          }
        });
      },
      { root: container, threshold: 0.5 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [count]);

  return (
    <div ref={dotsRef} className="dp-dots" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="dp-dot" />
      ))}
    </div>
  );
}
