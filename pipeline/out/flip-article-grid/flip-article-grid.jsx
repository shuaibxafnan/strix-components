"use client";

import { useRef, useState } from "react";

const DEFAULT_ARTICLES = [
  {
    title: "Productivity Tips",
    tags: ["Learning", "Notes"],
    date: "Jan 12, 2024",
    image:
      "https://images.unsplash.com/photo-1587590576938-413aa6a5c2aa?crop=faces&cs=tinysrgb&fit=crop&fm=jpg&ixid=MXwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHw&ixlib=rb-1.2.1&q=80&w=400&h=300",
    imageAlt: "Productivity notes on desk",
  },
  {
    title: "Professional Woman",
    tags: ["Success", "Career"],
    date: "Feb 3, 2024",
    image:
      "https://images.unsplash.com/photo-1519419691348-3b3433c4c20e?crop=faces&cs=tinysrgb&fit=crop&fm=jpg&ixid=MXwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHw&ixlib=rb-1.2.1&q=80&w=400&h=300",
    imageAlt: "Professional woman working",
  },
  {
    title: "Creative Focus",
    tags: ["Design", "Process"],
    date: "Mar 7, 2024",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?crop=faces&cs=tinysrgb&fit=crop&fm=jpg&ixid=MXwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHw&ixlib=rb-1.2.1&q=80&w=400&h=300",
    imageAlt: "Creative workspace",
  },
  {
    title: "Morning Rituals",
    tags: ["Lifestyle", "Wellness"],
    date: "Apr 19, 2024",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=faces&cs=tinysrgb&fit=crop&fm=jpg&ixid=MXwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHw&ixlib=rb-1.2.1&q=80&w=400&h=300",
    imageAlt: "Morning coffee ritual",
  },
];

function getRect(el) {
  return el.getBoundingClientRect();
}

function runFlip(doSomething, elements) {
  const firsts = Array.from(elements).map((el) => [el, getRect(el)]);
  requestAnimationFrame(() => {
    doSomething();
    const lasts = Array.from(elements).map((el) => [el, getRect(el)]);
    firsts.forEach(([firstEl, firstRect], i) => {
      const [lastEl, lastRect] = lasts[i];
      const dx = lastRect.x - firstRect.x;
      const dy = lastRect.y - firstRect.y;
      const dw = lastRect.width / firstRect.width;
      const dh = lastRect.height / firstRect.height;
      lastEl.dataset.flipping = "true";
      lastEl.style.setProperty("--dx", dx);
      lastEl.style.setProperty("--dy", dy);
      lastEl.style.setProperty("--dw", dw);
      lastEl.style.setProperty("--dh", dh);
      requestAnimationFrame(() => {
        delete lastEl.dataset.flipping;
      });
    });
  });
}

function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <rect x="0" y="0" width="7" height="7" rx="1" />
      <rect x="9" y="0" width="7" height="7" rx="1" />
      <rect x="0" y="9" width="7" height="7" rx="1" />
      <rect x="9" y="9" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconList() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <rect x="0" y="1" width="16" height="2.5" rx="1" />
      <rect x="0" y="6.75" width="16" height="2.5" rx="1" />
      <rect x="0" y="12.5" width="16" height="2.5" rx="1" />
    </svg>
  );
}

export default function FlipArticleGrid({
  articles = DEFAULT_ARTICLES,
  heading = "Latest Articles",
  listLabel = "List view",
  cardLabel = "Grid view",
  toListAriaLabel = "Switch to list view",
  toCardAriaLabel = "Switch to card view",
  lightColor = "#f5f2ed",
  darkColor = "#0f0e0c",
  cardSurface = "#ffffff",
  className = "",
  bgList = "#f5f2ed",
  bgCard = "#0f0e0c",
  duration = "0.55s",
  easing = "cubic-bezier(0.6, 0, 0.4, 1)",
}) {
  const [view, setView] = useState("list");
  const gridRef = useRef(null);

  const toggle = () => {
    const targets =
      gridRef.current?.querySelectorAll("[data-flip-target]") ?? [];
    runFlip(() => setView((v) => (v === "list" ? "card" : "list")), targets);
  };

  const isCard = view === "card";
  const bg = isCard ? bgCard : bgList;

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center px-4 sm:px-6 py-[60px] pb-[80px] transition-colors duration-700 ease-in-out ${className}`}
      style={{ background: bg }}
    >
      <div className="w-full max-w-[800px] flex items-end justify-between mb-12">
        <div>
          <p
            className="text-[10px] font-medium tracking-[0.28em] uppercase mb-2 opacity-45 transition-colors duration-500 ease-in-out"
            style={{ color: isCard ? lightColor : darkColor }}
          >
            {isCard ? cardLabel : listLabel}
          </p>
          <h1
            className="text-[clamp(28px,5vw,40px)] font-light tracking-tight m-0 transition-colors duration-500 ease-in-out"
            style={{ color: isCard ? lightColor : darkColor, lineHeight: "1.1" }}
          >
            {heading}
          </h1>
        </div>

        <button
          className="flex items-center justify-center w-10 h-10 rounded-full border bg-transparent cursor-pointer transition-all duration-250 ease-in-out hover:opacity-70 shrink-0"
          onClick={toggle}
          aria-label={isCard ? toListAriaLabel : toCardAriaLabel}
          style={{
            color: isCard ? lightColor : darkColor,
            borderColor: "currentColor",
          }}
        >
          {isCard ? <IconList /> : <IconGrid />}
        </button>
      </div>

      <div
        ref={gridRef}
        className={`w-full max-w-[800px] grid gap-4 transition-[gap] duration-300 ease-in-out ${
          isCard ? "grid-cols-2" : "grid-cols-1"
        }`}
        data-view={view}
      >
        {articles.map((article, idx) => {
            return (
            <article
              key={idx}
              className={`grid cursor-pointer transition-transform duration-250 ease-in-out hover:-translate-y-[3px] ${
                isCard
                  ? "grid-rows-[180px_1fr] grid-cols-1"
                  : "grid-cols-[clamp(110px,30vw,200px)_1fr] h-[140px]"
              } data-[flipping]:transition-none data-[flipping]:translate-x-[calc(-1px*var(--dx))] data-[flipping]:translate-y-[calc(-1px*var(--dy))]`}
            >
                      <div
                data-flip-target
                className="w-full h-full overflow-hidden origin-top-left group data-[flipping]:transition-none data-[flipping]:!rounded-[calc(var(--dw)*12px)/calc(var(--dh)*12px)] data-[flipping]:translate-x-[calc(-1px*var(--dx))] data-[flipping]:translate-y-[calc(-1px*var(--dy))] data-[flipping]:scale-x-[calc(1/var(--dw))] data-[flipping]:scale-y-[calc(1/var(--dh))]"
                style={{
                  borderRadius: isCard ? "12px 12px 0 0" : "12px 0 0 12px",
                  transition: `border-radius ${duration} ${easing}, transform ${duration} ${easing}`,
                }}
              >
                <img
                  src={article.image}
                  alt={article.imageAlt}
                  className="block w-full h-full object-cover origin-top-left select-none pointer-events-none group-data-[flipping]:transition-none group-data-[flipping]:scale-x-[var(--dw)] group-data-[flipping]:scale-y-[var(--dh)]"
                  style={{
                    transition: `transform ${duration} ${easing}`,
                  }}
                  draggable={false}
                />
              </div>

                      <div
                data-flip-target
                className="relative z-10 origin-top-left data-[flipping]:transition-none data-[flipping]:translate-x-[calc(-1px*var(--dx))] data-[flipping]:translate-y-[calc(-1px*var(--dy))]"
                style={{
                  transition: `transform ${duration} ${easing}`,
                }}
              >
                <div
                  className={`absolute inset-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-[border-radius] duration-550 ease-[cubic-bezier(0.6,0,0.4,1)] group-data-[flipping]:transition-none group-data-[flipping]:scale-x-[calc(1/var(--dw))] group-data-[flipping]:scale-y-[calc(1/var(--dh))] ${
                    isCard ? "rounded-b-[12px]" : "rounded-r-[12px]"
                  }`}
                  style={{ background: cardSurface }}
                />
                <div className="relative z-10 px-6 py-5 h-full flex flex-col justify-center gap-3">
                  <h2
                    className="font-normal text-[clamp(15px,2.2vw,18px)] leading-tight tracking-tight m-0 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: darkColor }}
                  >
                    {article.title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag, ti) => (
                      <span
                        key={ti}
                        className="text-[10px] font-medium tracking-[0.12em] uppercase px-[9px] py-[3px] rounded-md border opacity-60"
                        style={{
                          color: darkColor,
                          borderColor: `color-mix(in srgb, ${darkColor} 15%, transparent)`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <time
                    className="text-[11px] font-normal tracking-[0.04em] opacity-40"
                    style={{ color: darkColor }}
                  >
                    {article.date}
                  </time>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
