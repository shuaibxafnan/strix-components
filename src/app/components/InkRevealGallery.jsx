"use client";

import { useEffect, useRef } from "react";

// ─── InkRevealGallery ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// logoText             string   "Sonic Meditation"        Header logo text
// items                array    [see default below]       Gallery entries: each
//                                                          { image, date, title, subtitle,
//                                                            colStart, colSpan, rowStart, rowSpan,
//                                                            height, extraSpacing }
// bgColor              string   "#0a0a0a"                  Page background color
// textColor            string   "#e0e0e0"                  Base text color
// gridColor            string   "rgba(255,255,255,0.15)"   Grid overlay column line color
// columns              number   12                         Number of grid columns
// gutter               string   "0.75rem"                  Grid column gap
// rowSpacing           string   "4rem"                     Extra top margin for staggered items
// padding              string   "2rem"                     Outer page padding
// maskRadius           number   0.35                       Ink-reveal circle radius (0–0.5)
// maskSpeed            number   0.75                        Marbling flow speed
// animationSpeed       number   1                          Global shader time speed multiplier
// appearDuration       number   0.4                        Radius grow tween duration (s)
// disappearDuration    number   0.3                        Radius shrink tween duration (s)
// turbulenceIntensity  number   0.225                       Ink marbling turbulence strength
// effectType           number   0                          0 Invert · 1 B&W · 2 Sepia · 3 Duotone · 4 Pixelate · 5 Blur
// effectIntensity      number   0.5                        Strength for Pixelate/Blur effects
// invertMask           bool     false                      Swap which side of the mask reveals
// effectColor1         string   "#3366cc"                  Duotone shadow color
// effectColor2         string   "#e63333"                  Duotone highlight color
// frameSkip            number   0                          Skip N frames per render (perf)
// ──────────────────────────────────────────────────────────────────────────

const VERTEX_SHADER = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_radius;
  uniform float u_speed;
  uniform float u_imageAspect;
  uniform float u_turbulenceIntensity;
  uniform int u_effectType;
  uniform vec3 u_effectColor1;
  uniform vec3 u_effectColor2;
  uniform float u_effectIntensity;
  uniform bool u_invertMask;
  varying vec2 v_uv;

  vec3 hash33(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.27);
    return fract(vec3(p.x * p.y, p.z * p.x, p.y * p.z));
  }

  float simplex_noise(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K2 * 2.0);
    vec3 d3 = d0 - (1.0 - 3.0 * K2);
    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i) * 2.0 - 1.0),
      dot(d1, hash33(i + i1) * 2.0 - 1.0),
      dot(d2, hash33(i + i2) * 2.0 - 1.0),
      dot(d3, hash33(i + 1.0) * 2.0 - 1.0)
    );
    return 0.5 + 0.5 * 31.0 * dot(n, vec4(1.0));
  }

  vec2 curl(vec2 p, float time) {
    const float epsilon = 0.001;
    float n1 = simplex_noise(vec3(p.x, p.y + epsilon, time));
    float n2 = simplex_noise(vec3(p.x, p.y - epsilon, time));
    float n3 = simplex_noise(vec3(p.x + epsilon, p.y, time));
    float n4 = simplex_noise(vec3(p.x - epsilon, p.y, time));
    return vec2((n2 - n1) / (2.0 * epsilon), (n4 - n3) / (2.0 * epsilon));
  }

  float inkMarbling(vec2 p, float time, float intensity) {
    float result = 0.0;
    vec2 flow = curl(p * 1.5, time * 0.1) * intensity * 2.0;
    result += simplex_noise(vec3((p + flow * 0.3) * 2.0, time * 0.15)) * 0.5;
    vec2 flow2 = curl(p * 3.0 + vec2(sin(time * 0.2), cos(time * 0.15)), time * 0.2) * intensity;
    result += simplex_noise(vec3((p + flow2 * 0.2) * 4.0, time * 0.25)) * 0.3;
    vec2 flow3 = curl(p * 6.0 + vec2(cos(time * 0.3), sin(time * 0.25)), time * 0.3) * intensity * 0.5;
    result += simplex_noise(vec3((p + flow3 * 0.1) * 8.0, time * 0.4)) * 0.2;
    float dist = length(p - vec2(0.5));
    float angle = atan(p.y - 0.5, p.x - 0.5);
    float spiral = sin(dist * 15.0 - angle * 2.0 + time * 0.3) * 0.5 + 0.5;
    result = mix(result, spiral, 0.3);
    return result * 0.5 + 0.5;
  }

  vec3 applySepia(vec3 c) {
    return vec3(
      c.r * 0.393 + c.g * 0.769 + c.b * 0.189,
      c.r * 0.349 + c.g * 0.686 + c.b * 0.168,
      c.r * 0.272 + c.g * 0.534 + c.b * 0.131
    );
  }

  vec3 applyDuotone(vec3 c, vec3 c1, vec3 c2) {
    float gray = dot(c, vec3(0.299, 0.587, 0.114));
    return mix(c1, c2, gray);
  }

  vec3 applyPixelate(sampler2D tex, vec2 uv, float pixelSize) {
    float dx = pixelSize * (1.0 / u_resolution.x);
    float dy = pixelSize * (1.0 / u_resolution.y);
    vec2 puv = vec2(dx * floor(uv.x / dx), dy * floor(uv.y / dy));
    return texture2D(tex, puv).rgb;
  }

  vec3 applyBlur(sampler2D tex, vec2 uv, float blurAmount) {
    float dx = blurAmount * (1.0 / u_resolution.x);
    float dy = blurAmount * (1.0 / u_resolution.y);
    vec3 sum = vec3(0.0);
    sum += texture2D(tex, uv + vec2(-dx, -dy)).rgb * 0.0625;
    sum += texture2D(tex, uv + vec2(0.0, -dy)).rgb * 0.125;
    sum += texture2D(tex, uv + vec2(dx, -dy)).rgb * 0.0625;
    sum += texture2D(tex, uv + vec2(-dx, 0.0)).rgb * 0.125;
    sum += texture2D(tex, uv).rgb * 0.25;
    sum += texture2D(tex, uv + vec2(dx, 0.0)).rgb * 0.125;
    sum += texture2D(tex, uv + vec2(-dx, dy)).rgb * 0.0625;
    sum += texture2D(tex, uv + vec2(0.0, dy)).rgb * 0.125;
    sum += texture2D(tex, uv + vec2(dx, dy)).rgb * 0.0625;
    return sum;
  }

  void main() {
    vec2 uv = v_uv;
    float screenAspect = u_resolution.x / u_resolution.y;
    float ratio = u_imageAspect / screenAspect;
    vec2 texCoord = vec2(mix(0.5 - 0.5 / ratio, 0.5 + 0.5 / ratio, uv.x), uv.y);
    vec4 tex = texture2D(u_texture, texCoord);
    vec3 originalColor = tex.rgb;
    vec3 effectColor = originalColor;

    if (u_effectType == 1) {
      float gray = dot(originalColor, vec3(0.299, 0.587, 0.114));
      effectColor = vec3(gray);
    } else if (u_effectType == 2) {
      effectColor = applySepia(originalColor);
    } else if (u_effectType == 3) {
      effectColor = applyDuotone(originalColor, u_effectColor1, u_effectColor2);
    } else if (u_effectType == 4) {
      effectColor = applyPixelate(u_texture, texCoord, u_effectIntensity * 20.0);
    } else if (u_effectType == 5) {
      effectColor = applyBlur(u_texture, texCoord, u_effectIntensity * 5.0);
    }

    vec2 correctedUV = uv;
    correctedUV.x *= screenAspect;
    vec2 correctedMouse = u_mouse;
    correctedMouse.x *= screenAspect;
    float dist = distance(correctedUV, correctedMouse);

    float marbleEffect = inkMarbling(uv * 2.0 + u_time * u_speed * 0.1, u_time, u_turbulenceIntensity * 2.0);
    float jaggedDist = dist + (marbleEffect - 0.5) * u_turbulenceIntensity * 2.0;
    float mask = u_radius > 0.001 ? step(jaggedDist, u_radius) : 0.0;

    vec3 invertedColor;
    if (u_effectType == 0) {
      float gray = dot(originalColor, vec3(0.299, 0.587, 0.114));
      invertedColor = vec3(1.0 - gray);
    } else {
      invertedColor = originalColor;
    }

    vec3 finalColor = u_invertMask
      ? mix(invertedColor, effectColor, mask)
      : mix(effectColor, invertedColor, mask);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const DEFAULT_ITEMS = [
  {
    image:
      "https://cdn.cosmos.so/b1f1a774-ffad-48f8-8cf2-1c6ac0c75dd1?format=jpeg",
    date: "VOLUME I",
    title: "THE BLUE SILENCE",
    subtitle: "Exploring the depths of consciousness",
    colStart: 2,
    colSpan: 5,
    rowStart: 2,
    rowSpan: 2,
    height: "700px",
    extraSpacing: false,
  },
  {
    image:
      "https://cdn.cosmos.so/9ed5e53a-bc97-4f58-bbde-3c4590687eb7?format=jpeg",
    date: "SESSION 02",
    title: "ETHEREAL LANDSCAPES",
    subtitle: "Between dreams and reality",
    colStart: 8,
    colSpan: 4,
    rowStart: 2,
    rowSpan: 1,
    height: "300px",
    extraSpacing: false,
  },
  {
    image:
      "https://cdn.cosmos.so/17b5c6b8-91c7-420b-8b98-29ec22b1afbb?format=jpeg",
    date: "PASSAGE III",
    title: "RESONANT FREQUENCIES",
    subtitle: "The harmony of dissonance",
    colStart: 3,
    colSpan: 4,
    rowStart: 4,
    rowSpan: 1,
    height: "350px",
    extraSpacing: true,
  },
  {
    image:
      "https://cdn.cosmos.so/84950878-95e5-4db6-8904-3340c303cf29?format=jpeg",
    date: "CHAPTER IV",
    title: "TEMPORAL DISTORTION",
    subtitle: "Moments stretched into infinity",
    colStart: 8,
    colSpan: 3,
    rowStart: 3,
    rowSpan: 2,
    height: "450px",
    extraSpacing: true,
  },
];

const DEFAULT_NAV = ["Works", "Philosophy", "Process"];

function hexToVec3(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export default function InkRevealGallery({
  logoText = "Sonic Meditation",
  navItems = DEFAULT_NAV,
  items = DEFAULT_ITEMS,
  bgColor = "#0a0a0a",
  textColor = "#e0e0e0",
  gridColor = "rgba(255,255,255,0.15)",
  columns = 12,
  gutter = "0.75rem",
  rowSpacing = "4rem",
  padding = "2rem",
  maskRadius = 0.35,
  maskSpeed = 0.75,
  animationSpeed = 1,
  appearDuration = 0.4,
  disappearDuration = 0.3,
  turbulenceIntensity = 0.225,
  effectType = 0,
  effectIntensity = 0.5,
  invertMask = false,
  effectColor1 = "#3366cc",
  effectColor2 = "#e63333",
  frameSkip = 0,
}) {
  const containerRefs = useRef([]);
  const gridColRefs = useRef([]);
  const stateRef = useRef(new Map());
  const rafRef = useRef(null);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    let cancelled = false;
    const cleanupFns = [];

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
    ])
      .then(() => {
        if (cancelled) return;
        const THREE = window.THREE;
        const gsap = window.gsap;
        if (!THREE || !gsap) return;

        gsap.set(gridColRefs.current, { opacity: 0, scaleY: 0 });
        gsap.to(gridColRefs.current, {
          opacity: 1,
          scaleY: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: "power2.out",
          transformOrigin: "top",
        });

        const [c1r, c1g, c1b] = hexToVec3(effectColor1);
        const [c2r, c2g, c2b] = hexToVec3(effectColor2);

        containerRefs.current.forEach((container, idx) => {
          if (!container) return;
          const img = container.querySelector("img");
          const state = {
            scene: null,
            camera: null,
            renderer: null,
            uniforms: null,
            isInView: false,
            isMouseInside: false,
            targetMouse: new THREE.Vector2(0.5, 0.5),
            lerpedMouse: new THREE.Vector2(0.5, 0.5),
            radiusTween: null,
          };
          stateRef.current.set(idx, state);

          const loader = new THREE.TextureLoader();
          loader.load(img.src, (texture) => {
            if (cancelled) return;
            const imageAspect = texture.image.width / texture.image.height;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = false;

            const width = container.clientWidth;
            const height = container.clientHeight;

            state.scene = new THREE.Scene();
            state.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            state.uniforms = {
              u_texture: { value: texture },
              u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
              u_time: { value: 0.0 },
              u_resolution: { value: new THREE.Vector2(width, height) },
              u_radius: { value: 0.0 },
              u_speed: { value: maskSpeed },
              u_imageAspect: { value: imageAspect },
              u_turbulenceIntensity: { value: turbulenceIntensity },
              u_effectType: { value: effectType },
              u_effectIntensity: { value: effectIntensity },
              u_invertMask: { value: invertMask },
              u_effectColor1: { value: new THREE.Color(c1r, c1g, c1b) },
              u_effectColor2: { value: new THREE.Color(c2r, c2g, c2b) },
            };

            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.ShaderMaterial({
              uniforms: state.uniforms,
              vertexShader: VERTEX_SHADER,
              fragmentShader: FRAGMENT_SHADER,
              depthTest: false,
              depthWrite: false,
            });
            const mesh = new THREE.Mesh(geometry, material);
            state.scene.add(mesh);

            state.renderer = new THREE.WebGLRenderer({
              antialias: false,
              powerPreference: "high-performance",
              alpha: true,
            });
            state.renderer.setPixelRatio(1);
            state.renderer.setSize(width, height);
            container.appendChild(state.renderer.domElement);

            const resizeObserver = new ResizeObserver(() => {
              const w = container.clientWidth;
              const h = container.clientHeight;
              if (state.renderer) state.renderer.setSize(w, h);
              if (state.uniforms) state.uniforms.u_resolution.value.set(w, h);
            });
            resizeObserver.observe(container);
            cleanupFns.push(() => resizeObserver.disconnect());

            const intersectionObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  state.isInView = entry.isIntersecting;
                  if (!state.isInView && state.radiusTween) {
                    state.radiusTween.kill();
                    state.uniforms.u_radius.value = 0.0;
                  }
                });
              },
              { threshold: 0.1 },
            );
            intersectionObserver.observe(container);
            cleanupFns.push(() => intersectionObserver.disconnect());

            state.renderer.render(state.scene, state.camera);
          });

          const updateCursorState = (x, y) => {
            const rect = container.getBoundingClientRect();
            const inside =
              x >= rect.left &&
              x <= rect.right &&
              y >= rect.top &&
              y <= rect.bottom;
            if (state.isMouseInside !== inside) {
              state.isMouseInside = inside;
              if (state.radiusTween) state.radiusTween.kill();
              if (inside) {
                state.targetMouse.x = (x - rect.left) / rect.width;
                state.targetMouse.y = 1.0 - (y - rect.top) / rect.height;
                state.radiusTween = gsap.to(state.uniforms.u_radius, {
                  value: maskRadius,
                  duration: appearDuration,
                  ease: "power2.out",
                });
              } else {
                state.radiusTween = gsap.to(state.uniforms.u_radius, {
                  value: 0,
                  duration: disappearDuration,
                  ease: "power2.in",
                });
              }
            }
            if (inside) {
              state.targetMouse.x = (x - rect.left) / rect.width;
              state.targetMouse.y = 1.0 - (y - rect.top) / rect.height;
            }
          };

          let lastX = 0;
          let lastY = 0;
          let moveTimeout = null;
          const handleMouseMove = (e) => {
            lastX = e.clientX;
            lastY = e.clientY;
            if (!moveTimeout) {
              moveTimeout = setTimeout(() => {
                updateCursorState(lastX, lastY);
                moveTimeout = null;
              }, 16);
            }
          };
          document.addEventListener("mousemove", handleMouseMove, {
            passive: true,
          });
          cleanupFns.push(() =>
            document.removeEventListener("mousemove", handleMouseMove),
          );
        });

        let lastTime = 0;
        let frameCount = 0;
        const animate = (timestamp) => {
          rafRef.current = requestAnimationFrame(animate);
          const deltaTime = timestamp - lastTime;
          lastTime = timestamp;
          frameCount++;
          if (frameSkip > 0 && frameCount % (frameSkip + 1) !== 0) return;

          stateRef.current.forEach((state) => {
            if (!state.isInView || !state.uniforms) return;
            state.lerpedMouse.lerp(state.targetMouse, 0.1);
            state.uniforms.u_mouse.value.copy(state.lerpedMouse);
            if (state.isMouseInside) {
              state.uniforms.u_time.value +=
                0.01 * animationSpeed * (deltaTime / 16.67);
            }
            if (state.renderer && state.scene && state.camera) {
              state.renderer.render(state.scene, state.camera);
            }
          });
        };
        rafRef.current = requestAnimationFrame(animate);
      })
      .catch((e) =>
        console.error("[InkRevealGallery] Script load failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cleanupFns.forEach((fn) => fn());
      stateRef.current.forEach((state) => {
        if (state.renderer) state.renderer.dispose();
      });
      stateRef.current.clear();
    };
  }, [
    maskRadius,
    maskSpeed,
    animationSpeed,
    appearDuration,
    disappearDuration,
    turbulenceIntensity,
    effectType,
    effectIntensity,
    invertMask,
    effectColor1,
    effectColor2,
    frameSkip,
  ]);

  return (
    <div
      className="relative overflow-x-hidden p-[var(--pad)]"
      style={{
        "--pad": padding,
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: 500,
        letterSpacing: "-0.03em",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-[1000] p-[var(--pad)]"
        style={{ "--pad": padding }}
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gutter,
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              ref={(el) => (gridColRefs.current[i] = el)}
              className="h-full border-l border-r opacity-0"
              style={{ borderColor: gridColor }}
            />
          ))}
        </div>
      </div>

      <div
        className="relative mx-auto grid w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          columnGap: gutter,
          rowGap: rowSpacing,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              gridColumn: `${item.colStart} / span ${item.colSpan}`,
              gridRow: item.rowStart
                ? `${item.rowStart} / span ${item.rowSpan || 1}`
                : "auto",
              marginTop: item.extraSpacing ? rowSpacing : 0,
            }}
          >
            <div
              ref={(el) => (containerRefs.current[i] = el)}
              className="relative overflow-hidden bg-neutral-900"
              style={{ height: item.height }}
            >
              <img src={item.image} alt={item.title} className="hidden" />
            </div>
            <div className="mt-4 text-base leading-tight">
              <div className="mb-[0.1rem] text-base uppercase">{item.date}</div>
              <div className="mt-[0.125rem] text-2xl font-bold uppercase">
                {item.title}
              </div>
              <div className="mt-[0.125rem] text-base">{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
