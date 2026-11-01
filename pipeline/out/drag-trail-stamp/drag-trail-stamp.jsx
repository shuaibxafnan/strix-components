"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  },
];

const DEFAULT_TITLE_ROWS = ["Italy", "Art Fair @ Savona", "Apr — 2020"];

const lerp = (a, b, n) => (1 - n) * a + n * b;
const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

export default function DragTrailStamp({
  items = DEFAULT_ITEMS,
  bgColor = "#eceae9",
  titleRows = DEFAULT_TITLE_ROWS,
  showTitle = true,
  titleColor = "#dc4823",
  titleSize = "8.5vw",
  titleLineHeight = 1.3,
  firstRowIndent = "22vw",
  titleClassName = "",
  caption = "Drag the images (fast)",
  showCaption = true,
  captionColor = "#000000",
  imageWidth = 210,
  imageHeight = 300,
  trailsTotal = 10,
  threshold = 30,
  innerScaleUp = 1.5,
  innerScaleAmt = 0.2,
  outerScaleDown = 0.8,
  outerScaleAmt = 0.2,
  trailFadeDuration = 0.3,
  trailFadeDelay = 0.1,
  gap = "3rem",
  className = "",
}) {
  const rootRef = useRef(null);

  const settings = useRef({});
  settings.current = {
    threshold,
    innerScaleUp,
    innerScaleAmt,
    outerScaleDown,
    outerScaleAmt,
    trailFadeDuration,
    trailFadeDelay,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let raf = 0;
    let teardown = [];

    import("gsap")
      .then((mod) => {
        if (disposed) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap) return;

        gsap.config({ trialWarn: false });

        let zIndex = 1;
        const stacks = Array.from(root.querySelectorAll("[data-stack]"));

        const instances = stacks.map((el) => {
          const draggable = el.querySelector("[data-drag]");
          const innerEl = el.querySelector("[data-inner]");
          const trails = Array.from(el.querySelectorAll("[data-trail]"));

          const state = {
            el,
            draggable,
            innerEl,
            trails,
            total: trails.length,
            position: { x: 0, y: 0 },
            startPosition: { x: 0, y: 0 },
            pointerStart: { x: 0, y: 0 },
            isDragging: false,
            pointerId: null,
            draggingPos: { previous: { x: 0, y: 0 }, current: { x: 0, y: 0 } },
            innerScale: { previous: 1, current: 1 },
            outerScale: { previous: 1, current: 1 },
            trailPosition: 0,
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
            state.innerScale.current = settings.current.innerScaleUp;
            state.outerScale.current = settings.current.outerScaleDown;

            document.body.style.cursor = "grabbing";
            draggable.style.cursor = "grabbing";
          };

          const onPointerMove = (event) => {
            if (!state.isDragging || event.pointerId !== state.pointerId)
              return;

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
          };

          const onPointerUp = (event) => {
            if (!state.isDragging || event.pointerId !== state.pointerId)
              return;
            state.isDragging = false;
            state.pointerId = null;

            state.innerScale.current = 1;
            state.outerScale.current = 1;

            document.body.style.cursor = "default";
            draggable.style.cursor = "grab";
          };

          draggable.addEventListener("pointerdown", onPointerDown);
          draggable.addEventListener("pointermove", onPointerMove);
          draggable.addEventListener("pointerup", onPointerUp);
          draggable.addEventListener("pointercancel", onPointerUp);

          teardown.push(() => {
            draggable.removeEventListener("pointerdown", onPointerDown);
            draggable.removeEventListener("pointermove", onPointerMove);
            draggable.removeEventListener("pointerup", onPointerUp);
            draggable.removeEventListener("pointercancel", onPointerUp);
            state.trails.forEach((trailEl) => gsap.killTweensOf(trailEl));
          });

          return state;
        });

        const resetTrail = (state, trailEl) => {
          gsap.set(trailEl, {
            opacity: 0,
            scale: 1,
            x: state.position.x,
            y: state.position.y,
          });
        };

        const showNextTrailImage = (state) => {
          const trailEl = state.trails[state.trailPosition];
          if (!trailEl) return;

          gsap.killTweensOf(trailEl);
          gsap
            .timeline({ onComplete: () => resetTrail(state, trailEl) })
            .set(
              trailEl,
              {
                startAt: { opacity: 0 },
                opacity: 1,
                scale: state.outerScale.previous,
                x: state.position.x,
                y: state.position.y,
              },
              0,
            )
            .to(
              trailEl,
              {
                duration: settings.current.trailFadeDuration,
                ease: "power1.out",
                opacity: 0,
                scale: () => state.outerScale.previous,
              },
              settings.current.trailFadeDelay,
            );
        };

        const layout = (state) => {
          const draggingDistance = distance(
            state.draggingPos.previous.x,
            state.draggingPos.previous.y,
            state.draggingPos.current.x,
            state.draggingPos.current.y,
          );

          state.innerEl.style.transform =
            "scale3d(" +
            state.innerScale.previous +
            ", " +
            state.innerScale.previous +
            ", 1)";
          state.draggable.style.transform =
            "scale3d(" +
            state.outerScale.previous +
            ", " +
            state.outerScale.previous +
            ", 1)";

          if (draggingDistance > settings.current.threshold) {
            showNextTrailImage(state);
            state.trailPosition =
              state.trailPosition < state.total - 1
                ? state.trailPosition + 1
                : 0;
            state.draggingPos.previous = {
              x: state.draggingPos.current.x,
              y: state.draggingPos.current.y,
            };
          }
        };

        const render = () => {
          instances.forEach((state) => {
            state.innerScale.previous = lerp(
              state.innerScale.previous,
              state.innerScale.current,
              settings.current.innerScaleAmt,
            );
            state.outerScale.previous = lerp(
              state.outerScale.previous,
              state.outerScale.current,
              settings.current.outerScaleAmt,
            );
            layout(state);
          });

          raf = window.requestAnimationFrame(render);
        };

        render();
      })
      .catch(() => {});

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      teardown.forEach((fn) => fn());
      teardown = [];
      document.body.style.cursor = "default";
    };
  }, [items, trailsTotal]);

  return (
    <div
      ref={rootRef}
      className={
        "relative w-full h-screen overflow-hidden flex items-center justify-center " +
        className
      }
      style={{ backgroundColor: bgColor }}
    >
      {showTitle ? (
        <h2
          className={
            "absolute left-0 top-0 z-[1000] flex w-full h-full flex-col items-center justify-center px-6 text-center font-serif uppercase m-0 pointer-events-none " +
            titleClassName
          }
          style={{
            color: titleColor,
            fontSize: titleSize,
            lineHeight: titleLineHeight,
          }}
        >
          {titleRows.map((row, i) => (
            <span
              key={i}
              className="block"
              style={{ marginRight: i === 0 ? firstRowIndent : undefined }}
            >
              {row}
            </span>
          ))}
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
            {Array.from({ length: trailsTotal }).map((_, i) => (
              <img
                key={i}
                alt=""
                src={item.image}
                draggable="false"
                data-trail="true"
                className="absolute left-0 top-0 w-full h-full object-cover opacity-0 will-change-transform select-none"
              />
            ))}
            <div
              data-drag="true"
              className="relative w-full h-full overflow-hidden cursor-grab pointer-events-auto touch-none will-change-transform"
            >
              <div
                data-inner="true"
                className="w-full h-full bg-cover bg-center will-change-transform"
                style={{ backgroundImage: "url(" + item.image + ")" }}
              />
            </div>
          </div>
        ))}
      </div>

      {showCaption ? (
        <p
          className="absolute bottom-8 right-8 z-[1002] m-0 text-sm uppercase pointer-events-none"
          style={{ color: captionColor }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
