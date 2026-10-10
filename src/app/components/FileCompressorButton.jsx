"use client";

import { useEffect, useState } from "react";

// ─── FileCompressorButton ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// initialText      string   "Compress files"   Default text displayed inside the node
// completedText    string   "Compressed"       Text displayed when animation resolves
// duration         number   4000               Reset cycle delay timeout window (ms)
// btnWidth         string   "152px"            Static button cross-axis width constraint
// baseBgColor      string   "#404660"          Idle button inner sheet face color
// hoverBgColor     string   "#3A4059"          Hover microstate background value
// backBgColor      string   "#1E2235"          Underlay canvas platform base tray
// textColor        string   "#F6F8FF"          Copy typography fill tone
// paperColor       string   "#F6F8FF"          Dropping paper vector canvas fill
// lineSecondary    string   "#D1D6EE"          Paper line rules horizontal strokes
// zipperColor      string   "#BBC1E1"          Zipper toggle node anchor face
// ──────────────────────────────────────────────────────────────────────────

export default function FileCompressorButton({
  initialText = "Compress files",
  completedText = "Compressed",
  duration = 4000,
  btnWidth = "152px",
  baseBgColor = "#404660",
  hoverBgColor = "#3A4059",
  backBgColor = "#1E2235",
  textColor = "#F6F8FF",
  paperColor = "#F6F8FF",
  lineSecondary = "#D1D6EE",
  zipperColor = "#BBC1E1",
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Isolate viewport mounts to shield against SSR/Hydration structural drift
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTriggerAction = (e) => {
    e.preventDefault();
    if (isCompressing) return;

    setIsCompressing(true);

    // Timeout duration cycle triggers recovery normalization
    setTimeout(() => {
      setIsCompressing(false);
    }, duration);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#E1E6F9] font-sans antialiased selection:bg-transparent" />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#E1E6F9] font-sans antialiased selection:bg-transparent">
      {/* Global CSS Injector for Keyframes Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes custom-paper {
          0%, 5% { transform: translate(var(--tw-paper-x, 0px), var(--tw-paper-y, -68px)); }
          10%, 100% { opacity: 1; }
          30% { transform: translate(0px, 1px); }
          50%, 70% { transform: translate(0px, -3px); }
          95%, 100% { transform: translate(0px, 4px); }
        }
        @keyframes custom-fold {
          10%, 80% { transform: perspective(500px) rotateX(-20deg) translateZ(16px); }
        }
        @keyframes custom-zipper {
          0%, 10% { opacity: 0; }
          20%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-paper-run { animation: custom-paper 1.8s linear forwards; }
        .animate-fold-run { animation: custom-fold 1.8s linear forwards; }
        .animate-zipper-run { animation: custom-zipper 3.5s linear forwards; }
      `,
        }}
      />

      {/* Main Structural Functional Button Module */}
      <button
        onClick={handleTriggerAction}
        type="button"
        className="group relative flex border-none p-0 text-center font-semibold text-[14px] leading-6 rounded-[3px] select-none transition-transform duration-300 active:scale-[0.95] [webkit-tap-highlight-color:transparent]"
        style={{
          backgroundColor: backBgColor,
          color: textColor,
        }}
      >
        {/* Left Falling Paper Layer */}
        <div
          className={`absolute pointer-events-none w-6.5 h-8 -top-0.5 left-1/4 -ml-3.25 rounded-[3px] opacity-0 shadow-[0_1px_1px_rgba(0,9,61,0.15)] ${
            isCompressing ? "animate-paper-run" : ""
          }`}
          style={{
            backgroundColor: paperColor,
            "--tw-paper-x": "-12px",
            "--tw-paper-y": "-52px",
          }}
        >
          <span
            className="absolute left-[4px] top-[6px] w-[18px] h-[2px] rounded-[1px]"
            style={{
              backgroundColor: lineSecondary,
              boxShadow: `0 6px 0 ${lineSecondary}, 0 12px 0 ${lineSecondary}, 0 18px 0 ${lineSecondary}`,
            }}
          />
        </div>

        {/* Middle Falling Paper Layer */}
        <div
          className={`absolute pointer-events-none w-[26px] h-[32px] top-[-2px] left-1/2 ml-[-13px] rounded-[3px] opacity-0 shadow-[0_1px_1px_rgba(0,9,61,0.15)] ${
            isCompressing ? "animate-paper-run" : ""
          }`}
          style={{
            backgroundColor: paperColor,
            "--tw-paper-x": "0px",
            "--tw-paper-y": "-68px",
          }}
        >
          <span
            className="absolute left-[4px] top-[6px] w-[18px] h-[2px] rounded-[1px]"
            style={{
              backgroundColor: lineSecondary,
              boxShadow: `0 6px 0 ${lineSecondary}, 0 12px 0 ${lineSecondary}, 0 18px 0 ${lineSecondary}`,
            }}
          />
        </div>

        {/* Right Falling Paper Layer */}
        <div
          className={`absolute pointer-events-none w-[26px] h-[32px] top-[-2px] left-[75%] ml-[-13px] rounded-[3px] opacity-0 shadow-[0_1px_1px_rgba(0,9,61,0.15)] ${
            isCompressing ? "animate-paper-run" : ""
          }`}
          style={{
            backgroundColor: paperColor,
            "--tw-paper-x": "12px",
            "--tw-paper-y": "-52px",
          }}
        >
          <span
            className="absolute left-[4px] top-[6px] w-[18px] h-[2px] rounded-[1px]"
            style={{
              backgroundColor: lineSecondary,
              boxShadow: `0 6px 0 ${lineSecondary}, 0 12px 0 ${lineSecondary}, 0 18px 0 ${lineSecondary}`,
            }}
          />
        </div>

        {/* Inner Mechanics Platform Box */}
        <div
          className={`relative z-10 py-[10px] px-0 rounded-[3px] origin-[50%_100%] transition-colors duration-400 ease-out shadow-[0_1px_2px_rgba(0,9,61,0.125),0_4px_7px_rgba(0,9,61,0.125)] overflow-hidden ${
            isCompressing
              ? "animate-fold-run"
              : "bg-[#404660] hover:bg-[#3A4059]"
          }`}
          style={{
            width: btnWidth,
            backgroundColor: isCompressing ? baseBgColor : undefined,
          }}
        >
          {/* Primary Text Copy Layer */}
          <span
            className="block transition-all duration-300 ease-out"
            style={{
              opacity: isCompressing ? 0 : 1,
              transform: isCompressing ? "translateY(8px)" : "translateY(0px)",
              transitionDelay: isCompressing ? "0s" : "0.5s",
            }}
          >
            {isCompressing ? completedText : initialText}
          </span>

          {/* Action Success Vector Check-Mark */}
          <svg
            className="absolute top-[14px] left-1/2 ml-[-10px] w-5 h-4 fill-none stroke-[2px] stroke-round join-round transition-all duration-400 ease-out"
            viewBox="0 0 20 16"
            style={{
              stroke: textColor,
              opacity: isCompressing ? 1 : 0,
              transform: isCompressing ? "scale(1)" : "scale(0.5)",
              transitionDelay: isCompressing ? "3.2s" : "0s",
            }}
          >
            <polyline points="3 8.75 7.75 13.5 17 2.5" />
          </svg>

          {/* Dynamic Zipper Interlocking Mechanism Wrapper */}
          <div
            className={`absolute w-full top-[4px] left-0 h-3 overflow-hidden opacity-0 pointer-events-none ${
              isCompressing ? "animate-zipper-run" : ""
            }`}
          >
            {/* Upper Teeth Row */}
            <div
              className="absolute top-[1px] left-[1px] h-[3px] w-[2px] rounded-[1px]"
              style={{
                backgroundColor: "#646B8C",
                boxShadow:
                  "5px 0 0 #646B8C, 10px 0 0 #646B8C, 15px 0 0 #646B8C, 20px 0 0 #646B8C, 25px 0 0 #646B8C, 30px 0 0 #646B8C, 35px 0 0 #646B8C, 40px 0 0 #646B8C, 45px 0 0 #646B8C, 50px 0 0 #646B8C, 55px 0 0 #646B8C, 60px 0 0 #646B8C, 65px 0 0 #646B8C, 70px 0 0 #646B8C, 75px 0 0 #646B8C, 80px 0 0 #646B8C, 85px 0 0 #646B8C, 90px 0 0 #646B8C, 95px 0 0 #646B8C, 100px 0 0 #646B8C, 105px 0 0 #646B8C, 110px 0 0 #646B8C, 115px 0 0 #646B8C, 120px 0 0 #646B8C, 125px 0 0 #646B8C, 130px 0 0 #646B8C, 135px 0 0 #646B8C, 140px 0 0 #646B8C, 145px 0 0 #646B8C",
              }}
            />
            {/* Lower Teeth Row */}
            <div
              className="absolute top-[8px] left-[3px] h-[3px] w-[2px] rounded-[1px]"
              style={{
                backgroundColor: "#646B8C",
                boxShadow:
                  "5px 0 0 #646B8C, 10px 0 0 #646B8C, 15px 0 0 #646B8C, 20px 0 0 #646B8C, 25px 0 0 #646B8C, 30px 0 0 #646B8C, 35px 0 0 #646B8C, 40px 0 0 #646B8C, 45px 0 0 #646B8C, 50px 0 0 #646B8C, 55px 0 0 #646B8C, 60px 0 0 #646B8C, 65px 0 0 #646B8C, 70px 0 0 #646B8C, 75px 0 0 #646B8C, 80px 0 0 #646B8C, 85px 0 0 #646B8C, 90px 0 0 #646B8C, 95px 0 0 #646B8C, 100px 0 0 #646B8C, 105px 0 0 #646B8C, 110px 0 0 #646B8C, 115px 0 0 #646B8C, 120px 0 0 #646B8C, 125px 0 0 #646B8C, 130px 0 0 #646B8C, 135px 0 0 #646B8C, 140px 0 0 #646B8C, 145px 0 0 #646B8C",
              }}
            />

            {/* Gradient Background Reveal Mask */}
            <div
              className="absolute top-0 bottom-0 w-[200%] right-0 z-10 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-current)] [background-size:300%_100%]"
              style={{
                transition: isCompressing
                  ? "background-position 1.2s ease 1.8s"
                  : "background-position 0s",
                backgroundPositionX: isCompressing ? "0%" : "100%",
                "--bg-current": baseBgColor,
              }}
            />

            {/* Moving Zipper Slider and Line (Animate Left to Right) */}
            <div
              className="h-[2px] my-[5px] mx-0 relative z-20"
              style={{
                backgroundColor: "#8A91B4",
                width: btnWidth,
                left: `calc((${btnWidth} * -1) + 12px)`,
                transition: isCompressing
                  ? "transform 1.2s linear 1.8s"
                  : "transform 0s",
                transform: isCompressing
                  ? `translateX(calc(${btnWidth} - 12px))`
                  : "translateX(0px)",
              }}
            >
              {/* Slider Base Cap Block */}
              <div
                className="absolute right-0 w-1.5 h-[2px] rounded-[1px]"
                style={{ backgroundColor: lineSecondary }}
              />
              {/* Triangular Wedge Pull Tab */}
              <div
                className="absolute right-[-7px] w-2 h-2 rounded-[1px] [clip-path:polygon(0_0,100%_0,0_100%)] origin-center -translate-y-3/4 scale-y-[0.6] -rotate-45"
                style={{ backgroundColor: zipperColor }}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
