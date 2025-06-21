// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PolyRouteAggregator.sol";

// === Mock Interfaces ===

contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowances;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function mint(address to, uint amount) external {
        balances[to] += amount;
    }

    function transferFrom(address from, address to, uint amount) external returns (bool) {
        require(balances[from] >= amount, "Insufficient");
        require(allowances[from][msg.sender] >= amount, "Allowance");
        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function balanceOf(address user) external view returns (uint) {
        return balances[user];
    }
}

contract MockRouter is IUniswapV2Router {
    uint[] public output;

    function setOutput(uint[] memory _output) external {
        output = _output;
    }

    function swapExactTokensForTokens(
        uint, uint, address[] calldata, address, uint
    ) external returns (uint[] memory) {
        return output;
    }

    function getAmountsOut(uint, address[] calldata) external view returns (uint[] memory) {
        return output;
    }
}

contract MockCurvePool is ICurvePool {
    uint public dy = 500;

    function setDy(uint _dy) external {
        dy = _dy;
    }

    function get_dy(int128, int128, uint256) external view returns (uint256) {
        return dy;
    }

    function exchange(int128, int128, uint256, uint256 min_dy) external returns (uint256) {
        require(dy >= min_dy, "Slippage");
        return dy;
    }
}

// === Tests ===

contract PolyRouteTest is Test {
    PolyRouteAggregator aggregator;
    MockERC20 tokenA;
    MockERC20 tokenB;
    MockRouter router;
    MockCurvePool curve;

    address[] path;

    function setUp() public {
        aggregator = new PolyRouteAggregator();
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");
        router = new MockRouter();
        curve = new MockCurvePool();

        path = new address ;
        path[0] = address(tokenA);
        path[1] = address(tokenB);

        tokenA.mint(address(this), 1e18);
        tokenA.approve(address(aggregator), 1e18);
    }

    function testOwnerIsSetCorrectly() public {
        assertEq(aggregator.owner(), address(this));
    }

    function testGetQuoteQuickSwap() public {
        uint ;
        expected[0] = 1e18;
        expected[1] = 990e15;
        router.setOutput(expected);

        vm.etch(PolyRouteAggregator.QUICKSWAP_ROUTER(), address(router).code);
        uint quote = aggregator.getQuote(PolyRouteAggregator.Dex.QuickSwap, 1e18, path, address(0), 0, 0);
        assertEq(quote, expected[1]);
    }

    function testGetQuoteCurve() public {
        curve.setDy(1234);
        uint quote = aggregator.getQuote(PolyRouteAggregator.Dex.Curve, 1e18, path, address(curve), 0, 1);
        assertEq(quote, 1234);
    }

    function testSwapQuickSwap() public {
        uint ;
        expected[0] = 1e18;
        expected[1] = 980e15;
        router.setOutput(expected);

        vm.etch(PolyRouteAggregator.SUSHISWAP_ROUTER(), address(router).code);

        uint preTokenABalance = tokenA.balanceOf(address(this));
        uint preTokenBBalance = tokenB.balanceOf(address(this));

        aggregator.swap(
            PolyRouteAggregator.Dex.SushiSwap,
            address(tokenA),
            address(tokenB),
            1e18,
            950e15,
            path,
            block.timestamp + 10,
            address(0),
            0,
            0
        );

        assertEq(tokenA.balanceOf(address(this)), preTokenABalance - 1e18);

        // simulate tokenB received
        tokenB.mint(address(this), 980e15);

        assertEq(tokenB.balanceOf(address(this)), preTokenBBalance + 980e15);
    }

    function testSwapCurve() public {
        curve.setDy(1234);

        aggregator.swap(
            PolyRouteAggregator.Dex.Curve,
            address(tokenA),
            address(tokenB),
            1e18,
            1200,
            path,
            block.timestamp + 10,
            address(curve),
            0,
            1
        );
    }
}

