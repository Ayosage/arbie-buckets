package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/arbie-buckets/blockchain"
)

func init() {
	// Load environment variables
	_ = godotenv.Load()

	// Initialize blockchain service with resilient connection
	if err := blockchain.Initialize(); err != nil {
		log.Printf("Warning: Failed to initialize blockchain service: %v", err)
		log.Println("Application will continue and attempt to reconnect automatically")
	}
}

func main() {
	log.Println("Starting Base Network Trading backend...")

	// Set Gin to production mode
	gin.SetMode(gin.ReleaseMode)

	// Create default Gin router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Get blockchain service instance
	blockchainService := blockchain.GetService()

	// Log startup status
	if blockchainService != nil {
		status := blockchainService.GetBlockchainStatus()
		if status["connected"].(bool) {
			log.Println("Blockchain service initialized successfully")
			log.Printf("Connected to %s (Chain ID: %s)", status["network"], status["chainId"])
			if addr, ok := status["walletAddress"]; ok {
				log.Printf("Using wallet address: %s", addr)
			}
		} else {
			log.Println("Warning: Blockchain service not connected, will attempt reconnection automatically")
		}
	} else {
		log.Println("Warning: Blockchain service not available, running in limited mode")
		log.Println("Application will attempt to reconnect automatically")
	}

	// Set up API routes with the blockchain service
	SetupRoutes(r, blockchainService)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	// Close blockchain connection when server stops
	defer blockchain.Close()
}
