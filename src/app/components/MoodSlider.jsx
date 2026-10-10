"use client";

import { useEffect, useRef, useState } from "react";

// ─── MoodSlider ───────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// initialValue   number   0   Starting slider value: -1 (negative) | 0 (neutral) | 1 (positive)
// ──────────────────────────────────────────────────────────────────────────

const BG_COLORS = ["#f27996", "#bdc5ff", "#a2f9d4"];

export default function MoodSlider({ initialValue = 0 }) {
  const [bgColor, setBgColor] = useState(BG_COLORS[initialValue + 1]);
  const runnerRef = useRef(null);
  const animationsRef = useRef([]);
  const prevRef = useRef(false);
  const gsapRef = useRef(null);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-ms="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-ms", src);
        el.onload = resolve;
        el.onerror = reject;
        document.head.appendChild(el);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    ).then(() => {
      const { gsap } = window;
      if (!gsap || !runnerRef.current) return;
      gsapRef.current = gsap;

      const buildAnimation = (name) => {
        const tl = new gsap.timeline({ repeat: -1, paused: true });

        if (name === "neg") {
          gsap.set("#mouth", { rotation: 10, svgOrigin: "220 265" });
          gsap.set(".eyelids", { y: -8 });
          gsap.set("#minus", { svgOrigin: "125 205" });

          tl.to(
            "#Negative .pupils",
            { x: -3, y: 3, duration: 1, ease: "power3.out" },
            "+=1",
          )
            .to(
              "#Negative #mouth",
              { rotation: 0, duration: 1, ease: "power3.out" },
              "-=1",
            )
            .to(
              "#Negative #minus",
              { duration: 0.5, rotation: -20, ease: "power1.in" },
              "-=0.5",
            )
            .to("#Negative #minus", {
              duration: 1.2,
              rotation: 0,
              ease: "elastic.out(1, 0.2)",
            })
            .to("#Negative .pupils", {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
            })
            .to(
              "#Negative #mouth",
              { rotation: 10, duration: 0.5, ease: "power3.out" },
              "-=0.5",
            )
            .to("#Negative #body", {
              y: 10,
              duration: 2,
              ease: "power2.out",
              delay: 1.2,
            })
            .to("#Negative .pupils", {
              x: 0,
              y: 5,
              duration: 2,
              delay: -2,
              ease: "power3.out",
            })
            .to("#Negative .eyelids", {
              y: 5,
              duration: 2,
              delay: -2,
              ease: "power3.out",
            })
            .to("#Negative #mouth", {
              rotation: 20,
              duration: 1.2,
              delay: -2,
              ease: "power3.out",
            })
            .to(
              "#Negative #right-leg",
              { duration: 0.75, y: -8, rotation: 15, ease: "Power1.in" },
              "+=1",
            )
            .to(
              "#Negative #mouth",
              { duration: 0.75, rotation: 10, ease: "Power1.in" },
              "-=0.75",
            )
            .to("#Negative #right-leg", {
              duration: 0.25,
              y: 0,
              rotation: 0,
              ease: "Power1.in",
            })
            .to(
              "#Negative #mouth",
              { duration: 0.25, rotation: 20, ease: "Power2.in" },
              "-=0.25",
            )
            .to(
              "#Negative #body, .pupils",
              { x: 0, y: 0, duration: 0.5, ease: "power3.out" },
              "+=2.5",
            )
            .to(
              "#Negative .eyelids",
              { duration: 0.5, ease: "Power1.out", y: -8 },
              "-=0.5",
            )
            .to(
              "#Negative #mouth",
              { duration: 0.5, ease: "Power2.in", rotation: 10 },
              "-=0.5",
            );
        } else if (name === "neu") {
          tl.to(
            "#Neutral .eyes",
            { duration: 0.75, x: "-=5", ease: "power1.in" },
            "+=1",
          )
            .to(
              "#Neutral .mouth",
              { duration: 0.75, x: -5, ease: "power1.in" },
              "-=0.75",
            )
            .to(
              "#Neutral .pupils",
              { duration: 0.75, x: -8, ease: "power1.in" },
              "-=0.75",
            )
            .to("#Neutral .eyes", { duration: 0.75, x: "+=5" }, "+=1")
            .to("#Neutral .mouth", { duration: 0.75, x: 0 }, "-=0.75")
            .to("#Neutral .pupils", { duration: 0.75, x: 0 }, "-=0.75")
            .to("#Neutral .eyelid-bot", {
              duration: 0.25,
              y: -14,
              x: -1.1,
              yoyo: true,
              repeat: 1,
            })
            .to(
              "#Neutral .eyelid-top",
              { duration: 0.25, y: 14, x: -1.1, yoyo: true, repeat: 1 },
              "-=0.5",
            )
            .to(
              "#Neutral .eyes",
              { duration: 0.75, x: "+=5", ease: "power1.in" },
              "+=1",
            )
            .to(
              "#Neutral .mouth",
              { duration: 0.75, x: 5, ease: "power1.in" },
              "-=0.75",
            )
            .to(
              "#Neutral .pupils",
              { duration: 0.75, x: 8, ease: "power1.in" },
              "-=0.75",
            )
            .to("#Neutral .eyes", { duration: 0.75, x: "-=5" }, "+=1")
            .to("#Neutral .mouth", { duration: 0.75, x: 0 }, "-=0.75")
            .to("#Neutral .pupils", { duration: 0.75, x: 0 }, "-=0.75")
            .to("#Neutral .eyelid-bot", {
              duration: 0.25,
              y: -14,
              x: -1.1,
              yoyo: true,
              repeat: 1,
            })
            .to(
              "#Neutral .eyelid-top",
              { duration: 0.25, y: 14, x: -1.1, yoyo: true, repeat: 1 },
              "-=0.5",
            )
            .to(
              "#Neutral .eyes",
              { duration: 0.75, y: "+=5", ease: "power1.in" },
              "+=1",
            )
            .to(
              "#Neutral .pupils",
              { duration: 0.75, y: 8, ease: "power1.in" },
              "-=0.75",
            )
            .to(
              "#Neutral .eyes",
              { duration: 0.75, y: "-=5", ease: "power1.out" },
              "+=2",
            )
            .to(
              "#Neutral .pupils",
              { duration: 0.75, y: 0, ease: "power1.out" },
              "-=0.75",
            );
        } else if (name === "pos") {
          gsap.set("#Positive #body", { svgOrigin: "210 300" });
          gsap.set("#Positive #left-leg", { svgOrigin: "165 340" });
          gsap.set("#Positive #right-leg", { svgOrigin: "245 340" });
          tl.repeat(1);
          tl.to("#Positive #body", {
            duration: 0.4,
            rotation: -10,
            ease: "sine.in",
          })
            .to(
              "#Positive .legs",
              { duration: 0.4, rotation: 4, ease: "sine.in" },
              0,
            )
            .to(
              "#Positive .shadow",
              { duration: 0.4, x: -10, ease: "sine.in" },
              0,
            )
            .to(
              "#Positive #body",
              {
                duration: 0.8,
                rotation: 10,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              },
              0.4,
            )
            .to(
              "#Positive .legs",
              {
                duration: 0.8,
                rotation: -4,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              },
              0.4,
            )
            .to(
              "#Positive .shadow",
              {
                duration: 0.8,
                x: 10,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              },
              0.4,
            )
            .to(
              "#Positive .eyebrows",
              {
                duration: 0.4,
                y: -5,
                yoyo: true,
                repeat: -1,
                ease: "Power3.inOut",
              },
              0,
            );
        }
        return tl;
      };

      animationsRef.current = [
        buildAnimation("neg"),
        buildAnimation("neu"),
        buildAnimation("pos"),
      ];

      const updateView = (n) => {
        gsap.to(runnerRef.current, { duration: 0.5, x: n * -100 + "vw" });
        setBgColor(BG_COLORS[n + 1]);
        if (prevRef.current !== false)
          animationsRef.current[prevRef.current + 1].pause(0);
        animationsRef.current[n + 1].play(0);
      };

      updateView(initialValue);

      const range = document.getElementById("ms-range");
      if (range) {
        range.addEventListener("input", (e) => {
          const n = +e.target.value;
          updateView(n);
          prevRef.current = n;
        });
      }
    });
  }, []);

  return (
    <>
      <style>{`
        .ms-root svg { overflow: visible; }

        .ms-root .shadow { fill: rgba(0,0,0,0.1); }

        .ms-root .leg,
        .ms-root .foot,
        .ms-root .mouth,
        .ms-root .body,
        .ms-root .eyebrows {
          fill: none;
          stroke: #000;
          stroke-linecap: round;
          stroke-width: 6px;
        }

        .ms-root .foot,
        .ms-root .mouth { stroke-width: 8px; }

        .ms-root .neutral        { fill: #99a1ff; }
        .ms-root .neutral.dark   { fill: #8089ff; }
        .ms-root .neutral.shadow { fill: #667aff; fill-opacity: 0.2; }

        .ms-root .negative        { fill: #ff4d6f; }
        .ms-root .negative.dark   { fill: #ff3361; }
        .ms-root .negative.shadow { fill: #ff1a4e; fill-opacity: 0.2; }

        .ms-root .positive        { fill: #2fda98; }
        .ms-root .positive.dark   { fill: #25c280; }
        .ms-root .positive.shadow { fill: #1caa6e; fill-opacity: 0.2; }

        /* Range track */
        #ms-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 200px; }
        #ms-range::-webkit-slider-runnable-track { background: #fcfcfc; height: 1rem; border-radius: 0.25rem; border: 3px solid black; }
        #ms-range::-moz-range-track              { background: #fcfcfc; height: 1rem; border-radius: 0.25rem; border: 3px solid black; }

        /* Range thumb */
        #ms-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          margin-top: -0.75rem;
          background-color: #ffd433;
          width: 2rem; height: 2rem;
          border-radius: 6px;
          border: 3px solid black;
          box-shadow: 2px 2px 0 0 black;
        }
        #ms-range::-moz-range-thumb {
          margin-top: -0.75rem;
          background-color: #ffd433;
          width: 2rem; height: 2rem;
          border-radius: 6px;
          border: 3px solid black;
          box-shadow: 2px 2px 0 0 black;
        }
      `}</style>

      {/* Root wrapper — takes the background color */}
      <div
        className="ms-root relative w-full h-screen overflow-hidden grid place-items-center"
        style={{ background: bgColor, transition: "background 0.5s" }}
      >
        {/* Runner: 300vw wide, positioned so neutral (middle) aligns with viewport at x=0 */}
        <div
          ref={runnerRef}
          className="absolute top-0 h-full grid grid-cols-3 bg-gradient-to-b from-white/20 to-transparent"
          style={{ width: "300vw", left: "-100vw" }}
        >
          {/* ── Negative ── */}
          <div className="relative inline-flex justify-center w-[100vw] h-screen">
            <svg
              id="Negative"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 400 400"
            >
              <defs>
                <clipPath id="neg-eye-clip">
                  <path
                    d="M216.15,172c0,8.28-5.6,15-12.5,15-6.9,0-12.5-6.72-12.5-15,0-8.28,5.6-15,12.5-15s12.5,6.72,12.5,15Z"
                    style={{ fill: "none" }}
                  />
                </clipPath>
                <g id="neg-eye" clipPath="url(#neg-eye-clip)">
                  <path
                    d="M216.5,172c0,8.28-5.6,15-12.5,15-6.9,0-12.5-6.72-12.5-15,0-8.28,5.6-15,12.5-15s12.5,6.72,12.5,15Z"
                    style={{ fill: "#fff" }}
                  />
                  <circle
                    cx="204"
                    cy="149"
                    r="15"
                    className="negative eyelids"
                  />
                  <ellipse
                    cx="204"
                    cy="174"
                    rx="6"
                    ry="6.5"
                    className="pupils"
                  />
                </g>
              </defs>
              <ellipse
                className="negative shadow"
                cx="198.18"
                cy="343.08"
                rx="83.88"
                ry="11.71"
              />
              <g id="left-leg">
                <path
                  className="leg"
                  d="M210.13,286.96c-7.94,13.61-6.8,30.45-5.43,46.14"
                />
                <path
                  className="foot"
                  d="M204.46,334.01c-5.37,.21-10.67,2.13-14.92,5.43"
                />
              </g>
              <g id="right-leg">
                <path
                  className="leg"
                  d="M230.03,286.96c7.94,13.61,6.8,30.45,5.43,46.14"
                />
                <path
                  className="foot"
                  d="M235.7,334.01c5.37,.21,10.67,2.13,14.92,5.43"
                />
              </g>
              <g id="minus">
                <path
                  className="body negative"
                  d="M96.61,194.7h56.32c4.75,0,8.61,3.86,8.61,8.61v7.18c0,3.44-2.79,6.23-6.23,6.23h-57.84c-4.75,0-8.61-3.86-8.61-8.61v-5.66c0-4.28,3.47-7.76,7.76-7.76Z"
                />
                <path
                  className="negative dark"
                  d="M153.76,209.77h-54.7c-4.5,0-8.15-3.34-8.15-7.47v5.01c0,4.58,2.36,7.47,8.15,7.47h55.71c3.17,0,4.89-1.84,4.89-4.4v-6.01c0,2.98-2.64,5.4-5.9,5.4Z"
                />
              </g>
              <g id="body">
                <path
                  className="body negative"
                  d="M151.94,81.15l41.88-11.27c3.48-.69,19.99-1.03,23.53-1.03h16.99c11.38,0,20.65,9.13,20.83,20.51l3.12,195.78c.19,11.74-9.28,21.36-21.02,21.36h-34.94c-11.78,0-21.26-9.68-21.02-21.46l3.18-153.2c.15-7.23-5.68-13.17-12.91-13.16l-16.42,3.03c-9.12,.02-16.52-7.37-16.52-16.49v-7.89c0-7.87,5.57-14.65,13.29-16.17Z"
                />
                <g className="negative dark">
                  <path d="M184.73,123.55c.15-7.23-5.68-13.17-12.91-13.16l-16.42,3.03c-9.06,.02-16.41-7.27-16.51-16.31,0,.07,0,.14,0,.21v7.89c0,9.12,7.4,16.51,16.52,16.49l16.42-3.03c6.55-.01,11.93,4.86,12.78,11.15l.13-6.26Z" />
                  <path d="M237.52,298.21h-34.94c-10.88,0-19.8-8.26-20.9-18.81l-.12,5.62c-.24,11.78,9.24,21.46,21.02,21.46h34.94c11.74,0,21.21-9.62,21.02-21.36l-.09-5.96c-.99,10.66-9.96,19.05-20.92,19.05Z" />
                </g>
                <path
                  className="mouth"
                  id="mouth"
                  d="M198.05,272.45c8.02-6.72,17.43-11.76,27.46-14.72,5.47-1.61,11.23-2.62,16.89-1.83"
                />
                <use xlinkHref="#neg-eye" />
                <use xlinkHref="#neg-eye" x="32" />
                <path
                  className="body"
                  d="M151.94,81.15l41.88-11.27c3.48-.69,19.99-1.03,23.53-1.03h16.99c11.38,0,20.65,9.13,20.83,20.51l3.12,195.78c.19,11.74-9.28,21.36-21.02,21.36h-34.94c-11.78,0-21.26-9.68-21.02-21.46l3.18-153.2c.15-7.23-5.68-13.17-12.91-13.16l-16.42,3.03c-9.12,.02-16.52-7.37-16.52-16.49v-7.89c0-7.87,5.57-14.65,13.29-16.17Z"
                />
              </g>
            </svg>
          </div>

          {/* ── Neutral ── */}
          <div className="relative inline-flex justify-center w-[100vw] h-screen">
            <svg
              id="Neutral"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 400"
            >
              <ellipse
                className="neutral shadow"
                cx="195.4"
                cy="346.87"
                rx="91.75"
                ry="7.86"
              />
              <path
                className="leg"
                d="M149.84,292.48c-7.94,13.61-6.8,30.45-5.43,46.14"
              />
              <path
                className="foot"
                d="M144.17,339.53c-5.37,.21-10.67,2.13-14.92,5.43"
              />
              <path
                className="leg"
                d="M246.84,292.48c7.94,13.61,6.8,30.45,5.43,46.14"
              />
              <path
                className="foot"
                d="M252.52,339.53c5.37,.21,10.67,2.13,14.92,5.43"
              />
              <path
                className="body neutral"
                d="M200.02,56.31c-152.13-5.18-136.36,258.61,.78,250,135.26,7.88,154.98-257.17-.78-250Zm2.68,171.82c-43.89,1.4-41.21-74.46-.23-73.74,41.75-.89,42.64,74.47,.23,73.74Z"
              />
              <path
                className="neutral dark"
                d="M200.54,293.07c-51.76,0-94.95-41.8-105-97.39,5.42,66.93,50.25,109.53,104.75,109.53s97.06-40.5,104.26-104.55c-11.67,53.09-53.8,92.41-104,92.41Z"
              />
              <g className="eyes">
                <ellipse
                  cx="170"
                  cy="120"
                  rx="16"
                  ry="16"
                  style={{ fill: "#fff" }}
                />
                <ellipse className="pupils" cx="170" cy="120" rx="5" ry="6" />
                <path
                  className="eyelid-bot"
                  d="M186.56,137.54c.01,8.83-6.89,16.01-15.41,16.02-8.53,.01-15.45-7.14-15.46-15.97l30.88-.05Z"
                  style={{ fill: "#99a1ff" }}
                />
                <path
                  className="eyelid-top"
                  d="M186.56,104.76c-.01-8.83-6.94-15.99-15.46-15.97s-15.43,7.18-15.41,16.02l30.88-.05Z"
                  style={{ fill: "#99a1ff" }}
                />
              </g>
              <g className="eyes" transform="translate(60, 0)">
                <ellipse
                  cx="170"
                  cy="120"
                  rx="16"
                  ry="16"
                  style={{ fill: "#fff" }}
                />
                <ellipse className="pupils" cx="170" cy="120" rx="5" ry="6" />
                <path
                  className="eyelid-bot"
                  d="M186.56,137.54c.01,8.83-6.89,16.01-15.41,16.02-8.53,.01-15.45-7.14-15.46-15.97l30.88-.05Z"
                  style={{ fill: "#99a1ff" }}
                />
                <path
                  className="eyelid-top"
                  d="M186.56,104.76c-.01-8.83-6.94-15.99-15.46-15.97s-15.43,7.18-15.41,16.02l30.88-.05Z"
                  style={{ fill: "#99a1ff" }}
                />
              </g>
              <path className="mouth" d="M170,260 h60" />
            </svg>
          </div>

          {/* ── Positive ── */}
          <div className="relative inline-flex justify-center w-[100vw] h-screen">
            <svg
              id="Positive"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 400"
            >
              <ellipse
                className="positive shadow"
                cx="203.85"
                cy="346.37"
                rx="91.75"
                ry="7.86"
              />
              <g className="legs" id="left-leg">
                <path
                  className="leg"
                  d="M177.95,292.24c-7.94,13.61-6.8,30.45-5.43,46.14"
                />
                <path
                  className="foot"
                  d="M172.28,339.29c-5.37,.21-10.67,2.13-14.92,5.43"
                />
              </g>
              <g className="legs" id="right-leg">
                <path
                  className="leg"
                  d="M235.88,290.36c7.94,13.61,6.8,30.45,5.43,46.14"
                />
                <path
                  className="foot"
                  d="M241.56,337.41c5.37,.21,10.67,2.13,14.92,5.43"
                />
              </g>
              <g id="body">
                <path
                  className="positive"
                  d="M134.6,73.67l44.91-11.27c3.73-.69,21.43-1.03,25.23-1.03h18.22c12.2,0,22.15,9.13,22.34,20.51l3.35,195.78c.2,11.74-9.95,21.36-22.54,21.36h-37.47c-12.63,0-22.8-9.68-22.54-21.46l3.41-153.2c.16-7.23-6.09-13.17-13.85-13.16l-17.61,3.03c-9.78,.02-17.72-7.37-17.72-16.49v-7.89c0-7.87,5.97-14.65,14.25-16.17Z"
                />
                <g className="positive dark">
                  <path d="M169.76,116.07c.16-7.23-6.09-13.17-13.85-13.16l-17.61,3.03c-9.71,.02-17.6-7.27-17.71-16.31,0,.07,0,.14,0,.21v7.89c0,9.12,7.94,16.51,17.72,16.49l17.61-3.03c7.02-.01,12.8,4.86,13.71,11.15l.14-6.26Z" />
                  <path d="M226.36,290.73h-37.47c-11.67,0-21.23-8.26-22.41-18.81l-.13,5.62c-.26,11.78,9.9,21.46,22.54,21.46h37.47c12.59,0,22.74-9.62,22.54-21.36l-.1-5.96c-1.07,10.66-10.68,19.05-22.44,19.05Z" />
                </g>
                <path
                  className="body"
                  d="M134.6,73.67l44.91-11.27c3.73-.69,21.43-1.03,25.23-1.03h18.22c12.2,0,22.15,9.13,22.34,20.51l3.35,195.78c.2,11.74-9.95,21.36-22.54,21.36h-37.47c-12.63,0-22.8-9.68-22.54-21.46l3.41-153.2c.16-7.23-6.09-13.17-13.85-13.16l-17.61,3.03c-9.78,.02-17.72-7.37-17.72-16.49v-7.89c0-7.87,5.97-14.65,14.25-16.17Z"
                />
                <path
                  className="mouth"
                  d="M184.05,234.7c2.32,3.32,7.71,17.14,21.93,17.69,18.54,.71,23.57-13.97,25.73-17.11"
                />
                <path
                  className="eyebrows"
                  d="M213.46,103.97c5.98-3.6,13.8-3.94,20.07-.87"
                />
                <path
                  className="eyebrows"
                  d="M198.12,104.53c-5.89-3.75-13.69-4.3-20.04-1.39"
                />
                <g>
                  <circle cx="190" cy="125" r="13.5" style={{ fill: "#fff" }} />
                  <circle cx="190" cy="125.29" r="8.5" />
                  <circle cx="185" cy="120" r="5" style={{ fill: "#fff" }} />
                </g>
                <g>
                  <circle
                    cx="222.74"
                    cy="125"
                    r="13.5"
                    style={{ fill: "#fff" }}
                  />
                  <circle cx="222.74" cy="125.29" r="8.5" />
                  <circle cx="217.74" cy="120" r="5" style={{ fill: "#fff" }} />
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Range slider */}
        <label className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <input
            id="ms-range"
            type="range"
            min="-1"
            max="1"
            step="1"
            defaultValue={initialValue}
          />
        </label>
      </div>
    </>
  );
}
