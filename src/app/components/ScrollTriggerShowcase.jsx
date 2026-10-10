"use client";

import { useEffect, useRef, useId } from "react";

// ─── ScrollRevealGallery ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #000111    Page/background color behind sections
// heroImage          string   (pexels)   Hero background image URL
// heroTitleTop       string   "Just"     Hero title, first line (plain text)
// heroTitleBottom    string   "scroll"   Hero title, second line (colored span)
// heroTitleSuffix    string   "it."      Hero title, text after colored span
// footerImage        string   (pexels)   Footer background image URL
// footerTitleTop     string   "YOU"      Footer title, first line
// footerTitleBottom  string   "scrollED" Footer title, second line (colored span)
// footerTitleSuffix  string   "it."      Footer title, text after colored span
// accentColor        string   #cde5df    Color used for hero/footer highlighted span
// items              array    [...]      Work items, each shaped as:
//                                          {
//                                            image: string,          // poster/background image
//                                            videos: [{               // each renders as one video tile
//                                              poster: string,
//                                              mp4: string,
//                                              webm: string,
//                                            }],
//                                            titleLines: string[],    // e.g. ["NATURE", "SAVED YOU"]
//                                            titleAccentWord: string, // word inside titleLines[1] to color
//                                            titleAccentColor: string,// hex color for that word
//                                            subtitleLines: string[], // small uppercase lines under title
//                                          }
// revealDuration     number   1.25       Duration (s) of the per-line text reveal animation
// slideDistance      string   "100vw"    Horizontal distance video tiles slide in from
// imageScaleStart    number   1.4        Initial CSS scale applied to each work image
// imageScaleEnd      number   1.2        Scale each work image settles to once revealed
// ──────────────────────────────────────────────────────────────────────────
//
// Note: native browser scrolling drives ScrollTrigger here. Lenis
// (smooth-scroll) was intentionally left out — it isn't reliably hosted on
// cdnjs, so pulling it from a CDN inside a component is fragile. If you
// want Lenis smoothing, `npm install lenis` and wire it up at the app
// layout level instead; ScrollTrigger works fine against plain window
// scroll without it.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    image:
      "https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9430460_11zon.jpg",
    videos: [
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430543-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430543-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430543-uhd_4096_2160_25fps-transcode.webm",
      },
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430549-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430549-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430549-uhd_4096_2160_25fps-transcode.webm",
      },
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430538-uhd_4096_2160_25fps-1-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430538-uhd_4096_2160_25fps-1-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9430538-uhd_4096_2160_25fps-1-transcode.webm",
      },
    ],
    titleLines: ["NATURE", "SAVED YOU"],
    titleAccentWord: "SAVED",
    titleAccentColor: "#ffd9b3",
    subtitleLines: [
      "Rock and Tree",
      "Air and Sea",
      "Land and Life",
      "Leaf and Root",
      "Sand and Sea",
    ],
  },
  {
    image:
      "https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9421335_11zon.jpg",
    videos: [
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421504-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421504-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421504-uhd_4096_2160_25fps-transcode.webm",
      },
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421502-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421502-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421502-uhd_4096_2160_25fps-transcode.webm",
      },
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421500-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421500-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9421500-uhd_4096_2160_25fps-transcode.webm",
      },
    ],
    titleLines: ["TOUCH", "CHANGES YOU"],
    titleAccentWord: "CHANGES",
    titleAccentColor: "#bdd9ff",
    subtitleLines: [
      "Touch and Heal",
      "Kind and True",
      "Hand and Heart",
      "Care and Light",
      "Joy and Peace",
    ],
  },
  {
    image:
      "https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9489270_11zon.jpg",
    videos: [
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489597-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489597-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489597-uhd_4096_2160_25fps-transcode.webm",
      },
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489600-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489600-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489600-uhd_4096_2160_25fps-transcode.webm",
      },
      {
        poster:
          "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489599-uhd_4096_2160_25fps-poster-00001.jpg",
        mp4: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489599-uhd_4096_2160_25fps-transcode.mp4",
        webm: "https://moussamamadou.github.io/scroll-trigger-gsap-section/videos/9489599-uhd_4096_2160_25fps-transcode.webm",
      },
    ],
    titleLines: ["Books", "INSPIRES YOU"],
    titleAccentWord: "INSPIRES",
    titleAccentColor: "#e2ffe2",
    subtitleLines: [
      "Book and Life",
      "Ink and Page",
      "Read and Rise",
      "Verse and Voice",
      "Page and Mind",
    ],
  },
];

function TitleLine({ line, accentWord, accentColor }) {
  if (!accentWord || !line.includes(accentWord)) {
    return <div data-line>{line}</div>;
  }
  const [before, after] = line.split(accentWord);
  return (
    <div data-line>
      {before}
      <span style={{ color: accentColor }}>{accentWord}</span>
      {after}
    </div>
  );
}

export default function ScrollTriggerShowcase({
  bgColor = "#000111",
  heroImage = "https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-8718352-1_11zon_11zon_11zon.jpg",
  heroTitleTop = "Just",
  heroTitleBottom = "scroll",
  heroTitleSuffix = "it.",
  footerImage = "https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-8718345_11zon_11zon_11zon.jpg",
  footerTitleTop = "YOU",
  footerTitleBottom = "scrollED",
  footerTitleSuffix = "it.",
  accentColor = "#cde5df",
  items = DEFAULT_ITEMS,
  revealDuration = 1.25,
  slideDistance = "100vw",
  imageScaleStart = 1.4,
  imageScaleEnd = 1.2,
}) {
  const containerRef = useRef(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let ctx;
    const ghostEls = [];

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

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
    ])
      .then(() => {
        const { gsap } = window;
        if (!gsap || !root) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(window.ScrollTrigger);
        ctx = gsap.context(() => {
          const workSection = root.querySelector('[data-work="section"]');
          const workItems = root.querySelectorAll('[data-work="item"]');

          const ghostContainer = document.createElement("div");
          ghostContainer.className = "relative";
          workSection.appendChild(ghostContainer);

          workItems.forEach(() => {
            const ghostItem = document.createElement("div");
            ghostItem.style.cssText = "width:100%;height:300vh;";
            ghostContainer.appendChild(ghostItem);
            ghostEls.push(ghostItem);
          });

          gsap.set(workItems, {
            position: "fixed",
            top: "0",
            clipPath: "inset(100% 0 0% 0)",
          });

          workItems.forEach((element, index) => {
            const lines = element.querySelectorAll("[data-line]");
            const workImage = element.querySelector('[data-work="image"]');
            const videoContainer = element.querySelectorAll(
              '[data-work="video"]',
            );
            const overlay = element.querySelectorAll(
              '[data-work="item-overlay"]',
            );

            gsap.set(workImage, { scale: imageScaleStart, yPercent: 10 });

            const stStarting = {
              trigger: ghostEls[index],
              scrub: true,
              start: "top bottom",
              end: "+75vh top",
            };

            gsap.to(element, {
              clipPath: "inset(0% 0 0 0)",
              scrollTrigger: stStarting,
            });

            gsap.to(workImage, {
              yPercent: 10,
              scale: imageScaleEnd,
              scrollTrigger: stStarting,
            });

            gsap.from(lines, {
              yPercent: 125,
              rotate: 2.5,
              ease: "power2.inOut",
              duration: revealDuration,
              scrollTrigger: {
                trigger: ghostEls[index],
                start: "top 75%",
                toggleActions: "play reverse restart reverse",
              },
            });

            gsap.to(workImage, {
              filter: "blur(10px)",
              opacity: 0.3,
              ease: "power2.inOut",
              scrollTrigger: {
                trigger: ghostEls[index],
                scrub: true,
                start: "0 top",
                end: "35% top",
              },
            });

            gsap.from(videoContainer, {
              x: index % 2 === 0 ? slideDistance : `-${slideDistance}`,
              scrollTrigger: {
                trigger: ghostEls[index],
                scrub: true,
                start: "0 top",
                end: "65% top",
                onLeave: () => {
                  gsap.set(overlay, { display: "flex", opacity: 0 });
                },
              },
            });

            const stFinal = {
              trigger: ghostEls[index],
              scrub: true,
              start: "105% bottom",
              toggleActions: "play reverse play reverse",
            };

            gsap.fromTo(
              overlay,
              { opacity: 0 },
              { opacity: 1, scrollTrigger: stFinal },
            );

            gsap.to(videoContainer, { yPercent: 15, scrollTrigger: stFinal });
            gsap.to(element, { filter: "blur(1px)", scrollTrigger: stFinal });
          });
        }, root);
      })
      .catch((e) =>
        console.error("[ScrollRevealGallery] script load failed:", e.message),
      );

    return () => {
      if (ctx) ctx.revert();
      ghostEls.forEach((el) => el.remove());
    };
  }, [revealDuration, slideDistance, imageScaleStart, imageScaleEnd]);

  return (
    <div
      ref={containerRef}
      data-uid={uid}
      className="relative w-full"
      style={{ backgroundColor: bgColor }}
    >
      <section className="sticky top-0 z-0 h-screen">
        <div className="relative flex h-full items-end justify-between">
          <div className="absolute inset-0 h-full w-full">
            <img
              src={heroImage}
              loading="lazy"
              alt="hero"
              className="h-full w-full object-cover opacity-60"
            />
          </div>
          <div
            className="relative flex-1 items-center px-[4vw] pb-[4vw] text-[12.5vw] font-medium uppercase leading-[0.9] text-white"
            style={{ fontFamily: "Spacegrotesk, sans-serif" }}
          >
            <div>
              {heroTitleTop}
              <br />
              <span style={{ color: accentColor }}>{heroTitleBottom} </span>
              {heroTitleSuffix}
            </div>
          </div>
        </div>
      </section>

      <section data-work="section" className="relative z-10">
        {items.map((item, i) => (
          <div
            key={i}
            data-work="item"
            className="relative flex h-screen w-full items-stretch overflow-hidden bg-black"
          >
            <div className="absolute h-full w-full">
              <img
                data-work="image"
                src={item.image}
                loading="lazy"
                alt={`work-${i}`}
                className="relative h-full w-full object-cover opacity-75"
              />
            </div>

            <div className="relative flex w-full flex-col gap-4 px-[4vw] py-[2vw]">
              <div className="relative z-[1] flex flex-1 items-center justify-center gap-[2.5vw]">
                {item.videos.map((v, vi) => (
                  <div
                    key={vi}
                    data-work="video"
                    className="relative aspect-video flex-1 overflow-hidden"
                  >
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        backgroundImage: `url("${v.poster}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "50% 50%",
                      }}
                      className="absolute -inset-full z-[-100] m-auto h-full w-full object-cover"
                    >
                      <source src={v.mp4} />
                      <source src={v.webm} />
                    </video>
                  </div>
                ))}
              </div>

              <div className="relative flex w-full items-end justify-between pt-[4vw]">
                <div
                  className="relative flex flex-col text-[8vw] font-medium uppercase leading-none text-white"
                  style={{ fontFamily: "Spacegrotesk, sans-serif" }}
                >
                  {item.titleLines.map((line, li) => (
                    <div key={li} className="overflow-hidden">
                      <TitleLine
                        line={line}
                        accentWord={item.titleAccentWord}
                        accentColor={item.titleAccentColor}
                      />
                    </div>
                  ))}
                </div>

                <div
                  className="flex flex-col gap-[0.5vw] pr-[1vw] pb-[0.5vw] uppercase text-white"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  {item.subtitleLines.map((line, li) => (
                    <div key={li} className="overflow-hidden">
                      <div data-line>{line}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              data-work="item-overlay"
              className="pointer-events-none absolute inset-0 z-[2] hidden bg-black"
            />
          </div>
        ))}
      </section>

      <section className="relative z-10 bg-black">
        <div className="relative flex h-screen items-end justify-between">
          <div className="absolute h-full w-full">
            <img
              src={footerImage}
              loading="lazy"
              alt="footer"
              className="h-full w-full object-cover opacity-60"
            />
          </div>
          <div
            className="relative flex-1 items-center px-[4vw] pb-[4vw] text-[12.5vw] font-medium uppercase leading-[0.9] text-white"
            style={{ fontFamily: "Spacegrotesk, sans-serif" }}
          >
            <div>
              {footerTitleTop}
              <br />
              <span style={{ color: accentColor }}>{footerTitleBottom} </span>
              {footerTitleSuffix}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
