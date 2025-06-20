
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finding';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TokenIcon } from './TokenIcon';
import { ArrowRight } from 'lucide-react';
import React from 'react';

interface RouteDiagramProps {
  startToken: string;
  initialAmount: number;
  routeData: FindOptimalRouteOutput | null;
}

export function RouteDiagram({ startToken, initialAmount, routeData }: RouteDiagramProps) {
  return (
    <Card className="shadow-xl overflow-hidden mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary">Optimal Swap Route</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-4 md:px-4">
        {(!routeData || !routeData.route || routeData.route.length === 0) ? (
          <p className="text-center text-muted-foreground py-4">
            No optimal route found, or the route is still being calculated.
          </p>
        ) : (
          <div
            className="flex flex-nowrap items-stretch justify-start gap-2 py-4 overflow-x-auto"
            role="list"
            aria-label="Swap route steps"
          >
            {/* Initial Token Element */}
            <div
              className="flex flex-col items-center justify-center opacity-0 animate-route-step-enter"
              style={{ animationDelay: `0s` }}
              role="listitem"
            >
              <div className="flex flex-col items-center justify-center gap-1 p-3 md:p-4 min-w-[100px] md:min-w-[120px] h-full" data-ai-hint={`${startToken.toLowerCase()} crypto token`}>
                <TokenIcon tokenSymbol={startToken} className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                <span className="text-sm md:text-base font-medium text-foreground truncate">{startToken}</span>
                <span className="text-xs text-muted-foreground">
                  {initialAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
            </div>

            {routeData.route.map((step, index) => (
              <React.Fragment key={`${step.dex}-${step.tokenOutSymbol}-${index}`}>
                {/* Connecting element: Arrow -> (DEX) -> Arrow */}
                <div
                  className="flex items-center justify-center text-sm text-muted-foreground opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 1) * 0.25}s` }}
                  role="listitem"
                >
                  <ArrowRight className="h-5 w-5 mx-1 md:mx-2 shrink-0 text-primary" /> {/* Leading arrow */}

                  {/* DEX name */}
                  <div className="flex flex-col items-center text-center mx-1 md:mx-2">
                    <div className="p-2 bg-card border border-border rounded-md shadow-sm min-w-[100px]">
                      <span className="font-semibold text-xs text-primary">{step.dex}</span>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 mx-1 md:mx-2 shrink-0 text-primary" /> {/* Trailing arrow */}
                </div>

                {/* Output Token Element from this step */}
                <div
                  className="flex flex-col items-center justify-center opacity-0 animate-route-step-enter"
                  style={{ animationDelay: `${(index * 2 + 2) * 0.25}s` }}
                  role="listitem"
                >
                  <div className="flex flex-col items-center justify-center gap-1 p-3 md:p-4 min-w-[100px] md:min-w-[120px] h-full" data-ai-hint={`${step.tokenOutSymbol.toLowerCase()} crypto token`}>
                    <TokenIcon tokenSymbol={step.tokenOutSymbol} className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                    <span className="text-sm md:text-base font-medium text-foreground truncate">{step.tokenOutSymbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {step.amountOut.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

