"use client";

import { useEffect, useId, useMemo, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_INTRO_IMAGE =
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80";

const DEFAULT_TEXT =
  "All photographs are memento mori. To take a photograph is to participate in another person's mortality, vulnerability, mutability. Precisely by slicing out this moment and freezing it, all photographs testify to time's relentless melt.";

export default function RotatedPanelReveal({
  angle = 35,
  introTitle = "Bottega Ricci",
  enterLabel = "enter",
  introImage = DEFAULT_INTRO_IMAGE,
  panelColor = "#0e0e0e",
  introTitleColor = "#ffffff",
  enterColor = "#ffffff",
  pageBg = "#ffffff",
  title = "Andrea\nRicci",
  titleColor = "#111111",
  text = DEFAULT_TEXT,
  textColor = "#868181",
  images = DEFAULT_IMAGES,
  numbers = null,
  numberColor = "#111111",
  selectHeading = "select",
  selectItems = ["all", "portraits", "b & w", "nude"],
  selectIndex = 0,
  selectColor = "#868181",
  selectActiveColor = "#111111",
  socialLinks = [{ label: "In" }, { label: "Tw" }],
  socialColor = "#555555",
  socialHoverColor = "#000000",
  duration = 1.2,
  ease = "expo.inOut",
  imageShift = -150,
  imageScaleY = 1.1,
  letterStagger = 0.04,
  reelOffset = 100,
  hoverLetters = true,
  hoverStagger = 0.04,
  displayFont = "Georgia, 'Times New Roman', serif",
  bodyFont = "Futura, 'Century Gothic', 'Trebuchet MS', sans-serif",
  className = "",
}) {
  const rawId = useId();
  const uid = useMemo(
    () => "rr-" + rawId.replace(/[^a-zA-Z0-9]/g, ""),
    [rawId],
  );

  const panelRef = useRef(null);
  const innerRef = useRef(null);
  const reverseRef = useRef(null);
  const introImgRef = useRef(null);
  const introTitleRef = useRef(null);
  const enterRef = useRef(null);
  const reelRef = useRef(null);

  const timelineRef = useRef(null);
  const hoverBusyRef = useRef(false);
  const gsapRef = useRef(null);
  const hoverTlRef = useRef(null);

  const rad = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const letters = useMemo(() => Array.from(introTitle), [introTitle]);
  const titleLines = useMemo(() => title.split("\n"), [title]);
  const reelNumbers = useMemo(
    () => numbers || images.map((_, i) => String(i + 1).padStart(3, "0")),
    [numbers, images],
  );

  useEffect(() => {
    let cancelled = false;

    import("gsap")
      .then((mod) => {
        if (cancelled) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap || !innerRef.current) return;
        gsapRef.current = gsap;

        gsap.set(reverseRef.current, { rotation: -angle });

        const letterEls = introTitleRef.current
          ? Array.from(introTitleRef.current.querySelectorAll("span"))
          : [];
        const shuffled = letterEls.slice().sort(() => Math.random() - 0.5);
        const half = shuffled.filter(() => Math.random() < 0.5);
        const others = shuffled.filter((el) => half.indexOf(el) < 0);

        const tl = gsap.timeline({ paused: true });
        tl.to(
          introImgRef.current,
          { duration, ease, y: imageShift, scaleY: imageScaleY, opacity: 0 },
          0,
        )
          .to(
            others.length ? others : letterEls,
            {
              duration: duration * 0.8,
              ease,
              y: "-100%",
              scaleX: 0.8,
              scaleY: 1.5,
              opacity: 0,
              stagger: letterStagger,
            },
            0,
          )
          .to(
            enterRef.current,
            { duration: duration * 0.5, ease, opacity: 0 },
            0,
          )
          .to(innerRef.current, { duration, ease, y: "-100%" }, 0)
          .to(reverseRef.current, { duration, ease, y: "100%" }, 0)
          .fromTo(
            reelRef.current,
            { y: reelOffset },
            { duration, ease, y: 0 },
            0,
          );

        timelineRef.current = tl;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (hoverTlRef.current) {
        hoverTlRef.current.kill();
        hoverTlRef.current = null;
      }
      hoverBusyRef.current = false;
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [
    angle,
    duration,
    ease,
    imageShift,
    imageScaleY,
    letterStagger,
    reelOffset,
    introTitle,
  ]);

  const handleEnter = () => {
    if (!timelineRef.current) return;
    panelRef.current.style.pointerEvents = "none";
    timelineRef.current.play();
  };

  const handleBack = () => {
    if (!timelineRef.current) return;
    panelRef.current.style.pointerEvents = "auto";
    timelineRef.current.reverse();
  };

  const handleHover = () => {
    if (!hoverLetters) return;
    const gsap = gsapRef.current;
    if (!gsap || hoverBusyRef.current || !introTitleRef.current) return;
    if (timelineRef.current && timelineRef.current.progress() > 0) return;
    hoverBusyRef.current = true;

    const all = Array.from(introTitleRef.current.querySelectorAll("span"));
    const picked = all.filter(() => Math.random() < 0.5);
    if (!picked.length) {
      hoverBusyRef.current = false;
      return;
    }

    hoverTlRef.current = gsap
      .timeline({ onComplete: () => (hoverBusyRef.current = false) })
      .to(
        picked,
        {
          duration: 0.2,
          ease: "power2.in",
          y: "-100%",
          opacity: 0,
          stagger: hoverStagger,
        },
        0,
      )
      .fromTo(
        picked,
        { y: "35%" },
        {
          duration: 0.6,
          ease: "power4.out",
          y: "0%",
          opacity: 1,
          stagger: hoverStagger,
        },
        0.2,
      );
  };

  return (
    <div
      className={`${uid} relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: pageBg, fontFamily: bodyFont }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
.${uid} .${uid}-letter { display:inline-block; white-space:pre; will-change:transform; }
.${uid} .${uid}-title::after { content:''; position:absolute; width:3rem; height:1px; background:currentColor; top:100%; left:0; }
.${uid} .${uid}-enter::after { content:''; position:absolute; width:100%; height:1px; background:currentColor; top:calc(100% + 0.15rem); left:0; opacity:0; transform:scaleX(0); transform-origin:0% 50%; transition:opacity .3s, transform .3s; }
.${uid} .${uid}-enter:hover::after { opacity:1; transform:scaleX(1); }
.${uid} .${uid}-select-item:hover { color:${selectActiveColor} !important; }
.${uid} .${uid}-social:hover { color:${socialHoverColor} !important; }
.${uid} .${uid}-back svg path { fill:none; transition:fill .3s; }
.${uid} .${uid}-back:hover svg path { fill:currentColor; }
@media (prefers-reduced-motion: reduce) {
  .${uid} .${uid}-enter::after { transition:none; }
}
`,
        }}
      />

      <section className="absolute inset-0 grid grid-cols-1 grid-rows-[40px_auto_auto_auto_auto] gap-x-4 p-8 pointer-events-none md:grid-cols-[50%_250px_auto] md:grid-rows-[repeat(4,25%)] md:px-12 md:pt-12 md:pb-8">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to intro"
          className={`${uid}-back pointer-events-auto col-start-1 row-start-1 h-[22px] w-8 self-start justify-self-start border-0 bg-transparent p-0`}
          style={{ color: titleColor }}
        >
          <svg width="32" height="22" viewBox="0 0 32 22" aria-hidden="true">
            <path
              d="M1.301 10.658L11.615.344 14.39 3.12 8.616 8.893H30.73v3.923H8.617l5.773 5.774-2.775 2.774L1.301 11.05a.28.28 0 0 1 0-.392z"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </button>

        <h3
          className={`${uid}-title relative col-start-1 row-start-2 m-0 mb-4 pb-4 text-[2.5rem] leading-none md:mb-16 md:pb-8 md:text-[4.5rem]`}
          style={{
            color: titleColor,
            fontFamily: displayFont,
            fontWeight: 700,
          }}
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>

        <p
          className="col-start-1 row-start-3 m-0 hyphens-auto text-[0.95rem] leading-relaxed md:row-start-3 md:max-w-[250px]"
          style={{ color: textColor }}
        >
          {text}
        </p>

        <div className="col-start-1 row-start-4 md:row-start-4 md:mt-auto md:self-end">
          <div className="flex gap-4 md:mt-0">
            {socialLinks.map((s, i) => (
              <span
                key={i}
                role="link"
                tabIndex={0}
                className={`${uid}-social pointer-events-auto cursor-pointer text-[0.95rem] transition-colors`}
                style={{ color: socialColor }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="col-start-1 row-start-5 mt-6 md:col-start-3 md:row-start-4 md:mt-auto md:self-end md:text-right">
          <h4
            className="m-0 inline-block cursor-default text-[0.95rem] md:block"
            style={{ color: selectActiveColor }}
          >
            {selectHeading}
          </h4>
          {selectItems.map((item, i) => (
            <span
              key={i}
              role="link"
              tabIndex={0}
              className={`${uid}-select-item pointer-events-auto ml-2 inline-block cursor-pointer text-[0.95rem] transition-colors md:ml-0 md:block`}
              style={{
                color: i === selectIndex ? selectActiveColor : selectColor,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <div
          ref={reelRef}
          className="col-start-1 row-start-6 max-w-[250px] self-start md:col-start-2 md:row-start-2 md:row-span-3 md:-mb-32"
        >
          {images.map((src, i) => (
            <div key={i} className="flex items-start">
              <img
                src={src}
                alt=""
                className="block w-[200px] mb-6"
                draggable={false}
              />
              <span
                className="ml-auto block w-10 text-[2.75rem] leading-none"
                style={{
                  color: numberColor,
                  fontFamily: displayFont,
                  fontWeight: 700,
                }}
              >
                {reelNumbers[i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div
        ref={panelRef}
        className="absolute inset-0"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div
          ref={innerRef}
          className="absolute left-1/2 top-1/2 overflow-hidden"
          style={{
            width: `calc(100vw * ${cos} + 100vh * ${sin})`,
            height: `calc(100vw * ${sin} + 100vh * ${cos})`,
            marginLeft: `calc((100vw * ${cos} + 100vh * ${sin}) / -2)`,
            marginTop: `calc((100vw * ${sin} + 100vh * ${cos}) / -2)`,
            backgroundColor: panelColor,
            willChange: "transform",
          }}
        >
          <div
            ref={reverseRef}
            className="flex h-full w-full flex-col items-center justify-center"
            style={{ willChange: "transform" }}
          >
            <div className="grid h-screen w-screen grid-cols-1 grid-rows-[auto_40vh_20vh_auto] items-center justify-items-center">
              <div
                ref={introImgRef}
                className="relative row-start-2 row-span-2 col-start-1 h-full max-h-[600px] w-[320px] bg-cover"
                style={{
                  backgroundImage: `url(${introImage})`,
                  backgroundPosition: "50% 0%",
                  willChange: "transform",
                }}
              />
              <h2
                ref={introTitleRef}
                className="relative row-start-2 row-span-2 col-start-1 m-0 cursor-default text-[8vw] leading-none"
                style={{
                  color: introTitleColor,
                  fontFamily: displayFont,
                  fontWeight: 700,
                }}
              >
                {letters.map((ch, i) => (
                  <span key={i} className={`${uid}-letter`}>
                    {ch}
                  </span>
                ))}
              </h2>
              <span
                ref={enterRef}
                role="button"
                tabIndex={0}
                onClick={handleEnter}
                onKeyDown={(e) => (e.key === "Enter" ? handleEnter() : null)}
                onMouseEnter={handleHover}
                className={`${uid}-enter relative row-start-3 col-start-1 cursor-pointer text-[1.4rem] select-none`}
                style={{ color: enterColor, willChange: "transform" }}
              >
                {enterLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
