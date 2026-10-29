"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";

const GSAP_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

const cover = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=480&h=660&q=80`;

const DEFAULT_BOOKS = [
  {
    index: "0",
    title: "The Complete Works",
    coverSrc: cover("1759458856846-097935f54111"),
    coverAlt: "Dieter Rams: The Complete Works",
    descTitle: "Dieter Rams: The Complete Works",
    author: "by Klaus Klemp",
    description:
      "From legendary music producer Rick Rubin comes a profound guide to the powerful source of creative inspiration. The Creative Act is a beautiful and generous course of study that illuminates the path of the artist as a road we all can follow.",
  },
  {
    index: "1",
    title: "Simple Living",
    coverSrc: cover("1533387520709-752d83de3630"),
    coverAlt: "Zen: The Art of Simple Living",
    descTitle: "Zen: The Art of Simple Living",
    author: "by Shunmyo Masuno",
    description:
      "Drawing on centuries of wisdom, renowned Zen Buddhist priest Shunmyo Masuno applies the essence of Zen to modern life. Through simple, practical lessons, discover how a few minutes a day can transform your life and bring happiness and fulfillment.",
  },
  {
    index: "2",
    title: "Ten Principles for Good Design",
    coverSrc: cover("1752150127767-77bccbed07e2"),
    coverAlt: "Dieter Rams: Ten Principles for Good Design",
    descTitle: "Dieter Rams: Ten Principles for Good Design",
    author: "by Dieter Rams",
    description:
      "The definitive resource for designers at all levels. This comprehensive guide covers Dieter Rams' famous ten principles for good design, providing essential knowledge for creating functional, aesthetic, and long-lasting design solutions.",
  },
];

const SIDE_BOOK = {
  index: "side",
  title: "Design Systems",
  descTitle: "Design Systems",
  author: "A Practical Guide",
  description:
    "A comprehensive guide to creating, documenting, and maintaining design systems. This book covers the essential elements of design systems, from typography and color to components and patterns, helping teams build cohesive and scalable product experiences.",
};

const SHADOW_BLOB =
  "h-[2px] rounded-full bg-[radial-gradient(ellipse_at_center,var(--book-shadow)_0%,rgba(0,0,0,0)_70%)]";

export default function BookShelf({
  books = DEFAULT_BOOKS,
  sideBook = SIDE_BOOK,
  defaultOpenIndex = 2,
  shelfMaxWidth = "800px",
  fontFamily = "Bricolage Grotesque",
  darkMode: initialDarkMode = false,
  showThemeToggle = true,
  themeToggleLabel = "Toggle theme",
  enableDotGrid = true,
  bookHeight = 220,
  bookWidth = 160,
}) {
  const gridId = `dotGrid${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [isDark, setIsDark] = useState(initialDarkMode);
  const [activeIndex, setActiveIndex] = useState(String(defaultOpenIndex));

  const gsapRef = useRef(null);
  const bookTimelinesRef = useRef({});
  const sideTimelineRef = useRef(null);
  const activeTimelineRef = useRef(null);
  const activeKeyRef = useRef(String(defaultOpenIndex));

  const bookRefs = useRef({});
  const sideBookRef = useRef(null);
  const shadowRefs = useRef({});
  const sideShadowRef = useRef(null);
  const descLineRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("bookshelf-theme");
    if (saved === "dark") setIsDark(true);
    else if (saved === "light") setIsDark(false);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("bookshelf-theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(
          `script[data-gsap-src="${src}"]`,
        );
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
        el.setAttribute("data-gsap-src", src);
        el.onload = () => {
          el.dataset.loaded = "true";
          resolve();
        };
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript(GSAP_URL)
      .then(() => {
        const gsap = window.gsap;
        if (cancelled || !gsap) return;
        gsapRef.current = gsap;
        gsap.config({ trialWarn: false });

        books.forEach((book, idx) => {
          const key = book.index;
          const refs = bookRefs.current[key];
          if (!refs) return;

          const shadowEl =
            shadowRefs.current[key] ?? shadowRefs.current[`book-${idx}`];

          gsap.set(refs.image, {
            boxShadow:
              "rgba(0,0,0,0.15) 10px 5px 20px, rgba(0,0,0,0.15) 20px 0px 30px",
          });
          gsap.set(refs.light, { opacity: 0.1 });
          gsap.set(refs.pages, { x: 0 });

          const tl = gsap.timeline({
            paused: true,
            defaults: { duration: 0.7, ease: "power2.out" },
          });

          tl.to(
            refs.image,
            {
              translateX: -10,
              scaleX: 0.96,
              boxShadow:
                "rgba(0,0,0,0.35) 20px 5px 20px, rgba(0,0,0,0.15) 30px 0px 30px",
            },
            0,
          );

          if (shadowEl) {
            tl.to(shadowEl, { width: 130, opacity: 0.8 }, 0);
          }

          tl.to(refs.effect, { marginLeft: 10 }, 0);
          tl.to(refs.light, { opacity: 0.2 }, 0);

          if (refs.pages?.length >= 3) {
            tl.to(refs.pages[0], { x: "2px", ease: "power1.inOut" }, 0);
            tl.to(refs.pages[1], { x: "0px", ease: "power1.inOut" }, 0);
            tl.to(refs.pages[2], { x: "-2px", ease: "power1.inOut" }, 0);
          }

          bookTimelinesRef.current[key] = tl;
        });

        if (sideBookRef.current && sideBook) {
          const sideTl = gsap.timeline({
            paused: true,
            defaults: { duration: 0.5, ease: "power2.out" },
          });
          sideTl.to(
            sideBookRef.current,
            {
              y: -5,
              boxShadow:
                "rgba(0,0,0,0.15) 8px -5px 15px, rgba(0,0,0,0.15) 15px 0px 20px",
            },
            0,
          );
          if (sideShadowRef.current) {
            sideTl.to(sideShadowRef.current, { width: 35, opacity: 0.8 }, 0);
          }
          sideTimelineRef.current = sideTl;
          bookTimelinesRef.current["side"] = sideTl;
        }

        const defaultKey = String(defaultOpenIndex);
        const defaultTl = bookTimelinesRef.current[defaultKey];
        if (defaultTl) {
          defaultTl.play();
          activeTimelineRef.current = defaultTl;
          activeKeyRef.current = defaultKey;
        }

        animateDescIn(defaultKey);
      })
      .catch((e) => console.error("[BookShelf] GSAP load failed:", e.message));

    return () => {
      cancelled = true;
      Object.values(bookTimelinesRef.current).forEach((tl) => tl.kill());
      bookTimelinesRef.current = {};
    };
  }, []);

  const animateDescIn = (key) => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const lines = descLineRefs.current[key];
    if (!lines || lines.length === 0) return;
    gsap.fromTo(
      lines,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power1.out",
      },
    );
  };

  const animateDescOut = (key) => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const lines = descLineRefs.current[key];
    if (!lines || lines.length === 0) return;
    gsap.to(lines, {
      yPercent: 100,
      opacity: 0,
      duration: 0.4,
      ease: "power1.in",
      stagger: 0.03,
    });
  };

  const handleBookEnter = (key) => {
    const gsap = gsapRef.current;
    if (!gsap) return;

    const prevKey = activeKeyRef.current;
    const prevTl = activeTimelineRef.current;

    if (prevKey !== key && prevTl) {
      prevTl.reverse();
      animateDescOut(prevKey);
    }

    const tl = bookTimelinesRef.current[key];
    if (tl) {
      tl.play();
      activeTimelineRef.current = tl;
    }
    activeKeyRef.current = key;
    setActiveIndex(key);
    animateDescIn(key);
  };

  const handleShelfLeave = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const defaultKey = String(defaultOpenIndex);
    const prevKey = activeKeyRef.current;
    const prevTl = activeTimelineRef.current;

    if (prevKey !== defaultKey && prevTl) {
      prevTl.reverse();
      animateDescOut(prevKey);
    }

    const defaultTl = bookTimelinesRef.current[defaultKey];
    if (defaultTl) {
      defaultTl.play();
      activeTimelineRef.current = defaultTl;
    }
    activeKeyRef.current = defaultKey;
    setActiveIndex(defaultKey);
    animateDescIn(defaultKey);
  };

  const cssVars = {
    "--font": `"${fontFamily}", sans-serif`,
    "--shelf-w": shelfMaxWidth,
    "--book-h": `${bookHeight}px`,
    "--book-w": `${bookWidth}px`,
    "--bg-color": isDark ? "#121212" : "#ffffff",
    "--text-color": isDark ? "#e0e0e0" : "#333333",
    "--title-color": isDark ? "#ffffff" : "#000000",
    "--shelf-bg": isDark
      ? "linear-gradient(to bottom, #2a2a2a, #1a1a1a)"
      : "linear-gradient(to bottom, #f0f0f0, #e0e0e0)",
    "--book-back-cover": isDark ? "#ffffff" : "#111111",
    "--book-page": "#ffffff",
    "--book-shadow": isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)",
    "--side-book-bg": isDark
      ? "linear-gradient(to right, #222 0%, #444 50%, #222 100%)"
      : "linear-gradient(to right, #444 0%, #666 50%, #444 100%)",
    "--side-book-text": isDark ? "#ffffff" : "#f0f0f0",
    "--toggle-dot": isDark ? "#ffffff" : "#333333",
  };

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--bg-color)] font-[family-name:var(--font)] tracking-[-0.02em] transition-colors duration-500"
      style={cssVars}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap"
      />

      {showThemeToggle && (
        <button
          type="button"
          onClick={toggleTheme}
          className="fixed right-5 top-5 z-[100] h-2 w-2 cursor-pointer rounded-full border-0 bg-[var(--toggle-dot)] p-0 transition-colors duration-300"
          aria-label={themeToggleLabel}
        />
      )}

      {enableDotGrid && (
        <svg
          className="pointer-events-none absolute z-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={gridId}
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                fill={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.15)"}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridId})`} />
        </svg>
      )}

      <div
        ref={containerRef}
        className="relative z-[1] h-[500px] w-full"
        onMouseLeave={handleShelfLeave}
      >
        <div className="absolute bottom-[268px] left-1/2 z-[15] flex -translate-x-1/2 items-end justify-center gap-8">
          {books.map((book, idx) => (
            <Fragment key={book.index}>
              {sideBook && idx === 1 && (
                <div
                  ref={(el) => (sideShadowRef.current = el)}
                  className={`w-[25px] ${SHADOW_BLOB}`}
                />
              )}
              <div
                ref={(el) => {
                  shadowRefs.current[book.index] = el;
                  shadowRefs.current[`book-${idx}`] = el;
                }}
                className={`w-[120px] ${SHADOW_BLOB}`}
              />
            </Fragment>
          ))}
        </div>

        <div className="absolute bottom-[270px] left-1/2 z-20 h-[15px] w-full max-w-[var(--shelf-w)] -translate-x-1/2 rounded-[1px] shadow-[0px_-1px_1px_rgba(255,255,255,0.15),0px_2px_3px_rgba(0,0,0,0.12),0px_5px_10px_rgba(0,0,0,0.08),0px_15px_20px_rgba(0,0,0,0.06),0px_40px_60px_rgba(0,0,0,0.2),0px_60px_80px_rgba(0,0,0,0.12)] [background:var(--shelf-bg)] [transition:background_0.5s_ease]" />

        <div className="absolute bottom-[287px] left-1/2 z-10 flex -translate-x-1/2 items-end justify-center gap-8">
          {books.map((book, idx) => (
            <Fragment key={book.index}>
              {sideBook && idx === 1 && (
                <SideBookItem
                  book={sideBook}
                  bookRef={(el) => (sideBookRef.current = el)}
                  onMouseEnter={() => handleBookEnter(sideBook.index)}
                />
              )}
              <BookItem
                book={book}
                refsCallback={(key, refs) => {
                  bookRefs.current[key] = refs;
                }}
                onMouseEnter={() => handleBookEnter(book.index)}
              />
            </Fragment>
          ))}
        </div>

        <div className="absolute bottom-[30px] left-1/2 z-[5] h-[200px] w-full max-w-[640px] -translate-x-1/2">
          {[...(sideBook ? [sideBook] : []), ...books].map((book) => (
            <BookDescription
              key={book.index}
              book={book}
              isActive={activeIndex === book.index}
              linesRef={(el, i) => {
                if (!descLineRefs.current[book.index])
                  descLineRefs.current[book.index] = [];
                if (el) descLineRefs.current[book.index][i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BookItem({ book, refsCallback, onMouseEnter }) {
  const imageRef = useRef(null);
  const effectRef = useRef(null);
  const lightRef = useRef(null);
  const pageRefs = useRef([]);

  useEffect(() => {
    refsCallback(book.index, {
      image: imageRef.current,
      effect: effectRef.current,
      light: lightRef.current,
      pages: pageRefs.current,
    });
  }, []);

  return (
    <div
      className="h-[var(--book-h)] cursor-default text-center"
      onMouseEnter={onMouseEnter}
    >
      <div className="relative mx-auto h-full w-[var(--book-w)]">
        <div className="relative h-full will-change-transform">
          <div className="absolute left-[2%] top-[2%] z-[-10] h-[96%] w-[96%] rounded-r-[6px] bg-[var(--book-back-cover)] shadow-[2px_2px_5px_rgba(0,0,0,0.25)] transition-[background] duration-500" />

          <div className="absolute left-[5%] top-[3%] z-0 h-[94%] w-[90%]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => (pageRefs.current[i] = el)}
                className="absolute right-0 top-0 z-[-5] h-full w-[98%] origin-right rounded-r-[6px] border border-black/20 bg-[var(--book-page)] shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-[background] duration-500"
              />
            ))}
          </div>

          <div
            ref={imageRef}
            className="relative z-10 h-full origin-left cursor-pointer rounded-[2px_6px_6px_2px] leading-[0] will-change-[transform,box-shadow] [transition:box-shadow_0.5s_ease]"
          >
            <img
              src={book.coverSrc}
              alt={book.coverAlt}
              className="h-full w-full rounded-[2px_6px_6px_2px] object-cover"
            />
            <div
              ref={effectRef}
              className="pointer-events-none absolute top-0 z-[5] ml-3 h-full w-6 origin-left border-l-2 border-black/[0.08] bg-[linear-gradient(90deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_100%)] will-change-[margin-left]"
            />
            <div
              ref={lightRef}
              className="pointer-events-none absolute inset-0 z-[4] origin-left rounded-[2px_6px_6px_2px] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_100%)] opacity-[0.15] mix-blend-overlay will-change-[opacity]"
            />
          </div>

          <div
            className="absolute inset-0 z-10 cursor-pointer"
            data-book-index={book.index}
          />
        </div>
      </div>
    </div>
  );
}

function SideBookItem({ book, bookRef, onMouseEnter }) {
  return (
    <div
      ref={bookRef}
      className="relative h-[var(--book-h)] w-[30px] origin-bottom cursor-pointer rounded-[2px] will-change-[transform,box-shadow] [background:var(--side-book-bg)] [box-shadow:var(--book-shadow)_5px_-3px_10px,var(--book-shadow)_10px_0px_15px] [transition:background_0.5s_ease,box-shadow_0.5s_ease]"
      onMouseEnter={onMouseEnter}
    >
      <div className="absolute inset-0 flex rotate-180 items-center justify-center py-[5px] text-center text-xs uppercase tracking-[1px] text-[var(--side-book-text)] transition-colors duration-500 [text-orientation:mixed] [writing-mode:vertical-rl]">
        {book.title}
      </div>
      <div className="absolute left-1/2 top-5 h-px w-4/5 -translate-x-1/2 bg-white/30 transition-colors duration-500" />
      <div className="absolute bottom-5 left-1/2 h-px w-4/5 -translate-x-1/2 bg-white/30 transition-colors duration-500" />
    </div>
  );
}

function BookDescription({ book, isActive, linesRef }) {
  return (
    <div
      className={`absolute left-0 top-0 w-full text-[1.1rem] font-normal leading-normal text-[var(--text-color)] [transition:opacity_0.3s_ease,visibility_0.3s_ease,color_0.5s_ease] ${isActive ? "visible opacity-100" : "invisible opacity-0"
        }`}
    >
      <div className="overflow-hidden">
        <div
          ref={(el) => linesRef(el, 0)}
          className="mb-2 block text-[1.8rem] font-extrabold text-[var(--title-color)] [transition:color_0.5s_ease]"
        >
          {book.descTitle}
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          ref={(el) => linesRef(el, 1)}
          className="mb-4 block italic opacity-80"
        >
          {book.author}
        </div>
      </div>
      <div className="overflow-hidden">
        <div ref={(el) => linesRef(el, 2)} className="mb-3 block">
          {book.description}
        </div>
      </div>
    </div>
  );
}