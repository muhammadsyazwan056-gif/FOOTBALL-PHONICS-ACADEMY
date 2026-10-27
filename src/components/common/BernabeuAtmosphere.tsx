import React from 'react';

interface BernabeuAtmosphereProps {
  variant?: 'banner' | 'card' | 'subtle';
  className?: string;
}

export const BernabeuAtmosphere: React.FC<BernabeuAtmosphereProps> = ({
  variant = 'card',
  className = '',
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Stadium Floodlights Left & Right */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      <div className="absolute -top-12 -right-12 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 rounded-full blur-3xl" />

      {/* Bernabéu Stadium Roof & Grandstand Silhouette */}
      <svg
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-15"
      >
        <defs>
          <linearGradient id="stadiumRays" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#001A49" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="floodlightBeam" x1="100%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#001A49" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Diagonal Floodlight Beams from top corners onto the pitch */}
        <polygon points="40,0 220,0 600,400 350,400" fill="url(#stadiumRays)" />
        <polygon points="1160,0 980,0 600,400 850,400" fill="url(#floodlightBeam)" />

        {/* Santiago Bernabéu Metallic Roof Struts */}
        <path
          d="M0,80 Q300,30 600,25 Q900,30 1200,80"
          stroke="#FDE68A"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
        <path
          d="M0,110 Q300,60 600,55 Q900,60 1200,110"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Stadium Tier Seating Rings (Fondo Norte & Fondo Sur tiers) */}
        <path d="M50,160 Q600,110 1150,160" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M70,200 Q600,150 1130,200" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M100,240 Q600,190 1100,240" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.2" />

        {/* Stadium Floodlight Towers */}
        <g stroke="#FDE68A" strokeWidth="2">
          {/* Left Tower */}
          <line x1="80" y1="0" x2="80" y2="70" />
          <line x1="100" y1="0" x2="100" y2="70" />
          <circle cx="80" cy="15" r="5" fill="#FDE68A" />
          <circle cx="90" cy="10" r="5" fill="#FDE68A" />
          <circle cx="100" cy="15" r="5" fill="#FDE68A" />

          {/* Right Tower */}
          <line x1="1100" y1="0" x2="1100" y2="70" />
          <line x1="1120" y1="0" x2="1120" y2="70" />
          <circle cx="1100" cy="15" r="5" fill="#FDE68A" />
          <circle cx="1110" cy="10" r="5" fill="#FDE68A" />
          <circle cx="1120" cy="15" r="5" fill="#FDE68A" />
        </g>

        {/* Pitch Center Circle Horizon */}
        <ellipse cx="600" cy="380" rx="380" ry="120" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4" />
        <circle cx="600" cy="380" r="5" fill="#FFFFFF" />
      </svg>

      {/* Bernabéu Stadium Banner Strip */}
      {variant === 'card' && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#001A49]/90 via-[#001A49]/40 to-transparent py-2 px-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-amber-300/80 border-t border-amber-400/20">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Estadio Santiago Bernabéu · Madrid
          </span>
          <span className="hidden sm:inline text-white/70">
            ¡Hala Madrid y nada más!
          </span>
          <span className="text-amber-400 font-extrabold">
            15× Champions of Europe
          </span>
        </div>
      )}
    </div>
  );
};
