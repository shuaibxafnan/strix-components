"use client";

import { useEffect, useRef } from "react";
import { Inter_Tight } from "next/font/google";

const font = Inter_Tight({ subsets: ["latin"] });

const CARD_DEFAULTS = [
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=900&q=80",
    title: "THE SPACE BETWEEN",
    subtitle: "Where movement reveals truth",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=900&q=80",
    title: "CAPTURED STILLNESS",
    subtitle: "Motion suspended in time",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=900&q=80",
    title: "NEGATIVE PRESENCE",
    subtitle: "Finding meaning in absence",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=900&q=80",
    title: "TEXTURE OF LIGHT",
    subtitle: "When shadows become tangible",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=900&q=80",
    title: "MONOCHROME MEDITATION",
    subtitle: "Beyond what eyes perceive",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=900&q=80",
    title: "FORMLESS FORM",
    subtitle: "The geometry of feeling",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=900&q=80",
    title: "SPATIAL SILENCE",
    subtitle: "Presence within emptiness",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=900&q=80",
    title: "LIMINAL THRESHOLD",
    subtitle: "Between known and unknown",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=900&q=80",
    title: "ESSENTIAL HARMONY",
    subtitle: "The beauty of reduction",
  },
];

const CATEGORY_DEFAULTS = [
  "Movement",
  "Stillness",
  "Minimalism",
  "Negative Space",
  "Monochrome",
  "Essence",
  "Contrast",
  "Silence",
];

const NOISE_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

function Caption({ index, card }) {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 pb-2 pt-4 sm:px-4 sm:pb-4 sm:pt-5">
      <p className="mb-[3px] hidden text-[0.55rem] uppercase tracking-[0.18em] text-white/40 sm:block">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="text-[0.5rem] font-medium uppercase leading-tight tracking-[0.04em] text-white sm:text-[0.7rem] md:text-[0.8rem]">
        {card.title}
      </h2>
      <p className="mt-[2px] hidden text-[0.7rem] text-white/50 sm:block">
        {card.subtitle}
      </p>
    </div>
  );
}

function Corner({ tone }) {
  return (
    <div
      className={`pointer-events-none absolute right-0 top-0 h-5 w-5 rounded-tr-[4px] border-r border-t sm:h-7 sm:w-7 ${tone}`}
    />
  );
}

export default function ExpandingPhotoGrid({
  bgColor = "#0a0a0a",
  logoText = "VISUAL SILENCE",
  galleryLabel = "Gallery",
  seriesLabel = "Series I",
  mysteriousMessage = "The magic lies within the seventh frame...",
  duration = 0.64,
  flipDuration = 0.8,
  showNoise = true,
  cards = CARD_DEFAULTS,
  flipCardIndex = 6,
  flipCardQuote = "In the spaces between light and shadow, the unseen reveals itself. The photograph captures not just what is visible, but the mystery that lies beyond perception.",
  flipCardAuthor = "VS",
  quoteMark = "\u201C",
  categories = CATEGORY_DEFAULTS,
  className = "",
}) {
  const gridRef = useRef(null);
  const centerCardRef = useRef(null);
  const centerImageRef = useRef(null);
  const categoriesRef = useRef(null);
  const categoryRefs = useRef([]);
  const mysteriousRef = useRef(null);
  const charRefs = useRef([]);
  const flipCardRef = useRef(null);
  const cardInnerRef = useRef(null);
  const cardRefs = useRef([]);
  const cleanupRef = useRef(null);

  const parts = logoText.split(" ");
  const firstWord = parts[0] || "";
  const secondWord = parts.slice(1).join(" ");
  const logoChars = [
    ...firstWord.split("").map((c) => ({ char: c, isSpacer: false })),
    { char: " ", isSpacer: true },
    ...secondWord.split("").map((c) => ({ char: c, isSpacer: false })),
  ];

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const gsapMod = await import("gsap");
        const ceMod = await import("gsap/CustomEase");
        if (cancelled) return;

        const gsap = gsapMod.gsap || gsapMod.default;
        const CustomEase = ceMod.CustomEase || ceMod.default;
        gsap.registerPlugin(CustomEase);
        gsap.config({ trialWarn: false });
        CustomEase.create("customEase", "0.86,0,0.07,1");

        const menuInDur = 0.64;
        const menuOutDur = 0.48;
        const charDur = 0.15;
        const finalMergeDur = 0.5;

        const gridEl = gridRef.current;
        const centerCardEl = centerCardRef.current;
        const centerImgEl = centerImageRef.current;
        const categoriesEl = categoriesRef.current;
        const mysteriousEl = mysteriousRef.current;
        const flipCardEl = flipCardRef.current;
        const cardInnerEl = cardInnerRef.current;
        const catEls = categoryRefs.current.filter(Boolean);
        const cardEls = cardRefs.current;

        if (!gridEl || !centerCardEl) return;

        const st = {
          isExpanded: false,
          isHoveringGrid: false,
          isHoveringMenu: false,
          isFlipping: false,
          isFlipped: false,
          menuAnim: null,
        };
        const cleanups = [];
        const timeouts = [];

        const on = (el, ev, fn) => {
          if (!el) return;
          el.addEventListener(ev, fn);
          cleanups.push(() => el.removeEventListener(ev, fn));
        };

        cardEls.forEach((card, i) => {
          if (!card) return;
          gsap.set(card, {
            top: "50%",
            left: "50%",
            x: 0,
            y: 0,
            xPercent: -50,
            yPercent: -50,
            scale: i === 4 ? 1 : 0.6,
            opacity: i === 4 ? 1 : 0,
            visibility: i === 4 ? "visible" : "hidden",
          });
        });
        gsap.set(catEls, { opacity: 0, y: 20, visibility: "hidden" });
        gsap.set(mysteriousEl, { opacity: 0 });

        const expandTimeline = gsap.timeline({ paused: true });
        const positions = [
          ["0%", "0%", 0, 0],
          ["0%", "50%", -50, 0],
          ["0%", "100%", -100, 0],
          ["50%", "0%", 0, -50],
          null,
          ["50%", "100%", -100, -50],
          ["100%", "0%", 0, -100],
          ["100%", "50%", -50, -100],
          ["100%", "100%", -100, -100],
        ];
        positions.forEach((pos, i) => {
          if (!pos) return;
          const card = cardEls[i];
          if (!card) return;
          expandTimeline.to(
            card,
            {
              top: pos[0],
              left: pos[1],
              xPercent: pos[2],
              yPercent: pos[3],
              opacity: 1,
              scale: 1,
              visibility: "visible",
              ease: "customEase",
              duration,
              delay: 0.05 + i * 0.05,
            },
            0,
          );
        });
        expandTimeline.to(
          mysteriousEl,
          { opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.6 },
          0,
        );

        const centerZoom = gsap.timeline({ paused: true });
        centerZoom.to(centerImgEl, {
          scale: 1.08,
          duration,
          ease: "customEase",
        });

        const vCharEl = charRefs.current[0];
        const spacerEl = charRefs.current[firstWord.length];
        const sCharEl = charRefs.current[firstWord.length + 1];

        const secondIdx = [];
        for (let k = logoChars.length - 1; k >= firstWord.length + 2; k--)
          secondIdx.push(k);
        const firstIdx = [];
        for (let k = firstWord.length - 1; k >= 1; k--) firstIdx.push(k);
        const hideSeq = [];
        const maxLen = Math.max(secondIdx.length, firstIdx.length);
        for (let k = 0; k < maxLen; k++) {
          if (k < secondIdx.length) hideSeq.push(secondIdx[k]);
          if (k < firstIdx.length) hideSeq.push(firstIdx[k]);
        }

        const logoTl = gsap.timeline({ paused: true });
        hideSeq.forEach((idx, i) => {
          const el = charRefs.current[idx];
          if (!el) return;
          logoTl.to(
            el,
            {
              opacity: 0,
              filter: "blur(8px)",
              duration: charDur,
              ease: "customEase",
            },
            i * 0.05,
          );
        });
        if (spacerEl) {
          logoTl.to(
            spacerEl,
            {
              opacity: 0,
              filter: "blur(8px)",
              duration: charDur,
              ease: "customEase",
            },
            hideSeq.length * 0.05,
          );
        }

        let mergeTween = null;
        const updateLogoMerge = () => {
          if (!vCharEl || !sCharEl || st.isExpanded) return;
          if (mergeTween) {
            logoTl.remove(mergeTween);
            mergeTween.kill();
            gsap.set(sCharEl, { x: 0 });
          }
          const vRect = vCharEl.getBoundingClientRect();
          const sRect = sCharEl.getBoundingClientRect();
          mergeTween = gsap.to(sCharEl, {
            x: -(sRect.left - vRect.right),
            duration: finalMergeDur,
            ease: "customEase",
            paused: true,
          });
          logoTl.add(mergeTween, hideSeq.length * 0.05 + 0.05);
        };
        requestAnimationFrame(updateLogoMerge);
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (!cancelled) updateLogoMerge();
          });
        }

        const flipTl = gsap.timeline({
          paused: true,
          onComplete: () => {
            st.isFlipping = false;
            st.isFlipped = true;
          },
        });
        flipTl
          .to(
            cardInnerEl,
            { rotationY: 900, duration: flipDuration, ease: "power2.inOut" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(8px)", duration: 0.2, ease: "power1.in" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(0px)", duration: 0.2, ease: "power1.out" },
            flipDuration - 0.2,
          );

        const flipBackTl = gsap.timeline({
          paused: true,
          onComplete: () => {
            st.isFlipping = false;
            st.isFlipped = false;
          },
        });
        flipBackTl
          .to(
            cardInnerEl,
            { rotationY: 0, duration: flipDuration, ease: "power2.inOut" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(8px)", duration: 0.2, ease: "power1.in" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(0px)", duration: 0.2, ease: "power1.out" },
            flipDuration - 0.2,
          );

        const showMenu = () => {
          if (st.menuAnim) st.menuAnim.kill();
          st.menuAnim = gsap.to([...catEls].reverse(), {
            opacity: 1,
            y: 0,
            visibility: "visible",
            duration: menuInDur,
            ease: "customEase",
            stagger: 0.08,
          });
        };
        const hideMenu = () => {
          if (st.menuAnim) st.menuAnim.kill();
          st.menuAnim = gsap.to(catEls, {
            opacity: 0,
            y: 20,
            visibility: "hidden",
            duration: menuOutDur,
            ease: "customEase",
            stagger: 0.05,
          });
        };

        const expandGrid = () => {
          if (st.isExpanded) return;
          st.isExpanded = true;
          expandTimeline.play();
          showMenu();
          centerZoom.play();
          logoTl.play();
        };
        const collapseGrid = () => {
          if (st.isHoveringGrid || st.isHoveringMenu || !st.isExpanded) return;
          st.isExpanded = false;
          expandTimeline.reverse();
          hideMenu();
          centerZoom.reverse();
          logoTl.reverse();
          if (st.isFlipped || st.isFlipping) {
            flipTl.kill();
            flipBackTl.kill();
            gsap.to(cardInnerEl, {
              rotationY: 0,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                st.isFlipped = false;
                st.isFlipping = false;
              },
            });
            gsap.to(flipCardEl, { filter: "blur(0px)", duration: 0.1 });
          }
        };
        const delayedCollapse = () => {
          timeouts.push(setTimeout(collapseGrid, 50));
        };

        const doFlip = () => {
          if (!st.isFlipping && !st.isFlipped) {
            st.isFlipping = true;
            flipTl.restart();
          }
        };
        const doFlipBack = () => {
          if (st.isFlipping || st.isFlipped) {
            flipTl.kill();
            st.isFlipping = true;
            flipBackTl.restart();
          }
        };

        const supportsHover = window.matchMedia(
          "(hover: hover) and (pointer: fine)",
        ).matches;

        if (supportsHover) {
          on(centerCardEl, "mouseenter", () => {
            st.isHoveringGrid = true;
            expandGrid();
          });
          on(gridEl, "mouseenter", () => {
            st.isHoveringGrid = true;
          });
          on(gridEl, "mouseleave", () => {
            st.isHoveringGrid = false;
            delayedCollapse();
          });
          on(categoriesEl, "mouseenter", () => {
            st.isHoveringMenu = true;
          });
          on(categoriesEl, "mouseleave", () => {
            st.isHoveringMenu = false;
            delayedCollapse();
          });
          on(flipCardEl, "mouseenter", () => {
            if (st.isExpanded) doFlip();
          });
          on(flipCardEl, "mouseleave", () => {
            if (st.isExpanded) doFlipBack();
          });
        } else {
          on(centerCardEl, "click", () => {
            if (!st.isExpanded) expandGrid();
            else {
              st.isHoveringGrid = false;
              st.isHoveringMenu = false;
              collapseGrid();
            }
          });
          on(flipCardEl, "click", () => {
            if (st.isExpanded && !st.isFlipping) {
              if (!st.isFlipped) doFlip();
              else doFlipBack();
            }
          });
        }

        on(window, "resize", updateLogoMerge);

        cleanupRef.current = () => {
          cleanups.forEach((fn) => fn());
          timeouts.forEach((t) => clearTimeout(t));
          if (st.menuAnim) st.menuAnim.kill();
          expandTimeline.kill();
          centerZoom.kill();
          logoTl.kill();
          flipTl.kill();
          flipBackTl.kill();
        };
      } catch (e) {
        console.error("[ExpandingPhotoGrid] init failed:", e.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div
      className={`${font.className} relative flex h-[100svh] w-full items-center justify-center overflow-hidden tracking-tight ${className} [--card:min(calc((100svh_-_10rem)/3),calc((100vw_-_2rem)/3))] md:[--card:min(calc((100svh_-_12rem)/3),calc((100vw_-_26rem)/3))]`}
      style={{ backgroundColor: bgColor }}
    >
      <style>{`
        @keyframes vs-noise {
          0% { transform: translate(0,0); }
          20% { transform: translate(-10%,5%); }
          40% { transform: translate(-5%,15%); }
          60% { transform: translate(15%,0); }
          80% { transform: translate(-15%,0); }
          100% { transform: translate(5%,0); }
        }
      `}</style>

      {showNoise && (
        <div
          className="pointer-events-none fixed -left-1/2 -top-1/2 z-[500] h-[200%] w-[200%] opacity-50 will-change-transform"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "300px 300px",
            animation: "vs-noise 0.3s steps(5) infinite",
          }}
        />
      )}

      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.7)_100%)]" />

      <div
        ref={gridRef}
        className="relative h-[calc(3*var(--card)_+_6px)] w-[calc(3*var(--card)_+_6px)]"
      >
        {cards.map((card, i) => {
          const isCenter = i === 4;
          const isFlip = i === flipCardIndex;

          return (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
                if (isCenter) centerCardRef.current = el;
                if (isFlip) flipCardRef.current = el;
              }}
              className={`absolute left-1/2 top-1/2 h-[var(--card)] w-[var(--card)] -translate-x-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-[4px] border border-white/10 bg-black ${isCenter ? "z-10" : "invisible scale-[0.6] opacity-0"
                } ${isFlip ? "[perspective:1000px]" : ""}`}
            >
              {isFlip ? (
                <div
                  ref={cardInnerRef}
                  className="relative h-full w-full [transform-style:preserve-3d]"
                >
                  <div className="absolute inset-0 z-[2] overflow-hidden rounded-[4px] [backface-visibility:hidden]">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover grayscale"
                    />
                    <Caption index={i} card={card} />
                    <Corner tone="border-white/25" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[4px] border border-white/5 bg-[#0a0a0a] p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6">
                    <span className="pointer-events-none -ml-1 -mt-2 hidden select-none font-serif text-[8rem] leading-none text-white/[0.04] sm:block">
                      {quoteMark}
                    </span>
                    <div>
                      <p className="mb-2 text-[0.5rem] font-light leading-snug text-white/70 sm:mb-4 sm:text-[0.7rem] sm:leading-[1.65] md:text-[0.75rem]">
                        {flipCardQuote}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[0.5rem] uppercase tracking-[0.2em] text-white/40 sm:text-[0.6rem]">
                          {flipCardAuthor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    ref={isCenter ? centerImageRef : undefined}
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover grayscale"
                  />
                  <Caption index={i} card={card} />
                  <Corner tone="border-white/20" />
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        ref={categoriesRef}
        className="fixed right-0 top-1/2 z-[200] hidden -translate-y-1/2 flex-col gap-px md:flex"
      >
        {categories.map((cat, i) => (
          <div
            key={i}
            ref={(el) => {
              categoryRefs.current[i] = el;
            }}
            className="group invisible flex cursor-pointer items-center gap-3 py-[0.45rem] pl-3 pr-5 opacity-0"
          >
            <div className="h-3 w-px flex-shrink-0 bg-white/20" />
            <span className="w-[18px] text-[0.55rem] tabular-nums tracking-[0.15em] text-white/25">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="whitespace-nowrap text-[0.7rem] uppercase tracking-[0.08em] text-white/60 transition-colors duration-200 group-hover:text-white/90">
              {cat}
            </span>
          </div>
        ))}
      </div>

      <div className="fixed left-6 top-6 z-[100] flex flex-col md:top-1/2 md:-translate-y-1/2">
        <span className="mb-2 hidden text-[0.5rem] uppercase tracking-[0.25em] text-white/20 md:block">
          {galleryLabel}
        </span>

        <div className="relative flex items-baseline">
          {logoChars.map((item, i) => (
            <span
              key={i}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              className={`inline-block text-xl font-semibold tracking-[-0.03em] text-white md:text-[1.6rem] ${item.isSpacer ? "w-[0.4em]" : ""
                }`}
            >
              {item.isSpacer ? "\u00A0" : item.char}
            </span>
          ))}
        </div>

        <div className="mt-3 hidden h-px w-full bg-white/10 md:block" />

        <span className="mt-2 hidden text-[0.5rem] uppercase tracking-[0.2em] text-white/20 md:block">
          {seriesLabel}
        </span>
      </div>

      <div
        ref={mysteriousRef}
        className="fixed bottom-6 left-6 right-6 z-[100] flex items-center gap-3 opacity-0 md:bottom-8 md:right-auto"
      >
        <div className="h-1 w-1 flex-shrink-0 animate-pulse rounded-full bg-white/40" />
        <span className="truncate text-[0.55rem] uppercase tracking-[0.15em] text-white/35 md:text-[0.6rem]">
          {mysteriousMessage}
        </span>
      </div>
    </div>
  );
}