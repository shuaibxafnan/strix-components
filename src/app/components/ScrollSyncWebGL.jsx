"use client";

import { useEffect, useRef, useId } from "react";

// ─── ScrollSyncGallery ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images               string[] [24 unsplash urls]  Image URLs rendered into the gallery, in order
// bgColor              string   #490700              Page/canvas background color
// borderColor          string   #82e7c2               Border color drawn around each image frame
// borderWidth          number   8                     Border width (px) of each image frame
// borderRadius         number   0                     Border radius (px) of each image frame
// imageAspectRatio     string   "1024 / 1536"          CSS aspect-ratio for every image frame
// gap                  number   20                    Gap (px) between images inside a row and between rows
// sectionGap           number   250                    Vertical margin (px) above each new gallery row group
// soloWidthPercent     number   30                    Width (%) of the viewport for a single centered "solo" image
// rowWidthPercent      number   60                    Width (%) of the viewport for a 3-up image row
// sideImageWidthPercent number 70                    Width (%) of each side image inside a 3-up row (the middle image fills its flex slot)
// glitchSamples        number   5                     Number of accumulated samples in the glitch shader (higher = smoother/slower)
// glitchStrength       number   10                    Multiplier applied to scroll speed to drive glitch intensity
// glitchMaxStrength    number   5                      Hard cap on the raw glitch strength value before normalization
// glitchDecay          number   10                    Exponential decay rate of glitch strength after scrolling stops (higher = snappier settle)
// resolutionScale       number   1                     Multiplier on devicePixelRatio for render resolution (lower = better perf)
// className            string   ""                    Extra classes applied to the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
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
];

const VERTEX_SHADER = `
uniform vec2 u_resolution;
uniform vec2 u_domXY;
uniform vec2 u_domWH;
varying vec2 v_uv;
void main() {
    vec2 pixelXY = u_domXY + u_domWH * 0.5;
    pixelXY.y = u_resolution.y - pixelXY.y;
    pixelXY += position.xy * u_domWH;
    vec2 xy = pixelXY / u_resolution * 2. - 1.;
    v_uv = uv;
    gl_Position = vec4(xy, 0., 1.0);
}
`;

const FRAGMENT_SHADER_TEMPLATE = (numSamples) => `
uniform sampler2D u_texture;
uniform vec4 u_rands;
uniform float u_strength;
uniform float u_time;
uniform float u_id;
varying vec2 v_uv;
#define NUM_SAMPLES ${numSamples}
vec4 hash43(vec3 p) {
    vec4 p4 = fract(vec4(p.xyzx) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}
void main() {
    vec4 noises = hash43(vec3(gl_FragCoord.xy, u_id));
    vec4 rands = hash43(vec3(floor(sin(v_uv.x * 2. + u_rands.x * 6.283) * mix(3., 40., u_rands.y)) * 30., u_id, u_rands.z));
    vec2 uvOffset = vec2(0., (rands.x - .5) * 0.5 * (rands.y > .7 ? 1. : 0.)) / float(NUM_SAMPLES) * (0.05 + u_strength * 0.3);
    vec2 uv = v_uv + noises.xy * uvOffset;
    vec3 color = vec3(0.);
    for (int i = 0; i < NUM_SAMPLES; i++) {
        color += texture2D(u_texture, uv).rgb;
        uv += uvOffset;
    }
    color /= float(NUM_SAMPLES);
    gl_FragColor = vec4(color * (1. + u_strength * 2.), 1.);
}
`;

export default function ScrollSyncWebGL({
  images = DEFAULT_IMAGES,
  bgColor = "#490700",
  borderColor = "#82e7c2",
  borderWidth = 8,
  borderRadius = 0,
  imageAspectRatio = "1024 / 1536",
  gap = 20,
  sectionGap = 250,
  soloWidthPercent = 30,
  rowWidthPercent = 60,
  sideImageWidthPercent = 70,
  glitchSamples = 5,
  glitchStrength = 10,
  glitchMaxStrength = 5,
  glitchDecay = 10,
  resolutionScale = 1,
  className = "",
}) {
  const uid = useId();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRefs = useRef([]);

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

    let cleanup = () => {};
    let cancelled = false;

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    )
      .then(() => {
        if (cancelled) return;
        const THREE = window.THREE;
        if (!THREE || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const dpr = (window.devicePixelRatio || 1) * resolutionScale;

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
        });
        renderer.setClearColor(bgColor);
        const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

        const resolution = new THREE.Vector2(1, 1);
        const textureLoader = new THREE.TextureLoader();

        const items = imageRefs.current.map((domEl, i) => {
          const mesh = new THREE.Mesh(
            geometry,
            new THREE.ShaderMaterial({
              uniforms: {
                u_texture: { value: textureLoader.load(images[i]) },
                u_domXY: { value: new THREE.Vector2(0, 0) },
                u_domWH: { value: new THREE.Vector2(1, 1) },
                u_resolution: { value: resolution },
                u_time: { value: 0 },
                u_strength: { value: 0 },
                u_rands: { value: new THREE.Vector4(0, 0, 0, 0) },
                u_id: { value: i },
              },
              vertexShader: VERTEX_SHADER,
              fragmentShader: FRAGMENT_SHADER_TEMPLATE(glitchSamples),
              side: THREE.DoubleSide,
            }),
          );
          mesh.frustumCulled = false;
          scene.add(mesh);
          return { domEl, mesh };
        });

        let strength = 0;
        let prevScrollY = window.scrollY;
        let time = performance.now() / 1000;
        let rafId;

        function onResize() {
          const w = window.innerWidth;
          const h = window.innerHeight;
          resolution.set(w, h);
          renderer.setSize(w, h);
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }

        function animate() {
          rafId = requestAnimationFrame(animate);

          const scrollY = window.scrollY;
          const scrollDelta = scrollY - prevScrollY;
          prevScrollY = scrollY;

          const newTime = performance.now() / 1000;
          const dt = Math.min(newTime - time, 0.1);
          time = newTime;

          const targetStrength =
            (Math.abs(scrollDelta) * glitchStrength) / window.innerHeight;
          strength *= Math.exp(-dt * glitchDecay);
          strength += Math.min(targetStrength, glitchMaxStrength);
          const normalizedStrength = Math.min(1, strength);

          const viewportH = window.innerHeight;

          for (const item of items) {
            const rect = item.domEl.getBoundingClientRect();
            const uniforms = item.mesh.material.uniforms;
            uniforms.u_domXY.value.set(rect.left, rect.top);
            uniforms.u_domWH.value.set(rect.width, rect.height);
            uniforms.u_time.value += dt;
            uniforms.u_strength.value = normalizedStrength;

            if (Math.random() > Math.exp(-dt * 25 * (1 + strength))) {
              uniforms.u_rands.value.set(
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random(),
              );
            }

            item.mesh.visible = rect.bottom > 0 && rect.top < viewportH;
          }

          renderer.render(scene, camera);
        }

        onResize();
        window.addEventListener("resize", onResize);
        let resizeObserver;
        if (window.ResizeObserver && containerRef.current) {
          resizeObserver = new ResizeObserver(onResize);
          resizeObserver.observe(containerRef.current);
        }

        animate();

        cleanup = () => {
          cancelAnimationFrame(rafId);
          window.removeEventListener("resize", onResize);
          if (resizeObserver) resizeObserver.disconnect();
          renderer.dispose();
          geometry.dispose();
          items.forEach((item) => {
            item.mesh.material.dispose();
            item.mesh.material.uniforms.u_texture.value?.dispose();
          });
        };
      })
      .catch((e) =>
        console.error("[ScrollSyncGallery] Three.js load failed:", e.message),
      );

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    images,
    bgColor,
    glitchSamples,
    glitchStrength,
    glitchMaxStrength,
    glitchDecay,
    resolutionScale,
  ]);

  const frameStyle = {
    borderColor,
    borderWidth: `${borderWidth}px`,
    borderRadius: `${borderRadius}px`,
    aspectRatio: imageAspectRatio,
  };

  let refIndex = 0;
  const registerRef = (i) => (el) => {
    imageRefs.current[i] = el;
  };

  // Group images into repeating blocks: 1 solo image + 3 in a row
  const blocks = [];
  for (let i = 0; i < images.length; ) {
    blocks.push({ type: "solo", indices: [i] });
    i += 1;
    if (i < images.length) {
      const rowIndices = images.slice(i, i + 3).map((_, k) => i + k);
      blocks.push({ type: "row", indices: rowIndices });
      i += rowIndices.length;
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden px-5 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed top-0 left-0 z-0 h-screen w-screen"
      />

      <div
        className="relative z-10 flex flex-col"
        style={{ gap: `${sectionGap}px` }}
      >
        {blocks.map((block, blockIdx) => {
          if (block.type === "solo") {
            const i = block.indices[0];
            return (
              <div
                key={`${uid}-block-${blockIdx}`}
                className="relative mx-auto w-full"
                style={{ width: `${soloWidthPercent}vw` }}
              >
                <div
                  className="relative"
                  style={frameStyle}
                  ref={registerRef(i)}
                />
              </div>
            );
          }

          return (
            <div
              key={`${uid}-block-${blockIdx}`}
              className="mx-auto flex w-full"
              style={{ width: `${rowWidthPercent}vw`, gap: `${gap}px` }}
            >
              {block.indices.map((i, posInRow) => {
                const isSide =
                  posInRow === 0 || posInRow === block.indices.length - 1;
                return (
                  <div key={`${uid}-img-${i}`} className="flex-1">
                    <div
                      className={isSide ? "relative mx-auto" : "relative"}
                      style={{
                        ...frameStyle,
                        ...(isSide
                          ? { width: `${sideImageWidthPercent}%` }
                          : {}),
                      }}
                      ref={registerRef(i)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
