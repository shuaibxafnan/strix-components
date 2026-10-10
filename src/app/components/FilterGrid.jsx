"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── FilterGrid ───────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// filters        string[]    Filter labels
// products       Product[]   See DEFAULT_PRODUCTS
// animDuration   number      350   Animation duration ms (runtime → Web Animations API)
// title          string      "Collection"  Hero section title
// subtitle       string      Season/edition line
// ─────────────────────────────────────────────────────────────────────────────
//
// Product shape:
// { image, name, rating, price, filters: string[] }
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = ["Best Sellers", "New Arrivals", "Hot Sales"];

const RAW_PRODUCTS = [
  {
    image:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=764&q=80",
    name: "Some Cool Shoes",
    rating: 5,
    price: "$65.99",
    filters: ["Best Sellers", "Hot Sales"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1483103068651-8ce44652c331?auto=format&fit=crop&w=764&q=80",
    name: "Super Dope Hat",
    rating: 3,
    price: "$38.99",
    filters: ["New Arrivals"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1585751092218-cea84c1ecf01?auto=format&fit=crop&w=764&q=80",
    name: "Radical Tie-dye Shirt",
    rating: 4,
    price: "$65.99",
    filters: ["New Arrivals", "Hot Sales"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1632226390535-2f02c1a93541?auto=format&fit=crop&w=764&q=80",
    name: "Very Suave Vest",
    rating: 5,
    price: "$65.99",
    filters: ["Best Sellers"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=764&q=80",
    name: "Basic Denim Pants",
    rating: 2,
    price: "$45.99",
    filters: ["Best Sellers", "New Arrivals"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1590316519564-ebeeca222a95?auto=format&fit=crop&w=764&q=80",
    name: "DJ Hoodie",
    rating: 5,
    price: "$79.99",
    filters: ["Hot Sales"],
  },
];

const DEFAULT_PRODUCTS = Array.from({ length: 4 }, () => RAW_PRODUCTS).flat();

export default function FilterGrid({
  filters = DEFAULT_FILTERS,
  products = DEFAULT_PRODUCTS,
  animDuration = 350,
  title = "Collection",
  subtitle = "SS 2025 — Limited Edition",
}) {
  const [active, setActive] = useState(null);
  const isAnimating = useRef(false);
  const gridRef = useRef(null);
  const productRefs = useRef([]);

  const easing = "ease";

  const resize = useCallback(() => {
    const els = productRefs.current;
    els.forEach((p) => {
      if (p) {
        p.style.height = "";
        p.style.width = "";
      }
    });
    const first = els.find((p) => p && !p.classList.contains("is-hidden"));
    if (!first) return;
    const { height, width } = getComputedStyle(first);
    els.forEach((p) => {
      if (p) {
        p.style.height = height;
        p.style.width = width;
      }
    });
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const makeSelection = async (filter) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const next = active === filter ? null : filter;
    setActive(next);

    const grid = gridRef.current;
    const els = productRefs.current.filter(Boolean);

    const hidden = (p) =>
      next !== null && !p.dataset.filter.split(",").includes(next);

    const gridStart = grid.offsetHeight;

    const starts = els.map((p) => ({
      hidden: p.classList.contains("is-hidden"),
      left: p.offsetLeft,
      top: p.offsetTop,
    }));

    els.forEach((p, i) => {
      if (hidden(p)) p.classList.add("is-hidden");
      else p.classList.remove("is-hidden");
    });

    const ends = els.map((p) => ({
      hidden: p.classList.contains("is-hidden"),
      left: p.offsetLeft,
      top: p.offsetTop,
    }));
    const gridEnd = grid.offsetHeight;

    const settings = { duration: animDuration, easing, fill: "forwards" };

    const gridAnim = grid.animate(
      [{ height: `${gridStart}px` }, { height: `${gridEnd}px` }],
      settings,
    );

    const productAnims = els.map((p, i) => {
      const prevHidden = starts[i].hidden;
      const curHidden = ends[i].hidden;
      const newlyHidden = !prevHidden && curHidden;
      const newlyVisible = prevHidden && !curHidden;
      const persistent = !prevHidden && !curHidden;

      const dx = starts[i].left - ends[i].left;
      const dy = starts[i].top - ends[i].top;

      if (newlyHidden) {
        p.style.left = `${starts[i].left}px`;
        p.style.top = `${starts[i].top}px`;
      }

      const outer = p.animate(
        [
          {
            transform: persistent
              ? `translate(${dx}px,${dy}px)`
              : `scale(${prevHidden ? 0 : 1})`,
          },
          {
            transform: persistent
              ? `translate(0,0)`
              : `scale(${curHidden ? 0 : 1})`,
          },
        ],
        settings,
      );

      const inner = p.querySelector(".product__inner");
      const innerAnim = inner.animate(
        [
          { transform: `scale(${newlyVisible ? "2,2" : "1,1"})` },
          { transform: `scale(${newlyHidden ? "2,2" : "1,1"})` },
        ],
        settings,
      );

      return Promise.all([outer.finished, innerAnim.finished]).then(() => {
        if (newlyHidden) {
          p.style.left = "";
          p.style.top = "";
        }
      });
    });

    await Promise.all([...productAnims, gridAnim.finished]);
    isAnimating.current = false;
  };

  const stars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-[10px] tracking-tighter ${i < rating ? "text-white/80" : "text-white/10"}`}
      >
        ★
      </span>
    ));

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&display=swap"
      />

      <style>{`
        .fg-root { background: #0e0e0e; font-family: 'DM Sans', sans-serif; }
        .fg-title { font-family: 'Cormorant Garamond', serif; }
        .product__image-inner {
          transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 0.85;
        }
        .product:hover .product__image-inner,
        .product:focus .product__image-inner {
          transform: scale(1.05);
          opacity: 1;
        }
        .product {
          transition-property: opacity, visibility;
          transition-duration: ${animDuration}ms;
          transition-timing-function: ease;
          will-change: opacity, visibility, transform;
        }
        .product.is-hidden {
          position: absolute;
          visibility: hidden;
          opacity: 0;
        }
        .product__inner { will-change: transform; }
        .filter-btn::after {
          content: '';
          display: block;
          height: 1px;
          background: white;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .filter-btn:hover::after,
        .filter-btn.is-active::after { transform: scaleX(1); }
      `}</style>

      <div className="fg-root min-h-screen w-screen text-white pb-24">
        {/* ── Hero bar ── */}
        <div className="w-full border-b border-white/10 px-6 md:px-16 py-12 flex items-end justify-between">
          <div>
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-2">
              {subtitle}
            </p>
            <h1 className="fg-title text-6xl md:text-8xl font-light leading-none tracking-tight">
              {title}
            </h1>
          </div>
          <p className="fg-title italic text-white/30 text-lg hidden md:block">
            No. 01
          </p>
        </div>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-0 z-20 w-full bg-[#0e0e0e]/90 backdrop-blur-md border-b border-white/10 px-6 md:px-16">
          <div className="flex items-center gap-10 py-5 overflow-x-auto">
            <span className="text-white/25 text-xs tracking-[0.25em] uppercase shrink-0">
              Filter
            </span>
            <div className="w-px h-4 bg-white/15 shrink-0" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => makeSelection(f)}
                className={`filter-btn shrink-0 text-sm tracking-wide pb-1 bg-transparent border-0 cursor-pointer transition-all duration-200 ${
                  active === f
                    ? "text-white is-active"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {f}
              </button>
            ))}
            {active && (
              <button
                onClick={() => makeSelection(active)}
                className="ml-auto shrink-0 text-xs text-white/30 hover:text-white/60 tracking-widest uppercase border border-white/15 px-3 py-1 transition-colors duration-200 bg-transparent cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Products grid ── */}
        <div className="px-6 md:px-16 py-12">
          <div
            ref={gridRef}
            className="products grid gap-4 relative will-change-[height]"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            }}
          >
            {products.map((p, i) => (
              <a
                key={i}
                href="#"
                ref={(el) => {
                  productRefs.current[i] = el;
                }}
                data-filter={p.filters.join(",")}
                className="product group relative overflow-hidden bg-[#0e0e0e] focus:outline-none"
              >
                <div className="product__inner flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-[#141414] rounded-sm mb-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="product__image-inner absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Index number */}
                    <span className="absolute top-4 left-4 fg-title italic text-white/10 text-4xl leading-none font-light select-none pointer-events-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Info Meta Stack */}
                  <div className="flex flex-col gap-1.5 px-0.5">
                    <span className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-medium">
                      {p.filters[0]}
                    </span>
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-normal text-white/90 leading-snug truncate">
                        {p.name}
                      </h4>
                      <span className="text-sm font-medium text-white/70 shrink-0">
                        {p.price}
                      </span>
                    </div>
                    <div className="flex gap-px leading-none pt-0.5">
                      {stars(p.rating)}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
