"use client";

import { useEffect, useRef, useState } from "react";

// ─── AddToCart ───────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// products             array    (built-in)   Product list: { id, name, price, cover }
// galleryCount         number   6            How many copies of the cover fly to the cart
// columns              number   3            Desktop grid columns (also decides "top row")
// currency             string   "€"          Symbol prefixed to every price
// bgColor              string   #EFEFEF      Page + cart panel background
// textColor            string   #111         Base text color
// accentColor          string   #D9D9D9      Button / badge fill
// hoverColor           string   #C9C9C9      Button hover fill
// overlayColor         string   rgba(255,255,255,0.8)  Backdrop behind the cart panel
// mutedColor           string   rgba(0,0,0,0.2)        "Remove" link color
// panelWidth           number   600          Cart panel width in px (desktop)
// imageHeight          string   32vh         Product image block height
// gridGap              string   2vh          Gap between product cards
// flyDuration          number   1.8          Duration of the cover→cart flight (s)
// flyEase              string   power2.inOut Ease of the flight
// flyStagger           number   0.04         Per-copy stagger of the flight (s)
// dimScale             number   0.8          Scale of the non-clicked products while flying
// dimOpacity           number   0.05         Opacity of the non-clicked products while flying
// focusScale           number   1.05         Scale pulse applied to the clicked product
// arcScale             number   0.5          Mid-flight scale for bottom-row products
// arcScaleTop          number   0.8          Mid-flight scale for top-row products
// arcDistance          number   1.5          Mid-flight vertical offset (× image height)
// badgeOffset          number   -35          X shift of the "Cart" label when badge appears
// badgeEase            string   elastic.out(1.3, 0.9)  Ease of the badge pop-in
// panelEnterDuration   number   2.2          Panel slide-in duration (s)
// panelLeaveDuration   number   1.5          Panel slide-out duration (s)
// panelEase            string   expo.inOut   Ease of the panel slide
// contentEase          string   power2.out   Ease of the panel's inner elements
// lockScroll           boolean  true         Freeze page scroll while the cart is open
// closeOnOverlay       boolean  true         Clicking the backdrop closes the cart
// emptyLabel           string   "Your cart is empty"  Shown when no items
// checkoutLabel        string   "Checkout"   Text of the checkout button
// onAdd                func     undefined    Called with the product after it is added
// onCheckout           func     undefined    Called with (items, total) on checkout click
// className            string   ""           Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_PRODUCTS = [
  { id: "product-01", name: "Product 01", price: 15 },
  { id: "product-02", name: "Product 02", price: 8 },
  { id: "product-03", name: "Product 03", price: 12 },
  { id: "product-04", name: "Product 04", price: 5 },
  { id: "product-05", name: "Product 05", price: 20 },
  { id: "product-06", name: "Product 06", price: 8 },
].map((p, i) => ({ ...p, cover: IMAGES[i] }));

export default function ShopCartFly({
  products = DEFAULT_PRODUCTS,
  galleryCount = 6,
  columns = 3,
  currency = "€",
  bgColor = "#EFEFEF",
  textColor = "#111",
  accentColor = "#D9D9D9",
  hoverColor = "#C9C9C9",
  overlayColor = "rgba(255,255,255,0.8)",
  mutedColor = "rgba(0,0,0,0.2)",
  panelWidth = 600,
  imageHeight = "32vh",
  gridGap = "2vh",
  flyDuration = 1.8,
  flyEase = "power2.inOut",
  flyStagger = 0.04,
  dimScale = 0.8,
  dimOpacity = 0.05,
  focusScale = 1.05,
  arcScale = 0.5,
  arcScaleTop = 0.8,
  arcDistance = 1.5,
  badgeOffset = -35,
  badgeEase = "elastic.out(1.3, 0.9)",
  panelEnterDuration = 2.2,
  panelLeaveDuration = 1.5,
  panelEase = "expo.inOut",
  contentEase = "power2.out",
  lockScroll = true,
  closeOnOverlay = true,
  emptyLabel = "Your cart is empty",
  checkoutLabel = "Checkout",
  onAdd,
  onCheckout,
  className = "",
}) {
  const [items, setItems] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const gsapRef = useRef(null);
  const itemsRef = useRef([]);
  const flightBusyRef = useRef(false);
  const panelBusyRef = useRef(false);
  const badgeShownRef = useRef(false);

  const rootRef = useRef(null);
  const productRefs = useRef([]);
  const buttonRef = useRef(null);
  const labelRef = useRef(null);
  const badgeRef = useRef(null);
  const badgeBgRef = useRef(null);
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const panelBgRef = useRef(null);
  const closeRef = useRef(null);
  const listRef = useRef(null);
  const totalRef = useRef(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

    let cancelled = false;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (cancelled || !gsap || !rootRef.current) return;
        gsapRef.current = gsap;

        gsap.set([badgeRef.current, badgeBgRef.current], { scale: 0 });
        gsap.set(panelRef.current, { xPercent: 100 });
        gsap.set([overlayRef.current, panelBgRef.current], { xPercent: 110 });
        gsap.set(closeRef.current, { x: 30, autoAlpha: 0 });
        gsap.set(totalRef.current.children, { scale: 0.9, autoAlpha: 0 });
      })
      .catch((e) => console.error("[AddToCart] GSAP load failed:", e.message));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, []);

  const pushItem = (product) => {
    setItems((prev) => {
      const index = prev.findIndex((it) => it.id === product.id);
      if (index < 0) return [...prev, { ...product, quantity: 1 }];
      const next = [...prev];
      next[index] = { ...next[index], quantity: next[index].quantity + 1 };
      return next;
    });
    if (onAdd) onAdd(product);
  };

  const changeQuantity = (id, delta) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, quantity: it.quantity + delta } : it,
        )
        .filter((it) => it.quantity > 0),
    );
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const playBadge = () => {
    const gsap = gsapRef.current;
    if (!gsap || badgeShownRef.current) return;
    badgeShownRef.current = true;

    const tl = gsap.timeline();
    tl.addLabel("start");
    tl.to(
      labelRef.current,
      { x: badgeOffset, duration: 0.4, ease: "power2.out" },
      "start",
    );
    tl.to(
      [badgeRef.current, badgeBgRef.current],
      { scale: 1, stagger: 0.1, duration: 0.8, ease: badgeEase },
      "start",
    );
  };

  const addToCart = (index) => {
    const gsap = gsapRef.current;
    const product = products[index];
    const productEl = productRefs.current[index];

    if (!gsap || !productEl) {
      playBadge();
      pushItem(product);
      return;
    }
    if (flightBusyRef.current) return;
    flightBusyRef.current = true;

    const release = () => {
      flightBusyRef.current = false;
    };

    let tl;
    try {
      const galleryWrap = productEl.querySelector("[data-gallery]");
      const galleryItems = [...galleryWrap.querySelectorAll("img")];
      const others = productRefs.current.filter(
        (el, i) => i !== index && Boolean(el),
      );
      const isTopRow = window.innerWidth > 768 && index < columns;

      const buttonBox = buttonRef.current.getBoundingClientRect();
      gsap.set(galleryWrap, { autoAlpha: 1 });
      gsap.set(galleryItems, {
        transformOrigin: isTopRow ? "top right" : "bottom left",
      });

      const { y, left, right, height } =
        galleryItems[0].getBoundingClientRect();

      tl = gsap.timeline({
        onComplete: () => {
          gsap.set(galleryItems, { scale: 1, autoAlpha: 1, x: 0, y: 0 });
          gsap.set(galleryWrap, { autoAlpha: 0 });
          release();
        },
        onInterrupt: release,
      });
      tl.addLabel("start");

      if (others.length) {
        tl.to(
          others,
          {
            scale: dimScale,
            autoAlpha: dimOpacity,
            duration: 0.6,
            stagger: 0.04,
            ease: "power2.out",
          },
          "start",
        );
      }

      tl.to(
        productEl,
        { scale: focusScale, duration: 1, ease: "power2.out" },
        "start+=0.7",
      );

      tl.to(
        galleryItems,
        {
          keyframes: {
            "40%": {
              y: isTopRow ? height * arcDistance : -height * arcDistance,
              scale: isTopRow ? arcScaleTop : arcScale,
              autoAlpha: 1,
            },
            "100%": {
              x: isTopRow ? buttonBox.x - right : buttonBox.x - left - 12,
              y: isTopRow ? buttonBox.y - y : buttonBox.y - y - height + 25,
              scale: 0,
              autoAlpha: 0,
            },
          },
          stagger: { from: "end", each: flyStagger },
          duration: flyDuration,
          ease: flyEase,
        },
        "start",
      );

      tl.add(() => {
        playBadge();
        pushItem(product);
      }, "start+=0.6");

      tl.to(
        [productEl, ...others],
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.03,
          ease: "power2.out",
        },
        "start+=1.6",
      );
    } catch (e) {
      console.error("[AddToCart] flight failed:", e.message);
      if (tl) tl.kill();
      release();
      playBadge();
      pushItem(product);
    }
  };

  const openCart = () => {
    if (isOpen || panelBusyRef.current) return;
    const gsap = gsapRef.current;

    setIsOpen(true);
    if (lockScroll) document.body.style.overflow = "hidden";
    if (panelRef.current) panelRef.current.style.visibility = "visible";
    if (!gsap) return;

    panelBusyRef.current = true;

    const rows = [...listRef.current.querySelectorAll("[data-cart-row]")];
    if (rows.length) gsap.set(rows, { x: 30, autoAlpha: 0 });

    const finish = () => {
      panelBusyRef.current = false;
    };

    const tl = gsap.timeline({
      onStart: () => gsap.set(panelRef.current, { xPercent: 0 }),
      onComplete: finish,
      onInterrupt: finish,
    });
    tl.addLabel("start");

    tl.to(
      [overlayRef.current, panelBgRef.current],
      {
        xPercent: 0,
        stagger: 0.1,
        duration: panelEnterDuration,
        ease: panelEase,
      },
      "start",
    );
    tl.to(
      closeRef.current,
      { x: 0, autoAlpha: 1, duration: 1, ease: contentEase },
      "start+=1.3",
    );
    if (rows.length) {
      tl.to(
        rows,
        { x: 0, autoAlpha: 1, stagger: 0.1, duration: 1, ease: contentEase },
        "start+=1.4",
      );
    }
    tl.to(
      totalRef.current.children,
      { scale: 1, autoAlpha: 1, stagger: 0.1, duration: 1, ease: contentEase },
      "start+=1.6",
    );
  };

  const closeCart = () => {
    if (!isOpen || panelBusyRef.current) return;
    const gsap = gsapRef.current;

    if (lockScroll) document.body.style.overflow = "";
    if (!gsap) {
      setIsOpen(false);
      return;
    }

    panelBusyRef.current = true;

    const rows = [...listRef.current.querySelectorAll("[data-cart-row]")];

    const finish = () => {
      gsap.set(panelRef.current, { xPercent: 100 });
      panelBusyRef.current = false;
      setIsOpen(false);
    };

    const tl = gsap.timeline({ onComplete: finish, onInterrupt: finish });
    tl.addLabel("start");

    tl.to(
      [overlayRef.current, panelBgRef.current],
      {
        xPercent: 110,
        stagger: 0.1,
        duration: panelLeaveDuration,
        ease: panelEase,
      },
      "start",
    );
    if (rows.length) {
      tl.to(
        rows,
        { x: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: contentEase },
        "start",
      );
    }
    tl.to(
      closeRef.current,
      { x: 30, autoAlpha: 0, duration: 0.8, ease: contentEase },
      "start",
    );
    tl.to(
      totalRef.current.children,
      {
        scale: 0.9,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: contentEase,
      },
      "start",
    );
  };

  const total = items.reduce(
    (sum, it) => sum + Number(it.price) * it.quantity,
    0,
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full min-h-screen overflow-x-hidden antialiased ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <header className="pointer-events-none fixed top-0 left-0 z-[1002] flex w-full items-start justify-end p-6 md:px-12 md:py-8">
        <button
          type="button"
          ref={buttonRef}
          onClick={openCart}
          className="pointer-events-auto relative cursor-pointer select-none text-left text-[16px]"
        >
          <span ref={labelRef} className="relative inline-block">
            <span>Cart</span>
            <span
              className="absolute bottom-0 left-0 h-px w-full"
              style={{ backgroundColor: textColor }}
            />
          </span>

          <span className="absolute top-1/2 right-0 grid -translate-y-1/2 items-center justify-center [grid-template-areas:'element']">
            <span
              ref={badgeBgRef}
              className="h-[25px] w-[25px] rounded-full [grid-area:element]"
              style={{ backgroundColor: accentColor }}
            />
            <span
              ref={badgeRef}
              className="text-center text-[12px] [grid-area:element]"
            >
              {items.length}
            </span>
          </span>
        </button>
      </header>

      <section className="relative flex w-full flex-col items-center justify-center p-6 md:min-h-screen md:px-12 md:py-8">
        <ul
          className="grid w-full grid-cols-1"
          style={{
            gap: gridGap,
            gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
          }}
        >
          {products.map((product, i) => (
            <li
              key={product.id}
              ref={(el) => {
                productRefs.current[i] = el;
              }}
              className="relative flex flex-col"
              style={{ gap: gridGap, zIndex: products.length - i }}
            >
              <div className="relative w-full" style={{ height: imageHeight }}>
                <img
                  src={product.cover}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

                <div
                  data-gallery
                  className="pointer-events-none absolute inset-0 grid opacity-0 [grid-auto-columns:100%] [grid-template-areas:'gallery'] [grid-template-rows:100%]"
                >
                  {Array.from({ length: galleryCount }).map((_, g) => (
                    <img
                      key={g}
                      src={product.cover}
                      alt=""
                      className="h-full w-full object-cover [grid-area:gallery]"
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => addToCart(i)}
                onMouseEnter={() => setHovered(`p-${i}`)}
                onMouseLeave={() => setHovered(null)}
                className="self-end justify-self-end px-[10px] py-[8px] text-[15px] leading-none transition-colors duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]"
                style={{
                  backgroundColor:
                    hovered === `p-${i}` ? hoverColor : accentColor,
                  color: textColor,
                }}
              >
                Add to cart
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside
        ref={panelRef}
        className="fixed inset-0 z-[1001]"
        style={{
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div
          ref={overlayRef}
          onClick={closeOnOverlay ? closeCart : undefined}
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />

        <div
          className="absolute top-5 right-5 flex h-[calc(100vh-40px)] max-w-[calc(100%-40px)] flex-col justify-between px-5 pt-[100px] pb-5 md:pt-[120px]"
          style={{ width: panelWidth }}
        >
          <button
            type="button"
            ref={closeRef}
            onClick={closeCart}
            className="absolute top-5 left-5 z-[2] cursor-pointer text-[16px] underline"
          >
            Close
          </button>

          <div
            ref={panelBgRef}
            className="absolute inset-0 z-0"
            style={{ backgroundColor: bgColor }}
          />

          <div
            ref={listRef}
            className="relative z-[1] flex h-[65vh] flex-col gap-[30px] overflow-y-auto overflow-x-hidden pb-[60px] md:gap-[60px]"
          >
            {items.length === 0 ? (
              <span className="text-[14px]" style={{ color: mutedColor }}>
                {emptyLabel}
              </span>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  data-cart-row
                  className="relative grid grid-cols-[60px_auto] items-end gap-[30px] md:grid-cols-[100px_auto] md:gap-[60px]"
                >
                  <img
                    src={item.cover}
                    alt={item.name}
                    className="h-[60px] w-[60px] object-cover md:h-[100px] md:w-[100px]"
                  />

                  <div className="flex w-full flex-col gap-[10px] text-[14px] md:gap-[20px]">
                    <span className="font-medium">{item.name}</span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute top-0 right-0 font-medium underline"
                      style={{ color: mutedColor }}
                    >
                      Remove
                    </button>

                    <div className="flex w-full justify-between">
                      <span>Quantity:</span>

                      <div className="flex items-center gap-[20px]">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>

                      <span>
                        {currency} {item.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="relative z-[1] grid w-full grid-cols-[60px_auto] gap-[30px] md:grid-cols-[100px_auto] md:gap-[60px]">
            <div
              ref={totalRef}
              className="col-start-2 grid grid-cols-2 grid-rows-2 gap-[15px] md:gap-[30px]"
            >
              <div className="font-medium">Total:</div>
              <div className="text-right">
                {currency} {total}
              </div>
              <div className="text-[9px] md:text-[12px]">
                Delivery fee and tax
                <br />
                calculated at checkout
              </div>
              <button
                type="button"
                onMouseEnter={() => setHovered("checkout")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onCheckout && onCheckout(items, total)}
                className="self-end justify-self-end px-[10px] py-[8px] text-[15px] leading-none transition-colors duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]"
                style={{
                  backgroundColor:
                    hovered === "checkout" ? hoverColor : accentColor,
                  color: textColor,
                }}
              >
                {checkoutLabel}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
