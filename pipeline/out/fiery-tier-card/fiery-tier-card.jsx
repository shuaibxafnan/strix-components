"use client";

import { useEffect, useRef } from "react";

const DEFAULT_FEATURES = [
  "Hyper-Dimensional Storage",
  "Quantum Entangled Support",
  "Nebula Streaming (4K)",
  "Celestial Analytics Suite",
  "Zero-G Feature Previews",
];

export default function FieryTierCard({
  title = "Nova Tier Access",
  currency = "$",
  price = "39",
  priceDecimal = "99",
  period = "/cycle",
  description = "Ignite your potential with the Nova Tier. Experience unparalleled access and cosmic-grade features.",
  features = DEFAULT_FEATURES,
  buttonText = "Ascend to Nova",
  cardBg = "rgba(100, 50, 20, 0.70)",
  accentColor = "#FDBA74",
  textColor = "#E5E7EB",
  titleColor = "#F9FAFB",
  descColor = "#B0B6BF",
  featureColor = "#D1D5DB",
  className = "",
  buttonBg = "rgba(255, 150, 80, 0.25)",
  buttonBorder = "rgba(255, 190, 120, 0.3)",
  fireHue = 0.07,
  tiltMax = 10,
  tiltSpeed = 400,
  tiltGlare = true,
  tiltMaxGlare = 0.2,
  ringGap = 10,
  ringThickness = 20,
  cornerRadius = 24,
}) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const threeRef = useRef({});

  useEffect(() => {
    let cleanupResize = () => {};
    let rafId = null;
    let cancelled = false;

    Promise.all([import("three"), import("vanilla-tilt")])
      .then(([THREE, tiltModule]) => {
        const VanillaTilt = tiltModule.default || tiltModule.VanillaTilt;
        if (cancelled || !canvasRef.current || !containerRef.current) return;

        const bandVertexShader = `
          uniform float time;
          varying vec2 vUv;
          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }
          void main() {
            vUv = uv;
            vec3 newPosition = position;
            float distortionAmount = 0.02;
            float distortion = noise(vec2(position.x * 0.05 + time * 0.1, position.y * 0.05 - time * 0.15)) * distortionAmount;
            vec2 normalizedPos = normalize(position.xy);
            newPosition.x += normalizedPos.x * distortion;
            newPosition.y += normalizedPos.y * distortion;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `;

        const fieryBandFragmentShader = `
          uniform float time;
          uniform vec3 fireColorBase;
          varying vec2 vUv;

          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }
          float turbulence(vec2 st, float baseFreq, int octaves) {
            float value = 0.0;
            float amplitude = 1.0;
            float frequency = baseFreq;
            for (int i = 0; i < octaves; i++) {
              value += amplitude * abs(noise(st * frequency));
              st = st * 1.4 + vec2(3.2, 1.7);
              frequency *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }

          void main() {
            float mediumTime = time * 0.8;
            float fastTime = time * 1.6;

            vec2 centeredUv = vUv - vec2(0.5);
            float angle = atan(centeredUv.y, centeredUv.x);
            float normalizedAngle = (angle / (2.0 * 3.14159)) + 0.5;

            float flowSpeed = 2.0;
            float flowFrequency = 3.0;
            float baseFlow = sin(normalizedAngle * flowFrequency * 6.28318 + mediumTime * flowSpeed);
            baseFlow = baseFlow * 0.5 + 0.5;

            vec2 noiseCoord1 = vec2(normalizedAngle * 8.0 + mediumTime * 0.3, vUv.y * 4.0 - mediumTime * 0.4);
            float fireDetail1 = turbulence(noiseCoord1, 1.0, 4);

            vec2 noiseCoord2 = vec2(normalizedAngle * 6.0 - mediumTime * 0.5, vUv.y * 3.0 + mediumTime * 0.3);
            float fireDetail2 = turbulence(noiseCoord2, 1.5, 3);

            vec2 emberCoord = vec2(normalizedAngle * 10.0, mod(vUv.y * 3.0 - fastTime * 0.5, 3.0));
            float embers = noise(emberCoord * 8.0);
            embers = pow(embers, 3.0) * smoothstep(0.4, 0.6, vUv.y);

            float widthModulation = 1.0 - pow(abs(vUv.y - 0.5) * 1.8, 2.0);
            widthModulation = clamp(widthModulation, 0.3, 1.0);

            float mainFlicker = 0.92 + 0.08 * sin(fastTime * 7.7);
            float microFlicker = 0.95 + 0.05 * sin(fastTime * 30.0) * sin(fastTime * 17.3);
            float combinedFlicker = mainFlicker * microFlicker;

            float fireDetail = fireDetail1 * 0.6 + fireDetail2 * 0.4;
            fireDetail = pow(fireDetail, 1.2);

            float baseIntensity = 0.7 + 0.3 * baseFlow;
            float turbulentIntensity = baseIntensity * fireDetail * widthModulation * combinedFlicker;

            float fineDetail = noise(noiseCoord1 * 3.0 + fastTime * 0.1) * 0.2;
            turbulentIntensity += fineDetail * widthModulation;
            turbulentIntensity += embers * 0.2;

            float finalIntensity = smoothstep(0.1, 0.9, turbulentIntensity);

            vec3 deepRed = vec3(0.7, 0.05, 0.01);
            vec3 midOrange = fireColorBase;
            vec3 brightYellow = vec3(1.0, 0.9, 0.3);
            vec3 hotWhite = vec3(1.0, 1.0, 0.95);

            vec3 finalColor;
            if (finalIntensity < 0.3) {
              float t = finalIntensity / 0.3;
              finalColor = mix(deepRed, midOrange, t);
            } else if (finalIntensity < 0.7) {
              float t = (finalIntensity - 0.3) / 0.4;
              finalColor = mix(midOrange, brightYellow, t);
            } else {
              float t = (finalIntensity - 0.7) / 0.3;
              finalColor = mix(brightYellow, hotWhite, t);
            }

            float blueHint = pow(finalIntensity, 5.0) * 0.1;
            finalColor = mix(finalColor, vec3(0.7, 0.8, 1.0), blueHint);

            float alpha = clamp(finalIntensity * 2.0, 0.0, 1.0);
            gl_FragColor = vec4(finalColor, alpha);
          }
        `;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
          -1000,
          1000,
          1000,
          -1000,
          0.1,
          2000,
        );
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(800, 800);

        const uniforms = {
          time: { value: 0.0 },
          fireColorBase: { value: new THREE.Color(0xff6600) },
        };

        const material = new THREE.ShaderMaterial({
          vertexShader: bandVertexShader,
          fragmentShader: fieryBandFragmentShader,
          uniforms,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide,
        });

        const placeholderGeometry = new THREE.PlaneGeometry(50, 50);
        const fieryBandMesh = new THREE.Mesh(placeholderGeometry, material);
        scene.add(fieryBandMesh);

        function createRingGeometry() {
          const cardRect = containerRef.current.getBoundingClientRect();
          const cardWidth = cardRect.width;
          const cardHeight = cardRect.height;
          if (cardWidth === 0 || cardHeight === 0) return;

          const gap = ringGap;
          const thickness = ringThickness;
          const radius = cornerRadius;

          const outerWidth = cardWidth + 2 * (gap + thickness);
          const outerHeight = cardHeight + 2 * (gap + thickness);
          const outerRadius = radius + gap + thickness;

          const innerWidth = cardWidth + 2 * gap;
          const innerHeight = cardHeight + 2 * gap;
          const innerRadius = radius + gap;

          const canvasPadding = 40;
          const canvasWidth = outerWidth + canvasPadding;
          const canvasHeight = outerHeight + canvasPadding;

          renderer.setSize(canvasWidth, canvasHeight);

          camera.left = -canvasWidth / 2;
          camera.right = canvasWidth / 2;
          camera.top = canvasHeight / 2;
          camera.bottom = -canvasHeight / 2;
          camera.updateProjectionMatrix();

          if (fieryBandMesh.geometry) fieryBandMesh.geometry.dispose();

          const outerShape = new THREE.Shape();
          outerShape.moveTo(-outerWidth / 2 + outerRadius, -outerHeight / 2);
          outerShape.lineTo(outerWidth / 2 - outerRadius, -outerHeight / 2);
          outerShape.quadraticCurveTo(
            outerWidth / 2,
            -outerHeight / 2,
            outerWidth / 2,
            -outerHeight / 2 + outerRadius,
          );
          outerShape.lineTo(outerWidth / 2, outerHeight / 2 - outerRadius);
          outerShape.quadraticCurveTo(
            outerWidth / 2,
            outerHeight / 2,
            outerWidth / 2 - outerRadius,
            outerHeight / 2,
          );
          outerShape.lineTo(-outerWidth / 2 + outerRadius, outerHeight / 2);
          outerShape.quadraticCurveTo(
            -outerWidth / 2,
            outerHeight / 2,
            -outerWidth / 2,
            outerHeight / 2 - outerRadius,
          );
          outerShape.lineTo(-outerWidth / 2, -outerHeight / 2 + outerRadius);
          outerShape.quadraticCurveTo(
            -outerWidth / 2,
            -outerHeight / 2,
            -outerWidth / 2 + outerRadius,
            -outerHeight / 2,
          );

          const innerShapePath = new THREE.Path();
          innerShapePath.moveTo(
            -innerWidth / 2 + innerRadius,
            -innerHeight / 2,
          );
          innerShapePath.lineTo(innerWidth / 2 - innerRadius, -innerHeight / 2);
          innerShapePath.quadraticCurveTo(
            innerWidth / 2,
            -innerHeight / 2,
            innerWidth / 2,
            -innerHeight / 2 + innerRadius,
          );
          innerShapePath.lineTo(innerWidth / 2, innerHeight / 2 - innerRadius);
          innerShapePath.quadraticCurveTo(
            innerWidth / 2,
            innerHeight / 2,
            innerWidth / 2 - innerRadius,
            innerHeight / 2,
          );
          innerShapePath.lineTo(-innerWidth / 2 + innerRadius, innerHeight / 2);
          innerShapePath.quadraticCurveTo(
            -innerWidth / 2,
            innerHeight / 2,
            -innerWidth / 2,
            innerHeight / 2 - innerRadius,
          );
          innerShapePath.lineTo(
            -innerWidth / 2,
            -innerHeight / 2 + innerRadius,
          );
          innerShapePath.quadraticCurveTo(
            -innerWidth / 2,
            -innerHeight / 2,
            -innerWidth / 2 + innerRadius,
            -innerHeight / 2,
          );

          outerShape.holes.push(innerShapePath);

          fieryBandMesh.geometry = new THREE.ShapeGeometry(outerShape, 48);
          fieryBandMesh.position.set(0, 0, 0);
        }

        createRingGeometry();

        function animate() {
          rafId = requestAnimationFrame(animate);
          uniforms.time.value += 0.016;
          const time = uniforms.time.value;
          const hueShift = Math.sin(time * 0.1) * 0.05;
          const baseColor = new THREE.Color();
          baseColor.setHSL(fireHue + hueShift, 0.9, 0.55);
          uniforms.fireColorBase.value.copy(baseColor);
          renderer.render(scene, camera);
        }
        animate();

        let resizeTimeout;
        const onResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(createRingGeometry, 150);
        };
        window.addEventListener("resize", onResize);
        cleanupResize = () => window.removeEventListener("resize", onResize);

        if (VanillaTilt && cardRef.current) {
          VanillaTilt.init(cardRef.current, {
            max: tiltMax,
            speed: tiltSpeed,
            glare: tiltGlare,
            "max-glare": tiltMaxGlare,
          });
        }

        threeRef.current = { renderer, scene, camera, fieryBandMesh };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanupResize();
      if (rafId) cancelAnimationFrame(rafId);
      const { renderer } = threeRef.current;
      if (renderer) renderer.dispose();
      if (cardRef.current && cardRef.current.vanillaTilt) {
        cardRef.current.vanillaTilt.destroy();
      }
    };
  }, [
    fireHue,
    tiltMax,
    tiltSpeed,
    tiltGlare,
    tiltMaxGlare,
    ringGap,
    ringThickness,
    cornerRadius,
  ]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        className="relative w-[360px] max-w-[90%] [transform-style:preserve-3d] [perspective:1000px]"
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        />

        <div
          ref={cardRef}
          className="relative z-[1] overflow-hidden rounded-[28px] p-6 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] [transform-style:preserve-3d]"
          style={{
            backgroundColor: cardBg,
            color: textColor,
            boxShadow:
              "0 12px 35px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,190,120,0.20) inset",
          }}
        >
          <h2
            className="mb-2 text-[1.375rem] font-bold [transform:translateZ(20px)]"
            style={{ color: titleColor }}
          >
            {title}
          </h2>

          <p className="mb-1.5 text-[3.25rem] font-extrabold text-white [transform:translateZ(20px)]">
            <span
              className="mr-1 align-super text-[1.875rem] font-medium"
              style={{ color: accentColor }}
            >
              {currency}
            </span>
            {price}
            <span className="align-baseline text-3xl">.{priceDecimal}</span>
            <span
              className="ml-1 text-[1.05rem] font-medium"
              style={{ color: "#D1D5DB" }}
            >
              {period}
            </span>
          </p>

          <p
            className="mb-5 text-[0.925rem] leading-relaxed [transform:translateZ(20px)]"
            style={{ color: descColor }}
          >
            {description}
          </p>

          <ul className="mb-6 list-none p-0 [transform:translateZ(20px)]">
            {features.map((feature, i) => (
              <li
                key={i}
                className="mb-3 flex items-center text-[0.9rem]"
                style={{ color: featureColor }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mr-3 h-5 w-5 animate-[spin_3s_linear_infinite]"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke={accentColor}
                    strokeWidth="2"
                    strokeDasharray="10 5"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="w-full rounded-[20px] border py-3.5 text-base font-semibold uppercase tracking-wide text-white transition-all duration-300 [transform:translateZ(20px)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
            style={{
              backgroundColor: buttonBg,
              borderColor: buttonBorder,
              boxShadow: "0 5px 15px rgba(255,100,0,0.25)",
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
