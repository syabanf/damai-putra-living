import React, { useRef, useState, useEffect } from 'react';

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
  '#6C5CE7', '#FD79A8', '#00CEC9', '#FDCB6E', '#E17055',
  '#74B9FF', '#55EFC4',
];

export default function RouletteWheel({ prizes = [], onSpinEnd, disabled = false }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const animRef = useRef(null);

  const items = prizes.length > 0 ? prizes : [{ label: 'Coba Lagi' }];
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

    items.forEach((item, i) => {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;
      const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${items.length > 8 ? 10 : 12}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      const label = item.label?.length > 12 ? item.label.slice(0, 11) + '…' : item.label;
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center star
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#1FB6D5';
    ctx.fill();
  };

  React.useEffect(() => {
    draw(rotation);
  }, [prizes]);

  const spin = () => {
    if (spinning || disabled || items.length === 0) return;
    setSpinning(true);

    const extraSpins = 6 + Math.random() * 4; // 6-10 full rotations
    const randomStop = Math.random() * 2 * Math.PI;
    const totalRotation = extraSpins * 2 * Math.PI + randomStop;
    const duration = 4000 + Math.random() * 1500;
    const startTime = performance.now();
    const startRot = rotationRef.current;

    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentAngle = startRot + totalRotation * ease(progress);
      rotationRef.current = currentAngle;
      setRotation(currentAngle);
      draw(currentAngle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Determine which prize landed
        const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at angle 0 (right), we subtract to find which slice is under the pointer
        const pointerAngle = (2 * Math.PI - normalizedAngle) % (2 * Math.PI);
        const idx = Math.floor(pointerAngle / sliceAngle) % items.length;
        onSpinEnd && onSpinEnd(items[idx], idx);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pointer */}
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '20px solid #0F3D4C',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }} />
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-full"
          style={{ touchAction: 'none' }}
        />
      </div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="px-10 py-3.5 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: spinning || disabled
            ? '#94a3b8'
            : 'linear-gradient(135deg, #1FB6D5 0%, #0F3D4C 100%)',
          boxShadow: spinning || disabled ? 'none' : '0 4px 16px rgba(31,182,213,0.4)',
        }}
      >
        {spinning ? '🎰 Memutar...' : '🎡 PUTAR!'}
      </button>
    </div>
  );
}