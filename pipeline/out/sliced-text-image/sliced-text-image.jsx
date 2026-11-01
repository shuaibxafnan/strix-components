"use client";

import { useEffect, useId, useMemo, useRef } from "react";

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
];

const DEFAULT_FONTS = [
  '"panel-mono", ui-monospace, monospace',
  '"gabriella", ui-sans-serif, sans-serif',
  '"cofo-peshka-variable", ui-sans-serif, sans-serif',
  '"gyst-variable", ui-sans-serif, sans-serif',
  '"neulis-sans", ui-sans-serif, sans-serif',
  '"cofo-peshka-variable", ui-sans-serif, sans-serif',
  '"marlide-display-variable", ui-serif, serif',
  '"gyst-variable", ui-sans-serif, sans-serif',
];

const DEFAULT_SIZES = {
  s: "clamp(2rem, 6vw, 3rem)",
  m: "clamp(3rem, 10vw, 8rem)",
  xl: "clamp(5rem, 18vw, 22rem)",
  xxl: "clamp(5rem, 25vw, 22rem)",
};

const DEFAULT_COLORS = {
  default: "#fff",
  red: "#8b1e18",
  brightRed: "#be2017",
};

const DEFAULT_SHADOWS = {
  none: "none",
  white: "0 0 10px rgba(255 255 255 / 80%)",
  red: "0 0 10px rgba(139 30 24 / 80%)",
};

const DEFAULT_CELLS_BY_EFFECT = { 1: 4, 2: 4, 3: 4, 4: 6, 5: 6, 6: 6 };

const DEFAULT_BLOCKS = [
  {
    type: "paragraph",
    lines: [
      "I have lived in darkness",
      "For all my life, I've been pursued",
      "You'd be afraid if you could feel my pain",
      "And if you could see the things I am able to see",
    ],
  },
  {
    type: "sliced",
    text: "Break me out",
    size: "s",
    font: 3,
    align: "end",
    lowercase: true,
  },
  {
    type: "sliced",
    text: "Break me out",
    size: "s",
    font: 3,
    align: "end",
    lowercase: true,
  },
  {
    type: "sliced",
    text: "saved",
    effect: 1,
    size: "xxl",
    font: 4,
    shadow: "white",
    spaced: true,
    full: true,
    uppercase: true,
  },
  {
    type: "paragraph",
    lines: [
      "I hail from the dark side",
      "For all my life, I've been besieged",
      "You'd be scared living with my despair",
      "And if you could feel the things, I am able to feel",
    ],
  },
  {
    type: "sliced",
    text: "Let me flee",
    size: "s",
    font: 4,
    align: "end",
    lowercase: true,
  },
  {
    type: "sliced",
    text: "loved",
    effect: 2,
    size: "xl",
    font: 3,
    shadow: "red",
    color: "red",
    spaced: true,
    full: true,
    uppercase: true,
  },
  {
    type: "paragraph",
    lines: [
      "In the abyss of time's cold embrace,",
      "Where echoes of hope are cruelly erased,",
      "You'd shiver in the silence of my cries,",
      "If you could traverse the shadows I've embraced.",
    ],
  },
  {
    type: "sliced",
    text: "Break me out",
    size: "s",
    font: 0,
    align: "end",
    lowercase: true,
  },
  {
    type: "sliced",
    text: "freed",
    effect: 3,
    size: "xl",
    font: 6,
    shadow: "white",
    spaced: true,
    full: true,
    uppercase: true,
  },
  {
    type: "sliced",
    text: "Set me free",
    size: "m",
    font: 6,
    align: "end",
    full: true,
  },
  {
    type: "paragraph",
    lines: [
      "In the labyrinth of fabricated truths,",
      "Where echoes of deception distort our roots,",
      "You'd question the illusions I've uncovered,",
      "And if you could decipher the lies I've rediscovered.",
    ],
  },
  {
    type: "sliced",
    text: "bold",
    effect: 4,
    size: "xl",
    font: 1,
    shadow: "red",
    color: "red",
    blend: "plus-lighter",
    spaced: true,
    full: true,
    uppercase: true,
  },
  {
    type: "sliced",
    text: "Unbreak me",
    size: "m",
    font: 3,
    align: "end",
    full: true,
  },
  {
    type: "paragraph",
    lines: [
      "Beyond the confines of my mind's maze,",
      "Where echoes of dreams shimmer like sun rays,",
      "You'd marvel at the wonders I've conceived,",
      "And if you could dream the dreams I've believed.",
    ],
  },
  {
    type: "sliced",
    text: "Awaken me",
    size: "s",
    font: 0,
    align: "end",
    lowercase: true,
  },
  {
    type: "sliced",
    text: "inspired",
    effect: 5,
    size: "xxl",
    font: 5,
    shadow: "white",
    spaced: true,
    full: true,
    uppercase: true,
  },
  {
    type: "sliced",
    text: "Revive me",
    size: "s",
    font: 0,
    align: "end",
    lowercase: true,
  },
  {
    type: "sliced",
    text: "clear",
    effect: 6,
    size: "xl",
    font: 2,
    shadow: "white",
    spaced: true,
    full: true,
    uppercase: true,
  },
  {
    type: "paragraph",
    lines: [
      "In the symphony of nostalgia's refrain,",
      "Where echoes of moments forever remain,",
      "You'd dance in the rhythm of joys and sorrows,",
      "And if you could feel the yesterdays I borrow.",
    ],
  },
];

export default function SlicedTextImage({
  blocks = DEFAULT_BLOCKS,
  images = DEFAULT_IMAGES,
  decoCount = 36,
  decoRows = 36,
  decoWidth = "80%",
  decoLeft = "10%",
  decoBrightness = 0.6,
  decoRadius = 4,
  decoRotateFrom = -8,
  decoRotateTo = 5,
  decoOrigin = "800% 50%",
  bgColor = "#000",
  textColor = "#f0f0f0",
  cellsByEffect = DEFAULT_CELLS_BY_EFFECT,
  defaultCells = 6,
  fonts = DEFAULT_FONTS,
  sizes = DEFAULT_SIZES,
  colors = DEFAULT_COLORS,
  shadows = DEFAULT_SHADOWS,
  scrubStart = "top bottom",
  scrubEnd = "top top+=10%",
  smoothScroll = true,
  lenisLerp = 0.2,
  className = "",
}) {
  const rawId = useId();
  const uid = `st${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const rootRef = useRef(null);
  const decoRef = useRef(null);

  const resolved = useMemo(
    () =>
      blocks.map((block) => {
        if (block.type !== "sliced") return block;
        const cells =
          block.cells ||
          (block.effect != null ? cellsByEffect[block.effect] : null) ||
          defaultCells;
        return { ...block, cells };
      }),
    [blocks, cellsByEffect, defaultCells],
  );

  useEffect(() => {
    let cancelled = false;
    const listeners = [];
    let rafId;
    let ctx;

    const preload = (urls) =>
      Promise.all(
        urls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new window.Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = url;
            }),
        ),
      );

    const fontsReady = document.fonts
      ? document.fonts.ready
      : Promise.resolve();

    const libs = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      smoothScroll ? import("lenis") : Promise.resolve(null),
    ]);

    Promise.all([libs, preload(images), fontsReady])
      .then(([[gsapMod, stMod, lenisMod]]) => {
        if (cancelled) return;

        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const Lenis = lenisMod ? lenisMod.default || lenisMod.Lenis : null;
        const root = rootRef.current;
        if (!root) return;

        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {}, root);
        gsap.set(root, { autoAlpha: 1 });

        if (Lenis) {
          const lenis = new Lenis({
            lerp: lenisLerp,
            smoothWheel: true,
          });
          lenis.on("scroll", () => ScrollTrigger.update());
          const scrollFn = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(scrollFn);
          };
          rafId = requestAnimationFrame(scrollFn);
          listeners.push(() => lenis.destroy());
        }

        ctx.add(() => {
        const items = Array.from(root.querySelectorAll(`.${uid}-gtext`)).map(
          (el) => ({
            el,
            innerWrap: el.querySelectorAll(`.${uid}-box`),
            inner: el.querySelectorAll(`.${uid}-box-inner`),
            cells: Number(el.dataset.cells),
          }),
        );

        const measure = () => {
          items.forEach((item) => {
            if (!item.inner.length) return;
            const width = window.getComputedStyle(item.inner[0]).width;
            item.el.style.setProperty("--text-width", width);
            item.el.style.setProperty("--gsplits", item.cells);
            const offset = parseFloat(width) / item.cells;
            item.inner.forEach((inner, pos) => {
              gsap.set(inner, { left: offset * -pos });
            });
          });
        };

        measure();

        const onResize = () => {
          measure();
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", onResize);
        listeners.push(() => window.removeEventListener("resize", onResize));

        const trigger = (el, start = scrubStart, end = scrubEnd) => ({
          trigger: el,
          start,
          end,
          scrub: true,
        });

        const fanOut = (amount) => (pos, _, arr) =>
          pos < arr.length / 2
            ? -amount * pos - amount
            : amount * (pos - arr.length / 2) + amount;

        const centerOffset = (count, interval) => ((count - 1) * interval) / -2;

        const timelines = {
          1: (item) => {
            gsap.fromTo(
              item.inner,
              { xPercent: fanOut(13) },
              { ease: "power1", xPercent: 0, scrollTrigger: trigger(item.el) },
            );
          },
          2: (item) => {
            gsap
              .timeline({
                defaults: { ease: "power1" },
                scrollTrigger: trigger(item.el),
              })
              .fromTo(
                item.inner,
                { xPercent: (pos) => 30 * pos },
                { xPercent: 0 },
                0,
              )
              .fromTo(
                item.innerWrap,
                { xPercent: (pos) => 2 * (pos + 1) * 10 },
                { xPercent: 0 },
                0,
              );
          },
          3: (item) => {
            const interval = 100;
            const offset = centerOffset(item.innerWrap.length, interval);
            gsap
              .timeline({
                defaults: { ease: "power1" },
                scrollTrigger: trigger(item.el),
              })
              .fromTo(
                item.inner,
                {
                  xPercent: fanOut(30),
                  yPercent: (pos, _, arr) =>
                    pos < arr.length / 2
                      ? -15 * (arr.length / 2 - pos)
                      : -15 * (pos + 1 - arr.length / 2),
                },
                { xPercent: 0, yPercent: 0 },
                0,
              )
              .fromTo(
                item.innerWrap,
                {
                  xPercent: (pos) => pos * interval + offset,
                  rotationZ: (pos, _, arr) =>
                    pos < arr.length / 2
                      ? 5 * (arr.length / 2 - pos) + 5
                      : -5 * (pos - arr.length / 2) - 5,
                },
                { xPercent: 0, rotationZ: 0 },
                0,
              );
          },
          4: (item) => {
            const interval = 100;
            const offset = centerOffset(item.innerWrap.length, interval);
            gsap
              .timeline({
                defaults: { ease: "power1" },
                scrollTrigger: trigger(item.el, "top bottom+=30%"),
              })
              .fromTo(item.inner, { xPercent: fanOut(50) }, { xPercent: 0 }, 0)
              .fromTo(
                item.inner,
                { scaleX: 1.5, scaleY: 0, transformOrigin: "50% 0%" },
                { ease: "power2.inOut", scaleX: 1, scaleY: 1 },
                0,
              )
              .fromTo(
                item.innerWrap,
                { xPercent: (pos) => pos * interval + offset },
                { xPercent: 0, stagger: { amount: 0.07, from: "center" } },
                0,
              );
          },
          5: (item) => {
            gsap
              .timeline({
                defaults: { ease: "power1" },
                scrollTrigger: trigger(item.el),
              })
              .fromTo(
                item.inner,
                {
                  xPercent: fanOut(20),
                  yPercent: (pos) => (pos % 2 === 0 ? -40 : 40),
                },
                { xPercent: 0, yPercent: 0 },
                0,
              );
          },
          6: (item) => {
            gsap
              .timeline({
                scrollTrigger: trigger(item.el, scrubStart, "top top"),
              })
              .fromTo(
                item.inner,
                { xPercent: (pos, _, arr) => (arr.length - pos - 1) * -6 - 6 },
                { ease: "power1", xPercent: 0 },
                0,
              )
              .fromTo(
                item.innerWrap,
                { yPercent: (pos) => pos * 20 },
                { yPercent: 0 },
                0,
              );
          },
        };

        const fallback = (item) => {
          gsap.fromTo(
            item.inner,
            { xPercent: fanOut(10) },
            { ease: "power1", xPercent: 0, scrollTrigger: trigger(item.el) },
          );
        };

        items.forEach((item) => {
          const effect = item.el.dataset.effect;
          const fn = timelines[effect];
          if (fn) fn(item);
          else fallback(item);
        });

        if (decoRef.current) {
          Array.from(decoRef.current.children).forEach((tile) => {
            gsap.fromTo(
              tile,
              { transformOrigin: decoOrigin, rotationZ: decoRotateFrom },
              {
                ease: "power1",
                rotationZ: decoRotateTo,
                scrollTrigger: trigger(tile),
              },
            );
          });
        }

        });
        ScrollTrigger.refresh();
      })
      .catch((e) => console.error("[SlicedTextImage] load failed:", e.message));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      listeners.forEach((fn) => fn());
      if (ctx) ctx.revert();
    };
  }, [
    uid,
    resolved,
    images,
    decoOrigin,
    decoRotateFrom,
    decoRotateTo,
    scrubStart,
    scrubEnd,
    smoothScroll,
    lenisLerp,
  ]);

  const css = `
    .${uid}-gtext {
      --text-width: 100px;
      --gsplits: 4;
      --offset: calc(var(--text-width) / var(--gsplits));
      grid-template-columns: repeat(var(--gsplits), var(--offset));
    }
    .${uid}-deco {
      width: ${decoWidth};
      left: ${decoLeft};
      filter: brightness(${decoBrightness});
      grid-template-columns: repeat(3, auto);
      grid-template-rows: repeat(${decoRows}, 1fr);
    }
    .${uid}-deco > * {
      grid-column: 3 / span 1;
      max-width: 33vw;
      border-radius: ${decoRadius}px;
    }
    .${uid}-deco > *:nth-child(2n) { max-width: 18vw; grid-column: 1 / span 3; }
    .${uid}-deco > *:nth-child(3n) { max-width: 12vw; grid-column: 2 / span 2; }
    @media screen and (min-width: 53em) {
      .${uid}-deco { grid-template-columns: repeat(5, auto); }
      .${uid}-deco > * { grid-column: 5 / span 1; max-width: 20vw; }
      .${uid}-deco > *:nth-child(2n) { max-width: 18vw; grid-column: 1 / span 5; }
      .${uid}-deco > *:nth-child(3n) { max-width: 7vw; grid-column: 4 / span 2; }
      .${uid}-deco > *:nth-child(4n) { grid-column: 3 / span 3; }
      .${uid}-deco > *:nth-child(5n) { max-width: 10vw; grid-column: 2 / span 4; }
    }
  `;

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden invisible opacity-0 [font-size:14px] px-4 py-4 md:px-12 md:py-8 ${className}`}
      style={{ color: textColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: bgColor }}
      />

      <div
        ref={decoRef}
        className={`${uid}-deco absolute top-0 grid h-full z-[1] pointer-events-none`}
      >
        {Array.from({ length: decoCount }).map((_, i) => (
          <div
            key={i}
            className="w-auto bg-cover bg-center aspect-[2/3]"
            style={{ backgroundImage: `url(${images[i % images.length]})` }}
          />
        ))}
      </div>

      {resolved.map((block, bi) => {
        if (block.type === "paragraph") {
          return (
            <div key={bi} className="grid">
              <p className="justify-self-start mb-[20vh] font-semibold opacity-50 leading-relaxed">
                {block.lines.map((line, li) => (
                  <span key={li} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          );
        }

        const wrapperClass = block.full
          ? "grid min-h-screen place-items-center"
          : "grid";

        const headingClass = [
          `${uid}-gtext`,
          "grid m-0 font-normal leading-none whitespace-nowrap justify-center",
          block.align === "end" ? "justify-center justify-self-end" : "",
          block.spaced ? "my-[20vh] mx-auto" : "",
          block.uppercase ? "uppercase" : "",
          block.lowercase ? "lowercase" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={bi} className={wrapperClass}>
            <h2
              data-effect={block.effect ?? ""}
              data-cells={block.cells}
              className={headingClass}
              style={{
                fontSize: sizes[block.size] || sizes.s,
                fontFamily: fonts[block.font] || fonts[0],
                color: colors[block.color] || colors.default,
                textShadow: shadows[block.shadow] || shadows.none,
                mixBlendMode: block.blend || "normal",
              }}
            >
              {Array.from({ length: block.cells }).map((_, ci) => (
                <span
                  key={ci}
                  className={`${uid}-box relative overflow-hidden -mr-[0.5px] [will-change:transform]`}
                >
                  <span
                    className={`${uid}-box-inner relative block w-max [will-change:transform]`}
                  >
                    {block.text}
                  </span>
                </span>
              ))}
            </h2>
          </div>
        );
      })}
    </div>
  );
}
