"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── AudioWaveVisualizer ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// caption              string   "Find beauty..."   Top caption text
// quote                string   "The art of..."    Large headline text
// author               string   "When you..."      Subtitle / author line
// musicCredit          string   "Music by KOSIKK"  Second author line
// audioSrc             string   kosikk ogg         Audio file URL
// colorPreset          string   "Warm"             One of: Default/Neon/Warm/Cool/Monochrome/Cyberpunk
// showNoise            boolean  true               Animated film-grain noise overlay
// showGrid             boolean  false              Show dat.GUI debug overlay
// showFps              boolean  true               FPS counter top-right
// showCursor           boolean  true               Custom blending cursor dot
// showProfile          boolean  true               Profile card bottom-left
// profileImage         string   filip url          Profile image src
// profileName          string   "Filip Zrnzević"   Profile display name
// profileHandle        string   "@filipz"          Twitter handle (text)
// profileUrl           string   "https://x.com/…" Twitter link href
// baseSpeed            number   1.0                Base animation speed
// idleSpeed            number   0.1                Speed when music is paused
// bassReactivity       number   0.4                Bass frequency response
// midReactivity        number   0.5                Mid frequency response
// highReactivity       number   0.4                High frequency response
// kickReactivity       number   0.6                Kick drum response multiplier
// bounceIntensity      number   0.15               Vertical bounce on kicks
// waveIntensity        number   0.08               Horizontal wave amplitude
// waveComplexity       number   2.2                Wave frequency multiplier
// rippleIntensity      number   0.25               Circular ripple strength
// lineThickness        number   1.8                Line render thickness
// lineStraightness     number   2.53               Lines flatten when music plays
// idleWaveHeight       number   0.01               Idle wave amplitude
// enableGrain          boolean  true               Film grain toggle
// grainIntensity       number   0.075              Grain strength
// primaryFont          string   "Boldonse"         Google Font for the quote
// secondaryFont        string   "Bodoni Moda"      Google Font for author/caption
// quoteSize            string   "8vw"              CSS font-size for quote
// metaSize             string   "1vw"              CSS font-size for author/caption
// ──────────────────────────────────────────────────────────────────────────

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

  // Line A (Bass/Kick)
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

  // Line B (Mid)
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

  // Line C (High)
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

  // Grain
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

function v3(arr, THREE) {
  return new THREE.Vector3(arr[0] / 255, arr[1] / 255, arr[2] / 255);
}

export default function AudioWaveVisualizer({
  caption = "Find beauty in the space between sound",
  quote = "The art of listening",
  author = "When you learn to see the invisible, you create the impossible",
  musicCredit = "Music by KOSIKK",
  audioSrc = "https://assets.codepen.io/7558/kosikk-slow-motion.ogg",
  colorPreset = "Warm",
  showNoise = true,
  showFps = true,
  showCursor = true,
  showProfile = true,
  profileImage = "https://filip-zrnzevic-portfolio-2025-v3.vercel.app/_next/image?url=%2Fimages%2Fprofile003.jpg&w=48&q=75",
  profileName = "Filip Zrnzević",
  profileHandle = "@filipz",
  profileUrl = "https://x.com/filipz",
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
  primaryFont = "Boldonse",
  secondaryFont = "Bodoni Moda",
  quoteSize = "8vw",
  metaSize = "1vw",
}) {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const fpsRef = useRef(null);
  const playBtnRef = useRef(null);
  const stateRef = useRef({
    playing: false,
    time: 0,
    idleAnimation: 0,
    transitionFactor: 0,
    lowFreq: 0,
    midFreq: 0,
    highFreq: 0,
    kickEnergy: 0,
    beatPhase: 0,
    kickDetected: false,
    kickImpactDuration: 0,
    lastKickTime: 0,
    beatInterval: 0,
    beatTime: 0,
    bandEnergies: Array(8).fill(0),
    bandHistories: Array(8)
      .fill(null)
      .map(() => []),
    audioContext: null,
    analyser: null,
    dataArray: null,
    audioElement: null,
    audioSource: null,
    scene: null,
    camera: null,
    renderer: null,
    mat: null,
    rafId: null,
    frameCount: 0,
    lastFpsTime: 0,
  });

  const toggleAudio = useCallback(() => {
    const s = stateRef.current;
    if (!s.mat) return;

    if (!s.playing) {
      if (!s.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        s.audioContext = new AudioCtx();
        s.analyser = s.audioContext.createAnalyser();
        s.analyser.fftSize = 1024;
        s.dataArray = new Uint8Array(s.analyser.frequencyBinCount);
        s.audioSource = s.audioContext.createMediaElementSource(s.audioElement);
        s.audioSource.connect(s.analyser);
        s.analyser.connect(s.audioContext.destination);
      }
      s.audioContext.resume().then(() => {
        s.audioElement.play().catch(console.error);
      });
      s.playing = true;
      s.mat.uniforms.isPlaying.value = true;
      if (playBtnRef.current) playBtnRef.current.textContent = "STOP";
    } else {
      s.audioElement.pause();
      s.playing = false;
      s.mat.uniforms.isPlaying.value = false;
      if (playBtnRef.current) playBtnRef.current.textContent = "PLAY";
    }
  }, []);

  useEffect(() => {
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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    ).then(() => {
      const THREE = window.THREE;
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !THREE) return;

      const preset = COLOR_PRESETS[colorPreset] || COLOR_PRESETS.Warm;

      s.scene = new THREE.Scene();
      s.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      s.camera.position.z = 1;

      s.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      s.renderer.setSize(window.innerWidth, window.innerHeight);
      s.renderer.setPixelRatio(window.devicePixelRatio);

      s.mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          iTime: { value: 0 },
          lowFreq: { value: 0 },
          midFreq: { value: 0 },
          highFreq: { value: 0 },
          isPlaying: { value: false },
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
          bgColorDown: { value: v3(preset.bgColorDown, THREE) },
          bgColorUp: { value: v3(preset.bgColorUp, THREE) },
          color1In: { value: v3(preset.color1In, THREE) },
          color1Out: { value: v3(preset.color1Out, THREE) },
          color2In: { value: v3(preset.color2In, THREE) },
          color2Out: { value: v3(preset.color2Out, THREE) },
          color3In: { value: v3(preset.color3In, THREE) },
          color3Out: { value: v3(preset.color3Out, THREE) },
        },
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), s.mat);
      s.scene.add(mesh);

      // Audio setup
      s.audioElement = new Audio();
      s.audioElement.crossOrigin = "anonymous";
      s.audioElement.preload = "auto";
      s.audioElement.src = audioSrc;
      s.audioElement.loop = true;

      // Animation loop
      const loop = (timestamp) => {
        s.rafId = requestAnimationFrame(loop);
        s.time += 0.01;
        s.idleAnimation += 0.01;
        s.mat.uniforms.iTime.value = s.time;
        s.mat.uniforms.idleAnimation.value = s.idleAnimation;

        const rate = 0.03;
        if (s.playing && s.transitionFactor < 1) {
          s.transitionFactor = Math.min(s.transitionFactor + rate, 1);
          s.mat.uniforms.transitionFactor.value = s.transitionFactor;
        } else if (!s.playing && s.transitionFactor > 0) {
          s.transitionFactor = Math.max(s.transitionFactor - rate, 0);
          s.mat.uniforms.transitionFactor.value = s.transitionFactor;
          if (s.transitionFactor === 0) {
            s.lowFreq = s.midFreq = s.highFreq = s.kickEnergy = 0;
            s.mat.uniforms.lowFreq.value = 0;
            s.mat.uniforms.midFreq.value = 0;
            s.mat.uniforms.highFreq.value = 0;
            s.mat.uniforms.kickEnergy.value = 0;
            s.mat.uniforms.bounceEffect.value = 0;
          }
        }

        // Frequency analysis
        if (s.playing && s.analyser) {
          s.analyser.getByteFrequencyData(s.dataArray);

          const bands = [
            [1, 4],
            [4, 9],
            [9, 20],
            [20, 40],
            [40, 80],
            [80, 160],
            [160, 300],
            [300, 500],
          ];
          for (let i = 0; i < bands.length; i++) {
            const slice = s.dataArray.slice(bands[i][0], bands[i][1]);
            let sum = 0,
              weight = 0,
              maxV = 0;
            for (let j = 0; j < slice.length; j++) {
              const v = slice[j] / 255;
              maxV = Math.max(maxV, v);
              const emp = Math.pow(v, 1.5);
              sum += emp;
              weight++;
            }
            s.bandEnergies[i] = (sum / weight) * 0.7 + maxV * 0.3;
            s.bandHistories[i].unshift(s.bandEnergies[i]);
            if (s.bandHistories[i].length > 4) s.bandHistories[i].pop();
          }

          const kickAvg = s.bandEnergies[1];
          const kickHistory = s.bandHistories[1];
          const recentKickAvg =
            kickHistory.slice(1).reduce((a, b) => a + b, 0) /
            Math.max(kickHistory.length - 1, 1);
          const kickJump = kickAvg - recentKickAvg;
          const now = performance.now();
          const newKick =
            kickJump > 0.06 &&
            kickAvg > 0.15 &&
            (!s.kickDetected || now - s.lastKickTime > 150);

          if (newKick) {
            s.kickDetected = true;
            s.kickEnergy = Math.min(1, kickAvg * 2.0);
            s.kickImpactDuration = 10;
            if (s.lastKickTime > 0) {
              const interval = now - s.lastKickTime;
              if (interval > 200 && interval < 2000)
                s.beatInterval = s.beatInterval * 0.7 + interval * 0.3;
            }
            s.lastKickTime = now;
            s.beatTime = 0;
          } else {
            s.kickEnergy *= 0.8;
            if (s.kickEnergy < 0.05) s.kickDetected = false;
            if (s.kickImpactDuration > 0) s.kickImpactDuration--;
          }

          if (s.beatInterval > 0) {
            s.beatTime += 16.67;
            s.beatPhase = (s.beatTime % s.beatInterval) / s.beatInterval;
          }

          let bounce =
            s.kickImpactDuration > 0
              ? Math.pow(s.kickImpactDuration / 10, 0.6) * 0.03
              : 0;
          bounce += s.kickEnergy * 0.025;

          const combinedBass =
            (s.bandEnergies[1] * 1.2 + s.bandEnergies[2]) / 2.2;
          s.lowFreq =
            combinedBass > s.lowFreq * 1.1
              ? s.lowFreq * 0.3 + combinedBass * 0.7
              : s.lowFreq * 0.85 + combinedBass * 0.15;
          const combinedMid = (s.bandEnergies[3] + s.bandEnergies[4]) / 2;
          s.midFreq =
            combinedMid > s.midFreq * 1.1
              ? s.midFreq * 0.4 + combinedMid * 0.6
              : s.midFreq * 0.8 + combinedMid * 0.2;
          const combinedHigh =
            (s.bandEnergies[5] + s.bandEnergies[6] + s.bandEnergies[7]) / 3;
          s.highFreq =
            combinedHigh > s.highFreq * 1.05
              ? s.highFreq * 0.5 + combinedHigh * 0.5
              : s.highFreq * 0.8 + combinedHigh * 0.2;
          s.lowFreq = Math.max(s.lowFreq, s.kickEnergy * 0.6);

          s.mat.uniforms.lowFreq.value = s.lowFreq;
          s.mat.uniforms.midFreq.value = s.midFreq;
          s.mat.uniforms.highFreq.value = s.highFreq;
          s.mat.uniforms.kickEnergy.value = s.kickEnergy;
          s.mat.uniforms.beatPhase.value = s.beatPhase;
          s.mat.uniforms.bounceEffect.value = bounce;
        }

        s.renderer.render(s.scene, s.camera);

        // FPS
        s.frameCount++;
        if (timestamp - s.lastFpsTime >= 1000) {
          const fps = Math.round(
            (s.frameCount * 1000) / (timestamp - s.lastFpsTime),
          );
          if (fpsRef.current) fpsRef.current.textContent = `FPS: ${fps}`;
          s.frameCount = 0;
          s.lastFpsTime = timestamp;
        }
      };
      loop(performance.now());

      // Resize
      const onResize = () => {
        s.renderer.setSize(window.innerWidth, window.innerHeight);
        s.mat.uniforms.iResolution.value.set(
          window.innerWidth,
          window.innerHeight,
        );
      };
      window.addEventListener("resize", onResize);

      // Mouse for cursor
      const onMouseMove = (e) => {
        if (cursorRef.current) {
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
        }
      };
      window.addEventListener("mousemove", onMouseMove);

      return () => {
        cancelAnimationFrame(s.rafId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        s.renderer.dispose();
        s.mat.dispose();
        if (s.audioElement) {
          s.audioElement.pause();
          s.audioElement.src = "";
        }
        if (s.audioContext) s.audioContext.close();
      };
    });
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=${primaryFont.replace(/ /g, "+")}&family=${secondaryFont.replace(/ /g, "+").replace(/,.*/, "")}:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&display=swap");
        @keyframes awv-noise {
          0%   { transform: translate(0,0); }
          10%  { transform: translate(-2%,-3%); }
          20%  { transform: translate(-4%,2%); }
          30%  { transform: translate(2%,-4%); }
          40%  { transform: translate(-2%,5%); }
          50%  { transform: translate(-4%,2%); }
          60%  { transform: translate(3%,0); }
          70%  { transform: translate(0,3%); }
          80%  { transform: translate(-3%,0); }
          90%  { transform: translate(2%,2%); }
          100% { transform: translate(1%,0); }
        }
      `}</style>

      <div
        className="relative w-screen h-screen overflow-hidden"
        style={{
          background: "#111",
          letterSpacing: "-0.03em",
          cursor: showCursor ? "none" : "auto",
        }}
      >
        {/* Film grain noise overlay */}
        {showNoise && (
          <div
            className="fixed pointer-events-none z-[100]"
            style={{
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0`,
              backgroundSize: "300px 300px",
              animation: "awv-noise 0.3s steps(5) infinite",
              opacity: 1,
              willChange: "transform",
            }}
          />
        )}

        {/* Three.js canvas */}
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[2]"
        />

        {/* Text content */}
        <div className="fixed inset-0 flex flex-col items-center justify-center z-[20] px-5 text-center pointer-events-none">
          <div className="max-w-[90%] overflow-hidden">
            <p
              className="opacity-70 mb-[2vh]"
              style={{
                fontFamily: `'${secondaryFont}', serif`,
                fontSize: metaSize,
                fontStyle: "italic",
              }}
            >
              {caption}
            </p>
            <h1
              className="font-normal leading-[1.3] mb-[5vh]"
              style={{
                fontFamily: `'${primaryFont}', sans-serif`,
                fontSize: quoteSize,
                letterSpacing: "-0.02em",
                color: "#e0e0e0",
                textTransform: "uppercase",
              }}
            >
              {quote}
            </h1>
            <p
              className="opacity-70 mb-[2vh]"
              style={{
                fontFamily: `'${secondaryFont}', serif`,
                fontSize: metaSize,
                fontStyle: "italic",
              }}
            >
              {author}
            </p>
            <p
              className="opacity-50"
              style={{
                fontFamily: `'${secondaryFont}', serif`,
                fontSize: metaSize,
              }}
            >
              {musicCredit}
            </p>
          </div>
        </div>

        {/* Play button */}
        <div className="fixed top-5 left-5 z-[100]">
          <button
            ref={playBtnRef}
            onClick={toggleAudio}
            className="bg-white/20 text-white border border-white/40 px-4 py-2 rounded text-sm transition-colors hover:bg-white/30"
            style={{ cursor: "pointer" }}
          >
            PLAY
          </button>
        </div>

        {/* FPS counter */}
        {showFps && (
          <div
            ref={fpsRef}
            className="fixed top-5 right-5 text-white text-xs bg-black/50 px-2 py-1 rounded z-[100]"
          >
            FPS: 0
          </div>
        )}

        {/* Custom cursor dot */}
        {showCursor && (
          <div
            ref={cursorRef}
            className="fixed pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-[width,height] duration-200"
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "rgba(255,255,255,0.5)",
              willChange: "transform",
              top: 0,
              left: 0,
            }}
          />
        )}

        {/* Profile card */}
        {showProfile && (
          <div className="fixed bottom-4 left-4 z-[999] flex items-center gap-3 p-4">
            <img
              src={profileImage}
              alt={profileName}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-[#e0e0e0]">
                {profileName}
              </p>
              <p className="text-xs text-[#71717a]">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="no-underline text-[#71717a] hover:underline"
                >
                  {profileHandle}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
