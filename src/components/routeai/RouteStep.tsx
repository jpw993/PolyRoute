
import { ArrowRight } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { Card } from '@/components/ui/card';

interface RouteStepProps {
  isFirst?: boolean;
  isLast?: boolean;
  fromToken?: string; // Optional: only for the very first element if displayed differently
  token: string;
  dex?: string; // Optional: not present for the very first token
  animationDelay: string;
  'data-ai-hint'?: string;
}

export function RouteStep({ isFirst = false, token, dex, animationDelay, 'data-ai-hint': aiHint }: RouteStepProps) {
  return (
    <div
      className="flex items-center opacity-0 animate-route-step-enter" // Use Tailwind animation class
      style={{ animationDelay }} // animation-duration and fill-mode are in tailwind.config.ts
      data-testid={`route-step-${token}`}
    >
      {!isFirst && dex && (
        <>
          <ArrowRight className="h-6 w-6 text-muted-foreground mx-2 md:mx-4 shrink-0" />
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-muted-foreground">{dex}</span>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground mx-2 md:mx-4 shrink-0" />
        </>
      )}
      <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px]" data-ai-hint={aiHint || token.toLowerCase()}>
        <TokenIcon tokenSymbol={token} className="h-7 w-7 md:h-8 md:w-8 text-primary" />
        <span className="text-sm md:text-base font-medium text-foreground truncate">{token}</span>
      </Card>
    </div>
  );
}

// Keyframes and animation utility 'animate-route-step-enter' are defined in tailwind.config.ts
// @keyframes route-step-enter {
//   '0%': { opacity: '0', transform: 'translateY(10px)' },
//   '100%': { opacity: '1', transform: 'translateY(0)' },
// }
// animation: {
//   'route-step-enter': 'route-step-enter 0.5s ease-out forwards',
// }
