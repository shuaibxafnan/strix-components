"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1600&q=80",
    caption: "Layout nº001",
  },
  {
    img: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1600&q=80",
    caption: "Layout nº002",
  },
  {
    img: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
    caption: "Layout nº003",
  },
  {
    img: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1600&q=80",
    caption: "Layout nº004",
  },
];

export default function InfiniteSlider({
  slidesData = DEFAULT_SLIDES,
  speed = 1,
  backgroundColor = "#000000",
  textColor = "#f5f5f5",
  buttonTransition = "transition-all duration-[475ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
  className = "",
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    let cancelled = false;
    const cleanups = [];

    (async () => {
      const gsapModule = await import("gsap");
      const draggableModule = await import("gsap/Draggable");
      const inertiaModule = await import("gsap/InertiaPlugin");
      if (cancelled || !containerRef.current) return;

      const gsap = gsapModule.gsap || gsapModule.default;
      const Draggable = draggableModule.Draggable || draggableModule.default;
      const InertiaPlugin =
        inertiaModule.InertiaPlugin || inertiaModule.default;
      gsap.registerPlugin(Draggable, InertiaPlugin);

      {
        const context = containerRef.current;
        const slides = gsap.utils.toArray(
          context.querySelectorAll('[data-slider="slide"]'),
        );
        const nextButton = context.querySelector('[data-slider="button-next"]');
        const prevButton = context.querySelector('[data-slider="button-prev"]');
        const totalElement = context.querySelector(
          '[data-slide-count="total"]',
        );
        const stepElement = context.querySelector('[data-slide-count="step"]');
        const stepsParent = stepElement.parentElement;

        let activeElement;
        const totalSlides = slides.length;

        totalElement.textContent =
          totalSlides < 10 ? `0${totalSlides}` : totalSlides;

        stepsParent.innerHTML = "";
        slides.forEach((_, index) => {
          const stepClone = stepElement.cloneNode(true);
          stepClone.textContent = index + 1 < 10 ? `0${index + 1}` : index + 1;
          stepsParent.appendChild(stepClone);
        });

        const allSteps = stepsParent.querySelectorAll(
          '[data-slide-count="step"]',
        );

        function horizontalLoop(items, config) {
          let timeline;
          items = gsap.utils.toArray(items);
          config = config || {};

          gsap.context(() => {
            let onChange = config.onChange,
              lastIndex = 0,
              tl = gsap.timeline({
                repeat: config.repeat,
                onUpdate:
                  onChange &&
                  function () {
                    let i = tl.closestIndex();
                    if (lastIndex !== i) {
                      lastIndex = i;
                      onChange(items[i], i);
                    }
                  },
                paused: config.paused,
                defaults: { ease: "none" },
                onReverseComplete: () =>
                  tl.totalTime(tl.rawTime() + tl.duration() * 100),
              }),
              length = items.length,
              startX = items[0].offsetLeft,
              times = [],
              widths = [],
              spaceBefore = [],
              xPercents = [],
              curIndex = 0,
              indexIsDirty = false,
              center = config.center,
              pixelsPerSecond = (config.speed || 1) * 100,
              snap =
                config.snap === false
                  ? (v) => v
                  : gsap.utils.snap(config.snap || 1),
              timeOffset = 0,
              container =
                center === true
                  ? items[0].parentNode
                  : gsap.utils.toArray(center)[0] || items[0].parentNode,
              totalWidth,
              getTotalWidth = () =>
                items[length - 1].offsetLeft +
                (xPercents[length - 1] / 100) * widths[length - 1] -
                startX +
                spaceBefore[0] +
                items[length - 1].offsetWidth *
                gsap.getProperty(items[length - 1], "scaleX") +
                (parseFloat(config.paddingRight) || 0),
              populateWidths = () => {
                let b1 = container.getBoundingClientRect(),
                  b2;
                items.forEach((el, i) => {
                  widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
                  xPercents[i] = snap(
                    (parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) *
                    100 +
                    gsap.getProperty(el, "xPercent"),
                  );
                  b2 = el.getBoundingClientRect();
                  spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
                  b1 = b2;
                });
                gsap.set(items, { xPercent: (i) => xPercents[i] });
                totalWidth = getTotalWidth();
              },
              timeWrap,
              populateOffsets = () => {
                timeOffset = center
                  ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
                  : 0;
                center &&
                  times.forEach((t, i) => {
                    times[i] = timeWrap(
                      tl.labels["label" + i] +
                      (tl.duration() * widths[i]) / 2 / totalWidth -
                      timeOffset,
                    );
                  });
              },
              getClosest = (values, value, wrap) => {
                let i = values.length,
                  closest = 1e10,
                  index = 0,
                  d;
                while (i--) {
                  d = Math.abs(values[i] - value);
                  if (d > wrap / 2) d = wrap - d;
                  if (d < closest) {
                    closest = d;
                    index = i;
                  }
                }
                return index;
              },
              populateTimeline = () => {
                let i, item, curX, distanceToStart, distanceToLoop;
                tl.clear();
                for (i = 0; i < length; i++) {
                  item = items[i];
                  curX = (xPercents[i] / 100) * widths[i];
                  distanceToStart =
                    item.offsetLeft + curX - startX + spaceBefore[0];
                  distanceToLoop =
                    distanceToStart +
                    widths[i] * gsap.getProperty(item, "scaleX");
                  tl.to(
                    item,
                    {
                      xPercent: snap(
                        ((curX - distanceToLoop) / widths[i]) * 100,
                      ),
                      duration: distanceToLoop / pixelsPerSecond,
                    },
                    0,
                  )
                    .fromTo(
                      item,
                      {
                        xPercent: snap(
                          ((curX - distanceToLoop + totalWidth) / widths[i]) *
                          100,
                        ),
                      },
                      {
                        xPercent: xPercents[i],
                        duration:
                          (curX - distanceToLoop + totalWidth - curX) /
                          pixelsPerSecond,
                        immediateRender: false,
                      },
                      distanceToLoop / pixelsPerSecond,
                    )
                    .add("label" + i, distanceToStart / pixelsPerSecond);
                  times[i] = distanceToStart / pixelsPerSecond;
                }
                timeWrap = gsap.utils.wrap(0, tl.duration());
              },
              refresh = (deep) => {
                let progress = tl.progress();
                tl.progress(0, true);
                populateWidths();
                deep && populateTimeline();
                populateOffsets();
                deep && tl.draggable
                  ? tl.time(times[curIndex], true)
                  : tl.progress(progress, true);
              },
              onResize = () => refresh(true),
              proxy;

            gsap.set(items, { x: 0 });
            populateWidths();
            populateTimeline();
            populateOffsets();
            window.addEventListener("resize", onResize);
            cleanups.push(() => window.removeEventListener("resize", onResize));

            function toIndex(index, vars) {
              vars = vars || {};
              Math.abs(index - curIndex) > length / 2 &&
                (index += index > curIndex ? -length : length);
              let newIndex = gsap.utils.wrap(0, length, index),
                time = times[newIndex];
              if (time > tl.time() !== index > curIndex && index !== curIndex) {
                time += tl.duration() * (index > curIndex ? 1 : -1);
              }
              if (time < 0 || time > tl.duration()) {
                vars.modifiers = { time: timeWrap };
              }
              curIndex = newIndex;
              vars.overwrite = true;
              gsap.killTweensOf(proxy);
              return vars.duration === 0
                ? tl.time(timeWrap(time))
                : tl.tweenTo(time, vars);
            }

            tl.toIndex = (index, vars) => toIndex(index, vars);
            tl.closestIndex = (setCurrent) => {
              let index = getClosest(times, tl.time(), tl.duration());
              if (setCurrent) {
                curIndex = index;
                indexIsDirty = false;
              }
              return index;
            };
            tl.current = () =>
              indexIsDirty ? tl.closestIndex(true) : curIndex;
            tl.next = (vars) => toIndex(tl.current() + 1, vars);
            tl.previous = (vars) => toIndex(tl.current() - 1, vars);
            tl.times = times;
            tl.progress(1, true).progress(0, true);

            if (config.reversed) {
              tl.vars.onReverseComplete();
              tl.reverse();
            }

            if (config.draggable && typeof Draggable === "function") {
              proxy = document.createElement("div");
              let wrap = gsap.utils.wrap(0, 1),
                ratio,
                startProgress,
                draggable,
                lastSnap,
                initChangeX,
                wasPlaying,
                align = () =>
                  tl.progress(
                    wrap(
                      startProgress + (draggable.startX - draggable.x) * ratio,
                    ),
                  ),
                syncIndex = () => tl.closestIndex(true);

              draggable = Draggable.create(proxy, {
                trigger: items[0].parentNode,
                type: "x",
                onPressInit() {
                  let x = this.x;
                  gsap.killTweensOf(tl);
                  wasPlaying = !tl.paused();
                  tl.pause();
                  startProgress = tl.progress();
                  refresh();
                  ratio = 1 / totalWidth;
                  initChangeX = startProgress / -ratio - x;
                  gsap.set(proxy, { x: startProgress / -ratio });
                },
                onDrag: align,
                onThrowUpdate: align,
                overshootTolerance: 0,
                inertia: true,
                snap(value) {
                  if (Math.abs(startProgress / -ratio - this.x) < 10) {
                    return lastSnap + initChangeX;
                  }
                  let time = -(value * ratio) * tl.duration(),
                    wrappedTime = timeWrap(time),
                    snapTime =
                      times[getClosest(times, wrappedTime, tl.duration())],
                    dif = snapTime - wrappedTime;
                  Math.abs(dif) > tl.duration() / 2 &&
                    (dif += dif < 0 ? tl.duration() : -tl.duration());
                  lastSnap = (time + dif) / tl.duration() / -ratio;
                  return lastSnap;
                },
                onRelease() {
                  syncIndex();
                  draggable.isThrowing && (indexIsDirty = true);
                },
                onThrowComplete: () => {
                  syncIndex();
                  wasPlaying && tl.play();
                },
              })[0];
              tl.draggable = draggable;
              cleanups.push(() => draggable.kill());
            }

            tl.closestIndex(true);
            lastIndex = curIndex;
            onChange && onChange(items[curIndex], curIndex);

            timeline = tl;
            cleanups.push(() => tl.kill());
          });

          return timeline;
        }

        const loop = horizontalLoop(slides, {
          paused: true,
          draggable: true,
          center: false,
          speed: speed,
          onChange: (element, index) => {
            if (activeElement) activeElement.classList.remove("active");
            const nextSibling = element.nextElementSibling || slides[0];
            nextSibling.classList.add("active");
            activeElement = nextSibling;

            gsap.to(allSteps, {
              y: `${-100 * index}%`,
              ease: "power3.out",
              duration: 0.45,
            });
          },
        });

        const onNext = () =>
          loop.next({ ease: "power3.out", duration: 0.725 });
        const onPrev = () =>
          loop.previous({ ease: "power3.out", duration: 0.725 });

        slides.forEach((slide, i) => {
          const onSlide = () =>
            loop.toIndex(i - 1, { ease: "power3.out", duration: 0.725 });
          slide.addEventListener("click", onSlide);
          cleanups.push(() => slide.removeEventListener("click", onSlide));
        });

        nextButton.addEventListener("click", onNext);
        prevButton.addEventListener("click", onPrev);
        cleanups.push(() => {
          nextButton.removeEventListener("click", onNext);
          prevButton.removeEventListener("click", onPrev);
          gsap.killTweensOf(allSteps);
        });
      }
    })().catch((err) => console.error("[InfiniteSlider] Loop Error:", err));

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [mounted, speed]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-screen select-none overflow-hidden text-[max(1.1vw,9px)] ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <style>{`
       @font-face {
          font-family: "Archivo Black";
          font-weight: 700;
          font-style: normal;
          font-display: swap;
          src: url("https://fonts.gstatic.com/s/archivoblack/v22/HTxqL2I-JCGChYJ8VI-L6OO_au7B43r3.ttf")
            format("truetype");
        }
        .button-overlay {
          transition: transform 0.475s cubic-bezier(0.25, 1, 0.5, 1);
        }
        button:hover .button-overlay {
          transform: scale(1.4);
        }
      `}</style>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end w-full pb-[2em] pl-[2em] bg-gradient-to-t md:inset-y-0 md:right-auto md:items-center md:pb-0 md:w-[37.5em] md:bg-gradient-to-r from-neutral-900 via-neutral-900/85 to-transparent pointer-events-none">
        <div className="flex flex-col justify-between gap-[1.5em] md:gap-0 md:h-[28.125em] pointer-events-auto">
              <div
            className="flex flex-row items-center font-bold text-[5.625em] leading-none tracking-tight gap-[0.2em]"
            style={{ fontFamily: "'PP Neue Corp', 'Impact', sans-serif" }}
          >
            <div className="h-[1em] overflow-hidden">
              <h2
                data-slide-count="step"
                className="w-[2ch] m-0 text-current line-clamp-1"
              >
                01
              </h2>
            </div>
            <div className="w-[2px] h-[0.75em] rotate-[15deg]"
              style={{ backgroundColor: textColor }}></div>
            <div className="h-[1em] overflow-hidden">
              <h2 data-slide-count="total" className="w-[2ch] m-0 text-current">
                04
              </h2>
            </div>
          </div>

              <div className="flex gap-[2em] group">
                  <button
              aria-label="previous slide"
              data-slider="button-prev"
              className={`relative flex items-center justify-center w-[4em] h-[4em] p-0 bg-transparent border border-white/20 rounded-[0.4em] outline-none scale-100 opacity-100 hover:z-20 hover:scale-[0.85] hover:!opacity-100 group-hover:opacity-40 ${buttonTransition}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 17 12"
                fill="none"
                className="w-[1em] h-[0.75em] shrink-0"
              >
                <path
                  d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div
                className={`absolute -inset-[1px] z-10 pointer-events-none scale-100 button-overlay group-hover:scale-100 button:hover:scale-140 ${buttonTransition}`}
              >
                <div className="w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em]"></div>
                <div className="absolute top-0 right-0 w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em] rotate-90"></div>
                <div className="absolute bottom-0 left-0 w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em] -rotate-90"></div>
                <div className="absolute bottom-0 right-0 w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em] rotate-180"></div>
              </div>
            </button>

                  <button
              aria-label="next slide"
              data-slider="button-next"
              className={`relative flex items-center justify-center w-[4em] h-[4em] p-0 bg-transparent border border-white/20 rounded-[0.4em] outline-none scale-100 opacity-100 hover:z-20 hover:scale-[0.85] hover:!opacity-100 group-hover:opacity-40 ${buttonTransition}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 17 12"
                fill="none"
                className="w-[1em] h-[0.75em] shrink-0 rotate-180"
              >
                <path
                  d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div
                className={`absolute -inset-[1px] z-10 pointer-events-none scale-100 button-overlay group-hover:scale-100 button:hover:scale-140 ${buttonTransition}`}
              >
                <div className="w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em]"></div>
                <div className="absolute top-0 right-0 w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em] rotate-90"></div>
                <div className="absolute bottom-0 left-0 w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em] -rotate-90"></div>
                <div className="absolute bottom-0 right-0 w-[1em] h-[1em] border-t border-l border-white rounded-tl-[0.4em] rotate-180"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <div className="flex items-center w-full h-full">
          <div
            data-slider="list"
            className="relative flex flex-flow-row items-stretch cursor-grab active:cursor-grabbing"
          >
            {slidesData.map((slide, idx) => (
              <div
                key={idx}
                data-slider="slide"
                className="relative shrink-0 w-[42.5em] h-[28em] px-[1.25em] transition-opacity duration-400 opacity-20 [&.active]:opacity-100 group/slide"
              >
                <div className="relative w-full h-full overflow-hidden rounded-[0.5em]">
                  <img
                    src={slide.img}
                    loading="lazy"
                    alt={slide.caption}
                    className="object-cover w-full h-full"
                  />

                              <div className="absolute z-10 top-[1.25em] left-[1.25em] flex items-center whitespace-nowrap bg-neutral-100 text-neutral-900 rounded-[0.25em] px-[0.75em] py-[0.4em] gap-[0.4em] overflow-hidden transition-all duration-[525ms] ease-[cubic-bezier(0.25,1,0.5,1)] opacity-0 -translate-x-1/4 group-[.active]/slide:opacity-100 group-[.active]/slide:translate-x-0 group-[.active]/slide:delay-300">
                    <div className="w-[0.5em] h-[0.5em] bg-neutral-900 rounded-full shrink-0"></div>
                    <p className="m-0 text-[0.75em] font-sans leading-none">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
