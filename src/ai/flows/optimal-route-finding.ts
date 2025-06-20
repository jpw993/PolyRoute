
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

const SwapStepSchema = z.object({
  dex: z.string().describe('The DEX used for this swap step.'),
  tokenInSymbol: z.string().describe('Symbol of the input token for this swap step.'),
  amountIn: z.number().describe('Amount of the input token for this swap step.'),
  tokenOutSymbol: z.string().describe('Symbol of the output token from this swap step.'),
  amountOut: z.number().describe('Amount of the output token from this swap step.'),
});

const FindOptimalRouteOutputSchema = z.object({
  route: z.array(SwapStepSchema).describe('The optimal route for the token swap, detailing each step with amounts.'),
  estimatedOutput: z.number().describe('The final estimated output amount of the end token after the swap.'),
  gasEstimate: z.number().describe('Estimated gas fees for the entire route, in MATIC.'),
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

// Helper function to apply slippage/conversion
// Rates are illustrative and simplified
function calculateSwap(amountIn: number, tokenIn: string, tokenOut: string, dex: string): number {
  let rate = 0.99; // Default slippage/conversion
  if (dex === 'Quickswap') rate = 0.995;
  if (dex === 'Sushiswap') rate = 0.992;
  if (dex === 'Curve') rate = 0.990;
  if (dex === 'Uniswap') rate = 0.993;
  if (dex === 'AavePortal') rate = 0.985; // Example for direct Aave interaction
  
  // Minor adjustments for specific pairs if needed (very simplified)
  if ((tokenIn === 'MATIC' && tokenOut === 'USDC') || (tokenIn === 'USDC' && tokenOut === 'MATIC')) rate *= 1.001;
  if ((tokenIn === 'WETH' && tokenOut === 'DAI') || (tokenIn === 'DAI' && tokenOut === 'WETH')) rate *= 1.0005;

  return amountIn * rate;
}

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { startToken: initialStartToken, endToken: finalEndToken, amount: initialAmount } = input;
  
  const st = initialStartToken.toUpperCase();
  const et = finalEndToken.toUpperCase();

  let detailedRoute: z.infer<typeof SwapStepSchema>[] = [];
  let currentAmount = initialAmount;
  let currentToken = st;
  let gasEstimate = 0.05;

  // Define paths as sequences of [TargetToken, DEX]
  type PathStep = [string, string];
  let path: PathStep[] = [];

  if (st === et) {
    path = [['USDC', 'Quickswap'], ['DAI', 'Sushiswap'], [st, 'Curve']];
    gasEstimate = 0.25;
  } else if (st === 'MATIC' && et === 'USDC') {
    path = [['WETH', 'Quickswap'], ['DAI', 'Sushiswap'], ['USDC', 'Curve']];
    gasEstimate = 0.22;
  } else if (st === 'USDC' && et === 'MATIC') {
    path = [['DAI', 'Curve'], ['WETH', 'Sushiswap'], ['MATIC', 'Quickswap']];
    gasEstimate = 0.22;
  } else if (st === 'USDC' && et === 'DAI') {
    path = [['WETH', 'Uniswap'], ['MATIC', 'Quickswap'], ['DAI', 'Sushiswap']];
    gasEstimate = 0.23;
  } else if (st === 'DAI' && et === 'USDC') {
    path = [['MATIC', 'Sushiswap'], ['WETH', 'Quickswap'], ['USDC', 'Uniswap']];
    gasEstimate = 0.23;
  } else if (st === 'MATIC' && et === 'DAI') {
    path = [['USDC', 'Quickswap'], ['WETH', 'Curve'], ['DAI', 'Sushiswap']];
    gasEstimate = 0.24;
  } else if (st === 'DAI' && et === 'MATIC') {
     path = [['WETH', 'Sushiswap'], ['USDC', 'Curve'], ['MATIC', 'Quickswap']];
    gasEstimate = 0.24;
  } else if (st === 'WETH' && et === 'USDC') {
    path = [['LINK', 'Uniswap'], ['DAI', 'Sushiswap'], ['USDC', 'Curve']];
    gasEstimate = 0.26;
  } else if (st === 'USDC' && et === 'WETH') {
    path = [['DAI', 'Curve'], ['LINK', 'Sushiswap'], ['WETH', 'Uniswap']];
    gasEstimate = 0.26;
  } else if (st === 'WBTC' && et === 'USDC') {
    path = [['WETH', 'Curve'], ['LINK', 'Uniswap'], ['USDC', 'Sushiswap']];
    gasEstimate = 0.27;
  } else if (st === 'USDC' && et === 'WBTC') {
    path = [['LINK', 'Sushiswap'], ['WETH', 'Uniswap'], ['WBTC', 'Curve']];
    gasEstimate = 0.27;
  } else if (st === 'MATIC' && et === 'AAVE') { 
    path = [['USDC', 'Quickswap'], ['LINK', 'Sushiswap'], ['AAVE', 'AavePortal']];
    gasEstimate = 0.25;
  } else {
    // Fallback: ST -> Intermediate1 (GenericDEX_A) -> Intermediate2 (GenericDEX_B) -> ET (GenericDEX_C)
    let intermediateToken1 = 'LINK';
    let intermediateToken2 = 'WETH';
    if (st === 'LINK') intermediateToken1 = 'AAVE';
    if (intermediateToken1 === et) intermediateToken1 = (et === 'AAVE' ? 'UNI' : 'AAVE');
    if (st === 'WETH' && intermediateToken1 === 'WETH') intermediateToken1 = 'DAI';
    else if (intermediateToken1 === 'WETH' && et === 'WETH') intermediateToken1 = 'DAI';
    if (intermediateToken1 === intermediateToken2) intermediateToken2 = 'USDC';
    if (intermediateToken2 === et) intermediateToken2 = (et === 'USDC' ? 'DAI' : 'USDC');
    if (intermediateToken1 === intermediateToken2) intermediateToken2 = 'CRV'; // Final check

    path = [
      [intermediateToken1, 'GenericDEX_A'],
      [intermediateToken2, 'GenericDEX_B'],
      [et, 'GenericDEX_C']
    ];
    gasEstimate = 0.30;
  }

  for (const [targetToken, dex] of path) {
    const amountInForStep = currentAmount;
    const tokenInForStep = currentToken;
    const amountOutForStep = calculateSwap(amountInForStep, tokenInForStep, targetToken, dex);

    detailedRoute.push({
      dex: dex,
      tokenInSymbol: tokenInForStep,
      amountIn: amountInForStep,
      tokenOutSymbol: targetToken,
      amountOut: amountOutForStep,
    });

    currentAmount = amountOutForStep;
    currentToken = targetToken;
  }
  
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  const finalEstimatedOutput = detailedRoute.length > 0 ? detailedRoute[detailedRoute.length - 1].amountOut : initialAmount;

  return {
    route: detailedRoute,
    estimatedOutput: parseFloat(finalEstimatedOutput.toFixed(6)),
    gasEstimate: parseFloat(gasEstimate.toFixed(4)),
  };
}
