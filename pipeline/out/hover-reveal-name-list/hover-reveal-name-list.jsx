"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    title: "Maria Costa",
    sub: "Style Reset 66 Berlin",
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Lana Ferrari",
    sub: "Fashion Week Milano",
    image:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Franklin Roth",
    sub: "Amber Convention London",
    image:
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Cristie Noe",
    sub: "Tokyo Summer Trends",
    image:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Wilma Quest",
    sub: "2021 West End New York",
    image:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Gary Winston",
    sub: "Sunset Festival Greenwich",
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Nesta Freeman",
    sub: "Spirit Garments Jakarta",
    image:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Jolanda French",
    sub: "Bluehouse Fashion Toronto",
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Samantha Dunne",
    sub: "Glamour Week Christchurch",
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Tony Albert",
    sub: "Piu Bella Fashion Rome",
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Jacky Speed",
    sub: "Sea Season Kuala Lumpur",
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Carlton Holle",
    sub: "Inspire Fashion Casablanca",
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Kylla Maushet",
    sub: "One to Ten Moscow",
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Fernando Castello",
    sub: "Miksa Style Week Lisbon",
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Sofie Henriette",
    sub: "Free Fashion Budapest",
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Adelie Bisset",
    sub: "Couture Night Paris",
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Takato Yang",
    sub: "Modern Touch Hong Kong",
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Hadrian Kaiser",
    sub: "Neverland Fashion Madrid",
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  },
];

const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);

export default function HoverRevealNameList({
  items = DEFAULT_ITEMS,
  bgColor = "#edeee9",
  textColor = "#111",
  menuColor = "#000",
  menuHoverColor = "#f32015",
  fontHref = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Archivo:wght@500;600&display=swap",
  titleFontFamily = '"Bodoni Moda", "Didot", "Times New Roman", serif',
  bodyFontFamily = '"Archivo", "Helvetica Neue", Arial, sans-serif',
  titleLetterSpacing = "-0.02em",
  subLetterSpacing = "0.12em",
  titleFontSize = "4vw",
  titleFontSizeSm = "6vw",
  imageWidth = 220,
  imageHeight = 320,
  revealDuration = 0.2,
  lerpAmount = 0.08,
  maxRotation = 60,
  maxBrightness = 4,
  mouseSpeedClamp = 100,
  introDuration = 1.2,
  introStagger = 0.06,
  showCursor = true,
  cursorSize = 80,
  cursorRadius = 20,
  cursorFill = "#000",
  cursorStroke = "#000",
  cursorStrokeWidth = 1,
  cursorOpacity = 0.3,
  cursorLerp = 0.2,
  showIndex = true,
  showSub = true,
  className = "",
}) {
  const rawId = useId();
  const uid = "hrnl-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!fontHref) return;
    if (document.querySelector('link[data-id="' + fontHref + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontHref;
    link.setAttribute("data-id", fontHref);
    document.head.appendChild(link);
  }, [fontHref]);

  useEffect(() => {
    let disposed = false;
    const cleanups = [];

    import("gsap")
      .then((mod) => {
        const gsap = mod.gsap || mod.default;
        const root = rootRef.current;
        if (disposed || !gsap || !root) return;

        let mouse = { x: 0, y: 0 };
        let mouseCache = { x: 0, y: 0 };
        let direction = { x: 0, y: 0 };

        const onMouseMove = (ev) => {
          mouse = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("mousemove", onMouseMove);
        cleanups.push(() =>
          window.removeEventListener("mousemove", onMouseMove),
        );

        const props = {
          tx: { previous: 0, current: 0, amt: lerpAmount },
          ty: { previous: 0, current: 0, amt: lerpAmount },
          rotation: { previous: 0, current: 0, amt: lerpAmount },
          brightness: { previous: 1, current: 1, amt: lerpAmount },
        };

        const itemEls = [...root.querySelectorAll("[data-menu-item]")];
        const inners = itemEls.map((el) =>
          el.querySelector("[data-text-inner]"),
        );

        itemEls.forEach((el) => {
          const reveal = el.querySelector("[data-reveal]");
          const revealInner = el.querySelector("[data-reveal-inner]");
          const revealImage = el.querySelector("[data-reveal-image]");
          let requestId;
          let firstCycle = true;
          let bounds = null;

          const render = () => {
            requestId = undefined;
            if (firstCycle) {
              bounds = {
                el: el.getBoundingClientRect(),
                reveal: reveal.getBoundingClientRect(),
              };
            }

            const distX = clamp(
              Math.abs(mouseCache.x - mouse.x),
              0,
              mouseSpeedClamp,
            );
            direction = {
              x: mouseCache.x - mouse.x,
              y: mouseCache.y - mouse.y,
            };
            mouseCache = { x: mouse.x, y: mouse.y };

            props.tx.current =
              Math.abs(mouse.x - bounds.el.left) - bounds.reveal.width / 2;
            props.ty.current =
              Math.abs(mouse.y - bounds.el.top) - bounds.reveal.height / 2;
            props.rotation.current = firstCycle
              ? 0
              : map(
                  distX,
                  0,
                  mouseSpeedClamp,
                  0,
                  direction.x < 0 ? maxRotation : -maxRotation,
                );
            props.brightness.current = firstCycle
              ? 1
              : map(distX, 0, mouseSpeedClamp, 1, maxBrightness);

            for (const key in props) {
              props[key].previous = firstCycle
                ? props[key].current
                : lerp(props[key].previous, props[key].current, props[key].amt);
            }

            gsap.set(reveal, {
              x: props.tx.previous,
              y: props.ty.previous,
              rotation: props.rotation.previous,
              filter: "brightness(" + props.brightness.previous + ")",
            });

            firstCycle = false;
            loopRender();
          };

          const loopRender = () => {
            if (!requestId) requestId = requestAnimationFrame(render);
          };

          const stopRendering = () => {
            if (requestId) {
              cancelAnimationFrame(requestId);
              requestId = undefined;
            }
          };

          const onEnter = () => {
            gsap.killTweensOf(revealInner);
            gsap.killTweensOf(revealImage);
            gsap
              .timeline({
                onStart: () => {
                  reveal.style.opacity = 1;
                  gsap.set(el, { zIndex: itemEls.length });
                },
              })
              .to(revealInner, {
                duration: revealDuration,
                ease: "sine.out",
                startAt: { x: direction.x < 0 ? "-100%" : "100%" },
                x: "0%",
              })
              .to(
                revealImage,
                {
                  duration: revealDuration,
                  ease: "sine.out",
                  startAt: { x: direction.x < 0 ? "100%" : "-100%" },
                  x: "0%",
                },
                0,
              );
            firstCycle = true;
            loopRender();
          };

          const onLeave = () => {
            stopRendering();
            gsap.killTweensOf(revealInner);
            gsap.killTweensOf(revealImage);
            gsap
              .timeline({
                onStart: () => {
                  gsap.set(el, { zIndex: 1 });
                },
                onComplete: () => {
                  gsap.set(reveal, { opacity: 0 });
                },
              })
              .to(revealInner, {
                duration: revealDuration,
                ease: "sine.out",
                x: direction.x < 0 ? "100%" : "-100%",
              })
              .to(
                revealImage,
                {
                  duration: revealDuration,
                  ease: "sine.out",
                  x: direction.x < 0 ? "-100%" : "100%",
                },
                0,
              );
          };

          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            stopRendering();
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf(revealInner);
            gsap.killTweensOf(revealImage);
          });
        });

        const intro = gsap.to(inners, {
          duration: introDuration,
          ease: "expo.out",
          startAt: { y: "100%" },
          y: 0,
          delay: (pos) => pos * introStagger,
        });
        cleanups.push(() => intro.kill());

        const cursorEl = cursorRef.current;
        if (cursorEl) {
          const cBounds = { width: cursorSize, height: cursorSize };
          const styles = {
            tx: { previous: 0, current: 0, amt: cursorLerp },
            ty: { previous: 0, current: 0, amt: cursorLerp },
          };
          let cursorRaf;
          const renderCursor = () => {
            styles.tx.current = mouse.x - cBounds.width / 2;
            styles.ty.current = mouse.y - cBounds.height / 2;
            for (const key in styles) {
              styles[key].previous = lerp(
                styles[key].previous,
                styles[key].current,
                styles[key].amt,
              );
            }
            cursorEl.style.transform =
              "translateX(" +
              styles.tx.previous +
              "px) translateY(" +
              styles.ty.previous +
              "px)";
            cursorRaf = requestAnimationFrame(renderCursor);
          };
          const startCursor = () => {
            styles.tx.previous = styles.tx.current =
              mouse.x - cBounds.width / 2;
            styles.ty.previous = styles.ty.current =
              mouse.y - cBounds.height / 2;
            gsap.to(cursorEl, {
              duration: 0.9,
              ease: "power3.out",
              opacity: 1,
            });
            cursorRaf = requestAnimationFrame(renderCursor);
            window.removeEventListener("mousemove", startCursor);
          };
          window.addEventListener("mousemove", startCursor);
          cleanups.push(() => {
            window.removeEventListener("mousemove", startCursor);
            if (cursorRaf) cancelAnimationFrame(cursorRaf);
            gsap.killTweensOf(cursorEl);
          });
        }
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    items,
    lerpAmount,
    revealDuration,
    maxRotation,
    maxBrightness,
    mouseSpeedClamp,
    introDuration,
    introStagger,
    showCursor,
    cursorSize,
    cursorLerp,
  ]);

  const css =
    "." +
    uid +
    " { counter-reset: menucounter; }" +
    "." +
    uid +
    " [data-menu-item]::before {" +
    "counter-increment: menucounter;" +
    'content: counters(menucounter, ".", decimal-leading-zero);' +
    "position: absolute; left: 0; border-left: 3px solid currentColor;" +
    "top: 20%; height: 60%; padding-left: 1rem; display: " +
    (showIndex ? "flex" : "none") +
    ";" +
    "align-items: center; line-height: 1; font-weight: 700; opacity: 0;" +
    "transform: translateX(-1rem); transition: transform .3s, opacity .3s;" +
    "font-family: " +
    bodyFontFamily +
    "; letter-spacing: " +
    subLetterSpacing +
    ";" +
    "font-size: 0.85rem; font-weight: 600; }" +
    "." +
    uid +
    " [data-menu-item]:hover::before { opacity: 1; transform: translateX(0); }" +
    "." +
    uid +
    " [data-menu-item]:hover [data-text-inner] { color: " +
    menuHoverColor +
    "; }" +
    "." +
    uid +
    " [data-menu-item]:hover [data-sub] { opacity: 1; transform: translateX(0); }" +
    "." +
    uid +
    " [data-sub]::before {" +
    'content: ""; position: absolute; left: 0; top: 15%; width: 1px; height: 70%;' +
    "background: currentColor; transform-origin: 0 100%;" +
    "transform: rotate(22.5deg) scale3d(1,0,1); transition: transform .3s; }" +
    "." +
    uid +
    " [data-menu-item]:hover [data-sub]::before { transform: rotate(22.5deg) scale3d(1,1,1); }" +
    "." +
    uid +
    " [data-title] { font-size: " +
    titleFontSizeSm +
    "; }" +
    "@media screen and (min-width: 53em) {" +
    "." +
    uid +
    " [data-title] { font-size: " +
    titleFontSize +
    "; padding: 1vh 0; }" +
    "." +
    uid +
    " [data-menu-item] { padding-left: 25vw; justify-content: flex-start; }" +
    "." +
    uid +
    " [data-sub] { display: flex; } }";

  return (
    <div
      ref={rootRef}
      className={
        "relative w-full min-h-screen overflow-x-clip " + uid + " " + className
      }
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="relative flex w-[90vw] flex-col select-none pt-40 pb-[20vh] text-right md:pt-[20vh]">
        {items.map((item, i) => (
          <a
            key={i}
            data-menu-item=""
            className="relative flex flex-none justify-end pl-20"
          >
            <span
              data-title=""
              className="relative block cursor-pointer overflow-hidden p-2"
            >
              <span
                data-text-inner=""
                className="block whitespace-nowrap uppercase font-light translate-y-full"
                style={{
                  fontFamily: titleFontFamily,
                  color: menuColor,
                  letterSpacing: titleLetterSpacing,
                }}
              >
                {item.title}
              </span>
            </span>

            {showSub ? (
              <span
                data-sub=""
                className="relative ml-8 hidden items-center whitespace-nowrap pl-12 text-[0.85rem] font-semibold uppercase opacity-0 -translate-x-4 transition-[transform,opacity] duration-300"
                style={{ letterSpacing: subLetterSpacing }}
              >
                {item.sub}
              </span>
            ) : null}

            <div
              data-reveal=""
              className="pointer-events-none absolute left-0 top-0 -z-10 opacity-0"
              style={{ width: imageWidth, height: imageHeight }}
            >
              <div
                data-reveal-inner=""
                className="relative h-full w-full overflow-hidden"
              >
                <div
                  data-reveal-image=""
                  className="relative h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url(" + item.image + ")" }}
                />
              </div>
            </div>
          </a>
        ))}
      </nav>

      {showCursor ? (
        <svg
          ref={cursorRef}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden opacity-0 [@media(any-pointer:fine)]:block"
          width={cursorSize}
          height={cursorSize}
          viewBox={"0 0 " + cursorSize + " " + cursorSize}
        >
          <circle
            cx={cursorSize / 2}
            cy={cursorSize / 2}
            r={cursorRadius}
            fill={cursorFill}
            stroke={cursorStroke}
            strokeWidth={cursorStrokeWidth}
            opacity={cursorOpacity}
          />
        </svg>
      ) : null}
    </div>
  );
}
