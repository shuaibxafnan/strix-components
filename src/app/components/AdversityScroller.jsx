"use client";

import { useEffect, useId, useMemo, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=1600&q=80",
];

const DEFAULT_FONT_FACES = [
  {
    family: "Blackout Midnight",
    woff2:
      "https://cdn.jsdelivr.net/fontsource/fonts/blackout-midnight@latest/latin-400-normal.woff2",
  },
];

const DEFAULT_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Anton&family=Bungee+Shade&family=Monoton&family=Orbitron:wght@900&family=Pixelify+Sans:wght@700&family=Rubik+Glitch&family=Rubik+Mono+One&display=swap";

const DEFAULT_FONTS = [
  '"Blackout Midnight", Anton, sans-serif',
  '"Rubik Glitch", system-ui, sans-serif',
  '"Rubik Mono One", sans-serif',
  '"Bungee Shade", sans-serif',
  '"Monoton", cursive',
  '"Orbitron", sans-serif',
  '"Pixelify Sans", sans-serif',
  '"Orbitron", sans-serif',
  '"Monoton", cursive',
];

const DEFAULT_TEXTS = [
  {
    heading: "Heart of adversity",
    body: "In the heart of adversity, the patient dragon reveals the alchemy of strength: to endure the fiercest storms with unwavering calm, for within the crucible of patience, resilience is forged into an indomitable force.",
  },
  {
    heading: "Caverns of introspection",
    body: "Within the caverns of introspection, the patient dragon discovers the treasures of self-awareness, teaching that the journey inward, undertaken with deliberate slowness, unveils the hidden jewels of enlightenment, shimmering in the recesses of the soul.",
  },
  {
    heading: "Seasons change",
    body: "As the seasons change, so does the patient dragon adapt, its scales reflecting the myriad hues of nature's cycle. It imparts the lesson that, in embracing the ebb and flow of life's transitions, one discovers a harmonious dance with the cosmic rhythms that shape the universe.",
  },
  {
    heading: "Mist-shrouded valleys",
    body: "Through the mist-shrouded valleys, the patient dragon soars, leaving ephemeral trails of wisdom in its wake. It reveals that, like the ever-shifting mists, the only constant is change, and in patiently navigating the ethereal currents, one finds clarity in the midst of life's uncertainties.",
  },
  {
    heading: "The world below",
    body: "High atop the cliffs, the patient dragon observes the world below with eyes that mirror the vastness of the cosmos. From this celestial vantage point, it imparts the understanding that true vision arises not from a gaze fixed on the horizon but from a gaze that encompasses the boundless expanse of the present moment.",
  },
  {
    heading: "Serene sanctuary",
    body: "In the serene sanctuary of the Patient Dragon, where ancient whispers met the modern hum, Li\u00FAl\u00F3ng embraced tranquility amidst the chaos. Opting for a path less hurried, the dragon migrated to a decentralized haven where diversity bloomed, and open discourse prevailed.",
  },
  {
    heading: "Calm scales",
    body: "With calm scales, it soared into a digital realm echoing the patient strength found in interconnected communities, a sanctuary far from the clamor of mainstream platforms.",
  },
  {
    heading: "Silent narrative",
    body: "In the silent narrative woven by the patient dragon, a reminder emerges, that the hands of experience, marked by the passage of time, sculpt the spirit into a vessel of enduring strength, capable of navigating the ever-shifting currents of the cosmic dance.",
  },
];

const SECTIONS = [
  {
    word: "Xogoxy",
    fontSlot: 6,
    weight: 700,
    size: "30vw",
    layout: "half",
    clips: 2,
    offsetX: "10%",
    offsetY: "10%",
    build: ({ gsap, clips, posters, inners, trigger }) => {
      clips.forEach((clipEl, pos) => {
        gsap
          .timeline({ scrollTrigger: trigger(posters[pos]) })
          .fromTo(
            clipEl,
            { xPercent: pos === 0 ? 40 : -80 },
            { ease: "none", xPercent: pos === 0 ? -40 : 20 },
            0,
          )
          .fromTo(
            inners[pos],
            { xPercent: pos === 0 ? -5 : 5, yPercent: pos === 0 ? -5 : 5 },
            { xPercent: pos === 0 ? 5 : -5, yPercent: pos === 0 ? 5 : -5 },
            0,
          );
      });
    },
  },
  {
    word: "XogoxyenuxXogoxyenux",
    fontSlot: 0,
    size: "30vw",
    layout: "half",
    clips: 2,
    offsetX: "10%",
    offsetY: "10%",
    build: ({ gsap, clips, posters, inners, trigger }) => {
      clips.forEach((clipEl, pos) => {
        const texts = clipEl.querySelectorAll("text");
        gsap
          .timeline({ scrollTrigger: trigger(posters[pos]) })
          .fromTo(
            clipEl,
            { xPercent: pos === 0 ? 0 : -100 },
            { ease: "none", xPercent: pos === 0 ? -100 : 0 },
            0,
          )
          .fromTo(
            posters[pos],
            { filter: "brightness(200%)", skewX: pos === 0 ? -5 : 5 },
            {
              ease: "sine",
              filter: "brightness(15%)",
              skewX: pos === 0 ? 5 : -5,
            },
            0,
          )
          .fromTo(inners[pos], { scale: 2.7 }, { scale: 1 }, 0)
          .fromTo(
            texts,
            {
              transformOrigin: pos ? "50% 100%" : "50% 0%",
              scaleX: 0.8,
              scaleY: 0,
            },
            {
              duration: 0.2,
              stagger: pos ? -0.01 : 0.01,
              scaleX: 1,
              scaleY: 1,
            },
            0,
          );
      });
    },
  },
  {
    word: "Momoso",
    fontSlot: 1,
    size: "30vw",
    layout: "full",
    clips: 1,
    centered: true,
    upper: true,
    swapImages: 3,
    build: ({ gsap, clips, posters, inners, trigger, swapUrls }) => {
      const texts = clips[0].querySelectorAll("text");
      let currentIndex = 0;

      gsap
        .timeline({
          scrollTrigger: {
            ...trigger(posters[0]),
            end: "bottom top+=25%",
            onUpdate: (st) => {
              if (!swapUrls.length) return;
              const sectionLength = 1 / swapUrls.length;
              const index = Math.floor(st.progress / sectionLength);
              const url = swapUrls[Math.min(index, swapUrls.length - 1)];
              if (index !== currentIndex) {
                currentIndex = index;
                gsap.killTweensOf(inners);
                gsap.timeline().fromTo(
                  inners,
                  { filter: "brightness(100%)" },
                  {
                    duration: 0.3,
                    ease: "sine.in",
                    filter: "brightness(0%)",
                    onComplete: () => {
                      inners[0].style.backgroundImage = `url(${url})`;
                      gsap.to(inners, {
                        duration: 1,
                        ease: "power1",
                        filter: "brightness(100%)",
                      });
                    },
                  },
                );
              }
            },
          },
        })
        .fromTo(clips, { xPercent: 80 }, { ease: "none", xPercent: -120 }, 0)
        .fromTo(
          texts,
          { transformOrigin: "100% 75%", xPercent: 100, rotation: 10 },
          { duration: 0.2, stagger: 0.05, xPercent: 0, rotation: 0 },
          0,
        );
    },
  },
  {
    word: "nonon",
    fontSlot: 2,
    size: "50vw",
    layout: "full",
    clips: 1,
    centered: true,
    offsetX: "20%",
    build: ({ gsap, clips, posters, inners, trigger }) => {
      const texts = clips[0].querySelectorAll("text");
      gsap
        .timeline({ scrollTrigger: trigger(posters[0]) })
        .fromTo(clips, { xPercent: 160 }, { ease: "none", xPercent: -160 }, 0)
        .fromTo(
          inners[0],
          { xPercent: -10, filter: "hue-rotate(190deg) contrast(600%)" },
          { xPercent: 10, filter: "hue-rotate(0deg) contrast(100%)" },
          0,
        )
        .fromTo(
          texts,
          { transformOrigin: "50% 100%", scaleY: 0 },
          { duration: 0.3, ease: "expo.inOut", stagger: 0.05, scaleY: 1 },
          0,
        )
        .fromTo(
          texts,
          { skewX: -25 },
          {
            duration: 0.3,
            ease: "sine.in",
            stagger: 0.05,
            skewX: 25,
            opacity: 0,
          },
          0,
        );
    },
  },
  {
    word: "soxos",
    fontSlot: 3,
    size: "50vw",
    layout: "full",
    clips: 1,
    centered: true,
    build: ({ gsap, clips, posters, inners, trigger }) => {
      const texts = clips[0].querySelectorAll("text");
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: trigger(posters[0]),
        })
        .fromTo(clips, { xPercent: 160 }, { xPercent: -160 }, 0)
        .fromTo(
          posters,
          { transformOrigin: "-50% 50%", rotation: -5 },
          { rotation: 10 },
          0,
        )
        .fromTo(inners, { scale: 3 }, { scale: 1 }, 0)
        .fromTo(
          texts,
          {
            transformOrigin: "0% 50%",
            rotation: -45,
            yPercent: -10,
            scale: 0.1,
          },
          {
            duration: 0.3,
            ease: "power1",
            stagger: 0.05,
            rotation: 0,
            scale: 1,
            yPercent: 0,
            xPercent: 0,
          },
          0,
        );
    },
  },
  {
    word: "byosox",
    fontSlot: 4,
    size: "50vw",
    layout: "full",
    clips: 1,
    centered: true,
    fixed: true,
    build: ({ gsap, clips, posters, trigger }) => {
      const texts = clips[0].querySelectorAll("text");
      gsap
        .timeline({ scrollTrigger: trigger(posters[0]) })
        .fromTo(clips, { xPercent: 20 }, { ease: "none", xPercent: -70 }, 0)
        .fromTo(
          texts,
          {
            transformOrigin: "150% 50%",
            scaleX: 0.25,
            opacity: 0,
            xPercent: 100,
          },
          {
            duration: 0.15,
            ease: "power1",
            stagger: 0.05,
            scaleX: 1,
            xPercent: 0,
            opacity: 1,
          },
          0,
        )
        .fromTo(
          posters,
          { filter: "saturate(15)" },
          { filter: "saturate(0)" },
          0,
        );
    },
  },
  {
    word: "kelpforests",
    fontSlot: 5,
    weight: 900,
    size: "30vw",
    layout: "full",
    clips: 1,
    centered: true,
    build: ({ gsap, clips, posters, trigger, sectionEl }) => {
      const texts = clips[0].querySelectorAll("text");
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: trigger(posters[0]),
        })
        .fromTo(
          sectionEl,
          { filter: "drop-shadow(-100px -20px 5px #6b0c0c)" },
          { filter: "drop-shadow(100px 20px 20px #2a1554)" },
          0,
        )
        .fromTo(clips, { xPercent: 140 }, { xPercent: -140 }, 0)
        .fromTo(
          texts,
          { transformOrigin: "0% 50%", rotation: -45, scale: 0, opacity: 0 },
          {
            duration: 0.25,
            ease: "expo.inOut",
            stagger: 0.03,
            rotation: 0,
            scale: 1,
            xPercent: 0,
            opacity: 1,
          },
          0,
        );
    },
  },
  {
    word: "momom",
    fontSlot: 8,
    size: "30vw",
    layout: "full",
    clips: 1,
    centered: true,
    upper: true,
    weight: 900,
    video: true,
    build: ({ gsap, clips, posters, inners, trigger }) => {
      const texts = clips[0].querySelectorAll("text");
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: trigger(posters[0]),
        })
        .fromTo(clips, { xPercent: 50 }, { xPercent: -50 }, 0)
        .fromTo(
          posters,
          { filter: "brightness(140%) hue-rotate(300deg)", rotation: -7 },
          { filter: "brightness(10%) hue-rotate(0deg)", rotation: 7 },
          0,
        )
        .fromTo(inners, { scale: 1 }, { scale: 1.2 }, 0)
        .fromTo(
          texts,
          { transformOrigin: "0% 0%", scaleX: 1 },
          {
            ease: "none",
            scale: () => gsap.utils.random(0, 0.5),
            yPercent: () => gsap.utils.random(-40, 40),
            rotation: () => gsap.utils.random(-15, 15),
          },
          0,
        );
    },
  },
];

const SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js",
];

const LENIS_URL =
  "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js";

export default function AdversityScroller({
  sections = SECTIONS,
  images = DEFAULT_IMAGES,
  texts = DEFAULT_TEXTS,
  words = null,
  heading = ["On-Scroll", "Text Clip-Path", "Animations"],
  videoSrc = null,
  bgColor = "#0f0e0e",
  textColor = "#f3f3f3",
  headingGradient = ["#e35384", "#e8a53c"],
  fonts = DEFAULT_FONTS,
  fontFaces = DEFAULT_FONT_FACES,
  fontUrl = DEFAULT_FONT_URL,
  bodyFont = 'Georgia, "Times New Roman", serif',
  baseFontSize = "16px",
  sizeScale = 1,
  posterHeight = "100vh",
  halfHeight = "28vw",
  sectionGap = "15vh",
  proseSize = "clamp(1.5rem, 5vw, 2.25rem)",
  proseMaxWidth = "950px",
  smoothScroll = true,
  lerp = 0.2,
  scrub = true,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `stc-${uid}`;
  const rootRef = useRef(null);

  const model = useMemo(() => {
    let imgIndex = 0;
    return sections.map((section, i) => {
      const override = words?.[i];
      const resolvedWords = Array.isArray(override)
        ? override
        : typeof override === "string"
          ? [override]
          : section.words || [section.word];
      const clipCount = section.clips || 1;
      const swapCount = section.swapImages || 0;

      const posterImages = Array.from(
        { length: clipCount },
        () => images[imgIndex++ % images.length],
      );
      const swapUrls = Array.from(
        { length: swapCount },
        () => images[imgIndex++ % images.length],
      );

      return {
        ...section,
        index: i,
        words: resolvedWords,
        clipCount,
        posterImages,
        swapUrls,
        font: fonts[section.fontSlot % fonts.length],
      };
    });
  }, [sections, images, fonts, words]);

  /* @font-face cannot be expressed in Tailwind, so this is the one stylesheet left */
  const faceCss = useMemo(
    () =>
      fontFaces
        .map((f) => {
          const srcs = [
            f.woff2 ? `url('${f.woff2}') format('woff2')` : null,
            f.woff ? `url('${f.woff}') format('woff')` : null,
            f.otf ? `url('${f.otf}') format('opentype')` : null,
            f.ttf ? `url('${f.ttf}') format('truetype')` : null,
          ]
            .filter(Boolean)
            .join(", ");
          if (!srcs) return "";
          return `@font-face { font-family: '${f.family}'; src: ${srcs}; font-weight: ${f.weight || "normal"
            }; font-style: ${f.style || "normal"}; font-display: swap; }`;
        })
        .filter(Boolean)
        .join("\n"),
    [fontFaces],
  );

  useEffect(() => {
    let killed = false;
    let lenis;
    let rafId;

    const loadStyle = (href) => {
      if (!href || document.querySelector(`link[data-id="${href}"]`)) return;
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      el.setAttribute("data-id", href);
      document.head.appendChild(el);
    };

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

    const boot = async () => {
      loadStyle(fontUrl);
      for (const src of SCRIPTS) await loadScript(src);
      if (smoothScroll) await loadScript(LENIS_URL).catch(() => { });
      if (killed || !rootRef.current) return;

      const { gsap, ScrollTrigger, imagesLoaded } = window;
      if (!gsap || !ScrollTrigger || !imagesLoaded) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.config({ trialWarn: false });

      const root = rootRef.current;

      if (smoothScroll && window.Lenis) {
        lenis = new window.Lenis({ lerp, smoothWheel: true });
        lenis.on("scroll", () => ScrollTrigger.update());
        const scrollFn = (time) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(scrollFn);
        };
        rafId = requestAnimationFrame(scrollFn);
      }

      const trigger = (el) => ({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: scrub ? true : false,
      });

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      if (killed) return;

      model.forEach((section) => {
        const sectionEl = root.querySelector(
          `[data-stc-section="${section.index}"]`,
        );
        if (!sectionEl) return;

        const clips = [...sectionEl.querySelectorAll("clipPath")];
        const posters = [...sectionEl.querySelectorAll(".stc-poster")];
        const inners = [...sectionEl.querySelectorAll(".stc-inner")];
        if (!clips.length || !posters.length) return;

        section.build({
          gsap,
          clips,
          posters,
          inners,
          trigger,
          sectionEl,
          swapUrls: section.swapUrls,
        });
      });

      ScrollTrigger.refresh();

      imagesLoaded(
        root.querySelectorAll(".stc-inner"),
        { background: true },
        () => {
          if (killed) return;
          gsap.to(root, { duration: 0.4, opacity: 1, ease: "power2" });
          ScrollTrigger.refresh();
        },
      );
    };

    boot().catch(() => { });

    return () => {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
      if (window.ScrollTrigger && rootRef.current) {
        window.ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger && rootRef.current.contains(st.trigger)) st.kill();
        });
      }
    };
  }, [model, smoothScroll, lerp, scrub, fontUrl, faceCss]);

  const renderClip = (section, clipIndex, word) => {
    const id = `${scope}-clip-${section.index}-${clipIndex}`;
    const chars = [...word];
    const isColumn = section.layout === "column";
    const tracking = section.tracking ?? 1;

    const textStyle = {
      fontFamily: section.font,
      fontSize: `calc(${section.size} * ${sizeScale})`,
      textTransform: section.upper ? "uppercase" : undefined,
      fontWeight: section.weight || undefined,
    };

    return (
      <clipPath id={id} key={id}>
        {chars.map((ch, i) =>
          isColumn ? (
            <text
              key={`${id}-${i}`}
              x="50%"
              y={`${i + 1}em`}
              dominantBaseline="middle"
              textAnchor="middle"
              style={textStyle}
            >
              {ch}
            </text>
          ) : (
            <text
              key={`${id}-${i}`}
              x={`${i * tracking}ch`}
              y={section.centered ? "50%" : "0.95em"}
              dominantBaseline={section.centered ? "middle" : undefined}
              textAnchor={section.centered ? "middle" : undefined}
              style={textStyle}
            >
              {ch}
            </text>
          ),
        )}
      </clipPath>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`${scope} w-full overflow-x-hidden bg-[var(--stc-bg)] font-[family-name:var(--stc-body)] text-[length:var(--stc-base)] text-[color:var(--stc-fg)] antialiased opacity-0`}
      style={{
        "--stc-bg": bgColor,
        "--stc-fg": textColor,
        "--stc-body": bodyFont,
        "--stc-base": baseFontSize,
        "--stc-g1": headingGradient[0],
        "--stc-g2": headingGradient[1],
        "--stc-poster": posterHeight,
        "--stc-half": halfHeight,
        "--stc-gap": sectionGap,
        "--stc-prose-size": proseSize,
        "--stc-prose-w": proseMaxWidth,
      }}
    >
      {faceCss ? <style dangerouslySetInnerHTML={{ __html: faceCss }} /> : null}

      {heading.length ? (
        <header className="relative z-[1000] px-12 py-8">
          <h1 className="mt-8 text-[clamp(2rem,10vw,4rem)] font-thin leading-none">
            {heading.map((line, i) => (
              <span key={`${uid}-h${i}`}>
                {line}
                {i < heading.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
        </header>
      ) : null}

      {model.map((section, i) => (
        <div key={`${uid}-wrap${i}`}>
          <div
            data-stc-section={section.index}
            className={
              section.layout === "column"
                ? "relative mx-auto my-[var(--stc-gap)] flex min-h-[60vh] justify-center"
                : "relative mx-auto my-[var(--stc-gap)] grid min-h-[60vh] place-items-center"
            }
          >
            {section.layout === "column" ? (
              section.words.map((word, c) => (
                <div key={`${uid}-col${i}-${c}`} className="relative">
                  <svg className="pointer-events-none relative h-[50vh] w-[50vw] overflow-visible opacity-0 min-[53em]:w-[25vw]">
                    {renderClip(section, c, word)}
                  </svg>
                  <div
                    className="stc-poster grid h-[200vh] w-[50vw] place-items-center min-[53em]:w-[25vw]"
                    style={{
                      clipPath: `url(#${scope}-clip-${section.index}-${c})`,
                    }}
                  >
                    <div
                      className="stc-inner h-full w-full bg-cover bg-[50%_50%]"
                      style={{
                        backgroundImage: `url(${section.posterImages[c]})`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <>
                <svg className="pointer-events-none absolute h-screen w-full overflow-visible opacity-0">
                  {Array.from({ length: section.clipCount }, (_, c) =>
                    renderClip(section, c, section.words[0]),
                  )}
                </svg>
                {Array.from({ length: section.clipCount }, (_, c) => (
                  <div
                    key={`${uid}-p${i}-${c}`}
                    className={`stc-poster grid w-full place-items-center ${section.layout === "half"
                        ? "h-[var(--stc-half)]"
                        : "h-[var(--stc-poster)]"
                      }`}
                    style={{
                      clipPath: `url(#${scope}-clip-${section.index}-${c})`,
                      "--offset-x": section.offsetX || "0%",
                      "--offset-y": section.offsetY || "0%",
                    }}
                  >
                    {section.video && videoSrc ? (
                      <div className="stc-inner h-[calc(100%_+_var(--offset-y,0%)_*_2)] w-[calc(100%_+_var(--offset-x,0%)_*_2)]">
                        <video
                          className="h-full w-full object-cover"
                          preload="auto"
                          muted
                          autoPlay
                          loop
                          playsInline
                        >
                          <source src={videoSrc} />
                        </video>
                      </div>
                    ) : (
                      <div
                        className={`stc-inner h-[calc(100%_+_var(--offset-y,0%)_*_2)] w-[calc(100%_+_var(--offset-x,0%)_*_2)] bg-cover bg-[50%_50%] ${section.fixed ? "bg-fixed" : ""
                          }`}
                        style={{
                          backgroundImage: `url(${section.posterImages[c]})`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {texts[i] ? (
            <div className="ml-auto grid min-h-[60vh] max-w-[var(--stc-prose-w)] content-center px-[10vw]">
              <h4 className="mb-4 bg-[linear-gradient(172deg,var(--stc-g1),var(--stc-g2))] bg-clip-text font-sans text-transparent">
                {texts[i].heading}
              </h4>
              <p className="m-0 text-[length:var(--stc-prose-size)] font-light leading-tight">
                {texts[i].body}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}