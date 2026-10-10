"use client";

import { useEffect, useRef } from "react";

const DEFAULT_CLIP_PATH =
  "M0.648438 0.00390625 L0.296875 0.00390625 L0.0976562 0.15625 L-0.00390625 1.003906 L0.644531 1.003906 L0.820312 0.882812 ZM0.648438 0.00390625";

const INTRO_FONT_SEQUENCE = [
  "Anton",
  "Jost",
  "Alkatra",
  "Nova Oval",
  "Oswald",
  "PT Serif",
  "Lexend",
  "Poppins",
  "Titillium Web",
];

export default function HeroIntroSplash({
  // Content
  navBrandLabel = "Lorem ipsum",
  navBrandHref = "#",
  headlineText = "Build your board",
  introLoadingText = "Loading",
  introRedText = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  cursorLabel = "Hello",

  // Media
  videoSrc = "https://www.paulrogerdev.fr/codepen/pexels-artem-podrez-4832087-1280x720-30fps.mp4",
  videoPoster = "https://images.unsplash.com/photo-1494253188410-ff0cdea5499e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
  noiseUrl = "https://www.paulrogerdev.fr/codepen/noise.png",

  // Clip path
  figureClipPath = DEFAULT_CLIP_PATH,
  clipPathId = "svgClipPath",

  // Colors — runtime prop values, kept as inline styles
  backgroundColor = "#000",
  accentColor = "#f21010",
  textColor = "#fff",

  // Typography — runtime font strings, kept as inline styles
  displayFont = "'Bebas Neue', sans-serif",
  bodyFont = "'Poppins', sans-serif",
  cursorFont = "'Anton', sans-serif",

  // Sizes — vw-based strings, must stay inline
  headlineFontSize = "19vw",
  introFontSize = "3vw",
  navFontSize = "1vw",
  cursorFontSize = "1.5vw",

  // Animation
  introFontCycleDuration = 0.1,
  introScaleDuration = 1,
  titleAnimDuration = 1.5,
  titleAnimDelay = 0.6,
  titleStagger = 0.025,
  cursorMoveDuration = 0.5,

  // Callbacks
  onHamburgerClick = null,

  className = "",
}) {
  const introRef = useRef(null);
  const introRedRef = useRef(null);
  const h1Ref = useRef(null);
  const strokeRef = useRef(null);
  const cursorRef = useRef(null);
  const clipInnerRef = useRef(null);

  // Inject Google Fonts once
  useEffect(() => {
    const hrefs = [
      "https://fonts.googleapis.com/css2?family=Alkatra&family=Anton&family=Bebas+Neue&family=Jost:ital,wght@1,600&family=Lexend:wght@700&family=Nova+Oval&family=Oswald:wght@500&family=PT+Serif:wght@700&family=Titillium+Web&display=swap",
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap",
    ];
    hrefs.forEach((href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    let gsapCtx;
    let mouseMoveHandler, mouseEnterHandler, mouseLeaveHandler;

    function separateWordsAndLetters(el) {
      if (!el) return [];
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map(
          (word) =>
            `<div style="display:inline-flex;">${word
              .split("")
              .map((ch) => `<span style="display:inline-block">${ch}</span>`)
              .join("")}</div>&nbsp;`,
        )
        .join("");
      return Array.from(el.querySelectorAll("span"));
    }

    (async () => {
      const gsapMod = await import("gsap");
      const gsap = gsapMod.gsap ?? gsapMod.default;

      gsapCtx = gsap.context(() => {
        // INTRO — font glitch then collapse
        const introTL = gsap.timeline();
        INTRO_FONT_SEQUENCE.forEach((font) => {
          introTL.to(introRef.current, introFontCycleDuration, {
            fontFamily: font,
          });
        });
        introTL
          .to(introRef.current, introScaleDuration, {
            scaleY: 0,
            ease: "expo.inOut",
          })
          .to(
            introRedRef.current,
            introScaleDuration,
            { scaleY: 2, ease: "expo.inOut" },
            `-=${introScaleDuration + 0.25}`,
          );

        // TITLE letters
        const h1Letters = separateWordsAndLetters(h1Ref.current);
        const strokeLetters = separateWordsAndLetters(strokeRef.current);

        gsap.set(h1Letters, { y: "120%", scale: -0.5 });
        gsap.to(h1Letters, {
          duration: titleAnimDuration,
          y: "10%",
          scale: 1,
          ease: "expo.inOut",
          delay: titleAnimDelay,
          stagger: titleStagger,
        });

        gsap.set(strokeLetters, { y: "120%", scale: -0.5 });
        gsap.to(strokeLetters, {
          duration: titleAnimDuration,
          y: "10%",
          scale: 1,
          ease: "expo.inOut",
          delay: titleAnimDelay,
          stagger: titleStagger,
        });

        // CURSOR
        const cursor = cursorRef.current;
        const clipInner = clipInnerRef.current;
        if (cursor && clipInner) {
          mouseMoveHandler = (e) => {
            gsap.to(cursor, { duration: 0, x: e.clientX, y: e.clientY });
          };
          mouseEnterHandler = () => {
            gsap.to(cursor, cursorMoveDuration, {
              scale: 1,
              ease: "expo.inOut",
            });
          };
          mouseLeaveHandler = () => {
            gsap.to(cursor, cursorMoveDuration, {
              scale: 0,
              ease: "expo.inOut",
            });
          };
          clipInner.addEventListener("mousemove", mouseMoveHandler);
          clipInner.addEventListener("mouseenter", mouseEnterHandler);
          clipInner.addEventListener("mouseleave", mouseLeaveHandler);
        }
      });
    })();

    return () => {
      gsapCtx?.revert();
      const el = clipInnerRef.current;
      if (el) {
        if (mouseMoveHandler)
          el.removeEventListener("mousemove", mouseMoveHandler);
        if (mouseEnterHandler)
          el.removeEventListener("mouseenter", mouseEnterHandler);
        if (mouseLeaveHandler)
          el.removeEventListener("mouseleave", mouseLeaveHandler);
      }
    };
  }, [
    introFontCycleDuration,
    introScaleDuration,
    titleAnimDuration,
    titleAnimDelay,
    titleStagger,
    cursorMoveDuration,
  ]);

  return (
    <main
      className={`flex flex-col items-center justify-start w-full overflow-x-hidden select-none cursor-default ${className}`}
      style={{ backgroundColor, color: textColor, fontFamily: bodyFont }}
    >
      {/* ── NAV ── */}
      <nav
        className="fixed z-[999] top-0 left-1/2 -translate-x-1/2 flex justify-between items-center"
        style={{ width: "calc(100% - 80px)", margin: "40px 0" }}
      >
        {/* Brand */}
        <a
          href={navBrandHref}
          className="no-underline font-semibold"
          style={{
            fontSize: navFontSize,
            color: textColor,
            fontFamily: bodyFont,
          }}
        >
          {navBrandLabel}
        </a>

        {/* Hamburger */}
        <button
          onClick={onHamburgerClick}
          className="flex flex-col justify-center items-center gap-[5px] w-[50px] h-[50px] rounded-full border-0 cursor-pointer bg-white shrink-0"
          aria-label="Open menu"
        >
          <div className="w-1/2 h-[2px] bg-[#111]" />
          <div className="w-1/2 h-[2px] bg-[#111]" />
          <div className="w-1/2 h-[2px] bg-[#111]" />
        </button>
      </nav>

      {/* ── INTRO ── */}
      <section
        ref={introRef}
        className="fixed z-[1000] top-0 left-0 w-screen h-screen flex justify-center items-center origin-top"
        style={{
          backgroundColor,
          fontSize: introFontSize,
          fontFamily: bodyFont,
        }}
      >
        {introLoadingText}

        {/* Red accent bar */}
        <div
          ref={introRedRef}
          className="absolute bottom-0 left-0 w-full h-[30%] flex justify-center items-center overflow-hidden text-center origin-bottom scale-y-0 font-black leading-[30vh] text-transparent"
          style={{
            backgroundColor: accentColor,
            fontFamily: bodyFont,
            fontSize: "30vw",
            WebkitTextStroke: "1px #222",
          }}
        >
          <div
            style={{
              transform: "scaleX(0.5) scaleY(1.5)",
              letterSpacing: "-1vw",
            }}
          >
            {introRedText}
          </div>
        </div>
      </section>

      {/* ── CLIP SECTION ── */}
      <section className="relative w-screen h-screen flex justify-center items-center">
        <div
          ref={clipInnerRef}
          className="relative flex flex-col justify-center items-center w-full h-full"
        >
          {/* H1 — overflow:hidden clips the letter-reveal animation */}
          <h1
            ref={h1Ref}
            className="absolute z-[1] top-1/2 left-1/2 w-full text-center m-0 uppercase flex justify-center items-center overflow-hidden"
            style={{
              fontFamily: displayFont,
              fontSize: headlineFontSize,
              fontWeight: 400,
              letterSpacing: "-.75vw",
              lineHeight: "80%",
              transform: "translate(-50%, -50%) scaleY(2)",
            }}
          >
            {headlineText}
          </h1>

          {/* Stroke duplicate */}
          <div
            ref={strokeRef}
            className="absolute z-[3] top-1/2 left-1/2 w-full text-center m-0 uppercase flex justify-center items-center overflow-hidden text-transparent"
            style={{
              fontFamily: displayFont,
              fontSize: headlineFontSize,
              fontWeight: 400,
              letterSpacing: "-.75vw",
              lineHeight: "80%",
              transform: "translate(-50%, -50%) scaleY(2)",
              WebkitTextStroke: `1px ${textColor}`,
            }}
          >
            {headlineText}
          </div>

          {/* Clipped video figure */}
          <figure
            className="absolute z-[2] m-0 p-0"
            style={{
              top: "50%",
              left: "50%",
              width: "40vw",
              aspectRatio: "1/1",
              transform: "translate(-60%, -50%) scaleX(-1)",
              clipPath: `url(#${clipPathId})`,
            }}
          >
            <video
              loop
              autoPlay
              muted
              playsInline
              poster={videoPoster}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </figure>

          {/* Full-bleed background video */}
          <video
            loop
            autoPlay
            muted
            playsInline
            poster={videoPoster}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* SVG clip-path definition */}
          <svg width="0" height="0" aria-hidden="true" className="absolute">
            <defs>
              <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                <path d={figureClipPath} />
              </clipPath>
            </defs>
          </svg>
        </div>
      </section>

      {/* ── CUSTOM CURSOR ── */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[1000] flex justify-center items-center pointer-events-none text-black"
        style={{
          width: "6vw",
          aspectRatio: "10/4",
          fontFamily: cursorFont,
          fontSize: cursorFontSize,
          transform: "translate(-50%, -50%) scale(0)",
        }}
      >
        {cursorLabel}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-[1] rounded-full -rotate-[15deg]"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* ── NOISE OVERLAY ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1001] w-screen h-screen pointer-events-none"
        style={{ backgroundImage: `url("${noiseUrl}")` }}
      />
    </main>
  );
}
