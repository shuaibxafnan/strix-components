"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const portrait = (gender, n) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

const Chevron = ({ dir = "right", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={dir === "right" ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
  </svg>
);

function Photo({ src, alt, className = "", size = "lg" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const initials = alt
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid place-items-center bg-gradient-to-br from-neutral-700 to-neutral-950 font-[family-name:var(--title)] text-white/30 ${size === "lg" ? "text-[14vmin]" : "text-lg"
          } ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export default function AbsintheGallery({
  bg = "#0b0b0b",
  fg = "#f4f4f2",
  accent = "#ffffff",
  shade = "#000000",
  onCard = "#ffffff",
  tint = "",
  tintOpacity = 0.7,
  grayscale = true,
  radius = "2px",
  titleFont = "Fredericka the Great",
  bodyFont = "Jost",
  serifFont = "Fleur De Leah",
  signatureFont = "Mrs Saint Delafield",
  headingTop = "Absinthe",
  headingAccent = "gallery",
  ofLabel = "of",
  className = "",

  galleryItems = [
    {
      id: 0,
      name: "Ernest Hemingway",
      signature: "Ernest Hemingway",
      frontImage: portrait("men", 32),
      frontAlt: "Ernest Hemingway",
      frontTitle: "Ernest Hemingway",
      frontDate: "July 21, 1899 to July 2, 1961",
      frontDesc:
        "American novelist, short-story writer, and journalist. His economical and understated style, which he termed the iceberg theory, had a strong influence on 20th-century fiction.",
      backImage: portrait("men", 45),
      backAlt: "Ernest Hemingway",
      backQuote:
        "Got tight last night on <b>absinthe</b> and did knife tricks. Great success shooting the knife into the piano. The woodworms are so bad and eat hell out of all furniture that you can always claim the woodworms did it.",
      backAttribution: "Ernest Hemingway, 1931 letter",
    },
    {
      id: 1,
      name: "Oscar Wilde",
      signature: "Oscar Wilde",
      frontImage: portrait("men", 76),
      frontAlt: "Oscar Wilde",
      frontTitle: "Oscar Wilde",
      frontDate: "October 16, 1854 to November 30, 1900",
      frontDesc:
        'Irish poet and playwright, one of the most popular playwrights in London in the early 1890s. Author of "The Picture of Dorian Gray".',
      backImage: portrait("men", 12),
      backAlt: "Oscar Wilde",
      backQuote:
        "After the first glass of <b>absinthe</b> you see things as you wish they were. After the second you see them as they are not. Finally you see things as they really are, and that is the most horrible thing in the world...",
      backAttribution: "Oscar Fingal O'Flahertie Wills Wilde",
    },
    {
      id: 2,
      name: "Vincent van Gogh",
      signature: "Vincent",
      frontImage: portrait("men", 54),
      frontAlt: "Vincent van Gogh",
      frontTitle: "Vincent van Gogh",
      frontDate: "March 30, 1853 to July 29, 1890",
      frontDesc:
        "Dutch Post-Impressionist painter who posthumously became one of the most famous and influential figures in Western art history.",
      backImage: portrait("men", 68),
      backAlt: "Vincent van Gogh",
      backQuote: "<strong>Still Life with Absinthe</strong>",
      backAttribution: "Vincent van Gogh, 1887",
    },
    {
      id: 3,
      name: "Pablo Picasso",
      signature: "Pablo Picasso",
      frontImage: portrait("men", 22),
      frontAlt: "Pablo Picasso",
      frontTitle: "Pablo Picasso",
      frontDate: "October 25, 1881 to April 8, 1973",
      frontDesc:
        "Spanish painter, sculptor, printmaker, ceramicist and theatre designer. Regarded as one of the most influential artists of the 20th century.",
      backImage: portrait("men", 81),
      backAlt: "Pablo Picasso",
      backQuote: "<strong>The Absinthe Drinker</strong>",
      backAttribution: "Pablo Picasso, 1901",
    },
    {
      id: 4,
      name: "Aleister Crowley",
      signature: "Aleister Crowley",
      frontImage: portrait("men", 9),
      frontAlt: "Aleister Crowley",
      frontTitle: "Aleister Crowley",
      frontDate: "October 12, 1875 to December 1, 1947",
      frontDesc:
        "English occultist, ceremonial magician, poet, painter, novelist, mountaineer, and founder of the religion of Thelema.",
      backImage: portrait("men", 60),
      backAlt: "Aleister Crowley",
      backQuote:
        "It is as if the first diviner of <b>absinthe</b> had been indeed a magician intent upon a combination of sacred drugs which should cleanse, fortify and perfume the human soul.",
      backAttribution: "Aleister Crowley, 'Absinthe The Green Goddess'",
    },
    {
      id: 5,
      name: "Marie Corelli",
      signature: "Marie Corelli",
      frontImage: portrait("women", 44),
      frontAlt: "Marie Corelli",
      frontTitle: "Marie Corelli",
      frontDate: "May 1, 1855 to April 21, 1924",
      frontDesc:
        "English novelist on topics of reincarnation, astral projection and mysticism. After her first novel, 'A Romance of Two Worlds' in 1886, she became a bestselling fiction writer in England.",
      backImage: portrait("women", 68),
      backAlt: "Marie Corelli",
      backQuote:
        "Let me be mad, then, by all means! Mad with the madness of <b>Absinthe</b>, the wildest, most luxurious madness in the world! Vive la folie! Vive l'amour! Vive l'animalisme! Vive le Diable!",
      backAttribution: "Marie Corelli",
    },
    {
      id: 6,
      name: "James Joyce",
      signature: "James Joyce",
      frontImage: portrait("men", 36),
      frontAlt: "James Joyce",
      frontTitle: "James Joyce",
      frontDate: "February 2, 1882 to January 13, 1941",
      frontDesc:
        "Irish novelist, short story writer, poet, and literary critic. He contributed to the modernist avant-garde movement and is regarded as one of the most influential and important writers of the 20th century.",
      backImage: portrait("men", 90),
      backAlt: "James Joyce",
      backQuote: "<strong>Green eyes, I see you. Fang, I feel.</strong>",
      backAttribution: "James Joyce, 'Ulysses', 1920",
    },
    {
      id: 7,
      name: "Hunter S. Thompson",
      signature: "Hunter S. Thompson",
      frontImage: portrait("men", 15),
      frontAlt: "Hunter S. Thompson",
      frontTitle: "Hunter S. Thompson",
      frontDate: "July 18, 1937 to February 20, 2005",
      frontDesc:
        "American journalist and author who founded the gonzo journalism movement. He remains best known for his book, 'Fear and Loathing in Las Vegas' (1971).",
      backImage: portrait("men", 71),
      backAlt: "Hunter S. Thompson",
      backQuote:
        'Let us toast to animal pleasures, to escapism, to rain on the roof and instant coffee, to unemployment insurance and library cards, to music and warm bodies and contraceptives... and to the "good life", whatever it is and wherever it happens to be.',
      backAttribution: "Hunter S. Thompson",
    },
    {
      id: 8,
      name: "Arthur Rimbaud",
      signature: "Arthur Rimbaud",
      frontImage: portrait("men", 28),
      frontAlt: "Arthur Rimbaud",
      frontTitle: "Arthur Rimbaud",
      frontDate: "October 20, 1854 to November 10, 1891",
      frontDesc:
        "French poet known for his transgressive and surreal themes and for his influence on modern literature and arts, prefiguring surrealism. Rimbaud completely stopped writing literature at age 20 after assembling his last major work, 'Illuminations'.",
      backImage: portrait("men", 3),
      backAlt: "Arthur Rimbaud",
      backQuote:
        "When the poet's pain is soothed by a liquid jewel held in the sacred chalice, upon which rests the pierced spoon, the crystal sweetness, icy streams trickle down. The darkest forest melts into an open meadow. Waves of green seduce. Sanity surrendered, the soul spirals toward the murky depths, wherin lies the beautiful madness: <b>absinthe</b>.",
      backAttribution: "Arthur Rimbaud",
    },
  ],
}) {
  const total = galleryItems.length;
  const [pageNum, setPageNum] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const sliderRef = useRef(null);
  const thumbsRef = useRef(null);

  const nextPage = useCallback(
    () => setPageNum((p) => Math.min(p + 1, total - 1)),
    [total]
  );
  const prevPage = useCallback(() => setPageNum((p) => Math.max(p - 1, 0)), []);

  const toggleAll = useCallback(() => {
    setFlippedCards((prev) => {
      const next = {};
      for (let i = 0; i < total; i++) next[i] = !prev[i];
      return next;
    });
  }, [total]);

  const toggleCard = (id) =>
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          prevPage();
          break;
        case "ArrowRight":
        case "ArrowUp":
          nextPage();
          break;
        case " ":
          e.preventDefault();
          toggleAll();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextPage, prevPage, toggleAll]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let startX = 0;
    let startY = 0;

    const onStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onEnd = (e) => {
      const dx = startX - e.changedTouches[0].clientX;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) nextPage();
        else if (dx < -50) prevPage();
      }
    };

    slider.addEventListener("touchstart", onStart, { passive: true });
    slider.addEventListener("touchend", onEnd);
    return () => {
      slider.removeEventListener("touchstart", onStart);
      slider.removeEventListener("touchend", onEnd);
    };
  }, [nextPage, prevPage]);

  useEffect(() => {
    const el = thumbsRef.current?.children[pageNum];
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pageNum]);

  const current = galleryItems[pageNum];
  const pad = (n) => String(n).padStart(2, "0");
  const photoFx = grayscale ? "grayscale" : "";

  const roundBtn =
    "grid h-11 w-11 place-items-center rounded-full border border-[color-mix(in_srgb,var(--fg)_25%,transparent)] bg-[color-mix(in_srgb,var(--bg)_55%,transparent)] text-[var(--fg)] backdrop-blur-md transition duration-300 hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-[color-mix(in_srgb,var(--fg)_25%,transparent)]";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fleur+De+Leah&family=Fredericka+the+Great&family=Jost:wght@300;400;500;600&family=Mrs+Saint+Delafield&display=swap"
      />

      <div
        className={`relative h-[100dvh] w-screen overflow-hidden bg-[var(--bg)] font-[family-name:var(--body)] text-[var(--fg)] selection:bg-[var(--fg)] selection:text-[var(--bg)] ${className}`}
        style={{
          "--bg": bg,
          "--fg": fg,
          "--accent": accent,
          "--shade": shade,
          "--on-card": onCard,
          "--radius": radius,
          "--title": `"${titleFont}", serif`,
          "--body": `"${bodyFont}", sans-serif`,
          "--serif": `"${serifFont}", serif`,
          "--sig": `"${signatureFont}", cursive`,
        }}
      >
        <div
          className="fixed left-0 top-0 z-[70] h-px bg-[var(--accent)] transition-all duration-700 ease-out"
          style={{ width: `${((pageNum + 1) / total) * 100}%` }}
        />

        <h1 className="pointer-events-none fixed left-5 top-5 z-30 font-[family-name:var(--title)] text-2xl leading-none text-[var(--fg)] sm:left-[4vmin] sm:top-[4vmin] sm:text-[6vmin]">
          {headingTop}
          <span className="block font-[family-name:var(--serif)] text-[1.3em] font-normal leading-[0.9] text-[var(--accent)] sm:ml-3 sm:inline-block sm:text-[1.6em]">
            {headingAccent}
          </span>
        </h1>

        <div
          ref={sliderRef}
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.2,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${pageNum * 100}vw)` }}
        >
          {galleryItems.map((item) => {
            const flipped = !!flippedCards[item.id];
            return (
              <div
                key={item.id}
                className="grid h-full w-screen shrink-0 place-items-center"
              >
                <article
                  onClick={() => toggleCard(item.id)}
                  aria-label={`${item.name}. Click to turn the card.`}
                  className="relative -mt-[6vmin] h-[74vmin] max-h-[620px] w-[74vmin] max-w-[620px] cursor-pointer overflow-hidden rounded-[var(--radius)] text-[var(--on-card)] shadow-[0_3vmin_6vmin_rgba(0,0,0,0.45)]"
                >
                  <div className="pointer-events-none absolute inset-[1.6vmin] z-[5] border border-[color-mix(in_srgb,var(--on-card)_28%,transparent)]" />

                  <span className="pointer-events-none absolute right-[5vmin] top-[4vmin] z-[6] max-w-[60%] -rotate-3 text-right font-[family-name:var(--sig)] text-[clamp(1.9rem,7.5vmin,3.6rem)] leading-none text-[var(--on-card)] [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                    {item.signature}
                  </span>

                  <section
                    className={`absolute inset-0 transition-opacity duration-500 ${flipped ? "z-0 opacity-0" : "z-[2] opacity-100"
                      }`}
                  >
                    <Photo
                      src={item.frontImage}
                      alt={item.frontAlt}
                      className={`absolute inset-0 h-full w-full ${photoFx}`}
                    />
                    {tint && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 mix-blend-multiply"
                        style={{ background: tint, opacity: tintOpacity }}
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_30%,color-mix(in_srgb,var(--shade)_88%,transparent)_100%)]"
                    />

                    <div
                      className={`absolute inset-x-0 bottom-0 p-[5.5vmin] text-[max(2.9vmin,12px)] leading-[1.45] transition duration-500 ${flipped ? "translate-y-3" : "translate-y-0"
                        }`}
                    >
                      <h3 className="mb-[0.3em] font-[family-name:var(--title)] text-[2.2em] font-normal leading-none">
                        {item.frontTitle}
                      </h3>
                      <p className="m-0">
                        <strong className="block text-[1.05em] font-medium tracking-wide text-[var(--accent)]">
                          {item.frontDate}
                        </strong>
                        <em className="mt-[0.5em] block max-w-[52ch] font-light not-italic opacity-90">
                          {item.frontDesc}
                        </em>
                      </p>
                    </div>
                  </section>

                  <section
                    className={`absolute inset-0 transition-opacity duration-500 ${flipped ? "z-[2] opacity-100" : "z-0 opacity-0"
                      }`}
                  >
                    <Photo
                      src={item.backImage}
                      alt={item.backAlt}
                      className={`absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-out ${photoFx} ${flipped ? "scale-105" : "scale-100"
                        }`}
                    />
                    {tint && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 mix-blend-multiply"
                        style={{ background: tint, opacity: tintOpacity }}
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--shade)_25%,transparent)_0%,color-mix(in_srgb,var(--shade)_92%,transparent)_100%)]"
                    />

                    <div
                      className={`absolute inset-x-0 bottom-0 p-[5.5vmin] text-[max(2.9vmin,12px)] leading-[1.75] transition duration-500 ${flipped ? "translate-y-0" : "translate-y-3"
                        }`}
                    >
                      <p className="m-0">
                        <q className="font-light">
                          <span
                            className="[&_b]:font-semibold [&_b]:text-[var(--accent)] [&_strong]:font-[family-name:var(--title)] [&_strong]:text-[1.5em] [&_strong]:font-normal"
                            dangerouslySetInnerHTML={{ __html: item.backQuote }}
                          />
                        </q>
                        <em className="mt-[0.6em] block font-[family-name:var(--serif)] text-[1.9em] not-italic leading-none text-[var(--accent)]">
                          {item.backAttribution}
                        </em>
                      </p>
                    </div>
                  </section>
                </article>
              </div>
            );
          })}
        </div>

        <nav
          aria-label="Gallery navigation"
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_85%,transparent),transparent)] px-5 pb-5 pt-8"
        >
          <div
            ref={thumbsRef}
            className="flex w-full max-w-3xl justify-start gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
          >
            {galleryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.name}
                aria-label={`Go to ${item.name}`}
                aria-current={pageNum === item.id}
                onClick={() => setPageNum(item.id)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius)] bg-neutral-900 transition duration-300 ${pageNum === item.id
                  ? "opacity-100 ring-2 ring-[var(--fg)]"
                  : "opacity-50 ring-1 ring-[color-mix(in_srgb,var(--fg)_25%,transparent)] hover:opacity-100"
                  }`}
              >
                <Photo
                  src={item.frontImage}
                  alt={item.name}
                  size="sm"
                  className={`h-full w-full ${photoFx}`}
                />
              </button>
            ))}
          </div>

          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={prevPage}
              disabled={pageNum === 0}
              aria-label="Previous portrait"
              className={roundBtn}
            >
              <Chevron dir="left" className="h-5 w-5" />
            </button>

            <div className="text-center leading-tight">
              <p className="m-0 font-[family-name:var(--sig)] text-3xl">
                {current.signature}
              </p>
              <p className="m-0 text-xs tabular-nums tracking-wide opacity-50">
                {pad(pageNum + 1)} {ofLabel} {pad(total)}
              </p>
            </div>

            <button
              type="button"
              onClick={nextPage}
              disabled={pageNum === total - 1}
              aria-label="Next portrait"
              className={roundBtn}
            >
              <Chevron dir="right" className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}