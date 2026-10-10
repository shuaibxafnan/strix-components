"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── StratumVeil ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images             array    25 unsplash urls   Tile image sources (cycled)
// bgColor            string   #111               Page background
// textColor          string   #fff               Primary text color
// breakoutColor      string   #211f1b            Oversized italic word color
// loaderColor        string   #aaa               Loader dot color
// overlayTitle       string   Contrasts          Title floating over the grid
// overlayTitleSize   string   clamp(...)         Overlay title font size
// bodyText           string   ...                Centered body paragraph
// bodySize           string   clamp(...)         Body paragraph font size
// breakoutBig        string   pursuit of ...     Large italic drifting line
// breakoutBigSize    string   clamp(...)         Large italic line font size
// breakoutMedium     string   the right to ...   Medium italic drifting line
// breakoutMedSize    string   clamp(...)         Medium italic line font size
// backTopLabel       string   Back to the top    Label of the scroll-to-top link
// backTopSize        string   clamp(...)         Back-to-top label font size
// displayFont        string   'Bodoni Moda'      Italic display face
// bodyFont           string   'Hanken Grotesk'   Body / UI face
// googleFontsHref    string   fonts url          Stylesheet injected at runtime
// smoothScroll       bool     true               Enable inertia smooth scrolling
// smoothLerp         number   0.09               Smooth scroll easing factor
// columnParallax     number   110                Vertical column drift in px
// stripParallax      number   40                 Small strip tile drift in px
// textParallax       number   34                 Text block drift in px
// wordParallax       number   130                Breakout word drift in px
// parallaxEase       number   0.075              Drift easing per frame (lower = softer)
// smoothScrollSources array   cdn urls           Fallback list for the smooth-scroll lib
// sectionGap         string   clamp(...)         Vertical breathing room per block
// rotationAngle      number   -22.5              Rotation of the column grid (deg)
// columnWidth        string   33vmax             Width of each rotated column
// columnTileHeight   string   40vmax             Height of each rotated tile
// stripHeight        string   240px              Height of the small tile strip
// tileOpacity        number   0.7                Opacity of the darkened tiles
// showLoader         bool     true               Preload images behind a loader
// className          string   ""                 Extra classes on the root
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

const COLUMNS = [
  { speed: 1, offset: 0 },
  { speed: -1, offset: 4 },
  { speed: 1, offset: 8 },
  { speed: -1, offset: 12 },
  { speed: 1, offset: 16 },
];

const STRIP = [
  { speed: 1, index: 9 },
  { speed: -1, index: 19 },
  { speed: 1, index: 2 },
  { speed: -1, index: 3 },
  { speed: 1, index: 18 },
  { speed: -1, index: 10 },
  { speed: 1, index: 22 },
  { speed: -1, index: 24 },
];

const SMOOTH_SCROLL_SOURCES = [
  "https://unpkg.com/lenis@1.1.14/dist/lenis.min.js",
  "https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js",
  "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
];

export default function StratumVeil({
  images = DEFAULT_IMAGES,
  bgColor = "#111",
  textColor = "#fff",
  breakoutColor = "#211f1b",
  loaderColor = "#aaa",
  overlayTitle = "Contrasts",
  overlayTitleSize = "clamp(3rem, 9vw, 8rem)",
  bodyText = "Psychedelics are illegal not because a loving government is concerned that you may jump out of a third story window. Psychedelics are illegal because they dissolve opinion structures and culturally laid down models of behaviour and information processing. They open you up to the possibility that everything you know is wrong.",
  bodySize = "clamp(1rem, 2vw, 1.5rem)",
  breakoutBig = "pursuit of happiness",
  breakoutBigSize = "clamp(2rem, 8vw, 7rem)",
  breakoutMedium = "the right to experiment with your own consciousness",
  breakoutMedSize = "clamp(1rem, 3.2vw, 2.75rem)",
  backTopLabel = "Back to the top",
  backTopSize = "clamp(1.5rem, 3.5vw, 3rem)",
  displayFont = "'Bodoni Moda', serif",
  bodyFont = "'Hanken Grotesk', sans-serif",
  googleFontsHref = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,700;1,6..96,200;1,6..96,400&family=Hanken+Grotesk:wght@300;400;500&display=swap",
  smoothScroll = true,
  smoothLerp = 0.09,
  columnParallax = 110,
  stripParallax = 40,
  textParallax = 34,
  wordParallax = 130,
  parallaxEase = 0.075,
  smoothScrollSources = SMOOTH_SCROLL_SOURCES,
  sectionGap = "clamp(4rem, 12vh, 10rem)",
  rotationAngle = -22.5,
  columnWidth = "33vmax",
  columnTileHeight = "40vmax",
  stripHeight = "240px",
  tileOpacity = 0.7,
  showLoader = true,
  className = "",
}) {
  const scopeId = useId().replace(/:/g, "");
  const rootRef = useRef(null);
  const headerRef = useRef(null);
  const lenisRef = useRef(null);
  const [loading, setLoading] = useState(showLoader);

  const pick = (index) => images[index % images.length];

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "stratum-veil-fonts";
    if (!document.querySelector('link[data-id="' + id + '"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = googleFontsHref;
      link.setAttribute("data-id", id);
      document.head.appendChild(link);
    }
  }, [googleFontsHref]);

  useEffect(() => {
    if (!showLoader) return;
    let cancelled = false;
    let pending = images.length;
    if (!pending) {
      setLoading(false);
      return;
    }
    const done = () => {
      pending -= 1;
      if (pending <= 0 && !cancelled) setLoading(false);
    };
    const nodes = images.map((src) => {
      const img = new window.Image();
      img.onload = done;
      img.onerror = done;
      img.src = src;
      return img;
    });
    const timeout = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 6000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      nodes.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [images, showLoader]);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;

    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const items = Array.from(root.querySelectorAll("[data-drift]")).map(
      (el) => {
        const targetSelector = el.getAttribute("data-target");
        return {
          el,
          axis: el.getAttribute("data-axis") || "y",
          speed: parseFloat(el.getAttribute("data-speed") || "1"),
          amount: parseFloat(el.getAttribute("data-amount") || "100"),
          trigger: targetSelector
            ? root.querySelector(targetSelector) || el
            : el,
          current: 0,
          target: 0,
          settled: false,
        };
      },
    );

    items.forEach((item) => {
      item.el.style.willChange = "transform";
    });

    if (reduced) {
      return () => {
        items.forEach((item) => {
          item.el.style.willChange = "";
          item.el.style.transform = "";
        });
      };
    }

    const measure = (item) => {
      const rect = item.trigger.getBoundingClientRect();
      const viewport = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const span = (viewport + rect.height) / 2;
      const progress = span === 0 ? 0 : (center - viewport / 2) / span;
      const clamped = Math.max(-1.2, Math.min(1.2, progress));
      return clamped * item.speed * item.amount;
    };

    let rafId = 0;
    let lenisInstance = null;

    const tick = () => {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        item.target = measure(item);
        const delta = item.target - item.current;
        if (Math.abs(delta) < 0.01) {
          if (item.settled) {
            rafId = 0;
            continue;
          }
          item.current = item.target;
          item.settled = true;
        } else {
          item.current += delta * parallaxEase;
          item.settled = false;
        }
        const value = Math.round(item.current * 100) / 100;
        item.el.style.transform =
          item.axis === "x"
            ? "translate3d(" + value + "px,0,0)"
            : "translate3d(0," + value + "px,0)";
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

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

    const loadFirst = (sources) =>
      sources.reduce(
        (chain, src) => chain.catch(() => loadScript(src)),
        Promise.reject(new Error("start")),
      );

    let smoothRaf = 0;

    if (smoothScroll) {
      loadFirst(smoothScrollSources)
        .then(() => {
          const found = window.Lenis;
          const Lenis = found && found.default ? found.default : found;
          if (typeof Lenis !== "function") return;
          lenisInstance = new Lenis({ lerp: smoothLerp, smoothWheel: true });
          lenisRef.current = lenisInstance;
          const raf = (time) => {
            lenisInstance.raf(time);
            smoothRaf = window.requestAnimationFrame(raf);
          };
          smoothRaf = window.requestAnimationFrame(raf);
        })
        .catch(() => {});
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (smoothRaf) window.cancelAnimationFrame(smoothRaf);
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisRef.current = null;
      }
      items.forEach((item) => {
        item.el.style.willChange = "";
        item.el.style.transform = "";
      });
    };
  }, [loading, smoothScroll, smoothLerp, parallaxEase, smoothScrollSources]);

  const scrollTop = () => {
    const target = headerRef.current;
    if (!target) return;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target);
      return;
    }
    target.scrollIntoView({ behavior: "smooth" });
  };

  const scopeClass = "stratum-" + scopeId;

  const styleBlock =
    "@keyframes svLoader-" +
    scopeId +
    "{to{opacity:1;transform:scale3d(0.5,0.5,1);}}" +
    "." +
    scopeClass +
    " .sv-loader-dot{animation:svLoader-" +
    scopeId +
    " 0.7s linear infinite alternate forwards;}" +
    "@media (prefers-reduced-motion: reduce){." +
    scopeClass +
    " *{animation:none !important;}}";

  return (
    <div
      ref={rootRef}
      className={"relative w-full " + scopeClass + " " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        overflowX: "clip",
      }}
    >
      <style>{styleBlock}</style>

      {loading ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="sv-loader-dot h-[60px] w-[60px] rounded-full opacity-40"
            style={{ backgroundColor: loaderColor }}
          />
        </div>
      ) : null}

      <main className="relative">
        <section
          ref={headerRef}
          id={"sv-grid-" + scopeId}
          className="relative overflow-hidden"
          style={{ height: "160vmax", marginBottom: sectionGap }}
        >
          <div
            className="absolute left-1/2 top-1/2 flex w-[150%] items-center justify-center"
            style={{
              transform:
                "translate3d(-50%,-50%,0) rotate(" + rotationAngle + "deg)",
            }}
          >
            {COLUMNS.map((column, ci) => (
              <div
                key={ci}
                data-drift
                data-speed={column.speed}
                data-axis="y"
                data-amount={columnParallax}
                data-target={"#sv-grid-" + scopeId}
                className="block flex-none px-[1.5vw]"
                style={{
                  width: columnWidth,
                  marginTop: ci % 2 === 1 ? "-20vmax" : "0",
                }}
              >
                {Array.from({ length: 5 }).map((_, ii) => (
                  <div
                    key={ii}
                    className="w-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url(" + pick(column.offset + ii) + ")",
                      height: columnTileHeight,
                      margin: "3vw 0",
                      opacity: tileOpacity,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          <h2
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center leading-[0.85] md:px-12"
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: overlayTitleSize,
            }}
          >
            {overlayTitle}
          </h2>
        </section>

        <section
          className="relative flex flex-col items-center justify-center px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <p
            data-drift
            data-speed="2"
            data-axis="y"
            data-amount={textParallax}
            className="w-full max-w-[760px] text-center leading-relaxed"
            style={{ fontSize: bodySize }}
          >
            {bodyText}
          </p>
        </section>

        <section
          className="relative flex flex-col justify-start gap-8 px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <p
            data-drift
            data-speed="1"
            data-axis="x"
            data-amount={wordParallax}
            className="m-0 -mx-6 whitespace-nowrap uppercase italic leading-none md:-mx-12"
            style={{
              fontFamily: displayFont,
              fontWeight: 200,
              fontSize: breakoutBigSize,
              color: breakoutColor,
            }}
          >
            {breakoutBig}
          </p>
          <p
            data-drift
            data-speed="2"
            data-axis="x"
            data-amount={wordParallax}
            className="m-0 -mx-6 whitespace-nowrap uppercase italic leading-none md:-mx-12"
            style={{
              fontFamily: displayFont,
              fontWeight: 200,
              fontSize: breakoutMedSize,
              color: breakoutColor,
            }}
          >
            {breakoutMedium}
          </p>
        </section>

        <section
          id={"sv-strip-" + scopeId}
          className="relative overflow-hidden"
          style={{
            height: stripHeight,
            marginTop: sectionGap,
            marginBottom: sectionGap,
          }}
        >
          <div className="flex h-full w-full items-center">
            {STRIP.map((tile, ti) => (
              <div
                key={ti}
                data-drift
                data-speed={tile.speed}
                data-axis="y"
                data-amount={stripParallax}
                data-target={"#sv-strip-" + scopeId}
                className="h-full flex-none bg-cover bg-center"
                style={{
                  backgroundImage: "url(" + pick(tile.index) + ")",
                  width: "calc(12.5% - 10px)",
                  margin: "0 5px",
                }}
              />
            ))}
          </div>
        </section>

        <section
          className="relative flex flex-col items-center justify-center px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <button
            type="button"
            onClick={scrollTop}
            data-drift
            data-speed="2"
            data-axis="y"
            data-amount={textParallax}
            className="cursor-pointer bg-transparent leading-none no-underline outline-none focus-visible:underline"
            style={{ fontSize: backTopSize, color: textColor }}
          >
            {backTopLabel}
            <span className="ml-3 align-top" style={{ fontSize: "0.5em" }}>
              &#8628;
            </span>
          </button>
        </section>
      </main>
    </div>
  );
}
