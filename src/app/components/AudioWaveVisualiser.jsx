"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Boldonse, Bodoni_Moda } from "next/font/google";

const primary = Boldonse({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-primary",
});

const secondary = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-secondary",
});

const COLOR_PRESETS = {
  Default: {
    bgColorDown: [51, 25, 25],
    bgColorUp: [25, 25, 51],
    color1In: [255, 128, 0],
    color1Out: [255, 0, 0],
    color2In: [0, 128, 255],
    color2Out: [0, 0, 255],
    color3In: [0, 255, 128],
    color3Out: [0, 200, 100],
  },
  Neon: {
    bgColorDown: [10, 10, 20],
    bgColorUp: [5, 5, 15],
    color1In: [255, 0, 255],
    color1Out: [128, 0, 255],
    color2In: [0, 255, 255],
    color2Out: [0, 128, 255],
    color3In: [255, 255, 0],
    color3Out: [255, 128, 0],
  },
  Warm: {
    bgColorDown: [40, 20, 10],
    bgColorUp: [20, 10, 5],
    color1In: [255, 200, 0],
    color1Out: [255, 100, 0],
    color2In: [255, 100, 100],
    color2Out: [200, 50, 50],
    color3In: [255, 150, 50],
    color3Out: [200, 100, 0],
  },
  Cool: {
    bgColorDown: [10, 20, 30],
    bgColorUp: [5, 10, 20],
    color1In: [100, 200, 255],
    color1Out: [0, 100, 200],
    color2In: [100, 255, 200],
    color2Out: [0, 150, 100],
    color3In: [150, 200, 255],
    color3Out: [50, 100, 200],
  },
  Monochrome: {
    bgColorDown: [10, 10, 10],
    bgColorUp: [20, 20, 20],
    color1In: [200, 200, 200],
    color1Out: [150, 150, 150],
    color2In: [255, 255, 255],
    color2Out: [100, 100, 100],
    color3In: [180, 180, 180],
    color3Out: [120, 120, 120],
  },
  Cyberpunk: {
    bgColorDown: [20, 0, 40],
    bgColorUp: [0, 20, 40],
    color1In: [255, 0, 128],
    color1Out: [200, 0, 100],
    color2In: [0, 255, 128],
    color2Out: [0, 200, 100],
    color3In: [255, 255, 0],
    color3Out: [200, 200, 0],
  },
};

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float lowFreq;
uniform float midFreq;
uniform float highFreq;
uniform float transitionFactor;
uniform float lineStraightness;
uniform float idleAnimation;
uniform float idleWaveHeight;
uniform float kickEnergy;
uniform float beatPhase;
uniform float bounceEffect;
uniform float baseSpeed;
uniform float idleSpeed;
uniform float bassReactivity;
uniform float midReactivity;
uniform float highReactivity;
uniform float kickReactivity;
uniform float bounceIntensity;
uniform float waveIntensity;
uniform float waveComplexity;
uniform float rippleIntensity;
uniform float lineThickness;
uniform bool enableGrain;
uniform float grainIntensity;
uniform float grainSpeed;
uniform vec3 bgColorDown;
uniform vec3 bgColorUp;
uniform vec3 color1In;
uniform vec3 color1Out;
uniform vec3 color2In;
uniform vec3 color2Out;
uniform vec3 color3In;
uniform vec3 color3Out;
varying vec2 vUv;

float squared(float v) { return v * v; }

float smootherstep(float e0, float e1, float x) {
  float t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float gaussian(float z, float u, float o) {
  return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z-u)*(z-u))/(2.0*(o*o))));
}

float kickRipple(vec2 uv, float energy, float t) {
  float dist = distance(uv, vec2(0.5, 0.5));
  float width = 0.05;
  float speed = 1.2;
  float r1 = smootherstep(energy*speed*t - width, energy*speed*t, dist)
            * smootherstep(dist, dist + width, energy*speed*t + width);
  float r2 = smootherstep(energy*speed*(t-0.2)-width, energy*speed*(t-0.2), dist)
            * smootherstep(dist, dist+width, energy*speed*(t-0.2)+width);
  return (r1 + r2 * 0.5) * energy * 0.7;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = fragCoord.xy / iResolution.xy;
  vec3 bgCol = mix(bgColorDown, bgColorUp, clamp(p.y * 2.0, 0.0, 1.0));

  float speed = mix(idleSpeed, baseSpeed, transitionFactor);
  float ballVisibility = mix(0.8, 0.2, transitionFactor);
  float straightnessFactor = mix(1.0, lineStraightness, transitionFactor);
  float idleWave = idleWaveHeight * sin(p.x * 5.0 + idleAnimation * 0.2);

  float bassPulse = squared(lowFreq) * bassReactivity * transitionFactor;
  float midPulse = squared(midFreq) * midReactivity * transitionFactor;
  float highPulse = squared(highFreq) * highReactivity * transitionFactor;
  float kickPulse = squared(kickEnergy) * kickReactivity * 1.5 * transitionFactor;
  float bounce = bounceEffect * bounceIntensity * transitionFactor;

  float curveIntensity = mix(idleWaveHeight, 0.05 + waveIntensity * (bassPulse + kickPulse * 0.7), transitionFactor);
  float curve = curveIntensity * sin((6.25 * p.x) + (speed * iTime));
  float ripple = rippleIntensity * kickRipple(p, kickEnergy, mod(iTime, 10.0)) * transitionFactor;

  float audioWave = mix(0.0,
    (0.1 * sin(p.x * 20.0 * waveComplexity) * bassPulse +
     0.08 * sin(p.x * 30.0 * waveComplexity) * midPulse +
     0.05 * sin(p.x * 50.0 * waveComplexity) * highPulse) / straightnessFactor,
    transitionFactor);

  float lineAFreq = 40.0 * waveComplexity + 80.0 * bassPulse + 90.0 * kickPulse;
  float lineASpeed = 1.5 * speed + 6.0 * bassPulse + 6.0 * kickPulse;
  float lineAWave = mix(idleWave, (0.01 + 0.05 * bassPulse + 0.1 * kickPulse) / straightnessFactor, transitionFactor);
  float kickWaveEffect = kickEnergy > 0.1 ? kickEnergy * 0.3 * sin(15.0 * (p.x - iTime * 0.5)) * transitionFactor : 0.0;
  float lineAOffset = bassPulse * 0.3 * sin(p.x * 10.0 - iTime * 2.0) + kickWaveEffect * 0.7;
  float lineAAnim = mix(0.5 + idleWave, 0.5 + curve + audioWave + lineAWave * sin((lineAFreq * p.x) + (-lineASpeed * iTime)) + lineAOffset - bounce, transitionFactor);
  float lineAThickness = lineThickness * (1.0 + bassPulse * 0.4 + kickPulse * 0.8);
  float lineAShape = smootherstep(1.0 - clamp(distance(p.y, lineAAnim) * (2.0 / lineAThickness), 0.0, 1.0), 1.0, 0.99);
  vec3 kickColor = vec3(1.0, 0.7, 0.3);
  vec3 eC1In = mix(color1In, kickColor, kickEnergy * 0.6 * transitionFactor);
  vec3 eC1Out = mix(color1Out, vec3(1.0, 0.5, 0.0), kickEnergy * 0.4 * transitionFactor);
  vec3 lineACol = (1.0 - lineAShape) * mix(eC1In, eC1Out, lineAShape);
  float ballASize = 0.5 + 0.4 * bassPulse + kickEnergy * 1.2 * transitionFactor;
  float ballAX = 0.2 + 0.1 * sin(iTime * 0.2 * speed) * midPulse;
  float ballAShape = smootherstep(1.0 - clamp(distance(p, vec2(ballAX, lineAAnim)) * ballASize, 0.0, 1.0), 1.0, 0.99);
  vec3 ballACol = (1.0 - ballAShape) * mix(eC1In, eC1Out, ballAShape) * mix(1.0, ballVisibility, transitionFactor);

  float lineBFreq = 50.0 * waveComplexity + 100.0 * midPulse;
  float lineBSpeed = 2.0 * speed + 8.0 * midPulse;
  float lineBWave = mix(idleWave * 0.8, (0.01 + 0.05 * midPulse) / straightnessFactor, transitionFactor);
  float lineBOffset = midPulse * 0.2 * sin(p.x * 15.0 - iTime * 1.5) + kickEnergy * 0.1 * sin(p.x * 25.0 - iTime * 3.0) * transitionFactor;
  float lineBAnim = mix(0.5 + idleWave * 0.8, 0.5 + curve - audioWave + lineBWave * sin((lineBFreq * p.x) + (lineBSpeed * iTime)) * sin(lineBSpeed * iTime) + lineBOffset - bounce * 0.5, transitionFactor);
  float lineBThickness = lineThickness * (1.0 + midPulse * 0.3 + kickEnergy * 0.3 * transitionFactor);
  float lineBShape = smootherstep(1.0 - clamp(distance(p.y, lineBAnim) * (2.0 / lineBThickness), 0.0, 1.0), 1.0, 0.99);
  vec3 eC2In = mix(color2In, vec3(1.0, 0.5, 0.5), kickEnergy * 0.3 * transitionFactor);
  vec3 lineBCol = (1.0 - lineBShape) * mix(eC2In, color2Out, lineBShape);
  float ballBSize = 0.5 + 0.4 * highPulse + kickEnergy * 0.3 * transitionFactor;
  float ballBX = 0.8 - 0.1 * sin(iTime * 0.3 * speed) * midPulse;
  float ballBShape = smootherstep(1.0 - clamp(distance(p, vec2(ballBX, lineBAnim)) * ballBSize, 0.0, 1.0), 1.0, 0.99);
  vec3 ballBCol = (1.0 - ballBShape) * mix(eC2In, color2Out, ballBShape) * mix(1.0, ballVisibility, transitionFactor);

  float lineCFreq = 60.0 * waveComplexity + 120.0 * highPulse;
  float lineCSpeed = 2.5 * speed + 10.0 * highPulse;
  float lineCWave = mix(idleWave * 1.2, (0.01 + 0.05 * highPulse) / straightnessFactor, transitionFactor);
  float lineCOffset = highPulse * 0.15 * sin(p.x * 20.0 - iTime * 1.0);
  float lineCAnim = mix(0.5 + idleWave * 1.2, 0.5 + curve * 0.7 - audioWave * 0.5 + lineCWave * sin((lineCFreq * p.x) + (lineCSpeed * iTime)) * sin(lineCSpeed * (iTime + 0.1)) + lineCOffset - bounce * 0.3, transitionFactor);
  float lineCThickness = lineThickness * (1.0 + highPulse * 0.2 + kickEnergy * 0.1 * transitionFactor);
  float lineCShape = smootherstep(1.0 - clamp(distance(p.y, lineCAnim) * (2.0 / lineCThickness), 0.0, 1.0), 1.0, 0.99);
  vec3 lineCCol = (1.0 - lineCShape) * mix(color3In, color3Out, lineCShape);
  float ballCSize = 0.5 + 0.4 * highPulse + kickEnergy * 0.1 * transitionFactor;
  float ballCX = 0.5 + 0.15 * sin(iTime * 0.4 * speed) * highPulse;
  float ballCShape = smootherstep(1.0 - clamp(distance(p, vec2(ballCX, lineCAnim)) * ballCSize, 0.0, 1.0), 1.0, 0.99);
  vec3 ballCCol = (1.0 - ballCShape) * mix(color3In, color3Out, ballCShape) * mix(1.0, ballVisibility, transitionFactor);

  bgCol = mix(bgCol, mix(bgCol, vec3(1.0), 0.2), kickEnergy * 0.4 * transitionFactor);
  vec3 rippleCol = vec3(1.0, 0.8, 0.4) * ripple * transitionFactor;
  vec3 fcolor = bgCol + lineACol + lineBCol + lineCCol + ballACol + ballBCol + ballCCol + rippleCol;

  if (enableGrain) {
    float t = iTime * grainSpeed;
    float seed = dot(p, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + t);
    noise = gaussian(noise, 0.0, 0.25);
    fcolor += vec3(noise) * (1.0 - fcolor) * grainIntensity;
  }

  fragColor = vec4(fcolor, 1.0);
}

void main() {
  vec4 fragColor;
  mainImage(fragColor, vUv * iResolution);
  gl_FragColor = fragColor;
}
`;

const toVector = (rgb) => new THREE.Vector3(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);

const BANDS = [
  [1, 4],
  [4, 9],
  [9, 20],
  [20, 40],
  [40, 80],
  [80, 160],
  [160, 300],
  [300, 500],
];

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

export default function AudioWaveVisualizer({
  caption = "Find beauty in the space between sound",
  quote = "The art of listening",
  subtitle = "When you learn to see the invisible, you create the impossible",
  audioSrc = "https://upload.wikimedia.org/wikipedia/commons/6/61/Happy_Happy_HardPopCoreTastic.ogg",
  playLabel = "Play",
  pauseLabel = "Pause",
  colorPreset = "Warm",
  showCursor = true,
  baseSpeed = 1.0,
  idleSpeed = 0.1,
  bassReactivity = 0.4,
  midReactivity = 0.5,
  highReactivity = 0.4,
  kickReactivity = 0.6,
  bounceIntensity = 0.15,
  waveIntensity = 0.08,
  waveComplexity = 2.2,
  rippleIntensity = 0.25,
  lineThickness = 1.8,
  lineStraightness = 2.53,
  idleWaveHeight = 0.01,
  enableGrain = true,
  grainIntensity = 0.075,
  className = "",
}) {
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const engineRef = useRef(null);
  const materialRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const preset = COLOR_PRESETS[colorPreset] || COLOR_PRESETS.Warm;
    const size = () => ({ w: container.clientWidth, h: container.clientHeight });
    const { w, h } = size();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        iResolution: { value: new THREE.Vector2(w, h) },
        iTime: { value: 0 },
        lowFreq: { value: 0 },
        midFreq: { value: 0 },
        highFreq: { value: 0 },
        transitionFactor: { value: 0 },
        lineStraightness: { value: lineStraightness },
        idleAnimation: { value: 0 },
        idleWaveHeight: { value: idleWaveHeight },
        kickEnergy: { value: 0 },
        beatPhase: { value: 0 },
        bounceEffect: { value: 0 },
        baseSpeed: { value: baseSpeed },
        idleSpeed: { value: idleSpeed },
        bassReactivity: { value: bassReactivity },
        midReactivity: { value: midReactivity },
        highReactivity: { value: highReactivity },
        kickReactivity: { value: kickReactivity },
        bounceIntensity: { value: bounceIntensity },
        waveIntensity: { value: waveIntensity },
        waveComplexity: { value: waveComplexity },
        rippleIntensity: { value: rippleIntensity },
        lineThickness: { value: lineThickness },
        enableGrain: { value: enableGrain },
        grainIntensity: { value: grainIntensity },
        grainSpeed: { value: 2.0 },
        bgColorDown: { value: toVector(preset.bgColorDown) },
        bgColorUp: { value: toVector(preset.bgColorUp) },
        color1In: { value: toVector(preset.color1In) },
        color1Out: { value: toVector(preset.color1Out) },
        color2In: { value: toVector(preset.color2In) },
        color2Out: { value: toVector(preset.color2Out) },
        color3In: { value: toVector(preset.color3In) },
        color3Out: { value: toVector(preset.color3Out) },
      },
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = audioSrc;
    audio.loop = true;

    const u = material.uniforms;
    const audioState = { context: null, analyser: null, data: null };
    const energies = Array(BANDS.length).fill(0);
    const histories = Array.from({ length: BANDS.length }, () => []);
    const kick = {
      detected: false,
      energy: 0,
      impact: 0,
      lastTime: 0,
      interval: 0,
      beatTime: 0,
    };
    const freq = { low: 0, mid: 0, high: 0 };
    let isPlaying = false;
    let transition = 0;
    let time = 0;
    let idle = 0;
    let rafId = 0;

    const analyse = () => {
      const { analyser, data } = audioState;
      analyser.getByteFrequencyData(data);

      BANDS.forEach(([from, to], i) => {
        const slice = data.slice(from, to);
        let sum = 0;
        let max = 0;
        for (let j = 0; j < slice.length; j++) {
          const v = slice[j] / 255;
          max = Math.max(max, v);
          sum += Math.pow(v, 1.5);
        }
        energies[i] = (sum / slice.length) * 0.7 + max * 0.3;
        histories[i].unshift(energies[i]);
        if (histories[i].length > 4) histories[i].pop();
      });

      const kickAvg = energies[1];
      const recent = histories[1].slice(1);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / Math.max(recent.length, 1);
      const now = performance.now();
      const isKick =
        kickAvg - recentAvg > 0.06 &&
        kickAvg > 0.15 &&
        (!kick.detected || now - kick.lastTime > 150);

      if (isKick) {
        kick.detected = true;
        kick.energy = Math.min(1, kickAvg * 2.0);
        kick.impact = 10;
        if (kick.lastTime > 0) {
          const gap = now - kick.lastTime;
          if (gap > 200 && gap < 2000) kick.interval = kick.interval * 0.7 + gap * 0.3;
        }
        kick.lastTime = now;
        kick.beatTime = 0;
      } else {
        kick.energy *= 0.8;
        if (kick.energy < 0.05) kick.detected = false;
        if (kick.impact > 0) kick.impact--;
      }

      if (kick.interval > 0) {
        kick.beatTime += 16.67;
        u.beatPhase.value = (kick.beatTime % kick.interval) / kick.interval;
      }

      const bounce =
        (kick.impact > 0 ? Math.pow(kick.impact / 10, 0.6) * 0.03 : 0) +
        kick.energy * 0.025;

      const bass = (energies[1] * 1.2 + energies[2]) / 2.2;
      freq.low = bass > freq.low * 1.1 ? freq.low * 0.3 + bass * 0.7 : freq.low * 0.85 + bass * 0.15;
      const mid = (energies[3] + energies[4]) / 2;
      freq.mid = mid > freq.mid * 1.1 ? freq.mid * 0.4 + mid * 0.6 : freq.mid * 0.8 + mid * 0.2;
      const high = (energies[5] + energies[6] + energies[7]) / 3;
      freq.high = high > freq.high * 1.05 ? freq.high * 0.5 + high * 0.5 : freq.high * 0.8 + high * 0.2;
      freq.low = Math.max(freq.low, kick.energy * 0.6);

      u.lowFreq.value = freq.low;
      u.midFreq.value = freq.mid;
      u.highFreq.value = freq.high;
      u.kickEnergy.value = kick.energy;
      u.bounceEffect.value = bounce;
    };

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      time += 0.01;
      idle += 0.01;
      u.iTime.value = time;
      u.idleAnimation.value = idle;

      if (isPlaying && transition < 1) {
        transition = Math.min(transition + 0.03, 1);
        u.transitionFactor.value = transition;
      } else if (!isPlaying && transition > 0) {
        transition = Math.max(transition - 0.03, 0);
        u.transitionFactor.value = transition;
        if (transition === 0) {
          freq.low = freq.mid = freq.high = kick.energy = 0;
          u.lowFreq.value = 0;
          u.midFreq.value = 0;
          u.highFreq.value = 0;
          u.kickEnergy.value = 0;
          u.bounceEffect.value = 0;
        }
      }

      if (isPlaying && audioState.analyser) analyse();
      renderer.render(scene, camera);
    };
    loop();

    const toggle = async () => {
      if (!isPlaying) {
        if (!audioState.context) {
          const Context = window.AudioContext || window.webkitAudioContext;
          audioState.context = new Context();
          audioState.analyser = audioState.context.createAnalyser();
          audioState.analyser.fftSize = 1024;
          audioState.data = new Uint8Array(audioState.analyser.frequencyBinCount);
          const source = audioState.context.createMediaElementSource(audio);
          source.connect(audioState.analyser);
          audioState.analyser.connect(audioState.context.destination);
        }
        await audioState.context.resume();
        try {
          await audio.play();
          isPlaying = true;
          setPlaying(true);
        } catch {
          isPlaying = false;
          setPlaying(false);
        }
      } else {
        audio.pause();
        isPlaying = false;
        setPlaying(false);
      }
    };
    engineRef.current = { toggle };

    const onResize = () => {
      const next = size();
      if (!next.w || !next.h) return;
      renderer.setSize(next.w, next.h, false);
      u.iResolution.value.set(next.w, next.h);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    const onPointerMove = (e) => {
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate3d(${e.clientX - 8}px, ${e.clientY - 8}px, 0)`;
    };
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioState.context?.close();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      engineRef.current = null;
      materialRef.current = null;
      setPlaying(false);
    };
  }, [audioSrc, colorPreset]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms;
    u.baseSpeed.value = baseSpeed;
    u.idleSpeed.value = idleSpeed;
    u.bassReactivity.value = bassReactivity;
    u.midReactivity.value = midReactivity;
    u.highReactivity.value = highReactivity;
    u.kickReactivity.value = kickReactivity;
    u.bounceIntensity.value = bounceIntensity;
    u.waveIntensity.value = waveIntensity;
    u.waveComplexity.value = waveComplexity;
    u.rippleIntensity.value = rippleIntensity;
    u.lineThickness.value = lineThickness;
    u.lineStraightness.value = lineStraightness;
    u.idleWaveHeight.value = idleWaveHeight;
    u.enableGrain.value = enableGrain;
    u.grainIntensity.value = grainIntensity;
  }, [
    baseSpeed,
    idleSpeed,
    bassReactivity,
    midReactivity,
    highReactivity,
    kickReactivity,
    bounceIntensity,
    waveIntensity,
    waveComplexity,
    rippleIntensity,
    lineThickness,
    lineStraightness,
    idleWaveHeight,
    enableGrain,
    grainIntensity,
  ]);

  return (
    <div
      ref={containerRef}
      className={`${primary.variable} ${secondary.variable} relative h-screen w-full overflow-hidden bg-black tracking-[-0.03em] ${showCursor ? "cursor-none" : ""
        } ${className}`}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[2] block h-full w-full" />

      <div className="pointer-events-none absolute inset-0 z-[20] flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="m-0 mb-[3vh] max-w-xl text-[clamp(0.8rem,1.1vw,1.1rem)] italic text-white/70 [font-family:var(--font-secondary)]">
          {caption}
        </p>
        <h1 className="m-0 max-w-[92%] text-balance text-[clamp(1.75rem,6.5vw,7rem)] font-normal uppercase leading-[1.2] tracking-[-0.02em] [font-family:var(--font-primary)] [text-shadow:0_0_40px_rgba(0,0,0,0.35)]">
          {quote}
        </h1>
        <p className="m-0 mt-[4vh] max-w-2xl text-balance text-[clamp(0.85rem,1.2vw,1.2rem)] italic leading-relaxed text-white/70 [font-family:var(--font-secondary)]">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={() => engineRef.current?.toggle()}
        aria-pressed={playing}
        className={`absolute bottom-8 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm uppercase tracking-[0.2em] text-white backdrop-blur transition-colors hover:bg-white/20 ${showCursor ? "cursor-none" : "cursor-pointer"
          }`}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
        {playing ? pauseLabel : playLabel}
      </button>

      {showCursor ? (
        <div
          ref={cursorRef}
          className="pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 rounded-full bg-white/50 mix-blend-difference will-change-transform"
        />
      ) : null}
    </div>
  );
}