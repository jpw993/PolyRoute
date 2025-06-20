
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finding';
import { TokenIcon } from './TokenIcon';
import { ArrowRight } from 'lucide-react';
import React from 'react';

interface RouteDiagramProps {
  title?: string; 
  startToken: string;
  initialAmount: number;
  routeData: Pick<FindOptimalRouteOutput, 'route' | 'estimatedOutput'> | null ;
}

export function RouteDiagram({ title = "Optimal Swap Route", startToken, initialAmount, routeData }: RouteDiagramProps) {
  const routeSteps = routeData?.route;

  return (
    <div className="shadow-xl overflow-hidden bg-card rounded-lg">
      <div className="px-6 py-4"> 
        <h2 className="text-2xl font-headline text-center text-primary">{title}</h2>
      </div>
      <div className="px-2 py-4 md:px-4">
        {(!routeSteps || routeSteps.length === 0) ? (
          <p className="text-center text-muted-foreground">
            No route found or still calculating.
          </p>
        ) : (
          <div
            className="flex flex-nowrap items-stretch justify-start gap-0 overflow-x-auto"
            role="list"
            aria-label="Swap route steps"
          >
            <div
              className="flex flex-col items-center justify-center opacity-0 animate-route-step-enter"
              style={{ animationDelay: `0s` }}
              role="listitem"
            >
              <div className="flex flex-col items-center justify-center gap-1 p-3 md:p-4 min-w-[100px] md:min-w-[120px] h-full">
                <TokenIcon tokenSymbol={startToken} className="h-7 w-7 md:h-8 md:w-8" />
                <span className="text-sm md:text-base font-medium text-foreground truncate">{startToken}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {initialAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
            </div>

            {routeSteps.map((step, index) => (
              <React.Fragment key={`${step.dex}-${step.tokenOutSymbol}-${index}`}>
                <div
                  className="flex flex-col items-center justify-center text-sm text-muted-foreground opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 1) * 0.25}s` }}
                  role="listitem"
                >
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                </div>

                <div 
                    className="flex items-center justify-center opacity-0 animate-route-step-enter mx-2"
                    style={{ animationDelay: `${(index * 2 + 1.5) * 0.25}s` }}
                    role="listitem"
                >
                    <div className="p-2 bg-secondary/20 border border-border rounded-md shadow-sm min-w-[80px] md:min-w-[100px] text-center">
                        <span className="font-semibold text-xs text-primary">{step.dex}</span>
                    </div>
                </div>
                
                <div
                  className="flex flex-col items-center justify-center text-sm text-muted-foreground opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 2) * 0.25}s` }} 
                  role="listitem"
                >
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                </div>

                <div
                  className="flex flex-col items-center justify-center opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 2.5) * 0.25}s` }} 
                  role="listitem"
                >
                  <div className="flex flex-col items-center justify-center gap-1 p-3 md:p-4 min-w-[100px] md:min-w-[120px] h-full">
                    <TokenIcon tokenSymbol={step.tokenOutSymbol} className="h-7 w-7 md:h-8 md:w-8" />
                    <span className="text-sm md:text-base font-medium text-foreground truncate">{step.tokenOutSymbol}</span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {step.amountOut.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
