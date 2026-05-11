import React, { useRef, useState, useEffect } from 'react';

const SLICE_COLORS = [
  '#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF','#FF8B94',
  '#6C5CE7','#FD79A8','#00CEC9','#FDCB6E','#E17055',
  '#74B9FF','#55EFC4',
];

export default function NameRouletteWheel({ names = [], onSpinEnd }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);
  const animRef = useRef(null);

  const items = names.length > 0 ? names : ['Peserta'];
  const sliceAngle = (2 * Math.PI) / items.length;

  const draw = (angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    items.forEach((name, i) => {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      const fontSize = items.length > 10 ? 9 : items.length > 6 ? 11 : 13;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      const label = name.length > 14 ? name.slice(0, 13) + '…' : name;
      ctx.fillText(label, r - 12, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, 2 * Math.PI);
    ctx.fillStyle = '#231F20';
    ctx.fill();
  };

  useEffect(() => {
    draw(rotationRef.current);
  }, [names]);

  const spin = () => {
    if (spinning || items.length === 0) return;
    setSpinning(true);

    const extraSpins = 7 + Math.random() * 5;
    const randomStop = Math.random() * 2 * Math.PI;
    const totalRotation = extraSpins * 2 * Math.PI + randomStop;
    const duration = 4500 + Math.random() * 2000;
    const startTime = performance.now();
    const startRot = rotationRef.current;

    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentAngle = startRot + totalRotation * ease(progress);
      rotationRef.current = currentAngle;
      draw(currentAngle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (2 * Math.PI - normalizedAngle) % (2 * Math.PI);
        const idx = Math.floor(pointerAngle / sliceAngle) % items.length;
        onSpinEnd && onSpinEnd(items[idx], idx);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '22px solid #231F20',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
          }} />
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-full"
          style={{ touchAction: 'none' }}
        />
      </div>
      <button
        onClick={spin}
        disabled={spinning || items.length === 0}
        className="px-10 py-3.5 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: spinning
            ? '#94a3b8'
            : 'linear-gradient(135deg, #1684F2 0%, #231F20 100%)',
          boxShadow: spinning ? 'none' : '0 4px 16px rgba(22,132,242,0.4)',
        }}
      >
        {spinning ? '🎰 Memutar...' : '🎡 PUTAR NAMA!'}
      </button>
    </div>
  );
}