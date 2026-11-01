"use client";

import { useEffect, useRef } from "react";

const DEFAULT_PRODUCTS = [
  {
    name: "Candle holder",
    price: 25,
    images: [
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Cow vase",
    price: 40,
    images: [
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Chrome and blue book shelf",
    price: 200,
    images: [
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Wooden sidetable with smoke glass detail",
    price: 120,
    images: [
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Yellow armchair",
    price: 220,
    images: [
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Wooden cabinet with fluted glass",
    price: 200,
    images: [
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Orange clock",
    price: 30,
    images: [
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    name: "Red chair with chrome legs",
    price: 50,
    images: [
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    ],
  },
];

export default function GridToFullPreview({
  products = DEFAULT_PRODUCTS,
  bgColor = "#efefef",
  textColor = "#000",
  ctaBgColor = "rgba(0,0,0,0.8)",
  ctaTextColor = "#efefef",
  gridGap = "5vw",
  pagePadding = "1.5rem",
  armWidthVw = 5,
  shrinkVw = 5,
  hoverDelayMs = 100,
  gallerySlideSeconds = 0.5,
  breakpointMessage = "This preview is best suited for desktop.",
  ctaLabel = "Add to cart",
  currencySymbol = "€",
  placeholderTitle = "product title",
  className = "",
}) {
  const gridRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    if (!products.length) return;

    let cancelled = false;

    import("gsap")
      .then((mod) => {
        if (cancelled) return;
        const gsap = mod.gsap || mod.default;
        if (!gsap) return;

        const productEls = [
          ...gridRef.current.querySelectorAll("[data-product]"),
        ];
        const leftPanel = leftPanelRef.current;
        const rightPanel = rightPanelRef.current;

        const createPreviewController = (panelEl) => {
          const clipped = panelEl.querySelector("[data-mask]");
          const title = panelEl.querySelector("[data-preview-title]");
          const price = panelEl.querySelector("[data-preview-price]");
          const allImages = [
            ...panelEl.querySelectorAll("[data-preview-image]"),
          ];
          const imagesByIndex = {};
          allImages.forEach((img) => {
            const idx = img.dataset.productIndex;
            if (!imagesByIndex[idx]) imagesByIndex[idx] = [];
            imagesByIndex[idx].push(img);
          });

          const ctrl = {
            panelEl,
            clipped,
            title,
            price,
            allImages,
            imagesByIndex,
            timeline: null,
            galleryTimeline: null,
            scaleFactor: { x: 5, y: 5 },
            armWidth: { x: armWidthVw, y: armWidthVw },
            groupProducts: [],
          };

          const buildTimeline = () => {
            const { x, y } = ctrl.armWidth;
            ctrl.timeline = gsap
              .timeline({ paused: true, defaults: { ease: "power2.inOut" } })
              .addLabel("preview", 0)
              .addLabel("products", 0)
              .to(panelEl, { opacity: 1 }, "preview")
              .to(
                panelEl,
                {
                  scaleX: ctrl.scaleFactor.x,
                  scaleY: ctrl.scaleFactor.y,
                  transformOrigin: "center center",
                },
                "preview",
              )
              .to(
                ctrl.groupProducts,
                {
                  opacity: 0,
                  x: (i) => (i % 2 === 0 ? "2.5vw" : "-2.5vw"),
                  y: (i) => (i < 2 ? "2.5vw" : "-2.5vw"),
                },
                "products",
              )
              .fromTo(
                clipped,
                {
                  clipPath: `polygon(
                    ${50 - x / 2}% 0%,
                    ${50 + x / 2}% 0%,
                    ${50 + x / 2}% ${50 - y / 2}%,
                    100% ${50 - y / 2}%,
                    100% ${50 + y / 2}%,
                    ${50 + x / 2}% ${50 + y / 2}%,
                    ${50 + x / 2}% 100%,
                    ${50 - x / 2}% 100%,
                    ${50 - x / 2}% ${50 + y / 2}%,
                    0% ${50 + y / 2}%,
                    0% ${50 - y / 2}%,
                    ${50 - x / 2}% ${50 - y / 2}%
                  )`,
                },
                {
                  clipPath: `polygon(
                    50% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 50%, 50% 50%,
                    50% 100%, 50% 100%, 50% 50%, 0% 50%, 0% 50%, 50% 50%
                  )`,
                },
                "preview",
              );
          };

          const rebuildTimeline = () => {
            ctrl.timeline?.kill();
            buildTimeline();
          };

          const startGallery = (index) => {
            const images = ctrl.imagesByIndex[index];
            if (!images) return;
            const tl = gsap.timeline({ repeat: -1 });

            gsap.set([...images].slice(1), { opacity: 0 });
            images.forEach((image) => {
              tl.set(images, { opacity: 0 })
                .set(image, { opacity: 1 })
                .to(
                  image,
                  { duration: 0, opacity: 1 },
                  `+=${gallerySlideSeconds}`,
                );
            });
            ctrl.galleryTimeline = tl;
          };

          ctrl.setGroupProducts = (els) => {
            ctrl.groupProducts = els;
            rebuildTimeline();
          };

          ctrl.setProduct = (index) => {
            ctrl.galleryTimeline?.kill();

            if (index !== null && index !== undefined) {
              const product = products[index];
              title.textContent = product.name;
              price.textContent = product.price;

              gsap.set(ctrl.allImages, { opacity: 0 });
              gsap.set(ctrl.imagesByIndex[index], { opacity: 1 });

              ctrl.timeline.play();
              startGallery(index);
            } else {
              ctrl.timeline.reverse();
              ctrl.galleryTimeline?.kill();
            }
          };

          ctrl.onResize = () => {
            const { width, height } = panelEl.getBoundingClientRect();
            const vw = window.innerWidth / 100;

            const armWidthPx = armWidthVw * vw;
            ctrl.armWidth = {
              x: (armWidthPx / width) * 100,
              y: (armWidthPx / height) * 100,
            };

            const widthInVw = width / vw;
            const heightInVw = height / vw;
            ctrl.scaleFactor = {
              x: (widthInVw - shrinkVw) / widthInVw,
              y: (heightInVw - shrinkVw) / heightInVw,
            };

            rebuildTimeline();
          };

          return ctrl;
        };

        const leftController = createPreviewController(leftPanel);
        const rightController = createPreviewController(rightPanel);

        leftController.setGroupProducts(
          productEls.filter((_, i) => i % 4 === 0 || i % 4 === 1),
        );
        rightController.setGroupProducts(
          productEls.filter((_, i) => i % 4 === 2 || i % 4 === 3),
        );

        const getControllerFor = (index) => {
          const isLeftColumn = index % 4 === 0 || index % 4 === 1;
          return isLeftColumn ? rightController : leftController;
        };

        let hoverDelay = null;
        let activeIndex = null;

        const onEnter = (index) => {
          if (hoverDelay) clearTimeout(hoverDelay);
          hoverDelay = setTimeout(() => {
            activeIndex = index;
            getControllerFor(index).setProduct(index);
            hoverDelay = null;
          }, hoverDelayMs);
        };

        const onLeave = () => {
          if (hoverDelay) {
            clearTimeout(hoverDelay);
            hoverDelay = null;
          }
          if (activeIndex !== null) {
            getControllerFor(activeIndex).setProduct(null);
            activeIndex = null;
          }
        };

        const listeners = productEls.map((el, i) => {
          const enter = () => onEnter(i);
          const leave = () => onLeave();
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
          return { el, enter, leave };
        });

        leftController.onResize();
        rightController.onResize();

        let resizeT = null;
        const onResize = () => {
          clearTimeout(resizeT);
          resizeT = setTimeout(() => {
            leftController.onResize();
            rightController.onResize();
          }, 100);
        };
        window.addEventListener("resize", onResize);

        stateRef.current.cleanup = () => {
          clearTimeout(hoverDelay);
          clearTimeout(resizeT);
          window.removeEventListener("resize", onResize);
          listeners.forEach(({ el, enter, leave }) => {
            el.removeEventListener("mouseenter", enter);
            el.removeEventListener("mouseleave", leave);
          });
          leftController.timeline?.kill();
          rightController.timeline?.kill();
          leftController.galleryTimeline?.kill();
          rightController.galleryTimeline?.kill();
        };
      })
      .catch((e) =>
        console.error("[GridToFullPreview] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (stateRef.current.cleanup) stateRef.current.cleanup();
    };

  }, []);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden font-sans ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: pagePadding,
      }}
    >
      <p className="hidden max-[899px]:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        {breakpointMessage}
      </p>

      <div className="hidden min-[900px]:flex relative w-full h-full items-center justify-center">
        <ul
          ref={gridRef}
          className="relative grid grid-cols-4 grid-rows-2 w-full h-full p-12"
          style={{ rowGap: gridGap, columnGap: gridGap }}
        >
          {products.map((product, index) => (
            <li
              key={product.name}
              data-product
              data-index={index}
              className="group relative block w-full h-full [contain:size] cursor-pointer"
            >
              <div
                className="absolute top-1/2 left-0 right-0 z-[5] py-2.5 text-center opacity-0 -translate-y-1/2 pointer-events-none transition-opacity duration-100 ease-out group-hover:opacity-100"
                style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}
              >
                <p>{ctaLabel}</p>
              </div>
              <img
                src={product.images[0]}
                alt={product.name}
                className="relative w-full h-full object-cover"
              />
            </li>
          ))}
        </ul>

        <div
          className="hidden min-[900px]:grid absolute pointer-events-none z-[2] grid-cols-4 grid-rows-2"
          style={{
            inset: pagePadding,
            height: `calc(100% - ${pagePadding} * 2)`,
            width: `calc(100% - ${pagePadding} * 2)`,
            padding: "48px",
            rowGap: gridGap,
            columnGap: gridGap,
          }}
        >
          <div
            ref={leftPanelRef}
            className="relative w-full h-full [grid-column:auto/span_2] [grid-row:1/span_2] opacity-0"
          >
            <div className="grid w-full h-full overflow-hidden [grid-template-columns:auto] [grid-template-rows:auto]">
              {products.map(
                (product, pIndex) =>
                  (pIndex % 4 === 2 || pIndex % 4 === 3) &&
                  product.images.map((src, imgIndex) => (
                    <img
                      key={`${pIndex}-${imgIndex}-left`}
                      data-preview-image
                      data-product-index={pIndex}
                      src={src}
                      alt=""
                      className="[grid-column:1] [grid-row:1] opacity-0 w-full h-full object-cover"
                    />
                  )),
              )}
            </div>
            <div
              className="absolute z-[3] flex justify-between text-xs uppercase"
              style={{
                top: "calc(100% + 8px)",
                left: 0,
                width: "100%",
                color: textColor,
              }}
            >
              <p data-preview-title>{placeholderTitle}</p>
              <p>
                {currencySymbol} <span data-preview-price>0</span>
              </p>
            </div>
            <div
              data-mask
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: bgColor }}
            />
          </div>

          <div
            ref={rightPanelRef}
            className="relative w-full h-full [grid-column:auto/span_2] [grid-row:1/span_2] opacity-0"
          >
            <div className="grid w-full h-full overflow-hidden [grid-template-columns:auto] [grid-template-rows:auto]">
              {products.map(
                (product, pIndex) =>
                  (pIndex % 4 === 0 || pIndex % 4 === 1) &&
                  product.images.map((src, imgIndex) => (
                    <img
                      key={`${pIndex}-${imgIndex}-right`}
                      data-preview-image
                      data-product-index={pIndex}
                      src={src}
                      alt=""
                      className="[grid-column:1] [grid-row:1] opacity-0 w-full h-full object-cover"
                    />
                  )),
              )}
            </div>
            <div
              className="absolute z-[3] flex justify-between text-xs uppercase"
              style={{
                top: "calc(100% + 8px)",
                left: 0,
                width: "100%",
                color: textColor,
              }}
            >
              <p data-preview-title>{placeholderTitle}</p>
              <p>
                {currencySymbol} <span data-preview-price>0</span>
              </p>
            </div>
            <div
              data-mask
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: bgColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
