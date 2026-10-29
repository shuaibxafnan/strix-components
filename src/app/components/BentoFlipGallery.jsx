"use client";

import { useEffect, useRef } from "react";

const SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
];

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@1,500&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&display=swap";

const AREAS = [
  "[grid-area:1/1/3/2]",
  "[grid-area:1/2/2/3]",
  "[grid-area:2/2/4/3]",
  "[grid-area:1/3/3/3]",
  "[grid-area:3/1/3/2]",
  "[grid-area:3/3/5/4]",
  "[grid-area:4/1/5/2]",
  "[grid-area:4/2/5/3]",
];

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1200&q=80`;

const DEFAULT_IMAGES = [
  "1627896157734-4d7d4388f28b",
  "1779862946918-a129ac57c60e",
  "1780580940878-248a6ad4b626",
  "1781513747645-757fb2619e57",
  "1780163930838-1502715c3bc1",
  "1780269579991-79bc18ee6f56",
  "1611419010196-a360856fc42f",
  "1777902609361-a8b8b7a697fb",
].map((id, i) => ({ src: photo(id), alt: `Frame ${i + 1} of the roll` }));

const DEFAULT_PARAGRAPHS = [
  "The camera was heavier than it needed to be and slower than I was used to, which turned out to be the point. Each frame asked for a decision before the shutter did.",
  "I developed the film at home the same night, in a bathroom with the door taped shut, and hung the strip over the tub to dry. By morning the negatives had curled like a sleeping animal.",
  "What follows is the roll in the order it was shot. Nothing was cropped and nothing was rescued. The frames that failed are the ones that showed me where the light actually was.",
  "Scroll back up and the grid comes apart again, eight small windows onto one very long weekend.",
];

const DEFAULT_DETAILS = [
  { label: "Camera", value: "Pentax 67" },
  { label: "Film", value: "Ilford HP5 Plus, pushed to 1600" },
  { label: "Developed", value: "At home, stand development" },
  { label: "Kept", value: "8 of 10 frames" },
];

export default function BentoFlipGallery({
  images = DEFAULT_IMAGES,
  inkColor = "#0b0b0c",
  paperColor = "#f3efe6",
  safelightColor = "#e8442c",
  displayFont = "Bodoni Moda",
  bodyFont = "Newsreader",
  heading = "One roll, eight frames",
  leadParagraph = "I shot this roll over a single weekend in late autumn, mostly at dusk, when the light was too thin for anything but a wide aperture and a steady breath. Ten exposures went in. Eight came out the other side.",
  paragraphs = DEFAULT_PARAGRAPHS,
  pullQuote = "Most of what I keep is what I almost missed.",
  pullQuoteCredit = "From the darkroom notebook",
  details = DEFAULT_DETAILS,
  itemGap = 1,
  colWidth = 32.5,
  rowHeight = 23,
  finalColWidth = 100,
  finalRowHeight = 49.5,
  scrubStart = "center center",
  scrubDistance = "+=100%",
  ease = "expoScale(1, 5)",
  pinContainer = true,
}) {
  const galleryRef = useRef(null);
  const flipCtxRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let onResize;
    let timer;

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

    Promise.all(SCRIPTS.map(loadScript))
      .then(() => {
        const { gsap, ScrollTrigger, Flip } = window;
        const galleryElement = galleryRef.current;
        if (cancelled || !gsap || !galleryElement) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(ScrollTrigger, Flip);

        const createTween = () => {
          const items = galleryElement.querySelectorAll("[data-flip-item]");

          if (flipCtxRef.current) flipCtxRef.current.revert();
          galleryElement.classList.remove("is-final");

          flipCtxRef.current = gsap.context(() => {
            galleryElement.classList.add("is-final");
            const flipState = Flip.getState(items);
            galleryElement.classList.remove("is-final");

            const flip = Flip.to(flipState, { simple: true, ease });

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: galleryElement,
                start: scrubStart,
                end: scrubDistance,
                scrub: true,
                pin: pinContainer ? galleryElement.parentNode : false,
              },
            });

            tl.add(flip);

            return () => gsap.set(items, { clearProps: "all" });
          });
        };

        createTween();
        onResize = () => {
          clearTimeout(timer);
          timer = setTimeout(createTween, 150);
        };
        window.addEventListener("resize", onResize);
      })
      .catch((e) =>
        console.error("[BentoFlipGallery] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (onResize) window.removeEventListener("resize", onResize);
      if (flipCtxRef.current) flipCtxRef.current.revert();
    };
  }, [
    ease,
    scrubStart,
    scrubDistance,
    pinContainer,
    itemGap,
    colWidth,
    rowHeight,
    finalColWidth,
    finalRowHeight,
    images.length,
  ]);

  return (
    <div
      className="bg-[var(--ink)] font-[family-name:var(--body)] text-[var(--paper)]"
      style={{
        "--ink": inkColor,
        "--paper": paperColor,
        "--safe": safelightColor,
        "--display": `"${displayFont}", serif`,
        "--body": `"${bodyFont}", serif`,
        "--gap": `${itemGap}vh`,
        "--col": `${colWidth}vw`,
        "--row": `${rowHeight}vh`,
        "--fcol": `${finalColWidth}vw`,
        "--frow": `${finalRowHeight}vh`,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={FONTS_URL} />

      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div
          ref={galleryRef}
          className="relative grid h-full w-full flex-none content-center justify-center gap-[var(--gap)] [grid-template-columns:repeat(3,var(--col))] [grid-template-rows:repeat(4,var(--row))] [&.is-final]:[grid-template-columns:repeat(3,var(--fcol))] [&.is-final]:[grid-template-rows:repeat(4,var(--frow))]"
        >
          {images.map((img, i) => (
            <div
              key={i}
              data-flip-item
              className={`relative flex-none overflow-hidden ${AREAS[i] ?? ""}`}
            >
              <img
                src={img.src}
                alt={img.alt || ""}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-x-16 gap-y-20 px-6 py-24 md:grid-cols-12 md:px-12 md:py-40">
        <header className="md:sticky md:top-20 md:col-span-5 md:self-start">
          <h2 className="font-[family-name:var(--display)] text-[clamp(3rem,8.5vw,7rem)] font-medium italic leading-[0.92] tracking-[-0.02em] text-balance">
            {heading}
          </h2>

          {details.length > 0 && (
            <dl className="mt-14 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-[var(--paper)]/20 pt-6 text-[0.95rem] leading-snug">
              {details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="text-[var(--paper)]/50">{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <div className="md:col-span-7">
          <p className="text-[clamp(1.5rem,2.5vw,2.15rem)] font-light leading-[1.28] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-[family-name:var(--display)] first-letter:text-[4.4em] first-letter:font-medium first-letter:italic first-letter:leading-[0.78] first-letter:text-[var(--safe)]">
            {leadParagraph}
          </p>

          {pullQuote && (
            <figure className="my-16 border-l-2 border-[var(--safe)] pl-6 md:pl-8">
              <blockquote className="font-[family-name:var(--display)] text-[clamp(1.75rem,3.2vw,2.75rem)] italic leading-[1.1]">
                {pullQuote}
              </blockquote>
              {pullQuoteCredit && (
                <figcaption className="mt-4 text-sm text-[var(--paper)]/50">
                  {pullQuoteCredit}
                </figcaption>
              )}
            </figure>
          )}

          <div className="columns-1 gap-12 text-[1.075rem] leading-[1.7] text-[var(--paper)]/80 md:columns-2">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-6 break-inside-avoid-column hyphens-auto">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}