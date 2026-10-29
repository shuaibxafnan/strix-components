"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Space_Mono } from "next/font/google";

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

const SHAPES = ["rectangle", "circle", "diamond", "hexagon"];

const CLIP_PATHS = {
  rectangle: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  circle: "circle(45% at 50% 50%)",
  diamond: "polygon(50% 0%, 14.1% 50%, 50% 100%, 85.9% 50%)",
  hexagon: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
};

const SHAPE_BUTTON = {
  rectangle: "h-4 w-4",
  circle: "h-4 w-4 rounded-full",
  diamond: "h-[14px] w-[14px] rotate-45",
  hexagon: "h-[19px] w-[19px] [clip-path:polygon(25%_6.7%,75%_6.7%,100%_50%,75%_93.3%,25%_93.3%,0%_50%)]",
};

const SLIDER =
  "h-0.5 w-20 cursor-pointer appearance-none bg-white/20 outline-none [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125";

const BLUR_SEQUENCE = [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 1.3, 1.6];

const DEFAULT_SHAPE_LABELS = {
  rectangle: "Rectangle",
  circle: "Circle",
  diamond: "Diamond",
  hexagon: "Hexagon",
};

const DEFAULT_TOGGLE_LABELS = {
  rotation: "rotation",
  blur: "blur",
  color: "color",
  opacity: "opacity",
  parallax: "parallax",
  threeD: "3d",
};

const DEFAULT_TUNER_LABELS = { tilt: "tilt", pan: "pan", depth: "depth", amp: "amp" };

export default function MultiEffectCard({
  imageUrl = "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&h=1200&q=80",
  imageAlt = "Stacked image",
  layerCount = 10,
  size = 600,
  initialShape = "rectangle",
  depthStep = 36,
  scale3d = 0.07,
  tiltMax = 45,
  panMax = 88,
  opacityFalloff = 0.1,
  moveAmplify = 0.54,
  tiltBoost = 1.25,
  panBoost = 1.25,
  shapeLabels = DEFAULT_SHAPE_LABELS,
  toggleLabels = DEFAULT_TOGGLE_LABELS,
  tunerLabels = DEFAULT_TUNER_LABELS,
  onLabel = "on",
  backgroundColor = "bg-black",
  className = "",
}) {
  const containerRef = useRef(null);
  const stackRef = useRef(null);
  const apiRef = useRef(null);
  const shapeRef = useRef(initialShape);
  const optionsRef = useRef({});
  const paramsRef = useRef({});

  const [activeShape, setActiveShape] = useState(initialShape);
  const [rotationOn, setRotationOn] = useState(false);
  const [blurOn, setBlurOn] = useState(false);
  const [colorOn, setColorOn] = useState(false);
  const [opacityOn, setOpacityOn] = useState(false);
  const [parallaxOn, setParallaxOn] = useState(false);
  const [threeDOn, setThreeDOn] = useState(false);
  const [tilt, setTilt] = useState(tiltMax);
  const [pan, setPan] = useState(panMax);
  const [depth, setDepth] = useState(depthStep);
  const [amp, setAmp] = useState(Math.round(moveAmplify * 100));

  optionsRef.current = {
    rotation: rotationOn,
    blur: blurOn,
    color: colorOn,
    opacity: opacityOn,
    parallax: parallaxOn,
    threeD: threeDOn,
  };

  paramsRef.current = {
    depthStep: depth,
    scale3D: scale3d,
    tiltMax: tilt,
    panMax: pan,
    opacityFalloff,
    moveAmplify: amp / 100,
    tiltBoost,
    panBoost,
  };

  useEffect(() => {
    const container = containerRef.current;
    const stack = stackRef.current;
    if (!container || !stack) return undefined;

    const layers = Array.from(stack.children);
    const duration = 0.8;
    const ease = "power2.inOut";
    const scaleInterval = 0.06;
    const opacityInterval = 0.05;
    const rotationInterval = 15;
    const stagger = 0.1;
    const followStrength = 0.15;

    let timeline = null;
    let isParallax = optionsRef.current.parallax;
    let isOpacity = optionsRef.current.opacity;
    let isRotation = optionsRef.current.rotation;
    let isBlur = optionsRef.current.blur;
    let isColor = optionsRef.current.color;
    let is3D = optionsRef.current.threeD;
    let isHovered = false;
    let rect = container.getBoundingClientRect();
    let rafId = 0;
    let pendingEvent = null;
    let leaveTimer = 0;

    const observer = new ResizeObserver(() => {
      rect = container.getBoundingClientRect();
    });
    observer.observe(container);

    const quickTos = layers
      .map((layer, i) => {
        if (i === 0) return null;
        const sv = 1 - scaleInterval * i;
        return {
          mult: sv > 0 ? (1 - sv) * 3 + 0.2 : 1,
          xTo: gsap.quickTo(layer, "x", { duration: 0.6, ease: "power3" }),
          yTo: gsap.quickTo(layer, "y", { duration: 0.6, ease: "power3" }),
        };
      })
      .filter(Boolean);

    const getScale = (i) => Math.max(1 - scaleInterval * i, 0);
    const getOpacity = (i) => (!isOpacity ? 1 : Math.max(1 - opacityInterval * i, 0.1));
    const getRotation = (i) => rotationInterval * i * (i % 2 === 0 ? 1 : -1);
    const getBlur = (i) =>
      !isBlur || i === 0 ? 0 : BLUR_SEQUENCE[Math.min(i, BLUR_SEQUENCE.length - 1)];
    const getColor = (i) => {
      if (!isColor) return "";
      if (i === 0) return "grayscale(1)";
      const ci = Math.min(i * 0.15, 1);
      return `grayscale(${1 - ci}) saturate(${1 + ci * 0.5})`;
    };

    const applyFilters = () => {
      layers.forEach((layer, i) => {
        const blur = getBlur(i);
        const color = getColor(i);
        const filter = `${blur > 0 ? `blur(${blur}px) ` : ""}${color}`.trim();
        layer.style.filter = filter || "none";
      });
    };

    const reset2D = () => {
      gsap.killTweensOf(stack);
      layers.forEach((layer) => {
        gsap.killTweensOf(layer);
        layer.style.transform = "";
        layer.style.filter = "none";
      });
      gsap.set(layers, {
        scale: (i) => (i === 0 ? 1 : 0.95),
        opacity: (i) => (i === 0 ? 1 : 0),
        rotation: 0,
        x: 0,
        y: 0,
        z: 0,
      });
      gsap.set(stack, { rotationX: 0, rotationY: 0, rotationZ: 0, x: 0, y: 0, z: 0, scale: 1 });
    };

    const createTimeline = () => {
      timeline?.kill();
      timeline = gsap.timeline({ paused: true }).to([...layers].reverse(), {
        scale: (_, t) => getScale(layers.indexOf(t)),
        opacity: (_, t) => {
          const idx = layers.indexOf(t);
          return idx === 0 ? 1 : getOpacity(idx);
        },
        rotation: (_, t) => (isRotation ? getRotation(layers.indexOf(t)) : 0),
        duration,
        ease,
        stagger,
      });
      applyFilters();
    };

    const applyShape = (shape) => {
      layers.forEach((layer, i) => {
        if (i > 0) layer.style.clipPath = CLIP_PATHS[shape];
      });
    };

    const center2D = () =>
      layers.forEach((layer, i) => {
        if (i > 0) gsap.to(layer, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
      });

    const opacity3D = (i) => {
      const base = Math.max(1 - paramsRef.current.opacityFalloff * i, 0.25);
      return isOpacity ? Math.max(base - opacityInterval * i, 0.1) : base;
    };

    const layout3D = (depthFactor = 1) => {
      const p = paramsRef.current;
      layers.forEach((layer, i) => {
        const z = Math.round(i * p.depthStep * depthFactor) + i * 0.1;
        const s = Math.max(1 - i * p.scale3D, 0.35);
        const rotZ = isRotation ? getRotation(i) : 0;
        layer.style.transform = `translateZ(${z}px) scale(${s}) rotateZ(${rotZ}deg)`;
        layer.style.opacity = opacity3D(i);
      });
      applyFilters();
    };

    const flatten3D = () =>
      gsap.to(stack, { rotationX: 0, rotationY: 0, x: 0, y: 0, scale: 1, duration: 0.3, ease: "power2.out" });

    const center3D = () =>
      gsap.to(stack, { rotationX: 0, rotationY: 0, x: 0, y: 0, duration: 0.6, ease: "power2.out" });

    const enable3D = () => {
      is3D = true;
      timeline?.pause(0);
      gsap.to([...layers].reverse(), {
        scale: (_, t) => {
          const idx = layers.indexOf(t);
          return idx === 0 ? 1 : Math.max(1 - idx * paramsRef.current.scale3D, 0.35);
        },
        opacity: (_, t) => {
          const idx = layers.indexOf(t);
          return idx === 0 ? 1 : opacity3D(idx);
        },
        duration,
        ease,
        stagger,
        onComplete: () => {
          layout3D();
          if (isHovered) {
            container.dataset.active = "true";
            flatten3D();
          }
        },
      });
    };

    const disable3D = () => {
      is3D = false;
      delete container.dataset.active;
      gsap.killTweensOf(stack);
      gsap.to(stack, {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        duration: 0.28,
        ease: "power2.out",
      });
      gsap.to([...layers].reverse(), {
        scale: (_, t) => (layers.indexOf(t) === 0 ? 1 : 0.95),
        opacity: (_, t) => (layers.indexOf(t) === 0 ? 1 : 0),
        rotation: 0,
        duration,
        ease,
        stagger: -stagger,
        onComplete: () => {
          reset2D();
          createTimeline();
        },
      });
    };

    const tiltPan = (e) => {
      if (!is3D || !isHovered) return;
      const p = paramsRef.current;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      layout3D(0.9 + Math.min(1, Math.hypot(nx, ny)) * 0.2);
      const t = p.tiltMax * p.tiltBoost * p.moveAmplify;
      const pn = p.panMax * p.panBoost * p.moveAmplify;
      gsap.to(stack, {
        rotationY: nx * t,
        rotationX: -ny * t,
        x: nx * pn,
        y: ny * pn,
        scale: 1,
        duration: 0.18,
        ease: "power2.out",
      });
    };

    const processMove = () => {
      const e = pendingEvent;
      pendingEvent = null;
      rafId = 0;
      if (!e) return;

      if (is3D) {
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (inside) tiltPan(e);
        else center3D();
        return;
      }
      if (!isParallax || !isHovered) return;
      const rx = (e.clientX - rect.left) / rect.width - 0.5;
      const ry = (e.clientY - rect.top) / rect.height - 0.5;
      quickTos.forEach(({ xTo, yTo, mult }) => {
        xTo(rx * 2 * rect.width * followStrength * mult);
        yTo(ry * 2 * rect.height * followStrength * mult);
      });
    };

    const onMove = (e) => {
      pendingEvent = e;
      if (!rafId) rafId = requestAnimationFrame(processMove);
    };
    document.addEventListener("mousemove", onMove);

    const refresh = () => {
      timeline?.kill();
      createTimeline();
      timeline.progress(isHovered ? 1 : 0);
    };

    apiRef.current = {
      enter() {
        isHovered = true;
        if (is3D) {
          container.dataset.active = "true";
          layout3D();
          flatten3D();
        } else {
          timeline?.play();
        }
      },
      leave() {
        isHovered = false;
        if (is3D) {
          center3D();
          delete container.dataset.active;
        } else if (!isParallax) {
          timeline?.reverse();
        }
        if (isParallax) center2D();
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => {
          if (!isHovered && !is3D && !isParallax) center2D();
        }, duration * 1000);
      },
      changeShape(shape) {
        timeline?.pause();
        reset2D();
        applyShape(shape);
        createTimeline();
        if (is3D) layout3D();
      },
      toggleRotation(v) {
        isRotation = v;
        if (is3D) {
          layout3D();
        } else {
          if (!v) layers.forEach((layer) => gsap.set(layer, { rotation: 0 }));
          refresh();
        }
      },
      toggleBlur(v) {
        isBlur = v;
        applyFilters();
        if (is3D) layout3D();
      },
      toggleColor(v) {
        isColor = v;
        applyFilters();
        if (is3D) layout3D();
      },
      toggleOpacity(v) {
        isOpacity = v;
        if (is3D) layout3D();
        else refresh();
      },
      toggleParallax(v) {
        isParallax = v;
        if (!v) {
          center2D();
          if (isHovered) timeline?.play();
          else timeline?.reverse();
        }
      },
      toggle3D(v) {
        if (v) enable3D();
        else disable3D();
      },
    };

    reset2D();
    applyShape(shapeRef.current);
    createTimeline();
    applyFilters();
    if (is3D) enable3D();

    return () => {
      document.removeEventListener("mousemove", onMove);
      observer.disconnect();
      cancelAnimationFrame(rafId);
      clearTimeout(leaveTimer);
      timeline?.kill();
      gsap.killTweensOf([stack, ...layers]);
      apiRef.current = null;
    };
  }, [layerCount]);

  const selectShape = (shape) => {
    shapeRef.current = shape;
    setActiveShape(shape);
    apiRef.current?.changeShape(shape);
  };

  const toggle = (name) => {
    const api = apiRef.current;
    const current = optionsRef.current;
    const next = !current[name];

    if (next && name === "parallax" && current.threeD) {
      setThreeDOn(false);
      api?.toggle3D(false);
    }
    if (next && name === "threeD" && current.parallax) {
      setParallaxOn(false);
      api?.toggleParallax(false);
    }

    const setters = {
      rotation: [setRotationOn, "toggleRotation"],
      blur: [setBlurOn, "toggleBlur"],
      color: [setColorOn, "toggleColor"],
      opacity: [setOpacityOn, "toggleOpacity"],
      parallax: [setParallaxOn, "toggleParallax"],
      threeD: [setThreeDOn, "toggle3D"],
    };
    const [setState, method] = setters[name];
    setState(next);
    api?.[method](next);
  };

  const toggles = [
    ["rotation", rotationOn],
    ["blur", blurOn],
    ["color", colorOn],
    ["opacity", opacityOn],
    ["parallax", parallaxOn],
    ["threeD", threeDOn],
  ];

  const tuners = [
    ["tilt", 1, 50, tilt, setTilt, String(tilt).padStart(3, " ")],
    ["pan", 1, 200, pan, setPan, String(pan).padStart(3, " ")],
    ["depth", 1, 100, depth, setDepth, String(depth).padStart(3, " ")],
    ["amp", 1, 300, amp, setAmp, (amp / 100).toFixed(2)],
  ];

  return (
    <div
      className={`${mono.variable} relative flex min-h-screen flex-col items-center justify-center gap-8 text-white [background-image:radial-gradient(circle,#222_1px,transparent_1px)] [background-size:20px_20px] [font-family:var(--font-mono)] ${backgroundColor} ${className}`}
      style={{ "--size": `${size}px` }}
    >
      <div
        ref={containerRef}
        onMouseEnter={() => apiRef.current?.enter()}
        onMouseLeave={() => apiRef.current?.leave()}
        className={`relative h-[var(--size)] w-[var(--size)] max-w-full cursor-pointer border border-white/15 data-[active=true]:isolate data-[active=true]:[perspective-origin:50%_50%] data-[active=true]:[perspective:1600px] ${threeDOn ? "overflow-visible" : "overflow-hidden"
          }`}
      >
        <div
          ref={stackRef}
          className="absolute inset-0 [transform-style:flat] will-change-transform [[data-active=true]_&]:[transform-style:preserve-3d]"
        >
          {Array.from({ length: layerCount }, (_, i) => (
            <img
              key={i}
              src={imageUrl}
              alt={i === 0 ? imageAlt : ""}
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover [backface-visibility:hidden] will-change-[transform,opacity] ${i === 0 ? "" : "opacity-0 [transform:scale(0.95)]"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex w-[var(--size)] max-w-full items-start justify-between max-[480px]:flex-col max-[480px]:items-center max-[480px]:gap-4">
        <div className="flex items-center gap-2.5">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              type="button"
              aria-label={shapeLabels[shape]}
              onClick={() => selectShape(shape)}
              className={`cursor-pointer border-0 bg-white transition-opacity duration-300 ${SHAPE_BUTTON[shape]} ${activeShape === shape ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-end gap-2 max-[480px]:items-center">
          {toggles.map(([name, active]) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`cursor-pointer border-0 bg-transparent text-xs uppercase tracking-wide transition-colors duration-200 ${active ? "text-white" : "text-neutral-500 hover:text-white"
                }`}
            >
              {active ? `${toggleLabels[name]} ${onLabel}` : toggleLabels[name]}
            </button>
          ))}

          <div
            className={`absolute right-0 top-full z-[1000] mt-2 overflow-hidden transition-all duration-700 ${threeDOn ? "max-h-[200px] opacity-100" : "pointer-events-none max-h-0 opacity-0"
              }`}
          >
            {tuners.map(([name, min, max, value, onChange, display], index) => (
              <div
                key={name}
                style={{ transitionDelay: threeDOn ? `${0.1 + index * 0.05}s` : "0s" }}
                className={`mb-1.5 flex items-center justify-end gap-2 transition-all duration-500 ${threeDOn ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
                  }`}
              >
                <label
                  htmlFor={`tuner-${name}`}
                  className="w-[50px] text-right text-[0.6rem] uppercase tracking-wide text-neutral-500"
                >
                  {tunerLabels[name]}
                </label>
                <input
                  id={`tuner-${name}`}
                  type="range"
                  min={min}
                  max={max}
                  step={1}
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                  className={SLIDER}
                />
                <span className="w-[35px] whitespace-pre text-right text-[0.6rem] text-white [font-variant-numeric:tabular-nums]">
                  {display}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}