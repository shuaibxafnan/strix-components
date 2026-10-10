"use client";

import { useEffect, useRef } from "react";

// ─── DragGallery ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string    #000000    Page background color
// textColor          string    #ffffff    Base text / logo color
// logoHref           string    "#"        Link wrapping the logo mark
// coordinatesText    string    "34.0522° N, 118.2437° W"   Footer left text
// estText            string    "Est. 2025 • Summer Days"   Footer right text
// items              string[]  20 titles  Project titles shown on expand
// imageUrls          string[]  7 urls     Image pool tiled across the grid
// baseWidth          number    400        Tile width (px)
// smallHeight        number    330        Tile height, size variant A (px)
// largeHeight        number    500        Tile height, size variant B (px)
// itemGap            number    65         Gap between tiles in the grid (px)
// hoverScale         number    1.05       Image zoom scale on tile hover
// expandedScale      number    0.4        Expanded image width, as fraction of viewport width
// dragEase           number    0.075      Lerp ease applied to drag momentum (0–1)
// momentumFactor     number    200        Multiplier applied to release velocity for inertia
// bufferZone         number    3          Extra viewport multiples to pre-render off-screen
// borderRadius       number    0          Tile / expanded-image corner radius (px)
// itemVignetteSize   number    0          Inset shadow size on each tile (px)
// pageVignetteStrength number  0.7        Opacity (0–1) of the full-page vignette
// pageVignetteSize   number    200        Spread size (px) of the full-page vignette
// overlayOpacity     number    0.9        Black overlay opacity behind the expanded image
// overlayEaseDuration number   0.8        Overlay fade + other-tiles fade duration (s)
// zoomDuration       number    0.6        Tile ↔ expanded image zoom transition duration (s)
// ──────────────────────────────────────────────────────────────────────────

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
  "https://cdn.cosmos.so/0f164449-f65e-4584-9d62-a9b3e1f4a90a?format=jpeg",
  "https://cdn.cosmos.so/74ccf6cc-7672-4deb-ba13-1727b7dc6146?format=jpeg",
  "https://cdn.cosmos.so/2f49a117-05e7-4ae9-9e95-b9917f970adb?format=jpeg",
  "https://cdn.cosmos.so/7b5340f5-b4dc-4c08-8495-c507fa81480b?format=jpeg",
  "https://cdn.cosmos.so/f733585a-081e-48e7-a30e-e636446f2168?format=jpeg",
  "https://cdn.cosmos.so/47caf8a0-f456-41c5-98ea-6d0476315731?format=jpeg",
  "https://cdn.cosmos.so/f99f8445-6a19-4a9a-9de3-ac382acc1a3f?format=jpeg",
];

export default function DragGallery({
  bgColor = "#000000",
  textColor = "#ffffff",
  logoHref = "#",
  coordinatesText = "34.0522° N, 118.2437° W",
  estText = "Est. 2025 • Summer Days",
  items = DEFAULT_ITEMS,
  imageUrls = DEFAULT_IMAGES,
  baseWidth = 400,
  smallHeight = 330,
  largeHeight = 500,
  itemGap = 65,
  hoverScale = 1.05,
  expandedScale = 0.4,
  dragEase = 0.075,
  momentumFactor = 200,
  bufferZone = 3,
  borderRadius = 0,
  itemVignetteSize = 0,
  pageVignetteStrength = 0.7,
  pageVignetteSize = 200,
  overlayOpacity = 0.9,
  overlayEaseDuration = 0.8,
  zoomDuration = 0.6,
}) {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const projectTitleRef = useRef(null);

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

    let cleanupFns = [];
    let cancelled = false;

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
      ),
      loadScript(
        "https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js",
      ),
    ])
      .then(() => {
        if (cancelled) return;
        const { gsap, CustomEase, SplitType } = window;
        if (!gsap || !containerRef.current) return;

        gsap.registerPlugin(CustomEase);
        CustomEase.create("hop", "0.9, 0, 0.1, 1");

        const container = containerRef.current;
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        const projectTitleElement = projectTitleRef.current;

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
        let visibleItems = new Set();
        let lastUpdateTime = 0;
        let lastX = 0,
          lastY = 0;
        let isExpanded = false;
        let activeItem = null;
        let activeItemId = null;
        let canDrag = true;
        let originalPosition = null;
        let expandedItem = null;
        let overlayAnimation = null;
        let titleSplit = null;
        let rafId = null;

        function setCssVar(name, value) {
          rootRef.current.style.setProperty(name, value);
        }

        function updatePageVignette() {
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
        }

        function setAndAnimateTitle(title) {
          if (titleSplit) titleSplit.revert();
          projectTitleElement.textContent = title;
          titleSplit = new SplitType(projectTitleElement, { types: "words" });
          gsap.set(titleSplit.words, { y: "100%" });
        }

        function animateTitleIn() {
          gsap.fromTo(
            titleSplit.words,
            { y: "100%", opacity: 0 },
            {
              y: "0%",
              opacity: 1,
              duration: 1,
              stagger: 0.1,
              ease: "power3.out",
            },
          );
        }

        function animateTitleOut() {
          gsap.to(titleSplit.words, {
            y: "-100%",
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
          });
        }

        function animateOverlayIn() {
          if (overlayAnimation) overlayAnimation.kill();
          overlayAnimation = gsap.to(overlay, {
            opacity: overlayOpacity,
            duration: overlayEaseDuration,
            ease: "power2.inOut",
            overwrite: true,
          });
        }

        function animateOverlayOut() {
          if (overlayAnimation) overlayAnimation.kill();
          overlayAnimation = gsap.to(overlay, {
            opacity: 0,
            duration: overlayEaseDuration,
            ease: "power2.inOut",
          });
        }

        function getItemSize(row, col) {
          const sizeIndex = Math.abs((row * columns + col) % itemSizes.length);
          return itemSizes[sizeIndex];
        }

        function getItemId(col, row) {
          return `${col},${row}`;
        }

        function getItemPosition(col, row) {
          return { x: col * cellWidth, y: row * cellHeight };
        }

        function updateVisibleItems() {
          const buffer = bufferZone;
          const viewWidth = window.innerWidth * (1 + buffer);
          const viewHeight = window.innerHeight * (1 + buffer);
          const startCol = Math.floor((-currentX - viewWidth / 2) / cellWidth);
          const endCol = Math.ceil((-currentX + viewWidth * 1.5) / cellWidth);
          const startRow = Math.floor(
            (-currentY - viewHeight / 2) / cellHeight,
          );
          const endRow = Math.ceil((-currentY + viewHeight * 1.5) / cellHeight);
          const currentItems = new Set();

          for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              const itemId = getItemId(col, row);
              currentItems.add(itemId);
              if (visibleItems.has(itemId)) continue;
              if (activeItemId === itemId && isExpanded) continue;

              const itemSize = getItemSize(row, col);
              const position = getItemPosition(col, row);

              const item = document.createElement("div");
              item.className = "dg-item";
              item.id = itemId;
              item.style.width = `${itemSize.width}px`;
              item.style.height = `${itemSize.height}px`;
              item.style.left = `${position.x}px`;
              item.style.top = `${position.y}px`;
              item.style.borderRadius = `${borderRadius}px`;
              item.dataset.width = itemSize.width;
              item.dataset.height = itemSize.height;

              const itemNum = Math.abs((row * columns + col) % itemCount);

              const imageContainer = document.createElement("div");
              imageContainer.className = "dg-item-image-container";
              imageContainer.style.setProperty(
                "--dg-vignette-size",
                `${itemVignetteSize}px`,
              );

              const img = document.createElement("img");
              img.src = imageUrls[itemNum % imageUrls.length];
              img.alt = `Image ${itemNum + 1}`;
              img.draggable = false;
              img.style.setProperty("--dg-hover-scale", hoverScale);
              imageContainer.appendChild(img);
              item.appendChild(imageContainer);

              const captionElement = document.createElement("div");
              captionElement.className = "dg-item-caption";

              const nameElement = document.createElement("div");
              nameElement.className = "dg-item-name";
              nameElement.textContent = items[itemNum];
              captionElement.appendChild(nameElement);

              const numberElement = document.createElement("div");
              numberElement.className = "dg-item-number";
              numberElement.textContent = `#${(itemNum + 1)
                .toString()
                .padStart(5, "0")}`;
              captionElement.appendChild(numberElement);

              item.appendChild(captionElement);

              item.addEventListener("click", () => {
                if (mouseHasMoved || isDragging) return;
                handleItemClick(item, itemNum);
              });

              canvas.appendChild(item);
              visibleItems.add(itemId);
            }
          }

          visibleItems.forEach((itemId) => {
            if (
              !currentItems.has(itemId) ||
              (activeItemId === itemId && isExpanded)
            ) {
              const item = document.getElementById(itemId);
              if (item && item.parentNode === canvas) {
                canvas.removeChild(item);
              }
              visibleItems.delete(itemId);
            }
          });
        }

        function handleItemClick(item, itemIndex) {
          if (isExpanded) {
            if (expandedItem) closeExpandedItem();
          } else {
            expandItem(item, itemIndex);
          }
        }

        function expandItem(item, itemIndex) {
          isExpanded = true;
          activeItem = item;
          activeItemId = item.id;
          canDrag = false;
          container.style.cursor = "auto";

          const imgSrc = item.querySelector("img").src;
          const titleIndex = itemIndex % items.length;
          const itemWidth = parseInt(item.dataset.width);
          const itemHeight = parseInt(item.dataset.height);

          setAndAnimateTitle(items[titleIndex]);

          const nameElement = item.querySelector(".dg-item-name");
          const numberElement = item.querySelector(".dg-item-number");
          const nameText = nameElement.textContent;
          const numberText = numberElement.textContent;

          const captionClone = item
            .querySelector(".dg-item-caption")
            .cloneNode(true);
          captionClone.classList.add("dg-caption-clone");
          const nameClone = captionClone.querySelector(".dg-item-name");
          const numberClone = captionClone.querySelector(".dg-item-number");
          const nameCloneSplit = new SplitType(nameClone, { types: "words" });
          const numberCloneSplit = new SplitType(numberClone, {
            types: "words",
          });

          const captionRect = item
            .querySelector(".dg-item-caption")
            .getBoundingClientRect();
          captionClone.style.left = `${captionRect.left}px`;
          captionClone.style.bottom = `${window.innerHeight - captionRect.bottom}px`;
          captionClone.style.width = `${captionRect.width}px`;
          document.body.appendChild(captionClone);

          item.querySelector(".dg-item-caption").style.opacity = "0";

          gsap.to(nameCloneSplit.words, {
            y: "100%",
            opacity: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: "power3.in",
          });
          gsap.to(numberCloneSplit.words, {
            y: "100%",
            opacity: 0,
            duration: 0.6,
            stagger: 0.02,
            delay: 0.05,
            ease: "power3.in",
            onComplete: () => {
              if (captionClone.parentNode)
                document.body.removeChild(captionClone);
            },
          });

          const rect = item.getBoundingClientRect();
          originalPosition = {
            id: item.id,
            rect,
            imgSrc,
            width: itemWidth,
            height: itemHeight,
            nameText,
            numberText,
          };

          overlay.classList.add("dg-active");
          animateOverlayIn();

          expandedItem = document.createElement("div");
          expandedItem.className = "dg-expanded-item";
          expandedItem.style.width = `${itemWidth}px`;
          expandedItem.style.height = `${itemHeight}px`;
          expandedItem.style.borderRadius = `${borderRadius}px`;

          const img = document.createElement("img");
          img.src = imgSrc;
          img.draggable = false;
          expandedItem.appendChild(img);
          expandedItem.addEventListener("click", closeExpandedItem);
          document.body.appendChild(expandedItem);

          document.querySelectorAll(".dg-item").forEach((el) => {
            if (el !== activeItem) {
              gsap.to(el, {
                opacity: 0,
                duration: overlayEaseDuration,
                ease: "power2.inOut",
              });
            }
          });

          const viewportWidth = window.innerWidth;
          const targetWidth = viewportWidth * expandedScale;
          const aspectRatio = itemHeight / itemWidth;
          const targetHeight = targetWidth * aspectRatio;

          gsap.delayedCall(0.5, animateTitleIn);

          gsap.fromTo(
            expandedItem,
            {
              width: itemWidth,
              height: itemHeight,
              x: rect.left + itemWidth / 2 - window.innerWidth / 2,
              y: rect.top + itemHeight / 2 - window.innerHeight / 2,
            },
            {
              width: targetWidth,
              height: targetHeight,
              x: 0,
              y: 0,
              duration: zoomDuration,
              ease: "hop",
            },
          );
        }

        function closeExpandedItem() {
          if (!expandedItem || !originalPosition) return;
          animateTitleOut();
          animateOverlayOut();

          document.querySelectorAll(".dg-item").forEach((el) => {
            if (el.id !== activeItemId) {
              gsap.to(el, {
                opacity: 1,
                duration: overlayEaseDuration,
                delay: 0.3,
                ease: "power2.inOut",
              });
            }
          });

          const originalItem = document.getElementById(activeItemId);
          if (originalItem) {
            const nameElement = originalItem.querySelector(".dg-item-name");
            const numberElement = originalItem.querySelector(".dg-item-number");
            nameElement.textContent = originalPosition.nameText;
            numberElement.textContent = originalPosition.numberText;
            originalItem.querySelector(".dg-item-caption").style.opacity = "0";
          }

          const originalRect = originalPosition.rect;
          const originalWidth = originalPosition.width;
          const originalHeight = originalPosition.height;

          gsap.to(expandedItem, {
            width: originalWidth,
            height: originalHeight,
            x: originalRect.left + originalWidth / 2 - window.innerWidth / 2,
            y: originalRect.top + originalHeight / 2 - window.innerHeight / 2,
            duration: zoomDuration,
            ease: "hop",
            onComplete: () => {
              if (originalItem) {
                const captionElement =
                  originalItem.querySelector(".dg-item-caption");
                const captionClone = document.createElement("div");
                captionClone.className = "dg-caption-clone";
                captionClone.innerHTML = captionElement.innerHTML;

                const captionRect = captionElement.getBoundingClientRect();
                captionClone.style.position = "fixed";
                captionClone.style.left = `${captionRect.left}px`;
                captionClone.style.bottom = `${
                  window.innerHeight - captionRect.bottom
                }px`;
                captionClone.style.width = `${captionRect.width}px`;
                captionClone.style.padding = "10px";
                document.body.appendChild(captionClone);

                const nameClone = captionClone.querySelector(".dg-item-name");
                const numberClone =
                  captionClone.querySelector(".dg-item-number");
                nameClone.style.overflow = "hidden";
                numberClone.style.overflow = "hidden";

                const nameCloneSplit = new SplitType(nameClone, {
                  types: "words",
                });
                const numberCloneSplit = new SplitType(numberClone, {
                  types: "words",
                });

                gsap.set(nameCloneSplit.words, { y: "100%", opacity: 0 });
                gsap.set(numberCloneSplit.words, { y: "100%", opacity: 0 });

                gsap.to(nameCloneSplit.words, {
                  y: "0%",
                  opacity: 1,
                  duration: 0.7,
                  stagger: 0.03,
                  ease: "power3.out",
                });
                gsap.to(numberCloneSplit.words, {
                  y: "0%",
                  opacity: 1,
                  duration: 0.7,
                  stagger: 0.02,
                  delay: 0.05,
                  ease: "power3.out",
                  onComplete: () => {
                    captionElement.style.opacity = "1";
                    if (captionClone.parentNode)
                      document.body.removeChild(captionClone);
                  },
                });
              }

              if (expandedItem && expandedItem.parentNode) {
                document.body.removeChild(expandedItem);
              }
              if (originalItem) originalItem.style.visibility = "visible";

              expandedItem = null;
              isExpanded = false;
              activeItem = null;
              originalPosition = null;
              activeItemId = null;
              canDrag = true;
              container.style.cursor = "grab";
              dragVelocityX = 0;
              dragVelocityY = 0;
              overlay.classList.remove("dg-active");
            },
          });
        }

        function animate() {
          if (canDrag) {
            currentX += (targetX - currentX) * dragEase;
            currentY += (targetY - currentY) * dragEase;
            canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;

            const now = Date.now();
            const distMoved = Math.sqrt(
              Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2),
            );
            if (distMoved > 100 || now - lastUpdateTime > 120) {
              updateVisibleItems();
              lastX = currentX;
              lastY = currentY;
              lastUpdateTime = now;
            }
          }
          rafId = requestAnimationFrame(animate);
        }

        function onMouseDown(e) {
          if (!canDrag) return;
          isDragging = true;
          mouseHasMoved = false;
          startX = e.clientX;
          startY = e.clientY;
          container.style.cursor = "grabbing";
        }

        function onMouseMove(e) {
          if (!isDragging || !canDrag) return;
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
        }

        function onMouseUp() {
          if (!isDragging) return;
          isDragging = false;
          if (canDrag) {
            container.style.cursor = "grab";
            if (
              Math.abs(dragVelocityX) > 0.1 ||
              Math.abs(dragVelocityY) > 0.1
            ) {
              targetX += dragVelocityX * momentumFactor;
              targetY += dragVelocityY * momentumFactor;
            }
          }
        }

        function onOverlayClick() {
          if (isExpanded) closeExpandedItem();
        }

        function onTouchStart(e) {
          if (!canDrag) return;
          isDragging = true;
          mouseHasMoved = false;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }

        function onTouchMove(e) {
          if (!isDragging || !canDrag) return;
          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;
          targetX += dx;
          targetY += dy;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }

        function onTouchEnd() {
          isDragging = false;
        }

        function onResize() {
          if (isExpanded && expandedItem) {
            const viewportWidth = window.innerWidth;
            const targetWidth = viewportWidth * expandedScale;
            const originalWidth = originalPosition.width;
            const originalHeight = originalPosition.height;
            const aspectRatio = originalHeight / originalWidth;
            const targetHeight = targetWidth * aspectRatio;
            gsap.to(expandedItem, {
              width: targetWidth,
              height: targetHeight,
              duration: 0.3,
              ease: "power2.out",
            });
          } else {
            updateVisibleItems();
          }
        }

        container.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        overlay.addEventListener("click", onOverlayClick);
        container.addEventListener("touchstart", onTouchStart);
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("touchend", onTouchEnd);
        window.addEventListener("resize", onResize);

        updatePageVignette();
        updateVisibleItems();
        animate();

        cleanupFns.push(() => {
          cancelAnimationFrame(rafId);
          container.removeEventListener("mousedown", onMouseDown);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
          overlay.removeEventListener("click", onOverlayClick);
          container.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("touchend", onTouchEnd);
          window.removeEventListener("resize", onResize);
          canvas.innerHTML = "";
          if (expandedItem && expandedItem.parentNode) {
            document.body.removeChild(expandedItem);
          }
          document
            .querySelectorAll(".dg-caption-clone")
            .forEach((el) => el.parentNode && el.parentNode.removeChild(el));
        });
      })
      .catch((e) =>
        console.error("[DragGallery] script load failed:", e.message),
      );

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [
    items,
    imageUrls,
    baseWidth,
    smallHeight,
    largeHeight,
    itemGap,
    hoverScale,
    expandedScale,
    dragEase,
    momentumFactor,
    bufferZone,
    borderRadius,
    itemVignetteSize,
    pageVignetteStrength,
    pageVignetteSize,
    overlayOpacity,
    overlayEaseDuration,
    zoomDuration,
  ]);

  return (
    <div
      ref={rootRef}
      className="dg-root relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="absolute top-0 left-0 w-full z-[10000] p-6">
        <a
          href={logoHref}
          className="dg-logo-container inline-block w-12 h-6 relative"
        >
          <span className="dg-logo-circles relative block w-full h-full">
            <span className="dg-circle dg-circle-1 absolute rounded-full w-6 h-6 top-1/2 left-0" />
            <span className="dg-circle dg-circle-2 absolute rounded-full w-6 h-6 top-1/2 left-3" />
          </span>
        </a>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-[10000] p-6 grid grid-cols-12 gap-4">
        <div className="col-span-3 font-mono text-sm">
          <p>{coordinatesText}</p>
        </div>
        <div className="col-span-6" />
        <div className="col-span-3 text-right font-mono text-sm">
          <p>{estText}</p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="dg-container relative w-screen h-screen overflow-hidden cursor-grab"
      >
        <div
          ref={canvasRef}
          className="dg-canvas absolute will-change-transform"
        />
        <div
          ref={overlayRef}
          className="dg-overlay fixed inset-0 pointer-events-none"
          style={{ backgroundColor: "#000000", opacity: 0, zIndex: 9999 }}
        />
      </div>

      <div className="dg-project-title absolute top-1/2 left-1/2 w-full text-center pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[10002]">
        <p
          ref={projectTitleRef}
          className="relative h-[42px] overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
        />
      </div>

      <div className="dg-page-vignette-container fixed inset-0 pointer-events-none z-[9998]">
        <div className="dg-page-vignette absolute inset-0" />
        <div className="dg-page-vignette-strong absolute inset-0" />
        <div className="dg-page-vignette-extreme absolute inset-0" />
      </div>

      <style>
        {"" +
          ".dg-root { font-family: 'PP Neue Montreal', sans-serif; user-select: none; -webkit-user-select: none; } " +
          ".dg-root img { -webkit-user-drag: none; user-drag: none; } " +
          ".dg-circle { background-color: currentColor; transition: transform 0.3s ease; } " +
          ".dg-circle-2 { mix-blend-mode: exclusion; } " +
          ".dg-logo-container:hover .dg-circle-1 { transform: translate(-8px, -50%); } " +
          ".dg-logo-container:hover .dg-circle-2 { transform: translate(8px, -50%); } " +
          ".dg-circle-1 { transform: translate(0, -50%); } " +
          ".dg-circle-2 { transform: translate(0, -50%); } " +
          ".dg-item { position: absolute; overflow: hidden; background-color: #000000; cursor: pointer; } " +
          ".dg-item-image-container { width: 100%; height: 100%; overflow: hidden; position: relative; } " +
          ".dg-item-image-container::after { content: ''; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 var(--dg-vignette-size, 0px) rgba(0,0,0,0.5); z-index: 1; } " +
          ".dg-item img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; transition: transform 0.3s ease; } " +
          ".dg-item:hover img { transform: scale(var(--dg-hover-scale, 1.05)); } " +
          ".dg-item-caption { position: absolute; bottom: 0; left: 0; width: 100%; padding: 10px; z-index: 2; } " +
          ".dg-item-name { font-family: 'PP Neue Montreal', sans-serif; color: #ffffff; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: -0.03em; margin-bottom: 2px; position: relative; overflow: hidden; height: 16px; } " +
          ".dg-item-number { font-family: monospace; color: #888888; font-size: 10px; position: relative; overflow: hidden; height: 14px; } " +
          ".dg-expanded-item { position: fixed; z-index: 10000; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #000000; overflow: hidden; cursor: pointer; } " +
          ".dg-expanded-item img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; } " +
          ".dg-overlay.dg-active { pointer-events: auto; } " +
          ".dg-page-vignette { box-shadow: inset 0 0 var(--page-vignette-size, 0px) var(--page-vignette-color, rgba(0,0,0,0.9)); } " +
          ".dg-page-vignette-strong { box-shadow: inset 0 0 var(--page-vignette-strong-size, 0px) var(--page-vignette-strong-color, rgba(0,0,0,0.95)); } " +
          ".dg-page-vignette-extreme { box-shadow: inset 0 0 var(--page-vignette-extreme-size, 0px) var(--page-vignette-extreme-color, rgba(0,0,0,1)); } " +
          ".dg-caption-clone { position: fixed; z-index: 10001; } " +
          ".dg-caption-clone .dg-item-name, .dg-caption-clone .dg-item-number { overflow: hidden; }"}
      </style>
    </div>
  );
}
