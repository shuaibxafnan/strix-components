"use client";

import { useEffect, useMemo, useRef } from "react";

const DEFAULT_PICS = [
  "https://images.unsplash.com/photo-1542662565-7e4b66bae529?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=282&q=80",
  "https://images.unsplash.com/photo-1525153537143-f88592837fb1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=332&q=80",
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=309&q=80",
  "https://images.unsplash.com/photo-1436891620584-47fd0e565afb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=750&q=80",
];

const DEFAULT_TITLES = ["Mountain", "Stars", "Skies", "Water", "Trips"];
const DEFAULT_TYPES = ["Guide", "Planner", "Discuss"];

function CardContent({ pic, title, type, isReflection, bgCssVar }) {
  return (
    <>
            <div className="card__content bg-gray-800 overflow-hidden relative h-full w-full rounded-md font-sans">
                <img
          className="absolute inset-0 h-full w-full object-cover scale-110"
          src={pic}
          alt={title}
        />
                <div className="absolute inset-0 pt-52 flex items-center justify-center flex-col">
          <span className="text-gray-300 uppercase text-xs w-full text-center">
            {type}
          </span>
          <h2 className="p-2 text-white font-black text-xl text-center w-full pb-12">
            {title}
          </h2>
        </div>
      </div>

            {isReflection ? (
        <div
          className="z-50 absolute inset-0 h-full w-full"
          style={{
            background: `linear-gradient(${bgCssVar} 50%, transparent)`,
            clipPath: "inset(50% 0 0 0)",
          }}
        />
      ) : (
        <div className="z-50 absolute inset-0 h-full w-full" />
      )}
    </>
  );
}

function SingleCard({ pic, title, type, bgColor, reflectionBlur }) {
  return (
    <li className="card w-56 h-72 absolute">
            <div className="card__card h-full w-full">
        <CardContent
          pic={pic}
          title={title}
          type={type}
          isReflection={false}
          bgCssVar={bgColor}
        />
      </div>

            <div
        aria-hidden="true"
        className="absolute h-full w-full top-8 left-0 rounded-md overflow-hidden"
        style={{
          filter: `blur(${reflectionBlur}px)`,
          transition: "0.2s ease",

          transform:
            "translate3d(0, 0, 0) rotate(180deg) translate(0, -100%) rotateY(180deg)",
        }}
      >
        <CardContent
          pic={pic}
          title={title}
          type={type}
          isReflection
          bgCssVar={bgColor}
        />
      </div>
    </li>
  );
}

export default function LoopReflectionCarousel({
  pics = DEFAULT_PICS,
  titles = DEFAULT_TITLES,
  types = DEFAULT_TYPES,
  cardCount = 10,
  spacing = 0.2,
  scrollLength = 3000,
  bgColor = "hsl(220, 34%, 5%)",
  reflectionBlur = 5,
  className = "",
}) {
  const galleryRef = useRef(null);
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);

  const cardTypes = useMemo(
    () =>
      Array.from(
        { length: cardCount },
        (_, i) => types[(i * 3 + 1) % types.length],
      ),
    [cardCount, types],
  );

  useEffect(() => {

    let cleanupFn = null;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapMod, stMod]) => {
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        if (cancelled || !galleryRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const {
          to,
          set,
          utils: { snap, toArray },
        } = gsap;

        const buildLoop = (cards, cardSpacing) => {
          const OVERLAP = Math.ceil(1 / cardSpacing);
          const START = cards.length * cardSpacing + 0.5;
          const LOOP_TIME = (cards.length + OVERLAP) * cardSpacing + 1;

          const RAW = gsap.timeline({ paused: true });
          const LOOP = gsap.timeline({
            paused: true,
            repeat: -1,
            onRepeat() {

              this._time === this._dur && (this._tTime += this._dur - 0.01);
            },
          });

          const L = cards.length + OVERLAP * 2;

          set(cards, { xPercent: 5000, opacity: 0, scale: 0 });

          for (let i = 0; i < L; i++) {
            const index = i % cards.length;
            const item = cards[index];
            const time = i * cardSpacing;

            RAW.fromTo(
              item,
              { opacity: 0 },
              {
                opacity: 1,
                delay: 0.25,
                duration: 0.25,
                yoyo: true,
                ease: "none",
                repeat: 1,
                immediateRender: false,
              },
              time,
            )
              .fromTo(
                item,
                { scale: 0 },
                {
                  scale: 1,
                  zIndex: 100,
                  duration: 0.5,
                  yoyo: true,
                  repeat: 1,
                  ease: "none",
                  immediateRender: false,
                },
                time,
              )

              .fromTo(
                item,
                { xPercent: 250 },
                {
                  xPercent: -250,
                  duration: 1,
                  ease: "none",
                  immediateRender: false,
                },
                time,
              );

            if (i <= cards.length) LOOP.add("label" + i, time);
          }

          RAW.time(START);
          LOOP.to(RAW, {
            time: LOOP_TIME,
            duration: LOOP_TIME - START,
            ease: "none",
          }).fromTo(
            RAW,
            { time: OVERLAP * cardSpacing + 1 },
            {
              time: START,
              duration: START - (OVERLAP * cardSpacing + 1),
              immediateRender: false,
              ease: "none",
            },
          );

          return LOOP;
        };

        let iteration = 0;
        const CARD_SNAP = snap(spacing);
        const CARDS = toArray(".card", galleryRef.current);
        const LOOP = buildLoop(CARDS, spacing);

        const SCRUB = to(LOOP, {
          totalTime: 0,
          duration: 0.5,
          ease: "power3",
          paused: true,
        });

        let TRIGGER;

        const scrubTo = (totalTime) => {
          const progress =
            (totalTime - LOOP.duration() * iteration) / LOOP.duration();
          if (progress > 1) {
            wrapForward();
          } else if (progress < 0) {
            wrapBackward();
          } else {
            TRIGGER.scroll(
              TRIGGER.start + progress * (TRIGGER.end - TRIGGER.start),
            );
          }
        };

        const wrapForward = () => {
          iteration++;
          TRIGGER.wrapping = true;
          TRIGGER.scroll(TRIGGER.start + 1);
        };

        const wrapBackward = () => {
          iteration--;
          if (iteration < 0) {

            iteration = 9;
            LOOP.totalTime(LOOP.totalTime() + LOOP.duration() * 10);
          }
          TRIGGER.wrapping = true;
          TRIGGER.scroll(TRIGGER.end - 1);
        };

        TRIGGER = ScrollTrigger.create({
          start: 0,
          end: `+=${scrollLength}`,
          horizontal: false,
          pin: galleryRef.current,
          onUpdate: (self) => {
            if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
              wrapForward();
            } else if (
              self.progress < 1e-5 &&
              self.direction < 0 &&
              !self.wrapping
            ) {
              wrapBackward();
            } else {
              SCRUB.vars.totalTime = CARD_SNAP(
                (iteration + self.progress) * LOOP.duration(),
              );
              SCRUB.invalidate().restart();
              self.wrapping = false;
            }
          },
        });

        const handleNext = () => scrubTo(SCRUB.vars.totalTime + spacing);
        const handlePrev = () => scrubTo(SCRUB.vars.totalTime - spacing);

        const nextEl = nextBtnRef.current;
        const prevEl = prevBtnRef.current;
        nextEl?.addEventListener("click", handleNext);
        prevEl?.addEventListener("click", handlePrev);

        cleanupFn = () => {
          nextEl?.removeEventListener("click", handleNext);
          prevEl?.removeEventListener("click", handlePrev);
          TRIGGER.kill(true);
          LOOP.kill();
          SCRUB.kill();
        };
      },
    );

    return () => {
      cancelled = true;
      if (cleanupFn) cleanupFn();
    };

  }, [spacing, scrollLength]);

  return (
    <>
            <style>{`
        .card:hover {
          --card-y: -2%;
        }
        .card__card {
          transform: translate3d(0, var(--card-y, 0), 0);
          transition: 0.1s ease;
        }
      `}</style>

              <div
          className="gallery w-full h-full relative"
          ref={galleryRef}
          style={{ background: bgColor }}
        >
                    <ul className="gallery__content w-56 h-72 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <SingleCard
                key={i}
                pic={pics[i % pics.length]}
                title={titles[i % titles.length]}
                type={cardTypes[i]}
                bgColor={bgColor}
                reflectionBlur={reflectionBlur}
              />
            ))}
          </ul>

                    <div className="gallery__actions">
                        <button
              ref={prevBtnRef}
              className="gallery__prev outline-none absolute z-10 rounded-full transition left-8 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              <span className="sr-only">Prev</span>
              <svg
                className="h-12 w-12 fill-current text-white"
                viewBox="0 0 256 512"
                title="Previous"
              >
                <path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z" />
              </svg>
            </button>

                        <button
              ref={nextBtnRef}
              className="gallery__next outline-none absolute z-10 rounded-full right-8 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-12 w-12 fill-current text-white"
                viewBox="0 0 256 512"
                title="Next"
              >
                <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" />
              </svg>
            </button>
          </div>
        </div>
    </div>
  );
}
