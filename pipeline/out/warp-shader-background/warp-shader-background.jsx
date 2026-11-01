"use client";

import { useEffect, useRef } from "react";

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

export default function WarpShaderBackground({
  timeMultiplier = 0.2,
  warpIntensity = 3.0,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let renderer, scene, camera, clock, uniforms, geometry, material;
    let animationFrameId;

    const handleResize = () => {
      const container = containerRef.current;
      if (!renderer || !uniforms || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.u_resolution.value.x = renderer.domElement.width;
      uniforms.u_resolution.value.y = renderer.domElement.height;
    };

    const animateLoop = () => {
      if (!uniforms || !renderer) return;
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animateLoop);
    };

    import("three").then((THREE) => {
      const container = containerRef.current;
      if (cancelled || !container) return;

      clock = new THREE.Clock();
      camera = new THREE.Camera();
      camera.position.z = 1;
      scene = new THREE.Scene();

      geometry = new THREE.BufferGeometry();
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

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
      });

      scene.add(new THREE.Mesh(geometry, material));

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      handleResize();
      window.addEventListener("resize", handleResize);
      animateLoop();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      renderer = null;
    };
  }, [timeMultiplier, warpIntensity]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-black select-none pointer-events-none [&>canvas]:block [&>canvas]:absolute [&>canvas]:top-0 [&>canvas]:left-0 ${className}`}
    />
  );
}
