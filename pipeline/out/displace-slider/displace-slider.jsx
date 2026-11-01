"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    background:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    background:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    background:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    ],
  },
];

const VERT_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG_SHADER = `
varying vec2 vUv;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D disp;

uniform float dispPower;
uniform float intensity;

void main() {
  vec2 uv = vUv;

  vec4 dispTex = texture2D(disp, uv);
  vec2 dispVec = vec2(dispTex.x, dispTex.y);

  vec2 distPos1 = uv + (dispVec * intensity * dispPower);
  vec2 distPos2 = uv + (dispVec * -(intensity * (1.0 - dispPower)));

  vec4 _texture1 = texture2D(texture1, distPos1);
  vec4 _texture2 = texture2D(texture2, distPos2);

  gl_FragColor = mix(_texture1, _texture2, dispPower);
}
`;

const makeRandom = (seed) => {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const buildDisplacementCanvas = (size, blobs, blobSize, seed) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rand = makeRandom(seed);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < blobs; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = (0.08 + rand() * blobSize) * size;
    const red = Math.floor(rand() * 255);
    const green = Math.floor(rand() * 255);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${red},${green},128,0.85)`);
    grad.addColorStop(1, `rgba(${red},${green},128,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
};

export default function DisplaceSlider({
  slides = DEFAULT_SLIDES,
  bgColor = "#111111",
  textColor = "#ffffff",
  dispIntensity = 0.5,
  dispDuration = 2.5,
  dispBlobs = 28,
  dispBlobSize = 0.42,
  dispSeed = 7,
  dispResolution = 512,
  imageDuration = 1.5,
  imageStagger = 0.075,
  imageExitY = -185,
  imageEnterY = 150,
  imageScaleY = 1.5,
  imageWidth = "25vw",
  imageHeight = "70vh",
  imageOffset = "1.5rem",
  textDuration = 2,
  bulletDimAlpha = 0.25,
  showBullets = true,
  showScrollHint = true,
  scrollHintLabel = "Scroll",
  enableWheel = true,
  enableClick = true,
  fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif",
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = `ds-${uid}`;

  const rootRef = useRef(null);
  const innerRef = useRef(null);
  const slideRefs = useRef([]);
  const bulletRefs = useRef([]);
  const scrollRef = useRef(null);
  const goToRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    const cleanups = [];

    Promise.all([import("three"), import("gsap")])
      .then(([THREE, gsapModule]) => {
        const gsap = gsapModule.gsap || gsapModule.default;
        if (!THREE || !gsap || disposed) return;
        if (!rootRef.current || !innerRef.current) return;

        const host = rootRef.current;
        const total = slides.length;

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(host.offsetWidth, host.offsetHeight);
        innerRef.current.appendChild(renderer.domElement);

        const camera = new THREE.OrthographicCamera(
          host.offsetWidth / -2,
          host.offsetWidth / 2,
          host.offsetHeight / 2,
          host.offsetHeight / -2,
          1,
          1000,
        );
        camera.lookAt(scene.position);
        camera.position.z = 1;

        const render = () => renderer.render(scene, camera);

        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "anonymous";
        const textures = slides.map((slide) => {
          const t = loader.load(slide.background, render);
          t.minFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          return t;
        });

        const dispTexture = new THREE.CanvasTexture(
          buildDisplacementCanvas(
            dispResolution,
            dispBlobs,
            dispBlobSize,
            dispSeed,
          ),
        );
        dispTexture.magFilter = dispTexture.minFilter = THREE.LinearFilter;
        dispTexture.wrapS = dispTexture.wrapT = THREE.RepeatWrapping;

        const mat = new THREE.ShaderMaterial({
          uniforms: {
            dispPower: { value: 0 },
            intensity: { value: dispIntensity },
            texture1: { value: textures[0] },
            texture2: { value: textures[total > 1 ? 1 : 0] },
            disp: { value: dispTexture },
          },
          transparent: true,
          vertexShader: VERT_SHADER,
          fragmentShader: FRAG_SHADER,
        });

        const geometry = new THREE.PlaneGeometry(
          host.offsetWidth,
          host.offsetHeight,
          1,
        );
        scene.add(new THREE.Mesh(geometry, mat));

        const data = { current: 0, next: total > 1 ? 1 : 0 };
        const state = { animating: false, initial: true };

        const parts = (index) => {
          const el = slideRefs.current[index];
          return {
            el,
            images: el ? [...el.querySelectorAll("[data-photo]")] : [],
            text: el ? [...el.querySelectorAll("[data-line-inner]")] : [],
          };
        };

        const bulletParts = (index) => {
          const el = bulletRefs.current[index];
          return {
            txt: el ? el.querySelector("[data-bullet-text]") : null,
            line: el ? el.querySelector("[data-bullet-line]") : null,
          };
        };

        slideRefs.current.slice(0, total).forEach((el, i) => {
          if (i !== 0) gsap.set(el, { autoAlpha: 0 });
        });
        bulletRefs.current.slice(0, total).forEach((el, i) => {
          if (i === 0) return;
          const { txt, line } = bulletParts(i);
          gsap.set(txt, { opacity: bulletDimAlpha });
          gsap.set(line, { scaleX: 0, transformOrigin: "left" });
        });

        render();

        const transitionTo = (target) => {
          state.animating = true;
          data.next = target;

          mat.uniforms.texture1.value = textures[data.current];
          mat.uniforms.texture2.value = textures[data.next];
          mat.uniforms.dispPower.value = 0;

          gsap.to(mat.uniforms.dispPower, {
            duration: dispDuration,
            value: 1,
            ease: "expo.inOut",
            onUpdate: render,
            onComplete: () => {
              mat.uniforms.dispPower.value = 0;
              data.current = data.next;
              mat.uniforms.texture1.value = textures[data.current];
              mat.uniforms.texture2.value =
                textures[(data.current + 1) % total];
              render();
              state.animating = false;
            },
          });

          const cur = parts(data.current);
          const nxt = parts(data.next);
          const curB = bulletParts(data.current);
          const nxtB = bulletParts(data.next);

          const tl = gsap.timeline({ paused: true });

          if (state.initial && scrollRef.current) {
            gsap.to(scrollRef.current, {
              duration: 1.5,
              yPercent: 100,
              opacity: 0,
              ease: "power4.inOut",
            });
            state.initial = false;
          }

          tl.fromTo(
            cur.images,
            { yPercent: 0, scale: 1 },
            {
              duration: imageDuration,
              yPercent: imageExitY,
              scaleY: imageScaleY,
              ease: "expo.inOut",
              stagger: imageStagger,
            },
            0,
          )
            .to(
              curB.txt,
              {
                duration: imageDuration,
                opacity: bulletDimAlpha,
                ease: "none",
              },
              0,
            )
            .set(curB.line, { transformOrigin: "right" }, 0)
            .to(
              curB.line,
              { duration: imageDuration, scaleX: 0, ease: "expo.inOut" },
              0,
            );

          if (cur.text.length) {
            tl.fromTo(
              cur.text,
              { yPercent: 0 },
              { duration: textDuration, yPercent: -100, ease: "power4.inOut" },
              0,
            );
          }

          tl.set(cur.el, { autoAlpha: 0 }, 1).set(nxt.el, { autoAlpha: 1 }, 1);

          if (nxt.text.length) {
            tl.fromTo(
              nxt.text,
              { yPercent: 100 },
              { duration: textDuration, yPercent: 0, ease: "power4.out" },
              1.5,
            );
          }

          tl.fromTo(
            nxt.images,
            { yPercent: imageEnterY, scaleY: imageScaleY },
            {
              duration: imageDuration,
              yPercent: 0,
              scaleY: 1,
              ease: "expo.inOut",
              stagger: imageStagger,
            },
            1,
          )
            .to(
              nxtB.txt,
              { duration: imageDuration, opacity: 1, ease: "none" },
              1,
            )
            .set(nxtB.line, { transformOrigin: "left" }, 1)
            .to(
              nxtB.line,
              { duration: imageDuration, scaleX: 1, ease: "expo.inOut" },
              1,
            );

          tl.play();
        };

        const goTo = (target) => {
          if (state.animating || target === data.current || total < 2) return;
          transitionTo(target);
        };
        const advance = () => goTo((data.current + 1) % total);
        goToRef.current = goTo;

        if (enableWheel) {
          const onWheel = () => advance();
          window.addEventListener("wheel", onWheel, { passive: true });
          cleanups.push(() => window.removeEventListener("wheel", onWheel));
        }

        if (enableClick) {
          const onClick = () => advance();
          innerRef.current.addEventListener("click", onClick);
          cleanups.push(() =>
            innerRef.current?.removeEventListener("click", onClick),
          );
        }

        const onResize = () => {
          const w = host.offsetWidth;
          const h = host.offsetHeight;
          renderer.setSize(w, h);
          camera.left = w / -2;
          camera.right = w / 2;
          camera.top = h / 2;
          camera.bottom = h / -2;
          camera.updateProjectionMatrix();
          render();
        };
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        gsap.to(host, { duration: 0.8, opacity: 1 });

        cleanups.push(() => {
          goToRef.current = null;
          gsap.killTweensOf([
            mat.uniforms.dispPower,
            host,
            scrollRef.current,
            ...slideRefs.current,
            ...bulletRefs.current,
          ]);
          geometry.dispose();
          mat.dispose();
          dispTexture.dispose();
          textures.forEach((t) => t.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        });
      })
      .catch((e) =>
        console.error("[DisplaceSlider] library load failed:", e.message),
      );

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };

  }, [slides, dispIntensity, dispDuration, dispBlobs, dispSeed]);

  const css = `
.${s}-photo:first-child{top:-${imageOffset};}
.${s}-photo:last-child{bottom:-${imageOffset};}
`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={rootRef}
        className={`relative w-full h-screen overflow-hidden opacity-0 select-none ${className}`}
        style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
      >
        <div className="absolute inset-0">
          <div ref={innerRef} className="absolute inset-0 cursor-pointer" />

          {slides.map((slide, i) => (
            <div
              key={`slide-${i}`}
              ref={(el) => (slideRefs.current[i] = el)}
              className="absolute inset-0 overflow-hidden pointer-events-none"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {(slide.images || []).map((src, k) => (
                  <figure
                    key={k}
                    data-photo
                    className={`${s}-photo relative m-0 p-0 min-w-[6rem] md:min-w-[12.5rem] origin-top`}
                    style={{ width: imageWidth, height: imageHeight }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="block absolute inset-0 w-full h-full object-cover"
                    />
                  </figure>
                ))}
              </div>
            </div>
          ))}

          {showBullets ? (
            <nav className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
              {slides.map((slide, i) => (
                <div
                  key={`bullet-${i}`}
                  ref={(el) => (bulletRefs.current[i] = el)}
                  onClick={() => goToRef.current && goToRef.current(i)}
                  className="flex items-center py-4 pl-4 cursor-pointer"
                >
                  <span
                    data-bullet-text
                    className="text-[0.65rem] mr-4 tabular-nums"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    data-bullet-line
                    className="h-px w-4"
                    style={{ backgroundColor: textColor }}
                  />
                </div>
              ))}
            </nav>
          ) : null}

          {showScrollHint ? (
            <div
              ref={scrollRef}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 uppercase tracking-[0.2em] opacity-50"
              style={{ fontSize: "calc(0.5rem + 0.35vw)" }}
            >
              {scrollHintLabel}
            </div>
          ) : null}
        </div>

      </div>
    </>
  );
}
