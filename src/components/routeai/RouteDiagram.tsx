
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finding';
import { TokenIcon } from './TokenIcon';
import { ArrowRight } from 'lucide-react';
import React from 'react';

interface RouteDiagramProps {
  title?: string; // New prop for custom title
  startToken: string;
  initialAmount: number;
  // Accept a subset of FindOptimalRouteOutput or a similar structure for flexibility
  routeData: Pick<FindOptimalRouteOutput, 'route' | 'estimatedOutput'> | null ;
}

export function RouteDiagram({ title = "Optimal Swap Route", startToken, initialAmount, routeData }: RouteDiagramProps) {
  const routeSteps = routeData?.route;

  return (
    // Removed Card component from here to apply it at a higher level if needed, or not at all
    <div className="shadow-xl overflow-hidden mt-8 bg-card rounded-lg">
      <div className="p-6"> 
        <h2 className="text-2xl font-headline text-center text-primary">{title}</h2>
      </div>
      <div className="px-2 py-4 md:px-4">
        {(!routeSteps || routeSteps.length === 0) ? (
          <p className="text-center text-muted-foreground py-4">
            No route found or still calculating.
          </p>
        ) : (
          <div
            className="flex flex-nowrap items-stretch justify-start gap-0 py-4 overflow-x-auto" // Reduced gap for tighter layout
            role="list"
            aria-label="Swap route steps"
          >
            {/* Initial Token Element */}
            <div
              className="flex flex-col items-center justify-center opacity-0 animate-route-step-enter"
              style={{ animationDelay: `0s` }}
              role="listitem"
            >
              <div className="flex flex-col items-center justify-center gap-1 p-3 md:p-4 min-w-[100px] md:min-w-[120px] h-full">
                <TokenIcon tokenSymbol={startToken} className="h-7 w-7 md:h-8 md:w-8" />
                <span className="text-sm md:text-base font-medium text-foreground truncate">{startToken}</span>
                <span className="text-xs text-muted-foreground">
                  {initialAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
            </div>

            {routeSteps.map((step, index) => (
              <React.Fragment key={`${step.dex}-${step.tokenOutSymbol}-${index}`}>
                {/* Connecting element: Arrow -> (DEX) -> Arrow */}
                <div
                  className="flex flex-col items-center justify-center text-sm text-muted-foreground opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 1) * 0.25}s` }}
                  role="listitem"
                >
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                </div>

                {/* DEX name */}
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
                  style={{ animationDelay: `${(index * 2 + 2) * 0.25}s` }} // Adjusted delay
                  role="listitem"
                >
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                  {/* Output amount below arrow - REMOVED */}
                </div>


                {/* Output Token Element from this step */}
                <div
                  className="flex flex-col items-center justify-center opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 2.5) * 0.25}s` }} // Adjusted delay
                  role="listitem"
                >
                  <div className="flex flex-col items-center justify-center gap-1 p-3 md:p-4 min-w-[100px] md:min-w-[120px] h-full">
                    <TokenIcon tokenSymbol={step.tokenOutSymbol} className="h-7 w-7 md:h-8 md:w-8" />
                    <span className="text-sm md:text-base font-medium text-foreground truncate">{step.tokenOutSymbol}</span>
                    {/* Amount here is the output of this step, which is also input for next, so it might be redundant if shown on arrows */}
                     {/* <span className="text-xs text-muted-foreground">
                      {step.amountOut.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span> */}
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
