"use client";

import { useEffect, useRef, useState } from "react";

// ─── AshFall ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// width           string    100%       Component width (Tailwind classes)
// height          string    h-screen   Component height (Tailwind classes)
// multiplier      number    15.5       Density scaling multiplier for layers
// zoomSpeed       number    10.0       The speed factor of the zoom effect
// initialLayers   number    10         Number of parallax layers (1 to 20)
// initialOctaves  number    5          FBM noise octaves (1 to 10)
// timeScale       number    0.0005     Time multiplier regulating speed
// timeOffset      number    -10000.0   Arbitrary offset to jumpstart animation timeline
// noiseTextureUrl string    ...        Path to the cloud/perlin noise asset
// ──────────────────────────────────────────────────────────────────────────

export default function AshFall({
  width = "w-full",
  height = "h-screen",
  multiplier = 15.5,
  zoomSpeed = 10.0,
  initialLayers = 10,
  initialOctaves = 5,
  timeScale = 0.0005,
  timeOffset = -10000.0,
  noiseTextureUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png",
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag on client side to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    let renderer, camera, scene, material, mesh;
    let animationFrameId;
    let uniforms = {};

    // ─── Vertex Shader ───────────────────────────────────────────────────────
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    // ─── Fragment Shader ─────────────────────────────────────────────────────
    const fragmentShader = `
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform sampler2D u_noise;
      
      #define PI 3.141592653589793
      #define TAU 6.
      
      const float multiplier = ${multiplier.toFixed(4)};
      const float zoomSpeed = ${zoomSpeed.toFixed(4)};
      const int layers = ${parseInt(initialLayers)};
      const int octaves = ${parseInt(initialOctaves)};

      vec2 hash2(vec2 p) {
        vec2 o = texture2D( u_noise, (p+0.5)/256.0, -100.0 ).xy;
        return o;
      }
      
      mat2 rotate2d(float _angle){
        return mat2(cos(_angle),sin(_angle),
                    -sin(_angle),cos(_angle));
      }
      
      vec3 hsb2rgb( in vec3 c ){
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                 6.0)-3.0)-1.0,
                         0.0,
                         1.0 );
        rgb = rgb*rgb*(3.0-2.0*rgb);
        return c.z * mix( vec3(1.0), rgb, c.y);
      }
      
      float hash(vec2 p) {
        float o = texture2D( u_noise, (p+0.5)/256.0, -100.0 ).x;
        return o;
      }

      float noise(vec2 uv) {
        vec2 id = floor(uv);
        vec2 subuv = fract(uv);
        vec2 u = subuv * subuv * (3. - 2. * subuv);
        float a = hash(id);
        float b = hash(id + vec2(1., 0.));
        float c = hash(id + vec2(0., 1.));
        float d = hash(id + vec2(1., 1.));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(in vec2 uv) {
        float s = .0;
        float m = .0;
        float a = .5;
        for(int i = 0; i < octaves; i++) {
          s += a * noise(uv);
          m += a;
          a *= .5;
          uv *= 2.;
        }
        return s / m;
      }
      
      vec3 domain(vec2 z){
        return vec3(hsb2rgb(vec3(atan(z.y,z.x)/TAU,1.,1.)));
      }

      vec3 colour(vec2 z) {
        return domain(z);
      }
      
      vec3 render(vec2 uv, float scale, vec3 colour) {
        vec2 id = floor(uv);
        vec2 subuv = fract(uv);
        vec2 rand = hash2(id);
        float bokeh = abs(scale) * 1.;
        
        float particle = 0.;
        
        if(length(rand) > 1.3) {
          vec2 pos = subuv-.5;
          float field = length(pos);
          particle = smoothstep(.3, 0., field);
          particle += smoothstep(.4 * bokeh, 0.34 * bokeh, field);
        }
        return vec3(particle*2.);
      }
      
      vec3 renderLayer(int layer, int layers, vec2 uv, inout float opacity, vec3 colour, float n) {
        vec2 _uv = uv;
        float scale = mod((u_time + zoomSpeed / float(layers) * float(layer)) / zoomSpeed, -1.);
        uv *= 20.; 
        uv *= scale*scale; 
        uv = rotate2d(u_time / 10.) * uv; 
        uv += vec2(25. + sin(u_time*.1)) * float(layer); 

        vec3 pass = render(uv * multiplier, scale, colour) * .2; 

        opacity = 1. + scale;
        float _opacity = opacity;
        
        float endOpacity = smoothstep(0., 0.4, scale * -1.);
        opacity += endOpacity;

        return pass * _opacity * endOpacity;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy);

        if(u_resolution.y < u_resolution.x) {
          uv /= u_resolution.y;
        } else {
          uv /= u_resolution.x;
        }

        float n = fbm((uv + vec2(sin(u_time*.1), u_time*.1)) * 2. - 2.);

        vec3 colour = vec3(0.);
        colour = n * mix(vec3(0., .5, 1.5)*-1.5, clamp(vec3(1., .5, .25)*2., 0., 1.), n);

        float opacity = 1.;
        float opacity_sum = 1.;

        for(int i = 1; i <= layers; i++) {
          colour -= renderLayer(i, layers, uv, opacity, colour, n);
          opacity_sum += opacity;
        }

        colour /= opacity_sum;

        gl_FragColor = vec4(clamp(colour * 20., 0., 1.), 1.0);
      }
    `;

    // ─── ThreeJS Bootstrap ───────────────────────────────────────────────────
    const initThree = (loadedTexture) => {
      const container = containerRef.current;
      if (!container) return;

      camera = new THREE.Camera();
      camera.position.z = 1;

      scene = new THREE.Scene();
      const geometry = new THREE.PlaneGeometry(2, 2);

      uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_noise: { type: "t", value: loadedTexture },
        u_mouse: { type: "v2", value: new THREE.Vector2() },
      };

      material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });
      material.extensions.derivatives = true;

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);

      // Sync initial sizes
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.u_resolution.value.x = renderer.domElement.width;
      uniforms.u_resolution.value.y = renderer.domElement.height;

      container.appendChild(renderer.domElement);
    };

    // Load External Scripts dynamically via Promise
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (window.THREE) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    )
      .then(() => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(
          noiseTextureUrl,
          (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.LinearFilter;

            initThree(tex);

            // Start Loop
            const animate = (timestamp) => {
              animationFrameId = requestAnimationFrame(animate);
              if (uniforms.u_time && renderer && scene && camera) {
                uniforms.u_time.value = timeOffset + timestamp * timeScale;
                renderer.render(scene, camera);
              }
            };
            animationFrameId = requestAnimationFrame(animate);
          },
          undefined,
          (err) => console.error("Error loading texture:", err),
        );
      })
      .catch((err) => console.error("Failed to load ThreeJS script:", err));

    // Listeners
    const handleResize = () => {
      if (!renderer || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.x = renderer.domElement.width;
      uniforms.u_resolution.value.y = renderer.domElement.height;
    };

    const handleMouseMove = (e) => {
      if (!uniforms.u_mouse) return;
      const container = containerRef.current;
      if (!container) return;
      const ratio = container.clientHeight / container.clientWidth;
      uniforms.u_mouse.value.x =
        (e.clientX - container.clientWidth / 2) / container.clientWidth / ratio;
      uniforms.u_mouse.value.y =
        ((e.clientY - container.clientHeight / 2) / container.clientHeight) *
        -1;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handleMouseMove);

    // Clean up on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handleMouseMove);

      if (renderer && renderer.domElement) {
        containerRef.current?.removeChild(renderer.domElement);
        renderer.dispose();
      }
      if (material) material.dispose();
    };
  }, [
    mounted,
    multiplier,
    zoomSpeed,
    initialLayers,
    initialOctaves,
    timeScale,
    timeOffset,
    noiseTextureUrl,
  ]);

  return (
    <div
      ref={containerRef}
      className={`${width} ${height} relative overflow-hidden select-none bg-black touch-none [&>canvas]:w-full [&>canvas]:h-full`}
    />
  );
}
