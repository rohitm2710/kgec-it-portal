import React from 'react';
import kgecLogoWhite from '../assets/logo.png';
import kgecLogoBlack from '../assets/KGEC-Kalyani-Logo.png';

export function KGECLogo({ 
  size = "md", 
  light = false, 
  variant = null, // 'black' | 'white' | null (auto based on light)
  showText = true, 
  textBelow = false, 
  className = "" 
}) {
  // Size presets
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
    xl: "w-20 h-20 sm:w-24 sm:h-24"
  };

  const imgDimension = sizeMap[size] || "w-10 h-10";

  // Determine which logo variant to use
  const isBlack = variant === 'black' || (variant === null && light);
  const logoSrc = isBlack ? kgecLogoBlack : kgecLogoWhite;

  return (
    <div className={`flex ${textBelow ? 'flex-col items-center text-center' : 'items-center gap-3'} ${className}`}>
      {/* Official KGEC Emblem */}
      <div 
        className={`relative ${imgDimension} shrink-0 flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-200 ${
          light 
            ? 'bg-white p-1.5 border border-slate-200/90 shadow-sm' 
            : 'bg-white/10 p-1.5 border border-white/20 shadow-xs backdrop-blur-xs'
        }`}
      >
        <img
          src={logoSrc}
          alt="Kalyani Government Engineering College Official Emblem"
          className="w-full h-full object-contain select-none"
        />
      </div>

      {showText && (
        <div className={textBelow ? 'mt-2' : ''}>
          <div className={`font-black tracking-tight leading-none ${light ? 'text-slate-900' : 'text-white'} ${size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-lg'}`}>
            KGEC
          </div>
          <div className={`text-xs font-semibold tracking-wide ${light ? 'text-slate-600' : 'text-slate-300'} mt-0.5`}>
            IT Department
          </div>
        </div>
      )}
    </div>
  );
}

export default KGECLogo;
