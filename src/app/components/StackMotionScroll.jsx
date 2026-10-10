"use client";

import { useEffect, useId, useRef } from "react";

// ─── StackMotionScroll ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images             array    [...]        Image URLs used by the intro grid and the stacks
// introTitle         string   "The Next…"  Big headline above the intro grid
// introHint          string   "Scroll…"    Small line with the animated chevron
// introCards         array    [...]        Cards rendered in the intro grid ({ title, subtitle, meta, description })
// sections           array    [...]        Stack sections ({ title, preset }) — preset is 1, 2 or 3
// cardsPerStack      number   27           How many cards each stack section contains
// bgColor            string   #000         Base page background
// gradientInner      string   rgb(52 33 56) Center color of the radial background gradient
// gradientOuter      string   rgb(0 0 0)   Edge color of the radial background gradient
// textColor          string   #ffffff      Global text color
// accentColors       array    [...]        Outline colors cycled across cards
// cardBg             string   rgba(...)    Card panel background
// cardInnerBg        string   rgb(41 27 41) Background behind the card text rows
// stackCardBg        string   rgba(...)    Card background inside the 3D stacks
// cardRadius         number   10           Card corner radius in px
// cardMaxWidth       number   255          Card max width in px
// cardMinWidth       number   150          Card min width in px
// perspective        number   1000         3D perspective depth in px
// scrollStart        string   "top center" ScrollTrigger start position for each stack
// scrollEnd          string   "+=150%"     ScrollTrigger end position for each stack
// scrub              boolean  true         Tie stack animation progress to scroll position
// staggerAmount      number   0.005        Per-card delay inside the stack timeline
// introBrightness    number   70           Brightness percentage of the intro grid (%)
// enableIntroScroll  boolean  true         Animate intro cards away on scroll
// enableSmoothScroll boolean  true         Load and run smooth scrolling
// smoothLerp         number   0.2          Smooth scroll interpolation (higher = snappier)
// showIntro          boolean  true         Render the intro section
// fontFamily         string   "'Chakra…'"  CSS font stack applied to the whole component
// displayFont        string   "'Orbitron…'" Font stack used for headings and the hero
// fontUrl            string   "https://…"  Stylesheet injected to load the two fonts
// hideScrollbars     boolean  true         Hide native scrollbars inside the component
// titleScale         number   1            Multiplier on every heading size
// showHero           boolean  true         Render the full-height title panel at the top
// heroTitle          string   "Stack…"     Hero headline
// heroSubtitle       string   "…"          Small line under the hero headline
// showOutro          boolean  true         Render the closing panel
// outroTitle         string   "End of…"    Closing headline
// outroLines         array    [...]        Rows of text that drift in the closing panel
// className          string   ""           Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_INTRO_CARDS = [
  {
    title: "AI Horizons",
    subtitle: "Beyond Human Limits",
    meta: "V1.0",
    description:
      "Explore the future where AI transforms imagination into reality.",
  },
  {
    title: "Tech Odyssey",
    subtitle: "Unveiling Tomorrow",
    meta: "V2.0",
    description:
      "Embark on a journey into the realm of cutting-edge technology reshaping our world.",
  },
  {
    title: "Digital Frontiers",
    subtitle: "Pushing Boundaries",
    meta: "V3.0",
    description:
      "Enter the realm where innovation meets possibility, shaping the future of humanity.",
  },
  {
    title: "AI Nexus",
    subtitle: "Bridging Realms",
    meta: "V4.0",
    description:
      "Dive into the interconnected world of AI, where algorithms shape human experience.",
  },
  {
    title: "AI Innovate",
    subtitle: "Pioneering Tomorrow",
    meta: "V5.0",
    description:
      "Join the forefront of innovation, where creativity meets computational intelligence.",
  },
  {
    title: "Signal Drift",
    subtitle: "Beyond Human Limits",
    meta: "V6.0",
    description:
      "Explore the future where machines transform imagination into reality.",
  },
  {
    title: "AI Frontier",
    subtitle: "Exploring New Horizons",
    meta: "V7.0",
    description:
      "Venture into uncharted territories towards unprecedented possibilities.",
  },
  {
    title: "AI Visionary",
    subtitle: "Envisioning Tomorrow",
    meta: "V8.0",
    description:
      "Embrace the visionary realm where dreams of the future become today.",
  },
  {
    title: "AI Odyssey",
    subtitle: "Journey to Tomorrow",
    meta: "V9.0",
    description: "Embark on an epic odyssey where innovation knows no bounds.",
  },
];

const DEFAULT_SECTIONS = [
  { title: "A New Frontier", preset: 1 },
  { title: "Chronicles of Circuitry", preset: 2 },
  { title: "Synthetica Sapiens", preset: 3 },
];

const DEFAULT_ACCENTS = [
  "#d09df2",
  "#9df2eb",
  "#f5e2a4",
  "#d09df2",
  "#9dcaf2",
  "#f29dcc",
];

const PRESETS = {
  1: {
    ease: "power1",
    transform:
      "rotate3d(1, 0, 0, -25deg) rotate3d(0, 1, 0, 50deg) rotate3d(0, 0, 1, 25deg)",
    from: (w, h, pos) => ({ z: -2.65 * w - pos * 0.03 * w }),
    to: (w, h, pos, total) => ({
      z: 1.4 * w + (total - pos - 1) * 0.03 * w,
    }),
    rotFrom: { rotationZ: -220 },
    rotTo: { rotationY: -30, rotationZ: 120 },
  },
  2: {
    ease: "sine.inOut",
    transform: "rotate3d(1, 0, 0, 55deg) rotate3d(0, 1, 0, 30deg)",
    from: (w, h, pos) => ({ z: -1.2 * h - pos * 0.08 * h }),
    to: (w, h, pos, total) => ({
      z: 3 * h + (total - pos - 1) * 0.08 * h,
    }),
    rotFrom: { rotationZ: -130 },
    rotTo: { rotationZ: 360 },
  },
  3: {
    ease: "power1",
    transform:
      "rotate3d(1, 0, 0, 25deg) rotate3d(0, 1, 0, -50deg) rotate3d(0, 0, 1, 25deg)",
    from: (w, h, pos) => ({ z: (-2.5 * w) / 2 - pos * 0.07 * w }),
    to: (w, h, pos, total) => ({
      z: 2.5 * w + (total - pos - 1) * 0.07 * w,
    }),
    rotFrom: { rotationZ: 10 },
    rotTo: { rotationX: 20, rotationZ: 280, yPercent: -100 },
  },
};

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

export default function StackMotionScroll({
  images = DEFAULT_IMAGES,
  introTitle = "The Next Evolution",
  introHint = "Scroll into the future",
  introCards = DEFAULT_INTRO_CARDS,
  sections = DEFAULT_SECTIONS,
  cardsPerStack = 27,
  bgColor = "#000000",
  gradientInner = "rgb(52 33 56)",
  gradientOuter = "rgb(0 0 0)",
  textColor = "#ffffff",
  accentColors = DEFAULT_ACCENTS,
  cardBg = "rgba(255, 255, 255, 0.2)",
  cardInnerBg = "rgb(41 27 41)",
  stackCardBg = "rgba(132, 128, 143, 0.36)",
  cardRadius = 10,
  cardMaxWidth = 255,
  cardMinWidth = 150,
  perspective = 1000,
  scrollStart = "top center",
  scrollEnd = "+=150%",
  scrub = true,
  staggerAmount = 0.005,
  introBrightness = 70,
  enableIntroScroll = true,
  enableSmoothScroll = true,
  smoothLerp = 0.2,
  showIntro = true,
  fontFamily = "'Chakra Petch', ui-monospace, SFMono-Regular, monospace",
  displayFont = "'Orbitron', 'Chakra Petch', ui-monospace, monospace",
  fontUrl = "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500&family=Orbitron:wght@400;500;700;900&display=swap",
  hideScrollbars = true,
  titleScale = 1,
  showHero = true,
  heroTitle = "Stack Protocol",
  heroSubtitle = "An archive in motion",
  showOutro = true,
  outroTitle = "End of Transmission",
  outroLines = ["signal lost", "archive sealed", "return to origin"],
  className = "",
}) {
  const uid = useId().replace(/[:]/g, "");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!fontUrl) return;
    if (document.querySelector(`link[data-id="${fontUrl}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-id", fontUrl);
    document.head.appendChild(link);
  }, [fontUrl]);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    const boot = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      );

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      const root = rootRef.current;
      if (cancelled || !gsap || !ScrollTrigger || !root) return;

      gsap.registerPlugin(ScrollTrigger);

      let lenis = null;
      let lenisTick = null;

      if (enableSmoothScroll) {
        try {
          const mod = await new Function("url", "return import(url)")(
            "https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm",
          );
          if (cancelled) return;
          const Lenis = mod.default || mod.Lenis;
          lenis = new Lenis({ lerp: smoothLerp });
          lenis.on("scroll", ScrollTrigger.update);
          lenisTick = (time) => lenis.raf(time * 1000);
          gsap.ticker.add(lenisTick);
          gsap.ticker.lagSmoothing(0);
        } catch (e) {
          lenis = null;
        }
      }

      let winsize = { width: window.innerWidth, height: window.innerHeight };
      const timelines = [];

      const buildStacks = () => {
        timelines.forEach((tl) => tl.kill());
        timelines.length = 0;

        root.querySelectorAll("[data-stack]").forEach((wrapEl) => {
          const preset =
            PRESETS[wrapEl.getAttribute("data-stack")] || PRESETS[1];
          const contentEl = wrapEl.querySelector("[data-stack-content]");
          if (!contentEl) return;

          const cards = Array.from(
            contentEl.querySelectorAll("[data-stack-card]"),
          );
          const total = cards.length;

          contentEl.style.transform = preset.transform;
          contentEl.style.opacity = 0;

          const tl = gsap
            .timeline({
              defaults: { ease: preset.ease },
              scrollTrigger: {
                trigger: wrapEl,
                start: scrollStart,
                end: scrollEnd,
                scrub,
                onEnter: () => gsap.set(contentEl, { opacity: 1 }),
                onEnterBack: () => gsap.set(contentEl, { opacity: 1 }),
                onLeave: () => gsap.set(contentEl, { opacity: 0 }),
                onLeaveBack: () => gsap.set(contentEl, { opacity: 0 }),
              },
            })
            .fromTo(
              cards,
              {
                z: (pos) =>
                  preset.from(winsize.width, winsize.height, pos, total).z,
              },
              {
                z: (pos) =>
                  preset.to(winsize.width, winsize.height, pos, total).z,
              },
              0,
            )
            .fromTo(
              cards,
              { ...preset.rotFrom },
              { ...preset.rotTo, stagger: staggerAmount },
              0,
            );

          timelines.push(tl);
        });
      };

      buildStacks();

      const introTweens = [];
      if (enableIntroScroll) {
        root.querySelectorAll("[data-intro-card]").forEach((card) => {
          introTweens.push(
            gsap.to(card, {
              ease: "power1.in",
              startAt: {
                transformOrigin: "100% 50%",
                filter: `brightness(${introBrightness}%)`,
              },
              rotationX: -60,
              yPercent: () => gsap.utils.random(-100, 0),
              z: () => gsap.utils.random(-100, 0),
              filter: "brightness(0%)",
              scrollTrigger: {
                trigger: card,
                start: "clamp(top bottom)",
                end: "clamp(bottom top)",
                scrub: true,
              },
            }),
          );
        });
      }

      const extraTweens = [];

      const heroEl = root.querySelector("[data-hero]");
      if (heroEl) {
        extraTweens.push(
          gsap.to(heroEl.querySelectorAll("[data-hero-layer]"), {
            yPercent: (i) => -30 - i * 25,
            opacity: 0,
            filter: "blur(6px)",
            ease: "none",
            stagger: 0.05,
            scrollTrigger: {
              trigger: heroEl,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }),
        );
      }

      const outroEl = root.querySelector("[data-outro]");
      if (outroEl) {
        extraTweens.push(
          gsap.fromTo(
            outroEl.querySelectorAll("[data-outro-line]"),
            { xPercent: (i) => (i % 2 === 0 ? -60 : 60), opacity: 0 },
            {
              xPercent: 0,
              opacity: 1,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: {
                trigger: outroEl,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          ),
        );
        extraTweens.push(
          gsap.fromTo(
            outroEl.querySelector("[data-outro-title]"),
            { scale: 0.7, opacity: 0, rotationX: 45 },
            {
              scale: 1,
              opacity: 1,
              rotationX: 0,
              ease: "none",
              scrollTrigger: {
                trigger: outroEl,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          ),
        );
      }

      let throttled = false;
      const onResize = () => {
        if (throttled) return;
        throttled = true;
        winsize = { width: window.innerWidth, height: window.innerHeight };
        buildStacks();
        ScrollTrigger.refresh();
        setTimeout(() => {
          throttled = false;
        }, 100);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        timelines.forEach((tl) => {
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.kill();
        });
        extraTweens.forEach((tw) => {
          if (tw.scrollTrigger) tw.scrollTrigger.kill();
          tw.kill();
        });
        introTweens.forEach((tw) => {
          if (tw.scrollTrigger) tw.scrollTrigger.kill();
          tw.kill();
        });
        if (lenisTick) gsap.ticker.remove(lenisTick);
        if (lenis) lenis.destroy();
      };
    };

    boot().catch(() => {});

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [
    uid,
    cardsPerStack,
    sections,
    scrollStart,
    scrollEnd,
    scrub,
    staggerAmount,
    introBrightness,
    enableIntroScroll,
    enableSmoothScroll,
    smoothLerp,
    showIntro,
    showHero,
    showOutro,
  ]);

  const accentFor = (i) => accentColors[i % accentColors.length];
  const imageFor = (i) => images[i % images.length];

  const cardShell = {
    borderRadius: `${cardRadius}px`,
    maxWidth: `${cardMaxWidth}px`,
    minWidth: `${cardMinWidth}px`,
  };

  return (
    <div
      ref={rootRef}
      className={`sms-root-${uid} relative w-full overflow-x-hidden ${className}`}
      style={{
        fontFamily,
        color: textColor,
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(circle, ${gradientInner} 0%, ${gradientOuter} 100%)`,
        backgroundAttachment: "fixed",
      }}
    >
      <style>
        {"@keyframes smsPulse" +
          uid +
          " { to { top: 120%; } } " +
          ".sms-hint-" +
          uid +
          "::after { content: '\\00BB'; position: absolute; top: 100%; left: 0; width: 100%; text-align: center; font-size: 1.6rem; transform: rotate(90deg); animation: smsPulse" +
          uid +
          " 0.3s linear alternate infinite; }" +
          (hideScrollbars
            ? " html, body { scrollbar-width: none; -ms-overflow-style: none; } " +
              "html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0; height: 0; display: none; } " +
              ".sms-root-" +
              uid +
              " { scrollbar-width: none; -ms-overflow-style: none; } " +
              ".sms-root-" +
              uid +
              " *::-webkit-scrollbar { width: 0; height: 0; display: none; }"
            : "")}
      </style>

      {showHero ? (
        <section
          data-hero
          className="relative flex h-screen w-full flex-col items-center justify-center px-6"
        >
          <span
            data-hero-layer
            className="mb-6 text-[0.6rem] uppercase tracking-[0.5em] opacity-60"
          >
            {heroSubtitle}
          </span>
          <h1
            data-hero-layer
            className="m-0 text-center uppercase leading-none"
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              letterSpacing: "0.02em",
              fontSize: `clamp(${1.6 * titleScale}rem, ${5 * titleScale}vw, ${4.5 * titleScale}rem)`,
            }}
          >
            {heroTitle}
          </h1>
          <div
            data-hero-layer
            className="mt-8 h-px w-24"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColors[0]}, transparent)`,
            }}
          />
        </section>
      ) : null}

      {showIntro ? (
        <div className="relative w-full px-6 md:px-8">
          <div className="relative z-10 flex h-[20vh] items-center justify-center md:h-[60vh] md:items-end">
            <h2
              className="m-0 text-center uppercase leading-none"
              style={{
                fontFamily: displayFont,
                fontWeight: 700,
                letterSpacing: "0.03em",
                fontSize: `clamp(${1.4 * titleScale}rem, ${4 * titleScale}vw, ${3.5 * titleScale}rem)`,
              }}
            >
              {introTitle}
            </h2>
          </div>

          <div
            className="relative -mt-[40vh] grid justify-center gap-12 md:-mt-[100vh] md:pt-[12vh]"
            style={{
              perspective: `${perspective}px`,
              gridTemplateColumns: "repeat(3, auto)",
              filter: `brightness(${introBrightness}%)`,
            }}
          >
            {introCards.map((card, i) => (
              <div
                key={i}
                data-intro-card
                className="relative grid aspect-[2/3] w-[30vw] items-stretch p-[5px] text-[9px] uppercase"
                style={{
                  ...cardShell,
                  outline: `1px solid ${accentFor(i)}`,
                  background: cardBg,
                  boxShadow: "0 2px 7px 0 rgba(0,0,0,0.8)",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateAreas:
                    "'card-img card-img' 'card-title card-meta' 'card-subtitle card-subtitle' 'card-desc card-desc'",
                }}
              >
                <div
                  className="aspect-square max-w-full bg-cover bg-center"
                  style={{
                    gridArea: "card-img",
                    backgroundColor: cardInnerBg,
                    backgroundImage: `url(${imageFor(i)})`,
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <h3
                  className="m-0 px-[3px] py-2"
                  style={{
                    gridArea: "card-title",
                    backgroundColor: cardInnerBg,
                  }}
                >
                  {card.title}
                </h3>
                <span
                  className="px-[3px] py-2 text-right"
                  style={{
                    gridArea: "card-meta",
                    backgroundColor: cardInnerBg,
                  }}
                >
                  {card.meta}
                </span>
                <h4
                  className="m-0 px-[3px] font-normal"
                  style={{
                    gridArea: "card-subtitle",
                    backgroundColor: cardInnerBg,
                  }}
                >
                  {card.subtitle}
                </h4>
                <p
                  className="m-0 px-[3px]"
                  style={{
                    gridArea: "card-desc",
                    backgroundColor: cardInnerBg,
                    borderRadius: "0 0 6px 6px",
                  }}
                >
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {sections.map((section, s) => (
        <div key={s}>
          <h2
            className="mx-auto mt-[25vh] grid w-full max-w-[600px] place-items-center text-center uppercase leading-none"
            style={{
              fontFamily: displayFont,
              fontWeight: 500,
              letterSpacing: "0.05em",
              fontSize: `clamp(${1.2 * titleScale}rem, ${3.4 * titleScale}vw, ${2.6 * titleScale}rem)`,
            }}
          >
            {section.title}
          </h2>

          <div className="relative min-h-screen">
            <div
              data-stack={section.preset}
              className="relative"
              style={{ perspective: `${perspective}px` }}
            >
              <div
                data-stack-content
                className="relative grid w-full place-items-center md:min-h-screen"
                style={{
                  transformStyle: "preserve-3d",
                  gridTemplateAreas: "'card'",
                  gridTemplateColumns: "100%",
                }}
              >
                {Array.from({ length: cardsPerStack }).map((_, i) => (
                  <div
                    key={i}
                    data-stack-card
                    className="relative grid aspect-[2/3] w-[30vw] items-stretch p-[5px]"
                    style={{
                      ...cardShell,
                      gridArea: "card",
                      outline: `1px solid ${accentFor(i)}`,
                      background: stackCardBg,
                    }}
                  >
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${imageFor(i)})`,
                        borderRadius: `${Math.max(cardRadius - 4, 0)}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {showOutro ? (
        <section
          data-outro
          className="relative mt-[30vh] flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6"
          style={{ perspective: `${perspective}px` }}
        >

          <div className="flex w-full max-w-[640px] flex-col items-center gap-3">
            {outroLines.map((line, i) => (
              <div
                key={i}
                data-outro-line
                className="flex w-full items-center gap-4 text-[0.6rem] uppercase tracking-[0.4em] opacity-70"
              >
                <span
                  className="h-px flex-1"
                  style={{ background: accentFor(i) }}
                />
                <span>{line}</span>
                <span
                  className="h-px flex-1"
                  style={{ background: accentFor(i) }}
                />
              </div>
            ))}
          </div>

          <h2
            data-outro-title
            className="m-0 mt-12 text-center uppercase leading-none"
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              letterSpacing: "0.02em",
              fontSize: `clamp(${1.3 * titleScale}rem, ${4.2 * titleScale}vw, ${3.2 * titleScale}rem)`,
            }}
          >
            {outroTitle}
          </h2>
        </section>
      ) : null}

      <div className="h-[15vh]" />
    </div>
  );
}
