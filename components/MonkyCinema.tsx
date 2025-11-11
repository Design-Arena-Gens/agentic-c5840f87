"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORY_DURATION, sceneBeats } from "@/lib/storyData";

const CANVAS_ASPECT = 9 / 16;

const paletteStops = [
  { sky: "#1f1647", canopy: "#142d37", glow: "#f7c066" },
  { sky: "#2b3a68", canopy: "#1c4838", glow: "#ff9f66" },
  { sky: "#374462", canopy: "#215045", glow: "#fcd85d" },
  { sky: "#192b4d", canopy: "#163028", glow: "#ffa45b" },
  { sky: "#0d1a35", canopy: "#132417", glow: "#8fe1ff" },
  { sky: "#040915", canopy: "#0b1715", glow: "#f2c7ff" }
];

type Palette = (typeof paletteStops)[number];

const easeInOut = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mixColor = (a: string, b: string, t: number) => {
  const parse = (hex: string) => {
    const normalized = hex.replace("#", "");
    const bigint = parseInt(normalized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  };
  const ca = parse(a);
  const cb = parse(b);
  const red = Math.round(lerp(ca.r, cb.r, t));
  const green = Math.round(lerp(ca.g, cb.g, t));
  const blue = Math.round(lerp(ca.b, cb.b, t));
  return `rgb(${red}, ${green}, ${blue})`;
};

const getInterpolatedPalette = (progress: number): Palette => {
  if (progress <= 0) return paletteStops[0];
  if (progress >= 1) return paletteStops[paletteStops.length - 1];
  const scaled = progress * (paletteStops.length - 1);
  const index = Math.floor(scaled);
  const t = scaled - index;
  const start = paletteStops[index];
  const end = paletteStops[index + 1];
  return {
    sky: mixColor(start.sky, end.sky, t),
    canopy: mixColor(start.canopy, end.canopy, t),
    glow: mixColor(start.glow, end.glow, t)
  };
};

const formatTimestamp = (elapsedMs: number) => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const drawMonky = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  palette: Palette
) => {
  const eased = easeInOut(progress);
  const baseX = lerp(width * 0.2, width * 0.78, eased + 0.05 * Math.sin(progress * Math.PI * 4));
  const baseY = lerp(height * 0.65, height * 0.4, eased) + Math.sin(progress * Math.PI * 6) * 12;
  const scale = lerp(width * 0.08, width * 0.11, 0.5 + 0.5 * Math.sin(progress * Math.PI));
  const eyeBlink = Math.sin(progress * Math.PI * 12) > 0.94;

  ctx.save();
  ctx.translate(baseX, baseY);

  // Tail
  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = scale * 0.18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-scale * 0.4, -scale * 0.1);
  const tailSwing = Math.sin(progress * Math.PI * 4);
  ctx.quadraticCurveTo(
    -scale * (1.6 + tailSwing * 0.6),
    -scale * (1 + tailSwing * 0.4),
    -scale * (1.8 + tailSwing * 0.4),
    scale * 0.6
  );
  ctx.stroke();

  // Body
  ctx.fillStyle = mixColor(palette.canopy, palette.glow, 0.25);
  ctx.beginPath();
  ctx.ellipse(0, 0, scale * 0.72, scale, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = mixColor(palette.glow, "#fff4d8", 0.4);
  ctx.beginPath();
  ctx.arc(scale * 0.35, -scale * 0.75, scale * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Face mask
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(scale * 0.43, -scale * 0.72, scale * 0.45, scale * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#fefefe";
  ctx.beginPath();
  ctx.arc(scale * 0.55, -scale * 0.78, scale * 0.12, 0, Math.PI * 2);
  ctx.arc(scale * 0.32, -scale * 0.78, scale * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.glow;
  ctx.beginPath();
  if (!eyeBlink) {
    ctx.arc(scale * 0.55, -scale * 0.78, scale * 0.06, 0, Math.PI * 2);
    ctx.arc(scale * 0.32, -scale * 0.78, scale * 0.06, 0, Math.PI * 2);
  } else {
    ctx.ellipse(scale * 0.55, -scale * 0.78, scale * 0.07, scale * 0.02, 0, 0, Math.PI * 2);
    ctx.ellipse(scale * 0.32, -scale * 0.78, scale * 0.07, scale * 0.02, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Nose and mouth
  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = scale * 0.05;
  ctx.beginPath();
  ctx.moveTo(scale * 0.42, -scale * 0.63);
  ctx.quadraticCurveTo(scale * 0.45, -scale * 0.58, scale * 0.38, -scale * 0.56);
  ctx.moveTo(scale * 0.42, -scale * 0.63);
  ctx.quadraticCurveTo(scale * 0.39, -scale * 0.58, scale * 0.46, -scale * 0.56);
  ctx.stroke();

  // Ears
  ctx.fillStyle = mixColor(palette.glow, "#ffe6a6", 0.5);
  ctx.beginPath();
  ctx.arc(scale * 0.02, -scale * 0.92, scale * 0.22, 0, Math.PI * 2);
  ctx.arc(scale * 0.7, -scale * 0.92, scale * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Limbs
  const limbOffset = Math.sin(progress * Math.PI * 4) * scale * 0.3;
  ctx.fillStyle = mixColor(palette.canopy, palette.glow, 0.2);
  ctx.beginPath();
  ctx.ellipse(scale * 0.15, scale * 0.8, scale * 0.3, scale * 0.4, Math.PI / 12, 0, Math.PI * 2);
  ctx.ellipse(scale * 0.55, scale * 0.82, scale * 0.3, scale * 0.4, -Math.PI / 12, 0, Math.PI * 2);
  ctx.ellipse(scale * 0.15 + limbOffset * 0.3, -scale * 0.2, scale * 0.22, scale * 0.42, Math.PI / 10, 0, Math.PI * 2);
  ctx.ellipse(scale * 0.72 + limbOffset * 0.3, -scale * 0.25, scale * 0.22, scale * 0.42, -Math.PI / 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawScene = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  palette: Palette
) => {
  ctx.save();
  // Background gradient
  const verticalGradient = ctx.createLinearGradient(0, 0, 0, height);
  verticalGradient.addColorStop(0, palette.sky);
  verticalGradient.addColorStop(1, palette.canopy);
  ctx.fillStyle = verticalGradient;
  ctx.fillRect(0, 0, width, height);

  // Light glow orb
  const orbX = lerp(width * 0.2, width * 0.85, easeInOut(progress));
  const orbY = lerp(height * 0.18, height * 0.35, Math.sin(progress * Math.PI));
  const orbRadius = lerp(width * 0.08, width * 0.12, 0.5 + 0.5 * Math.sin(progress * Math.PI * 2));
  const radial = ctx.createRadialGradient(orbX, orbY, orbRadius * 0.2, orbX, orbY, orbRadius);
  radial.addColorStop(0, `${palette.glow}dd`);
  radial.addColorStop(1, `${palette.glow}00`);
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  // Distant trees parallax
  ctx.globalAlpha = 0.55;
  const treeCount = 12;
  for (let i = 0; i < treeCount; i += 1) {
    const fraction = i / treeCount;
    const sway = Math.sin(progress * Math.PI * 2 + fraction * Math.PI * 2) * 20;
    const treeX = fraction * width + sway;
    const treeHeight = lerp(height * 0.35, height * 0.75, (i % 5) / 5 + progress * 0.1);
    ctx.fillStyle = mixColor(palette.canopy, "#020b0d", 0.35 + (i % 3) * 0.1);
    ctx.beginPath();
    ctx.moveTo(treeX - 12, height);
    ctx.lineTo(treeX + 12, height);
    ctx.lineTo(treeX, height - treeHeight);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Vines
  ctx.strokeStyle = `${mixColor(palette.canopy, palette.glow, 0.25)}aa`;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  const vineLayers = 3;
  for (let layer = 0; layer < vineLayers; layer += 1) {
    const startY = lerp(height * 0.2, height * 0.45, layer / (vineLayers - 1));
    ctx.beginPath();
    ctx.moveTo(0, startY);
    const segments = 6;
    for (let s = 1; s <= segments; s += 1) {
      const segX = (s / segments) * width;
      const wave = Math.sin(progress * Math.PI * 2 + s + layer) * 30;
      ctx.quadraticCurveTo(
        segX - width / segments / 2,
        startY + wave * 0.3,
        segX,
        startY + wave
      );
    }
    ctx.stroke();
  }

  drawMonky(ctx, width, height, progress, palette);

  // Foreground foliage
  ctx.fillStyle = `${mixColor(palette.canopy, "#010302", 0.6)}e6`;
  ctx.beginPath();
  ctx.moveTo(-50, height);
  ctx.quadraticCurveTo(width * 0.2, height * 0.82, width * 0.45, height);
  ctx.lineTo(width * 0.7, height);
  ctx.quadraticCurveTo(width * 0.9, height * 0.78, width + 50, height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

const findActiveBeatIndex = (progress: number) => {
  const elapsed = progress * STORY_DURATION;
  let activeIndex = 0;
  for (let i = 0; i < sceneBeats.length; i += 1) {
    if (elapsed >= sceneBeats[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
};

export function MonkyCinema() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dprRef = useRef(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressState, setProgressState] = useState(0);
  const progressRef = useRef(0);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);

  const renderFrame = useCallback(
    (nextProgress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = dprRef.current;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      const palette = getInterpolatedPalette(nextProgress);
      drawScene(ctx, width, height, nextProgress, palette);
      ctx.restore();
    },
    []
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const width = container.clientWidth;
    const computedHeight = Math.max(320, width * CANVAS_ASPECT);
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${computedHeight}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(computedHeight * dpr);
    renderFrame(progressRef.current);
  }, [renderFrame]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      lastTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (!isPlaying) return;
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      const increment = delta / STORY_DURATION;
      const nextProgress = Math.min(progressRef.current + increment, 1);
      progressRef.current = nextProgress;
      setProgressState(nextProgress);
      renderFrame(nextProgress);
      if (nextProgress >= 1) {
        setIsPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [isPlaying, renderFrame]);

  useEffect(() => {
    renderFrame(progressState);
  }, [progressState, renderFrame]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        lastTimeRef.current = null;
      }
      return next;
    });
  };

  const handleScrub = (value: number) => {
    const normalized = Math.min(Math.max(value, 0), 1);
    progressRef.current = normalized;
    setProgressState(normalized);
    renderFrame(normalized);
  };

  const handleReplay = () => {
    progressRef.current = 0;
    setProgressState(0);
    renderFrame(0);
    setIsPlaying(true);
    lastTimeRef.current = null;
  };

  const activeBeatIndex = useMemo(
    () => findActiveBeatIndex(progressState),
    [progressState]
  );

  const activeBeat = sceneBeats[activeBeatIndex];
  const elapsedLabel = formatTimestamp(progressState * STORY_DURATION);
  const totalLabel = formatTimestamp(STORY_DURATION);

  return (
    <section id="monky-cinema" className="monky-cinema" aria-label="Monky Odyssey Video Experience">
      <div className="monky-cinema__stage" ref={containerRef}>
        <canvas ref={canvasRef} role="img" aria-label="Animated visualization of Kiko the monky exploring the rainforest" />
        <div className="monky-cinema__overlay">
          <div className="monky-cinema__overlay__tag">{activeBeat.focus}</div>
          <h2>{activeBeat.label}</h2>
          <p>{activeBeat.description}</p>
        </div>
        <div className="monky-cinema__timestamp" aria-hidden="true">
          {elapsedLabel} / {totalLabel}
        </div>
      </div>
      <div className="monky-cinema__controls">
        <button type="button" onClick={handleTogglePlay} className="monky-cinema__button">
          {isPlaying ? "Pause" : progressState >= 1 ? "Resume" : "Play"}
        </button>
        <input
          className="monky-cinema__scrubber"
          type="range"
          min={0}
          max={1000}
          value={Math.round(progressState * 1000)}
          onChange={(event) => handleScrub(Number(event.target.value) / 1000)}
          aria-label="Seek through the Monky Odyssey video"
        />
        <button
          type="button"
          onClick={handleReplay}
          className="monky-cinema__button monky-cinema__button--ghost"
        >
          Replay
        </button>
      </div>
    </section>
  );
}
