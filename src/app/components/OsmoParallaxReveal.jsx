"use client";

import { useEffect, useId, useRef } from "react";

export default function OsmoParallaxReveal({
  bgColor = "#121212",
  textColor = "#EFEEEC",
  lineColor = "#000000",
  fadeColorRgb = "0,0,0",
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
  showIcon = true,
}) {
  const uid = useId().replace(/:/g, "");
  const layersRef = useRef(null);

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

    let tl;
    let lenis;
    let rafCallback;

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"),
      loadScript(
        "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js",
      ),
      enableLenis
        ? loadScript("https://unpkg.com/lenis@1.1.14/dist/lenis.min.js")
        : Promise.resolve(),
    ])
      .then(() => {
        const { gsap, ScrollTrigger, Lenis } = window;
        if (!gsap || !ScrollTrigger || !layersRef.current) return;

        gsap.config({ trialWarn: false });
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

        if (enableLenis && Lenis) {
          lenis = new Lenis();
          lenis.on("scroll", ScrollTrigger.update);
          rafCallback = (time) => lenis.raf(time * 1000);
          gsap.ticker.add(rafCallback);
          gsap.ticker.lagSmoothing(0);
        }
      })
      .catch((e) =>
        console.error("[ParallaxLayerReveal] GSAP load failed:", e.message),
      );

    return () => {
      if (tl) tl.scrollTrigger?.kill();
      if (tl) tl.kill();
      if (rafCallback && window.gsap) window.gsap.ticker.remove(rafCallback);
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
      className="relative w-full overflow-hidden"
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
        className="relative flex min-h-[100svh] bg-black items-center justify-center"
        style={{ padding: sectionPadding }}
      >
        {showIcon && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 160 160"
            fill="none"
            className="relative w-32"
          >
            <path
              d="M94.8284 53.8578C92.3086 56.3776 88 54.593 88 51.0294V0H72V59.9999C72 66.6273 66.6274 71.9999 60 71.9999H0V87.9999H51.0294C54.5931 87.9999 56.3777 92.3085 53.8579 94.8283L18.3431 130.343L29.6569 141.657L65.1717 106.142C67.684 103.63 71.9745 105.396 72 108.939V160L88.0001 160L88 99.9999C88 93.3725 93.3726 87.9999 100 87.9999H160V71.9999H108.939C105.407 71.9745 103.64 67.7091 106.12 65.1938L106.142 65.1716L141.657 29.6568L130.343 18.3432L94.8284 53.8578Z"
              fill="currentColor"
            />
          </svg>
        )}
      </section>
    </div>
  );
}