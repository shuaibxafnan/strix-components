"use client";

import { useEffect, useRef, useState } from "react";

// ─── GenerativeWarpShader ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// timeMultiplier    number   0.2       Global runtime frequency speed factor
// warpIntensity     number   3.0       Coefficient scale passed to coswarp loops
// widthClass        string   w-full    Tailwind structural width scale layout
// heightClass       string   h-screen  Tailwind structural height scale layout
// ──────────────────────────────────────────────────────────────────────────

export default function GenerativeWarpShader({
  timeMultiplier = 0.2,
  warpIntensity = 3.0,
  widthClass = "w-full",
  heightClass = "h-screen",
}) {
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Inlined Shading Language Source Definitions
  const vertexShaderSource = `
    varying vec2 vUv;
    void main() {
      gl_Position = vec4(position, 1.0);
      vUv = uv;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_time_multiplier;
    uniform float u_warp_intensity;
    varying vec2 vUv;
    
    const float PI = 3.1415926535897932384626433832795;
    const float TAU = PI * 2.;
    
    void coswarp(inout vec3 trip, float warpsScale) {
      trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (u_time * .25));
      trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (u_time * .25));
      trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (u_time * .25));
    }
    
    void main() {
      vec2 uv = (gl_FragCoord.xy - u_resolution * .5) / u_resolution.yy + 0.5;
      
      float t = (u_time * u_time_multiplier) + length(fract((uv - .5) * 10.));
      float t2 = (u_time * (u_time_multiplier * 0.5)) + length(fract((uv - .5) * 20.));
      
      vec2 uv2 = uv;
      vec3 w = vec3(uv.x, uv.y, 1.);
      coswarp(w, u_warp_intensity);
      
      uv.x += w.r;
      uv.y += w.g;
      
      vec3 color = vec3(0., .5, uv2.x);
      color.r = sin(u_time * .2) + sin(length(uv - .5) * 10.);
      color.g = sin(u_time * .3) + sin(length(uv - .5) * 20.);
      
      coswarp(color, u_warp_intensity);
      color = vec3(smoothstep(color.r, sin(t2), sin(t)));
      
      gl_FragColor = vec4(vec3(color.r, color.g, color.b), 1.0);
    }
  `;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let THREE;
    let camera, scene, renderer, clock;
    let uniforms;
    let animationFrameId;

    const loadThree = () => {
      if (window.THREE) {
        return Promise.resolve(window.THREE);
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.async = true;
        script.onload = () => resolve(window.THREE);
        script.onerror = () =>
          reject(new Error("Failed to load Three.js engine module"));
        document.head.appendChild(script);
      });
    };

    const initEngine = (loadedThree) => {
      THREE = loadedThree;
      const container = containerRef.current;
      if (!container) return;

      clock = new THREE.Clock();
      camera = new THREE.Camera();
      camera.position.z = 1;

      scene = new THREE.Scene();

      // Modernized replacement for deprecated PlaneBufferGeometry(2, 2)
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0,
        -1.0, 0.0, 1.0, 1.0, 0.0,
      ]);
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

      uniforms = {
        u_time: { value: 1.0 },
        u_resolution: { value: new THREE.Vector2() },
        u_time_multiplier: { value: timeMultiplier },
        u_warp_intensity: { value: warpIntensity },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Caps execution load overhead on 4K screens

      container.appendChild(renderer.domElement);

      handleResize();
      window.addEventListener("resize", handleResize);
      animateLoop();
    };

    const handleResize = () => {
      if (!renderer || !uniforms) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      uniforms.u_resolution.value.x = renderer.domElement.width;
      uniforms.u_resolution.value.y = renderer.domElement.height;
    };

    const animateLoop = () => {
      if (!uniforms || !renderer || !scene || !camera || !clock) return;

      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animateLoop);
    };

    loadThree()
      .then((res) => initEngine(res))
      .catch((err) =>
        console.error("[WebGL Shader] Initialization failure:", err),
      );

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [isClient, timeMultiplier, warpIntensity]);

  // Zero ssr flash safe render checkpoint
  if (!isClient) {
    return <div className={`relative bg-black ${widthClass} ${heightClass}`} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black select-none pointer-events-none [&>canvas]:block [&>canvas]:absolute [&>canvas]:top-0 [&>canvas]:left-0 ${widthClass} ${heightClass}`}
    />
  );
}
