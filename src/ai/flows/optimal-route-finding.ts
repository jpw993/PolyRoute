
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
  ).describe('The optimal route for the token swap, always involving 3 DEXs.'),
  estimatedOutput: z.number().describe('The estimated output amount of the end token after the swap.'),
  gasEstimate: z.number().describe('Estimated gas fees for the entire route, in MATIC.'),
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { startToken, endToken, amount } = input;
  let route: FindOptimalRouteOutput['route'] = [];
  let estimatedOutput: number = amount;
  let gasEstimate: number = 0.05; 

  const st = startToken.toUpperCase();
  const et = endToken.toUpperCase();

  // All routes will now be structured to use 3 DEXs.
  // Slippage factors (e.g., 0.995, 0.99, 0.98) are illustrative.
  // Gas estimates are illustrative.

  if (st === et) {
    // Artificial 3-DEX route for same token: ST -> USDC -> DAI -> ST
    route = [
      { token: 'USDC', dex: 'Quickswap' },
      { token: 'DAI', dex: 'Sushiswap' },
      { token: st, dex: 'Curve' }
    ];
    estimatedOutput = amount * 0.995 * 0.99 * 0.992; 
    gasEstimate = 0.25;
  } else if (st === 'MATIC' && et === 'USDC') {
    // MATIC -> WETH -> DAI -> USDC
    route = [
      { token: 'WETH', dex: 'Quickswap' },
      { token: 'DAI', dex: 'Sushiswap' },
      { token: 'USDC', dex: 'Curve' }
    ];
    estimatedOutput = amount * 0.995 * 0.99 * 0.992;
    gasEstimate = 0.22;
  } else if (st === 'USDC' && et === 'MATIC') {
    // USDC -> DAI -> WETH -> MATIC
    route = [
      { token: 'DAI', dex: 'Curve' },
      { token: 'WETH', dex: 'Sushiswap' },
      { token: 'MATIC', dex: 'Quickswap' }
    ];
    estimatedOutput = amount * 0.992 * 0.99 * 0.995;
    gasEstimate = 0.22;
  } else if (st === 'USDC' && et === 'DAI') {
    // USDC -> WETH -> MATIC -> DAI
    route = [
      { token: 'WETH', dex: 'Uniswap' },
      { token: 'MATIC', dex: 'Quickswap' },
      { token: 'DAI', dex: 'Sushiswap' }
    ];
    estimatedOutput = amount * 0.993 * 0.995 * 0.99;
    gasEstimate = 0.23;
  } else if (st === 'DAI' && et === 'USDC') {
    // DAI -> MATIC -> WETH -> USDC
    route = [
      { token: 'MATIC', dex: 'Sushiswap' },
      { token: 'WETH', dex: 'Quickswap' },
      { token: 'USDC', dex: 'Uniswap' }
    ];
    estimatedOutput = amount * 0.99 * 0.995 * 0.993;
    gasEstimate = 0.23;
  } else if (st === 'MATIC' && et === 'DAI') {
    // MATIC -> USDC -> WETH -> DAI
    route = [
      { token: 'USDC', dex: 'Quickswap' },
      { token: 'WETH', dex: 'Curve' },
      { token: 'DAI', dex: 'Sushiswap' }
    ];
    estimatedOutput = amount * 0.995 * 0.992 * 0.99;
    gasEstimate = 0.24;
  } else if (st === 'DAI' && et === 'MATIC') {
    // DAI -> WETH -> USDC -> MATIC
     route = [
      { token: 'WETH', dex: 'Sushiswap' },
      { token: 'USDC', dex: 'Curve' },
      { token: 'MATIC', dex: 'Quickswap' }
    ];
    estimatedOutput = amount * 0.99 * 0.992 * 0.995;
    gasEstimate = 0.24;
  } else if (st === 'WETH' && et === 'USDC') {
    // WETH -> LINK -> DAI -> USDC
    route = [
      { token: 'LINK', dex: 'Uniswap' },
      { token: 'DAI', dex: 'Sushiswap' },
      { token: 'USDC', dex: 'Curve' }
    ];
    estimatedOutput = amount * 0.993 * 0.99 * 0.992;
    gasEstimate = 0.26;
  } else if (st === 'USDC' && et === 'WETH') {
    // USDC -> DAI -> LINK -> WETH
    route = [
      { token: 'DAI', dex: 'Curve' },
      { token: 'LINK', dex: 'Sushiswap' },
      { token: 'WETH', dex: 'Uniswap' }
    ];
    estimatedOutput = amount * 0.992 * 0.99 * 0.993;
    gasEstimate = 0.26;
  } else if (st === 'WBTC' && et === 'USDC') {
    // WBTC -> WETH -> LINK -> USDC
    route = [
      { token: 'WETH', dex: 'Curve' },
      { token: 'LINK', dex: 'Uniswap' },
      { token: 'USDC', dex: 'Sushiswap' }
    ];
    estimatedOutput = amount * 0.992 * 0.993 * 0.99;
    gasEstimate = 0.27;
  } else if (st === 'USDC' && et === 'WBTC') {
    // USDC -> LINK -> WETH -> WBTC
    route = [
      { token: 'LINK', dex: 'Sushiswap' },
      { token: 'WETH', dex: 'Uniswap' },
      { token: 'WBTC', dex: 'Curve' }
    ];
    estimatedOutput = amount * 0.99 * 0.993 * 0.992;
    gasEstimate = 0.27;
  } else if (st === 'MATIC' && et === 'AAVE') { 
    // MATIC -> USDC -> LINK -> AAVE (already 3 DEXs)
    route = [
      { token: 'USDC', dex: 'Quickswap' },
      { token: 'LINK', dex: 'Sushiswap' },
      { token: 'AAVE', dex: 'AavePortal' }
    ];
    estimatedOutput = amount * 0.995 * 0.99 * 0.985; 
    gasEstimate = 0.25;
  } else {
    // Fallback for unhandled pairs: ST -> IT1 -> IT2 -> ET
    // Using LINK and WETH as somewhat generic intermediate tokens.
    let intermediateToken1 = 'LINK';
    let intermediateToken2 = 'WETH';

    if (st === 'LINK') intermediateToken1 = 'AAVE'; // Avoid ST -> LINK -> ...
    if (intermediateToken1 === et ) intermediateToken1 = (et === 'AAVE' ? 'UNI' : 'AAVE'); // Avoid ST -> IT1 -> ET where IT1=ET
    
    if (st === 'WETH' && intermediateToken1 === 'WETH') intermediateToken1 = 'DAI';
    else if (intermediateToken1 === 'WETH' && et === 'WETH') intermediateToken1 = 'DAI';
    
    if (intermediateToken1 === intermediateToken2) intermediateToken2 = 'USDC'; // Ensure IT1 != IT2
    if (intermediateToken2 === et) intermediateToken2 = (et === 'USDC' ? 'DAI' : 'USDC'); // Avoid IT1 -> IT2 -> ET where IT2=ET
    if (intermediateToken1 === intermediateToken2) intermediateToken2 = 'CRV'; // Final check for IT1 != IT2

    route = [
      { token: intermediateToken1, dex: 'GenericDEX_A' },
      { token: intermediateToken2, dex: 'GenericDEX_B' },
      { token: et, dex: 'GenericDEX_C' }
    ];
    estimatedOutput = amount * 0.985 * 0.985 * 0.985; 
    gasEstimate = 0.30;
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    route,
    estimatedOutput: parseFloat(estimatedOutput.toFixed(6)),
    gasEstimate: parseFloat(gasEstimate.toFixed(4)),
  };
}

