"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// ─── ScrollStory ──────────────────────────────────────────────────────────────
//
// A full-page scroll-driven story layout. Each section alternates between
// "left" (text overlaps left, image right) and "right" (image left, text right).
// Requires: npm install gsap   (v3.12+ — ScrollSmoother is free since GSAP 3.12)
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sections            array    DEFAULT_SECTIONS   Story cards (see shape below)
// smoothness          number   3                  ScrollSmoother lag (1=instant, 5=heavy)
// bgColor             string   "#0C141D"          Page background
// textColor           string   "#ffffff"          Heading + body text
// accentColor         string   "#6bb0e4"          Play-button SVG fill
// showPlayButton      bool     true               Show/hide the SVG play circle
// imageOpacity        number   0.6                Image opacity (0–1)
// headerSpeed         number   1.25               data-speed for text parallax (>1 = slower)
// imageParallaxSpeed  string   "auto"             data-speed for image ("auto" or e.g. "0.8")
// maxWidth            string   "1024px"           Content column max-width
// sectionPaddingY     string   "8em"              Top/bottom padding per section
// fontFamily          string   "Roboto"           Body font (Google Fonts name)
// headingFont         string   "Bebas Neue"       Display font (Google Fonts name)
// linkColor           string   "#ffffff"          Attribution link color
// attributionText     string   "Images from..."   Footer credit (set "" to hide)
// attributionHref     string   "#"                Attribution link href
// ──────────────────────────────────────────────────────────────────────────
//
// sections[] item shape:
//   {
//     id:       string           — unique React key
//     layout:   "left"|"right"   — "left": text left / image right
//                                  "right": image left / text right
//     heading:  string
//     body:     string           — optional paragraph
//     imageSrc: string           — image URL
//     imageAlt: string
//   }
// ──────────────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const DEFAULT_SECTIONS = [
  {
    id: "s1",
    layout: "left",
    heading: "Våg å lytte, våg å skifte mening",
    body: "Jerky pastrami strip steak pork chuck. Biltong boudin burgdoggen shankle, short ribs short loin drumstick corned beef rump ribeye filet mignon pork chop.",
    imageSrc: "https://ensigndev.no/playground/ensign/wp-content/uploads/2022/04/pic1-1.jpg",
    imageAlt: "Story image one",
  },
  {
    id: "s2",
    layout: "right",
    heading: "Førsteinntrykket er viktig, andreinntrykket er riktig!",
    body: "",
    imageSrc: "https://ensigndev.no/playground/ensign/wp-content/uploads/2022/04/pic2-1.jpg",
    imageAlt: "Story image two",
  },
  {
    id: "s3",
    layout: "left",
    heading: "Mennesker med diagnoser møter motstand",
    body: "Picanha fatback venison capicola shoulder prosciutto tri-tip flank doner jerky bacon. Short ribs pastrami sausage swine, spare ribs ham sirloin prosciutto.",
    imageSrc: "https://ensigndev.no/playground/ensign/wp-content/uploads/2022/04/pic4.jpg",
    imageAlt: "Story image three",
  },
  {
    id: "s4",
    layout: "right",
    heading: "En sann historie",
    body: "Bacon ipsum dolor amet short ribs flank tongue beef porchetta t-bone. Burgdoggen porchetta shoulder, beef ribs kielbasa pork belly drumstick.",
    imageSrc: "https://ensigndev.no/playground/ensign/wp-content/uploads/2022/04/pic3-1.jpg",
    imageAlt: "Story image four",
  },
];

// ── PlayIcon ─────────────────────────────────────────────────────────────────
// SVG play-circle rendered over every image block.
// accentColor is a runtime prop → must use inline style, not Tailwind.
function PlayIcon({ accentColor }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 104.761 104.76"
      className="absolute z-[3] w-[104px] h-[104px]"
    >
      <g data-name="Group 2">
        <path data-name="Rectangle 7" fill="#fff" d="M17.38 20.88h63v62h-63z" />
        <path
          data-name="Path 1"
          // accentColor changes at runtime → inline style required
          fill={accentColor}
          d="M52.38-.002a52.38 52.38 0 1 0 52.38 52.38A52.38 52.38 0 0 0 52.38-.002ZM38.11 26.819a6.284 6.284 0 0 1 3.148.8l33.577 19.432a6.1 6.1 0 0 1 0 10.577l-33.577 19.47a6.054 6.054 0 0 1-9.024-5.372v-38.78a6.079 6.079 0 0 1 5.876-6.128Z"
        />
      </g>
    </svg>
  );
}

// ── StorySection ──────────────────────────────────────────────────────────────
function StorySection({ section, showPlayButton, accentColor, imageOpacity, headerSpeed, imageParallaxSpeed }) {
  const isLeft = section.layout === "left";

  return (
    // .wrapper class injects maxWidth + sectionPaddingY from the parent <style> block
    <section className="ss-wrapper">
      <article
        className={[
          "grid grid-cols-1",
          // Desktop: 5-equal-column grid, all items share row 1 for overlap
          "md:grid-cols-[repeat(5,1fr)]",
        ].join(" ")}
      >
        {/* ── Text header ── */}
        <header
          // data-speed is read by ScrollSmoother directly off the DOM — not CSS
          data-speed={headerSpeed}
          className={[
            "z-[2] uppercase",
            // left layout: cols 1–3, anchored to the bottom of the row
            // right layout: cols 4–end, anchored to the center
            isLeft
              ? "md:[grid-column:1/4] md:self-end"
              : "md:[grid-column:4/-1] md:self-center",
            "md:[grid-row:1/2]",
          ].join(" ")}
        >
          <h2
            className="m-0 leading-none tracking-[.5rem]"
            // clamp() font-size cannot be a static Tailwind utility → inline style
            // headingFont is injected via Google Fonts in the parent <style> tag
            style={{ fontSize: "clamp(2em, 5vw, 6em)" }}
          >
            {section.heading}
          </h2>
          {section.body && (
            <p className="mt-4 text-sm leading-relaxed uppercase">
              {section.body}
            </p>
          )}
        </header>

        {/* ── Image block ── */}
        <div
          className={[
            "relative flex justify-center items-center",
            isLeft ? "md:[grid-column:2/-1]" : "md:[grid-column:1/5]",
            "md:[grid-row:1/2]",
          ].join(" ")}
        >
          {/*
            overflow-hidden clips the taller inner div during parallax travel.
            height:100% + inner height:120% gives ScrollSmoother room to pan.
          */}
          <div className="h-full overflow-hidden">
            <div style={{ height: "120%" }}>
              <img
                // data-speed="auto" lets ScrollSmoother calculate parallax travel
                // based on the oversized height automatically
                data-speed={imageParallaxSpeed}
                src={section.imageSrc}
                alt={section.imageAlt}
                className="block max-w-full"
                // imageOpacity is a runtime prop (0–1 float) → inline style
                style={{ opacity: imageOpacity }}
              />
            </div>
          </div>
          {showPlayButton && <PlayIcon accentColor={accentColor} />}
        </div>
      </article>
    </section>
  );
}

// ── ScrollStory (default export) ──────────────────────────────────────────────
export default function ParallaxShowcase({
  sections = DEFAULT_SECTIONS,
  smoothness = 3,
  bgColor = "#0C141D",
  textColor = "#ffffff",
  accentColor = "#6bb0e4",
  showPlayButton = false,
  imageOpacity = 0.6,
  headerSpeed = 1.25,
  imageParallaxSpeed = "auto",
  maxWidth = "1024px",
  sectionPaddingY = "8em",
  fontFamily = "Roboto",
  headingFont = "Bebas Neue",
  linkColor = "#ffffff",
  attributionText = "Images from Unsplash by John Arano",
  attributionHref = "https://unsplash.com/@johnarano",
}) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    // Create ScrollSmoother — must run client-side only (no SSR)
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: smoothness,   // prop-controlled lag
      effects: true,        // enables data-speed on child elements
    });

    // Kill instance on unmount to prevent duplicate smoothers on HMR
    return () => smoother.kill();
  }, [smoothness]);

  return (
    <>
      {/*
        Runtime CSS:
        - Google Fonts import (headingFont + fontFamily are props, not static strings)
        - .smooth-wrapper / .smooth-content: ScrollSmoother's required DOM structure
          (position:fixed + overflow:hidden) — cannot use Tailwind, conflicts with
          the global layout when applied as utilities
        - .ss-wrapper: section padding/maxWidth driven by props
        - attribution link style: linkColor is a runtime prop
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, "+")}:wght@400&family=${fontFamily.replace(/ /g, "+")}:wght@400&display=swap');

        .ss-smooth-wrapper {
          overflow: hidden;
          position: fixed;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
        }
        .ss-smooth-content {
          overflow: visible;
          width: 100%;
        }
        .ss-wrapper {
          max-width: ${maxWidth};
          margin: 0 auto;
          padding: ${sectionPaddingY} 2em;
        }
        .ss-attribution a {
          color: ${linkColor};
          text-decoration: none;
          padding-bottom: 3px;
          border-bottom: 1px solid ${linkColor};
        }
        .ss-attribution a:hover {
          opacity: 0.8;
        }
        /* h2 inside StorySection inherits the heading font loaded above */
        .ss-smooth-wrapper h2 {
          font-family: '${headingFont}', cursive;
        }
        /* body text font */
        .ss-smooth-wrapper {
          font-family: '${fontFamily}', sans-serif;
        }
      `}</style>

      {/*
        bgColor + textColor are runtime props → inline styles.
        ScrollSmoother REQUIRES two specific wrapper/content divs with refs.
        The "fixed + overflow:hidden" wrapper is what enables smooth scroll
        without a custom scroll container hack.
      */}
      <div
        ref={wrapperRef}
        className="ss-smooth-wrapper"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div ref={contentRef} className="ss-smooth-content">

          {sections.map((section) => (
            <StorySection
              key={section.id}
              section={section}
              showPlayButton={showPlayButton}
              accentColor={accentColor}
              imageOpacity={imageOpacity}
              headerSpeed={headerSpeed}
              imageParallaxSpeed={imageParallaxSpeed}
            />
          ))}

          {attributionText && (
            <div className="ss-attribution flex justify-center items-center py-[8em]">
              <small>
                <a href={attributionHref} target="_blank" rel="noreferrer">
                  {attributionText}
                </a>
              </small>
            </div>
          )}

        </div>
      </div>
    </>
  );
}