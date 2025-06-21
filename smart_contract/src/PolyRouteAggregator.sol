// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(
        uint amountIn,
        address[] calldata path
    ) external view returns (uint[] memory amounts);
}

interface IERC20 {
    function approve(address spender, uint amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

interface ICurvePool {
    function exchange(
        int128 i, 
        int128 j, 
        uint256 dx, 
        uint256 min_dy
    ) external returns (uint256);

    function get_dy(
        int128 i, 
        int128 j, 
        uint256 dx
    ) external view returns (uint256);
}

contract PolyRouteAggregator {
    address public owner;

    address public constant QUICKSWAP_ROUTER = 0xa5E0829CaCED8fFDD4De3c43696c57F7D7A678ff;
    address public constant SUSHISWAP_ROUTER = 0x1b02da8cb0d097eb8d57a175b88c7d8b47997506;

    enum Dex { QuickSwap, SushiSwap, Curve }

    constructor() {
        owner = msg.sender;
    }

    function swapUniswapStyle(
        address router,
        address tokenIn,
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        uint deadline
    ) internal returns (uint[] memory amounts) {
        IERC20(tokenIn).approve(router, amountIn);
        return IUniswapV2Router(router).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }

    function swapCurve(
        address pool,
        address tokenIn,
        uint amountIn,
        uint amountOutMin,
        int128 i,
        int128 j
    ) internal returns (uint256) {
        IERC20(tokenIn).approve(pool, amountIn);
        return ICurvePool(pool).exchange(i, j, amountIn, amountOutMin);
    }

    function swap(
        Dex dex,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        uint deadline,
        address curvePool,
        int128 i,
        int128 j
    ) external returns (uint256 output) {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        if (dex == Dex.QuickSwap) {
            swapUniswapStyle(QUICKSWAP_ROUTER, tokenIn, amountIn, amountOutMin, path, deadline);
            return 0;
        } else if (dex == Dex.SushiSwap) {
            swapUniswapStyle(SUSHISWAP_ROUTER, tokenIn, amountIn, amountOutMin, path, deadline);
            return 0;
        } else if (dex == Dex.Curve) {
            return swapCurve(curvePool, tokenIn, amountIn, amountOutMin, i, j);
        } else {
            revert("Unsupported DEX");
        }
    }

    function getQuote(
        Dex dex,
        uint amountIn,
        address[] calldata path,
        address curvePool,
        int128 i,
        int128 j
    ) external view returns (uint256 amountOut) {
        if (dex == Dex.QuickSwap) {
            uint[] memory amounts = IUniswapV2Router(QUICKSWAP_ROUTER).getAmountsOut(amountIn, path);
            return amounts[amounts.length - 1];
        } else if (dex == Dex.SushiSwap) {
            uint[] memory amounts = IUniswapV2Router(SUSHISWAP_ROUTER).getAmountsOut(amountIn, path);
            return amounts[amounts.length - 1];
        } else if (dex == Dex.Curve) {
            return ICurvePool(curvePool).get_dy(i, j, amountIn);
        } else {
            revert("Unsupported DEX");
        }
    }
}

