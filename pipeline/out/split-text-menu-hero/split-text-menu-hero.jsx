"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

const unsplash = (id, size) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&${size}&q=80`;

const thumb = (id) => unsplash(id, "w=600&h=400");

const DEFAULT_MENU_ITEMS = [
  {
    number: "01",
    label: "Home",
    href: "#",
    images: [thumb("photo-1749330513873-09ffa91b0aae"), thumb("photo-1627896157734-4d7d4388f28b")],
  },
  {
    number: "02",
    label: "About",
    href: "#",
    images: [thumb("photo-1778789172736-e8ba37c71124"), thumb("photo-1778961938903-96617183f739")],
  },
  {
    number: "03",
    label: "Projects",
    href: "#",
    images: [thumb("photo-1678112553355-a9dab855ebf3"), thumb("photo-1743309411498-a0f4f4b96b65")],
  },
  {
    number: "04",
    label: "Journal",
    href: "#",
    images: [thumb("photo-1490682143684-14369e18dce8"), thumb("photo-1634325232058-e7b8f80cc20b")],
  },
  {
    number: "05",
    label: "Contact",
    href: "#",
    images: [thumb("photo-1759458856846-097935f54111"), thumb("photo-1533387520709-752d83de3630")],
  },
];

const HIDDEN_CLIP = (index) =>
  index % 2 === 1 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";

export default function SplitTextMenuHero({
  brandName = "Studio",
  brandHref = "#",
  menuItems = DEFAULT_MENU_ITEMS,
  heroImage = unsplash("photo-1752150127767-77bccbed07e2", "w=1920&h=1080"),
  heroAlt = "Hero image",
  heroLine1Prefix = "",
  heroLine1Highlight = "Open",
  heroLine1Suffix = " it already,",
  heroLine2Prefix = "it's just a ",
  heroLine2Highlight = "menu",
  heroLine2Suffix = ".",
  menuLabel = "Menu",
  closeLabel = "Close",
  toggleLabel = "Toggle menu",
  bgColor = "#000000",
  inkColor = "#ffffff",
  accentColor = "#a3a3a3",
  mutedColor = "#737373",
  openDuration = 1.25,
  closeDuration = 1.5,
  charStagger = 0.02,
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const navBottomRef = useRef(null);
  const brandRef = useRef(null);
  const menuLineRefs = useRef([]);
  const bottomLinkRefs = useRef([]);
  const imageWrapperRefs = useRef([]);
  const imageRefs = useRef([]);
  const dividerRefs = useRef([]);
  const heroTextRefs = useRef([]);
  const apiRef = useRef(null);

  useEffect(() => {
    const navBottom = navBottomRef.current;
    const brand = brandRef.current;
    const bottomLinks = bottomLinkRefs.current.filter(Boolean);
    const wrappers = imageWrapperRefs.current.filter(Boolean);
    const images = imageRefs.current.filter(Boolean);
    const dividers = dividerRefs.current.filter(Boolean);
    const menuLines = menuLineRefs.current.filter(Boolean);
    const heroTexts = heroTextRefs.current.filter(Boolean);
    if (!navBottom || !brand) return undefined;

    const splitOptions = { types: "lines, chars", charClass: "char inline-block will-change-transform" };
    const brandSplit = new SplitType(brand, splitOptions);
    const bottomSplits = bottomLinks.map((el) => new SplitType(el, splitOptions));

    gsap.set(navBottom, { display: "flex" });
    gsap.set(wrappers, { clipPath: HIDDEN_CLIP });

    const staggerFor = (index) => ({
      each: charStagger,
      from: index % 2 === 0 ? "start" : "end",
    });

    const brandHover = (on) => {
      gsap.to(brandSplit.chars, {
        y: on ? "-100%" : 0,
        overwrite: true,
        stagger: staggerFor(0),
      });
    };

    const bottomHover = (index, on) => {
      const chars = bottomSplits[index].chars;
      const pair = [wrappers[2 * index], wrappers[2 * index + 1]];
      const pairImages = [images[2 * index], images[2 * index + 1]];
      const tl = gsap.timeline();
      tl.to(chars, { y: on ? "-100%" : 0, overwrite: true, stagger: staggerFor(index) });
      if (on) {
        tl.to(pair, { clipPath: "inset(0% 0% 0% 0%)" }, 0.2).fromTo(
          pairImages,
          { scale: 1.5, filter: "grayscale(1)" },
          { scale: 1, filter: "grayscale(0)", duration: 0.75, ease: "expo.out" },
          0.2,
        );
      } else {
        tl.to(pair, { clipPath: (i) => HIDDEN_CLIP(i) }, 0.2).fromTo(
          pairImages,
          { scale: 1, filter: "grayscale(0)" },
          { scale: 1.5, filter: "grayscale(1)", duration: 0.75, ease: "power2.out" },
          0.2,
        );
      }
    };

    const firstLines = bottomSplits.map((split) => split.lines[0]).filter(Boolean);

    const openTl = gsap
      .timeline({ paused: true })
      .fromTo(
        navBottom,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: openDuration, ease: "expo.inOut" },
      )
      .from(
        dividers,
        {
          clipPath: (i) =>
            i % 2 === 1 ? "inset(1px 100% 1.15px 0%)" : "inset(1px 0% 1.15px 100%)",
          duration: openDuration,
          ease: "power3.inOut",
        },
        0.25,
      )
      .fromTo(
        firstLines,
        { y: "100%" },
        { y: 0, duration: openDuration + 0.25, ease: "power3.inOut" },
        0,
      )
      .to(
        menuLines,
        { y: (i) => (i % 2 === 0 ? 4 : -5), duration: 0.5, ease: "power2.out" },
        0.5,
      )
      .to(heroTexts, { opacity: 0, duration: 1, ease: "power2.inOut" }, 0);

    const closeTl = gsap
      .timeline({ paused: true })
      .to(navBottom, {
        clipPath: "inset(0 0 100% 0)",
        duration: closeDuration,
        ease: "expo.inOut",
      })
      .to(
        dividers,
        {
          clipPath: (i) =>
            i % 2 === 1 ? "inset(1px 100% 1.15px 0%)" : "inset(1px 0% 1.15px 100%)",
          duration: closeDuration - 0.5,
          ease: "power3.inOut",
        },
        0,
      )
      .fromTo(
        firstLines,
        { y: 0 },
        { y: "100%", duration: closeDuration - 0.5, ease: "power3.inOut" },
        0,
      )
      .to(menuLines, { y: 0, duration: 0.75, ease: "power2.out" }, "-=0.5")
      .to(
        heroTexts,
        { opacity: 1, duration: closeDuration - 0.5, ease: "power2.out" },
        0.5,
      );

    let isOpen = false;
    const toggle = () => {
      if (isOpen) {
        openTl.pause();
        closeTl.restart();
      } else {
        closeTl.pause();
        openTl.restart();
      }
      isOpen = !isOpen;
      setOpen(isOpen);
    };

    apiRef.current = { brandHover, bottomHover, toggle };

    return () => {
      apiRef.current = null;
      openTl.kill();
      closeTl.kill();
      gsap.killTweensOf([
        brandSplit.chars,
        ...bottomSplits.map((split) => split.chars),
        wrappers,
        images,
        menuLines,
        heroTexts,
      ]);
      brandSplit.revert();
      bottomSplits.forEach((split) => split.revert());
    };
  }, [menuItems, openDuration, closeDuration, charStagger]);

  return (
    <div
      className={`${display.variable} ${mono.variable} relative w-full bg-[var(--bg)] text-[var(--ink)] [font-family:var(--font-mono)] ${className}`}
      style={{
        "--bg": bgColor,
        "--ink": inkColor,
        "--accent": accentColor,
        "--muted": mutedColor,
      }}
    >
      <nav className="absolute inset-x-0 top-0 z-[1]">
        <div className="relative z-[2] flex w-full items-center justify-between px-6 py-5 sm:px-10">
          <a
            ref={brandRef}
            href={brandHref}
            onMouseEnter={() => apiRef.current?.brandHover(true)}
            onMouseLeave={() => apiRef.current?.brandHover(false)}
            className="overflow-hidden text-base leading-[1.15] tracking-[0.02em] no-underline [text-shadow:0_1.15em_0_var(--accent)]"
          >
            {brandName}
          </a>

          <button
            type="button"
            onClick={() => apiRef.current?.toggle()}
            aria-label={toggleLabel}
            aria-expanded={open}
            className="group relative flex flex-none cursor-pointer items-center gap-3 rounded-full border border-[var(--muted)] px-4 py-2 transition-all duration-300 hover:scale-105 hover:border-[var(--accent)]"
          >
            <span className="text-[0.7rem] uppercase tracking-[0.2em]">
              {open ? closeLabel : menuLabel}
            </span>
            <div className="relative flex h-3 w-5 flex-none flex-col items-stretch justify-between">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  ref={(el) => (menuLineRefs.current[i] = el)}
                  className="h-[1.5px] w-full origin-center bg-[var(--ink)] transition-opacity duration-300 group-hover:opacity-70"
                />
              ))}
            </div>
          </button>
        </div>

        <div
          ref={navBottomRef}
          className="absolute inset-0 z-0 hidden h-screen w-full flex-col items-stretch gap-0 bg-[var(--bg)] px-6 pb-8 pt-24 sm:px-10 sm:pt-28"
        >
          {menuItems.map((item, index) => (
            <Fragment key={index}>
              <div className="flex flex-1 items-center">
                <div
                  className={`relative flex w-full items-center gap-[4vh] ${index % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                >
                  <div
                    ref={(el) => (imageWrapperRefs.current[2 * index] = el)}
                    className="relative hidden w-[17vh] flex-none overflow-hidden rounded-md [aspect-ratio:3/2] sm:block"
                  >
                    <img
                      ref={(el) => (imageRefs.current[2 * index] = el)}
                      src={item.images[0]}
                      alt=""
                      className="h-full w-full object-cover grayscale"
                    />
                  </div>

                  <div className="relative flex items-baseline gap-[1.5vh] overflow-hidden">
                    <span className="flex-none text-[1.4vh] tracking-[0.15em] text-[var(--accent)]">
                      {item.number}
                    </span>
                    <a
                      ref={(el) => (bottomLinkRefs.current[index] = el)}
                      href={item.href}
                      onMouseEnter={() => apiRef.current?.bottomHover(index, true)}
                      onMouseLeave={() => apiRef.current?.bottomHover(index, false)}
                      className="relative flex-none overflow-hidden text-[6vh] italic leading-[1.15] no-underline [font-family:var(--font-display)] [text-shadow:0_1.15em_0_var(--accent)] sm:text-[7.5vh]"
                    >
                      {item.label}
                    </a>
                  </div>

                  <div
                    ref={(el) => (imageWrapperRefs.current[2 * index + 1] = el)}
                    className="relative hidden w-[17vh] flex-none overflow-hidden rounded-md [aspect-ratio:3/2] sm:block"
                  >
                    <img
                      ref={(el) => (imageRefs.current[2 * index + 1] = el)}
                      src={item.images[1] ?? item.images[0]}
                      alt=""
                      className="h-full w-full object-cover grayscale"
                    />
                  </div>
                </div>
              </div>

              {index < menuItems.length - 1 ? (
                <div
                  ref={(el) => (dividerRefs.current[index] = el)}
                  className="h-px w-full flex-none opacity-40 [background:linear-gradient(to_right,transparent,var(--muted),transparent)]"
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </nav>

      <section className="relative h-screen w-full">
        <div className="relative h-screen w-full">
          <img
            src={heroImage}
            alt={heroAlt}
            className="h-full w-full object-cover opacity-70"
          />
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(to_top,var(--bg),transparent_55%)]" />
        </div>

        <div className="absolute inset-x-6 bottom-[6vh] sm:inset-x-10">
          <div
            ref={(el) => (heroTextRefs.current[0] = el)}
            className="text-[6vw] italic leading-[0.95] [font-family:var(--font-display)] sm:text-[4vw]"
          >
            {heroLine1Prefix}
            <span className="text-[var(--accent)]">{heroLine1Highlight}</span>
            {heroLine1Suffix}
          </div>
          <div
            ref={(el) => (heroTextRefs.current[1] = el)}
            className="mt-1 text-[6vw] italic leading-[0.95] text-[var(--muted)] [font-family:var(--font-display)] sm:text-[4vw]"
          >
            {heroLine2Prefix}
            <span className="text-[var(--accent)]">{heroLine2Highlight}</span>
            {heroLine2Suffix}
          </div>
        </div>
      </section>
    </div>
  );
}