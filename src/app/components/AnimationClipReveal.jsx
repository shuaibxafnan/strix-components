"use client";

import { useEffect, useId, useRef } from "react";

// ─── HeroClipReveal ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #070707     Page background
// counterTarget      number   100         Value the corner counter animates up to during the intro
// slides             array    (3 slides)  Array of { title, caption } — cycled in sync as the arrows are clicked
// centerVideoSrcs    array    (3 mp4 urls) The three crossfading videos shown in the center "from-video" box
// centerVideoPoster  string   (poster img) Poster image behind the center box before the intro reveal
// secondImgSrc       string   (img url)   Image for the second intro box
// thirdImgSrc        string   (img url)   Image for the third intro box
// leftColumnSets     array    (4 image trios) Array of { orange, blue, green } — repeated to fill the scrolling left column
// leftLoopRepeats    number   2           How many times leftColumnSets repeats to build the seamless scroll loop
// rightImageSet      object   { blue, green, orange }   The three crossfading images in the bottom-right thumbnail
// arrowImgSrc        string   (arrow img) Icon used for both carousel arrows
// hopEase            string   "M0,0 C0.3,0 0.1,1 1,1"   CustomEase path registered as "hop", used for nearly every tween
// introBoxDuration    number  0.5         Duration (s) of each box's clip-path reveal during the intro
// scrollDuration     number   16          Duration (s) of one full loop of the infinite left-column scroll
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  { title: "Eyewear", caption: "Clean lines built for everyday wear." },
  { title: "Classic", caption: "Timeless frames with a refined edge." },
  { title: "Sunwear", caption: "Bold shapes made for bright days." },
];

const DEFAULT_LEFT_COLUMN_SETS = [
  {
    orange: "https://i.postimg.cc/fLjVwDnP/Orange-1.png",
    blue: "https://i.postimg.cc/prRn8yJx/Blue-1.png",
    green: "https://i.postimg.cc/3xd02smy/Green-01.png",
  },
  {
    orange: "https://i.postimg.cc/SRSJR3mx/Orange-2.png",
    blue: "https://i.postimg.cc/L6418Ys3/Blue-2.png.png",
    green: "https://i.postimg.cc/2SMbG070/Green-02.png",
  },
  {
    orange: "https://i.postimg.cc/d35Dy60m/Orange-3.png",
    blue: "https://i.postimg.cc/44QcGbX3/Blue-3.png",
    green: "https://i.postimg.cc/rp4dP5hM/Green-03.png",
  },
  {
    orange: "https://i.postimg.cc/c1hv2xcg/Orange-4.png",
    blue: "https://i.postimg.cc/YqXmGrGK/Blue-4.png",
    green: "https://i.postimg.cc/Y9w4KjVg/Green-04.png",
  },
];

export default function AnimationClipReveal({
  bgColor = "#070707",
  counterTarget = 100,
  slides = DEFAULT_SLIDES,
  centerVideoSrcs = [
    "https://www.dropbox.com/scl/fi/pgzc27bvjlh4wqs1a0x42/video_1.mp4?rlkey=hdvvg5tsl4kfmbbg4zimy2mgi&st=hn6f5srf&raw=1",
    "https://www.dropbox.com/scl/fi/40nwbkzo84ngv4azzr18k/video_2.mp4?rlkey=y4qy8jz3rzj657wgwzphg3f91&st=4tnwiipr&raw=1",
    "https://www.dropbox.com/scl/fi/17vt73otfh85ak3t0bwyc/video_3.mp4?rlkey=b2b4ebwrmup5zdeek8e7wpk7y&st=gsaykje1&raw=1",
  ],
  centerVideoPoster = "https://i.postimg.cc/vZR3KthZ/1-167-217.png",
  secondImgSrc = "https://i.postimg.cc/YSM8r2Jc/3.png",
  thirdImgSrc = "https://i.postimg.cc/t4h2Gnvt/2-167-293.png",
  leftColumnSets = DEFAULT_LEFT_COLUMN_SETS,
  leftLoopRepeats = 2,
  rightImageSet = {
    blue: "https://i.postimg.cc/TPx9tsNk/2-167-293.png",
    green: "https://i.postimg.cc/K8kV6CNx/Green-1.png",
    orange: "https://i.postimg.cc/N0xxSxWQ/1-167-217.png",
  },
  arrowImgSrc = "https://i.postimg.cc/VkQmbrXn/arrow.png",
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
                `.${
                  imageSequences[
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

  const scopedCss = `
    .wrapper-${uid} { display:flex; width:400px; height:268px; position:absolute; justify-content:center; align-items:center; }
    .description-center-${uid} { display:flex; position:absolute; top:-165px; justify-content:space-between; width:100%; align-items:flex-end; }

    .numbers-${uid} { display:flex; height:11px; overflow:hidden; }
    .numbers-${uid} span, .numbers-${uid} p, .count-text-${uid} { line-height:11px; font-size:12px; display:flex; }
    .hide-text-${uid} { display:flex; transform:translateY(100%); transition:all .6s cubic-bezier(.3,0,.1,1); }
    .numbers-${uid} .hide-text-${uid}:nth-of-type(1) { position:absolute; top:0; right:0; transform:translateY(-100%); overflow:hidden; }
    .numbers-${uid} .hide-text-${uid}:nth-of-type(1) p { transition:all .6s cubic-bezier(.3,0,.1,1); transform:translateY(-100%); }
    .try-${uid} { display:flex; flex-direction:column; transform:translateY(0); transition:all .6s cubic-bezier(.3,0,.1,1); }
    .numbers-${uid}.active .hide-text-${uid} { transform:translateY(0); }
    .numbers-${uid}.active .hide-text-${uid}:nth-of-type(1) p { transform:translateY(0); }

    .description-bottom-${uid} { display:flex; flex-direction:column; gap:10px; position:absolute; bottom:-150px; left:0; width:320px; }
    .info-col-${uid} { display:flex; flex-direction:column; gap:10px; }
    .info-col-${uid} .hide-text-${uid} { position:relative; overflow:hidden; }
    .info-col-${uid} .hide-text-${uid} p { transition:all .6s cubic-bezier(.3,0,.1,1); transform:translateY(-200%); position:absolute; color:#fff; }
    .info-col-${uid} .hide-text-${uid} p:nth-of-type(2) { transform:translateY(200%); }
    .info-col-${uid} .hide-text-${uid} p.active { transform:translateY(0); transition-delay:.3s; }
    .info-col-${uid} .title-line-${uid} { height:30px; }
    .info-col-${uid} .title-line-${uid} p { font-size:26px; font-weight:800; text-transform:uppercase; letter-spacing:-0.02em; line-height:1; white-space:nowrap; }
    .info-col-${uid} .caption-line-${uid} { height:34px; }
    .info-col-${uid} .caption-line-${uid} p { font-size:13px; font-weight:400; line-height:1.4; color:rgba(255,255,255,.6); max-width:300px; white-space:normal; }

    .box-${uid} { display:flex; position:absolute; width:400px; height:268px; overflow:hidden; align-items:center; justify-content:center; z-index:1; clip-path:polygon(0% 100%,100% 100%,100% 100%,0% 100%); }
    .box-${uid} img { width:400px; position:absolute; transform:scale(1.9); clip-path:polygon(0% 0%,100% 0%,100% 100%,0% 100%); }
    .video1-${uid} { display:none; width:400px; transform:scale(1) translateY(16px); opacity:0; position:absolute; clip-path:polygon(0% 0%,100% 0%,100% 100%,0% 100%); }
    .video2-${uid}, .video3-${uid} { display:none; width:400px; clip-path:polygon(100% 100%,100% 100%,100% 100%,100% 100%); position:absolute; }
    .box-${uid}.active { bottom:unset; transform-origin:center; }

    .counter-${uid} { display:flex; width:238px; height:238px; justify-content:center; align-items:center; position:relative; }
    .counter-current-${uid} { color:#fff; z-index:0; display:flex; overflow:hidden; }
    .counter-current-${uid} p { transform:translateY(100%); }
    .counter-line-${uid} { display:flex; position:absolute; opacity:.4; transition:all .6s cubic-bezier(.3,0,.1,1); }
    .counter-line-${uid}:nth-of-type(1) { top:0; width:1px; height:93px; transform-origin:bottom center; }
    .counter-line-${uid}:nth-of-type(2) { right:0; height:1px; width:93px; transform-origin:left center; }
    .counter-line-${uid}:nth-of-type(3) { bottom:0; width:1px; height:93px; transform-origin:top center; }
    .counter-line-${uid}:nth-of-type(4) { left:0; height:1px; width:93px; transform-origin:right center; }
    .counter-line-${uid}::after { content:""; display:flex; width:0%; height:0%; position:absolute; background-color:#d9d9d9; bottom:0; transition:all .6s cubic-bezier(.3,0,.1,1); }
    .counter-line-${uid}:nth-of-type(3)::after { bottom:unset; top:0; }
    .counter-line-${uid}:nth-of-type(4)::after { right:0; }
    .counter-line-${uid}.active::after { width:100%; height:100%; }

    .wrapper-left-${uid} { display:flex; width:284px; position:absolute; top:0; left:0; flex-direction:column; overflow:hidden; }
    .box-left-${uid} { display:flex; position:relative; height:440px; overflow:hidden; margin-bottom:13px; align-items:center; clip-path:polygon(0 0,0% 0,0% 100%,0 100%); }
    .box-left-${uid} img { width:284px; position:absolute; transform:scale(2); display:none; }
    .box-left-${uid} .orange-${uid} { display:flex; z-index:1; }
    .box-left-${uid} .blue-${uid}, .box-left-${uid} .green-${uid} { z-index:1; clip-path:polygon(0 100%,100% 100%,100% 100%,0 100%); }

    .wrapper-right-${uid} { display:flex; width:178px; position:absolute; right:0; bottom:100px; cursor:pointer; }
    .box-right-${uid} { display:flex; position:relative; width:178px; height:241px; align-items:center; overflow:hidden; clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%); }
    .box-right-${uid} img { width:178px; position:absolute; transform:scale(1.5); display:none; }
    .box-right-${uid} .blue-${uid} { display:flex; }
    .box-right-${uid} .green-${uid}, .box-right-${uid} .orange-${uid} { clip-path:polygon(100% 100%,100% 100%,100% 100%,100% 100%); }

    .buttons-arrow-${uid} { display:flex; position:absolute; bottom:-60px; left:0; width:178px; gap:8px; overflow:hidden; }
    .buttons-arrow-${uid} .arrow-left-${uid}, .buttons-arrow-${uid} .arrow-right-${uid} { color:#fff; cursor:pointer; width:34px; height:34px; transition:all .6s cubic-bezier(.3,0,.1,1); transform:translateY(-110%); }
    .buttons-arrow-${uid} .arrow-left-${uid}:hover, .buttons-arrow-${uid} .arrow-right-${uid}:hover { opacity:.7; }
    .buttons-arrow-${uid} .arrow-right-${uid} img { transform:rotateY(180deg); }
    .buttons-arrow-${uid} img { width:34px; height:34px; }
    .buttons-arrow-${uid}.active .arrow-left-${uid}, .buttons-arrow-${uid}.active .arrow-right-${uid} { transform:translateY(0px); }
  `;

  const leftLoopItems = Array.from(
    { length: leftLoopRepeats },
    () => leftColumnSets,
  ).flat();

  return (
    <main
      className={`hero-${uid} relative w-full overflow-hidden`}
      style={{ backgroundColor: bgColor }}
      ref={rootRef}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div className="container relative flex h-screen items-center justify-center">
          {/* center hero stage */}
          <div className={`wrapper-${uid}`}>
            <div className={`description-center-${uid}`}>
              <div className={`numbers-${uid}`}>
                <div className={`hide-text-${uid}`}>
                  <p>+</p>
                </div>
                <div className={`hide-text-${uid}`}>
                  <div className={`count-text-${uid}`}>
                    <span>
                      _0
                      <div className={`try-${uid}`}>
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

            <div className={`description-bottom-${uid}`}>
              <div className={`info-col-${uid}`}>
                <div
                  className={`hide-text-${uid} change-text-${uid} title-line-${uid}`}
                >
                  {slides.map((slide, i) => (
                    <p key={i}>{slide.title}</p>
                  ))}
                </div>
                <div
                  className={`hide-text-${uid} change-text-${uid} caption-line-${uid}`}
                >
                  {slides.map((slide, i) => (
                    <p key={i}>{slide.caption}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className={`box-${uid} from-video-${uid}`}>
              <img src={centerVideoPoster} alt="" />
              <video className={`video1-${uid}`} muted playsInline loop>
                <source src={centerVideoSrcs[0]} type="video/mp4" />
              </video>
              <video className={`video2-${uid}`} muted playsInline loop>
                <source src={centerVideoSrcs[1]} type="video/mp4" />
              </video>
              <video className={`video3-${uid}`} muted playsInline loop>
                <source src={centerVideoSrcs[2]} type="video/mp4" />
              </video>
            </div>
            <div className={`box-${uid}`}>
              <img src={secondImgSrc} alt="" />
            </div>
            <div className={`box-${uid}`}>
              <img src={thirdImgSrc} alt="" />
            </div>

            <div className={`counter-${uid}`}>
              <span className={`counter-current-${uid}`}>
                <p>01</p>
              </span>
              <div className={`counter-line-${uid}`} />
              <div className={`counter-line-${uid}`} />
              <div className={`counter-line-${uid}`} />
              <div className={`counter-line-${uid}`} />
            </div>
          </div>

          {/* left scrolling column */}
          <div className={`wrapper-left-${uid}`}>
            {leftLoopItems.map((set, i) => (
              <div key={i} className={`box-left-${uid}`}>
                <img className={`orange-${uid}`} src={set.orange} alt="" />
                <img className={`blue-${uid}`} src={set.blue} alt="" />
                <img className={`green-${uid}`} src={set.green} alt="" />
              </div>
            ))}
          </div>

          {/* right thumbnail + carousel arrows */}
          <div className={`wrapper-right-${uid}`}>
            <div className={`box-right-${uid}`}>
              <img className={`blue-${uid}`} src={rightImageSet.blue} alt="" />
              <img
                className={`green-${uid}`}
                src={rightImageSet.green}
                alt=""
              />
              <img
                className={`orange-${uid}`}
                src={rightImageSet.orange}
                alt=""
              />
            </div>
            <div className={`buttons-arrow-${uid}`}>
              <div className={`arrow-left-${uid}`}>
                <img src={arrowImgSrc} alt="" />
              </div>
              <div className={`arrow-right-${uid}`}>
                <img src={arrowImgSrc} alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
