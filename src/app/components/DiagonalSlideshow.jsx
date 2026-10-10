"use client";

import { useEffect, useId, useRef } from "react";

// ─── DiagonalSlideshow ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides             array    (6 demo)   [{ image, side, title, subtitle, text }] — min 4 required
// bgColor            string   #0c0c0c    Page / stage background
// textColor          string   #f1f1f1    Primary text color
// decoColor          string   #141414    Color of the panel behind the current slide
// sideColor          string   #353535    Vertical side-label color
// fontFamily         string   Futura...  Font stack for the whole component
// height             string   100vh      Stage height (any CSS length)
// columnWidth        number   27         Width of each of the 3 slide columns (%)
// columnGap          number   9.5        Gap between the slide columns (%)
// imageHeight        number   80         Image wrap height inside a slide (%)
// slidePaddingTop    number   10         Slide top padding (vh)
// slidePaddingBottom number   7          Slide bottom padding (vh)
// offsetDivisor      number   3          Peek amount of prev/next slides (higher = closer to center)
// exitRotation       number   30         Rotation (deg) of slides leaving the viewport
// showNav            boolean  true       Show the diagonal prev/next arrow buttons
// showNumbers        boolean  true       Show the "— 1" slide number
// showSideLabel      boolean  true       Show the rotated vertical label
// enableTilt         boolean  true       Mouse tilt/parallax on the current slide
// tiltTranslate      number   20         Max tilt translation (px, ± both axes)
// tiltRotate         number   15         Max tilt rotation (deg, ± both axes)
// tiltCounterTexts   boolean  true       Move texts opposite to the image while tilting
// hoverScale         number   1.1        Image zoom on hover of the current slide
// hoverScaleDuration number   0.8        Image zoom duration (s)
// tiltDuration       number   1.5        Tilt follow duration (s)
// tiltResetDuration  number   1.8        Tilt release duration (s)
// navDuration        number   0.8        Slide travel duration (s)
// navStagger         number   0.07       Delay step between the moving slides (s)
// navEase            string   power4.inOut  Ease for slide travel
// decoBounce         number   40         Deco panel kick distance on navigate (px)
// decoOffsetX        number   -20        Deco panel X offset when content is open (px)
// decoOffsetY        number   20         Deco panel Y offset when content is open (px)
// enableContent      boolean  true       Clicking the current slide opens its content panel
// contentWidth       number   50.5       Content panel width (%)
// contentRight       number   7.5        Content panel right offset (%)
// contentColumns     number   2          Column count of the content body text
// contentTitleSize   string   7vw        Content title font size
// slideTitleSize     string   3.25rem    Slide title font size
// scrambleChars      array    (symbols)  Characters used by the scramble-in effect
// scrambleMinDelay   number   50         Scramble tick min interval (ms)
// scrambleMaxDelay   number   500        Scramble tick max interval (ms)
// disassembleStep    number   30         Per-letter delay when hiding titles (ms)
// loop               boolean  true       Wrap around at the first/last slide
// initialSlide       number   0          Index of the slide shown on mount
// className          string   ""         Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    side: "Memories & Thoughts",
    title: "Automation",
    subtitle: "Every layer is a decision you can still undo",
    text: "Let this settle before you touch it again. The first pass is only a guess at the shape, and the shape is allowed to move. Work on one thing at a time, then step back far enough to lose the detail. What survives that distance is the part worth keeping.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    side: "Random Roam",
    title: "Machines",
    subtitle: "Nothing here was planned, and that is the method",
    text: "We are not teaching you a thing to copy. We are showing a technique and then getting out of the way. Use what you see rather than what you meant to see. The mistake you keep is usually the one that makes it yours.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    side: "Arbitrary Words",
    title: "Coexistence",
    subtitle: "Two things can hold the same frame",
    text: "Contrast is not conflict. Put the heavy thing next to the quiet thing and let the eye decide where to rest. Do not get carried away; there is plenty of time and very little that needs deciding today.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    side: "Haunted Drift",
    title: "Bellamio",
    subtitle: "Take the corner of the brush and let it play",
    text: "Back and forth, no pressure, no destination. Most of what reads as confidence is just repetition that stopped apologising. Keep going until the movement is boring, then look at what you made.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    side: "Fun Diverge",
    title: "Pastures",
    subtitle: "Running water is worth the trouble",
    text: "We avoid the moving parts because they are harder to control, and then we miss the only thing that felt alive. A big shape needs a big root. Give it room before you give it detail.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    side: "Hopes & Dreams",
    title: "Focus",
    subtitle: "Narrow the frame until one thing is left",
    text: "You are not there yet, so there is nothing to worry about. Mix the color, put it down, and judge it wet. Everything else is a rehearsal for a decision you will make in about four minutes.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    side: "Slow Signal",
    title: "Latency",
    subtitle: "Waiting is part of the composition",
    text: "The pause between two states is where the reader catches up with you. Do not fill it. A held beat reads as intention; a rushed one reads as noise.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    side: "Quiet Field",
    title: "Threshold",
    subtitle: "Something changes when you cross it",
    text: "Edges do the work that centres get credit for. Find the line where one material becomes another and spend your attention there. The middle can look after itself.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    side: "Open Loop",
    title: "Cadence",
    subtitle: "Repeat it until it stops sounding like a trick",
    text: "Rhythm is the cheapest structure available and almost nobody uses it deliberately. Set an interval, hold it, then break it exactly once so the break means something.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    side: "Late Light",
    title: "Residue",
    subtitle: "What is left after the obvious is removed",
    text: "Strip the parts that were only there to reassure you. Whatever still holds together afterwards is the actual idea, and it is usually smaller and better than the version you defended.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    side: "Long Exposure",
    title: "Patience",
    subtitle: "Leave the shutter open on purpose",
    text: "Some things only appear if you refuse to hurry them. Let the movement accumulate, accept the blur, and read the result as a record of time rather than a failure of sharpness.",
  },
];

const DEFAULT_CHARS = [
  "$",
  "%",
  "#",
  "&",
  "=",
  "*",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  ".",
  ":",
  ",",
  "^",
];

export default function DiagonalSlideshow({
  slides = DEFAULT_SLIDES,
  bgColor = "#0c0c0c",
  textColor = "#f1f1f1",
  decoColor = "#141414",
  sideColor = "#353535",
  fontFamily = 'Futura, "Futura PT", "Trebuchet MS", sans-serif',
  height = "100vh",
  columnWidth = 27,
  columnGap = 9.5,
  imageHeight = 80,
  slidePaddingTop = 10,
  slidePaddingBottom = 7,
  offsetDivisor = 3,
  exitRotation = 30,
  showNav = true,
  showNumbers = true,
  showSideLabel = true,
  enableTilt = true,
  tiltTranslate = 20,
  tiltRotate = 15,
  tiltCounterTexts = true,
  hoverScale = 1.1,
  hoverScaleDuration = 0.8,
  tiltDuration = 1.5,
  tiltResetDuration = 1.8,
  navDuration = 0.8,
  navStagger = 0.07,
  navEase = "power4.inOut",
  decoBounce = 40,
  decoOffsetX = -20,
  decoOffsetY = 20,
  enableContent = true,
  contentWidth = 50.5,
  contentRight = 7.5,
  contentColumns = 2,
  contentTitleSize = "7vw",
  slideTitleSize = "3.25rem",
  scrambleChars = DEFAULT_CHARS,
  scrambleMinDelay = 50,
  scrambleMaxDelay = 500,
  disassembleStep = 30,
  loop = true,
  initialSlide = 0,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || slides.length < 4) return;

    let disposed = false;
    const timeouts = new Set();
    const cleanups = [];

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (!disposed) fn();
      }, ms);
      timeouts.add(id);
      return id;
    };

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        if (disposed) return;
        const { gsap } = window;
        if (!gsap) return;

        const charsTotal = scrambleChars.length;
        const randInt = (min, max) =>
          Math.floor(Math.random() * (max - min + 1)) + min;
        const lineEq = (y2, y1, x2, x1, v) => {
          const m = (y2 - y1) / (x2 - x1);
          return m * v + (y1 - m * x1);
        };

        const winsize = { width: 0, height: 0 };
        const calcWinsize = () => {
          winsize.width = window.innerWidth;
          winsize.height = window.innerHeight;
        };
        calcWinsize();

        let allowTilt = enableTilt;

        const splitLetters = (el) => {
          if (!el) return [];
          if (el.dataset.rawText === undefined) {
            el.dataset.rawText = el.textContent;
          }
          const raw = el.dataset.rawText;
          el.textContent = "";
          const out = [];
          for (const ch of raw) {
            const span = document.createElement("span");
            span.className = "ds-letter";
            span.textContent = ch === " " ? "\u00A0" : ch;
            span.dataset.initial = span.textContent;
            el.appendChild(span);
            if (ch !== " ") out.push(span);
          }
          return out.sort(() => 0.5 - Math.random());
        };

        const randomizeLetters = (letters) =>
          new Promise((resolve) => {
            const total = letters.length;
            if (!total) return resolve();
            let cnt = 0;
            letters.forEach((letter, pos) => {
              let loopId;
              const spin = () => {
                letter.textContent = scrambleChars[randInt(0, charsTotal - 1)];
                loopId = later(
                  spin,
                  randInt(scrambleMinDelay, scrambleMaxDelay),
                );
              };
              spin();
              later(
                () => {
                  clearTimeout(loopId);
                  letter.style.opacity = 1;
                  letter.textContent = letter.dataset.initial;
                  if (++cnt === total) resolve();
                },
                pos * lineEq(40, 0, 8, 200, total),
              );
            });
          });

        const disassembleLetters = (letters) =>
          new Promise((resolve) => {
            const total = letters.length;
            if (!total) return resolve();
            let cnt = 0;
            letters.forEach((letter, pos) => {
              later(() => {
                letter.style.opacity = 0;
                if (++cnt === total) resolve();
              }, pos * disassembleStep);
            });
          });

        class Slide {
          constructor(el) {
            this.el = el;
            this.imgWrap = el.querySelector("[data-ds='img-wrap']");
            this.img = el.querySelector("[data-ds='img']");
            this.textsWrap = el.querySelector("[data-ds='title-wrap']");
            this.number = el.querySelector("[data-ds='number']");
            this.side = el.querySelector("[data-ds='side']");
            this.titleEl = el.querySelector("[data-ds='title']");
            this.titleLetters = splitLetters(this.titleEl);
            this.sideLetters = splitLetters(this.side);
            this.isCurrent = this.isLeft = this.isRight = false;
            this.calcSizes();
            this.calcTransforms();
            this.initEvents();
          }
          calcSizes() {
            this.width = this.imgWrap.offsetWidth;
            this.height = this.imgWrap.offsetHeight;
          }
          calcTransforms() {
            const d = offsetDivisor;
            this.transforms = [
              {
                x: -1 * (winsize.width / 2 + this.width),
                y: -1 * (winsize.height / 2 + this.height),
                rotation: -exitRotation,
              },
              {
                x: -1 * (winsize.width / 2 - this.width / d),
                y: -1 * (winsize.height / 2 - this.height / d),
                rotation: 0,
              },
              { x: 0, y: 0, rotation: 0 },
              {
                x: winsize.width / 2 - this.width / d,
                y: winsize.height / 2 - this.height / d,
                rotation: 0,
              },
              {
                x: winsize.width / 2 + this.width,
                y: winsize.height / 2 + this.height,
                rotation: exitRotation,
              },
              {
                x:
                  -1 *
                  (winsize.width / 2 - this.width / 2 - winsize.width * 0.075),
                y: 0,
                rotation: 0,
              },
            ];
          }
          initEvents() {
            this.onEnter = () => {
              if (!this.isCurrent || !allowTilt) return;
              clearTimeout(this.mousetime);
              this.mousetime = later(() => {
                gsap.to(this.img, {
                  duration: hoverScaleDuration,
                  ease: "power3.out",
                  scale: hoverScale,
                });
              }, 40);
            };
            this.onMove = (ev) =>
              requestAnimationFrame(() => {
                if (disposed || !allowTilt || !this.isCurrent) return;
                this.tilt(ev);
              });
            this.onLeave = () =>
              requestAnimationFrame(() => {
                if (disposed || !allowTilt || !this.isCurrent) return;
                clearTimeout(this.mousetime);
                gsap.to([this.imgWrap, this.textsWrap], {
                  duration: tiltResetDuration,
                  ease: "power4.out",
                  x: 0,
                  y: 0,
                  rotationX: 0,
                  rotationY: 0,
                });
                gsap.to(this.img, {
                  duration: tiltResetDuration,
                  ease: "power4.out",
                  scale: 1,
                });
              });
            this.imgWrap.addEventListener("mouseenter", this.onEnter);
            this.imgWrap.addEventListener("mousemove", this.onMove);
            this.imgWrap.addEventListener("mouseleave", this.onLeave);
            cleanups.push(() => {
              this.imgWrap.removeEventListener("mouseenter", this.onEnter);
              this.imgWrap.removeEventListener("mousemove", this.onMove);
              this.imgWrap.removeEventListener("mouseleave", this.onLeave);
            });
          }
          tilt(ev) {
            const bounds = this.imgWrap.getBoundingClientRect();
            const rel = {
              x: ev.clientX - bounds.left,
              y: ev.clientY - bounds.top,
            };
            const t = tiltTranslate;
            const r = tiltRotate;
            const tx = ((t * 2) / bounds.width) * rel.x - t;
            const ty = ((t * 2) / bounds.height) * rel.y - t;
            const rx = ((r * 2) / bounds.height) * rel.y - r;
            const ry = ((r * 2) / bounds.width) * rel.x - r;

            gsap.to(this.imgWrap, {
              duration: tiltDuration,
              ease: "power1.out",
              x: tx,
              y: ty,
              rotationX: rx,
              rotationY: ry,
            });
            if (tiltCounterTexts) {
              gsap.to(this.textsWrap, {
                duration: tiltDuration,
                ease: "power1.out",
                x: -tx,
                y: -ty,
              });
            }
          }
          position(pos) {
            gsap.set(this.imgWrap, {
              x: this.transforms[pos].x,
              y: this.transforms[pos].y,
              rotationX: 0,
              rotationY: 0,
              rotationZ: this.transforms[pos].rotation,
              opacity: 1,
            });
          }
          setCurrent(isContentOpen) {
            this.isCurrent = true;
            this.el.dataset.state = "current";
            this.position(isContentOpen ? 5 : 2);
          }
          setLeft(isContentOpen) {
            this.isRight = this.isCurrent = false;
            this.isLeft = true;
            this.el.dataset.state = "visible";
            this.position(isContentOpen ? 0 : 1);
          }
          setRight(isContentOpen) {
            this.isLeft = this.isCurrent = false;
            this.isRight = true;
            this.el.dataset.state = "visible";
            this.position(isContentOpen ? 4 : 3);
          }
          reset() {
            this.isRight = this.isLeft = this.isCurrent = false;
            this.el.dataset.state = "idle";
          }
          hide() {
            gsap.set(this.imgWrap, {
              x: 0,
              y: 0,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              opacity: 0,
            });
          }
          moveToPosition(settings) {
            return new Promise((resolve) => {
              gsap.to(this.imgWrap, {
                duration: navDuration,
                ease: navEase,
                overwrite: "auto",
                delay: settings.delay || 0,
                startAt:
                  settings.from !== undefined
                    ? {
                        x: this.transforms[settings.from + 2].x,
                        y: this.transforms[settings.from + 2].y,
                        rotationX: 0,
                        rotationY: 0,
                        rotationZ: this.transforms[settings.from + 2].rotation,
                      }
                    : {},
                x: this.transforms[settings.position + 2].x,
                y: this.transforms[settings.position + 2].y,
                rotationX: 0,
                rotationY: 0,
                rotationZ: this.transforms[settings.position + 2].rotation,
                onStart:
                  settings.from !== undefined
                    ? () => gsap.set(this.imgWrap, { opacity: 1 })
                    : null,
                onComplete: resolve,
              });
              if (settings.resetImageScale) {
                gsap.to(this.img, {
                  duration: navDuration,
                  ease: navEase,
                  scale: 1,
                });
              }
            });
          }
          hideTexts(animation = false) {
            if (animation) {
              disassembleLetters(this.titleLetters).then(() =>
                gsap.set(this.textsWrap, { opacity: 0 }),
              );
              disassembleLetters(this.sideLetters).then(() =>
                gsap.set(this.side, { opacity: 0 }),
              );
            } else {
              gsap.set([this.textsWrap, this.side], { opacity: 0 });
            }
          }
          showTexts(animation = true) {
            gsap.set([this.textsWrap, this.side], { opacity: 1 });
            if (!animation) {
              [...this.titleLetters, ...this.sideLetters].forEach((l) => {
                l.style.opacity = 1;
              });
              return;
            }
            randomizeLetters(this.titleLetters);
            randomizeLetters(this.sideLetters);
            if (this.number) {
              gsap.to(this.number, {
                duration: 0.6,
                ease: "elastic.out(1, 0.5)",
                startAt: { x: "-10%", opacity: 0 },
                x: "0%",
                opacity: 1,
              });
            }
          }
        }

        class Content {
          constructor(el, closeBtn, onClose) {
            this.el = el;
            this.closeBtn = closeBtn;
            this.items = [
              closeBtn,
              el.querySelector("[data-ds='c-number']"),
              el.querySelector("[data-ds='c-title']"),
              el.querySelector("[data-ds='c-subtitle']"),
              el.querySelector("[data-ds='c-text']"),
            ].filter(Boolean);
            this.onClose = onClose;
          }
          show() {
            this.el.dataset.state = "current";
            gsap.to(this.items, {
              duration: 0.8,
              ease: "power4.out",
              delay: 0.4,
              opacity: 1,
              startAt: { y: 40 },
              y: 0,
              stagger: 0.05,
            });
          }
          hide() {
            this.el.dataset.state = "idle";
            gsap.to([...this.items].reverse(), {
              duration: 0.3,
              ease: "power3.in",
              opacity: 0,
              y: 10,
              stagger: 0.01,
            });
          }
        }

        const deco = root.querySelector("[data-ds='deco']");
        const stage = root.querySelector("[data-ds='stage']");
        const closeBtn = root.querySelector("[data-ds='close']");
        const slideEls = Array.from(root.querySelectorAll("[data-ds='slide']"));
        const slideObjs = slideEls.map((el) => new Slide(el));
        const total = slideObjs.length;

        const show = {
          current: Math.min(Math.max(initialSlide, 0), total - 1),
          isAnimating: false,
          isContentOpen: false,
        };

        const contentEls = Array.from(
          root.querySelectorAll("[data-ds='content-item']"),
        );
        const contents = contentEls.map(
          (el) => new Content(el, closeBtn, hideContent),
        );

        let currentSlide;
        let nextSlide;
        let prevSlide;

        function render() {
          currentSlide = slideObjs[show.current];
          nextSlide =
            slideObjs[show.current + 1 <= total - 1 ? show.current + 1 : 0];
          prevSlide =
            slideObjs[show.current - 1 >= 0 ? show.current - 1 : total - 1];
          currentSlide.setCurrent();
          nextSlide.setRight();
          prevSlide.setLeft();
        }

        slideObjs.forEach((s) => s.hideTexts(false));
        render();
        currentSlide.showTexts(false);

        function bounceDeco(direction, delay) {
          gsap.to(deco, {
            duration: 0.4,
            ease: "power2.in",
            delay: delay + delay * 0.2,
            x: direction === "next" ? -decoBounce : decoBounce,
            y: direction === "next" ? -decoBounce : decoBounce,
            onComplete: () => {
              gsap.to(deco, {
                duration: 0.6,
                ease: "power2.out",
                x: 0,
                y: 0,
              });
            },
          });
        }

        function showContent() {
          if (!enableContent || show.isContentOpen || show.isAnimating) return;
          allowTilt = false;
          show.isContentOpen = true;
          stage.dataset.preview = "open";
          clearTimeout(currentSlide.mousetime);
          gsap.killTweensOf([currentSlide.imgWrap, currentSlide.textsWrap]);
          gsap.set(currentSlide.imgWrap, { rotationX: 0, rotationY: 0 });
          gsap.set(currentSlide.textsWrap, { x: 0, y: 0 });
          gsap.to(deco, {
            duration: navDuration,
            ease: navEase,
            scaleX: winsize.width / deco.offsetWidth,
            scaleY: winsize.height / deco.offsetHeight,
            x: decoOffsetX,
            y: decoOffsetY,
          });
          prevSlide.moveToPosition({ position: -2 });
          nextSlide.moveToPosition({ position: 2 });
          currentSlide.moveToPosition({ position: 3, resetImageScale: true });
          contents[show.current].show();
          currentSlide.hideTexts(true);
        }

        function hideContent() {
          if (!show.isContentOpen || show.isAnimating) return;
          stage.dataset.preview = "closed";
          contents[show.current].hide();
          gsap.to(deco, {
            duration: navDuration,
            ease: navEase,
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
          });
          prevSlide.moveToPosition({ position: -1 });
          nextSlide.moveToPosition({ position: 1 });
          currentSlide.moveToPosition({ position: 0 }).then(() => {
            allowTilt = enableTilt;
            show.isContentOpen = false;
          });
          currentSlide.showTexts();
        }

        function navigate(direction) {
          if (show.isAnimating || show.isContentOpen) return;
          if (!loop) {
            if (direction === "next" && show.current === total - 1) return;
            if (direction === "prev" && show.current === 0) return;
          }
          show.isAnimating = true;
          allowTilt = false;

          const upcomingPos =
            direction === "next"
              ? show.current < total - 2
                ? show.current + 2
                : Math.abs(total - 2 - show.current)
              : show.current >= 2
                ? show.current - 2
                : Math.abs(total - 2 + show.current);

          const upcomingSlide = slideObjs[upcomingPos];

          show.current =
            direction === "next"
              ? show.current < total - 1
                ? show.current + 1
                : 0
              : show.current > 0
                ? show.current - 1
                : total - 1;

          const movingPrev = prevSlide;
          const movingNext = nextSlide;
          const movingCurrent = currentSlide;

          movingPrev
            .moveToPosition({
              position: direction === "next" ? -2 : 0,
              delay: direction === "next" ? 0 : navStagger * 2,
            })
            .then(() => {
              if (direction === "next") movingPrev.hide();
            });

          movingCurrent.moveToPosition({
            position: direction === "next" ? -1 : 1,
            delay: navStagger,
          });
          movingCurrent.hideTexts();

          bounceDeco(direction, navStagger);

          movingNext
            .moveToPosition({
              position: direction === "next" ? 0 : 2,
              delay: direction === "next" ? navStagger * 2 : 0,
            })
            .then(() => {
              if (direction === "prev") movingNext.hide();
            });

          if (direction === "next") movingNext.showTexts();
          else movingPrev.showTexts();

          upcomingSlide
            .moveToPosition({
              position: direction === "next" ? 1 : -1,
              from: direction === "next" ? 2 : -2,
              delay: navStagger * 3,
            })
            .then(() => {
              [movingNext, movingCurrent, movingPrev].forEach((s) => s.reset());
              render();
              allowTilt = enableTilt;
              show.isAnimating = false;
            });
        }

        slideObjs.forEach((slide) => {
          const onClick = () => {
            if (slide.isRight) navigate("next");
            else if (slide.isLeft) navigate("prev");
            else showContent();
          };
          slide.imgWrap.addEventListener("click", onClick);
          cleanups.push(() =>
            slide.imgWrap.removeEventListener("click", onClick),
          );
        });

        if (closeBtn) {
          const onClose = () => hideContent();
          closeBtn.addEventListener("click", onClose);
          cleanups.push(() => closeBtn.removeEventListener("click", onClose));
        }

        root.querySelectorAll("[data-ds='nav']").forEach((btn) => {
          const dir = btn.dataset.dir;
          const onNav = () => navigate(dir);
          btn.addEventListener("click", onNav);
          cleanups.push(() => btn.removeEventListener("click", onNav));
        });

        const onResize = () => {
          calcWinsize();
          slideObjs.forEach((s) => {
            s.calcSizes();
            s.calcTransforms();
          });
          nextSlide.setRight(show.isContentOpen);
          prevSlide.setLeft(show.isContentOpen);
          currentSlide.setCurrent(show.isContentOpen);
          if (show.isContentOpen) {
            gsap.set(deco, {
              scaleX: winsize.width / deco.offsetWidth,
              scaleY: winsize.height / deco.offsetHeight,
              x: decoOffsetX,
              y: decoOffsetY,
            });
          }
        };
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        const onKey = (ev) => {
          if (ev.key === "ArrowRight" || ev.key === "ArrowDown")
            navigate("next");
          else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp")
            navigate("prev");
          else if (ev.key === "Escape") hideContent();
        };
        window.addEventListener("keydown", onKey);
        cleanups.push(() => window.removeEventListener("keydown", onKey));

        gsap.set(root, { autoAlpha: 1 });
      })
      .catch((e) =>
        console.error("[DiagonalSlideshow] GSAP load failed:", e.message),
      );

    return () => {
      disposed = true;
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
      cleanups.forEach((fn) => fn());
      if (window.gsap && root)
        window.gsap.killTweensOf(root.querySelectorAll("*"));
      root.querySelectorAll("[data-raw-text]").forEach((el) => {
        el.textContent = el.dataset.rawText;
      });
    };
  }, [
    slides,
    enableTilt,
    enableContent,
    offsetDivisor,
    exitRotation,
    tiltTranslate,
    tiltRotate,
    tiltCounterTexts,
    hoverScale,
    hoverScaleDuration,
    tiltDuration,
    tiltResetDuration,
    navDuration,
    navStagger,
    navEase,
    decoBounce,
    decoOffsetX,
    decoOffsetY,
    scrambleChars,
    scrambleMinDelay,
    scrambleMaxDelay,
    disassembleStep,
    loop,
    initialSlide,
    imageHeight,
    columnWidth,
    columnGap,
  ]);

  const scope = `ds-${uid}`;

  const css = `
.${scope} { font-family: ${fontFamily}; color: ${textColor}; background-color: ${bgColor}; }
.${scope} .ds-stage {
  display: grid;
  grid-template-rows: 100%;
  grid-template-columns: ${columnWidth}% ${columnWidth}% ${columnWidth}%;
  grid-column-gap: ${columnGap}%;
  grid-template-areas: '... slide ...';
  justify-content: center;
}
.${scope} .ds-slide { grid-area: slide; padding: ${slidePaddingTop}vh 0 ${slidePaddingBottom}vh; }
.${scope} .ds-deco {
  grid-area: slide;
  background: ${decoColor};
  height: ${imageHeight}%;
  align-self: center;
  margin: -40px 0 0 0;
  right: -20px;
}
.${scope} .ds-img-wrap { height: ${imageHeight}%; top: ${(100 - imageHeight) / 2}%; opacity: 0; pointer-events: none; }
.${scope} .ds-slide[data-state="current"] .ds-img-wrap,
.${scope} .ds-slide[data-state="visible"] .ds-img-wrap { pointer-events: auto; }
.${scope} .ds-slide[data-state="current"] { pointer-events: auto; }
.${scope} .ds-title-wrap, .${scope} .ds-side { opacity: 0; pointer-events: none; }
.${scope} .ds-title { font-size: ${slideTitleSize}; }
.${scope} .ds-side {
  color: ${sideColor};
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.${scope} .ds-letter { display: inline-block; opacity: 0; }
.${scope} .ds-stage[data-preview="open"] .ds-slide { cursor: default; }
.${scope} .ds-stage[data-preview="open"] .ds-nav { opacity: 0; transition-duration: 0.4s; }
.${scope} .ds-stage[data-preview="open"] .ds-nav--next { transform: translate3d(100%, 100%, 0); }
.${scope} .ds-stage[data-preview="open"] .ds-nav--prev { transform: translate3d(-100%, -100%, 0); }
.${scope} .ds-content-item { width: 100%; right: 0; padding: 10vh 5vw; overflow: auto; }
.${scope} .ds-content-item[data-state="current"] { pointer-events: auto; }
.${scope} .ds-content-item[data-state="current"] ~ .ds-close { pointer-events: auto; }
.${scope} .ds-c-title, .${scope} .ds-c-subtitle, .${scope} .ds-c-number,
.${scope} .ds-c-text, .${scope} .ds-close { opacity: 0; }
@media screen and (min-width: 53em) {
  .${scope} .ds-title-wrap, .${scope} .ds-side { margin-left: -1.85rem; }
  .${scope} .ds-content-item {
    width: ${contentWidth}%;
    right: ${contentRight}%;
    padding: calc(10vh + 5rem) 0 ${slidePaddingBottom}vh;
    overflow: visible;
  }
  .${scope} .ds-close { left: ${100 - contentWidth - contentRight - 0.5}%; top: calc(10vh + 1rem); }
  .${scope} .ds-c-number { position: absolute; bottom: ${slidePaddingBottom}vh; right: 0; font-size: 2rem; }
  .${scope} .ds-c-title { font-size: ${contentTitleSize}; }
  .${scope} .ds-c-text { column-count: ${contentColumns}; column-gap: 2rem; max-width: 600px; text-align: justify; }
}
@media (prefers-reduced-motion: reduce) {
  .${scope} .ds-nav { transition: none; }
}
`;

  const navArrow = (
    <svg viewBox="0 0 408 408" className="block w-6 h-6 fill-current">
      <polygon points="204 0 168.3 35.7 311.1 178.5 0 178.5 0 229.5 311.1 229.5 168.3 372.3 204 408 408 204" />
    </svg>
  );

  return (
    <div
      ref={rootRef}
      className={`${scope} relative w-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        data-ds="stage"
        data-preview="closed"
        className="ds-stage relative w-full h-full overflow-hidden"
      >
        <div data-ds="deco" className="ds-deco relative w-full" />

        {slides.map((slide, i) => (
          <div
            key={i}
            data-ds="slide"
            data-state="idle"
            className="ds-slide relative flex h-full w-full cursor-pointer flex-col justify-between pointer-events-none"
          >
            <div
              data-ds="img-wrap"
              className="ds-img-wrap absolute left-0 z-[100] w-full overflow-hidden"
            >
              <div
                data-ds="img"
                className="absolute left-0 top-0 h-full w-full bg-cover bg-center pointer-events-none scale-[1.01]"
                style={{ backgroundImage: `url(${slide.image})` }}
                role="img"
                aria-label={slide.title}
              />
            </div>

            {showSideLabel ? (
              <div
                data-ds="side"
                className="ds-side relative z-[1000] hidden md:block text-sm tracking-wide"
              >
                {slide.side}
              </div>
            ) : (
              <div data-ds="side" className="ds-side hidden" />
            )}

            <div
              data-ds="title-wrap"
              className="ds-title-wrap relative z-[1000] w-full self-end"
            >
              {showNumbers && (
                <span
                  data-ds="number"
                  className="block text-3xl font-bold before:mr-4 before:inline-block before:content-['—']"
                >
                  {i + 1}
                </span>
              )}
              <h3
                data-ds="title"
                className="ds-title hidden md:block m-0 mb-1 leading-none"
              >
                {slide.title}
              </h3>
              <h4 className="hidden md:block m-0 min-h-[50px] text-base font-normal">
                {slide.subtitle}
              </h4>
            </div>
          </div>
        ))}

        {showNav && (
          <>
            <button
              type="button"
              data-ds="nav"
              data-dir="prev"
              aria-label="Previous slide"
              className="ds-nav ds-nav--prev absolute left-4 top-4 z-[1000] m-0 flex h-12 w-12 items-center justify-center border-0 bg-transparent p-0 text-current transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(0.7,0,0.3,1)]"
            >
              <span className="block -rotate-[135deg]">{navArrow}</span>
            </button>
            <button
              type="button"
              data-ds="nav"
              data-dir="next"
              aria-label="Next slide"
              className="ds-nav ds-nav--next absolute bottom-4 right-4 z-[1000] m-0 flex h-12 w-12 items-center justify-center border-0 bg-transparent p-0 text-current transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(0.7,0,0.3,1)]"
            >
              <span className="block rotate-45">{navArrow}</span>
            </button>
          </>
        )}
      </div>

      {enableContent && (
        <div className="pointer-events-none absolute left-0 top-0 z-[100] h-full w-full">
          {slides.map((slide, i) => (
            <div
              key={i}
              data-ds="content-item"
              data-state="idle"
              className="ds-content-item pointer-events-none absolute top-0 h-full"
            >
              <span
                data-ds="c-number"
                className="ds-c-number font-bold before:mr-4 before:inline-block before:content-['—']"
              >
                {i + 1}
              </span>
              <h3
                data-ds="c-title"
                className="ds-c-title my-2 text-3xl leading-none"
              >
                {slide.title}
              </h3>
              <h4
                data-ds="c-subtitle"
                className="ds-c-subtitle mb-2 text-base font-normal md:mb-[7.5vh] md:text-lg"
              >
                {slide.subtitle}
              </h4>
              <div
                data-ds="c-text"
                className="ds-c-text text-sm leading-relaxed"
              >
                {slide.text}
              </div>
            </div>
          ))}
          <button
            type="button"
            data-ds="close"
            aria-label="Close details"
            className="ds-close pointer-events-none absolute left-4 top-4 m-0 border-0 bg-transparent p-0 text-current outline-none"
          >
            <svg viewBox="0 0 54 24" className="block w-8 fill-current">
              <path d="M.42 11.158L12.38.256c.333-.27.696-.322 1.09-.155.395.166.593.467.593.903v6.977h38.87c.29 0 .53.093.716.28.187.187.28.426.28.716v5.98c0 .29-.093.53-.28.716a.971.971 0 0 1-.716.28h-38.87v6.977c0 .416-.199.717-.592.903-.395.167-.759.104-1.09-.186L.42 12.62a1.018 1.018 0 0 1 0-1.462z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
