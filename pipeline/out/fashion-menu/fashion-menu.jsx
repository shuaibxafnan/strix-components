"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    name: "Lidia Slater",
    subtitle: "Fashion Week Luxembourg",
    imgUrl: "https://source.unsplash.com/m663zRzRe40/300x400",
  },
  {
    name: "Selina Galvan",
    subtitle: "Milano Fashion Week",
    imgUrl: "https://source.unsplash.com/8gGUMSQQz0E/300x400",
  },
  {
    name: "Selina Galvan",
    subtitle: "London Amber Convention",
    imgUrl: "https://source.unsplash.com/42e14e_DSWE/300x400",
  },
  {
    name: "Jennifer Roth",
    subtitle: "Lisbon Fashion Show",
    imgUrl: "https://source.unsplash.com/4nulm-JUYFo/300x400",
  },
  {
    name: "Lindsay Mcgee",
    subtitle: "2019 New York Trends",
    imgUrl: "https://source.unsplash.com/AtrTXQnbxI4/300x400",
  },
  {
    name: "Arielle Kearney",
    subtitle: "Rotterdam Fashion 2020",
    imgUrl: "https://source.unsplash.com/q5Xd4lzxE0g/300x400",
  },
  {
    name: "Phebe Moon",
    subtitle: "Fashion Week Napoli",
    imgUrl: "https://source.unsplash.com/ZG3AlXw9FB0/300x400",
  },
  {
    name: "Tala Johns",
    subtitle: "Stockolm Fashion",
    imgUrl: "https://source.unsplash.com/u6LGX2VMOP4/300x400",
  },
  {
    name: "Elina Clarkson",
    subtitle: "2020 Roma Fashion",
    imgUrl: "https://source.unsplash.com/tLKOj6cNwe0/300x400",
  },
  {
    name: "Weronika Irwin",
    subtitle: "Ukrainian Fashion Center",
    imgUrl: "https://source.unsplash.com/LyeduBb2Auk/300x400",
  },
];
function buildStyles(
  fontFamily,
  menuPaddingLeft,
  counterLeft,
  textColor,
  itemFontSize,
  subFontSize,
) {
  return (
    "html { height: 100%; overflow: hidden; }" +
    "body { height: 100%; overflow: hidden; margin: 0; }" +
    ".fm-scroll-root {" +
    "  position: fixed;" +
    "  inset: 0;" +
    "  overflow-y: auto;" +
    "  overflow-x: hidden;" +
    "}" +
    ".menu-item {" +
    "  display: flex;" +
    "  flex-direction: column;" +
    "  align-items: flex-start;" +
    "  position: relative;" +
    "  padding-left: " +
    menuPaddingLeft +
    ";" +
    "  counter-increment: menucounter;" +
    "}" +
    ".menu-item::before {" +
    "  content: counters(menucounter, '.', decimal-leading-zero);" +
    "  position: absolute;" +
    "  top: -25%;" +
    "  left: " +
    counterLeft +
    ";" +
    "  transform: translateX(1rem);" +
    "  height: 100%;" +
    "  display: flex;" +
    "  align-items: center;" +
    "  font-weight: bold;" +
    "  font-size: 8vw;" +
    "  font-family: '" +
    fontFamily +
    "', serif;" +
    "  transition: transform 0.2s, opacity 0.08s;" +
    "  color: " +
    textColor +
    ";" +
    "  opacity: 0;" +
    "  pointer-events: none;" +
    "}" +
    ".menu-item:hover::before { opacity: 0.2; transform: translateX(0); }" +
    ".menu-item:hover .item-innertext { color: " +
    textColor +
    "; }" +
    ".menu-item:hover .item-sub { opacity: 1; transform: translateX(0); }" +
    ".menu-item:hover .item-sub .char { transform: translate(0) rotate(0); opacity: 1; }" +
    ".item-text {" +
    "  position: relative;" +
    "  cursor: pointer;" +
    "  display: block;" +
    "  overflow: hidden;" +
    "  padding: 1vh 0;" +
    "  font-size: " +
    itemFontSize +
    ";" +
    "}" +
    ".item-innertext {" +
    "  display: block;" +
    "  font-family: '" +
    fontFamily +
    "', serif;" +
    "  font-weight: 300;" +
    "  text-transform: uppercase;" +
    "  white-space: nowrap;" +
    "  color: transparent;" +
    "  -webkit-text-stroke: 2px " +
    textColor +
    ";" +
    "  transition: color 0.05s;" +
    "  mix-blend-mode: screen;" +
    "  transform: translateY(200%);" +
    "}" +
    ".item-sub {" +
    "  display: flex;" +
    "  text-transform: uppercase;" +
    "  font-weight: bold;" +
    "  font-family: sans-serif;" +
    "  white-space: nowrap;" +
    "  position: relative;" +
    "  overflow: hidden;" +
    "  mix-blend-mode: difference;" +
    "  font-size: " +
    subFontSize +
    ";" +
    "}" +
    ".item-sub .word:not(:first-child) { margin-left: 0.5ch; }" +
    ".item-sub .char {" +
    "  --char-delay: 6ms;" +
    "  display: inline-block;" +
    "  transform: translateY(-100%) rotate(-15deg);" +
    "  opacity: 0;" +
    "  transition: transform 0.25s ease-in-out, opacity 0.3s;" +
    "  transition-delay: calc(0ms + var(--char-index) * var(--char-delay));" +
    "}" +
    ".noisy-bg::before {" +
    "  content: '';" +
    "  position: fixed;" +
    "  opacity: 0.015;" +
    "  width: 300%;" +
    "  height: 300%;" +
    "  left: -110%;" +
    "  top: -110%;" +
    "  animation: grain 8s steps(10) infinite;" +
    "  background-image: url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");" +
    "}" +
    "@keyframes grain {" +
    "  0%, to { transform: translate(0); }" +
    "  10%  { transform: translate(-5%, -10%); }" +
    "  20%  { transform: translate(-15%, 5%); }" +
    "  30%  { transform: translate(7%, -25%); }" +
    "  40%  { transform: translate(-5%, 25%); }" +
    "  50%  { transform: translate(-15%, 10%); }" +
    "  60%  { transform: translate(15%); }" +
    "  70%  { transform: translateY(15%); }" +
    "  80%  { transform: translate(3%, 35%); }" +
    "  90%  { transform: translate(-10%, 10%); }" +
    "}" +
    "@media (any-pointer: fine) { .fancy-cursor { display: block !important; } }" +
    "@media screen and (max-width: 54em) {" +
    "  .nav-menu { padding-top: 10rem !important; padding-bottom: 10rem !important; }" +
    "  .menu-item { flex: none; padding-left: 6rem; }" +
    "  .menu-item::before { top: -5%; left: 1%; }" +
    "  .item-text { padding: 0.5rem; font-size: 6vw !important; }" +
    "  .item-sub { display: none !important; }" +
    "}"
  );
}

export default function FashionMenu({
  bgColor = "#111111",
  textColor = "#e4e4e4",
  fontFamily = "Notable",
  menuPaddingY = "20vh",
  menuPaddingLeft = "25vw",
  counterLeft = "18%",
  itemFontSize = "4vw",
  subFontSize = "0.85rem",
  imageWidth = 200,
  imageHeight = 300,
  cursorFill = "#e2e2e2",
  cursorStroke = "#dddddd",
  cursorStrokeWidth = 2,
  largeCursorLag = 0.4,
  showNoiseBg = true,
  items = DEFAULT_ITEMS,
  ariaLabel = "Fashion models navigation",
  className = "",
}) {
  const menuRef = useRef(null);
  const smallCursorRef = useRef(null);
  const largeCursorRef = useRef(null);
  const stateRef = useRef({
    mousePos: { x: 0, y: 0 },
    mousePosCache: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
  });

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    const loadFont = function (family) {
      const id = "gfont-" + family.replace(/\s+/g, "-");
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=" +
        encodeURIComponent(family) +
        "&display=swap";
      document.head.appendChild(link);
    };

    loadFont(fontFamily);

    Promise.all([import("gsap"), import("splitting")])
      .then(function (mods) {
        const gsap = mods[0].gsap || mods[0].default;
        const Splitting = mods[1].default;
        if (cancelled || !gsap || !Splitting || !menuRef.current) return;

        gsap.config({ trialWarn: false });
        menuRef.current.querySelectorAll(".item-sub").forEach(function (el) {
          Splitting({ target: el, by: "chars" });
        });
        const map = function (x, a, b, c, d) {
          return ((x - a) * (d - c)) / (b - a) + c;
        };
        const lerp = function (a, b, n) {
          return (1 - n) * a + n * b;
        };
        const clamp = function (num, min, max) {
          return num <= min ? min : num >= max ? max : num;
        };
        const setupMenuItem = function (itemEl) {
          const card = document.createElement("div");
          card.className = "image-card";
          card.style.cssText =
            "position:absolute;z-index:-1;width:" +
            imageWidth +
            "px;height:" +
            imageHeight +
            "px;top:0;left:0;pointer-events:none;";

          const cardInner = document.createElement("div");
          cardInner.style.cssText = "width:100%;height:100%;position:relative;";

          const cardImage = document.createElement("div");
          cardImage.style.cssText =
            "width:100%;height:100%;position:relative;" +
            "background-size:cover;background-position:50% 50%;" +
            "opacity:0;background-image:url(" +
            itemEl.dataset.img +
            ");";

          cardInner.appendChild(cardImage);
          card.appendChild(cardInner);
          itemEl.appendChild(card);
          const props = {
            tx: { previous: 0, current: 0, amt: 0.1 },
            ty: { previous: 0, current: 0, amt: 0.1 },
            rotation: { previous: 0, current: 0, amt: 0.08 },
            skewx: { previous: 0, current: 0, amt: 0.08 },
            brightness: { previous: 1, current: 1, amt: 0.08 },
            saturation: { previous: 0, current: 0, amt: 0.1 },
          };

          let rafId;
          let firstRaf = false;
          let bounds = {
            el: { left: 0, top: 0 },
            card: { width: imageWidth, height: imageHeight },
          };
          const calcBounds = function () {
            bounds = {
              el: itemEl.getBoundingClientRect(),
              card: card.getBoundingClientRect(),
            };
          };

          const showImage = function () {
            gsap.killTweensOf(cardInner);
            gsap.killTweensOf(cardImage);
            const dir = stateRef.current.direction;
            gsap
              .timeline({
                onStart: function () {
                  itemEl.style.zIndex = itemEl.children.length;
                },
              })
              .to(cardInner, {
                duration: 0.8,
                ease: "elastic.out(1, 0.75)",
                transformOrigin: "50% " + (dir.y < 0 ? "-20%" : "120%"),
                startAt: { rotation: (dir.x < 0 ? "+" : "-") + "25deg" },
                rotation: 0,
              })
              .to(
                cardImage,
                {
                  duration: 0.2,
                  ease: "Sine.easeOut",
                  startAt: { opacity: 0, scale: 0.6 },
                  opacity: 1,
                  scale: 1,
                },
                0,
              );
          };

          const hideImage = function () {
            gsap.killTweensOf(cardInner);
            gsap.killTweensOf(cardImage);
            const dir = stateRef.current.direction;
            gsap
              .timeline({
                onStart: function () {
                  itemEl.style.zIndex = 1;
                },
              })
              .to(cardInner, {
                duration: 0.8,
                ease: "elastic.out(1, 0.75)",
                transformOrigin: "50% " + (dir.y < 0 ? "-20%" : "120%"),
                rotation: (dir.x < 0 ? "+" : "-") + "25deg",
              })
              .to(
                cardImage,
                {
                  duration: 0.2,
                  ease: "Sine.easeOut",
                  opacity: 0,
                  scale: 0.6,
                },
                0,
              );
          };

          const updateProps = function () {
            const state = stateRef.current;
            const mouseDistanceX = clamp(
              Math.abs(state.mousePosCache.x - state.mousePos.x),
              0,
              100,
            );
            props.tx.current =
              state.mousePos.x - bounds.el.left - imageWidth / 2;
            props.ty.current =
              state.mousePos.y - bounds.el.top - imageHeight / 2;

            const dir = state.direction;
            props.rotation.current = firstRaf
              ? 0
              : map(mouseDistanceX, 0, 100, 0, dir.x < 0 ? 30 : -30);
            props.skewx.current = firstRaf
              ? 0
              : map(mouseDistanceX, 0, 100, 1, dir.x < 0 ? -60 : 60);
            props.brightness.current = firstRaf
              ? 1
              : map(mouseDistanceX, 0, 100, 1, 10);
            props.saturation.current = firstRaf
              ? 1
              : map(mouseDistanceX, 0, 100, 1, 8);

            for (const key in props) {
              props[key].previous = firstRaf
                ? props[key].current
                : lerp(props[key].previous, props[key].current, props[key].amt);
            }
          };

          const render = function () {
            rafId = undefined;
            calcBounds();

            updateProps();

            const state = stateRef.current;
            stateRef.current.direction = {
              x: state.mousePosCache.x - state.mousePos.x,
              y: state.mousePosCache.y - state.mousePos.y,
            };
            stateRef.current.mousePosCache = {
              x: state.mousePos.x,
              y: state.mousePos.y,
            };

            gsap.set(card, {
              x: props.tx.previous,
              y: props.ty.previous,
              rotation: props.rotation.previous,
              skewX: props.skewx.previous,
              filter:
                "brightness(" +
                props.brightness.previous +
                ") saturate(" +
                props.saturation.previous +
                ")",
            });

            firstRaf = false;
            renderLoop();
          };

          const renderLoop = function () {
            if (!rafId) {
              rafId = requestAnimationFrame(render);
            }
          };

          const stopRender = function () {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = undefined;
            }
          };

          const onEnter = function () {
            showImage();
            firstRaf = true;
            renderLoop();
          };
          const onLeave = function () {
            stopRender();
            hideImage();
          };
          itemEl.addEventListener("mouseenter", onEnter);
          itemEl.addEventListener("mouseleave", onLeave);
          cleanups.push(function () {
            itemEl.removeEventListener("mouseenter", onEnter);
            itemEl.removeEventListener("mouseleave", onLeave);
            stopRender();
            gsap.killTweensOf([card, cardInner, cardImage]);
            card.remove();
          });
        };
        menuRef.current.querySelectorAll(".menu-item").forEach(setupMenuItem);
        const menuEl = menuRef.current;
        gsap.to(menuEl, { opacity: 1, duration: 0.1 });
        const innerTexts = menuEl.querySelectorAll(".item-innertext");
        cleanups.push(function () {
          gsap.killTweensOf(menuEl);
          gsap.killTweensOf(innerTexts);
        });
        gsap.fromTo(
          innerTexts,
          {
            rotation: function (i) {
              return i % 2 === 0 ? 15 : -15;
            },
          },
          {
            duration: 1.2,
            ease: "Expo.easeOut",
            transformOrigin: function (i) {
              return i % 2 === 0 ? "left bottom" : "right bottom";
            },
            y: 0,
            rotation: 0,
            delay: function (pos) {
              return 0.15 + pos * 0.06;
            },
          },
        );
        const smallCursor = smallCursorRef.current;
        const largeCursor = largeCursorRef.current;

        if (smallCursor && largeCursor) {
          const smallBounds = smallCursor.getBoundingClientRect();
          const largeBounds = largeCursor.getBoundingClientRect();

          const handleMouseMove = function (e) {
            stateRef.current.mousePosCache = {
              x: stateRef.current.mousePos.x,
              y: stateRef.current.mousePos.y,
            };
            stateRef.current.mousePos = { x: e.clientX, y: e.clientY };

            gsap.to(smallCursor, {
              duration: 0,
              opacity: 1,
              x: e.clientX - smallBounds.width / 2,
              y: e.clientY - smallBounds.height / 2,
            });
            gsap.to(largeCursor, {
              duration: largeCursorLag,
              opacity: 1,
              x: e.clientX - largeBounds.width / 2,
              y: e.clientY - largeBounds.height / 2,
            });
          };

          window.addEventListener("mousemove", handleMouseMove);
          cleanups.push(function () {
            window.removeEventListener("mousemove", handleMouseMove);
            gsap.killTweensOf([smallCursor, largeCursor]);
          });
        }
      })
      .catch(function (e) {
        console.error("[FashionMenu] setup failed:", e.message);
      });
    return function () {
      cancelled = true;
      cleanups.forEach(function (fn) {
        fn();
      });
    };
  }, [fontFamily, imageWidth, imageHeight, largeCursorLag]);
  const scopedCSS = buildStyles(
    fontFamily,
    menuPaddingLeft,
    counterLeft,
    textColor,
    itemFontSize,
    subFontSize,
  );

  return (
    <div
      className={"fm-scroll-root" + (className ? " " + className : "")}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />
      {showNoiseBg && (
        <div
          className="noisy-bg fixed inset-0 z-[-1] pointer-events-none"
          aria-hidden="true"
        />
      )}
      <nav
        ref={menuRef}
        className="nav-menu w-full relative select-none opacity-0"
        style={{
          paddingTop: menuPaddingY,
          paddingBottom: menuPaddingY,
          counterReset: "menucounter",
        }}
        aria-label={ariaLabel}
      >
        {items.map(function (item, i) {
          return (
            <a
              key={i}
              className="menu-item"
              data-img={item.imgUrl}
              style={{ cursor: "pointer" }}
              role="link"
              tabIndex={0}
              aria-label={item.name + " — " + item.subtitle}
            >
              <span className="item-text">
                <span className="item-innertext">{item.name}</span>
              </span>
              <span className="item-sub">{item.subtitle}</span>
            </a>
          );
        })}
      </nav>
      <svg
        ref={smallCursorRef}
        className="fancy-cursor fixed top-0 left-0 pointer-events-none z-50 hidden opacity-0"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r="5"
          style={{ fill: cursorFill, opacity: 0.5 }}
        />
      </svg>

      <svg
        ref={largeCursorRef}
        className="fancy-cursor fixed top-0 left-0 pointer-events-none z-50 hidden opacity-0"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r="20"
          style={{
            fill: "none",
            stroke: cursorStroke,
            strokeWidth: cursorStrokeWidth,
            opacity: 0.5,
          }}
        />
      </svg>
    </div>
  );
}
