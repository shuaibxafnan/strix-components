"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1600&q=80",
    title1: "Between",
    title2: "Worlds",
    caption: "01 / PERCEPTION",
    category: "VISUAL ESSAY",
    paragraph:
      "The space between what we see and what exists is where truth resides. In stillness, we find motion. In silence, we hear everything. The photograph captures not just light, but the absence of noise.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1600&q=80",
    title1: "Eternal",
    title2: "Now",
    caption: "02 / PRESENCE",
    category: "MEDITATION",
    paragraph:
      "There is only this moment. The past and future are constructs. These images exist in an eternal now, suspended between breaths. When we truly see, time dissolves.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
    title1: "Shadow",
    title2: "Self",
    caption: "03 / DUALITY",
    category: "EXPLORATION",
    paragraph:
      "We are both the observer and the observed. The shadow self contains what we hide, even from ourselves. These images reveal the dance between what we show and what we conceal.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1600&q=80",
    title1: "Empty",
    title2: "Space",
    caption: "04 / ESSENCE",
    category: "CONTEMPLATION",
    paragraph:
      "Emptiness is not nothing. It is the canvas upon which everything appears. The negative space defines the subject more than the subject itself.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1600&q=80",
    title1: "Surface",
    title2: "Depth",
    caption: "05 / TEXTURE",
    category: "SENSATION",
    paragraph:
      "The world speaks through texture. Rough against smooth. Soft against hard. The eye can feel what the hand cannot touch. Sensation transcends the visual.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1600&q=80",
    title1: "Visible",
    title2: "Unseen",
    caption: "06 / PATTERN",
    category: "OBSERVATION",
    paragraph:
      "Chaos contains order. Order contains chaos. The city, like nature, follows invisible patterns revealed when we step back and observe without judgment.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1600&q=80",
    title1: "Moment",
    title2: "Echo",
    caption: "07 / AWARENESS",
    category: "PRACTICE",
    paragraph:
      "Photography is not about capturing. It is about becoming aware. These images don't freeze moments; they extend them into eternity.",
  },
];

const DEFAULT_COLUMN_IMAGES = [

  [6, 0, 1, 2, 3],

  [4, 5, 6, 0, 1],

  [2, 3, 4, 5, 6],

  [0, 1, 2, 3, 4],
];

function splitIntoChars(element) {
  const spans = element.querySelectorAll("span.content-title");
  const allChars = [];

  spans.forEach((span) => {
    const text = span.textContent;
    span.innerHTML = "";

    const wordWrapper = document.createElement("span");
    wordWrapper.className = "fg-word";
    wordWrapper.style.cssText =
      "display:inline-block;overflow:hidden;vertical-align:bottom;";

    text.split("").forEach((ch) => {
      const charEl = document.createElement("span");
      charEl.className = "fg-char";
      charEl.style.cssText = "display:inline-block;";
      charEl.textContent = ch === " " ? "\u00a0" : ch;
      wordWrapper.appendChild(charEl);
      allChars.push(charEl);
    });

    span.appendChild(wordWrapper);
  });

  return allChars;
}

export default function ColumnGridSlider({

  bgColor = "#111111",
  textColor = "rgba(255,255,255,0.9)",
  titleColor = "rgba(255,255,255,0.95)",

  fontFamily = "'TheGoodMonolith', monospace",
  titleSize = "clamp(2rem, 10vw, 10rem)",

  gridItemWidth = "50vw",
  gridItemHeight = "100vh",

  enterLabel = "ENTER THE FLOW",
  enterBg = "rgba(34,34,34,0.8)",

  slides = DEFAULT_SLIDES,
  columnImages = DEFAULT_COLUMN_IMAGES,

  preloaderDuration = 2000,

  footerPrompt = "{{ GET IN TOUCH }}",
  footerEmail = "HI@STUDIO.COM",
  footerEmailHref = "mailto:hi@studio.com",
  className = "",
}) {
  const [phase, setPhase] = useState("loading");
  const [counter, setCounter] = useState(0);

  const mainRef = useRef(null);
  const gridRef = useRef(null);
  const colUpRefs = useRef([]);
  const colDownRefs = useRef([]);
  const expandRef = useRef(null);
  const titleRef = useRef(null);
  const captionRef = useRef(null);
  const categoryRef = useRef(null);
  const paragraphRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const thumbnailEls = useRef([]);
  const scrollTextRef = useRef(null);
  const switchRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  const stateRef = useRef({
    activeIndex: 0,
    isAnimating: false,
    isEntered: false,
    lenis: null,
    libs: null,
    tickerFn: null,
    trigger: null,
    prevOverflow: "",
  });

  const animateTitleChars = (gsap, delay = 0) => {
    const el = titleRef.current;
    if (!el) return gsap.timeline();
    gsap.set(el, { opacity: 1 });
    const chars = splitIntoChars(el);
    const spans = el.querySelectorAll("span.content-title");
    const tl = gsap.timeline();

    spans.forEach((span, si) => {
      const spanChars = span.querySelectorAll(".fg-char");
      tl.from(
        spanChars,
        {
          yPercent: 100,
          opacity: 0.2,
          duration: 0.9,
          stagger: 0.03,
          ease: "power2.out",
        },
        si === 0 ? delay : "-=0.5",
      );
    });

    return tl;
  };

  const animateParagraphChars = (gsap, el, delay = 0) => {
    if (!el) return gsap.timeline();
    gsap.set(el, { opacity: 1 });

    const text = el.textContent;
    el.innerHTML = "";
    const chars = text.split("").map((ch) => {
      const s = document.createElement("span");
      s.style.cssText = "display:inline-block;";
      s.textContent = ch === " " ? "\u00a0" : ch;
      el.appendChild(s);
      return s;
    });
    const tl = gsap.timeline();
    tl.from(chars, {
      yPercent: 100,
      opacity: 0,
      duration: 0.7,
      stagger: 0.01,
      ease: "power2.out",
      delay,
    });
    return tl;
  };

  const updateSlideContent = (gsap, index) => {
    const slide = slides[index];
    if (!slide) return;

    if (titleRef.current) {
      titleRef.current.innerHTML = `
        <span class="content-title">${slide.title1}</span>
        <span class="content-title">${slide.title2}</span>
      `;
    }
    if (paragraphRef.current)
      paragraphRef.current.textContent = slide.paragraph;
    if (captionRef.current) captionRef.current.textContent = slide.caption;
    if (categoryRef.current) categoryRef.current.textContent = slide.category;

    const master = gsap.timeline();
    master.fromTo(
      [captionRef.current, categoryRef.current].filter(Boolean),
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      0,
    );
    master.add(animateTitleChars(gsap, 0.05), 0);
    master.add(animateParagraphChars(gsap, paragraphRef.current, 0.4), 0);

    thumbnailEls.current.forEach((th, i) => {
      th?.classList.toggle("fg-thumb-active", i === index);
    });

    return master;
  };

  const findLeftmostImage = () => {
    const images = document.querySelectorAll(".fg-col-img");
    let best = null,
      bestX = Infinity;
    images.forEach((img) => {
      const r = img.getBoundingClientRect();
      if (
        r.left < window.innerWidth &&
        r.right > 0 &&
        r.top < window.innerHeight &&
        r.bottom > 0
      ) {
        if (r.left < bestX) {
          bestX = r.left;
          best = img;
        }
      }
    });
    return best;
  };

  const enterTheFlow = () => {
    const s = stateRef.current;
    if (s.isAnimating || s.isEntered) return;
    s.isAnimating = true;
    setPhase("entering");

    const { gsap, ScrollTrigger, Lenis } = s.libs || {};
    if (!gsap) return;

    const sw = switchRef.current;
    const expImg = expandRef.current;
    const grid = gridRef.current;

    gsap.to(sw, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        if (sw) sw.style.display = "none";
      },
    });

    contentRef.current?.classList.add("fg-content-current");

    const tl = gsap.timeline({
      onComplete: () => {
        s.isAnimating = false;
        s.isEntered = true;
        setPhase("entered");
        [expImg, contentRef.current].forEach((el) => {
          if (el) el.style.position = "absolute";
        });

        if (Lenis && !s.lenis) {
          s.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: false,
            touchMultiplier: 2,
          });
          if (ScrollTrigger) s.lenis.on("scroll", ScrollTrigger.update);
          s.tickerFn = (time) => s.lenis.raf(time * 1000);
          gsap.ticker.add(s.tickerFn);
          gsap.ticker.lagSmoothing(0);
        }

        s.prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "auto";

        gsap.to(scrollTextRef.current, {
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
        });

        if (ScrollTrigger) {
          s.trigger = ScrollTrigger.create({
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              gsap.set(heroRef.current, { height: `${100 - p * 40}vh` });
              gsap.set(expImg, {
                scale: 1 + p * 0.1,
                y: `-${p * 25}%`,
                width: "100vw",
                height: `${100 + p * 30}vh`,
              });

              gsap.set(contentRef.current, {
                y: `-${p * 30}%`,
                opacity: 1 - p * 0.8,
              });
            },
          });
        }
      },
    });

    tl.to(grid, { scale: 1, duration: 0.8, ease: "power2.inOut" }, 0);
    colUpRefs.current.forEach((el) => {
      if (el)
        tl.to(el, { y: "-200vh", duration: 0.8, ease: "power2.inOut" }, 0);
    });
    colDownRefs.current.forEach((el) => {
      if (el) tl.to(el, { y: "200vh", duration: 0.8, ease: "power2.inOut" }, 0);
    });

    tl.add(() => {
      const leftImg = findLeftmostImage();
      if (!leftImg || !expImg) return;
      const r = leftImg.getBoundingClientRect();
      const bg = window.getComputedStyle(leftImg).backgroundImage;
      Object.assign(expImg.style, {
        backgroundImage: bg,
        top: `${r.top}px`,
        left: `${r.left}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        opacity: "1",
      });
      s.activeIndex = parseInt(leftImg.dataset.index ?? "0", 10);
    }, 0.8);

    tl.to(expImg, { width: "100vw", duration: 0.7, ease: "power2.inOut" }, 1.0);
    tl.to(grid, { opacity: 0, duration: 0.3 }, 1.2);

    tl.add(() => updateSlideContent(gsap, s.activeIndex), 1.8);
    tl.set(thumbnailsRef.current, { opacity: 1 }, 2.2);
    tl.to(
      thumbnailEls.current.filter(Boolean),
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      2.3,
    );
  };

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = 20;
    const increment = 100 / (preloaderDuration / interval);
    let current = 0;
    const id = setInterval(() => {
      current += increment;
      if (current >= 100) {
        current = 100;
        clearInterval(id);
        setCounter(100);

        setTimeout(() => setPhase("idle"), 500);
      } else {
        setCounter(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(id);
  }, [phase, preloaderDuration]);

  useEffect(() => {
    if (phase !== "idle") return;

    let cancelled = false;
    (async () => {
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod.default || lenisMod.Lenis;
      gsap.registerPlugin(ScrollTrigger);
      stateRef.current.libs = { gsap, ScrollTrigger, Lenis };

      gsap.set(mainRef.current, { opacity: 1, visibility: "visible" });
      gsap
        .timeline()
        .set(gridRef.current, { opacity: 1 })
        .fromTo(
          ".fg-column",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
          },
        );
    })().catch((e) => console.error(e));

    const onScroll = () => {
      const gsap = stateRef.current.libs?.gsap;
      if (!gsap || !stateRef.current.isEntered) return;
      gsap.to(scrollTextRef.current, {
        opacity: window.scrollY > 100 ? 0 : 1,
        duration: 0.3,
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      const s = stateRef.current;
      s.trigger?.kill?.();
      if (s.tickerFn) s.libs?.gsap?.ticker.remove(s.tickerFn);
      s.lenis?.destroy?.();
      s.lenis = null;
      s.libs?.gsap?.killTweensOf("*");
      if (s.isEntered) document.body.style.overflow = s.prevOverflow;
    };
  }, []);

  const handleThumbClick = (index) => {
    const s = stateRef.current;
    if (!s.isEntered || s.isAnimating) return;
    const gsap = s.libs?.gsap;
    if (!gsap) return;

    s.activeIndex = index;
    const expImg = expandRef.current;

    gsap.to(expImg, {
      opacity: 0.5,
      duration: 0.3,
      onComplete: () => {
        if (expImg)
          expImg.style.backgroundImage = `url(${slides[index].image})`;
        gsap.to(expImg, { opacity: 1, duration: 0.3 });
      },
    });

    if (captionRef.current)
      gsap.set(captionRef.current, { opacity: 0, y: -20 });
    if (categoryRef.current)
      gsap.set(categoryRef.current, { opacity: 0, y: -20 });
    updateSlideContent(gsap, index);
  };

  const showPreloader = phase === "loading";
  const showMain = phase !== "loading";

  return (
    <>
      <style>{`
        .fg-col-item   { width: ${gridItemWidth}; height: ${gridItemHeight}; }
        .fg-thumb-active { border: 2px solid #fff !important; }
        .fg-content-current { pointer-events: auto !important; }
      `}</style>

      <div
        className={`fg-root relative w-full overflow-x-hidden ${className}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily,
          overflowY: showPreloader ? "hidden" : undefined,
        }}
      >
        {showPreloader && (
          <div
            className="fixed inset-0 flex items-center justify-center z-[10000]"
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-[2rem] text-white" style={{ fontFamily }}>
              {counter}
            </span>
          </div>
        )}
        <main
          ref={mainRef}
          className="w-full relative"
          style={{
            opacity: showMain ? undefined : 0,
            visibility: showMain ? undefined : "hidden",
          }}
        >
          <div
            ref={heroRef}
            className="w-full h-screen relative overflow-hidden will-change-transform"
          >
            {(phase === "idle" || phase === "entering") && (
              <div
                ref={switchRef}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-5 px-5 py-2.5 rounded"
                style={{ backgroundColor: enterBg }}
              >
                <button
                  className="relative inline-block cursor-pointer text-[14px] tracking-[1px] bg-transparent border-0 px-2.5 py-1 text-white group"
                  style={{ fontFamily }}
                  onClick={enterTheFlow}
                >
                  <span className="absolute w-[5px] h-[5px] bg-[#f0f0f0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-1/2 -translate-y-1/2 -left-2" />
                  {enterLabel}
                </button>
              </div>
            )}
            <div
              ref={gridRef}
              className="w-full h-screen relative flex justify-center items-center will-change-transform"
              style={{ transform: "scale(0.5, 0.4)", opacity: 0 }}
            >
              {columnImages.map((colImgIndices, ci) => {
                const isUp = ci % 2 === 0;
                return (
                  <div
                    key={ci}
                    className="fg-column relative grid will-change-transform"
                  >
                    <div
                      ref={(el) => {
                        if (isUp) colUpRefs.current[Math.floor(ci / 2)] = el;
                        else colDownRefs.current[Math.floor(ci / 2)] = el;
                      }}
                      className="relative will-change-transform"
                    >
                      {colImgIndices.map((slideIdx, ii) => (
                        <figure
                          key={ii}
                          className="fg-col-item relative z-[1] m-0"
                        >
                          <div className="w-full h-full relative overflow-hidden">
                            <div
                              className="fg-col-img w-full h-full bg-cover bg-center will-change-transform"
                              style={{
                                backgroundImage: `url(${slides[slideIdx]?.image})`,
                              }}
                              data-index={slideIdx}
                            />
                          </div>
                        </figure>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              ref={expandRef}
              className="fixed top-0 left-0 h-screen bg-cover bg-center will-change-transform"
              style={{ width: "50vw", zIndex: 85, opacity: 0 }}
            />
            <div
              ref={contentRef}
              className="fg-content-current pointer-events-none fixed inset-0 w-full h-screen grid"
              style={{
                gridTemplateRows: "auto 1fr auto",
                zIndex: 90,
              }}
            >
              <div className="flex items-start justify-between px-5 pt-6 md:px-10 md:pt-10">
                <div
                  ref={captionRef}
                  className="text-[0.85rem] tracking-[1px] opacity-0"
                  style={{ fontFamily }}
                >
                  {slides[0]?.caption}
                </div>
                <div
                  ref={categoryRef}
                  className="text-[0.85rem] tracking-[1px] opacity-0"
                  style={{ fontFamily }}
                >
                  {slides[0]?.category}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <h1
                  ref={titleRef}
                  className="opacity-0 uppercase m-0 font-medium w-full flex justify-center pointer-events-none"
                  style={{
                    fontSize: titleSize,
                    fontFamily,
                    color: titleColor,
                    gap: "3vw",
                    alignItems: "flex-start",
                    padding: "0 0.5rem",
                  }}
                >
                  <span
                    className="content-title"
                    style={{
                      display: "block",
                      lineHeight: 1,
                      paddingTop: "0.075em",
                    }}
                  >
                    {slides[0]?.title1}
                  </span>
                  <span
                    className="content-title"
                    style={{
                      display: "block",
                      lineHeight: 1,
                      paddingTop: "0.075em",
                      marginTop: 40,
                    }}
                  >
                    {slides[0]?.title2}
                  </span>
                </h1>
              </div>
              <div className="flex flex-col items-start md:flex-row md:items-end justify-between px-5 md:px-10 pb-6 gap-4 md:gap-8">
                <div className="flex flex-col gap-4 max-w-[420px] w-full">
                  <div
                    ref={paragraphRef}
                    className="opacity-0 leading-[1.4] text-[0.85rem]"
                    style={{ fontFamily, color: "#f0f0f0" }}
                  >
                    {slides[0]?.paragraph}
                  </div>
                </div>
                <div
                  ref={thumbnailsRef}
                  className="flex flex-wrap gap-2.5 opacity-0 pointer-events-auto md:flex-shrink-0"
                >
                  {slides.map((slide, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        thumbnailEls.current[i] = el;
                      }}
                      className="w-[60px] h-[40px] rounded overflow-hidden cursor-pointer opacity-0 translate-y-5 hover:border-2 hover:border-[rgba(255,255,255,0.7)] transition-[border] duration-300"
                      data-index={i}
                      onClick={() => handleThumbClick(i)}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-full relative z-[80] mt-[100vh]"
            style={{ minHeight: "200vh", backgroundColor: bgColor }}
          />
          <div
            className="w-full h-[50vh] relative z-[80] flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: bgColor }}
          >
            <p
              className="text-[1.2rem] tracking-[2px] mb-4"
              style={{ fontFamily }}
            >
              {footerPrompt}
            </p>
            <a
              href={footerEmailHref}
              className="text-[1.5rem] tracking-[1px] no-underline transition-colors duration-300 hover:text-white"
              style={{ color: textColor, fontFamily }}
            >
              {footerEmail}
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
