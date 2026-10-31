"use client";

import { useEffect, useId, useRef } from "react";

export default function LayeredParallaxReveal({
  bgColor = "#121212",
  textColor = "#EFEEEC",
  lineColor = "#000000",
  fadeColorRgb = "0,0,0",
  spacerColor = "#000000",
  title = "Parallax",
  titleFontSize = "11vw",
  sectionPadding = "2rem",
  layer1Image = "https://images.unsplash.com/photo-1590372648787-fa5a935c2c40?q=80&w=1920&auto=format&fit=crop",
  layer2Image = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/mountain.png",
  layer4Image = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/person.png",
  layer1YPercent = 70,
  layer2YPercent = 55,
  layer3YPercent = 40,
  layer4YPercent = 10,
  scrub = 0,
  triggerStart = "0% 0%",
  triggerEnd = "100% 0%",
  enableLenis = true,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const layersRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let tl;
    let lenis;
    let rafCallback;
    let gsapRef;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, lenisModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        enableLenis ? import("lenis") : Promise.resolve(null),
      ]);
      if (cancelled || !layersRef.current) return;

      gsapRef = gsap;
      gsap.registerPlugin(ScrollTrigger);

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: layersRef.current,
          start: triggerStart,
          end: triggerEnd,
          scrub,
        },
      });

      const layers = [
        { selector: `[data-parallax-layer="1-${uid}"]`, yPercent: layer1YPercent },
        { selector: `[data-parallax-layer="2-${uid}"]`, yPercent: layer2YPercent },
        { selector: `[data-parallax-layer="3-${uid}"]`, yPercent: layer3YPercent },
        { selector: `[data-parallax-layer="4-${uid}"]`, yPercent: layer4YPercent },
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          layersRef.current.querySelectorAll(layerObj.selector),
          {
            yPercent: layerObj.yPercent,
            ease: "none",
          },
          idx === 0 ? undefined : "<",
        );
      });

      if (lenisModule) {
        const Lenis = lenisModule.default;
        lenis = new Lenis();
        lenis.on("scroll", ScrollTrigger.update);
        rafCallback = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(rafCallback);
        gsap.ticker.lagSmoothing(0);
      }
    })();

    return () => {
      cancelled = true;
      if (tl) {
        tl.scrollTrigger?.kill();
        tl.kill();
      }
      if (rafCallback && gsapRef) gsapRef.ticker.remove(rafCallback);
      if (lenis) lenis.destroy();
    };
  }, [
    uid,
    layer1YPercent,
    layer2YPercent,
    layer3YPercent,
    layer4YPercent,
    scrub,
    triggerStart,
    triggerEnd,
    enableLenis,
  ]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <section
        className="relative z-[2] flex min-h-[100svh] items-center justify-center"
        style={{ padding: sectionPadding }}
      >
        <div className="absolute left-0 top-0 h-[120%] w-full max-w-none object-cover">
          <div
            className="absolute bottom-[-1px] left-0 z-[20] h-[2px] w-full"
            style={{ backgroundColor: lineColor }}
          />

          <div
            ref={layersRef}
            className="absolute left-0 top-0 h-full w-full max-w-none overflow-hidden object-cover"
          >
            <img
              src={layer1Image}
              data-parallax-layer={`1-${uid}`}
              loading="eager"
              width={800}
              alt=""
              className="pointer-events-none absolute left-0 top-[-17.5%] h-[117.5%] w-full max-w-none object-cover"
            />
            <img
              src={layer2Image}
              data-parallax-layer={`2-${uid}`}
              loading="eager"
              width={800}
              alt=""
              className="pointer-events-none absolute left-0 top-[-17.5%] h-[117.5%] w-full max-w-none object-cover"
            />
            <div
              data-parallax-layer={`3-${uid}`}
              className="absolute left-0 top-0 flex h-[100svh] w-full items-center justify-center"
            >
              <h2
                className="relative mb-[0.1em] mr-[0.075em] text-center font-extrabold leading-none normal-case"
                style={{ fontSize: titleFontSize }}
              >
                {title}
              </h2>
            </div>
            <img
              src={layer4Image}
              data-parallax-layer={`4-${uid}`}
              loading="eager"
              width={800}
              alt=""
              className="pointer-events-none absolute left-0 top-[-17.5%] h-[117.5%] w-full max-w-none object-cover"
            />
          </div>

          <div
            className="absolute bottom-0 left-0 z-[30] h-[20%] w-full max-w-none object-cover"
            style={{
              background: `linear-gradient(to top, rgba(${fadeColorRgb},1) 0%, rgba(${fadeColorRgb},0.738) 19%, rgba(${fadeColorRgb},0.541) 34%, rgba(${fadeColorRgb},0.382) 47%, rgba(${fadeColorRgb},0.278) 56.5%, rgba(${fadeColorRgb},0.194) 65%, rgba(${fadeColorRgb},0.126) 73%, rgba(${fadeColorRgb},0.075) 80.2%, rgba(${fadeColorRgb},0.042) 86.1%, rgba(${fadeColorRgb},0.021) 91%, rgba(${fadeColorRgb},0.008) 95.2%, rgba(${fadeColorRgb},0.002) 98.2%, transparent 100%)`,
            }}
          />
        </div>
      </section>

      <section
        className="relative min-h-[100svh]"
        style={{ backgroundColor: spacerColor }}
      />
    </div>
  );
}
