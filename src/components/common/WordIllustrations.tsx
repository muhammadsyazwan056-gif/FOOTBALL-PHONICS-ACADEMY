import React from 'react';

interface IllustrationProps {
  name: string;
  className?: string;
  size?: number;
}

export const WordIllustration: React.FC<IllustrationProps> = ({ name, className = '', size = 120 }) => {
  const s = size;

  switch (name.toLowerCase()) {
    case 'cat':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Cat illustration">
          <circle cx="50" cy="56" r="30" fill="#FDBA74" stroke="#EA580C" strokeWidth="3" />
          {/* Ears */}
          <polygon points="26,36 34,16 44,30" fill="#FDBA74" stroke="#EA580C" strokeWidth="2.5" />
          <polygon points="30,32 35,20 41,28" fill="#F472B6" />
          <polygon points="74,36 66,16 56,30" fill="#FDBA74" stroke="#EA580C" strokeWidth="2.5" />
          <polygon points="70,32 65,20 59,28" fill="#F472B6" />
          {/* Eyes */}
          <ellipse cx="38" cy="52" rx="4" ry="5.5" fill="#0F172A" />
          <circle cx="39.5" cy="50" r="1.5" fill="#FFFFFF" />
          <ellipse cx="62" cy="52" rx="4" ry="5.5" fill="#0F172A" />
          <circle cx="63.5" cy="50" r="1.5" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <polygon points="50,60 46,56 54,56" fill="#F43F5E" />
          <path d="M46 62 Q50 67 54 62" stroke="#0F172A" strokeWidth="2" fill="none" />
          {/* Whiskers */}
          <line x1="20" y1="56" x2="36" y2="58" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="64" x2="36" y2="62" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          <line x1="80" y1="56" x2="64" y2="58" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          <line x1="80" y1="64" x2="64" y2="62" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'sun':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Sun illustration">
          {/* Rays */}
          <g stroke="#F59E0B" strokeWidth="4" strokeLinecap="round">
            <line x1="50" y1="10" x2="50" y2="20" />
            <line x1="50" y1="80" x2="50" y2="90" />
            <line x1="10" y1="50" x2="20" y2="50" />
            <line x1="80" y1="50" x2="90" y2="50" />
            <line x1="22" y1="22" x2="29" y2="29" />
            <line x1="71" y1="71" x2="78" y2="78" />
            <line x1="22" y1="78" x2="29" y2="71" />
            <line x1="71" y1="29" x2="78" y2="22" />
          </g>
          {/* Main Disc */}
          <circle cx="50" cy="50" r="26" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" />
          {/* Happy Face */}
          <circle cx="41" cy="46" r="3" fill="#1E293B" />
          <circle cx="59" cy="46" r="3" fill="#1E293B" />
          <path d="M40 56 Q50 66 60 56" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <circle cx="34" cy="54" r="3.5" fill="#FCA5A5" opacity="0.7" />
          <circle cx="66" cy="54" r="3.5" fill="#FCA5A5" opacity="0.7" />
        </svg>
      );

    case 'cup':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Cup illustration">
          {/* Handles */}
          <path d="M28 34 C12 34 12 56 28 58" stroke="#CA8A04" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M72 34 C88 34 88 56 72 58" stroke="#CA8A04" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Cup Body */}
          <path d="M26 24 L74 24 L68 62 C66 72 34 72 32 62 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
          {/* Stem & Base */}
          <rect x="46" y="68" width="8" height="14" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
          <rect x="34" y="82" width="32" height="8" rx="2" fill="#CA8A04" stroke="#A16207" strokeWidth="2" />
          {/* Star on Cup */}
          <polygon points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43" fill="#FFFFFF" />
        </svg>
      );

    case 'bed':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Bed illustration">
          {/* Headboard */}
          <rect x="14" y="32" width="8" height="48" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* Footboard */}
          <rect x="78" y="48" width="8" height="32" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* Mattress & Blanket */}
          <rect x="22" y="52" width="56" height="18" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
          {/* Pillow */}
          <rect x="24" y="44" width="16" height="10" rx="3" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          {/* Gold Academy Stripe on Quilt */}
          <rect x="52" y="52" width="6" height="18" fill="#FACC15" />
        </svg>
      );

    case 'mat':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Mat illustration">
          {/* Mat perspective polygon */}
          <polygon points="14,64 30,36 84,36 70,64" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
          {/* Stripes */}
          <line x1="20" y1="54" x2="74" y2="54" stroke="#FACC15" strokeWidth="3" strokeDasharray="6 4" />
          <line x1="25" y1="45" x2="79" y2="45" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Fringes */}
          <line x1="12" y1="66" x2="16" y2="66" stroke="#0284C7" strokeWidth="3" />
          <line x1="68" y1="66" x2="72" y2="66" stroke="#0284C7" strokeWidth="3" />
        </svg>
      );

    case 'hen':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Hen illustration">
          {/* Body */}
          <ellipse cx="52" cy="58" rx="24" ry="18" fill="#FEF08A" stroke="#EAB308" strokeWidth="3" />
          {/* Head */}
          <circle cx="36" cy="42" r="12" fill="#FEF08A" stroke="#EAB308" strokeWidth="2.5" />
          {/* Comb & Wattle */}
          <path d="M30 32 Q36 24 42 32" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="33" cy="50" r="3" fill="#EF4444" />
          {/* Eye & Beak */}
          <circle cx="33" cy="40" r="2.5" fill="#0F172A" />
          <polygon points="26,42 20,45 26,48" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
          {/* Legs */}
          <line x1="46" y1="76" x2="44" y2="86" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="58" y1="76" x2="56" y2="86" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'pin':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Pin illustration">
          {/* Safety pin body */}
          <path d="M34 26 L66 26 C76 26 80 40 72 48 L32 76" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M30 76 L74 76" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          {/* Pin head clasp */}
          <rect x="22" y="20" width="18" height="12" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          <circle cx="31" cy="76" r="4" fill="#64748B" />
        </svg>
      );

    case 'map':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Map illustration">
          <polygon points="18,24 40,16 62,24 82,16 82,76 62,84 40,76 18,84" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
          <line x1="40" y1="16" x2="40" y2="76" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="62" y1="24" x2="62" y2="84" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" />
          {/* Red X marks the spot */}
          <line x1="48" y1="44" x2="56" y2="52" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="56" y1="44" x2="48" y2="52" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'dog':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Dog illustration">
          <circle cx="50" cy="54" r="28" fill="#FDBA74" stroke="#C2410C" strokeWidth="3" />
          {/* Droopy Ears */}
          <ellipse cx="26" cy="46" rx="8" ry="16" fill="#C2410C" />
          <ellipse cx="74" cy="46" rx="8" ry="16" fill="#C2410C" />
          {/* Eyes */}
          <circle cx="42" cy="48" r="3.5" fill="#0F172A" />
          <circle cx="58" cy="48" r="3.5" fill="#0F172A" />
          {/* Big Black Nose */}
          <ellipse cx="50" cy="58" rx="6" ry="4.5" fill="#0F172A" />
          <path d="M50 63 Q46 68 42 66" stroke="#0F172A" strokeWidth="2" fill="none" />
          <path d="M50 63 Q54 68 58 66" stroke="#0F172A" strokeWidth="2" fill="none" />
          {/* Tongue */}
          <path d="M48 67 C48 74 52 74 52 67 Z" fill="#F43F5E" />
        </svg>
      );

    default:
      // Generic football academy card icon
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={className} aria-label="Phonics illustration">
          <rect x="18" y="18" width="64" height="64" rx="12" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="3" />
          <circle cx="50" cy="50" r="18" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          <text x="50" y="57" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1E3A8A">
            {name.charAt(0).toUpperCase()}
          </text>
        </svg>
      );
  }
};
