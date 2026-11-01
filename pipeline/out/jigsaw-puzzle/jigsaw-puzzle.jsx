"use client";

import { useEffect, useState, useCallback } from "react";

const PIECE_PATHS = [
  "M0 0h255.2c-62.1 167.8 46.4 45.1 28.7 120.7s-60.4-82.5-79.3 95.4c-160 49.8-39.9-45.6-111.5-32.8s74.2 60.6-93.1 69.5V0z",
  "M0 252.7c167.3-8.9 21.5-56.7 93.1-69.5S44.6 265.9 204.6 216c-12.7 208.1 67 34.6 72.7 125s-95.3-71.7-56.4 133.2c-181.1 12.3-22.4 61.7-99.7 76.7C43.9 566 172.5 460.7 0 517.2V252.7z",
  "M0 517.2c172.5-56.5 43.9 48.8 121.2 33.7s-81.3-64.4 99.7-76.7c23 211.1-66.4 38.5-67.9 130.6s93.4-77.5 63.7 132.7c-170.3 47.1-40.5-49.4-116.3-38.3-75.8 11.1 76.2 66.3-100.4 70.1V517.2z",
  "M0 769.3c176.6-3.8 24.6-59 100.4-70.1 75.9-11.1-53.9 85.4 116.3 38.3 7.5 214.2 72 28.8 86.7 120.7 14.7 91.9-104.5-64-44.6 141.8H0V769.3z",
  "M255.2 0h247.4c-40.2 187 56 40.6 48.7 123.3-7.3 82.7-76.5-78.2-69.5 113-219.8-44-46.7 66.3-143.7 59.2-97-7.1 90.3-91-133.6-79.5 18.9-177.9 61.6-19.7 79.3-95.4S193.1 167.8 255.2 0z",
  "M204.6 216c223.8-11.5 36.5 72.4 133.6 79.5s-76.1-103.1 143.7-59.2C460 437.7 545.3 273 546.7 360.9c1.4 87.9-89.1-73.9-60.7 126.6-213.3 15.9-36.4-68.2-129.2-72.9-92.8-4.7 74.8 96.7-135.8 59.6-39-204.9 62-42.8 56.3-133.2s-85.4 83.2-72.7-125z",
  "M220.9 474.2c210.7 37.1 43.1-64.3 135.8-59.6 92.8 4.7-84.2 88.8 129.2 72.9-39.3 191.7 57.7 41 51.1 125.7s-79-79.2-70 116.3c-201-18.6-35.5 63.8-123.1 66.6-87.6 2.8 72.3-90-127.1-58.6 29.7-210.2-65.2-40.5-63.7-132.7 1.4-92.2 90.8 80.4 67.8-130.6z",
  "M216.8 737.5c199.4-31.4 39.5 61.4 127.1 58.6S266 710.9 467 729.5c36.3 215.2-65.9 43.5-61.9 138.1 4 94.7 91.2-85.2 73.4 132.4H258.9c-60-205.8 59.3-49.9 44.6-141.8-14.8-91.9-79.3 93.5-86.7-120.7z",
  "M502.6 0h252.5c-1.2 202-67 29.1-78.4 116.1-11.4 87 96.7-63.2 45.9 132.4-193.8 14.3-33.1-62-117.3-66.3-84.3-4.3 68 87.9-123.4 54.1-7-191.1 62.2-30.3 69.5-113 7.2-82.7-89 63.7-48.8-123.3z",
  "M481.8 236.3c191.4 33.8 39.2-58.4 123.4-54.1 84.3 4.3-76.5 80.6 117.3 66.3-26 185 57.4 35.6 56.1 116.7-1.3 81.1-80-70.8-59.7 114.9-185.7 29.2-36.8-57.2-118.4-54.6-81.6 2.6 72.5 79.4-114.7 61.9-28.4-200.5 62.2-38.7 60.7-126.6s-86.5 76.9-64.7-124.5z",
  "M486 487.5c187.2 17.5 33.1-59.4 114.7-61.9 81.6-2.6-67.4 83.8 118.4 54.6 8.7 197.5-64.1 31.7-71 117.3-6.9 85.5 91.5-66.4 51.2 127.1C514 751.7 663.2 667.3 582 669s71.4 79.8-114.9 60.5c-9.1-195.5 63.3-31.6 70-116.3 6.5-84.7-90.5 66-51.1-125.7z",
  "M467.1 729.5c186.3 19.3 33.6-58.8 114.9-60.5 81.3-1.7-68 82.8 117.4 55.6-9.9 222.5 72.2 35.8 79.9 132.2s-103-74.9-57.8 143.2H478.6c17.8-217.6-69.4-37.7-73.4-132.4-4-94.6 98.1 77.1 61.9-138.1z",
  "M755.1 0H1000v225.3c-219.6 46.3-47.4-65.9-144.5-57.8-97.1 8.1 91.3 90.1-132.9 80.9C773.5 52.9 665.4 203 676.7 116c11.4-86.9 77.3 86 78.4-116z",
  "M722.6 248.5c224.2 9.2 35.8-72.8 132.9-80.9 97.1-8.1-75.1 104 144.5 57.8V499c-222.9-43.2-46.9 67.4-145.2 60.8-98.3-6.6 90.9-92.7-135.8-79.7-20.3-185.7 58.5-33.9 59.7-114.9 1.3-81.1-82.1 68.3-56.1-116.7z",
  "M719 480.2c226.7-13 37.4 73.1 135.8 79.7 98.3 6.6-77.7-104 145.2-60.8v246.5c-238.5-46.8-50.3 72-155.6 64.7-105.2-7.3 97.5-99-145.1-85.6 40.2-193.6-58.1-41.6-51.2-127.1 6.9-85.7 79.6 80.1 70.9-117.4z",
  "M699.3 724.6c242.6-13.3 39.9 78.3 145.1 85.6 105.2 7.3-82.9-111.5 155.6-64.7V1000H721.4c-45.2-218.1 65.5-46.8 57.8-143.2-7.7-96.4-89.8 90.3-79.9-132.2z",
];
const START_ROTATIONS = [
  -270, 195, -315, 240, -225, 180, -330, 210, -285, 165, -345, 225, -260, 200,
  -300, 195,
];

export default function JigsawPuzzle({
  imageUrl = "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1080&q=80",
  size = "50vmin",
  rows = 4,
  columns = 4,
  strokeWidth = "0.5vmin",
  bgColor = "#f3f0ed",
  labelColor = "#242733",
  className = "",
  labelText = "Drop an image to update the jigsaw",
  labelFontSize = "32px",
  borderRadius = "0.5em",
  pageHeight = "200vh",
  onImageChange,
}) {
  const [animate, setAnimate] = useState(0);
  const [windowWidthScalar, setWindowWidthScalar] = useState(1);
  const [windowHeightScalar, setWindowHeightScalar] = useState(1);
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [maskVisible, setMaskVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setAnimate(window.scrollY / window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onResize = () => {
      const ar = window.innerWidth / window.innerHeight;
      setWindowHeightScalar(ar > 1 ? 1 : 1 / ar);
      setWindowWidthScalar(ar < 1 ? 1 : ar);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const handleFileChange = useCallback(
    (e) => {
      setMaskVisible(false);
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        const dataUrl = re.target.result;
        setCurrentImage(dataUrl);
        onImageChange?.(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange],
  );
  const getPieceStyle = (index) => {
    const pieceIndex = index + 1;
    const column = Math.ceil(pieceIndex / rows);
    const row = ((pieceIndex - 1) % columns) + 1;

    const pieceX = -1 + (-1 + 2 * column) / columns;
    const pieceY = -1 + (-1 + 2 * row) / rows;
    const startRotate =
      START_ROTATIONS[index] ??
      (50 + ((index * 37) % 50)) * (index % 2 === 0 ? -1 : 1);
    const sizeNum = parseFloat(size);
    const startX = `calc(${pieceX} * (100 * ${windowWidthScalar} - ${sizeNum}) / ${2 * sizeNum} * 100%)`;
    const startY = `calc(${pieceY} * (100 * ${windowHeightScalar} - ${sizeNum}) / ${2 * sizeNum} * 100%)`;

    const x = `calc(${startX} * ${1 - animate})`;
    const y = `calc(${startY} * ${1 - animate})`;
    const rotate = `${startRotate * (1 - animate)}deg`;
    const originX = `calc(50% + 50% * ${pieceX})`;
    const originY = `calc(50% + 50% * ${pieceY})`;

    return {
      fill: "url(#puzzle)",
      transformOrigin: `${originX} ${originY}`,
      transform: `translate(${x}, ${y}) rotate(${rotate})`,
      strokeWidth,
    };
  };

  return (
    <>
      <div
        className={`relative m-0 ${className}`}
        style={{ height: pageHeight, background: bgColor }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
          style={{ width: size, height: size }}
        >
          <defs>
            <pattern
              id="puzzle"
              height="100%"
              width="100%"
              patternUnits="userSpaceOnUse"
            >
              <image
                id="puzzle-image"
                width="1000"
                height="1000"
                preserveAspectRatio="xMidYMax slice"
                href={currentImage}
              />
            </pattern>
          </defs>

          {PIECE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              style={{
                ...getPieceStyle(i),
                stroke: bgColor,
              }}
            />
          ))}
        </svg>

        <input
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleFileChange}
          onDragEnter={() => setMaskVisible(true)}
          onDragLeave={() => setMaskVisible(false)}
          className="fixed inset-0 w-full h-full opacity-0 z-[1] cursor-pointer"
        />

        <div
          aria-hidden={!maskVisible}
          className="fixed top-4 left-4 bottom-4 right-4 pointer-events-none flex justify-center items-center p-4 text-center z-[2] border border-dashed transition-opacity duration-200"
          style={{
            borderRadius,
            fontSize: labelFontSize,
            color: labelColor,
            borderColor: labelColor,
            opacity: maskVisible ? 1 : 0,
          }}
        >
          {labelText}
        </div>
      </div>
    </>
  );
}
