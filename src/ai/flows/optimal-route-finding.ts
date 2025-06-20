
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
// Rates are illustrative and simplified, but more realistic
function calculateSwap(amountIn: number, tokenIn: string, tokenOut: string, dex: string): number {
  // Base exchange rates: 1 tokenIn = X tokenOut
  const baseRates: Record<string, Record<string, number>> = {
    MATIC: { USDC: 0.90, WETH: 0.00025, DAI: 0.89, AAVE: 0.009, LINK: 0.06, USDT: 0.90 },
    USDC: { MATIC: 1.11, DAI: 0.9995, WETH: 0.00033, WBTC: 0.000016, LINK: 0.066, AAVE: 0.011, USDT: 0.9998 },
    DAI: { MATIC: 1.12, USDC: 1.0005, WETH: 0.00034, LINK: 0.067, USDT: 1.0002 },
    WETH: { MATIC: 4000, USDC: 3000, DAI: 2995, WBTC: 0.05, LINK: 200, AAVE: 33, USDT: 3000 },
    WBTC: { MATIC: 62500, USDC: 60000, WETH: 20, LINK: 4000, USDT: 60000 },
    LINK: { MATIC: 16.6, USDC: 15, DAI: 14.95, WETH: 0.005, AAVE: 0.16, USDT: 15 },
    AAVE: { MATIC: 111, USDC: 90, DAI: 89.5, WETH: 0.0303, LINK: 6.25, USDT: 90 },
    USDT: { MATIC: 1.11, USDC: 1.0002, DAI: 0.9998, WETH: 0.00033, WBTC: 0.000016, LINK: 0.066, AAVE: 0.011},
    // Add other known tokens if they appear in routes, e.g., CRV, UNI
    UNI: { USDC: 7.5 },
    CRV: { USDC: 0.45 },
  };

  let exchangeRate = 0.92; // Default fallback rate for unlisted pairs (less favorable)

  if (baseRates[tokenIn] && baseRates[tokenIn][tokenOut]) {
    exchangeRate = baseRates[tokenIn][tokenOut];
  } else if (baseRates[tokenOut] && baseRates[tokenOut][tokenIn]) {
    // Calculate inverse rate if defined the other way
    exchangeRate = 1 / baseRates[tokenOut][tokenIn];
  }
  // If still not found, the 0.92 default will be used.

  // DEX-specific fee factor (e.g., 0.997 means 0.3% fee)
  let dexFactor = 0.997; // Default 0.3% fee for an average DEX
  if (dex === 'Quickswap') dexFactor = 0.9975; // 0.25% fee
  if (dex === 'Sushiswap') dexFactor = 0.997;  // 0.3% fee
  if (dex === 'Uniswap') dexFactor = 0.997;   // 0.3% fee for typical pools
  if (dex === 'Curve') { // Curve has very low fees for like-kind assets
    const stablecoins = ['USDC', 'DAI', 'USDT'];
    if (stablecoins.includes(tokenIn) && stablecoins.includes(tokenOut)) {
      dexFactor = 0.9996; // 0.04% fee for stablecoin swaps
      // For stable to stable, exchangeRate should be very close to 1 before fees
      if (tokenIn === 'USDC' && tokenOut === 'DAI') exchangeRate = 0.9998;
      else if (tokenIn === 'DAI' && tokenOut === 'USDC') exchangeRate = 1.0002;
      else if (tokenIn === 'USDC' && tokenOut === 'USDT') exchangeRate = 1.0001;
      else if (tokenIn === 'USDT' && tokenOut === 'USDC') exchangeRate = 0.9999;
      else if (tokenIn === 'DAI' && tokenOut === 'USDT') exchangeRate = 1.0003;
      else if (tokenIn === 'USDT' && tokenOut === 'DAI') exchangeRate = 0.9997;
      else exchangeRate = 1.0; // Assume 1:1 for other stable pairs before Curve's tiny fee
    } else {
      dexFactor = 0.996; // Higher fee for non-stablecoin pools on Curve
    }
  }
  if (dex === 'AavePortal') dexFactor = 0.999; // Small portal interaction "fee" or slippage
  if (dex.startsWith('GenericDEX')) dexFactor = 0.995; // 0.5% for generic ones

  return amountIn * exchangeRate * dexFactor;
}


export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { startToken: initialStartToken, endToken: finalEndToken, amount: initialAmount } = input;
  
  const st = initialStartToken.toUpperCase();
  const et = finalEndToken.toUpperCase();

  let detailedRoute: z.infer<typeof SwapStepSchema>[] = [];
  let currentAmount = initialAmount;
  let currentToken = st;
  let gasEstimate = 0.05; // Base gas estimate

  // Define paths as sequences of [TargetToken, DEX]
  type PathStep = [string, string];
  let path: PathStep[] = [];

  // Ensure all routes use 3 DEXs
  if (st === et) { // e.g. MATIC -> USDC -> DAI -> MATIC
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
    // Pick intermediates different from ST and ET
    let intermediateToken1 = 'LINK';
    if (st === 'LINK' || et === 'LINK') intermediateToken1 = 'AAVE';
    if (st === 'AAVE' && et === 'AAVE') intermediateToken1 = 'UNI'; // If somehow ST=AAVE, ET=AAVE, intermediate=AAVE


    let intermediateToken2 = 'WETH';
    if (st === 'WETH' || et === 'WETH' || intermediateToken1 === 'WETH') intermediateToken2 = 'DAI';
    if (intermediateToken1 === 'DAI' && (st === 'DAI' || et === 'DAI')) intermediateToken2 = 'USDC';
    
    // Ensure intermediates are distinct and not ST/ET
    if (intermediateToken1 === st || intermediateToken1 === et) intermediateToken1 = 'CRV';
    if (intermediateToken2 === st || intermediateToken2 === et || intermediateToken2 === intermediateToken1) {
      intermediateToken2 = (intermediateToken1 === 'USDT' || st === 'USDT' || et === 'USDT') ? 'UNI' : 'USDT';
    }
     // Final check for distinctness
    if (intermediateToken1 === intermediateToken2 || intermediateToken1 === st || intermediateToken1 === et) intermediateToken1 = 'WBTC'; // A very different one
    if (intermediateToken2 === st || intermediateToken2 === et || intermediateToken2 === intermediateToken1) intermediateToken2 = 'AAVE'; // Another different one


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
      amountIn: parseFloat(amountInForStep.toFixed(6)),
      tokenOutSymbol: targetToken,
      amountOut: parseFloat(amountOutForStep.toFixed(6)),
    });

    currentAmount = amountOutForStep;
    currentToken = targetToken;
  }
  
  // Simulate some async operation if this were a real API call
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));


  const finalEstimatedOutput = detailedRoute.length > 0 ? detailedRoute[detailedRoute.length - 1].amountOut : initialAmount;

  return {
    route: detailedRoute,
    estimatedOutput: parseFloat(finalEstimatedOutput.toFixed(6)),
    gasEstimate: parseFloat(gasEstimate.toFixed(4)),
  };
}


    