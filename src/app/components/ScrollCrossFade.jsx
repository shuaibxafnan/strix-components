"use client";

import { useEffect, useRef } from "react";

// ─── ScrollCrossfade ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// accentColor       string   "text-[#FF1E1E]"  The accent tag color
// textFillColor     string   "text-neutral-100" Text colors across headings
// descFillColor     string   "text-neutral-400" Paragraph descriptions color
// wrapperBgColor    string   "bg-black"         Root wrapper page container
// ──────────────────────────────────────────────────────────────────────────

export default function ScrollCrossfade({
  accentColor = "text-[#FF1E1E]",
  textFillColor = "text-neutral-100",
  descFillColor = "text-neutral-400",
  wrapperBgColor = "bg-black",
}) {
  const containerRef = useRef(null);

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

    // Parallel load GSAP core along with its modular ScrollTrigger plugin
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
    ])
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger || !containerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const swappers = containerRef.current.querySelectorAll(".swapper-box");

        const handleTranslation = (swapper) => {
          const controller =
            swapper.parentNode.querySelector(".controller-box");
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
            // Set initial state: First image visible, second hidden
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

        // Initialize responsive breakpoints via GSAP MatchMedia
        const mm = gsap.matchMedia();

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
      })
      .catch((err) =>
        console.error("[ScrollCrossfade] GSAP Engine Load Failure:", err),
      );
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full min-height-screen font-sans antialiased overflow-x-hidden ${wrapperBgColor} ${textFillColor}`}
      style={{
        "--left-pad": "calc(48px + 2rem)",
        "--container-width": "calc(100vw - 1rem - var(--left-pad))",
        "--column-one": "calc(var(--container-width) * (1.2 / 3.2))",
        "--column-two": "calc(var(--container-width) * (2 / 3.2))",
        "--col-one-height": "min(70vh, calc((380 / 272) * var(--column-one)))",
        "--col-two-height":
          "min(110vh, calc((1148 / 940) * var(--column-two)))",
        "--heading": "clamp(2rem, 6vw + 1rem, 10rem)",
      }}
    >
      {/* HEADER ENTRY SECTION */}
      <header className="h-screen flex flex-col justify-center items-center text-center">
        <h1 className="relative font-bold m-0 text-[length:var(--heading)] tracking-tighter">
          <span
            className={`absolute bottom-[90%] left-1/2 -translate-x-1/2 font-medium tracking-widest text-[0.2em] uppercase ${accentColor}`}
          >
            All-New
          </span>
          CSS Pro
        </h1>
        <h2 className="uppercase opacity-80 font-semibold tracking-wide text-[calc(var(--heading)*0.25)] mt-4">
          Scroll-driven crossfades
        </h2>
      </header>

      {/* TIMELINE DECK COMPONENT CONTAINERS */}
      <main className="flex flex-col gap-32 md:gap-48 w-full max-w-none">
        {/* SECTION 1 */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 p-4 pl-4 md:pl-[var(--left-pad)] min-h-screen">
            <div className="swapper-box h-[calc(var(--col-one-height)*2)] md:h-[var(--col-one-height)] w-full relative rounded-md bg-zinc-950 isolation-auto">
              {/* Progress Pillar Bar */}
              <div className="progress-indicator absolute h-[15%] min-h-[60px] max-h-[100px] w-[6px] top-1/2 -translate-y-1/2 flex flex-col gap-[5%] z-20 right-2">
                <div className="flex-[10] relative rounded-full bg-white/25">
                  <div className="progress-fill-node absolute top-0 w-full rounded-full h-0 bg-white" />
                </div>
                <div
                  className="relative rounded-full bg-white/25 style-flip"
                  style={{ flex: "calc(1 + (var(--flip, 0) * 99))" }}
                >
                  <div className="progress-fill-node absolute top-0 w-full rounded-full h-0 bg-white" />
                </div>
              </div>
              {/* Text Caption Blocks */}
              <div className="absolute bottom-[102%] p-4 text-[12px] w-[40ch] max-w-[90%] text-right right-1 uppercase grid gap-1 z-10">
                <h2 className="text-[12px] font-bold tracking-wider">
                  Tiny amounts of CSS
                </h2>
                <p className={descFillColor}>
                  Scroll-driven animations give you the ability to drive your
                  CSS animations on scroll.
                </p>
              </div>
              {/* Overlapping Composited Images */}
              <img
                src="https://fastly.picsum.photos/id/331/1080/1080.jpg?hmac=sKtPuOzOG1d8p_sVxG4BEL0XGOMPDCvjpN43H9zqW9M"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
              <img
                src="https://fastly.picsum.photos/id/536/1080/1080.jpg?hmac=TfR6GPF3n9B6s9bK4hbWAh_1qU8AGdKEOMiQd_nZIhs"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
            </div>
            <div className="controller-box h-[calc(var(--col-two-height)*1.5)] md:h-[var(--col-two-height)] w-full rounded-md bg-zinc-950">
              <img
                src="https://fastly.picsum.photos/id/1033/1080/1080.jpg?hmac=O43_Fmtq6is3ysXH7ZLNS4iNqCcoWCIEftNR8UK0L5s"
                alt=""
                width="1080"
                className="w-full h-full rounded-md object-cover mix-blend-plus-lighter"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 p-4 pl-4 md:pl-[var(--left-pad)] min-h-screen">
            <div className="controller-box h-[calc(var(--col-two-height)*1.5)] md:h-[var(--col-two-height)] w-full rounded-md bg-zinc-950 order-2 md:order-1">
              <img
                src="https://fastly.picsum.photos/id/827/1080/1080.jpg?hmac=wB2CZUPy2O2MgG8okJtTZZadwwADt7XpjNRIz9fOeME"
                alt=""
                width="1080"
                className="w-full h-full rounded-md object-cover mix-blend-plus-lighter"
              />
            </div>
            <div className="swapper-box h-[calc(var(--col-one-height)*2)] md:h-[var(--col-one-height)] w-full relative rounded-md bg-zinc-950 isolation-auto order-1 md:order-2">
              <div className="progress-indicator absolute h-[15%] min-h-[60px] max-h-[100px] w-[6px] top-1/2 -translate-y-1/2 flex flex-col gap-[5%] z-20 left-2">
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
                  Cross fading
                </h2>
                <p className={descFillColor}>
                  The trick is one animation to take opacity from 1 to 0. One
                  image uses reverse animation-direction.
                </p>
              </div>
              <img
                src="https://fastly.picsum.photos/id/378/1080/1080.jpg?hmac=U_xpCJPibwUl5MELHA1W48oscgI19Tsu_zCsFSBen5g"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
              <img
                src="https://fastly.picsum.photos/id/781/1080/1080.jpg?hmac=jkgggUr9sBP4qCFAKygIg2lgkcwlZXzll0rwptlFHH4"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr] gap-4 p-4 pl-4 md:pl-[var(--left-pad)] min-h-screen">
            <div className="swapper-box h-[calc(var(--col-one-height)*2)] md:h-[var(--col-one-height)] w-full relative rounded-md bg-zinc-950 isolation-auto">
              <div className="progress-indicator absolute h-[15%] min-h-[60px] max-h-[100px] w-[6px] top-1/2 -translate-y-1/2 flex flex-col gap-[5%] z-20 right-2">
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
                  mix-blend-mode
                </h2>
                <p className={descFillColor}>
                  For a better looking fade, use mix-blend-mode: plus-lighter on
                  the images.
                </p>
              </div>
              <img
                src="https://fastly.picsum.photos/id/117/1080/1080.jpg?hmac=-9Jpnmxo4_zX7bESbfC1x4y5bAxow3Cvhejo-gZsCIE"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
              <img
                src="https://fastly.picsum.photos/id/659/1080/1080.jpg?hmac=_To6fpzA0QnMsx3PTeTwtVxjjbnnNN2rliHf9q0UDNU"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
            </div>
            <div className="controller-box h-[calc(var(--col-two-height)*1.5)] md:h-[var(--col-two-height)] w-full rounded-md bg-zinc-950">
              <img
                src="https://fastly.picsum.photos/id/358/1080/1080.jpg?hmac=MbMwFskGUIBLvCw3ww1djE0ZnUN3iRw1a9tR_VCSURM"
                alt=""
                width="1080"
                className="w-full h-full rounded-md object-cover mix-blend-plus-lighter"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4 */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr] gap-4 p-4 pl-4 md:pl-[var(--left-pad)] min-h-screen">
            <div className="controller-box h-[calc(var(--col-two-height)*1.5)] md:h-[var(--col-two-height)] w-full rounded-md bg-zinc-950 order-2 md:order-1">
              <img
                src="https://fastly.picsum.photos/id/362/1080/1080.jpg?hmac=vzwn2CXU8s21DH7LVZRAozOwmkP5S2iWl2ssJvCv2QA"
                alt=""
                width="1080"
                className="w-full h-full rounded-md object-cover mix-blend-plus-lighter"
              />
            </div>
            <div className="swapper-box h-[calc(var(--col-one-height)*2)] md:h-[var(--col-one-height)] w-full relative rounded-md bg-zinc-950 isolation-auto order-1 md:order-2">
              <div className="progress-indicator absolute h-[15%] min-h-[60px] max-h-[100px] w-[6px] top-1/2 -translate-y-1/2 flex flex-col gap-[5%] z-20 left-2">
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
                <h2 className="text-[12px] font-bold tracking-wider">Driver</h2>
                <p className={descFillColor}>
                  Drive the animation based on the container position. Use calc
                  for other effects.
                </p>
              </div>
              <img
                src="https://fastly.picsum.photos/id/983/1080/1080.jpg?hmac=_pzYklUuqWk6z0X9h9p9xNKJr2sThQoadn5YRCVHa88"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
              <img
                src="https://fastly.picsum.photos/id/825/1080/1080.jpg?hmac=XUiCHv4mdtexe6QpAmD4Y_d81clCeLoZKYO6xGtRU6M"
                alt=""
                width="1080"
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover mix-blend-plus-lighter md:mix-blend-plus-lighter"
              />
            </div>
          </div>
        </section>

        {/* OUTRO END CAP */}
        <section className="h-[50vh] flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-[calc(var(--heading)*0.8)] font-bold tracking-tight">
            fin.
          </h2>
          <h2 className="text-[calc(var(--heading)*0.15)] font-semibold tracking-widest uppercase opacity-80 mt-2">
            Bookmark and follow for more.
            <br />
            Polyfilled with GSAP.
          </h2>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center p-8 border-t border-white/10 text-sm opacity-60">
        jh3yy &copy; 2024 ʕ •ᴥ•ʔ
      </footer>
    </div>
  );
}
