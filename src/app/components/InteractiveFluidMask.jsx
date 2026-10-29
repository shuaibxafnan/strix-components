"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveFluidMask({
  bgImageUrl = "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1080&q=80",
  maskColor = "#ffffff",
  dissipation = 0.92,
  falloff = 0.3,
}) {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [glReady, setGlReady] = useState(false);

  useEffect(() => {
    let renderer, gl, flowmap, mesh, program;
    let animationFrameId;

    const imageSize = [2048, 1638];
    const mouse = { x: -1, y: -1 };
    const velocity = { x: 0, y: 0, len: 0, needsUpdate: false };
    const lastMouse = { x: 0, y: 0 };
    let lastTime = null;
    let aspect = 1;

    const vertexShader = `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      precision highp int;
      uniform sampler2D tWater;
      uniform sampler2D tFlow;
      uniform float uTime;
      varying vec2 vUv;
      uniform vec4 res;
      uniform vec2 img;

      void main() {
          vec3 flow = texture2D(tFlow, vUv).rgb;
          vec2 uv = 0.5 * gl_FragCoord.xy / res.xy;
          
          vec2 myUV = (uv - vec2(0.5)) * res.zw + vec2(0.5);
          myUV -= flow.xy * (0.15 * 1.2);

          vec2 myUV2 = (uv - vec2(0.5)) * res.zw + vec2(0.5);
          myUV2 -= flow.xy * (0.125 * 1.2);

          vec2 myUV3 = (uv - vec2(0.5)) * res.zw + vec2(0.5);
          myUV3 -= flow.xy * (0.10 * 1.4);

          vec3 tex = texture2D(tWater, myUV).rgb;
          vec3 tex2 = texture2D(tWater, myUV2).rgb;
          vec3 tex3 = texture2D(tWater, myUV3).rgb;

          gl_FragColor = vec4(tex.r, tex2.g, tex3.b, 1.0);
      }
    `;

    // 1. Core Mathematical Aspect Ratio Calculations
    function calculateAspectRatios() {
      let a1, a2;
      const imageAspect = imageSize[1] / imageSize[0];
      const windowAspect = window.innerHeight / window.innerWidth;
      if (windowAspect < imageAspect) {
        a1 = 1;
        a2 = windowAspect / imageAspect;
      } else {
        a1 = (1 / windowAspect) * imageAspect;
        a2 = 1;
      }
      return { a1, a2 };
    }

    // 2. Safe Window Resize Management (Using the passed instance)
    function handleResize(oglInstance) {
      if (!gl || !renderer || !mesh || !oglInstance) return;

      gl.canvas.width = window.innerWidth * 2.0;
      gl.canvas.height = window.innerHeight * 2.0;
      gl.canvas.style.width = window.innerWidth + "px";
      gl.canvas.style.height = window.innerHeight + "px";

      const { a1, a2 } = calculateAspectRatios();

      // Fixed: Using oglInstance directly instead of window global 'ogl'
      mesh.program.uniforms.res.value = new oglInstance.Vec4(
        window.innerWidth,
        window.innerHeight,
        a1,
        a2,
      );

      renderer.setSize(window.innerWidth, window.innerHeight);
      aspect = window.innerWidth / window.innerHeight;
    }

    async function initOglEngine() {
      // Safely import library locally inside user client side hook execution frame
      const oglModule = await import("ogl");
      if (!canvasContainerRef.current) return;

      renderer = new oglModule.Renderer({ dpr: 2, alpha: true });
      gl = renderer.gl;
      canvasContainerRef.current.appendChild(gl.canvas);

      flowmap = new oglModule.Flowmap(gl, {
        falloff: falloff,
        dissipation: dissipation,
        alpha: 0.5,
      });

      const geometry = new oglModule.Geometry(gl, {
        position: {
          size: 2,
          data: new Float32Array([-1, -1, 3, -1, -1, 3]),
        },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });

      const texture = new oglModule.Texture(gl, {
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
      });

      const imgElement = new Image();
      imgElement.crossOrigin = "Anonymous";
      imgElement.src = bgImageUrl;
      imgElement.onload = () => {
        texture.image = imgElement;
        setGlReady(true);
      };

      const { a1, a2 } = calculateAspectRatios();

      program = new oglModule.Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          tWater: { value: texture },
          res: {
            value: new oglModule.Vec4(
              window.innerWidth,
              window.innerHeight,
              a1,
              a2,
            ),
          },
          img: { value: new oglModule.Vec2(imageSize[1], imageSize[0]) },
          tFlow: flowmap.uniform,
        },
      });

      mesh = new oglModule.Mesh(gl, { geometry, program });

      const isTouchCapable = "ontouchstart" in window;
      if (isTouchCapable) {
        window.addEventListener("touchstart", updateMouse, false);
        window.addEventListener("touchmove", updateMouse, { passive: false });
      } else {
        window.addEventListener("mousemove", updateMouse, false);
      }

      // Add modern, targeted listener closure tracking for clean unmount references
      const boundResizeHandler = () => handleResize(oglModule);
      window.addEventListener("resize", boundResizeHandler, false);

      // Perform initial calculations
      handleResize(oglModule);

      animationFrameId = requestAnimationFrame(renderLoop);
    }

    function updateMouse(e) {
      if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX;
        e.y = e.changedTouches[0].pageY;
      }
      if (e.x === undefined) {
        e.x = e.pageX;
        e.y = e.pageY;
      }

      mouse.x = e.x / window.innerWidth;
      mouse.y = 1.0 - e.y / window.innerHeight;

      if (!lastTime) {
        lastTime = performance.now();
        lastMouse.x = e.x;
        lastMouse.y = e.y;
      }

      const deltaX = e.x - lastMouse.x;
      const deltaY = e.y - lastMouse.y;
      lastMouse.x = e.x;
      lastMouse.y = e.y;

      const time = performance.now();
      const delta = Math.max(10.4, time - lastTime);
      lastTime = time;

      velocity.x = deltaX / delta;
      velocity.y = deltaY / delta;
      velocity.len = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y,
      );
      velocity.needsUpdate = true;
    }

    function renderLoop(t) {
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!velocity.needsUpdate) {
        mouse.x = -1;
        mouse.y = -1;
        velocity.x = 0;
        velocity.y = 0;
        velocity.len = 0;
      }
      velocity.needsUpdate = false;

      if (flowmap && renderer && program) {
        flowmap.aspect = aspect;
        flowmap.mouse.set(mouse.x, mouse.y);

        const lerpFactor = velocity.len > 0 ? 0.15 : 0.1;
        flowmap.velocity.set(
          flowmap.velocity.x + (velocity.x - flowmap.velocity.x) * lerpFactor,
          flowmap.velocity.y + (velocity.y - flowmap.velocity.y) * lerpFactor,
        );

        flowmap.update();
        program.uniforms.uTime.value = t * 0.01;
        renderer.render({ scene: mesh });
      }
    }

    initOglEngine();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("touchstart", updateMouse);
      window.removeEventListener("touchmove", updateMouse);

      if (canvasContainerRef.current && gl && gl.canvas) {
        try {
          canvasContainerRef.current.removeChild(gl.canvas);
        } catch (err) {}
      }
    };
  }, [bgImageUrl, dissipation, falloff]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ backgroundColor: maskColor }}
    >
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full z-10"
      />

      <div
        className="absolute inset-0 w-full h-full z-20 pointer-events-none mix-blend-screen flex items-center justify-center p-4 sm:p-12 transition-opacity duration-500"
        style={{
          backgroundColor: maskColor,
          opacity: glReady ? 1 : 0,
        }}
      >
        <svg
          viewBox="0 0 1040 205.1"
          className="w-[90%] max-w-6xl h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
          fill="#000000"
        >
          <g>
            <path d="M108.7,155.2l24.8,23.3c-2.1,3.1-4.9,6.2-8.3,9.2c-10.2,8.8-26.2,16.4-48.5,16.4C33.4,204.1,1,174.8,1,131.2 c0-43.3,32.4-72.6,75.7-72.6c29.8,0,48.4,13.2,56.8,25.5l-28.7,26.7c-5.5-8-14.3-13.2-26.1-13.2c-18.3,0-32.4,12.6-32.4,33.6 c0,3.7,0.4,7.2,1.3,10.4c1.5,5.9,4.4,10.8,8.2,14.5c5,4.9,11.6,8,19.1,8.7c1.2,0.1,2.5,0.2,3.8,0.2c10.5,0,18.7-4.6,24.2-11.1 c0.7-0.8,1.3-1.6,1.8-2.4L108.7,155.2z" />
            <path d="M239.9,59.4v42.5c-2.6-0.6-6.3-1.2-10.9-1.2c-11.5,0-26.7,4.9-32.4,12.6v88.3h-44.2V63.1h44.2V80 C205.8,68.8,223.3,59.4,239.9,59.4z" />
            <path d="M381.7,181.7c-9.3,9.7-21.1,16.9-34.5,20.4l0.7-0.1L381.7,181.7z" />
            <path d="M539.8,92.8c-8.7-26-34.4-34.1-61.4-34.1c-21.2,0-45,6.3-62.8,21.5l7.2,12.6l8.6,15.2 c11.2-9.5,25.5-14.6,39.3-14.6c17.8,0,28.1,8,28.1,20.1v16.6c-8.3-10.3-24.7-16.1-43-16.1c-7.1,0-14.8,1.2-21.9,4.1 c-14,5.7-25.7,18-25.7,40.3c0,24.8,16.7,39,34.1,43.8c0.7,0.2,1.4,0.4,2.1,0.5c3.8,0.9,7.7,1.3,11.4,1.3c4.3,0,8.5-0.4,12.5-1.2 c1.8-0.3,3.5-0.7,5.2-1.2c10.6-2.8,19.6-8.1,25.2-14.9v13.8h44.1V114C542.9,105.9,541.8,98.8,539.8,92.8z M498.8,165.1 c-4.6,6.6-14.9,10-24.7,10c-11.8,0-22.1-5.2-22.1-16.1c0-10.9,10.3-16.1,22.1-16.1c9.8,0,20.1,3.4,24.7,9.8V165.1z" />
            <path d="M605.3,201.1c-5.9-2.5-10.7-6.2-14.1-11.1C595.1,194.7,599.9,198.5,605.3,201.1z" />
            <path d="M656.2,101.5h-28.1v19.6c-1.4-0.1-2.8-0.2-4.2-0.2c-18.2,0-33.7,11.5-39.6,27.5v-46.9h-22.9V63.1h22.9V25.2 h43.9v37.9h28.1V101.5z" />
            <path d="M660.2,195.9c-2.8,2.6-6.9,4.9-12.4,6.6c-5.1,1.5-11.3,2.5-18.7,2.6c12-1.5,22.4-7.9,29.1-17.2L660.2,195.9z" />
            <path d="M725.5,26.2c0,14-11.2,25.5-25.2,25.5s-25.2-11.5-25.2-25.5S686.3,1,700.3,1S725.5,12.2,725.5,26.2z" />
            <polygon points="891.5,63.1 879.4,93.8 873.7,108.5 837,201.6 790,201.6 760.2,125.9 747.6,93.8 735.6,63.1 782,63.1 792.9,93.8 802.1,119.5 813.2,150.9 825.8,115.8 833.8,93.8 844.8,63.1" />
            <path d="M939.8,116.6c1.4-8,6.3-18.3,18-22.2c3-1,6.5-1.6,10.4-1.6c20.3,0,27.5,14.1,28.7,23.8H939.8z M968.2,204l2,0 c21.2,0,44.1-6,57.9-18.4l-18.6-27.5c-7.7,7.5-24.6,11.8-34.4,11.8c-20.1,0-32.1-11.8-34.7-24.7h98.6v-9.5 c0-47-29.8-77.2-70.8-77.2c-28.1,0-50.7,13.6-63.2,34.1c-2,3.3-3.8,6.8-5.2,10.5c-3.4,8.6-5.3,18-5.3,27.9 c0,44.3,31.8,71.9,73.5,72.8L968.2,204z" />
          </g>
          <polyline points="678.2,201.4 678.2,63.1 722.3,63.1 722.3,201.4" />
          <path d="M395.3,135.8c0-10-1.3-19.2-3.8-27.5c-1.7-5.6-3.9-10.8-6.6-15.5c-12.1-21.6-33.9-34.1-60.4-34.1 c-9.1,0-17.7,1.4-25.5,4.1c-25.9,11.5-43.9,37.5-43.9,67.8c0,37.8,28.1,69,64.5,73.5c3,0.4,6,0.5,9,0.5c6.4,0,12.7-0.8,18.6-2.4 c13.3-3.5,25.2-10.7,34.5-20.4l-15.9-23.5c-7.7,7.5-24.7,11.8-34.4,11.8c-20.1,0-32.1-11.8-34.7-24.7h98.6V135.8z M296.1,116.6 c1.7-10,9.2-23.8,28.4-23.8c6.4,0,11.5,1.4,15.5,3.6c8.7,4.8,12.4,13.5,13.1,20.2H296.1z" />
          <path d="M658.1,187.8c-6.7,9.3-17.1,15.8-29.1,17.2h0c-1.7,0.2-3.4,0.3-5.2,0.3c-6.6,0-12.9-1.5-18.5-4.2 c-5.5-2.7-10.3-6.5-14.1-11.1c0,0,0,0,0-0.1c-4.6-6.5-7-15.1-7-25.6v-15.9c6-16.1,21.4-27.5,39.6-27.5c1.4,0,2.8,0.1,4.2,0.2V152 c0,7.1,3.6,12.6,9.8,13.8c0.8,0.1,1.6,0.2,2.5,0.2c4.9,0,9.7-1.7,11.2-3.4l1.9,7.4L658.1,187.8z" />
        </svg>
      </div>

      {!glReady && (
        <div className="absolute inset-0 bg-[#ffffff] z-30 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
