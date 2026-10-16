"use client";
import { useEffect, useRef } from "react";
import { IMAGE_IDS, imageUrl } from "@/lib/images";

const W = 280, H = 280;

// Interactive 3D Rotating Culinary Globe & Voronoi Mosaic for the Magazine Cover
export default function Voronoi() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const tiles: (Uint8ClampedArray | null)[] = IMAGE_IDS.map(() => null);
    const seeds = Array.from({ length: 16 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      a: Math.random() * 6.28,
      k: i % IMAGE_IDS.length,
    }));
    const out = ctx.createImageData(W, H);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mx = 0, my = 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 26;
      my = ((e.clientY - r.top) / r.height - 0.5) * 26;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = (t: number) => {
      const cx = W / 2, cy = H / 2, rad = W * 0.46;
      const p = seeds.map((s, idx) => ({
        ...s,
        x: s.x + Math.cos(s.a + t / 6500 + idx) * 7 + mx * 0.6,
        y: s.y + Math.sin(s.a + t / 5200 + idx) * 6 + my * 0.6,
      }));

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const dx = x - cx, dy = y - cy;
          const distSq = dx * dx + dy * dy;
          const o = (y * W + x) * 4;

          if (distSq > rad * rad) {
            out.data[o + 3] = 0;
            continue;
          }

          // 3D sphere normal and lighting
          const nz = Math.sqrt(Math.max(0, rad * rad - distSq)) / rad;
          const nx = dx / rad, ny = dy / rad;
          const light = Math.max(0.22, nx * -0.35 + ny * -0.45 + nz * 0.85);
          const rim = Math.pow(1 - nz, 2.6);

          let d1 = 1e9, d2 = 1e9, k = 0;
          for (let i = 0; i < p.length; i++) {
            const s = p[i];
            const d = (s.x - x) ** 2 + (s.y - y) ** 2;
            if (d < d1) {
              d2 = d1;
              d1 = d;
              k = i;
            } else if (d < d2) {
              d2 = d;
            }
          }

          const tile = tiles[p[k].k];
          const edge = Math.sqrt(d2) - Math.sqrt(d1) < 1.15;

          // Rich espresso and gold palette blending
          const baseR = tile ? tile[o] * 0.72 + 45 : 78;
          const baseG = tile ? tile[o + 1] * 0.62 + 28 : 48;
          const baseB = tile ? tile[o + 2] * 0.48 + 16 : 29;

          if (edge) {
            // Warm gold vein lines (#d4b483)
            out.data[o] = Math.min(255, 212 * light + rim * 60);
            out.data[o + 1] = Math.min(255, 180 * light + rim * 45);
            out.data[o + 2] = Math.min(255, 131 * light + rim * 25);
          } else {
            out.data[o] = Math.min(255, baseR * light + rim * 115);
            out.data[o + 1] = Math.min(255, baseG * light + rim * 85);
            out.data[o + 2] = Math.min(255, baseB * light + rim * 45);
          }
          out.data[o + 3] = 248;
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    draw(0);
    IMAGE_IDS.forEach((_, i) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.src = imageUrl(i, 400);
      im.onload = () => {
        const oc = document.createElement("canvas");
        oc.width = W;
        oc.height = H;
        const c = oc.getContext("2d")!;
        const sc = Math.max(W / im.width, H / im.height);
        c.drawImage(
          im,
          (W - im.width * sc) / 2,
          (H - im.height * sc) / 2,
          im.width * sc,
          im.height * sc
        );
        tiles[i] = c.getImageData(0, 0, W, H).data;
        if (reduce) draw(0);
      };
    });

    if (reduce) return () => window.removeEventListener("pointermove", onMove);
    let raf = 0, last = 0;
    const loop = (t: number) => {
      if (t - last > 65) {
        draw(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="orbWrap" aria-hidden="true">
      <div className="orbGlow" />
      <div className="orbRing orbRing--outer" />
      <div className="orbRing orbRing--inner" />
      <canvas ref={ref} width={W} height={H} className="voronoiOrb" />
      <span className="orbLabel orbLabel--1">Heritage</span>
      <span className="orbLabel orbLabel--2">Ritual</span>
      <span className="orbLabel orbLabel--3">Region</span>
      <span className="orbLabel orbLabel--4">Memory</span>
    </div>
  );
}
