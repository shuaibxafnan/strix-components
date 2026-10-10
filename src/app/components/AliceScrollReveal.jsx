"use client";

import { useEffect, useRef } from "react";

// ─── HeroReveal ──────────────────────────────────────────────────────────────
//
// A pinned "curtain" reveal: a full-screen word splits along its middle and
// slides apart as a clip-path opens it, uncovering falling text and parallax
// objects tumbling through the dark behind it. Built on GSAP ScrollTrigger.
//
// Unlike the source CodePen — which let the objects overflow the section and
// relied on opaque neighbor sections to *mask* the leak — this pins a single
// viewport-sized, overflow-hidden stage and runs everything on one scrubbed
// timeline, so nothing can ever spill into adjacent content. The source also
// loaded ScrollSmoother (whole-page scroll hijack) and SplitText (never used);
// both are dropped. The curtain, split, parallax and text motion are preserved.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// headingText        string   RABBIT HOLE     The word that splits + reveals
// introHeading       string   (Alice title)   Full-screen lead-in title; "\n"
//                                              becomes a line break. Empty hides it.
// leadingParagraphs  array    (Chapter 1)     Body paragraphs before the reveal
// revealParagraphs   array    (the fall)      Text that rises inside the pinned stage
// trailingParagraphs array    (the hall)      Body paragraphs after the reveal
// images             array    (5 objects)     Parallax layers, back-to-front. Each:
//                                              { src, alt, width, top, left, blur,
//                                                zIndex, speed }. speed is depth —
//                                              higher = travels faster (further back).
// ── Colors ──────────────────────────────────────────────────────────────────
// bgColor            string   #000000         Stage (behind-curtain) background
// revealBgColor      string   #FFFFFF         The curtain / heading block fill
// revealTextColor    string   #000000         Heading color on the curtain
// heroContentColor   string   #FFFFFF         Falling-text color over the dark stage
// contentBgColor     string   #FFFFFF         Page + article section background
// contentTextColor   string   #111111         Body + intro text color
// ── Typography ────────────────────────────────────────────────────────────
// fontFamily         string   Open Sans stack Page font
// bodyLineHeight     string   1.75            Body line-height
// articleMaxWidth    string   31.25rem        Reading measure (body + falling text)
// introFontSize      string   clamp(...)      Intro title font-size
// introLineHeight    string   clamp(...)      Intro title line-height
// headingFontSize    string   clamp(...)      Reveal word font-size
// headingLineHeight  string   clamp(...)      Reveal word line-height
// headingTracking    string   -0.01em         Reveal word letter-spacing
// ── Motion ────────────────────────────────────────────────────────────────
// clipEase           string   power4.inOut    Ease of the curtain opening
// splitEase          string   power3.inOut    Ease of the two halves sliding apart
// splitDistance      number   30              How far each half travels (% of height)
// curtainPortion     number   0.4             Fraction of the pin spent opening the curtain
// textStartOffset    number   0.55            Where the fall-text starts (× viewport height)
// pinExtraScroll     number   0.8             Extra pin length beyond the text (× viewport)
// ──────────────────────────────────────────────────────────────────────────

const CLIP_CLOSED =
  "polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 50%, 100% 50%, 100% 100%, 0 100%)";
const CLIP_OPEN =
  "polygon(0 0, 100% 0, 100% 0%, 0 0%, 0 100%, 100% 100%, 100% 100%, 0 100%)";

const DEFAULT_IMAGES = [
  {
    src: "https://assets.codepen.io/204808/alice-falling-card.png",
    alt: "A playing card",
    width: 300,
    top: "-8%",
    left: "56%",
    blur: 2,
    zIndex: 1,
    speed: 3,
  },
  {
    src: "https://assets.codepen.io/204808/alice-falling-1.png",
    alt: "Alice falling",
    width: 300,
    top: "18%",
    left: "calc(50% - 150px)",
    zIndex: 2,
    speed: 4,
  },
  {
    src: "https://assets.codepen.io/204808/alice-falling-book.png",
    alt: "An open book",
    width: 90,
    top: "6%",
    left: "6%",
    speed: 5,
  },
  {
    src: "https://assets.codepen.io/204808/alice-falling-clock.png",
    alt: "A pocket watch",
    width: 120,
    top: "-12%",
    left: "14%",
    speed: 6,
  },
  {
    src: "https://assets.codepen.io/204808/alice-falling-kattle.png",
    alt: "A kettle",
    width: 55,
    top: "-20%",
    left: "80%",
    blur: 2,
    speed: 8,
  },
];

const DEFAULT_LEADING = [
  "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”",
  "So she was considering in her own mind whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a white rabbit with pink eyes ran close by her.",
  "There was nothing so very remarkable in that; but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket or a watch to take out of it.",
  "Burning with curiosity, she ran across the field after it, and was just in time to see it pop down a large rabbit-hole under the hedge. In another moment down went Alice after it, never once considering how in the world she was to get out again.",
];

const DEFAULT_REVEAL = [
  "Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her, and to wonder what was going to happen next.",
  "First, she tried to look down and make out what she was coming to, but it was too dark to see anything: then she looked at the sides of the well, and noticed that they were filled with cupboards and bookshelves; here and there she saw maps and pictures hung upon pegs.",
  "“Well!” thought Alice to herself, “after such a fall as this, I shall think nothing of tumbling down stairs! How brave they’ll all think me at home!”",
  "Down, down, down. Would the fall never come to an end? “I wonder how many miles I’ve fallen by this time?” she said aloud.",
  "And here Alice began to get rather sleepy, and went on saying to herself, in a dreamy sort of way, “Do cats eat bats? Do cats eat bats?” when suddenly, thump! thump! down she came upon a heap of sticks and dry leaves, and the fall was over.",
];

const DEFAULT_TRAILING = [
  "Alice was not a bit hurt, and she jumped up on to her feet in a moment: she looked up, but it was all dark overhead; before her was another long passage, and the White Rabbit was still in sight, hurrying down it.",
  "Away went Alice like the wind, and was just in time to hear it say, as it turned a corner, “Oh my ears and whiskers, how late it’s getting!” She found herself in a long, low hall, which was lit up by a row of lamps hanging from the roof.",
  "There were doors all round the hall, but they were all locked, and when Alice had been all the way down one side and up the other, she walked sadly down the middle, wondering how she was ever to get out again.",
  "Suddenly she came upon a little three-legged table, all made of solid glass; there was nothing on it but a tiny golden key, and behind a low curtain was a little door about fifteen inches high: she tried the little golden key in the lock, and to her great delight it fitted!",
];

export default function AliceScrollReveal({
  headingText = "RABBIT HOLE",
  introHeading = "Alice’s Adventures\nin Wonderland",
  leadingParagraphs = DEFAULT_LEADING,
  revealParagraphs = DEFAULT_REVEAL,
  trailingParagraphs = DEFAULT_TRAILING,
  images = DEFAULT_IMAGES,
  bgColor = "#000000",
  revealBgColor = "#FFFFFF",
  revealTextColor = "#000000",
  heroContentColor = "#FFFFFF",
  contentBgColor = "#FFFFFF",
  contentTextColor = "#111111",
  fontFamily = "'Open Sans', system-ui, sans-serif",
  bodyLineHeight = "1.75",
  articleMaxWidth = "31.25rem",
  introFontSize = "clamp(1.875rem, 8.083vw - 0.217rem, 6.25rem)",
  introLineHeight = "clamp(2.813rem, 9.815vw + 0.273rem, 8.125rem)",
  headingFontSize = "clamp(3.125rem, 12.61vw - 0.138rem, 15.625rem)",
  headingLineHeight = "clamp(4.688rem, 15.763vw + 0.609rem, 20.313rem)",
  headingTracking = "-0.01em",
  clipEase = "power4.inOut",
  splitEase = "power3.inOut",
  splitDistance = 30,
  curtainPortion = 0.4,
  textStartOffset = 0.55,
  pinExtraScroll = 0.8,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    let killed = false;
    let ctx;

    const loadStyle = (href) =>
      new Promise((resolve) => {
        if (document.querySelector(`link[data-id="${href}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = href;
        el.setAttribute("data-id", href);
        el.onload = resolve;
        el.onerror = resolve;
        document.head.appendChild(el);
      });

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

    const run = async () => {
      await loadStyle(
        "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&display=swap",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      );

      if (killed) return;
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {}
      }
      if (killed) return;

      const { gsap, ScrollTrigger } = window;
      if (!gsap || !ScrollTrigger || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const root = rootRef.current;

      const reduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        const section = root.querySelector(".hero-reveal");
        const stage = root.querySelector(".hero-reveal__stage");
        const header = root.querySelector(".hero-reveal__header");
        const items = root.querySelectorAll(".hero-reveal_split_item");
        const contentInner = root.querySelector(".hero-reveal__content-inner");
        const contentP = root.querySelector(".hero-reveal__content-p");
        if (!section || !stage || !header || !contentInner || !contentP) return;

        const vh = window.innerHeight;
        const contentH = contentP.offsetHeight;
        const startY = vh * textStartOffset;
        const endY = -(contentH - vh * 0.3);
        const pinDist = contentH + vh * pinExtraScroll;

        if (reduced) {
          gsap.set(header, { clipPath: CLIP_OPEN });
          if (items.length >= 2) {
            gsap.set(items[0], { yPercent: -splitDistance });
            gsap.set(items[1], { yPercent: splitDistance });
          }
          gsap.set(contentInner, { y: 0 });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=" + pinDist,
            scrub: true,
            pin: stage,
            anticipatePin: 1,
          },
        });

        tl.fromTo(
          header,
          { clipPath: CLIP_CLOSED },
          { clipPath: CLIP_OPEN, duration: curtainPortion, ease: clipEase },
          0,
        );

        if (items.length >= 2) {
          tl.fromTo(
            items[0],
            { yPercent: 0 },
            {
              yPercent: -splitDistance,
              duration: curtainPortion,
              ease: splitEase,
            },
            0,
          );
          tl.fromTo(
            items[1],
            { yPercent: 0 },
            {
              yPercent: splitDistance,
              duration: curtainPortion,
              ease: splitEase,
            },
            0,
          );
        }

        tl.fromTo(
          contentInner,
          { y: startY },
          { y: endY, duration: 1, ease: "none" },
          0,
        );

        stage.querySelectorAll(".hero-parallax-item").forEach((el) => {
          const speed = parseFloat(el.getAttribute("data-speed")) || 1;
          tl.fromTo(
            el,
            { yPercent: 0 },
            { yPercent: (speed - 1) * 100, duration: 1, ease: "none" },
            0,
          );
        });
      }, root);

      requestAnimationFrame(() => {
        if (!killed && window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    };

    run().catch((e) => console.error("[HeroReveal] load failed:", e.message));

    return () => {
      killed = true;
      if (ctx) ctx.revert();
    };
  }, [
    images,
    revealParagraphs,
    headingText,
    splitDistance,
    curtainPortion,
    textStartOffset,
    pinExtraScroll,
    clipEase,
    splitEase,
  ]);

  return (
    <main
      ref={rootRef}
      className="main relative max-w-[100vw] overflow-x-hidden"
      style={{
        backgroundColor: contentBgColor,
        color: contentTextColor,
        fontFamily: fontFamily,
        lineHeight: bodyLineHeight,
      }}
    >
      {introHeading ? (
        <section className="intro flex min-h-screen items-center justify-center px-[1.5rem]">
          <h1
            className="intro__heading whitespace-pre-line text-center font-extrabold"
            style={{ fontSize: introFontSize, lineHeight: introLineHeight }}
          >
            {introHeading}
          </h1>
        </section>
      ) : null}

      {leadingParagraphs.length ? (
        <section className="content flex justify-center py-[6.25rem] px-[1.5rem]">
          <article
            className="article space-y-6"
            style={{ maxWidth: articleMaxWidth }}
          >
            {leadingParagraphs.map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
          </article>
        </section>
      ) : null}

      <section
        className="hero-reveal relative"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="hero-reveal__stage relative h-screen w-full overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          <div className="hero-reveal__parallax absolute inset-0 z-0">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt={img.alt || ""}
                data-speed={img.speed}
                className="hero-parallax-item pointer-events-none absolute h-auto max-w-none select-none will-change-transform"
                style={{
                  top: img.top,
                  left: img.left,
                  width: img.width ? img.width + "px" : undefined,
                  filter: img.blur ? "blur(" + img.blur + "px)" : undefined,
                  zIndex: img.zIndex,
                }}
              />
            ))}
          </div>

          <div
            className="hero-reveal__content absolute inset-0 z-[1] flex items-start justify-center overflow-hidden px-[1.5rem]"
            style={{ color: heroContentColor }}
          >
            <div
              className="hero-reveal__content-inner relative w-full will-change-transform"
              style={{ maxWidth: articleMaxWidth }}
            >
              <div className="hero-reveal__content-p space-y-6">
                {revealParagraphs.map((p, i) => (
                  <p key={i} className="m-0">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <header
            className="hero-reveal__header absolute inset-0 z-[2] flex items-center justify-center font-extrabold will-change-transform"
            style={{
              backgroundColor: revealBgColor,
              color: revealTextColor,
              fontSize: headingFontSize,
              lineHeight: headingLineHeight,
              letterSpacing: headingTracking,
            }}
          >
            <div className="hero-reveal_split relative flex h-full w-full flex-col items-center justify-center">
              <div
                className="hero-reveal_split_item absolute inset-0 flex items-center justify-center will-change-transform"
                style={{ clipPath: "inset(0 0 calc(50% - 1px) 0)" }}
              >
                <p className="m-0 whitespace-pre-line text-center">
                  {headingText}
                </p>
              </div>
              <div
                aria-hidden="true"
                className="hero-reveal_split_item absolute inset-0 flex items-center justify-center will-change-transform"
                style={{ clipPath: "inset(calc(50% - 1px) 0 0 0)" }}
              >
                <p
                  aria-hidden="true"
                  className="m-0 whitespace-pre-line text-center"
                >
                  {headingText}
                </p>
              </div>
            </div>
          </header>
        </div>
      </section>

      {trailingParagraphs.length ? (
        <section className="content flex justify-center py-[6.25rem] px-[1.5rem]">
          <article
            className="article space-y-6"
            style={{ maxWidth: articleMaxWidth }}
          >
            {trailingParagraphs.map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
          </article>
        </section>
      ) : null}
    </main>
  );
}
