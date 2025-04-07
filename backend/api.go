package main

import (
	"log"
	"math/big"
	"net/http"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"

	"github.com/arbie-buckets/blockchain"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine, blockchainService *blockchain.BlockchainService) {
	// Health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		// Check blockchain connection health if service is available
		var blockchainStatus string
		if blockchainService != nil {
			status := blockchainService.GetBlockchainStatus()
			if status["connected"].(bool) {
				blockchainStatus = "healthy"
			} else {
				blockchainStatus = "unhealthy"
			}
		} else {
			blockchainStatus = "unavailable"
		}

		c.JSON(http.StatusOK, gin.H{
			"status":     "ok",
			"timestamp":  time.Now().Format(time.RFC3339),
			"blockchain": blockchainStatus,
		})
	})

	// API group
	api := r.Group("/api")
	{
		// Status endpoint
		api.GET("/status", getBlockchainStatus(blockchainService))

		// Wallet endpoints
		api.GET("/wallet/balance", getWalletBalance(blockchainService))
		api.GET("/wallet/transactions", getTransactions)

		// Arbitrage endpoints
		api.GET("/arbitrage/opportunities", getArbitrageOpportunities(blockchainService))
		api.GET("/arbitrage/settings", getArbitrageSettings)
		api.PUT("/arbitrage/settings", updateArbitrageSettings)
		api.POST("/arbitrage/execute", executeArbitrageTrade(blockchainService))
		api.GET("/arbitrage/status", getTradingStatus)
		api.PUT("/arbitrage/status", updateTradingStatus)

		// Market data
		api.GET("/markets/exchanges", getExchanges)
		api.GET("/markets/tokens", getTokens)
	}
}

// Status handler
func getBlockchainStatus(blockchainService *blockchain.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		if blockchainService != nil {
			// Get status directly from blockchain service
			status := blockchainService.GetBlockchainStatus()
			status["timestamp"] = time.Now().Format(time.RFC3339)
			c.JSON(http.StatusOK, status)
		} else {
			// Return disconnected status if service unavailable
			c.JSON(http.StatusOK, gin.H{
				"connected": false,
				"network":   "Base Mainnet",
				"status":    "Disconnected",
				"timestamp": time.Now().Format(time.RFC3339),
			})
		}
	}
}

// Wallet handlers
func getWalletBalance(blockchainService *blockchain.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if blockchain service is initialized
		if blockchainService == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Blockchain service not available"})
			return
		}

		// Get wallet address
		walletAddress, err := blockchainService.GetWalletAddress()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get wallet address"})
			return
		}

		// Hardcoded token addresses for Base network
		tokenAddresses := map[string]TokenInfo{
			"eth": {
				Address:  "0x4200000000000000000000000000000000000006",
				Symbol:   "ETH",
				Decimals: 18,
			},
			"usdc": {
				Address:  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
				Symbol:   "USDC",
				Decimals: 6,
			},
			"base": {
				Address:  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
				Symbol:   "BASE",
				Decimals: 18,
			},
		}
		print(tokenAddresses) // For debugging purposes, to ensure token addresses are loaded correctly
		// In a real implementation, you would fetch actual balances
		// For now, using mock data to avoid blockchain calls for demonstration
		// Uncomment the below code for actual blockchain integration:
		/*
			balances := []map[string]interface{}{}
			var totalUsdValue float64 = 0

			for id, token := range tokenAddresses {
				tokenAddr := common.HexToAddress(token.Address)
				balance, err := blockchainService.GetTokenBalance(tokenAddr)
				if err != nil {
					log.Printf("Failed to get balance for %s: %v", token.Symbol, err)
					continue
				}

				// Convert to decimal value (simplified)
				decimal := new(big.Float).SetInt(balance)
				divisor := new(big.Float).SetFloat64(float64(10 ** token.Decimals))
				decimal.Quo(decimal, divisor)

				// Get USD value (would require price oracle in real implementation)
				usdValue := 0.0 // Replace with actual price data
				balanceFloat, _ := decimal.Float64()

				balances = append(balances, map[string]interface{}{
					"id":       id,
					"name":     token.Symbol,
					"symbol":   token.Symbol,
					"balance":  decimal.String(),
					"usdValue": usdValue,
					"change":   "+0.0%", // Replace with actual data
				})
				totalUsdValue += usdValue
			}
		*/

		// Mock wallet data for now
		balances := []map[string]interface{}{
			{
				"id":       "eth",
				"name":     "Ethereum",
				"symbol":   "ETH",
				"balance":  "3.245",
				"usdValue": "7234.56",
				"change":   "+2.3%",
			},
			{
				"id":       "usdc",
				"name":     "USD Coin",
				"symbol":   "USDC",
				"balance":  "2500.00",
				"usdValue": "2500.00",
				"change":   "0.0%",
			},
			{
				"id":       "base",
				"name":     "Base",
				"symbol":   "BASE",
				"balance":  "145.78",
				"usdValue": "1850.45",
				"change":   "-1.2%",
			},
		}

		c.JSON(http.StatusOK, gin.H{
			"balances":  balances,
			"total":     11585.01,
			"address":   walletAddress.Hex(),
			"connected": true,
		})
	}
}

func getTransactions(c *gin.Context) {
	// Mock transaction data
	transactions := []map[string]interface{}{
		{
			"id":        "tx1",
			"type":      "trade",
			"token":     "ETH",
			"amount":    0.5,
			"timestamp": time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
			"status":    "completed",
			"txHash":    "0x1a2b3c4d5e6f...",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"transactions": transactions,
	})
}

// Arbitrage handlers
func getArbitrageOpportunities(blockchainService *blockchain.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if blockchain service is initialized
		if blockchainService == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Blockchain service not available"})
			return
		}

		// Fetch opportunities from blockchain
		opportunities, err := blockchainService.GetArbitrageOpportunities()
		if err != nil {
			log.Printf("Failed to get arbitrage opportunities: %v", err)
			// Fallback to mock data if blockchain call fails
			mockOpportunities := []map[string]interface{}{
				{
					"id":               "opp1",
					"token":            "ETH",
					"sourceExchange":   "Uniswap",
					"targetExchange":   "Sushiswap",
					"buyPrice":         2230.45,
					"sellPrice":        2245.78,
					"potentialProfit":  15.33,
					"profitPercentage": 0.68,
					"timestamp":        time.Now().Format(time.RFC3339),
				},
				{
					"id":               "opp2",
					"token":            "USDC",
					"sourceExchange":   "Aerodrome",
					"targetExchange":   "Uniswap",
					"buyPrice":         0.995,
					"sellPrice":        1.005,
					"potentialProfit":  10.00,
					"profitPercentage": 1.01,
					"timestamp":        time.Now().Format(time.RFC3339),
				},
			}
			c.JSON(http.StatusOK, gin.H{"opportunities": mockOpportunities})
			return
		}

		// Format opportunities for API response
		formattedOpportunities := make([]map[string]interface{}, len(opportunities))
		for i, opp := range opportunities {
			formattedOpportunities[i] = map[string]interface{}{
				"id":               "opp" + string(rune(i)),
				"fromToken":        opp.FromToken,
				"toToken":          opp.ToToken,
				"potentialProfit":  opp.ProfitUSD,
				"profitPercentage": opp.Percentage,
				"timestamp":        time.Unix(opp.Timestamp, 0).Format(time.RFC3339),
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"opportunities": formattedOpportunities,
		})
	}
}

func getArbitrageSettings(c *gin.Context) {
	// Mock settings
	settings := map[string]interface{}{
		"gasThreshold":            15,
		"minimumProfitPercentage": 0.5,
		"tradingAmount":           1000,
		"tradingInterval":         60,
		"exchanges":               []string{"Uniswap", "Sushiswap", "Aerodrome", "Alienbase"},
	}

	c.JSON(http.StatusOK, settings)
}

func updateArbitrageSettings(c *gin.Context) {
	var settings map[string]interface{}
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Here you would save the settings to your database
	// For now just return success
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func executeArbitrageTrade(blockchainService *blockchain.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if blockchain service is initialized
		if blockchainService == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Blockchain service not available"})
			return
		}

		var trade map[string]interface{}
		if err := c.ShouldBindJSON(&trade); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Extract parameters
		fromTokenStr, ok := trade["fromToken"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid fromToken"})
			return
		}

		toTokenStr, ok := trade["toToken"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid toToken"})
			return
		}

		amountFloat, ok := trade["amount"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
			return
		}

		minReturnFloat, ok := trade["minReturn"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid minReturn"})
			return
		}

		// Convert addresses to Ethereum addresses
		fromToken := common.HexToAddress(fromTokenStr)
		toToken := common.HexToAddress(toTokenStr)

		// Convert amounts to big integers (for simplicity, assuming 18 decimals)
		amount := new(big.Int).Mul(
			big.NewInt(int64(amountFloat)),
			new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil),
		)
		minReturn := new(big.Int).Mul(
			big.NewInt(int64(minReturnFloat)),
			new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil),
		)

		// Execute the arbitrage trade
		txHash, err := blockchainService.ExecuteArbitrage(fromToken, toToken, amount, minReturn)
		if err != nil {
			log.Printf("Failed to execute arbitrage trade: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to execute trade"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success":       true,
			"transactionId": txHash,
			"timestamp":     time.Now().Format(time.RFC3339),
		})
	}
}

func getTradingStatus(c *gin.Context) {
	// Mock active status
	c.JSON(http.StatusOK, gin.H{
		"active": true,
		"since":  time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
	})
}

func updateTradingStatus(c *gin.Context) {
	var status map[string]interface{}
	if err := c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Here you would update the trading status
	active, exists := status["active"]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing 'active' field"})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{
		"active": active,
		"since":  time.Now().Format(time.RFC3339),
	})
}

// Market data handlers
func getExchanges(c *gin.Context) {
	exchanges := []map[string]interface{}{
		{"id": "uniswap", "name": "Uniswap"},
		{"id": "sushiswap", "name": "Sushiswap"},
		{"id": "aerodrome", "name": "Aerodrome"},
		{"id": "alienbase", "name": "Alienbase"},
	}

	c.JSON(http.StatusOK, gin.H{"exchanges": exchanges})
}

func getTokens(c *gin.Context) {
	tokens := []map[string]interface{}{
		{"id": "eth", "name": "Ethereum", "symbol": "ETH", "decimals": 18, "address": "0x4200000000000000000000000000000000000006"},
		{"id": "usdc", "name": "USD Coin", "symbol": "USDC", "decimals": 6, "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"},
		{"id": "base", "name": "Base", "symbol": "BASE", "decimals": 18, "address": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"},
	}

	c.JSON(http.StatusOK, gin.H{"tokens": tokens})
}
