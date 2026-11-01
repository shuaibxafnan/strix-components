"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_MARQUEE_ITEMS = [
  { primary: "Sora Takahashi", secondary: "空 高橋" },
  { primary: "Aoi Nakamura", secondary: "葵 中村" },
  { primary: "Ren Fujimoto", secondary: "蓮 藤本" },
  { primary: "Mio Sakurai", secondary: "澪 桜井" },
  { primary: "Shin Yamamoto", secondary: "真 山本" },
  { primary: "Kaori Kobayashi", secondary: "香織 小林" },
  { primary: "Hikari Inoue", secondary: "光 井上" },
  { primary: "Yuki Kinoshita", secondary: "雪 木下" },
  { primary: "Rina Ishikawa", secondary: "莉奈 石川" },
  { primary: "Kaito Matsumoto", secondary: "海斗 松本" },
];

export default function Staggered3dGrid({
  bgColor = "#000",
  textColor = "#fff",
  linkHoverColor = "#ef5d36",
  altFontClassName = "",
  images = DEFAULT_IMAGES,
  titleLine1 = "Staggered (3D)",
  titleLine2 = "Grid Animations",
  tags = ["#scroll", "#3d", "#grid"],
  introInfo = "Scroll gently & enjoy",
  heroBgImage = "",
  marqueeItems = DEFAULT_MARQUEE_ITEMS,
  bigText = "Halcyon",
  creditsTexts = ["Thank you for scrolling", "Back to top"],
  mainGridCount = 44,
  fullGridColumns = 7,
  fullGridRows = 5,
  scrubEase = "sine",
  lerp = 0.12,
  className = "",
}) {
  const rootRef = useRef(null);
  const img = (i) =>
    images[((i % images.length) + images.length) % images.length];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let lenisInstance;
    let rafCallback;
    let gsapRef;
    let scrollTriggers = [];
    let splits = [];
    let cancelled = false;

    const preloadImages = (selector) =>
      new Promise((resolve) => {
        const els = Array.from(root.querySelectorAll(selector));
        if (els.length === 0) {
          resolve();
          return;
        }
        let loaded = 0;
        const done = () => {
          loaded += 1;
          if (loaded >= els.length) resolve();
        };
        els.forEach((el) => {
          const bg = el.style.backgroundImage;
          const url = bg.slice(5, -2);
          if (!url) {
            done();
            return;
          }
          const image = new Image();
          image.onload = done;
          image.onerror = done;
          image.src = url;
        });
      });

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/SplitText"),
      import("lenis"),
    ])
      .then(async ([gsapMod, stMod, splitMod, lenisMod]) => {
        await preloadImages(".s3d-img");
        return [gsapMod, stMod, splitMod, lenisMod];
      })
      .then(([gsapMod, stMod, splitMod, lenisMod]) => {
        if (cancelled) return;
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const SplitText = splitMod.SplitText || splitMod.default;
        const Lenis = lenisMod.default || lenisMod.Lenis;
        gsapRef = gsap;

        gsap.registerPlugin(ScrollTrigger, SplitText);

        root.classList.remove("s3d-loading");

        lenisInstance = new Lenis({ lerp });
        lenisInstance.on("scroll", ScrollTrigger.update);
        rafCallback = (time) => lenisInstance.raf(time * 1000);
        gsap.ticker.add(rafCallback);
        gsap.ticker.lagSmoothing(0);

        const grid = root.querySelector("[data-grid-main]");
        const gridImages = grid.querySelectorAll(".s3d-imgwrap");
        const marqueeInner = root.querySelector("[data-marquee-inner]");
        const textElement = root.querySelector("[data-text-el]");
        const gridFull = root.querySelector("[data-grid-full]");
        const creditsEls = root.querySelectorAll("[data-credits]");

        const isLeftSide = (element) => {
          const elementCenter =
            element.getBoundingClientRect().left + element.offsetWidth / 2;
          const viewportCenter = window.innerWidth / 2;
          return elementCenter < viewportCenter;
        };

        gridImages.forEach((imageWrap) => {
          const imgEl = imageWrap.querySelector(".s3d-img");
          const leftSide = isLeftSide(imageWrap);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: imageWrap,
                start: "top bottom+=10%",
                end: "bottom top-=25%",
                scrub: true,
              },
            })
            .from(imageWrap, {
              startAt: { filter: "blur(0px) brightness(100%) contrast(100%)" },
              z: 300,
              rotateX: 70,
              rotateZ: leftSide ? 5 : -5,
              xPercent: leftSide ? -40 : 40,
              skewX: leftSide ? -20 : 20,
              yPercent: 100,
              filter: "blur(7px) brightness(0%) contrast(400%)",
              ease: scrubEase,
            })
            .to(imageWrap, {
              z: 300,
              rotateX: -50,
              rotateZ: leftSide ? -1 : 1,
              xPercent: leftSide ? -20 : 20,
              skewX: leftSide ? 10 : -10,
              filter: "blur(4px) brightness(0%) contrast(500%)",
              ease: `${scrubEase}.in`,
            })
            .from(imgEl, { scaleY: 1.8, ease: scrubEase }, 0)
            .to(imgEl, { scaleY: 1.8, ease: `${scrubEase}.in` }, ">");
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: grid,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          })
          .fromTo(
            marqueeInner,
            { x: "100vw" },
            { x: "-100%", ease: scrubEase },
          );

        if (textElement) {
          const splitTextEl = new SplitText(textElement, {
            type: "chars",
          });
          splits.push(splitTextEl);
          gsap
            .timeline({
              scrollTrigger: {
                trigger: textElement,
                start: "top bottom",
                end: "center center-=25%",
                scrub: true,
              },
            })
            .from(splitTextEl.chars, {
              ease: scrubEase,
              yPercent: 300,
              autoAlpha: 0,
              stagger: { each: 0.04, from: "center" },
            });
        }

        const gridFullItems = gridFull.querySelectorAll(".s3d-full-item");
        const numColumns = getComputedStyle(gridFull)
          .getPropertyValue("grid-template-columns")
          .split(" ").length;
        const middleColumnIndex = Math.floor(numColumns / 2);
        const columns = Array.from({ length: numColumns }, () => []);
        gridFullItems.forEach((item, index) => {
          columns[index % numColumns].push(item);
        });

        columns.forEach((columnItems, columnIndex) => {
          if (columnItems.length === 0) return;
          const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: gridFull,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            })
            .from(columnItems, {
              yPercent: 450,
              autoAlpha: 0,
              delay: delayFactor,
              ease: scrubEase,
            })
            .from(
              columnItems.map((item) => item.querySelector(".s3d-full-img")),
              { transformOrigin: "50% 0%", ease: scrubEase },
              0,
            );
        });

        {
          creditsEls.forEach((creditsText) => {
            const splitCredits = new SplitText(creditsText, {
              type: "chars",
            });
            splits.push(splitCredits);
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: creditsText,
                  start: "top bottom",
                  end: "clamp(bottom top)",
                  scrub: true,
                },
              })
              .fromTo(
                splitCredits.chars,
                {
                  x: (index) =>
                    index * 80 - (splitCredits.chars.length * 80) / 2,
                },
                { x: 0, ease: scrubEase },
              );
          });
        }

        scrollTriggers = ScrollTrigger.getAll();
        window.scrollTo(0, 0);
      });

    return () => {
      cancelled = true;
      scrollTriggers.forEach((st) => st.kill());
      splits.forEach((sp) => sp.revert());
      if (gsapRef && rafCallback) gsapRef.ticker.remove(rafCallback);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`s3d-loading relative w-full overflow-hidden font-sans ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        "--s3d-link-hover": linkHoverColor,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .s3d-loading .s3d-reveal { visibility: hidden; }
            html, body { scrollbar-width: none; -ms-overflow-style: none; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
            .s3d-link:hover { color: var(--s3d-link-hover); }
          `,
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-[5000]"
        style={{
          background: `linear-gradient(to right, ${bgColor}, transparent, ${bgColor})`,
        }}
      />

      <section
        className="grid min-h-[calc(100vh-4rem)] w-full content-start items-start justify-items-center gap-6 bg-cover bg-[position:50%_-10%] pb-8 text-center [grid-auto-rows:1fr]"
        style={{
          backgroundImage: heroBgImage
            ? `linear-gradient(to bottom, ${bgColor}, rgba(0,0,0,0.4), ${bgColor}), url(${heroBgImage})`
            : `linear-gradient(to bottom, ${bgColor}, rgba(0,0,0,0.4), ${bgColor})`,
        }}
      >
        <h1
          className={`m-0 self-end text-[clamp(2rem,6vw,4rem)] font-normal uppercase leading-[0.9] ${altFontClassName}`}
        >
          {titleLine1}
          <br />
          {titleLine2}
        </h1>

        <nav className="flex flex-wrap items-start justify-center gap-4 self-start text-[13px] uppercase">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </nav>

        <span className="relative mb-16 max-w-[12ch] self-end pb-4 text-[13px] uppercase leading-[1.2] opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-black">
          {introInfo}
        </span>
      </section>

      <section className="relative grid w-full place-items-center">
        <div
          data-grid-main
          className="s3d-reveal mx-auto grid w-full max-w-[300px] gap-8 py-[20vh] [grid-template-columns:repeat(2,1fr)]"
        >
          {Array.from({ length: mainGridCount }).map((_, i) => (
            <figure
              key={i}
              className="relative z-[1] [perspective:800px] will-change-transform"
            >
              <div className="s3d-imgwrap relative aspect-[1.2] overflow-hidden rounded [transform-style:preserve-3d] will-change-[filter]">
                <div
                  className="s3d-img absolute inset-0 bg-cover [background-position:50%_20%] [backface-visibility:hidden] will-change-transform"
                  style={{ backgroundImage: `url(${img(i)})` }}
                />
              </div>
            </figure>
          ))}
        </div>

        <div className="pointer-events-none fixed left-0 top-1/2 z-50 w-screen -translate-y-1/2 overflow-hidden">
          <div
            data-marquee-inner
            className="flex w-max translate-x-[100vw] gap-12 will-change-transform"
          >
            {marqueeItems.map((item, i) => (
              <span
                key={i}
                className={`whitespace-nowrap text-[3rem] uppercase leading-none ${altFontClassName}`}
              >
                {item.primary} {item.secondary}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid w-full place-items-center">
        <div
          data-text-el
          className={`flex items-center text-[clamp(3rem,14vw,10rem)] uppercase leading-[0.7] ${altFontClassName}`}
        >
          {bigText}
        </div>
      </section>

      <section className="relative grid w-full place-items-center">
        <div
          data-grid-full
          className="my-[10vh] grid w-full gap-4 p-4 [aspect-ratio:1.5]"
          style={{
            gridTemplateColumns: `repeat(${fullGridColumns},1fr)`,
            gridTemplateRows: `repeat(${fullGridRows},1fr)`,
          }}
        >
          {Array.from({ length: fullGridColumns * fullGridRows }).map(
            (_, i) => (
              <figure
                key={i}
                className="s3d-full-item relative m-0 [perspective:800px] will-change-transform"
              >
                <div
                  className="s3d-full-img h-full w-full bg-cover [background-position:50%_20%] [backface-visibility:hidden] will-change-transform"
                  style={{ backgroundImage: `url(${img(i + 5)})` }}
                />
              </figure>
            ),
          )}
        </div>
      </section>

      {creditsTexts.map((text, i) => (
        <p
          key={i}
          data-credits
          className={`mx-auto mt-[50vh] pb-[10vh] text-center text-[clamp(1rem,5vw,3rem)] uppercase ${altFontClassName}`}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
