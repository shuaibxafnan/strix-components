"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
  },
];

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMeshSize;
uniform vec2 uImageSize;
uniform float uScale;
uniform float uAngle;
uniform float uAlpha;
uniform float uHasTexture;

vec2 cover(vec2 sz, vec2 is, vec2 uv) {
  float screenRatio = sz.x / sz.y;
  float imageRatio = is.x / is.y;
  vec2 newSize = screenRatio < imageRatio
    ? vec2(is.x * sz.y / is.y, sz.y)
    : vec2(sz.x, is.y * sz.x / is.x);
  vec2 newOffset = (screenRatio < imageRatio
    ? vec2((newSize.x - sz.x) / 2.0, 0.0)
    : vec2(0.0, (newSize.y - sz.y) / 2.0)) / newSize;
  return uv * sz / newSize + newOffset;
}

vec2 rotateUV(vec2 uv, float rotation) {
  float mid = 0.5;
  return vec2(
    cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
    cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
  );
}

void main() {
  if (uHasTexture < 0.5) discard;
  vec2 uv = vUv;
  uv -= 0.5;
  uv *= uScale;
  uv += 0.5;
  uv = cover(uMeshSize, uImageSize, uv);
  vec2 texUv = rotateUV(uv, -uAngle);
  vec4 img = texture2D(uTexture, texUv);
  gl_FragColor = vec4(img.rgb, img.a * uAlpha);
}
`;

const makeNoise = () => {
  const p = new Uint8Array(512);
  const perm = [];
  for (let i = 0; i < 256; i++) perm.push(i);
  let seed = 1337;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y, z) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x, y, z) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
      lerp(
        lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
        lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
        v,
      ),
      lerp(
        lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
        lerp(
          grad(p[AB + 1], x, y - 1, z - 1),
          grad(p[BB + 1], x - 1, y - 1, z - 1),
          u,
        ),
        v,
      ),
      w,
    );
  };
};

export default function ClothSlideshow({
  slides = DEFAULT_SLIDES,
  bgColor = "#0b0b0d",
  slideWidth = "34vw",
  slideMaxWidth = "420px",
  slideAspect = 144.7,
  slideGap = 15,
  cameraAngle = 30,
  perspective = 800,
  clothSegments = 8,
  clothMass = 2,
  clothDamping = 0.8,
  gravity = -800,
  gravityRamp = 2,
  windForce = 40,
  windSpeed = 2,
  windScale = 0.1,
  windRamp = 2,
  windFollowsMouse = true,
  scrollSpeed = 1.5,
  scrollEase = 0.065,
  dragMultiplier = 3,
  settleDelay = 100,
  snapDuration = 0.4,
  restDuration = 0.8,
  windDelay = 400,
  focusOpacity = 1,
  idleOpacity = 0.25,
  focusRange = 0.5,
  hoverToFocus = true,
  opacityEase = 0.08,
  distortAmount = 0.2,
  className = "",
}) {
  const rawId = useId();
  const uid = `cs-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const listRef = useRef(null);
  const optsRef = useRef({});

  optsRef.current = {
    cameraAngle,
    perspective,
    clothSegments,
    clothMass,
    clothDamping,
    gravity,
    gravityRamp,
    windForce,
    windSpeed,
    windScale,
    windRamp,
    windFollowsMouse,
    scrollSpeed,
    scrollEase,
    dragMultiplier,
    settleDelay,
    snapDuration,
    restDuration,
    windDelay,
    focusOpacity,
    idleOpacity,
    focusRange,
    hoverToFocus,
    opacityEase,
    distortAmount,
  };

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    Promise.all([import("three"), import("cannon"), import("gsap")])
      .then(([THREE, cannonMod, gsapMod]) => {
        if (disposed) return;
        const CANNON = cannonMod.default || cannonMod;
        const gsap = gsapMod.gsap || gsapMod.default;
        const root = rootRef.current;
        const canvas = canvasRef.current;
        const list = listRef.current;
        if (!THREE || !CANNON || !gsap || !root || !canvas || !list) return;

        gsap.config({ trialWarn: false });

        const O = optsRef.current;
        const ANGLE = (O.cameraAngle * Math.PI) / 180;
        const noise = makeNoise();
        const rootRect = () => root.getBoundingClientRect();

        const layout = { W: 0, H: 0, D: 0, isMobile: false };
        const measure = () => {
          const r = rootRect();
          layout.W = r.width;
          layout.H = r.height;
          layout.isMobile = window.matchMedia("(max-width: 767px)").matches;
          layout.D = Math.ceil(
            Math.tan(ANGLE) * (Math.max(layout.W, layout.H) / 2),
          );
        };
        measure();

        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xcccccc));

        const getFov = () =>
          (180 * (2 * Math.atan(layout.H / 2 / O.perspective))) / Math.PI;

        const camera = new THREE.PerspectiveCamera(
          getFov(),
          layout.W / layout.H,
          1,
          4000,
        );
        camera.position.set(0, 0, O.perspective);
        const baseRotation = -ANGLE;
        camera.rotation.z = baseRotation;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          canvas,
        });
        renderer.setSize(layout.W, layout.H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const world = new CANNON.World();
        world.gravity.set(0, 0, 0);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");

        const els = Array.from(list.querySelectorAll("[data-slide]"));

        let loopHeight = 1;

        const makeTile = (el) => {
          const base = rootRect();
          const r = el.getBoundingClientRect();
          const rect = { width: r.width, height: r.height };

          const geo = new THREE.PlaneGeometry(
            1,
            1,
            O.clothSegments,
            O.clothSegments,
          );
          const mat = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            uniforms: {
              uAlpha: { value: 0 },
              uHasTexture: { value: 0 },
              uTexture: { value: null },
              uMeshSize: { value: new THREE.Vector2(rect.width, rect.height) },
              uImageSize: { value: new THREE.Vector2(1, 1) },
              uScale: { value: 1 },
              uVelo: { value: 0 },
              uAngle: { value: ANGLE },
            },
          });

          const img = el.querySelector("img");
          loader.load(img.src, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            mat.uniforms.uTexture.value = texture;
            mat.uniforms.uImageSize.value.set(
              texture.image.naturalWidth || texture.image.width,
              texture.image.naturalHeight || texture.image.height,
            );
            mat.uniforms.uHasTexture.value = 1;
          });

          const group = new THREE.Object3D();
          const mesh = new THREE.Mesh(geo, mat);
          mesh.scale.set(rect.width, rect.height, 1);
          mat.uniforms.uScale.value =
            Math.max(rect.width, rect.height) /
            Math.hypot(rect.width, rect.height);
          geo.attributes.initPos = geo.attributes.position.clone();
          group.add(mesh);
          scene.add(group);

          const baseY = el.offsetTop + rect.height / 2;
          group.position.x = r.left - base.left + rect.width / 2 - layout.W / 2;

          return {
            geo,
            mat,
            mesh,
            group,
            rect,
            baseY,
            alpha: 0,
            update(current) {
              const loop = loopHeight;
              const half = loop / 2;
              let y = (baseY + current - half) % loop;
              if (y < 0) y += loop;
              group.position.y = y - half;
            },
            distort(delta) {
              const sclX = Math.max(
                1 - O.distortAmount,
                Math.min(1, 1 - Math.abs(delta)),
              );
              gsap.to(mesh.scale, {
                duration: 0.5,
                x: sclX * rect.width,
                y: rect.height,
                z: 1,
                overwrite: true,
              });
            },
          };
        };

        const stitchShape = new CANNON.Particle();
        const tempV = new THREE.Vector3();

        const makeCloth = (tile) => {
          const inner = { tile, stitches: [], initPositions: [] };
          const segs = O.clothSegments;
          const mass =
            (layout.isMobile ? O.clothMass * 1.5 : O.clothMass) / (segs * segs);

          const attr = inner.tile.geo.attributes.position;
          const { width, height } = inner.tile.rect;

          for (let i = 0; i < attr.count; i++) {
            const body = new CANNON.Body({
              mass,
              linearDamping: O.clothDamping,
              position: new CANNON.Vec3(
                attr.getX(i) * width,
                attr.getY(i) * height,
                attr.getZ(i),
              ),
              shape: stitchShape,
            });
            inner.stitches.push(body);
            world.addBody(body);
          }

          inner.initPositions = inner.stitches.map((s) =>
            s.initPosition.clone(),
          );

          for (let i = 0; i < attr.count; i++) {
            const col = i % (segs + 1);
            const row = Math.floor(i / (segs + 1));

            if (col < segs) {
              world.addConstraint(
                new CANNON.DistanceConstraint(
                  inner.stitches[i],
                  inner.stitches[i + 1],
                ),
              );
            }
            if (row < segs) {
              world.addConstraint(
                new CANNON.DistanceConstraint(
                  inner.stitches[i],
                  inner.stitches[i + segs + 1],
                ),
              );
            }
            if (row === 0) {
              const anchorPos = inner.stitches[i].position.clone();
              anchorPos.y += 100;
              const anchor = new CANNON.Body({
                mass: 0,
                position: anchorPos,
                shape: new CANNON.Particle(),
              });
              world.addBody(anchor);
              world.addConstraint(
                new CANNON.DistanceConstraint(inner.stitches[i], anchor),
              );
            }
          }

          return {
            inner,
            forceReset() {
              inner.stitches.forEach((s) => {
                s.velocity.set(0, 0, 0);
                s.position.copy(s.initPosition);
              });
            },
            render() {
              const a = inner.tile.geo.attributes.position;
              const size = inner.tile.rect;
              for (let i = 0; i < a.count; i++) {
                const p = tempV.copy(inner.stitches[i].position);
                a.setXYZ(i, p.x / size.width, p.y / size.height, p.z);
              }
              a.needsUpdate = true;
            },
            rest() {
              const positions = inner.stitches.map((s) => s.position);
              inner.stitches.forEach((s) => s.sleep());
              gsap.to(positions, {
                duration: layout.isMobile ? O.restDuration / 2 : O.restDuration,
                x: (i) => inner.initPositions[i].x,
                y: (i) => inner.initPositions[i].y,
                z: (i) => inner.initPositions[i].z,
                ease: "power2.out",
                overwrite: true,
              });
            },
            wake() {
              inner.stitches.forEach((s) => s.wakeUp());
            },
            changeTile(tile) {
              this.forceReset();
              inner.tile = tile;
            },
            applyWind(w) {
              if (!w.isBlowing) return;
              const a = inner.tile.geo.attributes.position;
              for (let i = 0; i < a.count; i++) {
                const f = w.flowfield[i];
                if (!f) continue;
                inner.stitches[i].applyLocalForce(
                  new CANNON.Vec3(f.x, f.y, f.z),
                  CANNON.Vec3.ZERO,
                );
              }
            },
          };
        };

        const clock = new THREE.Clock();
        const wind = {
          isBlowing: false,
          force: 0,
          direction: new THREE.Vector3(0.5, 0, -1),
          flowfield: [],
          update(tile) {
            const time = clock.getElapsedTime() * O.windSpeed;
            const a = tile.geo.attributes.position;
            const segs = O.clothSegments;
            const lo = -this.force * 0.1;
            for (let i = 0; i < a.count; i++) {
              const col = i % segs;
              const row = Math.floor(i / segs);
              const n = noise(row * O.windScale, col * O.windScale, time);
              const force = lo + ((this.force - lo) * (n + 1)) / 2;
              this.flowfield[i] = this.direction.clone().multiplyScalar(force);
            }
          },
          set(blowing) {
            this.isBlowing = blowing;
            gsap.to(this, {
              duration: blowing ? O.windRamp : 0,
              force: blowing ? O.windForce : 0,
              overwrite: true,
            });
          },
        };

        const setGravity = (falling) => {
          gsap.to(world.gravity, {
            duration: falling ? O.gravityRamp : 0,
            y: falling ? O.gravity : 0,
            overwrite: true,
          });
        };

        const state = {
          target: 0,
          current: 0,
          currentRounded: 0,
          diff: 0,
          off: 0,
          min: 0,
          max: 0,
          mb: 0,
          dragging: false,
        };

        let tiles = [];
        let items = [];
        let activeSlide = null;
        let cloth = null;
        let hideTween = null;
        let timer = null;
        let windTimer = null;
        let hovered = null;

        const buildItems = () => {
          const lastEl = els[els.length - 1];
          state.mb =
            parseFloat(
              window.getComputedStyle(lastEl).getPropertyValue("margin-bottom"),
            ) || 0;

          loopHeight =
            lastEl.offsetTop +
            lastEl.offsetHeight +
            state.mb -
            els[0].offsetTop;

          tiles = els.map((el) => makeTile(el));

          items = els.map((el, i) => ({
            index: i,
            tile: tiles[i],
            out: false,
          }));
        };

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(-10, -10);
        let pointerInside = false;

        const updateHover = () => {
          if (!O.hoverToFocus || !pointerInside || layout.isMobile) {
            hovered = null;
            return;
          }
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(
            items.map((it) => it.tile.mesh),
            false,
          );
          hovered = hits.length ? hits[0].object : null;
        };

        const handleAlpha = () => {
          const range = Math.max(1, layout.H * O.focusRange);
          items.forEach((item) => {
            const dist = Math.abs(item.tile.group.position.y);
            const t = Math.min(1, dist / range);
            const eased = 1 - t * t;
            let target =
              O.idleOpacity + (O.focusOpacity - O.idleOpacity) * eased;
            if (hovered === item.tile.mesh) target = O.focusOpacity;

            item.tile.alpha +=
              (target - item.tile.alpha) * Math.min(1, O.opacityEase);
            item.tile.mat.uniforms.uAlpha.value = item.tile.alpha;
          });
        };

        const draw = () => {
          state.current += (state.target - state.current) * O.scrollEase;
          state.currentRounded = Math.round(state.current * 100) / 100;
          state.diff = (state.target - state.current) * 0.0005;

          camera.rotation.z +=
            (baseRotation - state.diff * 0.2 - camera.rotation.z) * 0.1;

          const cullEdge = layout.H / 2 + layout.D;

          items.forEach((item) => {
            item.tile.update(state.currentRounded);
            item.tile.mat.uniforms.uVelo.value = state.diff;

            const y = item.tile.group.position.y;
            const isVisible =
              Math.abs(y) - item.tile.rect.height / 2 < cullEdge;

            if (isVisible) {
              item.out = false;
            } else if (!item.out) {
              item.out = true;
              const { position, initPos } = item.tile.geo.attributes;
              position.copy(initPos);
              position.needsUpdate = true;
            }
          });

          updateHover();
          handleAlpha();
        };

        const getClosest = () => {
          let closest = items[0];
          items.forEach((item) => {
            if (
              Math.abs(item.tile.group.position.y) <
              Math.abs(closest.tile.group.position.y)
            ) {
              closest = item;
            }
          });
          return closest;
        };

        const slideTo = (item) => {
          const target = state.target - item.tile.group.position.y;
          gsap.killTweensOf(state);
          gsap.to(state, {
            target,
            duration: layout.isMobile ? 0.2 : O.snapDuration,
            ease: "strong.inOut",
            onComplete: () => {
              state.off = state.target;
              if (item !== activeSlide) {
                activeSlide = item;
                cloth.changeTile(item.tile);
              }
                  clearTimeout(windTimer);
              windTimer = setTimeout(() => {
                wind.set(true);
                cloth.wake();
                setGravity(true);
              }, O.windDelay);
            },
          });
        };

        const restartTimer = (delay) => {
          clearTimeout(timer);
          timer = setTimeout(() => slideTo(getClosest()), delay);
        };

        const calmDown = () => {
          cloth.rest();
          wind.set(false);
          setGravity(false);
        };

        const getPos = (e) => {
          const t = e.changedTouches || e.touches;
          return {
            x: t && t.length ? t[0].clientX : e.clientX,
            y: t && t.length ? t[0].clientY : e.clientY,
          };
        };

        let startY = 0;

        const onScroll = (e) => {
          e.preventDefault();
          const delta = gsap.utils.clamp(-100, 100, e.deltaY);
          state.off += delta * O.scrollSpeed;
          state.target = state.off;
          calmDown();
          clearTimeout(windTimer);
          restartTimer(layout.isMobile ? 1000 : O.settleDelay);
        };

        const onDown = (e) => {
          state.dragging = true;
          startY = getPos(e).y;
          calmDown();
        };

        const onMove = (e) => {
          const base = rootRect();
          const p = getPos(e);
          if (p.x === undefined || p.y === undefined) return;

          pointer.x = ((p.x - base.left) / base.width) * 2 - 1;
          pointer.y = -((p.y - base.top) / base.height) * 2 + 1;
          pointerInside =
            p.x >= base.left &&
            p.x <= base.right &&
            p.y >= base.top &&
            p.y <= base.bottom;

          if (O.windFollowsMouse && !layout.isMobile) {
            gsap.to(wind.direction, {
              duration: 0.1,
              x: p.x / layout.W - 0.5,
              y: -(p.y / layout.H) + 0.5,
              overwrite: true,
            });
          }

          if (!state.dragging) return;
          calmDown();
          const dragY = (p.y - startY) * -O.dragMultiplier;
          state.target = state.off + dragY * O.scrollSpeed;
          clearTimeout(windTimer);
        };

        const onUp = (leaving) => {
          if (leaving) pointerInside = false;
          if (!state.dragging) return;
          state.off = state.target;
          state.dragging = false;
          if (!leaving) calmDown();
          restartTimer(layout.isMobile ? 1000 : O.settleDelay);
        };

        buildItems();
        activeSlide = items[0];
        cloth = makeCloth(activeSlide.tile);
        wind.update(activeSlide.tile);

        state.target = loopHeight / 2 - activeSlide.tile.baseY;
        state.current = state.target;
        state.off = state.target;
        draw();

        const introTimer = setTimeout(() => {
          wind.set(true);
          cloth.wake();
          setGravity(true);
        }, 600);

        const onResize = () => {
          measure();
          camera.aspect = layout.W / layout.H;
          camera.fov = getFov();
          camera.updateProjectionMatrix();
          renderer.setSize(layout.W, layout.H);
        };

        const onLeave = () => onUp(true);
        const onPointerUp = () => onUp(false);

        root.addEventListener("wheel", onScroll, { passive: false });
        root.addEventListener("mousedown", onDown);
        root.addEventListener("touchstart", onDown, { passive: true });
        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("mouseup", onPointerUp);
        window.addEventListener("touchend", onPointerUp);
        document.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", onResize);

        renderer.setAnimationLoop(() => {
          world.step(1 / 50);
          wind.update(cloth.inner.tile);
          cloth.render();
          cloth.applyWind(wind);
          draw();
          renderer.render(scene, camera);
        });

        cleanup = () => {
          clearTimeout(timer);
          clearTimeout(windTimer);
          clearTimeout(introTimer);
          renderer.setAnimationLoop(null);
          root.removeEventListener("wheel", onScroll);
          root.removeEventListener("mousedown", onDown);
          root.removeEventListener("touchstart", onDown);
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("touchmove", onMove);
          window.removeEventListener("mouseup", onPointerUp);
          window.removeEventListener("touchend", onPointerUp);
          document.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", onResize);
          gsap.killTweensOf(state);
          tiles.forEach((t) => {
            t.geo.dispose();
            t.mat.dispose();
            scene.remove(t.group);
          });
          renderer.dispose();
        };
      })
      .catch((e) =>
        console.error("[ClothSlideshow]", e.message),
      );

    return () => {
      disposed = true;
      cleanup();
    };
  }, [slides, clothSegments]);

  const css = `
#${uid} { background-color: ${bgColor}; }
#${uid} .cs-slide {
  padding-top: ${slideAspect}%;
  margin-bottom: ${slideGap}%;
}
#${uid} .cs-inner { width: 72vw; max-width: 520px; }
@media screen and (min-width: 1112px) {
  #${uid} .cs-inner { width: ${slideWidth}; max-width: ${slideMaxWidth}; }
}
`;

  return (
    <div
      id={uid}
      ref={rootRef}
      className={`relative h-screen w-full cursor-grab select-none overflow-hidden active:cursor-grabbing ${className}`}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <ol ref={listRef} className="cs-inner m-0 list-none p-0">
          {slides.map((slide, i) => (
            <li
              key={`${slide.src}-${i}`}
              data-slide=""
              className="cs-slide relative w-full overflow-hidden"
            >
              <img
                src={slide.src}
                alt={slide.alt || ""}
                crossOrigin="anonymous"
                draggable="false"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
              />
            </li>
          ))}
        </ol>
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />
    </div>
  );
}
