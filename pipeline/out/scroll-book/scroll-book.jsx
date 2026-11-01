"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lora, Playfair_Display } from "next/font/google";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});

const body = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&h=700&q=80`;

const IMAGES = [
  "photo-1749330513873-09ffa91b0aae",
  "photo-1627896157734-4d7d4388f28b",
  "photo-1778789172736-e8ba37c71124",
  "photo-1778961938903-96617183f739",
  "photo-1678112553355-a9dab855ebf3",
  "photo-1743309411498-a0f4f4b96b65",
  "photo-1490682143684-14369e18dce8",
  "photo-1634325232058-e7b8f80cc20b",
  "photo-1759458856846-097935f54111",
  "photo-1533387520709-752d83de3630",
].map(img);

const DEFAULT_PAGES = [
  {
    type: "chapter",
    number: "01",
    title: "First Light",
    text: "Notes on the quiet hour before the day begins.",
  },
  {
    type: "figure",
    image: IMAGES[0],
    alt: "Early morning scene",
    caption: "Plate 1. Early morning, uncut.",
    text: "The first frame of the day is rarely planned. It arrives while the kettle is still warming.",
  },
  {
    type: "text",
    heading: "Morning",
    paragraphs: [
      "Most of what follows began as small observations, written down quickly and sorted later. Some stayed short. Others grew into pages.",
      "The aim was never to explain everything, only to notice it carefully and leave a record for anyone who wants to look again.",
    ],
  },
  {
    type: "quote",
    text: "Look long enough and the ordinary starts to speak.",
    attribution: "From the notebook",
  },
  {
    type: "split",
    image: IMAGES[1],
    alt: "Close detail",
    heading: "A small detail",
    text: "Look closely at edges, where one thing meets another. That is usually where the interesting part begins.",
  },
  {
    type: "chapter",
    number: "02",
    title: "Quiet Textures",
    text: "Surfaces, grain, and the feel of things.",
  },
  {
    type: "gallery",
    images: [
      { image: IMAGES[2], alt: "Study one", caption: "Fig. 1" },
      { image: IMAGES[3], alt: "Study two", caption: "Fig. 2" },
    ],
    text: "Two studies of the same idea, taken an hour apart.",
  },
  {
    type: "text",
    heading: "Grain",
    paragraphs: [
      "Texture is the memory of how something was made. A rough edge records the hand, a smooth one records patience.",
      "Run a finger across the page of a good book and you will feel the same thing: someone cared about the surface.",
    ],
  },
  {
    type: "figure",
    image: IMAGES[4],
    alt: "Afternoon scene",
    caption: "Plate 2. Slow afternoon.",
    text: "Nothing happens in this picture, which is exactly why it was worth keeping.",
  },
  {
    type: "ornament",
    text: "Pause here.",
  },
  {
    type: "chapter",
    number: "03",
    title: "Color Study",
    text: "How a single tone changes everything around it.",
  },
  {
    type: "split",
    image: IMAGES[5],
    alt: "Color sample",
    heading: "One tone",
    text: "Pick one color and let it lead. The rest of the page only has to agree with it.",
  },
  {
    type: "text",
    heading: "Palette",
    paragraphs: [
      "A palette is a set of promises. Keep to a few and every new shade feels earned rather than added.",
      "Contrast is useful, but quiet harmony lasts longer. Most readers will not name it, yet they will remember the mood.",
    ],
  },
  {
    type: "quote",
    text: "A good page leaves room to breathe.",
    attribution: "Margin note",
  },
  {
    type: "figure",
    image: IMAGES[6],
    alt: "Dusk scene",
    caption: "Plate 3. Dusk, reversed.",
    text: "Turned upside down, the same scene reads as an entirely different place.",
  },
  {
    type: "gallery",
    images: [
      { image: IMAGES[7], alt: "Study three", caption: "Fig. 3" },
      { image: IMAGES[8], alt: "Study four", caption: "Fig. 4" },
    ],
    text: "Small frames, kept side by side so they can argue politely.",
  },
  {
    type: "chapter",
    number: "04",
    title: "Open Roads",
    text: "Leaving the plan behind.",
  },
  {
    type: "text",
    heading: "Route",
    paragraphs: [
      "The best detours were never on the map. They started with a turn taken for no reason and a willingness to be late.",
      "Keep a pencil close. The notes you write on the move tend to be the ones you read twice.",
    ],
  },
  {
    type: "figure",
    image: IMAGES[9],
    alt: "Last stop",
    caption: "Plate 4. The last stop.",
    text: "Every journey ends somewhere ordinary. That is where the story gets told.",
  },
  {
    type: "ornament",
    text: "Thank you for reading.",
    small: "Printed on screen, one scroll at a time.",
  },
];

const HALF =
  "absolute left-0 top-0 h-full w-full overflow-hidden bg-[var(--page)] [backface-visibility:hidden] [clip-path:inset(0_0.5%_0_0.5%)]";
const HALF_FRONT = `${HALF} rounded-r-[5%] [box-shadow:inset_1.4vmin_0_1.4vmin_-1.2vmin_rgba(0,0,0,0.25)]`;
const HALF_BACK = `${HALF} rounded-l-[5%] [transform:rotateY(180deg)_translate3d(0,0,1px)] [box-shadow:inset_-1.4vmin_0_1.4vmin_-1.2vmin_rgba(0,0,0,0.25)]`;
const PAGE = "absolute origin-[0_50%] [transform-style:preserve-3d] [z-index:var(--z)]";

const Emblem = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M12 4l2.2 5.2 5.6.5-4.3 3.7 1.3 5.5L12 15.9 7.2 18.9l1.3-5.5L4.2 9.7l5.6-.5L12 4z" />
  </svg>
);

const Divider = () => (
  <svg viewBox="0 0 120 12" className="h-[1.2vmin] w-[10vmin] text-neutral-500" aria-hidden="true">
    <path d="M0 6h50M70 6h50" stroke="currentColor" strokeWidth="1" />
    <path d="M60 0l6 6-6 6-6-6z" fill="currentColor" />
  </svg>
);

const QuoteMark = () => (
  <svg viewBox="0 0 48 36" className="h-[4vmin] w-[5vmin] text-neutral-400" fill="currentColor" aria-hidden="true">
    <path d="M0 36V20C0 8 6 1 18 0v6c-6 1-9 5-9 10h9v20H0zm26 0V20c0-12 6-19 18-20v6c-6 1-9 5-9 10h9v20H26z" />
  </svg>
);

const Rings = () => (
  <svg viewBox="0 0 100 100" className="h-[16vmin] w-[16vmin] text-neutral-400" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="50" cy="50" r="46" strokeWidth="0.8" />
    <circle cx="50" cy="50" r="34" strokeWidth="0.8" />
    <circle cx="50" cy="50" r="22" strokeWidth="0.8" />
    <path d="M50 4v92M4 50h92" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
  </svg>
);

const PageBody = ({ page, chapterLabel }) => {
  switch (page.type) {
    case "chapter":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[2.2vmin] text-center">
          <span className="text-[1vmin] uppercase tracking-[0.35em] text-neutral-500">
            {chapterLabel}
          </span>
          <span className="text-[9vmin] leading-none [font-family:var(--font-display)]">
            {page.number}
          </span>
          <Divider />
          <h3 className="m-0 text-[2.6vmin] leading-tight [font-family:var(--font-display)]">
            {page.title}
          </h3>
          <p className="m-0 max-w-[85%] text-[1.05vmin] italic leading-[1.5] text-neutral-600">
            {page.text}
          </p>
        </div>
      );
    case "text":
      return (
        <div className="flex h-full flex-col gap-[1.6vmin]">
          <h3 className="m-0 border-b border-neutral-300 pb-[1vmin] text-[1.4vmin] uppercase tracking-[0.25em] [font-family:var(--font-display)]">
            {page.heading}
          </h3>
          {page.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`m-0 text-justify text-[1.15vmin] leading-[1.6] ${i === 0
                  ? "first-letter:float-left first-letter:mr-[0.7vmin] first-letter:text-[4.6vmin] first-letter:leading-[0.85] first-letter:[font-family:var(--font-display)]"
                  : "indent-[2vmin]"
                }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      );
    case "figure":
      return (
        <div className="flex h-full flex-col gap-[1.4vmin]">
          <div className="border border-neutral-300 bg-white p-[1.2vmin] shadow-sm">
            <img
              src={page.image}
              alt={page.alt}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <p className="m-0 text-center text-[1vmin] italic text-neutral-500">
            {page.caption}
          </p>
          <p className="m-0 text-justify text-[1.15vmin] leading-[1.6]">{page.text}</p>
        </div>
      );
    case "quote":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[2vmin] text-center">
          <QuoteMark />
          <p className="m-0 text-[2vmin] italic leading-[1.4] [font-family:var(--font-display)]">
            {page.text}
          </p>
          <Divider />
          <span className="text-[1vmin] uppercase tracking-[0.3em] text-neutral-500">
            {page.attribution}
          </span>
        </div>
      );
    case "split":
      return (
        <div className="flex h-full flex-col items-center gap-[1.8vmin] text-center">
          <img
            src={page.image}
            alt={page.alt}
            className="h-[12vmin] w-[12vmin] rounded-full border-[0.5vmin] border-white object-cover shadow-md"
          />
          <h3 className="m-0 text-[1.8vmin] [font-family:var(--font-display)]">
            {page.heading}
          </h3>
          <Divider />
          <p className="m-0 text-[1.15vmin] leading-[1.6]">{page.text}</p>
        </div>
      );
    case "gallery":
      return (
        <div className="flex h-full flex-col justify-center gap-[2vmin]">
          <div className="grid grid-cols-2 gap-[1.4vmin]">
            {page.images.map((item, i) => (
              <figure key={i} className="m-0 flex flex-col gap-[0.8vmin]">
                <div className="border border-neutral-300 bg-white p-[0.8vmin] shadow-sm">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <figcaption className="text-center text-[0.9vmin] italic text-neutral-500">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="m-0 text-center text-[1.15vmin] italic leading-[1.6]">
            {page.text}
          </p>
        </div>
      );
    case "ornament":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[2vmin] text-center">
          <Rings />
          <p className="m-0 text-[1.8vmin] italic [font-family:var(--font-display)]">
            {page.text}
          </p>
          {page.small ? (
            <p className="m-0 text-[0.95vmin] uppercase tracking-[0.25em] text-neutral-500">
              {page.small}
            </p>
          ) : null}
        </div>
      );
    default:
      return null;
  }
};

const BookPage = ({ page, number, side, runningTitle, chapterLabel }) => (
  <div className="absolute inset-0 flex flex-col px-[9%] pb-[9%] pt-[8%] text-neutral-800 [font-family:var(--font-body)]">
    <span
      className={`mb-[2vmin] block text-[0.9vmin] uppercase tracking-[0.3em] text-neutral-400 ${side === "front" ? "text-right" : "text-left"
        } ${page.type === "chapter" || page.type === "ornament" ? "invisible" : ""}`}
    >
      {runningTitle}
    </span>
    <div className="min-h-0 flex-1">
      <PageBody page={page} chapterLabel={chapterLabel} />
    </div>
    <span
      className={`mt-[1.6vmin] block text-[1vmin] text-neutral-500 ${side === "front" ? "text-right" : "text-left"
        }`}
    >
      {number}
    </span>
  </div>
);

export default function ScrollBook({
  pages = DEFAULT_PAGES,
  pageCount = 10,
  pageScroll = 25,
  runningTitle = "Field Notes",
  chapterLabel = "Chapter",
  coverTitle = "Field Notes",
  coverSubtitle = "Scroll to open",
  backCoverText = "The End",
  scrollHint = "Scroll",
  showHint = true,
  backgroundColor = "hsl(0, 0%, 8%)",
  spineColor = "hsl(0, 0%, 0%)",
  coverColor = "hsl(0, 0%, 14%)",
  insertColor = "hsl(0, 0%, 85%)",
  pageColor = "hsl(0, 0%, 96%)",
  coverTextColor = "hsl(0, 0%, 92%)",
  bookWidthVmin = 30,
  bookHeightVmin = 40,
  minBookWidth = 150,
  minBookHeight = 200,
  className = "",
}) {
  const rootRef = useRef(null);
  const bookRef = useRef(null);
  const emblemRef = useRef(null);
  const pageRefs = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const unit = () => (window.innerHeight * pageScroll) / 100;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bookRef.current,
        { scale: 0.5 },
        { scale: 1, scrollTrigger: { scrub: 1, start: 0, end: () => unit() } },
      );

      gsap.fromTo(
        emblemRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            scrub: true,
            start: () => (pageCount + 3.5) * unit(),
            end: () => (pageCount + 4) * unit(),
          },
        },
      );

      const elements = pageRefs.current.filter(Boolean);
      elements.forEach((page, index) => {
        gsap.set(page, { z: index === 0 ? 13 : -index });
        if (index === elements.length - 1) return;

        gsap.to(page, {
          rotateY: `-=${180 - index / 2}`,
          scrollTrigger: {
            scrub: 1,
            start: () => (index + 1) * unit(),
            end: () => (index + 2) * unit(),
          },
        });

        gsap.to(page, {
          z: index === 0 ? -13 : index,
          scrollTrigger: {
            scrub: 1,
            start: () => (index + 1) * unit(),
            end: () => (index + 1.5) * unit(),
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [pageCount, pageScroll]);

  const pageAt = (index) => pages[index % pages.length];

  return (
    <div
      ref={rootRef}
      className={`${display.variable} ${body.variable} relative w-full ${className}`}
      style={{
        "--bg": backgroundColor,
        "--spine": spineColor,
        "--cover": coverColor,
        "--insert": insertColor,
        "--page": pageColor,
        "--cover-text": coverTextColor,
        "--book-w": `${bookWidthVmin}vmin`,
        "--book-h": `${bookHeightVmin}vmin`,
        "--min-w": `${minBookWidth}px`,
        "--min-h": `${minBookHeight}px`,
        "--scroll-h": `calc(${(pageCount + 4) * pageScroll}vh + 100vh)`,
      }}
    >
      <div className="fixed inset-0 -z-10 bg-[var(--bg)]" />

      <div className="h-[var(--scroll-h)]" aria-hidden="true" />

      {showHint ? (
        <p className="fixed bottom-4 right-4 m-0 text-[2rem] text-neutral-500 [font-family:var(--font-body)]">
          {scrollHint}
        </p>
      ) : null}

      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div
          ref={bookRef}
          className="pointer-events-auto relative h-[var(--book-h)] min-h-[var(--min-h)] w-[var(--book-w)] min-w-[var(--min-w)] [perspective:1200px] [transform-style:preserve-3d]"
        >
          <div className="absolute left-0 top-0 h-full w-[12px] origin-[0_50%] bg-[var(--spine)] [transform:translate3d(0,0,-13px)]" />

          <div
            ref={(el) => (pageRefs.current[0] = el)}
            style={{ "--z": (pageCount + 1) * 2 }}
            className={`${PAGE} left-0 top-0 h-full w-full rounded-r-[5%] bg-[var(--cover)]`}
          >
            <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center gap-3 rounded-r-[5%] border-r-[1rem] border-[var(--spine)] bg-[var(--cover)] text-[var(--cover-text)] [backface-visibility:hidden] [clip-path:inset(0_0.5%_0_0.5%)]">
              <h2 className="m-0 px-[8%] text-center text-[3.2vmin] font-semibold leading-tight [font-family:var(--font-display)]">
                {coverTitle}
              </h2>
              <span className="h-px w-[30%] bg-current opacity-40" />
              <p className="m-0 text-[1.2vmin] uppercase tracking-[0.3em] opacity-60 [font-family:var(--font-body)]">
                {coverSubtitle}
              </p>
              <Emblem className="absolute bottom-[5%] right-[5%] h-[15%] -rotate-[25deg] opacity-70" />
            </div>
            <div className="absolute left-0 top-0 h-full w-full rounded-l-[5%] bg-[var(--cover)] [backface-visibility:hidden] [clip-path:inset(0_0.5%_0_0.5%)] [transform:rotateY(180deg)_translate3d(0,0,1px)]">
              <div className="absolute right-[-1rem] top-1/2 h-[94%] w-[94%] -translate-y-1/2 rounded-l-[5%] bg-[var(--insert)]" />
            </div>
          </div>

          {Array.from({ length: pageCount }, (_, p) => (
            <div
              key={p}
              ref={(el) => (pageRefs.current[p + 1] = el)}
              style={{ "--z": (pageCount - p) * 2 }}
              className={`${PAGE} left-[2%] top-[3%] h-[94%] w-[94%] rounded-r-[5%]`}
            >
              <div className={HALF_FRONT}>
                <BookPage
                  page={pageAt(p * 2)}
                  number={p * 2 + 1}
                  side="front"
                  runningTitle={runningTitle}
                  chapterLabel={chapterLabel}
                />
              </div>
              <div className={HALF_BACK}>
                <BookPage
                  page={pageAt(p * 2 + 1)}
                  number={p * 2 + 2}
                  side="back"
                  runningTitle={runningTitle}
                  chapterLabel={chapterLabel}
                />
              </div>
            </div>
          ))}

          <div
            ref={(el) => (pageRefs.current[pageCount + 1] = el)}
            style={{ "--z": 0 }}
            className={`${PAGE} left-0 top-0 h-full w-full rounded-r-[5%] bg-[var(--cover)]`}
          >
            <div className="absolute left-0 top-0 h-full w-full rounded-r-[5%] border-l-[1rem] border-[var(--spine)] bg-[var(--cover)] [backface-visibility:hidden] [clip-path:inset(0_0.5%_0_0.5%)]" />
            <div className="absolute left-0 top-0 h-full w-full rounded-l-[5%] bg-[var(--cover)] [backface-visibility:hidden] [clip-path:inset(0_0.5%_0_0.5%)] [transform:rotateY(180deg)_translate3d(0,0,1px)]">
              <div className="absolute left-0 top-1/2 flex h-[94%] w-[94%] -translate-y-1/2 items-center justify-center rounded-r-[5%] bg-[var(--insert)] text-neutral-800">
                <div ref={emblemRef} className="flex flex-col items-center gap-3 opacity-0">
                  <Emblem className="h-[6vmin] w-[6vmin]" />
                  <p className="m-0 text-[1.4vmin] uppercase tracking-[0.3em] [font-family:var(--font-body)]">
                    {backCoverText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}