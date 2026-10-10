"use client";

import { useEffect, useRef, useState } from "react";

// ─── ScrollBook ───────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// bgColor          string   "hsl(0,0%,30%)"        Page background color
// spineColor       string   "hsl(0,0%,0%)"         Book spine color
// coverColor       string   "hsl(0,0%,10%)"        Book cover color
// insertColor      string   "hsl(0,0%,85%)"        Book insert/back page color
// pageColor        string   "hsl(0,0%,90%)"        Inner page base color
// underlineColor   string   "hsla(0,0%,25%,0.4)"   Ruled line color on pages
// pageCount        number   10                     Number of inner page spreads
// pageScroll       number   25                     vh units of scroll per page turn
// bookWidthVmin    number   30                     Book width in vmin units
// bookHeightVmin   number   40                     Book height in vmin units
// minBookWidth     number   150                    Minimum book width in px
// minBookHeight    number   200                    Minimum book height in px
// showTitle        boolean  true                   Show the "Scroll" h1 label
// ─────────────────────────────────────────────────────────────────────────────

const DEMOS = [
  { name: "Kitkat", id: "LYpNyvm" },
  { name: "Newton", id: "abzeaWJ" },
  { name: "Launch", id: "rNOqzbN" },
  { name: "Birthday", id: "BaobKOJ" },
  { name: "Impossible", id: "ZjLKGY" },
  { name: "Care", id: "RwPrOoz" },
  { name: "Cubes", id: "QWbRxXb" },
  { name: "Elon", id: "RwWMwvY" },
  { name: "Gun", id: "GRoKOyg" },
  { name: "Moon", id: "NWqemYK" },
  { name: "Pokedex", id: "eYpGQxr" },
  { name: "Record", id: "RwraKYZ" },
  { name: "Tcannon", id: "eYpmBxQ" },
  { name: "Cloud", id: "MWwRKvd" },
  { name: "Fireflies", id: "zYGQYWJ" },
  { name: "Train", id: "eYpdPWa" },
  { name: "Pancake", id: "jJVpWZ" },
  { name: "Earth", id: "aPzVme" },
  { name: "Matryoshka", id: "jOOYMLm" },
  { name: "Truck", id: "MWWowEb" },
];

const CODE_SNIPPET = `set(FOLD,{transformOrigin:"50% 100%",scaleY:0}),set(CLIPS,{transformOrigin:"50% 0"}),set(".cannon__shirt",{opacity:0}),set(".cannon",{y:28}),set(".text--ordered .char",{y:"100%"});const SPEED=.15,FOLD_TL=()=>new timeline().to(LEFT_ARM,{duration:SPEED,rotateY:-180,transformOrigin:${"${100*(22/65.3)}% 50%"},0).to(RIGHT_ARM,{duration:SPEED,rotateY:-180,transformOrigin:${"{100*((65.3-22)/65.3)}% 50%"},SPEED).to(FOLD,{duration:SPEED/4,scaleY:1},2*SPEED).to(FOLD,{duration:SPEED,y:-47},2*SPEED+.01).to(CLIPS,{duration:SPEED,scaleY:.2},2*SPEED).to(".cannon",{duration:SPEED,y:0},2*SPEED),LOAD_TL=()=>new timeline().to(".button__shirt",{transformOrigin:"50% 13%",rotate:90,duration:.15}).to(".button__shirt",{duration:.15,y:60}).to(".t-shirt__cannon",{y:5,repeat:1,yoyo:!0,duration:.1}).to(".t-shirt__cannon",{y:50,duration:.5,delay:.1}),FIRE_TL=()=>new timeline().set(".t-shirt__cannon",{rotate:48,x:-85,scale:2.5}).set(".cannon__shirt",{opacity:1}).to(".t-shirt__cannon-content",{duration:1,y:-35}).to(".t-shirt__cannon-content",{duration:.25,y:-37.5}).to(".t-shirt__cannon-content",{duration:.015,y:-30.5}).to(".cannon__shirt",{onStart:()=>CLIP.play(),duration:.5,y:"-25vmax"},"<").to(".text--ordered .char",{duration:.15,stagger:.1,y:"0%"}).to("button",{duration:.15*7,"--hue":116,"--lightness":55},"<"),ORDER_TL=new timeline({paused:!0});`;

// Bear sticker SVG — lives on the front cover's front half
function BearSticker() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 316 306"
      style={{
        height: "15%",
        position: "absolute",
        bottom: "5%",
        right: "5%",
        transform: "rotate(-25deg)",
      }}
    >
      <path
        d="M155 0c-37 0-63 8-85 30-6-6-21-7-29-7C22 23 6 38 6 56c1 24 9 34 24 40l-9 2-21 4 3 22c3 0 8 1 9 4 6 7 2 14 3 26 2 21 7 33 14 40 14 67 62 112 127 112 70 0 118-45 132-112 6-7 11-20 13-40 1-12-3-19 3-26 2-3 6-4 9-4l3-22-21-4-10-2c17-7 24-26 24-40 0-18-15-33-34-33-9 0-23 1-30 7-23-22-51-30-90-30z"
        fill="hsl(0,0%,96%)"
      />
      <g transform="matrix(1.34105 0 0 1.34105 -43 -1047)">
        <path
          d="M243 894c0 61-36 106-94 106-55 0-92-45-92-106s38-86 91-86 95 25 95 86z"
          fill="#803300"
        />
        <path
          d="M212 958c0 20-29 39-63 39-35 0-61-19-61-39s26-33 61-33 63 13 63 33z"
          fill="#e9c6af"
        />
        <path d="M181 932c0 7-19 24-30 24s-32-17-32-24c0-8 20-13 31-13 12 0 31 5 31 13z" />
        <ellipse cx="68.3" cy="827.7" rx="23.8" ry="23.1" fill="#803300" />
        <path
          d="M85 826a17 16 0 00-17-14 17 16 0 00-16 16 17 16 0 0016 16 17 16 0 001 0l3-4a66 66 0 0111-12l2-2z"
          fill="#e9c6af"
        />
        <ellipse
          ry="23.1"
          rx="23.8"
          cy="827.7"
          cx="-231.2"
          transform="scale(-1 1)"
          fill="#803300"
        />
        <path
          d="M215 826a17 16 0 0116-14 17 16 0 0117 16 17 16 0 01-17 16 17 16 0 01-1 0l-2-4a66 66 0 00-11-12l-2-2z"
          fill="#e9c6af"
        />
        <path
          d="M148 815c-14 0-26 1-38 4v11a199 199 0 0180 1v-11c-13-3-27-5-42-5z"
          fill="red"
        />
        <path
          d="M165 816a16 8 0 015 5 16 8 0 01-6 6l26 4v-11l-25-4z"
          fill="#e50000"
        />
        <path
          d="M148 789c-43 0-76 20-83 64 12-11 28-19 45-23 0 0-2-12 10-16 15-4 19-4 28-4 10 0 15 0 30 4s12 17 12 17c18 5 32 11 45 22-8-46-43-64-87-64z"
          fill="#1a1a1a"
        />
        <circle cx="97.2" cy="894.1" r="11.2" fill="#faa" fillOpacity=".6" />
        <circle cy="894.1" cx="201.9" r="11.2" fill="#faa" fillOpacity=".6" />
        <path
          d="M97 864a21 21 0 01-7 16 21 21 0 01-16 5M204 864a21 21 0 006 16 21 21 0 0016 5"
          fill="none"
          stroke="#e9afaf"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g>
          <path d="M77 855c-6 0-13 0-23 2l-14 3 2 15 7 2c3 5 1 10 2 18 3 28 12 34 26 35 8 1 23 3 33-1s19-10 25-18c6-9 6-18 10-26 3-5 8-4 10 0 3 8 4 17 10 26 6 8 15 14 24 18 11 4 26 2 34 1 14-1 23-7 26-35 1-8-2-13 2-18l7-2 2-15-15-3c-15-3-23-2-34-2h-13l-25 4c-8 2-15 7-23 6-8 0-15-5-23-6l-25-4H77z" />
          <path
            d="M85 860c-10 1-25 1-28 13-3 15-3 32 6 45 7 11 23 9 35 9 19-1 35-16 40-34 2-8 4-14 1-19-6-10-20-12-31-13l-23-1z"
            fill="#333"
          />
          <path
            d="M56 864a4 2 0 01-4 2 4 2 0 01-4-2 4 2 0 014-1 4 2 0 014 1"
            fill="#b3b3b3"
          />
          <path
            d="M215 860c10 1 24 1 28 13 3 15 3 32-6 45-7 11-23 9-35 9-19-1-35-16-40-34-2-8-4-14-1-19 6-10 20-12 31-13l23-1z"
            fill="#333"
          />
          <path
            d="M244 864a4 2 0 004 2 4 2 0 004-2 4 2 0 00-4-1 4 2 0 00-4 1"
            fill="#b3b3b3"
          />
          <path
            d="M101 861l-19 66h17l18-65-16-1zM89 860h-4l-3 1-18 59 6 5z"
            fill="#fff"
          />
        </g>
      </g>
    </svg>
  );
}

// Reusable code block shown on front cover front-half and back cover back-half
function CodeBlock() {
  return (
    <span
      style={{
        lineHeight: 1.2,
        fontFamily: "monospace",
        whiteSpace: "pre-line",
        maxWidth: "100%",
        maxHeight: "100%",
        fontWeight: "bold",
        color: "hsl(0, 0%, 6%)",
        textShadow: "2px 2px 0 hsl(0, 0%, 11%)",
        borderRadius: "5%",
        display: "block",
        overflow: "hidden",
        fontSize: "0.6vmin",
        padding: "6%",
      }}
    >
      {CODE_SNIPPET}
    </span>
  );
}

export default function ScrollBook({
  bgColor = "hsl(0, 0%, 30%)",
  spineColor = "hsl(0, 0%, 0%)",
  coverColor = "hsl(0, 0%, 10%)",
  insertColor = "hsl(0, 0%, 85%)",
  pageColor = "hsl(0, 0%, 90%)",
  underlineColor = "hsla(0, 0%, 25%, 0.4)",
  pageCount = 10,
  pageScroll = 25,
  bookWidthVmin = 30,
  bookHeightVmin = 40,
  minBookWidth = 150,
  minBookHeight = 200,
  showTitle = true,
}) {
  const bookRef = useRef(null);
  const pagesRef = useRef([]);

  // null on server and during first client render (hydration).
  // Set to the shuffled array in useEffect — which only runs on the client, after
  // hydration is complete — so server HTML and initial client HTML always match.
  const [shuffledDemos, setShuffledDemos] = useState(null);

  // ruled lines bg — runtime color values, cannot use Tailwind
  const ruledBg = `repeating-linear-gradient(0deg, transparent 0 1rem, ${underlineColor} 1rem calc(1rem + 1px), transparent calc(1rem + 1px)) 0 1rem / 100% 100% no-repeat, ${pageColor}`;

  // Half styles — matches original .page__half transform formula exactly:
  //   rotateY(calc(var(--rotation) * 1deg)) translate3d(0, 0, calc((0.5 * var(--coefficient)) * 1px))
  // Front: rotation=0, coefficient=0  → rotateY(0deg) translate3d(0,0,0px)
  // Back:  rotation=180, coefficient=2 → rotateY(180deg) translate3d(0,0,1px)
  const halfBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    clipPath: "inset(0 0.5% 0 0.5%)",
    WebkitClipPath: "inset(0 0.5% 0 0.5%)",
  };
  const halfFront = {
    ...halfBase,
    transform: "rotateY(0deg) translate3d(0, 0, 0px)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "0 5% 5% 0",
  };
  const halfBack = {
    ...halfBase,
    transform: "rotateY(180deg) translate3d(0, 0, 1px)",
    borderRadius: "5% 0 0 5%",
  };

  // .book__insert — original: position absolute, 94%x94%, background insert,
  //   top 50%, right -1rem, transform translate(0,-50%), border-radius 5% 0 0 5%
  // For back cover insert: left 0, border-radius 0 5% 5% 0
  const insertBase = {
    content: "''",
    position: "absolute",
    height: "94%",
    width: "94%",
    background: insertColor,
    top: "50%",
    transform: "translate(0, -50%)",
  };

  useEffect(() => {
    setShuffledDemos([...DEMOS].sort(() => 0.5 - Math.random()));

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

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
    ]).then(() => {
      const { gsap, ScrollTrigger } = window;
      if (!gsap || !ScrollTrigger || !bookRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const { to, set } = gsap;

      // Original uses window scroll (no scroller option) — book is fixed on the page.
      // start/end use window.innerHeight * 0.25 (= pageScroll vh).
      const vh025 = window.innerHeight * 0.25;

      // Scale book in on first scroll unit (0 → 25vh)
      to(bookRef.current, {
        scrollTrigger: {
          scrub: 1,
          start: 0,
          end: vh025,
        },
        scale: 1,
      });

      // Fade in logo near last pages (13.5 → 14 scroll units)
      const logoEl = bookRef.current.querySelector(".book__logo");
      if (logoEl) {
        to(logoEl, {
          scrollTrigger: {
            scrub: true,
            start: 13.5 * vh025,
            end: 14 * vh025,
          },
          opacity: 1,
        });
      }

      // pagesRef holds: [frontCover, ...innerPages, backCover]
      // matches original querySelectorAll('.book__page') order
      const pages = pagesRef.current.filter(Boolean);
      pages.forEach((page, index) => {
        // original: set z before any scroll
        set(page, { z: index === 0 ? 13 : -index });

        // original skips index 11 for rotation (guard against undefined page)
        if (index === 11) return;

        to(page, {
          rotateY: `-=${180 - index / 2}`,
          scrollTrigger: {
            scrub: 1,
            start: (index + 1) * vh025,
            end: (index + 2) * vh025,
          },
        });

        to(page, {
          z: index === 0 ? -13 : index,
          scrollTrigger: {
            scrub: 1,
            start: (index + 1) * vh025,
            end: (index + 1.5) * vh025,
          },
        });
      });
    });

    // Set body height for scroll — original: body height = (pageCount+2)*pageScroll*1vh
    const originalBodyHeight = document.body.style.height;
    const originalOverflowX = document.body.style.overflowX;
    document.body.style.height = `${(pageCount + 2) * pageScroll}vh`;
    document.body.style.overflowX = "hidden";

    return () => {
      document.body.style.height = originalBodyHeight;
      document.body.style.overflowX = originalOverflowX;
    };
  }, [pageCount, pageScroll]);

  // All pages array: [frontCover(0), inner0..inner(n-1), backCover(n+1)]
  // zIndex from original: calc(((var(--page-count) + 2) - var(--page-index)) * 2)
  // page-index is 1-based: front cover = 1, inner pages = 2..(pageCount+1), back cover = pageCount+2

  return (
    <>
      {/* Background — original: body { background: var(--bg) } */}
      <div className="fixed inset-0 -z-10" style={{ background: bgColor }} />

      {/* Title — original: h1 { position: fixed; bottom: 1rem; right: 1rem } */}
      {showTitle && (
        <h1
          className="fixed bottom-4 right-4 m-0 text-[2rem]"
          style={{ color: "hsl(0, 0%, 50%)" }}
        >
          Scroll
        </h1>
      )}

      {/* Book — original .book:
            height: 40vmin, width: 30vmin, min-width: 150px, min-height: 200px
            position: fixed, top: 50%, left: 50%
            transform: translate(-50%, -50%) scale(0.5)   ← GSAP animates scale to 1
            transform-style: preserve-3d
            perspective: 1200px
      */}
      <div
        ref={bookRef}
        style={{
          height: `${bookHeightVmin}vmin`,
          width: `${bookWidthVmin}vmin`,
          minWidth: `${minBookWidth}px`,
          minHeight: `${minBookHeight}px`,
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0.5)",
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
      >
        {/* ── Spine — original .book__spine:
              height: 100%, left: 0, top: 0, position: absolute
              background: var(--spine), width: 12px
              transform-origin: 0 50%
              transform: translate3d(0, 0, -13px) scaleX(1) rotateY(0deg)
        */}
        <div
          style={{
            height: "100%",
            left: 0,
            top: 0,
            position: "absolute",
            background: spineColor,
            transformOrigin: "0 50%",
            width: "12px",
            transform: "translate3d(0, 0, -13px) scaleX(1) rotateY(0deg)",
          }}
        />

        {/* ── Front Cover — original .book__cover--front:
              position: absolute, top: 50%, left: 0
              height: 100%, width: 100%
              border-radius: 0 5% 5% 0
              transform-origin: 0 50%
              page-index: 1 → zIndex = ((pageCount+2) - 1) * 2 = (pageCount+1)*2
              Front half has: border-right: 1rem solid var(--spine)
              Back half contains: .book__insert
        */}
        <div
          ref={(el) => {
            pagesRef.current[0] = el;
          }}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: "50%",
            left: 0,
            borderRadius: "0 5% 5% 0",
            background: coverColor,
            transformStyle: "preserve-3d",
            transform: "translate(0, -50%)",
            transformOrigin: "0 50%",
            zIndex: (pageCount + 1) * 2,
          }}
        >
          {/* Front half of front cover */}
          <div
            style={{
              ...halfFront,
              background: coverColor,
              borderRight: `1rem solid ${spineColor}`,
            }}
          >
            <CodeBlock />
            <BearSticker />
          </div>
          {/* Back half of front cover — holds insert */}
          <div style={{ ...halfBack, background: coverColor }}>
            {/* .book__insert — right: -1rem, border-radius: 5% 0 0 5% */}
            <div
              style={{
                ...insertBase,
                right: "-1rem",
                borderRadius: "5% 0 0 5%",
              }}
            />
          </div>
        </div>

        {/* ── Inner Pages ── */}
        {Array.from({ length: pageCount }).map((_, p) => {
          const pageIndex1 = p + 2; // 1-based page index (front cover = 1)
          const zIndex = (pageCount + 2 - pageIndex1) * 2;
          const leftSketch = shuffledDemos ? shuffledDemos[p * 2] : null;
          const rightSketch = shuffledDemos ? shuffledDemos[p * 2 + 1] : null;

          return (
            <div
              key={p}
              ref={(el) => {
                pagesRef.current[p + 1] = el;
              }}
              style={{
                position: "absolute",
                left: "2%",
                top: "50%",
                height: "94%",
                width: "94%",
                borderRadius: "0 5% 5% 0",
                transformStyle: "preserve-3d",
                transform: "translate(0, -50%)",
                transformOrigin: "0% 50%",
                zIndex,
              }}
            >
              {/* Front half — recto (right-hand page when open) */}
              <div style={{ ...halfFront, background: ruledBg }}>
                {leftSketch && (
                  <a
                    href={`https://codepen.io/jh3y/full/${leftSketch.id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      height: "100%",
                      width: "100%",
                      position: "relative",
                      display: "block",
                    }}
                  >
                    <img
                      src={`https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/${leftSketch.name}-sketch.svg`}
                      alt={leftSketch.name}
                      style={{
                        width: "90%",
                        height: "90%",
                        objectFit: "contain",
                        zIndex: 2,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </a>
                )}
                <span
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    right: "1rem",
                    color: "hsl(0, 0%, 50%)",
                    fontSize: "1vmin",
                  }}
                >
                  {p * 2 + 1}
                </span>
              </div>
              {/* Back half — verso (left-hand page when open) */}
              <div style={{ ...halfBack, background: ruledBg }}>
                {rightSketch && (
                  <a
                    href={`https://codepen.io/jh3y/full/${rightSketch.id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      height: "100%",
                      width: "100%",
                      position: "relative",
                      display: "block",
                    }}
                  >
                    <img
                      src={`https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/${rightSketch.name}-sketch.svg`}
                      alt={rightSketch.name}
                      style={{
                        width: "90%",
                        height: "90%",
                        objectFit: "contain",
                        zIndex: 2,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </a>
                )}
                <span
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "1rem",
                    color: "hsl(0, 0%, 50%)",
                    fontSize: "1vmin",
                  }}
                >
                  {p * 2 + 2}
                </span>
              </div>
            </div>
          );
        })}

        {/* ── Back Cover — original .book__cover--back:
              position: absolute, top: 50%, left: 0
              height: 100%, width: 100%
              border-radius: 0 5% 5% 0
              transform-origin: 0% 50%
              page-index: pageCount+2 → zIndex = 0
              Front half has: border-left: 1rem solid var(--spine)
              Back half has: .book__insert (left: 0, border-radius: 0 5% 5% 0)
                             .book__insert contains: a > img.logo
        */}
        <div
          ref={(el) => {
            pagesRef.current[pageCount + 1] = el;
          }}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: "50%",
            left: 0,
            borderRadius: "0 5% 5% 0",
            background: coverColor,
            transformStyle: "preserve-3d",
            transform: "translate(0, -50%)",
            transformOrigin: "0% 50%",
            zIndex: 0,
          }}
        >
          {/* Front half of back cover */}
          <div
            style={{
              ...halfFront,
              background: coverColor,
              borderLeft: `1rem solid ${spineColor}`,
            }}
          />

          {/* Back half of back cover */}
          <div style={{ ...halfBack, background: coverColor }}>
            {/* .book__insert for back cover: left: 0, border-radius: 0 5% 5% 0 */}
            <div
              style={{
                ...insertBase,
                left: 0,
                borderRadius: "0 5% 5% 0",
              }}
            >
              <a
                href="https://jhey.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: "100%",
                  width: "100%",
                  position: "relative",
                  display: "block",
                }}
              >
                <img
                  src="https://assets.codepen.io/605876/bear-with-cap.svg"
                  alt="jhey.dev logo"
                  className="book__logo"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0,
                    height: "25%",
                  }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
