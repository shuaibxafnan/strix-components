"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    label: "Gotiva",
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Hava",
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Sikter",
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Valo",
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Opanci",
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Insan",
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
  },
];

const DEFAULT_BODY_TEXT = [
  "Sinoć kad se vraćah iz topla hamama,",
  "prođoh pokraj bašče staroga imama.",
  "Kad tamo u bašči, u hladu jasmina",
  "s ibrikom u ruci stajaše Emina.",
  "Ja kakva je pusta! Tako mi imana,",
  "stid je ne bi bilo da je kod sultana.",
  "Pa još kada šeće i plećima kreće,",
  "ni hodžin mi zapis više pomoć' neće!",
].join("\n");

export default function LettersMenuHover({
  items = DEFAULT_ITEMS,
  bgColor = "#f7f5f0",
  textColor = "#000000",
  counterColor = "#ccc0a2",
  showCounter = true,
  bodyText = DEFAULT_BODY_TEXT,
  bodyTextColor = "#111111",
  displayFontUrl = "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;700;900&display=swap",
  bodyFontUrl = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap",
  displayFontFamily = "'Big Shoulders Display', sans-serif",
  bodyFontFamily = "'Space Grotesk', sans-serif",
  fontSize = "2rem",
  fontSizeLarge = "10vw",
  letterPadding = "1.25rem",
  letterPaddingLarge = "3vw",
  revealWidth = 350,
  revealHeight = 450,
  hoverDelay = 100,
  startingAngle = -30,
  rotationRange = 100,
  lerpAmount = 0.15,
  charDuration = 0.5,
  charStagger = 0.025,
  revealDuration = 1.3,
  introStagger = 0.05,
  showCursor = true,
  cursorColor = "#e0530e",
  cursorSize = 20,
  fadeOverlay = true,
  className = "",
}) {
  const rawId = useId();
  const uid = "lmh" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const loadStyle = (href) => {
      if (!href) return;
      if (document.querySelector('link[data-id="' + href + '"]')) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-id", href);
      document.head.appendChild(link);
    };
    loadStyle(displayFontUrl);
    loadStyle(bodyFontUrl);
  }, [displayFontUrl, bodyFontUrl]);

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    import("gsap")
      .then((mod) => {
        if (cancelled || !rootRef.current) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap) return;

        const root = rootRef.current;
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
        const lerp = (a, b, n) => (1 - n) * a + n * b;
        const clamp = (n, min, max) => (n <= min ? min : n >= max ? max : n);

        let mousepos = { x: 0, y: 0 };
        let mousePosCache = { x: 0, y: 0 };
        let cursorDirection = { x: 0, y: 0 };

        const onMouseMove = (ev) => {
          mousepos = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("mousemove", onMouseMove);
        cleanups.push(() =>
          window.removeEventListener("mousemove", onMouseMove),
        );

        const animatableProperties = {
          tx: { previous: 0, current: 0, amt: lerpAmount },
          ty: { previous: 0, current: 0, amt: lerpAmount },
          rotation: { previous: 0, current: 0, amt: lerpAmount },
        };

        const nodes = itemRefs.current.filter(Boolean);

        nodes.forEach((el, index) => {
          const reveal = el.querySelector("[data-reveal]");
          const revealInner = el.querySelector("[data-reveal-inner]");
          const revealImage = el.querySelector("[data-reveal-img]");
          const word = el.querySelector("[data-word]");
          const wordClone = el.querySelector("[data-word-clone]");
          if (!reveal || !word || !wordClone) return;

          const titleChars = [...word.querySelectorAll("[data-char]")];
          const cloneChars = [...wordClone.querySelectorAll("[data-char]")];

          let bounds = null;
          let requestId;
          let firstCycle = true;
          let hoverEnter = null;
          let hoverTimeout;
          let charsTl;
          let imageTl;

          const calcBounds = () => {
            bounds = {
              el: el.getBoundingClientRect(),
              width: reveal.offsetWidth,
              height: reveal.offsetHeight,
            };
          };

          const render = () => {
            requestId = undefined;
            if (!bounds) return;

            const mouseDistanceX = clamp(
              Math.abs(mousePosCache.x - mousepos.x),
              0,
              100,
            );
            cursorDirection = {
              x: mousePosCache.x - mousepos.x,
              y: mousePosCache.y - mousepos.y,
            };
            mousePosCache = { x: mousepos.x, y: mousepos.y };

            animatableProperties.tx.current =
              Math.abs(mousepos.x - bounds.el.left) - bounds.width;
            animatableProperties.ty.current = firstCycle
              ? bounds.height / 1.5
              : Math.abs(mousepos.y - bounds.el.top);
            animatableProperties.rotation.current = firstCycle
              ? startingAngle
              : map(
                  mouseDistanceX,
                  0,
                  300,
                  startingAngle,
                  cursorDirection.x < 0
                    ? startingAngle + rotationRange
                    : startingAngle - rotationRange,
                );

            ["tx", "ty", "rotation"].forEach((key) => {
              animatableProperties[key].previous = firstCycle
                ? animatableProperties[key].current
                : lerp(
                    animatableProperties[key].previous,
                    animatableProperties[key].current,
                    animatableProperties[key].amt,
                  );
            });

            gsap.set(reveal, {
              x: animatableProperties.tx.previous,
              y: animatableProperties.ty.previous,
              rotation: animatableProperties.rotation.previous,
            });

            firstCycle = false;
            loopRender();
          };

          const loopRender = () => {
            if (!requestId) {
              requestId = requestAnimationFrame(render);
            }
          };

          const stopRendering = () => {
            if (requestId) {
              cancelAnimationFrame(requestId);
              requestId = undefined;
            }
          };

          const animateCharsIn = () => {
            if (charsTl) charsTl.kill();
            charsTl = gsap
              .timeline({
                defaults: {
                  duration: charDuration,
                  ease: "power2",
                  stagger: charStagger,
                },
              })
              .to(titleChars, { y: "100%", rotationX: -90, opacity: 0 })
              .to(
                cloneChars,
                {
                  startAt: { y: "-100%", rotationX: 90, opacity: 0 },
                  y: "0%",
                  rotationX: 0,
                  opacity: 1,
                },
                0,
              );
          };

          const animateCharsOut = () => {
            if (charsTl) charsTl.kill();
            charsTl = gsap
              .timeline({
                defaults: {
                  duration: charDuration,
                  ease: "power2",
                  stagger: charStagger,
                },
              })
              .to(cloneChars, { y: "-100%", rotationX: 90, opacity: 0 })
              .to(
                titleChars,
                {
                  startAt: { y: "100%", rotationX: -90, opacity: 0 },
                  y: "0%",
                  rotationX: 0,
                  opacity: 1,
                },
                0,
              );
          };

          const showImage = () => {
            if (imageTl) imageTl.kill();
            imageTl = gsap
              .timeline({
                onStart: () => {
                  gsap.set([reveal, revealInner], { opacity: 1 });
                  gsap.set(el, { zIndex: nodes.length });
                },
              })
              .to(revealInner, {
                duration: revealDuration,
                ease: "expo",
                startAt: { scale: 0.5 },
                scale: 1,
              })
              .to(
                revealImage,
                {
                  duration: revealDuration,
                  ease: "expo",
                  startAt: { scaleX: 2 },
                  scaleX: 1,
                },
                0,
              )
              .to(reveal, { duration: 0.6, ease: "power1.inOut" }, 0);
          };

          const hideImage = () => {
            if (imageTl) imageTl.kill();
            imageTl = gsap
              .timeline({
                defaults: { duration: 1.2, ease: "power1" },
                onStart: () => {
                  gsap.set(el, { zIndex: 1 });
                },
                onComplete: () => {
                  gsap.set(reveal, { opacity: 0 });
                },
              })
              .to(revealInner, { opacity: 0 })
              .to(revealImage, { scaleX: 1.7 }, 0)
              .to(
                reveal,
                {
                  rotation: cursorDirection.x < 0 ? "+=5" : "-=5",
                  y: "200%",
                },
                0,
              );
          };

          const onEnter = () => {
            hoverTimeout = setTimeout(() => {
              hoverEnter = true;
              firstCycle = true;
              calcBounds();
              reveal.style.transformOrigin = "100% 0%";
              animateCharsIn();
              showImage();
              loopRender();
            }, hoverDelay);
          };

          const onLeave = () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (hoverEnter) {
              hoverEnter = null;
              stopRendering();
              animateCharsOut();
              hideImage();
            }
          };

          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);

          cleanups.push(() => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
            if (hoverTimeout) clearTimeout(hoverTimeout);
            stopRendering();
            if (charsTl) charsTl.kill();
            if (imageTl) imageTl.kill();
          });
        });

        const innerTexts = nodes
          .map((el) => el.querySelector("[data-text]"))
          .filter(Boolean);

        if (reduceMotion) {
          gsap.set(innerTexts, { x: "0%", opacity: 1 });
        } else {
          const introTl = gsap
            .timeline()
            .set(innerTexts, { x: "20%", opacity: 0 })
            .to(innerTexts, {
              duration: 1,
              ease: "power3",
              x: "0%",
              stagger: introStagger,
            })
            .to(
              innerTexts,
              {
                duration: 0.4,
                ease: "power1",
                opacity: 1,
                stagger: introStagger,
              },
              0,
            );
          cleanups.push(() => introTl.kill());
        }

        if (showCursor && cursorRef.current) {
          const cursorEl = cursorRef.current;
          const fine = window.matchMedia("(any-pointer: fine)").matches;
          if (fine) {
            const bounds = cursorEl.getBoundingClientRect();
            const styles = {
              tx: { previous: 0, current: 0, amt: 0.15 },
              ty: { previous: 0, current: 0, amt: 0.15 },
              scale: { previous: 1, current: 1, amt: 0.15 },
              opacity: { previous: 1, current: 1, amt: 0.1 },
            };
            let rafId;
            let started = false;

            const renderCursor = () => {
              styles.tx.current = mousepos.x - bounds.width / 2;
              styles.ty.current = mousepos.y - bounds.height / 2;
              Object.keys(styles).forEach((key) => {
                styles[key].previous = lerp(
                  styles[key].previous,
                  styles[key].current,
                  styles[key].amt,
                );
              });
              cursorEl.style.transform =
                "translateX(" +
                styles.tx.previous +
                "px) translateY(" +
                styles.ty.previous +
                "px) scale(" +
                styles.scale.previous +
                ")";
              cursorEl.style.opacity = styles.opacity.previous;
              rafId = requestAnimationFrame(renderCursor);
            };

            const startCursor = (ev) => {
              if (started) return;
              started = true;
              styles.tx.previous = styles.tx.current =
                ev.clientX - bounds.width / 2;
              styles.ty.previous = styles.ty.current =
                ev.clientY - bounds.height / 2;
              gsap.to(cursorEl, {
                duration: 0.9,
                ease: "power3.out",
                opacity: 1,
              });
              rafId = requestAnimationFrame(renderCursor);
            };

            window.addEventListener("mousemove", startCursor);

            const enterFns = [];
            root.querySelectorAll("[data-cursor-target]").forEach((link) => {
              const enter = () => {
                styles.scale.current = 2.5;
                styles.opacity.current = 0.5;
              };
              const leave = () => {
                styles.scale.current = 1;
                styles.opacity.current = 1;
              };
              link.addEventListener("mouseenter", enter);
              link.addEventListener("mouseleave", leave);
              enterFns.push(() => {
                link.removeEventListener("mouseenter", enter);
                link.removeEventListener("mouseleave", leave);
              });
            });

            cleanups.push(() => {
              window.removeEventListener("mousemove", startCursor);
              if (rafId) cancelAnimationFrame(rafId);
              enterFns.forEach((fn) => fn());
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    items,
    hoverDelay,
    startingAngle,
    rotationRange,
    lerpAmount,
    charDuration,
    charStagger,
    revealDuration,
    introStagger,
    showCursor,
  ]);

  const scopedCss =
    "." +
    uid +
    "-menu{counter-reset:" +
    uid +
    "counter;}" +
    "." +
    uid +
    "-item::before{counter-increment:" +
    uid +
    "counter;content:" +
    (showCounter
      ? "counters(" + uid + "counter,'.',decimal-leading-zero)"
      : "''") +
    ";position:absolute;left:0;top:0;color:" +
    counterColor +
    ";z-index:-1;line-height:1;}" +
    "@media screen and (min-width:53em){." +
    uid +
    "-item::before{left:1vw;top:0.25vw;}}" +
    "." +
    uid +
    "-text{font-size:" +
    fontSize +
    ";}" +
    "@media screen and (min-width:53em){." +
    uid +
    "-text{font-size:" +
    fontSizeLarge +
    ";}}" +
    "." +
    uid +
    "-word{padding:0 " +
    letterPadding +
    ";}" +
    "@media screen and (min-width:53em){." +
    uid +
    "-word{padding:0 " +
    letterPaddingLarge +
    ";}}" +
    "." +
    uid +
    "-fade::after{content:'';position:fixed;pointer-events:none;width:100%;height:100%;top:0;left:0;z-index:1;background:linear-gradient(transparent 0%,transparent 70%," +
    bgColor +
    " 100%);}" +
    "@media (any-pointer:coarse){." +
    uid +
    "-cursor{display:none;}}";

  return (
    <div
      ref={rootRef}
      className={
        uid +
        " relative w-full h-screen overflow-hidden antialiased " +
        (fadeOverlay ? uid + "-fade" : "") +
        (className ? " " + className : "")
      }
      style={{ backgroundColor: bgColor, fontFamily: bodyFontFamily }}
    >
      <style>{scopedCss}</style>

      <nav
        className={
          uid +
          "-menu relative z-[100] flex flex-wrap items-center justify-center select-none px-4 pt-8 pb-12 md:pt-[21vh]"
        }
      >
        {items.map((item, index) => (
          <a
            key={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            data-cursor-target
            className={
              uid +
              "-item relative mb-4 cursor-pointer uppercase will-change-transform"
            }
            style={{
              color: textColor,
              fontFamily: displayFontFamily,
              fontWeight: 700,
            }}
          >
            <span
              data-text
              className={
                uid +
                "-text relative z-[-1] block leading-none pointer-events-none"
              }
            >
              <span
                data-word
                className={uid + "-word block overflow-hidden"}
                style={{
                  perspective: "1000px",
                  perspectiveOrigin: "-150% 50%",
                }}
              >
                {item.label.split("").map((ch, i) => (
                  <span
                    key={i}
                    data-char
                    className="inline-block will-change-transform"
                    style={{ transformOrigin: "0% 0%" }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <span
                data-word-clone
                className={
                  uid +
                  "-word absolute top-0 left-0 w-full h-full overflow-hidden"
                }
                style={{
                  perspective: "1000px",
                  perspectiveOrigin: "-150% 50%",
                }}
              >
                {item.label.split("").map((ch, i) => (
                  <span
                    key={i}
                    data-char
                    className="inline-block opacity-0 will-change-transform"
                    style={{ transformOrigin: "0% 0%" }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </span>

            <div
              data-reveal
              className="absolute top-0 left-0 z-[-1] opacity-0 pointer-events-none will-change-transform"
              style={{
                width: revealWidth + "px",
                height: revealHeight + "px",
                transformOrigin: "0% 0%",
              }}
            >
              <div
                data-reveal-inner
                className="relative w-full h-full overflow-hidden will-change-transform"
              >
                <div
                  data-reveal-img
                  className="relative w-full h-full bg-cover bg-center will-change-transform"
                  style={{ backgroundImage: "url(" + item.image + ")" }}
                />
              </div>
            </div>
          </a>
        ))}
      </nav>

      {bodyText ? (
        <p
          className="relative z-[-1] mx-auto max-w-[30ch] whitespace-pre-line px-4 text-center leading-relaxed"
          style={{ color: bodyTextColor }}
        >
          {bodyText}
        </p>
      ) : null}

      {showCursor ? (
        <svg
          ref={cursorRef}
          className={
            uid + "-cursor fixed top-0 left-0 z-[1001] pointer-events-none"
          }
          width={cursorSize}
          height={cursorSize}
          viewBox="0 0 20 20"
          style={{ opacity: 0 }}
        >
          <circle cx="10" cy="10" r="5" fill={cursorColor} opacity="0.7" />
        </svg>
      ) : null}
    </div>
  );
}
