"use client";

import { useEffect, useRef, useState } from "react";

export default function SmashSubmit({
  initialText = "Smash to submit",
  completedText = "Yaay! Submitted.",
  buttonBg = "#171827",
  buttonHoverBg = "#0D0F18",
  personColor = "#F6F8FF",
  weightBarColor = "#275EFE",
  weightDiskColor = "#5C86FF",
  confettiCount = 100,
  loopSpeedFps = 60,
  textColor = "#F6F8FF",
  legColor = legColor,
  shadowColor = shadowColor,
  confettiColors = ["#7d32f5", "#f6e434", "#63fdf1", "#e672da", "#295dfe", "#6e57ff"],
  className = "",
}) {
  const buttonRef = useRef(null);
  const timersRef = useRef([]);

  const [isComplete, setIsComplete] = useState(false);
  const [showConfettiAnim, setShowConfettiAnim] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [confettis, setConfettis] = useState([]);

  const [liftTimeline, setLiftTimeline] = useState({
    personY: 0,
    weightY: 0,
    armRotate: 40,
    armRotateSX: 0,
    armRotateS: -40,
    legY: -2,
    legRotate: 45,
    legRotateS: -70,
  });

  const progressRef = useRef(0);
  const upVelocityRef = useRef(0);
  const isCompleteRef = useRef(false);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const keyframes = [
    { p: 0.0, vars: { weightY: 0, armRotateSX: 0, armRotateS: -40, personY: 0, armRotate: 40, legY: -2, legRotate: 45, legRotateS: -70 } },
    { p: 0.2, vars: { weightY: -6, armRotateSX: 90, armRotateS: -40, personY: 0, armRotate: 40, legY: -2, legRotate: 45, legRotateS: -70 } },
    { p: 0.4, vars: { weightY: -10, armRotateSX: 45, armRotateS: 130, personY: 0, armRotate: 40, legY: -2, legRotate: 45, legRotateS: -70 } },
    { p: 0.6, vars: { weightY: -12, armRotateSX: 0, armRotateS: 130, personY: 0, armRotate: 40, legY: -2, legRotate: 45, legRotateS: -70 } },
    { p: 0.8, vars: { weightY: -20, armRotateSX: 0, armRotateS: 90, personY: -4, armRotate: 100, legY: 0, legRotate: 20, legRotateS: -20 } },
    { p: 1.0, vars: { weightY: -25, armRotateSX: 0, armRotateS: 30, personY: -4, armRotate: 150, legY: 0, legRotate: 20, legRotateS: -20 } },
  ];

  const interpolate = (start, end, factor) => start + (end - start) * factor;

  useEffect(() => {
    const loopInterval = setInterval(() => {
      upVelocityRef.current = upVelocityRef.current > 0 ? upVelocityRef.current - 0.1 : 0;
      let direction = upVelocityRef.current > 0 ? 1 : -1.5;

      if (!isCompleteRef.current) {
        let nextProgress = progressRef.current + 0.01 * direction;
        if (nextProgress > 1) nextProgress = 1;
        if (nextProgress < 0) nextProgress = 0;
        progressRef.current = nextProgress;

        const prog = progressRef.current;
        let segmentStart = keyframes[0];
        let segmentEnd = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
          if (prog >= keyframes[i].p && prog <= keyframes[i + 1].p) {
            segmentStart = keyframes[i];
            segmentEnd = keyframes[i + 1];
            break;
          }
        }

        const range = segmentEnd.p - segmentStart.p;
        const factor = range === 0 ? 0 : (prog - segmentStart.p) / range;

        setLiftTimeline({
          weightY: interpolate(segmentStart.vars.weightY, segmentEnd.vars.weightY, factor),
          armRotateSX: interpolate(segmentStart.vars.armRotateSX, segmentEnd.vars.armRotateSX, factor),
          armRotateS: interpolate(segmentStart.vars.armRotateS, segmentEnd.vars.armRotateS, factor),
          personY: interpolate(segmentStart.vars.personY, segmentEnd.vars.personY, factor),
          armRotate: interpolate(segmentStart.vars.armRotate, segmentEnd.vars.armRotate, factor),
          legY: interpolate(segmentStart.vars.legY, segmentEnd.vars.legY, factor),
          legRotate: interpolate(segmentStart.vars.legRotate, segmentEnd.vars.legRotate, factor),
          legRotateS: interpolate(segmentStart.vars.legRotateS, segmentEnd.vars.legRotateS, factor),
        });

        if (prog >= 1) {
          isCompleteRef.current = true;
          setIsComplete(true);
          triggerConfettiBurst();
        }
      }
    }, 1000 / loopSpeedFps);

    return () => clearInterval(loopInterval);
  }, [loopSpeedFps]);

  const triggerConfettiBurst = () => {
    const colors = confettiColors;
    const generated = [];
    const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    for (let i = 0; i < confettiCount; i++) {
      generated.push({
        id: i,
        x: `${randomRange(-360, 360)}px`,
        y: `${randomRange(-200, 200)}px`,
        r: `${randomRange(0, 360)}deg`,
        s: randomRange(6, 10) / 10,
        b: colors[randomRange(0, colors.length - 1)],
      });
    }

    setConfettis(generated);

    later(() => {
      setShowConfettiAnim(true);
      later(() => {
        setConfettis([]);
      }, 600);
    }, 300);

    later(() => {
      setIsComplete(false);
      setShowConfettiAnim(false);
      progressRef.current = 0;
      isCompleteRef.current = false;
    }, 2000);
  };

  const handleInteractionClick = (e) => {
    if (isCompleteRef.current) return;

    upVelocityRef.current = 1;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const rippleId = Math.random();

      setRipples((prev) => [...prev, { id: rippleId, x: clickX, y: clickY }]);

      later(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 500);
    }
  };

  return (
    <div className={`w-full h-screen flex items-center justify-center ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleInteractionClick}
        className={`group relative border-none outline-none p-0 cursor-pointer font-sans text-sm font-semibold select-none bg-transparent table transition-transform active:scale-95 ${
          isComplete ? "complete" : ""
        } ${showConfettiAnim ? "confetti" : ""}`}
        style={{
          "--color": textColor,
          "--background": buttonBg,
          "--background-hover": buttonHoverBg,
          "--shadow": shadowColor,
          lineHeight: "24px",
          WebkitAppearance: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div
          className="relative z-10 flex items-center px-5 py-3.5 rounded-[13px] transition-[background,transform] duration-300 min-w-[190px]"
          style={{
            backgroundColor: "var(--button-current-bg, var(--background))",
            boxShadow: "0 1px 3px var(--shadow), 0 3px 7px var(--shadow)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.setProperty("--button-current-bg", buttonHoverBg)}
          onMouseLeave={(e) => e.currentTarget.style.removeProperty("--button-current-bg")}
        >
          <div className="relative block w-6 h-6 mr-3">
            <div
              className="absolute top-[7px] left-[9px] w-1.5 h-2.5 transition-transform ease-out"
              style={{
                transform: `translateY(${liftTimeline.personY}px)`,
              }}
            >
              <div
                className="absolute top-[-5px] left-0 w-1.5 h-1.5 rounded-full origin-[50%_25%] scale-[0.7]"
                style={{ backgroundColor: personColor }}
              />
              <div
                className="absolute inset-0 z-10 rounded-t-[2px] rounded-b-[3px]"
                style={{ backgroundColor: personColor }}
              />

              <div
                className="absolute left-0 top-0 w-0.5 h-[7px] rounded-[1px] origin-[1px_1px] z-10"
                style={{
                  backgroundColor: personColor,
                  transform: `translate(0px, 0px) rotateZ(${liftTimeline.armRotate}deg)`,
                }}
              >
                <div
                  className="absolute left-0 top-[5px] w-0.5 h-[7px] rounded-[1px] origin-[1px_1px]"
                  style={{
                    backgroundColor: personColor,
                    transform: `rotateZ(${liftTimeline.armRotateS}deg) rotateX(${liftTimeline.armRotateSX}deg)`,
                  }}
                />
              </div>

              <div
                className="absolute left-[4px] top-0 w-0.5 h-[7px] rounded-[1px] origin-[1px_1px] z-10"
                style={{
                  backgroundColor: personColor,
                  transform: `translate(0px, 0px) rotateZ(${-liftTimeline.armRotate}deg)`,
                }}
              >
                <div
                  className="absolute left-0 top-[5px] w-0.5 h-[7px] rounded-[1px] origin-[1px_1px]"
                  style={{
                    backgroundColor: personColor,
                    transform: `rotateZ(${-liftTimeline.armRotateS}deg) rotateX(${liftTimeline.armRotateSX}deg)`,
                  }}
                />
              </div>

              <div
                className="absolute left-0 top-[8px] w-0.5 h-[7px] rounded-[1px] origin-[1px_1px]"
                style={{
                  backgroundColor: legColor,
                  transform: `translate(0px, ${liftTimeline.legY}px) rotateZ(${liftTimeline.legRotate}deg)`,
                }}
              >
                <div
                  className="absolute left-0 top-[5px] w-0.5 h-[7px] rounded-[1px] origin-[1px_1px]"
                  style={{
                    backgroundColor: legColor,
                    transform: `rotateZ(${liftTimeline.legRotateS}deg) rotateX(0deg)`,
                  }}
                />
              </div>

              <div
                className="absolute left-[4px] top-[8px] w-0.5 h-[7px] rounded-[1px] origin-[1px_1px]"
                style={{
                  backgroundColor: legColor,
                  transform: `translate(0px, ${liftTimeline.legY}px) rotateZ(${-liftTimeline.legRotate}deg)`,
                }}
              >
                <div
                  className="absolute left-0 top-[5px] w-0.5 h-[7px] rounded-[1px] origin-[1px_1px]"
                  style={{
                    backgroundColor: legColor,
                    transform: `rotateZ(${-liftTimeline.legRotateS}deg) rotateX(0deg)`,
                  }}
                />
              </div>
            </div>

            <div
              className="absolute top-[17px] left-0 w-6 h-0.5 rounded-[1px] transition-transform ease-out"
              style={{
                backgroundColor: weightBarColor,
                transform: `translateY(${liftTimeline.weightY}px)`,
              }}
            >
              <div
                className="absolute rounded-[1px] left-px top-[-2px] w-0.5 h-1.5"
                style={{
                  backgroundColor: weightDiskColor,
                  boxShadow: `20px 0 0 ${weightDiskColor}`,
                }}
              />
              <div
                className="absolute rounded-[1px] left-[3px] top-[-3px] w-0.5 h-2"
                style={{
                  backgroundColor: weightDiskColor,
                  boxShadow: `16px 0 0 ${weightDiskColor}`,
                }}
              />
            </div>
          </div>

          <div className="relative text-[var(--color)]">
            <span
              className="block whitespace-nowrap transition-all duration-300"
              style={{
                opacity: isComplete ? 0 : 1,
                transform: isComplete ? "translateX(-8px)" : "translateX(0px)",
              }}
            >
              {initialText}
            </span>
            <span
              className="block whitespace-nowrap transition-all duration-300 absolute left-0 top-0"
              style={{
                opacity: isComplete ? 1 : 0,
                transform: isComplete ? "translateX(0px)" : "translateX(8px)",
              }}
            >
              {completedText}
            </span>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {ripples.map((ripple) => (
              <div
                key={ripple.id}
                className="absolute rounded-full pointer-events-none bg-current opacity-0"
                style={{
                  top: ripple.y,
                  left: ripple.x,
                  width: "12px",
                  height: "12px",
                  transform: "translate(-50%, -50%)",
                  animation: "ripple-effect 0.5s ease-in forwards",
                  backgroundColor: "rgba(255, 255, 255, 0.2)"
                }}
              />
            ))}
          </div>
        </div>

        {confettis.map((c) => (
          <i
            key={c.id}
            className="absolute block w-1 h-1 top-1/2 left-1/2 -mt-0.5 -ml-0.5 pointer-events-none"
            style={{
              backgroundColor: c.b,
              transform: `translate(${c.x}, ${c.y}) scale(${c.s}) rotate(${c.r})`,
              transition: showConfettiAnim ? "transform 0.6s ease-out, opacity 0.6s ease-out" : "none",
              opacity: showConfettiAnim ? 0 : 1,
            }}
          />
        ))}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ripple-effect {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(30); opacity: 0; }
        }
      `}} />
    </div>
  );
}