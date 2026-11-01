"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

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

const DEFAULT_TITLES = [
  "Field Notes",
  "Low Light",
  "Surface Study",
  "Still Frames",
  "Long Exposure",
  "Cold Palette",
  "Edge Detail",
];

function createFlipDeck(el, options) {
  const opts = {
    orientation: "vertical",
    speed: 620,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    shadows: true,
    shadowSides: 0.34,
    shadowFlip: 0.16,
    circular: true,
    onEndFlip: () => {},
    ...options,
  };

  el.classList.add(`bb-${opts.orientation}`);

  const items = Array.from(el.children).filter((n) =>
    n.classList.contains("bb-item"),
  );
  const count = items.length;

  const s = {
    index: 0,
    previous: -1,
    animating: false,
    end: false,
    width: el.offsetWidth,
    height: el.offsetHeight,
    current: items[0],
    next: items[0],
  };
  if (s.current) s.current.style.display = "block";

  let resizeTimer = null;
  const onResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      s.width = el.offsetWidth;
      s.height = el.offsetHeight;
      resizeTimer = null;
    }, 60);
  };
  window.addEventListener("resize", onResize);

  const sizeStyle = () =>
    opts.orientation === "vertical"
      ? `width:${s.width}px;height:${s.height}px`
      : `width:${s.width}px;height:${s.height}px`;

  const face = (cls, html, overlay) =>
    `<div class="${cls}"><div class="bb-outer"><div class="bb-content" style="${sizeStyle()}">` +
    `<div class="bb-inner">${html}</div></div><div class="${overlay}"></div></div></div>`;

  function addSide(side, dir) {
    const page = document.createElement("div");
    page.className = "bb-page";
    const cur = s.current.innerHTML;
    const nxt = s.next.innerHTML;

    if (side === "left") {
      page.innerHTML = face(
        "bb-back",
        dir === "next" ? cur : nxt,
        "bb-overlay",
      );
    } else if (side === "middle") {
      page.innerHTML =
        face("bb-front", dir === "next" ? cur : nxt, "bb-flipoverlay") +
        face("bb-back", dir === "next" ? nxt : cur, "bb-flipoverlay");
    } else {
      page.innerHTML = face(
        "bb-front",
        dir === "next" ? nxt : cur,
        "bb-overlay",
      );
    }
    return page;
  }

  function layout(dir) {
    const left = addSide("left", dir);
    const middle = addSide("middle", dir);
    const right = addSide("right", dir);

    const oLeft = left.querySelector(".bb-overlay");
    const oFront = middle.querySelector(".bb-front .bb-flipoverlay");
    const oBack = middle.querySelector(".bb-back .bb-flipoverlay");
    const oRight = right.querySelector(".bb-overlay");

    const speed = s.end ? 380 : opts.speed;
    const half = speed / 2;

    const anchor = items[0];
    el.insertBefore(left, anchor);
    el.insertBefore(middle, anchor);
    el.insertBefore(right, anchor);
    left.style.zIndex = "102";
    middle.style.zIndex = "103";
    right.style.zIndex = "101";

    middle.style.transitionDuration = `${speed}ms`;
    middle.style.transitionTimingFunction = opts.easing;

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      middle.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(fallback);
      Array.from(el.querySelectorAll(".bb-page")).forEach((p) => p.remove());
      s.next.style.display = "block";
      s.end = false;
      s.animating = false;
      opts.onEndFlip(s.previous, s.index);
    };
    const onTransitionEnd = (event) => {
      if (event.target === middle) settle();
    };
    middle.addEventListener("transitionend", onTransitionEnd);
    const fallback = setTimeout(settle, speed + 220);

    if (dir === "prev") middle.classList.add("bb-flip-initial");

    if (opts.shadows && !s.end) {
      if (dir === "next") {
        oFront.style.transition = `opacity ${half}ms linear`;
        oBack.style.transition = `opacity ${half}ms linear ${half}ms`;
        oBack.style.opacity = String(opts.shadowFlip);
        oLeft.style.transition = `opacity ${half}ms linear ${half}ms`;
        oRight.style.transition = `opacity ${half}ms linear`;
        oRight.style.opacity = String(opts.shadowSides);
      } else {
        oFront.style.transition = `opacity ${half}ms linear ${half}ms`;
        oFront.style.opacity = String(opts.shadowFlip);
        oBack.style.transition = `opacity ${half}ms linear`;
        oLeft.style.transition = `opacity ${half}ms linear`;
        oLeft.style.opacity = String(opts.shadowSides);
        oRight.style.transition = `opacity ${half}ms linear ${half}ms`;
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        middle.classList.add(s.end ? `bb-flip-${dir}-end` : `bb-flip-${dir}`);
        if (opts.shadows && !s.end) {
          oFront.style.opacity = dir === "next" ? String(opts.shadowFlip) : "0";
          oBack.style.opacity = dir === "next" ? "0" : String(opts.shadowFlip);
          oLeft.style.opacity = dir === "next" ? String(opts.shadowSides) : "0";
          oRight.style.opacity =
            dir === "next" ? "0" : String(opts.shadowSides);
        }
      });
    });
  }

  function navigate(dir, page) {
    if (s.animating || count < 2) return false;
    s.width = el.offsetWidth;
    s.height = el.offsetHeight;
    s.animating = true;
    s.current = items[s.index];

    if (page !== undefined) {
      s.previous = s.index;
      s.index = page;
    } else if (dir === "next") {
      if (!opts.circular && s.index === count - 1) s.end = true;
      else {
        s.previous = s.index;
        s.index = s.index < count - 1 ? s.index + 1 : 0;
      }
    } else {
      if (!opts.circular && s.index === 0) s.end = true;
      else {
        s.previous = s.index;
        s.index = s.index > 0 ? s.index - 1 : count - 1;
      }
    }

    s.next = !opts.circular && s.end ? s.current : items[s.index];
    items.forEach((it) => {
      it.style.display = "none";
    });
    layout(dir);
    return true;
  }

  return {
    next: () => navigate("next"),
    prev: () => navigate("prev"),
    jump: (target) => {
      if (target === s.index || target < 0 || target >= count) return;
      navigate(target > s.index ? "next" : "prev", target);
    },
    isAnimating: () => s.animating,
    destroy: () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      Array.from(el.querySelectorAll(".bb-page")).forEach((p) => p.remove());
      el.classList.remove(`bb-${opts.orientation}`);
      items.forEach((it, i) => {
        it.style.display = i === 0 ? "block" : "none";
      });
    },
  };
}

function attachSwipe(el, onLeft, onRight) {
  let start = null;
  let move = null;

  const read = (e) => {
    const t = e.touches ? e.touches[0] : e;
    return { t: Date.now(), x: t.clientX, y: t.clientY };
  };
  const onStart = (e) => {
    start = read(e);
    move = null;
  };
  const onMove = (e) => {
    if (!start) return;
    move = read(e);
    if (Math.abs(start.x - move.x) > 12 && e.cancelable) e.preventDefault();
  };
  const onEnd = () => {
    if (start && move) {
      const dx = start.x - move.x;
      const dy = Math.abs(start.y - move.y);
      if (move.t - start.t < 600 && Math.abs(dx) > 34 && dy < 42) {
        if (dx > 0) onLeft();
        else onRight();
      }
    }
    start = null;
    move = null;
  };

  el.addEventListener("touchstart", onStart, { passive: true });
  el.addEventListener("touchmove", onMove, { passive: false });
  el.addEventListener("touchend", onEnd);
  el.addEventListener("touchcancel", onEnd);

  return () => {
    el.removeEventListener("touchstart", onStart);
    el.removeEventListener("touchmove", onMove);
    el.removeEventListener("touchend", onEnd);
    el.removeEventListener("touchcancel", onEnd);
  };
}

function Deck({
  deck,
  aspect,
  orientation,
  speed,
  easing,
  shadows,
  shadowSides,
  shadowFlip,
  circular,
  autoplay,
  interval,
  swipe,
  pauseOnHover,
  cardColor,
  borderColor,
  textColor,
  mutedColor,
  accentColor,
  showCounter,
  showProgress,
  showArrows,
  keyboard,
}) {
  const deckRef = useRef(null);
  const apiRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const total = deck.images.length;

  useEffect(() => {
    if (!deckRef.current) return undefined;
    const api = createFlipDeck(deckRef.current, {
      orientation,
      speed,
      easing,
      shadows,
      shadowSides,
      shadowFlip,
      circular,
      onEndFlip: (_prev, current) => setIndex(current),
    });
    apiRef.current = api;
    const detach = swipe
      ? attachSwipe(
          deckRef.current,
          () => api.next(),
          () => api.prev(),
        )
      : null;
    return () => {
      if (detach) detach();
      api.destroy();
      apiRef.current = null;
      setIndex(0);
    };
  }, [
    deck,
    orientation,
    speed,
    easing,
    shadows,
    shadowSides,
    shadowFlip,
    circular,
    swipe,
  ]);

  useEffect(() => {
    if (!autoplay || total < 2) return undefined;
    if (pauseOnHover && hovered) return undefined;
    const id = setInterval(() => {
      apiRef.current?.next();
    }, interval);
    return () => clearInterval(id);
  }, [autoplay, interval, total, pauseOnHover, hovered]);

  const onKeyDown = (event) => {
    if (!keyboard) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      apiRef.current?.next();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      apiRef.current?.prev();
    }
  };

  return (
    <article
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col gap-4 rounded-3xl border p-4 outline-none transition-colors duration-300 focus-visible:border-white/30 sm:p-5"
      style={{ backgroundColor: cardColor, borderColor }}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {deck.label ? (
            <p
              className="mb-1 truncate text-[10px] font-medium uppercase tracking-[0.22em]"
              style={{ color: mutedColor }}
            >
              {deck.label}
            </p>
          ) : null}
          <h3
            className="truncate text-[15px] font-medium tracking-tight sm:text-base"
            style={{ color: textColor }}
          >
            {deck.title}
          </h3>
        </div>
        {showCounter ? (
          <p
            className="shrink-0 pt-1 font-mono text-[11px] tabular-nums"
            style={{ color: mutedColor }}
          >
            <span style={{ color: accentColor }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="px-1 opacity-50">/</span>
            {String(total).padStart(2, "0")}
          </p>
        ) : null}
      </header>

      <div className="relative">
        <div
          ref={deckRef}
          className="bb-bookblock relative w-full overflow-visible rounded-2xl"
          style={{ aspectRatio: aspect }}
        >
          {deck.images.map((src, i) => (
            <div className="bb-item" key={`${src}-${i}`}>
              <img src={src} alt={`${deck.title} frame ${i + 1}`} />
            </div>
          ))}
        </div>

        {showArrows && total > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[120] flex -translate-y-1/2 items-center justify-between px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:none)]:opacity-100 group-focus-visible:opacity-100">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => apiRef.current?.prev()}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/55 text-sm text-white/80 backdrop-blur-md transition hover:border-white/35 hover:text-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={() => apiRef.current?.next()}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/55 text-sm text-white/80 backdrop-blur-md transition hover:border-white/35 hover:text-white"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      <footer>
        {showProgress ? (
          <div
            className="relative h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: borderColor }}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${((index + 1) / total) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        ) : null}
      </footer>
    </article>
  );
}

export default function FlipDeckGrid({
  images = DEFAULT_IMAGES,
  titles = DEFAULT_TITLES,
  decks = null,
  perDeck = 4,
  columns = 2,
  aspect = "4/3",
  orientation = "vertical",
  speed = 620,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
  shadows = true,
  shadowSides = 0.34,
  shadowFlip = 0.16,
  circular = true,
  autoplay = false,
  interval = 4200,
  swipe = true,
  pauseOnHover = true,
  bgColor = "#08090b",
  cardColor = "#101216",
  pageColor = "#0b0d10",
  borderColor = "#ffffff14",
  textColor = "#e7e9ee",
  mutedColor = "#6f7580",
  accentColor = "#7dd3fc",
  showCounter = true,
  showProgress = true,
  showArrows = true,
  keyboard = true,
  className = "",
}) {
  const scope = `fdg-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const resolvedDecks = useMemo(() => {
    if (decks && decks.length) return decks;
    const chunks = [];
    for (let i = 0; i + perDeck <= images.length; i += perDeck) {
      chunks.push(images.slice(i, i + perDeck));
    }
    return chunks.map((chunk, i) => ({
      title: titles[i] || `Set ${String(i + 1).padStart(2, "0")}`,
      label: `${chunk.length} pages`,
      images: chunk,
    }));
  }, [decks, images, titles, perDeck]);

  const gridColumns =
    columns >= 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        : columns === 1
          ? "grid-cols-1"
          : "grid-cols-1 lg:grid-cols-2";

  const css = `
.${scope} .bb-bookblock {
  position: relative;
  z-index: 100;
  perspective: 1600px;
  backface-visibility: hidden;
  touch-action: pan-y;
  background: ${pageColor};
}
.${scope} .bb-item {
  position: absolute;
  inset: 0;
  display: none;
  background: ${pageColor};
  overflow: hidden;
}
.${scope} .bb-bookblock img,
.${scope} .bb-inner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  user-select: none;
  -webkit-user-drag: none;
}
.${scope} .bb-page {
  position: absolute;
  transform-style: preserve-3d;
  transition-property: transform;
  will-change: transform;
}
.${scope} .bb-vertical .bb-page {
  width: 50%;
  height: 100%;
  left: 50%;
  transform-origin: left center;
}
.${scope} .bb-horizontal .bb-page {
  width: 100%;
  height: 50%;
  top: 50%;
  transform-origin: center top;
}
.${scope} .bb-page > div,
.${scope} .bb-outer,
.${scope} .bb-inner {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}
.${scope} .bb-content {
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  background: ${pageColor};
}
.${scope} .bb-page > div {
  transform-style: preserve-3d;
}
.${scope} .bb-outer {
  overflow: hidden;
  z-index: 999;
}
.${scope} .bb-vertical .bb-front .bb-content { left: -100%; }
.${scope} .bb-horizontal .bb-front .bb-content { top: -100%; }
.${scope} .bb-vertical .bb-back { transform: rotateY(-180deg); }
.${scope} .bb-horizontal .bb-back { transform: rotateX(-180deg); }
.${scope} .bb-overlay,
.${scope} .bb-flipoverlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: #000;
  pointer-events: none;
}
.${scope} .bb-bookblock.bb-vertical > .bb-page:first-child,
.${scope} .bb-bookblock.bb-vertical > .bb-page:first-child .bb-back {
  transform: rotateY(180deg);
}
.${scope} .bb-bookblock.bb-horizontal > .bb-page:first-child,
.${scope} .bb-bookblock.bb-horizontal > .bb-page:first-child .bb-back {
  transform: rotateX(180deg);
}
.${scope} .bb-vertical .bb-flip-next,
.${scope} .bb-vertical .bb-flip-initial { transform: rotateY(-180deg); }
.${scope} .bb-vertical .bb-flip-prev { transform: rotateY(0deg); }
.${scope} .bb-vertical .bb-flip-next-end { transform: rotateY(-14deg); }
.${scope} .bb-vertical .bb-flip-prev-end { transform: rotateY(-166deg); }
.${scope} .bb-horizontal .bb-flip-next,
.${scope} .bb-horizontal .bb-flip-initial { transform: rotateX(180deg); }
.${scope} .bb-horizontal .bb-flip-prev { transform: rotateX(0deg); }
.${scope} .bb-horizontal .bb-flip-next-end { transform: rotateX(14deg); }
.${scope} .bb-horizontal .bb-flip-prev-end { transform: rotateX(166deg); }
@media (prefers-reduced-motion: reduce) {
  .${scope} .bb-page { transition-duration: 1ms !important; }
}
`;

  return (
    <div
      className={`${scope} min-h-screen w-full px-5 py-14 sm:px-8 lg:px-12 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        className={`mx-auto grid w-full max-w-6xl gap-5 sm:gap-6 ${gridColumns}`}
      >
        {resolvedDecks.map((deck, i) => (
          <Deck
            key={`${deck.title}-${i}`}
            deck={deck}
            aspect={aspect}
            orientation={orientation}
            speed={speed}
            easing={easing}
            shadows={shadows}
            shadowSides={shadowSides}
            shadowFlip={shadowFlip}
            circular={circular}
            autoplay={autoplay}
            interval={interval}
            swipe={swipe}
            pauseOnHover={pauseOnHover}
            cardColor={cardColor}
            borderColor={borderColor}
            textColor={textColor}
            mutedColor={mutedColor}
            accentColor={accentColor}
            showCounter={showCounter}
            showProgress={showProgress}
            showArrows={showArrows}
            keyboard={keyboard}
          />
        ))}
      </div>
    </div>
  );
}
