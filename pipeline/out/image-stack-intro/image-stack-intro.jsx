"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_IMAGES = [
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

const DEFAULT_CAPTIONS = [
  "Questrial",
  "Coriolis",
  "Eclipse",
  "Horizon",
  "Gibbous",
  "Interstellar",
  "Neutron",
  "Orbital",
  "Supernova",
];

const DEFAULT_TEXT =
  "It is difficult not to feel that the unconscious aim in the most typical modern pleasure resorts is a return to the womb. For there, too, one was never alone, one never saw daylight, the temperature was always regulated, one did not have to worry about work or food, and one's thoughts, if any, were drowned by a continuous rhythmic throbbing.";

export default function ImageStackIntro({
  images = DEFAULT_IMAGES,
  captions = DEFAULT_CAPTIONS,
  title = "Pleasure City",
  text = DEFAULT_TEXT,
  bgColor = "#eee7e0",
  textColor = "#131212",
  cursorColor = "#c5681c",
  cursorSize = 30,
  cursorHoverScale = 2.5,
  showCursor = true,
  columns = 3,
  columnMaxWidth = 320,
  columnGap = 2,
  rowGap = 25,
  titleGap = 1.5,
  imageRatio = 140,
  captionOnTop = true,
  introDuration = 1.2,
  introEase = "expo",
  stackScale = 0.6,
  stackZoom = 1.8,
  stackRotation = 10,
  stackStagger = 0.1,
  restScale = 0.8,
  captionStagger = 0.03,
  hoverImageScale = 0.95,
  hoverZoomScale = 1.2,
  hoverDuration = 1,
  parallax = true,
  parallaxSpeeds = [1, 2.5, 4],
  parallaxStrength = 26,
  parallaxEase = 0.12,
  titleFont = "Playfair Display",
  bodyFont = "Jost",
  loadFonts = true,
  className = "",
}) {
  const uid = useId().replace(/[:]/g, "");
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const cursorRef = useRef(null);
  const figureRefs = useRef([]);
  const imgRefs = useRef([]);
  const innerRefs = useRef([]);
  const charRefs = useRef([]);

  useEffect(() => {
    if (!loadFonts) return;
    const href =
      "https://fonts.googleapis.com/css2?family=" +
      titleFont.replace(/ /g, "+") +
      ":wght@400;700&family=" +
      bodyFont.replace(/ /g, "+") +
      ":wght@300;400;500&display=swap";
    if (document.querySelector('link[data-id="' + href + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-id", href);
    document.head.appendChild(link);
  }, [loadFonts, titleFont, bodyFont]);

  useEffect(() => {
    let killed = false;
    let rafId = null;
    const cleanups = [];

    import("gsap")
      .then((mod) => {
        if (killed) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap || !rootRef.current) return;

        const start = () => {
          if (killed || !rootRef.current) return;

          const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          const figures = figureRefs.current.filter(Boolean);
          const imgs = imgRefs.current.filter(Boolean);
          const inners = innerRefs.current.filter(Boolean);
          const total = imgs.length;
          const inStack = imgs.map(() => true);

          const winsize = {
            width: window.innerWidth,
            height: window.innerHeight,
          };
          const rects = imgs.map((el) => el.getBoundingClientRect());

          figures.forEach((el, pos) => {
            gsap.set(el, { zIndex: total - 1 - pos });
          });

          if (reduced) {
            gsap.set(imgs, { opacity: 1 });
            gsap.set(charRefs.current.flat().filter(Boolean), {
              opacity: 1,
              y: "0%",
            });
            gsap.set([titleRef.current, textRef.current], {
              opacity: 1,
              y: "0%",
            });
            inStack.fill(false);
          } else {
            const order = [];
            for (let i = total - 1; i >= 0; i--) order.push(i);

            const tl = gsap.timeline();

            gsap.to(rootRef.current.querySelector('[data-role="gallery"]'), {
              duration: introDuration,
              ease: introEase,
              startAt: { y: "4%" },
              y: "0%",
            });

            order.forEach((index, pos) => {
              const rect = rects[index];
              tl.set(
                imgs[index],
                {
                  x: winsize.width / 2 - rect.left - rect.width / 2,
                  y: winsize.height / 2 - rect.top - rect.height / 2,
                  scale: stackScale,
                  rotation: gsap.utils.random(-stackRotation, stackRotation, 1),
                  opacity: 1,
                  delay: stackStagger * pos,
                },
                0,
              );

              if (pos >= total - 3) {
                tl.set(inners[index], { scale: stackZoom }, 0);
              } else {
                tl.set(
                  imgs[index],
                  { opacity: 0, delay: stackStagger * pos },
                  0.3,
                );
              }
            });

            const topThree = [0, 1, 2].filter((i) => i < total);
            const others = imgs.filter((_, i) => topThree.indexOf(i) === -1);

            tl.addLabel("startAnimation", "+=0.1")
              .add(() => {
                document.body.style.overflow = "";
              }, "startAnimation")
              .to(
                topThree.map((i) => imgs[i]),
                {
                  duration: introDuration,
                  ease: introEase,
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                },
                "startAnimation",
              )
              .to(
                topThree.map((i) => inners[i]),
                { duration: introDuration, ease: introEase, scale: 1 },
                "startAnimation",
              );

            if (others.length) {
              tl.to(
                others,
                {
                  duration: introDuration,
                  ease: introEase,
                  startAt: { x: 0, y: 0, rotation: 0, scale: restScale },
                  scale: 1,
                  opacity: 1,
                },
                "startAnimation",
              );
            }

            imgs.forEach((_, index) => {
              const chars = (charRefs.current[index] || []).filter(Boolean);
              tl.add(() => {
                inStack[index] = false;
              }, "startAnimation+=" + introDuration);
              if (chars.length) {
                tl.to(
                  chars,
                  {
                    duration: 1,
                    ease: introEase,
                    startAt: { opacity: 0, y: "40%" },
                    y: "0%",
                    opacity: 1,
                    stagger: captionStagger,
                  },
                  "startAnimation+=0.5",
                );
              }
            });

            tl.to(
              [titleRef.current, textRef.current],
              {
                duration: introDuration,
                ease: introEase,
                startAt: { y: "50%" },
                y: "0%",
                opacity: 1,
                stagger: 0.04,
              },
              "startAnimation+=0.2",
            );
          }

          imgs.forEach((imgEl, index) => {
            const chars = (charRefs.current[index] || []).filter(Boolean);
            const onEnter = () => {
              gsap.killTweensOf(chars);
              if (inStack[index]) return;
              const imgRect = imgEl.getBoundingClientRect();
              const captionRect = chars.length
                ? chars[0].parentNode.getBoundingClientRect()
                : { width: 0 };
              gsap
                .timeline({
                  defaults: { duration: hoverDuration, ease: "expo" },
                })
                .to(imgEl, { scale: hoverImageScale })
                .to(inners[index], { scale: hoverZoomScale }, 0)
                .to(
                  chars,
                  {
                    x: imgRect.width - captionRect.width * 1.1,
                    stagger: -0.02,
                  },
                  0,
                );
            };
            const onLeave = () => {
              gsap.killTweensOf(chars);
              if (inStack[index]) return;
              gsap
                .timeline({
                  defaults: { duration: hoverDuration, ease: "expo" },
                })
                .to([imgEl, inners[index]], { scale: 1 })
                .to(chars, { x: 0 }, 0);
            };
            imgEl.addEventListener("mouseenter", onEnter);
            imgEl.addEventListener("mouseleave", onLeave);
            cleanups.push(() => {
              imgEl.removeEventListener("mouseenter", onEnter);
              imgEl.removeEventListener("mouseleave", onLeave);
            });
          });

          if (showCursor && cursorRef.current) {
            const cursorEl = cursorRef.current;
            const mouse = { x: 0, y: 0 };
            const state = {
              tx: { previous: 0, current: 0, amt: 0.2 },
              ty: { previous: 0, current: 0, amt: 0.2 },
              scale: { previous: 1, current: 1, amt: 0.15 },
            };
            let started = false;

            const onMove = (ev) => {
              mouse.x = ev.clientX;
              mouse.y = ev.clientY;
              if (!started) {
                started = true;
                state.tx.previous = state.tx.current = mouse.x - cursorSize / 2;
                state.ty.previous = state.ty.current = mouse.y - cursorSize / 2;
                gsap.to(cursorEl, {
                  duration: 0.9,
                  ease: "power3.out",
                  opacity: 1,
                });
              }
            };
            window.addEventListener("mousemove", onMove);

            const render = () => {
              state.tx.current = mouse.x - cursorSize / 2;
              state.ty.current = mouse.y - cursorSize / 2;
              Object.keys(state).forEach((key) => {
                state[key].previous =
                  (1 - state[key].amt) * state[key].previous +
                  state[key].amt * state[key].current;
              });
              cursorEl.style.transform =
                "translateX(" +
                state.tx.previous +
                "px) translateY(" +
                state.ty.previous +
                "px) scale(" +
                state.scale.previous +
                ")";
              rafId = requestAnimationFrame(render);
            };
            rafId = requestAnimationFrame(render);

            const hoverables = [
              ...imgs,
              ...Array.from(rootRef.current.querySelectorAll("a")),
            ];
            hoverables.forEach((el) => {
              const enter = () => {
                state.scale.current = cursorHoverScale;
              };
              const leave = () => {
                state.scale.current = 1;
              };
              el.addEventListener("mouseenter", enter);
              el.addEventListener("mouseleave", leave);
              cleanups.push(() => {
                el.removeEventListener("mouseenter", enter);
                el.removeEventListener("mouseleave", leave);
              });
            });

            cleanups.push(() =>
              window.removeEventListener("mousemove", onMove),
            );
          }

          if (parallax && !reduced) {
            const targets = [
              { el: titleRef.current, speed: 2, current: 0, target: 0 },
              { el: textRef.current, speed: 1, current: 0, target: 0 },
              ...figures.map((el, i) => ({
                el: el,
                speed: parallaxSpeeds[i % parallaxSpeeds.length],
                current: 0,
                target: 0,
              })),
            ].filter((t) => t.el);

            let pRaf = null;
            const loop = () => {
              if (killed) return;
              const viewH = window.innerHeight;
              targets.forEach((t) => {
                const rect = t.el.getBoundingClientRect();
                const center = rect.top + rect.height / 2 - t.current;
                const progress = (viewH / 2 - center) / viewH;
                t.target = progress * t.speed * parallaxStrength;
                t.current += (t.target - t.current) * parallaxEase;
                t.el.style.transform =
                  "translate3d(0," + t.current.toFixed(2) + "px,0)";
              });
              pRaf = requestAnimationFrame(loop);
            };
            const startDelay = window.setTimeout(
              () => {
                pRaf = requestAnimationFrame(loop);
              },
              (introDuration + 1.4) * 1000,
            );
            cleanups.push(() => {
              window.clearTimeout(startDelay);
              if (pRaf) cancelAnimationFrame(pRaf);
            });
          }
        };

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() =>
            requestAnimationFrame(() => requestAnimationFrame(start)),
          );
        } else {
          requestAnimationFrame(() => requestAnimationFrame(start));
        }
      });

    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    return () => {
      killed = true;
      document.body.style.overflow = "";
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
    };
  }, [
    introDuration,
    introEase,
    stackScale,
    stackZoom,
    stackRotation,
    stackStagger,
    restScale,
    captionStagger,
    hoverImageScale,
    hoverZoomScale,
    hoverDuration,
    parallax,
    parallaxStrength,
    parallaxEase,
    showCursor,
    cursorSize,
    cursorHoverScale,
  ]);

  const scopedCss =
    "#" +
    uid +
    " .isg-cursor{display:none}" +
    "@media (any-pointer:fine){#" +
    uid +
    " .isg-cursor{position:fixed;top:0;left:0;display:block;pointer-events:none;z-index:2000;opacity:0}}" +
    "#" +
    uid +
    " .isg-grid{grid-template-columns:repeat(1,minmax(0,1fr));row-gap:" +
    rowGap +
    "vh;column-gap:" +
    columnGap +
    "rem}" +
    "@media screen and (min-width:53em){#" +
    uid +
    " .isg-grid{grid-template-columns:repeat(" +
    columns +
    ",minmax(0," +
    columnMaxWidth +
    "px));row-gap:" +
    rowGap +
    "vh;column-gap:" +
    columnGap +
    "rem}}" +
    "#" +
    uid +
    " .isg-title-word{font-size:0.9rem}" +
    "@media screen and (min-width:53em){#" +
    uid +
    " .isg-title-word{font-size:1.5rem}}" +
    "@media (prefers-reduced-motion: reduce){#" +
    uid +
    " *{animation:none!important}}";

  return (
    <div
      id={uid}
      ref={rootRef}
      className={"relative w-full min-h-screen antialiased" + (className ? " " + className : "")}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: '"' + bodyFont + '", sans-serif',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

      <div className="px-4 pb-16 pt-[20vh] md:px-20">
        <h2
          ref={titleRef}
          className="m-0 text-5xl font-bold leading-tight opacity-0 md:text-6xl"
          style={{ fontFamily: '"' + titleFont + '", serif' }}
        >
          {title}
        </h2>
        <p
          className="mb-0 max-w-[500px] font-light leading-relaxed opacity-0"
          ref={textRef}
          style={{ marginTop: titleGap + "rem" }}
        >
          {text}
        </p>

        <div
          data-role="gallery"
          className="isg-grid grid justify-start pb-80 pt-16"
        >
          {images.map((src, index) => {
            const caption = captions[index] || "";
            charRefs.current[index] = charRefs.current[index] || [];
            return (
              <figure
                key={index}
                ref={(el) => (figureRefs.current[index] = el)}
                className="m-0 grid grid-cols-[100%]"
              >
                <figcaption
                  className={
                    captionOnTop ? "order-1 select-none" : "order-3 select-none"
                  }
                >
                  <h3 className="isg-title-word mb-2 mt-4 inline-block whitespace-nowrap font-medium">
                    {caption.split("").map((ch, ci) => (
                      <span
                        key={ci}
                        ref={(el) => (charRefs.current[index][ci] = el)}
                        className="inline-block opacity-0 will-change-transform"
                      >
                        {ch === " " ? "\u00A0" : ch}
                      </span>
                    ))}
                  </h3>
                </figcaption>

                <div
                  ref={(el) => (imgRefs.current[index] = el)}
                  className="relative w-full overflow-hidden opacity-0 order-2 will-change-transform"
                >
                  <div
                    ref={(el) => (innerRefs.current[index] = el)}
                    className="w-full will-change-transform"
                    style={{
                      backgroundImage: "url(" + src + ")",
                      backgroundSize: "cover",
                      backgroundPosition: "50% 0",
                      paddingBottom: imageRatio + "%",
                    }}
                  />
                </div>
              </figure>
            );
          })}
        </div>
      </div>

      {showCursor ? (
        <svg
          ref={cursorRef}
          className="isg-cursor"
          width={cursorSize}
          height={cursorSize}
          viewBox={"0 0 " + cursorSize + " " + cursorSize}
        >
          <circle
            cx={cursorSize / 2}
            cy={cursorSize / 2}
            r={cursorSize / 4}
            fill={cursorColor}
            opacity="0.7"
          />
        </svg>
      ) : null}
    </div>
  );
}
