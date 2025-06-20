
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
  startToken: z.string().describe('The symbol or address of the token to start the swap with (e.g., POL or the contract address).'),
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
  gasEstimate: z.number().describe('Estimated gas fees for the entire route, in POL.'),
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

// Helper function to apply slippage/conversion
// Rates are illustrative and simplified, but more realistic
function calculateSwap(amountIn: number, tokenIn: string, tokenOut: string, dex: string): number {
  // Base exchange rates: 1 tokenIn = X tokenOut
  // Assuming: 1 POL = $0.70, 1 USDC/DAI/USDT = $1.00, 1 WETH = $3500, 1 WBTC = $60000, 1 LINK = $14, 1 AAVE = $90
  const baseRates: Record<string, Record<string, number>> = {
    POL: { USDC: 0.70, WETH: 0.0002, DAI: 0.70, AAVE: 0.0077, LINK: 0.05, USDT: 0.70 },
    USDC: { POL: 1.428, DAI: 0.9995, WETH: 0.000285, WBTC: 0.0000166, LINK: 0.0714, AAVE: 0.0111, USDT: 0.9998 },
    DAI: { POL: 1.428, USDC: 1.0005, WETH: 0.000285, LINK: 0.0714, USDT: 1.0002 },
    WETH: { POL: 5000, USDC: 3500, DAI: 3495, WBTC: 0.0583, LINK: 250, AAVE: 38.88, USDT: 3500 },
    WBTC: { POL: 85714, USDC: 60000, WETH: 17.14, LINK: 4285, USDT: 60000 },
    LINK: { POL: 20, USDC: 14, DAI: 13.98, WETH: 0.004, AAVE: 0.155, USDT: 14 },
    AAVE: { POL: 128.57, USDC: 90, DAI: 89.9, WETH: 0.0257, LINK: 6.42, USDT: 90 },
    USDT: { POL: 1.428, USDC: 1.0002, DAI: 0.9998, WETH: 0.000285, WBTC: 0.0000166, LINK: 0.0714, AAVE: 0.0111},
    UNI: { USDC: 7.5 }, // Placeholder
    CRV: { USDC: 0.45 }, // Placeholder
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
  if (dex === 'Curve') { 
    const stablecoins = ['USDC', 'DAI', 'USDT'];
    if (stablecoins.includes(tokenIn) && stablecoins.includes(tokenOut)) {
      dexFactor = 0.9996; // 0.04% fee for stablecoin swaps
      if (tokenIn === 'USDC' && tokenOut === 'DAI') exchangeRate = 0.9998;
      else if (tokenIn === 'DAI' && tokenOut === 'USDC') exchangeRate = 1.0002;
      else if (tokenIn === 'USDC' && tokenOut === 'USDT') exchangeRate = 1.0001;
      else if (tokenIn === 'USDT' && tokenOut === 'USDC') exchangeRate = 0.9999;
      else if (tokenIn === 'DAI' && tokenOut === 'USDT') exchangeRate = 1.0003;
      else if (tokenIn === 'USDT' && tokenOut === 'DAI') exchangeRate = 0.9997;
      else exchangeRate = 1.0; 
    } else {
      dexFactor = 0.996; 
    }
  }
  if (dex === 'AavePortal') dexFactor = 0.999; 
  if (dex.startsWith('GenericDEX')) dexFactor = 0.995; 

  return amountIn * exchangeRate * dexFactor;
}


export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { startToken: initialStartToken, endToken: finalEndToken, amount: initialAmount } = input;
  
  const st = initialStartToken.toUpperCase();
  const et = finalEndToken.toUpperCase();

  let detailedRoute: z.infer<typeof SwapStepSchema>[] = [];
  let currentAmount = initialAmount;
  let currentToken = st;
  let gasEstimate = 0.05; // Base gas estimate in POL

  // Define paths as sequences of [TargetToken, DEX]
  type PathStep = [string, string];
  let path: PathStep[] = [];

  // Ensure all routes use 3 DEXs
  if (st === et) { // e.g. POL -> USDC -> DAI -> POL
    path = [['USDC', 'Quickswap'], ['DAI', 'Sushiswap'], [st, 'Curve']];
    gasEstimate = 0.025; // POL
  } else if (st === 'POL' && et === 'USDC') {
    path = [['WETH', 'Quickswap'], ['DAI', 'Sushiswap'], ['USDC', 'Curve']];
    gasEstimate = 0.022; // POL
  } else if (st === 'USDC' && et === 'POL') {
    path = [['DAI', 'Curve'], ['WETH', 'Sushiswap'], ['POL', 'Quickswap']];
    gasEstimate = 0.022; // POL
  } else if (st === 'USDC' && et === 'DAI') {
    path = [['WETH', 'Uniswap'], ['POL', 'Quickswap'], ['DAI', 'Sushiswap']];
    gasEstimate = 0.023; // POL
  } else if (st === 'DAI' && et === 'USDC') {
    path = [['POL', 'Sushiswap'], ['WETH', 'Quickswap'], ['USDC', 'Uniswap']];
    gasEstimate = 0.023; // POL
  } else if (st === 'POL' && et === 'DAI') {
    path = [['USDC', 'Quickswap'], ['WETH', 'Curve'], ['DAI', 'Sushiswap']];
    gasEstimate = 0.024; // POL
  } else if (st === 'DAI' && et === 'POL') {
     path = [['WETH', 'Sushiswap'], ['USDC', 'Curve'], ['POL', 'Quickswap']];
    gasEstimate = 0.024; // POL
  } else if (st === 'WETH' && et === 'USDC') {
    path = [['LINK', 'Uniswap'], ['DAI', 'Sushiswap'], ['USDC', 'Curve']];
    gasEstimate = 0.026; // POL
  } else if (st === 'USDC' && et === 'WETH') {
    path = [['DAI', 'Curve'], ['LINK', 'Sushiswap'], ['WETH', 'Uniswap']];
    gasEstimate = 0.026; // POL
  } else if (st === 'WBTC' && et === 'USDC') {
    path = [['WETH', 'Curve'], ['LINK', 'Uniswap'], ['USDC', 'Sushiswap']];
    gasEstimate = 0.027; // POL
  } else if (st === 'USDC' && et === 'WBTC') {
    path = [['LINK', 'Sushiswap'], ['WETH', 'Uniswap'], ['WBTC', 'Curve']];
    gasEstimate = 0.027; // POL
  } else if (st === 'POL' && et === 'AAVE') { 
    path = [['USDC', 'Quickswap'], ['LINK', 'Sushiswap'], ['AAVE', 'AavePortal']];
    gasEstimate = 0.025; // POL
  } else {
    // Fallback: ST -> Intermediate1 (GenericDEX_A) -> Intermediate2 (GenericDEX_B) -> ET (GenericDEX_C)
    let intermediateToken1 = 'LINK';
    if (st === 'LINK' || et === 'LINK') intermediateToken1 = 'AAVE';
    if (st === 'AAVE' && et === 'AAVE') intermediateToken1 = 'UNI'; 


    let intermediateToken2 = 'WETH';
    if (st === 'WETH' || et === 'WETH' || intermediateToken1 === 'WETH') intermediateToken2 = 'DAI';
    if (intermediateToken1 === 'DAI' && (st === 'DAI' || et === 'DAI')) intermediateToken2 = 'USDC';
    
    if (intermediateToken1 === st || intermediateToken1 === et) intermediateToken1 = 'CRV';
    if (intermediateToken2 === st || intermediateToken2 === et || intermediateToken2 === intermediateToken1) {
      intermediateToken2 = (intermediateToken1 === 'USDT' || st === 'USDT' || et === 'USDT') ? 'UNI' : 'USDT';
    }
    if (intermediateToken1 === intermediateToken2 || intermediateToken1 === st || intermediateToken1 === et) intermediateToken1 = 'WBTC'; 
    if (intermediateToken2 === st || intermediateToken2 === et || intermediateToken2 === intermediateToken1) intermediateToken2 = 'AAVE'; 


    path = [
      [intermediateToken1, 'GenericDEX_A'],
      [intermediateToken2, 'GenericDEX_B'],
      [et, 'GenericDEX_C']
    ];
    gasEstimate = 0.030; // POL
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
  
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));


  const finalEstimatedOutput = detailedRoute.length > 0 ? detailedRoute[detailedRoute.length - 1].amountOut : initialAmount;

  return {
    route: detailedRoute,
    estimatedOutput: parseFloat(finalEstimatedOutput.toFixed(6)),
    gasEstimate: parseFloat(gasEstimate.toFixed(4)),
  };
}
