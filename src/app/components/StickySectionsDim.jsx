"use client";

import { useEffect, useId, useRef } from "react";

// ─── StickySectionsDim ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sections            array    (see DEFAULT_SECTIONS)  Sticky panels: { image, titleLead, title, text, bg }
// intro               string   long text               Large intro paragraph above the sticky stack
// outro               string   long text               Large outro paragraph below the sticky stack
// outroImage          string   img/1.png               Image shown under the outro text
// heroImage           string   img/1.png               Background image of the hero header
// heroTitleLead       string   "The"                   Light narrow first word of the hero heading
// heroTitle           string   "Denizens"              Heavy second word of the hero heading
// heroMeta            string   short line              Small line beside the hero heading
// showHero            boolean  true                    Render the hero header block
// showIntro           boolean  true                    Render the intro paragraph block
// showOutro           boolean  true                    Render the outro paragraph block
// fontFamily          string   system sans stack       Font stack for the whole component
// textColor           string   #fff                    Base text color
// bgColor             string   #12100e                 Page background color
// imageColumnWidth    string   "30%"                   Desktop width of the image grid column
// imageScale          string   "160%"                  Desktop image width inside its column (overflows by design)
// stickyOffset        number   0                       Sticky top offset in px (panels shrink to match)
// scrollLength        string   "+=100%"                ScrollTrigger end distance per panel
// dimBrightness       number   60                      Brightness % a panel animates to as it is scrolled past
// dimContrast         number   135                     Contrast % a panel animates to as it is scrolled past
// sectionYPercent     number   -15                     Vertical push (%) of the outgoing panel
// imageYPercent       number   -40                     Vertical drift (%) of the panel image
// imageRotation       number   -20                     Rotation (deg) of the panel image
// imageEase           string   "power1.in"             GSAP ease for the image motion
// keepLastSection     boolean  true                    Leave the final panel undimmed and unmoved
// smoothScroll        boolean  true                    Enable Lenis smooth scrolling
// lerp                number   0.2                     Lenis interpolation (lower = smoother)
// smoothWheel         boolean  true                    Lenis smooth scrolling for wheel events
// lenisUrl            string   jsdelivr lenis 1.1.20   CDN URL for Lenis
// clipOverflow        boolean  true                    Clip horizontal overflow via overflow-x:clip (never use hidden — it breaks sticky)
// showLoader          boolean  true                    Show the pulsing loader until images decode
// loaderColor         string   rgba(255,255,255,0.6)   Loader dot color
// className           string   ""                      Extra classes on the root wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMG = (n) =>
  `https://raw.githubusercontent.com/codrops/StickySections/main/img/${n}.png`;

const DEFAULT_SECTIONS = [
  {
    image: IMG(3),
    titleLead: "The",
    title: "Algorithm",
    text: "The algorithm's workings are shrouded in complexity, and its decision-making processes are inscrutable to the general populace.",
    bg: "#2f251e",
  },
  {
    image: IMG(2),
    titleLead: "The",
    title: "Dogma",
    text: "The digital gospel etched into the very code of the algorithmic society, served as the bedrock of the cognitive regime.",
    bg: "#43392f",
  },
  {
    image: IMG(1),
    titleLead: "The",
    title: "Architects",
    text: "The elusive entities, lacking human form, operate in the shadows, skillfully shaping societal norms through the complex interplay of algorithms and dogmas.",
    bg: "#2f251e",
  },
  {
    image: IMG(4),
    titleLead: "The",
    title: "Wasteland",
    text: "This overlooked realm, a consequence of algorithmic judgments, is a haunting landscape filled with the echoes of untold stories and uncharted thoughts.",
    bg: "#43392f",
  },
  {
    image: IMG(5),
    titleLead: "The",
    title: "Narrative",
    text: "The narrative unfolds as the omnipresent thread weaving through the fabric of the algorithmic society.",
    bg: "#2f251e",
  },
  {
    image: IMG(6),
    titleLead: "The",
    title: "Opulence",
    text: "Opulence epitomizes the cognitive elite's wealth in the algorithmic society, where opulent thoughts and experiences shape the societal narrative.",
    bg: "#43392f",
  },
];

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-id="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error(`Failed: ${src}`)),
        );
      }
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-id", src);
    el.onload = () => {
      el.dataset.loaded = "true";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

export default function StickySectionsDim({
  sections = DEFAULT_SECTIONS,
  intro = "As data conglomerates reveled in the opulence of cognitive wealth, a silent underclass manifested, condemned to the digital periphery.",
  outro = "Lost in perpetual dependency, inhabitants of the Synthetic Era found solace in cryptic simulations, where pain ebbed and cognitive loads momentarily lightened.",
  outroImage = IMG(1),
  heroImage = IMG(1),
  heroTitleLead = "The",
  heroTitle = "Denizens",
  heroMeta = "An exploration of the Synthetic Era.",
  showHero = true,
  showIntro = true,
  showOutro = true,
  fontFamily = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  textColor = "#fff",
  bgColor = "#12100e",
  imageColumnWidth = "30%",
  imageScale = "160%",
  stickyOffset = 0,
  scrollLength = "+=100%",
  dimBrightness = 60,
  dimContrast = 135,
  sectionYPercent = -15,
  imageYPercent = -40,
  imageRotation = -20,
  imageEase = "power1.in",
  keepLastSection = true,
  smoothScroll = true,
  lerp = 0.2,
  smoothWheel = true,
  lenisUrl = "https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js",
  clipOverflow = true,
  showLoader = true,
  loaderColor = "rgba(255,255,255,0.6)",
  className = "",
}) {
  const rootRef = useRef(null);
  const loaderRef = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let killed = false;
    let lenis = null;
    let rafId = null;
    const triggers = [];

    const hideLoader = () => {
      if (loaderRef.current) loaderRef.current.style.opacity = "0";
      window.setTimeout(() => {
        if (loaderRef.current) loaderRef.current.style.display = "none";
      }, 400);
    };

    const preload = () => {
      const root = rootRef.current;
      if (!root) return Promise.resolve();
      return Promise.all(
        [...root.querySelectorAll("img")].map(
          (img) =>
            new Promise((res) => {
              if (img.complete) {
                res();
                return;
              }
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
        ),
      );
    };

    const run = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      );
      if (smoothScroll) {
        try {
          await loadScript(lenisUrl);
        } catch (e) {
          console.warn("[StickySectionsDim] Lenis unavailable:", e.message);
        }
      }
      if (killed) return;

      const { gsap, ScrollTrigger } = window;
      const Lenis = window.Lenis || (window.lenis && window.lenis.default);
      if (!gsap || !ScrollTrigger || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      await preload();
      if (killed) return;
      hideLoader();

      if (smoothScroll && Lenis) {
        lenis = new Lenis({ lerp, smoothWheel });
        lenis.on("scroll", () => ScrollTrigger.update());
        const frame = (time) => {
          if (killed) return;
          lenis.raf(time);
          rafId = requestAnimationFrame(frame);
        };
        rafId = requestAnimationFrame(frame);
      }

      const panels = [
        ...rootRef.current.querySelectorAll(`[data-sticky="${uid}"]`),
      ];

      panels.forEach((el, i) => {
        const isLast = keepLastSection && i === panels.length - 1;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: scrollLength,
            scrub: true,
          },
        });
        triggers.push(tl.scrollTrigger);

        tl.to(
          el,
          {
            ease: "none",
            startAt: { filter: "brightness(100%) contrast(100%)" },
            filter: isLast
              ? "none"
              : `brightness(${dimBrightness}%) contrast(${dimContrast}%)`,
            yPercent: isLast ? 0 : sectionYPercent,
          },
          0,
        ).to(
          el.querySelector(`[data-sticky-img="${uid}"]`),
          {
            ease: imageEase,
            yPercent: imageYPercent,
            rotation: imageRotation,
          },
          0,
        );
      });

      ScrollTrigger.refresh();
    };

    run().catch((e) => {
      hideLoader();
      console.error("[StickySectionsDim]", e.message);
    });

    return () => {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      triggers.forEach((t) => t && t.kill());
      if (lenis && lenis.destroy) lenis.destroy();
    };
  }, [
    uid,
    sections,
    scrollLength,
    dimBrightness,
    dimContrast,
    sectionYPercent,
    imageYPercent,
    imageRotation,
    imageEase,
    keepLastSection,
    smoothScroll,
    lerp,
    smoothWheel,
    lenisUrl,
  ]);

  const s = `[data-root="${uid}"]`;

  const css = `
    ${s} { font-family: ${fontFamily}; -webkit-font-smoothing: antialiased; }

    ${s} .ss-lead {
      font-style: normal;
      font-weight: 300;
      letter-spacing: -0.02em;
    }

    ${s} .ss-heading {
      margin: 0;
      line-height: 0.9;
      text-transform: uppercase;
      margin-left: -0.065em;
      font-size: clamp(2.5rem, 12vw, 7rem);
      letter-spacing: -0.105em;
      font-weight: 900;
      font-stretch: expanded;
    }

    ${s} .ss-title {
      grid-area: content-title;
      margin: 0;
      letter-spacing: -0.095em;
      text-transform: uppercase;
      line-height: 1;
      font-weight: 900;
      font-stretch: expanded;
      font-size: clamp(2rem, 6vw, 5rem);
    }

    ${s} .ss-text {
      grid-area: content-text;
      margin: 0;
      max-width: 500px;
      text-align: center;
      line-height: 1.5;
      padding: 0 1rem;
      backface-visibility: hidden;
    }

    ${s} .ss-large {
      font-size: clamp(1.5rem, 5vw, 3rem);
      max-width: 900px;
      margin: 0 0 0.85em 0;
      line-height: 1.2;
      font-weight: 500;
    }

    ${s} .ss-panel {
      display: grid;
      overflow: hidden;
      column-gap: 5vw;
      row-gap: 2vh;
      align-content: center;
      justify-items: center;
      grid-template-areas: "content-img" "content-title" "content-text";
    }

    ${s} .ss-img-wrap {
      grid-area: content-img;
      width: 60%;
      max-width: 300px;
    }

    ${s} .ss-img-wrap img { width: 100%; height: auto; display: block; }

    ${s} .ss-frame {
      padding: var(--ss-pad-${uid});
      position: relative;
      display: grid;
      width: 100%;
      row-gap: 1rem;
      column-gap: 2rem;
      justify-items: start;
      text-transform: uppercase;
      font-size: 12px;
    }

    ${s} .ss-hero {
      height: 100%;
      background-size: auto 80%;
      background-position: 120% 50%;
      background-repeat: no-repeat;
      grid-template-areas: "heading";
    }

    ${s} .ss-hero-inner {
      grid-area: heading;
      align-self: center;
      justify-self: start;
      width: min-content;
      display: flex;
      flex-direction: column;
      margin-top: 10vh;
    }

    ${s} .ss-hero-inner p { margin: 0; }

    @keyframes ssLoader${uid} {
      to { opacity: 1; transform: scale3d(0.5, 0.5, 1); }
    }

    ${s} .ss-loader-dot {
      animation: ssLoader${uid} 0.7s linear infinite alternate forwards;
    }

    @media screen and (min-width: 63em) {
      ${s} { --ss-pad-${uid}: 2rem 3rem; }

      ${s} .ss-hero { height: 100vh; }
      ${s} .ss-hero-inner { margin-top: 0; }
      ${s} .ss-hero-inner .ss-heading { white-space: nowrap; }
      ${s} .ss-hero-inner p { margin: 0 0 0 auto; }

      ${s} .ss-panel {
        grid-template-areas: "content-img content-title" "content-img content-text";
        grid-template-columns: ${imageColumnWidth} 1fr;
        justify-items: start;
      }

      ${s} .ss-title { align-self: end; }

      ${s} .ss-text { text-align: left; align-self: start; }

      ${s} .ss-img-wrap {
        width: ${imageScale};
        max-width: none;
        justify-self: end;
      }
    }
  `;

  return (
    <div
      ref={rootRef}
      data-root={uid}
      className={`relative w-full ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        overflowX: clipOverflow ? "clip" : "visible",
        ["--ss-pad-" + uid]: "1.5rem",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {showLoader ? (
        <div
          ref={loaderRef}
          className="fixed inset-0 z-[5000] grid place-items-center transition-opacity duration-300"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="ss-loader-dot h-[60px] w-[60px] rounded-full opacity-40"
            style={{ backgroundColor: loaderColor }}
          />
        </div>
      ) : null}

      {showHero ? (
        <header
          className="ss-frame ss-hero z-[3000]"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="ss-hero-inner">
            <h2 className="ss-heading">
              <span className="ss-lead">{heroTitleLead}</span> {heroTitle}
            </h2>
            <p>{heroMeta}</p>
          </div>
        </header>
      ) : null}

      {showIntro ? (
        <div
          className="z-[2] flex flex-col items-center justify-center pb-[25vh] pt-[25vh]"
          style={{ padding: `25vh var(--ss-pad-${uid})` }}
        >
          <p className="ss-large">{intro}</p>
        </div>
      ) : null}

      <div className="relative w-full">
        {sections.map((item, i) => (
          <div
            key={i}
            data-sticky={uid}
            className="ss-panel sticky w-screen"
            style={{
              padding: `var(--ss-pad-${uid})`,
              top: `${stickyOffset}px`,
              height: `calc(100vh - ${stickyOffset}px)`,
              backgroundColor: item.bg,
            }}
          >
            <div className="ss-img-wrap">
              <img
                data-sticky-img={uid}
                src={item.image}
                alt=""
                draggable="false"
                className="select-none"
              />
            </div>
            <h2 className="ss-title">
              {item.titleLead ? (
                <span className="ss-lead">{item.titleLead} </span>
              ) : null}
              {item.title}
            </h2>
            <p className="ss-text">{item.text}</p>
          </div>
        ))}
      </div>

      {showOutro ? (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            padding: `50vh var(--ss-pad-${uid}) 30vh`,
          }}
        >
          <p className="ss-large">{outro}</p>
          {outroImage ? (
            <img
              src={outroImage}
              alt=""
              draggable="false"
              className="mt-[20vh] h-auto w-1/2 max-w-[300px] select-none"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
