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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <CheckCircle className="h-7 w-7 text-green-500" />
            Transaction Simulation
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            This is a preview of your transaction. No actual transaction will be made.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {estimatedOutput !== undefined && endToken && (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground font-medium">Estimated Output:</span>
              <span className="text-lg font-semibold text-foreground">
                {estimatedOutput.toLocaleString()} {endToken}
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
                {gasEstimate.toLocaleString()} MATIC
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
