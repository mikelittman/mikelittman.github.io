"use client";

import { useEffect, useRef } from "react";

type Seed = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

const SEED_COUNT = 36;
const BASE_HUES = [198, 214, 232, 246, 266, 292, 328];

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = l - c / 2;

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function prefersDarkMode(): boolean {
  const explicitTheme = document.documentElement.getAttribute(
    "data-theme",
  );

  if (explicitTheme === "dark") {
    return true;
  }

  if (explicitTheme === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)")
    .matches;
}

export function VoronoiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", {
      alpha: true,
    });

    if (!ctx) {
      return;
    }

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      return;
    }

    let width = 0;
    let height = 0;
    let gridWidth = 0;
    let gridHeight = 0;

    const seeds: Seed[] = Array.from(
      {
        length: SEED_COUNT,
      },
      (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0014,
        vy: (Math.random() - 0.5) * 0.0014,
        hue:
          BASE_HUES[index % BASE_HUES.length] +
          (Math.random() - 0.5) * 18,
      }),
    );

    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderScale = reducedMotion ? 0.34 : 0.52;
      gridWidth = Math.max(220, Math.floor(width * renderScale));
      gridHeight = Math.max(140, Math.floor(height * renderScale));

      tempCanvas.width = gridWidth;
      tempCanvas.height = gridHeight;
    };

    resize();

    const onMotionPrefChange = (
      event: MediaQueryListEvent,
    ) => {
      reducedMotion = event.matches;
      resize();
    };

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    reducedMotionQuery.addEventListener(
      "change",
      onMotionPrefChange,
    );

    window.addEventListener("resize", resize);

    let rafId = 0;
    let lastFrame = 0;

    const render = (timestamp: number) => {
      const frameBudget = reducedMotion ? 180 : 70;

      if (timestamp - lastFrame < frameBudget) {
        rafId = requestAnimationFrame(render);
        return;
      }

      lastFrame = timestamp;

      for (const seed of seeds) {
        seed.x += seed.vx;
        seed.y += seed.vy;

        if (seed.x <= 0 || seed.x >= 1) {
          seed.vx *= -1;
          seed.x = Math.min(1, Math.max(0, seed.x));
        }

        if (seed.y <= 0 || seed.y >= 1) {
          seed.vy *= -1;
          seed.y = Math.min(1, Math.max(0, seed.y));
        }
      }

      const isDark = prefersDarkMode();
      const image = tempCtx.createImageData(gridWidth, gridHeight);
      const px = image.data;

      const palette = seeds.map((seed) =>
        hslToRgb(
          seed.hue,
          isDark ? 0.42 : 0.5,
          isDark ? 0.29 : 0.62,
        ),
      );

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const pxNorm = x / gridWidth;
          const pyNorm = y / gridHeight;

          let nearest = 0;
          let secondNearest = 0;
          let thirdNearest = 0;
          let minDist = Number.POSITIVE_INFINITY;
          let secondMinDist = Number.POSITIVE_INFINITY;
          let thirdMinDist = Number.POSITIVE_INFINITY;

          for (let i = 0; i < seeds.length; i++) {
            const dx = pxNorm - seeds[i].x;
            const dy = pyNorm - seeds[i].y;
            const dist = dx * dx + dy * dy;

            if (dist < minDist) {
              thirdMinDist = secondMinDist;
              thirdNearest = secondNearest;
              secondMinDist = minDist;
              secondNearest = nearest;
              minDist = dist;
              nearest = i;
            } else if (dist < secondMinDist) {
              thirdMinDist = secondMinDist;
              thirdNearest = secondNearest;
              secondMinDist = dist;
              secondNearest = i;
            } else if (dist < thirdMinDist) {
              thirdMinDist = dist;
              thirdNearest = i;
            }
          }

          const primaryColor = palette[nearest];
          const secondaryColor = palette[secondNearest];
          const tertiaryColor = palette[thirdNearest];
          const primaryW = 1 / (minDist + 0.00008);
          const secondaryW = 1 / (secondMinDist + 0.00008);
          const tertiaryW = 1 / (thirdMinDist + 0.00008);
          const wSum = primaryW + secondaryW + tertiaryW;
          const blendStrength = isDark ? 0.22 : 0.32;
          const w0 =
            1 - blendStrength + (blendStrength * primaryW) / wSum;
          const w1 = (blendStrength * secondaryW) / wSum;
          const w2 = (blendStrength * tertiaryW) / wSum;
          const radialX = x / gridWidth - 0.5;
          const radialY = y / gridHeight - 0.5;
          const vignette = radialX * radialX + radialY * radialY;
          const lightShift = isDark
            ? -Math.min(36, vignette * 56)
            : -Math.min(20, vignette * 36);

          const dataIndex = (y * gridWidth + x) * 4;
          px[dataIndex] = Math.max(
            0,
            Math.min(
              255,
              primaryColor.r * w0 +
                secondaryColor.r * w1 +
                tertiaryColor.r * w2 +
                lightShift +
                6,
            ),
          );
          px[dataIndex + 1] = Math.max(
            0,
            Math.min(
              255,
              primaryColor.g * w0 +
                secondaryColor.g * w1 +
                tertiaryColor.g * w2 +
                lightShift +
                5,
            ),
          );
          px[dataIndex + 2] = Math.max(
            0,
            Math.min(
              255,
              primaryColor.b * w0 +
                secondaryColor.b * w1 +
                tertiaryColor.b * w2 +
                lightShift +
                8,
            ),
          );
          px[dataIndex + 3] = isDark ? 80 : 96;
        }
      }

      tempCtx.putImageData(image, 0, 0);

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.filter = "blur(0.55px) saturate(108%)";
      ctx.drawImage(tempCanvas, 0, 0, width, height);
      ctx.filter = "none";

      const radialGlow = ctx.createRadialGradient(
        width * 0.2,
        height * 0.15,
        width * 0.04,
        width * 0.2,
        height * 0.15,
        width * 0.72,
      );
      radialGlow.addColorStop(
        0,
        isDark
          ? "rgba(140, 168, 255, 0.1)"
          : "rgba(95, 146, 238, 0.08)",
      );
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      const horizonTint = ctx.createLinearGradient(
        0,
        0,
        width,
        height,
      );
      horizonTint.addColorStop(
        0,
        isDark
          ? "rgba(229, 152, 140, 0.04)"
          : "rgba(246, 182, 148, 0.05)",
      );
      horizonTint.addColorStop(
        1,
        isDark
          ? "rgba(118, 166, 255, 0.06)"
          : "rgba(148, 188, 252, 0.07)",
      );
      ctx.fillStyle = horizonTint;
      ctx.fillRect(0, 0, width, height);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      reducedMotionQuery.removeEventListener(
        "change",
        onMotionPrefChange,
      );
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className="voronoi-bg"
      ref={canvasRef}
    />
  );
}
