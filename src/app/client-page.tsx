
"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  calculateDirectRouteOnly, 
  calculateOptimalRouteWithOptionalDirect,
  type RouteCalculationInput, 
  type SingleRoute,
  type OptimalRouteCalculationInput
} from '@/ai/flows/optimal-route-finding';
import { RouteForm, type RouteFormValues } from '@/components/routeai/RouteForm';
import { RouteDiagram } from '@/components/routeai/RouteDiagram';
import { SimulationDialog } from '@/components/routeai/SimulationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, BarChart3, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ClientPage() {
  const [directRouteData, setDirectRouteData] = useState<SingleRoute | null | undefined>(undefined); // undefined: not yet calculated, null: no route found
  const [optimalRouteData, setOptimalRouteData] = useState<SingleRoute | null | undefined>(undefined);
  
  const [currentStartToken, setCurrentStartToken] = useState<string>("");
  const [currentInputAmount, setCurrentInputAmount] = useState<number>(0);
  
  const [isLoadingDirect, setIsLoadingDirect] = useState(false);
  const [isLoadingOptimal, setIsLoadingOptimal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const { toast } = useToast();

  const directRouteDiagramRef = useRef<HTMLDivElement>(null);
  const optimalRouteDiagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (directRouteData && directRouteDiagramRef.current) {
      directRouteDiagramRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [directRouteData]);

  useEffect(() => {
    if (optimalRouteData && optimalRouteDiagramRef.current) {
      optimalRouteDiagramRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [optimalRouteData]);

  const handleFormSubmit = async (values: RouteFormValues) => {
    setIsLoadingDirect(true);
    setIsLoadingOptimal(false); // Ensure optimal loading is false initially
    setError(null);
    setDirectRouteData(undefined); 
    setOptimalRouteData(undefined);
    setCurrentStartToken(values.fromToken.toUpperCase());
    setCurrentInputAmount(values.amount);

    const routeInput: RouteCalculationInput = {
      startToken: values.fromToken.toUpperCase(),
      endToken: values.toToken.toUpperCase(),
      amount: values.amount,
    };

    let fetchedDirectRoute: SingleRoute | null = null;

    try {
      // Step 1: Calculate Direct Route
      fetchedDirectRoute = await calculateDirectRouteOnly(routeInput);
      setDirectRouteData(fetchedDirectRoute);
    } catch (e) {
      console.error("Error finding direct route:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during direct route calculation.";
      setError(`Failed to find direct route: ${errorMessage}`);
      toast({
        title: "Error Finding Direct Route",
        description: errorMessage,
        variant: "destructive",
      });
      // Optionally, stop here or try to calculate optimal anyway
      // For now, we'll stop if direct fails critically, though optimal could still work.
      // Or, allow optimal to proceed:
      // fetchedDirectRoute = null; // proceed with optimal calculation
    } finally {
      setIsLoadingDirect(false);
    }

    // Step 2: Calculate Optimal Route (even if direct failed or was null)
    setIsLoadingOptimal(true);
    try {
      const optimalInput: OptimalRouteCalculationInput = {
        mainInput: routeInput,
        directResult: fetchedDirectRoute // This can be null
      };
      const resultOptimal = await calculateOptimalRouteWithOptionalDirect(optimalInput);
      setOptimalRouteData(resultOptimal);
    } catch (e) {
      console.error("Error finding optimal route:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during optimal route calculation.";
      setError(error ? `${error}\nAdditionally, failed to find optimal route: ${errorMessage}` : `Failed to find optimal route: ${errorMessage}`);
      toast({
        title: "Error Finding Optimal Route",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingOptimal(false);
    }
  };
  
  const isLoading = isLoadingDirect || isLoadingOptimal;

  let advantageAmount: number | null = null;
  let advantagePercentage: number | null = null;
  let endTokenSymbolForAdvantage: string | undefined;

  if (optimalRouteData?.estimatedOutput && directRouteData?.estimatedOutput && directRouteData.estimatedOutput > 0 && optimalRouteData.estimatedOutput > directRouteData.estimatedOutput) {
    advantageAmount = optimalRouteData.estimatedOutput - directRouteData.estimatedOutput;
    advantagePercentage = (advantageAmount / directRouteData.estimatedOutput) * 100;
    endTokenSymbolForAdvantage = optimalRouteData.route[optimalRouteData.route.length - 1]?.tokenOutSymbol;
  }


  return (
    <div className="space-y-8 md:space-y-12 py-8">
      <RouteForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      {error && (
         <Alert variant="destructive" className="max-w-2xl mx-auto">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error.split('\n').map((line, i) => <p key={i}>{line}</p>)}</AlertDescription>
         </Alert>
      )}
      
      {isLoadingDirect && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Calculating Direct Route...</p>
        </div>
      )}

      {directRouteData !== undefined && ( // Render if calculation is done (null means no route, object means route found)
        <div ref={directRouteDiagramRef} className="flex justify-center max-w-full mx-auto">
          {directRouteData ? (
            <RouteDiagram 
              title="Direct Route (Single-DEX)"
              startToken={currentStartToken} 
              initialAmount={currentInputAmount}
              routeData={directRouteData}
            />
          ) : (
            !isLoadingDirect && currentStartToken && ( // Only show "no route" if not loading and form was submitted
              <Card className="shadow-lg max-w-2xl mx-auto w-full">
                <CardHeader>
                  <CardTitle className="text-xl font-headline text-center">Direct Route (Single-DEX)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">No direct route found for this pair.</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
      
      {isLoadingOptimal && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Calculating Optimal Route...</p>
        </div>
      )}

      {optimalRouteData && (
        <div ref={optimalRouteDiagramRef} className="max-w-full mx-auto space-y-6 flex flex-col items-center">
          <div className="flex justify-center max-w-full mx-auto">
            <RouteDiagram 
              title="Optimal Route (Multi-DEX)"
              startToken={currentStartToken} 
              initialAmount={currentInputAmount}
              routeData={optimalRouteData} 
            />
          </div>
          
          <Card className="shadow-lg max-w-2xl mx-auto w-full">
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
                  {optimalRouteData.estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                  {optimalRouteData.route[optimalRouteData.route.length - 1]?.tokenOutSymbol} 
                </span>
              </div>

              {advantageAmount !== null && advantagePercentage !== null && endTokenSymbolForAdvantage && advantageAmount > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <span className="font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    Saving vs Direct:
                  </span>
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    +{advantageAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {endTokenSymbolForAdvantage}
                    {' '}(+{advantagePercentage.toFixed(2)}%)
                  </span>
                </div>
              )}
              
              {!directRouteData && optimalRouteData.estimatedOutput > 0 && (
                <div className="flex justify-between items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                   <span className="font-medium text-blue-700 dark:text-blue-400">
                    Note: No direct route was found for comparison.
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
                  <Zap className="mr-2 h-5 w-5" />
                  Execute Swap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {optimalRouteData && isSimulationOpen && (
        <SimulationDialog
          isOpen={isSimulationOpen}
          onOpenChange={setIsSimulationOpen}
          estimatedOutput={optimalRouteData.estimatedOutput}
          gasEstimate={optimalRouteData.gasEstimate}
          endToken={optimalRouteData.route[optimalRouteData.route.length - 1]?.tokenOutSymbol}
        />
      )}
    </div>
  );
}
