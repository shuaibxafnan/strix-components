"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── ElasticitySlider ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides            array    CHAPTERS   Slides: {image, title, text}
// bgColor           string   #000000    Page background
// slideBgColor      string   #171719    Background of the opened content panel
// textColor         string   #ffffff    Primary text color
// mutedColor        string   rgba(…5)   Idle nav / paragraph color
// hoverColor        string   #f8c5dc    Nav hover color
// fontFamily        string   ui-sans…   Font stack for the whole component
// title             string   Fullscr…   Small heading in the frame
// hintLabel         string   ↓ Scrol…   Hint line in the frame
// cursorLabel       string   + Disco…   Text that follows the cursor
// backLabel         string   ← Go ba…   Label shown while a slide is open
// duration          number   1.6        Slide + content transition duration (s)
// ease              string   power3…    Slide + content easing
// imageScale        number   2          scaleY of the outgoing image during travel
// contentImgScale   number   1.5        Starting scaleY of the content thumbnail
// cursorLerp        number   0.15       Cursor follow smoothing (0–1, lower = slower)
// cursorOffsetX     number   20         Cursor text offset from the pointer (px)
// wheelSpeed        number   -1         Wheel delta multiplier (invert with -1)
// tolerance         number   10         Observer gesture tolerance (px)
// contentImgHeight  number   300        Height of the content thumbnail (px)
// showNav           bool     true       Show the chapter nav list
// showCursor        bool     true       Show the custom cursor text
// loaderColor       string   rgba(…5)   Color of the initial loading dot
// ──────────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80",
    title: "Stronger",
    text: "The tide pulled back further than anyone remembered it going, and for a moment the whole bay held its breath. What was left behind was not wreckage but shape, the bones of something older than the water.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1600&q=80",
    title: "No choice",
    text: "Every road out of the valley climbs before it descends. The ones who leave early swear they never looked back, but the pass is high enough that looking back is simply what the eye does.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1600&q=80",
    title: "Owned no longer",
    text: "Salt collects in the seams of anything left outdoors long enough. Give it a decade and the paint gives up, give it three and the metal starts to look like coral.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1600&q=80",
    title: "Assert control",
    text: "There is a particular quiet to a room where a machine has just stopped running. The absence has a shape, and it takes the ear a few seconds to agree that nothing is wrong.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1600&q=80",
    title: "Cold and detached",
    text: "Frost arrives from the ground up, not the sky down. By the time it reaches the glass the field has already been white for hours, and no one was awake to watch it happen.",
  },
];

export default function ElasticitySlider({
  slides = CHAPTERS,
  bgColor = "#000000",
  slideBgColor = "#171719",
  textColor = "#ffffff",
  mutedColor = "rgba(255,255,255,0.5)",
  hoverColor = "#f8c5dc",
  fontFamily = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  title = "Fullscreen Scrolling Slideshow",
  hintLabel = "↓ Scroll or drag ↓",
  cursorLabel = "+ Discover more",
  backLabel = "← Go back",
  duration = 1.6,
  ease = "power3.inOut",
  imageScale = 2,
  contentImgScale = 1.5,
  cursorLerp = 0.15,
  cursorOffsetX = 20,
  wheelSpeed = -1,
  tolerance = 10,
  contentImgHeight = 300,
  showNav = true,
  showCursor = true,
  loaderColor = "rgba(255,255,255,0.5)",
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const scope = "sss-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let rafId = null;
    let observer = null;
    const cleanups = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const found = document.querySelector('script[data-id="' + src + '"]');
        if (found) {
          if (found.getAttribute("data-loaded") === "1") {
            resolve();
            return;
          }
          found.addEventListener("load", () => resolve());
          found.addEventListener("error", () =>
            reject(new Error("Failed: " + src)),
          );
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = () => {
          el.setAttribute("data-loaded", "1");
          resolve();
        };
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    const splitChars = (el) => {
      const source = el.getAttribute("data-text") || el.textContent;
      el.innerHTML = "";
      const chars = [];
      source.split("").forEach((character) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = character === " " ? "\u00A0" : character;
        el.appendChild(span);
        chars.push(span);
      });
      return chars;
    };

    const preloadBackgrounds = (nodes) =>
      Promise.all(
        nodes.map(
          (node) =>
            new Promise((resolve) => {
              const match = /url\(["']?(.*?)["']?\)/.exec(
                node.style.backgroundImage || "",
              );
              if (!match) {
                resolve();
                return;
              }
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = match[1];
            }),
        ),
      );

    const boot = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Observer.min.js",
      );

      if (cancelled) return;
      const root = rootRef.current;
      const gsap = window.gsap;
      if (!root || !gsap) return;

      gsap.registerPlugin(window.Observer);
      const Observer = window.Observer;

      const slideEls = [...root.querySelectorAll(".slide")];
      const cursorEl = root.querySelector(".cursor");
      const cursorTextEl = root.querySelector(".cursor__text");
      const backCtrl = root.querySelector(".frame__back");
      const backTextEl = backCtrl.querySelector(".frame__back-text");
      const navItems = [...root.querySelectorAll(".frame__nav-button")];

      const cursorChars = cursorTextEl ? splitChars(cursorTextEl) : [];
      const backChars = splitChars(backTextEl);
      gsap.set(backChars, { opacity: 0 });

      const slidesArr = slideEls.map((el) => ({
        el,
        inner: el.querySelector(".slide__inner"),
        img: el.querySelector(".slide__img"),
        imgInner: el.querySelector(".slide__img-inner"),
        content: el.querySelector(".slide__content"),
        contentImg: el.querySelector(".slide__content-img"),
        isOpen: false,
      }));

      const totalSlides = slidesArr.length;
      let current = -1;
      let isAnimating = false;

      const setCurrentSlide = (position) => {
        if (current !== -1) {
          slidesArr[current].el.classList.remove("slide--current");
        }
        current = position;
        slidesArr[current].el.classList.add("slide--current");
        if (navItems[current]) {
          navItems[current].classList.add("frame__nav-button--current");
        }
      };

      const toggleCursorBackTexts = (isContent) =>
        gsap
          .timeline({
            onStart: () => {
              gsap.set(backChars, { opacity: isContent ? 0 : 1 });
              if (isContent) backCtrl.classList.add("frame__back--show");
            },
            onComplete: () => {
              backCtrl.classList[isContent ? "add" : "remove"](
                "frame__back--show",
              );
            },
          })
          .to(cursorChars, {
            duration: 0.1,
            ease: "expo",
            opacity: isContent ? 0 : 1,
            stagger: { amount: 0.5, grid: "auto", from: "random" },
          })
          .to(
            backChars,
            {
              duration: 0.1,
              ease: "expo",
              opacity: isContent ? 1 : 0,
              stagger: { amount: 0.5, grid: "auto", from: "random" },
            },
            0,
          );

      const hideContent = (slide, animate = false) => {
        isAnimating = true;
        const complete = () => {
          slide.isOpen = false;
          isAnimating = false;
        };

        if (animate) {
          gsap
            .timeline({ defaults: { duration, ease }, onComplete: complete })
            .addLabel("start", 0)
            .to(slide.img, { yPercent: 0 }, "start")
            .to(slide.imgInner, { yPercent: 0, scaleY: 1 }, "start");
        } else {
          gsap.set(slide.img, { yPercent: 0 });
          gsap.set(slide.imgInner, { yPercent: 0, scaleY: 1 });
          complete();
        }
      };

      const showContent = (position) => {
        if (isAnimating) return;
        isAnimating = true;

        const slide = slidesArr[position];
        slide.isOpen = true;

        gsap
          .timeline({
            defaults: { duration, ease },
            onComplete: () => {
              isAnimating = false;
            },
          })
          .addLabel("start", 0)
          .add(() => {
            toggleCursorBackTexts("content");
          }, "start")
          .to(slide.img, { yPercent: -100 }, "start")
          .set(slide.imgInner, { transformOrigin: "50% 100%" }, "start")
          .to(slide.imgInner, { yPercent: 100, scaleY: imageScale }, "start")
          .to(
            slide.contentImg,
            {
              startAt: { transformOrigin: "50% 0%", scaleY: contentImgScale },
              scaleY: 1,
            },
            "start",
          );
      };

      const navigate = (newPosition) => {
        isAnimating = true;

        if (navItems[current]) {
          navItems[current].classList.remove("frame__nav-button--current");
        }
        if (navItems[newPosition]) {
          navItems[newPosition].classList.add("frame__nav-button--current");
        }

        const direction =
          current < newPosition
            ? current === 0 && newPosition === totalSlides - 1
              ? "prev"
              : "next"
            : current === totalSlides - 1 && newPosition === 0
              ? "next"
              : "prev";

        const currentSlide = slidesArr[current];
        current = newPosition;
        const upcomingSlide = slidesArr[current];

        gsap
          .timeline({
            defaults: { duration, ease },
            onComplete: () => {
              currentSlide.el.classList.remove("slide--current");
              if (currentSlide.isOpen) hideContent(currentSlide);
              isAnimating = false;
            },
          })
          .addLabel("start", 0)
          .set(
            [currentSlide.imgInner, upcomingSlide.imgInner],
            {
              transformOrigin: direction === "next" ? "50% 0%" : "50% 100%",
            },
            "start",
          )
          .set(
            upcomingSlide.el,
            { yPercent: direction === "next" ? 100 : -100 },
            "start",
          )
          .set(
            upcomingSlide.inner,
            { yPercent: direction === "next" ? -100 : 100 },
            "start",
          )
          .add(() => {
            upcomingSlide.el.classList.add("slide--current");
          }, "start")
          .add(() => {
            if (currentSlide.isOpen) toggleCursorBackTexts();
          }, "start")
          .to(
            currentSlide.el,
            { yPercent: direction === "next" ? -100 : 100 },
            "start",
          )
          .to(currentSlide.imgInner, { scaleY: imageScale }, "start")
          .to([upcomingSlide.el, upcomingSlide.inner], { yPercent: 0 }, "start")
          .to(
            upcomingSlide.imgInner,
            {
              ease: "power2.inOut",
              startAt: { scaleY: imageScale },
              scaleY: 1,
            },
            "start",
          );
      };

      const next = () => navigate(current < totalSlides - 1 ? current + 1 : 0);
      const prev = () => navigate(current > 0 ? current - 1 : totalSlides - 1);

      setCurrentSlide(0);

      if (showCursor && cursorEl) {
        let pointer = { x: 0, y: 0 };
        const rendered = {
          tx: { previous: 0, current: 0, amt: cursorLerp },
          ty: { previous: 0, current: 0, amt: cursorLerp },
        };
        const lerpValue = (a, b, n) => (1 - n) * a + n * b;
        const bounds = cursorEl.getBoundingClientRect();
        cursorEl.style.opacity = 0;

        const onPointerMove = (ev) => {
          pointer = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("mousemove", onPointerMove);
        cleanups.push(() =>
          window.removeEventListener("mousemove", onPointerMove),
        );

        const render = () => {
          rendered.tx.current = pointer.x + cursorOffsetX;
          rendered.ty.current = pointer.y - bounds.height / 2;
          rendered.tx.previous = lerpValue(
            rendered.tx.previous,
            rendered.tx.current,
            rendered.tx.amt,
          );
          rendered.ty.previous = lerpValue(
            rendered.ty.previous,
            rendered.ty.current,
            rendered.ty.amt,
          );
          cursorEl.style.transform =
            "translateX(" +
            rendered.tx.previous +
            "px) translateY(" +
            rendered.ty.previous +
            "px)";
          rafId = requestAnimationFrame(render);
        };

        const onFirstMove = () => {
          rendered.tx.previous = rendered.tx.current =
            pointer.x + cursorOffsetX;
          rendered.ty.previous = rendered.ty.current =
            pointer.y - bounds.height / 2;
          cursorEl.style.opacity = 1;
          rafId = requestAnimationFrame(render);
          window.removeEventListener("mousemove", onFirstMove);
        };
        window.addEventListener("mousemove", onFirstMove);
        cleanups.push(() =>
          window.removeEventListener("mousemove", onFirstMove),
        );
      }

      navItems.forEach((item, position) => {
        const handler = () => {
          if (current === position || isAnimating) return;
          navigate(position);
        };
        item.addEventListener("click", handler);
        cleanups.push(() => item.removeEventListener("click", handler));
      });

      const backHandler = () => {
        if (isAnimating) return;
        isAnimating = true;
        toggleCursorBackTexts();
        hideContent(slidesArr[current], true);
      };
      backCtrl.addEventListener("click", backHandler);
      cleanups.push(() => backCtrl.removeEventListener("click", backHandler));

      slidesArr.forEach((slide, position) => {
        const handler = () => showContent(position);
        slide.img.addEventListener("click", handler);
        cleanups.push(() => slide.img.removeEventListener("click", handler));
      });

      observer = Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => !isAnimating && prev(),
        onUp: () => !isAnimating && next(),
        wheelSpeed,
        tolerance,
      });

      await preloadBackgrounds([...root.querySelectorAll(".slide__img-inner")]);
      if (!cancelled) setReady(true);
    };

    boot().catch(() => setReady(true));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.kill();
      cleanups.forEach((fn) => fn());
    };
  }, [
    slides,
    duration,
    ease,
    imageScale,
    contentImgScale,
    cursorLerp,
    cursorOffsetX,
    wheelSpeed,
    tolerance,
    showCursor,
    scope,
  ]);

  const css =
    "." +
    scope +
    " .slide--current{pointer-events:auto;opacity:1;}" +
    "." +
    scope +
    " .frame__back--show{opacity:1;pointer-events:auto;}" +
    "." +
    scope +
    " .frame__nav-button::before{content:'';width:2.5rem;height:1px;top:50%;background-color:currentColor;position:absolute;right:calc(100% + 4px);transform-origin:100% 50%;transform:scaleX(0);transition:transform .8s ease-in-out;}" +
    "." +
    scope +
    " .frame__nav-button--current::before{transform:scaleX(1);}" +
    "." +
    scope +
    " .frame__nav-button--current{color:" +
    textColor +
    ";}" +
    "." +
    scope +
    " .frame__nav-button:not(.frame__nav-button--current):hover{color:" +
    hoverColor +
    ";}";

  return (
    <div
      ref={rootRef}
      className={
        scope +
        " relative h-screen w-full overflow-hidden uppercase [-webkit-font-smoothing:antialiased]"
      }
      style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
    >
      <style>{css}</style>

      {!ready ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="h-[60px] w-[60px] animate-pulse rounded-full opacity-40"
            style={{ backgroundColor: loaderColor }}
          />
        </div>
      ) : null}

      <div className="pointer-events-none fixed z-[100] grid h-screen w-full grid-cols-2 grid-rows-[auto_auto_auto_1fr] gap-4 p-10 text-[0.8rem] md:grid-cols-3 md:grid-rows-2 md:content-between">
        <button
          type="button"
          className="frame__back pointer-events-none col-start-1 row-start-1 m-0 cursor-pointer justify-self-start border-0 bg-transparent p-0 font-[inherit] uppercase opacity-0 transition-opacity"
          style={{ color: mutedColor }}
        >
          <span className="frame__back-text" data-text={backLabel}>
            {backLabel}
          </span>
        </button>

        <div className="col-span-2 col-start-1 row-start-2 flex items-start justify-end self-end md:col-span-1 md:col-start-3 md:row-start-2">
          <h1 className="m-0 ml-4 text-base font-normal">{title}</h1>
        </div>

        <span className="col-span-2 col-start-1 row-start-3 self-end md:col-span-1 md:col-start-2 md:row-start-2 md:justify-self-center">
          {hintLabel}
        </span>

        {showNav ? (
          <nav className="col-span-2 col-start-1 row-start-4 grid grid-flow-row content-end justify-items-start gap-2 md:col-span-1 md:col-start-1 md:row-start-2">
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                className="frame__nav-button pointer-events-auto relative m-0 cursor-pointer border-0 bg-transparent p-0 font-[inherit] uppercase transition-colors duration-300"
                style={{ color: mutedColor }}
              >
                {slide.title}
              </button>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="grid h-screen w-full grid-cols-[100%] grid-rows-[100%] place-items-center overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="slide pointer-events-none relative h-[104%] w-full overflow-hidden opacity-0 [grid-area:1/1/-1/-1] will-change-transform"
          >
            <div className="slide__inner relative grid h-full w-full grid-cols-[100%] grid-rows-[100%] overflow-hidden will-change-transform">
              <div
                className="slide__content grid content-center justify-center gap-x-8 p-4 [grid-area:1/1/-1/-1] grid-cols-2 grid-rows-[auto_auto_auto] md:grid-cols-[220px_300px]"
                style={{ backgroundColor: slideBgColor }}
              >
                <div
                  className="slide__content-img col-start-1 row-span-3 row-start-1 bg-cover bg-center will-change-transform"
                  style={{
                    backgroundImage: "url(" + slide.image + ")",
                    height: contentImgHeight,
                  }}
                />
                <h2 className="col-start-2 row-start-1 m-0 mb-12 text-[clamp(3rem,2vw,3rem)] font-extralight normal-case leading-none">
                  {slide.title}
                </h2>
                <p
                  className="col-start-2 row-start-2 m-0 max-w-[260px] leading-[1.5]"
                  style={{ color: mutedColor }}
                >
                  {slide.text}
                </p>
              </div>

              <div className="slide__img relative z-[1] cursor-pointer overflow-hidden [grid-area:1/1/-1/-1]">
                <div
                  className="slide__img-inner h-full w-full bg-cover bg-center bg-no-repeat will-change-transform"
                  style={{ backgroundImage: "url(" + slide.image + ")" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCursor ? (
        <div className="cursor pointer-events-none absolute left-0 top-0 z-[200]">
          <span className="cursor__text text-[0.8rem]" data-text={cursorLabel}>
            {cursorLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
