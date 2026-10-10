"use client";

import { useEffect, useId, useRef } from "react";

// ─── ScrollFilterEffect ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items            array    ITEMS          Full item definitions (see shape below)
// bgColor          string   #000           Page background
// bgAltColor       string   hsl(15 55% 6%) Intro gradient / header tint
// textColor        string   #fff           Base text color
// titleColor       string   #e93f33        Intro headline color
// introTitle       string   On-Scroll…     Intro headline text
// introSub         string   ""             Line beneath the headline
// introInfo        string   Scroll…        Small hint line at the bottom of the intro
// showIntro        boolean  true           Render the intro screen at all
// scrollStart      string   clamp(top bottom-=10%)  ScrollTrigger start per item
// scrollEnd        string   +=40%          ScrollTrigger end per item
// imageScale       number   1.2            End scale of circle-masked images
// pathImageScale   number   1              End scale of path-masked images
// brightnessFrom   number   100            Starting image brightness (%)
// brightnessTo     number   150            Ending image brightness (%)
// titleSize        string   clamp(2rem,15vw,9rem)  Desktop title font size
// titleGap         string   1em            Gap between the two title halves
// textOpacity      number   0.5            Opacity of the body caption
// itemSpacing      string   30vmax         Vertical gap between items
// cardsTitle       string   Keep exploring Heading above the closing card row
// cards            array    CARDS          Closing cards: { title, src }
// cardColumns      number   3              Card columns on desktop
// cardRadius       string   7px            Card corner radius
// cardBrightness   number   0.8            Card image brightness multiplier
// showCards        boolean  true           Render the closing card row
// credits          string   Built as a…    Closing line at the very bottom
// showCredits      boolean  true           Render the closing line
// lerp             number   0.1            Lenis smoothing (lower = smoother)
// smoothScroll     boolean  true           Enable Lenis smooth scrolling
// className        string   ""             Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const ITEMS = [
  {
    titleUp: "Foot",
    titleDown: "Print",
    text: "As darkness cloaked the forsaken city, the crew huddled together, their eyes darting nervously into the murky abyss.",
    src: "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&q=80",
    width: 896,
    height: 1344,
    layout: 1,
    mask: "circle",
    rFinal: 820,
    baseFrequency: 0.03,
    numOctaves: 3,
    scale: 50,
  },
  {
    titleUp: "Storm",
    titleDown: "Born",
    text: "The skies above were tinged with an otherworldly hue, casting an eerie glow on the jagged rock formations below.",
    src: "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1200&q=80",
    width: 1000,
    height: 450,
    layout: 2,
    mask: "circle",
    rFinal: 950,
    baseFrequency: 0.1,
    numOctaves: 1,
    scale: 100,
    dilate: 2,
  },
  {
    titleUp: "Hind",
    titleDown: "Sight",
    text: "The forbidden planet was not merely an ancient world lost to time — it was a prison, a gateway to realms beyond their understanding. They had unwittingly set loose a force that threatened not only their lives but the very fabric of the universe itself. The desert planet, a riddle waiting to be unraveled, held its secrets close, leaving the crew with a lingering sense of awe and dread.",
    src: "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1200&q=80",
    width: 1000,
    height: 560,
    layout: 3,
    mask: "path",
    dInitial: "M 0 280 Q 500 280 1000 280 Q 500 280 0 280",
    dFinal: "M 0 280 Q 500 800 1000 280 Q 500 -200 0 280",
    baseFrequency: 0.02,
    numOctaves: 3,
    scale: 80,
  },
  {
    titleUp: "Heart",
    titleDown: "Ache",
    text: "Sandstorms raged across the barren landscape, their fury obscuring the horizon and leaving a veil of gritty particles that stung the skin. The sun, a distant orb of fiery intensity, cast an unforgiving glare that scorched the land.",
    src: "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1200&q=80",
    width: 1400,
    height: 560,
    layout: 4,
    mask: "circle",
    rFinal: 770,
    baseFrequency: 0.5,
    numOctaves: 1,
    scale: 50,
  },
  {
    titleUp: "Night",
    titleDown: "Fall",
    text: "From the shadows, strange shapes began to emerge, haunting figures that seemed to materialize from the very fabric of the night.",
    src: "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1200&q=80",
    width: 680,
    height: 920,
    layout: 5,
    mask: "circle",
    rFinal: 580,
    baseFrequency: 0.1,
    numOctaves: 3,
    scale: 150,
  },
  {
    titleUp: "Fire",
    titleDown: "Storm",
    text: "Visions of a vibrant world, once teeming with life, flickered in her mind's eye, only to be devoured by the relentless sands of time.",
    src: "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1200&q=80",
    width: 1000,
    height: 1000,
    layout: 6,
    mask: "circle",
    rFinal: 720,
    baseFrequency: 0.01,
    numOctaves: 3,
    scale: 150,
    blur: 10,
  },
  {
    titleUp: "Star",
    titleDown: "Light",
    text: "The desert world had claimed another fragment of history, another chapter buried beneath the sands of oblivion.",
    src: "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80",
    width: 1400,
    height: 560,
    layout: 7,
    mask: "circle",
    rFinal: 770,
    baseFrequency: 0.03,
    numOctaves: 1,
    scale: 120,
    imageScale: 1,
  },
];

const CARDS = [
  {
    title: "Displacement as Transition",
    src: "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Reading Motion in Type",
    src: "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Panels, Pins, and Pacing",
    src: "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  },
];

const LAYOUT_CSS = {
  1: {
    areas: "'title-up img ...' 'text img title-down'",
    columns: "30% auto 30%",
    rows: "1fr 1fr",
    extra: "column-gap:2vw;",
    img: "height:auto;width:100%;max-width:100%;max-height:100vh;",
    up: "justify-self:end;align-self:start;",
    down: "justify-self:start;align-self:end;",
    text: "max-width:250px;text-align:right;justify-self:end;align-self:end;",
  },
  2: {
    areas: "'title-up ...' 'img img' 'text title-down'",
    columns: "auto auto",
    rows: "auto auto auto",
    extra: "justify-content:center;row-gap:3vh;",
    img: "width:60vw;",
    up: "justify-self:start;align-self:start;",
    down: "justify-self:end;align-self:start;margin-top:-0.1em;",
    text: "align-self:start;justify-self:start;max-width:400px;",
  },
  3: {
    areas: "'title-up img title-down' 'text text text'",
    columns: "20vw auto 20vw",
    rows: "auto auto",
    extra:
      "row-gap:10vh;column-gap:2vw;justify-content:center;align-content:center;",
    img: "width:30vw;align-self:center;",
    up: "justify-self:end;align-self:center;",
    down: "justify-self:start;align-self:center;",
    text: "column-count:2;column-gap:4vw;max-width:590px;text-align:justify;",
  },
  4: {
    areas: "'title-up' 'img' 'title-down' 'text'",
    columns: "1fr",
    rows: "auto auto auto auto",
    extra: "width:100%;justify-content:center;row-gap:4vh;",
    img: "width:100%;align-self:center;",
    up: "justify-self:center;align-self:start;",
    down: "justify-self:center;align-self:end;",
    text: "text-align:center;max-width:400px;margin-top:3rem;",
  },
  5: {
    areas: "'title-up img ...' 'text img title-down'",
    columns: "30% auto 30%",
    rows: "1fr 1fr",
    extra: "column-gap:3vw;",
    img: "height:auto;width:100%;max-width:100%;max-height:100vh;",
    up: "justify-self:end;align-self:start;",
    down: "justify-self:start;align-self:end;",
    text: "max-width:250px;text-align:right;justify-self:end;align-self:end;",
  },
  6: {
    areas: "'title-up img' 'title-down img' 'text img'",
    columns: "1fr 50%",
    rows: "auto auto 1fr",
    extra: "column-gap:3vw;row-gap:0;",
    img: "max-width:100%;",
    up: "justify-self:end;align-self:start;",
    down: "justify-self:end;align-self:start;",
    text: "max-width:250px;justify-self:end;align-self:end;text-align:right;",
  },
  7: {
    areas:
      "'img img img img' '... text title-up ...' '... text title-down ...'",
    columns: "10vw 1fr 1fr 10vw",
    rows: "auto auto auto",
    extra: "width:100%;justify-content:center;row-gap:4vh;",
    img: "width:100%;align-self:center;",
    up: "justify-self:start;align-self:start;",
    down: "justify-self:start;align-self:end;",
    text: "max-width:250px;justify-self:start;align-self:start;text-align:right;",
  },
};

export default function ScrollFilterEffect({
  items = ITEMS,
  bgColor = "#000",
  bgAltColor = "hsl(15deg 55% 6%)",
  textColor = "#fff",
  titleColor = "#e93f33",
  introTitle = "On-Scroll Filter Effect",
  introSub = "",
  introInfo = "Scroll moderately to fully experience the animations",
  showIntro = true,
  scrollStart = "clamp(top bottom-=10%)",
  scrollEnd = "+=40%",
  imageScale = 1.2,
  pathImageScale = 1,
  brightnessFrom = 100,
  brightnessTo = 150,
  titleSize = "clamp(2rem,15vw,9rem)",
  titleGap = "1em",
  textOpacity = 0.5,
  itemSpacing = "30vmax",
  cardsTitle = "Keep exploring",
  cards = CARDS,
  cardColumns = 3,
  cardRadius = "7px",
  cardBrightness = 0.8,
  showCards = true,
  credits = "Built as a study in scroll-driven SVG filters",
  showCredits = true,
  lerp = 0.1,
  smoothScroll = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const scope = "sfx-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let killed = false;
    let lenis = null;
    let rafId = null;
    const created = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    const run = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      );
      await Promise.all([
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
        ),
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        ),
      ]);
      if (smoothScroll) {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
        );
      }
      if (killed || !rootRef.current) return;

      const { gsap, Flip, ScrollTrigger, Lenis } = window;
      if (!gsap || !Flip || !ScrollTrigger) return;
      gsap.registerPlugin(Flip, ScrollTrigger);

      const root = rootRef.current;

      if (smoothScroll && Lenis) {
        lenis = new Lenis({ lerp, smoothWheel: true });
        lenis.on("scroll", () => ScrollTrigger.update());
        const scrollFn = (time) => {
          if (killed) return;
          lenis.raf(time);
          rafId = requestAnimationFrame(scrollFn);
        };
        rafId = requestAnimationFrame(scrollFn);
      }

      const wraps = Array.from(root.querySelectorAll("[data-wrap]"));

      wraps.forEach((wrap) => {
        const titleWrap = wrap.querySelector("[data-title-wrap]");
        const titleUp = wrap.querySelector("[data-title-up]");
        const titleDown = wrap.querySelector("[data-title-down]");
        const target = wrap.querySelector("[data-layout]");
        const maskEl = wrap.querySelector("[data-mask]");
        const imageEl = wrap.querySelector("image");
        if (!titleWrap || !target || !maskEl || !imageEl) return;

        const state = Flip.getState([titleUp, titleDown]);
        target.prepend(titleUp, titleDown);

        const isCircle = maskEl.tagName.toLowerCase() === "circle";
        const override = wrap.getAttribute("data-image-scale");
        const endScale =
          override !== null
            ? parseFloat(override)
            : isCircle
              ? imageScale
              : pathImageScale;

        const flip = Flip.from(state, { ease: "none", simple: true })
          .fromTo(
            maskEl,
            {
              attr: isCircle
                ? { r: maskEl.getAttribute("r") }
                : { d: maskEl.getAttribute("d") },
            },
            {
              ease: "none",
              attr: isCircle
                ? { r: maskEl.getAttribute("data-value-final") }
                : { d: maskEl.getAttribute("data-value-final") },
            },
            0,
          )
          .fromTo(
            imageEl,
            {
              transformOrigin: "50% 50%",
              filter: "brightness(" + brightnessFrom + "%)",
            },
            {
              ease: "none",
              scale: endScale,
              filter: "brightness(" + brightnessTo + "%)",
            },
            0,
          );

        const st = ScrollTrigger.create({
          trigger: titleWrap,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
          animation: flip,
        });

        created.push({ st, flip });
      });

      ScrollTrigger.refresh();
      root.setAttribute("data-ready", "true");
    };

    run().catch(() => {});

    return () => {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      created.forEach(({ st, flip }) => {
        st.kill();
        flip.kill();
      });
      if (lenis && lenis.destroy) lenis.destroy();
    };
  }, [
    items,
    lerp,
    smoothScroll,
    scrollStart,
    scrollEnd,
    imageScale,
    pathImageScale,
    brightnessFrom,
    brightnessTo,
  ]);

  const s = "." + scope + " ";

  let css =
    s +
    "[data-wrap]{display:grid;place-items:center;grid-template-areas:'main';}" +
    s +
    "[data-content]{grid-area:main;display:grid;place-items:center;line-height:1.2;grid-template-areas:'content';}" +
    s +
    "[data-wrap] [data-content]:first-child{height:100vh;}" +
    s +
    "[data-layout]{grid-template-areas:'title-up title-down' 'img img' 'text text';grid-template-columns:1fr 1fr;gap:1rem;}" +
    s +
    "[data-img]{grid-area:img;max-width:50%;height:auto;}" +
    s +
    "[data-title-wrap]{display:flex;gap:" +
    titleGap +
    ";align-items:center;justify-content:center;}" +
    s +
    "[data-title]{padding-top:0.3em;line-height:0.525;font-size:2rem;font-weight:300;position:relative;z-index:100;text-indent:-0.1em;}" +
    s +
    "[data-title-up]{grid-area:title-up;font-style:italic;}" +
    s +
    "[data-title-down]{grid-area:title-down;font-weight:500;}" +
    s +
    "[data-text]{grid-area:text;text-transform:uppercase;margin:0;opacity:" +
    textOpacity +
    ";}" +
    "@media screen and (min-width:53em){" +
    s +
    "[data-title]{font-size:" +
    titleSize +
    ";}" +
    s +
    "[data-wrap]:not(:last-child){margin-bottom:" +
    itemSpacing +
    ";}" +
    s +
    "[data-img]{max-width:none;}" +
    s +
    "[data-cards]{grid-template-columns:repeat(" +
    cardColumns +
    ",minmax(0,250px));}";

  Object.keys(LAYOUT_CSS).forEach((key) => {
    const L = LAYOUT_CSS[key];
    const sel = s + '[data-layout="' + key + '"]';
    css +=
      sel +
      "{grid-template-areas:" +
      L.areas +
      ";grid-template-columns:" +
      L.columns +
      ";grid-template-rows:" +
      L.rows +
      ";" +
      L.extra +
      "}" +
      sel +
      " [data-img]{" +
      L.img +
      "}" +
      sel +
      " [data-title-up]{" +
      L.up +
      "}" +
      sel +
      " [data-title-down]{" +
      L.down +
      "}" +
      sel +
      " [data-text]{" +
      L.text +
      "}";
  });

  css += "}";

  return (
    <div
      ref={rootRef}
      className={
        "w-full overflow-x-hidden antialiased " + scope + " " + className
      }
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {showIntro && (
        <div
          className="mb-[30vh] grid h-screen place-items-center text-center"
          style={{
            background:
              "linear-gradient(0deg, transparent, " + bgAltColor + ")",
          }}
        >
          <h1 className="m-0 mt-[15vh] grid place-items-center font-normal leading-[0.9]">
            <span
              className="text-[clamp(2rem,10vw,5rem)] font-light"
              style={{ color: titleColor }}
            >
              {introTitle}
            </span>
            {introSub ? (
              <span className="my-4 text-2xl">{introSub}</span>
            ) : null}
          </h1>
        </div>
      )}

      {items.map((item, i) => {
        const filterId = scope + "-filter-" + i;
        const maskId = scope + "-mask-" + i;
        return (
          <div
            key={i}
            data-wrap
            {...(item.imageScale !== undefined
              ? { "data-image-scale": item.imageScale }
              : {})}
          >
            <div data-content>
              <div data-title-wrap>
                <span data-title data-title-up>
                  {item.titleUp}
                </span>
                <span data-title data-title-down>
                  {item.titleDown}
                </span>
              </div>
            </div>
            <div data-content data-layout={item.layout}>
              <svg
                data-img
                width={item.width}
                height={item.height}
                viewBox={"0 0 " + item.width + " " + item.height}
                xmlns="http://www.w3.org/2000/svg"
                style={{ aspectRatio: item.width + " / " + item.height }}
              >
                <defs>
                  <filter id={filterId}>
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency={item.baseFrequency}
                      numOctaves={item.numOctaves}
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      result="displacement"
                      scale={item.scale}
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                    {item.dilate ? (
                      <feMorphology
                        operator="dilate"
                        radius={item.dilate}
                        result="morph"
                        in="displacement"
                      />
                    ) : null}
                    {item.blur ? (
                      <feGaussianBlur
                        in="displacement"
                        stdDeviation={item.blur}
                      />
                    ) : null}
                  </filter>
                  <mask id={maskId}>
                    {item.mask === "circle" ? (
                      <circle
                        data-mask
                        cx="50%"
                        cy="50%"
                        r="0"
                        data-value-final={item.rFinal}
                        fill="white"
                        style={{ filter: "url(#" + filterId + ")" }}
                      />
                    ) : (
                      <path
                        data-mask
                        d={item.dInitial}
                        data-value-final={item.dFinal}
                        fill="white"
                        style={{ filter: "url(#" + filterId + ")" }}
                      />
                    )}
                  </mask>
                </defs>
                <image
                  href={item.src}
                  width={item.width}
                  height={item.height}
                  preserveAspectRatio="xMidYMid slice"
                  mask={"url(#" + maskId + ")"}
                />
              </svg>
              <p data-text>{item.text}</p>
            </div>
          </div>
        );
      })}

      {showCards && (
        <div className="grid place-items-center px-4">
          <h2 className="mt-[40vh] text-center text-2xl font-light">
            {cardsTitle}
          </h2>
          <div
            data-cards
            className="mt-[5vh] grid grid-cols-[minmax(0,250px)] gap-8"
          >
            {cards.map((card, i) => (
              <div key={i} className="w-full">
                <div
                  className="block h-auto w-full bg-cover bg-center"
                  style={{
                    backgroundImage: 'url("' + card.src + '")',
                    aspectRatio: "4 / 3",
                    borderRadius: cardRadius,
                    filter: "brightness(" + cardBrightness + ")",
                  }}
                />
                <h3 className="mt-3 text-base font-light leading-snug opacity-70">
                  {card.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCredits && (
        <p className="mx-auto mb-[50vh] mt-[50vh] text-center text-2xl opacity-70">
          {credits}
        </p>
      )}
    </div>
  );
}
