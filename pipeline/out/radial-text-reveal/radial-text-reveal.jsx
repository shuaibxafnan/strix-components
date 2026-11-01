"use client";

export default function RadialTextReveal({
  content = (
    <>
      Craft high-impact web experiences with text that glows into view.
      <br />
      <br />
      A soft radial light sweeps upward and reveals every line.
    </>
  ),
  duration = 1.8,
  delay = 0.5,
  color = "hsla(280, 80%, 50%, 0.5)",
  theme = "system",
  fontFamily = "'Inter', sans-serif",
  fontSize = "1.25rem",
  textColor,
  width = "50ch",
  className = "",
}) {
  const cssVars = {
    "--duration": duration,
    "--delay": delay,
    "--color": color,

    "--start-mask": -70,
    "--end-mask": 0,
    "--start-bg": 132,
    "--end-bg": 16,
  };

  const schemeClass =
    theme === "light"
      ? "[color-scheme:light]"
      : theme === "dark"
        ? "[color-scheme:dark]"
        : "[color-scheme:light_dark]";

  return (
    <div
      className={`w-full h-screen flex items-center justify-center ${schemeClass} ${className}`}
      style={{
        ...cssVars,
        fontFamily,
        fontSize,
        ...(textColor && { color: textColor }),
      }}
    >
      <style>{`
        @property --progress {
          initial-value: 0;
          syntax: '<number>';
          inherits: true;
        }

        @keyframes tr-reveal {
          0%   { --progress: 0; animation-timing-function: ease-in; }
          40%  { --progress: 1; animation-timing-function: ease-out; }
          90%, 100% { --progress: 2; }
        }
        @keyframes tr-compress {
          40%  { transform: translateY(var(--movement, 0)); }
          50%  { line-height: var(--compression, 1.5); }
          75%  { transform: translateY(0); }
          100% { line-height: 1.5; }
        }

        .tr-hide {
          animation:
            tr-reveal   calc(var(--duration) * 1s) calc(var(--delay) * 1s) ease-in both,
            tr-compress calc(var(--duration) * 0.5s)
              calc((var(--delay) * 1s) + (var(--duration) * 0.44s)) ease-in-out both;
        }
        .tr-hide .tr-content {
          filter: blur(4px);
          background:
            radial-gradient(
              180cqmax 180cqmax at 50%
                calc(
                  (var(--start-bg) * 1cqmax) -
                  (clamp(0, var(--progress), 1) *
                    ((var(--start-bg) - var(--end-bg)) * 1cqmax))
                ),
              var(--color) 25%,
              canvasText,
              #0000
            )
            50% 50% / 100% 100% no-repeat;
          color: #0000;
          background-clip: text;
          mask-image:
            radial-gradient(
              180cqmax 180cqmax at 50%
                calc(
                  (var(--start-mask) * 1cqmax) +
                  ((var(--progress) - 1) * (var(--start-mask) * -1cqmax))
                ),
              #fff 43%, #0000 45%
            ),
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        .tr-reveal-layer {
          --movement: 0.15lh;
          --compression: 1.55;
          line-height: 1.46;
          animation:
            tr-reveal   calc(var(--duration) * 1s) calc(var(--delay) * 1s) ease-in both,
            tr-compress calc(var(--duration) * 0.5s)
              calc((var(--delay) * 1s) + (var(--duration) * 0.44s)) ease-in-out both;
        }
        .tr-reveal-layer .tr-content {
          mask-image:
            radial-gradient(
              180cqmax 180cqmax at 50%
                calc(
                  (var(--start-mask) * 1cqmax) +
                  ((var(--progress) - 1) * (var(--start-mask) * -1cqmax))
                ),
              #fff 38%, #0000 40%
            );
          mask-composite: exclude;
        }

        .tr-dupe { container-type: inline-size; }
      `}</style>

      <main
        className="relative max-w-full"
        style={{ fontFamily, fontSize, lineHeight: 1.5 }}
      >
        <div className="relative">
          <div
            aria-hidden="true"
            style={{
              width,
              maxWidth: "100%",
              padding: "1rem",
              fontWeight: 300,
              opacity: 0,
            }}
          >
            <div>{content}</div>
          </div>

          <div
            aria-hidden="true"
            className="tr-dupe tr-hide absolute bottom-0 left-0 right-0 min-h-full grid place-items-end"
            style={{ width, maxWidth: "100%", fontWeight: 300 }}
          >
            <div className="tr-content" style={{ padding: "1rem" }}>
              {content}
            </div>
          </div>

          <div
            className="tr-dupe tr-reveal-layer absolute bottom-0 left-0 right-0 min-h-full grid place-items-start"
            style={{ width, maxWidth: "100%", fontWeight: 300 }}
          >
            <div
              className="tr-content absolute top-0 left-0 right-0"
              style={{ padding: "1rem" }}
            >
              {content}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
