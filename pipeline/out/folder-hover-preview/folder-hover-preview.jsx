"use client";

import { useCallback, useId, useMemo, useRef } from "react";

const BACK_PATH =
  "M7.5,0C7.4,0,2,0,2,0C0.9,0,0,0.9,0,2l0,12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4c0-1.1-0.9-2-2-2c0,0-7.5,0-8,0C9,2,9.9,0,7.5,0z";

const COVER_PATH =
  "M2,2h16c1.1,0,2,0.9,2,2v10c0,1.1-0.9,2-2,2H2c-1.1,0-2-0.9-2-2V4C0,2.9,0.9,2,2,2z";

const BADGE_PATHS = {
  users:
    "M22.2,17.7l-4-2c-0.5-0.3-0.8-0.8-0.8-1.3v-1.6c0.1-0.1,0.2-0.3,0.4-0.5c0.5-0.8,0.9-1.6,1.2-2.5c0.5-0.2,0.9-0.6,0.9-1.2V7c0-0.4-0.2-0.7-0.4-0.9V3.7c0,0,0.5-3.7-4.6-3.7c-5,0-4.6,3.7-4.6,3.7v2.4C10.1,6.3,9.9,6.7,9.9,7v1.7c0,0.4,0.2,0.8,0.6,1c0.4,1.8,1.5,3.1,1.5,3.1v1.5c0,0.6-0.3,1.1-0.8,1.3l-3.7,2c-1.1,0.6-1.7,1.7-1.7,2.9v1.3H24v-1.3C24,19.4,23.3,18.3,22.2,17.7z",
  globe:
    "M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12c6.6,0,12-5.4,12-12C24,5.4,18.6,0,12,0z M12,22C6.5,22,2,17.5,2,12S6.5,2,12,2s10,4.5,10,10S17.5,22,12,22z M12,2c-2.8,0-5,4.5-5,10s2.2,10,5,10s5-4.5,5-10S14.8,2,12,2z M1.5,8h21v2h-21V8z M1.5,14h21v2h-21V14z",
  cloud:
    "M19.5,5.8c-0.3-1.5-1-2.9-2.2-4c-1.3-1.2-3-1.8-4.7-1.8C11.3,0,10,0.4,8.9,1.1C8,1.7,7.2,2.5,6.6,3.5c-0.2,0-0.5-0.1-0.7-0.1c-2.1,0-3.8,1.7-3.8,3.8c0,0.3,0,0.5,0.1,0.8C0.8,9,0,10.6,0,12.3C0,13.6,0.5,15,1.4,16c1,1.1,2.2,1.7,3.6,1.8h4.2c0.4,0,0.7-0.3,0.7-0.7s-0.3-0.7-0.7-0.7H5c-2-0.1-3.7-2-3.7-4.2c0-1.4,0.8-2.7,2-3.4c0.3-0.2,0.4-0.5,0.3-0.8C3.5,7.8,3.4,7.5,3.4,7.2c0-1.4,1.1-2.5,2.5-2.5c0.3,0,0.6,0,0.8,0.1c0.3,0.1,0.7,0,0.8-0.3c0.9-2,2.9-3.2,5.1-3.2c2.9,0,5.3,2.2,5.6,5.1c0,0.3,0.3,0.5,0.6,0.6c2.2,0.4,3.9,2.4,3.9,4.7c0,2.5-1.9,4.6-4.3,4.8h-3.6c-0.4,0-0.7,0.3-0.7,0.7s0.3,0.7,0.7,0.7h3.7c1.5-0.1,2.9-0.8,4-2c1-1.1,1.6-2.6,1.6-4.1C24,8.9,22.1,6.5,19.5,5.8z",
  lock: "M23,13.5h-1.7V9.4C21.4,4.2,17.2,0,12,0C6.8,0,2.6,4.2,2.6,9.4v4.1H1c-0.5,0-1,0.4-1,1v18.2c0,0.5,0.4,1,1,1H23c0.5,0,1-0.4,1-1V14.4C24,13.9,23.6,13.5,23,13.5z M13.5,24.5v3.9c0,0.3-0.3,0.6-0.6,0.6h-1.8c-0.3,0-0.6-0.3-0.6-0.6v-3.9c-0.7-0.5-1.1-1.3-1.1-2.1c0-1.4,1.2-2.6,2.6-2.6c1.4,0,2.6,1.2,2.6,2.6C14.6,23.3,14.2,24.1,13.5,24.5z M16.9,13.5H7.1V9.4c0-2.7,2.2-4.9,4.9-4.9c2.7,0,4.9,2.2,4.9,4.9V13.5z",
};

const DEFAULT_ITEMS = [
  { text: "01" },
  { text: "02" },
  { text: "03" },
  { text: "04" },
  { text: "05" },
];

const DEFAULT_FOLDERS = [
  { variant: "arc", label: "Arc", badge: "users", cell: 8 },
  {
    variant: "bounce",
    label: "Bounce",
    badge: "globe",
    cell: 10,
    coverTilt: 25,
  },
  {
    variant: "scatter",
    label: "Scatter",
    badge: "lock",
    cell: 14,
    iconShrink: 0.8,
    ripple: true,
  },
  {
    variant: "spray",
    label: "Spray",
    badge: "cloud",
    cell: 16,
    coverTilt: 40,
    items: [{ text: "A" }, { text: "B" }, { text: "C" }, { text: "D" }],
  },
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function Folder({ uid, config, shared }) {
  const {
    variant = "arc",
    label = "",
    items = shared.items,
    badge = shared.badge,
    radius = shared.radius,
    stagger = shared.stagger,
    duration = shared.duration,
    scaleFrom = shared.scaleFrom,
    coverTilt = shared.coverTilt,
    liftAmount = shared.liftAmount,
    iconShrink = shared.iconShrink,
    ripple = shared.ripple,
    rippleColor = shared.rippleColor,
    rippleScale = shared.rippleScale,
    rippleMs = shared.rippleMs,
    sprayHeight = shared.sprayHeight,
    sprayJitter = shared.sprayJitter,
    sprayInterval = shared.sprayInterval,
    backColor = shared.backColor,
    coverColor = shared.coverColor,
  } = config;

  const itemRefs = useRef([]);
  const coverRef = useRef(null);
  const iconRef = useRef(null);
  const rootRef = useRef(null);
  const rippleRef = useRef(null);
  const timersRef = useRef([]);

  itemRefs.current = [];

  const total = items.length;
  const thumbBox = shared.thumbSize || `calc(0.6 * ${shared.folderWidth})`;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const setItem = (node, transform, opacity, delay, ms) => {
    if (!node) return;
    node.style.transitionDuration = `${ms}ms`;
    node.style.transitionDelay = `${delay}ms`;
    node.style.transform = transform;
    node.style.opacity = String(opacity);
  };

  const playRipple = useCallback(() => {
    const node = rippleRef.current;
    if (!node) return;
    node.style.transition = "none";
    node.style.transform = "scale(1)";
    node.style.opacity = "1";
    later(() => {
      node.style.transition = `transform ${rippleMs}ms cubic-bezier(0.1,1,0.3,1), opacity ${rippleMs}ms linear`;
      node.style.transform = `scale(${rippleScale})`;
      node.style.opacity = "0";
    }, 20);
  }, [later, rippleMs, rippleScale]);

  const spray = useCallback(
    (node) => {
      if (!node) return;
      const x = randInt(-sprayJitter, sprayJitter);
      const y = -randInt(Math.round(sprayHeight * 0.7), sprayHeight);
      const r = randInt(-20, 20);
      node.style.transition = "none";
      node.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
      node.style.opacity = "0";
      later(() => {
        node.style.transition = `transform ${duration}ms linear, opacity ${Math.round(duration / 2)}ms linear`;
        node.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(1)`;
        node.style.opacity = "1";
        later(
          () => {
            node.style.opacity = "0";
          },
          Math.round(duration / 2),
        );
      }, 20);
      later(() => spray(node), total * sprayInterval);
    },
    [later, duration, sprayHeight, sprayJitter, sprayInterval, total],
  );

  const runIn = useCallback(() => {
    const nodes = itemRefs.current;

    if (variant === "spray") {
      nodes.forEach((node, i) => later(() => spray(node), i * sprayInterval));
    } else if (variant === "scatter") {
      nodes.forEach((node, i) => {
        const r = randInt(Math.round(radius * 0.7), radius);
        const angle = (2 * (i + 1) * Math.PI) / total;
        setItem(
          node,
          `translate(${Math.round(r * Math.cos(angle))}px, ${Math.round(
            r * Math.sin(angle),
          )}px) rotate(${randInt(-3, 3)}deg) scale(1)`,
          1,
          0,
          duration,
        );
      });
    } else {
      const dir = variant === "bounce" ? -1 : 1;
      nodes.forEach((node, i) => {
        const step = Math.PI / total;
        const angle = step / 2 + step * i;
        setItem(
          node,
          `translate(${Math.round(radius * Math.cos(angle))}px, ${Math.round(
            -dir * radius * Math.sin(angle),
          )}px) rotate(0deg) scale(1)`,
          1,
          (total - i - 1) * stagger,
          duration,
        );
      });
    }

    if (coverRef.current && coverTilt) {
      coverRef.current.style.transform = `rotateX(${-coverTilt}deg)`;
    }
    if (rootRef.current && liftAmount) {
      rootRef.current.style.transform = `translateY(${liftAmount}px)`;
    }
    if (iconRef.current && iconShrink !== 1) {
      iconRef.current.style.transform = `scale(${iconShrink})`;
    }
    if (ripple) playRipple();
  }, [
    variant,
    total,
    radius,
    stagger,
    duration,
    sprayInterval,
    spray,
    later,
    coverTilt,
    liftAmount,
    iconShrink,
    ripple,
    playRipple,
  ]);

  const runOut = useCallback(() => {
    itemRefs.current.forEach((node, i) =>
      setItem(
        node,
        `translate(0px, 0px) rotate(0deg) scale(${scaleFrom})`,
        0,
        (total - i - 1) * stagger,
        Math.round(duration / 2),
      ),
    );
    if (coverRef.current) coverRef.current.style.transform = "rotateX(0deg)";
    if (rootRef.current) rootRef.current.style.transform = "translateY(0px)";
    if (iconRef.current) iconRef.current.style.transform = "scale(1)";
    if (rippleRef.current) rippleRef.current.style.opacity = "0";
  }, [total, stagger, duration, scaleFrom]);

  const onEnter = () => {
    clearTimers();
    later(runIn, 75);
  };

  const onLeave = () => {
    clearTimers();
    runOut();
  };

  return (
    <div
      ref={rootRef}
      className={`relative z-10 fp-${uid}-root`}
      style={{ width: shared.folderWidth }}
    >
      {ripple ? (
        <div
          ref={rippleRef}
          className={`absolute rounded-full pointer-events-none fp-${uid}-ring`}
          style={{
            width: thumbBox,
            height: thumbBox,
            top: "50%",
            left: "50%",
            marginTop: `calc(-0.5 * ${thumbBox} + 0.05 * ${shared.folderWidth})`,
            marginLeft: `calc(-0.5 * ${thumbBox})`,
            background: rippleColor,
          }}
        />
      ) : null}

      <div
        ref={iconRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={`relative w-full cursor-pointer fp-${uid}-icon`}
        style={{
          height: `calc(0.8 * ${shared.folderWidth})`,
          perspective: coverTilt ? "800px" : undefined,
        }}
      >
        <div
          className={`absolute inset-0 w-full h-full fp-${uid}-back`}
          style={{
            color: backColor,
            backfaceVisibility: "hidden",
            transformOrigin: "50% 100%",
          }}
        >
          <svg
            viewBox="0 0 20 16"
            className="absolute inset-0 w-full h-full"
            style={{ fill: "currentColor" }}
          >
            <path d={BACK_PATH} />
          </svg>
        </div>

        {shared.showSheet ? (
          <div
            className="absolute"
            style={{
              bottom: "2px",
              left: "2px",
              width: `calc(${shared.folderWidth} - 4px)`,
              height: `calc(0.7 * ${shared.folderWidth} - 4px)`,
              borderRadius: `calc(${shared.folderWidth} / 10)`,
              background: shared.sheetColor,
            }}
          />
        ) : null}

        <div
          className="absolute pointer-events-none"
          style={{
            width: thumbBox,
            height: thumbBox,
            top: `calc(0.45 * ${shared.folderWidth} - 0.5 * ${thumbBox})`,
            left: `calc(0.5 * ${shared.folderWidth} - 0.5 * ${thumbBox})`,
          }}
        >
          {items.map((item, i) =>
            item.src ? (
              <img
                key={i}
                ref={(node) => {
                  itemRefs.current[i] = node;
                }}
                src={item.src}
                alt={item.alt || ""}
                className={`absolute inset-0 block w-full h-full object-contain fp-${uid}-item`}
              />
            ) : (
              <div
                key={i}
                ref={(node) => {
                  itemRefs.current[i] = node;
                }}
                className={`absolute inset-0 flex items-center justify-center text-xs font-bold fp-${uid}-item`}
                style={{
                  background: shared.sheetColor,
                  color: shared.captionColor,
                }}
              >
                {item.text}
              </div>
            ),
          )}
        </div>

        <div
          ref={coverRef}
          className={`absolute inset-0 w-full h-full fp-${uid}-cover`}
          style={{
            color: coverColor,
            backfaceVisibility: "hidden",
            transformOrigin: "50% 100%",
            transformStyle: coverTilt ? "preserve-3d" : undefined,
          }}
        >
          <svg
            viewBox="0 0 20 16"
            className="absolute inset-0 w-full h-full"
            style={{ fill: "currentColor" }}
          >
            <path d={COVER_PATH} />
          </svg>
          {badge !== "none" && BADGE_PATHS[badge] ? (
            <svg
              viewBox="0 0 24 24"
              className="absolute"
              style={{
                width: `calc(${shared.folderWidth} / 3.5)`,
                height: `calc(${shared.folderWidth} / 3.5)`,
                top: "50%",
                left: "50%",
                marginTop: `calc(${shared.folderWidth} / -7 + 0.05 * ${shared.folderWidth})`,
                marginLeft: `calc(${shared.folderWidth} / -7)`,
                fill: shared.badgeColor,
              }}
            >
              <path d={BADGE_PATHS[badge]} />
            </svg>
          ) : null}
        </div>
      </div>

      {shared.showLabels ? (
        <h3
          className="relative inline-block m-0 mt-3 leading-tight"
          style={{
            fontSize: `calc(0.16 * ${shared.folderWidth})`,
            color: shared.captionColor,
          }}
        >
          {label}
        </h3>
      ) : null}
    </div>
  );
}

export default function FolderHoverPreview({
  folders = DEFAULT_FOLDERS,
  items = DEFAULT_ITEMS,
  badge = "users",
  folderWidth = "6em",
  backColor = "#8c8c99",
  coverColor = "#adadba",
  backHoverColor = "",
  coverHoverColor = "",
  badgeColor = "#76767f",
  captionColor = "#323437",
  sheetColor = "#ffffff",
  showSheet = false,
  bgColor = "#f2f2f9",
  dummyColor = "#c6c6d3",
  dummyCount = 24,
  columns = 6,
  gapSize = "2.5em",
  radius = 150,
  stagger = 40,
  duration = 600,
  easing = "cubic-bezier(0.2, 1, 0.3, 1)",
  scaleFrom = 0.7,
  thumbSize = "",
  coverTilt = 0,
  coverTiltMs = 300,
  liftAmount = 0,
  iconShrink = 1,
  ripple = false,
  rippleColor = "#181a1c",
  rippleScale = 10,
  rippleMs = 900,
  sprayHeight = 220,
  sprayJitter = 25,
  sprayInterval = 300,
  showLabels = true,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const shared = {
    items,
    badge,
    folderWidth,
    backColor,
    coverColor,
    badgeColor,
    captionColor,
    sheetColor,
    showSheet,
    radius,
    stagger,
    duration,
    scaleFrom,
    thumbSize,
    coverTilt,
    liftAmount,
    iconShrink,
    ripple,
    rippleColor,
    rippleScale,
    rippleMs,
    sprayHeight,
    sprayJitter,
    sprayInterval,
    showLabels,
  };

  const slots = useMemo(() => {
    const map = new Map();
    folders.forEach((config, i) => {
      const cell = typeof config.cell === "number" ? config.cell : i;
      map.set(cell, config);
    });
    return map;
  }, [folders]);

  const cells = useMemo(
    () =>
      Array.from(
        {
          length: Math.max(
            dummyCount,
            slots.size ? Math.max(...slots.keys()) + 1 : 0,
          ),
        },
        (_, i) => i,
      ),
    [dummyCount, slots],
  );

  return (
    <section
      className={`relative flex flex-wrap items-center justify-center overflow-hidden min-h-[500px] py-16 ${className}`}
      style={{ background: bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fp-${uid}-item {
              opacity: 0;
              transform: translate(0px, 0px) rotate(0deg) scale(${scaleFrom});
              transition-property: transform, opacity;
              transition-timing-function: ${easing};
            }
            .fp-${uid}-icon, .fp-${uid}-root {
              transition: transform ${coverTiltMs}ms cubic-bezier(0.1,1,0.3,1);
            }
            .fp-${uid}-cover, .fp-${uid}-back {
              transition: transform ${coverTiltMs}ms cubic-bezier(0.1,1,0.3,1), color 150ms ease;
            }
            .fp-${uid}-ring {
              opacity: 0;
              transform: scale(1);
            }
            ${
              backHoverColor
                ? `.fp-${uid}-icon:hover .fp-${uid}-back { color: ${backHoverColor}; }`
                : ""
            }
            ${
              coverHoverColor
                ? `.fp-${uid}-icon:hover .fp-${uid}-cover { color: ${coverHoverColor}; }`
                : ""
            }
          `,
        }}
      />

      <div
        className="flex flex-none flex-wrap content-center justify-center max-w-full"
        style={{
          width: `calc(${columns} * (2 * ${gapSize} + ${folderWidth}))`,
        }}
      >
        {cells.map((i) => {
          const config = slots.get(i);

          if (config) {
            return (
              <div key={`f-${i}`} style={{ padding: gapSize }}>
                <Folder uid={uid} config={config} shared={shared} />
              </div>
            );
          }

          return (
            <div key={`d-${i}`} style={{ padding: gapSize }}>
              <div className="relative flex-none pointer-events-none">
                <svg
                  viewBox="0 0 20 16"
                  className="block mb-3 opacity-30"
                  style={{
                    width: folderWidth,
                    height: `calc(0.8 * ${folderWidth})`,
                    fill: dummyColor,
                  }}
                >
                  <path d={BACK_PATH} />
                  <path d={COVER_PATH} />
                </svg>
                <div
                  className="relative block mx-1 opacity-50"
                  style={{
                    width: `calc(${folderWidth} * 0.6)`,
                    height: `calc(0.16 * ${folderWidth})`,
                    background: dummyColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
