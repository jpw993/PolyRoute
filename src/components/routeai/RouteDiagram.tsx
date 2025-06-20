
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finding';
import { RouteStep } from './RouteStep';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteDiagramProps {
  startToken: string;
  routeData: FindOptimalRouteOutput['route'] | null;
}

export function RouteDiagram({ startToken, routeData }: RouteDiagramProps) {
  // Card will now always render, showing a message if routeData is empty.
  return (
    <Card className="shadow-xl overflow-hidden mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary">Optimal Swap Route</CardTitle>
      </CardHeader>
      <CardContent>
        {(!routeData || routeData.length === 0) ? (
          <p className="text-center text-muted-foreground py-4">
            No optimal route found, or the route is still being calculated.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0 py-4 overflow-x-auto" role="list" aria-label="Swap route steps">
            <RouteStep 
              token={startToken} 
              isFirst 
              animationDelay="0s" 
              data-ai-hint={`${startToken.toLowerCase()} crypto`} 
              role="listitem"
            />
            {routeData.map((step, index) => (
              <RouteStep
                key={`${step.dex}-${step.token}-${index}`}
                token={step.token}
                dex={step.dex}
                animationDelay={`${(index + 1) * 0.2}s`}
                data-ai-hint={`${step.token.toLowerCase()} crypto`}
                role="listitem"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
