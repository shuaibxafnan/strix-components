"use client";

import { useEffect, useRef } from "react";

const CLIP_CLOSED =
  "polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 50%, 100% 50%, 100% 100%, 0 100%)";
const CLIP_OPEN =
  "polygon(0 0, 100% 0, 100% 0%, 0 0%, 0 100%, 100% 100%, 100% 100%, 0 100%)";

const RULE = "border-[color-mix(in_srgb,currentColor_25%,transparent)]";
const PAD = "px-[clamp(20px,4vw,56px)]";
const BODY =
  "text-[clamp(1.125rem,1.35vw,1.3125rem)]";
const DROP_CAP =
  "first-letter:float-left first-letter:mr-3 first-letter:mt-[0.12em] first-letter:text-[4.6em] first-letter:font-medium first-letter:leading-[0.72]";

const DEFAULT_IMAGES = [
  {
    src: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/card.png",
    alt: "A Poké Ball item",
    width: 300,
    top: "-8%",
    left: "56%",
    blur: 2,
    zIndex: 1,
    speed: 3,
  },
  {
    src: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/lady.png",
    alt: "Pikachu falling",
    width: 300,
    top: "18%",
    left: "calc(50% - 150px)",
    zIndex: 2,
    speed: 4,
  },
  {
    src: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/book.png",
    alt: "An open item book",
    width: 90,
    top: "6%",
    left: "6%",
    speed: 5,
  },
  {
    src: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/watch.png",
    alt: "A pocket watch item",
    width: 120,
    top: "-12%",
    left: "14%",
    speed: 6,
  },
  {
    src: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/lamp.png",
    alt: "A kettle item",
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
  introAuthor = "Lewis Carroll",
  introYear = "1865",
  introHint = "Scroll to fall",
  introNote = "In which a white rabbit leads Alice astray.",
  leadingChapterLabel = "Chapter",
  leadingNumeral = "I",
  leadingTitle = "Down the Rabbit-Hole",
  leadingParagraphs = DEFAULT_LEADING,
  pullQuote = "“And what is the use of a book,” thought Alice, “without pictures or conversations?”",
  pullQuoteSource = "Alice, Chapter I",
  revealParagraphs = DEFAULT_REVEAL,
  trailingTitle = "The Long Hall",
  trailingNumeral = "II",
  trailingParagraphs = DEFAULT_TRAILING,
  outroText = "“Curiouser and curiouser!”",
  outroSource = "Alice, Chapter II",
  images = DEFAULT_IMAGES,
  bgColor = "#000000",
  revealBgColor = "#FFFFFF",
  revealTextColor = "#000000",
  heroContentColor = "#FFFFFF",
  contentBgColor = "#FFFFFF",
  contentTextColor = "#111111",
  fontFamily = "'Open Sans', system-ui, sans-serif",
  serifFamily = "'EB Garamond', Georgia, serif",
  bodyLineHeight = "1.7",
  articleMaxWidth = "31.25rem",
  introFontSize = "clamp(2.75rem, 9.5vw, 9rem)",
  introLineHeight = "0.95",
  introTracking = "-0.02em",
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
        "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Open+Sans:wght@400;700;800&display=swap",
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
        } catch (e) { }
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
        const lift = (selector) => {
          root.querySelectorAll(selector).forEach((el) => {
            gsap.fromTo(
              el,
              { y: 36 },
              {
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "top 72%",
                  scrub: true,
                },
              },
            );
          });
        };

        if (!reduced) {
          const lines = root.querySelectorAll(".intro__line-inner");
          const intro = root.querySelector(".intro");
          if (lines.length && intro) {
            gsap.from(lines, {
              yPercent: 110,
              duration: 1.3,
              ease: "power4.out",
              stagger: 0.14,
            });
            lines.forEach((el, i) => {
              gsap.to(el, {
                x: (i % 2 ? 1 : -1) * window.innerWidth * 0.06,
                ease: "none",
                scrollTrigger: {
                  trigger: intro,
                  start: "top top",
                  end: "bottom top",
                  scrub: true,
                },
              });
            });
          }
          const cue = root.querySelector(".intro__cue");
          if (cue) {
            gsap.fromTo(
              cue,
              { yPercent: -100 },
              { yPercent: 200, duration: 1.6, ease: "power2.inOut", repeat: -1 },
            );
          }
          lift(".lift-lead");
        }

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

        lift(".lift-trail");
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
      className="main relative max-w-[100vw] overflow-x-clip"
      style={{
        backgroundColor: contentBgColor,
        color: contentTextColor,
        fontFamily: fontFamily,
        lineHeight: bodyLineHeight,
      }}
    >
      {introHeading ? (
        <section
          className={
            "intro relative flex min-h-screen flex-col justify-between pt-8 pb-10 " +
            PAD
          }
          style={{ fontFamily: serifFamily }}
        >
          <div
            className={
              "flex items-start justify-between border-b pb-4 text-[0.95rem] " +
              RULE
            }
          >
            <span>{introAuthor}</span>
            <span>{introYear}</span>
          </div>

          <h1
            className="intro__heading flex flex-col py-12 font-medium"
            style={{
              fontSize: introFontSize,
              lineHeight: introLineHeight,
              letterSpacing: introTracking,
            }}
          >
            {introHeading.split("\n").map((line, i) => (
              <span
                key={i}
                className={
                  "block overflow-hidden pb-[0.08em] " +
                  (i % 2 ? "self-end text-right" : "self-start")
                }
              >
                <span className="intro__line-inner inline-block will-change-transform">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div
            className={
              "flex items-end justify-between gap-8 border-t pt-4 text-[0.95rem] " +
              RULE
            }
          >
            <div className="flex items-center gap-4">
              <span className="relative block h-12 w-px overflow-hidden bg-[color-mix(in_srgb,currentColor_20%,transparent)]">
                <span className="intro__cue absolute inset-x-0 top-0 block h-1/2 bg-current" />
              </span>
              <span>{introHint}</span>
            </div>
            <p className="max-w-[18rem] text-right italic leading-snug">
              {introNote}
            </p>
          </div>
        </section>
      ) : null}

      {leadingParagraphs.length ? (
        <section
          className={"py-[clamp(5rem,12vw,10rem)] " + PAD}
          style={{ fontFamily: serifFamily }}
        >
          <div className="mx-auto grid max-w-[80rem] gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-[0.95rem]">{leadingChapterLabel}</p>
              <p className="text-[clamp(6rem,15vw,14rem)] font-medium leading-[0.8] tracking-[-0.03em]">
                {leadingNumeral}
              </p>
              <h2 className="mt-6 max-w-[14ch] text-[clamp(1.5rem,2.4vw,2.25rem)] font-medium leading-[1.1]">
                {leadingTitle}
              </h2>
            </div>

            <article
              className={BODY}
              style={{ lineHeight: bodyLineHeight }}
            >
              {leadingParagraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    "lift-lead m-0 mb-[1.5em] last:mb-0 " + (i === 0 ? DROP_CAP : "")
                  }
                >
                  {p}
                </p>
              ))}
            </article>
          </div>

          {pullQuote ? (
            <figure className="mx-auto mt-[clamp(4rem,9vw,8rem)] max-w-[80rem]">
              <blockquote
                className={
                  "lift-lead m-0 border-y py-[clamp(2.5rem,6vw,5rem)] text-[clamp(1.75rem,4.2vw,3.75rem)] leading-[1.1] tracking-[-0.01em] " +
                  RULE
                }
              >
                {pullQuote}
              </blockquote>
              <figcaption className="mt-4 text-[0.95rem]">
                {pullQuoteSource}
              </figcaption>
            </figure>
          ) : null}
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
        <section
          className={"py-[clamp(5rem,12vw,10rem)] " + PAD}
          style={{ fontFamily: serifFamily }}
        >
          <div className="mx-auto max-w-[80rem]">
            <div
              className={
                "mb-[clamp(2rem,5vw,4rem)] flex items-end justify-between gap-6 border-b pb-6 " +
                RULE
              }
            >
              <h2 className="m-0 text-[clamp(2rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.02em]">
                {trailingTitle}
              </h2>
              <p className="m-0 text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.8] tracking-[-0.03em]">
                {trailingNumeral}
              </p>
            </div>

            <article
              className={
                BODY +
                " lg:columns-2 lg:gap-16 [&>p]:mb-[1.5em]"
              }
              style={{ lineHeight: bodyLineHeight }}
            >
              {trailingParagraphs.map((p, i) => (
                <p
                  key={i}
                  className={"lift-trail m-0 " + (i === 0 ? DROP_CAP : "")}
                >
                  {p}
                </p>
              ))}
            </article>

            {outroText ? (
              <div className="mt-[clamp(4rem,9vw,8rem)]">
                <p className="lift-trail m-0 mx-auto max-w-[22ch] text-center text-[clamp(2.25rem,6vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.01em]">
                  {outroText}
                </p>
                <p className="mt-6 text-center text-[0.95rem]">{outroSource}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}