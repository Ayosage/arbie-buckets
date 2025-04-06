package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	// Load environment variables
	_ = godotenv.Load()

	// Initialize blockchain connection
	if err := Initialize(); err != nil {
		log.Printf("Warning: Failed to initialize blockchain connection: %v", err)
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

	// Initialize blockchain service
	var blockchainService *BlockchainService
	contractAddress := os.Getenv("ARBITRAGE_CONTRACT_ADDRESS")
	if contractAddress != "" {
		var err error
		blockchainService, err = NewBlockchainService(contractAddress)
		if err != nil {
			log.Printf("Warning: Failed to initialize blockchain service: %v", err)
		} else {
			log.Println("Blockchain service initialized successfully")
			log.Printf("Connected to Base Network with contract at %s", contractAddress)
		}
	} else {
		log.Println("Warning: ARBITRAGE_CONTRACT_ADDRESS not set, running in limited mode")
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
	defer Close()
}
