"use client";

import { useEffect, useRef, useState } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

const DEFAULT_PROJECTS = [
  {
    id: "essential-light",
    title: "ESSENTIAL LIGHT",
    year: "/2024",
    image: photo("1595598034023-ca08624ce05d"),
    tagsLeft: ["REDUCTION TO ESSENCE", "NATURAL ILLUMINATION", "AUTHENTIC MOMENT"],
    tagsRight: ["VISUAL SILENCE", "TRUTH IN SHADOW", "UNFILTERED VISION"],
  },
  {
    id: "negative-space",
    title: "NEGATIVE SPACE",
    year: "/2024",
    image: photo("1781798715946-2e198afc29a7"),
    tagsLeft: ["BREATHING ROOM", "COMPOSITIONAL PAUSE", "MEANINGFUL ABSENCE"],
    tagsRight: ["MINIMALIST FRAME", "POWER OF EMPTINESS", "VISUAL MEDITATION"],
  },
  {
    id: "decisive-moment",
    title: "DECISIVE MOMENT",
    year: "/2024",
    image: photo("1725161834547-ba8a90bf5a15"),
    tagsLeft: ["INTUITIVE TIMING", "PRESENT AWARENESS", "AUTHENTIC CAPTURE"],
    tagsRight: ["UNREPEATABLE TRUTH", "EMOTIONAL RESONANCE", "PERFECT ALIGNMENT"],
  },
  {
    id: "honest-texture",
    title: "HONEST TEXTURE",
    year: "/2024",
    image: photo("1782806007529-90a2ab4b98d9"),
    tagsLeft: ["TACTILE REALITY", "MATERIAL TRUTH", "SURFACE STORIES"],
    tagsRight: ["IMPERFECT BEAUTY", "AUTHENTIC DETAIL", "VISUAL TOUCH"],
  },
  {
    id: "pure-composition",
    title: "PURE COMPOSITION",
    year: "/2024",
    image: photo("1779877716206-f441d5d384d4"),
    tagsLeft: ["VISUAL HARMONY", "ELEMENTAL BALANCE", "INTENTIONAL FRAMING"],
    tagsRight: ["ESSENTIAL GEOMETRY", "NATURAL RHYTHM", "DISTILLED FORM"],
  },
  {
    id: "natural-process",
    title: "NATURAL PROCESS",
    year: "/2024",
    image: photo("1779862946918-a129ac57c60e"),
    tagsLeft: ["ORGANIC FLOW", "INTUITIVE CREATION", "UNFORCED VISION"],
    tagsRight: ["AUTHENTIC APPROACH", "CREATIVE SURRENDER", "HONEST EXPRESSION"],
  },
  {
    id: "silent-observer",
    title: "SILENT OBSERVER",
    year: "/2024",
    image: photo("1780580940878-248a6ad4b626"),
    tagsLeft: ["WITNESSING PRESENCE", "UNOBTRUSIVE LENS", "PATIENT WAITING"],
    tagsRight: ["AUTHENTIC CAPTURE", "RESPECTFUL DISTANCE", "TRUTHFUL MOMENT"],
  },
  {
    id: "visual-resonance",
    title: "VISUAL RESONANCE",
    year: "/2024",
    image: photo("1781513747645-757fb2619e57"),
    tagsLeft: ["EMOTIONAL TRUTH", "INNER CONNECTION", "AUTHENTIC FEELING"],
    tagsRight: ["BEYOND TECHNIQUE", "SOUL EXPRESSION", "TIMELESS IMPACT"],
  },
];

const TILT = [
  { rotateX: 12, z: -80, y: 15 },
  { rotateX: 20, z: -160, y: 30 },
  { rotateX: 30, z: -240, y: 45 },
];

const find = (item, selector) => item.querySelector(selector);

export default function ProjectList({
  projects = DEFAULT_PROJECTS,
  backgroundColor = "bg-white",
  textColor = "text-black",
  indicatorColor = "bg-black",
  tagColor = "text-black/60",
  placeholderColor = "bg-black/5",
  fontFamily = "Inter Tight",
  fontUrlMedium = "https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/latin-500-normal.woff2",
  fontUrlBlack = "https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/latin-900-normal.woff2",
  titleSize = "text-[clamp(1.8rem,4vw,3rem)]",
  imageAspect = "aspect-[4/3]",
  expandDuration = 0.4,
  collapseDuration = 0.3,
  textStagger = 0.05,
  onProjectOpen = null,
  onProjectClose = null,
  className = "",
}) {
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const gsapRef = useRef(null);
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const activeRef = useRef(-1);
  const busyRef = useRef(false);
  const timersRef = useRef([]);

  const later = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    projects.forEach(({ image }) => {
      const img = new Image();
      img.decoding = "async";
      img.src = image;
    });
  }, [projects]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const [{ gsap }, { CustomEase }] = await Promise.all([
        import("gsap"),
        import("gsap/CustomEase"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(CustomEase);
      CustomEase.create("projectExpand", "0.25, 0.1, 0.25, 1.05");
      CustomEase.create("projectCollapse", "0.36, 0.07, 0.19, 0.97");
      CustomEase.create("textReveal", "0.25, 1, 0.5, 1");
      gsapRef.current = gsap;

      gsap.fromTo(
        itemRefs.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "none",
          clearProps: "opacity,y",
        },
      );
      setReady(true);
    };

    start().catch((e) => {
      console.error("[ProjectList] GSAP load failed:", e.message);
      setReady(true);
    });

    return () => {
      cancelled = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      const gsap = gsapRef.current;
      if (gsap) {
        gsap.killTweensOf(
          itemRefs.current.flatMap((item) =>
            item ? [item, ...item.querySelectorAll("*")] : [],
          ),
        );
      }
    };
  }, []);

  const showIndicator = (g, el, dir, delay = 0) =>
    g
      .timeline({ delay })
      .set(el, { x: dir * 20, width: 0 })
      .to(el, { x: dir * 10, width: 12, duration: 0.15, ease: "power2.in" })
      .to(el, { x: 0, width: 8, duration: 0.15, ease: "none" });

  const hideIndicator = (g, el, dir) =>
    g
      .timeline()
      .to(el, { x: dir * 10, width: 12, duration: 0.15, ease: "none" })
      .to(el, { x: dir * 20, width: 0, duration: 0.15, ease: "power2.out" });

  const hoverIn = (index) => {
    const g = gsapRef.current;
    if (!g || activeRef.current !== -1) return;
    const item = itemRefs.current[index];
    const left = find(item, "[data-ind-l]");
    const right = find(item, "[data-ind-r]");
    g.killTweensOf([left, right]);
    showIndicator(g, left, -1);
    showIndicator(g, right, 1, 0.05);
  };

  const hoverOut = (index) => {
    const g = gsapRef.current;
    if (!g || activeRef.current !== -1) return;
    const item = itemRefs.current[index];
    const left = find(item, "[data-ind-l]");
    const right = find(item, "[data-ind-r]");
    g.killTweensOf([left, right]);
    hideIndicator(g, left, -1);
    hideIndicator(g, right, 1);
  };

  const tilt = (g, active) => {
    itemRefs.current.forEach((item, i) => {
      const wrap = find(item, "[data-title-wrap]");
      if (i === active) {
        g.to(wrap, {
          rotateX: 0,
          z: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
        return;
      }
      const dist = Math.abs(i - active);
      const sign = i < active ? 1 : -1;
      const step = TILT[Math.min(dist, 3) - 1];
      g.to(wrap, {
        rotateX: sign * step.rotateX,
        z: step.z,
        y: -sign * step.y,
        scale: 1 - dist * 0.05,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  const resetTilt = (g) => {
    itemRefs.current.forEach((item) => {
      g.to(find(item, "[data-title-wrap]"), {
        rotateX: 0,
        z: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
      g.set(find(item, "[data-ind-l]"), { width: 0, x: -20 });
      g.set(find(item, "[data-ind-r]"), { width: 0, x: 20 });
    });
  };

  const closeItem = (g, item, fast) => {
    const dur = fast ? collapseDuration * 0.8 : collapseDuration;
    g.to(find(item, "[data-title]"), {
      letterSpacing: "-0.02em",
      duration: dur,
      ease: "projectCollapse",
    });
    g.to(find(item, "[data-img]"), {
      clipPath: "inset(100% 0 0 0)",
      duration: dur,
      ease: "none",
    });
    g.to(item.querySelectorAll("[data-line]"), {
      y: "100%",
      opacity: 0,
      duration: dur,
      stagger: 0.03,
      ease: "projectCollapse",
    });
    g.to(find(item, "[data-content]"), {
      maxHeight: 0,
      opacity: 0,
      margin: 0,
      duration: dur,
      ease: "projectCollapse",
    });
    return dur * 1000;
  };

  const openItem = (g, index) => {
    const items = itemRefs.current;
    const item = items[index];
    const img = find(item, "[data-img]");
    const content = find(item, "[data-content]");
    const left = item.querySelectorAll("[data-left] [data-line]");
    const right = item.querySelectorAll("[data-right] [data-line]");

    g.set(img, { clipPath: "inset(100% 0 0 0)" });
    g.set([...left, ...right], { y: "100%", opacity: 0 });
    g.set(content, { maxHeight: 0, opacity: 0, margin: 0 });

    tilt(g, index);
    onProjectOpen?.(item, index);

    g.timeline({ defaults: { ease: "textReveal" } })
      .to(
        find(item, "[data-title]"),
        { letterSpacing: "0.01em", duration: expandDuration, ease: "projectExpand" },
        0,
      )
      .to(
        content,
        {
          maxHeight: 500,
          opacity: 1,
          margin: "2rem 0",
          duration: expandDuration,
          ease: "projectExpand",
        },
        0,
      )
      .to(
        img,
        { clipPath: "inset(0% 0 0 0)", duration: expandDuration * 0.8, ease: "none" },
        0,
      )
      .to(
        left,
        { y: "0%", opacity: 1, duration: 0.45, stagger: textStagger },
        `-=${expandDuration * 0.4}`,
      )
      .to(
        right,
        { y: "0%", opacity: 1, duration: 0.45, stagger: textStagger },
        `-=${expandDuration * 0.8}`,
      );

    g.to(
      items.filter((_, i) => i !== index),
      {
        marginBottom: "0.5rem",
        duration: expandDuration,
        ease: "projectCollapse",
        stagger: 0.02,
      },
    );

    later(() => {
      const list = scrollRef.current;
      if (!list) return;
      const rect = item.getBoundingClientRect();
      const box = list.getBoundingClientRect();
      if (rect.top < box.top || rect.bottom > box.bottom) {
        list.scrollBy({
          top: rect.top - box.top - box.height / 2 + rect.height / 2,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleClick = (index) => {
    const g = gsapRef.current;
    if (!g || busyRef.current) return;

    busyRef.current = true;
    later(() => {
      busyRef.current = false;
    }, 500);

    const items = itemRefs.current;
    const current = activeRef.current;

    if (current === index) {
      const wait = closeItem(g, items[index], false);
      later(() => {
        activeRef.current = -1;
        setActiveIndex(-1);
        resetTilt(g);
        g.to(items, {
          marginBottom: "1.5rem",
          duration: expandDuration,
          ease: "projectExpand",
          stagger: 0.02,
        });
        onProjectClose?.();
      }, wait);
    } else if (current !== -1) {
      const wait = closeItem(g, items[current], true);
      later(() => {
        resetTilt(g);
        activeRef.current = index;
        setActiveIndex(index);
        openItem(g, index);
      }, wait);
    } else {
      activeRef.current = index;
      setActiveIndex(index);
      openItem(g, index);
    }
  };

  const fontCss =
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrlMedium +
    '") format("woff2");font-weight:500;font-display:swap;}' +
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrlBlack +
    '") format("woff2");font-weight:900;font-display:swap;}';

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center ${backgroundColor} ${textColor} ${className}`}
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      <style>{fontCss}</style>

      <div
        ref={scrollRef}
        className={`flex w-full min-h-screen flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${backgroundColor}`}
      >
        <div className="m-auto flex w-full max-w-5xl flex-col items-center">
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => (itemRefs.current[i] = el)}
              data-active={activeIndex === i}
              onClick={() => handleClick(i)}
              className={`group/item relative mb-6 w-full cursor-pointer text-center [perspective:1000px] ${backgroundColor} ${ready ? "" : "opacity-0"
                }`}
            >
              <div
                data-title-wrap
                onMouseEnter={() => hoverIn(i)}
                onMouseLeave={() => hoverOut(i)}
                className="relative inline-block will-change-transform [backface-visibility:hidden]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-5 z-[200] flex items-center">
                  <span
                    data-ind-l
                    className={`block h-2 w-0 ${indicatorColor}`}
                  />
                </span>

                <h2
                  data-title
                  className={`my-2 select-none font-black tracking-[-0.02em] ${titleSize}`}
                >
                  {project.title}
                </h2>

                <span className="pointer-events-none absolute inset-y-0 -right-5 z-[200] flex items-center">
                  <span
                    data-ind-r
                    className={`block h-2 w-0 ${indicatorColor}`}
                  />
                </span>
              </div>

              <div
                data-content
                className="pointer-events-none m-0 flex max-h-0 items-center justify-between overflow-hidden px-2 opacity-0 sm:px-4 group-data-[active=true]/item:pointer-events-auto"
              >
                <div data-left className="w-[28%] text-left sm:w-1/4">
                  {project.tagsLeft.map((tag) => (
                    <div key={tag} className="mb-1 overflow-hidden">
                      <p
                        data-line
                        className={`m-0 break-words text-[10px] font-medium tracking-wide sm:text-xs ${tagColor}`}
                      >
                        {tag}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className={`relative w-[38%] max-w-sm sm:w-2/5 overflow-hidden ${imageAspect} ${placeholderColor}`}
                >
                  <img
                    data-img
                    src={project.image}
                    alt={project.title}
                    decoding="async"
                    draggable={false}
                    className="block h-full w-full object-cover [clip-path:inset(100%_0_0_0)]"
                  />
                </div>

                <div data-right className="w-[28%] text-right sm:w-1/4">
                  {project.tagsRight.map((tag) => (
                    <div key={tag} className="mb-1 overflow-hidden">
                      <p
                        data-line
                        className={`m-0 break-words text-[10px] font-medium tracking-wide sm:text-xs ${tagColor}`}
                      >
                        {tag}
                      </p>
                    </div>
                  ))}
                  <p
                    className={`m-0 mt-2 text-[10px] tracking-wide sm:text-xs opacity-50 ${tagColor}`}
                  >
                    {project.year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}