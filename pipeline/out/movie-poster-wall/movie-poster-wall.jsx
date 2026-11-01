"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
}

function shuffleList(list) {
  const newList = [];
  const copy = [...list];
  while (copy.length > 0) {
    const random = Math.floor(Math.random() * copy.length);
    newList.push(copy.splice(random, 1)[0]);
  }
  return newList;
}

function fetchAndStore(key, url) {
  try {
    const storage = localStorage.getItem(key);
    if (storage) return Promise.resolve(JSON.parse(storage));
  } catch (_) {}
  return fetch(url)
    .then((r) => r.json())
    .then((data) => {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
      return data;
    });
}
export default function MoviePosterWall({
  tmdbApiKey      = '17f6c7973c2ed29ef001953add2d04d3',
  watchProviders  = [386, 387],
  logoText          = 'STRIX',
  logoSubtext       = '',
  logoFont          = 'system-ui, sans-serif',
  logoColor         = '#ffffff',
  logoSize          = '8vw',
  logoSubSize       = '2vw',
  logoLetterSpacing = '0.3em',
  showLogo          = true,
  cols            = 11,
  rows            = 10,
  posterW         = 27,
  posterH         = 40,
  posterPadding   = 2,
  posterRadius    = 3,
  posterResIndex  = 2,
  fov             = 75,
  cameraRotationX = 0.6,
  cameraY         = null,
  cameraZ         = 100,
  lightIntensity  = 2500,
  lightDistance   = 500,
  lightZ          = 50,
  autoScrollSpeed  = 0.3,
  scrollMultiplier = 1,
  scrollIdleMs     = 50,
  backgroundColor = '#000000',

  className = '',
}) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const scene    = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    const canvasW = window.innerWidth;
    const canvasH = window.innerWidth * 414 / 1075;
    renderer.setSize(canvasW, canvasH);

    const camera = new THREE.PerspectiveCamera(fov, canvasW / canvasH * 0.5, 0.01, 1000);
    camera.rotation.x = cameraRotationX;
    camera.position.z = cameraZ;
    camera.position.y = cameraY ?? posterH * 1.5;

    const light = new THREE.PointLight(0xffffff, lightIntensity, lightDistance);
    light.position.set(0, posterH * 1.5, lightZ);
    scene.add(light);
    const posterShape    = new THREE.Shape();
    roundedRect(posterShape, 0, 0, posterW, posterH, posterRadius);
    const posterGeometry = new THREE.ShapeGeometry(posterShape);
    const startingY  = -posterH - posterPadding;
    const assetGroup = new THREE.Group();
    assetGroup.position.y = startingY;
    assetGroup.position.x = -((posterW * cols) + (posterPadding * cols - 1)) / 2;
    scene.add(assetGroup);

    const posterCollection = [];
    let assetGroupY  = startingY;
    let scrollStatus = false;
    let waitForIt;
    let frameCount   = 1;
    let animId;

    function scrollPosters(moveY = 0.1) {
      if (assetGroup.position.y >= 0) {
        loopPosters();
        assetGroupY = startingY;
      } else {
        assetGroupY += moveY;
      }
    }

    function loopPosters() {
      if (!posterCollection.length) return;
      const lastY = (posterH * posterCollection.length) + (posterPadding * (posterCollection.length - 1));
      posterCollection.forEach((row) => {
        if (row.position.y >= lastY) {
          row.position.y = -startingY;
        } else {
          row.position.y += -startingY;
        }
      });
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (frameCount % 3 === 0) {
        if (!scrollStatus) scrollPosters(autoScrollSpeed);
        frameCount = 1;
        assetGroup.position.y = assetGroupY;
        renderer.render(scene, camera);
      } else {
        frameCount++;
      }
    }

    animate();

    const onWheel = (e) => {
      e.preventDefault();
      clearTimeout(waitForIt);
      scrollStatus = true;
      scrollPosters(Math.abs(e.deltaY) * scrollMultiplier * 0.05);
      waitForIt = setTimeout(() => { scrollStatus = false; }, scrollIdleMs);
    };
    container.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerWidth * 414 / 1075;
      renderer.setSize(w, h);
      camera.aspect = w / h * 0.5;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    const providers = watchProviders.join('|');

    async function fetchConfig() {
      return fetchAndStore('tmdbConfig', `https://api.themoviedb.org/3/configuration?api_key=${tmdbApiKey}`);
    }

    async function fetchAssetList(type, page) {
      const url = `https://api.themoviedb.org/3/discover/${type}?api_key=${tmdbApiKey}&include_adult=false&sort_by=popularity.desc&language=en-US&page=${page}&watch_region=US&with_watch_providers=${providers}`;
      return fetchAndStore(`tmdbList_${type}_${page}`, url);
    }

    async function init() {
      try {
        const config = await fetchConfig();
        const pages  = await Promise.all([
          fetchAssetList('tv',    1), fetchAssetList('tv',    2), fetchAssetList('tv',    3),
          fetchAssetList('movie', 1), fetchAssetList('movie', 2), fetchAssetList('movie', 3),
        ]);
        const assetList = shuffleList(pages.flatMap((p) => p.results || []))
          .slice(0, cols * rows);
        renderPosters(config.images, assetList);
      } catch (err) {
        console.warn('MoviePosterWall: failed to fetch TMDB data', err);
      }
    }

    function renderPosters(config, assetList) {
      const textureLoader = new THREE.TextureLoader();
      let x = 0, y = 0;
      let rowGroup;

      assetList.forEach((asset, i) => {
        if (i % cols === 0) {
          y += posterH + posterPadding;
          x  = 0;
          rowGroup = new THREE.Group();
          rowGroup.position.y = y;
          assetGroup.add(rowGroup);
          posterCollection.push(rowGroup);
        } else {
          x += posterW + posterPadding;
        }

        const path = asset.poster_path;
        if (!path) return;

        const baseUrl = config.secure_base_url;
        const size    = config.poster_sizes?.[posterResIndex] ?? 'w185';
        const url     = `${baseUrl}${size}${path}`;

        const tex = textureLoader.load(url);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.037, 0.025);

        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex });
        const poster   = new THREE.Mesh(posterGeometry, material);
        poster.position.x = x;
        poster.name = asset.name || asset.title || '';
        rowGroup.add(poster);
      });
    }

    init();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(waitForIt);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      posterGeometry.dispose();
    };
  }, [
    tmdbApiKey, cols, rows, posterW, posterH, posterPadding, posterRadius, posterResIndex,
    fov, cameraRotationX, cameraY, cameraZ,
    lightIntensity, lightDistance, lightZ,
    autoScrollSpeed, scrollMultiplier, scrollIdleMs,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <div className="absolute bottom-0 left-0 w-full">
        <canvas ref={canvasRef} className="block w-full h-auto" />
      </div>
      {showLogo && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none">
          <span
            className="font-extrabold leading-none"
            style={{
              fontFamily:    logoFont,
              fontSize:      logoSize,
              color:         logoColor,
              letterSpacing: logoLetterSpacing,
              textShadow:    '0 4px 40px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)',
            }}
          >
            {logoText}
          </span>

          {logoSubtext && (
            <span
              className="mt-[0.5em] font-light opacity-70"
              style={{
                fontFamily:    logoFont,
                fontSize:      logoSubSize,
                color:         logoColor,
                letterSpacing: logoLetterSpacing,
                textShadow:    '0 2px 12px rgba(0,0,0,0.8)',
              }}
            >
              {logoSubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}