"use client";

// ─── ArchScroll ───────────────────────────────────────────────────────────────
//
// Apple-to-apple Next.js conversion of the GSAP pinned image mask-reveal-on-scroll
// CodePen. Uses GSAP ScrollTrigger + Lenis smooth scroll.
//
// Deps (install once):
//   npm install gsap lenis
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// sections   ArchSection[]   (see default below)   Content + image data
// bgColors   string[]        ["#EDF9FF","#FFECF2","#FFE8DB"]
//                            Body background colours cycled during scroll transitions.
//                            Length should be sections.length - 1.
// initialBg  string          "#f9ffe7"   Starting body/page background.
//
// ArchSection shape:
//   title      string   Section heading
//   desc       string   Body copy
//   linkLabel  string   CTA button label  (default "Learn More")
//   linkHref   string   CTA href          (default "#")
//   linkColor  string   CTA pill background colour (hex)
//   imgSrc     string   Image URL
//   imgAlt     string   Image alt text
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

// ── Icon (original inline SVG, unchanged) ─────────────────────────────────────
function LeafIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none">
      <path
        fill="#121212"
        d="M5 2c0 1.105-1.895 2-3 2a2 2 0 1 1 0-4c1.105 0 3 .895 3 2ZM11 3.5c0 1.105-.895 3-2 3s-2-1.895-2-3a2 2 0 1 1 4 0ZM6 9a2 2 0 1 1-4 0c0-1.105.895-3 2-3s2 1.895 2 3Z"
      />
    </svg>
  );
}

// ── Default section data (mirrors original HTML exactly) ─────────────────────
const DEFAULT_SECTIONS = [
  {
    title: "Green Cityscape",
    desc: "Vibrant streets with vertical gardens and solar buildings. This oasis thrives on renewable energy, smart transport, and green spaces for biodiversity.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#D5FF37",
    imgSrc:
      "https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/cu8978xjlsjjpjk52ta0.webp",
    imgAlt: "Green Architecture",
  },
  {
    title: "Blue Urban Oasis",
    desc: "Avenues with azure facades and eco-structures. This hub uses clean energy, smart transit, and parks for urban wildlife.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#7DD6FF",
    imgSrc:
      "https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/trh7c8ufv1dqfrofdytd.webp",
    imgAlt: "Blue Architecture",
  },
  {
    title: "Fluid Architecture",
    desc: "Desert refuge with fluid architecture and glowing interiors. This sanctuary harnesses solar power, sustainable design, and natural harmony for resilient living.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#FFA0B0",
    imgSrc:
      "https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/aw6qwur0pggp5r03whjq.webp",
    imgAlt: "Pink Architecture",
  },
  {
    title: "Martian Arches",
    desc: "Ethereal structures arc over tranquil waters, bathed in the glow of a setting Martian sun. This desolate beauty showcases the stark, captivating landscape of the red planet.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#FFA17B",
    imgSrc:
      "https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/sqwn8u84zd1besgl0zpd.webp",
    imgAlt: "Orange Architecture",
  },
];

const DEFAULT_BG_COLORS = ["#EDF9FF", "#FFECF2", "#FFE8DB"];

export default function ArchScroll({
  sections = DEFAULT_SECTIONS,
  bgColors = DEFAULT_BG_COLORS,
  initialBg = "#f9ffe7",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let lenis;
    let ctx;

    async function init() {
      // ── Dynamic imports (avoids SSR issues) ──────────────────────────────
      const { default: Lenis } = await import("lenis");
      const gsapMod = await import("gsap");
      const { gsap } = gsapMod;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      // ── Lenis smooth scroll (exact original config) ──────────────────────
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        gestureDirection: "vertical",
        smoothTouch: true,
        touchMultiplier: 2,
      });

      function raf(time) {
        lenis.raf(time);
        ScrollTrigger.update();
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // ── Set z-index for image wrappers (data-index attr) ─────────────────
      // Original: higher data-index = higher z-index = shown first
      const root = containerRef.current;
      root.querySelectorAll(".arch__right .img-wrapper").forEach((el) => {
        const order = el.getAttribute("data-index");
        if (order !== null) el.style.zIndex = order;
      });

      // ── Mobile layout — interleave order ─────────────────────────────────
      const leftItems = gsap.utils.toArray(".arch__left .arch__info", root);
      const rightItems = gsap.utils.toArray(".arch__right .img-wrapper", root);

      function handleMobileLayout() {
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        if (isMobile) {
          leftItems.forEach((item, i) => {
            item.style.order = i * 2;
          });
          rightItems.forEach((item, i) => {
            item.style.order = i * 2 + 1;
          });
        } else {
          leftItems.forEach((item) => {
            item.style.order = "";
          });
          rightItems.forEach((item) => {
            item.style.order = "";
          });
        }
      }
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleMobileLayout, 100);
      });
      handleMobileLayout();

      // ── GSAP context (scoped to container) ───────────────────────────────
      ctx = gsap.context(() => {
        const imgs = gsap.utils.toArray(".img-wrapper img", root);

        // ── Desktop ───────────────────────────────────────────────────────
        ScrollTrigger.matchMedia({
          "(min-width: 769px)": function () {
            const mainTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: root.querySelector(".arch"),
                start: "top top",
                end: "bottom bottom",
                pin: root.querySelector(".arch__right"),
                scrub: true,
              },
            });

            gsap.set(imgs, {
              clipPath: "inset(0)",
              objectPosition: "0px 0%",
            });

            imgs.forEach((_, index) => {
              const currentImage = imgs[index];
              const nextImage = imgs[index + 1] ?? null;
              const sectionTimeline = gsap.timeline();

              if (nextImage) {
                sectionTimeline
                  .to(
                    "body",
                    {
                      backgroundColor: bgColors[index],
                      duration: 1.5,
                      ease: "power2.inOut",
                    },
                    0,
                  )
                  .to(
                    currentImage,
                    {
                      clipPath: "inset(0px 0px 100%)",
                      objectPosition: "0px 60%",
                      duration: 1.5,
                      ease: "none",
                    },
                    0,
                  )
                  .to(
                    nextImage,
                    { objectPosition: "0px 40%", duration: 1.5, ease: "none" },
                    0,
                  );
              }

              mainTimeline.add(sectionTimeline);
            });
          },

          // ── Mobile ──────────────────────────────────────────────────────
          "(max-width: 768px)": function () {
            const mbTimeline = gsap.timeline();

            gsap.set(imgs, { objectPosition: "0px 60%" });

            imgs.forEach((image, index) => {
              const innerTimeline = gsap.timeline({
                scrollTrigger: {
                  trigger: image,
                  start: "top-=70% top+=50%",
                  end: "bottom+=200% bottom",
                  scrub: true,
                },
              });

              innerTimeline
                .to(image, {
                  objectPosition: "0px 30%",
                  duration: 5,
                  ease: "none",
                })
                .to("body", {
                  backgroundColor: bgColors[index],
                  duration: 1.5,
                  ease: "power2.inOut",
                });

              mbTimeline.add(innerTimeline);
            });
          },
        });
      }, root);
    }

    // Set initial bg
    document.body.style.backgroundColor = initialBg;

    init();

    return () => {
      ctx?.revert();
      lenis?.destroy();
      document.body.style.backgroundColor = "";
    };
  }, []);

  // ── Assign data-index values — original counts DOWN from sections.length ──
  // i.e. first section gets highest z-index (shown on top)
  const total = sections.length;

  return (
    <>
      {/* Font */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap");
      `}</style>

      <div
        ref={containerRef}
        className="arch-scroll-root"
        style={{
          color: "#121212",
          fontFamily: '"Outfit", sans-serif',
        }}
      >
        {/* ── Styles (scoped inside component, exact from original) ── */}
        <style>{`
          .arch-scroll-root .container {
            max-width: 1440px;
            padding: 2rem;
          }
          .arch-scroll-root .spacer {
            width: 100%;
            height: 30vh;
          }
          .arch-scroll-root .arch {
            display: flex;
            gap: 60px;
            justify-content: space-between;
            max-width: 1100px;
            margin-inline: auto;
          }
          .arch-scroll-root .arch__left {
            display: flex;
            flex-direction: column;
            min-width: 300px;
          }
          .arch-scroll-root .arch__info {
            max-width: 356px;
            height: 100vh;
            display: grid;
            place-items: center;
          }
          .arch-scroll-root h2.header {
            font-family: Outfit;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: -0.84px;
            margin: 0;
          }
          .arch-scroll-root p.desc {
            color: rgba(18, 18, 18, 0.8);
            font-size: 18px;
            letter-spacing: -0.54px;
            margin-block: 6px 28px;
            line-height: normal;
          }
          .arch-scroll-root a.link {
            text-decoration: none;
            padding: 16px 18px;
            color: inherit;
            border-radius: 40px;
            display: flex;
            gap: 4px;
            width: fit-content;
            align-items: center;
          }
          .arch-scroll-root .arch__right {
            flex-shrink: 1;
            height: 100vh;
            width: 100%;
            max-width: 540px;
            position: relative;
            display: flex;
            flex-direction: column;
          }
          .arch-scroll-root .img-wrapper {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            height: 400px;
            width: 100%;
            border-radius: 16px;
            overflow: hidden;
          }
          .arch-scroll-root .img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }
          @media (max-width: 900px) {
            .arch-scroll-root .arch { gap: 30px; }
          }
          @media (max-width: 768px) {
            .arch-scroll-root .arch { flex-direction: column; gap: 20px; }
            .arch-scroll-root .arch__left,
            .arch-scroll-root .arch__right { display: contents; }
            .arch-scroll-root .arch__right { height: auto; max-width: 100%; }
            .arch-scroll-root .arch__right .img-wrapper {
              position: static;
              transform: none;
              height: 360px;
              width: 100%;
              margin-bottom: 20px;
            }
            .arch-scroll-root .arch__left .arch__info { height: auto; padding: 20px 0; }
          }
          @media (max-width: 560px) {
            .arch-scroll-root .arch { gap: 12px; }
            .arch-scroll-root .container { padding: 10px; }
            .arch-scroll-root .arch__right .img-wrapper { border-radius: 10px; height: 280px; }
          }
        `}</style>

        <div className="container">
          <div className="spacer" />

          <div className="arch">
            {/* ── Left: text panels ── */}
            <div className="arch__left">
              {sections.map((section) => (
                <div className="arch__info" key={section.title}>
                  <div className="content">
                    <h2 className="header">{section.title}</h2>
                    <p className="desc">{section.desc}</p>
                    <a
                      className="link"
                      href={section.linkHref ?? "#"}
                      style={{ backgroundColor: section.linkColor }}
                    >
                      <LeafIcon />
                      <span>{section.linkLabel ?? "Learn More"}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right: stacked images ── */}
            {/* data-index goes from total down to 1 so first section = highest z-index */}
            <div className="arch__right">
              {sections.map((section, i) => (
                <div
                  key={section.imgSrc}
                  className="img-wrapper"
                  data-index={total - i}
                >
                  <img src={section.imgSrc} alt={section.imgAlt} />
                </div>
              ))}
            </div>
          </div>

          <div className="spacer" />
        </div>
      </div>
    </>
  );
}
