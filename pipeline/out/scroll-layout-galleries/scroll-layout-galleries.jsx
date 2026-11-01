"use client";

import { useEffect, useId, useRef } from "react";

const IMAGES = [
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
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_INTRO = {
  label: "Project",
  name: "Layout Studies",
  dateLabel: "Date",
  date: "July, 2023",
  titleLines: ["Composition", "Rearranged"],
  missionLabel: "Mission",
  mission: [
    "A study in how a set of images can hold several arrangements at once. Each gallery below begins in one configuration and resolves into another as you scroll, with every element tracked from its first position to its last.",
    "The transitions are measured rather than decorative: nothing is added or removed between states, only moved, scaled, and re-weighted, so the eye can follow a single tile all the way through the change.",
  ],
};

const DEFAULT_SECTIONS = {
  s1: {
    label: "Reading a Layout",
    text: "A grid is never neutral. The spacing between items, the relative weight of each cell, and the order in which they resolve all shape what gets noticed first. By animating between two arrangements of the same content, the structure itself becomes legible — you see the decisions that a static layout normally hides.",
    align: "left",
  },
  s2: {
    label: "Continuity of Position",
    text: "Every tile keeps its identity across the transition. Rather than fading one arrangement out and another in, each element is measured in its start state and tweened to its end state, so the change reads as a single continuous movement instead of a cut between two unrelated compositions.",
    align: "right",
  },
  s3: {
    label: "Scroll as Timeline",
    text: "Scroll position drives playback directly. The gallery pins while its transition runs, which converts vertical distance into animation progress and lets the viewer scrub forward and backward through the rearrangement at whatever pace they choose.",
    align: "center",
  },
  s4: {
    label: "Density and Rest",
    text: "Dense arrangements create pressure; sparse ones release it. Alternating between the two across a long page gives the sequence a rhythm, and the quieter passages of text between galleries exist to give the eye somewhere to settle before the next change begins.",
    align: "right",
  },
  s5: {
    label: "Depth Without Perspective",
    text: "Stacked layouts suggest depth using only offset, brightness, and scale. There is no perspective transform involved — the sense of one card sitting behind another comes entirely from small consistent decrements applied down the stack.",
    align: "left",
  },
  s6: {
    label: "Closing",
    text: "The final gallery collapses everything to a single frame. After a sequence of increasingly complex arrangements, the reduction to one image is the point: the same content, given the least possible structure, and the end of the scroll.",
    align: "right",
  },
};

const DEFAULT_CAPTIONS = {
  g1: "Seven frames arranged by weight, the largest at center. As the transition runs, the hierarchy flattens and the middle frame expands to fill the viewport entirely.",
  g2: "A nine-cell grid collapses inward until a single cell occupies the full frame, the remaining eight sliding out of view along their own paths.",
  g3: "The Art of Arrangement",
  g4: "Six cards laid side by side, gathering into a single offset stack with each successive card stepping back in brightness.",
  g5: "The same movement rendered in transparency rather than shadow, so the cards read as layered glass instead of stacked paper.",
  g6: "Offset, brightness, and scale applied together — the deepest card in the stack sits smallest, darkest, and furthest right.",
  g7: "What Makes a Grid?",
  g8: "Uneven by Design",
  g9: "One frame, one scroll, and the end of the sequence.",
};

const CARDS = [
  {
    title: "Measuring State Between Layouts",
    src: "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Pinning, Scrubbing, and Pace",
    src: "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Depth From Offset Alone",
    src: "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  },
];

const GRID10_POS = [
  "1 / 1",
  "1 / 2",
  "1 / 4",
  "1 / 5",
  "3 / 6",
  "1 / 7",
  "1 / 9",
  "3 / 10",
  "2 / 8",
  "4 / 9",
  "3 / 8",
  "2 / 2",
  "3 / 1",
  "3 / 4",
  "4 / 3",
  "4 / 7",
];

const BENTO_AREAS = [
  "1 / 1 / 3 / 2",
  "1 / 2 / 2 / 3",
  "2 / 2 / 4 / 3",
  "1 / 3 / 3 / 3",
  "3 / 1 / 3 / 2",
  "3 / 3 / 5 / 4",
  "4 / 1 / 5 / 2",
  "4 / 2 / 5 / 3",
];

const ROW_SIZES = ["s", "m", "l", "xl", "l", "m", "s"];

const pick = (images, count, offset) => {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(images[(offset + i) % images.length]);
  }
  return out;
};

export default function ScrollLayoutGalleries({
  images = IMAGES,
  bgColor = "#131417",
  textColor = "#fff",
  altTextColor = "#575757",
  labelColor = "#adadad",
  captionColor = "#fff",
  intro = DEFAULT_INTRO,
  sections = DEFAULT_SECTIONS,
  captions = DEFAULT_CAPTIONS,
  scrollStart = "center center",
  scrollEnd = "+=300%",
  longScrollEnd = "+=900%",
  stagger = 0.05,
  innerScaleFrom = 2,
  rowItemHeight = "20vh",
  rowSizeFactor = 1.25,
  stackOffset = "1rem",
  tinyColumns = 10,
  tinyWidth = "300%",
  gridRadius = "6px",
  stackRadius = "1.5vw",
  cardsTitle = "Related studies",
  cards = CARDS,
  cardColumns = 3,
  cardRadius = "7px",
  cardBrightness = 0.8,
  showCards = true,
  lerp = 0.1,
  smoothScroll = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const scope = "slg-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let killed = false;
    let lenis = null;
    let rafId = null;
    const created = [];

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
      const [gsapMod, flipMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/Flip"),
        import("gsap/ScrollTrigger"),
        smoothScroll ? import("lenis") : Promise.resolve(null),
      ]);
      if (killed || !rootRef.current) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const Flip = flipMod.Flip || flipMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod ? lenisMod.default || lenisMod.Lenis : null;
      gsap.registerPlugin(Flip, ScrollTrigger);

      const root = rootRef.current;
      const painted = Array.from(root.querySelectorAll("[data-src]"));

      await preload(painted);
      if (killed) return;

      painted.forEach((node) => {
        node.style.backgroundImage =
          'url("' + node.getAttribute("data-src") + '")';
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

      const build = (galleryEl, options) => {
        const settings = {
          flip: {
            absoluteOnLeave: false,
            absolute: false,
            scale: true,
            simple: true,
            ...(options && options.flip),
          },
          start: (options && options.start) || scrollStart,
          end: (options && options.end) || scrollEnd,
          stagger: (options && options.stagger) || 0,
        };

        const caption = galleryEl.querySelector("[data-caption]");
        const items = galleryEl.querySelectorAll("[data-item]");
        const inners = [...items]
          .map((item) => (item.children.length > 0 ? [...item.children] : []))
          .flat();

        galleryEl.setAttribute("data-switch", "true");
        const state = Flip.getState([items, caption], {
          props: "filter, opacity",
        });
        galleryEl.removeAttribute("data-switch");

        const tl = Flip.to(state, {
          ease: "none",
          absoluteOnLeave: settings.flip.absoluteOnLeave,
          absolute: settings.flip.absolute,
          scale: settings.flip.scale,
          simple: settings.flip.simple,
          scrollTrigger: {
            trigger: galleryEl,
            start: settings.start,
            end: settings.end,
            pin: galleryEl.parentNode,
            scrub: true,
          },
          stagger: settings.stagger,
        });

        if (inners.length) {
          tl.fromTo(
            inners,
            { scale: innerScaleFrom },
            {
              scale: 1,
              scrollTrigger: {
                trigger: galleryEl,
                start: settings.start,
                end: settings.end,
                scrub: true,
              },
            },
            0,
          );
        }

        created.push(tl);
      };

      const config = [
        ["g1", { flip: { absoluteOnLeave: true, scale: false } }],
        ["g2", null],
        [
          "g3",
          {
            flip: { absolute: true, scale: false },
            end: longScrollEnd,
            stagger,
          },
        ],
        ["g4", null],
        ["g5", null],
        ["g6", null],
        ["g7", null],
        ["g8", { flip: { scale: false } }],
        ["g9", null],
      ];

      config.forEach(([id, options]) => {
        const el = root.querySelector('[data-gallery="' + id + '"]');
        if (el) build(el, options);
      });

      ScrollTrigger.refresh();
      root.setAttribute("data-ready", "true");
    };

    run().catch(() => {});

    return () => {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      created.forEach((tl) => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      });
      if (lenis && lenis.destroy) lenis.destroy();
    };
  }, [
    images,
    lerp,
    smoothScroll,
    scrollStart,
    scrollEnd,
    longScrollEnd,
    stagger,
    innerScaleFrom,
  ]);

  const s = "." + scope + " ";
  const on = "." + scope + " [data-gallery][data-switch] ";

  let css =
    s +
    "[data-item]{background-position:50% 50%;background-size:cover;flex:none;position:relative;filter:brightness(1);border-radius:" +
    gridRadius +
    ";}" +
    s +
    "[data-inner]{width:100%;height:100%;background-position:50% 50%;background-size:cover;background-repeat:no-repeat;}" +
    s +
    "[data-cut]{overflow:hidden;display:grid;place-items:center;}" +
    s +
    "[data-caption]{z-index:101;font-weight:400;font-size:clamp(1rem,3vw,1.75rem);}" +
    s +
    '[data-type="row"]{display:flex;align-items:center;justify-content:center;gap:2rem;}' +
    s +
    '[data-type="row"] [data-item]{width:auto;aspect-ratio:2 / 3;}' +
    s +
    '[data-type="row"] [data-size="s"]{height:' +
    rowItemHeight +
    ";}" +
    s +
    '[data-type="row"] [data-size="m"]{height:calc(' +
    rowSizeFactor +
    " * " +
    rowItemHeight +
    ");}" +
    s +
    '[data-type="row"] [data-size="l"]{height:calc(' +
    rowSizeFactor +
    " * 2 * " +
    rowItemHeight +
    ");}" +
    s +
    '[data-type="row"] [data-size="xl"]{z-index:100;height:calc(' +
    rowSizeFactor +
    " * 3 * " +
    rowItemHeight +
    ");}" +
    s +
    '[data-type="row"] [data-caption]{position:absolute;width:100%;height:auto;bottom:-50vh;left:0;padding:4.5vw;max-width:730px;opacity:0;}' +
    on +
    '[data-size="m"],' +
    on +
    '[data-size="l"]{height:' +
    rowItemHeight +
    ";}" +
    on +
    "[data-caption]{bottom:0;opacity:1;}" +
    on +
    "[data-center]{height:100vh;width:100vw;aspect-ratio:auto;filter:brightness(0.5);}" +
    s +
    '[data-type="grid"]{height:auto;display:grid;grid-template-columns:repeat(3,auto);grid-template-rows:repeat(3,auto);row-gap:2.5vw;column-gap:3vw;width:min-content;}' +
    s +
    '[data-type="grid"] [data-item]{height:33vh;width:33vw;}' +
    s +
    '[data-type="grid"] [data-caption]{position:absolute;width:100vw;height:100vh;padding:0;top:50%;left:50%;margin-top:50vh;margin-left:-50vw;display:grid;place-items:center;max-width:none;opacity:0;}' +
    s +
    '[data-type="grid"] [data-caption] p{padding:50vh 30vw 10vh 10vw;margin:0;}' +
    "." +
    scope +
    ' [data-type="grid"][data-switch]{gap:0;}' +
    "." +
    scope +
    ' [data-type="grid"][data-switch] [data-item]{height:110vh;width:110vw;filter:brightness(0.65);}' +
    "." +
    scope +
    ' [data-type="grid"][data-switch] [data-caption]{margin-top:-40vh;opacity:1;}' +
    s +
    '[data-type="grid10"]{display:grid;grid-template-columns:repeat(2,1fr);gap:2vw;}' +
    s +
    '[data-type="grid10"] [data-caption]{position:absolute;width:100vw;height:100vh;top:50%;left:50%;margin:100vh 0 0 -50vw;display:grid;place-items:center;font-size:clamp(2rem,8vw,6rem);}' +
    "." +
    scope +
    ' [data-type="grid10"][data-switch]{grid-template-columns:1fr 300px 1fr;grid-template-rows:1fr 60vh 1fr;grid-gap:0;}' +
    "." +
    scope +
    ' [data-type="grid10"][data-switch] [data-item]{grid-area:2 / 2 / 3 / 3;}' +
    "." +
    scope +
    ' [data-type="grid10"][data-switch] [data-caption]{opacity:1;margin-top:-50vh;}' +
    s +
    '[data-type="stack"]{display:grid;grid-template-columns:repeat(6,1fr);align-items:center;justify-content:start;gap:2rem;padding:2rem;}' +
    s +
    '[data-type="stack"] [data-item]{border-radius:' +
    stackRadius +
    ";width:25vw;height:35vw;z-index:1;}" +
    s +
    '[data-type="stack"] [data-caption]{position:absolute;bottom:0;left:100vw;width:100vw;padding:5vw;opacity:0;z-index:0;}' +
    s +
    '[data-type="stack"] [data-caption] p{margin:0;}' +
    "." +
    scope +
    ' [data-type="stack"][data-switch] [data-item]{grid-area:1 / 1 / 2 / 2;}' +
    "." +
    scope +
    ' [data-type="stack"][data-switch] [data-caption]{left:0;opacity:1;}';

  for (let i = 1; i <= 6; i += 1) {
    css +=
      s +
      '[data-variant~="inverse"] [data-item]:nth-child(' +
      i +
      "){z-index:" +
      (7 - i) +
      ";}";
    if (i > 1) {
      css +=
        "." +
        scope +
        ' [data-type="stack"][data-switch] [data-item]:nth-child(' +
        i +
        "){margin-left:calc(" +
        stackOffset +
        " * " +
        (i - 1) +
        ");}" +
        "." +
        scope +
        ' [data-variant~="dark"][data-switch] [data-item]:nth-child(' +
        i +
        "){filter:brightness(" +
        (1 - i * 0.1).toFixed(1) +
        ");}" +
        "." +
        scope +
        ' [data-variant~="scale"][data-switch] [data-item]:nth-child(' +
        i +
        "){transform:scale(" +
        (1 - (i - 1) * 0.02).toFixed(2) +
        ");}";
    }
  }

  css +=
    "." +
    scope +
    ' [data-variant~="glass"][data-switch] [data-item]{opacity:0.7;}' +
    s +
    '[data-type="gridtiny"]{display:grid;grid-template-columns:repeat(' +
    tinyColumns +
    ",1fr);width:" +
    tinyWidth +
    ";padding:0 2vh;height:min-content;gap:1vh;}" +
    s +
    '[data-type="gridtiny"] [data-item]{aspect-ratio:1;width:100%;height:auto;filter:contrast(0.8) saturate(0) brightness(0.6) opacity(1);}' +
    s +
    '[data-type="gridtiny"] [data-caption]{position:absolute;width:100vw;height:100vh;left:50%;top:50%;margin:-50vh 0 0 -50vw;display:grid;place-items:center;font-size:clamp(2rem,8vw,4rem);opacity:0;}' +
    "." +
    scope +
    ' [data-type="gridtiny"][data-switch]{width:100%;gap:2vh;}' +
    "." +
    scope +
    ' [data-type="gridtiny"][data-switch] [data-item]{filter:contrast(1) saturate(1) brightness(0.8) opacity(0.8);}' +
    "." +
    scope +
    ' [data-type="gridtiny"][data-switch] [data-caption]{opacity:1;}' +
    s +
    '[data-type="bento"]{display:grid;gap:1vh;grid-template-columns:repeat(3,32.5vw);grid-template-rows:repeat(4,23vh);justify-content:center;align-content:center;}' +
    s +
    '[data-type="bento"] [data-caption]{position:absolute;width:100vw;height:100vh;top:50%;left:50%;margin:100vh 0 0 -50vw;font-size:clamp(2rem,10vw,5rem);display:grid;place-items:center;}' +
    "." +
    scope +
    ' [data-type="bento"][data-switch]{grid-template-columns:repeat(3,100vw);grid-template-rows:repeat(4,49.5vh);gap:15vh;}' +
    "." +
    scope +
    ' [data-type="bento"][data-switch] [data-caption]{margin-top:-50vh;}' +
    s +
    '[data-type="one"]{display:grid;place-items:center;}' +
    s +
    '[data-type="one"] [data-item]{width:400%;height:400%;filter:brightness(1) hue-rotate(90deg);}' +
    s +
    '[data-type="one"] [data-caption]{position:absolute;width:100vw;height:100vh;top:50%;left:50%;margin:100vh 0 0 -50vw;font-size:clamp(2rem,5vw,3rem);display:grid;place-items:center;}' +
    "." +
    scope +
    ' [data-type="one"][data-switch] [data-item]{width:100%;height:100%;filter:brightness(0.7) hue-rotate(0deg);}' +
    "." +
    scope +
    ' [data-type="one"][data-switch] [data-caption]{margin-top:-50vh;}' +
    "@media screen and (min-width:53em){" +
    s +
    "[data-cards]{grid-template-columns:repeat(" +
    cardColumns +
    ",minmax(0,250px));}" +
    s +
    '[data-type="grid10"]{grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(4,1fr);}' +
    GRID10_POS.map(
      (area, i) =>
        "." +
        scope +
        ' [data-type="grid10"]:not([data-switch]) [data-pos="' +
        (i + 1) +
        '"]{grid-area:' +
        area +
        ";}",
    ).join("") +
    s +
    '[data-type="stack"] [data-caption]{bottom:40%;width:60vw;max-width:800px;}' +
    "." +
    scope +
    ' [data-type="stack"][data-switch] [data-caption]{left:40vw;}' +
    "}";

  const Wrap = ({ variant, children }) => (
    <div
      className={
        "relative flex w-full items-center justify-center overflow-hidden " +
        (variant === "large"
          ? "h-[110vh] my-[40vh] mx-auto"
          : variant === "dense"
            ? "h-screen m-0"
            : "h-screen my-[40vh] mx-auto")
      }
    >
      {children}
    </div>
  );

  const Section = ({ data }) => (
    <section
      className={
        "mx-auto my-[20vh] grid max-w-[1000px] gap-y-2 p-4 md:grid-cols-[auto_auto] " +
        (data.align === "left"
          ? "justify-start"
          : data.align === "right"
            ? "justify-end"
            : "")
      }
      style={{ columnGap: "7vw" }}
    >
      <span className="md:text-right" style={{ color: labelColor }}>
        {data.label}
      </span>
      <p
        className="m-0 max-w-[400px] leading-relaxed"
        style={{ color: altTextColor }}
      >
        {data.text}
      </p>
    </section>
  );

  const stacks = [
    { id: "g4", variant: "inverse dark", offset: 0 },
    { id: "g5", variant: "glass", offset: 6 },
    { id: "g6", variant: "inverse scale dark", offset: 12 },
  ];

  return (
    <div
      ref={rootRef}
      className={
        "relative w-full overflow-hidden antialiased " + scope + " " + className
      }
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section
        className="mx-auto my-[20vh] grid max-w-[1000px] grid-cols-1 gap-y-2 p-4 md:grid-cols-[auto_1fr]"
        style={{ columnGap: "7vw" }}
      >
        <span className="md:text-right" style={{ color: labelColor }}>
          {intro.label}
        </span>
        <span>{intro.name}</span>
        <span className="md:text-right" style={{ color: labelColor }}>
          {intro.dateLabel}
        </span>
        <span>{intro.date}</span>
        <h2 className="my-[10vh] font-normal leading-none text-[clamp(2rem,13vw,8rem)] md:col-span-2">
          {intro.titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
        <span className="md:text-right" style={{ color: labelColor }}>
          {intro.missionLabel}
        </span>
        <div className="grid gap-8 leading-relaxed md:grid-cols-2">
          {intro.mission.map((p, i) => (
            <p
              key={i}
              className={"m-0 " + (i === 1 ? "md:col-start-2" : "")}
              style={{ color: altTextColor }}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      <Wrap>
        <div
          data-gallery="g1"
          data-type="row"
          className="relative h-full w-full flex-none"
        >
          {pick(images, 7, 0).map((src, i) => (
            <div
              key={i}
              data-item
              data-src={src}
              data-size={ROW_SIZES[i]}
              {...(ROW_SIZES[i] === "xl" ? { "data-center": "true" } : {})}
            />
          ))}
          <div data-caption style={{ color: captionColor }}>
            {captions.g1}
          </div>
        </div>
      </Wrap>

      <Section data={sections.s1} />

      <Wrap variant="large">
        <div
          data-gallery="g2"
          data-type="grid"
          className="relative h-full flex-none"
        >
          {pick(images, 9, 7).map((src, i) => (
            <div key={i} data-item data-cut>
              <div data-inner data-src={src} />
            </div>
          ))}
          <div data-caption style={{ color: captionColor }}>
            <p>{captions.g2}</p>
          </div>
        </div>
      </Wrap>

      <Section data={sections.s2} />

      <Wrap>
        <div
          data-gallery="g3"
          data-type="grid10"
          className="relative h-full w-full flex-none"
        >
          {pick(images, 16, 2).map((src, i) => (
            <div key={i} data-item data-src={src} data-pos={i + 1} />
          ))}
          <div data-caption style={{ color: captionColor }}>
            {captions.g3}
          </div>
        </div>
      </Wrap>

      <Section data={sections.s3} />

      {stacks.map((stack) => (
        <Wrap key={stack.id} variant="dense">
          <div
            data-gallery={stack.id}
            data-type="stack"
            data-variant={stack.variant}
            className="relative h-full w-full flex-none"
          >
            {pick(images, 6, stack.offset).map((src, i) => (
              <div key={i} data-item data-src={src} />
            ))}
            <div data-caption style={{ color: altTextColor }}>
              <p>{captions[stack.id]}</p>
            </div>
          </div>
        </Wrap>
      ))}

      <Section data={sections.s4} />

      <Wrap>
        <div
          data-gallery="g7"
          data-type="gridtiny"
          className="relative h-full flex-none"
        >
          {pick(images, 80, 4).map((src, i) => (
            <div key={i} data-item data-src={src} />
          ))}
          <div data-caption style={{ color: captionColor }}>
            {captions.g7}
          </div>
        </div>
      </Wrap>

      <Section data={sections.s5} />

      <Wrap>
        <div
          data-gallery="g8"
          data-type="bento"
          className="relative h-full w-full flex-none"
        >
          {pick(images, 8, 10).map((src, i) => (
            <div
              key={i}
              data-item
              data-src={src}
              style={{ gridArea: BENTO_AREAS[i] }}
            />
          ))}
          <div data-caption style={{ color: captionColor }}>
            {captions.g8}
          </div>
        </div>
      </Wrap>

      <Section data={sections.s6} />

      <Wrap>
        <div
          data-gallery="g9"
          data-type="one"
          className="relative h-full w-full flex-none"
        >
          <div data-item data-src={images[0]} />
          <div data-caption style={{ color: captionColor }}>
            {captions.g9}
          </div>
        </div>
      </Wrap>

      {showCards && (
        <div className="grid place-items-center px-4">
          <h2 className="mt-[40vh] text-center text-2xl font-light">
            {cardsTitle}
          </h2>
          <div
            data-cards
            className="mt-[5vh] grid grid-cols-[minmax(0,250px)] gap-8"
          >
            {cards.map((card, i) => (
              <div key={i} className="w-full">
                <div
                  className="block h-auto w-full bg-cover bg-center"
                  style={{
                    backgroundImage: 'url("' + card.src + '")',
                    aspectRatio: "4 / 3",
                    borderRadius: cardRadius,
                    filter: "brightness(" + cardBrightness + ")",
                  }}
                />
                <h3 className="mt-3 text-base font-light leading-snug opacity-70">
                  {card.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
