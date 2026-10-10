"use client";

import { useState, useEffect, useRef } from "react";

// ─── TipButton ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// buttonText          string     "Send me a tip"     Main text inside the button
// successText         string     "Thank you!"        Text shown after coin lands
// coinSize            string     "3.5rem"            Diameter of the coin
// maxMoveLoopCount    number     90                  Flipping loop duration (frames)
// btnBgColor          string     "#031032"           Background color of the button
// pageBgColor         string     "#f4f7ff"           Background container color
// fontColor           string     "#fff"              Button text color
// coinLight           string     "#fcfaf9"           Coin lightest face gradient stop
// coinMedium          string     "#c2cadf"           Coin medium face gradient stop
// coinDark            string     "#8590b3"           Coin background/darkest stop
// coinSide            string     "#737c99"           Coin rim/edge color
// coinShine           string     "#e9f4ff"           Coin glare reflection color
// ──────────────────────────────────────────────────────────────────────────

export default function TipButton({
  buttonText = "Send me a tip",
  successText = "Thank you!",
  coinSize = "3.5rem",
  maxMoveLoopCount = 90,
  btnBgColor = "#031032",
  pageBgColor = "#f4f7ff",
  fontColor = "#fff",
  coinLight = "#fcfaf9",
  coinMedium = "#c2cadf",
  coinDark = "#8590b3",
  coinSide = "#737c99",
  coinShine = "#e9f4ff",
}) {
  // Mounting check to eliminate SSR/hydration mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation States
  const [isClicked, setIsClicked] = useState(false);
  const [isShrinkLanding, setIsShrinkLanding] = useState(false);
  const [isCoinLanded, setIsCoinLanded] = useState(false);

  const coinRef = useRef(null);
  const animationFrameRef = useRef(null);
  const trackingRef = useRef({ isProcessing: false });

  // Reset local variable states
  const resetCoinProperties = () => {
    if (!coinRef.current) return;
    const s = coinRef.current.style;
    s.setProperty("--coin-x-multiplier", "0");
    s.setProperty("--coin-scale-multiplier", "0");
    s.setProperty("--coin-rotation-multiplier", "0");
    s.setProperty("--shine-opacity-multiplier", "0.4");
    s.setProperty("--shine-bg-multiplier", "50%");
    s.setProperty("opacity", "1");

    setTimeout(() => {
      trackingRef.current.isProcessing = false;
    }, 300);
  };

  const handleClick = () => {
    if (trackingRef.current.isProcessing) return;
    trackingRef.current.isProcessing = true;
    setIsClicked(true);

    // Initial configuration matching the custom JS script triggers
    setTimeout(() => {
      if (!coinRef.current) return;

      const sideRotationCount = Math.floor(Math.random() * 5) * 90;
      const maxFlipAngle = (Math.floor(Math.random() * 4) + 3) * Math.PI;
      let moveLoopCount = 0;

      const flipCoinLoop = () => {
        moveLoopCount++;
        const percentageCompleted = moveLoopCount / maxMoveLoopCount;
        const angle =
          -maxFlipAngle * Math.pow(percentageCompleted - 1, 2) + maxFlipAngle;

        if (!coinRef.current) return;
        const s = coinRef.current.style;

        // Custom variable transformations mimicking the exact math provided
        s.setProperty(
          "--coin-y-multiplier",
          String(-11 * Math.pow(percentageCompleted * 2 - 1, 4) + 11),
        );
        s.setProperty("--coin-x-multiplier", String(percentageCompleted));
        s.setProperty(
          "--coin-scale-multiplier",
          String(percentageCompleted * 0.6),
        );
        s.setProperty(
          "--coin-rotation-multiplier",
          String(percentageCompleted * sideRotationCount),
        );

        s.setProperty(
          "--front-scale-multiplier",
          String(Math.max(Math.cos(angle), 0)),
        );
        s.setProperty("--front-y-multiplier", String(Math.sin(angle)));

        s.setProperty(
          "--middle-scale-multiplier",
          String(Math.abs(Math.cos(angle))),
        );
        s.setProperty(
          "--middle-y-multiplier",
          String(Math.cos((angle + Math.PI / 2) % Math.PI)),
        );

        s.setProperty(
          "--back-scale-multiplier",
          String(Math.max(Math.cos(angle - Math.PI), 0)),
        );
        s.setProperty("--back-y-multiplier", String(Math.sin(angle - Math.PI)));

        s.setProperty(
          "--shine-opacity-multiplier",
          String(4 * Math.sin((angle + Math.PI / 2) % Math.PI) - 3.2),
        );
        s.setProperty(
          "--shine-bg-multiplier",
          -40 * (Math.cos((angle + Math.PI / 2) % Math.PI) - 0.5) + "%",
        );

        if (moveLoopCount < maxMoveLoopCount) {
          if (moveLoopCount === maxMoveLoopCount - 6) {
            setIsShrinkLanding(true);
          }
          animationFrameRef.current =
            window.requestAnimationFrame(flipCoinLoop);
        } else {
          setIsCoinLanded(true);
          s.setProperty("opacity", "0");

          setTimeout(() => {
            setIsClicked(false);
            setIsShrinkLanding(false);
            setIsCoinLanded(false);
            setTimeout(() => {
              resetCoinProperties();
            }, 300);
          }, 1500);
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(flipCoinLoop);
    }, 50);
  };

  // Cleanup references on component destruction
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="w-full h-screen flex items-center justify-center antialiased"
      style={{ backgroundColor: pageBgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes customShake {
          0% { transform: rotate(4deg); }
          66% { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-custom-shake {
          animation: 150ms ease-in-out 1 customShake;
        }
      `,
        }}
      />

      <button
        onClick={handleClick}
        className={`
          bg-none border-0 rounded-t-[0.25rem] cursor-pointer font-['Quicksand',sans-serif] 
          text-[0.75rem] font-semibold h-[2.6rem] mb-[-4rem] outline-0 relative top-0 
          origin-[0%_100%] transition-transform duration-[50ms] ease-in-out w-[9.5rem] 
          select-none [-webkit-tap-highlight-color:transparent]
          active:rotate(4deg)
          ${isClicked ? "animate-custom-shake pointer-events-none" : ""}
          ${isCoinLanded ? "after:opacity-100 after:scale-100 after:origin-[50%_100%]" : ""}
        `}
        style={{
          "--btn-bg": btnBgColor,
          "--success-msg": `'${successText}'`,
          "--font-color": fontColor,
        }}
      >
        {/* Button main label text */}
        <span
          className={`
            text-[var(--font-color)] mr-[1.8rem] opacity-100 relative 
            transition-opacity duration-[100ms] linear z-[3]
            ${isClicked ? "opacity-0 !delay-[200ms]" : "delay-[500ms]"}
          `}
        >
          {buttonText}
        </span>

        {/* Dynamic Pseudo-background ::before implementation */}
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 block rounded-[0.25rem] z-[2] transition-[height,width] ease-in-out"
          style={{
            backgroundColor: btnBgColor,
            height: isClicked ? "0.5rem" : "100%",
            width: isClicked ? (isShrinkLanding ? "0%" : "60%") : "100%",
            transitionDuration: isShrinkLanding
              ? "200ms, 250ms"
              : "250ms, 250ms",
            transitionDelay: isShrinkLanding ? "0ms" : "400ms, 300ms",
            transitionTimingFunction: isShrinkLanding
              ? "linear, ease-in"
              : "ease-in-out, ease-in-out",
          }}
        />

        {/* Dynamic Pseudo-success label ::after implementation */}
        <span
          className={`
            absolute bottom-[-1rem] left-0 h-[110%] w-full text-center pointer-events-none z-[1] opacity-0 scale-0 origin-[50%_20%] 
            transition-transform duration-[200ms] cubic-bezier(0,0,0.35,1.43)
            ${isCoinLanded ? "!opacity-100 !scale-100 !origin-[50%_100%]" : ""}
          `}
          style={{ color: btnBgColor }}
        >
          {successText}
        </span>

        {/* Coin Area & Particle Wrapper */}
        <div
          className={`
            absolute bottom-0 left-0 h-[18rem] w-full bg-none opacity-100 overflow-hidden pointer-events-none 
            transform-none origin-[50%_100%] transition-[opacity,transform] duration-[200ms,300ms] linear
            ${isCoinLanded ? "!bottom-[-1rem] opacity-0 scale-200 -translate-y-[10px]" : ""}
          `}
          style={{
            backgroundImage: isCoinLanded
              ? `radial-gradient(circle at 35% 97%, rgba(${hexToRgb(btnBgColor)}, 0.4) 0.04rem, transparent 0.04rem),
                 radial-gradient(circle at 45% 92%, rgba(${hexToRgb(btnBgColor)}, 0.4) 0.04rem, transparent 0.02rem),
                 radial-gradient(circle at 55% 98%, rgba(${hexToRgb(btnBgColor)}, 0.4) 0.04rem, transparent 0.04rem),
                 radial-gradient(circle at 65% 96%, rgba(${hexToRgb(btnBgColor)}, 0.4) 0.06rem, transparent 0.06rem)`
              : "none",
            backgroundPosition: "center bottom",
            backgroundSize: "100%",
          }}
        >
          {/* Coin Entity */}
          <div
            ref={coinRef}
            className="absolute right-[calc(var(--coin-x-multiplier)*34%+16%)] transform translate-x-1/2 transition-opacity duration-[100ms] linear delay-[200ms] z-[3]"
            style={{
              height: coinSize,
              width: coinSize,
              marginBottom: isClicked ? "0rem" : "3.05rem",
              transitionProperty: isClicked ? "margin-bottom" : "opacity",
              transitionDuration: isClicked ? "1s" : "100ms",
              transitionTimingFunction: isClicked ? "linear" : "linear",
              transitionDelay: isClicked ? "200ms" : "200ms",
              bottom: `calc(var(--coin-y-multiplier) * 1rem - ${coinSize})`,
              transform: `translateX(50%) scale(calc(0.4 + var(--coin-scale-multiplier, 0))) rotate(calc(var(--coin-rotation-multiplier, 0) * -1deg))`,

              // Custom defaults initialization mapping scss properties
              "--front-y-multiplier": "0",
              "--back-y-multiplier": "0",
              "--coin-y-multiplier": "0",
              "--coin-x-multiplier": "0",
              "--coin-scale-multiplier": "0",
              "--coin-rotation-multiplier": "0",
              "--shine-opacity-multiplier": "0.4",
              "--shine-bg-multiplier": "50%",
            }}
          >
            {/* Shareable structural sizing shapes */}
            {[
              "rounded-full box-border h-full left-0 absolute w-full z-[3]",
            ].map(() => {
              const coinThickness = `calc(${coinSize} / 11)`;
              return (
                <div key="coin-structure" className="contents">
                  {/* TAILS (Front Face) */}
                  <div
                    className="rounded-full box-border h-full left-0 absolute w-full z-[3] after:absolute after:inset-0 after:rounded-full after:bg-black/20"
                    style={{
                      backgroundColor: coinDark,
                      backgroundImage: `
                        radial-gradient(circle at 50% 50%, transparent 50%, rgba(${hexToRgb(coinSide)}, 0.4) 54%, ${coinMedium} 54%),
                        linear-gradient(210deg, ${coinDark} 32%, transparent 32%),
                        linear-gradient(150deg, ${coinDark} 32%, transparent 32%),
                        linear-gradient(to right, ${coinDark} 22%, transparent 22%, transparent 78%, ${coinDark} 78%),
                        linear-gradient(to bottom, ${coinLight} 44%, transparent 44%, transparent 65%, ${coinLight} 65%, ${coinLight} 71%, ${coinDark} 71%),
                        linear-gradient(to right, transparent 28%, ${coinLight} 28%, ${coinLight} 34%, ${coinDark} 34%, ${coinDark} 40%, ${coinLight} 40%, ${coinLight} 47%, ${coinDark} 47%, ${coinDark} 53%, ${coinLight} 53%, ${coinLight} 60%, ${coinDark} 60%, ${coinDark} 66%, ${coinLight} 66%, ${coinLight} 72%, transparent 72%)
                      `,
                      backgroundSize: "100% 100%",
                      transform: `translateY(calc(var(--front-y-multiplier) * ${coinThickness} / 2)) scaleY(var(--front-scale-multiplier, 1))`,
                      WebkitAnywhere: "var(--front-y-multiplier)", // reference flag placeholder
                    }}
                  />

                  {/* MIDDLE Layer */}
                  <div
                    className="rounded-full box-border h-full left-0 absolute w-full z-[3]"
                    style={{
                      backgroundColor: coinSide,
                      transform: `translateY(calc(var(--middle-y-multiplier) * ${coinThickness} / 2)) scaleY(var(--middle-scale-multiplier, 1))`,
                    }}
                  />

                  {/* HEADS (Back Face) */}
                  <div
                    className="rounded-full box-border h-full left-0 absolute w-full z-[3] after:absolute after:inset-0 after:rounded-full after:bg-black/20"
                    style={{
                      backgroundColor: coinDark,
                      backgroundImage: `
                        radial-gradient(circle at 50% 50%, transparent 50%, rgba(${hexToRgb(coinSide)}, 0.4) 54%, ${coinMedium} 54%),
                        radial-gradient(circle at 50% 40%, ${coinLight} 23%, transparent 23%),
                        radial-gradient(circle at 50% 100%, ${coinLight} 35%, transparent 35%)
                      `,
                      backgroundSize: "100% 100%",
                      transform: `translateY(calc(var(--back-y-multiplier) * ${coinThickness} / 2)) scaleY(var(--back-scale-multiplier, 1))`,
                    }}
                  />

                  {/* GLARE / SHINE LAYER */}
                  <div
                    className="rounded-full box-border h-full left-0 absolute w-full z-[10]"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 25% 65%, transparent 50%, rgba(255, 255, 255, 0.9) 90%),
                        linear-gradient(55deg, transparent calc(var(--shine-bg-multiplier) + 0%), ${coinShine} calc(var(--shine-bg-multiplier) + 0%), transparent calc(var(--shine-bg-multiplier) + 50%))
                      `,
                      opacity: `var(--shine-opacity-multiplier)`,
                      transform: `translateY(calc(var(--middle-y-multiplier) * ${coinThickness} / -2)) scaleY(var(--middle-scale-multiplier, 1)) rotate(calc(var(--coin-rotation-multiplier) * 1deg))`,
                    }}
                  />

                  {/* COIN THICKNESS EDGE */}
                  <div
                    className="absolute left-0 w-full z-[2] top-1/2 -translate-y-1/2"
                    style={{
                      backgroundColor: coinSide,
                      height: coinThickness,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </button>
    </div>
  );
}

// Helper utility to reliably parse HEX colors to plain RGB integers for styling standard radial injection masks
function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  if (cleanHex.length === 3) {
    return [
      ((num >> 8) & 0xf) * 17,
      ((num >> 4) & 0xf) * 17,
      (num & 0xf) * 17,
    ].join(",");
  }
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff].join(",");
}
