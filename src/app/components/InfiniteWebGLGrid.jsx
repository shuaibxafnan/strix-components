"use client";

import { useEffect, useRef } from "react";

const DEFAULT_LAMA_IMAGES = [
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
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
];

export default function InfiniteWebGLGrid({
  images = DEFAULT_LAMA_IMAGES,
  columns = 5,
  gridWidth = "w-[150%]",
  gridHeight = "h-[150%]",
  lerpFactor = 0.085,
  distortionStrength = 0.0001,
  mouseDragMultiplier = 2.5,
  wheelMultiplier = 0.6,
}) {
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    // Dynamic sequential async script load utility
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
        el.onerror = () => reject(new Error(`Failed to initialize: ${src}`));
        document.head.appendChild(el);
      });

    // Resolve structural dependencies across GL engines and animation frames
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
    ])
      .then(() => {
        const { THREE, gsap } = window;
        if (!THREE || !gsap || !gridRef.current) return;

        let ww = window.innerWidth;
        let wh = window.innerHeight;

        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        const isWindows = navigator.appVersion.indexOf("Win") != -1;

        const firefoxMultiplier = 20;
        const multipliers = {
          mouse: isWindows ? wheelMultiplier * 2 : wheelMultiplier,
          firefox: isWindows ? firefoxMultiplier * 2 : firefoxMultiplier,
        };

        // ─── SHADER DEFINITIONS ──────────────────────────────────────────────
        const vertexShader = `
          precision mediump float;
          uniform float u_diff;
          varying vec2 vUv;
          void main(){
            vec3 pos = position;
            pos.y *= 1. - u_diff;
            pos.x *= 1. - u_diff;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
          }
        `;

        const fragmentShader = `
          precision mediump float;
          uniform vec2 u_res;
          uniform vec2 u_size;
          uniform sampler2D u_texture;

          vec2 cover(vec2 screenSize, vec2 imageSize, vec2 uv) {
            float screenRatio = screenSize.x / screenSize.y;
            float imageRatio = imageSize.x / imageSize.y;
            vec2 newSize = screenRatio < imageRatio 
                ? vec2(imageSize.x * (screenSize.y / imageSize.y), screenSize.y)
                : vec2(screenSize.x, imageSize.y * (screenSize.x / imageSize.x));
            vec2 newOffset = (screenRatio < imageRatio 
                ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) 
                : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
            return uv * screenSize / newSize + newOffset;
          }

          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            vec2 uvCover = cover(u_res, u_size, uv);
            vec4 texture = texture2D(u_texture, uvCover);
            gl_FragColor = texture;
          }
        `;

        const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
        const baseMaterial = new THREE.ShaderMaterial({
          fragmentShader,
          vertexShader,
        });

        const loader = new THREE.TextureLoader();

        // ─── INDIVIDUAL IMAGE PLANE INSTANCE ─────────────────────────────────
        class Plane extends THREE.Object3D {
          init(el, i) {
            this.el = el;
            this.x = 0;
            this.y = 0;
            this.my = 1 - (i % columns) * 0.1;

            this.geometry = geometry;
            this.material = baseMaterial.clone();

            this.material.uniforms = {
              u_texture: { value: null },
              u_res: { value: new THREE.Vector2(1, 1) },
              u_size: { value: new THREE.Vector2(1, 1) },
              u_diff: { value: 0 },
            };

            this.texture = loader.load(this.el.dataset.src, (texture) => {
              texture.minFilter = THREE.LinearFilter;
              texture.generateMipmaps = false;

              const { naturalWidth, naturalHeight } = texture.image;
              const { u_size, u_texture } = this.material.uniforms;

              u_texture.value = texture;
              u_size.value.x = naturalWidth;
              u_size.value.y = naturalHeight;
            });

            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.add(this.mesh);
            this.resize();
          }

          update(x, y, max, diff) {
            if (!this.rect) return;
            const { right, bottom } = this.rect;
            const { u_diff } = this.material.uniforms;

            this.y =
              gsap.utils.wrap(-(max.y - bottom), bottom, y * this.my) -
              this.yOffset;
            this.x = gsap.utils.wrap(-(max.x - right), right, x) - this.xOffset;

            u_diff.value = diff;
            this.position.x = this.x;
            this.position.y = this.y;
          }

          resize() {
            this.rect = this.el.getBoundingClientRect();
            const { left, top, width, height } = this.rect;
            const { u_res } = this.material.uniforms;

            this.xOffset = left + width / 2 - ww / 2;
            this.yOffset = top + height / 2 - wh / 2;

            this.position.x = this.xOffset;
            this.position.y = this.yOffset;

            u_res.value.x = width;
            u_res.value.y = height;
            this.mesh.scale.set(width, height, 1);
          }
        }

        // ─── ENGINE CORE CONTROL LOOP ────────────────────────────────────────
        class Core {
          constructor(gridEl) {
            this.tx = 0;
            this.ty = 0;
            this.cx = 0;
            this.cy = 0;
            this.diff = 0;

            this.wheel = { x: 0, y: 0 };
            this.on = { x: 0, y: 0 };
            this.max = { x: 0, y: 0 };
            this.isDragging = false;

            this.el = gridEl;

            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(
              ww / -2,
              ww / 2,
              wh / 2,
              wh / -2,
              1,
              1000,
            );
            this.camera.lookAt(this.scene.position);
            this.camera.position.z = 1;

            this.renderer = new THREE.WebGLRenderer({
              antialias: true,
              alpha: true,
            });
            this.renderer.setSize(ww, wh);
            this.renderer.setPixelRatio(
              gsap.utils.clamp(1, 1.5, window.devicePixelRatio),
            );

            this.renderer.domElement.className =
              "fixed top-0 left-0 w-full h-full pointer-events-none z-10";
            containerRef.current.appendChild(this.renderer.domElement);

            this.addPlanes();
            this.addEvents();
            this.resize();
          }

          addEvents() {
            gsap.ticker.add(this.tick);
            window.addEventListener("mousemove", this.onMouseMove);
            window.addEventListener("mousedown", this.onMouseDown);
            window.addEventListener("mouseup", this.onMouseUp);
            window.addEventListener("wheel", this.onWheel);
            window.addEventListener("resize", this.onResize);
          }

          removeEvents() {
            gsap.ticker.remove(this.tick);
            window.removeEventListener("mousemove", this.onMouseMove);
            window.removeEventListener("mousedown", this.onMouseDown);
            window.removeEventListener("mouseup", this.onMouseUp);
            window.removeEventListener("wheel", this.onWheel);
            window.removeEventListener("resize", this.onResize);
            if (this.renderer && this.renderer.domElement) {
              this.renderer.domElement.remove();
            }
          }

          addPlanes() {
            const planes = [...this.el.querySelectorAll(".js-plane")];
            this.planes = planes.map((el, i) => {
              const plane = new Plane();
              plane.init(el, i);
              this.scene.add(plane);
              return plane;
            });
          }

          tick = () => {
            const xDiff = this.tx - this.cx;
            const yDiff = this.ty - this.cy;

            this.cx += xDiff * lerpFactor;
            this.cx = Math.round(this.cx * 100) / 100;

            this.cy += yDiff * lerpFactor;
            this.cy = Math.round(this.cy * 100) / 100;

            this.diff = Math.max(
              Math.abs(yDiff * distortionStrength),
              Math.abs(xDiff * distortionStrength),
            );

            if (this.planes && this.planes.length) {
              this.planes.forEach((plane) =>
                plane.update(this.cx, this.cy, this.max, this.diff),
              );
            }
            this.renderer.render(this.scene, this.camera);
          };

          onMouseMove = ({ clientX, clientY }) => {
            if (!this.isDragging) return;
            this.tx = this.on.x + clientX * mouseDragMultiplier;
            this.ty = this.on.y - clientY * mouseDragMultiplier;
          };

          onMouseDown = ({ clientX, clientY }) => {
            if (this.isDragging) return;
            this.isDragging = true;
            this.on.x = this.tx - clientX * mouseDragMultiplier;
            this.on.y = this.ty + clientY * mouseDragMultiplier;
          };

          onMouseUp = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
          };

          onWheel = (e) => {
            const { mouse, firefox } = multipliers;
            this.wheel.x = e.wheelDeltaX || e.deltaX * -1;
            this.wheel.y = e.wheelDeltaY || e.deltaY * -1;

            if (isFirefox && e.deltaMode === 1) {
              this.wheel.x *= firefox;
              this.wheel.y *= firefox;
            }

            this.wheel.y *= mouse;
            this.wheel.x *= mouse;

            this.tx += this.wheel.x;
            this.ty -= this.wheel.y;
          };

          onResize = () => {
            ww = window.innerWidth;
            wh = window.innerHeight;
            this.renderer.setSize(ww, wh);
            this.resize();
          };

          resize = () => {
            const rect = this.el.getBoundingClientRect();
            this.max.x = rect.right;
            this.max.y = rect.bottom;
            if (this.planes && this.planes.length) {
              this.planes.forEach((plane) => plane.resize());
            }
          };
        }

        const engine = new Core(gridRef.current);

        return () => {
          engine.removeEvents();
        };
      })
      .catch((err) =>
        console.error("[InfiniteWebGLGrid] Setup exception encountered:", err),
      );
  }, [
    images,
    columns,
    gridWidth,
    gridHeight,
    lerpFactor,
    distortionStrength,
    mouseDragMultiplier,
    wheelMultiplier,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none cursor-grab active:cursor-grabbing bg-neutral-950"
    >
      {/* Structural Virtual DOM Tracking Layer */}
      <div
        ref={gridRef}
        className={`js-grid fixed top-0 left-0 fixed grid gap-0 opacity-0 pointer-events-none ${gridWidth} ${gridHeight}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {images.map((src, index) => (
          <div key={index} className="relative w-full h-full">
            <figure
              className="js-plane absolute inset-2 m-0 p-0"
              data-src={src}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
