import { useEffect, useRef } from 'react';

interface HexCell {
  cx: number;
  cy: number;
  pulse: number;
  pulseSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  colorIdx: number;
}

const COLORS = [
  [0, 229, 255],   // cyan
  [139, 92, 246],  // violet
  [245, 158, 11],  // gold
] as const;

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    /* ── Hex grid (flat-top) ── */
    const R = width < 768 ? 32 : 40;     // hex radius
    const COL_W = R * 1.5;               // horizontal center-to-center
    const ROW_H = R * Math.sqrt(3);      // vertical center-to-center

    let hexes: HexCell[] = [];

    function buildHexes() {
      hexes = [];
      const cols = Math.ceil(width  / COL_W) + 3;
      const rows = Math.ceil(height / ROW_H) + 3;
      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const cx = col * COL_W;
          const cy = row * ROW_H + (col % 2 !== 0 ? ROW_H / 2 : 0);
          hexes.push({ cx, cy, pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.004 + Math.random() * 0.008 });
        }
      }
    }
    buildHexes();

    /* ── Particles ── */
    const N_PARTICLES = width < 768 ? 22 : 45;
    const particles: Particle[] = Array.from({ length: N_PARTICLES }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      size: Math.random() * 1.6 + 0.4,
      opacity: Math.random() * 0.45 + 0.1,
      colorIdx: Math.floor(Math.random() * COLORS.length),
    }));

    /* ── Draw a flat-top hex outline ── */
    function drawHex(cx: number, cy: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
    }

    let lastTime = 0;
    let animId = 0;

    function render(ts: number) {
      Math.min(ts - lastTime, 32);
      lastTime = ts;
      frameRef.current++;
      const t = ts * 0.001;

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      /* ── Hex grid ── */
      for (const h of hexes) {
        h.pulse += h.pulseSpeed;
        const ambient  = Math.sin(t * 0.4 + h.pulse) * 0.015 + 0.018;
        const dx       = h.cx - mx;
        const dy       = h.cy - my;
        const dist     = Math.sqrt(dx * dx + dy * dy);
        const prox     = Math.max(0, 1 - dist / 260);
        const opacity  = ambient + prox * 0.18;
        const lw       = 0.4 + prox * 1.2;

        ctx.lineWidth   = lw;
        ctx.strokeStyle = `rgba(0,229,255,${opacity})`;
        drawHex(h.cx, h.cy, R - 1.5);
        ctx.stroke();

        if (prox > 0.04) {
          ctx.fillStyle = `rgba(0,229,255,${prox * 0.05})`;
          drawHex(h.cx, h.cy, R - 1.5);
          ctx.fill();
        }
      }

      /* ── Particles ── */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)      p.x = width;
        if (p.x > width)  p.x = 0;
        if (p.y < 0)      p.y = height;
        if (p.y > height) p.y = 0;

        const [r, g, b] = COLORS[p.colorIdx];
        const pulse = (Math.sin(t * 1.8 + i) * 0.25 + 0.75);

        /* connections */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 110) * 0.09})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        /* dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity * pulse})`;
        ctx.fill();
      }

      /* ── Subtle vignette ── */
      const vg = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.85);
      vg.addColorStop(0, 'transparent');
      vg.addColorStop(1, 'rgba(5,5,16,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    const onMouse  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
      buildHexes();
    };

    window.addEventListener('mousemove', onMouse,  { passive: true });
    window.addEventListener('resize',   onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize',   onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  );
};

export default AnimatedBackground;
