"use client";

import { useEffect, useRef, useState } from "react";

// ─── AeroDeck ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgGradientStart       string    "#000000" Base linear theme canvas start color
// bgGradientEnd         string    "#220033" Ambient backdrop space terminal hex color
// speedWheel            number    0.02      Mousewheel operational inertia increment modifier
// speedDrag             number    -0.1      Tracking calculation dampening vector offset
// customItems           array     [...]     Explicit item dataset objects list configuration
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    id: "01",
    title: "Paris",
    src: "https://media.istockphoto.com/id/949299844/it/foto/vista-prospettica-dellesterno-delledificio-contemporaneo.jpg?s=612x612&w=0&k=20&c=_DR1aRHuTEV3EYBJo1ZXq1pF4SgwB9EVWQLaBj4sC5g=",
  },
  {
    id: "02",
    title: "Warsaw",
    src: "https://media.istockphoto.com/id/1150545984/it/foto/palazzo-moderno-di-lusso-con-piscina.jpg?s=612x612&w=0&k=20&c=Pbrai_VGc9tUviMCF1UaBErdS1YGyIVWsD29jzMZwTY=",
  },
  {
    id: "03",
    title: "Madrid",
    src: "https://media.istockphoto.com/id/1214351345/it/foto/guardando-direttamente-lo-skyline-del-quartiere-finanziario-nel-centro-di-londra-immagine-di.jpg?s=612x612&w=0&k=20&c=oNNbPzPvcQ-4RA6AeatNIxHQIafBiXmDRtUUY0Ska-I=",
  },
  {
    id: "04",
    title: "Sydney",
    src: "https://media.istockphoto.com/id/904390980/it/foto/foto-di-architettura-contemporanea-astratta.jpg?s=612x612&w=0&k=20&c=_P4Wmx5nq5MeDuimpNklKCBlrLovmCyd9lfiMKeJZDs=",
  },
  {
    id: "05",
    title: "Istanbul",
    src: "https://media.istockphoto.com/id/130408311/it/foto/piscina-allesterno-della-casa-moderna-al-crepuscolo.jpg?s=612x612&w=0&k=20&c=ZoVjx7uDjoHKmpM1ayW6UR1SQOoYh_xx-QMG_qeOYs0=",
  },
  {
    id: "06",
    title: "Prague",
    src: "https://media.istockphoto.com/id/1299954175/it/foto/villa-cubica-moderna.jpg?s=612x612&w=0&k=20&c=DhGhb3c1E3DW_fbrWJ_R_Zh0Lbwu6syFeRLsKlZ9no8=",
  },
  {
    id: "07",
    title: "Munich",
    src: "https://media.istockphoto.com/id/926689776/it/foto/vista-ad-angolo-basso-dei-grattacieli-di-new-york.jpg?s=612x612&w=0&k=20&c=DmEB0Ty7ZwDnBoU5SuA8FNevOp4G1UcECw5aS4vA9A8=",
  },
  {
    id: "08",
    title: "Venice",
    src: "https://media.istockphoto.com/id/1191376167/it/foto/villa-dellisola.jpg?s=612x612&w=0&k=20&c=PKslWo4FdbjinohKQlK_oWL34jqAsnzMTdy2bxEAf-I=",
  },
  {
    id: "09",
    title: "Oslo",
    src: "https://media.istockphoto.com/id/184316397/it/foto/londra-edifici-aziendali.jpg?s=612x612&w=0&k=20&c=XqrRxEPzFnwRFk7PQrCiu9-FPfCTPyMe5BKKaxYXCs8=",
  },
  {
    id: "10",
    title: "London",
    src: "https://media.istockphoto.com/id/184619832/it/foto/distretto-finanziario-al-crepuscolo-londra.jpg?s=612x612&w=0&k=20&c=RAThrJOBY6vhlT6-kQpu9-9jLEzWToYfdw46S8B0Mu0=",
  },
];

export default function AeroDeck({
  bgGradientStart = "#000000",
  bgGradientEnd = "#220033",
  speedWheel = 0.02,
  speedDrag = -0.1,
  customItems = DEFAULT_ITEMS,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  // Interaction tracking vectors
  const progressRef = useRef(50);
  const startXRef = useRef(0);
  const isDownRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const mainContainer = containerRef.current;
    const items = mainContainer.querySelectorAll(".carousel-item");
    const cursorElements = mainContainer.querySelectorAll(".cursor-node");

    const getZindex = (arrayLength, activeIndex) => {
      const indexes = [];
      for (let i = 0; i < arrayLength; i++) {
        indexes.push(
          activeIndex === i
            ? arrayLength
            : arrayLength - Math.abs(activeIndex - i),
        );
      }
      return indexes;
    };

    const renderTick = () => {
      // Pin execution arrays inside bounding domains safely
      progressRef.current = Math.max(0, Math.min(progressRef.current, 100));
      const activeIndex = Math.floor(
        (progressRef.current / 100) * (items.length - 1),
      );

      const zIndexMatrix = getZindex(items.length, activeIndex);

      items.forEach((item, index) => {
        const currentZIndex = zIndexMatrix[index];
        const computedActive = (index - activeIndex) / items.length;

        item.style.setProperty("--zIndex", currentZIndex.toString());
        item.style.setProperty("--active", computedActive.toString());

        // Dynamically process visibility filters
        const computedOpacity = (currentZIndex / items.length) * 3 - 2;
        const box = item.querySelector(".carousel-box");
        if (box) {
          box.style.setProperty("--opacity", computedOpacity.toString());
        }
      });
    };

    // Event hooks operations handles
    const onWheel = (e) => {
      const wheelProgress = e.deltaY * parseFloat(speedWheel);
      progressRef.current += wheelProgress;
      renderTick();
    };

    const onMouseDown = (e) => {
      isDownRef.current = true;
      startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    };

    const onMouseMove = (e) => {
      // Synchronize customized context cursor tracking position updates
      if (e.type === "mousemove") {
        cursorElements.forEach((cursor) => {
          cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
      }

      if (!isDownRef.current) return;

      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const mouseProgress =
        (currentX - startXRef.current) * parseFloat(speedDrag);

      progressRef.current += mouseProgress;
      startXRef.current = currentX;
      renderTick();
    };

    const onMouseUp = () => {
      isDownRef.current = false;
    };

    // Card item specific selection click targeting loop logic
    const setupItemClicks = () => {
      items.forEach((item, i) => {
        const handleClick = () => {
          progressRef.current = (i / items.length) * 100 + 10;
          renderTick();
        };
        item.addEventListener("click", handleClick);
        item._cardClick = handleClick;
      });
    };

    // Bind event listeners globally across workspace frames
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onMouseDown, { passive: true });
    window.addEventListener("touchmove", onMouseMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);

    setupItemClicks();
    renderTick(); // Fire initialization configuration sequence setup

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onMouseDown);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);

      items.forEach((item) => {
        if (item._cardClick) {
          item.removeEventListener("click", item._cardClick);
        }
      });
    };
  }, [isMounted, speedWheel, speedDrag, customItems]);

  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-black text-white/20 font-mono text-[10px] flex items-center justify-center opacity-0 select-none">
        Mounting interactive dynamic canvas pipeline tracking parameters...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden relative select-none antialiased"
      style={{
        background: `linear-gradient(135deg, ${bgGradientStart}, ${bgGradientEnd})`,
      }}
    >
      {/* ─── Core Interactive Slider Items Deck ─── */}
      <div className="carousel relative w-full h-screen overflow-hidden pointer-events-none z-10">
        {customItems.map((item, index) => (
          <div
            key={index}
            className="carousel-item absolute top-1/2 left-1/2 rounded-[10px] bg-black select-none pointer-events-auto cursor-pointer overflow-hidden origin-[0%_100%] transition-transform duration-700 ease-[cubic-bezier(0,0.02,0,1)]"
            style={{
              width: "clamp(150px, 30vw, 300px)",
              height: "clamp(200px, 40vw, 400px)",
              marginTop: "calc(clamp(200px, 40vw, 400px) * -0.5)",
              marginLeft: "calc(clamp(150px, 30vw, 300px) * -0.5)",
              zIndex: "var(--zIndex)",
              transform:
                "translate(calc(var(--active) * 800%), calc(var(--active) * 200%)) rotate(calc(var(--active) * 120deg))",
              boxShadow: "0 10px 50px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="carousel-box absolute top-0 left-0 w-full h-full opacity-[var(--opacity)] transition-opacity duration-700 ease-[cubic-bezier(0,0.02,0,1)] z-10 before:content-[''] before:absolute before:inset-0 before:z-10 before:bg-gradient-to-b before:from-black/30 before:via-transparent before:to-black/50">
              <div className="title absolute z-10 text-white bottom-5 left-5 text-[clamp(20px,3vw,30px)] [text-shadow:0_4px_4px_rgba(0,0,0,0.1)] font-serif">
                {item.title}
              </div>
              <div className="num absolute z-10 text-white top-2 left-5 text-[clamp(20px,10vw,80px)] font-bold tracking-tighter opacity-90">
                {item.id}
              </div>
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Custom Interactive Cursor Elements ─── */}
      <div
        className="cursor-node hidden pointer-events-none fixed z-50 top-0 left-0 rounded-full border border-white/20 -mt-5 -ml-5 transition-transform duration-[850ms] ease-[cubic-bezier(0,0.02,0,1)] [@media(pointer:fine)]:block"
        style={{
          "--size": "40px",
          width: "var(--size)",
          height: "var(--size)",
        }}
      />
      <div
        className="cursor-node hidden pointer-events-none fixed z-50 top-0 left-0 rounded-full bg-white/40 -mt-[1px] -ml-[1px] transition-transform duration-700 ease-[cubic-bezier(0,0.02,0,1)] [@media(pointer:fine)]:block"
        style={{ "--size": "2px", width: "var(--size)", height: "var(--size)" }}
      />
    </div>
  );
}
