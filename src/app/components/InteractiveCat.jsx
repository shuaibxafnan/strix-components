"use client";

import { useEffect, useId, useRef } from "react";

// ─── Cat ───────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #f5b400    Page background behind the cat
// catColor         string   #000       Body / face / whiskers / ears / tail color
// collarColor      string   #f00       Red collar stripe under the chin
// tagColor         string   #fb0       Round collar tag color
// earColor         string   #f30       Inner-ear triangle color
// eyeColor         string   #fff       Eye-white (sclera) color
// pupilColor       string   #000       Pupil color
// fontSize         string   16px       Base em-unit — scales the WHOLE cat
// swingDuration    number   2          Body swing/bob loop duration (s)
// swingAngle       number   3          Body rotateZ amplitude (deg)
// bobAmount        number   6          Vertical bob travel at swing extremes (px)
// blurAmount       number   1          Motion blur at swing extremes (px)
// trackMouse       boolean  true       Whether pupils follow the cursor
// pupilMaxTravel   number   0          Max pupil offset in px (0 = auto from eye size)
// ──────────────────────────────────────────────────────────────────────────

export default function InteractiveCat({
  bgColor = "#f5b400",
  catColor = "#000",
  collarColor = "#f00",
  tagColor = "#fb0",
  earColor = "#f30",
  eyeColor = "#fff",
  pupilColor = "#000",
  fontSize = "16px",
  swingDuration = 2,
  swingAngle = 3,
  bobAmount = 6,
  blurAmount = 1,
  trackMouse = true,
  pupilMaxTravel = 0,
}) {
  const eyesRef = useRef(null);
  const pupilsRef = useRef(null);

  const scope = "cat-" + useId().replace(/:/g, "");
  const sel = "." + scope + " ";
  const kf = "swing-" + scope;

  useEffect(() => {
    if (!trackMouse) return;
    const eyes = eyesRef.current;
    const pupil = pupilsRef.current;
    if (!eyes || !pupil) return;

    const handleMove = (event) => {
      const rect = eyes.getBoundingClientRect();
      const eyesX = rect.left + rect.width / 2;
      const eyesY = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - eyesY, event.clientX - eyesX);
      const distance =
        pupilMaxTravel > 0
          ? pupilMaxTravel
          : Math.min(rect.width / 4, rect.height / 4);
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;
      pupil.style.transform =
        "translate(-50%, -50%) translate(" + px + "px, " + py + "px)";
    };

    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, [trackMouse, pupilMaxTravel]);

  const cssVars = {
    "--catColor": catColor,
    "--collarColor": collarColor,
    "--tagColor": tagColor,
    "--earColor": earColor,
    "--eyeColor": eyeColor,
    "--pupilColor": pupilColor,
    "--swingDuration": swingDuration + "s",
    "--swingAngle": swingAngle + "deg",
    "--bobAmount": bobAmount + "px",
    "--blurAmount": blurAmount + "px",
    fontSize: fontSize,
  };

  const css = [
    sel + ".cat {",
    "  background-color: var(--catColor);",
    "  height: 5em;",
    "  width: 12.5em;",
    "  position: absolute;",
    "  transform: translateX(-50%);",
    "  left: 50%;",
    "  top: 18.75em;",
    "  border-radius: 0 2.18em 0 0;",
    "  transform-origin: bottom;",
    "  animation: " + kf + " var(--swingDuration) infinite alternate;",
    "}",
    sel + ".cat::before {",
    '  content: "";',
    "  position: absolute;",
    "  height: 1.87em;",
    "  width: 1.75em;",
    "  background-color: var(--catColor);",
    "  border-radius: 0 0 1.25em 1.25em;",
    "  bottom: -1.18em;",
    "  box-shadow: 3.75em 0 var(--catColor), 7.18em 0 var(--catColor), 10.75em 0 var(--catColor);",
    "}",
    sel + ".cat::after {",
    '  content: "";',
    "  position: absolute;",
    "  height: 3.25em;",
    "  width: 7.5em;",
    "  background: linear-gradient(var(--collarColor) 1.87em, var(--catColor) 1.87em);",
    "  bottom: 4.93em;",
    "}",
    sel + ".face {",
    "  position: absolute;",
    "  background-color: var(--catColor);",
    "  height: 7.5em;",
    "  width: 15em;",
    "  bottom: 8.18em;",
    "  left: -3.62em;",
    "  border-radius: 3.75em;",
    "}",
    sel + ".face::before {",
    "  position: absolute;",
    '  content: "";',
    "  height: 3.75em;",
    "  width: 5em;",
    "  background-color: var(--eyeColor);",
    "  border-radius: 1.87em;",
    "  left: 1.87em;",
    "  top: 1.56em;",
    "  box-shadow: 6.25em 0 var(--eyeColor);",
    "}",
    sel + ".eyes {",
    "  height: 50px;",
    "}",
    sel + ".pupils {",
    "  position: absolute;",
    "  top: 3.48em;",
    "  left: 4.36em;",
    "  transform: translate(-50%, -50%);",
    "  height: 2.5em;",
    "  width: 1.56em;",
    "  background-color: var(--pupilColor);",
    "  box-shadow: 6.25em 0 var(--pupilColor);",
    "  border-radius: 50%;",
    "}",
    sel +
      ".whiskers, " +
      sel +
      ".whiskers::before, " +
      sel +
      ".whiskers::after {",
    "  position: absolute;",
    "  height: 0.62em;",
    "  width: 18.75em;",
    "  background-color: var(--catColor);",
    "  border-radius: 0.31em;",
    "}",
    sel + ".whiskers {",
    "  bottom: 12em;",
    "  left: -5.5em;",
    "}",
    sel + ".whiskers::before {",
    '  content: "";',
    "  transform: rotate(14deg);",
    "}",
    sel + ".whiskers::after {",
    '  content: "";',
    "  transform: rotate(-14deg);",
    "}",
    sel + ".ear-l {",
    "  height: 0;",
    "  width: 0;",
    "  border-bottom: 3.12em solid var(--catColor);",
    "  border-left: 1.56em solid transparent;",
    "  border-right: 1.56em solid transparent;",
    "  position: absolute;",
    "  bottom: 7.37em;",
    "  left: 3.12em;",
    "}",
    sel + ".ear-r {",
    "  height: 0;",
    "  width: 0;",
    "  border-bottom: 3.12em solid var(--catColor);",
    "  border-right: 1.56em solid transparent;",
    "  border-left: 1.56em solid transparent;",
    "  position: absolute;",
    "  bottom: 7.37em;",
    "  left: 8.75em;",
    "}",
    sel + ".ear-l::before, " + sel + ".ear-r::before {",
    "  position: absolute;",
    '  content: "";',
    "  height: 0;",
    "  width: 0;",
    "  border-bottom: 1.37em solid var(--earColor);",
    "  border-left: 0.75em solid transparent;",
    "  border-right: 0.75em solid transparent;",
    "  left: -0.68em;",
    "  top: 1.56em;",
    "}",
    sel + ".tag {",
    "  position: absolute;",
    "  height: 1.87em;",
    "  width: 1.87em;",
    "  background-color: var(--tagColor);",
    "  border-radius: 50%;",
    "  z-index: 1;",
    "  bottom: 4.43em;",
    "  left: 2.81em;",
    "}",
    sel + ".tail {",
    "  position: absolute;",
    "  left: 9.4em;",
    "  bottom: 0.6em;",
    "  width: 4em;",
    "  height: 7.3em;",
    "  overflow: visible;",
    "}",
    sel + ".tail path {",
    "  stroke: var(--catColor);",
    "}",
    "@keyframes " + kf + " {",
    "  0% { transform: rotateZ(0deg) translateY(var(--bobAmount)); filter: blur(var(--blurAmount)); }",
    "  25% { transform: rotateZ(var(--swingAngle)); filter: blur(0px); }",
    "  50% { transform: rotateZ(0deg) translateY(calc(-1 * var(--bobAmount))); filter: blur(var(--blurAmount)); }",
    "  75% { transform: rotateZ(calc(-1 * var(--swingAngle))); filter: blur(0px); }",
    "  100% { transform: rotateZ(0deg) translateY(var(--bobAmount)); filter: blur(var(--blurAmount)); }",
    "}",
  ].join("\n");

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        className={scope + " relative w-[30.25em] h-[30.25em]"}
        style={cssVars}
      >
        <div className="cat">
          <div className="whiskers" />
          <div className="face">
            <div className="eyes" ref={eyesRef}>
              <div className="pupils" ref={pupilsRef} />
            </div>
            <div className="ear-l" />
            <div className="ear-r" />
          </div>
          <div className="tag" />
          <svg
            className="tail"
            viewBox="0 0 120 220"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M45,210 C35,150 30,120 55,95 C78,72 98,82 92,108 C89,122 77,121 73,109"
              fill="none"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
