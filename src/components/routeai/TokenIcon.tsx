
import React from 'react';
import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import type { SVGProps } from 'react';

interface TokenIconProps {
  tokenSymbol: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

interface TokenInfo {
  altText: string;
  src: string;
}

const tokenImageMap: Record<string, TokenInfo> = {
  POL: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png', altText: 'POL token icon' },
  USDC: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png', altText: 'USDC token icon' },
  DAI: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png', altText: 'DAI token icon' },
  WETH: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png', altText: 'WETH token icon' },
  WBTC: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png', altText: 'WBTC token icon' },
  USDT: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png', altText: 'USDT token icon' },
  LINK: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png', altText: 'LINK token icon' },
  AAVE: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png', altText: 'AAVE token icon' },
  UNI: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png', altText: 'UNI token icon' },
  CRV: { src: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png', altText: 'CRV token icon' },
};

export function TokenIcon({ tokenSymbol, className, width = 32, height = 32, ...props }: TokenIconProps) {
  const upperTokenSymbol = tokenSymbol?.toUpperCase();
  const tokenInfo = upperTokenSymbol ? tokenImageMap[upperTokenSymbol] : undefined;

  if (tokenInfo) {
    return (
      <Image
        src={tokenInfo.src}
        alt={tokenInfo.altText}
        width={typeof width === 'number' ? width : 32}
        height={typeof height === 'number' ? height : 32}
        className={className}
        unoptimized={true} // Required for some external image providers or SVGs if not using a loader
        {...props}
      />
    );
  }

  const iconSize = typeof width === 'number' ? width : (typeof height === 'number' ? height : 24);
  return <HelpCircle className={className} size={iconSize} aria-label={`${upperTokenSymbol || 'Unknown'} token icon`} />;
}
