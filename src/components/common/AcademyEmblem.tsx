import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AcademyEmblem: React.FC<EmblemProps> = ({ className = '', size = 52, showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md flex-shrink-0"
        aria-label="Real Madrid Football Phonics Academy Emblem"
      >
        <defs>
          {/* Authentic Real Madrid Royal Gold Gradient */}
          <linearGradient id="rmGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Real Madrid Deep Royal Navy */}
          <linearGradient id="rmNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F244A" />
            <stop offset="60%" stopColor="#001A49" />
            <stop offset="100%" stopColor="#05122B" />
          </linearGradient>

          {/* Authentic Real Madrid Castilian Purple Sash Gradient */}
          <linearGradient id="rmPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A2BE2" />
            <stop offset="50%" stopColor="#702082" />
            <stop offset="100%" stopColor="#4A1259" />
          </linearGradient>

          {/* Pearl White Gradient */}
          <linearGradient id="rmWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="80%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Subtle drop shadow */}
          <filter id="royalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#B45309" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* --- ROYAL SPANISH CROWN (Real Madrid Corona Real) --- */}
        <g id="crown" filter="url(#royalGlow)">
          {/* Crown Base Band with rubies & emeralds */}
          <path
            d="M32 23 C40 21, 60 21, 68 23 L67 27 C59 25.5, 41 25.5, 33 27 Z"
            fill="url(#rmGold)"
            stroke="#78350F"
            strokeWidth="0.8"
          />
          {/* Jewels on Crown Band */}
          <circle cx="37" cy="24.8" r="1.2" fill="#DC2626" />
          <circle cx="43" cy="24.3" r="1.3" fill="#16A34A" />
          <circle cx="50" cy="24.1" r="1.4" fill="#DC2626" />
          <circle cx="57" cy="24.3" r="1.3" fill="#16A34A" />
          <circle cx="63" cy="24.8" r="1.2" fill="#DC2626" />

          {/* Crown Arch Ribs & Velvet Interior */}
          <path
            d="M33 23 C31 16, 40 13, 50 14 C60 13, 69 16, 67 23 Z"
            fill="#991B1B"
            opacity="0.85"
          />

          {/* Golden Arches */}
          <path
            d="M33 23 C34 16, 43 14, 50 14"
            fill="none"
            stroke="url(#rmGold)"
            strokeWidth="1.6"
          />
          <path
            d="M67 23 C66 16, 57 14, 50 14"
            fill="none"
            stroke="url(#rmGold)"
            strokeWidth="1.6"
          />
          <path
            d="M50 23 L50 14"
            fill="none"
            stroke="url(#rmGold)"
            strokeWidth="2"
          />

          {/* 5 Leaf Points */}
          <circle cx="33" cy="18" r="2" fill="url(#rmGold)" stroke="#78350F" strokeWidth="0.6" />
          <circle cx="41" cy="14" r="2.2" fill="url(#rmGold)" stroke="#78350F" strokeWidth="0.6" />
          <circle cx="50" cy="12.5" r="2.5" fill="url(#rmGold)" stroke="#78350F" strokeWidth="0.6" />
          <circle cx="59" cy="14" r="2.2" fill="url(#rmGold)" stroke="#78350F" strokeWidth="0.6" />
          <circle cx="67" cy="18" r="2" fill="url(#rmGold)" stroke="#78350F" strokeWidth="0.6" />

          {/* Crown Orb & Cross Top */}
          <circle cx="50" cy="8.5" r="2.2" fill="url(#rmGold)" stroke="#78350F" strokeWidth="0.6" />
          <path
            d="M50 4.5 L50 7.5 M48.5 6 L51.5 6"
            stroke="url(#rmGold)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>

        {/* --- MAIN ROUNDEL SEAL (Real Madrid Circular Badge) --- */}
        {/* Outer Gold Ring */}
        <circle
          cx="50"
          cy="58"
          r="36"
          fill="url(#rmGold)"
          stroke="#78350F"
          strokeWidth="1.2"
        />

        {/* Navy Ring Trim */}
        <circle
          cx="50"
          cy="58"
          r="33"
          fill="url(#rmNavy)"
        />

        {/* Inner Gold Inset Ring */}
        <circle
          cx="50"
          cy="58"
          r="31"
          fill="none"
          stroke="url(#rmGold)"
          strokeWidth="1.2"
        />

        {/* Pure White Central Field */}
        <circle
          cx="50"
          cy="58"
          r="29.5"
          fill="url(#rmWhite)"
        />

        {/* Clip path for the diagonal sash and monogram within the circle */}
        <g clipPath="url(#crestCircleClip)">
          {/* Iconic Diagonal Purple Sash (Banda Morada de Castilla) */}
          <path
            d="M20 37 L78 86 L68 96 L12 47 Z"
            fill="url(#rmPurple)"
            opacity="0.95"
          />
          {/* Subtle gold pinstripe along sash */}
          <line x1="20" y1="37" x2="78" y2="86" stroke="url(#rmGold)" strokeWidth="1" opacity="0.8" />
          <line x1="12" y1="47" x2="68" y2="96" stroke="url(#rmGold)" strokeWidth="1" opacity="0.8" />

          {/* Central Stylized Football with Gold Hexagons */}
          <circle cx="50" cy="58" r="14" fill="#FFFFFF" stroke="#001A49" strokeWidth="2" />
          {/* Pentagons */}
          <polygon points="50,51 55,55 53,62 47,62 45,55" fill="#001A49" />
          <line x1="50" y1="51" x2="50" y2="44" stroke="#001A49" strokeWidth="1.5" />
          <line x1="55" y1="55" x2="62" y2="53" stroke="#001A49" strokeWidth="1.5" />
          <line x1="53" y1="62" x2="58" y2="69" stroke="#001A49" strokeWidth="1.5" />
          <line x1="47" y1="62" x2="42" y2="69" stroke="#001A49" strokeWidth="1.5" />
          <line x1="45" y1="55" x2="38" y2="53" stroke="#001A49" strokeWidth="1.5" />

          {/* Small Gold Star inside ball */}
          <polygon points="50,54 51.5,57 54.5,57 52,59 53,62 50,60 47,62 48,59 45.5,57 48.5,57" fill="url(#rmGold)" />
        </g>

        {/* Clipping mask definition */}
        <clipPath id="crestCircleClip">
          <circle cx="50" cy="58" r="29.5" />
        </clipPath>

        {/* 15 European Cups Laurels (La Decimoquinta honor mark) */}
        <g opacity="0.9">
          <path
            d="M18 56 C16 66, 22 78, 30 84"
            fill="none"
            stroke="url(#rmGold)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M82 56 C84 66, 78 78, 70 84"
            fill="none"
            stroke="url(#rmGold)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* 15 Stars Milestone Badge at bottom */}
        <rect x="42" y="87" width="16" height="8" rx="4" fill="#001A49" stroke="url(#rmGold)" strokeWidth="1" />
        <text x="50" y="93" fill="#FDE68A" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          15★
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-900 tracking-tight leading-tight text-lg">
              REAL MADRID
            </span>
            <span className="bg-[#001A49] text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase border border-amber-400/40">
              C.F.
            </span>
          </div>
          <span className="text-xs font-bold tracking-widest text-[#702082] uppercase flex items-center gap-1">
            <span>Phonics Academy</span>
            <span className="text-amber-500">·</span>
            <span className="text-amber-600 font-extrabold">La Fábrica</span>
          </span>
        </div>
      )}
    </div>
  );
};
