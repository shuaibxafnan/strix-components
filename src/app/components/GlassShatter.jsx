"use client";

import { useEffect, useRef } from "react";

const VERT_SHADER = `
precision mediump float;
varying vec2 vUv;
attribute vec2 a_position;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

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

const compile = (gl, source, type) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export default function GlassShatter({
  imageSrc = "https://images.unsplash.com/photo-1738858363202-dd019dadce76?auto=format&fit=crop&w=1080&q=80",
  backgroundColor = "bg-black",
  distance = 0.015,
  edgeThickness = 0.006,
  clickRandomizer = 0.332,
  effectOn = true,
  pointerStartX = 0.55,
  pointerStartY = 0.5,
  maxDevicePixelRatio = 2,
  showTip = true,
  tipText = "Click to break, space to toggle",
  tipClassName = "bg-white text-black",
  className = "",
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return undefined;

    const gl = canvas.getContext("webgl");
    if (!gl) return undefined;

    const vertexShader = compile(gl, VERT_SHADER, gl.VERTEX_SHADER);
    const fragmentShader = compile(gl, FRAG_SHADER, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;

    gl.useProgram(program);

    const uniforms = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const { name } = gl.getActiveUniform(program, i);
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
    const params = { clickRandomizer, distance, effectOn, edgeThickness };
    const pointer = {
      x: pointerStartX * root.clientWidth,
      y: pointerStartY * root.clientHeight,
    };

    let image = null;
    let texture = null;
    let disposed = false;

    const draw = () => {
      if (!image) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const update = () => {
      gl.uniform1f(uniforms.u_click_randomizer, params.clickRandomizer);
      gl.uniform1f(uniforms.u_effect, params.distance);
      gl.uniform1f(uniforms.u_effect_active, params.effectOn ? 1 : 0);
      gl.uniform1f(uniforms.u_edge_thickness, params.edgeThickness);
      gl.uniform2f(
        uniforms.u_pointer_position,
        pointer.x / root.clientWidth,
        pointer.y / root.clientHeight,
      );
      draw();
    };

    const resize = () => {
      if (!image) return;
      canvas.width = root.clientWidth * dpr;
      canvas.height = root.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
      gl.uniform1f(uniforms.u_img_ratio, image.naturalWidth / image.naturalHeight);
      update();
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      image = img;
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(uniforms.u_image_texture, 0);
      resize();
    };
    img.src = imageSrc;

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      params.clickRandomizer = Math.random();
      update();
    };

    const onKeyDown = (e) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      params.effectOn = !params.effectOn;
      update();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    canvas.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);

    engineRef.current = { params, update };

    return () => {
      disposed = true;
      engineRef.current = null;
      observer.disconnect();
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
      if (texture) gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [imageSrc, maxDevicePixelRatio]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    Object.assign(engine.params, {
      distance,
      edgeThickness,
      clickRandomizer,
      effectOn,
    });
    engine.update();
  }, [distance, edgeThickness, clickRandomizer, effectOn]);

  return (
    <div
      ref={rootRef}
      className={`relative h-screen w-full overflow-hidden ${backgroundColor} ${className}`}
    >
      <canvas ref={canvasRef} className="absolute left-0 top-0 block h-full w-full" />

      {showTip ? (
        <div
          className={`pointer-events-none absolute left-1/2 top-[90%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap px-2 py-1 font-mono text-sm ${tipClassName}`}
        >
          {tipText}
        </div>
      ) : null}
    </div>
  );
}