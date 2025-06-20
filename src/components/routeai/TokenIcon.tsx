import { Coins, Bitcoin, CircleDollarSign, HelpCircle } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface TokenIconProps extends LucideProps {
  tokenSymbol: string;
}

// Simple mapping for common tokens - extend as needed
const tokenIconMap: Record<string, React.ElementType<LucideProps>> = {
  'BTC': Bitcoin,
  'ETH': Coins, // Using Coins as a generic crypto icon, as Ethereum icon is not in lucide
  'MATIC': Coins, 
  'USDC': CircleDollarSign,
  'DAI': CircleDollarSign,
  'POL': Coins, 
};

export function TokenIcon({ tokenSymbol, className, ...props }: TokenIconProps) {
  const IconComponent = tokenIconMap[tokenSymbol.toUpperCase()] || HelpCircle;
  
  return <IconComponent className={className} {...props} aria-label={`${tokenSymbol} token icon`} />;
}
