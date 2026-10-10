"use client";

import { useState, useRef, useEffect } from "react";

// ─── FruitySlider ─────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// slides               Slide[]    See DEFAULT_SLIDES — array of slide data
// caneSvgUrl           string     Cane SVG url (used ONLY as CSS mask shape)
// brandName            string     "Fruity"         Header brand text
// transitionDuration   number     500              Slide transition ms (runtime)
// waveDuration         string     "4s"             Button wave animation duration (runtime)
// buttonSize           string     "80px"           Nav button size (runtime)
// buttonFontSize       string     "40px"           Nav button icon size (runtime)
// ─────────────────────────────────────────────────────────────────────────────
//
// Slide shape:
// {
//   name:       string   — big h1 text
//   logoColor:  string   — brand + button color
//   bgColor:    string   — section background
//   waveBg:     string   — wave ring color (matches bgColor)
//   canColor:   string   — solid fill color shown inside the can mask
//   images:     string[] — [bottomLeft, topLeft, topRight, bottomRight]
// }
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://www.yudiz.com/codepen/fruity";

const DEFAULT_SLIDES = [
  {
    name: "Pear",
    logoColor: "#03403f",
    bgColor: "#c9e78a",
    waveBg: "#c9e78a",
    canColor: "#e6ffde",
    images: [
      `${BASE}/pear-one.png`,
      `${BASE}/pear-two.png`,
      `${BASE}/pear-three.png`,
      `${BASE}/pear-four.png`,
    ],
  },
  {
    name: "Apple",
    logoColor: "#ec4458",
    bgColor: "#ffb2b2",
    waveBg: "#ffb2b2",
    canColor: "#f2675a",
    images: [
      `${BASE}/apple-one.png`,
      `${BASE}/apple-two.png`,
      `${BASE}/apple-three.png`,
      `${BASE}/apple-four.png`,
    ],
  },
  {
    name: "Exotic",
    logoColor: "#6464ff",
    bgColor: "#c1bff2",
    waveBg: "#c1bff2",
    canColor: "#9590f1",
    images: [
      `${BASE}/exotic-one.png`,
      `${BASE}/exotic-two.png`,
      `${BASE}/exotic-three.png`,
      `${BASE}/exotic-four.png`,
    ],
  },
];

export default function FruitySlider({
  slides = DEFAULT_SLIDES,
  caneSvgUrl = `${BASE}/cane.svg`,
  brandName = "Fruity",
  transitionDuration = 500,
  waveDuration = "4s",
  buttonSize = "80px",
  buttonFontSize = "40px",
}) {
  const [index, setIndex] = useState(0);
  const [logoColor, setLogoColor] = useState(slides[0].logoColor);
  const [h1Text, setH1Text] = useState(slides[0].name);

  const containerRef = useRef(null);
  const gsapRef = useRef(null);
  const gsapReadyRef = useRef(false);

  const last = slides.length - 1;

  useEffect(() => {
    if (!document.querySelector("script[data-gsap-fruity]")) {
      const el = document.createElement("script");
      el.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
      el.setAttribute("data-gsap-fruity", "1");
      document.head.appendChild(el);
    }
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (window.gsap) {
        clearInterval(poll);
        gsapRef.current = window.gsap;
        gsapRef.current.config({ trialWarn: false });
        gsapReadyRef.current = true;
        gsapRef.current.from(".fruit-image", {
          y: "-100vh",
          delay: 0.5,
          duration: 0.6,
        });
        gsapRef.current.to(".fruit-image img", {
          x: "random(-20, 20)",
          y: "random(-20, 20)",
          duration: 2,
          ease: "none",
          yoyo: true,
          repeat: -1,
        });
      }
      if (attempts > 50) clearInterval(poll);
    }, 100);
    return () => clearInterval(poll);
  }, []);

  const navigate = (dir) => {
    const next = index + dir;
    if (next < 0 || next > last) return;

    if (containerRef.current)
      containerRef.current.style.left = `${next * -100}%`;

    if (gsapReadyRef.current && gsapRef.current) {
      const gsap = gsapRef.current;
      gsap.to(".logo-text", { color: slides[next].logoColor, duration: 1 });
      gsap.from(".h1-text", { y: "20%", opacity: 0, duration: 0.5 });
      gsap.from(".fruit-image", {
        y: dir > 0 ? "-100vh" : "100vh",
        delay: dir > 0 ? 0.4 : 0.5,
        duration: 0.4,
      });
    }

    setLogoColor(slides[next].logoColor);
    setH1Text(slides[next].name);
    setIndex(next);
  };

  const prevColor = index > 0 ? slides[index - 1].logoColor : "transparent";
  const nextColor = index < last ? slides[index + 1].logoColor : "transparent";
  const prevWave = index > 0 ? slides[index - 1].waveBg : "transparent";
  const nextWave = index < last ? slides[index + 1].waveBg : "transparent";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        @keyframes wave-btn {
          0%   { box-shadow: 0 0 0 0px var(--wbg), 0 0 0 0px var(--wbg); }
          40%  { box-shadow: 0 0 0 50px rgba(60,41,188,0), 0 0 0 0px var(--wbg); }
          80%  { box-shadow: 0 0 0 50px rgba(60,41,188,0), 0 0 0 30px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0px rgba(60,41,188,0), 0 0 0 30px rgba(0,230,118,0); }
        }
        .fruity-btn {
          animation: wave-btn ${waveDuration} linear infinite;
          width: ${buttonSize};
          height: ${buttonSize};
          font-size: ${buttonFontSize};
          transition: all 0.3s ease-in-out;
        }
        .fruity-btn-prev { --wbg: ${prevWave}; color: ${prevColor}; }
        .fruity-btn-next { --wbg: ${nextWave}; color: ${nextColor}; }
        .cane-mask {
          mask-image: url(${caneSvgUrl});
          -webkit-mask-image: url(${caneSvgUrl});
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center center;
          mask-position: center center;
          -webkit-mask-size: 100% auto;
          mask-size: 100% auto;
          aspect-ratio: 265 / 490;
        }
        .slide-strip {
          width: ${slides.length * 100}vw;
          transition: left ${transitionDuration}ms ease-in-out;
        }
        .fruit-shadow::after {
          content: "";
          position: absolute;
          background: linear-gradient(90deg, #000 3.66%, rgba(0,0,0,0) 92.35%);
          opacity: 0.43;
          filter: blur(7.5px);
          transform: rotate(-6.941deg);
          right: 0;
          width: 173px;
          height: 30px;
          bottom: -50px;
        }
        .fruit-shadow-sm::after { height: 22px; bottom: -200px; }
        .fruit-shadow-xs::after { width: 103px; bottom: -280px; }
      `}</style>

      <div
        className="overflow-hidden w-screen h-screen"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        {/* Header */}
        <header className="fixed top-0 left-0 w-screen z-[99] px-7 pt-[22px] text-center">
          <h2
            className="logo-text text-[30px] md:text-[40px] font-black leading-normal m-0 transition-colors duration-1000"
            style={{ color: logoColor }}
          >
            {brandName}
          </h2>
        </header>

        {/* Big H1 */}
        <h1
          className="h1-text fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 m-0 text-white leading-none select-none pointer-events-none
            text-[100px] sm:text-[180px] md:text-[240px] lg:text-[300px] xl:text-[350px] 2xl:text-[449px]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {h1Text}
        </h1>

        {/* Cane — solid color fill, no labels */}
        <div
          className="cane-mask fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
            w-[180px] sm:w-[200px] md:w-[230px] lg:w-[250px] xl:w-[265px]"
          style={{
            backgroundColor: slides[index].canColor,
            transition: `background-color ${transitionDuration}ms ease-in-out`,
          }}
        />

        {/* Prev button */}
        {index > 0 && (
          <button
            onClick={() => navigate(-1)}
            className="fruity-btn fruity-btn-prev fixed left-[30px] top-1/2 -translate-y-1/2 z-[99]
              rounded-full bg-white border-none cursor-pointer
              max-sm:top-[90%] max-sm:!w-[60px] max-sm:!h-[60px] max-sm:!text-xl"
            aria-label="Previous"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        )}

        {/* Next button */}
        {index < last && (
          <button
            onClick={() => navigate(1)}
            className="fruity-btn fruity-btn-next fixed right-[30px] top-1/2 -translate-y-1/2 z-[99]
              rounded-full bg-white border-none cursor-pointer
              max-sm:top-[90%] max-sm:!w-[60px] max-sm:!h-[60px] max-sm:!text-xl"
            aria-label="Next"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        )}

        {/* Scrolling slide strip */}
        <div className="w-screen h-screen overflow-hidden relative -z-[1]">
          <div
            ref={containerRef}
            className="slide-strip relative flex items-center h-full"
            style={{ left: "0%" }}
          >
            {slides.map((slide) => (
              <section
                key={slide.name}
                className="min-w-[100vw] h-screen relative overflow-hidden -z-[1]"
                style={{ backgroundColor: slide.bgColor }}
              >
                <div
                  className="fruit-image fruit-shadow absolute bottom-[100px] left-0
                  max-w-[150px] sm:max-w-[180px] md:max-w-[180px] lg:max-w-[220px] xl:max-w-[250px] 2xl:max-w-[282px]"
                >
                  <img
                    src={slide.images[0]}
                    alt={`${slide.name} 1`}
                    className="w-full h-auto"
                  />
                </div>
                <div
                  className="fruit-image fruit-shadow-sm absolute
                  top-[18%] left-[4%] sm:top-[15%] sm:left-[12%] md:top-[12%] md:left-[12%]
                  lg:top-[10%] lg:left-[18%] xl:top-[10%] xl:left-[22%] 2xl:top-[23%] 2xl:left-[25%]
                  max-w-[115px] sm:max-w-[145px] md:max-w-[165px] lg:max-w-[185px] xl:max-w-[215px] 2xl:max-w-[247px]"
                >
                  <img
                    src={slide.images[1]}
                    alt={`${slide.name} 2`}
                    className="w-full h-auto"
                  />
                </div>
                <div
                  className="fruit-image fruit-shadow-xs absolute
                  top-[18%] right-[4%] sm:top-[15%] sm:right-[10%] md:top-[12%] md:right-[12%]
                  lg:top-[10%] lg:right-[18%] xl:top-[10%] xl:right-[25%] 2xl:top-[23%] 2xl:right-[25%]
                  max-w-[100px] sm:max-w-[130px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-[180px] 2xl:max-w-[211px]"
                >
                  <img
                    src={slide.images[2]}
                    alt={`${slide.name} 3`}
                    className="w-full h-auto"
                  />
                </div>
                <div
                  className="fruit-image fruit-shadow absolute bottom-[100px] right-0 sm:bottom-[150px]
                  max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[230px] xl:max-w-[260px] 2xl:max-w-[294px]"
                >
                  <img
                    src={slide.images[3]}
                    alt={`${slide.name} 4`}
                    className="w-full h-auto"
                  />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
