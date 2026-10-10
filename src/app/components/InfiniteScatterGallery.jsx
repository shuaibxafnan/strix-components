"use client";

import { useEffect, useId, useMemo, useRef } from "react";

// ─── InfiniteScrollGallery ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    [...]       Slides {image, caption, title, description, stagger, width}
// bgColor            string   #eaeeed     Page background
// textColor          string   #9b9b9b     Base text / caption color
// linkColor          string   #9b9b9b     Frame link color
// linkHoverColor     string   #000000     Frame link hover color
// titleColor         string   #141414     Detail view title color
// backColor          string   #111111     Back button color
// headingFont        string   Georgia..   Font stack for the detail title
// bodyFont           string   Inter..     Font stack for everything else
// frameTitle         string   "Infinite…" Small heading in the top frame
// frameLinks         array    [...]       Frame link labels (strings)
// frameTags          array    [...]       Frame tag labels (strings)
// backLabel          string   "← back…"   Text of the detail close button
// gallerySpacing     string   12vh        Vertical gap between slides
// galleryPaddingTop  string   14vh        Space above the first slide
// slideAspect        number   0.8         Aspect ratio (w/h) of every image
// imgScale           number   1.2         Resting zoom inside each frame
// parallaxSpeeds     array    [...]       Per-slide travel multipliers, cycled
// scrubDuration      number   0.75        Inertia settle time (s)
// scrubEase          string   power3.out  Easing of the inertia
// scrollSpeed        number   100          Pixels of travel per playhead second
// revealStagger      number   0.12        Delay between entering slides (s)
// revealDuration     number   1           Image fade-in duration (s)
// charStagger        number   0.025       Caption per-character stagger (s)
// openDuration       number   1.2         Thumbnail-to-detail morph time (s)
// openEase           string   power4.inOut Easing of the opening morph
// closeDuration      number   1           Detail-to-thumbnail morph time (s)
// closeEase          string   power3.inOut Easing of the closing morph
// textStagger        number   0.012       Detail text per-character stagger (s)
// enableKeyboard     boolean  true        Enter/Space to open, Escape to close
// className          string   ""          Extra classes on the root wrapper
//
// items[] item shape
// ──────────────────────────────────────────────────────────────────────────
// image        string   Image URL for the slide and its detail view
// caption      string   Small label under the thumbnail
// title        string   Large heading in the detail view
// description  string   Body copy in the detail view
// stagger      string   Horizontal offset of the slide, e.g. "-24vw"
// width        string   Thumbnail width, e.g. "290px" or "20vw"
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    caption: "Inherited Light",
    title: "Inherited Light",
    description:
      "Before fences divided the prairie, movement itself was a form of knowledge. The opening image returns to that enduring relationship between travel, land, and identity.",
    stagger: "-24vw",
    width: "290px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    caption: "Red Earth Theory",
    title: "Red Earth Theory",
    description:
      "Every stitch recalls a tradition older than the runway. Handwork has long carried family histories and regional identities, passed from one generation to the next.",
    stagger: "14vw",
    width: "330px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
    caption: "Soft Sovereignty",
    title: "Soft Sovereignty",
    description:
      "Contemporary design refuses to separate heritage from innovation. Bold modern forms coexist with an older understanding: independence begins with defining one's own image.",
    stagger: "-18vw",
    width: "270px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    caption: "Gathering Weather",
    title: "Gathering Weather",
    description:
      "Garments shaped by movement echo a life lived close to changing skies. Clothing has always adapted to the landscape rather than asking the landscape to adapt in return.",
    stagger: "22vw",
    width: "450px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    caption: "Worn Horizon",
    title: "Worn Horizon",
    description:
      "Wildflowers bloom across lands that remember both abundance and loss. Beauty persists quietly, much like the practices that continue to flourish around it.",
    stagger: "-26vw",
    width: "300px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    caption: "The Fifth Fire",
    title: "The Fifth Fire",
    description:
      "Every generation is a keeper of what comes next. Even the simplest object becomes a reminder that renewal begins with care rather than spectacle.",
    stagger: "28vw",
    width: "150px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    caption: "Ancestor Season",
    title: "Ancestor Season",
    description:
      "Community has always embraced many voices rather than one. Individual expression sits comfortably beside collective identity, each strengthening the other.",
    stagger: "-20vw",
    width: "230px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    caption: "A Field Listening",
    title: "A Field Listening",
    description:
      "Red recalls ochre, earth, and trade cloth without belonging to any single tradition. Colour becomes memory carried forward instead of preserved behind glass.",
    stagger: "8vw",
    width: "460px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    caption: "Language of Dust",
    title: "Language of Dust",
    description:
      "Each surviving language offers another way of understanding landscape, kinship, and the passing of seasons. Vocabulary is a form of attention.",
    stagger: "-12vw",
    width: "270px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    caption: "Between Sweetgrass",
    title: "Between Sweetgrass",
    description:
      "Gathered as a symbol of kindness, gratitude, and connection, its gentle presence is a reminder that strength often arrives without raising its voice.",
    stagger: "15vw",
    width: "250px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    caption: "Open Country",
    title: "Open Country",
    description:
      "Portraiture reclaimed on its own terms. The gaze no longer documents something disappearing; it reflects a living culture shaping its own future.",
    stagger: "-24vw",
    width: "390px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    caption: "The Living Ridge",
    title: "The Living Ridge",
    description:
      "The horizon remains one of the oldest teachers. Stories, navigation, and ceremony begin not inside buildings but in relationship with the land itself.",
    stagger: "26vw",
    width: "160px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    caption: "Future Ceremony",
    title: "Future Ceremony",
    description:
      "The answer to attempted erasure is not nostalgia but confident reinvention. What continues is not a copy of what came before.",
    stagger: "-16vw",
    width: "210px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    caption: "Holding the West",
    title: "Holding the West",
    description:
      "Monochrome becomes an act of restraint. Material, silhouette, and story are valued over spectacle, letting craftsmanship speak before symbolism.",
    stagger: "24vw",
    width: "280px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    caption: "The Quiet Treaty",
    title: "The Quiet Treaty",
    description:
      "History remembers agreements; communities remember those who endured them. This portrait looks forward without forgetting the promises still being kept.",
    stagger: "-28vw",
    width: "175px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    caption: "Sky Without Borders",
    title: "Sky Without Borders",
    description:
      "The sky has never recognized the borders drawn across maps. Belonging begins with relationship — to place, to people, and to all living things.",
    stagger: "18vw",
    width: "240px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    caption: "Native Modern",
    title: "Native Modern",
    description:
      "Tradition is not the opposite of modernity. It is the foundation from which modernity grows, and the fastest-evolving work knows it.",
    stagger: "-10vw",
    width: "310px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    caption: "Stone Kinship",
    title: "Stone Kinship",
    description:
      "Stone remembers what people often forget. The landscape is not scenery but a relative, carrying stories older than any written archive.",
    stagger: "20vw",
    width: "260px",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    caption: "Winter Holds",
    title: "Winter Holds",
    description:
      "Survival has always been a form of beauty. Winter demanded ingenuity, patience, and deep communal knowledge — qualities still legible in the work.",
    stagger: "-22vw",
    width: "200px",
  },
];

const DEFAULT_SPEEDS = [1.3, 0.8, 1.15, 0.7, 1.25, 0.85];

const verticalLoop = (gsap, items, config) => {
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  });

  const length = items.length;
  const startY = 0;
  const heights = [];
  const yPercents = [];
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = gsap.utils.snap(1);

  gsap.set(items, {
    yPercent: (i, el) => {
      const h = (heights[i] = parseFloat(gsap.getProperty(el, "height", "px")));
      yPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "y", "px")) / h) * 100 +
          gsap.getProperty(el, "yPercent"),
      );
      return yPercents[i];
    },
  });
  gsap.set(items, { y: 0 });

  const last = items[length - 1];
  const totalHeight =
    last.offsetTop +
    (yPercents[length - 1] / 100) * heights[length - 1] -
    startY +
    last.offsetHeight * gsap.getProperty(last, "scaleY") +
    (parseFloat(config.paddingBottom) || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curY = (yPercents[i] / 100) * heights[i];
    const distanceToStart = item.offsetTop + curY - startY;
    const distanceToLoop =
      distanceToStart + heights[i] * gsap.getProperty(item, "scaleY");

    tl.to(
      item,
      {
        yPercent: snap(((curY - distanceToLoop) / heights[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    ).fromTo(
      item,
      {
        yPercent: snap(
          ((curY - distanceToLoop + totalHeight) / heights[i]) * 100,
        ),
      },
      {
        yPercent: yPercents[i],
        duration: (totalHeight - distanceToLoop) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond,
    );
  }

  tl.progress(1, true).progress(0, true);
  return tl;
};

const splitChars = (text) =>
  Array.from(text).map((ch) => (ch === " " ? "\u00A0" : ch));

export default function InfiniteScatterGallery({
  items = DEFAULT_ITEMS,
  bgColor = "#eaeeed",
  textColor = "#9b9b9b",
  linkColor = "#9b9b9b",
  linkHoverColor = "#000000",
  titleColor = "#141414",
  backColor = "#111111",
  headingFont = 'Georgia, "Times New Roman", serif',
  bodyFont = 'Inter, "Helvetica Neue", Arial, sans-serif',
  frameTitle = "Infinite Scroll Gallery",
  frameLinks = ["Overview", "Index", "Archive"],
  frameTags = ["#scroll", "#infinite", "#transition"],
  backLabel = "← back [ESC]",
  gallerySpacing = "12vh",
  galleryPaddingTop = "14vh",
  slideAspect = 0.8,
  imgScale = 1.2,
  parallaxSpeeds = DEFAULT_SPEEDS,
  scrubDuration = 0.75,
  scrubEase = "power3.out",
  scrollSpeed = 100,
  revealStagger = 0.12,
  revealDuration = 1,
  charStagger = 0.025,
  openDuration = 1.2,
  openEase = "power4.inOut",
  closeDuration = 1,
  closeEase = "power3.inOut",
  textStagger = 0.012,
  enableKeyboard = true,
  className = "",
}) {
  const uid = `isg-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const galleryRef = useRef(null);
  const slideRefs = useRef([]);
  const contentRef = useRef(null);
  const previewRef = useRef(null);
  const previewImgRef = useRef(null);
  const textRefs = useRef([]);
  const gsapRef = useRef(null);
  const engine = useRef({ state: "closed", activeIndex: -1 });
  const apiRef = useRef({ open: () => {}, close: () => {} });

  const titleChars = useMemo(
    () => items.map((item) => splitChars(item.title || "")),
    [items],
  );
  const descChars = useMemo(
    () => items.map((item) => splitChars(item.description || "")),
    [items],
  );
  const captionChars = useMemo(
    () => items.map((item) => splitChars(item.caption || "")),
    [items],
  );

  useEffect(() => {
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

    let alive = true;
    let cleanup = () => {};

    const boot = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Observer.min.js",
      );
      if (!alive) return;

      const gsap = window.gsap;
      const Observer = window.Observer;
      if (!gsap || !Observer || !galleryRef.current) return;

      gsap.registerPlugin(Observer);
      gsap.config({ trialWarn: false });
      gsapRef.current = gsap;

      const slides = slideRefs.current.filter(Boolean);
      if (!slides.length) return;

      const revealItems = new Map();
      slides.forEach((slide) => {
        const wrapper = slide.querySelector("[data-wrapper]");
        const chars = slide.querySelectorAll("[data-char]");
        gsap.set(wrapper, { autoAlpha: 0 });
        gsap.set(chars, { autoAlpha: 0 });
        revealItems.set(slide, { wrapper, chars });
      });

      const showSlide = (slide, delay, immediate) => {
        const entry = revealItems.get(slide);
        if (!entry) return;
        if (immediate) {
          gsap.set([entry.wrapper, ...entry.chars], {
            autoAlpha: 1,
            overwrite: true,
          });
          return;
        }
        gsap.to(entry.wrapper, {
          autoAlpha: 1,
          duration: revealDuration,
          ease: "power2.out",
          delay,
          overwrite: true,
        });
        gsap.to(entry.chars, {
          autoAlpha: 1,
          duration: 0.4,
          ease: "none",
          stagger: charStagger,
          delay: delay + 0.2,
          overwrite: true,
        });
      };

      const hideSlide = (slide) => {
        const entry = revealItems.get(slide);
        if (!entry) return;
        gsap.set(entry.wrapper, { autoAlpha: 0, overwrite: true });
        gsap.set(entry.chars, { autoAlpha: 0, overwrite: true });
      };

      const onToggle = (changes, immediate) => {
        changes
          .filter((c) => c.visible)
          .sort((a, b) => a.top - b.top)
          .forEach((c, i) => showSlide(c.el, i * revealStagger, immediate));
        changes.filter((c) => !c.visible).forEach((c) => hideSlide(c.el));
      };

      let loop;
      let wrap;
      const gap = parseFloat(getComputedStyle(galleryRef.current).rowGap) || 0;

      const createLoop = () => {
        loop = verticalLoop(gsap, slides, {
          repeat: -1,
          paused: true,
          paddingBottom: gap,
        });
        wrap = gsap.utils.wrap(0, loop.duration());
      };

      const parallax = slides.map((slide, i) => ({
        el: slide,
        factor: parallaxSpeeds[i % parallaxSpeeds.length] - 1,
        offset: 0,
        visible: false,
      }));

      const applyParallax = (immediate = false) => {
        const changes = [];
        parallax.forEach((item) => {
          const rect = item.el.getBoundingClientRect();
          const loopTop = rect.top - item.offset;
          item.offset = item.factor * (loopTop + rect.height);
          gsap.set(item.el, { y: item.offset });
          const top = loopTop + item.offset;
          const visible = top < window.innerHeight && top + rect.height > 0;
          if (visible !== item.visible) {
            item.visible = visible;
            changes.push({ el: item.el, visible, top });
          }
        });
        if (changes.length) onToggle(changes, immediate);
      };

      createLoop();
      applyParallax();

      const playhead = { time: 0 };
      const scrub = gsap.to(playhead, {
        time: 0,
        duration: scrubDuration,
        ease: scrubEase,
        paused: true,
        onUpdate: () => {
          loop.time(wrap(playhead.time));
          applyParallax();
        },
      });

      const observer = Observer.create({
        target: window,
        type: "wheel,touch",
        preventDefault: true,
        onChange: (self) => {
          if (engine.current.state !== "closed") return;
          const delta =
            Math.abs(self.deltaX) > Math.abs(self.deltaY)
              ? self.deltaX
              : self.deltaY;
          scrub.vars.time += delta / scrollSpeed;
          scrub.invalidate().restart();
        },
      });

      const freeze = () => {
        scrub.pause();
        scrub.vars.time = playhead.time;
        scrub.invalidate();
      };

      const rebuild = () => {
        const progress = loop.progress();
        freeze();
        loop.kill();
        gsap.set(slides, { clearProps: "transform" });
        createLoop();
        loop.progress(progress, true);
        parallax.forEach((item) => (item.offset = 0));
        applyParallax(true);
        playhead.time = loop.time();
        scrub.vars.time = playhead.time;
        scrub.invalidate();
      };

      let resizeId;
      const onResize = () => {
        clearTimeout(resizeId);
        resizeId = setTimeout(rebuild, 200);
      };
      window.addEventListener("resize", onResize);

      let tl = null;
      let splitTargets = [];

      const parts = (index) => {
        const slide = slides[index];
        return {
          slide,
          wrapper: slide.querySelector("[data-wrapper]"),
          caption: slide.querySelector("[data-caption]"),
          others: slides.filter((s) => s !== slide),
        };
      };

      const morphValues = (wrapper) => {
        const preview = previewRef.current;
        gsap.set(preview, { clearProps: "transform" });
        const p = preview.getBoundingClientRect();
        const t = wrapper.getBoundingClientRect();
        return {
          x: t.left - p.left,
          y: t.top - p.top,
          scaleX: t.width / p.width,
          scaleY: t.height / p.height,
        };
      };

      const resetTransition = () => {
        const index = engine.current.activeIndex;
        if (index >= 0) {
          const { wrapper } = parts(index);
          gsap.set(wrapper, { clearProps: "all" });
        }
        gsap.set(contentRef.current, { display: "none" });
        textRefs.current.forEach((el) => {
          if (el) gsap.set(el, { display: "none" });
        });
        gsap.set(previewRef.current, { clearProps: "all" });
        gsap.set(previewImgRef.current, { clearProps: "all" });
        splitTargets.forEach((el) => gsap.set(el, { clearProps: "all" }));
        splitTargets = [];
        tl = null;
        engine.current.state = "closed";
        engine.current.activeIndex = -1;
        observer.enable();
      };

      const open = async (index) => {
        if (engine.current.state !== "closed") return;
        engine.current.state = "opening";
        engine.current.activeIndex = index;

        observer.disable();
        freeze();

        const img = previewImgRef.current;
        img.src = items[index].image;
        img.alt = items[index].caption || "";
        try {
          await img.decode();
        } catch {}
        if (engine.current.state !== "opening") return;

        const { wrapper, caption, others } = parts(index);
        gsap.set(contentRef.current, { display: "block" });
        gsap.killTweensOf(wrapper);
        gsap.set(wrapper, { autoAlpha: 0 });

        textRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { display: i === index ? "block" : "none" });
        });

        const group = textRefs.current[index];
        splitTargets = group
          ? Array.from(group.querySelectorAll("[data-char]"))
          : [];
        const backEl = contentRef.current.querySelector("[data-back]");
        const from = morphValues(wrapper);

        tl = gsap
          .timeline({
            onComplete: () => (engine.current.state = "open"),
            onReverseComplete: resetTransition,
          })
          .to(others, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
          .to(caption, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)
          .fromTo(
            previewRef.current,
            { ...from, transformOrigin: "0 0" },
            {
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              duration: openDuration,
              ease: openEase,
            },
            0,
          )
          .fromTo(
            previewImgRef.current,
            { scale: imgScale },
            { scale: 1, duration: openDuration, ease: openEase },
            0,
          )
          .fromTo(
            [backEl, ...splitTargets],
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 1,
              ease: "power3.out",
              stagger: textStagger,
            },
            0.8,
          );
      };

      const close = () => {
        if (engine.current.state === "opening") {
          engine.current.state = "closing";
          if (!tl) {
            resetTransition();
            return;
          }
          tl.reverse();
          return;
        }
        if (engine.current.state !== "open") return;
        engine.current.state = "closing";

        const index = engine.current.activeIndex;
        const { wrapper, caption, others } = parts(index);
        const backEl = contentRef.current.querySelector("[data-back]");
        const to = morphValues(wrapper);
        gsap.set(previewRef.current, { x: 0, y: 0, scaleX: 1, scaleY: 1 });

        tl = gsap
          .timeline({ onComplete: resetTransition })
          .to(
            [backEl, ...splitTargets],
            {
              autoAlpha: 0,
              duration: 0.4,
              stagger: textStagger,
              ease: "power1.out",
            },
            0,
          )
          .to(
            previewRef.current,
            {
              ...to,
              transformOrigin: "0 0",
              duration: closeDuration,
              ease: closeEase,
            },
            0,
          )
          .to(
            previewImgRef.current,
            { scale: imgScale, duration: closeDuration, ease: closeEase },
            0,
          )
          .to(
            others,
            { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
            closeDuration * 0.5,
          )
          .to(
            caption,
            { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
            closeDuration * 0.6,
          );
      };

      apiRef.current = { open, close };

      const onKeyDown = (e) => {
        if (!enableKeyboard) return;
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", onKeyDown);

      cleanup = () => {
        observer.kill();
        scrub.kill();
        loop.kill();
        window.removeEventListener("resize", onResize);
        document.removeEventListener("keydown", onKeyDown);
        clearTimeout(resizeId);
      };
    };

    boot().catch((e) =>
      console.error("[InfiniteScrollGallery] init failed:", e.message),
    );

    return () => {
      alive = false;
      cleanup();
    };
  }, [
    items,
    parallaxSpeeds,
    scrubDuration,
    scrubEase,
    scrollSpeed,
    revealStagger,
    revealDuration,
    charStagger,
    openDuration,
    openEase,
    closeDuration,
    closeEase,
    textStagger,
    imgScale,
    enableKeyboard,
  ]);

  const handleKey = (e, index) => {
    if (!enableKeyboard) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      apiRef.current.open(index);
    }
  };

  return (
    <div
      className={`relative h-screen w-full overflow-hidden overscroll-none touch-none ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        fontSize: "12px",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `#${uid} a{color:${linkColor};text-decoration:none;cursor:pointer}#${uid} a:hover{color:${linkHoverColor};text-decoration:underline}`,
        }}
      />

      <div id={uid} className="relative h-full w-full">
        <header className="pointer-events-none relative z-[100] grid justify-items-start gap-4 p-6 md:fixed md:top-0 md:left-0 md:h-full md:w-full md:grid-cols-[auto_auto_1fr] md:content-between">
          <h1 className="m-0 text-[1em] font-normal md:col-start-1">
            {frameTitle}
          </h1>
          <nav className="flex flex-wrap gap-4 md:col-start-3 md:justify-self-end md:text-right">
            {frameLinks.map((l) => (
              <a key={l} href="#" className="pointer-events-auto">
                {l}
              </a>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-4 md:col-start-1 md:row-start-2 md:self-end">
            {frameTags.map((t) => (
              <a key={t} href="#" className="pointer-events-auto">
                {t}
              </a>
            ))}
          </nav>
        </header>

        <div
          ref={galleryRef}
          className="flex w-full flex-col items-center"
          style={{ gap: gallerySpacing, paddingTop: galleryPaddingTop }}
        >
          {items.map((item, i) => (
            <figure
              key={i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              role="button"
              tabIndex={0}
              onClick={() => apiRef.current.open(i)}
              onKeyDown={(e) => handleKey(e, i)}
              className="m-0 shrink-0 cursor-pointer p-0 outline-none"
              style={{ transform: `translateX(${item.stagger || "0vw"})` }}
            >
              <div
                data-wrapper
                className="relative m-0 select-none overflow-hidden"
                style={{
                  width: item.width || "200px",
                  aspectRatio: slideAspect,
                  pointerEvents: "none",
                }}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="eager"
                  className="absolute top-0 left-0 h-full w-full object-cover"
                  style={{ transform: `scale(${imgScale})` }}
                />
              </div>
              <figcaption data-caption className="mt-2 block">
                {captionChars[i].map((ch, c) => (
                  <span key={c} data-char className="inline-block">
                    {ch}
                  </span>
                ))}
              </figcaption>
            </figure>
          ))}
        </div>

        <div
          ref={contentRef}
          className="fixed inset-0 z-[1000]"
          style={{ display: "none" }}
        >
          <figure
            ref={previewRef}
            className="fixed top-0 left-0 m-0 h-screen overflow-hidden"
            style={{ aspectRatio: slideAspect }}
          >
            <img
              ref={previewImgRef}
              alt=""
              className="h-full w-full object-cover"
            />
          </figure>

          <div
            className="flex min-h-screen flex-col p-6"
            style={{ paddingLeft: `calc(80vh + 1.5vw)` }}
          >
            <button
              type="button"
              data-back
              onClick={() => apiRef.current.close()}
              className="cursor-pointer self-start border-none bg-transparent p-0 text-[1em] leading-none"
              style={{ color: backColor }}
            >
              {backLabel}
            </button>

            {items.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
                data-group={i}
                style={{ display: "none" }}
              >
                <div
                  className="mb-12 mt-[40vh] leading-none"
                  style={{
                    color: titleColor,
                    fontFamily: headingFont,
                    fontSize: "clamp(2.5rem, 10vw, 6rem)",
                  }}
                >
                  {titleChars[i].map((ch, c) => (
                    <span key={c} data-char className="inline-block">
                      {ch}
                    </span>
                  ))}
                </div>
                <div
                  className="mr-[10vw] max-w-[50ch]"
                  style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
                >
                  {descChars[i].map((ch, c) => (
                    <span key={c} data-char className="inline-block">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
