"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const DEFAULT_TABS = [
  {
    label: "Shapes",
    heading: "Shifting Silhouettes",
    description:
      "From tall amphoras to low bowls, every outline starts as a decision on the wheel.",
    image: unsplash("photo-1656088239658-ca839d7e8841"),
    alt: "Close-up of a ceramic vase",
  },
  {
    label: "Glazes",
    heading: "Fragments of Color",
    description:
      "Where fire meets glaze, color settles into depths no brush could paint.",
    image: unsplash("photo-1738858363202-dd019dadce76"),
    alt: "A large gray vase on a tile floor",
  },
  {
    label: "Studio",
    heading: "Echoes in Clay",
    description:
      "A journey through slow days, wet hands, and pieces made one at a time.",
    image: unsplash("photo-1753164725848-471a8abbb6f5"),
    alt: "A potter shaping a vase on a wheel",
  },
];

export default function FlipTabShowcase({
  tabs = DEFAULT_TABS,
  heading = "Explore the Layers of Handmade Ceramics",
  ctaLabel = "Visit the studio",
  ctaHref = "#",
  backgroundColor = "bg-black",
  textColor = "text-white",
  ctaClassName = "bg-white text-black",
  fontSize = "clamp(13px, 1.1vw, 24px)",
  easeParams = "0.625, 0.05, 0, 1",
  flipDuration = 0.4,
  contentEase = "power3.inOut",
  contentStagger = 0.075,
  visualHeightEm = 42,
  visualMaxHeightVh = 80,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const timelineRef = useRef(null);
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const buttonRefs = useRef([]);
  const contentRefs = useRef([]);
  const visualRefs = useRef([]);

  const movePill = (index, animate = true) => {
    const pill = pillRef.current;
    const button = buttonRefs.current[index];
    if (!pill || !button) return;
    const target = {
      x: button.offsetLeft,
      y: button.offsetTop,
      width: button.offsetWidth,
      height: button.offsetHeight,
    };
    if (animate) {
      gsap.to(pill, {
        ...target,
        duration: flipDuration,
        ease: "tab-ease",
        overwrite: "auto",
      });
    } else {
      gsap.set(pill, { ...target, opacity: 1 });
    }
  };

  useEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("tab-ease", easeParams);

    movePill(activeRef.current, false);

    const nav = navRef.current;
    const observer = new ResizeObserver(() =>
      movePill(activeRef.current, false),
    );
    if (nav) observer.observe(nav);

    return () => {
      observer.disconnect();
      timelineRef.current?.kill();
      gsap.killTweensOf(pillRef.current);
      contentRefs.current.forEach((el) => {
        if (el) gsap.killTweensOf([el, ...el.querySelectorAll("[data-fade]")]);
      });
      visualRefs.current.forEach((el) => el && gsap.killTweensOf(el));
    };
  }, [easeParams]);

  const switchTab = (index) => {
    if (index === activeRef.current) return;
    timelineRef.current?.kill();

    const inContent = contentRefs.current[index];
    const inVisual = visualRefs.current[index];
    const others = tabs.map((_, i) => i).filter((i) => i !== index);
    const outContents = others.map((i) => contentRefs.current[i]);
    const outVisuals = others.map((i) => visualRefs.current[i]);
    const outLines = outContents.flatMap((el) => [
      ...el.querySelectorAll("[data-fade]"),
    ]);
    const inLines = inContent.querySelectorAll("[data-fade]");

    gsap.set([inContent, inVisual], { visibility: "visible" });

    timelineRef.current = gsap
      .timeline({
        defaults: { ease: contentEase, duration: 0.8 },
        onComplete: () => gsap.set(outContents, { visibility: "hidden" }),
      })
      .to(outLines, { y: "-2em", autoAlpha: 0 }, 0)
      .to(outVisuals, { autoAlpha: 0, xPercent: 3 }, 0)
      .fromTo(
        inLines,
        { y: "2em", autoAlpha: 0 },
        { y: "0em", autoAlpha: 1, stagger: contentStagger },
        0.4,
      )
      .fromTo(
        inVisual,
        { autoAlpha: 0, xPercent: 3 },
        { autoAlpha: 1, xPercent: 0 },
        "<",
      );

    activeRef.current = index;
    setActiveIndex(index);
    movePill(index);
  };

  return (
    <div
      className={`relative min-h-screen w-full ${backgroundColor} ${textColor} ${className}`}
      style={{
        "--fs": fontSize,
        "--visual-h": visualHeightEm,
        "--visual-max": `${visualMaxHeightVh}vh`,
      }}
    >
      <section className="relative flex min-h-screen items-center justify-center p-[2em] text-[length:var(--fs)]">
        <div className="relative flex min-h-[37em] w-full flex-col gap-y-[3em] md:flex-row md:flex-wrap">
          <div className="w-full md:w-1/2">
            <div className="ml-auto mr-0 h-full w-full max-w-[36em] pb-[2em] pt-[1em]">
              <div className="flex h-full min-h-full flex-col items-start justify-between gap-[3em] md:pr-[2.5em]">
                <div className="flex flex-col items-start gap-[2em]">
                  <h1 className="m-0 text-[2.6em] font-medium leading-none tracking-tight md:text-[4em]">
                    {heading}
                  </h1>

                  <div
                    ref={navRef}
                    className="relative flex rounded-[.5em] border border-white/[0.08] bg-white/[0.06] p-[.5em]"
                  >
                    <div
                      ref={pillRef}
                      className="pointer-events-none absolute left-0 top-0 z-0 rounded-[.25em] border border-white/[0.08] bg-white/[0.06] opacity-0"
                    />
                    {tabs.map((tab, i) => (
                      <button
                        key={i}
                        ref={(el) => (buttonRefs.current[i] = el)}
                        type="button"
                        onClick={() => switchTab(i)}
                        onMouseEnter={() => movePill(i)}
                        onFocus={() => movePill(i)}
                        onMouseLeave={() => movePill(activeRef.current)}
                        onBlur={() => movePill(activeRef.current)}
                        className={`relative z-[1] cursor-pointer border px-[1.5em] py-[1.125em] text-[1em] transition-[border-color] duration-200 ${i === activeIndex
                            ? "rounded-[.25em] border-white/30"
                            : "border-transparent"
                          }`}
                      >
                        <span className="relative z-[1] block text-[1.125em]">
                          {tab.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col items-start gap-[2em]">
                  <div className="relative min-h-[10em] w-full md:min-h-0 md:min-w-[24em]">
                    {tabs.map((tab, i) => (
                      <div
                        key={i}
                        ref={(el) => (contentRefs.current[i] = el)}
                        className={`absolute inset-x-0 bottom-0 top-auto z-[1] flex flex-col gap-[1.25em] ${i === 0 ? "visible" : "invisible"
                          }`}
                      >
                        <h2
                          data-fade
                          className="m-0 text-[1.75em] font-medium leading-none tracking-tight"
                        >
                          {tab.heading}
                        </h2>
                        <p
                          data-fade
                          className="m-0 text-[1.25em] leading-snug opacity-80"
                        >
                          {tab.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <a
                    href={ctaHref}
                    className={`relative flex h-[4em] items-center justify-center rounded-[.25em] px-[1.5em] no-underline ${ctaClassName}`}
                  >
                    <span className="m-0 text-[1.25em] leading-snug">
                      {ctaLabel}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="relative h-[min(calc(var(--visual-h)_*_1em),var(--visual-max))] w-full overflow-hidden rounded-[.5em]">
              {tabs.map((tab, i) => (
                <div
                  key={i}
                  ref={(el) => (visualRefs.current[i] = el)}
                  className={`absolute flex h-full w-full items-center justify-start ${i === 0 ? "visible" : "invisible"
                    }`}
                >
                  <img
                    src={tab.image}
                    alt={tab.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full max-w-none rounded-[.5em] object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}