"use client";

import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    rows: [
      [{ text: "Temptation" }],
      [
        { text: "a " },
        { text: "desire", style: "em" },
        { text: " to " },
        { text: "engage", style: "strong" },
      ],
    ],
    linkLabel: "Explore",
    linkHref: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    rows: [
      [{ text: "Heartful " }, { text: "acts", style: "strong" }],
      [{ text: "when " }, { text: "passion", style: "em" }, { text: " calls" }],
    ],
    linkLabel: "Explore",
    linkHref: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    rows: [
      [{ text: "Somebody's " }, { text: "game", style: "strong" }],
      [{ text: "in ancient " }, { text: "dreams", style: "em" }],
    ],
    linkLabel: "Explore",
    linkHref: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    rows: [
      [{ text: "Far from\u0020" }, { text: "Venice", style: "em" }],
      [
        { text: "sunset", style: "strong" },
        { text: " in her " },
        { text: "gaze", style: "em" },
      ],
    ],
    linkLabel: "Explore",
    linkHref: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    rows: [
      [{ text: "Endless " }, { text: "night", style: "em" }],
      [
        { text: "one " },
        { text: "shepherd", style: "strong" },
        { text: " gone" },
      ],
    ],
    linkLabel: "Explore",
    linkHref: "#",
  },
];

export default function ArrowClipSlideshow({
  slides = DEFAULT_SLIDES,
  bgColor = "#000",
  textColor = "#fff",
  frameColor = "#ff5ba4",
  title = "Stories",
  showTitle = true,
  showNav = true,
  showIndex = true,
  clipInitial = "polygon(100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%, 0% 0%)",
  clipFinalRight = "polygon(75% 10%, 90% 50%, 75% 90%, 10% 90%, 20% 50%, 10% 10%)",
  clipFinalLeft = "polygon(90% 10%, 75% 50%, 90% 90%, 30% 90%, 10% 50%, 30% 10%)",
  clipHover = "polygon(97% 10%, 97% 50%, 97% 87%, 3% 87%, 3% 50%, 3% 10%)",
  hoverDuration = 1,
  hoverEase = "expo",
  clipOutDuration = 0.7,
  clipOutEase = "expo",
  clipInDuration = 0.7,
  clipInEase = "expo.inOut",
  clipInDelay = 0.7,
  slideOutDuration = 0.5,
  slideOutEase = "expo.inOut",
  slideOutDelay = 0.4,
  slideInDuration = 0.5,
  slideInEase = "expo",
  slideInDelay = 0.7,
  textOutDuration = 1,
  textOutEase = "power3",
  textInDuration = 1.5,
  textInEase = "expo.inOut",
  textInDelay = 0.4,
  textStagger = 0.1,
  linkFadeDuration = 0.5,
  linkFadeDelay = 1,
  imgParallax = 100,
  autoplay = false,
  autoplayDelay = 5000,
  enableKeyboard = true,
  enableWheel = false,
  headlineSize = "clamp(2rem,6.5vw,6rem)",
  accentSize = "clamp(2rem,7vw,6rem)",
  serifFamily = "Georgia, serif",
  height = "100vh",
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cls = "ssr" + uid;

  const rootRef = useRef(null);
  const gsapRef = useRef(null);
  const animatingRef = useRef(false);
  const currentRef = useRef(0);
  const navigateRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

  const total = slides.length;

  useEffect(() => {
    let cancelled = false;

    const cleanups = [];

    import("gsap")
      .then((mod) => {
        if (cancelled) return;
        const gsap = mod.gsap || mod.default;
        const root = rootRef.current;
        if (!gsap || !root) return;

        gsapRef.current = gsap;

        const slideEls = Array.from(
          root.querySelectorAll("." + cls + "-slide"),
        );
        if (!slideEls.length) return;

        const parts = slideEls.map((el) => ({
          el,
          imgWrap: el.querySelector("." + cls + "-imgwrap"),
          img: el.querySelector("." + cls + "-img"),
          text: el.querySelectorAll("." + cls + "-row > span"),
          link: el.querySelector("." + cls + "-link"),
        }));

        gsap.set(parts[currentRef.current].imgWrap, {
          clipPath: clipInitial,
        });
        setReady(true);

        parts.forEach((p) => {
          if (!p.link) return;
          const enter = () => {
            gsap.killTweensOf(p.imgWrap);
            gsap.to(p.imgWrap, {
              duration: hoverDuration,
              ease: hoverEase,
              clipPath: clipHover,
            });
          };
          const leave = () => {
            gsap.killTweensOf(p.imgWrap);
            gsap.to(p.imgWrap, {
              duration: hoverDuration,
              ease: hoverEase,
              clipPath: clipInitial,
            });
          };
          p.link.addEventListener("mouseenter", enter);
          p.link.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            p.link.removeEventListener("mouseenter", enter);
            p.link.removeEventListener("mouseleave", leave);
          });
        });

        const navigate = (direction) => {
          if (animatingRef.current) return false;
          animatingRef.current = true;

          const currentSlide = parts[currentRef.current];
          const nextIndex =
            direction === "next"
              ? currentRef.current < total - 1
                ? currentRef.current + 1
                : 0
              : currentRef.current > 0
                ? currentRef.current - 1
                : total - 1;
          currentRef.current = nextIndex;
          const upcomingSlide = parts[nextIndex];
          const isNext = direction === "next";
          const clipFinal = isNext ? clipFinalRight : clipFinalLeft;

          gsap
            .timeline({
              onStart: () => upcomingSlide.el.classList.add(cls + "-current"),
              onComplete: () => {
                animatingRef.current = false;
                currentSlide.el.classList.remove(cls + "-current");
              },
            })
            .addLabel("start", 0)
            .set(
              upcomingSlide.imgWrap,
              { x: isNext ? "-100%" : "100%", clipPath: clipFinal },
              "start",
            )
            .set(upcomingSlide.el, { opacity: 1 }, "start")
            .set(
              upcomingSlide.img,
              { x: isNext ? imgParallax + "%" : -imgParallax + "%" },
              "start",
            )
            .set(upcomingSlide.text, { y: isNext ? "100%" : "-100%" }, "start")
            .set(upcomingSlide.link, { opacity: 0 }, "start")
            .to(
              currentSlide.imgWrap,
              {
                duration: clipOutDuration,
                ease: clipOutEase,
                clipPath: clipFinal,
                rotation: 0.001,
              },
              "start",
            )
            .to(
              currentSlide.text,
              {
                duration: textOutDuration,
                ease: textOutEase,
                y: isNext ? "-100%" : "100%",
              },
              "start",
            )
            .to(
              currentSlide.link,
              { duration: 0.5, ease: textOutEase, opacity: 0 },
              "start",
            )
            .to(
              currentSlide.imgWrap,
              {
                duration: slideOutDuration,
                ease: slideOutEase,
                x: isNext ? "100%" : "-100%",
                rotation: 0.001,
              },
              "start+=" + slideOutDelay,
            )
            .to(
              currentSlide.img,
              {
                duration: slideOutDuration,
                ease: slideOutEase,
                x: isNext ? -imgParallax + "%" : imgParallax + "%",
              },
              "start+=" + slideOutDelay,
            )
            .to(
              upcomingSlide.imgWrap,
              {
                duration: slideInDuration,
                ease: slideInEase,
                x: "0%",
                rotation: 0.001,
              },
              "start+=" + slideInDelay,
            )
            .to(
              upcomingSlide.img,
              { duration: slideInDuration, ease: slideInEase, x: "0%" },
              "start+=" + slideInDelay,
            )
            .to(
              upcomingSlide.imgWrap,
              {
                duration: clipInDuration,
                ease: clipInEase,
                clipPath: clipInitial,
              },
              "start+=" + clipInDelay,
            )
            .to(
              upcomingSlide.text,
              {
                duration: textInDuration,
                ease: textInEase,
                y: "0%",
                rotation: 0.001,
                stagger: isNext ? textStagger : -textStagger,
              },
              "start+=" + textInDelay,
            )
            .to(
              upcomingSlide.link,
              {
                duration: linkFadeDuration,
                ease: "power3.in",
                opacity: 1,
              },
              "start+=" + linkFadeDelay,
            );

          setCurrent(nextIndex);
        };

        navigateRef.current = navigate;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      navigateRef.current = null;
      if (gsapRef.current && rootRef.current) {
        gsapRef.current.killTweensOf(rootRef.current.querySelectorAll("*"));
      }
    };
  }, [
    cls,
    total,
    clipInitial,
    clipFinalRight,
    clipFinalLeft,
    clipHover,
    hoverDuration,
    hoverEase,
    clipOutDuration,
    clipOutEase,
    clipInDuration,
    clipInEase,
    clipInDelay,
    slideOutDuration,
    slideOutEase,
    slideOutDelay,
    slideInDuration,
    slideInEase,
    slideInDelay,
    textOutDuration,
    textOutEase,
    textInDuration,
    textInEase,
    textInDelay,
    textStagger,
    linkFadeDuration,
    linkFadeDelay,
    imgParallax,
  ]);

  useEffect(() => {
    if (!enableKeyboard) return;
    const onKey = (e) => {
      if (!navigateRef.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        navigateRef.current("next");
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        navigateRef.current("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableKeyboard]);

  useEffect(() => {
    if (!enableWheel) return;
    const root = rootRef.current;
    if (!root) return;
    let locked = false;
    let timer;
    const onWheel = (e) => {
      if (locked || !navigateRef.current) return;
      locked = true;
      navigateRef.current(e.deltaY > 0 ? "next" : "prev");
      timer = setTimeout(() => {
        locked = false;
      }, 900);
    };
    root.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      clearTimeout(timer);
      root.removeEventListener("wheel", onWheel);
    };
  }, [enableWheel]);

  useEffect(() => {
    if (!autoplay || !ready) return;
    const id = setInterval(() => {
      if (navigateRef.current) navigateRef.current("next");
    }, autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, autoplayDelay, ready]);

  const pad = (n) => (n < 10 ? "0" + n : String(n));

  const css =
    "." +
    cls +
    "-slide{opacity:0;pointer-events:none;}" +
    "." +
    cls +
    "-slide." +
    cls +
    "-current{opacity:1;pointer-events:auto;}" +
    "." +
    cls +
    "-headline{font-size:" +
    headlineSize +
    ";line-height:0.9;}" +
    "." +
    cls +
    "-headline em,." +
    cls +
    "-headline strong{font-family:" +
    serifFamily +
    ";font-size:" +
    accentSize +
    ";font-weight:400;}" +
    "." +
    cls +
    "-headline em{font-style:italic;}" +
    "." +
    cls +
    "-link::after{content:'';position:absolute;width:50%;height:1px;background:currentColor;left:0;bottom:-25%;transform:scale3d(0,1,1);opacity:0;transform-origin:0% 50%;transition:transform 0.3s,opacity 0s 0.3s;}" +
    "." +
    cls +
    "-link:hover::after{opacity:1;transition:transform 0.3s;transform:scale3d(1,1,1);}";

  return (
    <div
      ref={rootRef}
      className={
        "relative w-full overflow-hidden font-sans antialiased " + className
      }
      style={{ backgroundColor: bgColor, color: textColor, height }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        className="pointer-events-none absolute inset-0 z-50 grid content-between px-6 py-8 md:px-14 md:py-8"
        style={{ color: frameColor }}
      >
        {showTitle ? (
          <h1 className="m-0 text-xl font-normal">{title}</h1>
        ) : (
          <span />
        )}

        {showNav ? (
          <div className="pointer-events-auto flex items-center justify-center md:justify-end">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => navigateRef.current && navigateRef.current("prev")}
              className="mx-2 md:mx-3 block h-6 w-[55px] cursor-pointer appearance-none border-0 bg-transparent p-0 outline-none"
            >
              <svg
                viewBox="0 0 55 24"
                className="block h-full w-full"
                style={{ fill: textColor }}
              >
                <path d="M1.176 11.532a.5.5 0 00-.352.936c5.228 1.96 9.475 5.555 12.752 10.797a.5.5 0 00.848-.53c-3.39-5.424-7.81-9.163-13.248-11.203z" />
                <path d="M1.176 12.468a.5.5 0 01-.352-.936C6.052 9.572 10.3 5.978 13.576.735a.5.5 0 01.848.53c-3.39 5.424-7.81 9.163-13.248 11.203z" />
                <path d="M1 12.5a.5.5 0 110-1h53a.5.5 0 110 1H1z" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next slide"
              onClick={() => navigateRef.current && navigateRef.current("next")}
              className="mx-2 md:mx-3 block h-6 w-[55px] cursor-pointer appearance-none border-0 bg-transparent p-0 outline-none"
            >
              <svg
                viewBox="0 0 55 24"
                className="block h-full w-full"
                style={{ fill: textColor }}
              >
                <path d="M53.824 11.532a.5.5 0 01.352.936c-5.228 1.96-9.475 5.555-12.752 10.797a.5.5 0 01-.848-.53c3.39-5.424 7.81-9.163 13.248-11.203z" />
                <path d="M53.824 12.468a.5.5 0 00.352-.936C48.948 9.572 44.7 5.978 41.424.735a.5.5 0 00-.848.53c3.39 5.424 7.81 9.163 13.248 11.203z" />
                <path d="M54 12.5a.5.5 0 100-1H1a.5.5 0 100 1h53z" />
              </svg>
            </button>

            {showIndex && (
              <div
                className="ml-4 md:ml-8 flex items-center whitespace-nowrap rounded-full border px-4 py-3 md:px-6 md:py-4 text-center"
                style={{ color: textColor, borderColor: textColor }}
              >
                <span className="relative w-8 overflow-hidden">
                  <span className="inline-block">{pad(current + 1)}</span>
                </span>
                <span className="mx-1">&mdash;</span>
                <span className="w-8">{pad(total)}</span>
              </div>
            )}
          </div>
        ) : (
          <span />
        )}
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{ height, backgroundColor: bgColor }}
      >
        {slides.map((slide, i) => (
          <figure
            key={i}
            className={
              cls +
              "-slide absolute left-0 top-0 m-0 flex h-full w-full items-center justify-center" +
              (i === 0 ? " " + cls + "-current" : "")
            }
          >
            <div
              className={
                cls +
                "-imgwrap absolute left-0 top-0 h-full w-full overflow-hidden will-change-transform"
              }
            >
              <div
                className={
                  cls +
                  "-img absolute left-0 top-0 h-full w-full bg-cover bg-center bg-no-repeat will-change-transform"
                }
                style={{ backgroundImage: "url(" + slide.image + ")" }}
              />
            </div>

            <figcaption className="relative w-full cursor-default px-[10vw]">
              <h2
                className={
                  cls +
                  "-headline m-0 font-light uppercase [&_strong]:font-normal"
                }
              >
                {slide.rows.map((row, r) => (
                  <span
                    key={r}
                    className={
                      cls +
                      "-row relative block overflow-hidden whitespace-nowrap"
                    }
                  >
                    <span className="relative block py-2">
                      {row.map((seg, s) =>
                        seg.style === "em" ? (
                          <em key={s}>{seg.text}</em>
                        ) : seg.style === "strong" ? (
                          <strong key={s}>{seg.text}</strong>
                        ) : (
                          <span key={s}>{seg.text}</span>
                        ),
                      )}
                    </span>
                  </span>
                ))}
              </h2>

              <a
                href={slide.linkHref || "#"}
                className={
                  cls +
                  "-link relative mt-4 inline-block font-light no-underline outline-none"
                }
                style={{
                  color: textColor,
                  fontSize: "clamp(1rem, 5vw, 1.75rem)",
                }}
              >
                <span>{slide.linkLabel || "Explore"}</span>
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
