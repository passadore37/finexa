'use client';

import React from 'react';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Box do F */}
      <div className="w-9 h-9 bg-[#ff64ca] border-2 border-[#08080f] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(8,8,15,1)]">
        <span className="text-[#08080f] font-black text-xl">F</span>
      </div>
      
      {/* Texto Finexa */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-2xl tracking-tighter text-[#08080f] dark:text-white leading-[0.8]">
            FINEXA
          </span>
          <div className="h-0.5 w-full bg-[#5330ff] mt-0.5" />
        </div>
      )}
    </div>
  );
}
