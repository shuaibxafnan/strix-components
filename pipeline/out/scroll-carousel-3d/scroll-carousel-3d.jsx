"use client";

import { useEffect, useId, useRef } from "react";

const FASHION_IMAGES = [
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

const cycled = (arr, count, offset = 0) =>
  Array.from({ length: count }, (_, i) => arr[(offset + i) % arr.length]);

const DEFAULT_SCENES = [
  {
    title: "Haute Couture Nights — Paris",
    images: cycled(FASHION_IMAGES, 4, 0),
  },
  {
    title: "Vogue Evolution — New York City",
    images: cycled(FASHION_IMAGES, 4, 4),
  },
  {
    title: "Glamour in the Desert — Dubai",
    images: cycled(FASHION_IMAGES, 4, 8),
  },
  {
    title: "Chic Couture Runway — Milan",
    images: cycled(FASHION_IMAGES, 4, 12),
  },
  {
    title: "Style Showcase — London",
    images: cycled(FASHION_IMAGES, 6, 16),
    radius: 650,
  },
  {
    title: "Future Fashion Forward — Tokyo",
    images: cycled(FASHION_IMAGES, 4, 22),
  },
];

const DEFAULT_PREVIEW_NAMES = [
  "Kai Vega",
  "Riven Juno",
  "Lex Orion",
  "Ash Kairos",
  "Juno Sol",
  "Soren Nyx",
  "Quinn Axon",
  "Zara Voss",
  "Hale B.",
  "Gundra Wex",
  "Arlo Quinn",
  "Vera Kline",
  "Juno Vale",
  "Ember Dash",
  "Rylee Voss",
  "Harlow Nova",
  "Blake Lune",
  "Zephyr Kade",
  "Indigo Rae",
  "Kairo Jett",
  "Luca Raine",
  "Rory Vale",
  "Sable Zev",
  "Ellis Nova",
];

export default function ScrollCarousel3D({
  scenes = DEFAULT_SCENES,
  previewNames = DEFAULT_PREVIEW_NAMES,
  bgColor = "#0f0e0e",
  textColor = "#fff",
  accentColor = "rgba(255,255,255,0.6)",
  cardAspect = "4/5",
  cardRadius = "4px",
  carouselWidth = 400,
  carouselHeight = 500,
  previewColumnsDesktop = 6,
  previewColumnsMobile = 3,
  smoothness = 1,
  closeLabel = "Close ×",
  className = "",
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    if (!scenes.length) return;

    let cancelled = false;
    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/ScrollSmoother"),
      import("gsap/ScrollToPlugin"),
      import("gsap/SplitText"),
    ])
      .then(([g, st, ss, sp, sx]) => {
        if (cancelled) return;
        const gsap = g.gsap || g.default;
        const ScrollTrigger = st.ScrollTrigger || st.default;
        const ScrollSmoother = ss.ScrollSmoother || ss.default;
        const ScrollToPlugin = sp.ScrollToPlugin || sp.default;
        const SplitText = sx.SplitText || sx.default;

        gsap.registerPlugin(
          ScrollTrigger,
          ScrollSmoother,
          ScrollToPlugin,
          SplitText,
        );

        const root = rootRef.current;
        const sceneWrapper = contentRef.current;
        if (!root || !sceneWrapper) return;

        let isAnimating = false;
        const splitMap = new Map();

        const getCarouselCellTransforms = (count, radius) => {
          const angleStep = 360 / count;
          return Array.from({ length: count }, (_, i) => {
            const angle = i * angleStep;
            return `rotateY(${angle}deg) translateZ(${radius}px)`;
          });
        };

        const setupCarouselCells = (carousel) => {
          const wrapper = carousel.closest("[data-scene]");
          const radius = parseFloat(wrapper.dataset.radius) || 500;
          const cells = carousel.querySelectorAll("[data-cell]");
          const transforms = getCarouselCellTransforms(cells.length, radius);
          cells.forEach((cell, i) => (cell.style.transform = transforms[i]));
        };

        const animateChars = (chars, direction = "in", opts = {}) => {
          const cfg = {
            autoAlpha: direction === "in" ? 1 : 0,
            duration: 0.02,
            ease: "none",
            stagger: { each: 0.04, from: direction === "in" ? "start" : "end" },
            ...opts,
          };
          gsap.fromTo(chars, { autoAlpha: direction === "in" ? 0 : 1 }, cfg);
        };

        const createScrollAnimation = (carousel) => {
          const wrapper = carousel.closest("[data-scene]");
          const cards = carousel.querySelectorAll("[data-card]");
          const titleSpan = wrapper.querySelector("[data-scene-title] span");
          const split = splitMap.get(titleSpan);
          const chars = split?.chars || [];

          carousel._timeline = gsap.timeline({
            defaults: { ease: "sine.inOut" },
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          carousel._timeline
            .fromTo(carousel, { rotationY: 0 }, { rotationY: -180 }, 0)
            .fromTo(
              carousel,
              { rotationZ: 3, rotationX: 3 },
              { rotationZ: -3, rotationX: -3 },
              0,
            )
            .fromTo(
              cards,
              { filter: "brightness(250%)" },
              { filter: "brightness(80%)", ease: "power3" },
              0,
            )
            .fromTo(
              cards,
              { rotationZ: 10 },
              { rotationZ: -10, ease: "none" },
              0,
            );

          if (chars.length > 0) {
            animateChars(chars, "in", {
              scrollTrigger: {
                trigger: wrapper,
                start: "top center",
                toggleActions: "play none none reverse",
              },
            });
          }

          return carousel._timeline;
        };

        const initTextsSplit = () => {
          root
            .querySelectorAll(
              "[data-scene-title] span, [data-preview-title] span, [data-preview-close]",
            )
            .forEach((span) => {
              const split = SplitText.create(span, {
                type: "chars",
                charsClass: "char",
                autoSplit: true,
              });
              splitMap.set(span, split);
            });
        };

        const getInterpolatedRotation = (progress) => ({
          rotationY: gsap.utils.interpolate(0, -180, progress),
          rotationX: gsap.utils.interpolate(3, -3, progress),
          rotationZ: gsap.utils.interpolate(3, -3, progress),
        });

        const animateGridItemIn = (el, dx, dy, rotationY, delay) => {
          gsap.fromTo(
            el,
            {
              transformOrigin: `50% 50% ${dx > 0 ? -dx * 0.8 : dx * 0.8}px`,
              autoAlpha: 0,
              y: dy * 0.5,
              scale: 0.5,
              rotationY,
            },
            {
              y: 0,
              scale: 1,
              rotationY: 0,
              autoAlpha: 1,
              duration: 0.4,
              ease: "sine",
              delay: delay + 0.1,
            },
          );
          gsap.fromTo(
            el,
            { z: -3500 },
            { z: 0, duration: 0.3, ease: "expo", delay },
          );
        };

        const animateGridItemOut = (
          el,
          dx,
          dy,
          rotationY,
          delay,
          isLast,
          onComplete,
        ) => {
          gsap.to(el, {
            startAt: {
              transformOrigin: `50% 50% ${dx > 0 ? -dx * 0.8 : dx * 0.8}px`,
            },
            y: dy * 0.4,
            rotationY,
            scale: 0.4,
            autoAlpha: 0,
            duration: 0.4,
            ease: "sine.in",
            delay,
          });
          gsap.to(el, {
            z: -3500,
            duration: 0.4,
            ease: "expo.in",
            delay: delay + 0.9,
            onComplete: isLast ? onComplete : undefined,
          });
        };

        const animateGridItems = ({
          items,
          centerX,
          centerY,
          direction = "in",
          onComplete,
        }) => {
          const itemData = Array.from(items).map((el) => {
            const rect = el.getBoundingClientRect();
            const elCenterX = rect.left + rect.width / 2;
            const elCenterY = rect.top + rect.height / 2;
            const dx = centerX - elCenterX;
            const dy = centerY - elCenterY;
            const dist = Math.hypot(dx, dy);
            const isLeft = elCenterX < centerX;
            return { el, dx, dy, dist, isLeft };
          });

          const maxDist = Math.max(...itemData.map((d) => d.dist));
          const totalStagger = 0.025 * (itemData.length - 1);
          let latest = { delay: -1, el: null };

          itemData.forEach(({ el, dx, dy, dist, isLeft }) => {
            const norm = maxDist ? dist / maxDist : 0;
            const exponential = direction === "in" ? 1 - norm : norm;
            const delay = exponential * totalStagger;
            const rotationY = isLeft ? 100 : -100;

            if (direction === "in") {
              animateGridItemIn(el, dx, dy, rotationY, delay);
            } else {
              if (delay > latest.delay) latest = { delay, el };
              animateGridItemOut(
                el,
                dx,
                dy,
                rotationY,
                delay,
                false,
                onComplete,
              );
            }
          });

          if (direction === "out" && latest.el) {
            const { el, dx, dy, isLeft } = itemData.find(
              (d) => d.el === latest.el,
            );
            const rotationY = isLeft ? 100 : -100;
            animateGridItemOut(
              el,
              dx,
              dy,
              rotationY,
              latest.delay,
              true,
              onComplete,
            );
          }
        };

        const animatePreviewGridIn = (preview) => {
          const items = preview.querySelectorAll("[data-grid-item]");
          gsap.set(items, { clearProps: "all" });
          animateGridItems({
            items,
            centerX: window.innerWidth / 2,
            centerY: window.innerHeight / 2,
            direction: "in",
          });
        };

        const animatePreviewGridOut = (preview) => {
          const items = preview.querySelectorAll("[data-grid-item]");
          const onComplete = () =>
            gsap.set(preview, { pointerEvents: "none", autoAlpha: 0 });
          animateGridItems({
            items,
            centerX: window.innerWidth / 2,
            centerY: window.innerHeight / 2,
            direction: "out",
            onComplete,
          });
        };

        const getSceneElementsFromTitle = (titleEl) => {
          const wrapper = titleEl.closest("[data-scene]");
          const carousel = wrapper?.querySelector("[data-carousel]");
          const cards = carousel?.querySelectorAll("[data-card]");
          const span = titleEl.querySelector("span");
          const chars = splitMap.get(span)?.chars || [];
          return { wrapper, carousel, cards, span, chars };
        };

        const getSceneElementsFromPreview = (previewEl) => {
          const previewId = `#${previewEl.id}`;
          const titleLink = root.querySelector(
            `[data-scene-title] a[href="${previewId}"]`,
          );
          const titleEl = titleLink?.closest("[data-scene-title]");
          return { ...getSceneElementsFromTitle(titleEl), titleEl };
        };

        const animatePreviewTexts = (
          preview,
          direction = "in",
          selector = "[data-preview-title] span, [data-preview-close]",
        ) => {
          preview.querySelectorAll(selector).forEach((el) => {
            const chars = splitMap.get(el)?.chars || [];
            animateChars(chars, direction);
          });
        };

        const activatePreviewFromCarousel = (e) => {
          e.preventDefault();
          if (isAnimating) return;
          isAnimating = true;

          const titleEl = e.currentTarget;
          const { wrapper, carousel, cards, chars } =
            getSceneElementsFromTitle(titleEl);

          const offsetTop =
            wrapper.getBoundingClientRect().top + window.scrollY;
          const targetY =
            offsetTop - window.innerHeight / 2 + wrapper.offsetHeight / 2;

          ScrollTrigger.getAll().forEach((t) => t.disable(false));

          gsap
            .timeline({
              defaults: { duration: 1.5, ease: "power2.inOut" },
              onComplete: () => {
                isAnimating = false;
                ScrollTrigger.getAll().forEach((t) => t.enable());
                carousel._timeline.scrollTrigger.scroll(targetY);
              },
            })
            .to(window, {
              onStart: () => lockUserScroll(),
              onComplete: () => {
                unlockUserScroll();
                stateRef.current.smoother?.paused(true);
              },
              scrollTo: { y: targetY, autoKill: true },
            })
            .to(
              chars,
              {
                autoAlpha: 0,
                duration: 0.02,
                ease: "none",
                stagger: { each: 0.04, from: "end" },
              },
              0,
            )
            .to(carousel, { rotationX: 90, rotationY: -360, z: -2000 }, 0)
            .to(
              carousel,
              {
                duration: 2.5,
                ease: "power3.inOut",
                z: 1500,
                rotationZ: 270,
                onComplete: () => gsap.set(sceneWrapper, { autoAlpha: 0 }),
              },
              0.7,
            )
            .to(cards, { rotationZ: 0 }, 0)
            .add(() => {
              const previewSelector = titleEl
                .querySelector("a")
                ?.getAttribute("href");
              const preview = root.querySelector(previewSelector);
              gsap.set(preview, { pointerEvents: "auto", autoAlpha: 1 });
              animatePreviewGridIn(preview);
              animatePreviewTexts(preview, "in");
            }, "<+=1.9");
        };

        const deactivatePreviewToCarousel = (e) => {
          if (isAnimating) return;
          isAnimating = true;

          const preview = e.currentTarget.closest("[data-preview]");
          if (!preview) return;

          const { carousel, cards, chars } =
            getSceneElementsFromPreview(preview);

          animatePreviewTexts(preview, "out");
          animatePreviewGridOut(preview);

          gsap.set(sceneWrapper, { autoAlpha: 1 });

          const progress = 0.5;
          const { rotationX, rotationY, rotationZ } =
            getInterpolatedRotation(progress);

          gsap
            .timeline({
              delay: 0.7,
              defaults: { duration: 1.3, ease: "expo" },
              onComplete: () => {
                stateRef.current.smoother?.paused(false);
                isAnimating = false;
              },
            })
            .fromTo(
              chars,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: 0.02,
                ease: "none",
                stagger: { each: 0.04, from: "start" },
              },
            )
            .fromTo(
              carousel,
              { z: -550, rotationX, rotationY: -720, rotationZ, yPercent: 300 },
              { rotationY, yPercent: 0 },
              0,
            )
            .fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.3);
        };

        const initEventListeners = () => {
          const titles = [...root.querySelectorAll("[data-scene-title]")];
          const closes = [...root.querySelectorAll("[data-preview-close]")];
          titles.forEach((title) =>
            title.addEventListener("click", activatePreviewFromCarousel),
          );
          closes.forEach((btn) =>
            btn.addEventListener("click", deactivatePreviewToCarousel),
          );
          return { titles, closes };
        };

        const initCarousels = () => {
          const carousels = [...root.querySelectorAll("[data-carousel]")];
          carousels.forEach((carousel) => {
            setupCarouselCells(carousel);
            carousel._timeline = createScrollAnimation(carousel);
          });
          return carousels;
        };

        function preventScroll(ev) {
          ev.preventDefault();
        }
        function preventArrowScroll(ev) {
          const keys = [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
            " ",
          ];
          if (keys.includes(ev.key)) ev.preventDefault();
        }
        function lockUserScroll() {
          window.addEventListener("wheel", preventScroll, { passive: false });
          window.addEventListener("touchmove", preventScroll, {
            passive: false,
          });
          window.addEventListener("keydown", preventArrowScroll, false);
        }
        function unlockUserScroll() {
          window.removeEventListener("wheel", preventScroll);
          window.removeEventListener("touchmove", preventScroll);
          window.removeEventListener("keydown", preventArrowScroll);
        }

        const smoother = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          smooth: smoothness,
          effects: true,
          normalizeScroll: true,
        });
        stateRef.current.smoother = smoother;

        initTextsSplit();
        const carousels = initCarousels();
        const { titles, closes } = initEventListeners();

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        stateRef.current.cleanup = () => {
          window.removeEventListener("resize", onResize);
          unlockUserScroll();
          titles.forEach((title) =>
            title.removeEventListener("click", activatePreviewFromCarousel),
          );
          closes.forEach((btn) =>
            btn.removeEventListener("click", deactivatePreviewToCarousel),
          );
          carousels.forEach((c) => c._timeline?.kill());
          splitMap.forEach((split) => split.revert());
          smoother.kill();
          ScrollTrigger.getAll().forEach((t) => t.kill());
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (stateRef.current.cleanup) stateRef.current.cleanup();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative w-full uppercase [font-family:ui-monospace,monospace] ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        "--tw-accent": accentColor,
      }}
    >
      <div
        ref={wrapperRef}
        id={`smooth-wrapper-${uid}`}
        className="fixed inset-0 overflow-hidden"
      >
        <div ref={contentRef} id={`smooth-content-${uid}`}>
          {scenes.map((scene, sceneIndex) => (
            <div
              key={scene.title}
              data-scene
              data-radius={scene.radius || 500}
              className="relative h-screen flex items-center justify-center [perspective:900px]"
            >
              <h2 data-scene-title className="relative z-10 m-0 px-4 text-center">
                <a href={`#${uid}-preview-${sceneIndex}`} className="block">
                  <span className="inline-block" style={{ color: textColor }}>
                    {scene.title}
                  </span>
                </a>
              </h2>

              <div
                data-carousel
                className="absolute top-1/2 left-1/2 [transform-style:preserve-3d] will-change-transform"
                style={{
                  width: `${carouselWidth}px`,
                  height: `${carouselHeight}px`,
                  margin: `-${carouselHeight / 2}px 0 0 -${carouselWidth / 2}px`,
                  transform: `translateZ(-550px) rotateY(${sceneIndex % 2 === 1 ? 45 : 0}deg)`,
                }}
              >
                {scene.images.map((src, cellIndex) => (
                  <div
                    key={cellIndex}
                    data-cell
                    className="absolute top-0 left-0 w-[350px] h-[420px] [transform-style:preserve-3d]"
                  >
                    <div
                      data-card
                      className="relative w-full h-full [transform-style:preserve-3d]"
                    >
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${src})`,
                          borderRadius: cardRadius,
                        }}
                      />
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] bg-cover bg-center [transform:rotateY(180deg)]"
                        style={{
                          backgroundImage: `url(${src})`,
                          borderRadius: cardRadius,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        {scenes.map((scene, sceneIndex) => {
          const previewImageCount = Math.max(scene.images.length * 2, 10);
          const previewImages = cycled(
            FASHION_IMAGES,
            previewImageCount,
            sceneIndex * 4,
          );

          return (
            <div
              key={scene.title}
              id={`${uid}-preview-${sceneIndex}`}
              data-preview
              className="fixed inset-0 grid content-center justify-items-center gap-4 opacity-0 pointer-events-none px-[15vw]"
            >
              <header className="flex w-full items-end justify-between leading-none">
                <h2 data-preview-title className="m-0">
                  <span className="inline-block" style={{ color: textColor }}>
                    {scene.title}
                  </span>
                </h2>
                <button
                  data-preview-close
                  className="bg-transparent border-0 p-0 m-0 font-inherit cursor-pointer uppercase hover:[color:var(--tw-accent)] focus:outline-none"
                  style={{ color: textColor }}
                >
                  {closeLabel}
                </button>
              </header>

              <div
                className={`w-full py-4 [perspective:900px] grid preview-grid-${uid}-${sceneIndex}`}
                style={{
                  gridTemplateColumns: `repeat(${previewColumnsMobile}, minmax(0, 1fr))`,
                  columnGap: "clamp(0.5rem, 4vw, 3rem)",
                  rowGap: "clamp(0.5rem, 4vw, 3rem)",
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `@media (min-width:65em){.preview-grid-${uid}-${sceneIndex}{grid-template-columns:repeat(${previewColumnsDesktop},minmax(0,1fr))!important;}}`,
                  }}
                />
                {previewImages.map((src, i) => (
                  <figure
                    key={i}
                    data-grid-item
                    className="m-0 p-0 flex flex-col gap-1 overflow-hidden relative [transform-style:preserve-3d] will-change-transform"
                    style={{ borderRadius: cardRadius }}
                  >
                    <div
                      className="w-full bg-center bg-[length:100%] transition-opacity duration-150 [transition-timing-function:cubic-bezier(0.2,0,0.2,1)] hover:opacity-70"
                      style={{
                        aspectRatio: cardAspect,
                        backgroundImage: `url(${src})`,
                      }}
                    />
                    <figcaption>
                      <h3
                        className="text-base font-normal m-0"
                        style={{ color: textColor }}
                      >
                        {previewNames[i % previewNames.length]}
                      </h3>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
