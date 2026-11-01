"use client";

const DEFAULT_IMAGES = [
  {
    src: "https://picsum.photos/id/593/600/600",
    alt: "Panthera Tigris",
    inverted: true,
  },
  {
    src: "https://picsum.photos/id/177/600/600",
    alt: "The Solitary Nomad",
    inverted: false,
  },
];

export default function TriangleImages({
  title = "Geometric Enclosures",
  subtitle = "MUSEUM ARCHIVE // VOL. 04",
  description = "A study on mask interpolation, contrasting angular point vectors against fluid photographic subjects.",
  images = DEFAULT_IMAGES,
  radius = "40px",
  hoverRadius = "8px",
  size = "310px",
  overlap = "90px",
  bg = "#0f0f11",
  className = "",
}) {
  return (
    <div
      className={`w-full h-screen flex items-center justify-center px-4 relative selection:bg-neutral-800 selection:text-white ${className}`}
      style={{ backgroundColor: bg }}
    >
      <style>{`
        @property --tri-r {
          syntax: "<length>";
          initial-value: ${radius};
          inherits: true;
        }

        .tri-mask-container {
          --tri-r: ${radius};
          transition: --tri-r 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tri-mask-container:hover {
          --tri-r: ${hoverRadius};
        }

        .tri-normal-clip {
          --_g: calc(tan(60deg) * var(--tri-r)) bottom var(--tri-r), #000 98%, #0000 101%;
          -webkit-mask:
            conic-gradient(from -30deg at 50% calc(200% - 3 * var(--tri-r) / 2), #000 60deg, #0000 0)
              0 100% / 100% calc(100% - 3 * var(--tri-r) / 2) no-repeat,
            radial-gradient(var(--tri-r) at 50% calc(2 * var(--tri-r)), #000 98%, #0000 101%),
            radial-gradient(var(--tri-r) at left var(--_g)),
            radial-gradient(var(--tri-r) at right var(--_g));
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
        }

        .tri-inverted-clip {
          --_g: calc(tan(60deg) * var(--tri-r)) top var(--tri-r), #000 98%, #0000 101%;
          -webkit-mask:
            conic-gradient(from 150deg at 50% calc(3 * var(--tri-r) / 2 - 100%), #000 60deg, #0000 0)
              0 0 / 100% calc(100% - 3 * var(--tri-r) / 2) no-repeat,
            radial-gradient(var(--tri-r) at 50% calc(100% - 2 * var(--tri-r)), #000 98%, #0000 101%),
            radial-gradient(var(--tri-r) at left var(--_g)),
            radial-gradient(var(--tri-r) at right var(--_g));
          clip-path: polygon(50% 100%, 100% 0, 0 0);
        }
      `}</style>

      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col items-center gap-14 px-4 py-12 sm:px-20 sm:py-20 rounded-[2.5rem] bg-[#16161a]/60 backdrop-blur-xl border border-white/[0.06] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.7)] w-full max-w-5xl max-h-full overflow-y-auto overflow-x-hidden">
        <div className="absolute -top-40 w-96 h-96 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

        <header className="w-full flex flex-col items-center text-center gap-4 max-w-md border-b border-white/[0.06] pb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/40">
              {subtitle}
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight leading-none italic font-light">
              {title}
            </h1>
            <p className="font-mono text-[11px] text-white/30 leading-relaxed">
              {description}
            </p>
          </div>
        </header>

        <div
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 w-full"
          style={{ "--tri-o": overlap }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`tri-mask-container relative group/item max-w-full shrink-0 ${
                i > 0 ? "md:ml-[calc(-1*var(--tri-o))]" : ""
              }`}
              style={{
                width: size,
                aspectRatio: "1 / cos(30deg)",
                zIndex: i + 1,
              }}
            >
              <div className="w-full h-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:scale-[1.03] group-hover/item:z-30 relative">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className={`w-full h-full object-cover cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] filter saturate-[0.7] brightness-[0.85] contrast-[1.05] group-hover/item:filter group-hover/item:saturate-[1.1] group-hover/item:brightness-[1.02] ${
                    img.inverted ? "tri-inverted-clip" : "tri-normal-clip"
                  }`}
                />
                <div
                  className={`absolute inset-0 pointer-events-none opacity-20 group-hover/item:opacity-40 transition-opacity duration-500 bg-gradient-to-b from-white/10 to-transparent ${
                    img.inverted ? "tri-inverted-clip" : "tri-normal-clip"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <footer className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-white/[0.04] pt-8 w-full">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex items-center gap-2 group/label cursor-default"
            >
              <span className="font-mono text-[9px] text-white/20 group-hover/label:text-white/60 transition-colors duration-300">
                // 0{i + 1}
              </span>
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] group-hover/label:text-white/80 transition-colors duration-300">
                {img.alt}
              </span>
            </div>
          ))}
        </footer>

        <span className="absolute top-5 left-5 font-mono text-[8px] text-white/10 pointer-events-none select-none">
          [+]
        </span>
        <span className="absolute top-5 right-5 font-mono text-[8px] text-white/10 pointer-events-none select-none">
          [+]
        </span>
        <span className="absolute bottom-5 left-5 font-mono text-[8px] text-white/10 pointer-events-none select-none">
          [+]
        </span>
        <span className="absolute bottom-5 right-5 font-mono text-[8px] text-white/10 pointer-events-none select-none">
          [+]
        </span>
      </div>
    </div>
  );
}
