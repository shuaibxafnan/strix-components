"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    tag: "Adrienne Hoareau",
    label: "Le printemps",
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1920&q=80",
  },
  {
    tag: "Sylvie Payet",
    label: "L'été",
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1920&q=80",
  },
  {
    tag: "Lilou Bakame",
    label: "L'automne",
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1920&q=80",
  },
  {
    tag: "Juliette Esparon",
    label: "L'hiver",
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=1920&q=80",
  },
];

const DEFAULT_CLIP_SHAPES = [
  "circle(41.9% at 19% 99%)",
  "circle(16.2% at 74% 38%)",
];

export default function HoverBackgroundMenu({
  items = DEFAULT_ITEMS,
  bgColor = "#000000",
  itemBgColor = "#282b27",
  textColor = "#ffffff",
  linkColor = "#e5e3e0",
  linkHoverColor = "#ffffff",
  tagColor = "#ffffff",
  menuLinkColor = "#d05d3b",
  menuLinkHoverColor = "#ffffff",
  menuFont = 'Georgia, "Times New Roman", serif',
  menuFontWeight = 700,
  menuFontSize = "5vw",
  bodyFont = 'Inter, "Helvetica Neue", Arial, sans-serif',
  clipShapes = DEFAULT_CLIP_SHAPES,
  fullOpacity = 0.6,
  scaleFrom = 1.07,
  showDuration = 1.8,
  hideDuration = 0.4,
  showEase = "power2.out",
  hideEase = "power2.out",
  activateOnClick = true,
  className = "",
}) {
  const uid = `bsh-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const screensRef = useRef([]);
  const currentRef = useRef(0);
  const gsapRef = useRef(null);

  useEffect(() => {
    let alive = true;
    import("gsap").then((mod) => {
      if (!alive) return;
      gsapRef.current = mod.gsap || mod.default;
    });
    return () => {
      alive = false;
      const gsap = gsapRef.current;
      if (gsap) gsap.killTweensOf(screensRef.current.filter(Boolean));
      screensRef.current.forEach((el) => {
        const full = el && el.querySelector("[data-full]");
        if (full && gsap) gsap.killTweensOf(full);
      });
    };
  }, []);

  const activate = (position) => {
    const gsap = gsapRef.current;
    if (!gsap || position === currentRef.current) return;

    const currentEl = screensRef.current[currentRef.current];
    const nextEl = screensRef.current[position];
    if (!currentEl || !nextEl) return;
    currentRef.current = position;

    const nextFull = nextEl.querySelector("[data-full]");
    gsap.killTweensOf([currentEl, nextEl, nextFull]);

    gsap
      .timeline()
      .set(nextEl, { opacity: 1, zIndex: 1 })
      .to(nextFull, {
        duration: showDuration,
        ease: showEase,
        startAt: { scale: scaleFrom },
        scale: 1,
      });

    gsap
      .timeline()
      .set(currentEl, { zIndex: 10 })
      .to(currentEl, {
        duration: hideDuration,
        ease: hideEase,
        opacity: 0,
        onComplete: () => gsap.set(currentEl, { zIndex: 1 }),
      });
  };

  return (
    <div
      className={`relative w-full min-h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `#${uid} a{color:${linkColor};text-decoration:none}#${uid} a:hover{color:${linkHoverColor}}#${uid} .${uid}-nav a{text-decoration:underline}#${uid} .${uid}-nav a:hover{text-decoration:none}#${uid} .${uid}-link{color:${menuLinkColor};transition:color .2s}#${uid} .${uid}-link:hover{color:${menuLinkHoverColor}}@media screen and (min-width:53em){#${uid} .${uid}-link{font-size:${menuFontSize}}}`,
        }}
      />

      <div id={uid} className="relative w-full min-h-screen">
        <div
          className="absolute top-0 left-0 h-full min-h-screen w-full"
          aria-hidden="true"
        >
          {items.map((item, i) => (
            <div
              key={item.label}
              ref={(el) => {
                screensRef.current[i] = el;
              }}
              className="absolute top-0 left-0 h-full min-h-screen w-full"
              style={{
                backgroundColor: itemBgColor,
                opacity: i === 0 ? 1 : 0,
                zIndex: i === 0 ? 100 : 1,
              }}
            >
              <div
                data-full
                className="absolute top-0 left-0 h-full min-h-screen w-full bg-cover bg-center bg-no-repeat will-change-transform"
                style={{
                  backgroundImage: `url(${item.image})`,
                  opacity: fullOpacity,
                }}
              />
              {clipShapes.map((shape, s) => (
                <div
                  key={s}
                  className="absolute top-0 left-0 h-full min-h-screen w-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    clipPath: shape,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="relative z-[100] flex select-none flex-col p-8 md:h-screen md:items-center md:justify-center">
          <nav className="md:mx-auto md:block md:max-w-[74vw] md:text-center">
            {items.map((item, i) => (
              <span
                key={item.label}
                className="my-[2vh] inline-block text-left md:mx-[3vw] md:my-[3vh]"
              >
                <span
                  className="block text-sm md:ml-[0.25vw]"
                  style={{ color: tagColor, fontFamily: bodyFont }}
                >
                  {item.tag}
                </span>
                <a
                  href="#"
                  className={`${uid}-link block cursor-pointer text-5xl leading-none`}
                  style={{ fontFamily: menuFont, fontWeight: menuFontWeight }}
                  onMouseEnter={() => activate(i)}
                  onFocus={() => activate(i)}
                  onClick={(e) => {
                    e.preventDefault();
                    if (activateOnClick) activate(i);
                  }}
                >
                  {item.label}
                </a>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
