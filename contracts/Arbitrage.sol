// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Arbitrage
 * @dev Contract for executing arbitrage trades between different AMMs on Base Network
 */
contract Arbitrage is Ownable {
    // Struct to represent an arbitrage opportunity
    struct Opportunity {
        address fromToken;
        address toToken;
        uint256 profit;
        uint256 timestamp;
    }

    // Array to store recent arbitrage opportunities
    Opportunity[] public opportunities;
    
    // Maximum number of opportunities to store
    uint256 public constant MAX_OPPORTUNITIES = 10;
    
    // Settings
    uint256 public gasThreshold = 15; // in gwei
    uint256 public minimumProfitPercentage = 5; // 0.5%
    uint256 public tradingAmount = 1000 * 10**18; // $1000 in wei
    uint256 public tradingInterval = 60; // seconds
    bool public isActive = true;
    
    // Exchanges
    address[] public supportedExchanges;
    
    // Events
    event ArbitrageExecuted(
        address indexed fromToken,
        address indexed toToken,
        uint256 amount,
        uint256 received,
        uint256 profit,
        uint256 timestamp
    );
    
    event OpportunityFound(
        address indexed fromToken,
        address indexed toToken,
        uint256 profit,
        uint256 timestamp
    );
    
    event SettingsUpdated(
        uint256 gasThreshold,
        uint256 minimumProfitPercentage,
        uint256 tradingAmount,
        uint256 tradingInterval,
        bool isActive
    );
    
    constructor() Ownable(msg.sender) {
        // Add some default exchanges
        supportedExchanges.push(address(0x1111111111111111111111111111111111111111)); // Uniswap router
        supportedExchanges.push(address(0x2222222222222222222222222222222222222222)); // SushiSwap router
        supportedExchanges.push(address(0x3333333333333333333333333333333333333333)); // Aerodrome router
    }
    
    /**
     * @dev Execute an arbitrage trade between exchanges
     * @param fromToken The token to sell
     * @param toToken The token to buy
     * @param amount The amount of fromToken to sell
     * @param minReturn The minimum amount of toToken to accept
     * @return The amount of toToken received
     */
    function executeArbitrage(
        address fromToken,
        address toToken,
        uint256 amount,
        uint256 minReturn
    ) external onlyOwner returns (uint256) {
        require(isActive, "Arbitrage trading is paused");
        require(amount > 0, "Amount must be greater than 0");
        
        // In a real implementation, we would:
        // 1. Transfer tokens from the sender to this contract
        // 2. Approve the router to spend our tokens
        // 3. Execute the trade on the most profitable route
        // 4. Transfer the bought tokens back to the sender
        
        // For this example, we just simulate a successful trade
        uint256 received = amount + (amount * 5 / 1000); // 0.5% profit
        require(received >= minReturn, "Return amount too low");
        
        // Record the opportunity
        _recordOpportunity(fromToken, toToken, received - amount);
        
        // Emit event
        emit ArbitrageExecuted(
            fromToken,
            toToken,
            amount,
            received,
            received - amount,
            block.timestamp
        );
        
        return received;
    }
    
    /**
     * @dev Get current arbitrage opportunities
     * @return Array of arbitrage opportunities
     */
    function getProfitOpportunities() external view returns (Opportunity[] memory) {
        return opportunities;
    }
    
    /**
     * @dev Update arbitrage settings
     * @param _gasThreshold New gas threshold
     * @param _minimumProfitPercentage New minimum profit percentage
     * @param _tradingAmount New trading amount
     * @param _tradingInterval New trading interval
     * @param _isActive New active status
     */
    function updateSettings(
        uint256 _gasThreshold,
        uint256 _minimumProfitPercentage,
        uint256 _tradingAmount,
        uint256 _tradingInterval,
        bool _isActive
    ) external onlyOwner {
        gasThreshold = _gasThreshold;
        minimumProfitPercentage = _minimumProfitPercentage;
        tradingAmount = _tradingAmount;
        tradingInterval = _tradingInterval;
        isActive = _isActive;
        
        emit SettingsUpdated(
            gasThreshold,
            minimumProfitPercentage,
            tradingAmount,
            tradingInterval,
            isActive
        );
    }
    
    /**
     * @dev Set active status
     * @param _isActive New active status
     */
    function setActive(bool _isActive) external onlyOwner {
        isActive = _isActive;
    }
    
    /**
     * @dev Add a supported exchange
     * @param exchange Address of the exchange router
     */
    function addExchange(address exchange) external onlyOwner {
        supportedExchanges.push(exchange);
    }
    
    /**
     * @dev Remove a supported exchange
     * @param index Index of the exchange to remove
     */
    function removeExchange(uint256 index) external onlyOwner {
        require(index < supportedExchanges.length, "Invalid index");
        supportedExchanges[index] = supportedExchanges[supportedExchanges.length - 1];
        supportedExchanges.pop();
    }
    
    /**
     * @dev Get all supported exchanges
     * @return Array of exchange addresses
     */
    function getExchanges() external view returns (address[] memory) {
        return supportedExchanges;
    }
    
    /**
     * @dev Record a new arbitrage opportunity
     * @param fromToken From token address
     * @param toToken To token address
     * @param profit Profit amount
     */
    function _recordOpportunity(address fromToken, address toToken, uint256 profit) internal {
        // If we've reached the maximum number of opportunities, remove the oldest one
        if (opportunities.length >= MAX_OPPORTUNITIES) {
            // Move all elements one position to the left
            for (uint i = 0; i < opportunities.length - 1; i++) {
                opportunities[i] = opportunities[i + 1];
            }
            // Remove the last element
            opportunities.pop();
        }
        
        // Add new opportunity
        opportunities.push(Opportunity({
            fromToken: fromToken,
            toToken: toToken,
            profit: profit,
            timestamp: block.timestamp
        }));
        
        emit OpportunityFound(fromToken, toToken, profit, block.timestamp);
    }
    
    /**
     * @dev Withdraw tokens in case they get stuck
     * @param token The token to withdraw
     */
    function rescueTokens(address token) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to rescue");
        
        tokenContract.transfer(owner(), balance);
    }
    
    /**
     * @dev Withdraw ETH in case it gets stuck
     */
    function rescueETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to rescue");
        
        payable(owner()).transfer(balance);
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}