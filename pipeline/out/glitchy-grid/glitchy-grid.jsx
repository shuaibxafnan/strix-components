"use client";

import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    eyebrow: "Chapter 01",
    title: "Hold fast",
    images: [
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    eyebrow: "Chapter 02",
    title: "Being free",
    images: [
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    eyebrow: "Chapter 03",
    title: "No final one",
    images: [
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    ],
  },
];

const ITEM_AREAS = [
  "[grid-area:9/3/15/6]",
  "[grid-area:9/9/18/18]",
  "[grid-area:11/21/20/25]",
  "[grid-area:1/7/7/11]",
  "[grid-area:1/19/6/16]",
  "[grid-area:20/1/26/7]",
  "[grid-area:21/11/26/15]",
  "[grid-area:2/21/8/18]",
];

const GLITCH_LAYERS = [
  "group-hover:[animation:gg-a1_2s_linear_alternate]",
  "group-hover:[animation:gg-a2_2s_linear_alternate]",
  "group-hover:[animation:gg-a3_2s_linear_alternate]",
  "group-hover:[animation:gg-flash_0.5s_steps(1,end)]",
];

const GLITCH_KEYFRAMES =
  "@keyframes gg-a1{0%{clip-path:polygon(0 2%,100% 2%,100% 5%,0 5%)}10%{clip-path:polygon(0 15%,100% 15%,100% 15%,0 15%)}20%{clip-path:polygon(0 10%,100% 10%,100% 20%,0 20%)}30%{clip-path:polygon(0 1%,100% 1%,100% 2%,0 2%)}40%{clip-path:polygon(0 33%,100% 33%,100% 33%,0 33%)}50%{clip-path:polygon(0 44%,100% 44%,100% 44%,0 44%)}60%{clip-path:polygon(0 50%,100% 50%,100% 20%,0 20%)}70%{clip-path:polygon(0 70%,100% 70%,100% 70%,0 70%)}80%{clip-path:polygon(0 80%,100% 80%,100% 80%,0 80%)}90%{clip-path:polygon(0 50%,100% 50%,100% 55%,0 55%)}100%{clip-path:polygon(0 70%,100% 70%,100% 80%,0 80%)}}" +
  "@keyframes gg-a2{0%{clip-path:polygon(0 25%,100% 25%,100% 30%,0 30%)}15%{clip-path:polygon(0 3%,100% 3%,100% 3%,0 3%)}22%{clip-path:polygon(0 5%,100% 5%,100% 20%,0 20%)}31%{clip-path:polygon(0 20%,100% 20%,100% 20%,0 20%)}45%{clip-path:polygon(0 40%,100% 40%,100% 40%,0 40%)}51%{clip-path:polygon(0 52%,100% 52%,100% 59%,0 59%)}63%{clip-path:polygon(0 60%,100% 60%,100% 60%,0 60%)}76%{clip-path:polygon(0 75%,100% 75%,100% 75%,0 75%)}81%{clip-path:polygon(0 65%,100% 65%,100% 40%,0 40%)}94%{clip-path:polygon(0 45%,100% 45%,100% 50%,0 50%)}100%{clip-path:polygon(0 14%,100% 14%,100% 33%,0 33%)}}" +
  "@keyframes gg-a3{0%{clip-path:polygon(0 1%,100% 1%,100% 3%,0 3%)}5%{clip-path:polygon(0 10%,100% 10%,100% 9%,0 9%)}10%{clip-path:polygon(0 5%,100% 5%,100% 6%,0 6%)}25%{clip-path:polygon(0 20%,100% 20%,100% 20%,0 20%)}27%{clip-path:polygon(0 10%,100% 10%,100% 10%,0 10%)}30%{clip-path:polygon(0 30%,100% 30%,100% 25%,0 25%)}33%{clip-path:polygon(0 15%,100% 15%,100% 16%,0 16%)}37%{clip-path:polygon(0 40%,100% 40%,100% 39%,0 39%)}40%{clip-path:polygon(0 20%,100% 20%,100% 21%,0 21%)}45%{clip-path:polygon(0 60%,100% 60%,100% 55%,0 55%)}50%{clip-path:polygon(0 30%,100% 30%,100% 31%,0 31%)}53%{clip-path:polygon(0 70%,100% 70%,100% 69%,0 69%)}57%{clip-path:polygon(0 40%,100% 40%,100% 41%,0 41%)}60%{clip-path:polygon(0 80%,100% 80%,100% 75%,0 75%)}65%{clip-path:polygon(0 50%,100% 50%,100% 51%,0 51%)}70%{clip-path:polygon(0 90%,100% 90%,100% 90%,0 90%)}73%{clip-path:polygon(0 60%,100% 60%,100% 60%,0 60%)}80%{clip-path:polygon(0 100%,100% 100%,100% 99%,0 99%)}100%{clip-path:polygon(0 70%,100% 70%,100% 71%,0 71%)}}" +
  "@keyframes gg-flash{0%{opacity:.25}33%,100%{opacity:0}}";

export default function GlitchyGrid({
  slides = DEFAULT_SLIDES,
  bgColor = "#0b0b0c",
  transitionColor = "#16171a",
  textColor = "#f4f4f5",
  mutedColor = "#6b6b73",
  parallaxX = 22,
  parallaxY = 18,
  parallaxEase = 0.07,
  glitchGap = 10,
  glitchGapVertical = 2,
  hideDuration = 0.6,
  showDuration = 0.9,
  stackScale = 1.8,
  stackRotation = 8,
  autoplay = false,
  autoplayDelay = 6000,
  className = "",
}) {
  const rawId = useId();
  const sid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const navigateRef = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let rafId;
    const cleanups = [];

    import("gsap")
      .then((mod) => {
        if (disposed) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap) return;

        const lerp = (a, b, n) => (1 - n) * a + n * b;
        const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
        const rand = (min, max) =>
          Math.floor(Math.random() * (max - min + 1) + min);

        let winsize = { width: window.innerWidth, height: window.innerHeight };
        let mousepos = { x: winsize.width / 2, y: winsize.height / 2 };

        const groups = Array.from(root.querySelectorAll("[data-gg-slide]")).map(
          (slideEl) => ({
            el: slideEl,
            items: Array.from(slideEl.querySelectorAll("[data-gg-item]")).map(
              (el) => ({
                el,
                image: el.querySelector("[data-gg-img]"),
                tx: 0,
                ty: 0,
                xstart: rand(Math.round(parallaxX * 0.45), parallaxX),
                ystart: rand(Math.round(parallaxY * 0.45), parallaxY),
                rect: el.getBoundingClientRect(),
              }),
            ),
            texts: Array.from(slideEl.querySelectorAll("[data-gg-text]")),
          }),
        );

        groups.forEach((g, i) => {
          gsap.set(
            g.items.map((it) => it.el),
            { opacity: i === 0 ? 1 : 0 },
          );
          gsap.set(g.texts, { opacity: i === 0 ? 1 : 0 });
          g.el.style.pointerEvents = i === 0 ? "auto" : "none";
        });

        let index = 0;

        const measure = () => {
          winsize = { width: window.innerWidth, height: window.innerHeight };
          groups.forEach((g) =>
            g.items.forEach((it) => {
              it.rect = it.el.getBoundingClientRect();
            }),
          );
        };

        const onResize = () => measure();
        const onMouseMove = (ev) => {
          mousepos = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMouseMove);
        cleanups.push(() => window.removeEventListener("resize", onResize));
        cleanups.push(() =>
          window.removeEventListener("mousemove", onMouseMove),
        );

        const render = () => {
          const active = groups[index];
          if (active) {
            active.items.forEach((it) => {
              it.tx = lerp(
                it.tx,
                map(mousepos.x, 0, winsize.width, it.xstart, -it.xstart),
                parallaxEase,
              );
              it.ty = lerp(
                it.ty,
                map(mousepos.y, 0, winsize.height, it.ystart, -it.ystart),
                parallaxEase,
              );
              gsap.set(it.el, { x: it.tx, y: it.ty });
            });
          }
          rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        const hide = (group, direction) =>
          new Promise((resolve) => {
            const imageElems = group.items.map((it) => it.image);
            group.el.style.pointerEvents = "none";
            gsap
              .timeline({ onComplete: resolve })
              .to(
                imageElems,
                {
                  duration: hideDuration,
                  ease: "power3.inOut",
                  y: direction === -1 ? "100%" : "-100%",
                  opacity: 0,
                  stagger: 0.02,
                  onComplete: () => gsap.set(imageElems, { y: 0 }),
                },
                0,
              )
              .to(
                group.texts,
                {
                  duration: hideDuration,
                  ease: "power3.inOut",
                  y: direction === -1 ? "40%" : "-40%",
                  opacity: 0,
                  stagger: direction * 0.08,
                },
                0,
              )
              .to(
                root,
                {
                  duration: 0.4,
                  ease: "power2.out",
                  backgroundColor: transitionColor,
                },
                0.2,
              );
          });

        const show = (group, direction) =>
          new Promise((resolve) => {
            const imageElems = group.items.map((it) => it.image);
            gsap
              .timeline({
                onStart: () => {
                  gsap.set(
                    group.items.map((it) => it.el),
                    { opacity: 1 },
                  );
                },
                onComplete: resolve,
              })
              .addLabel("start")
              .set(imageElems, {
                x: (pos) => {
                  const r = group.items[pos].rect;
                  return winsize.width / 2 - r.left - r.width / 2;
                },
                y: (pos) => {
                  const r = group.items[pos].rect;
                  return winsize.height / 2 - r.top - r.height / 2;
                },
                rotation: () => rand(-stackRotation, stackRotation),
                scale: stackScale,
                opacity: 0,
              })
              .set(imageElems, { opacity: 1, stagger: 0.1 }, "start+=0.1")
              .addLabel("visible")
              .to(
                root,
                { duration: 0.5, ease: "power2.out", backgroundColor: bgColor },
                "visible+=0.1",
              )
              .to(
                imageElems,
                {
                  duration: showDuration,
                  ease: "expo.out",
                  x: 0,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  stagger: 0.05,
                },
                "visible+=0.1",
              )
              .set(
                group.texts,
                { y: direction === -1 ? "-40%" : "40%", opacity: 0 },
                "start",
              )
              .to(
                group.texts,
                {
                  duration: showDuration,
                  ease: "expo.out",
                  y: 0,
                  opacity: 1,
                  stagger: direction * 0.12,
                },
                "visible+=0.5",
              );
          });

        let isAnimating = false;
        navigateRef.current = (next) => {
          if (isAnimating || next === index || !groups[next]) return;
          isAnimating = true;
          const direction = index < next ? 1 : -1;
          const from = index;
          index = next;
          setCurrent(next);
          measure();
          groups.forEach((g) => {
            g.el.style.pointerEvents = "none";
          });
          hide(groups[from], direction)
            .then(() => show(groups[next], direction))
            .then(() => {
              groups[next].el.style.pointerEvents = "auto";
              isAnimating = false;
            });
        };

        cleanups.push(() => {
          navigateRef.current = null;
          gsap.killTweensOf(root);
          groups.forEach((g) => {
            gsap.killTweensOf(g.texts);
            g.items.forEach((it) => {
              gsap.killTweensOf(it.el);
              gsap.killTweensOf(it.image);
            });
          });
        });
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
    };
  }, [
    slides,
    bgColor,
    transitionColor,
    parallaxX,
    parallaxY,
    parallaxEase,
    hideDuration,
    showDuration,
    stackScale,
    stackRotation,
  ]);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const id = setInterval(() => {
      const next = (current + 1) % slides.length;
      if (navigateRef.current) navigateRef.current(next);
    }, autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, autoplayDelay, current, slides.length]);

  const go = (i) => {
    if (navigateRef.current) navigateRef.current(i);
  };

  return (
    <div
      ref={rootRef}
      data-gg={sid}
      className={
        "relative grid h-screen w-full grid-cols-1 grid-rows-1 place-items-center overflow-hidden select-none " +
        className
      }
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLITCH_KEYFRAMES }} />

      {slides.map((slide, si) => (
        <div
          key={si}
          data-gg-slide=""
          className="col-start-1 row-start-1 grid h-full w-full max-w-[1200px] grid-cols-[repeat(25,4%)] grid-rows-[repeat(25,4%)] place-content-center place-items-center"
        >
          {slide.images.slice(0, 8).map((src, ii) => (
            <div
              key={ii}
              data-gg-item=""
              className={
                "group relative z-0 h-full w-full opacity-0 " + ITEM_AREAS[ii]
              }
            >
              <div
                data-gg-img=""
                className="absolute inset-0 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url(" + src + ")" }}
              />
              {GLITCH_LAYERS.map((anim, gi) => (
                <div
                  key={gi}
                  aria-hidden="true"
                  className={
                    "pointer-events-none absolute bg-cover bg-center opacity-0 group-hover:opacity-100 " +
                    anim
                  }
                  style={{
                    backgroundImage: "url(" + src + ")",
                    top: -glitchGapVertical + "px",
                    left: -glitchGap + "px",
                    width: "calc(100% + " + glitchGap * 2 + "px)",
                    height: "calc(100% + " + glitchGapVertical * 2 + "px)",
                    transform:
                      gi === 0
                        ? "translate3d(" + glitchGap + "px,0,0)"
                        : gi === 1
                          ? "translate3d(" + -glitchGap + "px,0,0)"
                          : gi === 2
                            ? "translate3d(0," +
                              -glitchGapVertical +
                              "px,0) scale3d(-1,-1,1)"
                            : "translate3d(0,0,0)",
                  }}
                />
              ))}
            </div>
          ))}

          <div className="pointer-events-none relative z-20 flex h-full w-full flex-col justify-end px-6 pb-14 [grid-area:1/1/26/26] md:px-12 md:pb-16">
            <span
              data-gg-text=""
              className="mb-3 text-[0.7rem] font-medium tracking-[0.35em] uppercase opacity-0"
              style={{ color: mutedColor }}
            >
              {slide.eyebrow}
            </span>
            <span
              data-gg-text=""
              className="text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-light tracking-tight opacity-0"
            >
              {slide.title}
            </span>
          </div>
        </div>
      ))}

      <nav className="pointer-events-auto absolute right-6 bottom-6 z-10 flex gap-4 md:top-1/2 md:right-10 md:bottom-auto md:-translate-y-1/2 md:flex-col md:gap-5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={"Go to slide " + (i + 1)}
            aria-current={i === current ? "true" : undefined}
            className={
              "h-[2px] w-8 cursor-pointer appearance-none border-0 p-0 transition-all duration-500 outline-none focus-visible:ring-1 focus-visible:ring-current md:h-8 md:w-[2px] " +
              (i === current ? "opacity-100" : "opacity-40 hover:opacity-70")
            }
            style={{ backgroundColor: i === current ? textColor : mutedColor }}
          />
        ))}
      </nav>
    </div>
  );
}
