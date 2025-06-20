"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Search } from "lucide-react";

const routeFormSchema = z.object({
  startToken: z.string().min(1, "Start token is required (e.g., MATIC, ETH)").max(10, "Token symbol too long"),
  endToken: z.string().min(1, "End token is required (e.g., USDC, DAI)").max(10, "Token symbol too long"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;

interface RouteFormProps {
  onSubmit: (values: RouteFormValues) => void;
  isLoading: boolean;
}

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
          Enter your token details to discover the most efficient swap path on Polygon.
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
                  <FormLabel htmlFor="startToken" className="text-base">Start Token</FormLabel>
                  <FormControl>
                    <Input id="startToken" placeholder="e.g., MATIC" {...field} className="text-base h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="endToken" className="text-base">End Token</FormLabel>
                  <FormControl>
                    <Input id="endToken" placeholder="e.g., USDC" {...field} className="text-base h-12" />
                  </FormControl>
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
