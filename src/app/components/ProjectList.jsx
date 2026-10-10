"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------
const DEFAULT_PROJECTS = [
  {
    id: "essential-light",
    title: "ESSENTIAL LIGHT",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/9c3dd7e8-3d75-4862-9902-dc0cc3289903?format=jpeg",
    tagsLeft: [
      "REDUCTION TO ESSENCE",
      "NATURAL ILLUMINATION",
      "AUTHENTIC MOMENT",
    ],
    tagsRight: ["VISUAL SILENCE", "TRUTH IN SHADOW", "UNFILTERED VISION"],
  },
  {
    id: "negative-space",
    title: "NEGATIVE SPACE",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/37539d4b-7af1-4824-9133-3ed9bfdd6d90?format=jpeg",
    tagsLeft: ["BREATHING ROOM", "COMPOSITIONAL PAUSE", "MEANINGFUL ABSENCE"],
    tagsRight: ["MINIMALIST FRAME", "POWER OF EMPTINESS", "VISUAL MEDITATION"],
  },
  {
    id: "decisive-moment",
    title: "DECISIVE MOMENT",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/4309fe48-5418-4427-9ece-99af711be069?format=jpeg",
    tagsLeft: ["INTUITIVE TIMING", "PRESENT AWARENESS", "AUTHENTIC CAPTURE"],
    tagsRight: [
      "UNREPEATABLE TRUTH",
      "EMOTIONAL RESONANCE",
      "PERFECT ALIGNMENT",
    ],
  },
  {
    id: "honest-texture",
    title: "HONEST TEXTURE",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/851adfe2-fd40-4a4e-859d-9351ae7ed6eb?format=jpeg",
    tagsLeft: ["TACTILE REALITY", "MATERIAL TRUTH", "SURFACE STORIES"],
    tagsRight: ["IMPERFECT BEAUTY", "AUTHENTIC DETAIL", "VISUAL TOUCH"],
  },
  {
    id: "pure-composition",
    title: "PURE COMPOSITION",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/bb05c4c2-9909-49f1-a4c0-02ba6d782847?format=jpeg",
    tagsLeft: ["VISUAL HARMONY", "ELEMENTAL BALANCE", "INTENTIONAL FRAMING"],
    tagsRight: ["ESSENTIAL GEOMETRY", "NATURAL RHYTHM", "DISTILLED FORM"],
  },
  {
    id: "natural-process",
    title: "NATURAL PROCESS",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/70484e82-14f5-464a-8cb6-0c4f93c1e405?format=jpeg",
    tagsLeft: ["ORGANIC FLOW", "INTUITIVE CREATION", "UNFORCED VISION"],
    tagsRight: [
      "AUTHENTIC APPROACH",
      "CREATIVE SURRENDER",
      "HONEST EXPRESSION",
    ],
  },
  {
    id: "silent-observer",
    title: "SILENT OBSERVER",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/96613340-be0a-422f-ae0d-732238cd202c?format=jpeg",
    tagsLeft: ["WITNESSING PRESENCE", "UNOBTRUSIVE LENS", "PATIENT WAITING"],
    tagsRight: ["AUTHENTIC CAPTURE", "RESPECTFUL DISTANCE", "TRUTHFUL MOMENT"],
  },
  {
    id: "visual-resonance",
    title: "VISUAL RESONANCE",
    year: "/2024",
    image:
      "https://cdn.cosmos.so/9c3dd7e8-3d75-4862-9902-dc0cc3289903?format=jpeg",
    tagsLeft: ["EMOTIONAL TRUTH", "INNER CONNECTION", "AUTHENTIC FEELING"],
    tagsRight: ["BEYOND TECHNIQUE", "SOUL EXPRESSION", "TIMELESS IMPACT"],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProjectList({
  projects = DEFAULT_PROJECTS,

  // Colors
  backgroundColor = "#f5f3ee",
  textColor = "#000000",
  indicatorColor = "#000000",
  tagColor = "#555555",

  // Typography
  titleFont = "'PP Neue Montreal', system-ui, sans-serif",
  tagFont = "'PP Neue Montreal', system-ui, sans-serif",
  titleSize = "clamp(1.8rem, 4vw, 3rem)",

  // Animation timing
  expandDuration = 0.4,
  collapseDuration = 0.3,
  textStagger = 0.05,

  // Image aspect ratio
  imageAspect = "4/3",

  onProjectOpen = null,
  onProjectClose = null,

  className = "",
}) {
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const activeRef = useRef(null);
  const allowClick = useRef(true);

  useEffect(() => {
    let gsap, CustomEase;

    const init = async () => {
      const g = await import("gsap");
      const ce = await import("gsap/CustomEase");
      gsap = g.gsap;
      CustomEase = ce.CustomEase;
      gsap.registerPlugin(CustomEase);

      CustomEase.create("projectExpand", "0.25, 0.1, 0.25, 1.05");
      CustomEase.create("projectCollapse", "0.36, 0.07, 0.19, 0.97");
      CustomEase.create("textReveal", "0.25, 1, 0.5, 1");

      const items = itemRefs.current;

      // -----------------------------------------------------------------------
      // Stagger-in on mount
      // -----------------------------------------------------------------------
      gsap.set(items, { opacity: 0, y: 15 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "none",
        onComplete: () => gsap.set(items, { clearProps: "opacity,y" }),
      });

      // Set initial image clip
      items.forEach((item) => {
        const img = item.querySelector(".proj-img");
        if (img) gsap.set(img, { clipPath: "inset(100% 0 0 0)" });

        // Set line elements hidden
        item.querySelectorAll(".proj-line").forEach((el) => {
          gsap.set(el, { y: "100%", opacity: 0 });
        });
      });

      // -----------------------------------------------------------------------
      // Hover indicators
      // -----------------------------------------------------------------------
      items.forEach((item) => {
        const titleContainer = item.querySelector(".proj-title-wrap");
        const leftInd = item.querySelector(".proj-ind-left");
        const rightInd = item.querySelector(".proj-ind-right");

        gsap.set([leftInd, rightInd], { width: 0, height: 8, opacity: 1 });

        const onEnter = () => {
          if (activeRef.current) return;
          gsap.killTweensOf([leftInd, rightInd]);
          gsap
            .timeline()
            .set(leftInd, { x: -20, width: 0 })
            .to(leftInd, {
              x: -10,
              width: 12,
              duration: 0.15,
              ease: "power2.in",
            })
            .to(leftInd, { x: 0, width: 8, duration: 0.15, ease: "none" });
          gsap
            .timeline({ delay: 0.05 })
            .set(rightInd, { x: 20, width: 0 })
            .to(rightInd, {
              x: 10,
              width: 12,
              duration: 0.15,
              ease: "power2.in",
            })
            .to(rightInd, { x: 0, width: 8, duration: 0.15, ease: "none" });
        };

        const onLeave = () => {
          if (activeRef.current) return;
          gsap.killTweensOf([leftInd, rightInd]);
          gsap
            .timeline()
            .to(leftInd, { x: -10, width: 12, duration: 0.15, ease: "none" })
            .to(leftInd, {
              x: -20,
              width: 0,
              duration: 0.15,
              ease: "power2.out",
            });
          gsap
            .timeline()
            .to(rightInd, { x: 10, width: 12, duration: 0.15, ease: "none" })
            .to(rightInd, {
              x: 20,
              width: 0,
              duration: 0.15,
              ease: "power2.out",
            });
        };

        titleContainer.addEventListener("mouseenter", onEnter);
        titleContainer.addEventListener("mouseleave", onLeave);
      });

      // -----------------------------------------------------------------------
      // Star Wars 3D effect
      // -----------------------------------------------------------------------
      const applyStarWars = (activeIndex) => {
        items.forEach((item, i) => {
          const tc = item.querySelector(".proj-title-wrap");
          if (i === activeIndex) {
            gsap.to(tc, {
              rotateX: 0,
              rotateY: 0,
              translateZ: 0,
              translateY: 0,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
            });
            return;
          }
          const dist = Math.abs(i - activeIndex);
          const isAbove = i < activeIndex;
          const rotX =
            dist === 1
              ? isAbove
                ? 12
                : -12
              : dist === 2
                ? isAbove
                  ? 20
                  : -20
                : isAbove
                  ? 30
                  : -30;
          const transZ = dist === 1 ? -80 : dist === 2 ? -160 : -240;
          const transY =
            dist === 1
              ? isAbove
                ? -15
                : 15
              : dist === 2
                ? isAbove
                  ? -30
                  : 30
                : isAbove
                  ? -45
                  : 45;
          gsap.to(tc, {
            rotateX: rotX,
            translateZ: transZ,
            translateY: transY,
            scale: 1 - dist * 0.05,
            duration: 0.6,
            ease: "power2.out",
          });
        });
      };

      const resetTransforms = () => {
        items.forEach((item) => {
          const tc = item.querySelector(".proj-title-wrap");
          gsap.to(tc, {
            rotateX: 0,
            rotateY: 0,
            translateZ: 0,
            translateY: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
          const l = item.querySelector(".proj-ind-left");
          const r = item.querySelector(".proj-ind-right");
          gsap.set(l, { width: 0, x: -20 });
          gsap.set(r, { width: 0, x: 20 });
        });
      };

      // -----------------------------------------------------------------------
      // Close a project
      // -----------------------------------------------------------------------
      const closeProject = (item, fast = false) => {
        const dur = fast ? collapseDuration * 0.8 : collapseDuration;
        const img = item.querySelector(".proj-img");
        const lines = item.querySelectorAll(".proj-line");
        const title = item.querySelector(".proj-title");
        const content = item.querySelector(".proj-content");

        gsap.to(title, {
          letterSpacing: "-0.02em",
          duration: dur,
          ease: "projectCollapse",
        });
        gsap.to(img, {
          clipPath: "inset(100% 0 0 0)",
          duration: dur,
          ease: "none",
        });
        gsap.to(lines, {
          y: "100%",
          opacity: 0,
          duration: dur,
          stagger: 0.03,
          ease: "projectCollapse",
        });
        gsap.to(content, {
          maxHeight: 0,
          opacity: 0,
          margin: 0,
          duration: dur,
          ease: "projectCollapse",
        });

        return dur;
      };

      // -----------------------------------------------------------------------
      // Open a project
      // -----------------------------------------------------------------------
      const openProject = (item) => {
        const idx = items.indexOf(item);
        const img = item.querySelector(".proj-img");
        const leftLines = item.querySelectorAll(".proj-lines-left .proj-line");
        const rightLines = item.querySelectorAll(
          ".proj-lines-right .proj-line",
        );
        const title = item.querySelector(".proj-title");
        const content = item.querySelector(".proj-content");

        // Reset
        gsap.set(img, { clipPath: "inset(100% 0 0 0)" });
        gsap.set([...leftLines, ...rightLines], { y: "100%", opacity: 0 });
        gsap.set(content, {
          display: "flex",
          maxHeight: 0,
          opacity: 0,
          margin: 0,
        });

        applyStarWars(idx);
        onProjectOpen?.(item, idx);

        const tl = gsap.timeline({ defaults: { ease: "textReveal" } });
        tl.to(
          title,
          {
            letterSpacing: "0.01em",
            duration: expandDuration,
            ease: "projectExpand",
          },
          0,
        );
        tl.to(
          content,
          {
            maxHeight: 500,
            opacity: 1,
            margin: "2rem 0",
            duration: expandDuration,
            ease: "projectExpand",
          },
          0,
        );
        tl.to(
          img,
          {
            clipPath: "inset(0% 0 0 0)",
            duration: expandDuration * 0.8,
            ease: "none",
          },
          0,
        );
        tl.to(
          leftLines,
          { y: "0%", opacity: 1, duration: 0.45, stagger: textStagger },
          `-=${expandDuration * 0.4}`,
        );
        tl.to(
          rightLines,
          { y: "0%", opacity: 1, duration: 0.45, stagger: textStagger },
          `-=${expandDuration * 0.8}`,
        );

        // Compress siblings
        if (idx > 0)
          gsap.to(items.slice(0, idx), {
            marginBottom: "0.5rem",
            duration: expandDuration,
            ease: "projectCollapse",
            stagger: 0.02,
          });
        if (idx < items.length - 1)
          gsap.to(items.slice(idx + 1), {
            marginBottom: "0.5rem",
            duration: expandDuration,
            ease: "projectCollapse",
            stagger: 0.02,
          });

        // Scroll into view
        setTimeout(() => {
          const listEl = listRef.current;
          const rect = item.getBoundingClientRect();
          const cRect = listEl.getBoundingClientRect();
          if (rect.top < cRect.top || rect.bottom > cRect.bottom) {
            listEl.scrollBy({
              top: rect.top - cRect.top - cRect.height / 2 + rect.height / 2,
              behavior: "smooth",
            });
          }
        }, 100);
      };

      // -----------------------------------------------------------------------
      // Click handler
      // -----------------------------------------------------------------------
      items.forEach((item) => {
        item.addEventListener("click", () => {
          if (!allowClick.current) return;
          allowClick.current = false;
          setTimeout(() => {
            allowClick.current = true;
          }, 500);

          if (activeRef.current === item) {
            // Close self
            const dur = closeProject(item) * 1000;
            setTimeout(() => {
              activeRef.current = null;
              resetTransforms();
              gsap.to(items, {
                marginBottom: "1.5rem",
                duration: expandDuration,
                ease: "projectExpand",
                stagger: 0.02,
              });
              onProjectClose?.();
            }, dur);
          } else if (activeRef.current) {
            // Close current, open new
            const prev = activeRef.current;
            const dur = closeProject(prev, true) * 1000;
            setTimeout(() => {
              prev.classList.remove("proj-active");
              activeRef.current = null;
              resetTransforms();
              item.classList.add("proj-active");
              activeRef.current = item;
              openProject(item);
            }, dur);
          } else {
            item.classList.add("proj-active");
            activeRef.current = item;
            openProject(item);
          }
        });
      });
    };

    init();

    return () => {
      import("gsap").then(({ gsap }) => gsap.killTweensOf("*"));
    };
  }, [projects]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        .proj-title-wrap { transform-style: preserve-3d; }
        .proj-ind-left, .proj-ind-right { pointer-events: none; z-index: 200; }
        .proj-content { pointer-events: none; }
        .proj-active .proj-content { pointer-events: auto; }
        .proj-line-wrap { overflow: hidden; margin-bottom: 0.25rem; }
      `}</style>

      <div
        className={`w-full h-full flex flex-col items-center justify-center ${className}`}
        style={{ backgroundColor, color: textColor, perspective: "1000px" }}
      >
        {/* List */}
        <div
          ref={listRef}
          className="flex flex-col items-center w-full max-w-5xl flex-1 justify-center overflow-y-auto"
          style={{ scrollbarWidth: "none", transformStyle: "preserve-3d" }}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => (itemRefs.current[i] = el)}
              className="w-full text-center cursor-pointer mb-6 relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Title row */}
              <div className="proj-title-wrap relative inline-block">
                {/* Left indicator */}
                <div
                  className="proj-ind-left absolute top-1/2 -translate-y-1/2"
                  style={{
                    left: -20,
                    backgroundColor: indicatorColor,
                    width: 0,
                    height: 8,
                  }}
                />

                <h2
                  className="proj-title font-black tracking-tight my-2 select-none"
                  style={{
                    fontFamily: titleFont,
                    fontSize: titleSize,
                    letterSpacing: "-0.02em",
                    color: textColor,
                  }}
                >
                  {project.title}
                </h2>

                {/* Right indicator */}
                <div
                  className="proj-ind-right absolute top-1/2 -translate-y-1/2"
                  style={{
                    right: -20,
                    backgroundColor: indicatorColor,
                    width: 0,
                    height: 8,
                  }}
                />
              </div>

              {/* Expandable content */}
              <div
                className="proj-content flex justify-between items-center overflow-hidden px-4"
                style={{ maxHeight: 0, opacity: 0, margin: 0 }}
              >
                {/* Left tags */}
                <div className="proj-lines-left w-1/4 text-left">
                  {project.tagsLeft.map((tag, ti) => (
                    <div key={ti} className="proj-line-wrap">
                      <p
                        className="proj-line text-xs font-medium tracking-wide mb-1"
                        style={{ fontFamily: tagFont, color: tagColor }}
                      >
                        {tag}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Image */}
                <div
                  className="w-2/5 max-w-sm overflow-hidden relative"
                  style={{ aspectRatio: imageAspect }}
                >
                  <div className="w-full h-full overflow-hidden">
                    <img
                      className="proj-img w-full h-full object-cover block"
                      src={project.image}
                      alt={project.title}
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Right tags */}
                <div className="proj-lines-right w-1/4 text-right">
                  {project.tagsRight.map((tag, ti) => (
                    <div key={ti} className="proj-line-wrap">
                      <p
                        className="proj-line text-xs font-medium tracking-wide mb-1"
                        style={{ fontFamily: tagFont, color: tagColor }}
                      >
                        {tag}
                      </p>
                    </div>
                  ))}
                  <p
                    className="text-xs tracking-wide mt-2"
                    style={{
                      fontFamily: tagFont,
                      color: tagColor,
                      opacity: 0.5,
                    }}
                  >
                    {project.year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
