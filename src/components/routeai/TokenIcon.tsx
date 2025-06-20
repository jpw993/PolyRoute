
import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { SVGProps } from 'react';

interface TokenIconProps extends SVGProps<SVGSVGElement> {
  tokenSymbol: string;
  className?: string;
}

const Svgs: Record<string, React.FC<SVGProps<SVGSVGElement>>> = {
  POL: (props) => (
    <svg viewBox="0 0 100 100" {...props}>
      <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#8247E5"/>
    </svg>
  ),
  USDC: (props) => (
    <svg viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="45" fill="#2775CA"/>
      <path d="M65 25 C45 25 35 38 35 50 C35 62 45 75 65 75 L65 62 C50 62 45 56 45 50 C45 44 50 38 65 38 Z" fill="white"/>
    </svg>
  ),
  DAI: (props) => (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="#F5AC37"/>
    </svg>
  ),
  WETH: (props) => (
    <svg viewBox="0 0 64 64" {...props}>
      <path fill="#8C8C8C" d="M32 2l18.375 30.469L32 42.25L13.625 32.469L32 2z"/>
      <path fill="#6E6E6E" d="M32 45.5l18.375-9.781L32 62l-18.375-26.281L32 45.5z"/>
    </svg>
  ),
  WBTC: (props) => (
    <svg viewBox="0 0 32 32" {...props}>
      <circle cx="16" cy="16" r="15" fill="#F7931A"/>
      <path d="M12 8 H17.5 C20.53756610039547 8 22 9.462433899604527 22 12.5 C22 15.53756610039547 20.53756610039547 17 17.5 17 H12 V8 Z M12 17 H18.5 C21.53756610039547 17 23 18.462433899604527 23 21.5 C23 24.53756610039547 21.53756610039547 26 18.5 26 H12 V17 Z" fill="white"/>
    </svg>
  ),
  USDT: (props) => (
    <svg viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="45" fill="#26A17B"/>
      <path d="M30 30 H70 V40 H55 V70 H45 V40 H30 Z" fill="white"/>
    </svg>
  ),
  LINK: (props) => (
    <svg viewBox="0 0 100 100" {...props}>
      <rect x="15" y="35" width="35" height="30" rx="10" fill="none" stroke="#2A5ADA" strokeWidth="10"/>
      <rect x="50" y="35" width="35" height="30" rx="10" fill="none" stroke="#2A5ADA" strokeWidth="10"/>
    </svg>
  ),
  AAVE: (props) => (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="M50 10 L10 90 H30 L40 65 H60 L70 90 H90 Z M45 55 L50 30 L55 55 Z" fill="#B6509E"/>
    </svg>
  ),
   // Add other token SVGs here as needed
};

export function TokenIcon({ tokenSymbol, className, ...props }: TokenIconProps) {
  const upperTokenSymbol = tokenSymbol?.toUpperCase();
  const IconComponent = Svgs[upperTokenSymbol] || HelpCircle;
  
  // If it's a Lucide icon (HelpCircle), it expects size, color, etc.
  // If it's our SVG, it just takes className and other SVG attributes.
  // We pass className to both. Lucide handles it, our SVGs will use it.
  // Other props (like width/height if directly set, or fill/stroke) are passed too.
  if (IconComponent === HelpCircle) {
    return <IconComponent className={className} {...props} aria-label={`${upperTokenSymbol || 'Unknown'} token icon`} />;
  }
  
  return <IconComponent className={className} {...props} aria-label={`${upperTokenSymbol || 'Unknown'} token icon`} />;
}
