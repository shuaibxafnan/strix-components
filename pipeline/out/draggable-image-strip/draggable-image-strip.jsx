"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const IMAGES = [
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

const TITLES = [
  "Assemblage",
  "Wherewithal",
  "Surreptitious",
  "Onomatopoeia",
  "Nemesis",
  "Penumbra",
  "Cathedral",
  "Propinquity",
  "Lissome",
  "Moiety",
  "Mondegreen",
  "Gambol",
  "Forbearance",
  "Evanescent",
  "Embrocation",
  "Bucolic",
];

const SIZE_CYCLE = ["s", "m", "xl", "l", "s", "m", "s", "l", "s", "base"];

const DEFAULT_TEXT =
  "Virtually no important undertaking is now carried on without it, whether that enterprise be building a cathedral, endowing a university, marketing a moving picture, floating a large bond issue, or electing a president.";

const DEFAULT_ITEMS = IMAGES.map((image, i) => ({
  image,
  title: TITLES[i],
  text: DEFAULT_TEXT,
  size: SIZE_CYCLE[i % SIZE_CYCLE.length],
}));

const DEFAULT_SIZES = { s: 300, m: 360, l: 390, xl: 420, base: 450 };

const lerpVal = (a, b, n) => (1 - n) * a + n * b;
const lineEq = (y2, y1, x2, x1, v) => {
  const m = (y2 - y1) / (x2 - x1);
  return m * v + (y1 - m * x1);
};
const randFloat = (min, max) => Math.random() * (max - min) + min;

export default function DraggableImageStrip({
  items = DEFAULT_ITEMS,
  sizes = DEFAULT_SIZES,
  aspect = 0.7,
  bgColor = "#000000",
  textColor = "#767676",
  accentColor = "#c35340",
  accentHoverColor = "#ffffff",
  indicatorColor = "#1b1b1b",
  heading = "Morandi",
  subheading = "2019",
  coverTitle = "Morandi",
  coverSubtitle = "2019",
  displayFont = "Georgia, 'Times New Roman', serif",
  bodyFont = "Georgia, 'Times New Roman', serif",
  dragScale = 0.8,
  dragOpacity = 0.3,
  dragImageScale = 1.6,
  coverScale = 0.75,
  lerp = 0.1,
  overdragFactor = 0.5,
  imageBleed = 20,
  stripHeight = "100vh",
  minStripHeight = "750px",
  openDuration = 1,
  showIndicator = true,
  showCover = true,
  customCursor = true,
  className = "",
}) {
  const rawId = useId();
  const uid = useMemo(
    () => "ds-" + rawId.replace(/[^a-zA-Z0-9]/g, ""),
    [rawId],
  );

  const outerRef = useRef(null);
  const stripRef = useRef(null);
  const dragRef = useRef(null);
  const coverRef = useRef(null);
  const indicatorRef = useRef(null);
  const cursorRef = useRef(null);
  const closeRef = useRef(null);

  const itemRefs = useRef([]);
  const imgRefs = useRef([]);
  const contentRefs = useRef([]);
  const contentImgRefs = useRef([]);
  const contentTitleRefs = useRef([]);
  const contentTextRefs = useRef([]);

  const gsapRef = useRef(null);
  const stateRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    let rafId;

    const st = {
      dragPosition: 0,
      pointerId: null,
      startX: 0,
      startPosition: 0,
      dragging: false,
      maxDrag: 0,
      animating: false,
      mouse: { x: 0, y: 0 },
      cursor: { x: 0, y: 0, scale: 1, lastScale: 1 },
      styles: {
        position: { previous: 0, current: 0 },
        scale: { previous: 1, current: 1 },
        imgScale: { previous: 1, current: 1 },
        opacity: { previous: 1, current: 1 },
        coverScale: { previous: coverScale, current: coverScale },
        coverOpacity: { previous: 0, current: 0 },
        indicatorScale: { previous: 1, current: 1 },
      },
      paused: false,
    };
    stateRef.current = st;

    let teardown = null;

    import("gsap")
      .then((mod) => {
        if (cancelled) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap || !stripRef.current) return;
        gsapRef.current = gsap;

        const measure = () => {
          const stripW = stripRef.current ? stripRef.current.offsetWidth : 0;
          const winW = window.innerWidth;
          st.maxDrag = stripW < winW ? 0 : stripW - winW;
          if (st.dragPosition < -st.maxDrag) {
            st.dragPosition = -st.maxDrag;
            st.styles.position.current = st.dragPosition;
          }
        };
        measure();
        window.addEventListener("resize", measure);

        const render = () => {
          rafId = requestAnimationFrame(render);
          const s = st.styles;

          if (!st.paused) {
            for (const key in s) {
              s[key].previous = lerpVal(s[key].previous, s[key].current, lerp);
            }
            gsap.set(stripRef.current, { x: s.position.previous });
            itemRefs.current.forEach((el, i) => {
              if (!el) return;
              gsap.set(el, {
                scale: s.scale.previous,
                opacity: s.opacity.previous,
              });
              if (imgRefs.current[i]) {
                gsap.set(imgRefs.current[i], { scale: s.imgScale.previous });
              }
            });
            if (coverRef.current) {
              gsap.set(coverRef.current, {
                scale: s.coverScale.previous,
                opacity: s.coverOpacity.previous,
              });
            }
            if (indicatorRef.current) {
              gsap.set(indicatorRef.current, {
                scaleX: s.indicatorScale.previous,
              });
            }
          }

          if (customCursor && cursorRef.current) {
            const c = st.cursor;
            const b = 12.5;
            c.x = lerpVal(c.x, st.mouse.x - b, 0.2);
            c.y = lerpVal(c.y, st.mouse.y - b, 0.2);
            c.lastScale = lerpVal(c.lastScale, c.scale, 0.15);
            cursorRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.lastScale})`;
          }
        };
        rafId = requestAnimationFrame(render);

        const onMove = (e) => {
          st.mouse = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", onMove);

        teardown = () => {
          window.removeEventListener("resize", measure);
          window.removeEventListener("mousemove", onMove);
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (teardown) teardown();
      const g = gsapRef.current;
      if (g) {
        g.killTweensOf([
          stripRef.current,
          coverRef.current,
          indicatorRef.current,
          closeRef.current,
          ...itemRefs.current,
          ...imgRefs.current,
          ...contentImgRefs.current,
          ...contentTitleRefs.current,
          ...contentTextRefs.current,
        ]);
      }
    };
  }, [ lerp, coverScale, customCursor]);

  const onPointerDown = (e) => {
    const st = stateRef.current;
    if (!st || st.animating || st.pointerId !== null) return;
    st.pointerId = e.pointerId;
    st.startX = e.clientX;
    st.startPosition = st.dragPosition;
    st.dragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);

    st.styles.scale.current = dragScale;
    st.styles.imgScale.current = dragImageScale;
    st.styles.opacity.current = dragOpacity;
    st.styles.coverScale.current = 1;
    st.styles.coverOpacity.current = 1;
    st.styles.indicatorScale.current = 0;
    st.cursor.scale = 1.5;
  };

  const onPointerMove = (e) => {
    const st = stateRef.current;
    if (!st || !st.dragging || st.pointerId !== e.pointerId) return;
    const winW = window.innerWidth;
    const raw = st.startPosition + (e.clientX - st.startX);

    if (raw >= 0) {
      st.dragPosition = lineEq(overdragFactor * winW, 0, winW, 0, raw);
    } else if (raw < -st.maxDrag) {
      st.dragPosition = lineEq(
        -st.maxDrag - overdragFactor * winW,
        -st.maxDrag,
        -st.maxDrag - winW,
        -st.maxDrag,
        raw,
      );
    } else {
      st.dragPosition = raw;
    }
    st.styles.position.current = st.dragPosition;
  };

  const onPointerUp = (e) => {
    const st = stateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    st.pointerId = null;
    st.dragging = false;

    if (st.dragPosition > 0) st.dragPosition = 0;
    else if (st.dragPosition < -st.maxDrag) st.dragPosition = -st.maxDrag;

    st.startPosition = st.dragPosition;
    st.styles.position.current = st.dragPosition;
    st.styles.scale.current = 1;
    st.styles.imgScale.current = 1;
    st.styles.opacity.current = 1;
    st.styles.coverScale.current = coverScale;
    st.styles.coverOpacity.current = 0;
    st.styles.indicatorScale.current = 1;
    st.cursor.scale = 1;
  };

  const showItem = (index) => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap || !st || st.animating || openIndex !== -1) return;
    st.animating = true;
    st.paused = true;
    setOpenIndex(index);

    const winH = window.innerHeight;
    const els = itemRefs.current.filter(Boolean);
    const imgs = imgRefs.current.filter(Boolean);

    requestAnimationFrame(() => {
      const cImg = contentImgRefs.current[index];
      const cTitle = contentTitleRefs.current[index];
      const cText = contentTextRefs.current[index];

      if (coverRef.current)
        gsap.set(coverRef.current, { scale: 0, opacity: 0 });

      const tl = gsap.timeline({ onComplete: () => (st.animating = false) });
      tl.set([cImg, cTitle, cText, closeRef.current], { opacity: 0 }, 0)
        .to(
          els,
          { duration: 0.8, ease: "power2.out", scale: dragScale, opacity: 0.4 },
          0,
        )
        .to(
          imgs,
          { duration: 0.8, ease: "power2.out", scale: dragImageScale },
          0,
        );

      if (indicatorRef.current) {
        tl.to(
          indicatorRef.current,
          { duration: 0.8, ease: "power2.out", scaleX: 0 },
          0,
        );
      }

      els.forEach((el) => {
        tl.to(
          el,
          { duration: openDuration, ease: "expo.inOut", y: -winH },
          randFloat(0.2, 0.4),
        );
      });

      tl.fromTo(
        cImg,
        { y: winH * 1.3, opacity: 1 },
        { duration: openDuration, ease: "expo.inOut", y: 0 },
        0.6,
      )
        .fromTo(
          cTitle,
          { y: 100, opacity: 0 },
          { duration: 0.8, ease: "power4.out", y: 0, opacity: 1 },
          1,
        )
        .fromTo(
          cText,
          { y: 200, opacity: 0 },
          { duration: 0.8, ease: "power4.out", y: 0, opacity: 1 },
          1,
        )
        .fromTo(
          closeRef.current,
          { y: 50, opacity: 0 },
          { duration: 0.8, ease: "power4.out", y: 0, opacity: 1 },
          1,
        );
    });
  };

  const closeContent = () => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap || !st || st.animating || openIndex === -1) return;
    st.animating = true;

    const index = openIndex;
    const winH = window.innerHeight;
    const els = itemRefs.current.filter(Boolean);
    const imgs = imgRefs.current.filter(Boolean);
    const cImg = contentImgRefs.current[index];
    const cTitle = contentTitleRefs.current[index];
    const cText = contentTextRefs.current[index];

    const tl = gsap.timeline({
      onComplete: () => {
        st.animating = false;
        st.paused = false;
        setOpenIndex(-1);
      },
    });

    tl.set(els, { scale: 1, opacity: 1 }, 0)
      .set(imgs, { scale: 1 }, 0)
      .to(cText, { duration: 0.8, ease: "power4.in", y: 200, opacity: 0 }, 0)
      .to(cTitle, { duration: 0.8, ease: "power4.in", y: 100, opacity: 0 }, 0)
      .to(
        closeRef.current,
        { duration: 0.8, ease: "power4.out", y: 50, opacity: 0 },
        0.2,
      )
      .to(
        cImg,
        {
          duration: openDuration,
          ease: "expo.inOut",
          y: winH * 1.3,
          opacity: 1,
        },
        0.2,
      );

    els.forEach((el) => {
      tl.to(
        el,
        { duration: randFloat(0.6, 0.9), ease: "expo.inOut", y: 0 },
        randFloat(0.4, 0.6),
      );
    });

    if (indicatorRef.current) {
      tl.to(
        indicatorRef.current,
        { duration: 1.2, ease: "expo.out", scaleX: 1 },
        0.5,
      );
    }
  };

  const onNumberEnter = (i) => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap) return;
    if (st) st.cursor.scale = 1.9;
    const inner = document.getElementById(`${uid}-num-${i}`);
    if (!inner) return;
    gsap
      .timeline()
      .to(
        inner,
        { duration: 0.2, ease: "power2.out", y: "-100%", opacity: 0 },
        0,
      )
      .fromTo(
        inner,
        { y: "100%", opacity: 0, scale: 1.3 },
        { duration: 0.5, ease: "expo.out", y: "0%", opacity: 1, scale: 1 },
        0.2,
      );
  };

  const onNumberLeave = (i) => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (st) st.cursor.scale = 1;
    if (!gsap) return;
    const inner = document.getElementById(`${uid}-num-${i}`);
    if (!inner) return;
    gsap.killTweensOf(inner);
    gsap.set(inner, { scale: 1, y: "0%", opacity: 1 });
  };

  const frameHeight = (size) => sizes[size] || sizes.base || 450;

  return (
    <div
      className={`${uid} relative w-full overflow-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        height: stripHeight,
        minHeight: minStripHeight,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
.${uid} { cursor: ${customCursor ? "none" : "auto"}; }
.${uid} .${uid}-num-link:hover ~ .${uid}-plus { display: block; }
.${uid} .${uid}-close:hover { color: ${accentHoverColor}; }
.${uid}-cover-title {
  -webkit-text-stroke: 2px ${accentColor};
  -webkit-text-fill-color: transparent;
  color: transparent;
}
@media (hover: none) { .${uid} { cursor: auto; } }
`,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-40 grid grid-cols-1 content-between p-6 md:grid-cols-[80%_20%] md:px-12 md:py-5"
        style={{ color: accentColor }}
      >
        <h1
          className="m-0 text-[1rem] font-normal"
          style={{ fontFamily: displayFont }}
        >
          {heading}
        </h1>
        <div className="flex items-end justify-between md:col-span-2">
          {showIndicator ? (
            <div
              ref={indicatorRef}
              className="h-2 w-12 origin-left"
              style={{ backgroundColor: indicatorColor }}
            />
          ) : (
            <span />
          )}
          <h3
            className="m-0 text-[1rem] font-normal"
            style={{ fontFamily: displayFont }}
          >
            {subheading}
          </h3>
        </div>
      </div>

      <div
        ref={outerRef}
        className="relative flex h-full flex-col justify-center overflow-hidden"
      >
        <div className="relative h-full w-fit">
          <div
            ref={dragRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute left-0 top-1/2 z-20 h-[500px] w-full -translate-y-1/2 touch-pan-y"
          />
          <div
            ref={stripRef}
            className="pointer-events-none relative flex h-full w-fit items-start"
          >
            {items.map((item, i) => {
              const h = frameHeight(item.size);
              return (
                <div
                  key={i}
                  ref={(el) => (itemRefs.current[i] = el)}
                  className="relative flex h-full flex-col-reverse justify-center will-change-transform"
                >
                  <div
                    className="relative flex-none overflow-hidden"
                    style={{ height: `${h}px`, width: `${h * aspect}px` }}
                  >
                    <div
                      ref={(el) => (imgRefs.current[i] = el)}
                      className="absolute bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${item.image})`,
                        width: `calc(100% + ${imageBleed * 2}px)`,
                        height: `calc(100% + ${imageBleed * 2}px)`,
                        left: `-${imageBleed}px`,
                        top: `-${imageBleed}px`,
                      }}
                    />
                  </div>
                  <span
                    className="relative flex select-none items-center justify-between p-2"
                    style={{ color: accentColor, fontFamily: displayFont }}
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => showItem(i)}
                      onKeyDown={(e) =>
                        e.key === "Enter" ? showItem(i) : null
                      }
                      onMouseEnter={() => onNumberEnter(i)}
                      onMouseLeave={() => onNumberLeave(i)}
                      className={`${uid}-num-link pointer-events-auto relative block cursor-pointer overflow-hidden`}
                    >
                      <span id={`${uid}-num-${i}`} className="block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span
                      className={`${uid}-plus ml-2 hidden h-3 w-3`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;charset=UTF-8,%3csvg width='13' height='13' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M7 6h6v1H7v6H6V7H0V6h6V0h1v6z' fill='%23505050'/%3e%3c/svg%3e\")",
                        backgroundSize: "100%",
                      }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {showCover && (
          <div
            ref={coverRef}
            className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center opacity-0"
            style={{ color: accentColor }}
          >
            <h2
              className={`${uid}-cover-title m-0 text-[20vw] leading-none md:text-[15vw]`}
              style={{ fontFamily: displayFont }}
            >
              {coverTitle}
            </h2>
            <span
              className="text-2xl md:text-5xl"
              style={{ fontFamily: displayFont }}
            >
              {coverSubtitle}
            </span>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute left-0 top-0 z-30 h-full w-full">
        {items.map((item, i) => (
          <article
            key={i}
            ref={(el) => (contentRefs.current[i] = el)}
            className={`absolute left-0 top-0 h-full w-full items-center gap-0 ${
              openIndex === i
                ? "pointer-events-auto grid opacity-100"
                : "hidden opacity-0"
            } grid-cols-1 grid-rows-[50%_40%_10%] md:grid-cols-[40%_45%_15%] md:grid-rows-[100%]`}
          >
            <div
              ref={(el) => (contentImgRefs.current[i] = el)}
              className="relative order-1 h-full w-auto overflow-hidden will-change-transform md:order-2"
            >
              <div
                className="absolute bg-cover"
                style={{
                  backgroundImage: `url(${item.image})`,
                  backgroundPosition: "50% 35%",
                  width: `calc(100% + ${imageBleed * 2}px)`,
                  height: `calc(100% + ${imageBleed * 2}px)`,
                  left: `-${imageBleed}px`,
                  top: `-${imageBleed}px`,
                }}
              />
            </div>
            <div className="order-2 px-8 py-6 md:order-1 md:max-w-[240px] md:justify-self-end md:self-end md:text-right">
              <h2
                ref={(el) => (contentTitleRefs.current[i] = el)}
                className="font-normal will-change-transform"
                style={{ color: accentColor, fontFamily: displayFont }}
              >
                {item.title}
              </h2>
              <p
                ref={(el) => (contentTextRefs.current[i] = el)}
                className="m-0 will-change-transform"
                style={{ color: textColor }}
              >
                {item.text}
              </p>
            </div>
          </article>
        ))}

        <button
          ref={closeRef}
          type="button"
          onClick={closeContent}
          aria-label="Close preview"
          className={`${uid}-close absolute bottom-6 left-12 m-0 border-0 bg-transparent p-0 opacity-0 ${
            openIndex === -1 ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{ color: accentColor }}
        >
          <svg width="12" height="26" viewBox="0 0 12 26" fill="currentColor">
            <path d="M5.293 25H5v-.293l-5-5L.707 19 5 23.293V0h1v23.657L10.657 19l.707.707-5.657 5.657-.025-.025-.025.025L5.293 25z" />
          </svg>
        </button>
      </div>

      {customCursor && (
        <div
          ref={cursorRef}
          className="pointer-events-none absolute left-0 top-0 z-50 h-[25px] w-[25px] rounded-full border border-white mix-blend-difference"
        />
      )}
    </div>
  );
}
