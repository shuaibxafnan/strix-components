"use client";

import { useEffect, useId, useRef } from "react";

function buildCss(scope, p) {
  const persp = p.perspectiveVh / p.sceneScale;
  const left = -((p.gridSpread - 100) / 2);
  const width = p.gridSpread / p.sceneScale;
  const height = 100 / p.sceneScale;
  const line =
    "color-mix(in srgb, " +
    p.gridColor +
    " " +
    p.gridLineOpacity * 100 +
    "%, transparent)";

  const aFade = "swFade_" + scope;
  const aIntro = "swIntro_" + scope;
  const aScroll = "swScroll_" + scope;
  const aHover = "swHover_" + scope;

  const s = "." + scope + " ";

  return [

    s + ".sw-scene{position:relative;width:100%;height:100%;overflow:hidden}",

    s +
      ".sw-frame{position:absolute;inset:0;width:100%;height:100%;opacity:0;" +
      "will-change:opacity,transform;animation:" +
      aFade +
      " " +
      p.introDuration +
      "s ease-in-out forwards}",

    s +
      ".sw-persp{position:absolute;bottom:0;left:" +
      left +
      "%;width:" +
      width +
      "%;height:" +
      height +
      "%;perspective:" +
      persp +
      "vh;perspective-origin:50% 100%;" +
      "transform:scaleX(" +
      p.sceneScale +
      ") scaleY(" +
      p.sceneScale +
      ");" +
      "transform-origin:0% 100%;will-change:perspective-origin;animation:" +
      aIntro +
      " " +
      p.introDuration +
      "s ease-in-out forwards}",

    s +
      ".sw-grid{position:absolute;inset:0;width:100%;height:100%;" +
      "transform:rotateX(" +
      p.gridTilt +
      "deg);transform-origin:50% 100%}",

    s +
      ".sw-gridx{position:absolute;inset:0;width:100%;height:100%;" +
      "background-repeat:repeat;background-position:50% 50%;background-size:" +
      p.gridSizeX +
      "% " +
      p.gridSizeY +
      "%;" +
      "background-image:linear-gradient(to left," +
      line +
      " 2px,transparent 2px)}",

    s +
      ".sw-gridy{position:absolute;inset:0;width:100%;height:100%;" +
      "background-repeat:repeat;background-position:50% 50%;background-size:" +
      p.gridSizeX +
      "% " +
      p.gridSizeY +
      "%;" +
      "background-image:linear-gradient(to top," +
      line +
      " 1px,transparent 1px);" +
      "will-change:transform;animation:" +
      aScroll +
      " " +
      p.gridSpeed +
      "s linear infinite}",

    s +
      ".sw-cover-frame{position:absolute;bottom:-1%;left:-50%;width:200%;height:101%;" +
      "pointer-events:none;background:linear-gradient(to bottom,transparent 0%," +
      p.horizonColor +
      " 50%,transparent 75%," +
      p.bgColor +
      " 100%)}",

    s +
      ".sw-overlay{position:absolute;inset:0;z-index:20;display:flex;" +
      "align-items:center;justify-content:center}",
    s +
      ".sw-body{will-change:transform;opacity:0;" +
      "animation:" +
      aFade +
      " " +
      p.introDuration +
      "s ease-in-out forwards," +
      aHover +
      " " +
      p.hoverDuration +
      "s ease-in-out infinite}",

    s +
      ".sw-cover-scene{position:absolute;bottom:-1%;left:0;width:100%;height:101%;" +
      "z-index:30;pointer-events:none;background-repeat:repeat;background-position:50% 50%;" +
      "background-size:100% 2px;background-image:linear-gradient(to top," +
      p.scanlineColor +
      " 1px,transparent 1px)}",

    "@keyframes " + aFade + "{0%{opacity:0}100%{opacity:1}}",
    "@keyframes " +
      aIntro +
      "{0%{perspective-origin:50% 100%}100%{perspective-origin:50% 50%}}",
    "@keyframes " +
      aScroll +
      "{0%{transform:translateY(-" +
      p.gridSizeY +
      "%)}100%{transform:translateY(0)}}",
    "@keyframes " +
      aHover +
      "{0%{transform:translateY(0)}25%{transform:translateY(1%)}" +
      "50%{transform:translateY(0)}75%{transform:translateY(1.6%)}" +
      "100%{transform:translateY(0)}}",

    "@media (prefers-reduced-motion:reduce){" +
      s +
      ".sw-gridy{animation:none}" +
      s +
      ".sw-body{animation:" +
      aFade +
      " 0.6s ease-in-out forwards}}",
  ].join("\n");
}

export default function SynthwaveHero({
  bgColor = "#222",
  gridColor = "#e6175d",
  gridLineOpacity = 0.2,
  horizonColor = "#e6175d",
  scanlineColor = "#222",
  textColor = "#ffffff",
  sceneScale = 4,
  gridSpread = 440,
  gridTilt = 60,
  perspectiveVh = 20,
  gridSizeX = 8,
  gridSizeY = 20,
  gridSpeed = 0.5,
  introDuration = 3.6,
  hoverDuration = 3.6,
  showScanlines = true,
  showHorizonGlow = true,
  enableTilt = true,
  tiltStrength = 8,
  gridParallax = 4,
  centerText = "SYNTHWAVE",
  centerContent = null,
  className = "",
}) {
  const scope = "sw-" + useId().replace(/:/g, "");

  const frameRef = useRef(null);
  const overlayRef = useRef(null);
  const gridXRef = useRef(null);

  useEffect(() => {
    if (!enableTilt) return undefined;

    let active = true;
    let cleanup = () => {};

    import("gsap")
      .then((mod) => {
        if (!active) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap || !frameRef.current) return;

        const rotFrame = gsap.quickTo(frameRef.current, "rotation", {
          duration: 0.6,
          ease: "power2.out",
        });
        const rotOverlay = overlayRef.current
          ? gsap.quickTo(overlayRef.current, "rotation", {
              duration: 0.6,
              ease: "power2.out",
            })
          : null;
        const shiftGrid = gridXRef.current
          ? gsap.quickTo(gridXRef.current, "xPercent", {
              duration: 0.8,
              ease: "power2.out",
            })
          : null;

        const apply = (ratio) => {
          rotFrame(ratio * tiltStrength);
          if (rotOverlay) rotOverlay(ratio * tiltStrength * 0.125);
          if (shiftGrid) shiftGrid(ratio * gridParallax);
        };

        const onMouse = (e) => {
          const cx = window.innerWidth / 2;
          apply((e.clientX - cx) / cx);
        };
        const onTilt = (e) => {
          apply(Math.max(-1, Math.min(1, (e.gamma || 0) / 45)));
        };

        window.addEventListener("mousemove", onMouse, { passive: true });
        window.addEventListener("deviceorientation", onTilt, { passive: true });

        cleanup = () => {
          window.removeEventListener("mousemove", onMouse);
          window.removeEventListener("deviceorientation", onTilt);
        };
      })
      .catch((err) =>
        console.error("[SynthwaveScene] GSAP load failed:", err.message),
      );

    return () => {
      active = false;
      cleanup();
    };
  }, [enableTilt, tiltStrength, gridParallax]);

  const css = buildCss(scope, {
    bgColor,
    gridColor,
    gridLineOpacity,
    horizonColor,
    scanlineColor,
    sceneScale,
    gridSpread,
    gridTilt,
    perspectiveVh,
    gridSizeX,
    gridSizeY,
    gridSpeed,
    introDuration,
    hoverDuration,
  });

  return (
    <div
      className={scope + " relative w-full h-screen overflow-hidden " + className}
      style={{ backgroundColor: bgColor }}
    >
      <style>{css}</style>

      <div className="sw-scene">
        <div ref={frameRef} className="sw-frame">
          <div className="sw-persp">
            <div className="sw-grid">
              <div ref={gridXRef} className="sw-gridx" />
              <div className="sw-gridy" />
            </div>
          </div>
          {showHorizonGlow && <div className="sw-cover-frame" />}
        </div>

        <div ref={overlayRef} className="sw-overlay">
          <div className="sw-body">
            {centerContent ?? (
              <span
                className="font-extrabold uppercase leading-none tracking-[0.08em] text-[14vmin]"
                style={{
                  color: textColor,
                  textShadow:
                    "0 0 8px " +
                    gridColor +
                    ", 0 0 24px " +
                    gridColor +
                    ", 0 0 48px " +
                    gridColor,
                }}
              >
                {centerText}
              </span>
            )}
          </div>
        </div>

        {showScanlines && <div className="sw-cover-scene" />}
      </div>
    </div>
  );
}
