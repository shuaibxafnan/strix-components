"use client";

import { useEffect, useRef, useState } from "react";

const OVERFLOW = 40;
const DEFAULT_ROTATION = [50, 70];

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: "Leopard",
    description:
      "The English name 'leopard' comes from Old French: leupart or Middle French: liepart, that derives from Latin: leopardus and Ancient Greek: λέοπάρδος (leopardos).",
    image:
      "https://images.pexels.com/photos/1642068/pexels-photo-1642068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "700/525",
  },
  {
    id: 2,
    title: "Irbis",
    description:
      "The name 'irbis' comes from the Turkic language, it was borrowed by Russian fur traders from local hunters in the XVII century. In different regions of Central Asia, the predator was called differently: irbish, irbiz, irvish, ilbers.",
    image:
      "https://images.pexels.com/photos/208840/pexels-photo-208840.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "700/460",
  },
  {
    id: 3,
    title: "Tiger",
    description:
      "The Middle English 'tigre' and Old English tigras derive French tigre, from Latin tigris.",
    image:
      "https://images.pexels.com/photos/146067/pexels-photo-146067.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/450",
  },
  {
    id: 4,
    title: "Lion",
    description:
      "The word 'lion' is derived from Latin: leo and Ancient Greek: λέων (leon).",
    image:
      "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/500",
  },
  {
    id: 5,
    title: "Cheetah",
    description:
      "The vernacular name 'cheetah' is derived from Hindustani Urdu: چیتا‎ and Hindi: चीता (ćītā).",
    image:
      "https://images.pexels.com/photos/2544554/pexels-photo-2544554.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/455",
  },
  {
    id: 6,
    title: "Lynx",
    description:
      "The name 'lynx' originated in Middle English via Latin from the Greek word λύγξ, derived from the Indo-European root leuk- ('light, brightness') in reference to the luminescence of its reflective eyes.",
    image:
      "https://images.pexels.com/photos/7386324/pexels-photo-7386324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/470",
  },
  {
    id: 7,
    title: "Manul",
    description:
      "'Manul' is the Pallas's cat's name in the Kyrgyz language. It is called 'manol' in the Mongolian language. The name 'Pallas's cat' was coined by William Thomas Blanford in honour of Peter Simon Pallas.",
    image:
      "https://images.pexels.com/photos/3912757/pexels-photo-3912757.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/460",
  },
  {
    id: 8,
    title: "Cat",
    description:
      "The origin of the English word 'cat', Old English catt, is thought to be the Late Latin word cattus, which was first used at the beginning of the 6th century.",
    image:
      "https://images.pexels.com/photos/177809/pexels-photo-177809.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/460",
  },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const random = (min, max) => Math.random() * (max - min) + min;

export default function ScrollParallaxGallery({
  items = DEFAULT_ITEMS,
  title = "#scroll",
  scrollTopLabel = "Scroll to top",
  backgroundColor = "bg-black",
  textColor = "text-white",
  descriptionColor = "text-white/60",
  fontTitleFamily = "Righteous",
  fontTitleUrl = "https://cdn.jsdelivr.net/fontsource/fonts/righteous@latest/latin-400-normal.woff2",
  fontItemFamily = "Dancing Script",
  fontItemUrl = "https://cdn.jsdelivr.net/fontsource/fonts/dancing-script@latest/latin-400-normal.woff2",
  scrollEase = 0.1,
  rotationRange = DEFAULT_ROTATION,
  imageWidthMax = 600,
  className = "",
}) {
  const [enhanced, setEnhanced] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const scrollableRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setEnhanced(true);
    return () => setEnhanced(false);
  }, []);

  useEffect(() => {
    if (!enhanced) return;
    const scrollable = scrollableRef.current;
    const content = contentRef.current;
    if (!scrollable || !content) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ease = reduceMotion ? 1 : scrollEase;
    const [minRotation, maxRotation] = reduceMotion ? [0, 0] : rotationRange;

    const entries = Array.from(content.querySelectorAll("[data-item]")).map(
      (el) => ({
        el,
        image: el.querySelector("[data-img]"),
        wrap: el.querySelector("[data-wrap]"),
        ry: random(-0.5, 0.5),
        rz: random(-0.5, 0.5),
        maxAngle: random(minRotation, maxRotation),
        top: 0,
        height: 0,
        visible: false,
        active: false,
        shift: 0,
        angle: 0,
      }),
    );
    const byElement = new Map(entries.map((entry) => [entry.el, entry]));

    let cancelled = false;
    let rafId = 0;
    let winHeight = window.innerHeight;
    let smooth = window.scrollY;

    const applyScroll = () => {
      scrollable.style.transform = `translate3d(0,${-smooth}px,0)`;
    };

    const measure = () => {
      if (cancelled) return;
      winHeight = window.innerHeight;
      document.body.style.height = `${scrollable.offsetHeight}px`;
      entries.forEach((entry) => {
        const rect = entry.el.getBoundingClientRect();
        entry.height = rect.height;
        entry.top = rect.top + smooth;
        entry.active = false;
      });
    };

    const onScroll = () => {
      const root = document.documentElement;
      const total = Math.max(1, root.scrollHeight - root.clientHeight);
      setShowTop(window.scrollY / total > 0.4);
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const y = window.scrollY;
      smooth = lerp(smooth, y, ease);
      applyScroll();

      entries.forEach((entry) => {
        if (!entry.visible) {
          entry.active = false;
          return;
        }
        const offset = entry.top - y;
        const shift = clamp(
          map(offset, winHeight, -entry.height, -OVERFLOW, OVERFLOW),
          -OVERFLOW,
          OVERFLOW,
        );
        const angle = clamp(
          map(offset, winHeight * 1.5, -entry.height, entry.maxAngle, -entry.maxAngle),
          -entry.maxAngle,
          entry.maxAngle,
        );
        if (entry.active) {
          entry.shift = lerp(entry.shift, shift, ease);
          entry.angle = lerp(entry.angle, angle, ease);
        } else {
          entry.shift = shift;
          entry.angle = angle;
          entry.active = true;
        }
        entry.image.style.transform = `translate3d(0,${entry.shift}px,0)`;
        entry.wrap.style.transform = `rotate3d(1,${entry.ry},${entry.rz},${entry.angle}deg)`;
      });
    };

    const intersection = new IntersectionObserver((records) => {
      records.forEach((record) => {
        const entry = byElement.get(record.target);
        if (entry) entry.visible = record.isIntersecting;
      });
    });
    entries.forEach((entry) => intersection.observe(entry.el));

    const resize = new ResizeObserver(measure);
    resize.observe(scrollable);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);

    applyScroll();
    measure();
    onScroll();
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      intersection.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      scrollable.style.transform = "";
      entries.forEach((entry) => {
        entry.image.style.transform = "";
        entry.wrap.style.transform = "";
      });
      document.body.style.height = "";
    };
  }, [enhanced, scrollEase, rotationRange[0], rotationRange[1]]);

  const css =
    '@font-face{font-family:"' +
    fontTitleFamily +
    '";src:url("' +
    fontTitleUrl +
    '") format("woff2");font-weight:400;font-display:swap;}' +
    '@font-face{font-family:"' +
    fontItemFamily +
    '";src:url("' +
    fontItemUrl +
    '") format("woff2");font-weight:400;font-display:swap;}' +
    "@keyframes gallery-arrow{0%{opacity:0}25%{opacity:1}75%{opacity:0}100%{opacity:0}}";

  return (
    <main
      className={`${backgroundColor} ${textColor} ${enhanced ? "fixed inset-0 overflow-hidden" : ""} ${className}`}
    >
      <style>{css}</style>
      <div
          ref={scrollableRef}
          className="relative mx-auto grid max-w-[1200px] grid-cols-1 p-[5vw] will-change-transform"
        >
          <h1
            className="m-0 mb-2 text-[6vw] font-normal"
            style={{ fontFamily: `"${fontTitleFamily}", cursive` }}
          >
            {title}
          </h1>

          <svg
            aria-hidden="true"
            viewBox="0 0 60 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute right-[5%] top-[1%] z-[999] h-20 w-[60px]"
          >
            <path
              d="M0 0 L30 22 L60 0"
              className="animate-[gallery-arrow_2s_infinite] [animation-delay:-1s]"
            />
            <path
              d="M0 20 L30 42 L60 20"
              className="animate-[gallery-arrow_2s_infinite] [animation-delay:-0.5s]"
            />
            <path
              d="M0 40 L30 62 L60 40"
              className="animate-[gallery-arrow_2s_infinite]"
            />
          </svg>

          <div ref={contentRef} className="mb-[30vh] mt-[25vh] px-[10vw]">
            {items.map((item, i) => {
              const isEven = i % 2 === 1;
              return (
                <div
                  key={item.id}
                  data-item
                  className={`relative mb-[30vh] grid w-full max-w-[90vw] will-change-transform [perspective:1000px] ${isEven ? "ml-auto" : ""
                    }`}
                  style={{
                    "--w": `calc(${imageWidthMax}px * ${item.aspectRatio})`,
                    gridTemplateColumns: isEven
                      ? "1fr minmax(0, var(--w))"
                      : "minmax(0, var(--w)) 1fr",
                  }}
                >
                  <div
                    data-wrap
                    className={`relative w-full origin-bottom overflow-hidden will-change-transform max-[40em]:[grid-area:1/1/3/3] ${isEven
                        ? "justify-self-end [grid-area:1/2/3/3]"
                        : "[grid-area:1/1/3/2]"
                      }`}
                    style={{ aspectRatio: item.aspectRatio }}
                  >
                    <div
                      data-img
                      className="absolute inset-x-0 -top-[40px] h-[calc(100%+80px)] bg-cover bg-[position:50%_0%] opacity-80 will-change-transform"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                  </div>

                  <h2
                    className={`relative -mt-[3vw] mb-0 self-start px-[3vw] text-[6vw] font-normal leading-none will-change-transform [transform:translate3d(0,0,200px)] max-[40em]:[grid-area:1/1/4/2] ${isEven
                        ? "justify-self-end [grid-area:3/2/4/3]"
                        : "justify-self-start [grid-area:3/1/4/2]"
                      }`}
                    style={{ fontFamily: `"${fontItemFamily}", serif` }}
                  >
                    {item.title}
                  </h2>

                  <p
                    className={`relative m-0 w-[250px] self-start px-8 text-[0.9rem] max-[40em]:w-full max-[40em]:px-0 max-[40em]:py-4 max-[40em]:text-left max-[40em]:[grid-area:3/1/4/3] ${descriptionColor} ${isEven
                        ? "justify-self-end text-right [grid-area:1/1/3/2]"
                        : "justify-self-start [grid-area:1/2/3/3]"
                      }`}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
      </div>

      <button
        type="button"
        aria-label={scrollTopLabel}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center border-0 bg-transparent p-0 transition-all duration-500 ease-out ${textColor} ${showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[200px] opacity-0"
          }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
    </main>
  );
}