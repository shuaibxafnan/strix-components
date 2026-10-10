"use client";

import { useEffect, useRef, useId } from "react";

// ─── FlipRevealGallery ────────────────────────────────────────────────────────
//
// A 1:1 port of the horizontal-scroll Flip gallery (GSAP Flip + SplitType +
// Lenis horizontal scroll + a lerped custom cursor). Clicking a thumbnail
// physically moves that <img> (via GSAP Flip) into a full-viewport detail
// panel with animated split-text titles/paragraphs; clicking again reverses
// it back into the scrolling gallery. Structure, timings, and easing match
// the source exactly. Every default below reproduces the original content.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #fff                Page background
// textColor            string   #333                 Base text color
// showNav              boolean  true                 Show the fixed top nav
// navBrand             string   "MOUSSA"               Nav left-side label
// navBrandHref         string   "https://www.moussamamadou.com/"  Nav left link
// navContact           string   "CONTACT"                Nav right-side label
// navContactHref       string   "mailto:moussa.mamadou@outook.com" Nav right link
// items                array    [see DEFAULT_ITEMS]        Gallery + detail entries, each:
//                                                           { image, titleTop, titleBottom,
//                                                             leftTitle, leftParagraph,
//                                                             rightTitle, rightParagraph }
// galleryGapVw         number   7.5                          Gap between gallery thumbnails (vw)
// galleryImageHeightVh number   45                            Thumbnail height (vh), square aspect
// scrollEdgePaddingVw  number   35                            Horizontal padding before/after the strip
// contentWidthVw       number   50                            Detail panel width (vw), 16:9
// titleFontSizeVw      number   6                              title-big font-size (vw)
// sideTextWidthVw      number   17                              Left/right text-block width (vw)
// animDuration         number   1.25                            Open/close timeline duration (s)
// animEase             string   "power4.inOut"                   Open/close timeline ease
// cursorSizeRem        number   1.5                                Custom cursor diameter (rem)
// lenisLerp            number   0.05                                Lenis smoothing factor
// lenisWheelMultiplier number   0.85                                 Lenis wheel speed multiplier
// fontSatoshiUrl       string   (source Satoshi variable .ttf url)     Body @font-face src
// fontGeneralsansUrl   string   (source Generalsans variable .ttf url) Heading @font-face src
// bodyFontFamily       string   "Newsreader"                            Serif used for detail paragraphs (Google Font)
// labelColor           string   #d8cdb4                                  Small caption-label color in the detail view
// backdropBlurPx       number   60                                        Blur applied to the atmospheric backdrop photo
// backdropOpacity      number   0.55                                       Opacity of the atmospheric backdrop photo
// scrimOpacity         number   0.82                                       Opacity of the dark scrim over the backdrop
// ──────────────────────────────────────────────────────────────────────────

const BASE = "https://moussamamadou.github.io/flip-plugin-horizontal-scroll";

const DEFAULT_ITEMS = [
  {
    image: `${BASE}/images/photo-9.jpg`,
    titleTop: "CONFIDENCE",
    titleBottom: "CHARISMA",
    leftTitle: "CHARM",
    leftParagraph:
      "Sharp wit, warm smile a magnetic presence. He walks in, and the room seems to pause, by his quiet strength.",
    rightTitle: "Presence",
    rightParagraph:
      "Striking confidence, captivating charm, and elegance in every glance. A timeless blend of poise and presence, effortlessly charismatic.",
  },
  {
    image: `${BASE}/images/photo-6.jpg`,
    titleTop: "WISDOM",
    titleBottom: "INTELLECT",
    leftTitle: "BRILLIANCE",
    leftParagraph:
      "Quick mind, deep thoughts, a scholarly presence. His ideas illuminate the room, guided by penetrating insight.",
    rightTitle: "knowledge",
    rightParagraph:
      "Deep understanding, thoughtful insights, and clarity in every word. A masterful blend of experience and intuition, naturally enlightening.",
  },
  {
    image: `${BASE}/images/photo-8.jpg`,
    titleTop: "KINDNESS",
    titleBottom: "GENEROSITY",
    leftTitle: "Giving",
    leftParagraph:
      "Open heart, helping hands, a benevolent force. His presence brings comfort, marked by selfless grace.",
    rightTitle: "Compassion",
    rightParagraph:
      "Gentle spirit, nurturing soul, and warmth in every action. A beautiful harmony of empathy and understanding, naturally caring.",
  },
  {
    image: `${BASE}/images/photo-12.jpg`,
    titleTop: "CREATIVITY",
    titleBottom: "ARTISTRY",
    leftTitle: "Expression",
    leftParagraph:
      "Fluid style, bold vision, a creative soul. He transforms the ordinary, through his unique perspective.",
    rightTitle: "Innovation",
    rightParagraph:
      "Boundless imagination, artistic flair, and vision in every creation. A stunning fusion of originality and skill, naturally inspiring.",
  },
  {
    image: `${BASE}/images/photo-5.jpg`,
    titleTop: "LEADERSHIP",
    titleBottom: "INFLUENCE",
    leftTitle: "Impact",
    leftParagraph:
      "Strong presence, clear purpose, a guiding light. He shapes the path forward, through determined leadership.",
    rightTitle: "Guidance",
    rightParagraph:
      "Natural authority, inspiring presence, and direction in every decision. A powerful combination of vision and influence, naturally commanding.",
  },
  {
    image: `${BASE}/images/photo-10.jpg`,
    titleTop: "GRACE",
    titleBottom: "ELEGANCE",
    leftTitle: "SOPHISTICATION",
    leftParagraph:
      "Smooth demeanor, cultured taste, a refined presence. He elevates any setting, with natural elegance.",
    rightTitle: "POLISH",
    rightParagraph:
      "Refined movement, sophisticated manner, and style in every gesture. A perfect balance of poise and dignity, naturally flowing.",
  },
  {
    image: `${BASE}/images/photo-4.jpg`,
    titleTop: "PASSION",
    titleBottom: "INTENSITY",
    leftTitle: "Drive",
    leftParagraph:
      "Fierce determination, endless energy, a dynamic force. He ignites inspiration, through passionate pursuit.",
    rightTitle: "Enthusiasm",
    rightParagraph:
      "Burning drive, intense focus, and fire in every pursuit. An explosive blend of energy and dedication, naturally motivating.",
  },
];

export default function FlipGsapShowcase({
  bgColor = "#fff",
  textColor = "#333",
  showNav = true,
  navBrand = "MOUSSA",
  navBrandHref = "https://www.moussamamadou.com/",
  navContact = "CONTACT",
  navContactHref = "mailto:moussa.mamadou@outook.com",
  items = DEFAULT_ITEMS,
  galleryGapVw = 7.5,
  galleryImageHeightVh = 45,
  scrollEdgePaddingVw = 35,
  contentWidthVw = 50,
  titleFontSizeVw = 6,
  sideTextWidthVw = 17,
  animDuration = 1.25,
  animEase = "power4.inOut",
  cursorSizeRem = 1.5,
  lenisLerp = 0.05,
  lenisWheelMultiplier = 0.85,
  fontSatoshiUrl = `${BASE}/fonts/Satoshi-Variable.ttf`,
  fontGeneralsansUrl = `${BASE}/fonts/GeneralSans-Variable.ttf`,
  bodyFontFamily = "Newsreader",
  labelColor = "#d8cdb4",
  backdropBlurPx = 60,
  backdropOpacity = 0.55,
  scrimOpacity = 0.82,
}) {
  const uid = useId();
  const satoshiFamily = `Satoshi ${uid}`;
  const generalsansFamily = `Generalsans ${uid}`;

  const scrollWrapperRef = useRef(null);
  const sectionContentRef = useRef(null);
  const cursorRef = useRef(null);

  const galleryWrapperRefs = useRef([]);
  const galleryImageRefs = useRef([]);
  const contentRefs = useRef([]);
  const contentWrapperRefs = useRef([]);

  useEffect(() => {
    const linkId = `font-${bodyFontFamily.replace(/\s+/g, "-")}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${bodyFontFamily.replace(
        /\s+/g,
        "+",
      )}:ital,wght@0,400;0,500;1,400&display=swap`;
      document.head.appendChild(link);
    }
  }, [bodyFontFamily]);

  useEffect(() => {
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

    let cleanupFns = [];

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
      ),
      loadScript("https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js"),
      loadScript(
        "https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js",
      ),
    ])
      .then(() => {
        const { gsap, Flip, Lenis, SplitType } = window;
        if (!gsap || !Flip || !scrollWrapperRef.current) return;

        gsap.registerPlugin(Flip);

        const scrollWrapper = scrollWrapperRef.current;
        const sectionContent = sectionContentRef.current;
        const cursor = cursorRef.current;

        const galleryImagesWrapper = galleryWrapperRefs.current.filter(Boolean);
        const galleryImages = galleryImageRefs.current.filter(Boolean);
        const contents = contentRefs.current.filter(Boolean);
        const contentWrappers = contentWrapperRefs.current.filter(Boolean);

        const lenis = new Lenis({
          autoRaf: true,
          wrapper: scrollWrapper,
          content: scrollWrapper.firstElementChild,
          orientation: "horizontal",
          lerp: lenisLerp,
          wheelMultiplier: lenisWheelMultiplier,
          smoothWheel: true,
          smoothTouch: true,
        });

        // ── Split each content panel's text into chars/lines for reveal ──
        function initializeSplitText(content) {
          if (!content) return null;

          const titleTopEl = content.querySelector(
            '[data-role="text-top"] div',
          );
          const titleBottomEl = content.querySelector(
            '[data-role="text-bottom"] div',
          );
          const textLeftEls = content.querySelectorAll(
            '[data-role="text-left"] div',
          );
          const textRightEls = content.querySelectorAll(
            '[data-role="text-right"] div',
          );

          const titleTopSplit = titleTopEl
            ? new SplitType(titleTopEl, { types: "chars" })
            : null;
          const titleBottomSplit = titleBottomEl
            ? new SplitType(titleBottomEl, { types: "chars" })
            : null;

          titleTopSplit?.chars?.forEach((char) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("char-wrap");
            char.parentNode.insertBefore(wrapper, char);
            wrapper.appendChild(char);
          });
          titleBottomSplit?.chars?.forEach((char) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("char-wrap");
            char.parentNode.insertBefore(wrapper, char);
            wrapper.appendChild(char);
          });

          const textLeftSplits = Array.from(
            textLeftEls,
            (n) => new SplitType(n, { types: "lines" }),
          );
          const textRightSplits = Array.from(
            textRightEls,
            (n) => new SplitType(n, { types: "lines" }),
          );

          [textLeftSplits, textRightSplits].forEach((splits) => {
            splits.forEach((split) => {
              split.lines?.forEach((line) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("line-wrap");
                line.parentNode.insertBefore(wrapper, line);
                wrapper.appendChild(line);
              });
            });
          });

          return {
            titleTopSplit,
            titleBottomSplit,
            textLeftSplits,
            textRightSplits,
          };
        }

        const listOfSplits = contents.map((content) =>
          initializeSplitText(content),
        );

        // ── Cursor follower (lerped toward pointer position) ──
        let currentOpenIndex = null;
        let isAnimating = false;
        let currentAnimation = null;
        let rafId = null;
        let cursorX = 0;
        let cursorY = 0;
        let targetX = 0;
        let targetY = 0;

        function updateCursor() {
          cursorX += (targetX - cursorX) * 0.15;
          cursorY += (targetY - cursorY) * 0.15;
          if (cursor)
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
          rafId = requestAnimationFrame(updateCursor);
        }

        function handleMouseMove(e) {
          if (!cursor) return;
          const bounds = cursor.getBoundingClientRect();
          targetX = e.clientX - (bounds.width * 3) / 4;
          targetY = e.clientY - (bounds.height * 3) / 4;
          if (!rafId) rafId = requestAnimationFrame(updateCursor);
        }

        window.addEventListener("mousemove", handleMouseMove);

        // ── Open / close ──
        const openContent = (index) => {
          if (isAnimating) return;
          isAnimating = true;

          contents[index].style.visibility = "visible";
          const currentWrapper = contentWrappers[index];
          const splits = listOfSplits[index];
          if (!splits?.titleTopSplit) {
            isAnimating = false;
            return;
          }

          splits.titleTopSplit.chars.forEach((char) => {
            char.style.willChange = "transform, clip-path";
          });

          currentAnimation = gsap.timeline({
            duration: animDuration,
            ease: animEase,
            onStart: () => {
              sectionContent.style.visibility = "visible";
              sectionContent.style.zIndex = "10";
            },
            onComplete: () => {
              isAnimating = false;
              currentOpenIndex = index;
              lenis.stop();
              scrollWrapper.style.visibility = "hidden";
              cursor?.classList.add("is-open");
              currentAnimation = null;
              splits.titleTopSplit.chars.forEach((char) => {
                char.style.willChange = "auto";
              });
            },
          });

          currentAnimation
            .addLabel("start", 0)
            .addLabel("texts", 0.5)
            .add(() => {
              const flipState = Flip.getState(galleryImages[index]);
              currentWrapper.appendChild(galleryImages[index]);
              Flip.from(flipState, { duration: animDuration, ease: animEase });
            }, "start")
            .to(
              galleryImagesWrapper.filter((_, i) => i !== index),
              {
                clipPath: "inset(100% 0 0 0)",
                duration: 0.75,
                ease: "power3.inOut",
              },
              0,
            )
            .fromTo(
              [splits.titleTopSplit.elements, splits.titleBottomSplit.elements],
              { xPercent: 15 },
              { xPercent: 0, duration: 1, ease: "power3.out" },
              "start+=1.25",
            )
            .fromTo(
              [splits.titleTopSplit.chars, splits.titleBottomSplit.chars],
              { clipPath: "inset(0 100% 0 0)", xPercent: 10 },
              {
                clipPath: "inset(0 0% 0 0)",
                xPercent: 0,
                duration: 0.75,
                ease: "power3.out",
              },
              "start+=1.25",
            )
            .fromTo(
              [
                ...splits.textLeftSplits.flatMap((s) => s.lines),
                ...splits.textRightSplits.flatMap((s) => s.lines),
              ],
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, stagger: 0.025 },
              "start+=1.2",
            );
        };

        const hideContent = (index) => {
          if (isAnimating || currentOpenIndex === null) return;
          isAnimating = true;

          const currentWrapper = contentWrappers[index];
          const splits = listOfSplits[index];
          lenis.start();
          scrollWrapper.style.visibility = "visible";

          currentAnimation = gsap.timeline({
            duration: animDuration,
            ease: animEase,
            onComplete: () => {
              isAnimating = false;
              currentOpenIndex = null;
              currentAnimation = null;
              cursor?.classList.remove("is-open");
              sectionContent.style.visibility = "hidden";
              sectionContent.style.zIndex = "0";
              contents[index].style.visibility = "hidden";
            },
          });

          currentAnimation
            .addLabel("start", 0)
            .fromTo(
              [splits.titleTopSplit.elements, splits.titleBottomSplit.elements],
              { xPercent: 0 },
              { xPercent: 10, ease: "power3.out", duration: 1 },
              "start",
            )
            .fromTo(
              [splits.titleTopSplit.chars, splits.titleBottomSplit.chars],
              { clipPath: "inset(0 0% 0 0)", xPercent: 0 },
              {
                clipPath: "inset(0 100% 0 0)",
                xPercent: 10,
                ease: "power3.out",
                duration: 0.75,
              },
              "start",
            )
            .to(
              [
                ...splits.textLeftSplits.flatMap((s) => s.lines),
                ...splits.textRightSplits.flatMap((s) => s.lines),
              ],
              { yPercent: 100, stagger: 0.025, duration: 0.75 },
              "start",
            )
            .add(() => {
              const image = currentWrapper.querySelector(
                '[data-gallery="image"]',
              );
              if (!image) return;
              const flipState = Flip.getState(image);
              galleryImagesWrapper[index].appendChild(image);
              Flip.from(flipState, {
                duration: animDuration,
                ease: "power3.inOut",
              });
            }, "start+=0.25")
            .to(
              galleryImagesWrapper.filter((_, i) => i !== index),
              {
                clipPath: "inset(0% 0 0 0)",
              },
            )
            .set(galleryImagesWrapper, { clipPath: "none" });
        };

        const clickHandlers = [];
        galleryImagesWrapper.forEach((wrapper, index) => {
          const onClick = () => {
            if (currentOpenIndex === null) openContent(index);
          };
          const onEnter = () => cursor?.classList.add("is-visible");
          const onLeave = () => cursor?.classList.remove("is-visible");
          wrapper.addEventListener("click", onClick);
          wrapper.addEventListener("mouseenter", onEnter);
          wrapper.addEventListener("mouseleave", onLeave);
          clickHandlers.push([wrapper, "click", onClick]);
          clickHandlers.push([wrapper, "mouseenter", onEnter]);
          clickHandlers.push([wrapper, "mouseleave", onLeave]);
        });

        contentWrappers.forEach((wrapper, index) => {
          const onClick = () => {
            if (currentOpenIndex === index) hideContent(index);
          };
          const onEnter = () => cursor?.classList.add("is-visible");
          const onLeave = () => cursor?.classList.remove("is-visible");
          wrapper.addEventListener("click", onClick);
          wrapper.addEventListener("mouseenter", onEnter);
          wrapper.addEventListener("mouseleave", onLeave);
          clickHandlers.push([wrapper, "click", onClick]);
          clickHandlers.push([wrapper, "mouseenter", onEnter]);
          clickHandlers.push([wrapper, "mouseleave", onLeave]);
        });

        cleanupFns.push(() => {
          window.removeEventListener("mousemove", handleMouseMove);
          if (rafId) cancelAnimationFrame(rafId);
          clickHandlers.forEach(([el, evt, fn]) =>
            el.removeEventListener(evt, fn),
          );
          currentAnimation?.kill();
          lenis.destroy?.();
        });
      })
      .catch((e) =>
        console.error("[FlipRevealGallery] load failed:", e.message),
      );

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [items, animDuration, animEase, lenisLerp, lenisWheelMultiplier]);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: '${satoshiFamily}';
              src: url('${fontSatoshiUrl}') format('truetype');
              font-weight: 300 900;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: '${generalsansFamily}';
              src: url('${fontGeneralsansUrl}') format('truetype');
              font-weight: 200 700;
              font-style: normal;
              font-display: swap;
            }
            .char-wrap, .line-wrap {
              display: inline-block;
              overflow: hidden;
            }
            [data-role="text-top"] .line,
            [data-role="text-bottom"] .line,
            [data-role="text-top"] .word,
            [data-role="text-bottom"] .word {
              display: inline-block;
              overflow: hidden;
            }
          `,
        }}
      />

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="pointer-events-none invisible relative z-[9999] opacity-0 transition-opacity duration-500 [&.is-visible]:opacity-100 [&.is-visible]:visible"
        style={{ width: `${cursorSizeRem}rem`, height: `${cursorSizeRem}rem` }}
      >
        <div className="absolute inset-0 origin-center rotate-45 rounded-full border border-black bg-white transition-transform duration-500 [.is-open_&]:rotate-[405deg]">
          <div
            className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-black"
            style={{ width: "calc(100% - 0.75rem)" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black"
            style={{ width: "calc(100% - 0.75rem)" }}
          />
        </div>
      </div>

      {/* Horizontally scrolling thumbnail strip */}
      <div
        ref={scrollWrapperRef}
        className="relative z-[1] h-screen w-screen overflow-hidden"
      >
        <section
          className="flex h-full w-fit items-center justify-start"
          style={{
            paddingLeft: `${scrollEdgePaddingVw}vw`,
            paddingRight: `${scrollEdgePaddingVw}vw`,
          }}
        >
          <div
            className="flex h-full items-center justify-center"
            style={{ gap: `${galleryGapVw}vw` }}
          >
            {items.map((item, index) => (
              <div
                key={`${uid}-gallery-${index}`}
                ref={(el) => (galleryWrapperRefs.current[index] = el)}
                className="aspect-square cursor-pointer [&:nth-child(odd)]:translate-y-[30%] [&:nth-child(even)]:-translate-y-[30%]"
                style={{ height: `${galleryImageHeightVh}vh` }}
              >
                <div
                  ref={(el) => (galleryImageRefs.current[index] = el)}
                  data-gallery="image"
                  className="h-full w-full"
                >
                  <img
                    src={item.image}
                    alt={item.titleTop}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Detail panels (revealed via Flip) */}
      <section
        ref={sectionContentRef}
        className="invisible fixed inset-0 z-0 flex w-screen items-center justify-center overflow-hidden"
        style={{ visibility: "hidden" }}
      >
        {items.map((item, index) => (
          <div
            key={`${uid}-content-${index}`}
            ref={(el) => (contentRefs.current[index] = el)}
            className="invisible absolute top-0 flex h-screen w-full items-center justify-center"
            style={{ visibility: "hidden" }}
          >
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src={item.image}
                alt=""
                className="h-full w-full scale-110 object-cover"
                style={{
                  filter: `blur(${backdropBlurPx}px)`,
                  opacity: backdropOpacity,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 100% at 50% 50%, transparent 0%, #050505 78%)",
                  opacity: scrimOpacity,
                }}
              />
            </div>

            <div
              ref={(el) => (contentWrapperRefs.current[index] = el)}
              className="relative cursor-pointer"
              style={{ aspectRatio: "16 / 9", width: `${contentWidthVw}vw` }}
            >
              <div
                data-role="text-top"
                className={
                  "absolute flex items-center overflow-hidden [mix-blend-mode:difference] [filter:invert()]" +
                  (index % 2 === 1 ? " justify-end" : " justify-start")
                }
                style={{
                  bottom: "calc(100% - 1.5vw)",
                  width: "105%",
                  marginLeft: "2em",
                }}
              >
                <div
                  className="overflow-hidden text-black"
                  style={{
                    fontFamily: `${generalsansFamily}, Tahoma, sans-serif`,
                    fontSize: `${titleFontSizeVw}vw`,
                    lineHeight: 0.86,
                    letterSpacing: "-0.03em",
                    fontVariationSettings: "'wght' 640",
                  }}
                >
                  {item.titleTop}
                </div>
              </div>

              <div
                data-role="text-bottom"
                className={
                  "absolute left-0 flex items-center overflow-hidden [mix-blend-mode:difference] [filter:invert()]" +
                  (index % 2 === 1 ? " justify-start" : " justify-end")
                }
                style={{
                  top: "calc(100% - 1.75vw)",
                  width: "105%",
                  marginLeft: "2em",
                }}
              >
                <div
                  className="overflow-hidden text-black"
                  style={{
                    fontFamily: `${generalsansFamily}, Tahoma, sans-serif`,
                    fontSize: `${titleFontSizeVw}vw`,
                    lineHeight: 0.86,
                    letterSpacing: "-0.03em",
                    fontVariationSettings: "'wght' 640",
                  }}
                >
                  {item.titleBottom}
                </div>
              </div>

              <div
                data-role="text-left"
                className={
                  "absolute right-full flex h-full flex-col text-right max-[767px]:hidden" +
                  (index % 2 === 1
                    ? " items-start justify-start"
                    : " items-end justify-end")
                }
                style={{
                  width: `${sideTextWidthVw}vw`,
                  paddingTop: "2.5em",
                  paddingBottom: "2.5em",
                  paddingRight: "1.5em",
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    fontFamily: `${generalsansFamily}, Tahoma, sans-serif`,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    color: labelColor,
                  }}
                >
                  {item.leftTitle}
                </div>
                <div
                  className="mt-4 block w-full overflow-hidden whitespace-normal text-white/85"
                  style={{
                    fontFamily: `${bodyFontFamily}, Georgia, serif`,
                    fontSize: "clamp(0.95rem, 1.15vw, 1.5rem)",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {item.leftParagraph}
                </div>
              </div>

              <div
                data-role="text-right"
                className={
                  "absolute left-full flex h-full flex-col max-[767px]:hidden" +
                  (index % 2 === 1 ? " items-end justify-end" : "")
                }
                style={{
                  width: `${sideTextWidthVw}vw`,
                  paddingTop: "2.5em",
                  paddingBottom: "2.5em",
                  paddingLeft: "1.5em",
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    fontFamily: `${generalsansFamily}, Tahoma, sans-serif`,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    color: labelColor,
                  }}
                >
                  {item.rightTitle}
                </div>
                <div
                  className="mt-4 block w-full overflow-hidden whitespace-normal text-white/85"
                  style={{
                    fontFamily: `${bodyFontFamily}, Georgia, serif`,
                    fontSize: "clamp(0.95rem, 1.15vw, 1.5rem)",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {item.rightParagraph}
                </div>
              </div>
              {/* The gallery <img> is Flip-appended here on open, and Flip-returned
                  to its gallery wrapper on close — no image is rendered here at rest. */}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
