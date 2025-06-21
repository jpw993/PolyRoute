// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PolyRouteAggregator.sol";

contract DeployPolyRoute is Script {
    function run() external {
        vm.startBroadcast();
        new PolyRouteAggregator();
        vm.stopBroadcast();
    }
}

