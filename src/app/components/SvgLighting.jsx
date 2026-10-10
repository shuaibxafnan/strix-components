"use client";

import { useEffect, useRef } from "react";

// ─── LightingCard ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// theme            string   "dark"            "light" | "dark" | "system"
// borderWidth      number   2                 Card border thickness (px)
// cardWidth        number   220               Card width (px)
// gridSize         number   45                Background grid cell size (px)
// lights           array    see DEFAULT_LIGHTS Array of light config objects:
//   { label, img, color, constant, exponent, surface, z, initX, initY }
//   initX/initY: pixel offset from viewport center (same as original CSS translate)
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_LIGHTS = [
  {
    label: "spotify",
    img: "https://assets.codepen.io/605876/spotify.png",
    color: "hsl(142,77%,48%)",
    constant: 10,
    exponent: 150,
    surface: 1,
    z: 170,
    initX: -70,
    initY: 210,
  },
  {
    label: "raycast",
    img: "https://assets.codepen.io/605876/raycast.png",
    color: "hsl(0,100%,69%)",
    constant: 2,
    exponent: 300,
    surface: 1,
    z: 160,
    initX: 70,
    initY: -200,
  },
  {
    label: "discord",
    img: "https://assets.codepen.io/605876/discord.png",
    color: "hsl(235,86%,73%)",
    constant: 12,
    exponent: 110,
    surface: 1,
    z: 160,
    initX: -180,
    initY: -40,
  },
  {
    label: "screen studio",
    img: "https://assets.codepen.io/605876/screenstudio.png",
    color: "hsl(267,61%,48%)",
    constant: 20,
    exponent: 120,
    surface: 1,
    z: 120,
    initX: 170,
    initY: 100,
  },
];

export default function SvgLighting({
  theme = "dark",
  borderWidth = 2,
  cardWidth = 220,
  gridSize = 45,
  lights = DEFAULT_LIGHTS,
}) {
  const svgRef = useRef(null);
  const cardRef = useRef(null);
  const iconRefs = useRef([]);
  // Stores current translate for each icon and the card
  const iconPos = useRef(lights.map((l) => ({ x: l.initX, y: l.initY })));
  const cardPos = useRef({ x: 0, y: 0 });

  // Compute fePointLight x/y in card-local pixel space from an icon element
  const syncLight = (index) => {
    const icon = iconRefs.current[index];
    const card = cardRef.current;
    const svg = svgRef.current;
    if (!icon || !card || !svg) return;
    const ir = icon.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    const lx = ir.left + ir.width / 2 - cr.left;
    const ly = ir.top + ir.height / 2 - cr.top;
    const fePoint = svg.querySelector(`#fl${index} fePointLight`);
    if (fePoint) {
      fePoint.setAttribute("x", lx);
      fePoint.setAttribute("y", ly);
    }
  };

  const syncAllLights = () => {
    lights.forEach((_, i) => syncLight(i));
  };

  useEffect(() => {
    // Drag state — kept entirely in a plain object, never in React state
    const drag = {
      active: false,
      type: null,
      index: -1,
      startX: 0,
      startY: 0,
      origX: 0,
      origY: 0,
    };

    const onPointerDown = (e, type, index) => {
      e.preventDefault();
      drag.active = true;
      drag.type = type;
      drag.index = index;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      if (type === "icon") {
        drag.origX = iconPos.current[index].x;
        drag.origY = iconPos.current[index].y;
      } else {
        drag.origX = cardPos.current.x;
        drag.origY = cardPos.current.y;
      }
    };

    const onPointerMove = (e) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const nx = drag.origX + dx;
      const ny = drag.origY + dy;

      if (drag.type === "icon") {
        iconPos.current[drag.index] = { x: nx, y: ny };
        const el = iconRefs.current[drag.index];
        if (el) el.style.transform = `translate(${nx}px, ${ny}px)`;
        syncLight(drag.index);
      } else {
        cardPos.current = { x: nx, y: ny };
        const el = cardRef.current;
        if (el) el.style.transform = `translate(${nx}px, ${ny}px)`;
        syncAllLights();
      }
    };

    const onPointerUp = () => {
      drag.active = false;
    };

    // Attach to each icon
    const iconHandlers = iconRefs.current.map((el, i) => {
      if (!el) return null;
      const fn = (e) => onPointerDown(e, "icon", i);
      el.addEventListener("pointerdown", fn);
      return fn;
    });

    // Attach to card
    const cardFn = (e) => onPointerDown(e, "card", -1);
    const cardEl = cardRef.current;
    if (cardEl) cardEl.addEventListener("pointerdown", cardFn);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Initial sync — wait one frame for layout
    const rafId = requestAnimationFrame(() => syncAllLights());

    return () => {
      iconRefs.current.forEach((el, i) => {
        if (el && iconHandlers[i])
          el.removeEventListener("pointerdown", iconHandlers[i]);
      });
      if (cardEl) cardEl.removeEventListener("pointerdown", cardFn);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const bgPage = isDark ? "#000" : "#fff";
  const cardBg = isDark ? "hsl(240,3%,14%)" : "canvas";
  const gridLine = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardHeight = Math.round((cardWidth * 4) / 3);
  const bw = borderWidth;

  // The original uses filterUnits="objectBoundingBox" on the SVG filter,
  // BUT the filter is defined inside the surface element and the fePointLight
  // x/y are set in pixels via JS using getBoundingClientRect differences.
  // This works because the SVG is sized 100px×100px absolutely inside the card,
  // and the filter references are resolved in the SVG's local coordinate space.
  // We replicate this: SVG is 100%×100% with overflow:visible, filterUnits="userSpaceOnUse"
  // so fePointLight pixel coords map directly to card-local space.

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden select-none"
      style={{ background: bgPage }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, ${gridLine} 1px, transparent 1px ${gridSize}px),
            linear-gradient(${gridLine} 1px, transparent 1px ${gridSize}px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${gridSize * 0.36}px 50%, 0% ${gridSize * 0.32}px`,
          WebkitMaskImage: "linear-gradient(-20deg, transparent 50%, white)",
          maskImage: "linear-gradient(-20deg, transparent 50%, white)",
        }}
      />

      {/* SVG filter — defined here, referenced by border overlay below.
          Must be in the DOM before the element that uses it. */}
      <svg
        ref={svgRef}
        className="absolute pointer-events-none overflow-visible"
        style={{ width: 0, height: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="lc-lighting"
            filterUnits="userSpaceOnUse"
            x={-cardWidth}
            y={-cardHeight}
            width={cardWidth * 3}
            height={cardHeight * 3}
          >
            {lights.map((light, i) => (
              <feSpecularLighting
                key={i}
                in="SourceAlpha"
                result={`light${i + 1}`}
                id={`fl${i}`}
                specularConstant={light.constant}
                specularExponent={light.exponent}
                surfaceScale={light.surface}
                lightingColor={light.color}
              >
                <fePointLight x={0} y={0} z={light.z} />
              </feSpecularLighting>
            ))}

            {/* Blend pair 1+2 */}
            <feBlend in="light1" in2="light2" mode="screen" result="blend12" />
            {/* Blend pair 3+4 */}
            <feBlend in="light3" in2="light4" mode="screen" result="blend34" />
            {/* Blend all */}
            <feBlend
              in="blend12"
              in2="blend34"
              mode="screen"
              result="allLights"
            />

            {/* Composite: apply lighting only where source (border shape) is opaque */}
            <feComposite
              in="allLights"
              in2="SourceGraphic"
              operator="in"
              result="litShape"
            />
            <feMerge>
              <feMergeNode in="litShape" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Draggable icon lights */}
      {lights.map((light, i) => (
        <div
          key={light.label}
          ref={(el) => (iconRefs.current[i] = el)}
          className="absolute z-[99999] cursor-grab active:cursor-grabbing touch-none rounded-xl overflow-hidden"
          style={{
            width: 80,
            height: 80,
            transform: `translate(${light.initX}px, ${light.initY}px)`,
          }}
        >
          <img
            src={light.img}
            alt={light.label}
            className="w-full h-full block pointer-events-none"
            draggable={false}
          />
        </div>
      ))}

      {/* Card */}
      <div
        ref={cardRef}
        className="absolute cursor-grab active:cursor-grabbing touch-none"
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: 12,
        }}
      >
        {/* Base surface layer — background + blur */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 12,
            background: cardBg,
            backdropFilter: "blur(6px) saturate(0.9)",
          }}
        />

        {/* Static border — dim base line (replicates ::before) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 12,
            border: `${bw}px solid transparent`,
            backgroundImage: `linear-gradient(${cardBg}, ${cardBg}), linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15))`,
            backgroundOrigin: "padding-box, border-box",
            backgroundClip: "padding-box, border-box",
          }}
        />

        {/* Lit border — white fill masked to border strip only, filter applies lighting (replicates ::after) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 12,
            border: `${bw}px solid transparent`,
            // White fill clipped to border-box only (the border ring)
            backgroundImage: `linear-gradient(white, white)`,
            backgroundOrigin: "border-box",
            backgroundClip: "border-box",
            WebkitMaskImage:
              "linear-gradient(transparent, transparent) padding-box, linear-gradient(white, white) border-box",
            WebkitMaskComposite: "destination-out",
            maskImage:
              "linear-gradient(transparent, transparent) padding-box, linear-gradient(white, white) border-box",
            maskComposite: "exclude",
            filter: "url(#lc-lighting)",
          }}
        />

        {/* Mac-style nav dots */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center gap-2 px-2 pointer-events-none"
          style={{ height: 26, zIndex: 2 }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "hsl(359,93%,67%)" }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "hsl(48,91%,52%)" }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "hsl(133,56%,50%)" }}
          />
        </div>
      </div>
    </div>
  );
}
