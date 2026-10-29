"use client";

import { useEffect, useRef } from "react";

const CARD_DEFAULTS = [
  {
    name: "Lukas Meier",
    description:
      "Digital product designer crafting intuitive, scalable user journeys",
    image:
      "https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?q=80&w=640&auto=format&fit=crop",
    status: "online",
    rating: 4.5,
    followers: "3.1 K",
    verified: true,
    buttonLabel: "Get In Touch",
  },
  {
    name: "Max Steiner",
    description:
      "Digital designer turning complex workflows into seamless journeys",
    image:
      "https://images.unsplash.com/photo-1592700819903-308f4820372d?q=80&w=640&auto=format&fit=crop",
    status: "online",
    rating: 4.0,
    followers: "2.4 K",
    verified: true,
    buttonLabel: "Get In Touch",
  },
  {
    name: "Ueli Huber",
    description:
      "UX strategist designing frictionless, data-driven digital experiences",
    image:
      "https://images.unsplash.com/photo-1720022785516-9653ead7180c?q=80&w640&auto=format&fit=crop",
    status: "offline",
    rating: 5.0,
    followers: "1.7 K",
    verified: true,
    buttonLabel: "Get In Touch",
  },
];

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[data-cdn-src="${CSS.escape(src)}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
      } else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Failed: ${src}`)),
          { once: true },
        );
      }
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-cdn-src", src);
    el.onload = () => {
      el.dataset.loaded = "1";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        const gradId = `hg-${i}-${Math.round(rating * 10)}`;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="w-[8px] h-[8px]"
            stroke="#FFD700"
            strokeWidth="2"
            fill={filled ? "#FFD700" : "none"}
          >
            {half && (
              <defs>
                <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={half ? `url(#${gradId})` : undefined}
            />
          </svg>
        );
      })}
    </div>
  );
}

function StatusDot({ status }) {
  const isOnline = status === "online";
  return (
    <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 h-6 pointer-events-none select-none z-10">
      <span className="relative flex h-[6px] w-[6px]">
        {isOnline && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        )}
        <span
          className={`relative inline-flex rounded-full h-[6px] w-[6px] ${isOnline ? "bg-green-400" : "bg-gray-400"}`}
        />
      </span>
      <span className="text-[11px] text-white/75">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

function SwappableCard({
  card,
  index,
  buttonHoverColor,
  glowOnHover,
  draggable
}) {
  const cardRef = useRef(null);
  const bgRef = useRef(null);
  const fadeRef = useRef(null);
  const buttonRef = useRef(null);
  const handleRef = useRef(null);
  const nameRef = useRef(null);
  const descRef = useRef(null);
  const bgAnimRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    const init = async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js",
        );
        if (cancelled) return;

        const { animate } = window.Motion;

        const cardEl = cardRef.current;
        const bgEl = bgRef.current;
        const fadeEl = fadeRef.current;
        const buttonEl = buttonRef.current;
        const handleEl = handleRef.current;
        const nameEl = nameRef.current;
        const descEl = descRef.current;

        if (!cardEl) return;

        animate(
          cardEl,
          { opacity: [0, 1], filter: ["blur(1rem)", "blur(0)"] },
          { duration: 0.8, delay: index / 4 },
        );

        if (nameEl)
          animate(
            nameEl,
            { y: [20, 0], opacity: [0, 1] },
            { delay: index / 4 + 0.3 },
          );
        if (descEl)
          animate(
            descEl,
            { y: [20, 0], opacity: [0, 0.4] },
            { delay: index / 4 + 0.5 },
          );

        const startBgAnim = () =>
          bgEl
            ? animate(
              bgEl,
              { scale: [1, 1.2] },
              {
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              },
            )
            : null;
        bgAnimRef.current = startBgAnim();

        if (glowOnHover && fadeEl && buttonEl) {
          const onEnter = () => {
            animate(fadeEl, { opacity: 1 });
            animate(buttonEl, { background: buttonHoverColor });
          };
          const onLeave = () => {
            animate(fadeEl, { opacity: 0.75 });
            animate(buttonEl, { background: "rgba(255,255,255,0.2)" });
          };
          cardEl.addEventListener("mouseenter", onEnter);
          cardEl.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            cardEl.removeEventListener("mouseenter", onEnter);
            cardEl.removeEventListener("mouseleave", onLeave);
          });
        }

        if (buttonEl) {
          const onDown = () =>
            animate(buttonEl, { scale: 1.1 }, { duration: 0.1 });
          const onUp = () =>
            animate(buttonEl, { scale: 1 }, { type: "spring", stiffness: 200 });
          buttonEl.addEventListener("pointerdown", onDown);
          buttonEl.addEventListener("pointerup", onUp);
          buttonEl.addEventListener("pointerleave", onUp);
          cleanups.push(() => {
            buttonEl.removeEventListener("pointerdown", onDown);
            buttonEl.removeEventListener("pointerup", onUp);
            buttonEl.removeEventListener("pointerleave", onUp);
          });
        }

        if (draggable && handleEl && bgEl && cardEl) {
          const onEnter = () => {
            animate(handleEl, { scale: 0.95 }, { duration: 0.2 });
            animate(
              bgEl,
              { scale: 1.1 },
              { type: "spring", stiffness: 50, damping: 10 },
            );
            animate(
              cardEl,
              { scale: 1.025 },
              { type: "spring", stiffness: 100, damping: 10 },
            );
          };
          const onLeave = () => {
            animate(
              cardEl,
              { scale: 1 },
              { type: "spring", stiffness: 100, damping: 10 },
            );
            animate(handleEl, { scale: 1 }, { duration: 0.2 });
            animate(
              bgEl,
              { scale: 1 },
              { type: "spring", stiffness: 50, damping: 10 },
            ).then(() => {
              bgAnimRef.current = startBgAnim();
            });
          };
          handleEl.addEventListener("mouseenter", onEnter);
          handleEl.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            handleEl.removeEventListener("mouseenter", onEnter);
            handleEl.removeEventListener("mouseleave", onLeave);
          });
        }
      } catch (e) {
        console.error("[ProfileCard] init failed:", e.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [index, buttonHoverColor, glowOnHover, draggable]);

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-end justify-end overflow-hidden border border-white/10 rounded-[2.5rem] shadow-[0_0.4rem_1rem_rgba(0,0,0,0.1)] opacity-0"
      style={{
        width: "18rem",
        height: "19rem",
        minWidth: "18rem",
        minHeight: "19rem",
        padding: "1rem",
      }}
    >
      <img
        ref={bgRef}
        src={card.image}
        alt="bg"
        className="absolute top-0 left-0 h-full w-auto -z-[1] pointer-events-none select-none"
        draggable={false}
      />

      <StatusDot status={card.status} />

      {draggable && (
        <div
          ref={handleRef}
          className="card-handle absolute top-4 right-4 h-10 w-10 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-black"
            fill="currentColor"
          >
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
      )}

      <div className="relative z-[3] w-full px-1">
        <div ref={nameRef} className="flex items-center gap-2 my-3 opacity-0">
          <span className="text-white text-xl font-bold">{card.name}</span>
          {card.verified && (
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white drop-shadow-[0_0_0.5rem_black]"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>

        <div className="flex items-center gap-2 my-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full text-[12px] pointer-events-none">
            <span className="text-white">{card.rating.toFixed(1)}</span>
            <StarRating rating={card.rating} />
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full text-[12px] pointer-events-none">
            <svg
              viewBox="0 0 24 24"
              className="w-3 h-3 text-white"
              fill="currentColor"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
            <span className="text-white">{card.followers}</span>
          </div>
        </div>

        <p
          ref={descRef}
          className="text-white text-[13px] font-light leading-relaxed my-2 mb-4 opacity-0"
        >
          {card.description}
        </p>

        <button
          ref={buttonRef}
          onClick={card.onButtonClick}
          className="w-full flex items-center justify-between px-2 py-[6px] rounded-full bg-white/20 text-white cursor-pointer"
        >
          <span className="ml-2 text-[14px] font-medium tracking-tight">
            {card.buttonLabel}
          </span>
          <span className="flex items-center justify-center min-h-10 min-w-10 rounded-full bg-white text-black shadow-[0_0_0.5rem_rgba(0,0,0,0.5)]">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
            </svg>
          </span>
        </button>
      </div>

      <div
        ref={fadeRef}
        className="absolute bottom-0 left-0 w-full h-[20rem] z-0 pointer-events-none"
        style={{
          opacity: 0.75,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1))",
        }}
      />
    </div>
  );
}

export default function SwappableCards({
  cards = CARD_DEFAULTS,
  bgColor = "black",
  cardGap = "1rem",
  buttonHoverColor = "#FF004D",
  glowOnHover = true,
  draggable = true,
  showHeader = true,
  title = "Selected Works",
  description = "Curated visual studies",
}) {
  const cardsRef = useRef(null);
  const madeRef = useRef(null);
  const sortableRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    const init = async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js",
        );
        if (cancelled) return;

        const { animate } = window.Motion;

        const attachFade = (el) => {
          if (!el) return;
          animate(
            el,
            { scale: [0.75, 1], opacity: [0, 0.75] },
            { delay: 0.25 },
          );
          const onEnter = () =>
            animate(
              el,
              { scale: 1.03, opacity: 1 },
              { type: "spring", stiffness: 200 },
            );
          const onLeave = () =>
            animate(
              el,
              { scale: 1, opacity: 0.75 },
              { type: "spring", stiffness: 200 },
            );
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
          });
        };

        attachFade(madeRef.current);
      } catch (e) {
        console.error("[ProfileCards] header/footer init failed:", e.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [showHeader]);

  useEffect(() => {
    if (!draggable || !cardsRef.current) return;

    let cancelled = false;

    const init = async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@shopify/draggable@1.1.3/build/umd/index.min.js",
        );
        if (cancelled) return;

        const { animate } = window.Motion;
        const { Sortable } = window.Draggable;

        if (!document.getElementById("draggable-mirror-fix")) {
          const s = document.createElement("style");
          s.id = "draggable-mirror-fix";
          s.textContent = [
            ".draggable-mirror { transition: none !important; animation: none !important; }",
            ".draggable--original { transition: none !important; }",
            ".draggable-source--is-dragging { transition: none !important; }",
          ].join("\n");
          document.head.appendChild(s);
        }

        const sortable = new Sortable(cardsRef.current, {
          draggable: ".profile-card-wrap",
          handle: ".card-handle",
        });

        sortable.on("mirror:destroy", (e) => {
          e.cancel();
          e.mirror.remove();
        });

        sortable.on("sortable:start", () => {
          document.body.style.cursor = "grabbing";
        });

        sortable.on("sortable:stop", (e) => {
          document.body.style.cursor = "";
          requestAnimationFrame(() => {
            const dropped = e.data.newContainer?.children[e.data.newIndex];
            if (dropped) {
              animate(
                dropped,
                { scale: [1.1, 1] },
                { type: "spring", stiffness: 200, damping: 10 },
              );
            }
          });
        });

        sortableRef.current = sortable;
      } catch (err) {
        console.error("[ProfileCards] sortable init failed:", err.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      sortableRef.current?.destroy?.();
      sortableRef.current = null;
    };
  }, [draggable]);

  return (
    <div
      className="flex flex-col min-h-screen py-16"
      style={{ backgroundColor: bgColor, color: "white" }}
    >
      {showHeader && (
        <header className="mb-16 mt-12 flex flex-col items-center justify-center text-center">
          <div ref={madeRef} className="flex flex-col items-center text-white opacity-0">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="m-0 mt-2 text-[10px] uppercase tracking-[0.2rem] opacity-50">
              {description}
            </p>
          </div>
        </header>
      )}

      <section
        ref={cardsRef}
        className="flex justify-center items-center flex-wrap w-full"
        style={{ gap: cardGap }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="profile-card-wrap"
            style={{ margin: cardGap }}
          >
            <SwappableCard
              card={card}
              index={i}
              buttonHoverColor={buttonHoverColor}
              glowOnHover={glowOnHover}
              draggable={draggable}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
