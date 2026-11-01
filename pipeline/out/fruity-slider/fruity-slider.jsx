"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

const DEFAULT_SLIDES = [
  {
    name: "Watermelon",
    logoColor: "#ec4458",
    bgColor: "#ffb2b2",
    canImage:
      "https://ik.imagekit.io/akiAfnan/Asher/watermelon-drink.png?updatedAt=1774696994099",
    canAlt: "Watermelon drink can",
    fruitImage:
      "https://ik.imagekit.io/akiAfnan/Asher/watermelon.png?updatedAt=1774711186645",
    fruitAlt: "Watermelon slice",
  },
  {
    name: "Orange",
    logoColor: "#e8590c",
    bgColor: "#ffcf9e",
    canImage:
      "https://ik.imagekit.io/akiAfnan/Asher/orange-drink.png?updatedAt=1774696994259",
    canAlt: "Orange drink can",
    fruitImage:
      "https://ik.imagekit.io/akiAfnan/Asher/loader.png?updatedAt=1760863286005",
    fruitAlt: "Orange",
  },
  {
    name: "Pineapple",
    logoColor: "#8a6d00",
    bgColor: "#f4ee9e",
    canImage:
      "https://ik.imagekit.io/akiAfnan/Asher/pineapple-drink.png?updatedAt=1774696994169",
    canAlt: "Pineapple drink can",
    fruitImage:
      "https://ik.imagekit.io/akiAfnan/Asher/pine-apple.png?updatedAt=1760888158614",
    fruitAlt: "Pineapple",
  },
];

const DEFAULT_FRUIT_SPOTS = [
  { className: "bottom-[4%] left-[1%] w-[17vmin]", rotate: -25, scale: 1.1 },
  { className: "left-[3%] top-[10%] w-[15vmin]", rotate: 18, scale: 0.9 },
  { className: "right-[24%] top-[3%] w-[10vmin]", rotate: -12, scale: 0.85 },
  { className: "right-[3%] top-[12%] w-[15vmin]", rotate: 28, scale: 1 },
  { className: "bottom-[6%] right-[20%] w-[20vmin]", rotate: -35, scale: 1.2 },
  { className: "bottom-[3%] left-[27%] w-[10vmin]", rotate: 40, scale: 0.8 },
];

const Chevron = ({ direction }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[40%] w-[40%]"
    aria-hidden="true"
  >
    <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function FruitySlider({
  slides = DEFAULT_SLIDES,
  fruitSpots = DEFAULT_FRUIT_SPOTS,
  prevLabel = "Previous flavor",
  nextLabel = "Next flavor",
  transitionDuration = 900,
  waveDuration = "3s",
  buttonSize = "80px",
  className = "",
}) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const rootRef = useRef(null);
  const stripRef = useRef(null);
  const ctxRef = useRef(null);
  const slideRefs = useRef([]);
  const nameRefs = useRef([]);

  const last = slides.length - 1;
  const seconds = transitionDuration / 1000;

  const enterSlide = (i, dir) => {
    const slide = slideRefs.current[i];
    if (!slide) return;
    const q = gsap.utils.selector(slide);

    gsap.fromTo(
      q("[data-name]"),
      { xPercent: dir * 18, yPercent: dir === 0 ? 15 : 0, opacity: 0 },
      {
        xPercent: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: dir === 0 ? 0.2 : seconds * 0.25,
        overwrite: "auto",
      },
    );
    gsap.fromTo(
      q("[data-can]"),
      { yPercent: 55, scale: 0.7, rotation: dir * -10, opacity: 0 },
      {
        yPercent: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1.1,
        ease: "power4.out",
        delay: dir === 0 ? 0.3 : seconds * 0.35,
        overwrite: "auto",
      },
    );
    gsap.fromTo(
      q("[data-fruit]"),
      { y: "-110vh", rotation: -40, opacity: 0 },
      {
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 1,
        ease: "back.out(1.3)",
        stagger: 0.09,
        delay: dir === 0 ? 0.45 : seconds * 0.45,
        overwrite: "auto",
      },
    );
  };

  const go = (dir) => {
    const next = Math.min(last, Math.max(0, indexRef.current + dir));
    if (next === indexRef.current) return;
    const direction = next > indexRef.current ? 1 : -1;
    indexRef.current = next;
    setIndex(next);

    ctxRef.current?.add(() => {
      gsap.to(stripRef.current, {
        xPercent: -next * (100 / slides.length),
        duration: seconds,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      enterSlide(next, direction);
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    ctxRef.current = gsap.context(() => {
      gsap.set("[data-fruit-img]", {
        rotation: (_, el) => parseFloat(el.dataset.rot),
        scale: (_, el) => parseFloat(el.dataset.scale),
      });
      gsap.to("[data-fruit-img]", {
        x: () => gsap.utils.random(-16, 16),
        y: () => gsap.utils.random(-16, 16),
        duration: () => gsap.utils.random(2, 3.6),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to("[data-can-img]", {
        y: -10,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      enterSlide(0, 0);
    }, root);

    return () => ctxRef.current?.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const fit = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      nameRefs.current.forEach((el) => {
        if (!el) return;
        el.style.fontSize = "100px";
        const size = Math.min(
          (100 * width * 0.9) / el.scrollWidth,
          height * 0.5,
        );
        el.style.fontSize = `${size}px`;
      });
    };

    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  }, [slides]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides]);

  const prev = slides[index - 1];
  const next = slides[index + 1];

  return (
    <div
      ref={rootRef}
      className={`${lexend.variable} relative h-screen w-full select-none overflow-hidden [font-family:var(--font-lexend)] ${className}`}
      style={{
        "--n": slides.length,
        "--wave": waveDuration,
        "--btn": buttonSize,
      }}
    >
      <div
        ref={stripRef}
        className="flex h-full w-[calc(var(--n)*100%)] will-change-transform"
      >
        {slides.map((slide, i) => (
          <section
            key={slide.name}
            ref={(el) => (slideRefs.current[i] = el)}
            aria-hidden={i !== index}
            className="pointer-events-none relative h-full flex-1 overflow-hidden"
            style={{ backgroundColor: slide.bgColor }}
          >
            {fruitSpots.map((spot, fi) => (
              <div
                key={fi}
                data-fruit
                className={`absolute z-0 opacity-0 ${spot.className}`}
              >
                <img
                  data-fruit-img
                  data-rot={spot.rotate}
                  data-scale={spot.scale}
                  src={slide.fruitImage}
                  alt={fi === 0 ? slide.fruitAlt : ""}
                  className="block h-auto w-full drop-shadow-xl"
                />
              </div>
            ))}

            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <h1
                ref={(el) => (nameRefs.current[i] = el)}
                data-name
                className="m-0 whitespace-nowrap font-normal leading-none text-white opacity-0"
              >
                {slide.name}
              </h1>
            </div>

            <div
              data-can
              className="absolute inset-0 z-20 flex items-center justify-center opacity-0"
            >
              <img
                data-can-img
                src={slide.canImage}
                alt={slide.canAlt}
                className="h-[58vh] w-auto max-w-[70vw] object-contain drop-shadow-2xl md:h-[68vh]"
              />
            </div>
          </section>
        ))}
      </div>

      {prev ? (
        <div className="fixed left-[30px] top-1/2 z-50 -translate-y-1/2 max-sm:left-5 max-sm:top-[90%]">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-50 [animation-duration:var(--wave)]"
            style={{ backgroundColor: prev.bgColor }}
          />
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={prevLabel}
            className="relative flex h-[var(--btn)] w-[var(--btn)] cursor-pointer items-center justify-center rounded-full bg-white transition-colors duration-500 max-sm:h-[60px] max-sm:w-[60px]"
            style={{ color: prev.logoColor }}
          >
            <Chevron direction="left" />
          </button>
        </div>
      ) : null}

      {next ? (
        <div className="fixed right-[30px] top-1/2 z-50 -translate-y-1/2 max-sm:right-5 max-sm:top-[90%]">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-50 [animation-duration:var(--wave)]"
            style={{ backgroundColor: next.bgColor }}
          />
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={nextLabel}
            className="relative flex h-[var(--btn)] w-[var(--btn)] cursor-pointer items-center justify-center rounded-full bg-white transition-colors duration-500 max-sm:h-[60px] max-sm:w-[60px]"
            style={{ color: next.logoColor }}
          >
            <Chevron direction="right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}