"use client";

import { useEffect, useRef } from "react";

const DEFAULT_VERTEX_SHADER = `
precision mediump float;

varying vec2 vUv;
attribute vec2 a_position;

void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const DEFAULT_FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vUv;
uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_blueish;
uniform float u_scale;
uniform float u_illumination;
uniform float u_surface_distortion;
uniform float u_water_distortion;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m*m;
    m = m*m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
}

mat2 rotate2D(float r) {
    return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float surface_noise(vec2 uv, float t, float scale) {
    vec2 n = vec2(.1);
    vec2 N = vec2(.1);
    mat2 m = rotate2D(.5);
    for (int j = 0; j < 10; j++) {
        uv *= m;
        n *= m;
        vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
        n += sin(q);
        N += cos(q) / scale;
        scale *= 1.2;
    }
    return (N.x + N.y + .1);
}

void main() {
    vec2 uv = vUv;
    uv.y = 1. - uv.y;
    uv.x *= u_ratio;

    float t = .002 * u_time;
    vec3 color = vec3(0.);
    float opacity = 0.;

    float outer_noise = snoise((.3 + .1 * sin(t)) * uv + vec2(0., .2 * t));
    vec2 surface_noise_uv = 2. * uv + (outer_noise * .2);

    float surface_noise = surface_noise(surface_noise_uv, t, u_scale);
    surface_noise *= pow(uv.y, .3);
    surface_noise = pow(surface_noise, 2.);

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

    img_uv += (u_water_distortion * outer_noise);
    img_uv += (u_surface_distortion * surface_noise);

    vec4 img = texture2D(u_image_texture, img_uv);
    img *= (1. + u_illumination * surface_noise);

    color += img.rgb;
    color += u_illumination * vec3(1. - u_blueish, 1., 1.) * surface_noise;
    opacity += img.a;

    float edge_width = .02;
    float edge_alpha = smoothstep(0., edge_width, img_uv.x) * smoothstep(1., 1. - edge_width, img_uv.x);
    edge_alpha *= smoothstep(0., edge_width, img_uv.y) * smoothstep(1., 1. - edge_width, img_uv.y);
    color *= edge_alpha;
    opacity *= edge_alpha;

    gl_FragColor = vec4(color, opacity);
}
`;

export default function WaterImageDistortion({
  initialImageSrc = "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=1600&q=80",
  blueish = 0.6,
  scale = 7,
  illumination = 0.15,
  surfaceDistortion = 0.07,
  waterDistortion = 0.03,
  devicePixelRatioCap = 2,
  backgroundColor = "#000000",
  vertexShaderSource = DEFAULT_VERTEX_SHADER,
  fragmentShaderSource = DEFAULT_FRAGMENT_SHADER,
  className = "",
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const uniformsRef = useRef(null);

  useEffect(() => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    if (!gl || !uniforms) return;
    gl.uniform1f(uniforms.u_blueish, blueish);
    gl.uniform1f(uniforms.u_scale, scale);
    gl.uniform1f(uniforms.u_illumination, illumination);
    gl.uniform1f(uniforms.u_surface_distortion, surfaceDistortion);
    gl.uniform1f(uniforms.u_water_distortion, waterDistortion);
  }, [blueish, scale, illumination, surfaceDistortion, waterDistortion]);

  useEffect(() => {
    let destroyed = false;
    let animationFrameId = null;
    let resizeHandler = null;
    let currentImage = null;

    function initShader() {
      const localGl =
        canvasRef.current.getContext("webgl") ||
        canvasRef.current.getContext("experimental-webgl");

      if (!localGl) {
        console.error(
          "[WaterImageDistortion] WebGL is not supported by this browser.",
        );
        return null;
      }

      const createShader = (source, type) => {
        const shader = localGl.createShader(type);
        localGl.shaderSource(shader, source);
        localGl.compileShader(shader);
        if (!localGl.getShaderParameter(shader, localGl.COMPILE_STATUS)) {
          console.error(
            "[WaterImageDistortion] Shader compile error:",
            localGl.getShaderInfoLog(shader),
          );
          localGl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertexShader = createShader(
        vertexShaderSource,
        localGl.VERTEX_SHADER,
      );
      const fragmentShader = createShader(
        fragmentShaderSource,
        localGl.FRAGMENT_SHADER,
      );

      const program = localGl.createProgram();
      localGl.attachShader(program, vertexShader);
      localGl.attachShader(program, fragmentShader);
      localGl.linkProgram(program);
      if (!localGl.getProgramParameter(program, localGl.LINK_STATUS)) {
        console.error(
          "[WaterImageDistortion] Program link error:",
          localGl.getProgramInfoLog(program),
        );
        return null;
      }

      const localUniforms = {};
      const uniformCount = localGl.getProgramParameter(
        program,
        localGl.ACTIVE_UNIFORMS,
      );
      for (let i = 0; i < uniformCount; i++) {
        const name = localGl.getActiveUniform(program, i).name;
        localUniforms[name] = localGl.getUniformLocation(program, name);
      }

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const vertexBuffer = localGl.createBuffer();
      localGl.bindBuffer(localGl.ARRAY_BUFFER, vertexBuffer);
      localGl.bufferData(localGl.ARRAY_BUFFER, vertices, localGl.STATIC_DRAW);

      localGl.useProgram(program);

      const positionLocation = localGl.getAttribLocation(program, "a_position");
      localGl.enableVertexAttribArray(positionLocation);
      localGl.bindBuffer(localGl.ARRAY_BUFFER, vertexBuffer);
      localGl.vertexAttribPointer(
        positionLocation,
        2,
        localGl.FLOAT,
        false,
        0,
        0,
      );

      uniformsRef.current = localUniforms;
      return localGl;
    }

    function resizeCanvas() {
      const gl = glRef.current;
      const uniforms = uniformsRef.current;
      if (!currentImage || !gl || !uniforms) return;
      const devicePixelRatio = Math.min(
        window.devicePixelRatio,
        devicePixelRatioCap,
      );
      const imgRatio = currentImage.naturalWidth / currentImage.naturalHeight;
      canvasRef.current.width = window.innerWidth * devicePixelRatio;
      canvasRef.current.height = window.innerHeight * devicePixelRatio;
      gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
      gl.uniform1f(
        uniforms.u_ratio,
        canvasRef.current.width / canvasRef.current.height,
      );
      gl.uniform1f(uniforms.u_img_ratio, imgRatio);
    }

    function loadImage(src) {
      const gl = glRef.current;
      const uniforms = uniformsRef.current;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = src;
      image.onload = () => {
        if (destroyed) return;
        currentImage = image;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
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
          image,
        );
        gl.uniform1i(uniforms.u_image_texture, 0);
        resizeCanvas();
      };
    }

    function render() {
      if (destroyed || !glRef.current) return;
      glRef.current.uniform1f(uniformsRef.current.u_time, performance.now());
      glRef.current.drawArrays(glRef.current.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    const gl = initShader();
    if (!gl) return;
    glRef.current = gl;

    gl.uniform1f(uniformsRef.current.u_blueish, blueish);
    gl.uniform1f(uniformsRef.current.u_scale, scale);
    gl.uniform1f(uniformsRef.current.u_illumination, illumination);
    gl.uniform1f(uniformsRef.current.u_surface_distortion, surfaceDistortion);
    gl.uniform1f(uniformsRef.current.u_water_distortion, waterDistortion);

    loadImage(initialImageSrc);
    render();

    resizeHandler = () => resizeCanvas();
    window.addEventListener("resize", resizeHandler);

    return () => {
      destroyed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      glRef.current = null;
      uniformsRef.current = null;
    };

  }, [
    initialImageSrc,
    devicePixelRatioCap,
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full" />
    </div>
  );
}
