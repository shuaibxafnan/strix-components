"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_SECTIONS = [
  {
    title: "Persepolis",
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Babylonia",
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Diodorus",
    image:
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Zoroastrian",
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Ecbatana",
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1200&q=80",
  },
];

const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);
const map = (x, a, b, c, d) =>
  clamp(((x - a) * (d - c)) / (b - a) + c, Math.min(c, d), Math.max(c, d));

export default function ScrollLetterBend({
  sections = DEFAULT_SECTIONS,
  bgColor = "#131212",
  textColor = "#ffffff",
  titleColor = "#ffffff",
  fontHref = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Archivo:wght@500;600&display=swap",
  titleFontFamily = '"Bodoni Moda", "Didot", "Times New Roman", serif',
  bodyFontFamily = '"Archivo", "Helvetica Neue", Arial, sans-serif',
  titleFontSize = "12vw",
  titleFontSizeMin = "3.25rem",
  titleFontSizeMax = "7rem",
  titleWeight = 300,
  titleTracking = "-0.02em",
  titleTransform = "uppercase",
  imageHeight = "65vh",
  imageMaxWidth = "400px",
  imageRadius = "0.75rem",
  parallaxSpeed = 1,
  bendRange = 50,
  bendScrollRange = 150,
  bendRelease = 0.15,
  smoothScroll = true,
  lerpAmount = 0.1,
  className = "",
}) {
  const rawId = useId();
  const uid = "slb-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!fontHref) return;
    if (document.querySelector('link[data-id="' + fontHref + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontHref;
    link.setAttribute("data-id", fontHref);
    document.head.appendChild(link);
  }, [fontHref]);

  useEffect(() => {
    let disposed = false;
    const cleanups = [];

    import("lenis")
      .then((mod) => {
        const root = rootRef.current;
        if (disposed || !root) return;

        const words = [...root.querySelectorAll("[data-word]")].map(
          (wordEl) => [...wordEl.querySelectorAll("[data-char]")],
        );
        const imgs = [...root.querySelectorAll("[data-parallax]")];

        let scrollY = window.scrollY;
        let cache = scrollY;
        let currentBend = 0;
        let bendRaf;

        const applyBend = (translateY) => {
          for (const chars of words) {
            const total = chars.length;
            for (let j = 0; j < total; j++) {
              const factor =
                j < Math.ceil(total / 2)
                  ? j
                  : Math.ceil(total / 2) -
                    Math.abs(Math.floor(total / 2) - j) -
                    1;
              chars[j].style.transform =
                "translate3d(0," + factor * translateY + "px,0)";
            }
          }
        };

        const applyParallax = () => {
          const vh = window.innerHeight;
          imgs.forEach((img) => {
            const rect = img.getBoundingClientRect();
            const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
            img.style.transform =
              "translate3d(0," + -progress * parallaxSpeed * 100 + "px,0)";
          });
        };

        const tick = () => {
          const distance = scrollY - cache;
          cache = scrollY;
          const target = map(
            distance,
            bendScrollRange,
            -bendScrollRange,
            -bendRange,
            bendRange,
          );

          currentBend = currentBend + (target - currentBend) * bendRelease;
          if (Math.abs(currentBend) < 0.01) currentBend = 0;

          applyBend(currentBend);
          applyParallax();
          bendRaf = requestAnimationFrame(tick);
        };

        bendRaf = requestAnimationFrame(tick);
        cleanups.push(() => {
          cancelAnimationFrame(bendRaf);
          applyBend(0);
        });

        const onScroll = (y) => {
          scrollY = y;
        };

        const Lenis = mod.default;
        if (smoothScroll) {
          const lenis = new Lenis({ lerp: lerpAmount });
          let rafId;
          const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
          };
          rafId = requestAnimationFrame(raf);
          lenis.on("scroll", (e) => onScroll(e.scroll));
          cleanups.push(() => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
          });
        } else {
          const handler = () => onScroll(window.scrollY);
          window.addEventListener("scroll", handler, { passive: true });
          cleanups.push(() => window.removeEventListener("scroll", handler));
        }
      });

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    sections,
    parallaxSpeed,
    bendRange,
    bendScrollRange,
    bendRelease,
    smoothScroll,
    lerpAmount,
  ]);

  const css =
    "." +
    uid +
    " [data-title] {" +
    "font-size: clamp(" +
    titleFontSizeMin +
    "," +
    titleFontSize +
    "," +
    titleFontSizeMax +
    ");" +
    "font-family: " +
    titleFontFamily +
    "; font-weight: " +
    titleWeight +
    ";" +
    "letter-spacing: " +
    titleTracking +
    "; text-transform: " +
    titleTransform +
    ";" +
    "color: " +
    titleColor +
    "; }" +
    "." +
    uid +
    " [data-parallax] { height: " +
    imageHeight +
    "; max-width: " +
    imageMaxWidth +
    ";" +
    "border-radius: " +
    imageRadius +
    "; }";

  return (
    <div
      ref={rootRef}
      className={"w-full overflow-clip " + uid + " " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {sections.map((section, i) => (
        <section
          key={i}
          className="relative grid h-screen w-full select-none items-center justify-center justify-items-center"
        >
          <img
            data-parallax=""
            src={section.image}
            alt={section.alt || section.title}
            className="relative w-full object-cover will-change-transform [grid-area:1/1/2/2]"
          />
          <h2
            data-title=""
            data-word=""
            className="relative m-0 leading-none [grid-area:1/1/2/2]"
          >
            {[...section.title].map((ch, j) => (
              <span
                key={j}
                data-char=""
                className="inline-block whitespace-pre will-change-transform"
              >
                {ch}
              </span>
            ))}
          </h2>
        </section>
      ))}
    </div>
  );
}
