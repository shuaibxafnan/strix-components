"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    titleTop: "Queen of",
    titleBottom: "the Sea",
    meta: "Osaka, 1986",
    text: "Hidesato felt very sorry for the Dragon King on hearing his story, and readily promised to do what he could to help him.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    titleTop: "Hinata's",
    titleBottom: "Trouble",
    meta: "Kyoto, 1986",
    text: "His power was immense, for he was the ruler of all sea creatures both great and small, and in his keeping were the Jewels of the Ebb and Flow of the Tide.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    titleTop: "Dragon's",
    titleBottom: "Journey",
    meta: "Nagoya, 1986",
    text: "Calling all his fish retainers together, he chose several of them as ambassadors to go through the sea and seek for a young Dragon Princess who would be his bride.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    titleTop: "Prince",
    titleBottom: "Yamato",
    meta: "Tokyo, 1986",
    text: "The King fell in love with her at once, and the wedding ceremony was celebrated with great splendor.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    titleTop: "Kumaso",
    titleBottom: "& Haru",
    meta: "Sapporo, 1986",
    text: "When the hare heard these kind words he felt very grateful to the man, and encouraged by his gentle manner the hare told him all that had befallen him.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    titleTop: "Botan's",
    titleBottom: "Dream",
    meta: "Sendai, 1986",
    text: "Okuni-nushi-no-Mikoto is worshiped by the people in some parts of the country as a god, and the hare has become famous in the old tales.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    titleTop: "The Gate",
    titleBottom: "of Rashoi",
    meta: "Kyoto, 1986",
    text: "Nearly two thousand years ago this sword was kept at the shrines of Ite, the temples dedicated to the worship of the great and beautiful Sun Goddess.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    titleTop: "Faithful",
    titleBottom: "Knights",
    meta: "Kobe, 1986",
    text: "At last King Keiko ordered his younger son Prince Yamato to subdue the brigands and, if possible, to rid the land of their evil lives.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    titleTop: "Five Colors",
    titleBottom: "for Jokwa",
    meta: "Hiroshima, 1986",
    text: "There is a story of knightly adventure and daring which explains why the name of the sword was changed to one that means grass clearing.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    titleTop: "Shikuyu's",
    titleBottom: "Charm",
    meta: "Kumamoto, 1986",
    text: "He at once made ready to start, and great was the stir in the precincts of the Palace as he and his trusty followers gathered together and prepared for the expedition.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    titleTop: "Winter",
    titleBottom: "Passage",
    meta: "Nara, 1986",
    text: "The road wound upward through the pines until the valley below was nothing more than a pale ribbon of mist beneath the travelers.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    titleTop: "The Long",
    titleBottom: "Harbour",
    meta: "Fukuoka, 1986",
    text: "Every evening the fishermen returned with the tide, and the lanterns along the quay were lit one by one until the water itself seemed to burn.",
  },
];

const NAV_ARROW = "M49.894 2.766v262.979";
const NAV_ARROW_HEAD =
  "M99.75 76.596C73.902 76.596 52.62 43.07 49.895 0 47.168 43.07 25.886 76.596.036 76.596";

const ITEM_BASE =
  "scr-item w-full bg-cover bg-center bg-no-repeat cursor-pointer transition-opacity duration-300 [will-change:width,height,transform,opacity]";
const ITEM_CLOSED =
  "h-[var(--scr-item-height)] opacity-[var(--scr-item-opacity)] hover:opacity-[var(--scr-item-opacity-hover)]";
const ITEM_OPEN =
  "h-[var(--scr-slide-height)] opacity-[var(--scr-slide-opacity)] pointer-events-none";
const ITEM_OPEN_CURRENT =
  "min-[53em]:!opacity-100 !opacity-[calc(var(--scr-slide-opacity)+0.1)]";

const STACK_BASE = "grid place-items-center min-w-[300px]";
const STACK_CLOSED =
  "mx-auto w-[var(--scr-stack-width)] gap-[var(--scr-stack-gap)]";
const STACK_OPEN =
  "w-full ml-auto mr-[var(--scr-slide-gap)] gap-[var(--scr-slide-gap)]";

const CONTENT_ITEM_BASE =
  "scr-content-item row-start-3 col-start-1 min-[53em]:row-start-2 min-[53em]:self-end min-[53em]:text-left";
const CONTENT_ITEM_IDLE =
  "absolute h-0 opacity-0 pointer-events-none overflow-hidden";
const CONTENT_ITEM_CURRENT =
  "relative h-auto opacity-100 pointer-events-auto overflow-visible flex flex-col justify-center items-start";

const OH = "relative overflow-hidden";
const OH_INNER = "inline-block [will-change:transform]";

export default function StackContentReveal({
  items = DEFAULT_ITEMS,
  bgColor = "#000",
  textColor = "#fff",
  mutedColor = "#787878",
  accentColor = "#c87e4f",
  mainTitle = "Photography",
  mainSubtitle = "1986 — 2022",
  backLabel = "Back",
  fontUrl = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Inter:wght@300;400;500&display=swap",
  displayFont = "'Bodoni Moda', Didot, 'Times New Roman', serif",
  bodyFont = "'Inter', ui-sans-serif, system-ui, sans-serif",
  descenderPad = "0.16em",
  stackWidth = "38vw",
  stackItemHeight = "8vh",
  stackMargin = "50vh",
  stackMarginMobile = "10rem",
  slideHeight = "50vh",
  slideGap = "2.4vh",
  stackGap = "1.1vh",
  pagePadding = "2.5rem",
  itemOpacity = 0.2,
  itemOpacityHover = 0.5,
  slideOpacity = 0.5,
  duration = 1,
  ease = "expo",
  scrollToClose = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const stackRef = useRef(null);
  const stackWrapRef = useRef(null);
  const slidesRef = useRef(null);
  const contentRef = useRef(null);
  const backRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!fontUrl) return;
    if (document.querySelector('link[data-id="' + fontUrl + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-id", fontUrl);
    document.head.appendChild(link);
  }, [fontUrl]);

  useEffect(() => {
    let killed = false;
    const cleanups = [];

    const swap = (el, off, on) => {
      el.classList.remove.apply(el.classList, off.split(" ").filter(Boolean));
      el.classList.add.apply(el.classList, on.split(" ").filter(Boolean));
    };

    (async () => {
        const [{ gsap }, { Flip }, { Observer }] = await Promise.all([
          import("gsap"),
          import("gsap/Flip"),
          import("gsap/Observer"),
        ]);
        if (killed || !rootRef.current) return;

        gsap.registerPlugin(Flip, Observer);

        const stackEl = stackRef.current;
        const stackItems = Array.prototype.slice.call(
          stackEl.querySelectorAll(".scr-item"),
        );
        const contentItems = Array.prototype.slice.call(
          contentRef.current.querySelectorAll(".scr-content-item"),
        );
        const contentTexts = contentItems.map((el) =>
          Array.prototype.slice.call(el.querySelectorAll(".scr-oh-inner")),
        );
        const mainTitleTexts = Array.prototype.slice.call(
          titleRef.current.querySelectorAll(".scr-oh-inner"),
        );

        const total = stackItems.length;
        let winsize = { width: window.innerWidth, height: window.innerHeight };
        let current = -1;
        let isOpen = false;
        let isAnimating = false;

        const onResize = () => {
          winsize = { width: window.innerWidth, height: window.innerHeight };
        };
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        const close = () => {
          if (isAnimating || !isOpen) return;
          isAnimating = true;
          const closing = current;

          scrollObserver.disable();
          document.body.style.overflow = "";

          const state = Flip.getState(stackItems, { props: "opacity" });

          stackWrapRef.current.appendChild(stackEl);
          swap(stackEl, STACK_OPEN, STACK_CLOSED);
          stackItems.forEach((it, i) => {
            swap(
              it,
              ITEM_OPEN + " " + (i === closing ? ITEM_OPEN_CURRENT : ""),
              ITEM_CLOSED,
            );
          });
          gsap.set(stackEl, { y: 0 });

          Flip.from(state, {
            duration: duration,
            ease: ease,
            absoluteOnLeave: true,
            onComplete: () => {
              swap(
                contentItems[closing],
                CONTENT_ITEM_CURRENT,
                CONTENT_ITEM_IDLE,
              );
              current = -1;
              isOpen = false;
              isAnimating = false;
            },
          })
            .to(
              mainTitleTexts,
              {
                duration: duration * 0.9,
                ease: ease,
                startAt: { yPercent: 101 },
                yPercent: 0,
              },
              0,
            )
            .to(
              contentTexts[closing],
              { duration: duration, ease: ease, yPercent: -101 },
              0,
            )
            .to(
              backRef.current,
              { duration: duration, ease: ease, opacity: 0 },
              0,
            )
            .to(
              [prevRef.current, nextRef.current],
              {
                duration: duration,
                ease: ease,
                y: (pos) => (pos ? 100 : -100),
                opacity: 0,
              },
              0,
            )
            .set([backRef.current, prevRef.current, nextRef.current], {
              pointerEvents: "none",
            });
        };

        const scrollFn = () => {
          if (isOpen && !isAnimating) {
            close();
            scrollObserver.disable();
          }
        };

        const scrollObserver = Observer.create({
          type: "wheel,touch,pointer",
          wheelSpeed: -1,
          onDown: scrollToClose ? scrollFn : () => {},
          onUp: scrollToClose ? scrollFn : () => {},
          tolerance: 10,
          preventDefault: true,
        });
        scrollObserver.disable();
        cleanups.push(() => scrollObserver.kill());

        const open = (stackItem) => {
          if (isAnimating || isOpen) return;
          isAnimating = true;

          current = stackItems.indexOf(stackItem);
          const idx = current;
          scrollObserver.enable();

          const scrollY = window.scrollY;
          document.body.style.overflow = "hidden";
          swap(contentItems[idx], CONTENT_ITEM_IDLE, CONTENT_ITEM_CURRENT);
          gsap.set([backRef.current, prevRef.current, nextRef.current], {
            pointerEvents: "auto",
          });

          const state = Flip.getState(stackItems, { props: "opacity" });

          slidesRef.current.appendChild(stackEl);
          swap(stackEl, STACK_CLOSED, STACK_OPEN);
          stackItems.forEach((it, i) => {
            swap(
              it,
              ITEM_CLOSED,
              ITEM_OPEN + " " + (i === idx ? ITEM_OPEN_CURRENT : ""),
            );
          });

          const itemCenter = stackItem.offsetTop + stackItem.offsetHeight / 2;

          document.documentElement.scrollTop = document.body.scrollTop = 0;
          gsap.set(stackEl, { y: winsize.height / 2 - itemCenter + scrollY });
          document.documentElement.scrollTop = document.body.scrollTop = 0;

          Flip.from(state, {
            duration: duration,
            ease: ease,
            absoluteOnLeave: true,
            onStart: () => {
              document.documentElement.scrollTop = document.body.scrollTop =
                scrollY;
            },
            onComplete: () => {
              isOpen = true;
              isAnimating = false;
            },
          })
            .to(
              mainTitleTexts,
              { duration: duration * 0.9, ease: ease, yPercent: -101 },
              0,
            )
            .to(
              contentTexts[idx],
              {
                duration: duration,
                ease: ease,
                startAt: { yPercent: 101 },
                yPercent: 0,
              },
              0,
            )
            .to(
              backRef.current,
              {
                duration: duration,
                ease: ease,
                startAt: { opacity: 0 },
                opacity: 1,
              },
              0,
            )
            .to(
              [prevRef.current, nextRef.current],
              {
                duration: duration,
                ease: ease,
                startAt: { opacity: 0, y: (pos) => (pos ? -150 : 150) },
                y: 0,
                opacity: (pos) =>
                  (idx === 0 && !pos) || (idx === total - 1 && pos) ? 0 : 1,
              },
              0,
            );
        };

        const navigate = (direction) => {
          if (
            isAnimating ||
            (direction === "next" && current === total - 1) ||
            (direction === "prev" && current === 0)
          )
            return;
          isAnimating = true;

          const previous = current;
          current = direction === "next" ? current + 1 : current - 1;
          const upcoming = current;

          stackItems[previous].classList.remove.apply(
            stackItems[previous].classList,
            ITEM_OPEN_CURRENT.split(" "),
          );
          stackItems[upcoming].classList.add.apply(
            stackItems[upcoming].classList,
            ITEM_OPEN_CURRENT.split(" "),
          );

          gsap.set(prevRef.current, { opacity: upcoming > 0 ? 1 : 0 });
          gsap.set(nextRef.current, { opacity: upcoming < total - 1 ? 1 : 0 });

          gsap
            .timeline()
            .to(stackEl, {
              duration: duration,
              ease: ease,
              y:
                direction === "next"
                  ? "-=" + (winsize.height / 2 + winsize.height * 0.02)
                  : "+=" + (winsize.height / 2 + winsize.height * 0.02),
              onComplete: () => {
                isAnimating = false;
              },
            })
            .to(
              contentTexts[previous],
              {
                duration: 0.2,
                ease: "power1",
                yPercent: direction === "next" ? 101 : -101,
                onComplete: () =>
                  swap(
                    contentItems[previous],
                    CONTENT_ITEM_CURRENT,
                    CONTENT_ITEM_IDLE,
                  ),
              },
              0,
            )
            .to(
              contentTexts[upcoming],
              {
                duration: duration * 0.9,
                ease: ease,
                startAt: { yPercent: direction === "next" ? -101 : 101 },
                onStart: () =>
                  swap(
                    contentItems[upcoming],
                    CONTENT_ITEM_IDLE,
                    CONTENT_ITEM_CURRENT,
                  ),
                yPercent: 0,
              },
              0.2,
            );
        };

        stackItems.forEach((item) => {
          const handler = () => open(item);
          item.addEventListener("click", handler);
          cleanups.push(() => item.removeEventListener("click", handler));
        });

        const onBack = () => close();
        const onNext = () => navigate("next");
        const onPrev = () => navigate("prev");
        backRef.current.addEventListener("click", onBack);
        nextRef.current.addEventListener("click", onNext);
        prevRef.current.addEventListener("click", onPrev);
        cleanups.push(() => {
          if (backRef.current)
            backRef.current.removeEventListener("click", onBack);
          if (nextRef.current)
            nextRef.current.removeEventListener("click", onNext);
          if (prevRef.current)
            prevRef.current.removeEventListener("click", onPrev);
          document.body.style.overflow = "";
        });
    })();

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [items, duration, ease, scrollToClose]);

  return (
    <div
      ref={rootRef}
      className={"relative w-full antialiased " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        "--scr-display": displayFont,
        "--scr-body": bodyFont,
        "--scr-muted": mutedColor,
        "--scr-accent": accentColor,
        "--scr-text": textColor,
        "--scr-pad": pagePadding,
        "--scr-stack-width": stackWidth,
        "--scr-item-height": stackItemHeight,
        "--scr-spacer": stackMarginMobile,
        "--scr-spacer-lg": stackMargin,
        "--scr-slide-height": slideHeight,
        "--scr-slide-gap": slideGap,
        "--scr-stack-gap": stackGap,
        "--scr-item-opacity": itemOpacity,
        "--scr-item-opacity-hover": itemOpacityHover,
        "--scr-slide-opacity": slideOpacity,
        "--scr-desc": descenderPad,
      }}
    >
      <div
        ref={contentRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] grid h-screen w-full grid-cols-1 grid-rows-[auto_auto_1fr_auto] gap-[var(--scr-slide-gap)] p-[var(--scr-pad)] min-[53em]:grid-cols-[1fr_50vw] min-[53em]:grid-rows-[auto_1fr_10vh] min-[53em]:gap-x-[var(--scr-pad)] min-[53em]:pr-[var(--scr-slide-gap)]"
      >
        {items.map((item, i) => (
          <div className={CONTENT_ITEM_BASE + " " + CONTENT_ITEM_IDLE} key={i}>
            <h2 className="m-0 mb-7 inline-flex flex-col text-[clamp(2.25rem,7.4vw,7.5rem)] font-normal leading-[0.92] tracking-[-0.015em] text-[var(--scr-accent)] [font-family:var(--scr-display)]">
              <span
                className={
                  OH +
                  " block whitespace-nowrap -mb-[var(--scr-desc)] min-[53em]:pr-8"
                }
              >
                <span
                  className={
                    OH_INNER +
                    " scr-oh-inner block pb-[var(--scr-desc)] leading-[0.92]"
                  }
                >
                  {item.titleTop}
                </span>
              </span>
              <span
                className={
                  OH +
                  " block whitespace-nowrap -mb-[var(--scr-desc)] -mt-[0.06em] min-[53em]:ml-auto"
                }
              >
                <span
                  className={
                    OH_INNER +
                    " scr-oh-inner block pb-[var(--scr-desc)] leading-[0.92]"
                  }
                >
                  {item.titleBottom}
                </span>
              </span>
            </h2>
            <div className="max-w-[34ch] text-[clamp(0.875rem,1.05vw,1.0625rem)] font-light leading-[1.55]">
              <p
                className={OH + " m-0 mb-3 -mb-[calc(var(--scr-desc)-0.75rem)]"}
              >
                <strong
                  className={
                    OH_INNER +
                    " scr-oh-inner block pb-[var(--scr-desc)] text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[var(--scr-muted)]"
                  }
                >
                  {item.meta}
                </strong>
              </p>
              <p className={OH + " m-0 -mb-[var(--scr-desc)]"}>
                <span
                  className={
                    OH_INNER + " scr-oh-inner block pb-[var(--scr-desc)]"
                  }
                >
                  {item.text}
                </span>
              </p>
            </div>
          </div>
        ))}

        <button
          ref={backRef}
          type="button"
          className="pointer-events-none col-start-1 row-start-2 flex cursor-pointer items-center border-0 bg-transparent p-0 text-[0.75rem] uppercase tracking-[0.18em] text-inherit opacity-0 outline-none min-[53em]:row-start-1 min-[53em]:justify-self-end"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-2"
          >
            <path d="M11.4939 20.5644C11.1821 20.8372 10.7083 20.8056 10.4356 20.4939L3.43557 12.4939C3.18814 12.2111 3.18814 11.7889 3.43557 11.5061L10.4356 3.50613C10.7083 3.1944 11.1822 3.16281 11.4939 3.43557C11.8056 3.70834 11.8372 4.18216 11.5644 4.49388L5.65283 11.25L20 11.25C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75L5.65283 12.75L11.5644 19.5061C11.8372 19.8179 11.8056 20.2917 11.4939 20.5644Z" />
          </svg>
          <span>{backLabel}</span>
        </button>

        <nav className="col-start-1 row-start-1 row-span-4 flex flex-col justify-between min-[53em]:col-start-2 min-[53em]:row-start-1 min-[53em]:row-span-3">
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous"
            className="group pointer-events-none z-[100] h-[calc((100vh_-_var(--scr-slide-height)_-_var(--scr-slide-gap)_*_4)_/_3)] flex-none cursor-pointer self-center border-0 bg-transparent p-0 opacity-0 outline-none"
          >
            <svg
              width="100"
              height="267"
              viewBox="0 0 100 267"
              className="h-full w-auto opacity-50 transition-opacity duration-300 [stroke-width:3px] [stroke:var(--scr-text)] group-hover:opacity-100"
            >
              <path d={NAV_ARROW} strokeLinecap="square" />
              <path fill="none" d={NAV_ARROW_HEAD} />
            </svg>
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next"
            className="group pointer-events-none z-[100] h-[calc((100vh_-_var(--scr-slide-height)_-_var(--scr-slide-gap)_*_4)_/_3)] flex-none cursor-pointer self-center border-0 bg-transparent p-0 opacity-0 outline-none"
          >
            <svg
              width="100"
              height="267"
              viewBox="0 0 100 267"
              className="h-full w-auto scale-[-1] opacity-50 transition-opacity duration-300 [stroke-width:3px] [stroke:var(--scr-text)] group-hover:opacity-100"
            >
              <path d={NAV_ARROW} strokeLinecap="square" />
              <path fill="none" d={NAV_ARROW_HEAD} />
            </svg>
          </button>
        </nav>
      </div>

      <div
        ref={slidesRef}
        className="relative w-full bg-[var(--scr-bg,transparent)] min-[53em]:ml-auto min-[53em]:mr-[var(--scr-slide-gap)] min-[53em]:w-[50vw]"
      />

      <div ref={stackWrapRef} className="absolute top-0 w-full">
        <div ref={stackRef} className={STACK_BASE + " " + STACK_CLOSED}>
          <div className="pointer-events-none w-full h-[var(--scr-spacer)] min-[53em]:h-[var(--scr-spacer-lg)]" />
          {items.map((item, i) => (
            <div
              key={i}
              className={ITEM_BASE + " " + ITEM_CLOSED}
              style={{ backgroundImage: "url(" + item.image + ")" }}
            />
          ))}
          <div className="pointer-events-none w-full h-[var(--scr-spacer)] min-[53em]:h-[var(--scr-spacer-lg)]" />
        </div>
      </div>

      <div
        ref={titleRef}
        className="pointer-events-none fixed bottom-0 left-[50vw] z-0 mb-[15vh]"
      >
        <h2
          className={
            OH +
            " m-0 -mb-[var(--scr-desc)] block text-[clamp(3rem,9.5vw,11rem)] font-normal leading-[0.9] tracking-[-0.02em] [font-family:var(--scr-display)]"
          }
        >
          <span
            className={
              OH_INNER +
              " scr-oh-inner block pb-[var(--scr-desc)] leading-[0.9]"
            }
          >
            {mainTitle}
          </span>
        </h2>
        <span className={OH + " block -mb-[var(--scr-desc)]"}>
          <span
            className={
              OH_INNER +
              " scr-oh-inner block pb-[var(--scr-desc)] pl-[0.35vw] text-[clamp(0.8rem,1.5vw,1.35rem)] font-light uppercase leading-none tracking-[0.32em] text-[var(--scr-muted)]"
            }
          >
            {mainSubtitle}
          </span>
        </span>
      </div>
    </div>
  );
}
