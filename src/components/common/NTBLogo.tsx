import React from 'react';

interface NTBLogoProps {
  className?: string;
  size?: number;
}

export const NTBLogo: React.FC<NTBLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-2 shadow-md ring-1 ring-emerald-500/30 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Shield background */}
        <path
          d="M100 10 L180 40 V130 C180 185 140 220 100 235 C60 220 20 185 20 130 V40 L100 10 Z"
          fill="#064E3B"
          stroke="#F59E0B"
          strokeWidth="6"
        />
        {/* Inner shield gold border */}
        <path
          d="M100 20 L170 46 V126 C170 175 135 208 100 222 C65 208 30 175 30 126 V46 L100 20 Z"
          fill="#047857"
          stroke="#FEF08A"
          strokeWidth="2"
        />
        
        {/* Yellow Star at top */}
        <polygon
          points="100,32 104,44 116,44 106,51 110,63 100,55 90,63 94,51 84,44 96,44"
          fill="#FBBF24"
        />

        {/* Rinjani Mountain representation (Triangles) */}
        <polygon points="100,70 145,140 55,140" fill="#10B981" opacity="0.9" />
        <polygon points="100,70 130,140 70,140" fill="#047857" />
        <polygon points="100,70 100,140 55,140" fill="#059669" />

        {/* Deer / Menjangan Horns symbol & Rice & Cotton arcs */}
        <path
          d="M50 150 C70 170 130 170 150 150"
          stroke="#F59E0B"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M40 120 C40 170 100 195 100 195 C100 195 160 170 160 120"
          stroke="#FEF08A"
          strokeWidth="3"
          strokeDasharray="4 2"
        />

        {/* Base Banner "NTB BERSAING" / NTB */}
        <rect x="50" y="190" width="100" height="22" rx="4" fill="#065F46" stroke="#FBBF24" strokeWidth="1.5" />
        <text
          x="100"
          y="205"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          NTB
        </text>
      </svg>
    </div>
  );
};
