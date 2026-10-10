"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── InlineMenuLayout ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// categories         array    (see DEFAULT_CATEGORIES)  [{ label, cover, items:[{title, meta, image}] }]
// bgColor            string   #D5D7CE   Page background
// textColor          string   #000      Base text color
// accentColor        string   #e63811   Hover / accent color
// fontHref           string   (Google Fonts URL) Stylesheet injected for the fonts below
// titleFontFamily    string   "Bodoni Moda", serif   Display font for menu + titles
// bodyFontFamily     string   "Archivo", sans-serif  Font for numbers and meta
// titleLetterSpacing string   -0.02em   Tracking for display text
// metaLetterSpacing  string   0.12em    Tracking for numbers and meta lines
// menuFontSize       string   clamp(2rem,8vw,4.75rem)    Menu item size
// contentFontSize    string   clamp(3rem,9vw,6rem)       Content heading size
// hoverImageWidth    number   300       Hover image width on desktop (px)
// hoverImageHeight   number   400       Hover image height on desktop (px)
// hoverImageWidthSm  number   150       Hover image width on mobile (px)
// hoverImageHeightSm number   200       Hover image height on mobile (px)
// lerpAmount         number   0.08      Interpolation amount for image follow
// rotationLerp       number   0.05      Interpolation amount for image rotation
// maxRotation        number   100       Max image rotation from mouse speed (deg)
// mouseSpeedClamp    number   200       Mouse delta range used for the mapping
// revealDuration     number   0.8       Hover image show/hide duration (s)
// transitionDuration number   1         Menu to content transition duration (s)
// backDuration       number   0.4       Content to menu transition duration (s)
// galleryMinWidth    number   175       Minimum gallery column width (px)
// galleryGap         string   2.5rem    Gap between gallery items
// showCursor         boolean  true      Show the custom circular cursor
// cursorSize         number   30        Cursor svg size (px)
// cursorRadius       number   7.5       Cursor circle radius
// cursorStroke       string   #000      Cursor stroke color
// cursorStrokeWidth  number   1         Cursor stroke width (px)
// cursorLerp         number   0.2       Cursor follow interpolation amount
// cursorHoverScale   number   2         Cursor scale over interactive elements
// cursorHoverOpacity number   0.3       Cursor opacity over interactive elements
// className          string   ""        Extra classes for the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
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

const DEFAULT_CATEGORIES = [
  {
    label: "sirens",
    cover: IMAGES[0],
    items: [
      { title: "Girl in pink", meta: "2016, Paris", image: IMAGES[0] },
      { title: "Overdose", meta: "2015, Bologna", image: IMAGES[1] },
      { title: "Premiere", meta: "2014, Brno", image: IMAGES[2] },
      { title: "Face paint", meta: "2011, Copenhagen", image: IMAGES[3] },
      { title: "Recursive", meta: "2010, Berlin", image: IMAGES[4] },
    ],
  },
  {
    label: "convoys",
    cover: IMAGES[5],
    items: [
      { title: "Fantasia", meta: "2015, Rome", image: IMAGES[5] },
      { title: "Greenery", meta: "2016, Berlin", image: IMAGES[6] },
      { title: "Freaky", meta: "2017, Davos", image: IMAGES[7] },
      { title: "Shannon", meta: "2018, Sydney", image: IMAGES[8] },
    ],
  },
  {
    label: "screens",
    cover: IMAGES[9],
    items: [
      { title: "Big Ben", meta: "2013, London", image: IMAGES[9] },
      { title: "Cranky", meta: "2014, Budapest", image: IMAGES[10] },
      { title: "Love Horse", meta: "2015, Belgrade", image: IMAGES[11] },
    ],
  },
  {
    label: "alloy",
    cover: IMAGES[12],
    items: [
      { title: "Lady Brown", meta: "2001, Helsinki", image: IMAGES[12] },
      { title: "King Candy", meta: "2003, Lisbon", image: IMAGES[13] },
      { title: "The Book", meta: "2005, Toronto", image: IMAGES[14] },
      { title: "Corner", meta: "2006, Dublin", image: IMAGES[15] },
    ],
  },
  {
    label: "tv",
    cover: IMAGES[16],
    items: [
      { title: "Fun fun fun", meta: "2014, Moscow", image: IMAGES[16] },
      { title: "Lovelife", meta: "2015, Shanghai", image: IMAGES[17] },
      { title: "Woodland", meta: "2016, Vienna", image: IMAGES[18] },
      { title: "No where", meta: "2017, Bern", image: IMAGES[19] },
    ],
  },
  {
    label: "lunatic",
    cover: IMAGES[3],
    items: [
      { title: "Fantastic", meta: "2013, Bangkok", image: IMAGES[3] },
      { title: "Cutting Me", meta: "2014, Florence", image: IMAGES[7] },
      { title: "Houseparty", meta: "2015, Ljubljana", image: IMAGES[11] },
      { title: "Gnatus", meta: "2016, Helsinki", image: IMAGES[15] },
      { title: "What?", meta: "2017, Kiev", image: IMAGES[19] },
    ],
  },
  {
    label: "irresistible",
    cover: IMAGES[8],
    items: [
      { title: "Handsome", meta: "1998, Cologne", image: IMAGES[8] },
      { title: "Quo Vadis?", meta: "1999, Rome", image: IMAGES[2] },
      { title: "Prime Time", meta: "2000, Pasadena", image: IMAGES[6] },
      { title: "Doom", meta: "2001, Dublin", image: IMAGES[10] },
      { title: "Algebra", meta: "2002, Bukarest", image: IMAGES[14] },
      { title: "Freedom", meta: "2003, Sarajevo", image: IMAGES[18] },
    ],
  },
  {
    label: "frontiers",
    cover: IMAGES[1],
    items: [
      { title: "Apples", meta: "2019, Porto", image: IMAGES[1] },
      { title: "Overdose", meta: "2020, Barcelona", image: IMAGES[13] },
      { title: "Removed", meta: "2021, Osaka", image: IMAGES[17] },
    ],
  },
  {
    label: "barrage",
    cover: IMAGES[4],
    items: [
      { title: "Hard Candy", meta: "2021, Agra", image: IMAGES[4] },
      { title: "Longing", meta: "2022, Las Vegas", image: IMAGES[9] },
      { title: "Free Fall", meta: "2023, Pattaya", image: IMAGES[12] },
      { title: "Cracking", meta: "2024, Seoul", image: IMAGES[16] },
    ],
  },
  {
    label: "moet",
    cover: IMAGES[19],
    items: [
      { title: "Equals", meta: "2015, Tokyo", image: IMAGES[19] },
      { title: "Forced", meta: "2016, Melbourne", image: IMAGES[0] },
      { title: "Shackles", meta: "2017, London", image: IMAGES[5] },
      { title: "Unknown", meta: "2018, Jerusalem", image: IMAGES[10] },
      { title: "Holy Spirit", meta: "2019, Paris", image: IMAGES[15] },
    ],
  },
  {
    label: "rubber",
    cover: IMAGES[11],
    items: [
      { title: "Just You", meta: "2010, Detroit", image: IMAGES[11] },
      { title: "Splitting", meta: "2011, Milan", image: IMAGES[3] },
      { title: "Handy Hat", meta: "2012, Jakarta", image: IMAGES[7] },
    ],
  },
  {
    label: "handy",
    cover: IMAGES[14],
    items: [
      { title: "Hallo Friend", meta: "2011, Frankfurt", image: IMAGES[14] },
      { title: "Middle", meta: "2012, Liverpool", image: IMAGES[2] },
      { title: "Location", meta: "2013, Denver", image: IMAGES[6] },
      { title: "Heavy Womb", meta: "2014, Manchester", image: IMAGES[18] },
    ],
  },
];

const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);

export default function InlineMenuLayout({
  categories = DEFAULT_CATEGORIES,
  bgColor = "#D5D7CE",
  textColor = "#000",
  accentColor = "#e63811",
  fontHref = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Archivo:wght@500;600&display=swap",
  titleFontFamily = '"Bodoni Moda", "Didot", "Times New Roman", serif',
  bodyFontFamily = '"Archivo", "Helvetica Neue", Arial, sans-serif',
  titleLetterSpacing = "-0.02em",
  metaLetterSpacing = "0.12em",
  menuFontSize = "clamp(2rem,8vw,4.75rem)",
  contentFontSize = "clamp(3rem,9vw,6rem)",
  hoverImageWidth = 300,
  hoverImageHeight = 400,
  hoverImageWidthSm = 150,
  hoverImageHeightSm = 200,
  lerpAmount = 0.08,
  rotationLerp = 0.05,
  maxRotation = 100,
  mouseSpeedClamp = 200,
  revealDuration = 0.8,
  transitionDuration = 1,
  backDuration = 0.4,
  galleryMinWidth = 175,
  galleryGap = "2.5rem",
  showCursor = true,
  cursorSize = 30,
  cursorRadius = 7.5,
  cursorStroke = "#000",
  cursorStrokeWidth = 1,
  cursorLerp = 0.2,
  cursorHoverScale = 2,
  cursorHoverOpacity = 0.3,
  className = "",
}) {
  const rawId = useId();
  const uid = "iml-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const apiRef = useRef(null);
  const [current, setCurrent] = useState(-1);

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
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    let disposed = false;
    const cleanups = [];

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        const { gsap } = window;
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
          rotation: { previous: 0, current: 0, amt: rotationLerp },
        };

        const menuEl = root.querySelector("[data-menu]");
        const itemEls = [...root.querySelectorAll("[data-menu-item]")];
        const texts = itemEls.map((el) =>
          el.querySelector("[data-menu-inner]"),
        );
        const numbers = itemEls.map((el) =>
          el.querySelector("[data-menu-number]"),
        );
        const backCtrl = root.querySelector("[data-back]");
        const contentEls = [...root.querySelectorAll("[data-content]")];

        const hideFns = [];

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
            const distX = clamp(Math.abs(mouseCache.x - mouse.x), 0, 100);
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
                  direction.x < 0 ? -maxRotation : maxRotation,
                );

            for (const key in props) {
              props[key].previous = firstCycle
                ? props[key].current
                : lerp(props[key].previous, props[key].current, props[key].amt);
            }

            gsap.set(reveal, {
              x: props.tx.previous,
              y: props.ty.previous,
              rotation: props.rotation.previous,
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

          const showImage = () => {
            gsap.killTweensOf(revealInner);
            gsap.killTweensOf(revealImage);
            gsap
              .timeline({
                defaults: { duration: revealDuration, ease: "quint" },
                onStart: () => {
                  reveal.style.opacity = 1;
                  revealInner.style.opacity = 1;
                  gsap.set(el, { zIndex: itemEls.length });
                },
              })
              .to(
                revealInner,
                {
                  startAt: { x: "-50%", y: "150%", rotation: 10 },
                  x: "0%",
                  y: "0%",
                },
                0,
              )
              .to(
                revealInner,
                {
                  duration: 1,
                  ease: "expo",
                  startAt: { scale: 0.2 },
                  scale: 1,
                },
                0,
              )
              .to(
                revealImage,
                {
                  duration: 1,
                  ease: "expo",
                  startAt: { scale: 1.8 },
                  scale: 1,
                },
                0,
              );
          };

          const hideImage = () =>
            new Promise((resolve) => {
              gsap.killTweensOf(revealInner);
              gsap.killTweensOf(revealImage);
              gsap
                .timeline({
                  defaults: { duration: revealDuration, ease: "quint" },
                  onStart: () => {
                    gsap.set(el, { zIndex: 1 });
                  },
                  onComplete: () => {
                    gsap.set(reveal, { opacity: 0 });
                    resolve();
                  },
                })
                .to(revealInner, {
                  scale: 0.8,
                  x: "50%",
                  y: "-150%",
                  opacity: 0,
                })
                .to(revealImage, { scale: 1.8 }, 0);
            });

          hideFns.push(hideImage);

          const onEnter = () => {
            showImage();
            firstCycle = true;
            loopRender();
          };
          const onLeave = () => {
            stopRendering();
            hideImage();
          };

          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            stopRendering();
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf([revealInner, revealImage]);
          });
        });

        const getContentParts = (position) => {
          const contentEl = contentEls[position];
          return {
            el: contentEl,
            title: contentEl.querySelector("[data-content-title]"),
            number: contentEl.querySelector("[data-content-number]"),
            imgs: [...contentEl.querySelectorAll("[data-gallery-img]")],
            titles: [...contentEl.querySelectorAll("[data-gallery-title]")],
            metas: [...contentEl.querySelectorAll("[data-gallery-meta]")],
            mores: [...contentEl.querySelectorAll("[data-gallery-more]")],
          };
        };

        const open = (position) => {
          const c = getContentParts(position);
          const itemEl = itemEls[position];

          menuEl.style.pointerEvents = "none";
          itemEl.style.pointerEvents = "auto";
          hideFns[position]().then(() => {
            itemEl.style.pointerEvents = "none";
          });

          gsap
            .timeline({
              defaults: { duration: transitionDuration, ease: "expo" },
            })
            .addLabel("hideMenu", 0)
            .set([texts, c.title], { transformOrigin: "50% 100%" }, "hideMenu")
            .set(c.title, { opacity: 0, y: "101%" }, "hideMenu")
            .set(c.number, { scale: 0 }, "hideMenu")
            .set(c.imgs, { y: "101%" }, "hideMenu")
            .set([c.titles, c.metas, c.mores], { opacity: 0 }, "hideMenu")
            .to(
              numbers,
              {
                duration: 0.3,
                ease: "sine",
                scale: 0,
                opacity: 0,
                stagger: { from: position, each: 0.01 },
              },
              "hideMenu",
            )
            .to(
              texts,
              {
                duration: 0.1,
                ease: "quad.in",
                scaleY: 1.5,
                stagger: { from: position, each: 0.01 },
              },
              "hideMenu",
            )
            .to(
              texts,
              {
                duration: 0.8,
                ease: "expo",
                scaleY: 1,
                y: "-100%",
                opacity: 0,
                stagger: { from: position, each: 0.01 },
              },
              "hideMenu+=0.1",
            )
            .addLabel("showContent", 0.3)
            .add(() => setCurrent(position), "showContent")
            .set(backCtrl, { pointerEvents: "auto" }, "showContent")
            .to(
              backCtrl,
              { startAt: { x: "-100%" }, opacity: 1, x: "0%" },
              "showContent",
            )
            .to(
              c.title,
              { duration: 0.1, ease: "quad.in", scaleY: 1.5, opacity: 1 },
              "showContent",
            )
            .to(
              c.title,
              {
                duration: 0.8,
                ease: "expo",
                scaleY: 1,
                startAt: { y: "100%" },
                y: "0%",
              },
              "showContent+=0.1",
            )
            .to(c.number, { scale: 1 }, "showContent")
            .to(c.imgs, { y: "0%", stagger: 0.02 }, "showContent+=0.1")
            .to(
              [c.titles, c.metas],
              { startAt: { y: "100%" }, y: "0%", opacity: 1, stagger: 0.02 },
              "showContent+=0.2",
            )
            .to(
              c.mores,
              { startAt: { scale: 0 }, scale: 1, opacity: 1, stagger: 0.02 },
              "showContent+=0.2",
            );
        };

        const close = (position) => {
          const c = getContentParts(position);
          const itemEl = itemEls[position];

          gsap
            .timeline({
              defaults: { duration: backDuration, ease: "power3.in" },
            })
            .addLabel("hideContent", 0)
            .set([texts, c.title], { transformOrigin: "50% 0%" }, "hideContent")
            .set(backCtrl, { pointerEvents: "none" }, "hideContent")
            .to(backCtrl, { opacity: 0, x: "-100%" }, "hideContent")
            .to(
              [c.metas, c.titles],
              { y: "100%", opacity: 0, stagger: 0.02 },
              "hideContent",
            )
            .to(c.mores, { scale: 0, opacity: 0, stagger: 0.02 }, "hideContent")
            .to(c.imgs, { y: "101%", stagger: 0.02 }, "hideContent+=0.1")
            .to(c.number, { scale: 0 }, "hideContent+=0.1")
            .to(c.title, { y: "100%", opacity: 1 }, "hideContent+=0.1")
            .addLabel("showMenu", 0.6)
            .add(() => setCurrent(-1), "showMenu")
            .add(() => {
              menuEl.style.pointerEvents = "";
              itemEl.style.pointerEvents = "";
            }, "showMenu")
            .to(
              numbers,
              {
                duration: 0.3,
                ease: "sine",
                scale: 1,
                opacity: 1,
                stagger: { from: position, each: 0.01 },
              },
              "showMenu",
            )
            .to(
              texts,
              {
                duration: 0.1,
                ease: "quad.in",
                scaleY: 1.5,
                opacity: 1,
                stagger: { from: position, each: 0.01 },
              },
              "showMenu",
            )
            .to(
              texts,
              {
                duration: 0.8,
                ease: "expo",
                scaleY: 1,
                y: "0%",
                stagger: { from: position, each: 0.01 },
              },
              "showMenu+=0.1",
            );
        };

        apiRef.current = { open, close };
        cleanups.push(() => {
          apiRef.current = null;
        });

        contentEls.forEach((contentEl) => {
          const imgs = [...contentEl.querySelectorAll("[data-gallery-img]")];
          const mores = [...contentEl.querySelectorAll("[data-gallery-more]")];
          mores.forEach((more, pos) => {
            const img = imgs[pos];
            const onEnter = () => {
              gsap.killTweensOf(img);
              gsap.to(img, { duration: 1, ease: "expo", scale: 0.95 });
            };
            const onLeave = () => {
              gsap.killTweensOf(img);
              gsap.to(img, { duration: 0.5, ease: "expo", scale: 1 });
            };
            more.addEventListener("mouseenter", onEnter);
            more.addEventListener("mouseleave", onLeave);
            cleanups.push(() => {
              more.removeEventListener("mouseenter", onEnter);
              more.removeEventListener("mouseleave", onLeave);
              gsap.killTweensOf(img);
            });
          });
        });

        const cursorEl = cursorRef.current;
        if (cursorEl) {
          const styles = {
            tx: { previous: 0, current: 0, amt: cursorLerp },
            ty: { previous: 0, current: 0, amt: cursorLerp },
            scale: { previous: 1, current: 1, amt: cursorLerp },
            opacity: { previous: 1, current: 1, amt: cursorLerp },
          };
          let cursorRaf;
          const renderCursor = () => {
            styles.tx.current = mouse.x - cursorSize / 2;
            styles.ty.current = mouse.y - cursorSize / 2;
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
              "px) scale(" +
              styles.scale.previous +
              ")";
            cursorEl.style.opacity = styles.opacity.previous;
            cursorRaf = requestAnimationFrame(renderCursor);
          };
          const startCursor = () => {
            styles.tx.previous = styles.tx.current = mouse.x - cursorSize / 2;
            styles.ty.previous = styles.ty.current = mouse.y - cursorSize / 2;
            gsap.to(cursorEl, {
              duration: 0.9,
              ease: "power3.out",
              opacity: 1,
            });
            cursorRaf = requestAnimationFrame(renderCursor);
            window.removeEventListener("mousemove", startCursor);
          };
          window.addEventListener("mousemove", startCursor);

          const links = [...root.querySelectorAll("[data-cursor-target]")];
          const enter = () => {
            styles.scale.current = cursorHoverScale;
            styles.opacity.current = cursorHoverOpacity;
          };
          const leave = () => {
            styles.scale.current = 1;
            styles.opacity.current = 1;
          };
          links.forEach((link) => {
            link.addEventListener("mouseenter", enter);
            link.addEventListener("mouseleave", leave);
          });

          cleanups.push(() => {
            window.removeEventListener("mousemove", startCursor);
            if (cursorRaf) cancelAnimationFrame(cursorRaf);
            links.forEach((link) => {
              link.removeEventListener("mouseenter", enter);
              link.removeEventListener("mouseleave", leave);
            });
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
    categories,
    lerpAmount,
    rotationLerp,
    maxRotation,
    mouseSpeedClamp,
    revealDuration,
    transitionDuration,
    backDuration,
    showCursor,
    cursorSize,
    cursorLerp,
    cursorHoverScale,
    cursorHoverOpacity,
  ]);

  const css =
    "." +
    uid +
    " [data-menu-item]:hover { color: " +
    accentColor +
    "; }" +
    "." +
    uid +
    " [data-reveal] { width: " +
    hoverImageWidthSm +
    "px; height: " +
    hoverImageHeightSm +
    "px; }" +
    "." +
    uid +
    " [data-gallery] { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }" +
    "@media screen and (min-width: 53em) {" +
    "." +
    uid +
    " [data-reveal] { width: " +
    hoverImageWidth +
    "px; height: " +
    hoverImageHeight +
    "px; }" +
    "." +
    uid +
    " [data-gallery] {" +
    "grid-template-columns: repeat(auto-fill, minmax(" +
    galleryMinWidth +
    "px, 1fr));" +
    "grid-auto-columns: " +
    galleryMinWidth +
    "px; grid-auto-flow: column; grid-template-rows: auto; } }";

  return (
    <div
      ref={rootRef}
      className={
        "relative min-h-screen w-full overflow-clip px-6 py-6 md:px-12 " +
        uid +
        " " +
        className
      }
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="relative grid min-h-[calc(100vh-3rem)] grid-rows-[1fr] items-center">
        <nav
          data-menu=""
          className="relative col-start-1 row-start-1 flex max-w-[1050px] flex-wrap content-center justify-start"
        >
          {categories.map((cat, i) => (
            <a
              key={i}
              data-menu-item=""
              data-cursor-target=""
              onClick={() => apiRef.current && apiRef.current.open(i)}
              className="relative flex flex-none cursor-pointer items-start mr-8 leading-none lowercase transition-colors"
              style={{
                fontFamily: titleFontFamily,
                fontSize: menuFontSize,
                letterSpacing: titleLetterSpacing,
              }}
            >
              <span className="relative overflow-hidden">
                <span
                  data-menu-inner=""
                  className="mb-6 inline-block will-change-transform"
                >
                  {cat.label}
                </span>
              </span>
              <sup
                data-menu-number=""
                className="text-[1.5vw] font-semibold"
                style={{
                  fontFamily: bodyFontFamily,
                  letterSpacing: metaLetterSpacing,
                }}
              >
                ({cat.items.length})
              </sup>

              <div
                data-reveal=""
                className="pointer-events-none absolute left-0 top-0 -z-10 opacity-0 will-change-transform"
                style={{ transformOrigin: "0% 0%" }}
              >
                <div
                  data-reveal-inner=""
                  className="relative h-full w-full overflow-hidden"
                >
                  <div
                    data-reveal-image=""
                    className="relative h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url(" + cat.cover + ")",
                      transformOrigin: "50% 100%",
                    }}
                  />
                </div>
              </div>
            </a>
          ))}
        </nav>

        <section className="relative col-start-1 row-start-1">
          {categories.map((cat, i) => (
            <div
              key={i}
              data-content=""
              className={
                current === i
                  ? "relative top-0 h-auto overflow-visible opacity-100 pointer-events-auto"
                  : "absolute top-0 h-0 overflow-hidden opacity-0 pointer-events-none"
              }
            >
              <h2 className="mb-[5vh] mt-8 flex items-start font-normal leading-none">
                <span className="relative overflow-hidden">
                  <span
                    data-content-title=""
                    className="block leading-[1.3] lowercase"
                    style={{
                      fontFamily: titleFontFamily,
                      fontSize: contentFontSize,
                      letterSpacing: titleLetterSpacing,
                    }}
                  >
                    {cat.label}
                  </span>
                </span>
                <sup
                  data-content-number=""
                  className="mt-4 text-[clamp(1rem,1.5vw,1.75rem)] font-semibold"
                  style={{
                    fontFamily: bodyFontFamily,
                    letterSpacing: metaLetterSpacing,
                  }}
                >
                  ({cat.items.length})
                </sup>
              </h2>

              <div data-gallery="" className="grid" style={{ gap: galleryGap }}>
                {cat.items.map((item, j) => (
                  <figure key={j} className="m-0 flex-none">
                    <div className="relative w-full overflow-hidden">
                      <div
                        data-gallery-img=""
                        className="w-full bg-cover bg-top pb-[151%] will-change-transform"
                        style={{ backgroundImage: "url(" + item.image + ")" }}
                      />
                    </div>
                    <figcaption className="grid [grid-template-areas:'ct_cm''cx_cx']">
                      <h3
                        data-gallery-title=""
                        className="my-4 text-2xl font-normal leading-none lowercase [grid-area:ct]"
                        style={{
                          fontFamily: titleFontFamily,
                          letterSpacing: titleLetterSpacing,
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        data-gallery-meta=""
                        className="m-0 text-[0.85rem] uppercase [grid-area:cx]"
                        style={{ letterSpacing: metaLetterSpacing }}
                      >
                        {item.meta}
                      </p>
                      <button
                        data-gallery-more=""
                        data-cursor-target=""
                        type="button"
                        className="m-0 cursor-pointer self-center justify-self-end border-0 bg-transparent p-0 hover:opacity-70 focus:opacity-70 focus:outline-none [grid-area:cm]"
                      >
                        +
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}

          <button
            data-back=""
            data-cursor-target=""
            type="button"
            onClick={() =>
              apiRef.current && current > -1 && apiRef.current.close(current)
            }
            className="pointer-events-none absolute left-0 top-0 m-0 border-0 bg-transparent p-0 opacity-0 fill-[#afb1a8] focus:outline-none"
            style={{ cursor: "pointer" }}
          >
            <svg viewBox="0 0 60 34" width="30" height="17">
              <path d="M60 15.066H7.235L19.128 3.173 16.456.5 0 16.956 16.456 33.41l2.672-2.672L7.235 18.846H60z" />
            </svg>
          </button>
        </section>
      </div>

      {showCursor ? (
        <svg
          ref={cursorRef}
          className="pointer-events-none fixed left-0 top-0 z-[9999] hidden opacity-0 [@media(any-pointer:fine)]:block"
          width={cursorSize}
          height={cursorSize}
          viewBox={"0 0 " + cursorSize + " " + cursorSize}
        >
          <circle
            cx={cursorSize / 2}
            cy={cursorSize / 2}
            r={cursorRadius}
            fill="none"
            stroke={cursorStroke}
            strokeWidth={cursorStrokeWidth}
          />
        </svg>
      ) : null}
    </div>
  );
}
