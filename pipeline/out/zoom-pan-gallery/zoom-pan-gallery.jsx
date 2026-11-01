"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1625041083884-c4293dc93fbb?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1625041083904-7a27ded23406?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1614247262098-76459e80e152?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1588260693059-2631306cc8b4?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1588260540782-445cfdd2dad7?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1588260405938-978e6dfdcb82?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1588260275819-27c6226610b0?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1588260115080-6e0a98cfaee7?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1586536528489-73f38bbdfb84?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1584728092269-1c2b76cd26ac?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1581593168755-c592b70b2538?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1579168133409-34acb719c8b6?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1575994999937-4511cd095548?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1625041188458-aebddbaedfd1?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1625041153191-8032ff14b6a6?auto=format&fit=crop&w=1280&h=800&q=60",
  "https://images.unsplash.com/photo-1588260275894-4f51cc4c12b1?auto=format&fit=crop&w=1280&h=800&q=60",
];

const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

export default function ZoomPanGallery({
  images = DEFAULT_IMAGES,
  gridSize = 4,
  initialIndex = 5,
  bgColor = "#111",
  cellBg = "#ffffff",
  cellOpacity = 0.25,
  cellRadius = "2rem",
  cellGap = "2rem",
  mapSize = "8rem",
  mapBg = "rgba(34,34,34,0.1)",
  mapBlur = "5px",
  mapMargin = "2rem",
  showMap = true,
  showZoom = true,
  showBack = true,
  showCrosshair = true,
  minZoom = 0.375,
  maxZoom = 0.75,
  zoomStep = 0.041666666666666664,
  backLabel = "close",
  backBg = "rgba(14,13,13,0.4)",
  backBlur = "5px",
  crosshairColor = "#ffffff",
  crosshairSize = "2rem",
  focusBorder = "2px solid whitesmoke",
  easeInOut = "cubic-bezier(0.65,0,0.35,1)",
  easeIn = "cubic-bezier(0.32,0,0.67,0)",
  easeOut = "cubic-bezier(0.33,1,0.68,1)",
  transitionSpeed = 0.9,
  zoomTransSpeed = 1,
  altPrefix = "Art id",
  expandLabel = "expand image",
  zoomLabel = "zoom",
  className = "",
  onSelect,
  onOpen,
}) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(minZoom);
  const [transitioning, setTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const loadedCount = useRef(0);

  const total = gridSize * gridSize;
  const cells = images.slice(0, total);

  const coords = {
    x: selectedIndex % gridSize,
    y: Math.floor(selectedIndex / gridSize),
  };

  const translateX = `calc((-100vw * ${coords.x}) - (${cellGap} * ${coords.x}))`;
  const translateY = `calc((-100vh * ${coords.y}) - (${cellGap} * ${coords.y}))`;

  useEffect(() => {
    cells.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "";
      img.onload = () => {
        loadedCount.current += 1;
        setLoadedImages((prev) => ({ ...prev, [i]: src }));
        if (loadedCount.current === cells.length) {
          setTimeout(() => {
            setIsLoading(false);
            setIsLoaded(true);
          }, 1000);
        }
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyboard = (ev) => {
      if (transitioning) return;
      const keyMap = {
        37: "left",
        39: "right",
        38: "up",
        40: "down",
        13: "enter",
      };
      if (!keyMap[ev.keyCode]) return;
      ev.preventDefault();
      if (ev.keyCode === 13) {
        toggleOpen();
        return;
      }
      let x = coords.x,
        y = coords.y;
      if (ev.keyCode === 37) x--;
      if (ev.keyCode === 39) x++;
      if (ev.keyCode === 38) y--;
      if (ev.keyCode === 40) y++;
      x = clamp(x, 0, gridSize - 1);
      y = clamp(y, 0, gridSize - 1);
      selectCell(y * gridSize + x);
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [transitioning, selectedIndex, isOpen]);

  useEffect(() => {
    let scale = zoom;
    const handleWheel = (ev) => {
      if (transitioning) return;
      scale = clamp(scale + ev.deltaY * -0.1, minZoom, maxZoom);
      setZoom(scale);
    };
    document.addEventListener("wheel", handleWheel);
    return () => document.removeEventListener("wheel", handleWheel);
  }, [transitioning, minZoom, maxZoom]);

  const selectCell = useCallback(
    (i) => {
      if (transitioning || i === selectedIndex) return;
      setSelectedIndex(i);
      onSelect?.(i);
    },
    [transitioning, selectedIndex, onSelect],
  );

  const toggleOpen = useCallback(() => {
    if (transitioning) return;
    setIsOpen((prev) => {
      const next = !prev;
      onOpen?.(selectedIndex, next);
      return next;
    });
  }, [transitioning, selectedIndex, onOpen]);

  const handleCanvasClick = (ev, i) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (transitioning || i === selectedIndex) return;
    selectCell(i);
  };

  const handleMapClick = (ev, i) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (transitioning) return;
    selectCell(i);
  };

  const viewportScale = isOpen ? 1 : zoom;

  return (
    <div
      className={`w-screen h-screen overflow-hidden relative select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={viewportRef}
        className="absolute inset-0 w-screen h-screen origin-center z-[4] bg-transparent"
        style={{
          transform: `scale3d(${viewportScale},${viewportScale},1)`,
          transition: `transform ${zoomTransSpeed}s ${easeInOut}, opacity 0.9s ${easeIn} 0.1s`,
          opacity: isLoaded ? 1 : 0,
        }}
        onTransitionStart={() => {
          setTransitioning(true);
          setIsPanning(true);
        }}
        onTransitionEnd={() => {
          setTransitioning(false);
          setIsPanning(false);
        }}
      >
        <div
          ref={canvasRef}
          className="absolute origin-top-left z-[5] w-fit"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, 100vw)`,
            gap: cellGap,
            transform: `translate3d(${translateX},${translateY},0)`,
            transition: `transform ${transitionSpeed}s ${easeInOut}`,
            willChange: isPanning ? "transform" : "auto",
          }}
          onTransitionStart={() => {
            setTransitioning(true);
            setIsPanning(true);
          }}
          onTransitionEnd={() => {
            setTransitioning(false);
            setIsPanning(false);
          }}
        >
          {cells.map((_, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={i}
                className="relative overflow-hidden w-screen h-screen cursor-pointer"
                style={{
                  borderRadius: cellRadius,
                  backgroundColor: cellBg,
                  opacity: isSelected ? 1 : cellOpacity,
                  transition: `opacity 0.6s ${easeInOut}`,
                  pointerEvents: isSelected ? "none" : "auto",
                }}
                onClick={(ev) => handleCanvasClick(ev, i)}
              >
                {loadedImages[i] && (
                  <img
                    src={loadedImages[i]}
                    alt={`${altPrefix} ${i}`}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none outline-none"
                    style={{
                      transform:
                        isOpen && isSelected
                          ? "scale3d(1,1,1)"
                          : "scale3d(2,2,2)",
                      transition: `transform ${zoomTransSpeed}s ${easeInOut}`,
                      willChange: "transform",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute inset-0 flex pointer-events-none z-[6]">
        <button
          className="m-auto overflow-hidden pointer-events-auto w-full h-full bg-transparent"
          aria-label={expandLabel}
          style={{
            transform: `scale(${minZoom})`,
            borderRadius: cellRadius,
            border: focusBorder,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            cursor: isOpen ? "zoom-out" : "zoom-in",
            opacity: isOpen ? 0 : 1,
            transition: `opacity 0.3s ${easeInOut}`,
          }}
          onClick={toggleOpen}
        >
          <span className="sr-only">{expandLabel}</span>
        </button>
      </div>
      {showCrosshair && (
        <div
          className="absolute inset-0 m-auto pointer-events-none flex items-center justify-center z-10"
          style={{
            width: crosshairSize,
            height: crosshairSize,
            opacity: isOpen ? 0 : 1,
            transition: `opacity 0.3s ${easeInOut}`,
          }}
        >
          <div
            className="absolute w-px h-full left-[calc(50%-0.5px)]"
            style={{ backgroundColor: crosshairColor }}
          />
          <div
            className="absolute h-px w-full top-[calc(50%-0.5px)]"
            style={{ backgroundColor: crosshairColor }}
          />
          <div
            className="relative z-[1] m-auto w-[5px] h-[5px]"
            style={{ backgroundColor: crosshairColor }}
          />
        </div>
      )}
      {showMap && (
        <div
          className="absolute z-[7] p-2"
          style={{
            bottom: mapMargin,
            right: mapMargin,
            width: mapSize,
            height: mapSize,
            backdropFilter: `blur(${mapBlur})`,
            WebkitBackdropFilter: `blur(${mapBlur})`,
            backgroundColor: mapBg,
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? "none" : "auto",
            transition: `opacity 0.6s ${isOpen ? easeOut : easeIn}`,
          }}
        >
          <div
            className="h-full w-full gap-1"
            style={{
              display: "grid",
              gridTemplate: `repeat(${gridSize}, 1fr) / repeat(${gridSize}, 1fr)`,
            }}
          >
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="rounded-[0.1em] cursor-pointer hover:opacity-100 bg-[whitesmoke]"
                style={{
                  opacity: i === selectedIndex ? 1 : 0.1,
                  transition: `opacity 0.3s ${easeInOut}`,
                  pointerEvents: i === selectedIndex ? "none" : "auto",
                }}
                onClick={(ev) => handleMapClick(ev, i)}
              />
            ))}
          </div>
        </div>
      )}
      {showBack && (
        <button
          className="absolute top-0 left-0 uppercase text-[12px] tracking-[0.03em] rounded-[2rem] text-[whitesmoke] z-[8] cursor-pointer border-none py-2 px-6"
          style={{
            margin: mapMargin,
            backdropFilter: `blur(${backBlur})`,
            WebkitBackdropFilter: `blur(${backBlur})`,
            backgroundColor: backBg,
            opacity: isOpen ? 1 : 0,
            transition: `opacity 0.6s ${isOpen ? easeIn : easeOut}`,
            pointerEvents: isOpen ? "all" : "none",
          }}
          onClick={toggleOpen}
        >
          {backLabel}
        </button>
      )}
      {showZoom && (
        <div
          className="absolute right-0 flex items-center bottom-1/2 h-[120px] text-[whitesmoke] z-[9]"
          style={{
            opacity: isOpen ? 0 : 1,
            transition: `opacity 0.3s ${easeInOut}`,
          }}
        >
          <div className="flex mr-8">
            <div className="relative w-[50px]">
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={zoomStep}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="absolute w-[100px] h-5 opacity-0 cursor-pointer top-[35px] -left-10 z-[9] -rotate-90"
              />
              <div className="absolute pointer-events-none flex flex-col justify-between items-center h-[90px] w-5 -z-10">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-full h-px bg-white opacity-80" />
                ))}
              </div>
              <div className="absolute flex flex-col justify-between text-[10px] pointer-events-none w-5 h-[90px] right-[5px]">
                <div>[{maxZoom.toFixed(3)}]</div>
                <div>[{((minZoom + maxZoom) / 2).toFixed(3)}]</div>
                <div>[{minZoom.toFixed(3)}]</div>
              </div>
              <label
                htmlFor="zoom-range"
                className="block mt-4 text-[10px] uppercase"
              >
                {zoomLabel}
              </label>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{ backgroundColor: bgColor }}
        >
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
