
"use client";

import { useState } from 'react';
import { findOptimalRoute, type FindOptimalRouteInput, type FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finding';
import { RouteForm, type RouteFormValues } from '@/components/routeai/RouteForm';
import { RouteDiagram } from '@/components/routeai/RouteDiagram';
import { SimulationDialog } from '@/components/routeai/SimulationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, BarChart3, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ClientPage() {
  const [optimalRoute, setOptimalRoute] = useState<FindOptimalRouteOutput | null>(null);
  const [currentStartToken, setCurrentStartToken] = useState<string>("");
  const [currentInputAmount, setCurrentInputAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (values: RouteFormValues) => {
    setIsLoading(true);
    setError(null);
    setOptimalRoute(null); 
    setCurrentStartToken(values.startToken.toUpperCase());
    setCurrentInputAmount(values.amount);

    try {
      const input: FindOptimalRouteInput = {
        startToken: values.startToken.toUpperCase(),
        endToken: values.endToken.toUpperCase(),
        amount: values.amount,
      };
      const result = await findOptimalRoute(input);
      setOptimalRoute(result);
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

      {optimalRoute && (
        <div className="max-w-full mx-auto space-y-6">
          <RouteDiagram 
            startToken={currentStartToken} 
            initialAmount={currentInputAmount}
            routeData={optimalRoute} 
          />
          
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-center flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Swap Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                <span className="font-medium text-muted-foreground">Final Estimated Output:</span>
                <span className="font-semibold text-primary">
                  {optimalRoute.estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                  {optimalRoute.route.length > 0 ? optimalRoute.route[optimalRoute.route.length - 1]?.tokenOutSymbol : currentStartToken} 
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                <span className="font-medium text-muted-foreground">Estimated Gas Fee:</span>
                <span className="font-semibold text-primary">
                  {optimalRoute.gasEstimate.toLocaleString()} POL
                </span>
              </div>
              <div className="pt-4 text-center">
                <Button 
                  onClick={() => setIsSimulationOpen(true)} 
                  size="lg" 
                  className="shadow-md hover:shadow-lg transition-shadow"
                  variant="outline"
                >
                  <Info className="mr-2 h-5 w-5" />
                  View Transaction Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {optimalRoute && optimalRoute.route.length > 0 && (
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
