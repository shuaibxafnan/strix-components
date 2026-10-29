"use client";

import { useEffect, useId, useRef } from "react";

const EASE = "ease-[cubic-bezier(.3,0,.1,1)]";
const TRANS = `transition-all duration-[600ms] ${EASE}`;

const CLIP_FULL = "[clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]";
const CLIP_BOTTOM = "[clip-path:polygon(0%_100%,100%_100%,100%_100%,0%_100%)]";
const CLIP_POINT =
  "[clip-path:polygon(100%_100%,100%_100%,100%_100%,100%_100%)]";
const CLIP_RIGHT = "[clip-path:polygon(100%_0,100%_0,100%_100%,100%_100%)]";
const CLIP_LEFT = "[clip-path:polygon(0_0,0%_0,0%_100%,0_100%)]";

const unsplash = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const tile = (id) => unsplash(id, 568, 880);
const trio = (url) => ({ orange: url, blue: url, green: url });

const FLOWER_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const DEFAULT_SLIDES = [
  { title: "Eyewear", caption: "Clean lines built for everyday wear." },
  { title: "Classic", caption: "Timeless frames with a refined edge." },
  { title: "Sunwear", caption: "Bold shapes made for bright days." },
];

const DEFAULT_LEFT_COLUMN_SETS = [
  trio(tile("1778961938903-96617183f739")),
  trio(tile("1678112553355-a9dab855ebf3")),
  trio(tile("1743309411498-a0f4f4b96b65")),
  trio(tile("1490682143684-14369e18dce8")),
];

const DEFAULT_TONES = ["", "hue-rotate-[150deg]", "hue-rotate-[250deg]"];

const LINE_CLASSES = [
  "top-0 h-[93px] w-px origin-bottom after:bottom-0",
  "right-0 h-px w-[93px] origin-left after:bottom-0",
  "bottom-0 h-[93px] w-px origin-top after:top-0",
  "left-0 h-px w-[93px] origin-right after:bottom-0 after:right-0",
];

const Arrow = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
    aria-hidden="true"
  >
    {dir === "left" ? (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ) : (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    )}
  </svg>
);

export default function AnimationClipReveal({
  bgColor = "#070707",
  counterTarget = 100,
  slides = DEFAULT_SLIDES,
  centerVideoSrcs = [FLOWER_VIDEO, FLOWER_VIDEO, FLOWER_VIDEO],
  centerVideoPoster = unsplash("1749330513873-09ffa91b0aae", 800, 536),
  secondImgSrc = unsplash("1778789172736-e8ba37c71124", 800, 536),
  thirdImgSrc = "https://interactive-examples.mdn.mozilla.net/media/cc0-images/painted-hand-298-332.jpg",
  leftColumnSets = DEFAULT_LEFT_COLUMN_SETS,
  leftLoopRepeats = 2,
  rightImageSet = trio(unsplash("1634325232058-e7b8f80cc20b", 356, 482)),
  tones = DEFAULT_TONES,
  hopEase = "M0,0 C0.3,0 0.1,1 1,1",
  introBoxDuration = 0.5,
  scrollDuration = 16,
}) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, "");
  const rootRef = useRef(null);

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

    let arrowLeftHandler;
    let arrowRightHandler;
    let arrowLeftEl;
    let arrowRightEl;

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
      ),
    ])
      .then(() => {
        const { gsap, CustomEase } = window;
        const root = rootRef.current;
        if (!gsap || !CustomEase || !root) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(CustomEase);
        CustomEase.create("hop", hopEase);

        const q = (sel) => root.querySelector(sel);
        const qa = (sel) => root.querySelectorAll(sel);

        const wrapperLeft = q(`.wrapper-left-${uid}`);
        const wrapperLeftBox = qa(`.box-left-${uid}`);
        const wrapperRightBox = q(`.box-right-${uid}`);
        const wrapperRightBoxImg = qa(`.box-right-${uid} img`);
        const wrapperRightBoxImgBlue = q(`.box-right-${uid} .blue-${uid}`);
        const box = qa(`.box-${uid}`);
        const counter = q(`.counter-current-${uid} p`);
        const lines = qa(`.counter-line-${uid}`);
        const video = q(`.video1-${uid}`);
        const allVideo = qa(`.from-video-${uid} video`);
        const arrowLeft = q(`.arrow-left-${uid}`);
        const arrowRight = q(`.arrow-right-${uid}`);
        const numbers = q(`.numbers-${uid}`);
        const buttonsArrows = q(`.buttons-arrow-${uid}`);
        const descriptionBottom = q(`.description-bottom-${uid}`);
        const infoCall = descriptionBottom.querySelectorAll(
          `.hide-text-${uid}`,
        );
        const countNumbers = q(`.try-${uid}`);
        const changeTextBlocks = qa(`.change-text-${uid}`);

        const runAdditionalTimeline2 = () => {
          const tl2 = gsap.timeline();
          tl2.to(
            video,
            {
              display: "flex",
              opacity: 1,
              duration: 0.5,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            },
            0,
          );
          tl2.add(() => video.play(), 0);
          tl2.add(() => box[0].classList.add("active"), 0);
          tl2.to(box[0], { height: "420px", duration: 1, ease: "hop" }, 0);
          tl2.to(
            wrapperLeftBox,
            {
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              ease: "hop",
              duration: 1,
              stagger: 0.2,
            },
            0,
          );
          tl2.to(
            qa(`.orange-${uid}`),
            { ease: "hop", duration: 1, scale: 1.5 },
            0,
          );
          tl2.to(
            wrapperRightBox,
            {
              clipPath: "polygon(0% 0,100% 0,100% 100%,0% 100%)",
              ease: "hop",
              duration: 1,
            },
            0,
          );
          tl2.to(
            wrapperRightBoxImgBlue,
            { ease: "hop", duration: 1, scale: 1 },
            0,
          );
          tl2.to(box[2], { display: "none", duration: 0.1 }, 0);
          tl2.to(
            box[0].querySelector("img"),
            { zIndex: -2, duration: 0.1, display: "none" },
            0,
          );
          tl2.add(() => numbers.classList.add("active"), 0);
          tl2.add(() => buttonsArrows.classList.add("active"), 0);
          tl2.add(() => {
            infoCall.forEach((container) => {
              const firstParagraph = container.querySelector("p");
              if (firstParagraph) firstParagraph.classList.add("active");
            });
          }, 0);

          const infiniteScroll = gsap.timeline({ repeat: -1, ease: "linear" });
          infiniteScroll.to(wrapperLeft, {
            y: "-50%",
            duration: scrollDuration,
            ease: "none",
            onComplete: () => gsap.set(wrapperLeft, { y: "0%" }),
          });
          tl2.add(infiniteScroll, "<");

          let isAnimating = false;

          changeTextBlocks.forEach((block) => {
            const paragraphs = block.querySelectorAll("p");
            let activeIndex = 0;
            const updateActiveParagraph = (newIndex) => {
              paragraphs[activeIndex].classList.remove("active");
              activeIndex = newIndex;
              paragraphs[activeIndex].classList.add("active");
            };
            paragraphs[activeIndex].classList.add("active");

            arrowLeft.addEventListener("click", () => {
              if (isAnimating) return;
              const newIndex =
                (activeIndex - 1 + paragraphs.length) % paragraphs.length;
              updateActiveParagraph(newIndex);
            });
            arrowRight.addEventListener("click", () => {
              if (isAnimating) return;
              const newIndex = (activeIndex + 1) % paragraphs.length;
              updateActiveParagraph(newIndex);
            });
          });

          let currentIndex = 0;
          let clickCount = 0;
          const imageSequences = ["orange", "blue", "green"];

          allVideo.forEach((v, index) => {
            if (index !== currentIndex) v.style.display = "none";
            else v.play();
          });

          arrowLeftEl = arrowLeft;
          arrowRightEl = arrowRight;

          arrowLeftHandler = () => {
            isAnimating = true;
            const currentVideo = allVideo[currentIndex];
            const currentRightImg = wrapperRightBoxImg[currentIndex];
            const prevIndex =
              (currentIndex - 1 + allVideo.length) % allVideo.length;
            const prevVideo = allVideo[prevIndex];
            const prevRightImg = wrapperRightBoxImg[prevIndex];

            gsap.set(prevVideo, {
              display: "flex",
              clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
              zIndex: 1,
            });
            prevVideo.play();

            clickCount -= 1;
            if (clickCount < 0) clickCount = 2;
            const yShift = clickCount * -11;

            gsap.to(countNumbers, {
              y: `${yShift}px`,
              ease: "hop",
              duration: 0.3,
            });
            gsap.to(prevVideo, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              onComplete: () => {
                currentVideo.pause();
                currentVideo.style.display = "none";
                prevVideo.style.zIndex = "-1";
              },
            });

            gsap.set(prevRightImg, {
              display: "flex",
              clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
              zIndex: 1,
              scale: 1.5,
            });
            gsap.to(prevRightImg, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              scale: 1.15,
              duration: 1,
              ease: "hop",
              onComplete: () => {
                currentRightImg.style.display = "none";
                prevRightImg.style.zIndex = "-1";
              },
            });

            const prevImageClass =
              imageSequences[
              (currentIndex - 1 + imageSequences.length) %
              imageSequences.length
              ];

            wrapperLeftBox.forEach((b, index) => {
              const nextImg = b.querySelector(
                `.${imageSequences[currentIndex]}-${uid}`,
              );
              const prevImg = b.querySelector(`.${prevImageClass}-${uid}`);
              const tl3 = gsap.timeline();
              tl3.set(prevImg, {
                display: "flex",
                clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
                zIndex: 1,
                scale: 2,
              });
              tl3.to(prevImg, {
                clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)",
                ease: "hop",
                duration: 1,
                scale: 1.1,
                delay: 0.2 + 0.2 * index,
                onComplete: () => {
                  nextImg.style.display = "none";
                  nextImg.style.clipPath =
                    "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)";
                  prevImg.style.zIndex = "-1";
                },
              });
            });

            currentIndex = prevIndex;
            isAnimating = false;
          };

          arrowRightHandler = () => {
            isAnimating = true;
            const currentVideo = allVideo[currentIndex];
            const currentRightImg = wrapperRightBoxImg[currentIndex];
            const nextIndex = (currentIndex + 1) % allVideo.length;
            const nextVideo = allVideo[nextIndex];
            const nextRightImg = wrapperRightBoxImg[nextIndex];

            gsap.set(nextVideo, {
              display: "flex",
              clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
              zIndex: 1,
            });
            nextVideo.play();

            clickCount += 1;
            const yShift = clickCount * -11;
            if (clickCount > 2) {
              clickCount = 0;
              gsap.to(countNumbers, { y: "0px", ease: "hop", duration: 0.3 });
            } else {
              gsap.to(countNumbers, {
                y: `${yShift}px`,
                ease: "hop",
                duration: 0.3,
              });
            }

            gsap.to(nextVideo, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              onComplete: () => {
                currentVideo.pause();
                currentVideo.style.display = "none";
                nextVideo.style.zIndex = "-1";
              },
            });

            gsap.set(nextRightImg, {
              display: "flex",
              clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
              zIndex: 1,
              scale: 1.5,
            });
            gsap.to(nextRightImg, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              scale: 1.15,
              duration: 1,
              ease: "hop",
              onComplete: () => {
                currentRightImg.style.display = "none";
                nextRightImg.style.zIndex = "-1";
              },
            });

            currentIndex = (currentIndex + 1) % imageSequences.length;
            const nextImageClass = imageSequences[currentIndex];

            wrapperLeftBox.forEach((b, index) => {
              const prevImg = b.querySelector(
                `.${imageSequences[
                (currentIndex - 1 + imageSequences.length) %
                imageSequences.length
                ]
                }-${uid}`,
              );
              const nextImg = b.querySelector(`.${nextImageClass}-${uid}`);
              const tl3 = gsap.timeline();
              tl3.set(nextImg, {
                display: "flex",
                clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
                zIndex: 1,
                scale: 2,
              });
              tl3.to(nextImg, {
                clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)",
                ease: "hop",
                duration: 1,
                scale: 1.1,
                delay: 0.2 + 0.2 * index,
                onComplete: () => {
                  prevImg.style.display = "none";
                  prevImg.style.clipPath =
                    "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)";
                  nextImg.style.zIndex = "-1";
                },
              });
            });

            currentIndex = nextIndex;
            isAnimating = false;
          };

          arrowLeft.addEventListener("click", arrowLeftHandler);
          arrowRight.addEventListener("click", arrowRightHandler);
        };

        const tl = gsap.timeline({
          onComplete: () => {
            if (box.length !== 3) return;
            box[1].style.display = "none";

            gsap
              .timeline()
              .to(box[0].querySelector("img"), {
                x: "20px",
                ease: "hop",
                duration: 0.3,
              })
              .to(box[0], {
                x: "-400px",
                ease: "hop",
                duration: 0.6,
                zIndex: 2,
              })
              .to(
                box[0].querySelector("img"),
                { x: "0px", ease: "hop", duration: 0.3 },
                0.5,
              );

            gsap
              .timeline()
              .to(box[2].querySelector("img"), {
                x: "-20px",
                ease: "hop",
                duration: 0.3,
              })
              .to(box[2], { x: "400px", ease: "hop", duration: 0.6 })
              .to(counter, { duration: 0.3, ease: "hop", y: "0%" }, "<")
              .to(
                lines,
                {
                  duration: 0.1,
                  delay: 0.1,
                  onComplete: () =>
                    lines.forEach((line) => line.classList.add("active")),
                },
                "<",
              )
              .to(
                box[2].querySelector("img"),
                { x: "0px", ease: "hop", duration: 0.3 },
                0.5,
              )
              .to(counter, {
                innerHTML: counterTarget,
                duration: 1,
                ease: "hop",
                snap: { innerHTML: 1 },
                onUpdate: () => {
                  counter.textContent = String(
                    Math.round(counter.innerHTML),
                  ).padStart(2, "0");
                },
              })
              .to(lines, { rotation: 180, ease: "hop", duration: 0.3 })
              .to(counter, { duration: 0.3, ease: "hop", y: "100%" })
              .to(lines, {
                duration: 0.3,
                delay: 0.1,
                onComplete: () =>
                  lines.forEach((line) => line.classList.remove("active")),
              })
              .call(() => {
                gsap
                  .timeline()
                  .to(box[0].querySelector("img"), {
                    x: "-20px",
                    ease: "hop",
                    duration: 0.3,
                  })
                  .to(box[0], {
                    x: "0px",
                    ease: "hop",
                    duration: 0.6,
                    zIndex: 2,
                  })
                  .to(
                    box[0].querySelector("img"),
                    { x: "0px", ease: "hop", duration: 0.3 },
                    0.5,
                  );

                const anim4 = gsap
                  .timeline()
                  .to(box[2].querySelector("img"), {
                    x: "20px",
                    ease: "hop",
                    duration: 0.3,
                  })
                  .to(box[2], { x: "0px", ease: "hop", duration: 0.6 })
                  .to(
                    box[2].querySelector("img"),
                    { x: "0px", ease: "hop", duration: 0.3 },
                    0.5,
                  );

                anim4.call(() => runAdditionalTimeline2());
              });
          },
        });

        box.forEach((b) => {
          tl.to(b, {
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: introBoxDuration,
            ease: "hop",
          }).to(
            b.querySelector("img"),
            { scale: 1, y: 20, duration: introBoxDuration, ease: "hop" },
            "<",
          );
        });
      })
      .catch((e) =>
        console.error("[HeroClipReveal] GSAP load failed:", e.message),
      );

    return () => {
      if (arrowLeftHandler && arrowLeftEl)
        arrowLeftEl.removeEventListener("click", arrowLeftHandler);
      if (arrowRightHandler && arrowRightEl)
        arrowRightEl.removeEventListener("click", arrowRightHandler);
    };
  }, [uid, hopEase, counterTarget, scrollDuration, introBoxDuration]);

  /* Fit the center stage to small and short screens. Side columns appear from lg up. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      const s = Math.min(1, window.innerWidth / 440, window.innerHeight / 760);
      el.style.setProperty("--s", s.toFixed(3));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const leftLoopItems = Array.from(
    { length: leftLoopRepeats },
    () => leftColumnSets,
  ).flat();

  /*
    Elements that GSAP animates use [transform:...] instead of scale-* or
    translate-* utilities. Tailwind 4 maps those to separate CSS properties,
    which would stack on top of GSAP's inline transform.
  */
  const leftImg = {
    orange: `flex z-[1] ${tones[0]}`,
    blue: `hidden z-[1] ${CLIP_BOTTOM} ${tones[1]}`,
    green: `hidden z-[1] ${CLIP_BOTTOM} ${tones[2]}`,
  };
  const rightImg = {
    blue: `flex ${tones[1]}`,
    green: `hidden ${CLIP_POINT} ${tones[2]}`,
    orange: `hidden ${CLIP_POINT} ${tones[0]}`,
  };
  const videoTone = (i) => tones[i] || "";

  return (
    <main
      className={`hero-${uid} relative w-full overflow-hidden bg-[var(--hero-bg)] text-white`}
      style={{ "--hero-bg": bgColor }}
      ref={rootRef}
    >
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div className="container relative flex h-screen items-center justify-center">
          {/* center hero stage */}
          <div
            className={`wrapper-${uid} absolute flex h-[268px] w-[400px] items-center justify-center [transform:scale(var(--s,1))]`}
          >
            <div
              className={`description-center-${uid} absolute -top-[165px] flex w-full items-end justify-between`}
            >
              <div
                className={`numbers-${uid} group/num flex h-[11px] overflow-hidden [&_p]:flex [&_p]:text-[12px] [&_p]:leading-[11px] [&_span]:flex [&_span]:text-[12px] [&_span]:leading-[11px]`}
              >
                <div
                  className={`hide-text-${uid} absolute right-0 top-0 flex -translate-y-full overflow-hidden ${TRANS} group-[.active]/num:translate-y-0`}
                >
                  <p
                    className={`-translate-y-full ${TRANS} group-[.active]/num:translate-y-0`}
                  >
                    +
                  </p>
                </div>
                <div
                  className={`hide-text-${uid} flex translate-y-full ${TRANS} group-[.active]/num:translate-y-0`}
                >
                  <div
                    className={`count-text-${uid} flex text-[12px] leading-[11px]`}
                  >
                    <span>
                      _0
                      <div className={`try-${uid} flex flex-col ${TRANS}`}>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                      </div>
                    </span>
                    <span>/03</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`description-bottom-${uid} absolute -bottom-[150px] left-0 flex w-[320px] flex-col gap-[10px]`}
            >
              <div className="flex flex-col gap-[10px]">
                <div
                  className={`hide-text-${uid} change-text-${uid} relative flex h-[30px] translate-y-full overflow-hidden ${TRANS}`}
                >
                  {slides.map((slide, i) => (
                    <p
                      key={i}
                      className={`absolute whitespace-nowrap text-[26px] font-extrabold uppercase leading-none tracking-[-0.02em] text-white ${TRANS} [&.active]:translate-y-0 [&.active]:delay-300 ${i === 1 ? "translate-y-[200%]" : "-translate-y-[200%]"
                        }`}
                    >
                      {slide.title}
                    </p>
                  ))}
                </div>
                <div
                  className={`hide-text-${uid} change-text-${uid} relative flex h-[34px] translate-y-full overflow-hidden ${TRANS}`}
                >
                  {slides.map((slide, i) => (
                    <p
                      key={i}
                      className={`absolute max-w-[300px] whitespace-normal text-[13px] font-normal leading-[1.4] text-white/60 ${TRANS} [&.active]:translate-y-0 [&.active]:delay-300 ${i === 1 ? "translate-y-[200%]" : "-translate-y-[200%]"
                        }`}
                    >
                      {slide.caption}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`box-${uid} from-video-${uid} absolute z-[1] flex h-[268px] w-[400px] items-center justify-center overflow-hidden ${CLIP_BOTTOM}`}
            >
              <img
                src={centerVideoPoster}
                alt=""
                className={`absolute -top-5 left-0 h-[calc(100%_+_40px)] w-full object-cover [transform:scale(1.9)] ${CLIP_FULL}`}
              />
              <video
                className={`video1-${uid} absolute inset-0 hidden h-full w-full object-cover opacity-0 ${CLIP_FULL} ${videoTone(0)}`}
                muted
                playsInline
                loop
              >
                <source src={centerVideoSrcs[0]} type="video/mp4" />
              </video>
              <video
                className={`video2-${uid} absolute inset-0 hidden h-full w-full object-cover ${CLIP_POINT} ${videoTone(1)}`}
                muted
                playsInline
                loop
              >
                <source src={centerVideoSrcs[1]} type="video/mp4" />
              </video>
              <video
                className={`video3-${uid} absolute inset-0 hidden h-full w-full object-cover ${CLIP_POINT} ${videoTone(2)}`}
                muted
                playsInline
                loop
              >
                <source src={centerVideoSrcs[2]} type="video/mp4" />
              </video>
            </div>
            <div
              className={`box-${uid} absolute z-[1] flex h-[268px] w-[400px] items-center justify-center overflow-hidden ${CLIP_BOTTOM}`}
            >
              <img
                src={secondImgSrc}
                alt=""
                className={`absolute -top-5 left-0 h-[calc(100%_+_40px)] w-full object-cover [transform:scale(1.9)] ${CLIP_FULL}`}
              />
            </div>
            <div
              className={`box-${uid} absolute z-[1] flex h-[268px] w-[400px] items-center justify-center overflow-hidden ${CLIP_BOTTOM}`}
            >
              <img
                src={thirdImgSrc}
                alt=""
                className={`absolute -top-5 left-0 h-[calc(100%_+_40px)] w-full object-cover [transform:scale(1.9)] ${CLIP_FULL}`}
              />
            </div>

            <div
              className={`counter-${uid} relative flex h-[238px] w-[238px] items-center justify-center`}
            >
              <span
                className={`counter-current-${uid} z-0 flex overflow-hidden text-white`}
              >
                <p className="[transform:translateY(100%)]">01</p>
              </span>
              {LINE_CLASSES.map((cls, i) => (
                <div
                  key={i}
                  className={`counter-line-${uid} absolute flex opacity-40 ${TRANS} ${cls} after:absolute after:flex after:h-0 after:w-0 after:bg-[#d9d9d9] after:content-[''] after:transition-all after:duration-[600ms] after:ease-[cubic-bezier(.3,0,.1,1)] [&.active]:after:h-full [&.active]:after:w-full`}
                />
              ))}
            </div>
          </div>

          {/* left scrolling column */}
          <div
            className={`wrapper-left-${uid} absolute left-0 top-0 hidden w-[284px] flex-col overflow-hidden lg:flex`}
          >
            {leftLoopItems.map((set, i) => (
              <div
                key={i}
                className={`box-left-${uid} relative mb-[13px] flex h-[440px] items-center overflow-hidden ${CLIP_LEFT}`}
              >
                <img
                  className={`orange-${uid} absolute inset-0 h-full w-full object-cover [transform:scale(2)] ${leftImg.orange}`}
                  src={set.orange}
                  alt=""
                />
                <img
                  className={`blue-${uid} absolute inset-0 h-full w-full object-cover [transform:scale(2)] ${leftImg.blue}`}
                  src={set.blue}
                  alt=""
                />
                <img
                  className={`green-${uid} absolute inset-0 h-full w-full object-cover [transform:scale(2)] ${leftImg.green}`}
                  src={set.green}
                  alt=""
                />
              </div>
            ))}
          </div>

          {/* right thumbnail and carousel arrows */}
          <div
            className={`wrapper-right-${uid} absolute bottom-[100px] right-0 flex w-[178px] cursor-pointer max-lg:left-1/2 max-lg:right-auto max-lg:-translate-x-1/2`}
          >
            <div
              className={`box-right-${uid} relative hidden h-[241px] w-[178px] items-center overflow-hidden lg:flex ${CLIP_RIGHT}`}
            >
              <img
                className={`blue-${uid} absolute inset-0 h-full w-full object-cover [transform:scale(1.5)] ${rightImg.blue}`}
                src={rightImageSet.blue}
                alt=""
              />
              <img
                className={`green-${uid} absolute inset-0 h-full w-full object-cover [transform:scale(1.5)] ${rightImg.green}`}
                src={rightImageSet.green}
                alt=""
              />
              <img
                className={`orange-${uid} absolute inset-0 h-full w-full object-cover [transform:scale(1.5)] ${rightImg.orange}`}
                src={rightImageSet.orange}
                alt=""
              />
            </div>
            <div
              className={`buttons-arrow-${uid} group/arrows absolute -bottom-[60px] left-0 flex w-[178px] gap-2 overflow-hidden max-lg:justify-center`}
            >
              <button
                type="button"
                aria-label="Previous slide"
                className={`arrow-left-${uid} h-[34px] w-[34px] -translate-y-[110%] cursor-pointer p-1 text-white ${TRANS} hover:opacity-70 group-[.active]/arrows:translate-y-0`}
              >
                <Arrow dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className={`arrow-right-${uid} h-[34px] w-[34px] -translate-y-[110%] cursor-pointer p-1 text-white ${TRANS} hover:opacity-70 group-[.active]/arrows:translate-y-0`}
              >
                <Arrow dir="right" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}