"use client";

import { useEffect, useRef } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=1000&q=80`;

const DEFAULT_ITEMS = [
  "Chromatic Loopscape",
  "Solar Bloom",
  "Neon Handscape",
  "Echo Discs",
  "Void Gaze",
  "Gravity Sync",
  "Heat Core",
  "Fractal Mirage",
  "Nova Pulse",
  "Sonic Horizon",
  "Dream Circuit",
  "Lunar Mesh",
  "Radiant Dusk",
  "Pixel Drift",
  "Vortex Bloom",
  "Shadow Static",
  "Crimson Phase",
  "Retro Cascade",
  "Photon Fold",
  "Zenith Flow",
];

const DEFAULT_IMAGES = [
  "1749330513873-09ffa91b0aae",
  "1627896157734-4d7d4388f28b",
  "1778789172736-e8ba37c71124",
  "1778961938903-96617183f739",
  "1678112553355-a9dab855ebf3",
  "1743309411498-a0f4f4b96b65",
  "1490682143684-14369e18dce8",
].map(photo);

const ITEM =
  "group absolute cursor-pointer overflow-hidden bg-black outline outline-2 outline-offset-0 outline-transparent transition-[transform,outline-color,outline-offset] duration-500 ease-out [&.is-selected]:z-[2] [&.is-selected]:[transform:scale(var(--dg-focus-scale,1.04))] [&.is-selected]:outline-white [&.is-selected]:outline-offset-[6px]";
const IMAGE_BOX =
  "relative h-full w-full overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:content-[''] after:[box-shadow:inset_0_0_var(--dg-vignette-size,0px)_rgba(0,0,0,0.5)]";
const IMAGE =
  "pointer-events-none h-full w-full object-cover transition-transform duration-300 group-hover:[transform:scale(var(--dg-hover-scale,1.05))]";
const CAPTION = "absolute bottom-0 left-0 z-[2] w-full p-[10px]";
const NAME =
  "relative mb-[2px] h-4 overflow-hidden font-[family-name:var(--font)] text-xs font-medium uppercase tracking-[-0.03em] text-white";
const NUMBER =
  "relative h-[14px] overflow-hidden font-mono text-[10px] text-[#888888]";

export default function DragGallery({
  bgColor = "#000000",
  textColor = "#ffffff",
  fontFamily = "Inter Tight",
  items = DEFAULT_ITEMS,
  imageUrls = DEFAULT_IMAGES,
  baseWidth = 400,
  smallHeight = 330,
  largeHeight = 500,
  itemGap = 65,
  hoverScale = 1.05,
  focusScale = 1.04,
  dragEase = 0.075,
  momentumFactor = 200,
  bufferZone = 1,
  borderRadius = 0,
  itemVignetteSize = 0,
  pageVignetteStrength = 0.7,
  pageVignetteSize = 200,
  className = "",
}) {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!root || !container || !canvas) return;

    const itemSizes = [
      { width: baseWidth, height: smallHeight },
      { width: baseWidth, height: largeHeight },
    ];
    const cellWidth = baseWidth + itemGap;
    const cellHeight = Math.max(smallHeight, largeHeight) + itemGap;
    const columns = 4;
    const itemCount = items.length;

    let isDragging = false;
    let startX, startY;
    let targetX = 0,
      targetY = 0;
    let currentX = 0,
      currentY = 0;
    let dragVelocityX = 0,
      dragVelocityY = 0;
    let lastDragTime = 0;
    let mouseHasMoved = false;
    const visibleItems = new Set();
    let lastUpdateTime = 0;
    let lastX = 0,
      lastY = 0;
    let selectedId = null;
    let rafId = null;

    const setCssVar = (name, value) => root.style.setProperty(name, value);

    const updatePageVignette = () => {
      const strength = pageVignetteStrength;
      const size = pageVignetteSize;
      setCssVar("--page-vignette-size", `${size * 1.5}px`);
      setCssVar("--page-vignette-color", `rgba(0,0,0,${strength * 0.7})`);
      setCssVar("--page-vignette-strong-size", `${size * 0.75}px`);
      setCssVar(
        "--page-vignette-strong-color",
        `rgba(0,0,0,${strength * 0.85})`,
      );
      setCssVar("--page-vignette-extreme-size", `${size * 0.4}px`);
      setCssVar("--page-vignette-extreme-color", `rgba(0,0,0,${strength})`);
    };

    const getItemSize = (row, col) =>
      itemSizes[Math.abs((row * columns + col) % itemSizes.length)];

    const getItemId = (col, row) => `${col},${row}`;

    const clearSelection = () => {
      if (selectedId === null) return;
      const prev = document.getElementById(selectedId);
      if (prev) prev.classList.remove("is-selected");
      selectedId = null;
    };

    const selectItem = (item) => {
      if (selectedId === item.id) {
        clearSelection();
        return;
      }
      clearSelection();
      selectedId = item.id;
      item.classList.add("is-selected");

      const x = parseFloat(item.style.left);
      const y = parseFloat(item.style.top);
      const w = parseFloat(item.dataset.width);
      const h = parseFloat(item.dataset.height);
      targetX = window.innerWidth / 2 - (x + w / 2);
      targetY = window.innerHeight / 2 - (y + h / 2);
      dragVelocityX = 0;
      dragVelocityY = 0;
    };

    const updateVisibleItems = () => {
      const viewWidth = window.innerWidth * (1 + bufferZone);
      const viewHeight = window.innerHeight * (1 + bufferZone);
      const startCol = Math.floor((-currentX - viewWidth / 2) / cellWidth);
      const endCol = Math.ceil((-currentX + viewWidth * 1.5) / cellWidth);
      const startRow = Math.floor((-currentY - viewHeight / 2) / cellHeight);
      const endRow = Math.ceil((-currentY + viewHeight * 1.5) / cellHeight);
      const currentItems = new Set();

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const itemId = getItemId(col, row);
          currentItems.add(itemId);
          if (visibleItems.has(itemId)) continue;

          const itemSize = getItemSize(row, col);

          const item = document.createElement("div");
          item.className = ITEM + (itemId === selectedId ? " is-selected" : "");
          item.id = itemId;
          item.style.width = `${itemSize.width}px`;
          item.style.height = `${itemSize.height}px`;
          item.style.left = `${col * cellWidth}px`;
          item.style.top = `${row * cellHeight}px`;
          item.style.borderRadius = `${borderRadius}px`;
          item.dataset.width = itemSize.width;
          item.dataset.height = itemSize.height;

          const itemNum = Math.abs((row * columns + col) % itemCount);

          const imageContainer = document.createElement("div");
          imageContainer.className = IMAGE_BOX;
          imageContainer.style.setProperty(
            "--dg-vignette-size",
            `${itemVignetteSize}px`,
          );

          const img = document.createElement("img");
          img.className = IMAGE;
          img.src = imageUrls[itemNum % imageUrls.length];
          img.alt = items[itemNum];
          img.draggable = false;
          imageContainer.appendChild(img);
          item.appendChild(imageContainer);

          const captionElement = document.createElement("div");
          captionElement.className = CAPTION;

          const nameElement = document.createElement("div");
          nameElement.className = NAME;
          nameElement.textContent = items[itemNum];
          captionElement.appendChild(nameElement);

          const numberElement = document.createElement("div");
          numberElement.className = NUMBER;
          numberElement.textContent = `#${(itemNum + 1)
            .toString()
            .padStart(5, "0")}`;
          captionElement.appendChild(numberElement);

          item.appendChild(captionElement);

          item.addEventListener("click", () => {
            if (mouseHasMoved || isDragging) return;
            selectItem(item);
          });

          canvas.appendChild(item);
          visibleItems.add(itemId);
        }
      }

      visibleItems.forEach((itemId) => {
        if (!currentItems.has(itemId)) {
          const item = document.getElementById(itemId);
          if (item && item.parentNode === canvas) canvas.removeChild(item);
          visibleItems.delete(itemId);
        }
      });
    };

    const animate = () => {
      currentX += (targetX - currentX) * dragEase;
      currentY += (targetY - currentY) * dragEase;
      canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;

      const now = Date.now();
      const distMoved = Math.hypot(currentX - lastX, currentY - lastY);
      if (distMoved > 100 || now - lastUpdateTime > 120) {
        updateVisibleItems();
        lastX = currentX;
        lastY = currentY;
        lastUpdateTime = now;
      }
      rafId = requestAnimationFrame(animate);
    };

    const onMouseDown = (e) => {
      isDragging = true;
      mouseHasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;
      const now = Date.now();
      const dt = Math.max(10, now - lastDragTime);
      lastDragTime = now;
      dragVelocityX = dx / dt;
      dragVelocityY = dy / dt;
      targetX += dx;
      targetY += dy;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = "grab";
      if (Math.abs(dragVelocityX) > 0.1 || Math.abs(dragVelocityY) > 0.1) {
        targetX += dragVelocityX * momentumFactor;
        targetY += dragVelocityY * momentumFactor;
      }
    };

    const onTouchStart = (e) => {
      isDragging = true;
      mouseHasMoved = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;
      targetX += dx;
      targetY += dy;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onResize = () => updateVisibleItems();

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    updatePageVignette();
    updateVisibleItems();
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      canvas.innerHTML = "";
    };
  }, [
    items,
    imageUrls,
    baseWidth,
    smallHeight,
    largeHeight,
    itemGap,
    dragEase,
    momentumFactor,
    bufferZone,
    borderRadius,
    itemVignetteSize,
    pageVignetteStrength,
    pageVignetteSize,
  ]);

  return (
    <div
      ref={rootRef}
      className={`relative h-screen w-full select-none overflow-hidden bg-[var(--bg)] font-[family-name:var(--font)] text-[var(--fg)] [&_img]:[-webkit-user-drag:none] ${className}`}
      style={{
        "--bg": bgColor,
        "--fg": textColor,
        "--font": `"${fontFamily}", sans-serif`,
        "--dg-hover-scale": hoverScale,
        "--dg-focus-scale": focusScale,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&display=swap"
      />

      <div
        ref={containerRef}
        className="relative h-full w-full cursor-grab overflow-hidden"
      >
        <div ref={canvasRef} className="absolute will-change-transform" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[9998]">
        <div className="absolute inset-0 [box-shadow:inset_0_0_var(--page-vignette-size,0px)_var(--page-vignette-color,rgba(0,0,0,0.9))]" />
        <div className="absolute inset-0 [box-shadow:inset_0_0_var(--page-vignette-strong-size,0px)_var(--page-vignette-strong-color,rgba(0,0,0,0.95))]" />
        <div className="absolute inset-0 [box-shadow:inset_0_0_var(--page-vignette-extreme-size,0px)_var(--page-vignette-extreme-color,rgba(0,0,0,1))]" />
      </div>
    </div>
  );
}