"use client";

import { useEffect, useRef, useState } from "react";

// ─── ConfettiSubmitButton ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// canvasBg         string    "#f4f7ff"    Page background canvas
// buttonBg         string    "#1f2335"    Interactive button center pill fill
// submitColor      string    "#5c86ff"    Default ready phase icon/text stroke
// successColor     string    "#5cffa1"    Completed success stroke tint
// confettiAmount   number    20           Pills discharged per animation click
// sequinAmount     number    10           Shimmering circles discharged per click
// loadingDuration  number    1800         Mock network time delay in milliseconds
// ──────────────────────────────────────────────────────────────────────────

export default function ConfettiSubmitButton({
  canvasBg = "#f4f7ff",
  buttonBg = "#1f2335",
  submitColor = "#5c86ff",
  successColor = "#5cffa1",
  confettiAmount = 20,
  sequinAmount = 10,
  loadingDuration = 1800,
}) {
  const canvasRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [btnState, setBtnState] = useState("ready"); // "ready" | "loading" | "complete"
  const [isDisabled, setIsDisabled] = useState(false);

  // References mutable for canvas animation updates loops safely without re-render cascades
  const runtimeRef = useRef({
    confetti: [],
    sequins: [],
    colors: [
      { front: "#7b5cff", back: "#6245e0" }, // Purple
      { front: "#b3c7ff", back: "#8fa5e5" }, // Light Blue
      { front: "#5c86ff", back: "#345dd1" }, // Darker Blue
    ],
    gravityConfetti: 0.3,
    gravitySequins: 0.55,
    dragConfetti: 0.075,
    dragSequins: 0.02,
    terminalVelocity: 3,
  });

  // Guard against Next.js SSR hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Physics helper tools
    const randomRange = (min, max) => Math.random() * (max - min) + min;

    const initConfettoVelocity = (xRange, yRange) => {
      const x = randomRange(xRange[0], xRange[1]);
      const range = yRange[1] - yRange[0] + 1;
      let y =
        yRange[1] -
        Math.abs(randomRange(0, range) + randomRange(0, range) - range);
      if (y >= yRange[1] - 1) {
        y += Math.random() < 0.25 ? randomRange(1, 3) : 0;
      }
      return { x, y: -y };
    };

    // Blueprint Generators
    class Confetto {
      constructor() {
        const state = runtimeRef.current;
        const btnRect = buttonRef.current?.getBoundingClientRect() || {
          width: 190,
          height: 40,
        };
        this.randomModifier = randomRange(0, 99);
        this.color =
          state.colors[Math.floor(randomRange(0, state.colors.length))];
        this.dimensions = { x: randomRange(5, 9), y: randomRange(8, 15) };
        this.position = {
          x: randomRange(
            canvas.width / 2 - btnRect.width / 4,
            canvas.width / 2 + btnRect.width / 4,
          ),
          y: randomRange(
            canvas.height / 2 + btnRect.height / 2 + 8,
            canvas.height / 2 + 1.5 * btnRect.height - 8,
          ),
        };
        this.rotation = randomRange(0, 2 * Math.PI);
        this.scale = { x: 1, y: 1 };
        this.velocity = initConfettoVelocity([-9, 9], [6, 11]);
      }
      update() {
        const state = runtimeRef.current;
        this.velocity.x -= this.velocity.x * state.dragConfetti;
        this.velocity.y = Math.min(
          this.velocity.y + state.gravityConfetti,
          state.terminalVelocity,
        );
        this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
      }
    }

    class Sequin {
      constructor() {
        const state = runtimeRef.current;
        const btnRect = buttonRef.current?.getBoundingClientRect() || {
          width: 190,
          height: 40,
        };
        this.color =
          state.colors[Math.floor(randomRange(0, state.colors.length))].back;
        this.radius = randomRange(1, 2);
        this.position = {
          x: randomRange(
            canvas.width / 2 - btnRect.width / 3,
            canvas.width / 2 + btnRect.width / 3,
          ),
          y: randomRange(
            canvas.height / 2 + btnRect.height / 2 + 8,
            canvas.height / 2 + 1.5 * btnRect.height - 8,
          ),
        };
        this.velocity = { x: randomRange(-6, 6), y: randomRange(-8, -12) };
      }
      update() {
        const state = runtimeRef.current;
        this.velocity.x -= this.velocity.x * state.dragSequins;
        this.velocity.y += state.gravitySequins;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
      }
    }

    // Attach burst mechanism globally to window context parameters for component triggers
    window.initBurst = () => {
      for (let i = 0; i < confettiAmount; i++) {
        runtimeRef.current.confetti.push(new Confetto());
      }
      for (let i = 0; i < sequinAmount; i++) {
        runtimeRef.current.sequins.push(new Sequin());
      }
    };

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const btnRect = buttonRef.current?.getBoundingClientRect() || {
        width: 190,
        height: 40,
      };

      runtimeRef.current.confetti.forEach((confetto) => {
        let width = confetto.dimensions.x * confetto.scale.x;
        let height = confetto.dimensions.y * confetto.scale.y;

        ctx.translate(confetto.position.x, confetto.position.y);
        ctx.rotate(confetto.rotation);
        confetto.update();

        ctx.fillStyle =
          confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (confetto.velocity.y < 0) {
          ctx.clearRect(
            canvas.width / 2 - btnRect.width / 2,
            canvas.height / 2 + btnRect.height / 2,
            btnRect.width,
            btnRect.height,
          );
        }
      });

      runtimeRef.current.sequins.forEach((sequin) => {
        ctx.translate(sequin.position.x, sequin.position.y);
        sequin.update();

        ctx.fillStyle = sequin.color;
        ctx.beginPath();
        ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (sequin.velocity.y < 0) {
          ctx.clearRect(
            canvas.width / 2 - btnRect.width / 2,
            canvas.height / 2 + btnRect.height / 2,
            btnRect.width,
            btnRect.height,
          );
        }
      });

      // Filter particles remaining inside limits
      runtimeRef.current.confetti = runtimeRef.current.confetti.filter(
        (c) => c.position.y < canvas.height,
      );
      runtimeRef.current.sequins = runtimeRef.current.sequins.filter(
        (s) => s.position.y < canvas.height,
      );

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    // Universal space/enter key binding listener
    const handleKeyUp = (e) => {
      if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
        triggerSubmit();
      }
    };
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keyup", handleKeyUp);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, isDisabled]);

  const triggerSubmit = () => {
    if (isDisabled) return;

    setIsDisabled(true);
    setBtnState("loading");

    setTimeout(() => {
      setBtnState("complete");

      setTimeout(() => {
        if (window.initBurst) window.initBurst();

        setTimeout(() => {
          setBtnState("ready");
          setIsDisabled(false);
        }, 4000);
      }, 320);
    }, loadingDuration);
  };

  if (!isMounted) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center overflow-hidden font-sans select-none"
        style={{ backgroundColor: canvasBg }}
      />
    );
  }

  const submitText = "Submit";
  const successText = "Success";

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden font-sans select-none relative"
      style={{ backgroundColor: canvasBg }}
    >
      {/* Dynamic Keyframes Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes loadingCycle {
          0%, 100% { cy: 10px; }
          25% { cy: 3px; }
          50% { cy: 10px; }
        }
        .animate-loading-circle {
          animation: loadingCycle 1s infinite;
        }
      `,
        }}
      />

      {/* Physics Canvas Target Engine */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[2]"
      />

      {/* Core Trigger Component Layout */}
      <button
        ref={buttonRef}
        onClick={triggerSubmit}
        disabled={isDisabled}
        className="relative block w-[150px] h-10 text-white font-medium text-[14px] bg-transparent border-none outline-none overflow-hidden cursor-pointer active:scale-95 transition-transform z-[1] [-webkit-tap-highlight-color:transparent]"
      >
        {/* Dynamic Width Background Shifter Layer */}
        <div
          className="absolute inset-0 h-full mx-auto rounded-[50px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)] transition-all ease-out duration-300"
          style={{
            backgroundColor: buttonBg,
            width: btnState === "loading" ? "80%" : "100%",
            transitionProperty: "width",
            transitionTimingFunction:
              btnState === "ready"
                ? "cubic-bezier(0.39, 1.86, 0.64, 1)"
                : "ease",
            transitionDelay: btnState === "ready" ? "300ms" : "0s",
          }}
        />

        {/* ─── STATE 1: Submit Ready Context ─── */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-300"
          style={{
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%",
            opacity: btnState === "ready" ? 1 : 0,
            pointerEvents: btnState === "ready" ? "auto" : "none",
          }}
        >
          <svg
            className="inline-block fill-none transition-all mr-[5px]"
            viewBox="0 0 13 12.2"
            style={{
              color: submitColor,
              width: "14px",
              height: "14px",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              opacity: btnState === "ready" ? 1 : 0,
              top: btnState === "ready" ? "1px" : "30px",
              position: "relative",
              transition:
                btnState === "ready"
                  ? "top 0.4s ease 600ms, opacity 0.3s linear 600ms"
                  : "top 0.4s ease, opacity 0.3s linear",
            }}
          >
            <polyline points="2,7.1 6.5,11.1 11,7.1" />
            <line x1="6.5" y1="1.2" x2="6.5" y2="10.3" />
          </svg>
          <span className="relative inline-flex overflow-hidden">
            {submitText.split("").map((char, index) => (
              <span
                key={index}
                className="relative transition-all"
                style={{
                  opacity: btnState === "ready" ? 1 : 0,
                  top: btnState === "ready" ? "0px" : "8px",
                  transitionDuration: "200ms",
                  transitionTimingFunction: "ease",
                  transitionDelay:
                    btnState === "ready"
                      ? `${(submitText.length - index - 1) * 30 + 600}ms`
                      : `${index * 30}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </div>

        {/* ─── STATE 2: Loader Active Stage ─── */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center transition-all"
          style={{
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: btnState === "complete" ? "80px" : "50%",
            opacity: btnState === "loading" ? 1 : 0,
            transitionDuration: "400ms",
            transitionTimingFunction:
              btnState === "complete"
                ? "cubic-bezier(0.22, 0, 0.41, -0.57)"
                : "ease",
            transitionDelay: btnState === "loading" ? "300ms" : "0s",
          }}
        >
          <svg
            className="inline-block"
            style={{ fill: submitColor, width: "22px", height: "22px" }}
            viewBox="0 0 19 17"
          >
            <circle
              className={`loadingCircle ${btnState === "loading" ? "animate-loading-circle" : ""}`}
              cx="2.2"
              cy="10"
              r="1.6"
            />
            <circle
              className={`loadingCircle ${btnState === "loading" ? "animate-loading-circle" : ""}`}
              style={{ animationDelay: "0.1s" }}
              cx="9.5"
              cy="10"
              r="1.6"
            />
            <circle
              className={`loadingCircle ${btnState === "loading" ? "animate-loading-circle" : ""}`}
              style={{ animationDelay: "0.2s" }}
              cx="16.8"
              cy="10"
              r="1.6"
            />
          </svg>
        </div>

        {/* ─── STATE 3: Success Completed Trace ─── */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-300"
          style={{
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%",
            opacity: btnState === "complete" ? 1 : 0,
            pointerEvents: btnState === "complete" ? "auto" : "none",
          }}
        >
          <svg
            className="inline-block fill-none transition-all mr-[5px]"
            viewBox="0 0 13 11"
            style={{
              color: successColor,
              width: "14px",
              height: "14px",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeDasharray: 20,
              strokeDashoffset: btnState === "complete" ? 0 : 20,
              transition:
                btnState === "complete"
                  ? "stroke-dashoffset 0.3s ease-in-out 1.4s"
                  : "stroke-dashoffset 0.3s ease-in-out",
            }}
          >
            <polyline points="1.4,5.8 5.1,9.5 11.6,2.1" />
          </svg>
          <span className="relative inline-flex overflow-hidden">
            {successText.split("").map((char, index) => (
              <span
                key={index}
                className="relative transition-all"
                style={{
                  opacity: btnState === "complete" ? 1 : 0,
                  left: btnState === "complete" ? "0px" : "5px",
                  transitionDuration: "200ms",
                  transitionTimingFunction: "ease",
                  transitionDelay:
                    btnState === "complete"
                      ? `${index * 30 + 1000}ms`
                      : `${(successText.length - index - 1) * 30}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </div>
      </button>
    </div>
  );
}
