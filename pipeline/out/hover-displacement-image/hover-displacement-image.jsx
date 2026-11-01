"use client";

import { useEffect, useRef } from "react";
import { Curtains, Plane } from "curtainsjs";
import { gsap } from "gsap";

const VERTEX_SHADER = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat4 texture0Matrix;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  void main() {
      vec3 vertexPosition = aVertexPosition;
      gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
      vTextureCoord = (texture0Matrix * vec4(aTextureCoord, 0., 1.)).xy;
      vVertexPosition = vertexPosition;
  }
`;
const FRAGMENT_SHADER = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define PI2 6.28318530718
  #define PI 3.14159265359
  #define S(a,b,n) smoothstep(a,b,n)

  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uReso;
  uniform vec2 uMouse;
  
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D texture0;

  float exponentialEasing (float x, float a){
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    a = max(min_param_a, min(max_param_a, a));

    if (a < 0.5){
      a = 2.0 * a;
      float y = pow(x, a);
      return y;
    } else {
      a = 2.0 * (a-0.5);
      float y = pow(x, 1.0 / (1.-a));
      return y;
    }
  }

  void main(){
      vec2 uv = vTextureCoord;
      float progress = uProgress;
     
      float d = exponentialEasing(length( uv - .5 ), progress) - 1.0 + progress * 0.75; 

      vec2 centerInterp = (uv - 0.5) * d;
    
      vec2 r = centerInterp * (progress * 0.6 + 0.4) + uv;
      vec2 g = centerInterp * (progress * 0.9 + 0.1) + uv;
      vec2 b = centerInterp * (progress * 0.9 + 0.1) + uv;
    
      vec4 color = vec4( texture2D( texture0, r).r , texture2D( texture0, g ).g, texture2D( texture0, b).b , 1.); 

      gl_FragColor = color;         
  }
`;

export default function HoverDisplacementImage({
  imageUrl = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb",
  imageAlt = "Image with displacement hover effect",
  maxPlaneWidth = "320px",
  hoverDuration = 1.0,
  hoverEase = "expo.inOut",
  backgroundColor = "#1d1e22",
  className = "",
}) {
  const canvasRef = useRef(null);
  const planeRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !planeRef.current) return;

    const curtainsInstance = new Curtains({
      container: canvasRef.current,
    });

    const shaderParams = {
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        time: { name: "uTime", type: "1f", value: 0 },
        mousepos: { name: "uMouse", type: "2f", value: [0, 0] },
        resolution: {
          name: "uReso",
          type: "2f",
          value: [window.innerWidth, window.innerHeight],
        },
        progress: { name: "uProgress", type: "1f", value: 0 },
      },
    };

    const planeMesh = new Plane(
      curtainsInstance,
      planeRef.current,
      shaderParams,
    );

    planeMesh.onReady(() => {
      planeMesh.onRender(() => {
        planeMesh.uniforms.time.value += 0.01;
        planeMesh.uniforms.resolution.value = [
          window.innerWidth,
          window.innerHeight,
        ];
      });
    });

    const animateTo = (value) => {
      gsap.to(planeMesh.uniforms.progress, {
        value,
        duration: hoverDuration,
        ease: hoverEase,
      });
    };
    const handleEnter = () => animateTo(1);
    const handleLeave = () => animateTo(0);

    const currentPlane = planeRef.current;
    currentPlane.addEventListener("mouseenter", handleEnter);
    currentPlane.addEventListener("mouseleave", handleLeave);
    currentPlane.addEventListener("touchstart", handleEnter, { passive: true });
    currentPlane.addEventListener("touchend", handleLeave);

    return () => {
      currentPlane.removeEventListener("mouseenter", handleEnter);
      currentPlane.removeEventListener("mouseleave", handleLeave);
      currentPlane.removeEventListener("touchstart", handleEnter);
      currentPlane.removeEventListener("touchend", handleLeave);
      gsap.killTweensOf(planeMesh.uniforms.progress);
      curtainsInstance.dispose();
    };
  }, [hoverDuration, hoverEase]);

  return (
    <div
      style={{ backgroundColor }}
      className={`relative w-full h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      <div ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div
        ref={planeRef}
        style={{ maxWidth: maxPlaneWidth }}
        className="relative z-[100] w-full h-[calc(50vw+180px)] sm:h-[70vh]"
      >
        <img
          data-sampler="texture0"
          src={imageUrl}
          crossOrigin="anonymous"
          alt={imageAlt}
          className="hidden"
        />
      </div>
    </div>
  );
}
