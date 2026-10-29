"use client";

import { useEffect, useId, useRef } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

const DEFAULT_SECTIONS = [
  {
    artist: "Silence",
    category: "Reduction",
    featured: "Creative Elements",
    image: photo("1749330513873-09ffa91b0aae"),
  },
  {
    artist: "Meditation",
    category: "Essence",
    featured: "Inner Stillness",
    image: photo("1627896157734-4d7d4388f28b"),
  },
  {
    artist: "Intuition",
    category: "Space",
    featured: "Deep Knowing",
    image: photo("1778789172736-e8ba37c71124"),
  },
  {
    artist: "Authenticity",
    category: "Resonance",
    featured: "True Expression",
    image: photo("1778961938903-96617183f739"),
  },
  {
    artist: "Presence",
    category: "Truth",
    featured: "Now Moment",
    image: photo("1678112553355-a9dab855ebf3"),
  },
  {
    artist: "Listening",
    category: "Feeling",
    featured: "Deep Attention",
    image: photo("1743309411498-a0f4f4b96b65"),
  },
  {
    artist: "Curiosity",
    category: "Clarity",
    featured: "Open Exploration",
    image: photo("1490682143684-14369e18dce8"),
  },
  {
    artist: "Patience",
    category: "Emptiness",
    featured: "Calm Waiting",
    image: photo("1634325232058-e7b8f80cc20b"),
  },
  {
    artist: "Surrender",
    category: "Awareness",
    featured: "Let Go Control",
    image: photo("1759458856846-097935f54111"),
  },
  {
    artist: "Simplicity",
    category: "Minimalism",
    featured: "Pure Essence",
    image: photo("1533387520709-752d83de3630"),
  },
];

const WORD_MASK = "inline-block overflow-hidden align-middle";
const WORD = "inline-block align-middle";

const FADE =
  "transition-[filter,opacity] duration-500 [&.blur]:opacity-30 [&.blur]:duration-[800ms] [&.blur]:[filter:blur(8px)]";

const ITEM_BASE =
  "relative translate-y-5 cursor-pointer text-[var(--cps-text)] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:[opacity:1_!important] [&.loaded]:translate-y-0 [&.loaded:not(.active)]:opacity-30";

const ARTIST = `${ITEM_BASE} [&.active]:translate-x-[10px] [&.active]:pl-[15px] [&.active]:opacity-100 [&.active]:before:absolute [&.active]:before:left-0 [&.active]:before:top-1/2 [&.active]:before:h-1 [&.active]:before:w-1 [&.active]:before:-translate-y-1/2 [&.active]:before:rounded-full [&.active]:before:bg-[var(--cps-text)] [&.active]:before:content-['']`;

const CATEGORY = `${ITEM_BASE} [&.active]:-translate-x-[10px] [&.active]:pr-[15px] [&.active]:opacity-100 [&.active]:after:absolute [&.active]:after:right-0 [&.active]:after:top-1/2 [&.active]:after:h-1 [&.active]:after:w-1 [&.active]:after:-translate-y-1/2 [&.active]:after:rounded-full [&.active]:after:bg-[var(--cps-text)] [&.active]:after:content-['']`;

const BG_IMAGE =
  "absolute -top-[10%] left-0 h-[120%] w-full origin-center object-cover opacity-0 will-change-transform [filter:brightness(var(--dim))] [&.active]:z-[2] [&.active]:opacity-100 [&.previous]:z-[1] [&.previous]:opacity-100";

export default function CreativeProcessScroller({
  sections = DEFAULT_SECTIONS,
  headerLines = ["The Creative", "Process"],
  footerTitle = "Beyond thinking.",
  footerText = "Quiet attention, patience and a willingness to let things be. The rest tends to arrive on its own.",
  loadingLabel = "Loading",
  bgColor = "#fff",
  textColor = "rgba(245, 245, 245, 0.9)",
  footerColor = "#0a0a0a",
  imageBrightness = 0.65,
  fontFamily = "Inter Tight",
  sectionScrollVh = 110,
  transitionDuration = 0.64,
  parallaxAmount = 5,
  customEasePath = "M0,0 C0.86,0 0.07,1 1,1",
  lenisDuration = 1.2,
  snapScrollDuration = 0.8,
  showLoader = true,
  loaderDuration = 30,
  gsapCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  scrollTriggerCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  customEaseCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js",
  lenisCdnUrl = "https://unpkg.com/lenis@1.3.25/dist/lenis.min.js",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let lenis;
    let destroyed = false;
    let cleanupMain = () => { };

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-id="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") resolve();
          else {
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
          }
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = () => {
          el.dataset.loaded = "true";
          resolve();
        };
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    function splitWords(el) {
      const text = el.textContent;
      el.textContent = "";
      return text
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
          const wrapper = document.createElement("span");
          wrapper.className = WORD_MASK;
          const span = document.createElement("span");
          span.className = WORD;
          span.textContent = word + "\u00A0";
          wrapper.appendChild(span);
          el.appendChild(wrapper);
          return span;
        });
    }

    async function init() {
      try {
        await loadScript(gsapCdnUrl);
        await loadScript(scrollTriggerCdnUrl);
        await loadScript(customEaseCdnUrl);
        await loadScript(lenisCdnUrl);
      } catch (e) {
        console.error(
          "[CreativeProcessScroller] script load failed:",
          e.message,
        );
        return;
      }
      if (destroyed) return;

      const { gsap, ScrollTrigger, CustomEase, Lenis } = window;
      if (!gsap || !ScrollTrigger || !Lenis) return;

      gsap.registerPlugin(ScrollTrigger, CustomEase);
      const easeName = `customEase-${uid}`;
      CustomEase.create(easeName, customEasePath);

      const q = (name) => root.querySelector(`[data-cps="${name}"]`);
      const qa = (name) =>
        Array.from(root.querySelectorAll(`[data-cps="${name}"]`));

      const fixedContainer = q("container");
      const fixedSectionEl = q("section");
      const header = q("header");
      const content = q("content");
      const footer = q("footer");
      const leftColumn = q("left");
      const rightColumn = q("right");
      const featured = q("featured");
      const endSection = q("end");
      const backgrounds = qa("bg");
      const artists = qa("artist");
      const categories = qa("category");
      const featuredContents = qa("featured-content");
      const progressFill = q("progress");
      const currentSectionDisplay = q("current");
      const loadingOverlay = q("loading");
      const loadingCounter = q("loading-counter");
      const loadingLabelEl = q("loading-label");
      const footerTitleEl = q("footer-title");
      const footerTextEl = q("footer-text");
      const total = sections.length;

      lenis = new Lenis({
        duration: lenisDuration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        touchMultiplier: 2,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      const splitTexts = {};
      featuredContents.forEach((contentEl, index) => {
        const h3 = contentEl.querySelector("h3");
        if (!h3) return;
        const words = splitWords(h3);
        splitTexts[index] = words;
        gsap.set(
          words,
          index === 0
            ? { yPercent: 0, opacity: 1 }
            : { yPercent: 100, opacity: 0 },
        );
      });

      gsap.set(fixedContainer, { height: "100vh" });
      gsap.set(content, { yPercent: -50 });

      let currentSection = 0;
      let isAnimating = false;
      let isSnapping = false;

      function updateProgressNumbers() {
        currentSectionDisplay.textContent = (currentSection + 1)
          .toString()
          .padStart(2, "0");
      }
      updateProgressNumbers();

      const fixedSectionTop =
        fixedSectionEl.getBoundingClientRect().top + window.scrollY;
      const fixedSectionHeight = fixedSectionEl.offsetHeight;
      const sectionPositions = [];
      for (let i = 0; i < total; i++) {
        sectionPositions.push(
          fixedSectionTop + (fixedSectionHeight * i) / total,
        );
      }

      function navigateToSection(index) {
        if (index === currentSection || isAnimating || isSnapping) return;
        isSnapping = true;
        changeSection(index);
        lenis.scrollTo(sectionPositions[index], {
          duration: snapScrollDuration,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          lock: true,
          onComplete: () => (isSnapping = false),
        });
      }

      const clickHandlers = [];
      [...artists, ...categories].forEach((el, n) => {
        const i = n % total;
        const handler = (e) => {
          e.preventDefault();
          navigateToSection(i);
        };
        el.addEventListener("click", handler);
        clickHandlers.push([el, handler]);
      });

      function changeSection(newSection) {
        if (newSection === currentSection || isAnimating) return;
        isAnimating = true;
        const isScrollingDown = newSection > currentSection;
        const previousSection = currentSection;
        currentSection = newSection;
        updateProgressNumbers();
        progressFill.style.width = `${(currentSection / (total - 1)) * 100}%`;

        featuredContents.forEach((c, i) => {
          if (i !== newSection && i !== previousSection) {
            c.classList.remove("active");
            gsap.set(c, { visibility: "hidden", opacity: 0 });
          }
        });

        const prevWords = splitTexts[previousSection];
        if (prevWords) {
          gsap.to(prevWords, {
            yPercent: isScrollingDown ? -100 : 100,
            opacity: 0,
            duration: transitionDuration * 0.6,
            stagger: isScrollingDown ? 0.03 : -0.03,
            ease: easeName,
            onComplete: () => {
              featuredContents[previousSection].classList.remove("active");
              gsap.set(featuredContents[previousSection], {
                visibility: "hidden",
              });
            },
          });
        }

        const newWords = splitTexts[newSection];
        if (newWords) {
          featuredContents[newSection].classList.add("active");
          gsap.set(featuredContents[newSection], {
            visibility: "visible",
            opacity: 1,
          });
          gsap.set(newWords, {
            yPercent: isScrollingDown ? 100 : -100,
            opacity: 0,
          });
          gsap.to(newWords, {
            yPercent: 0,
            opacity: 1,
            duration: transitionDuration,
            stagger: isScrollingDown ? 0.05 : -0.05,
            ease: easeName,
          });
        }

        backgrounds.forEach((bg, i) => {
          bg.classList.remove("previous", "active");
          if (i === newSection) {
            if (isScrollingDown) {
              gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(100% 0 0 0)" });
              gsap.to(bg, {
                clipPath: "inset(0% 0 0 0)",
                duration: transitionDuration,
                ease: easeName,
              });
            } else {
              gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(0 0 100% 0)" });
              gsap.to(bg, {
                clipPath: "inset(0 0 0% 0)",
                duration: transitionDuration,
                ease: easeName,
              });
            }
            bg.classList.add("active");
          } else if (i === previousSection) {
            bg.classList.add("previous");
            gsap.to(bg, {
              y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
              duration: transitionDuration,
              ease: easeName,
            });
            gsap.to(bg, {
              opacity: 0,
              delay: transitionDuration * 0.5,
              duration: transitionDuration * 0.5,
              ease: easeName,
              onComplete: () => {
                bg.classList.remove("previous");
                gsap.set(bg, { y: 0 });
                isAnimating = false;
              },
            });
          } else {
            gsap.to(bg, {
              opacity: 0,
              duration: transitionDuration * 0.3,
              ease: easeName,
            });
          }
        });

        [artists, categories].forEach((list) => {
          list.forEach((el, i) => {
            if (i === newSection) {
              el.classList.add("active");
              gsap.to(el, { opacity: 1, duration: 0.3, ease: "power2.out" });
            } else {
              el.classList.remove("active");
              gsap.to(el, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
            }
          });
        });
      }

      function animateColumns() {
        artists.forEach((el, i) =>
          setTimeout(() => el.classList.add("loaded"), i * 60),
        );
        categories.forEach((el, i) =>
          setTimeout(() => el.classList.add("loaded"), i * 60 + 200),
        );
      }

      let counterInterval;
      if (showLoader && loadingOverlay && loadingCounter) {
        let counter = 0;
        counterInterval = setInterval(() => {
          counter += Math.random() * 3 + 1;
          if (counter >= 100) {
            counter = 100;
            clearInterval(counterInterval);
            setTimeout(() => {
              gsap.to(loadingCounter, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power2.inOut",
              });
              gsap.to(loadingLabelEl, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                  gsap.to(loadingOverlay, {
                    y: "-100%",
                    duration: 1.2,
                    ease: "power3.inOut",
                    delay: 0.3,
                    onComplete: () => {
                      loadingOverlay.style.display = "none";
                      animateColumns();
                    },
                  });
                },
              });
            }, 200);
          }
          loadingCounter.textContent = counter.toFixed(0);
        }, loaderDuration);
      } else {
        if (loadingOverlay) loadingOverlay.style.display = "none";
        animateColumns();
      }

      const mainTrigger = ScrollTrigger.create({
        trigger: fixedSectionEl,
        start: "top top",
        end: "bottom bottom",
        pin: fixedContainer,
        pinSpacing: true,
        onUpdate: (self) => {
          if (isSnapping) return;
          const targetSection = Math.min(
            total - 1,
            Math.floor(self.progress * total),
          );
          if (targetSection !== currentSection && !isAnimating) {
            const nextSection =
              currentSection + (targetSection > currentSection ? 1 : -1);
            if (
              nextSection >= 0 &&
              nextSection <= total - 1 &&
              nextSection !== currentSection
            ) {
              isSnapping = true;
              changeSection(nextSection);
              lenis.scrollTo(sectionPositions[nextSection], {
                duration: 0.6,
                easing: (t) => 1 - Math.pow(1 - t, 3),
                lock: true,
                onComplete: () => (isSnapping = false),
              });
            }
          }
        },
      });

      const endTrigger = ScrollTrigger.create({
        trigger: endSection,
        start: "top center",
        end: "bottom bottom",
        onUpdate: (self) => {
          const blurred = self.progress > 0.1;
          [footer, leftColumn, rightColumn, featured].forEach((el) => {
            el.classList.toggle("blur", blurred);
          });
          if (blurred) {
            const newHeight = Math.max(
              0,
              100 - ((self.progress - 0.1) / 0.9) * 100,
            );
            const moveY = (-(self.progress - 0.1) / 0.9) * 200;
            gsap.to(fixedContainer, {
              height: `${newHeight}vh`,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(header, {
              y: moveY * 1.5,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(content, {
              y: moveY,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(footer, {
              y: moveY * 0.5,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
          } else {
            gsap.to(fixedContainer, {
              height: "100vh",
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(header, {
              y: 0,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(content, {
              y: 0,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(footer, {
              y: 0,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
            });
          }
        },
      });

      const footerTween = gsap.fromTo(
        [footerTitleEl, footerTextEl],
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          stagger: 0.15,
          scrollTrigger: {
            trigger: endSection,
            start: "top 55%",
            end: "top 5%",
            scrub: true,
          },
        },
      );

      cleanupMain = () => {
        clearInterval(counterInterval);
        clickHandlers.forEach(([el, handler]) =>
          el.removeEventListener("click", handler),
        );
        footerTween.scrollTrigger?.kill();
        footerTween.kill();
        mainTrigger.kill();
        endTrigger.kill();
        gsap.ticker.remove(raf);
        lenis?.destroy();
      };
    }

    init();

    return () => {
      destroyed = true;
      cleanupMain();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full font-[family-name:var(--font)]"
      style={{
        "--font": `"${fontFamily}", sans-serif`,
        "--cps-text": textColor,
        "--cps-bg": bgColor,
        "--cps-footer": footerColor,
        "--dim": imageBrightness,
        "--scroll-h": `${sectionScrollVh * sections.length}vh`,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&display=swap"
      />

      <div
        data-cps="loading"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--cps-bg)] text-lg uppercase tracking-tight text-black"
      >
        <span data-cps="loading-label">{loadingLabel}</span>
        <span data-cps="loading-counter" className="ml-2 tabular-nums">
          0
        </span>
      </div>

      <div className="relative bg-[var(--cps-bg)]">
        <div
          data-cps="section"
          className="relative h-[var(--scroll-h)] bg-[var(--cps-bg)]"
        >
          <div
            data-cps="container"
            className="sticky left-0 top-0 h-screen w-full origin-top overflow-hidden bg-[var(--cps-bg)] will-change-[transform,height]"
          >
            <div className="absolute inset-0 z-[1] overflow-hidden bg-black">
              {sections.map((s, i) => (
                <img
                  key={i}
                  data-cps="bg"
                  src={s.image}
                  alt={s.artist}
                  className={`${BG_IMAGE}${i === 0 ? " active" : ""}`}
                />
              ))}
            </div>

            <div className="relative z-[2] grid h-full grid-cols-12 gap-4 px-8">
              <div
                data-cps="header"
                className="col-span-12 self-start pt-[5vh] text-center text-[8vw] font-medium uppercase leading-[0.8] text-[var(--cps-text)] will-change-[transform,filter,opacity]"
              >
                {headerLines.map((line, i) => (
                  <div key={i} className="block">
                    {line}
                  </div>
                ))}
              </div>

              <div
                data-cps="content"
                className="absolute left-0 top-1/2 col-span-12 flex w-full items-center justify-between px-8 will-change-transform max-[768px]:flex-col max-[768px]:gap-[5vh]"
              >
                <div
                  data-cps="left"
                  className={`flex w-2/5 flex-col gap-1 text-left uppercase will-change-[filter,opacity] max-[768px]:w-full max-[768px]:text-center ${FADE}`}
                >
                  {sections.map((s, i) => (
                    <div
                      key={i}
                      data-cps="artist"
                      className={`${ARTIST}${i === 0 ? " active" : ""}`}
                    >
                      {s.artist}
                    </div>
                  ))}
                </div>

                <div
                  data-cps="featured"
                  className={`relative flex h-[10vh] w-1/5 items-center justify-center overflow-hidden text-center text-[1.5vw] uppercase will-change-[filter,opacity] max-[768px]:order-first max-[768px]:mb-[2vh] max-[768px]:w-full max-[768px]:text-[3vw] ${FADE}`}
                >
                  {sections.map((s, i) => (
                    <div
                      key={i}
                      data-cps="featured-content"
                      className={`absolute inset-0 flex items-center justify-center opacity-0 invisible [&.active]:visible [&.active]:opacity-100${i === 0 ? " active" : ""
                        }`}
                    >
                      <h3 className="absolute left-1/2 top-1/2 m-0 w-full -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-medium text-[var(--cps-text)]">
                        {s.featured}
                      </h3>
                    </div>
                  ))}
                </div>

                <div
                  data-cps="right"
                  className={`flex w-2/5 flex-col gap-1 text-right uppercase will-change-[filter,opacity] max-[768px]:w-full max-[768px]:text-center ${FADE}`}
                >
                  {sections.map((s, i) => (
                    <div
                      key={i}
                      data-cps="category"
                      className={`${CATEGORY}${i === 0 ? " active" : ""}`}
                    >
                      {s.category}
                    </div>
                  ))}
                </div>
              </div>

              <div
                data-cps="footer"
                className={`col-span-12 self-end pb-[5vh] text-center font-medium uppercase leading-[0.8] will-change-[transform,filter,opacity] ${FADE}`}
              >
                <div className="relative mx-auto mt-[2vh] h-px w-40 bg-[rgba(245,245,245,0.3)]">
                  <div className="absolute left-0 right-0 top-0 -mx-[25px] flex -translate-y-1/2 justify-between text-xs uppercase text-[var(--cps-text)]">
                    <span data-cps="current">01</span>
                    <span>{sections.length.toString().padStart(2, "0")}</span>
                  </div>
                  <div
                    data-cps="progress"
                    className="absolute left-0 top-0 h-full w-0 bg-[var(--cps-text)] [transition:width_0.3s_cubic-bezier(0.65,0,0.35,1)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          data-cps="end"
          className="relative flex h-screen flex-col items-center justify-center bg-[var(--cps-bg)] px-8 text-center text-[var(--cps-footer)]"
        >
          <h2
            data-cps="footer-title"
            className="max-w-[14ch] text-[clamp(2.75rem,8vw,7rem)] font-light leading-none tracking-[-0.03em]"
          >
            {footerTitle}
          </h2>
          <p
            data-cps="footer-text"
            className="mt-8 max-w-[38ch] text-[1.05rem] leading-relaxed text-[color-mix(in_srgb,var(--cps-footer)_60%,transparent)]"
          >
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
}