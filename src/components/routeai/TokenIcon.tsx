
import React from 'react';
import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import type { SVGProps } from 'react'; // Keep for Lucide fallback props

interface TokenIconProps {
  tokenSymbol: string;
  className?: string;
  // SVGProps are less relevant now for the primary icons, but good for fallback
  // and to maintain a similar interface for potential direct SVG use elsewhere.
  width?: number | string;
  height?: number | string;
}

interface TokenInfo {
  hint: string; // For data-ai-hint
  altText: string;
}

const tokenImageMap: Record<string, TokenInfo> = {
  POL: { hint: 'polygon crypto', altText: 'POL token icon' },
  USDC: { hint: 'usdc coin', altText: 'USDC token icon' },
  DAI: { hint: 'dai stablecoin', altText: 'DAI token icon' },
  WETH: { hint: 'weth crypto', altText: 'WETH token icon' },
  WBTC: { hint: 'wbtc crypto', altText: 'WBTC token icon' },
  USDT: { hint: 'tether crypto', altText: 'USDT token icon' },
  LINK: { hint: 'chainlink crypto', altText: 'LINK token icon' },
  AAVE: { hint: 'aave crypto', altText: 'AAVE token icon' },
  UNI: { hint: 'uniswap crypto', altText: 'UNI token icon' },
  CRV: { hint: 'curve dao', altText: 'CRV token icon' },
};

export function TokenIcon({ tokenSymbol, className, width = 32, height = 32, ...props }: TokenIconProps) {
  const upperTokenSymbol = tokenSymbol?.toUpperCase();
  const tokenInfo = upperTokenSymbol ? tokenImageMap[upperTokenSymbol] : undefined;

  if (tokenInfo) {
    return (
      <Image
        src={`https://placehold.co/${typeof width === 'number' ? width : 32}x${typeof height === 'number' ? height : 32}.png`}
        alt={tokenInfo.altText}
        width={typeof width === 'number' ? width : 32}
        height={typeof height === 'number' ? height : 32}
        className={className}
        data-ai-hint={tokenInfo.hint}
        {...props}
      />
    );
  }

  // Fallback to Lucide HelpCircle icon if token is not in the map
  // Ensure Lucide props (like size if className doesn't cover it) are passed
  const iconSize = typeof width === 'number' ? width : (typeof height === 'number' ? height : 24);
  return <HelpCircle className={className} size={iconSize} aria-label={`${upperTokenSymbol || 'Unknown'} token icon`} />;
}

