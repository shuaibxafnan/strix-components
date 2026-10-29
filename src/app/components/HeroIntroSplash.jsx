"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Anton,
  Bebas_Neue,
  Jost,
  Lexend,
  Oswald,
  Poppins,
  PT_Serif,
  Titillium_Web,
} from "next/font/google";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-poppins",
});
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const jost = Jost({ subsets: ["latin"], style: ["italic"], weight: "600", variable: "--font-jost" });
const oswald = Oswald({ subsets: ["latin"], weight: "500", variable: "--font-oswald" });
const ptSerif = PT_Serif({ subsets: ["latin"], weight: "700", variable: "--font-pt-serif" });
const lexend = Lexend({ subsets: ["latin"], weight: "700", variable: "--font-lexend" });
const titillium = Titillium_Web({ subsets: ["latin"], weight: "400", variable: "--font-titillium" });

const FONT_VARIABLES = [bebas, poppins, anton, jost, oswald, ptSerif, lexend, titillium]
  .map((font) => font.variable)
  .join(" ");

const INTRO_FONT_SEQUENCE = [
  "var(--font-anton)",
  "var(--font-jost)",
  "var(--font-oswald)",
  "var(--font-pt-serif)",
  "var(--font-lexend)",
  "var(--font-titillium)",
  "var(--font-poppins)",
];

const DEFAULT_CLIP_PATH =
  "M0.648438 0.00390625 L0.296875 0.00390625 L0.0976562 0.15625 L-0.00390625 1.003906 L0.644531 1.003906 L0.820312 0.882812 ZM0.648438 0.00390625";

const Letters = ({ text }) =>
  text
    .trim()
    .split(/\s+/)
    .map((word, w) => (
      <Fragment key={w}>
        <span className="inline-flex">
          {[...word].map((char, i) => (
            <span key={i} data-letter className="inline-block">
              {char}
            </span>
          ))}
        </span>
        {"\u00a0"}
      </Fragment>
    ));

export default function HeroIntroSplash({
  navBrandLabel = "Studio",
  navBrandHref = "#",
  menuLabel = "Open menu",
  headlineText = "Build your board",
  introLoadingText = "Loading",
  introRedText = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  cursorLabel = "Hello",
  videoSrc = "https://www.pexels.com/download/video/12426854/",
  videoPoster = "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1740&q=80",
  figureClipPath = DEFAULT_CLIP_PATH,
  backgroundColor = "#000000",
  accentColor = "#ffffff",
  textColor = "#ffffff",
  headlineFontSize = "19vw",
  introFontSize = "3vw",
  navFontSize = "1vw",
  cursorFontSize = "1.5vw",
  introFontCycleDuration = 0.1,
  introScaleDuration = 1,
  titleAnimDuration = 1.5,
  titleAnimDelay = 0.6,
  titleStagger = 0.025,
  cursorMoveDuration = 0.5,
  className = "",
}) {
  const rootRef = useRef(null);
  const introRef = useRef(null);
  const introRedRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline();
      INTRO_FONT_SEQUENCE.forEach((font) => {
        intro.to(introRef.current, { fontFamily: font, duration: introFontCycleDuration });
      });
      intro
        .to(introRef.current, {
          scaleY: 0,
          duration: introScaleDuration,
          ease: "expo.inOut",
        })
        .to(
          introRedRef.current,
          { scaleY: 2, duration: introScaleDuration, ease: "expo.inOut" },
          `-=${introScaleDuration + 0.25}`,
        )
        .set(introRef.current, { display: "none" });

      gsap.set("[data-letter]", { y: "120%", scale: -0.5 });
      gsap.to("[data-letter]", {
        duration: titleAnimDuration,
        y: "10%",
        scale: 1,
        ease: "expo.inOut",
        delay: titleAnimDelay,
        stagger: titleStagger,
      });

      gsap.set(cursorRef.current, { scale: 0 });
    }, rootRef);

    return () => ctx.revert();
  }, [
    introFontCycleDuration,
    introScaleDuration,
    titleAnimDuration,
    titleAnimDelay,
    titleStagger,
  ]);

  const moveCursor = (e) =>
    gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0 });
  const showCursor = () =>
    gsap.to(cursorRef.current, {
      scale: 1,
      duration: cursorMoveDuration,
      ease: "expo.inOut",
    });
  const hideCursor = () =>
    gsap.to(cursorRef.current, {
      scale: 0,
      duration: cursorMoveDuration,
      ease: "expo.inOut",
    });

  const headlineClass =
    "absolute left-1/2 top-1/2 m-0 flex w-full items-center justify-center overflow-hidden text-center font-normal uppercase leading-[80%] tracking-[-0.75vw] text-[length:var(--headline-fs)] [font-family:var(--font-bebas)] [transform:translate(-50%,-50%)_scaleY(2)]";

  return (
    <main
      ref={rootRef}
      className={`${FONT_VARIABLES} flex w-full cursor-default select-none flex-col items-center justify-start overflow-x-clip bg-[var(--bg)] text-[var(--ink)] [font-family:var(--font-poppins)] ${className}`}
      style={{
        "--bg": backgroundColor,
        "--accent": accentColor,
        "--ink": textColor,
        "--headline-fs": headlineFontSize,
        "--intro-fs": introFontSize,
        "--nav-fs": navFontSize,
        "--cursor-fs": cursorFontSize,
      }}
    >
      <nav className="fixed left-1/2 top-0 z-[999] my-10 flex w-[calc(100%-80px)] -translate-x-1/2 items-center justify-between">
        <a
          href={navBrandHref}
          className="text-[length:var(--nav-fs)] font-semibold text-[var(--ink)] no-underline max-md:text-sm"
        >
          {navBrandLabel}
        </a>
      </nav>

      <section
        ref={introRef}
        className="fixed left-0 top-0 z-[1000] flex h-screen w-screen origin-top items-center justify-center bg-[var(--bg)] text-[length:var(--intro-fs)] [font-family:var(--font-poppins)]"
      >
        {introLoadingText}
        <div
          ref={introRedRef}
          className="absolute bottom-0 left-0 flex h-[30%] w-full origin-bottom scale-y-0 items-center justify-center overflow-hidden bg-[var(--accent)] text-center text-[30vw] font-black leading-[30vh] text-transparent [-webkit-text-stroke:1px_#000]"
        >
          <div className="[letter-spacing:-1vw] [transform:scaleX(0.5)_scaleY(1.5)]">
            {introRedText}
          </div>
        </div>
      </section>

      <section className="relative flex h-screen w-screen items-center justify-center">
        <div
          onMouseMove={moveCursor}
          onMouseEnter={showCursor}
          onMouseLeave={hideCursor}
          className="relative flex h-full w-full flex-col items-center justify-center"
        >
          <h1 className={`${headlineClass} z-[1]`}>
            <Letters text={headlineText} />
          </h1>

          <div
            aria-hidden="true"
            className={`${headlineClass} z-[3] text-transparent [-webkit-text-stroke:1px_var(--ink)]`}
          >
            <Letters text={headlineText} />
          </div>

          <figure className="absolute left-1/2 top-1/2 z-[2] m-0 aspect-square w-[40vw] p-0 [clip-path:url(#hero-figure-clip)] [transform:translate(-60%,-50%)_scaleX(-1)]">
            <video
              loop
              autoPlay
              muted
              playsInline
              src={videoSrc}
              poster={videoPoster}
              className="absolute left-1/2 top-1/2 h-screen w-screen max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
            />
          </figure>

          <video
            loop
            autoPlay
            muted
            playsInline
            src={videoSrc}
            poster={videoPoster}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <svg width="0" height="0" aria-hidden="true" className="absolute">
            <defs>
              <clipPath id="hero-figure-clip" clipPathUnits="objectBoundingBox">
                <path d={figureClipPath} />
              </clipPath>
            </defs>
          </svg>
        </div>
      </section>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[1000] flex aspect-[10/4] w-[6vw] items-center justify-center text-[length:var(--cursor-fs)] text-black [font-family:var(--font-anton)] [translate:-50%_-50%]"
      >
        {cursorLabel}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-[1] -rotate-[15deg] rounded-full bg-[var(--accent)]"
        />
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1001] h-full w-full opacity-[0.07]"
      >
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>
    </main>
  );
}