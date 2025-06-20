
import { Coins, Bitcoin, CircleDollarSign, HelpCircle, LinkIcon, CheckSquare } from 'lucide-react'; // AAVE doesn't have a direct match, using CheckSquare as placeholder
import type { LucideProps } from 'lucide-react';

interface TokenIconProps extends LucideProps {
  tokenSymbol: string;
}

// Simple mapping for common tokens - extend as needed
const tokenIconMap: Record<string, React.ElementType<LucideProps>> = {
  'BTC': Bitcoin,
  'ETH': Coins, 
  'POL': Coins, // Polygon's native token
  'USDC': CircleDollarSign,
  'DAI': CircleDollarSign,
  'WETH': Coins, // Wrapped Ether often uses generic or ETH-like icon
  'WBTC': Bitcoin, // Wrapped Bitcoin uses Bitcoin icon
  'USDT': CircleDollarSign, // Tether is a stablecoin
  'LINK': LinkIcon, // Chainlink
  'AAVE': CheckSquare, // Aave - Using CheckSquare as a placeholder as no direct icon for Aave
};

export function TokenIcon({ tokenSymbol, className, ...props }: TokenIconProps) {
  const upperTokenSymbol = tokenSymbol?.toUpperCase();
  const IconComponent = tokenIconMap[upperTokenSymbol] || HelpCircle;
  
  return <IconComponent className={className} {...props} aria-label={`${upperTokenSymbol} token icon`} />;
}
