"use client";

import { useEffect, useRef, useId } from "react";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1782612920864-30b1004aadd4?auto=format&fit=crop&w=720&q=80",
    alt: "Seealpsee alpine lake, Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1782849324101-3ae636a0e270?auto=format&fit=crop&w=720&q=80",
    alt: "K2 summit under clear sky",
  },
  {
    src: "https://images.unsplash.com/photo-1782241594398-c2ee2080602b?auto=format&fit=crop&w=720&q=80",
    alt: "Snow-covered alpine peak",
  },
  {
    src: "https://images.unsplash.com/photo-1763562898020-85fe1312ad88?auto=format&fit=crop&w=720&q=80",
    alt: "Aoraki Mount Cook, New Zealand",
  },
  {
    src: "https://images.unsplash.com/photo-1776890880095-c12b026d86b3?auto=format&fit=crop&w=720&q=80",
    alt: "Mount Everest ridgeline",
  },
  {
    src: "https://images.unsplash.com/photo-1782241594334-42fcca7cd3e0?auto=format&fit=crop&w=720&q=80",
    alt: "Golden sunrise over a foggy mountain range",
  },
  {
    src: "https://images.unsplash.com/photo-1782221983682-a0ed45880a68?auto=format&fit=crop&w=720&q=80",
    alt: "Mountains and tree range at golden hour",
  },
  {
    src: "https://images.unsplash.com/photo-1782315363391-bff53f732e11?auto=format&fit=crop&w=720&q=80",
    alt: "Aerial view of a valley surrounded by mountains",
  }
];

export default function MouseTrailDrop({
  images = DEFAULT_IMAGES,
  bgColor = "#121212",
  titleLine1 = "Move your mouse to make",
  titleLine2 = "images fall and bounce",
  titleColor = "#F1F1F1",
  subTitleColor = "#999999",
  imageSizeDesktop = "15vw",
  imageSizeMobile = "35vw",
  imageRadius = "4%",
  resetDivisorDesktop = 8,
  resetDivisorTouch = 6,
  bottomExclusion = 200,
  spawnEase = "elastic.out(2, 0.6)",
  fallEase = "back.in(1.1)",
  bounceEase = "power1.in",
  popDuration = 0.4,
  bounceDuration = 0.3,
  zIndexImage = 5,
  className = "",
}) {
  const rootRef = useRef(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;
    let cleanupFns = [];

    import("gsap")
      .then(({ gsap }) => {
        if (cancelled) return;
        const root = rootRef.current;
        if (!gsap || !root) return;

        const srcs = images.map((img) => img.src);
        let incr = 0;
        let oldIncrX = 0;
        let oldIncrY = 0;
        let firstMove = true;
        let indexImg = 0;

        const isCoarsePointer = window.matchMedia("(hover: none)").matches;
        const resetDist =
          window.innerWidth /
          (isCoarsePointer ? resetDivisorTouch : resetDivisorDesktop);

        const clampX = gsap.utils.clamp(0, window.innerWidth);
        const clampY = gsap.utils.clamp(0, window.innerHeight);

        function applyMove(clientX, clientY) {
          const valX = clampX(clientX);
          const valY = clampY(clientY);

          if (firstMove) {
            firstMove = false;
            oldIncrX = valX;
            oldIncrY = valY;
            return;
          }

          incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);

          if (incr > resetDist) {
            incr = 0;
            createMedia(
              valX,
              valY - root.getBoundingClientRect().top,
              valX - oldIncrX,
              valY - oldIncrY,
            );
          }

          oldIncrX = valX;
          oldIncrY = valY;
        }

        function handleMouseMove(e) {
          applyMove(e.clientX, e.clientY);
        }

        function handleTouchMove(e) {
          if (!e.touches || !e.touches[0]) return;
          applyMove(e.touches[0].clientX, e.touches[0].clientY);
        }

        function createMedia(x, y, deltaX, deltaY) {
          const H = window.innerHeight;
          if (y > H - bottomExclusion) return;

          const image = document.createElement("img");
          image.setAttribute("src", srcs[indexImg]);
          image.setAttribute("alt", "");
          image.className = `mtg-spawn-${uid}`;
          root.appendChild(image);

          const tl = gsap.timeline({
            onComplete: () => {
              if (image.parentNode === root) root.removeChild(image);
              tl.kill();
            },
          });

          tl.fromTo(
            image,
            {
              xPercent: -50 + (Math.random() - 0.5) * 80,
              yPercent: -50 + (Math.random() - 0.5) * 10,
              scaleX: 1.3,
              scaleY: 1.3,
              rotation: (Math.random() - 0.5) * 20,
            },
            {
              scaleX: 1,
              scaleY: 1,
              ease: spawnEase,
              duration: popDuration,
            },
          );

          tl.fromTo(
            image,
            { x },
            {
              x: "+=" + deltaX * 2,
              rotation: 0,
              ease: "power1.in",
              duration: popDuration,
            },
            "<",
          );

          tl.fromTo(
            image,
            { y },
            {
              y: "+=" + (H - y),
              scale: 0.9,
              yPercent: -95,
              ease: fallEase,
              duration: popDuration,
            },
            "<",
          );

          tl.to(image, {
            x: "+=" + deltaX * 1.6,
            rotation: (Math.random() - 0.5) * 40,
            ease: bounceEase,
            duration: bounceDuration,
          });

          tl.to(
            image,
            {
              yPercent: 150,
              ease: "back.in(" + (1.5 + (1 - y / H)) + ")",
              duration: bounceDuration,
            },
            "<",
          );

          indexImg = (indexImg + 1) % srcs.length;
        }

        root.addEventListener("mousemove", handleMouseMove);
        root.addEventListener("touchstart", handleTouchMove, { passive: true });
        root.addEventListener("touchmove", handleTouchMove, { passive: true });

        cleanupFns.push(() => {
          root.removeEventListener("mousemove", handleMouseMove);
          root.removeEventListener("touchstart", handleTouchMove, {
            passive: true,
          });
          root.removeEventListener("touchmove", handleTouchMove, {
            passive: true,
          });
          root
            .querySelectorAll(`.mtg-spawn-${uid}`)
            .forEach((node) => node.remove());
        });
      })
    ;

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [
    images,
    resetDivisorDesktop,
    resetDivisorTouch,
    bottomExclusion,
    spawnEase,
    fallEase,
    bounceEase,
    popDuration,
    bounceDuration,
    uid,
  ]);

  return (
    <section
      ref={rootRef}
      className={`relative h-dvh w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .mtg-spawn-${uid} {
              position: absolute;
              width: ${imageSizeDesktop};
              height: ${imageSizeDesktop};
              object-fit: cover;
              border-radius: ${imageRadius};
              z-index: ${zIndexImage};
              pointer-events: none;
            }
            @media (max-width: 768px) {
              .mtg-spawn-${uid} {
                width: ${imageSizeMobile};
                height: ${imageSizeMobile};
              }
            }
          `,
        }}
      />

      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center [font-size:min(60px,5.6vw)] tracking-[-0.03em] font-medium leading-[1.3]">
        <span className="block w-max" style={{ color: titleColor }}>
          {titleLine1}
        </span>
        <span className="block w-max" style={{ color: subTitleColor }}>
          {titleLine2}
        </span>
      </p>
    </section>
  );
}
