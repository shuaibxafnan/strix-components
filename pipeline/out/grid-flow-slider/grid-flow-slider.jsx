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

const DEFAULT_LAYOUTS = [
  [
    [1, 1],
    [2, 3],
    [1, 4],
    [3, 4],
    [3, 6],
    [1, 7],
    [1, 8],
    [3, 10],
    [2, 5],
    [4, 9],
    [3, 7],
    [4, 4],
  ],
  [
    [2, 1],
    [2, 3],
    [1, 4],
    [3, 4],
    [3, 6],
    [1, 7],
    [2, 8],
    [3, 10],
    [2, 5],
    [4, 9],
    [4, 7],
    [4, 4],
  ],
  [
    [1, 1],
    [2, 2],
    [1, 5],
    [2, 4],
    [3, 6],
    [1, 7],
    [1, 8],
    [3, 10],
    [2, 5],
    [4, 9],
    [4, 7],
    [3, 4],
  ],
  [
    [1, 1],
    [2, 3],
    [1, 4],
    [3, 2],
    [4, 6],
    [2, 7],
    [2, 10],
    [3, 10],
    [2, 5],
    [4, 9],
    [3, 7],
    [4, 4],
  ],
];

export default function GridFlowSlider({
  images = DEFAULT_IMAGES,
  galleryCount = 4,
  itemsPerGallery = 12,
  layouts = DEFAULT_LAYOUTS,
  className = "",
  bgColor = "#000",
  pagePadding = "1.5rem",
  gridColumns = 10,
  gridRows = 4,
  mobileColumns = 3,
  breakpoint = "53em",
  duration = 1.7,
  itemDelay = 0.08,
  navDurationScale = 0.6,
  innerScale = 1.6,
  loaderRate = 500,
  progressColor = "#fff",
  progressSize = "clamp(2rem, 8vw, 6rem)",
  showProgress = true,
  arrowColor = "#fff",
  arrowWidth = 1.5,
  arrowSlot = 40,
  thumbWidth = 75,
  thumbHeight = 95,
  railGap = 10,
  hoverEnabled = true,
  hoverScale = 1.2,
  hoverContrast = 120,
  hoverBrightness = 800,
  hoverHueRotate = 180,
  hoverDuration = 0.8,
  spinOnNavigate = true,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `gf-${uid}`;

  const rootRef = useRef(null);
  const progressRef = useRef(null);
  const progressTextRef = useRef(null);
  const loaderImgRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const prevArrowRef = useRef(null);
  const nextArrowRef = useRef(null);
  const galleryRefs = useRef([]);

  const galleries = useMemo(() => {
    let n = 0;
    return Array.from({ length: galleryCount }, (_, g) =>
      Array.from({ length: itemsPerGallery }, (_, i) => {
        const layout = layouts[g % layouts.length];
        const cell = layout[i % layout.length];
        return { src: images[n++ % images.length], row: cell[0], col: cell[1] };
      }),
    );
  }, [images, galleryCount, itemsPerGallery, layouts]);

  const css = `
.${scope} .gf-item {
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background-position: 50% 50%;
  background-size: cover;
  will-change: transform;
}
.${scope} .gf-inner {
  width: 100%;
  height: 100%;
  background-position: 50% 50%;
  background-size: cover;
  background-repeat: no-repeat;
  transform: scale(${innerScale});
  will-change: transform;
}
.${scope} .gf-loader-img .gf-item { grid-area: 1 / 1 / 2 / 2; }
.${scope} .gf-rail .gf-item { grid-area: img; }
.${scope} .gf-rail {
  display: grid;
  gap: ${railGap}px;
  grid-template-rows: ${thumbHeight}px;
  pointer-events: auto;
  cursor: pointer;
  align-self: end;
}
.${scope} .gf-rail-prev {
  grid-template-areas: 'img arrow';
  grid-template-columns: ${thumbWidth}px ${arrowSlot}px;
}
.${scope} .gf-rail-next {
  grid-template-areas: 'arrow img';
  grid-template-columns: ${arrowSlot}px ${thumbWidth}px;
}
.${scope} .gf-arrow { grid-area: arrow; }
.${scope} .gf-gallery {
  display: grid;
  grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr));
  gap: 2vw;
  width: 100%;
  height: calc(100% - 120px);
  justify-items: center;
  align-self: end;
}
@media screen and (min-width: ${breakpoint}) {
  .${scope} .gf-gallery {
    height: 100%;
    align-self: stretch;
    gap: ${pagePadding};
    grid-template-columns: repeat(${gridColumns}, minmax(0, 1fr));
    grid-template-rows: repeat(${gridRows}, minmax(0, 1fr));
  }
  .${scope} .gf-gallery .gf-item { grid-area: var(--row) / var(--col); }
  .${scope} .gf-rail-next { align-self: start; }
}
`;

  useEffect(() => {
    let killed = false;
    const cleanups = [];

    const boot = async () => {
      const [gsapMod, flipMod, ilMod] = await Promise.all([
        import("gsap"),
        import("gsap/Flip"),
        import("imagesloaded"),
      ]);
      if (killed || !rootRef.current) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const Flip = flipMod.Flip || flipMod.default;
      const imagesLoaded = ilMod.default || ilMod;
      gsap.registerPlugin(Flip);
      gsap.config({ trialWarn: false });

      const winsize = { width: window.innerWidth, height: window.innerHeight };

      const galleryEls = galleryRefs.current.filter(Boolean);
      const total = galleryEls.length;
      if (!total) return;

      const galleriesArr = galleryEls.map((el) => ({
        el,
        items: [...el.querySelectorAll(".gf-item")],
        isCurrent: false,
      }));

      const showGallery = (g, on) => {
        g.el.style.opacity = on ? "1" : "0";
        g.el.style.pointerEvents = on ? "auto" : "none";
        g.isCurrent = on;
      };

      let current = 0;
      let isAnimating = false;

      const nav = {
        prev: { el: prevRef.current, arrow: prevArrowRef.current, items: [] },
        next: { el: nextRef.current, arrow: nextArrowRef.current, items: [] },
      };

      const addToNav = (action, items) => {
        const list = Array.isArray(items) ? items : [items];
        nav[action].el.append(...list);
        nav[action].items.push(...list);
      };

      const loaderItems = galleriesArr[1 % total].items;
      loaderImgRef.current.append(...loaderItems);

      const loadAssets = () =>
        new Promise((resolve) => {
          const imgLoad = imagesLoaded(
            rootRef.current.querySelectorAll(".gf-inner"),
            { background: true },
          );
          let allLoaded = false;
          let animDone = false;
          let progress = 0;
          const rate = 100 / loaderRate;

          const id = setInterval(() => {
            if (progress < 100) {
              progress += rate;
              if (progressTextRef.current)
                progressTextRef.current.innerText = String(
                  Math.round(progress),
                );
            } else if (allLoaded && animDone) {
              clearInterval(id);
              gsap.to(progressRef.current, { duration: 0.5, opacity: 0 });
              resolve();
            }
          }, 1);
          cleanups.push(() => clearInterval(id));

          gsap.timeline().fromTo(
            loaderItems,
            { scale: 0, opacity: 0 },
            {
              duration: 0.4,
              scale: 1,
              opacity: 1,
              stagger: 2 / loaderItems.length,
              ease: "power4",
              onComplete: () => (animDone = true),
            },
          );

          imgLoad.on("always", () => (allLoaded = true));
          imgLoad.on("fail", () => (allLoaded = true));
        });

      const setupGalleryAnimation = () => {
        if (killed) return;
        isAnimating = true;

        const tl = gsap.timeline({ onComplete: () => (isAnimating = false) });

        loaderItems.forEach((item, pos) => {
          const inner = item.querySelector(".gf-inner");
          const scaleFactor =
            winsize.height / (item.offsetHeight || thumbHeight);
          const state = Flip.getState(item, { simple: true });

          const child = gsap
            .timeline()
            .add(() => {
              addToNav("next", item);
              Flip.from(state, { duration, ease: "power4.inOut" });
            })
            .to(
              item,
              {
                duration: duration / 2,
                ease: "power4.in",
                scale: scaleFactor / 2,
              },
              0,
            )
            .to(
              inner,
              { duration: duration / 2, ease: "power4.in", scale: 4 },
              0,
            )
            .to(item, { duration: duration / 2, ease: "power4", scale: 1 })
            .to(
              inner,
              { duration: duration / 2, ease: "power4", scale: innerScale },
              "<",
            );

          tl.add(child, pos * itemDelay);
        });

        tl.addLabel(
          "afterIntro",
          loaderItems.length * itemDelay + duration * 0.3,
        )
          .fromTo(
            [nav.next.arrow, nav.prev.arrow],
            { transformOrigin: (i) => (i ? "100% 0%" : "0% 100%"), scale: 0 },
            { duration: 1, ease: "power4", scale: 1, opacity: 1 },
            "afterIntro",
          )
          .add(
            () => addToNav("prev", galleriesArr[total - 1].items),
            "afterIntro",
          )
          .fromTo(
            galleriesArr[total - 1].items,
            { scale: 0, opacity: 0 },
            {
              duration: 0.3,
              ease: "power4",
              stagger: { amount: Math.max(duration - 0.8, 0.1) },
              scale: 1,
              opacity: 1,
            },
            "afterIntro",
          )
          .add(
            () => showGallery(galleriesArr[current], true),
            "afterIntro-=0.8",
          )
          .fromTo(
            galleriesArr[current].items,
            { opacity: 0, scale: 0 },
            {
              duration,
              ease: "power4.inOut",
              stagger: { each: itemDelay / 2, from: "random" },
              opacity: 1,
              scale: 1,
            },
            "afterIntro-=0.8",
          );
      };

      const navigate = (direction) => {
        if (isAnimating) return;
        isAnimating = true;

        const currentItems = galleriesArr[current].items;
        const other = direction === "next" ? "prev" : "next";

        const next = current < total - 1 ? current + 1 : total - 1;
        const prev = current > 0 ? current - 1 : total - 1;

        let newcurrent, newnext, newprev;
        if (direction === "next") {
          newcurrent = current < total - 1 ? current + 1 : 0;
          newnext = newcurrent < total - 1 ? newcurrent + 1 : 0;
          newprev = current;
        } else {
          newcurrent = current > 0 ? current - 1 : total - 1;
          newprev = newcurrent > 0 ? newcurrent - 1 : total - 1;
          newnext = current;
        }

        const upcomingItems = galleriesArr[newcurrent].items;
        const navDur = duration * navDurationScale;

        gsap
          .timeline({
            onComplete: () => {
              current = newcurrent;
              isAnimating = false;
            },
          })
          .to(
            nav[other].items,
            {
              duration: 0.2,
              ease: "power2.in",
              scale: 0,
              opacity: 0,
              onComplete: () => {
                gsap.set(nav[other].items, { scale: 1, opacity: 1 });
                galleryEls[direction === "next" ? prev : next].append(
                  ...nav[other].items,
                );
              },
            },
            0,
          )
          .add(() => {
            const flipCurrent = Flip.getState(currentItems, { simple: true });
            const flipUpcoming = Flip.getState(upcomingItems, { simple: true });

            nav[other].items = [];
            addToNav(other, currentItems);

            Flip.from(flipCurrent, {
              duration: navDur,
              ease: "power4",
              absolute: true,
              stagger: {
                each: itemDelay / 2,
                from: direction === "next" ? "start" : "end",
              },
            });

            showGallery(galleriesArr[newcurrent], true);
            showGallery(galleriesArr[current], false);

            galleryEls[newcurrent].append(...upcomingItems);

            nav[direction].items = [];
            addToNav(
              direction,
              galleriesArr[direction === "next" ? newnext : newprev].items,
            );

            Flip.from(flipUpcoming, {
              delay: 0.15,
              absolute: true,
              spin: spinOnNavigate,
              duration: navDur,
              ease: "power4",
              stagger: { each: itemDelay / 2, from: "end" },
            });
          })
          .to(
            [nav.next.arrow, nav.prev.arrow],
            { duration: 0.2, ease: "power1.in", scale: 0, opacity: 0 },
            0,
          )
          .addLabel(
            "afterNav",
            (currentItems.length * itemDelay) / 2 + duration * 0.15,
          )
          .fromTo(
            galleriesArr[direction === "next" ? newnext : newprev].items,
            { scale: 0, opacity: 0 },
            {
              duration: 0.3,
              ease: "power4",
              stagger: { amount: Math.max(navDur - 0.6, 0.1) },
              scale: 1,
              opacity: 1,
            },
            "afterNav",
          )
          .to(
            [nav.next.arrow, nav.prev.arrow],
            { duration: 1, ease: "power4", scale: 1, opacity: 1 },
            "afterNav",
          );
      };

      const onNext = () => navigate("next");
      const onPrev = () => navigate("prev");
      nav.next.el.addEventListener("click", onNext);
      nav.prev.el.addEventListener("click", onPrev);
      cleanups.push(() => {
        nav.next.el.removeEventListener("click", onNext);
        nav.prev.el.removeEventListener("click", onPrev);
      });

      if (hoverEnabled) {
        galleriesArr.forEach((gallery) => {
          gallery.items.forEach((item) => {
            const inner = item.querySelector(".gf-inner");

            const enter = () => {
              if (!gallery.isCurrent || isAnimating) return;
              gsap.killTweensOf([item, inner]);
              gsap
                .timeline({
                  defaults: { duration: hoverDuration, ease: "power4" },
                })
                .fromTo(
                  item,
                  {
                    filter: "contrast(100%) brightness(100%) hue-rotate(0deg)",
                  },
                  {
                    filter: `contrast(${hoverContrast}%) brightness(${hoverBrightness}%) hue-rotate(${hoverHueRotate}deg)`,
                    scale: hoverScale,
                  },
                  0,
                )
                .to(inner, { scale: 1 }, 0);
            };

            const leave = () => {
              if (!gallery.isCurrent || isAnimating) return;
              gsap.killTweensOf([item, inner]);
              gsap
                .timeline({ defaults: { duration: 0.5, ease: "power4" } })
                .to(
                  item,
                  {
                    scale: 1,
                    filter: "contrast(100%) brightness(100%) hue-rotate(0deg)",
                  },
                  0,
                )
                .to(inner, { scale: innerScale }, 0);
            };

            item.addEventListener("mouseenter", enter);
            item.addEventListener("mouseleave", leave);
            cleanups.push(() => {
              item.removeEventListener("mouseenter", enter);
              item.removeEventListener("mouseleave", leave);
            });
          });
        });
      }

      await new Promise((resolve) =>
        imagesLoaded(loaderItems, { background: true }, resolve),
      );
      if (killed) return;
      await loadAssets();
      if (killed) return;
      setupGalleryAnimation();
    };

    boot().catch(() => {});

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${scope} relative w-full h-screen overflow-hidden select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        className="absolute inset-0 z-[100] grid content-end gap-8 overflow-hidden pointer-events-none"
        style={{
          padding: pagePadding,
          gridTemplateColumns: `${thumbWidth}px 1fr`,
        }}
      >
        <div
          ref={loaderImgRef}
          className="gf-loader-img relative grid place-items-center"
          style={{ width: thumbWidth, height: thumbHeight }}
        />
        <div
          ref={progressRef}
          className="relative flex self-center leading-none pb-[0.2em]"
          style={{
            color: progressColor,
            fontSize: progressSize,
            visibility: showProgress ? "visible" : "hidden",
          }}
        >
          <span ref={progressTextRef}>0</span>
          <span>%</span>
        </div>
      </div>

      <nav
        className="absolute inset-0 z-50 grid justify-between pointer-events-none"
        style={{ padding: pagePadding, gridTemplateColumns: "auto auto" }}
      >
        <div ref={prevRef} className="gf-rail gf-rail-prev">
          <svg
            ref={prevArrowRef}
            className="gf-arrow relative opacity-0"
            style={{
              fill: "none",
              stroke: arrowColor,
              strokeWidth: arrowWidth,
            }}
            width="37"
            height="94"
            viewBox="0 0 37 94"
          >
            <path
              vectorEffect="non-scaling-stroke"
              d="M35.95.01 1.348 92.657l7.168-4.646"
            />
          </svg>
        </div>

        <div ref={nextRef} className="gf-rail gf-rail-next">
          <svg
            ref={nextArrowRef}
            className="gf-arrow relative opacity-0"
            style={{
              fill: "none",
              stroke: arrowColor,
              strokeWidth: arrowWidth,
            }}
            width="37"
            height="94"
            viewBox="0 0 37 94"
          >
            <path
              vectorEffect="non-scaling-stroke"
              d="M1.348 93.657 35.95 1.01l-7.168 4.646"
            />
          </svg>
        </div>
      </nav>

      {galleries.map((items, g) => (
        <div
          key={`${uid}-g${g}`}
          ref={(el) => (galleryRefs.current[g] = el)}
          className="gf-gallery absolute inset-0 opacity-0 pointer-events-none"
          style={{ padding: pagePadding }}
        >
          {items.map((item, i) => (
            <div
              key={`${uid}-g${g}-i${i}`}
              className="gf-item"
              style={{ "--row": item.row, "--col": item.col }}
            >
              <div
                className="gf-inner"
                style={{ backgroundImage: `url(${item.src})` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
