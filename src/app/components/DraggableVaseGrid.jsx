"use client";

import { useEffect, useRef, useId } from "react";

// ─── DraggableProductGrid ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// products          array    []        Array of { id, image, title, price, description }.
//                                       `id` must be unique per product (used to link grid
//                                       tiles to their details panel content).
// columns           number   10        Number of columns rendered in the draggable grid.
// itemsPerColumn    number   5         Number of product tiles stacked in each column.
// tileSize          string   "18.5vw"  Width/height (aspect-ratio 1/1) of each grid tile.
// gridGap           string   "5vw"     Gap between tiles/columns in the grid.
// bgColor           string   "#fff"    Page background color.
// panelBgColor      string   "#f1f1f1" Background color of the sliding details panel.
// panelWidth        string   "50vw"    Width of the details panel (desktop).
// crossColor        string   "#313131" Stroke color of the cursor-following close cross.
// introDuration     number   0.6       Duration (s) of each tile's intro fade/scale-in.
// introStagger      number   1.2       Total stagger spread (s) across all tiles on intro.
// dragInertia       bool     true      Whether releasing a drag continues with momentum.
// gsapVersion       string   "3.12.5"  GSAP version loaded from the cdnjs CDN.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_PRODUCTS = [
  {
    id: "1",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-1.png",
    title: "Crimson Amphora",
    price: "$300,00",
    description:
      "This bold red vase stands out with its vibrant hue, a perfect centerpiece to add passion and energy to any room.",
  },
  {
    id: "2",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-2.png",
    title: "Rustic Urn",
    price: "$220,00",
    description:
      "With its earthy tones and natural speckled finish, this rustic vase evokes the charm of handcrafted pottery.",
  },
  {
    id: "3",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-3.png",
    title: "Golden Vessel",
    price: "$240,00",
    description:
      "Bright and cheerful, the yellow vase radiates positivity. Its glossy surface reflects light beautifully.",
  },
  {
    id: "4",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-4.png",
    title: "Sunlit Amphora",
    price: "$300,00",
    description:
      "Generous in size and striking in presence, the large yellow vase makes a bold decorative statement.",
  },
  {
    id: "5",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-5.png",
    title: "Midnight Reliquary",
    price: "$390,00",
    description:
      "Sleek and sophisticated, the black vase embodies timeless elegance.",
  },
  {
    id: "6",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-6.png",
    title: "Amber Ewer",
    price: "$340,00",
    description:
      "A playful mix of texture and color, the speckled yellow vase is both lively and unique.",
  },
  {
    id: "7",
    image:
      "https://raw.githubusercontent.com/joffreysp/draggable-grid/refs/heads/main/public/img-7.png",
    title: "Sylvan Chalice",
    price: "$240,00",
    description:
      "Crafted from natural wood, this vase celebrates organic beauty and timeless simplicity.",
  },
];

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
    el.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(el);
  });

export default function DraggableVaseGrid({
  products = DEFAULT_PRODUCTS,
  columns = 10,
  itemsPerColumn = 5,
  tileSize = "18.5vw",
  gridGap = "5vw",
  bgColor = "#fff",
  panelBgColor = "#f1f1f1",
  panelWidth = "50vw",
  crossColor = "#313131",
  introDuration = 0.6,
  introStagger = 1.2,
  dragInertia = true,
  gsapVersion = "3.13.0",
}) {
  const uid = useId();
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const detailsRef = useRef(null);
  const detailsThumbRef = useRef(null);
  const crossRef = useRef(null);
  const stateRef = useRef({});
  const columnData = Array.from({ length: columns }, (_, colIndex) =>
    Array.from({ length: itemsPerColumn }, (_, rowIndex) => {
      const productIndex = (colIndex * 2 + rowIndex) % products.length;
      return { ...products[productIndex], _key: `${colIndex}-${rowIndex}` };
    }),
  );

  useEffect(() => {
    if (!products.length) return;

    let cancelled = false;
    const base = `https://cdnjs.cloudflare.com/ajax/libs/gsap/${gsapVersion}`;

    Promise.all([
      loadScript(`${base}/gsap.min.js`),
      loadScript(`${base}/Draggable.min.js`),
      loadScript(`${base}/Flip.min.js`),
      loadScript(`${base}/SplitText.min.js`),
    ])
      .then(() => {
        if (cancelled) return;
        const { gsap, Draggable, Flip, SplitText } = window;
        if (!gsap || !Draggable || !Flip || !SplitText) return;

        gsap.registerPlugin(Draggable, Flip, SplitText);

        const root = rootRef.current;
        const container = containerRef.current;
        const grid = gridRef.current;
        const details = detailsRef.current;
        const detailsThumb = detailsThumbRef.current;
        const cross = crossRef.current;
        if (!root || !container || !grid || !details) return;

        const productEls = [...grid.querySelectorAll("[data-product-id]")];
        const state = stateRef.current;
        state.showDetails = false;
        state.currentProduct = null;
        state.originalParent = null;

        const centerGrid = () => {
          const gridWidth = grid.offsetWidth;
          const gridHeight = grid.offsetHeight;
          const centerX = (window.innerWidth - gridWidth) / 2;
          const centerY = (window.innerHeight - gridHeight) / 2;
          gsap.set(grid, { x: centerX, y: centerY });
        };

        const getBounds = () => ({
          minX: -(grid.offsetWidth - window.innerWidth) - 200,
          maxX: 200,
          minY: -(grid.offsetHeight - window.innerHeight) - 100,
          maxY: 100,
        });

        const setupDraggable = () => {
          container.classList.add("is-loaded");
          state.draggable = Draggable.create(grid, {
            type: "x,y",
            bounds: getBounds(),
            inertia: dragInertia,
            allowEventDefault: true,
            edgeResistance: 0.9,
            onDragStart: () => container.classList.add("is-dragging"),
            onDragEnd: () => container.classList.remove("is-dragging"),
          })[0];
        };

        const onWheel = (e) => {
          e.preventDefault();
          const deltaX = -e.deltaX * 7;
          const deltaY = -e.deltaY * 7;
          const currentX = gsap.getProperty(grid, "x");
          const currentY = gsap.getProperty(grid, "y");
          const bounds = state.draggable.vars.bounds;
          const clampedX = Math.max(
            bounds.minX,
            Math.min(bounds.maxX, currentX + deltaX),
          );
          const clampedY = Math.max(
            bounds.minY,
            Math.min(bounds.maxY, currentY + deltaY),
          );
          gsap.to(grid, {
            x: clampedX,
            y: clampedY,
            duration: 0.3,
            ease: "power3.out",
          });
        };

        const onResize = () => {
          if (state.draggable) state.draggable.vars.bounds = getBounds();
        };

        const onMouseMove = (e) => {
          if (!state.showDetails || !cross) return;
          gsap.to(cross, {
            x: e.clientX - cross.offsetWidth / 2,
            y: e.clientY - cross.offsetHeight / 2,
            duration: 0.4,
            ease: "power2.out",
          });
        };

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.target === state.currentProduct) return;
              if (entry.isIntersecting) {
                gsap.to(entry.target, {
                  scale: 1,
                  opacity: 1,
                  duration: 0.5,
                  ease: "power2.out",
                });
              } else {
                gsap.to(entry.target, {
                  opacity: 0,
                  scale: 0.5,
                  duration: 0.5,
                  ease: "power2.in",
                });
              }
            });
          },
          { root: null, threshold: 0.1 },
        );

        const titles = details.querySelectorAll("[data-title]");
        const prices = details.querySelectorAll("[data-price]");
        const texts = details.querySelectorAll("[data-desc]");

        const splitTitles = new SplitText(titles, {
          type: "lines, chars",
          mask: "lines",
          charsClass: "char",
        });
        const splitPrices = new SplitText(prices, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
        });
        const splitTexts = new SplitText(texts, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
        });

        gsap.set(
          [...titles].flatMap((t) => [...t.querySelectorAll(".char")]),
          { yPercent: 100 },
        );
        gsap.set(
          [...prices].flatMap((p) => [...p.querySelectorAll(".line")]),
          { yPercent: 100 },
        );
        gsap.set(
          [...texts].flatMap((t) => [...t.querySelectorAll(".line")]),
          { yPercent: 100 },
        );

        const flipProduct = (product) => {
          state.currentProduct = product;
          state.originalParent = product.parentNode;
          observer.unobserve(product);

          const flipState = Flip.getState(product);
          detailsThumb.appendChild(product);
          Flip.from(flipState, {
            absolute: true,
            duration: 1.2,
            ease: "power3.inOut",
          });

          if (cross)
            gsap.to(cross, {
              scale: 1,
              duration: 0.4,
              delay: 0.5,
              ease: "power2.out",
            });
        };

        const unFlipProduct = () => {
          const product = state.currentProduct;
          const originalParent = state.originalParent;
          if (!product || !originalParent) return;

          if (cross)
            gsap.to(cross, { scale: 0, duration: 0.4, ease: "power2.out" });

          const finalRect = originalParent.getBoundingClientRect();
          const currentRect = product.getBoundingClientRect();
          const thumbRect = detailsThumb.getBoundingClientRect();

          gsap.set(product, {
            position: "absolute",
            top: currentRect.top - thumbRect.top + "px",
            left: currentRect.left - thumbRect.left + "px",
            width: currentRect.width + "px",
            height: currentRect.height + "px",
            zIndex: 10000,
          });

          gsap.to(product, {
            top: finalRect.top - thumbRect.top + "px",
            left: finalRect.left - thumbRect.left + "px",
            width: finalRect.width + "px",
            height: finalRect.height + "px",
            duration: 1.2,
            delay: 0.3,
            ease: "power3.inOut",
            onComplete: () => {
              originalParent.appendChild(product);
              gsap.set(product, {
                position: "",
                top: "",
                left: "",
                width: "",
                height: "",
                zIndex: "",
              });
              observer.observe(product);
              state.currentProduct = null;
              state.originalParent = null;
            },
          });
        };

        const revealContent = (id, delay = 0.4) => {
          const title = details.querySelector(`[data-title="${id}"]`);
          const price = details.querySelector(`[data-price="${id}"]`);
          const text = details.querySelector(`[data-desc="${id}"]`);
          if (title) {
            gsap.to(title.querySelectorAll(".char"), {
              yPercent: 0,
              duration: 1.1,
              delay,
              ease: "power3.inOut",
              stagger: 0.025,
            });
          }
          if (price) {
            gsap.to(price.querySelectorAll(".line"), {
              yPercent: 0,
              duration: 0.9,
              delay: delay + 0.1,
              ease: "power3.inOut",
            });
          }
          if (text) {
            gsap.to(text.querySelectorAll(".line"), {
              yPercent: 0,
              duration: 1.1,
              delay: delay + 0.05,
              ease: "power3.inOut",
              stagger: 0.05,
            });
          }
        };

        const hideContent = (id, onComplete) => {
          const title = details.querySelector(`[data-title="${id}"]`);
          const price = details.querySelector(`[data-price="${id}"]`);
          const text = details.querySelector(`[data-desc="${id}"]`);
          if (title) {
            gsap.to(title.querySelectorAll(".char"), {
              yPercent: 100,
              duration: 0.5,
              ease: "power3.inOut",
              stagger: { amount: 0.02, from: "end" },
            });
          }
          if (price) {
            gsap.to(price.querySelectorAll(".line"), {
              yPercent: 100,
              duration: 0.4,
              ease: "power3.inOut",
            });
          }
          if (text) {
            gsap.to(text.querySelectorAll(".line"), {
              yPercent: 100,
              duration: 0.5,
              ease: "power3.inOut",
              stagger: 0.04,
              onComplete,
            });
          } else if (onComplete) {
            onComplete();
          }
        };

        const showDetails = (product) => {
          if (state.showDetails) return;
          state.showDetails = true;
          details.classList.add("is-showing");
          container.classList.add("is-details-showing");

          gsap.to(container, {
            x: "-50vw",
            duration: 1.2,
            ease: "power3.inOut",
          });
          gsap.to(details, { x: 0, duration: 1.2, ease: "power3.inOut" });

          flipProduct(product);
          revealContent(product.dataset.productId);
        };

        const switchDetails = (product) => {
          const outgoingId = state.currentProduct?.dataset.productId;
          if (outgoingId) hideContent(outgoingId);

          const outgoingProduct = state.currentProduct;
          const outgoingParent = state.originalParent;

          state.currentProduct = product;
          state.originalParent = product.parentNode;
          observer.unobserve(product);

          const flipState = Flip.getState(product);
          detailsThumb.appendChild(product);
          Flip.from(flipState, {
            absolute: true,
            duration: 0.9,
            ease: "power3.inOut",
          });

          if (outgoingProduct && outgoingParent) {
            outgoingParent.appendChild(outgoingProduct);
            gsap.set(outgoingProduct, {
              position: "",
              top: "",
              left: "",
              width: "",
              height: "",
              zIndex: "",
            });
            observer.observe(outgoingProduct);
          }

          revealContent(product.dataset.productId, 0.2);
        };

        const hideDetails = () => {
          state.showDetails = false;
          container.classList.remove("is-details-showing");

          gsap.to(container, {
            x: 0,
            duration: 1.2,
            delay: 0.3,
            ease: "power3.inOut",
            onComplete: () => details.classList.remove("is-showing"),
          });
          gsap.to(details, {
            x: panelWidth,
            duration: 1.2,
            delay: 0.3,
            ease: "power3.inOut",
          });

          unFlipProduct();

          const id = state.currentProduct?.dataset.productId;
          if (id) hideContent(id);
        };

        const onProductClick = (e) => {
          e.stopPropagation();
          const product = e.currentTarget;
          if (!state.showDetails) {
            showDetails(product);
          } else if (product === state.currentProduct) {
            hideDetails();
          } else {
            switchDetails(product);
          }
        };
        const onContainerClick = () => {
          if (state.showDetails) hideDetails();
        };
        const onCrossClick = (e) => {
          e.stopPropagation();
          if (state.showDetails) hideDetails();
        };

        centerGrid();
        const timeline = gsap.timeline();
        timeline.set(container, { scale: 0.5 });
        timeline.set(productEls, { scale: 0.5, opacity: 0 });
        timeline.to(productEls, {
          scale: 1,
          opacity: 1,
          duration: introDuration,
          ease: "power3.out",
          stagger: { amount: introStagger, from: "random" },
        });
        timeline.to(container, {
          scale: 1,
          duration: 1.2,
          ease: "power3.inOut",
          onComplete: () => {
            setupDraggable();
            productEls.forEach((el) => observer.observe(el));
            productEls.forEach((el) =>
              el.addEventListener("click", onProductClick),
            );
            container.addEventListener("click", onContainerClick);
            if (cross) cross.addEventListener("click", onCrossClick);
          },
        });

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMouseMove);

        state.cleanup = () => {
          timeline.kill();
          if (state.draggable) state.draggable.kill();
          observer.disconnect();
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("mousemove", onMouseMove);
          container.removeEventListener("click", onContainerClick);
          if (cross) cross.removeEventListener("click", onCrossClick);
          productEls.forEach((el) =>
            el.removeEventListener("click", onProductClick),
          );
          splitTitles.revert();
          splitPrices.revert();
          splitTexts.revert();
        };
      })
      .catch((e) =>
        console.error("[DraggableProductGrid] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (stateRef.current.cleanup) stateRef.current.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={containerRef}
        className="fixed top-0 left-0 w-screen h-screen [transform-origin:center_center] [will-change:transform]"
      >
        <div
          ref={gridRef}
          className="absolute w-max h-max flex"
          style={{ gap: gridGap }}
        >
          {columnData.map((column, colIndex) => (
            <div
              key={`${uid}-col-${colIndex}`}
              className="flex flex-col"
              style={{
                gap: gridGap,
                marginTop: colIndex % 2 === 1 ? "10vw" : "0",
              }}
            >
              {column.map((product) => (
                <div
                  key={`${uid}-${product._key}`}
                  className="relative [aspect-ratio:1/1] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                  style={{ width: tileSize }}
                >
                  <div
                    data-product-id={product.id}
                    className="relative w-full h-full [aspect-ratio:1/1]"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="absolute w-full h-full object-contain [will-change:transform]"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={detailsRef}
        className="fixed top-0 right-0 h-screen z-[6] flex flex-col justify-center gap-[3vw] p-[3vw_4vw] max-[600px]:w-[90%] max-[600px]:gap-8 max-[600px]:p-[8vw_7vw]"
        style={{
          width: panelWidth,
          backgroundColor: panelBgColor,
          transform: `translate3d(${panelWidth}, 0, 0)`,
        }}
      >
        <div
          ref={detailsThumbRef}
          className="relative z-[3] mx-auto [aspect-ratio:1/1] [will-change:transform] max-[600px]:w-full"
          style={{ width: "22vw" }}
        />

        <div className="relative grid text-center">
          {products.map((product) => (
            <p
              key={`title-${product.id}`}
              data-title={product.id}
              className="[grid-area:1/-1] overflow-hidden font-semibold text-neutral-800 leading-tight text-[2.4vw] max-[600px]:text-2xl"
            >
              {product.title}
            </p>
          ))}
        </div>

        <div className="relative grid text-center">
          {products.map((product) => (
            <p
              key={`price-${product.id}`}
              data-price={product.id}
              className="[grid-area:1/-1] overflow-hidden text-lg tracking-wide text-neutral-500"
            >
              {product.price}
            </p>
          ))}
        </div>

        <div className="relative grid mx-auto max-w-[26rem] text-center text-neutral-400 leading-relaxed">
          {products.map((product) => (
            <p
              key={`desc-${product.id}`}
              data-desc={product.id}
              className="[grid-area:1/-1]"
            >
              {product.description}
            </p>
          ))}
        </div>
      </div>

      <div
        ref={crossRef}
        className="fixed w-[3vw] h-[3vw] min-w-[36px] min-h-[36px] -translate-x-1/2 -translate-y-1/2 z-[20] cursor-pointer scale-0 flex items-center justify-center rounded-full hover:bg-black/5"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none"
        >
          <path
            d="M18 6L6 18"
            stroke={crossColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 6L18 18"
            stroke={crossColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
