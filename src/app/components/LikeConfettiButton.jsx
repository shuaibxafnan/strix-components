"use client";

import { useEffect, useRef, useState } from "react";

// ─── LikeButton ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// defaultLabel      string     'Like'        Resting state copy
// likedLabel        string     'Liked'       Completed active state copy
// initialLiked      boolean    false         Default toggle position matching hydration
// particleCount     number     48            Amount of burst elements spawned on activate
// themeBgRest       string     '#404660'     Button background color when unselected
// themeBgHover      string     '#393E57'     Button background color when hovered over
// themeBgActive     string     '#275EFE'     Button background color when active/selected
// iconColorRest     string     '#E1E6F9'     Thumb graphic fill color when unselected
// iconColorActive   string     '#FFFFFF'     Thumb graphic fill color when completed
// particleColors    string[]   [...]         Array of color strings chosen randomly for physics bits
// ──────────────────────────────────────────────────────────────────────────

export default function LikeConfettiButton({
  defaultLabel = "Like",
  likedLabel = "Liked",
  initialLiked = false,
  particleCount = 48,
  themeBgRest = "#404660",
  themeBgHover = "#393E57",
  themeBgActive = "#275EFE",
  iconColorRest = "#E1E6F9",
  iconColorActive = "#FFFFFF",
  particleColors = ["#FFFF04", "#EA4C89", "#892AB8", "#4AF2FD", "#275EFE"],
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
  const emitterRef = useRef(null);

  // Prevent SSR/Hydration mismatch errors safely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const triggerParticles = async (parent, quantity, width) => {
    // Dynamic runtime client-side injection to completely avoid server compilation errors
    const { default: gsap } = await import("gsap");

    for (let i = quantity - 1; i >= 0; i--) {
      const angle = gsap.utils.random(0, 360);
      const velocity = gsap.utils.random(70, 110);
      const dot = document.createElement("div");

      // Set baseline custom variable styling values
      dot.style.setProperty(
        "--b",
        particleColors[Math.floor(gsap.utils.random(0, particleColors.length))],
      );
      dot.className =
        "w-[6px] h-[6px] -mt-[3px] ml-[-3px] rounded-[2px] absolute left-0 top-0 [transform-style:preserve-3d]";
      dot.style.background = "var(--b, none)";

      parent.appendChild(dot);

      gsap.set(dot, {
        x: gsap.utils.random(width * -0.5, width * 0.5),
        y: 0,
        scale: gsap.utils.random(0.4, 0.8),
      });

      // Calculate simple physics vectors programmatically using pure GSAP to eliminate closed physics plug-in errors
      const angleRad = (angle * Math.PI) / 180;
      const targetX = Math.cos(angleRad) * velocity * 1.5;
      const targetY = Math.sin(angleRad) * velocity * 1.5 + 40; // Simulate gravity offset pull down

      gsap
        .timeline({
          onComplete() {
            dot.remove();
          },
        })
        .to(dot, {
          duration: 1.4,
          x: `+=${targetX}`,
          y: `+=${targetY}`,
          rotationX: `-=${gsap.utils.random(180, 720)}`,
          rotationZ: `+=${gsap.utils.random(180, 720)}`,
          ease: "power2.out",
        })
        .to(
          dot,
          {
            duration: 0.6,
            opacity: 0,
          },
          0.8,
        );
    }
  };

  const handleClick = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);

    if (nextState && emitterRef.current && buttonRef.current) {
      setTimeout(() => {
        triggerParticles(
          emitterRef.current,
          particleCount,
          buttonRef.current.offsetWidth,
        );
      }, 160);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-[110px] h-[43px] bg-[#404660] opacity-30 rounded-[9px] animate-pulse" />
    );
  }

  // Handle color token state switches at code level
  const currentBackground = isLiked
    ? themeBgActive
    : isHovered
      ? themeBgHover
      : themeBgRest;
  const currentIconColor = isLiked ? iconColorActive : iconColorRest;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        "--background": currentBackground,
        "--icon": currentIconColor,
        // Text animation transformations variables
        "--span-x": isLiked ? "2px" : "4px",
        "--span-d-o": isLiked ? "1" : "0",
        "--span-d-x": isLiked ? "0px" : "4px",
        // Thumb hand state variations variables
        "--hand-rotate": !isLiked && isHovered ? "8deg" : "0deg",
        "--hand-thumb-1": !isLiked && isHovered ? "-12deg" : "-45deg",
        "--hand-thumb-2": !isLiked && isHovered ? "36deg" : "-45deg",
      }}
      className="group relative block cursor-pointer border-0 bg-transparent px-8 py-2 text-[14px] text-[#F6F8FF] outline-none select-none active:scale-95 transition-all duration-200 [-webkit-appearance:none] [-webkit-tap-highlight-color:transparent]"
    >
      {/* Structural Button Backdrop Shadow Shell wrapper */}
      <div
        style={{ background: "var(--background)" }}
        className="absolute inset-0 z-0 min-w-[103px] rounded-[12px] shadow-[0_4px_8px_rgba(0,17,119,0.1),0_8px_20px_rgba(0,17,119,0.1)] transition-all duration-200"
      />

      {/* Physics Particle Emitter Anchor Viewport */}
      <div
        ref={emitterRef}
        className="absolute left-1/2 top-1/2 z-10 -translate-z-[4px]"
      />

      {/* Interactive Hand Icon Layer Component */}
      <div
        style={{
          transform: "rotate(var(--hand-rotate, 0deg)) translateZ(0)",
          background: "var(--icon)",
        }}
        className={`relative z-20 mr-[8px] mt-[10px] inline-block h-[11px] w-[11px] vertical-top rounded-tl-[2px] rounded-tr-0 rounded-bl-0 rounded-br-0 origin-[-5px_-1px] transition-all duration-200 ease-linear ${
          isLiked ? "animate-[hand_0.5s_linear_forwards]" : ""
        }`}
      >
        {/* Wrist Base Shading */}
        <div
          style={{ background: "var(--icon)" }}
          className="absolute left-[-5px] bottom-0 h-[12px] w-[4px] rounded-tl-[1px] rounded-tr-[1px] rounded-bl-0 rounded-br-[1px] transition-colors duration-200"
        />
        {/* Fingers Stack Block */}
        <div
          style={{
            background: "var(--icon)",
            boxShadow:
              "-.5px 4px 0 var(--icon), -1px 8px 0 var(--icon), -1.5px 12px 0 var(--icon)",
          }}
          className="absolute right-[-3px] top-0 h-[4px] w-[4px] rounded-tl-0 rounded-tr-[2px] rounded-bl-0 rounded-br-[2px] scale-y-[0.6825] origin-top transition-all duration-200"
        />
        {/* Flexible Thumb Subsegment Joint */}
        <div
          style={{
            background: "var(--icon)",
            transform:
              "scale(.85) translateY(-.5px) rotate(var(--hand-thumb-1, -45deg)) translateZ(0)",
          }}
          className="absolute left-0 top-0 h-[4px] w-[10px] rounded-[2px] origin-[2px_2px] transition-all duration-200"
        >
          {/* Thumb Tip Segment */}
          <div
            style={{
              background: "var(--icon)",
              transform: "rotate(var(--hand-thumb-2, -45deg)) translateZ(0)",
            }}
            className="absolute left-[7px] top-0 h-[4px] w-[7px] rounded-[2px] origin-[2px_2px] transition-all duration-200"
          />
        </div>
      </div>

      {/* Button Text Composition Wrap Container */}
      <span
        style={{ transform: "translateX(var(--span-x, 4px)) translateZ(0)" }}
        className="relative z-20 inline-block vertical-top transition-transform duration-250 font-sans"
      >
        {defaultLabel}
        {/* Dynamic State letter suffix */}
        <span
          style={{
            opacity: "var(--span-d-o, 0)",
            transform: "translateX(var(--span-d-x, 4px)) translateZ(0)",
          }}
          className="inline-block transition-all duration-200 ease-linear"
        >
          {likedLabel.replace(defaultLabel, "")}
        </span>
      </span>

      {/* Global CSS Style tag inside local layout block injects standard keyframe instructions for GSAP backup */}
      <style jsx global>{`
        @keyframes hand {
          30% {
            transform: rotate(-14deg) translateZ(0);
          }
          65% {
            transform: rotate(7deg) translateZ(0);
          }
          100% {
            transform: rotate(0deg) translateZ(0);
          }
        }
      `}</style>
    </button>
  );
}
