"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── MakeWayGrid ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    IMAGES     Image URLs used to fill the grid
// itemCount         number   39         How many tiles to render (cycles images)
// columns           number   13         Grid columns on desktop
// columnsMobile     number   4          Grid columns below the md breakpoint
// gap               string   "1rem"     Gap between grid tiles
// width             string   "92%"      Grid width inside its container
// aspectRatio       string   "1 / 1.25" Aspect ratio of each tile
// duration          number   0.7        Base animation duration (s)
// ease              string   "expo"     GSAP ease for the main tweens
// scale             number   2          Scale applied to the expanded tile
// skew              number   0          Skew amount for the two-stage pop (deg)
// maxRotation       number   0          Max random rotation of pushed tiles (deg)
// spread            number   80         Max px neighbours move away from target
// maxDistance       number   500        Distance beyond which tiles do not move
// bgColor           string   "#ededed"  Section background
// textColor         string   "#000"     Section text colour
// title             string   "Early years"  Heading above the grid
// intro             string   ...        Paragraph above the grid
// outro             string   ...        Paragraph below the grid
// showMore          boolean  true       Show the "view more" link
// moreLabel         string   "view more"    Label for the more link
// onMore            function undefined  Called when the more link is clicked
// showLoader        boolean  true       Fade the grid in after images preload
// className         string   ""         Extra classes on the outer section
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
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

const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

const centerOf = (el) => ({
  x: el.offsetLeft + el.offsetWidth / 2,
  y: el.offsetTop + el.offsetHeight / 2,
});

const getDistance = (el1, el2) => {
  const a = centerOf(el1);
  const b = centerOf(el2);
  return Math.hypot(a.x - b.x, a.y - b.y);
};

const getTranslationDistance = (el1, el2, spread, maxDistance) => {
  const a = centerOf(el1);
  const b = centerOf(el2);
  const amount = Math.max(
    map(getDistance(el1, el2), 0, maxDistance, spread, 0),
    0,
  );
  const angle = Math.atan2(Math.abs(b.y - a.y), Math.abs(b.x - a.x));
  const x = Math.abs(Math.cos(angle) * amount);
  const y = Math.abs(Math.sin(angle) * amount);
  return {
    x: a.x < b.x ? x * -1 : x,
    y: a.y < b.y ? y * -1 : y,
  };
};

export default function MakeWayGrid({
  images = IMAGES,
  itemCount = 39,
  columns = 13,
  columnsMobile = 4,
  gap = "1rem",
  width = "92%",
  aspectRatio = "1 / 1.25",
  duration = 0.7,
  ease = "expo",
  scale = 2,
  skew = 0,
  maxRotation = 0,
  spread = 80,
  maxDistance = 500,
  bgColor = "#ededed",
  textColor = "#000",
  title = "Early years",
  intro = "Marlowe Chastain Verrow was a coastal-born writer, essayist and occasional printmaker whose work circled the same few streets for forty years.",
  showMore = true,
  moreLabel = "view more",
  onMore,
  showLoader = true,
  className = "",
}) {
  const uid = useId().replace(/[:]/g, "");
  const gridRef = useRef(null);
  const itemRefs = useRef([]);
  const tlRef = useRef(null);
  const expandedRef = useRef(-1);
  const gsapRef = useRef(null);
  const [ready, setReady] = useState(!showLoader);
  const [gsapReady, setGsapReady] = useState(false);

  const tiles = useMemo(() => {
    const list = [];
    for (let i = 0; i < itemCount; i += 1) {
      list.push(images[i % images.length]);
    }
    return list;
  }, [images, itemCount]);

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

    let alive = true;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        if (!alive) return;
        gsapRef.current = window.gsap;
        setGsapReady(true);
      })
      .catch((e) =>
        console.error("[MakeWayGrid] GSAP load failed:", e.message),
      );

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!showLoader) return undefined;
    let alive = true;
    let remaining = tiles.length;

    if (remaining === 0) {
      setReady(true);
      return undefined;
    }

    const done = () => {
      remaining -= 1;
      if (remaining <= 0 && alive) setReady(true);
    };

    tiles.forEach((src) => {
      const img = new window.Image();
      img.onload = done;
      img.onerror = done;
      img.src = src;
    });

    const fallback = window.setTimeout(() => {
      if (alive) setReady(true);
    }, 4000);

    return () => {
      alive = false;
      window.clearTimeout(fallback);
    };
  }, [tiles, showLoader]);

  useEffect(() => {
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, []);

  const expand = useCallback(
    (index) => {
      const gsap = gsapRef.current;
      const els = itemRefs.current;
      const target = els[index];
      if (!gsap || !target) return;

      if (tlRef.current) tlRef.current.kill();

      const previous =
        expandedRef.current !== -1 && expandedRef.current !== index
          ? expandedRef.current
          : -1;
      const next = expandedRef.current === index ? -1 : index;
      expandedRef.current = next;

      const tl = gsap.timeline({ defaults: { duration, ease } });
      tlRef.current = tl;

      tl.addLabel("start", 0)
        .addLabel("end", duration)
        .set(
          target,
          { zIndex: next === -1 ? 1 : 999 },
          next === -1 ? "end" : "start",
        );

      if (skew) {
        tl.to(
          target,
          {
            duration: duration * 0.4,
            ease: "sine.in",
            scale: 1 + (scale - 1) / 2,
            skewX: next === -1 ? -1 * skew : skew,
            skewY: next === -1 ? -1 * skew : skew,
            x: 0,
            y: 0,
            rotation: 0,
          },
          "start",
        ).to(
          target,
          {
            duration: duration * 0.6,
            ease: "power4",
            scale: next === -1 ? 1 : scale,
            skewX: 0,
            skewY: 0,
          },
          "start+=" + duration * 0.4,
        );
      } else {
        tl.to(
          target,
          { scale: next === -1 ? 1 : scale, x: 0, y: 0, rotation: 0 },
          "start",
        );
      }

      if (previous !== -1 && els[previous]) {
        tl.set(els[previous], { zIndex: 1 }, "start").to(
          els[previous],
          { scale: 1, x: 0, y: 0, rotation: 0 },
          "start",
        );
      }

      els.forEach((el, i) => {
        if (!el || i === index) return;

        const offset =
          next === -1
            ? { x: 0, y: 0 }
            : getTranslationDistance(el, target, spread, maxDistance);

        const distance = getDistance(el, target);
        const zIndex = Math.round(map(distance, 0, 100000, 998, 1));
        const rotationRange = maxRotation
          ? Math.max(Math.round(map(distance, 0, 500, maxRotation, 0)), 0)
          : 0;

        tl.set(
          el,
          { zIndex: next === -1 ? 1 : zIndex },
          next === -1 ? "end" : "start",
        ).to(
          el,
          {
            x: offset.x,
            y: offset.y,
            rotation:
              next === -1
                ? 0
                : gsap.utils.random(rotationRange * -1, rotationRange),
          },
          "start",
        );
      });
    },
    [duration, ease, scale, skew, spread, maxDistance, maxRotation],
  );

  const gridStyles =
    "#" +
    uid +
    "-grid{grid-template-columns:repeat(" +
    columnsMobile +
    ",minmax(0,1fr));}" +
    "@media screen and (min-width:53em){#" +
    uid +
    "-grid{grid-template-columns:repeat(" +
    columns +
    ",minmax(0,1fr));}}";

  return (
    <section
      className={"w-full overflow-hidden " + className}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style>{gridStyles}</style>

      <div className="flex flex-col justify-start px-8 py-10">
        {intro ? (
          <p className="m-0 mt-8 max-w-[1350px] text-[clamp(1rem,5vw,2.5rem)] font-light leading-[1.1] hyphens-auto">
            {intro}
          </p>
        ) : null}

        {title ? (
          <h3 className="mx-0 mb-0 mt-10 text-lg font-normal">{title}</h3>
        ) : null}

        <div
          id={uid + "-grid"}
          ref={gridRef}
          className="mx-auto my-8 grid pointer-events-none transition-opacity duration-700"
          style={{
            width,
            gap,
            opacity: ready && gsapReady ? 1 : 0,
          }}
        >
          {tiles.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative m-0 pointer-events-auto will-change-transform"
              style={{ zIndex: 1 }}
            >
              <button
                type="button"
                aria-label={"Expand tile " + (i + 1)}
                onClick={() => expand(i)}
                className="block w-full cursor-pointer border-0 bg-cover bg-center p-0 outline-none"
                style={{ aspectRatio, backgroundImage: "url(" + src + ")" }}
              />
            </div>
          ))}
        </div>

        {showMore ? (
          <button
            type="button"
            onClick={onMore}
            className="mb-8 cursor-pointer self-end border-0 bg-transparent p-0 text-base font-bold outline-none"
            style={{ color: textColor }}
          >
            {moreLabel}
          </button>
        ) : null}

      </div>
    </section>
  );
}
