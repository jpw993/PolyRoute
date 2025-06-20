
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
import { AlertTriangle, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraphSearchAnimation } from '@/components/routeai/GraphSearchAnimation';


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

  const directLoadingSectionRef = useRef<HTMLDivElement>(null);
  const directRouteDiagramRef = useRef<HTMLDivElement>(null);
  const optimalRouteDiagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (directRouteData !== undefined && !isLoadingDirect && directRouteDiagramRef.current) {
      directRouteDiagramRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [directRouteData, isLoadingDirect]);

  useEffect(() => {
    if (optimalRouteData && !isLoadingOptimal && optimalRouteDiagramRef.current) {
      optimalRouteDiagramRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [optimalRouteData, isLoadingOptimal]);

  const handleFormSubmit = async (values: RouteFormValues) => {
    setIsLoadingDirect(true);
    setIsLoadingOptimal(false); 
    setError(null);
    setDirectRouteData(undefined); 
    setOptimalRouteData(undefined);
    setCurrentStartToken(values.fromToken.toUpperCase());
    setCurrentInputAmount(values.amount);

    // Scroll to loading animation for direct route
    setTimeout(() => {
      directLoadingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    const routeInput: RouteCalculationInput = {
      startToken: values.fromToken.toUpperCase(),
      endToken: values.toToken.toUpperCase(),
      amount: values.amount,
    };

    let fetchedDirectRoute: SingleRoute | null = null;

    try {
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
    } finally {
      setIsLoadingDirect(false);
    }

    // Check if there was an error specifically with direct route calculation before proceeding
    let proceedToOptimal = true;
    if (error && error.startsWith("Failed to find direct route:")) {
        proceedToOptimal = false;
    }
    // Also, if fetchedDirectRoute is null and we are not in an error state (e.g. silent failure from API),
    // we might still want to proceed, or handle it. For now, proceed if no explicit error.

    if (proceedToOptimal) {
      setIsLoadingOptimal(true);
      try {
        const optimalInput: OptimalRouteCalculationInput = {
          mainInput: routeInput,
          directResult: fetchedDirectRoute 
        };
        const resultOptimal = await calculateOptimalRouteWithOptionalDirect(optimalInput);
        setOptimalRouteData(resultOptimal);
      } catch (e) {
        console.error("Error finding optimal route:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during optimal route calculation.";
        setError(prevError => prevError ? `${prevError}\nAdditionally, failed to find optimal route: ${errorMessage}` : `Failed to find optimal route: ${errorMessage}`);
        toast({
          title: "Error Finding Optimal Route",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptimal(false);
      }
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
      
      <div ref={directLoadingSectionRef}>
        {isLoadingDirect && (
          <div className="flex flex-col justify-center items-center py-10">
            <GraphSearchAnimation className="h-60 w-60 text-primary" />
            <p className="mt-3 text-lg text-muted-foreground">Searching for Direct Routes...</p>
          </div>
        )}
      </div>

      {directRouteData !== undefined && !isLoadingDirect && ( 
        <div ref={directRouteDiagramRef} className="flex justify-center max-w-full mx-auto">
          {directRouteData ? (
            <RouteDiagram 
              title="Direct Route (Single-DEX)"
              startToken={currentStartToken} 
              initialAmount={currentInputAmount}
              routeData={directRouteData}
            />
          ) : (
            currentStartToken && ( 
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
      
      {isLoadingOptimal && !isLoadingDirect && ( 
        <div className="flex flex-col justify-center items-center py-10">
          <GraphSearchAnimation className="h-60 w-60 text-primary" />
          <p className="mt-3 text-lg text-muted-foreground">Optimizing Best Multi-DEX Route...</p>
        </div>
      )}

      {optimalRouteData && !isLoadingOptimal && (
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
                    Note: No direct route was found for comparison. The optimal route was calculated independently.
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

