"use client";

export default function CinematicInteractiveCard({
  title = "I know exactly what I'm doing",
  subtitleText = "But in a much more real sense, I have no idea what I'm doing.",
  iconClass = "fa-solid fa-hat-witch",
  wordDelayOffset = 40,
  cardWidth = "56vmin",
  cardAspectRatio = "1/1.6",
  borderColor = "rgb(3, 169, 244)",
  gradColor1 = "rgb(98, 0, 234)",
  gradColor2 = "rgb(236, 64, 122)",
  gradColor3 = "rgb(253, 216, 53)",
  dotGridOpacity = "0.2",
  bgColor = "rgb(10, 10, 10)",
  className = "",
}) {
  const subtitleWords = subtitleText.split(" ");

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`relative w-full h-screen flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      <div
        style={{
          width: cardWidth,
          aspectRatio: cardAspectRatio,
          "--card-border-target": borderColor,
          "--g1": gradColor1,
          "--g2": gradColor2,
          "--g3": gradColor3,
        }}
        className={`
          relative cursor-pointer group box-border
          border-[0.5vmin] border-solid border-[var(--card-border-target)]
          before:content-[""] before:absolute before:inset-0 before:z-10 before:pointer-events-none
          before:bg-[linear-gradient(130deg,transparent_0%_33%,var(--g1)_66%,var(--g2)_83.5%,var(--g3)_100%)]
          before:bg-[length:300%_300%] before:bg-[0%_0%]
          before:transition-[background-position_350ms_ease,transform_350ms_ease]
          hover:before:bg-[100%_100%] hover:before:scale-[1.08,1.03]
        `}
      >
        <div
          style={{ "--dot-alpha": dotGridOpacity }}
          className={`
            relative z-20 h-[calc(100%-10vmin)] w-[calc(100%-10vmin)] p-[5vmin] box-content
            bg-[radial-gradient(rgba(255,255,255,var(--dot-alpha))_8%,transparent_8%)]
            bg-[0%_0%] bg-[size:5vmin_5vmin]
            transition-[background-position] duration-350 ease-out
            group-hover:bg-[-10%_0%]
          `}
        >
          <h3 className="m-0 p-0 text-white font-normal text-[6vmin] leading-tight font-sans tracking-tight">
            {title}
          </h3>

          <h4 className="m-0 p-0 text-white font-normal text-[3vmin] mt-[2vmin] font-sans tracking-wide">
            {subtitleWords.map((word, idx) => (
              <span
                key={`word-${idx}`}
                style={{
                  transitionDelay: `${idx * wordDelayOffset}ms`,
                }}
                className={`
                  inline-block my-0 mx-[0.3vmin] relative opacity-0 translate-y-[40%] transition-none
                  group-hover:opacity-100 group-hover:translate-y-0
                  group-hover:transition-[opacity_0ms,transform_200ms_cubic-bezier(0.9,0.06,0.15,0.9)]
                `}
              >
                {word}&nbsp;
              </span>
            ))}
          </h4>
        </div>

        <i
          className={`
            absolute left-0 bottom-0 z-20 m-[5vmin] text-[7vmin]
            text-white/50 transition-colors duration-250 ease-out
            group-hover:text-white
            ${iconClass}
          `}
        />
      </div>
    </div>
  );
}
