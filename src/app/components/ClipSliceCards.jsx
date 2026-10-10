"use client";

import { useEffect, useId, useMemo, useRef } from "react";

// ─── ClipPathHoverCards ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// cards            object[]  (12 defaults)  Entries: { src, date, title, link }
// images           string[]  (25 defaults)  Fallback URL pool when cards omit src
// configs          object[]  (4 defaults)   Per-row slice settings, cycled every 3 cards
// cardsPerConfig   number    3              How many cards share one config
// title            string[]  [Station, Updates]  Big heading words, empty array to hide
// subtitle         string    ++ Each row …  Line under the heading, empty to hide
// linkLabel        string    Read the article    Default label for the card link
// bgColor          string    #0c0b10        Page background
// textColor        string    rgba(255,255,255,0.95)  Body text color
// accentColor      string    rgb(124 20 244 / 90%)   Link and date-marker color
// accentHover      string    rgb(94 54 176 / 75%)    Link hover color
// dateBoxColor     string    rgb(96 56 178 / 48%)    Fill of the square before the date
// borderColor      string    rgba(177,177,177,0.3)   Grid and card borders
// bodyFont         string    (monospace stack)       Font for everything
// baseFontSize     string    12px           Root size the rem values scale from
// titleSize        string    clamp(2rem,8.5vw,8rem)  Big heading size
// cardTitleSize    string    clamp(1.5rem,5vw,2.5rem) Card heading size
// cardMinHeight    string    60vh           Minimum card height
// cardPadding      string    4vw            Inner padding of each card
// gridColumns      number    3              Columns above the wide breakpoint
// brightness       number    0.6            Brightness filter on the slices
// scrambleChars    string    (a–z + symbols) Character pool for the text scramble
// scrambleRepeat   number    3              How many times each char re-rolls
// scrambleSpeed    number    0.03           Duration of one scramble step (s)
// scrambleDelay    number    0.05           Delay between scramble steps (s)
// enableScramble   boolean   true           Scramble the text on hover
// breakpoint       string    60em           Min-width for the multi-column grid
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
];

const DEFAULT_CARDS = [
  { date: "02/18/2074", title: "Code CR-4519: Anomaly Detection in Array" },
  {
    date: "02/20/2074",
    title: "Case Log 3X-782: Malfunction Analysis of Drone Units",
  },
  {
    date: "03/17/2074",
    title: "Code CR-3037: Data Flow Optimization for Transmission",
  },
  {
    date: "05/05/2074",
    title: "Code CR-9892: Investigation of Neural Network Anomalies",
  },
  {
    date: "06/22/2074",
    title: "Maintenance Report 4B-678: Robotic Limb Performance Enhancement",
  },
  {
    date: "07/02/2074",
    title:
      "Maintenance Report 9A-814: Diagnostics and Repair of Com Link 3C-12",
  },
  {
    date: "08/14/2074",
    title: "Maintenance Report 7Y-246: Optimal Efficiency of ES Cells",
  },
  {
    date: "09/30/2074",
    title: "Case Log 2Z-115: Cybersecurity Breach Detection",
  },
  {
    date: "12/08/2074",
    title: "Case Log 6W-421: Resolving Power Surge Incidents in Subsystems",
  },
  { date: "01/01/2075", title: "Incidence Report 2X-112: Station Uproar" },
  {
    date: "01/26/2075",
    title: "Case Log 7S-336: Malfunction Analysis of Harvest Units",
  },
  { date: "12/08/2074", title: "Case Log 2M-446: Solar Relay Optimization" },
];

const DEFAULT_CONFIGS = [
  {
    orientation: "vertical",
    slicesTotal: 5,
    duration: 0.5,
    ease: "power3.inOut",
  },
  {
    orientation: "vertical",
    slicesTotal: 15,
    duration: 0.5,
    ease: "power3.inOut",
  },
  {
    orientation: "horizontal",
    slicesTotal: 5,
    duration: 0.6,
    ease: "expo.inOut",
  },
  {
    orientation: "horizontal",
    slicesTotal: 15,
    duration: 0.6,
    ease: "expo.inOut",
  },
];

const DEFAULT_SCRAMBLE = "abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,";

const SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js",
];

export default function ClipSliceCards({
  cards = DEFAULT_CARDS,
  images = DEFAULT_IMAGES,
  configs = DEFAULT_CONFIGS,
  cardsPerConfig = 3,
  title = ["Station", "Updates"],
  subtitle = "++ Each row of cards has a different image slice configuration ++",
  linkLabel = "Read the article",
  bgColor = "#0c0b10",
  textColor = "rgba(255,255,255,0.95)",
  accentColor = "rgb(124 20 244 / 90%)",
  accentHover = "rgb(94 54 176 / 75%)",
  dateBoxColor = "rgb(96 56 178 / 48%)",
  borderColor = "rgba(177,177,177,0.3)",
  bodyFont = 'ui-monospace, "Courier New", monospace',
  baseFontSize = "12px",
  titleSize = "clamp(2rem, 8.5vw, 8rem)",
  cardTitleSize = "clamp(1rem, 3vw, 2rem)",
  cardMinHeight = "60vh",
  cardPadding = "4vw",
  gridColumns = 3,
  brightness = 0.6,
  scrambleChars = DEFAULT_SCRAMBLE,
  scrambleRepeat = 3,
  scrambleSpeed = 0.03,
  scrambleDelay = 0.05,
  enableScramble = true,
  breakpoint = "60em",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `cph-${uid}`;

  const rootRef = useRef(null);

  const model = useMemo(
    () =>
      cards.map((card, i) => ({
        src: card.src || images[i % images.length],
        date: card.date,
        title: card.title,
        link: card.link || linkLabel,
        config: configs[Math.floor(i / cardsPerConfig) % configs.length],
      })),
    [cards, images, configs, cardsPerConfig, linkLabel],
  );

  const css = `
.${scope} { font-size: ${baseFontSize}; color: ${textColor}; background-color: ${bgColor}; font-family: ${bodyFont}; text-transform: uppercase; -webkit-font-smoothing: antialiased; }
.${scope} .cph-title { font-weight: 400; font-size: ${titleSize}; text-align: center; margin: 14vh auto 5vh; display: flex; justify-content: center; gap: 0.25em; width: min-content; border-bottom: 1px solid ${borderColor}; }
.${scope} .cph-title span::first-letter { opacity: 0.5; }
.${scope} .cph-subtitle { text-align: center; margin: 0; }
.${scope} .cph-grid { display: grid; margin: 10vh 0; grid-template-columns: 1fr; border-top: 1px solid ${borderColor}; }
.${scope} .cph-card { display: grid; grid-template-rows: auto 1fr auto; cursor: pointer; position: relative; min-height: ${cardMinHeight}; padding: ${cardPadding}; overflow: hidden; border-bottom: 1px solid ${borderColor}; }
.${scope} .cph-img, .${scope} .cph-img-wrap, .${scope} .cph-img-inner { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.${scope} .cph-img, .${scope} .cph-img-inner { background-size: cover; background-position: 50% 50%; }
.${scope} .cph-img, .${scope} .cph-img-wrap { overflow: hidden; }
.${scope} .cph-img { pointer-events: none; opacity: 0; --columns: 0; --rows: 0; }
.${scope} .cph-img-inner { filter: brightness(${brightness}); width: calc(100% + (var(--columns) - 1) * 1px); height: calc(100% + (var(--rows) - 1) * 1px); }
.${scope} .cph-date { display: flex; align-content: center; align-items: center; line-height: 1; position: relative; }
.${scope} .cph-date::before { content: ''; width: 15px; height: 15px; flex: none; border: 1px solid ${accentColor}; background: ${dateBoxColor}; margin: 0 10px 4px 0; }
.${scope} .cph-card-title { font-weight: 400; font-size: ${cardTitleSize}; margin: 0; }
.${scope} .cph-link { position: relative; color: ${accentColor}; text-decoration: none; justify-self: start; }
.${scope} .cph-link:hover { color: ${accentHover}; }
.${scope} .cph-link::before { content: '+'; margin-right: 10px; }
.${scope} .cph-char { display: inline-block; position: relative; }
@media screen and (min-width: ${breakpoint}) {
  .${scope} .cph-grid { grid-template-columns: repeat(${gridColumns}, 1fr); }
  .${scope} .cph-card:nth-child(${gridColumns}n - 1) { border-left: 1px solid ${borderColor}; border-right: 1px solid ${borderColor}; }
}
`;

  useEffect(() => {
    let killed = false;
    const cleanups = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-id="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") resolve();
          else {
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
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

    const boot = async () => {
      for (const src of SCRIPTS) await loadScript(src);
      if (killed || !rootRef.current) return;

      const { gsap, imagesLoaded } = window;
      if (!gsap || !imagesLoaded) return;
      gsap.config({ trialWarn: false });

      const root = rootRef.current;
      const cardEls = [...root.querySelectorAll(".cph-card")];

      cardEls.forEach((cardEl, index) => {
        const cfg = model[index].config;
        const isVertical = cfg.orientation === "vertical";
        const total = cfg.slicesTotal;

        const img = cardEl.querySelector(".cph-img");
        const imgWrap = cardEl.querySelector(".cph-img-wrap");
        const slices = [...cardEl.querySelectorAll(".cph-img-inner")];

        img.style.setProperty(isVertical ? "--columns" : "--rows", total);

        slices.forEach((slice, position) => {
          const a1 = (position * 100) / total;
          const b1 = (position * 100) / total + 100 / total;

          gsap.set(slice, {
            clipPath: isVertical
              ? `polygon(${a1}% 0%, ${b1}% 0%, ${b1}% 100%, ${a1}% 100%)`
              : `polygon(0% ${a1}%, 100% ${a1}%, 100% ${b1}%, 0% ${b1}%)`,
          });
          gsap.set(slice, { [isVertical ? "left" : "top"]: position * -1 });
        });

        const chars = [...cardEl.querySelectorAll(".cph-char")];

        const shuffle = (list) => {
          if (!enableScramble) return;
          list.forEach((char) => {
            gsap.killTweensOf(char);
            gsap.fromTo(
              char,
              { opacity: 0 },
              {
                duration: scrambleSpeed,
                innerHTML: () =>
                  scrambleChars[
                    Math.floor(Math.random() * scrambleChars.length)
                  ],
                repeat: scrambleRepeat,
                repeatRefresh: true,
                opacity: 1,
                repeatDelay: scrambleDelay,
                onComplete: () =>
                  gsap.set(char, {
                    innerHTML: char.dataset.initial,
                    delay: scrambleSpeed,
                  }),
              },
            );
          });
        };

        const axis = isVertical ? "yPercent" : "xPercent";

        const onEnter = () => {
          shuffle(chars);

          gsap
            .timeline({ defaults: { duration: cfg.duration, ease: cfg.ease } })
            .addLabel("start", 0)
            .fromTo(
              img,
              { [axis]: 100, opacity: 0 },
              { [axis]: 0, opacity: 1 },
              "start",
            )
            .fromTo(imgWrap, { [axis]: -100 }, { [axis]: 0 }, "start")
            .fromTo(
              slices,
              {
                [axis]: (pos) =>
                  pos % 2
                    ? gsap.utils.random(-75, -25)
                    : gsap.utils.random(25, 75),
              },
              { [axis]: 0 },
              "start",
            );
        };

        const onLeave = () => {
          gsap
            .timeline({ defaults: { duration: cfg.duration, ease: cfg.ease } })
            .addLabel("start", 0)
            .to(img, { [axis]: 100, opacity: 0 }, "start")
            .to(imgWrap, { [axis]: -100 }, "start")
            .to(
              slices,
              {
                [axis]: (pos) =>
                  pos % 2
                    ? gsap.utils.random(-75, 25)
                    : gsap.utils.random(25, 75),
              },
              "start",
            );
        };

        cardEl.addEventListener("mouseenter", onEnter);
        cardEl.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          cardEl.removeEventListener("mouseenter", onEnter);
          cardEl.removeEventListener("mouseleave", onLeave);
          gsap.killTweensOf([img, imgWrap, ...slices, ...chars]);
        });
      });

      imagesLoaded(
        root.querySelectorAll(".cph-img-inner"),
        { background: true },
        () => {
          if (killed) return;
          gsap.to(root, { duration: 0.4, opacity: 1, ease: "power2" });
        },
      );
    };

    boot().catch(() => {});

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    model,
    enableScramble,
    scrambleChars,
    scrambleRepeat,
    scrambleSpeed,
    scrambleDelay,
  ]);

  const splitChars = (text, prefix) =>
    [...text].map((ch, i) => (
      <span
        key={`${prefix}-${i}`}
        className="cph-char"
        data-initial={ch === " " ? "\u00A0" : ch}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <div ref={rootRef} className={`${scope} opacity-0`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {title.length ? (
        <div className="cph-title">
          {title.map((word, i) => (
            <span key={`${uid}-t${i}`}>{word}</span>
          ))}
        </div>
      ) : null}

      {subtitle ? <p className="cph-subtitle">{subtitle}</p> : null}

      <section className="cph-grid">
        {model.map((card, i) => (
          <article key={`${uid}-c${i}`} className="cph-card">
            <div className="cph-img">
              <div className="cph-img-wrap">
                {Array.from({ length: card.config.slicesTotal }, (_, s) => (
                  <div
                    key={`${uid}-c${i}-s${s}`}
                    className="cph-img-inner"
                    style={{ backgroundImage: `url(${card.src})` }}
                  />
                ))}
              </div>
            </div>

            <span className="cph-date">
              {splitChars(card.date, `${uid}-c${i}-d`)}
            </span>

            <h2 className="cph-card-title">
              {splitChars(card.title, `${uid}-c${i}-h`)}
            </h2>

            <a className="cph-link" onClick={(e) => e.preventDefault()}>
              {splitChars(card.link, `${uid}-c${i}-l`)}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
