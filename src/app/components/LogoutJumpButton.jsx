"use client";

import { useState, useEffect, useRef } from "react";

// ─── LOGOUT BUTTON STATES CONFIGURATION ──────────────────────────────────────
const LOGOUT_BUTTON_STATES = {
  default: {
    "--figure-duration": "100",
    "--transform-figure": "none",
    "--walking-duration": "100",
    "--transform-arm1": "none",
    "--transform-wrist1": "none",
    "--transform-arm2": "none",
    "--transform-wrist2": "none",
    "--transform-leg1": "none",
    "--transform-calf1": "none",
    "--transform-leg2": "none",
    "--transform-calf2": "none",
  },
  hover: {
    "--figure-duration": "100",
    "--transform-figure": "translateX(1.5px)",
    "--walking-duration": "100",
    "--transform-arm1": "rotate(-5deg)",
    "--transform-wrist1": "rotate(-15deg)",
    "--transform-arm2": "rotate(5deg)",
    "--transform-wrist2": "rotate(6deg)",
    "--transform-leg1": "rotate(-10deg)",
    "--transform-calf1": "rotate(5deg)",
    "--transform-leg2": "rotate(20deg)",
    "--transform-calf2": "rotate(-20deg)",
  },
  walking1: {
    "--figure-duration": "300",
    "--transform-figure": "translateX(11px)",
    "--walking-duration": "300",
    "--transform-arm1": "translateX(-4px) translateY(-2px) rotate(120deg)",
    "--transform-wrist1": "rotate(-5deg)",
    "--transform-arm2": "translateX(4px) rotate(-110deg)",
    "--transform-wrist2": "rotate(-5deg)",
    "--transform-leg1": "translateX(-3px) rotate(80deg)",
    "--transform-calf1": "rotate(-30deg)",
    "--transform-leg2": "translateX(4px) rotate(-60deg)",
    "--transform-calf2": "rotate(20deg)",
  },
  walking2: {
    "--figure-duration": "400",
    "--transform-figure": "translateX(17px)",
    "--walking-duration": "300",
    "--transform-arm1": "rotate(60deg)",
    "--transform-wrist1": "rotate(-15deg)",
    "--transform-arm2": "rotate(-45deg)",
    "--transform-wrist2": "rotate(6deg)",
    "--transform-leg1": "rotate(-5deg)",
    "--transform-calf1": "rotate(10deg)",
    "--transform-leg2": "rotate(10deg)",
    "--transform-calf2": "rotate(-20deg)",
  },
  falling1: {
    "--figure-duration": "1600",
    "--walking-duration": "400",
    "--transform-arm1": "rotate(-60deg)",
    "--transform-wrist1": "none",
    "--transform-arm2": "rotate(30deg)",
    "--transform-wrist2": "rotate(120deg)",
    "--transform-leg1": "rotate(-30deg)",
    "--transform-calf1": "rotate(-20deg)",
    "--transform-leg2": "rotate(20deg)",
    "--transform-calf2": "none",
  },
  falling2: {
    "--figure-duration": "1600",
    "--walking-duration": "300",
    "--transform-arm1": "rotate(-100deg)",
    "--transform-wrist1": "none",
    "--transform-arm2": "rotate(-60deg)",
    "--transform-wrist2": "rotate(60deg)",
    "--transform-leg1": "rotate(80deg)",
    "--transform-calf1": "rotate(20deg)",
    "--transform-leg2": "rotate(-60deg)",
    "--transform-calf2": "none",
  },
  falling3: {
    "--figure-duration": "1600",
    "--walking-duration": "500",
    "--transform-arm1": "rotate(-30deg)",
    "--transform-wrist1": "rotate(40deg)",
    "--transform-arm2": "rotate(50deg)",
    "--transform-wrist2": "none",
    "--transform-leg1": "rotate(-30deg)",
    "--transform-calf1": "none",
    "--transform-leg2": "rotate(20deg)",
    "--transform-calf2": "none",
  },
};

// ─── LogoutJumpButton ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// variant             string     "dark" | "light"   Button theme style definition
// text                string     "Log Out"          Text displayed inside the button
// darkColor           string     "#1f2335"          Hex code for dark elements
// middleColor         string     "#4371f7"          Hex code for action elements (figure)
// lightColor          string     "#f4f7ff"          Hex code for light elements
// onLogout            function   undefined          Optional callback invoked when clicked
// ──────────────────────────────────────────────────────────────────────────

export default function LogoutJumpButton({
  variant = "dark",
  text = "Log Out",
  darkColor = "#1f2335",
  middleColor = "#4371f7",
  lightColor = "#f4f7ff",
  onLogout,
}) {
  const [mounted, setMounted] = useState(false);
  const [buttonState, setButtonState] = useState("default");
  const [isClicked, setIsClicked] = useState(false);
  const [isDoorSlammed, setIsDoorSlammed] = useState(false);
  const [isFalling, setIsFalling] = useState(false);

  const timeoutRefs = useRef([]);

  useEffect(() => {
    setMounted(true);
    return () => {
      // Clear timeouts on component unmount
      timeoutRefs.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  const handleMouseEnter = () => {
    if (buttonState === "default") {
      setButtonState("hover");
    }
  };

  const handleMouseLeave = () => {
    if (buttonState === "hover") {
      setButtonState("default");
    }
  };

  const handleClick = () => {
    if (buttonState !== "default" && buttonState !== "hover") return;

    if (onLogout) onLogout();

    setIsClicked(true);
    setButtonState("walking1");

    const t1 = setTimeout(() => {
      setIsDoorSlammed(true);
      setButtonState("walking2");

      const t2 = setTimeout(() => {
        setIsFalling(true);
        setButtonState("falling1");

        const t3 = setTimeout(() => {
          setButtonState("falling2");

          const t4 = setTimeout(() => {
            setButtonState("falling3");

            const t5 = setTimeout(() => {
              setIsClicked(false);
              setIsDoorSlammed(false);
              setIsFalling(false);
              setButtonState("default");
            }, 1000);

            timeoutRefs.current.push(t5);
          }, parseInt(LOGOUT_BUTTON_STATES["falling2"]["--walking-duration"]));

          timeoutRefs.current.push(t4);
        }, parseInt(LOGOUT_BUTTON_STATES["falling1"]["--walking-duration"]));

        timeoutRefs.current.push(t3);
      }, parseInt(LOGOUT_BUTTON_STATES["walking2"]["--figure-duration"]));

      timeoutRefs.current.push(t2);
    }, parseInt(LOGOUT_BUTTON_STATES["walking1"]["--figure-duration"]));

    timeoutRefs.current.push(t1);
  };

  if (!mounted) return null;

  // Resolve styles depending on variation color theme mapping
  const isLightTheme = variant === "light";
  const computedBtnBg = isLightTheme ? lightColor : darkColor;
  const computedTextCol = isLightTheme ? darkColor : lightColor;
  const computedDoorFill = isLightTheme ? darkColor : lightColor;

  const currentVars = LOGOUT_BUTTON_STATES[buttonState] || {};

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes logoutSpin {
          from { transform: rotate(0deg) scale(0.94); }
          to { transform: rotate(359deg) scale(0.94); }
        }
        @keyframes logoutShake {
          0% { transform: rotate(-1deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-1deg); }
        }
        @keyframes logoutFlash {
          0% { opacity: 0.4; }
          100% { opacity: 0; }
        }
        .animate-logout-spin { animation: logoutSpin 1000ms infinite linear; }
        .animate-logout-shake { animation: logoutShake 200ms linear; }
        .animate-logout-flash { animation: logoutFlash 300ms linear; }
      `,
        }}
      />

      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`
          bg-none border-0 block font-['Quicksand',sans-serif] text-[14px] font-medium h-[40px] 
          outline-none pl-[20px] pr-0 py-0 [perspective:100px] relative text-left w-[130px] 
          [-webkit-tap-highlight-color:transparent] select-none cursor-pointer group
          ${isFalling ? "animate-logout-shake" : ""}
        `}
        style={{
          color: computedTextCol,
          ...currentVars,
        }}
      >
        {/* Button Background layer ::before */}
        <span
          className={`
            absolute top-0 left-0 w-full h-full rounded-[5px] z-[2] transition-transform duration-[50ms] ease
            group-active:scale-[0.96]
            ${isClicked ? "group-active:scale-100" : ""}
          `}
          style={{ backgroundColor: computedBtnBg }}
        />

        {/* Dynamic Inner Button Label Text */}
        <span
          className="relative z-[10] font-medium"
          style={{ color: computedTextCol }}
        >
          {text}
        </span>

        {/* DOORWAY SVG Layer */}
        <svg
          className="block absolute bottom-[4px] right-[12px] w-[32px] z-[3]"
          viewBox="0 0 100 100"
          style={{ fill: computedDoorFill }}
        >
          <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
          <path
            className={`opacity-0 ${isFalling ? "animate-logout-flash" : ""}`}
            d="M40.5 43.7L26.6 31.4l-2.5 6.7zM41.9 50.4l-19.5-4-1.4 6.3zM40 57.4l-17.7 3.9 3.9 5.7z"
          />
        </svg>

        {/* CHARACTER FIGURE SVG Layer */}
        <svg
          className={`
            block absolute right-[18px] w-[30px] z-[4]
            ${isFalling ? "animate-logout-spin !bottom-[-1080px] opacity-0 !right-[1px] z-[1]" : "bottom-[5px]"}
          `}
          viewBox="0 0 100 100"
          style={{
            fill: middleColor,
            transform: "var(--transform-figure)",
            transitionProperty: "transform, bottom, opacity",
            transitionDuration: isFalling
              ? "calc(var(--figure-duration) * 1ms), calc(var(--figure-duration) * 1ms), calc(var(--figure-duration) * 0.25ms)"
              : "calc(var(--figure-duration) * 1ms)",
            transitionTimingFunction: isFalling
              ? "linear, cubic-bezier(0.7, 0.1, 1, 1), linear"
              : "cubic-bezier(0.2, 0.1, 0.80, 0.9)",
            transitionDelay: isFalling
              ? "0ms, 100ms, calc(var(--figure-duration) * 0.75ms)"
              : "0ms",
          }}
        >
          <circle cx="52.1" cy="32.4" r="6.4" />
          <path d="M50.7 62.8c-1.2 2.5-3.6 5-7.2 4-3.2-.9-4.9-3.5-4-7.8.7-3.4 3.1-13.8 4.1-15.8 1.7-3.4 1.6-4.6 7-3.7 4.3.7 4.6 2.5 4.3 5.4-.4 3.7-2.8 15.1-4.2 17.9z" />

          {/* ARM 1 */}
          <g
            className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[52%_45%]"
            style={{ transform: "var(--transform-arm1)" }}
          >
            <path d="M55.5 56.5l-6-9.5c-1-1.5-.6-3.5.9-4.4 1.5-1 3.7-1.1 4.6.4l6.1 10c1 1.5.3 3.5-1.1 4.4-1.5.9-3.5.5-4.5-.9z" />
            <path
              className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[59%_55%]"
              d="M69.4 59.9L58.1 58c-1.7-.3-2.9-1.9-2.6-3.7.3-1.7 1.9-2.9 3.7-2.6l11.4 1.9c1.7.3 2.9 1.9 2.6 3.7-.4 1.7-2 2.9-3.8 2.6z"
              style={{ transform: "var(--transform-wrist1)" }}
            />
          </g>

          {/* ARM 2 */}
          <g
            className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[47%_43%]"
            style={{ transform: "var(--transform-arm2)" }}
          >
            <path d="M34.2 43.6L45 40.3c1.7-.6 3.5.3 4 2 .6 1.7-.3 4-2 4.5l-10.8 2.8c-1.7.6-3.5-.3-4-2-.6-1.6.3-3.4 2-4z" />
            <path
              className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[35%_47%]"
              d="M27.1 56.2L32 45.7c.7-1.6 2.6-2.3 4.2-1.6 1.6.7 2.3 2.6 1.6 4.2L33 58.8c-.7 1.6-2.6 2.3-4.2 1.6-1.7-.7-2.4-2.6-1.7-4.2z"
              style={{ transform: "var(--transform-wrist2)" }}
            />
          </g>

          {/* LEG 1 */}
          <g
            className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[47%_64.5%]"
            style={{ transform: "var(--transform-leg1)" }}
          >
            <path d="M52.1 73.2s-7-5.7-7.9-6.5c-.9-.9-1.2-3.5-.1-4.9 1.1-1.4 3.8-1.9 5.2-.9l7.9 7c1.4 1.1 1.7 3.5.7 4.9-1.1 1.4-4.4 1.5-5.8.4z" />
            <path
              className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[55.5%_71.5%]"
              d="M52.6 84.4l-1-12.8c-.1-1.9 1.5-3.6 3.5-3.7 2-.1 3.7 1.4 3.8 3.4l1 12.8c.1 1.9-1.5 3.6-3.5 3.7-2 0-3.7-1.5-3.8-3.4z"
              style={{ transform: "var(--transform-calf1)" }}
            />
          </g>

          {/* LEG 2 */}
          <g
            className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[43%_63%]"
            style={{ transform: "var(--transform-leg2)" }}
          >
            <path d="M37.8 72.7s1.3-10.2 1.6-11.4 2.4-2.8 4.1-2.6c1.7.2 3.6 2.3 3.4 4l-1.8 11.1c-.2 1.7-1.7 3.3-3.4 3.1-1.8-.2-4.1-2.4-3.9-4.2z" />
            <path
              className="transition-transform ease-in-out duration-[calc(var(--walking-duration)*1ms)] origin-[41.5%_73%]"
              d="M29.5 82.3l9.6-10.9c1.3-1.4 3.6-1.5 5.1-.1 1.5 1.4.4 4.9-.9 6.3l-8.5 9.6c-1.3 1.4-3.6 1.5-5.1.1-1.4-1.3-1.5-3.5-.2-5z"
              style={{ transform: "var(--transform-calf2)" }}
            />
          </g>
        </svg>

        {/* 3D DOOR SVG Layer */}
        <svg
          className="block absolute bottom-[4px] right-[12px] w-[32px] z-[5] [transform-style:preserve-3d] origin-right transition-transform ease duration-200"
          viewBox="0 0 100 100"
          style={{
            fill: computedDoorFill,
            transform: isClicked
              ? "rotateY(35deg)"
              : isDoorSlammed
                ? "none"
                : "rotateY(20deg)",
            // Keep style transition overwrites safely matching original scss delays
            transition: isDoorSlammed
              ? "transform 100ms ease-in 250ms"
              : "transform 200ms ease",
          }}
        >
          <path
            d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z"
            style={{ fill: middleColor, stroke: middleColor, strokeWidth: 4 }}
          />
          <circle cx="66" cy="50" r="3.7" />
        </svg>
      </button>
    </>
  );
}
