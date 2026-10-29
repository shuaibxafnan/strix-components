"use client";

import { useEffect, useRef } from "react";

const CLIP_OPEN = "inset(0% 0% 0% 0%)";
const CLIP_CLOSED = "inset(0% 0% 100% 0%)";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1080&h=800&q=80`;

function LeafIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#121212"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[14px] w-[14px]"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

const DEFAULT_SECTIONS = [
  {
    title: "Green Cityscape",
    desc: "Vibrant streets with vertical gardens and solar buildings. This oasis thrives on renewable energy, smart transport, and green spaces for biodiversity.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#D5FF37",
    imgSrc: photo("1759458856846-097935f54111"),
    imgAlt: "Green Architecture",
  },
  {
    title: "Blue Urban Oasis",
    desc: "Avenues with azure facades and eco-structures. This hub uses clean energy, smart transit, and parks for urban wildlife.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#7DD6FF",
    imgSrc: photo("1533387520709-752d83de3630"),
    imgAlt: "Blue Architecture",
  },
  {
    title: "Fluid Architecture",
    desc: "Desert refuge with fluid architecture and glowing interiors. This sanctuary harnesses solar power, sustainable design, and natural harmony for resilient living.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#FFA0B0",
    imgSrc: photo("1752150127767-77bccbed07e2"),
    imgAlt: "Pink Architecture",
  },
  {
    title: "Martian Arches",
    desc: "Ethereal structures arc over tranquil waters, bathed in the glow of a setting Martian sun. This desolate beauty showcases the stark, captivating landscape of the red planet.",
    linkLabel: "Learn More",
    linkHref: "#",
    linkColor: "#FFA17B",
    imgSrc: photo("1781935307999-e8bb5e62ebb1"),
    imgAlt: "Orange Architecture",
  },
];

const DEFAULT_BG_COLORS = ["#EDF9FF", "#FFECF2", "#FFE8DB"];

export default function ArchScroll({
  sections = DEFAULT_SECTIONS,
  bgColors = DEFAULT_BG_COLORS,
  initialBg = "#f9ffe7",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => { };

    document.body.style.backgroundColor = initialBg;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      const root = rootRef.current;
      if (cancelled || !root) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });
      const tick = (time) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const arch = root.querySelector('[data-arch="main"]');
      const pin = root.querySelector('[data-arch="pin"]');
      const infos = [...root.querySelectorAll('[data-arch="info"]')];
      const frames = [...root.querySelectorAll('[data-arch="frame"]')];
      const imgs = [...root.querySelectorAll('[data-arch="frame"] img')];

      const bgFrom = (index) => (index === 0 ? initialBg : bgColors[index - 1]);

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        const main = gsap.timeline({
          scrollTrigger: {
            trigger: arch,
            start: "top top",
            end: "bottom bottom",
            pin,
            scrub: true,
          },
        });

        gsap.set(imgs, { clipPath: CLIP_OPEN, objectPosition: "0px 0%" });

        imgs.forEach((img, index) => {
          const next = imgs[index + 1];
          if (!next) return;

          const step = gsap.timeline();

          if (bgColors[index]) {
            step.fromTo(
              "body",
              { backgroundColor: bgFrom(index) },
              {
                backgroundColor: bgColors[index],
                duration: 1.5,
                ease: "power2.inOut",
                immediateRender: false,
              },
              0,
            );
          }

          step
            .fromTo(
              img,
              {
                clipPath: CLIP_OPEN,
                objectPosition: index === 0 ? "0px 0%" : "0px 40%",
              },
              {
                clipPath: CLIP_CLOSED,
                objectPosition: "0px 60%",
                duration: 1.5,
                ease: "none",
                immediateRender: false,
              },
              0,
            )
            .fromTo(
              next,
              { objectPosition: "0px 0%" },
              {
                objectPosition: "0px 40%",
                duration: 1.5,
                ease: "none",
                immediateRender: false,
              },
              0,
            );

          main.add(step);
        });
      });

      mm.add("(max-width: 768px)", () => {
        infos.forEach((el, i) => {
          el.style.order = String(i * 2);
        });
        frames.forEach((el, i) => {
          el.style.order = String(i * 2 + 1);
        });

        gsap.set(imgs, { objectPosition: "0px 60%" });

        imgs.forEach((img, index) => {
          const step = gsap.timeline({
            scrollTrigger: {
              trigger: img,
              start: "top-=70% top+=50%",
              end: "bottom+=200% bottom",
              scrub: true,
            },
          });

          step.fromTo(
            img,
            { objectPosition: "0px 60%" },
            {
              objectPosition: "0px 30%",
              duration: 5,
              ease: "none",
              immediateRender: false,
            },
          );

          if (bgColors[index]) {
            step.fromTo(
              "body",
              { backgroundColor: bgFrom(index) },
              {
                backgroundColor: bgColors[index],
                duration: 1.5,
                ease: "power2.inOut",
                immediateRender: false,
              },
            );
          }
        });

        return () => {
          infos.forEach((el) => {
            el.style.order = "";
          });
          frames.forEach((el) => {
            el.style.order = "";
          });
        };
      });

      teardown = () => {
        mm.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      teardown();
      document.body.style.backgroundColor = "";
    };
  }, [sections, bgColors, initialBg]);

  const total = sections.length;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap"
      />

      <div
        ref={rootRef}
        className="font-['Outfit',sans-serif] text-[#121212]"
      >
        <div className="mx-auto max-w-[1440px] p-8 max-[560px]:p-[10px]">
          <div className="h-[30vh] w-full" />

          <div
            data-arch="main"
            className="mx-auto flex max-w-[1100px] justify-between gap-[60px] max-[900px]:gap-[30px] max-[768px]:flex-col max-[768px]:gap-5 max-[560px]:gap-3"
          >
            <div className="flex min-w-[300px] flex-col max-[768px]:contents">
              {sections.map((section) => (
                <div
                  data-arch="info"
                  key={section.title}
                  className="grid h-screen max-w-[356px] place-items-center max-[768px]:h-auto max-[768px]:py-5"
                >
                  <div>
                    <h2 className="m-0 text-[42px] font-extrabold tracking-[-0.84px]">
                      {section.title}
                    </h2>
                    <p className="mb-7 mt-[6px] text-[18px] leading-[normal] tracking-[-0.54px] text-[#121212]/80">
                      {section.desc}
                    </p>
                    <a
                      href={section.linkHref ?? "#"}
                      style={{ backgroundColor: section.linkColor }}
                      className="flex w-fit items-center gap-1 rounded-[40px] px-[18px] py-4 text-inherit no-underline"
                    >
                      <LeafIcon />
                      <span>{section.linkLabel ?? "Learn More"}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div
              data-arch="pin"
              className="relative flex h-screen w-full max-w-[540px] shrink flex-col max-[768px]:contents"
            >
              {sections.map((section, i) => (
                <div
                  key={section.imgSrc}
                  data-arch="frame"
                  style={{ zIndex: total - i }}
                  className="absolute left-0 top-1/2 h-[400px] w-full -translate-y-1/2 overflow-hidden rounded-2xl max-[768px]:static max-[768px]:mb-5 max-[768px]:h-[360px] max-[768px]:translate-y-0 max-[560px]:h-[280px] max-[560px]:rounded-[10px]"
                >
                  <img
                    src={section.imgSrc}
                    alt={section.imgAlt}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="h-[30vh] w-full" />
        </div>
      </div>
    </>
  );
}