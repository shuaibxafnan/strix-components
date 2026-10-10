"use client";

import { useEffect, useRef, useId } from "react";

// ─── CreativeProcessScroller ─────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sections            array   see DEFAULT_SECTIONS   Array of { artist, category, featured, image } — one entry per scroll-snapped section. `artist` renders in the left column, `category` in the right column, `featured` as the center word-reveal title, `image` as that section's fullscreen background.
// headerLines         array   ["The Creative","Process"]   Two (or more) lines rendered at the top, stacked
// footerLines         array   ["Beyond","Thinking"]        Two (or more) lines rendered at the bottom, stacked, above the progress bar
// bgColor             string  "#fff"      Page/section background color (also the "fin" end section background)
// textColor           string  "rgba(245,245,245,0.9)"   Color used for header, footer, columns, featured text, progress bar
// finText             string  "fin"       Text shown in the rotated end marker after the last section
// fontFamily          string  "'PP Neue Montreal', sans-serif"   Font stack applied to the whole component
// fontImportUrl       string  bunny/cdnfonts PP Neue Montreal URL   Stylesheet URL loaded once for the font
// sectionScrollVh     number  110         vh of scroll distance allocated PER section (total pinned scroll = sectionScrollVh * sections.length)
// transitionDuration  number  0.64        GSAP duration (s) for the per-section text/background crossfade
// parallaxAmount      number  5           % vertical parallax drift applied to the outgoing background image
// customEasePath      string  "M0,0 C0.86,0 0.07,1 1,1"   SVG cubic-bezier path string passed to CustomEase
// lenisDuration       number  1.2         Smooth-scroll (Lenis) duration
// snapScrollDuration  number  0.8         Duration of the scrollTo animation when clicking a column item
// enableSound         bool    true        Master toggle — if false, the sound manager/toggle button are not rendered or wired up
// soundUrls           object  see DEFAULTS   { hover, click, textChange } mp3 URLs
// soundVolumes        object  { hover:0.15, click:0.3, textChange:0.3 }   Per-sound volume (0–1)
// showDebug           bool    false       If true, renders the bottom-right debug readout (also toggled at runtime with the "h" key)
// gsapCdnUrl / scrollTriggerCdnUrl / customEaseCdnUrl / lenisCdnUrl   string   cdnjs URLs for each library, overridable if you want to pin different versions
// ──────────────────────────────────────────────────────────────────────────
//
// Note on SplitText: the original demo used GSAP's SplitText, which is a paid
// "Club GSAP" plugin not available on any public CDN. This component
// reproduces the identical word-mask / word-reveal effect using a small
// manual word-splitter (splitWords helper below) built on plain GSAP
// (free/core), so there's no dependency on a licensed plugin.

const DEFAULT_SECTIONS = [
  {
    artist: "Silence",
    category: "Reduction",
    featured: "Creative Elements",
    image: "https://assets.codepen.io/7558/flame-glow-blur-001.jpg",
  },
  {
    artist: "Meditation",
    category: "Essence",
    featured: "Inner Stillness",
    image: "https://assets.codepen.io/7558/flame-glow-blur-002.jpg",
  },
  {
    artist: "Intuition",
    category: "Space",
    featured: "Deep Knowing",
    image: "https://assets.codepen.io/7558/flame-glow-blur-003.jpg",
  },
  {
    artist: "Authenticity",
    category: "Resonance",
    featured: "True Expression",
    image: "https://assets.codepen.io/7558/flame-glow-blur-004.jpg",
  },
  {
    artist: "Presence",
    category: "Truth",
    featured: "Now Moment",
    image: "https://assets.codepen.io/7558/flame-glow-blur-005.jpg",
  },
  {
    artist: "Listening",
    category: "Feeling",
    featured: "Deep Attention",
    image: "https://assets.codepen.io/7558/flame-glow-blur-006.jpg",
  },
  {
    artist: "Curiosity",
    category: "Clarity",
    featured: "Open Exploration",
    image: "https://assets.codepen.io/7558/flame-glow-blur-007.jpg",
  },
  {
    artist: "Patience",
    category: "Emptiness",
    featured: "Calm Waiting",
    image: "https://assets.codepen.io/7558/flame-glow-blur-008.jpg",
  },
  {
    artist: "Surrender",
    category: "Awareness",
    featured: "Let Go Control",
    image: "https://assets.codepen.io/7558/flame-glow-blur-009.jpg",
  },
  {
    artist: "Simplicity",
    category: "Minimalism",
    featured: "Pure Essence",
    image: "https://assets.codepen.io/7558/flame-glow-blur-010.jpg",
  },
];

const DEFAULT_SOUND_URLS = {
  hover: "https://assets.codepen.io/7558/click-reverb-001.mp3",
  click: "https://assets.codepen.io/7558/shutter-fx-001.mp3",
  textChange: "https://assets.codepen.io/7558/whoosh-fx-001.mp3",
};

const DEFAULT_SOUND_VOLUMES = { hover: 0.15, click: 0.3, textChange: 0.3 };

export default function CreativeProcessScroller({
  sections = DEFAULT_SECTIONS,
  headerLines = ["The Creative", "Process"],
  footerLines = ["Beyond", "Thinking"],
  bgColor = "#fff",
  textColor = "rgba(245, 245, 245, 0.9)",
  finText = "fin",
  fontFamily = "'PP Neue Montreal', sans-serif",
  fontImportUrl = "https://fonts.cdnfonts.com/css/pp-neue-montreal",
  sectionScrollVh = 110,
  transitionDuration = 0.64,
  parallaxAmount = 5,
  customEasePath = "M0,0 C0.86,0 0.07,1 1,1",
  lenisDuration = 1.2,
  snapScrollDuration = 0.8,
  enableSound = true,
  soundUrls = DEFAULT_SOUND_URLS,
  soundVolumes = DEFAULT_SOUND_VOLUMES,
  showLoader = true,
  loaderDuration = 30,
  showDebug = false,
  gsapCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  scrollTriggerCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  customEaseCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js",
  lenisCdnUrl = "https://unpkg.com/lenis@1.3.25/dist/lenis.min.js",
}) {
  const uid = useId().replace(/[:]/g, "");
  const rootRef = useRef(null);
  const soundOn = useRef(false);
  const soundsRef = useRef({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let lenis;
    let mainTrigger, progressTrigger, endTrigger, keyHandler;
    let destroyed = false;

    // ── font ────────────────────────────────────────────────────────────
    if (!document.querySelector(`link[data-id="${fontImportUrl}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontImportUrl;
      link.setAttribute("data-id", fontImportUrl);
      document.head.appendChild(link);
    }

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

    // ── manual word splitter (SplitText replacement) ────────────────────
    function splitWords(el) {
      const text = el.textContent;
      el.textContent = "";
      const words = text
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
          const wrapper = document.createElement("span");
          wrapper.className = "word-mask";
          wrapper.style.display = "inline-block";
          wrapper.style.overflow = "hidden";
          wrapper.style.verticalAlign = "middle";
          const span = document.createElement("span");
          span.className = "split-word";
          span.style.display = "inline-block";
          span.style.verticalAlign = "middle";
          span.textContent = word + "\u00A0";
          wrapper.appendChild(span);
          el.appendChild(wrapper);
          return span;
        });
      return words;
    }

    // ── sound manager ────────────────────────────────────────────────────
    function loadSound(name, url, volume) {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = volume ?? 0.3;
      soundsRef.current[name] = audio;
    }

    function playSound(name, delay = 0) {
      if (!enableSound || !soundOn.current) return;
      const audio = soundsRef.current[name];
      if (!audio) return;
      const fire = () => {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      };
      delay > 0 ? setTimeout(fire, delay) : fire();
    }

    function enableAudio() {
      soundOn.current = true;
    }

    let cleanupMain = () => {};

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
      CustomEase.create(`customEase-${uid}`, customEasePath);

      if (enableSound) {
        Object.entries(soundUrls).forEach(([name, url]) =>
          loadSound(name, url, soundVolumes[name]),
        );
      }

      const fixedContainer = root.querySelector(`#fixed-container-${uid}`);
      const fixedSectionEl = root.querySelector(`#fixed-section-${uid}`);
      const header = root.querySelector(`#header-${uid}`);
      const content = root.querySelector(`#content-${uid}`);
      const footer = root.querySelector(`#footer-${uid}`);
      const leftColumn = root.querySelector(`#left-column-${uid}`);
      const rightColumn = root.querySelector(`#right-column-${uid}`);
      const featured = root.querySelector(`#featured-${uid}`);
      const backgrounds = Array.from(root.querySelectorAll(`.bg-image-${uid}`));
      const artists = Array.from(root.querySelectorAll(`.artist-${uid}`));
      const categories = Array.from(root.querySelectorAll(`.category-${uid}`));
      const featuredContents = Array.from(
        root.querySelectorAll(`.featured-content-${uid}`),
      );
      const progressFill = root.querySelector(`#progress-fill-${uid}`);
      const currentSectionDisplay = root.querySelector(
        `#current-section-${uid}`,
      );
      const debugInfo = root.querySelector(`#debug-info-${uid}`);
      const total = sections.length;

      lenis = new Lenis({
        duration: lenisDuration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      artists.forEach((el, i) => {
        setTimeout(() => el.classList.add("loaded"), i * 60);
      });
      categories.forEach((el, i) => {
        setTimeout(() => el.classList.add("loaded"), i * 60 + 200);
      });

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
      let lastProgress = 0;

      function updateProgressNumbers() {
        currentSectionDisplay.textContent = (currentSection + 1)
          .toString()
          .padStart(2, "0");
      }
      updateProgressNumbers();

      const fixedSectionTop = fixedSectionEl.offsetTop;
      const fixedSectionHeight = fixedSectionEl.offsetHeight;
      const sectionPositions = [];
      for (let i = 0; i < total; i++) {
        sectionPositions.push(
          fixedSectionTop + (fixedSectionHeight * i) / total,
        );
      }

      function navigateToSection(index) {
        if (index === currentSection || isAnimating || isSnapping) return;
        enableAudio();
        playSound("click");
        isSnapping = true;
        changeSection(index);
        lenis.scrollTo(sectionPositions[index], {
          duration: snapScrollDuration,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          lock: true,
          onComplete: () => (isSnapping = false),
        });
      }

      artists.forEach((el, i) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          navigateToSection(i);
        });
        el.addEventListener("mouseenter", () => {
          enableAudio();
          playSound("hover");
        });
      });
      categories.forEach((el, i) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          navigateToSection(i);
        });
        el.addEventListener("mouseenter", () => {
          enableAudio();
          playSound("hover");
        });
      });

      const onceClick = () => enableAudio();
      document.addEventListener("click", onceClick, { once: true });

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
            ease: `customEase-${uid}`,
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
          playSound("textChange", 250);
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
            ease: `customEase-${uid}`,
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
                ease: `customEase-${uid}`,
              });
            } else {
              gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(0 0 100% 0)" });
              gsap.to(bg, {
                clipPath: "inset(0 0 0% 0)",
                duration: transitionDuration,
                ease: `customEase-${uid}`,
              });
            }
            bg.classList.add("active");
          } else if (i === previousSection) {
            bg.classList.add("previous");
            gsap.to(bg, {
              y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
              duration: transitionDuration,
              ease: `customEase-${uid}`,
            });
            gsap.to(bg, {
              opacity: 0,
              delay: transitionDuration * 0.5,
              duration: transitionDuration * 0.5,
              ease: `customEase-${uid}`,
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
              ease: `customEase-${uid}`,
            });
          }
        });

        artists.forEach((el, i) => {
          if (i === newSection) {
            el.classList.add("active");
            gsap.to(el, { opacity: 1, duration: 0.3, ease: "power2.out" });
          } else {
            el.classList.remove("active");
            gsap.to(el, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
          }
        });
        categories.forEach((el, i) => {
          if (i === newSection) {
            el.classList.add("active");
            gsap.to(el, { opacity: 1, duration: 0.3, ease: "power2.out" });
          } else {
            el.classList.remove("active");
            gsap.to(el, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
          }
        });
      }

      const loadingOverlay = root.querySelector(`#loading-overlay-${uid}`);
      const loadingCounter = root.querySelector(`#loading-counter-${uid}`);

      function animateColumns() {
        artists.forEach((el, i) =>
          setTimeout(() => el.classList.add("loaded"), i * 60),
        );
        categories.forEach((el, i) =>
          setTimeout(() => el.classList.add("loaded"), i * 60 + 200),
        );
      }

      if (showLoader && loadingOverlay && loadingCounter) {
        let counter = 0;
        const counterInterval = setInterval(() => {
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
              gsap.to(loadingOverlay.querySelector("span.loading-label"), {
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
          loadingCounter.textContent = `[${counter.toFixed(0).padStart(2, "0")}]`;
        }, loaderDuration);
      } else {
        if (loadingOverlay) loadingOverlay.style.display = "none";
        animateColumns();
      }

      mainTrigger = ScrollTrigger.create({
        trigger: `#fixed-section-${uid}`,
        start: "top top",
        end: "bottom bottom",
        pin: `#fixed-container-${uid}`,
        pinSpacing: true,
        onUpdate: (self) => {
          if (isSnapping) return;
          const progress = self.progress;
          const targetSection = Math.min(
            total - 1,
            Math.floor(progress * total),
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
          lastProgress = progress;
          if (debugInfo) {
            debugInfo.textContent = `Section: ${currentSection}, Progress: ${progress.toFixed(3)}`;
          }
        },
      });

      progressTrigger = ScrollTrigger.create({
        trigger: `#scroll-container-${uid}`,
        start: "top top",
        end: "bottom bottom",
      });

      endTrigger = ScrollTrigger.create({
        trigger: `#end-section-${uid}`,
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

      keyHandler = (e) => {
        if (e.key.toLowerCase() === "h" && debugInfo) {
          debugInfo.style.display =
            debugInfo.style.display === "none" ? "block" : "none";
        }
      };
      document.addEventListener("keydown", keyHandler);

      cleanupMain = () => {
        document.removeEventListener("click", onceClick);
        document.removeEventListener("keydown", keyHandler);
        mainTrigger?.kill();
        progressTrigger?.kill();
        endTrigger?.kill();
        gsap.ticker.remove(raf);
        lenis?.destroy();
        Object.values(soundsRef.current).forEach((a) => a.pause());
      };
    }

    init();

    return () => {
      destroyed = true;
      cleanupMain();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const soundToggleClick = () => {
    soundOn.current = !soundOn.current;
    const btn = document.getElementById(`sound-toggle-${uid}`);
    if (btn) btn.classList.toggle("disabled", !soundOn.current);
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      style={{ fontFamily, "--cps-text": textColor, "--cps-bg": bgColor }}
    >
      <style>{`
        #root-${uid} .word-mask { display: inline-block; overflow: hidden; vertical-align: middle; }
        #root-${uid} .split-word { display: inline-block; vertical-align: middle; }
        #root-${uid} .bg-image-${uid} { position: absolute; top: -10%; left: 0; width: 100%; height: 120%; object-fit: cover; opacity: 0; filter: brightness(0.8); will-change: transform; transform-origin: center center; }
        #root-${uid} .bg-image-${uid}.active { opacity: 1; z-index: 2; }
        #root-${uid} .bg-image-${uid}.previous { opacity: 1; z-index: 1; }
        #root-${uid} .featured-content-${uid} { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; }
        #root-${uid} .featured-content-${uid}.active { opacity: 1; visibility: visible; }
        #root-${uid} .featured-content-${uid} h3 { white-space: nowrap; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; margin: 0; font-weight: 500; color: var(--cps-text); }
        #root-${uid} .artist-${uid}, #root-${uid} .category-${uid} { opacity: 0; transform: translateY(20px); transition: all 0.5s cubic-bezier(0.16,1,0.3,1); color: var(--cps-text); cursor: pointer; position: relative; }
        #root-${uid} .artist-${uid}:hover, #root-${uid} .category-${uid}:hover { opacity: 1 !important; }
        #root-${uid} .artist-${uid}.loaded, #root-${uid} .category-${uid}.loaded { opacity: 0.3; transform: translateY(0); }
        #root-${uid} .artist-${uid}.active { opacity: 1; transform: translateX(10px); padding-left: 15px; }
        #root-${uid} .artist-${uid}.active::before { content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; background-color: var(--cps-text); border-radius: 50%; }
        #root-${uid} .category-${uid}.active { opacity: 1; transform: translateX(-10px); padding-right: 15px; }
        #root-${uid} .category-${uid}.active::after { content: ""; position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; background-color: var(--cps-text); border-radius: 50%; }
        #root-${uid} .blur-${uid} { filter: blur(8px); opacity: 0.3; transition: filter 0.8s ease, opacity 0.8s ease; }
        #root-${uid} .footer-${uid}.blur, #root-${uid} .left-col-${uid}.blur, #root-${uid} .right-col-${uid}.blur, #root-${uid} .featured-${uid}.blur { filter: blur(8px); opacity: 0.3; transition: filter 0.8s ease, opacity 0.8s ease; }
        #root-${uid} .sound-dot-${uid}.animated { animation: cps-expand-${uid} 2s ease-out infinite; }
        #root-${uid} .sound-dot-${uid}.animated:nth-child(2) { animation-delay: 0.5s; }
        #root-${uid} .sound-dot-${uid}.animated:nth-child(3) { animation-delay: 1s; }
        #root-${uid} .sound-dot-${uid}.animated:nth-child(4) { animation-delay: 1.5s; }
        #root-${uid} .sound-toggle-${uid}.disabled .sound-dot-${uid}.animated { animation: none; width: 4px; height: 4px; opacity: 0.3; }
        @keyframes cps-expand-${uid} { 0% { width:4px; height:4px; opacity:1; } 100% { width:20px; height:20px; opacity:0; } }
        @media (max-width: 768px) {
          #root-${uid} .content-${uid} { flex-direction: column; gap: 5vh; }
          #root-${uid} .left-col-${uid}, #root-${uid} .right-col-${uid}, #root-${uid} .featured-${uid} { width: 100%; text-align: center; }
          #root-${uid} .featured-${uid} { font-size: 3vw; order: -1; margin-bottom: 2vh; }
          #root-${uid} .header-${uid}, #root-${uid} .footer-${uid} { font-size: 15vw; }
        }
      `}</style>

      <div id={`root-${uid}`}>
        <div
          id={`loading-overlay-${uid}`}
          className="fixed inset-0 flex items-center justify-center z-[9999] text-lg uppercase tracking-tight"
          style={{ backgroundColor: bgColor, color: "#000" }}
        >
          <span className="loading-label">Loading</span>
          <span id={`loading-counter-${uid}`} className="ml-2">
            [00]
          </span>
        </div>

        {enableSound && (
          <button
            id={`sound-toggle-${uid}`}
            onClick={soundToggleClick}
            aria-label="Toggle sound"
            className={`sound-toggle-${uid} fixed top-5 right-5 w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center z-[1000] transition-all backdrop-blur-md hover:bg-white/15 hover:border-white/30 hover:scale-105 disabled`}
          >
            <div className="relative w-1 h-1">
              <span
                className={`sound-dot-${uid} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full`}
              />
              <span
                className={`sound-dot-${uid} animated absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full`}
              />
              <span
                className={`sound-dot-${uid} animated absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full`}
              />
              <span
                className={`sound-dot-${uid} animated absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full`}
              />
            </div>
          </button>
        )}

        {showDebug && (
          <div
            id={`debug-info-${uid}`}
            className="fixed bottom-2.5 right-2.5 bg-white/70 text-black px-2.5 py-2.5 text-xs font-mono z-[9000]"
          >
            Current Section: 0
          </div>
        )}

        <div
          id={`scroll-container-${uid}`}
          className="relative"
          style={{ backgroundColor: bgColor }}
        >
          <div
            id={`fixed-section-${uid}`}
            className="relative"
            style={{
              height: `${sectionScrollVh * sections.length}vh`,
              backgroundColor: bgColor,
            }}
          >
            <div
              id={`fixed-container-${uid}`}
              className="sticky top-0 left-0 w-full h-screen overflow-hidden"
              style={{
                willChange: "transform, height",
                transformOrigin: "top center",
                backgroundColor: bgColor,
              }}
            >
              <div className="absolute inset-0 z-[1] overflow-hidden bg-black">
                {sections.map((s, i) => (
                  <img
                    key={i}
                    src={s.image}
                    alt={s.artist}
                    className={`bg-image-${uid}${i === 0 ? " active" : ""}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-12 gap-4 px-8 h-full relative z-[2]">
                <div
                  id={`header-${uid}`}
                  className={`header-${uid} col-span-12 self-start pt-[5vh] text-center leading-[0.8] uppercase font-medium`}
                  style={{
                    fontSize: "8vw",
                    color: textColor,
                    willChange: "transform, filter, opacity",
                  }}
                >
                  {headerLines.map((line, i) => (
                    <div key={i} className="block">
                      {line}
                    </div>
                  ))}
                </div>

                <div
                  id={`content-${uid}`}
                  className={`content-${uid} col-span-12 flex justify-between items-center w-full absolute left-0 px-8`}
                  style={{
                    top: "50%",
                    willChange: "transform",
                  }}
                >
                  <div
                    id={`left-column-${uid}`}
                    className={`left-col-${uid} w-2/5 flex flex-col gap-1 text-left uppercase`}
                    style={{
                      willChange: "filter, opacity",
                      transition: "filter 0.5s ease, opacity 0.5s ease",
                    }}
                  >
                    {sections.map((s, i) => (
                      <div
                        key={i}
                        className={`artist-${uid}${i === 0 ? " active" : ""}`}
                        data-index={i}
                      >
                        {s.artist}
                      </div>
                    ))}
                  </div>

                  <div
                    id={`featured-${uid}`}
                    className={`featured-${uid} w-1/5 flex justify-center items-center text-center relative overflow-hidden uppercase`}
                    style={{
                      fontSize: "1.5vw",
                      height: "10vh",
                      willChange: "filter, opacity",
                      transition: "filter 0.5s ease, opacity 0.5s ease",
                    }}
                  >
                    {sections.map((s, i) => (
                      <div
                        key={i}
                        className={`featured-content-${uid}${i === 0 ? " active" : ""}`}
                        data-index={i}
                      >
                        <h3>{s.featured}</h3>
                      </div>
                    ))}
                  </div>

                  <div
                    id={`right-column-${uid}`}
                    className={`right-col-${uid} w-2/5 flex flex-col gap-1 text-right uppercase`}
                    style={{
                      willChange: "filter, opacity",
                      transition: "filter 0.5s ease, opacity 0.5s ease",
                    }}
                  >
                    {sections.map((s, i) => (
                      <div
                        key={i}
                        className={`category-${uid}${i === 0 ? " active" : ""}`}
                        data-index={i}
                      >
                        {s.category}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  id={`footer-${uid}`}
                  className={`footer-${uid} col-span-12 self-end pb-[5vh] text-center leading-[0.8] uppercase font-medium`}
                  style={{
                    willChange: "transform, filter, opacity",
                    transition: "filter 0.5s ease, opacity 0.5s ease",
                  }}
                >
                  <div
                    className="w-40 h-px mx-auto mt-[2vh] relative"
                    style={{ backgroundColor: "rgba(245,245,245,0.3)" }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 flex justify-between text-xs -translate-y-1/2 uppercase"
                      style={{
                        color: textColor,
                        fontFamily,
                        margin: "0 -25px",
                      }}
                    >
                      <span id={`current-section-${uid}`}>01</span>
                      <span>{sections.length.toString().padStart(2, "0")}</span>
                    </div>
                    <div
                      id={`progress-fill-${uid}`}
                      className="absolute top-0 left-0 h-full w-0"
                      style={{
                        backgroundColor: textColor,
                        transition: "width 0.3s cubic-bezier(0.65,0,0.35,1)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id={`end-section-${uid}`}
            className="relative h-screen flex items-center justify-center text-3xl"
            style={{ backgroundColor: bgColor }}
          ></div>
        </div>
      </div>
    </div>
  );
}
