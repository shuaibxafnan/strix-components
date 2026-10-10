"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── CardDeckFan ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    IMAGES     Card data: string url OR { image, title, text }
// cardWidth          number   260        Card width in px (deck footprint)
// cardHeight         number   360        Card height in px (deck footprint)
// cardRadius         number   3          Card corner radius in px
// cardPadding        number   0          Inner padding of each card in px
// cardBg             string   #fbfaf8    Card background color
// cardRingColor      string   rgba(24,24,22,0.14)  Inset 1px hairline on each card
// cardShadow         string   0 18px 40px -22px rgba(20,19,17,0.7)  Drop shadow under each card
// captionPadding     number   20         Padding around the overlaid caption in px
// scrimColor         string   rgba(14,13,12,0.88)  Base color of the gradient scrim over the image
// scrimHeight        number   62         Height of the scrim as a % of the card
// imageBrightness    number   0.92       Brightness multiplier applied to the image
// bgColor            string   #e9e6e0    Background of the whole component wrapper
// speed              number   300        Base transition speed (ms) for next/prev/click
// easing             string   ease-in-out Base transition easing for next/prev/click
// navExtraOffset     number   15         Extra px a card slides past its width on next/prev
// navRotation        number   5          Degrees a card rotates while sliding on next/prev
// fanSpeed           number   500        Default spread transition speed (ms)
// fanEasing          string   ease-out   Default spread transition easing
// fanRange           number   90         Total angle spread across all cards (deg)
// fanDirection       string   right      Spread direction: "right" | "left"
// fanOrigin          object   {x:25,y:100} Transform origin in %. Accepts { x, y } or { minX, maxX, y }
// fanTranslation     number   0          Extra px of linear displacement across the spread
// fanCenter          bool     true       Center the spread around 0deg instead of starting at 0deg
// fanScatter         bool     false      Add per-card randomness to angle and displacement
// presets            array    PRESETS    Control buttons: { label, ...fan settings }
// showControls       bool     true       Render the preset / prev / next / close buttons
// showNav            bool     true       Render the prev / next / close row
// addItems           array    []         Cards appended when the "Add items" button is pressed
// showAddButton      bool     false      Render the "Add items" button
// addStagger         number   200        Delay (ms) between each added card's entrance
// addSpeed           number   500        Entrance transition speed (ms) for added cards
// showCaptions       bool     true       Render the title / text block under the image
// titleColor         string   #f6f4f0    Card title color
// textColor          string   rgba(246,244,240,0.72)  Card body text color
// indexColor         string   rgba(246,244,240,0.55)  Card index / meta label color
// buttonBg           string   transparent Preset button background
// buttonColor        string   #4a463f    Preset button text color
// buttonBorder       string   rgba(24,24,22,0.18)  Preset button border color
// buttonHoverBg      string   #1b1a17    Preset button background on hover
// buttonHoverColor   string   #f4f2ee    Preset button text color on hover
// navButtonBg        string   #1b1a17    Prev / next / close button background
// navButtonColor     string   #f4f2ee    Prev / next / close button text color
// navButtonHoverBg   string   #4a463f    Prev / next / close background on hover
// className          string   ""         Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const CAPTIONS = [
  {
    title: "Coco Loko",
    text: "Total bicycle rights in blog raw denim helvetica sapiente odio placeat.",
  },
  {
    title: "Vermouth Land",
    text: "Velit chambray fugiat, enim aesthetic esse ullamco typewriter.",
  },
  {
    title: "Electrodynamics",
    text: "Before they sold out magna jean shorts non seitan ea. Dolor wolf pop-up.",
  },
  {
    title: "Retinal Bliss",
    text: "Locavore vero ad, before they sold out food truck bushwick helvetica.",
  },
  {
    title: "Disco Fever",
    text: "Cillum laboris consequat, qui elit retro next level skateboard freegan.",
  },
  {
    title: "Serenity",
    text: "Hoodie 3 wolf moon labore, fugiat lomo iphone eiusmod vegan.",
  },
  {
    title: "Dark Honor",
    text: "Chillwave mustache, marfa seitan umami id farm-to-table iphone.",
  },
  {
    title: "Nested Happiness",
    text: "Minim post-ironic american apparel iphone wayfarers.",
  },
  {
    title: "Cherry Country",
    text: "Sint vinyl street art odd future id trust fund, terry richardson cray.",
  },
  {
    title: "Paper Moon",
    text: "Quinoa fixie cardigan, meggings tousled selvage kombucha bespoke.",
  },
  {
    title: "Slow Static",
    text: "Ennui gastropub small batch, hexagon pour-over vinyl cold-pressed.",
  },
  {
    title: "Amber Signal",
    text: "Migas hella lo-fi, letterpress tote bag mixtape sustainable brunch.",
  },
  {
    title: "Night Ferry",
    text: "Chartreuse jianbing shoreditch, banjo squid tilde poutine lumbersexual.",
  },
];

const PRESETS = [
  {
    label: "Fan right",
    range: 90,
    direction: "right",
    origin: { x: 25, y: 100 },
    center: true,
  },
  {
    label: "Fan left",
    range: 90,
    direction: "left",
    origin: { x: 75, y: 100 },
    center: true,
  },
  {
    label: "Fan right (asym.)",
    range: 90,
    direction: "right",
    origin: { minX: 20, maxX: 80, y: 100 },
    center: true,
    translation: 60,
  },
  {
    label: "Fan left (asym.)",
    range: 90,
    direction: "left",
    origin: { minX: 20, maxX: 80, y: 100 },
    center: true,
    translation: 60,
  },
  {
    label: "Rotated (horizontal)",
    range: 100,
    direction: "right",
    origin: { x: 50, y: 200 },
    center: true,
  },
  {
    label: "Rotated (vertical)",
    range: 80,
    direction: "left",
    origin: { x: 200, y: 50 },
    center: true,
  },
  {
    label: "Linear right",
    range: 20,
    direction: "right",
    origin: { x: 50, y: 200 },
    center: false,
    translation: 300,
  },
  {
    label: "Linear left",
    range: 20,
    direction: "left",
    origin: { x: 50, y: 200 },
    center: false,
    translation: 300,
  },
  {
    label: "Linear right (irregular)",
    range: 20,
    direction: "right",
    origin: { x: 50, y: 200 },
    center: false,
    translation: 300,
    scatter: true,
  },
  {
    label: "Linear left (irregular)",
    range: 20,
    direction: "left",
    origin: { x: 50, y: 200 },
    center: false,
    translation: 300,
    scatter: true,
  },
  {
    label: "Wide arc",
    range: 130,
    direction: "left",
    origin: { x: 25, y: 100 },
    center: false,
  },
  {
    label: "Full circle",
    range: 360,
    direction: "left",
    origin: { x: 50, y: 90 },
    center: false,
  },
  {
    label: "Near circle",
    range: 330,
    direction: "left",
    origin: { x: 50, y: 100 },
    center: true,
  },
  {
    label: "Scattered arc",
    range: 90,
    direction: "right",
    origin: { minX: 20, maxX: 80, y: 100 },
    center: true,
    translation: 60,
    scatter: true,
  },
];

const Z_MIN = 1000;

function normalize(item, index) {
  if (typeof item === "string") {
    const caption = CAPTIONS[index % CAPTIONS.length];
    return { image: item, title: caption.title, text: caption.text };
  }
  return {
    image: item.image,
    title: item.title || "",
    text: item.text || "",
  };
}

export default function CardDeckFan({
  items = IMAGES,
  cardWidth = 260,
  cardHeight = 360,
  cardRadius = 3,
  cardPadding = 0,
  cardBg = "#fbfaf8",
  cardRingColor = "rgba(24,24,22,0.14)",
  cardShadow = "0 18px 40px -22px rgba(20,19,17,0.7)",
  captionPadding = 20,
  scrimColor = "rgba(14,13,12,0.88)",
  scrimHeight = 62,
  imageBrightness = 0.92,
  bgColor = "#e9e6e0",
  speed = 300,
  easing = "ease-in-out",
  navExtraOffset = 15,
  navRotation = 5,
  fanSpeed = 500,
  fanEasing = "ease-out",
  fanRange = 90,
  fanDirection = "right",
  fanOrigin = { x: 25, y: 100 },
  fanTranslation = 0,
  fanCenter = true,
  fanScatter = false,
  presets = PRESETS,
  showControls = true,
  showNav = true,
  addItems = [],
  showAddButton = false,
  addStagger = 200,
  addSpeed = 500,
  showCaptions = true,
  titleColor = "#f6f4f0",
  textColor = "rgba(246,244,240,0.72)",
  indexColor = "rgba(246,244,240,0.55)",
  buttonBg = "transparent",
  buttonColor = "#4a463f",
  buttonBorder = "rgba(24,24,22,0.18)",
  buttonHoverBg = "#1b1a17",
  buttonHoverColor = "#f4f2ee",
  navButtonBg = "#1b1a17",
  navButtonColor = "#f4f2ee",
  navButtonHoverBg = "#4a463f",
  className = "",
}) {
  const [cards, setCards] = useState(() => items.map(normalize));
  const [added, setAdded] = useState(false);

  const nodesRef = useRef([]);
  const zRef = useRef([]);
  const closedRef = useRef(true);
  const animatingRef = useRef(false);
  const pendingAddRef = useRef(0);

  const setNode = useCallback((el, index) => {
    nodesRef.current[index] = el;
  }, []);

  const applyZ = useCallback(() => {
    zRef.current.forEach((z, i) => {
      const el = nodesRef.current[i];
      if (el) el.style.zIndex = String(z);
    });
  }, []);

  const resetTransition = useCallback((indices) => {
    indices.forEach((i) => {
      const el = nodesRef.current[i];
      if (el) el.style.transition = "none";
    });
  }, []);

  const setOrigin = useCallback((indices, x, y) => {
    indices.forEach((i) => {
      const el = nodesRef.current[i];
      if (el) el.style.transformOrigin = x + "% " + y + "%";
    });
  }, []);

  const setTransition = useCallback((indices, prop, ms, ease, delay) => {
    const property = prop === "transform" ? "transform" : prop;
    indices.forEach((i) => {
      const el = nodesRef.current[i];
      if (el) {
        el.style.transition =
          property + " " + ms + "ms " + ease + " " + (delay || 0) + "ms";
      }
    });
  }, []);

  const runTransition = useCallback((indices, styleFor, duration) => {
    return new Promise((resolve) => {
      const els = indices.map((i) => nodesRef.current[i]).filter(Boolean);
      if (els.length === 0) {
        resolve();
        return;
      }
      let done = false;
      let remaining = els.length;

      const finish = () => {
        if (done) return;
        done = true;
        els.forEach((el) => el.removeEventListener("transitionend", onEnd));
        clearTimeout(timer);
        resolve();
      };

      const onEnd = (event) => {
        if (event.target !== event.currentTarget) return;
        remaining -= 1;
        if (remaining <= 0) finish();
      };

      els.forEach((el) => el.addEventListener("transitionend", onEnd));
      const timer = setTimeout(finish, duration + 120);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          indices.forEach((i) => {
            const el = nodesRef.current[i];
            if (!el) return;
            const styles = styleFor(i);
            Object.keys(styles).forEach((key) => {
              el.style[key] = styles[key];
            });
          });
        });
      });
    });
  }, []);

  const updateStack = useCallback(
    (index, dir) => {
      const count = zRef.current.length;
      const current = zRef.current[index];
      const target = dir === "next" ? Z_MIN - 1 : Z_MIN + count;

      zRef.current = zRef.current.map((z, i) => {
        if (i === index) return target;
        if (dir === "next" && z < current) return z + 1;
        if (dir === "prev" && z > current) return z - 1;
        return z;
      });
      applyZ();
    },
    [applyZ],
  );

  const closeDeck = useCallback(
    async (exclude) => {
      const count = zRef.current.length;
      const indices = [];
      for (let i = 0; i < count; i += 1) {
        if (i !== exclude) indices.push(i);
      }
      if (!closedRef.current) {
        await runTransition(indices, () => ({ transform: "none" }), fanSpeed);
      } else {
        indices.forEach((i) => {
          const el = nodesRef.current[i];
          if (el) el.style.transform = "none";
        });
      }
      closedRef.current = true;
      resetTransition(indices);
      setOrigin(indices, 50, 50);
    },
    [fanSpeed, resetTransition, runTransition, setOrigin],
  );

  const fan = useCallback(
    async (settings) => {
      const count = zRef.current.length;
      if (count < 2) return;

      const config = {
        speed: fanSpeed,
        easing: fanEasing,
        range: fanRange,
        direction: fanDirection,
        origin: fanOrigin,
        translation: fanTranslation,
        center: fanCenter,
        scatter: fanScatter,
        ...(settings || {}),
      };
      const origin = config.origin || { x: 25, y: 100 };

      closedRef.current = false;

      const positionOf = (i) => count - 1 - (zRef.current[i] - Z_MIN);

      if (origin.minX && origin.maxX) {
        const max = origin.maxX;
        const min = origin.minX;
        const step = (max - min) / count;
        for (let i = 0; i < count; i += 1) {
          const pos = positionOf(i);
          let originX = (pos * (max - min + step)) / count + min;
          if (config.direction === "left") originX = max + min - originX;
          setOrigin([i], originX, origin.y);
        }
      } else {
        setOrigin(
          zRef.current.map((_, i) => i),
          origin.x,
          origin.y,
        );
      }

      const indices = zRef.current.map((_, i) => i);
      setTransition(indices, "transform", config.speed, config.easing, 0);

      const stepAngle = config.range / (count - 1);
      const stepTranslation = config.translation / (count - 1);

      const transforms = indices.map((i) => {
        const pos = positionOf(i);
        const base = config.center ? config.range / 2 : config.range;
        let angle = base - stepAngle * pos;
        let position = stepTranslation * (count - pos - 1);

        if (config.direction === "left") {
          angle *= -1;
          position *= -1;
        }

        if (config.scatter && pos !== count - 1) {
          const extraAngle = Math.floor(Math.random() * stepAngle);
          const extraPosition = Math.floor(Math.random() * stepTranslation);
          angle =
            config.direction === "left"
              ? angle + extraAngle
              : angle - extraAngle;
          position =
            config.direction === "left"
              ? position - extraPosition
              : position + extraPosition;
        }

        return "translate(" + position + "px) rotate(" + angle + "deg)";
      });

      await runTransition(
        indices,
        (i) => ({ transform: transforms[i] }),
        config.speed,
      );
    },
    [
      fanCenter,
      fanDirection,
      fanEasing,
      fanOrigin,
      fanRange,
      fanScatter,
      fanSpeed,
      fanTranslation,
      runTransition,
      setOrigin,
      setTransition,
    ],
  );

  const navigate = useCallback(
    async (dir) => {
      const count = zRef.current.length;
      if (count < 2) return;

      closedRef.current = false;

      const target = dir === "next" ? Z_MIN + count - 1 : Z_MIN;
      const index = zRef.current.findIndex((z) => z === target);
      if (index === -1) return;

      const width = cardWidth;
      const translation =
        dir === "next" ? width + navExtraOffset : -width - navExtraOffset;
      const rotation = dir === "next" ? navRotation : -navRotation;

      setTransition([index], "transform", speed, easing, 0);
      await runTransition(
        [index],
        () => ({
          transform:
            "translate(" + translation + "px) rotate(" + rotation + "deg)",
        }),
        speed,
      );

      updateStack(index, dir);

      await runTransition(
        [index],
        () => ({ transform: "translate(0px) rotate(0deg)" }),
        speed,
      );

      closedRef.current = true;
    },
    [
      cardWidth,
      easing,
      navExtraOffset,
      navRotation,
      runTransition,
      setTransition,
      speed,
      updateStack,
    ],
  );

  const moveToFront = useCallback(
    async (index) => {
      const count = zRef.current.length;
      const isTop = zRef.current[index] === Z_MIN + count - 1;

      if (!closedRef.current) {
        await closeDeck(isTop ? undefined : index);
      } else if (!isTop) {
        fan();
      }

      if (isTop) return;

      const el = nodesRef.current[index];
      if (!el) return;

      resetTransition([index]);
      setOrigin([index], 50, 50);
      el.style.opacity = "0";
      el.style.transform = "scale(2) translate(100px) rotate(20deg)";

      updateStack(index, "prev");

      await new Promise((resolve) => setTimeout(resolve, speed / 2));

      setTransition([index], "all", speed, "ease-in", 0);
      await runTransition(
        [index],
        () => ({ transform: "none", opacity: "1" }),
        speed,
      );
    },
    [
      closeDeck,
      fan,
      resetTransition,
      runTransition,
      setOrigin,
      setTransition,
      speed,
      updateStack,
    ],
  );

  const dispatch = useCallback(
    async (action, needsPrepare) => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      try {
        if (needsPrepare && !closedRef.current) {
          await closeDeck();
        }
        await action();
      } finally {
        animatingRef.current = false;
      }
    },
    [closeDeck],
  );

  useEffect(() => {
    const normalized = items.map(normalize);
    setCards(normalized);
    setAdded(false);
    pendingAddRef.current = 0;
    zRef.current = normalized.map((_, i) => Z_MIN + normalized.length - 1 - i);
    closedRef.current = true;
    animatingRef.current = false;
  }, [items]);

  useEffect(() => {
    const count = cards.length;
    if (zRef.current.length !== count) {
      const previous = zRef.current.length;
      const next = zRef.current.slice();
      for (let i = previous; i < count; i += 1) {
        next[i] = Z_MIN + i;
      }
      zRef.current = next;
    }

    const pending = pendingAddRef.current;
    const first = cards.length - pending;

    zRef.current.forEach((z, i) => {
      const el = nodesRef.current[i];
      if (!el) return;
      el.style.zIndex = String(z);
      if (pending > 0 && i >= first) return;
      el.style.transformOrigin = "50% 50%";
    });

    if (pending > 0) {
      const newIndices = [];
      for (let i = first; i < cards.length; i += 1) newIndices.push(i);

      newIndices.forEach((i, order) => {
        const el = nodesRef.current[i];
        if (!el) return;
        el.style.opacity = "0";
        el.style.transformOrigin = "50% 50%";
        el.style.transition = "none";
        el.style.transform = "scale(1.8) translate(200px) rotate(15deg)";
        el.style.transition =
          "all " +
          addSpeed +
          "ms ease-out " +
          (newIndices.length - 1 - order) * addStagger +
          "ms";
      });

      const total = addSpeed + newIndices.length * addStagger;
      runTransition(
        newIndices,
        () => ({ transform: "none", opacity: "1" }),
        total,
      ).then(() => {
        resetTransition(newIndices);
        pendingAddRef.current = 0;
        animatingRef.current = false;
      });
    }
  }, [cards, addSpeed, addStagger, resetTransition, runTransition]);

  const handleAdd = () => {
    if (animatingRef.current || added || addItems.length === 0) return;
    animatingRef.current = true;
    setAdded(true);
    pendingAddRef.current = addItems.length;
    setCards((previous) => [
      ...previous,
      ...addItems.map((item, i) => normalize(item, previous.length + i)),
    ]);
  };

  const buttonClass =
    "inline-flex items-center justify-center cursor-pointer select-none border px-3 py-2 text-[10px] font-medium uppercase leading-none tracking-[0.16em] transition-colors duration-200 hover:bg-[var(--hover-bg)] hover:text-[var(--hover-color)] hover:border-[var(--hover-bg)]";

  return (
    <div
      className={"w-full min-h-screen px-6 py-10 " + className}
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto w-full max-w-4xl">
        {showControls ? (
          <nav className="flex flex-wrap justify-center gap-2 pb-4">
            {presets.map((preset, i) => (
              <span
                key={preset.label + i}
                role="button"
                tabIndex={0}
                className={buttonClass}
                style={{
                  backgroundColor: buttonBg,
                  color: buttonColor,
                  borderColor: buttonBorder,
                  "--hover-bg": buttonHoverBg,
                  "--hover-color": buttonHoverColor,
                }}
                onClick={() => dispatch(() => fan(preset), true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    dispatch(() => fan(preset), true);
                  }
                }}
              >
                {preset.label}
              </span>
            ))}
            {showAddButton && addItems.length > 0 ? (
              <span
                role="button"
                tabIndex={0}
                className={
                  buttonClass + (added ? " pointer-events-none opacity-40" : "")
                }
                style={{
                  backgroundColor: buttonBg,
                  color: buttonColor,
                  borderColor: buttonBorder,
                  "--hover-bg": buttonHoverBg,
                  "--hover-color": buttonHoverColor,
                }}
                onClick={handleAdd}
              >
                Add items
              </span>
            ) : null}
          </nav>
        ) : null}

        <div
          className="relative mx-auto my-8"
          style={{ width: cardWidth, height: cardHeight }}
        >
          <ul className="relative m-0 h-full w-full list-none p-0">
            {cards.map((card, index) => (
              <li
                key={card.image + index}
                ref={(el) => setNode(el, index)}
                className="absolute left-0 top-0 h-full w-full cursor-pointer select-none overflow-hidden"
                style={{
                  backgroundColor: cardBg,
                  borderRadius: cardRadius,
                  padding: cardPadding,
                  boxShadow:
                    "inset 0 0 0 1px " + cardRingColor + ", " + cardShadow,
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                }}
                onClick={() => dispatch(() => moveToFront(index), false)}
              >
                <img
                  src={card.image}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 block h-full w-full object-cover"
                  style={{ filter: "brightness(" + imageBrightness + ")" }}
                />
                {showCaptions ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0"
                    style={{
                      height: scrimHeight + "%",
                      background:
                        "linear-gradient(to top, " +
                        scrimColor +
                        " 0%, " +
                        scrimColor +
                        " 22%, transparent 100%)",
                    }}
                  />
                ) : null}
                {showCaptions ? (
                  <div
                    className="absolute inset-x-0 bottom-0 flex flex-col"
                    style={{ padding: captionPadding }}
                  >
                    <span
                      className="mb-3 text-[9px] font-medium uppercase tracking-[0.24em]"
                      style={{ color: indexColor }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4
                      className="text-[19px] font-medium leading-[1.15] tracking-[-0.015em]"
                      style={{ color: titleColor }}
                    >
                      {card.title}
                    </h4>
                    <p
                      className="mt-2 text-[11px] font-normal leading-relaxed"
                      style={{ color: textColor }}
                    >
                      {card.text}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {showNav ? (
          <nav className="flex items-center justify-center gap-2 pb-24 pt-16">
            <span
              role="button"
              tabIndex={0}
              className={buttonClass + " h-9 w-9 p-0"}
              style={{
                backgroundColor: navButtonBg,
                color: navButtonColor,
                borderColor: navButtonBg,
                "--hover-bg": navButtonHoverBg,
                "--hover-color": navButtonColor,
              }}
              onClick={() => dispatch(() => navigate("prev"), true)}
              aria-label="Previous card"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  d="M15 5 8 12l7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="square"
                />
              </svg>
            </span>
            <span
              role="button"
              tabIndex={0}
              className={buttonClass + " h-9 w-9 p-0"}
              style={{
                backgroundColor: navButtonBg,
                color: navButtonColor,
                borderColor: navButtonBg,
                "--hover-bg": navButtonHoverBg,
                "--hover-color": navButtonColor,
              }}
              onClick={() => dispatch(() => navigate("next"), true)}
              aria-label="Next card"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  d="m9 5 7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="square"
                />
              </svg>
            </span>
            <span
              role="button"
              tabIndex={0}
              className={buttonClass + " h-9 gap-2"}
              style={{
                backgroundColor: navButtonBg,
                color: navButtonColor,
                borderColor: navButtonBg,
                "--hover-bg": navButtonHoverBg,
                "--hover-color": navButtonColor,
              }}
              onClick={() => dispatch(() => closeDeck(), false)}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="square"
                />
              </svg>
              Collapse
            </span>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
