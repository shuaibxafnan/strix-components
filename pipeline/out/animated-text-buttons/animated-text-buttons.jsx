export default function AnimatedTextButtons({
  primaryBg = "#275efe",
  primaryText = "#ffffff",
  darkBg = "#2F3545",
  darkText = "#ffffff",
  whiteBg = "#ffffff",
  whiteText = "#275efe",
  fontSize = "16px",
  letterSpacing = "0.5px",
  jumpingLabel = "Jumping",
  smokeLabel = "Smoke",
  driveLabel = "Drive",
  className = "",
}) {
  const renderLetters = (text) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="block [backface-visibility:hidden] not-italic"
        style={{
          "--d": `${(index + 1) / 20}s`,
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <div
      className={`w-full h-screen flex flex-col sm:flex-row gap-6 items-center justify-center overflow-hidden font-sans ${className}`}
    >
      <button
        className="group relative block outline-none border-0 font-medium rounded-[24px] cursor-pointer transition-all duration-500 ease-out select-none [box-shadow:0_2px_8px_-1px_rgba(39,94,254,0.32)] hover:[box-shadow:0_4px_20px_-2px_rgba(39,94,254,0.5)] hover:-translate-y-1"
        style={{
          padding: "16px 32px",
          fontSize: fontSize,
          lineHeight: fontSize,
          letterSpacing: letterSpacing,
          backgroundColor: primaryBg,
          color: primaryText,
          "--move-hover": "-4px",
          "--duration": "0.5s",
          "--shadow-active": "0 3px 1px rgba(0, 0, 0, 0.2)",
          "--move": "-4px",
        }}
      >
        <div className="flex group-hover:[&>span]:animate-[move_var(--duration)_linear_var(--d)]">
          {renderLetters(jumpingLabel)}
        </div>
      </button>

      <button
        className="group relative block outline-none border-0 font-medium rounded-[24px] cursor-pointer transition-all duration-500 ease-out select-none [box-shadow:0_2px_8px_-1px_rgba(21,25,36,0.32)] hover:[box-shadow:0_4px_20px_-2px_rgba(21,25,36,0.5)] hover:-translate-y-1"
        style={{
          padding: "16px 32px",
          fontSize: fontSize,
          lineHeight: fontSize,
          letterSpacing: letterSpacing,
          backgroundColor: darkBg,
          color: darkText,
          "--move": "12px",
          "--move-y": "-8px",
          "--blur": "4px",
        }}
      >
        <div className="flex group-hover:[&>span]:animate-[smoke_1s_linear_var(--d)]">
          {renderLetters(smokeLabel)}
        </div>
      </button>

      <button
        className="group relative block outline-none border-0 font-medium rounded-[24px] cursor-pointer transition-all duration-500 ease-out select-none [box-shadow:0_2px_8px_-1px_rgba(12,22,33,0.04)] hover:[box-shadow:0_4px_20px_-2px_rgba(12,22,33,0.12)] hover:-translate-y-1"
        style={{
          padding: "16px 32px",
          fontSize: fontSize,
          lineHeight: fontSize,
          letterSpacing: letterSpacing,
          backgroundColor: whiteBg,
          color: whiteText,
          "--move": "16px",
          "--skew": "25deg",
          "--skew-fast": "40deg",
          "--skew-bounce": "-12px",
        }}
      >
        <div className="flex group-hover:[&>span]:origin-[50%_100%] group-hover:[&>span]:animate-[drive_1s_linear_var(--d)]">
          {renderLetters(driveLabel)}
        </div>
      </button>

      <style>{`
        @keyframes move {
          40% {
            transform: translateY(var(--move));
            text-shadow: var(--shadow-active);
          }
        }

        @keyframes smoke {
          45%,
          55% {
            filter: blur(var(--blur));
          }
          50%,
          50.1% {
            opacity: 0;
          }
          25%,
          75% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(var(--move)) translateY(var(--move-y));
          }
          50.1% {
            transform: translateX(calc(var(--move) * -1));
          }
        }

        @keyframes drive {
          40% {
            opacity: 1;
          }
          55% {
            transform: skewX(var(--skew)) translateX(var(--move));
          }
          56% {
            transform: skewX(var(--skew-fast))
              translateX(calc(var(--move) * -1));
          }
          55%,
          56% {
            opacity: 0;
          }
          75% {
            transform: skewX(var(--skew));
          }
          85% {
            transform: skewX(var(--skew-bounce));
          }
        }
      `}</style>
    </div>
  );
}
