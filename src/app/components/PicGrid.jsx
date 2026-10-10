"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── PicGrid ─────────────────────────────────────────────────────────────────
// Apple-to-apple conversion of the responsive masked photo grid + lightbox.
//
// What MUST stay in <style>:
//  - CSS custom property cascade (--grid-area, --min-size, --opacity, etc.)
//  - grid-template-areas (7×7 named areas, impossible as Tailwind)
//  - nth-child responsive breakpoints that set CSS vars
//  - mask-image per-item rules (SVG data-URIs, no Tailwind equivalent)
//  - ::before pseudo-elements on .arrow (content + background-image)
//  - [data-state] / [data-is-vertical] attribute selectors
//
// Everything else → Tailwind.
// ─────────────────────────────────────────────────────────────────────────────

const IMAGES = [
  "https://img-fotki.yandex.ru/get/5902/yoksel.5a/0_44a80_e044035f_L",
  "https://img-fotki.yandex.ru/get/5905/yoksel.5e/0_4dcea_dc645b78_L",
  "https://img-fotki.yandex.ru/get/4514/yoksel.61/0_50261_8b68dcb6_L",
  "https://img-fotki.yandex.ru/get/5804/yoksel.5e/0_4df79_19e3d766_L",
  "https://img-fotki.yandex.ru/get/4705/yoksel.62/0_50544_255fa1d3_L",
  "https://img-fotki.yandex.ru/get/4514/yoksel.62/0_513a1_3cca9641_L",
  "https://img-fotki.yandex.ru/get/4702/yoksel.60/0_4f39f_3c7b1cd5_L",
  "https://img-fotki.yandex.ru/get/5600/yoksel.5c/0_46792_5ffcddbd_L",
  "https://img-fotki.yandex.ru/get/5504/yoksel.5e/0_4df72_48155ba3_L",
  "https://img-fotki.yandex.ru/get/5106/yoksel.5a/0_44b5e_4da2ba62_L",
  "https://img-fotki.yandex.ru/get/4406/yoksel.61/0_5023a_fb6de090_L",
  "https://img-fotki.yandex.ru/get/4305/yoksel.52/0_3b6c0_add983ee_L",
  "https://img-fotki.yandex.ru/get/3508/yoksel.42/0_29be3_201334cc_L",
  "https://img-fotki.yandex.ru/get/5806/yoksel.61/0_5024a_5d02d09b_L",
  "https://img-fotki.yandex.ru/get/3609/yoksel.42/0_29be9_4007367f_L",
  "https://img-fotki.yandex.ru/get/4515/yoksel.61/0_5047f_fbc9ee2d_L",
  "https://img-fotki.yandex.ru/get/2914/yoksel.4f/0_3a004_dcae2a9d_L",
  "https://img-fotki.yandex.ru/get/4209/yoksel.51/0_3b3cf_2d4b31e0_L",
  "https://img-fotki.yandex.ru/get/4608/yoksel.61/0_4ff48_a6cf7bf7_L",
  "https://img-fotki.yandex.ru/get/5707/yoksel.60/0_4f93c_e200a5d7_L",
  "https://img-fotki.yandex.ru/get/5706/yoksel.61/0_4f98f_78cf08d6_L",
  "https://img-fotki.yandex.ru/get/5107/yoksel.5c/0_46672_75f9f7ae_L",
  "https://img-fotki.yandex.ru/get/5706/yoksel.61/0_50247_79900337_L",
  "https://img-fotki.yandex.ru/get/8/yoksel.4f/0_3994b_169dc717_L",
  "https://img-fotki.yandex.ru/get/5110/yoksel.60/0_4f80a_c59d6444_L",
];

export default function PicGrid() {
  const [viewState, setViewState] = useState("closed");
  const [isVertical, setIsVertical] = useState(1);
  const [currentPos, setCurrentPos] = useState(0);
  const [currentSrc, setCurrentSrc] = useState("");
  const imgRef = useRef(null);

  const changeImage = useCallback((pos) => {
    const src = IMAGES[pos];
    setCurrentSrc(src);
    // detect orientation after the img loads
  }, []);

  const showView = (pos) => {
    setCurrentPos(pos);
    setViewState("open");
    changeImage(pos);
  };

  const hideView = () => {
    setViewState("closed");
    setCurrentSrc("");
  };

  const showPrev = (e) => {
    e.stopPropagation();
    setCurrentPos((p) => {
      const next = p === 0 ? IMAGES.length - 1 : p - 1;
      changeImage(next);
      return next;
    });
  };

  const showNext = (e) => {
    e.stopPropagation();
    setCurrentPos((p) => {
      const next = p === IMAGES.length - 1 ? 0 : p + 1;
      changeImage(next);
      return next;
    });
  };

  // keyboard navigation
  useEffect(() => {
    const handler = (ev) => {
      if (viewState !== "open") return;
      if (ev.keyCode === 37) showPrev({ stopPropagation: () => {} });
      else if (ev.keyCode === 39 || ev.keyCode === 32) {
        ev.preventDefault();
        showNext({ stopPropagation: () => {} });
      }
    };
    window.addEventListener("keyup", handler);
    return () => window.removeEventListener("keyup", handler);
  }, [viewState, currentPos]);

  // detect vertical after image loads
  const handleImgLoad = () => {
    if (!imgRef.current) return;
    setIsVertical(
      imgRef.current.clientWidth > imgRef.current.clientHeight ? 0 : 1,
    );
  };

  return (
    <>
      <style>{`
        :root {
          --hor-mask-1: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 223 89' preserveAspectRatio='none' %3E%3Cpath d='M18.127371,5.04838291 C31.1256245,7.57484423 59.9868927,-0.975054589 93.3884121,8.13692744 C139.992573,20.8506089 177.959962,-9.33442959 204.128023,3.04838291 C230.296083,15.4311954 225.346695,67.2735046 208.128037,81.0483829 C190.909379,94.8232612 169.041962,76.6577579 118.127721,85.0483829 C67.2134805,93.4390079 57.1900079,81.0483829 31.1274166,84.0483829 C5.06482523,87.0483829 -16.8415015,-1.74849209 18.127371,5.04838291 Z' %3E%3C/path%3E%3C/svg%3E");
          --hor-mask-2: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 221 90' preserveAspectRatio='none' %3E%3Cpath d='M197.272623,82.9660647 C184.274369,80.4396034 161.164062,79.8775202 129.011582,79.8775202 C72.76348,79.8775202 44.4400315,97.3488772 18.271971,84.9660647 C-7.89608947,72.5832522 -2.94670124,20.740943 14.271957,6.96606469 C31.4906152,-6.8088136 45.3580315,11.3566897 96.2722724,2.96606469 C147.186513,-5.42456031 165.209986,6.96606469 191.272577,3.96606469 C199.844751,2.97934314 208.9673,3.92320166 214.764424,16.1300648 C226.59271,41.0365993 220.739982,87.5273987 197.272623,82.9660647 Z'%3E%3C/path%3E%3C/svg%3E");
          --hor-mask-3: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 218 87' preserveAspectRatio='none' %3E%3Cpath d='M196.272623,80.9660647 C183.862674,83.9760328 155.540265,90.2010374 128.011582,83.8775202 C47.0039063,65.2695313 40.4400315,95.3488772 14.271971,82.9660647 C-11.8960895,70.5832522 5.27194295,27.7875981 11.271957,13.9660647 C17.271971,0.14453125 28.0857591,11.390625 79,3 C129.914241,-5.390625 150.209986,6.96606469 176.272577,3.96606469 C184.844751,2.97934314 206.9673,13.9232017 212.764424,26.1300648 C224.59271,51.0365993 212.764424,76.9660647 196.272623,80.9660647 Z'%3E%3C/path%3E%3C/svg%3E");
          --vert-mask-1: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 87 218' preserveAspectRatio='none' %3E%3Cpath d='M80.9378811,196.090954 C83.9478492,183.681005 90.1728538,155.358596 83.8493366,127.829913 C65.2413477,46.822237 95.3206936,40.2583622 82.9378811,14.0903017 C70.5550686,-12.0777588 27.7594145,5.09027366 13.9378811,11.0902877 C0.116347654,17.0903017 11.3624414,27.9040898 2.9718164,78.8183307 C-5.4188086,129.732572 6.9378811,150.028317 3.9378811,176.090908 C2.95115954,184.663082 13.8950181,206.785631 26.1018812,212.582755 C51.0084157,224.41104 76.9378811,212.582755 80.9378811,196.090954 Z'%3E%3C/path%3E%3C/svg%3E");
          --vert-mask-2: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 221' preserveAspectRatio='none' %3E%3Cpath d='M82.9660647,197.272623 C80.4396034,184.274369 79.8775202,161.164062 79.8775202,129.011582 C79.8775202,72.76348 97.3488772,44.4400315 84.9660647,18.271971 C72.5832522,-7.89608947 20.740943,-2.94670124 6.96606469,14.271957 C-6.8088136,31.4906152 11.3566897,45.3580315 2.96606469,96.2722724 C-5.42456031,147.186513 6.96606469,165.209986 3.96606469,191.272577 C2.97934314,199.844751 3.92320166,208.9673 16.1300648,214.764424 C41.0365993,226.59271 87.5273987,220.739982 82.9660647,197.272623 Z'%3E%3C/path%3E%3C/svg%3E");
          --vert-mask-3: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 89 223' preserveAspectRatio='none' %3E%3Cpath d='M5.04838291,18.127371 C-1.74849209,-16.8415015 87.0483829,5.06482523 84.0483829,31.1274166 C81.0483829,57.1900079 93.4390079,67.2134805 85.0483829,118.127721 C76.6577579,169.041962 94.8232612,190.909379 81.0483829,208.128037 C67.2735046,225.346695 15.4311954,230.296083 3.04838291,204.128023 C-9.33442959,177.959962 20.8506089,139.992573 8.13692744,93.3884121 C-0.975054589,59.9868927 7.57484423,31.1256245 5.04838291,18.127371 Z'%3E%3C/path%3E%3C/svg%3E");
          --img-mask-vert: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 232' preserveAspectRatio='none' %3E%3Cpath d='M23.9311912,12.8389883 C68.2881986,-3.16175013 127.377784,-7.792675 148.446739,20.1472416 C169.515693,48.0871581 155.326363,55.2549232 155.326363,88.1472416 C155.326363,121.03956 156.118336,158.45261 146.803652,189.838988 C137.488968,221.225367 24.7913372,251.448023 10.4689449,214.838988 C-3.85344736,178.229954 10.4689449,185.550626 10.4689449,128.147242 C10.4689449,99.8542728 -20.4258161,28.8397268 23.9311912,12.8389883 Z'%3E%3C/path%3E%3C/svg%3E");
          --img-mask-hor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 215 142' preserveAspectRatio='none' %3E%3Cpath d='M197.288943,20.6407321 C215.928771,41.2266394 229.381896,139.074296 184.289031,133.55699 C139.196166,128.039685 131.742771,131.557076 98.8506455,131.557076 C65.95852,131.557076 30.5086724,153.467434 13.2901151,131.557076 C-3.92844224,109.646717 -6.87779204,29.2800545 19.2901151,9.58391986 C45.4580222,-10.1122148 54.0239243,20.6407321 98.8506455,3.91023312 C120.886075,-4.31396268 178.649115,0.0548248444 197.288943,20.6407321 Z'%3E%3C/path%3E%3C/svg%3E");
        }

        /* grid */
        .pic-grid {
          display: inline-grid;
          grid-template-areas:
            "pic22 pic23  pic23  pic24  pic24  pic25  pic25"
            "pic22 pic11  pic12  pic12  pic13  pic13  pic14"
            "pic21 pic11  pic4   pic5   pic5   pic6   pic14"
            "pic21 pic10  pic4   pic1   pic2   pic6   pic15"
            "pic20 pic10  pic3   pic3   pic2   pic7   pic15"
            "pic20 pic9   pic9   pic8   pic8   pic7   pic16"
            "pic19 pic19  pic18  pic18  pic17  pic17  pic16";
        }

        /* pic base */
        .pic {
          --min-size: 0;
          --radius: 5px;
          --margin: 0;
          --opacity: 0;
          position: relative;
          min-width: var(--min-size);
          min-height: var(--min-size);
          max-width: 250px;
          margin: var(--margin);
          display: flex;
          justify-content: center;
          align-items: center;
          grid-area: var(--grid-area);
          background-size: cover;
          border-radius: var(--radius);
          background-repeat: no-repeat;
          background-position: 50% 50%;
          opacity: var(--opacity);
          mask-repeat: no-repeat;
          mask-size: 100% 100%;
          mask-position: 50% 50%;
          cursor: pointer;
          transition: all .35s;
        }
        .pic:hover { top: -2px; }

        /* responsive nth-child breakpoints */
        .pic:nth-child(-n+5)  { --min-size:90px; --margin:.25rem; --opacity:1; }
        @media (min-width:600px)  { .pic:nth-child(-n+7)  { --margin:.25rem; --min-size:100px; --radius:7px; --opacity:1; } }
        @media (min-width:650px)  { .pic:nth-child(-n+9)  { --min-size:110px; --margin:.25rem; --opacity:1; } }
        @media (min-width:700px)  { .pic:nth-child(-n+11) { --min-size:110px; --margin:.2rem; --opacity:1; } }
        @media (min-width:750px)  { .pic:nth-child(-n+13) { --min-size:110px; --margin:.2rem; --opacity:1; } }
        @media (min-width:800px)  { .pic:nth-child(-n+16) { --min-size:90px;  --margin:.2rem; --radius:10px; --opacity:1; } }
        @media (min-width:850px)  { .pic:nth-child(-n+19) { --min-size:80px;  --margin:.2rem; --radius:10px; --opacity:1; } }
        @media (min-width:900px)  { .pic:nth-child(-n+22) { --min-size:80px;  --margin:.2rem; --radius:10px; --opacity:1; } }
        @media (min-width:950px)  { .pic:nth-child(-n+26) { --min-size:70px;  --margin:.2rem; --radius:10px; --opacity:1; } }

        /* horizontal masks */
        .pic--3,.pic--13,.pic--18,.pic--23 { mask-image: var(--hor-mask-1); }
        .pic--5,.pic--9,.pic--17,.pic--24  { mask-image: var(--hor-mask-2); }
        .pic--8,.pic--12,.pic--19,.pic--25 { mask-image: var(--hor-mask-3); }

        /* vertical masks */
        .pic--2,.pic--11,.pic--15,.pic--20 { mask-image: var(--vert-mask-1); }
        .pic--4,.pic--7,.pic--14,.pic--21  { mask-image: var(--vert-mask-2); }
        .pic--1,.pic--6,.pic--10,.pic--16,.pic--22 { mask-image: var(--vert-mask-2); }

        /* images */
        .pic--1  { background-image: url(https://img-fotki.yandex.ru/get/5902/yoksel.5a/0_44a80_e044035f_L); }
        .pic--2  { background-image: url(https://img-fotki.yandex.ru/get/5905/yoksel.5e/0_4dcea_dc645b78_L); }
        .pic--3  { background-image: url(https://img-fotki.yandex.ru/get/4514/yoksel.61/0_50261_8b68dcb6_L); }
        .pic--4  { background-image: url(https://img-fotki.yandex.ru/get/5804/yoksel.5e/0_4df79_19e3d766_L); }
        .pic--5  { background-image: url(https://img-fotki.yandex.ru/get/4705/yoksel.62/0_50544_255fa1d3_L); }
        .pic--6  { background-image: url(https://img-fotki.yandex.ru/get/4514/yoksel.62/0_513a1_3cca9641_L); }
        .pic--7  { background-image: url(https://img-fotki.yandex.ru/get/4702/yoksel.60/0_4f39f_3c7b1cd5_L); }
        .pic--8  { background-image: url(https://img-fotki.yandex.ru/get/5600/yoksel.5c/0_46792_5ffcddbd_L); }
        .pic--9  { background-image: url(https://img-fotki.yandex.ru/get/5504/yoksel.5e/0_4df72_48155ba3_L); }
        .pic--10 { background-image: url(https://img-fotki.yandex.ru/get/5106/yoksel.5a/0_44b5e_4da2ba62_L); }
        .pic--11 { background-image: url(https://img-fotki.yandex.ru/get/4406/yoksel.61/0_5023a_fb6de090_L); }
        .pic--12 { background-image: url(https://img-fotki.yandex.ru/get/4305/yoksel.52/0_3b6c0_add983ee_L); }
        .pic--13 { background-image: url(https://img-fotki.yandex.ru/get/3508/yoksel.42/0_29be3_201334cc_L); }
        .pic--14 { background-image: url(https://img-fotki.yandex.ru/get/5806/yoksel.61/0_5024a_5d02d09b_L); }
        .pic--15 { background-image: url(https://img-fotki.yandex.ru/get/3609/yoksel.42/0_29be9_4007367f_L); }
        .pic--16 { background-image: url(https://img-fotki.yandex.ru/get/4515/yoksel.61/0_5047f_fbc9ee2d_L); }
        .pic--17 { background-image: url(https://img-fotki.yandex.ru/get/2914/yoksel.4f/0_3a004_dcae2a9d_L); }
        .pic--18 { background-image: url(https://img-fotki.yandex.ru/get/4209/yoksel.51/0_3b3cf_2d4b31e0_L); }
        .pic--19 { background-image: url(https://img-fotki.yandex.ru/get/4608/yoksel.61/0_4ff48_a6cf7bf7_L); }
        .pic--20 { background-image: url(https://img-fotki.yandex.ru/get/5707/yoksel.60/0_4f93c_e200a5d7_L); }
        .pic--21 { background-image: url(https://img-fotki.yandex.ru/get/5706/yoksel.61/0_4f98f_78cf08d6_L); }
        .pic--22 { background-image: url(https://img-fotki.yandex.ru/get/5107/yoksel.5c/0_46672_75f9f7ae_L); }
        .pic--23 { background-image: url(https://img-fotki.yandex.ru/get/5706/yoksel.61/0_50247_79900337_L); }
        .pic--24 { background-image: url(https://img-fotki.yandex.ru/get/8/yoksel.4f/0_3994b_169dc717_L); }
        .pic--25 { background-image: url(https://img-fotki.yandex.ru/get/5110/yoksel.60/0_4f80a_c59d6444_L); }

        /* view lightbox */
        .view-img-wrapper,
        .view-img-wrapper .img {
          mask-repeat: no-repeat;
          mask-size: contain;
          mask-position: 50% 50%;
          mask-image: var(--img-mask-hor);
        }
        .view[data-is-vertical="1"] .view-img-wrapper,
        .view[data-is-vertical="1"] .view-img-wrapper .img {
          mask-image: var(--img-mask-vert);
        }

        /* arrow pseudo-elements */
        .arrow::before {
          content: '';
          display: block;
          width: 35px;
          height: 80px;
          background-repeat: no-repeat;
          background-size: 20px 32px;
          background-position: 50% 50%;
        }
        .arrow--prev::before {
          margin-left: -25px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 48.653' width='100%25' height='100%25'%3E%3Cpath fill='rgba(255,255,255,.5)' d='M2.441,23.004L0,25.481l2.441,2.477L22.84,48.653l4.884-4.955L10.032,25.212L30,4.954L25.118,0L2.441,23.004L2.441,23.004z'%3E%3C/path%3E%3C/svg%3E");
        }
        .view[data-is-vertical="0"] .arrow--prev::before { margin-left: -43px; }
        .arrow--next::before {
          margin-right: -35px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 48.652' width='100%25' height='100%25'%3E%3Cpath fill='rgba(255,255,255,.5)' d='M27.559,23.004L4.882,0L0,4.954l19.968,20.258L2.275,43.698l4.885,4.954l20.398-20.694L30,25.481L27.559,23.004L27.559,23.004z'%3E%3C/path%3E%3C/svg%3E");
        }
        .view[data-is-vertical="0"] .arrow--next::before { margin-right: -40px; }
      `}</style>

      <div className="flex min-h-screen items-center justify-center bg-black bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_50%,transparent_30%)] bg-[length:2rem_100%] text-[14px] leading-[1.4] font-[Arial,sans-serif]">
        {/* grid */}
        <ul className="pic-grid list-none p-0 m-0">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
            <li
              key={n}
              className={`pic pic--${n}`}
              style={{ "--grid-area": `pic${n}` }}
              data-num={n}
              data-position={n - 1}
              onClick={() => showView(n - 1)}
            />
          ))}
        </ul>

        {/* lightbox */}
        <div
          className={`view fixed inset-0 m-0 px-10 py-5 justify-center items-center bg-black/75 ${viewState === "open" ? "flex" : "hidden"}`}
          data-state={viewState}
          data-is-vertical={isVertical}
          onClick={hideView}
        >
          <div className="relative">
            <div className="view-img-wrapper p-[5px] sm:p-[10px] md:p-[15px] box-border rounded-[45px] sm:rounded-[50px] md:rounded-[55px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {currentSrc && (
                <img
                  ref={imgRef}
                  src={currentSrc}
                  alt=""
                  className="img block max-w-full rounded-[40px]"
                  onLoad={handleImgLoad}
                />
              )}
            </div>

            {/* arrows */}
            <div className="arrows absolute inset-0 flex justify-between">
              <button
                type="button"
                className="arrow arrow--prev w-1/2 flex items-center justify-start bg-transparent border-0 outline-none opacity-30 hover:opacity-100 cursor-pointer transition-opacity duration-100"
                onClick={showPrev}
              />
              <button
                type="button"
                className="arrow arrow--next w-1/2 flex items-center justify-end bg-transparent border-0 outline-none opacity-30 hover:opacity-100 cursor-pointer transition-opacity duration-100"
                onClick={showNext}
              />
            </div>
          </div>
        </div>

        {/* tip */}
        <div className="fixed bottom-[10px] text-white opacity-25 hover:opacity-100 transition-all duration-500">
          ← Resize the window →
        </div>
      </div>
    </>
  );
}
