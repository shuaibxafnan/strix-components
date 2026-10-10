"use client";

import { useEffect, useId, useRef } from "react";

// ─── InstancedMouseGrid ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #000        Wrapper / scene background color
// className          string   ""          Extra Tailwind classes on the wrapper
// gridCount          number   55          Instances per axis (gridCount² total)
// cellSize           number   0.5         Size of a single instance in world units
// shape              string   "square"    "square" | "cylinder" | "torus" | "icosahedron"
// color              string   #dddddd     Base material color of the instances
// colorDegrade       number   1           How strongly color fades toward grid edges (0 = flat)
// metalness          number   0           Material metalness (0–1)
// roughness          number   0           Material roughness (0–1)
// frustumSize        number   4           Orthographic half-height; lower = zoomed in
// cameraDistance     number   40          Distance of the camera on each axis (x, y, z)
// speed              number   1           Idle rotation + bobbing speed multiplier
// frequency          number   1           Wave frequency of the idle bobbing
// mouseSize          number   1           Radius of the cursor influence area
// rotationSpeed      number   1           Per-instance rotation offset across the grid
// rotationAmmount    number   0           Master rotation amount (0 disables all rotation)
// mouseScaling       number   0           How much instances scale up under the cursor
// mouseIndent        number   1           How far instances are pushed down by the cursor
// introDuration      number   3           Seconds for the intro reveal animation
// mouseEase          number   0.08        Cursor follow smoothing (higher = snappier)
// trailEase          number   0.05        Trail smoothing behind the cursor
// showFollower       boolean  true        Render the floating sphere that tracks the cursor
// followerColor      string   #cb0f40     Follower sphere color
// followerSize       number   0.4         Follower sphere radius
// followerSpin       number   1           Follower sphere rotation speed
// enableShadows      boolean  true        Toggle shadow map rendering
// dprMax             number   1.5         Device pixel ratio cap
// threeVersion       string   0.160.0     Three.js version pulled from the ESM CDN
// ──────────────────────────────────────────────────────────────────────────

export default function InstancedMouseGrid({
  bgColor = "#000",
  className = "",
  gridCount = 55,
  cellSize = 0.5,
  shape = "square",
  color = "#dddddd",
  colorDegrade = 1,
  metalness = 0,
  roughness = 0,
  frustumSize = 4,
  cameraDistance = 40,
  speed = 1,
  frequency = 1,
  mouseSize = 1,
  rotationSpeed = 1,
  rotationAmmount = 0,
  mouseScaling = 0,
  mouseIndent = 1,
  introDuration = 3,
  mouseEase = 0.08,
  trailEase = 0.05,
  showFollower = true,
  followerColor = "#cb0f40",
  followerSize = 0.4,
  followerSpin = 1,
  enableShadows = true,
  dprMax = 1.5,
  threeVersion = "0.160.0",
}) {
  const uid = useId().replace(/[:]/g, "");
  const canvasRef = useRef(null);
  const configRef = useRef({});

  configRef.current = {
    speed,
    frequency,
    mouseSize,
    rotationSpeed,
    rotationAmmount,
    mouseScaling,
    mouseIndent,
    mouseEase,
    trailEase,
    followerSpin,
  };

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    const importESM = new Function("url", "return import(url)");

    const start = async () => {
      const THREE = await importESM(`https://esm.sh/three@${threeVersion}`);
      const { RoundedBoxGeometry } = await importESM(
        `https://esm.sh/three@${threeVersion}/examples/jsm/geometries/RoundedBoxGeometry.js`,
      );

      const canvas = canvasRef.current;
      if (disposed || !canvas) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        stencil: false,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprMax));
      renderer.shadowMap.enabled = enableShadows;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();

      let ratio = 1;
      let ratioW = 1;
      const camera = new THREE.OrthographicCamera(
        -frustumSize,
        frustumSize,
        frustumSize,
        -frustumSize,
        0.001,
        1000,
      );
      camera.position.set(cameraDistance, cameraDistance, cameraDistance);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      scene.add(new THREE.HemisphereLight(0x9f9f9f, 0xffffff, 1));
      scene.add(new THREE.AmbientLight(0xffffff, 1));

      const d2 = new THREE.DirectionalLight(0x909090, 1);
      d2.position.set(-1, 0.5, 1).multiplyScalar(10);
      scene.add(d2);

      const d1 = new THREE.DirectionalLight(0xffffff, 4);
      d1.position.set(1, 0.5, 1).multiplyScalar(10);
      d1.castShadow = enableShadows;
      d1.shadow.camera.left = -10;
      d1.shadow.camera.right = 10;
      d1.shadow.camera.top = 10;
      d1.shadow.camera.bottom = -10;
      d1.shadow.camera.far = 40;
      d1.shadow.mapSize.width = 2048;
      d1.shadow.mapSize.height = 2048;
      scene.add(d1);

      const gridSpan = gridCount * cellSize;

      let geometry;
      switch (shape) {
        case "cylinder":
          geometry = new THREE.CylinderGeometry(cellSize, cellSize, cellSize);
          break;
        case "torus":
          geometry = new THREE.TorusGeometry(cellSize * 0.5, cellSize * 0.3);
          break;
        case "icosahedron":
          geometry = new THREE.IcosahedronGeometry(cellSize, 0);
          break;
        default:
          geometry = new RoundedBoxGeometry(
            cellSize,
            cellSize,
            cellSize,
            4,
            0.1,
          );
      }

      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness,
        roughness,
      });

      const mesh = new THREE.InstancedMesh(
        geometry,
        material,
        gridCount * gridCount,
      );
      mesh.castShadow = enableShadows;
      mesh.receiveShadow = enableShadows;

      const totalColor =
        material.color.r + material.color.g + material.color.b || 1;
      const weights = new THREE.Vector3(
        material.color.r,
        material.color.g,
        material.color.b,
      );
      weights.divideScalar(totalColor).multiplyScalar(-0.5).addScalar(1);

      const dummy = new THREE.Object3D();
      const instanceColor = new THREE.Vector3();
      let i = 0;

      for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
          dummy.position.set(
            x * cellSize - gridSpan / 2 + cellSize / 2,
            0,
            y * cellSize - gridSpan / 2 + cellSize / 2,
          );
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);

          const center = 1 - dummy.position.length() * 0.12 * colorDegrade;
          instanceColor.set(
            center * weights.x + (1 - weights.x),
            center * weights.y + (1 - weights.y),
            center * weights.z + (1 - weights.z),
          );
          mesh.setColorAt(i, instanceColor);
          i++;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      const vertexHead = [
        "uniform float uTime;",
        "uniform float uAnimate;",
        "uniform vec2 uPos0;",
        "uniform vec2 uPos1;",
        "uniform vec4 uConfig;",
        "uniform vec4 uConfig2;",
        "float remapRange(float value, float min1, float max1, float min2, float max2) {",
        "  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);",
        "}",
        "float cubicOutEase(float t){ float f = t - 1.0; return f * f * f + 1.0; }",
        "float cubicInOutEase(float t){",
        "  return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;",
        "}",
        "mat4 axisRotation(vec3 axis, float angle) {",
        "  axis = normalize(axis);",
        "  float s = sin(angle);",
        "  float c = cos(angle);",
        "  float oc = 1.0 - c;",
        "  return mat4(",
        "    oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,",
        "    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,",
        "    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,",
        "    0.0, 0.0, 0.0, 1.0);",
        "}",
        "vec3 rotateAxis(vec3 v, vec3 axis, float angle) {",
        "  return (axisRotation(axis, angle) * vec4(v, 1.0)).xyz;",
        "}",
        "float sdSegment(in vec2 p, in vec2 a, in vec2 b) {",
        "  vec2 pa = p - a, ba = b - a;",
        "  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);",
        "  return length(pa - ba * h);",
        "}",
        "void main(){",
      ].join("\n");

      const projectVertex = [
        "vec4 iPosition = instanceMatrix[3];",
        "float toCenter = length(iPosition.xz);",
        "float mouseTrail = sdSegment(iPosition.xz, uPos0, uPos1);",
        "mouseTrail = smoothstep(2.0, 5.0 * uConfig.z, mouseTrail);",
        "transformed *= 1.0 + cubicOutEase(1.0 - mouseTrail) * uConfig2.y;",
        "float startT = 0.0 + toCenter * 0.02;",
        "float endT = startT + (toCenter + 1.5) * 0.06;",
        "float anim = remapRange(clamp(uAnimate, startT, endT), startT, endT, 0.0, 1.0);",
        "transformed = rotateAxis(transformed, vec3(0.0, 1.0, 1.0), uConfig2.x * (anim * 3.14 + uTime * uConfig.x + toCenter * 0.4 * uConfig.w));",
        "transformed.y += (-1.0 * (1.0 - mouseTrail)) * uConfig2.z;",
        "transformed.xyz *= cubicInOutEase(anim);",
        "transformed.y += cubicInOutEase(1.0 - anim) * 1.0;",
        "transformed.y += sin(uTime * 2.0 * uConfig.x + toCenter * uConfig.y) * 0.1;",
        "vec4 mvPosition = vec4(transformed, 1.0);",
        "#ifdef USE_INSTANCING",
        "  mvPosition = instanceMatrix * mvPosition;",
        "#endif",
        "mvPosition = modelViewMatrix * mvPosition;",
        "gl_Position = projectionMatrix * mvPosition;",
      ].join("\n");

      const uniforms = {
        uTime: { value: 0 },
        uPos0: { value: new THREE.Vector2() },
        uPos1: { value: new THREE.Vector2() },
        uAnimate: { value: 0 },
        uConfig: {
          value: new THREE.Vector4(speed, frequency, mouseSize, rotationSpeed),
        },
        uConfig2: {
          value: new THREE.Vector4(
            rotationAmmount,
            mouseScaling,
            mouseIndent,
            0,
          ),
        },
      };

      const patch = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          "void main() {",
          vertexHead,
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <project_vertex>",
          projectVertex,
        );
        shader.uniforms = { ...shader.uniforms, ...uniforms };
      };

      material.onBeforeCompile = patch;

      const depthMaterial = new THREE.MeshDepthMaterial();
      depthMaterial.onBeforeCompile = patch;
      depthMaterial.depthPacking = THREE.RGBADepthPacking;
      mesh.customDepthMaterial = depthMaterial;

      scene.add(mesh);

      let follower = null;
      if (showFollower) {
        follower = new THREE.Mesh(
          new THREE.SphereGeometry(1, 32, 32),
          new THREE.MeshPhysicalMaterial({
            emissive: 0x000000,
            color: followerColor,
            roughness: 0,
            metalness: 0.4,
          }),
        );
        follower.castShadow = enableShadows;
        follower.scale.setScalar(0);
        scene.add(follower);
      }

      const hitplane = new THREE.Mesh(
        new THREE.PlaneGeometry(),
        new THREE.MeshBasicMaterial(),
      );
      hitplane.scale.setScalar(20);
      hitplane.rotation.x = -Math.PI / 2;
      hitplane.updateMatrix();
      hitplane.updateMatrixWorld();

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const ndc = new THREE.Vector2();
      const scratch = new THREE.Vector2();
      const vel = new THREE.Vector2();

      const onPointerMove = (ev) => {
        const rect = canvas.getBoundingClientRect();
        const px = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const py = ev.touches ? ev.touches[0].clientY : ev.clientY;
        ndc.x = ((px - rect.left) / rect.width) * 2 - 1;
        ndc.y = -(((py - rect.top) / rect.height) * 2 - 1);
        raycaster.setFromCamera(ndc, camera);
        const intersects = raycaster.intersectObject(hitplane);
        if (intersects.length > 0) {
          mouse.x = intersects[0].point.x;
          mouse.y = intersects[0].point.z;
        }
      };

      const resize = () => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        renderer.setSize(w, h, false);
        ratio = w / h;
        ratioW = h / w;
        if (ratio > ratioW) ratioW = 1;
        else ratio = 1;
        camera.left = -frustumSize * ratio;
        camera.right = frustumSize * ratio;
        camera.top = frustumSize * ratioW;
        camera.bottom = -frustumSize * ratioW;
        camera.updateProjectionMatrix();
      };
      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("touchmove", onPointerMove, { passive: true });

      let raf = 0;
      const startTime = performance.now();

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const cfg = configRef.current;
        const elapsed = (performance.now() - startTime) / 1000;

        uniforms.uTime.value = elapsed;
        uniforms.uAnimate.value = Math.min(elapsed / introDuration, 1);
        uniforms.uConfig.value.set(
          cfg.speed,
          cfg.frequency,
          cfg.mouseSize,
          cfg.rotationSpeed,
        );
        uniforms.uConfig2.value.set(
          cfg.rotationAmmount,
          cfg.mouseScaling,
          cfg.mouseIndent,
          0,
        );

        scratch
          .copy(mouse)
          .sub(uniforms.uPos0.value)
          .multiplyScalar(cfg.mouseEase);
        uniforms.uPos0.value.add(scratch);

        scratch
          .copy(uniforms.uPos0.value)
          .sub(uniforms.uPos1.value)
          .multiplyScalar(cfg.trailEase);
        scratch.sub(vel).multiplyScalar(0.05);
        vel.add(scratch);
        uniforms.uPos1.value.add(vel);

        if (follower) {
          const reveal = Math.min(Math.max((elapsed - 1) / 1, 0), 1);
          const eased = 1 - Math.pow(1 - reveal, 3);
          follower.scale.setScalar(followerSize * eased);
          follower.position.x = uniforms.uPos0.value.x;
          follower.position.z = uniforms.uPos0.value.y;
          follower.rotation.x = elapsed * cfg.followerSpin;
          follower.rotation.y = elapsed * cfg.followerSpin;
        }

        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("touchmove", onPointerMove);
        geometry.dispose();
        material.dispose();
        depthMaterial.dispose();
        hitplane.geometry.dispose();
        hitplane.material.dispose();
        if (follower) {
          follower.geometry.dispose();
          follower.material.dispose();
        }
        mesh.dispose();
        renderer.dispose();
      };
    };

    start().catch(() => {});

    return () => {
      disposed = true;
      cleanup();
    };
  }, [
    uid,
    gridCount,
    cellSize,
    shape,
    color,
    colorDegrade,
    metalness,
    roughness,
    frustumSize,
    cameraDistance,
    introDuration,
    showFollower,
    followerColor,
    followerSize,
    enableShadows,
    dprMax,
    threeVersion,
  ]);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
