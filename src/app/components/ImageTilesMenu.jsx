"use client";

import { useEffect, useId, useMemo, useRef } from "react";

// ─── ImageTilesMenu ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              object[]  (7 defaults)  Menu entries: { title, desc }
// images             string[]  (25 defaults) Image URLs, one per item, cycled
// positions          number[][] (28 defaults) Tile scatter as [row, col] on a 100×100 grid
// bgColor            string    #141418      Page background
// titleColor         string    #393634      Resting menu title color
// titleAccentColor   string    #e0d2c4      Menu title accent letters on hover
// titleHoverColor    string    #efafa5      Menu title color on hover
// descColor          string    #f1f1f1      Menu item description color
// borderColor        string    rgb(91 91 91 / 44%)  Divider between menu rows
// contentTitleColor  string    #99dde2      Content view heading color
// contentAccentColor string    #e2d2c3      Content heading accent letters
// contentDescColor   string    #656569      Content view paragraph color
// backColor          string    #fff         Back button text color
// backBorderColor    string    rgba(255,255,255,0.3)  Back button border
// fontUrl            string    (Google Fonts)  Stylesheet injected for the two families
// displayFont        string    "Bodoni Moda", serif   Font for both headings
// bodyFont           string    "Archivo", sans-serif  Font for descriptions
// titleLineHeight    number    1            Line-height of menu titles (drives row height)
// tileWidth          string    18vw         Width of a scattered tile
// tileRatio          string    4 / 3        Aspect ratio of every tile and thumb
// thumbHeight        string    50vh         Height of the side thumbs and content grid
// thumbBrightness    number    0.3          Brightness filter on the side thumbs
// titleOffset        number    50           Resting X offset of menu titles (px)
// hoverDuration      number    0.5          Hover-in tween duration (s)
// leaveDuration      number    0.3          Hover-out tween duration (s)
// tileStagger        number    0.045        Stagger between tiles on hover (s)
// tileScaleFrom      number    0.5          Tile scale before hover-in
// openDuration       number    0.75         Menu → content transition (s)
// closeDuration      number    0.6          Content → menu transition (s)
// flipStagger        number    0.02         Stagger between tiles during the flip (s)
// charStagger        number    0.025        Stagger of content heading characters (s)
// breakpoint         string    53em         Min-width for the desktop layout
// ──────────────────────────────────────────────────────────────────────────

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

const DEFAULT_ITEMS = [
  {
    title: [
      ["H", 1],
      ["ydr", 0],
      ["O", 1],
      ["asis", 0],
    ],
    desc: "Refreshing beverage infused with electrolytes and nootropics to boost mental clarity.",
  },
  {
    title: [
      ["A", 1],
      ["lga", 0],
      ["Z", 1],
      ["en", 0],
    ],
    desc: "A drink made from a mix of algae and other superfoods that provide sustained energy and boost the immune system.",
  },
  {
    title: [
      ["N", 1],
      ["euro", 0],
      ["B", 1],
      ["oost", 0],
    ],
    desc: "A cognitive enhancing drink infused with adaptogens, nootropics, and vitamins to enhance focus and mental clarity.",
  },
  {
    title: [
      ["E", 1],
      ["co", 0],
      ["E", 1],
      ["levate", 0],
    ],
    desc: "A plant-based energy drink made with maca, matcha, and other plant-based ingredients that help to increase energy levels and reduce stress.",
  },
  {
    title: [
      ["H", 1],
      ["erba", 0],
      ["V", 1],
      ["igor", 0],
    ],
    desc: "A natural energy drink made with ginseng, green tea, and other herbal extracts that help increase endurance and reduce fatigue.",
  },
  {
    title: [
      ["O", 1],
      ["hm", 0],
      ["A", 1],
      ["lchemy", 0],
    ],
    desc: "A healthy drink made with spirulina, chlorella, and other green superfoods that help detoxify the body and boost energy.",
  },
  {
    title: [
      ["F", 1],
      ["ruit", 0],
      ["F", 1],
      ["use", 0],
    ],
    desc: "A fruity drink infused with vitamins and antioxidants that helps to protect the skin from UV damage.",
  },
];

const DEFAULT_POSITIONS = [
  [10, 1],
  [30, 50],
  [55, 75],
  [70, 5],
  [5, 75],
  [34, 3],
  [10, 47],
  [67, 17],
  [36, 11],
  [12, 70],
  [46, 75],
  [75, 16],
  [25, 1],
  [60, 60],
  [15, 75],
  [53, 6],
  [70, 5],
  [70, 50],
  [10, 20],
  [35, 70],
  [55, 75],
  [75, 50],
  [10, 70],
  [20, 5],
  [45, 60],
  [70, 1],
  [70, 85],
  [5, 19],
];

const QUADRANTS = [
  ["0", "0"],
  ["100%", "0"],
  ["0", "100%"],
  ["100%", "100%"],
];

const DEFAULT_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&display=swap";

const SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js",
];

export default function ImageTilesMenu({
  items = DEFAULT_ITEMS,
  images = DEFAULT_IMAGES,
  positions = DEFAULT_POSITIONS,
  bgColor = "#141418",
  titleColor = "#393634",
  titleAccentColor = "#e0d2c4",
  titleHoverColor = "#efafa5",
  descColor = "#f1f1f1",
  borderColor = "rgb(91 91 91 / 44%)",
  contentTitleColor = "#99dde2",
  contentAccentColor = "#e2d2c3",
  contentDescColor = "#656569",
  backColor = "#fff",
  backBorderColor = "rgba(255,255,255,0.3)",
  fontUrl = DEFAULT_FONT_URL,
  displayFont = '"Bodoni Moda", serif',
  bodyFont = '"Archivo", system-ui, sans-serif',
  titleLineHeight = 1,
  tileWidth = "18vw",
  tileRatio = "4 / 3",
  thumbHeight = "50vh",
  thumbBrightness = 0.3,
  titleOffset = 50,
  hoverDuration = 0.5,
  leaveDuration = 0.3,
  tileStagger = 0.045,
  tileScaleFrom = 0.5,
  openDuration = 0.75,
  closeDuration = 0.6,
  flipStagger = 0.02,
  charStagger = 0.025,
  breakpoint = "53em",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `itm-${uid}`;

  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const model = useMemo(
    () =>
      items.map((item, i) => {
        const chars = [];
        item.title.forEach(([text, accent]) => {
          [...text].forEach((ch) => chars.push({ ch, accent }));
        });
        return {
          chars,
          desc: item.desc,
          src: images[i % images.length],
          prevSrc: images[(i - 1 + items.length) % images.length],
          nextSrc: images[(i + 1) % images.length],
          tiles: QUADRANTS.map((q, t) => {
            const p = positions[(i * 4 + t) % positions.length];
            return { x: q[0], y: q[1], row: p[0], col: p[1] };
          }),
        };
      }),
    [items, images, positions],
  );

  const css = `
.${scope} { position: relative; display: grid; grid-template-areas: 'main'; width: 100%; height: 100vh; overflow: hidden; background: ${bgColor}; font-variation-settings: "slnt" 0, "wdth" 98, "wght" 400; }
.${scope} .itm-wrap { position: relative; z-index: 0; grid-area: main; display: grid; pointer-events: none; }
.${scope} .itm-grid { grid-area: 1 / -1; width: 100%; display: grid; grid-template-columns: repeat(100, 1%); grid-template-rows: repeat(100, 1%); }
.${scope} .itm-tile { position: relative; }
.${scope} .itm-wrap .itm-tile { opacity: 0; grid-area: var(--r) / var(--c); aspect-ratio: ${tileRatio}; width: ${tileWidth}; }
.${scope} .itm-wrap .itm-grid--current .itm-tile { opacity: 1; }
.${scope} .itm-tile-img { width: 100%; height: 100%; background-size: 200%; background-position: var(--bx) var(--by); }
.${scope} .itm-content-wrap { position: relative; z-index: 1; grid-area: main; display: grid; pointer-events: none; }
.${scope} .itm-menu { position: relative; z-index: 2; grid-area: main; display: flex; flex-direction: column; justify-content: center; max-height: 100vh; }
.${scope} .itm-menu--hidden { pointer-events: none; }
.${scope} .itm-menu-item { cursor: pointer; min-height: 0; }
.${scope} .itm-menu-item:not(:last-child) { border-bottom: 1px solid ${borderColor}; }
.${scope} .itm-menu-title { white-space: nowrap; font-family: ${displayFont}; font-weight: 400; font-size: 5vh; line-height: ${titleLineHeight}; grid-column: 2; color: ${titleColor}; transform: translateX(${titleOffset}px); display: block; }
.${scope} .itm-menu-item:hover .itm-menu-title { color: ${titleHoverColor}; }
.${scope} .itm-menu-item:hover .itm-menu-title .itm-accent { color: ${titleAccentColor}; transition: color 0.2s ease-out; }
.${scope} .itm-menu-desc { opacity: 0; line-height: 1; max-width: 450px; font-weight: 500; display: none; font-family: ${bodyFont}; text-transform: uppercase; letter-spacing: 0.02em; font-size: clamp(0.5rem, 2.5vh, 1rem); color: ${descColor}; }
.${scope} .itm-content { pointer-events: none; opacity: 0; grid-area: 1 / -1; max-height: 100vh; padding: 8rem 1.5rem; }
.${scope} .itm-content--current { pointer-events: auto; opacity: 1; }
.${scope} .itm-content-title { font-family: ${displayFont}; font-weight: 400; font-size: clamp(2rem, 10vw, 8rem); margin: 0; line-height: 1.2; color: ${contentTitleColor}; grid-column: 2; }
.${scope} .itm-content-title .itm-accent { color: ${contentAccentColor}; }
.${scope} .char-wrap { display: inline-block; position: relative; overflow: hidden; }
.${scope} .char { display: inline-block; position: relative; }
.${scope} .itm-content-desc { grid-column: 2; line-height: 1; font-weight: 500; max-width: 550px; margin: 0; font-family: ${bodyFont}; text-transform: uppercase; letter-spacing: 0.02em; color: ${contentDescColor}; }
.${scope} .itm-content-images { margin: 1.75rem 0 3rem 0; }
.${scope} .itm-content-images .itm-grid { height: auto; width: 100%; flex: none; aspect-ratio: ${tileRatio}; grid-template-columns: repeat(2, 50%); grid-template-rows: repeat(2, 50%); grid-area: thumbgrid; }
.${scope} .itm-content-images .itm-grid--content { grid-template-columns: 100%; grid-template-rows: 100%; }
.${scope} .itm-grid--content .itm-tile { grid-area: 1 / 1; aspect-ratio: ${tileRatio}; }
.${scope} .itm-grid--content .itm-tile-img { background-size: 100%; background-position: 0 0; }
.${scope} .itm-thumb { height: ${thumbHeight}; aspect-ratio: ${tileRatio}; width: auto; display: none; }
.${scope} .itm-thumb--prev { grid-area: thumbprev; justify-self: end; }
.${scope} .itm-thumb--next { grid-area: thumbnext; }
.${scope} .itm-thumb-inner { width: 100%; height: 100%; background-size: cover; background-position: 50% 50%; filter: brightness(${thumbBrightness}); }
.${scope} .itm-back { background: none; padding: 0.15rem 0.85rem 0.25rem; margin: 0; font: inherit; cursor: pointer; justify-self: start; grid-column: 2; color: ${backColor}; font-family: ${bodyFont}; text-transform: uppercase; letter-spacing: 0.02em; border: 1px solid ${backBorderColor}; border-radius: 2rem; }
@media screen and (min-width: ${breakpoint}) {
  .${scope} .itm-menu-item { flex: 1 1 0%; min-height: 0; align-items: center; gap: 1.5rem; display: grid; grid-template-columns: 20vw auto auto 1fr; }
  .${scope} .itm-menu-title { font-size: clamp(1rem, 9vh, 5rem); }
  .${scope} .itm-menu-desc { display: block; }
  .${scope} .itm-content { padding: 1.5rem 0; align-content: end; display: grid; column-gap: 2vw; grid-template-columns: 20vw 1fr; grid-template-rows: auto 12vw auto auto; }
  .${scope} .itm-content-images { display: grid; gap: 2vw; grid-template-columns: 20vw 1fr auto; grid-template-areas: 'thumbprev thumbgrid thumbnext'; }
  .${scope} .itm-thumb { display: block; }
  .${scope} .itm-content-images .itm-grid { height: ${thumbHeight}; width: auto; }
}
`;

  useEffect(() => {
    let killed = false;
    const cleanups = [];

    const loadStyle = (href) => {
      if (!href) return;
      if (document.querySelector(`link[data-id="${href}"]`)) return;
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      el.setAttribute("data-id", href);
      document.head.appendChild(el);
    };

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-id="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") resolve();
          else {
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
          }
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = () => {
          el.dataset.loaded = "true";
          resolve();
        };
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const boot = async () => {
      loadStyle(fontUrl);
      for (const src of SCRIPTS) await loadScript(src);
      if (killed || !rootRef.current) return;

      const { gsap, imagesLoaded, Flip } = window;
      if (!gsap || !Flip || !imagesLoaded) return;
      gsap.registerPlugin(Flip);
      gsap.config({ trialWarn: false });

      const root = rootRef.current;
      const menu = menuRef.current;

      const thumbGrids = [
        ...root.querySelectorAll(".itm-wrap > .itm-grid"),
      ].map((el) => ({
        el,
        items: [...el.querySelectorAll(".itm-tile")],
      }));

      const contents = [
        ...root.querySelectorAll(".itm-content-wrap > .itm-content"),
      ].map((el) => ({
        el,
        back: el.querySelector(".itm-back"),
        title: el.querySelector(".itm-content-title"),
        desc: el.querySelector(".itm-content-desc"),
        chars: [...el.querySelectorAll(".itm-content-title .char")],
        grid: el.querySelector(".itm-content-images > .itm-grid"),
        prevThumb: el.querySelector(".itm-thumb--prev"),
        nextThumb: el.querySelector(".itm-thumb--next"),
      }));

      const menuItems = [...menu.querySelectorAll(".itm-menu-item")].map(
        (el, i) => ({
          el,
          title: el.querySelector(".itm-menu-title"),
          desc: el.querySelector(".itm-menu-desc"),
          chars: [...el.querySelectorAll(".itm-menu-title .char")],
          thumbGrid: thumbGrids[i],
          content: contents[i],
          enterTL: null,
          leaveTL: null,
          enterTimeout: null,
          leaveTimeout: null,
        }),
      );

      const allMenuEls = menuItems.map((m) => m.el);

      menuItems.forEach((m) => {
        gsap.set([m.title, m.desc, m.chars], {
          willChange: "transform, opacity",
        });
        gsap.set(m.thumbGrid.items, { willChange: "transform, opacity" });
        gsap.set(
          [
            m.content.title,
            m.content.desc,
            m.content.chars,
            m.content.nextThumb,
          ],
          { willChange: "transform, opacity" },
        );
      });

      let mode = "menu";
      let isAnimating = false;

      menuItems.forEach((menuItem) => {
        const onEnter = () => {
          clearTimeout(menuItem.enterTimeout);
          if (menuItem.leaveTL) menuItem.leaveTL.kill();
          if (mode === "content") return;

          menuItem.enterTimeout = setTimeout(() => {
            menuItem.thumbGrid.el.classList.add("itm-grid--current");
            menuItem.enterTL = gsap
              .timeline({ defaults: { duration: hoverDuration, ease: "expo" } })
              .addLabel("start", 0)
              .to(menuItem.title, { x: 0 }, "start")
              .fromTo(
                menuItem.desc,
                { opacity: 0, yPercent: 50 },
                { opacity: 1, yPercent: 0 },
                "start",
              )
              .fromTo(
                menuItem.thumbGrid.items,
                { opacity: 0, scale: tileScaleFrom },
                { stagger: tileStagger, opacity: 1, scale: 1 },
                "start",
              );
          }, 20);
        };

        const onLeave = () => {
          clearTimeout(menuItem.enterTimeout);
          clearTimeout(menuItem.leaveTimeout);
          if (menuItem.enterTL) menuItem.enterTL.kill();
          if (mode === "content") return;

          menuItem.leaveTimeout = setTimeout(() => {
            menuItem.thumbGrid.el.classList.remove("itm-grid--current");
            menuItem.leaveTL = gsap
              .timeline({
                defaults: { duration: leaveDuration, ease: "power3" },
              })
              .addLabel("start", 0)
              .to(menuItem.title, { x: titleOffset }, "start")
              .to(menuItem.desc, { opacity: 0, yPercent: 20 }, "start")
              .to(
                menuItem.thumbGrid.items,
                { opacity: 0, scale: tileScaleFrom },
                "start",
              );
          }, 20);
        };

        const onClick = () => {
          if (isAnimating) return;
          isAnimating = true;
          mode = "content";

          clearTimeout(menuItem.enterTimeout);
          clearTimeout(menuItem.leaveTimeout);
          if (menuItem.enterTL) menuItem.enterTL.kill();
          if (menuItem.leaveTL) menuItem.leaveTL.kill();

          gsap
            .timeline({
              defaults: { duration: openDuration, ease: "expo" },
              onStart: () =>
                menuItem.content.el.classList.add("itm-content--current"),
              onComplete: () => {
                gsap.set(menuItem.title, { x: titleOffset });
                menuItem.thumbGrid.el.classList.remove("itm-grid--current");
                isAnimating = false;
              },
            })
            .addLabel("menu", 0)
            .to(
              menuItem.chars,
              { ease: "power4.inOut", xPercent: -100 },
              "menu",
            )
            .to(
              menuItem.desc,
              { ease: "power4.inOut", yPercent: -60, opacity: 0 },
              "menu",
            )
            .add(() => {
              const flipstate = Flip.getState(menuItem.thumbGrid.items, {
                props: "transform,opacity",
              });

              if (menuItem.enterTL) menuItem.enterTL.progress(1, false);

              menuItem.thumbGrid.items.forEach((item) =>
                menuItem.content.grid.appendChild(item),
              );

              Flip.from(flipstate, {
                duration: openDuration,
                ease: "power4.inOut",
                scale: true,
                simple: true,
                prune: true,
                stagger: { each: flipStagger, from: "end" },
              }).add(
                () => menuItem.content.grid.classList.add("itm-grid--content"),
                openDuration,
              );
            }, "menu")
            .addLabel("content", "menu+=0.4")
            .to(
              allMenuEls,
              {
                opacity: 0,
                onComplete: () => menu.classList.add("itm-menu--hidden"),
              },
              "content",
            )
            .fromTo(
              menuItem.content.chars,
              { xPercent: 100 },
              { stagger: charStagger, xPercent: 0 },
              "content",
            )
            .fromTo(
              [menuItem.content.desc, menuItem.content.back],
              { opacity: 0, yPercent: 100 },
              { opacity: 1, yPercent: 0 },
              "content",
            )
            .fromTo(
              [menuItem.content.nextThumb, menuItem.content.prevThumb],
              { scale: 0.9, xPercent: (p) => (p ? -30 : 30), opacity: 0 },
              { scale: 1, xPercent: 0, opacity: 1 },
              "content",
            );
        };

        const onBack = () => {
          if (isAnimating) return;
          isAnimating = true;
          mode = "menu";

          gsap
            .timeline({
              defaults: { duration: closeDuration, ease: "expo" },
              onComplete: () => {
                menuItem.content.el.classList.remove("itm-content--current");
                menu.classList.remove("itm-menu--hidden");
                isAnimating = false;
              },
            })
            .addLabel("content", 0)
            .to(
              [menuItem.content.nextThumb, menuItem.content.prevThumb],
              { scale: 0.9, xPercent: (p) => (p ? -80 : 80), opacity: 0 },
              "content",
            )
            .to(
              [menuItem.content.desc, menuItem.content.back],
              { opacity: 0, yPercent: -100 },
              "content",
            )
            .to(menuItem.content.chars, { xPercent: 100 }, "content")
            .add(() => {
              menuItem.content.grid.classList.remove("itm-grid--content");

              const gridChildren = [...menuItem.content.grid.children];
              const flipstate = Flip.getState(menuItem.thumbGrid.items, {
                props: "transform,opacity",
              });

              gridChildren.forEach((item) => {
                menuItem.thumbGrid.el.appendChild(item);
                gsap.set(item, { opacity: 0 });
              });

              Flip.from(flipstate, {
                duration: closeDuration,
                ease: "expo",
                scale: true,
                simple: true,
                prune: true,
              });
            }, "content")
            .addLabel("menu", "content+=0.2")
            .to(allMenuEls, { opacity: 1 }, "menu")
            .to(menuItem.desc, { yPercent: 0 }, "menu")
            .to(menuItem.chars, { xPercent: 0, stagger: -0.02 }, "menu");
        };

        menuItem.el.addEventListener("mouseenter", onEnter);
        menuItem.el.addEventListener("mouseleave", onLeave);
        menuItem.el.addEventListener("click", onClick);
        menuItem.content.back.addEventListener("click", onBack);

        cleanups.push(() => {
          clearTimeout(menuItem.enterTimeout);
          clearTimeout(menuItem.leaveTimeout);
          menuItem.el.removeEventListener("mouseenter", onEnter);
          menuItem.el.removeEventListener("mouseleave", onLeave);
          menuItem.el.removeEventListener("click", onClick);
          menuItem.content.back.removeEventListener("click", onBack);
        });
      });

      imagesLoaded(
        root.querySelectorAll(".itm-thumb-inner"),
        { background: true },
        () => {
          if (killed) return;
          gsap.to(root, { duration: 0.4, opacity: 1, ease: "power2" });
        },
      );
    };

    boot().catch(() => {});

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={rootRef} className={`${scope} opacity-0`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="itm-wrap">
        {model.map((m, i) => (
          <div key={`${uid}-g${i}`} className="itm-grid">
            {m.tiles.map((t, j) => (
              <div
                key={`${uid}-g${i}-t${j}`}
                className="itm-tile"
                style={{ "--r": t.row, "--c": t.col }}
              >
                <div
                  className="itm-tile-img"
                  style={{
                    backgroundImage: `url(${m.src})`,
                    "--bx": t.x,
                    "--by": t.y,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="itm-content-wrap">
        {model.map((m, i) => (
          <div key={`${uid}-c${i}`} className="itm-content">
            <button type="button" className="itm-back">
              &larr; back
            </button>
            <h2 className="itm-content-title">
              {m.chars.map((c, j) => (
                <span key={`${uid}-c${i}-w${j}`} className="char-wrap">
                  <span className={c.accent ? "char itm-accent" : "char"}>
                    {c.ch}
                  </span>
                </span>
              ))}
            </h2>
            <p className="itm-content-desc">{m.desc}</p>
            <div className="itm-content-images">
              <div className="itm-thumb itm-thumb--prev">
                <div
                  className="itm-thumb-inner"
                  style={{ backgroundImage: `url(${m.prevSrc})` }}
                />
              </div>
              <div className="itm-grid" />
              <div className="itm-thumb itm-thumb--next">
                <div
                  className="itm-thumb-inner"
                  style={{ backgroundImage: `url(${m.nextSrc})` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <nav ref={menuRef} className="itm-menu">
        {model.map((m, i) => (
          <a key={`${uid}-m${i}`} className="itm-menu-item">
            <span className="itm-menu-title">
              {m.chars.map((c, j) => (
                <span key={`${uid}-m${i}-w${j}`} className="char-wrap">
                  <span className={c.accent ? "char itm-accent" : "char"}>
                    {c.ch}
                  </span>
                </span>
              ))}
            </span>
            <span className="itm-menu-desc">{m.desc}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
