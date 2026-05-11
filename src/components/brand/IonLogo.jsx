import React from 'react';

const BLUE = '#1684F2';
const BLUE_DARK = '#0B57C2';
const INK = '#231F20';

export default function IonLogo({ variant = 'horizontal', className = '', light = false }) {
  const textColor = light ? '#FFFFFF' : INK;
  const subTextColor = light ? 'rgba(255,255,255,0.78)' : '#323236';
  const showText = variant !== 'mark';
  const width = variant === 'stacked' ? 220 : showText ? 320 : 80;
  const height = variant === 'stacked' ? 150 : 86;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="ION Integrity On Network"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ion-mark-gradient" x1="18" y1="12" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor={BLUE} />
          <stop offset="1" stopColor={BLUE_DARK} />
        </linearGradient>
        <radialGradient id="ion-globe-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 43) rotate(90) scale(20)">
          <stop stopColor="#7EE8FF" />
          <stop offset="0.65" stopColor={BLUE} />
          <stop offset="1" stopColor={BLUE_DARK} />
        </radialGradient>
      </defs>

      <g transform={variant === 'stacked' ? 'translate(70 4)' : 'translate(0 4)'}>
        <path
          d="M20 52C18 38 23 25 34 15C40 10 50 10 54 17C58 23 55 30 48 34C41 38 37 45 37 54C37 65 44 75 55 79C48 83 39 84 31 80C25 73 21 64 20 52Z"
          fill="url(#ion-mark-gradient)"
        />
        <path
          d="M80 52C82 38 77 25 66 15C60 10 50 10 46 17C42 23 45 30 52 34C59 38 63 45 63 54C63 65 56 75 45 79C52 83 61 84 69 80C75 73 79 64 80 52Z"
          fill="url(#ion-mark-gradient)"
        />
        <path
          d="M29 72C35 82 43 87 50 87C57 87 65 82 71 72C65 76 58 78 50 78C42 78 35 76 29 72Z"
          fill="url(#ion-mark-gradient)"
        />
        <circle cx="50" cy="48" r="20" fill="url(#ion-globe-gradient)" />
        <path d="M31 48H69M34 40H66M34 56H66M50 29C43 35 40 42 40 48C40 54 43 61 50 67M50 29C57 35 60 42 60 48C60 54 57 61 50 67" stroke="rgba(255,255,255,0.72)" strokeWidth="1.2" fill="none" />
      </g>

      {showText && (
        <g transform={variant === 'stacked' ? 'translate(0 98)' : 'translate(100 20)'}>
          <text
            x="0"
            y={variant === 'stacked' ? '30' : '42'}
            fill={textColor}
            fontFamily="Arial Black, Arial, sans-serif"
            fontSize={variant === 'stacked' ? '52' : '64'}
            fontWeight="900"
            letterSpacing="-4"
          >
            ION
          </text>
          <text
            x={variant === 'stacked' ? '2' : '0'}
            y={variant === 'stacked' ? '58' : '70'}
            fill={subTextColor}
            fontFamily="Arial, sans-serif"
            fontSize={variant === 'stacked' ? '17' : '21'}
            letterSpacing="1.4"
          >
            Integrity On Network
          </text>
        </g>
      )}
    </svg>
  );
}
