"use client";

export default function GradientRevealCard({
  cardTitle = "I know exactly what I'm doing",
  cardSubtitle = "But in a much more real sense, I have no idea what I'm doing.",
  cardWidth = "45vmin",
  cardAspectRatio = "1 / 1.6",
  cardBorder = "0.5vmin",
  borderColor = "rgb(3, 169, 244)",
  gradient1 = "rgb(98, 0, 234)",
  gradient2 = "rgb(236, 64, 122)",
  gradient3 = "rgb(253, 216, 53)",
  bgColor = "rgb(10, 10, 10)",
  textColor = "white",
  iconColorDefault = "rgba(255, 255, 255, 0.5)",
  iconColorHover = "white",
  titleFont = "Anek Latin",
  titleFontSize = "4vmin",
  titleFontWeight = 400,
  subtitleFontSize = "2vmin",
  subtitleMarginTop = "2vmin",
  subtitleWordDelay = 40,
  hoverScaleX = 1.08,
  hoverScaleY = 1.03,
  transitionDuration = "350ms",
  wordRevealDuration = 200,
  iconClass = "fa-solid fa-hat-witch",
  iconSize = "7vmin",
  iconMargin = "5vmin",
  className = "",
}) {
  const words = cardSubtitle.split(" ");

  return (
    <div
      className={`grc-root w-full h-screen flex items-center justify-center ${className}`}
      style={{
        backgroundColor: bgColor,
        "--border": borderColor,
        "--g1": gradient1,
        "--g2": gradient2,
        "--g3": gradient3,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        .grc-card {
          aspect-ratio: ${cardAspectRatio};
          border: ${cardBorder} solid var(--border);
          cursor: pointer;
          position: relative;
          width: ${cardWidth};
        }

        .grc-card:hover:before {
          background-position: 100% 100%;
          transform: scale(${hoverScaleX}, ${hoverScaleY});
        }

        .grc-card:hover > .grc-content {
          background-position: -10% 0%;
        }

        .grc-card:hover > .grc-icon {
          color: ${iconColorHover};
        }

        .grc-card:hover > .grc-content > .grc-subtitle > .grc-word {
          opacity: 1;
          transform: translateY(0%);
          transition: opacity 0ms, transform ${wordRevealDuration}ms cubic-bezier(.90, .06, .15, .90);
        }

        .grc-card:before {
          background: linear-gradient(
            130deg,
            transparent 0% 33%,
            var(--g1) 66%,
            var(--g2) 83.5%,
            var(--g3) 100%
          );
          background-position: 0% 0%;
          background-size: 300% 300%;
          content: "";
          height: 100%;
          left: 0px;
          pointer-events: none;
          position: absolute;
          top: 0px;
          transition: background-position ${transitionDuration} ease, transform ${transitionDuration} ease;
          width: 100%;
          z-index: 1;
        }

        .grc-content {
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.2) 8%,
            transparent 8%
          );
          background-position: 0% 0%;
          background-size: 5vmin 5vmin;
          height: calc(100% - 10vmin);
          padding: 4vmin;
          position: relative;
          transition: background-position ${transitionDuration} ease;
          width: calc(100% - 10vmin);
          z-index: 2;
        }

        .grc-title,
        .grc-subtitle {
          color: ${textColor};
          font-family: "${titleFont}", sans-serif;
          font-weight: ${titleFontWeight};
          margin: 0px;
        }

        .grc-title {
          font-size: ${titleFontSize};
        }

        .grc-subtitle {
          font-size: ${subtitleFontSize};
          margin-top: ${subtitleMarginTop};
        }

        .grc-word {
          display: inline-block;
          margin: 0vmin 0.3vmin;
          opacity: 0;
          position: relative;
          transform: translateY(40%);
          transition: none;
        }

        .grc-icon {
          bottom: 0px;
          color: ${iconColorDefault};
          font-size: ${iconSize};
          left: 0px;
          margin: ${iconMargin};
          position: absolute;
          transition: color 250ms ease;
          z-index: 2;
        }
      `}</style>

      <div className="grc-card">
        <div className="grc-content">
          <h3 className="grc-title">{cardTitle}</h3>
          <h4 className="grc-subtitle">
            {words.map((text, index) => (
              <span
                key={index}
                className="grc-word"
                style={{ transitionDelay: `${index * subtitleWordDelay}ms` }}
              >
                {text}{" "}
              </span>
            ))}
          </h4>
        </div>
        <i className={`${iconClass} grc-icon`}></i>
      </div>
    </div>
  );
}
