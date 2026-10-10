"use client";

import { useEffect, useRef, useState } from "react";

/**
 * InteractivePhotoGrid Component
 *
 * Props:
 * - maxContainerHeight: string (Maximum display bound constraint)
 * - panelPerspective: number (CSS 3D transform perspective)
 * - gridRotationX: number (Default X tilting index)
 * - gridRotationY: number (Default Y tilting index)
 * - gridRotationZ: number (Default Z twisting layout index)
 * - gridLeftPosition: string (Initial layout offset from left edge)
 * - gridWidth: number (Width of the transform matrix sandbox)
 * - zoomScale: number (Scale multiplier modifier when active)
 */
export default function InteractivePhotoGrid({
  maxContainerHeight = "880px",
  panelPerspective = 800,
  gridRotationX = 15,
  gridRotationY = -15,
  gridRotationZ = 10,
  gridLeftPosition = "75%",
  gridWidth = 1200,
  zoomScale = 1.05,
}) {
  const [isMounted, setIsMounted] = useState(false);

  const mainRef = useRef(null);
  const mainBoxesRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Tracks global cross-handler animation states without causing reactive re-renders
  const stateRef = useRef({
    currentImg: null,
    currentImgProps: { x: 0, y: 0 },
    isZooming: false,
    mouse: { x: 0, y: 0 },
    delayedPlay: null,
    boxTimelines: [],
  });

  useEffect(() => {
    setIsMounted(true);

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
        el.onerror = () => reject(new Error(`Failed to script load: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !mainBoxesRef.current) return;

        const boxes = mainBoxesRef.current.children;
        const timelines = [];

        // Build continuous looped scrolling animation timelines for each column
        for (let i = 0; i < boxes.length; i++) {
          const b = boxes[i];
          const column = Math.floor(i / 4);

          const startY = [-575, 800, 800][column];
          const endY = [800, -575, -575][column];
          const duration = [40, 35, 26][column];

          // Store native configuration variables directly within structural node objects
          gsap.set(b, {
            x: [60, 280, 500][column],
            scale: 0.5,
            zIndex: 1,
          });

          const tl = gsap
            .timeline({ paused: true, repeat: -1 })
            .fromTo(
              b,
              { y: startY, rotation: -0.05 },
              { duration, y: endY, rotation: 0.05, ease: "none" },
            )
            .progress((i % 4) / 4);

          b.localTimeline = tl;
          timelines.push(tl);
        }

        stateRef.current.boxTimelines = timelines;

        // Initialize overall layout configuration scene properties
        gsap.set(mainRef.current, { perspective: panelPerspective });
        gsap.set(boxes, { opacity: 1, cursor: "pointer" });
        gsap.set(mainBoxesRef.current, {
          left: gridLeftPosition,
          xPercent: -50,
          width: gridWidth,
          rotationX: gridRotationX,
          rotationY: gridRotationY,
          rotationZ: gridRotationZ,
        });
        gsap.set(closeBtnRef.current, {
          autoAlpha: 0,
          width: 60,
          height: 60,
          left: -30,
          top: -31,
          pointerEvents: "none",
        });

        // Trigger initialization entry reveal fade
        gsap.fromTo(
          mainRef.current,
          { autoAlpha: 0 },
          {
            duration: 0.6,
            ease: "power2.inOut",
            autoAlpha: 1,
            onStart: () => {
              timelines.forEach((t) => {
                t.play();
                gsap.to(t, {
                  duration: 0.4,
                  timeScale: 1,
                  ease: "sine.in",
                  overwrite: true,
                });
              });
            },
          },
          0.2,
        );

        // Track and compute touch device support profiles
        if ("ontouchstart" in window) {
          stateRef.current.mouse.x = window.innerWidth - 50;
          stateRef.current.mouse.y = 60;
        }
      })
      .catch((err) =>
        console.error("[InteractivePhotoGrid] Setup failed:", err.message),
      );

    return () => {
      // Clear dynamic callbacks when unmounting components
      if (stateRef.current.delayedPlay) stateRef.current.delayedPlay.kill();
      stateRef.current.boxTimelines.forEach((t) => t.kill());
    };
  }, [
    panelPerspective,
    gridLeftPosition,
    gridWidth,
    gridRotationX,
    gridRotationY,
    gridRotationZ,
  ]);

  // Combined action functions executing core canvas transformations
  const playBoxes = () => {
    const { gsap } = window;
    if (!gsap) return;
    stateRef.current.boxTimelines.forEach((tl) => {
      tl.play();
      gsap.to(tl, {
        duration: 0.4,
        timeScale: 1,
        ease: "sine.in",
        overwrite: true,
      });
    });
  };

  const pauseBoxes = (targetBox) => {
    const { gsap } = window;
    if (!gsap || !mainBoxesRef.current) return;
    const targetColumnClass = Array.from(targetBox.classList).find((c) =>
      c.startsWith("pb-col"),
    );

    Array.from(mainBoxesRef.current.children).forEach((b) => {
      if (b.classList.contains(targetColumnClass) && b.localTimeline) {
        gsap.to(b.localTimeline, { timeScale: 0, ease: "sine" });
      }
    });
  };

  const handleMouseEnter = (e) => {
    const { gsap } = window;
    if (!gsap || stateRef.current.currentImg) return;

    if (stateRef.current.delayedPlay) stateRef.current.delayedPlay.kill();

    const target = e.currentTarget;
    pauseBoxes(target);

    gsap.to(mainBoxesRef.current.children, {
      duration: 0.2,
      overwrite: "auto",
      opacity: (i, t) => (t === target ? 1 : 0.33),
    });
    gsap.fromTo(
      target,
      { zIndex: 100 },
      { duration: 0.2, scale: 0.62, overwrite: "auto", ease: "power3" },
    );
  };

  const handleMouseLeave = (e) => {
    const { gsap } = window;
    if (!gsap || stateRef.current.currentImg) return;

    const target = e.currentTarget;

    if (gsap.getProperty(target, "scale") > 0.62) {
      stateRef.current.delayedPlay = gsap.delayedCall(0.3, playBoxes);
    } else {
      playBoxes();
    }

    gsap
      .timeline()
      .set(target, { zIndex: 1 })
      .to(
        target,
        { duration: 0.3, scale: 0.5, overwrite: "auto", ease: "expo" },
        0,
      )
      .to(
        mainBoxesRef.current.children,
        { duration: 0.5, opacity: 1, ease: "power2.inOut" },
        0,
      );
  };

  const handleBoxClick = (e) => {
    const { gsap } = window;
    if (!gsap || stateRef.current.isZooming) return;

    stateRef.current.isZooming = true;
    gsap.delayedCall(0.8, () => {
      stateRef.current.isZooming = false;
    });

    const target = e.currentTarget;

    if (stateRef.current.currentImg) {
      // Zoom out context execution sequence
      gsap
        .timeline({ defaults: { ease: "expo.inOut" } })
        .to(
          closeBtnRef.current,
          { duration: 0.1, autoAlpha: 0, overwrite: true },
          0,
        )
        .to(
          mainBoxesRef.current,
          {
            duration: 0.5,
            scale: 1,
            left: gridLeftPosition,
            width: gridWidth,
            rotationX: gridRotationX,
            rotationY: gridRotationY,
            rotationZ: gridRotationZ,
            overwrite: true,
          },
          0,
        )
        .to(
          mainBoxesRef.current.children,
          { duration: 0.6, opacity: 1, ease: "power4.inOut" },
          0,
        )
        .to(
          stateRef.current.currentImg,
          {
            duration: 0.6,
            width: 400,
            height: 640,
            borderRadius: 20,
            x: stateRef.current.currentImgProps.x,
            y: stateRef.current.currentImgProps.y,
            scale: 0.5,
            rotation: 0,
            zIndex: 1,
          },
          0,
        );

      stateRef.current.currentImg = null;
    } else {
      // Zoom in focal view projection configuration mapping
      pauseBoxes(target);

      stateRef.current.currentImg = target;
      stateRef.current.currentImgProps.x = gsap.getProperty(target, "x");
      stateRef.current.currentImgProps.y = gsap.getProperty(target, "y");

      gsap
        .timeline({ defaults: { duration: 0.6, ease: "expo.inOut" } })
        .set(target, { zIndex: 100 })
        .fromTo(
          closeBtnRef.current,
          {
            x: stateRef.current.mouse.x,
            y: stateRef.current.mouse.y,
            background: "rgba(0,0,0,0)",
          },
          { autoAlpha: 1, duration: 0.3, ease: "power3.inOut" },
          0,
        )
        .to(mainBoxesRef.current.children, { opacity: 0 }, 0)
        .to(
          target,
          {
            width: "100%",
            height: "100%",
            borderRadius: 0,
            x: 0,
            top: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          },
          0,
        )
        .to(
          mainBoxesRef.current,
          {
            duration: 0.5,
            left: "50%",
            width: "100%",
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
          },
          0.15,
        )
        .to(
          mainBoxesRef.current,
          { duration: 5, scale: zoomScale, rotation: 0.05, ease: "none" },
          0.65,
        );
    }
  };

  const handleMouseMove = (e) => {
    const { gsap } = window;
    if (!gsap || "ontouchstart" in window) return;

    // Calculate mouse position bounded to relative offset containers safely
    const bounds = e.currentTarget.getBoundingClientRect();
    stateRef.current.mouse.x = e.clientX - bounds.left;
    stateRef.current.mouse.y = e.clientY - bounds.top;

    if (stateRef.current.currentImg) {
      gsap.to(closeBtnRef.current, {
        duration: 0.1,
        x: stateRef.current.mouse.x,
        y: stateRef.current.mouse.y,
        overwrite: "auto",
      });
    }
  };

  // Safe SSR escape handler
  if (!isMounted) {
    return (
      <div
        className="w-full h-full bg-black"
        style={{ maxHeight: maxContainerHeight }}
      />
    );
  }

  return (
    <div
      ref={mainRef}
      onMouseMove={handleMouseMove}
      className="main absolute w-full h-full overflow-hidden bg-black select-none"
      style={{ maxHeight: maxContainerHeight }}
    >
      {/* Container holding generated columns */}
      <div
        ref={mainBoxesRef}
        className="mainBoxes absolute w-full h-full overflow-hidden bg-black top-0"
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const colIndex = Math.floor(i / 4);
          return (
            <div
              key={i}
              id={`b${i}`}
              className={`photoBox pb-col${colIndex} absolute overflow-hidden w-[400px] h-[640px] rounded-[20px]`}
              style={{
                backgroundImage: `url(https://assets.codepen.io/721952/${i}.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleBoxClick}
            />
          );
        })}
      </div>

      {/* Close Action floating icon overlay layer */}
      <div
        ref={closeBtnRef}
        onClick={handleBoxClick}
        className="mainClose absolute cursor-pointer z-[150]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
        >
          <circle cx="30" cy="30" r="30" fill="#000" opacity="0.4" />
          <path
            d="M15,16L45,46 M45,16L15,46"
            stroke="#000"
            strokeWidth="3.5"
            opacity="0.5"
          />
          <path d="M15,15L45,45 M45,15L15,45" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
