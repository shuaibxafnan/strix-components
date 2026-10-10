"use client";

import { useEffect, useId, useRef } from "react";

// ─── DragTrailScatter ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    ITEMS      Each entry: { main, trails: [urls] }
// bgColor            string   #bc3d3d    Stage background
// title              string   Marlow...  Centered headline text
// showTitle          boolean  true       Render the headline
// titleColor         string   #ffffff    Headline color
// titleSize          string   10vw       Headline font size
// titleClassName     string   ""         Extra classes for the headline
// caption            string   Drag...    Small hint text in the corner
// showCaption        boolean  true       Render the hint text
// captionColor       string   #000000    Hint text color
// imageWidth         number   180        Draggable image width (px)
// imageHeight        number   250        Draggable image height (px)
// trailOpacity       number   0.8        Opacity of each trail image
// dragLagAmt         number   0.13       Lerp amount for the drag lag offset
// pressScale         number   0.8        Scale of the image while held
// scaleAmt           number   0.1        Lerp amount for the press scale
// trailScale         number   0.5        Scale trails expand to while dragging
// trailScaleAmt      number   0.1        Lerp amount for trail scale
// trailRotation      number   10         Max random trail rotation (+/- deg)
// trailRotationAmt   number   0.1        Lerp amount for trail rotation
// trailAmtMin        number   0.07       Lower bound of per-trail lerp amount
// trailAmtMax        number   0.11       Upper bound of per-trail lerp amount
// radiusDivisor      number   2.5        Divides (w+h) to get the scatter radius
// maxBlur            number   20         Peak blur applied to trails (px)
// blurDistance       number   400        Drag distance mapped to maxBlur
// gap                string   3rem       Spacing between multiple stacks
// className          string   ""         Extra classes for the root wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
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
    main: IMAGES[11],
    trails: [IMAGES[0], IMAGES[1], IMAGES[2], IMAGES[3], IMAGES[4], IMAGES[5]],
  },
];

const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const clamp = (val, min, max) => Math.max(Math.min(val, max), min);
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

export default function DragTrailScatter({
  items = DEFAULT_ITEMS,
  bgColor = "#bc3d3d",
  title = "Marlow Vance",
  showTitle = true,
  titleColor = "#ffffff",
  titleSize = "10vw",
  titleClassName = "",
  caption = "Drag the images",
  showCaption = true,
  captionColor = "#000000",
  imageWidth = 180,
  imageHeight = 250,
  trailOpacity = 0.8,
  dragLagAmt = 0.13,
  pressScale = 0.8,
  scaleAmt = 0.1,
  trailScale = 0.5,
  trailScaleAmt = 0.1,
  trailRotation = 10,
  trailRotationAmt = 0.1,
  trailAmtMin = 0.07,
  trailAmtMax = 0.11,
  radiusDivisor = 2.5,
  maxBlur = 20,
  blurDistance = 400,
  gap = "3rem",
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);

  const settings = useRef({});
  settings.current = {
    dragLagAmt,
    pressScale,
    scaleAmt,
    trailScale,
    trailScaleAmt,
    trailRotation,
    trailRotationAmt,
    radiusDivisor,
    maxBlur,
    blurDistance,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stacks = Array.from(root.querySelectorAll("[data-stack]"));
    if (!stacks.length) return;

    let raf = 0;
    let zIndex = 1;
    const teardown = [];

    const instances = stacks.map((el) => {
      const draggable = el.querySelector("[data-drag]");
      const trails = Array.from(el.querySelectorAll("[data-trail]"));
      const total = trails.length;

      const state = {
        el,
        draggable,
        trails,
        total,
        bounds: draggable.getBoundingClientRect(),
        position: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 },
        pointerStart: { x: 0, y: 0 },
        isDragging: false,
        pointerId: null,
        draggingPos: {
          previous: { x: 0, y: 0 },
          current: { x: 0, y: 0 },
        },
        outerScale: { previous: 1, current: 1 },
        trailsTranslation: Array.from({ length: total }, () => ({
          previous: { x: 0, y: 0 },
          current: { x: 0, y: 0 },
          random: { x: 0, y: 0 },
          amt: getRandomFloat(trailAmtMin, trailAmtMax),
        })),
        trailsScale: Array.from({ length: total }, () => ({
          previous: 0,
          current: 0,
        })),
        trailsRotation: Array.from({ length: total }, () => ({
          previous: 0,
          current: 0,
        })),
      };

      const onPointerDown = (event) => {
        if (state.isDragging) return;
        state.isDragging = true;
        state.pointerId = event.pointerId;
        draggable.setPointerCapture(event.pointerId);

        state.pointerStart = { x: event.clientX, y: event.clientY };
        state.startPosition = { x: state.position.x, y: state.position.y };
        state.draggingPos.previous = { x: 0, y: 0 };
        state.draggingPos.current = { x: 0, y: 0 };

        el.style.zIndex = String(zIndex++);
        state.outerScale.current = settings.current.pressScale;

        const radius =
          (state.bounds.width + state.bounds.height) /
          settings.current.radiusDivisor;

        for (let i = 0; i < state.total; i += 1) {
          state.trailsTranslation[i].random = {
            x: Math.round(
              radius * Math.cos((2 * (i + 1) * Math.PI) / state.total),
            ),
            y: Math.round(
              radius * Math.sin((2 * (i + 1) * Math.PI) / state.total),
            ),
          };
          state.trailsTranslation[i].current.x =
            state.position.x - state.trailsTranslation[i].random.x;
          state.trailsTranslation[i].current.y =
            state.position.y - state.trailsTranslation[i].random.y;
          state.trailsScale[i].current = settings.current.trailScale;
          state.trailsRotation[i].current = getRandomFloat(
            -settings.current.trailRotation,
            settings.current.trailRotation,
          );
        }

        document.body.style.cursor = "grabbing";
        draggable.style.cursor = "grabbing";
      };

      const onPointerMove = (event) => {
        if (!state.isDragging || event.pointerId !== state.pointerId) return;

        const moveVector = {
          x: event.clientX - state.pointerStart.x,
          y: event.clientY - state.pointerStart.y,
        };

        state.position = {
          x: state.startPosition.x + moveVector.x,
          y: state.startPosition.y + moveVector.y,
        };
        state.draggingPos.current = moveVector;

        draggable.style.left = state.position.x + "px";
        draggable.style.top = state.position.y + "px";

        for (let i = 0; i < state.total; i += 1) {
          state.trailsTranslation[i].current.x =
            state.position.x - state.trailsTranslation[i].random.x;
          state.trailsTranslation[i].current.y =
            state.position.y - state.trailsTranslation[i].random.y;
        }
      };

      const onPointerUp = (event) => {
        if (!state.isDragging || event.pointerId !== state.pointerId) return;
        state.isDragging = false;
        state.pointerId = null;

        state.outerScale.current = 1;
        for (let i = 0; i < state.total; i += 1) {
          state.trailsTranslation[i].current = {
            x: state.position.x,
            y: state.position.y,
          };
          state.trailsScale[i].current = 0;
          state.trailsRotation[i].current = 0;
        }

        document.body.style.cursor = "default";
        draggable.style.cursor = "grab";
      };

      const onResize = () => {
        state.bounds = draggable.getBoundingClientRect();
      };

      draggable.addEventListener("pointerdown", onPointerDown);
      draggable.addEventListener("pointermove", onPointerMove);
      draggable.addEventListener("pointerup", onPointerUp);
      draggable.addEventListener("pointercancel", onPointerUp);
      window.addEventListener("resize", onResize);

      teardown.push(() => {
        draggable.removeEventListener("pointerdown", onPointerDown);
        draggable.removeEventListener("pointermove", onPointerMove);
        draggable.removeEventListener("pointerup", onPointerUp);
        draggable.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("resize", onResize);
      });

      return state;
    });

    const layout = (state) => {
      const draggingDistance = distance(
        state.draggingPos.previous.x,
        state.draggingPos.previous.y,
        state.draggingPos.current.x,
        state.draggingPos.current.y,
      );

      const blurVal = clamp(
        map(
          draggingDistance,
          0,
          settings.current.blurDistance,
          0,
          settings.current.maxBlur,
        ),
        0,
        settings.current.maxBlur,
      );

      for (let i = 0; i < state.total; i += 1) {
        state.trails[i].style.filter = "blur(" + blurVal + "px)";
        state.trails[i].style.transform =
          "translate3d(" +
          state.trailsTranslation[i].previous.x +
          "px," +
          state.trailsTranslation[i].previous.y +
          "px,0) scale3d(" +
          state.trailsScale[i].previous +
          "," +
          state.trailsScale[i].previous +
          ",1) rotate3d(0,0,1," +
          state.trailsRotation[i].previous +
          "deg)";
      }

      state.draggable.style.transform =
        "translate3d(" +
        (state.draggingPos.previous.x - state.draggingPos.current.x).toFixed(
          2,
        ) +
        "px," +
        (state.draggingPos.previous.y - state.draggingPos.current.y).toFixed(
          2,
        ) +
        "px,0) scale3d(" +
        state.outerScale.previous +
        "," +
        state.outerScale.previous +
        ",1)";
    };

    const render = () => {
      instances.forEach((state) => {
        state.draggingPos.previous.x = lerp(
          state.draggingPos.previous.x,
          state.draggingPos.current.x,
          settings.current.dragLagAmt,
        );
        state.draggingPos.previous.y = lerp(
          state.draggingPos.previous.y,
          state.draggingPos.current.y,
          settings.current.dragLagAmt,
        );
        state.outerScale.previous = lerp(
          state.outerScale.previous,
          state.outerScale.current,
          settings.current.scaleAmt,
        );

        for (let i = 0; i < state.total; i += 1) {
          state.trailsTranslation[i].previous.x = lerp(
            state.trailsTranslation[i].previous.x,
            state.trailsTranslation[i].current.x,
            state.trailsTranslation[i].amt,
          );
          state.trailsTranslation[i].previous.y = lerp(
            state.trailsTranslation[i].previous.y,
            state.trailsTranslation[i].current.y,
            state.trailsTranslation[i].amt,
          );
          state.trailsScale[i].previous = lerp(
            state.trailsScale[i].previous,
            state.trailsScale[i].current,
            settings.current.trailScaleAmt,
          );
          state.trailsRotation[i].previous = lerp(
            state.trailsRotation[i].previous,
            state.trailsRotation[i].current,
            settings.current.trailRotationAmt,
          );
        }

        layout(state);
      });

      raf = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(raf);
      teardown.forEach((fn) => fn());
      document.body.style.cursor = "default";
    };
  }, [items, trailAmtMin, trailAmtMax]);

  return (
    <div
      ref={rootRef}
      className={
        "relative w-full min-h-screen overflow-hidden flex items-center justify-center " +
        className
      }
      style={{ backgroundColor: bgColor }}
    >
      {showTitle ? (
        <h2
          className={
            "absolute left-0 top-0 z-[1000] flex w-full h-full items-center justify-center px-6 text-center font-serif leading-none pointer-events-none " +
            titleClassName
          }
          style={{ color: titleColor, fontSize: titleSize }}
        >
          {title}
        </h2>
      ) : null}

      <div
        className="relative z-[1001] flex flex-wrap items-center justify-center"
        style={{ gap }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            data-stack="true"
            className="relative pointer-events-none"
            style={{ width: imageWidth, height: imageHeight, maxWidth: "100%" }}
          >
            {(item.trails || []).map((src, i) => (
              <img
                key={i}
                alt=""
                src={src}
                draggable="false"
                data-trail="true"
                className="absolute left-0 top-0 w-full h-full object-cover will-change-transform select-none"
                style={{ opacity: trailOpacity }}
              />
            ))}
            <div
              data-drag="true"
              className="relative w-full h-full bg-cover bg-center cursor-grab pointer-events-auto touch-none will-change-transform"
              style={{ backgroundImage: "url(" + item.main + ")" }}
            />
          </div>
        ))}
      </div>

      {showCaption ? (
        <p
          className="absolute bottom-8 right-8 z-[1002] m-0 text-sm pointer-events-none"
          style={{ color: captionColor }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
