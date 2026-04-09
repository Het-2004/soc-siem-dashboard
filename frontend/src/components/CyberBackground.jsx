import { useEffect, useRef } from "react";

/**
 * CyberBackground — layered animated background:
 *   Layer 1: Matrix digital rain (falling katakana / digits)
 *   Layer 2: Pulsing hex grid overlay
 *   Layer 3: Radar sweep + random threat blips
 *   Layer 4: Moving scan line
 */
export default function CyberBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let w, h;

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initRain();
    };

    /* ════════════════════════════════════════════════
       LAYER 1 — Matrix digital rain
    ════════════════════════════════════════════════ */
    const FONT_SIZE = 13;
    const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF</>{}[]|\\";
    let cols = 0;
    let drops = [];

    const initRain = () => {
      cols  = Math.floor(w / FONT_SIZE);
      drops = Array.from({ length: cols }, () => Math.random() * -100);
    };
    initRain();
    window.addEventListener("resize", resize);

    /* ════════════════════════════════════════════════
       LAYER 2 — Hex grid
    ════════════════════════════════════════════════ */
    const HEX_R = 32;
    const HEX_W = HEX_R * Math.sqrt(3);
    const HEX_H = HEX_R * 2;

    const hexCorners = (cx, cy, r) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    };

    const buildHexes = () => {
      const out = [];
      const numCols = Math.ceil(w / HEX_W) + 4;
      const numRows = Math.ceil(h / (HEX_H * 0.75)) + 4;
      for (let row = -2; row < numRows; row++) {
        for (let col = -2; col < numCols; col++) {
          out.push({
            cx:    col * HEX_W + (row % 2 === 0 ? 0 : HEX_W / 2),
            cy:    row * HEX_H * 0.75,
            phase: Math.random() * Math.PI * 2,
            speed: 0.003 + Math.random() * 0.005,
            base:  0.018 + Math.random() * 0.028,
          });
        }
      }
      return out;
    };

    let hexes = buildHexes();
    window.addEventListener("resize", () => { hexes = buildHexes(); });

    /* ════════════════════════════════════════════════
       LAYER 3 — Radar sweep + blips
    ════════════════════════════════════════════════ */
    const RADAR_R  = Math.min(260, Math.min(window.innerWidth, window.innerHeight) * 0.2);
    let radarAngle = 0;
    const RADAR_SPD = 0.018;

    const blips = Array.from({ length: 8 }, () => ({
      a:     Math.random() * Math.PI * 2,
      r:     Math.random() * RADAR_R * 0.86,
      alpha: 0,
      color: Math.random() > 0.5 ? "0,255,100" : "255,51,102",
    }));

    /* ════════════════════════════════════════════════
       LAYER 4 — Scan line
    ════════════════════════════════════════════════ */
    let scanY = 0;
    const SCAN_SPD = 0.7;

    /* ════════════════════════════════════════════════
       RENDER LOOP
    ════════════════════════════════════════════════ */
    let frame = 0;

    const draw = (ts) => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      /* Base dark fill */
      ctx.fillStyle = "#050a12";
      ctx.fillRect(0, 0, w, h);

      /* Fade overlay for rain trail effect */
      ctx.fillStyle = "rgba(5,10,18,0.18)";
      ctx.fillRect(0, 0, w, h);

      /* ── LAYER 1: Matrix rain ───────────────────── */
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < cols; i++) {
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        ctx.fillStyle = "rgba(200,255,255,0.92)";
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y);

        ctx.fillStyle = "rgba(0,212,100,0.25)";
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FONT_SIZE);

        if (y > h && Math.random() > 0.975) drops[i] = Math.random() * -50;
        drops[i] += 0.38 + Math.random() * 0.15;
      }

      /* ── LAYER 2: Hex grid ──────────────────────── */
      const t = ts * 0.001;
      for (const hex of hexes) {
        const pulse = (Math.sin(t * hex.speed + hex.phase) + 1) / 2;
        const alpha = hex.base + pulse * 0.04;
        const pts   = hexCorners(hex.cx, hex.cy, HEX_R - 1);

        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < 6; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        ctx.closePath();

        if (pulse > 0.9) {
          ctx.fillStyle = `rgba(0,212,255,${(pulse - 0.9) * 0.07})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
        ctx.lineWidth   = 0.55;
        ctx.stroke();
      }

      /* ── LAYER 3: Radar (bottom-right corner) ───── */
      const rx = w - RADAR_R - 28;
      const ry = h - RADAR_R - 28;

      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        ctx.arc(rx, ry, RADAR_R * ring / 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,100,0.12)";
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(rx - RADAR_R, ry); ctx.lineTo(rx + RADAR_R, ry);
      ctx.moveTo(rx, ry - RADAR_R); ctx.lineTo(rx, ry + RADAR_R);
      ctx.strokeStyle = "rgba(0,255,100,0.1)";
      ctx.lineWidth   = 0.6;
      ctx.stroke();

      radarAngle = (radarAngle + RADAR_SPD) % (Math.PI * 2);

      for (let i = 0; i < 40; i++) {
        const a0 = radarAngle - (i / 40) * (Math.PI * 0.55);
        const a1 = radarAngle - ((i + 1) / 40) * (Math.PI * 0.55);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.arc(rx, ry, RADAR_R, a0, a1, true);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,255,120,${0.065 * (1 - i / 40)})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + RADAR_R * Math.cos(radarAngle), ry + RADAR_R * Math.sin(radarAngle));
      ctx.strokeStyle = "rgba(0,255,100,0.7)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      for (const b of blips) {
        const diff = ((radarAngle - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.18) b.alpha = 1;
        b.alpha *= 0.975;
        if (b.alpha > 0.04) {
          const bx = rx + b.r * Math.cos(b.a);
          const by = ry + b.r * Math.sin(b.a);
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${b.color},${b.alpha})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${b.color},${b.alpha * 0.25})`;
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(rx, ry, RADAR_R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,100,0.22)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      /* ── LAYER 4: Scan line ─────────────────────── */
      scanY = (scanY + SCAN_SPD) % h;
      const sg = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
      sg.addColorStop(0,   "rgba(0,212,255,0)");
      sg.addColorStop(0.5, "rgba(0,212,255,0.07)");
      sg.addColorStop(1,   "rgba(0,212,255,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 6, w, 12);

      /* ── Vignette ───────────────────────────────── */
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        zIndex:        0,
        pointerEvents: "none",
      }}
    />
  );
}
