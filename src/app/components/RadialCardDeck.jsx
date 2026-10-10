"use client";

import { useEffect, useId, useRef } from "react";

// ─── RadialCardDeck ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images           array    (18 demo posters)   Array of image src strings — one card per image
// bgColor          string   #fff            Page background
// cardBorderColor  string   #000            Card border color
// cardBorderWidth  number   10              Card border width (px)
// cardRadius       number   17              Card corner radius (px)
// grayscale        boolean  true            Whether card images render in grayscale
// cardWidth        number   430             Card width (px) on tall viewports
// cardHeight       number   610             Card height (px) on tall viewports
// cardWidthMd      number   350             Card width (px) when viewport height ≤ 1000px
// cardHeightMd     number   497             Card height (px) when viewport height ≤ 1000px
// cardWidthSm      number   300             Card width (px) when viewport height ≤ 800px
// cardHeightSm     number   400             Card height (px) when viewport height ≤ 800px
// originDistanceVh number   200             Shared rotation transform-origin distance (vh) below center
// entranceDuration number   1               Duration (s) of each card's fly-in tween
// entranceEase     string   "power4.out"    Ease for the fly-in tween
// settleEase       string   "power1.out"    Ease for the settle-into-circle rotation tween
// staggerStep      number   0.15            Delay (s) multiplier applied per pair of cards during entrance
// draggable        boolean  true            Whether the deck can be spun by dragging (uses GSAP Draggable)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://www.themoviedb.org/t/p/original/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg",
  "https://www.themoviedb.org/t/p/original/aWh8R6jeAbmiB4TsF6CjYFrUsI8.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/3Tf8vXykYhzHdT0BtsYTp570JGQ.jpg",
  "https://www.themoviedb.org/t/p/original/zxVEkxgreRkFkh1rBK85T2JyxFY.jpg",
  "https://www.themoviedb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
  "https://www.themoviedb.org/t/p/original/vKEBse3BPU7crfAjdPNaC6WePnO.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/mfnkSeeVOBVheuyn2lo4tfmOPQb.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/bCj4EfuehAlgBwVd3diyWyhuuau.jpg",
  "https://www.themoviedb.org/t/p/original/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg",
  "https://www.themoviedb.org/t/p/original/aWh8R6jeAbmiB4TsF6CjYFrUsI8.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/3Tf8vXykYhzHdT0BtsYTp570JGQ.jpg",
  "https://www.themoviedb.org/t/p/original/zxVEkxgreRkFkh1rBK85T2JyxFY.jpg",
  "https://www.themoviedb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
  "https://www.themoviedb.org/t/p/original/vKEBse3BPU7crfAjdPNaC6WePnO.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/mfnkSeeVOBVheuyn2lo4tfmOPQb.jpg",
  "https://www.themoviedb.org/t/p/w220_and_h330_face/bCj4EfuehAlgBwVd3diyWyhuuau.jpg",
];

export default function RadialCardDeck({
  images = DEFAULT_IMAGES,
  bgColor = "#fff",
  cardBorderColor = "#000",
  cardBorderWidth = 10,
  cardRadius = 17,
  grayscale = true,
  cardWidth = 430,
  cardHeight = 610,
  cardWidthMd = 350,
  cardHeightMd = 497,
  cardWidthSm = 300,
  cardHeightSm = 400,
  originDistanceVh = 200,
  entranceDuration = 1,
  entranceEase = "power4.out",
  settleEase = "power1.out",
  staggerStep = 0.15,
  draggable = true,
}) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, "");
  const itemsRef = useRef(null);
  const draggableInstanceRef = useRef(null);

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

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js",
      ),
    ])
      .then(() => {
        const { gsap, Draggable } = window;
        const itemsEl = itemsRef.current;
        if (!gsap || !itemsEl) return;

        gsap.config({ trialWarn: false });
        if (Draggable) gsap.registerPlugin(Draggable);

        const items = gsap.utils.toArray(
          itemsEl.querySelectorAll(`.item-${uid}`),
        );
        const imageSize = items.length;
        const total = items.length;
        const degree = 360 / total;

        const timeline = gsap.timeline();
        items.forEach((image, index) => {
          const sign = Math.floor((index / 2) % 2) ? 1 : -1;
          const value = Math.floor((index + 4) / 4) * 4;
          const rotation = index > imageSize - 3 ? 0 : sign * value;

          gsap.set(image, { rotation, scale: 0.5 });

          timeline.from(
            image,
            {
              x: () =>
                index % 2
                  ? window.innerWidth + image.clientWidth * 4
                  : -window.innerWidth - image.clientWidth * 4,
              y: () => window.innerHeight - image.clientHeight,
              rotation: index % 2 ? 200 : -200,
              scale: 4,
              opacity: 1,
              ease: entranceEase,
              duration: entranceDuration,
              delay: staggerStep * Math.floor(index / 2),
            },
            0,
          );

          const rotationAngle = index * degree;
          const settleTime = staggerStep * (imageSize / 2 - 1) + 1;

          timeline.to(image, { scale: 1, duration: 0 }, settleTime);
          timeline.to(
            image,
            {
              transformOrigin: `center ${originDistanceVh}vh`,
              rotation:
                index > imageSize / 2
                  ? -degree * (imageSize - index)
                  : rotationAngle,
              duration: 1,
              ease: settleEase,
            },
            settleTime,
          );
        });

        if (draggable && Draggable) {
          let start = 0;
          const [instance] = Draggable.create(itemsEl, {
            type: "rotation",
            onDragStart: function () {
              start = this.rotation;
            },
            onDragEnd: function () {
              const rotation = this.rotation;
              const offset = Math.abs(rotation - start);
              if (rotation > start) {
                if (rotation - start < degree / 2) {
                  gsap.to(itemsEl, { rotation: `-=${offset}` });
                } else {
                  gsap.to(itemsEl, { rotation: `+=${2 * degree - offset}` });
                }
              } else {
                if (Math.abs(rotation - start) < degree / 2) {
                  gsap.to(itemsEl, { rotation: `+=${offset}` });
                } else {
                  gsap.to(itemsEl, { rotation: `-=${2 * degree - offset}` });
                }
              }
            },
          });
          draggableInstanceRef.current = instance;
        }
      })
      .catch((e) =>
        console.error("[RadialCardDeck] GSAP load failed:", e.message),
      );

    return () => {
      if (draggableInstanceRef.current) draggableInstanceRef.current.kill();
    };
  }, [
    uid,
    originDistanceVh,
    entranceDuration,
    entranceEase,
    settleEase,
    staggerStep,
    draggable,
  ]);

  const cardCss =
    `.card-${uid} { width: ${cardWidth}px; height: ${cardHeight}px; border-width: ${cardBorderWidth}px; border-color: ${cardBorderColor}; border-radius: ${cardRadius}px; }` +
    `.image-${uid} { filter: ${grayscale ? "grayscale(100%)" : "none"}; }` +
    `@media screen and (max-height: 1000px) { .card-${uid} { width: ${cardWidthMd}px; height: ${cardHeightMd}px; } }` +
    `@media screen and (max-height: 800px) { .card-${uid} { width: ${cardWidthSm}px; height: ${cardHeightSm}px; } }`;

  return (
    <div
      className="relative h-screen w-screen select-none overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: cardCss }} />

      <div
        className="absolute left-1/2 h-screen -translate-x-1/2 select-none"
        style={{ top: "28%" }}
      >
        <div
          ref={itemsRef}
          className="flex select-none"
          style={{
            transformOrigin: `center ${originDistanceVh}vh`,
            transform: "rotate(0deg)",
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className={`item-${uid} absolute -translate-x-1/2 select-none cursor-pointer`}
            >
              <div
                className={`card-${uid} relative block overflow-hidden text-white`}
                style={{ cursor: "grab" }}
              >
                <img
                  src={src}
                  alt=""
                  className={`image-${uid} pointer-events-none absolute left-0 top-0 h-full w-full object-cover`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
