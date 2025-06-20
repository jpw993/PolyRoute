'use server';

/**
 * @fileOverview AI agent for finding the optimal swap route for token conversions on the Polygon Blockchain.
 *
 * - findOptimalRoute - A function that handles the process of finding the optimal route.
 * - FindOptimalRouteInput - The input type for the findOptimalRoute function.
 * - FindOptimalRouteOutput - The return type for the findOptimalRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindOptimalRouteInputSchema = z.object({
  startToken: z.string().describe('The symbol or address of the token to start the swap with (e.g., MATIC or the contract address).'),
  endToken: z.string().describe('The symbol or address of the token to end the swap with (e.g., USDC or the contract address).'),
  amount: z.number().describe('The amount of the starting token to swap.'),
});
export type FindOptimalRouteInput = z.infer<typeof FindOptimalRouteInputSchema>;

const FindOptimalRouteOutputSchema = z.object({
  route: z.array(
    z.object({
      token: z.string().describe('The symbol or address of the token in this step of the route.'),
      dex: z.string().describe('The name of the DEX used for this step of the route.'),
    })
  ).describe('The optimal route for the token swap.'),
  estimatedOutput: z.number().describe('The estimated output amount of the end token after the swap.'),
  gasEstimate: z.number().describe('Estimated gas fees for the entire route, in MATIC.'),
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  return findOptimalRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findOptimalRoutePrompt',
  input: {schema: FindOptimalRouteInputSchema},
  output: {schema: FindOptimalRouteOutputSchema},
  prompt: `You are an AI-powered DEX aggregator specializing in finding optimal routes for token swaps on the Polygon Blockchain.

  Given a starting token, an ending token and an amount to swap, find the best route for the swap.
  The route should include the token and DEX for each step.
  Also estimate the final output and gas fees for the route.

  Start Token: {{{startToken}}}
  End Token: {{{endToken}}}
  Amount: {{{amount}}}

  Consider top DEXes in the Polygon chain such as Quickswap, Sushiswap, and Uniswap.
  Ensure that the route is efficient and minimizes gas costs.
  Use real-time data to provide the most accurate estimates.

  Output the route, estimated output and gas estimate in the JSON format specified in the output schema.
`,
});

const findOptimalRouteFlow = ai.defineFlow(
  {
    name: 'findOptimalRouteFlow',
    inputSchema: FindOptimalRouteInputSchema,
    outputSchema: FindOptimalRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
