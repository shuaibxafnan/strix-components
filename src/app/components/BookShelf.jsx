"use client";

import { useEffect, useRef, useState } from "react";

// ─── BookShelf ────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// books              array    (see DEFAULT_BOOKS)   Array of book objects
// defaultOpenIndex   number   2                     Index in books array that opens by default
// shelfMaxWidth      string   "800px"               Max width of the shelf
// overlayFontSize    string   "20rem"               Size of the background title overlay text
// darkMode           bool     false                 Initial dark mode state
// showThemeToggle    bool     true                  Show theme toggle dot
// enableDotGrid      bool     true                  Show dot grid background
// bookHeight         number   220                   Height of book items in px
// bookWidth          number   160                   Width of book covers in px
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_BOOKS = [
  {
    index: "0",
    title: "The Complete Works",
    overlayTitle: "The Complete Works",
    coverSrc:
      "https://covers.shakespeareandcompany.com/97818386/9781838661533.jpg",
    coverAlt: "Dieter Rams: The Complete Works",
    descTitle: "Dieter Rams: The Complete Works",
    author: "by Klaus Klemp",
    description:
      "From legendary music producer Rick Rubin comes a profound guide to the powerful source of creative inspiration. The Creative Act is a beautiful and generous course of study that illuminates the path of the artist as a road we all can follow.",
  },
  {
    index: "1",
    title: "Simple Living",
    overlayTitle: "Simple Living",
    coverSrc:
      "https://covers.shakespeareandcompany.com/97802413/9780241371831.jpg",
    coverAlt: "Zen: The Art of Simple Living",
    descTitle: "Zen: The Art of Simple Living",
    author: "by Shunmyo Masuno",
    description:
      "Drawing on centuries of wisdom, renowned Zen Buddhist priest Shunmyo Masuno applies the essence of Zen to modern life. Through simple, practical lessons, discover how a few minutes a day can transform your life and bring happiness and fulfillment.",
  },
  {
    index: "2",
    title: "Ten Principles for Good Design",
    overlayTitle: "Ten Principles for Good Design",
    coverSrc:
      "https://covers.shakespeareandcompany.com/97837913/9783791387321.jpg",
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
  overlayTitle: "Design Systems",
  descTitle: "Design Systems",
  author: "A Practical Guide",
  description:
    "A comprehensive guide to creating, documenting, and maintaining design systems. This book covers the essential elements of design systems, from typography and color to components and patterns, helping teams build cohesive and scalable product experiences.",
};

export default function BookShelf({
  books = DEFAULT_BOOKS,
  sideBook = SIDE_BOOK,
  defaultOpenIndex = 2,
  shelfMaxWidth = "800px",
  overlayFontSize = "20rem",
  darkMode: initialDarkMode = false,
  showThemeToggle = true,
  enableDotGrid = true,
  bookHeight = 220,
  bookWidth = 160,
}) {
  const [isDark, setIsDark] = useState(initialDarkMode);
  const [activeIndex, setActiveIndex] = useState(String(defaultOpenIndex));
  const [overlayTitle, setOverlayTitle] = useState(
    books[defaultOpenIndex]?.overlayTitle ?? "",
  );

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

  // sync dark mode to localStorage on client only
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

  // Load GSAP and wire animations
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-gsap-src="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-gsap-src", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    ).then(() => {
      const gsap = window.gsap;
      if (!gsap) return;
      gsapRef.current = gsap;
      gsap.config({ trialWarn: false });

      // Build timelines for each book
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

      // Side book timeline
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

      // Play default open book
      const defaultKey = String(defaultOpenIndex);
      const defaultTl = bookTimelinesRef.current[defaultKey];
      if (defaultTl) {
        defaultTl.play();
        activeTimelineRef.current = defaultTl;
        activeKeyRef.current = defaultKey;
      }

      // Animate in default description lines
      animateDescIn(defaultKey);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBookEnter = (key, title) => {
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
    setOverlayTitle(title);
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
    setOverlayTitle(books[defaultOpenIndex]?.overlayTitle ?? "");
    animateDescIn(defaultKey);
  };

  // CSS variable values driven by isDark
  const cssVars = {
    "--bg-color": isDark ? "#121212" : "#ffffff",
    "--text-color": isDark ? "#e0e0e0" : "#333333",
    "--title-color": isDark ? "#ffffff" : "#000000",
    "--overlay-text-color": isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.05)",
    "--shelf-bg": isDark
      ? "linear-gradient(to bottom, #2a2a2a, #1a1a1a)"
      : "linear-gradient(to bottom, #f0f0f0, #e0e0e0)",
    "--book-back-cover": isDark ? "#ffffff" : "#111111",
    "--book-page": isDark ? "#ffffff" : "#ffffff",
    "--book-shadow": isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)",
    "--side-book-bg": isDark
      ? "linear-gradient(to right, #222 0%, #444 50%, #222 100%)"
      : "linear-gradient(to right, #444 0%, #666 50%, #444 100%)",
    "--side-book-text": isDark ? "#ffffff" : "#f0f0f0",
    "--toggle-dot": isDark ? "#ffffff" : "#333333",
  };

  const shelfBottom = 270;
  const booksWrapperBottom = shelfBottom + 17;
  const shadowBottom = shelfBottom - 2;

  return (
    <div
      className="relative w-full h-screen flex justify-center items-center overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-color)", ...cssVars }}
    >
      {/* Font faces */}
      <style>{`
        @font-face {
          font-family: 'Cabinet Grotesk';
          font-style: normal;
          font-weight: 800;
          src: url('https://fonts.cdnfonts.com/s/85514/CabinetGrotesk-Extrabold.woff') format('woff');
        }
        @font-face {
          font-family: 'Cabinet Grotesk';
          font-style: normal;
          font-weight: 400;
          src: url('https://fonts.cdnfonts.com/s/85514/CabinetGrotesk-Medium.woff') format('woff');
        }
        body { font-family: 'Cabinet Grotesk', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Theme toggle */}
      {showThemeToggle && (
        <button
          onClick={toggleTheme}
          className="fixed top-5 right-5 w-2 h-2 rounded-full z-[100] cursor-pointer border-0 p-0 transition-colors duration-300"
          style={{ backgroundColor: "var(--toggle-dot)" }}
          aria-label="Toggle theme"
        />
      )}

      {/* Dot grid */}
      {enableDotGrid && (
        <svg
          className="absolute w-full h-full z-0 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dotGrid"
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
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      )}

      {/* Background overlay title */}
      <div className="fixed inset-0 flex justify-center items-center z-[-1] pointer-events-none">
        <span
          className="font-extrabold uppercase text-center leading-none"
          style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: overlayFontSize,
            color: "var(--overlay-text-color)",
            maxWidth: "90vw",
            transition: "color 0.5s ease",
          }}
        >
          {overlayTitle}
        </span>
      </div>

      {/* Shelf container */}
      <div
        ref={containerRef}
        className="relative w-full z-[1]"
        style={{ height: 500 }}
        onMouseLeave={handleShelfLeave}
      >
        {/* Shadows */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex justify-center items-end gap-8 z-[15]"
          style={{ bottom: shadowBottom }}
        >
          {books.map((book, idx) => {
            const isBeforeSide = sideBook && idx === 1;
            return (
              <>
                {isBeforeSide && (
                  <div
                    key="side-shadow"
                    ref={(el) => (sideShadowRef.current = el)}
                    className="h-[2px] rounded-full"
                    style={{
                      width: 25,
                      background:
                        "radial-gradient(ellipse at center, var(--book-shadow) 0%, rgba(0,0,0,0) 70%)",
                    }}
                  />
                )}
                <div
                  key={book.index}
                  ref={(el) => {
                    shadowRefs.current[book.index] = el;
                    shadowRefs.current[`book-${idx}`] = el;
                  }}
                  className="h-[2px] rounded-full"
                  style={{
                    width: 120,
                    background:
                      "radial-gradient(ellipse at center, var(--book-shadow) 0%, rgba(0,0,0,0) 70%)",
                  }}
                />
              </>
            );
          })}
        </div>

        {/* Shelf board */}
        <div
          className="absolute left-1/2 -translate-x-1/2 h-[15px] z-20 rounded-[1px]"
          style={{
            bottom: shelfBottom,
            width: "100%",
            maxWidth: shelfMaxWidth,
            background: "var(--shelf-bg)",
            boxShadow:
              "0px -1px 1px rgba(255,255,255,0.15), 0px 2px 3px rgba(0,0,0,0.12), 0px 5px 10px rgba(0,0,0,0.08), 0px 15px 20px rgba(0,0,0,0.06), 0px 40px 60px rgba(0,0,0,0.2), 0px 60px 80px rgba(0,0,0,0.12)",
            transition: "background 0.5s ease",
          }}
        />

        {/* Books wrapper */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex justify-center items-end gap-8 z-[10]"
          style={{ bottom: booksWrapperBottom }}
        >
          {books.map((book, idx) => {
            const showSideBefore = sideBook && idx === 1;
            return (
              <>
                {showSideBefore && (
                  <SideBookItem
                    key="side-book"
                    book={sideBook}
                    bookHeight={bookHeight}
                    bookRef={(el) => (sideBookRef.current = el)}
                    onMouseEnter={() =>
                      handleBookEnter(sideBook.index, sideBook.overlayTitle)
                    }
                  />
                )}
                <BookItem
                  key={book.index}
                  book={book}
                  bookHeight={bookHeight}
                  bookWidth={bookWidth}
                  refsCallback={(key, refs) => {
                    bookRefs.current[key] = refs;
                  }}
                  onMouseEnter={() =>
                    handleBookEnter(book.index, book.overlayTitle)
                  }
                />
              </>
            );
          })}
        </div>

        {/* Descriptions */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-full z-[5]"
          style={{ bottom: 30, maxWidth: 640, height: 200 }}
        >
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
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BookItem ─────────────────────────────────────────────────────────────────
function BookItem({ book, bookHeight, bookWidth, refsCallback, onMouseEnter }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="text-center cursor-default"
      style={{ height: bookHeight }}
      onMouseEnter={onMouseEnter}
    >
      <div
        className="relative mx-auto"
        style={{ width: bookWidth, height: "100%" }}
      >
        <div className="relative h-full" style={{ willChange: "transform" }}>
          {/* Back cover */}
          <div
            className="absolute rounded-r-[6px]"
            style={{
              width: "96%",
              height: "96%",
              top: "2%",
              left: "2%",
              background: "var(--book-back-cover)",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.25)",
              zIndex: -10,
              transition: "background 0.5s ease",
            }}
          />
          {/* Pages */}
          <div
            className="absolute"
            style={{
              width: "90%",
              height: "94%",
              top: "3%",
              left: "5%",
              zIndex: 0,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => (pageRefs.current[i] = el)}
                className="absolute top-0 right-0 rounded-r-[6px]"
                style={{
                  width: "98%",
                  height: "100%",
                  background: "var(--book-page)",
                  border: "1px solid rgba(0,0,0,0.2)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  transformOrigin: "right center",
                  zIndex: -5,
                  transition: "background 0.5s ease",
                }}
              />
            ))}
          </div>
          {/* Front cover */}
          <div
            ref={imageRef}
            className="relative h-full rounded-[2px_6px_6px_2px] cursor-pointer"
            style={{
              lineHeight: 0,
              transformOrigin: "left center",
              zIndex: 10,
              willChange: "transform, box-shadow",
              transition: "box-shadow 0.5s ease",
            }}
          >
            <img
              src={book.coverSrc}
              alt={book.coverAlt}
              className="w-full h-full object-cover rounded-[2px_6px_6px_2px]"
            />
            <div
              ref={effectRef}
              className="absolute top-0 h-full"
              style={{
                width: 24,
                marginLeft: 12,
                borderLeft: "2px solid rgba(0,0,0,0.08)",
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)",
                transformOrigin: "left center",
                zIndex: 5,
                pointerEvents: "none",
                willChange: "margin-left",
              }}
            />
            <div
              ref={lightRef}
              className="absolute inset-0 rounded-[2px_6px_6px_2px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 100%)",
                opacity: 0.15,
                transformOrigin: "left center",
                zIndex: 4,
                pointerEvents: "none",
                mixBlendMode: "overlay",
                willChange: "opacity",
              }}
            />
          </div>
          {/* Hitbox */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            data-book-index={book.index}
            data-book-title={book.overlayTitle}
          />
        </div>
      </div>
    </div>
  );
}

// ─── SideBookItem ─────────────────────────────────────────────────────────────
function SideBookItem({ book, bookHeight, bookRef, onMouseEnter }) {
  return (
    <div
      ref={bookRef}
      className="relative cursor-pointer rounded-[2px]"
      style={{
        height: bookHeight,
        width: 30,
        background: "var(--side-book-bg)",
        boxShadow:
          "var(--book-shadow) 5px -3px 10px, var(--book-shadow) 10px 0px 15px",
        transformOrigin: "bottom center",
        willChange: "transform, box-shadow",
        transition: "background 0.5s ease, box-shadow 0.5s ease",
      }}
      onMouseEnter={onMouseEnter}
    >
      <div
        className="absolute inset-0 flex justify-center items-center"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          color: "var(--side-book-text)",
          fontSize: 12,
          padding: "5px 0",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 1,
          transition: "color 0.5s ease",
          fontFamily: "'Cabinet Grotesk', sans-serif",
        }}
      >
        {book.title}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 20,
          width: "80%",
          height: 1,
          backgroundColor: "rgba(255,255,255,0.3)",
          transition: "background-color 0.5s ease",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 20,
          width: "80%",
          height: 1,
          backgroundColor: "rgba(255,255,255,0.3)",
          transition: "background-color 0.5s ease",
        }}
      />
    </div>
  );
}

// ─── BookDescription ──────────────────────────────────────────────────────────
function BookDescription({ book, isActive, linesRef, isDark }) {
  // Collect line refs for each text row
  const rows = [book.descTitle, book.author, book.description];

  return (
    <div
      className="absolute top-0 left-0 w-full transition-[opacity,visibility] duration-300"
      style={{
        opacity: isActive ? 1 : 0,
        visibility: isActive ? "visible" : "hidden",
        fontFamily: "'Cabinet Grotesk', sans-serif",
        fontWeight: 400,
        fontSize: "1.1rem",
        lineHeight: 1.5,
        color: "var(--text-color)",
        transition: "opacity 0.3s ease, visibility 0.3s ease, color 0.5s ease",
      }}
    >
      {/* Title */}
      <div className="overflow-hidden">
        <div
          ref={(el) => linesRef(el, 0)}
          className="block"
          style={{
            fontWeight: 800,
            fontSize: "1.8rem",
            marginBottom: "0.5rem",
            color: "var(--title-color)",
            transition: "color 0.5s ease",
          }}
        >
          {book.descTitle}
        </div>
      </div>
      {/* Author */}
      <div className="overflow-hidden">
        <div
          ref={(el) => linesRef(el, 1)}
          className="block italic"
          style={{ opacity: 0.8, marginBottom: "1rem" }}
        >
          {book.author}
        </div>
      </div>
      {/* Description */}
      <div className="overflow-hidden">
        <div
          ref={(el) => linesRef(el, 2)}
          className="block"
          style={{ marginBottom: "0.75rem" }}
        >
          {book.description}
        </div>
      </div>
    </div>
  );
}
