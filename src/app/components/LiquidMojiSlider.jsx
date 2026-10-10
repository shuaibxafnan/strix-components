"use client";

import { useEffect, useRef, useState } from "react";

// ─── LiquidMojiSlider ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// uiColor          string   "#FF5EAE"   Accent color for lines, speech outline, and nodes
// textColor        string   "#FF5EAE"   Text label color inside the speech bubble
// iconColor        string   "#FFFFFF"   Fill color for the embedded face paths
// bubbleBgColor    string   "#FFFFFF"   Background fill color of the reaction card
// initialIconIndex  number   5           Default active face on mount (0 to 13)
// spacing          number   60          Distance (px) between horizontal dot nodes
// scaleMultiplier  number   4.8         Expansion scaling ceiling of active goo bubble
// ──────────────────────────────────────────────────────────────────────────

const ICONS = [
  {
    id: "cool",
    label: "COOL",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M16,26c-1.5,0-2.9-0.3-4.2-0.9l1-1.7c1,0.4,2.1,0.7,3.2,0.7c2.9,0,5.5-1.6,6.9-3.9l1.7,1C22.8,24.1,19.6,26,16,26L16,26z M26,12c0,1.1-0.9,2-2,2h-4c-1.1,0-2-0.9-2-2h-4c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2V9c0-0.6,0.4-1,1-1h6c0.6,0,1,0.4,1,1v1h4V9c0-0.6,0.5-1,1-1h6c0.5,0,1,0.4,1,1V12z",
  },
  {
    id: "evil",
    label: "EVIL",
    d: "M32,2c0-1.4-0.3-2.8-0.8-4c-1,2.4-3,4.3-5.5,5.3C23,1.2,19.7,0,16,0S9,1.2,6.3,3.3C3.8,2.3,1.9,0.4,0.8-2C0.3-0.8,0,0.6,0,2c0,2.3,0.8,4.4,2.1,6.1C0.8,10.4,0,13.1,0,16c0,8.8,7.2,16,16,16s16-7.2,16-16c0-2.9-0.8-5.6-2.1-7.9C31.2,6.4,32,4.3,32,2z M18,11.9c0.1-1.5,1.4-2.5,2.5-3C21.6,8.3,22.7,8,22.8,8c0.5-0.1,1.1,0.2,1.2,0.7s-0.2,1.1-0.7,1.2c-0.6,0.1-1.2,0.4-1.8,0.7C21.8,11,22,11.5,22,12c0,1.1-0.9,2-2,2s-2-0.9-2-2C18,12,18,11.9,18,11.9L18,11.9z M8,8.8C8.2,8.2,8.7,7.9,9.2,8c0,0,1.1,0.3,2.2,0.8c1.1,0.6,2.5,1.6,2.6,3c0,0,0,0.1,0,0.1c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-0.5,0.2-1,0.5-1.4C10,10.4,9.3,10.1,8.8,10C8.2,9.8,7.9,9.3,8,8.8L8,8.8z M16,26c-3.6,0-6.8-1.9-8.6-4.9l2.6-1.5c1.2,2,3.5,3.4,6,3.4s4.8-1.4,6-3.4l2.6,1.5C22.8,24.1,19.6,26,16,26z",
  },
  {
    id: "confused",
    label: "CONFUSED",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M22,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S20.9,8,22,8z M10,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S8.9,8,10,8z M21.5,25.3c-2.6,0.9-5.5-0.4-6.4-3c-0.6-1.6-2.3-2.4-3.8-1.8c-1.4,0.5-2.2,2-1.9,3.5h-2c-0.3-2.3,1-4.5,3.2-5.3c2.6-0.9,5.5,0.4,6.4,3c0.6,1.6,2.3,2.4,3.8,1.8c1.4-0.5,2.2-2,1.9-3.5h2C25,22.3,23.7,24.5,21.5,25.3z",
  },
  {
    id: "sad",
    label: "SAD",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M22,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S20.9,8,22,8z M10,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S8.9,8,10,8z M22,24.4c-1.2-2-3.5-3.4-6-3.4s-4.8,1.4-6,3.4l-2.6-1.5C9.2,19.9,12.4,18,16,18s6.8,1.9,8.6,4.9L22,24.4z",
  },
  {
    id: "shocked",
    label: "SHOCKED",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M10,14c-1.1,0-2-1.3-2-3s0.9-3,2-3s2,1.3,2,3S11.1,14,10,14z M16,26c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S18.2,26,16,26z M22,14c-1.1,0-2-1.3-2-3s0.9-3,2-3s2,1.3,2,3S23.1,14,22,14z",
  },
  {
    id: "smile",
    label: "SMILE",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M22,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S20.9,8,22,8z M10,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S8.9,8,10,8z M16,26c-3.6,0-6.8-1.9-8.6-4.9l2.6-1.5c1.2,2,3.5,3.4,6,3.4s4.8-1.4,6-3.4l2.6,1.5C22.8,24.1,19.6,26,16,26z",
  },
  {
    id: "wondering",
    label: "WONDERING",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M22,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S20.9,8,22,8z M8,10c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S8,11.1,8,10z M10.4,25.2l-0.7-2.4l13.7-4l0.7,2.4L10.4,25.2z",
  },
  {
    id: "happy",
    label: "HAPPY",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M22,8c1.1,0,2,1.3,2,3s-0.9,3-2,3s-2-1.3-2-3S20.9,8,22,8z M10,8c1.1,0,2,1.3,2,3s-0.9,3-2,3s-2-1.3-2-3S8.9,8,10,8z M16,28c-5.2,0-9.5-4.4-10-9.9c2.9,1.7,6.4,2.7,10,2.7s7.1-1,10-2.7C25.5,23.6,21.2,28,16,28L16,28z",
  },
  {
    id: "angry",
    label: "ANGRY",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M18,11.9c0.1-1.5,1.4-2.5,2.5-3C21.6,8.3,22.7,8,22.8,8c0.5-0.1,1.1,0.2,1.2,0.7s-0.2,1.1-0.7,1.2c-0.6,0.1-1.2,0.4-1.8,0.7C21.8,11,22,11.5,22,12c0,1.1-0.9,2-2,2s-2-0.9-2-2C18,12,18,11.9,18,11.9L18,11.9z M8,8.8C8.2,8.2,8.7,7.9,9.2,8c0,0,1.1,0.3,2.2,0.8c1.1,0.6,2.5,1.6,2.6,3c0,0,0,0.1,0,0.1c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-0.5,0.2-1,0.5-1.4C10,10.4,9.3,10.1,8.8,10C8.2,9.8,7.9,9.3,8,8.8L8,8.8z M22,24.4c-1.2-2-3.5-3.4-6-3.4s-4.8,1.4-6,3.4l-2.6-1.5C9.2,19.9,12.4,18,16,18s6.8,1.9,8.6,4.9L22,24.4z",
  },
  {
    id: "baffled",
    label: "BAFFLED",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M8,13c0-1.7,1.3-3,3-3s3,1.3,3,3s-1.3,3-3,3S8,14.7,8,13z M20,24h-8v-2h8V24z M21,16c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S22.7,16,21,16z M12,13c0,0.6-0.4,1-1,1s-1-0.4-1-1s0.4-1,1-1S12,12.4,12,13z M22,13c0,0.6-0.4,1-1,1s-1-0.4-1-1s0.4-1,1-1S22,12.4,22,13z",
  },
  {
    id: "sleepy",
    label: "SLEEPY",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M9.7,10.3c-0.4,0.4-1,0.4-1.4,0s-0.4-1,0-1.4c1.4-1.4,4-1.4,5.4,0c0.4,0.4,0.4,1,0,1.4c-0.2,0.2-0.5,0.3-0.7,0.3s-0.5-0.1-0.7-0.3C11.7,9.7,10.3,9.7,9.7,10.3z M16,26c-2.2,0-4-2.2-4-5s1.8-5,4-5s4,2.2,4,5S18.2,26,16,26z M23.7,10.3c-0.2,0.2-0.5,0.3-0.7,0.3s-0.5-0.1-0.7-0.3c-0.6-0.6-2-0.6-2.6,0c-0.4,0.4-1,0.4-1.4,0s-0.4-1,0-1.4c1.4-1.4,4-1.4,5.4,0C24.1,9.3,24.1,9.9,23.7,10.3z",
  },
  {
    id: "tongue",
    label: "TONGUE",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M10,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S8.9,8,10,8z M24,20h-2v3c0,1.7-1.3,3-3,3s-3-1.3-3-3v-3H8v-2h16V20z M22,12c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S23.1,12,22,12z",
  },
  {
    id: "grin",
    label: "GRIN",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M22,7.4c2,0,3.6,1.6,3.6,3.6c0,0.2,0,0.4-0.1,0.6c-0.1,0.3-0.3,0.5-0.6,0.5s-0.6-0.2-0.6-0.5c-0.2-1.1-1.2-1.7-2.3-1.7s-2.1,0.5-2.3,1.7c0,0.3-0.3,0.5-0.6,0.5l0,0c-0.3,0-0.6-0.2-0.6-0.5c0-0.2-0.1-0.4-0.1-0.6C18.4,9,20,7.4,22,7.4L22,7.4z M10,7.4c2,0,3.6,1.6,3.6,3.6c0,0.2,0,0.4-0.1,0.6c-0.1,0.3-0.3,0.5-0.6,0.5s-0.6-0.2-0.6-0.5c-0.2-1.1-1.2-1.7-2.3-1.7s-2.1,0.5-2.3,1.7c-0.1,0.3-0.3,0.5-0.6,0.5l0,0c-0.3,0-0.6-0.2-0.6-0.5c0-0.2-0.1-0.4-0.1-0.6C6.4,9,8,7.4,10,7.4L10,7.4z M6,18h6v7.7C8.6,24.9,6,21.7,6,18z M14,26v-8h4v8H14z M20,25.7V18h6C26,21.7,23.4,24.9,20,25.7z",
  },
  {
    id: "neutral",
    label: "NEUTRAL",
    d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M20,24h-8v-2h8V24z M22,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S20.9,8,22,8z M10,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S8.9,8,10,8z",
  },
];

const DOT_SIZE = 10;

export default function LiquidMojiSlider({
  uiColor = "#FF5EAE",
  textColor = "#FF5EAE",
  iconColor = "#FFFFFF",
  bubbleBgColor = "#FFFFFF",
  initialIconIndex = 5,
  spacing = 60,
  scaleMultiplier = 4.8,
}) {
  const svgRef = useRef(null);
  const dotContainerRef = useRef(null);
  const iconContainerRef = useRef(null);
  const bubbleContainerRef = useRef(null);
  const bubbleGroupRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const stateRef = useRef({
    currentId: initialIconIndex,
    oldId: -1,
    snapArray: ICONS.map((_, i) => -i * spacing),
    minDragX: -(ICONS.length - 1) * spacing,
    mainTl: null,
    dragger: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js",
      ),
    ])
      .then(() => {
        const { gsap, Draggable } = window;
        if (!gsap || !Draggable || !svgRef.current) return;

        gsap.registerPlugin(Draggable);
        gsap.set(svgRef.current, { visibility: "visible" });

        const state = stateRef.current;
        const mainTl = gsap.timeline({ paused: true });
        state.mainTl = mainTl;

        ICONS.forEach((_, i) => {
          const dot = dotContainerRef.current.querySelector(
            `[data-btn-id="${i}"]`,
          );
          const icon = iconContainerRef.current.querySelector(
            `[data-icon-id="${i}"]`,
          );
          if (!dot || !icon) return;

          gsap.set(dot, { attr: { cx: i * spacing, r: DOT_SIZE } });
          gsap.set(icon, {
            x: i * spacing - 16,
            y: 300 - 16,
            transformOrigin: "50% 50%",
            scale: 0,
            opacity: 0,
          });

          const itemTl = gsap.timeline();
          itemTl
            .to(dot, {
              attr: { r: DOT_SIZE * scaleMultiplier },
              duration: 1,
              ease: "none",
            })
            .to(
              icon,
              { opacity: 1, scale: 2, duration: 1, ease: "none" },
              "-=1",
            )
            .to(dot, { attr: { r: DOT_SIZE }, duration: 1, ease: "none" })
            .to(
              icon,
              { opacity: 0, scale: 0, duration: 1, ease: "none" },
              "-=1",
            );

          mainTl.add(itemTl, i / 2);
        });

        function dragSlider() {
          const posX = gsap.getProperty(dotContainerRef.current, "x");
          gsap.to(mainTl, {
            time: (posX / state.minDragX) * (mainTl.duration() - 2) + 1,
            duration: 0.5,
            ease: "elastic.out(2, 0.75)",
          });
          gsap.set(iconContainerRef.current, { x: posX });
          gsap.to(bubbleContainerRef.current, {
            x: posX,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
          });
        }

        function showSpeechBubble() {
          const textEl = bubbleGroupRef.current.querySelector(".iconLabel");
          if (textEl) textEl.textContent = ICONS[state.currentId].label;

          gsap.set(bubbleGroupRef.current, {
            x: state.currentId * spacing - 85,
            rotation: state.oldId < state.currentId ? 45 : -45,
          });

          gsap
            .timeline()
            .to(bubbleGroupRef.current, {
              rotation: 0,
              scaleX: 1,
              duration: 1,
              ease: "elastic.out(1, 0.6)",
            })
            .to(
              bubbleGroupRef.current,
              { scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.6)" },
              "-=1",
            );
        }

        function clearSpeechBubble() {
          const currentLines =
            bubbleContainerRef.current.querySelector(".popLinesInstance");
          if (currentLines)
            bubbleContainerRef.current.removeChild(currentLines);

          const templateLines =
            svgRef.current.querySelector(".popLinesTemplate");
          const pl = templateLines.cloneNode(true);
          pl.setAttribute("class", "popLinesInstance");
          bubbleContainerRef.current.appendChild(pl);

          const bubbleX = gsap.getProperty(bubbleGroupRef.current, "x");
          const bubbleY = gsap.getProperty(bubbleGroupRef.current, "y");

          gsap
            .timeline({
              onComplete: () => {
                if (pl.parentNode) bubbleContainerRef.current.removeChild(pl);
              },
            })
            .set(pl, {
              x: bubbleX + 85,
              y: bubbleY + 55,
              transformOrigin: "50% 50%",
              scale: 0.8,
            })
            .to(pl.querySelectorAll("line"), {
              attr: { "stroke-dashoffset": 20 },
              duration: 0.3,
              ease: "none",
            })
            .to(
              pl,
              { scale: 1.4, opacity: 0, duration: 0.3, ease: "expo.out" },
              "-=0.3",
            );

          gsap.set(bubbleGroupRef.current, { scale: 0 });
        }

        function throwComplete() {
          const landed = Math.round(
            gsap.getProperty(dotContainerRef.current, "x") / spacing,
          );
          state.currentId = Math.abs(landed);
          showSpeechBubble();
        }

        // Fixed snapping logic inside the Draggable creation options matrix
        state.dragger = Draggable.create(dotContainerRef.current, {
          type: "x",
          bounds: { minX: state.minDragX, maxX: 0 },
          onDrag: dragSlider,
          onDragStart: clearSpeechBubble,
          onThrowUpdate: dragSlider,
          inertia: true,
          onThrowComplete: throwComplete,
          onDragEnd: function () {
            // Evaluates and forces track snapping immediately if interaction velocity is minimal
            const landed = Math.round(this.x / spacing) * spacing;
            gsap.to(this.target, {
              x: landed,
              duration: 0.4,
              onUpdate: dragSlider,
              onComplete: throwComplete,
              ease: "power2.out",
            });
          },
          snap: {
            x: function (endValue) {
              // Direct tracker function calculating closest alignment target index
              return Math.round(endValue / spacing) * spacing;
            },
          },
          dragClickables: true,
        });

        gsap.set(".dotGroup", { x: 400 });
        gsap.set(bubbleGroupRef.current, {
          y: 80,
          scale: 0,
          transformOrigin: "50% 100%",
        });

        gsap.to([dotContainerRef.current, iconContainerRef.current], {
          x: state.snapArray[state.currentId],
          duration: 2,
          onUpdate: dragSlider,
          onComplete: () => {
            throwComplete();
            if (state.dragger[0]) state.dragger[0].enable();
          },
          ease: "elastic.out(1, 0.85)",
        });

        state.handleNodeClick = (e) => {
          const target = e.target.closest("[data-btn-id]");
          if (!target) return;

          const clickedId = parseInt(target.getAttribute("data-btn-id"), 10);
          state.oldId = state.currentId;
          state.currentId = clickedId;

          if (state.oldId === state.currentId) return;

          clearSpeechBubble();
          gsap.to([dotContainerRef.current, iconContainerRef.current], {
            x: state.snapArray[state.currentId],
            duration: 0.8,
            onUpdate: dragSlider,
            onComplete: throwComplete,
            ease: "power1.out",
          });
        };
      })
      .catch((err) =>
        console.error("[LiquidMoodSlider] Loading dependencies failed:", err),
      );
  }, [mounted, spacing, scaleMultiplier]);

  if (!mounted) {
    return <div className="w-full h-screen bg-[#1d1d1d]" />;
  }

  return (
    <div className="w-full h-screen bg-[#1d1d1d] overflow-hidden flex items-center justify-center select-none font-['Passion_One',_sans-serif]">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        className="w-4/5 h-4/5 invisible"
        onClick={(e) => {
          if (stateRef.current.handleNodeClick) {
            stateRef.current.handleNodeClick(e);
          }
        }}
      >
        <defs>
          <circle className="cursor-pointer" fill={uiColor} cx="0" cy="300" />

          <filter id="goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 31 -12"
              result="cm"
            />
          </filter>

          <g
            className="popLinesTemplate"
            fill="none"
            stroke={uiColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22.9" y1="-33.6" x2="31.9" y2="-51" />
            <line x1="-25.7" y1="-30.1" x2="-34.5" y2="-47" />
            <line x1="-63.2" y1="1.1" x2="-81" y2="-1.3" />
            <line x1="-58.2" y1="43.9" x2="-77" y2="53.3" />
            <line x1="-19.1" y1="70.9" x2="-28.6" y2="90.4" />
            <line x1="27.4" y1="66.3" x2="36" y2="87.6" />
            <line x1="62.5" y1="38.8" x2="83.2" y2="46.5" />
            <line x1="64.7" y1="-6" x2="83.2" y2="-12.4" />
          </g>
        </defs>

        <g className="dotGroup">
          <g ref={dotContainerRef} filter="url(#goo)">
            {ICONS.map((_, i) => (
              <circle
                key={`dot-${i}`}
                data-btn-id={i}
                className="cursor-pointer"
                fill={uiColor}
                cx={i * spacing}
                cy="300"
                r={DOT_SIZE}
              />
            ))}
          </g>

          <g ref={iconContainerRef} className="pointer-events-none">
            {ICONS.map((icon, i) => (
              <g key={`icon-${i}`} data-icon-id={i} fill={iconColor}>
                <path d={icon.d} transform="scale(1)" />
              </g>
            ))}
          </g>

          <g ref={bubbleContainerRef}>
            <g ref={bubbleGroupRef} className="origin-[50%_100%]">
              <path
                fill="none"
                stroke={uiColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M69.361,112.063l16.377,28.99l16.562-28.94c37.277-5.125,65.195-27.13,65.195-53.494C167.496,28.456,130.766,4,85.515,4 C40.275,4,4,28.456,4,58.619c0,26.291,27.361,48.249,65.361,53.448V112.063z"
              />
              <path
                fill={bubbleBgColor}
                d="M69.361,109.063l16.377,28.99l16.562-28.94 c37.277-5.125,65.195-27.13,65.195-53.494C167.496,25.456,130.766,1,85.515,1C40.275,1,4,25.456,4,55.619 c0,26.291,27.361,48.249,65.361,53.448V109.063z"
              />
              <text
                className="iconLabel text-center font-bold"
                fill={textColor}
                x="85"
                y="67"
                textAnchor="middle"
                fontSize="22"
              >
                SMILE
              </text>
            </g>
          </g>
        </g>

        <g className="pointer-events-none opacity-10">
          <ellipse fill="#FFFFFF" cx="399" cy="277" rx="20" ry="12" />
          <ellipse fill="#FFFFFF" cx="420" cy="277" rx="10" ry="5" />
          <ellipse fill="#FFFFFF" cx="420" cy="277" rx="10" ry="5" />
        </g>
      </svg>
    </div>
  );
}
