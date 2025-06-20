
"use client";

import { useState } from 'react';
import { findOptimalRoute, type FindOptimalRouteInput, type FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finding';
import { RouteForm, type RouteFormValues } from '@/components/routeai/RouteForm';
import { RouteDiagram } from '@/components/routeai/RouteDiagram';
import { SimulationDialog } from '@/components/routeai/SimulationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, BarChart3, Info, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ClientPage() {
  const [routeResult, setRouteResult] = useState<FindOptimalRouteOutput | null>(null);
  const [currentStartToken, setCurrentStartToken] = useState<string>("");
  const [currentInputAmount, setCurrentInputAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (values: RouteFormValues) => {
    setIsLoading(true);
    setError(null);
    setRouteResult(null); 
    setCurrentStartToken(values.startToken.toUpperCase());
    setCurrentInputAmount(values.amount);

    try {
      const input: FindOptimalRouteInput = {
        startToken: values.startToken.toUpperCase(),
        endToken: values.endToken.toUpperCase(),
        amount: values.amount,
      };
      const result = await findOptimalRoute(input);
      setRouteResult(result);
    } catch (e) {
      console.error("Error finding optimal route:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to find optimal route: ${errorMessage}`);
      toast({
        title: "Error Finding Route",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimalRoute = routeResult?.route && routeResult.route.length > 0 && routeResult.estimatedOutput > 0 ? routeResult : null;
  const directRoute = routeResult?.directRoute && routeResult.directRoute.length > 0 && routeResult.directEstimatedOutput && routeResult.directEstimatedOutput > 0 ? {
    route: routeResult.directRoute,
    estimatedOutput: routeResult.directEstimatedOutput,
    gasEstimate: routeResult.directGasEstimate || 0, 
  } : null;

  let advantageAmount: number | null = null;
  let advantagePercentage: number | null = null;
  let endTokenSymbolForAdvantage: string | undefined;

  if (optimalRoute && directRoute && directRoute.estimatedOutput > 0 && optimalRoute.estimatedOutput > directRoute.estimatedOutput) {
    advantageAmount = optimalRoute.estimatedOutput - directRoute.estimatedOutput;
    advantagePercentage = (advantageAmount / directRoute.estimatedOutput) * 100;
    endTokenSymbolForAdvantage = optimalRoute.route[optimalRoute.route.length - 1]?.tokenOutSymbol;
  }


  return (
    <div className="space-y-8 md:space-y-12 py-8">
      <RouteForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      {error && (
         <Alert variant="destructive" className="max-w-2xl mx-auto">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {directRoute && (
         <div className="flex justify-center max-w-full mx-auto space-y-6">
          <RouteDiagram 
            title="Direct Route (1 DEX)"
            startToken={currentStartToken} 
            initialAmount={currentInputAmount}
            routeData={directRoute}
          />
        </div>
      )}

      {optimalRoute && (
        <div className={`max-w-full mx-auto space-y-6 ${directRoute ? 'mt-12' : ''}`}>
          <RouteDiagram 
            title="Optimal Swap Route (Multi-DEX)"
            startToken={currentStartToken} 
            initialAmount={currentInputAmount}
            routeData={optimalRoute} 
          />
          
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-center flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Optimal Route Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                <span className="font-medium text-muted-foreground">Final Estimated Output:</span>
                <span className="font-semibold text-primary">
                  {optimalRoute.estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                  {optimalRoute.route[optimalRoute.route.length - 1]?.tokenOutSymbol} 
                </span>
              </div>

              {advantageAmount !== null && advantagePercentage !== null && endTokenSymbolForAdvantage && advantageAmount > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <span className="font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    Advantage vs Direct:
                  </span>
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    +{advantageAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {endTokenSymbolForAdvantage}
                    {' '}(+{advantagePercentage.toFixed(2)}%)
                  </span>
                </div>
              )}

              <div className="pt-4 text-center">
                <Button 
                  onClick={() => setIsSimulationOpen(true)} 
                  size="lg" 
                  className="shadow-md hover:shadow-lg transition-shadow"
                  variant="outline"
                >
                  <Info className="mr-2 h-5 w-5" />
                  View Transaction Simulation (Optimal)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {optimalRoute && isSimulationOpen && (
        <SimulationDialog
          isOpen={isSimulationOpen}
          onOpenChange={setIsSimulationOpen}
          estimatedOutput={optimalRoute.estimatedOutput}
          gasEstimate={optimalRoute.gasEstimate}
          endToken={optimalRoute.route[optimalRoute.route.length - 1]?.tokenOutSymbol}
        />
      )}
    </div>
  );
}
