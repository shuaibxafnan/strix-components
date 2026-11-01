"use client";

import { useEffect, useRef } from "react";

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

const CELLS = [
  [1, 4],
  [1, 1],
  [2, 8],
  [2, 5],
  [3, 3],
  [3, 1],
  [4, 2],
  [4, 5],
  [5, 6],
  [5, 8],
  [6, 2],
  [7, 3],
  [8, 7],
  [8, 2],
  [9, 1],
  [9, 6],
  [10, 4],
  [11, 2],
  [11, 4],
  [12, 6],
  [13, 3],
  [14, 5],
  [15, 1],
  [16, 2],
  [16, 7],
  [17, 8],
  [18, 3],
  [19, 5],
  [20, 4],
  [21, 2],
  [22, 7],
  [23, 1],
  [24, 5],
  [25, 4],
  [26, 2],
  [27, 3],
  [28, 6],
  [29, 5],
  [30, 4],
  [31, 1],
  [32, 6],
  [33, 3],
  [34, 5],
  [35, 1],
  [36, 8],
  [37, 6],
  [38, 3],
  [39, 5],
  [40, 4],
];

const DEFAULT_ITEMS = CELLS.map((cell, i) => ({
  image: IMAGES[i % IMAGES.length],
  row: cell[0],
  col: cell[1],
}));

export default function ScrollDriftImageGrid({
  items = DEFAULT_ITEMS,
  columns = 8,
  bgColor = "#606c62",
  textColor = "#000000",
  footerBg = "#dadada",
  footerText = "#111111",
  imageContrast = 100,
  coverTitle = "Thomas Vance",
  coverMark = "®",
  coverSubtitle = "並外れたファッション",
  footerBody = "From the dawn of civilisation onwards crowds have always undergone the influence of illusions. It is to the creators of illusions that they have raised more temples, statues, and altars than to any other class of men.",
  coverTitleSize = "8vw",
  scrubEase = "none",
  rotateFrom = -30,
  rotateTo = 30,
  originX = "300%",
  originY = "50%",
  driftRange = 200,
  swayStart = "top bottom",
  swayEnd = "bottom top",
  driftStart = "top bottom",
  driftEnd = "top top",
  smoothScroll = true,
  lerp = 0.1,
  className = "",
}) {
  const gridRef = useRef(null);

  useEffect(() => {
    let killed = false;
    const cleanups = [];

    (async () => {
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        smoothScroll ? import("lenis") : Promise.resolve(null),
      ]);
      if (killed || !gridRef.current) return;
      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      if (lenisMod) {
        const Lenis = lenisMod.default || lenisMod.Lenis;
        const lenis = new Lenis({ lerp: lerp, smooth: true });
        let rafId;
        const raf = (time) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
        lenis.on("scroll", ScrollTrigger.update);
        cleanups.push(() => {
          cancelAnimationFrame(rafId);
          lenis.destroy();
        });
      }

      const gridItems = Array.prototype.slice.call(
        gridRef.current.querySelectorAll(".gssd-item"),
      );

      const triggers = [];
      gridItems.forEach((item) => {
        const image = item.querySelector(".gssd-img");
        const drift = gsap.utils.random(-driftRange, driftRange);
        const tl = gsap
          .timeline()
          .addLabel("start", 0)
          .set(image, { transformOrigin: originX + " " + originY }, "start")
          .to(
            image,
            {
              ease: scrubEase,
              startAt: { rotationZ: rotateFrom },
              rotationZ: rotateTo,
              scrollTrigger: {
                trigger: item,
                start: swayStart,
                end: swayEnd,
                scrub: true,
              },
            },
            "start",
          )
          .to(
            item,
            {
              ease: scrubEase,
              yPercent: drift,
              scrollTrigger: {
                trigger: item,
                start: driftStart,
                end: driftEnd,
                scrub: true,
              },
            },
            "start",
          );
        triggers.push(tl);
      });

      cleanups.push(() => {
        triggers.forEach((tl) => {
          tl.getChildren().forEach((child) => {
            if (child.scrollTrigger) child.scrollTrigger.kill();
          });
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.kill();
        });
      });
    })();

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    items,
    smoothScroll,
    lerp,
    scrubEase,
    rotateFrom,
    rotateTo,
    originX,
    originY,
    driftRange,
    swayStart,
    swayEnd,
    driftStart,
    driftEnd,
  ]);

  return (
    <div
      className={"relative w-full overflow-x-hidden uppercase antialiased [font-family:ui-sans-serif,system-ui,sans-serif] text-[18px] " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="relative">
        <div
          ref={gridRef}
          className="relative grid w-full"
          style={{ gridTemplateColumns: "repeat(" + columns + ",1fr)" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="gssd-item relative [will-change:transform]"
              style={{ gridColumn: item.col, gridRow: item.row }}
            >
              <div
                className="gssd-img relative h-auto w-full bg-cover bg-center bg-no-repeat [aspect-ratio:1] [will-change:transform,opacity]"
                style={{
                  backgroundImage: "url(" + item.image + ")",
                  filter: "contrast(" + imageContrast + "%)",
                }}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none fixed top-0 left-0 flex h-screen w-full flex-col items-center justify-center">
          <h2
            className="m-0 font-semibold"
            style={{ fontSize: coverTitleSize }}
          >
            {coverTitle}
            <sup
              className="font-bold [vertical-align:75%]"
              style={{ fontSize: "calc(" + coverTitleSize + " / 2)" }}
            >
              {coverMark}
            </sup>
          </h2>
          <h3 className="m-0 text-[1.5rem] font-normal">{coverSubtitle}</h3>
        </div>

        <div
          className="relative z-[200] flex h-screen items-center justify-center text-[5vh] leading-[1.2] normal-case"
          style={{ backgroundColor: footerBg, color: footerText }}
        >
          <p className="max-w-[40ch] px-6">{footerBody}</p>
        </div>
      </div>
    </div>
  );
}
