"use client";

import { useEffect, useRef } from "react";

export default function InteractiveCard({
  // Card styling
  cardTitle = "I know exactly what I'm doing",
  cardSubtitle = "But in a much more real sense, I have no idea what I'm doing.",
  cardWidth = "45vmin",
  cardAspectRatio = "1 / 1.6",
  cardBorder = "0.5vmin",

  // Colors
  borderColor = "rgb(3, 169, 244)",
  gradient1 = "rgb(98, 0, 234)",
  gradient2 = "rgb(236, 64, 122)",
  gradient3 = "rgb(253, 216, 53)",
  bgColor = "rgb(10, 10, 10)",
  iconColorDefault = "rgba(255, 255, 255, 0.5)",
  iconColorHover = "white",

  // Typography
  titleFont = "Anek Latin",
  titleFontSize = "4vmin",
  titleFontWeight = 400,
  subtitleFontSize = "2vmin",
  subtitleMarginTop = "2vmin",
  subtitleWordDelay = 40,

  // Animations
  hoverScaleX = 1.08,
  hoverScaleY = 1.03,
  transitionDuration = "350ms",
  wordRevealDuration = 200,

  // Icon
  iconClass = "fa-solid fa-hat-witch",
  iconSize = "7vmin",
  iconMargin = "5vmin",
}) {
  const subtitleRef = useRef(null);

  useEffect(() => {
    if (!subtitleRef.current) return;

    // Clear existing words
    subtitleRef.current.innerHTML = "";

    // Create and add words
    const words = cardSubtitle.split(" ");
    words.forEach((text, index) => {
      const word = document.createElement("span");
      word.innerHTML = `${text} `;
      word.className = "card-subtitle-word";
      word.style.transitionDelay = `${index * subtitleWordDelay}ms`;
      subtitleRef.current.appendChild(word);
    });
  }, [cardSubtitle, subtitleWordDelay]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :root {
          --border: ${borderColor};
          --g1: ${gradient1};
          --g2: ${gradient2};
          --g3: ${gradient3};
        }

        body {
          background-color: ${bgColor};
          display: grid;
          height: 100vh;
          margin: 0px;
          padding: 0px;
          place-items: center;
        }

        .card {
          aspect-ratio: ${cardAspectRatio};
          border: ${cardBorder} solid var(--border);
          cursor: pointer;
          position: relative;
          width: ${cardWidth};
        }

        .card:hover:before {
          background-position: 100% 100%;
          transform: scale(${hoverScaleX}, ${hoverScaleY});
        }

        .card:hover > .card-content {
          background-position: -10% 0%;
        }

        .card:hover > .card-icon {
          color: ${iconColorHover};
        }

        .card:hover > .card-content > .card-subtitle > .card-subtitle-word {
          opacity: 1;
          transform: translateY(0%);
          transition: opacity 0ms, transform ${wordRevealDuration}ms cubic-bezier(.90, .06, .15, .90);
        }

        .card:before {
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

        .card-content {
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

        .card-title,
        .card-subtitle {
          color: white;
          font-family: "${titleFont}", sans-serif;
          font-weight: ${titleFontWeight};
          margin: 0px;
        }

        .card-title {
          font-size: ${titleFontSize};
        }

        .card-subtitle {
          font-size: ${subtitleFontSize};
          margin-top: ${subtitleMarginTop};
        }

        .card-subtitle-word {
          display: inline-block;
          margin: 0vmin 0.3vmin;
          opacity: 0;
          position: relative;
          transform: translateY(40%);
          transition: none;
        }

        .card-icon {
          bottom: 0px;
          color: ${iconColorDefault};
          font-size: ${iconSize};
          left: 0px;
          margin: ${iconMargin};
          position: absolute;
          transition: color 250ms ease;
          z-index: 2;
        }

        .meta-link {
          align-items: center;
          backdrop-filter: blur(3px);
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          display: inline-flex;
          gap: 5px;
          left: 10px;
          padding: 10px 20px;
          position: fixed;
          text-decoration: none;
          transition: background-color 350ms, border-color 350ms;
          z-index: 10000;
        }

        .meta-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .meta-link > i,
        .meta-link > span {
          height: 20px;
          line-height: 20px;
        }

        .meta-link > span {
          color: white;
          font-family: "${titleFont}", sans-serif;
          transition: color 600ms;
        }

        .roboto-mono {
          font-family: "Roboto Mono", monospace;
        }
      `}</style>

      <div
        style={{
          display: "grid",
          placeItems: "center",
          height: "100vh",
          backgroundColor: bgColor,
        }}
      >
        <div className="card">
          <div className="card-content">
            <h3 className="card-title">{cardTitle}</h3>
            <h4 className="card-subtitle" ref={subtitleRef}></h4>
          </div>
          <i className={`${iconClass} card-icon`}></i>
        </div>
      </div>
    </>
  );
}
