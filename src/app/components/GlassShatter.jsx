"use client";

import { useEffect, useRef } from "react";

// ─── GlassCrack ──────────────────────────────────────────────────────────────
//
// A full-bleed WebGL image that shatters like glass around the pointer on click,
// with film-grain-ish radial cracks driven entirely by a fragment shader. Click
// to break at a new spot; press Space to toggle the displacement effect. Ported
// from a raw WebGL CodePen (no three.js) — the GL pipeline is hand-rolled.
//
// All GL work runs inside useEffect against a ref'd <canvas>, sized to the
// component's container (not window), so there's no SSR/hydration issue. The
// optional lil-gui control panel is ESM-only, so it's loaded via an injected
// <script type="module"> and only when `showControls` is on.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imageSrc             string   (demo)    Image to shatter (needs CORS for upload-free remotes).
// bgColor              string   #000000   Canvas/page backdrop behind transparent edges.
// distance             number   0.015     u_effect — displacement strength of the break.
// edgeThickness        number   0.006     u_edge_thickness — crack line thickness.
// clickRandomizer      number   0.332     u_click_randomizer — seed for the crack pattern.
// effectOn             boolean  true       Whether the displacement effect is active.
// pointerStartX        number   0.55      Initial pointer X as a fraction of width.
// pointerStartY        number   0.5       Initial pointer Y as a fraction of height.
// maxDevicePixelRatio  number   2         Caps DPR for performance on retina screens.
// allowImageUpload     boolean  true       Adds a hidden file input + GUI "load image".
// showControls         boolean  true       Show the lil-gui tweak panel.
// showTip              boolean  true       Show the hint caption.
// tipText              string   click to break, space to toggle
// tipBg                string   cornsilk  Tip background color.
// tipColor             string   red       Tip text color.
// autoPreview          boolean  false     Auto-nudge the pointer twice on mount (CodePen preview).
// className            string   ""        Extra classes on the root element.
// ──────────────────────────────────────────────────────────────────────────

// Vertex shader — full-screen triangle strip, passes UVs through.
const VERT_SHADER = `
precision mediump float;
varying vec2 vUv;
attribute vec2 a_position;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader — radial sector cracks + grid cracks + UV displacement.
const FRAG_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_image_texture;
uniform float u_edge_thickness;
uniform float u_ratio;
uniform vec2 u_pointer_position;
uniform float u_img_ratio;
uniform float u_click_randomizer;
uniform float u_rotation;
uniform float u_effect;
uniform float u_effect_active;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float random(float x) {
  return fract(sin(x * 12.9898) * 43758.5453);
}
float random2(vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  float res = mix(
    mix(random2(ip), random2(ip+vec2(1.0, 0.0)), u.x),
    mix(random2(ip+vec2(0.0, 1.0)), random2(ip+vec2(1.0, 1.0)), u.x), u.y);
  return res*res;
}
float get_sector_shape(float d, float a, float angle, float edges) {
  float angle1 = PI;
  float angle2 = angle1 + angle;
  float edge1 = smoothstep(angle1 - edges / d, angle1 + edges / d, a);
  float edge2 = smoothstep(angle2 - edges / d, angle2 + edges / d, a);
  return edge1 * (1. - edge2);
}
float get_img_frame_alpha(vec2 uv, float img_frame_width) {
  float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
  img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
  return img_frame_alpha;
}
float get_simple_cracks(float a, float d, float n) {
  a *= (1. + sin(2. * a + PI + 2. * u_click_randomizer));
  float simple_cracks_number = 10.;
  float simple_cracks_angle_step = TWO_PI / simple_cracks_number;
  float simple_crack_angle = mod(a + n + u_click_randomizer, simple_cracks_angle_step);
  float cracks_shape = 4. * abs(simple_crack_angle - .5 * simple_cracks_angle_step);
  cracks_shape = mix(cracks_shape, 1., smoothstep(.9, 1., d));
  cracks_shape *= pow(d + .4 * u_click_randomizer * max(0., cos(2. * a + u_click_randomizer) * sin(1. * a)), 12.);
  cracks_shape = (1. + n) * (1. + sin(4. * a)) * step(.9, cracks_shape);
  return cracks_shape;
}
vec2 get_img_uv() {
  vec2 img_uv = vUv;
  img_uv -= .5;
  if (u_ratio > u_img_ratio) {
    img_uv.x = img_uv.x * u_ratio / u_img_ratio;
  } else {
    img_uv.y = img_uv.y * u_img_ratio / u_ratio;
  }
  float scale_factor = 1.4;
  img_uv *= scale_factor;
  img_uv += .5;
  img_uv.y = 1. - img_uv.y;
  return img_uv;
}
vec2 get_disturbed_uv(vec2 uv, float section_constant, float edge, vec2 direction, float border) {
  float img_distortion = u_effect * (section_constant - .5);
  vec2 discurbed_uv = uv;
  discurbed_uv += 2. * img_distortion;
  discurbed_uv.x -= mix(.03 * edge * direction.x, -.1 * edge, border);
  discurbed_uv.y -= mix(.03 * edge * direction.y, -.1 * edge, border);
  vec2 center = vec2(0.5, 0.5);
  discurbed_uv = discurbed_uv - center;
  float cosA = cos(4. * img_distortion);
  float sinA = sin(4. * img_distortion);
  float perspective = 1. + img_distortion * discurbed_uv.y;
  discurbed_uv = vec2(
    perspective * (cosA * discurbed_uv.x - sinA * discurbed_uv.y),
    perspective * (sinA * discurbed_uv.x + cosA * discurbed_uv.y)
  );
  discurbed_uv += center;
  return discurbed_uv;
}
void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv.x *= u_ratio;
  vec2 pointer = u_pointer_position;
  vec2 pointer_direction = normalize(u_pointer_position - vec2(vUv.x, 1. - vUv.y));
  pointer.x *= u_ratio;
  pointer = pointer - uv;
  float pointer_angle = atan(pointer.y, pointer.x);
  float pointer_distance = length(pointer);
  float pointer_distance_normalized = (1. - clamp(pointer_distance, 0., 1.));
  vec3 color = vec3(0.);
  vec2 img_uv = get_img_uv();
  float sector_constant = 0.;
  float sector_start_angle = 0.;
  float is_sector_edge = 0.;
  float is_grid_edge = 0.;
  float is_central_edge = 0.;
  float angle_noise = .3 * noise(3. * img_uv);
  for (int i = 0; i < 12; i++) {
    float sector_seed = float(i) + u_click_randomizer + 2.;
    float angle_normalised = mod((pointer_angle - sector_start_angle) / TWO_PI, 1.);
    angle_normalised += .1 * angle_noise;
    float angle = angle_normalised * TWO_PI;
    float sector_size = (.01 + 2. * random2(vec2(float(i) + u_click_randomizer, u_pointer_position.x)));
    sector_size = min(sector_size, TWO_PI - sector_start_angle);
    float thickness = u_edge_thickness * (.2 + random(3. * sector_seed));
    thickness += angle_noise * .03 * pow(pointer_distance_normalized, 80.);
    float shape = get_sector_shape(pointer_distance, angle, sector_size, thickness);
    is_sector_edge = max(is_sector_edge, smoothstep(.6, 1., shape));
    sector_constant = mix(sector_constant, random(sector_seed), smoothstep(.2, .8, shape));
    vec2 grid_uv = 2. * (.8 + .5 * pointer_distance_normalized) * img_uv;
    float grid_noise = noise(grid_uv + sector_seed);
    float grid_thickness = (.4 + .4 * random(10. * sector_seed)) * u_edge_thickness;
    float grid_shape = shape * smoothstep(.27, .27 + grid_thickness, grid_noise);
    is_grid_edge += (smoothstep(.1, .5, grid_shape) * smoothstep(.9, .6, grid_shape));
    sector_constant = mix(sector_constant, random(sector_seed + 100.), smoothstep(.2, .8, grid_shape));
    vec2 central_grid_uv = img_uv * (3. + 3. * pow(pointer_distance_normalized, 10.));
    float central_grid_noise = noise(central_grid_uv + sector_seed);
    float central_grid_thickness = (1. + .5 * random(-2. + sector_seed)) * u_edge_thickness;
    float central_grid_shape = step(.7, shape) * smoothstep(.27, .27 + central_grid_thickness, central_grid_noise);
    is_central_edge += (smoothstep(.0, .5, central_grid_shape) * smoothstep(1., .5, central_grid_shape));
    is_central_edge *= (step(.8, pointer_distance_normalized));
    sector_constant = mix(sector_constant, random(sector_seed + 100.), smoothstep(.2, .8, central_grid_shape));
    sector_start_angle += sector_size;
  }
  float img_edge_alpha = get_img_frame_alpha(img_uv, .004);
  is_sector_edge = 1. - is_sector_edge;
  float cracks_edge = max(is_grid_edge, is_sector_edge);
  cracks_edge = max(cracks_edge, is_central_edge);
  float central_cracks = get_simple_cracks(pointer_angle, pointer_distance_normalized, angle_noise);
  cracks_edge += central_cracks;
  if (u_effect_active > 0.) {
    img_uv = get_disturbed_uv(img_uv, sector_constant, cracks_edge, pointer_direction, get_img_frame_alpha(img_uv, .2));
  }
  vec4 img = texture2D(u_image_texture, img_uv);
  color = img.rgb;
  color += .12 * u_effect_active * (sector_constant - .5);
  img_edge_alpha = get_img_frame_alpha(img_uv, .004);
  float opacity = img_edge_alpha;
  opacity -= .3 * u_effect_active * pow(is_grid_edge, 4.);
  opacity -= .3 * u_effect_active * is_central_edge;
  opacity -= .03 * u_effect_active * pow(central_cracks, 4.);
  gl_FragColor = vec4(color, opacity);
}
`;

// Loads lil-gui (ESM-only) once across instances.
const loadGui = () => {
  if (window.__lilGUI) return Promise.resolve(window.__lilGUI);
  if (window.__lilGuiPromise) return window.__lilGuiPromise;
  window.__lilGuiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("lil-gui timed out")),
      15000,
    );
    window.addEventListener(
      "lilgui-ready",
      () => {
        clearTimeout(timeout);
        resolve(window.__lilGUI);
      },
      { once: true },
    );
    const s = document.createElement("script");
    s.type = "module";
    s.textContent =
      'import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.18.2/+esm";' +
      "window.__lilGUI = GUI;" +
      'window.dispatchEvent(new Event("lilgui-ready"));';
    s.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("lil-gui failed to load"));
    };
    document.head.appendChild(s);
  });
  return window.__lilGuiPromise;
};

export default function GlassShatter({
  imageSrc = "https://ksenia-k.com/img/codepen/for-glass-crack-demo-1.jpg",
  bgColor = "#000000",
  distance = 0.015,
  edgeThickness = 0.006,
  clickRandomizer = 0.332,
  effectOn = true,
  pointerStartX = 0.55,
  pointerStartY = 0.5,
  maxDevicePixelRatio = 2,
  allowImageUpload = true,
  showControls = true,
  showTip = true,
  tipText = "click to break, space to toggle",
  tipBg = "cornsilk",
  tipColor = "red",
  autoPreview = false,
  className = "",
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // Mutable engine handles shared between the init effect and the sync effect.
  const glRef = useRef(null);
  const uniformsRef = useRef(null);
  const imageRef = useRef(null);
  const paramsRef = useRef(null);
  const pointerRef = useRef(null);
  const updateUniformsRef = useRef(null);

  // ── Init: build the GL pipeline, load the image, wire events ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);

    const params = {
      clickRandomizer,
      distance,
      effectOn,
      edgeThickness,
    };
    paramsRef.current = params;

    const pointer = {
      x: pointerStartX * root.clientWidth,
      y: pointerStartY * root.clientHeight,
    };
    pointerRef.current = pointer;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("[GlassCrack] WebGL not supported");
      return;
    }
    glRef.current = gl;

    // ── Compile + link ──
    const createShader = (src, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
          "[GlassCrack] shader compile error:",
          gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(VERT_SHADER, gl.VERTEX_SHADER);
    const fragmentShader = createShader(FRAG_SHADER, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "[GlassCrack] program link error:",
        gl.getProgramInfoLog(program),
      );
      return;
    }

    // Collect uniform locations by name.
    const uniforms = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const name = gl.getActiveUniform(program, i).name;
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    uniformsRef.current = uniforms;

    // Full-screen quad.
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Transparent edges blend over the backdrop.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const updateUniforms = () => {
      gl.uniform1f(uniforms.u_click_randomizer, params.clickRandomizer);
      gl.uniform1f(uniforms.u_effect, params.distance);
      gl.uniform1f(uniforms.u_effect_active, params.effectOn ? 1 : 0);
      gl.uniform1f(uniforms.u_edge_thickness, params.edgeThickness);
      gl.uniform2f(
        uniforms.u_pointer_position,
        pointer.x / root.clientWidth,
        pointer.y / root.clientHeight,
      );
    };
    updateUniformsRef.current = updateUniforms;
    updateUniforms();

    const resizeCanvas = () => {
      const img = imageRef.current;
      if (!img) return;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      canvas.width = root.clientWidth * dpr;
      canvas.height = root.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
      gl.uniform1f(uniforms.u_img_ratio, imgRatio);
    };

    const loadImage = (src) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        imageRef.current = img;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img,
        );
        gl.uniform1i(uniforms.u_image_texture, 0);
        resizeCanvas();
      };
    };

    let rafId = null;
    const render = () => {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };

    // ── Events ──
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      params.clickRandomizer = Math.random();
      updateUniforms();
    };

    const handleKeydown = (e) => {
      if (e.code === "Space") {
        params.effectOn = !params.effectOn;
        if (guiState.effectControl)
          guiState.effectControl.setValue(params.effectOn);
        updateUniforms();
      }
    };

    canvas.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", resizeCanvas);

    // Optional file upload.
    const input = inputRef.current;
    const handleInputChange = () => {
      const [file] = input.files;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => loadImage(ev.target.result);
      reader.readAsDataURL(file);
    };
    if (input) input.onchange = handleInputChange;

    // ── Optional lil-gui panel ──
    const guiState = { gui: null, effectControl: null };
    if (showControls) {
      loadGui()
        .then((GUI) => {
          const gui = new GUI();
          guiState.gui = gui;
          gui.close();
          if (allowImageUpload && input) {
            gui
              .add({ loadMyImage: () => input.click() }, "loadMyImage")
              .name("load image");
          }
          const folder = gui.addFolder("shader params");
          guiState.effectControl = folder
            .add(params, "effectOn")
            .onChange(updateUniforms);
          folder.add(params, "distance", 0, 0.2).onChange(updateUniforms);
          folder.add(params, "clickRandomizer", 0, 1).onChange(updateUniforms);
          folder.add(params, "edgeThickness", 0, 0.02).onChange(updateUniforms);
        })
        .catch((err) =>
          console.error("[GlassCrack] GUI load failed:", err.message),
        );
    }

    // CodePen-style preview nudge.
    let autoFlag = true;
    const autoRun = () => {
      params.clickRandomizer -= 0.03;
      pointer.x += 70 * (autoFlag ? 1 : -1);
      pointer.y += 40;
      updateUniforms();
      autoFlag = !autoFlag;
    };
    let t1, t2;
    if (autoPreview) {
      t1 = setTimeout(autoRun, 500);
      t2 = setTimeout(autoRun, 1000);
    }

    loadImage(imageSrc);
    render();

    // ── Cleanup ──
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", resizeCanvas);
      if (input) input.onchange = null;
      if (guiState.gui) guiState.gui.destroy();
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageSrc,
    maxDevicePixelRatio,
    showControls,
    allowImageUpload,
    autoPreview,
  ]);

  // ── Sync the live, tweakable props into the running scene ──
  useEffect(() => {
    const params = paramsRef.current;
    const update = updateUniformsRef.current;
    if (!params || !update) return;
    params.distance = distance;
    params.edgeThickness = edgeThickness;
    params.clickRandomizer = clickRandomizer;
    params.effectOn = effectOn;
    update();
  }, [distance, edgeThickness, clickRandomizer, effectOn]);

  return (
    <div
      ref={rootRef}
      className={"relative w-full h-screen overflow-hidden " + className}
      style={{ background: bgColor }}
    >
      {allowImageUpload && (
        <input ref={inputRef} type="file" className="hidden" accept="image/*" />
      )}

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 block w-full h-full"
      />

      {showTip && (
        <div
          className="absolute top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono select-none pointer-events-none px-1"
          style={{ backgroundColor: tipBg, color: tipColor }}
        >
          {tipText}
        </div>
      )}
    </div>
  );
}
