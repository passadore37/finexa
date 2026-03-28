'use client';

import React from 'react';
import Link from 'next/link';

export const NeobrutalistCard = ({
  children,
  borderColor = 'border-[#08080f] dark:border-white',
  bgColor = 'bg-white dark:bg-[#111118]',
  className = '',
}: {
  children: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
  className?: string;
}) => (
  <div
    className={`border-2 shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(8,8,15,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 ${borderColor} ${bgColor} ${className}`}
  >
    {children}
  </div>
);

export const NeobrutalistButton = ({
  children,
  bgColor = 'bg-[#5330ff]',
  textColor = 'text-white',
  className = '',
  onClick,
  href,
}: {
  children: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  className?: string;
  onClick?: () => void;
  href?: string;
}) => {
  const cls = `border-2 border-[#08080f] dark:border-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(8,8,15,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 ${bgColor} ${textColor} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
};
