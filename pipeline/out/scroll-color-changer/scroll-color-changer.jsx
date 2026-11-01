"use client";

import { useEffect, useRef } from "react";


const DEFAULT_SECTIONS = [
  {
    bgcolor: "#0B1325", 
    textcolor: "#FFFFFF",
    tagline: "EXPERIENCE THE CHANGE",
    heading: "Dynamic Transitions Crafted with GSAP & Locomotive",
    headingSize: "clamp(2.5rem, 5vw, 4.5rem)", 
    scrollSpeed: 2,
    imgSrc: "https://images.pexels.com/photos/3062948/pexels-photo-3062948.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000",
    imgAlt: "Hero cinematic background",
    isHero: true,
  },
  {
    bgcolor: "#F4EFEA", 
    textcolor: "#1E2522", 
    tagline: "01 / METICULOUS DETAIL",
    heading: "Layouts that breathe and follow your rhythm.",
    headingSize: "clamp(1.8rem, 3vw, 2.8rem)",
    scrollSpeed: 1,
    imgSrc: "https://images.pexels.com/photos/4467879/pexels-photo-4467879.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=600",
    imgAlt: "Editorial minimalist photography",
    isHero: false,
  },
  {
    bgcolor: "#1E2522", 
    textcolor: "#F4EFEA", 
    tagline: "02 / THE DARK MODE PARADIGM",
    heading: "Immersive contrast shifting perfectly on scroll.",
    headingSize: "clamp(1.8rem, 3vw, 2.8rem)",
    scrollSpeed: 1.5,
    imgSrc: "https://images.pexels.com/photos/5604966/pexels-photo-5604966.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=600",
    imgAlt: "Atmospheric abstract aesthetic",
    isHero: false,
  },
  {
    bgcolor: "#E29578", 
    textcolor: "#111111",
    tagline: "03 / CAPTIVATE EMOTION",
    heading: "Fluid layouts meeting pristine organic design systems.",
    headingSize: "clamp(1.8rem, 3vw, 2.8rem)",
    scrollSpeed: 1,
    imgSrc: "https://images.pexels.com/photos/4791474/pexels-photo-4791474.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=600",
    imgAlt: "Vibrant art architecture",
    isHero: false,
  },
];

export default function ScrollColorChanger({
  transitionDuration = 0.4,
  smoothScrollSpeed = 1,
  sections = DEFAULT_SECTIONS,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let locoScroll = null;
    let triggers = [];
    let ST = null;
    let gsapRef = null;
    let onRefresh = null;
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;

    const init = async () => {
      const [gsapMod, stMod, locoMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("locomotive-scroll"),
      ]);
      if (cancelled || !containerRef.current) return;
      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const LocomotiveScroll = locoMod.default;
      gsapRef = gsap;
      ST = ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      const first = sections[0];
      if (first) {
        gsap.set("body", {
          backgroundColor: first.bgcolor,
          color: first.textcolor,
        });
      }

      locoScroll = new LocomotiveScroll({
        el: containerRef.current,
        smooth: true,
        multiplier: smoothScrollSpeed,
      });

      locoScroll.on("scroll", ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(containerRef.current, {
        scrollTop(value) {
          return arguments.length
            ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
            : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: containerRef.current.style.transform ? "transform" : "fixed",
      });

      onRefresh = () => locoScroll && locoScroll.update();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.refresh();

      const colorElems = containerRef.current.querySelectorAll("[data-bgcolor]");
      colorElems.forEach((section, i) => {
        const prevBgColor = i === 0 ? first?.bgcolor ?? "" : colorElems[i - 1].dataset.bgcolor;
        const prevText = i === 0 ? first?.textcolor ?? "" : colorElems[i - 1].dataset.textcolor;

        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            scroller: containerRef.current,
            start: "top 40%",
            onEnter: () =>
              gsap.to("body", {
                backgroundColor: section.dataset.bgcolor,
                color: section.dataset.textcolor,
                duration: transitionDuration,
                ease: "power2.out",
                overwrite: "auto",
              }),
            onLeaveBack: () =>
              gsap.to("body", {
                backgroundColor: prevBgColor,
                color: prevText,
                duration: transitionDuration,
                ease: "power2.out",
                overwrite: "auto",
              }),
          })
        );
      });
    };

    init().catch((err) => console.error("[ScrollColorChanger] init error:", err.message));

    return () => {
      cancelled = true;
      triggers.forEach((t) => t.kill());
      triggers = [];
      if (ST && onRefresh) ST.removeEventListener("refresh", onRefresh);
      if (locoScroll) {
        locoScroll.destroy();
        locoScroll = null;
      }
      if (gsapRef) gsapRef.killTweensOf("body");
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, []);

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          transition: background-color ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1),
                      color ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1);
          -webkit-font-smoothing: antialiased;
        }
        html.has-scroll-smooth { overflow: hidden; }
        .has-scroll-smooth body { overflow: hidden; }
        .has-scroll-smooth [data-scroll-container] { min-height: 100vh; }
        [data-scroll-direction="horizontal"] [data-scroll-container] { height: 100vh; display: inline-block; white-space: nowrap; }
        [data-scroll-container] { overflow: hidden; }
      `}</style>

      <div ref={containerRef} data-scroll-container className={`w-full ${className}`}>
        {sections.map((sec, i) => {
          if (sec.isHero) {
            return (
              <section
                key={i}
                data-bgcolor={sec.bgcolor}
                data-textcolor={sec.textcolor}
                className="relative min-h-screen w-full flex flex-col justify-end px-[5vw] pb-[10vh] overflow-hidden"
              >
                {sec.imgSrc && (
                  <div 
                    className="absolute inset-0 w-full h-[120%] -z-10 opacity-40 select-none pointer-events-none"
                    data-scroll
                    data-scroll-speed="-1.5"
                  >
                    <img
                      src={sec.imgSrc}
                      alt={sec.imgAlt || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                      <div className="max-w-[85rem] w-full mix-blend-difference" data-scroll data-scroll-speed="0.5">
                  {sec.tagline && (
                    <span className="block text-xs font-semibold tracking-[0.3em] uppercase opacity-70 mb-4">
                      {sec.tagline}
                    </span>
                  )}
                  <h1
                    className="font-black tracking-tight leading-[1.05]"
                    style={{ fontSize: sec.headingSize ?? "3.5rem" }}
                  >
                    {sec.heading}
                  </h1>
                </div>
              </section>
            );
          }

          const isEven = i % 2 === 0;
          return (
            <section
              key={i}
              data-bgcolor={sec.bgcolor}
              data-textcolor={sec.textcolor}
              className="relative min-h-screen w-full flex items-center justify-center py-[12vh] px-[6vw]"
            >
              <div 
                className={`max-w-[1200px] w-full flex flex-col md:flex-row gap-12 md:gap-20 items-center justify-between ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {sec.imgSrc && (
                  <div 
                    className="w-full md:w-1/2 aspect-[4/5] max-h-[70vh] overflow-hidden rounded-xl bg-black/5 shadow-2xl"
                    data-scroll
                    data-scroll-speed={sec.scrollSpeed ?? 1}
                  >
                    <img
                      src={sec.imgSrc}
                      alt={sec.imgAlt || ""}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                )}

                <div 
                  className="w-full md:w-1/2 flex flex-col justify-center"
                  data-scroll
                  data-scroll-speed={(sec.scrollSpeed ?? 1) * 0.5}
                >
                  {sec.tagline && (
                    <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60 mb-3 block">
                      {sec.tagline}
                    </span>
                  )}
                  <h2
                    className="font-bold tracking-tight leading-[1.2] max-w-[500px]"
                    style={{ fontSize: sec.headingSize ?? "2rem" }}
                  >
                    {sec.heading}
                  </h2>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}