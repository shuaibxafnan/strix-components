"use client";

import { useEffect, useId, useRef } from "react";

const IMG = (n) =>
  `https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/${n}.png`;

const DEFAULT_PRODUCTS = [
  {
    id: "1",
    image: IMG('pattern-brown'),
    title: "Crimson Amphora",
    price: "$300,00",
    description:
      "This bold red vase stands out with its vibrant hue, a perfect centerpiece to add passion and energy to any room.",
  },
  {
    id: "2",
    image: IMG('duo-brown'),
    title: "Rustic Urn",
    price: "$220,00",
    description:
      "With its earthy tones and natural speckled finish, this rustic vase evokes the charm of handcrafted pottery.",
  },
  {
    id: "3",
    image: IMG('deform-blue'),
    title: "Golden Vessel",
    price: "$240,00",
    description:
      "Bright and cheerful, the yellow vase radiates positivity. Its glossy surface reflects light beautifully.",
  },
  {
    id: "4",
    image: IMG('clay'),
    title: "Sunlit Amphora",
    price: "$300,00",
    description:
      "Generous in size and striking in presence, the large yellow vase makes a bold decorative statement.",
  },
  {
    id: "5",
    image: IMG('solid-dblue'),
    title: "Midnight Reliquary",
    price: "$390,00",
    description:
      "Sleek and sophisticated, the black vase embodies timeless elegance.",
  },
  {
    id: "6",
    image: IMG('brown-solid'),
    title: "Amber Ewer",
    price: "$340,00",
    description:
      "A playful mix of texture and color, the speckled yellow vase is both lively and unique.",
  },
  {
    id: "7",
    image: IMG('duo-blue'),
    title: "Sylvan Chalice",
    price: "$240,00",
    description:
      "Crafted from natural wood, this vase celebrates organic beauty and timeless simplicity.",
  },
];

export default function DraggableVaseGrid({
  products = DEFAULT_PRODUCTS,
  columns = 10,
  itemsPerColumn = 5,
  tileSize = "15vw",
  gridGap = "5vw",
  bgColor = "#fff",
  panelBgColor = "#f1f1f1",
  panelWidth = "50vw",
  crossColor = "#313131",
  introDuration = 0.6,
  introStagger = 1.2,
  dragInertia = true,
  className = "",
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

    (async () => {
      const [
        { default: gsap },
        { Draggable },
        { Flip },
        { SplitText },
        { InertiaPlugin },
      ] = await Promise.all([
        import("gsap"),
        import("gsap/Draggable"),
        import("gsap/Flip"),
        import("gsap/SplitText"),
        import("gsap/InertiaPlugin"),
      ]);
      if (cancelled) return;
      {
        gsap.registerPlugin(Draggable, Flip, SplitText, InertiaPlugin);

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
        state.dragged = false;
        state.introDone = false;

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

        centerGrid();

        state.draggable = Draggable.create(grid, {
          type: "x,y",
          bounds: getBounds(),
          inertia: dragInertia,
          edgeResistance: 0.9,
          onDragStart: () => {
            state.dragged = true;
            container.classList.add("is-dragging");
          },
          onDragEnd: () => {
            container.classList.remove("is-dragging");
            clearTimeout(state.dragTimer);
            state.dragTimer = setTimeout(() => {
              state.dragged = false;
            }, 50);
          },
        })[0];

        const onWheel = (e) => {
          e.preventDefault();
          const deltaX = -e.deltaX * 7;
          const deltaY = -e.deltaY * 7;
          const currentX = gsap.getProperty(grid, "x");
          const currentY = gsap.getProperty(grid, "y");
          const bounds = getBounds();
          gsap.to(grid, {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, currentX + deltaX)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, currentY + deltaY)),
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
        const reverters = [splitTitles, splitPrices, splitTexts];


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

        const hideContent = (id) => {
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
            });
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

          const id = state.currentProduct?.dataset.productId;

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
          if (id) hideContent(id);
        };

        const onProductClick = (e) => {
          e.stopPropagation();
          if (state.dragged || !state.introDone) return;
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
          if (state.dragged) return;
          if (state.showDetails) hideDetails();
        };
        const onCrossClick = (e) => {
          e.stopPropagation();
          if (state.showDetails) hideDetails();
        };

        productEls.forEach((el) => el.addEventListener("click", onProductClick));
        container.addEventListener("click", onContainerClick);
        if (cross) cross.addEventListener("click", onCrossClick);
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMouseMove);

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
            container.classList.add("is-loaded");
            state.introDone = true;
            if (state.draggable) state.draggable.vars.bounds = getBounds();
            productEls.forEach((el) => observer.observe(el));
          },
        });

        state.cleanup = () => {
          timeline.kill();
          clearTimeout(state.dragTimer);
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
          reverters.forEach((r) => r.revert());
          state.cleanup = null;
        };
      }
    })();

    return () => {
      cancelled = true;
      if (stateRef.current.cleanup) stateRef.current.cleanup();
    };
  }, []);


  return (
    <div
      ref={rootRef}
      className={`relative h-screen w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={containerRef}
        className="fixed left-0 top-0 h-screen w-screen [transform-origin:center_center] [will-change:transform]"
      >
        <div
          ref={gridRef}
          className="absolute flex h-max w-max cursor-grab select-none active:cursor-grabbing"
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
                  className="relative cursor-pointer transition-transform duration-300 ease-in-out [aspect-ratio:1/1] hover:scale-105"
                  style={{ width: tileSize }}
                >
                  <div
                    data-product-id={product.id}
                    className="relative h-full w-full [aspect-ratio:1/1]"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="absolute h-full w-full select-none object-cover [-webkit-user-drag:none] [will-change:transform]"
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
        className="fixed right-0 top-0 z-[6] flex h-screen flex-col justify-center gap-[3vw] p-[3vw_4vw] max-[600px]:w-[90%] max-[600px]:gap-8 max-[600px]:p-[8vw_7vw]"
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
              className="overflow-hidden text-[2.4vw] font-semibold leading-tight text-neutral-800 [grid-area:1/-1] max-[600px]:text-2xl"
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
              className="overflow-hidden text-lg tracking-wide text-neutral-500 [grid-area:1/-1]"
            >
              {product.price}
            </p>
          ))}
        </div>

        <div className="relative mx-auto grid max-w-[26rem] text-center leading-relaxed text-neutral-400">
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
        className="fixed left-0 top-0 z-[20] flex h-[3vw] min-h-[36px] w-[3vw] min-w-[36px] cursor-pointer items-center justify-center rounded-full [transform:translate(-50%,-50%)_scale(0)] hover:bg-black/5"
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