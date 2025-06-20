
'use server';

/**
 * @fileOverview Logic for finding a swap route for token conversions on the Polygon Blockchain.
 *
 * - findOptimalRoute - A function that handles the process of finding a route.
 * - FindOptimalRouteInput - The input type for the findOptimalRoute function.
 * - FindOptimalRouteOutput - The return type for the findOptimalRoute function.
 */

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
  const { startToken, endToken, amount } = input;
  let route: FindOptimalRouteOutput['route'] = [];
  let estimatedOutput: number = amount;
  let gasEstimate: number = 0.05; // Base gas estimate

  const st = startToken.toUpperCase();
  const et = endToken.toUpperCase();

  if (st === et) {
    route = [{ token: et, dex: 'Direct' }];
    estimatedOutput = amount;
    gasEstimate = 0.01;
  } else if (st === 'MATIC' && et === 'USDC') {
    route = [{ token: 'USDC', dex: 'Quickswap' }];
    estimatedOutput = amount * 0.995;
    gasEstimate = 0.1;
  } else if (st === 'USDC' && et === 'MATIC') {
    route = [{ token: 'MATIC', dex: 'Quickswap' }];
    estimatedOutput = amount * 0.995;
    gasEstimate = 0.1;
  } else if (st === 'USDC' && et === 'DAI') {
    route = [{ token: 'DAI', dex: 'Sushiswap' }];
    estimatedOutput = amount * 0.99;
    gasEstimate = 0.12;
  } else if (st === 'DAI' && et === 'USDC') {
    route = [{ token: 'USDC', dex: 'Sushiswap' }];
    estimatedOutput = amount * 0.99;
    gasEstimate = 0.12;
  } else if (st === 'MATIC' && et === 'DAI') {
    route = [
      { token: 'USDC', dex: 'Quickswap' }, // MATIC -> USDC
      { token: 'DAI', dex: 'Sushiswap' },  // USDC  -> DAI
    ];
    estimatedOutput = amount * 0.995 * 0.99;
    gasEstimate = 0.2;
  } else if (st === 'DAI' && et === 'MATIC') {
     route = [
      { token: 'USDC', dex: 'Sushiswap' }, // DAI -> USDC
      { token: 'MATIC', dex: 'Quickswap' }, // USDC -> MATIC
    ];
    estimatedOutput = amount * 0.99 * 0.995;
    gasEstimate = 0.2;
  } else if (st === 'WETH' && et === 'USDC') {
    route = [{ token: 'USDC', dex: 'Uniswap' }];
    estimatedOutput = amount * 0.993;
    gasEstimate = 0.15;
  } else if (st === 'USDC' && et === 'WETH') {
    route = [{ token: 'WETH', dex: 'Uniswap' }];
    estimatedOutput = amount * 0.993;
    gasEstimate = 0.15;
  } else if (st === 'WBTC' && et === 'USDC') {
    route = [{ token: 'USDC', dex: 'Curve' }];
    estimatedOutput = amount * 0.992;
    gasEstimate = 0.16;
  } else if (st === 'USDC' && et === 'WBTC') {
    route = [{ token: 'WBTC', dex: 'Curve' }];
    estimatedOutput = amount * 0.992;
    gasEstimate = 0.16;
  } else if (st === 'MATIC' && et === 'AAVE') { // New multi-step route
    route = [
      { token: 'USDC', dex: 'Quickswap' },    // MATIC -> USDC
      { token: 'LINK', dex: 'Sushiswap' },    // USDC  -> LINK
      { token: 'AAVE', dex: 'AavePortal' }  // LINK  -> AAVE
    ];
    estimatedOutput = amount * 0.995 * 0.99 * 0.985; // Simulate multiple step slippage
    gasEstimate = 0.25; // Higher gas for more steps
  } else {
    // Fallback for unhandled pairs: a single step via a generic DEX
    route = [{ token: et, dex: 'GenericDEX' }];
    estimatedOutput = amount * 0.98; 
    gasEstimate = 0.18;
  }
  
  // Simulate a short delay as if an API call was made
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    route,
    estimatedOutput: parseFloat(estimatedOutput.toFixed(6)),
    gasEstimate: parseFloat(gasEstimate.toFixed(4)),
  };
}

