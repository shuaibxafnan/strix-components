"use client";

import { useEffect, useRef } from "react";

// ─── LiquidThermometer ────────────────────────────────────────────────────────
//
// A draggable SVG thermometer whose liquid level is controlled by dragging
// the black knob up/down.  Built on GSAP v2 (TweenMax + Draggable + ThrowProps)
// loaded at runtime via CDN so Turbopack never touches them.
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// bgColor          string   "#FCEFD6"   Page / wrapper background colour
// minTemp          number   0           Temperature shown when knob is at bottom
// maxTemp          number   100         Temperature shown when knob is at top
// unit             string   "°"         Unit suffix appended to the label  (e.g. "°C", "°F", "%")
// tubeFill         string   "#C8D9D3"   Colour of the un-filled tube background
// tubeOpacity      number   0.61        Opacity of the tube background rect
// gradTop          string   "#FF0909"   Gradient top stop (hot end)
// gradMid1         string   "#F3481A"   Gradient second stop
// gradMid2         string   "#FABA2C"   Gradient middle stop
// gradBot          string   "#00BCF2"   Gradient bottom stop (cool end)
// knobFill         string   "#3A3335"   Fill of the draggable knob circle + tip
// labelColor       string   "#FFFCF9"   Text colour of the temperature label
// followerColor    string   "#62B6CB"   Fill of the small follower bubble (hidden by default r=0)
// shineOpacity     number   0.21        Opacity of the vertical shine line on the tube
// tickColor        string   "#FCEFD6"   Stroke colour of the measurement tick marks
// initialValue     number   50          Starting temperature (0–maxTemp range)
// swingDuration    number   1.4         Duration (s) of the intro animation to initialValue
// waveSpeed        number   0.7         Duration (s) of each liquid-wave cycle
// waveStagger      number   0.9         Stagger offset (s) between the two wave layers
// throwResistance  number   2300        Draggable throw-props resistance (higher = stops sooner)
// ─────────────────────────────────────────────────────────────────────────────

export default function Thermometer({
  bgColor = "#FCEFD6",
  minTemp = 0,
  maxTemp = 100,
  unit = "°",
  tubeFill = "#C8D9D3",
  tubeOpacity = 0.61,
  gradTop = "#FF0909",
  gradMid1 = "#F3481A",
  gradMid2 = "#FABA2C",
  gradBot = "#00BCF2",
  knobFill = "#3A3335",
  labelColor = "#FFFCF9",
  followerColor = "#62B6CB",
  shineOpacity = 0.21,
  tickColor = "#FCEFD6",
  initialValue = 50,
  swingDuration = 1.4,
  waveSpeed = 0.7,
  waveStagger = 0.9,
  throwResistance = 2300,
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    // ── CDN loader (Turbopack-safe, idempotent) ──────────────────────────────
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    // GSAP v2 bundle: TweenMax includes TimelineMax; Draggable needs ThrowPropsPlugin
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js",
    )
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/utils/Draggable.min.js",
        ),
      )
      .then(() => {
        const { TweenMax, TimelineMax, Draggable, Linear, Elastic, Expo } =
          window;

        if (!TweenMax || !Draggable || !svgRef.current) return;

        const svg = svgRef.current;

        // ── DOM refs inside SVG ──────────────────────────────────────────────
        const liquid = svg.querySelectorAll(".liquid");
        const tubeShine = svg.querySelector(".tubeShine"); // kept for completeness
        const label = svg.querySelector(".label");
        const follower = svg.querySelector(".follower");
        const dragger = svg.querySelector(".dragger");
        const dragTip = svg.querySelector(".dragTip");

        // ── Constants ───────────────────────────────────────────────────────
        const minDragY = -380;
        const tempRange = maxTemp - minTemp;
        const step = Math.abs(minDragY / tempRange); // SVG units per degree

        let followerVY = 0;

        TweenMax.set(svg, { visibility: "visible" });

        TweenMax.set(dragTip, { transformOrigin: "20% 50%" });

        // ── Continuous wave animation on the two liquid <use> nodes ─────────
        const tl = new TimelineMax();
        tl.staggerTo(
          liquid,
          waveSpeed,
          { x: "-=200", ease: Linear.easeNone, repeat: -1 },
          waveStagger,
        );
        // Fast-forward so waves are already moving when visible
        tl.time(100);

        // ── Prevent iOS scroll hijack while dragging ─────────────────────────
        document.addEventListener("touchmove", (e) => e.preventDefault(), {
          passive: false,
        });

        // ── Core update: runs on every drag frame ────────────────────────────
        function onUpdate() {
          const yVal = dragger._gsTransform.y;
          // Map drag y (0 → minDragY) to temperature (minTemp → maxTemp)
          const rawDeg = Math.abs(Math.round(yVal / step));
          const temp = Math.min(maxTemp, minTemp + rawDeg);

          label.textContent = temp + unit;

          TweenMax.to(liquid, 1.3, {
            y: yVal * 1.12,
            ease: Elastic.easeOut.config(1, 0.4),
          });
        }

        // ── Draggable ────────────────────────────────────────────────────────
        Draggable.create(dragger, {
          type: "y",
          bounds: { minY: minDragY, maxY: 0 },
          onDrag: onUpdate,
          throwProps: true,
          throwResistance: throwResistance,
          onThrowUpdate: onUpdate,
          overshootTolerance: 0,
        });

        // ── Follower bubble: spring physics loop ─────────────────────────────
        TweenMax.to(follower, 1, {
          y: "+=0",
          repeat: -1,
          modifiers: {
            y: function () {
              followerVY +=
                (dragger._gsTransform.y - follower._gsTransform.y) * 0.23;
              followerVY *= 0.69;
              return follower._gsTransform.y + followerVY;
            },
          },
        });

        // ── DragTip rotation mirrors follower velocity ───────────────────────
        TweenMax.to(dragTip, 1, {
          rotation: "+=0",
          repeat: -1,
          modifiers: {
            rotation: function (rotation) {
              return rotation - followerVY;
            },
          },
        });

        // ── Label bobs slightly with follower ────────────────────────────────
        TweenMax.to(label, 1, {
          y: "+=0",
          repeat: -1,
          modifiers: {
            y: function (y) {
              return y - followerVY * 0.5;
            },
          },
        });

        // ── Intro animation: slide knob to initialValue ──────────────────────
        const clampedInit = Math.max(minTemp, Math.min(maxTemp, initialValue));
        const targetY = -((clampedInit - minTemp) * step);

        TweenMax.to(dragger, swingDuration, {
          y: targetY,
          onUpdate: onUpdate,
          ease: Expo.easeInOut,
        });
      })
      .catch((e) =>
        console.error("[LiquidThermometer] GSAP load failed:", e.message),
      );
  }, []);

  return (
    // Outer wrapper fills its container and centres the SVG
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 800 600"
        className="w-full h-full invisible"
      >
        <defs>
          {/* ── Liquid gradient: top (hot) → bottom (cool) ───────────────── */}
          <linearGradient
            id="liquidGrad"
            x1="557"
            y1="150"
            x2="557"
            y2="546"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor={gradTop} />
            <stop offset="0.2" stopColor={gradMid1} />
            <stop offset="0.5" stopColor={gradMid2} />
            <stop offset="1" stopColor={gradBot} />
          </linearGradient>

          <rect
            id="tube"
            x="357"
            y="150"
            width="86"
            height="400"
            rx="43"
            ry="43"
          />

          <clipPath id="liquidMask">
            <use xlinkHref="#tube" className="liquidMask" />
          </clipPath>
          <clipPath id="tubeMask">
            <use xlinkHref="#tube" className="liquidMask" />
          </clipPath>

          <path
            id="liquid"
            d="M757,552v490H357V552c50,0,50,20,100,20s50-20,100-20,50,20,100,20S707,552,757,552Z"
          />

          <mask id="gradMask">
            <use xlinkHref="#liquid" className="liquid" x="0" fill="#FCEFD6" />
            <use
              xlinkHref="#liquid"
              className="liquid"
              x="0"
              fill="#EEE"
              opacity="0.7"
            />
          </mask>
        </defs>

        <g className="whole" transform="translate(0, -40)">
          {/* Tube background pill */}
          <use
            xlinkHref="#tube"
            className="tubeBg"
            fill={tubeFill}
            opacity={tubeOpacity}
          />

          <g className="dragger" transform="translate(-6, 0)">
            {/* Knob body */}
            <circle cx="294" cy="540" r="36" fill={knobFill} />
            <path
              className="dragTip"
              d="M315.5,556.76,299.24,540.5l16.26-16.26,36.26,16.26Z"
              fill={knobFill}
            />
            {/* Temperature readout inside the knob */}
            <text className="label" x="294" y="551" fill={labelColor}>
              {initialValue + unit}
            </text>
          </g>

          {/* ── Liquid fill composited through gradMask ───────────────────── */}
          <g mask="url(#gradMask)">
            <use xlinkHref="#tube" fill="url(#liquidGrad)" />
          </g>

          <line
            className="tubeShine"
            x1="371"
            y1="200"
            x2="371"
            y2="443"
            fill="none"
            stroke="#FFF"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="8"
            opacity={shineOpacity}
            strokeDasharray="153 30"
            strokeDashoffset="-20"
          />

          {/* ── Tick marks along the left edge of the tube ───────────────── */}
          <g
            className="measurements"
            fill="none"
            stroke={tickColor}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="1"
          >
            <line x1="358" y1="196" x2="370" y2="196" />
            <line x1="358" y1="234" x2="370" y2="234" />
            <line x1="358" y1="273" x2="370" y2="273" />
            <line x1="358" y1="311" x2="370" y2="311" />
            <line x1="358" y1="350" x2="370" y2="350" />
            <line x1="358" y1="388" x2="370" y2="388" />
            <line x1="358" y1="426" x2="370" y2="426" />
            <line x1="358" y1="465" x2="370" y2="465" />
            <line x1="358" y1="503" x2="370" y2="503" />
          </g>

          {/*
            Follower bubble — r="0" means invisible in the original demo.
            The spring physics loop still runs; increase r via prop to reveal it.
          */}
          <circle
            className="follower"
            cx="400"
            cy="540"
            r="0"
            fill={followerColor}
            fillOpacity="1"
            stroke="#FCEFD6"
            strokeWidth="0"
          />
        </g>
      </svg>

      <style>
        {".label {" +
          "  fill: " +
          labelColor +
          ";" +
          "  font-size: 1.8em;" +
          "  font-family: 'din-condensed-web', sans-serif;" +
          "  text-anchor: middle;" +
          "  letter-spacing: 1.2px;" +
          "}" +
          ".dragger { -webkit-tap-highlight-color: transparent; }"}
      </style>
    </div>
  );
}
