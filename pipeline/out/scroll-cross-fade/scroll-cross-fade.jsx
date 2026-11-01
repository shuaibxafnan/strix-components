"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    title: "Tiny amounts of CSS",
    desc: "Scroll-driven animations give you the ability to drive your CSS animations on scroll.",
    imgA: "https://fastly.picsum.photos/id/331/1080/1080.jpg?hmac=sKtPuOzOG1d8p_sVxG4BEL0XGOMPDCvjpN43H9zqW9M",
    imgB: "https://fastly.picsum.photos/id/536/1080/1080.jpg?hmac=TfR6GPF3n9B6s9bK4hbWAh_1qU8AGdKEOMiQd_nZIhs",
    sideImg: "https://fastly.picsum.photos/id/1033/1080/1080.jpg?hmac=O43_Fmtq6is3ysXH7ZLNS4iNqCcoWCIEftNR8UK0L5s",
  },
  {
    title: "Cross fading",
    desc: "The trick is one animation to take opacity from 1 to 0. One image uses reverse animation-direction.",
    imgA: "https://fastly.picsum.photos/id/378/1080/1080.jpg?hmac=U_xpCJPibwUl5MELHA1W48oscgI19Tsu_zCsFSBen5g",
    imgB: "https://fastly.picsum.photos/id/781/1080/1080.jpg?hmac=jkgggUr9sBP4qCFAKygIg2lgkcwlZXzll0rwptlFHH4",
    sideImg: "https://fastly.picsum.photos/id/827/1080/1080.jpg?hmac=wB2CZUPy2O2MgG8okJtTZZadwwADt7XpjNRIz9fOeME",
  },
  {
    title: "mix-blend-mode",
    desc: "For a better looking fade, use mix-blend-mode: plus-lighter on the images.",
    imgA: "https://fastly.picsum.photos/id/117/1080/1080.jpg?hmac=-9Jpnmxo4_zX7bESbfC1x4y5bAxow3Cvhejo-gZsCIE",
    imgB: "https://fastly.picsum.photos/id/659/1080/1080.jpg?hmac=_To6fpzA0QnMsx3PTeTwtVxjjbnnNN2rliHf9q0UDNU",
    sideImg: "https://fastly.picsum.photos/id/358/1080/1080.jpg?hmac=MbMwFskGUIBLvCw3ww1djE0ZnUN3iRw1a9tR_VCSURM",
  },
  {
    title: "Driver",
    desc: "Drive the animation based on the container position. Use calc for other effects.",
    imgA: "https://fastly.picsum.photos/id/983/1080/1080.jpg?hmac=_pzYklUuqWk6z0X9h9p9xNKJr2sThQoadn5YRCVHa88",
    imgB: "https://fastly.picsum.photos/id/825/1080/1080.jpg?hmac=XUiCHv4mdtexe6QpAmD4Y_d81clCeLoZKYO6xGtRU6M",
    sideImg: "https://fastly.picsum.photos/id/362/1080/1080.jpg?hmac=vzwn2CXU8s21DH7LVZRAozOwmkP5S2iWl2ssJvCv2QA",
  },
];

export default function ScrollCrossFade({
  items = DEFAULT_ITEMS,
  textFillColor = "text-neutral-100",
  descFillColor = "text-neutral-400",
  wrapperBgColor = "bg-black",
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let mm = null;
    let ScrollTriggerRef = null;

    (async () => {
      const gsapModule = await import("gsap");
      const stModule = await import("gsap/ScrollTrigger");
      if (cancelled || !containerRef.current) return;
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
      ScrollTriggerRef = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const swappers = containerRef.current.querySelectorAll(".swapper-box");

      const handleTranslation = (swapper) => {
        const controller = swapper.parentNode.querySelector(".controller-box");
        gsap.to(swapper, {
          y: () => controller.offsetHeight - swapper.offsetHeight,
          ease: "none",
          scrollTrigger: {
            trigger: swapper.parentNode,
            scrub: true,
            start: "top center",
            end: "bottom center",
          },
        });
      };

      const handleCrossFade = (swapper, mobile = false) => {
        const imgs = swapper.querySelectorAll("img");
        const trigger = mobile ? swapper : swapper.parentNode;

        if (imgs.length >= 2) {
          gsap.set(imgs[0], { opacity: 0 });
          gsap.set(imgs[1], { opacity: 1 });

          gsap.to(imgs[0], {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger,
              scrub: true,
              start: `top center${mobile ? "" : "-=25%"}`,
              end: `bottom center${mobile ? "" : "+=25%"}`,
            },
          });

          gsap.to(imgs[1], {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger,
              scrub: true,
              start: `top center${mobile ? "" : "-=25%"}`,
              end: `bottom center${mobile ? "" : "+=25%"}`,
            },
          });
        }
      };

      const handleProgress = (swapper, mobile = false) => {
        const progress = swapper.querySelector(".progress-indicator");
        const trigger = mobile ? swapper : swapper.parentNode;

        gsap.to(progress, {
          "--flip": 1,
          ease: "none",
          scrollTrigger: {
            trigger,
            scrub: true,
            start: "center center",
            end: "center center",
          },
        });

        const markers = swapper.querySelectorAll(".progress-fill-node");
        markers.forEach((marker, index) => {
          gsap.to(marker, {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger,
              scrub: true,
              start: index === 0 ? "center center+=50%" : "center center",
              end: index === 0 ? "center center" : "center center-=50%",
            },
          });
        });
      };

      mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        swappers.forEach((swapper) => {
          handleCrossFade(swapper, true);
          handleProgress(swapper, true);
        });
      });

      mm.add("(min-width: 768px)", () => {
        swappers.forEach((swapper) => {
          handleTranslation(swapper);
          handleCrossFade(swapper);
          handleProgress(swapper);
        });
      });
    })();

    return () => {
      cancelled = true;
      if (mm) mm.revert();
      if (ScrollTriggerRef) ScrollTriggerRef.refresh();
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen font-sans antialiased overflow-x-hidden ${wrapperBgColor} ${textFillColor} ${className}`}
      style={{
        "--left-pad": "calc(48px + 2rem)",
        "--container-width": "calc(100vw - 1rem - var(--left-pad))",
        "--column-one": "calc(var(--container-width) * (1.2 / 3.2))",
        "--column-two": "calc(var(--container-width) * (2 / 3.2))",
        "--col-one-height": "min(70vh, calc((380 / 272) * var(--column-one)))",
        "--col-two-height":
          "min(110vh, calc((1148 / 940) * var(--column-two)))",
      }}
    >
      <main className="flex flex-col gap-32 md:gap-48 w-full max-w-none">
        {items.map((item, i) => {
          const flipped = i % 2 === 1;
          const wide = Math.floor(i / 2) % 2 === 1;
          return (
            <section key={i} className="w-full">
              <div
                className={`grid grid-cols-1 gap-4 p-4 pl-4 md:pl-[var(--left-pad)] min-h-screen ${
                  wide ? "md:grid-cols-[2fr_1.2fr]" : "md:grid-cols-[1.2fr_2fr]"
                }`}
              >
                <div
                  className={`controller-box h-[calc(var(--col-two-height)*1.5)] md:h-[var(--col-two-height)] w-full rounded-md bg-zinc-950 ${
                    flipped ? "order-2 md:order-1" : "order-2"
                  }`}
                >
                  <img
                    src={item.sideImg}
                    alt={item.sideAlt || ""}
                    width="1080"
                    className="w-full h-full rounded-md object-cover mix-blend-plus-lighter"
                  />
                </div>
                <div
                  className={`swapper-box h-[calc(var(--col-one-height)*2)] md:h-[var(--col-one-height)] w-full relative rounded-md bg-zinc-950 isolation-auto ${
                    flipped ? "order-1 md:order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`progress-indicator absolute h-[15%] min-h-[60px] max-h-[100px] w-[6px] top-1/2 -translate-y-1/2 flex flex-col gap-[5%] z-20 ${
                      flipped ? "left-2" : "right-2"
                    }`}
                  >
                    <div className="flex-[10] relative rounded-full bg-white/25">
                      <div className="progress-fill-node absolute top-0 w-full rounded-full h-0 bg-white" />
                    </div>
                    <div
                      className="relative rounded-full bg-white/25"
                      style={{ flex: "calc(1 + (var(--flip, 0) * 99))" }}
                    >
                      <div className="progress-fill-node absolute top-0 w-full rounded-full h-0 bg-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-[102%] p-4 text-[12px] w-[40ch] max-w-[90%] text-right right-1 uppercase grid gap-1 z-10">
                    <h2 className="text-[12px] font-bold tracking-wider">
                      {item.title}
                    </h2>
                    <p className={descFillColor}>{item.desc}</p>
                  </div>
                  <img
                    src={item.imgA}
                    alt={item.imgAAlt || ""}
                    width="1080"
                    className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter"
                  />
                  <img
                    src={item.imgB}
                    alt={item.imgBAlt || ""}
                    width="1080"
                    className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter"
                  />
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
