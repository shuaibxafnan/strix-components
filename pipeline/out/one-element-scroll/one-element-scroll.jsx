"use client";

import { useEffect, useId, useRef } from "react";

const FASHION_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=900&q=80",
];

const cycled = (arr, count, offset = 0) =>
  Array.from({ length: count }, (_, i) => arr[(offset + i) % arr.length]);

const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const DEFAULT_COLUMN_IMAGES = cycled(FASHION_IMAGES, 4, 0);
const DEFAULT_GRID_IMAGES = cycled(FASHION_IMAGES, 8, 4);
const DEFAULT_RELATED_CARDS = [
  {
    title: "Staggered (3D) Grid Animations with Scroll-Triggered Effects",
    href: "#",
    image: FASHION_IMAGES[0],
  },
  {
    title: "Exploration of On-Scroll Layout Formations",
    href: "#",
    image: FASHION_IMAGES[1],
  },
  {
    title: "Scroll-based SVG Filter Animations on Text",
    href: "#",
    image: FASHION_IMAGES[2],
  },
  {
    title: "Experimental On-Scroll Text Animations with SVG Clip-Path",
    href: "#",
    image: FASHION_IMAGES[3],
  },
  {
    title: "On-Scroll Sliced Text Animation",
    href: "#",
    image: FASHION_IMAGES[4],
  },
];

const loadStylesheet = (href) => {
  if (!href || document.querySelector(`link[data-id="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-id", href);
  document.head.appendChild(link);
};

export default function OneElementScroll({
  mainImage = "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  heroTitleLines = ["Seraph", "Kamos"],
  columnImages = DEFAULT_COLUMN_IMAGES,
  linesRow1Words = ["Natural", "Garments"],
  linesRow2 = {
    before: "Crafted with",
    image: FASHION_IMAGES[5],
    after: "love",
  },
  linesRow3 = { before: "with", image: FASHION_IMAGES[6], after: "respect" },
  sidesLeadIn = "Welcome to Seraph Kamos",
  sidesText = "where time meets the eternal. We believe in crafting more than garments—we create connections. Connections to the earth, to human hands, and to the moments that matter. Our designs are born from natural fabrics, each fiber carrying the whispers of its origin: the rustle of flax in a summer breeze, the soft strength of organic cotton, the warmth of wool from sheep raised with care.",
  centerTallText = "We honor the hands that touch every thread, partnering with artisans and communities to ensure fairness, respect, and dignity at every step. No shortcuts, no exploitation—just honest, thoughtful craftsmanship. Every piece you wear carries a story, one rooted in sustainability, transparency, and timeless design.",
  gridImages = DEFAULT_GRID_IMAGES,
  relatedCards = DEFAULT_RELATED_CARDS,
  outroTitle = "More you might like",
  textColor = "#503717",
  bgColor = "rgb(234 234 234)",
  gradientColor1 = "rgb(234 234 234 / 80%)",
  gradientColor2 = "rgb(229 134 27 / 30%)",
  linkHoverColor = "#e1c093",
  titleColor = "#000",
  bodyFontFamily = '"capitana", sans-serif',
  headingFontFamily = '"harpagan", sans-serif',
  fontKitHref = "https://use.typekit.net/klj1rev.css",
  flipDuration = 1,
  flipEase = "sine.inOut",
  lenisLerp = 0.1,
  className = "",
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const oneRef = useRef(null);

  useEffect(() => {
    loadStylesheet(fontKitHref);
  }, [fontKitHref]);

  useEffect(() => {
    let cancelled = false;
    let teardown = null;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/Flip"),
      import("lenis"),
    ])
      .then(([gsapMod, stMod, flipMod, lenisMod]) => {
        if (cancelled) return;
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const Flip = flipMod.Flip || flipMod.default;
        const Lenis = lenisMod.default || lenisMod.Lenis;

        gsap.registerPlugin(ScrollTrigger, Flip);

        const root = rootRef.current;
        const oneElement = oneRef.current;
        if (!root || !oneElement) return;

        const parentElement = oneElement.parentNode;
        const stepElements = [...root.querySelectorAll("[data-step]")];

        let flipCtx = null;

        const createFlipOnScrollAnimation = () => {
          flipCtx && flipCtx.revert();

          flipCtx = gsap.context(() => {
            const flipConfig = { duration: flipDuration, ease: flipEase };
            const states = stepElements.map((el) => Flip.getState(el));

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: parentElement,
                start: "clamp(center center)",
                endTrigger: stepElements[stepElements.length - 1],
                end: "clamp(center center)",
                scrub: true,
                immediateRender: false,
              },
            });

            states.forEach((state, index) => {
              const customFlipConfig = {
                ...flipConfig,
                ease: index === 0 ? "none" : flipConfig.ease,
              };
              tl.add(
                Flip.fit(oneElement, state, customFlipConfig),
                index ? "+=0.5" : 0,
              );
            });
          });
        };

        const animateSpansOnScroll = () => {
          const spans = root.querySelectorAll("[data-title-span]");
          spans.forEach((span, index) => {
            const direction = index % 2 === 0 ? -150 : 150;
            const triggerElement = span.closest("[data-center-section]")
              ? span.parentNode
              : span;

            gsap.from(span, {
              x: direction,
              duration: 1,
              ease: "sine",
              scrollTrigger: {
                trigger: triggerElement,
                start: "top bottom",
                end: "+=45%",
                scrub: true,
              },
            });
          });
        };

        const animateImagesOnScroll = () => {
          const images = root.querySelectorAll("[data-reveal-img]");
          images.forEach((image) => {
            gsap.fromTo(
              image,
              {
                scale: 0,
                autoAlpha: 0,
                filter: "brightness(180%) saturate(0%)",
              },
              {
                scale: 1,
                autoAlpha: 1,
                filter: "brightness(100%) saturate(100%)",
                duration: 1,
                ease: "sine",
                scrollTrigger: {
                  trigger: image,
                  start: "top bottom",
                  end: "+=45%",
                  scrub: true,
                },
              },
            );
          });
        };

        const addParallaxToText = () => {
          const firstTextElement = root.querySelector("[data-parallax-text]");
          if (!firstTextElement) return;
          gsap.fromTo(
            firstTextElement,
            { y: 250 },
            {
              y: -250,
              ease: "sine",
              scrollTrigger: {
                trigger: firstTextElement,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            },
          );
        };

        const animateFilterOnFirstSwitch = () => {
          gsap.fromTo(
            oneElement,
            { filter: "brightness(80%)" },
            {
              filter: "brightness(100%)",
              ease: "sine",
              scrollTrigger: {
                trigger: parentElement,
                start: "clamp(top bottom)",
                end: "clamp(bottom top)",
                scrub: true,
              },
            },
          );
        };

        const addParallaxToColumnImages = () => {
          const columnImageEls = [
            ...root.querySelectorAll("[data-column-img]"),
          ];
          const totalImages = columnImageEls.length;
          const middleIndex = (totalImages - 1) / 2;

          columnImageEls.forEach((image, index) => {
            const intensity = Math.abs(index - middleIndex) * 75;
            gsap.fromTo(
              image,
              { y: intensity },
              {
                y: -intensity,
                ease: "sine",
                scrollTrigger: {
                  trigger: image,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });
        };

        const animateRelatedDemos = () => {
          const relatedSection = root.querySelector("[data-card-wrap]");
          if (!relatedSection) return;
          const cards = [...relatedSection.querySelectorAll("[data-card]")];

          gsap.from(cards, {
            scale: 0,
            ease: "sine",
            stagger: { each: 0.04, from: "center" },
            scrollTrigger: {
              trigger: relatedSection,
              start: "top bottom",
              end: "clamp(center center)",
              scrub: true,
            },
          });
        };

        const onResize = () => createFlipOnScrollAnimation();

        createFlipOnScrollAnimation();
        animateSpansOnScroll();
        animateImagesOnScroll();
        addParallaxToText();
        addParallaxToColumnImages();
        animateFilterOnFirstSwitch();
        animateRelatedDemos();
        window.addEventListener("resize", onResize);

        const lenis = new Lenis({ lerp: lenisLerp });
        lenis.on("scroll", ScrollTrigger.update);
        const lenisTick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(lenisTick);
        gsap.ticker.lagSmoothing(0);

        teardown = () => {
          window.removeEventListener("resize", onResize);
          gsap.ticker.remove(lenisTick);
          lenis.destroy();
          flipCtx && flipCtx.revert();
          ScrollTrigger.getAll().forEach((t) => t.kill());
        };
      });

    return () => {
      cancelled = true;
      if (teardown) teardown();
    };

  }, [flipDuration, flipEase, lenisLerp]);

  const bg = (src) => ({
    backgroundImage: `url(${src || FALLBACK_IMAGE})`,
    backgroundSize: "cover",
    backgroundPosition: "50% 50%",
  });

  return (
    <main
      ref={rootRef}
      className={`relative overflow-hidden w-full text-base [-webkit-font-smoothing:antialiased] links-${uid} ${className}`}
      style={{
        color: textColor,
        backgroundColor: bgColor,
        fontFamily: bodyFontFamily,
        backgroundImage: `radial-gradient(ellipse at top, ${gradientColor1}, transparent), radial-gradient(ellipse at bottom, ${gradientColor2}, transparent)`,
        backgroundSize: "100%, 200%",
        backgroundAttachment: "fixed",
      }}
    >
      <section className="grid place-items-center w-full h-screen relative z-[90]">
        <div
          ref={oneRef}
          className="w-full h-full relative z-10 will-change-transform"
          style={bg(mainImage)}
        />
      </section>

      <section
        data-center-section
        className="grid place-items-center gap-6 w-full h-screen relative z-[90] [mix-blend-mode:overlay]"
      >
        <div
          data-step
          className="[grid-area:1/1/-1/-1] h-[38vh] w-auto [aspect-ratio:0.8] will-change-transform"
        />
        <h1
          className="[grid-area:1/1/-1/-1] m-0 leading-[0.9] uppercase text-[clamp(3rem,19vw,8rem)] max-w-[1000px] text-center"
          style={{
            color: titleColor,
            fontFamily: headingFontFamily,
            fontWeight: 500,
          }}
        >
          {heroTitleLines.map((line, i) => (
            <span key={i} data-title-span className="block">
              {line}
            </span>
          ))}
        </h1>
      </section>

      <section className="grid grid-cols-5 gap-8 max-w-[1400px] mx-auto mb-[20vh] justify-items-center relative z-[80] w-full h-screen items-center">
        {columnImages.slice(0, 2).map((src, i) => (
          <div
            key={`col-a-${i}`}
            data-column-img
            className="w-full max-w-[150px] [aspect-ratio:0.8] will-change-transform"
            style={bg(src)}
          />
        ))}
        <div
          data-step
          data-column-img
          className="w-full max-w-[150px] [aspect-ratio:0.8] will-change-transform"
        />
        {columnImages.slice(2, 4).map((src, i) => (
          <div
            key={`col-b-${i}`}
            data-column-img
            className="w-full max-w-[150px] [aspect-ratio:0.8] will-change-transform"
            style={bg(src)}
          />
        ))}
      </section>

      <section className="flex flex-col items-center w-full h-screen justify-center relative z-[90]">
        <h2
          className="flex flex-wrap min-[53em]:flex-nowrap min-[53em]:whitespace-nowrap items-center justify-center gap-[10px] m-0 leading-[1.1] uppercase text-[clamp(2rem,12vw,6rem)]"
          style={{ fontFamily: headingFontFamily, fontWeight: 500 }}
        >
          <span data-title-span className="inline-block">
            {linesRow1Words[0]}
          </span>
          <div
            data-step
            className="h-[0.725em] w-auto [aspect-ratio:16/9] flex-none self-center will-change-transform"
          />
          <span data-title-span className="inline-block">
            {linesRow1Words[1]}
          </span>
        </h2>
        <h2
          className="flex flex-wrap min-[53em]:flex-nowrap min-[53em]:whitespace-nowrap items-center justify-center gap-[10px] m-0 leading-[1.1] uppercase text-[clamp(2rem,12vw,6rem)]"
          style={{ fontFamily: headingFontFamily, fontWeight: 500 }}
        >
          <span data-title-span className="inline-block">
            {linesRow2.before}
          </span>
          <div
            data-reveal-img
            className="h-[0.725em] w-auto [aspect-ratio:16/9] flex-none self-center will-change-transform"
            style={bg(linesRow2.image)}
          />
          <span data-title-span className="inline-block">
            {linesRow2.after}
          </span>
        </h2>
        <h2
          className="flex flex-wrap min-[53em]:flex-nowrap min-[53em]:whitespace-nowrap items-center justify-center gap-[10px] m-0 leading-[1.1] uppercase text-[clamp(2rem,12vw,6rem)]"
          style={{ fontFamily: headingFontFamily, fontWeight: 500 }}
        >
          <span data-title-span className="inline-block">
            {linesRow3.before}
          </span>
          <div
            data-reveal-img
            className="h-[0.725em] w-auto [aspect-ratio:16/9] flex-none self-center will-change-transform"
            style={bg(linesRow3.image)}
          />
          <span data-title-span className="inline-block">
            {linesRow3.after}
          </span>
        </h2>
      </section>

      <section
        className={`sides-${uid} grid w-full h-screen relative z-[90] grid-cols-1`}
        style={{ gridTemplateAreas: `"img" "content"` }}
      >
        <div
          data-step
          className="h-[50vh] min-[53em]:h-full will-change-transform"
          style={{ gridArea: "img" }}
        />
        <div
          data-parallax-text
          className="p-8 mx-auto max-w-[500px] relative"
          style={{ gridArea: "content" }}
        >
          <p>
            <strong>{sidesLeadIn}</strong> {sidesText}
          </p>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (min-width:53em){.sides-${uid}{grid-template-columns:40% 1fr!important;grid-template-areas:"img content"!important;}}`,
          }}
        />
      </section>

      <section
        data-center-section
        className="grid place-items-center gap-6 w-full min-h-screen relative z-[90] pt-[20vh] mb-[30vh] text-center"
      >
        <div
          data-step
          className="[grid-area:1/1/-1/-1] h-[30vh] w-auto [aspect-ratio:0.8] will-change-transform"
        />
        <div className="[grid-area:1/1/-1/-1] max-w-none text-[clamp(1rem,4vw,2rem)]">
          <p>{centerTallText}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 grid-rows-3 gap-4 w-[120%] relative left-[-10%] h-screen min-[53em]:h-[160vh] mx-auto z-[80]">
        {gridImages.slice(0, 1).map((src, i) => (
          <div
            key={`grid-a-${i}`}
            data-reveal-img
            className="w-full h-full will-change-transform"
            style={bg(src)}
          />
        ))}
        <div data-step className="w-full h-full will-change-transform" />
        {gridImages.slice(1).map((src, i) => (
          <div
            key={`grid-b-${i}`}
            data-reveal-img
            className="w-full h-full will-change-transform"
            style={bg(src)}
          />
        ))}
      </section>

      <section className="grid place-items-center mx-0 my-[40vh] px-[10vw]">
        <h2
          className="font-light text-center uppercase"
          style={{ fontSize: "clamp(1rem,5vw,3rem)", margin: "50vh auto 3rem" }}
        >
          {outroTitle}
        </h2>
        <div
          data-card-wrap
          className="w-full grid gap-8 justify-items-center justify-center [grid-auto-flow:row] min-[53em]:[grid-auto-flow:column] [grid-auto-columns:1fr]"
        >
          {relatedCards.map((card, i) => (
            <div
              key={i}
              data-card
              className="w-full max-w-[255px] min-w-[150px] flex flex-col gap-4 relative"
            >
              <a
                href={card.href}
                className="block [aspect-ratio:1] max-w-full"
                style={bg(card.image)}
              />
              <span className="text-[10px] uppercase text-center">
                <a href={card.href} style={{ color: textColor }}>
                  {card.title}
                </a>
              </span>
            </div>
          ))}
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `.links-${uid} a:hover { color: ${linkHoverColor}; }`,
        }}
      />
    </main>
  );
}
