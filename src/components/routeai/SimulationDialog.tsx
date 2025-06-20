
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleConfirmSwap = () => {
    // In a real application, this would trigger the actual swap transaction
    toast({
      title: "Swap Simulated!",
      description: `Successfully simulated swapping for ${estimatedOutput?.toLocaleString()} ${endToken}.`,
      variant: "default", 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <CheckCircle className="h-7 w-7 text-green-500" />
            Confirm Your Swap
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Please review the details below. Clicking 'Confirm Swap' will simulate this transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {estimatedOutput !== undefined && endToken && (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground font-medium">You will receive approximately:</span>
              <span className="text-lg font-semibold text-foreground">
                {estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })} {endToken}
              </span>
            </div>
          )}
          {gasEstimate !== undefined && (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
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

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleConfirmSwap} className="w-full sm:w-auto">
            Confirm Swap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

