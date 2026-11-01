"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    number: "01",
    caption: "New York City, March 24",
    title: "Kanzu",
    meta: "New York City, March 24",
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
    copy: "A low room, the light arriving sideways through slatted glass, and the whole morning holding its breath before anything is decided.",
  },
  {
    number: "02",
    caption: "Acapulco, March 25",
    title: "Juked",
    meta: "Acapulco, March 25",
    image:
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
    copy: "The door swung on its hinge twice and the air that came in was brighter than the room deserved, carrying salt and the noise of an argument two streets down.",
  },
  {
    number: "03",
    caption: "Brisbane, March 26",
    title: "Colza",
    meta: "Brisbane, March 26",
    image:
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
    copy: "She listened without answering, which was its own kind of answer, and the field beyond the window went on being yellow in a way that felt deliberate.",
  },
  {
    number: "04",
    caption: "Berlin, March 27",
    title: "Voxey",
    meta: "Berlin, March 27",
    image:
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
    copy: "Collar stiff, tie in open rebellion, he addressed the room and the watchchain equally, demanding gloves nobody owned and boots nobody had seen.",
  },
  {
    number: "05",
    caption: "Lisbon, March 28",
    title: "Prend",
    meta: "Lisbon, March 28",
    image:
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
    copy: "Tiles the colour of old swimming pools, a staircase that changed its mind halfway up, and somewhere above it a radio playing to nobody.",
  },
  {
    number: "06",
    caption: "Reykjavik, March 29",
    title: "Sable",
    meta: "Reykjavik, March 29",
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
    copy: "Weather arrived as an opinion rather than a forecast, and by noon the horizon had been erased and politely redrawn a little closer in.",
  },
];

const arrowLeft = (c) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='61' height='44' viewBox='0 0 61 44'%3E%3Cpath fill='${encodeURIComponent(
    c,
  )}' d='M.613 21.671L21.584.7l5.642 5.642-11.74 11.74H60.45v7.978H15.487l11.74 11.739-5.643 5.642L.613 22.469a.57.57 0 0 1 0-.798z'/%3E%3C/svg%3E`;

const arrowRight = (c) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='61' height='44' viewBox='0 0 61 44'%3E%3Cpath fill='${encodeURIComponent(
    c,
  )}' d='M60.287 21.671L39.316.7l-5.642 5.642 11.74 11.74H.45v7.978h44.963l-11.74 11.739 5.643 5.642 20.971-20.972a.57.57 0 0 0 0-.798z'/%3E%3C/svg%3E`;

const plusCursor = (c) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'%3E%3Cpath fill='${encodeURIComponent(
    c,
  )}' d='M29.889 30.05l-.036 21.361c-.222.213-7.654.213-7.876 0l-.007-21.358-21.52.007v-7.978l21.518.036L21.96.571h7.978l-.037 21.56 21.388.037c.213.222.213 7.654 0 7.876l-21.401.007z'/%3E%3C/svg%3E`;

const closeCursor = (c) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'%3E%3Cpath fill='${encodeURIComponent(
    c,
  )}' d='M20.921 26.67L5.791 41.75C5.485 41.743.23 36.488.224 36.18L15.32 21.073.098 5.86 5.74.22l15.19 15.24L36.161.22l5.64 5.64-15.27 15.22 15.097 15.15c-.006.307-5.262 5.562-5.569 5.568L20.921 26.67z'/%3E%3C/svg%3E`;

const lineEq = (y2, y1, x2, x1, v) => {
  const m = (y2 - y1) / (x2 - x1);
  return m * v + (y1 - m * x1);
};
const lerp = (a, b, n) => (1 - n) * a + n * b;
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export default function SlideCrossroads({
  slides = DEFAULT_SLIDES,
  inclineAngle = -8,
  columnGap = "18vw",
  slideHeight = "35vw",
  bgColor = "#e6e6ea",
  textColor = "#5d5d5d",
  titleColor = "#000000",
  numberColor = "#000000",
  captionColor = "#000000",
  contentTitleColor = "#000000",
  contentMetaColor = "#000000",
  contentTextColor = "#000000",
  cursorColor = "#000000",
  titleFontSize = "10vw",
  numberFontSize = "4.25vw",
  contentTitleFontSize = "8vw",
  titleFontFamily = "Georgia, 'Times New Roman', serif",
  bodyFontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif",
  copyFontFamily = "Georgia, 'Times New Roman', serif",
  navDuration = 1.2,
  navSkewScale = 1.3,
  openDuration = 1,
  letterStagger = 0.04,
  letterFlyDistance = 600,
  hoverScale = 1.02,
  hoverImageScale = 1.05,
  parallaxAmount = 15,
  parallaxTitleFactor = 4,
  parallaxEase = 0.03,
  showRules = true,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = `cs-${uid}`;

  const rootRef = useRef(null);
  const slideRefs = useRef([]);
  const titleRefs = useRef([]);
  const contentRefs = useRef([]);
  const titlesInnerRef = useRef(null);
  const revealerRef = useRef(null);
  const zoneRefs = useRef({ left: null, center: null, right: null });

  useEffect(() => {
    let raf = 0;
    let disposed = false;
    const cleanups = [];

    import("gsap")
      .then((mod) => {
        const gsap = mod.gsap || mod.default;
        if (!gsap || disposed || !rootRef.current) return;
        gsap.config({ trialWarn: false });

        const total = slides.length;
        const items = slideRefs.current.slice(0, total).map((el, i) => {
          const titleEl = titleRefs.current[i];
          const letters = titleEl
            ? [...titleEl.querySelectorAll("[data-char]")]
            : [];
          letters.sort(() => Math.round(Math.random()) - 0.5);
          return {
            el,
            titleEl,
            letters,
            number: el.querySelector("[data-number]"),
            caption: el.querySelector("[data-caption]"),
            imgWrap: el.querySelector("[data-imgwrap]"),
            img: el.querySelector("[data-img]"),
          };
        });

        let center = 0;
        let animating = false;
        let gap = 0;
        let centerSlide, leftSlide, rightSlide;

        const POS = {
          left: `${s}-left`,
          center: `${s}-center`,
          right: `${s}-right`,
        };

        const place = (item, key) => {
          item.el.classList.add(POS[key]);
          item.titleEl.classList.add(POS[key]);
          gsap.set([item.el, item.titleEl], { opacity: 1 });
        };

        const resetItem = (item) => {
          gsap.set(
            [item.el, item.imgWrap, item.number, item.caption, item.titleEl],
            { clearProps: "transform" },
          );
          gsap.set([item.el, item.titleEl], { opacity: 0 });
          Object.values(POS).forEach((c) => {
            item.el.classList.remove(c);
            item.titleEl.classList.remove(c);
          });
        };

        const setVisible = () => {
          centerSlide = items[center];
          rightSlide = items[center + 1 <= total - 1 ? center + 1 : 0];
          leftSlide = items[center - 1 >= 0 ? center - 1 : total - 1];
          place(centerSlide, "center");
          place(rightSlide, "right");
          place(leftSlide, "left");
        };

        const calcGap = () => {
          const p = center === total - 1 ? center - 1 : center;
          const a = items[p].el.getBoundingClientRect();
          const b = items[p + 1].el.getBoundingClientRect();
          gap = Math.hypot(
            a.left + a.width / 2 - (b.left + b.width / 2),
            a.top + a.height / 2 - (b.top + b.height / 2),
          );
        };

        const move = (item, direction) =>
          new Promise((resolve) => {
            const tx = direction === "left" ? `+=${gap * -1}` : `+=${gap}`;
            const d = navDuration;
            gsap
              .timeline({ onComplete: resolve })
              .to(item.imgWrap, { duration: d, x: tx, ease: "power4.inOut" }, 0)
              .to(
                item.imgWrap,
                { duration: d * 0.5, scaleX: navSkewScale, ease: "power4.in" },
                0,
              )
              .to(
                item.imgWrap,
                { duration: d * 0.5, scaleX: 1, ease: "power4.out" },
                d * 0.5,
              )
              .to(
                item.number,
                { duration: d * 0.95, x: tx, ease: "power4.inOut" },
                0,
              )
              .to(
                item.caption,
                { duration: d * 1.1, x: tx, ease: "power4.inOut" },
                0,
              )
              .to(
                item.titleEl,
                { duration: d * 1.05, x: tx, ease: "power4.inOut" },
                0,
              );
          });

        const outElements = (item, isCenter, contentItem) =>
          new Promise((resolve) => {
            const t = rand(0, 100) / 500;
            const tl = gsap.timeline({ onComplete: resolve });
            tl.to(
              item.letters,
              {
                duration: 1,
                y: rand(letterFlyDistance / 2, letterFlyDistance),
                opacity: 0,
                ease: "power4.inOut",
                stagger: letterStagger,
              },
              t,
            )
              .to(
                item.letters,
                {
                  duration: 0.5,
                  scaleY: 2.2,
                  ease: "power4.in",
                  stagger: letterStagger,
                },
                t,
              )
              .to(
                item.letters,
                {
                  duration: 0.5,
                  scaleY: 1,
                  ease: "power4.out",
                  stagger: letterStagger,
                },
                t + 0.5,
              )
              .to(
                item.number,
                { duration: 1, y: -500, opacity: 0, ease: "power4.inOut" },
                t + 0.3,
              )
              .to(
                item.imgWrap,
                { duration: 0.8, y: -500, opacity: 0, ease: "power4.inOut" },
                t + 0.4,
              )
              .to(
                item.imgWrap,
                { duration: 0.4, scaleX: 0.95, scaleY: 1.4, ease: "power4.in" },
                t + 0.4,
              )
              .to(
                item.imgWrap,
                { duration: 0.4, scaleX: 1, scaleY: 1, ease: "power4.out" },
                t + 0.8,
              )
              .to(
                item.caption,
                { duration: 1, y: -500, opacity: 0, ease: "power4.inOut" },
                t + 0.5,
              );

            if (isCenter && contentItem) {
              const ct = contentItem.querySelector("[data-content-title]");
              const ci = contentItem.querySelector("[data-content-img]");
              tl.fromTo(
                ct,
                { y: "100%", opacity: 0, rotation: -16 },
                {
                  duration: 0.8,
                  y: "0%",
                  rotation: 0,
                  opacity: 1,
                  ease: "expo.out",
                },
                t + 1.3,
              )
                .set(ci, { scale: 1.2 }, 0)
                .to(ci, { duration: 0.8, scale: 1, ease: "expo.out" }, t + 1.3)
                .to(
                  revealerRef.current,
                  { duration: openDuration, y: "-100%", ease: "power4.out" },
                  t + 1.2,
                );
            }
          });

        const inElements = (item, isCenter, contentItem) =>
          new Promise((resolve) => {
            const t = rand(0, 50) / 500;
            const tl = gsap.timeline({ onComplete: resolve });
            if (isCenter && contentItem) {
              const ct = contentItem.querySelector("[data-content-title]");
              const ci = contentItem.querySelector("[data-content-img]");
              tl.to(
                ct,
                { duration: 1, y: "50%", opacity: 0, ease: "power4.out" },
                0,
              )
                .to(ci, { duration: 1, scale: 1.2, ease: "power4.out" }, 0)
                .to(
                  revealerRef.current,
                  { duration: openDuration, y: "0%", ease: "power4.out" },
                  0,
                );
            }
            tl.to(
              item.caption,
              { duration: 0.8, y: 0, opacity: 1, ease: "power4.out" },
              t,
            )
              .to(
                item.imgWrap,
                {
                  duration: 0.8,
                  y: 0,
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  ease: "power4.out",
                },
                t + 0.1,
              )
              .to(
                item.number,
                { duration: 0.8, y: 0, opacity: 1, ease: "power4.out" },
                t + 0.2,
              )
              .to(
                item.letters,
                {
                  duration: 0.8,
                  y: 0,
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  ease: "power4.out",
                  stagger: 0.03,
                },
                t + 0.1,
              );
          });

        const navigate = (direction) => {
          if (animating) return;
          animating = true;

          const upcomingPos =
            direction === "right"
              ? center < total - 2
                ? center + 2
                : Math.abs(total - 2 - center)
              : center >= 2
                ? center - 2
                : Math.abs(total - 2 + center);

          center =
            direction === "right"
              ? center < total - 1
                ? center + 1
                : 0
              : center > 0
                ? center - 1
                : total - 1;

          const upcoming = items[upcomingPos];
          const offset = direction === "right" ? gap * 2 : -1 * gap * 2;
          gsap.set([upcoming.el, upcoming.titleEl], { x: offset, opacity: 1 });

          const moving = [upcoming, centerSlide, rightSlide, leftSlide];
          Promise.all(
            moving.map((it) =>
              move(it, direction === "right" ? "left" : "right"),
            ),
          ).then(() => {
            moving.forEach(resetItem);
            setVisible();
            animating = false;
          });
        };

        const toggle = (action) => {
          if (animating) return;
          animating = true;
          const contentItem = contentRefs.current[center];
          rootRef.current.classList[action === "open" ? "add" : "remove"](
            `${s}-open`,
          );
          const moving = [centerSlide, rightSlide, leftSlide];
          if (action === "open")
            contentItem.classList.add(`${s}-content-current`);
          Promise.all(
            moving.map((it) =>
              action === "open"
                ? outElements(it, it === centerSlide, contentItem)
                : inElements(it, it === centerSlide, contentItem),
            ),
          ).then(() => {
            if (action === "close")
              contentItem.classList.remove(`${s}-content-current`);
            animating = false;
          });
        };

        setVisible();
        calcGap();

        const onRight = () => navigate("right");
        const onLeft = () => navigate("left");
        const onOpen = () => toggle("open");
        const onEnter = () => {
          if (animating) return;
          gsap
            .timeline()
            .to(centerSlide.imgWrap, {
              duration: 0.7,
              scale: hoverScale,
              ease: "expo.out",
            })
            .to(
              centerSlide.img,
              { duration: 1.7, scale: hoverImageScale, ease: "expo.out" },
              0,
            );
        };
        const onLeave = () => {
          if (animating) return;
          gsap
            .timeline()
            .to(centerSlide.imgWrap, {
              duration: 0.7,
              scale: 1,
              ease: "expo.out",
            })
            .to(
              centerSlide.img,
              { duration: 0.7, scale: 1, ease: "expo.out" },
              0,
            );
        };
        const onResize = () => calcGap();

        const z = zoneRefs.current;
        z.right?.addEventListener("click", onRight);
        z.left?.addEventListener("click", onLeft);
        z.center?.addEventListener("click", onOpen);
        z.center?.addEventListener("mouseenter", onEnter);
        z.center?.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", onResize);

        const closeHandlers = contentRefs.current
          .slice(0, total)
          .map((item) => {
            const hit = item.querySelector("[data-close]");
            const fn = () => toggle("close");
            hit?.addEventListener("click", fn);
            return () => hit?.removeEventListener("click", fn);
          });

        cleanups.push(() => {
          z.right?.removeEventListener("click", onRight);
          z.left?.removeEventListener("click", onLeft);
          z.center?.removeEventListener("click", onOpen);
          z.center?.removeEventListener("mouseenter", onEnter);
          z.center?.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", onResize);
          closeHandlers.forEach((fn) => fn());
        });

        let win = { w: window.innerWidth, h: window.innerHeight };
        let mouse = { x: win.w / 2, y: win.h / 2 };
        const onMouseMove = (ev) => {
          mouse = { x: ev.pageX ?? ev.clientX, y: ev.pageY ?? ev.clientY };
        };
        const onWinResize = () => {
          win = { w: window.innerWidth, h: window.innerHeight };
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("resize", onWinResize);
        cleanups.push(() => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("resize", onWinResize);
        });

        let drift = 0;
        const render = () => {
          drift = lerp(
            drift,
            lineEq(-parallaxAmount, parallaxAmount, win.w, 0, mouse.x),
            parallaxEase,
          );
          items.forEach((it) => gsap.set(it.img, { x: drift }));
          if (titlesInnerRef.current)
            gsap.set(titlesInnerRef.current, {
              x: -parallaxTitleFactor * drift,
            });
          raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);

        gsap.to(rootRef.current, { duration: 0.6, opacity: 1 });
      })
      .catch((e) =>
        console.error("[SlideCrossroads] GSAP load failed:", e.message),
      );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };

  }, [slides, navDuration, navSkewScale, openDuration, parallaxAmount]);

  const css = `
.${s}-grid{position:absolute;top:0;left:-5%;width:110%;height:100%;display:grid;grid-template-columns:repeat(3,calc((100% - ${columnGap} * 2) / 3));column-gap:${columnGap};}
.${s}-grid-titles{align-items:center;text-align:center;cursor:default;}
.${s}-grid-zones{left:0;width:100%;grid-template-columns:repeat(3,33.3333%);column-gap:0;}
.${s}-item{grid-row:1;grid-column:2;display:flex;justify-content:center;position:relative;pointer-events:none;opacity:0;will-change:transform;}
.${s}-left{grid-column:1;opacity:1;}
.${s}-center{grid-column:2;opacity:1;}
.${s}-right{grid-column:3;opacity:1;}
.${s}-zone{grid-row:1;pointer-events:auto;}
.${s}-zone-left{grid-column:1;cursor:url("${arrowLeft(cursorColor)}") 30 22, sw-resize;}
.${s}-zone-center{grid-column:2;cursor:url("${plusCursor(cursorColor)}") 26 26, crosshair;}
.${s}-zone-right{grid-column:3;cursor:url("${arrowRight(cursorColor)}") 30 22, ne-resize;}
.${s}-open .${s}-zone{display:none;}
.${s}-content-item{position:absolute;top:0;left:0;width:100%;height:100%;display:grid;align-items:center;grid-template-columns:30% 40% 30%;opacity:0;pointer-events:none;}
.${s}-content-current{opacity:1;pointer-events:auto;}
.${s}-content-img-wrap{grid-area:1 / 2 / 2 / 3;height:100%;overflow:hidden;position:relative;cursor:url("${closeCursor(cursorColor)}") 21 21, pointer;}
.${s}-content-header{grid-area:1 / 1 / 2 / 3;justify-self:center;pointer-events:none;padding:2rem 2rem 0;}
.${s}-content-copy{grid-column:3;max-width:260px;justify-self:end;text-align:right;padding:2rem;}
.${s}-rule::before{content:'---------';margin:0 .5rem 0 0;letter-spacing:-.15rem;}
.${s}-char{display:inline-block;will-change:transform;}
`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={rootRef}
        className={`relative w-full h-screen overflow-hidden opacity-0 ${className}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: bodyFontFamily,
        }}
      >
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <article
              key={`content-${i}`}
              ref={(el) => (contentRefs.current[i] = el)}
              className={`${s}-content-item`}
              style={{ backgroundColor: bgColor }}
            >
              <div className={`${s}-content-img-wrap`} data-close>
                <div
                  data-content-img
                  className="absolute top-0 h-full"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "50% 38%",
                    width: "calc(100% + 40px)",
                    left: "-20px",
                  }}
                />
              </div>
              <header className={`${s}-content-header`}>
                <span
                  className={`block text-sm tracking-wide ${
                    showRules ? `${s}-rule` : ""
                  }`}
                  style={{ color: contentMetaColor }}
                >
                  {slide.meta}
                </span>
                <h2
                  data-content-title
                  className="m-0 font-semibold leading-none"
                  style={{
                    fontFamily: titleFontFamily,
                    fontSize: contentTitleFontSize,
                    color: contentTitleColor,
                  }}
                >
                  {slide.title}
                </h2>
              </header>
              <div
                className={`${s}-content-copy`}
                style={{ fontFamily: copyFontFamily, color: contentTextColor }}
              >
                <p className="m-0 leading-relaxed">{slide.copy}</p>
              </div>
            </article>
          ))}
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: `rotate(${inclineAngle}deg)` }}
        >
          <div
            ref={revealerRef}
            className="relative flex-none w-[200%] h-[200%] will-change-transform"
            style={{ backgroundColor: bgColor }}
          />
        </div>

        <div
          className="absolute inset-0"
          style={{ transform: `rotate(${inclineAngle}deg)` }}
        >
          <div className={`${s}-grid`}>
            {slides.map((slide, i) => (
              <figure
                key={`slide-${i}`}
                ref={(el) => (slideRefs.current[i] = el)}
                className={`${s}-item flex-col w-full m-0`}
              >
                <span
                  data-number
                  className="font-bold leading-none mb-2 will-change-transform"
                  style={{
                    fontSize: numberFontSize,
                    WebkitTextStroke: `1.5px ${numberColor}`,
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  {slide.number}
                </span>
                <div
                  data-imgwrap
                  className="relative w-full overflow-hidden will-change-transform"
                  style={{ height: slideHeight }}
                >
                  <div
                    data-img
                    className="absolute top-0 h-full pointer-events-none will-change-transform"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "50% 50%",
                      width: "calc(100% + 40px)",
                      left: "-20px",
                    }}
                  />
                </div>
                <figcaption
                  data-caption
                  className={`mt-3 text-xs font-normal uppercase tracking-[0.1rem] will-change-transform ${
                    showRules ? `${s}-rule` : ""
                  }`}
                  style={{ color: captionColor }}
                >
                  {slide.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <div
            className="absolute inset-0 z-[1000] pointer-events-none"
            style={{ transform: `rotate(${inclineAngle * -2}deg)` }}
          >
            <div ref={titlesInnerRef} className={`${s}-grid ${s}-grid-titles`}>
              {slides.map((slide, i) => (
                <h3
                  key={`title-${i}`}
                  ref={(el) => (titleRefs.current[i] = el)}
                  className={`${s}-item m-0 font-semibold`}
                  style={{
                    fontFamily: titleFontFamily,
                    fontSize: titleFontSize,
                    color: titleColor,
                  }}
                >
                  {slide.title.split("").map((ch, k) => (
                    <span key={k} data-char className={`${s}-char`}>
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  ))}
                </h3>
              ))}
            </div>
          </div>

          <div className={`${s}-grid ${s}-grid-zones`}>
            <div
              ref={(el) => (zoneRefs.current.left = el)}
              className={`${s}-zone ${s}-zone-left`}
            />
            <div
              ref={(el) => (zoneRefs.current.center = el)}
              className={`${s}-zone ${s}-zone-center`}
            />
            <div
              ref={(el) => (zoneRefs.current.right = el)}
              className={`${s}-zone ${s}-zone-right`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
