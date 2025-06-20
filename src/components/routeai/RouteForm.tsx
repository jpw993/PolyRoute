
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { TokenIcon } from './TokenIcon';

const routeFormSchema = z.object({
  fromToken: z.string().min(1, "Please select a 'From' token."),
  toToken: z.string().min(1, "Please select a 'To' token."),
  amount: z.coerce.number().positive("Amount must be a positive number"),
}).refine(data => data.fromToken !== data.toToken, {
  message: "'From' and 'To' tokens cannot be the same.",
  path: ["toToken"], 
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;

interface RouteFormProps {
  onSubmit: (values: RouteFormValues) => void;
  isLoading: boolean;
}

const availableTokens = [
  { value: "POL", label: "POL (Polygon)" },
  { value: "USDC", label: "USDC (USD Coin)" },
  { value: "DAI", label: "DAI (Dai Stablecoin)" },
  { value: "WETH", label: "WETH (Wrapped Ether)" },
  { value: "WBTC", label: "WBTC (Wrapped Bitcoin)" },
  { value: "USDT", label: "USDT (Tether)" },
  { value: "LINK", label: "LINK (Chainlink)" },
  { value: "AAVE", label: "AAVE (Aave)" },
];

export function RouteForm({ onSubmit, isLoading }: RouteFormProps) {
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      fromToken: "",
      toToken: "",
      amount: 1,
    },
  });

  const watchedFromToken = form.watch("fromToken");
  const watchedToToken = form.watch("toToken");

  const handleSwapTokens = () => {
    const currentFromToken = form.getValues("fromToken");
    const currentToToken = form.getValues("toToken");

    if (currentFromToken && currentToToken) {
      form.setValue("fromToken", currentToToken, { shouldValidate: true, shouldDirty: true });
      form.setValue("toToken", currentFromToken, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-headline text-center text-primary">Find Optimal Swap Route</CardTitle>
        <CardDescription className="text-center pt-1">
          Select your token details to discover the most efficient swap path on Polygon.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent> {/* Removed space-y-4 */}
            <FormField
              control={form.control}
              name="fromToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="fromTokenSelect" className="text-base">From</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="fromTokenSelect" className="text-base h-12">
                        <SelectValue placeholder="Select a 'From' token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTokens.map(token => (
                        <SelectItem 
                          key={`from-${token.value}`} 
                          value={token.value}
                          disabled={token.value === watchedToToken}
                        >
                          <div className="flex items-center gap-2">
                            <TokenIcon tokenSymbol={token.value} className="h-5 w-5" />
                            {token.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative flex items-center justify-center pt-1"> {/* Changed py-1 to pt-1 */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                disabled={!watchedFromToken || !watchedToToken || isLoading}
                aria-label="Swap from and to tokens"
                className="border-2 hover:bg-accent/50 transition-colors"
              >
                <ArrowUpDown className="h-8 w-8 text-primary" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name="toToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="toTokenSelect" className="text-base">To</FormLabel>
                   <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                   >
                    <FormControl>
                      <SelectTrigger id="toTokenSelect" className="text-base h-12">
                        <SelectValue placeholder="Select a 'To' token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTokens.map(token => (
                        <SelectItem 
                          key={`to-${token.value}`} 
                          value={token.value}
                          disabled={token.value === watchedFromToken}
                        >
                          <div className="flex items-center gap-2">
                            <TokenIcon tokenSymbol={token.value} className="h-5 w-5" />
                            {token.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="mt-4"> {/* Added mt-4 to restore space before amount field */}
                  <FormLabel htmlFor="amount" className="text-base">Amount</FormLabel>
                  <FormControl>
                    <Input id="amount" type="number" placeholder="e.g., 100" {...field} className="text-base h-12" step="any" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              Find Route
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
