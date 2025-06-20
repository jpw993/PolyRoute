
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
import { Loader2, Search } from "lucide-react";

const routeFormSchema = z.object({
  startToken: z.string().min(1, "Please select a start token."),
  endToken: z.string().min(1, "Please select an end token."),
  amount: z.coerce.number().positive("Amount must be a positive number"),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;

interface RouteFormProps {
  onSubmit: (values: RouteFormValues) => void;
  isLoading: boolean;
}

const availableTokens = [
  { value: "MATIC", label: "MATIC (Polygon)" },
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
      startToken: "",
      endToken: "",
      amount: 1,
    },
  });

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
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="startToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="startTokenSelect" className="text-base">Start Token</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="startTokenSelect" className="text-base h-12">
                        <SelectValue placeholder="Select a start token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTokens.map(token => (
                        <SelectItem key={`start-${token.value}`} value={token.value}>
                          {token.label}
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
              name="endToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="endTokenSelect" className="text-base">End Token</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="endTokenSelect" className="text-base h-12">
                        <SelectValue placeholder="Select an end token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTokens.map(token => (
                        <SelectItem key={`end-${token.value}`} value={token.value}>
                          {token.label}
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
                <FormItem>
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
