import React from 'react';

const Logo = ({ className = "h-8 w-auto", withText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="size-10 shadow-lg shadow-orange-500/10 rounded-xl"
        >
            {/* Defs for Gradients and Glows */}
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="100%" stopColor="#FFB800" />
                </linearGradient>
                <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                </filter>
            </defs>
            
            {/* Background container (Subtle Glass) */}
            <rect x="0" y="0" width="40" height="40" rx="10" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.05" />

            {/* The Main Shape: Stylized 'M' fusing into a Chart */}
            <path 
                d="M10 26 L16 16 L22 24 L30 10" 
                stroke="url(#logo-gradient)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]"
            />

            {/* Area under the curve (Glassy Fill) */}
            <path 
                d="M10 26 L16 16 L22 24 L30 10 V32 H10 V26 Z" 
                fill="url(#logo-gradient)" 
                fillOpacity="0.15" 
            />

            {/* Rising Particle Animation */}
            <circle cx="30" cy="10" r="3" fill="#FFE500">
                <animate 
                    attributeName="r" 
                    values="2;4;2" 
                    dur="2s" 
                    repeatCount="indefinite" 
                />
                <animate 
                    attributeName="opacity" 
                    values="0.6;1;0.6" 
                    dur="2s" 
                    repeatCount="indefinite" 
                />
            </circle>
        </svg>
      </div>
      
      {withText && (
        <div className="flex flex-col justify-center -space-y-0.5">
          <span className="font-bold text-2xl tracking-tight leading-none text-white">
            Mon<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">vix</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
