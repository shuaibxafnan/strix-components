"use client";

import { useEffect, useRef, useState, Fragment } from "react";

// ─── SplitTextMenuHero ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// brandName            string    "Moussa"                          Top-left wordmark text
// brandHref            string    "#"                               Wordmark link target
// menuItems            object[]  5 default rows (see below)        [{ number, label, href, images:[src1,src2] }] — full-screen menu rows
// heroImage            string    default writer photo               Full-bleed hero background image
// heroLine1Prefix      string    ""                                 Plain text before the highlighted word on hero line 1
// heroLine1Highlight   string    "Open"                             Highlighted word on hero line 1
// heroLine1Suffix      string    " it already,"                     Plain text after the highlighted word on hero line 1
// heroLine2Prefix      string    "it's just a "                     Plain text before the highlighted word on hero line 2
// heroLine2Highlight   string    "menu"                             Highlighted word on hero line 2
// heroLine2Suffix      string    "."                                 Plain text after the highlighted word on hero line 2
// bgColor              string    #14121A                            Base background (page + menu panel share this family)
// inkColor             string    #F3EFE6                            Primary text color
// accentColor          string    #6C7BFF                            Highlighted words, index marks, and the char-reveal shadow layer
// mutedColor           string    #8A8494                            Dividers and secondary/quiet text
// displayFont          string    "'Fraunces', Georgia, serif"        Font for the giant menu labels and hero lines (load via next/font in your layout)
// monoFont             string    "'IBM Plex Mono', ui-monospace, monospace"  Font for the wordmark and row index marks
// openDuration         number    1.25                               Seconds for the menu-opening reveal
// closeDuration        number    1.5                                Seconds for the menu-closing reveal
// charStagger          number    0.02                               Seconds between each character in the split-text hover/reveal stagger
// gsapCdnUrl           string    cdnjs GSAP core URL                Overridable CDN URL for GSAP core
// splitTypeCdnUrl      string    unpkg SplitType UMD URL            Overridable CDN URL for SplitType (window.SplitType)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_MENU_ITEMS = [
  {
    number: "01",
    label: "Home",
    href: "#",
    images: [
      "https://moussamamadou.github.io/menu-gsap/images/writer-2.jpg",
      "https://moussamamadou.github.io/menu-gsap/images/writer-1.jpg",
    ],
  },
  {
    number: "02",
    label: "About",
    href: "#",
    images: [
      "https://moussamamadou.github.io/menu-gsap/images/cop-2.jpg",
      "https://moussamamadou.github.io/menu-gsap/images/cop-1.jpg",
    ],
  },
  {
    number: "03",
    label: "Projects",
    href: "#",
    images: [
      "https://moussamamadou.github.io/menu-gsap/images/dance-1.jpg",
      "https://moussamamadou.github.io/menu-gsap/images/dance-1.jpg",
    ],
  },
  {
    number: "04",
    label: "Journal",
    href: "#",
    images: [
      "https://moussamamadou.github.io/menu-gsap/images/suits-1.jpg",
      "https://moussamamadou.github.io/menu-gsap/images/suits-1.jpg",
    ],
  },
  {
    number: "05",
    label: "Contact",
    href: "#",
    images: [
      "https://moussamamadou.github.io/menu-gsap/images/writer-2.jpg",
      "https://moussamamadou.github.io/menu-gsap/images/writer-2.jpg",
    ],
  },
];

export default function SplitTextMenuHero({
  brandName = "Moussa",
  brandHref = "#",
  menuItems = DEFAULT_MENU_ITEMS,
  heroImage = "https://moussamamadou.github.io/menu-gsap/images/writer-1.jpg",
  heroLine1Prefix = "",
  heroLine1Highlight = "Open",
  heroLine1Suffix = " it already,",
  heroLine2Prefix = "it's just a ",
  heroLine2Highlight = "menu",
  heroLine2Suffix = ".",
  bgColor = "#14121A",
  inkColor = "#F3EFE6",
  accentColor = "#6C7BFF",
  mutedColor = "#8A8494",
  displayFont = "'Fraunces', Georgia, serif",
  monoFont = "'IBM Plex Mono', ui-monospace, monospace",
  openDuration = 1.25,
  closeDuration = 1.5,
  charStagger = 0.02,
  gsapCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js",
  splitTypeCdnUrl = "https://unpkg.com/split-type@0.3.4/umd/index.min.js",
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navBottomRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuLineRefs = useRef([]);
  const topLinkRefs = useRef([]);
  const bottomLinkRefs = useRef([]);
  const linkImgWrapperRefs = useRef([]);
  const linkImgRefs = useRef([]);
  const bottomLineRefs = useRef([]);
  const heroTextRefs = useRef([]);

  menuLineRefs.current = [];
  topLinkRefs.current = [];
  bottomLinkRefs.current = [];
  linkImgWrapperRefs.current = [];
  linkImgRefs.current = [];
  bottomLineRefs.current = [];
  heroTextRefs.current = [];

  const addRef = (arr) => (el) => {
    if (el && !arr.current.includes(el)) arr.current.push(el);
  };

  useEffect(() => {
    let destroyed = false;

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

    let openAnimation, closeAnimation;
    let topLinkSplits = [];
    let bottomLinkSplits = [];
    const topLinkHandlers = [];
    const bottomLinkHandlers = [];
    let menuButtonHandler = null;
    let isClosed = false;

    Promise.all([loadScript(gsapCdnUrl), loadScript(splitTypeCdnUrl)])
      .then(() => {
        if (destroyed) return;
        const { gsap, SplitType } = window;
        if (!gsap || !SplitType) return;

        const navBottom = navBottomRef.current;
        const linksImgWrapper = linkImgWrapperRefs.current;
        const linksImg = linkImgRefs.current;
        const navTopLinks = topLinkRefs.current;
        const navBottomLinks = bottomLinkRefs.current;
        const allNavLines = bottomLineRefs.current;
        const navMenuButton = menuButtonRef.current;
        const navMenuLines = menuLineRefs.current;
        const heroTexts = heroTextRefs.current;

        bottomLinkSplits = navBottomLinks.map(
          (n) => new SplitType(n, { types: "lines, chars" }),
        );
        topLinkSplits = navTopLinks.map(
          (n) => new SplitType(n, { types: "lines, chars" }),
        );

        gsap.set(navBottom, { display: "flex" });
        gsap.set(linksImgWrapper, {
          clipPath: (index) =>
            index % 2 === 1 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)",
        });

        navTopLinks.forEach((linkEl, index) => {
          const chars = topLinkSplits[index].chars;
          const staggerFrom = index % 2 === 0 ? "start" : "end";

          const onEnter = () => {
            gsap
              .timeline()
              .to(chars, {
                y: "-100%",
                stagger: { each: charStagger, from: staggerFrom },
              });
          };
          const onLeave = () => {
            gsap
              .timeline()
              .to(chars, {
                y: 0,
                overwrite: true,
                stagger: { each: charStagger, from: staggerFrom },
              });
          };

          linkEl.addEventListener("mouseenter", onEnter);
          linkEl.addEventListener("mouseleave", onLeave);
          topLinkHandlers.push({ linkEl, onEnter, onLeave });
        });

        navBottomLinks.forEach((linkEl, index) => {
          const chars = bottomLinkSplits[index].chars;
          const staggerFrom = index % 2 === 0 ? "start" : "end";

          const onEnter = () => {
            gsap
              .timeline()
              .to(chars, {
                y: "-100%",
                stagger: { each: charStagger, from: staggerFrom },
              })
              .to(
                [linksImgWrapper[2 * index], linksImgWrapper[2 * index + 1]],
                { clipPath: "inset(0% 0% 0% 0%)" },
                0.2,
              )
              .fromTo(
                [linksImg[2 * index], linksImg[2 * index + 1]],
                { scale: 1.5, filter: "grayscale(1)" },
                {
                  scale: 1,
                  filter: "grayscale(0)",
                  duration: 0.75,
                  ease: "expo.out",
                },
                0.2,
              );
          };

          const onLeave = () => {
            gsap
              .timeline()
              .to(chars, {
                y: 0,
                overwrite: true,
                stagger: { each: charStagger, from: staggerFrom },
              })
              .to(
                [linksImgWrapper[2 * index], linksImgWrapper[2 * index + 1]],
                {
                  clipPath: (i) =>
                    i % 2 === 1
                      ? "inset(0% 100% 0% 0%)"
                      : "inset(0% 0% 0% 100%)",
                },
                0.2,
              )
              .fromTo(
                [linksImg[2 * index], linksImg[2 * index + 1]],
                { scale: 1, filter: "grayscale(0)" },
                {
                  scale: 1.5,
                  filter: "grayscale(1)",
                  duration: 0.75,
                  ease: "power2.out",
                },
                0.2,
              );
          };

          linkEl.addEventListener("mouseenter", onEnter);
          linkEl.addEventListener("mouseleave", onLeave);
          bottomLinkHandlers.push({ linkEl, onEnter, onLeave });
        });

        openAnimation = gsap
          .timeline({ paused: true })
          .fromTo(
            navBottom,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: openDuration,
              ease: "expo.inOut",
            },
          )
          .from(
            allNavLines,
            {
              clipPath: (index) =>
                index % 2 === 1
                  ? "inset(1px 100% 1.15px 0%)"
                  : "inset(1px 0% 1.15px 100%)",
              duration: openDuration,
              ease: "power3.inOut",
            },
            0.25,
          )
          .fromTo(
            bottomLinkSplits.map((x) => x.lines[0]).filter(Boolean),
            { y: "100%" },
            { y: 0, duration: openDuration + 0.25, ease: "power3.inOut" },
            0,
          )
          .to(navTopLinks, { color: inkColor }, 0.5)
          .to(
            navMenuLines,
            { backgroundColor: inkColor, duration: 0.125, ease: "power2.out" },
            0.5,
          )
          .to(
            navMenuLines,
            {
              transform: (i) => `translate(0, ${i % 2 === 0 ? "4px" : "-5px"})`,
              duration: 0.5,
              ease: "power2.out",
            },
            0.5,
          )
          .to(heroTexts, { opacity: 0, duration: 1, ease: "power2.inOut" }, 0);

        closeAnimation = gsap
          .timeline({ paused: true })
          .to(navBottom, {
            clipPath: "inset(0 0 100% 0)",
            duration: closeDuration,
            ease: "expo.inOut",
          })
          .to(
            allNavLines,
            {
              clipPath: (index) =>
                index % 2 === 1
                  ? "inset(1px 100% 1.15px 0%)"
                  : "inset(1px 0% 1.15px 100%)",
              duration: closeDuration - 0.5,
              ease: "power3.inOut",
            },
            0,
          )
          .fromTo(
            bottomLinkSplits.map((x) => x.lines[0]).filter(Boolean),
            { y: 0 },
            { y: "100%", duration: closeDuration - 0.5, ease: "power3.inOut" },
            0,
          )
          .to(navTopLinks, { color: inkColor }, "-=0.5")
          .to(
            navMenuLines,
            { backgroundColor: inkColor, duration: 0.125, ease: "power2.out" },
            "-=0.5",
          )
          .to(
            navMenuLines,
            { transform: "translate(0)", duration: 0.75, ease: "power2.out" },
            "-=0.5",
          )
          .to(
            heroTexts,
            { opacity: 1, duration: closeDuration - 0.5, ease: "power2.out" },
            0.5,
          );

        menuButtonHandler = () => {
          if (isClosed) {
            closeAnimation.restart();
          } else {
            openAnimation.restart();
          }
          isClosed = !isClosed;
          setIsMenuOpen(isClosed);
        };
        navMenuButton.addEventListener("click", menuButtonHandler);
      })
      .catch((e) =>
        console.error("[SplitTextMenuHero] Script load failed:", e.message),
      );

    return () => {
      destroyed = true;
      if (openAnimation) openAnimation.kill();
      if (closeAnimation) closeAnimation.kill();
      topLinkHandlers.forEach(({ linkEl, onEnter, onLeave }) => {
        linkEl.removeEventListener("mouseenter", onEnter);
        linkEl.removeEventListener("mouseleave", onLeave);
      });
      bottomLinkHandlers.forEach(({ linkEl, onEnter, onLeave }) => {
        linkEl.removeEventListener("mouseenter", onEnter);
        linkEl.removeEventListener("mouseleave", onLeave);
      });
      if (menuButtonRef.current && menuButtonHandler) {
        menuButtonRef.current.removeEventListener("click", menuButtonHandler);
      }
      topLinkSplits.forEach((split) => split.revert?.());
      bottomLinkSplits.forEach((split) => split.revert?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    menuItems,
    openDuration,
    closeDuration,
    charStagger,
    inkColor,
    gsapCdnUrl,
    splitTypeCdnUrl,
  ]);

  return (
    <div
      className="relative w-full"
      style={{
        backgroundColor: bgColor,
        color: inkColor,
        fontFamily: monoFont,
      }}
    >
      <nav className="absolute inset-x-0 top-0 bottom-auto z-[1]">
        <div className="relative z-[2] flex w-full items-center justify-between px-6 py-5 sm:px-10">
          <a
            ref={addRef(topLinkRefs)}
            href={brandHref}
            className="overflow-hidden text-base tracking-[0.02em] no-underline [&>*]:will-change-transform"
            style={{
              lineHeight: 1.15,
              textShadow: `0px 1.15em 0px ${accentColor}`,
            }}
          >
            {brandName}
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="group relative flex flex-none cursor-pointer items-center gap-3 rounded-full border px-4 py-2 transition-all duration-300 hover:scale-105 hover:border-[var(--menu-btn-accent)]"
            style={{
              borderColor: mutedColor,
              "--menu-btn-accent": accentColor,
            }}
          >
            <span
              className="text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-300"
              style={{ color: inkColor }}
            >
              {isMenuOpen ? "Close" : "Menu"}
            </span>
            <div className="relative flex h-3 w-5 flex-none flex-col items-stretch justify-between">
              <div
                ref={addRef(menuLineRefs)}
                className="h-[1.5px] w-full origin-center transition-colors duration-300 group-hover:opacity-70"
                style={{ backgroundColor: inkColor }}
              />
              <div
                ref={addRef(menuLineRefs)}
                className="h-[1.5px] w-full origin-center transition-colors duration-300 group-hover:opacity-70"
                style={{ backgroundColor: inkColor }}
              />
            </div>
          </button>
        </div>

        <div
          ref={navBottomRef}
          className="absolute inset-0 z-0 hidden h-screen w-full flex-col items-stretch gap-0 px-6 pt-24 pb-8 sm:px-10 sm:pt-28"
          style={{ backgroundColor: bgColor }}
        >
          {menuItems.map((item, index) => {
            const zigzag = index % 2 === 0 ? "justify-start" : "justify-end";
            return (
              <Fragment key={item.label + index}>
                <div className="flex flex-1 items-center">
                  <div
                    className={`relative flex w-full items-center gap-[4vh] ${zigzag}`}
                  >
                    {item.images[0] && (
                      <div
                        ref={addRef(linkImgWrapperRefs)}
                        className="relative hidden flex-none overflow-hidden rounded-md [aspect-ratio:3/2] w-[17vh] sm:block"
                      >
                        <img
                          ref={addRef(linkImgRefs)}
                          src={item.images[0]}
                          alt=""
                          className="h-full w-full object-cover grayscale"
                        />
                      </div>
                    )}

                    <div className="relative flex items-baseline gap-[1.5vh] overflow-hidden">
                      <span
                        className="flex-none text-[1.4vh] tracking-[0.15em]"
                        style={{ color: accentColor, fontFamily: monoFont }}
                      >
                        {item.number}
                      </span>
                      <a
                        ref={addRef(bottomLinkRefs)}
                        href={item.href}
                        className="relative flex-none overflow-hidden text-[6vh] italic no-underline [&>*]:will-change-transform sm:text-[7.5vh]"
                        style={{
                          fontFamily: displayFont,
                          lineHeight: 1.15,
                          textShadow: `0px 1.15em 0px ${accentColor}`,
                        }}
                      >
                        {item.label}
                      </a>
                    </div>

                    {item.images[1] && (
                      <div
                        ref={addRef(linkImgWrapperRefs)}
                        className="relative hidden flex-none overflow-hidden rounded-md [aspect-ratio:3/2] w-[17vh] sm:block"
                      >
                        <img
                          ref={addRef(linkImgRefs)}
                          src={item.images[1]}
                          alt=""
                          className="h-full w-full object-cover grayscale"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {index < menuItems.length - 1 && (
                  <div
                    ref={addRef(bottomLineRefs)}
                    className="h-px w-full flex-none opacity-40"
                    style={{
                      background: `linear-gradient(to right, transparent, ${mutedColor}, transparent)`,
                    }}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </nav>

      <section className="relative h-screen w-full">
        <div className="h-screen w-full">
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${bgColor}, transparent 55%)`,
            }}
          />
        </div>

        <div className="absolute inset-x-6 bottom-[6vh] sm:inset-x-10">
          <div
            ref={addRef(heroTextRefs)}
            className="text-[6vw] italic leading-[0.95] sm:text-[4vw]"
            style={{ fontFamily: displayFont }}
          >
            {heroLine1Prefix}
            <span style={{ color: accentColor }}>{heroLine1Highlight}</span>
            {heroLine1Suffix}
          </div>
          <div
            ref={addRef(heroTextRefs)}
            className="mt-1 text-[6vw] italic leading-[0.95] sm:text-[4vw]"
            style={{ fontFamily: displayFont, color: mutedColor }}
          >
            {heroLine2Prefix}
            <span style={{ color: accentColor }}>{heroLine2Highlight}</span>
            {heroLine2Suffix}
          </div>
        </div>
      </section>
    </div>
  );
}
