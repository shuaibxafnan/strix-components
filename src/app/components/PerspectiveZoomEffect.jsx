"use client";

import { useEffect, useRef } from "react";

// ─── NextGenPerspectiveScroll ───────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images              array    [...]     List of images with layer data
// titleText           string   "..."     Central flying text heading
// revealText          string   "..."     Text highlighted character by character
// scrubSpeed          number   1         GSAP ScrollTrigger scrub lag value
// zoomDuration        string   "+=150%"  How long the zoom pinned interaction stays
// textRevealDuration  number   1500      Scroll distance in px for text reveal
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    src: "https://assets.codepen.io/204808/eugene-chystiakov-W6FESrD-M50-unsplash.jpg",
    layer: 2,
  },
  {
    src: "https://assets.codepen.io/204808/hendo-wang-DsGeUBaJPwc-unsplash.jpg",
    layer: 2,
  },
  {
    src: "https://assets.codepen.io/204808/taylor-sondgeroth-ltsKOg_q_Gc-unsplash.jpg",
    layer: 1,
  },
  {
    src: "https://assets.codepen.io/204808/shayna-douglas-w2tG22s8hEc-unsplash.jpg",
    layer: 2,
  },
  {
    src: "https://assets.codepen.io/204808/samantha-fortney-o8CA1Kj8TJU-unsplash.jpg",
    layer: 3,
  },
  {
    src: "https://assets.codepen.io/204808/jakub-dziubak-wvXG_7ebZ18-unsplash.jpg",
    layer: 1,
  },
  { src: "https://assets.codepen.io/204808/golden-retriever-3.png", layer: 3 },
  { src: "https://assets.codepen.io/204808/golden-retriever-2.png", layer: 3 },
  { src: "https://assets.codepen.io/204808/golden-retriever-1.png", layer: 1 },
  {
    src: "https://assets.codepen.io/204808/richard-brutyo-Sg3XwuEpybU.jpg",
    layer: 3,
  },
  {
    src: "https://assets.codepen.io/204808/berkay-gumustekin-ngqyo2AYYnE.jpg",
    layer: 2,
  },
  {
    src: "https://assets.codepen.io/204808/zach-shup-R6SdnJnLJEg.jpg",
    layer: 1,
  },
];

export default function PerspectiveZoomEffect({
  images = DEFAULT_IMAGES,
  titleText = (
    <>
      Perspective Zoom Effect
      <br />
      on Scroll
    </>
  ),
  revealText = "If you’re lucky, a Golden Retriever will come into your life, steal your heart, and change everything.",
  scrubSpeed = 1,
  zoomDuration = "+=150%",
  textRevealDuration = 1500,
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
        el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
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
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        // 1. Perspective Grid Zoom Timeline
        const zoomTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".zoom-container-el",
            start: "top top",
            end: zoomDuration,
            pin: true,
            scrub: scrubSpeed,
          },
        });

        zoomTl
          .to(".zoom-layer-3", { opacity: 1, z: 800, ease: "power1.inOut" }, 0)
          .to(".zoom-layer-2", { opacity: 1, z: 600, ease: "power1.inOut" }, 0)
          .to(".zoom-layer-1", { opacity: 1, z: 400, ease: "power1.inOut" }, 0)
          .to(
            ".zoom-heading-el",
            { opacity: 1, z: 50, ease: "power1.inOut" },
            0,
          );

        // 2. Character-by-Character Opacity Text Reveal
        const textContainer = document.querySelector(".opacity-reveal-el");
        if (textContainer) {
          const words = textContainer.innerText.split(" ");
          textContainer.innerHTML = "";
          words.forEach((word) => {
            const wordSpan = document.createElement("span");
            wordSpan.className = "inline-block mr-[0.25em] whitespace-nowrap";

            word.split("").forEach((char) => {
              const charSpan = document.createElement("span");
              charSpan.textContent = char;
              charSpan.className =
                "reveal-char opacity-20 transition-all duration-150";
              wordSpan.appendChild(charSpan);
            });
            textContainer.appendChild(wordSpan);
          });

          const chars = textContainer.querySelectorAll(".reveal-char");

          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".section-stick-el",
                pin: true,
                start: "center center",
                end: `+=${textRevealDuration}`,
                scrub: scrubSpeed,
              },
            })
            .to(chars, {
              opacity: 1,
              color: "#fff",
              stagger: 1,
              ease: "none",
            })
            .to({}, { duration: 10 })
            .to(textContainer, {
              opacity: 0,
              scale: 1.15,
              duration: 50,
            });
        }

        // 3. Functional Feature: Infinite Marquee Tracker Speed Boost
        gsap.to(".marquee-inner", {
          xPercent: -50,
          ease: "none",
          duration: 22,
          repeat: -1,
          scrollTrigger: {
            trigger: ".marquee-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });

        // 4. Functional Feature: Interactive Reveal Matrix Cards
        gsap.from(".matrix-card", {
          opacity: 0,
          y: 60,
          stagger: 0.2,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".matrix-section",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      })
      .catch((err) => console.error("[NextGenScroll] Load error:", err));

    return () => {
      if (typeof window !== "undefined" && window.gsap) {
        const triggers = window.ScrollTrigger?.getAll();
        triggers?.forEach((trigger) => trigger.kill());
      }
    };
  }, [zoomDuration, scrubSpeed, textRevealDuration]);

  return (
    <main
      ref={containerRef}
      className="m-0 bg-[#0c0c0e] text-white font-sans antialiased selection:bg-neutral-700 selection:text-white overflow-x-hidden"
    >
      {/* ─── Hero Section (Exact Positions Preserved) ─── */}
      <div className="zoom-container-el h-screen w-screen overflow-hidden relative [perspective:100svh]">
        <h1 className="zoom-heading-el opacity-[0.1] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -translate-z-[2000px] whitespace-nowrap text-center text-[clamp(3.125rem,3.464vw+2.229rem,5rem)] leading-[clamp(4.688rem,3.349vw+3.821rem,6.5rem)] m-0 tracking-tight font-extrabold uppercase">
          {titleText}
        </h1>

        {images.map((img, idx) => {
          let layerClass = "zoom-layer-1 opacity-20 z-[1]";
          if (img.layer === 2) layerClass = "zoom-layer-2 opacity-40 z-[2]";
          if (img.layer === 3) layerClass = "zoom-layer-3 opacity-60 z-[3]";

          const positionStyles = [
            "left-[15vw] top-[21%] w-[11.5vw]",
            "left-[29%] top-[15%] w-[9.2vw]",
            "left-[36%] top-[3%] w-[11.5vw]",
            "right-[30%] top-[11%] w-[7.6vw]",
            "bottom-auto right-[7%] top-[28%] w-[13.2vw]",
            "bottom-[32%] right-[3.5%] w-[4.7vw]",
            "bottom-[13.5%] left-[16%] w-[10.5vw]",
            "bottom-[24%] left-[29%] w-[5.9vw]",
            "bottom-[46%] left-[7.5%] top-auto w-[5.2vw]",
            "bottom-[5.5%] right-[15%] w-[15vw]",
            "bottom-[10.5%] left-auto right-[38%] w-[8.3vw]",
            "right-[4%] top-[5%] w-[6.1vw]",
          ];

          return (
            <div
              key={idx}
              className={`absolute origin-center max-w-[300px] max-h-[300px] ${layerClass} ${positionStyles[idx % positionStyles.length]}`}
            >
              <img
                src={img.src}
                alt={img.alt || "Layer Matrix Asset"}
                className="w-full h-auto object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* ─── Pinned Text Section ─── */}
      <section className="section-stick-el min-h-screen bg-black flex justify-center items-center text-white px-6">
        <p className="opacity-reveal-el text-4xl md:text-[5rem] text-center w-full md:w-4/5 font-bold tracking-tight leading-[1.1] text-balance">
          {revealText}
        </p>
      </section>

      {/* ─── NEW Next-Gen Section: Kinetic Marquee ─── */}
      <section className="marquee-section py-20 bg-neutral-950 border-y border-white/5 overflow-hidden whitespace-nowrap select-none">
        <div className="marquee-inner inline-flex text-[clamp(4rem,10vw,12rem)] font-black uppercase tracking-tighter leading-none text-neutral-800">
          <span className="mr-20">Golden Companion //</span>
          <span className="mr-20">Unconditional Loyalty //</span>
          <span className="mr-20">Golden Companion //</span>
          <span className="mr-20">Unconditional Loyalty //</span>
        </div>
      </section>

      {/* ─── NEW Next-Gen Section: Interactive Grid Matrix ─── */}
      <section className="matrix-section min-h-screen bg-[#0c0c0e] py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-20">
          <div>
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-500 block mb-3">
              // ARCHIVE CHAPTERS
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              THE THREE TRUTHS
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-base leading-relaxed pt-2">
            Exploring the lasting behavioral traits, environmental histories,
            and unparalleled emotional connections shared with man’s truest
            companion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              tag: "01 / ORIGIN",
              title: "Gundog Heritage",
              desc: "Bred primarily in Scotland during the 19th century to recover water game from rugged hunting terrains.",
            },
            {
              tag: "02 / NATURE",
              title: "Empathic Intelligence",
              desc: "Consistently ranked among the top smartest breeds, capable of reading emotional shifts instantly.",
            },
            {
              tag: "03 / SPIRIT",
              title: "Lifelong Radiance",
              desc: "Maintains a playful, joyful puppy-like demeanor well into maturity, bringing warmth to any household.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="matrix-card group p-10 bg-gradient-to-br from-neutral-900 to-black border border-white/5 rounded-lg hover:border-white/20 transition-all duration-500 cursor-pointer flex flex-col justify-between aspect-[4/3]"
            >
              <span className="text-xs font-mono text-neutral-500 block">
                {item.tag}
              </span>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight group-hover:text-neutral-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Next-Gen Footer HUD ─── */}
      <footer className="border-t border-white/5 bg-black py-12 px-6 text-xs text-neutral-600 font-mono flex flex-col md:flex-row justify-between items-center gap-4">
        <div>© 2026 GOLDEN CHRONICLES. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">
            BACK TO TOP ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
