"use client";

import { useEffect, useRef } from "react";

const pexels = (id, w) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const DEFAULT_ITEMS = [
  {
    backgroundImage: pexels(12807445, 1600),
    images: [461284, 2566847, 12357276, 7958431].map((id) => pexels(id, 900)),
    titleTop: "Poppy",
    titleBottom: "RED",
    accentClass: "text-rose-300",
    centerWrapper: false,
  },
  {
    backgroundImage: pexels(1878095, 1600),
    images: [4242688, 248158, 12652584, 17285752].map((id) => pexels(id, 900)),
    titleTop: "Lavender",
    titleBottom: "VIOLET",
    accentClass: "text-violet-300",
    centerWrapper: true,
  },
  {
    backgroundImage: pexels(1169084, 1600),
    images: [5022309, 19672919, 1366630, 17745162].map((id) => pexels(id, 900)),
    titleTop: "Sunflower",
    titleBottom: "YELLOW",
    accentClass: "text-yellow-200",
    centerWrapper: true,
  },
];

const ENTRY = [
  { even: { y: "175vh", rotateZ: -5, z: 3 }, odd: { y: "-120vh", rotateZ: 5, z: 1 } },
  { even: { y: "-225vh", rotateZ: 5, z: 1 }, odd: { y: "300vh", rotateZ: -5, z: 3 } },
  { even: { y: "300vh", rotateZ: 5, z: 3 }, odd: { y: "-120vh", rotateZ: 5, z: 3 } },
  { even: { y: "-100vh", rotateZ: -5, z: 1 }, odd: { y: "175vh", rotateZ: -5, z: 1 } },
];

const entryPosition = (index, imageIndex) => {
  const { y, rotateZ, z } = ENTRY[imageIndex][index % 2 === 0 ? "even" : "odd"];
  return { from: { scale: 0.8, y, rotateZ }, z };
};

const restPosition = (index, imageIndex) => {
  const up = (index % 2 === 0) === (imageIndex % 2 === 0);
  return { scale: 1, y: up ? "2vh" : "-2vh", rotateZ: up ? 2.5 : -2.5 };
};

export default function ScrollColorGallery({
  items = DEFAULT_ITEMS,
  heroImage = pexels(9649050, 1920),
  heroLineTop = "Three",
  heroLineCenter = "COLORS",
  heroLineBottom = "in bloom",
  heroAccentClass = "text-white/60",
  footerImage = pexels(29837792, 1920),
  footerLineTop = "Until",
  footerLineCenter = "NEXT",
  footerLineBottom = "season",
  footerAccentClass = "text-white/60",
  backgroundColor = "bg-black",
  textColor = "text-white",
  frameColor = "bg-white/75",
  fontFamily = "Instrument Serif",
  fontUrlRegular = "https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-normal.woff2",
  fontUrlItalic = "https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-italic.woff2",
  imageWidthVw = 25,
  stackWidthVw = 21,
  lenisLerp = 0.05,
  lenisWheelMultiplier = 0.7,
  className = "",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let ctx;
    let lenis;
    let tick;
    let gsapRef;

    const run = async () => {
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod.default || lenisMod.Lenis;
      gsapRef = gsap;
      const root = rootRef.current;
      if (!root) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (Lenis && !reduceMotion) {
        lenis = new Lenis({
          lerp: lenisLerp,
          wheelMultiplier: lenisWheelMultiplier,
        });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      ctx = gsap.context(() => {
        const ghosts = gsap.utils.toArray("[data-ghost]");
        const panels = gsap.utils.toArray("[data-item]");

        panels.forEach((item, index) => {
          const isLast = index === panels.length - 1;
          const lines = item.querySelectorAll("[data-line]");
          const background = item.querySelector("[data-bg]");
          const dim = item.querySelector("[data-dim]");
          const container = item.querySelector("[data-container]");
          const overlay = item.querySelector("[data-overlay]");
          const frames = gsap.utils.toArray(item.querySelectorAll("[data-frame]"));

          gsap.set(background, { scale: 1.2 });
          gsap.set(container, { xPercent: 40 });
          gsap.set(lines, { zIndex: 2, opacity: 0.9 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ghosts[index],
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
              onToggle: (self) =>
                gsap.set(item, {
                  visibility: self.isActive ? "visible" : "hidden",
                }),
            },
          });

          tl.to(item, { clipPath: "inset(0 0 0 0%)", duration: 200 }, 0)
            .to(container, { xPercent: 0, duration: 200 }, 0)
            .to(background, { scale: 1, duration: 200 }, 0);

          [0, 1].forEach((i) => {
            tl.fromTo(
              lines[i],
              { opacity: i === 0 ? 0.95 : 0.5, yPercent: i === 0 ? 125 : -125 },
              { opacity: 0.9, yPercent: 0, ease: "power2.inOut", duration: 120 },
              25,
            );
          });

          frames.forEach((frame, imageIndex) => {
            const { from, z } = entryPosition(index, imageIndex);
            gsap.set(frame, { zIndex: z });
            tl.fromTo(
              frame,
              from,
              { ...restPosition(index, imageIndex), duration: 135 },
              115,
            );
          });

          tl.to(dim, { opacity: 0.8, duration: 105 }, 160)
            .to(
              item,
              {
                xPercent: isLast ? 0 : -40,
                yPercent: isLast ? -40 : 0,
                duration: 100,
              },
              300,
            )
            .to(overlay, { opacity: 0.85, duration: 100 }, 300);
        });
      }, root);

      ScrollTrigger.refresh();
    };

    run().catch((e) =>
      console.error("[ScrollColorGallery] Setup failed:", e.message),
    );

    return () => {
      cancelled = true;
      if (gsapRef && tick) {
        gsapRef.ticker.remove(tick);
        gsapRef.ticker.lagSmoothing(500, 33);
      }
      if (lenis) lenis.destroy();
      if (ctx) ctx.revert();
    };
  }, [lenisLerp, lenisWheelMultiplier]);

  const fontCss =
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrlRegular +
    '") format("woff2");font-weight:400;font-style:normal;font-display:swap;}' +
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrlItalic +
    '") format("woff2");font-weight:400;font-style:italic;font-display:swap;}';

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-x-clip antialiased ${backgroundColor} ${textColor} ${className}`}
      style={{ fontFamily: `"${fontFamily}", serif` }}
    >
      <style>{fontCss}</style>

      <section className="sticky top-0 bg-black">
        <div className="relative flex h-screen w-full items-end">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="relative flex h-screen w-full flex-col justify-between px-[3.5vw] py-20 text-[12vw] leading-none tracking-[0.02em] max-[479px]:gap-8">
            <div className="italic">{heroLineTop}</div>
            <div className={`text-center uppercase ${heroAccentClass}`}>
              {heroLineCenter}
            </div>
            <div className="text-right italic">{heroLineBottom}</div>
          </div>
        </div>
      </section>

      <section className="relative z-10">
        {items.map((item, index) => (
          <div
            key={index}
            data-item
            className="invisible fixed inset-x-0 top-0 h-screen w-full overflow-hidden bg-black [clip-path:inset(0_0%_0_100%)]"
          >
            <div data-bg className="absolute inset-0 will-change-transform">
              <img
                src={item.backgroundImage}
                alt=""
                aria-hidden="true"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              data-dim
              aria-hidden="true"
              className="absolute inset-0 bg-black opacity-0"
            />

            <div
              data-container
              className="relative flex h-full w-full flex-col px-[4vw] pb-10 pt-20"
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  "--stack": `${stackWidthVw}vw`,
                  "--frame": `${imageWidthVw}vw`,
                }}
              >
                {item.images.map((src, imageIndex) => (
                  <div
                    key={imageIndex}
                    data-frame
                    className="relative h-full w-[var(--stack)] will-change-transform max-[767px]:w-[15vw]"
                  >
                    <div
                      className={`absolute left-1/2 top-1/2 aspect-[4/5] w-[var(--frame)] -translate-x-1/2 -translate-y-1/2 p-1.5 ${frameColor}`}
                    >
                      <img
                        src={src}
                        alt=""
                        aria-hidden="true"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative flex w-full flex-1 items-stretch">
                <div
                  className={`relative mx-auto flex h-full flex-1 flex-col justify-between text-[12.5vw] leading-none tracking-[0.02em] max-[479px]:gap-8 ${item.centerWrapper ? "text-center" : ""
                    }`}
                >
                  <div className="overflow-hidden">
                    <div
                      data-line
                      className={`relative italic ${item.centerWrapper ? "text-left" : ""
                        }`}
                    >
                      {item.titleTop}
                    </div>
                  </div>
                  <div className="overflow-hidden text-right">
                    <div data-line className="relative uppercase">
                      <span className={item.accentClass}>
                        {item.titleBottom}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-overlay
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[99] bg-black opacity-0"
            />
          </div>
        ))}

        <div>
          {items.map((_, index) => (
            <div key={index} data-ghost className="h-[300vh] w-full" />
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-black">
        <div className="relative flex h-screen w-full items-end">
          <img
            src={footerImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="relative flex h-full w-full flex-col justify-between px-[3.5vw] py-20 text-[11.5vw] leading-none tracking-[0.02em] max-[479px]:gap-8">
            <div className={`uppercase ${footerAccentClass}`}>
              {footerLineTop}
            </div>
            <div className="text-center italic">{footerLineCenter}</div>
            <div className={`text-right uppercase ${footerAccentClass}`}>
              {footerLineBottom}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}