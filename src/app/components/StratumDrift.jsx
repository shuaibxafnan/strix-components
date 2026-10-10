"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── StratumDrift ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images             array    25 unsplash urls   Tile image sources (cycled)
// bgColor            string   #111               Page background
// textColor          string   #fff               Primary text color
// altColor           string   #7f6a57            Pretitle / counter accent color
// breakoutColor      string   #211f1b            Oversized outline-ish word color
// loaderColor        string   #aaa               Loader dot color
// title              string   decondition ...    Hero display title
// titleSize          string   clamp(...)         Hero title font size
// bodySize           string   clamp(...)         Paragraph font size
// breakoutBigSize    string   clamp(...)         Large italic line font size
// breakoutMedSize    string   clamp(...)         Medium italic line font size
// backTopSize        string   clamp(...)         Back-to-top label font size
// paragraphOne       string   ...                First body paragraph
// paragraphTwo       string   ...                Second body paragraph
// breakoutBig        string   ...                Large italic drifting line
// breakoutMedium     string   ...                Medium italic drifting line
// backTopLabel       string   Back to the top    Label of the scroll-to-top link
// displayFont        string   'Bodoni Moda'      Italic display face (breakouts)
// bodyFont           string   'Hanken Grotesk'   Body / UI face
// googleFontsHref    string   fonts url          Stylesheet injected at runtime
// smoothScroll       bool     true               Enable inertia smooth scrolling
// smoothLerp         number   0.09               Smooth scroll easing factor
// tileParallax       number   110                Horizontal tile drift in px
// columnParallax     number   90                 Vertical tile drift in px
// textParallax       number   34                 Text block drift in px
// wordParallax       number   130                Breakout word drift in px
// parallaxEase       number   0.075              Drift easing per frame (lower = softer)
// smoothScrollSources array   cdn urls           Fallback list for the smooth-scroll lib
// sectionGap         string   clamp(...)         Vertical breathing room per block
// rotationAngle      number   22.5               Rotation of the first grid (deg)
// tileMargin         string   1vw                Gap around each rotated tile
// showLoader         bool     true               Preload images behind a loader
// showCounters       bool     true               Numbered circles on text sections
// tileBrightness     number   1                  Filter brightness on tiles
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

const GRID_ONE = [
  { speed: 1, offset: 0 },
  { speed: -1, offset: 6 },
  { speed: 1, offset: 12 },
  { speed: -1, offset: 18 },
  { speed: 1, offset: 3 },
];

const GRID_TWO = [
  { speed: 1, offset: 9 },
  { speed: 2, offset: 15 },
  { speed: 1, offset: 21 },
];

const GRID_THREE = [
  { speed: 1, offset: 2 },
  { speed: -1, offset: 5 },
  { speed: 1, offset: 8 },
  { speed: -1, offset: 11 },
];

const SMOOTH_SCROLL_SOURCES = [
  "https://unpkg.com/lenis@1.1.14/dist/lenis.min.js",
  "https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js",
  "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
];

export default function StratumDrift({
  images = DEFAULT_IMAGES,
  bgColor = "#111",
  textColor = "#fff",
  altColor = "#7f6a57",
  breakoutColor = "#211f1b",
  loaderColor = "#aaa",
  title = "decondition yourself",
  titleSize = "clamp(2.5rem, 6vw, 5.5rem)",
  bodySize = "clamp(1rem, 2vw, 1.5rem)",
  breakoutBigSize = "clamp(2rem, 8vw, 7rem)",
  breakoutMedSize = "clamp(1rem, 3.2vw, 2.75rem)",
  backTopSize = "clamp(1.5rem, 3.5vw, 3rem)",
  paragraphOne = "The human world is exploding at the seams. Human creativity and the implementation of human inventions and technology is now at an accelerated fever pitch like nothing ever before seen in the history of the world. Well, where is it leading, and how does one integrate this stuff into one's own life? What does it mean about the experience of being human? I have proposed the existence of an invisible, permeating Something that is throughout all being, all time, all space, all bodies, all thought, which I call Novelty; and the interesting thing about novelty is that it is increasing constantly.",
  paragraphTwo = "The conservation of novelty is simply that, over time, the universe has become more complicated. New levels of complexity become the foundations for yet deeper levels of complexity. And this phenomenon of the production and conservation of what I call novelty is not something which goes on only in the biological domain or only in the cultural domain or only in the domain of physics. It is a trans-categorical impulse in reality, meaning: it is everywhere.",
  breakoutBig = "endless acceleration toward infinity",
  breakoutMedium = "the greatest barrier to your enlightenment",
  backTopLabel = "Back to the top",
  displayFont = "'Bodoni Moda', serif",
  bodyFont = "'Hanken Grotesk', sans-serif",
  googleFontsHref = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@1,6..96,200;1,6..96,400&family=Hanken+Grotesk:wght@300;400;500&display=swap",
  smoothScroll = true,
  smoothLerp = 0.09,
  tileParallax = 110,
  columnParallax = 90,
  textParallax = 34,
  wordParallax = 130,
  parallaxEase = 0.075,
  smoothScrollSources = SMOOTH_SCROLL_SOURCES,
  sectionGap = "clamp(4rem, 12vh, 10rem)",
  rotationAngle = 22.5,
  tileMargin = "1vw",
  showLoader = true,
  showCounters = true,
  tileBrightness = 1,
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
    const id = "stratum-drift-fonts";
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
    "." +
    scopeClass +
    " .sd-counted::after{content:counter(sdSection,decimal-leading-zero);counter-increment:sdSection;}" +
    "." +
    scopeClass +
    "{counter-reset:sdSection;}" +
    "." +
    scopeClass +
    " .sd-tile{margin:" +
    tileMargin +
    ";filter:brightness(" +
    tileBrightness +
    ");}" +
    "@media (prefers-reduced-motion: reduce){." +
    scopeClass +
    " *{animation:none !important;}}" +
    "@keyframes sdLoader-" +
    scopeId +
    "{to{opacity:1;transform:scale3d(0.5,0.5,1);}}" +
    "." +
    scopeClass +
    " .sd-loader-dot{animation:sdLoader-" +
    scopeId +
    " 0.7s linear infinite alternate forwards;}";

  const renderTile = (src, extraClass, styleOverride) => (
    <div
      className={"sd-tile flex-none bg-cover bg-center " + extraClass}
      style={{ backgroundImage: "url(" + src + ")", ...styleOverride }}
    />
  );

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
            className="sd-loader-dot h-[60px] w-[60px] rounded-full opacity-40"
            style={{ backgroundColor: loaderColor }}
          />
        </div>
      ) : null}

      <main className="relative">
        <section
          ref={headerRef}
          className="relative flex min-h-[80vh] flex-col justify-end px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <h1
            data-drift
            data-speed="1.5"
            data-axis="y"
            data-amount={textParallax}
            className="m-0 max-w-[900px] font-normal leading-[0.9]"
            style={{ fontSize: titleSize, willChange: "transform" }}
          >
            {title}
          </h1>
        </section>

        <section
          id={"sd-grid-one-" + scopeId}
          className="relative overflow-hidden"
          style={{
            height: "52vw",
            marginTop: sectionGap,
            marginBottom: sectionGap,
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 w-[150%]"
            style={{
              height: "93.6vw",
              transform:
                "translate3d(-50%,-50%,0) rotate(" + rotationAngle + "deg)",
            }}
          >
            {GRID_ONE.map((line, li) => (
              <div
                key={li}
                data-drift
                data-speed={line.speed}
                data-axis="x"
                data-amount={tileParallax}
                data-target={"#sd-grid-one-" + scopeId}
                className="flex"
              >
                {Array.from({ length: 6 }).map((_, ii) => (
                  <div key={ii} className="contents">
                    {renderTile(
                      pick(line.offset + ii),
                      "w-[calc(16.6666%-2vw)]",
                      {
                        height: "calc(93.6vw / 5 - 2vw)",
                      },
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section
          className="relative flex flex-col justify-center px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <p
            data-drift
            data-speed="1.5"
            data-axis="y"
            data-amount={textParallax}
            className="w-full max-w-[760px] leading-relaxed md:w-[55vw]"
            style={{ fontSize: bodySize }}
          >
            {paragraphOne}
          </p>
          {showCounters ? (
            <span
              className="sd-counted absolute right-12 top-1/2 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border md:flex"
              style={{ color: altColor, borderColor: altColor }}
            />
          ) : null}
        </section>

        <section
          id={"sd-grid-two-" + scopeId}
          className="relative overflow-hidden"
          style={{
            height: "52vw",
            marginTop: sectionGap,
            marginBottom: sectionGap,
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 w-[150%]"
            style={{ height: "52vw", transform: "translate3d(-50%,-50%,0)" }}
          >
            {GRID_TWO.map((line, li) => (
              <div
                key={li}
                data-drift
                data-speed={line.speed}
                data-axis="x"
                data-amount={tileParallax}
                data-target={"#sd-grid-two-" + scopeId}
                className="flex"
              >
                {Array.from({ length: 6 }).map((_, ii) => (
                  <div key={ii} className="contents">
                    {renderTile(
                      pick(line.offset + ii),
                      "w-[calc(16.6666%-2vw)]",
                      {
                        height: "calc(52vw / 3 - 2vw)",
                      },
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section
          className="relative flex flex-col justify-start gap-8 px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <p
            data-drift
            data-speed="2"
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
            data-speed="-1"
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
          className="relative flex flex-col justify-center px-6 md:px-12"
          style={{ paddingTop: sectionGap, paddingBottom: sectionGap }}
        >
          <p
            data-drift
            data-speed="1.5"
            data-axis="y"
            data-amount={textParallax}
            className="w-full max-w-[760px] leading-relaxed md:w-[55vw]"
            style={{ fontSize: bodySize }}
          >
            {paragraphTwo}
          </p>
          {showCounters ? (
            <span
              className="sd-counted absolute right-12 top-1/2 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border md:flex"
              style={{ color: altColor, borderColor: altColor }}
            />
          ) : null}
        </section>

        <section
          id={"sd-grid-three-" + scopeId}
          className="relative overflow-hidden"
          style={{
            height: "120vh",
            marginTop: sectionGap,
            marginBottom: sectionGap,
          }}
        >
          <div
            className="absolute left-0 top-1/2 flex w-full"
            style={{ height: "168vh", transform: "translate3d(0,-50%,0)" }}
          >
            {GRID_THREE.map((line, li) => (
              <div
                key={li}
                data-drift
                data-speed={line.speed}
                data-axis="y"
                data-amount={columnParallax}
                data-target={"#sd-grid-three-" + scopeId}
                className="block w-1/4 px-4"
              >
                {Array.from({ length: 3 }).map((_, ii) => (
                  <div key={ii} className="contents">
                    {renderTile(pick(line.offset + ii * 4), "w-full", {
                      height: "calc(25vw * 1.3)",
                      margin: "2rem 0",
                    })}
                  </div>
                ))}
              </div>
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
