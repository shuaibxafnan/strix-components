"use client";

import { useEffect, useId, useRef } from "react";

// ─── ConnectedGrid ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items            array    DEFAULT_ITEMS  Grid entries: { src, title, year, row, col, span }
// bgColor          string   #0f0e0e        Page background
// textColor        string   #f0f0f0        Base text color
// titleColor       string   #7f7f8f        Caption heading color
// yearColor        string   #b9b3af        Caption year color
// heading          string   Connected Grid…Large heading above the grid
// outroTitle       string   End of the line Text shown after the grid
// columns          number   8              Number of grid columns on desktop
// gapRem           number   4              Gap between grid items (rem)
// imgRatio         number   1.5            Aspect ratio of each image frame
// captionOffset    number   1              Caption vertical offset unit (--s in original)
// imgScaleFrom     number   0              Starting scale of the image frame
// innerScaleFrom   number   5              Starting scale of the inner image (zoom-out)
// captionShift     number   100            Caption slide distance (xPercent)
// scrollStart      string   top bottom-=15%  ScrollTrigger start position
// scrollEnd        string   +=100%         ScrollTrigger end position
// ease             string   power4         Easing for scale tweens
// captionEase      string   power1         Easing for the caption tween
// lerp             number   0.15           Lenis smoothing (lower = smoother)
// smoothScroll     boolean  true           Enable Lenis smooth scrolling
// className        string   ""             Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    title: "Warm Oasis Retreat",
    year: "2023",
    row: 1,
    col: 1,
    span: 4,
  },
  {
    src: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    title: "Desert Serenity Suites",
    year: "2022",
    row: 2,
    col: 5,
    span: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    title: "Sandscape Elegance",
    year: "2024",
    row: 3,
    col: 3,
    span: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    title: "Dune Mirage Retreat",
    year: "2021",
    row: 4,
    col: 1,
    span: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    title: "Sahara Luxury Oasis",
    year: "2023",
    row: 5,
    col: 3,
    span: 5,
  },
  {
    src: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    title: "Arabian Haven",
    year: "2022",
    row: 6,
    col: 2,
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    title: "Desert Dreamscape Lodges",
    year: "2024",
    row: 7,
    col: 3,
    span: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    title: "Golden Sands Interiors",
    year: "2021",
    row: 8,
    col: 6,
    span: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    title: "Desert Mirage Suites",
    year: "2023",
    row: 9,
    col: 1,
    span: 5,
  },
  {
    src: "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    title: "Oasis Tranquility",
    year: "2022",
    row: 10,
    col: 6,
    span: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    title: "Desert Zen Retreat",
    year: "2024",
    row: 11,
    col: 4,
    span: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    title: "Sandscape Luxury",
    year: "2021",
    row: 12,
    col: 1,
    span: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    title: "Desert Elegance Escapes",
    year: "2023",
    row: 13,
    col: 4,
    span: 5,
  },
];

export default function ConnectedGrid({
  items = DEFAULT_ITEMS,
  bgColor = "#0f0e0e",
  textColor = "#f0f0f0",
  titleColor = "#7f7f8f",
  yearColor = "#b9b3af",
  heading = "Connected Grid Layout Animation",
  outroTitle = "End of the line",
  columns = 8,
  gapRem = 4,
  imgRatio = 1.5,
  captionOffset = 1,
  imgScaleFrom = 0,
  innerScaleFrom = 5,
  captionShift = 100,
  scrollStart = "top bottom-=15%",
  scrollEnd = "+=100%",
  ease = "power4",
  captionEase = "power1",
  lerp = 0.15,
  smoothScroll = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const scope = "cg-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let killed = false;
    let lenis = null;
    let rafId = null;
    const triggers = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    const preload = (nodes) =>
      Promise.all(
        nodes.map(
          (node) =>
            new Promise((resolve) => {
              const url = node.getAttribute("data-src");
              if (!url) {
                resolve();
                return;
              }
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = url;
            }),
        ),
      );

    const run = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      );
      if (smoothScroll) {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
        );
      }
      if (killed || !rootRef.current) return;

      const { gsap, ScrollTrigger, Lenis } = window;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      const root = rootRef.current;
      const gridItems = Array.from(root.querySelectorAll("[data-grid-item]"));
      const inners = Array.from(root.querySelectorAll("[data-img-inner]"));

      await preload(inners);
      if (killed) return;

      inners.forEach((node) => {
        const url = node.getAttribute("data-src");
        if (url) node.style.backgroundImage = 'url("' + url + '")';
      });

      if (smoothScroll && Lenis) {
        lenis = new Lenis({ lerp, smoothWheel: true });
        lenis.on("scroll", () => ScrollTrigger.update());
        const scrollFn = (time) => {
          if (killed) return;
          lenis.raf(time);
          rafId = requestAnimationFrame(scrollFn);
        };
        rafId = requestAnimationFrame(scrollFn);
      }

      gridItems.forEach((item) => {
        const prev = item.previousElementSibling;
        const isLeftSide =
          prev && item.offsetLeft + item.offsetWidth <= prev.offsetLeft + 1;
        const originX = isLeftSide ? 100 : 0;

        const tl = gsap
          .timeline({
            defaults: { ease },
            scrollTrigger: {
              trigger: item,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
            },
          })
          .fromTo(
            item.querySelector("[data-img-frame]"),
            { scale: imgScaleFrom, transformOrigin: originX + "% 0%" },
            { scale: 1 },
          )
          .fromTo(
            item.querySelector("[data-img-inner]"),
            { scale: innerScaleFrom, transformOrigin: originX + "% 0%" },
            { scale: 1 },
            0,
          )
          .fromTo(
            item.querySelector("[data-caption]"),
            { xPercent: isLeftSide ? captionShift : -captionShift, opacity: 0 },
            { ease: captionEase, xPercent: 0, opacity: 1 },
            0,
          );

        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      });

      ScrollTrigger.refresh();
      root.setAttribute("data-ready", "true");
    };

    run().catch(() => {});

    return () => {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      triggers.forEach((t) => t.kill());
      if (lenis && lenis.destroy) lenis.destroy();
    };
  }, [
    items,
    columns,
    lerp,
    smoothScroll,
    imgScaleFrom,
    innerScaleFrom,
    captionShift,
    scrollStart,
    scrollEnd,
    ease,
    captionEase,
  ]);

  const css =
    "." +
    scope +
    " [data-img-inner]{background-position:50%;background-size:cover;}" +
    "@media screen and (min-width:53em){" +
    "." +
    scope +
    " [data-grid]{grid-template-columns:repeat(" +
    columns +
    ",1fr);}" +
    "." +
    scope +
    " [data-grid-item]{grid-column:var(--c) / span var(--s);grid-row:var(--r);}" +
    "}";

  return (
    <div
      ref={rootRef}
      className={
        "w-full overflow-x-hidden antialiased " + scope + " " + className
      }
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <header className="w-full px-12 py-8">
        <h1 className="m-0 max-w-2xl font-light leading-tight text-[clamp(1.5rem,10vw,5rem)]">
          {heading}
        </h1>
      </header>

      <div
        data-grid
        className="relative mx-auto grid w-full auto-rows-auto grid-cols-1 mt-[10vh] mb-[50vh]"
        style={{ gap: gapRem + "rem" }}
      >
        {items.map((item, i) => (
          <figure
            key={i}
            data-grid-item
            className="relative m-0"
            style={{ "--r": item.row, "--c": item.col, "--s": item.span || 1 }}
          >
            <div
              data-img-frame
              className="relative grid w-full place-items-center overflow-hidden"
              style={{ aspectRatio: String(imgRatio) }}
            >
              <div
                data-img-inner
                data-src={item.src}
                className="relative h-full w-full"
              />
            </div>
            <figcaption
              data-caption
              className="absolute flex flex-wrap gap-2 p-2 text-sm font-bold"
              style={{
                top: "calc(100% + " + (captionOffset - 1) * 0.5 + "rem)",
              }}
            >
              <h3
                className="m-0 text-[inherit] font-bold"
                style={{ color: titleColor }}
              >
                {item.title}
              </h3>
              <span className="font-bold" style={{ color: yearColor }}>
                {item.year}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <section className="my-[40vh] grid place-items-center">
        <h2 className="font-light text-[clamp(1.5rem,10vw,2rem)]">
          {outroTitle}
        </h2>
      </section>
    </div>
  );
}
