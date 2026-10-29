"use client";

import { useEffect, useState } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
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

const MASK = {
  h1: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 223 89' preserveAspectRatio='none' %3E%3Cpath d='M18.127371,5.04838291 C31.1256245,7.57484423 59.9868927,-0.975054589 93.3884121,8.13692744 C139.992573,20.8506089 177.959962,-9.33442959 204.128023,3.04838291 C230.296083,15.4311954 225.346695,67.2735046 208.128037,81.0483829 C190.909379,94.8232612 169.041962,76.6577579 118.127721,85.0483829 C67.2134805,93.4390079 57.1900079,81.0483829 31.1274166,84.0483829 C5.06482523,87.0483829 -16.8415015,-1.74849209 18.127371,5.04838291 Z' %3E%3C/path%3E%3C/svg%3E")`,
  h2: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 221 90' preserveAspectRatio='none' %3E%3Cpath d='M197.272623,82.9660647 C184.274369,80.4396034 161.164062,79.8775202 129.011582,79.8775202 C72.76348,79.8775202 44.4400315,97.3488772 18.271971,84.9660647 C-7.89608947,72.5832522 -2.94670124,20.740943 14.271957,6.96606469 C31.4906152,-6.8088136 45.3580315,11.3566897 96.2722724,2.96606469 C147.186513,-5.42456031 165.209986,6.96606469 191.272577,3.96606469 C199.844751,2.97934314 208.9673,3.92320166 214.764424,16.1300648 C226.59271,41.0365993 220.739982,87.5273987 197.272623,82.9660647 Z'%3E%3C/path%3E%3C/svg%3E")`,
  h3: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 218 87' preserveAspectRatio='none' %3E%3Cpath d='M196.272623,80.9660647 C183.862674,83.9760328 155.540265,90.2010374 128.011582,83.8775202 C47.0039063,65.2695313 40.4400315,95.3488772 14.271971,82.9660647 C-11.8960895,70.5832522 5.27194295,27.7875981 11.271957,13.9660647 C17.271971,0.14453125 28.0857591,11.390625 79,3 C129.914241,-5.390625 150.209986,6.96606469 176.272577,3.96606469 C184.844751,2.97934314 206.9673,13.9232017 212.764424,26.1300648 C224.59271,51.0365993 212.764424,76.9660647 196.272623,80.9660647 Z'%3E%3C/path%3E%3C/svg%3E")`,
  v1: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 87 218' preserveAspectRatio='none' %3E%3Cpath d='M80.9378811,196.090954 C83.9478492,183.681005 90.1728538,155.358596 83.8493366,127.829913 C65.2413477,46.822237 95.3206936,40.2583622 82.9378811,14.0903017 C70.5550686,-12.0777588 27.7594145,5.09027366 13.9378811,11.0902877 C0.116347654,17.0903017 11.3624414,27.9040898 2.9718164,78.8183307 C-5.4188086,129.732572 6.9378811,150.028317 3.9378811,176.090908 C2.95115954,184.663082 13.8950181,206.785631 26.1018812,212.582755 C51.0084157,224.41104 76.9378811,212.582755 80.9378811,196.090954 Z'%3E%3C/path%3E%3C/svg%3E")`,
  v2: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 221' preserveAspectRatio='none' %3E%3Cpath d='M82.9660647,197.272623 C80.4396034,184.274369 79.8775202,161.164062 79.8775202,129.011582 C79.8775202,72.76348 97.3488772,44.4400315 84.9660647,18.271971 C72.5832522,-7.89608947 20.740943,-2.94670124 6.96606469,14.271957 C-6.8088136,31.4906152 11.3566897,45.3580315 2.96606469,96.2722724 C-5.42456031,147.186513 6.96606469,165.209986 3.96606469,191.272577 C2.97934314,199.844751 3.92320166,208.9673 16.1300648,214.764424 C41.0365993,226.59271 87.5273987,220.739982 82.9660647,197.272623 Z'%3E%3C/path%3E%3C/svg%3E")`,
  frameVert: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 232' preserveAspectRatio='none' %3E%3Cpath d='M23.9311912,12.8389883 C68.2881986,-3.16175013 127.377784,-7.792675 148.446739,20.1472416 C169.515693,48.0871581 155.326363,55.2549232 155.326363,88.1472416 C155.326363,121.03956 156.118336,158.45261 146.803652,189.838988 C137.488968,221.225367 24.7913372,251.448023 10.4689449,214.838988 C-3.85344736,178.229954 10.4689449,185.550626 10.4689449,128.147242 C10.4689449,99.8542728 -20.4258161,28.8397268 23.9311912,12.8389883 Z'%3E%3C/path%3E%3C/svg%3E")`,
  frameHor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 215 142' preserveAspectRatio='none' %3E%3Cpath d='M197.288943,20.6407321 C215.928771,41.2266394 229.381896,139.074296 184.289031,133.55699 C139.196166,128.039685 131.742771,131.557076 98.8506455,131.557076 C65.95852,131.557076 30.5086724,153.467434 13.2901151,131.557076 C-3.92844224,109.646717 -6.87779204,29.2800545 19.2901151,9.58391986 C45.4580222,-10.1122148 54.0239243,20.6407321 98.8506455,3.91023312 C120.886075,-4.31396268 178.649115,0.0548248444 197.288943,20.6407321 Z'%3E%3C/path%3E%3C/svg%3E")`,
};

const TILE_MASKS = [
  "v2", "v1", "h1", "v2", "h2", "v2", "v2", "h3", "h2", "v2", "v1", "h3", "h1",
  "v2", "v1", "v2", "h2", "h1", "h3", "v1", "v2", "v2", "h1", "h2", "h3",
];

const GRID_AREAS = [
  "pic22 pic23 pic23 pic24 pic24 pic25 pic25",
  "pic22 pic11 pic12 pic12 pic13 pic13 pic14",
  "pic21 pic11 pic4 pic5 pic5 pic6 pic14",
  "pic21 pic10 pic4 pic1 pic2 pic6 pic15",
  "pic20 pic10 pic3 pic3 pic2 pic7 pic15",
  "pic20 pic9 pic9 pic8 pic8 pic7 pic16",
  "pic19 pic19 pic18 pic18 pic17 pic17 pic16",
]
  .map((row) => `"${row}"`)
  .join(" ");

const VISIBILITY = {
  0: "m-[var(--m)] min-h-[var(--min)] min-w-[var(--min)] opacity-100",
  600: "m-0 min-h-0 min-w-0 opacity-0 min-[600px]:m-[var(--m)] min-[600px]:min-h-[var(--min)] min-[600px]:min-w-[var(--min)] min-[600px]:opacity-100",
  650: "m-0 min-h-0 min-w-0 opacity-0 min-[650px]:m-[var(--m)] min-[650px]:min-h-[var(--min)] min-[650px]:min-w-[var(--min)] min-[650px]:opacity-100",
  700: "m-0 min-h-0 min-w-0 opacity-0 min-[700px]:m-[var(--m)] min-[700px]:min-h-[var(--min)] min-[700px]:min-w-[var(--min)] min-[700px]:opacity-100",
  750: "m-0 min-h-0 min-w-0 opacity-0 min-[750px]:m-[var(--m)] min-[750px]:min-h-[var(--min)] min-[750px]:min-w-[var(--min)] min-[750px]:opacity-100",
  800: "m-0 min-h-0 min-w-0 opacity-0 min-[800px]:m-[var(--m)] min-[800px]:min-h-[var(--min)] min-[800px]:min-w-[var(--min)] min-[800px]:opacity-100",
  850: "m-0 min-h-0 min-w-0 opacity-0 min-[850px]:m-[var(--m)] min-[850px]:min-h-[var(--min)] min-[850px]:min-w-[var(--min)] min-[850px]:opacity-100",
  900: "m-0 min-h-0 min-w-0 opacity-0 min-[900px]:m-[var(--m)] min-[900px]:min-h-[var(--min)] min-[900px]:min-w-[var(--min)] min-[900px]:opacity-100",
  950: "m-0 min-h-0 min-w-0 opacity-0 min-[950px]:m-[var(--m)] min-[950px]:min-h-[var(--min)] min-[950px]:min-w-[var(--min)] min-[950px]:opacity-100",
};

const visibleFrom = (n) =>
  n <= 5 ? 0 : n <= 7 ? 600 : n <= 9 ? 650 : n <= 11 ? 700 : n <= 13 ? 750 : n <= 16 ? 800 : n <= 19 ? 850 : n <= 22 ? 900 : 950;

export default function PicGrid({
  images = DEFAULT_IMAGES,
  openLabel = "Open image",
  prevLabel = "Previous image",
  nextLabel = "Next image",
  backgroundColor = "bg-black",
  overlayColor = "bg-black/75",
  frameColor = "bg-white",
}) {
  const tiles = images.slice(0, 25);
  const count = tiles.length;

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(0);
  const [isVertical, setIsVertical] = useState(true);

  const step = (delta) => setPos((p) => (p + delta + count) % count);

  const show = (index) => {
    setPos(index);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        step(1);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  const frameMask = isVertical ? MASK.frameVert : MASK.frameHor;
  const frameMaskStyle = { maskImage: frameMask, WebkitMaskImage: frameMask };

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_50%,transparent_30%)] bg-[length:2rem_100%] ${backgroundColor}`}
    >
      <ul
        className="m-0 inline-grid list-none p-0 [--m:0.25rem] [--min:90px] [--r:5px] min-[600px]:[--min:100px] min-[600px]:[--r:7px] min-[650px]:[--min:110px] min-[700px]:[--m:0.2rem] min-[800px]:[--min:90px] min-[800px]:[--r:10px] min-[850px]:[--min:80px] min-[950px]:[--min:70px]"
        style={{ gridTemplateAreas: GRID_AREAS }}
      >
        {tiles.map((src, i) => {
          const mask = MASK[TILE_MASKS[i]];
          return (
            <li
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`${openLabel} ${i + 1}`}
              onClick={() => show(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  show(i);
                }
              }}
              className={`relative flex max-w-[250px] cursor-pointer items-center justify-center rounded-[var(--r)] bg-cover bg-center bg-no-repeat outline-none transition-all duration-[350ms] [-webkit-mask-position:50%_50%] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-position:50%_50%] [mask-repeat:no-repeat] [mask-size:100%_100%] hover:-top-0.5 focus-visible:-top-0.5 ${VISIBILITY[visibleFrom(i + 1)]}`}
              style={{
                gridArea: `pic${i + 1}`,
                backgroundImage: `url(${src})`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          );
        })}
      </ul>

      <div
        role="dialog"
        aria-modal="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 m-0 items-center justify-center px-10 py-5 ${overlayColor} ${open ? "flex" : "hidden"
          }`}
      >
        <div className="relative">
          <div
            className={`box-border rounded-[45px] p-[5px] [-webkit-mask-position:50%_50%] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-position:50%_50%] [mask-repeat:no-repeat] [mask-size:contain] sm:rounded-[50px] sm:p-[10px] md:rounded-[55px] md:p-[15px] ${frameColor}`}
            style={frameMaskStyle}
          >
            {open ? (
              <img
                src={tiles[pos]}
                alt=""
                onLoad={(e) =>
                  setIsVertical(
                    e.currentTarget.naturalWidth <= e.currentTarget.naturalHeight,
                  )
                }
                className="block max-w-full rounded-[40px] [-webkit-mask-position:50%_50%] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-position:50%_50%] [mask-repeat:no-repeat] [mask-size:contain]"
                style={frameMaskStyle}
              />
            ) : null}
          </div>

          <div className="absolute inset-0 flex justify-between">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="flex w-1/2 cursor-pointer items-center justify-start border-0 bg-transparent p-0 opacity-30 outline-none transition-opacity duration-100 hover:opacity-100 focus-visible:opacity-100"
            >
              <svg
                viewBox="0 0 30 48.653"
                aria-hidden="true"
                className={`h-8 w-5 fill-white/50 ${isVertical ? "-ml-[18px]" : "-ml-[36px]"
                  }`}
              >
                <path d="M2.441,23.004L0,25.481l2.441,2.477L22.84,48.653l4.884-4.955L10.032,25.212L30,4.954L25.118,0L2.441,23.004L2.441,23.004z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="flex w-1/2 cursor-pointer items-center justify-end border-0 bg-transparent p-0 opacity-30 outline-none transition-opacity duration-100 hover:opacity-100 focus-visible:opacity-100"
            >
              <svg
                viewBox="0 0 30 48.652"
                aria-hidden="true"
                className={`h-8 w-5 fill-white/50 ${isVertical ? "-mr-[28px]" : "-mr-[33px]"
                  }`}
              >
                <path d="M27.559,23.004L4.882,0L0,4.954l19.968,20.258L2.275,43.698l4.885,4.954l20.398-20.694L30,25.481L27.559,23.004L27.559,23.004z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}