"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function CircularStackIntro({
  images = DEFAULT_IMAGES,
  title = ["Celestial", "Visions"],
  subtitle = "2024",
  bgInner = "#ece6df",
  bgOuter = "#8b8078",
  titleColor = "#191818",
  fontFamily = "Gloock, ui-serif, Georgia, serif",
  desktopRadius = 250,
  mobileRadius = 180,
  breakpoint = "53em",
  cardWidth = "6em",
  cardWidthMobile = "5em",
  cardAspect = "2/3",
  cardRadius = "5px",
  startAngle = -45,
  staggerDelay = 0.15,
  entranceDuration = 1,
  unwindRotation = -450,
  unwindDuration = 3,
  headingDelay = 1,
  headingBlur = 60,
  spinDuration = 20,
  spinDirection = -1,
  flipInterval = 2,
  flipEnabled = true,
  perspective = "1000px",
  className = "",
}) {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const groupRef = useRef(null);
  const headingsRef = useRef(null);
  const rawId = useId();
  const uid = "csi-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let mm = null;
    let cancelled = false;

    const preload = () =>
      Promise.all(
        images.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = src;
            }),
        ),
      );

    Promise.all([import("gsap"), preload()])
      .then(([mod]) => {
        const gsap = mod.gsap || mod.default;
        if (cancelled || !gsap || !groupRef.current) return;

        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        const cardList = gsap.utils.toArray(
          groupRef.current.querySelectorAll("[data-card]"),
        );
        const count = cardList.length;
        if (!count) return;

        const sliceAngle = (2 * Math.PI) / count;
        const offset = (startAngle * Math.PI) / 180;

        const posX = (radius) => (index) =>
          Math.round(radius * Math.cos(sliceAngle * index + offset));
        const posY = (radius) => (index) =>
          Math.round(radius * Math.sin(sliceAngle * index + offset));
        const spin = (index) => (index + 1) * (360 / count);

        gsap.set(rootRef.current, { autoAlpha: 1 });

        mm = gsap.matchMedia();
        mm.add(
          {
            isDesktop: "(min-width: " + breakpoint + ")",
            isMobile: "(max-width: " + breakpoint + ")",
          },
          (context) => {
            const { isDesktop } = context.conditions;
            const radius = isDesktop ? desktopRadius : mobileRadius;

            gsap.set(cardList, {
              x: posX(radius),
              y: posY(radius),
              rotation: spin,
            });

            if (reduced) {
              gsap.set(cardList, { opacity: 1, scale: 1 });
              gsap.set(headingsRef.current, { opacity: 1, filter: "none" });
              return () => {};
            }

            const timeline = gsap
              .timeline()
              .set(cardList, { opacity: 0, scale: 0, x: 0, y: 0 })
              .to(cardList, {
                stagger: staggerDelay,
                opacity: 1,
                scale: 1,
                duration: entranceDuration,
                x: posX(radius),
                y: posY(radius),
                rotation: spin,
              })
              .to(
                groupRef.current,
                {
                  rotation: unwindRotation,
                  duration: unwindDuration,
                  ease: "power4.out",
                },
                0,
              )
              .from(
                headingsRef.current,
                {
                  opacity: 0,
                  filter: "blur(" + headingBlur + "px)",
                  duration: 1,
                },
                headingDelay,
              )
              .to(
                containerRef.current,
                {
                  rotation: spinDirection >= 0 ? "+=360" : "-=360",
                  duration: spinDuration,
                  ease: "none",
                  repeat: -1,
                },
                0,
              );

            if (flipEnabled) {
              timeline.to(cardList, {
                repeat: -1,
                duration: flipInterval,
                onRepeat: () => {
                  gsap.to(cardList[Math.floor(Math.random() * count)], {
                    rotateY: "+=180",
                  });
                },
              });
            }

            return () => {
              timeline.kill();
            };
          },
        );
      })
      .catch((e) =>
        console.error("[CircularStackIntro] init failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (mm) mm.revert();
    };
  }, [
    images,
    desktopRadius,
    mobileRadius,
    breakpoint,
    startAngle,
    staggerDelay,
    entranceDuration,
    unwindRotation,
    unwindDuration,
    headingDelay,
    headingBlur,
    spinDuration,
    spinDirection,
    flipInterval,
    flipEnabled,
  ]);

  const scopedCss =
    "#" +
    uid +
    " [data-card-img]{width:" +
    cardWidthMobile +
    ";}" +
    "@media (min-width:" +
    breakpoint +
    "){#" +
    uid +
    " [data-card-img]{width:" +
    cardWidth +
    ";}}";

  return (
    <div
      id={uid}
      ref={rootRef}
      className={
        "relative w-full h-screen overflow-hidden invisible " + className
      }
      style={{
        background:
          "radial-gradient(circle, " + bgInner + " 0%, " + bgOuter + " 100%)",
      }}
    >
      <style>{scopedCss}</style>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ perspective }}
      >
        <div ref={containerRef} className="relative">
          <div ref={groupRef} className="relative">
            {images.map((src, i) => (
              <div
                key={i}
                data-card
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  data-card-img
                  className="bg-center bg-cover"
                  style={{
                    aspectRatio: cardAspect,
                    borderRadius: cardRadius,
                    backgroundImage: "url(" + src + ")",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={headingsRef}
          className="relative z-10 text-center uppercase"
          style={{ color: titleColor, fontFamily }}
        >
          {title.map((line, i) => (
            <h1
              key={i}
              className="m-0 font-normal"
              style={{
                lineHeight: 0.5,
                fontSize: "clamp(2.5rem, 1.59rem + 3.883vw, 6.25rem)",
                marginBottom: "1.25rem",
              }}
            >
              {line}
            </h1>
          ))}
          {subtitle ? (
            <h5
              className="m-0 font-normal"
              style={{
                lineHeight: 0.5,
                fontSize: "clamp(1rem, 0.757rem + 1.036vw, 2rem)",
              }}
            >
              {subtitle}
            </h5>
          ) : null}
        </div>
      </div>
    </div>
  );
}
