"use client";

import { useEffect, useRef, useState } from "react";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bodoni",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-hanken",
});

const VERTEX = `attribute vec2 aPos;
uniform vec2 uCover;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec2 vFirstTextureCoord;
varying vec2 vSecondTextureCoord;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
  vTextureCoord = aPos * 0.5 + 0.5;
  vFirstTextureCoord = (vTextureCoord - 0.5) * uCover + 0.5;
  vSecondTextureCoord = vFirstTextureCoord;
  vVertexPosition = vec3(aPos, 0.0);
}`;

const HEAD = `precision mediump float;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec2 vFirstTextureCoord;
varying vec2 vSecondTextureCoord;
uniform float uTransitionTimer;
uniform float uTo;
uniform float uFrom;
uniform float uFadeIn;
uniform sampler2D firstTexture;
uniform sampler2D secondTexture;
uniform sampler2D thirdTexture;
const float PI = 3.141592653589793;
vec4 getTextureByIndex(float index, vec2 vUv) {
  vec4 result = vec4(0.);
  if (index < 0.5) { result = texture2D(firstTexture, vUv); }
  else if (index < 1.5) { result = texture2D(secondTexture, vUv); }
  else { result = texture2D(thirdTexture, vUv); }
  return result;
}
mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}
vec2 fadeUV() {
  return (vFirstTextureCoord - vec2(0.5)) * (0.2 + 0.8 * uFadeIn) + vec2(0.5) + 0.6 * vec2(0., 1. - uFadeIn);
}
`;

const BODIES = {
  circle: `void main() {
  float progress = fract(uTransitionTimer);
  vec2 centerVector = vFirstTextureCoord - vec2(0.5);
  vec2 vUv = fadeUV();
  float mask = step(vTextureCoord.y, uFadeIn);
  float circleProgress = 1. - smoothstep(progress * 0.9 - 0.2, progress * 0.9, length(vTextureCoord - vec2(0.5)));
  vec2 nextUV = vUv + centerVector * (circleProgress - 1.0);
  vec2 currentUV = vUv - centerVector * circleProgress * 0.5 - centerVector * progress * 0.2;
  vec4 current = getTextureByIndex(uFrom, currentUV);
  vec4 next = getTextureByIndex(uTo, nextUV);
  gl_FragColor = mix(vec4(0.), mix(current, next, circleProgress), mask);
}`,
  slide: `void main() {
  float progress = fract(uTransitionTimer);
  vec2 newUV = fadeUV();
  float mask = step(vTextureCoord.y, uFadeIn);
  float p1 = progress - 1.;
  float p = progress;
  vec2 uv = vTextureCoord;
  vec2 position = step(0., p) * uv + step(0., -p) * (1. - uv);
  float dx1 = p * 0.8;
  float vert = abs(p * 0.3);
  dx1 -= step(0.2 - vert, position.x / 2.) * 0.3 * p;
  dx1 -= step(0.4 - vert, position.x / 2.) * 0.3 * p;
  dx1 += step(0.6 - vert, position.x / 2.) * 0.3 * p;
  dx1 += step(0.8 - vert, position.x / 2.) * 0.3 * p;
  vec4 tex1 = getTextureByIndex(uFrom, vec2(newUV.x + dx1, newUV.y));
  float bounds = step(0., 1. - (uv.x / 2. + p)) * step(0., uv.x / 2. + p);
  vec4 fcolor = tex1 * bounds;
  float dx2 = p1 * 0.8;
  float vert1 = abs(p1 * 0.3);
  dx2 -= step(0.2 + vert1, position.x / 2.) * 0.3 * p1;
  dx2 -= step(0.4 + vert1, position.x / 2.) * 0.3 * p1;
  dx2 += step(0.6 + vert1, position.x / 2.) * 0.3 * p1;
  dx2 += step(0.8 + vert1, position.x / 2.) * 0.3 * p1;
  vec4 tex2 = getTextureByIndex(uTo, vec2(newUV.x + dx2, newUV.y));
  float bounds1 = step(0., 1. - (uv.x / 2. + p1)) * step(0., uv.x / 2. + p1);
  fcolor += tex2 * bounds1;
  gl_FragColor = mix(vec4(0.), fcolor, mask);
}`,
  ripple: `void main() {
  float progress = fract(uTransitionTimer);
  vec2 newUV = fadeUV();
  float mask = step(vTextureCoord.y, uFadeIn);
  vec2 uvDivided = fract(newUV * vec2(40., 1.));
  vec2 uvDisplaced1 = newUV + rotate(PI / 4.) * uvDivided * progress * 0.1;
  vec2 uvDisplaced2 = newUV + rotate(PI / 4.) * uvDivided * (1. - progress) * 0.1;
  vec4 current = getTextureByIndex(uFrom, uvDisplaced1);
  vec4 next = getTextureByIndex(uTo, uvDisplaced2);
  gl_FragColor = mix(vec4(0.), mix(current, next, progress), mask);
}`,
  twist: `void main() {
  float progress = fract(uTransitionTimer);
  vec2 uv = fadeUV();
  vec4 current = getTextureByIndex(uFrom, uv);
  vec4 next = getTextureByIndex(uTo, uv);
  float spread = 0.05;
  float mask = step(vTextureCoord.y, uFadeIn);
  float col = smoothstep(0.5 - spread, 0.5 + spread, uv.x);
  vec2 rotUV = (uv - vec2(0.5 - 2. * spread + 4. * spread * progress, 0.5)) * rotate(progress * PI * 2.) + vec2(0.5, 0.5);
  float col1 = smoothstep(0.5 + spread, 0.5 - spread, rotUV.x);
  float final = min(col1, col);
  if (progress > 0.5) {
    final = 1. - min(1. - col, 1. - col1);
  }
  gl_FragColor = mix(vec4(0.), mix(current, next, final), mask);
}`,
};

const drawers = [
  (c, w, h, t) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#fff";
    c.lineWidth = 2;
    for (let k = 0; k < 14; k++) {
      const r = (k * 42 + t * 36) % 588;
      c.globalAlpha = 1 - r / 588;
      c.beginPath();
      c.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      c.stroke();
    }
    c.globalAlpha = 1;
  },
  (c, w, h, t) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, w, h);
    c.save();
    c.translate(w / 2, h / 2);
    c.rotate(-0.5);
    for (let k = -14; k <= 14; k++) {
      const x = k * 70 + ((t * 40) % 70);
      c.fillStyle = k % 2 ? "#fff" : "#8a8a8a";
      c.fillRect(x, -h, 28, h * 2);
    }
    c.restore();
  },
  (c, w, h, t) => {
    c.fillStyle = "#fff";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#000";
    for (let k = 0; k < 6; k++) {
      const x = w * (0.5 + 0.35 * Math.sin(t * 0.4 + k * 1.7));
      const y = h * (0.5 + 0.35 * Math.cos(t * 0.5 + k * 2.3));
      const r = 44 + 30 * Math.sin(t + k);
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  },
];

const testVideo = (url) =>
  new Promise((resolve) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.preload = "auto";
    const done = (ok) => {
      clearTimeout(timer);
      v.removeAttribute("src");
      v.load();
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), 4000);
    v.addEventListener("loadeddata", () => done(true), { once: true });
    v.addEventListener("error", () => done(false), { once: true });
    v.src = url;
  });

const tween = (seconds, update, done) => {
  const handle = { cancel: false };
  const t0 = performance.now();
  const step = (now) => {
    if (handle.cancel) return;
    const p = Math.min(1, (now - t0) / (seconds * 1000));
    update(p);
    if (p < 1) requestAnimationFrame(step);
    else if (done) done();
  };
  requestAnimationFrame(step);
  return handle;
};

export default function MotionReel({
  variant = "circle",
  intro = "Three short films on a single surface. Choose one and the picture folds into the next.",
  enterLabel = "Play",
  loadingLabel = "Loading",
  errorLabel = "WebGL is not available in this browser.",
  chapters = ["Wake up", "Rejoice", "Breathe"],
  variantLabels = { circle: "Circle", slide: "Slide", ripple: "Ripple", twist: "Twist" },
  titles = {
    circle: "Ungovernable",
    slide: "Unbreakable",
    ripple: "Insubordinate",
    twist: "Thriving",
  },
  durations = { circle: 2.5, slide: 1, ripple: 1, twist: 1 },
  showVariantSwitch = true,
  videos = [
    "https://videos.pexels.com/video-files/5214219/5214219-hd_1920_1080_25fps.mp4",
    "https://videos.pexels.com/video-files/5992517/5992517-hd_1920_1080_30fps.mp4",
    "https://videos.pexels.com/video-files/1578318/1578318-hd_1920_1080_30fps.mp4",
  ],
  bgColor = "#000000",
  textColor = "#ffffff",
  className = "",
}) {
  const initial = BODIES[variant] ? variant : "circle";
  const [active, setActive] = useState(initial);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [shown, setShown] = useState(false);

  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const activeRef = useRef(initial);
  const durationsRef = useRef(durations);
  const videosRef = useRef(videos);

  useEffect(() => {
    setActive(BODIES[variant] ? variant : "circle");
  }, [variant]);

  useEffect(() => {
    activeRef.current = active;
    durationsRef.current = durations;
    videosRef.current = videos;
  }, [active, durations, videos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      setFailed(true);
      return;
    }

    const s = {
      mode: "canvas",
      started: false,
      running: false,
      current: 0,
      from: 0,
      to: 0,
      timer: 0,
      fadeIn: 0,
      videos: [],
      uploaded: [false, false, false],
      canvases: [],
      contexts: [],
      textures: [],
      program: null,
      locs: null,
      variant: null,
      tween: null,
      fade: null,
      raf: 0,
      dead: false,
    };

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    for (let i = 0; i < 3; i++) {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]),
      );
      s.textures.push(tex);
    }

    const makeShader = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };

    const compile = (name) => {
      const vs = makeShader(gl.VERTEX_SHADER, VERTEX);
      const fs = makeShader(gl.FRAGMENT_SHADER, HEAD + BODIES[name]);
      if (!vs || !fs) return false;
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, "aPos");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return false;
      }
      if (s.program) gl.deleteProgram(s.program);
      s.program = program;
      gl.useProgram(program);
      s.locs = {
        timer: gl.getUniformLocation(program, "uTransitionTimer"),
        fade: gl.getUniformLocation(program, "uFadeIn"),
        to: gl.getUniformLocation(program, "uTo"),
        from: gl.getUniformLocation(program, "uFrom"),
        cover: gl.getUniformLocation(program, "uCover"),
      };
      gl.uniform1i(gl.getUniformLocation(program, "firstTexture"), 0);
      gl.uniform1i(gl.getUniformLocation(program, "secondTexture"), 1);
      gl.uniform1i(gl.getUniformLocation(program, "thirdTexture"), 2);
      s.variant = name;
      return true;
    };

    if (!compile(activeRef.current)) {
      setFailed(true);
      return;
    }

    const ensureCanvases = () => {
      if (s.canvases.length) return;
      for (let i = 0; i < 3; i++) {
        const c = document.createElement("canvas");
        c.width = 640;
        c.height = 360;
        s.canvases.push(c);
        s.contexts.push(c.getContext("2d"));
      }
    };

    const upload = (i, source) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, s.textures[i]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        return true;
      } catch (e) {
        return false;
      }
    };

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const render = (now) => {
      if (s.dead) return;
      s.raf = requestAnimationFrame(render);
      resize();

      if (s.started) {
        if (s.mode === "canvas") {
          ensureCanvases();
          const t = now / 1000;
          for (let i = 0; i < 3; i++) {
            drawers[i](s.contexts[i], 640, 360, t);
            upload(i, s.canvases[i]);
          }
        } else {
          for (let i = 0; i < 3; i++) {
            const v = s.videos[i];
            if (v && v.readyState >= 2 && (!v.paused || !s.uploaded[i])) {
              if (upload(i, v)) s.uploaded[i] = true;
              else {
                s.mode = "canvas";
                break;
              }
            }
          }
        }
      }

      const cw = canvas.width;
      const ch = canvas.height;
      const canvasAspect = cw / ch;
      const v0 = s.videos[0];
      const srcAspect =
        s.mode === "video" && v0 && v0.videoWidth ? v0.videoWidth / v0.videoHeight : 16 / 9;
      const cx = canvasAspect > srcAspect ? 1 : canvasAspect / srcAspect;
      const cy = canvasAspect > srcAspect ? srcAspect / canvasAspect : 1;

      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(s.program);
      gl.uniform1f(s.locs.timer, s.timer);
      gl.uniform1f(s.locs.fade, s.fadeIn);
      gl.uniform1f(s.locs.to, s.to);
      gl.uniform1f(s.locs.from, s.from);
      gl.uniform2f(s.locs.cover, cx, cy);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    s.raf = requestAnimationFrame(render);

    const start = () => {
      if (s.started) return;
      s.started = true;
      setStarted(true);
      s.fade = tween(1, (p) => {
        s.fadeIn = p;
      });
      if (s.mode === "video") {
        s.videos.forEach((v) => v.play().catch(() => { }));
        setTimeout(() => {
          s.videos[1]?.pause();
          s.videos[2]?.pause();
        }, 400);
      }
    };

    const go = (to) => {
      if (!s.started || s.running || to === s.current) return;
      s.running = true;
      setCurrent(to);
      s.to = to;
      if (s.mode === "video") s.videos[to]?.play().catch(() => { });
      s.tween = tween(
        durationsRef.current[s.variant] || 1,
        (p) => {
          s.timer = p;
        },
        () => {
          s.from = to;
          s.timer = 0;
          if (s.mode === "video") s.videos.forEach((v, i) => i !== to && v.pause());
          s.current = to;
          s.running = false;
        },
      );
    };

    const setVariant = (name) => {
      if (name === s.variant) return;
      if (s.tween) s.tween.cancel = true;
      s.running = false;
      s.from = s.to;
      s.current = s.to;
      s.timer = 0;
      setCurrent(s.to);
      compile(name);
    };

    apiRef.current = { start, go, setVariant };

    const init = async () => {
      const list = videosRef.current.slice(0, 3);
      const results = await Promise.all(list.map(testVideo));
      if (s.dead) return;
      if (results.length === 3 && results.every(Boolean)) {
        s.videos = list.map((src) => {
          const v = document.createElement("video");
          v.crossOrigin = "anonymous";
          v.muted = true;
          v.loop = true;
          v.preload = "auto";
          v.setAttribute("playsinline", "");
          v.src = src;
          v.load();
          return v;
        });
        s.mode = "video";
      }
      setReady(true);
    };
    init();

    return () => {
      s.dead = true;
      cancelAnimationFrame(s.raf);
      if (s.tween) s.tween.cancel = true;
      if (s.fade) s.fade.cancel = true;
      s.videos.forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      apiRef.current = null;
      s.textures.forEach((t) => gl.deleteTexture(t));
      if (s.program) gl.deleteProgram(s.program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  useEffect(() => {
    if (apiRef.current) apiRef.current.setVariant(active);
    setShown(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, [active]);

  const enterDisabled = !ready || failed;

  return (
    <div
      className={
        "relative h-screen w-full overflow-hidden bg-[var(--bg)] font-[family-name:var(--font-hanken)] text-[var(--fg)] " +
        bodoni.variable +
        " " +
        hanken.variable +
        " " +
        className
      }
      style={{ "--bg": bgColor, "--fg": textColor }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="absolute inset-0 z-10 flex flex-col justify-between px-[clamp(20px,4vw,56px)] pt-6 pb-9">
        <nav className="flex justify-end gap-6 text-sm">
          {showVariantSwitch &&
            Object.keys(BODIES).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={
                  "underline-offset-8 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fg)] " +
                  (key === active ? "underline opacity-100" : "opacity-50")
                }
              >
                {variantLabels[key]}
              </button>
            ))}
        </nav>

        <main className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <h1 className="overflow-hidden pb-[0.08em] font-[family-name:var(--font-bodoni)] text-[clamp(2.6rem,9vw,10rem)] font-normal leading-[0.86] tracking-[-0.03em]">
            <span
              className={
                "inline-block " +
                (shown
                  ? "translate-y-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  : "translate-y-[105%]")
              }
            >
              {titles[active]}
            </span>
          </h1>

          <div className="flex flex-col gap-8">
            <p className="max-w-[32ch] text-base leading-relaxed opacity-70">
              {failed ? errorLabel : intro}
            </p>

            <div className="relative min-h-44">
              <button
                type="button"
                disabled={enterDisabled}
                onClick={() => apiRef.current && apiRef.current.start()}
                className={
                  "absolute bottom-0 left-0 flex size-28 items-center justify-center rounded-full bg-[var(--fg)] text-base font-medium text-[var(--bg)] transition duration-300 enabled:hover:bg-transparent enabled:hover:text-[var(--fg)] enabled:hover:shadow-[inset_0_0_0_1px_var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fg)] " +
                  (started
                    ? "pointer-events-none scale-75 opacity-0"
                    : enterDisabled
                      ? "opacity-40"
                      : "opacity-100")
                }
              >
                {enterDisabled && !failed ? loadingLabel : enterLabel}
              </button>

              <ul
                className={
                  "absolute bottom-0 left-0 flex flex-col gap-1 transition-opacity duration-500 " +
                  (started ? "opacity-100" : "pointer-events-none opacity-0")
                }
              >
                {chapters.slice(0, 3).map((label, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => apiRef.current && apiRef.current.go(i)}
                      className={
                        "flex items-center gap-4 text-left transition-opacity duration-300 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fg)] " +
                        (current === i ? "opacity-100" : "opacity-40")
                      }
                    >
                      <span
                        className={
                          "h-px bg-[var(--fg)] transition-[width] duration-500 " +
                          (current === i ? "w-10" : "w-0")
                        }
                      />
                      <span className="font-[family-name:var(--font-bodoni)] text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.05] tracking-[-0.02em]">
                        {label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}