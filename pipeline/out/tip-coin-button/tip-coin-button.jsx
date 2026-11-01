"use client";

import { useEffect, useRef } from "react";

function hexToRgbStr(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
const CSS = `
  @keyframes tb-shake {
    0%   { transform: rotate(4deg); }
    66%  { transform: rotate(-4deg); }
    100% { transform: rotate(0deg); }
  }

  .tb-button {
    transition: transform 50ms ease-in-out;
  }
  .tb-button:active {
    transform: rotate(4deg);
  }

  .tb-button::before {
    background: var(--bg-button);
    border-radius: 0.25rem;
    bottom: 0;
    content: '';
    display: block;
    height: 100%;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    transition: height 250ms ease-in-out 400ms, width 250ms ease-in-out 300ms;
    width: 100%;
    z-index: 2;
  }

  .tb-button::after {
    bottom: -1rem;
    color: var(--bg-button);
    content: var(--thank-you-text);
    font-family: var(--font-family);
    font-size: 0.75rem;
    font-weight: 600;
    height: 110%;
    left: 0;
    opacity: 0;
    position: absolute;
    pointer-events: none;
    text-align: center;
    transform: scale(0);
    transform-origin: 50% 20%;
    transition: transform 200ms cubic-bezier(0, 0, 0.35, 1.43);
    width: 100%;
    z-index: 1;
  }

  .tb-button.tb-clicked {
    animation: 150ms ease-in-out 1 tb-shake;
    pointer-events: none;
  }
  .tb-button.tb-clicked::before {
    height: 0.5rem;
    width: 60%;
  }
  .tb-button.tb-clicked .tb-text {
    opacity: 0;
    transition: opacity 100ms linear 200ms;
  }
  .tb-button.tb-clicked .tb-coin {
    transition: margin-bottom 1s linear 200ms;
    margin-bottom: 0;
  }

  .tb-button.tb-shrink-landing::before {
    transition: width 200ms ease-in;
    width: 0;
  }

  .tb-button.tb-coin-landed::after {
    opacity: 1;
    transform: scale(1);
    transform-origin: 50% 100%;
  }
  .tb-button.tb-coin-landed .tb-coin-wrapper {
    background:
      radial-gradient(circle at 35% 97%, rgba(var(--bg-button-rgb), 0.4) 0.04rem, transparent 0.04rem),
      radial-gradient(circle at 45% 92%, rgba(var(--bg-button-rgb), 0.4) 0.04rem, transparent 0.02rem),
      radial-gradient(circle at 55% 98%, rgba(var(--bg-button-rgb), 0.4) 0.04rem, transparent 0.04rem),
      radial-gradient(circle at 65% 96%, rgba(var(--bg-button-rgb), 0.4) 0.06rem, transparent 0.06rem);
    background-position: center bottom;
    background-size: 100%;
    bottom: -1rem;
    opacity: 0;
    transform: scale(2) translateY(-10px);
  }

  .tb-coin__front,
  .tb-coin__middle,
  .tb-coin__back,
  .tb-coin__front::after,
  .tb-coin__back::after {
    border-radius: 50%;
    box-sizing: border-box;
    height: 100%;
    left: 0;
    position: absolute;
    width: 100%;
    z-index: 3;
  }

  .tb-coin__front {
    background:
      radial-gradient(circle at 50% 50%, transparent 50%, rgba(var(--c-side-rgb), 0.4) 54%, var(--c-m) 54%),
      linear-gradient(210deg, var(--c-d) 32%, transparent 32%),
      linear-gradient(150deg, var(--c-d) 32%, transparent 32%),
      linear-gradient(to right, var(--c-d) 22%, transparent 22%, transparent 78%, var(--c-d) 78%),
      linear-gradient(to bottom, var(--c-l) 44%, transparent 44%, transparent 65%, var(--c-l) 65%, var(--c-l) 71%, var(--c-d) 71%),
      linear-gradient(to right,
        transparent 28%, var(--c-l) 28%, var(--c-l) 34%,
        var(--c-d) 34%, var(--c-d) 40%, var(--c-l) 40%, var(--c-l) 47%,
        var(--c-d) 47%, var(--c-d) 53%, var(--c-l) 53%, var(--c-l) 60%,
        var(--c-d) 60%, var(--c-d) 66%, var(--c-l) 66%, var(--c-l) 72%,
        transparent 72%);
    background-color: var(--c-d);
    background-size: 100% 100%;
    transform: translateY(calc(var(--front-y-multiplier, 0) * var(--coin-thickness) / 2))
               scaleY(var(--front-scale-multiplier, 1));
  }
  .tb-coin__front::after {
    background: rgba(0, 0, 0, 0.2);
    content: '';
    opacity: var(--front-y-multiplier, 0);
  }

  .tb-coin__middle {
    background: var(--c-side);
    transform: translateY(calc(var(--middle-y-multiplier, 0) * var(--coin-thickness) / 2))
               scaleY(var(--middle-scale-multiplier, 0));
  }

  .tb-coin__back {
    background:
      radial-gradient(circle at 50% 50%, transparent 50%, rgba(var(--c-side-rgb), 0.4) 54%, var(--c-m) 54%),
      radial-gradient(circle at 50% 40%, var(--c-l) 23%, transparent 23%),
      radial-gradient(circle at 50% 100%, var(--c-l) 35%, transparent 35%);
    background-color: var(--c-d);
    background-size: 100% 100%;
    transform: translateY(calc(var(--back-y-multiplier, 0) * var(--coin-thickness) / 2))
               scaleY(var(--back-scale-multiplier, 0));
  }
  .tb-coin__back::after {
    background: rgba(0, 0, 0, 0.2);
    content: '';
    opacity: var(--back-y-multiplier, 0);
  }

  .tb-coin::before {
    background:
      radial-gradient(circle at 25% 65%, transparent 50%, rgba(255, 255, 255, 0.9) 90%),
      linear-gradient(
        55deg,
        transparent calc(var(--shine-bg-multiplier, 50%) + 0%),
        var(--shine) calc(var(--shine-bg-multiplier, 50%) + 0%),
        transparent calc(var(--shine-bg-multiplier, 50%) + 50%)
      );
    border-radius: 50%;
    box-sizing: border-box;
    content: '';
    height: 100%;
    left: 0;
    opacity: var(--shine-opacity-multiplier, 0.4);
    position: absolute;
    transform:
      translateY(calc(var(--middle-y-multiplier, 0) * var(--coin-thickness) / -2))
      scaleY(var(--middle-scale-multiplier, 0))
      rotate(calc(var(--coin-rotation-multiplier, 0) * 1deg));
    width: 100%;
    z-index: 10;
  }

  .tb-coin::after {
    background: var(--c-side);
    content: '';
    height: var(--coin-thickness);
    left: 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    z-index: 2;
  }
`;

export default function TipCoinButton({
  className = "",
  bgButton = "#031032",
  fontColor = "#ffffff",
  buttonText = "Send me a tip",
  thankYouText = "Thank you!",
  coinSizeRem = 3.5,
  colorLight = "#fcfaf9",
  colorMid = "#c2cadf",
  colorDark = "#8590b3",
  colorSide = "#737c99",
  colorShine = "#e9f4ff",
  maxMoveLoopCount = 90,
  buttonWidth = "9.5rem",
  buttonHeight = "2.6rem",
  fontFamily = "'Quicksand', sans-serif",
}) {
  const buttonRef = useRef(null);

  const coinThicknessRem = coinSizeRem / 11;
  const coinSizeStr = `${coinSizeRem}rem`;
  const coinThicknessStr = `${coinThicknessRem}rem`;

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const coin = button.querySelector(".tb-coin");
    coin.maxMoveLoopCount = maxMoveLoopCount;
    let animFrame = null;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const handleClick = () => {
      if (button.dataset.clicked === "true") return;
      button.classList.add("tb-clicked");

      later(() => {
        coin.sideRotationCount = Math.floor(Math.random() * 5) * 90;
        coin.maxFlipAngle = (Math.floor(Math.random() * 4) + 3) * Math.PI;
        button.dataset.clicked = "true";
        flipCoin();
      }, 50);
    };

    const resetCoin = () => {
      coin.style.setProperty("--coin-x-multiplier", 0);
      coin.style.setProperty("--coin-scale-multiplier", 0);
      coin.style.setProperty("--coin-rotation-multiplier", 0);
      coin.style.setProperty("--shine-opacity-multiplier", 0.4);
      coin.style.setProperty("--shine-bg-multiplier", "50%");

      coin.style.setProperty("--front-scale-multiplier", 1);
      coin.style.setProperty("--front-y-multiplier", 0);

      coin.style.setProperty("opacity", 1);
      later(() => {
        button.dataset.clicked = "false";
      }, 300);
    };

    const flipCoin = () => {
      coin.moveLoopCount = 0;
      flipCoinLoop();
    };

    const flipCoinLoop = () => {
      coin.moveLoopCount++;
      const p = coin.moveLoopCount / coin.maxMoveLoopCount;
      coin.angle = -coin.maxFlipAngle * Math.pow(p - 1, 2) + coin.maxFlipAngle;

      coin.style.setProperty(
        "--coin-y-multiplier",
        -11 * Math.pow(p * 2 - 1, 4) + 11,
      );
      coin.style.setProperty("--coin-x-multiplier", p);
      coin.style.setProperty("--coin-scale-multiplier", p * 0.6);
      coin.style.setProperty(
        "--coin-rotation-multiplier",
        p * coin.sideRotationCount,
      );

      coin.style.setProperty(
        "--front-scale-multiplier",
        Math.max(Math.cos(coin.angle), 0),
      );
      coin.style.setProperty("--front-y-multiplier", Math.sin(coin.angle));

      coin.style.setProperty(
        "--middle-scale-multiplier",
        Math.abs(Math.cos(coin.angle)),
      );
      coin.style.setProperty(
        "--middle-y-multiplier",
        Math.cos((coin.angle + Math.PI / 2) % Math.PI),
      );

      coin.style.setProperty(
        "--back-scale-multiplier",
        Math.max(Math.cos(coin.angle - Math.PI), 0),
      );
      coin.style.setProperty(
        "--back-y-multiplier",
        Math.sin(coin.angle - Math.PI),
      );

      coin.style.setProperty(
        "--shine-opacity-multiplier",
        4 * Math.sin((coin.angle + Math.PI / 2) % Math.PI) - 3.2,
      );
      coin.style.setProperty(
        "--shine-bg-multiplier",
        -40 * (Math.cos((coin.angle + Math.PI / 2) % Math.PI) - 0.5) + "%",
      );

      if (coin.moveLoopCount < coin.maxMoveLoopCount) {
        if (coin.moveLoopCount === coin.maxMoveLoopCount - 6) {
          button.classList.add("tb-shrink-landing");
        }
        animFrame = window.requestAnimationFrame(flipCoinLoop);
      } else {
        button.classList.add("tb-coin-landed");
        coin.style.setProperty("opacity", 0);
        later(() => {
          button.classList.remove(
            "tb-clicked",
            "tb-shrink-landing",
            "tb-coin-landed",
          );
          later(resetCoin, 300);
        }, 1500);
      }
    };

    button.addEventListener("click", handleClick);
    return () => {
      button.removeEventListener("click", handleClick);
      if (animFrame) cancelAnimationFrame(animFrame);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [maxMoveLoopCount]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center [-webkit-font-smoothing:antialiased] ${className}`}
    >
      <style>{CSS}</style>
      <button
        ref={buttonRef}
        data-clicked="false"
        className="tb-button relative cursor-pointer border-0 rounded-t-[0.25rem] outline-none font-semibold text-[0.75rem]"
        style={{
          "--bg-button": bgButton,
          "--bg-button-rgb": hexToRgbStr(bgButton),
          "--c-l": colorLight,
          "--c-m": colorMid,
          "--c-d": colorDark,
          "--c-side": colorSide,
          "--c-side-rgb": hexToRgbStr(colorSide),
          "--shine": colorShine,
          "--coin-thickness": coinThicknessStr,
          "--thank-you-text": `"${thankYouText}"`,
          "--font-family": fontFamily,
          background: "none",
          fontFamily,
          height: buttonHeight,
          width: buttonWidth,
          marginBottom: "-4rem",
          top: 0,
          transformOrigin: "0% 100%",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          className="tb-text relative z-[3] transition-[opacity] duration-[100ms] delay-500"
          style={{ color: fontColor, marginRight: "1.8rem" }}
        >
          {buttonText}
        </span>

        <div
          className="tb-coin-wrapper absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none"
          style={{
            height: "18rem",
            opacity: 1,
            transform: "none",
            transformOrigin: "50% 100%",
            transition: "opacity 200ms linear 100ms, transform 300ms ease-out",
          }}
        >
          <div
            className="tb-coin absolute z-[3]"
            style={{
              width: coinSizeStr,
              height: coinSizeStr,
              bottom: `calc(var(--coin-y-multiplier, 0) * 1rem - ${coinSizeStr})`,
              right: `calc(var(--coin-x-multiplier, 0) * 34% + 16%)`,
              transform:
                "translateX(50%) scale(calc(0.4 + var(--coin-scale-multiplier, 0))) rotate(calc(var(--coin-rotation-multiplier, 0) * -1deg))",
              marginBottom: "3.05rem",
              transition: "opacity 100ms linear 200ms",
            }}
          >
            <div className="tb-coin__middle" />
            <div className="tb-coin__back" />
            <div className="tb-coin__front" />
          </div>
        </div>
      </button>
    </div>
  );
}
