"use client";

import { useEffect, useId, useRef, useState } from "react";

const POOL = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=600&q=80",
];

const pick = (start, count) =>
  Array.from({ length: count }, (_, i) => POOL[(start + i) % POOL.length]);

const RELEASES = [
  { title: "Nobody's Love", images: pick(5, 4), previewImages: pick(21, 4) },
  { title: "Good Wings", images: pick(0, 5), previewImages: pick(18, 3) },
  { title: "Maniac Fly", images: pick(9, 6), previewImages: pick(15, 2) },
  { title: "Crumble Toe", images: pick(15, 3), previewImages: pick(11, 5) },
  { title: "Finger Wax", images: pick(18, 4), previewImages: pick(8, 4) },
  { title: "Haunted X", images: pick(22, 6), previewImages: pick(4, 2) },
  { title: "Next Horror", images: pick(2, 5), previewImages: pick(12, 3) },
];

export default function PolaroidMenu({
  items = RELEASES,
  bgColor = "#ffffff",
  textColor = "#131313",
  borderColor = "#f0f0f0",
  hoverBgColor = "#f0f0f0",
  fontsHref = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500&family=Space+Mono:wght@400&family=Silkscreen:wght@400;700&display=swap",
  displayFont = "Archivo, Helvetica, Arial, sans-serif",
  bodyFont = "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  switchFont = "Silkscreen, 'Courier New', monospace",
  imgSize = "5vw",
  imgSizeLarge = "14vw",
  imageGap = "1vw",
  imageGapLarge = "2vw",
  gridColumns = 4,
  gridRows = 2,
  coverDuration = 0.9,
  flipDuration = 0.9,
  flipStagger = 0.04,
  titleDuration = 1,
  hoverDuration = 0.4,
  closeDuration = 0.5,
  closeLabel = "✕",
  loaderColor = "#000000",
  className = "",
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const scope = "mgr-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    if (
      fontsHref &&
      !document.querySelector('link[data-id="' + fontsHref + '"]')
    ) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontsHref;
      link.setAttribute("data-id", fontsHref);
      document.head.appendChild(link);
    }

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

    const boot = async () => {
      const gsapMod = await import("gsap");
      const flipMod = await import("gsap/Flip");
      if (cancelled) return;
      const root = rootRef.current;
      const gsap = gsapMod.gsap || gsapMod.default;
      const Flip = flipMod.Flip || flipMod.default;
      if (!root || !gsap || !Flip) return;

      gsap.registerPlugin(Flip);

      const rowEls = [...root.querySelectorAll(".row")];
      const previewItemEls = [...root.querySelectorAll(".preview__item")];
      const cover = root.querySelector(".cover");
      const closeCtrl = root.querySelector(".preview__close");

      const rowsArr = rowEls.map((el, position) => {
        const previewEl = previewItemEls[position];
        const titleWrap = el.querySelector(".cell__title");
        const imagesWrap = el.querySelector(".cell--images");
        const gridEl = previewEl.querySelector(".preview__grid");
        return {
          el,
          titleWrap,
          title: titleWrap.querySelector(".oh__inner"),
          imagesWrap,
          images: [...imagesWrap.querySelectorAll(".cell__img")],
          preview: {
            el: previewEl,
            title: previewEl.querySelector(".preview__item-title > .oh__inner"),
            grid: gridEl,
            images: [...gridEl.querySelectorAll(".cell__img")],
          },
        };
      });

      let isOpen = false;
      let isAnimating = false;
      let currentRow = -1;
      let mouseenterTimeline = null;

      rowsArr.forEach((row) => {
        const onEnter = () => {
          if (isOpen) return;
          gsap.killTweensOf([row.images, row.title]);

          mouseenterTimeline = gsap
            .timeline()
            .addLabel("start", 0)
            .to(
              row.images,
              {
                duration: hoverDuration,
                ease: "power3",
                startAt: { scale: 0.8, xPercent: 20 },
                scale: 1,
                xPercent: 0,
                opacity: 1,
                stagger: -0.035,
              },
              "start",
            )
            .set(row.title, { transformOrigin: "0% 50%" }, "start")
            .to(
              row.title,
              {
                duration: 0.1,
                ease: "power1.in",
                yPercent: -100,
                onComplete: () =>
                  row.titleWrap.classList.add("cell__title--switch"),
              },
              "start",
            )
            .to(
              row.title,
              {
                duration: 0.5,
                ease: "expo",
                startAt: { yPercent: 100, rotation: 15 },
                yPercent: 0,
                rotation: 0,
              },
              "start+=0.1",
            );
        };

        const onLeave = () => {
          if (isOpen) return;
          gsap.killTweensOf([row.images, row.title]);

          gsap
            .timeline()
            .addLabel("start")
            .to(
              row.images,
              {
                duration: hoverDuration,
                ease: "power4",
                opacity: 0,
                scale: 0.8,
              },
              "start",
            )
            .to(
              row.title,
              {
                duration: 0.1,
                ease: "power1.in",
                yPercent: -100,
                onComplete: () =>
                  row.titleWrap.classList.remove("cell__title--switch"),
              },
              "start",
            )
            .to(
              row.title,
              {
                duration: 0.5,
                ease: "expo",
                startAt: { yPercent: 100, rotation: 15 },
                yPercent: 0,
                rotation: 0,
              },
              "start+=0.1",
            );
        };

        const onClick = () => {
          if (isAnimating) return;
          isAnimating = true;
          isOpen = true;
          currentRow = rowsArr.indexOf(row);

          gsap.killTweensOf([cover, rowsArr.map((r) => r.title)]);

          gsap
            .timeline({
              onStart: () => {
                document.body.classList.add(scope + "-locked");
                row.el.classList.add("row--current");
                row.preview.el.classList.add("preview__item--current");

                gsap.set(row.preview.images, { opacity: 0 });
                gsap.set(cover, {
                  height: row.el.offsetHeight - 1,
                  top: row.el.getBoundingClientRect().top,
                  opacity: 1,
                });
                gsap.set(row.preview.title, {
                  yPercent: -100,
                  rotation: 15,
                  transformOrigin: "100% 50%",
                });

                closeCtrl.classList.add("preview__close--show");
              },
              onComplete: () => {
                isAnimating = false;
              },
            })
            .addLabel("start", 0)
            .to(
              cover,
              {
                duration: coverDuration,
                ease: "power4.inOut",
                height: window.innerHeight,
                top: 0,
              },
              "start",
            )
            .to(
              rowsArr.map((r) => r.title),
              {
                duration: 0.5,
                ease: "power4.inOut",
                yPercent: (_, target) =>
                  target.getBoundingClientRect().top >
                  row.el.getBoundingClientRect().top
                    ? 100
                    : -100,
                rotation: 0,
              },
              "start",
            )
            .add(() => {
              if (mouseenterTimeline) mouseenterTimeline.progress(1, false);
              const flipstate = Flip.getState(row.images, { simple: true });
              row.preview.grid.prepend(...row.images);
              Flip.from(flipstate, {
                duration: flipDuration,
                ease: "power4.inOut",
                stagger: flipStagger,
              }).to(
                row.preview.images,
                {
                  duration: flipDuration,
                  ease: "power4.inOut",
                  startAt: {
                    scale: 0,
                    yPercent: () => gsap.utils.random(0, 200),
                  },
                  scale: 1,
                  opacity: 1,
                  yPercent: 0,
                  stagger: flipStagger,
                },
                flipStagger * row.images.length,
              );
            }, "start")
            .to(
              row.preview.title,
              {
                duration: titleDuration,
                ease: "power4.inOut",
                yPercent: 0,
                rotation: 0,
                onComplete: () =>
                  row.titleWrap.classList.remove("cell__title--switch"),
              },
              "start",
            )
            .to(
              closeCtrl,
              { duration: titleDuration, ease: "power4.inOut", opacity: 1 },
              "start",
            );
        };

        row.el.addEventListener("mouseenter", onEnter);
        row.el.addEventListener("mouseleave", onLeave);
        row.el.addEventListener("click", onClick);
        cleanups.push(() => {
          row.el.removeEventListener("mouseenter", onEnter);
          row.el.removeEventListener("mouseleave", onLeave);
          row.el.removeEventListener("click", onClick);
        });
      });

      const onClose = () => {
        if (isAnimating) return;
        isAnimating = true;
        isOpen = false;

        const row = rowsArr[currentRow];
        if (!row) return;

        gsap
          .timeline({
            defaults: { duration: closeDuration, ease: "power4.inOut" },
            onStart: () => document.body.classList.remove(scope + "-locked"),
            onComplete: () => {
              row.el.classList.remove("row--current");
              row.preview.el.classList.remove("preview__item--current");
              isAnimating = false;
            },
          })
          .addLabel("start", 0)
          .to(
            [row.images, row.preview.images],
            {
              scale: 0,
              opacity: 0,
              stagger: flipStagger,
              onComplete: () => row.imagesWrap.prepend(...row.images),
            },
            0,
          )
          .to(row.preview.title, { duration: 0.6, yPercent: 100 }, "start")
          .to(closeCtrl, { opacity: 0 }, "start")
          .to(
            cover,
            {
              ease: "power4",
              height: 0,
              top: row.el.getBoundingClientRect().top + row.el.offsetHeight / 2,
            },
            "start+=0.4",
          )
          .to(cover, { duration: 0.3, opacity: 0 }, "start+=0.9")
          .to(
            rowsArr.map((r) => r.title),
            {
              yPercent: 0,
              stagger: { each: 0.03, grid: "auto", from: currentRow },
            },
            "start+=0.4",
          );
      };

      closeCtrl.addEventListener("click", onClose);
      cleanups.push(() => closeCtrl.removeEventListener("click", onClose));

      const waitForFonts = document.fonts
        ? document.fonts.ready.catch(() => null)
        : Promise.resolve();
      await Promise.all([
        preloadBackgrounds([...root.querySelectorAll(".cell__img-inner")]),
        waitForFonts,
      ]);
      if (!cancelled) setReady(true);
    };

    boot().catch(() => setReady(true));

    return () => {
      cancelled = true;
      document.body.classList.remove(scope + "-locked");
      cleanups.forEach((fn) => fn());
    };
  }, [
    items,
    coverDuration,
    flipDuration,
    flipStagger,
    titleDuration,
    hoverDuration,
    closeDuration,
    fontsHref,
    scope,
  ]);

  const css =
    "body." +
    scope +
    "-locked{overflow:hidden;}" +
    "." +
    scope +
    " .row--current{z-index:11;}" +
    "." +
    scope +
    " .cell__title{font-family:" +
    displayFont +
    ";}" +
    "." +
    scope +
    " .cell__title--switch{font-family:" +
    switchFont +
    ";font-weight:700;}" +
    "." +
    scope +
    " .preview__close--show{pointer-events:auto;}" +
    "." +
    scope +
    " .preview__item--current{pointer-events:auto;height:100vh;opacity:1;}" +
    "." +
    scope +
    " .cell--images .cell__img{width:" +
    imgSize +
    ";}" +
    "." +
    scope +
    " .preview__grid .cell__img{width:" +
    imgSizeLarge +
    ";}";

  return (
    <div
      ref={rootRef}
      className={
        scope +
        " relative w-full overflow-x-hidden font-light uppercase [-webkit-font-smoothing:antialiased] " +
        className
      }
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      <style>{css}</style>

      {!ready ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="h-[60px] w-[60px] animate-pulse rounded-full opacity-40"
            style={{ backgroundColor: loaderColor }}
          />
        </div>
      ) : null}

      <div
        className="relative z-[100]"
        style={{ borderBottom: "1px solid " + borderColor }}
      >
        <div
          className="cover pointer-events-none fixed left-0 z-10 h-0 w-full opacity-0 [will-change:height,top]"
          style={{ backgroundColor: hoverBgColor }}
        />

        {items.map((item, i) => (
          <div
            key={i}
            className="row relative z-[1] grid cursor-pointer grid-cols-[auto_1fr] items-center gap-x-[5vw] px-8 py-4 transition-colors duration-300 ease-out hover:bg-[var(--rowhover)] lg:px-16 lg:py-8"
            style={{
              gridTemplateRows: imgSize,
              borderTop: "1px solid " + borderColor,
              "--rowhover": hoverBgColor,
            }}
          >
            <div className="relative">
              <h2 className="cell__title oh relative overflow-hidden m-0 grid grid-rows-[100%_100%] whitespace-nowrap text-[clamp(1.953rem,4vw,3.052rem)] font-normal leading-none">
                <span className="oh__inner inline-block [will-change:transform]">
                  {item.title}
                </span>
              </h2>
            </div>

            <div
              className="cell--images ml-auto grid auto-cols-auto grid-flow-col content-center justify-end"
              style={{ gap: imageGap }}
            >
              {item.images.map((src, j) => (
                <div
                  key={j}
                  className="cell__img relative grid grid-cols-[100%] grid-rows-[auto_auto] opacity-0 [will-change:transform,opacity]"
                >
                  <div
                    className="cell__img-inner aspect-square w-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url(" + src + ")",
                      borderRadius: "calc(" + imageGap + " / 3)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="preview pointer-events-none fixed left-0 top-0 z-[200] h-full w-full">
        <button
          type="button"
          className="preview__close pointer-events-none absolute right-0 top-0 m-0 cursor-pointer border-0 bg-transparent p-8 font-sans text-[2rem] font-normal leading-none opacity-0"
        >
          {closeLabel}
        </button>

        {items.map((item, i) => (
          <div
            key={i}
            className="preview__item grid h-0 w-full content-center items-center justify-items-center gap-[10vh] overflow-hidden opacity-0"
          >
            <h2
              className="preview__item-title oh relative overflow-hidden m-0 whitespace-nowrap text-[clamp(1.563rem,6vw,3.815rem)] font-bold leading-none"
              style={{ fontFamily: switchFont }}
            >
              <span className="oh__inner inline-block [will-change:transform]">
                {item.title}
              </span>
            </h2>

            <div
              className="preview__grid relative grid w-full max-w-[1200px] justify-center justify-items-center"
              style={{
                gap: imageGapLarge,
                gridTemplateColumns:
                  "repeat(" + gridColumns + "," + imgSizeLarge + ")",
                gridTemplateRows:
                  "repeat(" + gridRows + "," + imgSizeLarge + ")",
              }}
            >
              {item.previewImages.map((src, j) => (
                <div
                  key={j}
                  className="cell__img relative grid grid-cols-[100%] grid-rows-[auto_auto] opacity-0 [will-change:transform,opacity]"
                >
                  <div
                    className="cell__img-inner aspect-square w-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url(" + src + ")",
                      borderRadius: "calc(" + imageGapLarge + " / 3)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
