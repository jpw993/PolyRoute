
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
// Removed useToast as confirmation is now in-dialog
// import { useToast } from "@/hooks/use-toast";

interface SimulationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  estimatedOutput?: number;
  gasEstimate?: number;
  endToken?: string;
}

export function SimulationDialog({ 
  isOpen, 
  onOpenChange, 
  estimatedOutput, 
  gasEstimate,
  endToken 
}: SimulationDialogProps) {
  // const { toast } = useToast(); // Removed
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [swapConfirmed, setSwapConfirmed] = React.useState(false);

  const handleConfirmSwap = async () => {
    setIsSwapping(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSwapping(false);
    setSwapConfirmed(true);
    // Toast is removed as confirmation is now in-dialog
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset states for next time dialog opens
    setTimeout(() => {
      setIsSwapping(false);
      setSwapConfirmed(false);
    }, 300); // Delay to allow dialog close animation
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            {isSwapping ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                Processing Swap...
              </>
            ) : swapConfirmed ? (
              <>
                <CheckCircle className="h-7 w-7 text-green-500" />
                Swap Successful!
              </>
            ) : (
              <>
                <Zap className="h-7 w-7 text-primary" />
                Confirm Your Swap
              </>
            )}
          </DialogTitle>
          {!isSwapping && !swapConfirmed && (
            <DialogDescription className="pt-2 text-base">
              Please review the details below. Clicking 'Confirm Swap' will simulate this transaction.
            </DialogDescription>
          )}
           {swapConfirmed && (
            <DialogDescription className="pt-2 text-base">
              Your simulated swap for approximately {estimatedOutput?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {endToken} has been processed.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {!swapConfirmed && (
          <div className="grid gap-6 py-6">
            {estimatedOutput !== undefined && endToken && (
              <div className={`flex items-center justify-between p-4 bg-secondary/50 rounded-lg ${isSwapping ? 'opacity-50' : ''}`}>
                <span className="text-muted-foreground font-medium">You will receive approximately:</span>
                <span className="text-lg font-semibold text-foreground">
                  {estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })} {endToken}
                </span>
              </div>
            )}
            {gasEstimate !== undefined && (
              <div className={`flex items-center justify-between p-4 bg-secondary/50 rounded-lg ${isSwapping ? 'opacity-50' : ''}`}>
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Estimated Gas Fee:
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {gasEstimate.toLocaleString(undefined, { maximumFractionDigits: 4 })} POL
                </span>
              </div>
            )}
          </div>
        )}

        {swapConfirmed && (
          <div className="py-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              You would have received approximately <strong className="text-foreground">{estimatedOutput?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {endToken}</strong>.
            </p>
             {gasEstimate !== undefined && (
               <p className="text-sm text-muted-foreground mt-1">
                 Estimated gas cost: {gasEstimate.toLocaleString(undefined, { maximumFractionDigits: 4 })} POL.
               </p>
             )}
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0 pt-2">
          {swapConfirmed ? (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isSwapping} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleConfirmSwap} disabled={isSwapping} className="w-full sm:w-auto">
                {isSwapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSwapping ? "Processing..." : "Confirm Swap"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
