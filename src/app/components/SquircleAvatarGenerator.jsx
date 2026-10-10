"use client";

import { useEffect, useRef, useState } from "react";

export default function SquircleAvatarCreator({
  maxUploadSizeMb = 10,
  defaultShapeVal = 20,
  defaultZoomVal = 1,
  primaryBtnColor = "#0f172a",
  accentBgColor = "#f8fafc",
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [imgSource, setImgSource] = useState(null);
  const [shape, setShape] = useState(defaultShapeVal);
  const [zoom, setZoom] = useState(defaultZoomVal);
  const [outputSize, setOutputSize] = useState(512);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const coordRef = useRef({
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getShapeLabel = (val) => {
    if (val === 0) return "Circle";
    if (val < 30) return "Soft";
    if (val < 50) return "Medium";
    if (val < 80) return "Hard";
    return "Square";
  };

  const sliderToN = (sliderValue) => {
    if (sliderValue >= 99) return Infinity;
    return 2 + Math.pow(sliderValue / 100, 2) * 50;
  };

  const createSquirclePath = (ctx, cx, cy, size, n) => {
    ctx.beginPath();
    if (n === Infinity) {
      const half = size / 2;
      ctx.rect(cx - half, cy - half, size, size);
    } else {
      for (let t = 0; t <= Math.PI * 2; t += 0.02) {
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        const r =
          size /
          2 /
          Math.pow(
            Math.pow(Math.abs(cos), n) + Math.pow(Math.abs(sin), n),
            1 / n,
          );
        const x = cx + r * cos;
        const y = cy + r * sin;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 300, 300);
    ctx.save();

    const n = sliderToN(shape);
    createSquirclePath(ctx, 150, 150, 300, n);
    ctx.clip();

    const scale =
      Math.max(300 / imgRef.current.width, 300 / imgRef.current.height) * zoom;
    ctx.drawImage(
      imgRef.current,
      coordRef.current.offsetX,
      coordRef.current.offsetY,
      imgRef.current.width * scale,
      imgRef.current.height * scale,
    );

    ctx.restore();

    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 3;
    createSquirclePath(ctx, 150, 150, 300, n);
    ctx.stroke();
  };

  useEffect(() => {
    if (imgSource) draw();
  }, [shape, zoom, imgSource]);

  const resetPosition = (loadedImg) => {
    coordRef.current.offsetX = 0;
    coordRef.current.offsetY = 0;
    setZoom(defaultZoomVal);
    setShape(defaultShapeVal);
    const scale =
      Math.max(300 / loadedImg.width, 300 / loadedImg.height) * defaultZoomVal;
    coordRef.current.offsetX = (300 - loadedImg.width * scale) / 2;
    coordRef.current.offsetY = (300 - loadedImg.height * scale) / 2;
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > maxUploadSizeMb * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImg = new Image();
      newImg.onload = () => {
        imgRef.current = newImg;
        resetPosition(newImg);
        setImgSource(e.target.result);
      };
      newImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    coordRef.current.isDragging = true;
    coordRef.current.startX = e.clientX - rect.left - coordRef.current.offsetX;
    coordRef.current.startY = e.clientY - rect.top - coordRef.current.offsetY;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!coordRef.current.isDragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      coordRef.current.offsetX =
        e.clientX - rect.left - coordRef.current.startX;
      coordRef.current.offsetY = e.clientY - rect.top - coordRef.current.startY;
      draw();
    };
    const handleGlobalMouseUp = () => {
      coordRef.current.isDragging = false;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [zoom, shape]);

  const downloadImage = () => {
    if (!imgRef.current) return;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const outputCtx = outputCanvas.getContext("2d");
    const scaleFactor = outputSize / 300;

    outputCtx.clearRect(0, 0, outputSize, outputSize);
    outputCtx.save();
    const n = sliderToN(shape);
    createSquirclePath(
      outputCtx,
      outputSize / 2,
      outputSize / 2,
      outputSize,
      n,
    );
    outputCtx.clip();

    const scale =
      Math.max(300 / imgRef.current.width, 300 / imgRef.current.height) *
      zoom *
      scaleFactor;
    outputCtx.drawImage(
      imgRef.current,
      coordRef.current.offsetX * scaleFactor,
      coordRef.current.offsetY * scaleFactor,
      imgRef.current.width * scale,
      imgRef.current.height * scale,
    );
    outputCtx.restore();

    outputCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avatar-${outputSize}x${outputSize}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Safe native file cleaning reset module script
  const triggerNewReset = () => {
    setImgSource(null);
    imgRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isMounted) return <div className="w-full h-screen bg-transparent" />;

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center font-sans antialiased"
      style={{ backgroundColor: accentBgColor }}
    >
      {!imgSource ? (
        /* Center-Screen Balanced Modern Upload Area */
        <div className="w-full max-w-md mx-4 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 text-center transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Squircle Avatar
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Generate perfect corners for profile assets
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            className={`group relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer ${
              isDragOver
                ? "border-indigo-500 bg-indigo-50/40"
                : "border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            {/* Smooth Micro-Interactive SVG Cloud Icon Upload replacement */}
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-slate-300 group-hover:shadow transition-all duration-300 text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-6 h-6 group-hover:text-indigo-500 transition-colors duration-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
            </div>

            <p className="text-sm font-medium text-slate-700">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              Supports JPG, PNG formats up to {maxUploadSizeMb}MB
            </p>
          </div>
        </div>
      ) : (
        /* Modern Studio Editor Viewport Dashboard Layout */
        <div className="w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-[0_30px_70px_rgba(15,23,42,0.04)] border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Left Canvas Preview Panel Area */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100 md:w-[360px] shrink-0">
            <div className="relative w-[300px] h-[300px] rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                className="absolute top-0 left-0 cursor-move active:cursor-grabbing"
                width={300}
                height={300}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Drag inside the box to reposition image
            </p>
          </div>

          {/* Right Interface Controls Engine Panel */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Workspace
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Adjust Appearance
                </h2>
              </div>

              {/* Presets Quick Grid Row */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Geometry Presets
                </label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {[0, 20, 40, 60, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setShape(val)}
                      className={`py-2 text-xs font-medium rounded-lg transition-all ${
                        shape === val
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {getShapeLabel(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Adjustment Controls Stack */}
              <div className="space-y-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                {/* Corner Smoothness Module Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">
                      Radius Curve Matrix
                    </span>
                    <span className="font-mono text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded">
                      {getShapeLabel(shape)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shape}
                    onChange={(e) => setShape(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>

                {/* Spatial Scaling Module Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">
                      Magnification Scaling
                    </span>
                    <span className="font-mono text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded">
                      {zoom.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => {
                      const newZoom = parseFloat(e.target.value);
                      const zoomDiff = newZoom / zoom;
                      setZoom(newZoom);
                      coordRef.current.offsetX =
                        150 + (coordRef.current.offsetX - 150) * zoomDiff;
                      coordRef.current.offsetY =
                        150 + (coordRef.current.offsetY - 150) * zoomDiff;
                    }}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              </div>

              {/* Export Configuration Target Resolution Selector Matrix */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resolution Allocation
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[512, 256, 128, 64].map((size) => (
                    <button
                      key={size}
                      onClick={() => setOutputSize(size)}
                      className={`py-2 text-xs font-mono rounded-xl border text-center transition-all ${
                        outputSize === size
                          ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Container Strip Footer */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={triggerNewReset}
                className="flex-1 border border-slate-200 bg-white text-slate-700 font-medium rounded-xl py-3 text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Reset Image
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 text-white font-medium rounded-xl py-3 text-sm shadow-md shadow-slate-900/10 transition-all duration-200 hover:opacity-95"
                style={{ backgroundColor: primaryBtnColor }}
              >
                Export Asset
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files?.[0])}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
