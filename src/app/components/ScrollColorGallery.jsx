"use client";

import { useEffect, useRef, useId } from "react";

// ─── ScrollColorGallery ──────────────────────────────────────────────────────
//
// This is a 1:1 port of the "Gently" scroll-trigger gallery (GSAP + ScrollTrigger
// + Lenis). Structure, CSS values, per-image animation offsets, image order, and
// fonts match the original markup/CSS/JS exactly. Props exist for tweaking, but
// every default below reproduces the source as-is.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #000                    Page/section background
// showNav              boolean  true                    Show the fixed top nav bar
// navBrand             string   "MOUSSA"                 Nav left-side label
// navBrandHref         string   "https://www.moussamamadou.com/"  Nav left-side link
// navContact           string   "CONTACT"                 Nav right-side label
// navContactHref       string   "mailto:moussa.mamadou@outook.com"  Nav right-side link
// heroImage            string   (source HERO.jpeg url)     Hero background image
// heroLineTop          string   "Gently"                    Hero line 1 (left aligned)
// heroLineCenter       string   "SCROLL"                    Hero line 2, accent, centered
// heroLineBottom       string   "DOWN"                       Hero line 3 (right aligned)
// heroAccentColor      string   #b8e6da                       Color of heroLineCenter
// items                array    [see DEFAULT_ITEMS]            Gallery panels — each:
//                                                               { backgroundImage, images: [4],
//                                                                 titleTop, titleBottom, accentColor,
//                                                                 centerWrapper (bool) }
// itemScrollLengthVh   number   300                              Scroll distance (vh) per panel
// imageWidthVw         number   25                                 image-wrapper width (vw)
// stackWidthVw         number   21                                   item-image column width (vw), 15vw <=767px
// footerImage          string   (source FOOTER.webp url)              Footer background image
// footerLineTop        string   "SCROLL"                               Footer line 1, accent
// footerLineCenter     string   "MISSION"                                Footer line 2 (center)
// footerLineBottom     string   "COMPLETE"                                Footer line 3, accent
// footerAccentColor    string   #b8e6da                                    Color of footer accents
// fontDisplayUrl       string   (source Doner Display .otf url)             @font-face src, normal
// fontDisplayItalicUrl string   (source Doner Display italic .otf url)        @font-face src, italic
// lenisLerp            number   0.05                                           Lenis smoothing factor
// lenisWheelMultiplier number   0.7                                             Lenis wheel speed multiplier
// ──────────────────────────────────────────────────────────────────────────

const BASE = "https://moussamamadou.github.io/scroll-trigger-gsap-gently";

const DEFAULT_ITEMS = [
  {
    backgroundImage: `${BASE}/images/RED.jpg`,
    images: [
      `${BASE}/images/SCARLETT-2.webp`,
      `${BASE}/images/SCARLETT-4.webp`,
      `${BASE}/images/SCARLETT-3.webp`,
      `${BASE}/images/SCARLETT-1.webp`,
    ],
    titleTop: "Heart",
    titleBottom: "SCARLET",
    accentColor: "#ffa6a6",
    centerWrapper: false,
  },
  {
    backgroundImage: `${BASE}/images/PURPLE.webp`,
    images: [
      `${BASE}/images/PURPLE-2.jpg`,
      `${BASE}/images/PURPLE-1.jpg`,
      `${BASE}/images/PURPLE-3.jpg`,
      `${BASE}/images/PURPLE-4.jpg`,
    ],
    titleTop: "DREAM",
    titleBottom: "Purple",
    accentColor: "#b3d3ff",
    centerWrapper: true,
  },
  {
    backgroundImage: `${BASE}/images/YELLOW.jpg`,
    images: [
      `${BASE}/images/YELLOW.jpg`,
      `${BASE}/images/YELLOW-1.jpg`,
      `${BASE}/images/YELLOW-2.jpg`,
      `${BASE}/images/YELLOW-3.jpg`,
    ],
    titleTop: "SHINE",
    titleBottom: "Yellow",
    accentColor: "#fff2b3",
    centerWrapper: true,
  },
];

// Exact per-image entry positions from the source script's `positions` map,
// keyed by imageIndex (0-3), branching on whether the panel index is even/odd.
function getImageInitialPosition(index, imageIndex) {
  const positions = {
    0: {
      scale: 0.8,
      y: index % 2 === 0 ? "175vh" : "-120vh",
      rotateZ: index % 2 === 0 ? "-5deg" : "5deg",
      zIndex: index % 2 === 0 ? "3" : "1",
    },
    1: {
      scale: 0.8,
      y: index % 2 === 0 ? "-225vh" : "300vh",
      zIndex: index % 2 === 0 ? "1" : "3",
      rotateZ: index % 2 === 0 ? "5deg" : "-5deg",
    },
    2: {
      scale: 0.8,
      y: index % 2 === 0 ? "300vh" : "-120vh",
      zIndex: index % 2 === 0 ? "3" : "3",
      rotateZ: index % 2 === 0 ? "5deg" : "5deg",
    },
    3: {
      scale: 0.8,
      y: index % 2 === 0 ? "-100vh" : "175vh",
      zIndex: index % 2 === 0 ? "1" : "1",
      rotateZ: index % 2 === 0 ? "-5deg" : "-5deg",
    },
  };
  return positions[imageIndex];
}

// Exact final-rest positions from the source script's `getImageFinalPosition`.
function getImageFinalPosition(index, imageIndex) {
  return {
    scale: 1,
    y:
      index % 2 === 0
        ? imageIndex % 2 === 0
          ? "2vh"
          : "-2vh"
        : imageIndex % 2 === 0
          ? "-2vh"
          : "2vh",
    rotateZ:
      index % 2 === 0
        ? imageIndex % 2 === 0
          ? "2.5deg"
          : "-2.5deg"
        : imageIndex % 2 === 0
          ? "-2.5deg"
          : "2.5deg",
  };
}

export default function ScrollColorGallery({
  bgColor = "#000",
  showNav = true,
  navBrand = "MOUSSA",
  navBrandHref = "https://www.moussamamadou.com/",
  navContact = "CONTACT",
  navContactHref = "mailto:moussa.mamadou@outook.com",
  heroImage = `${BASE}/images/HERO.jpeg`,
  heroLineTop = "Gently",
  heroLineCenter = "SCROLL",
  heroLineBottom = "DOWN",
  heroAccentColor = "#b8e6da",
  items = DEFAULT_ITEMS,
  itemScrollLengthVh = 300,
  imageWidthVw = 25,
  stackWidthVw = 21,
  footerImage = `${BASE}/images/FOOTER.webp`,
  footerLineTop = "SCROLL",
  footerLineCenter = "MISSION",
  footerLineBottom = "COMPLETE",
  footerAccentColor = "#b8e6da",
  fontDisplayUrl = `${BASE}/fonts/Doner-RegularDisplay.otf`,
  fontDisplayItalicUrl = `${BASE}/fonts/Doner-RegularDisplayItalic.otf`,
  lenisLerp = 0.05,
  lenisWheelMultiplier = 0.7,
}) {
  const uid = useId();
  const containerRef = useRef(null);
  const ghostRefs = useRef([]);
  const itemRefs = useRef([]);
  const lenisRef = useRef(null);

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

    // overflow-x must live on <body>, not on an ancestor of the sticky
    // sections below — position: sticky breaks in every browser if any
    // ancestor has overflow set to anything but visible, even overflow-x.
    const previousBodyOverflowX = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";

    let scrollTriggers = [];

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
      loadScript("https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js"),
    ])
      .then(() => {
        const { gsap, ScrollTrigger, Lenis } = window;
        if (!gsap || !ScrollTrigger || !containerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const workItems = itemRefs.current.filter(Boolean);
        const ghostItems = ghostRefs.current.filter(Boolean);

        gsap.set(workItems, {
          position: "fixed",
          top: 0,
          clipPath: "inset(0 0% 0 100%)",
        });

        const getBaseScrollTrigger = (ghostItem) => ({
          trigger: ghostItem,
          scrub: true,
          start: "top bottom",
          end: "+=200vh top",
        });

        workItems.forEach((element, index) => {
          const lines = element.querySelectorAll("[data-line]");
          const itemBackground = element.querySelector(
            '[data-role="item-background"]',
          );
          const itemContainer = element.querySelector(
            '[data-role="item-container"]',
          );
          const itemOverlay = element.querySelectorAll(
            '[data-role="item-overlay"]',
          );
          const itemImages = gsap.utils.toArray(
            element.querySelectorAll('[data-role="item-image"]'),
          );
          const ghostItem = ghostItems[index];

          gsap.set(itemBackground, { scale: 1.2 });
          gsap.set(itemContainer, { xPercent: 40 });

          const t1 = gsap.to(element, {
            clipPath: "inset(0 0 0 0%)",
            scrollTrigger: getBaseScrollTrigger(ghostItem),
          });
          const t2 = gsap.to(itemContainer, {
            xPercent: 0,
            scrollTrigger: getBaseScrollTrigger(ghostItem),
          });
          const t3 = gsap.to(itemBackground, {
            scale: 1,
            scrollTrigger: getBaseScrollTrigger(ghostItem),
          });

          [0, 1].forEach((i) => {
            gsap.set(lines[i], { zIndex: 2, opacity: 0.9 });
            gsap.from(lines[i], {
              opacity: i === 0 ? 0.95 : 0.5,
              yPercent: i === 0 ? 125 : -125,
              ease: "power2.inOut",
              duration: 1.25,
              scrollTrigger: {
                trigger: ghostItem,
                scrub: true,
                start: "-25% top",
                end: "15% top",
                toggleActions: "play reverse restart reverse",
              },
            });
          });

          itemImages.forEach((image, imageIndex) => {
            gsap.set(image, getImageInitialPosition(index, imageIndex));
            gsap.to(image, {
              ...getImageFinalPosition(index, imageIndex),
              scrollTrigger: {
                trigger: ghostItem,
                scrub: true,
                start: "5% top",
                end: "50% top",
              },
            });
          });

          const t4 = gsap.to(itemBackground, {
            filter: "brightness(0.2) blur(7.5px)",
            scrollTrigger: {
              trigger: ghostItem,
              scrub: true,
              start: "20% top",
              end: "55% top",
            },
          });

          const t5 = gsap.to(element, {
            xPercent: index === workItems.length - 1 ? 0 : -40,
            yPercent: index === workItems.length - 1 ? -40 : 0,
            scrollTrigger: {
              trigger: ghostItem,
              scrub: true,
              start: "100% bottom",
              toggleActions: "play reverse play reverse",
            },
          });

          const t6 = gsap.to(itemOverlay, {
            opacity: 0.85,
            scrollTrigger: {
              trigger: ghostItem,
              scrub: true,
              start: "100% bottom",
              toggleActions: "play reverse play reverse",
            },
          });

          [t1, t2, t3, t4, t5, t6].forEach((tween) => {
            if (tween.scrollTrigger) scrollTriggers.push(tween.scrollTrigger);
          });
        });

        if (Lenis) {
          lenisRef.current = new Lenis({
            autoRaf: true,
            lerp: lenisLerp,
            wheelMultiplier: lenisWheelMultiplier,
          });
        }

        ScrollTrigger.refresh();
      })
      .catch((e) =>
        console.error("[ScrollColorGallery] load failed:", e.message),
      );

    return () => {
      scrollTriggers.forEach((st) => st.kill());
      if (lenisRef.current) {
        lenisRef.current.destroy?.();
        lenisRef.current = null;
      }
      document.body.style.overflowX = previousBodyOverflowX;
    };
  }, [items, itemScrollLengthVh, lenisLerp, lenisWheelMultiplier]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ backgroundColor: bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Doner Display ${uid}';
              src: url('${fontDisplayUrl}') format('opentype');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Doner Display ${uid}';
              src: url('${fontDisplayItalicUrl}') format('opentype');
              font-weight: 400;
              font-style: italic;
              font-display: swap;
            }
          `,
        }}
      />

      {/* Hero */}
      <section className="sticky top-0 bg-black">
        <div className="relative flex h-screen w-[99vw] items-end justify-between">
          <div className="absolute h-full w-full">
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "brightness(55%)" }}
            />
          </div>
          <div
            className="relative flex h-screen w-full flex-col items-stretch justify-between px-[3.5vw] py-20 uppercase text-white max-[479px]:gap-8"
            style={{
              fontFamily: `'Doner Display ${uid}', Arial, sans-serif`,
              fontSize: "12vw",
              lineHeight: 1,
            }}
          >
            <div className="overflow-hidden">
              <div className="overflow-hidden">
                <div className="relative" data-line>
                  {heroLineTop}
                </div>
              </div>
            </div>
            <div className="overflow-hidden text-center">
              <span style={{ color: heroAccentColor }}>{heroLineCenter}</span>
            </div>
            <div className="overflow-hidden text-right">
              <div className="relative" data-line>
                {heroLineBottom}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery panels */}
      <section className="relative">
        <div className="relative">
          {items.map((item, index) => (
            <div
              key={`${uid}-item-${index}`}
              ref={(el) => (itemRefs.current[index] = el)}
              className="relative flex h-screen w-screen items-stretch overflow-hidden bg-black"
            >
              <div className="relative flex h-full w-full">
                <div
                  data-role="item-background"
                  className="absolute h-full w-full"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <img
                    src={item.backgroundImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div
                  data-role="item-container"
                  className="relative flex w-full flex-1 flex-col items-stretch justify-around gap-4 px-[4vw] pb-10 pt-20"
                >
                  <div className="absolute inset-y-0 left-0 right-auto flex w-full flex-row items-center justify-center">
                    {item.images.map((src, imageIndex) => (
                      <div
                        key={`${uid}-item-${index}-image-${imageIndex}`}
                        data-role="item-image"
                        className="relative h-full max-[767px]:w-[15vw]"
                        style={{ width: `${stackWidthVw}vw` }}
                      >
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-[0.35em]"
                          style={{
                            aspectRatio: "4 / 5",
                            width: `${imageWidthVw}vw`,
                            backgroundColor: "#ffffffbf",
                          }}
                        >
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative flex w-full flex-1 items-center justify-between">
                    <div
                      className={
                        "relative flex h-full flex-1 flex-col items-stretch justify-between uppercase text-white max-[479px]:items-start max-[479px]:justify-between max-[479px]:gap-8" +
                        (item.centerWrapper
                          ? " mx-auto text-center"
                          : " mx-auto")
                      }
                      style={{
                        fontFamily: `'Doner Display ${uid}', Arial, sans-serif`,
                        letterSpacing: "0.5rem",
                        fontSize: "12.5vw",
                        lineHeight: 1,
                      }}
                    >
                      <div className="overflow-hidden">
                        <div
                          className={
                            "relative" +
                            (item.centerWrapper ? " text-left" : "")
                          }
                          data-line
                        >
                          {item.titleTop}
                        </div>
                      </div>
                      <div className="overflow-hidden text-right">
                        <div className="relative" data-line>
                          <span style={{ color: item.accentColor }}>
                            {item.titleBottom}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  data-role="item-overlay"
                  className="pointer-events-none absolute inset-0 z-[99] h-[105%] w-[105%] bg-black opacity-0"
                />
              </div>
            </div>
          ))}

          {items.map((_, index) => (
            <div
              key={`${uid}-ghost-${index}`}
              ref={(el) => (ghostRefs.current[index] = el)}
              className="w-full"
              style={{ height: `${itemScrollLengthVh}vh` }}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="sticky top-0 z-[1] bg-black">
        <div className="relative flex h-screen w-[99vw] items-end justify-between">
          <div className="absolute h-full w-full">
            <img
              src={footerImage}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
          </div>
          <div
            className="relative flex h-full w-full flex-col items-stretch justify-between px-[3.5vw] py-20 uppercase text-white max-[479px]:gap-8"
            style={{
              fontFamily: `'Doner Display ${uid}', Arial, sans-serif`,
              letterSpacing: "0.5rem",
              fontSize: "11.5vw",
              lineHeight: 1,
            }}
          >
            <div className="overflow-hidden">
              <div data-line>
                <span style={{ color: footerAccentColor }}>
                  {footerLineTop}
                </span>
              </div>
            </div>
            <div className="overflow-hidden text-center">
              {footerLineCenter}
            </div>
            <div className="overflow-hidden text-right">
              <div className="relative" data-line>
                <span style={{ color: footerAccentColor }}>
                  {footerLineBottom}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
