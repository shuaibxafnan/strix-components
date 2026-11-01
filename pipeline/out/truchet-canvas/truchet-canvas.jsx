"use client";

import { useEffect, useRef } from "react";

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
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let p5Instance = null;
    let cancelled = false;

    import("p5")
      .then(({ default: P5 }) => {
        if (cancelled || !containerRef.current) return;
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

            let n = p.createGraphics(cellSize, cellSize);
            for (let i = 0; i < cellSize; i++) {
              for (let j = 0; j < cellSize; j++) {
                n.stroke(0, 20 + p.random() * noiseOpacity);
                n.point(i, j);
              }
            }

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

        p5Instance = new P5(sketch, containerRef.current);
      })
      .catch((err) =>
        console.error("[TruchetCanvas] Initialisation failure: ", err),
      );

    return () => {
      cancelled = true;
      if (p5Instance) p5Instance.remove();
    };
  }, [baseHue, cellSize, outlineWeight, strokeColor, noiseOpacity]);

  return (
    <div
      className={`w-full h-screen relative overflow-hidden bg-black select-none ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full h-full block [&>canvas]:block"
      />
    </div>
  );
}
