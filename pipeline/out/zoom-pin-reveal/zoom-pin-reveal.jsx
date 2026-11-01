"use client";

import { useEffect, useRef } from "react";

export default function ZoomPinReveal({
  bgImage = "https://images.unsplash.com/photo-1589848315097-ba7b903cc1cc?q=80&w=1920&auto=format&fit=crop",
  bgSize = "cover",
  bgPosition = "center center",
  foregroundImage = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/alone.png",
  foregroundAlt = "Foreground subject",
  pinEnd = "+=150%",
  scrub = true,
  imgScale = 2,
  imgZ = 350,
  perspective = 500,
  heroScale = 1.1,
  ease = "power1.inOut",
  className = "",
}) {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let ctx;

    const run = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !wrapperRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top top",
              end: pinEnd,
              pin: true,
              scrub,
            },
          })
          .to(imgRef.current, {
            scale: imgScale,
            z: imgZ,
            transformOrigin: "center center",
            ease,
          })
          .to(
            heroRef.current,
            { scale: heroScale, transformOrigin: "center center", ease },
            "<",
          );
      }, wrapperRef.current);
    };

    run();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [pinEnd, scrub, imgScale, imgZ, heroScale, ease]);

  return (
    <div ref={wrapperRef} className={`relative z-[1] w-full ${className}`}>
      <div className="relative z-[1] w-full overflow-hidden">
        <section
          ref={heroRef}
          className="h-screen w-full bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: bgSize,
            backgroundPosition: bgPosition,
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-[2] h-screen w-full overflow-hidden"
        style={{ perspective: `${perspective}px` }}
      >
        <img
          ref={imgRef}
          src={foregroundImage}
          alt={foregroundAlt}
          className="h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}
