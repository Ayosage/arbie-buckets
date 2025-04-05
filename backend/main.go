package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var log *slog.Logger = nil

func init() {
	log = slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetLogLoggerLevel(slog.LevelInfo)
	slog.SetDefault(log)
}

func main() {
	_ = godotenv.Load()
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		// Wallet endpoints
		api.GET("/wallet/balance", getWalletBalance)
		api.GET("/wallet/transactions", getTransactions)

		// Arbitrage endpoints
		api.GET("/arbitrage/opportunities", getArbitrageOpportunities)
		api.GET("/arbitrage/settings", getArbitrageSettings)
		api.PUT("/arbitrage/settings", updateArbitrageSettings)
		api.POST("/arbitrage/execute", executeArbitrageTrade)
		api.GET("/arbitrage/status", getTradingStatus)
		api.PUT("/arbitrage/status", updateTradingStatus)

		// Market data
		api.GET("/markets/exchanges", getExchanges)
		api.GET("/markets/tokens", getTokens)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Info("Server starting on port " + port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Error("Failed to start server " + string(err.Error()))
	}
}

func getWalletBalance(c *gin.Context) {
	// Mock wallet data for now
	balances := []map[string]interface{}{
		{
			"id":       "eth",
			"name":     "Ethereum",
			"symbol":   "ETH",
			"balance":  3.245,
			"usdValue": 7234.56,
			"change":   "+2.3%",
		},
		{
			"id":       "usdc",
			"name":     "USD Coin",
			"symbol":   "USDC",
			"balance":  2500.00,
			"usdValue": 2500.00,
			"change":   "0.0%",
		},
		{
			"id":       "base",
			"name":     "Base",
			"symbol":   "BASE",
			"balance":  145.78,
			"usdValue": 1850.45,
			"change":   "-1.2%",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"balances": balances,
		"total":    11585.01,
	})
}

func getTransactions(c *gin.Context) {
	// Mock transaction data for now
	transactions := []map[string]interface{}{
		{
			"id":        "tx1",
			"type":      "trade",
			"token":     "ETH",
			"amount":    0.5,
			"timestamp": time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
			"status":    "completed",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"transactions": transactions,
	})
}

// Arbitrage handlers
func getArbitrageOpportunities(c *gin.Context) {
	opportunities := []map[string]interface{}{
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

	c.JSON(http.StatusOK, gin.H{
		"opportunities": opportunities,
	})
}

func getArbitrageSettings(c *gin.Context) {
	// Mock settings
	settings := map[string]interface{}{
		"gasThreshold":            15,
		"minimumProfitPercentage": 0.5,
		"tradingAmount":           1000,
		"tradingInterval":         60,
		"exchanges":               []string{"Uniswap", "Sushiswap", "Aerodrome"},
	}

	c.JSON(http.StatusOK, settings)
}

func updateArbitrageSettings(c *gin.Context) {
	var settings map[string]interface{}
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// db function go here

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func executeArbitrageTrade(c *gin.Context) {
	var trade map[string]interface{}
	if err := c.ShouldBindJSON(&trade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// arb execution logic

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"transactionId": "0x1234567890abcdef",
		"timestamp":     time.Now().Format(time.RFC3339),
	})
}

func getTradingStatus(c *gin.Context) {
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

	active, exists := status["active"]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing 'active' field"})
		return
	}

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
	}

	c.JSON(http.StatusOK, gin.H{"exchanges": exchanges})
}

func getTokens(c *gin.Context) {
	tokens := []map[string]interface{}{
		{"id": "eth", "name": "Ethereum", "symbol": "ETH", "decimals": 18},
		{"id": "usdc", "name": "USD Coin", "symbol": "USDC", "decimals": 6},
		{"id": "base", "name": "Base", "symbol": "BASE", "decimals": 18},
	}

	c.JSON(http.StatusOK, gin.H{"tokens": tokens})
}
