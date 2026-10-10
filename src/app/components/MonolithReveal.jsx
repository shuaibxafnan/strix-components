"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── MonolithReveal ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    SPECIMENS  Slides: {image, title, subtitle, desc, meta, text, thumbs[]}
// bgColor            string   #0b0a0a    Page background
// textColor          string   #ffffff    Primary text color
// mutedColor         string   #767474    Meta / secondary text color
// displayFont        string   Georgia…   Font stack for the large titles
// bodyFont           string   ui-mono…   Font stack for body / labels
// frameLabel         string   Image …    Small rotated label in the side frame
// frameNote          string   Previous…  Secondary line in the side frame
// backLabel          string   Go back    Label of the back button
// duration           number   1.5        Transition duration (s)
// ease               string   power4…    Transition easing
// contentDelay       number   0.15       Delay before content elements animate in (s)
// previewMinHeight   string   90vh       Min height of each preview block
// imageZoom          number   1.8        scaleY applied to the image while scrolling
// titleParallax      number   -100       yPercent shift of the preview title on scroll
// backgroundSize     string   150%       background-size of the preview image
// thumbSize          number   100        Thumbnail width in px (desktop)
// smoothScroll       bool     true       Enable Lenis smooth scrolling
// lerp               number   0.1        Lenis lerp amount
// showFrame          bool     true       Show the side frame
// loaderColor        string   #aaaaaa    Color of the initial loading dot
// ──────────────────────────────────────────────────────────────────────────

const SPECIMENS = [
  {
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1920&q=80",
    title: "Andesite",
    subtitle: "aphanitic",
    desc: "A volcanic rock of intermediate composition, between silica-poor basalt and silica-rich rhyolite.",
    meta: "By Marlow Vance",
    text: "Andesite is a volcanic rock of intermediate composition. In a general sense, it is the intermediate type between silica-poor basalt and silica-rich rhyolite.",
    thumbs: [
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1920&q=80",
    title: "Batholith",
    subtitle: "plutonic",
    desc: "A large mass of intrusive igneous rock made mostly of felsic or intermediate rock types.",
    meta: "By Ida Renner",
    text: "A batholith is a large mass of intrusive igneous rock, also called plutonic rock, larger than 100 square kilometres in area, that forms from cooled magma deep in the crust.",
    thumbs: [
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1920&q=80",
    title: "Pumicite",
    subtitle: "vesicular",
    desc: "A volcanic rock that consists of highly vesicular rough-textured volcanic glass.",
    meta: "By Soren Whitlock",
    text: "Pumice, called pumicite in its powdered or dust form, is a volcanic rock that consists of highly vesicular rough-textured volcanic glass, which may or may not contain crystals. It is typically light-coloured.",
    thumbs: [
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1920&q=80",
    title: "Latite",
    subtitle: "aphyric",
    desc: "An igneous, volcanic rock, with aphanitic-aphyric to aphyric-porphyritic texture.",
    meta: "By Delia Karsten",
    text: "Latite is an igneous, volcanic rock, with aphanitic-aphyric to aphyric-porphyritic texture. Its mineral assemblage is usually alkali feldspar and plagioclase in approximately equal amounts.",
    thumbs: [
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1920&q=80",
    title: "Rhomb",
    subtitle: "porphyry",
    desc: "A volcanic rock with gray-white large porphyritic rhombus-shaped phenocrysts of feldspar.",
    meta: "By Corwin Ashby",
    text: "Rhomb porphyry is a volcanic rock with gray-white large porphyritic rhombus-shaped phenocrysts of feldspar embedded in a very fine-grained red-brown matrix.",
    thumbs: [
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1920&q=80",
    title: "Bytownite",
    subtitle: "triclinic",
    desc: "A calcium rich member of the plagioclase solid solution series of feldspar minerals.",
    meta: "By Petra Lindqvist",
    text: "Bytownite is a calcium rich member of the plagioclase solid solution series of feldspar minerals with composition between anorthite and labradorite. Like others of the series, bytownite forms grey to white triclinic crystals.",
    thumbs: [
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1920&q=80",
    title: "Oligoclase",
    subtitle: "plagioclase",
    desc: "A rock-forming mineral belonging to the plagioclase feldspars.",
    meta: "By Aurelio Banks",
    text: "Oligoclase is a rock-forming mineral belonging to the plagioclase feldspars. In chemical composition and in its crystallographic and physical characters it is intermediate between albite and anorthite.",
    thumbs: [
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1920&q=80",
    title: "Mordenite",
    subtitle: "fibrous",
    desc: "An abundant zeolite mineral that is used commercially.",
    meta: "By Hollis Trent",
    text: "Mordenite is a zeolite mineral that is one of the six most abundant zeolites and is used commercially. It was first described in the middle of the nineteenth century.",
    thumbs: [
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1920&q=80",
    title: "Stishovite",
    subtitle: "tetragonal",
    desc: "An extremely hard, dense tetragonal form of silicon dioxide.",
    meta: "By Ravi Sundaram",
    text: "Stishovite is an extremely hard, dense tetragonal polymorph of silicon dioxide. Large natural crystals of stishovite are extremely rare and are usually found as clasts of one to two millimetres in length.",
    thumbs: [
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    ],
  },
];

export default function MonolithReveal({
  items = SPECIMENS,
  bgColor = "#0b0a0a",
  textColor = "#ffffff",
  mutedColor = "#767474",
  displayFont = "Georgia, 'Times New Roman', serif",
  bodyFont = "ui-monospace, SFMono-Regular, Menlo, monospace",
  frameLabel = "Image to Content Page Transition",
  frameNote = "Mineral index",
  backLabel = "Go back",
  duration = 1.5,
  ease = "power4.inOut",
  contentDelay = 0.15,
  previewMinHeight = "90vh",
  imageZoom = 1.8,
  titleParallax = -100,
  backgroundSize = "150%",
  thumbSize = 100,
  smoothScroll = true,
  lerp = 0.1,
  showFrame = true,
  loaderColor = "#aaaaaa",
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const scope = "ict-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let lenis = null;
    let rafId = null;
    const cleanups = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          const existing = document.querySelector(
            'script[data-id="' + src + '"]',
          );
          if (existing.getAttribute("data-loaded") === "1") {
            resolve();
            return;
          }
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () =>
            reject(new Error("Failed: " + src)),
          );
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = () => {
          el.setAttribute("data-loaded", "1");
          resolve();
        };
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    const importModule = (url) =>
      new Function("url", "return import(url)")(url);

    const preloadBackgrounds = (nodes) =>
      Promise.all(
        nodes.map(
          (node) =>
            new Promise((resolve) => {
              const match = /url\(["']?(.*?)["']?\)/.exec(
                node.style.backgroundImage || "",
              );
              if (!match) {
                resolve();
                return;
              }
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = match[1];
            }),
        ),
      );

    const splitIntoLines = (el, source) => {
      el.innerHTML = "";
      const probe = document.createDocumentFragment();
      source.split(/\s+/).forEach((word) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        probe.appendChild(span);
        probe.appendChild(document.createTextNode(" "));
      });
      el.appendChild(probe);

      const words = [...el.querySelectorAll("span")];
      const grouped = [];
      let lastTop = null;
      words.forEach((span) => {
        const top = span.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          grouped.push([]);
          lastTop = top;
        }
        grouped[grouped.length - 1].push(span.textContent);
      });

      el.innerHTML = "";
      const lines = [];
      grouped.forEach((group) => {
        const holder = document.createElement("div");
        holder.className = "oh";
        const inner = document.createElement("div");
        inner.className = "line";
        inner.textContent = group.join(" ");
        holder.appendChild(inner);
        el.appendChild(holder);
        lines.push(inner);
      });
      return lines;
    };

    const isInViewport = (el) => {
      const b = el.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      const w = window.innerWidth || document.documentElement.clientWidth;
      return (
        ((b.bottom >= 0 && b.bottom <= h) || (b.top >= 0 && b.top <= h)) &&
        ((b.right >= 0 && b.right <= w) || (b.left >= 0 && b.left <= w))
      );
    };

    const boot = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js",
      );

      if (cancelled) return;
      const root = rootRef.current;
      const gsap = window.gsap;
      if (!root || !gsap) return;

      gsap.registerPlugin(window.ScrollTrigger, window.Flip);
      const Flip = window.Flip;

      const previewElems = [...root.querySelectorAll(".preview")];
      const contentElems = [...root.querySelectorAll(".content")];
      const backCtrl = root.querySelector(".action--back");

      const previewItems = previewElems.map((el, i) => {
        const contentEl = contentElems[i];
        const textEl = contentEl.querySelector(".content__text");
        const source = textEl.getAttribute("data-text") || textEl.textContent;
        return {
          el,
          imageWrap: el.querySelector(".preview__img-wrap"),
          image: el.querySelector(".preview__img"),
          imageInner: el.querySelector(".preview__img-inner"),
          titleInner: [...el.querySelectorAll(".preview__title .oh__inner")],
          description: el.querySelector(".preview__desc"),
          contentEl,
          contentTitleInner: [
            ...contentEl.querySelectorAll(".content__title .oh__inner"),
          ],
          contentMetaInner: contentEl.querySelector(
            ".content__meta > .oh__inner",
          ),
          contentText: textEl,
          contentTextSource: source,
          contentLines: [],
          thumbs: [...contentEl.querySelectorAll(".content__thumbs-item")],
          adjacentItems: [],
          imageInnerScaleYCached: 1,
        };
      });

      await preloadBackgrounds([
        ...root.querySelectorAll(".preview__img-inner, .content__thumbs-item"),
      ]);
      if (cancelled) return;
      setReady(true);

      previewItems.forEach((item) => {
        item.contentLines = splitIntoLines(
          item.contentText,
          item.contentTextSource,
        );
        gsap.set(item.contentLines, { yPercent: 105 });
      });

      const onResize = () => {
        previewItems.forEach((item) => {
          item.contentLines = splitIntoLines(
            item.contentText,
            item.contentTextSource,
          );
          gsap.set(item.contentLines, {
            yPercent: item.contentEl.classList.contains("content--current")
              ? 0
              : 105,
          });
        });
      };
      window.addEventListener("resize", onResize);
      cleanups.push(() => window.removeEventListener("resize", onResize));

      if (smoothScroll) {
        try {
          const mod = await importModule(
            "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm",
          );
          if (cancelled) return;
          const Lenis = mod.default || mod.Lenis;
          lenis = new Lenis({ lerp, smooth: true, direction: "vertical" });
          const scrollFn = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(scrollFn);
          };
          rafId = requestAnimationFrame(scrollFn);
        } catch (e) {
          lenis = null;
        }
      }

      previewItems.forEach((item) => {
        gsap.set(item.imageInner, { transformOrigin: "50% 0%" });
        item.scrollTimeline = gsap
          .timeline({
            scrollTrigger: {
              trigger: item.el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          })
          .addLabel("start", 0)
          .to(
            item.titleInner[0] ? item.el.querySelector(".preview__title") : {},
            {
              ease: "none",
              yPercent: titleParallax,
            },
            "start",
          )
          .to(item.imageInner, { ease: "none", scaleY: imageZoom }, "start");
      });

      let currentItem = -1;
      let isAnimating = false;

      const getAdjacentItems = (item) => {
        const arr = [];
        previewItems.forEach((other, position) => {
          if (other !== item && isInViewport(other.el)) {
            arr.push({ position, item: other });
          }
        });
        return arr;
      };

      const showContent = (item) => {
        const itemIndex = previewItems.indexOf(item);
        item.adjacentItems = getAdjacentItems(item);

        const tl = gsap
          .timeline({
            defaults: { duration, ease },
            onStart: () => {
              if (lenis) lenis.stop();
              document.body.classList.add(scope + "-locked");
              root.classList.add("content-open");
              item.contentEl.classList.add("content--current");

              gsap.set([...item.contentTitleInner, item.contentMetaInner], {
                yPercent: -101,
                opacity: 0,
              });
              gsap.set(item.thumbs, {
                transformOrigin: "0% 0%",
                scale: 0,
                yPercent: 150,
              });
              gsap.set([item.contentText, backCtrl], { opacity: 0 });

              item.imageInnerScaleYCached =
                item.imageInner.getBoundingClientRect().height /
                item.imageInner.offsetHeight;
            },
            onComplete: () => {
              isAnimating = false;
            },
          })
          .addLabel("start", 0);

        item.adjacentItems.forEach((el) => {
          tl.to(
            el.item.el,
            {
              y:
                el.position < itemIndex
                  ? -window.innerHeight
                  : window.innerHeight,
            },
            "start",
          );
        });

        tl.add(() => {
          const flipstate = Flip.getState(item.image);
          item.contentEl.appendChild(item.image);
          Flip.from(flipstate, { duration, ease, absolute: true });
        }, "start")
          .to(
            item.titleInner,
            { yPercent: 101, opacity: 0, stagger: -0.03 },
            "start",
          )
          .to(item.description, { yPercent: 101, opacity: 0 }, "start")
          .to(item.imageInner, { scaleY: 1 }, "start")
          .addLabel("content", contentDelay)
          .to(backCtrl, { opacity: 1 }, "content")
          .to(
            item.contentTitleInner,
            { yPercent: 0, opacity: 1, stagger: -0.05 },
            "content",
          )
          .to(item.contentMetaInner, { yPercent: 0, opacity: 1 }, "content")
          .to(item.thumbs, { scale: 1, yPercent: 0, stagger: -0.05 }, "content")
          .add(() => {
            gsap.killTweensOf(item.contentLines);
            gsap.fromTo(
              item.contentLines,
              { yPercent: 105 },
              { yPercent: 0, duration, ease, stagger: 0.1 },
            );
            gsap.set(item.contentText, { opacity: 1, delay: 0.01 });
          }, "content");
      };

      const hideContent = () => {
        const item = previewItems[currentItem];
        if (!item) return;

        gsap
          .timeline({
            defaults: { duration, ease },
            onComplete: () => {
              if (lenis) lenis.start();
              document.body.classList.remove(scope + "-locked");
              root.classList.remove("content-open");
              item.contentEl.classList.remove("content--current");
              isAnimating = false;
            },
          })
          .addLabel("start", 0)
          .to(backCtrl, { opacity: 0 }, "start")
          .to(
            item.contentTitleInner,
            { yPercent: -101, opacity: 0, stagger: 0.05 },
            "start",
          )
          .to(item.contentMetaInner, { yPercent: -101, opacity: 0 }, "start")
          .to(item.thumbs, { scale: 0, yPercent: 150, stagger: -0.05 }, "start")
          .add(() => {
            gsap.killTweensOf(item.contentLines);
            gsap.to(item.contentLines, {
              yPercent: -105,
              duration,
              ease,
              stagger: 0.02,
            });
          }, "start")
          .addLabel("preview", contentDelay)
          .to(
            item.adjacentItems.map((el) => el.item.el),
            { y: 0 },
            "preview",
          )
          .add(() => {
            const flipstate = Flip.getState(item.image);
            item.imageWrap.appendChild(item.image);
            Flip.from(flipstate, { duration, ease, absolute: true });
          }, "preview")
          .to(
            item.titleInner,
            { yPercent: 0, opacity: 1, stagger: 0.03 },
            "preview",
          )
          .to(item.description, { yPercent: 0, opacity: 1 }, "preview")
          .to(
            item.imageInner,
            { scaleY: item.imageInnerScaleYCached },
            "preview",
          );
      };

      previewItems.forEach((item, pos) => {
        const handler = () => {
          if (isAnimating) return;
          isAnimating = true;
          currentItem = pos;
          showContent(item);
        };
        item.imageWrap.addEventListener("click", handler);
        cleanups.push(() =>
          item.imageWrap.removeEventListener("click", handler),
        );
      });

      const backHandler = () => {
        if (isAnimating) return;
        isAnimating = true;
        hideContent();
      };
      backCtrl.addEventListener("click", backHandler);
      cleanups.push(() => backCtrl.removeEventListener("click", backHandler));

      cleanups.push(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.getAll().forEach((st) => {
            if (root.contains(st.trigger)) st.kill();
          });
        }
      });
    };

    boot().catch(() => setReady(true));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis && lenis.destroy) lenis.destroy();
      document.body.classList.remove(scope + "-locked");
      cleanups.forEach((fn) => fn());
    };
  }, [
    items,
    duration,
    ease,
    contentDelay,
    imageZoom,
    titleParallax,
    smoothScroll,
    lerp,
    scope,
  ]);

  const css =
    "." +
    scope +
    " .oh__inner,." +
    scope +
    " .line{will-change:transform;}" +
    "." +
    scope +
    " .line{transform-origin:0;white-space:nowrap;}" +
    "body." +
    scope +
    "-locked{overflow:hidden;height:100vh;}" +
    "@keyframes " +
    scope +
    "-load{to{opacity:1;transform:scale3d(.5,.5,1);}}" +
    "." +
    scope +
    " .loader-dot{animation:" +
    scope +
    "-load .7s linear infinite alternate forwards;}" +
    "." +
    scope +
    ".content-open .preview-wrap{pointer-events:none;}" +
    "." +
    scope +
    ".content-open .action{visibility:visible;pointer-events:auto;}" +
    "." +
    scope +
    " .content--current{position:relative;pointer-events:auto;opacity:1;}" +
    "." +
    scope +
    " .content .preview__img{grid-area:1 / 1;}" +
    "@media screen and (min-width:768px){" +
    "." +
    scope +
    " .content .preview__img{grid-area:2 / 1;}" +
    "." +
    scope +
    " .content__thumbs-item{width:" +
    thumbSize +
    "px;}}";

  return (
    <div
      ref={rootRef}
      className={
        scope + " relative grid w-full grid-cols-1 md:grid-cols-[auto_1fr]"
      }
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{css}</style>

      {!ready ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="loader-dot h-[60px] w-[60px] rounded-full opacity-40"
            style={{ backgroundColor: loaderColor }}
          />
        </div>
      ) : null}

      {showFrame ? (
        <div
          className="frame z-[1000] grid content-between gap-y-[5vh] p-6 text-[0.85rem] uppercase [grid-area:1/1] md:sticky md:top-0 md:h-screen md:p-8 md:opacity-50"
          style={{ backgroundColor: bgColor }}
        >
          <h1 className="m-0 text-base font-normal leading-none md:justify-self-start md:rotate-180 md:[writing-mode:vertical-rl]">
            {frameLabel}
          </h1>
          <span className="md:justify-self-start md:rotate-180 md:[writing-mode:vertical-rl]">
            {frameNote}
          </span>
        </div>
      ) : null}

      <section className="preview-wrap relative z-[100] px-8 pb-12 [grid-area:2/1] md:[grid-area:1/2]">
        {items.map((item, i) => (
          <div
            key={i}
            className="preview mx-auto grid w-full grid-cols-[100%] grid-rows-[100%] pt-12 will-change-transform"
            style={{ minHeight: previewMinHeight }}
          >
            <div className="preview__img-wrap cursor-pointer [grid-area:1/1/-1/-1]">
              <div className="preview__img relative h-full w-full overflow-hidden">
                <div
                  className="preview__img-inner h-full w-full bg-no-repeat"
                  style={{
                    backgroundImage: "url(" + item.image + ")",
                    backgroundSize: backgroundSize,
                    backgroundPosition: "0% 0%",
                  }}
                />
              </div>
            </div>
            <div className="preview__title pointer-events-none relative translate-y-1/2 self-center justify-self-center text-center [grid-area:1/1/-1/-1]">
              <h2
                className="preview__title-main m-0 text-[clamp(2rem,10vw,8rem)] font-light leading-[1.2]"
                style={{ fontFamily: displayFont }}
              >
                <span className="oh block">
                  <span className="oh__inner">{item.title}</span>
                </span>
                <span className="oh block -translate-y-1/3 px-4 font-medium italic">
                  <span className="oh__inner">{item.subtitle}</span>
                </span>
              </h2>
              <p className="preview__desc mx-auto max-w-[400px] text-[0.8rem] uppercase leading-[1.2]">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-wrap pointer-events-none sticky top-0 grid h-screen grid-rows-[auto_1fr] overflow-hidden p-8 [grid-area:2/1] md:[grid-area:1/2]">
        <button
          type="button"
          className="action action--back invisible pointer-events-none row-start-1 flex cursor-pointer items-center gap-4 justify-self-start border-0 bg-transparent p-0 py-4 font-[inherit] uppercase opacity-0 [fill:currentColor]"
        >
          <svg width="25" height="25" viewBox="0 0 25 25" aria-hidden="true">
            <path d="M24 12.001H2.914l5.294-5.295-.707-.707L1 12.501l6.5 6.5.707-.707-5.293-5.293H24v-1z" />
          </svg>
          <span>{backLabel}</span>
        </button>

        {items.map((item, i) => (
          <div
            key={i}
            className="content pointer-events-none absolute left-0 top-0 row-start-2 grid h-full grid-cols-1 grid-rows-[20vh_min-content_auto] gap-[2vw] opacity-0 md:grid-cols-[60%_1fr] md:grid-rows-[2rem_1fr_auto_1rem]"
          >
            <div className="content__group [grid-area:3/1] md:row-span-2 md:[grid-area:2/2]">
              <div
                className="content__title text-[clamp(3rem,6.5vw,5.5rem)] font-normal leading-[1.05]"
                style={{ fontFamily: displayFont }}
              >
                <span className="oh block">
                  <span className="oh__inner">{item.title}</span>
                </span>
                <span className="oh block -translate-y-1/4 pl-3 font-medium italic">
                  <span className="oh__inner">{item.subtitle}</span>
                </span>
              </div>
              <div
                className="content__meta oh mb-8 text-[0.8rem] uppercase"
                style={{ color: mutedColor }}
              >
                <span className="oh__inner">{item.meta}</span>
              </div>
              <div
                className="content__text md:max-w-[400px]"
                data-text={item.text}
              >
                {item.text}
              </div>
            </div>

            <div className="content__thumbs grid auto-cols-auto grid-flow-col justify-start gap-[2vw] [grid-area:2/1] md:[grid-area:3/1]">
              {(item.thumbs || []).map((thumb, t) => (
                <div
                  key={t}
                  className="content__thumbs-item aspect-[1.5] w-[50px] bg-cover bg-center"
                  style={{ backgroundImage: "url(" + thumb + ")" }}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
