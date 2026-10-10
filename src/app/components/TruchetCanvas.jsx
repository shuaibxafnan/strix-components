"use client";

import { useEffect, useRef, useState } from "react";

// ─── TruchetCanvas ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// baseHue          number   0.6       Base color selection parameter (0 to 1)
// cellSize         number   20        Pixel size edge constraints for individual grid cells
// outlineWeight    number   3         Stroke line weight thickness separating color waves
// strokeColor      string   #000000   Dividing border color hex between patterns
// noiseOpacity     number   50        Maximum grain distribution intensity variation
// showControls     boolean  true      Toggle on/off the interactive instruction HUD layer
// textControlColor string   text-white Tailwind styling class dictating text coloring
// ──────────────────────────────────────────────────────────────────────────

const PATHS = [
  [
    [0, 0],
    [0.5, 0],
    [0, 0.5],
  ],
  [
    [0.5, 0],
    [1, 0],
    [1, 0.5],
    [0.5, 1],
    [0, 1],
    [0, 0.5],
  ],
  [
    [1, 1],
    [1, 0.5],
    [0.5, 1],
  ],
];

export default function TruchetCanvas({
  baseHue = 0.6,
  cellSize = 20,
  outlineWeight = 3,
  strokeColor = "#000000",
  noiseOpacity = 50,
  showControls = true,
  textControlColor = "text-white",
}) {
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Prevent server compilation rendering conflicts
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let p5Instance = null;

    const loadP5 = () =>
      new Promise((resolve, reject) => {
        if (window.p5) {
          resolve(window.p5);
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js";
        script.setAttribute("data-id", "p5");
        script.onload = () => resolve(window.p5);
        script.onerror = () =>
          reject(new Error("Failed to initialize p5 script"));
        document.head.appendChild(script);
      });

    loadP5()
      .then((p5) => {
        if (!containerRef.current) return;

        // Clean instance sketch logic scoping parameters locally
        const sketch = (p) => {
          let grid = [];
          let cells = [];
          let tiles = [];
          let mx = 0;
          let my = 0;
          let gw = 0;
          let gh = 0;

          class Cell {
            constructor(x, y, left) {
              this.x = x;
              this.y = y;
              this.left = left;
              this.col = 1;
            }
            render() {
              let idx = this.left ? 0 : 2;
              let t = tiles[idx + 1 - this.col];
              p.image(t, this.x, this.y, 1, 1);
            }
          }

          const createGrid = () => {
            grid = [];
            cells = [];
            gw = p.floor(p.width / cellSize);
            gh = p.floor(p.height / cellSize);
            gw = p.max(p.floor(gw / 2) * 2, 2);
            gh = p.max(p.floor(gh / 2) * 2, 2);

            for (let i = 0; i < gw; i++) {
              grid.push([]);
              for (let j = 0; j < gh; j++) {
                let cell = new Cell(i, j, p.random() < 0.5);
                grid[i].push(cell);
                cells.push(cell);
              }
            }
          };

          const updateColors = () => {
            for (let i = 0; i < gw; i++) {
              for (let j = 0; j < gh; j++) {
                let c = grid[i][j];
                if (i === 0) {
                  if (j !== 0) {
                    let c2 = grid[i][j - 1];
                    if (c.left ^ c2.left) c.col = c2.col;
                    else c.col = 1 - c2.col;
                  }
                } else {
                  let c2 = grid[i - 1][j];
                  if (c.left ^ c2.left) c.col = c2.col;
                  else c.col = 1 - c2.col;
                }
              }
            }
          };

          const createTiles = () => {
            tiles.forEach((t) => t.remove());
            tiles = [];

            // Grain Matrix creation
            let n = p.createGraphics(cellSize, cellSize);
            for (let i = 0; i < cellSize; i++) {
              for (let j = 0; j < cellSize; j++) {
                n.stroke(0, 20 + p.random() * noiseOpacity);
                n.point(i, j);
              }
            }

            // Quadrant Generation
            for (let i = 0; i < 4; i++) {
              let g = p.createGraphics(cellSize, cellSize);
              g.colorMode(p.HSB, 1, 1, 1);
              let col = i % 2;
              let left = p.floor(i / 2);
              g.noStroke();
              g.scale(cellSize);

              if (left === 0) {
                g.translate(1, 0);
                g.scale(-1, 1);
              }

              for (let k = 0; k < 3; k++) {
                g.fill(baseHue, col, 1);
                if (k % 2 === 1) g.fill(baseHue, 1 - col, 1);

                let path = PATHS[k];
                g.beginShape();
                path.forEach((pt) => g.vertex(pt[0], pt[1]));
                g.endShape(p.CLOSE);
              }

              g.strokeWeight(outlineWeight / cellSize);
              g.stroke(strokeColor);
              g.line(0.5, 0, 0, 0.5);
              g.line(1, 0.5, 0.5, 1);
              g.image(n, 0, 0, 1, 1);
              tiles.push(g);
            }
            n.remove();
          };

          const initCanvas = () => {
            createGrid();
            createTiles();
            updateColors();
          };

          p.setup = () => {
            p.pixelDensity(1);
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.colorMode(p.HSB, 1, 1, 1);
            initCanvas();
          };

          p.draw = () => {
            p.background(0);
            p.scale(p.width / gw, p.height / gh);
            cells.forEach((c) => c.render());
          };

          p.mouseMoved = () => {
            let px = mx;
            let py = my;
            mx = p.floor(p.mouseX / (p.width / gw));
            my = p.floor(p.mouseY / (p.height / gh));

            if (mx >= 0 && mx < gw && my >= 0 && my < gh) {
              if (px !== mx || py !== my) {
                let c = grid[mx][my];
                if (c) {
                  c.left = !c.left;
                  updateColors();
                }
              }
            }
          };

          p.mousePressed = () => {
            // Check boundary constraint to prevent conflict clicking menus
            if (
              p.mouseX > 0 &&
              p.mouseX < p.width &&
              p.mouseY > 0 &&
              p.mouseY < p.height
            ) {
              initCanvas();
            }
          };

          p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            initCanvas();
          };
        };

        p5Instance = new p5(sketch, containerRef.current);
      })
      .catch((err) =>
        console.error("[TruchetCanvas] Initialisation failure: ", err),
      );

    return () => {
      if (p5Instance) p5Instance.remove();
    };
  }, [isClient, baseHue, cellSize, outlineWeight, strokeColor, noiseOpacity]);

  if (!isClient) {
    return <div className="w-full h-full min-h-screen bg-black" />;
  }

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      {showControls && (
        <div
          id="controls"
          className={`absolute top-0 left-0 m-5 z-10 font-sans text-sm tracking-wide pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${textControlColor}`}
        ></div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full block [&>canvas]:block"
      />
    </div>
  );
}
