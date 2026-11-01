"use client";

import { useEffect, useRef, useState } from "react";

export default function GlitchImage({
  imgSrc = "https://images.pexels.com/photos/7671968/pexels-photo-7671968.jpeg",
  backgroundColor = "bg-neutral-950",
  frameSize = 500,
  channelLen = 4,
  flowLineCount = 1,
  shiftLineCount = 6,
  scatImgsCount = 3,
  loadingText = "Processing Core...",
  className = "",
}) {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let p5Instance = null;
    let glitchTimer = null;

    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      const sketch = (p) => {
        let glitch;
        let finalSquareImg;

        p.setup = () => {
          p.createCanvas(frameSize, frameSize).parent(containerRef.current);
          p.background(0);

          p.loadImage(imgSrc, (loadedImg) => {

            let cropSize = p.min(loadedImg.width, loadedImg.height);

            let cropX = p.floor((loadedImg.width - cropSize) / 2);
            let cropY = p.floor((loadedImg.height - cropSize) / 2);

            let croppedImg = loadedImg.get(cropX, cropY, cropSize, cropSize);

            croppedImg.resize(frameSize, frameSize);

            finalSquareImg = croppedImg;
            glitch = new Glitch(finalSquareImg);
            setIsLoaded(true);
          });
        };

        p.draw = () => {
          p.clear();

          if (glitch && finalSquareImg) {
            glitch.show();
          }
        };

        class Glitch {
          constructor(img) {
            this.channelLen = channelLen;
            this.imgOrigin = img;
            this.imgOrigin.loadPixels();
            this.copyData = [];
            this.flowLineImgs = [];
            this.shiftLineImgs = [];
            this.shiftRGBs = [];
            this.scatImgs = [];
            this.throughFlag = true;
            this.copyData = new Uint8ClampedArray(this.imgOrigin.pixels);

            for (let i = 0; i < flowLineCount; i++) {
              let o = {
                pixels: null,
                t1: p.floor(p.random(0, 1000)),
                speed: p.floor(p.random(4, 24)),
                randX: p.floor(p.random(24, 80)),
              };
              this.flowLineImgs.push(o);
            }

            for (let i = 0; i < shiftLineCount; i++) {
              let o = null;
              this.shiftLineImgs.push(o);
            }

            for (let i = 0; i < 1; i++) {
              let o = null;
              this.shiftRGBs.push(o);
            }

            for (let i = 0; i < scatImgsCount; i++) {
              let scatImg = {
                img: null,
                x: 0,
                y: 0,
              };
              this.scatImgs.push(scatImg);
            }
          }

          replaceData(destImg, srcPixels) {
            if (!srcPixels || srcPixels.length !== destImg.pixels.length)
              return;
            for (let y = 0; y < destImg.height; y++) {
              for (let x = 0; x < destImg.width; x++) {
                let index = (y * destImg.width + x) * this.channelLen;
                destImg.pixels[index] = srcPixels[index];
                destImg.pixels[index + 1] = srcPixels[index + 1];
                destImg.pixels[index + 2] = srcPixels[index + 2];
                destImg.pixels[index + 3] = srcPixels[index + 3];
              }
            }
            destImg.updatePixels();
          }

          flowLine(srcImg, obj) {
            let destPixels = new Uint8ClampedArray(srcImg.pixels);
            obj.t1 %= srcImg.height;
            obj.t1 += obj.speed;
            let tempY = p.floor(obj.t1);
            for (let y = 0; y < srcImg.height; y++) {
              if (tempY === y) {
                for (let x = 0; x < srcImg.width; x++) {
                  let index = (y * srcImg.width + x) * this.channelLen;
                  destPixels[index] = srcImg.pixels[index] + obj.randX;
                  destPixels[index + 1] = srcImg.pixels[index + 1] + obj.randX;
                  destPixels[index + 2] = srcImg.pixels[index + 2] + obj.randX;
                  destPixels[index + 3] = srcImg.pixels[index + 3];
                }
              }
            }
            return destPixels;
          }

          shiftLine(srcImg) {
            let destPixels = new Uint8ClampedArray(srcImg.pixels);
            let rangeH = srcImg.height;
            let rangeMin = p.floor(p.random(0, rangeH));
            let rangeMax = rangeMin + p.floor(p.random(1, rangeH - rangeMin));
            let offsetX = this.channelLen * p.floor(p.random(-40, 40));

            for (let y = 0; y < srcImg.height; y++) {
              if (y > rangeMin && y < rangeMax) {
                for (let x = 0; x < srcImg.width; x++) {
                  let index = (y * srcImg.width + x) * this.channelLen;
                  let targetX =
                    (x + p.floor(offsetX / this.channelLen)) % srcImg.width;
                  if (targetX < 0) targetX += srcImg.width;

                  let srcIndex = (y * srcImg.width + targetX) * this.channelLen;
                  destPixels[index] = srcImg.pixels[srcIndex];
                  destPixels[index + 1] = srcImg.pixels[srcIndex + 1];
                  destPixels[index + 2] = srcImg.pixels[srcIndex + 2];
                  destPixels[index + 3] = srcImg.pixels[srcIndex + 3];
                }
              }
            }
            return destPixels;
          }

          shiftRGB(srcImg) {
            let range = 16;
            let destPixels = new Uint8ClampedArray(srcImg.pixels);
            let randR =
              (p.floor(p.random(-range, range)) * srcImg.width +
                p.floor(p.random(-range, range))) *
              this.channelLen;
            let randG =
              (p.floor(p.random(-range, range)) * srcImg.width +
                p.floor(p.random(-range, range))) *
              this.channelLen;
            let randB =
              (p.floor(p.random(-range, range)) * srcImg.width +
                p.floor(p.random(-range, range))) *
              this.channelLen;

            for (let y = 0; y < srcImg.height; y++) {
              for (let x = 0; x < srcImg.width; x++) {
                let index = (y * srcImg.width + x) * this.channelLen;

                let r2 = (index + randR) % srcImg.pixels.length;
                let g2 = (index + randG) % srcImg.pixels.length;
                let b2 = (index + randB) % srcImg.pixels.length;
                if (r2 < 0) r2 += srcImg.pixels.length;
                if (g2 < 0) g2 += srcImg.pixels.length;
                if (b2 < 0) b2 += srcImg.pixels.length;

                destPixels[index] = srcImg.pixels[r2];
                destPixels[index + 1] = srcImg.pixels[g2];
                destPixels[index + 2] = srcImg.pixels[b2];
                destPixels[index + 3] = srcImg.pixels[index + 3];
              }
            }
            return destPixels;
          }

          getRandomRectImg(srcImg) {
            let startX = p.floor(p.random(0, srcImg.width - 30));
            let startY = p.floor(p.random(0, srcImg.height - 50));
            let rectW = p.floor(p.random(30, srcImg.width - startX));
            let rectH = p.floor(p.random(1, 50));
            let destImg = srcImg.get(startX, startY, rectW, rectH);
            destImg.loadPixels();
            return destImg;
          }

          show() {
            this.replaceData(this.imgOrigin, this.copyData);

            let n = p.floor(p.random(100));
            if (n > 75 && this.throughFlag) {
              this.throughFlag = false;
              clearTimeout(glitchTimer);
              glitchTimer = setTimeout(
                () => {
                  this.throughFlag = true;
                },
                p.floor(p.random(40, 400)),
              );
            }

            if (!this.throughFlag) {
              p.image(this.imgOrigin, 0, 0);
              return;
            }

            this.flowLineImgs.forEach((v, i, arr) => {
              arr[i].pixels = this.flowLine(this.imgOrigin, v);
              this.replaceData(this.imgOrigin, arr[i].pixels);
            });

            this.shiftLineImgs.forEach((v, i, arr) => {
              if (p.floor(p.random(100)) > 50) {
                arr[i] = this.shiftLine(this.imgOrigin);
                this.replaceData(this.imgOrigin, arr[i]);
              } else if (arr[i]) {
                this.replaceData(this.imgOrigin, arr[i]);
              }
            });

            this.shiftRGBs.forEach((v, i, arr) => {
              if (p.floor(p.random(100)) > 65) {
                arr[i] = this.shiftRGB(this.imgOrigin);
                this.replaceData(this.imgOrigin, arr[i]);
              }
            });

            p.image(this.imgOrigin, 0, 0);

            this.scatImgs.forEach((obj) => {
              if (p.floor(p.random(100)) > 80) {
                obj.x = p.floor(
                  p.random(
                    -this.imgOrigin.width * 0.3,
                    this.imgOrigin.width * 0.7,
                  ),
                );
                obj.y = p.floor(
                  p.random(-this.imgOrigin.height * 0.1, this.imgOrigin.height),
                );
                obj.img = this.getRandomRectImg(this.imgOrigin);
              }
              if (obj.img) {
                p.image(obj.img, obj.x, obj.y);
              }
            });
          }
        }
      };

      p5Instance = new p5(sketch);
    });

    return () => {
      clearTimeout(glitchTimer);
      if (p5Instance) p5Instance.remove();
    };
  }, [
    imgSrc,
    frameSize,
    channelLen,
    flowLineCount,
    shiftLineCount,
    scatImgsCount,
  ]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center select-none overflow-hidden ${backgroundColor} ${className}`}
    >
      <div
        ref={containerRef}
        className="block max-w-full aspect-square overflow-hidden [&>canvas]:block [&>canvas]:!w-full [&>canvas]:!h-auto"
        style={{ width: `${frameSize}px` }}
      >
        {!isLoaded && (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs tracking-widest font-mono uppercase animate-pulse">
            {loadingText}
          </div>
        )}
      </div>
    </div>
  );
}
