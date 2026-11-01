"use client";

import { useEffect, useRef, useState } from "react";

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
  toothColor = "#646B8C",
  trackColor = "#8A91B4",
  className = "",
}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleTriggerAction = (e) => {
    e.preventDefault();
    if (isCompressing) return;

    setIsCompressing(true);

    timerRef.current = setTimeout(() => {
      setIsCompressing(false);
    }, duration);
  };

  return (
    <div className={`w-full h-screen flex items-center justify-center selection:bg-transparent ${className}`}>
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

      <button
        onClick={handleTriggerAction}
        type="button"
        className="group relative flex border-none p-0 text-center font-semibold text-[14px] leading-6 rounded-[3px] select-none transition-transform duration-300 active:scale-[0.95] [webkit-tap-highlight-color:transparent]"
        style={{
          backgroundColor: backBgColor,
          color: textColor,
        }}
      >
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

          <div
          className={`relative z-10 py-[10px] px-0 rounded-[3px] origin-[50%_100%] transition-colors duration-400 ease-out shadow-[0_1px_2px_rgba(0,9,61,0.125),0_4px_7px_rgba(0,9,61,0.125)] overflow-hidden ${
            isCompressing
              ? "animate-fold-run"
              : "bg-[var(--fc-base)] hover:bg-[var(--fc-hover)]"
          }`}
          style={{
            width: btnWidth,
            "--fc-base": baseBgColor,
            "--fc-hover": hoverBgColor,
            backgroundColor: isCompressing ? baseBgColor : undefined,
          }}
        >
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

              <div
            className={`absolute w-full top-[4px] left-0 h-3 overflow-hidden opacity-0 pointer-events-none ${
              isCompressing ? "animate-zipper-run" : ""
            }`}
          >
                  <div
              className="absolute top-[1px] left-[1px] h-[3px] w-[2px] rounded-[1px]"
              style={{
                backgroundColor: toothColor,
                boxShadow:
                  `5px 0 0 ${toothColor}, 10px 0 0 ${toothColor}, 15px 0 0 ${toothColor}, 20px 0 0 ${toothColor}, 25px 0 0 ${toothColor}, 30px 0 0 ${toothColor}, 35px 0 0 ${toothColor}, 40px 0 0 ${toothColor}, 45px 0 0 ${toothColor}, 50px 0 0 ${toothColor}, 55px 0 0 ${toothColor}, 60px 0 0 ${toothColor}, 65px 0 0 ${toothColor}, 70px 0 0 ${toothColor}, 75px 0 0 ${toothColor}, 80px 0 0 ${toothColor}, 85px 0 0 ${toothColor}, 90px 0 0 ${toothColor}, 95px 0 0 ${toothColor}, 100px 0 0 ${toothColor}, 105px 0 0 ${toothColor}, 110px 0 0 ${toothColor}, 115px 0 0 ${toothColor}, 120px 0 0 ${toothColor}, 125px 0 0 ${toothColor}, 130px 0 0 ${toothColor}, 135px 0 0 ${toothColor}, 140px 0 0 ${toothColor}, 145px 0 0 ${toothColor}`,
              }}
            />
                  <div
              className="absolute top-[8px] left-[3px] h-[3px] w-[2px] rounded-[1px]"
              style={{
                backgroundColor: toothColor,
                boxShadow:
                  `5px 0 0 ${toothColor}, 10px 0 0 ${toothColor}, 15px 0 0 ${toothColor}, 20px 0 0 ${toothColor}, 25px 0 0 ${toothColor}, 30px 0 0 ${toothColor}, 35px 0 0 ${toothColor}, 40px 0 0 ${toothColor}, 45px 0 0 ${toothColor}, 50px 0 0 ${toothColor}, 55px 0 0 ${toothColor}, 60px 0 0 ${toothColor}, 65px 0 0 ${toothColor}, 70px 0 0 ${toothColor}, 75px 0 0 ${toothColor}, 80px 0 0 ${toothColor}, 85px 0 0 ${toothColor}, 90px 0 0 ${toothColor}, 95px 0 0 ${toothColor}, 100px 0 0 ${toothColor}, 105px 0 0 ${toothColor}, 110px 0 0 ${toothColor}, 115px 0 0 ${toothColor}, 120px 0 0 ${toothColor}, 125px 0 0 ${toothColor}, 130px 0 0 ${toothColor}, 135px 0 0 ${toothColor}, 140px 0 0 ${toothColor}, 145px 0 0 ${toothColor}`,
              }}
            />

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

                  <div
              className="h-[2px] my-[5px] mx-0 relative z-20"
              style={{
                backgroundColor: trackColor,
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
                      <div
                className="absolute right-0 w-1.5 h-[2px] rounded-[1px]"
                style={{ backgroundColor: lineSecondary }}
              />
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
