"use client";

import { useEffect, useRef, useState } from "react";

// ─── BalloonHillsPill Loop ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// containerBg      string   '#ffe8ea'          Whole screen wrapper color
// pillWidth        string   'w-[160px]'        Width of the capsule container
// pillHeight       string   'h-[335px]'        Height of the capsule container
// gradientTop      string   '#ffa8c8'          Capsule sky top color
// gradientBottom   string   '#ffddcc'          Capsule sky bottom color
// sunColor         string   '#ffffe7'          Glowing multi-layered sun fill
// moonColor        string   '#ffdee7'          Crescent moon box-shadow color
// baseDuration     number   7                  Hot air balloon traversal rate
// baseEase         string   'linear'           GSAP timeline easing curve
// scaleFactor      number   1                  Global component transformation scale
// ──────────────────────────────────────────────────────────────────────────

export default function BalloonHillsPill({
  containerBg = "#ffe8ea",
  pillWidth = "w-[335px]",
  pillHeight = "h-[335px]",
  gradientTop = "#ffa8c8",
  gradientBottom = "#ffddcc",
  sunColor = "#ffffe7",
  moonColor = "#ffdee7",
  baseDuration = 7,
  baseEase = "linear",
  scaleFactor = 1,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const scopeRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);

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
        el.onerror = () =>
          reject(new Error(`Failed to load dependency: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !scopeRef.current) return;

        gsap.config({ trialWarn: false });
        const context = gsap.context(() => {
          // Floating wind physics generator function
          const applyWindOscillation = (target) => {
            gsap.fromTo(
              target,
              { y: -20, rotation: -5 },
              {
                y: 20,
                rotation: 5,
                duration: Math.floor(Math.random() * 3 + 2),
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
              },
            );
          };

          // Horizontal tracking automation function
          const initBalloonMovement = (target, delay) => {
            gsap.to(target, {
              x: 160,
              duration: baseDuration,
              ease: baseEase,
              delay: delay,
              repeat: -1,
              startAt: { x: -80 },
            });
            applyWindOscillation(target);
          };

          // Initialize loops
          initBalloonMovement(".balloon-node-1", 0);
          initBalloonMovement(".balloon-node-2", 3);
          initBalloonMovement(".balloon-node-3", 2);
        }, scopeRef.current);

        return () => context.revert();
      })
      .catch((err) =>
        console.error(
          "[BalloonHillsPill] Error loading animation scripts:",
          err.message,
        ),
      );
  }, [baseDuration, baseEase]);

  // Prevent SSR rendering hydration discrepancies
  if (!isMounted) {
    return <div className="w-full min-h-screen bg-transparent" />;
  }

  return (
    <div
      ref={scopeRef}
      className="relative flex flex-col items-center justify-center min-h-screen w-full select-none overflow-hidden antialiased"
      style={{ backgroundColor: containerBg }}
    >
      {/* Central Illustration Frame */}
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{ transform: `scale(${scaleFactor})` }}
      >
        <div
          className={`relative ${pillWidth} ${pillHeight} rounded-[100px] overflow-hidden shadow-sm`}
          style={{
            background: `linear-gradient(to bottom, ${gradientTop} 20%, ${gradientBottom} 75%)`,
          }}
        >
          {/* Stylized Crescent Moon */}
          <div
            className="absolute w-[35px] h-[35px] top-[40px] right-[7px] bg-transparent rounded-full opacity-80"
            style={{ boxShadow: `-3px 3px 0px 0px ${moonColor}` }}
          />

          {/* Concentric Layered Sun Group */}
          <div className="absolute top-[75%] left-0 right-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div
                className="absolute rounded-full w-[180px] h-[180px] opacity-10"
                style={{ backgroundColor: sunColor }}
              />
              <div
                className="absolute rounded-full w-[145px] h-[145px] opacity-20"
                style={{ backgroundColor: sunColor }}
              />
              <div
                className="absolute rounded-full w-[115px] h-[115px] opacity-20"
                style={{ backgroundColor: sunColor }}
              />
              <div
                className="absolute rounded-full w-[80px] h-[80px] opacity-100"
                style={{ backgroundColor: sunColor }}
              />
            </div>
          </div>

          {/* Foreground Mountain Vector Mask */}
          <img
            className="absolute bottom-[-100px] right-[-60px] w-[300px] max-w-none pointer-events-none z-10"
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3522775/HotAirBalloonHills.svg"
            alt="Mountain Hills Layer"
          />

          {/* Kinematic Balloon Wrappers */}
          <div className="absolute inset-0 z-0">
            <div className="balloon-node-1 absolute top-[30%] left-0 will-change-transform">
              <img
                className="w-[80px] -translate-x-[80px] max-w-none"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3522775/airballoon.svg"
                alt="Primary Air Balloon"
              />
            </div>

            <div className="balloon-node-2 absolute top-[15%] left-0 will-change-transform">
              <img
                className="w-[30px] -translate-x-[30px] max-w-none"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3522775/airballoon.svg"
                alt="Secondary Air Balloon"
              />
            </div>

            <div className="balloon-node-3 absolute top-[46%] left-0 will-change-transform">
              <img
                className="w-[15px] -translate-x-[15px] max-w-none"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3522775/airballoon.svg"
                alt="Tertiary Air Balloon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
